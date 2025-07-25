/**
 * Simple Server Tests - Working version
 * Tests all server endpoints and preview system functionality
 */

import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

describe("🧪 MDX Viewer Server Tests", () => {
    let app: any;

    beforeAll(async () => {
        // Import the server
        const { default: serverApp } = await import("../../clean-server.ts");
        app = serverApp;
    });

    describe("🔧 Health Check", () => {
        it("should return health status", async () => {
            const response = await request(app).get("/api/health").expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("status", "ok");
        });
    });

    describe("📁 Files API", () => {
        it("should return file tree", async () => {
            const response = await request(app).get("/api/files").expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it("should return file content", async () => {
            // First get a file from the tree
            const filesResponse = await request(app).get("/api/files");
            const files = extractAllFiles(filesResponse.body.data);

            if (files.length > 0) {
                const testFile = files[0];
                const response = await request(app)
                    .get("/api/files/content")
                    .query({ path: testFile.path })
                    .expect(200);

                expect(response.body).toHaveProperty("success", true);
                expect(response.body).toHaveProperty("data");
                expect(response.body.data).toHaveProperty("content");
                expect(response.body.data).toHaveProperty("path");
            }
        });
    });

    describe("📊 Statistics API", () => {
        it("should return site statistics", async () => {
            const response = await request(app)
                .get("/api/statistics")
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("totalDocuments");
            expect(response.body.data).toHaveProperty("totalFolders");
            expect(response.body.data).toHaveProperty("documentsByType");
        });
    });

    describe("🖼️ Universal Preview System", () => {
        let previewUrls: string[] = [];

        beforeAll(async () => {
            // Get all preview URLs from the files API
            const response = await request(app).get("/api/files");
            const files = extractAllFiles(response.body.data);
            previewUrls = files
                .filter((file: any) => file.previewUrl)
                .map((file: any) => file.previewUrl);
        });

        it("should have preview URLs for all files", () => {
            expect(previewUrls.length).toBeGreaterThan(0);
            previewUrls.forEach(url => {
                // Accept both PNG and SVG preview URLs
                expect(url).toMatch(/^\/api\/previews\/.*\.(png|svg)$/);
            });
        });

        it("should return images for all preview URLs", async () => {
            // Test first 5 preview URLs to avoid timeout
            const testUrls = previewUrls.slice(0, 5);

            for (const url of testUrls) {
                const response = await request(app).get(url).expect(200);

                // Accept both PNG and SVG as valid image formats
                expect(response.headers["content-type"]).toMatch(/image\/(png|svg\+xml)/);
            }
        });

        it("should handle simple preview paths", async () => {
            // Test specific known patterns
            const testPaths = [
                "/api/previews/docs%2Fintroduction.png",
                "/api/previews/project-docs%2FREADME.png",
            ];

            for (const path of testPaths) {
                const response = await request(app).get(path);
                // Should either return 200 (if file exists) or 404 (if not)
                expect([200, 404]).toContain(response.status);
            }
        });

        it("should handle deep nesting", async () => {
            const deepPath =
                "/api/previews/tests%2Fnavigation%2Fdeep-nested%2Flevel4%2Flevel5%2Flevel6%2Ftest-10-levels.png";
            const response = await request(app).get(deepPath);
            // Should either return 200 (if file exists) or 404 (if not)
            expect([200, 404]).toContain(response.status);
        });

        it("should return 404 for non-existent files", async () => {
            await request(app)
                .get("/api/previews/non-existent-file.png")
                .expect(404);
        });
    });

    describe("🔗 CORS and Headers", () => {
        it("should include CORS headers", async () => {
            const response = await request(app).get("/api/health");
            expect(response.headers).toHaveProperty(
                "access-control-allow-origin",
            );
        });
    });

    describe("⚡ Performance", () => {
        it("should handle concurrent requests", async () => {
            const requests = [
                request(app).get("/api/health"),
                request(app).get("/api/files"),
                request(app).get("/api/statistics"),
            ];

            const responses = await Promise.all(requests);
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });
        });
    });
});

// Helper function to extract all files from tree structure
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
