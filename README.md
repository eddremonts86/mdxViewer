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

| Route        | What it is                                                             |
| ------------ | ---------------------------------------------------------------------- |
| `/`          | The chart. Every document plotted by size, folders drawn and named.     |
| `/docs`      | The catalogue. Plate cards or a register, filtered by name and type.    |
| `/document/*`| The document plate: a title block from frontmatter, prose, contents.    |
| `/statistics`| The survey. Measurements taken from the content folder.                 |

## Getting started

Requirements: Node 22+ and pnpm.

```bash
pnpm install
pnpm run dev
```

`dev` runs two processes: the Vite client on :5173 and the Express file service on :3001.
The client talks to `/api` relatively; set `VITE_API_URL` when the API lives on another
origin.

Content lives in `public/content`. Anything you drop there appears on the chart.

## Scripts

| Script                | What it does                                              |
| --------------------- | --------------------------------------------------------- |
| `pnpm run dev`        | Client and file service together                          |
| `pnpm run build`      | `tsc -b` then `vite build`                                |
| `pnpm run lint`       | ESLint (formatting is Prettier's job, not ESLint's)       |
| `pnpm run format`     | Prettier over `src`, `server` and `scripts`               |
| `pnpm run test:run`   | Vitest, once                                              |
| `pnpm run generate:previews-safe` | Regenerate the SVG document previews          |

CI runs formatting, lint and the build on Linux — on purpose, because that is where a
case-mismatched import fails and macOS does not.

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
├── clean-server.ts     # Express app and routes
├── endpoints/          # files, file management, previews, statistics
└── utils/              # scanning, formatting, validation

public/content/         # The documentation the app charts
public/previews/        # Generated previews
```

## Known gaps

These are recorded rather than hidden:

- **The file service is not access-controlled.** `validatePath()` exists in
  `server/utils/validation.ts` and is not yet called by the endpoints, so a crafted
  `path` can read and write outside `public/content`. Do not expose this to a network
  you do not control until that is fixed.
- **MDX is not compiled.** `.mdx` files render through the same Markdown pipeline as
  `.md`; JSX inside them does not execute. The UI does not claim otherwise.
- **The server tests need a listening server** and are being rewritten to run in
  process; they are not in CI yet.
- **Reads and readers are not counted**, so the survey reports file facts only.

## Contributing

Run `pnpm run format && pnpm run lint && pnpm run build` before opening a pull request;
CI runs the same three. Interface copy, code and commits are English.

## License

Not yet chosen.
