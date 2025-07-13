import { BarChart3, Calendar, Eye, FileText, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StatisticsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
                    <p className="text-muted-foreground">Detailed analytics and usage statistics for your documents</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                        <Calendar className="mr-1 h-3 w-3" />
                        Last 30 days
                    </Badge>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,489</div>
                        <p className="text-muted-foreground text-xs">
                            <span className="text-emerald-600 dark:text-emerald-400">+20.1%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                        <Users className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,350</div>
                        <p className="text-muted-foreground text-xs">
                            <span className="text-emerald-600 dark:text-emerald-400">+180.1%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Documents</CardTitle>
                        <FileText className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">573</div>
                        <p className="text-muted-foreground text-xs">
                            <span className="text-emerald-600 dark:text-emerald-400">+19%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
                        <TrendingUp className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4:12</div>
                        <p className="text-muted-foreground text-xs">
                            <span className="text-emerald-600 dark:text-emerald-400">+7%</span> from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Document Views</CardTitle>
                        <CardDescription>Page views over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border-muted-foreground/25 flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
                            <div className="text-center">
                                <BarChart3 className="text-muted-foreground/50 mx-auto mb-2 h-12 w-12" />
                                <p className="text-muted-foreground">Views Chart</p>
                                <p className="text-muted-foreground text-xs">Chart visualization would appear here</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User Engagement</CardTitle>
                        <CardDescription>User interaction metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border-muted-foreground/25 flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
                            <div className="text-center">
                                <TrendingUp className="text-muted-foreground/50 mx-auto mb-2 h-12 w-12" />
                                <p className="text-muted-foreground">Engagement Chart</p>
                                <p className="text-muted-foreground text-xs">Engagement data would appear here</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Popular Documents */}
            <Card>
                <CardHeader>
                    <CardTitle>Popular Documents</CardTitle>
                    <CardDescription>Most viewed documents this month</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">Introduction to MDX</p>
                                <p className="text-muted-foreground text-sm">Getting started guide</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">2,347 views</p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">+12%</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">Interactive Demo</p>
                                <p className="text-muted-foreground text-sm">Interactive examples</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">1,892 views</p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">+8%</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">API Reference</p>
                                <p className="text-muted-foreground text-sm">Complete API documentation</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">1,456 views</p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">+15%</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
