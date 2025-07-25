import { useState, useCallback } from "react";

/**
 * Custom hook for managing folder expansion state in the sidebar
 * Handles expand/collapse operations for individual folders and bulk actions
 */
export const useSidebarFolderExpansion = () => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const toggleFolder = useCallback((path: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    }, []);

    const expandAll = useCallback((allFolderPaths: string[]) => {
        setExpandedFolders(new Set(allFolderPaths));
    }, []);

    const collapseAll = useCallback(() => {
        setExpandedFolders(new Set());
    }, []);

    const handleFolderAutoExpansion = useCallback((targetPath: string) => {
        setExpandedFolders(folders => new Set([...folders, targetPath]));
    }, []);

    return {
        expandedFolders,
        toggleFolder,
        expandAll,
        collapseAll,
        handleFolderAutoExpansion,
    };
};