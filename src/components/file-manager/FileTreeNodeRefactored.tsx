import { useLocation } from "react-router-dom";

import {
    ChevronDown,
    ChevronRight,
    File,
    Folder,
    FolderOpen,
} from "lucide-react";

import { TransitionLink } from "@/components/navigation/TransitionLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FileNode } from "@/types";

interface FileTreeNodeProps {
    node: FileNode;
    level: number;
    expandedFolder: string | null;
    setExpandedFolder: (_path: string | null) => void;
    searchTerm?: string;
    isSearching?: boolean;
    // Multi-select props
    isSelected?: boolean;
    isMultiSelectMode?: boolean;
    onToggleSelect?: (_path: string) => void;
    onContextMenu?: (_event: React.MouseEvent, _node: FileNode) => void;
    // File operations
    onCreateFile?: (_parentPath: string) => void;
    onCreateFolder?: (_parentPath: string) => void;
    onDeleteItem?: (_path: string, _isFolder: boolean) => void;
}

// Constants for layout and styling
const TREE_INDENT_MULTIPLIER = 1.5;
const TREE_INDENT_BASE = 0.5;

// Highlight search matches
const highlightText = (text: string, searchTerm?: string) => {
    if (!searchTerm?.trim()) return text;

    const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? (
            <mark
                key={`${part}-${index}`}
                className="rounded bg-yellow-200 px-1 dark:bg-yellow-800"
            >
                {part}
            </mark>
        ) : (
            part
        )
    );
};

// Helper function to check if folder contains active file
const containsActiveFile = (node: FileNode, pathname: string): boolean => {
    if (node.type === "file") {
        return pathname === node.path;
    }
    if (node.children) {
        return node.children.some(child => containsActiveFile(child, pathname));
    }
    return false;
};

// Helper function to get the appropriate icon
const getNodeIcon = (
    node: FileNode,
    isExpanded: boolean,
    hasActiveChild: boolean
) => {
    if (node.type === "folder") {
        const iconClass = cn(
            "w-4 h-4 min-w-4 flex-shrink-0",
            hasActiveChild ? "text-primary" : "text-muted-foreground"
        );
        return isExpanded ? (
            <FolderOpen className={iconClass} />
        ) : (
            <Folder className={iconClass} />
        );
    }

    return (
        <File className="text-muted-foreground h-4 w-4 min-w-4 flex-shrink-0" />
    );
};

// Toggle button component for folders
interface ToggleButtonProps {
    isExpanded: boolean;
    onToggle: () => void;
    isSearching: boolean;
}

const ToggleButton = ({
    isExpanded,
    onToggle,
    isSearching,
}: ToggleButtonProps) => (
    <Button
        variant="ghost"
        size="sm"
        onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            if (!isSearching) {
                onToggle();
            }
        }}
        className="h-4 w-4 p-0 hover:bg-transparent"
        disabled={isSearching}
    >
        {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
        ) : (
            <ChevronRight className="h-3 w-3" />
        )}
    </Button>
);

// Node content component
interface NodeContentProps {
    node: FileNode;
    searchTerm?: string;
    isActive: boolean;
    icon: React.ReactNode;
}

const NodeContent = ({
    node,
    searchTerm,
    isActive,
    icon,
}: NodeContentProps) => {
    const content = (
        <div className="flex min-w-0 flex-1 items-center gap-2">
            {icon}
            <span className={cn("truncate", isActive && "font-medium")}>
                {highlightText(node.name, searchTerm)}
            </span>
        </div>
    );

    if (node.type === "file") {
        return (
            <TransitionLink
                to={node.path}
                className="flex min-w-0 flex-1 items-center"
            >
                {content}
            </TransitionLink>
        );
    }

    return content;
};

export function FileTreeNode({
    node,
    level,
    expandedFolder,
    setExpandedFolder,
    searchTerm,
    isSearching = false,
    isSelected = false,
    isMultiSelectMode = false,
    onToggleSelect,
    onContextMenu,
}: FileTreeNodeProps) {
    const location = useLocation();
    const isActive = location.pathname === node.path;
    const hasActiveChild =
        node.type === "folder" && containsActiveFile(node, location.pathname);

    // When searching, expand all folders that contain matches
    // Only expand if this folder contains the active file or is the currently expanded one
    const isExpanded =
        node.type === "folder" &&
        (isSearching || hasActiveChild || expandedFolder === node.path);

    const handleToggle = (): void => {
        if (node.type === "folder" && !isSearching) {
            if (isExpanded) {
                // If clicking on the expanded folder, collapse it
                setExpandedFolder(null);
            } else {
                // Otherwise, expand this folder (and collapse any other)
                setExpandedFolder(node.path);
            }
        }
    };

    const handleNodeClick = (e: React.MouseEvent) => {
        // In multi-select mode, clicking toggles selection
        if (isMultiSelectMode && onToggleSelect) {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect(node.path);
            return;
        }

        // For folders, handle toggle
        if (node.type === "folder") {
            e.preventDefault();
            handleToggle();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNodeClick(e as unknown as React.MouseEvent);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e, node);
    };

    const icon = getNodeIcon(node, isExpanded, hasActiveChild);

    const nodeClasses = cn(
        "group flex w-full items-center text-left text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground rounded-sm",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        level === 0 ? "pl-2" : "",
        isActive && "bg-accent text-accent-foreground font-medium",
        isSelected && "bg-primary/10 border-primary/20 border"
    );

    const paddingLeft =
        level > 0
            ? `${level * TREE_INDENT_MULTIPLIER + TREE_INDENT_BASE}rem`
            : undefined;

    const nodeElement = (
        <div
            className={nodeClasses}
            style={{ paddingLeft }}
            onClick={handleNodeClick}
            onKeyDown={handleKeyDown}
            onContextMenu={handleContextMenu}
            role={isMultiSelectMode ? "button" : "treeitem"}
            tabIndex={isMultiSelectMode ? 0 : -1}
            aria-selected={isSelected}
        >
            {/* Folder toggle button */}
            {node.type === "folder" && (
                <ToggleButton
                    isExpanded={isExpanded}
                    onToggle={handleToggle}
                    isSearching={isSearching}
                />
            )}

            <NodeContent
                node={node}
                searchTerm={searchTerm}
                isActive={isActive}
                icon={icon}
            />
        </div>
    );

    return (
        <div role="none">
            {nodeElement}
            {/* Render children if expanded */}
            {isExpanded && node.children && (
                <div role="group" aria-expanded={isExpanded}>
                    {node.children.map(child => (
                        <FileTreeNode
                            key={child.path}
                            node={child}
                            level={level + 1}
                            expandedFolder={expandedFolder}
                            setExpandedFolder={setExpandedFolder}
                            searchTerm={searchTerm}
                            isSearching={isSearching}
                            isSelected={isSelected}
                            isMultiSelectMode={isMultiSelectMode}
                            onToggleSelect={onToggleSelect}
                            onContextMenu={onContextMenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
