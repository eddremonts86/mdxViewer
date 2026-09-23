import { BarChart3, FileText, Telescope, Trash2 } from "lucide-react";

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
    {
        name: "Trash",
        path: "/trash",
        icon: Trash2,
    },
];
