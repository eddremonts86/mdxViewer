import React from "react";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
    /** Title of the stat */
    title: string;
    /** Icon component to display */
    icon: LucideIcon;
    /** Main value to display */
    value: string | number;
    /** Subtitle or additional info */
    subtitle: string;
    /** Whether the card is in loading state */
    loading?: boolean;
    /** Additional CSS classes for the value */
    valueClassName?: string;
    /** Additional CSS classes for the card */
    className?: string;
}

/**
 * Reusable statistics card component with loading state
 */
export function StatCard({
    title,
    icon: Icon,
    value,
    subtitle,
    loading = false,
    valueClassName = "",
    className = "",
}: StatCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="animate-pulse">
                        <div className="bg-muted mb-1 h-8 w-16 rounded"></div>
                        <div className="bg-muted h-4 w-24 rounded"></div>
                    </div>
                ) : (
                    <>
                        <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
                        <p className="text-muted-foreground text-xs">{subtitle}</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}