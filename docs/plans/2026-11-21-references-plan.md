# Implementation Plan: References 1, the flock and WebGPU canvas references and the h3nr7-components skill

Design: [2026-11-21-references-design.md](./2026-11-21-references-design.md)
Linear: H3N-82

## Overview

Give h3nr7-coding-tools a `references/` folder with two reference
components copied from the h3nr7 monorepo, the WebGPU canvas and the flock,
each self-contained with a README, and a skill, `h3nr7-components`, that
copies one into a project, adds its dependencies and says what to wire.
Prove it by pulling both into a throwaway Vite R3F project and seeing
butterflies fly and flee the pointer on WebGPU, with the flock's specs
passing there.

## Global constraints

- Branch `feature/references` in h3nr7-coding-tools, off `main`. One
  commit per task. Only the paths a task names go into its commit.
- A reference imports nothing outside its folder except `react`,
  `@react-three/fiber`, `three/webgpu`, `three/tsl`, and `three` in a spec.
- The h3nr7 monorepo is read, never edited.
- Versions in READMEs, the ranges the skill installs: `three` `^0.187.0`,
  `@types/three` `^0.187.0` (dev), `@react-three/fiber` `^9.8.0`, `react`
  and `react-dom` `^19.2.0`. Each README also says the code was taken from
  h3nr7 on three 0.185 and proved on 0.187.
- The docs come first: the design and this plan are committed as task 0,
  one `docs:` commit, before task 1.
- coding-tools gains no package.json, tests or CI. Checks run in the proof
  project, at `C:\Users\h3nr7\AppData\Local\Temp\claude\538581fdda4c4b76\856c97a4-d0c4-4243-8a2e-b220b8d47ca9\scratchpad\flock-proof`,
  a Vite + React + TypeScript app on pnpm.
- Writing: short sentences, plain words, no em-dashes, as the other skills.
- No push, no merge, no plugin reinstall. Asked for at the end.

## Tasks

### 1. The WebGPU canvas reference

**Goal:** `references/webgpu-canvas/` exists with the lab's canvas and a
README a project can follow.

**Files affected:**
- `references/webgpu-canvas/WebGPUCanvas.tsx` (new)
- `references/webgpu-canvas/README.md` (new)

**Interfaces:**
- Produces: `WebGPUCanvas` (props: R3F `CanvasProps` minus `gl`),
  `useWebGPURenderer(): WebGPURenderer`, `useViewport(): Viewport`.

**What it does:**
- Copy `h3nr7/packages/lab/src/lib/webgpu-canvas.tsx` unchanged, except a
  header comment: taken from h3nr7 `packages/lab/src/lib/webgpu-canvas.tsx`
  on 2026-11-21, against three 0.185.
- The README has these sections: What it is; Dependencies (`three`,
  `@types/three` as a dev dependency, `@react-three/fiber`, `react`,
  `react-dom`, with the ranges from the global constraints); What to wire (import `WebGPUCanvas`, render children inside
  it, import three from `three/webgpu` everywhere); The one rule (two
  copies of three, `extend`); The alias recipe (the `src/three-webgpu.ts`
  shim and the regex alias from the design, word for word, and when it is
  needed: drei, meshline, any dependency that imports `three`); Taken from.

**Acceptance criteria:**
- [ ] `references/webgpu-canvas/WebGPUCanvas.tsx` differs from the lab file
      only in its header comment (`diff` shows comment lines only).
- [ ] The file imports only `@react-three/fiber`, `react` and `three/webgpu`.
- [ ] The README has the six sections named above, and the alias recipe
      contains `find: /^three$/` and
      `export { CubeRenderTarget as WebGLCubeRenderTarget }`.
- [ ] In the proof project, with `WebGPUCanvas` copied in and three 0.187,
      `pnpm build` passes and the page shows a canvas with no page errors
      in Chrome.

### 2. The flock's pure helpers and their specs

**Goal:** `ray.ts`, `ease.ts`, `forces.ts` and `repeller.ts` exist in
`references/flock/`, import nothing outside the folder, and their specs
pass.

