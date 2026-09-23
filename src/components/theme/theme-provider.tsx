import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

interface ThemeProviderState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const isTheme = (value: string | null): value is Theme => value === "dark" || value === "light" || value === "system";

const readStoredTheme = (storageKey: string, fallback: Theme): Theme => {
    try {
        const stored = localStorage.getItem(storageKey);
        return isTheme(stored) ? stored : fallback;
    } catch {
        // Private mode or blocked site data: the default is a fine answer.
        return fallback;
    }
};

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "mdxviewer-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => readStoredTheme(storageKey, defaultTheme));

    useEffect(() => {
        const root = window.document.documentElement;
        const query = window.matchMedia("(prefers-color-scheme: dark)");

        const apply = () => {
            const resolved = theme === "system" ? (query.matches ? "dark" : "light") : theme;
            root.classList.remove("light", "dark");
            root.classList.add(resolved);
        };

        apply();

        // Following the system means following it as it changes, not once at mount.
        if (theme !== "system") return undefined;
        query.addEventListener("change", apply);
        return () => query.removeEventListener("change", apply);
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            setTheme: (newTheme: Theme) => {
                try {
                    localStorage.setItem(storageKey, newTheme);
                } catch {
                    // The choice still applies for this session.
                }
                setTheme(newTheme);
            },
        }),
        [theme, storageKey]
    );

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
