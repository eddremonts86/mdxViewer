import React from "react";

import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SidebarSelectionBarProps {
    selectedCount: number;
    onSelectAll: () => void;
    onClearSelection: () => void;
    onDelete: () => void;
    isDeletePending: boolean;
}

/**
 * Selection control bar component for the sidebar
 * Shows when files are selected and provides bulk actions
 */
export const SidebarSelectionBar: React.FC<SidebarSelectionBarProps> = ({
    selectedCount,
    onSelectAll,
    onClearSelection,
    onDelete,
    isDeletePending,
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="bg-accent/20 border-border flex items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">{selectedCount} selected</span>
                <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-6 px-2 text-xs">
                    Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-6 px-2 text-xs">
                    Clear
                </Button>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={isDeletePending}
                className="h-6 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            >
                {isDeletePending ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                    <Trash2 className="mr-1 h-3 w-3" />
                )}
                Delete
            </Button>
        </div>
    );
};