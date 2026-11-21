# ui

## What it is

h3nr7's own UI components, lib and design tokens, as a reference a
project copies in and owns. Behaviour and tokens, not a look: focus
management, accessible names, label wiring, reduced-motion handling, and
one place where colour, type and spacing are named. Each component
carries a stable `h3-*` class for the app to style.

Font independent. `--font-display`, `--font-body` and `--font-mono` keep
their names and hold system stacks. Nothing here loads a face or a kit.

Not here: shadcn's set (Button, Card, Table, Sidebar and the rest of the
`/internal` console), which stays in h3nr7, and `fonts.css`.

The folder:

```
ui/
  index.ts                 the barrel
  components/              ten components, six specs
  lib/                     cn, reveal-queue, use-mobile, two specs
  styles/tokens.css        colour, type, spacing, motion, z, focus
  styles/theme.css         the Tailwind theme for the tokens
  styles/scramble.css      ScrambleText's structure
```

## Components

**Need Tailwind.** These carry Tailwind utility classes (`bg-ink`,
`text-ink-muted`, `bg-popover`, `ring-ring` and so on). The utilities
exist only once `styles/theme.css` has registered the tokens with
Tailwind, so without Tailwind and that file they render with Radix's
behaviour and no colour, and nothing reports it.

| Component | What it is | Classes it carries |
|---|---|---|
| `Popover` | shadcn's popover on the tokens: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `PopoverClose` | `h3-popover` |
| `Switch` | a real `role="switch"`, thin track, hover ring on the thumb | `h3-switch`, `h3-switch-thumb` |
| `Slider` | shadcn's slider with the accessible name on the thumb | `h3-slider`, `h3-slider-thumb` |
| `Controls` | folders of switches and sliders drawn from data; composes `Switch` and `Slider` | `h3-controls`, `h3-controls-folder`, `h3-controls-name`, `h3-controls-row`, `h3-controls-label`, `h3-controls-value`, `h3-controls-empty` |

`cn` (clsx + tailwind-merge) resolves conflicting utilities so a caller's
`p-8` beats a component's `p-4`. Without Tailwind it still works as a
plain class joiner.

**Plain.** No utilities. The app styles the classes; without a rule they
are unstyled and still correct for a keyboard and a screen reader.

| Component | What it is | Classes it carries |
|---|---|---|
| `Dialog` | a modal dialog: focus trapped and restored, Escape closes, a required title, `DialogClose` | `h3-dialog-overlay`, `h3-dialog`, `h3-dialog-close` |
| `Drawer` | a panel on the edge of the screen, modal or not, always controlled | `h3-drawer`, `h3-drawer-header`, `h3-drawer-title`, `h3-drawer-close`, `h3-drawer-description` |
| `Tooltip` | a tooltip, with `TooltipProvider` for shared timing | `h3-tooltip` |
| `Field` | a labelled input with its hint and error wired to `aria-describedby`, `aria-invalid` and `role="alert"` | `h3-field`, `h3-field-hint`, `h3-field-error` |
| `Nav` | a labelled `<nav>` with `NavItem` (`aria-current="page"`), `MenuButton` (a named disclosure) and `SkipLink` | `h3-nav`, `h3-nav-item`, `h3-menu-button`, `h3-skip-link` |
| `ScrambleText` | text that flips on hover like a split-flap board, with blur, breathe, self-reveal, autoplay and animate-in options; needs `styles/scramble.css` | `h3-scramble`, `h3-scramble-word`, `h3-scramble-char`, `h3-visually-hidden` |

**Lib.** `cn` as above. `reveal-queue`: one `ScrambleText` self-reveal
at a time, across the page. `use-mobile`: `useIsMobile()`, true below
768px, false on the server.

**Specs.** `Dialog`, `Drawer`, `Controls`, `Field`, `Nav`,
`ScrambleText`, `cn` and `reveal-queue` have spec files beside them.
They run with Vitest in jsdom; see What to wire.

`ScrambleText` groups the ligature pairs of h3nr7's display face so each
arrives as one glyph. With a different face the pairs may not fuse; that
costs nothing visible, and the `ligatures` prop takes another list.

## Dependencies

| Package | Range | Kind |
|---|---|---|
| `radix-ui` | `^1.6.7` | dependency |
| `clsx` | `^2.1.1` | dependency |
| `tailwind-merge` | `^3.6.0` | dependency |
| `react` | `^19.2.0` | dependency |
| `react-dom` | `^19.2.0` | dependency |

`radix-ui` is one package for every primitive: Dialog, Drawer, Tooltip,
Popover, Switch, Slider and Field import from it. `clsx` and
`tailwind-merge` are `cn`'s.

