import { cn } from "@/lib/utils";

/** Relative widths of the ruled lines on an unexposed plate. */
const RULE_WIDTHS = [0.85, 1, 0.65, 0.92, 0.4];
const FADE_PER_ROW = 0.13;
const FADE_START = 0.9;

interface DocumentLoaderProps {
    message?: string;
    className?: string;
}

/**
 * The plate before the exposure resolves: the graticule is ruled, the objects
 * have not been plotted yet. Deliberately quiet — nothing spins.
 */
export function DocumentLoader({ message = "Resolving plate…", className }: DocumentLoaderProps) {
    return (
        <div className={cn("flex min-h-[60vh] items-center justify-center p-6", className)} aria-busy="true">
            <div className="plate-frame bg-panel/30 w-full max-w-md px-8 py-14">
                <div className="mx-auto flex max-w-[16rem] flex-col gap-3" aria-hidden="true">
                    {RULE_WIDTHS.map((width, row) => (
                        <span
                            key={row}
                            className="bg-rule h-px"
                            style={{ width: `${width * 100}%`, opacity: FADE_START - row * FADE_PER_ROW }}
                        />
                    ))}
                </div>
                <p className="text-ink-dim mt-8 text-center text-[0.6875rem] font-semibold tracking-[0.16em] uppercase">
                    {message}
                </p>
            </div>
        </div>
    );
}
