import { Link } from "react-router-dom";

import {
    ArrowUpRight,
    BarChart3,
    BookOpen,
    Calendar,
    Eye,
    FileText,
    Folder,
    TrendingUp,
} from "lucide-react";

import { PopularFolders } from "@/components/content/PopularFolders";
import { RecentDocuments } from "@/components/content/RecentDocuments";
import { DocumentTypeStats } from "@/components/stats/DocumentTypeStats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useSiteStatistics } from "@/hooks/useSiteStatistics";

export function HomePage() {
    const statistics = useSiteStatistics();

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Overview
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's your document management dashboard.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                        <Calendar className="mr-1 h-3 w-3" />
                        Live Data
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Documents
                        </CardTitle>
                        <FileText className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        {statistics.loading ? (
                            <div className="animate-pulse">
                                <div className="bg-muted mb-1 h-8 w-16 rounded"></div>
                                <div className="bg-muted h-4 w-24 rounded"></div>
                            </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {statistics.totalDocuments}
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    {statistics.documentsByType.md} MD +{" "}
                                    {statistics.documentsByType.mdx} MDX
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Folders
                        </CardTitle>
                        <Folder className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        {statistics.loading ? (
                            <div className="animate-pulse">
                                <div className="bg-muted mb-1 h-8 w-12 rounded"></div>
                                <div className="bg-muted h-4 w-20 rounded"></div>
                            </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {statistics.totalFolders}
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    Content categories
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            MDX Files
                        </CardTitle>
                        <Eye className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        {statistics.loading ? (
                            <div className="animate-pulse">
                                <div className="bg-muted mb-1 h-8 w-12 rounded"></div>
                                <div className="bg-muted h-4 w-16 rounded"></div>
                            </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-green-600">
                                    {statistics.documentsByType.mdx}
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    Interactive docs
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Popular Folder
                        </CardTitle>
                        <TrendingUp className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        {statistics.loading ? (
                            <div className="animate-pulse">
                                <div className="bg-muted mb-1 h-8 w-20 rounded"></div>
                                <div className="bg-muted h-4 w-16 rounded"></div>
                            </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold capitalize">
                                    {statistics.popularFolders[0]?.name ||
                                        "N/A"}
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    {statistics.popularFolders[0]?.count || 0}{" "}
                                    documents
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Activity Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Document Type Distribution */}
                <div className="lg:col-span-3">
                    <DocumentTypeStats
                        documentsByType={statistics.documentsByType}
                        loading={statistics.loading}
                    />
                </div>

                {/* Popular Folders */}
                <div className="lg:col-span-4">
                    <PopularFolders
                        popularFolders={statistics.popularFolders}
                        loading={statistics.loading}
                    />
                </div>
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Recent Documents */}
                <div className="lg:col-span-1">
                    <RecentDocuments
                        recentDocuments={statistics.recentDocuments}
                        loading={statistics.loading}
                    />
                </div>

                {/* Quick Actions */}
                <Card className="relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Browse Documentation
                        </CardTitle>
                        <CardDescription>
                            Explore guides, examples, and API references
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Link to="/docs">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <ArrowUpRight className="mr-2 h-4 w-4" />
                                    Documentation
                                </Button>
                            </Link>
                            <Link to="/examples">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <ArrowUpRight className="mr-2 h-4 w-4" />
                                    Examples
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Site Analytics
                        </CardTitle>
                        <CardDescription>
                            View detailed statistics and usage data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to="/statistics">
                            <Button className="w-full">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                View Analytics
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Error State */}
            {statistics.error && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">
                            Error Loading Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            {statistics.error}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
