import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SidebarSelectionBarProps {
    selectedCount: number;
    onSelectAll: () => void;
    onClearSelection: () => void;
    onDelete: () => void;
    isDeletePending: boolean;
}

/**
 * The drawn registration. The set is stated before the action fires, so the
 * reach of the next command is never a surprise.
 */
export function SidebarSelectionBar({
    selectedCount,
    onSelectAll,
    onClearSelection,
    onDelete,
    isDeletePending,
}: SidebarSelectionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="border-rule bg-mark-soft border-b px-3 py-2">
            <p className="text-mark-read figures text-[0.6875rem] font-semibold tracking-[0.13em] uppercase">
                {selectedCount} drawn
            </p>
            <div className="mt-1.5 flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-6 px-1.5">
                    All
                </Button>
                <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-6 px-1.5">
                    None
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    disabled={isDeletePending}
                    className="text-mark-read ml-auto h-6 px-1.5"
                >
                    {isDeletePending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    Delete
                </Button>
            </div>
        </div>
    );
}
