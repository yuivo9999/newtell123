/** TellMe123 story-state and chapter-authority core.
 * Context7/MDN-guided ESM boundary: reusable state transitions are exported,
 * while the legacy runtime is accessed only through a narrow window bridge.
 */
import { stampAuthority, validateAuthority } from './authority-contract.js';
import { normalizeObservedState, STATE_CONTRACT_VERSION, validateObservedState } from './state-contract.js';
import { normalizeCanonGraph, validateCanonGraph, protectCanonGraph } from './canon-contract.js';
import { NOVEL_RUNTIME_VERSION, createRuntimeProposal, validateRuntimePacket, commitRuntimePacket } from './novel-runtime.js';

const state = new Proxy({}, {
  get(_target, key) { return window.state?.[key]; },
  set(_target, key, value) { if (!window.state) return false; window.state[key] = value; return true; },
  has(_target, key) { return key in (window.state || {}); },
});
const runtimeFn = (name) => (...args) => {
  const fn = window[name];
  if (typeof fn !== 'function') throw new Error(`[story-state] runtime function unavailable: ${name}`);
  return fn(...args);
};
const _extractPlanTimeRange = runtimeFn('_extractPlanTimeRange');
const _timeCoveragePlan = runtimeFn('_timeCoveragePlan');
const _timeDaySpan = runtimeFn('_timeDaySpan');
const _timeRewind = runtimeFn('_timeRewind');
const extractPlanField = runtimeFn('extractPlanField');
const parseTeacherChapterCards = runtimeFn('parseTeacherChapterCards');
const validateChapterCard = runtimeFn('validateChapterCard');
const schoolStageGroups = runtimeFn('schoolStageGroups');
const scState = runtimeFn('scState');
const scDone = runtimeFn('scDone');
const stateBanEnabled = runtimeFn('stateBanEnabled');
const banListNames = runtimeFn('banListNames');
const banListChars = runtimeFn('banListChars');

export function normalizeOutline(o){
  if(!o) return;
  if(o.structure) delete o.structure;
  o._rollingSummaries = o._rollingSummaries || [];
  o._factCard = o._factCard || { characters:{}, timeline:[], lastScene:'' };
  o._timeAudit = o._timeAudit || {};
  if(Array.isArray(o.chapterPlans)){
    o.chapterPlans = o.chapterPlans.map(p => {
      if(typeof p === 'string') return { beatsText:'', emotionalArc:'', requiredEntities:[] };   // 旧字符串形态（原主线简述）视为旧数据，直接丢弃
      p = p || {};
      delete p.summary; delete p.advance;   // 主线简述/主线推进字段已彻底移除
      delete p.beats;
      p.requiredEntities = Array.isArray(p.requiredEntities) ? p.requiredEntities : [];
      return p;
    });
  }
  if(o._mainlineLedger) delete o._mainlineLedger;   // 主线进度账随主线简述一并移除（旧存档静默清理）
  if(o._beatsHist) delete o._beatsHist;
  // v3：正式区分“已定稿世界”“章节计划”“正文观测”。AI可以创造，但下游不得越权改写。
  o._storyState = o._storyState || { schema:2, canon:{dictmasterAt:0,dictEnrichAt:0,principalAt:0,teacherAt:{},masterSnapshot:null}, chapters:{}, current:{chapter:-1,time:'',location:'',characters:{},endingState:'',openThreads:[]}, versions:{dictMaster:0,dictEnrich:0,principal:0,chapterCard:0}, pipelineVersion:0 };
  o._storyState.schema=5; o._storyState.contractVersion=4; o._storyState.stateContractVersion=STATE_CONTRACT_VERSION; o._storyState.runtime=o._storyState.runtime||{version:NOVEL_RUNTIME_VERSION,events:[],knowledge:[],transitions:[],causality:[],foreshadowing:[]}; o._storyState.versions=o._storyState.versions||{dictMaster:0,dictEnrich:0,principal:0,chapterCard:0}; o._storyState.canon=o._storyState.canon||{dictmasterAt:0,dictEnrichAt:0,principalAt:0,teacherAt:{},masterSnapshot:null}; o._storyState.canon.teacherAt=o._storyState.canon.teacherAt||{};
  o._storyState.canon = o._storyState.canon || {dictmasterAt:0,dictEnrichAt:0,principalAt:0,teacherAt:{}};
  o._storyState.chapters = o._storyState.chapters || {};
  o._storyState.current = o._storyState.current || {chapter:-1,time:'',location:'',characters:{},endingState:'',openThreads:[]};
}

