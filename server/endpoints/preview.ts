/**
 * Preview and Health Endpoints
 * Handles file previews and health checks with generation capabilities
 */
import type { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";

import { HTTP_STATUS, SERVER_CONFIG } from "../constants/index.js";
import type { ApiResponse } from "../types/index.js";
import { logServerError } from "../utils/logger.js";
import { resolveInsideContent, resolveInsidePreviews } from "../utils/validation.js";

/**
 * Sanitize filename to be URL-safe and match kebab-case convention
 */
function sanitizeFilename(filename: string): string {
    return filename
        .toLowerCase() // Convert to lowercase for kebab-case
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-z0-9._-]/g, "") // Remove special characters except dots, hyphens, and underscores
        .replace(/_+/g, "-") // Replace underscores with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-+/, "")
        .replace(/-+$/, ""); // Remove leading/trailing hyphens
}

/**
 * Sanitize folder path to be URL-safe and match kebab-case convention
 */
function sanitizeFolderPath(folderPath: string): string {
    return folderPath
        .toLowerCase() // Convert to lowercase for kebab-case
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-z0-9._/-]/g, "") // Keep forward slashes for paths
        .replace(/_+/g, "-") // Replace underscores with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/\/+/g, "/") // Replace multiple slashes with single
        .replace(/^-+/, "")
        .replace(/-+$/, ""); // Remove leading/trailing hyphens
}

/**
 * Escape text before interpolating it into SVG markup
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Split "docs/guides/intro.png" into its folder part and its file part
 */
function splitPreviewPath(filename: string): { actualFilename: string; sourceBasePath: string } {
    if (!filename.includes("/")) {
        return { actualFilename: filename, sourceBasePath: "" };
    }

    const pathParts = filename.split("/");
    const actualFilename = pathParts.pop() ?? filename;

    return { actualFilename, sourceBasePath: pathParts.join("/") };
}

/**
 * Where the pre-generated SVG preview for this request would live
 */
function resolveSvgPreviewPath(actualFilename: string, sourceBasePath: string): string | null {
    // Strip the .png that the client appends, keeping the source extension
    let svgFilename = actualFilename;
    if (svgFilename.endsWith(".md.png")) {
        svgFilename = svgFilename.replace(/\.md\.png$/, ".md");
    } else if (svgFilename.endsWith(".mdx.png")) {
        svgFilename = svgFilename.replace(/\.mdx\.png$/, ".mdx");
    } else {
        svgFilename = svgFilename.replace(/\.png$/, "");
    }

    const finalSvgName = sanitizeFilename(svgFilename).replace(/\.(md|mdx)$/, ".svg");
    const sanitizedBasePath = sourceBasePath ? sanitizeFolderPath(sourceBasePath) : "";

    return resolveInsidePreviews(sanitizedBasePath, finalSvgName);
}

/**
 * Name of the source document behind a preview request, or null when there is none
 */
async function findSourceDocument(basePath: string, actualFilename: string): Promise<string | null> {
    const candidates = [actualFilename.replace(/\.png$/, ".md"), actualFilename.replace(/\.png$/, ".mdx")];

    for (const candidate of candidates) {
        try {
            await fs.access(path.join(basePath, candidate));
            return candidate;
        } catch {
            // Try the next extension
        }
    }

    return null;
}

/**
 * Placeholder shown while a real preview has not been generated yet
 */
function renderPlaceholderSvg(sourceFilename: string, sourceBasePath: string): string {
    const displayTitle = escapeXml(sourceFilename.replace(/\.(md|mdx)$/, "").replace(/-/g, " "));
    const fileType = sourceFilename.endsWith(".mdx") ? "MDX" : "MD";
    const folderName = escapeXml(sourceBasePath || "root");

    return `
        <svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="240" fill="#f8f9fa"/>
            <rect x="20" y="20" width="60" height="25" fill="#3b82f6" rx="4"/>
            <text x="35" y="38" font-family="Arial, sans-serif" font-size="12" fill="white">${fileType}</text>
            <text x="20" y="70" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1a1a1a">${displayTitle}</text>
            <text x="20" y="100" font-family="Arial, sans-serif" font-size="14" fill="#666666">Folder: ${folderName}</text>
            <text x="20" y="120" font-family="Arial, sans-serif" font-size="14" fill="#666666">Type: ${fileType === "MDX" ? "MDX Interactive" : "Markdown"}</text>
            <text x="20" y="140" font-family="Arial, sans-serif" font-size="14" fill="#666666">Preview generating...</text>
            <text x="20" y="160" font-family="Arial, sans-serif" font-size="12" fill="#999999">Run: npm run generate:previews</text>
        </svg>
    `;
}

/**
 * Serve preview images - generate if not exists
 * GET /api/previews/:filename
 */
export const getPreview = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: "Invalid preview filename",
            });
        }

        const { actualFilename, sourceBasePath } = splitPreviewPath(filename);

        if (!actualFilename.endsWith(".png")) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: "Invalid preview filename - must be PNG",
            });
        }

        // 1. A generated PNG preview, if one exists
        const previewPath = resolveInsidePreviews(filename);
        if (!previewPath) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                error: "Preview path is outside the previews folder",
            });
        }
        try {
            const [stat, png] = await Promise.all([fs.stat(previewPath), fs.readFile(previewPath)]);

            res.setHeader("Content-Type", "image/png");
            res.setHeader("Content-Length", stat.size);
            res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours

            return res.send(png);
        } catch {
            // No PNG - fall through to the SVG preview
        }

        // 2. A generated SVG preview, if one exists
        const svgPath = resolveSvgPreviewPath(actualFilename, sourceBasePath);
        try {
            if (!svgPath) throw new Error("outside previews");
            const svgContent = await fs.readFile(svgPath, "utf8");

            res.setHeader("Content-Type", "image/svg+xml");
            res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours

            return res.send(svgContent);
        } catch {
            // No SVG - fall through to the placeholder
        }

        // 3. Nothing generated yet: show a placeholder if the document exists at all
        const basePath = resolveInsideContent(sourceBasePath);
        const sourceFilename = basePath ? await findSourceDocument(basePath, actualFilename) : null;

        if (!sourceFilename) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                error: "Source document not found",
            });
        }

        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=300"); // 5 minutes for the placeholder
        return res.send(renderPlaceholderSvg(sourceFilename, sourceBasePath));
    } catch (error) {
        logServerError("Error serving preview:", error instanceof Error ? error : new Error(String(error)));
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: "Failed to serve preview",
        });
    }
};

/**
 * Health check endpoint
 * GET /api/health
 */
export const getHealth = (_req: Request, res: Response<ApiResponse>) => {
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
