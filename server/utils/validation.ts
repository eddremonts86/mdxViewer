/**
 * Validation Utilities
 * Helper functions for validating file names, paths, and other inputs
 */

import { promises as fs } from "fs";
import path from "path";

import { ERRORS, FILE_CONFIG, SERVER_CONFIG } from "../constants/index.js";

/** Absolute, normalised roots. Everything this server touches lives under one. */
const CONTENT_ROOT = path.resolve(SERVER_CONFIG.CONTENT_PATH);
const PREVIEWS_ROOT = path.resolve(path.dirname(SERVER_CONFIG.CONTENT_PATH), "previews");
// Deleted documents wait here. A sibling of the content root, not a folder inside
// it, so the tree, the chart and the survey never count something already thrown
// away — and so a document cannot be "deleted" into a place it still shows up.
const TRASH_ROOT = path.resolve(path.dirname(SERVER_CONFIG.CONTENT_PATH), "trash");

/**
 * The root as the filesystem finally reports it. The two differ whenever the
 * content folder sits under a symlink — /var is a link to /private/var on
 * macOS, and every temp directory lives there — so comparing a realpath'd
 * target against the un-linked root rejects the root's own children.
 */
let realContentRoot: string | null = null;
const contentRoots = async (): Promise<string[]> => {
    if (realContentRoot === null) {
        try {
            realContentRoot = await fs.realpath(CONTENT_ROOT);
        } catch {
            realContentRoot = CONTENT_ROOT;
        }
    }
    return realContentRoot === CONTENT_ROOT ? [CONTENT_ROOT] : [CONTENT_ROOT, realContentRoot];
};

const isInside = (target: string, root: string) => target === root || target.startsWith(root + path.sep);

/**
 * Validate file name format and characters
 */
export const validateFileName = (name: string): { isValid: boolean; error?: string } => {
    if (!name) {
        return { isValid: false, error: ERRORS.FILE_NAME_REQUIRED };
    }

    if (name.length > FILE_CONFIG.MAX_FILENAME_LENGTH) {
        return {
            isValid: false,
            error: ERRORS.FILE_NAME_TOO_LONG.replace("{max}", FILE_CONFIG.MAX_FILENAME_LENGTH.toString()),
        };
    }

    if (FILE_CONFIG.INVALID_FILENAME_CHARS.test(name)) {
        return { isValid: false, error: ERRORS.INVALID_FILE_NAME_CHARS };
    }

    // A name is one path segment. Anything that could climb or reach sideways
    // is not a name, whatever else it looks like.
    if (name.includes("/") || name.includes("\\") || name === "." || name === "..") {
        return { isValid: false, error: ERRORS.INVALID_FILE_NAME_CHARS };
    }

    return { isValid: true };
};

/**
 * Resolve a client-supplied path inside the content root, or refuse it.
 *
 * This is the only way this server turns a request into a filesystem path.
 * It resolves first and compares afterwards, rather than looking for `..` in
 * the string: a blacklist misses percent-encoding, backslashes on Windows and
 * odd Unicode, and it wrongly rejects a legitimate name that merely contains
 * two dots. Containment after `path.resolve` has neither problem.
 *
 * Returns the absolute path, or null when the result would sit outside the
 * content root.
 */
const resolveInside = (root: string, segments: (string | undefined | null)[]): string | null => {
    const parts = segments.map(segment => segment ?? "");

    if (parts.some(segment => typeof segment !== "string" || segment.includes("\0"))) {
        return null;
    }
    // An absolute segment would make path.resolve discard everything before it.
    if (parts.some(segment => path.isAbsolute(segment))) {
        return null;
    }

    const target = path.resolve(root, ...parts);

    return isInside(target, root) ? target : null;
};

export const resolveInsideContent = (...segments: (string | undefined | null)[]): string | null =>
    resolveInside(CONTENT_ROOT, segments);

/** The same guard for the generated previews, which are also addressed by URL. */
export const resolveInsidePreviews = (...segments: (string | undefined | null)[]): string | null =>
    resolveInside(PREVIEWS_ROOT, segments);

/** The same guard for the trash, whose entry ids arrive from the client. */
export const resolveInsideTrash = (...segments: (string | undefined | null)[]): string | null =>
    resolveInside(TRASH_ROOT, segments);

export const trashRoot = (): string => TRASH_ROOT;

/**
 * The same check, after following symlinks. Use it for anything that reads,
 * moves or deletes something that already exists: resolution alone cannot see
 * that a link inside the content folder points outside it.
 */
export const realPathInsideContent = async (target: string): Promise<string | null> => {
    let real: string;
    try {
        real = await fs.realpath(target);
    } catch {
        // Nothing there to follow; the caller handles the missing file.
        return target;
    }

    const roots = await contentRoots();
    return roots.some(root => isInside(real, root)) ? real : null;
};

/**
 * Validate folder depth to prevent infinite nesting
 */
export const validateFolderDepth = (
    pathStr: string,
    isCreatingFolder = false
): { isValid: boolean; error?: string; depth: number } => {
    const currentDepth = pathStr ? pathStr.split("/").filter(segment => segment.length > 0).length : 0;
    const finalDepth = isCreatingFolder ? currentDepth + 1 : currentDepth;

    if (finalDepth > SERVER_CONFIG.MAX_FOLDER_DEPTH) {
        return {
            isValid: false,
            error: ERRORS.MAX_DEPTH_EXCEEDED.replace("{limit}", SERVER_CONFIG.MAX_FOLDER_DEPTH.toString()).replace(
                "{depth}",
                finalDepth.toString()
            ),
            depth: finalDepth,
        };
    }

    return { isValid: true, depth: finalDepth };
};

/** The C0 control block ends at 0x1f; DEL sits alone at 0x7f. */
const LAST_C0_CONTROL = 0x1f;
const DELETE_CHARACTER = 0x7f;

/**
 * Upload filenames arrive from the client and become real names on disk.
 * Reduce to a single path segment, drop control characters, and require an
 * extension this product actually serves.
 */
export const sanitizeUploadName = (original: string): string | null => {
    const base = [...path.basename(original ?? "")]
        .filter(character => {
            const code = character.codePointAt(0) ?? 0;
            return code > LAST_C0_CONTROL && code !== DELETE_CHARACTER;
        })
        .join("");

    if (!base || base === "." || base === "..") return null;

    const allowed: readonly string[] = FILE_CONFIG.ALLOWED_EXTENSIONS;
    if (!allowed.includes(path.extname(base).toLowerCase())) return null;

    return validateFileName(base).isValid ? base : null;
};
