# Putting a plan into Linear

Read this before showing the user what will be created, and follow it
when creating it.

## Contents

- Is Linear available?
- Where things go: team, project, labels
- What gets created, by size
- Show the tree, then write
- The feature issue
- A sub-issue
- A story: the project and its feature issues
- When something already exists
- When a write fails
- What this never does

## Is Linear available?

Linear is available when this session has Linear tools: a connector or
MCP server whose tools read and save issues and projects. Their names
vary by setup (`save_issue`, `create_issue`, `list_teams`), and they may
need loading before use, so search the available tools for "linear"
before deciding there are none. Then make one cheap read, such as listing
teams, to confirm the connection works.

If there are no Linear tools, or the read fails for lack of
authorisation:

- Write the docs and skip everything else in this file.
- Say so once, in a line: the plan is saved, Linear was skipped, and why.
- Write `Linear: not available` on the `Linear:` line of the plan and the
  design, so a later run can pick it up.

Don't ask for an API key, don't try another route into Linear, and don't
put the plan into a different tracker instead.

## Where things go: team, project, labels

**Start with the project's instructions.** `CLAUDE.md` or `AGENTS.md`
often has a section on tracking: the workspace, the team, its label
rules. Those rules win over everything below.

**Team.** Use the team the project's instructions name. Otherwise list
the teams: if there is one, use it; if several, ask.

**Project.** The design doc's `Project:` line records what was settled in
brainstorming. `none` is a decision: no project. If the line is missing,
empty or `not settled`, use the project the user named; failing that, ask
once, naming the existing projects and "no project". A feature can go in
any project or in none. Sub-issues go in the same project as
their feature issue.

**Labels.** List the team's labels and use only labels that exist. Never
create one: if a label seems to be missing, ask. Follow the project's
label rules where it has them. Where it has none, give each issue a type
label if the team has an obvious set (Feature, Improvement, Bug) and
nothing more. A parent issue carries its own type label plus every area
label its sub-issues carry, so filtering by area finds the feature as
well as its tasks.

**Everything else.** Leave status to the team's default, and leave
assignee, priority, estimate, cycle and milestone unset unless the user
asks or the project's instructions say otherwise. The plan decides what
the work is; who does it and when is the user's call.

## What gets created, by size

| Design size | Created | Not created |
|---|---|---|
| A small change | one issue: summary and acceptance criteria | sub-issues |
| A feature | one feature issue, and one sub-issue per task | a project (it goes into an existing one, or none) |
| A large story | one project, and one feature issue per feature | sub-issues: each feature gets them when it is planned |

## Show the tree, then write

Before any write, show the user the whole tree and get a yes. One yes
covers the tree as shown; anything added later is asked about again.

```
Project: h3nr7 website (existing)
Team: H3nr7

Substack feed: show posts on the billboard timeline   [Feature, api, web]
├─ Substack 1: contracts, the source, flag and RSS item schema   [Feature, api]
├─ Substack 2: API, SubstackSource on its own                    [Feature, api]
├─ Substack 3: API, wire into FeedModule and FeedService         [Feature, api]   blocked by 1, 2
└─ Substack 4: web, the "Substack" label and card image resizer  [Feature, web]   blocked by 3
```

Mark anything that already exists and will be updated, not created.

Then write in this order, one call at a time, so the identifiers come out
in plan order and each step has what the next needs:

1. the project (a story only)
2. the feature issue, or the story's feature issues in order
3. the sub-issues, in task order, each with its parent
4. the dependencies between sub-issues
5. the identifiers, back into the docs

## The feature issue

**Title:** `<Short name>: <what it delivers>`, for example "Tech docs:
publish a Claude artifact as an article". The short name is reused in
every sub-issue title, so keep it to a word or two.

**Description:** the design in short, written for a person reading the
issue cold. Short sentences, the same word for the same thing throughout.
Link to the docs; don't paste them.

```markdown
<One paragraph: who does what, and what they get. The why, if one line
carries it.>

## How it works

1. **<Step>.** <What happens, in a sentence.>
2. ...

## Decisions

* <A decision from the design, with its reason in a clause.>
* ...

## Sub-issues

<The order to work in, and any grouping: "1-3 are the API, 4 is the
site". The numbers in the sub-issue titles are the plan's task numbers.>

Not in scope: <the design's non-goals, in a line.>
```

