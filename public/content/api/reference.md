---
title: "API Reference"
description: "The HTTP endpoints, the client, and the hooks that exist"
author: "Development Team"
date: "2026-09-03"
tags: ["api", "reference", "documentation"]
---

# API Reference

Everything below was checked against the code. The previous version of this page
documented `DocumentViewer`, `exportToPDF`, `exportToHTML`, `printDocument`,
`FileSystemAPI` and `useFileSystem` — six things that no longer exist, and in
some cases never worked as described.

## HTTP endpoints

The file service. Every response is `{ success, data?, error?, message? }`.

| Method   | Path                          | What it does                              |
| -------- | ----------------------------- | ----------------------------------------- |
| `GET`    | `/api/health`                 | Liveness, plus the content path in use    |
| `GET`    | `/api/statistics`             | Counts computed by walking the folder     |
| `GET`    | `/api/files`                  | The whole tree: folders, files, sizes      |
| `GET`    | `/api/search?q=`              | Documents matching by name or by contents  |
| `GET`    | `/api/files/content?path=`    | One document, frontmatter split out        |
| `POST`   | `/api/files/create`           | `{ name, type: "md" \| "mdx", path, content? }` |
| `POST`   | `/api/folders/create`         | `{ name, path }`                          |
| `POST`   | `/api/files/upload`           | Multipart; `.md`, `.mdx`, `.txt` only     |
| `DELETE` | `/api/files`                  | `{ paths: string[] }` — moves to the trash |
| `POST`   | `/api/files/move`             | `{ sourcePath, targetPath }`              |
| `PUT`    | `/api/files/content`          | `{ path, content, lastModified? }` — overwrite |
| `GET`    | `/api/trash`                  | What is waiting to be restored             |
| `POST`   | `/api/trash/restore`          | `{ id }` — back to where it came from      |
| `DELETE` | `/api/trash`                  | `{ ids: string[] }` — permanent            |
| `GET`    | `/api/previews/**`            | A document's preview image, any depth      |

### Paths are confined to the content folder

Every `path` in a request is resolved and then checked for containment inside the
content root, and symlinks are followed for anything that already exists. A path
that lands outside returns **403**:

```bash
curl "http://localhost:3001/api/files/content?path=../../package.json"
# {"success":false,"error":"Path is outside the content folder"}
```

There is no authentication. Anyone who can reach the service can read, write and
delete **inside** that folder.

### Reading a document

Frontmatter is parsed on the server, so the viewer never prints YAML as prose:

```jsonc
// GET /api/files/content?path=docs/introduction.md
{
    "success": true,
    "data": {
        "path": "docs/introduction.md",
        "content": "\n# Introduction to MDX Viewer\n\nWelcome…",
        "frontmatter": { "title": "Introduction to MDX Viewer", "tags": ["guide"] },
        "size": 2678,
        "lastModified": "2026-06-26T10:09:00.000Z"
    }
}
```

### Saving a document

`PUT /api/files/content` writes the text exactly as given, frontmatter included. It edits an
existing document only — creating one is `POST /api/files/create` — and it refuses anything
but `.md`, `.mdx` and `.txt`.

Send back the `lastModified` the read returned. If the file changed on disk in between, the
save is refused rather than applied:

```bash
curl -X PUT localhost:3001/api/files/content -H 'Content-Type: application/json' \
  -d '{"path":"docs/introduction.md","content":"…","lastModified":"1999-01-01T00:00:00.000Z"}'
# 409 {"success":false,"error":"This document changed on disk since you opened it. …"}
```

Omitting `lastModified` skips the comparison and overwrites — that is what the editor's
"Overwrite anyway" does. The write itself goes to a temporary file and is renamed into
place, so an interrupted save cannot leave a truncated document.

### The trash

A delete no longer unlinks anything. It moves the item to `public/trash`, a sibling of the
content folder, as one directory per entry:

```text
trash/<id>/meta.json   where it came from, its size, and when it went
trash/<id>/<name>      the document or folder itself
```

A directory per entry rather than a shared index, because two people deleting at once
would race on one file. Being outside the content root is what keeps a deleted document
out of the tree, the chart and the survey.

`POST /api/trash/restore` puts an entry back at its recorded path and **refuses with 409**
if something has since taken that name — restoring never overwrites. `DELETE /api/trash` is
the only unrecoverable call in this service.

### Searching

`GET /api/search?q=` reads every document in the content folder and returns the ones
whose name or body contains the query. Each hit carries the matching line, its number,
how many further matches the document holds, the document's measured size, and **where
the match sits inside the excerpt** — the client marks it from that rather than
searching the excerpt again, so the two can never disagree.

The query is compared as text, never compiled to a regular expression: a search for
`.*` finds those two characters. A name match sorts above a body match.

It is a scan, so it is linear in the size of the collection — milliseconds for 76
documents. A collection large enough to feel that wants an index keyed by mtime,
behind the same function in `server/utils/search.ts`.

