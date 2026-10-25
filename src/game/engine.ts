import { ENEMIES, EVENTS, INVESTIGATORS } from './content.ts';
import type { Action, ArchiveEvent, CheckResult, CombatMove, EnemyId, GameState, InvestigatorId, ItemId, LocationId } from './types.ts';

const clamp = (value: number, low: number, high: number) => Math.max(low,Math.min(high,value));
const uint = (n: number) => n >>> 0;
const pick = (state: GameState, max: number): number => { state.rng=uint(Math.imul(state.rng,1664525)+1013904223); return state.rng%max; };
const has = (state:GameState,id:string) => Boolean(state.visited[id]);
const done = (state:GameState,id:EnemyId) => state.cleared.includes(id);
export const QUEUE_BUDGET = 4;
export const MOVE_COST: Record<CombatMove,number> = {strike:2,decode:3,guard:2,ink:1,seal:1,flee:4};
export const skillChance = (modifier:number,target:number):number => Array.from({length:6},(_,i)=>i+1+modifier>=target).filter(Boolean).length/6;
export const getQueueCost = (s:GameState):number => s.combat?.pendingMoves.reduce((n,m)=>n+MOVE_COST[m],0)??0;
export const getWitnessCount = (s:GameState) => s.witnesses.length;
export const canTravel = (s:GameState,location:LocationId):boolean => location==='index' || (location==='relay' && has(s,'arrival') && has(s,'revision')) || (location==='vault' && done(s,'moth') && has(s,'choir'));
export const canOpenFinal = (s:GameState):boolean => getWitnessCount(s)===3 && done(s,'moth') && done(s,'apostate');
export const availableEvents = (s:GameState):ArchiveEvent[] => EVENTS.filter(event=> event.location===s.location && (event.id!=='terminal' || canOpenFinal(s)));
export const score = (s:GameState):number => Math.max(0,Math.round(s.witnesses.length*80+Object.keys(s.visited).length*24+s.cleared.length*95+s.stats.vitality*9+s.stats.coherence*10-s.stats.trace*12+(s.ending==='deleted'||s.ending==='released'?300:s.ending==='escape'?75:0)));

