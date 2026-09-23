import { useMemo } from "react";
import { Link } from "react-router-dom";

import { DataGrid, EmptyPlate, MagnitudeDot, PlateLabel } from "@/components/atlas";
import { DocumentLoader } from "@/components/document";
import { useFiles } from "@/hooks/api/useFiles";
import { useEffectiveTheme } from "@/hooks/useMarkdownTheme";
import { type AtlasObject, chartCollection, formatEpoch, formatSize, MAGNITUDE_RADIUS, platesOf } from "@/lib/atlas";
import { plateColour } from "@/lib/plateColour";

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 7;
const MONTH_DAYS = 30;
const LISTED = 6;

/** The magnitude distribution, drawn as the ramp it is rather than as a chart widget. */
function MagnitudeDistribution({ objects }: { objects: AtlasObject[] }) {
    const counts = MAGNITUDE_RADIUS.map(
        (_, magnitude) => objects.filter(object => object.magnitude === magnitude).length
    );
    const peak = Math.max(...counts, 1);

    return (
        <div className="space-y-3">
            <PlateLabel reading={`${objects.length}`}>Magnitude distribution</PlateLabel>
            <ul className="space-y-2">
                {counts.map((count, magnitude) => (
                    <li key={magnitude} className="flex items-center gap-3">
                        <MagnitudeDot magnitude={magnitude} />
                        <span className="text-ink-dim figures w-3 shrink-0 text-[0.6875rem] font-medium">
                            {magnitude}
                        </span>
                        <span className="bg-rule/60 h-3 flex-1">
                            <span
                                className="bg-star block h-full"
                                style={{ width: `${(count / peak) * 100}%`, opacity: 0.75 }}
                            />
                        </span>
                        <span className="text-ink figures w-8 shrink-0 text-right text-[0.75rem] font-medium">
                            {count}
                        </span>
                    </li>
                ))}
            </ul>
            <p className="text-ink-dim text-[0.75rem] leading-relaxed">
                Magnitude 0 is 32&nbsp;KiB and over; magnitude 5 is under 1&nbsp;KiB.
            </p>
        </div>
    );
}

