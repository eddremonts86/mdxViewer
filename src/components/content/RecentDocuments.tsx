/**
 * Recent Documents Component
 * Shows recently accessed or created documents
 */

import { Link } from "react-router-dom";

import { Clock, FileCode, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentDocumentsProps {
    recentDocuments: Array<{
        name: string;
        path: string;
        type: "md" | "mdx";
        folder: string;
    }>;
    loading?: boolean;
}

export function RecentDocuments({ recentDocuments, loading = false }: RecentDocumentsProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Documents</CardTitle>
                    <Clock className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="bg-muted h-4 w-4 rounded"></div>
                                <div className="flex-1">
                                    <div className="bg-muted mb-1 h-4 rounded"></div>
                                    <div className="bg-muted h-3 w-16 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Documents</CardTitle>
                <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {recentDocuments.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No recent documents</p>
                    ) : (
                        recentDocuments.map(doc => (
                            <Link
                                key={doc.path}
                                to={doc.path}
                                className="hover:bg-muted/50 group flex items-center gap-3 rounded-lg p-2 transition-colors"
                            >
                                {doc.type === "mdx" ? (
                                    <FileCode className="h-4 w-4 flex-shrink-0 text-green-600" />
                                ) : (
                                    <FileText className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="group-hover:text-primary truncate text-sm font-medium">
                                        {doc.name}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                                            {doc.folder}
                                        </Badge>
                                        <Badge
                                            variant={doc.type === "mdx" ? "default" : "secondary"}
                                            className="px-1.5 py-0.5 text-xs"
                                        >
                                            {doc.type.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
