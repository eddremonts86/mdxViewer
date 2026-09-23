import { Link, useLocation } from "react-router-dom";

import { navigationItems } from "@/const";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
    onNavigate: () => void;
}

/**
 * The surfaces, inside the index sheet. The header band shows these from `md`
 * up; below that they live here, so no surface becomes unreachable on a phone.
 */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
    const location = useLocation();

    return (
        <nav className="border-rule border-b px-3 py-2 md:hidden" aria-label="Surfaces">
            <ul>
                {navigationItems.map(item => {
                    const Icon = item.icon;
                    const active =
                        location.pathname === item.path ||
                        (item.path !== "/" && location.pathname.startsWith(item.path));

                    return (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                onClick={onNavigate}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "focus-visible:outline-mark flex items-center gap-2 px-1.5 py-1.5 text-[0.6875rem] font-semibold tracking-[0.13em] uppercase transition-colors focus-visible:outline focus-visible:outline-offset-[-2px]",
                                    active ? "text-mark-read" : "text-ink-dim hover:text-ink"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {item.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
