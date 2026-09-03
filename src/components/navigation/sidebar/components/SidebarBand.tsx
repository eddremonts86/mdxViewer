import { cn } from "@/lib/utils";

/**
 * One band across the plate index.
 *
 * The index used to stack four of them with four different paddings — `p-4`,
 * `px-3 py-2.5`, `px-3 py-1.5`, `px-2 py-2` — two different type steps for the
 * same kind of label, and one border drawn from the stock shadcn token instead
 * of this world's rule. A band is a ruled region on a plate; they are all the
 * same band.
 */
export function SidebarBand({
    label,
    children,
    className,
}: {
    /** Tracked capitals naming the region, on the one label step. */
    label?: string;
    children?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("border-rule flex h-10 shrink-0 items-center gap-1 border-b px-3", className)}>
            {label ? (
                <span className="text-mark-read mr-auto text-[0.6875rem] leading-none font-semibold tracking-[0.13em] uppercase">
                    {label}
                </span>
            ) : null}
            {children}
        </div>
    );
}

/**
 * A control in a band: one size for every one of them.
 *
 * Icon actions were `h-7 w-7` in the index, text actions `h-6`, the header
 * band's own controls `h-8` and `h-9`. Four sizes for one class of thing.
 */
export function BandButton({
    label,
    onClick,
    pressed,
    disabled,
    wide,
    children,
}: {
    label: string;
    onClick: () => void;
    pressed?: boolean;
    disabled?: boolean;
    /** True when the control shows its label rather than only a glyph. */
    wide?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-pressed={pressed}
            className={cn(
                "text-ink-dim hover:text-ink focus-visible:outline-mark flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-[2px] focus-visible:outline focus-visible:outline-offset-1 disabled:opacity-40",
                wide ? "px-2 text-[0.625rem] font-semibold tracking-[0.14em] uppercase" : "w-7",
                pressed && "bg-mark-soft text-mark-read"
            )}
        >
            {children}
            {wide ? null : <span className="sr-only">{label}</span>}
        </button>
    );
}
