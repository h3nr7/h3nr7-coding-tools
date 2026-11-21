# Implementation Plan: UI reference

Design: [2026-11-21-ui-reference-design.md](./2026-11-21-ui-reference-design.md)
Linear: H3N-83 (sub-issues H3N-89, H3N-90, H3N-91, H3N-92)

## Overview

Give h3nr7-coding-tools `references/ui/`: h3nr7's own UI components,
lib and styles, copied with the smallest edits that make the folder
self-contained and font independent, with a README the h3nr7-components
skill can read. Prove it by running the copied specs and a build in a
throwaway Vite project with Tailwind, Radix and jsdom, from a recipe
committed under `docs/proofs/ui-proof/`.

## Global constraints

- Branch `feature/ui-reference` in the worktree
  `c:\Users\h3nr7\Documents\projects\h3nr7\h3nr7-coding-tools-ui`, off
  `main`. One commit per task. Only the paths a task names go into its
  commit. The docs are committed first, before task 1.
- `README.md`, `.claude-plugin/` and `skills/` are not touched. Feature 1
  (H3N-82) owns them.
- The h3nr7 monorepo at `c:\Users\h3nr7\Documents\projects\h3nr7\h3nr7`
  is read, never edited. Source: `packages/ui/src` and
  `apps/web/app/theme.css`, plus the `.h3-visually-hidden` rule in
  `apps/web/app/app.css`.
- A copied file imports nothing outside `references/ui` except `react`,
  `radix-ui`, `clsx`, `tailwind-merge`, and in a spec `vitest` and
  `@testing-library/*`.
- Font tokens, exact values:
  `--font-display: Baskerville, 'Libre Baskerville', 'Times New Roman', Times, serif;`
  `--font-body: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;`
  `--font-mono: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace;`
  The strings `mrs-eaves`, `inter-18pt`, `typekit` and `jik4pcx` appear
  nowhere under `references/ui`.
- Versions in the README, the ranges the skill installs: `radix-ui`
  `^1.6.7`, `clsx` `^2.1.1`, `tailwind-merge` `^3.6.0`, `react` and
  `react-dom` `^19.2.0`, `tailwindcss` and `@tailwindcss/vite` `^4.3.0`
  (only for the Tailwind components). Taken from h3nr7 on 2026-11-21 at
  radix-ui 1.6.7, clsx 2.1.1, tailwind-merge 3.6.0.
- coding-tools gains no package.json, tests or CI. Checks run in the
  proof project at
  `C:\Users\h3nr7\AppData\Local\Temp\claude\538581fdda4c4b76\856c97a4-d0c4-4243-8a2e-b220b8d47ca9\scratchpad\ui-proof`,
  a Vite + React + TypeScript app on pnpm, made from the committed
  scaffold.
- Writing: short sentences, plain words, no em-dashes, as the other
  skills. Copied source keeps its own comments.
- No push, no merge.

## Tasks

### 1. The proving ground

**Linear:** H3N-89

**Goal:** `docs/proofs/ui-proof/` holds a Vite + React + TypeScript
scaffold with Tailwind v4, the reference's dependencies and a Vitest +
jsdom + Testing Library setup, and a README of every command. A copy of
it in the scratchpad installs, runs its own smoke spec and builds.

**Files affected:**
- `docs/proofs/ui-proof/README.md` (new)
- `docs/proofs/ui-proof/package.json` (new)
- `docs/proofs/ui-proof/vite.config.ts` (new)
- `docs/proofs/ui-proof/tsconfig.json` (new)
- `docs/proofs/ui-proof/vitest.setup.ts` (new)
- `docs/proofs/ui-proof/index.html` (new)
- `docs/proofs/ui-proof/src/main.tsx` (new)
- `docs/proofs/ui-proof/src/App.tsx` (new)
- `docs/proofs/ui-proof/src/App.spec.tsx` (new)
- `docs/proofs/ui-proof/src/index.css` (new)
- `docs/proofs/ui-proof/.gitignore` (new): `node_modules`, `dist`,
  `pnpm-lock.yaml`, `src/ui`

**Interfaces:**
- Produces: the scaffold, with `src/ui/` as the place task 2 copies the
  reference to and `src/index.css` as the file task 3 imports the styles
  from.

