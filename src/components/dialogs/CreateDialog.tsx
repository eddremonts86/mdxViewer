import React, { useState } from "react";

import { FileText, FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CreateDialogProps {
    /** Whether the dialog is open */
    open?: boolean;
    /** Callback when dialog open state changes */
    onOpenChange?: (_open: boolean) => void;
    /** Callback when file/folder is created */
    onCreate?: (_type: "file" | "folder", _name: string, _path?: string) => void;
    /** Current directory path */
    currentPath?: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * CreateDialog component for creating new files and folders
 * Follows MDXViewer design system and English-only practices
 */
export const CreateDialog: React.FC<CreateDialogProps> = ({
    open,
    onOpenChange,
    onCreate,
    currentPath = "",
    className = "",
}) => {
    const [itemName, setItemName] = useState("");
    const [itemType, setItemType] = useState<"file" | "folder">("file");

    const handleCreate = () => {
        if (itemName.trim() && onCreate) {
            onCreate(itemType, itemName.trim(), currentPath);
            setItemName("");
            onOpenChange?.(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCreate();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={className}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create New
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New {itemType === "file" ? "File" : "Folder"}</DialogTitle>
                    <DialogDescription>
                        Enter a name for the new {itemType === "file" ? "file" : "folder"}.
                        {currentPath && ` It will be created in: ${currentPath}`}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex space-x-2">
                        <Button
                            type="button"
                            variant={itemType === "file" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setItemType("file")}
                            className="flex-1"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            File
                        </Button>
                        <Button
                            type="button"
                            variant={itemType === "folder" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setItemType("folder")}
                            className="flex-1"
                        >
                            <FolderPlus className="mr-2 h-4 w-4" />
                            Folder
                        </Button>
                    </div>
                    <Input
                        id="item-name"
                        placeholder={`Enter ${itemType} name...`}
                        value={itemName}
                        onChange={e => setItemName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="transition-all duration-200"
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleCreate} disabled={!itemName.trim()}>
                        Create {itemType === "file" ? "File" : "Folder"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
