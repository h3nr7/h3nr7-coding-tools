# References 1, the flock and WebGPU canvas references and the h3nr7-components skill: design

Date: 2026-11-21
Status: approved
Size: feature
Linear: H3N-82 (sub-issues H3N-84 to H3N-88)
Project: h3nr7 coding tools
Builds on: 12daysofxmas/docs/plans/2026-11-21-webgpu-story-design.md (the story, feature 1)

## Intent

h3nr7-coding-tools gains a new kind of content: reference components, source
folders any h3nr7 project can copy in, and a skill that does the copying.
This feature ships the first two references, the WebGPU canvas and the
flock, and the skill. 12daysofxmas (H3N-59) is the first project to pull
them in, and that pull is this feature's proof.

The story design settled what the references are and what they leave
behind. This design settles the files, the props, the skill's steps and how
the feature is proved. It does not reopen the story's decisions.

## Goals

- `references/webgpu-canvas/`: the h3nr7 lab's R3F canvas over three's
  `WebGPURenderer`, with a README that gives the one rule and the alias
  recipe.
- `references/flock/`: the h3nr7 flock stripped to its core, self-contained,
  with three and React Three Fiber as its only dependencies, its pure helpers
  and their specs along, and a README.
- `skills/h3nr7-components/`: a skill that lists the references, copies one
  into a project, adds its dependencies and says what to wire.
- The plugin's README and manifest name the skill and the references, and
  the version is 0.4.0.
- Proved on a throwaway Vite R3F project: the skill run for the canvas and
  then the flock, butterflies flying and fleeing the pointer in Chrome, the
  specs passing there.

## Non-goals

- The ui reference (feature 3, H3N-83).
- The parrot renderer, the h3nr7 stores (`flock-controls`, `flock-forces`),
  the dev controls, the colour token, presence, `drawn`, the overlay.
- A WebGL fallback in either reference.
- A toolchain, tests or CI in coding-tools itself.
- Pushing, merging, releasing or reinstalling the plugin. Those are the
  owner's steps, asked for at the end.
- Editing the h3nr7 monorepo.

## Anti-goals

Failed, even if the proof passes, if a reference imports anything outside
its own folder other than `react`, `@react-three/fiber`, `three/webgpu` and
`three/tsl` (and `three` in a spec); if the skill guesses a target path or
installs a dependency without saying so; if a spec is dropped rather than
adapted without a reason written down.

## Constraints

From the story: WebGPU only; references are copies, not packages; each
README names the three version it was written against (0.185, from h3nr7)
and the first consumer's (0.187); the h3nr7 monorepo is read only; one
commit per task, with the proof project's checks green from the task that
adds them.

Of this feature:

- No `.spec` or source file in a reference imports a path with `..` that
  leaves the reference's folder.
- Specs use Vitest, as h3nr7's do, and may import `three` (core) to check
  the maths against an independent implementation, as `forces.spec.ts` does.
- The skill runs on any package manager: it detects pnpm, npm, yarn or bun
  from the lockfile and uses that one.
- The flock's `Boids` keeps the `useWebGPURenderer` assertion inline, so the
  flock does not import the canvas reference. The README says a WebGPU
  canvas is required and points at the canvas reference.

## Where the work stands

`h3nr7/packages/lab/src/lib/webgpu-canvas.tsx` (90 lines): `WebGPUCanvas`
(async `WebGPURenderer` factory, `alpha: true`, `antialias: false`,
`extend(THREE)` at module scope), `SettleSize`, `useWebGPURenderer`,
`useViewport`. It imports only fiber, react and `three/webgpu`.

`h3nr7/packages/canvas/src/visuals/flock/`:

