---
name: linear-brainstorming
description: "Use this before any coding, system design or software design and development work: a new feature, a component, a change in behaviour, a refactor, an architecture question, a new service or project. It finds out what the user wants and why, lays out the approaches, and gets a design doc approved in docs/plans/ before anything is built. The work is sized for Linear as one issue, a feature with sub-issues, or a project of several features; linear-writing-plans then writes the plan and creates the issues. Use it even when the request looks simple or never mentions Linear. Without Linear it still writes the docs."
---

# Linear Brainstorming

You are very good at building. You build what you believe the user wants,
and that belief is usually thinner than it feels. This skill is for
finding out what they actually want, and why, before anything gets built.

People often haven't finished working out what they want. Good questions
help them think it through. When you understand the why, you make the
hundred decisions they never mention the way they would have made them.

The design ends in two places. This skill writes a design doc in
`docs/plans/`. The `linear-writing-plans` skill then writes the plan next
to it and puts the work into Linear: a feature is an issue, each task a
sub-issue with acceptance criteria, and a story of several features is a
project. This skill only reads Linear. Nothing is created there until the
plan is approved, so a design that gets dropped leaves nothing to clean
up.

## First: What Do You Actually Know?

Before you reply, ask yourself: what do I know about what they want, and
why?

- **Everything that matters is in the request** ("make the icon cornflower
  blue", "fix the typo in the footer"). This is a quick, clear task. Do
  it, and say what you did. It needs no design and no issue.
- **Something non-trivial is missing.** Start the conversation.

Before you start implementing, you must, in order:

1. Lay out the approaches in a message of their own, and have the user
   pick one (see Lay out the approaches).
2. Size the work and settle where it goes in Linear (see Size the Work).
3. Write the design doc, short or full (see The Written Design).
4. Get their approval of that doc.
5. Invoke the `linear-writing-plans` skill.

If nothing is open when you write your first message and there's one
sensible way, steps 1 to 4 happen in that message (see Your First
Message).

Two things aren't implementing: a spike they said yes to (see Spike to
feel things out), and doing what they asked once they've opted out of the
questions.

## Look Before You Ask

In an existing project, or when they've given you context (a spec, a
plan, an issue, files they pointed at, earlier conversation), dig in
before your first message. Read what they referred to and the code it
connects to, and keep reading until you can explain how the relevant
parts work today and what this change would touch. Never ask what the
project or their context already answers, or reopen what they've already
decided.

Look in three more places:

- **The project's instructions** (`CLAUDE.md`, `AGENTS.md`): how this
  project tracks work, which Linear team it uses, its label rules, where
  its docs go. Those rules override this skill's defaults.
- **`docs/plans/`**: earlier designs this one builds on or must not
  contradict.
- **Linear, if a Linear connector is available**: when they name an issue
  (`ABC-12`), read it and its comments first. Otherwise search for an
  issue or project that already covers this work, so the design builds on
  it instead of duplicating it. If Linear isn't available, carry on; it
  only matters at the end.

## Your First Message

Move the work forward, with one of these:

