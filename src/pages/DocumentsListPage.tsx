import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { LayoutGrid, Rows3, Search, X } from "lucide-react";

import { DataGrid, EmptyPlate, MagnitudeDot, PlateLabel, PlatePreview } from "@/components/atlas";
import { DocumentLoader } from "@/components/document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFiles } from "@/hooks/api/useFiles";
import { useEffectiveTheme } from "@/hooks/useMarkdownTheme";
import { type AtlasObject, chartCollection, formatEpoch, formatMagnitude, formatSize, platesOf } from "@/lib/atlas";
import { buildGraph, type Graph } from "@/lib/graph";
import { plateColour } from "@/lib/plateColour";
import { cn } from "@/lib/utils";

type Layout = "plates" | "register";
type Kind = "all" | "md" | "mdx";

function PlateCard({ object, graph }: { object: AtlasObject; graph: Graph }) {
    const [marked, setMarked] = useState(false);

    return (
        <Link
            to={`/document/${object.path}`}
            onMouseEnter={() => setMarked(true)}
            onMouseLeave={() => setMarked(false)}
            onFocus={() => setMarked(true)}
            onBlur={() => setMarked(false)}
            className="border-rule bg-panel/45 rounded-panel hover:border-rule-bright focus-visible:outline-mark group flex border transition-colors focus-visible:outline focus-visible:outline-offset-2"
        >
            <div className="border-rule bg-sky/60 aspect-square w-[7.5rem] shrink-0 border-r p-1">
                <PlatePreview graph={graph} path={object.path} marked={marked} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                <div className="min-w-0">
                    <p className="text-ink-dim group-hover:text-mark-read figures text-[0.5625rem] font-semibold tracking-[0.16em] uppercase transition-colors">
                        {object.designation} · {object.type.toUpperCase()}
                    </p>
                    <p className="text-ink mt-1.5 line-clamp-2 font-serif text-[1.0625rem] leading-tight italic">
                        {object.name}
                    </p>
                </div>

                <DataGrid
                    className="mt-4"
                    readings={[
                        { label: "Mag", value: formatMagnitude(object.size) },
                        { label: "Size", value: formatSize(object.size) },
                    ]}
                />
            </div>
        </Link>
    );
}

function RegisterRow({ object, rendition }: { object: AtlasObject; rendition: "dark" | "light" }) {
    return (
        <Link
            to={`/document/${object.path}`}
            className="border-rule hover:bg-panel/60 focus-visible:outline-mark flex items-center gap-3 border-b px-1 py-2.5 transition-colors focus-visible:outline focus-visible:outline-offset-[-2px]"
        >
            <span className="text-ink-dim figures w-16 shrink-0 text-[0.625rem] font-semibold tracking-[0.1em]">
                {object.designation.replace("PLATE ", "").replace(" · OBJ ", "/")}
            </span>
            <MagnitudeDot magnitude={object.magnitude} variable={object.variable} />
            <span className="text-ink min-w-0 flex-1 truncate font-serif text-[0.9375rem] italic">{object.name}</span>
            {/* The folder's hue, the same one the chart and the cards use. */}
            <span className="text-ink-dim hidden min-w-0 flex-1 items-center gap-2 truncate text-[0.75rem] sm:flex">
                <span
                    aria-hidden="true"
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: plateColour(object.folderPath, rendition) }}
                />
                {object.folder || "root"}
            </span>
            <span className="text-ink-dim figures w-14 shrink-0 text-right text-[0.6875rem] font-medium">
                {formatSize(object.size)}
            </span>
            <span className="text-ink-dim figures hidden w-20 shrink-0 text-right text-[0.6875rem] font-medium sm:block">
                {formatEpoch(object.modified)}
            </span>
        </Link>
    );
}

