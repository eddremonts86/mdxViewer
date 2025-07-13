import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import { CODE_SETTINGS, FONT_FAMILIES, MARKDOWN_CLASSES, TYPOGRAPHY } from "@/const/markdown";
import type { CodeProps, EffectiveTheme, HeadingProps } from "@/types/markdown";
import {
    createCodeStyle,
    createHeadingStyle,
    extractLanguageFromClassName,
    generateHeadingId,
    isInlineCode,
} from "@/utils/markdownUtils";

// Heading component factory
export const createHeading =
    (
        level: 1 | 2 | 3 | 4 | 5 | 6,
        className: string,
        weight: string,
        spacing: string,
    ): React.ComponentType<HeadingProps> =>
        ({ children, ...props }: HeadingProps) => {
            const id = generateHeadingId(children);
            const Tag = `h${level}` as const;
            const style = createHeadingStyle(weight, spacing, FONT_FAMILIES.sans);

            return (
                <Tag {...props} id={id} className={className} style={style}>
                    {children}
                </Tag>
            );
        };

// Code component factory
export const createCodeComponent =
    (effectiveTheme: EffectiveTheme) =>
        ({ className, children, ...props }: CodeProps) => {
            const language = extractLanguageFromClassName(className);
            const inline = isInlineCode(className);

            return !inline && language ? (
                <div className="group my-6">
                    <SyntaxHighlighter
                        style={effectiveTheme === "dark" ? oneDark : oneLight}
                        language={language}
                        PreTag="div"
                        className={MARKDOWN_CLASSES.codeBlock}
                        customStyle={createCodeStyle({
                            fontFamily: FONT_FAMILIES.mono,
                            fontSize: CODE_SETTINGS.fontSize,
                            lineHeight: CODE_SETTINGS.lineHeight,
                            fontWeight: TYPOGRAPHY.fontWeights.normal,
                            fontFeatures: CODE_SETTINGS.fontFeatures,
                            backgroundColor: effectiveTheme === "dark" ? "var(--card)" : "var(--muted)",
                            borderRadius: CODE_SETTINGS.borderRadius,
                            padding: CODE_SETTINGS.padding,
                        })}
                        codeTagProps={{
                            style: {
                                fontFamily: FONT_FAMILIES.mono,
                                fontWeight: TYPOGRAPHY.fontWeights.normal,
                                fontSize: CODE_SETTINGS.fontSize,
                                lineHeight: CODE_SETTINGS.lineHeight,
                            },
                        }}
                    >
                        {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code {...props} className={`${className ?? ""} ${MARKDOWN_CLASSES.inlineCode}`}>
                    {children}
                </code>
            );
        };
