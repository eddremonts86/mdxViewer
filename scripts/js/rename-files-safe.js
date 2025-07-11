#!/usr/bin/env node

/**
 * Rename all files and folders to use safe URL-friendly names
 * Replaces spaces with underscores and removes special characters
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, "..", "..", "public", "content");
const PREVIEWS_DIR = path.join(__dirname, "..", "..", "public", "previews");

// Sanitize filename to be URL-safe
function sanitizeFilename(filename) {
    return filename
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9._-]/g, "") // Remove special characters except dots, underscores, and hyphens
        .replace(/_+/g, "_") // Replace multiple underscores with single
        .replace(/(^_+)|(_+$)/g, ""); // Remove leading/trailing underscores
}

// Get all files and directories recursively
async function getAllFiles(dir, basePath = "") {
    const items = [];

    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = basePath
                ? `${basePath}/${entry.name}`
                : entry.name;

            if (entry.isDirectory()) {
                items.push({
                    type: "directory",
                    name: entry.name,
                    path: fullPath,
                    relativePath: relativePath,
                    parent: dir,
                });

                // Recursively get files from subdirectory
                const subItems = await getAllFiles(fullPath, relativePath);
                items.push(...subItems);
            } else if (entry.isFile()) {
                items.push({
                    type: "file",
                    name: entry.name,
                    path: fullPath,
                    relativePath: relativePath,
                    parent: dir,
                });
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
    }

    return items;
}

// Rename a single item (file or directory)
async function renameItem(item) {
    const sanitizedName = sanitizeFilename(item.name);

    if (sanitizedName === item.name) {
        // No changes needed
        return { renamed: false, oldName: item.name, newName: sanitizedName };
    }

    const newPath = path.join(item.parent, sanitizedName);

    try {
        // Check if target already exists
        try {
            await fs.access(newPath);
            console.log(
                `⚠️  Target already exists, skipping: ${item.name} -> ${sanitizedName}`
            );
            return {
                renamed: false,
                oldName: item.name,
                newName: sanitizedName,
                error: "Target exists",
            };
        } catch {
            // Target doesn't exist, safe to rename
        }

        await fs.rename(item.path, newPath);
        console.log(`✅ Renamed: ${item.name} -> ${sanitizedName}`);
        return { renamed: true, oldName: item.name, newName: sanitizedName };
    } catch (error) {
        console.error(`❌ Failed to rename ${item.name}:`, error.message);
        return {
            renamed: false,
            oldName: item.name,
            newName: sanitizedName,
            error: error.message,
        };
    }
}

// Process directory and rename items
async function processDirectory(dirPath, dirName) {
    console.log(`\n📂 Processing ${dirName}...`);

    if (
        !(await fs
            .access(dirPath)
            .then(() => true)
            .catch(() => false))
    ) {
        console.log(`⚠️  Directory not found: ${dirPath}`);
        return { processed: 0, renamed: 0, errors: 0 };
    }

    const items = await getAllFiles(dirPath);
    console.log(`📄 Found ${items.length} items`);

    let processed = 0;
    let renamed = 0;
    let errors = 0;

    // Sort items by depth (deepest first) to avoid path conflicts
    items.sort((a, b) => {
        const depthA = a.relativePath.split("/").length;
        const depthB = b.relativePath.split("/").length;
        return depthB - depthA;
    });

    for (const item of items) {
        const result = await renameItem(item);
        processed++;

        if (result.renamed) {
            renamed++;
        } else if (result.error) {
            errors++;
        }
    }

    return { processed, renamed, errors };
}

// Main function
async function main() {
    console.log("🚀 Starting file rename process...");
    console.log(
        "This will rename files to use URL-safe names (spaces -> underscores)"
    );

    let totalProcessed = 0;
    let totalRenamed = 0;
    let totalErrors = 0;

    // Process content directory
    const contentResults = await processDirectory(CONTENT_DIR, "content");
    totalProcessed += contentResults.processed;
    totalRenamed += contentResults.renamed;
    totalErrors += contentResults.errors;

    // Process previews directory
    const previewResults = await processDirectory(PREVIEWS_DIR, "previews");
    totalProcessed += previewResults.processed;
    totalRenamed += previewResults.renamed;
    totalErrors += previewResults.errors;

    console.log(`\n🎉 File rename complete!`);
    console.log(`📄 Total items processed: ${totalProcessed}`);
    console.log(`✅ Successfully renamed: ${totalRenamed}`);
    console.log(`❌ Errors: ${totalErrors}`);

    if (totalRenamed > 0) {
        console.log(`\n⚠️  Important: After renaming files, you should:`);
        console.log(`1. Regenerate previews: npm run generate:previews`);
        console.log(`2. Update any hardcoded file references in your code`);
        console.log(`3. Check that the frontend still works correctly`);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error("💥 Script failed:", error.message);
        process.exit(1);
    });
}

export { main, processDirectory, sanitizeFilename };
