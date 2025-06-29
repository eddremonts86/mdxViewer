import { MDXWrapper } from "@/components/globals/MDXWrapper";
import { useTheme } from "@/components/theme-provider";
import type { MarkdownRendererProps } from "@/types";
import {
    generateHeadingId as createHeadingId,
    extractTextFromReactNode as extractText,
} from "@/utils/headingUtils";
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
    oneDark,
    oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

// Import KaTeX CSS for math rendering
import "katex/dist/katex.min.css";

// Helper function to generate heading IDs using our utility
const generateHeadingId = (children: React.ReactNode): string => {
    const text = extractText(children);
    return createHeadingId(text);
};

// Define custom markdown components with beautiful typography and spacing
const createMarkdownComponents = () => ({
    h1: ({ children }: React.ComponentProps<"h1">) => {
        const id = generateHeadingId(children);
        return (
            <h1
                id={id}
                className="border-border text-foreground mt-12 mb-8 scroll-m-20 border-b pb-4 font-sans text-4xl font-bold tracking-tight antialiased lg:text-5xl"
                style={{
                    fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                    letterSpacing: "-0.025em",
                    fontWeight: "700",
                }}
            >
                {children}
            </h1>
        );
    },
    h2: ({ children }: React.ComponentProps<"h2">) => {
        const id = generateHeadingId(children);
        return (
            <h2
                id={id}
                className="border-border text-foreground mt-10 mb-6 scroll-m-20 border-b pb-4 font-sans text-3xl font-semibold tracking-tight antialiased first:mt-0"
                style={{
                    fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                    letterSpacing: "-0.02em",
                    fontWeight: "600",
                }}
            >
                {children}
            </h2>
        );
    },
    h3: ({ children }: React.ComponentProps<"h3">) => {
        const id = generateHeadingId(children);
        return (
            <h3
                id={id}
                className="text-foreground mt-8 mb-5 scroll-m-20 font-sans text-2xl font-semibold tracking-tight antialiased"
                style={{
                    fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                    letterSpacing: "-0.015em",
                    fontWeight: "600",
                }}
            >
                {children}
            </h3>
        );
    },
    h4: ({ children }: React.ComponentProps<"h4">) => {
        const id = generateHeadingId(children);
        return (
            <h4
                id={id}
                className="text-foreground mt-7 mb-4 scroll-m-20 font-sans text-xl font-semibold tracking-tight antialiased"
                style={{
                    fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                    letterSpacing: "-0.01em",
                    fontWeight: "600",
                }}
            >
                {children}
            </h4>
        );
    },
    h5: ({ children }: React.ComponentProps<"h5">) => {
        const id = generateHeadingId(children);
        return (
            <h5
                id={id}
                className="text-foreground mt-6 mb-3 scroll-m-20 font-sans text-lg font-semibold tracking-tight antialiased"
                style={{
                    fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                    letterSpacing: "-0.01em",
                    fontWeight: "600",
                }}
            >
                {children}
            </h5>
        );
    },
    h6: ({ children }: React.ComponentProps<"h6">) => {
        const id = generateHeadingId(children);
        return (
            <h6
                id={id}
                className="text-foreground mt-5 mb-2 scroll-m-20 font-sans text-base font-semibold tracking-tight antialiased"
                style={{
                    fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                    letterSpacing: "-0.01em",
                    fontWeight: "600",
                }}
            >
                {children}
            </h6>
        );
    },
    p: ({ children }: React.ComponentProps<"p">) => (
        <p
            className="text-foreground mb-4 font-sans text-base leading-relaxed font-normal antialiased [&:not(:first-child)]:mt-4"
            style={{
                fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                lineHeight: "1.75",
                letterSpacing: "-0.01em",
            }}
        >
            {children}
        </p>
    ),
    blockquote: ({ children }: React.ComponentProps<"blockquote">) => (
        <blockquote
            className="border-primary text-muted-foreground bg-muted/20 mt-8 mb-8 rounded-r-lg border-l-4 py-6 pl-8 font-sans text-lg font-medium italic antialiased"
            style={{
                fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                lineHeight: "1.75",
                letterSpacing: "-0.01em",
            }}
        >
            <div className="relative">
                <span className="text-primary/30 absolute -top-2 -left-2 text-4xl">
                    "
                </span>
                {children}
            </div>
        </blockquote>
    ),
    ul: ({ children }: React.ComponentProps<"ul">) => (
        <ul className="text-foreground font-sans antialiased">{children}</ul>
    ),
    ol: ({ children }: React.ComponentProps<"ol">) => (
        <ol className="text-foreground font-sans antialiased">{children}</ol>
    ),
    li: ({ children }: React.ComponentProps<"li">) => (
        <li
            className="text-foreground font-sans antialiased"
            style={{
                fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                lineHeight: "1.7",
                letterSpacing: "-0.01em",
            }}
        >
            {children}
        </li>
    ),
    table: ({ children }: React.ComponentProps<"table">) => (
        <div className="border-border my-10 w-full overflow-x-auto rounded-lg border shadow-sm">
            <table className="w-full border-collapse">{children}</table>
        </div>
    ),
    thead: ({ children }: React.ComponentProps<"thead">) => (
        <thead className="bg-muted/50">{children}</thead>
    ),
    tbody: ({ children }: React.ComponentProps<"tbody">) => (
        <tbody>{children}</tbody>
    ),
    tr: ({ children }: React.ComponentProps<"tr">) => (
        <tr className="border-border hover:bg-muted/30 border-b transition-colors duration-200">
            {children}
        </tr>
    ),
    th: ({ children }: React.ComponentProps<"th">) => (
        <th
            className="border-border bg-muted/30 text-foreground border-r px-6 py-4 text-left font-sans font-semibold antialiased [&[align=center]]:text-center [&[align=right]]:text-right"
            style={{
                fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                fontWeight: "600",
            }}
        >
            {children}
        </th>
    ),
    td: ({ children }: React.ComponentProps<"td">) => (
        <td
            className="border-border text-foreground border-r px-6 py-4 text-left font-sans antialiased [&[align=center]]:text-center [&[align=right]]:text-right"
            style={{
                fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
            }}
        >
            {children}
        </td>
    ),
    a: ({ children, href, ...props }: React.ComponentProps<"a">) => {
        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            // Handle internal anchor links
            if (href?.startsWith("#")) {
                e.preventDefault();
                const targetId = href.slice(1);
                const element = document.getElementById(targetId);
                if (element) {
                    // Use better scroll with header offset
                    const headerOffset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition =
                        elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });

                    // Update URL hash without triggering a page reload
                    window.history.pushState(null, "", href);
                }
            }
        };

        return (
            <a
                href={href}
                onClick={handleClick}
                className="text-primary hover:text-primary/80 decoration-primary/40 hover:decoration-primary/70 font-sans font-medium underline underline-offset-4 antialiased transition-all duration-200"
                style={{
                    fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                }}
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={
                    href?.startsWith("http") ? "noopener noreferrer" : undefined
                }
                {...props}
            >
                {children}
            </a>
        );
    },
    img: ({ src, alt, ...props }: React.ComponentProps<"img">) => (
        <div className="my-8">
            <img
                src={src}
                alt={alt}
                className="border-border mx-auto h-auto max-w-full rounded-xl border shadow-lg"
                {...props}
            />
            {alt && (
                <p
                    className="text-muted-foreground mt-3 text-center font-sans text-sm italic antialiased"
                    style={{
                        fontFamily:
                            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                    }}
                >
                    {alt}
                </p>
            )}
        </div>
    ),
    hr: () => (
        <hr className="border-border mx-auto my-12 w-1/3 border-t-2 opacity-50" />
    ),
    strong: ({ children }: React.ComponentProps<"strong">) => (
        <strong
            className="text-foreground font-sans font-semibold antialiased"
            style={{
                fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
                fontWeight: "600",
            }}
        >
            {children}
        </strong>
    ),
    em: ({ children }: React.ComponentProps<"em">) => (
        <em
            className="text-foreground font-sans italic antialiased"
            style={{
                fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
            }}
        >
            {children}
        </em>
    ),
});

