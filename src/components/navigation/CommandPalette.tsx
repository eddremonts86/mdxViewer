import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CornerDownLeft, Search } from "lucide-react";

import type { SearchHit } from "@/api/fileAPI";
import { MagnitudeDot } from "@/components/atlas";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useSearch } from "@/hooks/api/useFiles";
import { magnitudeFromSize } from "@/lib/atlas";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 140;

/** Mac writes the shortcut ⌘K; everywhere else it is Ctrl K. */
const shortcutLabel = (): string =>
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl K";

/**
 * The excerpt with the query marked in it.
 *
 * The server says where the match sits rather than the client searching the
 * excerpt again — two searches disagreeing about the same string is a bug
 * waiting for a query that appears twice in one line.
 *
 * Amber on content usually breaks the Red Flashlight Rule, and this is the
 * exception the rule already describes: the mark is not the document emphasising
 * itself, it is the instrument showing what the observer asked for, the same way
 * the reticle sits over a star without belonging to it.
 */
function Marked({ hit }: { hit: SearchHit }) {
    if (!hit.excerpt) return null;

    const before = hit.excerpt.slice(0, hit.at);
    const match = hit.excerpt.slice(hit.at, hit.at + hit.length);
    const after = hit.excerpt.slice(hit.at + hit.length);

    return (
        <span className="text-ink-dim block truncate text-[0.75rem] leading-relaxed">
            {before}
            <mark className="text-mark-read bg-transparent font-semibold">{match}</mark>
            {after}
        </span>
    );
}

function Result({
    hit,
    index,
    active,
    onPick,
}: {
    hit: SearchHit;
    index: number;
    active: boolean;
    onPick: () => void;
}) {
    const folder = hit.path.split("/").slice(0, -1).join(" · ");

    return (
        <li
            id={`palette-result-${index}`}
            role="option"
            aria-selected={active}
            data-active={active}
            className={cn("border-rule border-b last:border-b-0", active && "bg-panel")}
        >
            <button
                type="button"
                onClick={onPick}
                // Focus stays in the field so typing never stops; the active row
                // is drawn rather than focused, and aria-activedescendant tells a
                // screen reader which one it is.
                tabIndex={-1}
                className="flex w-full items-baseline gap-3 px-5 py-3 text-left"
            >
                <MagnitudeDot magnitude={magnitudeFromSize(hit.size)} />

                <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                        <span className="text-ink truncate font-serif text-[0.875rem] italic">{hit.name}</span>
                        {folder ? (
                            <span className="text-ink-dim shrink-0 text-[0.625rem] font-semibold tracking-[0.12em] uppercase">
                                {folder}
                            </span>
                        ) : null}
                    </span>
                    <Marked hit={hit} />
                </span>

                <span className="text-ink-dim figures shrink-0 text-[0.6875rem]">
                    {hit.line === null ? "NAME" : `L${hit.line}`}
                    {hit.more > 0 ? ` +${hit.more}` : ""}
                </span>
            </button>
        </li>
    );
}

/**
 * ⌘K: find a document by anything written in it.
 *
 * The plate index has always filtered filenames, which only finds a document
 * whose name you already know. This reads what is inside them, on the server,
 * because the folder is the source of truth.
 */
export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState("");
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const navigate = useNavigate();
    const listRef = useRef<HTMLUListElement>(null);

    const { data: hits, isFetching } = useSearch(query);
    const results = useMemo(() => hits ?? [], [hits]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setOpen(previous => !previous);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Typing is not a query yet. Asking the server on every keystroke would read
    // every document in the folder once per character.
    useEffect(() => {
        const timer = setTimeout(() => setQuery(typed), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [typed]);

    useEffect(() => setActive(0), [query]);

    useEffect(() => {
        listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
    }, [active]);

    const pick = (hit: SearchHit) => {
        setOpen(false);
        navigate(`/document/${hit.path}`);
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (results.length === 0) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive(index => (index + 1) % results.length);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive(index => (index - 1 + results.length) % results.length);
        } else if (event.key === "Enter") {
            event.preventDefault();
            pick(results[active]);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Search every document"
                className="border-rule text-ink-dim hover:text-ink focus-visible:outline-mark flex h-8 items-center gap-2 rounded-[2px] border px-2.5 focus-visible:outline focus-visible:outline-offset-2"
            >
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="figures hidden text-[0.6875rem] tracking-[0.08em] sm:inline">{shortcutLabel()}</span>
            </button>

            <Dialog
                open={open}
                onOpenChange={next => {
                    setOpen(next);
                    if (!next) {
                        setTyped("");
                        setQuery("");
                    }
                }}
            >
                <DialogContent
                    showClose={false}
                    className="top-[12%] max-w-2xl translate-y-0 gap-0 p-0"
                    onKeyDown={onKeyDown}
                >
                    <DialogTitle className="sr-only">Search documents</DialogTitle>
                    <DialogDescription className="sr-only">
                        Type to search every document by name and by its contents. Use the up and down arrows to choose
                        a result and Enter to open it.
                    </DialogDescription>

                    <div className="border-rule flex items-center gap-3 border-b px-5 py-4">
                        <Search className="text-ink-dim h-4 w-4 shrink-0" aria-hidden="true" />
                        <input
                            autoFocus
                            value={typed}
                            onChange={event => setTyped(event.target.value)}
                            placeholder="Search every document…"
                            role="combobox"
                            aria-expanded={results.length > 0}
                            aria-label="Search every document"
                            aria-controls="palette-results"
                            aria-activedescendant={results.length ? `palette-result-${active}` : undefined}
                            className="text-ink placeholder:text-ink-dim min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none"
                        />
                        <kbd className="text-ink-dim border-rule shrink-0 rounded-[2px] border px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-[0.1em]">
                            ESC
                        </kbd>
                    </div>

                    <PaletteBody
                        query={query}
                        typed={typed}
                        results={results}
                        active={active}
                        isFetching={isFetching}
                        listRef={listRef}
                        onPick={pick}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

interface PaletteBodyProps {
    query: string;
    typed: string;
    results: SearchHit[];
    active: number;
    isFetching: boolean;
    listRef: React.RefObject<HTMLUListElement | null>;
    onPick: (hit: SearchHit) => void;
}

function PaletteBody({ query, typed, results, active, isFetching, listRef, onPick }: PaletteBodyProps) {
    if (!typed.trim()) {
        return (
            <p className="text-ink-dim px-5 py-8 text-center text-[0.8125rem]">
                Every document, by name and by what is written inside it.
            </p>
        );
    }

    if (results.length === 0) {
        return (
            <p className="text-ink-dim px-5 py-8 text-center text-[0.8125rem]">
                {isFetching || query !== typed
                    ? "Reading the collection…"
                    : `Nothing in the collection says “${typed}”.`}
            </p>
        );
    }

    return (
        <>
            <ul
                id="palette-results"
                ref={listRef}
                role="listbox"
                aria-label="Search results"
                className="max-h-[22rem] overflow-y-auto"
            >
                {results.map((hit, index) => (
                    <Result
                        key={hit.path}
                        hit={hit}
                        index={index}
                        active={index === active}
                        onPick={() => onPick(hit)}
                    />
                ))}
            </ul>
            <p className="border-rule text-ink-dim flex items-center gap-2 border-t px-5 py-2.5 text-[0.6875rem] tracking-[0.06em]">
                <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
                to open · <span className="figures">↑↓</span> to move ·{" "}
                <span className="figures ml-auto">{results.length} found</span>
            </p>
        </>
    );
}
