import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

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

        return (
            <SyntaxHighlighter
                style={effectiveTheme === "dark" ? oneDark : oneLight}
                language={language}
                PreTag="div"
                customStyle={{
                    margin: 0,
                    padding: "1rem 1.1rem",
                    background: "var(--panel)",
                    border: "1px solid var(--rule)",
                    borderRadius: "var(--radius-panel)",
                    fontSize: "0.8125rem",
                    lineHeight: 1.62,
                }}
                codeTagProps={{ style: { fontFamily: "var(--font-code)" } }}
            >
                {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
        );
    };
