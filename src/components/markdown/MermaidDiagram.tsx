import { useEffect, useId, useState } from "react";

import type { EffectiveTheme } from "@/types/markdown";

/**
 * A ```mermaid fence, drawn.
 *
 * Mermaid is by far the heaviest thing this app can load, so it is imported the
 * first time a document actually contains a diagram and never otherwise: a
 * document without one pays nothing.
 *
 * Its default palette is lavender on cream. That is another visual world, so the
 * theme is overridden with this product's own tokens — the diagram is drawn in
 * the same inks as the chart it sits beside.
 */

/** Read live so a diagram is drawn in the rendition actually on screen. */
const token = (name: string): string => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

interface MermaidDiagramProps {
    code: string;
    theme: EffectiveTheme;
}

export function MermaidDiagram({ code, theme }: MermaidDiagramProps) {
    const [svg, setSvg] = useState<string | null>(null);
    const [failure, setFailure] = useState<string | null>(null);
    const reactId = useId();
    const id = `mermaid${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;

    useEffect(() => {
        let live = true;

        const draw = async () => {
            const { default: mermaid } = await import("mermaid");

            const ink = token("--ink");
            const dim = token("--ink-dim");
            const rule = token("--rule-bright");
            const panel = token("--panel");
            const plate = token("--plate");

            mermaid.initialize({
                startOnLoad: false,
                securityLevel: "strict",
                fontFamily: token("--font-ui") || "sans-serif",
                theme: "base",
                themeVariables: {
                    darkMode: theme === "dark",
                    background: "transparent",
                    primaryColor: panel,
                    primaryBorderColor: rule,
                    primaryTextColor: ink,
                    secondaryColor: plate,
                    secondaryBorderColor: rule,
                    secondaryTextColor: ink,
                    tertiaryColor: panel,
                    tertiaryBorderColor: rule,
                    tertiaryTextColor: ink,
                    lineColor: rule,
                    textColor: ink,
                    mainBkg: panel,
                    nodeBorder: rule,
                    clusterBkg: "transparent",
                    clusterBorder: rule,
                    titleColor: ink,
                    edgeLabelBackground: panel,
                    labelBoxBorderColor: rule,
                    noteBkgColor: plate,
                    noteBorderColor: rule,
                    noteTextColor: dim,
                },
            });

            const { svg: rendered } = await mermaid.render(id, code);
            if (live) {
                setSvg(rendered);
                setFailure(null);
            }
        };

        draw().catch((error: unknown) => {
            // A diagram that will not parse is the author's to fix, so it says so
            // and keeps the source readable rather than rendering nothing.
            if (live) setFailure(error instanceof Error ? error.message : "This diagram could not be drawn");
        });

        return () => {
            live = false;
        };
    }, [code, id, theme]);

    if (failure) {
        return (
            <div className="plate-code" data-language="mermaid">
                <p className="border-mark text-ink-dim border-b px-4 py-2 text-[0.75rem] leading-relaxed">{failure}</p>
                <pre>
                    <code>{code}</code>
                </pre>
            </div>
        );
    }

    if (!svg) {
        return (
            <div className="plate-code" data-language="mermaid">
                <pre>
                    <code>{code}</code>
                </pre>
            </div>
        );
    }

    return (
        <figure
            className="plate-diagram border-rule bg-panel/40 overflow-x-auto rounded-[3px] border px-4 py-5"
            // Mermaid's own SVG, built from the fence's text by its parser.
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
