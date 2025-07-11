#!/usr/bin/env node

/**
 * Comprehensive preview generator for all markdown files
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, "..", "..", "public", "content");
const PREVIEWS_DIR = path.join(__dirname, "..", "..", "public", "previews");

/**
 * Sanitize filename to be URL-safe and match kebab-case convention
 */
function sanitizeFilename(filename) {
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
function sanitizeFolderPath(folderPath) {
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

// Get all markdown files recursively
async function getAllMarkdownFiles(dir, basePath = "") {
    const files = [];

    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = basePath
                ? `${basePath}/${entry.name}`
                : entry.name;

            if (entry.isDirectory()) {
                const subFiles = await getAllMarkdownFiles(
                    fullPath,
                    relativePath
                );
                files.push(...subFiles);
            } else if (
                entry.isFile() &&
                (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
            ) {
                files.push({
                    name: entry.name,
                    path: fullPath,
                    relativePath: relativePath,
                    folder: basePath || "root",
                });
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
    }

    return files;
}

// Create SVG preview content
function createSVGPreview(title, type, folder, content) {
    // Clean and extract preview text
    const cleanContent = content
        .replace(/^---[\s\S]*?---\n/, "") // Remove frontmatter
        .replace(/#{1,6}\s+/g, "") // Remove headers
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
        .replace(/\*(.*?)\*/g, "$1") // Remove italic markdown
        .replace(/`(.*?)`/g, "$1") // Remove inline code
        .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links
        .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
        .replace(/```[\s\S]*?```/g, "") // Remove code blocks
        .replace(/^\s*[-*+]\s+/gm, "") // Remove list markers
        .replace(/^\s*\d+\.\s+/gm, ""); // Remove numbered lists

    const lines = cleanContent
        .split("\n")
        .filter(line => line.trim().length > 0)
        .slice(0, 4)
        .map(line =>
            line
                .trim()
                .substring(0, 50)
                .replace(/[<>&"']/g, "")
        );

    const badgeColor = type === "mdx" ? "#10b981" : "#3b82f6";
    const badgeText = type.toUpperCase();
    const badgeX = type === "mdx" ? "30" : "35";

    return `<svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#bg)"/>
        <rect x="20" y="20" width="60" height="25" fill="${badgeColor}" rx="4"/>
        <text x="${badgeX}" y="38" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">${badgeText}</text>
        <text x="20" y="70" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1a1a1a">${title}</text>
        <text x="20" y="95" font-family="Arial, sans-serif" font-size="13" fill="#6b7280">📁 ${folder}</text>
        <text x="20" y="115" font-family="Arial, sans-serif" font-size="13" fill="#6b7280">Type: ${type === "mdx" ? "MDX Interactive" : "Markdown Document"}</text>
        ${lines
            .map(
                (line, i) =>
                    `<text x="20" y="${140 + i * 16}" font-family="Arial, sans-serif" font-size="11" fill="#374151">${line}</text>`
            )
            .join("")}
        <rect x="0" y="0" width="400" height="240" fill="none" stroke="#e5e7eb" stroke-width="1"/>
    </svg>`;
}

// Generate preview for a single file
async function generatePreview(file) {
    try {
        console.log(`📝 Processing: ${file.relativePath}`);

        // Read file content
        const content = await fs.readFile(file.path, "utf8");
        const title = file.name
            .replace(/\.(md|mdx)$/, "")
            .replace(/[-_]/g, " ");
        const type = file.name.endsWith(".mdx") ? "mdx" : "md";

        // Sanitize folder path to match kebab-case structure
        const sanitizedFolderPath =
            file.folder === "root" ? "" : sanitizeFolderPath(file.folder);

        // Ensure preview directory exists with correct nested structure
        const previewDir = sanitizedFolderPath
            ? path.join(PREVIEWS_DIR, sanitizedFolderPath)
            : PREVIEWS_DIR;

        await fs.mkdir(previewDir, { recursive: true });

        // Sanitize filename
        const sanitizedFilename = sanitizeFilename(
            file.name.replace(/\.(md|mdx)$/, "")
        );
        const svgFilename = `${sanitizedFilename}.svg`;

        // Generate SVG
        const svgContent = createSVGPreview(title, type, file.folder, content);
        const svgPath = path.join(previewDir, svgFilename);

        await fs.writeFile(svgPath, svgContent);
        console.log(`✅ Generated: ${svgPath}`);

        return true;
    } catch (error) {
        console.error(
            `❌ Failed to generate preview for ${file.relativePath}:`,
            error.message
        );
        return false;
    }
}

// Main function
async function main() {
    console.log("🚀 Starting comprehensive preview generation...");

    try {
        // Get all markdown files
        const files = await getAllMarkdownFiles(CONTENT_DIR);
        console.log(`📄 Found ${files.length} markdown files`);

        if (files.length === 0) {
            console.log("⚠️  No markdown files found");
            return;
        }

        // Group by folder for better organization
        const filesByFolder = {};
        files.forEach(file => {
            if (!filesByFolder[file.folder]) {
                filesByFolder[file.folder] = [];
            }
            filesByFolder[file.folder].push(file);
        });

        console.log(`📁 Found ${Object.keys(filesByFolder).length} folders`);

        let successCount = 0;
        let errorCount = 0;

        // Generate previews for each folder
        for (const [folder, folderFiles] of Object.entries(filesByFolder)) {
            console.log(
                `\n📂 Processing folder: ${folder} (${folderFiles.length} files)`
            );

            for (const file of folderFiles) {
                const success = await generatePreview(file);
                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            }
        }

        console.log(`\n🎉 Preview generation complete!`);
        console.log(`✅ Successfully generated: ${successCount} previews`);
        console.log(`❌ Failed: ${errorCount} previews`);
    } catch (error) {
        console.error("💥 Preview generation failed:", error.message);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { createSVGPreview, generatePreview, main };
