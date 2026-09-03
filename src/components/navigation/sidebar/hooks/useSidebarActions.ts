import { useCallback, useState } from "react";

import type { DeleteTarget } from "@/components/dialogs/DeleteDialog";
import { useCreateFolder, useDeleteFiles, useUploadFiles } from "@/hooks/api/useFiles";
import { useToast } from "@/hooks/use-toast";

const MAX_FOLDER_DEPTH = 10;
const ACCEPTED_UPLOADS = ".md,.mdx,.txt";

const depthOf = (path: string) => (!path || path === "/" ? 0 : path.split("/").filter(Boolean).length);

const messageOf = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

/**
 * Everything in the plate index that changes files on disk: creating a folder,
 * uploading, and deleting. Each destructive path resolves through a real
 * dialog, so nothing here reaches for a browser prompt.
 */
export function useSidebarActions(refetch: () => void) {
    const { toast } = useToast();
    const createFolderMutation = useCreateFolder();
    const deleteFilesMutation = useDeleteFiles();
    const uploadFilesMutation = useUploadFiles();

    const [folderParent, setFolderParent] = useState<string | null>(null);
    const [pendingDeletion, setPendingDeletion] = useState<DeleteTarget[]>([]);

    const openFolderDialog = useCallback(
        (parentPath = "") => {
            if (depthOf(parentPath) >= MAX_FOLDER_DEPTH) {
                toast({
                    variant: "destructive",
                    title: "Folder is already at maximum depth",
                    description: `The content tree stops at ${MAX_FOLDER_DEPTH} levels. Create this folder higher up, or move some files.`,
                });
                return;
            }
            setFolderParent(parentPath);
        },
        [toast]
    );

    const createFolder = useCallback(
        (name: string) => {
            createFolderMutation.mutate(
                { name, path: folderParent ?? "" },
                {
                    onSuccess: () => {
                        toast({ variant: "success", title: "Folder created", description: name });
                        setFolderParent(null);
                        refetch();
                    },
                    onError: error =>
                        toast({
                            variant: "destructive",
                            title: "Could not create the folder",
                            description: messageOf(error, "The server rejected the name."),
                        }),
                }
            );
        },
        [createFolderMutation, folderParent, refetch, toast]
    );

    const confirmDeletion = useCallback(
        (onDeleted?: () => void) => {
            const paths = pendingDeletion.map(target => target.path);
            if (paths.length === 0) return;

            deleteFilesMutation.mutate(paths, {
                onSuccess: () => {
                    toast({
                        variant: "success",
                        title: paths.length === 1 ? "Object deleted" : `${paths.length} objects deleted`,
                        description: paths.length === 1 ? paths[0] : undefined,
                    });
                    setPendingDeletion([]);
                    onDeleted?.();
                    refetch();
                },
                onError: error =>
                    toast({
                        variant: "destructive",
                        title: "Could not delete",
                        description: messageOf(error, "The server refused the request."),
                    }),
            });
        },
        [deleteFilesMutation, pendingDeletion, refetch, toast]
    );

    const upload = useCallback(
        async (files: File[]) => {
            if (files.length === 0) return;
            try {
                await uploadFilesMutation.mutateAsync({ files, targetPath: "", createFolders: true });
                toast({
                    variant: "success",
                    title: files.length === 1 ? "File uploaded" : `${files.length} files uploaded`,
                });
                refetch();
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Upload failed",
                    description: messageOf(error, "The server rejected the upload."),
                });
            }
        },
        [refetch, toast, uploadFilesMutation]
    );

    const pickAndUpload = useCallback(() => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = ACCEPTED_UPLOADS;
        input.addEventListener("change", () => {
            void upload(Array.from(input.files ?? []));
        });
        input.click();
    }, [upload]);

    return {
        folderParent,
        openFolderDialog,
        closeFolderDialog: () => setFolderParent(null),
        createFolder,
        isCreatingFolder: createFolderMutation.isPending,

        pendingDeletion,
        askToDelete: setPendingDeletion,
        cancelDeletion: () => setPendingDeletion([]),
        confirmDeletion,
        isDeleting: deleteFilesMutation.isPending,

        pickAndUpload,
        isUploading: uploadFilesMutation.isPending,
    };
}
