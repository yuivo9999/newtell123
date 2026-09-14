/** v46 canonical fact lifecycle. Pure/browser-independent. */
'use strict';

export const CANON_STATUSES = Object.freeze(['DRAFT','PROPOSED','APPROVED','LOCKED','SUPERSEDED']);

export function normalizeCanonLifecycle(input={}, defaults={}){
  const x=input;
  x.status=CANON_STATUSES.includes(x.status)?x.status:(defaults.status||'APPROVED');
  x.version=Math.max(1,Number(x.version)||1);
  x.createdAt=Number(x.createdAt)||Date.now();
  x.updatedAt=Number(x.updatedAt)||x.createdAt;
  x.supersedes=x.supersedes||null;
  x.supersededBy=x.supersededBy||null;
  return x;
}

export function canTransitionCanon(from,to){
  const a=String(from||'DRAFT'), b=String(to||'').toUpperCase();
  const allowed={DRAFT:['PROPOSED','SUPERSEDED'],PROPOSED:['APPROVED','DRAFT','SUPERSEDED'],APPROVED:['LOCKED','SUPERSEDED'],LOCKED:['SUPERSEDED'],SUPERSEDED:[]};
  return !!(allowed[a]||[]).includes(b);
}

export function transitionCanonFact(input,to,meta={}){
  const x=normalizeCanonLifecycle({...input});
  const target=String(to||'').toUpperCase();
  if(!canTransitionCanon(x.status,target)) throw new Error(`CANON_INVALID_TRANSITION:${x.status}->${target}`);
  x.status=target; x.updatedAt=Number(meta.updatedAt)||Date.now(); x.version=(Number(x.version)||1)+1;
  if(target==='SUPERSEDED') x.supersededBy=meta.supersededBy||x.supersededBy||null;
  if(meta.supersedes) x.supersedes=meta.supersedes;
  return x;
}

export function validateCanonLifecycle(input){
  const x=input||{}, issues=[];
  if(!CANON_STATUSES.includes(x.status)) issues.push({code:'CANON_STATUS_INVALID',severity:'fail'});
  if(!Number.isInteger(Number(x.version))||Number(x.version)<1) issues.push({code:'CANON_VERSION_INVALID',severity:'fail'});
  if(x.status==='SUPERSEDED' && !x.supersededBy && !x.supersedes) issues.push({code:'CANON_SUPERSEDED_LINK_MISSING',severity:'warn'});
  return {status:issues.some(i=>i.severity==='fail')?'FAIL':issues.length?'WARN':'PASS',issues};
}
