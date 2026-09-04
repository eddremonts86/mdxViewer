import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Minus, Plus, RotateCcw, Scan } from "lucide-react";

import {
    blooms,
    catalogue,
    containment,
    DEPTH_STEP,
    depthOf,
    eyedName,
    fieldStars,
    grid,
    hubs,
    type Ink,
    plateNames,
    reticle,
} from "@/components/atlas/skyLayers";
import { useGraph } from "@/hooks/useGraph";
import type { AtlasObject } from "@/lib/atlas";

import { LinearInterpolator, OrbitView, type OrbitViewState } from "@deck.gl/core";
import DeckGL from "@deck.gl/react";

interface SkyChartProps {
    objects: AtlasObject[];
    /** Path of the object currently under the eye, if any. */
    activePath?: string | null;
    onHover?: (object: AtlasObject | null) => void;
    onSelect?: (object: AtlasObject) => void;
    className?: string;
}

const MIN_ZOOM = -1.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.45;
const FLIGHT_MS = 620;

/** The angle the collection is first seen from: enough tilt to read the depth. */
const REST_TILT = 22;

/**
 * Past this zoom the eye is inside the tree rather than looking at it, and the
 * levels it is not at begin to recede. Below it the whole collection reads at
 * full strength, because an overview that hides most of itself is not one.
 */
const LEVEL_THRESHOLD = 0.35;

/**
 * `FlyToInterpolator` is the geographic one and refuses a view state with no
 * latitude; an orbit interpolates its target, its zoom and its two angles.
 */
const FLIGHT = new LinearInterpolator({
    transitionProps: ["target", "zoom", "rotationX", "rotationOrbit"],
});

function readInk(element: HTMLElement): Ink {
    const styles = getComputedStyle(element);
    const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
    const night = document.documentElement.classList.contains("dark");

    return {
        star: read("--star", "#f2f2e9"),
        ruleBright: read("--rule-bright", "#5a6477"),
        figure: read("--figure", "#7b93b8"),
        figureOpacity: Number(read("--figure-opacity", "0.08")),
        rule: read("--rule", "#2b3a52"),
        mark: read("--mark", "#ff4d2e"),
        // Folder hues are emitted light on the night ground and pressed ink on
        // chart paper, so the same hue is drawn at two different strengths.
        plateSaturation: night ? 0.62 : 0.55,
        plateLightness: night ? 0.63 : 0.42,
    };
}

/**
 * The collection, charted in three dimensions.
 *
 * Drawn and driven by deck.gl on an `OrbitView`: drag turns the collection, wheel
 * or pinch zooms, and the controller's own inertia carries the motion. The
 * previous version was hand-rolled canvas 2D with hand-rolled pan and zoom, and
 * four rounds of tuning got it to 59fps median with no inertia, no pinch and no
 * touch — a solved problem, reinvented badly.
 *
 * The third axis is not an effect: it is the folder tree's depth, one step back
 * per level, so turning the view shows how deeply the collection nests. Colour is
 * one hue per folder, and **size stays the measurement** — diameter is file size
 * on the fixed magnitude ramp, in pixel units, so no camera angle can inflate it.
 */
