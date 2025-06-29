import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowUpRight,
    BarChart3,
    BookOpen,
    Calendar,
    Eye,
    FileText,
    TrendingUp,
    Users,
} from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
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
                        <Calendar className="w-3 h-3 mr-1" />
                        Last 7 days
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
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                +3
                            </span>{" "}
                            from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Page Views
                        </CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,429</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                +12.5%
                            </span>{" "}
                            from last week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">87</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                +8.2%
                            </span>{" "}
                            from yesterday
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Growth Rate
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+24%</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                +4.1%
                            </span>{" "}
                            from last period
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Activity Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Analytics Chart */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Document Statistics
                        </CardTitle>
                        <CardDescription>
                            Document views and interactions over time
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                                <p className="text-muted-foreground">
                                    Chart placeholder
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Analytics data would appear here
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest document updates and views
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Introduction.md updated
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        2 minutes ago
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        New user registered
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        5 minutes ago
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Components showcase viewed
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        12 minutes ago
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        API documentation updated
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        1 hour ago
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Documentation
                        </CardTitle>
                        <CardDescription>
                            Access your complete documentation library
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-between"
                                asChild
                            >
                                <Link to="/docs/introduction">
                                    Introduction
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-between"
                                asChild
                            >
                                <Link to="/docs/getting-started">
                                    Getting Started
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Examples
                        </CardTitle>
                        <CardDescription>
                            Explore interactive demos and showcases
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-between"
                                asChild
                            >
                                <Link to="/examples/interactive-demo">
                                    Interactive Demo
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-between"
                                asChild
                            >
                                <Link to="/examples/components-showcase">
                                    Components Showcase
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            API Reference
                        </CardTitle>
                        <CardDescription>
                            Complete API documentation and guides
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-between"
                                asChild
                            >
                                <Link to="/api/reference">
                                    API Reference
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-between"
                                asChild
                            >
                                <Link to="/guides/setup">
                                    Setup Guide
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
