import { DocumentViewer } from "@/components/globals/DocumentViewer";
import { useFileContent } from "@/hooks/api/useFiles";
import type { Document } from "@/types";
import { useParams } from "react-router-dom";

export function DocumentPage() {
    const { "*": slug } = useParams();

    const {
        data: content,
        isLoading,
        error,
    } = useFileContent(slug || "", !!slug);

    if (!slug) {
        return (
            <div className="relative container">
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 text-lg font-semibold">
                            Welcome to MDX Viewer
                        </h3>
                        <p className="text-muted-foreground mt-2 mb-4 text-sm">
                            Select a document from the sidebar to begin viewing.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="relative container">
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <div className="border-primary mb-4 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
                        <p className="text-muted-foreground text-sm">
                            Loading document...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="relative container">
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 text-lg font-semibold">
                            Document not found
                        </h3>
                        <p className="text-muted-foreground mt-2 mb-4 text-sm">
                            {error?.message ||
                                "The document you are looking for does not exist."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Create document object from file content
    const document: Document = {
        title:
            slug
                .split("/")
                .pop()
                ?.replace(/\.(md|mdx)$/, "") || "Untitled",
        path: slug,
        content: content,
        slug: slug,
        lastModified: new Date().toISOString(),
    };

    // Simple table of contents extraction
    const getTableOfContents = (content: string) => {
        const lines = content.split("\n");
        const toc: Array<{ level: number; title: string; id: string }> = [];

        lines.forEach(line => {
            const match = line.match(/^(#{1,6})\s+(.+)$/);
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
        <DocumentViewer
            document={document}
            tableOfContents={getTableOfContents(document.content)}
        />
    );
}
