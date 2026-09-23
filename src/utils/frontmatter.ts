/**
 * Frontmatter arrives as parsed YAML, so a field can hold anything. These
 * readers narrow a value to something the title block can print, or to null.
 */

export function asText(value: unknown): string | null {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (value instanceof Date) return value.toISOString().slice(0, 10).replace(/-/g, ".");
    if (typeof value === "number") return String(value);
    return null;
}

export function asTags(value: unknown): string[] {
    if (Array.isArray(value)) return value.filter((tag): tag is string => typeof tag === "string");
    return [];
}

/** ISO-ish dates from frontmatter are shown in the product's own figure style. */
export function formatFrontmatterDate(value: string): string {
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    return iso ? `${iso[1]}.${iso[2]}.${iso[3]}` : value;
}

/**
 * Remove a leading frontmatter block from raw file text.
 *
 * The editor works on whole files, so its live preview has to drop the YAML the
 * way the server's parser does. This only finds the block's end and slices —
 * parsing the YAML client-side would mean shipping a second parser to disagree
 * with the first one.
 */
export function splitFrontmatter(raw: string): { frontmatter: string | null; body: string } {
    if (!raw.startsWith("---")) return { frontmatter: null, body: raw };

    const afterOpen = raw.indexOf("\n");
    if (afterOpen === -1) return { frontmatter: null, body: raw };

    const close = raw.indexOf("\n---", afterOpen);
    if (close === -1) return { frontmatter: null, body: raw };

    const endOfLine = raw.indexOf("\n", close + 1);
    return {
        frontmatter: raw.slice(0, endOfLine === -1 ? raw.length : endOfLine),
        body: endOfLine === -1 ? "" : raw.slice(endOfLine + 1).replace(/^\n/, ""),
    };
}
