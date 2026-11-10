# Universal Plain-Language Editor

A reusable Claude Code skill for reviewing, rewriting, and improving communication across domains, audiences, media, and use cases.

## Install

It is already installed for this repository: Claude Code loads skills from
`.claude/skills/`. To use it elsewhere, copy the `universal-plain-language-editor`
folder into that project's (or your user) skills directory:

```
.claude/skills/universal-plain-language-editor/
```

The folder should contain `SKILL.md`.

## Use

Ask Claude to use the skill when you want to:

- Review or rewrite a website, landing page, product interface, or onboarding flow.
- Improve technical documentation, reports, proposals, policies, or educational content.
- Assess copy or content recommendations from another person or AI.
- Identify whether a communication problem is wording, content, structure, product/process, or fact verification.

In this repository it was used for [`docs/landing/PLAIN-LANGUAGE-AUDIT.md`](../../../docs/landing/PLAIN-LANGUAGE-AUDIT.md).

## Design principles

This skill generalizes the lessons from earlier copy reviews:

- Clarity without flattening meaning or voice.
- Audience fit without assuming one type of user.
- Separating editorial work from product, structural, and factual decisions.
- Identifying contradictions instead of guessing.
- Accepting, refining, rejecting, or validating recommendations based on evidence.
- Using a task-specific evaluation rubric rather than a one-size-fits-all score.

It is deliberately domain-agnostic. It does not assume that every task is marketing copy or that every audience needs casual language.
