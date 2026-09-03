import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CompassStar, DataGrid, EmptyPlate, MagnitudeDot, PlateLabel, SkyChart } from "@/components/atlas";
import { DocumentLoader } from "@/components/document";
import { Button } from "@/components/ui/button";
import { useFiles } from "@/hooks/api/useFiles";
import {
    type AtlasObject,
    chartCollection,
    formatEpoch,
    formatMagnitude,
    formatSize,
    MAGNITUDE_RADIUS,
    platesOf,
} from "@/lib/atlas";

/** The magnitude key: the ramp itself, printed, so a reader can decode a dot. */
function MagnitudeKey({ objects }: { objects: AtlasObject[] }) {
    const counts = MAGNITUDE_RADIUS.map(
        (_, magnitude) => objects.filter(object => object.magnitude === magnitude).length
    );

    return (
        <div className="space-y-3">
            <PlateLabel>Magnitude</PlateLabel>
            <p className="text-ink-dim text-[0.75rem] leading-relaxed">
                Diameter is file size, on a fixed ramp anchored at 1&nbsp;KiB. A ringed object was modified in the last
                seven days.
            </p>
            <ul className="space-y-1">
                {MAGNITUDE_RADIUS.map((_, magnitude) => (
                    <li key={magnitude} className="flex items-center gap-3">
                        <MagnitudeDot magnitude={magnitude} />
                        <span className="text-ink-dim figures w-4 text-[0.6875rem] font-medium">{magnitude}</span>
                        <span className="bg-rule h-px flex-1" />
                        <span className="text-ink-dim figures text-[0.6875rem] font-medium">{counts[magnitude]}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function HomePage() {
    const { data: files, isLoading, error } = useFiles();
    const navigate = useNavigate();
    const [eyed, setEyed] = useState<AtlasObject | null>(null);

    const objects = useMemo(() => chartCollection(files ?? []), [files]);
    const plates = useMemo(() => platesOf(objects), [objects]);
    const plateNames = useMemo(() => new Map(plates.map(plate => [plate.plate, plate.folder])), [plates]);
    const recent = useMemo(
        () =>
            [...objects]
                .filter(object => object.modified)
                .sort((first, second) => (second.modified?.getTime() ?? 0) - (first.modified?.getTime() ?? 0))
                .slice(0, 6),
        [objects]
    );

    if (isLoading) return <DocumentLoader message="Plotting the collection…" />;

    if (error) {
        return (
            <EmptyPlate
                designation="No signal"
                title="The collection could not be read"
                message={
                    error instanceof Error
                        ? error.message
                        : "The file service did not answer. Check that the server is running."
                }
                action={
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Try again
                    </Button>
                }
            />
        );
    }

    if (objects.length === 0) {
        return (
            <EmptyPlate
                designation="Empty field"
                title="Nothing is catalogued yet"
                message="Add a Markdown or MDX file to the content folder, or create one from the plate index, and it appears on the chart."
            />
        );
    }

    const eyedOrBrightest = eyed ?? objects[0];

    return (
        <div className="flex flex-col xl:h-full xl:min-h-0">
            <div className="flex flex-1 flex-col xl:min-h-0 xl:flex-row">
                {/* The chart field: the whole collection before any single document. */}
                <section className="flex min-w-0 flex-1 flex-col xl:min-h-0">
                    <header className="flex flex-wrap items-baseline gap-x-5 gap-y-1 px-5 pt-6 sm:px-8">
                        <h1 className="font-serif text-[1.75rem] leading-none font-semibold tracking-tight sm:text-[2.125rem]">
                            The Collection
                        </h1>
                        <p className="text-ink-dim figures text-[0.75rem] font-medium tracking-[0.06em]">
                            {objects.length} objects · {plates.length} plates
                        </p>
                    </header>

                    <a
                        href="#register"
                        className="focus:bg-mark focus:text-sky sr-only mx-5 focus:not-sr-only focus:inline-block focus:px-3 focus:py-2 focus:text-[0.6875rem] focus:font-semibold focus:tracking-[0.11em] focus:uppercase sm:mx-8"
                    >
                        Skip the chart
                    </a>

                    <div className="flex min-h-[20rem] flex-1 px-5 pt-4 pb-6 sm:px-8 xl:min-h-0">
                        <SkyChart
                            objects={objects}
                            plateNames={plateNames}
                            activePath={eyed?.path ?? null}
                            onHover={setEyed}
                            onSelect={object => navigate(`/document/${object.path}`)}
                            className="relative flex-1"
                        />
                    </div>
                </section>

                {/* The observer's rail: what is under the eye, and the keys to read it. */}
                <aside className="border-rule shrink-0 border-t px-5 py-6 sm:px-8 xl:min-h-0 xl:w-[19rem] xl:overflow-y-auto xl:border-t-0 xl:border-l xl:px-6">
                    <div className="space-y-3">
                        <PlateLabel reading={eyedOrBrightest.designation.split(" · ")[0]}>Under the eye</PlateLabel>
                        <div className="bg-panel/50 border-rule rounded-panel border p-4">
                            <div className="mb-3 flex items-start gap-3">
                                <MagnitudeDot
                                    magnitude={eyedOrBrightest.magnitude}
                                    variable={eyedOrBrightest.variable}
                                    className="mt-1"
                                />
                                <div className="min-w-0">
                                    <p className="text-ink font-serif text-[1.0625rem] leading-tight font-medium italic">
                                        {eyedOrBrightest.name}
                                    </p>
                                    <p className="text-mark-read figures mt-1 text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
                                        {eyedOrBrightest.designation}
                                    </p>
                                </div>
                            </div>
                            <DataGrid
                                readings={[
                                    { label: "Mag", value: formatMagnitude(eyedOrBrightest.size) },
                                    { label: "Size", value: formatSize(eyedOrBrightest.size) },
                                    { label: "Modified", value: formatEpoch(eyedOrBrightest.modified) },
                                    { label: "Type", value: eyedOrBrightest.type.toUpperCase() },
                                ]}
                            />
                            <Button
                                className="mt-4 w-full"
                                onClick={() => navigate(`/document/${eyedOrBrightest.path}`)}
                            >
                                <CompassStar size={11} />
                                Observe
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8">
                        <MagnitudeKey objects={objects} />
                    </div>

                    <div className="mt-8 space-y-3">
                        <PlateLabel reading={`${plates.length}`}>Plates</PlateLabel>
                        <ul className="space-y-1.5">
                            {plates.map(plate => (
                                <li key={plate.plate} className="flex items-baseline gap-3">
                                    <span className="text-ink-dim figures w-6 shrink-0 text-[0.6875rem] font-medium">
                                        {String(plate.plate).padStart(2, "0")}
                                    </span>
                                    <span className="text-ink truncate text-[0.8125rem]">{plate.folder}</span>
                                    <span className="bg-rule h-px flex-1" />
                                    <span className="text-ink-dim figures text-[0.6875rem] font-medium">
                                        {plate.count}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>

            {/* The register band: what moved most recently, in catalogue form. */}
            <section id="register" className="border-rule shrink-0 border-t px-5 py-6 sm:px-8">
                <PlateLabel reading={`${recent.length} of ${objects.length}`}>Recently modified</PlateLabel>
                <ul className="mt-4 grid gap-x-8 gap-y-px sm:grid-cols-2 xl:grid-cols-3">
                    {recent.map(object => (
                        <li key={object.path}>
                            <button
                                type="button"
                                onClick={() => navigate(`/document/${object.path}`)}
                                onMouseEnter={() => setEyed(object)}
                                onFocus={() => setEyed(object)}
                                className="border-rule hover:bg-panel/60 focus-visible:outline-mark flex w-full items-center gap-3 border-b py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-offset-[-2px]"
                            >
                                <MagnitudeDot magnitude={object.magnitude} variable={object.variable} />
                                <span className="text-ink min-w-0 flex-1 truncate font-serif text-[0.9375rem] italic">
                                    {object.name}
                                </span>
                                <span className="text-ink-dim figures shrink-0 text-[0.6875rem] font-medium">
                                    {formatEpoch(object.modified)}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