export function SkyChart({ objects, activePath, onHover, onSelect, className }: SkyChartProps) {
    const frameRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [ink, setInk] = useState<Ink | null>(null);
    const [eyedFolder, setEyedFolder] = useState<string | null>(null);

    /**
     * The view deck.gl is *given*, which changes only when something asks it to:
     * the collection is framed, a folder is charted, a control is pressed.
     *
     * Turning and zooming are deck's own and are never told to React. A
     * controlled `viewState` re-renders this component on every frame of a drag,
     * and that — not the renderer — is what held the 95th percentile at 40fps
     * whether the plate was drawn on a canvas or on the GPU.
     */
    const [given, setGiven] = useState<OrbitViewState | null>(null);
    const liveRef = useRef<OrbitViewState | null>(null);
    const readoutRef = useRef<HTMLParagraphElement>(null);

    /**
     * The nesting level the eye is at, or null while the whole collection is in
     * view. It only changes when a level is crossed, so this is one of the very
     * few things a move is allowed to tell React about.
     */
    const [focalLevel, setFocalLevel] = useState<number | null>(null);

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return undefined;

        setInk(readInk(frame));
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
            }
        });
        observer.observe(frame);
        return () => observer.disconnect();
    }, []);

    // The ink comes from CSS custom properties, so a change of rendition is a
    // change of layer props rather than a repaint.
    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return undefined;
        const observer = new MutationObserver(() => setInk(readInk(frame)));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const field = useMemo(
        () => (ink && size.width > 0 ? { width: size.width, height: size.height, ink, focalLevel } : null),
        [ink, size.height, size.width, focalLevel]
    );
    /**
     * The collection, settled. Laid out once per set of objects: a force layout is
     * a property of the collection, not something to watch happen.
     */
    const { graph, settling } = useGraph(objects, size.height > 0 ? size.width / size.height : 1);
    const documents = useMemo(() => graph.nodes.filter(node => node.kind === "document"), [graph]);
    const eyed = useMemo(() => documents.find(node => node.id === activePath) ?? null, [documents, activePath]);
    const deepest = useMemo(
        () => objects.reduce((least, object) => Math.min(least, depthOf(object.folder)), 0),
        [objects]
    );

    /** The whole collection, seen from the resting angle. */
    const home = useCallback(
        (transition = false): OrbitViewState => ({
            target: [size.width / 2, size.height / 2, deepest / 2],
            zoom: -0.35,
            rotationX: REST_TILT,
            rotationOrbit: 0,
            ...(transition ? { transitionDuration: FLIGHT_MS, transitionInterpolator: FLIGHT } : {}),
        }),
        [deepest, size.height, size.width]
    );

    /**
     * Settle on the collection whenever the set changes.
     *
     * There is no region to fly to any more: narrowing to a folder re-runs the
     * layout on just those documents, and a settled graph is normalised to fill
     * the plate. The framing is the layout's, so this only has to bring the eye
     * back to it.
     */
    const settled = useMemo(() => graph.nodes.map(node => node.id).join("|"), [graph]);
    useEffect(() => {
        if (size.width > 0) setGiven(home(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the set's identity
    }, [settled, size.width, size.height]);

    const eyeOn = useCallback(
        (object: AtlasObject | null) => {
            setEyedFolder(object?.folderPath ?? null);
            onHover?.(object);
        },
        [onHover]
    );

    const layers = useMemo(() => {
        if (!field) return [];
        return [
            fieldStars(field),
            grid(field, deepest),
            containment(field, graph, eyedFolder),
            hubs(field, graph, eyedFolder),
            plateNames(field, graph),
            blooms(field, documents, activePath ?? null),
            catalogue(field, documents, activePath ?? null, { onHover: eyeOn, onSelect }),
            reticle(field, eyed),
            eyedName(field, eyed),
        ];
    }, [field, graph, documents, eyedFolder, activePath, eyeOn, onSelect, eyed, deepest]);

    /**
     * Everything a move reports.
     *
     * The readout is written straight to the DOM because it changes on every
     * frame of a zoom. The focal level goes through React, but only when the eye
     * actually crosses into another level of the tree — pulled back past the
     * threshold there is no focal level at all and the whole collection reads at
     * full strength.
     */
    const onMoved = useCallback((view: OrbitViewState) => {
        liveRef.current = view;

        const zoom = typeof view.zoom === "number" ? view.zoom : 0;
        const readout = readoutRef.current;
        if (readout) readout.textContent = `×${(2 ** zoom).toFixed(1)} · ${Math.round(view.rotationOrbit ?? 0)}°`;

        const [, , targetZ = 0] = view.target ?? [];
        const next = zoom < LEVEL_THRESHOLD ? null : Math.round(-targetZ / DEPTH_STEP);
        setFocalLevel(current => (current === next ? current : next));
    }, []);

    const nudge = (change: Partial<OrbitViewState>) => {
        const base = liveRef.current ?? given ?? home();
        const zoom = typeof change.zoom === "number" ? change.zoom : ((base.zoom as number | undefined) ?? 0);
        setGiven({
            ...base,
            ...change,
            zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)),
            transitionDuration: 220,
            transitionInterpolator: FLIGHT,
        });
    };

    const zoomBy = (delta: number) => {
        const base = liveRef.current ?? given ?? home();
        nudge({ zoom: ((base.zoom as number | undefined) ?? 0) + delta });
    };

    return (
        <div ref={frameRef} className={`${className ?? ""} overflow-hidden`}>
            {field && given ? (
                <DeckGL
                    views={
                        // The default far plane is 1000 world units and this
                        // scene is a thousand wide before the tree's depth is
                        // added, so the whole collection sat behind it.
                        new OrbitView({ id: "plate", orbitAxis: "Y", fovy: 45, near: 1, far: 20000 })
                    }
                    initialViewState={given}
                    controller={{ inertia: 320, doubleClickZoom: false }}
                    onViewStateChange={({ viewState }) => onMoved(viewState as OrbitViewState)}
                    layers={layers}
                    // Radius is in pixels, so a faint point still needs a
                    // reachable target; picking is on the GPU either way.
                    pickingRadius={8}
                    getCursor={({ isDragging, isHovering }) =>
                        isDragging ? "grabbing" : isHovering ? "pointer" : "grab"
                    }
                    style={{ position: "absolute", inset: "0" }}
                />
            ) : null}

            <PlateRegister objects={objects} onEye={eyeOn} onSelect={onSelect} />

            {/* The plate scale. Square, hairline, no fill until pressed — an
                instrument's controls, sitting on the collection's own corner. */}
            <div className="absolute right-3 bottom-3 flex flex-col">
                <PlateScaleButton label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)}>
                    <Plus className="h-3 w-3" />
                </PlateScaleButton>
                <PlateScaleButton label="Zoom out" onClick={() => zoomBy(-ZOOM_STEP)}>
                    <Minus className="h-3 w-3" />
                </PlateScaleButton>
                <PlateScaleButton
                    label="Turn the collection"
                    onClick={() =>
                        nudge({
                            rotationOrbit: ((liveRef.current?.rotationOrbit ?? 0) + 45) % 360,
                            rotationX: REST_TILT,
                        })
                    }
                >
                    <RotateCcw className="h-3 w-3" />
                </PlateScaleButton>
                <PlateScaleButton label="Whole collection" onClick={() => setGiven(home(true))}>
                    <Scan className="h-3 w-3" />
                </PlateScaleButton>
            </div>

            {settling ? (
                <p className="text-ink-dim border-rule bg-panel/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border px-3 py-2 text-[0.6875rem] font-semibold tracking-[0.13em] uppercase">
                    Settling the collection…
                </p>
            ) : null}

            <p
                ref={readoutRef}
                className="text-ink-dim figures border-rule bg-panel/80 absolute bottom-3 left-3 border px-2 py-1 text-[0.625rem] tracking-[0.08em]"
            />
        </div>
    );
}

