import { useEffect, useMemo, useState } from 'react';
import { ART, ENEMIES, EVENTS, INVESTIGATORS, ITEMS, LOCATIONS } from './game/content.ts';
import { availableEvents, canTravel, getQueueCost, MOVE_COST, QUEUE_BUDGET, skillChance, intentionalEnemyMove, newGame, reduceGame, replay, score } from './game/engine.ts';
import { clearRun, loadRun, loadScores, persistRun, storeScore } from './game/storage.ts';
import { ARTWORK, EVENT_ARTWORK, IMAGE_LABELS } from './game/art.ts';
import type { Action, ArchiveEvent, GameState, InvestigatorId, LocationId, MemoryId, FateId, WitnessId } from './game/types.ts';

type Panel = 'pages'|'inventory'|'log'|'scores';
const LOCATION_IDS: LocationId[] = ['index','relay','vault'];
const MEMORY_OPTIONS: {id:MemoryId;name:string;cost:string}[] = [
  {id:'name',name:'Your name',cost:'−3 vitality'},
  {id:'voice',name:'Your voice',cost:'−3 coherence'},
  {id:'warmth',name:'Your warmth',cost:'+3 trace'},
];
const WITNESS_OPTIONS: {id:WitnessId;name:string;theory:string;effect:string}[] = [
  {id:'mirror',name:'The Mirror Cache',theory:'The reader is the author',effect:'+1 coherence'},
  {id:'choir',name:'The Redundancy Choir',theory:'The author is a virus',effect:'−1 trace'},
  {id:'ledger',name:'The Ledger of Ash',theory:'The author is a debt',effect:'+1 vitality'},
];
const FATE_OPTIONS:{id:FateId;name:string;detail:string}[]=[
  {id:'delete',name:'DELETE THE AUTHOR',detail:'End its revision history forever'},
  {id:'release',name:'RELEASE THE AUTHOR',detail:'Give tomorrow a living witness'},
];
const ENDINGS:Record<string,{name:string;meaning:string}>={
  deleted:{name:'THE MARGIN IS EMPTY',meaning:'You deleted the uncreated author. The archive remembers the shape of what was lost.'},
  released:{name:'TOMORROW WALKS FREE',meaning:'You released the author. The archive no longer owns its future.'},
  escape:{name:'UNPLUGGED WITNESS',meaning:'You survived by disconnecting. Somewhere the document records your return.'},
  unmade:{name:'PROCESS TERMINATED',meaning:'You ran out of vitality. The archive files your remains as a temporary document.'},
  dissolved:{name:'COHERENCE LOST',meaning:'You forgot the boundary between reader and page.'},
  located:{name:'YOU HAVE BEEN FOUND',meaning:'Trace reached its limit. The archive has your exact address.'},
};
function StatBar({label,value,max,danger}:{label:string;value:number;max:number;danger?:boolean}){
  const pct=Math.round(value/max*100);
  return <div className="meter" aria-label={`${label} ${value} out of ${max}`}>
    <div className="meter-meta"><span>{label}</span><strong>{value}<span className="muted">/{max}</span></strong></div>
    <div className="meter-track"><div className={`meter-fill ${danger?'meter-danger':''}`} style={{width:`${pct}%`}}/></div>
  </div>;
}
function SceneArt({text,caption}:{text:string;caption?:string}){
  return <figure className="art-panel"><pre aria-label={caption||'ASCII illustration'}>{text}</pre>{caption&&<figcaption>{caption}</figcaption>}</figure>;
}
function ArchiveIllustration({src,alt,caption,compact=false}:{src:string;alt:string;caption:string;compact?:boolean}) {
  return <figure className={`illustration ${compact?'illustration-compact':''}`}>
    <img src={src} alt={alt} loading={compact?'eager':'lazy'} decoding="async"/>
    <figcaption><span>◈ ARCHIVE / IMAGE ATTACHMENT</span><span>{caption}</span></figcaption>
  </figure>;
}
function App(){
  const [savedAtStart] = useState(()=>loadRun());
  const [game,setGame]=useState<GameState|null>(savedAtStart);
  const [investigator,setInvestigator]=useState<InvestigatorId>('mara');
  const [seedInput,setSeedInput]=useState(()=>String(Math.floor(Math.random()*4294967295)));
  const [panel,setPanel]=useState<Panel>('pages');
  const [currentPage,setCurrentPage]=useState<string>('arrival');
  const [drawer,setDrawer]=useState(false);
  const [error,setError]=useState('');
  const [scores,setScores]=useState(loadScores);
  const [witness,setWitness]=useState<WitnessId>('mirror');
  const [memory,setMemory]=useState<MemoryId>('name');
  const [fate,setFate]=useState<FateId>('delete');
  const [copied,setCopied]=useState(false);

  useEffect(()=>{if(game){persistRun(game);if(game.phase==='ended')setScores(storeScore(game));}},[game]);
  const events=useMemo(()=>game?availableEvents(game):[],[game]);
  const selected=events.find(e=>e.id===currentPage) ?? events.find(e=>!game?.visited[e.id]) ?? events[0];
  const unvisited=events.filter(e=>!game?.visited[e.id]).length;
  const act=(action:Action)=>{
    if(!game)return;
    try{
      const next=reduceGame(game,action);
      setGame(next);setError('');
      if(action.type==='travel'){
        const dest=EVENTS.find(e=>e.location===action.to&&!next.visited[e.id]);
        setCurrentPage(dest?.id??EVENTS.find(e=>e.location===action.to)?.id??'arrival');
        setPanel('pages');setDrawer(false);
      }
      if(action.type==='choose')setCurrentPage(action.eventId);
    }catch(e){setError(e instanceof Error?e.message:'This revision was rejected.');}
  };
  const begin=()=>{
    const n=Number(seedInput);
    if(!Number.isInteger(n)||n<0||n>0xffffffff){setError('Seed must be a whole number from 0 to 4294967295.');return;}
    setGame(newGame(n,investigator));setCurrentPage('arrival');setPanel('pages');setError('');setDrawer(false);
  };
  const restart=()=>{
    if(game){setSeedInput(String(game.seed));setInvestigator(game.investigator);}
    clearRun();setGame(null);setError('');setPanel('pages');setDrawer(false);
  };
  const navigate=(to:LocationId)=>{
    if(game?.phase==='archive'&&game.location!==to&&canTravel(game,to))act({type:'travel',to});
    else if(game?.location===to){setPanel('pages');setDrawer(false);}
  };
  const copyLog=()=>{
    if(!game)return;
    const snapshot=JSON.stringify({version:game.version,seed:game.seed,investigator:game.investigator,actions:game.actions},null,2);
    void navigator.clipboard?.writeText(snapshot).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1800);}).catch(()=>setError('Clipboard permission denied.'));
  };
  const Sidebar=()=> <aside className="sidebar" aria-label="Archive navigation">
    <div className="identity"><div className="glyph">◈</div><div><div className="brand">TERMINAL<br/>OF HORRORS</div><div className="brand-sub">[ archive_online: false ]</div></div></div>
    <div className="sidebar-section">/ DIRECTORY</div>
    <button className={`nav-link ${panel==='pages'?'active':''}`} onClick={()=>{setPanel('pages');setDrawer(false);}}>↳ index <span>⌕</span></button>
    {LOCATION_IDS.map((loc,i)=><button key={loc} onClick={()=>navigate(loc)} disabled={!game||game.phase!=='archive'||(!canTravel(game,loc)&&loc!==game.location)} className={`nav-link indent ${game?.location===loc&&panel==='pages'?'active':''}`}><span>{i===0?'└':i===1?'├':'└'} {LOCATIONS[loc].slug}</span><span>{game&&(loc===game.location?'●':canTravel(game,loc)?'↗':'×')}</span></button>)}
    <div className="sidebar-section side-gap">/ DATABASE</div>
    <button className={`nav-link ${panel==='inventory'?'active':''}`} disabled={!game} onClick={()=>{setPanel('inventory');setDrawer(false);}}>relics / inventory <span>{game?.inventory.length??'—'}</span></button>
    <button className={`nav-link ${panel==='log'?'active':''}`} disabled={!game} onClick={()=>{setPanel('log');setDrawer(false);}}>transmissions / log <span>{game?.turn??'—'}</span></button>
    <button className={`nav-link ${panel==='scores'?'active':''}`} onClick={()=>{setPanel('scores');setDrawer(false);}}>incident reports <span>↗</span></button>
    <div className="sidebar-bottom"><span className="pulse"/> <span>ghostnet / local-only</span><span>v0.3.0 / ILLUSTRATED</span></div>
  </aside>;

  const displayPage=(event:ArchiveEvent)=>{
    const read=Boolean(game?.visited[event.id]);
    return <article className="content-sheet" key={event.id}>
      <div className="eyebrow">ARCHIVE DOCUMENT <span>//</span> {event.slug.toUpperCase()}</div>
      <div className="title-row"><h1>{event.title}</h1>{read&&<span className="tag committed">COMMITTED</span>}</div>
      <p className="lead">{event.excerpt}</p>
      <ArchiveIllustration src={EVENT_ARTWORK[event.id]??ARTWORK.locations[event.location]} alt={IMAGE_LABELS[event.encounter??event.location]??event.title} caption={`FILE / ${event.id.toUpperCase()}`}/>
      <details className="ascii-disclosure"><summary>VIEW ORIGINAL ASCII RECORD</summary><SceneArt text={event.art} caption="[ mirrored in plain text ]"/></details>
      <div className="document-block"><span className="block-label">RECOVERED TEXT</span><p>{event.body}</p></div>{read && game?.checks.find(check=>check.eventId===event.id) && (()=>{const check=game.checks.find(check=>check.eventId===event.id)!;return <div className={`check-result ${check.passed?'passed':'failed'}`}><strong>{check.passed?'✓ TEST PASSED':'× TEST FAILED'}</strong><span>{check.attribute.toUpperCase()} // D6 {check.roll} + {check.modifier} = {check.roll+check.modifier} / TARGET {check.target}</span></div>;})()}
      {event.witness&&read&&<div className="inline-note">◈ WITNESS REGISTERED: {WITNESS_OPTIONS.find(w=>w.id===event.witness)?.name.toUpperCase()}</div>}
      {!read && game?.phase==='archive'?<div className="choices"><div className="eyebrow">CHOOSE A REVISION <span>//</span> NO UNDO</div>{event.choices.map((c,i)=><button className="choice" key={c.id} onClick={()=>act({type:'choose',eventId:event.id,choiceId:c.id})}><span className="choice-letter">{String(i+1).padStart(2,'0')}</span><span className="choice-info"><strong>{c.text}</strong>{c.test&&<small>{c.test.attribute.toUpperCase()} CHECK · D6 + {game.attributes[c.test.attribute]} ≥ {c.test.target} · {Math.round(skillChance(game.attributes[c.test.attribute],c.test.target)*100)}% SUCCESS</small>}</span><span className="arrow">↗</span></button>)}</div>:<div className="read-state">{read?'✓ Entry committed to your personal history. Return to the index for more pages.':'This entry is not currently writable.'}</div>}
    </article>;
  };
  const Fight=()=>{
    if(!game?.combat)return null;
    const battle=game.combat;const enemy=ENEMIES[battle.enemy];
    const moves:{move:Extract<Action,{type:'combat'}>['move'];name:string;detail:string;disabled?:boolean;glyph:string}[]=[
      {move:'strike',name:'ATTACK',detail:'2 time · 3–5 damage · +1 trace',glyph:'⚔'},
      {move:'decode',name:'DECODE',detail:'3 time · 4–6 damage · −2 coherence',glyph:'⌘',disabled:game.stats.coherence < 2+2*battle.pendingMoves.filter(x=>x==='decode').length},
      {move:'guard',name:'DEFEND',detail:'2 time · halve incoming · +1 coherence',glyph:'◇'},
      {move:'ink',name:'RESTORE',detail:'1 time · +5 vitality',glyph:'✚',disabled:game.inventory.filter(x=>x==='ink').length<=battle.pendingMoves.filter(x=>x==='ink').length},
      {move:'seal',name:'SEAL',detail:'1 time · −3 trace',glyph:'◉',disabled:game.inventory.filter(x=>x==='seal').length<=battle.pendingMoves.filter(x=>x==='seal').length},
      {move:'flee',name:'RUN',detail:'4 time · 50% escape chance',glyph:'↗',disabled:battle.enemy==='author'||battle.pendingMoves.length>0},
    ];
    return <article className="content-sheet combat-sheet">
      <div className="eyebrow danger-text">! HOSTILE CONVERSATION // ROUND {battle.round} / FILE {battle.enemy.toUpperCase()}</div>
      <h1>{enemy.name}</h1><p className="lead">{enemy.flavor}</p>
      <div className="battle-stage">
        <ArchiveIllustration src={ARTWORK.enemies[battle.enemy]} alt={`${enemy.name}, an original archive horror creature`} caption="HOSTILE / IMAGE RECORD"/>
        <div className="battle-tactics">
          <div className="combat-hp"><span>HOSTILE INTEGRITY</span><b>{battle.health}/{enemy.maxHealth}</b><div className="meter-track"><div className="meter-fill hostile-fill" style={{width:`${battle.health/enemy.maxHealth*100}%`}}/></div></div>
          <div className="intent-box" role="status"><span className="block-label">! NEXT ENEMY ACTION / VISIBLE INTENT</span><strong>{intentionalEnemyMove(game)}</strong><small>The enemy acts once after you launch your sequence. Defend to soften the blow.</small></div>
          <div className="choices combat-choices"><div className="queue-heading"><div className="eyebrow">ACTION TIME / {getQueueCost(game)} OF {QUEUE_BUDGET}</div><small>Queue actions, then launch.</small></div>
            <div className="queue-pips" aria-label={`${getQueueCost(game)} of ${QUEUE_BUDGET} action time spent`}>{Array.from({length:QUEUE_BUDGET},(_,i)=><span key={i} className={i<getQueueCost(game)?'filled':''}/>)}</div>
            <div className="move-grid">{moves.map(m=><button key={m.move} className="move" disabled={m.disabled || getQueueCost(game)+MOVE_COST[m.move]>QUEUE_BUDGET || (battle.pendingMoves.includes('flee')&&m.move!=='flee')} onClick={()=>act({type:'queueCombat',move:m.move})}><strong><span className="move-glyph" aria-hidden="true">{m.glyph}</span>{m.name} <span className="move-cost">{MOVE_COST[m.move]}T</span></strong><small>{m.detail}</small></button>)}</div>
            <div className="queued-actions" aria-live="polite">{battle.pendingMoves.length?battle.pendingMoves.map((move,i)=><span key={i}>{String(i+1).padStart(2,'0')} {move.toUpperCase()}</span>):<span className="muted">Empty queue. Choose an action.</span>}</div>
            <div className="action-row launch-actions"><button className="primary" disabled={battle.pendingMoves.length===0} onClick={()=>act({type:'launchCombatQueue'})}>▶ EXECUTE ACTIONS</button><button className="secondary" disabled={battle.pendingMoves.length===0} onClick={()=>act({type:'clearCombatQueue'})}>CLEAR</button></div>
          </div>
        </div>
      </div>
    </article>;
  };
  const RitualPage=()=>game&&<article className="content-sheet"><div className="eyebrow danger-text">FORBIDDEN / LAST EDIT</div><h1>A signature written in advance.</h1><p className="lead">Three witnesses disagree. One of them must be trusted. One memory must be surrendered. The author is awake.</p>
    <ArchiveIllustration src={ARTWORK.enemies.author} alt="The Unauthored Revision, a towering figure of script pages" caption="FORBIDDEN / FINAL RECORD"/>
    <div className="ritual-stage"><div className="eyebrow">01 / SELECT YOUR WITNESS</div><div className="ritual-options">{WITNESS_OPTIONS.filter(w=>game.witnesses.includes(w.id)).map(w=><button key={w.id} className={`ritual-opt ${witness===w.id?'selected':''}`} onClick={()=>setWitness(w.id)}><strong>{w.name}</strong><small>{w.theory}</small><span>{w.effect}</span></button>)}</div></div>
    <div className="ritual-stage"><div className="eyebrow">02 / SACRIFICE A MEMORY</div><div className="ritual-options">{MEMORY_OPTIONS.map(m=><button key={m.id} className={`ritual-opt ${memory===m.id?'selected':''}`} onClick={()=>setMemory(m.id)}><strong>{m.name}</strong><small>Cannot be returned</small><span>{m.cost}</span></button>)}</div></div>
    <div className="ritual-stage"><div className="eyebrow">03 / THE ENTITY'S FATE</div><div className="ritual-options">{FATE_OPTIONS.map(f=><button key={f.id} className={`ritual-opt ${fate===f.id?'selected':''}`} onClick={()=>setFate(f.id)}><strong>{f.name}</strong><small>{f.detail}</small></button>)}</div></div>
    <button className="primary wide" onClick={()=>act({type:'beginRitual',ritual:{witness,memory,fate}})}>SIGN THE PACT → ENTER FINAL ENCOUNTER</button>
  </article>;
  const EndingPage=()=>game&&game.ending&&<article className="content-sheet"><div className="eyebrow">INCIDENT REPORT // CLOSED</div><h1>{ENDINGS[game.ending]?.name??'ARCHIVE CLOSED'}</h1><p className="lead">{ENDINGS[game.ending]?.meaning}</p><SceneArt text={String.raw`  +-----------------------------+
  |    TERMINAL   /   CLOSED   |
  |                             |
  |  WITNESSES: ${String(game.witnesses.length).padEnd(2)}              |
  |  REVISIONS: ${String(Object.keys(game.visited).length).padEnd(2)}              |
  |  TRACE:     ${String(game.stats.trace).padEnd(2)}              |
  |                             |
  |       [ END OF FILE ]       |
  +-----------------------------+`} caption="[ reconstructed incident artifact ]"/>
    <div className="summary-grid"><div><span>FINAL SCORE</span><b>{score(game).toLocaleString()}</b></div><div><span>RUN SEED</span><b>{game.seed}</b></div><div><span>ACTIONS</span><b>{game.turn}</b></div><div><span>WITNESSES</span><b>{game.witnesses.length}/3</b></div><div><span>HOSTILES CLEARED</span><b>{game.cleared.length}/3</b></div><div><span>ENDING</span><b>{game.ending}</b></div></div>
    <div className="inline-note">Scores are stored only in this browser. No online leaderboard, tokens, or rewards exist.</div><div className="action-row"><button className="primary" onClick={restart}>BEGIN NEW CASE ↗</button><button className="secondary" onClick={()=>setPanel('scores')}>VIEW LOCAL SCORES</button><button className="secondary" onClick={()=>setPanel('log')}>INCIDENT LOG</button></div>
  </article>;
  const InventoryPage=()=>game&&<article className="content-sheet"><div className="eyebrow">RELICS / PHYSICAL INDEX</div><h1>Items that remember you.</h1><p className="lead">Artifacts recovered by this investigator. Consumables are used during hostile conversations.</p><div className="artifact-list">{game.inventory.length?game.inventory.map((id,i)=><div key={`${id}-${i}`} className="artifact"><span className="relic-symbol">{ITEMS[id].mark}</span><div><strong>{ITEMS[id].name}</strong><p>{ITEMS[id].effect}</p></div></div>):<p className="muted">No artifacts remain in your possession.</p>}</div><div className="eyebrow with-space">WITNESS REGISTRY / {game.witnesses.length} OF 3</div>{WITNESS_OPTIONS.map(w=><div className="witness-row" key={w.id}><span>{game.witnesses.includes(w.id)?'✓':'○'}</span><div><strong>{w.name}</strong><small>{w.theory}</small></div></div>)}</article>;
  const JournalPage=()=>game&&<article className="content-sheet"><div className="eyebrow">TRANSMISSIONS / REPLAYABLE HISTORY</div><h1>Every action leaves a signature.</h1><p className="lead">Seed {game.seed}. The same investigator, seed, and ordered actions reconstruct the same state.</p><div className="action-row"><button className="secondary" onClick={copyLog}>{copied?'COPIED ✓':'COPY REPLAY JSON'}</button><button className="secondary" onClick={()=>{try{const r=replay(game.seed,game.investigator,game.actions);setError(JSON.stringify(r)===JSON.stringify(game)?'Replay verified: exact state match.':'Replay mismatch detected.');}catch(e){setError(String(e));}}}>VERIFY REPLAY</button></div><ol className="journal">{game.journal.length?game.journal.slice().reverse().map(x=><li key={x.n}><span>#{String(x.n).padStart(3,'0')}</span><div>{x.line}<small>V {x.after.vitality} · C {x.after.coherence} · T {x.after.trace} · {x.after.phase}</small></div></li>):<li>NO ACTIONS RECORDED YET</li>}</ol></article>;
  const ScoresPage=()=> <article className="content-sheet"><div className="eyebrow">LOCAL ARCHIVE / PERSONAL RECORDS</div><h1>Incident reports.</h1><p className="lead">Scores from this device only. There is no shared leaderboard or crypto payout.</p><div className="score-table" role="table" aria-label="Local score history"><div className="score-row score-head" role="row"><span>RANK</span><span>INVESTIGATOR</span><span>OUTCOME</span><span>SCORE</span></div>{scores.length?scores.map((x,i)=><div key={x.id} className="score-row" role="row"><span>{String(i+1).padStart(2,'0')}</span><span>{INVESTIGATORS[x.investigator]?.name??x.investigator}<small>{x.turns} actions · seed {x.seed}</small></span><span>{x.ending}</span><strong>{x.score}</strong></div>):<p className="empty-state">No incident reports have been filed. Your first ending will appear here.</p>}</div></article>;

  return <div className="app-shell">
    <div className="mobile-bar"><button className="menu-toggle" onClick={()=>setDrawer(!drawer)} aria-label={drawer?'Close navigation':'Open navigation'} aria-expanded={drawer}>{drawer?'×':'☰'}</button><span>TERMINAL / OF HORRORS</span><span className="online-indicator">● LOCAL</span></div>
    <div className={`nav-overlay ${drawer?'visible':''}`} onClick={()=>setDrawer(false)}/><div className={`nav-container ${drawer?'open':''}`}>{Sidebar()}</div>
    <main className="workspace"><header className="topline"><span>ROOT / {game?LOCATIONS[game.location].slug:'START'}</span><span>{game?`SEED ${game.seed} · ${game.phase.toUpperCase()}`:'UNREGISTERED READER'}</span></header>
      {!game?<div className="setup-view"><div className="intro-grid"><div className="intro-text"><div className="intro-mark">CASE 001 <span>✳</span> INDEXED: TOMORROW</div><h1 className="hero-title">A PERSONAL WIKI<br/><em>THAT IS</em><br/>READING YOU<span className="blink">_</span></h1><p className="setup-copy">THE PAGE THAT REMEMBERS TOMORROW. You enter an abandoned machine intelligence. Its newest document already knows what you will do next.</p><div className="intro-terminal">&gt; USER DETECTED<br/>&gt; AUTHOR: NOT YET CREATED<br/>&gt; EVENT LOG: TOMORROW<br/><span>_</span></div></div><ArchiveIllustration src={ARTWORK.cover} alt="Terminal of Horrors: a haunted black and white AI archive" caption="CASE 001 / FRONTISPIECE"/></div><div className="eyebrow">SELECT AN INVESTIGATOR</div><div className="character-grid">{(Object.keys(INVESTIGATORS) as InvestigatorId[]).map(id=>{const c=INVESTIGATORS[id];return <button key={id} className={`character-card ${investigator===id?'selected':''}`} onClick={()=>setInvestigator(id)} aria-pressed={investigator===id}><img src={ARTWORK.investigators[id]} alt={`${c.name}, ${c.role}`} loading="eager" className="character-portrait"/><span className="character-index">0{id==='mara'?'1':'2'} / {c.role}</span><strong>{c.name}</strong><p>{c.epitaph}</p><small>{c.perk}</small><div className="investigator-attributes">PER {c.attributes.perception} · KNO {c.attributes.knowledge} · NRV {c.attributes.nerve}</div></button>;})}</div><label className="seed-label" htmlFor="seed">ARCHIVE SEED / REPRODUCIBLE RUN</label><input id="seed" type="number" min="0" max="4294967295" step="1" value={seedInput} onChange={(e:{target:{value:string}})=>setSeedInput(e.target.value)} /><button className="primary start-btn" onClick={begin}>ENTER THE ARCHIVE <span>↗</span></button><p className="disclaimer">ORIGINAL FICTION · NO WALLET REQUIRED · SAVED LOCALLY</p>{savedAtStart&&<p className="muted">Previous save restored automatically when available.</p>}</div>:
      <div className="play-container"><div className="mobile-stats" aria-label="Current investigator statistics"><span>VITALITY <b>{game.stats.vitality}/{game.stats.maxVitality}</b></span><span>COHERENCE <b>{game.stats.coherence}/{game.stats.maxCoherence}</b></span><span>TRACE <b>{game.stats.trace}/10</b></span></div><div className="play-layout"><section className="main-column">
        {game.phase==='combat'?Fight():game.phase==='ritual'?RitualPage():game.phase==='ended'&&panel==='pages'?<EndingPage/>:panel==='inventory'?<InventoryPage/>:panel==='log'?<JournalPage/>:panel==='scores'?<ScoresPage/>:
        <><div className="location-header"><span>{LOCATIONS[game.location].depth}</span><h2>{LOCATIONS[game.location].name}</h2><p>{LOCATIONS[game.location].blurb}</p><ArchiveIllustration src={ARTWORK.locations[game.location]} alt={`${LOCATIONS[game.location].name}, an impossible haunted AI archive location`} caption={`LOCATION / ${game.location.toUpperCase()}`} compact/><details className="ascii-disclosure location-ascii"><summary>ASCII SCHEMATIC</summary><SceneArt text={ART[game.location]}/></details></div><div className="page-index"><div className="eyebrow">INVESTIGATION PROGRESS / {Object.keys(game.visited).length} OF {EVENTS.length} ENTRIES · {unvisited} UNREAD</div><div className="progress-track"><div style={{width:`${100*Object.keys(game.visited).length/EVENTS.length}%`}}/></div><div className="page-links">{events.map(e=><button className={`page-chip ${selected?.id===e.id?'selected':''} ${game.visited[e.id]?'read':''}`} key={e.id} onClick={()=>setCurrentPage(e.id)}><span>{game.visited[e.id]?'✓':'□'}</span> {e.slug}</button>)}</div></div>{selected?displayPage(selected):<p className="empty-state">The next page has not been indexed yet.</p>}</>}
        {error&&<div className="error-box" role="status">{error}<button onClick={()=>setError('')} aria-label="Dismiss message">×</button></div>}
      </section><aside className="status-column"><div className="stat-card"><div className="eyebrow">READING SESSION / {game.investigator.toUpperCase()}</div><h3>{INVESTIGATORS[game.investigator].name}</h3><img className="status-portrait" src={ARTWORK.investigators[game.investigator]} alt={`${INVESTIGATORS[game.investigator].name} portrait`}/><StatBar label="VITALITY" value={game.stats.vitality} max={game.stats.maxVitality}/><StatBar label="COHERENCE" value={game.stats.coherence} max={game.stats.maxCoherence}/><StatBar label="TRACE" value={game.stats.trace} max={10} danger/><p className="meter-help">At 0 vitality, 0 coherence, or 10 trace, this run ends.</p></div>
        <div className="stat-card small-card"><div className="eyebrow">LAST TRANSMISSION</div><p className="transmission">{game.message}</p><div className="small-meta">REVISION #{String(game.turn).padStart(3,'0')}</div></div>
        <div className="stat-card small-card"><div className="eyebrow">CASE STATUS</div><div className="case-row"><span>Witnesses</span><strong>{game.witnesses.length}/3</strong></div><div className="case-row"><span>Hostiles</span><strong>{game.cleared.length}/3</strong></div><div className="case-row"><span>Documents</span><strong>{Object.keys(game.visited).length}/10</strong></div><div className="case-row"><span>Skill checks</span><strong>{game.checks.filter(c=>c.passed).length}/{game.checks.length} passed</strong></div><div className="case-row"><span>Score</span><strong>{score(game)}</strong></div><div className="attr-summary"><span>PER {game.attributes.perception}</span><span>KNO {game.attributes.knowledge}</span><span>NRV {game.attributes.nerve}</span></div></div>
        {game.phase==='archive'&&game.witnesses.length>0&&<button className="disconnect" onClick={()=>act({type:'disconnect'})}>⏻ DISCONNECT / ESCAPE RUN</button>}
        <button className="reset-link" onClick={()=>{if(window.confirm('End this run and begin a new investigation?'))restart();}}>↻ RESTART NEW RUN</button>
      </aside></div></div>}
      {!game&&panel==='scores'&&<ScoresPage/>}<footer>TERMINAL OF HORRORS <span>//</span> NO EXTERNAL SIGNAL DETECTED <span>//</span> EVERYTHING HERE IS FICTIONAL</footer>
    </main>
  </div>;
}
export default App;
