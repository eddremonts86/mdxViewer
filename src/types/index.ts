/**
 * Centralized type definitions for the MDX Viewer application
 * All types are in English and follow TypeScript best practices
 */

// Document-related types
export interface Document {
    title: string;
    content: string;
    type: "md" | "mdx";
    frontmatter?: Record<string, unknown>;
    path: string;
}

export interface DocumentExportOptions {
    filename: string;
    title: string;
    format?: "a4" | "letter";
    orientation?: "portrait" | "landscape";
}

// File system types
export interface FileNode {
    name: string;
    path: string;
    type: "file" | "folder";
    children?: FileNode[];
    extension?: string;
}

// Component props types
export interface AlertProps {
    type?: "info" | "warning" | "error" | "success";
    children: React.ReactNode;
}

export interface InfoCardProps {
    title: string;
    children: React.ReactNode;
}

export interface CalloutProps {
    type?: "note" | "tip" | "warning" | "important";
    children: React.ReactNode;
}

export interface DemoProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export interface CustomButtonProps {
    children: React.ReactNode;
    variant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link";
    onClick?: () => void;
}

// Renderer types
export interface MarkdownRendererProps {
    content: string;
    type: "md" | "mdx";
}

// Navigation types
export interface NavigationItem {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
}

// Theme types
export type Theme = "light" | "dark" | "system";

export interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}
