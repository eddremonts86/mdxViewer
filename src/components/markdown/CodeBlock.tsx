import { useEffect, useState } from "react";

import { grammarFor, highlighterFor, THEME_PLATE, THEME_SKY } from "@/lib/highlighter";
import type { EffectiveTheme } from "@/types/markdown";

interface CodeBlockProps {
    code: string;
    language: string;
    theme: EffectiveTheme;
}

/**
 * A fenced block, highlighted by Shiki against the product's own two themes.
 *
 * The plain text is rendered first and replaced when the grammar arrives, so a
 * reader never waits on a highlighter to read code, and a language nobody
 * shipped a grammar for simply stays plain instead of failing.
 */
export function CodeBlock({ code, language, theme }: CodeBlockProps) {
    const [html, setHtml] = useState<string | null>(null);
    const grammar = grammarFor(language);

    useEffect(() => {
        if (!grammar) return;

        let live = true;
        highlighterFor(grammar)
            .then(shiki =>
                shiki.codeToHtml(code, {
                    lang: grammar,
                    theme: theme === "dark" ? THEME_SKY : THEME_PLATE,
                })
            )
            .then(rendered => {
                if (live) setHtml(rendered);
            })
            .catch(() => {
                // Plain code is a fine outcome; a missing grammar is not an error
                // worth putting in front of someone reading documentation.
                if (live) setHtml(null);
            });

        return () => {
            live = false;
        };
    }, [code, grammar, theme]);

    if (html) {
        return (
            <div
                className="plate-code"
                data-language={language}
                // Shiki's own output: spans carrying inline colours from the two
                // themes above. It never sees the document's text as markup.
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }

    return (
        <div className="plate-code" data-language={language}>
            <pre>
                <code>{code}</code>
            </pre>
        </div>
    );
}
