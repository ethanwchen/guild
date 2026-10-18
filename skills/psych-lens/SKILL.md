---
name: psych-lens
description: Plans a mission that runs a psychology lens over a design doc, concept or build: the hook map (used, missing, crossing the line) and a session, day and week forecast, audited for ethics. Use before a design is approved or after a playable build; not for raw research or scoring several concepts.
argument-hint: <doc path or build>
---

# Psych lens

This skill is a mission template.
It hands the template below to the `guild-mission` skill, which writes the mission files and starts Mission Control.

## What it produces

A mission folder `missions/<nn>-psych-lens-<subject>/` with one output in the vault: `vault/psychology/<subject>.md`.

## Milestones and features

### M1 Lens

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F1 Hook map and loop forecast | `psychologist` | `ethics-auditor`, `design-scrutineer` | A1, A2, A3, A4, A5, A6 | `vault/psychology/<subject>.md` |

Inputs: the subject doc or the latest playtest evidence, existing psychology notes, the studio ethics rule, relevant teardown hook notes.

## Contract assertions it always includes

- A1: every motivation-touching mechanic in the subject appears in the hook map.
- A2: each hook card names its motivation with a named framework, a healthy version, an exploitative version and the line between them.
- A3: each hook has a verdict (`Use`, `Use with guardrails` with the guardrails named, or `Avoid`).
- A4: the forecast covers one session, one day and one week, and marks any loop where the only reason to return is fear of loss.
- A5: no hook marked `Use` or `Use with guardrails` breaks the ethics rule (paid random items, spending pressure, punishment for absence, social pressure to spend).
- A6: the missing hooks section names at least two unserved motivations with a healthy mechanic for each.

## Budget and stop conditions

- `maxAttemptsPerFeature`: 2; `maxAgentRuns`: 6.
- The mission ends when every assertion passes, when the budget is spent, or when the feature is escalated.

## Human gate

Ethics blockers: if the lens finds any hook in the subject that crosses the line, the user decides how the design changes before it moves on.

## Run it with the guild-mission skill

Invoke `guild-mission` with this template and the subject path.
It plans `mission.md`, `contract.md` and `features.json`, shows the contract for approval, then calls Mission Control.
