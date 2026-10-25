# TERMINAL OF HORRORS

An original, mobile-first horror RPG disguised as an abandoned machine intelligence's wiki. **Case 001: The Page That Remembers Tomorrow**.

## Launch

Requires Node 22+ and npm with registry access.

```sh
npm install
npm run dev
```

Open the local URL Vite prints (typically `http://localhost:5173`). For a production build: `npm run test && npm run build && npm run preview`.

The run autosaves in browser localStorage; restart clears the run, while local incident scores persist. Use the **transmissions** view to export replay JSON for debugging. No network game backend or wallet is included.

## Rights and project direction
The investigation structure takes inspiration from WORLD OF HORROR, but this prototype's prose and ASCII artwork are original. A purchased copy of a third-party game does not automatically authorize redistribution of its code, story, art or audio. Document permissions before attempting a public port or asset reuse. Morluto's REA can help investigate mechanics of lawfully obtained binaries; see `docs/GAME_DESIGN.md` for limitations.

## WORLD OF HORROR reference study (October 2026)

The user's purchased Windows 1.01 ZIP has been **statically inventoried** (without execution or decompilation). Findings and a gap analysis are in [`docs/WOH_BINARY_STUDY.md`](docs/WOH_BINARY_STUDY.md). To repeat the metadata-only inspection locally:

```sh
python3 tools/inspect_woh.py /private/path/wohgame_1_01_windows.zip
```

The program does not extract or ship source, gameplay text, audio, or images. The original build appears to use native GameMaker/YYC compilation and requires a configured native decompiler for deeper research. The gameplay bridge now includes three investigator attributes, deterministic success/failure skill tests, and a four-time-unit combat action queue. The traceable native-code mapping is in `docs/WOH_NATIVE_FINDINGS.md`. Original game footage/screenshots and written gameplay references were used as UI/flow reference only; the purchased Windows executable has not been run under Wine.

## Current gameplay rules
Choose an investigator, commit pages while navigating the three gated archive locations, and make seeded D6 checks on high-stakes choices. When combat starts, **tap actions to queue them** (up to 4 time units) and then press **LAUNCH SEQUENCE**. Enemy intentions are revealed before you launch; they execute once if the enemy survives. Queue state and roll outcomes survive save/resume and replay. The first case ends when you defeat the author and choose to delete/release it, disconnect after acquiring a witness, or lose your vitality, coherence or trace.

## Build verification
**Verified:** GitHub Actions passed `npm run check` and produced a React 19/Vite `dist` archive in run [40101235031](https://github.com/vibejedi/HORRORS/actions/runs/40101235031). The production bundle passed an end-to-end headless Chromium touch run on a 390px viewport and a desktop 1440px layout check. A separate in-browser localStorage reload check could not be completed because the test sandbox prohibits navigations, although versioned save/resume passes automated engine tests. See `docs/PROGRESS.md` for the verification matrix.

The checked-in CI workflow (`.github/workflows/verify.yml`) runs `npm run check` with Node 22. The source package includes no proprietary game content or downloaded Windows executable.

## Offline diagnostic preview (optional)
A separate downloadable `terminal-of-horrors-debug-preview.zip` contains a test build that works without npm. **This is not the React 19 / Vite production build**: it renders the same transpiled TypeScript + JSX with a bundled React 16 compatibility harness solely for browser behavior tests. Unzip, then run `python3 -m http.server 8766` inside the `offline-preview` folder and open `http://localhost:8766`. The production target remains `npm run dev` / `npm run build` using React 19 and Vite.

## Illustrated v0.3 playable case

The browser game now includes original generated art for two investigators, three locations, two normal enemies, the final entity, and the archive cover. All images are optimized WebP files mapped by `src/game/art.ts` and rendered with responsive HTML/CSS UI and original ASCII records. The gameplay is implemented in `src/game/engine.ts`, not in the illustrations.

Run `npm run check` (11 tests and production compile), then `npm run dev` for local play. Open the network-reachable Vite host on a phone to test touch controls. The purchased WORLD OF HORROR game files are **not** a dependency and are **not** shipped. `npm`/Vite build verification for this particular art integration must be confirmed in CI.

The illustrated v0.3 test case also includes a direct next-page control and a visible committed-choice result. Verified at 390px (touch) and 1440px through the diagnostic browser harness. React 19/Vite build passed in GitHub Actions for the initial illustrated commit; later polish must be revalidated by CI.


## Animated v0.4 / fatal transmission sprint

**CSS/React-only motion:** Page materialization, drifting data motes, CRT scanline drift, location parallax/light sweeps, character breathing, enemy idle glitches, telegraphed intentions, combat impact and floating damage readouts, tactile action-queue feedback, and committed/failed skill-check stamps. All overlays are presentation-only; they never change the seeded simulation, replay, or save format.

**Jumpscare on genuine death/failure:** Transitions to `unmade` (zero vitality), `dissolved` (zero coherence), or `located` (trace 10) reveal a sudden archive-monster lunge and fatal message for about 1.85 seconds before the ordinary incident report. Can be skipped by tapping, pressing Escape/Enter/Space, or pressing **VIEW INCIDENT REPORT**. The setup screen has a **PREVIEW JUMPSCARE / VISUAL ONLY** control which does not change the game.

**Comfort & accessibility:** The `FX ON/OFF` toggle remains available above the game and persists locally. With FX off, the jump cut and ambient animations are disabled; operating-system `prefers-reduced-motion` disables them automatically as well. No flashing/strobe loop or autoplay audio. Images and interactive buttons remain independent of animation timing. Losses are determined **only** by the original `reduceGame` logic.

**Verification:** `npm run check` and GitHub Actions are the production gates. Run a fatal-path test by starting with investigator Ilya, entering relay combat, and repeatedly defending until one of vitality/coherence/trace thresholds is reached, or use the safe preview control to inspect the animation instantly. Use Chrome device emulation at 390px and a physical phone on the local Vite Network URL. See `docs/PROGRESS.md`.
