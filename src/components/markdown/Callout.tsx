import { AlertTriangle, Flame, Info, Lightbulb, MessageSquareWarning } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * GitHub's blockquote callouts, in this system's terms.
 *
 * The obvious implementation gives each kind a colour — blue note, yellow
 * warning, red caution. This system has one signal hue and spends it on the
 * observer, never on content, so severity is carried by the three things left:
 * the label, the mark, and how heavily the rule is drawn. A caution is a
 * full-ink rule; a note is a hairline.
 */

const KINDS = {
    note: { label: "Note", mark: Info, rule: "border-rule" },
    tip: { label: "Tip", mark: Lightbulb, rule: "border-rule" },
    important: { label: "Important", mark: MessageSquareWarning, rule: "border-rule-bright" },
    warning: { label: "Warning", mark: AlertTriangle, rule: "border-ink-dim" },
    caution: { label: "Caution", mark: Flame, rule: "border-ink" },
} as const;

export type CalloutKind = keyof typeof KINDS;

export function isCalloutKind(value: string): value is CalloutKind {
    return value.toLowerCase() in KINDS;
}

export function Callout({ kind, children }: { kind: CalloutKind; children: React.ReactNode }) {
    const { label, mark: Mark, rule } = KINDS[kind];

    return (
        <div className={cn("plate-callout bg-panel/50 border-l-2 py-3 pr-4 pl-4", rule)}>
            <p className="text-ink-dim mb-1.5 flex items-center gap-2 text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
                <Mark className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
            </p>
            {children}
        </div>
    );
}
