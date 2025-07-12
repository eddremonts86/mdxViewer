/**
 * Hook for fetching dynamic site statistics from the backend API
 * Provides real-time data about the MDX Viewer site
 */

import { useEffect, useState } from "react";

// API Base URL
const API_BASE_URL = "http://localhost:3001/api";

export interface SiteStatistics {
    totalDocuments: number;
    totalFolders: number;
    recentDocuments: Array<{
        name: string;
        path: string;
        type: "md" | "mdx";
        folder: string;
    }>;
    documentsByType: {
        md: number;
        mdx: number;
    };
    documentsByFolder: Array<{
        folder: string;
        count: number;
    }>;
    popularFolders: Array<{
        name: string;
        count: number;
        path: string;
    }>;
    loading: boolean;
    error: string | null;
}

export function useSiteStatistics(): SiteStatistics {
    const [statistics, setStatistics] = useState<SiteStatistics>({
        totalDocuments: 0,
        totalFolders: 0,
        recentDocuments: [],
        documentsByType: { md: 0, mdx: 0 },
        documentsByFolder: [],
        popularFolders: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        async function loadStatistics() {
            try {
                setStatistics(prev => ({
                    ...prev,
                    loading: true,
                    error: null,
                }));

                console.log("📊 Loading site statistics from API...");

                // Fetch statistics directly from backend API
                const response = await fetch(`${API_BASE_URL}/statistics`);

                if (!response.ok) {
                    throw new Error(
                        `API Error: ${response.status} ${response.statusText}`,
                    );
                }

                const apiResponse = await response.json();

                if (!apiResponse.success) {
                    throw new Error(
                        apiResponse.error ?? "Failed to fetch statistics",
                    );
                }

                console.log("📊 Got statistics from API:", apiResponse.data);

                setStatistics({
                    ...apiResponse.data,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                console.error("❌ Error loading site statistics:", error);
                setStatistics(prev => ({
                    ...prev,
                    loading: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to load site statistics",
                }));
            }
        }

        loadStatistics();

        // Reload statistics every 60 seconds to keep data fresh
        const interval = setInterval(loadStatistics, 60000);

        return () => clearInterval(interval);
    }, []);

    return statistics;
}
