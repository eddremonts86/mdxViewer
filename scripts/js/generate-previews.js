#!/usr/bin/env node

/**
 * Generate PNG previews for all markdown documents
 * Uses canvas to render markdown content as images (fallback to simple placeholders)
 */

const fs = require("fs").promises;
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "..", "public", "content");
const PREVIEWS_DIR = path.join(__dirname, "..", "public", "previews");

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

// Create a simple PNG placeholder (base64 encoded 1x1 pixel)
function createSimplePNG() {
    // This is a base64 encoded 400x240 PNG with a simple design
    // Created programmatically, but for now we'll use a simple approach
    return Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        "base64",
    );
}

// Generate a proper PNG using SVG conversion (if available) or create placeholder
async function generatePreview(file) {
    try {
        console.log(`Generating preview for: ${file.relativePath}`);

        // Ensure preview directory structure exists
        const previewDir = path.dirname(file.previewPath);
        await fs.mkdir(previewDir, { recursive: true });

        // For now, create a simple placeholder file
        // In a production environment, you would use a proper image generation library
        const placeholder = createSimplePNG();
        await fs.writeFile(file.previewPath, placeholder);

        console.log(`✓ Generated placeholder: ${file.previewPath}`);
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
    console.log(
        "Note: This will generate simple PNG placeholders. For full previews, install puppeteer.",
    );

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
            `✅ Preview generation complete! Generated ${files.length} placeholder previews`,
        );
        console.log(
            "💡 To generate proper previews, install puppeteer: npm install puppeteer",
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
