import { useCallback, useEffect, useRef, useState } from "react";

import { type AtlasObject, radiusForMagnitude } from "@/lib/atlas";

interface SkyChartProps {
    objects: AtlasObject[];
    /** Path of the object currently under the eye, if any. */
    activePath?: string | null;
    /** Folder name per plate number, drawn over its constellation. */
    plateNames?: Map<number, string>;
    onHover?: (object: AtlasObject | null) => void;
    onSelect?: (object: AtlasObject) => void;
    className?: string;
}

interface Ink {
    star: string;
    rule2: string;
    figure: string;
    figureOpacity: number;
    rule: string;
    mark: string;
    sky: string;
}

function readInk(element: HTMLElement): Ink {
    const styles = getComputedStyle(element);
    const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
    return {
        star: read("--star", "#f2f2e9"),
        rule2: read("--rule-bright", "#5a6477"),
        figure: read("--figure", "#7b93b8"),
        figureOpacity: Number(read("--figure-opacity", "0.08")),
        rule: read("--rule", "#2b3a52"),
        mark: read("--mark", "#ff4d2e"),
        sky: read("--sky", "#0a1021"),
    };
}

/** Objects grouped by plate, so each folder can be drawn as one constellation. */
function byPlate(objects: AtlasObject[]): AtlasObject[][] {
    const groups = new Map<number, AtlasObject[]>();
    for (const object of objects) {
        const group = groups.get(object.plate);
        if (group) group.push(object);
        else groups.set(object.plate, [object]);
    }
    return [...groups.values()];
}

/**
 * Draw the constellation for one plate: a path through its objects in catalogue
 * order, which is the folder's own ordering made visible.
 */
function drawConstellation(context: CanvasRenderingContext2D, group: AtlasObject[], width: number, height: number) {
    if (group.length < 2) return;
    const ordered = [...group].sort((first, second) => first.index - second.index);
    context.beginPath();
    ordered.forEach((object, position) => {
        const pointX = object.x * width;
        const pointY = object.y * height;
        if (position === 0) context.moveTo(pointX, pointY);
        else context.lineTo(pointX, pointY);
    });
    context.stroke();
}

/**
 * Constellations are named on the chart, the way an atlas plate names them.
 * Four positions are tried before a name is given up, and a name is never
 * printed through a plotted object — unreadable lettering is worse than none.
 */
function drawPlateNames(
    context: CanvasRenderingContext2D,
    groups: AtlasObject[][],
    names: Map<number, string>,
    frame: { width: number; height: number; ink: Ink }
) {
    const { width, height, ink } = frame;

    context.save();
    context.font = '600 9px Archivo, "Helvetica Neue", Arial, sans-serif';
    context.textBaseline = "bottom";
    context.fillStyle = ink.figure;
    context.globalAlpha = 0.85;

    interface Box {
        left: number;
        right: number;
        top: number;
        bottom: number;
    }
    const overlaps = (one: Box, other: Box) =>
        one.left < other.right && one.right > other.left && one.top < other.bottom && one.bottom > other.top;

    // Every plotted object is an obstacle: lettering drawn through a star is
    // worse than lettering left off.
    const stars: Box[] = groups.flat().map(object => {
        const radius = radiusForMagnitude(object.magnitude) + 2;
        return {
            left: object.x * width - radius,
            right: object.x * width + radius,
            top: object.y * height - radius,
            bottom: object.y * height + radius,
        };
    });

    const placed: Box[] = [];
    const ordered = [...groups].sort((first, second) => second.length - first.length);

    for (const group of ordered) {
        const name = names.get(group[0].plate);
        if (!name) continue;

        const label = (name.split("/").pop() ?? name).toUpperCase().split("").join(" ");
        const half = context.measureText(label).width / 2;
        const centreX = Math.min(
            width - half - 4,
            Math.max(half + 4, (group.reduce((sum, object) => sum + object.x, 0) / group.length) * width)
        );
        const top = Math.min(...group.map(object => object.y)) * height;
        const bottom = Math.max(...group.map(object => object.y)) * height;

        const candidates: { anchor: number; textY: number; align: CanvasTextAlign }[] = [
            { anchor: centreX, textY: top - 11, align: "center" },
            { anchor: centreX, textY: bottom + 20, align: "center" },
            { anchor: centreX - half - 10, textY: (top + bottom) / 2, align: "right" },
            { anchor: centreX + half + 10, textY: (top + bottom) / 2, align: "left" },
        ];

        for (const candidate of candidates) {
            const textY = Math.min(height - 4, Math.max(11, candidate.textY));
            const left =
                candidate.align === "center"
                    ? candidate.anchor - half
                    : candidate.align === "right"
                      ? candidate.anchor - half * 2
                      : candidate.anchor;
            if (left < 0 || left + half * 2 > width) continue;

            const box = { left: left - 5, right: left + half * 2 + 5, top: textY - 12, bottom: textY + 4 };
            if (placed.some(other => overlaps(box, other)) || stars.some(star => overlaps(box, star))) continue;

            placed.push(box);
            context.textAlign = candidate.align;
            context.fillText(label, candidate.anchor, textY);
            break;
        }
    }

    context.restore();
}

