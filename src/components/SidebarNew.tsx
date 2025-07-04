import { useMemo, useState } from "react";

import { Loader2 } from "lucide-react";

import type { FileItem } from "@/api/fileAPI";
import { FileManagerToolbar } from "@/components/FileManagerToolbar";
import { FileTreeNode } from "@/components/FileTreeNode";
import { NoResults } from "@/components/NoResults";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    useCreateFile,
    useCreateFolder,
    useDeleteFiles,
    useFiles,
    useUploadFiles,
} from "@/hooks/api/useFiles";
import { cn } from "@/lib/utils";
import type { FileNode } from "@/types";

interface SidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
    const { data: files = [], isLoading, error, refetch } = useFiles();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
        new Set()
    );

    // Mutations
    const createFileMutation = useCreateFile();
    const createFolderMutation = useCreateFolder();
    const deleteFilesMutation = useDeleteFiles();
    const uploadFilesMutation = useUploadFiles();

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createType, setCreateType] = useState<"file" | "folder">("file");
    const [createParentPath, setCreateParentPath] = useState("");

    // Filter files based on search
    const filteredFiles = useMemo(() => {
        if (!searchTerm.trim()) return files;

        const filterItems = (items: FileItem[]): FileItem[] => {
            return items.reduce<FileItem[]>((acc, item) => {
                const matchesSearch = item.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
                const filteredChildren = item.children
                    ? filterItems(item.children)
                    : [];

                if (matchesSearch || filteredChildren.length > 0) {
                    acc.push({
                        ...item,
                        children: filteredChildren,
                    });
                }

                return acc;
            }, []);
        };

        return filterItems(files);
    }, [files, searchTerm]);

    const handleSelectFile = (path: string) => {
        setSelectedFiles(prev =>
            prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
        );
    };

    const handleCreateFile = (parentPath: string = "") => {
        setCreateType("file");
        setCreateParentPath(parentPath);
        setShowCreateDialog(true);
    };

    const handleCreateFolder = (parentPath: string = "") => {
        setCreateType("folder");
        setCreateParentPath(parentPath);
        setShowCreateDialog(true);
    };

    const handleDelete = async () => {
        if (selectedFiles.length === 0) return;

        try {
            await deleteFilesMutation.mutateAsync(selectedFiles);
            setSelectedFiles([]);
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        try {
            await uploadFilesMutation.mutateAsync({
                files: Array.from(files),
                targetPath: "",
                createFolders: true,
            });
            event.target.value = ""; // Reset input
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    // Convert FileItem to FileNode for compatibility with FileTreeNode
    const convertToFileNode = (item: FileItem): FileNode => ({
        name: item.name,
        path: item.path,
        type: item.type,
        extension: item.extension,
        children: item.children?.map(convertToFileNode) || [],
    });

    const renderFileTree = (
        items: FileItem[],
        level: number = 0
    ): React.ReactNode => {
        return items.map(item => (
            <FileTreeNode
                key={item.path}
                node={convertToFileNode(item)}
                level={level}
                expandedFolder={
                    expandedFolders.has(item.path) ? item.path : null
                }
                setExpandedFolder={(path: string | null) => {
                    if (path) {
                        setExpandedFolders(prev => new Set([...prev, path]));
                    } else {
                        setExpandedFolders(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(item.path);
                            return newSet;
                        });
                    }
                }}
                searchTerm={searchTerm}
                isSearching={!!searchTerm}
                isSelected={selectedFiles.includes(item.path)}
                isMultiSelectMode={selectedFiles.length > 0}
                onToggleSelect={() => handleSelectFile(item.path)}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onDeleteItem={path => setSelectedFiles([path])}
                onContextMenu={e => e.preventDefault()}
            />
        ));
    };

    return (
        <>
            <aside
                className={cn(
                    "sidebar bg-background border-border fixed top-0 left-0 z-40 h-screen w-80 transform border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
                    open
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="border-border flex items-center justify-between border-b p-4">
                        <h2 className="text-lg font-semibold">Files</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="lg:hidden"
                        >
                            ✕
                        </Button>
                    </div>

                    {/* File Manager Toolbar */}
                    <FileManagerToolbar
                        viewMode="list"
                        onCreateFolder={() => handleCreateFolder()}
                        onCreateFile={() => handleCreateFile()}
                        onUpload={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.multiple = true;
                            input.accept = ".md,.mdx,.txt";
                            input.onchange = event => {
                                const target = event.target as HTMLInputElement;
                                const files = target.files;
                                if (files && files.length > 0) {
                                    const reactEvent = {
                                        target: target,
                                        currentTarget: target,
                                    } as React.ChangeEvent<HTMLInputElement>;
                                    handleUpload(reactEvent);
                                }
                            };
                            input.click();
                        }}
                        onDelete={handleDelete}
                        onRefresh={() => window.location.reload()}
                        hasSelectedFiles={selectedFiles.length > 0}
                        disabled={
                            createFileMutation.isPending ||
                            createFolderMutation.isPending ||
                            deleteFilesMutation.isPending
                        }
                    />

                    {/* Search */}
                    <div className="border-border border-b p-4">
                        <SearchInput
                            searchTerm={searchTerm}
                            onSearchChange={e => setSearchTerm(e.target.value)}
                            onClearSearch={() => setSearchTerm("")}
                            resultsCount={filteredFiles.length}
                            hasResults={filteredFiles.length > 0}
                            isTyping={false}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto">
                        {isLoading && (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="ml-2">Loading files...</span>
                            </div>
                        )}

                        {error && (
                            <div className="p-4">
                                <Card className="border-destructive bg-destructive/10 p-4">
                                    <p className="text-destructive text-sm">
                                        Failed to load files: {error.message}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => refetch()}
                                        className="mt-2"
                                    >
                                        Retry
                                    </Button>
                                </Card>
                            </div>
                        )}

                        {!isLoading && !error && (
                            <>
                                {filteredFiles.length === 0 ? (
                                    <NoResults
                                        searchTerm={searchTerm}
                                        onClearSearch={() => setSearchTerm("")}
                                    />
                                ) : (
                                    <div className="p-2">
                                        {renderFileTree(filteredFiles)}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Status */}
                    {selectedFiles.length > 0 && (
                        <div className="border-border border-t p-4">
                            <div className="text-muted-foreground text-xs">
                                {selectedFiles.length} file
                                {selectedFiles.length === 1 ? "" : "s"} selected
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Simple create dialog */}
            {showCreateDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-96 p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Create {createType === "file" ? "File" : "Folder"}
                        </h3>
                        <form
                            onSubmit={async e => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const name = formData.get("name") as string;

                                try {
                                    if (createType === "file") {
                                        await createFileMutation.mutateAsync({
                                            name:
                                                name.endsWith(".md") ||
                                                name.endsWith(".mdx")
                                                    ? name
                                                    : `${name}.md`,
                                            type: name.endsWith(".mdx")
                                                ? "mdx"
                                                : "md",
                                            path: createParentPath,
                                            content: "",
                                        });
                                    } else {
                                        await createFolderMutation.mutateAsync({
                                            name,
                                            path: createParentPath,
                                        });
                                    }
                                    setShowCreateDialog(false);
                                } catch (error) {
                                    console.error("Create failed:", error);
                                }
                            }}
                        >
                            <input
                                name="name"
                                placeholder={`${
                                    createType === "file" ? "File" : "Folder"
                                } name`}
                                className="border-border mb-4 w-full rounded border p-2"
                                autoFocus
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        createFileMutation.isPending ||
                                        createFolderMutation.isPending
                                    }
                                >
                                    {createFileMutation.isPending ||
                                    createFolderMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Create
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </>
    );
}
