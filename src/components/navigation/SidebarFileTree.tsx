import { FileTreeNode } from "@/components/file-manager/FileTreeNode";
import type { FileItem } from "@/components/navigation/types/Sidebar";
import { convertToFileNode } from "@/components/navigation/utils/fileTree";

interface SidebarFileTreeProps {
    items: FileItem[];
    level?: number;
    expandedFolders: Set<string>;
    handleExpandFolder: (path: string | null, itemPath: string) => void;
    searchTerm: string;
    selectedFiles: string[];
    handleSelectFile: (path: string) => void;
}

export function SidebarFileTree({
    items,
    level = 0,
    expandedFolders,
    handleExpandFolder,
    searchTerm,
    selectedFiles,
    handleSelectFile,
}: SidebarFileTreeProps) {
    return (
        <>
            {items.map(item => (
                <FileTreeNode
                    key={item.path}
                    node={convertToFileNode(item)}
                    level={level}
                    expandedFolder={expandedFolders.has(item.path) ? item.path : null}
                    setExpandedFolder={(path: string | null) => handleExpandFolder(path, item.path)}
                    searchTerm={searchTerm}
                    isSearching={!!searchTerm}
                    isSelected={selectedFiles.includes(item.path)}
                    isMultiSelectMode={selectedFiles.length > 0}
                    onToggleSelect={() => handleSelectFile(item.path)}
                    onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
                />
            ))}
        </>
    );
}
