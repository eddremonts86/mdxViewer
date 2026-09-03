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
