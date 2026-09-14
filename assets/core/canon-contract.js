/** v45 canonical-fact / provenance contract. Pure and browser-independent. */
'use strict';

import { stampAuthority, validateAuthority } from './authority-contract.js';
import { normalizeCanonLifecycle, validateCanonLifecycle } from './canon-lifecycle.js';

export const CANON_CONTRACT_VERSION = 1;
export const CANON_KINDS = Object.freeze({
  character:'character', place:'place', propernoun:'propernoun', relationship:'relationship', placeContact:'place-contact', properContact:'proper-contact', worldRule:'world-rule'
});

const ROLE_BY_KIND=Object.freeze({
  character:'dictmaster', place:'dictmaster', propernoun:'dictmaster', relationship:'dictmaster', placeContact:'dictmaster', properContact:'dictmaster', worldRule:'dictmaster'
});
const ID_PREFIX=Object.freeze({character:'ch',place:'pl',propernoun:'pn',relationship:'rel',placeContact:'pc',properContact:'pnc',worldRule:'wr'});

function text(v){ return String(v==null?'':v).trim(); }
function stableId(prefix,name,index=0){
  const raw=text(name)||`${prefix}-${index}`; let h=0;
  for(let i=0;i<raw.length;i++) h=((h<<5)-h+raw.charCodeAt(i))|0;
  return `${prefix}_${Math.abs(h).toString(36)}`;
}

export function normalizeCanonFact(input={}, kind='character', index=0){
  const k=CANON_KINDS[kind]||kind;
  const x={...input};
  x.contractVersion=CANON_CONTRACT_VERSION;
  normalizeCanonLifecycle(x,{status:'APPROVED'});
  x.kind=k;
  x.id=x.id||stableId(ID_PREFIX[k]||'fact',x.name||x.rule||`${x.a||x.from||''}-${x.b||x.to||''}`,index);
  x.source=x.source||'dictmaster';
  x.createdBy=x.createdBy||'dictmaster';
  x.createdAt=Number(x.createdAt)||Date.now();
  if(!x.authority){ const role=x.source==='dictEnrich'||x._enrich?'dictEnrich':'dictmaster'; stampAuthority(x,role,{source:x.source,version:Number(x.version)||1}); }
  return x;
}

export function validateCanonFact(input, expectedKind){
  const x=input||{}, issues=[];
  if(Number(x.contractVersion)!==CANON_CONTRACT_VERSION) issues.push({code:'CANON_VERSION_MISMATCH',severity:'fail'});
  if(expectedKind && x.kind!==expectedKind) issues.push({code:'CANON_KIND_INVALID',severity:'fail',expected:expectedKind,actual:x.kind||''});
  if(!text(x.id)) issues.push({code:'CANON_ID_MISSING',severity:'fail'});
  if(!text(x.source)) issues.push({code:'CANON_SOURCE_MISSING',severity:'fail'});
  if(!text(x.createdBy)) issues.push({code:'CANON_CREATOR_MISSING',severity:'fail'});
  const expectedRole=ROLE_BY_KIND[x.kind];
  const actualRole=x.source==='dictEnrich'||x._enrich?'dictEnrich':expectedRole;
  if(expectedRole){
    const a=validateAuthority(x,actualRole);
    issues.push(...a.issues);
  }
  issues.push(...validateCanonLifecycle(x).issues);
  if(['character','place','propernoun'].includes(x.kind) && !text(x.name)) issues.push({code:'CANON_NAME_MISSING',severity:'fail'});
  if(x.kind==='relationship' && (!text(x.a)||!text(x.b)||!text(x.relation))) issues.push({code:'RELATIONSHIP_FIELDS_MISSING',severity:'fail'});
  if(x.kind==='place-contact' && (!text(x.from)||!text(x.to))) issues.push({code:'PLACE_CONTACT_FIELDS_MISSING',severity:'fail'});
  if(x.kind==='proper-contact' && (!text(x.from)||!text(x.to))) issues.push({code:'PROPER_CONTACT_FIELDS_MISSING',severity:'fail'});
  if(x.kind==='world-rule' && !text(x.rule)) issues.push({code:'WORLD_RULE_MISSING',severity:'fail'});
  return {status:issues.some(i=>i.severity==='fail')?'FAIL':issues.length?'WARN':'PASS',issues};
}

export function normalizeCanonGraph(glossary={}){
  const g=glossary||{};
  g.characters=(g.characters||[]).map((x,i)=>normalizeCanonFact(x,'character',i));
  g.places=(g.places||[]).map((x,i)=>normalizeCanonFact(x,'place',i));
  g.propernouns=(g.propernouns||[]).map((x,i)=>normalizeCanonFact(x,'propernoun',i));
  g._relationshipTable=(g._relationshipTable||[]).map((x,i)=>normalizeCanonFact(x,'relationship',i));
  g._placeContacts=(g._placeContacts||[]).map((x,i)=>normalizeCanonFact(x,'place-contact',i));
  g._properContacts=(g._properContacts||[]).map((x,i)=>normalizeCanonFact(x,'proper-contact',i));
  g._worldRules=(g._worldRules||[]).map((x,i)=>normalizeCanonFact(x,'world-rule',i));
  return g;
}

export function validateCanonGraph(glossary={}){
  const g=glossary||{}, issues=[];
  const groups=[['characters','character'],['places','place'],['propernouns','propernoun'],['_relationshipTable','relationship'],['_placeContacts','place-contact'],['_properContacts','proper-contact'],['_worldRules','world-rule']];
  for(const [key,kind] of groups){
    const arr=Array.isArray(g[key])?g[key]:[];
    arr.forEach((x,i)=>{
      const r=validateCanonFact(x,kind);
      for(const issue of r.issues) issues.push({...issue,group:key,index:i});
    });
  }
  return {status:issues.some(i=>i.severity==='fail')?'FAIL':issues.length?'WARN':'PASS',issues};
}

export function protectCanonGraph(glossary={}, snapshot={}){
  const g=normalizeCanonGraph(glossary), snap=snapshot||{};
  const restore=(key,fields)=>{
    const by=new Map((snap[key]||[]).map(x=>[x.id||x.name,x]));
    (g[key]||[]).forEach(x=>{ const old=by.get(x.id||x.name); if(!old) return; for(const f of fields) if(old[f]!==undefined) x[f]=old[f]; x.authority=old.authority; x.source=old.source; x.createdBy=old.createdBy; x.contractVersion=old.contractVersion; });
  };
  restore('characters',['name','identity','age','gender','appearance','hobby','relation','trait','catchphrase']);
  restore('places',['name','type','note']); restore('propernouns',['name','note']);
  restore('_relationshipTable',['a','b','relation','note']); restore('_placeContacts',['from','to','relation','note']); restore('_properContacts',['from','to','relation','note']); restore('_worldRules',['cat','scope','rule']);
  return g;
}
