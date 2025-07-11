export interface DocumentCardProps {
    title: string;
    description?: string;
    path: string;
    type: "md" | "mdx";
    folder: string;
    lastModified: Date;
    tags?: string[];
    previewUrl?: string;
}

export type FilterType = "all" | "md" | "mdx";

export interface DocumentsByFolder {
    [folder: string]: DocumentCardProps[];
}
