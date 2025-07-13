/**
 * File Manager Utilities
 * Utilities for file and folder management operations
 */

import type { BatchOperation, FileMetadata, FileOperation } from "@/types/fileManager";

// Use path-browserify for browser compatibility
const path = {
    basename: (_path: string, ext?: string) => {
        const base = path.split("/").pop() ?? "";
        return ext ? base.replace(ext, "") : base;
    },
    dirname: (_path: string) => {
        const parts = path.split("/");
        return parts.slice(0, -1).join("/") || ".";
    },
    extname: (_path: string) => {
        const base = path.split("/").pop() ?? "";
        const dotIndex = base.lastIndexOf(".");
        return dotIndex > 0 ? base.substring(dotIndex) : "";
    },
};

export class FileManagerUtils {
    /**
     * Generate a unique operation ID
     */
    static generateOperationId(): string {
        return `op_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * Generate a unique batch operation ID
     */
    static generateBatchId(): string {
        return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * Validate file name
     */
    static validateFileName(_name: string): {
        isValid: boolean;
        error?: string;
    } {
        if (!name) {
            return { isValid: false, error: "File name is required" };
        }

        if (name.length > 255) {
            return {
                isValid: false,
                error: "File name is too long (max 255 characters)",
            };
        }

        const invalidChars = /[<>:"|\\?*]/;
        if (invalidChars.test(name)) {
            return {
                isValid: false,
                error: "File name contains invalid characters",
            };
        }

        if (name.startsWith(".") || name.endsWith(".")) {
            return {
                isValid: false,
                error: "File name cannot start or end with a dot",
            };
        }

        const reservedNames = [
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
        ];
        if (reservedNames.includes(name.toUpperCase())) {
            return { isValid: false, error: "File name is reserved" };
        }

        return { isValid: true };
    }

    /**
     * Validate folder name
     */
    static validateFolderName(_name: string): {
        isValid: boolean;
        error?: string;
    } {
        if (!name) {
            return { isValid: false, error: "Folder name is required" };
        }

        if (name.length > 255) {
            return {
                isValid: false,
                error: "Folder name is too long (max 255 characters)",
            };
        }

        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(name)) {
            return {
                isValid: false,
                error: "Folder name contains invalid characters",
            };
        }

        if (name === "." || name === "..") {
            return {
                isValid: false,
                error: "Invalid folder name",
            };
        }

        return { isValid: true };
    }

    /**
     * Normalize file path
     */
    static normalizePath(_path: string): string {
        return path.replace(/\\/g, "/").replace(/\/+/g, "/");
    }

    /**
     * Get file extension
     */
    static getFileExtension(filename: string): string {
        const lastDot = filename.lastIndexOf(".");
        return lastDot === -1 ? "" : filename.substring(lastDot + 1);
    }

    /**
     * Check if file is supported MDX/Markdown
     */
    static isSupportedFile(filename: string): boolean {
        const ext = this.getFileExtension(filename).toLowerCase();
        return ["md", "mdx"].includes(ext);
    }

    /**
     * Get default content for different file types
     */
    static getDefaultContent(filename: string): string {
        const ext = this.getFileExtension(filename).toLowerCase();
        const baseName = filename.replace(/\.[^/.]+$/, "");

        switch (ext) {
        case "md":
            return `# ${baseName}\n\nStart writing your markdown content here.\n`;
        case "mdx":
            return `---\ntitle: "${baseName}"\ndescription: "Description for this MDX file"\n---\n\n# ${baseName}\n\nStart writing your MDX content here.\n\n<div className="note">\n  This is an example MDX component.\n</div>\n`;
        default:
            return "";
        }
    }

    /**
     * Create a new file operation
     */
    static createFileOperation(
        type: "create" | "delete",
        path: string,
        metadata?: Partial<FileMetadata>,
    ): FileOperation {
        return {
            id: this.generateOperationId(),
            type,
            path: this.normalizePath(path),
            status: "pending",
            createdAt: new Date(),
            metadata,
        };
    }

    /**
     * Create a new folder operation
     */
    static createFolderOperation(type: "create" | "delete", path: string): FileOperation {
        return {
            id: this.generateOperationId(),
            type,
            path: this.normalizePath(path),
            status: "pending",
            createdAt: new Date(),
            isFolder: true,
        };
    }

    /**
     * Create a batch operation
     */
    static createBatchOperation(operations: FileOperation[], description?: string): BatchOperation {
        return {
            id: this.generateBatchId(),
            operations,
            status: "pending",
            createdAt: new Date(),
            description,
        };
    }

    /**
     * Simulate file creation (for development)
     */
    static async simulateCreateFile(_path: string, content = ""): Promise<{ success: boolean; error?: string }> {
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log(`[Simulated] Creating file: ${path}`, {
                content: `${content.substring(0, 100)}...`,
            });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Simulate folder creation (for development)
     */
    static async simulateCreateFolder(_path: string): Promise<{ success: boolean; error?: string }> {
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log(`[Simulated] Creating folder: ${path}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Simulate file deletion (for development)
     */
    static async simulateDeleteFile(_path: string): Promise<{ success: boolean; error?: string }> {
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log(`[Simulated] Deleting file: ${path}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Simulate folder deletion (for development)
     */
    static async simulateDeleteFolder(_path: string): Promise<{ success: boolean; error?: string }> {
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log(`[Simulated] Deleting folder: ${path}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Execute a single file operation
     */
    static async executeFileOperation(operation: FileOperation): Promise<FileOperation> {
        const updatedOperation = {
            ...operation,
            status: "in-progress" as const,
        };

        try {
            let result: { success: boolean; error?: string };

            if (operation.isFolder) {
                if (operation.type === "create") {
                    result = await this.createFolderReal(operation.path);
                } else {
                    result = await this.deleteFolderReal(operation.path);
                }
            } else if (operation.type === "create") {
                const content = operation.metadata?.content ?? "";
                result = await this.createFileReal(operation.path, content);
            } else {
                result = await this.deleteFileReal(operation.path);
            }

            return {
                ...updatedOperation,
                status: result.success ? "completed" : "failed",
                error: result.error,
                completedAt: new Date(),
            };
        } catch (error) {
            return {
                ...updatedOperation,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
                completedAt: new Date(),
            };
        }
    }

    /**
     * Execute a batch operation
     */
    static async executeBatchOperation(
        batch: BatchOperation,
        onProgress?: (_progress: { completed: number; total: number; currentOperation?: FileOperation }) => void,
    ): Promise<BatchOperation> {
        const updatedBatch = { ...batch, status: "in-progress" as const };
        const results: FileOperation[] = [];
        let completed = 0;

        for (const operation of batch.operations) {
            onProgress?.({
                completed,
                total: batch.operations.length,
                currentOperation: operation,
            });

            const result = await this.executeFileOperation(operation);
            results.push(result);
            completed++;

            onProgress?.({
                completed,
                total: batch.operations.length,
            });
        }

        const hasFailures = results.some(op => op.status === "failed");

        return {
            ...updatedBatch,
            operations: results,
            status: hasFailures ? "failed" : "completed",
            completedAt: new Date(),
        };
    }

    /**
     * Real file creation using File System Access API or server API
     */
    static async createFileReal(filePath: string, content = ""): Promise<{ success: boolean; error?: string }> {
        try {
            // Parse the file path to extract name, type, and directory
            const fileName = path.basename(filePath);
            const directory = path.dirname(filePath);
            const fileExt = path.extname(fileName).slice(1); // Remove the dot
            const baseName = path.basename(fileName, path.extname(fileName));

            // In a browser environment, we'll use the File Manager API
            const response = await fetch("http://localhost:3001/api/files/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: baseName,
                    type: fileExt || "md", // Default to md if no extension
                    path: directory === "." ? "" : directory,
                    content,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error ?? "Failed to create file");
            }

            console.log(`✅ File created: ${filePath}`);
            return { success: true };
        } catch (error) {
            console.error(`❌ Failed to create file: ${filePath}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Real folder creation using File System Access API or server API
     */
    static async createFolderReal(folderPath: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Parse the folder path to extract name and directory
            const folderName = path.basename(folderPath);
            const directory = path.dirname(folderPath);

            // In a browser environment, we'll use the File Manager API
            const response = await fetch("http://localhost:3001/api/folders/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: folderName,
                    path: directory === "." ? "" : directory,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error ?? "Failed to create folder");
            }

            console.log(`✅ Folder created: ${folderPath}`);
            return { success: true };
        } catch (error) {
            console.error(`❌ Failed to create folder: ${folderPath}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Real file deletion using File System Access API or server API
     */
    static async deleteFileReal(_path: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch("http://localhost:3001/api/files/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    paths: [path],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error ?? "Failed to delete file");
            }

            console.log(`✅ File deleted: ${path}`);
            return { success: true };
        } catch (error) {
            console.error(`❌ Failed to delete file: ${path}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Real folder deletion using File System Access API or server API
     */
    static async deleteFolderReal(_path: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch("http://localhost:3001/api/folders/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    paths: [path],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error ?? "Failed to delete folder");
            }

            console.log(`✅ Folder deleted: ${path}`);
            return { success: true };
        } catch (error) {
            console.error(`❌ Failed to delete folder: ${path}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}
