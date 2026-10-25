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

## Verification status — production build verified 2026-10-25
- **GitHub main committed:** `fd69cbcc229a516d2a909c1428d06b19d3524ef1`, <https://github.com/vibejedi/HORRORS>.
- **Real React 19/Vite CI build: PASS.** GitHub Actions push run <https://github.com/vibejedi/HORRORS/actions/runs/40101235031> executed `npm install --no-audit --no-fund`, `npm run check` and uploaded `terminal-of-horrors-dist` artifact. CI produced complete `dist/index.html` + hashed JS/CSS assets. The local sandbox itself still cannot reach the npm registry; CI is the source of production build verification.
- **Actual production JS/CSS browser simulation: PASS.** Loaded the built Vite JS bundle and its stylesheet into headless Chromium via Playwright's injected-script approach (external Google Font import removed from the test harness only, not the published dist). At 390 × 844, touchscreen actions traversed all three locations, passed three combat encounters in **2 / 2 / 3 rounds**, signed release pact, and reached `TOMORROW WALKS FREE`. Zero uncaught JavaScript errors and zero horizontal overflow. At 1440 × 900, desktop startup rendered without errors or horizontal overflow. Screenshots saved externally to the verification package.
- **Engine integration tests: 10/10 PASS**, including both final pacts, death/restart, escape, versioned save/resume, tamper rejection, progression gates, action queue and exact seed/action replay. Browser `localStorage` persistence was tested in engine unit tests with a controlled mocked store; an additional Playwright network-origin reload test was blocked by sandbox navigation policy, so actual cross-reload persistence remains to be manually verified on deployed/localhost origin.
- **Read-only purchased-game investigation:** inventory, documented content schema and PE native candidate locations are complete. WOH executable itself has **not** been executed; Ghidra/REA full semantic decompilation remains outstanding. No third-party artwork/story/code bundled.

## Known issues / considerations
- Browser save requires storage availability; private mode restrictions silently prevent persistence while current run remains playable.
- Font service is optional and requires network; system fallback works without it.
- The commercial WORLD OF HORROR executable is not a source-code archive; assets remain private. REA native-code research is pending installation of a supported Node version and an analysis provider; public reuse requires rights clearance.
- No server-side anti-cheat: scores are labeled **local-only**, not trustworthy for prizes.

## Next milestones
1. Deploy verified static Vite `dist/` to a preview domain and test touch scrolling, reload/autosave and PWA/mobile browser performance with real devices (especially iOS Safari).
2. Explore the other endings and balance across a wider, reproducible seed cohort.
3. Set up REA with a supported Node version and Hopper/Ghidra/IDA on a separate permitted analysis workstation; walk the `event_test` and `combat_action` call graphs with clear evidence labels.
4. Expand data-driven stat checks, items, mystery variants and scene transitions in the **original** Terminal of Horrors content; keep the purchased game's story/art/assets private absent rights clearance.
5. Defer crypto wallet integration, public score submissions and rewards until a future backend phase.

## Update 0.3 — Illustrated playable case (2026-10-25)
- Integrated **10 original generated WebP illustrations** in `public/art/` (approximately 1.2 MB combined): frontispiece, two investigator portraits, three location scenes, two ordinary enemies, final boss, and combat composition reference.
- Added strongly typed `src/game/art.ts` image manifest and per-event bindings for all ten data-driven events. Original ASCII drawings remain available via expandable plain-text records.
- Aligned in-game names with the new art direction: **Mara Quill**, **Ilya Wren**, **Index Chamber**, **Transmission Well**, **Relic Vault**, **Paper Witness**, **Ledger Leech**, and **The Unauthored Revision**. Save/action identifiers were intentionally preserved for backwards compatibility with v2 run saves.
- Refactored combat presentation into a two-column encounter portrait + tactics UI on desktop, stacked portrait, visible intention, action queue and thumb-friendly launch controls on phones. Added a compact mobile vitality/coherence/trace bar.
- Styled the archive in high-contrast black and bone-white, removed the earlier olive emphasis, and designed a title page with the original cover artwork and new investigator portraits. All assets are generated original illustrations; **no WOH sprites, scenes, dialogue, or proprietary executable components are included**.
- Added illustration-contract test. **11/11 engine/content tests PASS**, plus TypeScript syntax transpilation via locally available compiler and offline diagnostic HTML generation.
- **Verification note:** Browser automation navigation to both local HTTP and `file://` was rejected by the sandbox administrator in this new session. The new illustrated UI has NOT completed a current interactive mobile playthrough in this environment. Production React/Vite verification is pending the next GitHub Actions run; prior passing React/Vite build was for v0.2.
- **Repository privacy warning:** GitHub returned visibility `public` for `vibejedi/HORRORS` during this update. A user-facing change may have targeted a different repository or not applied. Do not commit purchased third-party files, and confirm desired visibility in GitHub Settings before further sensitive research.

### Next release gates
1. Green GitHub Actions `npm run check` on the v0.3 commit; then inspect `dist` and test the real bundle on iOS Safari/Android Chrome.
2. Verify artwork cropping, touch navigation, combat buttons, save/reload, and accessibility on a hosted preview; update the playthrough record.
3. Treat generated paintings as **illustration assets**, not frame-by-frame animations or original WOH sprite sheets. Add lightweight sprite strips/animated overlays in a subsequent phase.
4. Keep WOH binary research private, and obtain appropriate rights before incorporating any protected original assets into a distributed game.

