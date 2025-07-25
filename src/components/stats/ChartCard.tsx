import React from "react";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartCardProps {
    /** Title of the chart */
    title: string;
    /** Description of the chart */
    description: string;
    /** Icon to display in placeholder */
    icon: LucideIcon;
    /** Placeholder text */
    placeholderText: string;
    /** Additional placeholder description */
    placeholderDescription?: string;
    /** Chart height */
    height?: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Responsive chart card component with placeholder
 */
export function ChartCard({
    title,
    description,
    icon: Icon,
    placeholderText,
    placeholderDescription,
    height = "h-[250px] sm:h-[300px]",
    className = "",
}: ChartCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className={`flex ${height} items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25`}
                >
                    <div className="text-center">
                        <Icon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50 sm:h-12 sm:w-12" />
                        <p className="text-sm text-muted-foreground sm:text-base">{placeholderText}</p>
                        {placeholderDescription && (
                            <p className="text-xs text-muted-foreground sm:text-sm">{placeholderDescription}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}