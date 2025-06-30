/**
 * Validation Utilities
 * Helper functions for validating file names, paths, and other inputs
 */

import path from "path";
import { ERRORS, FILE_CONFIG, SERVER_CONFIG } from "../constants/index.js";

/**
 * Validate file name format and characters
 */
export const validateFileName = (
    name: string
): { isValid: boolean; error?: string } => {
    if (!name) {
        return { isValid: false, error: ERRORS.FILE_NAME_REQUIRED };
    }

    if (name.length > FILE_CONFIG.MAX_FILENAME_LENGTH) {
        return {
            isValid: false,
            error: ERRORS.FILE_NAME_TOO_LONG.replace(
                "{max}",
                FILE_CONFIG.MAX_FILENAME_LENGTH.toString()
            ),
        };
    }

    if (FILE_CONFIG.INVALID_FILENAME_CHARS.test(name)) {
        return { isValid: false, error: ERRORS.INVALID_FILE_NAME_CHARS };
    }

    return { isValid: true };
};

/**
 * Validate path and check for directory traversal attacks
 */
export const validatePath = (
    pathStr: string
): { isValid: boolean; error?: string } => {
    if (pathStr === null || pathStr === undefined) {
        return { isValid: true }; // Empty/null path is valid (root)
    }

    if (typeof pathStr !== "string") {
        return { isValid: false, error: "Path must be a string" };
    }

    // Check for directory traversal attempts
    if (pathStr.includes("..") || pathStr.includes("~")) {
        return {
            isValid: false,
            error: "Invalid path: directory traversal not allowed",
        };
    }

    // Check for absolute paths
    if (path.isAbsolute(pathStr)) {
        return {
            isValid: false,
            error: "Invalid path: absolute paths not allowed",
        };
    }

    return { isValid: true };
};

/**
 * Validate folder depth to prevent infinite nesting
 */
export const validateFolderDepth = (
    pathStr: string,
    isCreatingFolder: boolean = false
): { isValid: boolean; error?: string; depth: number } => {
    const currentDepth = pathStr
        ? pathStr.split("/").filter(segment => segment.length > 0).length
        : 0;
    const finalDepth = isCreatingFolder ? currentDepth + 1 : currentDepth;

    if (finalDepth > SERVER_CONFIG.MAX_FOLDER_DEPTH) {
        return {
            isValid: false,
            error: ERRORS.MAX_DEPTH_EXCEEDED.replace(
                "{limit}",
                SERVER_CONFIG.MAX_FOLDER_DEPTH.toString()
            ).replace("{depth}", finalDepth.toString()),
            depth: finalDepth,
        };
    }

    return { isValid: true, depth: finalDepth };
};
