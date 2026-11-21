# Flock proof

A recipe that proves the `webgpu-canvas` and `flock` references and the
`h3nr7-components` skill end to end, on a throwaway project. Run it when a
reference changes, or to see the references work before pulling them into
a real project. coding-tools has no toolchain of its own; everything here
runs in the scratch copy.

What passing looks like: butterflies on screen, moving, bending away from
the mouse, with no errors in the console, and the build, the type-check
and the flock's specs green.

## 1. The scaffold

Copy this folder somewhere outside the plugin and install it. It has React,
Vite, Vitest and Playwright, and no three: the skill's install step is
what adds three, and that is part of what is proved.

```sh
cp -r docs/proofs/flock-proof /tmp/flock-proof
cd /tmp/flock-proof
pnpm install
pnpm exec playwright install chromium
```

## 2. Pull the references in with the skill

Follow `skills/h3nr7-components/SKILL.md` by hand, twice. When it asks for
the target path, answer `src/three`.

1. `webgpu-canvas`: lands at `src/three/webgpu-canvas/`. The install step
   adds exactly `three` and `@react-three/fiber`, and `@types/three` as a
   dev dependency.
2. `flock`: lands at `src/three/flock/`. The install step adds nothing,
   since the canvas already brought the same four.

Then replace `src/App.tsx` with the wiring from the two READMEs:

```tsx
import { WebGPUCanvas } from './three/webgpu-canvas/WebGPUCanvas'
import { Flock } from './three/flock'

export function App() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <WebGPUCanvas camera={{ position: [0, 0, 30], fov: 45 }}>
        <Flock colours={['#17171a', '#595a5f']} />
      </WebGPUCanvas>
    </div>
  )
}
```

## 3. Build, type-check, specs

```sh
pnpm build          # tsc --noEmit && vite build: exit 0
pnpm tsc --noEmit   # exit 0
pnpm vitest run     # forces.spec.ts and repeller.spec.ts: all passing, none skipped
```

## 4. The page

In one terminal:

```sh
pnpm dev            # http://localhost:5199/
```

In another:

```sh
node shoot.mjs      # exit 0
```

`shoot.mjs` opens the page in Chromium with WebGPU on, moves the mouse
over the flock, takes `shot-1.png` and `shot-2.png` a second apart, and
exits 0 only if WebGPU was used, the two shots differ, and nothing was
logged as an error. Open the two shots: butterflies, and between the shots
they have moved and bent away from the cursor.

Flags: on Windows the full Chromium gets a WebGPU adapter with
`--enable-unsafe-webgpu --use-angle=d3d11 --ignore-gpu-blocklist` and
`channel: 'chromium'`; the headless shell never does. On Linux set
`FLAGS="--enable-unsafe-webgpu --enable-features=Vulkan --use-angle=vulkan"`.
If headless gives no adapter, `node shoot.mjs headed` opens a window; if
that fails too, open the URL in desktop Chrome and look.

## 5. The alias, with drei

Proves the alias recipe in the canvas README: a dependency that imports
`three` (drei) shares the renderer's copy of three.

```sh
pnpm add @react-three/drei
```

Add `src/three-webgpu.ts` (the whole shim, stand-ins included) and the
`resolve.alias` entry from the canvas README's "The alias recipe", then
render a drei component beside the flock:

```tsx
import { OrbitControls } from '@react-three/drei'
// inside WebGPUCanvas, next to <Flock ... />:
<OrbitControls />
```

Then again:

```sh
pnpm build          # exit 0
node shoot.mjs      # exit 0, flock still there, drag to orbit by eye
pnpm preview --port 4173 --strictPort   # then, in another terminal:
URL=http://localhost:4173/ node shoot.mjs   # exit 0 on the production build too
```

Without the stand-ins in the shim, `pnpm build` fails here with
`"WebGLRenderer" is not exported` from three-stdlib and gainmap-js while
`pnpm dev` keeps working, which is why the production build is checked.

## Record

Note on the Linear issue the plugin version (`.claude-plugin/plugin.json`),
the three version installed (`node -p "require('./node_modules/three/package.json').version"`),
the commands and their exit codes, and the flags that gave WebGPU.