| File | Keeps | Loses |
|---|---|---|
| `Boids.tsx` (420 lines) | the two compute passes, buffers, `useBoids`, repeller uniforms, force uniforms, predators, central attractor, control easing | `lib/flock-controls` store; reads of it become props |
| `Butterfly.tsx` | geometry, palette as a uniform array, flap, flight basis | `presence`, which becomes `fade` |
| `Flock.tsx` | boid space group, ray to boid space, strength stepping, force stepping | `lib/frame`, `lib/colour`, `lib/flock-forces`, `lib/use-dev-controls`, `lib/drawn`, Blobby fallback, overlay |
| `forces.ts` + spec | `stepForce`, `toBoidPoint`, `DEPTH_RANGE`, `MIN_DISTANCE` | imports of `lib/flock-forces`, `lib/pointer`, `lib/ray` |
| `repeller.ts` + spec | `toLocalRay`, `stepStrength`, `FADE_RATE` | `pointerEngaged` over h3nr7's `FramePointer` |
| `palette.ts` + spec, `RepellerOverlay.tsx` | nothing | all of it |

`h3nr7/packages/canvas/src/lib/ray.ts` (`FrameRay`, `RayCamera`,
`createRay`, `pointerRay`) and `damp` from `lib/pointer.ts` import nothing
and are what the helpers need.

h3nr7-coding-tools: four skills under `skills/`, each `SKILL.md` with
`name` and `description` frontmatter and a `references/` folder of its own;
`README.md` with a skills table; `.claude-plugin/plugin.json` at 0.3.0 and
`marketplace.json`.

## Approaches

Settled by the story: approach A, reference first. Within it, two ways to
shape the flock's pure helpers were considered:

- **Keep h3nr7's module split** (`ray`, `pointer`, `forces`, `repeller`) as
  separate files in the reference, each a copy with its imports repointed.
  Chosen: the specs keep their shape, and a later diff against h3nr7 stays
  readable.
- **Fold the helpers into one `math.ts`.** Fewer files, but the specs would
  be rewritten and the diff against h3nr7 lost.

## The design

### The canvas reference

```
references/webgpu-canvas/
  WebGPUCanvas.tsx     the lab file, unchanged but for its header comment
  README.md
```

`WebGPUCanvas.tsx` keeps the lab's exports: `WebGPUCanvas`,
`useWebGPURenderer`, `useViewport`. The header comment says where it came
from and the three version. Nothing else changes.

The README says: what it is; the one rule, that three comes from
`three/webgpu` and the canvas calls R3F's `extend` with it; the alias
recipe for a project whose dependencies import `three` (drei, meshline),
which is a regex alias on the bare name to a shim module:

```ts
// src/three-webgpu.ts
export * from 'three/webgpu';
export { CubeRenderTarget as WebGLCubeRenderTarget } from 'three/webgpu';
// plus inert stand-ins for the six other names the WebGPU build lacks;
// see the canvas README. Found in task 5: the production build, unlike
// the dev server, refuses drei's dependencies without them.
```

```ts
// vite.config.ts
resolve: { alias: [{ find: /^three$/, replacement: '/src/three-webgpu.ts' }] }
```

and the dependencies: `three`, `@types/three` (dev), `@react-three/fiber`,
`react` and `react-dom` at the versions below.

### The flock reference

```
references/flock/
  index.ts          exports Flock, Boids, useBoids, Butterfly, types
  Flock.tsx         boid space, pointer ray, repeller and force stepping
  Boids.tsx         the compute passes and the buffers
  Butterfly.tsx     the bird
  forces.ts         FlockForce, stepForce, toBoidPoint
  forces.spec.ts
  repeller.ts       Repeller type, pointerEngaged, toLocalRay, stepStrength
  repeller.spec.ts
  ray.ts            FrameRay, RayCamera, createRay, pointerRay
  ease.ts           damp
  README.md
```

**`Boids`** keeps the canvas's props and adds two in place of the store:
`alignment` (0..1, default 0.5) and `speed` (0..1, default 0.5), mapped by
`alignmentWeight` (0 to 4, linear) and `speedScale` (6 to 24, linear),
which move from `lib/flock-controls` into `Boids.tsx` as exported
functions, and eased in the frame loop with the existing
`CONTROL_EASE_SECONDS` of 0.6. `repeller?: { current: Repeller }` and
`forces?: { current: BoidForces }` stay as they are. `useWebGPURenderer` is
inline. `Repeller` moves to `repeller.ts` and is re-exported.

