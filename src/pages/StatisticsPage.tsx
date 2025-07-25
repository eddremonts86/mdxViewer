import React from "react";

import { ChartsGrid, MetricsGrid, PopularDocuments, StatsHeader } from "@/components/stats";

export function StatisticsPage() {
    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <StatsHeader />

            {/* Main Stats Grid */}
            <MetricsGrid />

            {/* Charts Section */}
            <ChartsGrid />

            {/* Popular Documents */}
            <PopularDocuments />
        </div>
    );
}
