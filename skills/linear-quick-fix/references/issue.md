# Filing a quick fix in Linear

Read this at step 2, to check Linear and look for a duplicate, and at
step 4, before showing the issue.

## Contents

- Is Linear available?
- Team, project and labels
- Search for a duplicate
- Title
- Description
- What this never does

## Is Linear available?

Linear is available when this session has Linear tools: a connector or
MCP server whose tools read and save issues. Their names vary by setup
(`save_issue`, `create_issue`, `list_teams`), and they may need loading
before use, so search the available tools for "linear" before deciding
there are none. Then make one cheap read, such as listing teams, to
confirm the connection works.

If there are no Linear tools, or the read fails for lack of
authorisation, follow the skill's "Without Linear" section. Don't ask for
an API key, don't try another route into Linear, and don't put the issue
into a different tracker instead.

## Team, project and labels

**Start with the project's instructions.** `CLAUDE.md` or `AGENTS.md`
often has a section on tracking: the workspace, the team, its label
rules. Those rules win over everything below.

**Team.** Use the team the instructions name. Otherwise list the teams:
if there is one, use it; if several, ask.

**Project.** Only one the instructions or the user name. Otherwise none.
A quick fix doesn't need a project, and asking about one is a question
the user didn't need.

**Labels.** List the team's labels and use only labels that exist. Never
create one: if a label seems to be missing, ask. Follow the project's
label rules where it has them: usually one type label (`Bug`,
`Improvement`, `Feature`) and an area label for each part touched.
Where it has none, give a type label if the team has an obvious set, and
nothing more.

**Everything else.** Leave status to the team's default, and leave
assignee, priority, estimate, cycle and milestone unset unless the user
asks or the project's instructions say otherwise.

## Search for a duplicate

Before step 4, search the team's issues once, by the words a person
would use for this bug or change. If one covers it, stop and name it:
this skill doesn't update existing issues. If one looks close but you
can't tell, ask whether it is the same work.

## Title

`<Area>: <what changes>`, as a sentence a person could act on:

- "Web: on a phone, the corner row shows the chat icon"
- "Brain: on /assistant, the greeting never names an article"

The area is the part of the project it touches, in the project's own
words. Say what is true after the fix, not the activity ("Fix greeting
bug" says nothing a reader can check).

## Description

Write it for a person reading the issue cold. Short sentences, the same
word for the same thing throughout.

```markdown
## What changes

<One or two lines per change: what is true after the fix that isn't now.>

## Why

<A line. For a bug, what happens today and where it was seen.>

## Done when

- [ ] <A condition someone else can check>
- [ ] <Another>

+++ Agent notes

* Files: <the files the fix touches>
* Fix: <the fix idea, in a line or two>
* Risk: <anything that could bite, and what to do if it does>
* Proof: <how each done-when line will be proved: the test, or the command>

+++
```

**Done-when lines are what the fix is closed against**, so each one must
be checkable by someone who didn't write the code:

- State an observable result, not an activity. "Below 768px, opening
  /assistant ends on `/?chat=1`" can be checked. "Handle mobile" cannot.
- Use exact values: the width, the message, the status code.
- Include the case that would bite: the empty, missing or repeated
  input, or the thing that must not change ("At 768px and up, home
  behaves as now").
- Two to five is usual. More suggests it isn't a quick fix.

They are checkboxes so they can be ticked as each is proved.

**Agent notes.** The collapsible section goes last. The connector's own
instructions say how to write one; at the time of writing it opens with
`+++ Agent notes` on its own line and closes with `+++`. It may read back
with different markers (`>>>`). It holds what an agent needs and a
person doesn't.

## What this never does

- Assign people, or set priority, estimates or dates, unless asked.
- Create labels, teams, projects or templates.
- Edit, re-parent or close an issue it didn't create in this run.
- Delete or cancel anything.
- Write to Linear before the user has seen the issue in step 4.

If the create call fails, don't retry blindly: a call that failed on
your side may have succeeded on Linear's. Search for the title first,
then create only if it isn't there.
