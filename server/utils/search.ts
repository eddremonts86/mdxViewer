/**
 * Searching the collection.
 *
 * The sidebar has always filtered filenames, which finds a document only if you
 * already know what it is called. This reads what is inside them.
 *
 * It runs on the server because the folder is the source of truth and the server
 * is the only thing that reads it — shipping every document to the browser to
 * search there would mean sending the whole collection to find one line of it.
 *
 * The implementation is a scan: every document is read on every query. That is
 * milliseconds for the 76 documents this instance charts and it is honest about
 * being linear. A collection large enough to feel it wants an index keyed by
 * mtime, built on the first search and refreshed when a file changes — the place
 * to put that is here, behind the same function.
 */

import { promises as fs } from "fs";
import path from "path";

import { FILE_CONFIG, SERVER_CONFIG } from "../constants/index.js";

export interface SearchHit {
    path: string;
    name: string;
    /** Line number of the match, 1-indexed, or null when only the name matched. */
    line: number | null;
    /** The matching line, trimmed to something a result row can show. */
    excerpt: string;
    /** Where the query sits inside `excerpt`, so the client marks it rather than guessing. */
    at: number;
    length: number;
    /** How many further matches this document holds. */
    more: number;
    /** The document's real size in bytes, so a result can plot its magnitude. */
    size: number;
    /** A name match outranks a body match: it is what the reader was probably after. */
    inName: boolean;
}

const SEARCHABLE: readonly string[] = FILE_CONFIG.ALLOWED_EXTENSIONS;
const EXCERPT_BEFORE = 32;
const EXCERPT_LENGTH = 140;
const MAX_HITS = 40;

/** Walk the content folder, yielding every document path relative to the root. */
async function* documents(dir: string, relative = "", depth = 0): AsyncGenerator<string> {
    if (depth > SERVER_CONFIG.MAX_FOLDER_DEPTH) return;

    let entries;
    try {
        entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
        return;
    }

    for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

        const here = relative ? `${relative}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
            yield* documents(path.join(dir, entry.name), here, depth + 1);
        } else if (SEARCHABLE.includes(path.extname(entry.name).toLowerCase())) {
            yield here;
        }
    }
}

/**
 * A line, cut down to what a result row can show, with the match still in it.
 *
 * The window is placed around the match rather than at the start of the line, so
 * a hit 300 characters into a paragraph is actually visible in its result.
 */
function excerptAround(line: string, at: number): { excerpt: string; at: number } {
    const from = Math.max(0, at - EXCERPT_BEFORE);
    const window = line.slice(from, from + EXCERPT_LENGTH);
    const dropped = window.length - window.trimStart().length;

    const lead = from > 0 ? "…" : "";
    const tail = from + EXCERPT_LENGTH < line.length ? "…" : "";

    return {
        excerpt: `${lead}${window.trim()}${tail}`,
        // Where the match sits in what is actually shown: shifted back by the
        // window's start and the spaces trimmed off it, forward by the ellipsis.
        at: at - from - dropped + lead.length,
    };
}

/**
 * Every document whose name or body contains `query`, name matches first.
 *
 * Matching is case-insensitive and literal: the query is compared as text, never
 * compiled to a regular expression, so a reader searching for `[!NOTE]` or `.*`
 * finds those characters instead of an error or a catastrophic backtrack.
 */
export async function searchContent(query: string): Promise<SearchHit[]> {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    const hits: SearchHit[] = [];

    for await (const relative of documents(SERVER_CONFIG.CONTENT_PATH)) {
        if (hits.length >= MAX_HITS) break;

        const name = path.basename(relative);
        const inName = name.toLowerCase().includes(needle);

        let body: string;
        try {
            body = await fs.readFile(path.join(SERVER_CONFIG.CONTENT_PATH, relative), "utf8");
        } catch {
            continue;
        }

        const lines = body.split("\n");
        const matched: Array<{ line: number; at: number; text: string }> = [];

        for (const [index, text] of lines.entries()) {
            const at = text.toLowerCase().indexOf(needle);
            if (at !== -1) matched.push({ line: index + 1, at, text });
        }

        if (!inName && matched.length === 0) continue;

        const [first] = matched;
        const window = first ? excerptAround(first.text, first.at) : { excerpt: "", at: 0 };

        hits.push({
            path: relative,
            name,
            line: first?.line ?? null,
            excerpt: window.excerpt,
            at: window.at,
            length: needle.length,
            more: Math.max(0, matched.length - 1),
            size: Buffer.byteLength(body),
            inName,
        });
    }

    // A document whose name matches is almost always the one being looked for;
    // after that, the one that mentions the query most.
    return hits.sort((first, second) => {
        if (first.inName !== second.inName) return first.inName ? -1 : 1;
        if (first.more !== second.more) return second.more - first.more;
        return first.path.localeCompare(second.path);
    });
}
