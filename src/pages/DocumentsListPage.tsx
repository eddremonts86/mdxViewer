import { PreviewSystemStatus } from "@/components/PreviewSystemStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useFiles } from "@/hooks/api/useFiles";
import { useSiteStatistics } from "@/hooks/useSiteStatistics";
import {
    BarChart3,
    BookOpen,
    Calendar,
    ChevronDown,
    Clock,
    Download,
    ExternalLink,
    File,
    FileText,
    FolderPlus,
    Import,
    Plus,
    Search,
    Settings,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

// Simple date formatter
const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

interface DocumentCardProps {
    title: string;
    description?: string;
    path: string;
    type: "md" | "mdx";
    folder: string;
    lastModified: Date;
    tags?: string[];
    previewUrl?: string;
}

function DocumentCard({
    title,
    description,
    path,
    type,
    folder,
    lastModified,
    tags = [],
    previewUrl,
}: DocumentCardProps) {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    return (
        <Card className="group border-muted-foreground/10 relative overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
            {/* Preview Image */}
            <div className="bg-muted relative h-32 w-full overflow-hidden">
                {previewUrl && !imageError ? (
                    <>
                        {isLoading && (
                            <div className="bg-muted absolute inset-0 flex animate-pulse items-center justify-center">
                                <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                            </div>
                        )}
                        <img
                            src={previewUrl}
                            alt={`Preview of ${title}`}
                            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
                                isLoading ? "opacity-0" : "opacity-100"
                            }`}
                            onError={() => {
                                console.log(
                                    `Preview failed to load: ${title} - ${previewUrl}`
                                );
                                setImageError(true);
                                setIsLoading(false);
                            }}
                            onLoad={() => {
                                console.log(`Preview loaded: ${title}`);
                                setIsLoading(false);
                            }}
                            loading="lazy"
                        />
                    </>
                ) : (
                    <div className="from-muted to-muted/80 flex h-full w-full items-center justify-center bg-gradient-to-br">
                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                            {type === "mdx" ? (
                                <FileText className="text-muted-foreground/50 h-8 w-8" />
                            ) : (
                                <File className="text-muted-foreground/50 h-8 w-8" />
                            )}
                            <span className="text-muted-foreground/70 text-xs font-medium">
                                {folder}/{title}
                            </span>
                        </div>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge
                        variant={type === "mdx" ? "default" : "secondary"}
                        className="px-1.5 py-0.5 text-xs shadow-sm"
                    >
                        {type.toUpperCase()}
                    </Badge>
                </div>
                {/* Preview indicator */}
                {previewUrl && !imageError && (
                    <div className="absolute bottom-2 left-2">
                        <Badge
                            variant="outline"
                            className="bg-background/80 px-1.5 py-0.5 text-xs backdrop-blur-sm"
                        >
                            Preview
                        </Badge>
                    </div>
                )}
            </div>

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="group-hover:text-primary text-base leading-tight transition-colors">
                            {title}
                        </CardTitle>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="px-1.5 py-0.5 text-xs"
                            >
                                📁 {folder}
                            </Badge>
                            {previewUrl && !imageError && (
                                <Badge
                                    variant="secondary"
                                    className="bg-green-100 px-1.5 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200"
                                >
                                    🖼️ Preview Available
                                </Badge>
                            )}
                        </div>
                    </div>
                    <Link to={`/document/${path}`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {description && (
                    <CardDescription className="mb-3 line-clamp-2 text-sm">
                        {description}
                    </CardDescription>
                )}

                <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(lastModified)}</span>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex items-center gap-1">
                            <span>#{tags[0]}</span>
                            {tags.length > 1 && <span>+{tags.length - 1}</span>}
                        </div>
                    )}
                </div>
            </CardContent>

            <Link
                to={`/document/${path.replace(/^\/+/, "")}`}
                className="absolute inset-0 z-10"
                aria-label={`Open ${title}`}
            />
        </Card>
    );
}

export function DocumentsListPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<"all" | "md" | "mdx">(
        "all"
    );

    // Use real API data
    const { data: files, isLoading: loading, error } = useFiles();

    // Get real statistics
    const stats = useSiteStatistics();

    // Convert files to documents format with real API data
    const documents = useMemo(() => {
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

                    // Generate preview URL with proper path handling
                    const previewUrl = `/api/previews/${filePath.replace(/\.(md|mdx)$/, ".png")}`;

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

    // Filter documents based on search and type
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch =
                searchQuery === "" ||
                doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.folder.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const matchesFilter =
                selectedFilter === "all" || doc.type === selectedFilter;

            return matchesSearch && matchesFilter;
        });
    }, [documents, searchQuery, selectedFilter]);

    // Group documents by folder
    const documentsByFolder = useMemo(() => {
        const grouped: Record<string, DocumentCardProps[]> = {};
        filteredDocuments.forEach(doc => {
            if (!grouped[doc.folder]) {
                grouped[doc.folder] = [];
            }
            grouped[doc.folder].push(doc);
        });
        return grouped;
    }, [filteredDocuments]);

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                        <p className="text-muted-foreground">
                            Loading documents...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <h3 className="mb-2 text-lg font-semibold">
                            Error loading documents
                        </h3>
                        <p className="text-muted-foreground">
                            An error occurred
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-8 px-6 py-8">
            {/* Header Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            All Documents
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Explore and discover documentation, guides, and
                            examples
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Settings className="mr-2 h-4 w-4" />
                                    View Options
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Show Daily Notes
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Doc
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <FolderPlus className="mr-2 h-4 w-4" />
                                    New Folder
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Import className="mr-2 h-4 w-4" />
                                    Import
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export as
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Stats
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                        <Input
                            placeholder="Search documents, folders, or content..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={
                                selectedFilter === "all" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedFilter("all")}
                        >
                            All ({documents.length})
                        </Button>
                        <Button
                            variant={
                                selectedFilter === "md" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedFilter("md")}
                        >
                            MD ({documents.filter(d => d.type === "md").length})
                        </Button>
                        <Button
                            variant={
                                selectedFilter === "mdx" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedFilter("mdx")}
                        >
                            MDX (
                            {documents.filter(d => d.type === "mdx").length})
                        </Button>
                    </div>
                </div>
            </div>

            {/* Preview System Status */}
            <PreviewSystemStatus
                totalDocuments={documents.length}
                previewsAvailable={documents.filter(d => d.previewUrl).length}
                isLoading={loading}
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Documents
                        </CardTitle>
                        <BookOpen className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.loading ? "..." : stats.totalDocuments}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Across all folders
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Previews Available
                        </CardTitle>
                        <div className="text-muted-foreground text-lg">🖼️</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {documents.filter(d => d.previewUrl).length}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            {Math.round(
                                (documents.filter(d => d.previewUrl).length /
                                    documents.length) *
                                    100
                            ) || 0}
                            % coverage
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Markdown Files
                        </CardTitle>
                        <File className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.loading ? "..." : stats.documentsByType.md}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Static content
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            MDX Files
                        </CardTitle>
                        <FileText className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.loading ? "..." : stats.documentsByType.mdx}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Interactive content
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Folders
                        </CardTitle>
                        <Calendar className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.loading ? "..." : stats.totalFolders}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Organization units
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Documents Grid */}
            {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                        <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                        <h3 className="mb-2 text-lg font-semibold">
                            No documents found
                        </h3>
                        <p className="text-muted-foreground">
                            {searchQuery
                                ? `No documents match "${searchQuery}"`
                                : "No documents available to display"}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(documentsByFolder).map(([folder, docs]) => (
                        <div key={folder} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold capitalize">
                                    {folder.replace(/[-_]/g, " ")}
                                </h2>
                                <Badge variant="secondary" className="text-xs">
                                    {docs.length} document
                                    {docs.length !== 1 ? "s" : ""}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {docs.map((doc, index) => (
                                    <DocumentCard
                                        key={`${doc.path}-${index}`}
                                        {...doc}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
