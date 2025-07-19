// Utility for filtering files by search term
import type { FileItem } from "../types/Sidebar";

export const filterFilesBySearch = (items: FileItem[], searchTerm: string): FileItem[] => {
    if (!searchTerm.trim()) return items;
    const filterItems = (nodes: FileItem[]): FileItem[] =>
        nodes.reduce<FileItem[]>((acc, item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const filteredChildren = item.children ? filterItems(item.children) : [];
            if (matchesSearch || filteredChildren.length > 0) {
                acc.push({ ...item, children: filteredChildren });
            }
            return acc;
        }, []);
    return filterItems(items);
};
