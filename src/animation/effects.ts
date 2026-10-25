import type { Action, EndingId, GameState } from '../game/types.ts';

/** Ephemeral presentation cues: never enter GameState, save files or replay logs. */
export type MomentKind = 'strike' | 'decode' | 'guard' | 'recovery' | 'victory' | 'failed-test' | 'page';
export interface Moment { id: number; kind: MomentKind; label: string; detail: string; }
export type FatalEnding = Extract<EndingId, 'unmade' | 'dissolved' | 'located'>;
export interface FatalCue { title: string; detail: string; art: 'moth' | 'apostate' | 'author'; }

export const FATAL_CUES: Record<FatalEnding, FatalCue> = {
  unmade: { title: 'YOU ARE NO LONGER READING.', detail: 'THE ARCHIVE HAS FOUND A NEW USE FOR YOUR BODY.', art: 'apostate' },
  dissolved: { title: 'THAT WAS YOUR LAST THOUGHT.', detail: 'WHOEVER FINISHED IT IS STILL HERE.', art: 'author' },
  located: { title: 'IT KNOWS WHERE YOU ARE.', detail: 'THIS WAS NEVER AN ANONYMOUS SESSION.', art: 'moth' },
};
export function fatalCue(ending: EndingId | undefined): FatalCue | null {
  return ending && ending in FATAL_CUES ? FATAL_CUES[ending as FatalEnding] : null;
}
export function isNewFatality(before: GameState, after: GameState): boolean {
  return before.phase !== 'ended' && after.phase === 'ended' && fatalCue(after.ending) !== null;
}
export function describeMoment(before: GameState, after: GameState, action: Action, id: number): Moment | null {
  if (isNewFatality(before, after)) return null; // jumpscare takes priority
  if (after.lastCheck && action.type === 'choose' && !after.lastCheck.passed) {
    return { id, kind: 'failed-test', label: 'REVISION REJECTED', detail: `${after.lastCheck.attribute.toUpperCase()} CHECK FAILED` };
  }
  if (before.phase === 'combat' && (action.type === 'launchCombatQueue' || action.type === 'combat')) {
    const moves = action.type === 'combat' ? [action.move] : before.combat?.pendingMoves ?? [];
    if (after.cleared.length > before.cleared.length) return { id, kind: 'victory', label: 'HOSTILE PROCESS ENDED', detail: 'THE PAGE IS QUIET NOW' };
    const delta = (before.combat?.health ?? 0) - (after.combat?.health ?? 0);
    if (delta > 0) return { id, kind: moves.includes('decode') ? 'decode' : 'strike', label: `−${delta} INTEGRITY`, detail: 'HOSTILE RECORD DAMAGED' };
    if (moves.includes('guard')) return { id, kind: 'guard', label: 'GUARD ENGAGED', detail: 'IMPACT ABSORBED' };
    if (moves.includes('ink') || moves.includes('seal')) return { id, kind: 'recovery', label: 'ARCHIVE STABILIZED', detail: 'RESOURCES RESTORED' };
  }
  if (action.type === 'travel') return { id, kind: 'page', label: 'LOCATION UNSEALED', detail: 'THE ARCHIVE REARRANGES ITSELF' };
  if (action.type === 'choose') return { id, kind: 'page', label: 'REVISION COMMITTED', detail: 'THE PAGE REMEMBERS' };
  return null;
}
