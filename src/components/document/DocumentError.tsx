import React from "react";

interface DocumentErrorProps {
    title?: string;
    message?: string;
    className?: string;
}

export function DocumentError({
    title = "Document not found",
    message = "The document you are looking for does not exist.",
    className,
}: DocumentErrorProps) {
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