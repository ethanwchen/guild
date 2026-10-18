# guild

**A crew for your coding agent.**
guild gives Claude Code (and Factory Droid) a crew of specialist agents, procedure skills and one mission orchestrator, so a single session can run research, design, build and playtest work the way a small studio would.

It was built for AI-assisted game development, with Roblox as the first platform, but the mission model works for any project.

The design goal is one sentence: **every agent run produces new, checkable value, or the run stops.**

## What is inside

| Folder | What it is |
|---|---|
| `crew/` | 26 role files: one job, one model, a tool boundary, a report format |
| `skills/` | Procedures that turn a goal into a mission: `teardown`, `psych-lens`, `concept-sprint`, `character-design`, `story-bible`, `economy-sim`, `build-module`, `playtest-panel`, and `guild-mission` itself |
| `workflows/mission-control.js` | The one loop that runs every mission: workers, cross-model validators, one scoped fix, escalation |
| `templates/mission/` | `mission.md`, `contract.md`, `features.json`, `backlog.md` |
| `schemas/` | The handoff every worker writes and the verdict every validator writes |
| `docs/framework.md` | The full design: roster, mission model, orchestration patterns, the anti-loop rules |

### The crew

- **Research:** `teardown-analyst`, `trend-scout`, `psychologist`, `economy-modeler`.
- **Design:** `concept-designer`, `systems-designer` (game design), `storyteller`, `creature-designer` (characters), `level-designer` (maps), `art-director`, `ui-designer`, `audio-designer`, `animator`.
- **Build:** `builder`.
- **Validators:** `ethics-auditor`, `feasibility-judge`, `red-team`, `design-scrutineer`, `code-scrutineer`, `player-council`.
- **Playtest:** `playtest-driver`, `playtester-feel`, `playtester-breaker`.
- **Production:** `capture-director`, `licence-checker`, `vault-keeper`.

Model rule: the creative and empathetic roles run on a creative model, the judges and breakers on a reasoning model, research at volume on a fast model, and mechanical upkeep on the smallest one.
A worker and its validator never share a model.

## How a mission runs

1. The main session is the **Director**. It copies the mission template and writes the goal, the contract (numbered, checkable assertions) and the features (one worker, its validators, its inputs and its output each).
2. You approve the contract. Nothing runs before that, and the contract never changes mid-milestone.
3. Mission Control runs every ready feature in a fresh context. Each worker reads its role file, its feature and its inputs, writes its artifact, and writes a handoff that says what new value it added.
4. Validators on a different model check only the assertions the feature owns. A blocking finding must cite an assertion; everything else goes to `backlog.md`.
5. A failing feature gets one fix attempt, scoped to the blocking findings, and a re-check of only those assertions.
   If it still fails, or the failing set did not shrink, it escalates to you. There is no third attempt.
6. `vault-keeper` writes the new state back, and the milestone ends at a human gate.

## The rules that stop loops

| Rule | Mechanism |
|---|---|
| Contract before work | Assertions are approved first; validators cannot move the bar |
| Blocking needs a citation | A finding that names no failed assertion is a suggestion, not a retry |
| Flat tree | Only Mission Control spawns; no crew member has the Agent or Workflow tool |
| Attempt budget | Two attempts per feature and a mission-wide cap on agent runs |
| Progress or stop | A fix must shrink the failing set, or the feature escalates |
| Scoped re-review | The second check looks only at what failed |
| Novelty ledger | Researchers get the known-facts note and return only new facts |
| Distinct seeds | Parallel creative workers get different seeds; near-duplicates merge |
| Files, not chat | Agents pass paths, not long text |
| Cross-model validation | Worker and validator on different models |
| Value declared | A handoff with an empty `newValue` is rejected unvalidated |
| Written stop conditions | Each mission says when it ends |

## Install

```sh
git clone https://github.com/ethanwchen/guild
node guild/scripts/install.mjs path/to/your-project            # Claude Code
node guild/scripts/install.mjs path/to/your-project --factory  # plus Factory droids and skills
node guild/scripts/install.mjs path/to/your-project --check     # exit 1 if the install is stale
```

The installer copies the crew to `.claude/agents/`, the skills to `.claude/skills/`, the workflow to `.claude/workflows/`, and everything Mission Control reads to `.guild/`.
It never overwrites a file guild did not write unless you pass `--force`, so your own agents keep working.
Edit guild, not the installed copies; installed files carry a `guild-managed` marker and `--check` reports drift.

## Use

In a session started in your project:

```
/character-design yeti-yard        plan the character mission from its template
/guild-mission run 01-character-design M1
/guild-mission status 01-character-design
```

Every skill ends in `guild-mission`, which plans the mission files, asks you to approve the contract, then runs Mission Control milestone by milestone.

## Requirements

- Claude Code with subagents and the Workflow tool, or Factory Droid (droids and skills; Mission Control itself needs a workflow runner).
- Node 20 or newer for the installer.

## Credits

The mission model is inspired by Factory's droids, skills and missions.

## License

MIT
