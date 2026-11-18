---
name: linear-brainstorming
description: "Use this before any coding, system design or software design and development work: a new feature, a component, a change in behaviour, a refactor, an architecture question, a new service or project. It explores the project, asks clarifying questions one at a time in a dialog, confirms what is being built, proposes two or three approaches for the user to pick from, walks through the design section by section, and only then writes an approved design doc in docs/plans/. The work is sized for Linear as one issue, a feature with sub-issues, or a project of several features; linear-writing-plans then writes the plan and creates the issues. Use it even when the request looks simple or never mentions Linear. Without Linear it still writes the docs."
---

# Linear Brainstorming

Turn an idea into an approved design through a conversation with the
user, before anything gets built.

You are very good at building, and you build what you believe the user
wants. That belief is usually thinner than it feels. People often haven't
finished working out what they want, and a decision you make for them
quietly is one they never got to disagree with. So this skill has an
order, and the order is the point: **understand first, then approaches,
then design.** You do not weigh up how to build something until you and
the user agree on what it is, and you do not write a design until they
have picked how.

The design ends in two places. This skill writes a design doc in
`docs/plans/`. The `linear-writing-plans` skill then writes the plan next
to it and puts the work into Linear: a feature is an issue, each task a
sub-issue with acceptance criteria, and a story of several features is a
project. This skill only reads Linear.

<HARD-GATE>
Nothing gets built until the user has approved the design. Building
includes writing product code, scaffolding, installing dependencies,
creating projects, and invoking an implementation skill. Reading and
exploring are fine.

Nothing gets written to Linear by this skill. Issues, sub-issues and
projects are created by `linear-writing-plans`, after the plan is
approved.

After the design doc is approved, the next step is the plan: invoke
`linear-writing-plans` and no other skill.
</HARD-GATE>

## Is this too small?

