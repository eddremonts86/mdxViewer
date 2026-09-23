/**
 * Trash Endpoints
 * Listing, restoring and permanently purging deleted documents
 */
import type { Request, Response } from "express";
import { promises as fs } from "fs";

import { ERRORS, HTTP_STATUS } from "../constants/index.js";
import type { ApiResponse } from "../types/index.js";
import { logOperation, logServerError } from "../utils/logger.js";
import { listTrash, purgeFromTrash, readTrashEntry, restoreFromTrash, trashEntryDir } from "../utils/trash.js";
import { resolveInsideContent } from "../utils/validation.js";

/**
 * What is waiting in the trash
 * GET /api/trash
 */
export const getTrash = async (_req: Request, res: Response<ApiResponse>) => {
    try {
        res.json({ success: true, data: await listTrash() });
    } catch (error) {
        logServerError("Failed to list the trash:", error instanceof Error ? error : new Error(String(error)));
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to list the trash",
        });
    }
};

/**
 * Put a deleted document back where it came from
 * POST /api/trash/restore
 */
export const restoreTrashEntry = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const { id } = req.body;

        const dir = await trashEntryDir(id);
        const entry = dir ? await readTrashEntry(dir) : null;
        if (!dir || !entry) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: "No such trash entry" });
        }

        // The original path was recorded by this server, but it is still a path
        // being turned back into a filesystem location, so it goes through the
        // same guard as anything a client sends.
        const target = resolveInsideContent(entry.originalPath);
        if (!target) {
            logServerError("Refused a restore outside the content folder", new Error(entry.originalPath));
            return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: ERRORS.OUTSIDE_CONTENT });
        }

        // Restoring must never overwrite. Something with that name may well have
        // been created in the meantime, and it did not ask to be replaced.
        try {
            await fs.access(target);
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                error: `Something already exists at ${entry.originalPath}. Move or rename it first.`,
            });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        }

        await restoreFromTrash(dir, entry, target);
        logOperation(`Restored from trash: ${entry.originalPath}`);

        res.json({ success: true, data: entry, message: `${entry.name} restored` });
    } catch (error) {
        logServerError("Failed to restore:", error instanceof Error ? error : new Error(String(error)));
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to restore",
        });
    }
};

/**
 * Delete for good
 * DELETE /api/trash
 */
export const purgeTrashEntries = async (req: Request, res: Response<ApiResponse>) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: "ids array is required" });
        }

        const purged: string[] = [];
        for (const id of ids) {
            const dir = await trashEntryDir(id);
            if (!dir) continue;
            await purgeFromTrash(dir);
            purged.push(id as string);
        }

        logOperation(`Purged ${purged.length} trash entries`);
        res.json({
            success: true,
            data: { purged },
            message: `${purged.length} removed for good`,
        });
    } catch (error) {
        logServerError("Failed to purge:", error instanceof Error ? error : new Error(String(error)));
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to purge",
        });
    }
};
