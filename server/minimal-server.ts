/**
 * Minimal server for testing path-to-regexp issues
 */

import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Import configurations and types
import { SERVER_CONFIG } from "./constants/index.js";
// Import endpoint handlers
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

// Simple logging
app.use((req, _res, next) => {
    console.warn(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Basic API Routes
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

// Handle ALL preview paths - universal solution
// This will catch any URL like /api/previews/anything/at/any/depth.png
app.use("/api/previews", (req, res, _next) => {
    // Extract the full path after /api/previews/
    const requestPath = req.url.startsWith("/") ? req.url.slice(1) : req.url;

    // Decode URL encoding (%2F -> /, etc.)
    const decodedPath = decodeURIComponent(requestPath);

    // Remove query parameters if any
    const [cleanPath] = decodedPath.split("?");

    console.warn(`🔍 Preview request: ${req.url} -> decoded: ${cleanPath}`);

    // Set the filename parameter for the getPreview handler
    req.params = { filename: cleanPath };

    // Call the preview handler
    getPreview(req, res);
});

// Start server
app.listen(SERVER_CONFIG.PORT, () => {
    console.warn(
        `🚀 Minimal MDX Viewer Server running on http://localhost:${SERVER_CONFIG.PORT}`
    );
    console.warn(`📁 Content directory: ${SERVER_CONFIG.CONTENT_PATH}`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
    console.warn("\n👋 Shutting down server...");
    process.exit(0);
});

export default app;
