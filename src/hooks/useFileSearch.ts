import type { FileNode } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

// Utility function to count matching files in the tree
const countMatchingFiles = (nodes: FileNode[], searchTerm: string): number => {
    if (!searchTerm.trim()) return 0;

    let count = 0;

    for (const node of nodes) {
        if (node.type === "file") {
            // Check if file name matches search term
            if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                count++;
            }
        } else if (node.type === "folder" && node.children) {
            // Recursively count in children
            count += countMatchingFiles(node.children, searchTerm);
        }
    }

    return count;
};

// Utility function to filter file tree based on search
const filterFileTree = (nodes: FileNode[], searchTerm: string): FileNode[] => {
    if (!searchTerm.trim()) return nodes;

    const filtered: FileNode[] = [];

    for (const node of nodes) {
        if (node.type === "file") {
            // Check if file name matches search term
            if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                filtered.push(node);
            }
        } else if (node.type === "folder" && node.children) {
            // Recursively filter children
            const filteredChildren = filterFileTree(node.children, searchTerm);
            if (filteredChildren.length > 0) {
                filtered.push({
                    ...node,
                    children: filteredChildren,
                });
            }
        }
    }

    return filtered;
};

export const useFileSearch = (fileStructure: FileNode[]) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isTyping, setIsTyping] = useState<boolean>(false);

    // Filter file structure based on search term
    const filteredFileStructure = useMemo(() => {
        return filterFileTree(fileStructure, searchTerm);
    }, [fileStructure, searchTerm]);

    // Count matching files
    const matchingFilesCount = useMemo(() => {
        return countMatchingFiles(fileStructure, searchTerm);
    }, [fileStructure, searchTerm]);

    // Handle typing indicator with debounce
    useEffect(() => {
        if (searchTerm.trim()) {
            setIsTyping(true);
            const timeoutId = setTimeout(() => setIsTyping(false), 300);
            return () => clearTimeout(timeoutId);
        } else {
            setIsTyping(false);
        }
    }, [searchTerm]);

    // Handle search input change
    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchTerm(value);
        },
        []
    );

    // Clear search
    const clearSearch = useCallback(() => {
        setSearchTerm("");
        setIsTyping(false);
    }, []);

    const isSearching = Boolean(searchTerm.trim());
    const hasResults = filteredFileStructure.length > 0;
    const hasNoResults = isSearching && !hasResults;

    return {
        searchTerm,
        filteredFileStructure,
        handleSearchChange,
        clearSearch,
        isSearching,
        hasResults,
        hasNoResults,
        isTyping,
        matchingFilesCount,
    };
};
