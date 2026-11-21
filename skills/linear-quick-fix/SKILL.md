---
name: linear-quick-fix
description: "Use this for a quick fix that deserves a ticket but not a design: a small bug, a one-line change, a tweak with one obvious way to do it (\"quick fix: the date shows in UTC\", \"small fix, ticket it and do it\"). It explores the code, asks one to three clarifying questions in a dialog, files one Linear issue that carries the plan and its done-when list, asks whether to work in a worktree or on a branch here (named from the issue), asks once to go, then builds straight through: each done-when line proved test first, the issue kept current, and a merge, PR or keep choice at the end. No design or plan doc, new issues only. Anything with a second approach or a second task is handed to linear-brainstorming instead."
---

# Linear Quick Fix

Take a small fix from the request to a Done issue and a verified branch
in one run. The issue is the plan: what changes, why, and what must be
true for it to count as done. There is no design doc and no plan doc.

This skill is fast because the work is small, not because it skips the
thinking. You still find out what they want before filing anything, the
issue still says what done means before any code is written, and every
done-when line is still proved with evidence you watched. What it drops
is the ceremony a small fix doesn't need: approaches, a written design,
a task breakdown, a reviewer.

<HARD-GATE>
Nothing is built before the issue exists and the user has said go in
step 6. Building includes writing product code, tests, scaffolding and
installing dependencies. Reading and exploring are fine.

The only Linear write before the build is creating the issue, on the
user's yes in step 4, after they have seen it as it will be filed.

This skill writes no design doc and no plan doc, and it only creates new
issues. To build an issue that already exists, use
`linear-executing-plans`.
</HARD-GATE>

## Is it a quick fix?

A quick fix fits one Linear issue and one reviewable change, and there is
one obvious way to do it.

- **Too small.** Everything that matters is in the request ("make the
  icon cornflower blue"). Do it, say what you did. No issue.
- **Too big.** There is more than one sensible way to do it, or more than
  one task, each of which could be reviewed on its own. Say so in a line
  and offer `linear-brainstorming`. Don't start it without a yes.

Check this at step 1, and again whenever something you learn changes the
picture: a second approach turns up while exploring, an answer widens
the scope, the build finds the fix needs a second change. At that point,
stop and say so, whatever step you are on. A quick fix that quietly
grows into a feature has skipped the design it needed.

## The steps

Work through these in order. If you have a task or todo tool, create a
task for each when you start. Each step ends in a gate, and you don't
pass it on your own.

## 1. Is it a quick fix?

Read the request against the boundary above. If it is too small, do it.
If it is too big, say so and offer `linear-brainstorming`.

**Gate:** it fits one issue, one change, one obvious way.

## 2. Explore

Read before your first message:

- **The code** the request touches, and what it connects to, until you
  can say how it works today and what the fix would change.
- **The project's instructions** (`CLAUDE.md`, `AGENTS.md`): the Linear
  team, label rules, branch naming, the checks required before work is
  called done (tests, lint, type check, build). These override this
  skill's defaults.
- **Linear**: whether it is available, and whether an issue already
  covers this. Read `references/issue.md` for both.

If an existing issue covers it, stop: this skill only files new issues.
Name the issue and offer `linear-executing-plans` for it.

**Gate:** you can explain the current behaviour and the change, and
there is no existing issue for it.

## 3. Play back, then ask

Your first message says, in about 100 words, what you understood and
what you found: the request in your own words, how the relevant code
works today, and anything that changes what they asked for (a
constraint, a cheaper path, a second place with the same bug).

Then ask what the project can't tell you, one question at a time, as
below. For a quick fix that is usually one to three questions: what
exactly changes, what it must not change, how they would know it works.
Don't ask what the code or their message already answers.

If an answer reveals a second approach or a second task, go back to the
boundary.

**Gate:** you could write the done-when list without guessing.

## 4. Confirm the fix

Show the issue as it will be filed, in a dialog: title, labels, project,
what changes, and the done-when list. `references/issue.md` has the
shape. The options are "File it", "Change something" and, where it might
fit, "This is bigger: brainstorm it".

Nothing in the issue that the user hasn't seen in the conversation,
apart from the agent notes, which hold files and the fix idea.

On "File it", create the issue as shown. Note its identifier and the
branch name Linear gives it (`gitBranchName`).

**Gate:** the issue exists.

## 5. Branch

Ask in a dialog where to build it:

- **A worktree** (recommended when the current checkout has other work
  in it). Call `EnterWorktree` with `name` set to the issue's
  `gitBranchName`, so the branch carries Linear's name and its pull
  request links to the issue. Leave the base to the tool's setting.
- **Here.** `git switch -c <gitBranchName>` from the default branch,
  after fetching it. If the working tree has uncommitted changes that
  aren't yours, stop and ask.

Never build on the default branch. If the project's instructions name
branches differently, follow them.

Load `EnterWorktree` first if it is a deferred tool. Without it, offer
only "here".

**Gate:** you are on the issue's branch, with a clean tree.

## 6. Go

Ask once, in a dialog: "Build `<KEY>` on `<branch>`?" Name the done-when
lines it will prove and the checks it will run, so the answer is
informed.

On yes, move the issue to the team's in-progress status and start. From
here, keep going: no progress prompts, no "shall I continue". Only the
four stops in step 7 stop you.

**Gate:** their yes.

## 7. Build

Note the current commit as the base. Then, for each done-when line:

1. Write a test that proves it.
2. Run it and watch it fail, for the reason you expect. A test that
   passes before the fix is a finding about the test.
3. Write the least code that makes it pass.
4. Run it and watch it pass.

A line a test can't reasonably prove (a page renders, a script's output,
a build passes) is proved by running the command it names and reading
the output.

