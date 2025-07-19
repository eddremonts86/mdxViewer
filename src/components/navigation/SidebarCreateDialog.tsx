import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-96 p-6">
                <h3 className="mb-4 text-lg font-semibold">Create {createType === "file" ? "File" : "Folder"}</h3>
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
                >
                    <input
                        name="name"
                        placeholder={`${createType === "file" ? "File" : "Folder"} name`}
                        className="border-border mb-4 w-full rounded border p-2"
                        autoFocus
                        required
                    />
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
            </Card>
        </div>
    );
}
