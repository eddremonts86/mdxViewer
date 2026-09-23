import { FileAPI, type ImportDocument, type ImportResult } from "@/api/fileAPI";

/**
 * Reading a folder the browser handed over, and sending it in batches.
 *
 * A directory picker (`<input webkitdirectory>`) gives every file inside the
 * chosen folder at every depth — a real documentation folder also contains
 * images, `.DS_Store`, sometimes a `node_modules`. Partitioning happens here so
 * the surface can say what it found and what it is leaving behind *before*
 * anything is written.
 */

/** Extensions the service will accept. Anything else is reported, not sent. */
const IMPORTABLE = [".md", ".mdx"];

/** Matches the service's per-request bound, so no batch is ever refused for size. */
const BATCH = 25;

/** Folders that are never documentation, however they were picked. */
const NEVER = ["node_modules", ".git", ".next", "dist", "build", ".cache"];

export interface FolderReading {
    /** The folder's own name, which becomes the top level of what is imported. */
    root: string;
    /** Documents that will be sent, in the order the picker gave them. */
    documents: File[];
    /** Everything else, with the reason, so the surface can be honest about it. */
    ignored: Array<{ path: string; reason: string }>;
}

const relativePathOf = (file: File): string =>
    // webkitRelativePath is what carries the folder structure; a browser that
    // does not set it leaves the bare name, which still imports as one document.
    (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;

const extensionOf = (name: string): string => {
    const dot = name.lastIndexOf(".");
    return dot <= 0 ? "" : name.slice(dot).toLowerCase();
};

/** Split what the picker gave us into what goes and what does not. */
export function readImportableFolder(files: File[]): FolderReading {
    const documents: File[] = [];
    const ignored: FolderReading["ignored"] = [];

    for (const file of files) {
        const relative = relativePathOf(file);
        const segments = relative.split("/");
        const buried = segments.slice(0, -1).find(segment => NEVER.includes(segment));

        if (buried) {
            ignored.push({ path: relative, reason: `Inside ${buried}` });
            continue;
        }

        const extension = extensionOf(file.name);
        if (!IMPORTABLE.includes(extension)) {
            ignored.push({ path: relative, reason: `Not a document: ${extension || "no extension"}` });
            continue;
        }

        documents.push(file);
    }

    const [root] = (relativePathOf(files[0] ?? new File([], "")) || "").split("/");

    return { root: files.length > 1 ? root : "", documents, ignored };
}

/**
 * Send the documents, a batch at a time, reporting progress as each lands.
 *
 * Batches are sequential on purpose: this writes to someone's folder, and a
 * failure halfway through a sequence leaves a knowable amount done, which
 * parallel requests would not.
 */
export async function importFolder(
    documents: File[],
    targetPath: string,
    onProgress: (done: number, total: number) => void
): Promise<ImportResult> {
    const imported: ImportResult["imported"] = [];
    const skipped: ImportResult["skipped"] = [];

    for (let start = 0; start < documents.length; start += BATCH) {
        const batch = documents.slice(start, start + BATCH);

        const payload: ImportDocument[] = await Promise.all(
            batch.map(async file => ({ path: relativePathOf(file), content: await file.text() }))
        );

        const result = await FileAPI.importDocuments(payload, targetPath);
        imported.push(...result.imported);
        skipped.push(...result.skipped);

        onProgress(Math.min(start + BATCH, documents.length), documents.length);
    }

    return { imported, skipped };
}
