import { useTheme } from "@/components/theme/theme-provider";

export function ThemeTest() {
    const { theme, setTheme } = useTheme();

    const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
        setTheme(newTheme);
    };

    return (
        <div className="bg-card text-card-foreground mb-4 rounded border p-4">
            <h3 className="mb-2 text-lg font-semibold">Theme Test</h3>
            <p className="mb-2">
                Current theme: <strong>{theme}</strong>
            </p>
            <p className="text-muted-foreground mb-2 text-sm">
                Document classes: {document.documentElement.className}
            </p>
            <div className="space-x-2">
                <button
                    onClick={() => handleThemeChange("light")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1"
                >
                    Light
                </button>
                <button
                    onClick={() => handleThemeChange("dark")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1"
                >
                    Dark
                </button>
                <button
                    onClick={() => handleThemeChange("system")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1"
                >
                    System
                </button>
            </div>
        </div>
    );
}
