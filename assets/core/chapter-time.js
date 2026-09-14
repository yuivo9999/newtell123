/**
 * Chapter time planning and presentation audit.
 *
 * This module owns the machine-readable time contract helpers. It intentionally
 * reads the legacy runtime through globals during the incremental migration;
 * the pure parsing/calculation functions remain reusable exports.
 */

// 时间系统 v2：时间先作为“状态合同”锁定，再交给正文 AI 做文学表达。
import { rangeFromText, spanDays } from './story-contract.js';
const TIME_OPENERS = [
  '天刚蒙蒙亮','天刚亮','天色刚亮','晨光初现','晨光熹微','清晨','清早','一大早','翌日清晨','第二天清晨','次日清晨',
  '夜幕降临','夜幕落下','夜色降临','夜色深了','夜色渐深','入夜','天黑了','天黑下来','暮色降临','暮色四合','黄昏时分','傍晚时分',
  '午后的阳光','午后','正午时分','日头西斜','夕阳西下','月亮升起','月色落下','黎明时分','深夜时分','深夜里'
];
function _extractPlanTimeRange(plan){
  const raw = extractPlanField(plan, ['剧情时间落点']);
  return rangeFromText(raw);
}
function _globalTimeEntry(i){
  const gt=state.outline&&state.outline._globalTimeline;
  return gt&&Array.isArray(gt.chapters) ? (gt.chapters.find(x=>x&&Number(x.index)===i)||null) : null;
}
function _plannedTimeRange(i){
  const o=state.outline||{}, ge=_globalTimeEntry(i), plan=Array.isArray(o.chapterPlans)?(o.chapterPlans[i]||{}):{}, pr=_extractPlanTimeRange(plan);
  const from=ge&&String(ge.from||'').trim()?String(ge.from).trim():pr.from, to=ge&&String(ge.to||'').trim()?String(ge.to).trim():pr.to;
  const explicit=ge&&String(ge.coverage||'').trim()?String(ge.coverage).trim():extractPlanField(plan,['时间推进安排','时间覆盖安排']);
  return {source:ge?'globalTimeline':(pr.raw?'teacherPlan':''),from,to,jump:ge&&String(ge.jump||'').trim()?String(ge.jump).trim():'',coverage:_timeCoveragePlan(from,to,explicit)};
}
function _timeContractForChapter(i){
  if(!isLong()||!_timeAnchorOn()) return null;
  const cur=_plannedTimeRange(i), prev=i>0?_plannedTimeRange(i-1):null;
  const fc=state.outline&&state.outline._factCard;
  const observedPrev=fc&&Array.isArray(fc.timeAnchors)?fc.timeAnchors.find(x=>x&&x.ch===i-1):null;
  if(!cur.from&&!cur.to&&!prev?.to&&!observedPrev?.time) return null;
  const lines=['【本章时间合同｜生成前机器状态，优先于文学直觉】'];
  lines.push(`- 时间真相来源：${cur.source==='globalTimeline'?'全书规划时间线（最高权威）':cur.source==='teacherPlan'?'老师教案“剧情时间落点”':'上一章已落地状态'}`);
  if(prev&&(prev.from||prev.to)) lines.push(`- 上一章计划收尾：${prev.to||prev.from}`);
  if(observedPrev&&observedPrev.time) lines.push(`- 上一章正文观测收尾（仅供审计，不得覆盖计划）：${observedPrev.time}`);
  if(cur.from) lines.push(`- 本章计划起点：${cur.from}`);
  if(cur.to) lines.push(`- 本章计划终点：${cur.to}`);
  if(cur.jump) lines.push(`- 规划时间跳跃说明：${cur.jump}`);
  if(cur.coverage) lines.push(`- 【时间覆盖计划】${cur.coverage}`);
  const span=spanDays(cur.from,cur.to); if(span!=null && span>=1) lines.push(`- 【跨度硬要求】本章计划跨度约 ${span} 天，正文必须真正抵达计划终点；允许自然跳时/蒙太奇，但不得把多日压缩成同一两天内的连续场景。`);
  lines.push('- 状态规则：本章主线必须从上一章计划终点自然延续；若本章起点晚于上一章终点，只允许用真实时间/空间流逝过桥。');
  lines.push('- 绝对禁止：时间回到上一章已结束的更早时段；上一章已经入睡、休息或结束当日后，本章不得再次用“夜幕降临/黄昏到来/天刚蒙蒙亮”等把同一时段重新开启。');
  lines.push('- 第一场时间锁：第一场只能发生在本章计划起点或其自然延续，不得先写更早的时间氛围段再进入教案。');
  lines.push('- 时间是内部状态，不是写作任务：知道时间即可，不必主动告诉读者。');
  lines.push('- 时间表达预算：默认不要让时间词充当段落/章节开头；同一时间状态不要重复命名。');
  lines.push('- 文学表现优先级：优先通过人物行动、生活节律、环境声音、光线变化、身体状态和场景活动自然体现时间。');
  return lines.join('\n');
}
function auditTimePresentation(i,text){
  const body=String(text||'').trim(), paras=body.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean), openers=[];
  paras.forEach((p,n)=>{const hit=TIME_OPENERS.find(w=>p.startsWith(w));if(hit)openers.push({paragraph:n+1,word:hit});});
  const counts={}; TIME_OPENERS.forEach(w=>{const n=(body.match(new RegExp(escapeRegExp(w),'g'))||[]).length;if(n)counts[w]=n;});
  const repeated=Object.entries(counts).filter(([,n])=>n>=2).map(([w,n])=>`${w}×${n}`);
  const result={chapter:i,openerCount:openers.length,openers:openers.slice(0,12),repeated:repeated.slice(0,12),status:openers.length>=3||repeated.length>=2?'warn':'pass',ts:Date.now()};
  if(state.outline){state.outline._timeAudit=state.outline._timeAudit||{};state.outline._timeAudit[i]=result;}
  return result;
}


export {
  TIME_OPENERS,
  _extractPlanTimeRange,
  _globalTimeEntry,
  _plannedTimeRange,
  _timeContractForChapter,
  auditTimePresentation,
};

Object.assign(window, {
  TIME_OPENERS,
  _extractPlanTimeRange,
  _globalTimeEntry,
  _plannedTimeRange,
  _timeContractForChapter,
  auditTimePresentation,
});
