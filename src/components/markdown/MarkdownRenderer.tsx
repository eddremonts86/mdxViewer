import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";

import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { MDXWrapper } from "@/components/globals/MDXWrapper";
import { createCodeComponent } from "@/components/markdown/componentFactories";
import {
    Blockquote,
    Emphasis,
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
    HorizontalRule,
    Image,
    Link,
    ListItem,
    OrderedList,
    Paragraph,
    Strong,
    Table,
    TableBody,
    TableData,
    TableHead,
    TableHeader,
    TableRow,
    UnorderedList,
} from "@/components/markdown/MarkdownComponents";
import { useEffectiveTheme } from "@/hooks/useMarkdownTheme";
import type { MarkdownRendererProps } from "@/types/markdownIndex";

// Import KaTeX CSS for math rendering
import "katex/dist/katex.min.css";

// Define custom markdown components mapping
const createMarkdownComponents = (codeComponent: React.ComponentType<React.ComponentProps<"code">>) => ({
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    p: Paragraph,
    blockquote: Blockquote,
    ul: UnorderedList,
    ol: OrderedList,
    li: ListItem,
    table: Table,
    thead: TableHead,
    tbody: TableBody,
    tr: TableRow,
    th: TableHeader,
    td: TableData,
    a: Link,
    img: Image,
    hr: HorizontalRule,
    strong: Strong,
    em: Emphasis,
    code: codeComponent,
});

export function MarkdownRenderer({ content, type }: MarkdownRendererProps) {
    const effectiveTheme = useEffectiveTheme();

    // Create code component with theme support
    const codeComponent = useMemo(() => createCodeComponent(effectiveTheme), [effectiveTheme]);

    const renderedContent = useMemo(() => {
        const components = createMarkdownComponents(codeComponent);

        if (type === "mdx") {
            return (
                <MDXWrapper>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                        components={components}
                    >
                        {content}
                    </ReactMarkdown>
                </MDXWrapper>
            );
        }

        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        );
    }, [content, type, codeComponent]);

    return <div className="markdown-content max-w-none space-y-4">{renderedContent}</div>;
}
