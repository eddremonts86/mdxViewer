/**
 * Professional logging system for MDXViewer
 * Replaces console.log statements with structured logging
 */

export const LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: Record<string, unknown>;
    error?: Error;
}

export class Logger {
    private static instance: Logger;
    private logLevel: LogLevel = LogLevel.INFO;
    private logs: LogEntry[] = [];
    private readonly maxLogs = 1000;

    private constructor() {}

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    public error(message: string, error?: Error, context?: Record<string, unknown>): void {
        this.log(LogLevel.ERROR, message, context, error);
    }

    public warn(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, context);
    }

    public info(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, context);
    }

    public debug(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
        if (level > this.logLevel) {
            return;
        }

        const logEntry: LogEntry = {
            level,
            message,
            timestamp: new Date(),
            context,
            error,
        };

        this.logs.push(logEntry);
        this.trimLogs();

        // In development, still output to console for debugging
        if (process.env.NODE_ENV === "development") {
            this.outputToConsole(logEntry);
        }
    }

    private outputToConsole(entry: LogEntry): void {
        const timestamp = entry.timestamp.toISOString();
        const levelNames = ["ERROR", "WARN", "INFO", "DEBUG"];
        const levelStr = levelNames[entry.level] || "UNKNOWN";
        const prefix = `[${timestamp}] ${levelStr}:`;

        switch (entry.level) {
        case LogLevel.ERROR:
            console.error(prefix, entry.message, entry.context ?? "", entry.error ?? "");
            break;
        case LogLevel.WARN:
            console.warn(prefix, entry.message, entry.context ?? "");
            break;
        case LogLevel.INFO:
            console.warn(prefix, entry.message, entry.context ?? ""); // Use warn as info is not allowed
            break;
        case LogLevel.DEBUG:
            console.warn(prefix, entry.message, entry.context ?? ""); // Use warn as debug is not allowed
            break;
        }
    }

    private trimLogs(): void {
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    public getLogs(): LogEntry[] {
        return [...this.logs];
    }

    public getLogsByLevel(level: LogLevel): LogEntry[] {
        return this.logs.filter(log => log.level === level);
    }

    public clearLogs(): void {
        this.logs = [];
    }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Helper functions for common logging patterns
export const logOperation = (operation: string, context?: Record<string, unknown>) => {
    logger.info(`🔄 ${operation}`, context);
};

export const logSuccess = (operation: string, context?: Record<string, unknown>) => {
    logger.info(`✅ ${operation}`, context);
};

export const logError = (operation: string, error: Error, context?: Record<string, unknown>) => {
    logger.error(`❌ ${operation}`, error, context);
};

export const logWarning = (message: string, context?: Record<string, unknown>) => {
    logger.warn(`⚠️ ${message}`, context);
};
