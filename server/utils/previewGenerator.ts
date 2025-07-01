/**
 * Preview Generator for Markdown/MDX files
 * Generates static preview images for documents
 */

import { createCanvas } from "canvas";
import fs from "fs/promises";
import path from "path";

export interface PreviewOptions {
    width: number;
    height: number;
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontFamily: string;
    padding: number;
}

const DEFAULT_OPTIONS: PreviewOptions = {
    width: 400,
    height: 240,
    backgroundColor: "#ffffff",
    textColor: "#333333",
    fontSize: 14,
    fontFamily: "Arial, sans-serif",
    padding: 20,
};

/**
 * Extract text content from markdown
 */
function extractTextFromMarkdown(content: string): string {
    // Remove front matter
    const withoutFrontMatter = content.replace(/^---\n[\s\S]*?\n---\n/, "");

    // Remove markdown syntax
    let text = withoutFrontMatter
        .replace(/#{1,6}\s+/g, "") // Headers
        .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
        .replace(/\*(.*?)\*/g, "$1") // Italic
        .replace(/`(.*?)`/g, "$1") // Inline code
        .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
        .replace(/!\[.*?\]\(.*?\)/g, "") // Images
        .replace(/```[\s\S]*?```/g, "") // Code blocks
        .replace(/^>\s+/gm, "") // Blockquotes
        .replace(/^\s*[-*+]\s+/gm, "") // Lists
        .replace(/^\s*\d+\.\s+/gm, ""); // Numbered lists

    // Clean up extra whitespace
    text = text.replace(/\n\s*\n/g, "\n").trim();

    return text;
}

/**
 * Generate preview image for a document
 */
export async function generateDocumentPreview(
    filePath: string,
    content: string,
    outputPath: string,
    options: Partial<PreviewOptions> = {}
): Promise<void> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
        // Create canvas
        const canvas = createCanvas(opts.width, opts.height);
        const ctx = canvas.getContext("2d");

        // Set background
        ctx.fillStyle = opts.backgroundColor;
        ctx.fillRect(0, 0, opts.width, opts.height);

        // Extract and prepare text
        const text = extractTextFromMarkdown(content);
        const lines = text.split("\n").slice(0, 12); // First 12 lines

        // Set text style
        ctx.fillStyle = opts.textColor;
        ctx.font = `${opts.fontSize}px ${opts.fontFamily}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        // Draw title (filename without extension)
        const title = path.basename(filePath, path.extname(filePath));
        ctx.font = `bold ${opts.fontSize + 4}px ${opts.fontFamily}`;
        ctx.fillStyle = "#1a1a1a";
        ctx.fillText(title, opts.padding, opts.padding);

        // Reset font for content
        ctx.font = `${opts.fontSize}px ${opts.fontFamily}`;
        ctx.fillStyle = opts.textColor;

        let yOffset = opts.padding + 30;
        const lineHeight = opts.fontSize + 4;

        // Draw content lines
        for (const line of lines) {
            if (yOffset + lineHeight > opts.height - opts.padding) break;

            // Wrap long lines
            const maxWidth = opts.width - opts.padding * 2;
            const words = line.split(" ");
            let currentLine = "";

            for (const word of words) {
                const testLine = currentLine + (currentLine ? " " : "") + word;
                const metrics = ctx.measureText(testLine);

                if (metrics.width > maxWidth && currentLine) {
                    ctx.fillText(currentLine, opts.padding, yOffset);
                    yOffset += lineHeight;
                    currentLine = word;

                    if (yOffset + lineHeight > opts.height - opts.padding)
                        break;
                } else {
                    currentLine = testLine;
                }
            }

            if (
                currentLine &&
                yOffset + lineHeight <= opts.height - opts.padding
            ) {
                ctx.fillText(currentLine, opts.padding, yOffset);
                yOffset += lineHeight;
            }
        }

        // Add fade effect at bottom if text is cut off
        if (yOffset >= opts.height - opts.padding - 20) {
            const gradient = ctx.createLinearGradient(
                0,
                opts.height - 40,
                0,
                opts.height
            );
            gradient.addColorStop(0, "rgba(255,255,255,0)");
            gradient.addColorStop(1, opts.backgroundColor);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, opts.height - 40, opts.width, 40);
        }

        // Ensure output directory exists
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        // Save image
        const buffer = canvas.toBuffer("image/png");
        await fs.writeFile(outputPath, buffer);
    } catch (error) {
        console.error(`Error generating preview for ${filePath}:`, error);
        throw error;
    }
}

/**
 * Generate preview for all documents in a directory
 */
export async function generatePreviewsForDirectory(
    contentDir: string,
    previewDir: string,
    options: Partial<PreviewOptions> = {}
): Promise<void> {
    try {
        const files = await fs.readdir(contentDir, { recursive: true });

        for (const file of files) {
            const filePath = path.join(contentDir, file.toString());
            const stats = await fs.stat(filePath);

            if (
                stats.isFile() &&
                (filePath.endsWith(".md") || filePath.endsWith(".mdx"))
            ) {
                const content = await fs.readFile(filePath, "utf-8");
                const relativePath = path.relative(contentDir, filePath);
                const previewPath = path.join(
                    previewDir,
                    relativePath.replace(/\.(md|mdx)$/, ".png")
                );

                // Check if preview already exists and is newer than source
                try {
                    const previewStats = await fs.stat(previewPath);
                    if (previewStats.mtime > stats.mtime) {
                        continue; // Skip if preview is newer
                    }
                } catch {
                    // Preview doesn't exist, create it
                }

                await generateDocumentPreview(
                    relativePath,
                    content,
                    previewPath,
                    options
                );
                console.log(`Generated preview: ${previewPath}`);
            }
        }
    } catch (error) {
        console.error("Error generating previews:", error);
        throw error;
    }
}