### v0.3 integration verification (after navigation fix)
- New **Open Next Page** / **Enter Next Area** buttons appear after committed events; read pages now show the chosen branch's actual seeded outcome, so no route requires manually guessing which article to open.
- Local offline React compatibility harness injected into headless Chromium using `page.set_content` and inline original image data to bypass local navigation restrictions. **Full release-ending walkthrough PASS at 390 × 844, with touch enabled; ordinary fights 2 and 2 rounds, final 3 rounds, ending TOMORROW WALKS FREE, seed 42, 10/10 entries, 3/3 witnesses, 3/3 enemies.** Zero broken images, uncaught JS errors, or horizontal overflow at 390px mobile and 1440px desktop startup.
- **React 19/Vite production compile PASS** for the initial v0.3 art integration commit `6ec66e537b0462933a677a31c2edd49543408aec` via GitHub Actions run https://github.com/vibejedi/HORRORS/actions/runs/40150396664. The subsequent navigation/choice-result/UI polish patch requires its own CI verification. Test harness is diagnostic React 16, not a substitute for testing the final bundle on phones.
- Current sprite/artwork status: 9 distinct illustrated files used by the UI + 1 mobile battle concept reference; these are still illustrations, not sprite-sheet animations.

### Final release-candidate verification — illustrated v0.3
- Commit `e0d6654b1c615c244cd5a25045588e2a3972781b` passed the complete GitHub Actions pipeline at https://github.com/vibejedi/HORRORS/actions/runs/40150845120 (`npm install`, `npm run check`, uploaded Vite `dist` ZIP).
- Downloaded the actual compiled React 19/Vite bundle and injected its shipped JS and CSS into headless Chromium (via `page.set_content` to work around local navigation policy). All ten shipped WebP art assets were resolved in memory for the test; bundled Google Fonts import was excluded from injection only.
- **Actual production JS mobile touch playthrough PASS** at 390 × 844, seed 42: all ten branching events, three witnesses, three fights in 2/2/3 rounds, the release pact, ending **TOMORROW WALKS FREE**. Desktop startup at 1440 × 900 also PASS. Both layouts: zero broken images, zero uncaught JavaScript errors, zero horizontal overflow.
- Live hosted-preview URL, real-device iOS/Android touch testing, long-running save/reload across a hosted origin, asset animation and broader balance remain next milestones.


## 2026-10-25 — Animation & jumpscare sprint (v0.4)

- Implemented CSS/React presentation-only motion: page transitions, ambient motes/scanlines, location scene parallax, animated portraits/enemies, intent glow, tactical button presses, floating combat feedback, skill-check outcome stamps, and a fatal transmission overlay.
- Losses caused by 0 vitality, 0 coherence or trace 10 show distinct cinematic jumpscare captions and enemy portraits, then return to the existing incident report. The seeded rules and version 2 saves are unchanged.
- Added FX ON/OFF toggle persisted in separate localStorage key, OS reduced-motion support, no automatic sound or flashing; the loss cue can be skipped immediately. Landing page offers a visual-only preview to inspect the animation without changing the run.
- Added 3 tests for presentation cue mappings, actual fatal state transitions, and identical deterministic replays. `node --experimental-strip-types --test tests/*.test.ts`: 14 passing locally.
- **Build status:** Pending GitHub Actions production `npm run check` for this commit; local sandbox has no cached npm dependencies. Production browser/touch confirmation is still required after CI.


## 2026-10-26 — Higgsfield video death scare (v0.5)
- Generated a 5-second **original Paper Witness breach** using Higgsfield Seedance 2.5 (job `848597c5-d503-42dd-937b-08934b1469b3`); browser player streams the completed MP4 from its generated media CDN. No WOH assets used.
- Added `src/components/JumpscareVideo.tsx` and `src/game/jumpscares.ts`. The existing terminal failure triggers open a full-viewport inline mobile video; skip works immediately; a watchdog handles missing/stalled media and restores the incident summary. Preview remains loss-free.
- Respects existing FX OFF and OS reduced-motion behavior. Video is muted by default for autoplay compatibility. A later optional sound control requires a separate user-gesture implementation.
- Presentation state remains separate from seeded combat, replay and versioned saves. The UI currently uses a **remote generated MP4**, not a checked-in video asset. Before public release, consider self-hosting/optimizing the clip and verifying licensing/CDN retention. Browser playback on physical phones has not yet been verified.
- GitHub Actions is the source of TypeScript/tests/production build verification; check the current commit before claiming final CI success.

## 2026-10-26 — Stronger death scare / audiovisual pass
- First five-second Paper Witness film was too slow and telegraphed; replaced its source with a generated 3-second Kling 3.0 clip designed around a 0.4-second surprise close-up and synchronized sound (generation `67377599-12d8-4695-b5e9-920ff86d77cd`).
- Video player now shows a dark loading state instead of spoiling the scare with its still portrait; unmuted playback is attempted first, then automatically retries muted if blocked by browser autoplay. An explicit tap-to-unmute control appears when sound is blocked.
- Added separate persistent SCARE AUDIO ON/OFF toggle, video loading and playback watchdogs, mobile-sized skip control and keyboard focus trap; the existing FX OFF and OS reduced-motion bypass remain.
- Video still streams from Higgsfield CDN; physical iOS/Android performance, actual audio playback, and user-perceived scare quality require player validation. No changes to seeded engine, saves or endings.

- Added a short procedural paper-rip/bass impact only as an autoplay-muted fallback. Its AudioContext is primed on an actual player gesture, never changes seeded game results, and respects SCARE AUDIO OFF. Mobile Safari may still limit sound; no claim of physical-device audio verification.
