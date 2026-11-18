---
name: linear-executing-plans
description: "Use this to build work that linear-writing-plans has planned: when the user says to execute, implement, build or start a plan, a feature issue or one of its sub-issues (\"do ABC-52\", \"start on the Substack feature\", \"carry on with the plan\"), or to resume work that stopped partway. It works the tasks in order, proves each acceptance criterion with a test or a command, commits per task, and keeps Linear current as it goes: each sub-issue and the feature issue move from backlog to to do, to in progress while worked on, to done when complete, with criteria ticked off and a comment recording what was done and any decision made along the way. It ends with a fresh review of the whole branch. Without Linear, the plan doc carries the record instead."
---

# Linear Executing Plans

Build what the plan describes, task by task, in this session. The plan
already did the thinking: execute it as written, prove each acceptance
criterion with evidence you watched, and leave a record that survives
your own forgetting.

That record is Linear. Each task is a sub-issue; its status says where it
stands, its ticked criteria say what was proved, and a comment on it says
which commits did the work and what you decided on the way. Conversation
memory does not survive a long session, and an executor that loses its
place rebuilds tasks whose commits already exist. After a break of any
kind, trust Linear and `git log` over what you remember.

If Linear isn't available, or the plan's issues were never created, the
plan doc is the record instead (see Without Linear).

## How to run

**Keep going.** Don't pause between tasks to ask whether to continue.
They asked for the plan to be built; a progress prompt after every task
spends their time, not yours. Between tool calls, narrate at most one
short line. The issues and the tool results carry the record.

**Rule, don't stall.** A step that contradicts the design, an interface
that doesn't match what an earlier task produced, a criterion that can't
be met as written: decide it. The design is the authority, the plan is
its argument, and your judgment settles what neither answers. Make the
smallest change that satisfies the design, record it at once as a comment
on the task's issue, and carry on:

`Ruling: <what you decided>. Why: <reason>. If wrong: <what it costs>.`

A deviation with no recorded ruling is a decision made in secret. Later
tasks that touch the same thing read the ruling from the issue, not from
your memory.

**Four things stop you, and only these:**

1. an irreversible or destructive operation
2. a security-sensitive action
3. a side effect outside this working tree that you'd normally ask about
   first: a merge, a push, a publish, a deploy, a write to a live system
4. a plan so broken that every way forward is a guess

For those, stop and ask, through the question dialog (`AskUserQuestion`
in Claude Code) where there is one. Everything else is a ruling.

## Setup

**Find the work.** The user names a plan doc, a feature issue or a
sub-issue. From any one, find the others: an issue's agent notes give
the plan's path, and the plan gives each task's issue. Read the plan in
full once, and the design it names: conflicts inside the plan resolve
against the design.

- **A feature issue or a plan:** work every task that isn't done, in
  order.
- **One sub-issue:** work that task only. If something it is blocked by
  isn't done, say so and ask whether to do that first.
- **A story (a project):** one feature at a time. Ask which.
- **No plan:** stop and offer `linear-writing-plans`. Building from a
  design alone means inventing the acceptance criteria as you go.

**See where it stands.** List the feature's sub-issues with their
statuses. A task whose issue is done is done: don't redo it, even if you
don't remember doing it. A task that is in progress was interrupted: read
its comments and `git log` to see how far it got, and resume there. Start
at the first task that isn't done.

**Get on the right branch.** Never build on the default branch without
the user's say-so. If the current branch already belongs to this feature,
use it. Otherwise create one from the default branch, named as the
project's instructions say; failing that, use the branch name Linear
gives the feature issue, which links the branch and its pull request to
the issue. If the working tree has uncommitted changes that aren't yours,
stop and ask.

**Say what you're about to do**, in one message, then start: which tasks,
on which branch, and that you will commit per task, move issue statuses,
tick criteria and comment on the issues as you go. This is information,
not a question.

**Queue the work.** Move the feature issue, and every sub-issue you are
about to work, from backlog to the team's to-do status. That shows the
whole run as picked up before any of it starts. Leave alone any issue
that is already further along.

