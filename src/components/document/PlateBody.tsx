import { lazy, Suspense } from "react";

import { NotExecutedNotice } from "@/components/document/NotExecutedNotice";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { useServiceHealth } from "@/hooks/api/useFiles";

// Nothing about compiling MDX is fetched unless a document is actually going to
// be compiled: the compiler is heavier than the reader that stands in for it.
const MdxDocument = lazy(() =>
    import("@/components/markdown/MdxDocument").then(module => ({ default: module.MdxDocument }))
);

interface PlateBodyProps {
    /** The document body as it is on disk, frontmatter already split off. */
    content: string;
    /** The same body with its program text removed, for reading rather than running. */
    prose: string;
    type: "md" | "mdx";
    /** True when the file contains imports, exports or component markup. */
    hasProgram: boolean;
}

/**
 * A document's body, read or run.
 *
 * `.mdx` is compiled only where the operator has said the content folder is
 * trusted (`MDX_EXECUTE=true`, reported by `/api/health`). Everywhere else — and
 * that is the default — the same file is rendered as Markdown with its program
 * text removed, and says so.
 */
export function PlateBody({ content, prose, type, hasProgram }: PlateBodyProps) {
    const { data: health } = useServiceHealth();

    const reading = (
        <div className="plate-prose mt-8">
            <MarkdownRenderer content={prose} type={type} />
        </div>
    );

    if (type !== "mdx" || !health?.mdxExecute) {
        return (
            <>
                {hasProgram ? <NotExecutedNotice /> : null}
                {reading}
            </>
        );
    }

    return (
        <div className="plate-prose mt-8">
            <Suspense fallback={reading}>
                <MdxDocument source={content} fallback={reading} />
            </Suspense>
        </div>
    );
}