**Files affected:**
- `references/flock/ray.ts` (new, from `canvas/src/lib/ray.ts`)
- `references/flock/ease.ts` (new, `damp` from `canvas/src/lib/pointer.ts`)
- `references/flock/forces.ts` (new, from `visuals/flock/forces.ts` plus the
  types and defaults from `lib/flock-forces.ts`)
- `references/flock/forces.spec.ts` (new, from the canvas spec)
- `references/flock/repeller.ts` (new, from `visuals/flock/repeller.ts`)
- `references/flock/repeller.spec.ts` (new, from the canvas spec)

**Interfaces:**
- Produces: `FrameRay`, `RayCamera`, `createRay()`, `pointerRay(out, nx,
  ny, camera)`; `damp(current, target, smoothing, delta)`; `FlockForceKind`,
  `FlockForce`, `FLOCK_FORCE_DEFAULTS`, `FLOCK_FORCE_LIMITS`, `LiveForce`,
  `BoidForce`, `BoidForces`, `DEPTH_RANGE`, `MIN_DISTANCE`,
  `createLiveForce()`, `createBoidForce()`, `stepForce(live, target, delta,
  rate?)`, `toBoidPoint(out, live, camera, centre, inverse)`; `Repeller`,
  `PointerState = { over: boolean; down: boolean; touch: boolean }`,
  `FADE_RATE`, `pointerEngaged(state)`, `toLocalRay(out, ray, inverse)`,
  `stepStrength(current, engaged, delta, rate?)`.

**What it does:**
- `Repeller` moves here from `Boids.tsx`; `Boids.tsx` (task 3) imports it.
- `pointerEngaged({ over, down, touch })`: `touch ? down : over`.
- `forces.ts` holds `FLOCK_FORCE_DEFAULTS` and `FLOCK_FORCE_LIMITS` with
  h3nr7's values (defaults: x 0, y 0, depth 0, strength 2, radius 0.5;
  limits: x, y, depth -1..1, strength 0..3, radius 0.02..1) and no store.
- Specs: import paths repointed; `repeller.spec.ts`'s `pointerEngaged`
  cases rewritten for `PointerState` (mouse over: true; mouse not over:
  false; touch down: true; touch up: false); everything else unchanged.
- The proof project gains Vitest (`pnpm add -D vitest`) and a
  `vitest.config.ts` that includes `src/**/*.spec.ts`; the flock folder is
  copied to `src/flock/` for this task's check.

**Acceptance criteria:**
- [ ] `grep -rn "from '\.\./" references/flock/*.ts` finds nothing.
- [ ] No file in `references/flock/*.ts` imports `three` except
      `forces.spec.ts`, which imports from `three` only.
- [ ] In the proof project, `pnpm vitest run` reports every test in
      `forces.spec.ts` and `repeller.spec.ts` passing and none skipped.
- [ ] `pointerEngaged({ over: true, down: false, touch: false })` is true,
      `pointerEngaged({ over: true, down: false, touch: true })` is false,
      `pointerEngaged({ over: false, down: true, touch: true })` is true.

**Depends on:** nothing.

### 3. Boids, Butterfly, Flock, index and the flock README

**Goal:** `references/flock/` is a complete, self-contained flock with a
README, usable through `Flock` or by composing `Boids` with another bird.

**Files affected:**
- `references/flock/Boids.tsx` (new, from the canvas copy)
- `references/flock/Butterfly.tsx` (new, from the canvas copy)
- `references/flock/Flock.tsx` (new, from the canvas copy, stripped)
- `references/flock/index.ts` (new)
- `references/flock/README.md` (new)

**Interfaces:**
- Consumes: task 2's exports.
- Produces: `Boids` props as in the canvas copy plus `alignment?: number`
  (0..1, default 0.5) and `speed?: number` (0..1, default 0.5);
  `useBoids(): BoidsCtx` with `count`, `positionBuffer`, `velocityBuffer`,
  `velocityNextBuffer`, `phaseBuffer`; `alignmentWeight(a) = a * 4`,
  `speedScale(s) = 6 + s * 18`; `Butterfly` props `colours: readonly
  string[]`, `opacity?: number` (1), `fade?: { current: number }`,
  `depthTest?: boolean` (true); `Flock` props as the design's table.

