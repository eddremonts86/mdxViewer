import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { FileItem } from "@/api/fileAPI";
import { CreateDocumentDialog } from "@/components/dialogs/CreateDocumentDialog";
import { useCreateFolder, useDeleteFiles, useFiles, useMoveItem, useUploadFiles } from "@/hooks/api/useFiles";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
    DragIndicator,
    MoveItemDialog,
    SidebarContent,
    SidebarFolderControls,
    SidebarHeader,
    SidebarSearch,
    SidebarSelectionBar,
    SidebarStatusInfo,
} from "./sidebar/components";
import {
    useSidebarDialogs,
    useSidebarDragAndDrop,
    useSidebarFileSelection,
    useSidebarFolderExpansion,
} from "./sidebar/hooks";

interface SidebarProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
    const { data: files = [], isLoading, error, refetch } = useFiles();
    const navigate = useNavigate();
    const { toast } = useToast();

    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [animatingFolders] = useState<Set<string>>(new Set());

    // API hooks
    const createFolderMutation = useCreateFolder();
    const deleteFilesMutation = useDeleteFiles();
    const uploadFilesMutation = useUploadFiles();
    const moveItemMutation = useMoveItem();

    // Custom hooks
    const { expandedFolders, toggleFolder, expandAll, collapseAll, handleFolderAutoExpansion } =
        useSidebarFolderExpansion();

    const { selectedFiles, isSelectionModeActive, toggleFileSelection, toggleSelectionMode, selectAllFiles, clearSelection } =
        useSidebarFileSelection();

    const { isCreateDialogOpen, isMoveDialogOpen, moveDialogData, openCreateDialog, closeCreateDialog, openMoveDialog, closeMoveDialog } =
        useSidebarDialogs();

    const { draggedItem, draggedItemName, dragOverFolder, isDragging, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd } =
        useSidebarDragAndDrop(
            (params) => moveItemMutation.mutate(params),
            handleFolderAutoExpansion
        );

    // Filter files based on search
    const filteredFiles = useMemo(() => {
        if (!searchTerm.trim()) return files;

        const filterItems = (items: FileItem[]): FileItem[] => {
            return items.reduce((acc: FileItem[], item) => {
                const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
                const filteredChildren = item.children ? filterItems(item.children) : [];

                if (matchesSearch || filteredChildren.length > 0) {
                    acc.push({
                        ...item,
                        children: filteredChildren.length > 0 ? filteredChildren : item.children,
                    });
                }

                return acc;
            }, []);
        };

        return filterItems(files);
    }, [files, searchTerm]);

    // Event handlers
    const handleFileClick = (item: FileItem) => {
        if (isSelectionModeActive) {
            toggleFileSelection(item.path);
        } else {
            if (item.type === "file") {
                navigate(`/document/${encodeURIComponent(item.path)}`);
            } else {
                toggleFolder(item.path);
            }
        }
    };

    const handleCreateFile = (parentPath = "") => {
        openCreateDialog(parentPath);
    };

    const handleCreateFolder = (parentPath = "") => {
        // Check depth before allowing folder creation
        const calculateDepth = (pathStr: string): number => {
            if (!pathStr || pathStr === "/") return 0;
            return pathStr.split("/").filter(segment => segment.length > 0).length;
        };

        const currentDepth = calculateDepth(parentPath);
        const MAX_DEPTH = 10;

        if (currentDepth >= MAX_DEPTH) {
            toast({
                variant: "destructive",
                title: "Cannot create folder",
                description: `Maximum depth of ${MAX_DEPTH} levels reached.`,
            });
            return;
        }

        // TODO: Replace with proper dialog component
        const folderName = window.prompt("Enter folder name:");
        if (folderName?.trim()) {
            createFolderMutation.mutate(
                {
                    name: folderName.trim(),
                    path: parentPath,
                },
                {
                    onSuccess: () => {
                        toast({
                            variant: "success",
                            title: "Folder created",
                            description: `Folder "${folderName}" has been created successfully.`,
                        });
                        refetch();
                    },
                    onError: (error) => {
                        console.error("Folder creation failed:", error);
                        const errorMessage = error instanceof Error ? error.message : "Failed to create folder";
                        toast({
                            variant: "destructive",
                            title: "Failed to create folder",
                            description: errorMessage,
                        });
                    },
                }
            );
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = event.target;
        if (!files || files.length === 0) return;

        try {
            await uploadFilesMutation.mutateAsync({
                files: Array.from(files),
                targetPath: "",
                createFolders: true,
            });
            event.target.value = ""; // Reset input
            toast({
                variant: "success",
                title: "Files uploaded",
                description: `${files.length} file(s) have been uploaded successfully.`,
            });
            refetch();
        } catch (error) {
            console.error("Upload failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to upload files";
            toast({
                variant: "destructive",
                title: "Failed to upload files",
                description: errorMessage,
            });
        }
    };

    const triggerUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = ".md,.mdx,.txt";
        input.onchange = (event) => {
            handleUpload(event as unknown as React.ChangeEvent<HTMLInputElement>);
        };
        input.click();
    };

    const handleDelete = async () => {
        if (selectedFiles.size === 0) return;

        // TODO: Replace with proper confirmation dialog
        const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedFiles.size} item(s)?`);

        if (!confirmDelete) return;

        const filePaths = Array.from(selectedFiles);
        try {
            await deleteFilesMutation.mutateAsync(filePaths);
            clearSelection();
            toast({
                variant: "success",
                title: "Items deleted",
                description: `${filePaths.length} item(s) have been deleted successfully.`,
            });
            refetch();
        } catch (error) {
            console.error("Delete failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to delete items";
            toast({
                variant: "destructive",
                title: "Failed to delete items",
                description: errorMessage,
            });
        }
    };

    const handleMoveToFolder = (targetPath: string) => {
        if (!moveDialogData) return;

        moveItemMutation.mutate(
            {
                sourcePath: moveDialogData.sourcePath,
                targetPath,
            },
            {
                onSuccess: () => {
                    toast({
                        variant: "success",
                        title: "Item moved",
                        description: `Successfully moved "${moveDialogData.itemName}" to "${targetPath || "root"}"`
                    });
                    closeMoveDialog();
                    refetch();
                },
                onError: (error) => {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: `Failed to move item: ${error.message}`,
                    });
                },
            }
        );
    };

    return (
        <>
            {/* Drag Indicator */}
            <DragIndicator isDragging={isDragging} draggedItemName={draggedItemName} />

            <aside
                className={cn(
                    "bg-background border-border fixed top-0 left-0 z-40 h-screen w-80 transform border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <SidebarHeader
                        onCreateFile={() => handleCreateFile()}
                        onUpload={triggerUpload}
                        onToggleSelectionMode={toggleSelectionMode}
                        onClose={() => onOpenChange(false)}
                        isSelectionModeActive={isSelectionModeActive}
                        isUploadPending={uploadFilesMutation.isPending}
                    />

                    {/* Selection Bar */}
                    {selectedFiles.size > 0 && (
                        <SidebarSelectionBar
                            selectedCount={selectedFiles.size}
                            onSelectAll={() => selectAllFiles(filteredFiles)}
                            onClearSelection={clearSelection}
                            onDelete={handleDelete}
                            isDeletePending={deleteFilesMutation.isPending}
                        />
                    )}

                    {/* Search */}
                    <SidebarSearch
                        searchTerm={searchTerm}
                        onSearchChange={(event) => setSearchTerm(event.target.value)}
                        onClearSearch={() => setSearchTerm("")}
                        resultsCount={filteredFiles.length}
                    />

                    {/* Folder Controls */}
                    {!searchTerm && filteredFiles.length > 0 && (
                        <SidebarFolderControls
                            searchTerm={searchTerm}
                            hasFiles={filteredFiles.length > 0}
                            onExpandAll={() => {
                                // Helper function to get all folder paths
                                const getAllFolderPaths = (items: FileItem[]): string[] => {
                                    const paths: string[] = [];
                                    const traverse = (items: FileItem[]) => {
                                        for (const item of items) {
                                            if (item.type === "folder") {
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
                                const allFolderPaths = getAllFolderPaths(filteredFiles);
                                expandAll(allFolderPaths);
                            }}
                            onCollapseAll={collapseAll}
                        />
                    )}

                    {/* Content */}
                    <SidebarContent
                        isLoading={isLoading}
                        error={error as Error | null}
                        filteredFiles={filteredFiles}
                        searchTerm={searchTerm}
                        onClearSearch={() => setSearchTerm("")}
                        onRefetch={refetch}
                        isSelectionModeActive={isSelectionModeActive}
                        selectedFiles={Array.from(selectedFiles)}
                        onSelectFile={toggleFileSelection}
                        onCheckboxChange={(itemPath: string, checked: boolean | string) => {
                            if (checked) {
                                toggleFileSelection(itemPath);
                            } else {
                                toggleFileSelection(itemPath);
                            }
                        }}
                        expandedFolders={expandedFolders}
                        onToggleFolder={toggleFolder}
                        onItemClick={handleFileClick}
                        onCreateFile={handleCreateFile}
                        onCreateFolder={handleCreateFolder}
                        onMoveItem={(itemPath: string, itemName: string) => 
                            openMoveDialog(itemPath, itemName)
                        }
                        onDeleteItem={(path: string) => {
                            const confirmDelete = window.confirm(`Are you sure you want to delete "${path}"?`);
                            if (confirmDelete) {
                                deleteFilesMutation.mutate([path], {
                                    onSuccess: () => {
                                        toast({
                                            variant: "success",
                                            title: "Item deleted",
                                            description: "Item has been deleted successfully.",
                                        });
                                        refetch();
                                    },
                                    onError: (error) => {
                                        toast({
                                            variant: "destructive",
                                            title: "Failed to delete item",
                                            description: error.message,
                                        });
                                    },
                                });
                            }
                        }}
                        isDragging={isDragging}
                        draggedItem={draggedItem}
                        draggedItemName={draggedItemName}
                        dragOverFolder={dragOverFolder}
                        animatingFolders={animatingFolders}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    />

                    {/* Status Info */}
                    <SidebarStatusInfo
                        isSelectionModeActive={isSelectionModeActive}
                        selectedCount={selectedFiles.size}
                    />
                </div>
            </aside>

            {/* Create Document Dialog */}
            <CreateDocumentDialog
                open={isCreateDialogOpen}
                onOpenChange={closeCreateDialog}
                initialPath={moveDialogData?.sourcePath || ""}
                availableFolders={filteredFiles
                    .filter(item => item.type === "folder")
                    .map(folder => ({
                        name: folder.name,
                        path: folder.path
                    }))
                }
            />

            {/* Move Item Dialog */}
            <MoveItemDialog
                isOpen={isMoveDialogOpen}
                onClose={closeMoveDialog}
                itemName={moveDialogData?.itemName || ""}
                filteredFiles={filteredFiles}
                onMoveToFolder={handleMoveToFolder}
            />
        </>
    );
};