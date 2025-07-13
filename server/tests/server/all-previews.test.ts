/**
 * Complete Preview Validation Test
 * Validates that ALL preview images in the system are accessible
 */

import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

describe("🖼️ ALL Previews Accessibility Test", () => {
    let app: any;
    let allPreviewUrls: string[] = [];

    beforeAll(async () => {
        // Import server
        const { default: serverApp } = await import("../../clean-server.ts");
        app = serverApp;

        // Get all files and their preview URLs
        const response = await request(app).get("/api/files");
        const files = extractAllFiles(response.body.tree);
        allPreviewUrls = files.map((file: any) => file.preview);

        console.log(`🔍 Found ${allPreviewUrls.length} preview URLs to test`);
    });

    it("TODAS las previews deben ser accesibles - ALL previews must be accessible", async () => {
        expect(allPreviewUrls.length).toBeGreaterThan(0);

        console.log("🧪 Testing ALL preview URLs for accessibility...");

        const results: Array<{
            url: string;
            status: number;
            success: boolean;
        }> = [];

        // Test each preview URL
        for (let i = 0; i < allPreviewUrls.length; i++) {
            const url = allPreviewUrls[i];

            try {
                const response = await request(app).get(url).timeout(5000);

                results.push({
                    url,
                    status: response.status,
                    success: response.status === 200,
                });

                // Progress indicator
                if ((i + 1) % 10 === 0) {
                    console.log(
                        `  ✅ Tested ${i + 1}/${allPreviewUrls.length} previews`,
                    );
                }
            } catch (error) {
                results.push({
                    url,
                    status: 0,
                    success: false,
                });
            }
        }

        // Analyze results
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log("\\n📊 COMPLETE PREVIEW TEST RESULTS:");
        console.log(`  ✅ Successful: ${successful.length}/${results.length}`);
        console.log(`  ❌ Failed: ${failed.length}/${results.length}`);
        console.log(
            `  📈 Success Rate: ${((successful.length / results.length) * 100).toFixed(2)}%`,
        );

        if (failed.length > 0) {
            console.log("\\n❌ Failed preview URLs:");
            failed.forEach(f => {
                console.log(`    ${f.url} - Status: ${f.status}`);
            });
        }

        // ASSERTION: ALL previews must be accessible
        expect(failed.length).toBe(0);
        expect(successful.length).toBe(allPreviewUrls.length);

        console.log(
            `\\n🎉 SUCCESS: ALL ${allPreviewUrls.length} previews are accessible!`,
        );
    });

    it("should validate nesting levels coverage", async () => {
        const nestingStats = new Map<number, number>();

        // Analyze nesting levels
        allPreviewUrls.forEach(url => {
            // Extract path from URL and count slashes
            const path = url.replace("/api/previews/", "").replace(".png", "");
            const decodedPath = decodeURIComponent(path);
            const levels = decodedPath.split("/").length;

            nestingStats.set(levels, (nestingStats.get(levels) || 0) + 1);
        });

        console.log("\\n🌳 NESTING LEVELS COVERAGE:");
        Array.from(nestingStats.entries())
            .sort(([a], [b]) => a - b)
            .forEach(([level, count]) => {
                console.log(
                    `    ${level} level${level > 1 ? "s" : ""}: ${count} files`,
                );
            });

        // Should have files at multiple nesting levels
        expect(nestingStats.size).toBeGreaterThan(1);

        // Should have deep nesting (at least 4+ levels)
        const deepFiles = Array.from(nestingStats.entries()).filter(
            ([level]) => level >= 4,
        );
        expect(deepFiles.length).toBeGreaterThan(0);
    });

    it("should test specific challenging cases", async () => {
        // Test some specific challenging preview URLs if they exist
        const challengingPatterns = [
            // Deep nesting
            "/api/previews/tests%2Fnavigation%2Fdeep-nested%2Flevel4%2Flevel5%2Flevel6%2Ftest-10-levels.png",
            // Double nesting
            "/api/previews/project-docs%2FREADME.png",
            "/api/previews/docs%2Fintroduction.png",
            // Triple nesting
            "/api/previews/project-docs%2Ffeatures%2Fdrag-and-drop-implementation.png",
        ];

        for (const pattern of challengingPatterns) {
            if (allPreviewUrls.includes(pattern)) {
                console.log(`🧪 Testing challenging pattern: ${pattern}`);

                const response = await request(app).get(pattern);
                expect(response.status).toBe(200);
                expect(response.headers["content-type"]).toMatch(/image\/png/);
            }
        }
    });

    it("should validate preview URL encoding", () => {
        // Check that URLs are properly formatted
        allPreviewUrls.forEach(url => {
            expect(url).toMatch(/^\/api\/previews\/.*\.png$/);

            // Should not contain unencoded spaces
            expect(url).not.toMatch(/ /);

            // Should not contain double slashes (except after protocol)
            expect(url).not.toMatch(/\/\//);
        });
    });
});

// Helper function to extract all files recursively
function extractAllFiles(items: any[]): any[] {
    let files: any[] = [];
    for (const item of items) {
        if (item.type === "file") {
            files.push(item);
        } else if (item.children) {
            files = files.concat(extractAllFiles(item.children));
        }
    }
    return files;
}
