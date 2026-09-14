/** v44 canonical observed-state contract. Pure and browser-independent. */
'use strict';

export const STATE_CONTRACT_VERSION = 3;
import { validateEvidence } from './state-evidence.js';

const arr=(v,max=20)=>Array.isArray(v)?v.map(x=>String(x||'').trim()).filter(Boolean).slice(0,max):[];

export function migrateObservedState(input={}){
  const x={...(input||{})};
  if(Number(x.contractVersion||1)<STATE_CONTRACT_VERSION){ x.contractVersion=STATE_CONTRACT_VERSION; x.migratedFrom=Number(input.contractVersion||1); }
  return x;
}

export function normalizeObservedState(input={}){
  const migrated=migrateObservedState(input);
  return {
    contractVersion:STATE_CONTRACT_VERSION,
    time:String(migrated.time||'').trim(),
    location:String(migrated.location||'').trim(),
    characters:migrated.characters&&typeof migrated.characters==='object'&&!Array.isArray(migrated.characters)?migrated.characters:{},
    endingState:String(migrated.endingState||'').trim(),
    openThreads:arr(migrated.openThreads,12),
    newFacts:arr(migrated.newFacts,20),
    source:'observed',
    authority:migrated.authority,
    ts:Number(migrated.ts)||Date.now(),
    evidence:Array.isArray(migrated.evidence)?migrated.evidence:[],
  };
}


export function validateObservedTransition(previous, current){
  const issues=[]; const a=String(previous?.time||'').trim(), b=String(current?.time||'').trim();
  if(a && b){
    const ord=(value)=>{ const m=String(value).match(/第\s*(\d+)\s*(?:日|天)/); return m?Number(m[1]):null; };
    const pa=ord(a), pb=ord(b); if(pa!=null&&pb!=null&&pb<pa) issues.push({code:'STATE_TIME_REWIND',severity:'fail',message:`观测状态时间从「${a}」倒退到「${b}`});
  }
  return {status:issues.some(x=>x.severity==='fail')?'FAIL':issues.length?'WARN':'PASS',issues};
}

export function validateObservedState(input, expectedAuthority='stateAI'){
  const x=input||{}, issues=[];
  if(Number(x.contractVersion)!==STATE_CONTRACT_VERSION) issues.push({code:'STATE_CONTRACT_VERSION',severity:'fail'});
  if(x.source!=='observed') issues.push({code:'STATE_SOURCE_INVALID',severity:'fail'});
  if(x.planned || x.canon || x.glossary) issues.push({code:'STATE_CANON_BOUNDARY_BREACH',severity:'fail'});
  if(x.authority?.role!==expectedAuthority) issues.push({code:'STATE_AUTHORITY_INVALID',severity:'fail',expected:expectedAuthority,actual:x.authority?.role||''});
  if(Array.isArray(x.newFacts) && x.newFacts.length>20) issues.push({code:'STATE_FACT_LIMIT',severity:'fail'});
  if(Array.isArray(x.evidence)) x.evidence.slice(0,20).forEach(e=>{ const r=validateEvidence(e); issues.push(...r.issues); });
  return {status:issues.some(x=>x.severity==='fail')?'FAIL':'PASS',issues};
}
