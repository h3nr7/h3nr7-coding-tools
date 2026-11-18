---
name: linear-writing-plans
description: "Use this after linear-brainstorming approves a design, or whenever there is a design doc or spec and the user wants an implementation plan, a task breakdown, tickets or Linear issues for it. It turns the design into ordered tasks with acceptance criteria, saves the plan in docs/plans/, and after the user approves it creates the work in Linear: an issue for the feature, a sub-issue for each task, or a project for a story of several features. If Linear is not available it writes the plan doc only. It never starts implementing."
---

# Linear Writing Plans

You have an approved design. Turn it into a plan an engineer who has not
seen this codebase or this conversation could work from, then put that
plan into Linear so each task can be picked up, done and checked on its
own.

Assume the reader writes good code in the project's language once they
know what to build. What they cannot know is what was decided: which
files, which names, which values from the design, and what must be true
for a task to count as done. Write those down. Leave the rest to them.

The plan lives in two places, and each has a job. The plan doc in
`docs/plans/` is the full text. Linear is where the work is tracked: a
sub-issue per task, carrying that task's acceptance criteria. Linear is
written once, after the user approves the plan and has seen what will be
created.

## 1. Read the design

Find the design doc: the one just approved in this conversation, or the
one the user names. If they name a Linear issue instead, read the issue,
its comments and its sub-issues now, and find its design from the paths
in the issue's agent notes or from the design doc whose `Linear:` line
names it. If they name nothing, take the most recent
`docs/plans/*-design.md` and say which one you took.

Read it in full, header first. The header decides what happens next:

- **`Size: large story`:** a story gets no task plan. Its plan is the
  ordered list of features it already contains. Skip to step 5.
- **`Status: draft`, or no design at all:** stop and say so. The plan
  argues from the design, so a plan written without one is guesswork.
  Offer `linear-brainstorming`.
- **Lines missing**, as in a design written before this skill: treat any
  status other than draft as approved. Take the size from the content and
  say what you took it to be. A missing `Linear:` or `Project:` line
  means that question is unsettled; settle it at step 5.

**Is there a plan already?** Look for the design's `-plan.md` pair before
writing one. If it exists, read it. If its `Linear:` line says `not
available`, or its tasks carry no issue identifiers, the plan is written
and only Linear is left: go to step 5 with the plan as it stands.
Otherwise ask what they want changed. Never overwrite a plan unread.

**Scope check.** If the header says feature or small change but the
content covers several features that would each ship on their own, it is
a story. Say so and go back to `linear-brainstorming` to turn it into a
story design; don't plan it as one feature.

## 2. Break it into tasks

Before defining tasks, map out which files will be created or changed and
what each one is responsible for. In an existing codebase, follow its
patterns. Files that change together belong in the same task.

A task is the smallest unit that can be built, tested and reviewed on its
own. When drawing the boundaries:

- Fold setup, configuration, scaffolding and docs into the task whose
  deliverable needs them. "Add the dependency" is not a task.
- Split where a reviewer could reasonably reject one task while approving
  its neighbour.
- Order tasks so each depends only on tasks before it. Each one becomes a
  sub-issue that someone opens without the others in front of them.
- A small change is one task. Don't invent more.

## 3. Write the plan

Save it to `docs/plans/YYYY-MM-DD-<topic>-plan.md`: the same date and
topic slug as the design doc, so the pair sorts together. The project's
instructions override the location.

```markdown
# Implementation Plan: <topic>

Design: [<design file name>](./<design file name>)
Linear: <filled in after the issues exist>

## Overview

One paragraph: what this plan delivers and why.

## Global constraints

The design's project-wide requirements, one line each, with exact values
copied from the design: versions, naming rules, limits, things that must
never happen. Every task inherits these. Leave the section out if there
are none.

## Tasks

### 1. <Task title>

**Goal:** What exists when this task is done, in a sentence or two.

**Files affected:**
- `exact/path/to/file.ts` (new)
- `exact/path/to/other.ts`

**Interfaces:**
- Consumes: what it uses from earlier tasks, with exact names and types
- Produces: what later tasks rely on, with exact names and types

**What it does:** The decisions the implementer cannot make alone:
signatures, values the design pins, behaviour at the edges. Bullets, not
code, unless the design fixes exact text or an algorithm.

**Acceptance criteria:**
- [ ] A specific condition someone can check
- [ ] Another

**Depends on:** tasks 2 and 3 (leave out if none)

**Risk:** An unknown, or a dependency on an outside system, and what to
do if it bites. Leave out if none.
```

`Interfaces` earns its place when tasks share names: whoever does task 5
sees only task 5, and this block is how they learn that task 2 called it
`clearLayers()`. Leave it out of a task that shares nothing.