Not in the table, so they are not installed blind:

- The Tailwind components need Tailwind v4: `tailwindcss` and
  `@tailwindcss/vite` at `^4.3.0`, as dev dependencies. A project that
  uses only the plain components does not need them.
- The specs need `vitest`, `jsdom`, `@testing-library/react`,
  `@testing-library/jest-dom` and `@testing-library/user-event`, as dev
  dependencies. Any current version; the proof ran on vitest 5.1.1 and
  jsdom 31.0.1.

## What to wire

1. **The styles, once.** In the app's stylesheet:

   ```css
   @import './ui/styles/tokens.css';
   @import './ui/styles/scramble.css';   /* if ScrambleText is used */
   ```

   `tokens.css` sets `color-scheme`, the palette in light and dark, the
   type scale, spacing, radii, z tiers, a focus ring on inputs and none
   on links and buttons, and the reduced-motion clamp. Read its comments
   before overriding any of it.

2. **Tailwind, for the four components that need it.** Tailwind v4, with
   the theme imported after the tokens:

   ```css
   @import 'tailwindcss';
   @source './ui';                       /* see below */
   @import './ui/styles/tokens.css';
   @import './ui/styles/theme.css';
   @import './ui/styles/scramble.css';
   ```

   Tailwind scans the project for class names and skips anything
   `.gitignore` lists and anything under `node_modules`. If the copy sits
   in either, or outside the scanned tree, add `@source './ui';` with the
   path to the folder. Without it the components build with none of their
   utilities and nothing reports it. The proof hit exactly this.

3. **A face, if the project has one.** Put it at the front of the token's
   stack in the app's CSS, after `tokens.css`:

   ```css
   :root { --font-display: 'My Serif', Baskerville, 'Libre Baskerville', serif; }
   ```

   The token names do not change, so every component and rule that says
   `var(--font-display)` picks it up.

4. **`TooltipProvider`**, once near the root, if tooltips are used.

5. **The `h3-*` classes.** The plain components ship no rules for them.
   Radix portals land in `document.body`, so rules for `h3-dialog`,
   `h3-drawer`, `h3-tooltip` and `h3-popover` must be global, not scoped
   to a page.

6. **The specs.** Vitest with `environment: 'jsdom'`, a setup file that
   does `import '@testing-library/jest-dom/vitest';`, and the three
   Testing Library packages. `Controls.spec` stubs `ResizeObserver`,
   which jsdom lacks and Radix's slider needs; any spec of your own that
   renders a `Slider` needs the same stub. `docs/proofs/ui-proof/` in
   h3nr7-coding-tools is a working setup.

## Edits to the copy

Everything else is byte for byte h3nr7's.

- `components/Controls.tsx`: one comment no longer names `fonts.css`.
- `index.ts`: the barrel exports this set only; the shadcn exports, the
  icon re-exports and `FONT_HOSTS` are gone.
- `styles/tokens.css`: the three font tokens hold system stacks, with
  the type and weight comments rewritten to match; the console's sidebar
  aliases are removed.
- `styles/scramble.css`: the `.h3-visually-hidden` rule from h3nr7's web
  app is appended, since `ScrambleText` creates that class.
- `styles/theme.css`: new to the reference, from h3nr7's web app, with
  its header reworded and the sidebar names removed.

## Proof

Run on 2026-11-21 from `docs/proofs/ui-proof/` in h3nr7-coding-tools,
whose README has every command:

- `pnpm test` with the folder copied to `src/ui`: Test Files 9 passed
  (9), Tests 99 passed (99). The eight spec files here and the harness's
  own. No spec adapted or dropped.
- `pnpm build` with `Controls` and `Dialog` rendered and the four
  stylesheets imported: exit 0. The built CSS carries
  `--font-display:Baskerville, ...`, `.bg-ink` and `.bg-popover`, and no
  `mrs-eaves`, `inter-18pt` or `typekit`.

Resolved on the day: radix-ui 1.8.1, clsx 2.1.1, tailwind-merge 3.7.1,
react 19.3.1, tailwindcss 4.3.5, vite 8.3.8, vitest 5.1.1, typescript
7.0.2, jsdom 31.0.1.

## Taken from

h3nr7 `packages/ui/src` (components, lib, `tokens.css`, `scramble.css`)
and `apps/web/app/theme.css` (the theme) and `apps/web/app/app.css` (the
visually-hidden rule), on 2026-11-21, at radix-ui 1.6.7, clsx 2.1.1,
tailwind-merge 3.6.0, React 19.2 and Tailwind 4.3 as h3nr7 had them
installed.
