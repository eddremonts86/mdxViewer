/**
 * Comprehensive Server Tests - Clean MDX Viewer Server
 * Tests all endpoints, preview system, and edge cases
 */

import express from "express";
import fs from "fs/promises";
import path from "path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Mock the module imports before importing the server
vi.mock("path", async () => {
    const actual = await vi.importActual("path");
    return {
        ...actual,
        join: vi.fn((...args) => actual.join(...args)),
    };
});

// Import server after mocking
const serverModulePath = "../server/clean-server.ts";

describe("🧪 Clean MDX Viewer Server - Complete Test Suite", () => {
    let app: express.Application;
    let testContentDir: string;

    beforeAll(async () => {
        // Setup test content directory
        testContentDir = path.join(
            process.cwd(),
            "tests",
            "fixtures",
            "content",
        );
        await fs.mkdir(testContentDir, { recursive: true });

        // Create test content structure
        await createTestContent();

        // Mock SERVER_CONFIG to use test directory
        vi.doMock("../server/constants/index.js", () => ({
            SERVER_CONFIG: {
                PORT: 3002, // Use different port for testing
                CONTENT_PATH: testContentDir,
                MAX_FOLDER_DEPTH: 10,
            },
        }));

        // Import app after mocking
        const { default: serverApp } = await import(serverModulePath);
        app = serverApp;
    });

    afterAll(async () => {
        // Clean up test content
        await fs.rm(testContentDir, { recursive: true, force: true });
        vi.restoreAllMocks();
    });

    async function createTestContent() {
        const testFiles = [
            // Root level
            {
                path: "test.md",
                content: "# Test Document\nRoot level content.",
            },
            { path: "readme.md", content: "# README\nProject documentation." },

            // Single level
            {
                path: "docs/introduction.md",
                content: "# Introduction\nGetting started guide.",
            },
            {
                path: "docs/api.md",
                content: "# API Reference\nAPI documentation.",
            },

            // Double level
            {
                path: "docs/guides/setup.md",
                content: "# Setup Guide\nInstallation instructions.",
            },
            {
                path: "project/features/auth.md",
                content: "# Authentication\nAuth system docs.",
            },

            // Triple level
            {
                path: "project/docs/api/endpoints.md",
                content: "# API Endpoints\nEndpoint reference.",
            },
            {
                path: "guides/advanced/performance/optimization.md",
                content: "# Performance\nOptimization guide.",
            },

            // Deep nesting (10 levels) - the extreme test
            {
                path: "tests/deep/nested/level4/level5/level6/level7/level8/level9/level10/deep-test.md",
                content: "# Deep Test\nDeep nesting test file.",
            },

            // Special characters in paths
            {
                path: "special/path with spaces/test.md",
                content: "# Spaces Test\nFile with spaces in path.",
            },
            {
                path: "special/special-chars/test@#$.md",
                content: "# Special Chars\nFile with special characters.",
            },

            // MDX files
            {
                path: "examples/component.mdx",
                content: "# Component Example\nMDX component showcase.",
            },
            {
                path: "guides/interactive/demo.mdx",
                content: "# Interactive Demo\nInteractive MDX content.",
            },
        ];

        for (const file of testFiles) {
            const fullPath = path.join(testContentDir, file.path);
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.writeFile(fullPath, file.content, "utf-8");
        }
    }

    describe("🔧 Health Check Endpoint", () => {
        it("should return server health status", async () => {
            const response = await request(app).get("/api/health").expect(200);

            expect(response.body).toEqual({
                status: "ok",
                timestamp: expect.any(String),
                uptime: expect.any(Number),
                service: "mdx-viewer-api",
            });
        });

        it("should include valid timestamp", async () => {
            const response = await request(app).get("/api/health");
            const timestamp = new Date(response.body.timestamp);
            expect(timestamp).toBeInstanceOf(Date);
            expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 10000); // Within last 10 seconds
        });
    });

    describe("📁 Files Endpoint", () => {
        it("should return file tree structure", async () => {
            const response = await request(app).get("/api/files").expect(200);

            expect(response.body).toHaveProperty("tree");
            expect(response.body).toHaveProperty("total");
            expect(Array.isArray(response.body.tree)).toBe(true);
            expect(typeof response.body.total).toBe("number");
        });

        it("should include preview URLs for all files", async () => {
            const response = await request(app).get("/api/files");

            const findFiles = (items: any[]): any[] => {
                let files: any[] = [];
                for (const item of items) {
                    if (item.type === "file") {
                        files.push(item);
                    } else if (item.children) {
                        files = files.concat(findFiles(item.children));
                    }
                }
                return files;
            };

            const files = findFiles(response.body.tree);
            expect(files.length).toBeGreaterThan(0);

            // Check that all files have preview URLs
            for (const file of files) {
                expect(file).toHaveProperty("preview");
                expect(file.preview).toMatch(/^\/api\/previews\/.*\.png$/);
            }
        });

        it("should handle empty directory gracefully", async () => {
            // Create temporary empty directory
            const emptyDir = path.join(testContentDir, "empty");
            await fs.mkdir(emptyDir, { recursive: true });

            const response = await request(app).get("/api/files");
            expect(response.status).toBe(200);

            // Clean up
            await fs.rmdir(emptyDir);
        });
    });

    describe("📄 File Content Endpoint", () => {
        it("should return file content for existing file", async () => {
            const response = await request(app)
                .get("/api/files/content")
                .query({ path: "test.md" })
                .expect(200);

            expect(response.body).toHaveProperty("content");
            expect(response.body.content).toContain("# Test Document");
            expect(response.body).toHaveProperty("path", "test.md");
        });

        it("should return 404 for non-existent file", async () => {
            await request(app)
                .get("/api/files/content")
                .query({ path: "non-existent.md" })
                .expect(404);
        });

        it("should handle file in nested directory", async () => {
            const response = await request(app)
                .get("/api/files/content")
                .query({ path: "docs/guides/setup.md" })
                .expect(200);

            expect(response.body.content).toContain("# Setup Guide");
        });

        it("should require path parameter", async () => {
            await request(app).get("/api/files/content").expect(400);
        });

        it("should handle special characters in path", async () => {
            const response = await request(app)
                .get("/api/files/content")
                .query({ path: "special/path with spaces/test.md" })
                .expect(200);

            expect(response.body.content).toContain("# Spaces Test");
        });
    });

    describe("📊 Statistics Endpoint", () => {
        it("should return comprehensive statistics", async () => {
            const response = await request(app)
                .get("/api/statistics")
                .expect(200);

            expect(response.body).toHaveProperty("totalDocuments");
            expect(response.body).toHaveProperty("totalFolders");
            expect(response.body).toHaveProperty("documentsByType");
            expect(response.body).toHaveProperty("documentsByFolder");
            expect(response.body).toHaveProperty("recentDocuments");
            expect(response.body).toHaveProperty("popularFolders");

            expect(typeof response.body.totalDocuments).toBe("number");
            expect(typeof response.body.totalFolders).toBe("number");
            expect(Array.isArray(response.body.recentDocuments)).toBe(true);
        });

        it("should count document types correctly", async () => {
            const response = await request(app).get("/api/statistics");

            expect(response.body.documentsByType).toHaveProperty("md");
            expect(response.body.documentsByType).toHaveProperty("mdx");
            expect(response.body.documentsByType.md).toBeGreaterThan(0);
            expect(response.body.documentsByType.mdx).toBeGreaterThan(0);
        });

        it("should include recent documents with metadata", async () => {
            const response = await request(app).get("/api/statistics");

            if (response.body.recentDocuments.length > 0) {
                const recent = response.body.recentDocuments[0];
                expect(recent).toHaveProperty("name");
                expect(recent).toHaveProperty("path");
                expect(recent).toHaveProperty("lastModified");
                expect(recent).toHaveProperty("preview");
            }
        });
    });

    describe("🖼️ Universal Preview System - Complete Coverage", () => {
        describe("Single Level Previews", () => {
            it("should handle root level files", async () => {
                await request(app)
                    .get("/api/previews/test.png")
                    .expect(200)
                    .expect("Content-Type", /image\/png/);
            });

            it("should handle URL-encoded root files", async () => {
                await request(app).get("/api/previews/readme.png").expect(200);
            });
        });

        describe("Double Level Previews", () => {
            it("should handle single nested directories", async () => {
                await request(app)
                    .get("/api/previews/docs%2Fintroduction.png")
                    .expect(200);
            });

            it("should handle without URL encoding", async () => {
                await request(app)
                    .get("/api/previews/docs/api.png")
                    .expect(200);
            });
        });

        describe("Triple Level Previews", () => {
            it("should handle double nested directories", async () => {
                await request(app)
                    .get("/api/previews/docs%2Fguides%2Fsetup.png")
                    .expect(200);
            });

            it("should handle different path combinations", async () => {
                await request(app)
                    .get("/api/previews/project%2Ffeatures%2Fauth.png")
                    .expect(200);
            });
        });

        describe("Quad Level Previews", () => {
            it("should handle triple nested directories", async () => {
                await request(app)
                    .get("/api/previews/project%2Fdocs%2Fapi%2Fendpoints.png")
                    .expect(200);
            });
        });

        describe("Deep Nesting Previews (5+ levels)", () => {
            it("should handle 5-level nesting", async () => {
                await request(app)
                    .get(
                        "/api/previews/guides%2Fadvanced%2Fperformance%2Foptimization.png",
                    )
                    .expect(200);
            });

            it("should handle extreme nesting (10 levels)", async () => {
                await request(app)
                    .get(
                        "/api/previews/tests%2Fdeep%2Fnested%2Flevel4%2Flevel5%2Flevel6%2Flevel7%2Flevel8%2Flevel9%2Flevel10%2Fdeep-test.png",
                    )
                    .expect(200);
            });
        });

        describe("Special Characters and Edge Cases", () => {
            it("should handle spaces in paths", async () => {
                await request(app)
                    .get(
                        "/api/previews/special%2Fpath%20with%20spaces%2Ftest.png",
                    )
                    .expect(200);
            });

            it("should handle special characters", async () => {
                await request(app)
                    .get(
                        "/api/previews/special%2Fspecial-chars%2Ftest%40%23%24.png",
                    )
                    .expect(200);
            });

            it("should handle MDX files", async () => {
                await request(app)
                    .get("/api/previews/examples%2Fcomponent.png")
                    .expect(200);
            });

            it("should handle mixed path separators", async () => {
                await request(app)
                    .get("/api/previews/guides/interactive/demo.png")
                    .expect(200);
            });
        });

        describe("Error Cases", () => {
            it("should return 404 for non-existent files", async () => {
                await request(app)
                    .get("/api/previews/non%2Fexistent%2Ffile.png")
                    .expect(404);
            });

            it("should handle malformed paths gracefully", async () => {
                await request(app)
                    .get("/api/previews/%2F%2F%2Finvalid.png")
                    .expect(404);
            });

            it("should handle empty path", async () => {
                await request(app).get("/api/previews/.png").expect(404);
            });

            it("should handle very long paths", async () => {
                const longPath = `${"a".repeat(1000)  }.png`;
                await request(app).get(`/api/previews/${longPath}`).expect(404);
            });
        });

        describe("Response Headers and Content", () => {
            it("should return correct content type for PNG", async () => {
                const response = await request(app)
                    .get("/api/previews/test.png")
                    .expect(200);

                expect(response.headers["content-type"]).toMatch(/image\/png/);
            });

            it("should include appropriate cache headers", async () => {
                const response = await request(app).get(
                    "/api/previews/test.png",
                );

                // Should have some form of caching header
                expect(
                    response.headers["cache-control"] ||
                        response.headers["etag"] ||
                        response.headers["last-modified"],
                ).toBeDefined();
            });

            it("should return binary content", async () => {
                const response = await request(app)
                    .get("/api/previews/test.png")
                    .expect(200);

                expect(Buffer.isBuffer(response.body)).toBe(true);
                expect(response.body.length).toBeGreaterThan(0);
            });
        });
    });

    describe("🔗 CORS and Security", () => {
        it("should include CORS headers", async () => {
            const response = await request(app).get("/api/health");

            expect(response.headers).toHaveProperty(
                "access-control-allow-origin",
            );
        });

        it("should handle OPTIONS requests", async () => {
            await request(app).options("/api/health").expect(204);
        });
    });

    describe("📝 Request Logging", () => {
        it("should log requests to console", async () => {
            const consoleSpy = vi
                .spyOn(console, "warn")
                .mockImplementation(() => {});

            await request(app).get("/api/health");

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringMatching(
                    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - GET \/api\/health/,
                ),
            );

            consoleSpy.mockRestore();
        });
    });

    describe("🌐 Static File Serving", () => {
        it("should serve static files from public directory", async () => {
            // Create a test static file
            const publicDir = path.join(process.cwd(), "public");
            const testFile = path.join(publicDir, "test-static.txt");

            await fs.mkdir(publicDir, { recursive: true });
            await fs.writeFile(testFile, "Static test content", "utf-8");

            await request(app)
                .get("/public/test-static.txt")
                .expect(200)
                .expect("Static test content");

            // Clean up
            await fs.unlink(testFile).catch(() => {});
        });
    });

    describe("⚡ Performance and Load Tests", () => {
        it("should handle multiple concurrent requests", async () => {
            const requests = Array(10)
                .fill(0)
                .map(() => request(app).get("/api/health"));

            const responses = await Promise.all(requests);

            responses.forEach(response => {
                expect(response.status).toBe(200);
            });
        });

        it("should handle rapid preview requests", async () => {
            const previewRequests = [
                "/api/previews/test.png",
                "/api/previews/docs%2Fintroduction.png",
                "/api/previews/docs%2Fguides%2Fsetup.png",
                "/api/previews/project%2Fdocs%2Fapi%2Fendpoints.png",
            ].map(url => request(app).get(url));

            const responses = await Promise.all(previewRequests);

            responses.forEach(response => {
                expect(response.status).toBe(200);
            });
        });
    });

    describe("🧪 Edge Cases and Robustness", () => {
        it("should handle request with query parameters", async () => {
            await request(app)
                .get("/api/previews/test.png?cache=false&timestamp=123456")
                .expect(200);
        });

        it("should handle case-sensitive paths", async () => {
            // Our system should be case-sensitive
            await request(app)
                .get("/api/previews/Test.png") // Capital T
                .expect(404);
        });

        it("should handle different file extensions", async () => {
            // All preview requests should end in .png regardless of source file
            await request(app)
                .get("/api/previews/examples%2Fcomponent.png") // MDX file -> PNG preview
                .expect(200);
        });

        it("should handle extremely deep nesting beyond normal limits", async () => {
            await request(app)
                .get(
                    "/api/previews/tests%2Fdeep%2Fnested%2Flevel4%2Flevel5%2Flevel6%2Flevel7%2Flevel8%2Flevel9%2Flevel10%2Fdeep-test.png",
                )
                .expect(200);
        });
    });
});
