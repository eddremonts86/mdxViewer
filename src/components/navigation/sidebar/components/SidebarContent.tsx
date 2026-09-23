import type { FileItem } from "@/api/fileAPI";
import { NoResults } from "@/components/search/NoResults";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { TreeProvider, type TreeState } from "../TreeContext";
import { FileItemRenderer } from "./FileItemRenderer";

/** Relative widths of the placeholder rules shown while the index loads. */
const RULE_WIDTHS = [0.9, 0.6, 0.75, 0.5, 0.8, 0.45];
const RULE_OPACITY = 0.7;

interface SidebarContentProps extends TreeState {
    isLoading: boolean;
    error: Error | null;
    filteredFiles: FileItem[];
    searchTerm: string;
    onClearSearch: () => void;
    onRefetch: () => void;
}

/**
 * The index field. Everything a row needs travels by context, so the recursion
 * carries two props instead of twenty-two.
 */
export function SidebarContent({
    isLoading,
    error,
    filteredFiles,
    searchTerm,
    onClearSearch,
    onRefetch,
    ...tree
}: SidebarContentProps) {
    return (
        <section
            className={cn("relative flex-1 overflow-y-auto py-1", tree.isDragging && "bg-panel/40")}
            onDragOver={event => tree.onDragOver(event, "", true)}
            onDragLeave={tree.onDragLeave}
            onDrop={event => tree.onDrop(event, "", true)}
            aria-label="Plate index"
        >
            {tree.isDragging ? (
                <p className="border-rule text-ink-dim sticky top-0 z-10 border-b px-3 py-1.5 text-[0.6875rem] tracking-[0.08em] uppercase">
                    Drop here to move to the root plate
                </p>
            ) : null}

            {isLoading ? (
                <ul className="space-y-2 p-3" aria-busy="true">
                    {RULE_WIDTHS.map((width, row) => (
                        <li
                            key={row}
                            className="bg-rule h-2"
                            style={{ width: `${width * 100}%`, opacity: RULE_OPACITY }}
                        />
                    ))}
                </ul>
            ) : null}

            {error ? (
                <div className="p-3">
                    <p className="text-ink text-[0.8125rem] leading-relaxed">The index could not be read.</p>
                    <p className="text-ink-dim mt-1 text-[0.75rem] leading-relaxed">{error.message}</p>
                    <Button variant="outline" size="sm" onClick={onRefetch} className="mt-3">
                        Try again
                    </Button>
                </div>
            ) : null}

            {!isLoading && !error ? (
                filteredFiles.length === 0 ? (
                    <NoResults searchTerm={searchTerm} onClearSearch={onClearSearch} />
                ) : (
                    <TreeProvider value={tree}>
                        <ul role="tree" aria-label="Documents and folders">
                            {filteredFiles.map(item => (
                                <FileItemRenderer key={item.path} item={item} />
                            ))}
                        </ul>
                    </TreeProvider>
                )
            ) : null}
        </section>
    );
}
