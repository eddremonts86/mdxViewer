/**
 * Utility functions and components for FileTreeNode
 */
import type { ReactNode } from "react";

import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FileNode } from "@/types";

// Toggle button component
interface ToggleButtonProps {
    isExpanded: boolean;
    onToggle: () => void;
    isSearching: boolean;
}

export const ToggleButton = ({ isExpanded, onToggle, isSearching }: ToggleButtonProps) => (
    <Button
        variant="ghost"
        size="sm"
        onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            if (!isSearching) {
                onToggle();
            }
        }}
        className="h-4 w-4 p-0 hover:bg-transparent"
        disabled={isSearching}
        type="button"
    >
        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
    </Button>
);

// Node icon component
interface NodeIconProps {
    node: FileNode;
    isExpanded: boolean;
    hasActiveChild: boolean;
}

export const NodeIcon = ({ node, isExpanded, hasActiveChild }: NodeIconProps) => {
    if (node.type === "folder") {
        const iconClass = cn(
            "w-4 h-4 min-w-4 flex-shrink-0",
            hasActiveChild ? "text-primary" : "text-muted-foreground",
        );
        return isExpanded ? <FolderOpen className={iconClass} /> : <Folder className={iconClass} />;
    }

    return <File className="text-muted-foreground h-4 w-4 min-w-4 flex-shrink-0" />;
};

// Highlighted text component
interface HighlightedTextProps {
    text: string;
    searchTerm?: string;
}

export const HighlightedText = ({ text, searchTerm }: HighlightedTextProps): ReactNode => {
    if (!searchTerm?.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? (
            <mark key={`${part}-${index}`} className="rounded bg-yellow-200 px-1 dark:bg-yellow-800">
                {part}
            </mark>
        ) : (
            part
        ),
    );
};
