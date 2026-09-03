import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Minus, Plus, Scan } from "lucide-react";

import { type AtlasObject, radiusForMagnitude } from "@/lib/atlas";

interface SkyChartProps {
    objects: AtlasObject[];
    /** Path of the object currently under the eye, if any. */
    activePath?: string | null;
    /** Folder name per plate number, drawn over its constellation. */
    plateNames?: Map<number, string>;
    onHover?: (object: AtlasObject | null) => void;
    onSelect?: (object: AtlasObject) => void;
    /**
     * A region of the plate to bring the eye to. Set when the collection is
     * narrowed to one folder: the constellation keeps its real place in the sky,
     * so without this the reader would have to go looking for it.
     */
    focus?: { minX: number; maxX: number; minY: number; maxY: number } | null;
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

/**
 * Where the plate is being read from: a scale and the point held at the centre.
 *
 * Zoom moves objects apart; it never draws them larger. Diameter is file size on
 * a fixed ramp, so a magnitude that grew with the zoom would be a figure the
 * product did not measure. The plate scale changes, the photometry does not.
 */
interface View {
    scale: number;
    cx: number;
    cy: number;
}

const HOME: View = { scale: 1, cx: 0.5, cy: 0.5 };
const MIN_SCALE = 1;
const MAX_SCALE = 6;
const SCALE_STEP = 1.4;

const clampView = (view: View): View => {
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale));
    // Half a viewport in world units: the centre cannot go closer to an edge
    // than that without showing space the plate does not cover.
    const margin = 0.5 / scale;
    return {
        scale,
        cx: Math.min(1 - margin, Math.max(margin, view.cx)),
        cy: Math.min(1 - margin, Math.max(margin, view.cy)),
    };
};

/**
 * The drawing surface plus the projection every mark goes through.
 *
 * Positions are normalised 0–1 and become pixels here; sizes and line widths are
 * given in pixels and stay in pixels. That split is the whole reason this is an
 * object rather than a canvas transform — a `context.scale` would take the
 * hairlines and the magnitude ramp with it.
 */
interface Plane {
    width: number;
    height: number;
    ink: Ink;
    x: (normalised: number) => number;
    y: (normalised: number) => number;
    /** 0–1 while the plate is being exposed; every mark's alpha rides on it. */
    exposure: number;
}

const planeFor = (size: { width: number; height: number }, ink: Ink, view: View, exposure = 1): Plane => ({
    width: size.width,
    height: size.height,
    ink,
    exposure,
    x: normalised => ((normalised - view.cx) * view.scale + 0.5) * size.width,
    y: normalised => ((normalised - view.cy) * view.scale + 0.5) * size.height,
});

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

/**
 * One plate, with everything about it that does not depend on the view.
 *
 * Grouping, ordering and measuring the collection is work that only changes when
 * the collection does. Doing it inside the paint meant four passes over every
 * object and a sort of every plate, sixty times a second — the difference
 * between 57fps and 60 on the largest set tried.
 */
interface PlateGroup {
    plate: number;
    /** In catalogue order, which is the order the constellation is drawn in. */
    objects: AtlasObject[];
    /** Normalised centroid and vertical extent, for placing the plate's name. */
    cx: number;
    cy: number;
    minY: number;
    maxY: number;
}

function byPlate(objects: AtlasObject[]): PlateGroup[] {
    const groups = new Map<number, AtlasObject[]>();
    for (const object of objects) {
        const group = groups.get(object.plate);
        if (group) group.push(object);
        else groups.set(object.plate, [object]);
    }

    return (
        [...groups.values()]
            .map(group => {
                let sumX = 0;
                let sumY = 0;
                let minY = 1;
                let maxY = 0;
                for (const object of group) {
                    sumX += object.x;
                    sumY += object.y;
                    minY = Math.min(minY, object.y);
                    maxY = Math.max(maxY, object.y);
                }
                return {
                    plate: group[0].plate,
                    objects: [...group].sort((first, second) => first.index - second.index),
                    cx: sumX / group.length,
                    cy: sumY / group.length,
                    minY,
                    maxY,
                };
            })
            // Largest first: the plates worth lettering are considered first.
            .sort((first, second) => second.objects.length - first.objects.length)
    );
}

