// Types for Sidebar and file/folder tree

export interface SidebarProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
}

export interface FileItem {
    name: string;
    path: string;
    type: "file" | "folder";
    extension?: string;
    children?: FileItem[];
}

export interface FileNode {
    name: string;
    path: string;
    type: "file" | "folder";
    extension?: string;
    children: FileNode[];
}