/**
 * The chart, for a keyboard and a screen reader: the catalogue as a real list.
 *
 * The previous version put one focusable button on top of every plotted object.
 * That cannot follow a perspective projection with a single transform, and with a
 * large collection it was 7,896 tab stops — which was never good assistive
 * behaviour, only a literal one. A list is what a catalogue is: focusing an entry
 * puts that object under the eye, and activating it opens the document.
 */
function PlateRegister({
    objects,
    onEye,
    onSelect,
}: {
    objects: AtlasObject[];
    onEye: (object: AtlasObject | null) => void;
    onSelect?: (object: AtlasObject) => void;
}) {
    const ordered = useMemo(
        () => [...objects].sort((first, second) => first.y - second.y || first.x - second.x),
        [objects]
    );

    return (
        <ul className="sr-only" aria-label={`${objects.length} documents, plotted by folder and sized by file size`}>
            {ordered.map(object => (
                <li key={object.path}>
                    <button
                        type="button"
                        onFocus={() => onEye(object)}
                        onBlur={() => onEye(null)}
                        onClick={() => onSelect?.(object)}
                    >
                        {object.name}, {object.designation}
                        {object.measured ? `, magnitude ${object.magnitude}` : ", size not reported"}
                    </button>
                </li>
            ))}
        </ul>
    );
}

function PlateScaleButton({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className="border-rule bg-panel/80 text-ink-dim hover:text-ink focus-visible:outline-mark -mt-px flex h-6 w-6 items-center justify-center border first:mt-0 focus-visible:outline focus-visible:outline-offset-1"
        >
            {children}
            <span className="sr-only">{label}</span>
        </button>
    );
}
