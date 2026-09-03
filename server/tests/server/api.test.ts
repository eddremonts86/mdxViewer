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
import { afterAll, beforeAll, describe, expect, it } from "vitest";

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
