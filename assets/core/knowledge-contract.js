/** v47 character/readership knowledge model. Pure/browser-independent. */
'use strict';
export const KNOWLEDGE_CONTRACT_VERSION=1;
export const KNOWLEDGE_STATUS=Object.freeze(['UNKNOWN','SUSPECTED','INFERRED','KNOWN','CONFIRMED','FORGOTTEN','MISBELIEVED']);
const text=v=>String(v==null?'':v).trim();
export function normalizeKnowledge(input={}, defaults={}){
  const x={...(input||{})};
  return {contractVersion:KNOWLEDGE_CONTRACT_VERSION,id:text(x.id)||`kn_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,factId:text(x.factId),holder:text(x.holder||defaults.holder),status:KNOWLEDGE_STATUS.includes(x.status)?x.status:'KNOWN',sourceChapter:Number(x.sourceChapter||defaults.chapterId)||null,sourceScene:text(x.sourceScene),evidence:text(x.evidence),authority:x.authority,ts:Number(x.ts)||Date.now()};
}
export function validateKnowledge(input={}){
  const x=normalizeKnowledge(input),issues=[];
  if(x.contractVersion!==KNOWLEDGE_CONTRACT_VERSION) issues.push({code:'KNOWLEDGE_VERSION',severity:'fail'});
  if(!x.factId) issues.push({code:'KNOWLEDGE_FACT_MISSING',severity:'fail'});
  if(!x.holder) issues.push({code:'KNOWLEDGE_HOLDER_MISSING',severity:'fail'});
  if(!x.sourceChapter) issues.push({code:'KNOWLEDGE_SOURCE_MISSING',severity:'fail'});
  return {status:issues.some(i=>i.severity==='fail')?'FAIL':'PASS',issues,knowledge:x};
}
export function normalizeKnowledgeState(input=[],defaults={}){return input.map(x=>normalizeKnowledge(x,defaults));}
export function knowledgeForHolder(state=[],holder){return state.filter(x=>x.holder===holder);}
export function validateKnowledgeTransition(previous={},current={}){
  const issues=[]; const order={UNKNOWN:0,SUSPECTED:1,INFERRED:2,KNOWN:3,CONFIRMED:4,FORGOTTEN:2,MISBELIEVED:2};
  if(previous.factId&&current.factId&&previous.factId===current.factId&&previous.holder===current.holder){
    if(previous.status==='CONFIRMED' && current.status==='UNKNOWN') issues.push({code:'KNOWLEDGE_ERASED',severity:'fail'});
    if(previous.status==='KNOWN' && current.status==='UNKNOWN') issues.push({code:'KNOWLEDGE_REGRESSION',severity:'fail'});
    if(order[current.status]<order[previous.status] && !['FORGOTTEN','MISBELIEVED'].includes(current.status)) issues.push({code:'KNOWLEDGE_REGRESSION',severity:'fail'});
  }
  return {status:issues.length?'FAIL':'PASS',issues};
}
