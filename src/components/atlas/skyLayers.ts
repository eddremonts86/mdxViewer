import { type AtlasObject, radiusForMagnitude } from "@/lib/atlas";
import type { Graph, GraphNode } from "@/lib/graph";

import { LineLayer, PathLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";

/**
 * The plate, as deck.gl layers, in three dimensions.
 *
 * World units are the plate's own pixels, so the composition on screen is the
 * one that was designed; the third axis is the folder tree's own depth, one step
 * back per level. That is the whole reason this is 3D rather than a 3D-looking
 * 2D: turning the plate shows you how deeply the collection is nested, which is
 * a real property of the folder and not an effect.
 *
 * Two channels carry two different things, and they must not be confused:
 * **size is the measurement** — diameter is file size on the fixed magnitude
 * ramp — and **colour is identity**, one hue per folder. Amber stays the
 * observer's alone.
 *
 * Radii are world units, so objects grow as the camera comes in. That is not a
 * figure the product did not measure: scaling every radius by the same factor
 * leaves the ratios between them exactly on the ramp, which is what the ramp
 * encodes. Pixel radii were the earlier choice and they made a 3D scene read as
 * a flat sticker sheet.
 */

export interface Ink {
    star: string;
    ruleBright: string;
    figure: string;
    figureOpacity: number;
    rule: string;
    mark: string;
    /** Saturation and lightness the folder hues are drawn at in this rendition. */
    plateSaturation: number;
    plateLightness: number;
}

export type Rgba = [number, number, number, number];

/** CSS hex from a token to the byte array deck.gl wants. */
export function rgba(hex: string, alpha = 1): Rgba {
    const value = hex.replace("#", "");
    const full =
        value.length === 3
            ? value
                  .split("")
                  .map(character => character + character)
                  .join("")
            : value;
    return [
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16),
        Math.round(alpha * 255),
    ];
}

const GOLDEN_ANGLE = 137.508;

/**
 * A folder's own hue.
 *
 * Taken from the path so it is stable — the same folder is the same colour in
 * every session, on every machine — and spaced by the golden angle so two
 * folders next to each other in the tree never land on neighbouring hues.
 * Saturation and lightness come from the rendition, not from the hash, so the
 * set reads as one palette rather than as confetti.
 */
export function plateHue(folder: string): number {
    let hash = 0;
    for (let index = 0; index < folder.length; index++) {
        hash = (Math.imul(hash, 31) + folder.charCodeAt(index)) >>> 0;
    }
    return ((hash % 360) * GOLDEN_ANGLE) % 360;
}

/** HSL to the byte array deck.gl wants. */
export function hsla(hue: number, saturation: number, lightness: number, alpha = 1): Rgba {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const second = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
    const match = lightness - chroma / 2;

    const sector = Math.floor(hue / 60) % 6;
    const [red, green, blue] = [
        [chroma, second, 0],
        [second, chroma, 0],
        [0, chroma, second],
        [0, second, chroma],
        [second, 0, chroma],
        [chroma, 0, second],
    ][sector];

    return [
        Math.round((red + match) * 255),
        Math.round((green + match) * 255),
        Math.round((blue + match) * 255),
        Math.round(alpha * 255),
    ];
}

export const colourOf = (ink: Ink, folder: string, alpha = 1): Rgba =>
    hsla(plateHue(folder), ink.plateSaturation, ink.plateLightness, alpha);

/** One step back per level of nesting, in world units. */
export const DEPTH_STEP = 90;

export const levelOf = (folder: string): number => (folder ? folder.split("/").length : 0);

export const depthOf = (folder: string): number => -levelOf(folder) * DEPTH_STEP;

/**
 * How present a level is, seen from `focal`.
 *
 * Pulled back — the whole collection in view — every level is equally present
 * and the reader sees all of it. Coming in, the levels the eye is not at recede
 * rather than vanish, so the depth is something you move through instead of a
 * picture you look at. A level is still visible at a third of its strength, so
 * nothing is ever secretly gone.
 */
export function levelPresence(level: number, focal: number | null): number {
    if (focal === null) return 1;
    const distance = Math.abs(level - focal);
    if (distance === 0) return 1;
    return Math.max(0.16, 1 - distance * 0.42);
}

