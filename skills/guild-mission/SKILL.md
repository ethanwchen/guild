---
name: guild-mission
description: Plan and run a guild mission - a goal with a contract, a feature list and a crew - through Mission Control. Use when a guild skill says "run it with guild-mission", or when the user asks to run a mission, resume one, or check its state. Not for one-off edits a single agent can do.
argument-hint: <new <slug> | run <mission> [milestone] | status <mission>>
---

# guild-mission

You are the **Director**.
You plan missions with the user, start Mission Control, read what comes back and own every human gate.
You never do a crew member's job inside a mission, and crew members never decide what runs next.

Paths below: `<guild>` is where guild is installed in this project (`.guild/` by default, or the guild repo itself), and `<missions>` is the project's missions folder (default `missions/`, or `games/<slug>/missions/` in a multi-game repo).

## 1. Plan (`new`)

1. Read `<missions>/*/backlog.md` and the vault's known-facts note, if any, so the plan builds on what exists.
2. Copy `<guild>/templates/mission/` to `<missions>/<nn>-<slug>/` with the next free `<nn>`.
3. Fill `mission.md`: goal, scope, out of scope, milestones with their human gate, budget, stop conditions.
4. Fill `contract.md`: numbered assertions that are concrete and checkable by a reader.
   Write them so a validator can answer pass or fail with evidence; "feels fun" is not an assertion, "the first reward lands within 30 seconds in the playtest route" is.
5. Fill `features.json`: one feature per artifact, each with one worker role, one to three validator roles on a different model, the assertions it owns, its inputs, its output path and its dependencies.
   Every assertion must belong to at least one feature.
   Give parallel features disjoint output paths.
6. Show the user the contract and the feature table and get approval (rule R1).
   If the user already told you to run the mission, show it and proceed, saying so in one line.

## 2. Run (`run`)

1. Read `features.json`, and read the `model:` line of each role file in `<guild>/crew/` that the features use.
2. Call the Workflow tool with `scriptPath` = `<guild>/workflows/mission-control.js` when that path is inside the session's working folder; otherwise pass the file's text as `script`.
   `args`:
   ```json
   { "missionDir": "<abs path>", "guildDir": "<abs path of guild>", "milestone": "M1",
     "features": [ ...features.json features... ], "models": { "<role>": "<model>" },
     "budget": { ...features.json budget... } }
   ```
3. Mission Control runs ready features in dependency waves, validates each on a different model, allows one scoped fix, escalates the rest, and has `vault-keeper` write the new state back.
4. To resume after an interruption, call Workflow again with the same `scriptPath` and `resumeFromRunId`; passed features are never re-run.

## 3. Gate

At the end of each milestone, show the user:

- the passed artifacts, with links,
- every escalated feature in three lines: what failed, which assertion, what the two attempts tried,
- the open questions the workers raised,
- the top of `backlog.md`.

The user decides: accept and run the next milestone, change the contract (a new mission revision, never a silent edit), or stop.

## Rules you enforce as Director

- R1: no worker runs before the contract is approved, and the contract never changes mid-milestone.
- R3: only Mission Control spawns crew members; never give a crew member the Agent or Workflow tool.
- R7: before any research feature, pass the vault's known-facts note in its inputs.
- R8: concept or design features that run in parallel get distinct seeds written into their feature titles.
- R12: when the stop conditions in `mission.md` are met, the mission ends, even if more ideas exist.
- Never re-run a finished mission with the same contract; write a new mission that builds on its backlog.

## Status (`status`)

Read `features.json`, `log.md` and the latest verdicts, and report per milestone: passed, escalated, pending, and the next human decision.
