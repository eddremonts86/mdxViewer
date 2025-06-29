import type { FileNode } from "@/types";

/**
 * Utilidad para crear dinámicamente la estructura de archivos
 * basada en los archivos reales en public/content/
 */

// Función para crear automáticamente la estructura de archivos
export const createFileStructureFromDirectory = async (): Promise<
    FileNode[]
> => {
    // En un entorno real, esto haría fetch a una API que lee el directorio
    // Por ahora, mantenermos la estructura manual pero facilitamos su actualización

    const fileStructure: FileNode[] = [
        {
            name: "docs",
            path: "/docs",
            type: "folder",
            children: [
                {
                    name: "introduction.md",
                    path: "/docs/introduction",
                    type: "file",
                    extension: "md",
                },
                {
                    name: "getting-started.md",
                    path: "/docs/getting-started",
                    type: "file",
                    extension: "md",
                },
            ],
        },
        {
            name: "examples",
            path: "/examples",
            type: "folder",
            children: [
                {
                    name: "interactive-demo.mdx",
                    path: "/examples/interactive-demo",
                    type: "file",
                    extension: "mdx",
                },
                {
                    name: "components-showcase.mdx",
                    path: "/examples/components-showcase",
                    type: "file",
                    extension: "mdx",
                },
            ],
        },
        {
            name: "guides",
            path: "/guides",
            type: "folder",
            children: [
                {
                    name: "setup.md",
                    path: "/guides/setup",
                    type: "file",
                    extension: "md",
                },
                {
                    name: "sonarCube.mdx",
                    path: "/guides/sonarCube",
                    type: "file",
                    extension: "mdx",
                },
                {
                    name: "comprehensive-markdown-test.md",
                    path: "/guides/comprehensive-markdown-test",
                    type: "file",
                    extension: "md",
                },
                {
                    name: "comprehensive-mdx-test.mdx",
                    path: "/guides/comprehensive-mdx-test",
                    type: "file",
                    extension: "mdx",
                },
                {
                    name: "markdown-complete-test.md",
                    path: "/guides/markdown-complete-test",
                    type: "file",
                    extension: "md",
                },
            ],
        },
        {
            name: "api",
            path: "/api",
            type: "folder",
            children: [
                {
                    name: "reference.md",
                    path: "/api/reference",
                    type: "file",
                    extension: "md",
                },
            ],
        },
    ];

    return fileStructure;
};

/**
 * Función helper para agregar un nuevo archivo a la estructura
 */
export const addFileToStructure = (
    structure: FileNode[],
    folderPath: string,
    fileName: string,
    fileExtension: string
): FileNode[] => {
    const pathParts = folderPath.split("/").filter((part) => part);
    const filePath = `/${folderPath}/${fileName.replace(/\.(md|mdx)$/, "")}`;

    const newFile: FileNode = {
        name: fileName,
        path: filePath,
        type: "file",
        extension: fileExtension,
    };

    // Crear una copia de la estructura
    const updatedStructure = JSON.parse(JSON.stringify(structure));

    // Encontrar la carpeta objetivo
    const targetFolder = updatedStructure.find(
        (folder: FileNode) =>
            folder.name === pathParts[0] && folder.type === "folder"
    );

    if (targetFolder?.children) {
        // Verificar si el archivo ya existe
        const fileExists = targetFolder.children.some(
            (child: FileNode) => child.name === fileName
        );

        if (!fileExists) {
            targetFolder.children.push(newFile);
            // Ordenar los archivos alfabéticamente
            targetFolder.children.sort((a: FileNode, b: FileNode) =>
                a.name.localeCompare(b.name)
            );
        }
    }

    return updatedStructure;
};

/**
 * Función para detectar automáticamente archivos nuevos
 * (En un entorno real, esto se conectaría a una API o filesystem watcher)
 */
export const detectNewFiles = async (): Promise<string[]> => {
    // Simular detección de archivos nuevos
    // En producción, esto haría fetch a una API que liste los archivos

    try {
        // Lista de archivos conocidos en public/content/
        const knownFiles = [
            "docs/introduction.md",
            "docs/getting-started.md",
            "examples/interactive-demo.mdx",
            "examples/components-showcase.mdx",
            "guides/setup.md",
            "guides/sonarCube.mdx",
            "guides/comprehensive-markdown-test.md",
            "guides/comprehensive-mdx-test.mdx",
            "guides/markdown-complete-test.md",
            "api/reference.md",
        ];

        return knownFiles;
    } catch (error) {
        console.error("Error detecting files:", error);
        return [];
    }
};

/**
 * Hook personalizado para manejar la actualización automática de archivos
 */
export const useFileWatcher = () => {
    const watchForNewFiles = async () => {
        try {
            const files = await detectNewFiles();
            console.log("Files detected:", files);

            // Aquí podrías emitir un evento o actualizar el estado global
            // para notificar a la barra lateral que hay archivos nuevos

            return files;
        } catch (error) {
            console.error("Error watching files:", error);
            return [];
        }
    };

    return { watchForNewFiles };
};

// Evento personalizado para notificar cambios en archivos
export const FILE_STRUCTURE_UPDATED = "fileStructureUpdated";

export const notifyFileStructureUpdate = () => {
    const event = new CustomEvent(FILE_STRUCTURE_UPDATED, {
        detail: { timestamp: new Date().toISOString() },
    });
    window.dispatchEvent(event);
};
