#!/usr/bin/env node

/**
 * Simple preview generator - creates SVG previews for all markdown files
 */

const fs = require("fs").promises;
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "..", "public", "content");
const PREVIEWS_DIR = path.join(__dirname, "..", "public", "previews");

console.log("🚀 Starting simple preview generation...");
console.log("Content dir:", CONTENT_DIR);
console.log("Previews dir:", PREVIEWS_DIR);

// Get all markdown files recursively
async function getMarkdownFiles(dir, basePath = "") {
    const files = [];

    try {
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
                    relativePath: relativePath,
                    previewPath: path.join(
                        PREVIEWS_DIR,
                        relativePath.replace(/\.(md|mdx)$/, ".png")
                    ),
                    svgPath: path.join(
                        PREVIEWS_DIR,
                        relativePath.replace(/\.(md|mdx)$/, ".svg")
                    ),
                });
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
    }

    return files;
}

// Create SVG preview
function createSVGPreview(title, type, folder, content) {
    // Extract first few lines of content for preview
    const lines = content
        .replace(/^---[\s\S]*?---\n/, "") // Remove frontmatter
        .replace(/#{1,6}\s+/g, "") // Remove headers
        .split("\n")
        .filter(line => line.trim().length > 0)
        .slice(0, 4)
        .map(line => line.trim().substring(0, 55));

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
                    `<text x="20" y="${145 + i * 18}" font-family="Arial, sans-serif" font-size="12" fill="#333333">${line.replace(/[<>&]/g, "")}</text>`
            )
            .join("")}
    </svg>`;

    return svgContent;
}

// Generate preview for a single file
async function generatePreview(file) {
    try {
        console.log(`📝 Processing: ${file.relativePath}`);

        // Read markdown content
        const content = await fs.readFile(file.path, "utf8");
        const title = file.name.replace(/\.(md|mdx)$/, "").replace(/-/g, " ");
        const type = file.name.endsWith(".mdx") ? "mdx" : "md";
        const folder =
            path.dirname(file.relativePath) === "."
                ? "root"
                : path.dirname(file.relativePath);

        // Ensure preview directory structure exists
        const previewDir = path.dirname(file.svgPath);
        await fs.mkdir(previewDir, { recursive: true });

        // Generate SVG preview
        const svgContent = createSVGPreview(title, type, folder, content);
        await fs.writeFile(file.svgPath, svgContent);

        console.log(`✅ Generated: ${file.svgPath}`);
    } catch (error) {
        console.error(
            `❌ Failed to generate preview for ${file.relativePath}:`,
            error.message
        );
    }
}

// Main function
async function main() {
    try {
        // Ensure previews directory exists
        await fs.mkdir(PREVIEWS_DIR, { recursive: true });

        // Get all markdown files
        const files = await getMarkdownFiles(CONTENT_DIR);
        console.log(`📄 Found ${files.length} markdown files`);

        if (files.length === 0) {
            console.log("⚠️  No markdown files found in content directory");
            return;
        }

        // Generate previews
        for (const file of files) {
            await generatePreview(file);
        }

        console.log(
            `🎉 Preview generation complete! Generated ${files.length} SVG previews`
        );
    } catch (error) {
        console.error("💥 Preview generation failed:", error.message);
        process.exit(1);
    }
}

// Run the script
main();
