import type { EffectiveTheme, ThemeType } from "@/types/markdown";
import { extractTextFromReactNode as extractText, generateHeadingId as createHeadingId } from "@/utils/headingUtils";

/** Height of the fixed header band, so an anchor never lands under it. */
const HEADER_OFFSET = 84;

/**
 * Heading ids come from one generator, shared with the table of contents, so
 * every anchor in a document resolves to the heading it names.
 */
export const generateHeadingId = (children: React.ReactNode): string => createHeadingId(extractText(children));

/** Which rendition the syntax highlighter should use. */
export const getEffectiveTheme = (theme: ThemeType): EffectiveTheme => {
    if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
};

/** In-document anchors scroll the plate, not the window. */
export const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, href?: string): void => {
    if (!href?.startsWith("#")) return;

    const element = document.getElementById(href.slice(1));
    if (!element) return;

    event.preventDefault();
    const container = element.closest("main") ?? document.documentElement;
    const top = element.getBoundingClientRect().top + container.scrollTop - HEADER_OFFSET;
    container.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", href);
};

export const isExternalLink = (href?: string): boolean => href?.startsWith("http") ?? false;

export const getLinkAttributes = (href?: string) => {
    const isExternal = isExternalLink(href);
    return {
        target: isExternal ? "_blank" : undefined,
        rel: isExternal ? "noopener noreferrer" : undefined,
    };
};

export const extractLanguageFromClassName = (className?: string): string | null => {
    const match = /language-(\w+)/.exec(className ?? "");
    return match ? match[1] : null;
};

export const isInlineCode = (className?: string): boolean => !className?.includes("language-");
