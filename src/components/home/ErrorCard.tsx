import React from "react";

import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorCardProps {
    /** Error title */
    title?: string;
    /** Error message */
    message: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Reusable error card component
 */
export function ErrorCard({ title = "Error", message, className = "" }: ErrorCardProps) {
    return (
        <Alert variant="destructive" className={className}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}