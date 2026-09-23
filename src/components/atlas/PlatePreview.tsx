import { useEffectiveTheme } from "@/hooks/useMarkdownTheme";
import { radiusForMagnitude } from "@/lib/atlas";
import type { Graph, GraphNode } from "@/lib/graph";
import { plateColour } from "@/lib/plateColour";
import { cn } from "@/lib/utils";

interface PlatePreviewProps {
    /** The settled collection, so a card shows the same layout the chart does. */
    graph: Graph;
    /** Path of the document this plate is cut around. */
    path: string;
    /** True only for the card under the pointer: amber is the observer's mark,
        and forty of them at once would mean nothing. */
    marked?: boolean;
    className?: string;
}

const VIEW = 100;
const PAD = 16;

/**
 * The document's own folder, cut into a small square.
 *
 * This used to draw the ring layout and a line through the folder's documents in
 * catalogue order — the same meaningless polyline the chart carried, reproduced
 * once per card. It is the chart's own figure now: the folder's hub with its
 * documents on spokes, in the folder's hue, the document itself ringed. Every
 * mark is a real sibling file, which a screenshot thumbnail never was.
 */
export function PlatePreview({ graph, path, marked = false, className }: PlatePreviewProps) {
    const rendition = useEffectiveTheme() === "dark" ? "dark" : "light";

    const self = graph.nodes.find(node => node.id === path);
    if (!self) return <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className={cn("block h-full w-full", className)} />;

    const hub = graph.nodes.find(node => node.kind === "folder" && node.folderPath === self.folderPath) ?? null;
    const siblings = graph.nodes.filter(node => node.kind === "document" && node.folderPath === self.folderPath);
    const shown = [...(hub ? [hub] : []), ...siblings];

    // Re-frame the folder's own corner of the collection into this square.
    const xs = shown.map(node => node.x);
    const ys = shown.map(node => node.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const spanX = Math.max(0.0005, Math.max(...xs) - minX);
    const spanY = Math.max(0.0005, Math.max(...ys) - minY);
    const span = Math.max(spanX, spanY);
    const project = (node: GraphNode) => ({
        cx: PAD + ((node.x - minX) / span) * (VIEW - PAD * 2) + ((span - spanX) / span) * (VIEW - PAD * 2) * 0.5,
        cy: PAD + ((node.y - minY) / span) * (VIEW - PAD * 2) + ((span - spanY) / span) * (VIEW - PAD * 2) * 0.5,
    });

    const hue = plateColour(self.folderPath, rendition);
    const centre = hub ? project(hub) : project(self);
    const here = project(self);

    return (
        <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className={cn("block h-full w-full", className)}
            aria-hidden="true"
            focusable="false"
        >
            {/* Spokes: every one of them means the same thing the chart's do — is inside. */}
            {hub
                ? siblings.map(node => {
                      const point = project(node);
                      return (
                          <line
                              key={node.id}
                              x1={centre.cx}
                              y1={centre.cy}
                              x2={point.cx}
                              y2={point.cy}
                              stroke={hue}
                              strokeWidth="0.5"
                              opacity="0.35"
                          />
                      );
                  })
                : null}

            {hub ? (
                <circle
                    cx={centre.cx}
                    cy={centre.cy}
                    r={4 + Math.min(6, Math.sqrt(hub.weight) * 1.2)}
                    fill="none"
                    stroke={hue}
                    strokeWidth="0.7"
                    opacity="0.8"
                />
            ) : null}

            {siblings.map(node => {
                const point = project(node);
                const isSelf = node.id === path;
                return (
                    <circle
                        key={node.id}
                        cx={point.cx}
                        cy={point.cy}
                        r={radiusForMagnitude(node.object?.magnitude ?? 5) * 0.62}
                        fill={hue}
                        opacity={isSelf ? 1 : 0.45}
                    />
                );
            })}

            {/* The document this card is about, ringed. Amber only under the eye. */}
            <circle
                cx={here.cx}
                cy={here.cy}
                r={radiusForMagnitude(self.object?.magnitude ?? 5) * 0.62 + 4}
                fill="none"
                className={marked ? "text-mark" : undefined}
                stroke={marked ? "currentColor" : hue}
                strokeWidth="0.8"
                opacity={marked ? 1 : 0.7}
            />
        </svg>
    );
}
