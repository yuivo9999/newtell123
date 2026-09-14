/** v46 fact/state conflict engine. Pure/browser-independent. */
'use strict';

function text(v){return String(v==null?'':v).trim();}
function push(out,type,severity,expected,actual,extra={}){out.push({type,severity,expected,actual,...extra});}

export function compareCanonToObserved(canon={}, observed={}, chapterId=null){
  const conflicts=[];
  const chars=canon.characters||[];
  const observedChars=observed.characters||{};
  for(const c of chars){
    const name=text(c.name); if(!name) continue;
    const state=observedChars[name]; if(!state) continue;
    const s=text(typeof state==='object'?state.state:state);
    if(c.identity && /身份[:：]/.test(s) && !s.includes(text(c.identity))) push(conflicts,'character','error',c.identity,s,{code:'CANON_CONFLICT',entityId:c.id,entity:name,field:'identity',chapterId});
  }
  return {status:conflicts.some(x=>x.severity==='error')?'FAIL':conflicts.length?'WARN':'PASS',conflicts};
}

export function detectCanonConflicts(before={}, after={}){
  const conflicts=[];
  const groups=[['characters',['name','identity','age','gender','appearance','hobby','relation','trait','catchphrase']],['places',['name','type','note']],['propernouns',['name','note']]];
  for(const [key,fields] of groups){
    const a=new Map((before[key]||[]).map(x=>[x.id||x.name,x]));
    for(const x of after[key]||[]){ const id=x.id||x.name, old=a.get(id); if(!old) continue; for(const f of fields){ if(old[f]!==undefined && x[f]!==undefined && String(old[f])!==String(x[f])) push(conflicts,'canon-mutation','error',old[f],x[f],{code:'CANON_MUTATION',group:key,id,field:f}); } }
  }
  return {status:conflicts.some(x=>x.severity==='error')?'FAIL':conflicts.length?'WARN':'PASS',conflicts};
}
