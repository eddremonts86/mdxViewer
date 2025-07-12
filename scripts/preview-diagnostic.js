/**
 * Preview Diagnostic Tool
 * Tests all preview URLs and reports failures with detailed error analysis
 */

const API_BASE = "http://localhost:3001";

async function getAllFiles() {
    try {
        const response = await fetch(`${API_BASE}/api/files`);
        if (!response.ok) {
            throw new Error(`Failed to fetch files: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("❌ Failed to fetch file list:", error);
        throw error;
    }
}

function extractAllFilePaths(items, basePath = "") {
    const filePaths = [];

    for (const item of items) {
        const currentPath = basePath ? `${basePath}/${item.name}` : item.name;

        if (
            item.type === "file" &&
            (item.name.endsWith(".md") || item.name.endsWith(".mdx"))
        ) {
            filePaths.push(currentPath);
        }

        if (item.type === "folder" && item.children) {
            filePaths.push(...extractAllFilePaths(item.children, currentPath));
        }
    }

    return filePaths;
}

function generatePreviewUrl(filePath) {
    // Convert file.md to file.png and encode the path
    const previewPath = filePath.replace(/\.(md|mdx)$/, ".png");
    const encodedPath = encodeURIComponent(previewPath);
    return `/api/previews/${encodedPath}`;
}

async function testPreviewUrl(filePath) {
    const previewUrl = generatePreviewUrl(filePath);
    const fullUrl = `${API_BASE}${previewUrl}`;

    try {
        console.warn(`🔍 Testing: ${filePath} -> ${previewUrl}`);

        const response = await fetch(fullUrl, {
            method: "GET",
        });

        const contentType = response.headers.get("content-type") || "unknown";

        if (response.ok) {
            return {
                filePath,
                previewUrl,
                status: "success",
                statusCode: response.status,
                contentType,
            };
        }
        const errorText = await response.text();
        return {
            filePath,
            previewUrl,
            status: "failed",
            statusCode: response.status,
            error: errorText || `HTTP ${response.status}`,
            contentType,
        };
    } catch (error) {
        return {
            filePath,
            previewUrl,
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function analyzePreviews() {
    console.log("🚀 Starting Preview Diagnostic Tool...\n");

    try {
        // Step 1: Get all files
        console.log("📁 Fetching file list...");
        const files = await getAllFiles();
        const allFilePaths = extractAllFilePaths(files);

        console.log(`✅ Found ${allFilePaths.length} markdown files\n`);

        // Step 2: Test each preview
        console.log("🔍 Testing all preview URLs...\n");
        const results = [];

        for (const filePath of allFilePaths) {
            const result = await testPreviewUrl(filePath);
            results.push(result);

            // Show progress
            if (result.status === "success") {
                console.log(`✅ ${filePath}`);
            } else {
                console.log(
                    `❌ ${filePath} - ${result.error || "Unknown error"}`
                );
            }
        }

        return results;
    } catch (error) {
        console.error("💥 Diagnostic failed:", error);
        return [];
    }
}

function generateReport(results) {
    console.log("\n📊 DIAGNOSTIC RESULTS:");
    console.log("=".repeat(60));

    const successful = results.filter(r => r.status === "success");
    const failed = results.filter(r => r.status === "failed");

    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);

    if (failed.length > 0) {
        console.log("\n🔍 FAILED PREVIEWS ANALYSIS:");
        console.log("-".repeat(40));

        // Group failures by error type
        const errorGroups = {};

        for (const failure of failed) {
            const errorKey =
                failure.error || `HTTP ${failure.statusCode}` || "Unknown";
            if (!errorGroups[errorKey]) {
                errorGroups[errorKey] = [];
            }
            errorGroups[errorKey].push(failure);
        }

        for (const [errorType, failures] of Object.entries(errorGroups)) {
            console.log(
                `\n🚨 Error: "${errorType}" (${failures.length} files)`
            );
            failures.forEach(f => {
                console.log(`   📄 ${f.filePath}`);
                console.log(`   🔗 ${f.previewUrl}`);
            });
        }

        // Analyze common patterns
        const deepPaths = failed.filter(f => f.filePath.split("/").length > 3);
        const encodingIssues = failed.filter(
            f =>
                f.filePath.includes(" ") ||
                f.filePath.includes("ñ") ||
                /[áéíóúü]/.test(f.filePath)
        );
        const specialChars = failed.filter(f =>
            /[^a-zA-Z0-9/\-_.]/.test(f.filePath)
        );

        console.log("\n🔧 PATTERN ANALYSIS:");
        console.log("-".repeat(20));

        if (deepPaths.length > 0) {
            console.log(`📂 Deep nesting issues: ${deepPaths.length} files`);
        }

        if (encodingIssues.length > 0) {
            console.log(`🔤 Encoding issues: ${encodingIssues.length} files`);
        }

        if (specialChars.length > 0) {
            console.log(`🔣 Special characters: ${specialChars.length} files`);
        }
    }

    console.log("\n🎯 RECOMMENDATIONS:");
    console.log("-".repeat(20));

    if (failed.length === 0) {
        console.log("🎉 All previews working perfectly! No action needed.");
    } else {
        console.log("1. Check server logs for detailed error messages");
        console.log(
            "2. Test the universal route handler with problematic paths"
        );
        console.log("3. Verify URL encoding/decoding logic");
        console.log("4. Ensure preview image generation is working");
    }

    return { successful, failed };
}

// Main execution
async function runDiagnostic() {
    const results = await analyzePreviews();
    return generateReport(results);
}

// Run the diagnostic
runDiagnostic().catch(console.error);