/**
 * Draw the constellation for one plate: a path through its objects in catalogue
 * order, which is the folder's own ordering made visible.
 */
function drawConstellation(context: CanvasRenderingContext2D, group: PlateGroup, plane: Plane) {
    if (group.objects.length < 2) return;
    context.beginPath();
    group.objects.forEach((object, position) => {
        const pointX = plane.x(object.x);
        const pointY = plane.y(object.y);
        if (position === 0) context.moveTo(pointX, pointY);
        else context.lineTo(pointX, pointY);
    });
    context.stroke();
}

/**
 * How many constellations are lettered, and how many objects a label has to
 * dodge.
 *
 * Both caps are here because the honest version of this function does not fit in
 * a frame. Placing a label tests four candidate positions against every label
 * already placed and every plotted object; with the 2,539 plates and 7,896
 * objects an imported folder produced, that is 81 million overlap tests — 154ms
 * measured, against a 16.7ms budget, and it was the entire reason the chart could
 * not be panned. An atlas plate letters the constellations worth reading and
 * leaves the rest to the catalogue, which is also what makes it legible.
 */
const NAMED_PLATES = 32;
const LABEL_OBSTACLES = 400;

/** Everything the lettering needs, so it arrives as one argument. */
interface Naming {
    groups: PlateGroup[];
    names: Map<number, string>;
    /** Brightest first, so the obstacle list can be taken off the front. */
    brightest: AtlasObject[];
}

