import { useRef, useState } from "react";

import { Download, FileText, Printer, Share } from "lucide-react";

import { TableOfContents } from "@/components/content/TableOfContents";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import type { Document } from "@/types";
import { exportToHTML, exportToPDF, printDocument } from "@/utils/export.utils";

interface DocumentViewerProps {
    document: Document;
    tableOfContents?: Array<{ level: number; title: string; id: string }>;
}

interface DocumentActionsProps {
    isExporting: boolean;
    onDownloadPDF: () => Promise<void>;
    onDownloadHTML: () => Promise<void>;
    onPrint: () => Promise<void>;
    onShare: () => Promise<void>;
}

function DocumentActions({ isExporting, onDownloadPDF, onDownloadHTML, onPrint, onShare }: DocumentActionsProps) {
    return (
        <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={onDownloadPDF} disabled={isExporting}>
                {isExporting ? (
                    <div className="border-primary mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                PDF
            </Button>
            <Button size="sm" variant="outline" onClick={onDownloadHTML} disabled={isExporting}>
                <FileText className="mr-2 h-4 w-4" />
                HTML
            </Button>
            <Button size="sm" variant="outline" onClick={onPrint} disabled={isExporting}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
            <Button size="sm" variant="outline" onClick={onShare}>
                <Share className="mr-2 h-4 w-4" />
                Share
            </Button>
        </div>
    );
}

interface DocumentHeaderProps {
    document: Document;
    actions: React.ReactNode;
}

function DocumentHeader({ document, actions }: DocumentHeaderProps) {
    return (
        <div className="flex items-center justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{document.title}</h1>
                <p className="text-muted-foreground text-sm">Type: {document.type.toUpperCase()}</p>
            </div>
            {actions}
        </div>
    );
}

// Hook for document actions
function useDocumentActions(
    document: Document,
    contentRef: React.RefObject<HTMLDivElement | null>,
    setIsExporting: (_value: boolean) => void,
) {
    const handleDownloadPDF = async (): Promise<void> => {
        if (!contentRef.current || !document) return;

        setIsExporting(true);
        try {
            await exportToPDF(contentRef.current, {
                filename: `${document.title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
                title: document.title,
            });
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadHTML = async (): Promise<void> => {
        if (!contentRef.current || !document) return;

        setIsExporting(true);
        try {
            await exportToHTML(contentRef.current, {
                filename: `${document.title.replace(/\s+/g, "-").toLowerCase()}.html`,
                title: document.title,
            });
        } catch (error) {
            console.error("Error exporting HTML:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handlePrint = async (): Promise<void> => {
        if (!document) return;

        setIsExporting(true);
        try {
            await printDocument();
        } catch (error) {
            console.error("Error printing:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleShare = async (): Promise<void> => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    text: `Check out this document: ${document.title}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                // Link copied successfully - using console for development feedback
            } catch (error) {
                console.error("Error copying to clipboard:", error);
            }
        }
    };

    return {
        handleDownloadPDF,
        handleDownloadHTML,
        handlePrint,
        handleShare,
    };
}

export function DocumentViewer({ document, tableOfContents = [] }: DocumentViewerProps) {
    const [isExporting, setIsExporting] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const { handleDownloadPDF, handleDownloadHTML, handlePrint, handleShare } = useDocumentActions(
        document,
        contentRef,
        setIsExporting,
    );

    const actions = (
        <DocumentActions
            isExporting={isExporting}
            onDownloadPDF={handleDownloadPDF}
            onDownloadHTML={handleDownloadHTML}
            onPrint={handlePrint}
            onShare={handleShare}
        />
    );

    return (
        <div className="flex w-full">
            {/* Document Content */}
            <div className="relative container flex-1 px-6 pt-6">
                <DocumentHeader document={document} actions={actions} />

                {/* Document Content */}
                <div className="pb-8">
                    <div ref={contentRef} className="max-w-none">
                        <MarkdownRenderer content={document.content} type={document.type} />
                    </div>
                </div>
            </div>

            {/* Table of Contents Sidebar */}
            <aside className="hidden w-80 border-l lg:block">
                <div className="sticky top-0 max-h-[calc(100vh-6rem)] overflow-y-auto p-4">
                    <TableOfContents content={document.content} items={tableOfContents} />
                </div>
            </aside>
        </div>
    );
}
