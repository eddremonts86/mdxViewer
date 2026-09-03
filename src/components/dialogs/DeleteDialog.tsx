import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface DeleteTarget {
    path: string;
    /** True for a folder: it takes everything inside it. */
    isFolder: boolean;
    /** Documents that disappear with this target, itself included. */
    documents: number;
}

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    /** Everything about to be removed. The dialog names them and counts what
        they carry; it never reports a folder as one object. */
    targets: DeleteTarget[];
    isLoading?: boolean;
}

const NAMES_SHOWN = 8;

/**
 * Confirming a removal from the catalogue. These are real files on someone's
 * disk, so the surface names exactly what is about to go — and now says where it
 * goes, because a delete moves the item to the trash rather than unlinking it.
 */
export function DeleteDialog({ open, onOpenChange, onConfirm, targets, isLoading = false }: DeleteDialogProps) {
    const shown = targets.slice(0, NAMES_SHOWN);
    const remaining = targets.length - shown.length;
    const single = targets.length === 1;
    const documents = targets.reduce((sum, target) => sum + target.documents, 0);
    const folders = targets.filter(target => target.isFolder).length;
    const carriesMore = documents > targets.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{single ? "Delete this object" : `Delete ${targets.length} objects`}</DialogTitle>
                    <DialogDescription>
                        {carriesMore ? (
                            <>
                                {folders === 1 ? "That folder holds" : `Those ${folders} folders hold`}{" "}
                                <span className="text-mark-read figures font-semibold">{documents} documents</span>, and
                                all of them go.{" "}
                            </>
                        ) : null}
                        Moved out of the content folder to the trash, where you can put them back.
                    </DialogDescription>
                </DialogHeader>

                <ul className="border-rule bg-sky rounded-plate max-h-52 overflow-y-auto border">
                    {shown.map(target => (
                        <li
                            key={target.path}
                            className="border-rule text-ink flex items-center gap-2 border-b px-3 py-2 text-[0.8125rem] last:border-b-0"
                        >
                            <span className="bg-mark h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true" />
                            <span className="min-w-0 flex-1 truncate">{target.path}</span>
                            {target.isFolder ? (
                                <span className="text-ink-dim figures shrink-0 text-[0.6875rem]">
                                    {target.documents} docs
                                </span>
                            ) : null}
                        </li>
                    ))}
                    {remaining > 0 ? (
                        <li className="text-ink-dim figures px-3 py-2 text-[0.75rem]">and {remaining} more</li>
                    ) : null}
                </ul>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Keep them
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        {isLoading ? "Deleting" : single && !carriesMore ? "Delete it" : `Delete ${documents}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
