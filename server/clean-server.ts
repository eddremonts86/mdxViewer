/**
 * Clean MDX Viewer Server - Fixed Preview System
 * Universal preview handling for all nesting levels
 */

import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Only import the constants we need
import { SERVER_CONFIG } from "./constants/index.js";
// Import only the essential endpoints
import {
    getFileContent,
    getFiles,
    getHealth,
    getPreview,
    getStatistics,
} from "./endpoints/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve static files
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Logging middleware
app.use((req, _res, next) => {
    console.warn(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Essential API Routes
app.get("/api/health", (req, res) => {
    getHealth(req, res);
});

app.get("/api/statistics", (req, res) => {
    getStatistics(req, res);
});

app.get("/api/files", (req, res) => {
    getFiles(req, res);
});

app.get("/api/files/content", (req, res) => {
    getFileContent(req, res);
});

// 🎯 UNIVERSAL PREVIEW SOLUTION - Handles ALL nesting levels and URL encoding
app.use("/api/previews", (req, res, _next) => {
    // Extract the full path after /api/previews/
    const requestPath = req.url.startsWith("/") ? req.url.slice(1) : req.url;

    // Decode URL encoding (%2F -> /, %20 -> space, etc.)
    const decodedPath = decodeURIComponent(requestPath);

    // Remove query parameters if any
    const [cleanPath] = decodedPath.split("?");

    console.warn(`🔍 Preview: ${req.url} -> ${cleanPath}`);

    // Set the filename parameter for the getPreview handler
    req.params = { filename: cleanPath };

    // Call the preview handler
    getPreview(req, res);
});

// Start server
app.listen(SERVER_CONFIG.PORT, () => {
    console.warn(
        `🚀 Clean MDX Viewer Server running on http://localhost:${SERVER_CONFIG.PORT}`
    );
    console.warn(`📁 Content directory: ${SERVER_CONFIG.CONTENT_PATH}`);
    console.warn("\n🎯 Features enabled:");
    console.warn("  ✅ Universal preview system (all nesting levels)");
    console.warn("  ✅ File browsing and content reading");
    console.warn("  ✅ Statistics generation");
    console.warn("  ✅ Health monitoring");
    console.warn("\n📋 Available endpoints:");
    console.warn("  GET  /api/health           - Health check");
    console.warn("  GET  /api/statistics       - Site statistics");
    console.warn("  GET  /api/files            - File tree");
    console.warn("  GET  /api/files/content    - File content");
    console.warn(
        "  GET  /api/previews/**      - Universal previews (any depth)"
    );
});

// Handle graceful shutdown
process.on("SIGINT", () => {
    console.warn("\n👋 Shutting down Clean MDX Viewer Server...");
    process.exit(0);
});

export default app;
