#!/usr/bin/env node

/**
 * Preview Watcher - Automatically generates previews when files change
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { generatePreview } from "./generate-all-previews.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, "..", "public", "content");
const PREVIEWS_DIR = path.join(__dirname, "..", "public", "previews");

// Configuration constants
const DEBOUNCE_DELAY_MS = 1000;

console.log("👀 Starting preview watcher...");
console.log("Watching:", CONTENT_DIR);
console.log("Previews:", PREVIEWS_DIR);

// Debounce function to avoid multiple rapid triggers
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate preview for a specific file
async function generatePreviewForFile(filePath) {
    try {
        const stats = await fs.promises.stat(filePath);
        if (!stats.isFile()) return;

        const fileName = path.basename(filePath);
        if (!fileName.endsWith(".md") && !fileName.endsWith(".mdx")) return;

        const relativePath = path.relative(CONTENT_DIR, filePath);
        const folder = path.dirname(relativePath);
        const normalizedFolder = folder === "." ? "root" : folder;

        const file = {
            name: fileName,
            path: filePath,
            relativePath,
            folder: normalizedFolder,
        };

        console.log(`🔄 File changed: ${relativePath}`);
        const success = await generatePreview(file);

        if (success) {
            console.log(`✅ Preview updated for: ${relativePath}`);
        } else {
            console.log(`❌ Failed to update preview for: ${relativePath}`);
        }
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error.message);
    }
}

// Debounced version to avoid too many rapid updates
const debouncedGeneratePreview = debounce(generatePreviewForFile, DEBOUNCE_DELAY_MS);

// Watch for changes recursively
function watchDirectory(dir) {
    try {
        fs.watch(dir, { recursive: true }, (eventType, filename) => {
            if (!filename) return;

            const fullPath = path.join(dir, filename);

            // Only process markdown files
            if (filename.endsWith(".md") || filename.endsWith(".mdx")) {
                console.log(`📁 File ${eventType}: ${filename}`);

                if (eventType === "change" || eventType === "rename") {
                    // Check if file exists (rename could be delete)
                    fs.access(fullPath, fs.constants.F_OK, err => {
                        if (!err) {
                            debouncedGeneratePreview(fullPath);
                        } else {
                            console.log(`🗑️  File deleted: ${filename}`);
                            // Optionally remove preview file
                            const previewPath = path.join(
                                PREVIEWS_DIR,
                                filename.replace(/\.(md|mdx)$/, ".svg"),
                            );
                            fs.unlink(previewPath, () => {
                                console.log(
                                    `🗑️  Preview deleted: ${previewPath}`,
                                );
                            });
                        }
                    });
                }
            }
        });

        console.log(`✅ Watching directory: ${dir}`);
    } catch (error) {
        console.error(`Error watching directory ${dir}:`, error.message);
    }
}

// Start watching
watchDirectory(CONTENT_DIR);

console.log("\n🎯 Preview watcher is running!");
console.log(
    "📝 Create or edit any .md or .mdx file to see automatic preview generation",
);
console.log("🛑 Press Ctrl+C to stop\n");

// Keep the process alive
process.on("SIGINT", () => {
    console.log("\n👋 Preview watcher shutting down...");
    process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", error => {
    console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
