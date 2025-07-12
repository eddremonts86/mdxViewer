import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { DocumentCardProps, FilterType } from "../types";

interface SearchAndFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedFilter: FilterType;
    setSelectedFilter: (filter: FilterType) => void;
    documents: DocumentCardProps[];
}

export function SearchAndFilters({
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    documents,
}: SearchAndFiltersProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                    placeholder="Search documents, folders, or content..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>
            <div className="flex gap-2">
                <Button
                    variant={selectedFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter("all")}
                >
                    All ({documents.length})
                </Button>
                <Button
                    variant={selectedFilter === "md" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter("md")}
                >
                    MD ({documents.filter(d => d.type === "md").length})
                </Button>
                <Button
                    variant={selectedFilter === "mdx" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter("mdx")}
                >
                    MDX ({documents.filter(d => d.type === "mdx").length})
                </Button>
            </div>
        </div>
    );
}
