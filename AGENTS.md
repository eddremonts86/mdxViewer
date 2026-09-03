# Working on MDXViewer

The single source of instruction for anyone — person or agent — changing this
repository. It replaced `.ai-instructions.md` (918 lines) and
`.github/copilot-instructions.md` (295 lines), which overlapped, duplicated what
tooling already enforces, and by the end described a project that no longer
existed: they mandated a `tailwind.config.js` that Tailwind v4 never reads, an
MCP server nobody uses, `npm run dev:watch` pointing at an empty file, and "zero
warnings" against a codebase that had 410 lint errors.

The rule and the check are the same thing here. Nothing below is asserted
without something that verifies it.

## Read these first, and don't duplicate them

| File         | Owns                                                          |
| ------------ | ------------------------------------------------------------- |
| `PRODUCT.md` | Who this is for, what it does, what is deliberately undecided |
| `DESIGN.md`  | The visual system: tokens, type ramp, components, named rules |
| `README.md`  | Running it, deploying it, the known gaps                      |

If a change contradicts one of those, update that file in the same commit. A
rule nobody verifies teaches the next contributor to ignore the rest.

## The check

```bash
pnpm run verify
```

Format, lint, typecheck-and-build, tests — the same four things CI runs, in the
same order. CI runs on Linux on purpose: that is where a case-mismatched import
fails and macOS does not.

What passing means today: **0 lint errors**, 61 warnings, and 67 tests. Fifty-seven
are `no-console` in `server/` and `scripts/`, where console output is the
interface; four are `react-refresh/only-export-components`, where a file exports a
component beside the predicate or context that belongs with it — `Callout.tsx`
exports `isCalloutKind` next to the kinds it tests for, and splitting a five-line
predicate into its own file to satisfy a dev-server optimisation is worse code.
Do not raise the error count. Warnings are a budget, not a target — if you add
one, say why.

ESLint's `complexity` rule has been right every time it has fired here. Decompose
the function; do not raise the limit.

## Rules the tooling cannot check

Everything else is enforced by ESLint, Prettier, TypeScript or the tests. These
six are not, so they are the whole list:

1. **English only** in code, comments, commits, and interface copy. The product
   shipped a panel labelled "Índice de Contenido" for months; that is the failure
   mode.
2. **No figure on screen the product did not measure.** Every number comes from a
   real file. The statistics page once reported 12,489 views and 573 documents
   against a real 76. An honest empty state beats a plausible invented figure —
   see `PRODUCT.md` → Product Principles.
3. **Every filesystem path goes through `resolveInsideContent()`.** The service
   turns request strings into paths; a `path.join` on user input is how
   `?path=../../../etc/hosts` used to work. Server tests cover the vectors — add
   to them rather than trusting a review.
4. **A write never destroys an edit its author never saw.** The save endpoint compares the
   mtime the editor loaded and returns 409 on a mismatch; overwriting is a separate,
   explicit choice the author makes. Several people share one instance and there is no
   locking, so this is the only thing standing between them.
5. **Destructive actions get real surfaces that state their reach, and stay
   recoverable.** Not `window.confirm`. Deleting three folders means moving the 27
   documents inside them, and the dialog says so. A delete moves to
   `public/trash`; the only unrecoverable path in the product is
   `DELETE /api/trash`, which the trash surface asks for a second time before
   sending. Do not add a second one.
6. **A stock shadcn component inside this world is a lapse.** The primitives in
   `src/components/ui/` have been re-cut — 2/3px radii, no shadows, tracked
   capital labels, one accent hue. `DESIGN.md` → Do's and Don'ts is the list.

## Where things go

```text
src/lib/atlas.ts          File → catalogued object: magnitude, plate, position
src/lib/highlighter.ts    Shiki, with two themes built from the product's tokens
src/components/atlas/     The chart layer
src/components/ui/        shadcn primitives, re-cut for this world
src/pages/                One file per surface
src/api/fileAPI.ts        The only client for the file service
server/utils/trash.ts     Deleted items: move out, list, restore, purge
server/utils/search.ts    Full-text search over the content folder
server/app.ts             Routes, middleware, uploads
server/start.ts           Binds the port
public/content/           The documentation this instance charts
scripts/js/               Node utilities
```

Documents belong in `public/content`. There is one API client; if you find
yourself writing a second, delete the first instead — this repo carried four
overlapping ones totalling ~1,400 lines, three of which nothing imported.

## Do not claim these work

`PRODUCT.md` records them as commitments, not features. The UI must not say
otherwise, and neither must seeded content:

- **MDX compiles only when the operator allows it.** `MDX_EXECUTE` is off by
  default and the client reads it from `/api/health`, never from a build flag.
  Do not default it on and do not add a path that compiles without it: uploads
  are unauthenticated, so this is the difference between running the operator's
  documentation and running a stranger's script. Off, the viewer says "Not
  executed" and omits the source.
- **Imports in a compiled document.** They are stripped before compiling, so a
  document cannot reach a URL or a bundle. Adding a resolver would undo the only
  structural limit on what a compiled document can touch.
- **No PDF export.** The Print control is `window.print()` with a real print
  stylesheet.
- **No authentication.** Paths are confined to the content folder; anyone who can
  reach the service can write inside it.
- **Reads and readers are not counted.**

