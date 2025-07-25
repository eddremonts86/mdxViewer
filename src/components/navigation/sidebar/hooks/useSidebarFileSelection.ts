import { useState, useCallback } from "react";

import type { FileItem } from "@/api/fileAPI";

/**
 * Custom hook for managing file selection state in the sidebar
 * Handles individual selection, bulk selection, and selection mode
 */
export const useSidebarFileSelection = () => {
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);

    const toggleFileSelection = useCallback((path: string) => {
        setSelectedFiles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    }, []);

    const getAllFilePaths = useCallback((items: FileItem[]): string[] => {
        const paths: string[] = [];
        const traverse = (items: FileItem[]) => {
            for (const item of items) {
                paths.push(item.path);
                if (item.children) {
                    traverse(item.children);
                }
            }
        };
        traverse(items);
        return paths;
    }, []);

    const selectAllFiles = useCallback(
        (filteredFiles: FileItem[]) => {
            const allPaths = getAllFilePaths(filteredFiles);
            setSelectedFiles(new Set(allPaths));
        },
        [getAllFilePaths],
    );

    const clearSelection = useCallback(() => {
        setSelectedFiles(new Set());
    }, []);

    const toggleSelectionMode = useCallback(() => {
        if (isSelectionModeActive) {
            // When exiting selection mode, clear all selections
            setSelectedFiles(new Set());
        }
        setIsSelectionModeActive(!isSelectionModeActive);
    }, [isSelectionModeActive]);

    return {
        selectedFiles,
        isSelectionModeActive,
        toggleFileSelection,
        selectAllFiles,
        clearSelection,
        toggleSelectionMode,
    };
};