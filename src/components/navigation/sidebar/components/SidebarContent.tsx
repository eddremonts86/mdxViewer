import React from "react";

import { Loader2 } from "lucide-react";

import type { FileItem } from "@/api/fileAPI";
import { NoResults } from "@/components/search/NoResults";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { FileItemRenderer } from "./FileItemRenderer";

interface SidebarContentProps {
    // Data props
    isLoading: boolean;
    error: Error | null;
    filteredFiles: FileItem[];
    searchTerm: string;
    onClearSearch: () => void;
    onRefetch: () => void;
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
 * Main content area component for the sidebar
 * Handles loading states, errors, and file list rendering
 */
export const SidebarContent: React.FC<SidebarContentProps> = ({
    isLoading,
    error,
    filteredFiles,
    searchTerm,
    onClearSearch,
    onRefetch,
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
    return (
        <section
            className={cn("relative flex-1 overflow-auto", isDragging && "bg-blue-50/30 dark:bg-blue-900/10")}
            onDragOver={e => onDragOver(e, "", true)}
            onDragLeave={onDragLeave}
            onDrop={e => onDrop(e, "", true)}
            aria-label="File explorer content"
        >
            {/* Global drag overlay */}
            {isDragging && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-500/5">
                    <div className="rounded-lg border border-blue-300 bg-white px-4 py-2 shadow-lg dark:bg-gray-800">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            📁 Drop to move "{draggedItemName}" to root folder
                        </div>
                        <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                            Or drop on a specific folder below
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading files...</span>
                </div>
            )}

            {error && (
                <div className="p-4">
                    <Card className="border-destructive bg-destructive/10 p-4">
                        <p className="text-destructive text-sm">Failed to load files: {error.message}</p>
                        <Button variant="outline" size="sm" onClick={onRefetch} className="mt-2">
                            Retry
                        </Button>
                    </Card>
                </div>
            )}

            {!isLoading && !error && (
                <>
                    {filteredFiles.length === 0 ? (
                        <NoResults searchTerm={searchTerm} onClearSearch={onClearSearch} />
                    ) : (
                        <div className="space-y-1 p-2">
                            {filteredFiles.map(item => (
                                <FileItemRenderer
                                    key={item.path}
                                    item={item}
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
                </>
            )}
        </section>
    );
};