export interface Field {
    width: number;
    height: number;
    ink: Ink;
    /**
     * The nesting level the eye is at, or null while the whole collection is in
     * view. Quantised on purpose: it changes when a level is crossed, not on
     * every frame of a move, so the colour attributes are re-uploaded a handful
     * of times rather than sixty times a second.
     */
    focalLevel: number | null;
}

/** A graph node in world units, at the depth its folder sits. */
const place = (field: Field, node: GraphNode): [number, number, number] => [
    node.x * field.width,
    node.y * field.height,
    depthOf(node.folderPath),
];

const flat = (field: Field, nx: number, ny: number, z = 0): [number, number, number] => [
    nx * field.width,
    ny * field.height,
    z,
];

/**
 * The faint stars nobody catalogued: an atlas plate is never empty paper.
 *
 * A fixed seed, so the same sky comes back every time; scattered through the
 * depth the plates occupy so turning the view moves through them, and never
 * interactive.
 */
export function fieldStars(field: Field) {
    const density = Math.round((field.width * field.height) / 2600);
    const stars: { position: [number, number, number]; radius: number; alpha: number }[] = [];
    let seed = 0x2f6e2b1;
    const next = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return ((seed >>> 8) % 100000) / 100000;
    };

    for (let index = 0; index < density; index++) {
        const pointX = next();
        const pointY = next();
        const pointZ = next();
        const weight = next();

        stars.push({
            position: flat(field, pointX, pointY, -pointZ * DEPTH_STEP * 8),
            radius: 0.4 + weight * 0.9,
            alpha: 0.05 + weight * 0.16,
        });
    }

    return new ScatterplotLayer<(typeof stars)[number]>({
        id: "uncatalogued-field",
        data: stars,
        pickable: false,
        billboard: true,
        radiusUnits: "pixels",
        getPosition: star => star.position,
        getRadius: star => star.radius,
        getFillColor: star => rgba(field.ink.star, star.alpha),
    });
}

/**
 * The ruled floor: a grid on the plane the root plate sits on, receding with the
 * tree's depth. In three dimensions this is what the flat graticule was for —
 * the marks that make a field read as an instrument rather than as space.
 */
export function grid(field: Field, deepest: number) {
    const lines: { path: [number, number, number][] }[] = [];
    const back = Math.min(deepest, -DEPTH_STEP) - DEPTH_STEP;

    for (let step = 0; step <= 6; step++) {
        const nx = step / 6;
        lines.push({ path: [flat(field, nx, 0.5, 0), flat(field, nx, 0.5, back)] });
    }
    // One rule per level of nesting, so the depth is countable and not just felt.
    for (let level = 0; level * -DEPTH_STEP >= back; level++) {
        const z = -level * DEPTH_STEP;
        lines.push({ path: [flat(field, 0, 0.5, z), flat(field, 1, 0.5, z)] });
    }

    return new PathLayer<(typeof lines)[number]>({
        id: "grid",
        data: lines,
        pickable: false,
        widthUnits: "pixels",
        getWidth: 1,
        getPath: line => line.path,
        getColor: rgba(field.ink.rule, 0.45),
    });
}

/**
 * The edges, and the one thing they mean: **is inside**.
 *
 * What was here before drew a line through each folder's documents in catalogue
 * order — alphabetical, so the line said nothing and crossed the whole plate to
 * say it. An edge now joins a document to the folder holding it, and a folder to
 * its parent. The clusters that appear are the collection's real shape.
 */
export function containment(field: Field, graph: Graph, eyedFolder: string | null) {
    const at = new Map(graph.nodes.map(node => [node.id, node]));
    const drawn = graph.edges
        .map(edge => {
            const source = at.get(edge.source);
            const target = at.get(edge.target);
            return source && target ? { source, target } : null;
        })
        .filter((edge): edge is { source: GraphNode; target: GraphNode } => edge !== null);

    return new LineLayer<(typeof drawn)[number]>({
        id: "containment",
        data: drawn,
        pickable: false,
        widthUnits: "pixels",
        getWidth: edge => (edge.source.folderPath === eyedFolder || edge.target.folderPath === eyedFolder ? 1.4 : 0.8),
        getSourcePosition: edge => place(field, edge.source),
        getTargetPosition: edge => place(field, edge.target),
        // An edge is drawn in the hue of what it holds, so a branch reads as one
        // family of colour rather than as grey wiring.
        getColor: edge =>
            colourOf(
                field.ink,
                edge.target.folderPath,
                (edge.source.folderPath === eyedFolder || edge.target.folderPath === eyedFolder ? 0.7 : 0.22) *
                    levelPresence(levelOf(edge.target.folderPath), field.focalLevel)
            ),
        updateTriggers: { getColor: [eyedFolder, field.focalLevel], getWidth: eyedFolder },
    });
}

