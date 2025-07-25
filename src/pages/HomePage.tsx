import React from "react";

import { BarChart3, BookOpen, TrendingUp } from "lucide-react";

import { PopularFolders } from "@/components/content/PopularFolders";
import { RecentDocuments } from "@/components/content/RecentDocuments";
import { ErrorCard, MultiActionCard, PageHeader, StatsGrid } from "@/components/home";
import { DocumentTypeStats } from "@/components/stats/DocumentTypeStats";
import { useSiteStatistics } from "@/hooks/useSiteStatistics";

export function HomePage() {
    const statistics = useSiteStatistics();

    // Prepare stats data for StatsGrid
    const statsData = {
        totalDocuments: statistics.totalDocuments,
        totalFolders: statistics.totalFolders,
        mdxFiles: statistics.documentsByType.mdx,
        popularFolder: statistics.popularFolders[0]?.name ?? "N/A",
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <PageHeader
                title="Overview"
                description="Welcome back! Here's your document management dashboard."
                badgeText="Live Data"
            />

            {/* Stats Cards */}
            <StatsGrid stats={statsData} loading={statistics.loading} />

            {/* Charts and Activity Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Document Type Distribution */}
                <div className="lg:col-span-3">
                    <DocumentTypeStats documentsByType={statistics.documentsByType} loading={statistics.loading} />
                </div>

                {/* Popular Folders */}
                <div className="lg:col-span-4">
                    <PopularFolders popularFolders={statistics.popularFolders} loading={statistics.loading} />
                </div>
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Recent Documents */}
                <div className="lg:col-span-1">
                    <RecentDocuments recentDocuments={statistics.recentDocuments} loading={statistics.loading} />
                </div>

                {/* Quick Actions */}
                <MultiActionCard
                    title="Browse Documentation"
                    description="Explore guides, examples, and API references"
                    icon={BookOpen}
                    actions={[
                        { text: "Documentation", to: "/docs", variant: "outline" },
                        { text: "Examples", to: "/examples", variant: "outline" },
                        { text: "API Reference", to: "/api", variant: "outline" }
                    ]}
                />

                <MultiActionCard
                    title="Site Analytics"
                    description="View detailed statistics and usage data"
                    icon={BarChart3}
                    actions={[
                        { text: "View Analytics", to: "/statistics", variant: "default" },
                        { text: "Performance", to: "/statistics/performance", variant: "outline" }
                    ]}
                />
            </div>

            {/* Error State */}
            {statistics.error && (
                <ErrorCard
                    title="Error Loading Statistics"
                    message={statistics.error}
                />
            )}
        </div>
    );
}