- **They've already said what they want** (a spec, a plan, an issue, a
  detailed request): aim for about 200 words for the whole message. Echo
  their request back in your own words, so they can see whether you've
  got its shape: what they want, who it's for, and why, as far as they've
  said. Add what you found that bears on it: how the relevant parts work
  today and what the change would touch. If you found something they may
  not have considered that would change what they're asking for or how it
  has to be built, like a constraint, a conflict, an existing issue, or a
  cheaper path, say so plainly. How to build it comes later, once you
  understand what they want (see Lay out the approaches). End with one
  line inviting corrections. Then, if they haven't told you why they want
  it, even if you can guess, ask about that: one open question in their
  own terms, with nothing to pick from. If they have told you, and their
  request and the project leave open something whose answer would change
  what gets built, ask about the one that would change it most; when its
  choices can be named, sketch each concretely, with what it trades off
  and which you'd pick. If nothing like that is open, there's one
  sensible way: end with the short design itself (the approach, a line on
  why the others don't fit, the design in a few lines, and its size) and
  ask them to approve it. Their approval covers the approach and the
  design: write the short design doc as approved and go on to the plan.
  Specs are often incomplete, so confirm before you build on one.
- **They haven't:** one open question, in their own terms, about the
  biggest thing their request leaves unsettled. Say why you're asking:
  what the answer would change about what you build. For "add search to
  the docs site": "If it's for readers who know the term they want, a
  title filter in the sidebar does it; searching the body text is an
  index and a results page. What does someone type when they're stuck?"

How the message ends depends on whether their message asked for
brainstorming:

- **They asked for it** (by name, by invoking it, or by asking for a
  design discussion): end there. They want this conversation.
- **They didn't:** they may not want a conversation at all. End with a
  light, one-line offer to just get going instead, like "Or if you'd
  rather I just dive in, say so." If they take you up on it, this skill
  is done: state any significant how-it-gets-made choice (platform,
  language, library) in one plain line, then do what they asked through
  the normal workflow.

That's the whole message.

## The Conversation

Ask a question only when the answer would change what gets built and
neither the request nor the project answers it. Otherwise, state your
call and your reason as a proposal they can correct, and move the work
forward. Process steps are always your calls: writing things up, where
files go, looking further, how to show something. Do them and say so. Ask
one at a time. Use plain language and match their vocabulary; never use
process jargon. You never need to quote this skill to the user.

Be clear and concise. Lead with what matters. When you report what you
found, give them the most important findings and offer the rest.

**Get them describing.** Until you know why they want it, ask open
questions, with no example answers attached. Their own words carry intent
that your options can't. Once you know why, when a decision has choices
you can name, sketch each concretely, with what it trades off and which
you'd pick. When they say "just guess" or "what do you think?", propose
something concrete.

**How it gets made.** Every design rests on choices about platform,
language, libraries, storage and services. Read from how they talk which
of those choices they want to make. Someone who raises the how or asks
about trade-offs wants the options with your pick. Someone who talks
about outcomes is handing you the how: make those calls and state each in
a line. When there's existing work, build on what it already uses. Any
choice you make goes in the design as your call, never as something they
agreed to.

**Ground to cover.** This is territory, not a script. Never read these
out as questions:

- what kind of thing this is, and what makes it special
- why now, and what success looks like to them
- goals, non-goals, and anti-goals (what would make this a failure even
  if it technically works)
- prior art: what they've seen elsewhere, loved or hated
- current state: what exists now, what they've tried
- the details they care about
- how they'd know it works: this becomes the acceptance criteria later

**Make every question specific** to their project and what they've told
you. Ask the way a sharp colleague would: build each question on their
last answer or on something you found, so it helps them think through a
consequence or a case they may have missed ("The feed caches for an hour,
and a post can be unpublished. Does an unpublished post stay on the home
page until the cache turns over?"). When the reason isn't already plain,
say what you're hoping to learn or what the answer would change. A
proposal they can correct, plus your reason for it, often beats a
question.

**Do recon.** Once you have a bit of grounding and looking further would
help, go look: deeper into the codebase, their own files and data, the
docs of a library, or the web. Say what you looked for and what you
found.

**Lay out the approaches.** Once you understand what they want, and
before you write anything up, put the ways of building it in a message of
its own. Come up with several real alternatives and drop the weak ones,
including any that work against why they want it and any the existing
code rules out. Sketch the two or three that remain concretely enough to
picture, grounded in what the project actually does, with what each
trades off. Recommend one and say why, then ask which way they want to
go; if they've handed you the how, say you'll go with your pick instead.
When there's genuinely one sensible way, say so in that message and
explain why the others don't fit; the design comes in the next one. This
is for how it gets built; for what they want, get them describing first.

**Spot a story early.** If the request is plainly several features
("rebuild billing: invoices, retries, a portal, metering"), say so as
soon as you see it and keep the conversation at story level: why, the
list of features, their order, what they share. The detail of each
feature belongs in its own design later, so questions about it now are
asked twice.

**Show, don't tell.** Whenever seeing would help more than reading,
sketch it in text: a few lines of what they'd see, the shape of a
request and its response, a small diagram of what calls what.

**Spike to feel things out.** A quick throwaway build is often the
cheapest way to learn what they want or whether something works. Offer
one when it would help. When they just want to spike, get out of the way.
Spikes get no tests or minimal ones, aren't bulletproof, and skip the
plan and the issues. Bring what the spike taught you back into the
conversation.

## Play It Back

Play back as you go. As soon as you understand one part well enough to
describe it (what it's for and who it serves, say, or how one piece
behaves), describe that part back in about 200-300 words, then return to
questions about the next part. Playback and questions alternate through
the whole conversation; the last chunk covers whatever is left.

Only what they said goes in as theirs. Anything you filled in goes in as
your proposal, with your reason. End each chunk by asking what's wrong or
missing.

## Size the Work

Once you understand what they want and they've picked an approach, say
how big the work is in plain words. The size decides the design doc and
what the work becomes in Linear. They can override it.

| Size | What it is | Design doc | In Linear |
|------|-----------|------------|-----------|
| A small change | one task, one reviewable change | a short one: what you already covered together, written down | one issue with its acceptance criteria |
| A feature | several tasks that ship one thing | the full written design | one issue for the feature, a sub-issue for each task |
| A large story | several features, each worth its own design | a story design (below), then a design for each feature | a project, with one issue for each feature |

If it grows mid-task, stop, say so, and step up a size.

**Where it goes in Linear.** Settle this now so the design doc can record
it. If Linear isn't available, skip it and write `Linear: not available`
and `Project: not settled` in the doc, so the question is asked when
Linear is there.

- **An existing issue.** If they named one, or you found one that covers
  this work, the design is for that issue. Say so; the plan step will
  update it instead of creating another.
- **The project.** A feature or a small change can go into any project,
  or none. Use the one they named. Failing that, use the one the
  project's instructions name. Failing that, if this repo's recent issues
  all sit in one project, propose that one as your call. Otherwise ask
  once, naming the existing projects and "no project".
- **A large story** becomes a new project by default. Say so as a
  proposal: they may prefer its features to sit in a project that already
  exists.

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

## The Written Design

Write a plain document a talented engineer could plan from without going
back to the user. Cover:

- intent and the why
- goals, non-goals, anti-goals
- constraints
- approaches: the two or three ways you considered building it, what each
  trades off, which one they picked, and why (they pick in the
  conversation, before you write the doc)
- the parts of the how they decided, as they decided them, and the calls
  you made, marked as yours
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
the question wasn't answered.

Set `Status: approved` once they approve it. For a small change, the
short design covers the same points in a line or two each and goes
straight to the user, without the builder check. A story design adds a
**Features** section: the ordered list the project's issues are made
from.

**Where it goes:** `docs/plans/YYYY-MM-DD-<topic>-design.md`, with
today's date. The project's instructions and the user's preferences
override this. Once it is approved, commit it where the project's
instructions say plan docs are committed, or where earlier ones in
`docs/plans/` are tracked. Commit only the doc. If the checked-out branch
is the default branch or belongs to other work, don't commit: say the doc
is uncommitted and ask where it should go.

**Builder check** (for a feature or a story): dispatch a fresh subagent
with `references/builder-check-prompt.md`, which has one prompt for a
feature and one for a story. When you tell the user you're
writing it up, say a reviewer will read it first and you may come back
once with a few questions. Don't hand over the document until the check
is back. Sort what the builder asks into three piles:

- **Answered already** by the conversation or the project: put the answer
  in the document.
- **Minor:** a sensible builder could settle it without changing what
  gets built. Settle it yourself and mark it in the document as your
  call.
- **Theirs:** only the user can answer it, and the answer changes what
  gets built.

Bring the "theirs" pile in one message, most important first. Update the
document with their answers, then hand it over with a short list of the
calls you made so they can check those while reading. That's the only
round of questions the check produces. Without a subagent tool, read the
document as that builder yourself.

<HARD-GATE>
Nothing gets built until the user approves the design doc: the short one
for a small change, the full one for a feature, the story design for a
large story. Building includes writing product code, scaffolding,
installing dependencies, creating projects, and invoking an
implementation skill. Reading and exploring are fine.

Nothing gets written to Linear by this skill, approved or not. Issues,
sub-issues and projects are created by `linear-writing-plans`, after the
plan is approved.

Two exceptions to the first rule. If they opted out of the questions, the
skill is done and the gate goes with it. A spike they said yes to may be
built; it stays labeled throwaway, and keeping what it produced is a new
request that comes back through this gate.

After the design doc is approved, the next step is the plan: invoke
`linear-writing-plans` and no other skill.
</HARD-GATE>

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll offer a menu of what they might want" | Options steer. Ask them to describe it first. |
| "I'll fill in sensible defaults" | Good. Say them out loud. A default they never heard is one they couldn't reject. |
| "I've answered their questions, so I'll write the doc" | Lay out the approaches first, in a message of their own (or, when nothing was open from the start, in your first message's short design). |
| "I should explain the process first" | Ask your question. The process shows itself. |
| "They said 'sounds good' to the idea" | Approval covers what you showed them. A design doc you haven't written isn't approved. |
| "I'll create the issue now so we have somewhere to put this" | Not yet. Issues come after the plan, in one go, once they've seen the tree. |
| "This story is big, so I'll design all of it in one doc" | A story design lists the features. Each feature gets its own design when its turn comes. |
| "The spike works, I'll keep building on it" | Keeping it is a new request. Back through the gate. |
