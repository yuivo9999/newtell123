/**
 * Chapter state extraction, audit, minimal repair and finalization.
 *
 * This is intentionally stateful and uses the compatibility runtime bridge.
 * The module boundary isolates the chapter lifecycle from the UI-heavy legacy
 * entrypoint without pretending the underlying state store is already modular.
 */

import { normalizeObservedState, validateObservedState } from './state-contract.js';
import { stampAuthority } from './authority-contract.js';
import { evidence } from './state-evidence.js';
import { createRuntimeProposal, validateRuntimePacket, commitRuntimePacket } from './novel-runtime.js';

const CHAPTER_AUDIT_SYS=`你是长篇小说“状态审计AI”。你没有创作权，只负责判定正文是否忠实执行机器章节卡、上一章真实状态与世界词典。
只检查可验证冲突：时间倒退/不可达、地点瞬移、人物生死与身体状态、关系变化、道具持有、世界规则、信息知情边界、章节必做事件缺失、禁项违规、凭空出现会持续存在的新核心实体。正常文学发挥不是错误。
【特别时间审计】如果机器章节卡明确给出起点和终点跨越多日，必须检查正文是否真的抵达计划终点并对中间时间流逝有合理叙事承载；可以通过场景跳跃、生活节律、蒙太奇、阶段性事件等完成，不要求逐日流水账，但绝不能正文实际只发生在前一两天却声称本章覆盖五天。若正文明确落在比计划终点更早的日期，判FAIL；若无法确认抵达终点，至少WARN。
输出严格JSON：{"status":"PASS|WARN|FAIL","issues":[{"type":"time|location|character|relationship|object|rule|knowledge|event|entity|causal","severity":"warn|fail","evidence":"正文中的明确证据","expected":"应有状态","actual":"实际状态","repair":"最小修复方向"}],"summary":"一句话"}`;
async function auditChapterState(i,text){
  if(!isLong()) return null; const ss=storyState(), c=chapterPlanAuthority(i), prev=ss.chapters?.[i-1]?.observed||null, obs=ss.chapters?.[i]?.observed||null;
  if(!c||!obs) return null;
  const g=(state.outline&&state.outline.glossary)||{};
  const canon=`人物:${(g.characters||[]).map(x=>x.name).join('、')}\n地点:${(g.places||[]).map(x=>x.name).join('、')}\n专名:${(g.propernouns||[]).map(x=>x.name).join('、')}\n世界规则:${(g._worldRules||[]).map(x=>x.rule).join('；')}`;
  const banAudit = stateBanEnabled() ? `\n【用户全书禁则·必须审计】\n禁用姓名：${banListNames().join('、')}\n姓名禁用字：${banListChars().join('、')}\n禁用短语：${(Array.isArray(banListRaw().phrases)?banListRaw().phrases:[]).join('、')}` : '';
  const plannedTime=c.time||''; const tr=_extractPlanTimeRange({beatsText:'剧情时间落点：'+plannedTime});
  const user=`【机器章节卡】${JSON.stringify(c)}\n【时间覆盖核验】起点=${tr.from||'未知'}；终点=${tr.to||'未知'}；跨度=${_timeDaySpan(tr.from,tr.to)==null?'未知':_timeDaySpan(tr.from,tr.to)+'天'}；时间推进安排=${c.timeCoverage||'无'}\n【上一章正文结算】${JSON.stringify(prev||{})}\n【本章正文结算】${JSON.stringify(obs)}\n【词典只读实体】${canon}${banAudit}\n【本章正文】\n${String(text||'').slice(0,50000)}`;
  try{ const raw=unwrapAIResult(await callDeepSeek(CHAPTER_AUDIT_SYS,user,{maxTokens:2200,temperature:0.05,topP:0.1,signal:_abortCtl?.signal,taskKey:'chapterAudit'})); const j=parseJson(raw)||{}; const report={status:['PASS','WARN','FAIL'].includes(j.status)?j.status:'WARN',issues:Array.isArray(j.issues)?j.issues.slice(0,20):[],summary:String(j.summary||'').trim(),ts:Date.now(),chapter:i}; const p=ss.chapters[i]?.planned||{}; const pt=_timeOrdinal(p.to), ot=_timeOrdinal(obs.time); if(pt!=null && ot!=null && ot<pt){ report.status='FAIL'; report.issues.unshift({type:'time',severity:'fail',evidence:`正文状态结算时间：${obs.time}`,expected:`本章必须抵达计划终点：${p.to}`,actual:`正文结算仍早于计划终点约${Math.max(0,pt-ot)}小时`,repair:'补足计划终点前真实发生的时间流逝/阶段性事件，并让章末状态落到计划终点。'}); } else if(pt!=null && ot==null && (p.spanDays||0)>=1){ report.status=report.status==='FAIL'?'FAIL':'WARN'; report.issues.unshift({type:'time',severity:'warn',evidence:'正文状态结算器未能确认章末日期',expected:`抵达计划终点：${p.to}`,actual:'无法确认',repair:'复核正文是否真正走到计划终点；必要时补足自然时间过桥。'}); } if(report.issues.some(x=>x.severity==='fail')) report.status='FAIL'; ss.chapters[i].audit=report; persist(); return report; }catch(e){ ss.chapters[i].audit={status:'WARN',issues:[{type:'audit',severity:'warn',evidence:'审计AI不可用',expected:'完成审计',actual:e.message,repair:'稍后重试'}],summary:'审计未完成',ts:Date.now(),chapter:i}; persist(); return ss.chapters[i].audit; }
}
const CHAPTER_REPAIR_SYS=`你是长篇小说“局部修复AI”。你没有改写世界和剧情的权力，只能修复审计指出的最小冲突。\n规则：只处理FAIL问题；保持章节卡规定的事件、人物、时间、地点和文学风格；不得新增主线事件；不得整章重写。若FAIL属于多日时间跨度不足，允许在原有事件之间加入最小必要的时间过桥/阶段性推进，让正文自然抵达章节卡终点，但不得用一句“几天后”敷衍，也不得改变核心事件顺序。输出严格JSON：{"replacement":"要替换的最小原文片段","newText":"与原文长度大致相当的修复后片段","reason":"修复说明"}`;
async function repairChapterByAudit(i,text,report){
  const fails=(report?.issues||[]).filter(x=>x&&x.severity==='fail'); if(!fails.length) return String(text||'');
  const banRepair = stateBanEnabled() ? `\n【用户全书禁则】禁用姓名：${banListNames().join('、')}；姓名禁用字：${banListChars().join('、')}；禁用短语：${(Array.isArray(banListRaw().phrases)?banListRaw().phrases:[]).join('、')}` : '';
  const user=`【章节卡】${JSON.stringify(chapterPlanAuthority(i))}\n【审计FAIL】${JSON.stringify(fails)}${banRepair}\n【正文】\n${String(text||'').slice(0,50000)}\n只修复最小冲突，优先修改1-3个最小连续片段。`;
  try{ const raw=unwrapAIResult(await callDeepSeek(CHAPTER_REPAIR_SYS,user,{maxTokens:3500,temperature:0.15,topP:0.2,signal:_abortCtl?.signal,taskKey:'chapterRepair'})); const j=parseJson(raw)||{}; const old=String(j.replacement||'').trim(), neu=String(j.newText||'').trim(); if(!old||!neu) return String(text||''); const idx=String(text||'').indexOf(old); if(idx<0) return String(text||''); return String(text).slice(0,idx)+neu+String(text).slice(idx+old.length); }catch(e){ return String(text||''); }
}
async function finalizeChapterState(i,text){
  const obs=await commitChapterObservedState(i,text); if(!obs) return {observed:null,audit:null,content:String(text||'')};
  let audit=await auditChapterState(i,text), content=String(text||'');
  if(audit&&audit.status==='FAIL'){
    const repaired=await repairChapterByAudit(i,content,audit);
    if(repaired!==content){ content=repaired; const o=state.outline; o.chapters[i].content=content; updateFactCardFromChapter(i,content); await commitChapterObservedState(i,content); audit=await auditChapterState(i,content); audit.repaired=true; audit.repairedAt=Date.now(); storyState().chapters[i].audit=audit; persist(); }
  }
  return {observed:storyState().chapters[i]?.observed||obs,audit,content};
}

