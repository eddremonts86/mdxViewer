/**
 * Server Constants
 * Centralized configuration constants for the MDX Viewer backend
 */

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration constants
const DEFAULT_PORT = 3001;
const MAX_PORT_NUMBER = 65535;
const DEFAULT_MAX_FOLDER_DEPTH = 10;
const MAX_FOLDER_DEPTH_LIMIT = 20;
const BYTES_PER_KILOBYTE = 1024;

// Environment validation.
// API_PORT wins over PORT: in development the client and the file service run
// side by side and both would otherwise read the same inherited PORT. A
// production host that only injects PORT still works.
const PORT_VALUE = process.env.API_PORT ?? process.env.PORT;
const PORT = PORT_VALUE ? parseInt(PORT_VALUE, 10) : DEFAULT_PORT;
const MAX_FOLDER_DEPTH = process.env.MAX_FOLDER_DEPTH
    ? parseInt(process.env.MAX_FOLDER_DEPTH, 10)
    : DEFAULT_MAX_FOLDER_DEPTH;
const FILE_SIZE_LIMIT_MB = process.env.FILE_SIZE_LIMIT_MB
    ? parseInt(process.env.FILE_SIZE_LIMIT_MB, 10)
    : DEFAULT_MAX_FOLDER_DEPTH;

// Validate environment values
if (isNaN(PORT) || PORT < 1 || PORT > MAX_PORT_NUMBER) {
    throw new Error(`Invalid API_PORT/PORT value: ${PORT_VALUE}. Must be a number between 1 and ${MAX_PORT_NUMBER}.`);
}

if (isNaN(MAX_FOLDER_DEPTH) || MAX_FOLDER_DEPTH < 1 || MAX_FOLDER_DEPTH > MAX_FOLDER_DEPTH_LIMIT) {
    throw new Error(
        `Invalid MAX_FOLDER_DEPTH value: ${process.env.MAX_FOLDER_DEPTH}. Must be a number between 1 and ${MAX_FOLDER_DEPTH_LIMIT}.`
    );
}

if (isNaN(FILE_SIZE_LIMIT_MB) || FILE_SIZE_LIMIT_MB < 1 || FILE_SIZE_LIMIT_MB > 100) {
    throw new Error(
        `Invalid FILE_SIZE_LIMIT_MB value: ${process.env.FILE_SIZE_LIMIT_MB}. Must be a number between 1 and 100.`
    );
}

// Server Configuration
export const SERVER_CONFIG = {
    PORT,
    // The folder this instance charts. A team installing MDXViewer points this
    // at documentation they already own; the bundled public/content is only the
    // default. Tests point it at a fixture so they never touch real documents.
    CONTENT_PATH: process.env.CONTENT_DIR
        ? path.resolve(process.env.CONTENT_DIR)
        : path.join(__dirname, "../../public/content"),
    MAX_FOLDER_DEPTH,
    /**
     * Whether `.mdx` documents are compiled and their components executed.
     *
     * Off unless the operator says otherwise, and that is the whole point. There
     * is no authentication on the upload endpoint, so with this on, anyone who
     * can reach the service can put JavaScript into every reader's session. It
     * is safe to turn on only where the content folder is trusted — a repository
     * the team controls, or a deployment behind the operator's own auth. The
     * client reads it from /api/health rather than deciding for itself.
     */
    MDX_EXECUTE: process.env.MDX_EXECUTE === "true",
    FILE_SIZE_LIMIT: FILE_SIZE_LIMIT_MB * BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE, // Convert MB to bytes
    JSON_LIMIT: "50mb",
    MAX_UPLOAD_FILES: 50,
    // Development runs the client on another port, so it is allowed by default.
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean),
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// File Configuration
export const FILE_CONFIG = {
    ALLOWED_MIME_TYPES: ["text/plain", "text/markdown", "application/octet-stream"],
    ALLOWED_EXTENSIONS: [".md", ".mdx", ".txt"],
    MAX_FILENAME_LENGTH: 255,
    INVALID_FILENAME_CHARS: /[<>:"|\\?*]/,
} as const;

// Date and Size Formatting
export const FORMAT_CONFIG = {
    SIZE_UNITS: ["B", "KB", "MB", "GB", "TB"],
    SIZE_BASE: 1024,
    SIZE_DECIMALS: 2,
    MONTHS: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ],
} as const;

// Text Formatting Replacements
export const TEXT_REPLACEMENTS = {
    Api: "API",
    Url: "URL",
    Http: "HTTP",
    Html: "HTML",
    Css: "CSS",
    Js: "JavaScript",
    Ts: "TypeScript",
    Mdx: "MDX",
    Md: "Markdown",
    Ui: "UI",
    Ux: "UX",
    Db: "Database",
    Id: "ID",
    Pdf: "PDF",
    Json: "JSON",
    Xml: "XML",
    Sql: "SQL",
} as const;

// API Response Messages
export const MESSAGES = {
    SERVER_HEALTHY: "Server is healthy",
    STATISTICS_GENERATED: "Statistics generated successfully",
    FILE_LIST_SUCCESS: "Found {count} items",
    FILE_CONTENT_READ: "File content read successfully",
    FILE_CREATED: "File {name} created successfully",
    FOLDER_CREATED: "Folder {name} created successfully",
    FILES_UPLOADED: "Uploaded {success}/{total} files successfully",
    FILES_DELETED: "Deleted {success}/{total} items successfully",
    ITEM_MOVED: "{name} moved successfully",
} as const;

// Error Messages
export const ERRORS = {
    FILE_PATH_REQUIRED: "File path is required",
    PATH_IS_DIRECTORY: "Path is a directory, not a file",
    FILE_NOT_FOUND: "File not found",
    MISSING_REQUIRED_FIELDS: "Missing required fields",
    FILE_NAME_REQUIRED: "File name is required",
    FILE_NAME_TOO_LONG: "File name is too long (max {max} characters)",
    INVALID_FILE_NAME_CHARS: "File name contains invalid characters",
    MAX_DEPTH_EXCEEDED: "Maximum folder depth exceeded. Limit is {limit} levels, attempted depth is {depth}",
    FILE_ALREADY_EXISTS: "File already exists: {name}",
    FOLDER_ALREADY_EXISTS: "Folder already exists: {name}",
    NO_FILES_PROVIDED: "No files provided",
    PATHS_ARRAY_REQUIRED: "Paths array is required",
    SOURCE_NOT_FOUND: "Source file/folder not found: {path}",
    TARGET_NOT_DIRECTORY: "Target is not a directory: {path}",
    TARGET_NOT_FOUND: "Target directory not found: {path}",
    ITEM_EXISTS_AT_TARGET: "Item already exists at target location: {name}",
    CANNOT_MOVE_INTO_SELF: "Cannot move a folder into itself or its subfolder",
    PREVIEW_NOT_FOUND: "Preview not found",
    PREVIEW_NOT_AVAILABLE: "Preview image is being generated or not available",
    ONLY_MARKDOWN_ALLOWED: "Only markdown, text files are allowed!",
    OUTSIDE_CONTENT: "Path is outside the content folder",
} as const;
