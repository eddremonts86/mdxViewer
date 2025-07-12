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
        "gi",
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
        ),
    );
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
    onCreateFile,
    onCreateFolder,
    onDeleteItem,
}: FileTreeNodeProps) {
    const location = useLocation();
    const isActive = location.pathname === node.path;

    // Check if this folder contains the active file
    const containsActiveFile = (node: FileNode): boolean => {
        if (node.type === "file") {
            return location.pathname === node.path;
        }
        if (node.children) {
            return node.children.some(containsActiveFile);
        }
        return false;
    };

    const hasActiveChild = node.type === "folder" && containsActiveFile(node);

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

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e, node);
    };

    const getIcon = () => {
        if (node.type === "folder") {
            const iconClass = cn(
                "w-4 h-4 min-w-4 flex-shrink-0",
                hasActiveChild ? "text-primary" : "text-muted-foreground",
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

    const nodeElement = (
        <div
            className={cn(
                "group flex w-full items-center text-left text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground rounded-sm",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                level === 0 ? "pl-2" : "",
                isActive && "bg-accent text-accent-foreground font-medium",
                isSelected && "bg-primary/10 border-primary/20 border",
                isMultiSelectMode && "cursor-pointer",
            )}
            style={{
                paddingLeft: level > 0 ? `${level * TREE_INDENT_MULTIPLIER + TREE_INDENT_BASE}rem` : undefined,
            }}
            onClick={handleNodeClick}
            onContextMenu={handleContextMenu}
            role={isMultiSelectMode ? "button" : undefined}
            tabIndex={isMultiSelectMode ? 0 : undefined}
        >
            {/* Folder toggle button */}
            {node.type === "folder" && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                        e.stopPropagation();
                        handleToggle();
                    }}
                    className="hover:bg-accent mr-1 h-6 w-6 p-0"
                >
                    {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                    ) : (
                        <ChevronRight className="h-3 w-3" />
                    )}
                </Button>
            )}

            {/* Selection checkbox (multi-select mode) */}
            {isMultiSelectMode && (
                <div
                    className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border",
                    )}
                >
                    {isSelected && (
                        <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M9 16.17l-4.17-4.17-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                    )}
                </div>
            )}

            {/* File/folder icon */}
            {getIcon()}

            {/* File/folder name */}
            <span className="ml-2 flex-1 truncate">
                {highlightText(node.name, searchTerm)}
            </span>
        </div>
    );

    return (
        <div>
            {/* Node content */}
            {node.type === "file" ? (
                <TransitionLink
                    to={node.path}
                    className="block"
                    onClick={handleNodeClick}
                    transitionName="file-navigation"
                >
                    {nodeElement}
                </TransitionLink>
            ) : (
                nodeElement
            )}

            {/* Children (for folders) */}
            {node.type === "folder" && isExpanded && node.children && (
                <div className="ml-0 space-y-0.5">
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
                            onCreateFile={onCreateFile}
                            onCreateFolder={onCreateFolder}
                            onDeleteItem={onDeleteItem}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
