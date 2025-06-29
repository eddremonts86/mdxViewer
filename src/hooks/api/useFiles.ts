/**
 * TanStack Query hooks for file management
 */

import type { CreateFileRequest, CreateFolderRequest } from "@/api/fileAPI";
import { FileAPI } from "@/api/fileAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
export const fileKeys = {
    all: ["files"] as const,
    lists: () => [...fileKeys.all, "list"] as const,
    list: () => [...fileKeys.lists()] as const,
    content: (path: string) => [...fileKeys.all, "content", path] as const,
} as const;

/**
 * Hook to get file list
 */
export function useFiles() {
    return useQuery({
        queryKey: fileKeys.list(),
        queryFn: FileAPI.getFileList,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to get file content
 */
export function useFileContent(filePath: string, enabled: boolean = true) {
    return useQuery({
        queryKey: fileKeys.content(filePath),
        queryFn: () => FileAPI.getFileContent(filePath),
        enabled: enabled && !!filePath,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook to create a new file
 */
export function useCreateFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateFileRequest) => FileAPI.createFile(request),
        onSuccess: () => {
            // Invalidate and refetch file list
            queryClient.invalidateQueries({ queryKey: fileKeys.list() });
        },
    });
}

/**
 * Hook to create a new folder
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
    });
}

/**
 * Hook to delete files
 */
export function useDeleteFiles() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (paths: string[]) => FileAPI.deleteItems(paths),
        onSuccess: () => {
            // Invalidate and refetch file list
            queryClient.invalidateQueries({ queryKey: fileKeys.list() });
        },
    });
}

/**
 * Hook to upload files
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
    });
}

/**
 * Hook to move files/folders
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
    });
}