## The client

`src/api/fileAPI.ts` is the only client. Its base URL is relative, so the built
app talks to whatever origin serves it; set `VITE_API_URL` when the service lives
somewhere else.

```ts
import { FileAPI } from "@/api/fileAPI";

await FileAPI.getFileList(); // FileItem[]
await FileAPI.getFileContent("docs/introduction.md"); // DocumentContent
await FileAPI.createFile({ name: "notes", type: "md", path: "docs" });
await FileAPI.createFolder({ name: "release-notes", path: "" });
await FileAPI.uploadFiles(files, "docs"); // UploadResult
await FileAPI.deleteItems(["docs/notes.md"]);
await FileAPI.moveItem({ sourcePath: "docs/notes.md", targetPath: "" });
await FileAPI.saveFileContent({ path: "docs/notes.md", content: raw, lastModified });
await FileAPI.search("frontmatter"); // SearchHit[]
await FileAPI.getTrash(); // TrashEntry[]
await FileAPI.restoreFromTrash(entryId);
await FileAPI.purgeTrash([entryId]); // permanent
```

Types it exports: `FileItem`, `ApiResponse<T>`, `CreateFileRequest`,
`CreateFolderRequest`, `SaveFileRequest`, `DocumentFrontmatter`, `DocumentContent`,
`SearchHit`, `ServiceHealth`, `TrashEntry`, `UploadResult`.

`DocumentContent.raw` is the file as it sits on disk; `content` is the same file with its
frontmatter split off. The editor works on `raw` so a save cannot reformat YAML the author
never touched.

## Hooks

`src/hooks/api/useFiles.ts` wraps the client in TanStack Query. Mutations
invalidate the file list on success, so the tree and the chart refresh together.

```ts
import {
    useFiles,
    useFileContent,
    useCreateFile,
    useCreateFolder,
    useDeleteFiles,
    useSaveFile,
    useSearch,
    useServiceHealth,
    useTrash,
    useRestoreFromTrash,
    usePurgeTrash,
    useUploadFiles,
    useMoveItem,
} from "@/hooks/api/useFiles";

const { data: files, isLoading, error } = useFiles();
const { data: document } = useFileContent("docs/introduction.md");
```

## The chart layer

`src/lib/atlas.ts` turns a `FileItem` tree into catalogued objects. Every value
is computed from something the filesystem reports:

```ts
import { chartCollection, formatMagnitude, magnitudeFromSize } from "@/lib/atlas";

const objects = chartCollection(files); // AtlasObject[]
```

| Function                  | What it gives                                                     |
| ------------------------- | ----------------------------------------------------------------- |
| `chartCollection(files)`  | Objects with designation, magnitude, plate and chart position      |
| `magnitudeFromSize(size)` | 0–5 on a log2 ramp anchored at 1 KiB; 32 KiB and over is 0         |
| `formatMagnitude(size)`   | The ramp printed as an integer, or `—` for a 0-byte file           |
| `platesOf(objects)`       | One entry per folder: count and where its constellation sits       |
| `formatSize`, `formatEpoch` | Tabular figures for bytes and dates                             |

An object's position is a pure function of its path, so the same document lands
in the same place every time the sky is drawn.

## Rendering

`MarkdownRenderer` takes `content` and renders it. Raw HTML is allowed and then
filtered with `rehype-sanitize`, because documents arrive through the upload
endpoint — unsanitised output would let any uploaded file run script in a
reader's session.

Code fences are highlighted by Shiki against two themes built from this product's
tokens, with the grammar for that one language fetched on demand — a document with a
single `bash` block does not pull TypeScript's. A ```mermaid fence is drawn as a
diagram, with Mermaid imported only when one is present. A blockquote opening
`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` becomes a callout.

MDX is compiled **only when the operator allows it**. `GET /api/health` reports
`mdxExecute`, set by `MDX_EXECUTE=true` on the service, and the client follows it.

With it off — the default — `.mdx` renders through the same Markdown pipeline as
`.md`; `readMdxSource()` in `src/utils/mdxSource.ts` removes imports, exports and
JSX so the source is not printed as prose, and the viewer prints a "Not executed"
notice.

With it on, the document is compiled with `@mdx-js/mdx` and its components run.
`stripMdxImports()` removes every `import` first, so a document cannot reach a URL
or a bundle; in exchange it is given a vocabulary by name — `Alert`, `Badge`,
`Button`, `Card` and their parts — and keeps whatever it defines itself. A
document that will not compile prints why and falls back to the Markdown reading.

The reason for the switch: there is no authentication on the upload endpoint, so
compiling is only safe where the content folder is trusted.

## There is no export API

`exportToPDF`, `exportToHTML` and `printDocument` were documented here and are
gone. Printing is `window.print()` against a real `@media print` stylesheet: the
shell is dropped, height caps are lifted, the light rendition is forced onto
white, and external links print their URL beside them. Use the browser's
"Print to PDF" for a file.
