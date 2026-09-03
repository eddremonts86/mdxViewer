import { BarChart3, FileText, Telescope } from "lucide-react";

/**
 * Only surfaces that exist. A route that renders "coming soon" does not earn a
 * place in the band.
 */
export const navigationItems = [
    {
        name: "Chart",
        path: "/",
        icon: Telescope,
    },
    {
        name: "Documents",
        path: "/docs",
        icon: FileText,
    },
    {
        name: "Statistics",
        path: "/statistics",
        icon: BarChart3,
    },
];