**Acceptance criteria are the point of the plan.** They are what the
sub-issue is closed against, so each one must be checkable by someone who
didn't write the code:

- State an observable result, not an activity. "Pushing the same file
  twice reports 'no changes' and writes nothing" can be checked. "Handle
  duplicates" and "tests are written" cannot.
- Use the design's exact values: the status code, the message, the limit.
- Include the failure cases. A design says what the software must do; it
  rarely lists everything it will meet. For each task ask what input or
  condition is likely to turn up that the design is silent on (empty,
  missing, repeated, too large, offline) and add a criterion for the ones
  that would bite a real user.
- Where a command proves it, name the command and what passing looks
  like.
- Three to eight per task is usual. Fifteen suggests two tasks. One
  suggests the task is a step of another.

A plan is the set of decisions the implementer cannot make alone. If it
is several times longer than the design, or mostly code blocks, it has
written the program instead; cut it back to signatures, values and
criteria.

## 4. Review it yourself

Read the design again with fresh eyes and check the plan against it. Fix
what you find; no need to announce each fix.

1. **Coverage.** For each requirement in the design, can you point to the
   task and the criterion that delivers it? Add a task for any gap.
2. **Criteria.** Could a stranger check each one? Rewrite any that names
   an activity, or that could be ticked without the feature working.
3. **Names.** Do the names, signatures and paths in later tasks match
   what earlier tasks defined?
4. **Standing alone.** Read each task as if it were the only one you had.
   Does it say enough to start?
5. **Lines that decide nothing.** "TBD", "handle edge cases", "add
   validation as needed": decide, or mark it as a **Risk** with what to
   do.

## 5. Get the plan approved

Link the plan for the user and ask whether it captures what they want. In
the same message, show what will be created in Linear, so one answer
covers both. Read `references/linear.md` first: it says how to tell
whether Linear is available, how to find the team, project and labels,
and what the tree looks like for each size.

Before showing the tree, search Linear once for an issue or project that
already covers this work, unless the design's `Linear:` line already
names one. Finding a duplicate after their yes means asking twice. Then
show the tree in full: every title, its parent, the project, the labels,
and which entries already exist.

A story has no plan doc. Show the tree only: the project and one issue
per feature, taken from the story design's Features section.

If Linear is not available, say so in a line and ask only about the plan.

Ask through the question dialog (`AskUserQuestion` in Claude Code; load
it first if it isn't loaded), so it is plain you have stopped and are
waiting. One question, with options such as "Approve and create the
issues", "Change the plan" and "Keep the plan, skip Linear". The dialog
may be all the user sees while it is open, so the question names the plan
file and says how many issues will be created and in which project. No
dialog tool: ask the same question in plain text and stop.

If a task's wording rests on something the design left as a guess, don't
plan around the guess: ask about it first, the same way.

Nothing is written to Linear before their yes. Creating issues is visible
to everyone in the workspace and tedious to undo, and a plan they haven't
read isn't approved.

## 6. Write it to Linear

Follow `references/linear.md`: create or update the feature issue, create
the sub-issues in plan order, then set the dependencies. For a story,
create the project and its feature issues.

If Linear is not available, skip this step. The docs are the whole
output.

## 7. Link the two and stop

- Put the identifiers into the plan doc: the feature issue on the header's
  `Linear:` line, and a `**Linear:** ABC-52` line under each task's
  title. Put the feature issue (or the project) on the design doc's
  `Linear:` line too. If Linear was skipped, write `Linear: not
  available` instead, so a later run knows to create the issues.
- For a story, the design doc is the record: put each feature issue's
  identifier beside its entry in the Features section, put the project on
  the `Linear:` line, and change `Project: new: <name>` to the project's
  name as created. A later run reads these to find each feature's issue
  and to see the project already exists.
- Commit the docs where the project's instructions say plan docs are
  committed, or where earlier ones in `docs/plans/` are tracked. Commit
  only the doc files. If the checked-out branch is the default branch or
  belongs to other work, don't commit: say the docs are uncommitted and
  ask where they should go.
- Tell the user what exists now: the plan's path, and each issue's
  identifier and link.

Then stop. Do not start implementing and do not invoke an implementation
skill: building is a separate request, and from here the sub-issues are
where it is tracked. Say in a line that `linear-executing-plans` builds
it when they ask.

After a **story** is filed, or its Linear step skipped, there is one more
line: offer to start the first feature's design with
`linear-brainstorming`, and start only on a yes. After each feature's
plan, stop as usual. The next feature begins when the user asks, which
may be after the first is built.

**If the plan changes later**, change the doc and the affected issues
together, and say which you changed. An issue that says one thing while
the plan says another is worse than either alone.