async function commitChapterObservedState(i,text){
  if(!isLong()||!String(text||'').trim()) return null;
  const o=state.outline||{}, plan=(o.chapterPlans||[])[i]||{}, ss=storyState();
  const user=`【第${i+1}章教案】\n${String(plan.beatsText||'').slice(0,7000)}\n【本章正文】\n${String(text).slice(-40000)}`;
  try{
    const raw=unwrapAIResult(await callDeepSeek(CHAPTER_STATE_SYS,user,{maxTokens:1800,temperature:0.1,topP:0.2,signal:_abortCtl?.signal,taskKey:'chapterState'}));
    const j=parseJson(raw)||{};
    const obs=normalizeObservedState(j);
    obs.evidence=Array.isArray(obs.evidence)?obs.evidence:[];
    obs.evidence.push(evidence(i+1,'chapter-end','prose'));
    stampAuthority(obs,'stateAI',{source:'chapter-state'}); const stateCheck=validateObservedState(obs); if(stateCheck.status==='FAIL') obs.validation=stateCheck;
    ss.chapters[i]=ss.chapters[i]||{}; ss.chapters[i].observed=obs; ss.chapters[i].observedAt=Date.now();
    ss.current={chapter:i,time:obs.time,location:obs.location,characters:obs.characters,endingState:obs.endingState,openThreads:obs.openThreads};
    const packet=createRuntimeProposal({chapterId:i+1,time:obs.time,events:j.events,knowledge:j.knowledge,transitions:j.transitions,causality:j.causality,foreshadowing:j.foreshadowing});
    if(!packet.events.length) packet.events.push({chapterId:i+1,type:'OTHER',time:obs.time,actors:Object.keys(obs.characters||{}),summary:`第${i+1}章正文结算`,evidence:[evidence(i+1,'chapter-end','prose')],status:'PROPOSED'});
    const runtimeCheck=validateRuntimePacket(packet,ss.runtime||{});
    ss.chapters[i].runtimeProposal=packet; ss.chapters[i].runtimeValidation=runtimeCheck;
    if(runtimeCheck.status!=='FAIL'){ ss.runtime=commitRuntimePacket(ss.runtime||{},packet); ss.chapters[i].runtimeCommittedAt=Date.now(); }
    o._factCard=o._factCard||{}; o._factCard.storyStateLast=obs; persist(); return obs;
  }catch(e){ return null; }
}


let charFilters = {q:'', idents:[], gender:'', ageMin:'', ageMax:''};
let charTS = [];

export {
  CHAPTER_AUDIT_SYS,
  CHAPTER_REPAIR_SYS,
  auditChapterState,
  repairChapterByAudit,
  finalizeChapterState,
  commitChapterObservedState,
};

Object.assign(window, {
  CHAPTER_AUDIT_SYS,
  CHAPTER_REPAIR_SYS,
  auditChapterState,
  repairChapterByAudit,
  finalizeChapterState,
  commitChapterObservedState,
});
