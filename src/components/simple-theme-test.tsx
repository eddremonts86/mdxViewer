import { useSimpleTheme } from "@/components/simple-theme-provider";

export function SimpleThemeTest() {
    const { theme, setTheme } = useSimpleTheme();

    return (
        <div className="bg-card text-card-foreground mb-4 rounded border p-4">
            <h3 className="mb-2 text-lg font-semibold">Simple Theme Test</h3>
            <p className="mb-2">
                Current theme: <strong>{theme}</strong>
            </p>
            <div className="space-x-2">
                <button
                    onClick={() => setTheme("light")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1"
                >
                    Light
                </button>
                <button
                    onClick={() => setTheme("dark")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1"
                >
                    Dark
                </button>
                <button
                    onClick={() => setTheme("system")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1"
                >
                    System
                </button>
            </div>
        </div>
    );
}