**Check the joins.** Before the first task, scan the plan's `Interfaces`
blocks: wherever one task consumes what an earlier one produces, do the
names and types match? Rule on any mismatch now and record it on the
consuming task's issue. Tasks that share nothing need no check.

## The Task Loop

Everything you print stays in your context for the rest of the session.
Send long test output to a file and read its tail.

### 1. Take the task

Read the sub-issue: its description, its acceptance criteria, its agent
notes and its comments. Do this for every task, including ones you read
at setup. What you remember is a summary; the issue has the exact values,
and may carry a ruling from an earlier task.

Move the issue from to-do to the team's in-progress status. When you take
the first task, move the feature issue to in progress too. Only the task
you are working is in progress; the ones still waiting stay in to-do.
Note the current commit as the task's base.

### 2. Build it, test first

Each acceptance criterion needs evidence, and a test is the best kind.
For each criterion a test can prove:

1. Write the test.
2. Run it and watch it fail, for the reason you expect. A test that
   passes before the code exists is a finding about the test.
3. Write the least code that makes it pass.
4. Run it and watch it pass. Then tidy, keeping it green.

A criterion a test can't reasonably prove (a build that passes, a page
that renders, a script's output) is proved by running the command it
names and reading the output.

When something fails that should pass, find the cause. Never patch the
symptom to make the output match, and never weaken a test or a criterion
to get past it: if the criterion is wrong, that is a ruling, recorded.

Follow the project's own conventions for tests, structure and style, and
stay inside the task. Something worth fixing that the task doesn't cover
goes in your final message, not in this diff.

Commit when the task's work is done, with the issue's identifier in the
message, in the project's commit style. Several commits for one task is
fine.

### 3. The completion contract

Before you call a task done, all of this is true, with evidence from this
session and not inferred from the diff looking right:

- Every acceptance criterion was checked against real output: a test you
  saw fail and then pass, or a command you ran and read.
- The final run of the task's tests passed, after the last edit. A run
  from before a change proves nothing about the code after it.
- Every deviation from the plan has a `Ruling:` comment on the issue.
- The work is committed.

"Should pass", "looks right" and "the change was trivial" are not
evidence. If any item is missing, the task isn't done: finish it.

### 4. Record it

On the sub-issue:

- Tick each criterion you proved, in the description.
- Add one comment:

  ```
  Done in <base7>..<head7>.
  Checked: <command> → <result>
  Rulings: <one line each, or "none">
  ```

- Move it to the team's done status.

Do these together with the commit, not a few tasks later. A session can
be cut short at any point, and whatever isn't recorded gets done twice.

**A criterion you couldn't prove here** (it needs production, a
credential you don't have, a person's eyes): leave it unticked, leave the
issue in progress, and say in the comment exactly what is unproved and
what it would take. Carry on with tasks that don't depend on it, and list
it in your final message. Don't tick a criterion on the strength of the
code looking right, and don't close the issue around it.

Then take the next task.

## Final Review

When the last task is recorded, the whole branch gets one review from
someone who hasn't seen it built. Skip this for a single sub-issue or a
small change, unless the user asks.

**With a subagent tool:** dispatch a fresh reviewer with
`references/reviewer-prompt.md`, giving it the plan and design paths, the
branch's base and head commits, and your rulings. Use the most capable
model available: this is the one fresh pair of eyes the run gets. Don't
replace it with your own read of the diff: same author, same blind spots.

**Without one:** do that review yourself as a separate pass, and say in
your final message that it was a self-review, which is weaker.

Sort the findings before acting on any. The reviewer's severity labels
are advice. Grade each by what a person using the software gets if it
ships, not by whether the design happens to mention the input that
triggers it.

- **Critical and important:** fix them, in one pass. Each fix starts with
  a test that reproduces the finding and fails, then passes; then the
  whole suite runs green. Commit, and comment on the issue of the task
  the fix belongs to.
- **Minor:** don't fix. List them in your final message as deferred, for
  the user to decide. Every minor you fix is a change nobody asked for.
- **A finding you decide not to fix** is a ruling, recorded on the
  feature issue with its reason.
- **What the reviewer set aside** as outside the plan: rule on each line
  the same way. Nothing is dropped silently.

