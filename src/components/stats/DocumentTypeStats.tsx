/**
 * Document Type Statistics Component
 * Shows the distribution of MD vs MDX files
 */

import { FileCode, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentTypeStatsProps {
    documentsByType: {
        md: number;
        mdx: number;
    };
    loading?: boolean;
}

export function DocumentTypeStats({
    documentsByType,
    loading = false,
}: DocumentTypeStatsProps) {
    const total = documentsByType.md + documentsByType.mdx;
    const mdPercentage =
        total > 0 ? Math.round((documentsByType.md / total) * 100) : 0;
    const mdxPercentage =
        total > 0 ? Math.round((documentsByType.mdx / total) * 100) : 0;

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">
                        Document Types
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-2">
                        <div className="bg-muted h-4 rounded"></div>
                        <div className="bg-muted h-4 w-3/4 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">
                    Document Types
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Markdown</span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">
                            {documentsByType.md}
                        </div>
                        <div className="text-muted-foreground text-xs">
                            {mdPercentage}%
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-green-600" />
                        <span className="text-sm">MDX</span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">
                            {documentsByType.mdx}
                        </div>
                        <div className="text-muted-foreground text-xs">
                            {mdxPercentage}%
                        </div>
                    </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="bg-muted h-2 w-full rounded-full">
                    <div className="flex h-2 overflow-hidden rounded-full">
                        <div
                            className="bg-blue-600 transition-all duration-300"
                            style={{ width: `${mdPercentage}%` }}
                        />
                        <div
                            className="bg-green-600 transition-all duration-300"
                            style={{ width: `${mdxPercentage}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
