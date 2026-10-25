import type { FatalEnding } from '../animation/effects.ts';
/** Pure presentation mapping, intentionally excluded from saved and replayed RPG actions. */
export interface JumpscareClip { webm: string; mp4: string; expectedSeconds: number; }
export const PAPER_WITNESS_CLIP: JumpscareClip = {
  webm: '',
  mp4: 'https://d8j0ntlcm91z4.cloudfront.net/user_3BWBpvahh82U77Xz3HwTF7YlpKh/hf_20261025_221049_67377599-12d8-4695-b5e9-920ff86d77cd.mp4',
  expectedSeconds: 3
};
export function clipForEnding(_ending: FatalEnding): JumpscareClip {
  // One universal failure clip in the current prototype; variant mapping later.
  return PAPER_WITNESS_CLIP;
}
