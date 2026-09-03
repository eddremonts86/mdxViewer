import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { FileItem } from "@/api/fileAPI";
import { CreateDocumentDialog } from "@/components/dialogs/CreateDocumentDialog";
import { DeleteDialog, type DeleteTarget } from "@/components/dialogs/DeleteDialog";
import { ImportFolderDialog } from "@/components/dialogs/ImportFolderDialog";
import { useFiles, useMoveItem } from "@/hooks/api/useFiles";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { CreateFolderDialog } from "./CreateFolderDialog";
import {
    DragIndicator,
    MoveItemDialog,
    SidebarContent,
    SidebarHeader,
    SidebarNav,
    SidebarSearch,
    SidebarSelectionBar,
} from "./sidebar/components";
import {
    useSidebarActions,
    useSidebarDialogs,
    useSidebarDragAndDrop,
    useSidebarFileSelection,
    useSidebarFolderExpansion,
} from "./sidebar/hooks";

interface SidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/** Every folder path in the tree, for expand-all. */
function folderPaths(items: FileItem[]): string[] {
    return items.flatMap(item =>
        item.type === "folder" ? [item.path, ...folderPaths(item.children ?? [])] : folderPaths(item.children ?? [])
    );
}

/** Find one item anywhere in the tree. */
function findItem(items: FileItem[], path: string): FileItem | null {
    for (const item of items) {
        if (item.path === path) return item;
        const found = item.children ? findItem(item.children, path) : null;
        if (found) return found;
    }
    return null;
}

/** How many documents disappear with this item, itself included. */
function documentsUnder(item: FileItem): number {
    if (item.type === "file") return 1;
    return (item.children ?? []).reduce((sum, child) => sum + documentsUnder(child), 0);
}