/**
 * The folders themselves: the hubs the documents hang from.
 *
 * Drawn hollow, so a folder reads as a place rather than as a bigger document,
 * and sized by how many documents sit at or under it — a folder's weight, which
 * is a real count and not a decoration.
 */
export function hubs(field: Field, graph: Graph, eyedFolder: string | null) {
    const folders = graph.nodes.filter(node => node.kind === "folder");

    return new ScatterplotLayer<GraphNode>({
        id: "hubs",
        data: folders,
        pickable: true,
        billboard: true,
        radiusUnits: "common",
        radiusMinPixels: 3,
        radiusMaxPixels: 40,
        lineWidthUnits: "pixels",
        filled: false,
        stroked: true,
        getPosition: node => place(field, node),
        getRadius: node => 4 + Math.min(14, Math.sqrt(node.weight) * 2.4),
        getLineWidth: node => (node.folderPath === eyedFolder ? 1.6 : 1),
        getLineColor: node =>
            colourOf(
                field.ink,
                node.folderPath,
                (node.folderPath === eyedFolder ? 1 : 0.75) * levelPresence(levelOf(node.folderPath), field.focalLevel)
            ),
        updateTriggers: { getLineColor: [eyedFolder, field.focalLevel], getLineWidth: eyedFolder },
    });
}

/**
 * Emitted light: a soft halo on the brightest objects, in the folder's own hue.
 * A wide, nearly transparent billboard rather than a radial gradient, which is
 * what a GPU draws for free.
 */
export function blooms(field: Field, documents: GraphNode[], activePath: string | null) {
    const bright = documents.filter(node => (node.object?.magnitude ?? 5) <= 2);

    return new ScatterplotLayer<GraphNode>({
        id: "blooms",
        data: bright,
        pickable: false,
        billboard: true,
        radiusUnits: "common",
        radiusMinPixels: 2,
        radiusMaxPixels: 140,
        getPosition: node => place(field, node),
        getRadius: node => radiusForMagnitude(node.object?.magnitude ?? 5) * 3.4,
        getFillColor: node =>
            node.id === activePath
                ? rgba(field.ink.mark, 0.22)
                : colourOf(
                      field.ink,
                      node.folderPath,
                      (0.16 - (node.object?.magnitude ?? 5) * 0.035) *
                          levelPresence(levelOf(node.folderPath), field.focalLevel)
                  ),
        updateTriggers: { getFillColor: [activePath, field.focalLevel] },
    });
}

/** The catalogued objects themselves, each in its folder's hue. */
export function catalogue(
    field: Field,
    documents: GraphNode[],
    activePath: string | null,
    handlers: {
        onHover: (object: AtlasObject | null) => void;
        onSelect?: (object: AtlasObject) => void;
    }
) {
    return new ScatterplotLayer<GraphNode>({
        id: "catalogue",
        data: documents,
        // Picking happens on the GPU, so hovering a point costs one read of one
        // pixel however many thousand are plotted.
        pickable: true,
        billboard: true,
        radiusUnits: "common",
        radiusMinPixels: 1.5,
        radiusMaxPixels: 60,
        lineWidthUnits: "pixels",
        stroked: true,
        getPosition: node => place(field, node),
        // Size is the measurement and colour is the identity: diameter stays the
        // file's own size on the fixed ramp whatever hue it is drawn in.
        getRadius: node => radiusForMagnitude(node.object?.magnitude ?? 5),
        getFillColor: node =>
            node.id === activePath
                ? rgba(field.ink.mark)
                : colourOf(field.ink, node.folderPath, levelPresence(levelOf(node.folderPath), field.focalLevel)),
        // A document modified in the last seven days wears a ring: the atlas
        // convention for a variable object.
        getLineWidth: node => (node.object?.variable || node.id === activePath ? 1 : 0),
        getLineColor: rgba(field.ink.mark, 0.85),
        onHover: info => handlers.onHover((info.object as GraphNode | undefined)?.object ?? null),
        onClick: info => {
            const node = info.object as GraphNode | undefined;
            if (node?.object) handlers.onSelect?.(node.object);
        },
        updateTriggers: { getFillColor: [activePath, field.focalLevel], getLineWidth: activePath },
    });
}