**`Butterfly`** keeps `colours` and `opacity`, and takes
`fade?: { current: number }` (default: none, treated as 1) in place of
`presence`. It gains `depthTest?: boolean`, default `true`, since a project
with a depth buffer wants it and the h3nr7 stage, which has none, is the
odd one out.

**`Flock`** is the ready-made component:

| Prop | Default | What it does |
|---|---|---|
| `count` | 1000 | how many birds |
| `scale` | 0.05 | boid units to world units |
| `tilt` | `[1.2, 0, 0]` | the group's rotation |
| `colours` | `['#17171a']` | the palette, one picked per bird |
| `opacity` | 0.075 | every bird's alpha |
| `fade` | none | a `{ current }` ref, 0..1, multiplied into the opacity |
| `pointer` | `true` | whether the pointer repels |
| `repellerRadius` | 70 | boid units from the ray a bird feels it |
| `repellerStrength` | 1 | how hard the ray pushes |
| `attractor`, `repeller` | `null` | a `FlockForce` each, screen-relative, eased and converted as h3nr7's `Flock` did |
| `alignment`, `speed` | 0.5 | passed to `Boids` |
| `depthTest` | `true` | passed to `Butterfly` |

Each frame it reads R3F's `state.pointer` (NDC) and `state.camera`, builds
the ray with `pointerRay`, converts it with `toLocalRay` through the
group's inverse world matrix, and steps the strength with `stepStrength`
from whether the pointer is engaged. Engagement comes from DOM events on
the canvas element, which `Flock` subscribes to on mount: `pointerenter`
and `pointerleave` set `over`, `pointerdown`, `pointerup` and
`pointercancel` set `down`, and the event's `pointerType` sets `touch`.
`pointerEngaged` in `repeller.ts` takes that structural
`{ over, down, touch }` and keeps h3nr7's rule: a mouse or pen while over,
a finger while down.

The forces stay as in h3nr7 but without the store: `attractor` and
`repeller` are props, eased with `stepForce` and converted with
`toBoidPoint` into the `forces` ref that `Boids` reads. Null means off.

**`forces.ts`** gains the types and the defaults that `lib/flock-forces`
held: `FlockForceKind`, `FlockForce`, `FLOCK_FORCE_DEFAULTS` and
`FLOCK_FORCE_LIMITS`, without the store. Its spec is unchanged but for the
import paths.

**`repeller.ts`**: `toLocalRay` and `stepStrength` unchanged;
`pointerEngaged` rewritten over `{ over, down, touch }`; its spec's
`pointerEngaged` cases rewritten to match, the rest unchanged but for
import paths.

**README** states: what it is and where it came from; the exports; the
props tables above; the dependencies (`three`, `@react-three/fiber`,
`react`, `react-dom`) with versions; that a WebGPU canvas is required, with
the canvas reference named; the two-copies-of-three rule; how to compose
`Boids` with another bird (the `useBoids` buffers and the vertex stage
`Butterfly` builds), since that is what 12daysofxmas does with the parrot;
and the spec files and how to run them.

### The skill

`skills/h3nr7-components/SKILL.md`, frontmatter `name` and `description`
in the style of the other four. Steps:

1. **List.** Read every `README.md` under the plugin's `references/`
   (`<skill base>/../../references/*/README.md`) and show each reference's
   name and first paragraph. If the user named one, skip to it.
2. **Target.** Ask where it goes, with a dialog where one exists, offering
   the project's conventional place if one is obvious (for example
   `src/three/` or `src/components/`) and "Other". Never guess.
3. **Copy.** Copy the reference folder, spec files included, into the
   target path as `<target>/<reference name>/`. If that folder exists,
   stop and ask: replace, skip or copy beside it. Leave the README in the
   copy, so the project keeps the record of what it took and when.
