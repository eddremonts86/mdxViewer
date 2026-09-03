import { useCallback, useEffect, useMemo, useState } from "react";

import { Check, RotateCcw, X } from "lucide-react";

import { PlateLabel } from "@/components/atlas";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { useSaveFile } from "@/hooks/api/useFiles";
import { formatSize } from "@/lib/atlas";
import { splitFrontmatter } from "@/utils/frontmatter";

interface PlateEditorProps {
    filePath: string;
    /** The file exactly as it sits on disk, frontmatter included. */
    source: string;
    /** The mtime this text was loaded at; the service refuses a stale save. */
    stamp?: string;
    type: "md" | "mdx";
    onClose: () => void;
}

/**
 * The plate, open for correction.
 *
 * Editing raw file text rather than parsed fields is deliberate: the folder is the
 * source of truth, and rebuilding a file from a parsed frontmatter object would
 * reorder keys and reflow YAML the author never touched.
 */
export function PlateEditor({ filePath, source, stamp, type, onClose }: PlateEditorProps) {
    const [draft, setDraft] = useState(source);
    const [saved, setSaved] = useState(source);
    const [currentStamp, setCurrentStamp] = useState(stamp);
    const [conflict, setConflict] = useState<string | null>(null);

    const save = useSaveFile();
    const dirty = draft !== saved;

    // `body` is what the reader would see; the preview shows that, not the YAML.
    const body = useMemo(() => splitFrontmatter(draft).body, [draft]);

    const commit = useCallback(
        (force = false) => {
            if (save.isPending) return;
            setConflict(null);
            save.mutate(
                // Dropping the stamp is how "overwrite anyway" is expressed: the
                // service only compares one when it is given one.
                { path: filePath, content: draft, lastModified: force ? undefined : currentStamp },
                {
                    onSuccess: result => {
                        setSaved(draft);
                        setCurrentStamp(result.lastModified);
                    },
                    onError: error => setConflict(error.message),
                }
            );
        },
        [currentStamp, draft, filePath, save]
    );

    // Closing the tab with unsaved text is the one way to lose work here.
    useEffect(() => {
        if (!dirty) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [dirty]);

    const onKeyDown = (event: React.KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            commit();
        }
    };

    return (
        <div className="flex min-w-0 flex-1 flex-col xl:h-full xl:min-h-0" onKeyDown={onKeyDown}>
            <div className="border-rule flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 sm:px-8">
                <div className="flex items-baseline gap-3">
                    <span className="text-mark-read text-[0.6875rem] font-semibold tracking-[0.13em] uppercase">
                        Editing
                    </span>
                    <span className="text-ink-dim figures text-[0.75rem] break-all">{filePath}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (dirty) {
                                setDraft(saved);
                                return;
                            }
                            onClose();
                        }}
                        disabled={save.isPending}
                    >
                        {dirty ? <RotateCcw className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        {dirty ? "Revert" : "Close"}
                    </Button>
                    <Button size="sm" onClick={() => commit()} disabled={!dirty || save.isPending}>
                        <Check className="h-3.5 w-3.5" />
                        {save.isPending ? "Saving…" : "Save"}
                    </Button>
                </div>
            </div>

            {conflict ? (
                <div className="border-mark bg-mark-soft/60 text-ink mx-5 mt-4 border-l px-4 py-3 text-[0.8125rem] leading-relaxed sm:mx-8">
                    <span className="text-mark-read mr-2 text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
                        Not saved
                    </span>
                    {conflict}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => commit(true)}>
                            Overwrite anyway
                        </Button>
                        <span className="text-ink-dim text-[0.75rem]">
                            Your text is untouched above. Overwriting replaces whatever is on disk now.
                        </span>
                    </div>
                </div>
            ) : null}

            <div className="grid min-w-0 flex-1 grid-cols-1 xl:min-h-0 xl:grid-cols-2">
                <section className="border-rule flex min-w-0 flex-col gap-3 border-b px-5 py-5 sm:px-8 xl:min-h-0 xl:border-r xl:border-b-0">
                    <PlateLabel reading={dirty ? "Unsaved" : formatSize(new Blob([draft]).size)}>Source</PlateLabel>
                    <label className="sr-only" htmlFor="plate-source">
                        Document source, including frontmatter
                    </label>
                    <textarea
                        id="plate-source"
                        value={draft}
                        onChange={event => setDraft(event.target.value)}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        className="border-rule bg-sky text-ink focus-visible:border-mark focus-visible:ring-mark/30 min-h-[24rem] flex-1 resize-none rounded-[2px] border p-4 font-mono text-[0.8125rem] leading-relaxed outline-none focus-visible:ring-1 xl:min-h-0"
                    />
                </section>

                <section className="flex min-w-0 flex-col gap-3 px-5 py-5 sm:px-8 xl:min-h-0">
                    <PlateLabel>Preview</PlateLabel>
                    <div className="plate-prose min-w-0 flex-1 xl:min-h-0 xl:overflow-y-auto">
                        <MarkdownRenderer content={body} type={type} />
                    </div>
                </section>
            </div>
        </div>
    );
}
