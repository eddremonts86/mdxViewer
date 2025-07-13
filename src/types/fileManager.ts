/**
 * Types for file management operations
 */

export interface FileOperation {
    id: string;
    type: "create" | "delete" | "rename" | "move" | "copy";
    path: string;
    newPath?: string; // For rename/move operations
    isFolder?: boolean;
    metadata?: FileMetadata;
    status: "pending" | "in-progress" | "completed" | "failed";
    error?: string;
    createdAt: Date;
    completedAt?: Date;
}

export interface FileMetadata {
    title?: string;
    description?: string;
    author?: string;
    date?: string;
    tags?: string[];
    type?: "md" | "mdx";
    content?: string; // For create/edit operations
}

export interface CreateFileParams {
    path: string;
    name: string;
    content: string;
    metadata?: FileMetadata;
    type: "md" | "mdx";
}

export interface CreateFolderParams {
    path: string;
    name: string;
}

export interface DeleteFileParams {
    paths: string[];
}

export interface DeleteItemParams {
    path: string;
    isFolder: boolean;
}

export interface BatchOperation {
    id: string;
    operations: FileOperation[];
    status: "pending" | "in-progress" | "completed" | "failed";
    progress?: number;
    errors?: string[];
    createdAt: Date;
    completedAt?: Date;
    description?: string;
}

export interface FileManagerState {
    isLoading: boolean;
    operations: BatchOperation[];
    selectedFiles: string[];
    currentOperation?: BatchOperation;
    isMultiSelectMode: boolean;
    showCreateDialog: boolean;
    showDeleteDialog: boolean;
    createDialogType: "file" | "folder" | null;
    createDialogParentPath: string;
}

export interface FileTemplateData {
    title: string;
    description: string;
    author: string;
    tags: string[];
    content: string;
}

// File operation results
export interface OperationResult {
    success: boolean;
    path: string;
    error?: string;
    operation: FileOperation;
}

export interface BatchOperationResult {
    success: boolean;
    results: OperationResult[];
    errors: string[];
    totalProcessed: number;
}

// UI Component Props
export interface FileManagerContextType {
    selectedItems: Set<string>;
    isMultiSelectMode: boolean;
    currentBatchOperation: BatchOperation | null;
    setSelectedItems: (_items: Set<string>) => void;
    toggleItemSelection: (_path: string) => void;
    clearSelection: () => void;
    enterMultiSelectMode: () => void;
    exitMultiSelectMode: () => void;
    createFile: (_params: CreateFileParams) => Promise<void>;
    createFolder: (_params: CreateFolderParams) => Promise<void>;
    deleteItem: (_params: DeleteItemParams) => Promise<void>;
    batchDelete: (_params: DeleteFileParams) => Promise<void>;
}

export interface FileTreeNodeProps {
    node: import("./index").FileNode;
    level: number;
    isSelected?: boolean;
    isMultiSelectMode?: boolean;
    onSelect?: (_path: string) => void;
    onToggleSelect?: (_path: string) => void;
    onContextMenu?: (_event: React.MouseEvent, node: import("./index").FileNode) => void;
}

export interface FileManagerToolbarProps {
    selectedCount: number;
    isMultiSelectMode: boolean;
    onEnterMultiSelect: () => void;
    onExitMultiSelect: () => void;
    onCreateFile: () => void;
    onCreateFolder: () => void;
    onDeleteSelected: () => void;
    onClearSelection: () => void;
}

export interface CreateDialogProps {
    isOpen: boolean;
    type: "file" | "folder";
    parentPath: string;
    onClose: () => void;
    onConfirm: (_name: string, content?: string) => void;
}

export interface DeleteDialogProps {
    isOpen: boolean;
    items: string[];
    onClose: () => void;
    onConfirm: () => void;
}

export interface BatchProgressProps {
    operation: BatchOperation;
    onCancel?: () => void;
}
