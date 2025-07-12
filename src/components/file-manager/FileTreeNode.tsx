import { useLocation } from "react-router-dom";

import { TransitionLink } from "@/components/navigation/TransitionLink";
import { cn } from "@/lib/utils";
import type { FileNode } from "@/types";

import { HighlightedText, NodeIcon, ToggleButton } from "./FileTreeNodeHelpers";
import { containsActiveFile } from "./fileTreeUtils";

import "./FileTreeNode.css";

interface FileTreeNodeProps {
    node: FileNode;
    level: number;
    expandedFolder: string | null;
    setExpandedFolder: (_path: string | null) => void;
    searchTerm?: string;
    isSearching?: boolean;
    isSelected?: boolean;
    isMultiSelectMode?: boolean;
    onToggleSelect?: (_path: string) => void;
    onContextMenu?: (_event: React.MouseEvent, _node: FileNode) => void;
}

const useNodeState = (
    node: FileNode,
    expandedFolder: string | null,
    isSearching: boolean
) => {
    const location = useLocation();
    const isActive = location.pathname === node.path;
    const hasActiveChild =
        node.type === "folder" && containsActiveFile(node, location.pathname);
    const isExpanded =
        node.type === "folder" &&
        (isSearching || hasActiveChild || expandedFolder === node.path);

    return { isActive, hasActiveChild, isExpanded };
};

const NodeButton = ({
    level,
    isActive,
    isSelected,
    onClick,
    onContextMenu,
    children,
}: {
    level: number;
    isActive: boolean;
    isSelected: boolean;
    onClick: (_e: React.MouseEvent) => void;
    onContextMenu: (_e: React.MouseEvent) => void;
    children: React.ReactNode;
}) => (
    <button
        type="button"
        className={cn(
            "file-tree-node group flex w-full items-center text-left text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground rounded-sm",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            level === 0 ? "pl-2" : "",
            isActive && "bg-accent text-accent-foreground font-medium",
            isSelected && "bg-primary/10 border-primary/20 border"
        )}
        data-level={level > 0 ? level : undefined}
        onClick={onClick}
        onContextMenu={onContextMenu}
    >
        {children}
    </button>
);

const NodeContent = ({
    node,
    searchTerm,
    isActive,
    icon,
}: {
    node: FileNode;
    searchTerm?: string;
    isActive: boolean;
    icon: React.ReactNode;
}) => (
    <div className="flex min-w-0 flex-1 items-center gap-2">
        {icon}
        {node.type === "file" ? (
            <TransitionLink
                to={node.path}
                className="flex min-w-0 flex-1 items-center"
            >
                <span className={cn("truncate", isActive && "font-medium")}>
                    <HighlightedText text={node.name} searchTerm={searchTerm} />
                </span>
            </TransitionLink>
        ) : (
            <span className={cn("truncate", isActive && "font-medium")}>
                <HighlightedText text={node.name} searchTerm={searchTerm} />
            </span>
        )}
    </div>
);

export function FileTreeNode({
    node,
    level,
    expandedFolder,
    setExpandedFolder,
    searchTerm,
    isSearching = false,
    isSelected = false,
    isMultiSelectMode = false,
    onToggleSelect,
    onContextMenu,
}: FileTreeNodeProps) {
    const { isActive, hasActiveChild, isExpanded } = useNodeState(
        node,
        expandedFolder,
        isSearching
    );

    const handleToggle = (): void => {
        if (node.type === "folder" && !isSearching) {
            setExpandedFolder(isExpanded ? null : node.path);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (isMultiSelectMode && onToggleSelect) {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect(node.path);
            return;
        }

        if (node.type === "folder") {
            e.preventDefault();
            handleToggle();
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e, node);
    };

    return (
        <div>
            <NodeButton
                level={level}
                isActive={isActive}
                isSelected={isSelected}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            >
                {node.type === "folder" && (
                    <ToggleButton
                        isExpanded={isExpanded}
                        onToggle={handleToggle}
                        isSearching={isSearching}
                    />
                )}
                <NodeContent
                    node={node}
                    searchTerm={searchTerm}
                    isActive={isActive}
                    icon={
                        <NodeIcon
                            node={node}
                            isExpanded={isExpanded}
                            hasActiveChild={hasActiveChild}
                        />
                    }
                />
            </NodeButton>

            {isExpanded && node.children && (
                <div>
                    {node.children.map(child => (
                        <FileTreeNode
                            key={child.path}
                            node={child}
                            level={level + 1}
                            expandedFolder={expandedFolder}
                            setExpandedFolder={setExpandedFolder}
                            searchTerm={searchTerm}
                            isSearching={isSearching}
                            isSelected={isSelected}
                            isMultiSelectMode={isMultiSelectMode}
                            onToggleSelect={onToggleSelect}
                            onContextMenu={onContextMenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
