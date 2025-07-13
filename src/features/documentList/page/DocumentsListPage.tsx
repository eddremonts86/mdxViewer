import { useState } from "react";

import { PreviewSystemStatus } from "@/components/progress/PreviewSystemStatus";
import { useFiles } from "@/hooks/api/useFiles";
import { useSiteStatistics } from "@/hooks/useSiteStatistics";

import {
    DocumentsGrid,
    DocumentsHeader,
    DocumentsStats,
    ErrorState,
    LoadingState,
    SearchAndFilters,
} from "../components";
import { useFilteredDocuments, useProcessedDocuments } from "../hooks";
import type { FilterType } from "../types";

export function DocumentsListPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

    // Use real API data
    const { data: files, isLoading: loading, error } = useFiles();

    // Get real statistics
    const stats = useSiteStatistics();

    // Process documents from API data
    const documents = useProcessedDocuments(files ?? []);

    // Filter and group documents
    const { filteredDocuments, documentsByFolder } = useFilteredDocuments(documents, searchQuery, selectedFilter);

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState />;
    }

    return (
        <div className="container mx-auto space-y-8 px-6 py-8">
            {/* Header Section */}
            <div className="space-y-4">
                <DocumentsHeader />

                {/* Search and Filters */}
                <SearchAndFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                    documents={documents}
                />
            </div>

            {/* Preview System Status */}
            <PreviewSystemStatus
                totalDocuments={documents.length}
                previewsAvailable={documents.filter(d => d.previewUrl).length}
                isLoading={loading}
            />

            {/* Stats Overview */}
            <DocumentsStats
                documents={documents}
                loading={stats.loading}
                totalDocuments={stats.totalDocuments}
                totalFolders={stats.totalFolders}
                mdCount={stats.documentsByType.md}
                mdxCount={stats.documentsByType.mdx}
            />

            {/* Documents Grid */}
            <DocumentsGrid
                documentsByFolder={documentsByFolder}
                filteredDocuments={filteredDocuments}
                searchQuery={searchQuery}
            />
        </div>
    );
}
