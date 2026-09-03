import { Link, useParams } from "react-router-dom";

import { ArrowLeft, Printer } from "lucide-react";

import type { DocumentFrontmatter } from "@/api/fileAPI";
import { PlateLabel } from "@/components/atlas";
import { TableOfContents } from "@/components/content/TableOfContents";
import { DocumentError, DocumentLoader, DocumentWelcome, TitleBlock } from "@/components/document";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Button } from "@/components/ui/button";
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

export function DocumentPage() {
    const { "*": slug } = useParams();
    const filePath = slug?.startsWith("document/") ? slug.slice("document/".length) : slug;

    const { data, isLoading, error } = useFileContent(filePath ?? "", Boolean(filePath));

    if (!filePath) return <DocumentWelcome />;
    if (isLoading) return <DocumentLoader message="Exposing the plate…" />;
    if (error || !data) return <DocumentError message={error?.message} />;

    const { content, frontmatter = {}, size = 0, lastModified } = data;
    const { folder, type, title, prose, hasProgram } = readPlate(filePath, content, frontmatter);

    return (
        <article className="flex flex-col xl:flex-row">
            <div className="min-w-0 flex-1 px-5 py-6 sm:px-8">
                <div className="print-hide flex items-center justify-between gap-3">
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                        <Link to="/">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Chart
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="h-3.5 w-3.5" />
                        Print
                    </Button>
                </div>

                <TitleBlock
                    title={title}
                    folder={folder}
                    type={type}
                    size={size}
                    modified={lastModified ? new Date(lastModified) : null}
                    frontmatter={frontmatter}
                />

                {hasProgram ? (
                    <p className="border-mark bg-mark-soft/60 text-ink mt-6 border-l px-4 py-3 text-[0.8125rem] leading-relaxed">
                        <span className="text-mark-read mr-2 text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
                            Not executed
                        </span>
                        This document defines React components. They are not compiled or run — the reader shows its
                        Markdown only, and the component source has been left out rather than printed as prose.
                    </p>
                ) : null}

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
