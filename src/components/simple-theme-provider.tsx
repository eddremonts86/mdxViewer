import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

// Extend window type for debug function
declare global {
    interface Window {
        debugTheme?: (theme: Theme) => void;
    }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function SimpleThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [theme, setTheme] = useState<Theme>("light");

    useEffect(() => {
        // Always log to see if this runs
        console.log("SimpleThemeProvider: Effect running, theme:", theme);

        const root = document.documentElement;

        // Remove all theme classes
        root.classList.remove("light", "dark");

        // Add the current theme class
        if (theme === "system") {
            const systemTheme = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "light";
            console.log(
                "SimpleThemeProvider: System theme detected:",
                systemTheme
            );
            root.classList.add(systemTheme);
        } else {
            console.log("SimpleThemeProvider: Adding theme class:", theme);
            root.classList.add(theme);
        }

        // Log the final classes
        console.log(
            "SimpleThemeProvider: Document classes after update:",
            root.className
        );
    }, [theme]);

    const contextValue = useMemo(
        () => ({
            theme,
            setTheme: (newTheme: Theme) => {
                console.log(
                    "SimpleThemeProvider: setTheme called, changing from",
                    theme,
                    "to",
                    newTheme
                );
                setTheme(newTheme);

                // Also call the debug function if available for immediate effect
                if (typeof window !== "undefined" && window.debugTheme) {
                    window.debugTheme(newTheme);
                }
            },
        }),
        [theme]
    );

    // Log when provider renders
    console.log("SimpleThemeProvider: Rendering with theme:", theme);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useSimpleTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error(
            "useSimpleTheme must be used within a SimpleThemeProvider"
        );
    }
    return context;
};
