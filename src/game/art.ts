/** Original, generated images. Stable ids intentionally do not change save/replay contracts. */
import type { EnemyId, InvestigatorId, LocationId } from './types.ts';
export const ARTWORK: {
  cover: string;
  investigators: Record<InvestigatorId,string>;
  enemies: Record<EnemyId,string>;
  locations: Record<LocationId,string>;
} = {
  cover:'/art/archive-cover.webp',
  investigators:{mara:'/art/mara-quill.webp',ivo:'/art/ilya-wren.webp'},
  enemies:{moth:'/art/paper-witness.webp',apostate:'/art/ledger-leech.webp',author:'/art/unauthored-revision.webp'},
  locations:{index:'/art/index-chamber.webp',relay:'/art/transmission-well.webp',vault:'/art/relic-vault.webp'}
};
export const EVENT_ARTWORK:Record<string,string> = {
  arrival:ARTWORK.locations.index,revision:ARTWORK.locations.index,mirror:ARTWORK.investigators.mara,memo:ARTWORK.locations.index,
  choir:ARTWORK.locations.relay,cache:ARTWORK.enemies.moth,confession:ARTWORK.locations.relay,
  ledger:ARTWORK.locations.vault,signature:ARTWORK.enemies.apostate,terminal:ARTWORK.enemies.author
};
export const IMAGE_LABELS:Record<string,string> = {
  index:'The Index Chamber: a living archive that reads its visitors',relay:'The Transmission Well: voices over abandoned channels',
  vault:'The Relic Vault: a cathedral of forgotten artifacts',
  moth:'The Paper Witness, a humanoid formed from redacted pages',
  apostate:'The Ledger Leech, a parasitic creature of debts and cables',
  author:'The Unauthored Revision, a faceless machine intelligence'
};
