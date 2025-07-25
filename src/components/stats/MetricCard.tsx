import React from "react";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
    /** Title of the metric */
    title: string;
    /** Icon component to display */
    icon: LucideIcon;
    /** Main value to display */
    value: string | number;
    /** Change percentage or description */
    change?: string;
    /** Whether the change is positive */
    isPositive?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Responsive metric card component for statistics
 */
export function MetricCard({
    title,
    icon: Icon,
    value,
    change,
    isPositive = true,
    loading = false,
    className = "",
}: MetricCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        <div className="h-6 w-16 animate-pulse rounded bg-muted sm:h-8" />
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    </div>
                ) : (
                    <>
                        <div className="text-xl font-bold sm:text-2xl">{value}</div>
                        {change && (
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                <span
                                    className={
                                        isPositive
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : "text-red-600 dark:text-red-400"
                                    }
                                >
                                    {change}
                                </span>{" "}
                                from last month
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}