import { cn } from "@/lib/utils";

interface PlateLabelProps {
    children: React.ReactNode;
    /** Value shown flush right, in tabular figures — a count, a total, a key. */
    reading?: React.ReactNode;
    className?: string;
}

/**
 * The atlas column head: tracked capitals, a hairline running out to the region
 * edge, and a node dot terminating it. Used wherever a region needs naming.
 */
export function PlateLabel({ children, reading, className }: PlateLabelProps) {
    return (
        <div className={cn("flex items-center gap-2.5", className)}>
            <span className="text-mark-read text-[0.6875rem] leading-none font-semibold tracking-[0.13em] uppercase">
                {children}
            </span>
            <span className="bg-rule h-px flex-1" />
            <span className="bg-rule-bright h-[3px] w-[3px] rounded-full" />
            {reading ? (
                <span className="text-ink-dim figures text-[0.6875rem] leading-none font-medium tracking-[0.06em]">
                    {reading}
                </span>
            ) : null}
        </div>
    );
}
