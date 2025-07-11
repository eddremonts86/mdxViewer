import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Clock, ExternalLink, File, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { DocumentCardProps } from "../types";

// Simple date formatter
const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export function DocumentCard({
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

    console.log("DocumentCard Debug:", {
        title,
        previewUrl,
        imageError,
        isLoading,
    });

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
                        {/* Use img tag - browsers handle SVG correctly */}
                        <img
                            src={previewUrl}
                            alt={`Preview of ${title}`}
                            className={`h-full w-full object-contain transition-all duration-300 group-hover:scale-105 ${
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
