import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface SearchInputProps {
    searchTerm: string;
    onSearchChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearSearch: () => void;
    resultsCount: number;
}

/**
 * The index's own filter: names, in this column, right now.
 *
 * It is not the ⌘K palette, which reads what is *inside* every document — two
 * adjacent fields that both said "Search documents" read as one feature
 * duplicated. This one says what it filters, and the palette keeps the word
 * "search".
 *
 * Rebuilt in this world's vocabulary. It arrived as stock shadcn — `bg-card/90`,
 * `text-primary`, a 2px focus ring, `border-primary/50` — and told the reader
 * "⌘F to search", which is the browser's shortcut and not this product's.
 */
export function SearchInput({ searchTerm, onSearchChange, onClearSearch, resultsCount }: SearchInputProps) {
    return (
        <div className="group relative flex-1">
            <Search
                className={cn(
                    "pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2",
                    searchTerm ? "text-mark-read" : "text-ink-dim"
                )}
                aria-hidden="true"
            />
            <input
                type="text"
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Filter this index…"
                aria-label="Filter the plate index by name"
                className="border-rule bg-sky text-ink placeholder:text-ink-dim focus-visible:border-mark h-7 w-full rounded-[2px] border pr-14 pl-8 text-[0.75rem] outline-none"
            />

            {searchTerm ? (
                <span className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-1">
                    <span className="text-ink-dim figures text-[0.625rem] font-medium tabular-nums">
                        {resultsCount}
                    </span>
                    <button
                        type="button"
                        onClick={onClearSearch}
                        title="Clear the filter"
                        className="text-ink-dim hover:text-mark-read focus-visible:outline-mark flex h-5 w-5 items-center justify-center rounded-[2px] focus-visible:outline focus-visible:outline-offset-1"
                    >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Clear the filter</span>
                    </button>
                </span>
            ) : null}
        </div>
    );
}
