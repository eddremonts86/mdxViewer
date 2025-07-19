// Convert FileItem to FileNode
import type { FileItem, FileNode } from "../types/Sidebar";

export const convertToFileNode = (item: FileItem): FileNode => ({
    name: item.name,
    path: item.path,
    type: item.type,
    extension: item.extension,
    children: item.children?.map(convertToFileNode) ?? [],
});
// Utilities for file/folder tree operations

export const getAllFilePaths = (items: FileItem[]): string[] => {
    const paths: string[] = [];
    const traverse = (nodes: FileItem[]) => {
        for (const item of nodes) {
            if (item.type === "file") {
                paths.push(item.path);
            }
            if (item.children) {
                traverse(item.children);
            }
        }
    };
    traverse(items);
    return paths;
};

export const getAllFolderPaths = (items: FileItem[]): string[] => {
    const paths: string[] = [];
    const traverse = (nodes: FileItem[]) => {
        for (const item of nodes) {
            if (item.type === "folder") {
                paths.push(item.path);
                if (item.children) {
                    traverse(item.children);
                }
            }
        }
    };
    traverse(items);
    return paths;
};

export const calculateDepth = (pathStr: string): number => {
    if (!pathStr) return 0;
    return pathStr.split("/").filter(Boolean).length;
};
