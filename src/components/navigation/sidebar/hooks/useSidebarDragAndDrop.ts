import { useState, useCallback } from "react";

import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook for managing drag and drop operations in the sidebar
 * Handles drag state, auto-expansion, and visual feedback
 */
export const useSidebarDragAndDrop = (
    moveItemMutation: (params: { sourcePath: string; targetPath: string }) => void,
    handleFolderAutoExpansion: (targetPath: string) => void
) => {
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [draggedItemName, setDraggedItemName] = useState<string>("");
    const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragAutoExpandTimer, setDragAutoExpandTimer] = useState<NodeJS.Timeout | null>(null);
    const [animatingFolders, setAnimatingFolders] = useState<Set<string>>(new Set());

    const { toast } = useToast();

    const handleDragStart = useCallback(
        (e: React.DragEvent, itemPath: string, itemName: string) => {
            setDraggedItem(itemPath);
            setDraggedItemName(itemName);
            setIsDragging(true);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", itemPath);

            // Add visual feedback to the dragged element
            setTimeout(() => {
                const dragElement = e.currentTarget as HTMLElement;
                if (dragElement) {
                    dragElement.style.opacity = "0.4";
                    dragElement.style.transform = "scale(0.95)";
                    dragElement.style.transition = "all 0.2s ease";
                }
            }, 0);

            toast({
                title: "🎯 Drag to move",
                description: `Drop "${itemName}" on a folder to move it there`,
                duration: 3000,
            });
        },
        [toast],
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent, targetPath: string, isFolder: boolean) => {
            e.preventDefault();
            if (!isFolder || !isDragging || draggedItem === targetPath) return;

            // Prevent dropping a folder into itself or its children
            if (draggedItem && targetPath.startsWith(draggedItem)) return;

            e.dataTransfer.dropEffect = "move";
            setDragOverFolder(targetPath);

            // Auto-expand folder with delay for better UX
            if (targetPath) {
                // Clear any existing timer
                if (dragAutoExpandTimer) {
                    clearTimeout(dragAutoExpandTimer);
                }

                // Set new timer for auto-expansion
                const timer = setTimeout(() => {
                    setAnimatingFolders(folders => new Set([...folders, targetPath]));
                    handleFolderAutoExpansion(targetPath);
                }, 800); // Wait 800ms before auto-expanding

                setDragAutoExpandTimer(timer);
            }
        },
        [isDragging, draggedItem, dragAutoExpandTimer, handleFolderAutoExpansion],
    );

    const handleDragLeave = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();

            // Clear auto-expand timer when leaving
            if (dragAutoExpandTimer) {
                clearTimeout(dragAutoExpandTimer);
                setDragAutoExpandTimer(null);
            }

            // Only clear if we're leaving the actual target element
            const relatedTarget = e.relatedTarget as HTMLElement;
            const currentTarget = e.currentTarget as HTMLElement;

            if (!currentTarget.contains(relatedTarget)) {
                setDragOverFolder(null);
            }
        },
        [dragAutoExpandTimer],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent, targetPath: string, isFolder: boolean) => {
            e.preventDefault();
            
            if (!draggedItem || !isFolder) return;
            
            // Prevent dropping a folder into itself or its children
            if (targetPath.startsWith(draggedItem)) return;

            // Perform the move operation
            moveItemMutation({
                sourcePath: draggedItem,
                targetPath: targetPath,
            });

            // Clear drag state
            setDragOverFolder(null);
        },
        [draggedItem, moveItemMutation],
    );

    const handleDragEnd = useCallback(() => {
        // Clear any auto-expand timer
        if (dragAutoExpandTimer) {
            clearTimeout(dragAutoExpandTimer);
            setDragAutoExpandTimer(null);
        }

        setDraggedItem(null);
        setDraggedItemName("");
        setDragOverFolder(null);
        setIsDragging(false);
        setAnimatingFolders(new Set());

        // Reset styles of all draggable elements with smooth transition
        const dragElements = document.querySelectorAll('[draggable="true"]');
        dragElements.forEach(el => {
            const element = el as HTMLElement;
            element.style.opacity = "";
            element.style.transform = "";
            element.style.transition = "all 0.2s ease";
        });

        // Clear transition after animation
        setTimeout(() => {
            dragElements.forEach(el => {
                (el as HTMLElement).style.transition = "";
            });
        }, 200);
    }, [dragAutoExpandTimer]);

    return {
        draggedItem,
        draggedItemName,
        dragOverFolder,
        isDragging,
        animatingFolders,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
    };
};