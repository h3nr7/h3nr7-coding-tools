# UI reference: design

Date: 2026-11-21
Status: approved
Size: feature
Linear: H3N-83
Project: h3nr7 coding tools
Builds on: 12daysofxmas-webgpu/docs/plans/2026-11-21-webgpu-story-design.md (the story: H3N-82, H3N-59, H3N-83)

## Intent

h3nr7-coding-tools gains `references/ui/`: a copy of h3nr7's own UI
components, lib and styles, made self-contained and font independent, so
the h3nr7-components skill can copy it into any h3nr7 project. Feature 3
of the WebGPU story. Nothing in the story consumes it; it is built so it
exists.

The owner approved the story and asked for this feature to be built
through without stopping. The calls the brainstorming dialog would have
asked are made here and listed under "My calls".

## Goals

- `references/ui/` holds Dialog, Drawer, Tooltip, Popover, Switch,
  Slider, Controls, Field, Nav and ScrambleText with their spec files;
  the lib `cn`, `reveal-queue` and `use-mobile` with their specs; and the
  styles `tokens.css` and `scramble.css`.
- The folder is self-contained: no import reaches a shadcn component,
  `fonts.css`, an `@h3nr7/...` package or an h3nr7-only module.
- Font independence: `--font-display`, `--font-body` and `--font-mono`
  keep their names and hold system fallback stacks only. No `mrs-eaves`,
  no `inter-18pt`, no Adobe kit. Components name tokens, never faces.
- A README says which components need Tailwind and which are plain,
  names the dependencies the copied files import with the version each
  was taken from, and says what to wire.
- Proved: the spec files pass in a scratch Vite project with Tailwind,
  Radix and jsdom, and the project builds with one component rendered
  and `tokens.css` imported, without the Adobe faces.

## Non-goals

- shadcn's set (Button, Input, Textarea, Label, Badge, Card, Table,
  Separator, Skeleton, Sheet, Select, Sidebar, Breadcrumb, DropdownMenu,
  Pagination, AlertDialog, Toast, InputGroup, ShadcnTooltip, Avatar) and
  their specs. Sidebar imports ShadcnTooltip privately and is out with
  the rest.
- `fonts.css`. It stays in h3nr7.
- A look. The components carry stable `h3-*` classes and the consuming
  app styles them, as h3nr7's web app does in its `app.css`. Those app
  rules are not copied.
- Editing the h3nr7 monorepo. It is read only.
- Any toolchain in h3nr7-coding-tools. The proof runs in a throwaway
  project.
- The skill's list entry, the plugin README and the manifest. Feature 1
  (H3N-82) owns those files on `feature/references`; the ui's entry is
  added when both branches are merged.
- Adopting the ui in 12daysofxmas.

## Anti-goals

The feature has failed, even if the proof is green, if:

- a copied file still imports something only h3nr7 has, so a project that
  pulls the folder in has to bring h3nr7 with it;
- an Adobe face name is anywhere in the folder, in a token or a class;
- a component is rewritten rather than copied, so the reference drifts
  from h3nr7 for no reason;
- a spec is weakened to pass rather than adapted or dropped with its
  reason written down.

## Constraints

From the story, and this feature's own:

- Copy, do not rewrite. Each file is h3nr7's, with the smallest edits
  that make the folder self-contained. Every edit is listed in the README
  and in the plan.
- Font independence, as in the story: tokens keep their names over system
  stacks; `fonts.css` stays in h3nr7.
- Dependencies named in the README are only those the copied files
  import. Checked by reading the imports: `radix-ui`, `clsx` and
  `tailwind-merge`. Not `lucide-react` and not `class-variance-authority`,
  which only shadcn's set and the barrel import.
- Versions are read from `packages/ui/package.json` and the installed
  packages on 2026-11-21: radix-ui 1.6.7, clsx 2.1.1, tailwind-merge
  3.6.0, React 19.2 as peer. Tailwind is 4.3 in h3nr7's web app.
- Work happens in a worktree, `h3nr7-coding-tools-ui`, on branch
  `feature/ui-reference` off `main`. README.md, the manifest and the
  skills are not touched.
