/**
 * MDX Viewer Backend Server - Clean Working Version
 * Modular TypeScript server with organized endpoints
 */

import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Import configurations and types
import { SERVER_CONFIG } from "./constants/index.js";
// import { logRequest, logSuccess, serverLogger } from "./utils/logger.js";
// Import endpoint handlers
import {
    createFile,
    createFolder,
    deleteFiles,
    getFileContent,
    getFiles,
    getHealth,
    getPreview,
    getStatistics,
    moveFiles,
} from "./endpoints/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: SERVER_CONFIG.JSON_LIMIT }));

// Serve static files from public directory
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Logging middleware
app.use((req, _res, next) => {
    console.warn(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes - wrap async handlers for Express compatibility
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
app.post("/api/files/create", (req, res) => {
    createFile(req, res);
});
app.post("/api/folders/create", (req, res) => {
    createFolder(req, res);
});
// Temporarily disabled: file upload functionality (requires multer)
// app.post("/api/files/upload", upload.array("files"), (req, res) => {
//     uploadFiles(req, res);
// });
app.delete("/api/files", (req, res) => {
    deleteFiles(req, res);
});
app.post("/api/files/move", (req, res) => {
    moveFiles(req, res);
});
// Handle ALL preview paths - universal solution that works with any nesting level
// This catches URLs like /api/previews/docs%2Fapi-improvements.png or /api/previews/project-docs%2Ffeatures%2Ffile.png
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
        `🚀 MDX Viewer API Server running on http://localhost:${SERVER_CONFIG.PORT}`
    );
    console.warn(`📁 Content directory: ${SERVER_CONFIG.CONTENT_PATH}`);
    console.warn("\n📋 Available endpoints:");
    console.warn("  GET  /api/health           - Health check");
    console.warn("  GET  /api/statistics       - Get file statistics");
    console.warn("  GET  /api/files            - Get file tree");
    console.warn("  GET  /api/files/content    - Get file content");
    console.warn("  POST /api/files/create     - Create new file");
    console.warn("  POST /api/folders/create   - Create new folder");
    console.warn("  POST /api/files/upload     - Upload files");
    console.warn("  DELETE /api/files          - Delete files/folders");
    console.warn("  POST /api/files/move       - Move files/folders");
    console.warn("  GET  /api/previews/:filename - File preview");
});

// Handle graceful shutdown
process.on("SIGINT", () => {
    console.warn("\n👋 Shutting down MDX Viewer API Server...");
    process.exit(0);
});

export default app;