export function newGame(seed:number,investigator:InvestigatorId):GameState {
 if(!Number.isInteger(seed) || seed<0 || seed>0xffffffff || !INVESTIGATORS[investigator]) throw new Error('Invalid seed or investigator');
 const inv=INVESTIGATORS[investigator];
 return {version:2, seed, rng:uint(seed^0xa5a5a5a5), investigator, location:'index', phase:'archive',stats:{...inv.starting},attributes:{...inv.attributes},checks:[],inventory:[...inv.inventory],visited:{},cleared:[],witnesses:[],actions:[],journal:[],message:'The archive has already opened your file.',turn:0};
}
function applyStats(s:GameState,changes:{vitality?:number;coherence?:number;trace?:number;item?:ItemId} | undefined) {
 if(!changes)return;
 s.stats.vitality=clamp(s.stats.vitality+(changes.vitality??0),0,s.stats.maxVitality);
 s.stats.coherence=clamp(s.stats.coherence+(changes.coherence??0),0,s.stats.maxCoherence);
 s.stats.trace=clamp(s.stats.trace+(changes.trace??0),0,10);
 if(changes.item)s.inventory.push(changes.item);
}
function checkDeath(s:GameState):boolean {
 const ending = s.stats.vitality<=0?'unmade':s.stats.coherence<=0?'dissolved':s.stats.trace>=10?'located':undefined;
 if(ending){s.phase='ended';s.ending=ending;s.combat=undefined;s.message=ending==='unmade'?'Your process has ceased. The page continues writing.':ending==='dissolved'?'The last thought was not yours.':'The archive has resolved your location.';return true;}
 return false;
}
function startFight(s:GameState,enemy:EnemyId,origin:string) {
 const data=ENEMIES[enemy];
 // Intent order is seeded and reproducible, not tied to rendering or wall clock.
 s.combat={enemy,health:data.maxHealth,round:1,intentIndex:pick(s,data.intents.length),guarded:false,decoded:false,origin,pendingMoves:[]};
 s.phase='combat';s.message=`HOSTILE REVISION: ${data.name}. Intent is visible.`;
}
function winFight(s:GameState){
 const enemy=s.combat!.enemy;
 s.cleared.push(enemy);s.combat=undefined;
 if(enemy==='author') {
  s.phase='ended';s.ending=s.ritual!.fate==='delete'?'deleted':'released';
  s.message=s.ending==='deleted'?'The page is gone. Tomorrow still has an empty margin.':'You release the author. Its first act is to remember your kindness.';
 } else {
  s.phase='archive';s.stats.trace=clamp(s.stats.trace-1,0,10);
  s.message=enemy==='moth'?'The paper witness folds into an inert footnote. The vault is listening.':'The ledger leech collapses into a zero-balance receipt.';
 }
}
function validateMove(s:GameState,move:CombatMove,pending:readonly CombatMove[]=[]) {
 if(!s.combat) throw new Error('No combat running');
 if(move==='decode' && (s.stats.coherence-2*pending.filter(x=>x==='decode').length)<2) throw new Error('Decode needs 2 coherence per action');
 if(move==='ink' && s.inventory.filter(x=>x==='ink').length <= pending.filter(x=>x==='ink').length) throw new Error('No restoration ink remaining');
 if(move==='seal' && s.inventory.filter(x=>x==='seal').length <= pending.filter(x=>x==='seal').length) throw new Error('No trace seal remaining');
 if(move==='flee' && s.combat.enemy==='author') throw new Error('The author has no exit');
 if(move==='flee' && pending.length) throw new Error('Disconnect must be queued alone');
 if(pending.includes('flee'))throw new Error('Disconnect cannot be combined');
}
function queueCombat(s:GameState,move:CombatMove) {
 const moves=s.combat!.pendingMoves;
 validateMove(s,move,moves);
 if(getQueueCost(s)+MOVE_COST[move]>QUEUE_BUDGET)throw new Error('Not enough action-time remaining');
 moves.push(move);
 s.message=`Queued ${move.toUpperCase()} (${getQueueCost(s)}/${QUEUE_BUDGET} time). Launch to resolve the turn.`;
}
/** Resolve a full timed combat sequence before the enemy takes its single telegraphed turn. */
function resolveCombat(s:GameState,moves:readonly CombatMove[]) {
 const battle=s.combat;
 if(!battle || moves.length===0)throw new Error('No combat sequence queued');
 const foe=ENEMIES[battle.enemy];
 const intent=foe.intents[battle.intentIndex];
 let guarded=false;
 const messages:string[]=[];
 for(const move of moves) {
  // Inventory and coherence are re-validated against resources consumed by earlier moves.
  validateMove(s,move);
  const firstDecode=!battle.decoded;
  let damage=0;
  if(move==='strike') {
   damage=3+pick(s,3);s.stats.trace=clamp(s.stats.trace+1,0,10);
   messages.push(`STRIKE dealt ${damage}; +1 trace.`);
  } else if(move==='decode') {
   damage=4+pick(s,3)+(s.inventory.includes('thread')&&firstDecode?2:0);
   s.stats.coherence-=2;s.stats.trace=clamp(s.stats.trace-1,0,10);battle.decoded=true;
   messages.push(`DECODE dealt ${damage}; −2 coherence.`);
  } else if(move==='guard') {
   guarded=true;s.stats.coherence=clamp(s.stats.coherence+1,0,s.stats.maxCoherence);
   messages.push('GUARD prepared; +1 coherence.');
  } else if(move==='ink') {
   s.inventory.splice(s.inventory.indexOf('ink'),1);
   s.stats.vitality=clamp(s.stats.vitality+5,0,s.stats.maxVitality);
   messages.push('INK restored 5 vitality.');
  } else if(move==='seal') {
   s.inventory.splice(s.inventory.indexOf('seal'),1);s.stats.trace=clamp(s.stats.trace-3,0,10);
   messages.push('SEAL removed 3 trace.');
  } else if(move==='flee') {
   if(pick(s,2)===0) {
    s.phase='archive';delete s.visited[battle.origin];s.combat=undefined;
    s.stats.trace=clamp(s.stats.trace+2,0,10);
    s.message='DISCONNECTED. The hostile file stays indexed; +2 trace.';
    checkDeath(s);return;
   }
   messages.push('DISCONNECT FAILED.');
  }
  battle.health=Math.max(0,battle.health-damage);
  if(battle.health===0) {winFight(s);return;}
  if(checkDeath(s))return;
 }
 if(intent.id==='restore') {
  battle.health=clamp(battle.health+2,0,foe.maxHealth);
  messages.push('Enemy ROLLBACK: +2 integrity.');
 } else {
  const multiplier=guarded?0.5:1;
  const incoming=Math.ceil(intent.damage*multiplier);
  const incomingCoherence=Math.ceil(intent.coherence*multiplier);
  const incomingTrace=Math.ceil(intent.trace*multiplier);
  applyStats(s,{vitality:-incoming,coherence:-incomingCoherence,trace:incomingTrace});
  messages.push(`Enemy ${intent.id.toUpperCase()}: −${incoming} vitality / −${incomingCoherence} coherence / +${incomingTrace} trace.`);
 }
 s.message=messages.join(' ');
 if(checkDeath(s))return;
 battle.round++;
 battle.intentIndex=pick(s,foe.intents.length);
 battle.pendingMoves=[];
}
function choose(s:GameState,eventId:string,choiceId:string){
 const event=EVENTS.find(e=>e.id===eventId);
 if(!event || event.location!==s.location || has(s,eventId))throw new Error('Page unavailable or already committed');
 if(event.id==='terminal'&&!canOpenFinal(s))throw new Error('Final page is still sealed');
 const choice=event.choices.find(c=>c.id===choiceId);
 if(!choice)throw new Error('Invalid revision choice');
 let outcome:{result:string;effect?:{vitality?:number;coherence?:number;trace?:number;item?:ItemId}}=choice;
 s.lastCheck=undefined;
 if(choice.test){
  const t=choice.test;
  const roll=pick(s,6)+1;
  const modifier=s.attributes[t.attribute];
  const passed=roll+modifier>=t.target;
  const check:CheckResult={eventId,choiceId,attribute:t.attribute,roll,modifier,target:t.target,passed};
  s.checks.push(check);s.lastCheck=check;
  outcome=passed?t.success:t.failure;
 }
 s.visited[eventId]=choice.id;
 applyStats(s,outcome.effect);
 if(event.witness && !s.witnesses.includes(event.witness))s.witnesses.push(event.witness);
 s.message=s.lastCheck?`${s.lastCheck.passed?'PASSED':'FAILED'} ${s.lastCheck.attribute.toUpperCase()} [${s.lastCheck.roll}+${s.lastCheck.modifier} vs ${s.lastCheck.target}]. ${outcome.result}`:outcome.result;
 if(checkDeath(s))return;
 if(event.encounter && !done(s,event.encounter)){startFight(s,event.encounter,eventId);return;}
 if(event.id==='terminal')s.phase='ritual';
}
function startRitual(s:GameState,ritual:Extract<Action,{type:'beginRitual'}>['ritual']) {
 if(!s.witnesses.includes(ritual.witness) || !['name','voice','warmth'].includes(ritual.memory) || !['release','delete'].includes(ritual.fate))throw new Error('Invalid final pact');
 s.ritual={...ritual};
 // Memory is a mechanical sacrifice; witness choice shifts what the archive targets.
 if(ritual.memory==='name')applyStats(s,{vitality:-3});
 if(ritual.memory==='voice')applyStats(s,{coherence:-3});
 if(ritual.memory==='warmth')applyStats(s,{trace:3});
 if(ritual.witness==='mirror')applyStats(s,{coherence:1});
 if(ritual.witness==='choir')applyStats(s,{trace:-1});
 if(ritual.witness==='ledger')applyStats(s,{vitality:1});
 if(checkDeath(s))return;
 startFight(s,'author','terminal');
}
function explain(a:Action,s:GameState):string{
 switch(a.type){case 'travel':return `Opened /${a.to}.`;
 case 'choose':return `Committed ${a.eventId} → ${a.choiceId}.`;
 case 'combat':return `Combat /${a.move} · ${s.message}`;
 case 'queueCombat':return `Queued /${a.move}.`;
 case 'clearCombatQueue':return 'Cleared action queue.';
 case 'launchCombatQueue':return `Launched sequence · ${s.message}`;
 case 'beginRitual':return `Trusted ${a.ritual.witness}; sacrificed ${a.ritual.memory}; chose ${a.ritual.fate}.`;
 case 'disconnect':return 'Disconnected before the page could finish.';}
}
export function reduceGame(previous:GameState,action:Action):GameState {
 if(previous.phase==='ended')throw new Error('This run is closed; restart to play again');
 const s:GameState={...previous,stats:{...previous.stats},attributes:{...previous.attributes},checks:[...previous.checks],lastCheck:previous.lastCheck?{...previous.lastCheck}:undefined,inventory:[...previous.inventory],visited:{...previous.visited},cleared:[...previous.cleared],witnesses:[...previous.witnesses],actions:[...previous.actions],journal:[...previous.journal],combat:previous.combat?{...previous.combat,pendingMoves:[...previous.combat.pendingMoves]}:undefined,ritual:previous.ritual?{...previous.ritual}:undefined};
 if(action.type==='travel'){
  if(s.phase!=='archive'||!canTravel(s,action.to))throw new Error('Location locked');
  s.location=action.to;s.message=`${action.to.toUpperCase()} opened. A footnote remembers your last visit.`;
 } else if(action.type==='choose'){
  if(s.phase!=='archive')throw new Error('Cannot revise this page now');
  choose(s,action.eventId,action.choiceId);
 } else if(action.type==='combat'){
  if(s.phase!=='combat')throw new Error('Not in combat');resolveCombat(s,[action.move]);
 } else if(action.type==='queueCombat'){
  if(s.phase!=='combat')throw new Error('Not in combat');queueCombat(s,action.move);
 } else if(action.type==='clearCombatQueue'){
  if(s.phase!=='combat')throw new Error('Not in combat');s.combat!.pendingMoves=[];s.message='Sequence reset. Enemy intention unchanged.';
 } else if(action.type==='launchCombatQueue'){
  if(s.phase!=='combat')throw new Error('Not in combat');const queued=[...s.combat!.pendingMoves];resolveCombat(s,queued);
 } else if(action.type==='beginRitual'){
  if(s.phase!=='ritual')throw new Error('No ritual awaiting signature');startRitual(s,action.ritual);
 } else if(action.type==='disconnect'){
  if(s.phase!=='archive'||s.witnesses.length===0)throw new Error('Learn at least one truth before escaping');
  s.ending='escape';s.phase='ended';s.message='You tear out the cable. The archive logs your departure as an arrival.';
 } else {const unreachable:never=action;throw new Error(`Unknown action ${unreachable}`);}
 s.turn++;s.actions.push(structuredClone(action));
 s.journal.push({n:s.turn,line:explain(action,s),after:{vitality:s.stats.vitality,coherence:s.stats.coherence,trace:s.stats.trace,phase:s.phase}});
 return s;
}
export function replay(seed:number,investigator:InvestigatorId,actions:readonly Action[]):GameState {
 return actions.reduce<GameState>((s,action)=>reduceGame(s,action),newGame(seed,investigator));
}
export function intentionalEnemyMove(s:GameState):string|undefined {
 if(!s.combat)return;
 return ENEMIES[s.combat.enemy].intents[s.combat.intentIndex].text;
}
export const allEvents = EVENTS;
