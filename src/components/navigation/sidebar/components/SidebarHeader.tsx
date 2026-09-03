import { FilePlus2, FolderInput, FolderPlus, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
    onCreateFile: () => void;
    onCreateFolder: () => void;
    onUpload: () => void;
    onImportFolder: () => void;
    onToggleSelectionMode: () => void;
    onClose: () => void;
    isSelectionModeActive: boolean;
    isUploadPending: boolean;
}

/** The index's masthead: what this column is, and the four ways to add to it. */
export function SidebarHeader({
    onCreateFile,
    onCreateFolder,
    onUpload,
    onImportFolder,
    onToggleSelectionMode,
    onClose,
    isSelectionModeActive,
    isUploadPending,
}: SidebarHeaderProps) {
    return (
        <div className="border-rule flex items-center gap-1 border-b px-3 py-2.5">
            <h2 className="text-mark-read mr-auto text-[0.6875rem] font-semibold tracking-[0.15em] uppercase">Index</h2>

            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCreateFile} title="New document">
                <FilePlus2 className="h-3.5 w-3.5" />
                <span className="sr-only">New document</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCreateFolder} title="New folder">
                <FolderPlus className="h-3.5 w-3.5" />
                <span className="sr-only">New folder</span>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onUpload}
                disabled={isUploadPending}
                title="Upload files"
            >
                {isUploadPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Upload className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">Upload files</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onImportFolder} title="Import a folder">
                <FolderInput className="h-3.5 w-3.5" />
                <span className="sr-only">Import a folder</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSelectionMode}
                aria-pressed={isSelectionModeActive}
                className={cn("h-7 px-2", isSelectionModeActive && "bg-mark-soft text-mark-read")}
            >
                {isSelectionModeActive ? "Done" : "Draw"}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 lg:hidden" onClick={onClose}>
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Close index</span>
            </Button>
        </div>
    );
}
