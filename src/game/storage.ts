import { replay, score } from './engine.ts';
import type { GameState, InvestigatorId } from './types.ts';
const SAVE_KEY='terminal-of-horrors/save/v2';
const SCORES_KEY='terminal-of-horrors/scores/v1';
export type ScoreEntry={id:string;date:string;investigator:InvestigatorId;seed:number;ending:string;score:number;turns:number};
const validState=(value:unknown):value is GameState=>{
 if(!value||typeof value!=='object')return false;
 const s=value as GameState;
 if(s.version!==2||!Number.isInteger(s.seed)||!Array.isArray(s.actions)||s.actions.length>1000)return false;
 try {return JSON.stringify(replay(s.seed,s.investigator,s.actions))===JSON.stringify(s);}catch{return false;}
};
export function loadRun():GameState|null{
 try {const raw=localStorage.getItem(SAVE_KEY);if(!raw)return null;const data=JSON.parse(raw) as {version:number;state:unknown};return data.version===2&&validState(data.state)?data.state:null;}catch{return null;}
}
export function persistRun(s:GameState){try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:2,state:s}));}catch{/* storage disabled/private mode */}}
export function clearRun(){try{localStorage.removeItem(SAVE_KEY);}catch{/* storage disabled */}}
export function loadScores():ScoreEntry[]{try{const data=JSON.parse(localStorage.getItem(SCORES_KEY)??'[]') as unknown;return Array.isArray(data)?data.filter((x):x is ScoreEntry=>!!x&&typeof x==='object'&&typeof x.id==='string'&&typeof x.score==='number').slice(0,20):[];}catch{return[];}}
export function storeScore(s:GameState):ScoreEntry[]{
 const prior=loadScores();if(s.phase!=='ended'||!s.ending)return prior;
 const id=`${s.seed}:${s.investigator}:${JSON.stringify(s.actions)}`;
 if(prior.some(x=>x.id===id))return prior;
 const next=[{id,date:new Date().toISOString(),investigator:s.investigator,seed:s.seed,ending:s.ending,score:score(s),turns:s.turn},...prior].sort((a,b)=>b.score-a.score).slice(0,20);
 try{localStorage.setItem(SCORES_KEY,JSON.stringify(next));}catch{/* storage disabled */}
 return next;
}
