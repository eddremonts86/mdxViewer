import { useMemo } from "react";

import type { DocumentCardProps } from "../types";

/**
 * Sanitize filename to be URL-safe and match kebab-case convention
 */
function sanitizeFilename(filename: string): string {
    return filename
        .toLowerCase() // Convert to lowercase for kebab-case
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-z0-9._-]/g, "") // Remove special characters except dots, hyphens, and underscores
        .replace(/_+/g, "-") // Replace underscores with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-+/, "")
        .replace(/-+$/, ""); // Remove leading/trailing hyphens
}

/**
 * Sanitize folder path to be URL-safe and match kebab-case convention
 */
function sanitizeFolderPath(folderPath: string): string {
    return folderPath
        .toLowerCase() // Convert to lowercase for kebab-case
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-z0-9._/-]/g, "") // Keep forward slashes for paths
        .replace(/_+/g, "-") // Replace underscores with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/\/+/g, "/") // Replace multiple slashes with single
        .replace(/^-+/, "")
        .replace(/-+$/, ""); // Remove leading/trailing hyphens
}

/**
 * Create sanitized preview URL for a file
 */
function createPreviewUrl(filePath: string): string {
    const pathParts = filePath.split("/");

    // Separate folder path from filename
    const folderParts = pathParts.slice(0, -1);
    const filename = pathParts[pathParts.length - 1];

    // Sanitize folder path (concatenated, lowercase)
    const sanitizedFolderPath = sanitizeFolderPath(folderParts.join("/"));

    // Sanitize filename (uppercase with underscores)
    const sanitizedFilename = sanitizeFilename(filename);

    // Build final path
    const finalPath = sanitizedFolderPath
        ? `${sanitizedFolderPath}/${sanitizedFilename}`
        : sanitizedFilename;

    return `/api/previews/${finalPath.replace(/\.(md|mdx)$/i, ".png")}`;
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
