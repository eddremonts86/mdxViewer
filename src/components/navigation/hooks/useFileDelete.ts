import { useCallback } from "react";

import { useDeleteFiles } from "@/hooks/api/useFiles";

export function useFileDelete(selectedFiles: string[], setSelectedFiles: (files: string[]) => void) {
    const deleteFilesMutation = useDeleteFiles();

    const handleDelete = useCallback(async () => {
        if (selectedFiles.length === 0) return;
        try {
            await deleteFilesMutation.mutateAsync(selectedFiles);
            setSelectedFiles([]);
        } catch (error) {
            console.error("Delete failed:", error);
        }
    }, [selectedFiles, setSelectedFiles, deleteFilesMutation]);

    return { handleDelete, deleteFilesMutation };
}
