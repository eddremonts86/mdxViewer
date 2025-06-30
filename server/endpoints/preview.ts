/**
 * Preview and Health Endpoints
 * Handles file previews and health checks
 */

import { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import { SERVER_CONFIG } from "../constants/index.js";
import { ApiResponse } from "../types/index.js";

/**
 * Serve preview images
 * GET /api/previews/:filename
 */
export const getPreview = (req: Request, res: Response) => {
    const { filename } = req.params;
    const previewsDir = path.join(
        path.dirname(SERVER_CONFIG.CONTENT_PATH),
        "previews"
    );
    const filePath = path.join(previewsDir, filename);

    fs.access(filePath)
        .then(() => {
            res.sendFile(filePath);
        })
        .catch(() => {
            res.status(404).json({
                success: false,
                error: "Preview not found",
                message: "Preview image is being generated or not available",
            });
        });
};

/**
 * Health check endpoint
 * GET /api/health
 */
export const getHealth = (req: Request, res: Response<ApiResponse>) => {
    res.json({
        success: true,
        data: {
            status: "ok",
            timestamp: new Date().toISOString(),
            contentPath: SERVER_CONFIG.CONTENT_PATH,
        },
        message: "Server is healthy",
    });
};
