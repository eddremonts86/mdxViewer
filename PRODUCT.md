# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two confirmed audiences, in this order:

1. **Small internal teams** — developers, PMs and designers reading the same deployed
   documentation set. Several people hit one running instance. No authentication exists today.
2. **Other teams installing it over their own docs folder** — MDXViewer is pointed at a
   directory of `.md` / `.mdx` files that the installing team already owns and version-controls.

Both audiences read, organize and (as a committed capability) edit documents. Neither is a
single-user local-only scenario, so multi-user write access and deployability are product
requirements rather than nice-to-haves.

## Product Purpose

A self-hosted workspace for a body of Markdown/MDX documentation: browse the whole collection,
read individual documents, edit them in place, and change the collection itself — create,
upload, import a folder, move and delete files against a real directory on disk. Success is a team pointing it at their docs folder
and using it as the place where that documentation is read and maintained.

## Positioning

Two mechanisms, both confirmed as the product's reason to exist:

- **Write access to a real folder.** It is a file manager, not only a renderer: create, upload,
  drag-and-drop move and delete operate on the actual directory. Readers of the same docs can
  reorganize them. Docusaurus and static site generators only read; Obsidian and Notion take
  ownership of the format and the vault.
- **MDX with live React components.** Documentation that executes components inside the page,
  not a screenshot of a component. Implemented, and **off unless the operator turns it on**
  (`MDX_EXECUTE=true`). There is no authentication on the upload endpoint, so executing whatever
  sits in the content folder is safe only where the operator trusts that folder; the product
  states the trade and lets them decide rather than deciding for them. With it off — the
  default — `.mdx` renders as Markdown and says its components were not run.

## Operating Context

- Content lives in a directory of `.md` / `.mdx` files (`public/content` in this repo), organized in
  nested folders. The working set today is 76 documents across API, Docs, Examples, Guides,
  Project Docs and Tests.
- Documents carry YAML frontmatter (`title`, `description`, `author`, `date`, `tags`).
- Each document has a generated visual preview (SVG today, PNG when generated) used in list views.
- Two processes in development — a Vite SPA and an Express file API — and one in production:
  the service serves the built client from a single origin. A Dockerfile ships it; the content
  folder is a volume, not part of the image.

## Capabilities and Constraints

**Confirmed capabilities — durable, the design must serve all four:**

- File management: create file, create folder, upload, import a whole folder with its
  structure intact, move by drag and drop, delete, multi-select. A delete is recoverable: the item moves to a trash beside the content folder
  and is restored to the path it came from, or removed for good on a second, separate ask.
- Visual previews of every document, used in collection views.
- A statistics surface describing the collection. Every figure is computed by walking the
  content folder. It once reported 12,489 views and 573 documents against a real 76; that is
  the failure mode this capability exists to avoid.
- An in-app document editor. Edits the file's raw text, frontmatter included, with a live
  preview beside it. A save is refused with 409 when the file changed on disk since it was
  opened, and the author is told rather than silently overwriting the other edit.

**Also present:** document viewer with table of contents, full-text search over every
document's contents (⌘K), filename filtering in the plate index, folder tree navigation
operable by keyboard, light/dark theme, printing through a real print stylesheet, GFM tables,
KaTeX math, syntax highlighting, `mermaid` diagrams, and GitHub-style callouts.

**Technical constraints:** React 19, TypeScript strict, Vite 6, Tailwind CSS v4 (CSS-first tokens —
`tailwind.config.js` is not read), shadcn/ui (new-york), TanStack Query for server state,
react-router-dom, Express 5 + multer on the API. Node 22 in CI.

**Undecided / not yet true — do not present as working:**

- Authentication and permissions. Concurrent writes are detected (the editor refuses a stale
  save) but not merged: the loser chooses between reloading and overwriting.
- Real read/usage measurement behind the statistics surface.
- **Rename.** Move relocates an item and keeps its name — the endpoint takes a destination
  folder, not a destination path — so renaming a document is not reachable from any surface.
- MDX compilation with an untrusted content folder. A compiled document may not import, and
  gets a fixed component vocabulary plus whatever it defines itself, but its expressions do
  run. Nothing here sandboxes them.

## Brand Commitments

- Name: **MDXViewer**.
- Interface language: **English only**, including labels, copy and errors. Code, comments and
  commits are English as well. The panel that read "Índice de Contenido" for months is the
  failure mode; it is fixed, and the rule is in `AGENTS.md` because no tool checks it.
- A visual world is committed and documented in `DESIGN.md`: the observer's plate, two
  renditions of one tradition, one accent hue, and a typographic commitment — Bodoni Moda for
  display, Archivo for interface, JetBrains Mono for code. The slate/blue shadcn defaults that
  preceded it were an unconfigured starting point; they are gone.
- No logo or wordmark has been established.

## Evidence on Hand

- 76 real documents in `public/content`, with real frontmatter, and 76 generated previews in
  `public/previews`.
- A working file API: health, statistics, file tree, file content, save, search, create, upload,
  delete (to the trash), restore, purge, move, previews.
- 67 server tests, run in process against a temporary content folder, covering the containment
  guards on every path that reads, writes, moves or deletes.
- No users, customers, testimonials, benchmarks, pricing, licensing or deployment record exists.
  None may be invented in any surface.

## Product Principles

1. **The folder is the source of truth.** The interface reflects a real directory; it never invents
   structure the filesystem does not have, and every mutation is visible in the folder.
2. **Reading and maintaining are one job.** A person who can read a document can reorganize it.
   Navigation, viewing and file operations belong to the same surface, not to separate modes.
3. **Never show a number the product did not measure.** An honest empty state beats a plausible
   invented figure — the statistics surface exists to be true, not to look full.
4. **Destructive actions are recoverable and explicit.** Delete and move act on someone's real
   files; they get real confirmation surfaces, not browser dialogs.
5. **Installable by a team that did not build it.** Defaults, first-run and configuration must make
   sense to someone pointing it at their own docs folder for the first time.

## Accessibility & Inclusion

No external standard has been mandated. Two product-specific needs are established:

- The file tree is the primary navigation for every audience and must be operable by keyboard.
  It is: arrows walk the rows and open and close a folder, Home and End jump the ends, and
  every row's actions menu — move and delete included — is a real focusable control, not a
  drag-and-drop-only path.
- The product is read in light and dark, chosen by the user, and both are legible. The
  `dark` variant is bound to the toggle's own class rather than the OS, which is what made
  the toggle control nothing before.
