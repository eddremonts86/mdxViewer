import React from "react";

import { Button } from "@/components/ui/button";

interface SidebarFolderControlsProps {
    searchTerm: string;
    hasFiles: boolean;
    onExpandAll: () => void;
    onCollapseAll: () => void;
}

/**
 * Folder controls component for the sidebar
 * Provides expand/collapse all functionality for folders
 */
export const SidebarFolderControls: React.FC<SidebarFolderControlsProps> = ({
    searchTerm,
    hasFiles,
    onExpandAll,
    onCollapseAll,
}) => {
    if (searchTerm || !hasFiles) return null;

    return (
        <div className="border-border flex items-center justify-between border-b px-4 py-2">
            <span className="text-muted-foreground text-xs font-medium">FOLDERS</span>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={onExpandAll} className="h-6 px-2 text-xs">
                    Expand All
                </Button>
                <Button variant="ghost" size="sm" onClick={onCollapseAll} className="h-6 px-2 text-xs">
                    Collapse All
                </Button>
            </div>
        </div>
    );
};