- One commit per task, pnpm, no push, no merge.
- Writing style of the existing skills and docs: short sentences, plain
  words, no em-dashes. The copied source keeps its own comments.

## Where the work stands

**h3nr7 `packages/ui/src`** has three kinds of thing:

- h3nr7's own components, each importing `radix-ui` and `../lib/cn` and
  nothing else from outside React: `Dialog`, `Drawer`, `Tooltip`,
  `Popover`, `Switch`, `Slider`, `Controls` (which composes `Slider` and
  `Switch`), `Field`, `Nav`, `ScrambleText` (which imports
  `../lib/reveal-queue`). Specs for Dialog, Drawer, Controls, Field, Nav
  and ScrambleText.
- the lib: `cn` (clsx + tailwind-merge), `reveal-queue` (pure, module
  state), `use-mobile` (`useSyncExternalStore` over a media query). Specs
  for `cn` and `reveal-queue`.
- the styles: `tokens.css` (colour, type, spacing, motion, z, the shadcn
  aliases, the sidebar aliases, focus rules, the reduced-motion clamp),
  `scramble.css` (ScrambleText's structure), `fonts.css` (Adobe kit
  notes and the display-face rules).

Two things the copied files need that live outside `packages/ui`:

- `.h3-visually-hidden`, which `ScrambleText` creates by class for the
  accessible copy of the text while it flaps. It is defined in
  `apps/web/app/app.css`.
- the Tailwind theme. `Popover`, `Switch`, `Slider` and `Controls` use
  utilities such as `bg-ink`, `text-ink-muted`, `bg-surface`,
  `bg-popover`, `bg-primary`, `bg-muted`, `bg-input` and `ring-ring`.
  Tailwind v4 only emits a utility for a colour it has been told about,
  and h3nr7 tells it in `apps/web/app/theme.css` with an `@theme inline`
  block mapping `--color-ink` to `var(--colour-ink)` and so on. Without
  that block those four components render with no colour, and nothing
  reports an error.

Comments in the copied files mention `@h3nr7/canvas`, `@h3nr7/audio`,
`fonts.css` and the web app's files. None of those is an import.

**h3nr7-coding-tools** has no `references/` folder on `main`. Feature 1
adds `references/flock/` and `references/webgpu-canvas/` and the skill on
`feature/references`.

## Approaches

Three were considered for what the folder is.

- **A. A faithful copy with the smallest edits, plus what it needs to
  stand alone.** The files as h3nr7 has them, with the font tokens
  changed, the visually-hidden rule added to `scramble.css`, and a small
  `theme.css` carrying the `@theme inline` block. Gives: a reference that
  tracks h3nr7 and can be diffed against it. Costs: the shadcn aliases
  and some h3nr7-specific comments ride along.
- **B. A trimmed copy.** Strip the shadcn aliases, the sidebar aliases,
  the flock palette token and every comment that names an h3nr7 file.
  Gives: a smaller folder. Costs: the diff against h3nr7 grows with every
  trim, and `Popover`, `Switch` and `Slider` use the shadcn aliases
  (`bg-popover`, `bg-primary`, `bg-muted`, `bg-input`, `ring-ring`), so
  most of that block has to stay anyway.
- **C. Components without Tailwind.** Rewrite the four utility-styled
  components onto `h3-*` classes with their own stylesheet, so nothing
  needs Tailwind. Gives: one kind of component. Costs: a rewrite the
  story forbids, and a reference that no longer matches h3nr7.

**Chosen: A**, with one trim from B: the sidebar aliases go, since they
exist for the `/internal` console's shadcn Sidebar, which is out of
scope, and nothing copied uses them. Everything else stays as h3nr7 has
it.

## The design

### How it fits together

```
h3nr7/packages/ui/src                     h3nr7-coding-tools/references/ui
  components/{10 own + 6 specs}   copy     components/{same}
  lib/{cn, reveal-queue, use-mobile + 2 specs}   lib/{same}
  styles/tokens.css    fonts as tokens      styles/tokens.css
  styles/scramble.css  + visually-hidden    styles/scramble.css
  (apps/web theme.css) own-colour subset    styles/theme.css
  index.ts             own set only         index.ts
                                            README.md
```

