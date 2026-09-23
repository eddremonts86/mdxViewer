import { useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateFolderDialogProps {
    open: boolean;
    /** Folder the new plate is created inside; "" is the root. */
    parentPath: string;
    isPending: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
}

/**
 * Naming a new plate. Replaces the browser prompt this used to be: a real
 * surface can say where the folder lands and can be styled, focused and closed
 * like everything else in the product.
 */
export function CreateFolderDialog({ open, parentPath, isPending, onClose, onCreate }: CreateFolderDialogProps) {
    const [name, setName] = useState("");

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onCreate(trimmed);
        setName("");
    };

    return (
        <Dialog
            open={open}
            onOpenChange={next => {
                if (!next) {
                    setName("");
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>New folder</DialogTitle>
                    <DialogDescription>
                        Created inside{" "}
                        <span className="text-ink font-medium">
                            {parentPath === "" ? "the root plate" : parentPath}
                        </span>
                        .
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="folder-name">Folder name</Label>
                        <Input
                            id="folder-name"
                            name="folder-name"
                            value={name}
                            onChange={event => setName(event.target.value)}
                            placeholder="release-notes"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || name.trim() === ""}>
                            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            Create folder
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
