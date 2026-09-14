/** v46 observed-state evidence contract. Pure/browser-independent. */
'use strict';
export const STATE_EVIDENCE_VERSION=1;
export function evidence(chapterId,sceneId,source='prose',extra={}){ return Object.freeze({version:STATE_EVIDENCE_VERSION,chapterId:Number(chapterId),sceneId:String(sceneId||''),source:String(source||'prose'),ts:Number(extra.ts)||Date.now()}); }
export function attachEvidence(value,meta){ return {value,evidence:evidence(meta.chapterId,meta.sceneId,meta.source,meta)}; }
export function validateEvidence(x){ const e=x?.evidence||x; const issues=[]; if(Number(e?.version)!==STATE_EVIDENCE_VERSION) issues.push({code:'EVIDENCE_VERSION',severity:'fail'}); if(!Number.isFinite(Number(e?.chapterId))) issues.push({code:'EVIDENCE_CHAPTER_MISSING',severity:'fail'}); if(!String(e?.source||'').trim()) issues.push({code:'EVIDENCE_SOURCE_MISSING',severity:'fail'}); return {status:issues.some(i=>i.severity==='fail')?'FAIL':issues.length?'WARN':'PASS',issues}; }
