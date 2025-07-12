/**
 * Files Endpoint
 * Handles file listing and content retrieval
 */

import type { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";

import { HTTP_STATUS, SERVER_CONFIG } from "../constants/index.js";
import type { ApiResponse, FileItem } from "../types/index.js";
import { scanDirectory } from "../utils/fileOperations.js";
import { logOperation, logServerError, logSuccess } from "../utils/logger.js";

/**
 * Get file structure
 * GET /api/files
 */
export const getFiles = async (
    _req: Request,
    res: Response<ApiResponse<FileItem[]>>,
) => {
    try {
        logOperation("Getting file list");

        await fs.mkdir(SERVER_CONFIG.CONTENT_PATH, { recursive: true });
        const fileStructure = await scanDirectory(SERVER_CONFIG.CONTENT_PATH);

        logSuccess(`Found ${fileStructure.length} items in root`);

        res.json({
            success: true,
            data: fileStructure,
            message: `Found ${fileStructure.length} items`,
        });
    } catch (error) {
        logServerError("Failed to get file list", error as Error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to get file list",
        });
    }
};

/**
 * Get file content
 * GET /api/files/content?path=...
 */
export const getFileContent = async (
    req: Request,
    res: Response<ApiResponse>,
) => {
    try {
        const filePath = req.query.path as string;

        logOperation("Reading file content", { filePath });

        if (!filePath) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: "File path is required",
            });
        }

        const fullPath = path.join(SERVER_CONFIG.CONTENT_PATH, filePath);

        try {
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
                logServerError(
                    "Path is a directory",
                    new Error(`Directory: ${filePath}`),
                );
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: "Path is a directory, not a file",
                });
            }
        } catch (statError) {
            logServerError("File not found", statError as Error, { filePath });
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                error: "File not found",
            });
        }

        const content = await fs.readFile(fullPath, "utf8");
        logSuccess("File content read successfully", { filePath });

        res.json({
            success: true,
            data: {
                path: filePath,
                content,
            },
        });
    } catch (error) {
        logServerError("Failed to read file", error as Error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error:
                error instanceof Error ? error.message : "Failed to read file",
        });
    }
};
