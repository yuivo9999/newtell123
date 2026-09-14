/** v48 Next Chapter Context Builder. Pure/browser-independent. */
'use strict';

const text = v => String(v == null ? '' : v).trim();
const num = v => Number.isFinite(Number(v)) ? Number(v) : null;
const uniq = xs => [...new Set((xs || []).map(text).filter(Boolean))];

export const NEXT_CHAPTER_CONTEXT_VERSION = 1;

function chapterNo(x){ const n=num(x); return n == null ? null : n; }
function recentFirst(items, chapter){
  return (items || []).filter(x => chapterNo(x.chapterId) == null || chapterNo(x.chapterId) < chapter)
    .sort((a,b) => (chapterNo(b.chapterId)||0) - (chapterNo(a.chapterId)||0) || (num(b.ts)||0) - (num(a.ts)||0));
}
function clip(s,n){ const v=text(s); return v.length > n ? v.slice(0,n).trimEnd()+'…' : v; }

function latestTransitions(runtime, chapter){
  const map = new Map();
  for(const t of recentFirst(runtime.transitions, chapter).reverse()){
    const key = `${text(t.entity)}::${text(t.field)}`;
    if(key !== '::') map.set(key, t);
  }
  return [...map.values()].reverse();
}

function activeKnowledge(runtime, chapter){
  const map = new Map();
  for(const k of recentFirst(runtime.knowledge, chapter).reverse()){
    const key = `${text(k.factId)}::${text(k.holder)}`;
    if(key !== '::') map.set(key, k);
  }
  return [...map.values()];
}

function openForeshadowing(runtime, chapter){
  const terminal = new Set(['PAID_OFF','ABANDONED','SUPERSEDED','FALSE_TRAIL']);
  const map = new Map();
  for(const f of recentFirst(runtime.foreshadowing, chapter).reverse()){
    if(!map.has(text(f.id))) map.set(text(f.id), f);
  }
  return [...map.values()].filter(f => !terminal.has(text(f.status)));
}

function recentEvents(runtime, chapter, limit){
  return recentFirst(runtime.events, chapter).slice(0, limit).reverse();
}

function causalForEvents(runtime, events, chapter){
  const ids = new Set(events.flatMap(e => [e.id, ...(Array.isArray(e.causes)?e.causes:[]), ...(Array.isArray(e.effects)?e.effects:[])]).map(text).filter(Boolean));
  return recentFirst(runtime.causality, chapter).filter(c => ids.has(text(c.from)) || ids.has(text(c.to))).slice(0, 18);
}

export function buildNextChapterContext({
  chapterId,
  runtime = {},
  previousObserved = null,
  planned = null,
  maxChars = 9000,
  recentEventLimit = 10,
} = {}){
  const chapter = num(chapterId);
  if(chapter == null) return {version:NEXT_CHAPTER_CONTEXT_VERSION, status:'EMPTY', text:'', stats:{}};

  const rt = runtime || {};
  const events = recentEvents(rt, chapter, recentEventLimit);
  const transitions = latestTransitions(rt, chapter).slice(0, 18);
  const knowledge = activeKnowledge(rt, chapter).slice(0, 24);
  const foreshadowing = openForeshadowing(rt, chapter).slice(0, 16);
  const causality = causalForEvents(rt, events, chapter);
  const parts = [];

  parts.push(`【下一章上下文运行包｜v${NEXT_CHAPTER_CONTEXT_VERSION}】\n以下内容来自已经通过运行时验证的前文事实。它是承接约束，不是新剧情授权。正文AI不得为了迎合教案而篡改这些事实。`);

  if(previousObserved){
    const p = previousObserved;
    const lines=[];
    if(text(p.time)) lines.push(`章末时间：${text(p.time)}`);
    if(text(p.location)) lines.push(`章末地点：${text(p.location)}`);
    if(text(p.endingState)) lines.push(`章末定格：${clip(p.endingState,900)}`);
    if(p.characters && typeof p.characters === 'object'){
      const chars=Object.entries(p.characters).slice(0,14).map(([k,v])=>`${k}=${clip(v,180)}`);
      if(chars.length) lines.push(`人物定格：${chars.join('；')}`);
    }
    if(Array.isArray(p.openThreads) && p.openThreads.length) lines.push(`未决线索：${p.openThreads.slice(0,10).map(x=>clip(x,180)).join('；')}`);
    if(lines.length) parts.push(`【物理承接基准】\n${lines.join('\n')}`);
  }

  if(planned){
    const lines=[];
    if(text(planned.from) || text(planned.to)) lines.push(`本章计划时间：${text(planned.from)} → ${text(planned.to)}`);
    if(num(planned.spanDays) != null && num(planned.spanDays) >= 1) lines.push(`计划跨度：${num(planned.spanDays)}天`);
    if(text(planned.location)) lines.push(`计划地点：${text(planned.location)}`);
    if(text(planned.coverage)) lines.push(`时间推进安排：${clip(planned.coverage,900)}`);
    if(text(planned.endState)) lines.push(`计划结束状态：${clip(planned.endState,900)}`);
    if(lines.length) parts.push(`【本章目标边界】\n${lines.join('\n')}`);
  }

  if(events.length){
    parts.push(`【前文已发生的关键事件｜只读】\n${events.map((e,i)=>`${i+1}. [第${e.chapterId}章${e.time?` · ${e.time}`:''}] ${e.type||'OTHER'}：${clip(e.summary,520)}${e.actors?.length?`（人物：${e.actors.join('、')}）`:''}`).join('\n')}`);
  }

  if(transitions.length){
    parts.push(`【当前人物/实体状态轨迹｜取最新有效值】\n${transitions.map(t=>`- ${t.entity}.${t.field}：${clip(t.from,140)} → ${clip(t.to,220)}${t.causeEventId?`；原因事件=${t.causeEventId}`:''}`).join('\n')}`);
  }

  if(knowledge.length){
    parts.push(`【知情边界｜禁止角色无来源获知】\n${knowledge.map(k=>`- ${k.holder}：${k.status}「${clip(k.factId,180)}」${k.evidence?`；证据：${clip(k.evidence,240)}`:''}`).join('\n')}`);
  }

  if(causality.length){
    parts.push(`【近期因果连接】\n${causality.map(c=>`- ${c.from} --${c.type}→ ${c.to}${c.evidence?`（${clip(c.evidence,220)}）`:''}`).join('\n')}`);
  }

  if(foreshadowing.length){
    parts.push(`【未结伏笔｜剧情债务】\n${foreshadowing.map(f=>`- ${f.id}：${f.status}；${clip(f.summary,360)}${f.payoffChapter?`；预期回收章=${f.payoffChapter}`:''}`).join('\n')}`);
  }

  const full = parts.join('\n\n');
  const clipped = full.length <= maxChars ? full : clip(full,maxChars);
  return {
    version:NEXT_CHAPTER_CONTEXT_VERSION,
    status:'READY',
    text:clipped,
    stats:{events:events.length,transitions:transitions.length,knowledge:knowledge.length,causality:causality.length,foreshadowing:foreshadowing.length,chars:clipped.length},
  };
}

export function nextChapterContextSummary(runtime={}, chapterId){
  const r=buildNextChapterContext({runtime,chapterId,maxChars:1400,recentEventLimit:5});
  return r.stats;
}
