/**
 * Search Endpoint
 * Finds documents by name and by what is written inside them
 */
import type { Request, Response } from "express";

import { HTTP_STATUS } from "../constants/index.js";
import type { ApiResponse } from "../types/index.js";
import { logServerError } from "../utils/logger.js";
import { searchContent } from "../utils/search.js";

const MAX_QUERY_LENGTH = 200;

/**
 * Search the collection
 * GET /api/search?q=...
 */
export const searchDocuments = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const query = typeof req.query.q === "string" ? req.query.q : "";

        // An empty query is not an error, it is a palette that has not been typed
        // into yet. It gets an empty result rather than a message to render.
        if (!query.trim()) {
            return res.json({ success: true, data: { query: "", hits: [] } });
        }

        if (query.length > MAX_QUERY_LENGTH) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: `Search text is too long (max ${MAX_QUERY_LENGTH} characters)`,
            });
        }

        const hits = await searchContent(query);
        res.json({ success: true, data: { query, hits } });
    } catch (error) {
        logServerError("Failed to search:", error instanceof Error ? error : new Error(String(error)));
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to search",
        });
    }
};
