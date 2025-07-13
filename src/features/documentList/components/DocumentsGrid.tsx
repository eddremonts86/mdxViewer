import { BookOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { DocumentsByFolder } from "../types";
import { DocumentCard } from "./DocumentCard";

interface DocumentsGridProps {
    documentsByFolder: DocumentsByFolder;
    filteredDocuments: unknown[];
    searchQuery: string;
}

export function DocumentsGrid({ documentsByFolder, filteredDocuments, searchQuery }: DocumentsGridProps) {
    if (filteredDocuments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                    <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-semibold">No documents found</h3>
                    <p className="text-muted-foreground">
                        {searchQuery ? `No documents match "${searchQuery}"` : "No documents available to display"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {Object.entries(documentsByFolder).map(([folder, docs]) => (
                <div key={folder} className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold capitalize">{folder.replace(/[-_]/g, " ")}</h2>
                        <Badge variant="secondary" className="text-xs">
                            {docs.length} document
                            {docs.length !== 1 ? "s" : ""}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {docs.map((doc, index) => (
                            <DocumentCard key={`${doc.path}-${index}`} {...doc} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