One direction: h3nr7 is read, the reference is written. A project pulls
the folder in by path with the h3nr7-components skill and owns the copy.

### The parts

**`references/ui/components/`.** The ten components and six specs, byte
for byte except:

- `Controls.tsx`: the comment that says `fonts.css` sets h1 to h4 in the
  display face is reworded to say a site stylesheet may do so, since
  there is no `fonts.css` here. The code is unchanged.

Every other component is unchanged. Their comments still mention
`@h3nr7/canvas`, `@h3nr7/audio` and h3nr7's pages as examples of use.
Those are comments, not imports, and they explain why the code is shaped
as it is, so they stay.

**`references/ui/lib/`.** `cn.ts`, `reveal-queue.ts`, `use-mobile.ts`
and the two specs, unchanged.

**`references/ui/styles/tokens.css`.** h3nr7's, with these edits:

- the three font tokens:
  - `--font-display: Baskerville, 'Libre Baskerville', 'Times New Roman', Times, serif;`
  - `--font-body: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;`
  - `--font-mono` unchanged (it was already a system stack);
- the type comment above them rewritten: the tokens keep their names, a
  project that serves a face puts it at the front of the stack, and
  nothing here loads a kit;
- the `--font-mono` comment rewritten with the block: it named the kit
  and an h3nr7 task;
- the weight comment rewritten: the kit-specific note on which weights
  `inter-18pt` draws goes, replaced by one line saying a face may not
  draw every step and the tokens are nominal;
- the sidebar alias block removed, with its comment;
- everything else unchanged, including `--colour-flock` (harmless, and
  documented in the file) and the shadcn aliases the copied components
  use.

**`references/ui/styles/scramble.css`.** h3nr7's, plus the
`.h3-visually-hidden` rule from `apps/web/app/app.css`, appended with a
comment saying `ScrambleText` creates that class.

**`references/ui/styles/theme.css`.** New to the reference, taken from
`apps/web/app/theme.css`: the `@theme inline` block mapping the site
colours (`page`, `surface`, `ink`, `ink-muted`, `ink-faint`, `line`,
`emphasis`), the three font families, and the shadcn names the copied
components use (`background`, `foreground`, `card`, `popover`, `primary`,
`secondary`, `muted`, `accent`, `border`, `input`, `ring`,
`destructive`, with their foregrounds). The sidebar names go with the
sidebar aliases. Only a Tailwind project imports it.

**`references/ui/index.ts`.** A barrel exporting the copied set and
`useIsMobile`, trimmed from h3nr7's: the shadcn exports, the lucide
re-exports and `FONT_HOSTS` go.

**`references/ui/README.md`.** In the style of the plugin's docs, and
with the sections the h3nr7-components skill (feature 1) reads by name:
**What it is**, **Dependencies**, **What to wire**, **Taken from**. The
skill installs from the Dependencies section at the README's range, so
the ranges are caret ranges as feature 1's are; the exact versions the
copy was taken from are recorded under Taken from. Between those, this
README's own sections:

- **What it is**: the folder, where it came from, the date.
- **Components**: two lists. **Need Tailwind**: `Popover`, `Switch`,
  `Slider`, `Controls` (`cn` resolves Tailwind conflicts but works as a
  plain joiner without it). **Plain**: `Dialog`, `Drawer`, `Tooltip`,
  `Field`, `Nav`, `ScrambleText`. Each with the `h3-*` classes it carries
  for the app to style.
- **Dependencies**: `radix-ui` `^1.6.7`, `clsx` `^2.1.1`,
  `tailwind-merge` `^3.6.0`; `react` and `react-dom` `^19.2.0` as peers;
  `tailwindcss` and `@tailwindcss/vite` `^4.3.0` only if the Tailwind
  components are used. Dev, only to run the specs: `vitest`, `jsdom`,
  `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event`.
