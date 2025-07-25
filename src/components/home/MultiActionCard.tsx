import React from "react";
import { Link } from "react-router-dom";

import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ActionButton {
    /** Button text */
    text: string;
    /** Navigation path */
    to: string;
    /** Button variant */
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

interface MultiActionCardProps {
    /** Title of the action card */
    title: string;
    /** Description of the action */
    description: string;
    /** Icon component to display */
    icon: LucideIcon;
    /** Array of action buttons */
    actions: ActionButton[];
    /** Additional CSS classes */
    className?: string;
}

/**
 * Multi-action card component with multiple navigation buttons
 */
export function MultiActionCard({
    title,
    description,
    icon: Icon,
    actions,
    className = "",
}: MultiActionCardProps) {
    return (
        <Card className={`relative overflow-hidden ${className}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {actions.map((action, index) => (
                        <Link key={index} to={action.to}>
                            <Button 
                                variant={action.variant || "outline"} 
                                className="w-full justify-start"
                            >
                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                {action.text}
                            </Button>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}