import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface NoResultsProps {
    searchTerm: string;
    onClearSearch: () => void;
}

export function NoResults({ searchTerm, onClearSearch }: NoResultsProps) {
    return (
        <div className="py-8 text-sm text-center duration-300 text-muted-foreground animate-in fade-in-50">
            <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                    <Search className="w-8 h-8 opacity-50" />
                    <div className="absolute flex items-center justify-center w-3 h-3 rounded-full -top-1 -right-1 bg-destructive">
                        <X className="w-2 h-2 text-destructive-foreground" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="font-medium">No documents found</p>
                    <p className="text-xs">No results for "{searchTerm}"</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearSearch}
                        className="mt-2 text-xs h-7"
                    >
                        Clear search
                    </Button>
                </div>
            </div>
        </div>
    );
}
