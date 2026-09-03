import { createContext, useContext } from "react";

import type { FileItem } from "@/api/fileAPI";

/**
 * The plate index's shared state. It used to be twenty-two props threaded
 * through every level of the recursion; a row only ever needs to read them.
 */
export interface TreeState {
    isSelectionModeActive: boolean;
    selectedFiles: string[];
    onSelectFile: (path: string) => void;
    onCheckboxChange: (path: string, checked: boolean | string) => void;

    expandedFolders: Set<string>;
    onToggleFolder: (path: string) => void;
    onItemClick: (item: FileItem) => void;

    onCreateFile: (parentPath: string) => void;
    onCreateFolder: (parentPath: string) => void;
    onMoveItem: (path: string, name: string) => void;
    onDeleteItem: (path: string) => void;

    isDragging: boolean;
    draggedItem: string | null;
    draggedItemName: string;
    dragOverFolder: string | null;
    onDragStart: (event: React.DragEvent, path: string, name: string) => void;
    onDragEnd: () => void;
    onDragOver: (event: React.DragEvent, targetPath: string, isFolder: boolean) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent, targetPath: string, isFolder: boolean) => void;
}

const TreeContext = createContext<TreeState | null>(null);

export const TreeProvider = TreeContext.Provider;

export function useTree(): TreeState {
    const state = useContext(TreeContext);
    if (!state) throw new Error("Plate index rows must render inside a TreeProvider");
    return state;
}
