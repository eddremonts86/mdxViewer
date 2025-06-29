import {
    BarChart3,
    BookOpen,
    Home,
    PlayCircle,
    Settings,
    Users,
} from "lucide-react";

export const navigationItems = [
    {
        name: "Dashboard",
        path: "/",
        icon: Home,
    },
    {
        name: "Documents",
        path: "/docs",
        icon: BookOpen,
    },
    {
        name: "Examples",
        path: "/examples",
        icon: PlayCircle,
    },
    {
        name: "Statistics",
        path: "/statistics",
        icon: BarChart3,
    },
    {
        name: "Users",
        path: "/users",
        icon: Users,
    },
    {
        name: "Settings",
        path: "/settings",
        icon: Settings,
    },
];