interface Box {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

const overlaps = (one: Box, other: Box) =>
    one.left < other.right && one.right > other.left && one.top < other.bottom && one.bottom > other.top;

/**
 * What a plate's name has to dodge: the brightest objects currently on the plate.
 *
 * `brightest` arrives sorted, so this takes off the front and stops — it never
 * walks the whole collection to find four hundred boxes.
 */
function labelObstacles(brightest: AtlasObject[], plane: Plane): Box[] {
    const { width, height } = plane;
    const stars: Box[] = [];

    for (const object of brightest) {
        if (stars.length >= LABEL_OBSTACLES) break;
        const pointX = plane.x(object.x);
        const pointY = plane.y(object.y);
        if (pointX < -20 || pointX > width + 20 || pointY < -20 || pointY > height + 20) continue;

        const radius = radiusForMagnitude(object.magnitude) + 2;
        stars.push({
            left: pointX - radius,
            right: pointX + radius,
            top: pointY - radius,
            bottom: pointY + radius,
        });
    }

    return stars;
}

/**
 * The plates worth lettering: the largest ones currently on the plate.
 *
 * `groups` arrives largest-first, so this is a scan with an early exit rather
 * than a filter and a sort of every folder in the collection.
 */
function platesToName(groups: PlateGroup[], plane: Plane): PlateGroup[] {
    const { width, height } = plane;
    const named: PlateGroup[] = [];

    for (const group of groups) {
        if (named.length >= NAMED_PLATES) break;
        const centreX = plane.x(group.cx);
        const centreY = plane.y(group.cy);
        if (centreX < -40 || centreX > width + 40 || centreY < -40 || centreY > height + 40) continue;
        named.push(group);
    }

    return named;
}

/**
 * Letter one constellation, or leave it unlettered.
 *
 * Four positions are tried — above, below, left, right — and a name is never
 * printed through another name or through a plotted object, because unreadable
 * lettering is worse than none. Returns the box it took, if it took one.
 */
function placePlateName(
    context: CanvasRenderingContext2D,
    group: PlateGroup & { label: string },
    plane: Plane,
    taken: Box[]
): Box | null {
    const { width, height } = plane;
    const half = context.measureText(group.label).width / 2;
    const centreX = Math.min(width - half - 4, Math.max(half + 4, plane.x(group.cx)));
    const top = plane.y(group.minY);
    const bottom = plane.y(group.maxY);

    const candidates: { anchor: number; textY: number; align: CanvasTextAlign }[] = [
        { anchor: centreX, textY: top - 11, align: "center" },
        { anchor: centreX, textY: bottom + 20, align: "center" },
        { anchor: centreX - half - 10, textY: (top + bottom) / 2, align: "right" },
        { anchor: centreX + half + 10, textY: (top + bottom) / 2, align: "left" },
    ];

    for (const candidate of candidates) {
        const textY = Math.min(height - 4, Math.max(11, candidate.textY));
        const left = leftEdgeOf(candidate.anchor, candidate.align, half);
        if (left < 0 || left + half * 2 > width) continue;

        const box = { left: left - 5, right: left + half * 2 + 5, top: textY - 12, bottom: textY + 4 };
        if (taken.some(other => overlaps(box, other))) continue;

        context.textAlign = candidate.align;
        context.fillText(group.label, candidate.anchor, textY);
        return box;
    }

    return null;
}

const leftEdgeOf = (anchor: number, align: CanvasTextAlign, half: number): number => {
    if (align === "center") return anchor - half;
    if (align === "right") return anchor - half * 2;
    return anchor;
};

/**
 * Constellations are named on the chart, the way an atlas plate names them.
 *
 * Only the largest constellations currently on the plate are lettered, and only
 * the brightest objects count as obstacles: those are the ones a reader would
 * see a label collide with.
 */
function drawPlateNames(context: CanvasRenderingContext2D, naming: Naming, plane: Plane) {
    context.save();
    context.font = '600 9px Archivo, "Helvetica Neue", Arial, sans-serif';
    context.textBaseline = "bottom";
    context.fillStyle = plane.ink.figure;
    context.globalAlpha = 0.85;

    const obstacles = labelObstacles(naming.brightest, plane);

    for (const group of platesToName(naming.groups, plane)) {
        const name = naming.names.get(group.plate);
        if (!name) continue;

        const label = (name.split("/").pop() ?? name).toUpperCase().split("").join(" ");
        const box = placePlateName(context, { ...group, label }, plane, obstacles);
        // A placed name becomes an obstacle for the next one.
        if (box) obstacles.push(box);
    }

    context.restore();
}

/**
 * The field the objects sit in. An atlas plate is never empty paper: it carries
 * the faint stars nobody catalogued. These are decoration and say so — they are
 * drawn from a fixed seed so the same sky comes back every time, they move only
 * with the plate itself, and they are never interactive.
 */
function drawStarField(context: CanvasRenderingContext2D, plane: Plane) {
    const density = Math.round((plane.width * plane.height) / 2600);
    let seed = 0x2f6e2b1;

    context.save();
    context.fillStyle = plane.ink.star;
    for (let index = 0; index < density; index++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const pointX = ((seed >>> 8) % 100000) / 100000;
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const pointY = ((seed >>> 8) % 100000) / 100000;
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const weight = ((seed >>> 8) % 1000) / 1000;

        context.globalAlpha = 0.05 + weight * 0.16;
        context.beginPath();
        context.arc(plane.x(pointX), plane.y(pointY), 0.4 + weight * 0.9, 0, Math.PI * 2);
        context.fill();
    }
    context.restore();
}

/**
 * The engraved layer beneath the data: soft contour bands, the trace an atlas
 * plate carries where its figures were cut. Held under the documented ceiling.
 */
function drawContours(context: CanvasRenderingContext2D, plane: Plane) {
    const { width, height, ink } = plane;

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
            // Offsets are pixels around the plate's own centre, so they go back
            // through the projection to move with it.
            const pointX = plane.x(0.5 + (Math.cos(angle) * radius * wobble * 1.35) / width);
            const pointY = plane.y(0.5 + (Math.sin(angle) * radius * wobble) / height);
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
 *
 * A line whose lettering has left the plate is drawn without it: clamping the
 * label to the edge instead would stack five declinations in one corner as soon
 * as the plate was zoomed.
 */
function drawGraticule(context: CanvasRenderingContext2D, plane: Plane) {
    const { width, height, ink } = plane;

    context.save();
    context.strokeStyle = ink.rule;
    context.lineWidth = 1;
    context.setLineDash([2, 4]);
    context.globalAlpha = 0.5;

    const declinationY = (step: number) => plane.y(step / (DECLINATIONS.length - 1));
    const hourX = (step: number) => plane.x(step / 6);

    DECLINATIONS.forEach((_, step) => {
        const lineY = Math.round(declinationY(step)) + 0.5;
        if (lineY < 0 || lineY > height) return;
        context.beginPath();
        context.moveTo(26, lineY);
        context.lineTo(width, lineY);
        context.stroke();
    });
    for (let step = 1; step < 6; step++) {
        const lineX = Math.round(hourX(step)) + 0.5;
        if (lineX < 0 || lineX > width) continue;
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
        const lineY = declinationY(step);
        if (lineY < 6 || lineY > height - 6) return;
        context.fillText(label, 0, lineY);
    });

    context.textAlign = "center";
    context.textBaseline = "bottom";
    for (let step = 1; step < 6; step++) {
        const lineX = hourX(step);
        if (lineX < 12 || lineX > width - 12) continue;
        context.fillText(`${step * 4}h`, lineX, height);
    }

    context.restore();
}

/** One catalogued object: its bloom, its point, its variable ring, its reticle. */
function drawObject(context: CanvasRenderingContext2D, object: AtlasObject, plane: Plane, isActive: boolean) {
    const { width, ink, exposure } = plane;
    const pointX = plane.x(object.x);
    const pointY = plane.y(object.y);
    const radius = radiusForMagnitude(object.magnitude);

    // Emitted light is this world's one sanctioned exception to No-Shadow, and
    // it is spent on the brightest objects and on the observer's own mark.
    if (object.magnitude <= 2) {
        const bloom = context.createRadialGradient(pointX, pointY, radius * 0.4, pointX, pointY, radius * 3.4);
        bloom.addColorStop(0, isActive ? ink.mark : ink.star);
        bloom.addColorStop(1, "transparent");
        context.globalAlpha = (0.16 - object.magnitude * 0.04) * exposure;
        context.fillStyle = bloom;
        context.beginPath();
        context.arc(pointX, pointY, radius * 3.4, 0, Math.PI * 2);
        context.fill();
    }

    context.beginPath();
    context.arc(pointX, pointY, radius, 0, Math.PI * 2);
    context.fillStyle = isActive ? ink.mark : ink.star;
    context.globalAlpha = (isActive ? 1 : 0.92 - object.magnitude * 0.07) * exposure;
    context.fill();

    if (object.variable) {
        context.globalAlpha = 0.8 * exposure;
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

const EXPOSURE_MS = 220;

export function SkyChart({ objects, activePath, plateNames, onHover, onSelect, focus, className }: SkyChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    /**
     * The live view, and the live plate under the eye, both in refs.
     *
     * Nothing that happens every frame is allowed to re-render this component:
     * the accessible overlay is one real button per object, and React
     * repositioning 7,893 of them cannot hold 60fps on any machine. Panning,
     * zooming, exposing and hovering all write here and repaint; `atHome` is the
     * only piece kept in state, because it flips once and drives the cursor and
     * the disabled controls.
     */
    const viewRef = useRef<View>(HOME);
    const eyedPlateRef = useRef<number | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const readoutRef = useRef<HTMLParagraphElement>(null);
    const [atHome, setAtHome] = useState(true);

    /**
     * The plate re-exposing: one authored moment, and only when the set of
     * objects changes — a filter applied, a folder charted, an import landing.
     * Not an idle animation; the sky here is a measurement, not a mood.
     *
     * It lives in a ref rather than in state. As state it was a dependency of the
     * paint callback, so every frame re-rendered the component and with it one DOM
     * button per object — survivable at 76, ruinous at the 7,893 an imported
     * folder produced. The loop repaints the canvas directly instead.
     */
    const exposureRef = useRef(1);
    const key = useMemo(() => objects.map(object => object.path).join("|"), [objects]);

    // The collection, prepared once. None of this depends on the view, and all of
    // it used to be recomputed inside every frame.
    const groups = useMemo(() => byPlate(objects), [objects]);
    /** Faintest first, so the bright ones are drawn last and sit on top. */
    const painted = useMemo(() => [...objects].sort((first, second) => second.magnitude - first.magnitude), [objects]);
    /** Brightest first: the obstacle list a plate's name has to dodge. */
    const brightest = useMemo(() => [...painted].reverse(), [painted]);

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

        const view = viewRef.current;
        const exposure = exposureRef.current;
        const plane = planeFor({ width, height }, readInk(frame), view, exposure);

        // The targets are laid out once at scale 1; the whole layer is placed by
        // a single transform, and `--counter` cancels the scale on each target so
        // a hit area never grows with the zoom. One style write, not one per
        // object, is what makes a pan a compositor commit instead of a re-render.
        const overlay = overlayRef.current;
        if (overlay) {
            const tx = (0.5 - view.cx * view.scale) * width;
            const ty = (0.5 - view.cy * view.scale) * height;
            overlay.style.transform = `translate(${tx}px, ${ty}px) scale(${view.scale})`;
            overlay.style.setProperty("--counter", String(1 / view.scale));
        }

        const readout = readoutRef.current;
        if (readout) {
            readout.textContent = `×${view.scale.toFixed(1)}`;
            readout.hidden = view.scale <= MIN_SCALE;
        }

        drawStarField(context, plane);
        drawContours(context, plane);
        drawGraticule(context, plane);

        // The engraved figure layer: folder constellations, faint, beneath the
        // data. The plate under the eye is drawn solid and brighter — the lines
        // were always there, and hovering asks which ones belong together.
        for (const group of groups) {
            const eyed = group.plate === eyedPlateRef.current;
            context.save();
            context.globalAlpha = (eyed ? 0.5 : Math.min(0.22, plane.ink.figureOpacity * 2.6)) * exposure;
            context.strokeStyle = eyed ? plane.ink.rule2 : plane.ink.figure;
            context.lineWidth = 1;
            context.setLineDash(eyed ? [] : [1, 3]);
            drawConstellation(context, group, plane);
            context.restore();
        }

        if (plateNames) drawPlateNames(context, { groups, names: plateNames, brightest }, plane);

        // The objects themselves, faintest first so bright ones sit on top.
        for (const object of painted) {
            drawObject(context, object, plane, object.path === activePath);
        }

        context.globalAlpha = 1;
    }, [activePath, plateNames, size, groups, painted, brightest]);

    useEffect(() => {
        paint();
    }, [paint]);

    // The exposure itself: a ramp the canvas is repainted against, with no React
    // render in the loop at all.
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            exposureRef.current = 1;
            paint();
            return undefined;
        }

