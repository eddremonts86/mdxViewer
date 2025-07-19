import { useCallback, useState } from "react";

export function useFileDialog() {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createType, setCreateType] = useState<"file" | "folder">("file");
    const [createParentPath, setCreateParentPath] = useState("");

    const openCreateFile = useCallback((parentPath = "") => {
        setCreateType("file");
        setCreateParentPath(parentPath);
        setShowCreateDialog(true);
    }, []);

    const openCreateFolder = useCallback((parentPath = "") => {
        setCreateType("folder");
        setCreateParentPath(parentPath);
        setShowCreateDialog(true);
    }, []);

    const closeDialog = useCallback(() => setShowCreateDialog(false), []);

    return {
        showCreateDialog,
        createType,
        createParentPath,
        openCreateFile,
        openCreateFolder,
        closeDialog,
        setCreateParentPath,
    };
}
