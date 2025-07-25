import React from "react";

import { Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface StatsHeaderProps {
    /** Title of the statistics page */
    title?: string;
    /** Description text */
    description?: string;
    /** Badge text for time period */
    badgeText?: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Responsive header component for statistics page
 */
export function StatsHeader({
    title = "Statistics",
    description = "Detailed analytics and usage statistics for your documents",
    badgeText = "Last 30 days",
    className = "",
}: StatsHeaderProps) {
    return (
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
            </div>
            <div className="flex items-center">
                <Badge variant="outline" className="text-xs">
                    <Calendar className="mr-1 h-3 w-3" />
                    {badgeText}
                </Badge>
            </div>
        </div>
    );
}