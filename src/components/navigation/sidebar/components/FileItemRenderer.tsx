import React from "react";

import {
    ChevronDown,
    ChevronRight,
    File,
    Folder,
    FolderOpen,
    MoreHorizontal,
    Move,
    Plus,
    Trash2,
} from "lucide-react";

import type { FileItem } from "@/api/fileAPI";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FileItemRendererProps {
    item: FileItem;
    level?: number;
    // Selection props
    isSelectionModeActive: boolean;
    selectedFiles: string[];
    onSelectFile: (path: string, event?: React.MouseEvent) => void;
    onCheckboxChange: (itemPath: string, checked: boolean | string) => void;
    // Folder expansion props
    expandedFolders: Set<string>;
    onToggleFolder: (path: string) => void;
    // Item interaction props
    onItemClick: (item: FileItem, event?: React.MouseEvent) => void;
    // Action props
    onCreateFile: (parentPath: string) => void;
    onCreateFolder: (parentPath: string) => void;
    onMoveItem: (itemPath: string, itemName: string) => void;
    onDeleteItem: (itemPath: string) => void;
    // Drag and drop props
    isDragging: boolean;
    draggedItem: string | null;
    draggedItemName: string;
    dragOverFolder: string | null;
    animatingFolders: Set<string>;
    onDragStart: (e: React.DragEvent, itemPath: string, itemName: string) => void;
    onDragEnd: () => void;
    onDragOver: (e: React.DragEvent, targetPath: string, isFolder: boolean) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, targetPath: string, isFolder: boolean) => void;
}

/**
 * Component for rendering individual file/folder items in the sidebar
 * Handles display, interactions, and drag-and-drop functionality
 */