/** The reticle: exactly one per screen, on the object under the eye. */
export function reticle(field: Field, node: GraphNode | null) {
    return new ScatterplotLayer<GraphNode>({
        id: "reticle",
        data: node ? [node] : [],
        pickable: false,
        billboard: true,
        radiusUnits: "common",
        radiusMinPixels: 9,
        radiusMaxPixels: 90,
        lineWidthUnits: "pixels",
        filled: false,
        stroked: true,
        getPosition: eyed => place(field, eyed),
        getRadius: eyed => radiusForMagnitude(eyed.object?.magnitude ?? 5) + 7,
        getLineWidth: 1,
        getLineColor: rgba(field.ink.mark),
    });
}

/** The object under the eye is named on the chart, not only in the rail. */
export function eyedName(field: Field, node: GraphNode | null) {
    return new TextLayer<GraphNode>({
        id: "eyed-name",
        data: node ? [node] : [],
        pickable: false,
        billboard: true,
        getText: eyed => eyed.label,
        getPosition: eyed => place(field, eyed),
        getPixelOffset: eyed => [radiusForMagnitude(eyed.object?.magnitude ?? 5) + 14, 0],
        getSize: 12,
        sizeUnits: "pixels",
        getColor: rgba(field.ink.mark),
        getTextAnchor: "start",
        getAlignmentBaseline: "center",
        fontFamily: '"Bodoni Moda", Didot, Georgia, serif',
        fontWeight: 500,
        characterSet: "auto",
    });
}

/**
 * How many constellations are lettered.
 *
 * An atlas plate letters the constellations worth reading and leaves the rest to
 * the catalogue — which is also what keeps it legible. The 2,539 plates an
 * imported folder produced could never all be read.
 */
export const NAMED_PLATES = 32;

interface Box {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

const overlaps = (one: Box, other: Box) =>
    one.left < other.right && one.right > other.left && one.top < other.bottom && one.bottom > other.top;

/**
 * Folder names, in their own hue, sitting on the hub they name.
 *
 * deck.gl will happily draw one label through another, and the dense middle of a
 * settled graph is exactly where the heaviest folders land — so a name is
 * dropped when its box would cross one already placed. An unreadable pile of
 * lettering is worse than a name left off; the catalogue has all of them anyway.
 */
export function plateNames(field: Field, graph: Graph) {
    const placed: Box[] = [];
    const marks: { text: string; position: [number, number, number]; folderPath: string }[] = [];

    for (const node of [...graph.nodes]
        .filter(candidate => candidate.kind === "folder")
        .sort((first, second) => second.weight - first.weight)) {
        if (marks.length >= NAMED_PLATES) break;

        const text = node.label.toUpperCase().split("").join(" ");
        // 5px a character at 9px tracked capitals is close enough to reserve by.
        const half = text.length * 2.6;
        const centreX = node.x * field.width;
        const centreY = node.y * field.height;
        const box = { left: centreX - half, right: centreX + half, top: centreY - 22, bottom: centreY - 8 };

        if (placed.some(other => overlaps(box, other))) continue;

        placed.push(box);
        marks.push({ text, position: place(field, node), folderPath: node.folderPath });
    }

    return new TextLayer<(typeof marks)[number]>({
        id: "plate-names",
        data: marks,
        pickable: false,
        billboard: true,
        getText: mark => mark.text,
        getPosition: mark => mark.position,
        getPixelOffset: [0, -16],
        getSize: 9,
        sizeUnits: "pixels",
        getColor: mark =>
            colourOf(field.ink, mark.folderPath, 0.95 * levelPresence(levelOf(mark.folderPath), field.focalLevel)),
        updateTriggers: { getColor: field.focalLevel },
        getTextAnchor: "middle",
        getAlignmentBaseline: "bottom",
        fontFamily: 'Archivo, "Helvetica Neue", Arial, sans-serif',
        fontWeight: 600,
        characterSet: "auto",
    });
}
