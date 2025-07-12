/**
 * Statistics Endpoint
 * Handles site statistics generation
 */
import type { Request, Response } from "express";
import { promises as fs } from "fs";

import { HTTP_STATUS, SERVER_CONFIG } from "../constants/index.js";
import type { ApiResponse } from "../types/index.js";
import {
    calculateSiteStatistics,
    scanDirectory,
} from "../utils/fileOperations.js";
import { logOperation, logServerError, logSuccess } from "../utils/logger.js";

/**
 * Get site statistics
 * GET /api/statistics
 */
export const getStatistics = async (
    _req: Request,
    res: Response<ApiResponse>,
) => {
    try {
        logOperation("Generating site statistics");

        await fs.mkdir(SERVER_CONFIG.CONTENT_PATH, { recursive: true });
        const fileStructure = await scanDirectory(SERVER_CONFIG.CONTENT_PATH);
        const stats = calculateSiteStatistics(fileStructure);

        logSuccess("Statistics generated", { stats });

        res.json({
            success: true,
            data: stats,
            message: "Statistics generated successfully",
        });
    } catch (error) {
        logServerError(
            "❌ Failed to generate statistics:",
            error instanceof Error ? error : new Error(String(error)),
        );
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to generate statistics",
        });
    }
};