export function storyState(){
  const o=state.outline || (state.outline={});
  normalizeOutline(o);
  return o._storyState;
}
export function storyStateCanonBlock(){
  const c=storyState().canon||{};
  return `【小说创作权限链｜系统状态】
- 词典达人：创造并定稿全局核心设定；词典充实：在既有世界内继续创造扩建素材。
- 校长：组织全书结构、阶段、标题和学校纪律；老师：组织自己负责章节的教案。
- 正文AI：负责文学表达与现场执行，不重新定义世界、人物核心事实或章节主线。
- 状态AI：只记录正文已经写成的事实，不拥有创作裁决权。
- 核心原则：AI可以大胆创造；进入正式词典/规划/正文状态后，必须尊重其来源与权限，不得偷偷改写。
- 当前链路：${c.dictmasterAt?'词典达人✓':'词典达人待完成'} → ${c.dictEnrichAt?'词典充实✓':'词典充实待完成'} → ${c.principalAt?'校长✓':'校长待完成'} → 老师分组备课 → 正文执笔。`;
}
export function storyStateChapterBlock(i){
  const ss=storyState(), prev=ss.chapters&&ss.chapters[i-1], cur=ss.chapters&&ss.chapters[i], lines=[];
  if(prev&&prev.observed){
    const p=prev.observed;
    lines.push(`【上一章正文结算状态｜只读事实】第${i}章之后实际写成：`);
    if(p.time) lines.push(`- 正文观测时间：${p.time}`);
    if(p.location) lines.push(`- 正文观测地点：${p.location}`);
    if(p.endingState) lines.push(`- 章末定格：${p.endingState}`);
    if(p.characters&&Object.keys(p.characters).length) lines.push(`- 人物定格：${Object.entries(p.characters).slice(0,12).map(([n,v])=>`${n}=${v}`).join('；')}`);
    if(Array.isArray(p.openThreads)&&p.openThreads.length) lines.push(`- 未决线索：${p.openThreads.slice(0,8).join('；')}`);
    lines.push('- 这是正文实际状态，只能承接，不能为了符合计划而篡改。');
  }
  if(cur&&cur.planned){
    const p=cur.planned;
    lines.push(`【本章计划状态｜老师已决定】${p.from||p.to?`时间=${p.from||''}${p.to?` → ${p.to}`:''}`:''}${p.location?`；地点=${p.location}`:''}`);
    if(p.spanDays!=null && p.spanDays>=1) lines.push(`- 计划跨度：约${p.spanDays}天；必须在正文中真正走到终点，不得把多日压扁成一两天。`);
    if(p.coverage) lines.push(`- 时间推进安排：${p.coverage}`);
    if(p.endState) lines.push(`- 计划结束状态：${p.endState}`);
  }
  return lines.join('\n');
}
export function commitPlannedChapterState(i, plan, source){
  const ss=storyState(), p=ss.chapters[i]=ss.chapters[i]||{}, tr=_extractPlanTimeRange(plan);
  const coverage=String(extractPlanField(plan,['时间推进安排','时间覆盖安排'])||'').trim() || _timeCoveragePlan(tr.from,tr.to,'');
  p.planned={time:tr.raw||'',from:tr.from||'',to:tr.to||'',coverage,spanDays:_timeDaySpan(tr.from,tr.to),continuity:String(extractPlanField(plan,['连续性','承接'])||'').trim(),cast:String(extractPlanField(plan,['本章出场名单'])||'').trim(),location:String(extractPlanField(plan,['场景地点','主要地点','地点'])||'').trim(),endState:String(extractPlanField(plan,['收束状态','章末状态'])||'').trim()};
  const prev=ss.chapters[i-1]&&ss.chapters[i-1].planned;
  p.boundaryAudit = { rewind:false, note:'' };
  if(prev && prev.to && p.from && _timeRewind(prev.to,p.from)){ p.boundaryAudit.rewind=true; p.boundaryAudit.note=`第${i}章计划起点「${p.from}」早于上一章计划终点「${prev.to}」`; }
  p.plannedAt=Date.now(); p.plannedSource=source||'teacher'; stampAuthority(p.planned,'teacher',{source:source||'teacher',version:ss.versions.chapterCard||1}); return p.planned;
}
export const CHAPTER_STATE_SYS = `你是长篇小说“正文事实抽取器”，不是作者、不是编辑。只从已经写完的正文提取实际发生的状态与事件，供下一章承接。
规则：只记录正文明确发生/明确说出/直接可观察的事实；不确定就留空；不得脑补；不得修改教案、时间线、词典或剧情计划。
除了基础状态，还必须把正文中的可验证事件、人物知道的信息、状态变化、因果关系、伏笔生命周期变化分别结构化。所有这些都是“提案”，不是正式世界事实；系统会在你输出后验证，验证失败的内容不得提交。
输出严格JSON：{"time":"","location":"","characters":{"人物":"章末状态"},"endingState":"","openThreads":[],"newFacts":[],"events":[{"id":"","type":"ACTION|REVELATION|RELATION_CHANGE|STATE_CHANGE|DEATH|MOVE|DECISION|CONFLICT|OTHER","time":"","actors":[],"summary":"","causes":[],"effects":[]}],"knowledge":[{"factId":"","holder":"","status":"UNKNOWN|SUSPECTED|INFERRED|KNOWN|CONFIRMED|FORGOTTEN|MISBELIEVED","evidence":""}],"transitions":[{"entity":"","field":"","from":"","to":"","causeEventId":"","evidence":""}],"causality":[{"from":"","to":"","type":"CAUSE|EFFECT|PRECONDITION|TRIGGER|CONSEQUENCE|REVERSAL|DEPENDENCY","evidence":""}],"foreshadowing":[{"id":"","summary":"","status":"PLANTED|REINFORCED|SUSPENDED|PAYOFF_READY|PAID_OFF|ABANDONED|SUPERSEDED|FALSE_TRAIL","evidence":""}]}`;

