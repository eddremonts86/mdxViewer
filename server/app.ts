/**
 * The MDX Viewer file service: routes, middleware and upload handling.
 *
 * This module builds the app and stops. Binding a port lives in start.ts, so a
 * test can drive the real app in process with supertest instead of needing a
 * server already listening on :3001 — which is what the old suite required and
 * why three of its four files failed.
 */

import cors from "cors";
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Only import the constants we need
import { ERRORS, FILE_CONFIG, SERVER_CONFIG } from "./constants/index.js";
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
    saveFileContent,
    uploadFiles,
} from "./endpoints/index.js";
import { resolveInsideContent, sanitizeUploadName } from "./utils/validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * Uploads land on disk directly, so both halves of the destination are checked
 * here: the folder is resolved inside the content root, and the name is reduced
 * to a single safe segment. Neither used to be — the folder came straight from
 * the request body and the name straight from the client.
 */
const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        const fullPath = resolveInsideContent(req.body?.path ?? "");
        if (!fullPath) {
            cb(new Error(ERRORS.OUTSIDE_CONTENT), "");
            return;
        }
        cb(null, fullPath);
    },
    filename: (_req, file, cb) => {
        const safeName = sanitizeUploadName(file.originalname);
        if (!safeName) {
            cb(new Error(`File name not allowed: ${file.originalname}`), "");
            return;
        }
        cb(null, safeName);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: SERVER_CONFIG.FILE_SIZE_LIMIT,
        files: SERVER_CONFIG.MAX_UPLOAD_FILES,
    },
    // The extension decides, not the declared mimetype: a browser will happily
    // label anything application/octet-stream.
    fileFilter: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const allowed: readonly string[] = FILE_CONFIG.ALLOWED_EXTENSIONS;
        if (allowed.includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error(`${ERRORS.ONLY_MARKDOWN_ALLOWED} Got: ${extension || "no extension"}`));
        }
    },
});

// Basic middleware.
// The API writes and deletes real files, so it does not answer every origin.
// ALLOWED_ORIGINS is a comma-separated list; unset means same-origin only,
// which is what the production build needs since it is served from here.
app.use(
    cors({
        origin: SERVER_CONFIG.ALLOWED_ORIGINS.length > 0 ? SERVER_CONFIG.ALLOWED_ORIGINS : false,
    })
);
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

app.put("/api/files/content", (req, res) => {
    saveFileContent(req, res);
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

/**
 * In production the built client is served from here, so the whole product is
 * one origin: `/api` resolves relatively with no CORS involved, and a deep link
 * like /document/docs/intro.md falls back to index.html instead of 404ing.
 *
 * This is what makes the product deployable at all — before it, the API lived
 * only on a developer's machine and the deployed client had nothing to talk to.
 */
const CLIENT_DIR = path.join(__dirname, "..", "dist");

if (process.env.NODE_ENV === "production") {
    app.use(express.static(CLIENT_DIR, { index: false, maxAge: "1y", immutable: true }));

    app.get(/^(?!\/api\/).*/, (req, res, next) => {
        // Anything that is not a document request is a genuine miss.
        if (req.method !== "GET") return next();
        res.sendFile(path.join(CLIENT_DIR, "index.html"), error => {
            if (error) next(error);
        });
    });
}

export default app;
