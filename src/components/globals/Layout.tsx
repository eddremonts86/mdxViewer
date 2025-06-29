import { Sidebar } from "@/components/Sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { navigationItems } from "@/const";
import { Bell, Menu, Settings } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const location = useLocation();

    const toggleSidebar = (): void => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center h-16 px-6">
                    {/* Left side */}
                    <div className="flex items-center flex-1 space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={toggleSidebar}
                        >
                            <Menu className="w-5 h-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>

                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                                <span className="text-sm font-bold text-primary-foreground">
                                    M
                                </span>
                            </div>
                            <h1 className="text-xl font-semibold">
                                MDX Viewer
                            </h1>
                        </div>
                    </div>

                    {/* Navigation in center */}
                    <nav className="flex items-center justify-center flex-1 space-x-1 md:space-x-2">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                location.pathname === item.path ||
                                (item.path !== "/" &&
                                    location.pathname.startsWith(item.path));

                            return (
                                <Button
                                    key={item.path}
                                    variant={isActive ? "default" : "ghost"}
                                    size="sm"
                                    className="flex items-center px-2 space-x-1 md:space-x-2 md:px-3"
                                    asChild
                                >
                                    <Link to={item.path}>
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden text-sm md:inline">
                                            {item.name}
                                        </span>
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center justify-end flex-1 space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="sr-only">Notifications</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                        >
                            <Settings className="w-5 h-5" />
                            <span className="sr-only">Settings</span>
                        </Button>

                        <ModeToggle />
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar */}
                <Sidebar
                    open={sidebarOpen}
                    onOpenChange={setSidebarOpen}
                />

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
            <Toaster />
        </div>
    );
}
