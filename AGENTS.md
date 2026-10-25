# Terminal of Horrors — developer instructions

## Product constraints
Source of truth: `docs/GAME_DESIGN.md`. First case is **THE PAGE THAT REMEMBERS TOMORROW**. Maintain original fiction and ASCII art; WORLD OF HORROR is a reference for gameplay flow, not redistributable source/assets. Morluto REA (`https://github.com/morluto/rea`) can support high-level studies of lawfully accessed binaries, with asset provenance and rights review before publication. No wallet, live rewards, backend AI, or server state in prototype. Follow `docs/REFERENCE_STUDY.md` before inspecting third-party executables.

## Architecture
- `src/game/types.ts`: type contract and explicit actions.
- `src/game/content.ts`: investigators, locations, ten events, items and enemies.
- `src/game/engine.ts`: pure transitions, deterministic seeded RNG, replay and score; no React, browser APIs or wall clock. Skill checks must use D6+attribute; combat queue must consume <=4 time units and retaliate only on launch.
- `src/game/storage.ts`: versioned localStorage save, replay validation and local-only rankings.
- `src/App.tsx`, `src/styles.css`: archive UI. Keep presentation out of the engine; mobile touch targets and visible combat intent matter.
- `tests/game.test.ts`: Node's type-stripped deterministic integration tests.

## Commands
`npm install` · `npm run dev` (port printed by Vite) · `npm run test` · `npm run build` · `npm run preview` · `npm run check`. Requires Node 22+ for `--experimental-strip-types` tests. Never mark browser/build verification successful if dependency installation is blocked. Verify two runs, including one defeat and save/resume, on desktop and 390px mobile before release. Keep `docs/PROGRESS.md` current with completed vs unverified work and blockers.

## Purchased-build research
- The user has provided Windows v1.01 for **private, read-only technical inspection**. Summary: `docs/WOH_BINARY_STUDY.md`; repro: `python3 tools/inspect_woh.py <private-zip-path>`.
- Do not import original binaries, `.ito` examples, translations, images, or audio into production source, web bundles, commits, or previews without reuse rights. The attached game uses native GameMaker/YYC compilation: presence of script/resource names does not mean decompilation or source availability.
- Native function name-to-address lookup: `python3 tools/locate_woh_native.py <private-exe-path>` and `docs/WOH_NATIVE_FINDINGS.md`. Attribute tests and time-unit queues are implemented; next bridge is declarative trigger chaining and larger mystery map. Keep explicit actions and replay invariants intact.

## Original illustration integration
- Keep all asset paths in `src/game/art.ts`; each event id must map to a valid original image. Never make asset paths dependent on PRNG or break replay determinism.
- `public/art/` is exclusively for original generated assets; avoid game footage, purchased sprites, binary extracts, third-party IP, and large master files.
- `npm run test` includes an asset contract check. New images must stay performant on mobile; render UI text/actions in HTML, never make image-only controls.
