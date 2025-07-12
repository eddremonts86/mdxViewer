/**
 * Utility functions for FileTreeNode
 */
import type { FileNode } from "@/types";

// Constants for layout and styling
export const TREE_INDENT_MULTIPLIER = 1.5;
export const TREE_INDENT_BASE = 0.5;

// Helper function to check if folder contains active file
export const containsActiveFile = (
    node: FileNode,
    pathname: string
): boolean => {
    if (node.type === "file") {
        return pathname === node.path;
    }
    if (node.children) {
        return node.children.some(child => containsActiveFile(child, pathname));
    }
    return false;
};

// Helper function to calculate node padding
export const getNodePadding = (level: number): string | undefined =>
    level > 0
        ? `${level * TREE_INDENT_MULTIPLIER + TREE_INDENT_BASE}rem`
        : undefined;
