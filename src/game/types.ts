export type InvestigatorId = 'mara' | 'ivo';
export type AttributeId = 'perception' | 'knowledge' | 'nerve';
export type Attributes = Record<AttributeId, number>;
export type LocationId = 'index' | 'relay' | 'vault';
export type ItemId = 'ink' | 'seal' | 'thread';
export type EnemyId = 'moth' | 'apostate' | 'author';
export type WitnessId = 'mirror' | 'choir' | 'ledger';
export type MemoryId = 'name' | 'voice' | 'warmth';
export type FateId = 'delete' | 'release';
export type EndingId = 'deleted' | 'released' | 'escape' | 'unmade' | 'dissolved' | 'located';
export type Phase = 'archive' | 'combat' | 'ritual' | 'ended';

export interface Stats { vitality: number; maxVitality: number; coherence: number; maxCoherence: number; trace: number; }
export interface Effect { vitality?: number; coherence?: number; trace?: number; item?: ItemId; }
export interface TestOutcome { result: string; effect?: Effect; }
export interface SkillTest { attribute: AttributeId; target: number; success: TestOutcome; failure: TestOutcome; }
export interface Choice { id: string; text: string; result: string; effect?: Effect; test?: SkillTest; }
export interface CheckResult { eventId: string; choiceId: string; attribute: AttributeId; roll: number; modifier: number; target: number; passed: boolean; }
export interface ArchiveEvent { id: string; location: LocationId; title: string; slug: string; excerpt: string; body: string; art: string; choices: readonly [Choice, Choice]; encounter?: EnemyId; witness?: WitnessId; requirement?: string; }
export interface Intent { id: 'cut' | 'noise' | 'mark' | 'restore'; text: string; damage: number; coherence: number; trace: number; }
export interface Enemy { id: EnemyId; name: string; art: string; maxHealth: number; intents: readonly Intent[]; flavor: string; }
export type CombatMove = 'strike'|'decode'|'guard'|'ink'|'seal'|'flee';
export interface CombatState { enemy: EnemyId; health: number; round: number; intentIndex: number; guarded: boolean; decoded: boolean; origin: string; pendingMoves: CombatMove[]; }
export interface Ritual { witness: WitnessId; memory: MemoryId; fate: FateId; }
export type Action =
 | { type:'travel'; to: LocationId }
 | { type:'choose'; eventId: string; choiceId: string }
 | { type:'combat'; move: CombatMove }
 | { type:'queueCombat'; move: CombatMove }
 | { type:'clearCombatQueue' }
 | { type:'launchCombatQueue' }
 | { type:'beginRitual'; ritual: Ritual }
 | { type:'disconnect' };
export interface JournalEntry { n: number; line: string; after: { vitality: number; coherence: number; trace: number; phase: Phase }; }
export interface GameState {
 version: 2; seed: number; rng: number; investigator: InvestigatorId; location: LocationId; phase: Phase;
 stats: Stats; attributes: Attributes; checks: CheckResult[]; lastCheck?: CheckResult; inventory: ItemId[]; visited: Record<string,string>; cleared: EnemyId[];
 witnesses: WitnessId[]; ritual?: Ritual; combat?: CombatState; ending?: EndingId;
 actions: Action[]; journal: JournalEntry[]; message: string; turn: number;
}
export interface Investigator { id: InvestigatorId; name: string; role: string; epitaph: string; starting: Stats; attributes: Attributes; inventory: ItemId[]; perk: string; }
