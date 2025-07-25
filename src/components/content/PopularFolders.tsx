/**
 * Popular Folders Component
 * Shows folders with the most documents
 */

import { Link } from "react-router-dom";

import { Folder, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PopularFoldersProps {
    popularFolders: Array<{
        name: string;
        count: number;
        path: string;
    }>;
    loading?: boolean;
}

export function PopularFolders({ popularFolders, loading = false }: PopularFoldersProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Popular Folders</CardTitle>
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3 w-80">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="bg-muted h-4 w-24 rounded"></div>
                                <div className="bg-muted h-5 w-8 rounded"></div>
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
                <CardTitle className="text-sm font-medium">Popular Folders</CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent className="space-y-3 w-80">
                < >
                    {popularFolders.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No folders found</p>
                    ) : (
                        popularFolders.map((folder, index) => (
                            <Link
                                key={folder.path}
                                to={folder.path}
                                className="hover:bg-muted/50 group flex items-center justify-between rounded-lg p-2 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Folder className="h-4 w-4 text-blue-600" />
                                    <span className="group-hover:text-primary text-sm font-medium capitalize">
                                        {folder.name}
                                    </span>
                                    {index === 0 && (
                                        <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                                            Most Popular
                                        </Badge>
                                    )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {folder.count} {folder.count === 1 ? "doc" : "docs"}
                                </Badge>
                            </Link>
                        ))
                    )}
                </>
            </CardContent>
        </Card>
    );
}
