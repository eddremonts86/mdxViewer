/**
 * Preview and Health Endpoints
 * Handles file previews and health checks with generation capabilities
 */

import { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import { SERVER_CONFIG } from "../constants/index.js";
import { ApiResponse } from "../types/index.js";

/**
 * Serve preview images - generate if not exists
 * GET /api/previews/:filename
 */
export const getPreview = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return res.status(400).json({
                success: false,
                error: "Invalid preview filename",
            });
        }

        // Handle nested paths (e.g., "docs/introduction.png")
        const isNestedPath = filename.includes("/");
        let actualFilename = filename;
        let sourceBasePath = "";

        if (isNestedPath) {
            // Split path and filename
            const pathParts = filename.split("/");
            actualFilename = pathParts.pop() || filename;
            sourceBasePath = pathParts.join("/");
        }

        // Check if it's a PNG request
        if (!actualFilename.endsWith(".png")) {
            return res.status(400).json({
                success: false,
                error: "Invalid preview filename - must be PNG",
            });
        }

        const previewsDir = path.join(
            path.dirname(SERVER_CONFIG.CONTENT_PATH),
            "previews"
        );
        const previewPath = path.join(previewsDir, filename);

        // Check if PNG preview exists
        try {
            await fs.access(previewPath);

            // Serve existing PNG preview
            const stat = await fs.stat(previewPath);
            const stream = await fs.readFile(previewPath);

            res.setHeader("Content-Type", "image/png");
            res.setHeader("Content-Length", stat.size);
            res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours

            return res.send(stream);
        } catch {
            // PNG doesn't exist, try SVG preview
            const svgPreviewPath = previewPath.replace(/\.png$/, ".svg");

            try {
                await fs.access(svgPreviewPath);

                // Serve existing SVG preview
                const svgContent = await fs.readFile(svgPreviewPath, "utf8");

                res.setHeader("Content-Type", "image/svg+xml");
                res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours

                return res.send(svgContent);
            } catch {
                // Neither PNG nor SVG exists, check if source document exists and generate fallback
                const sourceFilename = actualFilename.replace(/\.png$/, ".md");
                const altSourceFilename = actualFilename.replace(
                    /\.png$/,
                    ".mdx"
                );

                let actualSourceFilename;

                // Construct full source paths
                const basePath = sourceBasePath
                    ? path.join(SERVER_CONFIG.CONTENT_PATH, sourceBasePath)
                    : SERVER_CONFIG.CONTENT_PATH;

                // Try .md first, then .mdx
                try {
                    const sourceFile = path.join(basePath, sourceFilename);
                    await fs.access(sourceFile);
                    actualSourceFilename = sourceFilename;
                } catch {
                    try {
                        const sourceFile = path.join(
                            basePath,
                            altSourceFilename
                        );
                        await fs.access(sourceFile);
                        actualSourceFilename = altSourceFilename;
                    } catch {
                        // Return 404 if source document doesn't exist
                        return res.status(404).json({
                            success: false,
                            error: "Source document not found",
                        });
                    }
                }

                // Generate a simple SVG placeholder since PNG doesn't exist yet
                const displayTitle = actualSourceFilename
                    .replace(/\.(md|mdx)$/, "")
                    .replace(/-/g, " ");
                const fileType = actualSourceFilename.endsWith(".mdx")
                    ? "MDX"
                    : "MD";
                const folderName = sourceBasePath || "root";

                const svgContent = `
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

                res.setHeader("Content-Type", "image/svg+xml");
                res.setHeader("Cache-Control", "public, max-age=300"); // 5 minutes for SVG fallback
                return res.send(svgContent);
            }
        }
    } catch (error) {
        console.error("Error serving preview:", error);
        res.status(500).json({
            success: false,
            error: "Failed to serve preview",
        });
    }
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
