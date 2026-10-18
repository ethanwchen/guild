---
name: character-design
description: Plans a character-design mission for a game: world and tone, then the cast (hero, antagonist or guardian, a collectible roster on a rarity ladder with part-based model recipes), then a visual bible, validated for evidence, child safety and mobile feasibility. Use once a concept is picked; not for lore-only or code work.
argument-hint: <game-slug> [roster size] [audience age band]
---

# Character design

This skill is a mission template.
It does not run agents itself; it hands the template below to the `guild-mission` skill, which writes the mission files and starts Mission Control.

## What it produces

A mission folder `missions/<nn>-character-design/` whose outputs land in the vault:
- `vault/story/world-and-tone.md` (M1)
- `vault/characters/cast.md` and `vault/characters/<set>.md` with part-based recipes (M2)
- `vault/characters/visual-bible.md` (M3)

Defaults: roster of 12 collectibles over 5 tiers, audience 6 to 12, target Roblox on phones first.
Override with the arguments.

## Milestones and features

### M1 World and tone

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F1 World, tone card, world rules, places, naming guide | `storyteller` | `design-scrutineer`, `ethics-auditor` | A1, A2, A3, A4 | `vault/story/world-and-tone.md` |

Inputs: the picked concept, the design pillars, psychology hook verdicts, the audience band.

### M2 Cast and rosters

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F2 Hero character and antagonist or guardian | `creature-designer` | `design-scrutineer`, `ethics-auditor`, `feasibility-judge` | A5, A6, A7, A10, A11, A12 | `vault/characters/cast.md` |
| F3 Collectible roster on the rarity ladder, with part-based recipes | `creature-designer` | `design-scrutineer`, `ethics-auditor`, `feasibility-judge` | A5, A7, A8, A9, A10, A11, A12 | `vault/characters/<set>.md` |

F2 and F3 depend on F1.
Both run in parallel; F3 must reuse the hero's palette family so the roster reads as one world.
For a larger roster, split F3 into one feature per family (F3a, F3b, ...) with the same assertions, so no single run carries more than 8 designs.

### M3 Visual bible

| Feature | Agent | Validators | Assertions | Output |
|---|---|---|---|---|
| F4 Palette, materials, silhouette rules, rarity escalation, animation personality | `creature-designer` | `design-scrutineer`, `feasibility-judge` | A13, A14, A15, A16 | `vault/characters/visual-bible.md` |

F4 depends on F2 and F3, and codifies what they proved rather than inventing anew: every rule in it must point at at least one passed design.
After each passed feature, `vault-keeper` links the output and merges the new facts.

## Contract assertions it always includes

- A1: the tone card states three adjectives, a "sounds like" line, a "never sounds like" line and a scare ceiling for the audience band.
- A2: the world has 5 to 8 rules, and every collectible or power in the concept has an in-world reason that fits them.
- A3: the naming guide gives syllable and sound rules with at least 10 examples.
- A4: nothing in the world or tone exceeds the audience band's scare and content ceiling.
- A5: every design's silhouette is described as a filled shape at 32 pixels, and no two roster entries share a description.
- A6: the hero and the antagonist or guardian each have role, personality in three words, signature colour, signature feature, and idle, delight and worry expressions; the antagonist has an understandable want and is not frightening for the band.
- A7: every name follows the naming guide, is unique in the roster, and climbs the naming ladder with rarity.
- A8: the roster follows the rarity ladder: 4 to 6 tiers, at most two escalation levers per step, and the stated count and unlock weight per tier.
- A9: rarity is never shown by colour alone; each tier pairs colour with a shape, effect or frame cue.
- A10: each design lists its 3 closest existing characters or creatures and how it differs; none is recognisable as an existing IP.
- A11: each design has a part-based recipe buildable from primitives (shape, size, offset, rotation, colour hex, material, welds to a primary part) with no meshes required.
- A12: each recipe stays inside the part budget (default 12 parts or fewer for commons, 25 or fewer for the top tier), and effects state rate and lifetime.
- A13: the palette lists 6 to 10 named colours with hex values, one reserved top-tier colour, and contrast against the main backgrounds.
- A14: the material ladder maps each tier to its materials and effects, consistent with the passed roster.
- A15: the silhouette rules state the shape language per role and the 32-pixel test, each rule linked to a passed design.
- A16: each tier and each named character has an animation personality line (idle bob, flourish, unique idle) that the builder can implement.

The Director may add game-specific assertions when drafting the contract, never after approval.

## Validators and why

- `design-scrutineer`: every assertion above is present and traceable to the story bible and the ladder.
- `ethics-auditor`: the audience is children, so it checks scare ceiling, gendered or cultural stereotypes, imagery that implies gambling on rarity, and anything that would hurt kids or all-ages eligibility.
- `feasibility-judge`: part counts per design, worst-case parts on screen (a full collection shelf, a full server of pets), particles and lights against the mobile budget.

Optional: add `licence-checker` to F3 for an extra originality search when the roster names lean on puns, and `player-council` (design stage) on F2 for appeal; when the worker ran on Fable the council must run on another model.

## Budget and stop conditions

- `maxAttemptsPerFeature`: 2; `maxAgentRuns`: 30.
- The mission ends when every assertion passes, when the run budget is spent, or when two features are escalated.

## Human gate

At the end of M2: **the owner approves the cast** (hero, antagonist or guardian, and the roster) before M3 starts.
The owner sees the cast and roster files, any concept images, the verdicts' non-blocking notes and every escalation.
Changes the owner asks for become a new mission or an amended contract for M3, never a silent re-run of M2.

## Run it with the guild-mission skill

Invoke `guild-mission` with this template, the game slug and the arguments.
It plans `mission.md`, `contract.md` and `features.json` from the tables above, shows the contract for approval, then calls Mission Control.
Invoking this skill counts as opting in to its multi-agent mission.

## Judging generated art (lesson from the first run)

When creatures are produced by an image or mesh generator, judges score in this order: appeal to the target players, readability at phone size, rarity reads as rarer, and only then fidelity to the written spec.
Fidelity is checked against the name-defining feature only (Kettle Owl must read as a kettle and an owl), never against every proportion in a spec written for another medium.
A judge who rejects a candidate must say why a player would like it less, not only how it differs from the document.
The Director reviews a contact sheet of every candidate before accepting a mass rejection; in the first run the panel rejected 16 of 18 creatures that the owner's lead then accepted on sight.
