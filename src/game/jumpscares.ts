import type { FatalEnding } from '../animation/effects.ts';

/** Presentation-only routing; never stored in the deterministic run state. */
export interface JumpscareClip { webm: string; mp4: string; }
export const PAPER_WITNESS_CLIP: JumpscareClip = {
  webm: '',
  mp4: 'https://d8j0ntlcm91z4.cloudfront.net/user_3BWBpvahh82U77Xz3HwTF7YlpKh/hf_20261025_145756_848597c5-d503-42dd-937b-08934b1469b3.mp4',
};
export function clipForEnding(_ending: FatalEnding): JumpscareClip {
  // Universal first clip. Future variants can route by ending without save changes.
  return PAPER_WITNESS_CLIP;
}
