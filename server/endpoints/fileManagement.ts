/**
 * File Management Endpoints
 * Handles file creation, uploading, deletion, and moving
 */
import type { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";

import { ERRORS, HTTP_STATUS } from "../constants/index.js";
import type { ApiResponse } from "../types/index.js";
import { logOperation, logServerError } from "../utils/logger.js";
import {
    realPathInsideContent,
    resolveInsideContent,
    validateFileName,
    validateFolderDepth,
} from "../utils/validation.js";

/**
 * Create a new file
 * POST /api/files/create
 */
export const createFile = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const { name, type, path: relativePath, content } = req.body;

        logOperation("📝 Creating file:", { name, type, relativePath });

        if (!name || !type || typeof relativePath !== "string") {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: "Missing required fields: name, type, path",
            });
        }

        const validation = validateFileName(name);
        if (!validation.isValid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: validation.error,
            });
        }

        const depthValidation = validateFolderDepth(relativePath);
        if (!depthValidation.isValid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: depthValidation.error,
            });
        }

        const fileName = `${name}.${type}`;
        const fullPath = resolveInsideContent(relativePath, fileName);
        if (!fullPath) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                error: ERRORS.OUTSIDE_CONTENT,
            });
        }
        const fileRelativePath = path.join(relativePath, fileName).replace(/\\/g, "/");

        // Check if file already exists
        try {
            await fs.access(fullPath);
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                error: `File already exists: ${fileName}`,
            });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                throw error;
            }
        }

        // Create directory if needed
        const dirPath = path.dirname(fullPath);
        await fs.mkdir(dirPath, { recursive: true });

        // Default content
        const fileContent = content ?? `# ${name}\n\nThis is a new ${type} document.\n`;

        // Write file
        await fs.writeFile(fullPath, fileContent, "utf8");

        logOperation(`✅ File created: ${fileRelativePath}`);

        res.json({
            success: true,
            data: {
                path: fileRelativePath,
                name: fileName,
            },
            message: `File ${fileName} created successfully`,
        });
    } catch (error) {
        logServerError("❌ Failed to create file:", error instanceof Error ? error : new Error(String(error)));
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to create file",
        });
    }
};

/**
 * Create a new folder
 * POST /api/folders/create
 */
export const createFolder = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const { name, path: relativePath } = req.body;

        logOperation("📁 Creating folder:", { name, relativePath });

        if (!name || typeof relativePath !== "string") {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: "Missing required fields: name, path",
            });
        }

        const validation = validateFileName(name);
        if (!validation.isValid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: validation.error,
            });
        }

        const depthValidation = validateFolderDepth(relativePath, true);
        if (!depthValidation.isValid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: depthValidation.error,
            });
        }

        const fullPath = resolveInsideContent(relativePath, name);
        if (!fullPath) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                error: ERRORS.OUTSIDE_CONTENT,
            });
        }
        const folderRelativePath = path.join(relativePath, name).replace(/\\/g, "/");

        // Check if folder already exists
        try {
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
                return res.status(HTTP_STATUS.CONFLICT).json({
                    success: false,
                    error: `Folder already exists: ${name}`,
                });
            }
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                throw error;
            }
        }

        // Create the folder
        await fs.mkdir(fullPath, { recursive: true });

        logOperation(`✅ Folder created: ${folderRelativePath}`);

        res.json({
            success: true,
            data: {
                path: folderRelativePath,
                name,
            },
            message: `Folder ${name} created successfully`,
        });
    } catch (error) {
        logServerError("❌ Failed to create folder:", error instanceof Error ? error : new Error(String(error)));
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to create folder",
        });
    }
};

/**
 * Upload multiple files
 * POST /api/files/upload
 */
export const uploadFiles = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const files = req.files as Express.Multer.File[];
        const targetPath = req.body.path ?? "";
        const createFolders = req.body.createFolders === "true";

        logOperation("📤 Uploading files:", {
            count: files?.length || 0,
            targetPath,
            createFolders,
        });

        if (!files || files.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: "No files provided",
            });
        }

        const results: Array<{
            originalName: string;
            filename: string;
            path: string;
            size: number;
        }> = [];

        const errors: Array<{
            filename: string;
            error: string;
        }> = [];

        const fullTargetPath = resolveInsideContent(targetPath);
        if (!fullTargetPath) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                error: ERRORS.OUTSIDE_CONTENT,
            });
        }
        if (createFolders) {
            await fs.mkdir(fullTargetPath, { recursive: true });
        }

        for (const file of files) {
            try {
                const filePath = path.join(targetPath, file.filename).replace(/\\/g, "/");
                results.push({
                    originalName: file.originalname,
                    filename: file.filename,
                    path: filePath,
                    size: file.size,
                });

                logOperation(`✅ File uploaded: ${filePath}`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                errors.push({
                    filename: file.originalname,
                    error: errorMessage,
                });
                logServerError(
                    `❌ Failed to process file ${file.originalname}:`,
                    error instanceof Error ? error : new Error(String(error))
                );
            }
        }

        res.json({
            success: errors.length === 0,
            data: {
                uploaded: results,
                errors,
                totalFiles: files.length,
                successCount: results.length,
                errorCount: errors.length,
            },
            message: `Uploaded ${results.length}/${files.length} files successfully`,
        });
    } catch (error) {
        logServerError("❌ Failed to upload files:", error instanceof Error ? error : new Error(String(error)));
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to upload files",
        });
    }
};

/**
 * Delete files/folders
 * DELETE /api/files
 */
