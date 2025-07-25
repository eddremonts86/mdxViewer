import React from "react";

import { BarChart3, TrendingUp } from "lucide-react";

import { ChartCard } from "./ChartCard";

interface ChartsGridProps {
    /** Loading state */
    loading?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Responsive grid of chart cards for statistics visualization
 */
export function ChartsGrid({ loading = false, className = "" }: ChartsGridProps) {
    const charts = [
        {
            title: "Document Views",
            description: "Page views over the last 30 days",
            icon: BarChart3,
            placeholderText: "Views Chart",
            placeholderDescription: "Chart visualization would appear here",
        },
        {
            title: "User Engagement",
            description: "User interaction metrics",
            icon: TrendingUp,
            placeholderText: "Engagement Chart",
            placeholderDescription: "Engagement data would appear here",
        },
    ];

    return (
        <div className={`grid gap-4 sm:gap-6 lg:grid-cols-2 ${className}`}>
            {charts.map((chart, index) => (
                <ChartCard
                    key={index}
                    title={chart.title}
                    description={chart.description}
                    icon={chart.icon}
                    placeholderText={chart.placeholderText}
                    placeholderDescription={chart.placeholderDescription}
                />
            ))}
        </div>
    );
}