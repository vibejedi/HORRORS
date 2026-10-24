# Progress — 2026-10-25

## Update 0.2 — Gameplay bridge and executable-code localization
- Implemented **three investigator attributes** (perception/knowledge/nerve) and seeded D6 + attribute tests on six choices; each choice has deterministic success/failure narrative and independent consequences. Player sees odds and committed roll.
- Replaced the React UI's one-action combat control with a **4-time-unit queue**. Actions cost 1–4 units and must be launched; enemy intention resolves once after player actions. Added clear-queue, replayable queue action history, and explicit time budget.
- Fixed the encounter flee softlock: leaving a non-boss fight uncommits the encounter page so it can be re-entered.
- Advanced versioned browser save to v2 for new attributes/check/queue state; old v1 save state intentionally does not resume. Local scores stay at v1.
- Wrote `tools/locate_woh_native.py` (read-only) and `docs/WOH_NATIVE_FINDINGS.md`: seven exact name-to-native-function ranges using PE `.rdata` string references, `.text` RIP-relative `LEA` pointers, and `.pdata` unwind table. **Disassembly reconnaissance only; not recovered GML or completed REA/Ghidra decompilation.**
- Cross-checked gameplay flow with published screenshots and gameplay guide observations. Do not claim exact original combat/skill formulas: current timing scale and D6 thresholds are original implementation choices.
- Built and exercised a separate **offline React 16 diagnostic renderer** (not React 19/Vite) with Playwright via local `page.set_content`: complete seed-42 release-ending run on touch viewport 390 × 844 (2/2/3 combat rounds), plus 1440 × 900 launch render. JS error count 0; horizontal overflow 0 at both widths. Includes screenshots in the downloadable debug bundle.
- Expanded automated integration suite **10/10 passing**, including queue/skill/retry coverage, both endings, defeat, save/resume, and exact replay.
- Vite production dependency install is still blocked by DNS for npm registry in this sandbox. CI workflow requests an artifact upload after a successful cloud `npm run check`.


## Completed in local workspace
- Authored authoritative concept/rules in `GAME_DESIGN.md`, presentation rules in `ART_DIRECTION.md` and developer guide `AGENTS.md`.
- Built typed, engine/UI-separated React + TypeScript + Vite game source with seeded PRNG, ten data-driven events and irreversible choices.
- Added Mara and Ivo; three gated locations; three distinct machine witnesses; two standard enemies; final three-part ritual and boss.
- Added inventory and three resource tracks; readable telegraphed combat, six endings (two boss outcomes, escape and three failures), run summary and score calculation.
- Added validated versioned browser save/resume, replay action log and 20-entry local-only score history.
- Implemented archive sidebar, per-location page index, individual page reader, ASCII scenes, mobile drawer, responsive layout and touch-first buttons.
- Added deterministic integration tests for both wins, failure/restart, escape, save/resume, tamper rejection, prerequisites and replay.
- Added `REFERENCE_STUDY.md` for REA-assisted examination of the purchased game, with acquisition, provenance and publication gates.
- Added a GitHub Actions test/build workflow for when code is uploaded to an accessible repository.

## 2026-10-25 reference investigation
- Received and statically analyzed the user-supplied purchased WORLD OF HORROR Windows 1.01 ZIP (209 archive files; 290.6 MB).
- Confirmed x64 Windows GameMaker native/YYC resource layout and absent GML bytecode chunks; inventoried 981 script entries, 898 object records, 330 sprites, and custom `.ito` definition keys.
- Identified supported content-schema concepts: staged investigations, alternative endings, conditional stat-test outcomes, typed rewards, triggerable combats, and investigator attributes.
- Added `docs/WOH_BINARY_STUDY.md` and reproducible **read-only** `tools/inspect_woh.py` that emits structural metadata without extracting game assets or story.
- No protected artwork, dialogue, binaries, or native decompiled code added to the public-source package.
- The executable has **not** been run or analyzed with REA/Ghidra. Native function boundary localization by a read-only PE script is complete; Node version in this sandbox is below REA's documented minimum and no native provider is configured.

## Verification status
- Game engine integration tests: **10/10 passing via `npm test`** (Node 22.16.0), including both final pacts, death/restart, escape, save/resume, tamper rejection, gates and deterministic replay.
- Production bundle: **blocked/unverified**. `npm install` timed out: network DNS `EAI_AGAIN registry.npmjs.org`; `npm run build` fails because React/Vite packages and type declarations are missing. Source has not yet been production bundled.
- CSS-only layout smoke: **passed** at 390 × 844 and 1440 × 900 in headless Chromium (no horizontal overflow, responsive drawer positioning). This used representative static markup, **not** a running React build. Interactive offline fallback React 16 mobile/desktop playthrough was subsequently **verified**; actual React 19/Vite integration remains **unverified** until npm dependencies can be installed. Local-storage behavior was verified with a mocked browser store in tests.
- Purchased WORLD OF HORROR ZIP: **acquired and statically inventoried** (see binary study); no third-party assets or code bundled. The executable has **not been run**; compiled gameplay logic has **not** been decompiled.

## Known issues / considerations
- Browser save requires storage availability; private mode restrictions silently prevent persistence while current run remains playable.
- Font service is optional and requires network; system fallback works without it.
- The commercial WORLD OF HORROR executable is not a source-code archive; assets remain private. REA native-code research is pending installation of a supported Node version and an analysis provider; public reuse requires rights clearance.
- No server-side anti-cheat: scores are labeled **local-only**, not trustworthy for prizes.

## Next milestones
1. Install Node dependencies in an environment with npm access, run `npm run check`, inspect any TS/build failures and rerun tests.
2. Open dev build at 390px phone size and desktop; validate tap navigation, scrolling, action buttons and viewport clipping.
3. Record playthrough of each final ending; tune resources for fair runs across multiple seeded samples.
4. On a configured local analysis workstation, use REA + Ghidra/IDA/Hopper to verify critical runtime mechanics beyond the completed static inventory; do not publish protected story/art without rights.
5. Prioritize stat-checked event branches and typed rewards as the next engine upgrade based on the verified mod schemas.
6. Optional public beta hosting once build/browser checks pass. Wallet and real rewards remain deferred.
