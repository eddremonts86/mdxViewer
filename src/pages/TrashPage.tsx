import { useState } from "react";

import { RotateCcw, Trash2 } from "lucide-react";

import type { TrashEntry } from "@/api/fileAPI";
import { EmptyPlate, MagnitudeDot, PlateLabel } from "@/components/atlas";
import { DocumentLoader } from "@/components/document";
import { Button } from "@/components/ui/button";
import { usePurgeTrash, useRestoreFromTrash, useTrash } from "@/hooks/api/useFiles";
import { useEffectiveTheme } from "@/hooks/useMarkdownTheme";
import { formatEpoch, formatSize, magnitudeFromSize } from "@/lib/atlas";
import { plateColour } from "@/lib/plateColour";

/** A deleted document reads as the object it was, plus where it fell out of. */
function TrashRow({ entry, rendition }: { entry: TrashEntry; rendition: "dark" | "light" }) {
    const restore = useRestoreFromTrash();
    const purge = usePurgeTrash();
    const [confirmingPurge, setConfirmingPurge] = useState(false);

    const busy = restore.isPending || purge.isPending;
    const failure = restore.error?.message ?? purge.error?.message ?? null;
    const folder = entry.originalPath.split("/").slice(0, -1).join("/");

    return (
        <li className="border-rule border-b py-4 last:border-b-0">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <MagnitudeDot magnitude={magnitudeFromSize(entry.size)} />

                <span className="text-ink min-w-0 flex-1 font-serif text-[0.9375rem] italic">{entry.name}</span>

                {/* The folder it came from, in the hue that folder has everywhere
                    else. A thrown-away document still belongs somewhere. */}
                <span className="text-ink-dim figures flex shrink-0 items-center gap-2 text-[0.6875rem] tracking-[0.06em]">
                    <span
                        aria-hidden="true"
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: plateColour(folder, rendition) }}
                    />
                    {folder === "" ? "ROOT" : folder.toUpperCase()}
                </span>
                <span className="text-ink-dim figures w-16 shrink-0 text-right text-[0.75rem]">
                    {entry.type === "folder" ? "FOLDER" : formatSize(entry.size)}
                </span>
                <span className="text-ink-dim figures w-24 shrink-0 text-right text-[0.75rem]">
                    {formatEpoch(new Date(entry.deletedAt))}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" disabled={busy} onClick={() => restore.mutate(entry.id)}>
                        <RotateCcw className="h-3.5 w-3.5" />
                        {restore.isPending ? "Restoring…" : "Restore"}
                    </Button>
                    {confirmingPurge ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={busy}
                            onClick={() => purge.mutate([entry.id])}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {purge.isPending ? "Deleting…" : "Delete for good"}
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" disabled={busy} onClick={() => setConfirmingPurge(true)}>
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            {confirmingPurge && !purge.isPending ? (
                <p className="text-ink-dim mt-2 text-[0.75rem] leading-relaxed">
                    This one does not come back.{" "}
                    <button
                        type="button"
                        className="text-mark-read underline underline-offset-2"
                        onClick={() => setConfirmingPurge(false)}
                    >
                        Keep it
                    </button>
                </p>
            ) : null}

            {failure ? (
                <p className="border-mark bg-mark-soft/60 text-ink mt-3 border-l px-3 py-2 text-[0.75rem] leading-relaxed">
                    {failure}
                </p>
            ) : null}
        </li>
    );
}

/**
 * The trash.
 *
 * PRODUCT.md's fourth principle says a destructive action is recoverable. This is
 * where that is true: everything deleted from the plate index waits here under the
 * path it came from, until someone puts it back or says so twice.
 */
export function TrashPage() {
    const { data: entries, isLoading, error } = useTrash();
    const rendition = useEffectiveTheme() === "dark" ? "dark" : "light";

    if (isLoading) return <DocumentLoader message="Reading the trash…" />;

    if (error) {
        return (
            <EmptyPlate
                designation="Trash"
                title="The trash could not be read"
                message={error.message}
                mark={<Trash2 className="text-mark" size={26} />}
            />
        );
    }

    if (!entries?.length) {
        return (
            <EmptyPlate
                designation="Trash"
                title="Nothing has been thrown away"
                message="Documents you delete from the plate index wait here under the path they came from, so a delete can be undone."
                mark={<Trash2 className="text-mark" size={26} />}
            />
        );
    }

    return (
        <section className="mx-auto w-full max-w-[72rem] px-5 py-6 sm:px-8">
            <PlateLabel reading={`${entries.length}`}>Trash</PlateLabel>

            <p className="text-ink-dim mt-3 max-w-[68ch] text-[0.8125rem] leading-relaxed">
                Deleted documents wait outside the content folder, so the chart and the survey no longer count them.
                Restoring puts one back at the path it came from — and refuses if something has since taken that name.
            </p>

            <ul className="mt-6">
                {entries.map(entry => (
                    <TrashRow key={entry.id} entry={entry} rendition={rendition} />
                ))}
            </ul>
        </section>
    );
}
