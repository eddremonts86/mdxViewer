import { ChevronDown, ChevronRight, MoreHorizontal, Move, Plus, Trash2 } from "lucide-react";

import type { FileItem } from "@/api/fileAPI";
import { MagnitudeDot } from "@/components/atlas";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { magnitudeFromSize } from "@/lib/atlas";
import { cn } from "@/lib/utils";

import { useTree } from "../TreeContext";

const INDENT_PER_LEVEL = 12;
const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_MS = 7 * DAY_MS;

interface FileItemRendererProps {
    item: FileItem;
    level?: number;
}

/** Files are plotted points; folders are numbered plates. */
function RowMark({ item }: { item: FileItem }) {
    if (item.type === "folder") {
        return (
            <span className="text-ink-dim figures w-[15px] shrink-0 text-center text-[0.625rem] font-semibold">
                {(item.children?.length ?? 0) || "·"}
            </span>
        );
    }

    const modified = item.lastModified ? new Date(item.lastModified) : null;
    return (
        <MagnitudeDot
            magnitude={magnitudeFromSize(item.size ?? 0)}
            variable={modified ? Date.now() - modified.getTime() < RECENT_MS : false}
        />
    );
}

function RowActions({ item, isFolder }: { item: FileItem; isFolder: boolean }) {
    const tree = useTree();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={event => event.stopPropagation()}
                    aria-label={`Actions for ${item.name}`}
                >
                    <MoreHorizontal size={12} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-panel border-rule">
                {isFolder ? (
                    <>
                        <DropdownMenuItem onClick={() => tree.onCreateFile(item.path)}>
                            <Plus size={13} className="mr-2" />
                            New document
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => tree.onCreateFolder(item.path)}>
                            <Plus size={13} className="mr-2" />
                            New folder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                ) : null}
                <DropdownMenuItem onClick={() => tree.onMoveItem(item.path, item.name)}>
                    <Move size={13} className="mr-2" />
                    Move to…
                </DropdownMenuItem>
                <DropdownMenuItem className="text-mark-read" onClick={() => tree.onDeleteItem(item.path)}>
                    <Trash2 size={13} className="mr-2" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** How a row names itself: a plate in tracked capitals, an object in italic. */
function rowLabelClass(isFolder: boolean, isDrawn: boolean): string {
    if (isFolder) {
        return cn("text-ink text-[0.75rem] font-semibold tracking-[0.09em] uppercase", isDrawn && "text-mark-read");
    }
    return cn("text-ink font-serif text-[0.875rem] italic", isDrawn && "text-mark-read");
}

interface RowButtonProps {
    item: FileItem;
    isFolder: boolean;
    isExpanded: boolean;
    hasChildren: boolean;
    isDrawn: boolean;
}

function RowButton({ item, isFolder, isExpanded, hasChildren, isDrawn }: RowButtonProps) {
    const tree = useTree();

    /**
     * Up and down walk the rows the way the tree pattern says they should.
     *
     * Tab was the only way through before, and a row holds three focusables, so
     * reaching the last of 76 documents took some 200 presses. Focus moves through
     * the rendered rows in DOM order, which is the order they are read in.
     */
    const moveFocus = (event: React.KeyboardEvent, step: number | "first" | "last") => {
        const rows = event.currentTarget.closest('[role="tree"]')?.querySelectorAll<HTMLElement>('[role="treeitem"]');
        if (!rows?.length) return;

        const here = Array.from(rows).indexOf(event.currentTarget as HTMLElement);
        const next =
            step === "first"
                ? 0
                : step === "last"
                  ? rows.length - 1
                  : Math.min(Math.max(here + step, 0), rows.length - 1);

        if (next === here) return;
        event.preventDefault();
        rows[next].focus();
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowDown") return moveFocus(event, 1);
        if (event.key === "ArrowUp") return moveFocus(event, -1);
        if (event.key === "Home") return moveFocus(event, "first");
        if (event.key === "End") return moveFocus(event, "last");

        if (!isFolder) return;
        const wantsOpen = event.key === "ArrowRight" && !isExpanded;
        const wantsClose = event.key === "ArrowLeft" && isExpanded;
        if (wantsOpen || wantsClose) {
            event.preventDefault();
            tree.onToggleFolder(item.path);
        }
    };

    return (
        <button
            type="button"
            role="treeitem"
            aria-expanded={isFolder ? isExpanded : undefined}
            aria-selected={isDrawn}
            onClick={() => tree.onItemClick(item)}
            onKeyDown={onKeyDown}
            className="focus-visible:outline-mark flex min-w-0 flex-1 items-center gap-2 py-[5px] text-left focus-visible:outline focus-visible:outline-offset-[-2px]"
        >
            <span className="text-ink-dim flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {isFolder && hasChildren ? isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} /> : null}
            </span>

            <RowMark item={item} />

            <span className={cn("min-w-0 flex-1 truncate", rowLabelClass(isFolder, isDrawn))}>{item.name}</span>
        </button>
    );
}

/**
 * One row of the plate index. Exactly one focusable control per row, so the
 * whole tree is reachable by Tab; arrows open and close a plate, which is the
 * part Tab cannot do.
 */
export function FileItemRenderer({ item, level = 0 }: FileItemRendererProps) {
    const tree = useTree();

    const isFolder = item.type === "folder";
    const isExpanded = tree.expandedFolders.has(item.path);
    const hasChildren = isFolder && (item.children?.length ?? 0) > 0;
    const isDrawn = tree.selectedFiles.includes(item.path);
    const isDropTarget = isFolder && tree.dragOverFolder === item.path;

    return (
        <li
            role="none"
            draggable
            onDragStart={event => tree.onDragStart(event, item.path, item.name)}
            onDragEnd={tree.onDragEnd}
            onDragOver={event => tree.onDragOver(event, item.path, isFolder)}
            onDragLeave={tree.onDragLeave}
            onDrop={event => tree.onDrop(event, item.path, isFolder)}
            className={cn("relative", tree.draggedItem === item.path && "opacity-40")}
        >
            <div
                className={cn(
                    "group flex items-center gap-1.5 pr-1.5 transition-colors",
                    isDrawn ? "bg-mark-soft" : "hover:bg-panel/70",
                    isDropTarget && "outline-mark bg-panel outline-1 outline-dashed"
                )}
                style={{ paddingLeft: 8 + level * INDENT_PER_LEVEL }}
            >
                {tree.isSelectionModeActive || isDrawn ? (
                    <Checkbox
                        checked={isDrawn}
                        onCheckedChange={checked => tree.onCheckboxChange(item.path, checked)}
                        onClick={event => event.stopPropagation()}
                        aria-label={`Draw ${item.name} into the set`}
                        className="h-3.5 w-3.5 shrink-0 rounded-none"
                    />
                ) : null}

                <RowButton
                    item={item}
                    isFolder={isFolder}
                    isExpanded={isExpanded}
                    hasChildren={hasChildren}
                    isDrawn={isDrawn}
                />

                <RowActions item={item} isFolder={isFolder} />
            </div>

            {isFolder && isExpanded && hasChildren ? (
                <ul role="group" className="border-rule/60 ml-[13px] border-l">
                    {item.children?.map(child => (
                        <FileItemRenderer key={child.path} item={child} level={level + 1} />
                    ))}
                </ul>
            ) : null}
        </li>
    );
}
