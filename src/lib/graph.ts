import {
    forceCenter,
    forceLink,
    forceManyBody,
    forceSimulation,
    forceX,
    forceY,
    type SimulationLinkDatum,
    type SimulationNodeDatum,
} from "d3-force";

import type { AtlasObject } from "@/lib/atlas";

/**
 * The collection as the graph it actually is.
 *
 * The chart used to place documents on a ring — `0.5 + cos(angle) * 0.28` — and
 * then draw a line through each folder's documents *in catalogue order*. That
 * order is alphabetical, so the lines meant nothing and crossed the whole plate
 * to say it. On a wide screen the ring left the middle empty and stretched
 * everything to the edges.
 *
 * A folder tree is a graph, so it is laid out as one. A folder is a node, a
 * document is a node, and **every edge means one thing: "is inside"**. Documents
 * gather round the folder holding them, folders round their parent, and the
 * clusters that appear are the collection's real shape rather than a decoration.
 */

/** What the layout needs to know about one document: nothing but where it lives. */
export interface LayoutSeed {
    documents: { id: string; folderPath: string }[];
}

/** A settled node before its document is attached back to it. */
export interface PlacedNode {
    id: string;
    kind: "folder" | "document";
    folderPath: string;
    label: string;
    weight: number;
    x: number;
    y: number;
}

export interface GraphNode {
    id: string;
    /** A folder is a hub; a document is a leaf. */
    kind: "folder" | "document";
    /** The document this node stands for, when it is one. */
    object: AtlasObject | null;
    /** Folder path: the identity a colour and a depth are taken from. */
    folderPath: string;
    label: string;
    /** How many documents sit at or under it. A folder's weight, measured. */
    weight: number;
    x: number;
    y: number;
}

export interface GraphEdge {
    source: string;
    target: string;
}

export interface Graph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

interface Simulated extends SimulationNodeDatum {
    id: string;
    /** Heavier nodes settle less, so a folder anchors its documents. */
    weight: number;
}

const parentOf = (path: string): string => path.split("/").slice(0, -1).join("/");

/** A folder segment as it is read, not as it is spelled on disk. */
const humanise = (segment: string): string =>
    segment
        .replace(/[-_]+/g, " ")
        .trim()
        .replace(/\b\w/g, character => character.toUpperCase());

/**
 * Build the graph and settle it.
 *
 * The simulation is run to completion here rather than animated: the layout is a
 * property of the collection, not a thing to watch happen, and a settled graph
 * can be handed to the renderer as plain positions. `alphaDecay` is set so it
 * converges in a few hundred ticks even on a large tree.
 *
 * `aspect` is the plate's width over its height. The inward pull is weaker across
 * than down by that ratio, so the cloud settles into the shape of the plate it
 * will be drawn on instead of a circle centred in a wide empty field — which is
 * what a large screen used to show.
 */
export function layoutGraph(seed: LayoutSeed, aspect = 1): Graph {
    const objects = seed.documents;
    if (objects.length === 0) return { nodes: [], edges: [] };

    // Every folder on every path, including the ones holding only folders.
    const folders = new Map<string, number>();
    for (const object of objects) {
        let path = object.folderPath;
        while (path) {
            folders.set(path, (folders.get(path) ?? 0) + 1);
            path = parentOf(path);
        }
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    /**
     * The content folder itself.
     *
     * Without it the top-level folders share no parent, so the graph is as many
     * disconnected components as there are of them — they drift apart under the
     * charge and only gravity drags them back, which is what left a large screen
     * showing islands in a lot of empty field. It is also simply true: they are
     * all inside one folder.
     */
    const ROOT = "folder:";
    nodes.push({
        id: ROOT,
        kind: "folder",
        object: null,
        folderPath: "",
        label: "",
        weight: objects.length,
        x: 0.5,
        y: 0.5,
    });

    for (const [path, weight] of folders) {
        nodes.push({
            id: `folder:${path}`,
            kind: "folder",
            object: null,
            folderPath: path,
            label: humanise(path.split("/").pop() ?? path),
            weight,
            x: 0.5,
            y: 0.5,
        });

        const parent = parentOf(path);
        edges.push({ source: `folder:${path}`, target: parent ? `folder:${parent}` : ROOT });
    }

    for (const object of objects) {
        nodes.push({
            id: object.id,
            kind: "document",
            object: null,
            folderPath: object.folderPath,
            label: "",
            weight: 1,
            x: 0.5,
            y: 0.5,
        });

        edges.push({ source: object.id, target: object.folderPath ? `folder:${object.folderPath}` : ROOT });
    }

    const simulated: Simulated[] = nodes.map(node => ({ id: node.id, weight: node.weight }));
    const index = new Map(simulated.map(node => [node.id, node]));
    const links = edges
        .map(edge => ({ source: index.get(edge.source), target: index.get(edge.target) }))
        .filter((link): link is { source: Simulated; target: Simulated } => Boolean(link.source && link.target));

    forceSimulation(simulated)
        .force(
            "link",
            forceLink<Simulated, SimulationLinkDatum<Simulated>>(links)
                .id(node => node.id)
                // A folder's own documents sit close to it; the links between
                // folders are longer, so the branches of the tree read apart.
                .distance(link =>
                    (link.source as Simulated).weight > 1 && (link.target as Simulated).weight > 1 ? 90 : 34
                )
                .strength(0.7)
        )
        // Heavier nodes push harder, so a big folder clears room for its documents.
        .force(
            "charge",
            forceManyBody().strength(node => -30 - Math.min(240, (node as Simulated).weight * 6))
        )
        .force("centre", forceCenter(0, 0))
        // A gentle pull inward keeps islands from drifting off the plate.
        .force("gravityX", forceX(0).strength(0.024 / Math.max(1, aspect)))
        .force("gravityY", forceY(0).strength(0.024 * Math.max(1, aspect)))
        .alphaDecay(0.035)
        .stop()
        .tick(400);

    // Normalise into the 0–1 box the rest of the chart works in, with a margin so
    // nothing lands against the frame's own lettering.
    const xs = simulated.map(node => node.x ?? 0);
    const ys = simulated.map(node => node.y ?? 0);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);

    for (const [position, node] of nodes.entries()) {
        const settled = simulated[position];
        node.x = 0.05 + (((settled.x ?? 0) - minX) / spanX) * 0.9;
        node.y = 0.06 + (((settled.y ?? 0) - minY) / spanY) * 0.88;
    }

    return { nodes, edges };
}
