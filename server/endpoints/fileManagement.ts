/**
 * File Management Endpoints
 * Handles file creation, uploading, deletion, and moving
 */

import { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import { SERVER_CONFIG } from "../constants/index.js";
import { ApiResponse } from "../types/index.js";
import { validateFileName, validateFolderDepth } from "../utils/validation.js";

/**
 * Create a new file
 * POST /api/files/create
 */
export const createFile = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const { name, type, path: relativePath, content } = req.body;

        console.log("📝 Creating file:", { name, type, relativePath });

        if (!name || !type || typeof relativePath !== "string") {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: name, type, path",
            });
        }

        const validation = validateFileName(name);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.error,
            });
        }

        const depthValidation = validateFolderDepth(relativePath);
        if (!depthValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: depthValidation.error,
            });
        }

        const fileName = `${name}.${type}`;
        const fullPath = path.join(
            SERVER_CONFIG.CONTENT_PATH,
            relativePath,
            fileName
        );
        const fileRelativePath = path
            .join(relativePath, fileName)
            .replace(/\\/g, "/");

        // Check if file already exists
        try {
            await fs.access(fullPath);
            return res.status(409).json({
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
        const fileContent =
            content || `# ${name}\n\nThis is a new ${type} document.\n`;

        // Write file
        await fs.writeFile(fullPath, fileContent, "utf8");

        console.log(`✅ File created: ${fileRelativePath}`);

        res.json({
            success: true,
            data: {
                path: fileRelativePath,
                name: fileName,
            },
            message: `File ${fileName} created successfully`,
        });
    } catch (error) {
        console.error("❌ Failed to create file:", error);
        res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create file",
        });
    }
};

/**
 * Create a new folder
 * POST /api/folders/create
 */
export const createFolder = async (
    req: Request,
    res: Response<ApiResponse>
) => {
    try {
        const { name, path: relativePath } = req.body;

        console.log("📁 Creating folder:", { name, relativePath });

        if (!name || typeof relativePath !== "string") {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: name, path",
            });
        }

        const validation = validateFileName(name);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.error,
            });
        }

        const depthValidation = validateFolderDepth(relativePath, true);
        if (!depthValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: depthValidation.error,
            });
        }

        const fullPath = path.join(
            SERVER_CONFIG.CONTENT_PATH,
            relativePath,
            name
        );
        const folderRelativePath = path
            .join(relativePath, name)
            .replace(/\\/g, "/");

        // Check if folder already exists
        try {
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
                return res.status(409).json({
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

        console.log(`✅ Folder created: ${folderRelativePath}`);

        res.json({
            success: true,
            data: {
                path: folderRelativePath,
                name,
            },
            message: `Folder ${name} created successfully`,
        });
    } catch (error) {
        console.error("❌ Failed to create folder:", error);
        res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create folder",
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
        const targetPath = req.body.path || "";
        const createFolders = req.body.createFolders === "true";

        console.log("📤 Uploading files:", {
            count: files?.length || 0,
            targetPath,
            createFolders,
        });

        if (!files || files.length === 0) {
            return res.status(400).json({
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

        const fullTargetPath = path.join(
            SERVER_CONFIG.CONTENT_PATH,
            targetPath
        );
        if (createFolders) {
            await fs.mkdir(fullTargetPath, { recursive: true });
        }

        for (const file of files) {
            try {
                const filePath = path
                    .join(targetPath, file.filename)
                    .replace(/\\/g, "/");
                results.push({
                    originalName: file.originalname,
                    filename: file.filename,
                    path: filePath,
                    size: file.size,
                });

                console.log(`✅ File uploaded: ${filePath}`);
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                errors.push({
                    filename: file.originalname,
                    error: errorMessage,
                });
                console.error(
                    `❌ Failed to process file ${file.originalname}:`,
                    error
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
        console.error("❌ Failed to upload files:", error);
        res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to upload files",
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

        console.log("🗑️ Deleting items:", { paths });

        if (!Array.isArray(paths) || paths.length === 0) {
            return res.status(400).json({
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
                const fullPath = path.join(
                    SERVER_CONFIG.CONTENT_PATH,
                    itemPath
                );
                const stats = await fs.stat(fullPath);

                if (stats.isDirectory()) {
                    await fs.rm(fullPath, { recursive: true, force: true });
                    console.log(`✅ Folder deleted: ${itemPath}`);
                } else {
                    await fs.unlink(fullPath);
                    console.log(`✅ File deleted: ${itemPath}`);
                }

                results.push({
                    path: itemPath,
                    type: stats.isDirectory() ? "folder" : "file",
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                errors.push({
                    path: itemPath,
                    error: errorMessage,
                });
                console.error(`❌ Failed to delete ${itemPath}:`, error);
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
        console.error("❌ Failed to delete items:", error);
        res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to delete items",
        });
    }
};

/**
 * Move files/folders
 * POST /api/files/move
 */
export const moveFiles = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const { sourcePath, targetPath } = req.body;

        console.log("🔄 Moving item:", { sourcePath, targetPath });

        if (!sourcePath || typeof targetPath !== "string") {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: sourcePath, targetPath",
            });
        }

        const sourceFullPath = path.join(
            SERVER_CONFIG.CONTENT_PATH,
            sourcePath
        );
        const sourceFileName = path.basename(sourcePath);
        const targetFullPath = path.join(
            SERVER_CONFIG.CONTENT_PATH,
            targetPath,
            sourceFileName
        );
        const targetRelativePath = path
            .join(targetPath, sourceFileName)
            .replace(/\\/g, "/");

        // Check if source exists
        try {
            await fs.access(sourceFullPath);
        } catch (error) {
            console.error("❌ Source file/folder not found:", error);
            return res.status(404).json({
                success: false,
                error: `Source file/folder not found: ${sourcePath}`,
            });
        }

        // Check if target directory exists
        const targetDir = path.join(SERVER_CONFIG.CONTENT_PATH, targetPath);
        try {
            const targetStats = await fs.stat(targetDir);
            if (!targetStats.isDirectory()) {
                return res.status(400).json({
                    success: false,
                    error: `Target is not a directory: ${targetPath}`,
                });
            }
        } catch (error) {
            console.error("❌ Target directory not found:", error);
            return res.status(404).json({
                success: false,
                error: `Target directory not found: ${targetPath}`,
            });
        }

        // Check folder depth
        const depthValidation = validateFolderDepth(targetRelativePath);
        if (!depthValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: depthValidation.error,
            });
        }

        // Check if item already exists at target
        try {
            await fs.access(targetFullPath);
            return res.status(409).json({
                success: false,
                error: `Item already exists at target location: ${sourceFileName}`,
            });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                throw error;
            }
        }

        // Check for moving folder into itself
        if (targetPath.startsWith(sourcePath)) {
            return res.status(400).json({
                success: false,
                error: "Cannot move a folder into itself or its subfolder",
            });
        }

        // Move the item
        await fs.rename(sourceFullPath, targetFullPath);

        console.log(`✅ Item moved: ${sourcePath} → ${targetRelativePath}`);

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
        console.error("❌ Failed to move item:", error);
        res.status(500).json({
            success: false,
            error:
                error instanceof Error ? error.message : "Failed to move item",
        });
    }
};
