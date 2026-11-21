# UI proof

The proving ground for `references/ui`. A Vite + React + TypeScript
scaffold with Tailwind v4, the reference's dependencies and a Vitest +
jsdom + Testing Library setup. The reference's spec files run here, and
the project builds with two of its components rendered and `tokens.css`
imported, which is what proves the folder stands alone without h3nr7's
fonts.

h3nr7-coding-tools has no toolchain of its own. This folder is a recipe,
not a build: no lockfile, no `node_modules`, no copy of the reference.
Copy it somewhere throwaway and run the commands below.

## The recipe

From the root of h3nr7-coding-tools, with pnpm installed:

```bash
# 1. A throwaway copy. Any folder outside the repo.
cp -r docs/proofs/ui-proof /tmp/ui-proof
cd /tmp/ui-proof

# 2. Install. The ranges in package.json are the ones the reference's
#    README names; the tool versions are what the proof was run on.
pnpm install

# 3. The harness's own smoke spec, before the reference goes in.
pnpm test
#    Expect: Test Files 1 passed (1), Tests 1 passed (1).

# 4. The reference, copied in.
cp -r <h3nr7-coding-tools>/references/ui src/ui

# 5. Every spec: the eight copied ones and the smoke spec.
pnpm test
#    Expect: Test Files 9 passed (9), 0 failed.

# 6. Type-check and build, with Controls and Dialog rendered in
#    src/App.tsx and the four stylesheets imported in src/index.css.
pnpm build
#    Expect: exit 0, dist/ written.

# 7. The built stylesheet carries the system stacks and the theme's
#    utilities, and no Adobe face.
grep -o "font-display:[^;]*" dist/assets/*.css
#    Expect: --font-display:Baskerville,...
grep -c "\.bg-ink\b\|\.bg-popover\b" dist/assets/*.css
#    Expect: 2 or more.
grep -ci "mrs-eaves\|inter-18pt\|typekit" dist/assets/*.css
#    Expect: 0.

# 8. By eye, if wanted.
pnpm dev
```

`src/App.tsx` and `src/index.css` are committed in the state step 6
needs, so steps 4 to 7 need no editing. Step 3 runs the same `App.tsx`,
which imports from `./ui`, so it fails until step 4 has run; run step 3
on the bare scaffold by checking out the task 1 commit, or skip it.

## Results

Filled in as the plan's tasks land. Versions are what `pnpm install`
resolved on the day.

### Task 1, the proving ground (2026-11-21)

- `pnpm install`: exit 0. Resolved radix-ui 1.8.1, clsx 2.1.1,
  tailwind-merge 3.7.1, react 19.3.1, tailwindcss 4.3.5, vite 8.3.8,
  vitest 5.1.1, typescript 7.0.2, jsdom 31.0.1.
- `pnpm test` on the bare scaffold: Test Files 1 passed (1), Tests 1
  passed (1).
- `pnpm build` on the bare scaffold: exit 0, after adding `vite/client`
  to the tsconfig `types` (TypeScript 7 refuses a side-effect import of
  a `.css` file it has no declaration for).
