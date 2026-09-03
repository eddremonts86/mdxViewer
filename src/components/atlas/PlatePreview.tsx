import { type AtlasObject, radiusForMagnitude } from "@/lib/atlas";
import { cn } from "@/lib/utils";

interface PlatePreviewProps {
    /** The object this plate is cut around. */
    object: AtlasObject;
    /** Its plate-mates, drawn as the surrounding constellation. */
    neighbours: AtlasObject[];
    /** True only for the card under the pointer: amber is the observer's mark,
        and forty of them at once would mean nothing. */
    marked?: boolean;
    className?: string;
}

const VIEW = 100;

/**
 * A chart plate cut around one object: its own folder's constellation, with the
 * object itself ringed. Every point is a real sibling file, so the plate says
 * something true about where the document sits — which a screenshot thumbnail
 * of rendered prose never did.
 */
export function PlatePreview({ object, neighbours, marked = false, className }: PlatePreviewProps) {
    const group = neighbours.length > 0 ? neighbours : [object];

    // Re-frame the plate's own objects into this small square.
    const xs = group.map(item => item.x);
    const ys = group.map(item => item.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = Math.max(0.001, maxX - minX);
    const spanY = Math.max(0.001, maxY - minY);
    const pad = 18;
    const project = (item: AtlasObject) => ({
        cx: pad + ((item.x - minX) / spanX) * (VIEW - pad * 2),
        cy: pad + ((item.y - minY) / spanY) * (VIEW - pad * 2),
    });

    const ordered = [...group].sort((first, second) => first.index - second.index);
    const line = ordered
        .map(project)
        .map((point, position) => `${position === 0 ? "M" : "L"}${point.cx.toFixed(1)} ${point.cy.toFixed(1)}`)
        .join(" ");
    const self = project(object);

    return (
        <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className={cn("block h-full w-full", className)}
            aria-hidden="true"
            focusable="false"
        >
            <g className="text-rule" stroke="currentColor" strokeWidth="0.5" opacity="0.6">
                <line x1="0" y1={VIEW / 2} x2={VIEW} y2={VIEW / 2} strokeDasharray="1.5 3" />
                <line x1={VIEW / 2} y1="0" x2={VIEW / 2} y2={VIEW} strokeDasharray="1.5 3" />
            </g>

            {ordered.length > 1 ? (
                <path
                    d={line}
                    fill="none"
                    className="text-figure"
                    stroke="currentColor"
                    strokeWidth="0.6"
                    strokeDasharray="1 2.5"
                    opacity="0.55"
                />
            ) : null}

            {ordered.map(item => {
                const point = project(item);
                const isSelf = item.path === object.path;
                return (
                    <circle
                        key={item.path}
                        cx={point.cx}
                        cy={point.cy}
                        r={radiusForMagnitude(item.magnitude) * 0.62}
                        className={isSelf && marked ? "text-mark" : "text-star"}
                        fill="currentColor"
                        opacity={isSelf ? 1 : 0.4}
                    />
                );
            })}

            <circle
                cx={self.cx}
                cy={self.cy}
                r={radiusForMagnitude(object.magnitude) * 0.62 + 4}
                className={marked ? "text-mark" : "text-star"}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.7"
                opacity={marked ? 1 : 0.5}
            />
        </svg>
    );
}
