/** v47 foreshadowing lifecycle. Pure/browser-independent. */
'use strict';
export const FORESHADOWING_VERSION=1;
export const FORESHADOWING_STATUS=Object.freeze(['PLANTED','REINFORCED','SUSPENDED','PAYOFF_READY','PAID_OFF','ABANDONED','SUPERSEDED','FALSE_TRAIL']);
const allowed={PLANTED:new Set(['REINFORCED','SUSPENDED','PAYOFF_READY','ABANDONED','FALSE_TRAIL']),REINFORCED:new Set(['REINFORCED','SUSPENDED','PAYOFF_READY','ABANDONED','FALSE_TRAIL']),SUSPENDED:new Set(['REINFORCED','PAYOFF_READY','ABANDONED','SUPERSEDED']),PAYOFF_READY:new Set(['PAID_OFF','SUPERSEDED','ABANDONED']),PAID_OFF:new Set([]),ABANDONED:new Set([]),SUPERSEDED:new Set([]),FALSE_TRAIL:new Set([])};
const text=v=>String(v==null?'':v).trim();
export function normalizeForeshadow(input={},defaults={}){const x={...(input||{})};return {version:FORESHADOWING_VERSION,id:text(x.id)||`fs_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,summary:text(x.summary),status:FORESHADOWING_STATUS.includes(x.status)?x.status:'PLANTED',chapterId:Number(x.chapterId||defaults.chapterId)||null,evidence:text(x.evidence),payoffChapter:Number(x.payoffChapter)||null,authority:x.authority,ts:Number(x.ts)||Date.now()};}
export function canTransitionForeshadow(from,to){return from===to||!!allowed[from]?.has(to);}
export function transitionForeshadow(input,to){const x=normalizeForeshadow(input);if(!canTransitionForeshadow(x.status,to))throw new Error(`FORESHADOW_INVALID_TRANSITION:${x.status}->${to}`);return {...x,status:to,ts:Date.now()};}
export function validateForeshadowing(items=[]){const issues=[];for(const x0 of items){const x=normalizeForeshadow(x0);if(!x.summary)issues.push({code:'FORESHADOW_SUMMARY_MISSING',severity:'fail'});if(!x.chapterId)issues.push({code:'FORESHADOW_CHAPTER_MISSING',severity:'fail'});}return {status:issues.length?'FAIL':'PASS',issues};}
