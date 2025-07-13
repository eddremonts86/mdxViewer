import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ChevronDown,
    ChevronRight,
    File,
    Folder,
    FolderOpen,
    Loader2,
    MoreHorizontal,
    Move,
    Plus,
    Trash2,
    Upload,
} from "lucide-react";

import type { FileItem } from "@/api/fileAPI";
import { CreateDocumentDialog } from "@/components/dialogs/CreateDocumentDialog";
import { NoResults } from "@/components/search/NoResults";
import { SearchInput } from "@/components/search/SearchInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateFolder, useDeleteFiles, useFiles, useMoveItem, useUploadFiles } from "@/hooks/api/useFiles";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SidebarProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
    const { data: files = [], isLoading, error, refetch } = useFiles();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const { toast } = useToast();
    const navigate = useNavigate();

    // Mutations
    const createFolderMutation = useCreateFolder();
    const deleteFilesMutation = useDeleteFiles();
    const uploadFilesMutation = useUploadFiles();
    const moveItemMutation = useMoveItem();

    // Drag and drop states
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedItemName, setDraggedItemName] = useState<string>("");
    const [dragAutoExpandTimer, setDragAutoExpandTimer] = useState<NodeJS.Timeout | null>(null);
    const [animatingFolders, setAnimatingFolders] = useState<Set<string>>(new Set());

    // Move dialog states
    const [showMoveDialog, setShowMoveDialog] = useState(false);
    const [moveItemPath, setMoveItemPath] = useState<string>("");
    const [moveItemName, setMoveItemName] = useState<string>("");

    // Dialog states
    const [showCreateDocumentDialog, setShowCreateDocumentDialog] = useState(false);
    const [createDocumentParentPath, setCreateDocumentParentPath] = useState("");

    // Filter files based on search
    const filteredFiles = useMemo(() => {
        if (!searchTerm.trim()) return files;

        const filterItems = (items: FileItem[]): FileItem[] =>
            items.reduce<FileItem[]>((acc, item) => {
                const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
                const filteredChildren = item.children ? filterItems(item.children) : [];

                if (matchesSearch || filteredChildren.length > 0) {
                    acc.push({
                        ...item,
                        children: filteredChildren,
                    });
                }

                return acc;
            }, []);

        return filterItems(files);
    }, [files, searchTerm]);

    const handleSelectFile = (path: string, event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation();
        }
        setSelectedFiles(prev => (prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]));
    };

    // Helper function to get all file paths recursively
    const getAllFilePaths = (items: FileItem[]): string[] => {
        const paths: string[] = [];
        const traverse = (items: FileItem[]) => {
            for (const item of items) {
                paths.push(item.path);
                if (item.children) {
                    traverse(item.children);
                }
            }
        };
        traverse(items);
        return paths;
    };

    const handleSelectAll = () => {
        const allPaths = getAllFilePaths(filteredFiles);
        setSelectedFiles(allPaths);
    };

    const handleClearSelection = () => {
        setSelectedFiles([]);
    };

    const toggleSelectionMode = () => {
        if (isSelectionModeActive) {
            // When exiting selection mode, clear all selections
            setSelectedFiles([]);
        }
        setIsSelectionModeActive(!isSelectionModeActive);
    };

    const handleItemClick = (item: FileItem, event?: React.MouseEvent) => {
        // If selection mode is active or Ctrl/Cmd key is pressed, handle selection
        if (isSelectionModeActive || (event && (event.ctrlKey || event.metaKey))) {
            handleSelectFile(item.path, event);
            return;
        }

        if (item.type === "file") {
            // Navigate to document
            navigate(`/document/${encodeURIComponent(item.path)}`);
        } else {
            // Toggle folder expansion
            toggleFolder(item.path);
        }
    };

    const handleCreateFile = (parentPath = "") => {
        setCreateDocumentParentPath(parentPath);
        setShowCreateDocumentDialog(true);
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
                    },
                    onError: error => {
                        console.error("Folder creation failed:", error);
                        const errorMessage = error instanceof Error ? error.message : "Failed to create folder";
                        toast({
                            variant: "destructive",
                            title: "Failed to create folder",
                            description: errorMessage,
                        });
                    },
                },
            );
        }
    };

    const handleDelete = async () => {
        if (selectedFiles.length === 0) return;

        // TODO: Replace with proper confirmation dialog
        const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedFiles.length} item(s)?`);

        if (!confirmDelete) return;

        try {
            await deleteFilesMutation.mutateAsync(selectedFiles);
            setSelectedFiles([]);
            toast({
                variant: "success",
                title: "Items deleted",
                description: `${selectedFiles.length} item(s) have been deleted successfully.`,
            });
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

    // Helper function to handle folder auto-expansion animation
    const handleFolderAutoExpansion = (targetPath: string) => {
        setAnimatingFolders(folders => new Set([...folders, targetPath]));
        setExpandedFolders(folders => new Set([...folders, targetPath]));

        // Remove animation class after animation completes
        setTimeout(() => {
            setAnimatingFolders(folders => {
                const newSet = new Set(folders);
                newSet.delete(targetPath);
                return newSet;
            });
        }, 300); // Animation duration
    };
    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    };

    // Helper function to get all folder paths recursively
    const getAllFolderPaths = (items: FileItem[]): string[] => {
        const paths: string[] = [];
        const traverse = (items: FileItem[]) => {
            for (const item of items) {
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

    const expandAll = () => {
        const allFolderPaths = getAllFolderPaths(files);
        setExpandedFolders(new Set(allFolderPaths));
    };

    const collapseAll = () => {
        setExpandedFolders(new Set());
    };

    const handleDeleteSingleItem = async (itemPath: string) => {
        // TODO: Replace with proper confirmation dialog
        const confirmDelete = window.confirm(`Are you sure you want to delete "${itemPath}"?`);

        if (!confirmDelete) return;

        try {
            await deleteFilesMutation.mutateAsync([itemPath]);
            toast({
                variant: "success",
                title: "Item deleted",
                description: `"${itemPath}" has been deleted successfully.`,
            });
        } catch (error) {
            console.error("Delete failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to delete item";
            toast({
                variant: "destructive",
                title: "Failed to delete item",
                description: errorMessage,
            });
        }
    };

    const handleMoveToFolder = async (targetPath: string) => {
        if (!moveItemPath) return;

        // Prevent moving to self or invalid paths
        if (targetPath === moveItemPath || moveItemPath.startsWith(`${targetPath}/`)) {
            toast({
                variant: "destructive",
                title: "Invalid move",
                description: "Cannot move item to itself or its subfolder.",
            });
            return;
        }

        try {
            await moveItemMutation.mutateAsync({
                sourcePath: moveItemPath,
                targetPath,
            });

            const targetName =
                targetPath === ""
                    ? "root folder"
                    : (filteredFiles.find(f => f.path === targetPath)?.name ?? "destination folder");

            toast({
                variant: "success",
                title: "Move successful!",
                description: `"${moveItemName}" moved to ${targetName}`,
            });

            setShowMoveDialog(false);
            setMoveItemPath("");
            setMoveItemName("");
        } catch (error) {
            console.error("Move failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to move item";
            toast({
                variant: "destructive",
                title: "Move failed",
                description: errorMessage,
            });
        }
    };

    const renderFolderList = (items: FileItem[], level = 0): React.ReactNode[] =>
        items
            .map(item => {
                if (item.type === "folder" && item.path !== moveItemPath) {
                    const hasChildren = item.children && item.children.length > 0;
                    return (
                        <div key={item.path}>
                            <Button
                                variant="ghost"
                                className={cn("h-auto w-full justify-start px-2 py-1 text-left", level > 0 && "ml-4")}
                                onClick={() => handleMoveToFolder(item.path)}
                            >
                                <Folder className="mr-2 h-4 w-4" />
                                {item.name}
                            </Button>
                            {hasChildren && renderFolderList(item.children!, level + 1)}
                        </div>
                    );
                }
                return null;
            })
            .filter(Boolean);

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, itemPath: string, itemName: string) => {
        setDraggedItem(itemPath);
        setDraggedItemName(itemName);
        setIsDragging(true);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", itemPath);

        // Add visual feedback to the dragged element
        setTimeout(() => {
            const dragElement = e.currentTarget as HTMLElement;
            if (dragElement) {
                dragElement.style.opacity = "0.4";
                dragElement.style.transform = "scale(0.95)";
                dragElement.style.transition = "all 0.2s ease";
            }
        }, 0);

        toast({
            title: "🎯 Drag to move",
            description: `Drop "${itemName}" on a folder to move it there`,
            duration: 3000,
        });
    };

    const handleDragOver = (e: React.DragEvent, targetPath: string, isFolder: boolean) => {
        e.preventDefault();
        if (!isFolder || !isDragging || draggedItem === targetPath) return;

        // Prevent dropping a folder into itself or its children
        if (draggedItem && targetPath.startsWith(draggedItem)) return;

        e.dataTransfer.dropEffect = "move";
        setDragOverFolder(targetPath);

        // Auto-expand folder with delay for better UX
        if (targetPath && !expandedFolders.has(targetPath)) {
            // Clear any existing timer
            if (dragAutoExpandTimer) {
                clearTimeout(dragAutoExpandTimer);
            }

            // Set new timer for auto-expansion
            const timer = setTimeout(() => {
                handleFolderAutoExpansion(targetPath);
            }, 800); // Wait 800ms before auto-expanding

            setDragAutoExpandTimer(timer);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();

        // Clear auto-expand timer when leaving
        if (dragAutoExpandTimer) {
            clearTimeout(dragAutoExpandTimer);
            setDragAutoExpandTimer(null);
        }

        // Only clear if we're leaving the actual target element
        const relatedTarget = e.relatedTarget as HTMLElement;
        const currentTarget = e.currentTarget as HTMLElement;

        if (!currentTarget.contains(relatedTarget)) {
            setDragOverFolder(null);
        }
    };

    const handleDrop = async (e: React.DragEvent, targetPath: string, isFolder: boolean) => {
        e.preventDefault();
        setDragOverFolder(null);

        if (!isFolder || !draggedItem || draggedItem === targetPath || !isDragging) {
            handleDragEnd();
            return;
        }

        // Prevent dropping a folder into itself or its children
        if (targetPath.startsWith(draggedItem)) {
            handleDragEnd();
            toast({
                variant: "destructive",
                title: "Invalid move",
                description: "Cannot move a folder into itself or its subfolder.",
            });
            return;
        }

        try {
            await moveItemMutation.mutateAsync({
                sourcePath: draggedItem,
                targetPath,
            });

            const targetName =
                targetPath === ""
                    ? "root folder"
                    : (filteredFiles.find(f => f.path === targetPath)?.name ?? "destination folder");

            toast({
                variant: "success",
                title: "Move successful!",
                description: `"${draggedItemName}" moved to ${targetName}`,
            });
        } catch (error) {
            console.error("Move failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to move item";
            toast({
                variant: "destructive",
                title: "Move failed",
                description: errorMessage,
            });
        } finally {
            handleDragEnd();
        }
    };

    const handleDragEnd = () => {
        // Clear any auto-expand timer
        if (dragAutoExpandTimer) {
            clearTimeout(dragAutoExpandTimer);
            setDragAutoExpandTimer(null);
        }

        setDraggedItem(null);
        setDraggedItemName("");
        setDragOverFolder(null);
        setIsDragging(false);
        setAnimatingFolders(new Set());

        // Reset styles of all draggable elements with smooth transition
        const dragElements = document.querySelectorAll("[draggable=\"true\"]");
        dragElements.forEach(el => {
            const element = el as HTMLElement;
            element.style.opacity = "";
            element.style.transform = "";
            element.style.transition = "all 0.2s ease";
        });

        // Clear transition after animation
        setTimeout(() => {
            dragElements.forEach(el => {
                (el as HTMLElement).style.transition = "";
            });
        }, 200);
    };

    // Helper function to handle checkbox selection
    const handleCheckboxChange = (itemPath: string, checked: boolean | string) => {
        if (checked) {
            handleSelectFile(itemPath);
        } else {
            setSelectedFiles(files => files.filter(p => p !== itemPath));
        }
    };
    const handleFileItemKeyDown = (e: React.KeyboardEvent, item: FileItem) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleItemClick(item);
        }
    };

    // Handle keyboard navigation for folder toggle
    const handleFolderToggleKeyDown = (e: React.KeyboardEvent, itemPath: string) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            toggleFolder(itemPath);
        }
    };

    // Render chevron icon for folders
    const renderChevronIcon = (isExpanded: boolean, hasChildren: boolean) => {
        if (!hasChildren) return <div className="h-4 w-4" />;
        return isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />;
    };

    // Render file/folder icon
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

    const renderFileItem = (item: FileItem, level = 0): React.ReactNode => {
        const isFolder = item.type === "folder";
        const isExpanded = expandedFolders.has(item.path);
        const hasChildren = isFolder && item.children && item.children.length > 0;
        const indentLevel = level * 16;
        const isBeingDragged = draggedItem === item.path;
        const isDropTarget = dragOverFolder === item.path && isFolder;
        const isAnimating = animatingFolders.has(item.path);
        const canReceiveDrop = isFolder && isDragging && !isBeingDragged && !item.path.startsWith(draggedItem ?? "");

        return (
            <div
                key={item.path}
                className="relative select-none"
                draggable
                onDragStart={e => handleDragStart(e, item.path, item.name)}
                onDragEnd={handleDragEnd}
                onDragOver={e => handleDragOver(e, item.path, isFolder)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, item.path, isFolder)}
                role="treeitem"
                tabIndex={0}
                aria-expanded={isFolder ? isExpanded : undefined}
                aria-selected={selectedFiles.includes(item.path)}
                onKeyDown={e => handleFileItemKeyDown(e, item)}
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

                <button
                    type="button"
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
                    onClick={e => handleItemClick(item, e)}
                    onKeyDown={e => handleFileItemKeyDown(e, item)}
                    title={canReceiveDrop ? `Drop "${draggedItemName}" here` : undefined}
                    aria-label={`${item.type === "folder" ? "Folder" : "File"}: ${item.name}`}
                >
                    {/* Selection checkbox - show when in selection mode or when item is selected */}
                    {(isSelectionModeActive || selectedFiles.includes(item.path)) && (
                        <Checkbox
                            checked={selectedFiles.includes(item.path)}
                            onCheckedChange={checked => handleCheckboxChange(item.path, checked)}
                            className="flex-shrink-0"
                            onClick={e => e.stopPropagation()}
                        />
                    )}

                    {/* Expand/Collapse button for folders */}
                    {isFolder && (
                        <button
                            type="button"
                            onClick={e => {
                                e.stopPropagation();
                                toggleFolder(item.path);
                            }}
                            onKeyDown={e => handleFolderToggleKeyDown(e, item.path)}
                            className="hover:bg-accent focus:ring-ring flex h-4 w-4 items-center justify-center rounded-sm focus:ring-2 focus:outline-none"
                            aria-label={`${isExpanded ? "Collapse" : "Expand"} folder ${item.name}`}
                        >
                            {renderChevronIcon(isExpanded, !!hasChildren)}
                        </button>
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
                        <DropdownMenuContent align="end" className="bg-background/90 backdrop-blur-[90%]">
                            {isFolder && (
                                <>
                                    <DropdownMenuItem onClick={() => handleCreateFile(item.path)}>
                                        <Plus size={14} className="mr-2" />
                                        New File
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCreateFolder(item.path)}>
                                        <Plus size={14} className="mr-2" />
                                        New Folder
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem
                                onClick={() => {
                                    setMoveItemPath(item.path);
                                    setMoveItemName(item.name);
                                    setShowMoveDialog(true);
                                }}
                                className="text-blue-600 focus:text-blue-600"
                            >
                                <Move size={14} className="mr-2" />
                                Move to...
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDeleteSingleItem(item.path)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 size={14} className="mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </button>

                {/* Render children if folder is expanded */}
                {isFolder && isExpanded && hasChildren && (
                    <div>{item.children!.map(child => renderFileItem(child, level + 1))}</div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Drag indicator floating cursor */}
            {isDragging && (
                <div className="pointer-events-none fixed top-0 left-0 z-50 h-full w-full">
                    <div className="absolute top-2 left-2 rounded bg-blue-600 px-2 py-1 text-xs text-white shadow-lg">
                        Moving: {draggedItemName}
                    </div>
                </div>
            )}

            <aside
                className={cn(
                    "bg-background border-border fixed top-0 left-0 z-40 h-screen w-80 transform border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="border-border flex items-center justify-between border-b p-4">
                        <h2 className="text-lg font-semibold">Files</h2>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleCreateFile()} title="New File">
                                <Plus className="h-4 w-4" />
                            </Button>
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                accept=".md,.mdx,.txt"
                                onChange={handleUpload}
                                className="hidden"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => document.getElementById("file-upload")?.click()}
                                title="Upload Files"
                                disabled={uploadFilesMutation.isPending}
                            >
                                {uploadFilesMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleSelectionMode}
                                title={isSelectionModeActive ? "Exit Selection Mode" : "Enter Selection Mode"}
                                className={cn("px-2 text-xs", isSelectionModeActive && "bg-accent")}
                            >
                                {isSelectionModeActive ? "Exit" : "Select"}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="lg:hidden">
                                ✕
                            </Button>
                        </div>
                    </div>

                    {/* Selection Controls Bar - Only show when there are selected files */}
                    {selectedFiles.length > 0 && (
                        <div className="bg-accent/20 border-border flex items-center justify-between border-b px-4 py-2">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs">{selectedFiles.length} selected</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSelectAll}
                                    className="h-6 px-2 text-xs"
                                >
                                    Select All
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearSelection}
                                    className="h-6 px-2 text-xs"
                                >
                                    Clear
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                disabled={deleteFilesMutation.isPending}
                                className="h-6 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                {deleteFilesMutation.isPending ? (
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                ) : (
                                    <Trash2 className="mr-1 h-3 w-3" />
                                )}
                                Delete
                            </Button>
                        </div>
                    )}

                    {/* Search */}
                    <div className="border-border border-b p-4">
                        <SearchInput
                            searchTerm={searchTerm}
                            onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            onClearSearch={() => setSearchTerm("")}
                            resultsCount={filteredFiles.length}
                            hasResults={filteredFiles.length > 0}
                            isTyping={false}
                        />
                    </div>

                    {/* Folder Controls */}
                    {!searchTerm && filteredFiles.length > 0 && (
                        <div className="border-border flex items-center justify-between border-b px-4 py-2">
                            <span className="text-muted-foreground text-xs font-medium">FOLDERS</span>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={expandAll} className="h-6 px-2 text-xs">
                                    Expand All
                                </Button>
                                <Button variant="ghost" size="sm" onClick={collapseAll} className="h-6 px-2 text-xs">
                                    Collapse All
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <section
                        className={cn(
                            "relative flex-1 overflow-auto",
                            isDragging && "bg-blue-50/30 dark:bg-blue-900/10",
                        )}
                        onDragOver={e => handleDragOver(e, "", true)}
                        onDragLeave={handleDragLeave}
                        onDrop={e => handleDrop(e, "", true)}
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
                                    <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                                        Retry
                                    </Button>
                                </Card>
                            </div>
                        )}

                        {!isLoading && !error && (
                            <>
                                {filteredFiles.length === 0 ? (
                                    <NoResults searchTerm={searchTerm} onClearSearch={() => setSearchTerm("")} />
                                ) : (
                                    <div className="space-y-1 p-2">
                                        {filteredFiles.map(item => renderFileItem(item))}
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    {/* Status Info - Only show when in selection mode but no files selected */}
                    {isSelectionModeActive && selectedFiles.length === 0 && (
                        <div className="border-border bg-muted/20 border-t p-3">
                            <div className="text-muted-foreground text-center text-xs">
                                Selection mode active - click checkboxes to select items
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Create Document Dialog */}
            <CreateDocumentDialog
                isOpen={showCreateDocumentDialog}
                onClose={() => setShowCreateDocumentDialog(false)}
                initialPath={createDocumentParentPath}
            />

            {/* Move Item Dialog */}
            <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
                <DialogContent className="bg-background/90 backdrop-blur-[90%]">
                    <DialogHeader>
                        <DialogTitle>Move "{moveItemName}"</DialogTitle>
                        <DialogDescription>Select a destination folder for "{moveItemName}"</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 space-y-1 overflow-auto">
                        {/* Root folder option */}
                        <Button
                            variant="ghost"
                            className="h-auto w-full justify-start px-2 py-1 text-left"
                            onClick={() => handleMoveToFolder("")}
                        >
                            <Folder className="mr-2 h-4 w-4" />
                            📁 Root Folder
                        </Button>
                        {/* Folder list */}
                        {renderFolderList(filteredFiles)}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
