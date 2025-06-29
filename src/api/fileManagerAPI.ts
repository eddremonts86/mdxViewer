/**
 * File Manager API
 * Backend operations for file and folder management
 */

import type {
    BatchOperationResult,
    CreateFileParams,
    CreateFolderParams,
    DeleteFileParams,
    DeleteItemParams,
    FileOperation,
    OperationResult,
} from "@/types/fileManager";
import { FileManagerUtils } from "@/utils/fileManagerUtils";
import { promises as fs } from "fs";
import path from "path";

export class FileManagerAPI {
    private static readonly contentPath =
        "/Volumes/Developer/Projects/mdxViewer/public/content";

    /**
     * Create a new file
     */
    static async createFile(
        params: CreateFileParams
    ): Promise<OperationResult> {
        const operation: FileOperation = {
            id: FileManagerUtils.generateOperationId(),
            type: "create",
            path: params.path,
            status: "pending",
            isFolder: false,
            createdAt: new Date(),
        };

        try {
            // Validate file name
            const validation = FileManagerUtils.validateFileName(params.name);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Build full path
            const fileName = `${params.name}.${params.type}`;
            const fullPath = path.join(this.contentPath, params.path, fileName);
            const relativePath = path.join(params.path, fileName);

            // Check if file already exists
            try {
                await fs.access(fullPath);
                throw new Error(`File already exists: ${fileName}`);
            } catch (error) {
                // File doesn't exist, which is good
                if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                    throw error;
                }
            }

            // Create directory if it doesn't exist
            const dirPath = path.dirname(fullPath);
            await fs.mkdir(dirPath, { recursive: true });

            // Generate content
            const content =
                params.content ||
                FileManagerUtils.getDefaultContent(
                    `${params.name}.${params.type}`
                );

            // Write file
            await fs.writeFile(fullPath, content, "utf8");

            operation.status = "completed";
            console.log(`✅ File created: ${relativePath}`);

            return {
                success: true,
                path: relativePath,
                operation,
            };
        } catch (error) {
            operation.status = "failed";
            operation.error =
                error instanceof Error ? error.message : "Unknown error";

            console.error(`❌ Failed to create file: ${params.name}`, error);

            return {
                success: false,
                path: params.path,
                error: operation.error,
                operation,
            };
        }
    }

    /**
     * Create a new folder
     */
    static async createFolder(
        params: CreateFolderParams
    ): Promise<OperationResult> {
        const operation: FileOperation = {
            id: FileManagerUtils.generateOperationId(),
            type: "create",
            path: params.path,
            status: "pending",
            isFolder: true,
            createdAt: new Date(),
        };

        try {
            // Validate folder name
            const validation = FileManagerUtils.validateFolderName(params.name);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Build full path
            const fullPath = path.join(
                this.contentPath,
                params.path,
                params.name
            );
            const relativePath = path.join(params.path, params.name);

            // Check if folder already exists
            try {
                const stats = await fs.stat(fullPath);
                if (stats.isDirectory()) {
                    throw new Error(`Folder already exists: ${params.name}`);
                }
            } catch (error) {
                // Folder doesn't exist, which is good
                if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                    throw error;
                }
            }

            // Create folder
            await fs.mkdir(fullPath, { recursive: true });

            operation.status = "completed";
            console.log(`✅ Folder created: ${relativePath}`);

            return {
                success: true,
                path: relativePath,
                operation,
            };
        } catch (error) {
            operation.status = "failed";
            operation.error =
                error instanceof Error ? error.message : "Unknown error";

            console.error(`❌ Failed to create folder: ${params.name}`, error);

            return {
                success: false,
                path: params.path,
                error: operation.error,
                operation,
            };
        }
    }

    /**
     * Delete a file or folder
     */
    static async deleteItem(
        params: DeleteItemParams
    ): Promise<OperationResult> {
        const operation: FileOperation = {
            id: FileManagerUtils.generateOperationId(),
            type: "delete",
            path: params.path,
            status: "pending",
            isFolder: params.isFolder,
            createdAt: new Date(),
        };

        try {
            const fullPath = path.join(this.contentPath, params.path);

            // Check if item exists
            try {
                await fs.access(fullPath);
            } catch {
                throw new Error(`Item not found: ${params.path}`);
            }

            // Delete item
            if (params.isFolder) {
                await fs.rmdir(fullPath, { recursive: true });
            } else {
                await fs.unlink(fullPath);
            }

            operation.status = "completed";
            console.log(
                `✅ ${params.isFolder ? "Folder" : "File"} deleted: ${
                    params.path
                }`
            );

            return {
                success: true,
                path: params.path,
                operation,
            };
        } catch (error) {
            operation.status = "failed";
            operation.error =
                error instanceof Error ? error.message : "Unknown error";

            console.error(
                `❌ Failed to delete ${params.isFolder ? "folder" : "file"}: ${
                    params.path
                }`,
                error
            );

            return {
                success: false,
                path: params.path,
                error: operation.error,
                operation,
            };
        }
    }

    /**
     * Batch delete multiple items
     */
    static async batchDelete(
        params: DeleteFileParams
    ): Promise<BatchOperationResult> {
        const results: OperationResult[] = [];
        const errors: string[] = [];

        console.log(`🗑️ Starting batch delete of ${params.paths.length} items`);

        for (const itemPath of params.paths) {
            try {
                // Determine if item is a folder
                const fullPath = path.join(this.contentPath, itemPath);
                let isFolder = false;

                try {
                    const stats = await fs.stat(fullPath);
                    isFolder = stats.isDirectory();
                } catch {
                    // Item doesn't exist, try to guess from path (no extension = folder)
                    isFolder = !path.extname(itemPath);
                }

                const result = await this.deleteItem({
                    path: itemPath,
                    isFolder,
                });

                results.push(result);

                if (!result.success && result.error) {
                    errors.push(`${itemPath}: ${result.error}`);
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                errors.push(`${itemPath}: ${errorMessage}`);

                results.push({
                    success: false,
                    path: itemPath,
                    error: errorMessage,
                    operation: {
                        id: FileManagerUtils.generateOperationId(),
                        type: "delete",
                        path: itemPath,
                        status: "failed",
                        isFolder: !path.extname(itemPath), // Simple heuristic: no extension = folder
                        error: errorMessage,
                        createdAt: new Date(),
                    },
                });
            }
        }

        const successCount = results.filter((r) => r.success).length;
        const totalCount = results.length;

        console.log(
            `✅ Batch delete completed: ${successCount}/${totalCount} successful`
        );

        return {
            success: errors.length === 0,
            results,
            errors,
            totalProcessed: totalCount,
        };
    }

    /**
     * Check if a path exists
     */
    static async pathExists(relativePath: string): Promise<boolean> {
        try {
            const fullPath = path.join(this.contentPath, relativePath);
            await fs.access(fullPath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get item stats
     */
    static async getItemStats(relativePath: string): Promise<{
        exists: boolean;
        isFolder: boolean;
        size?: number;
        modified?: Date;
    }> {
        try {
            const fullPath = path.join(this.contentPath, relativePath);
            const stats = await fs.stat(fullPath);

            return {
                exists: true,
                isFolder: stats.isDirectory(),
                size: stats.size,
                modified: stats.mtime,
            };
        } catch {
            return {
                exists: false,
                isFolder: false,
            };
        }
    }

    /**
     * List directory contents
     */
    static async listDirectory(relativePath: string): Promise<string[]> {
        try {
            const fullPath = path.join(this.contentPath, relativePath);
            const items = await fs.readdir(fullPath);
            return items.sort((a, b) => a.localeCompare(b));
        } catch (error) {
            console.error(`Error listing directory ${relativePath}:`, error);
            return [];
        }
    }
}
