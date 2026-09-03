# MDXViewer

A self-hosted workspace for a folder of Markdown and MDX documentation. Point it at a
directory your team already owns and it charts the whole collection, reads any document
in it, and lets you reorganize the folder itself — create, upload, move and delete.

The interface is built as an engraved star atlas: every document is a catalogued object
with a designation and a magnitude, folders are constellations, and the one amber colour
on screen belongs to the observer — where you are, what you selected, what you are about
to change. See [`DESIGN.md`](DESIGN.md) for the system and [`PRODUCT.md`](PRODUCT.md) for
what the product is and is not.

## Surfaces

| Route         | What it is                                                           |
| ------------- | -------------------------------------------------------------------- |
| `/`           | The chart. Every document plotted by size, folders drawn and named.  |
| `/docs`       | The catalogue. Plate cards or a register, filtered by name and type. |
| `/document/*` | The document plate: a title block from frontmatter, prose, contents. |
| `/statistics` | The survey. Measurements taken from the content folder.              |

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

## Scripts

| Script                            | What it does                                        |
| --------------------------------- | --------------------------------------------------- |
| `pnpm run dev`                    | Client and file service together                    |
| `pnpm run build`                  | `tsc -b` then `vite build`                          |
| `pnpm run lint`                   | ESLint (formatting is Prettier's job, not ESLint's) |
| `pnpm run format`                 | Prettier over `src`, `server` and `scripts`         |
| `pnpm run test:run`               | Vitest, once — in process, against a temp folder    |
| `pnpm run verify`                 | Format, lint, build, tests — exactly what CI runs   |
| `pnpm start`                      | Production: the service serving the built client    |
| `pnpm run generate:previews-safe` | Regenerate the SVG document previews                |

CI runs `pnpm run verify` on Linux — one command, the same one you run locally, on the
platform where a case-mismatched import actually fails. Contributor instructions live in
[`AGENTS.md`](AGENTS.md).

## Project structure

```text
src/
├── lib/atlas.ts        # File → catalogued object: magnitude, plate, position
├── components/atlas/   # The chart layer: canvas chart, plates, magnitude marks
├── components/ui/      # shadcn primitives, rebuilt in this world's vocabulary
├── components/navigation/  # The plate index (file tree, drag and drop, dialogs)
├── pages/              # One file per surface
├── api/fileAPI.ts      # The single client for the file service
└── assets/styles/      # Token layer and the document typeset

server/
├── app.ts              # Routes, middleware, uploads; serves dist in production
├── start.ts            # Binds the port
├── endpoints/          # files, file management, previews, statistics
└── utils/              # scanning, formatting, validation

public/content/         # The documentation the app charts
public/previews/        # Generated previews
```

## Known gaps

These are recorded rather than hidden:

- **There is no authentication.** Every path is now confined to the content folder and
  covered by tests, but anyone who can reach the service can read, write and delete
  inside that folder. Put it behind your own auth before exposing it.
- **MDX is not compiled.** `.mdx` files render through the same Markdown pipeline as
  `.md`; JSX inside them does not execute. The UI does not claim otherwise.
- **No trash.** A delete is `fs.rm`; the confirmation states how many documents go, but
  nothing comes back.
- **Reads and readers are not counted**, so the survey reports file facts only.

## Contributing

Run `pnpm run verify` before opening a pull request; CI runs that exact command.
[`AGENTS.md`](AGENTS.md) is the single set of instructions — read it first.

## License

Not yet chosen.
