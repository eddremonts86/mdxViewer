import { useState } from "react";
import { useParams } from "react-router-dom";

import type { DocumentFrontmatter } from "@/api/fileAPI";
import { PlateLabel } from "@/components/atlas";
import { TableOfContents } from "@/components/content/TableOfContents";
import {
    DocumentError,
    DocumentLoader,
    DocumentWelcome,
    NotExecutedNotice,
    PlateActions,
    PlateEditor,
    TitleBlock,
} from "@/components/document";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { useFileContent } from "@/hooks/api/useFiles";
import { asText } from "@/utils/frontmatter";
import { readMdxSource } from "@/utils/mdxSource";

function humanise(filename: string): string {
    return filename
        .replace(/\.(md|mdx)$/i, "")
        .replace(/[-_]+/g, " ")
        .trim()
        .replace(/\b\w/g, character => character.toUpperCase());
}

/**
 * A document whose frontmatter names it usually opens with the same heading.
 * The title block already prints it, so the duplicate is dropped from the prose
 * rather than shown twice.
 */
function stripLeadingTitle(content: string, title: string): string {
    const match = /^\s*#\s+(.+?)\s*$/m.exec(content);
    if (!match || content.slice(0, match.index).trim() !== "") return content;

    const normalise = (text: string) =>
        text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim();
    if (normalise(match[1]) !== normalise(title)) return content;

    return content.slice(match.index + match[0].length).replace(/^\s*\n/, "");
}

interface PlateReading {
    folder: string;
    type: "md" | "mdx";
    title: string;
    prose: string;
    hasProgram: boolean;
}

/** Everything the plate needs, derived from the path and the file's own content. */
function readPlate(filePath: string, content: string, frontmatter: DocumentFrontmatter): PlateReading {
    const segments = filePath.split("/");
    const type = filePath.endsWith(".mdx") ? "mdx" : "md";
    const title = asText(frontmatter.title) ?? humanise(segments[segments.length - 1]);

    // MDX is not compiled here, so its program text is not prose. Remove it and
    // say so, rather than printing `import` lines as body copy.
    const source = type === "mdx" ? readMdxSource(content) : { prose: content, hasProgram: false };

    return {
        folder: segments.slice(0, -1).join("/"),
        type,
        title,
        prose: stripLeadingTitle(source.prose, title),
        hasProgram: source.hasProgram,
    };
}

/**
 * The catch-all route hands back the path with its own prefix still attached on
 * some entries, so it is stripped in one place rather than at each use.
 */
function documentPathFromSlug(slug: string | undefined): string {
    const path = slug ?? "";
    return path.startsWith("document/") ? path.slice("document/".length) : path;
}

function asDate(stamp: string | undefined): Date | null {
    return stamp ? new Date(stamp) : null;
}

export function DocumentPage() {
    const { "*": slug } = useParams();
    const filePath = documentPathFromSlug(slug);

    const { data, isLoading, error } = useFileContent(filePath, Boolean(filePath));
    const [editing, setEditing] = useState(false);

    if (!filePath) return <DocumentWelcome />;
    if (isLoading) return <DocumentLoader message="Exposing the plate…" />;
    if (error || !data) return <DocumentError message={error?.message} />;

    const { content, raw, frontmatter = {}, size = 0, lastModified } = data;
    const { folder, type, title, prose, hasProgram } = readPlate(filePath, content, frontmatter);

    // The table of contents of a document you are rewriting is noise, so the
    // editor takes the whole field.
    if (editing && raw !== undefined) {
        return (
            <PlateEditor
                filePath={filePath}
                source={raw}
                stamp={lastModified}
                type={type}
                onClose={() => setEditing(false)}
            />
        );
    }

    return (
        <article className="flex flex-col xl:flex-row">
            <div className="min-w-0 flex-1 px-5 py-6 sm:px-8">
                <PlateActions onEdit={raw === undefined ? undefined : () => setEditing(true)} />

                <TitleBlock
                    title={title}
                    folder={folder}
                    type={type}
                    size={size}
                    modified={asDate(lastModified)}
                    frontmatter={frontmatter}
                />

                {hasProgram ? <NotExecutedNotice /> : null}

                <div className="plate-prose mt-8">
                    <MarkdownRenderer content={prose} type={type} />
                </div>
            </div>

            <aside className="border-rule shrink-0 border-t px-5 py-6 sm:px-8 xl:sticky xl:top-0 xl:max-h-screen xl:w-[16rem] xl:self-start xl:overflow-y-auto xl:border-t-0 xl:border-l xl:px-5">
                <TableOfContents content={prose} />
                <div className="mt-8 space-y-3">
                    <PlateLabel>Located</PlateLabel>
                    <p className="text-ink-dim text-[0.75rem] leading-relaxed break-words">{filePath}</p>
                </div>
            </aside>
        </article>
    );
}
