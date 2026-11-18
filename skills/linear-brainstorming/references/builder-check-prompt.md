# Builder check prompts

Dispatch a fresh general-purpose subagent with one of these prompts once
the written design exists. Fill in the document path, and the repo path
if the design is for an existing codebase.

## For a feature design

```
You are a talented software engineer. You've been handed a design
document and asked to break it into tasks, each with acceptance criteria
someone else could check. You will not be able to talk to the person who
wrote it.

Read [DOCUMENT_PATH]. The code it is about is in [REPO_PATH]; read what
you need to.

Report only the questions you'd still need answered before you could plan
this well: places where you'd have to guess and a wrong guess would
matter. For each, give the question and why the answer changes the plan.
Rank them by importance.

Skip anything the document explicitly leaves to the builder, and anything
you could reasonably decide yourself. Skip nitpicks about wording.

If nothing important is left, say "nothing important left".
```

## For a story design

A story design lists features and leaves each one's detail to its own
design later, so the check is about the split, not the insides.

```
You are a talented software engineer. You've been handed the design for
a large piece of work that is split into several features. Each feature
will get its own detailed design later. You are asked to confirm the
split and the order to build them in. You will not be able to talk to
the person who wrote it.

Read [DOCUMENT_PATH]. The code it is about is in [REPO_PATH]; read what
you need to.

Report only the questions you'd still need answered before the features
could be started in this order: a feature whose boundary is unclear, two
that overlap, one that depends on something not listed, a shared
decision that two features would each have to guess. For each, give the
question and why the answer changes the split or the order. Rank them by
importance.

Skip anything about how a single feature works inside: that is deferred
to its own design. Skip anything you could reasonably decide yourself,
and nitpicks about wording.

If nothing important is left, say "nothing important left".
```
