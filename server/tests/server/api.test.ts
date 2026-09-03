/**
 * The file service, driven in process.
 *
 * Every case here runs against a temporary content folder, so the suite never
 * reads or deletes a real document, and it needs nothing listening on a port —
 * which is what the previous suite required and why most of it never ran.
 *
 * The traversal cases are the point: this service turns request strings into
 * filesystem paths, and before these guards existed a crafted `path` could read
 * `/etc/hosts` and write outside the content folder.
 */

import type { Express } from "express";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

let app: Express;
let contentDir: string;
let outsideMarker: string;

/**
 * Traversal comes in through two doors and they do not accept the same strings.
 * Express percent-decodes a query, so `..%2F` becomes `../` there; a JSON body
 * is taken literally, where `..%2Fx.md` is just an unusual single filename and
 * is correctly allowed. Each door gets the vectors that actually apply to it.
 */
const QUERY_ESCAPES = [
    "../escaped.md",
    "../../escaped.md",
    "..%2Fescaped.md",
    "%2e%2e%2fescaped.md",
    "docs/../../escaped.md",
    "/etc/hosts",
];
const BODY_ESCAPES = ["..", "../..", "docs/../..", "/etc", "/"];

beforeAll(async () => {
    contentDir = await fs.mkdtemp(path.join(os.tmpdir(), "mdxviewer-content-"));
    await fs.mkdir(path.join(contentDir, "docs"), { recursive: true });
    await fs.writeFile(path.join(contentDir, "docs", "intro.md"), "---\ntitle: Intro\n---\n\n# Intro\n\nBody.\n");
    await fs.writeFile(path.join(contentDir, "docs", "second.md"), "# Second\n");

    // A file one level above the content root: nothing may reach it.
    outsideMarker = path.join(path.dirname(contentDir), `escaped-${path.basename(contentDir)}.md`);
    await fs.writeFile(outsideMarker, "secret");

    process.env.CONTENT_DIR = contentDir;
    app = (await import("../../app.js")).default;
});

afterAll(async () => {
    await fs.rm(contentDir, { recursive: true, force: true });
    await fs.rm(path.join(path.dirname(contentDir), "trash"), { recursive: true, force: true });
    await fs.rm(outsideMarker, { force: true });
    delete process.env.CONTENT_DIR;
});

describe("the service answers", () => {
    it("reports health", async () => {
        const response = await request(app).get("/api/health").expect(200);
        expect(response.body.success).toBe(true);
    });

    it("lists the content folder", async () => {
        const response = await request(app).get("/api/files").expect(200);
        const names = response.body.data.map((item: { originalName?: string }) => item.originalName);
        expect(names).toContain("docs");
    });

    it("returns a document with its frontmatter split out", async () => {
        const response = await request(app).get("/api/files/content").query({ path: "docs/intro.md" }).expect(200);
        expect(response.body.data.frontmatter).toEqual({ title: "Intro" });
        expect(response.body.data.content).not.toContain("title: Intro");
        expect(response.body.data.content).toContain("# Intro");
        expect(response.body.data.size).toBeGreaterThan(0);
    });

    it("counts the collection", async () => {
        const response = await request(app).get("/api/statistics").expect(200);
        expect(response.body.data.totalDocuments).toBe(2);
    });
});

