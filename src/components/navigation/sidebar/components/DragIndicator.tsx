import React from "react";

interface DragIndicatorProps {
    isDragging: boolean;
    draggedItemName: string;
}

/**
 * Drag indicator component that shows when dragging files
 * Provides visual feedback during drag operations
 */
export const DragIndicator: React.FC<DragIndicatorProps> = ({ isDragging, draggedItemName }) => {
    if (!isDragging) return null;

    return (
        <div className="pointer-events-none fixed top-0 left-0 z-50 h-full w-full">
            <div className="absolute top-2 left-2 rounded bg-blue-600 px-2 py-1 text-xs text-white shadow-lg">
                Moving: {draggedItemName}
            </div>
        </div>
    );
};