- **What to wire**: import `styles/tokens.css` and `styles/scramble.css`
  once; for the Tailwind components, `@import 'tailwindcss'`, `@source`
  the folder if it sits outside the scanned tree, and import
  `styles/theme.css` after `tokens.css`; put a face at the front of a
  font token's stack to use one; the test setup the specs need (jsdom
  environment, `@testing-library/jest-dom/vitest` in a setup file).
- **Edits to the copy**: one line each.
- **Proof**: the commands and what they showed, pointing at
  `docs/proofs/ui-proof/`.
- **Taken from**: h3nr7 `packages/ui/src` and `apps/web/app/theme.css` on
  2026-11-21, at radix-ui 1.6.7, clsx 2.1.1, tailwind-merge 3.6.0, React
  19.2, Tailwind 4.3.

**`docs/proofs/ui-proof/`.** The proof's recipe, committed as feature 1
commits `docs/proofs/flock-proof/`: the scaffold (`package.json`,
`vite.config.ts`, `tsconfig.json`, `vitest.setup.ts`, `index.html`,
`src/main.tsx`, `src/App.tsx`) and a README listing every command in
order and what passing looks like. No lockfile, no `node_modules`, no
copy of the reference: the recipe copies `references/ui` in. It is a
document a reader can rerun, not a toolchain for the plugin.

### Data and flow

Nothing moves at runtime beyond what the components already do. The
flow is the copy: read from h3nr7, write to the reference, prove in the
scratch project.

### Errors and edge cases

- A project without Tailwind imports a Tailwind component: it renders
  with Radix behaviour and no colour. The README says which four those
  are and why.
- A project with Tailwind but without `theme.css`: the same, since the
  colour utilities are never emitted. The README names `theme.css` as the
  thing to import.
- A project that serves a face: it prepends the family to the token's
  stack in its own CSS. The token's name does not change.
- `ScrambleText`'s default ligature list was measured against Mrs Eaves.
  With a system serif the pairs it groups may not fuse. That costs
  nothing visible: the two characters roll together. A consumer with a
  face of its own passes its own list through the `ligatures` prop, as
  the component already documents.
- The spec files assume jsdom and jest-dom's matchers. A spec that cannot
  run in the scratch project is adapted or dropped, and the README says
  which and why. None is expected to need it: the specs import nothing
  h3nr7-only.

### Testing

The proof is a throwaway Vite + React + TypeScript project in the session
scratchpad, `ui-proof`, with pnpm:

- Tailwind v4 through `@tailwindcss/vite`;
- `radix-ui`, `clsx`, `tailwind-merge`;
- `vitest`, `jsdom`, `@testing-library/react`,
  `@testing-library/jest-dom`, `@testing-library/user-event`;
- `references/ui` copied to `src/ui`;
- `App.tsx` rendering `Controls` (Tailwind) and `Dialog` (plain), with
  `tokens.css`, `theme.css` and `scramble.css` imported;
- `pnpm vitest run`: every copied spec passes;
- `pnpm build`: type-check and Vite build pass;
- `grep -ri "mrs-eaves\|inter-18pt\|typekit" references/ui` finds
  nothing.

The results go in the plan's acceptance criteria and the Linear comments.
The scratch project itself is not committed; its scaffold and recipe are,
under `docs/proofs/ui-proof/`, so the run can be repeated.

### Not doing

See the non-goals.

## Decisions

From the story, settled by the owner:

1. The ui is made available in coding-tools only (story decision 1).
2. h3nr7's own components only, not shadcn's set (story decision 11).
3. Font independence as the story states it.
4. References are copies pulled in by the skill, not packages (story
   decision 7).
5. coding-tools gains no toolchain; specs travel with the reference and
   run in whichever project pulls it in (story, "My other calls").

## My calls

Made without the dialog, on the owner's instruction to build through.
Each can be overruled.

1. **`theme.css` ships with the reference.** Four components use Tailwind
   colour utilities that only exist because h3nr7's web app registers
   them in `@theme inline`. Without that block they render uncoloured and
   nothing reports it. Shipping the block as `styles/theme.css` is the
   difference between self-contained and not. If wrong: one extra file to
   delete.
