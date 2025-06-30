/**
 * Statistics Endpoint
 * Handles site statistics generation
 */

import { Request, Response } from "express";
import { promises as fs } from "fs";
import { SERVER_CONFIG } from "../constants/index.js";
import { ApiResponse } from "../types/index.js";
import {
    calculateSiteStatistics,
    scanDirectory,
} from "../utils/fileOperations.js";

/**
 * Get site statistics
 * GET /api/statistics
 */
export const getStatistics = async (
    req: Request,
    res: Response<ApiResponse>
) => {
    try {
        console.log("📊 Generating site statistics...");

        await fs.mkdir(SERVER_CONFIG.CONTENT_PATH, { recursive: true });
        const fileStructure = await scanDirectory(SERVER_CONFIG.CONTENT_PATH);
        const stats = calculateSiteStatistics(fileStructure);

        console.log("📊 Statistics generated:", stats);

        res.json({
            success: true,
            data: stats,
            message: "Statistics generated successfully",
        });
    } catch (error) {
        console.error("❌ Failed to generate statistics:", error);
        res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to generate statistics",
        });
    }
};
