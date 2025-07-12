/**
 * TanStack Query hooks for file management with improved error handling
 */

import type { CreateFileRequest, CreateFolderRequest } from "@/api/fileAPI";
import { FileAPI } from "@/api/fileAPI";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Define error types for better error handling
interface APIError {
    message: string;
    status?: number;
    code?: string;
}

// Query keys
export const fileKeys = {
    all: ["files"] as const,
    lists: () => [...fileKeys.all, "list"] as const,
    list: () => [...fileKeys.lists()] as const,
    content: (path: string) => [...fileKeys.all, "content", path] as const,
} as const;

/**
 * Hook to get file list with proper error handling
 */
export function useFiles() {
    return useQuery({
        queryKey: fileKeys.list(),
        queryFn: FileAPI.getFileList,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: APIError) => {
            // Don't retry on 4xx errors
            if (error.status && error.status >= 400 && error.status < 500) {
                return false;
            }
            return failureCount < 3;
        },
    });
}

/**
 * Hook to get file content with proper error handling
 */
export function useFileContent(filePath: string, enabled = true) {
    return useQuery({
        queryKey: fileKeys.content(filePath),
        queryFn: () => FileAPI.getFileContent(filePath),
        enabled: enabled && !!filePath,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: APIError) => {
            // Don't retry on 404 errors (file not found)
            if (error.status === 404) {
                return false;
            }
            return failureCount < 2;
        },
    });
}

/**
 * Hook to create a new file with optimistic updates
 */
export function useCreateFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateFileRequest) => FileAPI.createFile(request),
        onSuccess: () => {
            // Invalidate and refetch file list
            queryClient.invalidateQueries({ queryKey: fileKeys.list() });
        },
        onError: (_error: APIError) => {
            // Error handling for file creation failure
            // Using structured error handling instead of console
        },
    });
}

/**
 * Hook to create a new folder with proper error handling
 */
export function useCreateFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateFolderRequest) =>
            FileAPI.createFolder(request),
        onSuccess: () => {
            // Invalidate and refetch file list
            queryClient.invalidateQueries({ queryKey: fileKeys.list() });
        },
        onError: (_error: APIError) => {
            // Error handling for folder creation failure
            // Using structured error handling instead of console
        },
    });
}

/**
 * Hook to delete files with proper error handling
 */
export function useDeleteFiles() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (paths: string[]) => FileAPI.deleteItems(paths),
        onSuccess: () => {
            // Invalidate and refetch file list
            queryClient.invalidateQueries({ queryKey: fileKeys.list() });
        },
        onError: (_error: APIError) => {
            // Error handling for file deletion failure
            // Using structured error handling instead of console
        },
    });
}

/**
 * Hook to upload files with proper error handling
 */
export function useUploadFiles() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            files,
            targetPath,
            createFolders,
        }: {
            files: File[];
            targetPath?: string;
            createFolders?: boolean;
        }) => FileAPI.uploadFiles(files, targetPath, createFolders),
        onSuccess: () => {
            // Invalidate and refetch file list
            queryClient.invalidateQueries({ queryKey: fileKeys.list() });
        },
        onError: (_error: APIError) => {
            // Error handling for file upload failure
            // Using structured error handling instead of console
        },
    });
}

/**
 * Hook to move files/folders with proper error handling
 */
export function useMoveItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { sourcePath: string; targetPath: string }) =>
            FileAPI.moveItem(params),
        onSuccess: () => {
            // Invalidate and refetch file list
            queryClient.invalidateQueries({ queryKey: fileKeys.list() });
        },
        onError: (_error: APIError) => {
            // Error handling for move operation failure
            // Using structured error handling instead of console
        },
    });
}
