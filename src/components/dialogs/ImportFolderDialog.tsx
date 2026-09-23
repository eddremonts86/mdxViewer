import { useRef, useState } from "react";

import { FolderOpen, Loader2 } from "lucide-react";

import type { ImportResult } from "@/api/fileAPI";
import { PlateLabel } from "@/components/atlas";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatSize } from "@/lib/atlas";
import { type FolderReading, importFolder, readImportableFolder } from "@/lib/importFolder";

const LISTED = 6;

interface ImportFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Where the folder lands. Empty is the root of the content folder. */
    targetPath?: string;
    onImported: () => void;
}

/**
 * Bringing a folder of documentation in.
 *
 * The surface exists because an import is not one action on one file: it reads
 * someone's folder, leaves most of what is in it behind, and writes a tree. So
 * it says what it found, what it is ignoring and where it will land — and only
 * then offers the button. Nothing is written before that.
 */
export function ImportFolderDialog({ open, onOpenChange, targetPath = "", onImported }: ImportFolderDialogProps) {
    const picker = useRef<HTMLInputElement>(null);
    const [reading, setReading] = useState<FolderReading | null>(null);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [failure, setFailure] = useState<string | null>(null);

    const reset = () => {
        setReading(null);
        setProgress(null);
        setResult(null);
        setFailure(null);
        if (picker.current) picker.current.value = "";
    };

    const onPicked = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        setResult(null);
        setFailure(null);
        setReading(files.length > 0 ? readImportableFolder(files) : null);
    };

    const run = async () => {
        if (!reading) return;

        setProgress({ done: 0, total: reading.documents.length });
        setFailure(null);
        try {
            const outcome = await importFolder(reading.documents, targetPath, (done, total) =>
                setProgress({ done, total })
            );
            setResult(outcome);
            onImported();
        } catch (error) {
            setFailure(error instanceof Error ? error.message : "The import did not finish");
        } finally {
            setProgress(null);
        }
    };

    const destination = targetPath ? `${targetPath}/` : "the root of the content folder";
    const busy = progress !== null;

    return (
        <Dialog
            open={open}
            onOpenChange={next => {
                if (busy) return;
                onOpenChange(next);
                if (!next) reset();
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Import a folder</DialogTitle>
                    <DialogDescription>
                        Every <code>.md</code> and <code>.mdx</code> file inside it, at any depth, keeping the folder
                        structure. Nothing else is sent, and a document whose name is already taken is left alone.
                    </DialogDescription>
                </DialogHeader>

                <input
                    ref={picker}
                    type="file"
                    multiple
                    // Not in the React types: the attribute that turns a file input
                    // into a directory picker, supported by every current browser.
                    {...{ webkitdirectory: "" }}
                    onChange={onPicked}
                    className="sr-only"
                />

                {result ? (
                    <ImportReport result={result} />
                ) : (
                    <div className="space-y-4">
                        <Button variant="outline" size="sm" onClick={() => picker.current?.click()} disabled={busy}>
                            <FolderOpen className="h-3.5 w-3.5" />
                            {reading ? "Choose a different folder" : "Choose a folder"}
                        </Button>

                        {reading ? <FolderSummary reading={reading} destination={destination} /> : null}
                    </div>
                )}

                {failure ? (
                    <p className="border-mark bg-mark-soft/60 text-ink border-l px-4 py-3 text-[0.8125rem] leading-relaxed">
                        <span className="text-mark-read mr-2 text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
                            Stopped
                        </span>
                        {failure} Anything already written stayed written.
                    </p>
                ) : null}

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                        {result ? "Close" : "Cancel"}
                    </Button>
                    {result ? null : (
                        <Button type="button" onClick={run} disabled={busy || !reading?.documents.length}>
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            {/* "Import 0" is not a thing anyone wants to be offered. */}
                            {busy
                                ? `Importing ${progress.done} of ${progress.total}`
                                : reading?.documents.length
                                  ? `Import ${reading.documents.length}`
                                  : "Import"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** What the picked folder holds, before anything is written. */
function FolderSummary({ reading, destination }: { reading: FolderReading; destination: string }) {
    const bytes = reading.documents.reduce((sum, file) => sum + file.size, 0);
    const shown = reading.ignored.slice(0, LISTED);

    return (
        <div className="space-y-3">
            <PlateLabel reading={formatSize(bytes)}>
                {reading.documents.length === 1 ? "1 document" : `${reading.documents.length} documents`}
            </PlateLabel>

            <p className="text-ink-dim text-[0.8125rem] leading-relaxed">
                {reading.root ? (
                    <>
                        Landing in {destination} as <span className="text-ink figures">{reading.root}/</span>
                    </>
                ) : (
                    <>Landing in {destination}</>
                )}
            </p>

            {reading.ignored.length > 0 ? (
                <div className="border-rule bg-panel/40 space-y-1.5 border-l px-3 py-2.5">
                    <p className="text-ink-dim text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
                        {reading.ignored.length} not sent
                    </p>
                    <ul className="text-ink-dim space-y-0.5 text-[0.75rem]">
                        {shown.map(entry => (
                            <li key={entry.path} className="truncate">
                                {entry.path} — {entry.reason}
                            </li>
                        ))}
                    </ul>
                    {reading.ignored.length > shown.length ? (
                        <p className="text-ink-dim figures text-[0.75rem]">
                            and {reading.ignored.length - shown.length} more
                        </p>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

/** What the service actually did. */
function ImportReport({ result }: { result: ImportResult }) {
    const shown = result.skipped.slice(0, LISTED);

    return (
        <div className="space-y-3">
            <PlateLabel reading={`${result.imported.length}`}>Imported</PlateLabel>

            {result.skipped.length === 0 ? (
                <p className="text-ink-dim text-[0.8125rem] leading-relaxed">
                    Every document came in, structure intact.
                </p>
            ) : (
                <div className="border-rule bg-panel/40 space-y-1.5 border-l px-3 py-2.5">
                    <p className="text-ink-dim text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
                        {result.skipped.length} skipped
                    </p>
                    <ul className="text-ink-dim space-y-0.5 text-[0.75rem]">
                        {shown.map(entry => (
                            <li key={`${entry.path}-${entry.reason}`} className="truncate">
                                {entry.path} — {entry.reason}
                            </li>
                        ))}
                    </ul>
                    {result.skipped.length > shown.length ? (
                        <p className="text-ink-dim figures text-[0.75rem]">
                            and {result.skipped.length - shown.length} more
                        </p>
                    ) : null}
                </div>
            )}
        </div>
    );
}
