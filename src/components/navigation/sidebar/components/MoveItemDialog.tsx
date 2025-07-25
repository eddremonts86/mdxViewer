import React from "react";

import { Folder } from "lucide-react";

import type { FileItem } from "@/api/fileAPI";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MoveItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    filteredFiles: FileItem[];
    onMoveToFolder: (targetPath: string) => void;
}

/**
 * Dialog component for moving files and folders
 * Provides a folder selection interface for move operations
 */
export const MoveItemDialog: React.FC<MoveItemDialogProps> = ({
    isOpen,
    onClose,
    itemName,
    filteredFiles,
    onMoveToFolder,
}) => {
    const renderFolderList = (items: FileItem[], level = 0): React.ReactNode[] =>
        items
            .map(item => {
                if (item.type === "folder") {
                    const hasChildren = item.children && item.children.length > 0;
                    return (
                        <div key={item.path}>
                            <Button
                                variant="ghost"
                                className={`h-auto w-full justify-start px-2 py-1 text-left ${level > 0 ? "ml-4" : ""}`}
                                onClick={() => onMoveToFolder(item.path)}
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-full max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Move "{itemName}"</DialogTitle>
                    <DialogDescription>Select a destination folder for "{itemName}"</DialogDescription>
                </DialogHeader>
                <div className="max-h-80 space-y-1 overflow-auto">
                    {/* Root folder option */}
                    <Button
                        variant="ghost"
                        className="h-auto w-full justify-start px-2 py-1 text-left"
                        onClick={() => onMoveToFolder("")}
                    >
                        <Folder className="mr-2 h-4 w-4" />
                        📁 Root Folder
                    </Button>
                    {/* Folder list */}
                    {renderFolderList(filteredFiles)}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};