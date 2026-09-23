/**
 * MDX is not compiled in this product (see PRODUCT.md → Positioning), so an
 * `.mdx` file's JavaScript is not program text to anyone — it is not executed,
 * and rendered as Markdown it comes out as body paragraphs of `import` lines
 * and a 34px heading reading `{count}`.
 *
 * This removes the parts that are code, and reports whether it removed any, so
 * the viewer can say plainly that the components were not run instead of
 * printing their source.
 */

export interface MdxSource {
    /** The Markdown that is left once the program text is removed. */
    prose: string;
    /** True when the file contained imports, exports or component markup. */
    hasProgram: boolean;
}

/** Consume a brace-balanced block starting at `from`; returns the end index. */
function endOfBlock(lines: string[], from: number): number {
    let depth = 0;
    let seen = false;

    for (let line = from; line < lines.length; line++) {
        for (const character of lines[line]) {
            if (character === "{") {
                depth += 1;
                seen = true;
            } else if (character === "}") {
                depth -= 1;
            }
        }
        if (seen && depth <= 0) return line;
        // An export with no braces at all ends on its own line.
        if (!seen && /;\s*$/.test(lines[line])) return line;
    }

    return lines.length - 1;
}

const IMPORT_OR_EXPORT = /^\s*(import|export)\s/;
/** A line that is only a JSX element, e.g. `<Button onClick={…}>` or `</Alert>`. */
const JSX_ONLY = /^\s*<\/?[A-Z][\w.]*(\s|\/?>|$)/;
/** `</Alert>` and friends: the end of a component's children. */
const JSX_CLOSE = /^\s*<\/[A-Z]/;
/** `<Alert>` but not `<Badge />`: the start of a component's children. */
const JSX_OPEN = /^\s*<[A-Z][\w.]*(?![^>]*\/>)/;
/** A line that is only an interpolation, e.g. `{count}` or `{items.map(…)}`. */
const INTERPOLATION_ONLY = /^\s*\{[^}]*\}?\s*$/;

export function readMdxSource(content: string): MdxSource {
    const lines = content.split("\n");
    const kept: string[] = [];
    let hasProgram = false;
    let cursor = 0;
    // Prose written as a component's children is still prose, but its
    // indentation would turn it into a Markdown code block once the tags around
    // it are gone. Inside a component, the words are kept and the indent is not.
    let insideComponent = 0;
    // A fenced code block keeps every space it was written with, wherever it sits.
    let insideFence = false;

    while (cursor < lines.length) {
        const line = lines[cursor];

        if (/^\s*(```|~~~)/.test(line)) {
            insideFence = !insideFence;
            kept.push(line.trimStart());
            cursor += 1;
            continue;
        }

        if (insideFence) {
            kept.push(line);
            cursor += 1;
            continue;
        }

        if (IMPORT_OR_EXPORT.test(line)) {
            hasProgram = true;
            cursor = endOfBlock(lines, cursor) + 1;
            continue;
        }

        if (JSX_ONLY.test(line) || INTERPOLATION_ONLY.test(line)) {
            hasProgram = true;
            if (JSX_CLOSE.test(line)) insideComponent = Math.max(0, insideComponent - 1);
            else if (JSX_OPEN.test(line)) insideComponent += 1;
            cursor += 1;
            continue;
        }

        kept.push(insideComponent > 0 ? line.trimStart() : line);
        cursor += 1;
    }

    // Collapse the blank runs the removals leave behind.
    const prose = kept
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return { prose, hasProgram };
}

/**
 * Remove an MDX document's `import` statements, keeping everything else.
 *
 * This is the stripper for the compiling path, and it is deliberately narrower
 * than `readMdxSource`. An `import` is the one construct that reaches outside
 * the document — at a URL, at a bundle, at anything the reader's browser can
 * fetch — so it goes. `export const Counter = …` stays, because that is the
 * document defining its own component, which is the whole point of MDX.
 *
 * Returns the source and whether anything was removed, so the reader can be told
 * that a component the document imported will not be there.
 */
export function stripMdxImports(content: string): { source: string; removed: string[] } {
    const lines = content.split("\n");
    const kept: string[] = [];
    const removed: string[] = [];
    let cursor = 0;
    let insideFence = false;

    while (cursor < lines.length) {
        const line = lines[cursor];

        if (/^\s*(```|~~~)/.test(line)) {
            insideFence = !insideFence;
            kept.push(line);
            cursor += 1;
            continue;
        }

        if (!insideFence && /^\s*import\s/.test(line)) {
            const end = endOfBlock(lines, cursor);
            const statement = lines.slice(cursor, end + 1).join(" ");
            const from = /from\s+["']([^"']+)["']/.exec(statement);
            removed.push(from ? from[1] : statement.trim());
            cursor = end + 1;
            continue;
        }

        kept.push(line);
        cursor += 1;
    }

    return { source: kept.join("\n"), removed };
}
