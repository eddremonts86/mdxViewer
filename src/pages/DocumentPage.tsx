import { DocumentViewer } from "@/components/globals/DocumentViewer";
import { useFileContent } from "@/hooks/api/useFiles";
import type { Document } from "@/types";
import { useParams } from "react-router-dom";

export function DocumentPage() {
    const { "*": slug } = useParams();

    // Remove 'document/' prefix if it exists
    const filePath = slug?.startsWith("document/") ? slug.slice(9) : slug;

    const {
        data: fileData,
        isLoading,
        error,
    } = useFileContent(filePath ?? "", !!filePath);

    if (!filePath) {
        return (
            <div className="container relative">
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 text-lg font-semibold">
                            Welcome to MDX Viewer
                        </h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground">
                            Select a document from the sidebar to begin viewing.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container relative">
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
                        <p className="text-sm text-muted-foreground">
                            Loading document...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !fileData) {
        return (
            <div className="container relative">
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 text-lg font-semibold">
                            Document not found
                        </h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground">
                            {error?.message ??
                                "The document you are looking for does not exist."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Extract content from the file data
    const content = fileData.content;

    // Create document object from file content
    const document: Document = {
        title:
            filePath
                ?.split("/")
                .pop()
                ?.replace(/\.(md|mdx)$/, "") ?? "Untitled",
        path: filePath ?? "",
        content: content,
        type: filePath?.endsWith(".mdx") ? "mdx" : "md",
    };

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
        <DocumentViewer
            document={document}
            tableOfContents={getTableOfContents(content)}
        />
    );
}
