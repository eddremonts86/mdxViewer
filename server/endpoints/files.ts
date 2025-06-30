/**
 * Files Endpoint
 * Handles file listing and content retrieval
 */

import { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import { SERVER_CONFIG } from "../constants/index.js";
import { ApiResponse, FileItem } from "../types/index.js";
import { scanDirectory } from "../utils/fileOperations.js";

/**
 * Get file structure
 * GET /api/files
 */
export const getFiles = async (
    req: Request,
    res: Response<ApiResponse<FileItem[]>>
) => {
    try {
        console.log("📋 Getting file list...");

        await fs.mkdir(SERVER_CONFIG.CONTENT_PATH, { recursive: true });
        const fileStructure = await scanDirectory(SERVER_CONFIG.CONTENT_PATH);

        console.log(`📋 Found ${fileStructure.length} items in root`);

        res.json({
            success: true,
            data: fileStructure,
            message: `Found ${fileStructure.length} items`,
        });
    } catch (error) {
        console.error("❌ Failed to get file list:", error);
        res.status(500).json({
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
    res: Response<ApiResponse>
) => {
    try {
        const filePath = req.query.path as string;

        console.log("📖 Reading file content for:", filePath);

        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: "File path is required",
            });
        }

        const fullPath = path.join(SERVER_CONFIG.CONTENT_PATH, filePath);

        try {
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
                console.log("❌ Path is a directory:", filePath);
                return res.status(400).json({
                    success: false,
                    error: "Path is a directory, not a file",
                });
            }
        } catch (statError) {
            console.log(
                "❌ File not found:",
                filePath,
                (statError as Error).message
            );
            return res.status(404).json({
                success: false,
                error: "File not found",
            });
        }

        const content = await fs.readFile(fullPath, "utf8");
        console.log("✅ File content read successfully:", filePath);

        res.json({
            success: true,
            data: {
                path: filePath,
                content,
            },
        });
    } catch (error) {
        console.error("❌ Failed to read file:", error);
        res.status(500).json({
            success: false,
            error:
                error instanceof Error ? error.message : "Failed to read file",
        });
    }
};
