/** v44 canonical authority / provenance contract. */
'use strict';

export const AUTHORITY_CONTRACT_VERSION = 1;

export const AUTHORITY_ROLES = Object.freeze({
  dictmaster: Object.freeze({read:true,write:true,scope:'global-canon'}),
  dictEnrich: Object.freeze({read:true,write:true,scope:'world-expansion'}),
  principal: Object.freeze({read:true,write:true,scope:'book-structure'}),
  teacher: Object.freeze({read:true,write:true,scope:'chapter-plan'}),
  proseAI: Object.freeze({read:true,write:false,scope:'literary-expression'}),
  stateAI: Object.freeze({read:true,write:true,scope:'observed-state'}),
  system: Object.freeze({read:true,write:true,scope:'system'}),
});

export function normalizeAuthority(role, extra={}){
  const r=String(role||'').trim();
  const def=AUTHORITY_ROLES[r] || AUTHORITY_ROLES.system;
  return Object.freeze({
    contractVersion:AUTHORITY_CONTRACT_VERSION,
    role:r || 'system',
    scope:def.scope,
    canWrite:def.write===true,
    source:String(extra.source||r||'system'),
    version:Number(extra.version)||1,
    ts:Number(extra.ts)||Date.now(),
  });
}

export function stampAuthority(obj, role, extra={}){
  const target=obj && typeof obj==='object' ? obj : {};
  target.authority=normalizeAuthority(role,extra);
  return target;
}

export function canWrite(role, scope){
  const def=AUTHORITY_ROLES[String(role||'')];
  if(!def || !def.write) return false;
  return !scope || def.scope===scope || def.scope==='system';
}

export function validateAuthority(meta, expectedRole, expectedScope){
  const a=meta?.authority||meta;
  const issues=[];
  if(!a || typeof a!=='object') issues.push({code:'AUTHORITY_MISSING',severity:'fail'});
  else {
    if(Number(a.contractVersion)!==AUTHORITY_CONTRACT_VERSION) issues.push({code:'AUTHORITY_VERSION_MISMATCH',severity:'fail'});
    if(expectedRole && a.role!==expectedRole) issues.push({code:'AUTHORITY_ROLE_MISMATCH',severity:'fail',expected:expectedRole,actual:a.role});
    if(expectedScope && a.scope!==expectedScope) issues.push({code:'AUTHORITY_SCOPE_MISMATCH',severity:'fail',expected:expectedScope,actual:a.scope});
  }
  return {status:issues.some(x=>x.severity==='fail')?'FAIL':'PASS',issues};
}