There is no second review and no second fix pass.

## Finish

Run the project's full test suite, and whatever else the project's
instructions require before work is called done (lint, type check,
build). If anything fails, fix it before going on.

Then close out the feature issue. If every sub-issue is done and these
checks pass, tick any criteria the feature issue itself carries, add a
comment naming the branch and its commit range, and move it to done. If
any sub-issue is still in progress, because a criterion couldn't be
proved or a stop is waiting on the user, the feature issue stays in
progress and your final message says what it is waiting for.

Done here means built and verified on the branch. Merging is still the
user's choice, below.

Your final message is the only place the decisions you took on the
user's behalf reach them all at once. Lead with what was built and what
state it is in, then give these lists, each complete:

- **Rulings I made**, in order, each with what it costs if wrong
- **Not proved**: criteria left unticked, and what each needs
- **Deferred minors** from the review
- **Noticed but not done**: things outside the plan worth an issue

Then ask what to do with the branch, through the question dialog
(`AskUserQuestion` in Claude Code) where there is one, and wait. The
choice is theirs:

1. Merge it into the base branch locally.
2. Push it and open a pull request.
3. Keep the branch as it is.

For a pull request, follow the repo's template and conventions, name the
feature issue in it so Linear links the two, and report the link. Don't
create follow-up issues for the deferred minors or the things you noticed
unless they ask.

## Statuses

Every issue moves the same way: backlog, to do, in progress, done.

| When | Sub-issue | Feature issue |
|---|---|---|
| The run starts | backlog → to do, for each task in the run | backlog → to do |
| A task starts | to do → in progress | to do → in progress, at the first task |
| A task meets its contract | in progress → done | unchanged |
| A criterion can't be proved here | stays in progress, with a comment | stays in progress |
| Every task done, final checks pass | unchanged | in progress → done |

Use the team's own statuses: list them once at setup and pick by type,
since the names differ from team to team. To do is the "unstarted" type,
in progress the "started" type, done the "completed" type. Where a team
has two statuses of one type (In Progress and In Review are both
"started"), take the one whose name matches the table.

Move an issue one step at a time and never backwards: an issue that is
already in progress or done when the run starts is left where it is.

The project's instructions override this table. Touch only the feature
issue and its sub-issues. Don't change assignee, labels, priority or
anything else on them, and don't cancel or delete an issue.

## Without Linear

If there are no Linear tools, or the plan's `Linear:` line says `not
available`, the plan doc is the record. If Linear is available but the
issues were never created, say so first and offer to file them with
`linear-writing-plans`; if the user would sooner just build, carry on
with the plan doc.

Everything above still applies, with these swaps:

- **Where it stands:** a task is done when the plan doc says so.
- **Recording a task:** tick its acceptance criteria in the plan doc and
  add a line under its title:
  `**Status:** done, <base7>..<head7>. Checked: <command> → <result>`
- **Rulings:** a `**Ruling:**` line under the task they belong to.
- Commit the plan doc's changes with the task's work.

## Thoughts that mean stop and check

| Thought | Reality |
|---------|---------|
| "I remember what this task says" | You remember a summary. The issue has the exact values, and maybe a ruling. Read it. |
| "The code is obviously right, no need to watch the test fail" | A test you never saw fail proves nothing. It is one run. |
| "I'll run the suite once at the end" | Per-task runs are how you learn which task broke it. |
| "The plan is wrong here, I'll just do the right thing" | Do the right thing and record the ruling. Unrecorded is secret. |
| "I'll update Linear after a few tasks" | The session can end before then. Record with the commit. |
| "Let me check in before the next task" | Only the four stops stop you. |
| "This criterion can't be tested here, I'll tick it anyway" | Leave it unticked and say what it needs. A false tick is worse than an open one. |
| "I read my own diff carefully, the reviewer is redundant" | Same author, same blind spots. |
| "The reviewer said minor, so it's minor" | Grade what the person gets, then decide. |
| "I'll fix the minors while I'm in there" | Nobody asked. List them. |
| "It's all done, I'll push and open the PR" | That's a stop. Ask. |
