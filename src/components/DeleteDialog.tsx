import React from "react";

import { AlertTriangle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when dialog open state changes */
    onOpenChange: (open: boolean) => void;
    /** Callback when deletion is confirmed */
    onConfirm: () => void;
    /** Name of the item being deleted */
    itemName?: string;
    /** Type of item being deleted */
    itemType?: "file" | "folder";
    /** Whether the delete operation is loading */
    isLoading?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * DeleteDialog component for confirming file/folder deletion
 * Follows MDXViewer design system and English-only practices
 */
export const DeleteDialog: React.FC<DeleteDialogProps> = ({
    open,
    onOpenChange,
    onConfirm,
    itemName = "item",
    itemType = "file",
    isLoading = false,
    className = "",
}) => {
    const handleConfirm = () => {
        onConfirm();
    };

    const getButtonText = () => {
        if (isLoading) return "Deleting...";
        return `Delete ${itemType === "file" ? "File" : "Folder"}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`sm:max-w-md ${className}`}>
                <DialogHeader>
                    <DialogTitle className="text-destructive flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span>
                            Delete {itemType === "file" ? "File" : "Folder"}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="text-foreground font-semibold">
                            "{itemName}"
                        </span>
                        ?
                        {itemType === "folder" && (
                            <span className="text-destructive/80 mt-2 block">
                                This will also delete all files and subfolders
                                inside it.
                            </span>
                        )}
                        <span className="mt-2 block font-medium">
                            This action cannot be undone.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex items-center space-x-2"
                    >
                        {isLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        <span>{getButtonText()}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
