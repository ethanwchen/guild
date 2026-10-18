---
name: build-module
description: Plans a build mission for one game module from the code contract: a builder in its own git worktree with server authority, strict typing and tests, reviewed by a code scrutineer and a red team, ending at a human merge. Use for each module in the build stage; not for design changes or editing the contract.
argument-hint: <game-slug> <module>
---

# Build module

This skill is a mission template.
It hands the template below to the `guild-mission` skill, which writes the mission files and starts Mission Control.

## Precondition

The game has a `CONTRACT.md` that names the module, the files it owns, its public API, its remotes and payload types, and its data keys.
If the module is missing from `CONTRACT.md`, stop and update the contract first in its own change; the builder never edits it.

## What it produces

A mission folder `missions/<nn>-build-<module>/`, a worktree with branch `guild/<featureId>` holding the module's commits, and the check output in the mission's `evidence/`.

## Milestones and features

### M1 Build

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F1 Implement the module | `builder` | `code-scrutineer`, `red-team` | A1, A2, A3, A4, A5, A6, A7 | branch `guild/F1` |

Inputs: `CONTRACT.md`, the module's systems doc and numbers sheet, the style or UI guide for UI modules, the project's check script, the ledger's engine notes.
A large module may be split into features by file group (server, client, UI), each with its own worktree and the assertions that touch it, with `dependsOn` set where one consumes another.

## Contract assertions it always includes

- A1: the diff touches only files `CONTRACT.md` assigns to the module, plus their tests.
- A2: public names, exports, remote names and payload types match `CONTRACT.md` exactly.
- A3: every remote handler validates type, range, rate, ownership and distance on the server before acting; no state that matters is decided on the client.
- A4: every file is strictly typed (`--!strict` for Luau), with no untyped `any` without a reason.
- A5: persistence goes through the data layer with retries and session locking; purchases grant idempotently by receipt id; paid random items, if any, are gated by the platform policy check.
- A6: each feature behaviour has a test, including at least one hostile-input test per remote.
- A7: the project's check script (format, lint, types, tests) is clean on the branch.

Add module-specific behaviour assertions (A8 onwards) from the systems doc when drafting, for example feedback timings for a UI module.

## Budget and stop conditions

- `maxAttemptsPerFeature`: 2; `maxAgentRuns`: 8 per feature.
- The mission ends when every assertion passes, when the budget is spent, or when two features are escalated.

## Human gate

**Merge:** the user reviews the passed branch, the verdicts and the non-blocking notes, and merges it.
Agents never merge.
After merge, run `playtest-panel` on the integrated build.

## Run it with the guild-mission skill

Invoke `guild-mission` with this template, the game slug and the module.
It plans `mission.md`, `contract.md` and `features.json`, creates the worktree, shows the contract for approval, then calls Mission Control.