export function StatisticsPage() {
    const { data: files, isLoading, error } = useFiles();

    const rendition = useEffectiveTheme() === "dark" ? "dark" : "light";
    const objects = useMemo(() => chartCollection(files ?? []), [files]);
    const plates = useMemo(() => platesOf(objects), [objects]);

    const survey = useMemo(() => {
        const now = Date.now();
        const totalSize = objects.reduce((sum, object) => sum + object.size, 0);
        const dated = objects.filter(object => object.modified);
        const oldest = [...dated].sort(
            (first, second) => (first.modified?.getTime() ?? 0) - (second.modified?.getTime() ?? 0)
        );
        const sizeByPlate = new Map<number, number>();
        for (const object of objects) {
            sizeByPlate.set(object.plate, (sizeByPlate.get(object.plate) ?? 0) + object.size);
        }
        return {
            totalSize,
            mdx: objects.filter(object => object.type === "mdx").length,
            md: objects.filter(object => object.type === "md").length,
            week: dated.filter(object => now - (object.modified?.getTime() ?? 0) < RECENT_DAYS * DAY_MS).length,
            month: dated.filter(object => now - (object.modified?.getTime() ?? 0) < MONTH_DAYS * DAY_MS).length,
            oldest: oldest.slice(0, LISTED),
            sizeByPlate,
        };
    }, [objects]);

    if (isLoading) return <DocumentLoader message="Taking the survey…" />;

    if (error) {
        return (
            <EmptyPlate
                designation="No signal"
                title="The survey could not be taken"
                message={error instanceof Error ? error.message : "The file service did not answer."}
            />
        );
    }

    if (objects.length === 0) {
        return (
            <EmptyPlate
                designation="Empty field"
                title="Nothing to survey yet"
                message="Add documents to the content folder and their measurements appear here."
            />
        );
    }

    return (
        <div className="px-5 py-6 sm:px-8">
            <header className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <h1 className="font-serif text-[1.75rem] leading-none font-semibold tracking-tight sm:text-[2.125rem]">
                    The Survey
                </h1>
                <p className="text-ink-dim text-[0.75rem] font-medium tracking-[0.06em]">
                    Measured from the content folder, at load
                </p>
            </header>

            <div className="border-rule mt-6 border-y py-5">
                <DataGrid
                    columns={2}
                    className="sm:grid-cols-3 lg:grid-cols-6"
                    readings={[
                        { label: "Objects", value: objects.length },
                        { label: "Plates", value: plates.length },
                        { label: "On disk", value: formatSize(survey.totalSize) },
                        { label: "Markdown", value: survey.md },
                        { label: "MDX", value: survey.mdx },
                        { label: "Touched, 7 d", value: survey.week },
                    ]}
                />
            </div>

            <div className="mt-9 grid gap-9 lg:grid-cols-2">
                <MagnitudeDistribution objects={objects} />

                <div className="space-y-3">
                    <PlateLabel reading={`${plates.length}`}>Plates by weight</PlateLabel>
                    <table className="w-full">
                        <thead>
                            <tr className="border-rule-bright border-b">
                                <th className="text-ink-dim py-1.5 text-left text-[0.5625rem] font-semibold tracking-[0.14em] uppercase">
                                    Plate
                                </th>
                                <th className="text-ink-dim py-1.5 text-right text-[0.5625rem] font-semibold tracking-[0.14em] uppercase">
                                    Objects
                                </th>
                                <th className="text-ink-dim py-1.5 text-right text-[0.5625rem] font-semibold tracking-[0.14em] uppercase">
                                    On disk
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...plates]
                                .sort((first, second) => second.count - first.count)
                                .map(plate => (
                                    <tr key={plate.plate} className="border-rule border-b">
                                        <td className="text-ink py-1.5 text-[0.8125rem]">
                                            <span className="text-ink-dim figures mr-2 text-[0.6875rem]">
                                                {String(plate.plate).padStart(2, "0")}
                                            </span>
                                            {/* The hue is the folder's identity on the
                                                chart; the survey names the same folders
                                                and had been calling them all one colour. */}
                                            <span
                                                aria-hidden="true"
                                                className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                                                style={{ background: plateColour(plate.folderPath, rendition) }}
                                            />
                                            {plate.folder}
                                        </td>
                                        <td className="text-ink figures py-1.5 text-right text-[0.75rem] font-medium">
                                            {plate.count}
                                        </td>
                                        <td className="text-ink-dim figures py-1.5 text-right text-[0.75rem] font-medium">
                                            {formatSize(survey.sizeByPlate.get(plate.plate) ?? 0)}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-9 grid gap-9 lg:grid-cols-2">
                <div className="space-y-3">
                    <PlateLabel reading={`${survey.oldest.length}`}>Longest untouched</PlateLabel>
                    <ul>
                        {survey.oldest.map(object => (
                            <li key={object.path}>
                                <Link
                                    to={`/document/${object.path}`}
                                    className="border-rule hover:bg-panel/60 focus-visible:outline-mark flex items-center gap-3 border-b py-2 transition-colors focus-visible:outline focus-visible:outline-offset-[-2px]"
                                >
                                    <MagnitudeDot magnitude={object.magnitude} />
                                    <span className="text-ink min-w-0 flex-1 truncate font-serif text-[0.875rem] italic">
                                        {object.name}
                                    </span>
                                    <span className="text-ink-dim figures shrink-0 text-[0.6875rem] font-medium">
                                        {formatEpoch(object.modified)}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* PRODUCT.md principle 3: an honest absence beats an invented figure. */}
                <div className="space-y-3">
                    <PlateLabel>Not measured</PlateLabel>
                    <div className="border-rule bg-panel/40 rounded-panel border p-4">
                        <p className="text-ink text-[0.875rem] leading-relaxed">
                            This survey reports what the filesystem knows: how many documents exist, how large they are,
                            and when they last changed.
                        </p>
                        <p className="text-ink-dim mt-3 text-[0.8125rem] leading-relaxed">
                            Reads, readers and time spent are not counted anywhere yet, so no figure for them appears
                            here. Counting them needs a store on the server; until that exists this page stays smaller
                            and true.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