/* ===================== v4 小说创作状态引擎 ===================== */
export function ssNextVersion(kind){
  const ss=storyState(); ss.versions=ss.versions||{}; ss.versions[kind]=(Number(ss.versions[kind])||0)+1; return ss.versions[kind];
}
export function ssVersionSnapshot(){
  const ss=storyState(); const v=ss.versions||{};
  return { pipeline:Number(ss.pipelineVersion)||0, dictMaster:Number(v.dictMaster)||0, dictEnrich:Number(v.dictEnrich)||0, principal:Number(v.principal)||0 };
}
export function ssStamp(obj, extra){ return Object.assign({versions:ssVersionSnapshot(),ts:Date.now()}, extra||{}, obj||{}); }
export function ssEntityId(prefix,name){
  const raw=String(name||'').trim(); let h=0; for(let i=0;i<raw.length;i++) h=((h<<5)-h+raw.charCodeAt(i))|0;
  return `${prefix}_${Math.abs(h).toString(36)}`;
}
export function ssEnsureCanonEntities(){
  const g=(state.outline&&state.outline.glossary)||{};
  normalizeCanonGraph(g);
  [['characters','ch'],['places','pl'],['propernouns','pn']].forEach(([k,p])=>{
    (g[k]||[]).forEach(x=>{ if(!x||!String(x.name||'').trim()) return; x.id=x.id||ssEntityId(p,x.name); x.source=x.source|| (x._dictmaster?'dictmaster':x._enrich?'dictEnrich':'legacy'); x.createdBy=x.createdBy||x.source; x.createdAt=x.createdAt||x._srcTs||Date.now(); if(!x.authority) stampAuthority(x, x.source==='dictEnrich'?'dictEnrich':'dictmaster', {source:x.source}); });
  });
}
export function ssCaptureMasterSnapshot(){
  const g=(state.outline&&state.outline.glossary)||{}; const ss=storyState();
  const pick=(k,fields)=> (g[k]||[]).filter(Boolean).map(x=>{const o={}; fields.forEach(f=>o[f]=x[f]==null?'':x[f]); o.id=x.id||ssEntityId(k.slice(0,2),x.name); return o;});
  ss.canon=ss.canon||{};
  normalizeCanonGraph(g);
  ss.canon.masterSnapshot={
    characters:pick('characters',['id','name','identity','age','gender','appearance','hobby','relation','trait','catchphrase']),
    places:pick('places',['id','name','type','note']),
    propernouns:pick('propernouns',['id','name','note']),
    relationshipTable:(g._relationshipTable||[]).map(x=>({...x})), placeContacts:(g._placeContacts||[]).map(x=>({...x})), properContacts:(g._properContacts||[]).map(x=>({...x})), worldRules:(g._worldRules||[]).map(x=>({...x}))
  };
}
export function ssValidateCanon(){
  const g=(state.outline&&state.outline.glossary)||{};
  ssEnsureCanonEntities();
  return validateCanonGraph(g);
}