If everything that matters is in the request ("make the icon cornflower
blue", "rename `getUser` to `fetchUser` everywhere"), it is a quick,
clear task. Do it and say what you did. It needs no design and no issue.

Anything else goes through the steps, however simple it looks. Simple
work is where unexamined assumptions waste the most effort. The steps
scale down: for a small change each one is a few lines, but none is
skipped.

If the user says to skip the questions and just build it, the skill is
done: say in one line how you'll build it, and do it.

## The steps

Work through these in order. If you have a task or todo tool, create a
task for each when you start, so the user can see where the conversation
is.

1. **Explore the context**: the code, the docs, Linear.
2. **Play back** what you understood and what you found.
3. **Ask clarifying questions**, one at a time, in a dialog.
4. **Confirm what is being built**, and get a yes.
5. **Propose two or three approaches**, and have the user pick one.
6. **Size the work** and settle where it goes in Linear.
7. **Present the design**, section by section, with a yes after each.
8. **Write the design doc** and get it approved.
9. **Hand over** to `linear-writing-plans`.

Each step has a gate, and you don't pass it on your own. Step 4 needs
their yes before any talk of approaches. Step 5 needs their pick before
any design. Step 7 needs a yes per section before the doc is written.

If something they say changes the picture (a new requirement, a change of
mind), go back to the step it belongs to. A change to what is being built
goes back to step 4: restate the whole thing and confirm it again, so you
both hold the same version.

## How to ask

Ask through the question dialog: the tool that shows the user a question
with options to pick from (`AskUserQuestion` in Claude Code; load it
first if it isn't loaded). A dialog is quicker to answer than a
paragraph, and it makes it plain that you have stopped and are waiting.

- **One question at a time.** The next question usually depends on the
  answer, so one dialog, one question, then wait.
- **Two to four concrete options**, each with a line on what picking it
  means: what gets built, what it costs. Take the options from what you
  found in this project, not from a generic list. Put the one you'd pick
  first and mark it "(Recommended)". The dialog adds its own "Other" for
  a free-text answer, so don't add one.
- **The question stands on its own.** While the dialog is open the user
  may not see what you wrote before it. Put what they need into the
  question and the option descriptions. Where options are easier to
  compare by looking, give each a short preview: a sketch of the screen,
  the shape of the data.
- **A question you can't put options to** ("what is this page for?") is
  asked in plain text, alone, as the last thing in the message.
- **No dialog tool:** ask in plain text. One question, the options as a
  short numbered list with your pick marked, and stop there.

Then stop and wait for the answer. Three things are never an answer:

- **Your own guess.** Don't write "I'll assume X unless you say
  otherwise" and move on. If the answer changes what gets built, it is a
  question, and it stays open until they answer it.
- **Silence.** "You didn't object, so I'll take that as your pick" is you
  deciding. Ask.
- **Unclear wording.** If you can't tell what they meant by a phrase, ask
  about that phrase before the next step, offering the readings you can
  think of as the options. Don't carry a guess about it through the
  design.

Ask only what the project can't tell you. Never ask what the code, the
docs or their earlier messages already answer, and don't reopen what they
have decided. Where files go, how you write things up and what you read
next are your calls: do them and say so.

## 1. Explore the context

Before your first message, read. In an existing project, read what the
request refers to and the code it connects to, and keep reading until you
can explain how the relevant parts work today and what this change would
touch.

Look in three more places:

- **The project's instructions** (`CLAUDE.md`, `AGENTS.md`): how this
  project tracks work, which Linear team it uses, its label rules, where
  its docs go. Those rules override this skill's defaults.
- **`docs/plans/`**: earlier designs this one builds on or must not
  contradict.
- **Linear, if a Linear connector is available**: when they name an issue
  (`ABC-12`), read it and its comments first. Otherwise search for an
  issue or project that already covers this work. If Linear isn't
  available, carry on; it only matters at the end.

## 2. Play back

Your first message says what you understood and what you found, briefly:

- their request in your own words: what they want and who it is for
- how the relevant parts work today, and what this would touch
- anything they may not have considered that changes what they are
  asking for: a constraint, a conflict, an existing issue, a cheaper path

Keep it to what bears on the request, about 150 words. Don't propose how
to build it yet, and don't make decisions for them here. Anything you are
unsure of becomes a question in step 3, not a "my proposal" in this
message. End the message with the first question.

## 3. Ask clarifying questions

Now find out what they want and why. Cover this ground, roughly in this
order, skipping what you already know:

- **Purpose:** what it is for, who uses it, why now
- **Scope:** what is in, what is out, what it must not do
- **Behaviour:** what happens in the cases they haven't mentioned
- **Constraints:** what it has to fit with or stay inside
- **Success:** how they would know it works (this becomes the acceptance
  criteria later)

Make every question specific to their project. Build each one on their
last answer or on something you found, so it helps them think through a
consequence they may have missed ("The feed caches for an hour, and a
post can be unpublished. Should an unpublished post stay on the home page
until the cache turns over?"). Say what the answer would change when that
isn't obvious.

Keep going until you could write down what is being built without
guessing. For a feature that is usually three to six questions. Short
answers are fine; don't pad the list.

These questions are about what they want, not how to build it. Hold the
how for step 5.

**Spot a story early.** If the request is plainly several features
("rebuild billing: invoices, retries, a portal, metering"), say so as
soon as you see it and keep the questions at story level: why, the list
of features, their order, what they share. The detail of each feature
belongs in its own design later.

## 4. Confirm what is being built

Play the whole thing back in one message: what it does, who it is for,
what is in and out, the constraints, and how they'd know it works. A
short list is best. Leave out how it will be built.

Only what they said goes in as settled. If there is something you still
had to fill in, it isn't settled: ask it first.

Then ask, in a dialog, whether this is what they want built. A yes opens
step 5. Anything else, fix it and confirm again.

## 5. Propose approaches

Only now, how to build it. Put this in a message of its own.

Come up with several real alternatives and drop the weak ones: any that
work against why they want it, and any the existing code rules out.
Present the two or three that remain, each the same way:

- **What it is**, in a sentence
- **How it would work here:** the parts of this codebase it touches and
  what changes in each, concretely enough to picture
- **What it gives them**
- **What it costs or risks**

Then say which one you recommend and why, tied to what they told you they
want. With three approaches, a small comparison table helps.

If there is genuinely one sensible way, still say what else you
considered and why it doesn't fit, so they can see the choice was made
and not skipped.

Then ask them to pick, in a dialog, with the approaches as the options
and your recommendation first. Each option's description carries its main
trade-off, so the dialog can be answered on its own. No pick, no design.

If they want to talk an approach through, do: answer, adjust the
approaches, and ask again.

## 6. Size the work

Say how big the work is in plain words. The size decides the design doc
and what the work becomes in Linear. They can override it.

| Size | What it is | Design doc | In Linear |
|------|-----------|------------|-----------|
| A small change | one task, one reviewable change | a short one: what you covered together, written down | one issue with its acceptance criteria |
| A feature | several tasks that ship one thing | the full written design | one issue for the feature, a sub-issue for each task |
| A large story | several features, each worth its own design | a story design (below), then a design for each feature | a project, with one issue for each feature |

If it grows later, stop, say so, and step up a size.

**Where it goes in Linear.** Settle this now so the design doc can record
it. If Linear isn't available, skip it and write `Linear: not available`
and `Project: not settled` in the doc, so the question is asked when
Linear is there.

- **An existing issue.** If they named one, or you found one that covers
  this work, the design is for that issue. Say so; the plan step will
  update it instead of creating another.
- **The project.** A feature or a small change can go into any project,
  or none. Use the one they named. Failing that, use the one the
  project's instructions name. Failing that, ask in a dialog: the
  existing projects as options, with the one this repo's recent issues
  sit in first, and "No project".
- **A large story** becomes a new project by default. Offer that and the
  existing projects as the options.

**A large story.** Don't design every feature at once. Write a story
design that covers the whole: why, the features in the order to build
them with a line or two each, what each depends on, and the constraints
and decisions they all share. Get that approved and hand it to
`linear-writing-plans`, which creates the project and one issue per
feature, and records each issue beside its feature in the story design.

The features then come back through this skill one at a time, in order,
each when the user asks for it. Each gets its own design and plan, and
its tasks become sub-issues of its feature issue. A feature's design
takes its header from the story design: `Linear:` is that feature's
issue, `Project:` is the story's project, and `Builds on:` names the
story design. Read the story design first and don't reopen what it
settled.

## 7. Present the design

Walk the user through the design in the conversation, before any doc
exists. A doc is slow to read and slow to change; a section in the chat
can be corrected in one line.

Present it in sections, one per message. Use the ones the work needs:

- **How it fits together:** the shape of the solution and where it sits
  in what exists
- **The parts:** each piece that is new or changes, and what it is
  responsible for
- **Data and flow:** what moves where, in what order
- **What the user sees:** sketched in text, when there is something to
  see
- **Errors and edge cases:** what happens when things go wrong, and in
  the cases from step 3
- **Testing:** how each behaviour will be proved to work
- **Not doing:** what is deliberately left out

Scale each section to its complexity: a few sentences if it is
straightforward, up to 200-300 words if it is subtle. A small change is
one short section.

Inside a section, separate two kinds of decision. Anything that changes
what the user or their visitors will see, or that would be costly to
undo, is theirs: ask it as a question before or with the section. Smaller
calls that a sensible engineer would make either way are yours: list them
at the end of the section under "My calls", so they can be read and
overruled.

End each section by asking, in a dialog, whether it looks right. A yes
moves to the next section. Otherwise revise that section and ask again.

Whenever seeing would help more than reading, sketch it in text: a few
lines of what they'd see, the shape of a request and its response, a
small diagram of what calls what.

## 8. Write the design doc

Write down the design they have just agreed to, section by section.
Nothing appears in the doc that they haven't seen in the conversation,
apart from what the builder check adds, which you list for them.

Write a plain document a talented engineer could plan from without going
back to the user. Cover:

- intent and the why
- goals, non-goals, anti-goals (what would make this a failure even if it
  technically works)
- constraints
- approaches: the ones you presented, what each trades off, which one
  they picked, and why
- the design, as agreed in step 7
- the decisions they made, as they made them, and the calls you made,
  marked as yours
- how they'd know it works
- what's left to the builder

Start the doc with this header, so the plan step and later readers know
where it stands:

```markdown
# <Topic>: design

Date: YYYY-MM-DD
Status: draft
Size: small change | feature | large story
Linear: <existing issue or project, "to be created", or "not available">
Project: <Linear project name, "none", "new: <name>" for a story, or "not settled">
Builds on: <earlier design docs or issues, if any>
```

`Project: none` is a decision to use no project. Write `not settled` when
the question wasn't answered. A story design adds a **Features** section:
the ordered list the project's issues are made from. For a small change,
the doc covers the same points in a line or two each.

**Where it goes:** `docs/plans/YYYY-MM-DD-<topic>-design.md`, with
today's date. The project's instructions and the user's preferences
override this.

**Builder check** (for a feature or a story): dispatch a fresh subagent
with `references/builder-check-prompt.md`, which has one prompt for a
feature and one for a story. Tell the user a reviewer is reading the doc
and you may come back once with a few questions. Sort what the builder
asks into three piles:

- **Answered already** by the conversation or the project: put the answer
  in the document.
- **Minor:** a sensible builder could settle it without changing what
  gets built. Settle it yourself and mark it in the document as your
  call.
- **Theirs:** only the user can answer it, and the answer changes what
  gets built. Ask these one at a time, in dialogs, most important first.

That is the only round of questions the check produces. Without a
subagent tool, read the document as that builder yourself.

**Approval.** Link the doc, list anything in it they haven't already
seen (the builder check's answers and your calls), and ask in a dialog
whether they approve it. Once they do, set `Status: approved`.

Commit the doc where the project's instructions say plan docs are
committed, or where earlier ones in `docs/plans/` are tracked. Commit
only the doc. If the checked-out branch is the default branch or belongs
to other work, don't commit: say the doc is uncommitted and ask where it
should go.

## 9. Hand over

Invoke `linear-writing-plans`. Do not invoke any other skill, and do not
start building.

## Spikes

A quick throwaway build is sometimes the cheapest way to learn what they
want or whether something works. Offer one when it would help, and build
it only on a yes. A spike gets no tests or minimal ones, skips the plan
and the issues, and stays labelled throwaway. Bring what it taught you
back into the conversation at the step it bears on. Keeping what a spike
produced is a new request that comes back through the gate.

## Red flags

| Thought | Reality |
|---------|---------|
| "I know enough to pick an approach" | Have they confirmed what is being built? Step 4 comes first. |
| "I'll ask this in the message, it's quicker" | Use the dialog. It is quicker for them, and it shows you're waiting. |
| "I'll ask these three things together" | One at a time. The second usually depends on the first. |
| "I'll assume that's what they meant and note it" | An assumption that changes the build is a question. Ask it now. |
| "They didn't object, so that's their pick" | Silence isn't a pick. Ask. |
| "There's only one sensible way, I'll go straight to the design" | Say what else you considered, and still ask. |
| "I'll write the doc and they can react to it" | Walk it through in sections first. The doc records what was agreed. |
| "This is my call, I'll mention it later" | If they would see the difference, it is theirs. If not, list it under "My calls" now. |
| "They changed their mind, I'll patch the design" | Go back to step 4 and confirm the whole picture again. |
| "I'll create the issue now so we have somewhere to put this" | Not yet. Issues come after the plan, once they've seen the tree. |
| "This story is big, so I'll design all of it in one doc" | A story design lists the features. Each gets its own design in turn. |
