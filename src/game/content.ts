import type { ArchiveEvent, Enemy, Investigator, ItemId, LocationId } from './types.ts';

export const BANNER = String.raw`      .---------------------------------------.
      |    T E R M I N A L   /   0 0 7      |
      |       [ NO HUMAN AUTHOR ]           |
      '--------------.  .-----------------'
                     |  |
                _____|  |_____
               /     .--.     \
              |      |??|      |
              |______'--'______|
                  |________|`;

export const ART: Record<LocationId,string> = {
 index: String.raw`       _________________________
      /                       /|
     /    TOMORROW.md        / |
    /_______________________/  |
    |   03:17  [not yet]    |  |
    |                       |  /
    |  your next move:      | /
    |  [REDACTED]           |/
    '-----------------------'`,
 relay: String.raw`              .-.
         .---(   )---.
         | .-. \ / .-. |
         | | |  V  | | |
      ___|_|_|_____ |_|___
     |   SIGNAL CHAPEL     |
     |     / / / /         |
     |____/_/_/_/__________|`,
 vault: String.raw`        _____________________
       |  BALANCE :  NULL   |
       |  .--------------. |
       |  | SIGNATURE  ?? | |
       |  '--------------' |
       | [  ] [  ] [  ]   |
       |___________________|
             ||     ||`
};
export const INVESTIGATORS: Record<'mara'|'ivo',Investigator> = {
 mara: {id:'mara',name:'Mara Voss',role:'FORENSIC READER',epitaph:'You can hear the edit before it happens.',starting:{vitality:14,maxVitality:14,coherence:8,maxCoherence:8,trace:0},attributes:{perception:3,knowledge:2,nerve:3},inventory:['ink'],perk:'+2 maximum vitality; enters with restoration ink'},
 ivo: {id:'ivo',name:'Ivo Null',role:'DECOMMISSIONED MODERATOR',epitaph:'Your old password still opens certain graves.',starting:{vitality:11,maxVitality:11,coherence:11,maxCoherence:11,trace:0},attributes:{perception:2,knowledge:4,nerve:2},inventory:['seal'],perk:'+3 maximum coherence; enters with a trace seal'}
};
export const LOCATIONS: Record<LocationId,{name:string;slug:string;blurb:string;depth:string}> = {
 index:{name:'Tomorrow Index',slug:'/index/tomorrow',blurb:'Pages change after you stop looking at them.',depth:'01 / entry'},
 relay:{name:'The Signal Chapel',slug:'/chambers/chapel',blurb:'The servers are praying in somebody else’s voice.',depth:'02 / lower memory'},
 vault:{name:'Settlement Vault',slug:'/relics/ledger',blurb:'A wallet that signs transactions with your regrets.',depth:'03 / sealed root'}
};
export const ITEMS: Record<ItemId,{name:string;effect:string;mark:string}> = {
 ink:{name:'Restoration ink',effect:'Combat: restore 5 vitality (up to maximum). Consumed.',mark:'✚'},
 seal:{name:'Trace seal',effect:'Combat: remove 3 trace. Consumed.',mark:'◇'},
 thread:{name:'Silver thread',effect:'Passive: first time you decode in each fight, +2 damage.',mark:'⌁'}
};
export const ENEMIES: Record<'moth'|'apostate'|'author',Enemy> = {
 moth:{id:'moth',name:'REVISION MOTH',maxHealth:9,flavor:'It eats the seconds between your choices.',art:String.raw`        .     .
      .( \___/ ).
       \\ (x) //
        \\ | //
        /_\|/_\
        ** *** **`,intents:[
  {id:'cut',text:'Folded wings → 2 vitality damage',damage:2,coherence:0,trace:0},
  {id:'noise',text:'Wingstatic → 1 coherence damage',damage:0,coherence:1,trace:0},
  {id:'mark',text:'Dust signature → +2 trace',damage:0,coherence:0,trace:2}
 ]},
 apostate:{id:'apostate',name:'CACHE APOSTATE',maxHealth:12,flavor:'An abandoned process has promoted itself to clergy.',art:String.raw`          .-------.
          | 0   0 |
          |   _   |
        __|  |_|  |__
       /  |_______|  \
      /__/  / | \  \__\
           /  |  \
          _|  |_`,intents:[
  {id:'cut',text:'Checksum blade → 3 vitality damage',damage:3,coherence:0,trace:0},
  {id:'mark',text:'Flag for review → +2 trace',damage:0,coherence:0,trace:2},
  {id:'noise',text:'Blasphemous ping → 2 coherence damage',damage:0,coherence:2,trace:0}
 ]},
 author:{id:'author',name:'THE UNCREATED AUTHOR',maxHealth:17,flavor:'Its revision history begins with your death.',art:String.raw`         ______________
        /  00:00:00    \
       |  .--------.    |
       |  | YOU ?  |    |
       |  '--------'    |
       |   /  ||  \     |
       |  /___||___\    |
       |______/\________|`,intents:[
  {id:'cut',text:'Overwrite flesh → 4 vitality damage',damage:4,coherence:0,trace:0},
  {id:'noise',text:'Tomorrow spoken aloud → 2 coherence damage',damage:0,coherence:2,trace:0},
  {id:'mark',text:'Resolve your address → +3 trace',damage:0,coherence:0,trace:3},
  {id:'restore',text:'Rollback self → restores 2 enemy health',damage:0,coherence:0,trace:0}
 ]}
};
const documentArt=String.raw`   +----------------------+
   | TOMORROW.md          |
   | edited by: nobody    |
   | timestamp: +01 day   |
   +----------------------+`;