export function ssProtectCanonFromSnapshot(){
  const ss=storyState(), g=(state.outline&&state.outline.glossary)||{}, snap=ss.canon&&ss.canon.masterSnapshot;
  if(!snap) return ssValidateCanon();
  protectCanonGraph(g,snap); ssEnsureCanonEntities(); return ssValidateCanon();
}

export function ssProtectMasterCanon(){
  const ss=storyState(), snap=ss.canon&&ss.canon.masterSnapshot; const g=(state.outline&&state.outline.glossary); if(!snap||!g) return;
  const restore=(k,fields)=>{
    const by=new Map((snap[k]||[]).map(x=>[x.name,x]));
    (g[k]||[]).forEach(x=>{const old=by.get(x&&x.name); if(!old) return; fields.forEach(f=>x[f]=old[f]); x.id=old.id; x._dictmaster=true; x.source='dictmaster'; x.createdBy='dictmaster'; x.createdAt=x.createdAt||Date.now();});
  };
  restore('characters',['name','identity','age','gender','appearance','hobby','relation','trait','catchphrase']);
  restore('places',['name','type','note']); restore('propernouns',['name','note']);
  g._relationshipTable=snap.relationshipTable.map(x=>({...x}));
  g._placeContacts=snap.placeContacts.map(x=>({...x})); g._properContacts=snap.properContacts.map(x=>({...x})); g._worldRules=snap.worldRules.map(x=>({...x}));
  ssEnsureCanonEntities();
}
export function ssTeacherVersionsCurrent(gi){
  const t=storyState().canon&&storyState().canon.teacherAt&&storyState().canon.teacherAt[gi];
  return !!t && t.versions && t.versions.dictMaster===Number(storyState().versions?.dictMaster||0) && t.versions.dictEnrich===Number(storyState().versions?.dictEnrich||0) && t.versions.principal===Number(storyState().versions?.principal||0);
}
export function commitTeacherChapterCards(raw,g,gi){
  const ss=storyState(), cards=parseTeacherChapterCards(raw,g,gi), need=[];
  for(let n=g.first;n<=g.last;n++){
    const c=cards.find(x=>x.chapter===n); const err=validateChapterCard(c);
    if(err) need.push(`第${n}章 ${err}`);
    if(c && c.time && c.timeCoverage){
      const tr=_extractPlanTimeRange({beatsText:'剧情时间落点：'+c.time}); const span=_timeDaySpan(tr.from,tr.to);
      if(span!=null && span>=2){
        const dayMarks=(String(c.beats||'').match(/第\s*(?:\d+|[一二三四五六七八九十]+)\s*(?:日|天)/g)||[]).length;
        if(dayMarks<2) need.push(`第${n}章时间骨架不足：${span}日跨度却未在「本章推进骨架」中明确展开跨日推进`);
      }
    }
    if(c && stateBanEnabled()){
      const bad=(banListNames().concat(banListChars())).find(x=>x && ((c.cast||'').includes(x)||(c.title||'').includes(x)));
      if(bad) need.push(`第${n}章命中用户禁则「${bad}」`);
    }
  }
  if(need.length) throw new Error(`老师教案未形成完整机器章节卡：${need.join('；')}`);
  ss.chapters=ss.chapters||{};
  cards.forEach(c=>{
    const i=c.chapter-1, tr=_extractPlanTimeRange(c.time);
    ss.chapters[i]=ss.chapters[i]||{};
    ss.chapters[i].card=ssStamp(c,{teacherGi:gi,chapterVersion:ssNextVersion('chapterCard')});
    ss.chapters[i].planned=ssStamp({
      time:tr.raw||c.time||'', from:tr.from||'', to:tr.to||'', continuity:c.continuity||'', cast:c.cast||'',
      location:c.location||'', endState:c.endingState||'', entryState:c.entryState||'', coverage:c.timeCoverage||_timeCoveragePlan(tr.from,tr.to,''), spanDays:_timeDaySpan(tr.from,tr.to),
      requiredEvents:Array.isArray(c.requiredEvents)?c.requiredEvents:[], forbiddenEvents:Array.isArray(c.forbiddenEvents)?c.forbiddenEvents:[]
    },{source:'teacherCard',teacherGi:gi});
  });
  ss.canon.teacherAt[gi]=ssStamp({teacherVersion:ss.versions.chapterCard||0},{versions:ssVersionSnapshot(),teacherGi:gi});
  return cards;
}
export function ensureCurrentTeacherCards(i){
  const ss=storyState();
  const cur=ss.chapters?.[i]?.card;
  if(cur && ssTeacherVersionsCurrent(cur.teacherGi)) return cur;
  const groups=schoolStageGroups();
  const g=groups.find(x=>i+1>=x.first && i+1<=x.last);
  if(!g) return null;
  const gi=groups.indexOf(g);
  const sc=scState();
  // 只允许从“当前有效”的老师成果恢复机器卡；上游重跑导致 tGi 失效时绝不复活旧教案。
  if(sc.stale && sc.stale['t'+gi]) return null;
  if(!scDone('t'+gi)) return null;
  const t=sc.teachers&&sc.teachers[gi];
  if(!t || !String(t.raw||'').trim()) return null;
  try{
    const cards=commitTeacherChapterCards(String(t.raw),g,gi);
    return cards.find(c=>c.chapter===i+1)||null;
  }catch(e){ return null; }
}
export function chapterCard(i){ return ensureCurrentTeacherCards(i); }
export function chapterPlanAuthority(i){ return chapterCard(i)||null; }

export function storyRuntime(){ const ss=storyState(); ss.runtime=ss.runtime||{version:NOVEL_RUNTIME_VERSION,events:[],knowledge:[],transitions:[],causality:[],foreshadowing:[]}; return ss.runtime; }
export function proposeNovelRuntime(packet={}){ const p=createRuntimeProposal(packet); return {packet:p,validation:validateRuntimePacket(p,storyRuntime())}; }
export function commitNovelRuntime(packet={}){ const r=storyRuntime(); const next=commitRuntimePacket(r,packet); storyState().runtime=next; return next; }

Object.assign(window, {
  normalizeOutline, storyState, storyStateCanonBlock, storyStateChapterBlock, commitPlannedChapterState,
  ssNextVersion, ssVersionSnapshot, ssStamp, ssEntityId, ssEnsureCanonEntities, ssCaptureMasterSnapshot,
  ssProtectMasterCanon, ssProtectCanonFromSnapshot, ssValidateCanon, ssTeacherVersionsCurrent, commitTeacherChapterCards, ensureCurrentTeacherCards,
  chapterCard, chapterPlanAuthority, CHAPTER_STATE_SYS, storyRuntime, proposeNovelRuntime, commitNovelRuntime,
});