describe("paths outside the content folder are refused", () => {
    it.each(QUERY_ESCAPES)("refuses to read %s", async escape => {
        const response = await request(app).get("/api/files/content").query({ path: escape });
        expect(response.status).not.toBe(200);
        expect(String(response.text)).not.toContain("secret");
    });

    it.each(BODY_ESCAPES)("refuses to create under %s", async escape => {
        const response = await request(app)
            .post("/api/files/create")
            .send({ name: "planted", type: "md", path: escape });
        expect(response.status).not.toBe(200);
    });

    it("refuses to delete outside the content folder", async () => {
        const response = await request(app)
            .delete("/api/files")
            .send({ paths: [`../${path.basename(outsideMarker)}`] });

        expect(response.body.success).toBe(false);
        // The marker is still there: nothing above the root was touched.
        await expect(fs.access(outsideMarker)).resolves.toBeUndefined();
    });

    it("refuses to move something out of the content folder", async () => {
        const response = await request(app)
            .post("/api/files/move")
            .send({ sourcePath: "docs/intro.md", targetPath: ".." });
        expect(response.status).not.toBe(200);
        await expect(fs.access(path.join(contentDir, "docs", "intro.md"))).resolves.toBeUndefined();
    });

    it.each(["../planted", "a/b", "..", "."])("refuses %s as a name", async name => {
        const response = await request(app).post("/api/folders/create").send({ name, path: "" });
        expect(response.status).not.toBe(200);
    });

    it("refuses an upload whose name is a path", async () => {
        const response = await request(app)
            .post("/api/files/upload")
            .field("path", "")
            .attach("files", Buffer.from("planted"), "../../planted.md");

        // Multer keeps only the basename; nothing lands above the root.
        await expect(fs.access(path.join(path.dirname(contentDir), "planted.md"))).rejects.toThrow();
        if (response.status === 200) {
            await fs.rm(path.join(contentDir, "planted.md"), { force: true });
        }
    });

    it("refuses an upload with an extension the product does not serve", async () => {
        const response = await request(app)
            .post("/api/files/upload")
            .field("path", "")
            .attach("files", Buffer.from("#!/bin/sh"), "payload.sh");
        expect(response.status).not.toBe(200);
        await expect(fs.access(path.join(contentDir, "payload.sh"))).rejects.toThrow();
    });
});

describe("file management inside the folder still works", () => {
    it("creates, moves and deletes a document", async () => {
        const created = await request(app)
            .post("/api/files/create")
            .send({ name: "note", type: "md", path: "docs" })
            .expect(200);
        expect(created.body.data.path).toBe("docs/note.md");

        await request(app).post("/api/files/move").send({ sourcePath: "docs/note.md", targetPath: "" }).expect(200);
        await expect(fs.access(path.join(contentDir, "note.md"))).resolves.toBeUndefined();

        const deleted = await request(app)
            .delete("/api/files")
            .send({ paths: ["note.md"] })
            .expect(200);
        expect(deleted.body.data.successCount).toBe(1);
        await expect(fs.access(path.join(contentDir, "note.md"))).rejects.toThrow();
    });

    it("refuses a duplicate name rather than overwriting", async () => {
        const response = await request(app).post("/api/files/create").send({ name: "intro", type: "md", path: "docs" });
        expect(response.status).toBe(409);
    });
});

