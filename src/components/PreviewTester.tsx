import { useState } from "react";

export function PreviewTester() {
    const [previewUrls] = useState([
        "/api/previews/docs/getting-started.png",
        "/api/previews/docs/introduction.png",
        "/api/previews/docs/component-best-practices.png",
        "/api/previews/examples/components-showcase.png",
        "/api/previews/examples/interactive-demo.png",
    ]);

    const [loadStates, setLoadStates] = useState<Record<string, string>>({});

    const handleImageLoad = (url: string) => {
        setLoadStates(prev => ({ ...prev, [url]: "loaded" }));
    };

    const handleImageError = (url: string) => {
        setLoadStates(prev => ({ ...prev, [url]: "error" }));
    };

    const getStatusClass = (url: string) => {
        if (loadStates[url] === "loaded") return "bg-green-100 text-green-800";
        if (loadStates[url] === "error") return "bg-red-100 text-red-800";
        return "bg-yellow-100 text-yellow-800";
    };

    const getStatusText = (url: string) => {
        if (loadStates[url] === "loaded") return "✅ Loaded";
        if (loadStates[url] === "error") return "❌ Error";
        return "⏳ Loading...";
    };

    return (
        <div className="space-y-6 p-6">
            <h2 className="text-2xl font-bold">Preview API Tester</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {previewUrls.map(url => (
                    <div
                        key={url}
                        className="overflow-hidden rounded-lg border bg-white shadow-sm"
                    >
                        <div className="flex h-48 items-center justify-center bg-gray-50">
                            <img
                                src={url}
                                alt={`Preview for ${url}`}
                                className="max-h-full max-w-full object-contain"
                                onLoad={() => handleImageLoad(url)}
                                onError={() => handleImageError(url)}
                            />
                        </div>
                        <div className="p-3">
                            <div className="mb-2 font-mono text-sm text-gray-600">
                                {url}
                            </div>
                            <div
                                className={`rounded px-2 py-1 text-xs ${getStatusClass(url)}`}
                            >
                                {getStatusText(url)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
