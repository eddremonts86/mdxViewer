/**
 * Import Endpoint
 * Brings a whole folder of documents in, structure intact
 *
 * This is not the upload endpoint with paths bolted on, and deliberately so.
 * Upload's safety story is "one destination folder, one safe filename" — its
 * sanitiser reduces a name to a single segment on purpose. Teaching it to accept
 * `guides/api/intro.md` would weaken that guarantee for the plain case too. An
 * import walks a tree, so it validates every segment of every path itself.
 *
 * It takes JSON rather than multipart because `.md` and `.mdx` are text: the
 * relative path becomes an ordinary field instead of something inferred from the
 * order of a form, and multer's disk storage — which decides a destination before
 * the body is parsed — stays out of it entirely.
 */
import type { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";

import { ERRORS, FILE_CONFIG, HTTP_STATUS, SERVER_CONFIG } from "../constants/index.js";
import type { ApiResponse } from "../types/index.js";
import { logOperation, logServerError } from "../utils/logger.js";
import {
    resolveInsideContent,
    sanitizeFolderName,
    sanitizeUploadName,
    validateFolderDepth,
} from "../utils/validation.js";

interface IncomingDocument {
    /** Path relative to the folder that was picked, e.g. `docs/guides/intro.md`. */
    path: string;
    content: string;
}

interface Imported {
    path: string;
    size: number;
}

interface Skipped {
    path: string;
    reason: string;
}

/**
 * A client-supplied relative path, rebuilt from segments this server vetted, or
 * the reason it cannot be.
 *
 * Every segment goes through the same sanitiser the upload filename uses, so a
 * `..`, a separator smuggled inside a name, or a control character never reaches
 * the filesystem. The result is then resolved inside the content root anyway —
 * belt and braces, because this is the one endpoint that writes a tree.
 */
const vetDocumentPath = (targetPath: string, relative: unknown): { segments: string[] } | { reason: string } => {
    if (typeof relative !== "string" || !relative.trim()) {
        return { reason: "No path given" };
    }

    // An absolute path is never what a folder import sends — the browser gives
    // paths relative to the folder that was picked. Stripping the leading slash
    // would turn `/etc/passwd.md` into a document called `etc/passwd.md`, which
    // is contained but is not what the sender asked for, so it is refused
    // instead of reinterpreted.
    if (relative.startsWith("/") || relative.startsWith("\\")) {
        return { reason: "Path must be relative to the folder being imported" };
    }

    const parts = relative.split("/").filter(part => part.length > 0 && part !== ".");
    if (parts.length === 0) {
        return { reason: "No path given" };
    }

    const folders = parts.slice(0, -1);
    const name = parts[parts.length - 1];

    const safeFolders: string[] = [];
    for (const folder of folders) {
        const safe = sanitizeFolderName(folder);
        if (!safe) return { reason: `Folder name not allowed: ${folder}` };
        safeFolders.push(safe);
    }

    const safeName = sanitizeUploadName(name);
    if (!safeName) {
        const extension = path.extname(name).toLowerCase();
        return {
            reason: FILE_CONFIG.ALLOWED_EXTENSIONS.includes(extension as ".md")
                ? `File name not allowed: ${name}`
                : `Not a document: ${extension || "no extension"}`,
        };
    }

    const depth = validateFolderDepth([targetPath, ...safeFolders].filter(Boolean).join("/"));
    if (!depth.isValid) return { reason: depth.error ?? ERRORS.MAX_DEPTH_EXCEEDED };

    return { segments: [...safeFolders, safeName] };
};

/**
 * One document, written or refused.
 *
 * Lifted out of the handler because it is five independent refusals and a write;
 * inline, the loop and the request handling read as one twenty-branch function.
 */
const importOne = async (targetPath: string, document: IncomingDocument): Promise<Imported | Skipped> => {
    const vetted = vetDocumentPath(targetPath, document?.path);
    if ("reason" in vetted) {
        return { path: String(document?.path ?? ""), reason: vetted.reason };
    }

    if (typeof document.content !== "string") {
        return { path: document.path, reason: "Content must be a string" };
    }

    const destination = resolveInsideContent(targetPath, ...vetted.segments);
    if (!destination) {
        logServerError("Refused an import path outside the content folder", new Error(document.path));
        return { path: document.path, reason: ERRORS.OUTSIDE_CONTENT };
    }

    const relativePath = [targetPath, ...vetted.segments].filter(Boolean).join("/");

    // An import is not a save: whatever holds this name is someone's work and did
    // not ask to be replaced.
    try {
        await fs.access(destination);
        return { path: relativePath, reason: "Already exists" };
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }

    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, document.content, "utf8");

    return { path: relativePath, size: Buffer.byteLength(document.content) };
};

/**
 * Import a folder of documents
 * POST /api/import
 *
 * `{ path?: string, documents: [{ path, content }] }`
 *
 * A document whose destination is already taken is skipped and reported, never
 * overwritten: an import is not a save, and the folder it lands in may be
 * someone's real work.
 */
export const importDocuments = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const targetPath = typeof req.body?.path === "string" ? req.body.path : "";
        const documents = req.body?.documents;

        if (!Array.isArray(documents) || documents.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: "documents array is required",
            });
        }

        // The same per-request bound the upload endpoint has. A folder with more
        // documents than this is imported in batches by the client, which keeps
        // the bound meaningful instead of raising it to whatever the largest
        // folder anyone has tried happens to be.
        if (documents.length > SERVER_CONFIG.MAX_UPLOAD_FILES) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: `Too many documents in one request (max ${SERVER_CONFIG.MAX_UPLOAD_FILES})`,
            });
        }

        const targetRoot = resolveInsideContent(targetPath);
        if (!targetRoot) {
            logServerError("Refused an import outside the content folder", new Error(targetPath));
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                error: ERRORS.OUTSIDE_CONTENT,
            });
        }

        logOperation("Importing documents", { count: documents.length, targetPath });

        const imported: Imported[] = [];
        const skipped: Skipped[] = [];

        for (const document of documents as IncomingDocument[]) {
            const outcome = await importOne(targetPath, document);
            if ("reason" in outcome) skipped.push(outcome);
            else imported.push(outcome);
        }

        logOperation(`Imported ${imported.length}, skipped ${skipped.length}`);

        res.json({
            success: true,
            data: { imported, skipped },
            message: `Imported ${imported.length} of ${documents.length} documents`,
        });
    } catch (error) {
        logServerError("Failed to import:", error instanceof Error ? error : new Error(String(error)));
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to import",
        });
    }
};
