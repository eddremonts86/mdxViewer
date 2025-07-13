import React from "react";

// Markdown renderer types
export interface MarkdownRendererProps {
    content: string;
    type: "markdown" | "mdx";
}

// Component props types for markdown elements
export interface MarkdownComponentProps {
    children?: React.ReactNode;
}

// Component props type aliases for markdown elements
export type HeadingProps = React.ComponentProps<"h1">;
export type LinkProps = React.ComponentProps<"a">;
export type ImageProps = React.ComponentProps<"img">;
export type CodeProps = React.ComponentProps<"code">;

// Use the base type directly for simple components
export type TableProps = MarkdownComponentProps;
export type ListProps = MarkdownComponentProps;
export type BlockquoteProps = MarkdownComponentProps;

// Theme types
export type ThemeType = "light" | "dark" | "system";
export type EffectiveTheme = "light" | "dark";
