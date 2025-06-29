import { useSimpleTheme } from "@/components/simple-theme-provider";
import { Button } from "@/components/ui/button";
import { Monitor, Moon, Sun } from "lucide-react";

export function SimpleThemeToggle() {
    const { theme, setTheme } = useSimpleTheme();

    console.log("SimpleThemeToggle rendered, current theme:", theme);

    return (
        <div className="flex space-x-1 border rounded-md p-1">
            <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                    console.log("Switching to light theme");
                    setTheme("light");
                }}
            >
                <Sun className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                    console.log("Switching to dark theme");
                    setTheme("dark");
                }}
            >
                <Moon className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === "system" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                    console.log("Switching to system theme");
                    setTheme("system");
                }}
            >
                <Monitor className="h-4 w-4" />
            </Button>
        </div>
    );
}
