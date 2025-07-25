import React from "react";

import { Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
    /** Main title of the page */
    title: string;
    /** Subtitle or description */
    description: string;
    /** Badge text to display */
    badgeText?: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Page header component for the home page
 */
export function PageHeader({
    title,
    description,
    badgeText,
    className = "",
}: PageHeaderProps) {
    return (
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
            </div>
            <div className="flex items-center gap-4">
                {badgeText && (
                    <Badge variant="secondary" className="text-xs">
                        <Calendar className="mr-1 h-3 w-3" />
                        {badgeText}
                    </Badge>
                )}
            </div>
        </div>
    );
}