# h3nr7-coding-tools

Claude Code skills for designing and planning software work, with the
work tracked in Linear, and for quick fixes that need a ticket but not a
design. It also carries reference components, source folders any h3nr7
project can copy in, and a skill that does the copying.

## Skills

| Skill | What it does |
|---|---|
| `linear-brainstorming` | Before any coding or design work: explores the project, asks clarifying questions one at a time in a dialog, confirms what is being built, proposes two or three approaches to pick from, walks through the design section by section, then writes the approved design doc in `docs/plans/`. Sizes the work as a small change, a feature or a large story. Reads Linear, never writes it. |
| `linear-writing-plans` | Turns the approved design into a plan of tasks with acceptance criteria in `docs/plans/`, then, after a yes, creates the work in Linear. Never starts implementing. |
| `linear-executing-plans` | Builds the plan task by task, test first, committing per task. Keeps Linear current: issues move backlog → to do → in progress → done, criteria are ticked off, and each task gets a comment with its commits and any decision made. Ends with a fresh review of the branch, and asks before merging or pushing. |
| `linear-quick-fix` | For a fix with one obvious way to do it: explores, asks one to three questions in a dialog, files one Linear issue that carries the plan and its done-when list, asks worktree or branch (named from the issue) and then go, and builds straight through, test first, to a Done issue. Asks before merging or pushing. No docs; new issues only; anything bigger goes to `linear-brainstorming`. |
| `h3nr7-components` | Pulls a reference component from this plugin into the project: lists the references by reading their READMEs, asks in a dialog where the copy goes and never guesses, copies the folder in with its specs and README, adds only the dependencies the project is missing with the project's own package manager, prints what to wire, and records what was copied and from which plugin version. |

## Reference components

Source folders under `references/`, each self-contained with a README
that says what it is, what it depends on and what to wire. They are
copies, not packages: once copied, the project owns the code. The
`h3nr7-components` skill does the copying.

| Reference | What it is | Dependencies |
|---|---|---|
| `webgpu-canvas` | An R3F canvas over three's `WebGPURenderer`, with the one rule (import three from `three/webgpu`) and the Vite alias recipe for dependencies that import `three` | three, @react-three/fiber |
| `flock` | A flock of butterflies on WebGPU compute, with a pointer repeller | three, @react-three/fiber |
| `ui` | h3nr7's own UI components (Dialog, Drawer, Tooltip, Popover, Switch, Slider, Controls, Field, Nav, ScrambleText), lib and design tokens, font independent | radix-ui, clsx, tailwind-merge; Tailwind v4 for Popover, Switch, Slider and Controls |

Each README names the three version the code was written against (0.185,
from h3nr7) and the one it was proved on (0.187).

## How the work maps to Linear

| Size | Docs | Linear |
|---|---|---|
| A quick fix | none | one issue carrying the plan and its done-when list |
| A small change | a short design, a one-task plan | one issue with acceptance criteria |
| A feature | a design and a plan | an issue for the feature, a sub-issue per task |
| A large story | a story design, then a design and plan per feature | a project, an issue per feature, sub-issues as each feature is planned |

A feature can go into any Linear project, or none. Nothing is written to
Linear until the plan is approved and the tree of issues has been shown.
If no Linear connector is available, the skills write the docs and say
that Linear was skipped.

The skills read the team, project and label rules from the project's own
`CLAUDE.md` or `AGENTS.md` where it has them.

## Install

```bash
claude plugin marketplace add https://github.com/h3nr7/h3nr7-coding-tools.git
claude plugin install h3nr7-coding-tools@h3nr7-coding-tools
```

Linear needs its connector or MCP server set up in Claude Code.

## Licence and credits

MIT; see [LICENSE](LICENSE).

The skills are adapted from `brainstorming`, `writing-plans` and
`executing-plans` in
[obra/superpowers](https://github.com/obra/superpowers) (MIT). See
[NOTICE.md](NOTICE.md).
