import type { DocumentFrontmatter } from "@/api/fileAPI";
import { DataGrid } from "@/components/atlas";
import { formatEpoch, formatMagnitude, formatSize } from "@/lib/atlas";
import { asTags, asText, formatFrontmatterDate } from "@/utils/frontmatter";

interface TitleBlockProps {
    title: string;
    folder: string;
    type: "md" | "mdx";
    size: number;
    modified: Date | null;
    frontmatter: DocumentFrontmatter;
}

/**
 * What a chart plate carries in its corner: where it sits, what it is called,
 * who cut it and when. Filled from the document's own frontmatter, which used
 * to be printed into the prose as a paragraph of YAML.
 */
export function TitleBlock({ title, folder, type, size, modified, frontmatter }: TitleBlockProps) {
    const description = asText(frontmatter.description);
    const author = asText(frontmatter.author);
    const rawDate = asText(frontmatter.date);
    const tags = asTags(frontmatter.tags);

    return (
        <header className="border-rule mt-4 border-b pb-6">
            <p className="text-mark-read figures text-[0.625rem] font-semibold tracking-[0.16em] uppercase">
                {folder || "root"} · {type.toUpperCase()}
            </p>
            <h1 className="text-ink mt-2 max-w-[22ch] font-serif text-[2.125rem] leading-[1.06] font-semibold tracking-tight text-balance sm:text-[2.5rem]">
                {title}
            </h1>
            {description ? (
                <p className="text-ink-dim mt-3 max-w-[58ch] text-[1.0625rem] leading-relaxed">{description}</p>
            ) : null}

            <DataGrid
                className="mt-6 max-w-lg"
                readings={[
                    { label: "Author", value: author ?? "—" },
                    { label: "Dated", value: rawDate ? formatFrontmatterDate(rawDate) : formatEpoch(modified) },
                    { label: "Size", value: formatSize(size) },
                    { label: "Mag", value: formatMagnitude(size) },
                ]}
            />

            {tags.length > 0 ? (
                <ul className="mt-5 flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                        <li
                            key={tag}
                            className="border-rule text-ink-dim rounded-plate border px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.1em] uppercase"
                        >
                            {tag}
                        </li>
                    ))}
                </ul>
            ) : null}
        </header>
    );
}
