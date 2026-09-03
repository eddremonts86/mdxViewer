---
name: MDXViewer
description: A documentation collection charted like a star atlas — plates, magnitudes, and an observer's amber marks.
colors:
    night-sky: "#0A1021"
    deep-indigo: "#16233D"
    chart-blue: "#24374F"
    star-amber: "#FF4D2E"
    glow-amber: "#FFB36B"
    stardust: "#F2F2E9"
    chart-paper: "#EAEADF"
    fog-veil: "#5A6477"
    fog-veil-light: "#8592A8"
    oxide-red: "#B33418"
typography:
    # One ramp, thirteen steps, 9px to 40px. Every literal size in the build is
    # one of these; a size that is not here does not ship.
    micro:
        fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
        fontSize: "0.5625rem"
        fontWeight: 600
        letterSpacing: "0.16em"
        textTransform: "uppercase"
    key:
        fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
        fontSize: "0.625rem"
        fontWeight: 600
        letterSpacing: "0.14em"
        textTransform: "uppercase"
    label:
        fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
        fontSize: "0.6875rem"
        fontWeight: 600
        lineHeight: 1.4
        letterSpacing: "0.13em"
        textTransform: "uppercase"
    figure:
        fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
        fontSize: "0.75rem"
        fontWeight: 500
        lineHeight: 1.5
        letterSpacing: "0.02em"
        fontFeature: "tnum"
    small:
        fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
        fontSize: "0.8125rem"
        fontWeight: 400
        lineHeight: 1.55
    compact:
        fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
        fontSize: "0.875rem"
        fontWeight: 400
        lineHeight: 1.6
    body:
        fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
        fontSize: "0.9375rem"
        fontWeight: 400
        lineHeight: 1.62
        letterSpacing: "0"
    object-name:
        fontFamily: "Bodoni Moda, Didot, Georgia, serif"
        fontSize: "1.0625rem"
        fontWeight: 500
        lineHeight: 1.25
        fontStyle: "italic"
    plate-title:
        fontFamily: "Bodoni Moda, Didot, Georgia, serif"
        fontSize: "1.375rem"
        fontWeight: 600
        lineHeight: 1.18
    section:
        fontFamily: "Bodoni Moda, Didot, Georgia, serif"
        fontSize: "1.625rem"
        fontWeight: 600
        lineHeight: 1.18
    headline-sm:
        fontFamily: "Bodoni Moda, Didot, Georgia, serif"
        fontSize: "1.75rem"
        fontWeight: 600
        lineHeight: 1.04
        letterSpacing: "-0.015em"
    display:
        fontFamily: "Bodoni Moda, Didot, Georgia, serif"
        fontSize: "2.125rem"
        fontWeight: 600
        lineHeight: 1.04
        letterSpacing: "-0.015em"
    display-lg:
        fontFamily: "Bodoni Moda, Didot, Georgia, serif"
        fontSize: "2.5rem"
        fontWeight: 600
        lineHeight: 1.06
        letterSpacing: "-0.02em"
    code:
        fontFamily: "JetBrains Mono, SFMono-Regular, Menlo, monospace"
        fontSize: "0.8125rem"
        fontWeight: 400
        lineHeight: 1.62
rounded:
    none: "0px"
    plate: "2px"
    panel: "3px"
    pill: "999px"
spacing:
    hair: "2px"
    xs: "4px"
    sm: "8px"
    md: "16px"
    lg: "24px"
    xl: "40px"
    xxl: "64px"
magnitude:
    m0: "13px"
    m1: "11px"
    m2: "9px"
    m3: "7px"
    m4: "5px"
    m5: "3.5px"
components:
    button-primary:
        backgroundColor: "{colors.star-amber}"
        textColor: "{colors.night-sky}"
        typography: "{typography.label}"
        rounded: "{rounded.plate}"
        padding: "9px 18px"
    button-primary-hover:
        backgroundColor: "{colors.glow-amber}"
        textColor: "{colors.night-sky}"
    button-secondary:
        backgroundColor: "transparent"
        textColor: "{colors.glow-amber}"
        typography: "{typography.label}"
        rounded: "{rounded.plate}"
        padding: "9px 18px"
    button-secondary-hover:
        backgroundColor: "{colors.deep-indigo}"
        textColor: "{colors.stardust}"
    input:
        backgroundColor: "{colors.night-sky}"
        textColor: "{colors.stardust}"
        typography: "{typography.body}"
        rounded: "{rounded.plate}"
        padding: "8px 12px 8px 32px"
    plate-card:
        backgroundColor: "{colors.deep-indigo}"
        textColor: "{colors.stardust}"
        rounded: "{rounded.panel}"
        padding: "0px"
    data-row:
        textColor: "{colors.fog-veil-light}"
        typography: "{typography.figure}"
        padding: "6px 0px"
