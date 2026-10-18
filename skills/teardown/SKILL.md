---
name: teardown
description: Plans a teardown mission that reverse-engineers one reference game along chosen dimensions (loop, economy, progression, monetization, onboarding, social, live ops, art) with sourced numbers, then maps its hooks to motivations. Use before designing in a genre; not for broad genre surveys or trend scans.
argument-hint: <game> [dimensions]
---

# Teardown

This skill is a mission template.
It hands the template below to the `guild-mission` skill, which writes the mission files and starts Mission Control.

## What it produces

A mission folder `missions/<nn>-teardown-<game>/` whose outputs land in the vault:
- `vault/research/teardowns/<game>/<dimension>.md`, one per dimension (M1)
- `vault/psychology/<game>-hooks.md` (M2)
- New lines in `vault/library/known-facts.md`, merged by `vault-keeper`

Default dimensions: loop, economy, progression, monetization, onboarding.
Add social, live ops or art with the argument.

## Milestones and features

### M1 Measure

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F1..Fn one per dimension | `teardown-analyst` | `design-scrutineer`, `ethics-auditor` | A1, A2, A3, A4, A5 | `vault/research/teardowns/<game>/<dimension>.md` |

All dimension features run in parallel, each with `library/known-facts.md` as an input.

### M2 Hooks

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| Fh hook notes for the game | `psychologist` | `design-scrutineer`, `ethics-auditor` | A6, A7, A8 | `vault/psychology/<game>-hooks.md` |

Fh depends on every M1 feature.

## Contract assertions it always includes

- A1: every number carries a confidence tag (`verified`, `single source`, `estimate`) and a source URL or a stated method.
- A2: the dimension is measured with the fixed lens in the `teardown-analyst` role, with a table for each measured quantity.
- A3: fact and interpretation are separated; every "why it works" point cites the facts above it.
- A4: the "New facts" list holds only facts not already in the ledger; fewer than 5 new confirmed facts is stated with a `saturated` recommendation.
- A5: every paid random item found is recorded with its price, odds and how odds are shown, or the teardown states none was found.
- A6: every mechanic that touches motivation has a hook card with a named motivation, healthy version, exploitative version and a verdict.
- A7: the hook notes forecast the session, day and week loop of the game.
- A8: the hook notes list missing hooks a healthy mechanic could fill.

## Budget and stop conditions

- `maxAttemptsPerFeature`: 2; `maxAgentRuns`: 4 per dimension plus 4.
- The mission ends when every assertion passes, when the budget is spent, or when two features are escalated.
- A dimension the ledger marks `saturated`, with no trigger named, is dropped from the plan before work starts.

## Human gate

None.
The mission adds to the novelty ledger, and the Director summarises the new facts for the user at the end.

## Run it with the guild-mission skill

Invoke `guild-mission` with this template, the game and the dimensions.
It plans `mission.md`, `contract.md` and `features.json`, shows the contract for approval, then calls Mission Control.
