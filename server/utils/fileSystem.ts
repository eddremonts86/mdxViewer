/**
 * File System Utilities
 * Helper functions for file system operations
 */

import { promises as fs } from "fs";
import path from "path";

import type { FileItem } from "../types/index.js";

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string =>
    path.extname(filename).slice(1);

/**
 * Ensure directory exists, create if it doesn't
 */
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
            throw error;
        }
    }
};

/**
 * Delete a file or directory recursively
 */
export const deleteRecursively = async (targetPath: string): Promise<void> => {
    try {
        const stats = await fs.stat(targetPath);

        if (stats.isDirectory()) {
            const entries = await fs.readdir(targetPath);

            // Delete all contents first
            for (const entry of entries) {
                const entryPath = path.join(targetPath, entry);
                await deleteRecursively(entryPath);
            }

            // Then delete the directory itself
            await fs.rmdir(targetPath);
        } else {
            // Delete file
            await fs.unlink(targetPath);
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            throw error;
        }
    }
};

/**
 * Move a file or directory recursively
 */
export const moveRecursively = async (
    sourcePath: string,
    destinationPath: string,
): Promise<void> => {
    try {
        // Try to use rename first (works if on same filesystem)
        await fs.rename(sourcePath, destinationPath);
    } catch (renameError) {
        // If rename fails, copy and delete
        console.warn(
            `Rename failed, falling back to copy+delete: ${(renameError as Error).message}`,
        );

        try {
            const stats = await fs.stat(sourcePath);

            if (stats.isDirectory()) {
                // Create destination directory
                await fs.mkdir(destinationPath, { recursive: true });

                // Copy all contents
                const entries = await fs.readdir(sourcePath);
                for (const entry of entries) {
                    const srcPath = path.join(sourcePath, entry);
                    const destPath = path.join(destinationPath, entry);
                    await moveRecursively(srcPath, destPath);
                }

                // Delete source directory
                await fs.rmdir(sourcePath);
            } else {
                // Copy file and delete original
                await fs.copyFile(sourcePath, destinationPath);
                await fs.unlink(sourcePath);
            }
        } catch (copyError) {
            console.error(
                `Failed to move ${sourcePath} to ${destinationPath}:`,
                copyError,
            );
            throw copyError;
        }
    }
};

/**
 * Get file statistics
 */
export const getFileStats = async (
    filePath: string,
): Promise<Partial<FileItem>> => {
    try {
        const stats = await fs.stat(filePath);
        return {
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
        };
    } catch {
        return {};
    }
};
