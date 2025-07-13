import { useNavigate, useParams } from "react-router-dom";

import { DocumentViewer } from "@/components/globals/DocumentViewer";
import { NavigationBreadcrumb } from "@/components/navigation/NavigationBreadcrumb";
import { useFileContent } from "@/hooks/api/useFiles";
import type { Document } from "@/types";
import { transitionToRoute } from "@/utils/viewTransitions";

// Type for breadcrumb items
type BreadcrumbItemType = "folder" | "file" | "root";

interface LocalBreadcrumbItem {
    name: string;
    path: string;
    type?: BreadcrumbItemType;
    isActive?: boolean;
}

export function DocumentPage() {
    const { "*": slug } = useParams();
    const navigate = useNavigate();

    // Remove 'document/' prefix if it exists
    const filePath = slug?.startsWith("document/") ? slug.slice(9) : slug;

    const { data: fileData, isLoading, error } = useFileContent(filePath ?? "", !!filePath);

    // Create breadcrumb items from file path
    const createBreadcrumbItems = (path: string): LocalBreadcrumbItem[] => {
        if (!path)
            return [
                {
                    name: "Home",
                    path: "/",
                    type: "root",
                    isActive: false,
                },
            ];

        const segments = path.split("/").filter(Boolean);
        const items: LocalBreadcrumbItem[] = [{ name: "Home", path: "/", type: "root", isActive: false }];

        let currentPath = "";
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === segments.length - 1;

            let navigationPath: string;
            let itemType: BreadcrumbItemType;

            if (isLast) {
                // Current file
                navigationPath = `/document${currentPath}`;
                itemType = "file";
            } else {
                // Parent folder - for now navigate to home
                // In the future, we could implement folder-specific views
                navigationPath = "/";
                itemType = "folder";
            }

            items.push({
                name: segment.replace(/\.(md|mdx)$/, ""),
                path: navigationPath,
                type: itemType,
                isActive: isLast,
            });
        });

        return items;
    };

    const breadcrumbItems = filePath ? createBreadcrumbItems(filePath) : [];

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

    if (!filePath) {
        return (
            <div className="relative container">
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 text-lg font-semibold">Welcome to MDX Viewer</h3>
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
                        <p className="text-muted-foreground text-sm">Loading document...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !fileData) {
        return (
            <div className="relative container">
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 text-lg font-semibold">Document not found</h3>
                        <p className="text-muted-foreground mt-2 mb-4 text-sm">
                            {error?.message ?? "The document you are looking for does not exist."}
                        </p>
                    </div>
                </div>
            </div>
        );
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
        <div className="w-full">
            {/* Navigation Breadcrumb */}
            {filePath && (
                <NavigationBreadcrumb
                    items={breadcrumbItems}
                    onNavigate={handleBreadcrumbNavigation}
                    isLoading={isLoading}
                    className="navigation-header"
                />
            )}

            <div className="document-content">
                <DocumentViewer document={document} tableOfContents={getTableOfContents(content)} />
            </div>
        </div>
    );
}
