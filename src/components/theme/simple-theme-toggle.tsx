import { Monitor, Moon, Sun } from "lucide-react";

import { useSimpleTheme } from "@/components/theme/simple-theme-provider";
import { Button } from "@/components/ui/button";

export function SimpleThemeToggle() {
    const { theme, setTheme } = useSimpleTheme();

    return (
        <div className="flex space-x-1 rounded-md border p-1">
            <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                    setTheme("light");
                }}
            >
                <Sun className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                    setTheme("dark");
                }}
            >
                <Moon className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === "system" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                    setTheme("system");
                }}
            >
                <Monitor className="h-4 w-4" />
            </Button>
        </div>
    );
}