export function MarkdownRenderer({ content, type }: MarkdownRendererProps) {
    const { theme } = useTheme();

    // Get system theme if theme is set to system
    const effectiveTheme = useMemo(() => {
        if (theme === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }
        return theme;
    }, [theme]);

    // Create code component with theme support
    const codeComponent = useMemo(() => {
        return ({
            className,
            children,
            ...props
        }: React.ComponentProps<"code">) => {
            const match = /language-(\w+)/.exec(className ?? "");
            const inline = !className?.includes("language-");

            return !inline && match ? (
                <div className="group my-6">
                    <SyntaxHighlighter
                        style={effectiveTheme === "dark" ? oneDark : oneLight}
                        language={match[1]}
                        PreTag="div"
                        className="border-border overflow-hidden rounded-lg border shadow-sm"
                        customStyle={{
                            margin: 0,
                            padding: "1.25rem",
                            fontSize: "0.875rem",
                            lineHeight: "1.6",
                            fontFamily:
                                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace",
                            background:
                                effectiveTheme === "dark"
                                    ? "var(--card)"
                                    : "var(--muted)",
                            fontWeight: "400",
                            borderRadius: "0.5rem",
                            fontFeatureSettings: '"liga" 1, "calt" 1',
                        }}
                        codeTagProps={{
                            style: {
                                fontFamily:
                                    "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace",
                                fontWeight: "400",
                                fontSize: "0.875rem",
                                lineHeight: "1.6",
                            },
                        }}
                    >
                        {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code
                    className={`${
                        className ?? ""
                    } bg-muted text-foreground border-border rounded border px-2 py-1 font-mono text-sm`}
                    style={{
                        fontFamily:
                            "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace",
                        fontWeight: "400",
                        fontSize: "0.875rem",
                        fontFeatureSettings: '"liga" 1, "calt" 1',
                    }}
                    {...props}
                >
                    {children}
                </code>
            );
        };
    }, [effectiveTheme]);

    const renderedContent = useMemo(() => {
        const markdownComponents = createMarkdownComponents();
        const components = {
            ...markdownComponents,
            code: codeComponent,
        };

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

    return (
        <div className="markdown-content max-w-none space-y-4">
            {renderedContent}
        </div>
    );
}
