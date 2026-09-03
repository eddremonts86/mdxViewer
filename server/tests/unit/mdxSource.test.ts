import { describe, expect, it } from "vitest";

import { parseHeadings } from "../../../src/utils/headingUtils";
import { readMdxSource } from "../../../src/utils/mdxSource";

describe("readMdxSource", () => {
    it("leaves plain markdown untouched", () => {
        const md = "# Title\n\nSome prose with `code`.\n\n- one\n- two";
        const { prose, hasProgram } = readMdxSource(md);
        expect(hasProgram).toBe(false);
        expect(prose).toBe(md);
    });

    it("removes imports, multi-line exports, JSX and interpolations", () => {
        const mdx = [
            "import { Button } from '@/components/ui/button'",
            "",
            "export const Counter = () => {",
            "  const [count, setCount] = useState(0)",
            "  return <button>{count}</button>",
            "}",
            "",
            "# Real Heading",
            "",
            "Real prose stays.",
            "",
            "<Alert>",
            "{count}",
            "</Alert>",
        ].join("\n");

        const { prose, hasProgram } = readMdxSource(mdx);
        expect(hasProgram).toBe(true);
        expect(prose).toBe("# Real Heading\n\nReal prose stays.");
        expect(prose).not.toMatch(/import|export|Alert|count/);
    });

    it("keeps prose written as a component's children, without its indent", () => {
        const mdx = ["<Alert>", "    Real words the author wrote.", "</Alert>", "", "After."].join("\n");
        const { prose, hasProgram } = readMdxSource(mdx);
        expect(hasProgram).toBe(true);
        // Un-indented, so it renders as prose rather than a code block.
        expect(prose).toBe("Real words the author wrote.\n\nAfter.");
    });

    it("keeps a fenced code block's own indentation, even inside a component", () => {
        const mdx = ["<Alert>", "```js", "function go() {", "    return 1;", "}", "```", "</Alert>"].join("\n");
        const { prose } = readMdxSource(mdx);
        expect(prose).toBe("```js\nfunction go() {\n    return 1;\n}\n```");
    });

    it("does not eat markdown that merely starts with a lowercase tag or brace text", () => {
        const md = "<div>kept as html</div>\n\nText { not an interpolation } here.";
        const { hasProgram } = readMdxSource(md);
        expect(hasProgram).toBe(false);
    });
});

describe("parseHeadings", () => {
    it("ignores a # inside a fenced block", () => {
        const md = [
            "# Real Heading",
            "",
            "```bash",
            "curl localhost/api",
            '# {"success":false,"error":"Path is outside the content folder"}',
            "```",
            "",
            "## Also Real",
        ].join("\n");

        expect(parseHeadings(md).map(heading => heading.title)).toEqual(["Real Heading", "Also Real"]);
    });

    it("still reads headings after a fence closes", () => {
        const md = ["```js", "# not a heading", "```", "", "### After The Fence"].join("\n");
        expect(parseHeadings(md).map(heading => heading.title)).toEqual(["After The Fence"]);
    });
});