        let frame = 0;
        const start = performance.now();
        const step = () => {
            const ratio = Math.min(1, (performance.now() - start) / EXPOSURE_MS);
            exposureRef.current = ratio * (2 - ratio);
            paint();
            if (ratio < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(frame);
            // A set replaced mid-exposure must not leave the next one dimmed.
            exposureRef.current = 1;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the set's identity, not every repaint
    }, [key]);

    // Repaint when the rendition changes: the ink comes from CSS custom properties.
    useEffect(() => {
        const observer = new MutationObserver(() => paint());
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, [paint]);

    /**
     * The only way the view changes. Writes the ref, repaints on the next frame,
     * and touches React state only when the "whole plate" flag actually flips.
     */
    const moveView = useCallback(
        (next: View) => {
            viewRef.current = clampView(next);
            setAtHome(was => {
                const home = viewRef.current.scale <= MIN_SCALE;
                return home === was ? was : home;
            });
            paint();
        },
        [paint]
    );

    /** Zoom about a point, so what is under the pointer stays under it. */
    const zoomAbout = useCallback(
        (factor: number, atX = 0.5, atY = 0.5) => {
            const { current } = viewRef;
            const worldX = (atX - 0.5) / current.scale + current.cx;
            const worldY = (atY - 0.5) / current.scale + current.cy;
            const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale * factor));
            moveView({ scale, cx: worldX - (atX - 0.5) / scale, cy: worldY - (atY - 0.5) / scale });
        },
        [moveView]
    );

    // Bring the eye to a region, with room around it. A margin keeps the
    // constellation off the frame's own lettering.
    const focusKey = focus ? `${focus.minX},${focus.maxX},${focus.minY},${focus.maxY}` : "";
    useEffect(() => {
        if (!focus) {
            moveView(HOME);
            return;
        }

        const spanX = Math.max(focus.maxX - focus.minX, 0.08);
        const spanY = Math.max(focus.maxY - focus.minY, 0.08);
        moveView({
            scale: Math.min(MAX_SCALE, 0.72 / Math.max(spanX, spanY)),
            cx: (focus.minX + focus.maxX) / 2,
            cy: (focus.minY + focus.maxY) / 2,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the box's values, not its identity
    }, [focusKey, moveView]);

    // Wheel has to be a non-passive listener to be preventable, which the JSX
    // prop cannot express.
    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return undefined;

        const onWheel = (event: WheelEvent) => {
            if (event.ctrlKey) return; // leave the browser's own page zoom alone
            event.preventDefault();
            const box = frame.getBoundingClientRect();
            zoomAbout(
                event.deltaY < 0 ? SCALE_STEP : 1 / SCALE_STEP,
                (event.clientX - box.left) / box.width,
                (event.clientY - box.top) / box.height
            );
        };

        frame.addEventListener("wheel", onWheel, { passive: false });
        return () => frame.removeEventListener("wheel", onWheel);
    }, [zoomAbout]);

    const drag = useRef<{ x: number; y: number } | null>(null);
    const pending = useRef(0);

    const onPointerDown = (event: React.PointerEvent) => {
        if (atHome || event.button !== 0) return;
        drag.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    // Pointer events arrive faster than frames on a high-rate mouse, so a move is
    // accumulated and applied once per frame rather than repainting per event.
    const onPointerMove = (event: React.PointerEvent) => {
        const from = drag.current;
        if (!from || size.width === 0) return;

        const { current: view } = viewRef;
        const dx = (event.clientX - from.x) / (size.width * view.scale);
        const dy = (event.clientY - from.y) / (size.height * view.scale);
        drag.current = { x: event.clientX, y: event.clientY };
        viewRef.current = clampView({ ...view, cx: view.cx - dx, cy: view.cy - dy });

        if (pending.current) return;
        pending.current = requestAnimationFrame(() => {
            pending.current = 0;
            paint();
        });
    };

    const endDrag = () => {
        drag.current = null;
    };

    /** Hovering asks which objects belong together; only the canvas need answer. */
    const eyeOn = (object: AtlasObject | null) => {
        eyedPlateRef.current = object?.plate ?? null;
        onHover?.(object);
        paint();
    };

    return (
        <div
            ref={frameRef}
            className={`${className ?? ""} overflow-hidden`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{ cursor: atHome ? undefined : "grab", touchAction: "none" }}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
                style={{ width: size.width, height: size.height }}
                role="img"
                aria-label={`Chart of ${objects.length} documents, plotted by folder and sized by file size`}
            />

            {size.width > 0 ? (
                <div
                    ref={overlayRef}
                    className="absolute inset-0"
                    style={{ transformOrigin: "0 0", ["--counter" as string]: "1" }}
                >
                    <PlateTargets objects={objects} size={size} onEye={eyeOn} onSelect={onSelect} />
                </div>
            ) : null}

            {/* The plate scale. Square, hairline, no fill until pressed — an
                instrument's controls, sitting on the plate's own corner. */}
            <div className="absolute right-3 bottom-3 flex flex-col">
                <PlateScaleButton label="Zoom in" onClick={() => zoomAbout(SCALE_STEP)} disabled={false}>
                    <Plus className="h-3 w-3" />
                </PlateScaleButton>
                <PlateScaleButton label="Zoom out" onClick={() => zoomAbout(1 / SCALE_STEP)} disabled={atHome}>
                    <Minus className="h-3 w-3" />
                </PlateScaleButton>
                <PlateScaleButton label="Whole plate" onClick={() => moveView(HOME)} disabled={atHome}>
                    <Scan className="h-3 w-3" />
                </PlateScaleButton>
            </div>

            {/* Written by the paint, not rendered by React: the readout changes
                every frame of a zoom. */}
            <p
                ref={readoutRef}
                hidden
                className="text-ink-dim figures border-rule bg-panel/80 absolute bottom-3 left-3 border px-2 py-1 text-[0.625rem] tracking-[0.08em]"
            />
        </div>
    );
}

