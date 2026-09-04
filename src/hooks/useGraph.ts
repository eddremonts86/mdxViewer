import { useEffect, useMemo, useRef, useState } from "react";

import type { AtlasObject } from "@/lib/atlas";
import { type Graph, type GraphNode, layoutGraph, type LayoutSeed } from "@/lib/graph";

/**
 * The settled collection.
 *
 * A small collection settles in a few milliseconds, so it is laid out inline and
 * there is nothing to wait for. A large one does not: 1,900 nodes take about a
 * second, and doing that on the thread that draws left the chart blank and the
 * whole app frozen — the state an imported folder actually put it in. Past the
 * threshold the work goes to a worker and the surface says it is settling.
 *
 * **The worker is started once per collection and nothing else may restart it.**
 * Keying the effect on the seed object and the live aspect ratio meant a mounting
 * page started five workers, each one terminated by the next before it could
 * finish its second of work — so the chart said "settling" forever. The key is a
 * signature of the document paths, and the aspect is read from a ref at the
 * moment the worker starts: it only has to be roughly right, and a window resize
 * has no business throwing the layout away.
 */
const INLINE_LIMIT = 400;

const EMPTY: Graph = { nodes: [], edges: [] };

export function useGraph(objects: AtlasObject[], aspect = 1): { graph: Graph; settling: boolean } {
    const seed = useMemo<LayoutSeed>(
        () => ({ documents: objects.map(object => ({ id: object.path, folderPath: object.folderPath })) }),
        [objects]
    );

    /** What the collection *is*, as a value: the only thing that may restart it. */
    const signature = useMemo(() => seed.documents.map(document => document.id).join("\0"), [seed]);
    const heavy = seed.documents.length > INLINE_LIMIT;

    // Read when a run starts, never depended on: the plate's shape is cosmetic
    // and a resize must not discard a settled layout.
    const aspectRef = useRef(aspect);
    aspectRef.current = aspect;
    const seedRef = useRef(seed);
    seedRef.current = seed;

    const [settled, setSettled] = useState<Graph | null>(null);
    /** Set when the worker cannot run at all, so the layout falls back inline. */
    const [offThreadFailed, setOffThreadFailed] = useState(false);

    useEffect(() => {
        if (!heavy || offThreadFailed) {
            setSettled(null);
            return undefined;
        }

        setSettled(null);
        let worker: Worker;
        try {
            worker = new Worker(new URL("../lib/graph.worker.ts", import.meta.url), { type: "module" });
        } catch {
            setOffThreadFailed(true);
            return undefined;
        }

        worker.onmessage = (event: MessageEvent<Graph>) => setSettled(event.data);
        // A worker that cannot start is not a reason to show "settling" forever;
        // the collection is laid out on this thread instead, slowly but at all.
        worker.onerror = () => setOffThreadFailed(true);
        worker.onmessageerror = () => setOffThreadFailed(true);
        worker.postMessage({ seed: seedRef.current, aspect: aspectRef.current });

        return () => worker.terminate();
    }, [signature, heavy, offThreadFailed]);

    const inline = useMemo(
        () => (heavy && !offThreadFailed ? null : layoutGraph(seed, aspectRef.current)),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- same: the shape is read, not tracked
        [heavy, signature, offThreadFailed]
    );

    /** The documents are matched back to their nodes here; they never left. */
    const graph = useMemo(() => {
        const placed = inline ?? settled;
        if (!placed) return EMPTY;

        const byPath = new Map(objects.map(object => [object.path, object]));
        const nodes: GraphNode[] = placed.nodes.map(node => {
            const object = byPath.get(node.id) ?? null;
            return object ? { ...node, object, label: object.name } : node;
        });
        return { nodes, edges: placed.edges };
    }, [inline, settled, objects]);

    return { graph, settling: heavy && !offThreadFailed && settled === null };
}