**What it does:**
- `package.json`: `"type": "module"`, scripts `dev`, `build`
  (`tsc --noEmit && vite build`), `test` (`vitest run`). Dependencies:
  `react`, `react-dom` `^19.2.0`, `radix-ui` `^1.6.7`, `clsx` `^2.1.1`,
  `tailwind-merge` `^3.6.0`. Dev: `vite`, `@vitejs/plugin-react`,
  `typescript`, `@types/react`, `@types/react-dom`, `tailwindcss`,
  `@tailwindcss/vite` `^4.3.0`, `vitest`, `jsdom`,
  `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event`. Latest of each where no range is given.
- `vite.config.ts`: the React plugin, `@tailwindcss/vite`, and a `test`
  block: `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`,
  `include: ['src/**/*.spec.{ts,tsx}']`. One file for both tools.
- `vitest.setup.ts`: `import '@testing-library/jest-dom/vitest';`.
- `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `jsx:
  react-jsx`, `moduleResolution: bundler`, `verbatimModuleSyntax`, `lib`
  with DOM, `types` with `vitest/globals` and
  `@testing-library/jest-dom/vitest`, `include: ['src', 'vitest.setup.ts']`.
  Matches h3nr7's `packages/ui/tsconfig.json` where it matters, so the
  copied files type-check the same way.
- `src/App.tsx`: a heading "UI proof" only. Task 3 adds the components.
- `src/App.spec.tsx`: renders `App` and finds the heading. The harness's
  own smoke test, so a failure in task 2 is the copy and not the setup.
- `src/index.css`: `@import 'tailwindcss';` only. Task 3 adds the rest.
- `README.md`: the recipe, every command in order (copy the scaffold to
  the scratchpad, `pnpm install`, copy `references/ui` to `src/ui`,
  `pnpm test`, `pnpm build`, the greps), and what passing looks like.
  Results are filled in by tasks 2 to 4.

**Acceptance criteria:**
- [ ] In a copy of the scaffold in the scratchpad, `pnpm install` exits
      0 and `pnpm test` reports `1 passed` test file and `1 passed` test.
- [ ] `pnpm build` exits 0 on the bare scaffold.
- [ ] `git ls-files docs/proofs/ui-proof` lists the files above and no
      lockfile and nothing under `node_modules` or `src/ui`.
- [ ] `docs/proofs/ui-proof/README.md` lists every command a reader runs,
      in order, from the scaffold alone.

**Risk:** The latest Vitest may fake `requestAnimationFrame` differently
from h3nr7's (`^5.0.3`), which `ScrambleText.spec` depends on. If a
reference spec fails on timers in task 2, pin `vitest` to the major
h3nr7 uses and record the ruling.

### 2. The components and the lib, copied and self-contained

**Linear:** H3N-90

**Goal:** `references/ui/components/`, `references/ui/lib/` and
`references/ui/index.ts` exist, import nothing h3nr7-only, and every
copied spec passes in the proof project.

**Files affected:**
- `references/ui/components/Dialog.tsx`, `Drawer.tsx`, `Tooltip.tsx`,
  `Popover.tsx`, `Switch.tsx`, `Slider.tsx`, `Controls.tsx`, `Field.tsx`,
  `Nav.tsx`, `ScrambleText.tsx` (new, from `packages/ui/src/components/`)
- `references/ui/components/Dialog.spec.tsx`, `Drawer.spec.tsx`,
  `Controls.spec.tsx`, `Field.spec.tsx`, `Nav.spec.tsx`,
  `ScrambleText.spec.tsx` (new, same source)
- `references/ui/lib/cn.ts`, `cn.spec.ts`, `reveal-queue.ts`,
  `reveal-queue.spec.ts`, `use-mobile.ts` (new, from
  `packages/ui/src/lib/`)
- `references/ui/index.ts` (new, trimmed from `packages/ui/src/index.ts`)

**Interfaces:**
- Consumes: the proof scaffold from task 1.
- Produces: `index.ts` exporting `cn`, `Dialog`, `DialogClose`,
  `DialogProps`, `Drawer`, `DrawerProps`, `Tooltip`, `TooltipProvider`,
  `Popover`, `PopoverAnchor`, `PopoverClose`, `PopoverContent`,
  `PopoverTrigger`, `Switch`, `Slider`, `Controls`, `ControlsFolder`,
  `ControlsItem`, `ControlsProps`, `Field`, `FieldProps`, `Nav`,
  `NavItem`, `MenuButton`, `SkipLink`, `NavLinkProps`, `ScrambleText`,
  `ScrambleTextProps`, `useIsMobile`. Task 3's `App.tsx` imports
  `Controls` and `Dialog` from `./ui`.

**What it does:**
- Copy each file unchanged, except:
  - `Controls.tsx`: the comment beginning "Folder names are `<p>`, not
    headings" says a site stylesheet may set h1 to h4 in the display
    face, instead of naming `fonts.css`. Comment lines only.
  - `index.ts`: keep the header comment and the exports for the copied
    set and `useIsMobile`; drop the shadcn exports, the `grep -nw "Button|Sidebar|lucide|FONT_HOSTS" references/ui/index.ts`
    re-exports and `FONT_HOSTS` with their comments. Add one line to the
    header: taken from h3nr7 `packages/ui/src` on 2026-11-21.
- No other edit. In particular `ScrambleText.tsx` keeps its comments on
  Mrs Eaves and the kit: they explain the default ligature list, and the
  `ligatures` prop is the way to a different face.
- Specs are copied as they are. A spec that fails in the proof for a
  reason that is h3nr7-only is adapted with the smallest change, or
  dropped, and the reason goes in the README and the issue comment. None
  is expected to.

**Acceptance criteria:**
- [ ] For every file in `references/ui/components` and `references/ui/lib`
      except `Controls.tsx`, `diff` against the h3nr7 file of the same
      name is empty. For `Controls.tsx`, `diff` shows comment lines only.
- [ ] `grep -rhn "from '" references/ui --include=*.ts --include=*.tsx | grep -v "from '\./\|from '\.\./"`
      lists only `react`, `radix-ui`, `clsx`, `tailwind-merge`, `vitest`,
      `@testing-library/react` and `@testing-library/user-event`.
- [ ] `grep -rn "^import.*\(`grep -nw "Button|Sidebar|lucide|FONT_HOSTS" references/ui/index.ts`-react\|class-variance-authority\|@h3nr7/\|fonts.css\)" references/ui`
      finds nothing.
- [ ] `grep -c "^export" references/ui/index.ts` is at least 11, and
      `grep -nw "Button|Sidebar|lucide|FONT_HOSTS" references/ui/index.ts`\|Sidebar\|lucide\|FONT_HOSTS" references/ui/index.ts`
      finds nothing.