/**
 * The field the objects sit in. An atlas plate is never empty paper: it carries
 * the faint stars nobody catalogued. These are decoration and say so — they are
 * drawn from a fixed seed so they never move, and they are never interactive.
 */
function drawStarField(context: CanvasRenderingContext2D, width: number, height: number, ink: Ink) {
    const density = Math.round((width * height) / 2600);
    let seed = 0x2f6e2b1;

    context.save();
    context.fillStyle = ink.star;
    for (let index = 0; index < density; index++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const pointX = ((seed >>> 8) % 100000) / 100000;
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const pointY = ((seed >>> 8) % 100000) / 100000;
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const weight = ((seed >>> 8) % 1000) / 1000;

        context.globalAlpha = 0.05 + weight * 0.16;
        context.beginPath();
        context.arc(pointX * width, pointY * height, 0.4 + weight * 0.9, 0, Math.PI * 2);
        context.fill();
    }
    context.restore();
}

/**
 * The engraved layer beneath the data: soft contour bands, the trace an atlas
 * plate carries where its figures were cut. Held under the documented ceiling.
 */
function drawContours(context: CanvasRenderingContext2D, width: number, height: number, ink: Ink) {
    context.save();
    context.strokeStyle = ink.figure;
    context.globalAlpha = ink.figureOpacity * 0.7;
    context.lineWidth = 1;

    const bands = 5;
    for (let band = 0; band < bands; band++) {
        const radius = (Math.min(width, height) / 2) * (0.28 + band * 0.13);
        context.beginPath();
        for (let step = 0; step <= 72; step++) {
            const angle = (step / 72) * Math.PI * 2;
            const wobble = 1 + Math.sin(angle * (2 + band) + band) * 0.05;
            const pointX = width / 2 + Math.cos(angle) * radius * wobble * 1.35;
            const pointY = height / 2 + Math.sin(angle) * radius * wobble;
            if (step === 0) context.moveTo(pointX, pointY);
            else context.lineTo(pointX, pointY);
        }
        context.closePath();
        context.stroke();
    }
    context.restore();
}

const DECLINATIONS = ["+60", "+30", "0", "−30", "−60"];

/**
 * The ruled graticule with its lettering. Numbers on the frame are what make a
 * plate read as an instrument; an unlabelled grid reads as a background.
 */
function drawGraticule(context: CanvasRenderingContext2D, width: number, height: number, ink: Ink) {
    context.save();
    context.strokeStyle = ink.rule;
    context.lineWidth = 1;
    context.setLineDash([2, 4]);
    context.globalAlpha = 0.5;

    DECLINATIONS.forEach((_, step) => {
        const lineY = Math.round((height / (DECLINATIONS.length - 1)) * step) + 0.5;
        context.beginPath();
        context.moveTo(26, lineY);
        context.lineTo(width, lineY);
        context.stroke();
    });
    for (let step = 1; step < 6; step++) {
        const lineX = Math.round((width / 6) * step) + 0.5;
        context.beginPath();
        context.moveTo(lineX, 0);
        context.lineTo(lineX, height - 14);
        context.stroke();
    }

    context.setLineDash([]);
    context.globalAlpha = 0.9;
    context.fillStyle = ink.rule2;
    context.font = '500 8px Archivo, "Helvetica Neue", Arial, sans-serif';
    context.textAlign = "left";
    context.textBaseline = "middle";
    DECLINATIONS.forEach((label, step) => {
        const lineY = (height / (DECLINATIONS.length - 1)) * step;
        context.fillText(label, 0, Math.min(height - 6, Math.max(6, lineY)));
    });

    context.textAlign = "center";
    context.textBaseline = "bottom";
    for (let step = 1; step < 6; step++) {
        context.fillText(`${step * 4}h`, (width / 6) * step, height);
    }

    context.restore();
}

