---
name: concept-sprint
description: Plans a concept sprint: 4 to 6 concept designers each develop one deliberately different seed, then a scorecard ranks them against the pillars with feasibility, ethics and player checks, and the user picks one. Use when choosing what to build next; never re-run with the same brief.
argument-hint: <brief>
---

# Concept sprint

This skill is a mission template.
It hands the template below to the `guild-mission` skill, which writes the mission files and starts Mission Control.

## What it produces

A mission folder `missions/<nn>-concept-sprint/` whose outputs land in the vault:
- `vault/concepts/<seed-slug>.md`, one per seed (M1)
- `vault/concepts/scorecard-<nn>.md` (M2)

## Seeds

Before drafting the contract, the Director writes 4 to 6 seeds into `mission.md`, each a deliberately different pairing (for example a genre crossed with an unexpected fantasy or setting), checked against the vault so no seed repeats a past sprint.
Seeds are assigned one per feature and never shared.

## Milestones and features

### M1 Concepts

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F1..F6 one per seed | `concept-designer` | `design-scrutineer`, `ethics-auditor` | A1, A2, A3, A4, A5, A6 | `vault/concepts/<seed-slug>.md` |

All seed features run in parallel with the pillars, hook verdicts, teardowns and trend notes as inputs.

### M2 Scorecard

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| Fs Scorecard, dedupe and hook forecast per concept | `psychologist` | `feasibility-judge`, `ethics-auditor`, `player-council` | A7, A8, A9, A10 | `vault/concepts/scorecard-<nn>.md` |

Fs depends on every M1 feature that passed; escalated concepts are listed as escalated, not scored.
The psychologist runs on Fable, so Mission Control runs `player-council` on another model for Fs.

## Contract assertions it always includes

- A1: the concept develops its assigned seed and states its fantasy in five words or fewer.
- A2: the core loop is stated in one line, and the first 60 seconds are scripted second by second with no purchase prompt.
- A3: session, day and week loops are given, with a natural stopping point in the session.
- A4: the twist is named and compared against the 3 closest existing games.
- A5: no concept relies on a hook marked `Avoid` in the vault's psychology notes.
- A6: monetization is 2 to 4 items, convenience and cosmetics first, each checked against the hook verdicts.
- A7: the scorecard ranks every passed concept against every pillar with a 1 to 5 score and a one-line reason per score.
- A8: concepts sharing a loop and twist are merged, with the survivor named.
- A9: each concept has a build-cost range in module-days and its riskiest unknown.
- A10: each concept has a session, day and week forecast and a list of hook risks.

## Budget and stop conditions

- `maxAttemptsPerFeature`: 2; `maxAgentRuns`: 30.
- The mission ends when every assertion passes, when the budget is spent, or when two features are escalated.

## Human gate

At the end of M2: **the user picks one concept** (or none).
The pick is logged in `vault/library/decisions.md` by `vault-keeper`; the next missions are usually `character-design`, a systems design pass and `economy-sim`.

## Run it with the guild-mission skill

Invoke `guild-mission` with this template and the brief.
It plans `mission.md` (with the seeds), `contract.md` and `features.json`, shows the contract for approval, then calls Mission Control.