- [ ] In the proof project with `references/ui` copied to `src/ui`,
      `pnpm test` reports 9 test files passed (the 8 copied specs and the
      harness's) and 0 failed.
- [ ] `pnpm build` exits 0, so the copied files and specs type-check
      under the scaffold's `tsconfig.json`.

**Depends on:** task 1.

### 3. The styles, font independent

**Linear:** H3N-91

**Goal:** `references/ui/styles/` holds `tokens.css`, `scramble.css` and
`theme.css`, with system font stacks and no Adobe face, and the proof
project builds with `Controls` and `Dialog` rendered and the styles
imported.

**Files affected:**
- `references/ui/styles/tokens.css` (new, from
  `packages/ui/src/styles/tokens.css`)
- `references/ui/styles/scramble.css` (new, from
  `packages/ui/src/styles/scramble.css`)
- `references/ui/styles/theme.css` (new, from `apps/web/app/theme.css`)
- `docs/proofs/ui-proof/src/App.tsx`
- `docs/proofs/ui-proof/src/index.css`

**Interfaces:**
- Consumes: `Controls`, `Dialog` from `src/ui` (task 2).

**What it does:**
- `tokens.css`, edits and nothing else:
  - the type block: the three font tokens take the exact values from the
    global constraints; the comment above them says the tokens keep
    their names, a project that serves a face puts it at the front of
    the stack, and nothing here loads a kit; the `--font-mono` comment
    becomes one line saying a system mono stack is the default.
  - the weight block: the comment on which weights the Adobe kit draws
    becomes a short one saying the tokens are nominal and a face may not
    draw every step. The values stay.
  - the shadcn sidebar aliases (`--sidebar` to `--sidebar-ring`) and
    their comment are removed.
- `scramble.css`: unchanged, plus the `.h3-visually-hidden` rule from
  `apps/web/app/app.css` appended at the end, with a comment that
  `ScrambleText` creates that class for the accessible copy of its text.
- `theme.css`: `apps/web/app/theme.css` with the sidebar block
  (`--color-sidebar` to `--color-sidebar-ring`) and its comment removed,
  and the header comment reworded for a reference: Tailwind v4 reads its
  theme from CSS; import this after `tokens.css` in a Tailwind project.
- `App.tsx`: the heading, a `Controls` with one folder (a boolean and a
  number) holding its values in state, and a `Dialog` with a trigger
  button. `index.css`: `@import 'tailwindcss'`, then `./ui/styles/tokens.css`,
  `./ui/styles/theme.css`, `./ui/styles/scramble.css`.

**Acceptance criteria:**
- [ ] `grep -n "^  --font-" references/ui/styles/tokens.css` shows the
      three tokens with the exact values from the global constraints.
- [ ] `grep -rin "mrs-eaves\|inter-18pt\|typekit\|jik4pcx" references/ui`
      finds nothing.
- [ ] `grep -in "sidebar" references/ui/styles/*.css` finds nothing.
- [ ] `diff` of `tokens.css` against h3nr7's shows changes only in the
      type block, the weight comment and the sidebar block; `diff` of
      `scramble.css` shows only the appended rule; `diff` of `theme.css`
      against `apps/web/app/theme.css` shows only the header comment and
      the sidebar block.
- [ ] In the proof project, `pnpm build` exits 0 with `App.tsx` rendering
      `Controls` and `Dialog` and `index.css` importing the four files.
- [ ] The built stylesheet, `dist/assets/*.css`, contains `--font-display`
      followed by `Baskerville`, contains `.bg-ink` and `.bg-popover`
      (the theme registered the utilities), and does not contain
      `mrs-eaves`.
- [ ] `pnpm test` still reports 9 files passed.

**Depends on:** task 2.

### 4. The README

**Linear:** H3N-92

**Goal:** `references/ui/README.md` tells a project what it is getting,
which components need Tailwind, what to install and what to wire, in the
sections the h3nr7-components skill reads; and the proof README records
the results.

**Files affected:**
- `references/ui/README.md` (new)
- `docs/proofs/ui-proof/README.md`

**What it does:**
- Sections, in this order: What it is; Components; Dependencies; What to
  wire; Edits to the copy; Proof; Taken from. Contents as the design's
  README part says.
- Components: **Need Tailwind**: `Popover`, `Switch`, `Slider`,
  `Controls`, with a line that `cn` works without Tailwind as a plain
  joiner. **Plain**: `Dialog`, `Drawer`, `Tooltip`, `Field`, `Nav`,
  `ScrambleText`. Each line names the `h3-*` classes the component
  carries. The lib and the specs listed after.
- Dependencies: the ranges from the global constraints, in a table or a
  list the skill can read; the dev dependencies for the specs after, as
  dev.
- What to wire: import `styles/tokens.css` and `styles/scramble.css`
  once; for the Tailwind components, `@import 'tailwindcss'`, `@source`
  the folder if it sits outside Vite's scanned tree, import
  `styles/theme.css` after `tokens.css`; `TooltipProvider` once near the
  root for tooltips; a face goes at the front of a token's stack; the
  app styles the `h3-*` classes; the test setup (jsdom environment,
  `@testing-library/jest-dom/vitest` in a setup file).
- Edits to the copy: one line per edit from tasks 2 and 3.
- Proof: the commands and the counts, pointing at
  `docs/proofs/ui-proof/README.md`, which gets the same results.
- Taken from: the source paths, the date, the exact versions.

**Acceptance criteria:**
- [ ] `grep -n "^## " references/ui/README.md` lists exactly: What it is,
      Components, Dependencies, What to wire, Edits to the copy, Proof,
      Taken from, in that order.
- [ ] Under Components, `Popover`, `Switch`, `Slider` and `Controls` are
      under "Need Tailwind" and `Dialog`, `Drawer`, `Tooltip`, `Field`,
      `Nav` and `ScrambleText` under "Plain", and no component is in
      both or missing.
- [ ] Dependencies names `radix-ui` `^1.6.7`, `clsx` `^2.1.1`,
      `tailwind-merge` `^3.6.0`, `react` and `react-dom` `^19.2.0`, and
      `grep -n "`grep -nw "Button|Sidebar|lucide|FONT_HOSTS" references/ui/index.ts`\|class-variance" references/ui/README.md` finds
      nothing.
- [ ] What to wire names `tokens.css`, `scramble.css`, `theme.css`,
      `@import 'tailwindcss'`, `@source` and `jest-dom/vitest`.
- [ ] Taken from names `packages/ui/src`, `apps/web/app/theme.css`,
      `2026-11-21`, `1.6.7`, `2.1.1` and `3.6.0`.
- [ ] Neither README contains an em-dash: `grep -c $'\u2014'` is 0 on
      both.
- [ ] `docs/proofs/ui-proof/README.md` records the test and build
      results from task 3.

**Depends on:** tasks 2 and 3.
