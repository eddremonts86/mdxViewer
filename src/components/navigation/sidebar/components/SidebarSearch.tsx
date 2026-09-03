import { SearchInput } from "@/components/search/SearchInput";

import { SidebarBand } from "./SidebarBand";

interface SidebarSearchProps {
    searchTerm: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearSearch: () => void;
    resultsCount: number;
}

/** The filter band: one band, the same metrics as every other one. */
export function SidebarSearch({ searchTerm, onSearchChange, onClearSearch, resultsCount }: SidebarSearchProps) {
    return (
        <SidebarBand>
            <SearchInput
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                onClearSearch={onClearSearch}
                resultsCount={resultsCount}
            />
        </SidebarBand>
    );
}
