import { useEffect, useState } from "react";

interface PreviewStats {
    total: number;
    loaded: number;
    failed: number;
    loading: boolean;
    coverage: number;
}

export function usePreviewStats(documents: any[]) {
    const [stats, setStats] = useState<PreviewStats>({
        total: 0,
        loaded: 0,
        failed: 0,
        loading: true,
        coverage: 0,
    });

    useEffect(() => {
        const documentsWithPreviews = documents.filter(doc => doc.previewUrl);
        const total = documentsWithPreviews.length;

        setStats(prev => ({
            ...prev,
            total,
            loading: false,
            coverage:
                total > 0 ? Math.round((total / documents.length) * 100) : 0,
        }));
    }, [documents]);

    const updatePreviewStats = (type: "loaded" | "failed") => {
        setStats(prev => ({
            ...prev,
            [type]: prev[type] + 1,
        }));
    };

    return { stats, updatePreviewStats };
}
