// Relative, not aliased: a worker is bundled on its own and the `@/` alias is
// the kind of thing that resolves in the app and silently does not here.
import { type Graph, layoutGraph, type LayoutSeed } from "./graph";

/**
 * The layout, off the main thread.
 *
 * Settling 1,900 nodes takes about two seconds, and it used to take that on the
 * thread that draws — so the chart was blank and the whole app frozen while an
 * imported folder settled. The simulation is pure arithmetic over ids, which is
 * exactly what a worker is for.
 *
 * Only what the layout needs crosses the boundary: a path and a folder path per
 * document. The catalogued objects themselves stay where they are and are
 * matched back up by id.
 */
self.onmessage = (event: MessageEvent<{ seed: LayoutSeed; aspect: number }>) => {
    const graph: Graph = layoutGraph(event.data.seed, event.data.aspect);
    self.postMessage(graph);
};
