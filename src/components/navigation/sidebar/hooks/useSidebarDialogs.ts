import { useState, useCallback } from "react";

interface MoveDialogData {
    sourcePath: string;
    itemName: string;
}

/**
 * Custom hook for managing dialog states in the sidebar
 * Handles create document dialog and move item dialog
 */
export const useSidebarDialogs = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
    const [moveDialogData, setMoveDialogData] = useState<MoveDialogData | null>(null);

    const openCreateDialog = useCallback((_initialPath?: string) => {
        setIsCreateDialogOpen(true);
    }, []);

    const closeCreateDialog = useCallback(() => {
        setIsCreateDialogOpen(false);
    }, []);

    const openMoveDialog = useCallback((sourcePath: string, itemName: string) => {
        setMoveDialogData({ sourcePath, itemName });
        setIsMoveDialogOpen(true);
    }, []);

    const closeMoveDialog = useCallback(() => {
        setIsMoveDialogOpen(false);
        setMoveDialogData(null);
    }, []);

    return {
        isCreateDialogOpen,
        isMoveDialogOpen,
        moveDialogData,
        openCreateDialog,
        closeCreateDialog,
        openMoveDialog,
        closeMoveDialog,
    };
};