describe("saving a document", () => {
    const load = (filePath: string) =>
        request(app)
            .get("/api/files/content")
            .query({ path: filePath })
            .expect(200)
            .then(response => response.body.data);

    it("writes the text back exactly, frontmatter included", async () => {
        const loaded = await load("docs/intro.md");
        const edited = `${loaded.raw}\nA line the author added.\n`;

        await request(app)
            .put("/api/files/content")
            .send({ path: "docs/intro.md", content: edited, lastModified: loaded.lastModified })
            .expect(200);

        const onDisk = await fs.readFile(path.join(contentDir, "docs", "intro.md"), "utf8");
        expect(onDisk).toBe(edited);

        // Frontmatter survives the round trip rather than being re-serialised.
        const reloaded = await load("docs/intro.md");
        expect(reloaded.frontmatter.title).toBe("Intro");
        expect(reloaded.raw.startsWith("---\ntitle: Intro\n---")).toBe(true);
    });

    it("refuses a save whose file moved on since it was loaded", async () => {
        const loaded = await load("docs/second.md");

        // Someone else writes between the load and the save.
        await new Promise(resolve => setTimeout(resolve, 10));
        await fs.writeFile(path.join(contentDir, "docs", "second.md"), "# Second, by someone else\n");

        const response = await request(app)
            .put("/api/files/content")
            .send({ path: "docs/second.md", content: "# Mine\n", lastModified: loaded.lastModified })
            .expect(409);
        expect(response.body.error).toMatch(/changed on disk/i);

        // The other author's work is still there.
        const onDisk = await fs.readFile(path.join(contentDir, "docs", "second.md"), "utf8");
        expect(onDisk).toBe("# Second, by someone else\n");
    });

    it("saves without a stamp, for a caller that does not track one", async () => {
        await request(app)
            .put("/api/files/content")
            .send({ path: "docs/second.md", content: "# Overwritten deliberately\n" })
            .expect(200);
    });

    it.each(BODY_ESCAPES)("refuses to write outside the content folder: %s", async escape => {
        const response = await request(app).put("/api/files/content").send({ path: escape, content: "owned" });
        expect(response.status).toBe(403);
        expect(await fs.readFile(outsideMarker, "utf8")).toBe("secret");
    });

    it("refuses to write through a traversal that names a real file", async () => {
        const escape = `../${path.basename(outsideMarker)}`;
        await request(app).put("/api/files/content").send({ path: escape, content: "owned" }).expect(403);
        expect(await fs.readFile(outsideMarker, "utf8")).toBe("secret");
    });

    it("will not create a document, only edit one", async () => {
        await request(app)
            .put("/api/files/content")
            .send({ path: "docs/not-there.md", content: "# Hello\n" })
            .expect(404);
    });

    it("refuses a folder and an extension the reader cannot render", async () => {
        await request(app).put("/api/files/content").send({ path: "docs", content: "x" }).expect(400);

        await fs.writeFile(path.join(contentDir, "config.json"), "{}\n");
        await request(app).put("/api/files/content").send({ path: "config.json", content: "{}" }).expect(400);
    });

    it("requires a path and string content", async () => {
        await request(app).put("/api/files/content").send({ content: "x" }).expect(400);
        await request(app).put("/api/files/content").send({ path: "docs/intro.md", content: 42 }).expect(400);
    });

    it("leaves no temporary file behind", async () => {
        const entries = await fs.readdir(path.join(contentDir, "docs"));
        expect(entries.filter(name => name.endsWith(".tmp"))).toEqual([]);
    });
});