Then the collapsible agent notes section (see below), holding:

- `Design:` and `Plan:` paths, relative to the repo root
- whether those files are committed or local, so a reader knows where to
  find them
- anything else an agent picking this up needs and a person does not

## A sub-issue

**Title:** `<Short name> <N>: <task title>`, where N is the task's number
in the plan: "Substack 2: API, SubstackSource on its own". The number
carries the order when issues are listed.

**Parent:** the feature issue. **Project and team:** the same as the
parent.

**Description:**

```markdown
<The task's goal, in a sentence or two.>

## Acceptance criteria

- [ ] <copied from the plan, word for word>
- [ ] ...
```

Then the agent notes section, holding the rest of the task from the plan:

- `Plan task <N>.` and the files affected
- the interfaces it consumes and produces
- the "what it does" decisions, kept short; point at the design section
  for the long form
- each `Risk:`, with what to do if it bites
- `Depends on:` the tasks it needs, by title

The acceptance criteria stay in the visible part, as checkboxes: they are
what a person reads to know whether the task is done, and they are ticked
off as the work lands.

**Dependencies.** Where the plan says a task depends on another, also set
the relation in Linear (blocked by), once both issues exist. Use it for
real dependencies only. Plain ordering is what the numbers are for.

**Agent notes.** Linear descriptions can hold a collapsible section, and
the connector's own instructions say how to write one. At the time of
writing it opens with `+++ Agent notes` on its own line and closes with
`+++` on its own line. It may read back with different markers. Put it
last in the description.

**A small change** is one issue in the sub-issue format, without a parent
and without a number in its title.

## A story: the project and its feature issues

**The project.** Name it after the story. The summary is one line (Linear
caps it at 255 characters). The description is the story design in short:
why, the features in order, what they share. Attach it to the team.
Don't add milestones or initiatives unless the user asks.

**Its feature issues.** One per feature, in the story design's order, in
the project. Each description says what the feature delivers, what it
depends on, and that its design is still to come:

```markdown
<What this feature delivers, from the story design.>

Depends on: <earlier features, if any>

Design and plan: to come. This issue gets its sub-issues when the feature
is planned.
```

Set blocked-by relations between features where the story design gives
an order that matters.

Once they exist, write each feature issue's identifier beside its entry
in the story design's Features section, and the project's name on its
`Project:` line. That is the only record of which issue belongs to which
feature.

When a feature is later designed and planned, its issue already exists.
The feature's design doc names it on its `Linear:` line (copied from the
story design), so update that issue's description to the full feature
format and add the sub-issues under it.

## When something already exists

Search the team's issues for one that already covers the work, so the
same feature isn't filed twice. Do it before showing the tree, so the
user's yes covers what you found.

- **The design's `Linear:` line names an issue**, or the user did: update
  that issue. Read it and its comments first. Show the user the new
  description before saving, since it replaces text someone wrote. Keep
  anything in the old description that the design doesn't cover.
- **It already has sub-issues:** show them next to the plan's tasks and
  ask how to reconcile them: which to keep, which to rewrite, which the
  plan replaces. Then do exactly what they said for the issues they
  named. Without that, existing sub-issues are left as they are.
- **A search finds a likely match** nobody mentioned: stop and ask
  whether it is the same work.
- **A story names an existing project:** add the feature issues to it and
  leave its description alone unless asked.

## When a write fails

Stop at the first failure. Say what was created, with identifiers, and
what was not. Don't retry blindly: a call that failed on your side may
have succeeded on Linear's, and a retry would file the issue twice. Check
by listing the parent's sub-issues, then create only what is missing.

Write the identifiers that do exist into the plan doc before stopping, so
the next run can see where it got to.

## What this never does

- Change the status of an existing issue, or close, re-parent or archive
  one, unless the user said so for that specific issue. It never deletes.
- Create labels, teams or templates.
- Assign people or set dates unless asked.
- Write anything before the user has seen the tree and said yes.