**What it does:**
- `Boids.tsx`: remove the `lib/flock-controls` import; `uAlignment` and
  `uSpeedScale` start from the props and ease toward them each frame with
  `CONTROL_EASE_SECONDS` 0.6 as now; `useWebGPURenderer` stays inline;
  `Repeller` and `BoidForces` come from task 2's files; the "Copied from"
  header is replaced by a "Taken from h3nr7 … on 2026-11-21" one.
- `Butterfly.tsx`: `presence` becomes optional `fade`; opacity node is
  `uOpacity` times `uFade`, with `uFade` written each frame from
  `fade?.current ?? 1`; `depthTest` and `depthWrite` follow the prop.
- `Flock.tsx`: drop Blobby, `setDrawnStandIn`, `useDevControls`,
  `readColour`, `readFlockForces`, `contributeCamera`, the overlay. Keep
  the group, the per-frame ray and strength, and the force stepping. The
  ray comes from `pointerRay(ray, state.pointer.x, state.pointer.y,
  camera)` with R3F's `state.pointer` and `state.camera`
  (`isPerspectiveCamera` checked, as now). Engagement: on mount, add
  listeners to `gl.domElement` for `pointerenter`, `pointerleave`,
  `pointerdown`, `pointerup`, `pointercancel`; keep a `PointerState` ref;
  remove them on unmount. The `pointer` prop false means strength stays 0.
  `attractor` and `repeller` props (`FlockForce | null`) are stepped with
  `stepForce` and converted with `toBoidPoint` into the `forces` ref, as
  h3nr7's `Flock` does from its store.
- `index.ts` exports `Flock`, `Boids`, `useBoids`, `Butterfly`, every type
  and helper from task 2, `alignmentWeight`, `speedScale`.
- README sections: What it is; Exports; `Flock` props (the design's table);
  `Boids` and `Butterfly` props; Composing `Boids` with another bird (what
  `useBoids` gives, and that a vertex stage reads
  `positionBuffer.element(instanceIndex)` and the velocity and phase the
  same way, with `Butterfly.tsx` as the worked example); Dependencies;
  Needs a WebGPU canvas (the canvas reference, and the two-copies rule);
  Specs (which files, run with Vitest); Taken from.

**Acceptance criteria:**
- [ ] `references/flock/` has exactly the eleven files the design lists.
- [ ] No file imports `../`, `@h3nr7/`, `lib/`, or `leva`.
- [ ] In the proof project with both references copied in and
      `<WebGPUCanvas><Flock colours={['#17171a', '#595a5f']} /></WebGPUCanvas>`
      full screen, `pnpm build` and `pnpm tsc --noEmit` pass.
- [ ] In Chrome with WebGPU, the page shows butterflies moving, and moving
      the mouse over them pushes them away; the console shows no errors.
      Checked by eye or by two Playwright screenshots a second apart that
      differ.
- [ ] With `pointer={false}` the flock ignores the mouse.
- [ ] `pnpm vitest run` still passes in the proof project.

**Depends on:** task 2.

**Risk:** R3F's `state.pointer` is only updated while the pointer moves
over the canvas. That is what the ray needs; the engagement state carries
whether it is over at all.

### 4. The h3nr7-components skill, README and manifest

**Goal:** The skill exists and the plugin names it and the references; the
version is 0.4.0.

**Files affected:**
- `skills/h3nr7-components/SKILL.md` (new)
- `README.md`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`

**What it does:**
- `SKILL.md` frontmatter: `name: h3nr7-components`; `description` in the
  style of the others, saying when to use it (pull a reference component
  such as the flock or the WebGPU canvas into a project; "add the flock",
  "copy the WebGPU canvas in") and what it does.
- Body: the six steps of the design, each a short section: List, Target,
  Copy, Dependencies, Wire, Record. The references folder is found at
  `<skill base>/../../references/`. Step 2 uses the question dialog where
  one exists and never guesses a path. Step 3 stops on an existing folder
  and asks: replace, skip, copy beside. Step 4 detects the package manager
  from the lockfile (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`,
  `bun.lockb`, else pnpm), adds only missing dependencies at the README's
  range with one install command that it runs (dev dependencies as dev),
  and never changes a present version. Step 5
  prints the README's "What to wire" and adds the alias recipe when
  `node_modules/@react-three/drei` or `node_modules/meshline` exists.
  Step 6 says what was copied, from which plugin version, and what is left.
