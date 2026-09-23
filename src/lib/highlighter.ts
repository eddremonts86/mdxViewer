import type { HighlighterCore, ThemeRegistrationRaw } from "shiki/core";

/**
 * Syntax highlighting, engraved rather than borrowed.
 *
 * The code block used `react-syntax-highlighter` with Atom's oneDark and
 * oneLight — two complete palettes of purples, greens and cyans dropped into a
 * system whose whole rule is one signal hue and two renditions of it. Shiki was
 * already a dependency and unused, so this replaces the highlighter rather than
 * adding one.
 *
 * These two themes are built from the product's own tokens, and they spend no
 * accent at all. DESIGN.md's Red Flashlight Rule says amber marks where the
 * observer is and what they are about to change — document content never. A
 * string literal in a code sample is content, so code is separated the way an
 * engraved book separates it: three tones, one weight and one italic.
 */

/** The five tones a rendition spends on code. */
interface Inks {
    /** Body tone: identifiers, functions, keywords. */
    ink: string;
    /** Secondary tone: literals and parameters, which recede as data. */
    dim: string;
    /** Hairline tone: comments and punctuation. */
    rule: string;
    panel: string;
}

const sky: Inks = {
    ink: "#f2f2e9",
    dim: "#8592a8",
    rule: "#5a6477",
    panel: "#16233d",
};

const plate: Inks = {
    ink: "#0a1021",
    dim: "#5a6477",
    rule: "#a8a898",
    panel: "#eaeadf",
};

const themeFor = (name: string, type: "dark" | "light", ink: Inks): ThemeRegistrationRaw => ({
    name,
    type,
    colors: { "editor.background": ink.panel, "editor.foreground": ink.ink },
    settings: [
        { settings: { foreground: ink.ink } },
        {
            scope: ["comment", "punctuation.definition.comment"],
            settings: { foreground: ink.rule, fontStyle: "italic" },
        },
        { scope: ["punctuation", "meta.brace", "punctuation.separator"], settings: { foreground: ink.rule } },
        {
            scope: ["keyword", "storage", "storage.type", "keyword.control", "keyword.operator"],
            settings: { foreground: ink.ink, fontStyle: "bold" },
        },
        {
            scope: ["string", "string.quoted", "constant.other.symbol", "meta.embedded.line"],
            settings: { foreground: ink.dim },
        },
        {
            scope: ["constant.numeric", "constant.language", "constant.character"],
            settings: { foreground: ink.dim },
        },
        {
            scope: ["entity.name.function", "support.function", "meta.function-call"],
            settings: { foreground: ink.ink },
        },
        {
            scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
            settings: { foreground: ink.ink, fontStyle: "italic" },
        },
        { scope: ["variable", "variable.other", "meta.definition.variable"], settings: { foreground: ink.ink } },
        { scope: ["variable.parameter", "variable.other.property"], settings: { foreground: ink.dim } },
        { scope: ["entity.name.tag", "support.type.property-name"], settings: { foreground: ink.ink } },
        { scope: ["entity.other.attribute-name"], settings: { foreground: ink.dim, fontStyle: "italic" } },
        { scope: ["markup.heading"], settings: { foreground: ink.ink, fontStyle: "bold" } },
        { scope: ["invalid"], settings: { foreground: ink.ink, fontStyle: "italic" } },
    ],
});

export const THEME_SKY = "atlas-sky";
export const THEME_PLATE = "atlas-plate";

/**
 * The languages the seeded documentation actually uses, counted from the
 * content folder. Loading Shiki's full bundle would ship every grammar it has
 * for the sake of nineteen.
 */
const LANGUAGE_LOADERS = {
    bash: () => import("@shikijs/langs/bash"),
    css: () => import("@shikijs/langs/css"),
    html: () => import("@shikijs/langs/html"),
    javascript: () => import("@shikijs/langs/javascript"),
    json: () => import("@shikijs/langs/json"),
    jsonc: () => import("@shikijs/langs/jsonc"),
    markdown: () => import("@shikijs/langs/markdown"),
    mdx: () => import("@shikijs/langs/mdx"),
    python: () => import("@shikijs/langs/python"),
    sql: () => import("@shikijs/langs/sql"),
    toml: () => import("@shikijs/langs/toml"),
    tsx: () => import("@shikijs/langs/tsx"),
    typescript: () => import("@shikijs/langs/typescript"),
    yaml: () => import("@shikijs/langs/yaml"),
} as const;

/** What a fence may be labelled, and which grammar answers for it. */
const ALIASES: Record<string, Grammar> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    yml: "yaml",
    md: "markdown",
    py: "python",
};

export type Grammar = keyof typeof LANGUAGE_LOADERS;

export function grammarFor(language: string): Grammar | null {
    const name = language.toLowerCase();
    if (name in LANGUAGE_LOADERS) return name as Grammar;
    return ALIASES[name] ?? null;
}

let core: Promise<HighlighterCore> | null = null;
const grammars = new Map<string, Promise<void>>();

/**
 * The highlighter, with just the one grammar this block needs.
 *
 * Created on the first code block and never in the initial payload. Grammars are
 * loaded one at a time rather than all at once: TypeScript, TSX and JavaScript
 * alone are half a megabyte, and a document with a single `bash` fence has no
 * business fetching them.
 */
export async function highlighterFor(grammar: Grammar): Promise<HighlighterCore> {
    core ??= (async () => {
        const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
            import("shiki/core"),
            import("shiki/engine/javascript"),
        ]);

        return createHighlighterCore({
            themes: [themeFor(THEME_SKY, "dark", sky), themeFor(THEME_PLATE, "light", plate)],
            langs: [],
            // The JavaScript engine keeps the WebAssembly grammar runtime out of
            // the bundle; these grammars do not need Oniguruma's edge cases.
            engine: createJavaScriptRegexEngine(),
        });
    })();

    const shiki = await core;

    // Keyed by grammar so two blocks in the same language wait on one load
    // rather than racing to register the same one.
    let loading = grammars.get(grammar);
    if (!loading) {
        loading = LANGUAGE_LOADERS[grammar]().then(module => shiki.loadLanguage(module.default));
        grammars.set(grammar, loading);
    }
    await loading;

    return shiki;
}
