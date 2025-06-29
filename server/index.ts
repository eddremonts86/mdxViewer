/**
 * Backend Server for MDX Viewer (TypeScript)
 * Handles file and folder operations via REST API endpoints
 */

import cors from "cors";
import express, { Request, Response } from "express";
import { promises as fs } from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const CONTENT_PATH = path.join(__dirname, "../public/content");
const MAX_FOLDER_DEPTH = 10; // Maximum allowed folder nesting level

// Types
interface FileItem {
    name: string;
    originalName?: string;
    path: string;
    type: "file" | "folder";
    extension?: string;
    size?: number;
    sizeFormatted?: string;
    lastModified?: string;
    lastModifiedFormatted?: string;
    previewUrl?: string | null;
    children?: FileItem[];
    depth?: number; // Add depth tracking
}

interface CreateFileRequest {
    name: string;
    type: "md" | "mdx";
    path: string;
    content?: string;
}

interface CreateFolderRequest {
    name: string;
    path: string;
}

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = req.body.path
            ? path.join(CONTENT_PATH, req.body.path)
            : CONTENT_PATH;
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Accept only text files and markdown
        const allowedTypes = [
            "text/plain",
            "text/markdown",
            "application/octet-stream", // For .md and .mdx files
        ];
        const allowedExtensions = [".md", ".mdx", ".txt"];
        const ext = path.extname(file.originalname).toLowerCase();

        if (
            allowedTypes.includes(file.mimetype) ||
            allowedExtensions.includes(ext)
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only markdown, text files are allowed!"));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// Logging middleware
app.use((req: Request, res: Response, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Utility functions
const generateOperationId = (): string => {
    return `op_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

const validateFileName = (
    name: string
): { isValid: boolean; error?: string } => {
    if (!name) {
        return { isValid: false, error: "File name is required" };
    }

    if (name.length > 255) {
        return {
            isValid: false,
            error: "File name is too long (max 255 characters)",
        };
    }

    const invalidChars = /[<>:"|\\?*]/;
    if (invalidChars.test(name)) {
        return {
            isValid: false,
            error: "File name contains invalid characters",
        };
    }

    return { isValid: true };
};

/**
 * Calculate the depth of a path
 */
const calculatePathDepth = (pathStr: string): number => {
    if (!pathStr || pathStr === "/") return 0;
    return pathStr.split("/").filter((segment) => segment.length > 0).length;
};

/**
 * Validate folder depth
 */
const validateFolderDepth = (
    pathStr: string,
    isCreatingFolder: boolean = false
): { isValid: boolean; error?: string; depth: number } => {
    const currentDepth = calculatePathDepth(pathStr);
    const finalDepth = isCreatingFolder ? currentDepth + 1 : currentDepth;

    if (finalDepth > MAX_FOLDER_DEPTH) {
        return {
            isValid: false,
            error: `Maximum folder depth exceeded. Limit is ${MAX_FOLDER_DEPTH} levels, attempted depth is ${finalDepth}`,
            depth: finalDepth,
        };
    }

    return { isValid: true, depth: finalDepth };
};

/**
 * Format file name to be more descriptive and grammatically correct
 */
const formatFileName = (fileName: string): string => {
    // Remove extension for processing
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const extension = path.extname(fileName);

    // Convert kebab-case, snake_case, and camelCase to proper words
    let formatted = nameWithoutExt
        .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters (camelCase)
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(" ");

    // Handle common abbreviations and technical terms
    const replacements: { [key: string]: string } = {
        Api: "API",
        Url: "URL",
        Http: "HTTP",
        Html: "HTML",
        Css: "CSS",
        Js: "JavaScript",
        Ts: "TypeScript",
        Mdx: "MDX",
        Md: "Markdown",
        Ui: "UI",
        Ux: "UX",
        Db: "Database",
        Id: "ID",
        Pdf: "PDF",
        Json: "JSON",
        Xml: "XML",
        Sql: "SQL",
    };

    // Apply replacements
    Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, "g");
        formatted = formatted.replace(regex, value);
    });

    return formatted + extension;
};

/**
 * Format file size to human readable format
 */
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const k = 1024;
    const decimals = 2;

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

    return `${size} ${units[i]}`;
};

/**
 * Format date to human readable format
 */
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

/**
 * Generate preview image for markdown/mdx files
 */
const generatePreview = async (
    filePath: string,
    content: string
): Promise<string | null> => {
    try {
        // Create a simple text preview (in a real implementation, you'd use a library like puppeteer or canvas)
        // For now, we'll return a placeholder URL structure
        const fileName = path.basename(filePath, path.extname(filePath));
        const previewFileName = `${fileName}-preview.png`;
        const previewUrl = `/api/previews/${encodeURIComponent(
            previewFileName
        )}`;

        // In a real implementation, you would:
        // 1. Convert markdown to HTML
        // 2. Render HTML to image using puppeteer or similar
        // 3. Save the image to a previews directory
        // 4. Return the URL to access the image

        console.log(`📸 Preview generated for: ${filePath} -> ${previewUrl}`);
        return previewUrl;
    } catch (error) {
        console.error("Failed to generate preview:", error);
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

const scanDirectory = async (
    dirPath: string,
    relativePath: string = "",
    currentDepth: number = 0
): Promise<FileItem[]> => {
    const items: FileItem[] = [];

    // Check if we've exceeded the maximum depth
    if (currentDepth > MAX_FOLDER_DEPTH) {
        console.warn(
            `Maximum folder depth (${MAX_FOLDER_DEPTH}) exceeded at path: ${relativePath}`
        );
        return items;
    }

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const itemRelativePath = path
                .join(relativePath, entry.name)
                .replace(/\\/g, "/");

            if (entry.isDirectory()) {
                // Only scan subdirectories if we haven't reached the depth limit
                const children =
                    currentDepth < MAX_FOLDER_DEPTH
                        ? await scanDirectory(
                              fullPath,
                              itemRelativePath,
                              currentDepth + 1
                          )
                        : [];

                items.push({
                    name: formatFileName(entry.name),
                    originalName: entry.name,
                    path: itemRelativePath,
                    type: "folder",
                    depth: currentDepth,
                    children,
                });
            } else {
                const ext = path.extname(entry.name);
                const stats = await getFileStats(fullPath);

                // Generate preview for markdown files
                let previewUrl: string | null = null;
                if (ext === ".md" || ext === ".mdx") {
                    try {
                        const content = await fs.readFile(fullPath, "utf-8");
                        previewUrl = await generatePreview(
                            itemRelativePath,
                            content
                        );
                    } catch (error) {
                        console.error(
                            `Failed to read file for preview: ${fullPath}`,
                            error
                        );
                    }
                }

                items.push({
                    name: formatFileName(entry.name),
                    originalName: entry.name,
                    path: itemRelativePath,
                    type: "file",
                    extension: ext,
                    depth: currentDepth,
                    previewUrl,
                    ...stats,
                });
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error);
    }

    return items.sort((a, b) => {
        // Folders first, then files
        if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
};

// API Endpoints

/**
 * Get file list with folder structure
 * GET /api/files
 */
app.get(
    "/api/files",
    async (req: Request, res: Response<ApiResponse<FileItem[]>>) => {
        try {
            console.log("📋 Getting file list...");

            // Ensure content directory exists
            await fs.mkdir(CONTENT_PATH, { recursive: true });

            const fileStructure = await scanDirectory(CONTENT_PATH);

            console.log(`📋 Found ${fileStructure.length} items in root`);

            res.json({
                success: true,
                data: fileStructure,
                message: `Found ${fileStructure.length} items`,
            });
        } catch (error) {
            console.error("❌ Failed to get file list:", error);
            res.status(500).json({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to get file list",
            });
        }
    }
);

/**
 * Get file content
 * GET /api/files/content?path=...
 */
app.get("/api/files/content", async (req, res) => {
    try {
        const filePath = req.query.path as string;

        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: "File path is required",
            });
        }

        const fullPath = path.join(CONTENT_PATH, filePath);
        const content = await fs.readFile(fullPath, "utf8");

        res.json({
            success: true,
            data: {
                path: filePath,
                content,
            },
        });
    } catch (error) {
        console.error("❌ Failed to read file:", error);
        res.status(500).json({
            success: false,
            error:
                error instanceof Error ? error.message : "Failed to read file",
        });
    }
});

/**
 * Create a new file
 * POST /api/files/create
 */
app.post("/api/files/create", async (req, res) => {
    try {
        const { name, type, path: relativePath, content } = req.body;

        console.log("📝 Creating file:", { name, type, relativePath });

        if (!name || !type || typeof relativePath !== "string") {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: name, type, path",
            });
        }

        const validation = validateFileName(name);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.error,
            });
        }

        const depthValidation = validateFolderDepth(relativePath);
        if (!depthValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: depthValidation.error,
            });
        }

        const fileName = `${name}.${type}`;
        const fullPath = path.join(CONTENT_PATH, relativePath, fileName);
        const fileRelativePath = path
            .join(relativePath, fileName)
            .replace(/\\/g, "/");

        // Check if file already exists
        try {
            await fs.access(fullPath);
            return res.status(409).json({
                success: false,
                error: `File already exists: ${fileName}`,
            });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                throw error;
            }
        }

        // Create directory if needed
        const dirPath = path.dirname(fullPath);
        await fs.mkdir(dirPath, { recursive: true });

        // Default content
        const fileContent =
            content || `# ${name}\n\nThis is a new ${type} document.\n`;

        // Write file
        await fs.writeFile(fullPath, fileContent, "utf8");

        console.log(`✅ File created: ${fileRelativePath}`);

        res.json({
            success: true,
            data: {
                path: fileRelativePath,
                name: fileName,
            },
            message: `File ${fileName} created successfully`,
        });
    } catch (error) {
        console.error("❌ Failed to create file:", error);
        res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create file",
        });
    }
});

