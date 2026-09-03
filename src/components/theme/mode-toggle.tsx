import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { transitionTheme } from "@/utils/viewTransitions";

export function ModeToggle() {
    const { setTheme } = useTheme();

    const handleThemeChange = async (theme: "light" | "dark" | "system") => {
        await transitionTheme(() => {
            setTheme(theme);
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7">
                    <Sun className="h-3.5 w-3.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute h-3.5 w-3.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-panel border-rule">
                <DropdownMenuItem onClick={() => handleThemeChange("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
