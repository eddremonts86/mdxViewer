import { CompassStar } from "@/components/atlas/CompassStar";
import { cn } from "@/lib/utils";

interface EmptyPlateProps {
    /** Tracked capital designation above the title, e.g. "NO OBJECT". */
    designation: string;
    title: string;
    message: string;
    /** Recovery action. An empty state that offers nothing is a dead end. */
    action?: React.ReactNode;
    /** Replaces the compass rose when the state has its own mark. */
    mark?: React.ReactNode;
    className?: string;
}

/**
 * An unexposed plate: the frame is printed, the field is empty. Every loading,
 * empty and error state in the product uses this, so they read as one artifact
 * rather than three different dashed boxes.
 */
export function EmptyPlate({ designation, title, message, action, mark, className }: EmptyPlateProps) {
    return (
        <div className={cn("flex min-h-[60vh] items-center justify-center p-6", className)}>
            <div className="plate-frame bg-panel/40 w-full max-w-md px-8 py-12 text-center">
                <div className="mb-6 flex justify-center">
                    {mark ?? <CompassStar className="text-mark" size={26} />}
                </div>
                <p className="text-mark-read mb-3 text-[0.625rem] font-semibold tracking-[0.18em] uppercase">
                    {designation}
                </p>
                <h2 className="text-ink font-serif text-[1.375rem] leading-tight font-semibold text-balance">
                    {title}
                </h2>
                <p className="text-ink-dim mx-auto mt-3 max-w-[34ch] text-[0.875rem] leading-relaxed">{message}</p>
                {action ? <div className="mt-7 flex justify-center">{action}</div> : null}
            </div>
        </div>
    );
}
