---
name: story-bible
description: Plans a story-bible mission for a picked concept: world, tone and rules, biome lore, cast voice and barks, and the story arcs of the first four weekly updates, validated for evidence, child safety and player appeal. Use after a concept is picked; for character visuals and rosters use character-design.
argument-hint: <game-slug>
---

# Story bible

This skill is a mission template.
It hands the template below to the `guild-mission` skill, which writes the mission files and starts Mission Control.

## What it produces

A mission folder `missions/<nn>-story-bible/` whose outputs land in `vault/story/`:
- `world-and-tone.md` (M1)
- `places.md` and `cast.md` (M2)
- `arcs.md` (M3)

If `world-and-tone.md` already passed in a `character-design` mission, M1 is skipped and the file is an input.

## Milestones and features

### M1 World and tone

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F1 Premise, tone card, world rules, naming guide | `storyteller` | `design-scrutineer`, `ethics-auditor` | A1, A2, A3, A4 | `vault/story/world-and-tone.md` |

### M2 Places and cast

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F2 Places: each biome's mood, landmark, mystery | `storyteller` | `design-scrutineer`, `ethics-auditor` | A4, A5 | `vault/story/places.md` |
| F3 Cast voice: role, want, flaw, catchphrase, barks | `storyteller` | `design-scrutineer`, `ethics-auditor`, `player-council` | A4, A6, A7 | `vault/story/cast.md` |

F2 and F3 depend on F1 and run in parallel.
The storyteller runs on Fable, so Mission Control runs `player-council` (design stage) on another model.

### M3 Arcs

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F4 Four weekly update beats and quests as verbs | `storyteller` | `design-scrutineer`, `ethics-auditor` | A4, A8, A9 | `vault/story/arcs.md` |

F4 depends on F2 and F3.

## Contract assertions it always includes

- A1: the premise is one line a player could discover in the first minute without reading.
- A2: the tone card has three adjectives, a "sounds like" and a "never sounds like" line, a scare ceiling and a humour style.
- A3: 5 to 8 world rules give an in-world reason for every mechanic in the concept.
- A4: no content exceeds the audience band's scare and content ceiling, and nothing borrows names or lore from an existing franchise.
- A5: every biome has a mood, a signature landmark, one mystery and a music feeling.
- A6: every named character has role, want, flaw, catchphrase and three barks under 8 words.
- A7: barks are readable by a slow reader: short words, no idioms that need explaining.
- A8: each of the four weekly beats names the world change, the mystery opened or closed, the content it ships with and a postable line.
- A9: no beat relies on fear of missing out; anything time-limited comes back.

## Budget and stop conditions

- `maxAttemptsPerFeature`: 2; `maxAgentRuns`: 20.
- The mission ends when every assertion passes, when the budget is spent, or when two features are escalated.

## Human gate

At the end of M1: **the user approves the tone** before places, cast and arcs are written.

## Run it with the guild-mission skill

Invoke `guild-mission` with this template and the game slug.
It plans `mission.md`, `contract.md` and `features.json`, shows the contract for approval, then calls Mission Control.
