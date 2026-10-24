import assert from 'node:assert/strict';
import test from 'node:test';
import {EVENTS, INVESTIGATORS, LOCATIONS, ENEMIES} from '../src/game/content.ts';
import {canOpenFinal, canTravel, newGame, reduceGame, replay, score} from '../src/game/engine.ts';
import {loadRun, persistRun, clearRun, loadScores, storeScore} from '../src/game/storage.ts';
import type {Action, GameState} from '../src/game/types.ts';

const choose=(eventId:string,choiceId:string):Action=>({type:'choose',eventId,choiceId});
const travel=(to:'index'|'relay'|'vault'):Action=>({type:'travel',to});
const combat=(move:'strike'|'decode'|'guard'|'ink'|'seal'|'flee'):Action=>({type:'combat',move});
const step=(s:GameState,a:Action)=>reduceGame(s,a);
const basePath:Action[]=[
 choose('arrival','tear'),choose('revision','verify'),choose('mirror','question'),choose('memo','sip'),
 travel('relay'),choose('choir','mute'),choose('confession','keep'),choose('cache','challenge')
];
function finishQueuedBattle(s:GameState):GameState {
 let turns=0;
 while(s.phase==='combat') {
  if(++turns>25)throw new Error('Combat exceeded 25 rounds');
  const queue:Extract<Action,{type:'queueCombat'}>['move'][]=[];
  if(s.stats.trace>=5&&s.inventory.includes('seal'))queue.push('seal');
  if(s.stats.vitality<=8&&s.inventory.includes('ink'))queue.push('ink');
  const cost=queue.reduce((n,m)=>n+(m==='seal'||m==='ink'?1:2),0);
  if(s.stats.coherence>=2&&cost+3<=4&&s.stats.trace>=5)queue.push('decode');
  else if(cost+4<=4)queue.push('strike','strike');
  else if(cost+2<=4)queue.push('strike');
  if(queue.length===0)queue.push('strike');
  for(const move of queue)s=step(s,{type:'queueCombat',move});
  s=step(s,{type:'launchCombatQueue'});
 }
 return s;
}
function completeWinningRun(fate:'release'|'delete'='release'){
 let state=newGame(42,'mara');
 for(const action of basePath)state=step(state,action);
 state=finishQueuedBattle(state);
 state=step(state,travel('vault'));
 for(const action of [choose('ledger','forgive'),choose('signature','deny')])state=step(state,action);
 state=finishQueuedBattle(state);
 assert.ok(canOpenFinal(state));
 state=step(state,choose('terminal','hold'));
 state=step(state,{type:'beginRitual',ritual:{witness:'ledger',memory:'name',fate}});
 return finishQueuedBattle(state);
}

