import { TIME_INTERVALS } from "@/const/constants";
import type { Document, FileNode } from "@/types";
import { logError, logOperation, logSuccess } from "@/utils/logger";

/**
 * API for managing dynamic file system
 * Reads real files from public/content/
 * Updates automatically when contentIndex.ts changes
 */
export class FileSystemAPI {
    private static readonly baseUrl = "/content";
    private static contentFiles: string[] = [];
    private static lastModified = 0;

    /**
     * Loads file index dynamically
     */
    private static async loadContentIndex(): Promise<string[]> {
        try {
            // For Vite, use dynamic import with timestamp as query param
            const timestamp = Date.now();
            const module = await import(
                /* @vite-ignore */ `./contentIndex.ts?t=${timestamp}`
            );
            this.contentFiles = module.CONTENT_FILES ?? [];
            this.lastModified = timestamp;
            // Index updated successfully
            return this.contentFiles;
        } catch (error) {
            // Log error and return cached files
            logError(
                "Failed to load content index",
                error instanceof Error ? error : new Error(String(error)),
            );
            return this.contentFiles;
        }
    }

    /**
     * Obtiene la lista de archivos (con auto-reload)
     */
    private static async getContentFiles(): Promise<string[]> {
        // Si no hay archivos cargados o han pasado más de 5 segundos, recargar
        const now = Date.now();
        if (
            this.contentFiles.length === 0 ||
            now - this.lastModified > TIME_INTERVALS.STATISTICS_REFRESH
        ) {
            await this.loadContentIndex();
        }
        return this.contentFiles;
    }

    /**
     * Obtiene la estructura de archivos dinámicamente
     */
    static async getFileStructure(): Promise<FileNode[]> {
        try {
            logOperation("FileSystemAPI: Loading file structure");
            const knownPaths = await this.getContentFiles();
            logOperation("Known paths loaded", { count: knownPaths.length });
            const existingFiles = await this.discoverFiles();
            logOperation("Files discovered", { count: existingFiles.length });
            const structure = this.buildFileTree(existingFiles);
            logSuccess("File tree built", { nodes: structure.length });
            return structure;
        } catch (error) {
            logError(
                "FileSystemAPI: Error loading file structure",
                error instanceof Error ? error : new Error(String(error)),
            );
            return [];
        }
    }

    /**
     * Descubre qué archivos existen realmente probando cada uno
     */
    private static async discoverFiles(): Promise<string[]> {
        const knownPaths = await this.getContentFiles();
        const existingFiles: string[] = [];

        for (const filePath of knownPaths) {
            const fullUrl = `${this.baseUrl}/${filePath}`;
            try {
                const response = await fetch(fullUrl, { method: "HEAD" });
                if (response.ok) {
                    logOperation(`Found file: ${filePath}`);
                    existingFiles.push(filePath);
                } else {
                    logOperation(`Missing file: ${filePath}`);
                }
            } catch (error) {
                logError(
                    `Error checking file ${filePath}`,
                    error instanceof Error ? error : new Error(String(error)),
                );
            }
        }

        logOperation("File discovery completed", {
            total: existingFiles.length,
        });
        return existingFiles;
    }

    /**
     * Construye el árbol de archivos
     */
    private static buildFileTree(filePaths: string[]): FileNode[] {
        const folderMap = new Map<string, FileNode>();
        const rootNodes: FileNode[] = [];

        for (const filePath of filePaths) {
            const parts = filePath.split("/");
            const [folderName] = parts;
            let currentPath = "";

            // Crear o encontrar el nodo raíz
            if (!folderMap.has(folderName)) {
                const folderNode: FileNode = {
                    name: folderName,
                    type: "folder",
                    path: folderName,
                    children: [],
                };
                folderMap.set(folderName, folderNode);
                rootNodes.push(folderNode);
            }

            const rootFolder = folderMap.get(folderName)!;
            let currentNode = rootFolder;

            // Crear estructura anidada
            for (let i = 1; i < parts.length; i++) {
                currentPath = parts.slice(0, i + 1).join("/");
                const part = parts[i];

                if (i === parts.length - 1) {
                    // Es un archivo
                    const fileNode: FileNode = {
                        name: part,
                        type: "file",
                        path: currentPath,
                    };
                    currentNode.children = currentNode.children ?? [];
                    currentNode.children.push(fileNode);
                } else {
                    // Es una carpeta intermedia
                    let subFolder = currentNode.children?.find(
                        child => child.name === part && child.type === "folder",
                    );

                    if (!subFolder) {
                        subFolder = {
                            name: part,
                            type: "folder",
                            path: currentPath,
                            children: [],
                        };
                        currentNode.children = currentNode.children ?? [];
                        currentNode.children.push(subFolder);
                    }

                    currentNode = subFolder;
                }
            }
        }

        return rootNodes;
    }

