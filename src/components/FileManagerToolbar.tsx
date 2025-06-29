import React from "react";

import {
    Download,
    FileText,
    FolderPlus,
    Grid3X3,
    List,
    RefreshCw,
    Trash2,
    Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FileManagerToolbarProps {
    /** Current view mode */
    viewMode?: "list" | "grid";
    /** Callback when view mode changes */
    onViewModeChange?: (mode: "list" | "grid") => void;
    /** Callback for creating new folder */
    onCreateFolder?: () => void;
    /** Callback for creating new file */
    onCreateFile?: () => void;
    /** Callback for uploading files */
    onUpload?: () => void;
    /** Callback for downloading selected files */
    onDownload?: () => void;
    /** Callback for deleting selected files */
    onDelete?: () => void;
    /** Callback for refreshing */
    onRefresh?: () => void;
    /** Whether any files are selected */
    hasSelectedFiles?: boolean;
    /** Whether operations are disabled */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * FileManagerToolbar component with file management actions
 * Uses shadcn/ui components and Lucide icons
 * Follows MDXViewer design system and English-only practices
 */
export const FileManagerToolbar: React.FC<FileManagerToolbarProps> = ({
    viewMode = "list",
    onViewModeChange,
    onCreateFolder,
    onCreateFile,
    onUpload,
    onDownload,
    onDelete,
    onRefresh,
    hasSelectedFiles = false,
    disabled = false,
    className,
}) => {
    return (
        <TooltipProvider>
            <div
                className={cn(
                    "bg-background flex items-center gap-2 border-b p-2",
                    className
                )}
            >
                {/* Create actions */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCreateFolder}
                                disabled={disabled}
                                className="h-8 w-8 p-0"
                            >
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Create Folder</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCreateFile}
                                disabled={disabled}
                                className="h-8 w-8 p-0"
                            >
                                <FileText className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Create File</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* File operations */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onUpload}
                                disabled={disabled}
                                className="h-8 w-8 p-0"
                            >
                                <Upload className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Upload Files</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDownload}
                                disabled={disabled || !hasSelectedFiles}
                                className="h-8 w-8 p-0"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Download Selected</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                disabled={disabled || !hasSelectedFiles}
                                className="text-destructive hover:text-destructive h-8 w-8 p-0"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete Selected</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* View controls */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    viewMode === "list" ? "default" : "ghost"
                                }
                                size="sm"
                                onClick={() => onViewModeChange?.("list")}
                                disabled={disabled}
                                className="h-8 w-8 p-0"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>List View</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    viewMode === "grid" ? "default" : "ghost"
                                }
                                size="sm"
                                onClick={() => onViewModeChange?.("grid")}
                                disabled={disabled}
                                className="h-8 w-8 p-0"
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Grid View</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Refresh */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefresh}
                            disabled={disabled}
                            className="h-8 w-8 p-0"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Refresh</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};
