---
name: h3nr7-components
description: "Use this to pull one of the plugin's reference components into a project: the WebGPU canvas, the flock of butterflies, or any other folder under the plugin's references/ (\"add the flock\", \"copy the WebGPU canvas in\", \"which components do you have\"). It lists the references by reading their READMEs, asks in a dialog where the copy goes and never guesses, copies the folder in with its specs and README, adds only the dependencies the project is missing with the project's own package manager, prints what to wire, and records what was copied and from which plugin version. It never edits the reference in the plugin."
---

# h3nr7 Components

Copy a reference component from this plugin into the project in front of
you, add what it depends on, and say what is left to wire. A reference is
a self-contained folder of source files with a README, not a package. Once
copied, the project owns it.

The references live beside the skills, at `<skill base>/../../references/`,
one folder per reference. Each folder's `README.md` has a first paragraph
that says what it is, a "Dependencies" section with the version ranges, a
"What to wire" section, and a "Taken from" section. This skill reads those;
it carries no list of its own, so a new reference folder is picked up
without a change here.

## Rules

- Never guess the target path. Step 2 asks, every time.
- Never overwrite a folder that is already there. Step 3 asks.
- Never change a version the project already has. Step 4 adds what is
  missing and says so, and nothing more.
- Never add a dependency without naming it, with its range, before and
  after the install.
- Never edit the reference inside the plugin. Changes belong in the copy.

## The steps

Work through these in order. If you have a task or todo tool, create a
task for each when you start.

## 1. List

Read every `README.md` under `<skill base>/../../references/`. Show the
user a short list: each folder's name and the first paragraph of its
README, one entry per reference.

If the user already named a reference, check that its folder exists and
go straight to step 2 without listing. If the name matches no folder, show
the list and ask which one they meant.

**Gate:** one reference chosen.

## 2. Target

Ask where the copy goes. Use the question dialog (`AskUserQuestion` in
Claude Code; load it first if it is a deferred tool). Offer the project's
conventional place where the tree makes one obvious, as an option with a
line on why: a folder where sibling components already live, for example
`src/three/` or `src/components/`. The dialog's own "Other" takes a typed
path. With no dialog tool, ask in plain text with the same options, your
pick marked, and stop there.

Never guess. No default path is written here; the answer comes from the
user, even when the project has only one plausible place. Take the answer
as a folder relative to the project root.

**Gate:** a target path the user gave.

## 3. Copy

Copy the whole reference folder into `<target>/<reference name>/`: source
files, spec files and the README. Change nothing on the way. The README
stays in the copy so the project keeps the record of what it took, from
where, and when.

If `<target>/<reference name>/` already exists, stop and ask in the
dialog:

- **Replace it.** Remove what is there and copy afresh.
- **Skip the copy.** Leave it as it is and go on to step 4 with it.
- **Copy beside it.** Copy into a folder name the user gives.

Never overwrite without that answer.

**Gate:** the folder is in place, and any folder that was there already
was dealt with the way the user chose.

## 4. Dependencies

Read the "Dependencies" section of the copied README. Each row names a
package, a version range and whether it is a dependency or a dev
dependency.

Detect the package manager from the lockfile in the project root:
`pnpm-lock.yaml` means pnpm, `package-lock.json` means npm, `yarn.lock`
means yarn, `bun.lockb` or `bun.lock` means bun. No lockfile means pnpm.

Read `package.json`. For each package in the README:

- **Not present** in `dependencies` or `devDependencies`: add it to the
  right one of the two, at the README's range exactly, a dev dependency
  as a dev dependency. Keep the file's formatting and key order.
- **Present**, at any range: leave it alone. If its range is below the
  README's, say so, and say that nothing was done about it.

Then run the manager's install command once, and only if something was
added: `pnpm install`, `npm install`, `yarn install` or `bun install`.
One command installs every added package at the range written. Before
you run it, say exactly which packages are being added and at which
ranges; after it, say that it ran and whether it passed. If it fails, show
the error and stop; do not retry with another manager or another range.

If nothing is missing, say so and run nothing.

**Gate:** every dependency the README names is in `package.json`, the
install ran green or was not needed, and the user has seen the list.

## 5. Wire

Print the copied README's "What to wire" section as it is written. That
is the project's next step, and it is the user's, not this skill's: the
skill does not edit the project's source files.

Then check for a dependency that imports `three` itself: list
`node_modules/@react-three/drei` and `node_modules/meshline` in the
project root. If either exists, also print "The alias recipe" section
from `<skill base>/../../references/webgpu-canvas/README.md`, and name
the dependency that calls for it. A project with neither needs no alias;
say nothing about it.

Then the spec files that came with the copy. If the project has no test
runner (no `vitest` or `jest` in `package.json`), say so and give the two
ways out: add `vitest` as a dev dependency (and, where the README says
so, Testing Library), or exclude `**/*.spec.*` in the project's
`tsconfig`. Without one of them the type-check fails on the specs'
imports. Do neither yourself; it is the user's choice.

**Gate:** the wiring text is in front of the user, with the alias recipe
when it applies and the spec-file note when the project has no test
runner.

## 6. Record

Read the plugin version from `<skill base>/../../.claude-plugin/plugin.json`.
End with a short record:

- which reference was copied, from which plugin version, to which path;
- which dependencies were added, with ranges, and which were already
  present, naming any below the README's range;
- what is left to the user: the wiring from step 5, the alias when it
  applied, and running the copy's spec files with the project's test
  runner if it has any.

That record, and the README in the copy, are how the project later knows
what it took.

**Gate:** the record is written.

## Red flags

| Thought | Reality |
|---------|---------|
| "There is only one sensible place, I'll put it there" | Step 2 asks, every time. The answer is theirs. |
| "The folder exists, I'll just overwrite it" | Stop and ask: replace, skip or copy beside. |
| "Their three is older, I'll bump it" | Never change a present version. Say it is below the range and leave it. |
| "I'll run `add` for each package as I go" | One install command, after the list has been shown. |
| "The reference has a small bug, I'll fix it in the plugin" | Fix the copy. The plugin's reference is read-only here. |
| "I'll wire it up for them while I'm at it" | Print what to wire. Wiring is the user's step. |