- README: a "Reference components" section with a table (name, what it
  is, dependencies) and the skill added to the skills table.
- `plugin.json`: version `0.4.0`; description and `marketplace.json`
  description gain a clause on reference components; keywords gain
  `references`, `webgpu`, `flock`.

**Acceptance criteria:**
- [ ] `skills/h3nr7-components/SKILL.md` has frontmatter with `name` and
      `description` and six step sections titled List, Target, Copy,
      Dependencies, Wire, Record.
- [ ] The skill text never states a default target path; step 2 asks.
- [ ] `plugin.json` version is `0.4.0`.
- [ ] README's skills table has five rows and a "Reference components"
      section listing `webgpu-canvas` and `flock`.
- [ ] Following the skill by hand on the clean scaffold (which has react
      but no three), the copy lands at the path asked for, the install
      command adds exactly `three`, `@react-three/fiber` and, as a dev
      dependency, `@types/three`, and the wiring text is enough to mount
      the flock.

**Depends on:** tasks 1 and 3 (the READMEs it reads).

### 5. Proof and sign-off

**Goal:** The feature is proved end to end on a clean proof project and
the result recorded on H3N-82.

**Files affected:**
- `docs/proofs/flock-proof/README.md` (new): the recipe, every command in
  order, and what passing looks like
- `docs/proofs/flock-proof/package.json`, `vite.config.ts`,
  `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx` (new): the
  scaffold, with react, vite and vitest but no three
- `docs/proofs/flock-proof/shoot.mjs` (new): a Playwright script that opens
  the dev server with WebGPU flags, takes two screenshots a second apart
  with the mouse moved between them, and fails on any console error
- the proof project itself in the scratchpad, not committed

**What it does:**
- The recipe is: copy the scaffold to a scratch folder, `pnpm install`,
  follow `SKILL.md` for `webgpu-canvas`, then for `flock` (the install
  step is what adds three), mount
  `<WebGPUCanvas><Flock colours={['#17171a', '#595a5f']} /></WebGPUCanvas>`,
  run `pnpm build`, `pnpm tsc --noEmit`, `pnpm vitest run`, then
  `node shoot.mjs` (or look in Chrome). Then `pnpm add @react-three/drei`,
  apply the alias recipe, render drei's `OrbitControls` beside the flock,
  and run the build and `shoot.mjs` again.
- Record on H3N-82: the commands, their results, the screenshot paths, the
  Playwright flags that enabled WebGPU, and the plugin version.

**Acceptance criteria:**
- [ ] `docs/proofs/flock-proof/README.md` lists every command, and a
      reader following it from the scaffold alone reaches the same result.
- [ ] After the skill's steps and nothing else, `pnpm build`,
      `pnpm tsc --noEmit` and `pnpm vitest run` pass on the proof project.
- [ ] `shoot.mjs` exits 0: the two screenshots differ and no console error
      was logged; by eye, the butterflies move and flee the pointer.
- [ ] With drei installed, `OrbitControls` rendered and the alias on,
      `pnpm build` passes and `shoot.mjs` exits 0 again.
- [ ] A comment on H3N-82 records the above.

**Depends on:** task 4.

**Risk:** Headless Chromium may not enable WebGPU. `shoot.mjs` tries
`--enable-unsafe-webgpu --enable-features=Vulkan --use-angle=vulkan`
headless, then headed; if neither works, the check is by eye in the
desktop Chrome, and the README and the H3N-82 comment say so.
