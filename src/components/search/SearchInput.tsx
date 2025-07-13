import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
    searchTerm: string;
    onSearchChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearSearch: () => void;
    resultsCount: number;
    hasResults: boolean;
    isTyping?: boolean;
}

export function SearchInput({
    searchTerm,
    onSearchChange,
    onClearSearch,
    resultsCount,
    hasResults,
    isTyping = false,
}: SearchInputProps) {
    return (
        <div className="bg-card/50">
            <div className="group relative">
                <Search
                    className={cn(
                        "absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors duration-200",
                        searchTerm ? "text-primary" : "text-muted-foreground group-focus-within:text-primary",
                    )}
                />
                <Input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    className={cn(
                        "h-9 pr-9 pl-9 text-sm transition-all duration-200",
                        "focus:ring-primary/20 focus:border-primary focus:ring-2",
                        searchTerm && "border-primary/50",
                    )}
                />
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-destructive/10 hover:text-destructive absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0 transition-colors duration-200"
                        onClick={onClearSearch}
                    >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Clear search</span>
                    </Button>
                )}
            </div>
            {searchTerm && (
                <div className="animate-in slide-in-from-top-1 mt-3 duration-300">
                    <div className="flex items-center justify-between text-xs">
                        {isTyping ? (
                            <span className="text-muted-foreground animate-pulse font-medium">Searching...</span>
                        ) : (
                            <span className="text-primary font-medium">
                                {resultsCount} result
                                {resultsCount !== 1 ? "s" : ""} found
                            </span>
                        )}
                        {hasResults && !isTyping && <span className="text-muted-foreground">⌘F to search</span>}
                    </div>
                </div>
            )}
        </div>
    );
}
