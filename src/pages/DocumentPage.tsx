import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { DocumentContent, DocumentError, DocumentHeader, DocumentLoader, DocumentWelcome } from "@/components/document";
import { useFileContent } from "@/hooks/api/useFiles";
import type { Document } from "@/types";
import { transitionToRoute } from "@/utils/viewTransitions";

export function DocumentPage() {
    const { "*": slug } = useParams();
    const navigate = useNavigate();

    // Remove 'document/' prefix if it exists
    const filePath = slug?.startsWith("document/") ? slug.slice(9) : slug;

    const { data: fileData, isLoading, error } = useFileContent(filePath ?? "", !!filePath);

    const handleBreadcrumbNavigation = async (path: string) => {
        // Use View Transitions utility for smooth navigation
        await transitionToRoute(
            () => {
                navigate(path);
            },
            {
                transitionName: "breadcrumb-navigation",
                debug: process.env.NODE_ENV === "development",
            },
        );
    };

    // No file path - show welcome screen
    if (!filePath) {
        return <DocumentWelcome />;
    }

    // Loading state
    if (isLoading) {
        return <DocumentLoader />;
    }

    // Error state
    if (error || !fileData) {
        return <DocumentError message={error?.message} />;
    }

    // Extract content from the file data
    const { content } = fileData;

    // Create document object from file content
    const document: Document = {
        title:
            filePath
                ?.split("/")
                .pop()
                ?.replace(/\.(md|mdx)$/, "") ?? "Untitled",
        path: filePath ?? "",
        content,
        type: filePath?.endsWith(".mdx") ? "mdx" : "md",
    };

    return (
        <div className="w-full">
            {/* Navigation Header */}
            <DocumentHeader
                filePath={filePath}
                isLoading={isLoading}
                onNavigate={handleBreadcrumbNavigation}
            />

            {/* Document Content */}
            <DocumentContent document={document} content={content} />
        </div>
    );
}
