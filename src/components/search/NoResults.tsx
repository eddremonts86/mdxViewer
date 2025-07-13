import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NoResultsProps {
    searchTerm: string;
    onClearSearch: () => void;
}

export function NoResults({ searchTerm, onClearSearch }: NoResultsProps) {
    return (
        <div className="text-muted-foreground animate-in fade-in-50 py-8 text-center text-sm duration-300">
            <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                    <Search className="h-8 w-8 opacity-50" />
                    <div className="bg-destructive absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full">
                        <X className="text-destructive-foreground h-2 w-2" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="font-medium">No documents found</p>
                    <p className="text-xs">No results for "{searchTerm}"</p>
                    <Button variant="ghost" size="sm" onClick={onClearSearch} className="mt-2 h-7 text-xs">
                        Clear search
                    </Button>
                </div>
            </div>
        </div>
    );
}
