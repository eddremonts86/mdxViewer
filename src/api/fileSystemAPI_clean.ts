import type { Document, FileNode } from "@/types";

/**
 * API para gestionar el sistema de archivos dinámico
 * Lee archivos reales desde public/content/
 */
export class FileSystemAPI {
    private static readonly baseUrl = "/content";
    private static readonly knownPaths = [
        "docs/introduction.md",
        "docs/getting-started.md",
        "examples/interactive-demo.mdx",
        "examples/components-showcase.mdx",
        "guides/setup.md",
        "guides/sonarCube.mdx",
        "api/reference.md",
    ];

    /**
     * Obtiene la estructura de archivos dinámicamente
     */
    static async getFileStructure(): Promise<FileNode[]> {
        try {
            const existingFiles = await this.discoverFiles();
            return this.buildFileTree(existingFiles);
        } catch (error) {
            console.error("Error loading file structure:", error);
            return [];
        }
    }

    /**
     * Descubre qué archivos existen realmente
     */
    private static async discoverFiles(): Promise<string[]> {
        const existingFiles: string[] = [];

        for (const filePath of this.knownPaths) {
            try {
                const response = await fetch(`${this.baseUrl}/${filePath}`);
                if (response.ok) {
                    existingFiles.push(filePath);
                }
            } catch {
                // Archivo no existe, continuar
                console.log(`File ${filePath} not found, skipping`);
            }
        }

        return existingFiles;
    }

    /**
     * Construye el árbol de archivos
     */
    private static buildFileTree(filePaths: string[]): FileNode[] {
        const folderMap = new Map<string, FileNode>();
        const rootFolders: FileNode[] = [];

        filePaths.forEach(filePath => {
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
        rootFolders.forEach(folder => {
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
            const filePath = this.pathToFilePath(path);
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
    private static pathToFilePath(path: string): string | null {
        // Remover leading slash
        const cleanPath = path.startsWith("/") ? path.slice(1) : path;

        // Buscar en archivos conocidos
        for (const filePath of this.knownPaths) {
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
        frontmatterText.split("\n").forEach(line => {
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
}