/** One catalogued object: its bloom, its point, its variable ring, its reticle. */
function drawObject(
    context: CanvasRenderingContext2D,
    object: AtlasObject,
    frame: { width: number; height: number; ink: Ink },
    isActive: boolean
) {
    const { width, height, ink } = frame;
    const pointX = object.x * width;
    const pointY = object.y * height;
    const radius = radiusForMagnitude(object.magnitude);

    // Emitted light is this world's one sanctioned exception to No-Shadow, and
    // it is spent on the brightest objects and on the observer's own mark.
    if (object.magnitude <= 2) {
        const bloom = context.createRadialGradient(pointX, pointY, radius * 0.4, pointX, pointY, radius * 3.4);
        bloom.addColorStop(0, isActive ? ink.mark : ink.star);
        bloom.addColorStop(1, "transparent");
        context.globalAlpha = 0.16 - object.magnitude * 0.04;
        context.fillStyle = bloom;
        context.beginPath();
        context.arc(pointX, pointY, radius * 3.4, 0, Math.PI * 2);
        context.fill();
    }

    context.beginPath();
    context.arc(pointX, pointY, radius, 0, Math.PI * 2);
    context.fillStyle = isActive ? ink.mark : ink.star;
    context.globalAlpha = isActive ? 1 : 0.92 - object.magnitude * 0.07;
    context.fill();

    if (object.variable) {
        context.globalAlpha = 0.8;
        context.beginPath();
        context.arc(pointX, pointY, radius + 3.5, 0, Math.PI * 2);
        context.strokeStyle = ink.mark;
        context.lineWidth = 1;
        context.setLineDash([]);
        context.stroke();
    }

    if (!isActive) {
        context.globalAlpha = 1;
        return;
    }

    context.globalAlpha = 1;
    context.strokeStyle = ink.mark;
    context.lineWidth = 1;
    context.setLineDash([]);
    context.shadowColor = ink.mark;
    context.shadowBlur = 10;
    context.beginPath();
    context.arc(pointX, pointY, radius + 7, 0, Math.PI * 2);
    context.stroke();
    context.shadowBlur = 0;

    // The object under the eye is named on the chart, not only in the rail.
    context.font = 'italic 500 12px "Bodoni Moda", Didot, Georgia, serif';
    context.textBaseline = "middle";
    const labelLeft = pointX + radius + 14;
    const fitsRight = labelLeft + context.measureText(object.name).width < width;
    context.textAlign = fitsRight ? "left" : "right";
    context.fillStyle = ink.mark;
    context.fillText(object.name, fitsRight ? labelLeft : pointX - radius - 14, pointY);

    for (const angle of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
        context.beginPath();
        context.moveTo(pointX + Math.cos(angle) * (radius + 4), pointY + Math.sin(angle) * (radius + 4));
        context.lineTo(pointX + Math.cos(angle) * (radius + 11), pointY + Math.sin(angle) * (radius + 11));
        context.stroke();
    }
}

export function SkyChart({ objects, activePath, plateNames, onHover, onSelect, className }: SkyChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return undefined;
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
            }
        });
        observer.observe(frame);
        return () => observer.disconnect();
    }, []);

    const paint = useCallback(() => {
        const canvas = canvasRef.current;
        const frame = frameRef.current;
        if (!canvas || !frame || size.width === 0) return;

        const ratio = window.devicePixelRatio || 1;
        const { width, height } = size;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);

        const context = canvas.getContext("2d");
        if (!context) return;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, width, height);

        const ink = readInk(frame);

        drawStarField(context, width, height, ink);
        drawContours(context, width, height, ink);
        drawGraticule(context, width, height, ink);

        // The engraved figure layer: folder constellations, faint, beneath the data.
        context.save();
        context.globalAlpha = Math.min(0.22, ink.figureOpacity * 2.6);
        context.strokeStyle = ink.figure;
        context.lineWidth = 1;
        context.setLineDash([1, 3]);
        const groups = byPlate(objects);
        for (const group of groups) drawConstellation(context, group, width, height);
        context.restore();

        if (plateNames) drawPlateNames(context, groups, plateNames, { width, height, ink });

        // The objects themselves, faintest first so bright ones sit on top.
        for (const object of [...objects].sort((first, second) => second.magnitude - first.magnitude)) {
            drawObject(context, object, { width, height, ink }, object.path === activePath);
        }

        context.globalAlpha = 1;
    }, [objects, activePath, plateNames, size]);

    useEffect(() => {
        paint();
    }, [paint]);

    // Repaint when the rendition changes: the ink comes from CSS custom properties.
    useEffect(() => {
        const observer = new MutationObserver(() => paint());
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, [paint]);

    return (
        <div ref={frameRef} className={className}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
                style={{ width: size.width, height: size.height }}
                role="img"
                aria-label={`Chart of ${objects.length} documents, plotted by folder and sized by file size`}
            />
            {/* Every plotted object is a real focusable control, so the chart is
                navigable by keyboard and readable by a screen reader — ordered
                top-to-bottom and left-to-right, so focus moves the way the eye
                does rather than by file size. */}
            {size.width > 0 &&
                [...objects]
                    .sort((first, second) => first.y - second.y || first.x - second.x)
                    .map(object => (
                        <button
                            key={object.path}
                            type="button"
                            className="focus-visible:outline-mark absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline focus-visible:outline-offset-2"
                            style={{
                                left: object.x * size.width,
                                top: object.y * size.height,
                                width: Math.max(22, radiusForMagnitude(object.magnitude) * 2 + 14),
                                height: Math.max(22, radiusForMagnitude(object.magnitude) * 2 + 14),
                            }}
                            onMouseEnter={() => onHover?.(object)}
                            onMouseLeave={() => onHover?.(null)}
                            onFocus={() => onHover?.(object)}
                            onBlur={() => onHover?.(null)}
                            onClick={() => onSelect?.(object)}
                        >
                            <span className="sr-only">
                                {object.name}, {object.designation}
                                {object.measured ? `, magnitude ${object.magnitude}` : ", size not reported"}
                            </span>
                        </button>
                    ))}
        </div>
    );
}
