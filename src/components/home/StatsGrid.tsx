import React from "react";

import { FileText, Folder, Hash, TrendingUp } from "lucide-react";

import { StatCard } from "./StatCard";

interface StatsGridProps {
    /** Statistics data */
    stats: {
        totalDocuments: number;
        totalFolders: number;
        mdxFiles: number;
        popularFolder: string;
    };
    /** Whether the stats are loading */
    loading?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Grid of statistics cards for the home page
 */
export function StatsGrid({ stats, loading = false, className = "" }: StatsGridProps) {
    return (
        <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
            <StatCard
                title="Total Documents"
                icon={FileText}
                value={stats.totalDocuments}
                subtitle="All file types"
                loading={loading}
            />
            <StatCard
                title="Folders"
                icon={Folder}
                value={stats.totalFolders}
                subtitle="Directory structure"
                loading={loading}
            />
            <StatCard
                title="MDX Files"
                icon={Hash}
                value={stats.mdxFiles}
                subtitle="Markdown with JSX"
                loading={loading}
            />
            <StatCard
                title="Popular Folder"
                icon={TrendingUp}
                value={stats.popularFolder}
                subtitle="Most accessed"
                loading={loading}
                valueClassName="text-lg"
            />
        </div>
    );
}