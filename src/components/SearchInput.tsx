import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface SearchInputProps {
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
            <div className="relative group">
                <Search
                    className={cn(
                        "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200",
                        searchTerm
                            ? "text-primary"
                            : "text-muted-foreground group-focus-within:text-primary"
                    )}
                />
                <Input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    className={cn(
                        "pl-9 pr-9 h-9 text-sm transition-all duration-200",
                        "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                        searchTerm && "border-primary/50"
                    )}
                />
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute p-0 transition-colors duration-200 -translate-y-1/2 right-1 top-1/2 h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                        onClick={onClearSearch}
                    >
                        <X className="w-3 h-3" />
                        <span className="sr-only">Clear search</span>
                    </Button>
                )}
            </div>
            {searchTerm && (
                <div className="mt-3 duration-300 animate-in slide-in-from-top-1">
                    <div className="flex items-center justify-between text-xs">
                        {isTyping ? (
                            <span className="font-medium text-muted-foreground animate-pulse">
                                Searching...
                            </span>
                        ) : (
                            <span className="font-medium text-primary">
                                {resultsCount} result
                                {resultsCount !== 1 ? "s" : ""} found
                            </span>
                        )}
                        {hasResults && !isTyping && (
                            <span className="text-muted-foreground">
                                ⌘F to search
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
