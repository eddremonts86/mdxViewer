import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SidebarCreateDialogProps {
    show: boolean;
    createType: "file" | "folder";
    createParentPath: string;
    closeDialog: () => void;
    createFileMutation: { mutateAsync: (args: any) => Promise<any>; isPending: boolean };
    createFolderMutation: { mutateAsync: (args: any) => Promise<any>; isPending: boolean };
}

export function SidebarCreateDialog({
    show,
    createType,
    createParentPath,
    closeDialog,
    createFileMutation,
    createFolderMutation,
}: SidebarCreateDialogProps) {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && closeDialog()}>
            <DialogContent className="max-w-sm w-full">
                <DialogHeader>
                    <DialogTitle>Create {createType === "file" ? "File" : "Folder"}</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={async e => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const name = formData.get("name") as string;
                        try {
                            if (createType === "file") {
                                await createFileMutation.mutateAsync({
                                    name: name.endsWith(".md") || name.endsWith(".mdx") ? name : `${name}.md`,
                                    type: name.endsWith(".mdx") ? "mdx" : "md",
                                    path: createParentPath,
                                    content: "",
                                });
                            } else {
                                await createFolderMutation.mutateAsync({
                                    name,
                                    path: createParentPath,
                                });
                            }
                            closeDialog();
                        } catch (error) {
                            console.error("Create failed:", error);
                        }
                    }}
                    className="space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            {createType === "file" ? "File" : "Folder"} name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder={`${createType === "file" ? "File" : "Folder"} name`}
                            autoFocus
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={closeDialog}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createFileMutation.isPending || createFolderMutation.isPending}>
                            {createFileMutation.isPending || createFolderMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
