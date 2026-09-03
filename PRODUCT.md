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
read individual documents, and change the collection itself — create, upload, move, rename and
delete files against a real directory on disk. Success is a team pointing it at their docs folder
and using it as the place where that documentation is read and maintained.

## Positioning

Two mechanisms, both confirmed as the product's reason to exist:

- **Write access to a real folder.** It is a file manager, not only a renderer: create, upload,
  drag-and-drop move and delete operate on the actual directory. Readers of the same docs can
  reorganize them. Docusaurus and static site generators only read; Obsidian and Notion take
  ownership of the format and the vault.
- **MDX with live React components.** Documentation that executes components inside the page,
  not a screenshot of a component. **Not implemented today** — the renderer treats `.mdx` exactly
  like `.md` (react-markdown, no compilation). Recording it here makes it a commitment the design
  must leave room for, not a claim the product may currently make in UI or marketing copy.

## Operating Context

- Content lives in a directory of `.md` / `.mdx` files (`public/content` in this repo), organized in
  nested folders. The working set today is 76 documents across API, Docs, Examples, Guides,
  Project Docs and Tests.
- Documents carry YAML frontmatter (`title`, `description`, `author`, `date`, `tags`).
- Each document has a generated visual preview (SVG today, PNG when generated) used in list views.
- Two processes: a Vite SPA and an Express file API. Deployment of both is required by the
  audiences above and does not exist yet.

## Capabilities and Constraints

**Confirmed capabilities — durable, the design must serve all four:**

- File management: create file, create folder, upload, move by drag and drop, delete, multi-select.
- Visual previews of every document, used in collection views.
- A statistics surface describing the collection. Must be driven by real data; the numbers shown
  today are hardcoded fiction (12,489 views, 573 documents against a real 76).
- An in-app document editor. Does not exist yet; the visual architecture must reserve a place for it.

**Also present:** document viewer with table of contents, filename search, folder tree navigation,
light/dark theme, GFM tables, KaTeX math, syntax-highlighted code.

**Technical constraints:** React 19, TypeScript strict, Vite 6, Tailwind CSS v4 (CSS-first tokens —
`tailwind.config.js` is not read), shadcn/ui (new-york), TanStack Query for server state,
react-router-dom, Express 5 + multer on the API. Node 22 in CI.

**Undecided / not yet true — do not present as working:**

- Authentication, permissions and multi-user conflict handling.
- Deployment target for the Express API.
- Real read/usage measurement behind the statistics surface.
- MDX compilation (see Positioning).
- Full-text search across document contents; search matches filenames only.

## Brand Commitments

- Name: **MDXViewer**.
- Interface language: **English only**, including labels, copy and errors. The repository rules
  state this and the current UI violates it (the table-of-contents panel reads
  "Índice de Contenido"). Code, comments and commits are English as well.
- No logo, wordmark, brand palette or typographic commitment has been established. The current
  slate/blue shadcn defaults are an unconfigured starting point, not a brand decision.

## Evidence on Hand

- 76 real documents in `public/content`, with real frontmatter, and 76 generated previews in
  `public/previews`.
- A working file API: health, statistics, file tree, file content, create, upload, delete, move.
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

- The file tree is the primary navigation for every audience and must be operable by keyboard,
  including the move and delete paths that are drag-and-drop only today.
- The product is read in light and dark, chosen by the user; both must be legible, which the
  current implementation does not guarantee (theme utilities follow the OS, not the toggle).
