import { useTheme } from "@/components/theme-provider";

export function ThemeTest() {
    const { theme, setTheme } = useTheme();

    const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
        console.log("Button clicked, changing theme to:", newTheme);
        setTheme(newTheme);
    };

    return (
        <div className="p-4 border rounded mb-4 bg-card text-card-foreground">
            <h3 className="text-lg font-semibold mb-2">Theme Test</h3>
            <p className="mb-2">
                Current theme: <strong>{theme}</strong>
            </p>
            <p className="mb-2 text-sm text-muted-foreground">
                Document classes: {document.documentElement.className}
            </p>
            <div className="space-x-2">
                <button
                    onClick={() => handleThemeChange("light")}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                    Light
                </button>
                <button
                    onClick={() => handleThemeChange("dark")}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                    Dark
                </button>
                <button
                    onClick={() => handleThemeChange("system")}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                    System
                </button>
            </div>
        </div>
    );
}
