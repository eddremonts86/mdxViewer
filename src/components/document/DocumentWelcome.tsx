import React from "react";

interface DocumentWelcomeProps {
    title?: string;
    message?: string;
    className?: string;
}

export function DocumentWelcome({
    title = "Welcome to MDX Viewer",
    message = "Select a document from the sidebar to begin viewing.",
    className,
}: DocumentWelcomeProps) {
    return (
        <div className={`relative container ${className || ""}`}>
            <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                    <p className="text-muted-foreground mt-2 mb-4 text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
}