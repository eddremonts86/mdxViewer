import React, { useState } from "react";

import { FolderPlus, Loader2, Plus } from "lucide-react";

import type { FileItem } from "@/api/fileAPI";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateFile, useCreateFolder } from "@/hooks/api/useFiles";

interface CreateDocumentDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when dialog open state changes */
    onOpenChange: (open: boolean) => void;
    /** Initial path for file creation */
    initialPath?: string;
    /** Available folders for selection */
    availableFolders?: Array<{ name: string; path: string }>;
}

export function CreateDocumentDialog({ open, onOpenChange, initialPath = "", availableFolders = [] }: CreateDocumentDialogProps) {
    const [fileName, setFileName] = useState("");
    const [extension, setExtension] = useState<"md" | "mdx">("md");
    const [targetFolder, setTargetFolder] = useState(initialPath);
    const [createNewFolder, setCreateNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const createFileMutation = useCreateFile();
    const createFolderMutation = useCreateFolder();

    // Calculate path depth for validation
    const calculateDepth = (pathStr: string): number => {
        if (!pathStr || pathStr === "/") return 0;
        return pathStr.split("/").filter(segment => segment.length > 0).length;
    };

    // Validate depth before submission
    const validateDepth = (finalPath: string, isCreatingFolder: boolean): { valid: boolean; error?: string } => {
        const MAX_DEPTH = 10;
        const currentDepth = calculateDepth(finalPath);
        const finalDepth = isCreatingFolder ? currentDepth + 1 : currentDepth;

        if (finalDepth > MAX_DEPTH) {
            return {
                valid: false,
                error: `Maximum folder depth exceeded. Limit is ${MAX_DEPTH} levels, attempted depth is ${finalDepth}`,
            };
        }

        return { valid: true };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!fileName.trim()) {
            setError("Document name is required");
            return;
        }

        try {
            let finalTargetPath = targetFolder;

            // Create new folder if requested
            if (createNewFolder && newFolderName.trim()) {
                const newFolderPath = targetFolder ? `${targetFolder}/${newFolderName.trim()}` : newFolderName.trim();
                
                const folderDepthValidation = validateDepth(newFolderPath, true);
                if (!folderDepthValidation.valid) {
                    setError(folderDepthValidation.error ?? "Invalid folder depth");
                    return;
                }

                await createFolderMutation.mutateAsync({
                    name: newFolderName.trim(),
                    path: targetFolder,
                });

                finalTargetPath = newFolderPath;
            }

            // Validate depth for file creation
            const fileDepthValidation = validateDepth(finalTargetPath, false);
            if (!fileDepthValidation.valid) {
                setError(fileDepthValidation.error ?? "Invalid file depth");
                return;
            }

            // Create the file
            const fileNameWithExtension = fileName.endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`;

            await createFileMutation.mutateAsync({
                name: fileNameWithExtension,
                type: extension,
                path: finalTargetPath,
                content: `# ${fileName}\n\nWrite your content here...\n`,
            });

            // Reset form and close
            setFileName("");
            setExtension("md");
            setTargetFolder(initialPath);
            setCreateNewFolder(false);
            setNewFolderName("");
            setError(null);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create document:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to create document";
            setError(errorMessage);
        }
    };

    const handleCheckboxChange = (checked: boolean | "indeterminate") => {
        setCreateNewFolder(checked === true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[500px] w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Create New Document
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Error Display */}
                    {error && (
                        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* File Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fileName">Document Name *</Label>
                        <Input
                            id="fileName"
                            type="text"
                            value={fileName}
                            onChange={e => setFileName(e.target.value)}
                            placeholder="Enter document name"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Extension Selection */}
                    <div className="space-y-2">
                        <Label>File Extension *</Label>
                        <RadioGroup value={extension} onValueChange={(value: "md" | "mdx") => setExtension(value)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="md" id="md" />
                                <Label htmlFor="md">.md (Markdown)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="mdx" id="mdx" />
                                <Label htmlFor="mdx">.mdx (MDX)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Target Folder */}
                    <div className="space-y-2">
                        <Label htmlFor="targetFolder">Destination Folder</Label>
                        <Select value={targetFolder} onValueChange={setTargetFolder}>
                            <SelectTrigger id="targetFolder">
                                <SelectValue placeholder="Select a folder" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableFolders.map(folder => (
                                    <SelectItem key={folder.path} value={folder.path}>
                                        {folder.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Create New Folder Option */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="createNewFolder"
                                checked={createNewFolder}
                                onCheckedChange={handleCheckboxChange}
                            />
                            <Label htmlFor="createNewFolder">Create new folder</Label>
                        </div>

                        {createNewFolder && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FolderPlus className="h-4 w-4" />
                                    <Label htmlFor="newFolderName">New folder name:</Label>
                                </div>
                                <Input
                                    id="newFolderName"
                                    type="text"
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                    placeholder="Enter folder name"
                                />
                            </div>
                        )}
                    </div>

                    {/* Preview Path */}
                    <div className="bg-muted rounded-md p-2">
                        <div className="text-muted-foreground mb-1 text-sm">File will be created at:</div>
                        <div className="font-mono text-sm">
                            {(() => {
                                let path = "";
                                if (createNewFolder && newFolderName.trim()) {
                                    path = targetFolder
                                        ? `${targetFolder}/${newFolderName.trim()}`
                                        : newFolderName.trim();
                                } else {
                                    path = targetFolder;
                                }

                                const finalFileName = fileName.endsWith(`.${extension}`)
                                    ? fileName
                                    : `${fileName}.${extension}`;

                                return path ? `${path}/${finalFileName}` : finalFileName;
                            })()}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                !fileName.trim() ||
                                createFileMutation.isPending ||
                                createFolderMutation.isPending ||
                                (createNewFolder && !newFolderName.trim())
                            }
                        >
                            {(createFileMutation.isPending || createFolderMutation.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Document
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
