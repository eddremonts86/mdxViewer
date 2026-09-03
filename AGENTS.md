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

What passing means today: **0 lint errors**, 60 warnings (all `no-console`, in
`server/` and `scripts/`, where console output is the interface), and 30 tests.
Do not raise the error count. Warnings are a budget, not a target — if you add
one, say why.

## Rules the tooling cannot check

Everything else is enforced by ESLint, Prettier, TypeScript or the tests. These
five are not, so they are the whole list:

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
4. **Destructive actions get real surfaces that state their reach.** Not
   `window.confirm`. Deleting three folders means deleting the 27 documents
   inside them, and the dialog says so.
5. **A stock shadcn component inside this world is a lapse.** The primitives in
   `src/components/ui/` have been re-cut — 2/3px radii, no shadows, tracked
   capital labels, one accent hue. `DESIGN.md` → Do's and Don'ts is the list.

## Where things go

```text
src/lib/atlas.ts          File → catalogued object: magnitude, plate, position
src/components/atlas/     The chart layer
src/components/ui/        shadcn primitives, re-cut for this world
src/pages/                One file per surface
src/api/fileAPI.ts        The only client for the file service
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

- **MDX is not compiled.** `.mdx` renders through the Markdown pipeline; JSX does
  not execute. The viewer says "Not executed" and omits the source.
- **No PDF export.** The Print control is `window.print()` with a real print
  stylesheet.
- **No authentication.** Paths are confined to the content folder; anyone who can
  reach the service can write inside it.
- **Reads and readers are not counted.**

Five files under `public/content` still claim the first two. That is content, not
code, so it is the owner's call — but do not add a sixth.

## Traps this repo has already fallen into

Each of these cost real time. They are listed because the code no longer shows
the scar.

- **Tailwind v4 does not read `tailwind.config.js`.** Tokens live in
  `@theme inline` in `src/assets/styles/index.css`. When they lived in the JS
  config, `bg-primary` and `text-muted-foreground` generated _zero_ CSS and
  nobody noticed. If a utility looks like it does nothing, grep the built CSS.
- **`dark:` needs `@custom-variant dark (&:is(.dark *))`.** Without it, v4
  compiles against the OS and the theme toggle controls nothing.
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
- **Empty files pass every check.** Three `scripts/js/*.js` files were 0 bytes and
  three `package.json` scripts ran them. `ls -la` before believing a script exists.

## Commits

Say what changed and why it was wrong before. Commit at phase boundaries, not at
the end — 159 uncommitted files is how a deleted directory becomes expensive.
