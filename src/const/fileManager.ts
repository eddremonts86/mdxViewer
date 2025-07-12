/**
 * File Manager Constants
 * Constants for file management operations
 */

import { FILE_LIMITS, PERCENTAGE } from "./constants";

// File types
export const FILE_TYPES = {
    MARKDOWN: "md",
    MDX: "mdx",
} as const;

export const SUPPORTED_EXTENSIONS = [FILE_TYPES.MARKDOWN, FILE_TYPES.MDX];

// File operation types
export const OPERATION_TYPES = {
    CREATE: "create",
    DELETE: "delete",
    RENAME: "rename",
    MOVE: "move",
    COPY: "copy",
} as const;

// Operation statuses
export const OPERATION_STATUS = {
    PENDING: "pending",
    IN_PROGRESS: "in-progress",
    COMPLETED: "completed",
    FAILED: "failed",
} as const;

// Batch operation statuses
export const BATCH_STATUS = {
    PENDING: "pending",
    IN_PROGRESS: "in-progress",
    COMPLETED: "completed",
    FAILED: "failed",
} as const;

// File validation
export const FILE_VALIDATION = {
    MAX_NAME_LENGTH: 255,
    RESERVED_NAMES: [
        "CON",
        "PRN",
        "AUX",
        "NUL",
        "COM1",
        "COM2",
        "COM3",
        "COM4",
        "COM5",
        "COM6",
        "COM7",
        "COM8",
        "COM9",
        "LPT1",
        "LPT2",
        "LPT3",
        "LPT4",
        "LPT5",
        "LPT6",
        "LPT7",
        "LPT8",
        "LPT9",
    ],
    INVALID_CHARS_REGEX: /[<>:"|\\?*]/,
    FOLDER_INVALID_CHARS_REGEX: /[<>:"/\\|?*]/,
} as const;

// Default content templates
export const DEFAULT_TEMPLATES = {
    MD: (name: string) =>
        `# ${name}\n\nStart writing your markdown content here.\n`,
    MDX: (name: string) =>
        `---\ntitle: "${name}"\ndescription: "Description for this MDX file"\n---\n\n# ${name}\n\nStart writing your MDX content here.\n\n<div className="note">\n  This is an example MDX component.\n</div>\n`,
} as const;

// UI Messages
export const MESSAGES = {
    FILE_CREATED: "File created successfully",
    FOLDER_CREATED: "Folder created successfully",
    ITEM_DELETED: "Item deleted successfully",
    BATCH_DELETE_SUCCESS: "Items deleted successfully",
    OPERATION_FAILED: "Operation failed",
    VALIDATION_REQUIRED: "Name is required",
    VALIDATION_TOO_LONG: "Name is too long (max 255 characters)",
    VALIDATION_INVALID_CHARS: "Name contains invalid characters",
    VALIDATION_RESERVED: "Name is reserved",
    VALIDATION_INVALID_FOLDER: "Invalid folder name",
} as const;

// File manager limits
export const LIMITS = {
    MAX_BATCH_SIZE: PERCENTAGE.FULL,
    MAX_FILE_SIZE:
        FILE_LIMITS.FILE_SIZE_BYTES_TO_MB * FILE_LIMITS.MAX_FILE_SIZE_MB, // 5MB
    OPERATION_TIMEOUT: 30000, // 30 seconds
} as const;
