/**
 * The chart layer: how a real file becomes a catalogued object.
 *
 * Every value here is computed from something the filesystem actually reports.
 * Nothing on a chart in this product is decorative — a bigger dot is a bigger
 * file, a ringed dot is a file touched this week, and an object's position is a
 * pure function of its path, so the same document lands in the same place every
 * time the sky is drawn.
 */

import type { FileItem } from "@/api/fileAPI";

/** Six-step magnitude ramp, in pixels. Brighter (lower) magnitude is larger. */
export const MAGNITUDE_RADIUS = [6.5, 5.5, 4.5, 3.5, 2.5, 1.75] as const;

const KIBIBYTE = 1024;
const RECENT_DAYS = 7;
const DAY_MS = 86_400_000;

export interface AtlasObject {
    /** Source record from the file API. */
    file: FileItem;
    /** Path relative to the content root, e.g. "docs/introduction.md". */
    path: string;
    /** Title as catalogued: the filename, humanised. */
    name: string;
    /** Folder holding it; "" for the root plate. */
    folder: string;
    /** Plate this object belongs to; folders are plates, root is plate 0. */
    plate: number;
    /** 1-based index of the object within its plate. */
    index: number;
    /** "PLATE 03 · OBJ 07" */
    designation: string;
    /** 0 (brightest, largest file) to 5 (faintest). Drawing always needs one. */
    magnitude: number;
    /** False for a 0-byte file: the magnitude is a drawing fallback, not a reading. */
    measured: boolean;
    /** File size in bytes, as reported. */
    size: number;
    /** Last modified, or null when the API did not report one. */
    modified: Date | null;
    /** Touched within the last 7 days — a variable object, drawn with a ring. */
    variable: boolean;
    type: "md" | "mdx";
    /** Deterministic chart position, 0..1 on both axes. */
    x: number;
    y: number;
}

/**
 * Magnitude from file size, on a fixed log2 ramp anchored at 1 KiB.
 * A 32 KiB document is magnitude 0; anything under 1 KiB is magnitude 5.
 *
 * A 0-byte file has no reading. It still needs a radius to be plotted, so this
 * returns the faintest step — but callers must use `formatMagnitude` to print
 * it, which shows nothing rather than asserting a measurement that was never
 * taken. Thirteen documents in the working set are 0 bytes.
 */
export function magnitudeFromSize(size: number): number {
    if (!size || size <= 0) return 5;
    const steps = Math.log2(size / KIBIBYTE);
    return Math.max(0, Math.min(5, 5 - Math.floor(steps)));
}

/** The ramp has six integer steps, so it is printed as one. */
export function formatMagnitude(size: number): string {
    if (!size || size <= 0) return "—";
    return String(magnitudeFromSize(size));
}

export function radiusForMagnitude(magnitude: number): number {
    return MAGNITUDE_RADIUS[Math.max(0, Math.min(5, magnitude))];
}

/** Stable 32-bit hash so an object's position never moves between renders. */
function hashPath(path: string): number {
    let hash = 2166136261;
    for (let i = 0; i < path.length; i++) {
        hash ^= path.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

/** Two independent unit values from one path. */
function scatter(path: string): { a: number; b: number } {
    const hash = hashPath(path);
    return { a: (hash & 0xffff) / 0xffff, b: ((hash >>> 16) & 0xffff) / 0xffff };
}

function humanise(filename: string): string {
    return filename
        .replace(/\.(md|mdx)$/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, character => character.toUpperCase());
}

/** Depth-first walk of the API's file tree, files only. */
function collectFiles(items: FileItem[], folder = "", into: { folder: string; file: FileItem }[] = []) {
    for (const item of items) {
        if (item.type === "folder") {
            collectFiles(item.children ?? [], folder ? `${folder}/${item.name}` : item.name, into);
        } else if (item.extension === ".md" || item.extension === ".mdx") {
            into.push({ folder, file: item });
        }
    }
    return into;
}

/**
 * Turn the file tree into the charted sky. Folders become plates numbered in
 * the order they sort; each plate gets a centroid and its objects scatter
 * around it, so members of one folder read as one constellation.
 */
export function chartCollection(files: FileItem[]): AtlasObject[] {
    const found = collectFiles(files);
    const plates = [...new Set(found.map(entry => entry.folder))].sort((first, second) => {
        if (first === "") return -1;
        if (second === "") return 1;
        return first.localeCompare(second);
    });

    const perPlate = new Map<string, number>();

    return found
        .map(({ folder, file }) => {
            const plate = plates.indexOf(folder);
            const index = (perPlate.get(folder) ?? 0) + 1;
            perPlate.set(folder, index);

            const size = file.size ?? 0;
            const modified = file.lastModified ? new Date(file.lastModified) : null;
            const spread = scatter(file.path);

            // Plate centroids sit on a ring; objects scatter inside their plate's cell.
            const angle = (plate / Math.max(1, plates.length)) * Math.PI * 2;
            const centroidX = 0.5 + Math.cos(angle) * 0.28;
            const centroidY = 0.5 + Math.sin(angle) * 0.3;

            return {
                file,
                path: file.path,
                name: humanise(file.originalName ?? file.name),
                folder,
                plate,
                index,
                designation: `PLATE ${String(plate).padStart(2, "0")} · OBJ ${String(index).padStart(2, "0")}`,
                magnitude: magnitudeFromSize(size),
                measured: size > 0,
                size,
                modified,
                variable: modified ? Date.now() - modified.getTime() < RECENT_DAYS * DAY_MS : false,
                type: file.extension === ".mdx" ? ("mdx" as const) : ("md" as const),
                x: Math.min(0.97, Math.max(0.03, centroidX + (spread.a - 0.5) * 0.3)),
                y: Math.min(0.95, Math.max(0.05, centroidY + (spread.b - 0.5) * 0.3)),
            };
        })
        .sort((first, second) => first.magnitude - second.magnitude || first.name.localeCompare(second.name));
}

export interface Plate {
    plate: number;
    folder: string;
    count: number;
    /** Mean position of the plate's objects: where its constellation sits. */
    centroidY: number;
}

/** Plate names in chart order, so a legend can label the constellations. */
export function platesOf(objects: AtlasObject[]): Plate[] {
    const byPlate = new Map<number, { plate: number; folder: string; count: number; sumY: number }>();
    for (const object of objects) {
        const entry = byPlate.get(object.plate);
        if (entry) {
            entry.count += 1;
            entry.sumY += object.y;
        } else {
            byPlate.set(object.plate, {
                plate: object.plate,
                folder: object.folder || "root",
                count: 1,
                sumY: object.y,
            });
        }
    }
    return [...byPlate.values()]
        .map(({ plate, folder, count, sumY }) => ({ plate, folder, count, centroidY: sumY / count }))
        .sort((first, second) => first.plate - second.plate);
}

const SIZE_UNITS = ["B", "KB", "MB"] as const;

export function formatSize(bytes: number): string {
    if (!bytes) return "—";
    let value = bytes;
    let unit = 0;
    while (value >= KIBIBYTE && unit < SIZE_UNITS.length - 1) {
        value /= KIBIBYTE;
        unit += 1;
    }
    return `${value < 10 && unit > 0 ? value.toFixed(1) : Math.round(value)} ${SIZE_UNITS[unit]}`;
}

export function formatEpoch(date: Date | null): string {
    if (!date) return "—";
    return date.toISOString().slice(0, 10).replace(/-/g, ".");
}
