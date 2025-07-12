// ============================
// NUMERIC CONSTANTS
// ============================

// Base time units (milliseconds)
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const FIVE_MINUTES = 5;

// Base byte units
const BYTES_PER_KILOBYTE = 1024;

// Time intervals (milliseconds)
export const TIME_INTERVALS = {
    DEBOUNCE_DEFAULT: 300,
    RETRY_INTERVAL: FIVE_MINUTES * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND, // 5 minutes
    STATISTICS_REFRESH: SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND, // 1 minute
    SHORT_TIMEOUT: 200,
    MEDIUM_TIMEOUT: 800,
} as const;

// Retry and polling configuration
export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    INITIAL_RETRY_DELAY: FIVE_MINUTES, // 5 seconds
    INCREMENTAL_RETRY_DELAY: 10,
} as const;

// HTTP status codes
export const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// Percentage constants
export const PERCENTAGE = {
    FULL: 100,
    HIGH_THRESHOLD: 95,
    MEDIUM_THRESHOLD: 80,
} as const;

// File and content limits
export const FILE_LIMITS = {
    MAX_FILENAME_LENGTH: 255,
    MAX_FILE_SIZE_MB: FIVE_MINUTES,
    FILE_SIZE_BYTES_TO_MB: BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE,
} as const;

// UI Layout constants
export const LAYOUT = {
    DEFAULT_INDENT_MULTIPLIER: 1.5,
    DEFAULT_INDENT_OFFSET: 0.5,
    MIN_SPACING_UNIT: 8,
    MEDIUM_SPACING_UNIT: 16,
    UUID_LENGTH: 36,
    UUID_PART_LENGTH: 11,
} as const;

// Content and pagination
export const CONTENT_LIMITS = {
    MAX_RECENT_ITEMS: 3,
    MAX_POPULAR_ITEMS: 4,
    DEFAULT_PAGINATION_SIZE: 50,
    LARGE_PAGINATION_SIZE: 140,
    PROGRESS_CHUNK_SIZE: 16,
    HEADING_MAX_LEVEL: 9,
    TOC_H3_LEVEL: 3,
    TOC_H4_LEVEL: 4,
    TOC_H5_LEVEL: 5,
    TOC_H6_LEVEL: 6,
} as const;

// Animation and timing
export const ANIMATION = {
    PREVIEW_GENERATION_DELAY: 200,
    BATCH_PROCESSING_SIZE: 6,
    DEFAULT_CONCURRENT_OPERATIONS: 4,
} as const;

// Console and logging
export const LOGGING = {
    MAX_LOG_ENTRIES: 60,
} as const;
