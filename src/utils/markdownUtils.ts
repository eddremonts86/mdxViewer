import React from "react";

import { SCROLL_SETTINGS } from "@/const/markdown";
import type { EffectiveTheme, ThemeType } from "@/types/markdown";
import { extractTextFromReactNode as extractText, generateHeadingId as createHeadingId } from "@/utils/headingUtils";

/**
 * Helper function to generate heading IDs using our utility
 */
export const generateHeadingId = (children: React.ReactNode): string => {
    const text = extractText(children);
    return createHeadingId(text);
};

/**
 * Determines the effective theme based on the current theme setting
 */
export const getEffectiveTheme = (theme: ThemeType): EffectiveTheme => {
    if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
};

/**
 * Handles smooth scrolling to anchor links with header offset
 */
export const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href?: string): void => {
    // Handle internal anchor links
    if (href?.startsWith("#")) {
        e.preventDefault();
        const targetId = href.slice(1);
        const element = document.getElementById(targetId);
        if (element) {
            // Use better scroll with header offset
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - SCROLL_SETTINGS.headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: SCROLL_SETTINGS.behavior,
            });

            // Update URL hash without triggering a page reload
            window.history.pushState(null, "", href);
        }
    }
};

/**
 * Determines if a link should open in a new tab
 */
export const isExternalLink = (href?: string): boolean => href?.startsWith("http") ?? false;

/**
 * Gets the appropriate target and rel attributes for links
 */
export const getLinkAttributes = (href?: string) => {
    const isExternal = isExternalLink(href);
    return {
        target: isExternal ? "_blank" : undefined,
        rel: isExternal ? "noopener noreferrer" : undefined,
    };
};

/**
 * Extracts language from code block className
 */
export const extractLanguageFromClassName = (className?: string): string | null => {
    const match = /language-(\w+)/.exec(className ?? "");
    return match ? match[1] : null;
};

/**
 * Determines if code should be rendered inline
 */
export const isInlineCode = (className?: string): boolean => !className?.includes("language-");

/**
 * Creates custom style objects for different markdown elements
 */
export const createHeadingStyle = (fontWeight: string, letterSpacing: string, fontFamily: string) => ({
    fontFamily,
    letterSpacing,
    fontWeight,
});

export const createTextStyle = (fontFamily: string, lineHeight?: string, letterSpacing?: string) => ({
    fontFamily,
    ...(lineHeight && { lineHeight }),
    ...(letterSpacing && { letterSpacing }),
});

export const createCodeStyle = ({
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
    fontFeatures,
    backgroundColor,
    borderRadius,
    padding,
}: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    fontWeight: string;
    fontFeatures: string;
    backgroundColor?: string;
    borderRadius?: string;
    padding?: string;
}) => ({
    fontFamily,
    fontWeight,
    fontSize,
    lineHeight,
    fontFeatureSettings: fontFeatures,
    ...(backgroundColor && { background: backgroundColor }),
    ...(borderRadius && { borderRadius }),
    ...(padding && { padding }),
    margin: 0,
});