test('data contract: two investigators, three locations, ten branching events, three enemies',()=>{
 assert.equal(Object.keys(INVESTIGATORS).length,2);
 assert.equal(Object.keys(LOCATIONS).length,3);
 assert.equal(EVENTS.length,10);
 assert.ok(EVENTS.every(e=>e.choices.length===2&&e.art&&e.body&&e.slug));
 assert.equal(Object.keys(ENEMIES).length,3);
});
test('sealed areas and final ritual cannot be skipped',()=>{
 let s=newGame(14,'mara');
 assert.equal(canTravel(s,'vault'),false);
 assert.throws(()=>step(s,travel('vault')),/locked/);
 assert.throws(()=>step(s,choose('terminal','read')),/unavailable/);
 for(const action of [choose('arrival','follow'),choose('revision','verify')])s=step(s,action);
 assert.equal(canTravel(s,'relay'),true);
 assert.equal(canOpenFinal(s),false);
 assert.throws(()=>step(s,{type:'beginRitual',ritual:{witness:'mirror',memory:'voice',fate:'delete'}}),/No ritual/);
});
test('winning run traverses every location, clears ordinary encounters and resolves final boss',()=>{
 const s=completeWinningRun();
 assert.equal(s.phase,'ended');
 assert.equal(s.ending,'released');
 assert.deepEqual(s.cleared,['moth','apostate','author']);
 assert.equal(s.witnesses.length,3);
 assert.equal(Object.keys(s.visited).length,10);
 assert.ok(score(s)>0);
 assert.ok(s.stats.vitality>0&&s.stats.coherence>0);
});
test('both final pacts lead to distinct victory endings',()=>{
 const deleted=completeWinningRun('delete');
 assert.equal(deleted.ending,'deleted');
 assert.notEqual(deleted.ending,completeWinningRun('release').ending);
});
test('death, restart and escape are actual state transitions',()=>{
 let s=newGame(42,'ivo');
 for(const action of [...basePath.slice(0,2),choose('mirror','believe'),travel('relay'),choose('choir','harmonize'),choose('cache','challenge')])s=step(s,action);
 for(let i=0;i<100&&s.phase==='combat';i++)s=step(s,combat('guard'));
 assert.equal(s.phase,'ended');
 assert.ok(['unmade','dissolved','located'].includes(s.ending!));
 assert.throws(()=>step(s,combat('guard')),/closed/);
 const restarted=newGame(42,'ivo');
 assert.equal(restarted.turn,0);
 assert.equal(restarted.phase,'archive');
 let escaped=step(restarted,choose('arrival','follow'));
 escaped=step(escaped,choose('mirror','believe'));
 escaped=step(escaped,{type:'disconnect'});
 assert.equal(escaped.ending,'escape');
});
test('same seed/investigator/actions replay to identical state, different seeds vary combat',()=>{
 const original=completeWinningRun();
 assert.deepEqual(replay(original.seed,original.investigator,original.actions),original);
 assert.deepEqual(replay(original.seed,original.investigator,original.actions),replay(original.seed,original.investigator,original.actions));
 const shuffled=newGame(85,'mara');
 assert.notEqual(shuffled.rng,newGame(86,'mara').rng);
 assert.throws(()=>step(newGame(3,'mara'),combat('strike')),/Not in combat/);
});
test('versioned local save/resume; tampered saves rejected; scores remain local',()=>{
 const map=new Map<string,string>();
 (globalThis as any).localStorage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);},removeItem:(k:string)=>{map.delete(k);}};
 const middle=basePath.slice(0,4).reduce(step,newGame(42,'mara'));
 persistRun(middle);
 assert.deepEqual(loadRun(),JSON.parse(JSON.stringify(middle)));
 const key='terminal-of-horrors/save/v2';
 const raw=JSON.parse(map.get(key)!);
 raw.state.stats.vitality=999;
 map.set(key,JSON.stringify(raw));
 assert.equal(loadRun(),null);
 raw.version=100;
 map.set(key,JSON.stringify(raw));
 assert.equal(loadRun(),null);
 clearRun();assert.equal(loadRun(),null);
 const won=completeWinningRun();
 assert.equal(storeScore(won).length,1);
 assert.equal(storeScore(won).length,1);
 assert.equal(loadScores()[0].ending,'released');
 assert.equal(loadScores()[0].seed,42);
});

test('seeded skill checks have explained outcomes, influence resources, and replay exactly',()=>{
 let s=newGame(42,'mara');
 s=step(s,choose('arrival','tear'));
 s=step(s,choose('revision','verify'));
 assert.equal(s.checks.length,1);
 assert.equal(s.checks[0].attribute,'knowledge');
 assert.ok(s.checks[0].roll>=1&&s.checks[0].roll<=6);
 assert.equal(s.checks[0].passed,s.checks[0].roll+s.checks[0].modifier>=s.checks[0].target);
 assert.match(s.message,/KNOWLEDGE/);
 assert.deepEqual(replay(s.seed,s.investigator,s.actions),s);
 const untested=step(s,choose('memo','sip'));
 assert.equal(untested.checks.length,1);
});
test('combat queues obey action-time budget and enemy responds only on launch',()=>{
 let s=newGame(42,'mara');
 for(const a of basePath)s=step(s,a);
 assert.equal(s.phase,'combat');
 const hp=s.combat!.health;
 const round=s.combat!.round;
 s=step(s,{type:'queueCombat',move:'strike'});
 s=step(s,{type:'queueCombat',move:'strike'});
 assert.equal(s.combat!.health,hp);
 assert.equal(s.combat!.round,round);
 assert.throws(()=>step(s,{type:'queueCombat',move:'strike'}),/time/);
 const reset=step(s,{type:'clearCombatQueue'});
 assert.equal(reset.combat!.pendingMoves.length,0);
 assert.throws(()=>step(reset,{type:'launchCombatQueue'}),/No combat sequence/);
 s=step(s,{type:'launchCombatQueue'});
 assert.ok(s.phase!=='combat'||s.combat.round===round+1);
 assert.deepEqual(replay(s.seed,s.investigator,s.actions),s);
});
test('escaping an enemy allows re-entering that file (no softlock)',()=>{
 let succeeded=false;
 for(let seed=0;seed<30;seed++){
  let s=newGame(seed,'mara');
  for(const a of basePath)s=step(s,a);
  s=step(s,{type:'combat',move:'flee'});
  if(s.phase==='archive'){
   succeeded=true;
   assert.equal(s.visited.cache,undefined);
   s=step(s,choose('cache','challenge'));
   assert.equal(s.phase,'combat');
   assert.deepEqual(replay(s.seed,s.investigator,s.actions),s);
   break;
  }
 }
 assert.ok(succeeded);
});
