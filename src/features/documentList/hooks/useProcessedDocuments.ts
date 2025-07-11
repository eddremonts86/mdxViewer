import { useMemo } from "react";
import type { DocumentCardProps } from "../types";

/**
 * Sanitize filename to be URL-safe
 */
function sanitizeFilename(filename: string): string {
    return filename
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9._-]/g, "") // Remove special characters except dots, underscores, and hyphens
        .replace(/_+/g, "_") // Replace multiple underscores with single
        .replace(/(^_+)|(_+$)/g, ""); // Remove leading/trailing underscores
}

/**
 * Create sanitized preview URL for a file
 */
function createPreviewUrl(filePath: string): string {
    const pathParts = filePath.split("/");
    const sanitizedParts = pathParts.map((part: string) =>
        sanitizeFilename(part)
    );
    const sanitizedPath = sanitizedParts.join("/");
    return `/api/previews/${sanitizedPath.replace(/\.(md|mdx)$/, ".png")}`;
}

export function useProcessedDocuments(files: any[]) {
    return useMemo(() => {
        if (!files || (Array.isArray(files) && files.length === 0)) {
            return [];
        }

        const docs: DocumentCardProps[] = [];

        const processFiles = (fileList: any[], currentPath = "") => {
            fileList.forEach(file => {
                if (
                    file.type === "file" &&
                    (file.name.endsWith(".md") || file.name.endsWith(".mdx"))
                ) {
                    const filePath = currentPath
                        ? `${currentPath}/${file.name}`
                        : file.name;
                    const fileType = file.name.endsWith(".mdx") ? "mdx" : "md";
                    const title = file.name.replace(/\.(md|mdx)$/, "");
                    const folder = currentPath || "root";

                    // Generate preview URL with sanitized filename
                    const previewUrl = createPreviewUrl(filePath);

                    docs.push({
                        title:
                            title.charAt(0).toUpperCase() +
                            title.slice(1).replace(/-/g, " "),
                        description: `${fileType.toUpperCase()} document in ${folder} folder`,
                        path: filePath,
                        type: fileType,
                        folder,
                        lastModified: new Date(file.lastModified ?? Date.now()),
                        tags: [folder, fileType],
                        previewUrl,
                    });
                } else if (file.type === "folder" && file.children) {
                    const newPath = currentPath
                        ? `${currentPath}/${file.name}`
                        : file.name;
                    processFiles(file.children, newPath);
                }
            });
        };

        if (Array.isArray(files)) {
            processFiles(files);
        }

        return docs;
    }, [files]);
}
