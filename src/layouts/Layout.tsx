import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { Menu } from "lucide-react";

import { CompassStar } from "@/components/atlas";
import { CommandPalette, Sidebar } from "@/components/navigation";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { navigationItems } from "@/const";
import { cn } from "@/lib/utils";

export function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const location = useLocation();

    const isActive = (path: string) =>
        location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

    return (
        <div className="bg-sky text-ink flex h-screen flex-col">
            <a
                href="#plate"
                className="focus:bg-mark focus:text-sky sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:text-[0.6875rem] focus:font-semibold focus:tracking-[0.11em] focus:uppercase"
            >
                Skip to content
            </a>

            {/* The header band. Nothing here is ever pushed out of the viewport:
                navigation collapses into the index sheet, the observer's own
                controls never move. */}
            <header className="border-rule bg-sky flex h-14 shrink-0 items-center gap-3 border-b px-3 sm:px-5">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 lg:hidden"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-expanded={sidebarOpen}
                    aria-controls="plate-index"
                >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Toggle plate index</span>
                </Button>

                <Link to="/" className="flex min-w-0 items-center gap-2.5">
                    <CompassStar className="text-mark shrink-0" size={16} />
                    <span className="truncate font-serif text-[1.0625rem] leading-none font-semibold tracking-tight">
                        MDXViewer
                    </span>
                </Link>

                <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
                    {navigationItems.map(item => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "flex items-center gap-2 border-b px-2.5 py-2 text-[0.6875rem] font-semibold tracking-[0.13em] uppercase transition-colors",
                                    active
                                        ? "border-mark text-mark-read"
                                        : "text-ink-dim hover:text-ink border-transparent"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="ml-auto flex shrink-0 items-center gap-1">
                    <CommandPalette />
                    <ModeToggle />
                </div>
            </header>

            <div className="flex min-h-0 flex-1">
                <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

                <main id="plate" className="min-w-0 flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            <Toaster />
        </div>
    );
}
