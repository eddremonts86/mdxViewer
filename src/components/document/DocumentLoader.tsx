import React from "react";

interface DocumentLoaderProps {
    message?: string;
    className?: string;
}

export function DocumentLoader({ message = "Loading document...", className }: DocumentLoaderProps) {
    return (
        <div className={`relative container ${className || ""}`}>
            <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <div className="border-primary mb-4 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
                    <p className="text-muted-foreground text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
}