import React from "react";

import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionCardProps {
    /** Title of the action card */
    title: string;
    /** Description of the action */
    description: string;
    /** Icon component to display */
    icon: LucideIcon;
    /** Button text */
    buttonText: string;
    /** Click handler for the button */
    onButtonClick: () => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Reusable quick action card component
 */
export function QuickActionCard({
    title,
    description,
    icon: Icon,
    buttonText,
    onButtonClick,
    className = "",
}: QuickActionCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-lg">{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={onButtonClick} className="w-full">
                    {buttonText}
                </Button>
            </CardContent>
        </Card>
    );
}