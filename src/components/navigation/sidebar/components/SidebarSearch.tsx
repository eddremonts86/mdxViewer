import React from "react";

import { SearchInput } from "@/components/search/SearchInput";

interface SidebarSearchProps {
    searchTerm: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearSearch: () => void;
    resultsCount: number;
}

/**
 * Search component for the sidebar
 * Provides file filtering functionality
 */
export const SidebarSearch: React.FC<SidebarSearchProps> = ({
    searchTerm,
    onSearchChange,
    onClearSearch,
    resultsCount,
}) => {
    return (
        <div className="border-border border-b p-4">
            <SearchInput
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                onClearSearch={onClearSearch}
                resultsCount={resultsCount}
                hasResults={resultsCount > 0}
                isTyping={false}
            />
        </div>
    );
};