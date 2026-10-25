import assert from 'node:assert/strict';
import test from 'node:test';
import { describeMoment, fatalCue, isNewFatality } from '../src/animation/effects.ts';
import { newGame, reduceGame, replay } from '../src/game/engine.ts';

test('jumpscare cue exists for every fatal ending, not victories or escape', () => {
  for(const name of ['unmade','dissolved','located'] as const){
    assert.ok(fatalCue(name)?.title.length);
    assert.ok(fatalCue(name)?.art);
  }
  for(const name of ['released','deleted','escape'] as const)assert.equal(fatalCue(name),null);
});

test('fatality triggers once on actual transition, without altering deterministic replay', () => {
  let s=newGame(42,'ivo');
  let before=s;
  const choices=[
    {type:'choose',eventId:'arrival',choiceId:'follow'},
    {type:'choose',eventId:'revision',choiceId:'verify'},
    {type:'choose',eventId:'mirror',choiceId:'believe'},
    {type:'travel',to:'relay'},
    {type:'choose',eventId:'choir',choiceId:'harmonize'},
    {type:'choose',eventId:'cache',choiceId:'challenge'},
  ] as const;
  for(const a of choices){before=s;s=reduceGame(s,a);assert.equal(isNewFatality(before,s),s.phase==='ended');}
  for(let i=0;i<100&&s.phase==='combat';i++){
    before=s;s=reduceGame(s,{type:'combat',move:'guard'});
    assert.equal(isNewFatality(before,s),s.phase==='ended');
  }
  assert.equal(s.phase,'ended');
  assert.ok(fatalCue(s.ending));
  assert.deepEqual(replay(s.seed,s.investigator,s.actions),s);
});

test('visual feedback is derived from actions rather than modifying seeded game state',()=>{
  let s=newGame(12,'mara');
  const action={type:'choose' as const,eventId:'arrival',choiceId:'tear'};
  const next=reduceGame(s,action);
  const cue=describeMoment(s,next,action,1);
  assert.equal(cue?.kind,'page');
  assert.equal(s.turn,0);
  assert.deepEqual(replay(next.seed,next.investigator,next.actions),next);
});
