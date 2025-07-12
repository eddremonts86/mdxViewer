import { BookOpen, Calendar, File, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { DocumentCardProps } from "../types";

interface DocumentsStatsProps {
    documents: DocumentCardProps[];
    loading: boolean;
    totalDocuments: number;
    totalFolders: number;
    mdCount: number;
    mdxCount: number;
}

export function DocumentsStats({
    documents,
    loading,
    totalDocuments,
    totalFolders,
    mdCount,
    mdxCount,
}: DocumentsStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Documents
                    </CardTitle>
                    <BookOpen className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {loading ? "..." : totalDocuments}
                    </div>
                    <p className="text-muted-foreground text-xs">
                        Across all folders
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Previews Available
                    </CardTitle>
                    <div className="text-muted-foreground text-lg">🖼️</div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {documents.filter(d => d.previewUrl).length}
                    </div>
                    <p className="text-muted-foreground text-xs">
                        {Math.round(
                            (documents.filter(d => d.previewUrl).length /
                                documents.length) *
                                100,
                        ) || 0}
                        % coverage
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Markdown Files
                    </CardTitle>
                    <File className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {loading ? "..." : mdCount}
                    </div>
                    <p className="text-muted-foreground text-xs">
                        Static content
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        MDX Files
                    </CardTitle>
                    <FileText className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {loading ? "..." : mdxCount}
                    </div>
                    <p className="text-muted-foreground text-xs">
                        Interactive content
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Folders
                    </CardTitle>
                    <Calendar className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {loading ? "..." : totalFolders}
                    </div>
                    <p className="text-muted-foreground text-xs">
                        Organization units
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
