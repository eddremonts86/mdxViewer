import { useMemo } from "react";
import ReactMarkdown from "react-markdown";

import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { createCodeComponent, H1, H2, H3, H4, H5, H6, Image, Link } from "@/components/markdown/MarkdownComponents";
import { useEffectiveTheme } from "@/hooks/useMarkdownTheme";
import type { MarkdownRendererProps } from "@/types/markdownIndex";

// Import KaTeX CSS for math rendering
import "katex/dist/katex.min.css";

/**
 * Raw HTML in a document is allowed, then filtered. Documents arrive through the
 * upload endpoint, so unsanitised `rehypeRaw` output would let any uploaded file
 * run script in a reader's session. KaTeX needs its own tags and class/style
 * attributes to survive the filter, so they are allowed back explicitly.
 */
const schema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "style"],
        math: ["xmlns", "display"],
        svg: ["xmlns", "width", "height", "viewBox", "preserveAspectRatio", "style"],
        path: ["d"],
    },
    tagNames: [
        ...(defaultSchema.tagNames ?? []),
        "math",
        "semantics",
        "mrow",
        "mi",
        "mo",
        "mn",
        "msup",
        "msub",
        "mfrac",
        "msqrt",
        "annotation",
        "svg",
        "path",
    ],
};

const remarkPlugins = [remarkGfm, remarkMath];

/**
 * MDX and Markdown render through the same pipeline today: `.mdx` files are not
 * compiled, so their JSX would not execute. The distinction is recorded in
 * PRODUCT.md as a commitment, not shipped as a feature — which is why this
 * component does not branch on the document's type.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const effectiveTheme = useEffectiveTheme();

    const components = useMemo(
        () => ({
            h1: H1,
            h2: H2,
            h3: H3,
            h4: H4,
            h5: H5,
            h6: H6,
            a: Link,
            img: Image,
            code: createCodeComponent(effectiveTheme),
        }),
        [effectiveTheme]
    );

    return (
        <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeKatex]}
            components={components}
        >
            {content}
        </ReactMarkdown>
    );
}
