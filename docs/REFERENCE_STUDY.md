# WORLD OF HORROR — technical reference study

## Purpose
Trace the actual moment-to-moment gameplay flow of the lawfully purchased Windows 1.01 build before deepening TERMINAL OF HORRORS. Target: a faithful *mechanical rhythm* on mobile browser, expressed as an original haunted wiki. This is a research checklist, not an authorization to ship extracted game code, original assets, dialogue, quests or soundtrack.

## Acquisition status (2026-10-25)
User-provided purchased Windows 1.01 ZIP **is now available and has been statically inspected**. The technical report is `docs/WOH_BINARY_STUDY.md`; the read-only inventory script is `tools/inspect_woh.py`. The executable is a Windows x86-64 GameMaker **native/YYC build**; no readable original game source has been recovered. Proprietary binaries, images, text and private purchase links remain excluded from public deliverables.

## REA reference
Repository: https://github.com/morluto/rea — open-source reverse engineering with agent assistance. Source is a TypeScript CLI / native binary analysis ecosystem; it can support static and behavioral analysis. Reverse engineering is not equivalent to obtaining maintainable source code or a legally redistributable port. Follow its current README/installation instructions in an appropriate OS environment. Make all extracted artifacts private and review rights before publishing.

## Investigate in this order
1. **Inventory & provenance:** record executable name, checksums, size, version, platform, contained asset formats and licenses; quarantine untrusted binaries and never execute them in the production web sandbox.
2. **Runtime flow:** map main-menu entry, investigator selection, hub, mystery investigation, event prompt, branching consequence, encounter screen, item acquisition, end-of-case resolution and run summary. Measure number of clicks/taps and state changes, noting where the user can backtrack.
3. **Mechanics:** identify stats, progression costs, randomization, enemy intent and targeting, escape rules, status effects, items, scaling, checks that produce fail/win, and metaprogression. Document observable behavior, not copyrighted original story prose.
4. **Asset map:** index sprites, UI atlases, localization files, audio containers and palettes for private comparative study; preserve file provenance and never ship them without a license permitting reuse.
5. **Gap analysis:** contrast the resulting flowchart with `docs/GAME_DESIGN.md`. Propose narrow engine/UI changes (e.g., encounter pacing, event order, combat affordances) without embedding any copyrighted character or scenario.
6. **Browser port:** re-implement findings as deterministic TypeScript state transitions; optimize layouts for 390px portrait touch. Keep replay tests stable when updating rules and rerun all ending fixtures.

## Provisional flow mapping (binary and sample schemas inspected; runtime behavior still unverified)
| Reference mechanic category | Terminal of Horrors surface |
| --- | --- |
| Investigator selection | Reader identity card |
| Main town/hub investigation loop | Wiki index / directories / linked chambers |
| Exploration encounter | Archive event and two irrevocable revisions |
| Turn-based hostile screen | Hostile transmission with visible next intent |
| HP and mental-health pressure | Vitality / coherence |
| Global escalating threat | Trace |
| Key item collection | Relic directory |
| End-of-case resolution | Final pact and document outcome |
| Run summary | Local incident report |

These entries are design analogies, not claims that the original game uses exactly these state names, numbers or rules. Replace assumptions with sourced observations once binaries are examined.

## Publication gate
Require written rights for all third-party story/art/music/source files intended for public hosting. If unavailable, keep the released game original and keep technical observations narrowly focused on gameplay concepts and interoperability. Do not put extracted proprietary binaries or purchaser-specific download URLs in the public repository.
