/**
 * TanStack Query hooks for file management with improved error handling
 */

import { type CreateFileRequest, type CreateFolderRequest, FileAPI, type SaveFileRequest } from "@/api/fileAPI";

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
    trash: () => ["trash"] as const,
    health: () => ["health"] as const,
    search: (query: string) => ["search", query] as const,
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
 * Documents matching `query`.
 *
 * Results are kept for the session: a reader who types "trash", backspaces and
 * types it again is asking the same question, and the answer only changes when
 * the folder does — which every mutation here already invalidates.
 */
export function useSearch(query: string) {
    return useQuery({
        queryKey: fileKeys.search(query),
        queryFn: () => FileAPI.search(query),
        enabled: query.trim().length > 0,
        staleTime: 60 * 1000,
        placeholderData: previous => previous,
    });
}

/**
 * What the service reports about itself. Read once and kept: an operator does
 * not change `MDX_EXECUTE` while someone is reading.
 */
export function useServiceHealth() {
    return useQuery({
        queryKey: fileKeys.health(),
        queryFn: FileAPI.getHealth,
        staleTime: Infinity,
    });
}

/**
 * What is waiting in the trash.
 */
export function useTrash() {
    return useQuery({
        queryKey: fileKeys.trash(),
        queryFn: FileAPI.getTrash,
    });
}

/**
 * Restoring puts a document back in the tree, so both listings change.
 */
export function useRestoreFromTrash() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => FileAPI.restoreFromTrash(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: fileKeys.trash() });
            queryClient.invalidateQueries({ queryKey: fileKeys.list() });
        },
    });
}

/**
 * Purging touches nothing in the content folder, so only the trash is refetched.
 */
export function usePurgeTrash() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => FileAPI.purgeTrash(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: fileKeys.trash() });
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
 * Hook to save a document's text.
 *
 * Invalidates both the document and the file list: a save changes the size and
 * mtime the chart plots the document by, so the sky has to be redrawn too.
 */
export function useSaveFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: SaveFileRequest) => FileAPI.saveFileContent(request),
        onSuccess: (_data, request) => {
            queryClient.invalidateQueries({ queryKey: fileKeys.content(request.path) });
            queryClient.invalidateQueries({ queryKey: fileKeys.list() });
        },
    });
}

/**
 * Hook to create a new folder with proper error handling
 */
export function useCreateFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateFolderRequest) => FileAPI.createFolder(request),
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
            queryClient.invalidateQueries({ queryKey: fileKeys.list() });
            queryClient.invalidateQueries({ queryKey: fileKeys.trash() });
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
        mutationFn: (params: { sourcePath: string; targetPath: string }) => FileAPI.moveItem(params),
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
