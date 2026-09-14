/** v49 Novel Runtime orchestration: proposal -> validation -> commit with append-only identity/order guards. Pure core. */
'use strict';
import { normalizeEvent, validateEvent } from './event-ledger.js';
import { normalizeKnowledge, validateKnowledge, validateKnowledgeTransition } from './knowledge-contract.js';
import { normalizeStateTransition, validateStateTransition } from './state-transition.js';
import { normalizeCausalLink, validateCausalGraph, detectCausalCycle } from './causality-contract.js';
import { normalizeForeshadow, validateForeshadowing, canTransitionForeshadow } from './foreshadowing-contract.js';
import { validateObservedState } from './state-contract.js';

export const NOVEL_RUNTIME_VERSION=2;

const text=v=>String(v==null?'':v).trim();
const chapterNo=v=>Number.isFinite(Number(v)) ? Number(v) : null;
const maxChapter=runtime=>Math.max(0,...['events','knowledge','transitions','causality','foreshadowing'].flatMap(k=>(runtime?.[k]||[]).map(x=>chapterNo(x.chapterId)||0)));

function sameStableRecord(a,b,fields){ return fields.every(k=>JSON.stringify(a?.[k])===JSON.stringify(b?.[k])); }

function validateIdentityCollisions(previous, next, key, fields, code){
  const old=new Map((previous?.[key]||[]).map(x=>[text(x.id),x]));
  const issues=[];
  for(const x of next?.[key]||[]){
    const id=text(x.id), prior=old.get(id);
    if(prior && id && !sameStableRecord(prior,x,fields)) issues.push({code,severity:'fail',id});
  }
  return issues;
}
export function normalizeRuntimePacket(packet={},defaults={}){
  const x=packet||{};
  return {version:NOVEL_RUNTIME_VERSION,chapterId:Number(x.chapterId||defaults.chapterId)||null,events:Array.isArray(x.events)?x.events.map(e=>normalizeEvent(e,defaults)):[],knowledge:Array.isArray(x.knowledge)?x.knowledge.map(k=>normalizeKnowledge(k,defaults)):[],transitions:Array.isArray(x.transitions)?x.transitions.map(t=>normalizeStateTransition(t,defaults)):[],causality:Array.isArray(x.causality)?x.causality.map(c=>normalizeCausalLink(c,defaults)):[],foreshadowing:Array.isArray(x.foreshadowing)?x.foreshadowing.map(f=>normalizeForeshadow(f,defaults)):[]};
}
export function validateRuntimePacket(packet={},previous={}){
  const p=normalizeRuntimePacket(packet,{chapterId:packet.chapterId});
  const issues=[];
  const ev=p.events.map(x=>validateEvent(x));
  const kn=p.knowledge.map(x=>validateKnowledge(x));
  const tr=p.transitions.map(x=>validateStateTransition(x));
  ev.concat(kn,tr).forEach(r=>issues.push(...r.issues));
  const cg=validateCausalGraph(p.causality); issues.push(...cg.issues);
  const cyc=detectCausalCycle(p.causality);
  if(cyc.status==='FAIL') issues.push({code:cyc.code,severity:'fail'});
  issues.push(...validateForeshadowing(p.foreshadowing).issues);

  const priorMax=maxChapter(previous);
  const incomingChapters=[...p.events,...p.knowledge,...p.transitions,...p.causality,...p.foreshadowing].map(x=>chapterNo(x.chapterId)).filter(x=>x!=null);
  const incomingMin=incomingChapters.length?Math.min(...incomingChapters):null;
  if(incomingMin!=null && incomingMin < priorMax){
    issues.push({code:'RUNTIME_CHAPTER_OUT_OF_ORDER',severity:'fail',from:priorMax,to:incomingMin});
  }

  issues.push(...validateIdentityCollisions(previous,p,'events',['chapterId','sceneId','type','time','actors','summary','causes','effects'],'RUNTIME_EVENT_ID_REWRITE'));
  issues.push(...validateIdentityCollisions(previous,p,'knowledge',['factId','holder','status','sourceChapter','sourceScene','evidence'],'RUNTIME_KNOWLEDGE_ID_REWRITE'));
  issues.push(...validateIdentityCollisions(previous,p,'transitions',['chapterId','entity','field','from','to','causeEventId','evidence'],'RUNTIME_TRANSITION_ID_REWRITE'));
  issues.push(...validateIdentityCollisions(previous,p,'causality',['from','to','type','chapterId','evidence'],'RUNTIME_CAUSAL_ID_REWRITE'));
  issues.push(...validateIdentityCollisions(previous,p,'foreshadowing',['chapterId','summary','status','payoffChapter'],'RUNTIME_FORESHADOW_ID_REWRITE'));

  const previousForeshadowing=Array.isArray(previous.foreshadowing)?previous.foreshadowing:[];
  for(const f of p.foreshadowing){ const old=previousForeshadowing.find(x=>x.id===f.id); if(old && !canTransitionForeshadow(old.status,f.status)) issues.push({code:'FORESHADOW_INVALID_TRANSITION',severity:'fail',from:old.status,to:f.status,id:f.id}); }
  const prevKnowledge=Array.isArray(previous.knowledge)?previous.knowledge:[];
  for(const k of p.knowledge){const old=prevKnowledge.find(x=>x.factId===k.factId&&x.holder===k.holder);if(old)issues.push(...validateKnowledgeTransition(old,k).issues);}
  return {status:issues.some(i=>i.severity==='fail')?'FAIL':issues.length?'WARN':'PASS',issues,packet:p};
}
export function commitRuntimePacket(runtime={},packet={}){const check=validateRuntimePacket(packet,runtime);if(check.status==='FAIL')throw new Error(`RUNTIME_PACKET_INVALID:${check.issues.map(i=>i.code).join(',')}`);const p=check.packet;const merge=(old,next)=>{const map=new Map((old||[]).map(x=>[x.id,x]));for(const x of next||[])map.set(x.id,x);return [...map.values()];};return {version:NOVEL_RUNTIME_VERSION,events:merge(runtime.events,p.events.map(x=>({...x,status:'COMMITTED'}))),knowledge:merge(runtime.knowledge,p.knowledge),transitions:merge(runtime.transitions,p.transitions),causality:merge(runtime.causality,p.causality),foreshadowing:merge(runtime.foreshadowing,p.foreshadowing)};}
export function createRuntimeProposal({chapterId,time,observed={},events=[],knowledge=[],transitions=[],causality=[],foreshadowing=[]}={}){return normalizeRuntimePacket({chapterId,events,knowledge,transitions,causality,foreshadowing},{chapterId,time});}
