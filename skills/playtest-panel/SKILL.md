---
name: playtest-panel
description: Plans a playtest mission on the open build in Roblox Studio: a scripted driver captures the route, then a breaker drives an adversarial route, and feel and breaker judges return verdicts on beats, errors and exploits. Use after every merged build step and before publishing; it reports, it never fixes.
argument-hint: <game-slug> [route]
---

# Playtest panel

This skill is a mission template.
It hands the template below to the `guild-mission` skill, which writes the mission files and starts Mission Control.

## Precondition

The build to test is open in Roblox Studio with the Studio MCP server connected, and no other agent is driving it.
Studio takes one driver at a time, so driving is sequential and judging fans out afterwards.

## What it produces

A mission folder `missions/<nn>-playtest/` with `evidence/F1-a<n>/` (screenshots and `report.md` from the scripted run), `evidence/F1-a<n>/breaker/` (the adversarial run), and the verdicts.
Fixes become `build-module` missions; this mission never edits the game.

## Milestones and features

### M1 Drive and judge

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F1 Scripted route capture | `playtest-driver` | `playtester-feel`, `playtester-breaker` | A1, A2, A3, A4, A5, A6 | `evidence/F1-a<attempt>/` |

The driver runs first and stops its playtest.
Then the validators run in this order: `playtester-breaker` drives its adversarial route and judges both runs, and `playtester-feel` judges the evidence in parallel (it never drives).
Inputs: the route (default the design's first-60-seconds script plus each station and menu), the performance budget, `CONTRACT.md` for remote names.

Optional at the launch stage: add `player-council` (build stage) as a validator on the same evidence, and a `capture-director` feature afterwards.

## Contract assertions it always includes

- A1: the scripted route completes with zero console errors.
- A2: every marked step is reached and captured as a real-window screenshot.
- A3: the first-60-seconds beats land: goal clear at once, a reward before 15 seconds, a surprise by 30, a choice by 60.
- A4: every player action shows feedback on screen within the systems doc's timing.
- A5: performance stays inside the budget (default in Studio: average fps 58 or more, p95 frame time 20 ms or less, instance count under the style guide's budget).
- A6: no adversarial input (spam, sequence break, out of bounds, hostile remote payload, double claim) produces a softlock, a duplication, a free currency gain or a server error.

## Budget and stop conditions

- `maxAttemptsPerFeature`: 2 (the second attempt is a re-drive after fixes land on the same build target); `maxAgentRuns`: 8.
- The mission ends when every assertion passes, when the budget is spent, or when the feature is escalated.

## Human gate

**Blockers fixed:** the user sees the blocking findings and decides which become `build-module` fix missions; the panel re-runs on the next build.

## Run it with the guild-mission skill

Invoke `guild-mission` with this template, the game slug and the route.
It plans `mission.md`, `contract.md` and `features.json`, shows the contract for approval, then calls Mission Control.