export const FileItemRenderer: React.FC<FileItemRendererProps> = ({
    item,
    level = 0,
    isSelectionModeActive,
    selectedFiles,
    onSelectFile,
    onCheckboxChange,
    expandedFolders,
    onToggleFolder,
    onItemClick,
    onCreateFile,
    onCreateFolder,
    onMoveItem,
    onDeleteItem,
    isDragging,
    draggedItem,
    draggedItemName,
    dragOverFolder,
    animatingFolders,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
}) => {
    const isFolder = item.type === "folder";
    const isExpanded = expandedFolders.has(item.path);
    const hasChildren = isFolder && item.children && item.children.length > 0;
    const indentLevel = level * 16;
    const isBeingDragged = draggedItem === item.path;
    const isDropTarget = dragOverFolder === item.path && isFolder;
    const isAnimating = animatingFolders.has(item.path);
    const canReceiveDrop = isFolder && isDragging && !isBeingDragged && !item.path.startsWith(draggedItem ?? "");

    const handleFileItemKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onItemClick(item);
        }
    };

    const handleFolderToggleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onToggleFolder(item.path);
        }
    };

    const renderChevronIcon = (isExpanded: boolean, hasChildren: boolean) => {
        if (!hasChildren) return <div className="h-4 w-4" />;
        return isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />;
    };

    const renderFileIcon = (isFolder: boolean, isExpanded: boolean, hasChildren: boolean) => {
        if (isFolder) {
            return isExpanded && hasChildren ? (
                <FolderOpen size={14} className="text-blue-500" />
            ) : (
                <Folder size={14} className="text-blue-500" />
            );
        }
        return <File size={14} className="text-gray-500" />;
    };

    return (
        <div
            key={item.path}
            className="relative select-none"
            draggable
            onDragStart={e => onDragStart(e, item.path, item.name)}
            onDragEnd={onDragEnd}
            onDragOver={e => onDragOver(e, item.path, isFolder)}
            onDragLeave={onDragLeave}
            onDrop={e => onDrop(e, item.path, isFolder)}
            role="treeitem"
            tabIndex={0}
            aria-expanded={isFolder ? isExpanded : undefined}
            aria-selected={selectedFiles.includes(item.path)}
            onKeyDown={handleFileItemKeyDown}
        >
            {/* Drop zone overlay for better visual feedback */}
            {isDropTarget && (
                <div className="pointer-events-none absolute inset-0 z-10 animate-pulse rounded-md border-2 border-dashed border-blue-500 bg-blue-500/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white shadow-lg">
                            Drop "{draggedItemName}" here
                        </div>
                    </div>
                </div>
            )}

            <div
                className={cn(
                    "group relative flex w-full cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1 text-left text-sm transition-all duration-200",
                    "hover:bg-accent/50 focus-within:bg-accent/50 focus:ring-ring focus:ring-2 focus:outline-none",
                    selectedFiles.includes(item.path) && "bg-accent",
                    isBeingDragged && "scale-95 opacity-40 shadow-lg",
                    isDropTarget && "bg-blue-50 dark:bg-blue-900/20",
                    isAnimating && "animate-pulse border-2 border-green-300 bg-green-50 dark:bg-green-900/20",
                    canReceiveDrop &&
                        "hover:border-2 hover:border-dashed hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                    !canReceiveDrop && isDragging && isFolder && "opacity-60",
                )}
                style={{ paddingLeft: `${8 + indentLevel}px` }}
                onClick={e => onItemClick(item, e)}
                onKeyDown={handleFileItemKeyDown}
                title={canReceiveDrop ? `Drop "${draggedItemName}" here` : undefined}
                aria-label={`${item.type === "folder" ? "Folder" : "File"}: ${item.name}`}
                role="button"
                tabIndex={0}
            >
                {/* Selection checkbox - show when in selection mode or when item is selected */}
                {(isSelectionModeActive || selectedFiles.includes(item.path)) && (
                    <Checkbox
                        checked={selectedFiles.includes(item.path)}
                        onCheckedChange={checked => onCheckboxChange(item.path, checked)}
                        className="flex-shrink-0"
                        onClick={e => e.stopPropagation()}
                    />
                )}

                {/* Expand/Collapse button for folders */}
                {isFolder && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                            e.stopPropagation();
                            onToggleFolder(item.path);
                        }}
                        onKeyDown={handleFolderToggleKeyDown}
                        className="h-4 w-4 p-0 hover:bg-accent focus:ring-ring focus:ring-2 focus:outline-none"
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} folder ${item.name}`}
                    >
                        {renderChevronIcon(isExpanded, !!hasChildren)}
                    </Button>
                )}

                {/* File/Folder icon */}
                <div className="flex h-4 w-4 items-center justify-center">
                    {renderFileIcon(isFolder, isExpanded, !!hasChildren)}
                </div>

                {/* File/Folder name */}
                <span className="flex-1 truncate">{item.name}</span>

                {/* Drag over indicator */}
                {dragOverFolder === item.path && isFolder && (
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Drop here</span>
                )}

                {/* Actions dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            onClick={e => e.stopPropagation()}
                            aria-label={`Actions for ${item.name}`}
                        >
                            <MoreHorizontal size={12} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background/95 dark:bg-background/98 backdrop-blur-xl">
                        {isFolder && (
                            <>
                                <DropdownMenuItem onClick={() => onCreateFile(item.path)}>
                                    <Plus size={14} className="mr-2" />
                                    New File
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onCreateFolder(item.path)}>
                                    <Plus size={14} className="mr-2" />
                                    New Folder
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        <DropdownMenuItem
                            onClick={() => onMoveItem(item.path, item.name)}
                            className="text-blue-600 focus:text-blue-600"
                        >
                            <Move size={14} className="mr-2" />
                            Move to...
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDeleteItem(item.path)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Render children if folder is expanded */}
            {isFolder && isExpanded && hasChildren && (
                <div>
                    {item.children!.map(child => (
                        <FileItemRenderer
                            key={child.path}
                            item={child}
                            level={level + 1}
                            isSelectionModeActive={isSelectionModeActive}
                            selectedFiles={selectedFiles}
                            onSelectFile={onSelectFile}
                            onCheckboxChange={onCheckboxChange}
                            expandedFolders={expandedFolders}
                            onToggleFolder={onToggleFolder}
                            onItemClick={onItemClick}
                            onCreateFile={onCreateFile}
                            onCreateFolder={onCreateFolder}
                            onMoveItem={onMoveItem}
                            onDeleteItem={onDeleteItem}
                            isDragging={isDragging}
                            draggedItem={draggedItem}
                            draggedItemName={draggedItemName}
                            dragOverFolder={dragOverFolder}
                            animatingFolders={animatingFolders}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};