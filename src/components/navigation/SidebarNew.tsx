// Clean import block, absolute paths only, no duplicates
import { useMemo, useState } from "react";

import { Loader2 } from "lucide-react";

import { FileManagerToolbar } from "@/components/file-manager/FileManagerToolbar";
import { useFileDelete } from "@/components/navigation/hooks/useFileDelete";
import { useFileDialog } from "@/components/navigation/hooks/useFileDialog";
import { useFileUpload } from "@/components/navigation/hooks/useFileUpload";
import { useSidebarSelection } from "@/components/navigation/hooks/useSidebarSelection";
import { SidebarCreateDialog } from "@/components/navigation/SidebarCreateDialog";
import { SidebarFileTree } from "@/components/navigation/SidebarFileTree";
import type { SidebarProps } from "@/components/navigation/types/Sidebar";
import { triggerFileInput } from "@/components/navigation/utils/fileInput";
import { filterFilesBySearch } from "@/components/navigation/utils/filterFiles";
import { NoResults } from "@/components/search/NoResults";
import { SearchInput } from "@/components/search/SearchInput";
import { Button } from "@/components/ui/button";
import { useCreateFile, useCreateFolder, useFiles } from "@/hooks/api/useFiles";
import { cn } from "@/lib/utils";

export function Sidebar({ open, onOpenChange }: SidebarProps) {
    const { data: files = [], isLoading, error, refetch } = useFiles();
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog state and actions
    const { showCreateDialog, createType, createParentPath, openCreateFile, openCreateFolder, closeDialog } =
        useFileDialog();

    // Selection and expansion state via custom hook
    const { selectedFiles, setSelectedFiles, expandedFolders, handleSelectFile, handleExpandFolder } =
        useSidebarSelection();

    // Upload and delete hooks
    const { handleUpload } = useFileUpload();
    const { handleDelete, deleteFilesMutation } = useFileDelete(selectedFiles, setSelectedFiles);
    const createFileMutation = useCreateFile();
    const createFolderMutation = useCreateFolder();

    // Filter files based on search
    const filteredFiles = useMemo(() => filterFilesBySearch(files, searchTerm), [files, searchTerm]);

    return (
        <>
            <aside
                className={cn(
                    "sidebar bg-background border-border fixed top-0 left-0 z-40 h-screen w-80 transform border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="border-border flex items-center justify-between border-b p-4">
                        <h2 className="text-lg font-semibold">Files</h2>
                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="lg:hidden">
                            ✕
                        </Button>
                    </div>

                    {/* File Manager Toolbar */}
                    <FileManagerToolbar
                        viewMode="list"
                        onCreateFolder={() => openCreateFolder()}
                        onCreateFile={() => openCreateFile()}
                        onUpload={() => triggerFileInput(handleUpload)}
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
                            onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                                <div className="border-destructive bg-destructive/10 p-4">
                                    <p className="text-destructive text-sm">Failed to load files: {error.message}</p>
                                    <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!isLoading && !error && (
                            <>
                                {filteredFiles.length === 0 ? (
                                    <NoResults searchTerm={searchTerm} onClearSearch={() => setSearchTerm("")} />
                                ) : (
                                    <div className="p-2">
                                        <SidebarFileTree
                                            items={filteredFiles}
                                            expandedFolders={expandedFolders}
                                            handleExpandFolder={handleExpandFolder}
                                            searchTerm={searchTerm}
                                            selectedFiles={selectedFiles}
                                            handleSelectFile={handleSelectFile}
                                        />
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
            <SidebarCreateDialog
                show={showCreateDialog}
                createType={createType}
                createParentPath={createParentPath}
                closeDialog={closeDialog}
                createFileMutation={createFileMutation}
                createFolderMutation={createFolderMutation}
            />
        </>
    );
}