describe("the trash", () => {
    const trashDir = () => path.join(path.dirname(contentDir), "trash");
    const list = () =>
        request(app)
            .get("/api/trash")
            .expect(200)
            .then(response => response.body.data);

    beforeEach(async () => {
        await fs.rm(trashDir(), { recursive: true, force: true });
    });

    it("a delete moves the document out rather than destroying it", async () => {
        await fs.writeFile(path.join(contentDir, "docs", "doomed.md"), "# Doomed\n");

        const response = await request(app)
            .delete("/api/files")
            .send({ paths: ["docs/doomed.md"] })
            .expect(200);
        expect(response.body.data.deleted[0].trashId).toBeTruthy();

        // Gone from the content folder…
        await expect(fs.access(path.join(contentDir, "docs", "doomed.md"))).rejects.toThrow();

        // …and waiting in the trash, with where it came from recorded.
        const entries = await list();
        expect(entries).toHaveLength(1);
        expect(entries[0]).toMatchObject({ originalPath: "docs/doomed.md", name: "doomed.md", type: "file" });
    });

    it("restores a document to the path it came from", async () => {
        await fs.writeFile(path.join(contentDir, "docs", "returning.md"), "# Returning\n");
        await request(app)
            .delete("/api/files")
            .send({ paths: ["docs/returning.md"] })
            .expect(200);

        const [entry] = await list();
        await request(app).post("/api/trash/restore").send({ id: entry.id }).expect(200);

        expect(await fs.readFile(path.join(contentDir, "docs", "returning.md"), "utf8")).toBe("# Returning\n");
        expect(await list()).toHaveLength(0);
    });

    it("restores a whole folder with its documents inside", async () => {
        await fs.mkdir(path.join(contentDir, "notes"), { recursive: true });
        await fs.writeFile(path.join(contentDir, "notes", "one.md"), "# One\n");
        await fs.writeFile(path.join(contentDir, "notes", "two.md"), "# Two\n");

        await request(app)
            .delete("/api/files")
            .send({ paths: ["notes"] })
            .expect(200);
        const [entry] = await list();
        expect(entry.type).toBe("folder");

        await request(app).post("/api/trash/restore").send({ id: entry.id }).expect(200);
        expect((await fs.readdir(path.join(contentDir, "notes"))).sort()).toEqual(["one.md", "two.md"]);
    });

    it("will not overwrite something that took the name in the meantime", async () => {
        await fs.writeFile(path.join(contentDir, "docs", "contested.md"), "# Original\n");
        await request(app)
            .delete("/api/files")
            .send({ paths: ["docs/contested.md"] })
            .expect(200);

        await fs.writeFile(path.join(contentDir, "docs", "contested.md"), "# Someone else's\n");

        const [entry] = await list();
        await request(app).post("/api/trash/restore").send({ id: entry.id }).expect(409);

        expect(await fs.readFile(path.join(contentDir, "docs", "contested.md"), "utf8")).toBe("# Someone else's\n");
        expect(await list()).toHaveLength(1);
    });

    it("purges for good, and only what was asked for", async () => {
        await fs.writeFile(path.join(contentDir, "docs", "gone-a.md"), "a");
        await fs.writeFile(path.join(contentDir, "docs", "gone-b.md"), "b");
        await request(app)
            .delete("/api/files")
            .send({ paths: ["docs/gone-a.md", "docs/gone-b.md"] })
            .expect(200);

        const entries = await list();
        expect(entries).toHaveLength(2);

        await request(app)
            .delete("/api/trash")
            .send({ ids: [entries[0].id] })
            .expect(200);
        const left = await list();
        expect(left).toHaveLength(1);
        expect(left[0].id).toBe(entries[1].id);
    });

    it.each(["..", "../..", "/", "docs/../.."])("refuses an id that climbs out of the trash: %s", async id => {
        // A purge is permanent, so an id that resolves outside the trash must not
        // be followed — this is the one endpoint where being wrong is unrecoverable.
        await request(app)
            .delete("/api/trash")
            .send({ ids: [id] })
            .expect(200);
        expect(await fs.readFile(outsideMarker, "utf8")).toBe("secret");
        await fs.access(path.join(contentDir, "docs", "intro.md"));
    });

    it("reports an unknown id rather than pretending", async () => {
        await request(app).post("/api/trash/restore").send({ id: "nope" }).expect(404);
        await request(app).post("/api/trash/restore").send({}).expect(404);
        await request(app).delete("/api/trash").send({ ids: [] }).expect(400);
    });

    it("keeps the trash out of the content tree and the survey", async () => {
        await fs.writeFile(path.join(contentDir, "docs", "counted.md"), "# Counted\n");
        const before = await request(app).get("/api/statistics").expect(200);

        await request(app)
            .delete("/api/files")
            .send({ paths: ["docs/counted.md"] })
            .expect(200);
        const after = await request(app).get("/api/statistics").expect(200);

        expect(after.body.data.totalDocuments).toBe(before.body.data.totalDocuments - 1);

        const names = (await request(app).get("/api/files").expect(200)).body.data.map(
            (item: { originalName?: string }) => item.originalName
        );
        expect(names).not.toContain("trash");
    });
});

describe("compiling MDX is the operator's decision", () => {
    it("health reports it off unless the operator says otherwise", async () => {
        const response = await request(app).get("/api/health").expect(200);

        // The default matters: the upload endpoint has no authentication, so a
        // service that executed uploaded documents out of the box would hand
        // anyone who can reach it a script in every reader's session.
        expect(response.body.data.mdxExecute).toBe(false);
    });
});

