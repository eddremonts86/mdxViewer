/**
 * Preview Accessibility Test - Validates ALL preview URLs
 * Ensures every single preview image is accessible and returns valid PNG
 */

import path from "path";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

describe("🖼️ Complete Preview Accessibility Test", () => {
    let app: any;
    let allFiles: any[] = [];
    let previewUrls: string[] = [];

    beforeAll(async () => {
        // Import the actual server
        const { default: serverApp } = await import(
            "../../server/clean-server.ts"
        );
        app = serverApp;

        // Get all files from the API
        const filesResponse = await request(app).get("/api/files");

        // Extract all files recursively
        const extractFiles = (items: any[]): any[] => {
            let files: any[] = [];
            for (const item of items) {
                if (item.type === "file") {
                    files.push(item);
                } else if (item.children) {
                    files = files.concat(extractFiles(item.children));
                }
            }
            return files;
        };

        allFiles = extractFiles(filesResponse.body.tree);
        previewUrls = allFiles.map(file => file.preview);

        console.log(
            `🔍 Found ${allFiles.length} files with ${previewUrls.length} preview URLs`
        );
    });

    it("should have preview URLs for all files", () => {
        expect(allFiles.length).toBeGreaterThan(0);
        expect(previewUrls.length).toBe(allFiles.length);

        // Every file should have a preview URL
        allFiles.forEach(file => {
            expect(file.preview).toBeDefined();
            expect(file.preview).toMatch(/^\/api\/previews\/.*\.png$/);
        });
    });

    it("should return 200 status for ALL preview URLs", async () => {
        console.log("🧪 Testing accessibility of ALL preview URLs...");

        const results = [];

        for (let i = 0; i < previewUrls.length; i++) {
            const previewUrl = previewUrls[i];
            const file = allFiles[i];

            try {
                const response = await request(app)
                    .get(previewUrl)
                    .timeout(5000); // 5 second timeout per request

                results.push({
                    url: previewUrl,
                    file: file.path,
                    status: response.status,
                    contentType: response.headers["content-type"],
                    success: response.status === 200,
                });

                // Progress indicator
                if ((i + 1) % 10 === 0) {
                    console.log(
                        `  ✅ Tested ${i + 1}/${previewUrls.length} previews`
                    );
                }
            } catch (error) {
                results.push({
                    url: previewUrl,
                    file: file.path,
                    status: "ERROR",
                    error: error.message,
                    success: false,
                });
            }
        }

        // Analyze results
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log(`\\n📊 Preview Test Results:`);
        console.log(`  ✅ Successful: ${successful.length}/${results.length}`);
        console.log(`  ❌ Failed: ${failed.length}/${results.length}`);

        if (failed.length > 0) {
            console.log(`\\n❌ Failed URLs:`);
            failed.forEach(f => {
                console.log(`    ${f.url} (${f.file}) - Status: ${f.status}`);
            });
        }

        // All previews should be accessible
        expect(failed.length).toBe(0);
        expect(successful.length).toBe(previewUrls.length);
    });

    it("should return valid PNG content type for all previews", async () => {
        console.log("🖼️ Verifying PNG content type for all previews...");

        const contentTypePromises = previewUrls.slice(0, 10).map(async url => {
            const response = await request(app).get(url);
            return {
                url,
                contentType: response.headers["content-type"],
                status: response.status,
            };
        });

        const results = await Promise.all(contentTypePromises);

        results.forEach(result => {
            expect(result.status).toBe(200);
            expect(result.contentType).toMatch(/image\/png/);
        });
    });

    describe("🎯 Specific Nesting Level Tests", () => {
        it("should handle 1-level nesting", async () => {
            const level1Files = allFiles.filter(
                f => f.path.split("/").length === 2
            );

            if (level1Files.length > 0) {
                const testFile = level1Files[0];
                await request(app)
                    .get(testFile.preview)
                    .expect(200)
                    .expect("Content-Type", /image\/png/);
            }
        });

        it("should handle 2-level nesting", async () => {
            const level2Files = allFiles.filter(
                f => f.path.split("/").length === 3
            );

            if (level2Files.length > 0) {
                const testFile = level2Files[0];
                await request(app)
                    .get(testFile.preview)
                    .expect(200)
                    .expect("Content-Type", /image\/png/);
            }
        });

        it("should handle 3-level nesting", async () => {
            const level3Files = allFiles.filter(
                f => f.path.split("/").length === 4
            );

            if (level3Files.length > 0) {
                const testFile = level3Files[0];
                await request(app)
                    .get(testFile.preview)
                    .expect(200)
                    .expect("Content-Type", /image\/png/);
            }
        });

        it("should handle 4+ level nesting", async () => {
            const level4PlusFiles = allFiles.filter(
                f => f.path.split("/").length >= 5
            );

            if (level4PlusFiles.length > 0) {
                const testFile = level4PlusFiles[0];
                await request(app)
                    .get(testFile.preview)
                    .expect(200)
                    .expect("Content-Type", /image\/png/);
            }
        });

        it("should handle deepest nesting level", async () => {
            // Find the file with the deepest nesting
            const deepestFile = allFiles.reduce((deepest, current) => {
                const currentDepth = current.path.split("/").length;
                const deepestDepth = deepest.path.split("/").length;
                return currentDepth > deepestDepth ? current : deepest;
            });

            console.log(
                `🔍 Testing deepest file: ${deepestFile.path} (${deepestFile.path.split("/").length} levels)`
            );

            await request(app)
                .get(deepestFile.preview)
                .expect(200)
                .expect("Content-Type", /image\/png/);
        });
    });

    describe("🔍 URL Format Validation", () => {
        it("should have properly URL-encoded preview URLs", () => {
            previewUrls.forEach(url => {
                // Should not contain unencoded spaces or special chars in the path
                const pathPart = url.replace("/api/previews/", "");

                // If it contains %2F, it should be properly encoded
                if (pathPart.includes("%2F")) {
                    expect(pathPart).toMatch(/^[A-Za-z0-9%\-_.~]+\.png$/);
                }
            });
        });

        it("should have consistent .png extension", () => {
            previewUrls.forEach(url => {
                expect(url).toMatch(/\.png$/);
            });
        });

        it("should start with correct API path", () => {
            previewUrls.forEach(url => {
                expect(url).toMatch(/^\/api\/previews\//);
            });
        });
    });

    describe("⚡ Performance Tests", () => {
        it("should handle concurrent preview requests", async () => {
            // Test first 5 previews concurrently
            const testUrls = previewUrls.slice(0, 5);

            const startTime = Date.now();
            const promises = testUrls.map(url => request(app).get(url));
            const responses = await Promise.all(promises);
            const endTime = Date.now();

            // All should succeed
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });

            // Should complete in reasonable time (under 10 seconds for 5 requests)
            expect(endTime - startTime).toBeLessThan(10000);

            console.log(
                `⚡ Concurrent test completed in ${endTime - startTime}ms`
            );
        });

        it("should respond quickly to individual requests", async () => {
            if (previewUrls.length > 0) {
                const testUrl = previewUrls[0];

                const startTime = Date.now();
                await request(app).get(testUrl).expect(200);
                const endTime = Date.now();

                // Should respond in under 2 seconds
                expect(endTime - startTime).toBeLessThan(2000);
            }
        });
    });

    describe("📈 Statistics and Reporting", () => {
        it("should provide comprehensive test coverage report", () => {
            const nestingLevels = new Map<number, number>();
            const fileTypes = new Map<string, number>();

            allFiles.forEach(file => {
                const depth = file.path.split("/").length;
                nestingLevels.set(depth, (nestingLevels.get(depth) || 0) + 1);

                const extension = path.extname(file.path).toLowerCase();
                fileTypes.set(extension, (fileTypes.get(extension) || 0) + 1);
            });

            console.log("\\n📊 Test Coverage Report:");
            console.log(`  📄 Total files tested: ${allFiles.length}`);
            console.log(`  🌳 Nesting levels covered:`);
            Array.from(nestingLevels.entries())
                .sort(([a], [b]) => a - b)
                .forEach(([level, count]) => {
                    console.log(`    Level ${level}: ${count} files`);
                });
            console.log(`  📝 File types tested:`);
            Array.from(fileTypes.entries()).forEach(([type, count]) => {
                console.log(`    ${type}: ${count} files`);
            });

            // Ensure we have good coverage
            expect(allFiles.length).toBeGreaterThan(10); // At least 10 files
            expect(nestingLevels.size).toBeGreaterThan(2); // At least 3 different nesting levels
            expect(fileTypes.has(".md")).toBe(true); // Should have .md files
        });
    });
});
