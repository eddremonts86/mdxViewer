# MDXViewer

A self-hosted workspace for a folder of Markdown and MDX documentation. Point it at a
directory your team already owns and it charts the whole collection, searches every
document by what is written inside it, edits any of them in place, and lets you
reorganize the folder itself — create, upload, move and delete, with deletes that come
back.

The interface is built as an engraved star atlas: every document is a catalogued object
with a designation and a magnitude, and the collection is plotted in three dimensions as
the graph it already is — a folder is a hub, the documents inside it hang from it, and
every edge means one thing: is inside. Each folder carries its own hue, on every surface;
amber belongs to the observer alone — where you are, what you selected, what you are
about to change. See [`DESIGN.md`](DESIGN.md) for the system and [`PRODUCT.md`](PRODUCT.md) for
what the product is and is not.

## Surfaces

| Route         | What it is                                                           |
| ------------- | -------------------------------------------------------------------- |
| `/`           | The chart. Every document plotted by size, folders drawn and named.  |
| `/docs`       | The catalogue. Plate cards or a register, filtered by name and type. |
| `/document/*` | The document plate: a title block from frontmatter, prose, contents. |
| `/statistics` | The survey. Measurements taken from the content folder.              |
| `/trash`      | Deleted documents, with where they came from. Restore or purge.      |

## What it does

**Reading.** GFM tables, KaTeX math, and syntax highlighting by Shiki against two themes
built from the product's own tokens — one grammar fetched per language, on demand.
A `mermaid` fence is drawn as a diagram, with the library loaded only when a document
actually has one. A blockquote opening `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`,
`[!WARNING]` or `[!CAUTION]` becomes a callout. Light and dark are two renditions of one
tradition, not an inversion; `@media print` derives a third.

**Finding.** **⌘K** (Ctrl K) searches every document by name and by its contents, on the
server, and shows the matching line with the query marked and a count of the further
matches in that file. The query is compared as text, so searching for `.*` finds those
two characters. The plate index keeps its own filename filter, which is a different job.

**Editing.** **Edit** on any document opens its source beside a live preview. It edits the
file's raw text, frontmatter included, so a round trip never reformats YAML you did not
touch. Saving sends the mtime it loaded and the service refuses with 409 if the file moved
on, so a save cannot quietly overwrite an edit its author never saw; overwriting is a
separate, explicit choice. The write goes to a temporary file and is renamed into place.

**Organizing.** Create, upload, import a whole folder, move by drag and drop, delete,
multi-select. **Import a folder** takes every `.md` and `.mdx` inside it at any depth and
keeps the structure; it says what it found and what it is leaving behind — images,
`.DS_Store`, anything under `node_modules` — before it writes anything, and a document whose
name is already taken is skipped and reported rather than overwritten. Deleting moves
items to `public/trash` and the confirmation says so; restoring puts one back at the path
it came from and refuses if something has since taken that name. The plate index is fully
operable by keyboard: arrows walk the rows and open and close a folder, Home and End jump
the ends, and every row's actions menu is a real focusable control.

