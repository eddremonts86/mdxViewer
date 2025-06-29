import { MarkdownRenderer } from "@/components/globals/MarkdownRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import { Button } from "@/components/ui/button";
import type { Document } from "@/types";
import { exportToHTML, exportToPDF, printDocument } from "@/utils/export.utils";
import { Download, FileText, Printer, Share } from "lucide-react";
import { useRef, useState } from "react";

interface DocumentViewerProps {
    document: Document;
    tableOfContents?: Array<{ level: number; title: string; id: string }>;
}

export function DocumentViewer({
    document,
    tableOfContents = [],
}: DocumentViewerProps) {
    const [isExporting, setIsExporting] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async (): Promise<void> => {
        if (!contentRef.current || !document) return;

        setIsExporting(true);
        try {
            await exportToPDF(contentRef.current, {
                filename: `${document.title
                    .replace(/\s+/g, "-")
                    .toLowerCase()}.pdf`,
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
                filename: `${document.title
                    .replace(/\s+/g, "-")
                    .toLowerCase()}.html`,
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
                alert("Link copied to clipboard");
            } catch (error) {
                console.error("Error copying to clipboard:", error);
            }
        }
    };

    return (
        <div className="flex w-full ">
            {/* Document Content */}
            <div className="container relative flex-1 px-6 pt-6">
                {/* Document Header */}
                <div className="flex items-center justify-between py-4 space-y-2 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {document.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Type: {document.type.toUpperCase()}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <div className="w-4 h-4 mr-2 border-2 rounded-full animate-spin border-primary border-t-transparent"></div>
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            PDF
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDownloadHTML}
                            disabled={isExporting}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            HTML
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePrint}
                            disabled={isExporting}
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleShare}
                        >
                            <Share className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>

                {/* Document Content */}
                <div className="pb-8">
                    <div
                        ref={contentRef}
                        className="max-w-none"
                    >
                        <MarkdownRenderer
                            content={document.content}
                            type={document.type}
                        />
                    </div>
                </div>
            </div>

            {/* Table of Contents Sidebar */}
            <aside className="hidden border-l w-80 lg:block">
                <div className="sticky top-0 max-h-[calc(100vh-6rem)] overflow-y-auto p-4">
                    <TableOfContents
                        content={document.content}
                        items={tableOfContents}
                    />
                </div>
            </aside>
        </div>
    );
}
