import React, { useMemo } from "react";

import {
    ChevronLeft,
    ChevronRight,
    FileText,
    Folder,
    History,
    Home,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
    /** Display name for the breadcrumb */
    name: string;
    /** Path or route for navigation */
    path: string;
    /** Type of the breadcrumb item */
    type?: "folder" | "file" | "root";
    /** Whether this item is currently active */
    isActive?: boolean;
}

interface NavigationBreadcrumbProps {
    /** Array of breadcrumb items */
    items: BreadcrumbItem[];
    /** Callback when breadcrumb item is clicked */
    onNavigate: (path: string) => void;
    /** Whether navigation is loading */
    isLoading?: boolean;
    /** Maximum number of items to show before collapsing */
    maxItems?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * NavigationBreadcrumb component for hierarchical navigation
 * Follows MDXViewer design system and English-only practices
 *
 * Features:
 * - Responsive breadcrumb navigation
 * - Collapsible for long paths
 * - Type-based icons
 * - Loading states
 */
export const NavigationBreadcrumb: React.FC<NavigationBreadcrumbProps> = ({
    items,
    onNavigate,
    isLoading = false,
    maxItems = 4,
    className = "",
}) => {
    const processedItems = useMemo(() => {
        if (items.length <= maxItems) {
            return items;
        }

        // Keep first item, add ellipsis, and show last few items
        const firstItem = items[0];
        const lastItems = items.slice(-(maxItems - 2));

        return [
            firstItem,
            {
                name: "...",
                path: "",
                type: "folder" as const,
                isEllipsis: true,
                isActive: false,
            },
            ...lastItems,
        ];
    }, [items, maxItems]);

    const getIcon = (type?: string) => {
        switch (type) {
            case "root":
                return <Home className="h-4 w-4" />;
            case "file":
                return <FileText className="h-4 w-4" />;
            case "folder":
            default:
                return <Folder className="h-4 w-4" />;
        }
    };

    const handleItemClick = (
        item: BreadcrumbItem & { isEllipsis?: boolean }
    ) => {
        if (item.isEllipsis ?? item.isActive ?? isLoading) return;
        onNavigate(item.path);
    };

    const canGoBack = items.length > 1 && !isLoading;
    const handleGoBack = () => {
        if (canGoBack && items.length > 1) {
            const previousItem = items[items.length - 2];
            onNavigate(previousItem.path);
        }
    };

    return (
        <nav
            className={`bg-card/50 border-border flex items-center space-x-2 border-b p-3 ${className}`}
            aria-label="Navigation breadcrumb"
        >
            {/* Back button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                disabled={!canGoBack}
                className="flex items-center space-x-1"
                aria-label="Go back"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
            </Button>

            {/* Breadcrumb items */}
            <div className="flex items-center space-x-1 overflow-hidden">
                {processedItems.map((item, index) => {
                    const isLast = index === processedItems.length - 1;
                    const isEllipsis = "isEllipsis" in item && item.isEllipsis;

                    return (
                        <React.Fragment key={`${item.path}-${index}`}>
                            {/* Breadcrumb item */}
                            <Button
                                variant={
                                    (item.isActive ?? false)
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() => handleItemClick(item)}
                                disabled={
                                    isEllipsis ?? item.isActive ?? isLoading
                                }
                                className={`flex items-center space-x-2 transition-all duration-200 ${
                                    isEllipsis
                                        ? "cursor-default opacity-60"
                                        : "hover:bg-accent"
                                }`}
                                aria-current={
                                    (item.isActive ?? false)
                                        ? "page"
                                        : undefined
                                }
                            >
                                {getIcon(item.type)}
                                <span className="max-w-32 truncate sm:max-w-none">
                                    {item.name}
                                </span>
                                {(item.isActive ?? false) && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-1 text-xs"
                                    >
                                        Current
                                    </Badge>
                                )}
                            </Button>

                            {/* Separator */}
                            {!isLast && (
                                <ChevronRight className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Loading indicator */}
            {isLoading && (
                <div className="text-muted-foreground flex items-center space-x-2">
                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2" />
                    <span className="text-sm">Loading...</span>
                </div>
            )}

            {/* History button */}
            <Button
                variant="ghost"
                size="sm"
                className="ml-auto flex items-center space-x-1"
                aria-label="Navigation history"
            >
                <History className="h-4 w-4" />
                <span className="hidden md:inline">History</span>
            </Button>
        </nav>
    );
};