describe("searching the collection", () => {
    // `q` is the query parameter's real name, so it goes in the URL rather than
    // through an options object where it reads as a one-letter identifier.
    const search = (text: string) =>
        request(app)
            .get(`/api/search?q=${encodeURIComponent(text)}`)
            .expect(200)
            .then(response => response.body.data);

    beforeAll(async () => {
        await fs.writeFile(
            path.join(contentDir, "docs", "haystack.md"),
            ["# Haystack", "", "A first mention of needle here.", "", "And a second needle further down.", ""].join(
                "\n"
            )
        );
        await fs.writeFile(path.join(contentDir, "docs", "needle-by-name.md"), "# Nothing relevant inside\n");
        await fs.writeFile(path.join(contentDir, "docs", "literal.md"), "Regex characters like .* and [!NOTE] here.\n");
    });

    it("finds a document by what is written inside it", async () => {
        const { hits } = await search("second needle");
        const hit = hits.find((entry: { path: string }) => entry.path === "docs/haystack.md");

        expect(hit).toBeTruthy();
        expect(hit.line).toBe(5);
        expect(hit.excerpt).toContain("second needle");
        // The client marks the match rather than searching the excerpt again.
        expect(hit.excerpt.slice(hit.at, hit.at + hit.length)).toBe("second needle");
    });

    it("puts a name match above a body match", async () => {
        const { hits } = await search("needle");
        expect(hits[0].path).toBe("docs/needle-by-name.md");
        expect(hits[0].inName).toBe(true);

        const body = hits.find((entry: { path: string }) => entry.path === "docs/haystack.md");
        expect(body.inName).toBe(false);
        expect(body.more).toBe(1); // two lines mention it; one is the excerpt
    });

    it("ignores case", async () => {
        const { hits } = await search("HAYSTACK");
        expect(hits.some((entry: { path: string }) => entry.path === "docs/haystack.md")).toBe(true);
    });

    it("treats the query as text, not a pattern", async () => {
        // `.*` compiled as a regular expression would match every document.
        const wildcard = await search(".*");
        expect(wildcard.hits.map((entry: { path: string }) => entry.path)).toEqual(["docs/literal.md"]);

        const bracketed = await search("[!NOTE]");
        expect(bracketed.hits.map((entry: { path: string }) => entry.path)).toEqual(["docs/literal.md"]);
    });

    it("answers an empty query with nothing, not an error", async () => {
        expect(await search("")).toEqual({ query: "", hits: [] });
        expect(await search("   ")).toEqual({ query: "", hits: [] });
    });

    it("refuses a query long enough to be a mistake", async () => {
        await request(app)
            .get(`/api/search?q=${"x".repeat(201)}`)
            .expect(400);
    });

    it("never reaches outside the content folder", async () => {
        // The marker file one level up says "secret" and must never be a result.
        const { hits } = await search("secret");
        expect(hits).toEqual([]);
    });
});

