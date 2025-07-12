/**
 * Manual Preview Validation Script
 * Tests ALL previews are accessible using Node.js fetch
 */

const { readdir, stat } = require("fs/promises");
const { join } = require("path");

const BASE_URL = "http://localhost:3001";
const CONTENT_DIR = join(process.cwd(), "public", "content");

console.log("🧪 Starting Complete Preview Validation...");
console.log(`📁 Content directory: ${CONTENT_DIR}`);
console.log(`🌐 Server URL: ${BASE_URL}`);

async function getAllMarkdownFiles(dir, basePath = "") {
    const files = [];

    try {
        const entries = await readdir(dir);

        for (const entry of entries) {
            const fullPath = join(dir, entry);
            const relativePath = basePath ? `${basePath}/${entry}` : entry;

            try {
                const stats = await stat(fullPath);

                if (stats.isDirectory()) {
                    const subFiles = await getAllMarkdownFiles(
                        fullPath,
                        relativePath
                    );
                    files.push(...subFiles);
                } else if (entry.match(/\.(md|mdx)$/i)) {
                    files.push(relativePath);
                }
            } catch (error) {
                console.warn(
                    `⚠️  Error processing ${fullPath}:`,
                    error.message
                );
            }
        }
    } catch (error) {
        console.error(`❌ Error reading directory ${dir}:`, error.message);
    }

    return files;
}

function filePathToPreviewUrl(filePath) {
    // Convert file path to preview URL with proper encoding
    const encodedPath = filePath.replace(/\//g, "%2F");
    const pngPath = encodedPath.replace(/\.(md|mdx)$/i, ".png");
    return `/api/previews/${pngPath}`;
}

async function testPreviewUrl(url) {
    try {
        const fullUrl = `${BASE_URL}${url}`;
        const response = await fetch(fullUrl);

        return {
            success: response.ok,
            status: response.status,
        };
    } catch (error) {
        return {
            success: false,
            status: 0,
            error: error.message,
        };
    }
}

async function validateAllPreviews() {
    console.log("🔍 Discovering all markdown files...");

    const markdownFiles = await getAllMarkdownFiles(CONTENT_DIR);
    console.log(`📄 Found ${markdownFiles.length} markdown files`);

    if (markdownFiles.length === 0) {
        console.log("⚠️  No markdown files found to test");
        return;
    }

    // Show some examples
    console.log("\\n📝 Sample files:");
    markdownFiles.slice(0, 5).forEach(file => {
        console.log(`  ${file}`);
    });
    if (markdownFiles.length > 5) {
        console.log(`  ... and ${markdownFiles.length - 5} more`);
    }

    console.log("\\n🖼️ Converting to preview URLs...");
    const previewUrls = markdownFiles.map(file => ({
        file,
        url: filePathToPreviewUrl(file),
    }));

    // Show URL examples
    console.log("\\n🔗 Sample preview URLs:");
    previewUrls.slice(0, 3).forEach(({ file, url }) => {
        console.log(`  ${file} -> ${url}`);
    });

    console.log(`\\n🧪 Testing ${previewUrls.length} preview URLs...`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < previewUrls.length; i++) {
        const { file, url } = previewUrls[i];

        const result = await testPreviewUrl(url);
        results.push({ file, url, ...result });

        if (result.success) {
            successCount++;
        } else {
            errorCount++;
            console.log(
                `❌ FAILED: ${file} -> ${url} (Status: ${result.status})`
            );
        }

        // Progress indicator
        if ((i + 1) % 10 === 0 || i === previewUrls.length - 1) {
            console.log(
                `  📊 Progress: ${i + 1}/${previewUrls.length} (✅ ${successCount}, ❌ ${errorCount})`
            );
        }
    }

    // Final results
    console.log("\\n📊 FINAL RESULTS:");
    console.log(`  📄 Total files tested: ${previewUrls.length}`);
    console.log(`  ✅ Successful previews: ${successCount}`);
    console.log(`  ❌ Failed previews: ${errorCount}`);
    console.log(
        `  📈 Success rate: ${((successCount / previewUrls.length) * 100).toFixed(2)}%`
    );

    // Analyze nesting levels
    console.log("\\n🌳 NESTING LEVEL ANALYSIS:");
    const nestingStats = new Map();

    results.forEach(({ file, success }) => {
        const levels = file.split("/").length;
        if (!nestingStats.has(levels)) {
            nestingStats.set(levels, { total: 0, success: 0 });
        }
        nestingStats.get(levels).total++;
        if (success) {
            nestingStats.get(levels).success++;
        }
    });

    Array.from(nestingStats.entries())
        .sort(([a], [b]) => a - b)
        .forEach(([level, stats]) => {
            const rate = ((stats.success / stats.total) * 100).toFixed(1);
            console.log(
                `  Level ${level}: ${stats.success}/${stats.total} (${rate}%)`
            );
        });

    if (errorCount === 0) {
        console.log("\\n🎉 SUCCESS: ALL PREVIEWS ARE ACCESSIBLE!");
        console.log("\\n✅ The universal preview system is working perfectly!");
        console.log("✅ All nesting levels are supported!");
        console.log("✅ URL encoding is handled correctly!");

        // Success exit
        process.exit(0);
    } else {
        console.log("\\n❌ SOME PREVIEWS FAILED!");
        console.log("\\nFailed URLs:");
        results
            .filter(r => !r.success)
            .forEach(r => {
                console.log(`  ${r.file} -> ${r.url} (${r.status})`);
            });

        // Failure exit
        process.exit(1);
    }
}

// Run the validation
validateAllPreviews().catch(error => {
    console.error("💥 Validation failed with error:", error);
    process.exit(1);
});
