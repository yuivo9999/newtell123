/** v47 Event Ledger. Pure/browser-independent record of what actually happened. */
'use strict';

export const EVENT_LEDGER_VERSION = 1;
export const EVENT_TYPES = Object.freeze(['SCENE','ACTION','REVELATION','RELATION_CHANGE','STATE_CHANGE','DEATH','MOVE','DECISION','CONFLICT','OTHER']);

const text=v=>String(v==null?'':v).trim();
const arr=(v,max=24)=>Array.isArray(v)?v.map(text).filter(Boolean).slice(0,max):[];

export function normalizeEvent(input={}, defaults={}){
  const x={...(input||{})};
  return {
    id:text(x.id)||`evt_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    version:EVENT_LEDGER_VERSION,
    chapterId:Number(x.chapterId||defaults.chapterId)||null,
    sceneId:text(x.sceneId||defaults.sceneId),
    type:EVENT_TYPES.includes(x.type)?x.type:'OTHER',
    time:text(x.time||defaults.time),
    actors:arr(x.actors,16),
    summary:text(x.summary),
    causes:arr(x.causes,16),
    effects:arr(x.effects,24),
    evidence:Array.isArray(x.evidence)?x.evidence.slice(0,8):[],
    authority:x.authority,
    status:text(x.status)||'PROPOSED',
    ts:Number(x.ts)||Date.now(),
  };
}

export function validateEvent(input={}){
  const x=normalizeEvent(input), issues=[];
  if(x.version!==EVENT_LEDGER_VERSION) issues.push({code:'EVENT_VERSION',severity:'fail'});
  if(!x.chapterId) issues.push({code:'EVENT_CHAPTER_MISSING',severity:'fail'});
  if(!x.summary) issues.push({code:'EVENT_SUMMARY_MISSING',severity:'fail'});
  if(x.status==='COMMITTED' && !x.evidence.length) issues.push({code:'EVENT_EVIDENCE_MISSING',severity:'fail'});
  return {status:issues.some(i=>i.severity==='fail')?'FAIL':issues.length?'WARN':'PASS',issues,event:x};
}

export function normalizeEventLedger(input=[], defaults={}){ return input.map((x,i)=>normalizeEvent(x,{...defaults,index:i})); }
export function appendEvent(ledger=[], event={}, defaults={}){
  const x=normalizeEvent(event,defaults), check=validateEvent(x);
  if(check.status==='FAIL') throw new Error(`EVENT_INVALID:${check.issues.map(i=>i.code).join(',')}`);
  const next=[...ledger,x];
  return {ledger:next,event:x};
}
export function findChapterEvents(ledger=[], chapterId){ return ledger.filter(x=>Number(x.chapterId)===Number(chapterId)); }
