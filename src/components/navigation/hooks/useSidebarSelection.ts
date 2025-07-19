import { useCallback, useState } from "react";

export function useSidebarSelection() {
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const handleSelectFile = useCallback((path: string) => {
        setSelectedFiles(prev => (prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]));
    }, []);

    const handleExpandFolder = useCallback((path: string | null, itemPath: string) => {
        if (path) {
            setExpandedFolders(prev => new Set([...prev, path]));
        } else {
            setExpandedFolders(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemPath);
                return newSet;
            });
        }
    }, []);

    return {
        selectedFiles,
        setSelectedFiles,
        expandedFolders,
        setExpandedFolders,
        handleSelectFile,
        handleExpandFolder,
    };
}
