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
    /** The file as it sits on disk, frontmatter included. What the editor edits. */
    raw?: string;
    frontmatter?: DocumentFrontmatter;
    size?: number;
    lastModified?: string;
}

/** One document that matched a search, with the line that matched it. */
export interface SearchHit {
    path: string;
    name: string;
    line: number | null;
    excerpt: string;
    /** Where the query sits inside `excerpt`; the client marks it rather than searching again. */
    at: number;
    length: number;
    more: number;
    /** The document's real size in bytes, measured by the server that read it. */
    size: number;
    inName: boolean;
}

/** What GET /api/health reports about the running service. */
export interface ServiceHealth {
    status: string;
    contentPath: string;
    /** Whether the operator has allowed `.mdx` documents to be compiled and run. */
    mdxExecute: boolean;
}

/** One deleted document or folder, waiting to be restored or purged. */
export interface TrashEntry {
    id: string;
    originalPath: string;
    name: string;
    type: "file" | "folder";
    size: number;
    deletedAt: string;
}

export interface SaveFileRequest {
    path: string;
    content: string;
    /**
     * The stamp the editor loaded. The service refuses with 409 if the file moved
     * on since, rather than overwriting an edit its author never saw.
     */
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
     * Overwrite a document's text
     */
    static async saveFileContent(
        params: SaveFileRequest
    ): Promise<{ path: string; size: number; lastModified: string }> {
        const response = await fetch(`${API_BASE_URL}/api/files/content`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        const result: ApiResponse<{ path: string; size: number; lastModified: string }> = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error ?? `Failed to save document: ${response.statusText}`);
        }

        return result.data!;
    }

    /**
     * Find documents by name and by what is written inside them
     */
    static async search(query: string): Promise<SearchHit[]> {
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
        const result: ApiResponse<{ hits: SearchHit[] }> = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error ?? `Search failed: ${response.statusText}`);
        }

        return result.data?.hits ?? [];
    }

    /**
     * What the running service reports about itself
     */
    static async getHealth(): Promise<ServiceHealth> {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const result: ApiResponse<ServiceHealth> = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error ?? `Failed to read service health: ${response.statusText}`);
        }

        return result.data!;
    }

    /**
     * What is waiting in the trash
     */
    static async getTrash(): Promise<TrashEntry[]> {
        const response = await fetch(`${API_BASE_URL}/api/trash`);
        const result: ApiResponse<TrashEntry[]> = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error ?? `Failed to read the trash: ${response.statusText}`);
        }

        return result.data ?? [];
    }

    /**
     * Put a deleted document back where it came from
     */
    static async restoreFromTrash(id: string): Promise<TrashEntry> {
        const response = await fetch(`${API_BASE_URL}/api/trash/restore`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        const result: ApiResponse<TrashEntry> = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error ?? `Failed to restore: ${response.statusText}`);
        }

        return result.data!;
    }

    /**
     * Delete for good. Nothing comes back from here.
     */
    static async purgeTrash(ids: string[]): Promise<{ purged: string[] }> {
        const response = await fetch(`${API_BASE_URL}/api/trash`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        });
        const result: ApiResponse<{ purged: string[] }> = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error ?? `Failed to purge: ${response.statusText}`);
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
