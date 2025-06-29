import { useSimpleTheme } from "@/components/simple-theme-provider";

export function SimpleThemeTest() {
    const { theme, setTheme } = useSimpleTheme();

    return (
        <div className="p-4 border rounded mb-4 bg-card text-card-foreground">
            <h3 className="text-lg font-semibold mb-2">Simple Theme Test</h3>
            <p className="mb-2">
                Current theme: <strong>{theme}</strong>
            </p>
            <div className="space-x-2">
                <button
                    onClick={() => setTheme("light")}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                    Light
                </button>
                <button
                    onClick={() => setTheme("dark")}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                    Dark
                </button>
                <button
                    onClick={() => setTheme("system")}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                    System
                </button>
            </div>
        </div>
    );
}