describe("importing a folder", () => {
    const importInto = (body: Record<string, unknown>) => request(app).post("/api/import").send(body);

    it("brings a tree in with its structure intact", async () => {
        const response = await importInto({
            documents: [
                { path: "handbook/index.md", content: "# Handbook\n" },
                { path: "handbook/guides/setup.md", content: "# Setup\n" },
                { path: "handbook/guides/deep/nested.mdx", content: "# Nested\n" },
            ],
        }).expect(200);

        expect(response.body.data.imported.map((entry: { path: string }) => entry.path)).toEqual([
            "handbook/index.md",
            "handbook/guides/setup.md",
            "handbook/guides/deep/nested.mdx",
        ]);
        expect(response.body.data.skipped).toEqual([]);

        expect(await fs.readFile(path.join(contentDir, "handbook", "guides", "deep", "nested.mdx"), "utf8")).toBe(
            "# Nested\n"
        );
    });

    it("imports under a target folder when given one", async () => {
        await importInto({
            path: "docs",
            documents: [{ path: "imported/note.md", content: "# Note\n" }],
        }).expect(200);

        await fs.access(path.join(contentDir, "docs", "imported", "note.md"));
    });

    it("skips a document whose destination is taken, and does not touch it", async () => {
        await fs.writeFile(path.join(contentDir, "docs", "held.md"), "# Mine\n");

        const response = await importInto({
            path: "docs",
            documents: [{ path: "held.md", content: "# Theirs\n" }],
        }).expect(200);

        expect(response.body.data.imported).toEqual([]);
        expect(response.body.data.skipped[0]).toMatchObject({ path: "docs/held.md", reason: "Already exists" });
        expect(await fs.readFile(path.join(contentDir, "docs", "held.md"), "utf8")).toBe("# Mine\n");
    });

    it("skips anything that is not a document", async () => {
        const response = await importInto({
            documents: [
                { path: "mixed/readme.md", content: "# Readme\n" },
                { path: "mixed/logo.png", content: "binary-ish" },
                { path: "mixed/.DS_Store", content: "junk" },
                { path: "mixed/no-extension", content: "junk" },
            ],
        }).expect(200);

        expect(response.body.data.imported).toHaveLength(1);
        expect(response.body.data.skipped.map((entry: { reason: string }) => entry.reason)).toEqual([
            "Not a document: .png",
            // `path.extname(".DS_Store")` is empty: a leading-dot file has no
            // extension as far as Node is concerned.
            "Not a document: no extension",
            "Not a document: no extension",
        ]);
    });

    it.each([
        "../escaped.md",
        "../../escaped.md",
        "docs/../../escaped.md",
        "handbook/../../escaped.md",
        "/etc/passwd.md",
    ])("refuses to write outside the content folder: %s", async escape => {
        const response = await importInto({ documents: [{ path: escape, content: "owned" }] }).expect(200);

        // Nothing lands, and the marker one level above the root is untouched.
        expect(response.body.data.imported).toEqual([]);
        expect(response.body.data.skipped).toHaveLength(1);
        expect(await fs.readFile(outsideMarker, "utf8")).toBe("secret");
    });

    it("strips a control character from a name, and reports the name it used", async () => {
        // Built rather than written out: a literal control character in source is
        // invisible to whoever reads the test next.
        const sneaky = `handbook/note${String.fromCharCode(1)}.md`;

        const response = await importInto({ documents: [{ path: sneaky, content: "x" }] }).expect(200);

        // Sanitised rather than refused, as uploads are — but the reported path is
        // the one on disk, so a renamed document is never a silent surprise.
        expect(response.body.data.imported[0].path).toBe("handbook/note.md");
        await fs.access(path.join(contentDir, "handbook", "note.md"));
    });

    it("refuses a tree deeper than the limit", async () => {
        const deep = `${Array.from({ length: 12 }, (_, index) => `level${index}`).join("/")}/too-deep.md`;

        const response = await importInto({ documents: [{ path: deep, content: "x" }] }).expect(200);
        expect(response.body.data.imported).toEqual([]);
        expect(response.body.data.skipped[0].reason).toMatch(/depth/i);
    });

    it("refuses a target folder outside the content root", async () => {
        await importInto({ path: "../..", documents: [{ path: "x.md", content: "x" }] }).expect(403);
    });

    it("bounds one request, so a big folder has to be batched", async () => {
        const many = Array.from({ length: 51 }, (_, index) => ({
            path: `bulk/doc-${index}.md`,
            content: "x",
        }));

        await importInto({ documents: many }).expect(400);
        await expect(fs.access(path.join(contentDir, "bulk"))).rejects.toThrow();
    });

    it("requires documents", async () => {
        await importInto({}).expect(400);
        await importInto({ documents: [] }).expect(400);
    });
});