4. **Dependencies.** Read the README's dependency list. Detect the package
   manager from the lockfile (`pnpm-lock.yaml`, `package-lock.json`,
   `yarn.lock`, `bun.lockb`; default pnpm). For each dependency not already
   in `package.json`, add it at the README's version range, with one
   install command, and say exactly what was added. Never change a version
   already present; say if it is below the README's.
5. **Wire.** Print the README's "what to wire" section, and the alias
   recipe when the project has a dependency that imports `three` (checked
   by listing `node_modules/@react-three/drei` and `meshline`).
6. **Record.** Say what was copied, from which plugin version, and what is
   left to the user.

The plugin README gains a "Reference components" section with a table of
the references and a line on the skill; the skills table gains the skill.
`plugin.json` and `marketplace.json` descriptions mention the references;
`plugin.json` version becomes 0.4.0.

### Testing

- The flock's specs run in the proof project with Vitest and pass.
- The proof project: a scratch Vite + React + TypeScript app from the
  committed scaffold in `docs/proofs/flock-proof/`, with react, Vite and
  Vitest but no three, and the two references pulled in by following
  `SKILL.md` by hand, whose install step adds three and fiber. It
  mounts `<WebGPUCanvas><Flock colours={[...]} /></WebGPUCanvas>` full
  screen. `pnpm build` passes. In Chrome, by eye or by a Playwright
  screenshot with WebGPU enabled: butterflies on screen, moving, and
  bending away from the pointer. No page errors.
- The alias recipe is proved there too: drei is added to the proof project,
  its `OrbitControls` rendered, and the build and the page still work with
  the alias on.
- The skill is read as a reviewer would: every step names what it does,
  and no step guesses.

### Not doing

See the non-goals.

## Decisions

From the story (not reopened): core plus repeller; stores, dev controls,
colour token, presence and overlay stripped; the canvas is its own
reference; a stripped `Flock` is included; "ships" means committed with the
version at 0.4.0.

My calls, open to overruling:

- `alignment` and `speed` become props on `Boids` and `Flock` rather than
  being removed, since the uniforms and easing already exist and removing
  them would change the flock's behaviour.
- The forces stay as props (`attractor`, `repeller` as `FlockForce`), not
  a store, since `forces.ts` and its spec are kept and this is what makes
  them useful.
- `Butterfly` gets `depthTest`, default true.
- `pointerEngaged` is rewritten over `{ over, down, touch }` from DOM
  events on the canvas element, since R3F has no hover state of its own.
- The helpers keep h3nr7's file split.
- The skill copies spec files along and leaves the README in the copy.
- The proof project also proves the alias recipe with drei added.
- Versions in the READMEs are the ranges the skill installs: three
  `^0.187.0`, `@types/three` `^0.187.0` as a dev dependency (three ships no
  types and the build runs tsc), fiber `^9.8.0`, react `^19.2.0`; each
  README also says the code was taken from h3nr7 on 0.185 and proved on
  0.187. The builder check pointed out that `^0.185.1` excludes 0.187.
- The proof starts from a scaffold with no three installed, so the skill's
  install step is what puts it there and is itself proved.
- The proof is committed as a recipe under `docs/proofs/flock-proof/`: the
  scaffold files, a Playwright screenshot script and a README of commands,
  so a reviewer can rerun it. coding-tools still gains no toolchain of its
  own.
- The alias proof renders a drei component (`OrbitControls`), since drei's
  barrel is what pulls the missing name; without one the proof is empty.
- The skill runs the install command rather than only printing it.

## How the owner knows it works

The proof project shows butterflies flying and fleeing the pointer on
WebGPU in Chrome, with only three, fiber, react and react-dom added; the
flock's specs pass there; the build passes with and without drei and the
alias; the skill reads as a complete recipe; the plugin is at 0.4.0 on
branch `feature/references` with one commit per task.

## Left to the builder

- Exact wording of the READMEs and the skill.
- The Playwright flags that enable WebGPU in Chromium on this machine, if a
  screenshot is used instead of a look.
- The proof project's layout.
