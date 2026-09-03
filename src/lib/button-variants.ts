import { cva, type VariantProps } from "class-variance-authority";

/**
 * Controls in an engraved plate: square, tracked capitals, hairline borders.
 * Amber fill is reserved for the one action that changes something.
 *
 * Pressing one moves it a pixel. Every control in the product was static under
 * the finger — the press was reported by a colour change alone, which reads as a
 * hover that happened to stick. A pixel of travel is the cheapest thing that
 * makes a control feel like it was struck, and it costs one transform.
 */
export const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-plate font-semibold uppercase tracking-[0.11em] transition-[color,background-color,border-color,transform] duration-150 active:translate-y-px focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-mark disabled:pointer-events-none disabled:opacity-40 disabled:active:translate-y-0",
    {
        variants: {
            variant: {
                default: "bg-mark text-sky hover:bg-mark-read hover:text-sky",
                destructive: "bg-mark text-sky hover:bg-mark-read hover:text-sky",
                outline: "border border-rule text-mark-read hover:border-mark hover:bg-panel",
                secondary: "border border-rule bg-panel text-ink hover:border-rule-bright",
                ghost: "text-ink-dim hover:bg-panel hover:text-ink",
                link: "text-mark-read underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 text-[0.6875rem]",
                sm: "h-8 px-3 text-[0.625rem]",
                lg: "h-11 px-6 text-[0.75rem]",
                icon: "h-9 w-9 px-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