/** Keep any item that matches, and any folder with a matching descendant. */
function filterTree(items: FileItem[], term: string): FileItem[] {
    const needle = term.toLowerCase();
    return items.reduce<FileItem[]>((kept, item) => {
        const children = item.children ? filterTree(item.children, term) : [];
        if (item.name.toLowerCase().includes(needle) || children.length > 0) {
            kept.push({ ...item, children: children.length > 0 ? children : item.children });
        }
        return kept;
    }, []);
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
    const { data: files = [], isLoading, error, refetch } = useFiles();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [importing, setImporting] = useState(false);
    // The charted folder lives in the URL, so the index and the chart cannot
    // disagree about which one it is.
    const [params] = useSearchParams();
    const charted = params.get("folder");

    const moveItemMutation = useMoveItem();
    const actions = useSidebarActions(refetch);

    const { expandedFolders, toggleFolder, expandAll, collapseAll, handleFolderAutoExpansion } =
        useSidebarFolderExpansion();
    const {
        selectedFiles,
        isSelectionModeActive,
        toggleFileSelection,
        toggleSelectionMode,
        selectAllFiles,
        clearSelection,
    } = useSidebarFileSelection();
    const {
        isCreateDialogOpen,
        isMoveDialogOpen,
        moveDialogData,
        openCreateDialog,
        closeCreateDialog,
        openMoveDialog,
        closeMoveDialog,
    } = useSidebarDialogs();
    const drag = useSidebarDragAndDrop(params => moveItemMutation.mutate(params), handleFolderAutoExpansion);

    const filteredFiles = useMemo(
        () => (searchTerm.trim() ? filterTree(files, searchTerm.trim()) : files),
        [files, searchTerm]
    );

    /** Weigh what a delete will actually reach before the dialog asks. */
    const weigh = (paths: string[]): DeleteTarget[] =>
        paths.map(path => {
            const item = findItem(files, path);
            return {
                path,
                isFolder: item?.type === "folder",
                documents: item ? documentsUnder(item) : 1,
            };
        });

    /**
     * Clicking a folder charts it.
     *
     * It also opens it, because that is what a tree row does — but the reason the
     * chart is the same click is that a folder is a place in the collection, and
     * picking one should be one gesture rather than a menu. Clicking the folder
     * that is already charted lets the whole collection back in.
     */
    const handleFileClick = (item: FileItem) => {
        if (isSelectionModeActive) {
            toggleFileSelection(item.path);
            return;
        }

        if (item.type === "file") {
            navigate(`/document/${item.path}`);
            onOpenChange(false);
            return;
        }

        toggleFolder(item.path);
        navigate(charted === item.path ? "/" : `/?folder=${encodeURIComponent(item.path)}`);
    };

    const handleMoveToFolder = (targetPath: string) => {
        if (!moveDialogData) return;
        moveItemMutation.mutate(
            { sourcePath: moveDialogData.sourcePath, targetPath },
            {
                onSuccess: () => {
                    toast({
                        variant: "success",
                        title: "Object moved",
                        description: `${moveDialogData.itemName} → ${targetPath || "root"}`,
                    });
                    closeMoveDialog();
                    refetch();
                },
                onError: moveError =>
                    toast({
                        variant: "destructive",
                        title: "Could not move it",
                        description: moveError.message,
                    }),
            }
        );
    };

    return (
        <>
            <DragIndicator isDragging={drag.isDragging} draggedItemName={drag.draggedItemName} />

            {open ? (
                <button
                    type="button"
                    aria-label="Close plate index"
                    className="bg-ink/25 fixed inset-0 z-30 backdrop-blur-[1px] lg:hidden"
                    onClick={() => onOpenChange(false)}
                />
            ) : null}

            <aside
                id="plate-index"
                aria-label="Plate index"
                className={cn(
                    "bg-sky border-rule fixed top-14 bottom-0 left-0 z-40 w-[15rem] transform border-r transition-transform duration-200 ease-out lg:static lg:top-0 lg:w-60 lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    <SidebarHeader
                        onCreateFile={() => openCreateDialog()}
                        onCreateFolder={() => actions.openFolderDialog("")}
                        onUpload={actions.pickAndUpload}
                        onImportFolder={() => setImporting(true)}
                        onExpandAll={() => expandAll(folderPaths(filteredFiles))}
                        onCollapseAll={collapseAll}
                        onToggleSelectionMode={toggleSelectionMode}
                        onClose={() => onOpenChange(false)}
                        isSelectionModeActive={isSelectionModeActive}
                        isUploadPending={actions.isUploading}
                    />

                    <SidebarNav onNavigate={() => onOpenChange(false)} />

                    {selectedFiles.size > 0 && (
                        <SidebarSelectionBar
                            selectedCount={selectedFiles.size}
                            onSelectAll={() => selectAllFiles(filteredFiles)}
                            onClearSelection={clearSelection}
                            onDelete={() => actions.askToDelete(weigh(Array.from(selectedFiles)))}
                            isDeletePending={actions.isDeleting}
                        />
                    )}

                    <SidebarSearch
                        searchTerm={searchTerm}
                        onSearchChange={event => setSearchTerm(event.target.value)}
                        onClearSearch={() => setSearchTerm("")}
                        resultsCount={filteredFiles.length}
                    />

                    <SidebarContent
                        isLoading={isLoading}
                        error={error as Error | null}
                        filteredFiles={filteredFiles}
                        searchTerm={searchTerm}
                        onClearSearch={() => setSearchTerm("")}
                        onRefetch={refetch}
                        isSelectionModeActive={isSelectionModeActive}
                        selectedFiles={Array.from(selectedFiles)}
                        onSelectFile={toggleFileSelection}
                        onCheckboxChange={itemPath => toggleFileSelection(itemPath)}
                        expandedFolders={expandedFolders}
                        onToggleFolder={toggleFolder}
                        onItemClick={handleFileClick}
                        chartedFolder={charted}
                        onCreateFile={openCreateDialog}
                        onCreateFolder={actions.openFolderDialog}
                        onMoveItem={openMoveDialog}
                        onDeleteItem={path => actions.askToDelete(weigh([path]))}
                        isDragging={drag.isDragging}
                        draggedItem={drag.draggedItem}
                        draggedItemName={drag.draggedItemName}
                        dragOverFolder={drag.dragOverFolder}
                        onDragStart={drag.handleDragStart}
                        onDragEnd={drag.handleDragEnd}
                        onDragOver={drag.handleDragOver}
                        onDragLeave={drag.handleDragLeave}
                        onDrop={drag.handleDrop}
                    />
                </div>
            </aside>

            <ImportFolderDialog open={importing} onOpenChange={setImporting} onImported={refetch} />

            <CreateDocumentDialog
                open={isCreateDialogOpen}
                onOpenChange={closeCreateDialog}
                initialPath=""
                availableFolders={filteredFiles
                    .filter(item => item.type === "folder")
                    .map(folder => ({ name: folder.name, path: folder.path }))}
            />

            <CreateFolderDialog
                open={actions.folderParent !== null}
                parentPath={actions.folderParent ?? ""}
                isPending={actions.isCreatingFolder}
                onClose={actions.closeFolderDialog}
                onCreate={actions.createFolder}
            />

            <DeleteDialog
                open={actions.pendingDeletion.length > 0}
                onOpenChange={next => !next && actions.cancelDeletion()}
                targets={actions.pendingDeletion}
                isLoading={actions.isDeleting}
                onConfirm={() => actions.confirmDeletion(clearSelection)}
            />

            <MoveItemDialog
                isOpen={isMoveDialogOpen}
                onClose={closeMoveDialog}
                itemName={moveDialogData?.itemName ?? ""}
                filteredFiles={filteredFiles}
                onMoveToFolder={handleMoveToFolder}
            />
        </>
    );
}