    /**
     * Lee el contenido de un archivo específico
     */
    static async getFileContent(path: string): Promise<Document | null> {
        try {
            const fullUrl = `${this.baseUrl}/${path}`;
            const response = await fetch(fullUrl);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }

            const content = await response.text();

            // Extraer título del contenido
            const title = this.extractTitleFromContent(content) ?? path;

            return {
                title,
                content,
                path,
                type: path.endsWith(".mdx") ? "mdx" : "md",
            };
        } catch (error) {
            logError(
                `Error reading file: ${path}`,
                error instanceof Error ? error : new Error(String(error)),
            );
            return null;
        }
    }

    /**
     * Extrae el título del contenido markdown
     */
    private static extractTitleFromContent(content: string): string | null {
        const titleRegex = /^#\s+(.+)$/m;
        const titleResult = titleRegex.exec(content);
        return titleResult ? titleResult[1] : null;
    }

    /**
     * Extrae índice de contenido del markdown
     */
    static extractTableOfContents(
        content: string,
    ): Array<{ level: number; title: string; id: string }> {
        const headings: Array<{ level: number; title: string; id: string }> =
            [];
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        let match;

        while ((match = headingRegex.exec(content)) !== null) {
            const [, hashes, title] = match;
            const level = hashes.length;
            const id = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-");

            headings.push({ level, title, id });
        }

        return headings;
    }

    /**
     * Create a new file using the file manager
     */
    static async createFile(params: {
        name: string;
        type: string;
        path: string;
        content?: string;
    }) {
        try {
            logOperation("Creating file", params);
            const response = await fetch("/api/files/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }

            const result = await response.json();
            logSuccess("File created successfully", { name: params.name });
            return result;
        } catch (error) {
            logError(
                "Failed to create file",
                error instanceof Error ? error : new Error(String(error)),
                params,
            );
            throw error;
        }
    }

    /**
     * Create a new folder using the file manager
     */
    static async createFolder(params: { name: string; path: string }) {
        try {
            logOperation("Creating folder", params);
            const response = await fetch("/api/folders/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }

            const result = await response.json();
            logSuccess("Folder created successfully", { name: params.name });
            return result;
        } catch (error) {
            logError(
                "Failed to create folder",
                error instanceof Error ? error : new Error(String(error)),
                params,
            );
            throw error;
        }
    }

    /**
     * Delete a file or folder using the file manager
     */
    static async deleteItem(params: { path: string }) {
        try {
            logOperation("Deleting item", params);
            const response = await fetch("/api/files", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ paths: [params.path] }),
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }

            const result = await response.json();
            logSuccess("Item deleted successfully", { path: params.path });
            return result;
        } catch (error) {
            logError(
                "Failed to delete item",
                error instanceof Error ? error : new Error(String(error)),
                params,
            );
            throw error;
        }
    }

    /**
     * Delete multiple files/folders using the file manager
     */
    static async batchDelete(paths: string[]) {
        try {
            logOperation("Batch deleting items", { count: paths.length });
            const response = await fetch("/api/files", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ paths }),
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }

            const result = await response.json();
            logSuccess("Batch delete completed", { count: paths.length });
            return result;
        } catch (error) {
            logError(
                "Failed to batch delete items",
                error instanceof Error ? error : new Error(String(error)),
                { paths },
            );
            throw error;
        }
    }
}
