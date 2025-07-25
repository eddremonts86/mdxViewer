import React from "react";

import { Eye, FileText, TrendingUp, Users } from "lucide-react";

import { MetricCard } from "./MetricCard";

interface MetricsGridProps {
    /** Loading state */
    loading?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Responsive grid of metric cards for statistics overview
 */
export function MetricsGrid({ loading = false, className = "" }: MetricsGridProps) {
    const metrics = [
        {
            title: "Total Views",
            icon: Eye,
            value: "12,489",
            change: "+20.1%",
            isPositive: true,
        },
        {
            title: "Unique Visitors",
            icon: Users,
            value: "2,350",
            change: "+180.1%",
            isPositive: true,
        },
        {
            title: "Documents",
            icon: FileText,
            value: "573",
            change: "+19%",
            isPositive: true,
        },
        {
            title: "Avg. Time",
            icon: TrendingUp,
            value: "4:12",
            change: "+7%",
            isPositive: true,
        },
    ];

    return (
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
            {metrics.map((metric, index) => (
                <MetricCard
                    key={index}
                    title={metric.title}
                    icon={metric.icon}
                    value={metric.value}
                    change={metric.change}
                    isPositive={metric.isPositive}
                    loading={loading}
                />
            ))}
        </div>
    );
}