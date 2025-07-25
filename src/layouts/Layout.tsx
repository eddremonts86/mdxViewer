import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { Bell, Menu, Settings } from "lucide-react";

import { Sidebar } from "@/components/navigation";
import { NotificationCenter } from "@/components/progress/NotificationCenter";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { navigationItems } from "@/const";

export function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [notifications, setNotifications] = useState([
        {
            id: "1",
            title: "Welcome to MDXViewer",
            message: "You can view and edit MDX files with live preview functionality.",
            type: "info" as const,
            timestamp: new Date(),
            isRead: false,
        },
        {
            id: "2",
            title: "File Management",
            message: "Use the sidebar to create, upload, and organize your documents.",
            type: "success" as const,
            timestamp: new Date(Date.now() - 60000),
            isRead: false,
        },
    ]);
    const location = useLocation();

    const toggleSidebar = (): void => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="bg-background text-foreground min-h-screen">
            {/* Header */}
            <header className="border-border bg-background/98 dark:bg-background/99 sticky top-0 z-50 w-full border-b backdrop-blur-xl shadow-sm">
                <div className="flex h-16 items-center px-6">
                    {/* Left side */}
                    <div className="flex flex-1 items-center space-x-4">
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>

                        <div className="flex items-center space-x-3">
                            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                                <span className="text-primary-foreground text-sm font-bold">M</span>
                            </div>
                            <h1 className="text-xl font-semibold">MDX Viewer</h1>
                        </div>
                    </div>

                    {/* Navigation in center */}
                    <nav className="flex flex-1 items-center justify-center space-x-1 md:space-x-2">
                        {navigationItems.map(item => {
                            const Icon = item.icon;
                            const isActive =
                                location.pathname === item.path ||
                                (item.path !== "/" && location.pathname.startsWith(item.path));

                            return (
                                <Button
                                    key={item.path}
                                    variant={isActive ? "default" : "ghost"}
                                    size="sm"
                                    className="flex items-center space-x-1 px-2 md:space-x-2 md:px-3"
                                    asChild
                                >
                                    <Link to={item.path}>
                                        <Icon className="h-4 w-4" />
                                        <span className="hidden text-sm md:inline">{item.name}</span>
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>

                    {/* Right side */}
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative"
                        >
                            <Bell className="h-5 w-5" />
                            {notifications.filter(n => !n.isRead).length > 0 && (
                                <span className="bg-destructive absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full text-xs text-white">
                                    {notifications.filter(n => !n.isRead).length}
                                </span>
                            )}
                            <span className="sr-only">Notifications</span>
                        </Button>

                        <Button variant="ghost" size="icon">
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">Settings</span>
                        </Button>

                        <ModeToggle />
                    </div>
                </div>
            </header>

            {/* Notification Center overlay */}
            {showNotifications && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 cursor-default bg-black/20"
                        onClick={() => setShowNotifications(false)}
                        aria-label="Close notifications"
                    />
                    <div className="absolute top-16 right-6 max-w-md">
                        <NotificationCenter
                            notifications={notifications}
                            onDismiss={(id: string) => {
                                setNotifications(prev => prev.filter(n => n.id !== id));
                            }}
                            onMarkAsRead={(id: string) => {
                                setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
                            }}
                            onClearAll={() => {
                                setNotifications([]);
                                setShowNotifications(false);
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar */}
                <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
            <Toaster />
        </div>
    );
}
