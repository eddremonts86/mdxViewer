#!/usr/bin/env node

/**
 * Test script to verify the preview system is working correctly
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, "..", "public", "content");
const PREVIEWS_DIR = path.join(__dirname, "..", "public", "previews");

async function testPreviewSystem() {
    console.log("🧪 Testing Preview System...\n");

    // Get all markdown files
    const allFiles = [];

    async function scanDirectory(dir, basePath = "") {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = basePath
                ? `${basePath}/${entry.name}`
                : entry.name;

            if (entry.isDirectory()) {
                await scanDirectory(fullPath, relativePath);
            } else if (
                entry.isFile() &&
                (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
            ) {
                allFiles.push({
                    name: entry.name,
                    path: fullPath,
                    relativePath,
                    folder: basePath || "root",
                });
            }
        }
    }

    await scanDirectory(CONTENT_DIR);

    console.log(`📄 Found ${allFiles.length} markdown files`);

    // Check if corresponding previews exist
    let previewsFound = 0;
    let previewsMissing = 0;

    for (const file of allFiles) {
        const previewName = file.name.replace(/\.(md|mdx)$/, ".svg");
        const previewPath = path.join(PREVIEWS_DIR, file.folder, previewName);

        try {
            await fs.access(previewPath);
            previewsFound++;
            console.log(
                `✅ ${file.relativePath} -> ${file.folder}/${previewName}`,
            );
        } catch {
            previewsMissing++;
            console.log(
                `❌ ${file.relativePath} -> MISSING ${file.folder}/${previewName}`,
            );
        }
    }

    console.log("\n📊 Summary:");
    console.log(`   📄 Total markdown files: ${allFiles.length}`);
    console.log(`   ✅ Previews found: ${previewsFound}`);
    console.log(`   ❌ Previews missing: ${previewsMissing}`);

    if (previewsMissing === 0) {
        console.log(
            "\n🎉 All previews are available! The system is working correctly.",
        );

        // Test URL generation
        console.log("\n🔗 Sample preview URLs:");
        allFiles.slice(0, 5).forEach(file => {
            const previewUrl = `/api/previews/${file.relativePath.replace(/\.(md|mdx)$/, ".png")}`;
            console.log(`   ${file.relativePath} -> ${previewUrl}`);
        });
    } else {
        console.log(
            "\n⚠️  Some previews are missing. Run 'npm run generate:all-previews' to fix this.",
        );
    }
}

testPreviewSystem().catch(console.error);
