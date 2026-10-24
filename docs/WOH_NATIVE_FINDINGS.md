# WORLD OF HORROR 1.01 — native code localization (research only)

**Input:** user-supplied 2023 Windows 1.01 executable, SHA-256 `a7d5d10359e942bb885ac1a23c2bb31a09d11d8958011a6e26b2ff2f20f0718d`.
**Method:** read-only PE header and section parsing; identify `.rdata` script-name literals, search for x64 RIP-relative `LEA` references in `.text`, and associate each reference with a bounded `.pdata` unwind-function range. **This is disassembly reconnaissance, not pseudocode/source-code recovery.** The original program was not executed. Addresses assume the image base `0x140000000`; ASLR can relocate runtime addresses.

## Verified native locations

| Named script marker | Function entry VA | Purpose suggested by name (unverified internals) |
| --- | --- | --- |
| `gml_Script_event_test` | `0x140298d30` | Event check orchestration |
| `gml_Script_event_choice` | `0x140294b90` | Choice resolution |
| `gml_Script_combat_action` | `0x140313ac0` | Combat action logic (large ~208 KB unwind function) |
| `gml_Script_combatsequence_init` | `0x1403936b0` | Initialize combat sequence |
| `gml_Script_combat_sequenceend` | `0x140394570` | End a queued combat sequence |
| `gml_Script_mystery_init` | `0x14078bd10` | Initialize mystery state |
| `gml_Script_mystery_text` | `0x140789860` | Mystery text handling |

The executable contains ~158,945 bounded x64 unwind-function entries (including runtime and generated code), a ~29 MB `.text` section, and no public symbols. The relevant function addresses above were obtained by detecting machine-code `LEA` references to script-name labels; code at these addresses can be disassembled via `objdump` and loaded into a native analyzer. The names identify candidate functions, **not confirmed behavior or precise formulas**. For example, the action initializer contains data stores, several calls, and value writes; interpreting those as specific gameplay limits without decompilation would overstate the evidence.

## Reproduce locally

```sh
python3 tools/locate_woh_native.py /private/path/worldofhorror.exe > native-functions.json
objdump -d -M intel --start-address=0x1403936b0 --stop-address=0x140393900 /private/path/worldofhorror.exe
```

For deeper Ghidra/REA work, next trace the `event_test` call graph, resolve script variable identifiers and compare observed changes under test conditions; next trace combat initialization → queued-action addition → sequence completion. Track confirmed constants only once linked to behavior, and compare findings across at least two examples. Ghidra/Hopper/IDA/REA were **not installed or run in this environment**, and true source recovery is **not yet complete**.

## Gameplay/visual observation, distinct from native proof

External gameplay resources confirm a case/investigation loop with a location-selection view, events, and occasional combat. Combat exposes several move categories and a time-limited action sequence that the player launches, after which the enemy responds. The screenshot evidence also demonstrates a dense monochrome desktop UI. These observations are supported by third-party recorded gameplay/guides, **not** execution of the uploaded EXE:

- <https://woh.fandom.com/wiki/Gameplay>
- <https://woh.fandom.com/wiki/Combat>
- <https://woh.fandom.com/wiki/Investigation>
- <https://www.mobygames.com/game/142749/world-of-horror/screenshots/>

Our React adaptation retains the flow but replaces the original’s crowded combat grid with six accessible touch buttons, a visible four-unit queue, and a launch/clear row. Four units are **our scale**, not the original's 200-unit time meter. The current D6 check formula is **also our own**, not a recovered native formula. All actual scenes, artwork, dialogue, enemy definitions and UI code in Terminal of Horrors are original. Do not bundle the purchased game's executable, images, translations, audio, or story in a public release without the relevant permissions.
