import React from "react";

interface SidebarStatusInfoProps {
    isSelectionModeActive: boolean;
    selectedCount: number;
}

/**
 * Status information component for the sidebar
 * Shows helpful messages when in selection mode
 */
export const SidebarStatusInfo: React.FC<SidebarStatusInfoProps> = ({
    isSelectionModeActive,
    selectedCount,
}) => {
    if (!isSelectionModeActive || selectedCount > 0) return null;

    return (
        <div className="border-border bg-muted/20 border-t p-3">
            <div className="text-muted-foreground text-center text-xs">
                Selection mode active - click checkboxes to select items
            </div>
        </div>
    );
};