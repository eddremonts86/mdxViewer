import React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PopularDocument {
    /** Document title */
    title: string;
    /** Document description */
    description: string;
    /** Number of views */
    views: string;
    /** Change percentage */
    change: string;
    /** Whether the change is positive */
    isPositive?: boolean;
}

interface PopularDocumentsProps {
    /** List of popular documents */
    documents?: PopularDocument[];
    /** Loading state */
    loading?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Responsive popular documents component
 */
export function PopularDocuments({
    documents = [
        {
            title: "Introduction to MDX",
            description: "Getting started guide",
            views: "2,347 views",
            change: "+12%",
            isPositive: true,
        },
        {
            title: "Interactive Demo",
            description: "Interactive examples",
            views: "1,892 views",
            change: "+8%",
            isPositive: true,
        },
        {
            title: "API Reference",
            description: "Complete API documentation",
            views: "1,456 views",
            change: "+15%",
            isPositive: true,
        },
    ],
    loading = false,
    className = "",
}: PopularDocumentsProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Popular Documents</CardTitle>
                <CardDescription className="text-sm">Most viewed documents this month</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
                                <div className="space-y-2">
                                    <div className="h-4 w-32 animate-pulse rounded bg-muted sm:w-40" />
                                    <div className="h-3 w-24 animate-pulse rounded bg-muted sm:w-32" />
                                </div>
                                <div className="space-y-2 text-right">
                                    <div className="h-4 w-16 animate-pulse rounded bg-muted sm:w-20" />
                                    <div className="h-3 w-8 animate-pulse rounded bg-muted sm:w-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {documents.map((doc, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-sm sm:text-base">{doc.title}</p>
                                    <p className="text-xs text-muted-foreground sm:text-sm">{doc.description}</p>
                                </div>
                                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                                    <p className="font-medium text-sm sm:text-base">{doc.views}</p>
                                    <p
                                        className={`text-xs sm:text-sm ${
                                            doc.isPositive
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-red-600 dark:text-red-400"
                                        }`}
                                    >
                                        {doc.change}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}