When something fails that should pass, find the cause. Never patch the
symptom, and never weaken a test or a done-when line to get past it.

**Rule, don't stall.** Where the issue is wrong or silent, decide, make
the smallest change that fits what the user asked for, and record it at
once as a comment on the issue:

`Ruling: <what you decided>. Why: <reason>. If wrong: <what it costs>.`

**Four things stop you, and only these:**

1. an irreversible or destructive operation
2. a security-sensitive action
3. a side effect outside this working tree that you'd normally ask about
   first: a merge, a push, a publish, a deploy, a write to a live system
4. a fix so unclear that every way forward is a guess

For those, stop and ask in a dialog. Everything else is a ruling.

Commit with the issue's identifier in the message, in the project's
commit style. Then run the project's full checks: the whole test suite,
and whatever else its instructions require before work is called done.
Fix anything that fails.

Send long test output to a file and read its tail: everything you print
stays in your context.

**Gate:** every done-when line was checked against real output, the
last run of the checks passed after the last edit, every deviation has
a ruling, and the work is committed. "Should pass" and "looks right" are
not evidence.

## 8. Finish

On the issue:

- Tick each done-when line you proved, in the description.
- Add one comment:

  ```
  Done in <base7>..<head7>.
  Checked: <command> → <result>
  Rulings: <one line each, or "none">
  ```

- Move it to the team's done status.

**A line you couldn't prove here** (it needs production, a credential,
a person's eyes) stays unticked. The issue stays in progress, and the
comment says exactly what is unproved and what it would take. Don't
tick it on the strength of the code looking right.

Then your final message: what was built and what state it is in, then
these lists, each complete:

- **Rulings I made**, each with what it costs if wrong
- **Not proved**: lines left unticked, and what each needs
- **Noticed but not done**: things outside the fix worth an issue

Then ask what to do with the branch, in a dialog, and wait:

1. Merge it into the base branch locally.
2. Push it and open a pull request.
3. Keep the branch as it is.

For a pull request, follow the repo's conventions, name the issue in it
so Linear links the two, and report the link.

If the work is in a worktree, leave it in place and say how to leave it
(`ExitWorktree` with "keep" or "remove", or remove it with
`git worktree remove`). The skill never calls `ExitWorktree` itself:
removing a worktree is the user's call.

Don't create follow-up issues for what you noticed unless they ask.

**Gate:** their choice, carried out.

## Statuses

| When | Issue |
|---|---|
| Created, step 4 | the team's default (usually backlog) |
| Go, step 6 | → in progress |
| Every line proved, checks pass, step 8 | → done |
| A line can't be proved here | stays in progress, with a comment |

Pick statuses by type, since names differ between teams: in progress is
the "started" type, done the "completed" type. Where a team has two of
one type (In Progress and In Review are both "started"), take the one
whose name matches. Move one step at a time, never backwards. The
project's instructions override this table.

Touch only the issue this run created. Don't change its assignee,
priority or anything else, and don't cancel or delete it.

## Without Linear

If `references/issue.md`'s check finds no Linear, say so once, in a
line, and ask in a dialog: build it anyway, with the fix and its
done-when list agreed in the conversation and written into the commit
message, or stop. No file is written either way: there is no issue to
fall back to, and a plan doc per quick fix is the ceremony this skill
exists to avoid.

If they say build, skip step 4's filing and every status move; the rest
applies.

## How to ask

Ask through the question dialog (`AskUserQuestion` in Claude Code; load
it first if it isn't loaded). It is quicker to answer than a paragraph,
and it shows plainly that you have stopped and are waiting.

- **One question at a time.** The next usually depends on the answer.
- **Two to four concrete options**, each with a line on what picking it
  means. Put the one you'd pick first and mark it "(Recommended)". The
  dialog adds its own "Other"; don't add one.
- **The question stands on its own.** While the dialog is open the user
  may see nothing else, so put what they need into the question and the
  option descriptions.
- **No dialog tool:** ask in plain text, the options as a short numbered
  list with your pick marked, and stop there.

Never take your own guess, their silence or wording you couldn't parse
as an answer. If the answer changes what gets built, it is a question.

## Red flags

| Thought | Reality |
|---------|---------|
| "It's quick, I'll skip the questions" | One question that saves a wrong fix is the quickest step in the run. |
| "There are two ways, I'll pick one" | Two sensible ways is the boundary. Say so and offer `linear-brainstorming`. |
| "I'll file the issue now and refine it later" | The user sees it before it exists. Step 4 first. |
| "There's already an issue, I'll update it" | New issues only. Offer `linear-executing-plans` for it. |
| "The branch is fine, I'll build on main" | Never the default branch. |
| "Let me check in before the next step" | After go, only the four stops stop you. |
| "The test obviously fails without the fix" | A test you never saw fail proves nothing. Run it. |
| "This done-when line can't be tested, I'll tick it" | Leave it unticked and say what it needs. |
| "I'll update Linear at the end" | Rulings go on the issue when you make them. |
| "It's done, I'll push and open the PR" | That's a stop. Ask. |
| "I'll clean up the worktree" | Removing it is the user's call. Say how. |
