import type { Document, FileNode } from "@/types";

/**
 * API para gestionar el sistema de archivos dinámico
 * Lee archivos reales desde public/content/
 * Se actualiza automáticamente cuando cambia contentIndex.ts
 */
export class FileSystemAPI {
    private static readonly baseUrl = "/content";
    private static contentFiles: string[] = [];
    private static lastModified = 0;

    /**
     * Carga el índice de archivos dinámicamente
     */
    private static async loadContentIndex(): Promise<string[]> {
        try {
            // Para Vite, usar import dinámico con timestamp como query param
            const timestamp = Date.now();
            const module = await import(
                /* @vite-ignore */ `./contentIndex.ts?t=${timestamp}`
            );
            this.contentFiles = module.CONTENT_FILES ?? [];
            this.lastModified = timestamp;
            console.log(
                `📋 Índice actualizado: ${this.contentFiles.length} archivos`
            );
            return this.contentFiles;
        } catch (error) {
            console.error("Error cargando índice de contenido:", error);
            return this.contentFiles; // Devolver caché si falla
        }
    }

    /**
     * Obtiene la lista de archivos (con auto-reload)
     */
    private static async getContentFiles(): Promise<string[]> {
        // Si no hay archivos cargados o han pasado más de 5 segundos, recargar
        const now = Date.now();
        if (this.contentFiles.length === 0 || now - this.lastModified > 5000) {
            await this.loadContentIndex();
        }
        return this.contentFiles;
    }

    /**
     * Obtiene la estructura de archivos dinámicamente
     */
    static async getFileStructure(): Promise<FileNode[]> {
        console.log("🔍 FileSystemAPI: Loading file structure...");
        try {
            const knownPaths = await this.getContentFiles();
            console.log("📋 Known paths:", knownPaths);
            const existingFiles = await this.discoverFiles();
            console.log("📁 FileSystemAPI: Found files:", existingFiles);
            const structure = this.buildFileTree(existingFiles);
            console.log("🌳 FileSystemAPI: Built tree:", structure);
            return structure;
        } catch (error) {
            console.error(
                "❌ FileSystemAPI: Error loading file structure:",
                error
            );
            return [];
        }
    }

    /**
     * Descubre qué archivos existen realmente probando cada uno
     */
    private static async discoverFiles(): Promise<string[]> {
        const existingFiles: string[] = [];
        const knownPaths = await this.getContentFiles();

        // Probar archivos conocidos
        for (const filePath of knownPaths) {
            try {
                const response = await fetch(`${this.baseUrl}/${filePath}`, {
                    method: "HEAD",
                });
                if (response.ok) {
                    existingFiles.push(filePath);
                    console.log(`✓ Found file: ${filePath}`);
                } else {
                    console.log(`✗ Missing file: ${filePath}`);
                }
            } catch (error) {
                console.log(`✗ Error checking file ${filePath}:`, error);
            }
        }

        console.log(`Total files discovered: ${existingFiles.length}`);
        return existingFiles;
    }

    /**
     * Construye el árbol de archivos
     */
    private static buildFileTree(filePaths: string[]): FileNode[] {
        const folderMap = new Map<string, FileNode>();
        const rootFolders: FileNode[] = [];

        filePaths.forEach((filePath) => {
            const parts = filePath.split("/");
            const fileName = parts.pop()!;
            const folderName = parts[0];
            const extension = fileName.split(".").pop() as "md" | "mdx";

            // Crear o encontrar carpeta
            if (!folderMap.has(folderName)) {
                const folder: FileNode = {
                    name: folderName,
                    path: `/${folderName}`,
                    type: "folder",
                    children: [],
                };
                folderMap.set(folderName, folder);
                rootFolders.push(folder);
            }

            // Agregar archivo a la carpeta
            const folder = folderMap.get(folderName)!;
            folder.children!.push({
                name: fileName,
                path: `/${filePath.replace(/\.(md|mdx)$/, "")}`,
                type: "file",
                extension,
            });
        });

        // Ordenar todo alfabéticamente
        rootFolders.forEach((folder) => {
            if (folder.children) {
                folder.children.sort((a, b) => a.name.localeCompare(b.name));
            }
        });
        rootFolders.sort((a, b) => a.name.localeCompare(b.name));

        return rootFolders;
    }

