import React from "react";

interface BatchProgressProps {
    /** Current progress value (0-100) */
    value: number;
    /** Maximum value for progress calculation */
    max?: number;
    /** Label to display above progress bar */
    label?: string;
    /** Whether the operation is currently active */
    isActive?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * BatchProgress component displays progress for batch operations
 * Follows MDXViewer design system and English-only practices
 */
export const BatchProgress: React.FC<BatchProgressProps> = ({
    value,
    max = 100,
    label = "Processing...",
    isActive = true,
    className = "",
}) => {
    const progressPercentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{label}</span>
                    <span className="text-muted-foreground">
                        {Math.round(progressPercentage)}%
                    </span>
                </div>
            )}
            <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                <div
                    className={`bg-primary h-full transition-all duration-300 ease-out ${
                        isActive ? "animate-pulse" : ""
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>
    );
};