/**
 * The accessible layer: one real focusable control per plotted object, so the
 * chart is navigable by keyboard and readable by a screen reader — ordered
 * top-to-bottom and left-to-right, so focus moves the way the eye does rather
 * than by file size.
 *
 * Laid out once, at scale 1, and memoised on the set of objects. Its parent moves
 * it with a transform; nothing in here re-renders for a pan, a zoom, a hover or
 * an exposure, which is the only way this holds a frame budget with thousands of
 * documents on the plate.
 */
const PlateTargets = memo(
    ({
        objects,
        size,
        onEye,
        onSelect,
    }: {
        objects: AtlasObject[];
        size: { width: number; height: number };
        onEye: (object: AtlasObject | null) => void;
        onSelect?: (object: AtlasObject) => void;
    }) => {
        const ordered = useMemo(
            () => [...objects].sort((first, second) => first.y - second.y || first.x - second.x),
            [objects]
        );

        return (
            <>
                {ordered.map(object => {
                    const reach = Math.max(22, radiusForMagnitude(object.magnitude) * 2 + 14);
                    return (
                        <button
                            key={object.path}
                            type="button"
                            className="focus-visible:outline-mark absolute rounded-full focus-visible:outline focus-visible:outline-offset-2"
                            style={{
                                left: object.x * size.width,
                                top: object.y * size.height,
                                width: reach,
                                height: reach,
                                // The counter-scale keeps a hit area the same size on
                                // screen however far the plate is zoomed in.
                                transform: "translate(-50%, -50%) scale(var(--counter, 1))",
                            }}
                            onMouseEnter={() => onEye(object)}
                            onMouseLeave={() => onEye(null)}
                            onFocus={() => onEye(object)}
                            onBlur={() => onEye(null)}
                            onClick={() => onSelect?.(object)}
                        >
                            <span className="sr-only">
                                {object.name}, {object.designation}
                                {object.measured ? `, magnitude ${object.magnitude}` : ", size not reported"}
                            </span>
                        </button>
                    );
                })}
            </>
        );
    }
);
PlateTargets.displayName = "PlateTargets";

function PlateScaleButton({
    label,
    onClick,
    disabled,
    children,
}: {
    label: string;
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            className="border-rule bg-panel/80 text-ink-dim hover:text-ink focus-visible:outline-mark -mt-px flex h-6 w-6 items-center justify-center border first:mt-0 focus-visible:outline focus-visible:outline-offset-1 disabled:opacity-35"
        >
            {children}
            <span className="sr-only">{label}</span>
        </button>
    );
}
