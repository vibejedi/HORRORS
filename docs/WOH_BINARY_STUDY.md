# WORLD OF HORROR 1.01 — local binary reconnaissance

**Study date:** 2026-10-25. **Input:** user-uploaded purchased Windows v1.01 ZIP; inspected locally without executing any code. **Status:** completed structural inventory; **NOT** decompiled gameplay code, a playable port, or a redistribution grant.

This document contains only structural and technical observations. The commercial ZIP, executable, data files, images, music, event text, and translated dialogue must **not** be copied into the public Terminal of Horrors repository or preview without the relevant permissions. Do not publish purchaser-specific download URLs or tokens.

## Provenance and identification

| Object | Observed fact |
| --- | --- |
| Input archive | `wohgame_1_01_windows.zip`, 290,592,808 bytes; SHA-256 `f8ffb3f16711ff11841d8c78bf5f799c4ea94ebf88f237f10c958bd92bd9f2e6` |
| Executable | `worldofhorror.exe`, 42,444,800 bytes; SHA-256 `a7d5d10359e942bb885ac1a23c2bb31a09d11d8958011a6e26b2ff2f20f0718d` |
| Resource package | `data.win`, 274,575,744 bytes; SHA-256 `d32b981cacf7d6e0396965420f7a8e385254b0634fc58dba6a120c46f70022fb` |
| Audio bank | `audiogroup1.dat` (67,206,500 bytes) plus 4 loose OGG files |
| Binary | PE32+ x86-64 Windows GUI executable; linker timestamp indicates 2023-10-25 (metadata, not proof of release date) |
| Engine | GameMaker resource container (`FORM`, `GEN8`, `SPRT`, `OBJT`, etc.) |
| Code-generation evidence | `options.ini` references `LLVM-WINDOWS`; `data.win` has **no** `CODE`, `VARI`, or `FUNC` bytecode chunks. Together these strongly indicate a **YYC-compiled/native GameMaker build** rather than an editable GML source distribution. |

**Implication:** the game logic resides primarily in compiled machine code within `worldofhorror.exe`. There is no one-command extraction of readable original scripts or one-click conversion to React/browser. REA would need a suitable native-analysis provider (such as Ghidra, Hopper, or IDA) to investigate the Windows PE, and its observations would have to be reimplemented for the web.

## Measured resource inventory

These are **resource table counts**, not necessarily unique gameplay systems or game artwork. The script table includes wrapper/synthetic entries.

| Resource | Entries |
| --- | ---: |
| Script-table records (`SCPT`) | 981 |
| Object records (`OBJT`) | 898 |
| Sprite resources (`SPRT`) | 330 |
| Texture-page entries (`TPAG`) | 4,200 |
| Texture groups (`TXTR`) | 11 |
| Sound records (`SOND`) | 108 |
| Embedded audio records (`AUDO`) | 72 |
| Fonts | 8 |
| Rooms | 6 |
| String resources (`STRG`) | 2,420 |
| Shader entries | 5 |

The ZIP has **209 non-directory files**: 132 `.jn` language files, 53 loose PNGs, 15 `.ito` mod/example definitions, 4 OGGs, and one each of EXE, `data.win`, audio bank, INI and TXT. Six language folders appear (English, Simplified Chinese, Traditional Chinese, French, German, Korean), each with 22 `.jn` files. The `engLanguage` files are UTF-8 pipe-delimited bilingual text, **not executable code**; they must not be bundled into our prototype.

## Confirmed data-driven mechanics from shipped `.ito` examples

Samples in `extra content/` expose user-editable **content schemas**; they are not proof of every built-in mystery's internal logic.

| Definition | Structural evidence | Adaptation consequence |
| --- | --- | --- |
| Event | `[event]`, `options`, `optiona/b/c`, `testa/b/c`, `success*`, `failure*`, `winprize*`, `failprize*`, `winnumber*`, `failnumber*` | Choice and outcome are separate: checks can branch to success/failure effects, while consequences are declarative. |
| Event sequencing | Reward kinds include `trigger_event`, `trigger_enemy`, `combat_mystery`, `card_add`/`card_remove`, `stamina`, `reason`, `doom`, `experience` | One story node can cause another event, an encounter, an item change or a resource consequence. |
| Mystery | `[mystery]`, `[intro]`, `[progress]`, `[ending_a]`, `[ending_b]`, optional `[ending_c]`, `[big_ending]` | A mystery can have an intro, a sequence of investigation stages, and alternate terminal states. |
| Progress | Up to ten numbered stages with location, short text, and forced-event references (`*_loc`, `*_txt`, `*_frc`) | Stage advancement and gating should be modeled separately from open-ended page browsing. |
| Enemy | `[enemy]` with `health`, `power`, `damagevalue`, `damagetype`, `can_run`, `exp`, `prize_type`, `prize_name` | Encounters have stats, escape policy, typed damage, XP and rewards. Exact formulas remain unknown. |
| Investigator | `[character]`, six named attributes, `[status]`, `[starting_bonus]`, perks | Identity influences ability checks, items and starting conditions beyond a health/mental-health pair. |

