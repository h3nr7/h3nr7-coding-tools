# h3nr7-coding-tools

Claude Code skills for designing and planning software work, with the
work tracked in Linear.

## Skills

| Skill | What it does |
|---|---|
| `linear-brainstorming` | Before any coding or design work: explores the project, asks clarifying questions one at a time in a dialog, confirms what is being built, proposes two or three approaches to pick from, walks through the design section by section, then writes the approved design doc in `docs/plans/`. Sizes the work as a small change, a feature or a large story. Reads Linear, never writes it. |
| `linear-writing-plans` | Turns the approved design into a plan of tasks with acceptance criteria in `docs/plans/`, then, after a yes, creates the work in Linear. Never starts implementing. |
| `linear-executing-plans` | Builds the plan task by task, test first, committing per task. Keeps Linear current: issues move backlog → to do → in progress → done, criteria are ticked off, and each task gets a comment with its commits and any decision made. Ends with a fresh review of the branch, and asks before merging or pushing. |

## How the work maps to Linear

| Size | Docs | Linear |
|---|---|---|
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