---

# Design System: MDXViewer

## Overview

**Creative North Star: "The Observer's Plate"**

_The chart became three-dimensional on 2026-09-03, at the owner's direction. The third
axis is not an effect: it is the folder tree's own depth, one step back per level, so
turning the collection shows how deeply it nests. Coming in past the overview, the levels
the eye is not at recede rather than vanish — the depth is something moved through, not a
picture. Everything below still holds; where it does not, the amendment says so._

_The same day, the chart's **layout** was replaced. Documents used to sit on a ring —
`0.5 + cos(angle) * 0.28` — with a line drawn through each folder's documents in
catalogue order. That order is alphabetical, so the lines meant nothing and crossed the
whole plate to say it, and on a wide screen the ring left the middle empty. The
collection is laid out as the graph it already is: a folder is a hub, a document hangs
from the folder holding it, a folder hangs from its parent, and the content folder is
the root that makes it one tree instead of six drifting islands. **Every edge means one
thing — is inside.** The clusters are the collection's real shape._

A documentation set is a sky: a fixed field of objects that someone has to find their
way around in the dark. MDXViewer charts it. The collection is drawn as a chart with a
ruled graticule, every document is a catalogued object with a designation and a
magnitude, folders are constellations named in place on the plate, and the
one thing the observer adds — where they are, what they picked, what they are about to
change — is written in the amber of a red flashlight. The chart and the folder agree
exactly; that agreement is the product.

This is an engraved instrument, not a night-sky mood. Every ranked quantity on screen
is a real measurement taken from a real file, rendered at the size that measurement
earns. Density is high and deliberate: hairline rules, tracked capital labels, tabular
figures locked to columns, and long quiet fields between them. Nothing glows for
decoration; the glow marks the object under the eye.

Two renditions of one tradition, both first-class. **The Sky** is the dark rendition:
light emitted on a night ground, amber annotation. **The Plate** is the light rendition:
the same chart engraved and printed — oxide-red ink pressed into chart paper. The light
theme is never an inversion of the dark one; it is the other artifact. A third context,
**Printed**, is derived rather than designed: `@media print` forces the Plate's inks onto
white, drops the shell, and lifts the viewport's height caps, because a printed page is
not a screen.

Confirmed rejection: the documentation-site default this category always ships — left
tree, centred prose column, right table of contents, indigo accent on white, Inter
throughout. Also rejected: the soft-card notebook look, and any celestial styling that
is atmosphere without measurement.

**Key Characteristics:**

- Size before color: magnitude is the primary hierarchy channel.
- Amber is the observer's mark, never the content.
- Hairline rules with terminal node dots frame every region.
- Tabular figures, always, wherever numbers align.
- Graticules and registration ticks are structure, not ornament.
- The engraved figure layer stays under 8% and never sits beneath body text.

## Colors

A drenched night field carrying one signal hue, split into two renditions that never
share an ink.

### Primary