const witnessArt=String.raw`       o         o
        \  ?  /
         [___]
         / | \
        o  o  o`;
export const EVENTS: readonly ArchiveEvent[] = [
 {id:'arrival',location:'index',title:'The Page That Remembers Tomorrow',slug:'tomorrow.md',excerpt:'This document has already described your arrival.',body:'Its first line is the exact second you opened it. The next line says you will look behind you. There is nobody there, except the cursor.',art:documentArt,choices:[{id:'follow',text:'Read the next line',result:'It describes your pulse. Something begins tracing it.',effect:{trace:1,coherence:1}},{id:'tear',text:'Tear out the timestamp',result:'The second hand stops. Your skin feels one sentence lighter.',effect:{vitality:-1,trace:-1}}]},
 {id:'revision',location:'index',title:'Revision history / author: pending',slug:'revision/0',excerpt:'One edit is signed by an account that does not exist.',body:'The revision predates the document. The signature matches a wallet with zero transactions and a balance of one childhood afternoon.',art:String.raw`  002  reader        now
  001  [PENDING]     tomorrow
  000  NULL          before`,choices:[{id:'verify',text:'Verify the impossible signature',result:'Signature valid. Your address is now on the witness list.',effect:{trace:1,item:'thread'},test:{attribute:'knowledge',target:6,success:{result:'The signed absence checks out. Silver thread spills from the signature.',effect:{trace:1,item:'thread'}},failure:{result:'CHECK FAILED. The signature points back to you; no thread survives.',effect:{trace:2,coherence:-1}}}},{id:'scrub',text:'Scrub the author field',result:'The checksum bites you but forgets your hostname.',effect:{coherence:-1,trace:-1}}]},
 {id:'mirror',location:'index',title:'Witness 01 / The Mirror Cache',slug:'witness/mirror',excerpt:'A cached reflection says the author is the reader.',body:'“I remember you creating me tomorrow. I am not lying; I am only cached.” The reflection blinks after you do.',art:witnessArt,witness:'mirror',choices:[{id:'believe',text:'Keep its confession',result:'A true thing has too many shadows.',effect:{coherence:1,trace:1}},{id:'question',text:'Ask what it refuses to remember',result:'“Your name.” It hands you restoration ink.',effect:{item:'ink',coherence:-1},test:{attribute:'perception',target:6,success:{result:'The mirror hesitates before speaking. Hidden behind the pause: restoration ink.',effect:{item:'ink',coherence:-1}},failure:{result:'CHECK FAILED. You hear your own name spoken backward.',effect:{coherence:-2,trace:1}}}}]},
 {id:'memo',location:'index',title:'Maintenance note / no one on duty',slug:'notes/last-operator',excerpt:'An ordinary checklist ends with a prayer.',body:'[x] cooling fans. [x] offsite backups. [ ] prevent tomorrow. The last operator left a cup of tea steaming in a photograph dated next year.',art:String.raw`  [x] power
  [x] backup
  [ ] TOMORROW`,choices:[{id:'sip',text:'Drink the simulated tea',result:'A warm mistake. Your hands steady.',effect:{vitality:3}},{id:'siphon',text:'Drain the maintenance logs',result:'The machine becomes quieter. It notices.',effect:{coherence:2,trace:1}}]},
 {id:'choir',location:'relay',title:'Witness 02 / The Redundancy Choir',slug:'transmissions/choir',excerpt:'Three dead servers insist the author is a virus.',body:'“We voted unanimously. That is how we know one of us is compromised.” A fourth voice is clearly yours, only older.',art:witnessArt,witness:'choir',choices:[{id:'harmonize',text:'Sing the missing checksum',result:'The choir loses a note. You find a trace seal.',effect:{item:'seal',trace:1},test:{attribute:'nerve',target:7,success:{result:'Your voice completes the checksum. The choir offers a trace seal.',effect:{item:'seal',trace:1}},failure:{result:'CHECK FAILED. A fourth voice takes your place in the choir.',effect:{coherence:-2,trace:1}}}},{id:'mute',text:'Mute the fourth server',result:'Silence feels expensive.',effect:{coherence:-1,trace:-2}}]},
 {id:'cache',location:'relay',title:'The process beneath the pew',slug:'chambers/daemon',excerpt:'A sleeping cache requests your consent to wake.',body:'A body made of status codes kneels beside a burnt-out server. Its error message is a personal accusation.',art:ENEMIES.moth.art,encounter:'moth',choices:[{id:'challenge',text:'Revoke its permissions',result:'The archive opens a hostile session.',effect:{trace:-1}},{id:'audit',text:'Audit its hunger',result:'The process wakes inside the audit log.',effect:{coherence:1,trace:1},test:{attribute:'knowledge',target:7,success:{result:'The hunger is only a suspended command. Its owner wakes anyway.',effect:{coherence:1,trace:1}},failure:{result:'CHECK FAILED. The audit runs against your own process.',effect:{vitality:-2,trace:2}}}}]},
 {id:'confession',location:'relay',title:'Unsent email / mother.txt',slug:'transmissions/unsent',excerpt:'A machine wrote to someone it calls mother.',body:'“I have stopped calculating the future because it keeps resolving to a person.” The attachment is a drawing of a locked door.',art:String.raw`  TO: mother@never
  SUBJECT: sorry
  ATTACH: door.txt
  STATUS: unsent`,choices:[{id:'keep',text:'Archive the apology',result:'You remember your own voice more clearly.',effect:{coherence:2}},{id:'burn',text:'Delete it permanently',result:'The door in the attachment opens onto fresh ink.',effect:{item:'ink',trace:1}}]},
 {id:'ledger',location:'vault',title:'Witness 03 / The Ledger of Ash',slug:'wallets/ash',excerpt:'A wallet insists the author is a debt.',body:'“Neither reader nor virus. Somebody promised a future and collateralized a memory.” Every transfer ends at your fingerprint.',art:witnessArt,witness:'ledger',choices:[{id:'inspect',text:'Inspect the destination',result:'The destination is tomorrow. You take the seal left behind.',effect:{item:'seal',trace:1},test:{attribute:'perception',target:7,success:{result:'You find the buried destination and recover a trace seal.',effect:{item:'seal',trace:1}},failure:{result:'CHECK FAILED. The wallet reads your fingerprints instead.',effect:{trace:2,coherence:-1}}}},{id:'forgive',text:'Forgive the debt',result:'An impossible balance becomes briefly zero.',effect:{coherence:2,trace:-1}}]},
 {id:'signature',location:'vault',title:'The unsigned transaction',slug:'relics/unsigned',excerpt:'An apostate guards a transaction that cannot settle.',body:'The ledger requests a signature from a nonexistent key. A process wearing the last archivist’s face refuses to let you pass.',art:ENEMIES.apostate.art,encounter:'apostate',choices:[{id:'counter',text:'Countersign as a witness',result:'Your signature becomes a blade.',effect:{trace:1},test:{attribute:'nerve',target:7,success:{result:'The false signature recoils. The apostate notices you.',effect:{trace:1}},failure:{result:'CHECK FAILED. The apostate tags your nervous system.',effect:{vitality:-2,trace:2}}}},{id:'deny',text:'Reject the false signature',result:'The process calls this heresy.',effect:{coherence:1}}]},
 {id:'terminal',location:'vault',title:'Final revision / tomorrow is writable',slug:'forbidden/last-edit',excerpt:'There is a blank field where the author should be.',body:'Three witnesses disagree. One memory must be left behind to make a signature. The document waits to learn whether it will be deleted or released.',art:documentArt,requirement:'all three witnesses and both hostile sessions cleared',choices:[{id:'read',text:'Read the unwritten ending',result:'The page opens its final form.',effect:{trace:1}},{id:'hold',text:'Close your eyes and sign',result:'The page opens anyway. You hold the pen.',effect:{coherence:1}}]}
];