/**
 * Create a new folder
 * POST /api/folders/create
 */
app.post("/api/folders/create", async (req, res) => {
    try {
        const { name, path: relativePath } = req.body;

        console.log("📁 Creating folder:", { name, relativePath });

        if (!name || typeof relativePath !== "string") {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: name, path",
            });
        }

        const validation = validateFileName(name);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.error,
            });
        }

        const depthValidation = validateFolderDepth(relativePath, true);
        if (!depthValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: depthValidation.error,
            });
        }

        const fullPath = path.join(CONTENT_PATH, relativePath, name);
        const folderRelativePath = path
            .join(relativePath, name)
            .replace(/\\/g, "/");

        // Check if folder already exists
        try {
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
                return res.status(409).json({
                    success: false,
                    error: `Folder already exists: ${name}`,
                });
            }
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                throw error;
            }
        }

        // Create folder
        await fs.mkdir(fullPath, { recursive: true });

        console.log(`✅ Folder created: ${folderRelativePath}`);

        res.json({
            success: true,
            data: {
                path: folderRelativePath,
                name,
            },
            message: `Folder ${name} created successfully`,
        });
    } catch (error) {
        console.error("❌ Failed to create folder:", error);
        res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create folder",
        });
    }
});

/**
 * Upload multiple files
 * POST /api/files/upload
 */
