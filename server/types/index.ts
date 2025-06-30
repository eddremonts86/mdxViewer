/**
 * Server Types
 * Type definitions for the MDX Viewer backend
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
    depth?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export interface FolderDepthValidation extends ValidationResult {
    depth: number;
}

export interface StatisticsData {
    totalDocuments: number;
    totalFolders: number;
    recentDocuments: Array<{
        name: string;
        path: string;
        type: "md" | "mdx";
        folder: string;
    }>;
    documentsByType: {
        md: number;
        mdx: number;
    };
    documentsByFolder: Array<{
        folder: string;
        count: number;
    }>;
    popularFolders: Array<{
        name: string;
        count: number;
        path: string;
    }>;
}