A subset of sample event tests explicitly names `knowledge` and `perception`; other samples use `story`. This demonstrates **attribute-test vocabulary** without proving the precise success probability formula. The mystery samples contain optional forced encounters; the documents do not prove that every investigation has exactly ten stages.

The resource script names support that the runtime has separate implementation areas for combat, event choices, mystery ending/progress, inventory/item creation, saving, and doom escalation. Script **names** reveal those subsystems; they do **not** reveal their implementations or the full player-facing sequence.

## Relationship to TERMINAL OF HORRORS

| Aspect | Original build evidence | Our v0.1 case | Recommended refinement |
| --- | --- | --- | --- |
| Investigation | Mystery intro, numbered progress stages, forced events | 10 discoverable pages across 3 locations | Add an explicit investigation-progress tracker and stage-linked triggers while preserving wiki navigation. |
| Consequences | `test*`, `success*`, `failure*`, typed prizes and penalties | Two always-resolved choices per event | Add deterministic checks against investigator attributes, with separate success/failure results and visibly explained modifiers. |
| Character build | Strength/dexterity/perception/charisma/knowledge/luck, starting bonuses, perk packs | Vitality/coherence/trace and investigator perks | Add a small attribute model and perks without overpowering the current 5–10-minute case. |
| Combat | Enemy health, power, damage type, run permission, experience/rewards | Three telegraphed fights with strike/decode/guard/flee | Introduce XP or small encounter rewards, preserve visible enemy intentions for mobile accessibility; research exact action queue later. |
| Global pressure | Doom-related script identifiers and reward type | Trace | Keep Trace as original fiction's doom analogue; ensure exploration and poor test outcomes influence it. |
| Outcomes | Explicit `ending_a`, `ending_b`, etc. in mystery samples | Delete/release/escape/failure endings | Keep diverse endings but tie more to earlier evidence and witness trust. |
| Platform | Windows x64 GameMaker native executable | TypeScript/React/Vite | Rebuild systems as pure seeded TS transitions; original executable cannot run in browsers without a separate, rights-cleared conversion. |

**Suggested implementation sequence:** (1) add skills and test-result data contracts; (2) keep checks seeded and replayable; (3) use result-specific consequences and triggered events; (4) make a visible progress rail in the wiki; (5) test both investigators, failure, every ending, local resume, and 390px tap navigation. No third-party story or art needs to enter the shipping repo for these enhancements.

## REA tooling handoff (not yet executed)

Official project: <https://github.com/morluto/rea>. Its current README says `npx rea-agents setup` installs agent integration; **native PE decompilation needs a configured Hopper/Ghidra/IDA analysis provider**. REA currently requires Node 22.23.4+, 24.22.1+, or 26.12.1+. This sandbox has Node 22.16.0 and no configured REA native provider, so **we did not claim a REA decompilation**. Linux built-in `file`, `objdump` and the read-only Python metadata parser were used.

On an appropriately configured local research machine, analyze the **private** executable to answer narrowly scoped questions, for example: *What state transitions occur from mystery entry to resolution? How are attribute checks seeded? What combat actions spend turns? What happens on successful escape?* Record observed inputs/outputs, uncertainty, and reproducible traces, rather than copying original GML/code, artwork, text, or music into a published adaptation. Do not upload the purchased archive to third-party services without checking their terms and your rights.

Reproducible, no-extra-dependency metadata command from this repo:

```bash
python3 tools/inspect_woh.py /absolute/path/to/wohgame_1_01_windows.zip
```

This command reads the local ZIP, validates GameMaker resource chunk boundaries, inventories custom-content **key names only**, prints hashes/counts/technical metadata, and never runs or extracts proprietary content. It will consume memory to read the 275 MB `data.win`. Neither the archive nor the generated private full metadata dump is committed or included in the downloadable source bundle.

## Verification and limits

- Successfully opened ZIP and inspected all 209 file records; native executable header and `data.win` resource table parsed; hashes computed.
- The inspector independently reproduced resource and sample field counts; seven existing Terminal of Horrors engine tests also still pass.
- **Not performed:** runtime execution of the commercial game, dynamic observation, Ghidra/REA disassembly/decompilation, exact battle-formula confirmation, browser port, license/rights clearance, copying third-party assets.