app.post(
    "/api/files/upload",
    upload.array("files"),
    async (req: Request, res: Response<ApiResponse>) => {
        try {
            const files = req.files as Express.Multer.File[];
            const targetPath = req.body.path || "";
            const createFolders = req.body.createFolders === "true";

            console.log("📤 Uploading files:", {
                count: files?.length || 0,
                targetPath,
                createFolders,
            });

            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "No files provided",
                });
            }

            const results = [];
            const errors = [];

            // Create target directory if needed
            const fullTargetPath = path.join(CONTENT_PATH, targetPath);
            if (createFolders) {
                await fs.mkdir(fullTargetPath, { recursive: true });
            }

            for (const file of files) {
                try {
                    const filePath = path
                        .join(targetPath, file.filename)
                        .replace(/\\/g, "/");
                    results.push({
                        originalName: file.originalname,
                        filename: file.filename,
                        path: filePath,
                        size: file.size,
                    });

                    console.log(`✅ File uploaded: ${filePath}`);
                } catch (error) {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : "Unknown error";
                    errors.push({
                        filename: file.originalname,
                        error: errorMessage,
                    });
                    console.error(
                        `❌ Failed to process file ${file.originalname}:`,
                        error
                    );
                }
            }

            res.json({
                success: errors.length === 0,
                data: {
                    uploaded: results,
                    errors,
                    totalFiles: files.length,
                    successCount: results.length,
                    errorCount: errors.length,
                },
                message: `Uploaded ${results.length}/${files.length} files successfully`,
            });
        } catch (error) {
            console.error("❌ Failed to upload files:", error);
            res.status(500).json({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to upload files",
            });
        }
    }
);

/**
 * Delete files/folders
 * DELETE /api/files
 */
