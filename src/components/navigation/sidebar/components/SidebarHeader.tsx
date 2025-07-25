import React from "react";

import { Loader2, Plus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
    onCreateFile: () => void;
    onUpload: () => void;
    onToggleSelectionMode: () => void;
    onClose: () => void;
    isSelectionModeActive: boolean;
    isUploadPending: boolean;
}

/**
 * Header component for the sidebar containing main action buttons
 * Handles file creation, upload, selection mode toggle, and close actions
 */
export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
    onCreateFile,
    onUpload,
    onToggleSelectionMode,
    onClose,
    isSelectionModeActive,
    isUploadPending,
}) => {
    return (
        <div className="border-border flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Files</h2>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={onCreateFile} title="New File">
                    <Plus className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUpload}
                    title="Upload Files"
                    disabled={isUploadPending}
                >
                    {isUploadPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleSelectionMode}
                    title={isSelectionModeActive ? "Exit Selection Mode" : "Enter Selection Mode"}
                    className={cn("px-2 text-xs", isSelectionModeActive && "bg-accent")}
                >
                    {isSelectionModeActive ? "Exit" : "Select"}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
                    ✕
                </Button>
            </div>
        </div>
    );
};