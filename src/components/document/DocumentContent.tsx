import React from "react";

import { DocumentViewer } from "@/components/globals/DocumentViewer";
import type { Document } from "@/types";

interface DocumentContentProps {
    document: Document;
    content: string;
    className?: string;
}

export function DocumentContent({ document, content, className }: DocumentContentProps) {
    // Simple table of contents extraction
    const getTableOfContents = (content: string) => {
        if (!content || typeof content !== "string") {
            return [];
        }

        const lines = content.split("\n");
        const toc: Array<{ level: number; title: string; id: string }> = [];
        const headingRegex = /^(#{1,6})\s+(.+)$/;

        lines.forEach(line => {
            const match = headingRegex.exec(line);
            if (match) {
                const level = match[1].length;
                const title = match[2];
                const id = title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
                toc.push({ level, title, id });
            }
        });

        return toc;
    };

    return (
        <div className={`document-content ${className || ""}`}>
            <DocumentViewer document={document} tableOfContents={getTableOfContents(content)} />
        </div>
    );
}