---
name: economy-sim
description: Plans an economy simulation mission: a reproducible Python model of pacing from the systems numbers sheets, time to each gate for free and paying players, currency balance, walls and paid skips, audited for ethics. Use after systems numbers exist or change; not for designing new systems.
argument-hint: <game-slug> [systems]
---

# Economy sim

This skill is a mission template.
It hands the template below to the `guild-mission` skill, which writes the mission files and starts Mission Control.

## What it produces

A mission folder `missions/<nn>-economy-sim/` with one output folder in the vault: `vault/economy/<run>/` holding `sim.py`, `results.json`, `plots/` and `results.md`.

## Milestones and features

### M1 Simulate

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F1 Simulation, results and recommended number changes | `economy-modeler` | `ethics-auditor`, `design-scrutineer` | A1, A2, A3, A4, A5, A6, A7 | `vault/economy/<run>/` |

Inputs: every `vault/systems/*.numbers.json` named in the argument (default all), the systems docs, the monetization sketch, teardown measurements for reference curves, earlier runs.

## Contract assertions it always includes

- A1: `sim.py` re-runs with one command and a fixed seed, and reproduces every number in `results.json`.
- A2: the run simulates at least free casual, free grinder, light spender and whale-cap profiles, 1,000 agents each, over at least 28 days.
- A3: time to each gate is reported per profile (median and 90th percentile), with the free-versus-paid ratio at each gate.
- A4: every free-player gate time is inside its target range from the numbers sheet, or the miss is listed as a wall.
- A5: no product removes a gate the sim flags as a wall (no wall sold next to its paid skip).
- A6: currency sources and sinks are plotted over time, with the inflation point stated.
- A7: recommended changes are a diff (id, old, new, why), with a sensitivity range for the 3 most influential numbers.

## Budget and stop conditions

- `maxAttemptsPerFeature`: 2; `maxAgentRuns`: 6.
- The mission ends when every assertion passes, when the budget is spent, or when the feature is escalated.

## Human gate

**Walls flagged:** the user sees every wall and every paid skip next to a wall, and decides which number changes to accept.
Accepted changes are applied to the numbers sheets by the Director (or a systems-design feature in a later mission), never by the modeler.

## Run it with the guild-mission skill

Invoke `guild-mission` with this template, the game slug and the systems.
It plans `mission.md`, `contract.md` and `features.json`, shows the contract for approval, then calls Mission Control.
