/**
 * Server Constants
 * Centralized configuration constants for the MDX Viewer backend
 */

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server Configuration
export const SERVER_CONFIG = {
    PORT: 3001,
    CONTENT_PATH: path.join(__dirname, "../../public/content"),
    MAX_FOLDER_DEPTH: 10,
    FILE_SIZE_LIMIT: 10 * 1024 * 1024, // 10MB
    JSON_LIMIT: "50mb",
} as const;

// File Configuration
export const FILE_CONFIG = {
    ALLOWED_MIME_TYPES: [
        "text/plain",
        "text/markdown",
        "application/octet-stream",
    ],
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
    MAX_DEPTH_EXCEEDED:
        "Maximum folder depth exceeded. Limit is {limit} levels, attempted depth is {depth}",
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
} as const;
