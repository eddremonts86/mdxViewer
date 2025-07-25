import React from "react";

import { NavigationBreadcrumb } from "@/components/navigation/NavigationBreadcrumb";

// Type for breadcrumb items
type BreadcrumbItemType = "folder" | "file" | "root";

interface LocalBreadcrumbItem {
    name: string;
    path: string;
    type?: BreadcrumbItemType;
    isActive?: boolean;
}

interface DocumentHeaderProps {
    filePath: string;
    isLoading?: boolean;
    onNavigate: (path: string) => void;
    className?: string;
}

export function DocumentHeader({ filePath, isLoading = false, onNavigate, className }: DocumentHeaderProps) {
    // Create breadcrumb items from file path
    const createBreadcrumbItems = (path: string): LocalBreadcrumbItem[] => {
        if (!path)
            return [
                {
                    name: "Home",
                    path: "/",
                    type: "root",
                    isActive: false,
                },
            ];

        const segments = path.split("/").filter(Boolean);
        const items: LocalBreadcrumbItem[] = [{ name: "Home", path: "/", type: "root", isActive: false }];

        let currentPath = "";
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === segments.length - 1;

            let navigationPath: string;
            let itemType: BreadcrumbItemType;

            if (isLast) {
                // Current file
                navigationPath = `/document${currentPath}`;
                itemType = "file";
            } else {
                // Parent folder - for now navigate to home
                // In the future, we could implement folder-specific views
                navigationPath = "/";
                itemType = "folder";
            }

            items.push({
                name: segment.replace(/\.(md|mdx)$/, ""),
                path: navigationPath,
                type: itemType,
                isActive: isLast,
            });
        });

        return items;
    };

    const breadcrumbItems = filePath ? createBreadcrumbItems(filePath) : [];

    if (!filePath) {
        return null;
    }

    return (
        <div className={className}>
            <NavigationBreadcrumb
                items={breadcrumbItems}
                onNavigate={onNavigate}
                isLoading={isLoading}
                className="navigation-header"
            />
        </div>
    );
}