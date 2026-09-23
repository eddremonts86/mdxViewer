import { Children, cloneElement, isValidElement } from "react";

import { Callout, type CalloutKind, isCalloutKind } from "@/components/markdown/Callout";
import { CodeBlock } from "@/components/markdown/CodeBlock";
import { MermaidDiagram } from "@/components/markdown/MermaidDiagram";
import type { EffectiveTheme } from "@/types/markdown";
import {
    extractLanguageFromClassName,
    generateHeadingId,
    getLinkAttributes,
    handleAnchorClick,
    isInlineCode,
} from "@/utils/markdownUtils";

/**
 * The only markdown nodes that need a component. Everything else is plain HTML
 * styled by `.plate-prose`, because a stylesheet is a better place for
 * typography than three hundred inline style objects.
 */

const heading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    const Tag = `h${level}` as const;
    const Heading = ({ children, ...props }: React.ComponentProps<"h1">) => (
        <Tag {...props} id={generateHeadingId(children)}>
            {children}
        </Tag>
    );
    Heading.displayName = `Heading${level}`;
    return Heading;
};

export const H1 = heading(1);
export const H2 = heading(2);
export const H3 = heading(3);
export const H4 = heading(4);
export const H5 = heading(5);
export const H6 = heading(6);

export const Link = ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a {...props} {...getLinkAttributes(href)} href={href} onClick={event => handleAnchorClick(event, href)}>
        {children}
    </a>
);

export const Image = ({ src, alt, ...props }: React.ComponentProps<"img">) => (
    <img {...props} src={src} alt={alt ?? ""} loading="lazy" />
);

/** Code blocks get the highlighter; inline code is styled by CSS. */
export const createCodeComponent =
    (effectiveTheme: EffectiveTheme) =>
    ({ className, children, ...props }: React.ComponentProps<"code">) => {
        const language = extractLanguageFromClassName(className);

        if (isInlineCode(className) || !language) {
            return (
                <code {...props} className={className}>
                    {children}
                </code>
            );
        }

        const code = String(children).replace(/\n$/, "");

        // A mermaid fence is a diagram, not a listing.
        if (language.toLowerCase() === "mermaid") {
            return <MermaidDiagram code={code} theme={effectiveTheme} />;
        }

        return <CodeBlock code={code} language={language} theme={effectiveTheme} />;
    };

/**
 * A blockquote that opens with `[!NOTE]` is a callout, not a quotation.
 *
 * The marker arrives as the first text node inside the first paragraph, so it is
 * read and removed there rather than with another remark plugin — the pipeline
 * already carries five.
 */
export const Blockquote = ({ children, ...props }: React.ComponentProps<"blockquote">) => {
    const nodes = Children.toArray(children);
    const first = nodes.find(node => isValidElement(node));

    const marker = calloutMarker(first);
    if (!marker) {
        return <blockquote {...props}>{children}</blockquote>;
    }

    return <Callout kind={marker.kind}>{nodes.map(node => (node === first ? marker.rest : node))}</Callout>;
};

/** Reads `[!NOTE]` off the front of a paragraph, and gives back what is left of it. */
function calloutMarker(node: unknown): { kind: CalloutKind; rest: React.ReactNode } | null {
    if (!isValidElement<{ children?: React.ReactNode }>(node)) return null;

    const parts = Children.toArray(node.props.children);
    const [head] = parts;
    if (typeof head !== "string") return null;

    const match = /^\[!([A-Za-z]+)\]\s*\n?/.exec(head);
    if (!match || !isCalloutKind(match[1])) return null;

    const remainder = head.slice(match[0].length);
    const rest = [remainder, ...parts.slice(1)].filter(part => part !== "");

    return {
        kind: match[1].toLowerCase() as CalloutKind,
        rest: cloneElement(node, { children: rest }),
    };
}