export function DocumentsListPage() {
    const { data: files, isLoading, error } = useFiles();
    const [layout, setLayout] = useState<Layout>("plates");
    const [kind, setKind] = useState<Kind>("all");
    const [term, setTerm] = useState("");

    const rendition = useEffectiveTheme() === "dark" ? "dark" : "light";
    const objects = useMemo(() => chartCollection(files ?? []), [files]);
    const plates = useMemo(() => platesOf(objects), [objects]);

    // The same settled collection the chart draws, so a card is a cut of it and
    // not a second, differently-shaped picture of the same folder.
    const graph = useMemo(() => buildGraph(objects), [objects]);

    const shown = useMemo(() => {
        const needle = term.trim().toLowerCase();
        return objects
            .filter(object => kind === "all" || object.type === kind)
            .filter(
                object =>
                    !needle ||
                    object.name.toLowerCase().includes(needle) ||
                    object.folder.toLowerCase().includes(needle)
            )
            .sort((first, second) => first.name.localeCompare(second.name));
    }, [objects, kind, term]);

    if (isLoading) return <DocumentLoader message="Reading the catalogue…" />;

    if (error) {
        return (
            <EmptyPlate
                designation="No signal"
                title="The catalogue could not be read"
                message={error instanceof Error ? error.message : "The file service did not answer."}
            />
        );
    }

    const counts = {
        all: objects.length,
        md: objects.filter(object => object.type === "md").length,
        mdx: objects.filter(object => object.type === "mdx").length,
    };

    return (
        <div className="px-5 py-6 sm:px-8">
            <header className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <h1 className="font-serif text-[1.75rem] leading-none font-semibold tracking-tight sm:text-[2.125rem]">
                    The Catalogue
                </h1>
                <p className="text-ink-dim figures text-[0.75rem] font-medium tracking-[0.06em]">
                    {objects.length} objects across {plates.length} plates
                </p>
            </header>

            <div className="mt-6 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[13rem] flex-1">
                    <Search
                        className="text-ink-dim pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2"
                        aria-hidden="true"
                    />
                    <Input
                        value={term}
                        onChange={event => setTerm(event.target.value)}
                        placeholder="Filter by name or plate"
                        aria-label="Filter the catalogue"
                        className="pr-8 pl-8"
                    />
                    {term ? (
                        <button
                            type="button"
                            onClick={() => setTerm("")}
                            className="text-ink-dim hover:text-ink focus-visible:outline-mark absolute top-1/2 right-2 -translate-y-1/2 focus-visible:outline focus-visible:outline-offset-2"
                            aria-label="Clear the filter"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ) : null}
                </div>

                <div
                    className="border-rule rounded-plate flex shrink-0 border"
                    role="group"
                    aria-label="Filter by type"
                >
                    {(["all", "md", "mdx"] as const).map(option => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setKind(option)}
                            aria-pressed={kind === option}
                            className={cn(
                                "figures px-3 py-1.5 text-[0.625rem] font-semibold tracking-[0.13em] uppercase transition-colors",
                                kind === option ? "bg-mark-soft text-mark-read" : "text-ink-dim hover:text-ink"
                            )}
                        >
                            {option} {counts[option]}
                        </button>
                    ))}
                </div>

                <div className="border-rule rounded-plate flex shrink-0 border" role="group" aria-label="Layout">
                    {(
                        [
                            { value: "plates", icon: LayoutGrid, label: "Plates" },
                            { value: "register", icon: Rows3, label: "Register" },
                        ] as const
                    ).map(option => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setLayout(option.value)}
                                aria-pressed={layout === option.value}
                                title={option.label}
                                className={cn(
                                    "px-2.5 py-1.5 transition-colors",
                                    layout === option.value
                                        ? "bg-mark-soft text-mark-read"
                                        : "text-ink-dim hover:text-ink"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span className="sr-only">{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-7">
                <PlateLabel reading={`${shown.length} of ${objects.length}`}>
                    {term || kind !== "all" ? "Matching objects" : "All objects"}
                </PlateLabel>
            </div>

            {shown.length === 0 ? (
                <EmptyPlate
                    designation="No match"
                    title="Nothing in the catalogue matches"
                    message={`No object is named like "${term}"${kind === "all" ? "" : ` among ${kind.toUpperCase()} files`}. Try a shorter term, or clear the filter.`}
                    action={
                        <Button
                            variant="outline"
                            onClick={() => {
                                setTerm("");
                                setKind("all");
                            }}
                        >
                            Clear the filter
                        </Button>
                    }
                />
            ) : layout === "plates" ? (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {shown.map(object => (
                        <li key={object.path}>
                            <PlateCard object={object} graph={graph} />
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="mt-4">
                    <div
                        className="border-rule-bright text-ink-dim flex items-center gap-3 border-b px-1 pb-1.5 text-[0.5625rem] font-semibold tracking-[0.14em] uppercase"
                        aria-hidden="true"
                    >
                        <span className="w-16 shrink-0">Plate/Obj</span>
                        <span className="w-[15px] shrink-0" />
                        <span className="min-w-0 flex-1">Object</span>
                        <span className="hidden min-w-0 flex-1 sm:block">Folder</span>
                        <span className="w-14 shrink-0 text-right">Size</span>
                        <span className="hidden w-20 shrink-0 text-right sm:block">Modified</span>
                    </div>
                    <ul>
                        {shown.map(object => (
                            <li key={object.path}>
                                <RegisterRow object={object} rendition={rendition} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