Thirteen files under `public/content` claimed the first two and were corrected on
2026-09-03. Product docs were rewritten, `api/reference.md` replaced, MDX fixtures
annotated with their JSX intact, and the two development logs left as written with
a dated correction note. Do not add a fourteenth: `grep -rn "PDF\|se ejecutan\|export"`
over `public/content` before seeding a document.

## Traps this repo has already fallen into

Each of these cost real time. They are listed because the code no longer shows
the scar.

- **Tailwind v4 does not read `tailwind.config.js`.** Tokens live in
  `@theme inline` in `src/assets/styles/index.css`. When they lived in the JS
  config, `bg-primary` and `text-muted-foreground` generated _zero_ CSS and
  nobody noticed. If a utility looks like it does nothing, grep the built CSS.
- **`dark:` needs `@custom-variant dark (&:is(.dark *))`.** Without it, v4
  compiles against the OS and the theme toggle controls nothing.
- **Two libraries for one job means one of them is dead, and so is config for
  files that do not exist.** `shiki` was a declared dependency while the code
  block used `react-syntax-highlighter`; `@mdx-js/rollup` sat in `vite.config.ts`
  compiling the zero `.mdx` files in `src/`; before both, four API clients existed
  and three were unimported. Grep for the incumbent before reaching for the new
  thing, and check that a configured plugin has anything to act on.
- **Install clean before trusting an import.** `katex` was imported but never
  declared; it worked only under npm's flat `node_modules` and broke the whole
  app under pnpm.
- **One lockfile.** `packageManager` pins pnpm. A second lockfile means
  `npm install` builds a different tree than CI.
- **Two processes, two port variables.** The client reads `PORT`, the service
  reads `API_PORT`. A single inherited `PORT` makes them fight.
- **Never run a destructive request against a live server to "verify" a fix.**
  The guards are covered by tests against a temporary folder. Running
  `DELETE {"paths":["../../src"]}` against a stale process deleted this
  repository's entire source tree once. Assert with a read first, or better,
  write the test.
- **`no-magic-numbers` is scoped to `server/` and `scripts/`.** It is off for
  `src/`, where the numbers are layout ratios and canvas geometry, and because it
  reports every element of a named constant array — refusing the fix it asks for.
  Its ignore list once held forty arbitrary integers added one at a time to
  silence it; that is the state to avoid.
- **One tsconfig project per file.** `tsconfig.node.json` includes `server/**/*`
  with `lib: ES2022`; `tsconfig.test.json` includes `**/*.test.ts` with DOM. A
  server test importing a `src/` module that touches `document` compiled twice and
  failed in the project without DOM. Tests are excluded from the node project.
- **A search query is text, not a pattern.** `searchContent` compares with
  `indexOf`, never a compiled regular expression: a reader looking for `.*` or
  `[!NOTE]` should find those characters, not match everything or hang on a
  backtrack. There are tests for both.
- **pnpm 11 renamed the build-approval setting and ignores the old one in
  silence.** `pnpm-workspace.yaml` wants `allowBuilds` as a _map_
  (`esbuild: true`) — what `pnpm approve-builds` itself writes. It held
  `ignoredBuiltDependencies` with a list of names; neither the key nor the shape
  is read, so the setting did nothing and `pnpm install --frozen-lockfile` stopped
  with `ERR_PNPM_IGNORED_BUILDS`. An existing `node_modules` never reinstalls, so
  it only ever failed in a clean environment — the Docker build had never
  completed. Let pnpm write that file rather than guessing the key from memory.
- **The container does not run as root.** Everything written at runtime is under
  `public/`: documents are created, uploaded and moved there, and a delete writes
  into `public/trash` beside the content folder. The Dockerfile copies as root and
  then drops to `mdx`, so `public/` is chowned and the trash created in the image.
  Deleting was impossible in the container until it was.
- **Run the deploy path before documenting it.** Both of the above lived behind a
  README that told people to `docker build`. A command in a document is a claim
  like any other.
- **A control that will not open under automation is not necessarily broken.**
  Radix menus open on `pointerdown`; a synthetic `.click()` and the browser tool's
  own click both leave `aria-expanded="false"`. Every dropdown in the product
  looked dead until a real `PointerEvent` proved otherwise. Dispatch one, or drive
  it by keyboard, before reporting a defect.
- **`flex-1` needs an ancestor with a height to measure.** `main` in
  `Layout.tsx` is a scroll container, not a flex one, so a surface meant to fill
  the field needs `xl:h-full`. Without it the row is only as tall as its content
  and leaves a screenful of dead space below — the chart shipped it once and the
  editor reproduced it exactly.
- **Removing a utility class leaves its variant prefix behind.** Stripping the
  `slide-in-from-*` family left `data-[side=bottom]:` with nothing after it in
  three primitives, `border-border/2-[48%]/2-[48%]` in the dialog and a trailing
  `data-[state=open]:sm:` in the toast. All inert, all read as mistakes, all
  survived several commits. Grep the `ui/` class lists after any such removal.
- **Empty files pass every check.** Three `scripts/js/*.js` files were 0 bytes and
  three `package.json` scripts ran them. `ls -la` before believing a script exists.

## Commits

Say what changed and why it was wrong before. Commit at phase boundaries, not at
the end — 159 uncommitted files is how a deleted directory becomes expensive.
