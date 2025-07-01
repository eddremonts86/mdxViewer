/**
 * File Operations
 * Core file system operations for scanning directories and calculating statistics
 */

import { promises as fs } from "fs";
import path from "path";
import { SERVER_CONFIG } from "../constants/index.js";
import { FileItem } from "../types/index.js";
import { formatDate, formatFileName, formatFileSize } from "./formatting.js";

const generatePreview = async (
    filePath: string,
    content: string
): Promise<string | null> => {
    try {
        // Create a simple preview URL based on the file path
        const previewFileName = filePath.replace(/\.(md|mdx)$/, ".png");
        const previewUrl = `/api/previews/${encodeURIComponent(previewFileName)}`;
        console.log(
            `📸 Preview URL generated for: ${filePath} -> ${previewUrl}`
        );
        return previewUrl;
    } catch (error) {
        console.error("Failed to generate preview URL:", error);
        return null;
    }
};

const getFileStats = async (filePath: string): Promise<Partial<FileItem>> => {
    try {
        const stats = await fs.stat(filePath);
        const rawSize = stats.size;
        const rawDate = stats.mtime.toISOString();

        return {
            size: rawSize,
            sizeFormatted: formatFileSize(rawSize),
            lastModified: rawDate,
            lastModifiedFormatted: formatDate(rawDate),
        };
    } catch {
        return {};
    }
};

const processDirectoryEntry = async (
    entry: any,
    dirPath: string,
    relativePath: string,
    currentDepth: number
): Promise<FileItem> => {
    const fullPath = path.join(dirPath, entry.name);
    const itemRelativePath = path
        .join(relativePath, entry.name)
        .replace(/\\/g, "/");

    if (entry.isDirectory()) {
        const children =
            currentDepth < SERVER_CONFIG.MAX_FOLDER_DEPTH
                ? await scanDirectory(
                      fullPath,
                      itemRelativePath,
                      currentDepth + 1
                  )
                : [];

        return {
            name: formatFileName(entry.name),
            originalName: entry.name,
            path: itemRelativePath,
            type: "folder",
            depth: currentDepth,
            children,
        };
    } else {
        const ext = path.extname(entry.name);
        const stats = await getFileStats(fullPath);

        let previewUrl: string | null = null;
        if (ext === ".md" || ext === ".mdx") {
            try {
                const content = await fs.readFile(fullPath, "utf-8");
                previewUrl = await generatePreview(itemRelativePath, content);
            } catch (error) {
                console.error(
                    `Failed to read file for preview: ${fullPath}`,
                    error
                );
            }
        }

        return {
            name: formatFileName(entry.name),
            originalName: entry.name,
            path: itemRelativePath,
            type: "file",
            extension: ext,
            depth: currentDepth,
            previewUrl,
            ...stats,
        };
    }
};

export const scanDirectory = async (
    dirPath: string,
    relativePath: string = "",
    currentDepth: number = 0
): Promise<FileItem[]> => {
    const items: FileItem[] = [];

    if (currentDepth > SERVER_CONFIG.MAX_FOLDER_DEPTH) {
        console.warn(
            `Maximum folder depth (${SERVER_CONFIG.MAX_FOLDER_DEPTH}) exceeded at path: ${relativePath}`
        );
        return items;
    }

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            try {
                // Skip hidden files and system files
                if (entry.name.startsWith(".") || entry.name.startsWith("_"))
                    continue;

                const item = await processDirectoryEntry(
                    entry,
                    dirPath,
                    relativePath,
                    currentDepth
                );
                items.push(item);
            } catch (error) {
                console.error(`Error processing entry ${entry.name}:`, error);
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error);
    }

    return items.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
};

export const calculateSiteStatistics = (fileStructure: FileItem[]): any => {
    let totalDocuments = 0;
    let totalFolders = 0;
    const documentsByType = { md: 0, mdx: 0 };
    const documentsByFolder: Array<{ folder: string; count: number }> = [];
    const recentDocuments: Array<{
        name: string;
        path: string;
        type: "md" | "mdx";
        folder: string;
    }> = [];

    function processItems(items: FileItem[], folderName: string = "root") {
        items.forEach(item => {
            if (item.type === "folder") {
                totalFolders++;
                if (item.children && item.children.length > 0) {
                    processItems(item.children, item.name);
                }
            } else if (item.type === "file") {
                if (item.extension === ".md" || item.extension === ".mdx") {
                    totalDocuments++;
                    documentsByType[item.extension === ".md" ? "md" : "mdx"]++;

                    if (recentDocuments.length < 8) {
                        recentDocuments.push({
                            name: item.name,
                            path: item.path,
                            type: item.extension === ".md" ? "md" : "mdx",
                            folder: folderName,
                        });
                    }
                }
            }
        });
    }

    processItems(fileStructure);

    // Group files by folder
    const folderCounts = new Map<string, number>();
    recentDocuments.forEach(({ folder }) => {
        folderCounts.set(folder, (folderCounts.get(folder) || 0) + 1);
    });

    folderCounts.forEach((count, folder) => {
        documentsByFolder.push({ folder, count });
    });

    const sortedFolders = [...documentsByFolder].sort(
        (a, b) => b.count - a.count
    );
    const popularFolders = sortedFolders.slice(0, 5).map(item => ({
        name: item.folder,
        count: item.count,
        path: `/${item.folder}`,
    }));

    return {
        totalDocuments,
        totalFolders,
        recentDocuments,
        documentsByType,
        documentsByFolder: sortedFolders,
        popularFolders,
    };
};