export const deleteFiles = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const { paths } = req.body;

        logOperation("🗑️ Deleting items:", { paths });

        if (!Array.isArray(paths) || paths.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: "Paths array is required",
            });
        }

        const results: Array<{
            path: string;
            type: string;
        }> = [];

        const errors: Array<{
            path: string;
            error: string;
        }> = [];

        for (const itemPath of paths) {
            try {
                const resolved = resolveInsideContent(itemPath);
                const fullPath = resolved ? await realPathInsideContent(resolved) : null;
                if (!fullPath) {
                    errors.push({ path: itemPath, error: ERRORS.OUTSIDE_CONTENT });
                    logServerError("Refused a delete outside the content folder", new Error(itemPath));
                    continue;
                }
                const stats = await fs.stat(fullPath);

                if (stats.isDirectory()) {
                    await fs.rm(fullPath, { recursive: true, force: true });
                    logOperation(`✅ Folder deleted: ${itemPath}`);
                } else {
                    await fs.unlink(fullPath);
                    logOperation(`✅ File deleted: ${itemPath}`);
                }

                results.push({
                    path: itemPath,
                    type: stats.isDirectory() ? "folder" : "file",
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                errors.push({
                    path: itemPath,
                    error: errorMessage,
                });
                logServerError(
                    `❌ Failed to delete ${itemPath}:`,
                    error instanceof Error ? error : new Error(String(error))
                );
            }
        }

        res.json({
            success: errors.length === 0,
            data: {
                deleted: results,
                errors,
                totalItems: paths.length,
                successCount: results.length,
                errorCount: errors.length,
            },
            message: `Deleted ${results.length}/${paths.length} items successfully`,
        });
    } catch (error) {
        logServerError("❌ Failed to delete items:", error instanceof Error ? error : new Error(String(error)));
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete items",
        });
    }
};

interface MoveTargets {
    sourceFullPath: string;
    targetFullPath: string;
    targetDir: string;
    targetRelativePath: string;
}

/** Everything a move must be true about before it happens, or the reason it is not. */
async function vetMove(
    sourcePath: string,
    targetPath: string
): Promise<{ ok: true; targets: MoveTargets } | { ok: false; status: number; error: string }> {
    const sourceFileName = path.basename(sourcePath);
    const sourceResolved = resolveInsideContent(sourcePath);
    const targetFullPath = resolveInsideContent(targetPath, sourceFileName);
    const targetDir = resolveInsideContent(targetPath);
    const sourceFullPath = sourceResolved ? await realPathInsideContent(sourceResolved) : null;

    if (!sourceFullPath || !targetFullPath || !targetDir) {
        return { ok: false, status: HTTP_STATUS.FORBIDDEN, error: ERRORS.OUTSIDE_CONTENT };
    }

    // A folder cannot be moved inside itself.
    if (targetPath === sourcePath || targetPath.startsWith(`${sourcePath}/`)) {
        return { ok: false, status: HTTP_STATUS.BAD_REQUEST, error: ERRORS.CANNOT_MOVE_INTO_SELF };
    }

    const targetRelativePath = path.join(targetPath, sourceFileName).replace(/\\/g, "/");
    const depth = validateFolderDepth(targetRelativePath);
    if (!depth.isValid) {
        return { ok: false, status: HTTP_STATUS.BAD_REQUEST, error: depth.error ?? "Too deep" };
    }

    try {
        await fs.access(sourceFullPath);
    } catch {
        return { ok: false, status: HTTP_STATUS.NOT_FOUND, error: `Source file/folder not found: ${sourcePath}` };
    }

    try {
        const targetStats = await fs.stat(targetDir);
        if (!targetStats.isDirectory()) {
            return { ok: false, status: HTTP_STATUS.BAD_REQUEST, error: `Target is not a directory: ${targetPath}` };
        }
    } catch {
        return { ok: false, status: HTTP_STATUS.NOT_FOUND, error: `Target directory not found: ${targetPath}` };
    }

    try {
        await fs.access(targetFullPath);
        return {
            ok: false,
            status: HTTP_STATUS.CONFLICT,
            error: `Item already exists at target location: ${sourceFileName}`,
        };
    } catch {
        // Nothing there: that is what we want.
    }

    return { ok: true, targets: { sourceFullPath, targetFullPath, targetDir, targetRelativePath } };
}

/**
 * Move files/folders
 * POST /api/files/move
 */
export const moveFiles = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const { sourcePath, targetPath } = req.body;

        logOperation("🔄 Moving item:", { sourcePath, targetPath });

        if (!sourcePath || typeof targetPath !== "string") {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: "Missing required fields: sourcePath, targetPath",
            });
        }

        const vetted = await vetMove(sourcePath, targetPath);
        if (!vetted.ok) {
            return res.status(vetted.status).json({ success: false, error: vetted.error });
        }
        const { sourceFullPath, targetFullPath, targetRelativePath } = vetted.targets;
        const sourceFileName = path.basename(sourcePath);

        // Move the item
        await fs.rename(sourceFullPath, targetFullPath);

        logOperation(`✅ Item moved: ${sourcePath} → ${targetRelativePath}`);

        res.json({
            success: true,
            data: {
                sourcePath,
                targetPath: targetRelativePath,
                name: sourceFileName,
            },
            message: `${sourceFileName} moved successfully`,
        });
    } catch (error) {
        logServerError("❌ Failed to move item:", error instanceof Error ? error : new Error(String(error)));
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to move item",
        });
    }
};
