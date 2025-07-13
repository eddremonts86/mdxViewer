/**
 * Utility functions for handling headings and generating consistent IDs
 */

/**
 * Generates a consistent heading ID that works across MarkdownRenderer and TableOfContents
 * @param text - The heading text to convert to an ID
 * @returns A URL-safe ID string
 */
export const generateHeadingId = (text: string): string =>
    text
        .toLowerCase()
        .normalize("NFD") // Normalize Unicode characters (separate base chars from accents)
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics/accents
        .replace(/[^\w\s\-áéíóúüñ]/g, "") // Keep word chars, spaces, hyphens, and Spanish chars
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/(^-+)|(-+$)/g, "") // Remove leading/trailing hyphens
        .trim();

/**
 * Extracts text content from React nodes for ID generation
 * @param children - React node children
 * @returns Extracted text string
 */
export const extractTextFromReactNode = (children: React.ReactNode): string => {
    if (typeof children === "string") {
        return children;
    }

    if (Array.isArray(children)) {
        return children
            .map(child => (typeof child === "string" ? child : ""))
            .join("")
            .trim();
    }

    // Handle React elements and other node types
    const extractText = (node: React.ReactNode): string => {
        if (typeof node === "string") return node;
        if (typeof node === "number") return node.toString();
        if (Array.isArray(node)) return node.map(extractText).join("");
        if (node && typeof node === "object" && "props" in node) {
            const element = node as { props: { children?: React.ReactNode } };
            return extractText(element.props.children);
        }
        return "";
    };

    return extractText(children).trim();
};

/**
 * Smooth scroll to element with offset for fixed headers
 * @param elementId - The ID of the element to scroll to
 * @param headerOffset - Offset in pixels to account for fixed headers
 */
export const scrollToHeading = (elementId: string, headerOffset = 80): void => {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
        });

        // Update URL hash without triggering page reload
        window.history.pushState(null, "", `#${elementId}`);
    }
};

/**
 * Parse markdown content to extract headings
 * @param content - Markdown content string
 * @returns Array of heading objects with level, title, and id
 */
export const parseHeadings = (content: string): Array<{ level: number; title: string; id: string }> => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: Array<{ level: number; title: string; id: string }> = [];

    let match;
    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const title = match[2].trim();
        const id = generateHeadingId(title);

        headings.push({ level, title, id });
    }

    return headings;
};
