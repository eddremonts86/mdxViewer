/**
 * Files Endpoint
 * Handles file listing and content retrieval
 */

import type { Request, Response } from "express";
import { promises as fs } from "fs";
import matter from "gray-matter";

import { ERRORS, HTTP_STATUS, SERVER_CONFIG } from "../constants/index.js";
import type { ApiResponse, FileItem } from "../types/index.js";
import { scanDirectory } from "../utils/fileOperations.js";
import { logOperation, logServerError, logSuccess } from "../utils/logger.js";
import { realPathInsideContent, resolveInsideContent } from "../utils/validation.js";

/**
 * Get file structure
 * GET /api/files
 */
export const getFiles = async (_req: Request, res: Response<ApiResponse<FileItem[]>>) => {
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
            error: error instanceof Error ? error.message : "Failed to get file list",
        });
    }
};

/**
 * Get file content
 * GET /api/files/content?path=...
 */
export const getFileContent = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const filePath = req.query.path as string;

        logOperation("Reading file content", { filePath });

        if (!filePath) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: "File path is required",
            });
        }

        const fullPath = resolveInsideContent(filePath);
        if (!fullPath || !(await realPathInsideContent(fullPath))) {
            logServerError("Refused a path outside the content folder", new Error(filePath));
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                error: ERRORS.OUTSIDE_CONTENT,
            });
        }

        try {
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
                logServerError("Path is a directory", new Error(`Directory: ${filePath}`));
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

        const raw = await fs.readFile(fullPath, "utf8");

        // Frontmatter is metadata, not prose. Split it here so the viewer can put
        // it in the document's title block instead of rendering it as a paragraph.
        const { content, data } = matter(raw);
        const stats = await fs.stat(fullPath);

        logSuccess("File content read successfully", { filePath });

        res.json({
            success: true,
            data: {
                path: filePath,
                content,
                // The editor saves whole files, so it needs the text as it sits on
                // disk. Rebuilding it from `content` + `frontmatter` would reformat
                // YAML the author never touched.
                raw,
                frontmatter: data,
                size: stats.size,
                lastModified: stats.mtime.toISOString(),
            },
        });
    } catch (error) {
        logServerError("Failed to read file", error as Error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to read file",
        });
    }
};