app.delete("/api/files", async (req: Request, res: Response<ApiResponse>) => {
    try {
        const { paths } = req.body;

        console.log("🗑️ Deleting items:", { paths });

        if (!Array.isArray(paths) || paths.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Paths array is required",
            });
        }

        const results = [];
        const errors = [];

        for (const itemPath of paths) {
            try {
                const fullPath = path.join(CONTENT_PATH, itemPath);

                const stats = await fs.stat(fullPath);

                if (stats.isDirectory()) {
                    await fs.rm(fullPath, { recursive: true, force: true });
                    console.log(`✅ Folder deleted: ${itemPath}`);
                } else {
                    await fs.unlink(fullPath);
                    console.log(`✅ File deleted: ${itemPath}`);
                }

                results.push({
                    path: itemPath,
                    type: stats.isDirectory() ? "folder" : "file",
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                errors.push({
                    path: itemPath,
                    error: errorMessage,
                });
                console.error(`❌ Failed to delete ${itemPath}:`, error);
            }
        }

        res.json({
            success: errors.length === 0,
            data: {
                deleted: results,
                errors,
                totalItems: paths.length,
                successCount: results.length,
                errorCount: errors.length,
            },
            message: `Deleted ${results.length}/${paths.length} items successfully`,
        });
    } catch (error) {
        console.error("❌ Failed to delete files:", error);
        res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to delete files",
        });
    }
});

/**
 * Move files/folders
 * POST /api/files/move
 */
app.post(
    "/api/files/move",
    async (req: Request, res: Response<ApiResponse>) => {
        try {
            const { sourcePath, targetPath } = req.body;

            console.log("🔄 Moving item:", { sourcePath, targetPath });

            if (!sourcePath || typeof targetPath !== "string") {
                return res.status(400).json({
                    success: false,
                    error: "Missing required fields: sourcePath, targetPath",
                });
            }

            const sourceFullPath = path.join(CONTENT_PATH, sourcePath);
            const sourceFileName = path.basename(sourcePath);
            const targetFullPath = path.join(
                CONTENT_PATH,
                targetPath,
                sourceFileName
            );
            const targetRelativePath = path
                .join(targetPath, sourceFileName)
                .replace(/\\/g, "/");

            // Check if source exists
            try {
                await fs.access(sourceFullPath);
            } catch (error) {
                return res.status(404).json({
                    success: false,
                    error: `Source file/folder not found: ${sourcePath}`,
                });
            }

            // Check if target directory exists
            const targetDir = path.join(CONTENT_PATH, targetPath);
            try {
                const targetStats = await fs.stat(targetDir);
                if (!targetStats.isDirectory()) {
                    return res.status(400).json({
                        success: false,
                        error: `Target is not a directory: ${targetPath}`,
                    });
                }
            } catch (error) {
                return res.status(404).json({
                    success: false,
                    error: `Target directory not found: ${targetPath}`,
                });
            }

            // Validate depth after move
            const depthValidation = validateFolderDepth(targetRelativePath);
            if (!depthValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: depthValidation.error,
                });
            }

            // Check if target already exists
            try {
                await fs.access(targetFullPath);
                return res.status(409).json({
                    success: false,
                    error: `Item already exists at target location: ${sourceFileName}`,
                });
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                    throw error;
                }
            }

            // Prevent moving a folder into itself or its subfolder
            if (targetPath.startsWith(sourcePath)) {
                return res.status(400).json({
                    success: false,
                    error: "Cannot move a folder into itself or its subfolder",
                });
            }

            // Move the file/folder
            await fs.rename(sourceFullPath, targetFullPath);

            console.log(`✅ Item moved: ${sourcePath} → ${targetRelativePath}`);

            res.json({
                success: true,
                data: {
                    sourcePath,
                    targetPath: targetRelativePath,
                    name: sourceFileName,
                },
                message: `${sourceFileName} moved successfully`,
            });
        } catch (error) {
            console.error("❌ Failed to move item:", error);
            res.status(500).json({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to move item",
            });
        }
    }
);

/**
 * Serve preview images
 * GET /api/previews/:filename
 */
app.get("/api/previews/:filename", (req: Request, res: Response) => {
    const { filename } = req.params;
    const previewsDir = path.join(__dirname, "../public/previews");
    const filePath = path.join(previewsDir, filename);

    // Check if file exists
    fs.access(filePath)
        .then(() => {
            res.sendFile(filePath);
        })
        .catch(() => {
            // Send a placeholder image or generate one on the fly
            res.status(404).json({
                success: false,
                error: "Preview not found",
                message: "Preview image is being generated or not available",
            });
        });
});

/**
 * Health check endpoint
 */
app.get("/api/health", (req: Request, res: Response<ApiResponse>) => {
    res.json({
        success: true,
        data: {
            status: "ok",
            timestamp: new Date().toISOString(),
            contentPath: CONTENT_PATH,
        },
        message: "Server is healthy",
    });
});

// Start server
app.listen(PORT, () => {
    console.log(
        `🚀 File Manager API Server running on http://localhost:${PORT}`
    );
    console.log(`📁 Content directory: ${CONTENT_PATH}`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
    console.log("\n👋 Shutting down File Manager API Server...");
    process.exit(0);
});
