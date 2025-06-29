import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    BarChart3,
    Calendar,
    Eye,
    FileText,
    TrendingUp,
    Users,
} from "lucide-react";

export function StatisticsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Statistics
                    </h1>
                    <p className="text-muted-foreground">
                        Detailed analytics and usage statistics for your
                        documents
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge
                        variant="outline"
                        className="text-xs"
                    >
                        <Calendar className="w-3 h-3 mr-1" />
                        Last 30 days
                    </Badge>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Views
                        </CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,489</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                +20.1%
                            </span>{" "}
                            from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Unique Visitors
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,350</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                +180.1%
                            </span>{" "}
                            from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Documents
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">573</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                +19%
                            </span>{" "}
                            from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg. Time
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4:12</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                +7%
                            </span>{" "}
                            from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Document Views</CardTitle>
                        <CardDescription>
                            Page views over the last 30 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                                <p className="text-muted-foreground">
                                    Views Chart
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Chart visualization would appear here
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User Engagement</CardTitle>
                        <CardDescription>
                            User interaction metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                            <div className="text-center">
                                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                                <p className="text-muted-foreground">
                                    Engagement Chart
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Engagement data would appear here
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Popular Documents */}
            <Card>
                <CardHeader>
                    <CardTitle>Popular Documents</CardTitle>
                    <CardDescription>
                        Most viewed documents this month
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">
                                    Introduction to MDX
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Getting started guide
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">2,347 views</p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    +12%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Interactive Demo</p>
                                <p className="text-sm text-muted-foreground">
                                    Interactive examples
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">1,892 views</p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    +8%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">API Reference</p>
                                <p className="text-sm text-muted-foreground">
                                    Complete API documentation
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">1,456 views</p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    +15%
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
