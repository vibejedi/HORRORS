import type { FatalEnding } from '../animation/effects.ts';

/** Presentation-only routing; never stored in the deterministic run state. */
export interface JumpscareClip { webm: string; mp4: string; }
export const PAPER_WITNESS_CLIP: JumpscareClip = {
  webm: '/video/paper-witness-death.webm',
  mp4: '/video/paper-witness-death.mp4',
};
export function clipForEnding(_ending: FatalEnding): JumpscareClip {
  // Universal first clip. Future variants can route by ending without save changes.
  return PAPER_WITNESS_CLIP;
}
