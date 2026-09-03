import {
    ChevronsDownUp,
    ChevronsUpDown,
    FilePlus2,
    FolderInput,
    FolderPlus,
    Loader2,
    Plus,
    Upload,
    X,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BandButton, SidebarBand } from "./SidebarBand";

interface SidebarHeaderProps {
    onCreateFile: () => void;
    onCreateFolder: () => void;
    onUpload: () => void;
    onImportFolder: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onToggleSelectionMode: () => void;
    onClose: () => void;
    isSelectionModeActive: boolean;
    isUploadPending: boolean;
}

/**
 * The index's masthead: what this column is, and what can be done to it.
 *
 * The four ways of adding to the collection were four unlabelled glyphs whose
 * meanings you had to hover to learn, and they took most of a 15rem column. They
 * are one menu now, with names — the same four actions, one control, and room in
 * the band for the two that were stranded in a fourth band of their own.
 */
export function SidebarHeader({
    onCreateFile,
    onCreateFolder,
    onUpload,
    onImportFolder,
    onExpandAll,
    onCollapseAll,
    onToggleSelectionMode,
    onClose,
    isSelectionModeActive,
    isUploadPending,
}: SidebarHeaderProps) {
    return (
        <SidebarBand label="Index">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        title="Add to the collection"
                        className="text-ink-dim hover:text-ink focus-visible:outline-mark flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] focus-visible:outline focus-visible:outline-offset-1"
                    >
                        {isUploadPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Plus className="h-3.5 w-3.5" />
                        )}
                        <span className="sr-only">Add to the collection</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-panel border-rule">
                    <DropdownMenuItem onClick={onCreateFile}>
                        <FilePlus2 size={13} className="mr-2" />
                        New document
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCreateFolder}>
                        <FolderPlus size={13} className="mr-2" />
                        New folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onUpload}>
                        <Upload size={13} className="mr-2" />
                        Upload files
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onImportFolder}>
                        <FolderInput size={13} className="mr-2" />
                        Import a folder
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <BandButton label="Open all plates" onClick={onExpandAll}>
                <ChevronsUpDown className="h-3.5 w-3.5" />
            </BandButton>

            <BandButton label="Close all plates" onClick={onCollapseAll}>
                <ChevronsDownUp className="h-3.5 w-3.5" />
            </BandButton>

            <BandButton label="Draw a set" onClick={onToggleSelectionMode} pressed={isSelectionModeActive} wide>
                {isSelectionModeActive ? "Done" : "Draw"}
            </BandButton>

            <span className="lg:hidden">
                <BandButton label="Close index" onClick={onClose}>
                    <X className="h-3.5 w-3.5" />
                </BandButton>
            </span>
        </SidebarBand>
    );
}
