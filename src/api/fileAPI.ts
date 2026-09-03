/**
 * API functions for file management using TanStack Query
 */

export interface FileItem {
    name: string;
    originalName?: string;
    path: string;
    type: "file" | "folder";
    extension?: string;
    size?: number;
    sizeFormatted?: string;
    lastModified?: string;
    lastModifiedFormatted?: string;
    previewUrl?: string | null;
    children?: FileItem[];
    depth?: number; // Added depth tracking
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface CreateFileRequest {
    name: string;
    type: "md" | "mdx";
    path: string;
    content?: string;
}

export interface CreateFolderRequest {
    name: string;
    path: string;
}

/** Frontmatter the viewer knows how to put in a title block. */
export interface DocumentFrontmatter {
    title?: string;
    description?: string;
    author?: string;
    date?: string;
    tags?: string[];
    [key: string]: unknown;
}

/** Shape returned by GET /api/files/content */
export interface DocumentContent {
    path: string;
    content: string;
    frontmatter?: DocumentFrontmatter;
    size?: number;
    lastModified?: string;
}

/** Shape returned by POST /api/files/upload */
export interface UploadResult {
    uploaded: Array<{ originalName: string; filename: string; path: string; size: number }>;
    errors: Array<{ filename: string; error: string }>;
    totalFiles: number;
    successCount: number;
    errorCount: number;
}

// Relative by default, so the built app talks to whatever origin serves it.
// The Vite dev server proxies /api to the file service on :3001.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

class FileAPI {
    /**
     * Get file list with folder structure
     */
    static async getFileList(): Promise<FileItem[]> {
        const response = await fetch(`${API_BASE_URL}/api/files`);

        if (!response.ok) {
            throw new Error(`Failed to fetch files: ${response.statusText}`);
        }

        const result: ApiResponse<FileItem[]> = await response.json();

        if (!result.success) {
            throw new Error(result.error ?? "Failed to get file list");
        }

        return result.data ?? [];
    }

    /**
     * Get file content
     */
    static async getFileContent(filePath: string): Promise<DocumentContent> {
        // The path comes from the file tree the server itself produced, so it is
        // sent through unchanged. Rewriting it here used to break every file
        // whose name contained a capital letter.
        const response = await fetch(`${API_BASE_URL}/api/files/content?path=${encodeURIComponent(filePath)}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch file content: ${response.statusText}`);
        }

        const result: ApiResponse<DocumentContent> = await response.json();

        if (!result.success) {
            throw new Error(result.error ?? "Failed to get file content");
        }

        return result.data!;
    }

    /**
     * Create a new file
     */
    static async createFile(params: CreateFileRequest): Promise<{ path: string; name: string }> {
        const response = await fetch(`${API_BASE_URL}/api/files/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorResult: ApiResponse = await response.json();
            throw new Error(errorResult.error ?? `Failed to create file: ${response.statusText}`);
        }

        const result: ApiResponse<{ path: string; name: string }> = await response.json();

        if (!result.success) {
            throw new Error(result.error ?? "Failed to create file");
        }

        return result.data!;
    }

    /**
     * Create a new folder
     */
    static async createFolder(params: CreateFolderRequest): Promise<{ path: string; name: string }> {
        const response = await fetch(`${API_BASE_URL}/api/folders/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorResult: ApiResponse = await response.json();
            throw new Error(errorResult.error ?? `Failed to create folder: ${response.statusText}`);
        }

        const result: ApiResponse<{ path: string; name: string }> = await response.json();

        if (!result.success) {
            throw new Error(result.error ?? "Failed to create folder");
        }

        return result.data!;
    }

    /**
     * Delete files/folders
     */
    static async deleteItems(paths: string[]): Promise<{ deleted: Array<{ path: string; type: "file" | "folder" }> }> {
        const response = await fetch(`${API_BASE_URL}/api/files`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ paths }),
        });

        if (!response.ok) {
            const errorResult: ApiResponse = await response.json();
            throw new Error(errorResult.error ?? `Failed to delete items: ${response.statusText}`);
        }

        const result: ApiResponse<{
            deleted: Array<{ path: string; type: "file" | "folder" }>;
        }> = await response.json();

        if (!result.success) {
            throw new Error(result.error ?? "Failed to delete items");
        }

        return result.data!;
    }

    /**
     * Upload multiple files
     */
    static async uploadFiles(files: File[], targetPath = "", createFolders = true): Promise<UploadResult> {
        const formData = new FormData();

        files.forEach(file => {
            formData.append("files", file);
        });

        formData.append("path", targetPath);
        formData.append("createFolders", createFolders.toString());

        const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorResult: ApiResponse = await response.json();
            throw new Error(errorResult.error ?? `Failed to upload files: ${response.statusText}`);
        }

        const result: ApiResponse<UploadResult> = await response.json();

        if (!result.success) {
            throw new Error(result.error ?? "Failed to upload files");
        }

        return result.data!;
    }

    /**
     * Move a file or folder
     */
    static async moveItem(params: {
        sourcePath: string;
        targetPath: string;
    }): Promise<{ sourcePath: string; targetPath: string; name: string }> {
        const response = await fetch(`${API_BASE_URL}/api/files/move`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorResult: ApiResponse = await response.json();
            throw new Error(errorResult.error ?? `Failed to move item: ${response.statusText}`);
        }

        const result: ApiResponse<{
            sourcePath: string;
            targetPath: string;
            name: string;
        }> = await response.json();

        if (!result.success) {
            throw new Error(result.error ?? "Failed to move item");
        }

        return result.data!;
    }
}

export { FileAPI };