2. **`.h3-visually-hidden` goes into `scramble.css`.** `ScrambleText`
   creates the class and the rule lives in the web app's `app.css`.
   Without it the hidden accessible copy of the text is visible beside
   the flapping one. If wrong: one rule to move.
3. **The sidebar aliases are removed from `tokens.css` and
   `theme.css`.** They exist for the console's shadcn Sidebar, which is
   out of scope, and nothing copied reads them. If wrong: paste the block
   back.
4. **Every other h3nr7-specific comment stays.** The comments explain why
   the code is shaped as it is. Only the `Controls` comment that names
   `fonts.css` as a fact of this folder is reworded, and the two
   `tokens.css` comments that describe the Adobe kit. If wrong: comments
   to edit.
5. **A trimmed `index.ts` ships.** A consumer gets one import path. If
   wrong: delete it and import files directly.
6. **The font stacks.** `--font-display` keeps h3nr7's fallbacks with the
   Adobe face removed from the front: Baskerville first, since h3nr7
   chose those fallbacks to be metrically close to Mrs Eaves. `--font-body`
   likewise with `inter-18pt` removed: Inter first, then the system
   stack. If wrong: two lines.
7. **`App.tsx` in the proof renders `Controls` and `Dialog`.** One
   Tailwind component and one plain one covers both kinds. If wrong: the
   proof is rerun with another.
8. **Four tasks, proving ground first.** The scratch project is the test
   harness for everything after it, so it is task 1. If wrong: the order
   only.
9. **Docs are committed on `feature/ui-reference`** under `docs/plans/`,
   as the story said for features 1 and 3.

From the builder check, settled by me:

10. **The README keeps the skill's contract.** Feature 1's plan has the
    skill read each reference README by section name: Dependencies, at
    the README's range, and What to wire. So this README uses those
    section names and caret ranges, and records the exact versions under
    Taken from. If wrong: section headings and five version strings.
11. **The proof scaffold is committed under `docs/proofs/ui-proof/`.**
    Feature 1 commits `docs/proofs/flock-proof/` the same way. A
    scratchpad is session-local, so without the recipe the proof cannot
    be rerun. It is a scaffold and a README, not a toolchain: no
    lockfile, no `node_modules`, nothing the plugin runs. If wrong: one
    folder to delete.
12. **Comments naming Mrs Eaves or the kit do not count under the
    anti-goal.** The anti-goal is about tokens and classes: what a
    browser would try to load. `ScrambleText`'s comments explain why its
    default ligature list is what it is, and stay. The check is the grep
    on `mrs-eaves`, `inter-18pt`, `typekit` and `jik4pcx`, which are the
    identifiers a stylesheet or a kit would carry. The one exception is
    the type block in `tokens.css`, which is rewritten anyway, and its
    `--font-mono` comment goes with it. If wrong: comments to edit.

## How the owner knows it works

- `git ls-files references/ui` on `feature/ui-reference` lists the ten
  components, six component specs, three lib files, two lib specs,
  `tokens.css`, `scramble.css`, `theme.css`, `index.ts` and `README.md`,
  and nothing from shadcn's set and no `fonts.css`.
- `grep -rn "from '" references/ui` shows only `react`, `radix-ui`,
  `clsx`, `tailwind-merge`, `vitest`, `@testing-library/*` and relative
  paths inside the folder.
- `grep -ri "mrs-eaves\|inter-18pt\|typekit\|jik4pcx" references/ui`
  finds nothing.
- In the scratch project, `pnpm vitest run` reports every spec file
  passed, and `pnpm build` exits 0.
- The README answers: which components need Tailwind, which are plain,
  which packages at which versions, what to import.

## Left to the builder

- The exact wording of the rewritten comments in `tokens.css` and
  `Controls.tsx`.
- Whether the proof's `vitest.config.ts` lives in `vite.config.ts` or on
  its own.
- The README's section order.
