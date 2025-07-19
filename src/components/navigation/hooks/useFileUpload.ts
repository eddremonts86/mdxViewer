import { useCallback } from "react";

import { useUploadFiles } from "@/hooks/api/useFiles";

export function useFileUpload() {
    const uploadFilesMutation = useUploadFiles();

    const handleUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const { files } = event.target;
            if (!files || files.length === 0) return;
            try {
                await uploadFilesMutation.mutateAsync({
                    files: Array.from(files),
                    targetPath: "",
                    createFolders: true,
                });
                event.target.value = "";
            } catch (error) {
                console.error("Upload failed:", error);
            }
        },
        [uploadFilesMutation],
    );

    return { handleUpload, uploadFilesMutation };
}
