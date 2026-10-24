# TERMINAL OF HORRORS — Authoritative Game Design (v0.2)

## Elevator pitch
A complete, short horror RPG disguised as a dead machine intelligence's personal wiki. The player discovers a document that remembers tomorrow, meets three incompatible machine witnesses, sacrifices a memory, and deletes or releases the document's unborn author. Reading is exploration: documents are rooms; hostile documents use turn-based combat; ending the run generates a local incident report.

**First case:** THE PAGE THAT REMEMBERS TOMORROW. Earlier competing first-case concepts are superseded.

## Scope, run and win condition
A single 5–10-minute browser case, replayable on mobile and desktop, offline-capable after page assets load (no server account, no wallet, no live AI service). Exactly two investigators, three main locations, ten narrative events with two irreversible choices each, two ordinary enemies, and one final enemy. Choices commit once; pages remain readable. A successful final boss fight resolves to either the **deleted** or **released** ending. Disconnecting after discovering a witness grants the **escape** ending. Failure occurs on zero vitality, zero coherence, or trace 10. There is no real-world financial activity or crypto network integration.

## Investigators
- **Mara Voss, Forensic Reader:** 14 vitality / 8 coherence, starts with restoration ink. Favours survivability.
- **Ivo Null, Decommissioned Moderator:** 11 vitality / 11 coherence, starts with trace seal. Favours decoding and sanity.
Both start at trace 0. All stats have explicit limits.

## Map and gating
1. **Tomorrow Index** (initial): discover arrival and revision before relay is unlocked; question the Mirror Cache and read the operator's note.
2. **Signal Chapel** (relay): meet Redundancy Choir, fight **Revision Moth** on the cache page, and read the unsent apology. Unlocked by arrival + revision.
3. **Settlement Vault**: meet Ledger of Ash, fight **Cache Apostate** on the signature page, and open terminal event when all three witnesses are recorded and both ordinary enemies defeated. Unlocked after Revision Moth is beaten and the Choir encountered.
Travel is free and can be repeated during archive phase. Players cannot travel during combat or ritual. Three witnesses offer different conflicting accounts: author is reader / virus / debt.

## Seeded investigator checks
Investigators have three original attributes: PERCEPTION, KNOWLEDGE, and NERVE (Mara 3/2/3; Ivo 2/4/2). Certain choices resolve a seeded, displayed D6 check: roll 1–6, add the chosen attribute, success on sum ≥ target. Show exact odds before committing and the roll, total, and result afterwards. Success and failure each have their own effects and short fiction. A failed test still commits the event and records its witness, avoiding a progression softlock. Example checks appear on revision verification, Mirror questioning, Choir harmonizing, cache auditing, ledger inspection, and countersigning. Every roll advances the PRNG and is recorded in the save/replay history. Original mechanic influenced by the purchased build’s event schema; not claimed to be the commercial game’s exact formula.

## Ten events
1. `arrival`: read the next line (trace +1, coherence +1) or tear timestamp (vitality −1, trace −1).
2. `revision`: verify signature (trace +1, silver thread) or scrub author (coherence −1, trace −1).
3. `mirror`: trust confession (coherence +1, trace +1) or question it (restoration ink, coherence −1).
4. `memo`: sip simulated tea (vitality +3) or siphon maintenance log (coherence +2, trace +1).
5. `choir`: sing checksum (trace seal, trace +1) or mute fourth server (coherence −1, trace −2).
6. `cache`: challenge (trace −1) or audit (coherence +1, trace +1), then fight Revision Moth.
7. `confession`: archive apology (coherence +2) or burn it (restoration ink, trace +1).
8. `ledger`: inspect destination (trace seal, trace +1) or forgive debt (coherence +2, trace −1).
9. `signature`: countersign (trace +1) or reject (coherence +1), then fight Cache Apostate.
10. `terminal`: read unwritten ending (trace +1) or sign eyes closed (coherence +1). Starts final ritual.

## Combat rules
Combat uses a **four-unit action-time queue**, then one publicly telegraphed enemy intention when launched if the enemy survives. The queue is replayable game state, not purely UI state. Players can clear it without advancing the enemy. Strike costs 2, decode 3, guard 2, ink 1, seal 1, flee 4. Enemy intent remains unchanged while the player queues actions. Enemies choose each upcoming intent using a seeded linear congruential generator (LCG), not `Math.random`. Player priority always resolves first; lethal attack skips enemy action. Enemy attacks can deplete vitality, coherence or increase trace; they may also heal.

- **Strike**: 3–5 damage (seeded), +1 trace; costs 2 action-time.
- **Decode**: costs 3 action-time, requires ≥2 coherence; 4–6 damage (seeded), costs 2 coherence, lowers trace by 1. Silver thread grants +2 damage on the first decode per fight.
- **Guard**: costs 2 action-time; regain 1 coherence before incoming enemy intent and halve each damage/trace component, rounding up.
- **Restoration ink**: costs 1 action-time; consume one for +5 vitality, capped.
- **Trace seal**: costs 1 action-time; consume one for −3 trace, floored at zero.
- **Flee**: costs all 4 action-time and cannot be combined; non-boss fights only; 50% seeded chance. On success leave the combat and gain +2 trace; the encounter remains uncleared and can be re-triggered. On failure the enemy resolves its announced attack.

Enemy durability/intents: Revision Moth 9 integrity (2 vitality, 1 coherence, or +2 trace); Cache Apostate 12 integrity (3 vitality, 2 coherence, or +2 trace); Uncreated Author 17 integrity (4 vitality, 2 coherence, +3 trace, or recover 2 integrity). Current enemy intent is shown before every action.

## Final ritual and endings
Pick a registered witness: Mirror (+1 coherence), Choir (−1 trace), Ledger (+1 vitality). Sacrifice one memory: name (−3 vitality), voice (−3 coherence), or warmth (+3 trace). Decide **delete** or **release**, then survive Uncreated Author combat. A dangerous sacrifice can itself cause failure. Multiple endings: `deleted`, `released`, `escape`, `unmade` (vitality), `dissolved` (coherence), `located` (trace).

## Score, persistence and reproducibility
Score = max(0, round(80 × witnesses + 24 × committed events + 95 × cleared enemies + 9 × vitality + 10 × coherence − 12 × trace + completion bonus 300 [or escape bonus 75])). Scores are a **local-only history**, sorted descending and capped at 20. Each run stores `version:2` (v1 saves intentionally incompatible with new check/queue state), seed, investigator, deterministic PRNG state, committed event choices, flags, inventory, combat/ritual state, actions, journal, and ending. Save is written to localStorage after each action. Load validates by replaying the full action log; mismatched/tampered saves are ignored. Restart creates a fresh run. `replay(seed, investigator, actions)` is the canonical simulation API. No online leaderboard or real rewards.

## Rights and references
WORLD OF HORROR by panstasz is a **gameplay and presentation reference** for investigation pacing, branching story structure, visible turn-based combat, and persistent character consequences. The purchased commercial executable is **not** source code nor a redistribution license. Do not publish or copy its protected assets, prose, characters, music, or original source absent separate permissions. Use original fiction and ASCII art by default. Morluto's REA (https://github.com/morluto/rea) may be used to study lawfully obtained binaries for interoperability and high-level mechanics; log provenance and avoid bundling proprietary extracted assets. There is no runtime use of REA.