    /**
     * Lee el contenido de un archivo específico
     */
    static async getFileContent(path: string): Promise<Document | null> {
        try {
            // Convertir path a filepath
            const filePath = await this.pathToFilePath(path);
            if (!filePath) return null;

            const response = await fetch(`${this.baseUrl}/${filePath}`);
            if (!response.ok) {
                throw new Error(`File not found: ${filePath}`);
            }

            const content = await response.text();
            const { frontmatter, body } = this.parseFrontmatter(content);
            const fileType = filePath.endsWith(".mdx") ? "mdx" : "md";

            return {
                title:
                    frontmatter.title ??
                    this.extractTitleFromContent(body) ??
                    path.split("/").pop() ??
                    "Untitled",
                content: body,
                type: fileType,
                path,
                frontmatter,
            };
        } catch (error) {
            console.error(`Error loading file ${path}:`, error);
            return null;
        }
    }

    /**
     * Convierte un path de ruta a filepath
     */
    private static async pathToFilePath(path: string): Promise<string | null> {
        // Remover leading slash
        const cleanPath = path.startsWith("/") ? path.slice(1) : path;

        // Buscar en archivos conocidos
        const knownPaths = await this.getContentFiles();
        for (const filePath of knownPaths) {
            const pathWithoutExtension = filePath.replace(/\.(md|mdx)$/, "");
            if (pathWithoutExtension === cleanPath) {
                return filePath;
            }
        }

        return null;
    }

    /**
     * Parse frontmatter de un archivo markdown/mdx
     */
    private static parseFrontmatter(content: string): {
        frontmatter: Record<string, string>;
        body: string;
    } {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);

        if (!match) {
            return { frontmatter: {}, body: content };
        }

        const frontmatterText = match[1];
        const body = match[2];
        const frontmatter: Record<string, string> = {};

        // Parse YAML simple
        frontmatterText.split("\n").forEach((line) => {
            const colonIndex = line.indexOf(":");
            if (colonIndex > 0) {
                const key = line.slice(0, colonIndex).trim();
                const value = line
                    .slice(colonIndex + 1)
                    .trim()
                    .replace(/^["']|["']$/g, "");
                frontmatter[key] = value;
            }
        });

        return { frontmatter, body };
    }

    /**
     * Extrae el título del contenido markdown
     */
    private static extractTitleFromContent(content: string): string | null {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        return titleMatch ? titleMatch[1].trim() : null;
    }

    /**
     * Extrae índice de contenido del markdown
     */
    static extractTableOfContents(
        content: string
    ): Array<{ level: number; title: string; id: string }> {
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const toc: Array<{ level: number; title: string; id: string }> = [];
        let match;

        while ((match = headingRegex.exec(content)) !== null) {
            const level = match[1].length;
            const title = match[2].trim();
            const id = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();

            toc.push({ level, title, id });
        }

        return toc;
    }

    /**
     * Create a new file using the file manager
     */
    static async createFile(params: {
        path: string;
        name: string;
        content?: string;
        type: "md" | "mdx";
        metadata?: any;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            // This would normally make an API call to the server
            // For now, we'll return success and let the file watcher handle the update
            console.log("📝 Creating file:", params);

            // In a real implementation, this would call the backend API
            // const result = await FileManagerAPI.createFile(params);

            return { success: true };
        } catch (error) {
            console.error("Error creating file:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Create a new folder using the file manager
     */
    static async createFolder(params: {
        path: string;
        name: string;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            console.log("📁 Creating folder:", params);

            // In a real implementation, this would call the backend API
            // const result = await FileManagerAPI.createFolder(params);

            return { success: true };
        } catch (error) {
            console.error("Error creating folder:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Delete an item (file or folder)
     */
    static async deleteItem(params: {
        path: string;
        isFolder: boolean;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            console.log("🗑️ Deleting item:", params);

            // In a real implementation, this would call the backend API
            // const result = await FileManagerAPI.deleteItem(params);

            return { success: true };
        } catch (error) {
            console.error("Error deleting item:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * Batch delete multiple items
     */
    static async batchDelete(paths: string[]): Promise<{
        success: boolean;
        errors?: string[];
        processed: number;
    }> {
        try {
            console.log("🗑️ Batch deleting items:", paths);

            // In a real implementation, this would call the backend API
            // const result = await FileManagerAPI.batchDelete({ paths });

            return { success: true, processed: paths.length };
        } catch (error) {
            console.error("Error batch deleting items:", error);
            return {
                success: false,
                errors: [
                    error instanceof Error ? error.message : "Unknown error",
                ],
                processed: 0,
            };
        }
    }
}