**MDX.** Off by default, `.mdx` renders as Markdown and says its components were not run.
With `MDX_EXECUTE=true` it is compiled and its components execute — see
[Deploying](#deploying) before you turn that on.

## Getting started

Requirements: Node 22+ and pnpm (`packageManager` in package.json pins the version;
corepack will pick it up).

```bash
pnpm install
pnpm run dev
```

`dev` runs two processes: the Vite client on :5173 and the file service on :3001. They
read different port variables on purpose — the client takes `PORT`, the service takes
`API_PORT` — because a single inherited `PORT` would make them fight over it.

Content lives in `public/content` by default. Point `CONTENT_DIR` at any folder to chart
documentation you already own; nothing outside that folder is reachable.

## Deploying

One service, one origin. The file service serves the built client, so `/api` resolves
relatively, CORS never enters it, and a deep link like `/document/docs/intro.md` falls
back to the app instead of 404ing.

```bash
docker build -t mdxviewer .
docker run -p 3001:3001 -v /path/to/your/docs:/app/public/content mdxviewer
```

Without Docker: `pnpm run build && pnpm start`.

| Variable           | Default                 | What it does                                  |
| ------------------ | ----------------------- | --------------------------------------------- |
| `API_PORT`         | `3001`                  | Port the service binds (`PORT` also honoured) |
| `CONTENT_DIR`      | `public/content`        | The folder this instance charts               |
| `ALLOWED_ORIGINS`  | `http://localhost:5173` | Comma-separated; the dev client only          |
| `MAX_FOLDER_DEPTH` | `10`                    | How deep the content tree may nest            |
| `MDX_EXECUTE`      | `false`                 | Compile `.mdx` and run its components         |

**Before setting `MDX_EXECUTE=true`:** there is no authentication on the upload endpoint,
so a compiled document is JavaScript running in every reader's session. Turn it on only
where you trust the content folder — a repository your team controls, or a deployment
behind your own auth. A compiled document may not import anything; it gets a fixed
component vocabulary and whatever it defines itself.

## Scripts

| Script                       | What it does                                        |
| ---------------------------- | --------------------------------------------------- |
| `pnpm run dev`               | Client and file service together                    |
| `pnpm run build`             | `tsc -b` then `vite build`                          |
| `pnpm run lint`              | ESLint (formatting is Prettier's job, not ESLint's) |
| `pnpm run format`            | Prettier over `src`, `server` and `scripts`         |
| `pnpm run test:run`          | Vitest, once — in process, against a temp folder    |
| `pnpm run verify`            | Format, lint, build, tests — exactly what CI runs   |
| `pnpm start`                 | Production: the service serving the built client    |
| `pnpm run generate:previews` | Regenerate the SVG document previews                |

CI runs `pnpm run verify` on Linux — one command, the same one you run locally, on the
platform where a case-mismatched import actually fails. Contributor instructions live in
[`AGENTS.md`](AGENTS.md).

## Project structure

```text
src/
├── lib/atlas.ts          # File → catalogued object: magnitude, plate, position
├── lib/highlighter.ts    # Shiki, with two themes built from the product's tokens
├── components/atlas/     # The chart layer: canvas chart, plates, magnitude marks
├── components/markdown/  # The render pipeline: code, diagrams, callouts, MDX
├── components/document/  # The document plate, its editor and its notices
├── components/navigation/# The plate index and the ⌘K palette
├── components/ui/        # shadcn primitives, rebuilt in this world's vocabulary
├── pages/                # One file per surface
├── api/fileAPI.ts        # The single client for the file service
└── assets/styles/        # Token layer and the document typeset

server/
├── app.ts                # Routes, middleware, uploads; serves dist in production
├── start.ts              # Binds the port
├── endpoints/            # files, file management, search, trash, previews, statistics
└── utils/                # scanning, search, trash, formatting, validation

public/content/           # The documentation the app charts
public/previews/          # Generated previews
public/trash/             # Deleted documents, waiting to be restored (not tracked)
```

## Known gaps

These are recorded rather than hidden:

- **There is no authentication.** Every path is confined to the content folder and covered
  by tests, but anyone who can reach the service can read, write and delete inside that
  folder. Put it behind your own auth before exposing it.
- **Search is a scan.** Every document is read on every query — milliseconds for the 76
  documents bundled here, linear forever. A collection large enough to feel it wants an
  index keyed by mtime; the place for one is named in `server/utils/search.ts`.
- **No merge on a concurrent edit.** The editor refuses a stale save rather than losing
  work, but resolving it is a choice between reloading and overwriting, not a merge.
- **The trash never empties itself.** Items wait in `public/trash` until someone restores
  them or deletes them for good. There is no retention policy and no size cap.
- **A compiled MDX document is not sandboxed.** Its imports are stripped, but its
  expressions run. That is why `MDX_EXECUTE` exists and why it is off by default.
- **Reads and readers are not counted**, so the survey reports file facts only.

## Contributing

Run `pnpm run verify` before opening a pull request; CI runs that exact command.
[`AGENTS.md`](AGENTS.md) is the single set of instructions — read it first.

## License

Not yet chosen.