- **Star Amber** (#FF4D2E): the observer's mark in the dark rendition. Active object
  reticle, selected state, primary action fill, destructive confirmation, the terminal
  node on a section rule. On the night ground it reads 5.73:1.
- **Oxide Red** (#B33418): the same mark in the light rendition, as printing ink rather
  than emitted light. Reads 5.45:1 on chart paper, where Star Amber would fail at 2.94:1.
- **Glow Amber** (#FFB36B): the amber that carries small text in the dark rendition —
  tracked capital labels, figure keys, link text. 10.74:1 on the night ground. Use it
  wherever amber must be _read_ rather than _noticed_.

### Neutral

- **Night Sky** (#0A1021): the dark rendition's ground. Owns the whole surface.
- **Deep Indigo** (#16233D): panels, plate cards, the sidebar field.
- **Chart Blue** (#24374F): raised plate edges, table header bands, input wells,
  the brighter hairline.
- **Stardust** (#F2F2E9): body text and star fill in the dark rendition; the ground in
  the light one.
- **Chart Paper** (#EAEADF): panels and plate cards in the light rendition.
- **Fog Veil** (#5A6477): hairline rules and dividers in the dark rendition
  (3.18:1 — never text there); secondary text in the light rendition (5.29:1).
- **Fog Veil Light** (#8592A8): secondary and tertiary text in the dark rendition.
  6.02:1 on the night ground, 4.97:1 on Deep Indigo.

### Named Rules

**The Red Flashlight Rule.** Amber belongs to the observer, not to the sky. It marks
where you are, what you selected, and what you are about to change — nothing else.
Document content, headings, and prose are never amber. Amber covers under 10% of any
screen; its scarcity is what makes the reticle mean something.

**The Plate Hue Rule.** _Amended 2026-09-03, by the product owner._ The chart carries
one hue per folder, derived from the folder's path on disk so it is the same colour in
every session, and spaced by the golden angle so neighbours in the tree never land on
neighbouring hues. Saturation and lightness come from the rendition, never from the
hash, so the set reads as one palette rather than as confetti. This is the one place
the system spends colour on content, and it is spending it on **identity**: which
folder this belongs to. Size still carries the quantity. Everywhere outside the chart —
prose, code, callouts, interface — the one-signal rule stands unchanged, and amber
remains the observer's alone even inside the chart.

The one amber mark that lands on content is the search match, and it is the reticle
case rather than an exception to it: the document is not emphasising itself, the
instrument is showing what the observer asked for, the way the reticle sits over a
star without belonging to it. Syntax highlighting is the case that looks similar and
is not — a string literal is the document's own text, so code spends no accent at all.

**The Two Renditions Rule.** Dark is emitted light; light is pressed ink. Each has its
own accent (Star Amber / Oxide Red) and its own hairline weight. Never derive one
rendition by inverting the other, and never let a color's only definition live inside a
single theme block.

**The Magnitude Rule.** Any quantity the product ranks — document size, recency, folder
weight — is encoded as diameter or scale on the fixed six-step magnitude ramp before a
single unit of color is spent on it. The ramp is log2 anchored at 1 KiB: under 1 KiB is
magnitude 5, 32 KiB and over is magnitude 0. Color may reinforce a ranking; it may never
be the only channel carrying one.

On the chart the whole ramp scales with the camera, which does not weaken it: scaling
every radius by one factor leaves the ratios between them exactly on the ramp, and the
ratio is what the ramp encodes. Drawing the points at a fixed pixel size was tried and
cut — it made a scene with depth read as a sheet of stickers.

## Typography

**Display Font:** Bodoni Moda (with Didot, Georgia, serif)
**Body Font:** Archivo (with Helvetica Neue, Arial, sans-serif)
**Mono Font:** JetBrains Mono (with SFMono-Regular, Menlo, monospace)

**Character:** An engraved didone against a workhorse grotesque — the exact pairing of a
19th-century atlas plate, where the object names were cut by hand and the coordinate
tables were set in whatever was clearest. Bodoni Moda's hairlines and its italic carry
every document title and object name; Archivo carries every label, figure and control,
because an Operate surface needs its chrome to be boring and its data to be exact.

### Hierarchy

The ramp has thirteen steps and the frontmatter lists all of them. A size that is not on
the ramp does not ship; the mechanical detector reports any literal that drifts off it.

- **Display / Display-lg** (Bodoni Moda 600, 2.125rem, 2.5rem on a document): the
  surface's one plate title. One per screen; 1.75rem is its small-screen step.
- **Object Name** (Bodoni Moda 500 italic, 1.125rem, 1.25): every document title,
  everywhere it appears — sidebar, plate card, viewer header, register row. Italic is
  how a catalogued object is named; it is not emphasis.
- **Title** (Archivo 600, 0.9375rem, 1.35): panel and group headings.
- **Body** (Archivo 400, 0.9375rem, 1.62): interface prose. Document prose runs at
  1.0625rem/1.7 and 66–72ch.
- **Label** (Archivo 600, 0.6875rem, 0.13em, uppercase): section eyebrows, column
  heads, data keys, button text.
- **Figure** (Archivo 500, 0.75rem, tabular-nums): every number — sizes, counts, dates,
  magnitudes, coordinates.
- **Code** (JetBrains Mono 400, 0.8125rem): code spans and blocks inside documents only.

### Named Rules

**The Tabular Rule.** Every figure uses `font-variant-numeric: tabular-nums`. Numbers in
this product exist to be compared down a column; proportional digits break the column.

**The Italic Designation Rule.** Italic Bodoni means "this is a catalogued object." It is
never used for emphasis inside prose, and prose emphasis is never set in the display face.

## Layout

A ruled field, not a stack of cards. Every region is bounded by a hairline with a small
terminal node dot at its ends, and major regions carry registration ticks at their
corners — the marks a plate needs to be printed in register.

- **Shell:** a fixed 15rem plate index on the left (the sidebar), a header band 3.5rem
  tall carrying the wordmark, four surface links, the search trigger and the theme control,
  and the working field filling the rest. The field scrolls; the index and band do not.
- **Naming in place:** a folder is labelled on its own hub, in tracked capitals, the way
  an atlas plate names what it shows. Lists carry
  the same information as a leading column of plate and object numbers. Both replace
  breadcrumbs as the primary answer to "where am I"; a separate ruled gutter of numbers
  beside the chart was tried and cut — the marks collided and repeated what the labels
  already said.
- **The chart surface fits the viewport.** From 1280px up, the chart takes every pixel
  the observer's rail and the register band do not need, the rail scrolls inside itself,
  and the register stays in view without scrolling the page. Capping the chart's height
  instead was tried and cut: the row is as tall as the rail's content, so a cap left dead
  space below the chart — 372px of it on a 1181px viewport. Below 1280px the surface
  stacks and the page scrolls normally, with the chart holding a 20rem floor.
- **Rhythm:** the spacing scale is 2/4/8/16/24/40/64. One rhythm throughout, with more
  space above a heading than below it (24 above, 8 below).
- **Measure:** interface text is unconstrained; document prose is capped at 66–72ch.
- **Responsive:** below 1280px the observer's rail moves under the chart; below 1024px
  the plate index becomes an overlay sheet over a dimmed field. Below
  768px the header band keeps the plate title, the search trigger and the theme control,
  and moves navigation into the index sheet — nothing in the band is ever pushed out of
  the viewport. A notices control was described here before one existed; the band holds
  exactly two observer controls, search and theme. Wide tables, code blocks and the chart canvas
  scroll inside their own region; the page body never scrolls sideways.

## Elevation & Depth

No shadows. Depth is tonal and lithographic: Night Sky recedes, Deep Indigo sits on it,
Chart Blue is the lifted edge, and a hairline does the work a shadow would. The one
exception is emitted light — the active object's amber reticle carries a soft radial
glow, because in this world a glow means "this is the thing you are looking at" and
nothing else does.

The engraved figure layer supplies atmosphere without depth, all of it drawn on canvas
beneath the data and never under body text: a fixed-seed field of uncatalogued stars at
5–21% opacity, five contour bands at 70% of the figure opacity, and the folder
constellation lines capped at 22%. None of it is interactive and none of it carries
meaning; the catalogued objects sit on top of it and do.

Emitted light is the one sanctioned exception to No-Shadow and it is spent twice: a
radial bloom on magnitude 0–2 objects, and a 10px `shadowBlur` on the reticle. Both are
drawn on the canvas, not in CSS.

Motion is one authored moment per surface, not five. An overlay is the only thing in the
interface that appears rather than simply being there, so the scrim washes in over 120ms
and the plate settles 0.5% of a scale over 140ms — once, and nowhere else.

The chart is the exception and says why: it is navigated rather than looked at, so it
carries the motion of an instrument being moved — inertial drag, pinch and wheel from
deck.gl's own controller, and a 620ms flight when the collection is narrowed to a folder.
None of it is idle; nothing on the chart moves unless someone moves it. The five borrowed primitives arrived
carrying scattered `animate-in` / `zoom-in-95` / `slide-in-from-*` classes that generated
no CSS at all, because the plugin behind them was only ever registered in the Tailwind v3
config this project no longer has. They were removed rather than revived.

### Named Rules

**The No-Shadow Rule.** A raised surface changes tone, never casts. If a component needs
to feel lifted, move it up the tonal ramp and give it a hairline; reaching for
`box-shadow` means the tonal ramp was not used. This holds for the dialog and the
dropdown too: both arrived from shadcn with `shadow-2xl` and `shadow-lg` and both had
them removed. The only shadows in the product are the two emitted-light cases above.

## Shapes

Effectively square. Plates are 2px, panels 3px, and nothing else is rounded except the
magnitude dots, the reticle, and status pills, which are circles because they are
plotted points. Rounded corners are foreign to an engraved plate; the roundness in this
system belongs only to things that represent objects in the sky.

Borders are 1px hairlines. There is exactly one 2px rule in the system — the band
beneath the plate title — and no accent border is ever thicker than 1px on a rounded
element.

## Components

- **Plate card** (document in a collection view): a square chart plate on the left
  showing the document's folder constellation with its own point ringed, and a data
  block on the right — italic Bodoni title, an amber designation line (`API · 02 · MDX`),
  then a two-column tabular grid of real values (MAG from file size, MOD from mtime,
  SIZE, TYPE). No screenshot thumbnails, no gradients.
- **Register row** (document in a list): coordinate gutter mark, magnitude dot, italic
  title, then tabular columns. Rows are hairline-separated, never boxed.
- **Magnitude dot:** a filled circle on the six-step ramp, Stardust in the dark
  rendition and Night Sky in the light one. A document modified in the last 7 days wears
  a 1px amber ring — the atlas convention for a variable object.
- **Hub:** a folder, drawn hollow so it reads as a place rather than as a bigger
  document, in its own hue, sized by how many documents sit at or under it. Its name
  rides on it in tracked capitals, and a name is dropped rather than drawn through
  another — the catalogue holds all of them anyway.
- **Edge:** a hairline in the hue of what it holds, so a branch reads as one family of
  colour rather than as grey wiring. It brightens with the folder under the eye.
- **Reticle:** the active object's mark. A 1px amber circle, billboarded so it faces the
  reader at any camera angle. Exactly one reticle per screen.
- **Plate scale:** four square hairline controls on the chart's corner — in, out, turn,
  and the whole collection — with a live readout of the scale and the angle beside them.
  The readout is written to the DOM by the render loop rather than by React, because it
  changes on every frame of a zoom.
- **Buttons:** square (2px), tracked capital label. Primary is an amber fill on
  Night Sky text. Secondary is a hairline with Glow Amber text. Both carry a small
  compass-star glyph on the primary action only.
- **Input:** a Night Sky well inside a hairline, magnifier glyph on the leading edge,
  clear control on the trailing edge, no rounding beyond 2px. The index's filter was
  the last stock shadcn survivor — `bg-card/90`, `text-primary`, a 2px focus ring —
  and now matches the spec it always claimed.
- **Band:** every ruled region across the plate index is one band: 2.5rem tall, `px-3`,
  a hairline beneath, and a label on the single label step. The index carried four of
  them with four different paddings and two different type steps for the same kind of
  label; they are two bands now, and the primitive is why they cannot drift again.
- **Band control:** 1.75rem square for a glyph, the same height with a tracked capital
  label when it needs words. One size for every control in the header band and the
  index — there were four. A control that carries state is pressed, not filled.
- **Grouped actions:** four unlabelled glyphs for the four ways of adding to the
  collection cost most of a 15rem column and had to be hovered to be read. They are one
  `+` menu with names. A glyph earns its place in a band only when it is the whole
  vocabulary of one action.
- **Section eyebrow:** tracked capital label in Glow Amber, a hairline running to the
  region's edge, and a 3px node dot terminating it.
- **Destructive confirmation:** a real plate dialog naming the exact objects, with the
  count set in figures and the amber fill on the confirming action. Never a browser
  dialog. It says where the objects go, because a delete moves them to the trash; the
  one action that does not come back asks a second time, in place, on its own row.
- **Command palette:** ⌘K over a washed field, anchored high rather than centred so
  the results grow downward into space that was already empty. A result reads as the
  object it is — magnitude dot from the file's real size, italic name, its plate in
  tracked capitals — then the matching line with the query marked, and the line
  number with a count of the further matches in that document. The field keeps focus
  while the arrows move a drawn selection, so typing never stops.
- **Import surface:** a plate dialog that reads someone's folder before it writes to
  the collection, so it is ordered as a reading rather than a form: the count and
  measured size on an eyebrow, where the tree will land, then what is being left
  behind with a reason beside each entry — and only then the action. During the
  import the action carries its own progress; afterwards the same plate becomes the
  report. Nothing about it says "0 documents" before a folder is chosen.
- **Trash row:** the deleted object as it was — magnitude dot, italic name — then the
  plate it fell out of, its size, the date it went, and the two actions. Restore is the
  hairline secondary; deleting for good only becomes an amber fill after the row has been
  asked once, and offers "Keep it" beside it.
- **Nav item:** icon plus label; active carries an amber 1px underline, not a filled pill.
- **Borrowed primitives:** dialog, dropdown, select, tooltip, badge, alert, checkbox and
  toast all came from shadcn and were all re-cut to 2/3px radii with no shadow, panel
  tone and tracked capital labels. The toast's stock green `success` variant was removed;
  success is the amber mark on a panel, because the system has one signal hue.
- **Editor:** the plate open for correction. A hairline band names the file, then two
  panes split by a vertical rule — the source in a Night Sky well set in mono, the live
  preview in the reading typeset beside it. The eyebrow over the source reads the file's
  measured size, and reads `Unsaved` in amber the moment the text diverges: the amber is
  the observer's mark for what is about to change, so it belongs there and nowhere else on
  the surface. From 1280px up the panes fill the field and scroll inside themselves; below
  that they stack. A refused save appears as the amber-left panel, not a browser dialog.
- **Code block:** a panel inside a hairline with the fence's language set in the
  corner as a tracked capital label on the raised tone. The syntax itself spends no
  accent at all — the Red Flashlight Rule says content is never amber, and a string
  literal is content — so code separates the way an engraved book separates it: body
  ink for names and keywords, the secondary tone for literals, the hairline tone in
  italic for comments, one bold weight for keywords. Plain text renders first and is
  replaced when the grammar arrives, so nothing waits on a highlighter to be read.
- **Callout:** a blockquote opening `[!NOTE]`. Kinds are told apart by label, mark
  and the weight of the left rule — hairline for a note, full ink for a caution —
  because the alternative is five hues in a system that has one.
- **Diagram:** a `mermaid` fence, drawn with the product's own tokens rather than
  the library's lavender defaults, framed like a plate. A diagram that will not
  parse prints its parse error above its own source instead of vanishing.
- **Not-executed notice:** an MDX document that defines components carries a hairline
  amber-left panel above the prose saying the components were not run. The component
  source is removed rather than printed as body copy.

### Named Rules

**The Drawn Registration Rule.** Selection is a visible instrument state, not a checkbox
list. Selected objects stand proud of unselected ones — brighter fill, amber ring — the
count stays legible at all times in the index, and one action fans across the whole
drawn set. The user always knows how wide the next action reaches before it fires.

## Do's and Don'ts

**Do** encode every ranking as size on the magnitude ramp first.
**Do** compute every figure from a real file; an honest empty state beats a plausible number.
**Do** rebuild every atom in this vocabulary — nav, buttons, inputs, dialogs, empty states.
**Do** draw the constellation lines and contour texture on canvas, as the real technique.
**Do** give both renditions the same care and their own accent ink.
**Do** separate content by tone, weight and italic before reaching for colour — code and
callouts are both differentiated that way, and both are legible for it.

**Don't** ship a stock shadcn component inside this world; a default card or button is a lapse.
**Don't** use amber for content, headings, or prose.
**Don't** put body text over the figure layer.
**Don't** add a second accent hue; the system has one signal and two renditions of it. A
syntax theme, a callout palette and a diagram library's defaults are each a whole palette
arriving at once — the three places this system has had to refuse one.
**Don't** use italic Bodoni for emphasis, or Archivo for a document title.
**Don't** reach for `box-shadow`, gradients-as-decoration, or an icon tile where an
authored mark belongs.
