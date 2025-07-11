/**
 * MDX Viewer Backend Server - Clean Working Version
 * Modular TypeScript server with organized endpoints
 */

import cors from "cors";
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Import configurations and types
import { FILE_CONFIG, SERVER_CONFIG } from "./constants/index.js";

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
    uploadFiles,
} from "./endpoints/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: SERVER_CONFIG.JSON_LIMIT }));

// Serve static files from public directory
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = req.body.path
            ? path.join(SERVER_CONFIG.CONTENT_PATH, req.body.path)
            : SERVER_CONFIG.CONTENT_PATH;
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        if (
            (FILE_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(
                file.mimetype
            ) ||
            (FILE_CONFIG.ALLOWED_EXTENSIONS as readonly string[]).includes(ext)
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only markdown, text files are allowed!"));
        }
    },
    limits: {
        fileSize: SERVER_CONFIG.FILE_SIZE_LIMIT,
    },
});

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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
app.post("/api/files/upload", upload.array("files"), (req, res) => {
    uploadFiles(req, res);
});
app.delete("/api/files", (req, res) => {
    deleteFiles(req, res);
});
app.post("/api/files/move", (req, res) => {
    moveFiles(req, res);
});
// Handle preview paths with support for up to 10 levels of nesting
// Start with the deepest paths first to ensure proper matching
app.get(
    "/api/previews/:l1/:l2/:l3/:l4/:l5/:l6/:l7/:l8/:l9/:l10",
    (req, res) => {
        const { l1, l2, l3, l4, l5, l6, l7, l8, l9, l10 } = req.params;
        (req.params as any).filename =
            `${l1}/${l2}/${l3}/${l4}/${l5}/${l6}/${l7}/${l8}/${l9}/${l10}`;
        getPreview(req, res);
    }
);

app.get("/api/previews/:l1/:l2/:l3/:l4/:l5/:l6/:l7/:l8/:l9", (req, res) => {
    const { l1, l2, l3, l4, l5, l6, l7, l8, l9 } = req.params;
    (req.params as any).filename =
        `${l1}/${l2}/${l3}/${l4}/${l5}/${l6}/${l7}/${l8}/${l9}`;
    getPreview(req, res);
});

app.get("/api/previews/:l1/:l2/:l3/:l4/:l5/:l6/:l7/:l8", (req, res) => {
    const { l1, l2, l3, l4, l5, l6, l7, l8 } = req.params;
    (req.params as any).filename =
        `${l1}/${l2}/${l3}/${l4}/${l5}/${l6}/${l7}/${l8}`;
    getPreview(req, res);
});

app.get("/api/previews/:l1/:l2/:l3/:l4/:l5/:l6/:l7", (req, res) => {
    const { l1, l2, l3, l4, l5, l6, l7 } = req.params;
    (req.params as any).filename = `${l1}/${l2}/${l3}/${l4}/${l5}/${l6}/${l7}`;
    getPreview(req, res);
});

app.get("/api/previews/:l1/:l2/:l3/:l4/:l5/:l6", (req, res) => {
    const { l1, l2, l3, l4, l5, l6 } = req.params;
    (req.params as any).filename = `${l1}/${l2}/${l3}/${l4}/${l5}/${l6}`;
    getPreview(req, res);
});

app.get("/api/previews/:l1/:l2/:l3/:l4/:l5", (req, res) => {
    const { l1, l2, l3, l4, l5 } = req.params;
    (req.params as any).filename = `${l1}/${l2}/${l3}/${l4}/${l5}`;
    getPreview(req, res);
});

app.get("/api/previews/:l1/:l2/:l3/:l4", (req, res) => {
    const { l1, l2, l3, l4 } = req.params;
    (req.params as any).filename = `${l1}/${l2}/${l3}/${l4}`;
    getPreview(req, res);
});

app.get("/api/previews/:l1/:l2/:l3", (req, res) => {
    const { l1, l2, l3 } = req.params;
    (req.params as any).filename = `${l1}/${l2}/${l3}`;
    getPreview(req, res);
});

app.get("/api/previews/:l1/:l2", (req, res) => {
    const { l1, l2 } = req.params;
    (req.params as any).filename = `${l1}/${l2}`;
    getPreview(req, res);
});

app.get("/api/previews/:l1", (req, res) => {
    getPreview(req, res);
});

// Start server
app.listen(SERVER_CONFIG.PORT, () => {
    console.log(
        `🚀 MDX Viewer API Server running on http://localhost:${SERVER_CONFIG.PORT}`
    );
    console.log(`📁 Content directory: ${SERVER_CONFIG.CONTENT_PATH}`);
    console.log("\n📋 Available endpoints:");
    console.log("  GET  /api/health           - Health check");
    console.log("  GET  /api/statistics       - Get file statistics");
    console.log("  GET  /api/files            - Get file tree");
    console.log("  GET  /api/files/content    - Get file content");
    console.log("  POST /api/files/create     - Create new file");
    console.log("  POST /api/folders/create   - Create new folder");
    console.log("  POST /api/files/upload     - Upload files");
    console.log("  DELETE /api/files          - Delete files/folders");
    console.log("  POST /api/files/move       - Move files/folders");
    console.log("  GET  /api/previews/:filename - File preview");
});

// Handle graceful shutdown
process.on("SIGINT", () => {
    console.log("\n👋 Shutting down MDX Viewer API Server...");
    process.exit(0);
});

export default app;
