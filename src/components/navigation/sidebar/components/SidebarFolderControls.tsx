import { Button } from "@/components/ui/button";

interface SidebarFolderControlsProps {
    searchTerm: string;
    hasFiles: boolean;
    onExpandAll: () => void;
    onCollapseAll: () => void;
}

export function SidebarFolderControls({
    searchTerm,
    hasFiles,
    onExpandAll,
    onCollapseAll,
}: SidebarFolderControlsProps) {
    if (searchTerm || !hasFiles) return null;

    return (
        <div className="border-rule flex items-center gap-1 border-b px-3 py-1.5">
            <span className="text-ink-dim mr-auto text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
                Plates
            </span>
            <Button variant="ghost" size="sm" onClick={onExpandAll} className="h-6 px-1.5">
                Open
            </Button>
            <Button variant="ghost" size="sm" onClick={onCollapseAll} className="h-6 px-1.5">
                Close
            </Button>
        </div>
    );
}
