/**
 * Clean MDX Viewer Server - Fixed Preview System
 * Universal preview handling for all nesting levels
 */

import cors from "cors";
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Only import the constants we need
import { SERVER_CONFIG } from "./constants/index.js";
// Import all endpoints including file management
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
    uploadFiles,
} from "./endpoints/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const targetPath = req.body.path || "";
        const fullPath = path.join(SERVER_CONFIG.CONTENT_PATH, targetPath);
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        // Use original filename
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: SERVER_CONFIG.FILE_SIZE_LIMIT,
    },
    fileFilter: (req, file, cb) => {
        // Allow common text and markdown files
        const allowedTypes = [
            'text/plain',
            'text/markdown',
            'application/octet-stream', // For .md files that might be detected as this
        ];
        
        const allowedExtensions = ['.md', '.mdx', '.txt', '.json'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error(`File type not allowed: ${file.mimetype}. Allowed types: ${allowedExtensions.join(', ')}`));
        }
    },
});

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

// File Management Routes
app.post("/api/files/create", (req, res) => {
    createFile(req, res);
});

app.post("/api/folders/create", (req, res) => {
    createFolder(req, res);
});

app.post("/api/files/upload", upload.array("files"), (req, res) => {
    uploadFiles(req, res);
});

app.delete("/api/files", (req, res) => {
    deleteFiles(req, res);
});

app.post("/api/files/move", (req, res) => {
    moveFiles(req, res);
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
        `🚀 Clean MDX Viewer Server running on http://localhost:${SERVER_CONFIG.PORT}`,
    );
    console.warn(`📁 Content directory: ${SERVER_CONFIG.CONTENT_PATH}`);
    console.warn("\n🎯 Features enabled:");
    console.warn("  ✅ Universal preview system (all nesting levels)");
    console.warn("  ✅ File browsing and content reading");
    console.warn("  ✅ File management (create, upload, delete, move)");
    console.warn("  ✅ Statistics generation");
    console.warn("  ✅ Health monitoring");
    console.warn("\n📋 Available endpoints:");
    console.warn("  GET    /api/health           - Health check");
    console.warn("  GET    /api/statistics       - Site statistics");
    console.warn("  GET    /api/files            - File tree");
    console.warn("  GET    /api/files/content    - File content");
    console.warn("  POST   /api/files/create     - Create new file");
    console.warn("  POST   /api/folders/create   - Create new folder");
    console.warn("  POST   /api/files/upload     - Upload files");
    console.warn("  DELETE /api/files            - Delete files/folders");
    console.warn("  POST   /api/files/move       - Move files/folders");
    console.warn(
        "  GET    /api/previews/**      - Universal previews (any depth)",
    );
});

// Handle graceful shutdown
process.on("SIGINT", () => {
    console.warn("\n👋 Shutting down Clean MDX Viewer Server...");
    process.exit(0);
});

export default app;
