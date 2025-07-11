import { useMemo } from "react";
import type {
    DocumentCardProps,
    DocumentsByFolder,
    FilterType,
} from "../types";

export function useFilteredDocuments(
    documents: DocumentCardProps[],
    searchQuery: string,
    selectedFilter: FilterType
) {
    // Filter documents based on search and type
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch =
                searchQuery === "" ||
                doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.folder.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const matchesFilter =
                selectedFilter === "all" || doc.type === selectedFilter;

            return matchesSearch && matchesFilter;
        });
    }, [documents, searchQuery, selectedFilter]);

    // Group documents by folder
    const documentsByFolder = useMemo(() => {
        const grouped: DocumentsByFolder = {};
        filteredDocuments.forEach(doc => {
            if (!grouped[doc.folder]) {
                grouped[doc.folder] = [];
            }
            grouped[doc.folder].push(doc);
        });
        return grouped;
    }, [filteredDocuments]);

    return {
        filteredDocuments,
        documentsByFolder,
    };
}
