#!/usr/bin/env node

/**
 * Generate PNG previews for all markdown documents
 * Uses the previewGenerator utility for proper PNG generation
 */

const fs = require("fs").promises;
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "..", "public", "content");
const PREVIEWS_DIR = path.join(__dirname, "..", "public", "previews");

// Import the preview generator
let generatePreviewImage;
try {
    const previewGen = require("../../server/utils/previewGenerator.ts");
    generatePreviewImage = previewGen.generatePreviewImage;
} catch (error) {
    console.warn(
        "Canvas-based preview generator not available, using fallback",
    );
    generatePreviewImage = null;
}

// Ensure previews directory exists
async function ensurePreviewsDir() {
    try {
        await fs.access(PREVIEWS_DIR);
    } catch {
        await fs.mkdir(PREVIEWS_DIR, { recursive: true });
    }
}

// Get all markdown files recursively
async function getMarkdownFiles(dir, basePath = "") {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = basePath
            ? `${basePath}/${entry.name}`
            : entry.name;

        if (entry.isDirectory()) {
            const subFiles = await getMarkdownFiles(fullPath, relativePath);
            files.push(...subFiles);
        } else if (
            entry.isFile() &&
            (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
        ) {
            files.push({
                name: entry.name,
                path: fullPath,
                relativePath,
                previewPath: path.join(
                    PREVIEWS_DIR,
                    relativePath.replace(/\.(md|mdx)$/, ".png"),
                ),
            });
        }
    }

    return files;
}

// Create SVG preview as fallback
function createSVGPreview(title, type, folder, content) {
    const truncatedContent =
        content.length > 200 ? `${content.substring(0, 200)  }...` : content;
    const lines = truncatedContent.split("\n").slice(0, 6);

    const svgContent = `<svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="240" fill="#f8f9fa"/>
        <rect x="20" y="20" width="60" height="25" fill="${type === "mdx" ? "#10b981" : "#3b82f6"}" rx="4"/>
        <text x="${type === "mdx" ? "30" : "35"}" y="38" font-family="Arial, sans-serif" font-size="12" fill="white">${type.toUpperCase()}</text>
        <text x="20" y="70" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1a1a1a">${title}</text>
        <text x="20" y="100" font-family="Arial, sans-serif" font-size="14" fill="#666666">📁 ${folder}</text>
        <text x="20" y="120" font-family="Arial, sans-serif" font-size="14" fill="#666666">Type: ${type === "mdx" ? "MDX Interactive" : "Markdown"}</text>
        ${lines
        .map(
            (line, i) =>
                `<text x="20" y="${140 + i * 16}" font-family="Arial, sans-serif" font-size="12" fill="#333333">${line.trim().substring(0, 50)}</text>`,
        )
        .join("")}
    </svg>`;

    return svgContent;
}

// Generate preview for a single file
async function generatePreview(file) {
    try {
        console.log(`Generating preview for: ${file.relativePath}`);

        // Read markdown content
        const content = await fs.readFile(file.path, "utf8");
        const title = file.name.replace(/\.(md|mdx)$/, "").replace(/-/g, " ");
        const type = file.name.endsWith(".mdx") ? "mdx" : "md";
        const folder =
            path.dirname(file.relativePath) === "."
                ? "root"
                : path.dirname(file.relativePath);

        // Ensure preview directory structure exists
        const previewDir = path.dirname(file.previewPath);
        await fs.mkdir(previewDir, { recursive: true });

        if (generatePreviewImage) {
            try {
                // Use canvas-based generator
                const buffer = await generatePreviewImage(
                    content,
                    title,
                    type,
                    folder,
                );
                await fs.writeFile(file.previewPath, buffer);
                console.log(`✓ Generated PNG: ${file.previewPath}`);
            } catch (canvasError) {
                console.warn(
                    `Canvas failed for ${file.relativePath}, using SVG fallback:`,
                    canvasError.message,
                );
                // Fallback to SVG
                const svgContent = createSVGPreview(
                    title,
                    type,
                    folder,
                    content,
                );
                const svgPath = file.previewPath.replace(/\.png$/, ".svg");
                await fs.writeFile(svgPath, svgContent);
                console.log(`✓ Generated SVG fallback: ${svgPath}`);
            }
        } else {
            // Use SVG fallback
            const svgContent = createSVGPreview(title, type, folder, content);
            const svgPath = file.previewPath.replace(/\.png$/, ".svg");
            await fs.writeFile(svgPath, svgContent);
            console.log(`✓ Generated SVG: ${svgPath}`);
        }
    } catch (error) {
        console.error(
            `✗ Failed to generate preview for ${file.relativePath}:`,
            error.message,
        );
    }
}

// Main function
async function main() {
    console.log("🚀 Starting preview generation...");

    try {
        // Ensure directories exist
        await ensurePreviewsDir();

        // Get all markdown files
        const files = await getMarkdownFiles(CONTENT_DIR);
        console.log(`📄 Found ${files.length} markdown files`);

        if (files.length === 0) {
            console.log("No markdown files found in content directory");
            return;
        }

        // Generate previews
        for (const file of files) {
            await generatePreview(file);
        }

        console.log(
            `✅ Preview generation complete! Generated ${files.length} previews`,
        );
    } catch (error) {
        console.error("❌ Preview generation failed:", error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main };
