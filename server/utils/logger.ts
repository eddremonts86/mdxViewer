/**
 * Professional logging system for MDXViewer Server
 * Server-side logging utility
 */

export const LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

interface LogContext {
    [key: string]: unknown;
}

export class ServerLogger {
    private static instance: ServerLogger;
    private logLevel: LogLevel = LogLevel.INFO;

    private constructor() {}

    public static getInstance(): ServerLogger {
        if (!ServerLogger.instance) {
            ServerLogger.instance = new ServerLogger();
        }
        return ServerLogger.instance;
    }

    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    public error(message: string, error?: Error, context?: LogContext): void {
        if (this.logLevel >= LogLevel.ERROR) {
            const timestamp = new Date().toISOString();
            console.error(
                `[${timestamp}] ERROR: ${message}`,
                context ?? {},
                error ?? "",
            );
        }
    }

    public warn(message: string, context?: LogContext): void {
        if (this.logLevel >= LogLevel.WARN) {
            const timestamp = new Date().toISOString();
            console.warn(`[${timestamp}] WARN: ${message}`, context ?? {});
        }
    }

    public info(message: string, context?: LogContext): void {
        if (this.logLevel >= LogLevel.INFO) {
            const timestamp = new Date().toISOString();
            console.warn(`[${timestamp}] INFO: ${message}`, context ?? {}); // Using warn since info is restricted
        }
    }

    public debug(message: string, context?: LogContext): void {
        if (this.logLevel >= LogLevel.DEBUG) {
            const timestamp = new Date().toISOString();
            console.warn(`[${timestamp}] DEBUG: ${message}`, context ?? {}); // Using warn since debug is restricted
        }
    }
}

// Export singleton instance
export const serverLogger = ServerLogger.getInstance();

// Helper functions for common server logging patterns
export const logOperation = (operation: string, context?: LogContext): void => {
    serverLogger.info(`🔄 ${operation}`, context);
};

export const logSuccess = (operation: string, context?: LogContext): void => {
    serverLogger.info(`✅ ${operation}`, context);
};

export const logServerError = (
    operation: string,
    error: Error,
    context?: LogContext,
): void => {
    serverLogger.error(`❌ ${operation}`, error, context);
};

export const logRequest = (method: string, path: string): void => {
    serverLogger.info(`${method} ${path}`);
};
