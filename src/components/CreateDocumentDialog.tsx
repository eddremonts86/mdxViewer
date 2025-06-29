import type { FileItem } from "@/api/fileAPI";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCreateFile, useCreateFolder, useFiles } from "@/hooks/api/useFiles";
import { FolderPlus, Loader2, Plus } from "lucide-react";
import { useState } from "react";

interface CreateDocumentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialPath?: string;
}

export function CreateDocumentDialog({
    isOpen,
    onClose,
    initialPath = "",
}: CreateDocumentDialogProps) {
    const { data: files = [] } = useFiles();
    const createFileMutation = useCreateFile();
    const createFolderMutation = useCreateFolder();

    const [fileName, setFileName] = useState("");
    const [extension, setExtension] = useState<"md" | "mdx">("md");
    const [targetFolder, setTargetFolder] = useState(initialPath);
    const [createNewFolder, setCreateNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Calculate path depth for validation
    const calculateDepth = (pathStr: string): number => {
        if (!pathStr || pathStr === "/") return 0;
        return pathStr.split("/").filter((segment) => segment.length > 0)
            .length;
    };

    // Validate depth before submission
    const validateDepth = (
        finalPath: string,
        isCreatingFolder: boolean
    ): { valid: boolean; error?: string } => {
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

    // Get all folders recursively for the dropdown with depth limit
    const getAllFolders = (
        items: FileItem[],
        currentPath = "",
        depth = 0
    ): Array<{ path: string; name: string; depth: number }> => {
        const folders: Array<{ path: string; name: string; depth: number }> =
            [];
        const MAX_DISPLAY_DEPTH = 10;

        // Add root option
        if (currentPath === "" && depth === 0) {
            folders.push({ path: "", name: "📁 Root", depth: 0 });
        }

        items.forEach((item) => {
            if (item.type === "folder") {
                const fullPath = currentPath
                    ? `${currentPath}/${item.originalName || item.name}`
                    : item.originalName || item.name;

                const folderDepth = depth + 1;

                // Only show folders within the depth limit
                if (folderDepth <= MAX_DISPLAY_DEPTH) {
                    folders.push({
                        path: fullPath,
                        name: `${"  ".repeat(depth)}📁 ${item.name}`,
                        depth: folderDepth,
                    });

                    // Recursively get subfolders only if we haven't reached the limit
                    if (item.children && folderDepth < MAX_DISPLAY_DEPTH) {
                        folders.push(
                            ...getAllFolders(
                                item.children,
                                fullPath,
                                folderDepth
                            )
                        );
                    }
                }
            }
        });

        return folders;
    };

    const availableFolders = getAllFolders(files);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fileName.trim()) return;

        // Clear previous errors
        setError(null);

        try {
            let finalTargetPath = targetFolder;

            // Create new folder if requested
            if (createNewFolder && newFolderName.trim()) {
                const newFolderPath = targetFolder
                    ? `${targetFolder}/${newFolderName.trim()}`
                    : newFolderName.trim();

                // Validate depth for folder creation
                const folderDepthValidation = validateDepth(
                    newFolderPath,
                    true
                );
                if (!folderDepthValidation.valid) {
                    setError(
                        folderDepthValidation.error || "Invalid folder depth"
                    );
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
                setError(fileDepthValidation.error || "Invalid file depth");
                return;
            }

            // Create the file
            const fileNameWithExtension = fileName.endsWith(`.${extension}`)
                ? fileName
                : `${fileName}.${extension}`;

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
            onClose();
        } catch (error) {
            console.error("Failed to create document:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to create document";
            setError(errorMessage);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-[500px] p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Plus className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">
                        Create New Document
                    </h3>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-4 h-4 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
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
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Document Name *
                        </label>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="Enter document name"
                            className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Extension Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            File Extension *
                        </label>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="extension"
                                    value="md"
                                    checked={extension === "md"}
                                    onChange={(e) =>
                                        setExtension(e.target.value as "md")
                                    }
                                    className="w-4 h-4"
                                />
                                <span>.md (Markdown)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="extension"
                                    value="mdx"
                                    checked={extension === "mdx"}
                                    onChange={(e) =>
                                        setExtension(e.target.value as "mdx")
                                    }
                                    className="w-4 h-4"
                                />
                                <span>.mdx (MDX)</span>
                            </label>
                        </div>
                    </div>

                    {/* Target Folder */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Destination Folder
                        </label>
                        <select
                            value={targetFolder}
                            onChange={(e) => setTargetFolder(e.target.value)}
                            className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {availableFolders.map((folder) => (
                                <option
                                    key={folder.path}
                                    value={folder.path}
                                >
                                    {folder.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Create New Folder Option */}
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={createNewFolder}
                                onChange={(e) =>
                                    setCreateNewFolder(e.target.checked)
                                }
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-medium">
                                Create new folder
                            </span>
                        </label>

                        {createNewFolder && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <FolderPlus className="h-4 w-4" />
                                    <span className="text-sm">
                                        New folder name:
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) =>
                                        setNewFolderName(e.target.value)
                                    }
                                    placeholder="Enter folder name"
                                    className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        )}
                    </div>

                    {/* Preview Path */}
                    <div className="p-3 bg-muted rounded-md">
                        <div className="text-sm text-muted-foreground mb-1">
                            File will be created at:
                        </div>
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

                                const finalFileName = fileName.endsWith(
                                    `.${extension}`
                                )
                                    ? fileName
                                    : `${fileName}.${extension}`;

                                return path
                                    ? `${path}/${finalFileName}`
                                    : finalFileName;
                            })()}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
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
                            {(createFileMutation.isPending ||
                                createFolderMutation.isPending) && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Create Document
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
