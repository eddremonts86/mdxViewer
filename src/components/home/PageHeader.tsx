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
 * Reusable page header component with title, description and optional badge
 */
export function PageHeader({ title, description, badgeText = "Live Data", className = "" }: PageHeaderProps) {
    return (
        <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${className}`}>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                    <Calendar className="mr-1 h-3 w-3" />
                    {badgeText}
                </Badge>
            </div>
        </div>
    );
}