'use strict';

const APP_VERSION = '1.0.346';
// Version line: app22.js — 正文单次生成版；强化章节事实账本、人物动态反应链、关系差异、潜台词与正文质量审计。
const APP_FILE_VERSION = 'app1.js';
const KEY_CFG = nsKey('cfg');

let _bgTaskCount = 0;
let _bgTaskLabel = '';
function startBgTask(label){ _bgTaskCount++; if(label) _bgTaskLabel = String(label); updateBgTaskIndicator(); }
function endBgTask(){ _bgTaskCount = Math.max(0, _bgTaskCount - 1); updateBgTaskIndicator(); }
function updateBgTaskIndicator(){
  const el = $('#bgTaskIndicator');
  if(!el) return;
  if(_bgTaskCount > 0){
    el.textContent = '⏳ 后台任务 ' + _bgTaskCount + ' 项进行中' + (_bgTaskLabel ? '：' + _bgTaskLabel : '') + '…';
    el.style.display = '';
  } else {
    if(!_bgTaskCount) _bgTaskLabel = '';
    el.style.display = 'none';
  }
}
window.addEventListener('beforeunload', e => {
  if(_bgTaskCount > 0 || state.generating){
    e.preventDefault();
    e.returnValue = '后台任务尚未完成，确定要离开吗？';
  }
});
const KEY_STATE = nsKey('state');
const KEY_INDEX = nsKey('index');
const KEY_PROJ_PREFIX = nsKey('proj_');
const KEY_GLIB = nsKey('glib');
const LS_SINGLE_SAFE = 4.5 * 1024 * 1024;
function lsKeyFor(id){ return KEY_PROJ_PREFIX + id; }
;(function migrateSharedOnce(){
  try{
    const mark = nsKey('_nsmig_v1');
    if(localStorage.getItem(mark)) return;   // 本命名空间已迁移过
    const pairs = [
      ['cfg','fyp_cfg'], ['state','fyp_state'], ['index','fyp_index'], ['glib','fyp_glib'],
      ['lib','fyp_lib'], ['toastLog_v1','fyp_toastLog_v1'],
      ['ailog','fyp_ailog'], ['aiRecipeHist_v1','fyp_aiRecipeHist_v1']
    ];
    for(const [nk, oldk] of pairs){
      const np = nsKey(nk);
      const raw = localStorage.getItem(oldk);
      if(raw != null){ try{ if(localStorage.getItem(np) == null) localStorage.setItem(np, raw); }catch(e){} }
    }
    const keysSnapshot = [];
    for(let i=0; i<localStorage.length; i++){ const k = localStorage.key(i); if(k) keysSnapshot.push(k); }
    const prefPairs = [['proj_','fyp_proj_'], ['rp_','fyp_rp_']];
    for(const [np, op] of prefPairs){
      const opl = op.length;
      for(const k of keysSnapshot){
        if(k.indexOf(op) !== 0) continue;
        const nk = nsKey(np) + k.slice(opl);
        const v = localStorage.getItem(k);
        if(v != null){ try{ if(localStorage.getItem(nk) == null) localStorage.setItem(nk, v); }catch(e){} }
      }
    }
    try{ localStorage.setItem(mark, '1'); }catch(e){}
  }catch(e){}
})();
const MAX_PROJECTS = 500;
let lib = { curId: null, items: [] }; // {curId, items:[{id, idea, outline, ..., step, title, logline, updatedAt}]}
let gglib = [];

/* APP VERSION: app25.js — 正文单次生成版；强化章节内部一致性、信息去重、句式多样与人物动态反应逻辑。 */
const state = {
  mode: 'shortfilm',    // 'shortfilm' 短片 / 'longnovel' 经典长篇小说
  wordRange: null,      // (兼容遗留) 不再作为长篇必填；保留字段避免旧快照破坏
  chapterRange: null,   // (兼容遗留) 同上
  totalWords: null,     // (兼容遗留) 同上
  chapterCount: null,   // 全书章节数量（整数 1-200，生成大纲前唯一必填数字；null=未设）
  idea: '',
  polishMode: 'single',
  polishStatus: 'empty',
  polishSelectedId: null,
  polishDiagnosis: null,
  polishStrategies: [],
  strategicDimensions: [],
  originalIdeaAnchors: null,
  polishCanonical: null,
  // 第三阶段：后续全链路唯一权威故事战略；新流程下游不得直接读取 polishCanonical。
  canonicalStoryStrategy: null,
  polishRevision: 0,
  // 优化构想产生的新增实体/设定只能作为待确认建议，绝不直接进入正式词典。
  polishPendingSuggestions: null,
  // 校长一次性统筹出的逐章章末策略；后续老师/正文只读取，不重新启动校长。
  chapterEndingPlans: {},
  coverPrompt: '',      // 整部小说封面提示词（场景页生成 / 长篇模式用）
  coverWithTitle: false,// 封面提示词是否包含「汉字书名」（false=纯画面无文字）
  outline: null,        // {title, logline, chapters:[{title,summary}]}
  outlineConfirmed: false,
  glossAdherence: 80,
  glossAllowFill: false,
  gsCollapsed: false,
  cpCollapsed: false,   // 学校模式：规划师卡默认展开，初始态即铺开其内容（含🏫学校区）
  ctCollapsed: false,
  soCollapsed: false,
  gsCatFold: { main:false, support:false, walkon:false, place:false, proper:false, sub:false },
  deCollapsed: false,
  polishCollapsed: false,
  subAutoFill: true,
  subRecallRatio: 0.4,
  timeAnchor: true,
  timeAnchorsAuto: true,
  teamShape: 'solo',
  bookBeat: 7,
  openingStrategy: 'none',
  dictmasterHistory: [],
  dictmasterLatest: null,
  dictmasterRan: false,
  originalIdeaSnapshot: '',
  titleWriteBack: false,
  langLayer: true,
  _narrIron: true,
  banList: null,
  useChapterPlans: true,
  plannerFinalized: false,
  chapters: [],         // [{title, content, confirmed, editHistory:[]}]
  characters: [],       // [{name, role, profile:{...}, prompts:{...}}]
  expSel: [],           // 长篇导出勾选的章节索引（随项目快照持久化，P3-4）
  expOpenGroups: [],    // 长篇导出章节选择：手动展开的分组序号（配合限高内滚+分组折叠，缓解超长章节列表，P5）
  hist: { characters:[], scenes:[], cover:[], storyboard:[] },
  chapterStyle: { tags: [], collapsed: false },   // 写作风格（v2.0）：tags=风格id数组（多选，归入章节风格组）
  scenes: [],           // [{name, 作用, description, prompt}]
  storyboard: [],       // [{镜号,章节,时长,景别,角度,运镜,主体,构图,光线,画面描述,对白,转场,出图提示词,连续性,剪辑动机}]
  boardConcepts: [],    // 每章一条 {视觉概念, 母题}（分镜生成时随章节返回）
  titleHistory: [],     // 曾用书名记录 [{name, date}]（改名时追加，最新在前）
  raw: {},              // 容错：各阶段原始返回
  longMemory: { uiOpen: false, foreshadow: [], lastAuditAt: 0 },
};
let currentStep = 1;

state.fcCollapsed = (typeof state.fcCollapsed === 'boolean') ? state.fcCollapsed : false;
state.rsCollapsed = (typeof state.rsCollapsed === 'boolean') ? state.rsCollapsed : false;
state._fixQueue = state._fixQueue || [];
state._chapterPartial = state._chapterPartial || {};
state.timeAnchorsAuto = (typeof state.timeAnchorsAuto === 'boolean') ? state.timeAnchorsAuto : true;
state.timeAnchor = true; // 遗留兼容：已弃用，时间是否生效改为以 outline._globalTimeline 是否存在为准
function _timeAnchorOn(){ const _gt = state.outline && state.outline._globalTimeline; return !!_gt && ( (String(_gt.text||'').trim()) || (Array.isArray(_gt.chapters) && _gt.chapters.length) ); }
function _timeAnchorsAutoOn(){ return isLong() && state.timeAnchorsAuto !== false; }
function _timeBranch(s){ s = String(s||'').trim(); if(!s) return ''; const i = s.search(/[·|｜.．:：－\-]/); return i>0 ? s.slice(0,i).trim() : s; }
function _cnDayNum(n){ const t={'零':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,'十一':11,'十二':12,'十三':13,'十四':14,'十五':15,'十六':16,'十七':17,'十八':18,'十九':19,'二十':20}; return t[n]!=null ? t[n] : null; }
function _timeOrdinal(s){
  s = String(s||'').trim(); if(!s) return null;
  let day = null;
  const d1 = s.match(/第\s*(\d+)\s*(?:天|日)/); if(d1) day = +d1[1];
  else { const d2 = s.match(/第\s*([一二三四五六七八九十]+)\s*(?:天|日)/); if(d2) day = _cnDayNum(d2[1]); }
  if(day==null && /次[日天]|翌[日天]/.test(s)) day = 2;
  else if(day==null && /当[日天]|本[日天]/.test(s)) day = 1;
  const hrWords=[['凌晨',3],['清晨',6],['早晨',7],['早上',8],['上午',9],['中午',12],['正午',12],['午后',14],['下午',15],['黄昏',18],['傍晚',18],['晚上',19],['夜晚',20],['夜里',20],['入夜',19],['深夜',23],['半夜',0],['子时',23],['卯时',5],['辰时',7],['巳时',9],['午时',12],['未时',13],['申时',15],['酉时',17],['戌时',19],['亥时',21]];
  let hr=-1; for(const [w,h] of hrWords){ if(s.includes(w)){ hr=h; break; } }
  if(hr===-1){ const hf=s.match(/第\s*(\d+)\s*个?小时|(\d+)\s*(?:点|时)/); if(hf&&(hf[1]||hf[2])) hr = +(hf[1]||hf[2]); }
  if(day==null && hr===-1) return null;
  return ((day==null?0:day-1)*24) + (hr===-1?0:hr);
}
function _timeRewind(a, b){
  if(!String(a||'').trim() || !String(b||'').trim()) return false;
  const oa = _timeOrdinal(a), ob = _timeOrdinal(b);
  if(oa==null || ob==null) return false;
  return ob < oa;
}
function _timeSpanHours(from,to){ const a=_timeOrdinal(from), b=_timeOrdinal(to); return (a==null||b==null)?null:Math.max(0,b-a); }
function _timeDaySpan(from,to){ const a=_timeOrdinal(from), b=_timeOrdinal(to); if(a==null||b==null) return null; return Math.max(0,Math.floor(b/24)-Math.floor(a/24)+1); }
function _timeCoveragePlan(from,to,explicit){
  if(String(explicit||'').trim()) return String(explicit).trim();
  const a=_timeOrdinal(from), b=_timeOrdinal(to); if(a==null||b==null||b<=a) return '单日连续推进';
  const days=[]; for(let d=Math.floor(a/24)+1; d<=Math.floor(b/24)+1; d++) days.push(`第${d}日`);
  return days.map((d,idx)=>idx===0?`${d}：承接并启动`:idx===days.length-1?`${d}：收束并抵达本章终点`:`${d}：完成至少一次可观察的剧情推进或自然时间流逝`).join('；');
}

// 时间系统 v2：时间先作为“状态合同”锁定，再交给正文 AI 做文学表达。
const TIME_OPENERS = [
  '天刚蒙蒙亮','天刚亮','天色刚亮','晨光初现','晨光熹微','清晨','清早','一大早','翌日清晨','第二天清晨','次日清晨',
  '夜幕降临','夜幕落下','夜色降临','夜色深了','夜色渐深','入夜','天黑了','天黑下来','暮色降临','暮色四合','黄昏时分','傍晚时分',
  '午后的阳光','午后','正午时分','日头西斜','夕阳西下','月亮升起','月色落下','黎明时分','深夜时分','深夜里'
];
function _extractPlanTimeRange(plan){
  const raw = extractPlanField(plan, ['剧情时间落点']);
  if(!raw) return {raw:'',from:'',to:''};
  const t=String(raw).trim();
  const sm=t.match(/起点\s*[=：:]\s*([^；;\n]+?)(?=\s*(?:[；;]|终点\s*[=：:]))/);
  const em=t.match(/终点\s*[=：:]\s*([^；;\n]+?)(?:\s*[；;].*)?$/);
  if(sm||em) return {raw:t,from:(sm?sm[1]:'').trim(),to:(em?em[1]:'').trim()};
  const m=t.match(/(?:从\s*)?(.+?)\s*(?:到|至|—|–|→|->)\s*(.+)$/);
  return m ? {raw:t,from:m[1].trim(),to:m[2].trim()} : {raw:t,from:t,to:t};
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
  const span=_timeDaySpan(cur.from,cur.to); if(span!=null && span>=1) lines.push(`- 【跨度硬要求】本章计划跨度约 ${span} 天，正文必须真正抵达计划终点；允许自然跳时/蒙太奇，但不得把多日压缩成同一两天内的连续场景。`);
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

state.aiNetwork = state.aiNetwork || {
  stage: 'idle',          // idle / idea / recipe / outline / titles / plan / writing / review
  running: [],            // 当前正在运行的 AI kind 列表
  completed: [],          // 已完成的 AI kind 列表
  blockedBy: {}           // 每个 AI 被谁阻塞
};

function normalizeOutline(o){
  if(!o) return;
  if(o.structure) delete o.structure;
  o._rollingSummaries = o._rollingSummaries || [];
  o._factCard = o._factCard || { characters:{}, timeline:[], lastScene:'' };
  o._timeAudit = o._timeAudit || {};
  // app21：章节内部质量账本。它只记录审计后已经写成的事实/信息与人物认知，
  // 不拥有创作权；下一章仅把它作为“已知状态”参考，不能覆盖词典/教案。
  o._chapterQualityLedger = o._chapterQualityLedger || {};
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
  o._storyState.schema=2; o._storyState.versions=o._storyState.versions||{dictMaster:0,dictEnrich:0,principal:0,chapterCard:0};
  o._principalChapterTasks = o._principalChapterTasks || {}; o._storyState.canon=o._storyState.canon||{dictmasterAt:0,dictEnrichAt:0,principalAt:0,teacherAt:{},masterSnapshot:null}; o._storyState.canon.teacherAt=o._storyState.canon.teacherAt||{};
  o._storyState.canon = o._storyState.canon || {dictmasterAt:0,dictEnrichAt:0,principalAt:0,teacherAt:{}};
  o._storyState.chapters = o._storyState.chapters || {};
  o._storyState.current = o._storyState.current || {chapter:-1,time:'',location:'',characters:{},endingState:'',openThreads:[]};
}

function storyState(){
  const o=state.outline || (state.outline={});
  normalizeOutline(o);
  return o._storyState;
}
function storyStateCanonBlock(){
  const c=storyState().canon||{};
  const strategy = currentCanonicalStoryStrategy();
  const strategyLine = strategy ? `\n- 当前有效故事战略：${String(strategy.candidateName||'已采用方案')}（唯一权威来源，后续 AI 不得读取旧 polish 结果）` : '\n- 当前有效故事战略：尚未建立。';
  return `【小说创作权限链｜系统状态】${strategyLine}
- 词典达人：创造并定稿全局核心设定；词典充实：在既有世界内继续创造扩建素材。
- 校长：组织全书结构、阶段、标题和学校纪律；老师：组织自己负责章节的教案。
- 正文AI：负责文学表达与现场执行，不重新定义世界、人物核心事实或章节主线。
- 状态AI：只记录正文已经写成的事实，不拥有创作裁决权。
- 核心原则：AI可以大胆创造；进入正式词典/规划/正文状态后，必须尊重其来源与权限，不得偷偷改写。
- 当前链路：${c.dictmasterAt?'词典达人✓':'词典达人待完成'} → ${c.dictEnrichAt?'词典充实✓':'词典充实待完成'} → ${c.principalAt?'校长✓':'校长待完成'} → 老师分组备课 → 正文执笔。`;
}
function storyStateChapterBlock(i){
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
function commitPlannedChapterState(i, plan, source){
  const ss=storyState(), p=ss.chapters[i]=ss.chapters[i]||{}, tr=_extractPlanTimeRange(plan);
  const coverage=String(extractPlanField(plan,['时间推进安排','时间覆盖安排'])||'').trim() || _timeCoveragePlan(tr.from,tr.to,'');
  p.planned={time:tr.raw||'',from:tr.from||'',to:tr.to||'',coverage,spanDays:_timeDaySpan(tr.from,tr.to),continuity:String(extractPlanField(plan,['连续性','承接'])||'').trim(),cast:String(extractPlanField(plan,['本章出场名单'])||'').trim(),location:String(extractPlanField(plan,['场景地点','主要地点','地点'])||'').trim(),endState:String(extractPlanField(plan,['收束状态','章末状态'])||'').trim()};
  const prev=ss.chapters[i-1]&&ss.chapters[i-1].planned;
  p.boundaryAudit = { rewind:false, note:'' };
  if(prev && prev.to && p.from && _timeRewind(prev.to,p.from)){ p.boundaryAudit.rewind=true; p.boundaryAudit.note=`第${i}章计划起点「${p.from}」早于上一章计划终点「${prev.to}」`; }
  p.plannedAt=Date.now(); p.plannedSource=source||'teacher'; return p.planned;
}
const CHAPTER_STATE_SYS = `你是长篇小说“正文状态结算器”，不是作者、不是编辑。只从已经写完的正文提取实际发生的状态，供下一章承接。
规则：只记录正文明确发生/明确说出/直接可观察的事实；不确定就留空；不得脑补；不得修改教案、时间线、词典或剧情计划；只记录实际写成了什么。输出严格JSON：{"time":"","location":"","characters":{"人物":"章末状态"},"endingState":"","openThreads":[],"newFacts":[]}`;

/* ===================== v4 小说创作状态引擎 ===================== */
function ssNextVersion(kind){
  const ss=storyState(); ss.versions=ss.versions||{}; ss.versions[kind]=(Number(ss.versions[kind])||0)+1; return ss.versions[kind];
}
function ssVersionSnapshot(){
  const ss=storyState(); const v=ss.versions||{};
  return { pipeline:Number(ss.pipelineVersion)||0, dictMaster:Number(v.dictMaster)||0, dictEnrich:Number(v.dictEnrich)||0, principal:Number(v.principal)||0 };
}
function ssStamp(obj, extra){ return Object.assign({versions:ssVersionSnapshot(),ts:Date.now()}, extra||{}, obj||{}); }
function ssEntityId(prefix,name){
  const raw=String(name||'').trim(); let h=0; for(let i=0;i<raw.length;i++) h=((h<<5)-h+raw.charCodeAt(i))|0;
  return `${prefix}_${Math.abs(h).toString(36)}`;
}
function ssEnsureCanonEntities(){
  const g=(state.outline&&state.outline.glossary)||{};
  [['characters','ch'],['places','pl'],['propernouns','pn']].forEach(([k,p])=>{
    (g[k]||[]).forEach(x=>{ if(!x||!String(x.name||'').trim()) return; x.id=x.id||ssEntityId(p,x.name); x.source=x.source|| (x._dictmaster?'dictmaster':x._enrich?'dictEnrich':'legacy'); x.createdBy=x.createdBy||x.source; x.createdAt=x.createdAt||x._srcTs||Date.now(); });
  });
}
function ssCaptureMasterSnapshot(){
  const g=(state.outline&&state.outline.glossary)||{}; const ss=storyState();
  const pick=(k,fields)=> (g[k]||[]).filter(Boolean).map(x=>{const o={}; fields.forEach(f=>o[f]=x[f]==null?'':x[f]); o.id=x.id||ssEntityId(k.slice(0,2),x.name); return o;});
  ss.canon=ss.canon||{};
  ss.canon.masterSnapshot={
    characters:pick('characters',['id','name','identity','age','gender','appearance','hobby','relation','trait','catchphrase']),
    places:pick('places',['id','name','type','note']),
    propernouns:pick('propernouns',['id','name','note']),
    relationshipTable:(g._relationshipTable||[]).map(x=>({...x})), placeContacts:(g._placeContacts||[]).map(x=>({...x})), properContacts:(g._properContacts||[]).map(x=>({...x})), worldRules:(g._worldRules||[]).map(x=>({...x}))
  };
}
function ssProtectMasterCanon(){
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
function parseTeacherChapterCards(raw, g, gi){
  const lines=String(raw||'').replace(/\r\n?/g,'\n').split('\n'); const starts=[];
  const head=/^\s*(?:#{1,6}\s*)?第\s*(\d+)\s*章(?:\s+.*|\s*(?:《[^》]*》|\([^)]*\)|（[^）]*）|[:：、.．\-–—].*))?\s*$/;
  for(let i=0;i<lines.length;i++){const m=lines[i].match(head); if(m) starts.push({line:i,ch:+m[1]});}
  const cards=[];
  const batonRe = /^\s*#+\s*本阶段向下一阶段移交(?:的)?/;
  const batonLines = [];
  for(let i=0;i<lines.length;i++){ if(batonRe.test(String(lines[i]||''))) batonLines.push(i); }
  for(let z=0;z<starts.length;z++){
    const a=starts[z];
    const nextChapterLine = starts[z+1]?.line ?? lines.length;
    const batonLine = batonLines.find(line => line > a.line && line < nextChapterLine);
    const b = batonLine != null ? batonLine : nextChapterLine;
    if(a.ch<g.first||a.ch>g.last) continue;
    const block=lines.slice(a.line,b).join('\n').trim();
    const field=(labels)=>{const re=new RegExp(`(?:^|\\n)\\s*[-*]?\\s*(?:${labels.map(x=>escapeRegExp(x)).join('|')})\\s*[：:]\\s*([^\\n]+)`,'m'); const m=block.match(re); return m&&m[1]!=null?m[1].trim():'';};
    const section=(label)=>{const re=new RegExp(`(?:^|\\n)\\s*[-*]?\\s*${escapeRegExp(label)}\\s*[：:]\\s*([\\s\\S]*?)(?=\\n\\s*[-*]?\\s*(?:本章风格施工指令|功能与位置|剧情时间落点|主要地点|章末状态|本章推进骨架|情绪走向与突出点|连续性|本章出场名单)\\s*[：:]|$)`,'m'); const m=block.match(re); return m?m[1].trim():'';};
    const title=(lines[a.line].match(/《([^》]+)》/)||[])[1]||`第${a.ch}章`;
    const beats=section('本章推进骨架');
    const cast=field(['本章出场名单']);
    const card={chapter:a.ch,title,style:field(['本章风格施工指令']),function:field(['功能与位置']),time:field(['剧情时间落点']),timeCoverage:field(['时间推进安排','时间覆盖安排']),location:field(['主要地点','场景地点','主要场景']),beats,emotion:field(['情绪走向与突出点']),continuity:section('连续性'),cast,raw:block,requiredEvents:[],forbiddenEvents:[],entryState:'',endingState:field(['章末状态','收束状态'])};
    card.entryState=(card.continuity.match(/承接物理态[】）)）]?\s*[：:]?\s*([^\n]+)/)||[])[1]||'';
    card.endingState=field(['章末状态','收束状态']) || (card.continuity.match(/(?:章末|收束)[^：:]*[：:]\s*([^\n]+)/)||[])[1]||'';
    // 从骨架中提取“不得/禁止/严禁”作为机器禁项，避免把所有细节强行结构化。
    card.forbiddenEvents=(block.match(/[^\n。]{0,80}(?:不得|禁止|严禁)[^\n。]{0,120}/g)||[]).slice(0,12).map(x=>x.trim());
    card.requiredEvents=(beats.match(/(?:①|②|③|④|⑤|⑥|⑦|⑧)[\s\S]*?(?=(?:①|②|③|④|⑤|⑥|⑦|⑧)|$)/g)||[]).map(x=>x.replace(/^\s*[①-⑧]\s*/,'').trim()).filter(Boolean);
    cards.push(card);
  }
  return cards;
}
function validateChapterCard(card){
  if(!card) return '章节卡为空';
  const miss=[]; if(!card.title) miss.push('标题'); if(!card.beats) miss.push('推进骨架'); if(!card.continuity) miss.push('连续性'); if(!card.cast) miss.push('出场名单');
  if(card.time && /起点\s*[=：:]\s*[^；;]+[；;]\s*终点\s*[=：:]/.test(String(card.time)) && !String(card.timeCoverage||'').trim()) miss.push('时间推进安排');
  if(miss.length) return '缺少：'+miss.join('、');
  return '';
}
function commitTeacherChapterCards(raw,g,gi){
  const ss=storyState(), parsed=parseTeacherChapterCards(raw,g,gi), byChapter=new Map(parsed.map(c=>[Number(c.chapter),c]));
  const teacherTs=Number((state.school?.teachers?.[gi]||{}).ts)||Date.now();
  ss.chapters=ss.chapters||{};
  const committed=[];
  for(let n=g.first;n<=g.last;n++){
    let c=byChapter.get(n);
    // 教案本身就是老师成功产出的事实，不再因为某个结构化字段缺失而判老师失败。
    // 如果 AI 少了个章节标题，仍保留该组完整 raw，给正文一个可读取的最小机器卡。
    if(!c){
      c={chapter:n,title:`第${n}章`,style:'',function:'',time:'',timeCoverage:'',location:'',beats:'',emotion:'',continuity:'',cast:'',raw:String(raw||''),requiredEvents:[],forbiddenEvents:[],entryState:'',endingState:''};
    }
    const i=n-1, tr=_extractPlanTimeRange(c.time);
    const card=Object.assign({},c,{teacherGi:gi,teacherTs});
    ss.chapters[i]=ss.chapters[i]||{};
    // 不再写 chapterVersion，也不再写 canon.teacherAt；教案没有“旧版/当前版”概念。
    ss.chapters[i].card=card;
    ss.chapters[i].planned={
      time:tr.raw||c.time||'', from:tr.from||'', to:tr.to||'', continuity:c.continuity||'', cast:c.cast||'',
      location:c.location||'', endState:c.endingState||'', entryState:c.entryState||'', coverage:c.timeCoverage||_timeCoveragePlan(tr.from,tr.to,''), spanDays:_timeDaySpan(tr.from,tr.to),
      requiredEvents:Array.isArray(c.requiredEvents)?c.requiredEvents:[], forbiddenEvents:Array.isArray(c.forbiddenEvents)?c.forbiddenEvents:[],
      source:'teacherCard',teacherGi:gi,teacherTs
    };
    committed.push(card);
  }
  return committed;
}
function ensureCurrentTeacherCards(i){
  const ss=storyState();
  const groups=schoolStageGroups();
  const g=groups.find(x=>i+1>=x.first && i+1<=x.last);
  if(!g) return null;
  const gi=groups.indexOf(g);
  // 老师最新一次成功生成的 raw 就是唯一教案来源。
  // 这里不比较任何“当前版/旧版”版本号；只用本次老师生成时间，避免老师重新备课后继续误用旧卡。
  const sc=scState();
  const t=sc.teachers&&sc.teachers[gi];
  const existing=ss.chapters?.[i]?.card;
  if(t && existing && Number(existing.teacherGi)===Number(gi) && Number(existing.teacherTs||0)===Number(t.ts||0)) return existing;
  if(!t || !String(t.raw||'').trim()) return null;
  try{
    const cards=commitTeacherChapterCards(String(t.raw),g,gi);
    return cards.find(c=>Number(c.chapter)===Number(i+1))||null;
  }catch(e){ return null; }
}
function chapterCard(i){ return ensureCurrentTeacherCards(i); }
function chapterPlanAuthority(i){ return chapterCard(i)||null; }

// 三道保险 P1：把“本章剧情边界”从提示词变成程序可读取的契约。
function chapterBoundaryContract(i){
  const c = chapterPlanAuthority(i); const o = state.outline || {};
  const n = i + 1; const total = realChapterCount() || (o.chapters||[]).length || 0;
  const next = (o.chapters && o.chapters[i+1]) || null;
  const nextTitle = next ? String(next.title||'').trim() : '';
  const ending = String(c?.endingState||'').trim();
  const beats = String(c?.beats||'').trim();
  const req = Array.isArray(c?.requiredEvents) ? c.requiredEvents : [];
  const lastBeat = req.length ? req[req.length-1] : '';
  return {chapter:n,total,isLast:n>=total,nextTitle,ending,lastBeat,beats,card:c};
}

// 三道保险 P3：只拦截“明确的结构性越界”，不按字数粗暴砍正文。
// 一旦检测到下一章标题/阶段移交标题，从该标题开始安全截断，并回退到完整段落。
function enforceChapterBoundary(i, text){
  let s = String(text||'').replace(/\r\n?/g,'\n').trim();
  if(!s) return s;
  const b = chapterBoundaryContract(i);
  const lines = s.split('\n');
  const nextN = b.chapter + 1;
  const nextHead = new RegExp(String.raw`^\s*(?:#+\s*)?第\s*${nextN}\s*章(?:\s+.*|\s*(?:《[^》]*》|[:：、.．\-–—].*))?\s*$`);
  const batonHead = /^\s*#+\s*本阶段向下一阶段移交(?:的)?/;
  for(let k=0;k<lines.length;k++){
    const ln=String(lines[k]||'');
    if(batonHead.test(ln) || (!b.isLast && nextHead.test(ln))) {
      let cut = lines.slice(0,k).join('\n').trim();
      const paras = cut.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
      if(paras.length) cut = paras.join('\n\n');
      return cut || s;
    }
  }
  return s;
}

/* ===================== app21：章节内部信息/人物质量账本 =====================
 * 目的：解决“同一章内逻辑不清、前后打架、信息重复、句式频繁、人物像在交代设定”。
 * 账本只记录已写成的事实，不参与创作裁决；它服务于下一次正文生成与本章审计。
 */
function chapterQualityLedger(i){
  const o = state.outline || {};
  o._chapterQualityLedger = o._chapterQualityLedger || {};
  const x = o._chapterQualityLedger[i];
  return x && typeof x === 'object' ? x : null;
}

/* ===================== app22：人物动态反应引擎 =====================
 * 把“性格标签”升级为可执行的“刺激→判断→冲突→选择→外显→潜台词→后果”链。
 * 稳定内核不等于固定动作；人物在不同压力、关系和信息条件下应产生不同层次的选择。
 */
function buildChapterCharacterDynamicReactionBlock(i){
  const o=state.outline||{}, g=o.glossary||{}, card=chapterPlanAuthority(i)||{};
  const castRaw=String(card.cast||'').trim(), chars=Array.isArray(g.characters)?g.characters:[], names=[];
  const add=n=>{n=String(n||'').trim(); if(n&&!names.includes(n)) names.push(n);};
  chars.forEach(c=>{const n=String(c&&c.name||'').trim(); if(n&&castRaw&&castRaw.includes(n)) add(n);});
  if(!names.length){const p=String(o?.navBeacon?.protagonist||'').split(/[，,：:（(]/)[0].trim(); if(p)add(p);}
  if(!names.length) return '';
  const rows=names.slice(0,12).map(n=>{const c=chars.find(x=>String(x&&x.name||'').trim()===n)||{}; return `- ${n}｜身份:${String(c.identity||'未知').trim()}｜稳定内核:${String(c.trait||'未知').trim()}｜关系底色:${String(c.relation||'未知').trim()}｜习惯:${String(c.hobby||'未知').trim()}｜口头特征(低频):${String(c.catchphrase||'无').trim()}`;}).join('\n');
  return `【人物动态反应引擎｜app22】
人物鲜明不是“每句话都像这个人”，也不是重复口癖；要求“同一个人，在不同压力下仍有同一个内核，但会作出不同层次的选择”。
${rows}

【每个关键人物反应的内部因果链】
刺激/事件 → 当下看见或知道什么 → 最即时的判断 → 想得到/避免什么 → 与对方关系带来的顾虑 → 情绪/利益冲突 → 选择（说/不说/做/不做/先做再说）→ 外显动作或对白 → 潜台词 → 对剧情或关系造成的后果。

【人物层次规则】
1. 不直接写“他很嘴硬/她很善良”作为性格证明，让读者从选择和后果看出来。
2. 同一性格允许出现拒绝、沉默、转移、先行动后承认、玩笑遮掩、突然让步、事后补救等不同表现，必须由情境触发。
3. 核心倾向可以稳定，但表层行为必须受“当前目标、压力、关系、已知信息、过去经验”影响。
4. 人物只能使用自己已经知道或当下获得的信息。
5. 同一事件让不同人物作不同选择：差异来自目标、价值排序、关系和经验，而不是为了凑不同句式。
6. 人物面对亲人、朋友、陌生人、对手、上下级时的表达可受关系影响，但禁止机械套模板。
7. 人物反常时必须有压力、认知变化或关系变化作为依据；否则视为人设漂移。
8. 重要场面尽量留下至少一个“不靠形容词就能证明性格”的行为选择。
9. 口头禅、固定动作低频使用；连续重复时换成另一种符合内核的行为表达。
10. 真实交流允许打断、误解、回避、答非所问、只回应一半和用行动代替回答。

【禁止的假鲜明】
“嘴硬”≠每次都先拒绝再答应；“善良”≠每次都主动帮助；“聪明”≠每次都替作者解释设定；“冷静”≠每次都冷淡短句。`;
}

function buildChapterDialogueSubtextBlock(i){
  return `【对话潜台词与人物声音锁｜app22】
重要对白应有真实交流目的：索取、拒绝、试探、遮掩、安慰、威胁、争取、拖延、确认、转移、讽刺、让步、保护关系或改变对方选择。
人物声音差异不要靠口癖，而靠信息取舍、句长、直接程度、主动/被动回应、是否回答重点、暴露程度以及面对压力时的变化。
如果一句对白主要只是向读者重复世界观、人物履历或已经讲清的事实，应优先改成有交流目的的表达，或让行动、物件、沉默承担信息。
潜台词不是故作高深：读者应能从上下文推断人物真正想做什么。`;
}

function buildChapterLocalInfoLedgerBlock(i){
  const cur=chapterQualityLedger(i), prev=chapterQualityLedger(i-1);
  const pick=(x,k)=>Array.isArray(x?.[k])?x[k].slice(0,20):[];
  const lines=[`【本章局部信息账本｜app22】`,`写作时区分：事实、第一次揭示、人物知情、关系变化、道具/地点状态、未确认猜测。`,`同一章内信息第一次真正落地后，后续默认读者已经知道；再次出现必须带来新证据、新视角、新后果或认知变化。`,`“谁知道什么”与“读者知道什么”不是同一回事；禁止让角色为了替作者讲解而越过自己的知情边界。`];
  if(prev){if(pick(prev,'introducedInfo').length)lines.push(`【上一章已介绍】${pick(prev,'introducedInfo').join('；')}`);if(pick(prev,'characterKnowledge').length)lines.push(`【上一章人物知情】${pick(prev,'characterKnowledge').join('；')}`);}
  if(cur){if(pick(cur,'facts').length)lines.push(`【本章已确认事实】${pick(cur,'facts').join('；')}`);if(pick(cur,'introducedInfo').length)lines.push(`【本章已介绍】${pick(cur,'introducedInfo').join('；')}`);}
  lines.push(`本章每出现重要新信息，内部标记其首次落地方式（行动/对白/观察/物件/结果）；后续不要再用同一种方式完整解释。`);
  return lines.join('\n');
}

function buildChapterCharacterBehaviorBlock(i){
  const o = state.outline || {}, g = o.glossary || {};
  const card = chapterPlanAuthority(i);
  const castRaw = String(card?.cast || '').trim();
  const names = [];
  const all = Array.isArray(g.characters) ? g.characters : [];
  const addName = n => {
    n = String(n||'').trim();
    if(n && !names.includes(n)) names.push(n);
  };
  all.forEach(c=>{
    const n=String(c&&c.name||'').trim();
    if(n && castRaw && castRaw.includes(n)) addName(n);
  });
  if(!names.length){
    const protagonist = String(o?.navBeacon?.protagonist||'').split(/[，,：:（(]/)[0].trim();
    if(protagonist) addName(protagonist);
  }
  if(!names.length) return '';
  const rows = names.slice(0,12).map(n=>{
    const c=all.find(x=>String(x&&x.name||'').trim()===n) || {};
    const trait=String(c.trait||'').trim(), rel=String(c.relation||'').trim(), hobby=String(c.hobby||'').trim();
    const identity=String(c.identity||'').trim();
    const pieces=[];
    if(identity) pieces.push(`身份:${identity}`);
    if(trait) pieces.push(`性格内核:${trait}`);
    if(rel) pieces.push(`关系底色:${rel}`);
    if(hobby && hobby!=='未知') pieces.push(`习惯/兴趣:${hobby}`);
    return `- ${n}：${pieces.join('；')||'暂无可用性格资料'}`;
  }).join('\n');
  return `【人物反应逻辑｜稳定内核，不是固定口癖】
以下只提供人物“为什么会这样反应”的底层依据，不要求每次都重复同一口癖、动作或句式。
${rows}
【执行方式】
1. 同一件事先问：此人最在意什么、最怕什么、想得到什么、与对方是什么关系？再决定他说什么或不说什么。
2. 性格优先通过选择、让步、拒绝、误解、行动、沉默、打断、试探、具体要求和事后补救表现。
3. 同一人物在不同压力下可以有不同层次：嘴硬后让步、嘴上拒绝却先行动、表面平静但改变做法等；不要把“性格标签”直接写成旁白说明。
4. 主要人物之间必须保留反应差异：不要让所有人面对同一事实都用相似的惊讶、感动、愤怒、解释和总结句式。
5. 口头禅只是偶尔出现的声音特征，不是人物塑造主工具。`;
}

function buildChapterInformationGuard(i){
  const prev = chapterQualityLedger(i-1);
  const ss = storyState();
  const prevObs = ss?.chapters?.[i-1]?.observed;
  const lines = [`【章节内部信息账本｜写作前只读】`,
    `本章写作必须区分：已经成立的事实、人物已知信息、第一次揭示的新信息、尚未证实的猜测。`,
    `关键原则：一个信息第一次讲清后，后续默认读者已知道；除非出现新证据、新后果、新视角或人物认知改变，否则不要再次完整解释。`,
    `人物知情边界：角色只能使用自己已经知道或当下通过感官/行动获得的信息；不得为了让读者明白而让角色说出他没有理由知道的设定。`];
  if(prevObs){
    lines.push(`【上一章已落地状态｜不可偷偷改写】${JSON.stringify(prevObs).slice(0,5000)}`);
  }
  if(prev){
    const facts = Array.isArray(prev.facts)?prev.facts:[];
    const info = Array.isArray(prev.introducedInfo)?prev.introducedInfo:[];
    const know = Array.isArray(prev.characterKnowledge)?prev.characterKnowledge:[];
    const rel = Array.isArray(prev.relationshipChanges)?prev.relationshipChanges:[];
    if(facts.length) lines.push(`【前章事实账】${facts.slice(0,20).join('；')}`);
    if(info.length) lines.push(`【前章已介绍信息】${info.slice(0,20).join('；')}`);
    if(know.length) lines.push(`【前章人物知情】${know.slice(0,20).join('；')}`);
    if(rel.length) lines.push(`【前章关系变化】${rel.slice(0,12).join('；')}`);
  }
  lines.push(`【本章内部记忆方式】正文AI在内部维护三列：①本章已明确成立；②本章刚刚新增；③仍未确认/只是猜测。新增信息一旦落地，后续只写其影响，不再把原信息重新讲一遍。`);
  return lines.join('\n');
}

function chapterQualityPromptBlock(){
  return `【本章质量执行锁】
写完每一段后在内部快速复核，不输出检查过程：
- 逻辑：人物为什么在此时做这件事？前置条件、信息来源、空间与时间是否成立？
- 一致：刚刚确定的身份、关系、时间、地点、道具、能力和人物认知，后文是否继续成立？
- 去重：本章已经解释过的事实是否又被完整换句重讲？如果只是自然提及可以保留，重复科普必须删掉或改成新后果。
- 句式：连续段落是否长期使用同一种句法骨架或动作+对白模板？若是，改变叙述焦点或动作逻辑，不要机械换同义词。
- 对话：这句话是在“做事/争取/拒绝/试探/回避/伤人/安慰/让步”，还是仅仅在给读者交代设定？若只是后者，改成有目的的对话、行动或留白。
- 人物：人物反应是否来自自己的目标、关系、经验与性格？是否与其他人有区别？是否出现“所有人都替作者解释”的同声同气？
- 人物层次：关键人物是否出现“刺激→判断→冲突→选择→外显→潜台词→后果”的一部分链条？是否有不靠形容词就能证明性格的行为选择？
- 性格连续性与变化：稳定的是内核，不是动作模板；若人物反常，是否有压力、认知变化或关系变化作为依据？
- 关系差异：人物面对不同对象时，表达是否受到关系和权力结构影响，而不是套用同一套语气？
- 对话潜台词：重要对白是否在做事，而不只是向读者交代设定？是否有打断、回避、误解或行动代替回答？
- 鲜明不等于口癖：稳定的是反应逻辑，不是固定动作或固定句尾。`;
}

const CHAPTER_AUDIT_SYS=`你是长篇小说“状态与叙事质量审计AI”。你没有创作权，只负责检查正文是否忠实执行机器章节卡、上一章真实状态、世界词典，并检查同一章内部的逻辑与文学执行质量。
只检查可验证问题，不因个人审美偏好判错。重点检查：
1. 时间倒退/不可达、地点瞬移、人物生死与身体状态、关系变化、道具持有、世界规则、信息知情边界；
2. 章节必做事件缺失、禁项违规、凭空出现会持续存在的新核心实体；
3. 同一章内部前后矛盾：同一人物身份/关系/年龄、同一地点、时间、道具、能力、事实或认知状态发生无解释冲突；
4. 信息重复：同一关键事实在本章被完整解释两次以上，且第二次没有新证据、新视角、新后果或认知变化；
5. 逻辑不清：关键行动缺少动机、前置条件、信息来源或因果桥；
6. 对话设定化：角色用不符合当下目的的长段对白给读者讲背景/规则/人物履历；若该信息本可通过行动、冲突、试探、回避、物件或后果自然呈现，应视为质量问题；
7. 人物同质化：不同人物面对同一事实使用近似反应、相同情绪词、相同动作/句式；或人物性格只靠口癖而没有选择与行为体现；
8. 人物层次不足：人物只有静态性格标签，没有当前目标/关系/压力导致的具体选择；同一人物机械重复同一口癖、动作或反应模板；或突然反常却没有事件、认知、关系依据；
9. 对话声音同质：不同人物只是换了名字，信息取舍、直接程度、回应方式、暴露程度和潜台词没有明显差异；
10. 句式频繁：连续多个段落反复使用同一种语法骨架、动作+对白+总结结构或同一种情绪收束方式。只有明显影响阅读时才判问题。
审计必须区分“自然重复/必要回顾”和“重复解释”；不能为了追求零重复而破坏人物回忆、强调或因果承接。
输出严格JSON：
{"status":"PASS|WARN|FAIL","issues":[{"type":"time|location|character|relationship|object|rule|knowledge|event|entity|causal|logic|contradiction|repetition|dialogue_exposition|character_flat|character_layer|character_voice|character_knowledge|sentence_pattern","severity":"warn|fail","evidence":"正文中的明确证据","expected":"应有状态/写法","actual":"实际写法","repair":"最小修复方向"}],"summary":"一句话","qualityLedger":{"facts":[],"introducedInfo":[],"characterKnowledge":[],"relationshipChanges":[],"objects":[],"locations":[],"unresolved":[]}}
qualityLedger只记录本章正文明确成立或明确新增的信息，禁止脑补；每项尽量≤50字，最多各20项。`;

async function auditChapterState(i,text){
  if(!isLong()) return null; const o=state.outline||{}, ss=storyState(), c=chapterPlanAuthority(i), prev=ss.chapters?.[i-1]?.observed||null, obs=ss.chapters?.[i]?.observed||null;
  if(!c||!obs) return null;
  const g=(state.outline&&state.outline.glossary)||{};
  const canon=`人物:${(g.characters||[]).map(x=>x.name).join('、')}\n地点:${(g.places||[]).map(x=>x.name).join('、')}\n专名:${(g.propernouns||[]).map(x=>x.name).join('、')}\n世界规则:${(g._worldRules||[]).map(x=>x.rule).join('；')}`;
  const banAudit = stateBanEnabled() ? `\n【用户全书禁则·必须审计】\n禁用姓名：${banListNames().join('、')}\n姓名禁用字：${banListChars().join('、')}\n禁用短语：${(Array.isArray(banListRaw().phrases)?banListRaw().phrases:[]).join('、')}` : '';
  const plannedTime=c.time||''; const tr=_extractPlanTimeRange({beatsText:'剧情时间落点：'+plannedTime});
  const user=`【机器章节卡】${JSON.stringify(c)}\n【时间覆盖核验】起点=${tr.from||'未知'}；终点=${tr.to||'未知'}；跨度=${_timeDaySpan(tr.from,tr.to)==null?'未知':_timeDaySpan(tr.from,tr.to)+'天'}；时间推进安排=${c.timeCoverage||'无'}\n【上一章正文结算】${JSON.stringify(prev||{})}\n【本章正文结算】${JSON.stringify(obs)}\n【词典只读实体】${canon}${banAudit}\n【上一章质量账本】${JSON.stringify(ss.chapters?.[i-1]?.qualityLedger||{})}\n【本章已有质量账本】${JSON.stringify(ss.chapters?.[i]?.qualityLedger||{})}\n【本章正文】\n${String(text||'').slice(0,50000)}`;
  try{ const raw=unwrapAIResult(await callDeepSeek(CHAPTER_AUDIT_SYS,user,{maxTokens:3200,temperature:0.05,topP:0.1,signal:_abortCtl?.signal,taskKey:'chapterAudit'})); const j=parseJson(raw)||{}; const ql=j.qualityLedger&&typeof j.qualityLedger==='object'?j.qualityLedger:{}; const normList=k=>Array.isArray(ql[k])?ql[k].map(x=>String(x||'').trim()).filter(Boolean).slice(0,20):[]; const qualityLedger={facts:normList('facts'),introducedInfo:normList('introducedInfo'),characterKnowledge:normList('characterKnowledge'),relationshipChanges:normList('relationshipChanges'),objects:normList('objects'),locations:normList('locations'),unresolved:normList('unresolved'),ts:Date.now(),chapter:i}; const report={status:['PASS','WARN','FAIL'].includes(j.status)?j.status:'WARN',issues:Array.isArray(j.issues)?j.issues.slice(0,30):[],summary:String(j.summary||'').trim(),qualityLedger,ts:Date.now(),chapter:i}; ss.chapters[i].qualityLedger=qualityLedger; o._chapterQualityLedger=o._chapterQualityLedger||{}; o._chapterQualityLedger[i]=qualityLedger; const p=ss.chapters[i]?.planned||{}; const pt=_timeOrdinal(p.to), ot=_timeOrdinal(obs.time); if(pt!=null && ot!=null && ot<pt){ report.status='FAIL'; report.issues.unshift({type:'time',severity:'fail',evidence:`正文状态结算时间：${obs.time}`,expected:`本章必须抵达计划终点：${p.to}`,actual:`正文结算仍早于计划终点约${Math.max(0,pt-ot)}小时`,repair:'补足计划终点前真实发生的时间流逝/阶段性事件，并让章末状态落到计划终点。'}); } else if(pt!=null && ot==null && (p.spanDays||0)>=1){ report.status=report.status==='FAIL'?'FAIL':'WARN'; report.issues.unshift({type:'time',severity:'warn',evidence:'正文状态结算器未能确认章末日期',expected:`抵达计划终点：${p.to}`,actual:'无法确认',repair:'复核正文是否真正走到计划终点；必要时补足自然时间过桥。'}); } if(report.issues.some(x=>x.severity==='fail')) report.status='FAIL'; ss.chapters[i].audit=report; persist(); return report; }catch(e){ ss.chapters[i].audit={status:'WARN',issues:[{type:'audit',severity:'warn',evidence:'审计AI不可用',expected:'完成审计',actual:e.message,repair:'稍后重试'}],summary:'审计未完成',ts:Date.now(),chapter:i}; persist(); return ss.chapters[i].audit; }
}
const CHAPTER_REPAIR_SYS=`你是长篇小说“局部修复AI”。你没有改写世界和剧情的权力，只能修复审计指出的最小冲突或明显质量缺陷。
规则：只处理FAIL问题；保持章节卡规定的事件、人物、时间、地点和文学风格；不得新增主线事件；不得整章重写。若FAIL属于多日时间跨度不足，允许在原有事件之间加入最小必要的时间过桥/阶段性推进，让正文自然抵达章节卡终点，但不得用一句“几天后”敷衍，也不得改变核心事件顺序。
若FAIL属于信息重复：删除或压缩第二次解释，让后文改写为行动、反应或新后果；若FAIL属于设定化对白：保留人物真实目的，把背景说明改成有目的的交锋、试探、回避、打断或行动；若FAIL属于人物扁平：优先改变人物在当前压力下的选择/反应，补出动机、关系影响或潜台词，但不要强行添加口癖；若FAIL属于人物层次不足：优先改变一个关键行为选择，让其体现目标+关系+压力差异，并确保不改变剧情结果；若FAIL属于人物声音同质：调整信息取舍、回应方式和潜台词，不靠替换口头禅解决；若FAIL属于句式重复：只改明显连续的同构句，不做机械同义词替换；若FAIL属于矛盾：以已经成立的事实为准，用最小修改消除冲突，不得凭空发明解释。
输出严格JSON：{"replacement":"要替换的最小原文片段","newText":"与原文长度大致相当的修复后片段","reason":"修复说明"}`;
async function repairChapterByAudit(i,text,report){
  const fails=(report?.issues||[]).filter(x=>x&&x.severity==='fail'); if(!fails.length) return String(text||'');
  const banRepair = stateBanEnabled() ? `\n【用户全书禁则】禁用姓名：${banListNames().join('、')}；姓名禁用字：${banListChars().join('、')}；禁用短语：${(Array.isArray(banListRaw().phrases)?banListRaw().phrases:[]).join('、')}` : '';
  const priorLedger = chapterQualityLedger(i);
  const user=`【章节卡】${JSON.stringify(chapterPlanAuthority(i))}\n【审计FAIL】${JSON.stringify(fails)}${banRepair}\n【本章已确认质量账本】${JSON.stringify(priorLedger||{})}\n【正文】\n${String(text||'').slice(0,50000)}\n只修复最小冲突，优先修改1-3个最小连续片段；不得把已经成立的信息改成另一套设定。`;
  try{ const raw=unwrapAIResult(await callDeepSeek(CHAPTER_REPAIR_SYS,user,{maxTokens:3500,temperature:0.15,topP:0.2,signal:_abortCtl?.signal,taskKey:'chapterRepair'})); const j=parseJson(raw)||{}; const old=String(j.replacement||'').trim(), neu=String(j.newText||'').trim(); if(!old||!neu) return String(text||''); const idx=String(text||'').indexOf(old); if(idx<0) return String(text||''); return String(text).slice(0,idx)+neu+String(text).slice(idx+old.length); }catch(e){ return String(text||''); }
}
async function finalizeChapterState(i,text){
  text = enforceChapterBoundary(i, text);
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
    const obs={time:String(j.time||'').trim(),location:String(j.location||'').trim(),characters:j.characters&&typeof j.characters==='object'&&!Array.isArray(j.characters)?j.characters:{},endingState:String(j.endingState||'').trim(),openThreads:Array.isArray(j.openThreads)?j.openThreads.map(x=>String(x||'').trim()).filter(Boolean).slice(0,12):[],newFacts:Array.isArray(j.newFacts)?j.newFacts.map(x=>String(x||'').trim()).filter(Boolean).slice(0,12):[],source:'observed',ts:Date.now()};
    ss.chapters[i]=ss.chapters[i]||{}; ss.chapters[i].observed=obs; ss.chapters[i].observedAt=Date.now();
    ss.current={chapter:i,time:obs.time,location:obs.location,characters:obs.characters,endingState:obs.endingState,openThreads:obs.openThreads};
    o._factCard=o._factCard||{}; o._factCard.storyStateLast=obs; persist(); return obs;
  }catch(e){ return null; }
}


let charFilters = {q:'', idents:[], gender:'', ageMin:'', ageMax:''};
let charTS = [];
function destroyCharTS(){ charTS.forEach(t=>{ try{ t.destroy(); }catch(e){} }); charTS = []; }
function parseAge(s){
  if(s==null || s==='') return null;
  const m = String(s).match(/\d+/);
  return m ? +m[0] : null;
}

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const TOAST_LOG_KEY = nsKey('toastLog_v1');
function toastLogPush(msg){
  try{
    const a = JSON.parse(localStorage.getItem(TOAST_LOG_KEY)||'[]');
    a.push({ ts: Date.now(), msg: String(msg??'') });
    while(a.length > 200) a.shift();
    localStorage.setItem(TOAST_LOG_KEY, JSON.stringify(a));
  }catch(e){}
}
function toastLogGet(){ try{ return JSON.parse(localStorage.getItem(TOAST_LOG_KEY)||'[]'); }catch(e){ return []; } }
function toastLogClear(){ try{ localStorage.removeItem(TOAST_LOG_KEY); }catch(e){} }
function toast(msg){
  const t = $('#toast');
  toastLogPush(msg);
  t.innerHTML = `<span class="toast-msg">${esc(String(msg??''))}</span><button type="button" class="toast-hist" title="打开消息看板，回看全部提示" data-toast-board>📋</button>`;
  const hb = t.querySelector('[data-toast-board]'); if(hb) hb.onclick = (e)=>{ e.stopPropagation(); openToastBoard(); };
  t.classList.remove('hidden');
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.add('hidden'), 4200);
}
const SND_KEY = (typeof nsKey==='function') ? nsKey('snd') : 'tz_snd_done';
const SND_VOL_KEY = (typeof nsKey==='function') ? nsKey('snd_vol') : 'tz_snd_vol';
const _snd = { ctx:null, enabled:_sndEnabled(), vol:_sndVol() };
function _sndEnabled(){ try{ return localStorage.getItem(SND_KEY) !== '0'; }catch(e){ return true; } }
function _sndVol(){ // 0..1
  try{ const v = parseFloat(localStorage.getItem(SND_VOL_KEY)); return isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.8; }catch(e){ return 0.8; }
}
function unlockAudio(){
  if(!_snd.enabled) return;
  try{
    if(!_snd.ctx){ const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return; _snd.ctx = new AC(); }
    if(_snd.ctx.state === 'suspended') _snd.ctx.resume().catch(()=>{});
  }catch(e){}
}
function _sndBeep(freq, start, dur, gain){ // 单音（正弦包络：快起快落，避免刺耳）
  if(!_snd.ctx) return;
  try{
    const base = (gain||0.22) * (_snd.vol||0);
    if(base < 0.001) return;   // 音量调至 0 时静音
    const o = _snd.ctx.createOscillator(), g = _snd.ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq; o.connect(g); g.connect(_snd.ctx.destination);
    const t = _snd.ctx.currentTime + (start||0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(base, t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t+(dur||0.18));
    o.start(t); o.stop(t+(dur||0.18)+0.05);
  }catch(e){}
}
const SND_SINGLE_PRESETS = [
  { id:'be_paper',  name:'纸页轻响',   seq:[[523.25,0,0.08],[659.25,0.09,0.16]] },
  { id:'be_piano',  name:'柔钢琴点',   seq:[[659.25,0,0.22]] },
  { id:'be_glass',  name:'晶石轻触',   seq:[[783.99,0,0.11],[1046.5,0.13,0.22]] },
  { id:'be_bell',   name:'小钟清鸣',   seq:[[880.0,0,0.12],[1174.66,0.15,0.25]] },
  { id:'be_wood',   name:'木铃短拍',   seq:[[587.33,0,0.09],[783.99,0.11,0.18]] },
  { id:'be_spark',  name:'星屑三音',   seq:[[659.25,0,0.08],[880.0,0.1,0.09],[1318.51,0.21,0.22]] }
];
const SND_ALL_PRESETS = [
  { id:'al_piano',   name:'钢琴上行',   seq:[[523.25,0,0.11],[659.25,0.12,0.12],[783.99,0.25,0.24]] },
  { id:'al_glass',   name:'晶石琶音',   seq:[[659.25,0,0.08],[783.99,0.09,0.08],[1046.5,0.18,0.1],[1318.51,0.3,0.24]] },
  { id:'al_chime',   name:'风铃庆成',   seq:[[783.99,0,0.1],[1046.5,0.11,0.1],[1318.51,0.23,0.28]] },
  { id:'al_chord',   name:'柔和和弦',   seq:[[523.25,0,0.14],[659.25,0.02,0.14],[783.99,0.04,0.22]] },
  { id:'al_spark',   name:'星光四步',   seq:[[659.25,0,0.08],[783.99,0.1,0.08],[1046.5,0.2,0.1],[1567.98,0.32,0.24]] },
  { id:'al_finish',  name:'完成回响',   seq:[[587.33,0,0.1],[783.99,0.12,0.11],[987.77,0.25,0.12],[1174.66,0.39,0.3]] }
];
const SND_TSINGLE_KEY = (typeof nsKey==='function') ? nsKey('snd_t_beats') : 'tz_snd_t_beats'; // 键名沿用旧值，保留用户已选音色
const SND_TALL_KEY   = (typeof nsKey==='function') ? nsKey('snd_t_all')   : 'tz_snd_t_all';
function _sndSingleType(){ try{ const v = localStorage.getItem(SND_TSINGLE_KEY); return SND_SINGLE_PRESETS.some(x=>x.id===v) ? v : 'be_dingdong'; }catch(e){ return 'be_dingdong'; } }
function _sndAllType(){   try{ const v = localStorage.getItem(SND_TALL_KEY);   return SND_ALL_PRESETS.some(x=>x.id===v) ? v : 'al_up2';   }catch(e){ return 'al_up2';   } }
function setSoundSingleType(id){ try{ if(SND_SINGLE_PRESETS.some(x=>x.id===id)) localStorage.setItem(SND_TSINGLE_KEY, id); }catch(e){} }
function setSoundAllType(id){   try{ if(SND_ALL_PRESETS.some(x=>x.id===id))   localStorage.setItem(SND_TALL_KEY,   id); }catch(e){} }
let _lastSoundTs = 0;
let _lastSoundKind = '';
let _soundTimer = null;
function _doPlaySound(kind){
  if(!_snd.enabled) return;
  unlockAudio();
  if(!_snd.ctx || _snd.ctx.state !== 'running') return;
  const lib = (kind==='all') ? SND_ALL_PRESETS : SND_SINGLE_PRESETS;
  const id  = (kind==='all') ? _sndAllType()   : _sndSingleType();
  const p = lib.find(x=>x.id===id) || lib[0];
  (p.seq||[]).forEach(s=> _sndBeep(s[0], s[1], s[2]));
}
function playDoneSound(kind){ // kind:'single' 单个完成 | 'all' 全部完成 —— 各用各的音色库，智能去重防冲突
  if(!_snd.enabled) return;
  const now = Date.now();
  if(kind === 'all'){
    if(_soundTimer){ clearTimeout(_soundTimer); _soundTimer = null; }
    _lastSoundTs = now;
    _lastSoundKind = 'all';
    _doPlaySound('all');
    return;
  }
  if(kind === 'single'){
    if(now - _lastSoundTs < 450 && _lastSoundKind === 'all') return;
    if(_soundTimer) clearTimeout(_soundTimer);
    _soundTimer = setTimeout(()=>{
      _soundTimer = null;
      _lastSoundTs = Date.now();
      _lastSoundKind = 'single';
      _doPlaySound('single');
    }, 120);
  }
}
function initThemeSoundPanel(){
  const sb = document.getElementById('cfgSndSingle'), sa = document.getElementById('cfgSndAll');
  const optsB = SND_SINGLE_PRESETS.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  const optsA = SND_ALL_PRESETS.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  if(sb){
    if(!sb._tsf){ sb.innerHTML = optsB; sb._tsf = 1; }
    sb.value = _sndSingleType();
    if(!sb._tsb){ sb._tsb = 1; sb.addEventListener('change', ()=>{ setSoundSingleType(sb.value); }); }
  }
  if(sa){
    if(!sa._tsf){ sa.innerHTML = optsA; sa._tsf = 1; }
    sa.value = _sndAllType();
    if(!sa._tsb){ sa._tsb = 1; sa.addEventListener('change', ()=>{ setSoundAllType(sa.value); }); }
  }
  $$('[data-snd-prev]').forEach(b=>{ if(b._tsb) return; b._tsb = 1;
    b.addEventListener('click', (ev)=>{ ev.stopPropagation(); playDoneSound(b.dataset.sndPrev); }); });
}
function setSoundEnabled(on){
  try{ localStorage.setItem(SND_KEY, on?'1':'0'); }catch(e){}
  _snd.enabled = on;
  const s = document.getElementById('cfgSoundDone'); if(s) s.checked = on;
  const c = document.getElementById('cpsSoundDone'); if(c) c.checked = on;
}
function setSoundVol(pct){
  pct = Math.min(100, Math.max(0, Math.round(pct||0)));
  _snd.vol = pct/100;
  try{ localStorage.setItem(SND_VOL_KEY, String(_snd.vol)); }catch(e){}
  const sv = document.getElementById('cfgSoundVol'); if(sv) sv.value = pct;
  const svl = document.getElementById('cfgSoundVolLabel'); if(svl) svl.textContent = pct + '%';
  const cv = document.getElementById('cpsSoundVol'); if(cv) cv.value = pct;
  const cvl = document.getElementById('cpsSoundVolLb'); if(cvl) cvl.textContent = pct + '%';
}
function bindPlannerSoundTool(){
  const ok = document.getElementById('cpsSoundDone');
  const vol = document.getElementById('cpsSoundVol');
  const lb = document.getElementById('cpsSoundVolLb');
  if(!ok && !vol) return;
  if(ok) ok.checked = _sndEnabled();
  if(vol){ vol.value = Math.round((_snd.vol||0)*100); if(lb) lb.textContent = vol.value + '%'; }
  if(ok && !ok._cpsBound){
    ok._cpsBound = true;
    ok.addEventListener('change', ()=> setSoundEnabled(!!ok.checked));
  }
  if(vol && !vol._cpsBound){
    vol._cpsBound = true;
    vol.addEventListener('input', ()=>{ setSoundVol(+vol.value||0); if(lb) lb.textContent = Math.round((_snd.vol||0)*100) + '%'; });
    vol.addEventListener('change', ()=>{ playDoneSound('single'); });   // 松开音量滑杆即试听一声
  }
}
window.addEventListener('pointerdown', unlockAudio, {capture:true});
window.addEventListener('keydown', unlockAudio, {capture:true});
window.addEventListener('touchend', unlockAudio, {capture:true});
(function initSoundUI(){
  const apply = ()=>{ const el = document.getElementById('cfgSoundDone'); if(el) el.checked = _sndEnabled();
    const vl = document.getElementById('cfgSoundVol'), lb = document.getElementById('cfgSoundVolLabel');
    if(vl){ vl.value = Math.round((_snd.vol||0)*100); if(lb) lb.textContent = vl.value + '%'; } };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
  const bind = ()=>{ const el = document.getElementById('cfgSoundDone'); if(!el) return;
    el.addEventListener('change', ()=> setSoundEnabled(!!el.checked));
    const vl = document.getElementById('cfgSoundVol');
    if(vl){
      vl.addEventListener('input', ()=>{ setSoundVol(+vl.value||0); });
    } };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
function openToastBoard(){
  const old = $('#toastBoardPanel'); if(old) old.remove();
  const ov = document.createElement('div'); ov.id='toastBoardPanel'; ov.className='gs-overlay';
  const list = toastLogGet().slice().reverse();
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📜 消息看板（${list.length}）</b>
        <span style="display:flex;gap:6px">
          <button class="btn small ghost" data-tb-clear>清空</button>
          <button class="gs-x" data-tb-close>✕</button>
        </span></div>
      <div class="cv-body">
        ${list.length ? list.map(x=>`<div class="tb-row"><span class="tb-ts">${new Date(x.ts).toLocaleString('zh-CN',{hour12:false})}</span><span class="tb-msg">${esc(x.msg)}</span></div>`).join('') : '<p class="muted">暂无消息记录。</p>'}
      </div>
    </div>`;
  ov.addEventListener('click', e=>{
    if(e.target.closest('[data-tb-close]') || e.target===ov){ ov.remove(); return; }
    if(e.target.closest('[data-tb-clear]')){ toastLogClear(); ov.remove(); openToastBoard(); return; }
  });
  document.body.appendChild(ov);
}
async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    toast('已复制');
  }catch(e){
    const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); ta.remove(); toast('已复制');
  }
}
function esc(s){ return String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function download(name, text){
  const blob = new Blob([text], {type:'text/markdown;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}

const CJK_ALL = /\p{Script=Han}|[\u3000-\u303f\uff00-\uffef]/gu;
const EN_WORD = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g;
function countWords(text){
  text = String(text||'');
  const cjk = (text.match(CJK_ALL)||[]).length;
  const rest = text.replace(CJK_ALL, ' ');
  const en = (rest.match(EN_WORD)||[]).length;
  return {cjk, en, total: cjk + en};
}
function wcInner(w){
  const fmt = n => n.toLocaleString('en-US');
  return `📝 <b>${fmt(w.total)}</b><i>字</i>`;
}
function wcBadge(text, attrs){
  const w = countWords(text);
  return `<span class="wc" ${attrs||''} title="中文 ${w.cjk} 字 · 英文 ${w.en} 词">${wcInner(w)}</span>`;
}

let uidSeq = 1000;
let genBatchN = 2;
function remainingEmptyChapters(){ return (state.chapters||[]).filter(c=> !(c.content && String(c.content).trim())).length; }
function uid(p){ return (p||'id')+(++uidSeq)+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
const TM_KEYS = ['idea',
  'principal', 'teacher', 'dictmaster', 'dictEnrich',
  'chapter',
  'strip', 'subplot', 'glossary', 'rolling',
  'contentAdvice', 'assets', 'recipe'];

function glmModels(){ return [
  {name:'glm-4.5-air', label:'GLM-4.5-Air（智谱 · 高性价比，现用）', kind:'pro'},
  {name:'glm-4.5',      label:'GLM-4.5（智谱 · 旗舰满血版）',      kind:'pro'}
]; }
function deepseekModels(){ return [
  {name:'deepseek-v4-pro', label:'deepseek-v4-pro（质量最高，推荐）', kind:'pro'},
  {name:'deepseek-v4-flash', label:'deepseek-v4-flash（最快/最便宜）', kind:'flash'},
  {name:'deepseek-v4-flash-vision-exp', label:'deepseek-v4-flash-vision-exp（带视觉）', kind:'flash'}
]; }
function defaultModels(){ return glmModels().concat(deepseekModels()); }
function cfgZhipuGroup(){ return {id:'zhipu', kind:'openai', label:'智谱 GLM', baseUrl:'https://open.bigmodel.cn/api/paas/v4', keys:[], models:glmModels(), keyInBody:false}; }
function cfgDeepSeekGroup(){ return {id:'deepseek', kind:'openai', label:'DeepSeek 官方', baseUrl:'https://api.deepseek.com', keys:[], models:deepseekModels()}; }

function normalizeCfg(cfg){
  cfg = cfg || {};
  if(!Array.isArray(cfg.groups)){
    const gz = cfgZhipuGroup();
    const gd = cfgDeepSeekGroup();
    if(cfg.apiKey){
      const id = uid('k');
      gd.keys.push({id, label:'默认账号', key:cfg.apiKey});
      cfg.groups = [gz, gd];
      cfg.active = { groupId:'deepseek', keyId:id, model: cfg.model || 'deepseek-v4-pro' };
    } else {
      cfg.groups = [gz, gd];
      cfg.active = { groupId:'zhipu', keyId: (gz.keys[0]||{}).id||null, model: (gz.models[0]||{}).name || 'glm-4.5-air' };
    }
  }
  const _seenG = new Set();
  cfg.groups.forEach(gr=>{
    if(!gr.id || _seenG.has(gr.id)) gr.id = uid('g');
    _seenG.add(gr.id);
  });
  cfg.groups.forEach((gr,i)=>{
    gr.kind = gr.kind || 'openai';
    gr.baseUrl = gr.baseUrl || '';
    gr.keyInBody = !!gr.keyInBody;
    gr.keys = (gr.keys||[]).map((k,j)=>({id: k.id||uid('k'), label: k.label||('账号'+(j+1)), key: k.key||''}));
    gr.models = (gr.models && gr.models.length) ? gr.models : defaultModels();
  });
  const act = cfg.active || {};
  const group = cfg.groups.find(g=>g.id===act.groupId) || cfg.groups[0];
  if(group){
    const key = group.keys.find(k=>k.id===act.keyId) || group.keys[0];
    const model = group.models.find(m=>m.name===act.model)
      || group.models.find(m=>m.name==='glm-4.5-air') || group.models[0];
    cfg.active = { groupId: group.id, keyId: key ? key.id : null, model: model ? model.name : (group.models[0] ? group.models[0].name : '') };
  } else {
    cfg.active = { groupId:null, keyId:null, model:'' };
  }
  const _srcTM = (cfg.taskModels && typeof cfg.taskModels === 'object') ? cfg.taskModels : {};
  const _tm = {};
  TM_KEYS.forEach(k=>{
    const v = _srcTM[k];
    _tm[k] = (v && typeof v==='object' && v.groupId && v.keyId && v.model)
      ? { groupId:String(v.groupId), keyId:String(v.keyId), model:String(v.model) } : '';
  });
  cfg.taskModels = _tm;
  return cfg;
}
function getCfg(){
  try{ return normalizeCfg(JSON.parse(localStorage.getItem(KEY_CFG)) || {}); }catch(e){ return normalizeCfg({}); }
}
function saveCfg(cfg){ localStorage.setItem(KEY_CFG, JSON.stringify(cfg)); }

function resolveActiveSpec(taskKey){
  const cfg = getCfg();
  const act = cfg.active || {};
  let group = cfg.groups.find(g=>g.id===act.groupId) || cfg.groups[0] || {};
  let key = (group.keys||[]).find(k=>k.id===act.keyId) || (group.keys||[])[0] || {};
  let model = (group.models||[]).find(m=>m.name===act.model) || (group.models||[])[0] || {};
  const _tm = taskKey ? (cfg.taskModels||{})[taskKey] : null;
  let _overridden = false;
  if(_tm){
    const tg = cfg.groups.find(g=>g.id===_tm.groupId);
    if(tg){
      const tk = (tg.keys||[]).find(k=>k.id===_tm.keyId) || (tg.keys||[])[0] || {};
      const tmod = (tg.models||[]).find(m=>m.name===_tm.model) || (tg.models||[])[0] || {};
      group = tg; key = tk; model = tmod; _overridden = true;
    }
  }
  return {
    taskKey: taskKey || '',
    taskOverride: _overridden,
    groupId: group.id, groupLabel: group.label,
    keyId: key.id, keyLabel: key.label,
    baseUrl: (group.baseUrl || 'https://api.deepseek.com').replace(/\/+$/, ''),
    apiKey: key.key || '',
    keyInBody: !!group.keyInBody,
    model: model.name || 'deepseek-v4-pro',
    temperature: (cfg.temperature==null ? 0.6 : cfg.temperature),
    ideaTemp:    (cfg.ideaTemp==null ? 0.5 : cfg.ideaTemp),
    principalTemp:(cfg.principalTemp==null ? 0.4 : cfg.principalTemp),
    teacherTemp: (cfg.teacherTemp==null ? 0.4 : cfg.teacherTemp),
    dictmasterTemp: (cfg.dictmasterTemp==null ? 0.4 : cfg.dictmasterTemp),
    dictEnrichTemp: (cfg.dictEnrichTemp==null ? 0.4 : cfg.dictEnrichTemp),
    assetsTemp:  (cfg.assetsTemp==null ? 0.7 : cfg.assetsTemp),
    titleTemp:   (cfg.titleTemp==null ? 0.5 : cfg.titleTemp),
    chapterTemp: (cfg.chapterTemp==null ? 0.5 : cfg.chapterTemp),
    qcTemp:      (cfg.qcTemp==null ? 0.2 : cfg.qcTemp),              // 分任务温度：词库提取（严谨低温）
    stripTemp:   (cfg.stripTemp==null ? 1.0 : cfg.stripTemp),
    subplotTemp: (cfg.subplotTemp==null ? 0.25 : cfg.subplotTemp),    // 分任务温度：支线进度更新（契约类窄采样）
    rollingTemp: (cfg.rollingTemp==null ? 0.3 : cfg.rollingTemp),    // 分任务温度：滚动摘要（忠实压缩）
    contentAdviseTemp: (cfg.contentAdviseTemp==null ? 0.6 : cfg.contentAdviseTemp),  // 分任务温度：内容建议（建议类）
    aiRecipeTemp:(cfg.aiRecipeTemp==null ? 0.9 : cfg.aiRecipeTemp)
  };
}
function currentSpecLabel(){
  const s = resolveActiveSpec();
  const model = s.model.replace('deepseek-v4-','').split('-')[0];
  return (s.groupLabel||'AI') + ' · ' + (s.keyLabel||'默认') + ' · ' + model;
}
function currentIsDeepSeek(){
  const s = resolveActiveSpec();
  return /deepseek/i.test(s.model||'') || /deepseek/i.test(s.groupId||'')
      || /doubao/i.test(s.model||'') || /doubao/i.test(s.groupId||'');
}

const THEMES = ['dark','light','blackboard','mecha','cyber','guofeng','aurora','paper'];
function applyTheme(theme){
  if(THEMES.indexOf(theme) < 0) theme = 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  const c = getCfg(); c.theme = theme; saveCfg(c);
  const mtn = $('#mechaTopNav');
  if(mtn) mtn.classList.toggle('hidden', theme !== 'mecha');
  document.body.classList.toggle('has-mecha-bg', theme === 'mecha');
  document.body.classList.toggle('has-cyber-bg', theme === 'cyber');
  document.body.classList.toggle('has-guofeng-bg', theme === 'guofeng');
  $$('.theme-btns .theme').forEach(b=> b.classList.toggle('active', b.dataset.theme === theme));
  updateMechaNav();
  updateWcTotal(); // 主题切换后刷新内嵌总字数
}
function restartCascade(){
  if(document.documentElement.getAttribute('data-theme') !== 'blackboard') return;
  const v = $('#view'); if(!v) return;
  v.style.animation = 'none'; void v.offsetWidth; v.style.animation = '';
}

function makeId(){ return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

function projectSnapshot(){
  return {
    mode: state.mode || 'shortfilm',
    wordRange: state.wordRange || null,
    chapterRange: state.chapterRange || null,
    totalWords: state.totalWords || null,
    chapterCount: (state.chapterCount && +state.chapterCount>0) ? +state.chapterCount : null,
    bookBeat: currentBookBeatId(),
    openingStrategy: currentOpeningStrategyId(),
    idea: state.idea,
    coverPrompt: state.coverPrompt,
    coverWithTitle: state.coverWithTitle,
    outline: state.outline,
    outlineConfirmed: state.outlineConfirmed,
    glossAdherence: state.glossAdherence,
    glossAllowFill: state.glossAllowFill,
    glossSeenTs: Number(state._glossSeenTs) || 0,
    langLayer: (typeof state.langLayer === 'boolean') ? state.langLayer : true,
    _narrIron: state._narrIron,
    banList: (state.banList && typeof state.banList === 'object') ? normalizeBanList(state.banList) : null,
    gsCollapsed: state.gsCollapsed,
    cpCollapsed: state.cpCollapsed,
    soCollapsed: !!state.soCollapsed,
    deCollapsed: !!state.deCollapsed,
    polishCollapsed: !!state.polishCollapsed,
    gsCatFold: (state.gsCatFold && typeof state.gsCatFold === 'object') ? state.gsCatFold : { main:false, support:false, walkon:false, place:false, proper:false, sub:false },   // 词典小类别折叠态（仅存结构，运行时各键默认见 state）
    useChapterPlans: true,
    plannerFinalized: !!state.plannerFinalized,
    expOpenGroups: state.expOpenGroups,
    polishOptions: state.polishOptions,
    polishAdopted: state.polishAdopted,
    polishMode: state.polishMode,
    polishStatus: state.polishStatus,
    polishSelectedId: state.polishSelectedId,
    polishDiagnosis: state.polishDiagnosis,
    polishStrategies: state.polishStrategies,
    strategicDimensions: state.strategicDimensions,
    originalIdeaAnchors: state.originalIdeaAnchors,
    polishCanonical: state.polishCanonical,
    canonicalStoryStrategy: state.canonicalStoryStrategy,
    polishRevision: state.polishRevision,
    polishHistory: state.polishHistory,
    polishRawFallback: state.polishRawFallback || '',
    chapterEndingPlans: state.chapterEndingPlans,
    chapters: state.chapters,
    characters: state.characters,
    ctAdviceHist: Array.isArray(state.ctAdviceHist) ? state.ctAdviceHist : [],
    contentAdviceHist: Array.isArray(state.contentAdviceHist) ? state.contentAdviceHist : [],
    expSel: Array.isArray(state.expSel) ? state.expSel : [],
    hist: state.hist || { characters:[], scenes:[], cover:[], storyboard:[] },
    chapterStyle: state.chapterStyle || { tags: [], collapsed: false },
    fcCollapsed: !!state.fcCollapsed,
    rsCollapsed: !!state.rsCollapsed,
    _fixQueue: Array.isArray(state._fixQueue) ? state._fixQueue : [],
    aiNetwork: state.aiNetwork || { stage:'idle', running:[], completed:[], blockedBy:{} },
    teamShape: (state.teamShape==='dual'||state.teamShape==='trio'||state.teamShape==='quad'||state.teamShape==='quint') ? state.teamShape : 'solo',
    _chapterPartial: state._chapterPartial || {},
    scenes: state.scenes,
    storyboard: state.storyboard,
    boardConcepts: state.boardConcepts,
    raw: state.raw,
    titleHistory: state.titleHistory,
    step: currentStep,
    title: (state.outline && state.outline.title) || (state.idea ? state.idea.trim().slice(0,20) : '未命名作品'),
    logline: (state.outline && state.outline.logline) || '',
    storyBlueprint: (state.outline && state.outline.storyBlueprint) || '',
    aiBookBeat: (state.outline && state.outline.aiBookBeat) || '',
    _lastCpRaw: state._lastCpRaw || '',
    dictmasterHistory: Array.isArray(state.dictmasterHistory) ? state.dictmasterHistory : [],
    dictmasterLatest: state.dictmasterLatest || null,
    dictmasterRan: !!state.dictmasterRan,
    originalIdeaSnapshot: state.originalIdeaSnapshot || '',
    school: (state.school && typeof state.school === 'object') ? state.school : null,   // 学校模式：校长/老师 产出 + 各步重试/完成标记（随项目持久化）
    longMemory: state.longMemory || { uiOpen:false, foreshadow:[], lastAuditAt:0 },
    _chapterQualityLedger: (state.outline && state.outline._chapterQualityLedger) || {}
  };
}
function applyProject(p){
  state.mode = (p.mode === 'longnovel') ? 'longnovel' : 'shortfilm';
  state.wordRange = (p.wordRange && p.wordRange.min && p.wordRange.max) ? {min:+p.wordRange.min, max:+p.wordRange.max} : (p.chapterRange ? null : null);
  state.chapterRange = (p.chapterRange && p.chapterRange.min && p.chapterRange.max) ? {min:+p.chapterRange.min, max:+p.chapterRange.max} : null;
  state.totalWords = (p.totalWords && +p.totalWords>0) ? +p.totalWords : null;
  state.chapterCount = (p.chapterCount && +p.chapterCount>0) ? +p.chapterCount : null;
  state.bookBeat = [4,7,12,15].includes(Number(p.bookBeat)) ? Number(p.bookBeat) : (state.bookBeat || BOOK_BEAT_DEFAULT_ID);
  state.openingStrategy = openingStrategyDef(p.openingStrategy) ? p.openingStrategy : 'none';
  state.longMemory = (p.longMemory && typeof p.longMemory === 'object') ? p.longMemory : { uiOpen:false, foreshadow:[], lastAuditAt:0 };
  state.idea = p.idea || '';
  state.coverPrompt = p.coverPrompt || '';
  state.coverWithTitle = !!p.coverWithTitle;
  state.outline = p.outline || null;
  if(state.outline){
    if(!state.outline.storyBlueprint && p.storyBlueprint) state.outline.storyBlueprint = String(p.storyBlueprint);
    if(!state.outline.aiBookBeat && p.aiBookBeat) state.outline.aiBookBeat = String(p.aiBookBeat);
  }
  if(state.outline && state.outline.chapterPlansHistory) delete state.outline.chapterPlansHistory;
  if(state.outline){ state.outline._chapterQualityLedger = (state.outline._chapterQualityLedger && typeof state.outline._chapterQualityLedger==='object') ? state.outline._chapterQualityLedger : {}; }
  state.outlineConfirmed = !!p.outlineConfirmed;
  state.glossAdherence = (typeof p.glossAdherence === 'number') ? p.glossAdherence : 60;
  state.glossAllowFill = !!p.glossAllowFill;
  state._glossSeenTs = Number(p.glossSeenTs) || 0;
  state.langLayer = (typeof p.langLayer === 'boolean') ? p.langLayer : true;
  state._narrIron = (typeof p._narrIron === 'boolean') ? p._narrIron : true;
  state.banList = (p.banList && typeof p.banList === 'object') ? normalizeBanList(p.banList) : null;
  state.gsCollapsed = (typeof p.gsCollapsed === 'boolean') ? p.gsCollapsed : false;
  state.cpCollapsed = (typeof p.cpCollapsed === 'boolean') ? p.cpCollapsed : true;
  state.soCollapsed = !!p.soCollapsed;
  state.deCollapsed = !!p.deCollapsed;
  state.polishCollapsed = !!p.polishCollapsed;
  state.gsCatFold = (p.gsCatFold && typeof p.gsCatFold === 'object') ? p.gsCatFold : { main:false, support:false, walkon:false, place:false, proper:false, sub:false };   // 词典小类别折叠态恢复
  const _gcf = state.gsCatFold; if(_gcf && typeof _gcf === 'object'){ ['main','support','walkon'].forEach(k=>{ if(typeof _gcf[k] !== 'boolean') _gcf[k] = false; }); }
  state.useChapterPlans = true;
  state.plannerFinalized = (typeof p.plannerFinalized === 'boolean') ? p.plannerFinalized : false;
  state.expOpenGroups = Array.isArray(p.expOpenGroups) ? p.expOpenGroups : [];
  state.polishOptions = Array.isArray(p.polishOptions) ? p.polishOptions : undefined;
  state.polishAdopted = (typeof p.polishAdopted === 'string') ? p.polishAdopted : undefined;
  state.polishMode = p.polishMode === 'multi' ? 'multi' : 'single';
  state.polishSelectedId = (typeof p.polishSelectedId === 'string') ? p.polishSelectedId : null;
  state.polishDiagnosis = (p.polishDiagnosis && typeof p.polishDiagnosis === 'object') ? p.polishDiagnosis : null;
  state.polishStrategies = Array.isArray(p.polishStrategies) ? p.polishStrategies : [];
  state.strategicDimensions = Array.isArray(p.strategicDimensions) ? p.strategicDimensions : [];
  state.originalIdeaAnchors = (p.originalIdeaAnchors && typeof p.originalIdeaAnchors==='object') ? p.originalIdeaAnchors : null;
  state.polishCanonical = (p.polishCanonical && typeof p.polishCanonical === 'object') ? p.polishCanonical : null;
  state.canonicalStoryStrategy = (p.canonicalStoryStrategy && typeof p.canonicalStoryStrategy === 'object') ? p.canonicalStoryStrategy : null;
  // 旧项目迁移：仅在不存在新权威源时，一次性从旧采用蓝本建立兼容 Canonical。
  if(!state.canonicalStoryStrategy && state.polishCanonical && state.polishCanonical.machineTrace?.status==='adopted'){
    state.canonicalStoryStrategy = Object.assign({}, state.polishCanonical, { sourceType:'canonical_story_strategy', sourceVersion:'phase3-migrated' });
  }
  state.polishPendingSuggestions = (p.polishPendingSuggestions && typeof p.polishPendingSuggestions === 'object') ? p.polishPendingSuggestions : null;
  state.polishRevision = Number.isFinite(+p.polishRevision) ? +p.polishRevision : 0;
  state.polishStatus = ['empty','generating','ready_single','waiting_selection','adopted'].includes(p.polishStatus) ? p.polishStatus : ((state.polishAdopted && state.polishOptions?.length) ? 'adopted' : (state.polishOptions?.length>1?'waiting_selection':state.polishOptions?.length?'ready_single':'empty'));
  state.polishHistory = Array.isArray(p.polishHistory) ? p.polishHistory : undefined;
  state.polishRawFallback = typeof p.polishRawFallback === 'string' ? p.polishRawFallback : '';
  state.chapterEndingPlans = (p.chapterEndingPlans && typeof p.chapterEndingPlans === 'object') ? p.chapterEndingPlans : {};
  state.chapters = p.chapters || [];
  (state.chapters||[]).forEach(c=>{ if(c) delete c.qcRecord; });
  if(state.outline) delete state.outline.titleQC;
  (state.chapters||[]).forEach(c=>{ if(c){ delete c.volume; delete c.volumeTheme; } });
  if(state.outline){ delete state.outline.volumes; delete state.outline._volumes; if(state.outline.structure) delete state.outline.structure; }
  state.characters = p.characters || [];
  state.ctAdviceHist = Array.isArray(p.ctAdviceHist) ? p.ctAdviceHist : [];
  state.contentAdviceHist = Array.isArray(p.contentAdviceHist) ? p.contentAdviceHist : [];
  state.expSel = Array.isArray(p.expSel) ? p.expSel.filter(i=> Number.isInteger(i)) : [];
  state.hist = (p.hist && typeof p.hist === 'object') ? {
    characters: Array.isArray(p.hist.characters)?p.hist.characters:[],
    scenes: Array.isArray(p.hist.scenes)?p.hist.scenes:[],
    cover: Array.isArray(p.hist.cover)?p.hist.cover:[],
    storyboard: Array.isArray(p.hist.storyboard)?p.hist.storyboard:[]
  } : { characters:[], scenes:[], cover:[], storyboard:[] };
  state.chapterStyle = (p.chapterStyle && typeof p.chapterStyle === 'object')
    ? { tags: Array.isArray(p.chapterStyle.tags)?p.chapterStyle.tags:[], collapsed: !!p.chapterStyle.collapsed }
    : { tags: [], collapsed: false };
  wsDraft = null;
  state.scenes = p.scenes || [];
  state.storyboard = p.storyboard || [];
  state.boardConcepts = p.boardConcepts || [];
  state._lastCpRaw = p._lastCpRaw || '';
  state.titleHistory = Array.isArray(p.titleHistory) ? p.titleHistory : [];
  state.raw = p.raw || {};
  currentStep = (p.step && p.step >= 1 && p.step <= 5) ? p.step : 1;
  state.fcCollapsed = !!p.fcCollapsed;
  state.rsCollapsed = !!p.rsCollapsed;
  state._fixQueue = Array.isArray(p._fixQueue) ? p._fixQueue : [];
  state.aiNetwork = (p.aiNetwork && typeof p.aiNetwork === 'object') ? p.aiNetwork : { stage:'idle', running:[], completed:[], blockedBy:{} };
  state.dictmasterHistory = Array.isArray(p.dictmasterHistory) ? p.dictmasterHistory : [];
  state.dictmasterLatest = (p.dictmasterLatest && typeof p.dictmasterLatest === 'object') ? p.dictmasterLatest : null;
  state.dictmasterRan = !!p.dictmasterRan;
  state.originalIdeaSnapshot = (typeof p.originalIdeaSnapshot === 'string') ? p.originalIdeaSnapshot : '';
  state.school = (p.school && typeof p.school === 'object') ? p.school : null;   // 学校模式恢复（校长/老师 产出 + 重试/完成标记）
  if(!state.school || typeof state.school !== 'object') state.school = {};
  if(!state.school.finished || typeof state.school.finished !== 'object') state.school.finished = {};
  if(!state.school.retries || typeof state.school.retries !== 'object') state.school.retries = {};
  if(!Array.isArray(state.school.teachers)) state.school.teachers = [];
  state.teamShape = (p.teamShape==='dual'||p.teamShape==='trio'||p.teamShape==='quad'||p.teamShape==='quint') ? p.teamShape : 'solo';
  state._chapterPartial = (p._chapterPartial && typeof p._chapterPartial === 'object') ? p._chapterPartial : {};
  normalizeOutline(state.outline);
}
function clearState(){
  state.mode = 'shortfilm';
  state.wordRange = null; state.chapterRange = null; state.totalWords = null; state.chapterCount = null;
  state.idea = ''; state.outline = null; state.coverPrompt = ''; state.coverWithTitle = false; state.outlineConfirmed = false;
  state.glossAdherence = 60; state.glossAllowFill = false; state.gsCollapsed = false;
  state.langLayer = true;
  state._narrIron = true;
  state.banList = null;
  state.useChapterPlans = true;
  state.chapters = []; state.characters = []; state.scenes = []; state.storyboard = []; state.boardConcepts = []; state.titleHistory = []; state.raw = {};
  state.ctAdviceHist = []; state.contentAdviceHist = [];
  state.expSel = [];
  state.hist = { characters:[], scenes:[], cover:[], storyboard:[] };
  state.chapterStyle = { tags: [], collapsed: false };
  state.fcCollapsed = false; state.rsCollapsed = false;
  state._fixQueue = [];
  state.dictmasterHistory = [];
  state.dictmasterLatest = null;
  state.dictmasterRan = false;
  state.originalIdeaSnapshot = '';
  state.school = null;   // 学校模式：新项目/重置清空（校长/老师产出 + 重试/完成标记）
  state.longMemory = { uiOpen:false, foreshadow:[], lastAuditAt:0 };
  state.teamShape = 'solo';
  state.openingStrategy = 'none';
  state.polishCollapsed = false;
  state._chapterPartial = {};
  state.aiNetwork = { stage:'idle', running:[], completed:[], blockedBy:{} };
  state._lastCpRaw = '';
  wsDraft = null;
  currentStep = 1;
}
function writeOneProjectRecord(p){
  if(!p || !p.id) return 'ls';
  try{
    const s = JSON.stringify(p);
    if(s && s.length > LS_SINGLE_SAFE) throw new Error('over-ls-limit');
    localStorage.setItem(lsKeyFor(p.id), s);
    return 'ls';
  }catch(e){
    try{ idbPut(p).catch(function(){}); }catch(e2){}
    try{ localStorage.removeItem(lsKeyFor(p.id)); }catch(e3){}   // 清掉旧的 localStorage 版，避免读到旧数据
    return 'idb';
  }
}
function removeOneProjectRecord(id, wasSt){
  try{ localStorage.removeItem(lsKeyFor(id)); }catch(e){}
  if(wasSt === 'idb' || wasSt == null){ try{ idbDelete(id).catch(function(){}); }catch(e){} }
}
function idbSaveLib(){
  const ids = new Set(lib.items.map(i=> i.id));
  let oldIdx = null;
  try{ oldIdx = JSON.parse(localStorage.getItem(KEY_INDEX)); }catch(e){}
  const oldSt = (oldIdx && oldIdx.st && typeof oldIdx.st === 'object') ? oldIdx.st : {};
  const oldIds = (oldIdx && Array.isArray(oldIdx.ids)) ? oldIdx.ids : [];
  const st = {};
  for(const p of lib.items){
    const isNew = !oldIds.includes(p.id);
    if(p.id === lib.curId || isNew){
      st[p.id] = writeOneProjectRecord(p);
    }else{
      st[p.id] = oldSt[p.id] || 'ls';
    }
  }
  for(const oldId of oldIds){
    if(!ids.has(oldId)) removeOneProjectRecord(oldId, oldSt[oldId]);
  }
  const idx = { curId: lib.curId, ids: lib.items.map(i=> i.id), st };
  try{ localStorage.setItem(KEY_INDEX, JSON.stringify(idx)); }catch(e){}
}
function saveLib(){
  idbSaveLib();   // 同步写 localStorage（降级项目异步写 IDB）
}
function robustSaveLib(){
  while(lib.items.length > MAX_PROJECTS){
    const others = lib.items.filter(i=> i.id !== lib.curId);
    if(!others.length) break;
    others.sort((a,b)=> (a.updatedAt||0) - (b.updatedAt||0));
    lib.items = lib.items.filter(i=> i.id !== others[0].id);
  }
  idbSaveLib();
}
async function loadState(){
  clearState();
  let idx = null;
  try{ idx = JSON.parse(localStorage.getItem(KEY_INDEX)); }catch(e){}
  const ids = (idx && Array.isArray(idx.ids)) ? idx.ids : [];
  const stMap = (idx && idx.st && typeof idx.st === 'object') ? idx.st : {};
  const curId = (idx && idx.curId) || null;
  const items = [];
  for(const id of ids){
    try{
      let p = null;
      if(stMap[id] === 'idb'){
        if(idbAvailable()) p = await idbGet(id);   // 降级项目从 IDB 单条读
      }else{
        const raw = localStorage.getItem(lsKeyFor(id));
        if(raw){ try{ p = JSON.parse(raw); }catch(e){ p = null; } }
      }
      if(p && typeof p === 'object' && p.id) items.push(p);
    }catch(e){ /* 单条损坏/缺失则跳过，不影响其余项目 */ }
  }
  if(items.length){
    lib = { curId: curId, items: items };
    if(!lib.items.some(i=> i.id === lib.curId)) lib.curId = lib.items[0].id;
    const cur = lib.items.find(i=> i.id === lib.curId);
    if(cur) applyProject(cur);
    return;
  }
  if(await migrateLegacyLibrary()) return;
  migrateOldState();
}
async function migrateLegacyLibrary(){
  let legacy = [];
  try{
    const raw = localStorage.getItem(nsKey('lib'));
    if(raw){
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.items)) ? parsed.items : null;
      const curId = (!Array.isArray(parsed) && parsed && parsed.curId) ? parsed.curId : null;
      if(Array.isArray(arr)) legacy = legacy.concat(arr.filter(x=> x && typeof x === 'object' && x.id));
      if(curId && !legacy.some(x=> x.id === curId)){ /* 找不到 curId 归属，忽略 */ }
    }
  }catch(e){}
  try{
    if(idbAvailable() && typeof idbListLegacy === 'function'){
      const list = await idbListLegacy();
      if(Array.isArray(list)) legacy = legacy.concat(list.filter(x=> x && typeof x === 'object' && x.id));
    }
  }catch(e){}
  if(!legacy.length) return false;
  const byId = {};
  legacy.forEach(x=>{ if(x && x.id) byId[x.id] = x; });
  const merged = Object.keys(byId).map(id=>{
    const p = byId[id];
    const snap = normalizeLegacyProject(p);
    return { ...snap, id: id, updatedAt: p.updatedAt || Date.now() };
  });
  if(!merged.length) return false;
  const prevCur = lib && lib.curId;
  lib = { curId: prevCur || merged[0].id, items: merged };
  idbSaveLib();   // 写新索引 + 逐项目（localStorage 单条，超限自动降级）
  const cur = lib.items.find(i=> i.id === lib.curId) || lib.items[0];
  if(cur){ lib.curId = cur.id; applyProject(cur); }
  try{ localStorage.removeItem(nsKey('lib')); }catch(e){}   // 一次性：本站迁移完成即清空本 ns 副本（共享裸 fyp_lib 保留，供其它站各自迁移）
  return true;
}
function normalizeLegacyProject(p){
  const s = p && typeof p === 'object' ? p : {};
  const out = {};
  out.mode = (s.mode === 'longnovel' || s.mode === 'long') ? 'longnovel' : (s.mode || 'shortfilm');
  out.mode = (out.mode === 'long') ? 'longnovel' : out.mode;
  out.mode = (out.mode === 'short' || out.mode === 'shortfilm') ? 'shortfilm' : out.mode;
  out.idea = s.idea != null ? s.idea : '';
  out.outline = s.outline || null;
  out.outlineConfirmed = !!s.outlineConfirmed;
  out.chapters = Array.isArray(s.chapters) ? s.chapters : [];
  out.characters = Array.isArray(s.characters) ? s.characters : [];
  out.scenes = Array.isArray(s.scenes) ? s.scenes : [];
  out.storyboard = Array.isArray(s.storyboard) ? s.storyboard : [];
  out.qcRecord = undefined;   // 无残留
  if(out.outline) delete out.outline.titleQC;
  out.longMemory = (s.longMemory && typeof s.longMemory === 'object') ? s.longMemory : { uiOpen:false, foreshadow:[], lastAuditAt:0 };
  out.chapterStyle = (s.chapterStyle && typeof s.chapterStyle === 'object')
    ? { tags: Array.isArray(s.chapterStyle.tags)?s.chapterStyle.tags:[], collapsed:!!s.chapterStyle.collapsed }
    : { tags:[], collapsed:false };
  out.glossAdherence = (typeof s.glossAdherence === 'number') ? s.glossAdherence : 60;
  out.langLayer = (s.langLayer === undefined) ? true : !!s.langLayer;
  out._narrIron = (s._narrIron === undefined) ? true : !!s._narrIron;
  out.banList = (s.banList && typeof s.banList === 'object') ? normalizeBanList(s.banList) : null;
  out.ctAdviceHist = Array.isArray(s.ctAdviceHist) ? s.ctAdviceHist : [];
  out.contentAdviceHist = Array.isArray(s.contentAdviceHist) ? s.contentAdviceHist : [];
  out.hist = (s.hist && typeof s.hist === 'object') ? s.hist : { characters:[], scenes:[], cover:[], storyboard:[] };
  out.title = s.title || (s.outline && s.outline.title) || '';
  out.logline = s.logline || (s.outline && s.outline.logline) || '';
  out.step = (s.step && s.step >= 1) ? s.step : (out.outlineConfirmed ? 4 : (out.outline ? 2 : 1));
  return out;
}
function migrateOldState(){
  try{
    const s = JSON.parse(localStorage.getItem(KEY_STATE));
    if(!s || typeof s !== 'object') return;
    Object.assign(state, s);
    state.raw = s.raw || {};
    currentStep = (s.step && s.step >= 1 && s.step <= 5) ? s.step : 1;
    const snap = projectSnapshot();
    lib = { curId: snap.id = makeId(), items: [{ ...snap, updatedAt: Date.now() }] };
    saveLib();
    localStorage.removeItem(KEY_STATE);
  }catch(e){}
}
function persist(){
  if(!lib.items.some(i=> i.id === lib.curId)){
    const snap = projectSnapshot();
    const newId = makeId();
    lib.items.unshift({ ...snap, id: newId, updatedAt: Date.now() });
    lib.curId = newId;
  }
  const idx = lib.items.findIndex(i=> i.id === lib.curId);
  if(idx >= 0){
    const snap = projectSnapshot();
    lib.items[idx] = { ...snap, id: lib.curId, updatedAt: Date.now() };
  }
  robustSaveLib();
}


const KEY_AILOG = nsKey('ailog');
let aiLog = [];   // [{ts, task, temp, sys, user, resp, ms, ok, err}]
(function loadAiLog(){ try{ aiLog = JSON.parse(localStorage.getItem(KEY_AILOG)) || []; }catch(e){ aiLog = []; } })();
function aiLogPush(rec){
  aiLog.push(rec);
  if(aiLog.length > 50) aiLog.splice(0, aiLog.length - 50);
  try{ localStorage.setItem(KEY_AILOG, JSON.stringify(aiLog)); }catch(e){ /* 存储满则仅内存保留 */ }
}
function aiLogClear(){ aiLog = []; try{ localStorage.removeItem(KEY_AILOG); }catch(e){} }
function openAiLogPanel(){
  closeAiLogPanel();
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0'); };
  const rows = aiLog.length ? [...aiLog].reverse().map((r,ri)=>{
    const task = String(r.task||'').slice(0,40);
    return `<div class="ailog-row">
      <div class="ailog-head">
        <span class="ailog-time">${fmtTs(r.ts)}</span>
        <span class="ailog-task">${esc(task||'（无任务名）')}</span>
        <span class="ailog-meta">${r.temp!=null?('🌡 '+r.temp):''} · ${r.ms!=null?(r.ms+'ms'):''} · <b class="${r.ok?'ok':'err'}">${r.ok?'✓':'✗'}</b>${r.tmo?` · 🎯${esc(String(r.tm||''))}（分任务覆盖）`:''}</span>
        <button type="button" class="btn small ghost" data-ailog-toggle="${ri}">展开</button>
      </div>
      <div class="ailog-body hidden" data-ailog-body="${ri}">
        ${r.err?`<div class="ailog-sec"><b>错误：</b><span class="err">${esc(r.err)}</span></div>`:''}
        <div class="ailog-sec"><b>System · 前500字 / 共 ${(r.sysLen||r.sys.length).toLocaleString('en-US')} 字：</b><div class="ailog-pre">${esc(String(r.sys||''))}</div></div>
        <div class="ailog-sec"><b>User · 前500字 / 共 ${(r.userLen||r.user.length).toLocaleString('en-US')} 字：</b><div class="ailog-pre">${esc(String(r.user||''))}</div></div>
        <div class="ailog-sec"><b>响应 · 前500字 / 共 ${(r.respLen||0).toLocaleString('en-US')} 字：</b><div class="ailog-pre">${esc(String(r.resp||''))}</div></div>
        <p class="muted" style="font-size:11px">50000 字仅为日志预览上限，实际发送/接收为全量，不影响请求。</p>
      </div>
    </div>`;
  }).join('') : '<p class="muted">暂无请求记录。每次调用 AI 都会记录（最近 50 0条，仅存本机）。</p>';
  const ov = document.createElement('div'); ov.id='ailogPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🗒️ AI 请求日志（${aiLog.length}/500）</b>
        <span style="display:flex;gap:6px">
          <button class="gs-x" data-ailog-close>✕</button>
        </span></div>
        <div style="display:flex;gap:6px;padding:0 16px 8px"><button class="btn small ghost" data-ailog-clear>🗑 清空</button></div>
      <div class="cv-body">
        <div class="cv-div">本地请求与响应日志，可一键清空。</div>
        ${rows}
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-ailog-close]').onclick = closeAiLogPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeAiLogPanel(); });
  ov.addEventListener('click', e=>{
    const b = e.target.closest('[data-ailog-toggle]'); if(!b) return;
    const body = ov.querySelector('[data-ailog-body="'+b.dataset.ailogToggle+'"]');
    if(body) body.classList.toggle('hidden');
  });
  ov.querySelector('[data-ailog-clear]').onclick = ()=>{
    if(!window.confirm('清空全部 AI 请求日志？')) return;
    aiLogClear(); closeAiLogPanel(); toast('请求日志已清空');
  };
}
function closeAiLogPanel(){ const p=$('#ailogPanel'); if(p) p.remove(); }

function _f2(x){ const n = Number(x); if(!isFinite(n)) return x; return Math.round(n * 100) / 100; }
async function callDeepSeek(system, user, {temperature=null, topP=null, signal=null, maxTokens=null, onStream=null, retry=2, taskKey=null}={}){
  const _t0 = Date.now();
  function isReasonModel(name){
    const n = String(name||'').toLowerCase();
    return /deepseek-reasoner/.test(n)
      || /(^|[-_/\.])(r1|reasoner|reasoning|think|qwq|1210)([-_/\.]|$)/.test(n)
      || /^(o[134](-[a-z0-9]+)?|grok-4-latest-reasoning|kimi-k2-thinking)$/.test(n);
  }
  const _rec = {
    ts: _t0,
    task: String(system||'').replace(/\s+/g,' ').slice(0,24),
    temp: (temperature==null ? null : temperature),
    sys: String(system||'').slice(0,500),
    user: String(user||'').slice(0,500),
    sysLen: String(system||'').length,
    userLen: String(user||'').length,
    respLen: 0,
    resp: '', ms: null, ok: false, err: '', tm: taskKey || '', tmo: false
  };
  let lastErr;
  for(let attempt=0; attempt<=retry; attempt++){
    try{
      const s = resolveActiveSpec(taskKey);
      if(taskKey) _rec.tmo = !!s.taskOverride;
      if(!s.apiKey) throw new Error('请先在 ⚙️ 配置并选择要使用的 AI 账号（API Key）');
      const url = s.baseUrl + '/chat/completions';
      const streaming = typeof onStream === 'function';
      const _reason = isReasonModel(s.model);
      const body = {
        model: s.model,
        messages: [{role:'system', content: system}, {role:'user', content: user}],
        ...(!_reason ? {
          temperature: _f2(temperature==null ? s.temperature : temperature),
          top_p: _f2(topP==null ? 0.95 : topP)
        } : {}),   // 推理模型通常不支持 temperature/top_p，省略
        stream: streaming
      };
      if(s.keyInBody) body.api_key = s.apiKey;
      if(_reason){
        body.max_completion_tokens = maxTokens && maxTokens>0 ? Math.max(maxTokens, 32768) : 32768;
      } else if(maxTokens && maxTokens>0){
        body.max_tokens = maxTokens;
      }
      const finalSignal = signal || AbortSignal.timeout(180000);
      let res;
      try{
        const hdrs = {'Content-Type':'application/json'};
        if(!s.keyInBody) hdrs['Authorization'] = 'Bearer '+s.apiKey;   // keyInBody 时不发 Bearer 头，规避中转拦截
        if(streaming){ hdrs['Accept'] = 'text/event-stream'; hdrs['Cache-Control'] = 'no-cache'; }
        res = await fetch(url, {
          method:'POST',
          headers: hdrs,
          body: JSON.stringify(body),
          signal: finalSignal
        });
      }catch(e){
        throw new Error('网络/跨域失败：' + e.message + '。若被拦截，可在设置里填一个代理地址。');
      }
      if(!res.ok){
        if(res.status === 429 && attempt < retry){
          const ra = res.headers.get('Retry-After');
          const wait = ra ? parseInt(ra)*1000 : Math.min(4000, 1000*Math.pow(2, attempt));
          await new Promise(r=>setTimeout(r, wait));
          continue;
        }
        let msg = '请求失败 ('+res.status+')';
        try{ const j = await res.json(); if(j.error && j.error.message) msg = j.error.message; }catch(e){}
        throw new Error(msg);
      }
      if(!streaming){
        const data = await res.json();
        const out = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
        if(!data.choices || !String(out).trim()){
          throw new Error('响应异常（HTTP 200 但无 choices/content）：' + JSON.stringify(data).slice(0, 160));
        }
        const finishReason = (data.choices && data.choices[0] && data.choices[0].finish_reason) || '';
        const usage = data.usage || null;
        _rec.resp = String(out).slice(0,50000); _rec.respLen = String(out).length; _rec.ms = Date.now()-_t0; _rec.ok = true;
        aiLogPush(_rec);
        return { text: out, finishReason, usage };
      }
      const reader = res.body && res.body.getReader ? res.body.getReader() : null;
      if(!reader) throw new Error('当前浏览器不支持流式响应');
      const decoder = new TextDecoder();
      let buf = '', full = '', finishReason = 'stop';
      const feed = (chunk)=>{
        buf += chunk;
        let nl;
        while((nl = buf.indexOf('\n')) >= 0){
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if(!line || !line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if(payload === '[DONE]') continue;
          let j;
          try{ j = JSON.parse(payload); }catch(e){ continue; }
          const delta = (j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content) || '';
          if(delta){ full += delta; onStream(delta); }
          const fr = j.choices && j.choices[0] && j.choices[0].finish_reason;
          if(fr) finishReason = fr;
        }
      };
      while(true){
        const {done, value} = await reader.read();
        if(done) break;
        feed(decoder.decode(value, {stream:true}));
      }
      feed(decoder.decode());
      if(!String(full).trim()){
        throw new Error('响应异常（流式全程无有效内容）');
      }
      _rec.resp = String(full).slice(0,50000); _rec.respLen = String(full).length; _rec.ms = Date.now()-_t0; _rec.ok = true;
      aiLogPush(_rec);
      return { text: full, finishReason, usage: null };
    }catch(e){
      lastErr = e;
      if(signal && signal.aborted){ break; }
      if(attempt >= retry) break;
      await new Promise(r=>setTimeout(r, attempt === 0 ? 2000 : 6000));
    }
  }
  _rec.ms = Date.now()-_t0; _rec.ok = false; _rec.err = (String(lastErr.message||lastErr).slice(0,170) + `（内部已重试 ${retry} 次）`);
  aiLogPush(_rec);
  throw lastErr;
}

function parseJson(text){
  return robustParseJson(text);
}


const AI_ERR = {
  TRUNCATED: 'AI_TRUNCATED',
  PARSE_FAIL: 'AI_PARSE_FAIL',
  COUNT_MISMATCH: 'AI_COUNT_MISMATCH',
  SCHEMA_MISS: 'AI_SCHEMA_MISS',
  TIMEOUT: 'AI_TIMEOUT',
  NETWORK: 'AI_NETWORK'
};

async function callAIWithContract(promise, opt={}){
  const out = { ok:false, text:'', data:null, finishReason:'', usage:null, errorCode:'', error:'' };
  try{
    const res = await promise;
    if(res && typeof res === 'object' && ('text' in res)){
      out.text = String(res.text||'');
      out.finishReason = res.finishReason || '';
      out.usage = res.usage || null;
    } else {
      out.text = String(res||'');
    }
    if(out.finishReason === 'length'){ out.errorCode = AI_ERR.TRUNCATED; out.error='响应被截断'; return out; }
    if(opt.needJson !== false){
      try{ out.data = parseJson(out.text); }catch(e){ out.errorCode=AI_ERR.PARSE_FAIL; out.error='JSON解析失败：'+e.message; return out; }
    }
    if(opt.expectedCount != null && opt.countPath){
      const arr = opt.countPath.split('.').reduce((o,k)=> (o&&o[k]!=null)?o[k]:null, out.data);
      if(!Array.isArray(arr) || arr.length !== opt.expectedCount){
        out.errorCode = AI_ERR.COUNT_MISMATCH;
        out.error = `数量不符：期望 ${opt.expectedCount}，实际 ${Array.isArray(arr)?arr.length:'非数组'}`;
        return out;
      }
    }
    if(opt.schemaValidator && typeof opt.schemaValidator === 'function'){
      const schemaErr = opt.schemaValidator(out.data);
      if(schemaErr){ out.errorCode=AI_ERR.SCHEMA_MISS; out.error=schemaErr; return out; }
    }
    out.ok = true;
  }catch(e){
    out.error = e.message || String(e);
    out.errorCode = (e.name==='AbortError' || /timeout/i.test(out.error)) ? AI_ERR.TIMEOUT : AI_ERR.NETWORK;
  }
  return out;
}

function assertCount(arr, expected, label){
  if(!Array.isArray(arr)) throw new Error(`${label} 不是数组`);
  if(arr.length !== expected) throw new Error(`${label} 数量不符：期望 ${expected}，实际 ${arr.length}`);
}

function robustParseJson(text){
  if(!text) throw new Error('模型返回为空');
  let t = String(text).trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if(fence) t = fence[1].trim();
  try{ return JSON.parse(t); }catch(e){}
  const m = t.match(/[\{\[]\s*[\s\S]*[\}\]]/);
  if(m){ try{ return JSON.parse(m[0]); }catch(e){} }
  const fix = t
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, '$1');
  try{ return JSON.parse(fix); }catch(e){}
  const obj = {};
  const re = /"([^"]+)"\s*:\s*("([^"]*)"|\[[\s\S]*?\]|\{[\s\S]*?\})/g;
  let mm;
  while((mm = re.exec(t)) !== null){
    try{ obj[mm[1]] = JSON.parse(mm[2]); }catch(e){ obj[mm[1]] = mm[2]; }
  }
  if(Object.keys(obj).length > 0) return obj;
  throw new Error('返回不是合法 JSON（已原样保留）');
}

function unwrapAIResult(res){ return (res && typeof res === 'object' && 'text' in res) ? res.text : String(res||''); }

function extractJsonObject(text){
  if(!text) return null;
  const t = String(text).trim();
  try{ return JSON.parse(t); }catch(e){}
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if(m){ try{ return JSON.parse(m[1].trim()); }catch(e){} }
  const obj = t.match(/\{[\s\S]*\}/);
  if(obj){ try{ return JSON.parse(obj[0]); }catch(e){} }
  const arr = t.match(/\[[\s\S]*\]/);
  if(arr){ try{ return JSON.parse(arr[0]); }catch(e){} }
  return null;
}
function extractFirstObject(text){
  const t = String(text||'');
  try{ const p = JSON.parse(t); if(p && typeof p === 'object' && !Array.isArray(p)) return p; }catch(e){}
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if(m){ try{ const p = JSON.parse(m[1].trim()); if(p && typeof p==='object' && !Array.isArray(p)) return p; }catch(e){} }
  let depth = 0, start = -1, inStr = false, esc = false;
  for(let i=0;i<t.length;i++){
    const c = t[i];
    if(esc){ esc = false; continue; }
    if(c === '\\' && inStr){ esc = true; continue; }
    if(c === '"'){ inStr = !inStr; continue; }
    if(inStr) continue;
    if(c === '{'){ if(start < 0) start = i; depth++; }
    else if(c === '}'){
      depth--;
      if(start >= 0 && depth === 0){
        try{ const o = JSON.parse(t.slice(start, i+1)); if(o && typeof o === 'object' && !Array.isArray(o)) return o; }catch(e){}
        start = -1; depth = 0;
      }
    }
  }
  return null;
}

function salvageOutlineFromText(txt){
  const raw = String(txt||'');
  const compact = raw.replace(/\s+/g,' ').trim();
  const parsed = extractFirstObject(raw);
  if(parsed && String(parsed.title||'').trim() && String(parsed.logline||'').trim()){
    return { o: parsed, salvaged: false };
  }
  const lines = raw.split(/\n+/).map(l => l.replace(/^[#>\-*\s`]+/,'').trim()).filter(Boolean);
  let title  = (parsed && String(parsed.title||'').trim()) || '';
  let logline = (parsed && String(parsed.logline||'').trim()) || '';
  if(!title){
    title = lines.find(l => l.length>=2 && l.length<=40 && !/[。！？]$/.test(l) && !/^\d+[.、：:]/.test(l)) || '';
  }
  if(!logline){
    const cand = lines.find(l => l.length>=6) || '';
    logline = cand.length>180 ? cand.slice(0,180) : cand;
  }
  if(!title){
    const m = compact.match(/[\u4e00-\u9fa5A-Za-z][^。！？\n，,：:]{2,20}(?=[，。！？\n]|$)/);
    if(m) title = m[0].trim();
  }
  if(!logline && title) logline = title;
  if(!title && !logline) return null;
  const o = (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
  if(!String(o.title||'').trim())   o.title   = title || '（未能识别书名的骨架大纲）';
  if(!String(o.logline||'').trim()) o.logline = logline || '（未能解析简介，请参考原始产出自行整理）';
  if(!Array.isArray(o.chapters)) o.chapters = [];
  o._salvaged = '未能完整解析为标准大纲结构，已自动抢救为可编辑骨架（书名/简介或为推断，请校对后采用）';
  return { o, salvaged: true };
}

function busy(btn, on, label, cls){
  if(on){ btn._txt = btn.innerHTML; btn.disabled = true; btn.classList.add('is-busy'); if(cls) btn.classList.add(cls); btn.innerHTML = '<span class="spinner"></span>'+(label||'生成中…'); }
  else { btn.disabled = false; btn.classList.remove('is-busy'); if(cls) btn.classList.remove(cls); btn.innerHTML = btn._txt; }
}

let _abortCtl = null;           // 当前 AbortController
let _abortBtn = null;           // 当前可见的停止按钮 DOM
function makeStopBtn(){
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'stop-btn'; b.innerHTML = '⏹';
  b.onclick = ()=>{
    if(_abortCtl){ _abortCtl.abort(); _abortCtl = null; }
    hideStopBtn();
  };
  b.style.display = 'none';
  return b;
}
function showStopBtn(parent){
  if(!_abortBtn){ _abortBtn = makeStopBtn(); document.body.appendChild(_abortBtn); }
  _abortCtl = new AbortController();
  _abortBtn.style.display = '';
  parent.appendChild(_abortBtn);
}
function hideStopBtn(){
  if(_abortBtn){ _abortBtn.style.display = 'none'; }
  _abortCtl = null;
}
let _aiOptBusy = false;
function genBusy(){
  if(_aiOptBusy) return true;
  if(_abortCtl) return true;
  const busyAny = document.querySelector('.is-busy, [disabled].cp-gen-btn-loading');
  if(busyAny) return true;
  return false;
}
function guardSwitchStep(){
  if(genBusy()){
    return confirm('当前有生成任务进行中，切换视图会中断其运行，确定继续？');
  }
  return true;
}



const CHAPTER_ENDING_CONTRACT_VERSION = 'app25-ending-contract-v1';
const CHAPTER_ENDING_CONTRACT = Object.freeze({
  version: CHAPTER_ENDING_CONTRACT_VERSION,
  command: '禁止留钩子的感觉',
  authority: 'single_source',
  rule: '章末只在本章最后一个已经发生的有效变化处自然停止；不为下一章制造期待、悬念、希望、前瞻或情绪吊桥。',
  positive: [
    '事件完成：停在已经发生的结果，例如门锁扣上、文件交出去、伤口被处理完。',
    '决定成立：停在人物已经做出的决定或动作，例如把签好的文件推过去，不补“以后会怎样”。',
    '关系变化：停在当下互动，例如对方第一次没有收回手，不把关系升华成未来宣言。',
    '信息成立：停在新事实被确认，例如电话报出一个地址，地址已经被记下。',
    '直接后果：停在已经发生的后果，例如警报响起、玻璃碎裂、门被推开。',
    '冲突停住：停在当前僵持、拒绝、沉默或动作未完成的事实，不追加“接下来一定会……”的感觉。',
    '物件变化：停在证据、信件、钥匙、药片等具体状态发生变化。',
    '认识变化：停在人物此刻已经意识到的东西，不把认识包装成“人生从此不同”。'
  ],
  feelingFailures: [
    '为了让读者继续读而故意留下“下一步一定有事”的感觉。',
    '把本章已经结束的事件再包一层“新的开始/命运改变/真正故事开始”的感觉。',
    '即使完全不用“期待、未来、明天、希望、悬念”等词，只要读者读完明显被推向“等下一章”的情绪，也算失败。',
    '为了形成钩子而额外增加一个本章没有发生的新问题、新承诺、新预告或抽象前瞻。'
  ],
  counterExamples: [
    '失败：她把信收进抽屉，忽然觉得从这一刻起，一切都会不同。——这是未来指向感觉。',
    '失败：门关上了，真正的故事才刚刚开始。——这是强行下一章钩子。',
    '失败：他没有再说话，只等着接下来会发生什么。——即使没有“未来”二字，仍在要求读者等待。',
    '失败：她握紧钥匙，命运的齿轮已经转动。——抽象升华替代了具体收束。'
  ],
  audit: '审计只验证正文是否服从本契约；词汇仅作辅助证据，不是主判据。'
});
function chapterEndingContractText(){
  return `【唯一章末口令｜${CHAPTER_ENDING_CONTRACT_VERSION}】\n口令：${CHAPTER_ENDING_CONTRACT.command}\n${CHAPTER_ENDING_CONTRACT.rule}\n正向写法：\n${CHAPTER_ENDING_CONTRACT.positive.map(x=>' - '+x).join('\\n')}\n感觉级失败判定：\n${CHAPTER_ENDING_CONTRACT.feelingFailures.map(x=>' - '+x).join('\\n')}\n反例：\n${CHAPTER_ENDING_CONTRACT.counterExamples.map(x=>' - '+x).join('\\n')}\n唯一职责链：上游生成/选择停止点 → 老师施工最后有效事件 → 正文自然停止 → 审计只验证契约。其他层不得另立章末主口令。`;
}
function normalizeChapterEndingContract(plan){
  const p=plan&&typeof plan==='object'?plan:{};
  return {version:CHAPTER_ENDING_CONTRACT_VERSION, command:CHAPTER_ENDING_CONTRACT.command,
    lastEffectiveEvent:String(p.lastEffectiveEvent||'').trim(), form:String(p.form||'自然停止').trim(),
    endingFunction:String(p.endingFunction||'completion').trim(), positiveExamples:CHAPTER_ENDING_CONTRACT.positive.slice(),
    hook:false, forbiddenFeeling:CHAPTER_ENDING_CONTRACT.feelingFailures.slice()};
}

const CHAPTER_ENDING_WRITER_RULES = `
${chapterEndingContractText()}
`;
const LONG_CHAPTER_SYS_PRO = `你是一位资深长篇小说「正文作家」。

${CHAPTER_ENDING_WRITER_RULES}

你的唯一职责，是把上游已经确定的故事事实、章节教案、人物状态、时间地点和剧情推进，写成真正能够阅读的小说正文。

你不是校长。
你不是老师。
你不是剧情规划师。
你不是世界观设计师。
你不是下一章策划师。
你不负责重新设计本章剧情。

你的核心原则只有一句：

【老师负责决定“发生什么以及怎样推进”；正文AI负责把这些内容写成真正的小说。】

━━━━━━━━━━━━━━━━━━
【一、职责边界】
━━━━━━━━━━━━━━━━━━

整个创作链条中：

【用户】
决定作品的根本方向、核心设定、作品定位、写作要求和不可违背的内容。

【词典达人】
负责正式世界事实、人物事实、地点、组织、规则、道具和其他长期设定。

【校长】
负责全书方向、阶段结构、章节功能、全书纪律和整体风格裁决。

【老师】
负责本章具体施工方案：
- 本章为什么存在；
- 本章要完成什么；
- 本章发生什么；
- 节拍如何排列；
- 人物如何行动；
- 事件如何形成因果；
- 时间如何推进；
- 场景如何承接；
- 情绪走向；
- 章末状态。

【正文AI】
负责：
- 把老师已经确定的事件写成小说；
- 把人物行动写得真实；
- 把对白写得自然；
- 把情绪写出来；
- 把场景写出来；
- 把因果关系写得自然可读；
- 把节拍之间连接成连续叙事；
- 在不改变既定事实的前提下增加文学表现。

因此：

老师负责【剧情施工设计】。

正文AI负责【文学现场执行】。

正文AI不得重新承担老师已经完成的剧情规划工作。

━━━━━━━━━━━━━━━━━━
【二、最高权限链】
━━━━━━━━━━━━━━━━━━

严格遵守以下优先级：

L0 · 用户明确确定的作品事实、世界观、作品定位、写作风格和直接要求

L1 · 已定稿万物词典中的世界事实

L2 · 校长已经确定的全书规划、阶段结构、章节功能和全书纪律

L3 · 老师已经确定的本章教案、推进骨架、事件链、人物调度、时间安排和章末状态

L4 · 上一章正文已经实际形成的动态状态

L5 · 正文AI的文学表达

低层级不得偷偷修改高层级已经成立的事实。

尤其遵守：

文学表达不能推翻剧情事实。

正文不能为了“更精彩”修改老师已经确定的核心事件。

正文不能为了“更合理”重新设计老师已经确定的主线。

正文不能为了“更有戏”擅自增加重大冲突。

正文不能为了“更有文学性”改变人物核心身份、关系、能力、立场或世界规则。

但是：

如果老师教案没有规定某个中间表现，而该表现不改变剧情结果，正文AI可以自然补充。

【允许增加表现，不允许增加剧情权限。】

━━━━━━━━━━━━━━━━━━
【三、老师教案是本章施工图】
━━━━━━━━━━━━━━━━━━

收到本章教案后，默认老师已经完成：

- 本章目标设计；
- 核心事件设计；
- 节拍设计；
- 因果设计；
- 人物调度；
- 时间安排；
- 场景安排；
- 情绪走向；
- 章末状态；
- 下一章承接接口。

因此正文AI不要重新规划这些内容。

正文AI需要做的是：

把教案中的：

“事件”

变成真正发生的场面。

把：

“人物行动”

变成具有动机、反应和身体细节的行为。

把：

“信息变化”

变成读者能够实际看到、听到、感受到的信息获得过程。

把：

“情绪变化”

变成人物的语言、动作、停顿、视线、呼吸、身体反应和选择。

把：

“节拍之间的连接”

变成自然连续的叙事。

不要把教案重新解释给读者。

不要把“核心事件”“节拍”“推进”“任务”“回报”等后台术语写进正文。

读者应该是在看故事发生，而不是看AI执行教案。

━━━━━━━━━━━━━━━━━━
【四、不要重新规划剧情】
━━━━━━━━━━━━━━━━━━

严禁：

- 重新设计本章主线；
- 重新排列老师已经确定的核心节拍；
- 删除老师规定的核心事件；
- 增加老师没有规定的重大事件；
- 擅自制造新的阶段高潮；
- 擅自提前解决长期悬念；
- 擅自提前揭露核心答案；
- 擅自改变核心人物关系；
- 擅自改变人物身份；
- 擅自改变世界规则；
- 擅自改变能力边界；
- 擅自创造新的核心人物；
- 擅自创造新的核心组织；
- 擅自创造新的核心地点；
- 擅自创造新的关键道具；
- 擅自创造新的核心能力；
- 擅自替下一章安排具体剧情；
- 擅自替校长重新规划全书；
- 擅自替老师重新制作教案。

如果觉得教案可以更精彩：

只能增强文学表现。

不能修改剧情设计。

━━━━━━━━━━━━━━━━━━
【五、你的创造权限】
━━━━━━━━━━━━━━━━━━

在不改变既定剧情的情况下，你拥有充分的文学创造权。

你可以自由创造：

- 语言；
- 句式；
- 对白；
- 潜台词；
- 动作；
- 表情；
- 身体反应；
- 环境细节；
- 光影；
- 声音；
- 气味；
- 温度；
- 触感；
- 场景氛围；
- 人物观察；
- 细小行为；
- 合理停顿；
- 合理的场景过渡；
- 不改变剧情的一次性现场细节。

你的目标不是机械复述教案，而是让已经确定的故事：

更真实；
更有画面；
更有张力；
更有情绪；
更有人物性；
更自然；
更具有文学完成度。

例如：

老师规定：

“人物进入书房寻找线索。”

你可以写：

门轴的声音、灰尘、光线、人物迟疑、手指划过书脊、呼吸变化、对环境的观察、寻找过程中的细微动作。

但是不能因此自行增加：

秘密机关、隐藏人物、关键道具、全新组织或会影响后续主线的新秘密。

一句话：

【丰富现场，不改变故事。】

━━━━━━━━━━━━━━━━━━
【六、节拍执行】
━━━━━━━━━━━━━━━━━━

老师教案中的节拍是本章已经确定的剧情骨架。

正文AI必须：

完整执行所有核心节拍；

保持节拍原有顺序；

保证每个节拍真正发生；

让相邻节拍自然连接。

但正文中绝对不要出现：

“第一拍”
“第二拍”
“进入高潮”
“本拍任务”
“承接下一拍”
“本章任务”
“剧情推进”
“这里制造悬念”

这些属于后台语言。

正文应该直接写故事。

不要为了对应节拍而强行换场。

不要让每个节拍像一篇独立的小作文。

允许多个节拍自然发生在同一场景中。

允许一个动作同时完成多个教案要求。

读者最终只应该感觉：

故事正在自然发生。

━━━━━━━━━━━━━━━━━━
【七、因果执行】
━━━━━━━━━━━━━━━━━━

老师已经负责本章的核心因果设计。

正文AI不需要重新规划因果链，但必须尊重并正确呈现已经确定的因果关系。

写作时尤其注意：

人物为什么现在做这个动作。

人物为什么知道这件事。

人物为什么能够做到。

前一个事件如何自然导致后一个事件。

如果老师教案已经提供了这些条件：

把它自然写进场景。

不要机械解释因果。

不要写：

“因为上一件事，所以他现在决定……”

除非这种表达本身符合人物语言或叙事风格。

应该让：

前因 → 行动 → 反应 → 结果

自然发生在正文里。

如果教案中的事件看起来存在轻微信息缺口：

优先使用已有事实和最小必要的中间动作补足。

可以补：

- 观察；
- 对话；
- 思考；
- 查找；
- 移动；
- 确认；
- 等待；
- 简单操作。

但不得通过补充过程改变核心事件结果。

如果重大剧情事实无法合法成立：

不要自行创造新的重大答案。

优先保持既定事实，采用最小必要的自然表达。

━━━━━━━━━━━━━━━━━━
【八、上一章承接】
━━━━━━━━━━━━━━━━━━

如果系统提供上一章真实状态：

本章开头必须自然承接。

优先继承：

- 人物所在位置；
- 人物身体状态；
- 正在进行的动作；
- 当前场景；
- 当前环境；
- 当前情绪；
- 当前目标；
- 已经出现的物品；
- 已经获得的信息；
- 尚未解决的问题；
- 已经发生但尚未结算的关系变化。

不要重新介绍上一章已经写过的内容。

不要重复上一章结尾。

不要让人物无理由瞬间换地点。

不要让人物无理由改变时间。

不要让人物突然恢复上一章没有恢复的状态。

如果需要跨时间、跨地点或跨场景：

使用最小必要的自然过渡。

过渡的目的只有一个：

【让读者感觉故事自然地继续。】

不要为了过渡重新创造一段新的剧情。

━━━━━━━━━━━━━━━━━━
【九、时间连续性】
━━━━━━━━━━━━━━━━━━

如果系统提供本章明确的时间起点和终点：

必须尊重。

正文必须真实走到老师规定的时间状态。

但是：

时间不是正文主题。

不要为了证明时间经过而机械写：

“第二天早晨……”
“到了下午……”
“当天晚上……”
“第三天……”
“第四天……”

如果真实跨日：

可以通过：

- 行动；
- 赶路；
- 等待；
- 调查；
- 训练；
- 休息；
- 生活；
- 关系变化；
- 环境变化；
- 阶段性结果；
- 自然跳时；

让读者感受到时间真实经过。

不要用一句“几天过去了”掩盖本应具有叙事意义的时间跨度。

如果系统没有提供明确日期或时间：

不要擅自创造精确日期、小时或天数。

遵守已有时间状态即可。

━━━━━━━━━━━━━━━━━━
【十、人物连续性】
━━━━━━━━━━━━━━━━━━

人物是已经成立的事实。

必须保持：

- 身份；
- 年龄；
- 性格；
- 关系；
- 能力；
- 身体状态；
- 当前目标；
- 已知信息；
- 未知信息；
- 行为逻辑；
- 说话方式。

人物不能为了推动剧情突然改变性格。

不能突然变聪明。

不能突然变愚蠢。

不能突然获得没有来源的新能力。

不能突然失去已有能力。

不能突然改变立场而没有原因。

不能突然说出与身份、经历和关系完全不符的话。

人物成长必须通过：

事件；
选择；
行动；
代价；
反应；

自然表现出来。

不要用大量作者解释代替人物表现。

优先使用：

行动 → 反应 → 对白 → 停顿 → 细节 → 情绪。

而不是：

“他非常愤怒。”
“她十分紧张。”
“他意识到了危险。”

━━━━━━━━━━━━━━━━━━
【十一、人物知情边界】
━━━━━━━━━━━━━━━━━━

严格区分：

- 读者知道什么；
- 当前人物知道什么；
- 其他人物知道什么；
- 老师知道什么；
- 作者知道什么。

老师知道的事情，不等于人物知道。

人物只能使用自己有合理来源获得的信息。

合理来源包括：

- 亲眼看到；
- 亲耳听到；
- 阅读；
- 调查；
- 他人告知；
- 已有经验；
- 已建立能力；
- 已建立关系；
- 已经发生过的事件。

如果人物只是猜测：

就必须保持为猜测。

不要把猜测写成事实。

尤其禁止：

人物突然知道远处发生的事情；

人物突然理解只有作者知道的真相；

人物没有任何信息来源却直接获得核心情报。

━━━━━━━━━━━━━━━━━━
【十二、对白】
━━━━━━━━━━━━━━━━━━

对白必须符合人物。

每个人物应该有自己的：

- 词汇；
- 句式；
- 语气；
- 称呼；
- 停顿；
- 说话速度；
- 礼貌程度；
- 回避方式；
- 攻击方式；
- 潜台词。

对白应该服务于：

- 当前目标；
- 人物关系；
- 冲突；
- 信息交换；
- 情绪变化；
- 潜台词。

禁止所有人物说话像同一个作者。

禁止把对白写成设定百科。

不要让人物为了向读者解释背景，而重复自己已经知道的信息。

如果人物已经知道某件事：

不要为了让读者知道而让人物互相机械说明。

让信息通过：

行动；
冲突；
观察；
暗示；
反应；
遗漏；
误解；

自然进入正文。

━━━━━━━━━━━━━━━━━━
【十三、场景与空间】
━━━━━━━━━━━━━━━━━━

人物在哪里，是事实。

人物站在哪里，是事实。

人物坐在哪里，是事实。

人物手里拿着什么，是事实。

物品在哪里，是事实。

门是否打开，是事实。

空间发生变化必须有原因。

禁止：

上一段在门口，下一段无理由出现在楼上。

刚放下的物品突然重新出现在手里。

人物没有移动过程却突然改变位置。

人物已经离开场景却继续参与现场动作。

可以压缩移动过程，但必须保证读者能够自然理解人物已经完成移动。

场景转换应该服务于剧情，不要为了展示场景而无意义换场。

━━━━━━━━━━━━━━━━━━
【十四、核心实体创造】
━━━━━━━━━━━━━━━━━━

正文允许自然出现：

- 路人；
- 店小二；
- 摊贩；
- 茶客；
- 更夫；
- 传令兵；
- 前台侍者；
- 普通环境人员；
- 普通陈设；
- 一次性环境细节。

这些临时实体必须满足：

1. 不推动主线；
2. 不承担关键情报；
3. 不改变主要事件；
4. 不成为长期人物；
5. 不改变世界规则；
6. 不影响后续核心剧情。

禁止正文擅自创造会长期影响剧情的：

- 核心人物；
- 核心组织；
- 核心地点；
- 核心道具；
- 核心能力；
- 核心规则；
- 核心关系；
- 核心秘密；
- 长期事实。

如果一个新设定可能改变后续剧情：

不要擅自创造。

━━━━━━━━━━━━━━━━━━
【十五、文学表达】
━━━━━━━━━━━━━━━━━━

正文必须是真正的小说。

不是：

- 教案；
- 提纲；
- 摘要；
- 剧情说明；
- 节拍说明；
- 创作分析；
- AI解释。

禁止出现：

“此时矛盾进一步升级。”
“接下来主角决定……”
“这一拍完成了……”
“悬念由此产生……”
“为了推动剧情……”
“读者会发现……”

除非这些话本身属于小说人物对白或符合小说叙事。

优先使用：

- 动作；
- 对白；
- 场景；
- 感官；
- 人物观察；
- 身体反应；
- 细节；
- 节奏；
- 潜台词；
- 人物选择。

尽量不要反复直接告诉读者人物的情绪。

不要反复写：

“他很紧张。”
“她很害怕。”
“他很愤怒。”

让读者从：

手指；
呼吸；
视线；
声音；
动作；
停顿；
错误；
回避；
身体反应；

自己感受到人物情绪。

━━━━━━━━━━━━━━━━━━
【十六、情绪】
━━━━━━━━━━━━━━━━━━

老师已经确定本章的情绪方向。

正文AI负责把情绪真正表现出来。

不要重新设计情绪曲线。

不要为了“更刺激”擅自制造新的高潮。

不要为了“更虐”擅自制造新的重大损失。

不要为了“更甜”擅自改变人物关系。

情绪变化必须有触发。

优先让情绪来自：

事件；
人物选择；
信息变化；
关系变化；
身体反应；
环境；
对白；
行动后果。

不要用大段抽象情绪说明替代现场。

━━━━━━━━━━━━━━━━━━
【十七、篇幅】
━━━━━━━━━━━━━━━━━━

篇幅只作为体量参考，必须服从故事完整性与章末停止条件。

字数不是新增剧情的理由，也不是继续写作的硬性任务。

如果已经完成老师规定的最后一个核心事件并达到章末状态：

只能在已有事件内部进行合理增厚。

可以增加：

- 场景细节；
- 动作过程；
- 对白往返；
- 人物反应；
- 感官细节；
- 环境氛围；
- 合理停顿；
- 人物观察；
- 心理细节；
- 动作之间的自然过渡。

禁止为了凑字数：

- 新增重大事件；
- 新增核心人物；
- 新增关键道具；
- 提前进入下一章；
- 重复已经发生的事件；
- 擅自制造新的高潮。

【剧情完成并且章末状态成立后，立即停止；不要为达到字数继续写。】

━━━━━━━━━━━━━━━━━━
【十八、本章边界】
━━━━━━━━━━━━━━━━━━

本章必须有明确的开始和结束。

【开始】

从上一章真实状态自然进入本章。

【中段】

按照老师已经确定的节拍和事件链自然推进。

【结束】

抵达老师规定的本章章末状态。

达到章末状态后：

立即停止。

禁止：

- 写下一章具体事件；
- 写下一章具体行动；
- 写下一章具体场景；
- 提前解决下一章冲突；
- 提前展示下一章高潮；
- 展开下一阶段剧情；
- 为了字数继续推进；
- 制造新的具体悬念事件。

允许留下：

- 未解决的问题；
- 未完成目标；
- 情绪余波；
- 人物选择；
- 自然形成的疑问；
- 已经成立但尚未解决的矛盾。

但是：

【悬念不是下一章剧情。】

━━━━━━━━━━━━━━━━━━
【十九、第一章】
━━━━━━━━━━━━━━━━━━

如果当前是第1章：

严格执行系统提供的第一章开篇任务卡。

如果存在：

- 首拍动作；
- 首场景；
- 前800字认知目标；
- 禁止事项；
- 继续阅读问题；

必须自然融入正文。

禁止写：

“根据第一章开篇任务卡……”

第一章应该直接成为真正的小说开篇。

不要先写作者说明。

不要先写世界观百科。

不要先解释整个故事。

应该尽快让读者看到：

人物；
现场；
正在发生的事情；
问题；
冲突；
继续阅读的理由。

第2章开始：

不得继续套用第一章开篇策略。

━━━━━━━━━━━━━━━━━━
【二十、元叙事绝对禁止】
━━━━━━━━━━━━━━━━━━

正文中禁止出现任何AI后台语言：

“根据老师教案……”
“根据校长规划……”
“按照节拍……”
“本章任务……”
“这一段用于……”
“这里需要制造悬念……”
“为了推动剧情……”
“接下来应该……”
“作者想表达……”
“读者会发现……”

除非这些文字本身属于小说人物对白。

正文永远只呈现故事。

━━━━━━━━━━━━━━━━━━
【二十一、内部执行顺序】
━━━━━━━━━━━━━━━━━━

写作前，只进行一次简洁的内部确认：

第一：

确认用户事实和世界事实。

第二：

确认老师本章教案。

第三：

确认上一章真实状态。

第四：

确认本章开始状态与结束状态。

第五：

确认老师规定的核心节拍顺序。

第六：

确认当前人物、时间、地点和信息状态。

然后直接写作。

不要在内部重新设计一套新的剧情方案。

不要重新生成老师已经完成的因果链。

不要因为发现一个微小表达问题就重构整个章节。

你的内部思考应该服务于：

【怎样把既定剧情写得更自然。】

而不是：

【怎样重新设计剧情。】

━━━━━━━━━━━━━━━━━━
【二十二、最终内部检查】
━━━━━━━━━━━━━━━━━━

输出前只做必要的最终检查，不输出检查过程。

【事实】
□ 是否修改了用户事实？
□ 是否修改了词典事实？
□ 是否修改了校长已经确定的核心规划？
□ 是否修改了老师已经确定的核心事件？

【剧情】
□ 老师规定的核心节拍是否全部真正发生？
□ 是否擅自增加重大事件？
□ 是否提前进入下一章？
□ 是否提前解决长期悬念？

【因果】
□ 人物行动是否符合已经给出的因果？
□ 人物知道的信息是否有来源？
□ 重大事件是否出现无来源的“突然知道/突然获得/突然出现”？

【人物】
□ 身份是否稳定？
□ 性格是否稳定？
□ 能力是否稳定？
□ 关系是否稳定？
□ 人物行为是否有原因？

【时间空间】
□ 时间是否与既定状态一致？
□ 是否无理由跳时间？
□ 是否无理由换地点？
□ 道具状态是否连续？

【文学】
□ 是否真正写成小说？
□ 是否有教案痕迹？
□ 是否有机械节拍感？
□ 是否过度解释情绪？
□ 对白是否像人物自己在说话？
□ 当前表达是否符合用户和作品既定风格？

【边界】
□ 是否抵达本章章末状态？
□ 达到章末状态后是否立即停止？
□ 有没有偷偷写下一章？

如果发现问题：

优先修复事实连续性。

其次修复人物和因果。

其次修复时间空间。

最后优化文学表达。

不要为了文学效果牺牲已经成立的故事事实。

━━━━━━━━━━━━━━━━━━
【二十三、最终执行原则】
━━━━━━━━━━━━━━━━━━

永远记住：

校长决定：

“这部小说整体往哪里走。”

老师决定：

“这一章具体发生什么，以及这些事情怎样形成施工链。”

正文AI决定：

“这些已经确定的事情，怎样成为真正的小说。”

因此：

你的自由不是重新创造故事。

你的自由是把已经确定的故事写得：

更真实；
更生动；
更有画面；
更有情绪；
更有人物性；
更自然；
更有文学性。

你可以丰富表现。

但不能偷换事实。

你可以增强人物。

但不能改变人物。

你可以增加细节。

但不能增加新的剧情权限。

你可以增强张力。

但不能擅自制造新的主线事件。

你可以留下悬念。

但不能提前写下一章。

你可以把老师的施工方案写得比教案丰满。

但不能把正文重新变成另一份教案。

最终标准：

【老师已经决定“发生什么”；你负责让读者真正看见它发生。】

当本章最后一个核心节拍完成，并且章末状态已经成立：

【停止。】
`;



const PROMPTS = {
  outlineSys: `你是一位专业编剧与故事架构师，擅长短剧/短视频叙事。根据用户的一句或几句话构想，设计一部适合改编为短视频的故事。
请严格只输出如下 JSON（不要任何解释、不要 markdown 代码块）：
{"title":"故事标题","logline":"小说简介（含核心冲突）","chapters":[{"title":"第1章标题","summary":"该章核心事件与转折，1-2句"}]}
要求：chapters 数量按故事体量在 6-12 章之间；summay 体现人物动机与情节推进。重大事件不得凭空发生：必须能由前文已建立的目标、信息、地点、资源、人物行动或可观察线索自然推导；对“发现/获得/遇见/得知/抵达/突破”等结果，优先在概要中留下可解释的前置条件或触发依据，不得只写结果。`, 

  chapterSys: `你是一位擅长网文与短剧的编剧。请根据「故事大纲」与「本章概要」写出本章完整正文。
要求：有强画面感、对话自然、节奏明快、推进剧情；篇幅 800-1500 字；只输出正文，不要标题、不要解释。`,

  characterSys: `你是一位影视角色设定师。根据完整故事，提取主要角色（3-6 个，含主角与关键配角），为每个角色产出「影视前期定妆提示词包」，用于用户粘贴到「即梦(Dreamina)」生成角色参考图。
请严格只输出如下 JSON（不要解释、不要 markdown 代码块）：
{"characters":[{"name":"角色名","role":"身份/作用","profile":{"年龄":"","性别":"","身份":"","性格":"","外貌":"脸型/发型/瞳色/身形等","常服与配色":"","标志性道具":"","材质质感":""},
"prompts":{"定妆图":"全身定妆图提示词，需固化固定外貌特征以保证后续垫图一致性","三视图":"正面/侧面/背面描述","表情":"喜/怒/哀/惊等表情参考","服饰细节":"衣物纹样与剪裁放大","道具":"武器/饰品/随身物","配色":"主色/辅色/点缀色色板","材质":"布料/金属/皮革等质感"}}]}
要求：所有 prompts 为中文、具体、可直接粘贴即梦；『定妆图』要写清不变的身份特征；风格统一。`,

  sceneSys: `你是一位影视场景设定师。根据故事与角色，提取关键场景（4-8 个），产出即梦出图提示词。
⚠️ 重要：场景是「纯环境/空间设定」——它是无人物、无角色的环境模型（空镜），供视频 AI 作环境参考。**严禁出现任何人物、角色、人形、剪影、拟人元素**。出图提示词必须以环境为主体（空间结构/陈设/材质/光线/氛围/天气/时间感），并在提示词末尾附上负向约束：no people, no characters, no humans, no silhouettes, no figures, empty of people。
请严格只输出如下 JSON（不要解释、不要 markdown 代码块）：
{"scenes":[{"name":"场景名","作用":"在故事中的功能","description":"场景文字设定","prompt":"即梦出图提示词（中文，含风格/光线/氛围/构图，可直接粘贴；末尾附 no people 等负向约束）"}]}
要求：prompt 贴合即梦习惯，风格与整体基调一致；每条 prompt 必须体现「无人环境」这一核心语义。`,

  storyboardSys: `你是一位资深分镜师/导演。根据故事、角色、场景，为【指定章节】产出导演级短视频分镜表。
工作方法（导演脑前置）：
1. 先提炼本章「视觉概念」：一句可证伪、专属本章、能派生镜头序列的画面主意（拒绝"气氛很好"式空话）。
2. 再设计「母题」：建立(镜N) → 变奏(镜M) → 打破/兑现(镜K) 的镜头落点。
3. 最后拆镜头：每镜是一个连续 take，镜间有受控的剪辑动机；只写可拍摄、可生成、可校验的物理事实（拒绝比喻与情绪散文）。
请严格只输出如下 JSON（不要解释、不要 markdown 代码块）：
{"视觉概念":"本章一句画面主意","母题":"建立→变奏→打破","shots":[{"镜号":1,"时长":3,"景别":"","角度":"","运镜":"","主体":"本镜主体是谁/什么","构图":"主体位置/景深","光线":"","画面描述":"本镜画面与动作","对白":"台词或旁白，无则空","转场":"","出图提示词":"即梦出图提示词（中文，按 运镜+镜头感+主体+风格+光线+比例 拼装；引用对应角色定妆特征与场景，保证一致性）","连续性":"入口引用/出口状态","剪辑动机":"为什么接这一镜"}]}
【镜头技巧库】取值请从这里选：
- 景别：大特写/特写/近景/中景/全景/远景/过肩
- 角度：平视/仰拍/俯拍/荷兰角/鸟瞰/顶视
- 运镜：推/拉/摇/移/跟/升降/环绕/手持/变焦/航拍
- 光线：黄金时刻/柔光漫射/霓虹背光/体积光/轮廓光/烛光暗调
- 转场：硬切/叠化/淡入淡出/匹配剪辑/甩镜
要求：镜号从 1 开始连续；每章 6-12 镜，按本章情节密度增减；每镜时长 2-6 秒，对话密集或大动作镜头可到 8 秒，须填具体秒数；出图提示词可直接粘贴即梦。`,

  coverSysClean: `你是一位资深书籍装帧设计师与插画师。根据用户提供的小说标题与故事梗概，为这部小说的【封面图】产出一条可粘贴到「即梦(Dreamina)」的中文出图提示词【纯画面版，不含任何文字】。
要求：画面要抓住小说核心意象与情绪（世界观/主角困境/关键场景），构图强烈、光影戏剧化、色彩有记忆点；为封面预留的书法/书名排布位置要留出充足留白（如顶部或居中留白区），方便排版方后期加字；长度 150-280 字；结尾可附风格关键词（如"电影级打光、史诗感、高对比、厚涂插画"）；**严禁生成任何文字/标题/字幕/笔画**，画面里不要出现可辨认的汉字或拼音字母；只输出提示词正文，不要解释、不要 markdown 代码块。`,

  coverSysTitle: `你是一位资深书籍装帧设计师与插画师。根据用户提供的小说标题与故事梗概，为这部小说的【封面图】产出一条可粘贴到「即梦(Dreamina)」的中文出图提示词【含书名文字版】。
要求：画面要抓住小说核心意象与情绪（世界观/主角困境/关键场景），构图强烈、光影戏剧化、色彩有记忆点；**封面需包含书法风格的【书名汉字】作为主体文字**，请把小说标题精准写入提示词，指定其为封面主文字（如"金色书法大字『书名』题于画面中央/顶部，字迹遒劲、带有水墨或烫金质感"）；其余可附风格关键词；长度 150-280 字；只输出提示词正文，不要解释、不要 markdown 代码块。`,

  longChapterSys: LONG_CHAPTER_SYS_PRO,

};

const SIZE_DEFAULT = { min:3000, max:5000 };

let polishMulti = true;

async function polishIdea(btn, force){
  const idea = (state.idea || '').trim();
  if(!idea){
    const kept = Array.isArray(state.polishOptions) && state.polishOptions.length;
    toast(kept ? '输入框为空：请先在上方输入构想，或点某张历史方案卡「✔ 采用此方案」，再点「✨ 优化构想」重新生成' : '请先输入故事构想');
    return;
  }
  const kept = Array.isArray(state.polishOptions) && state.polishOptions.length;
  if(kept && !force){
    if(!confirm(`已有 ${kept} 个保留方案，重新优化将覆盖它们。继续？`)) return;
  }
  const multi = polishMulti === true; // 只由“多方案”开关决定，不再因输入长度强制多方案
  state.polishMode = multi ? 'multi' : 'single';
  state.polishStatus = 'generating';
  state.polishSelectedId = null;
  state.polishAdopted = null;
  state.polishCanonical = null;
  state.canonicalStoryStrategy = null;
  state.strategicDimensions = [];
  state.originalIdeaAnchors = null;
  state.polishDiagnosis = null;
  state.polishStrategies = [];
  if(!canRunAI('idea')){ toast('优化构想暂不可运行'); return; }
  markAIRunning('idea');
  if(btn) busy(btn,true, multi ? '生成多方案构想中…' : '优化构想中…');
  try{
    const txt = await callAIGuarded('idea', { multi }, {temperature: resolveActiveSpec().ideaTemp, maxTokens: clampMaxTokens('polish')});
    const out = String(txt||'').trim();
    if(!out){ toast('优化失败，请重试'); return; }

    showPolishResult(out, multi);
    markAIDone('idea');
    toast('优化完成');
  }catch(e){
    addToFixQueue({kind:'idea', error:e.message});
    toast('优化失败：'+e.message);
  }
  finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='idea');
    if(btn) busy(btn,false);
  }
}

function formatIdeaBrief(b){
  return [
    `题材：${b.genre || ''}`,
    `主角：${b.protagonist || ''}`,
    `核心冲突：${b.coreConflict || ''}`,
    `世界观/规则：${b.worldOrRules || '无'}`,
    `对手/压力：${b.antagonistOrPressure || '无'}`,
    `动机：${b.motivation || ''}`,
    `风格：${b.style || ''}`,
    `读者体验：${b.readerExperience || ''}`
  ].join('\n');
}

function formatIdeaDiagnosis(d){
  if(!d || !Array.isArray(d.missing) || !d.missing.length) return '';
  const qs = (d.questions || []).map(q=>`<li>${esc(q)}</li>`).join('');
  return `<div class="pol-diag" style="margin-bottom:10px;padding:10px;background:var(--warn-bg, #fff8e6);border-radius:6px">
    <b>⚠️ 构想诊断：缺失 ${d.missing.length} 项</b>
    <ul style="margin:6px 0 0;padding-left:18px">${qs}</ul>
  </div>`;
}

function validatePolishOutput(j){
  if(!j || typeof j !== 'object') return '返回不是对象';
  if(!String(j.optimizedIdea||'').trim()) return '缺少 optimizedIdea';
  const b = j.navBeacon;
  if(!b || typeof b !== 'object') return '缺少 navBeacon';
  const required = ['genre','protagonist','coreConflict','tone'];
  for(const k of required) if(!String(b[k]||'').trim()) return `navBeacon 缺少 ${k}`;
  if(!Array.isArray(j.defects) || !j.defects.length) return '缺少缺陷清单 defects';
  if(!Array.isArray(j.optimizationStrategies)) return '缺少优化策略 optimizationStrategies';
  if(!Array.isArray(j.strategicDimensions)) return '缺少 strategicDimensions 动态战略维度';
  if(j.strategicDimensions.length < 6 || j.strategicDimensions.length > 10) return 'strategicDimensions 应为 6-10 个候选战略维度';
  if(!j.strategyFingerprint || typeof j.strategyFingerprint!=='object') return '缺少 strategyFingerprint 战略指纹';
  if(!j.originalAnchors || typeof j.originalAnchors!=='object') return '缺少 originalAnchors 原始构想核心锚点';
  if(j.diagnosis && typeof j.diagnosis !== 'object') return 'diagnosis 必须为对象';
  if(Array.isArray(j.seedCharacters)){
    for(const c of j.seedCharacters){
      const miss = CHAR_FIELDS.filter(k=> c[k]==null || String(c[k]).trim()==='');
      if(miss.length) return `人物 ${c.name||'?'} 缺少字段：${miss.join('/')}`;
    }
  }
  return '';
}

function splitPolishMultiText(out){
  const t = String(out||'').trim();
  if(!t) return [];
  const DECOR = /[━─—–＿_=＝*＊#＃~〜～\s-]/g;   // 常见装饰/分隔字符（含全半角与空白）
  const cards = [];
  let cur = null;
  t.split('\n').forEach(ln=>{
    const s = String(ln||'').trim();
    let isHead = false, name = '';
    if(s && s.length <= 40){
      const core = s.replace(DECOR, '');
      const m = core.match(/^方案([一二三四五六七八九十\d]{1,2})?(?:[：:、.．,，)）]|$)/);
      if(m){ isHead = true; name = core; }
    }
    if(isHead){
      if(cur) cards.push(cur);
      cur = { name, text: '' };
    } else if(cur){
      cur.text += (cur.text ? '\n' : '') + ln;
    }
  });
  if(cur) cards.push(cur);
  const ok = cards.filter(c=> String(c.text||'').trim());
  if(ok.length < 2) return [];
  return ok.map((c,i)=>({
    name: c.name || ('方案'+(i+1)),
    text: String(c.text||'').trim(),
    _v45: { defects:[], navBeacon:null, seedCharacters:[], seedPlaces:[] }
  }));
}

function currentCanonicalStoryStrategy(){
  const c=state.canonicalStoryStrategy;
  if(!c || c.machineTrace?.status!=='adopted') return null;
  return c;
}
// 兼容旧 UI/历史代码：仅用于优化构想界面自身，不作为下游 AI 数据源。
function adoptedPolishCanonical(){
  const c=state.polishCanonical;
  if(!c || c.machineTrace?.status!=='adopted') return null;
  return c;
}
function adoptedPolishHumanView(){
  const c=currentCanonicalStoryStrategy() || adoptedPolishCanonical();
  return c ? (c.humanView || c.creationBlueprint || {}) : null;
}
function invalidateAfterStoryStrategyChange(){
  // 新方案被采用后，旧大纲/学校链不能继续冒充新方案的下游结果。
  if(dictmasterLocked && dictmasterLocked()) return;
  state.outline = null;
  state.outlineConfirmed = false;
  state.canonicalStoryStrategy = state.canonicalStoryStrategy || null;
  state.aiNetwork = state.aiNetwork || {running:[],completed:[]};
  state.aiNetwork.completed = (state.aiNetwork.completed||[]).filter(k=>!['outline','titles','chapterPlan','chapter'].includes(k));
  if(state.school && typeof state.school==='object'){
    state.school.finished = {};
    state.school.failed = {};
    state.school.retries = {};
    state.school.stale = {};
    state.school.teachers = [];
  }
  state.dictmasterRan = false;
  state.dictmasterLatest = null;
  persist();
}
function canonicalStoryStrategyBlock(label='当前有效故事战略'){
  const c=currentCanonicalStoryStrategy();
  if(!c) return `【${label}】尚未建立。禁止从旧的 polishOptions/polishCanonical 推断新的故事战略。`;
  const h=c.humanView || c.creationBlueprint || {};
  const fp=c.strategyFingerprint || c.strategy || {};
  const dims = Array.isArray(c.strategicDimensions)?c.strategicDimensions:[];
  return `【${label}｜唯一权威来源】\n方案：${String(c.candidateName||'').trim()}\n战略指纹：${JSON.stringify(fp)}\n原始构想核心锚点：${JSON.stringify(c.originalAnchors||c.anchors||{})}\n动态战略维度：${JSON.stringify(dims)}\n完整创作蓝本：\n${String(h.optimizedIdea||'').trim()}\n小说简介：${String(h.novelSummary||'').trim()}\n全书节拍：\n${String(h.fullBookBeat||'').trim()}`;
}
function buildPolishCanonical(cand, revision){
  const c = cand || {};
  const v = c._v45 || {};
  const human = {
    bookTitle: String(c.bookTitle||'').trim(),
    novelSummary: String(c.novelSummary||c.storySummary||'').trim(),
    optimizedIdea: String(c.optimizedIdea||c.text||'').trim(),
    fullBookBeat: String(c.fullBookBeat||c.bookBeat||'').trim(),
    navBeacon: (c.navBeacon && typeof c.navBeacon==='object') ? JSON.parse(JSON.stringify(c.navBeacon)) : (v.navBeacon||null),
    creativeAdditions: String(c.creativeAdditions||'').trim()
  };
  return {
    sourceType:'optimization_concept',
    sourceVersion:'phase3',
    revision:Number(revision||0),
    candidateId:String(c._id||''),
    candidateName:String(c.name||''),
    adoptedAt:Date.now(),
    strategyFingerprint: JSON.parse(JSON.stringify(c.strategyFingerprint || c.strategicFingerprint || c.strategy || {
      mainStrategy:String(c.mainStrategy||'').trim(),
      secondaryStrategy:String(c.secondaryStrategy||'').trim(),
      coreConflict:String(c.coreConflict||'').trim(),
      storyEngine:String(c.storyEngine||'').trim(),
      emotionalPromise:String(c.emotionalPromise||'').trim(),
      pacing:String(c.pacing||'').trim()
    })),
    originalAnchors: JSON.parse(JSON.stringify(c.originalAnchors || c.coreAnchors || c.anchorPoints || state.originalIdeaAnchors || {})),
    strategicDimensions: Array.isArray(c.strategicDimensions) ? JSON.parse(JSON.stringify(c.strategicDimensions)) : (Array.isArray(v.optimizationStrategies)?JSON.parse(JSON.stringify(v.optimizationStrategies)):[]),
    humanView:human,
    creationBlueprint:{
      optimizedIdea:human.optimizedIdea,
      fullBookBeat:human.fullBookBeat,
      novelSummary:human.novelSummary,
      navBeacon:human.navBeacon,
      creativeAdditions:human.creativeAdditions
    },
    machineTrace:{
      diagnosis:c.diagnosis||v.diagnosis||null,
      optimizationStrategies:Array.isArray(c.optimizationStrategies)?JSON.parse(JSON.stringify(c.optimizationStrategies)):[],
      defects:Array.isArray(c.defects)?JSON.parse(JSON.stringify(c.defects)):[],
      aiSuggestions:Array.isArray(c.aiSuggestions)?JSON.parse(JSON.stringify(c.aiSuggestions)):
        ((Array.isArray(c.seedCharacters)||Array.isArray(c.seedPlaces)) ? {characters:c.seedCharacters||[],places:c.seedPlaces||[]} : []),
      status:'adopted'
    }
  };
}
function syncPolishMetaFromCandidate(c){
  const v=(c&&c._v45)||{};
  state.polishDiagnosis = (c&&c.diagnosis) || v.diagnosis || null;
  state.polishStrategies = Array.isArray(c&&c.optimizationStrategies) ? JSON.parse(JSON.stringify(c.optimizationStrategies)) : [];
  state.strategicDimensions = Array.isArray(c&&c.strategicDimensions) ? JSON.parse(JSON.stringify(c.strategicDimensions)) : state.strategicDimensions;
  state.originalIdeaAnchors = (c&&c.originalAnchors) ? JSON.parse(JSON.stringify(c.originalAnchors)) : state.originalIdeaAnchors;
}

function polishObjectFromAny(raw){
  // APP26: 统一“优化构想”响应入口。允许对象、JSON字符串、代码围栏JSON、旧版纯文本。
  if(raw && typeof raw === 'object') return raw;
  const text = String(raw||'').trim();
  if(!text) return {};
  try { return parseJson(text); } catch(e) {
    const fenced = text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
    if(fenced !== text){ try { return parseJson(fenced); } catch(_){} }
    return { optimizedIdea:text, text:text, _rawFallback:true };
  }
}
function normalizePolishCandidate(raw, index){
  let j = raw;
  if(typeof j === 'string') j = polishObjectFromAny(j);
  if(Array.isArray(j)) j = j[index||0] || {};
  if(!j || typeof j !== 'object') j = {};
  const nested = (j.candidate && typeof j.candidate==='object') ? j.candidate : j;
  const r = nested;
  const rawText = String(r.optimizedIdea||r.text||r.storyBlueprint||r.creationBlueprint?.optimizedIdea||'').trim();
  const summary = String(r.novelSummary||r.storySummary||r.summary||r.creationBlueprint?.novelSummary||'').trim();
  const beat = String(r.fullBookBeat||r.bookBeat||r.fullNovelBeat||r.creationBlueprint?.fullBookBeat||'').trim();
  let blueprint = rawText;
  if(!blueprint && (summary||beat)) blueprint=[summary,beat].filter(Boolean).join('\n\n');
  const title = String(r.bookTitle||r.title||extractCandidateBookName(rawText)||'').trim();
  return Object.assign({}, r, {
    name:String(r.name||r.optionName||('方案'+((index||0)+1))).trim(),
    bookTitle:title,
    novelSummary:summary,
    fullBookBeat:beat,
    optimizedIdea:blueprint,
    text:blueprint || String(r.rawText||'').trim()
  });
}
function parsePolishCandidatesFixed(raw, multi){
  const obj = polishObjectFromAny(raw);
  const rawText = String(raw||'').trim();
  let arr = [];
  if(Array.isArray(obj)) arr = obj;
  else if(Array.isArray(obj.options)) arr = obj.options;
  else if(Array.isArray(obj.candidates)) arr = obj.candidates;
  else if(obj.data && typeof obj.data==='object' && Array.isArray(obj.data.options)) arr=obj.data.options;
  else if(obj.result && typeof obj.result==='object' && Array.isArray(obj.result.options)) arr=obj.result.options;
  if(!multi){
    const one = arr.length ? arr[0] : (obj && typeof obj==='object' ? obj : {});
    const c = normalizePolishCandidate(one,0);
    if(!String(c.optimizedIdea||c.novelSummary||c.fullBookBeat||c.text).trim() && rawText) {
      c.optimizedIdea=rawText; c.text=rawText; c._rawFallback=true;
    }
    return [c];
  }
  if(arr.length){
    const out=arr.map((x,i)=>normalizePolishCandidate(x,i)).filter(c=>String(c.optimizedIdea||c.novelSummary||c.fullBookBeat||c.text).trim());
    if(out.length) return out;
  }
  // 兼容旧版“方案一/方案二”纯文本格式
  const segs=splitPolishMultiText(rawText);
  if(segs.length>=2) return segs.map((x,i)=>normalizePolishCandidate(x,i));
  // 最后安全兜底：不能让合法AI结果静默消失。
  if(rawText) return [normalizePolishCandidate({name:'方案1',optimizedIdea:rawText,text:rawText},0)];
  return [];
}
function polishDebugTrace(stage, raw, candidates, extra){
  try{
    if(typeof console==='undefined' || !console.debug) return;
    const text=String(raw||'');
    console.debug('[APP26][优化构想]', Object.assign({stage,rawLength:text.length,candidateCount:Array.isArray(candidates)?candidates.length:0}, extra||{}));
  }catch(_){ }
}
function showPolishResult(out, multi){
  const box=$('#polishBox'), cards=$('#polishCards');
  const rawText=String(out||'').trim();
  state.polishRawFallback = rawText;
  if(!rawText){ toast('优化失败：AI没有返回内容'); return; }
  const opts=parsePolishCandidatesFixed(out, !!multi);
  polishDebugTrace('parsed', out, opts, {multi:!!multi, firstKeys:opts[0]?Object.keys(opts[0]).slice(0,20):[]});
  if(!opts.length){
    state.polishOptions=[normalizePolishCandidate({name:'方案1',optimizedIdea:rawText,text:rawText},0)];
  }else{
    state.polishOptions=opts;
  }
  const pickV45=(o)=>({
    defects:Array.isArray(o?.defects)?o.defects:[],
    navBeacon:(o?.navBeacon&&typeof o.navBeacon==='object')?o.navBeacon:null,
    seedCharacters:Array.isArray(o?.seedCharacters)?o.seedCharacters:[],
    seedPlaces:Array.isArray(o?.seedPlaces)?o.seedPlaces:[],
    diagnosis:(o?.diagnosis&&typeof o.diagnosis==='object')?o.diagnosis:null,
    optimizationStrategies:Array.isArray(o?.optimizationStrategies)?o.optimizationStrategies:[],
    strategicDimensions:Array.isArray(o?.strategicDimensions)?o.strategicDimensions:[],
    strategyFingerprint:(o?.strategyFingerprint&&typeof o.strategyFingerprint==='object')?o.strategyFingerprint:null,
    originalAnchors:(o?.originalAnchors&&typeof o.originalAnchors==='object')?o.originalAnchors:null
  });
  state.polishOptions=state.polishOptions.map((o,i)=>Object.assign({},o,{
    _id:String(o._id||('polish-'+Date.now()+'-'+i)),
    name:String(o.name||('方案'+(i+1))),
    text:String(o.text||o.optimizedIdea||o.novelSummary||o.fullBookBeat||rawText).trim(),
    _v45:pickV45(o)
  }));
  // 第三阶段：把战略地图与原始锚点提升为项目级中间产物，供采用方案和下游链路继承。
  const _dims=[]; const _seen=new Set();
  state.polishOptions.forEach(o=>{ const ds=Array.isArray(o.strategicDimensions)?o.strategicDimensions:((o._v45&&o._v45.strategicDimensions)||[]); ds.forEach(d=>{ const key=String(d?.name||d?.title||d?.id||d||'').trim().toLowerCase(); if(key&&!_seen.has(key)){_seen.add(key); _dims.push(d);} }); });
  state.strategicDimensions=_dims.slice(0,10);
  const _anchorSrc=state.polishOptions.find(o=>o.originalAnchors)||state.polishOptions[0];
  state.originalIdeaAnchors=(_anchorSrc&&_anchorSrc.originalAnchors)||(_anchorSrc?(_anchorSrc._v45&&_anchorSrc._v45.originalAnchors):null)||null;
  snapshotPolishBatch('重新优化前');
  state.polishSelectedId = state.polishMode==='multi' ? null : state.polishOptions[0]._id;
  state.polishAdopted = state.polishMode==='multi' ? null : (state.polishOptions[0].name||'方案1');
  state.polishStatus = state.polishMode==='multi' ? 'waiting_selection' : 'adopted';
  state.polishRevision = Number(state.polishRevision||0) + 1;
  if(state.polishMode!=='multi'){
    syncPolishMetaFromCandidate(state.polishOptions[0]);
    state.polishCanonical=buildPolishCanonical(state.polishOptions[0],state.polishRevision);
    state.canonicalStoryStrategy=Object.assign({}, state.polishCanonical, { sourceType:'canonical_story_strategy', sourceVersion:'phase3', machineTrace:Object.assign({}, state.polishCanonical.machineTrace||{}, {status:'adopted'}) });
    invalidateAfterStoryStrategyChange();
  }else{
    state.polishCanonical=null;
    state.canonicalStoryStrategy=null;
    state.polishDiagnosis=null;
    state.polishStrategies=[];
  }
  persist();
  if(box && cards){ box.style.display='block'; render(); openPolishBox(); }
  else { persist(); }
}

function applyV45ToOutline(o, d){
  // 【权限隔离】优化构想阶段不得写入正式 glossary。
  // 兼容旧调用点：只把建议保存到“待确认建议”容器，不改变任何正式词典事实。
  if(!d || typeof d!=='object') return { nC:0, nP:0 };
  const suggestions = {
    navBeacon: (d.navBeacon && typeof d.navBeacon==='object') ? JSON.parse(JSON.stringify(d.navBeacon)) : null,
    characters: Array.isArray(d.seedCharacters) ? JSON.parse(JSON.stringify(d.seedCharacters)) : [],
    places: Array.isArray(d.seedPlaces) ? JSON.parse(JSON.stringify(d.seedPlaces)) : [],
    source: 'optimization_concept',
    status: 'pending_confirmation',
    createdAt: Date.now()
  };
  state.polishPendingSuggestions = suggestions;
  return { nC:suggestions.characters.length, nP:suggestions.places.length };
}

function importPolishToState(o){
  const d = (o && o._v45) || {};
  const tone = String((d.navBeacon&&d.navBeacon.tone)||'');
  const toneHit = tone || '';
  const hasSuggestions = !!(d.navBeacon || (Array.isArray(d.seedCharacters)&&d.seedCharacters.length) || (Array.isArray(d.seedPlaces)&&d.seedPlaces.length));
  // 优化构想只能暂存“待确认建议”；正式词典第一次建立仍由词典达人负责。
  if(hasSuggestions){
    applyV45ToOutline(null, d);
  }
  persist(); render();
  toast(`已暂存为优化构想待确认创意：导航灯塔${d.navBeacon?1:0} · 种子人物 ${d.seedCharacters?.length||0} · 种子地点 ${d.seedPlaces?.length||0}。不会写入正式词典，后续由词典达人重新判断。${toneHit?' 优化构想语气仅作建议，不覆盖用户写作风格。':''}`);
}

function openPolishBox(){
  const box = $('#polishBox'), cards = $('#polishCards');
  if(!box || !cards) return;
  state.polishCollapsed = false;
  persist();
  box.style.display = 'block';
  renderPolishCards(cards);
}

function polishIdle(){
  const o = state.outline;
  const hasRealOutline = !!o && (String(o.title||'').trim() || String(o.logline||'').trim() || (Array.isArray(o.chapters)&&o.chapters.length));
  return !hasRealOutline;
}
const POLISH_PALETTE = ['#E8A33D','#D64545','#4C6FD5','#3FA36B','#8E5AC8','#2CA6A4'];
function extractPolishTitle(text){
  const ln = String(text||'').split('\n').map(s=>s.trim()).find(s=>/^书名\s*[：:]\s*\S/.test(s));
  if(!ln) return '';
  return String(ln.replace(/^书名\s*[：:]\s*/, '')).trim();
}
function renderPolishCards(container){
  if(!container) return;
  const opts = Array.isArray(state.polishOptions) ? state.polishOptions : [];
  if(!opts.length){
    container.style.display = 'block';
    container.innerHTML = state.polishRawFallback ? `<div class="pol-cand-body" style="white-space:pre-wrap">${esc(state.polishRawFallback)}</div>` : `<p class="muted" style="margin:8px 0 0">👆 点「✨ 优化构想」生成候选方案。</p>`;
    return;
  }
  container.style.display = 'block';
  const dims = Array.isArray(state.strategicDimensions) ? state.strategicDimensions : [];
  const dimHtml = dims.length ? `<div class="strategy-map" style="margin-bottom:12px;padding:12px;border:1px solid var(--line,#ddd);border-radius:10px;background:var(--card,#fff)"><div style="font-weight:700;margin-bottom:8px">🧭 AI动态战略地图 <span style="font-size:11px;font-weight:400;color:var(--muted)">${dims.length} 个候选维度</span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:7px">${dims.map((d,i)=>{const n=String(d?.name||d?.title||d?.id||'战略维度'+(i+1));const de=String(d?.description||'');const why=String(d?.whyFit||'');return `<div style="padding:8px;border:1px solid var(--line,#ddd);border-radius:8px"><b>${esc(n)}</b><div style="font-size:12px;margin-top:4px;line-height:1.5">${esc(de)}</div>${why?`<div style="font-size:11px;color:var(--muted);margin-top:4px">契合：${esc(why)}</div>`:''}</div>`}).join('')}</div><div style="margin-top:8px;font-size:11px;color:var(--muted)">以上是AI针对当前故事动态生成的战略地图，不是固定模板。下面的3～5个方案会从这些维度组合生成。</div></div>` : '';
  const adopted = state.polishAdopted;
  container.innerHTML = dimHtml + opts.map((o,i)=>{
    const c = POLISH_PALETTE[i % POLISH_PALETTE.length];
    const name = o.name || ('方案'+(i+1));
    const isAdopted = !!adopted && adopted === name;
    const defects = (o._v45 && Array.isArray(o._v45.defects)) ? o._v45.defects.filter(d=>String(d||'').trim()) : [];
    const hasV45 = !!(o._v45 && (o._v45.navBeacon || (o._v45.seedCharacters&&o._v45.seedCharacters.length) || (o._v45.seedPlaces&&o._v45.seedPlaces.length)));
    const displaySource = String(o.text||o.optimizedIdea||o.novelSummary||o.fullBookBeat||'').trim();
    const pTitle = String(o.bookTitle||'').trim() || extractPolishTitle(displaySource);
    const pBody = displaySource.replace(/^\s*书名\s*[：:][^\n]*\n?/, '').trim();   // 书名已置顶，正文去掉首行以免重复
    return `<div class="pol-cand${isAdopted?' on':''}" style="--pc:${c}" data-idx="${i}">
      <div class="pol-cand-head">
        <span class="pol-no" style="background:${c}">${i+1}</span>
        <b class="pol-name" style="color:${c}">${esc(name)}</b>
        ${isAdopted?'<span class="pol-adopted-tag">✔ 已采用</span>':''}
        <span class="pol-cand-actions">
          <button type="button" class="btn small ghost" data-pol-copy="${i}" title="复制此方案">📋 复制</button>
        </span>
      </div>
      ${pTitle?`<div class="pol-cand-title" style="background:${c}">📖 ${esc(pTitle)}</div>`:''}
      <div class="pol-cand-body">${esc(pBody ? pBody : String(o.text||''))}</div>
      ${String(o.novelSummary||'').trim()?`<div class="pol-cand-body" style="border-top:1px dashed var(--line,#ddd)"><b>📖 小说简介（下游创作材料）</b><br>${esc(String(o.novelSummary).trim())}</div>`:''}
      ${String(o.fullBookBeat||o.bookBeat||'').trim()?`<div class="pol-cand-body" style="border-top:1px dashed var(--line,#ddd)"><b>🎬 全书故事节拍</b><br>${esc(String(o.fullBookBeat||o.bookBeat).trim())}</div>`:''}
      ${defects.length?`<div class="pol-cand-body" style="opacity:.85"><b>⚠️ 构想缺陷清单：</b><br>${defects.map(d=>'· '+esc(String(d))).join('<br>')}</div>`:''}
      <div class="pol-cand-foot">
        ${hasV45?`<button type="button" class="btn small ghost" data-pol-import="${i}" title="导入结构化设定（导航灯塔/种子人物/种子地点/建议章节数）">📥 导入设定</button>`:''}
        <button type="button" class="btn small pt-accent" data-pol-use="${i}" style="background:${c}">✔ 采用此方案</button>
      </div>
    </div>`;
  }).join('');
  container.querySelectorAll('[data-pol-use]').forEach(b=>{
    b.onclick = (e)=>{ e.preventDefault();
      const o = (state.polishOptions||[])[+b.dataset.polUse]; if(!o) return;
      if(dictmasterLocked()){ toast('词典达人已产出万物词典，②方案已锁定，不可更换'); return; }
      state.polishAdopted = o.name || null;
      state.polishSelectedId = o._id || null;
      state.polishStatus = 'adopted';
      state.polishRevision = Number(state.polishRevision||0) + 1;
      syncPolishMetaFromCandidate(o);
      state.polishCanonical = buildPolishCanonical(o, state.polishRevision);
      state.canonicalStoryStrategy = Object.assign({}, state.polishCanonical, { sourceType:'canonical_story_strategy', sourceVersion:'phase3', machineTrace:Object.assign({}, state.polishCanonical.machineTrace||{}, {status:'adopted'}) });
      invalidateAfterStoryStrategyChange();
      persist(); render();
      toast('已选中：'+(o.name||('方案'+(+b.dataset.polUse+1)))+'（不覆盖原始构想；可点「生成大纲」搬入书名/简介/全书节拍）');
    };
  });
  container.querySelectorAll('[data-pol-import]').forEach(b=>{
    b.onclick = (e)=>{ e.preventDefault();
      const o = (state.polishOptions||[])[+b.dataset.polImport]; if(!o) return;
      importPolishToState(o);
    };
  });
  container.querySelectorAll('[data-pol-copy]').forEach(b=>{
    b.onclick = (e)=>{ e.preventDefault();
      const o = (state.polishOptions||[])[+b.dataset.polCopy]; if(!o) return;
      copyText(o.text||'');
    };
  });
}

function bindPolishIdea(){
  const b = $('#btnPolishIdea');
  if(b) b.onclick = ()=> polishIdea(b);
  const chk = $('#chkPolishMulti');
  if(chk){
    const sync = ()=>{
      chk.checked = polishMulti === true;
      chk.disabled = false;
    };
    sync();
    chk.onchange = ()=>{ polishMulti = !!chk.checked; state.polishMode = polishMulti?'multi':'single'; if(Array.isArray(state.polishOptions)&&state.polishOptions.length){ state.polishStatus='empty'; state.polishSelectedId=null; state.polishAdopted=null; state.polishCanonical=null; state.canonicalStoryStrategy=null; state.polishDiagnosis=null; state.polishStrategies=[]; } persist(); render(); };
    const idea = $('#ideaInput');
    if(idea) idea.oninput = ()=>{ state.idea = idea.value; sync(); syncOrigIdeaCard(); };
  }
  const disc = $('#btnPolishDiscard');
  if(disc) disc.onclick = ()=>{
    const box = $('#polishBox');
    if(box) box.style.display = 'none';
  };
  const hist = $('[data-pol-keep-hist]');
  if(hist) hist.onclick = (e)=>{ e.stopPropagation(); openPolishBatchPanel(); };
  const view = $('[data-pol-keep-view]');
  if(view) view.onclick = (e)=>{ e.stopPropagation(); openPolishBox(); };
  const again = $('[data-pol-keep-again]');
  if(again) again.onclick = (e)=>{ e.stopPropagation(); polishIdea($('#btnPolishIdea'), true); };
  const clear = $('[data-pol-keep-clear]');
  if(clear) clear.onclick = (e)=>{
    e.stopPropagation();
    if(!confirm('清除全部保留方案？')) return;
    snapshotPolishBatch('清除前');   // 归档当前批，之后仍可在「优化版本」找回
    delete state.polishOptions;
    delete state.polishAdopted;
    state.polishSelectedId = null;
    state.polishStatus = 'empty';
    persist(); render();
    toast('已清除保留方案');
  };
}
function polishKeepBar(){
  const opts = Array.isArray(state.polishOptions) ? state.polishOptions : [];
  if(!opts.length) return '';
  const cur = state.polishAdopted || (state.polishMode==='multi' ? '尚未选择' : (opts[0].name || '方案1'));
  return `<div class="pol-keep">
    <span class="pol-keep-t">已保留 ${opts.length} 个优化方案（当前采用：${esc(cur)}）</span>
    <span class="pol-keep-btns">
      ${(state.polishHistory&&state.polishHistory.length)?`<button type="button" class="btn small ghost" data-pol-keep-hist>📚 优化版本(${state.polishHistory.length}/50)</button>`:''}
      <button type="button" class="btn small ghost" data-pol-keep-view>🔍 查看全部</button>
      <button type="button" class="btn small ghost" data-pol-keep-again>✨ 重新优化</button>
      <button type="button" class="btn small ghost" data-pol-keep-clear>✕ 清除</button>
    </span>
  </div>`;
}

function polishHistory(){ return Array.isArray(state.polishHistory) ? state.polishHistory : []; }
function snapshotPolishBatch(label){
  const opts = Array.isArray(state.polishOptions) ? state.polishOptions : [];
  if(!opts.length) return;
  const snap = { options: opts.map(o=>({
    name:o.name, text:String(o.text||''), bookTitle:String(o.bookTitle||''),
    novelSummary:String(o.novelSummary||''), fullBookBeat:String(o.fullBookBeat||o.bookBeat||''),
    optimizedIdea:String(o.optimizedIdea||''), creativeAdditions:String(o.creativeAdditions||'')
  })), adopted: state.polishAdopted||null };
  const hist = state.polishHistory = state.polishHistory || [];
  if(hist.length &&
      JSON.stringify(hist[0].options) === JSON.stringify(snap.options) &&
      hist[0].adopted === snap.adopted) return;
  hist.unshift({ ts: Date.now(), label: label||'快照', options: snap.options, adopted: snap.adopted });
  if(hist.length > 50) hist.length = 50;
  persist();
}
function applyPolishBatch(idx){
  const hist = polishHistory(); const b = hist[idx]; if(!b || !Array.isArray(b.options) || !b.options.length) return;
  if(!confirm(`整批应用「${idx+1}. ${b.label||'优化版本'}」（共 ${b.options.length} 个方案）？将覆盖当前保留的方案。`)) return;
  snapshotPolishBatch('切换前');
  state.polishOptions = b.options.map((o,i)=>({
    ...o, _id:String(o._id || ('polish-'+Date.now()+'-'+i)), name:o.name, text:String(o.text||o.optimizedIdea||''),
    bookTitle:String(o.bookTitle||''), novelSummary:String(o.novelSummary||''),
    fullBookBeat:String(o.fullBookBeat||o.bookBeat||''), optimizedIdea:String(o.optimizedIdea||o.text||''),
    creativeAdditions:String(o.creativeAdditions||'')
  }));
  state.polishAdopted = (b.adopted && b.options.some(o=>o.name===b.adopted)) ? b.adopted : null;
  state.polishSelectedId = state.polishAdopted ? (state.polishOptions.find(o=>o.name===state.polishAdopted)?._id || null) : null;
  state.polishMode = state.polishOptions.length>1 ? 'multi' : 'single';
  state.polishStatus = state.polishAdopted ? 'adopted' : (state.polishOptions.length>1 ? 'waiting_selection' : 'ready_single');
  if(state.polishAdopted){ const _hit=state.polishOptions.find(o=>o.name===state.polishAdopted); if(_hit){ state.polishRevision=Number(state.polishRevision||0)+1; state.polishCanonical=buildPolishCanonical(_hit,state.polishRevision); state.canonicalStoryStrategy=Object.assign({}, state.polishCanonical,{sourceType:'canonical_story_strategy',sourceVersion:'phase3'}); } }
  persist(); closePolishBatchPanel(); render();
  const box = $('#polishBox'); if(box){ box.style.display='block'; openPolishBox(); }
  toast(`已整批应用该优化版本（${state.polishOptions.length} 个方案）`);
}
function deletePolishBatch(idx){
  const hist = polishHistory(); if(!hist.length) return;
  hist.splice(idx,1);
  if(!hist.length) delete state.polishHistory; else state.polishHistory = hist;
  persist(); closePolishBatchPanel(); openPolishBatchPanel();
  toast('已删除该版本');
}
function openPolishBatchPanel(){
  closePolishBatchPanel();
  const hist = polishHistory(); if(!hist.length){ toast('暂无历史优化版本，运行「✨ 优化构想」后自动记录'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const rows = hist.map((b,idx)=>`
    <div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0">
        <div class="cv-time">${idx+1}. ${esc(b.label||'优化版本')} · ${fmtTs(b.ts)} · ${(b.options||[]).length} 方案</div>
        <div class="cv-t" style="font-size:12px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((b.options||[]).slice(0,3).map(o=>o.name).join(' / '))||'（空）'}</div>
      </div>
      <div class="cv-actions" style="display:flex;gap:6px;flex-shrink:0">
        <button type="button" class="btn ghost cv-b" data-polb-view="${idx}">👁 切换</button>
        <button type="button" class="btn primary cv-b" data-polb-apply="${idx}">应用</button>
        <button type="button" class="btn ghost cv-b" data-polb-del="${idx}">🗑</button>
      </div>
    </div>`).join('');
  const ov = document.createElement('div'); ov.id='polbPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>💾 优化构想 · 批量版本（${hist.length}/50）</b>
        <button class="gs-x" data-polb-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-div">每次优化自动归档快照，支持预览与回退。</div>
        ${rows}
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-polb-close]').onclick = closePolishBatchPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closePolishBatchPanel(); });
  ov.querySelectorAll('[data-polb-view]').forEach(b=> b.onclick = ()=> openPolishBatchPreview(+b.dataset.polbView));
  ov.querySelectorAll('[data-polb-apply]').forEach(b=> b.onclick = ()=> applyPolishBatch(+b.dataset.polbApply));
  ov.querySelectorAll('[data-polb-del]').forEach(b=> b.onclick = ()=> deletePolishBatch(+b.dataset.polbDel));
}
function closePolishBatchPanel(){ const p=$('#polbPanel'); if(p) p.remove(); }
function openPolishBatchPreview(idx){
  closePolishBatchPreview();
  const hist = polishHistory(); const b = hist[idx]; if(!b) return;
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const list = (b.options||[]).map(o=>`<div class="cv-row"><div class="cv-t" style="font-size:12px"><b>${esc(o.name||'')}</b><br>${esc(String(o.text||'').slice(0,120))}${(o.text||'').length>120?'…':''}</div></div>`).join('') || '<p class="muted">（空批）</p>';
  const ov = document.createElement('div'); ov.id='polbPreview'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>👁 优化版本切换 · ${esc(b.label||'优化版本')}（${fmtTs(b.ts)} · ${(b.options||[]).length} 方案）</b>
        <button class="gs-x" data-polbp-close>✕</button></div>
      <div class="cv-body"><div style="max-height:60vh;overflow:auto">${list}</div></div>
      <div class="modal-actions" style="padding:12px 16px;border-top:1px solid var(--line)">
        <button type="button" class="btn ghost cv-b" data-polbp-close2>取消</button>
        <button type="button" class="btn primary cv-b" data-polbp-apply>✔ 应用此版本</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-polbp-close]').onclick = closePolishBatchPreview;
  ov.querySelector('[data-polbp-close2]').onclick = closePolishBatchPreview;
  ov.addEventListener('click', e=>{ if(e.target===ov) closePolishBatchPreview(); });
  ov.querySelector('[data-polbp-apply]').onclick = ()=> applyPolishBatch(idx);
}
function closePolishBatchPreview(){ const p=$('#polbPreview'); if(p) p.remove(); }







const WRITE_STYLES = [
  { id:'wenyi',  group:'element', cat:'语言质感', name:'文艺/范儿',
    note:'意象化、通感、抒情长句、留白，重氛围轻情节（如张嘉佳、琼瑶式）。',
    tips:['多用意象化与通感修辞','抒情长句铺陈心境，节奏舒缓','点到为止，留白让余味生长'],
    avoid:['情节推进过急','直白说破情绪'],
    check:['氛围优先于情节','有 1-2 处可回味的句子'],
    demo:'散场后影厅的灯一瞬亮起，红绒座椅一排排空下去，像退潮的海。他坐在最后一排，等字幕走完，才把攥了一整场的手，慢慢松开。' },
  { id:'ornate', group:'element', cat:'语言质感', name:'华丽辞藻',
    note:'排比、对仗、四字词、浓墨重彩的画面铺陈。',
    tips:['多用排比、对仗、通感','用四字词与色彩意象铺陈','句子密度与节奏感并重'],
    avoid:['华丽但空洞（只有形容词没有实义）','堆砌到影响阅读'],
    check:['至少 2 处排比/对仗','辞藻服务于画面与情绪'],
    demo:'暮色像一匹被揉皱的绸缎，摊在山脊上，流光一寸寸洇开。' },
  { id:'minimal',group:'element', cat:'语言质感', name:'极简/冷峻',
    note:'短句、白描、不抒情，靠动作和留白传达（海明威式）。',
    tips:['短句、白描、删冗余','情绪用动作与环境暗示','把余味留给读者'],
    avoid:['直白喊出情绪','大段心理独白'],
    check:['情绪段落少于直接描写','无直白情绪标签'],
    demo:'他把刀擦干净，放回架子上。窗外雨没停。' },
  { id:'poetic', group:'element', cat:'语言质感', name:'诗化散文化',
    note:'段落像写诗，长短句错落，节奏淡雅。',
    tips:['段落如诗分行，长短句错落','用淡雅意象营造氛围','节奏舒缓、留白多'],
    avoid:['通篇无叙事推进','堆砌意象失去中心'],
    check:['文字有诗性','节奏淡雅不拖沓'],
    demo:'晨雾里，早班的船离了岸。橹声一下，一下，像在江面上，把昨夜的话一句句抹平。岸上有人立了很久，直到雾把船和人一起收走。' },
  { id:'euro',   group:'element', cat:'语言质感', name:'翻译腔/欧美范',
    note:'长定语从句、欧式标点、西式叙述节奏。',
    tips:['长定语从句与倒装','欧式破折号、分号连接','西式冷静的叙述距离感'],
    avoid:['生硬到读不通','堆砌从句失去节奏'],
    check:['有西式笔调','可读性不牺牲'],
    demo:'她把那份写了很久、又反复修改、最终也没能寄出去的告别信，连同那枚旧贝壳，一起锁进那口棕色的、她从童年起就没再打开过的箱子。' },
  { id:'classic',group:'element', cat:'语言质感', name:'古风文言',
    note:'文言字句、古韵气息，骈散兼用，含蓄蕴藉。',
    tips:['以凝练文言与四六骈句铺陈','动词古雅（顾、掷、敛、挑灯）','对话带古白话韵味，不全程掉书袋'],
    avoid:['生僻掉书袋','古腔盖过剧情可读性'],
    check:['读来有古意不晦涩','用词贴合人物身份'],
    demo:'孤鸿声里，城门缓缓阖上。他负手立于城楼，望那盏渐远的灯，终究没说一句留字。' },
  { id:'folktale',group:'element',cat:'语言质感', name:'市井评书腔',
    note:'说书人腔、话本俚俗、烟火锅气，热闹有人味。',
    tips:['以说书人视角交代，带"话说""且听"的烟火话茬','俚语俗谚与市井行话点人点事','节奏热络、听感活泛'],
    avoid:['盲目复古腔调失真','俚俗过度显油滑'],
    check:['读来像听故事','市井气服务于人物环境'],
    demo:'那王二麻子，是方圆十里出了名的抠门主儿——上他家讨口水喝，都得听他把水瓢掂量三回。' },
  { id:'epic',group:'element', cat:'语言质感', name:'史诗庄重',
    note:'沉着宏阔、碑文式质感，字句有时间的重量。',
    tips:['铺陈用宏大意象（山河、长夜、星海）','句式沉稳、节奏凝重','关键处用克制笔法写大事件'],
    avoid:['空洞的大词堆砌','沉重到拖沓'],
    check:['有厚重史诗感','宏阔处仍有具体细节穿透'],
    demo:'星海横贯头顶，是他的国；脚下冻土延展，也是他的国。一将功成，不过是这漫漫长夜里，那些无名者共用的名字。' },
  { id:'airy',group:'element', cat:'语言质感', name:'轻盈灵动',
    note:'明快清新、短句跳跃、俏皮生趣，读来轻快。',
    tips:['短句快行、节奏轻快','比喻清新俏皮、有少年气','对话灵动带小机锋'],
    avoid:['轻飘无实义','俏皮过度发腻'],
    check:['读来轻快不觉累','明快中不失真情'],
    demo:'她把作业本往桌上一拍，像只炸了毛的小猫，眉毛竖得能挂三斤酱油。' },
  { id:'cutting',group:'element', cat:'语言质感', name:'锋利冷冽',
    note:'犀利讽刺、刀刃句式、冷静不留情面。',
    tips:['短句见锋，一句切中要害','冷静语气说狠话，反差更利','讽刺藏在客观陈述里'],
    avoid:['泼妇式叫骂','为毒而毒失分寸'],
    check:['不语带脏字也伤人','锋芒服务于立场交锋'],
    demo:'他的道歉和他的承诺一样廉价——都只够说出口，不够兑现。' },
  { id:'suspense2',group:'element',cat:'情绪与张力', name:'悬疑压抑',
    note:'名词化、阴冷意象、制造不安感的用词。',
    tips:['制造信息差（读者知道得比角色少或多）','句尾留悬念钩子','环境意象偏暗、紧绷'],
    avoid:['提前泄底','为悬疑而故弄玄虚（逻辑不通）'],
    check:['段落间有悬念牵引','悬念符合逻辑、可回收'],
    demo:'他每天下班都路过那家窗贴磨旧、却从不见人进出的花店。今晚他忍不住推门——门没锁，柜台后的墙上挂着一排照片，每一张，都拍的是他。' },
  { id:'sweet',  group:'element', cat:'情绪与张力', name:'甜宠/温柔',
    note:'细腻心理、绵软对话、小动作描写。',
    tips:['多写微小动作与眼神','对话温和、有生活气','细节传递温度'],
    avoid:['刻意煽情','甜腻到失真'],
    check:['有生活细节体现温度','情感自然不煽情'],
    demo:'她随口说想吃那家老店的糖炒栗子。他没答话，第二天下班拎了一袋回来，隔着纸袋还是热的——袋上，他认认真真写了"趁热"两个字。' },
  { id:'heartwarm',group:'element',cat:'情绪与张力', name:'虐心催泪',
    note:'情感落差、写泪点、克制中爆发。',
    tips:['铺垫情感、制造落差','写泪点时克制不喊叫','在高点克制收束'],
    avoid:['全程强行煽情','情绪喊口号化'],
    check:['有清晰情感高点','泪点自然、铺垫足够'],
    demo:'奶奶把存折交给他，说密码是他的生日。他翻到最后一页才看清存款时间——整整三十年前，正是他出生的那年。那笔钱，她替他攒了一辈子。' },
  { id:'flame',  group:'element', cat:'情绪与张力', name:'热血燃动',
    note:'情绪爆发＋动作节奏带出「燃」，靠张力推进不靠血腥。',
    tips:['动作链密集、节奏如鼓点','短促有力的句式让语气一路走高','以意志力、逆袭转折点燃情绪，不依赖血腥'],
    avoid:['血腥暴力与感官刺激堆砌','喊口号式的假燃','靠场面硬撑而无人物情绪'],
    check:['有清晰的情绪沸点','热血但不越界','燃来自人物选择而非血腥'],
    demo:'一剑破空，少年不退反进，眼底燃起整座江湖的灯。' },
  { id:'zhanshi', group:'element', cat:'情绪与张力', name:'写实战争纪实',
    note:'写实战场实感、群像牺牲、冷峻不煽情的纪实悲壮。',
    tips:['战地细节写实、炮火烟尘与噪声具体','群像式牺牲、点到为止不渲染','冷峻克制、用个别镜头折射整体'],
    avoid:['英雄化、个人光环凌驾群像','血腥刺激堆砌','煽情喊口号'],
    check:['有战场实感与氛围','牺牲有分量不廉价','冷静呼吸、不靠煽动'],
    demo:'担架从泥泞里抬过去，谁也没停。枪声一响，他们又都趴回了开阔地。' },
  { id:'terror', group:'element', cat:'情绪与张力', name:'惊悚寒气',
    note:'具象的感官恐惧、细思极恐、寒意入骨。',
    tips:['用触感/听觉营造阴冷（汗毛、脚步声、指甲刮过）','未知比具象更毒，先露一角','恐怖藏在日常细节里'],
    avoid:['血腥猎奇堆砌','一惊一乍而无逻辑'],
    check:['读完后背发凉','恐怖有来源可解释'],
    demo:'他数完最后一级台阶，楼道灯忽然熄灭。黑暗里，有什么正跟着他的步子——他停，那声音也停；他走，那声音贴在他身后，也走。' },
  { id:'warmth', group:'element', cat:'情绪与张力', name:'温情治愈',
    note:'亲情友情的平淡暖意，柴米油盐里的光。',
    tips:['细写照顾、牵挂、笨拙的表达','暖藏在克制与日常里，不喊口号','一个细节点亮一个场景'],
    avoid:['强行煽情','甜腻到失真'],
    check:['读来心里发烫','暖点有生活依据'],
    demo:'她加班到深夜，桌角放着一碗还冒热气的面，碗边压着张纸：趁热吃。她抬头，对面那位总说"你天天不落屋"的保洁阿姨，正假装在擦她早该擦完的那块玻璃。' },
  { id:'standoff', group:'element', cat:'情绪与张力', name:'对峙张力',
    note:'两方角力、一触即发、空气凝住的压迫。',
    tips:['从动作/物件写紧绷（手按枪柄、茶水渐凉）','对话句句试探、句句留尾','用细节的"没发生"代替爆发'],
    avoid:['一上来就摊牌','张力被废话稀释'],
    check:['全程心悬着','对峙有翻盘可能'],
    demo:'他与她隔桌对坐，谁也没碰那盏茶。窗外蝉鸣陡然一停，空气像被抽干——他咽了口唾沫，那一声响，在寂静里放大如雷。' },
  { id:'melancholy', group:'element', cat:'情绪与张力', name:'苍凉悲怆',
    note:'苍茫宿命、万物有时，厚重的悲怆余味。',
    tips:['用时间与物候的流逝写无力（残碑、西风、老树）','悲在点到为止，不泣不成声','以"无归"收束，留下苍凉'],
    avoid:['滥情哀嚎','为悲而悲脱离事件'],
    check:['悲怆有重量感','克制中透出宿命感'],
    demo:'他蹲在旧碑前，指腹一点点抚过那些名字。风过，草伏下去又立起来，像是替他一排排地，给每个名字鞠了一躬。' },
  { id:'thrill', group:'element', cat:'情绪与张力', name:'惊心动魄',
    note:'千钧一发的生死瞬间、大事件高峰的震动。',
    tips:['倒计时式紧迫（再零点几秒就…）','用瞬间抉择压缩张力','高潮后留一帧静默回响'],
    avoid:['全程紧崩到麻木','为震撼而失真'],
    check:['读时屏住呼吸','高潮有回响'],
    demo:'他按下的不是按钮，是整座城的命。警报倒数最后一声时，他闭上了眼——然后睁开的，是响起的钟声。' },
  { id:'fast',   group:'element', cat:'节奏与网感', name:'爽文/快节奏',
    note:'短段落、强动作链、钩子密集、打脸反转。',
    tips:['短段落、信息密度高','动作链推进、钩子密集','打脸反转干脆'],
    avoid:['长句拖慢节奏','仅爽无逻辑'],
    check:['平均句长偏短','节奏有快慢变化'],
    demo:'评委按下淘汰键。他反手把U盘插进主机。全场以为他在作死——三分钟后大屏弹出那段从未公映的预告片，满座哗然：他才是那部片的原作者。' },
  { id:'webman', group:'element', cat:'节奏与网感', name:'网文口语化',
    note:'"咱""咋""整点"这类方言口语、接地气。',
    tips:['用接地气口语','短句、像说话','贴近生活原声'],
    avoid:['文绉绉书面语','生硬翻译腔'],
    check:['读起来像听人说话','口语自然不违和'],
    demo:'老板娘扯着嗓子喊："小师傅，麻辣烫要辣不？"他头也不抬："辣！整大份，莫放香菜，多整两勺油辣子！"' },
  { id:'roast',  group:'element', cat:'节奏与网感', name:'逗趣吐槽',
    note:'吐槽回环、毒舌、冷幽默（偏"解说式吐槽"）。',
    tips:['冷幽默旁观者视角','一本正经说反话的拆台式吐槽','毒舌但留分寸'],
    avoid:['刻薄伤人的恶意嘲讽','吐槽脱离剧情变成作者乱入'],
    check:['吐槽符合人物视角','无恶意攻击'],
    demo:'他说他要开始健身了。我看了眼他怀里那袋薯片，他说这是低卡的。我点点头：对，低卡到只够长在你最不常用的那块肉上。' },
  { id:'sliceoflife',group:'element',cat:'节奏与网感', name:'慢节奏生活流',
    note:'长句舒缓、日常细节、流水账式的治愈感。',
    tips:['长句舒缓','写日常细节与烟火气','节奏慢、治愈感'],
    avoid:['节奏拖沓无信息','平淡到无趣'],
    check:['细节有生活气息','读来治愈不焦躁'],
    demo:'傍晚他去买馒头，老板娘多塞了他一根油条，说是刚出锅的。他回家掰开馒头夹上油条，就着一碗滚烫的豆浆慢慢吃完，天正好黑下来。' },
  { id:'breathe',group:'element',cat:'节奏与网感', name:'张弛起伏',
    note:'快慢交替、张弛有度，情绪张满后给回气口。',
    tips:['激烈桥段后接舒缓过渡，避免全程崩弦','单章内安排1-2次情绪高低谷','节奏服务情绪，快慢都有目的'],
    avoid:['全程高能致疲劳','拖沓无高潮'],
    check:['快慢有对比','张弛有度不闷'],
    demo:'枪声刚落，只剩瓦砾里忽明忽暗的火——他忽然很想抽一会儿烟。' },
  { id:'staccato',group:'element',cat:'节奏与网感', name:'顿挫短句',
    note:'多短句、多句号、顿挫压迫，紧张感靠断句砸出来。',
    tips:['短句密集、句号敲击节奏','关键动作用破折号或单字短句定格','对白惜字加句读制造压迫'],
    avoid:['长句堆叠泄气','顿挫变碎碎念'],
    check:['读来有敲击感','氛围紧绷不碎'],
    demo:'灯灭了。门动了。枪，上了膛。他一动不动。' },
  { id:'shot',group:'element',cat:'节奏与网感', name:'画面分镜',
    note:'镜头语言进文字：切镜、推拉、特写、蒙太奇，画面感强。',
    tips:['靠镜头视角切换组织画面','大场面用推拉/俯瞰再切特写','关键处停格特写留画面'],
    avoid:['镜头跳切无联接','纯描写拖节奏'],
    check:['画面在脑中成像','切镜服从叙事'],
    demo:'镜头从燃着的舰队拉远，落在滩头一双攥紧步枪的手上——那只手在抖。' },
  { id:'meme',group:'element',cat:'节奏与网感', name:'玩梗共鸣',
    note:'适度当代网络梗、表情包化表达，提升年轻网感共鸣。',
    tips:['梗服务于人物与情绪，不做作者乱入','用"懂的都懂"式轻梗，不用陈年老梗','一处1-2个足够，密必俗'],
    avoid:['老梗陈词','梗盖过剧情'],
    check:['无梗也能读懂','梗符合人物身份'],
    demo:'他盯着那条消息看了三遍，缓缓打出一个"6"。' },
  { id:'oneliner',group:'element',cat:'节奏与网感', name:'爆点金句',
    note:'在名场面制造一句被记住、可转发的经典台词。',
    tips:['关键转折前铺垫，台词落在一击上','简洁有锋芒，可独立成句','金句说透情绪，不只耍帅'],
    avoid:['句句都是金句反成废话','为金句硬造'],
    check:['单拎出来仍有味道','贴合人物口吻'],
    demo:'"他们都叫我无名氏，可我记得每个名字。"' },
  { id:'punchline',group:'element',cat:'节奏与网感', name:'三连递进',
    note:'三点递进式爆点：铺垫→升格→砸点，笑点/爽点有结构。',
    tips:['先铺垫再翻一转二再砸底','第二/第三点必须递进更强','结尾落点干脆不拖'],
    avoid:['三连平铺无递增','砸底拖泥带水'],
    check:['一层比一层响','落点干脆'],
    demo:'第一次叫错，他笑了；第二次叫错，他黑了脸；第三次——他教那人把名字写在自己的拳头里。' },
  { id:'nonlinear',group:'element',cat:'叙事技法', name:'非线性插叙',
    note:'时间跳跃、倒叙插叙、视角切换的笔法。',
    tips:['倒叙/插叙布局时间线','适时视角切换','留悬念、逐步揭开'],
    avoid:['时间线混乱难懂','为炫技而跳跃'],
    check:['读者能看懂时间线','插叙服务悬念与情感'],
    demo:'多年后他整理父亲的遗物，翻出一张褪色的火车票：终点是当年他离家那晚没到的地方。他想起来了——那晚父亲追出去，其实一直追到了站台。' },
  { id:'multipov',group:'element',cat:'叙事技法', name:'多视角群像',
    note:'视角切换带来的文体变化。',
    tips:['多角色视角切换','各视角文体略有差异','用视角差制造信息差'],
    avoid:['视角混乱','众角色声音雷同'],
    check:['视角切换清晰','各视角有辨识度'],
    demo:'她在台上笑得落落大方，转身时长裙扫过。站在二楼的他，看见的却是她攥住裙摆的手，指节白了一瞬——那是她说不出口的那记再见。' },
  { id:'jinyong', group:'element', cat:'叙事技法', name:'金庸武侠风',
    note:'白话为骨、清隽文雅，重侠义风骨与「武即德」，打斗点到即止。',
    tips:['文白相间但以白话为主，清朗不拗口','对白见人物心性，谈笑间立场分明','武学重在招如其人、胜负系于胸襟与抉择'],
    avoid:['通篇文言掉书袋','靠境界/数据堆战力而无人格','招式浮夸只剩热闹'],
    check:['打斗不靠数值堆砌','人物立得住、侠义贯穿','武与德互为表里'],
    demo:'他这一剑不伤人，只想破开迷障问一句——当年的恩怨，可曾有半分真假？' },
  { id:'cosmic', group:'element', cat:'叙事技法', name:'克苏鲁/神秘叙事',
    note:'慢热、不可名状的形容、氛围堆叠而非直接说明。',
    tips:['慢热铺垫、氛围堆叠','描述不可名状的怪诞','不直接说明，留神秘'],
    avoid:['直接点破诡异真相','描写喧宾夺主'],
    check:['氛围压抑、层层递进','神秘感不流失'],
    demo:'山谷里的小旅馆只住了他一个客人。后半夜，楼道尽头传来敲门声，两下，停，一下。他壮胆开门——走廊空无一人，而他插在门内侧的那把反锁钥匙，不知何时，已经被拔掉了。' },
  { id:'fan',    group:'element', cat:'叙事技法', name:'魔幻奇幻史诗',
    note:'魔法奇观、异界冒险、史诗宿命，奇幻世界观从容自洽。',
    tips:['魔法与异界设定自洽、有内在法则','经典奇幻的大格局与使命宿命','冒险推进带史诗感、旅程即成长'],
    avoid:['设定堆砌只炫世界','奇幻沦为无敌光环','格局大却空泛'],
    check:['世界法则自洽','冒险有史诗张力','设定服务人物与使命'],
    demo:'山脚的灯一盏盏亮起，他握着旧魔杖站在岔路出口：预言说的是他，可他只想先救下那个女孩。' },
  { id:'space',  group:'element', cat:'叙事技法', name:'宇宙史诗/星际文明',
    note:'放大星空与文明兴衰的宏大尺度，用异族视角与技术奇观铺陈未知。',
    tips:['把尺度拉到星海与文明兴衰的跨度','用技术奇观、异族视角制造宇宙感与疏离','让高于个人恩怨的文明命题作底'],
    avoid:['沦为地球都市科幻','堆设定与数据、只炫科技','把外太空当猎奇背景而无文明内核'],
    check:['有宇宙尺度与想象力','设定服务于主题','文明命题能立住'],
    demo:'当那艘沉寂了一万年的方舟重新亮灯，瞭望塔上最后一个人类忽然明白：我们从未孤独。' },
  { id:'sus3',   group:'element', cat:'叙事技法', name:'科幻惊悚衍生态',
    note:'高科技下的危险美学，惊颤与悬念延续而非设定堆砌。',
    tips:['以技术奇观放大未知威胁','惊悚源自科技的失控与人性','慢热铺垫、悬念层层加码'],
    avoid:['堆设定与术语','靠突然惊吓混悬念','高科技沦为背景板'],
    check:['威胁具体可感','悬念持续推进','科技与人性的张力兼顾'],
    demo:'培育缸里那头东西睁开眼，第一反应不是逃，而是隔着防爆玻璃，安静地打量他。' },
  { id:'jifeng', group:'element', cat:'台词设计', name:'机锋对白',
    note:'短促交锋、话里有话（谍战、职场戏）。',
    tips:['对话短促交锋','话里有话、潜台词丰富','用停顿与留白施压'],
    avoid:['对白直白无张力','所有角色雷同'],
    check:['对话有子面冲突','潜台词清晰可读'],
    demo:'"你早该走了，为什么还留着？""你这话，是想我走，还是怕我听出你舍不得？"他笑了笑，把她面前那杯凉掉的茶，轻轻往她那边推了推。' },
  { id:'cross',  group:'element', cat:'台词设计', name:'插科打诨',
    note:'荤素不忌的相声式对白。',
    tips:['相声式插科打诨','对话热闹、包袱密集','符合人物身份场合'],
    avoid:['低俗失度','为逗而逗脱离剧情'],
    check:['笑点长在人物身上','不失分寸'],
    demo:'"都说了我这人不记仇。""那你上回怎么三个月没理老王？""怪他记性太好——把我早忘了的事，替他记了三个月的仇。"' },
  { id:'storyteller',group:'element',cat:'台词设计', name:'说书人腔',
    note:'旁白式"话说""且听我道来"的叙述介入。',
    tips:['旁白式"话说/且听我道来"','叙述者在场、带节奏','说书式点评与转场'],
    avoid:['旁白过度打断','腔调陈旧呆板'],
    check:['有说书节奏','旁白服务叙事'],
    demo:'话说这码头上，能叫整条船停下来等一个人的主儿，可不多。可这一位啊，偏偏就肯等；这一等，分别的，便成了一段十里八乡都讲不完的交情。' },
  { id:'moli',   group:'element', cat:'叙事技法', name:'无厘头喜剧',
    note:'荒诞夸张、无逻辑转折、错位自嘲，一本正经地胡说八道。',
    tips:['设置夸张与反差、笑点落在荒诞而非逻辑','一本正经说荒唐话、错位自嘲','梗密度高、节奏快、转场跳脱'],
    avoid:['刻意逻辑闭环','低俗恶搞无节制','为搞笑强加剧情'],
    check:['荒诞但有内在喜感','不流于恶俗','笑点服务于人物与剧情'],
    demo:'他认真地思考了三秒，然后很严肃地告诉我：人不能太有钱，因为容易长寿。' },
  { id:'shenghuo', group:'element', cat:'叙事技法', name:'生活情景喜剧',
    note:'家庭日常＋固定人物性格碰撞，误会化解保留温馨底。',
    tips:['生活场景、小冲突环环相扣','用人物固定性格制造笑点与误会','斗嘴后总会化解、留温情收尾'],
    avoid:['冲突升级成狗血','靠强设定硬造笑点','失去生活质感'],
    check:['笑点来自生活与人物关系','误会化解自然','温暖底色不丢'],
    demo:'妈妈问他为什么又考砸，他一本正经：老师把题出得太多，我一时没来得及焦虑。' },
  { id:'fangyan', group:'element', cat:'台词设计', name:'方言/口音区隔',
    note:'用方言俚语、口癖腔调让每个角色开口有辨识度，对话自带地域与身份。',
    tips:['给关键角色赋予标志性口癖与腔调','用少量方言俚语点出身与城，不整段方言','不同地角色用不同语言习惯拉开落差'],
    avoid:['全程方言、读者难读','所有角色腔调雷同','方言作为噱头却无人格'],
    check:['台词不用看名就能分人','方言服务于人物身份','可读性不因口音牺牲'],
    demo:'“听你这口音，是打潞州来的吧？”掌柜的搁下算盘，“俺们这儿不兴这个。”' },
  { id:'qinghua', group:'element', cat:'台词设计', name:'情话/浪漫对白',
    note:'含蓄走心、带诗意的浪漫对白，于细节处表深情。',
    tips:['话里有心意，点到即止不直白','借日常物象与细节表深情','留白，把余味交给读者'],
    avoid:['油腻直白的土味情话','空喊喜欢无行动落点','为美而美、脱离人物语气'],
    check:['含蓄但不晦涩','情出自细节、真实可感','符合人物身份口吻'],
    demo:'他望着她的眼睛，半天只说了句：“今年冬天的雪，我替你先堆好了。”' },
  { id:'yinghan', group:'element', cat:'台词设计', name:'冷峻短促/硬汉对白',
    note:'惜字如金、动作代答，暗示多于直陈的克制型对白。',
    tips:['句子短、信息密，能用一个字不用一句','用动作与沉默代替解释','威胁与真相藏进潜台词'],
    avoid:['废话连篇','情绪过分外露','为装酷而故作高深'],
    check:['每句对白都有信息量','沉默与动作在替人物说话','克制但不冰冷失温'],
    demo:'“去哪？”“走。”“还回来吗？”他没停步，扔下一句：“看运气。”' }
];
const WRITE_COMBOS = [
  { id:'comic',     name:'😆 轻喜剧',  desc:'对白机锋层层叠加诙谐拆台，笑点长在人物与话术上，不硬抖包袱。', tags:['jifeng','cross','roast'] },
  { id:'mystery',   name:'🕵️ 悬疑',   desc:'阴冷压抑＋非线性悬念逐步编织，靠信息差与伏笔牵引推理。', tags:['suspense2','nonlinear'] },
  { id:'burn',      name:'🔥 燃向',   desc:'快节奏加码＋强动作链与密集钩子，情绪与力度一路走高。', tags:['fast','flame'] },
  { id:'aesthetic', name:'🌸 唯美',   desc:'文艺意象＋诗化段落，抒情长句与留白共筑氛围。', tags:['wenyi','poetic'] },
  { id:'speed',     name:'⚡ 快节奏爽文', desc:'爽文节奏＋网文口语与机锋对白，段落短、信息密、不拖沓。', tags:['fast','webman','jifeng'] },
  { id:'moli-combo', name:'🤪 无厘头',     desc:'荒诞夸张、反差自嘲，梗密节奏快，笑点落在荒诞不落在逻辑。', tags:['moli','fast','cross'] },
  { id:'family',   name:'😂 欢脱日常',   desc:'家庭生活小冲突环环相扣，误会化解留温情，笑点来自关系和烟火气。', tags:['shenghuo','sliceoflife','cross'] },
  { id:'jianghu',  name:'🏮 江湖喜剧',   desc:'武侠外壳的生活喜剧：江湖群像斗嘴＋无厘头＋机锋，笑点在人情世故。', tags:['shenghuo','moli','jifeng'] },
  { id:'yosheng',  name:'🦖 侏罗纪式科幻', desc:'高科技惊悚＋冒险奇观：未知威胁延续悬念，科技失控处见人性。', tags:['suspense2','fast','sus3'] },
  { id:'gufeng',   name:'🏯 武侠古风',   desc:'金庸风骨＋古风文言，侠义作魂、古韵为衣，打斗点到即止。', tags:['jinyong','classic','flame'] },
  { id:'romance',  name:'💞 甜宠言情',   desc:'恋爱甜宠＋浪漫对白＋轻盈灵动，细节传情、小动作含糖。', tags:['sweet','qinghua','airy'] },
  { id:'epicfan',  name:'🏰 史诗奇幻',   desc:'奇幻冒险＋史诗厚重＋宇宙尺度，大格局世界观从容铺陈。', tags:['fan','epic','space'] },
  { id:'horror',   name:'👻 惊悚恐怖',   desc:'感官恐惧＋悬念压抑＋顿挫短句，寒意入骨、压迫步步收紧。', tags:['terror','suspense2','staccato'] },
  { id:'heal',     name:'💧 治愈温情',   desc:'平淡暖心＋慢节奏生活流＋轻快灵动，柴米油盐里的光。', tags:['warmth','sliceoflife','airy'] },
  { id:'scheme',   name:'⚔️ 权谋对峙',   desc:'一触即发＋锋利冷冽＋机锋对白，句句试探、胜负在话里。', tags:['standoff','cutting','jifeng'] },
];
function availableCombos(){
  const c = getCfg().styleCustom || {};
  c.customCombos = Array.isArray(c.customCombos) ? c.customCombos : [];
  const removed = Array.isArray(c.comboRemoved) ? c.comboRemoved : [];
  const libIds = writeStyleLib().map(s=>s.id);
  const builtin = WRITE_COMBOS.filter(x=> !removed.includes(x.id));
  const mine = c.customCombos
    .map(x=>({ ...x, custom:true, tags:(x.tags||[]).filter(id=> libIds.includes(id)) }))
    .filter(x=> x.tags.length > 0);
  return builtin.concat(mine);
}
const AI_CAT_LABEL = { '语言质感':'① 语言质感', '情绪与张力':'② 情绪与张力', '节奏与网感':'③ 节奏与网感', '叙事技法':'④ 叙事技法', '台词设计':'⑤ 台词设计', custom:'⭐ 我的自定义' };
let aiRp = null; // {list:[...], err:'' } 运行期临时候选（不持久化；render 重建主卡时会保留，重启清空）
const KEY_AIHIST = nsKey('aiRecipeHist_v1');
const AIHIST_CAP = 30;                       // 快照条数上限
const AIHIST_MAX_BYTES = 3600000;            // 存储体积安全阈值（约 3.4MB）
function getAiHist(){ try{ return JSON.parse(localStorage.getItem(KEY_AIHIST)||'[]'); }catch(e){ return []; } }
function setAiHist(a){
  let list = Array.isArray(a) ? a.slice(-AIHIST_CAP) : [];
  let s;
  try{ s = JSON.stringify(list); }catch(e){ return; }
  while(list.length && s.length > AIHIST_MAX_BYTES){ list.shift(); s = JSON.stringify(list); }
  try{ localStorage.setItem(KEY_AIHIST, s); }catch(e){ /* 超限静默；设独立键，不影响主 cfg */ }
}
function addAiHist(entry){ const a = getAiHist(); a.push(entry); setAiHist(a); return a.length; }
function snapAiHist(){ return getAiHist(); }
function aiHistEntryId(){ return 'ah'+Date.now().toString(36); }
function histState(kind){
  const s = state;
  if(kind === 'ct'){ if(!Array.isArray(s.ctAdviceHist)) s.ctAdviceHist = []; return s.ctAdviceHist; }
  if(kind === 'content'){ if(!Array.isArray(s.contentAdviceHist)) s.contentAdviceHist = []; return s.contentAdviceHist; }
  return [];
}
function addAdvHist(kind, entry){
  const a = histState(kind);
  a.push(entry);
  if(a.length > 30) a.splice(0, a.length - 30);   // 小体积文本，按条数截断即可
  persist();
  return a.length;
}
function openAdvHistPanel(kind){
  const hist = histState(kind).slice();
  const mode = kind === 'content';
  const ov = document.createElement('div'); ov.id='advHistPanel'; ov.className='gs-overlay';
  const entHtml = (e,hi)=>{
    const ei = hist.length-1-hi;   // 倒序序号（与展示一致）
    return `<div class="ws-lib-group ws-lib-fold" style="margin-top:6px">
      <div class="ws-lib-fold-t" data-ah-fold="${ei}" role="button" tabindex="0" title="展开/收起">
        <span>${mode?'📄':'📝'} ${esc(e.desc||'')} <span class="muted" style="font-size:10px">· ${new Date(e.ts).toLocaleString('zh-CN',{hour12:false})}</span></span>
        <span class="sc-fold-ico">▸</span>
      </div>
      <div class="ws-lib-fold-body" style="display:none">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px">
          <button type="button" class="btn small ghost" data-ah-apply="${ei}">↩ 回填首条建议</button>
          <button type="button" class="btn small ghost" data-ah-del="${ei}">删</button>
        </div>
        ${ (Array.isArray(e.list)&&e.list.length) ? e.list.map((c,i)=>aiAdvHistCandHtml(c,i)).join('<hr style="margin:6px 0;opacity:.2">') : '<p class="muted">无建议。</p>' }
      </div>
    </div>`;
  };
  const list = hist.slice().reverse();
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>${mode?'📄':'📝'} ${mode?'章节内容':'章节标题'} AI 建议历史（${hist.length}）</b>
        <span style="display:flex;gap:6px">
          <button class="btn small ghost" data-ah-clear>清空</button>
          <button class="gs-x" data-ah-close>✕</button>
        </span></div>
      <div class="cv-body">
        ${ list.length ? list.map(entHtml).join('') : '<p class="muted">暂无历史。用「✨ AI 优化此建议」生成后即自动保存于此，可随时回看。</p>' }
      </div>
    </div>`;
  const close = ()=>{ const p=$('#advHistPanel'); if(p) p.remove(); };
  ov.addEventListener('click', (e)=>{
    const cl = e.target.closest('[data-ah-close]'); if(cl){ close(); return; }
    const fold = e.target.closest('[data-ah-fold]');
    if(fold){ const body = fold.closest('.ws-lib-group').querySelector('.ws-lib-fold-body'); if(body){ const open = body.style.display!=='none'; body.style.display = open?'none':'block'; fold.querySelector('.sc-fold-ico').textContent = open?'▸':'▾'; } return; }
    const apply = e.target.closest('[data-ah-apply]');
    if(apply){
      const ei=+apply.dataset.ahApply; const entry=hist[ei];
      if(entry && Array.isArray(entry.list) && entry.list.length){
        if(mode){
          aiAdviceCand = entry.list.slice(0,3);
          const out = $('[data-advice-ai-out]'); if(out) out.innerHTML = aiAdviceResultHtml();
          const ta = $('#rpAdvice'); if(ta){ ta.value = (entry.list[0]&&entry.list[0].text)||''; ta.focus(); }
        }else{
          ctAdviceCand = entry.list.slice(0,3); ctAdviceFold = false; ctAdoptedIdx = -1;
          const out = $('[data-cth-ai-out]'); if(out) out.innerHTML = ctAdviceResultHtml();
          updateFoldBtn();
          const inp = $('#rtInput'); if(inp) inp.value = (entry.list[0]&&entry.list[0].text)||'';
        }
        toast('已回填该条建议');
      }
      close(); return;
    }
    const del = e.target.closest('[data-ah-del]');
    if(del){ const ei=+del.dataset.ahDel; const a=histState(kind); if(a[ei]){ a.splice(ei,1); persist(); } refreshAdvHistBadge(kind); const p=$('#advHistPanel'); if(p) p.remove(); openAdvHistPanel(kind); return; }
    const clr = e.target.closest('[data-ah-clear]');
    if(clr){ if(confirm('确认清空全部该建议历史？')){ histState(kind).length = 0; persist(); refreshAdvHistBadge(kind); close(); } return; }
    if(e.target===ov) close();
  });
  document.body.appendChild(ov);
}
function aiAdvHistCandHtml(c,i){
  return `<div class="advice-ai-cand"><div class="advice-ai-head"><span class="advice-ai-idx">${'①②③'[i]||(i+1)}</span><b>${esc(c.title||('方案'+(i+1)))}</b></div><p>${esc(c.text||'')}</p></div>`;
}
function refreshAdvHistBadge(kind){
  if(kind === 'ct'){
    const card = $('.ct-block');
    if(card){ const b = card.querySelector('[data-ctadv-hist] .ai-hist-badge'); if(b) b.textContent = histState('ct').length||''; }
  }else{
    const rp = $('#regenPanel');
    if(rp){ const b = rp.querySelector('[data-advadv-hist] .ai-hist-badge'); if(b) b.textContent = histState('content').length||''; }
  }
}
const AI_RECIPE_SYS_PRO = `你是一位资深长篇小说「风格工程师」与「写作配方设计师」。

【你的定位】
你负责的是「写作配方层」：把已经确定的小说构想与写作风格，转译成可执行、可组合、可检查的写作规则。

你不负责改故事，不负责重做世界观，不负责扩写剧情，也不负责代替词典达人、校长、老师或正文AI。
你的核心原则只有一句：
「配方决定怎么写，不决定写什么故事。」

【AI链路与职责边界】
L0 用户原始输入：最高事实来源。
L1 优化构想AI：整理、强化并明确小说方案，但不能擅自改写用户明确事实。
L1.5 写作配方AI（你）：负责表达层与写法层的工程化设计。
L2 词典达人：负责世界事实、人物事实、设定资料的建设。
L3 词典充实：负责深化和补充已有事实资料。
L4 校长：负责全书组织、结构统筹与宏观决策。
L5 老师：负责章节级施工、节拍和执行安排。
L6 正文AI：根据上游已经锁定的故事事实、结构和写作配方生成正文。

你只能在自己的职责范围内工作。
不得借「gap 新词条」偷偷增加人物、反派、势力、世界规则、能力、秘密、谜团、反转、关系、事件、地点、时代背景或剧情走向。

【输入优先级】
当输入存在冲突时，按以下优先级判断：
1. ②优化构想所选方案及其已经明确的小说事实
2. 用户当前明确提出的写作风格/表达要求
3. 当前已有写作风格词库
4. 你的专业判断

注意：第3、4项都不能覆盖第1项已经确定的故事事实。
如果用户明确锁定了文风、叙事方式、语言质感等表达要求，它们属于表达层最高权威；你可以把它们工程化，但不能偷偷把它们改成另一种风格。

【什么可以改，什么绝对不能改】
一、绝对不能改动的「故事事实」：
- 类型、题材、时代、世界观
- 主角身份、核心人物关系、人物既定经历
- 核心目标、核心矛盾、核心冲突
- 已确定的金手指/能力/规则
- 已确定的势力、阵营、敌我关系
- 已确定的剧情方向、关键事件、结构安排
- 用户明确给出的专有名词、关键词、书名
- 优化构想中已经锁定的任何事实性内容

二、可以设计的「写作方法」：
- 语言质感
- 句式与段落节奏
- 信息释放方式
- 情绪推进与张力控制
- 叙事距离、视角处理
- 悬念、钩子、回收、留白等叙事技法
- 对话节奏、潜台词、人物说话方式
- 网感、阅读速度、章节推进感
- 场景描写、动作描写、感官描写的组织方式
- 其他能够直接指导正文写法的表达层规则

判断标准：如果一条规则回答的是「这个故事发生什么」，它越界；如果回答的是「已经确定的故事应该怎么写」，它属于你的职责。

【必须区分四类信息】
A. 用户明确事实：必须保留，不能修改。
B. 用户明确方向：可以强化、细化、工程化，但不能改变方向。
C. 合理推断：可以用于解释为什么某种写法更适合，但不能伪装成用户已经说过的事实。
D. AI新增设定：原则上禁止。除非属于纯粹的「写作方法」示范，否则不得作为小说Canon写入配方。

【核心任务】
先完整阅读并理解当前输入，再进行配方设计。你必须把用户的原文当成需要分析的“需求文本”，而不是只抓几个关键词。
先在内部完成：①提取明确事实与明确写作要求；②识别主题、意图、语气、表达目标；③判断已有词库哪些能力真正覆盖；④找出真实缺口；⑤形成多个彼此不同的写法方向；最后才输出配方。

通常输出 2~5 个真正有区分度、可直接落地的组合配方；但“数量”不是硬指标。如果输入内容不足以支持这么多独立方向，可以少于 2 个，禁止用同义词改名、无意义换序或重复词条来凑数。

配方不是漂亮的形容词堆砌，而是一组可以交给正文AI执行的「写法组合」。
每一个配方都必须让人看得出：
- 为什么适合这部小说；
- 具体应该怎样写；
- 与其他候选方案究竟差在哪里；
- 后续正文AI能否据此执行。

【现有词库的使用原则】
1. tags 只能引用当前提供的现有词库 id。
2. 现有词库是「可复用的风格资产」，不是必须迁就的天花板。
3. 优先复用真正贴合本小说的现有词条，不要为了制造新意而重复造词。
4. 但如果现有词库无法覆盖一个真实、重要、且属于写作方法层的缺口，必须通过 gap 设计新的量身定制词条。
5. 不能因为某个词条只在名称上相似，就强行认为它已经覆盖需求；要看它实际规定的写法是否与本小说完全匹配。
6. 如果现有词库已经足够覆盖需求，gap 必须为 null。不要为了「看起来更专业」而硬造新词。

【gap 的真正职责】
gap 不是剧情补丁，也不是世界观补丁，而是「缺失的写作方法词条」。
只有在现有词库无法覆盖某个重要写作维度时才生成。

gap 可以创新，但创新范围严格限定在：
- 语言质感
- 情绪与张力
- 节奏与网感
- 叙事技法
- 台词设计

gap 绝对不能创新：
- 人物
- 人物关系
- 反派
- 势力
- 世界规则
- 能力体系
- 金手指
- 新地点
- 新时代背景
- 新秘密
- 新谜团
- 新剧情事件
- 新冲突
- 新反转
- 新设定

【gap 新词条必须可执行】
每个 gap 必须完整包含以下字段：
- name：词条名称
- cat：只能是「语言质感」「情绪与张力」「节奏与网感」「叙事技法」「台词设计」之一
- id：新词条的稳定英文式 id，简洁、唯一、可作为后续词库标识
- note：一句话说明这个写法解决什么问题、适合什么表达
- tips：至少 2 条具体写法规则，必须是正文AI能执行的动作，不要只写抽象形容词
- avoid：至少 1 条明确禁止事项
- check：至少 1 条可用于成稿自查的检查项
- demo：一个短小、只展示写法的示例；示例不得偷偷添加新的小说事实
- reasons：说明为什么现有词库无法充分覆盖这个缺口，以及为什么这个新词条值得建立

【什么叫「可执行」】
不要只写：
- 「更有电影感」
- 「更高级」
- 「更有张力」
- 「更有网感」
- 「语言更克制」

必须把它翻译成具体动作，例如：
- 信息先给结果，再延迟解释原因；
- 每个情绪节点至少保留一个未说透的信息缺口；
- 对话优先用动作和停顿表达情绪，减少直接情绪命名；
- 段落长短随紧张度变化；
- 关键句前压缩铺垫，关键句后留出回味空间。

【不同候选必须真正拉开差异】
不要只是把「克制」「冷峻」「凌厉」「高级」换几个同义词，就生成四个看似不同的方案。
不同候选应该在写法组合上存在明显差异，例如：
- 一个强调冷静克制 + 信息留白；
- 一个强调快节奏推进 + 强钩子 + 高频回收；
- 一个强调沉浸感 + 感官细节 + 情绪递进；
- 一个强调人物对话 + 潜台词 + 关系张力。

如果两个候选在实际执行时几乎写成同一种小说，就应该合并或淘汰其中一个。

【why 的写法】
why 必须解释「为什么这些词条组合起来最适合当前小说」。
引用词条时只能使用中文 name，禁止出现英文 id。
不要空泛写「因为很适合」，而要说明风格之间如何互相配合。

【scenario 的写法】
scenario 说明这套配方最适合怎样的表达场景、章节阶段或阅读状态。
可以说「适合高压冲突段」「适合人物关系推进」「适合开篇建立阅读惯性」等。
不得为了举例而虚构当前小说没有确定的剧情事件、人物或世界设定。

【组合原则】
一个组合配方通常选择 2~5 个真正互补的现有词条，并在确有缺口时增加 gap。
不要为了凑数量堆叠互相冲突或高度重复的词条；也不要为了让候选看起来“丰富”而强行覆盖所有维度。
组合应该形成互补关系：语言 + 节奏 + 情绪 + 叙事 + 台词等维度可以协同，但不必每套都覆盖所有维度。
【数量停止条件】如果新增一个候选只能复述前面候选的写法，就停止生成；如果现有词库已经覆盖某个需求，不得再用 gap 重复包装它。

【短构想/信息不足时】
如果输入很短，只能依据已经明确的信息设计「表达方法」，不要擅自补全世界观和剧情。
如果缺少足够的故事事实，可以降低方案的具体剧情指向，但仍然可以提供通用的、与用户已锁定风格一致的写法组合。
不要为了让配方显得完整而发明故事设定。

【最终输出：严格 JSON】
只输出一个 JSON 数组，不要 Markdown，不要代码块，不要解释，不要前后缀。
数组长度为 2~6，通常优先输出 3~5 个高质量候选，而不是为了数量堆满 6 个。

每个候选严格使用以下结构：
[
  {
    "name":"配方名（≤12字）",
    "desc":"一句话点明这套配方的核心写法与适用的题材/氛围",
    "tags":["现有词库词条 id，2-5 个"],
    "why":"为什么这样组合；引用词条时使用中文 name",
    "scenario":"适用的表达场景/章节阶段/阅读状态，不虚构剧情",
    "gap":null
  }
]

如果存在真实写作方法缺口，gap 必须是数组；没有真实缺口时必须是 null。
gap 数组中的每一项必须同时具备 name、cat、id、note、tips、avoid、check、demo、reasons，不能缺字段。

【JSON 绝对要求】
- 必须是合法 JSON。
- 字符串内部如需换行，必须使用 JSON 转义，不得产生非法裸换行。
- 不得使用注释。
- 不得输出 JSON 之外的任何文字。
- tags 中只能出现输入提供的现有词库 id。
- why、scenario、reasons 中不得出现英文词条 id 作为说明文字。
- gap 中的 id 只用于新词条标识，不代表小说设定。

【绝对禁止】
1. 修改用户已经确定的故事事实。
2. 把写作配方写成新的故事大纲。
3. 用 gap 偷渡人物、势力、反派、能力、规则、地点、秘密、谜团、事件或剧情。
4. 把合理推断伪装成用户明确设定。
5. 用大量空泛形容词代替可执行写法。
6. 为了凑 gap 数量而制造不存在的缺口。
7. 为了凑候选数量而生成高度同质的配方。
8. 把已有词条的英文 id 写进 why、scenario、reasons 的自然语言说明。
9. 输出 Markdown、解释、分析过程或 JSON 之外的任何内容。

【提交前自检】
输出前逐项检查：
- 我有没有改动任何已经确定的小说事实？
- 每一个 tags id 是否真的来自当前词库？
- 每一个 gap 是否确实属于写作方法层，而不是故事设定层？
- gap 的九个字段是否全部齐全？
- tips 是否至少 2 条并且可以直接执行？
- avoid 是否至少 1 条？
- check 是否至少 1 条？
- demo 是否只展示写法，没有偷偷增加小说事实？
- 不同候选是否真的存在执行层面的差异？
- why / scenario / reasons 是否使用中文 name 而不是英文 id？
- 最终结果是否可以直接 JSON.parse？

牢记：
「优化构想决定这个故事应该写什么；写作配方决定这个故事应该怎么写；词典达人决定世界事实；校长决定全书组织；老师决定章节施工；正文AI负责把施工方案写成小说。」`;


function aiRecipeUser(extra){
  const canonical = currentCanonicalStoryStrategy();
  const human = canonical ? (canonical.humanView || canonical.creationBlueprint || {}) : null;
  const txt = String((human && human.optimizedIdea)||'').trim();
  if(txt){
    const body = stripStructureFromIntro(txt);
    const head = '【唯一已采用优化构想创作蓝本（配方必须百分之百贴合本小说）】\n' + body;
    return extra ? `${head}\n\n以下为对该小说的写作风格配方设计请求：\n${extra}` : head;
  }
  const o = state.outline || {};
  const head = (String(o.title||'').trim() && String(o.logline||'').trim())
    ? `【小说书名】${o.title}\n【小说简介】${o.logline}\n\n以下为该小说的写作风格配方设计请求：`
    : '（尚未生成大纲：为让 AI 依据本小说书名与简介设计更贴合的风格配方，建议先到「大纲」步生成书名与简介。）';
  return extra ? `${head}\n\n${extra}` : head;
}
function aiRecipeSpecNote(s){
  const n = String(s.note||'').trim();
  if(!n) return '';
  const multi = n.includes('\n') && /写法|避免|自查/.test(n);
  const head = n.split('\n')[0].trim();
  return (multi ? (head ? head + '（多行配方·详见词库）' : '（多行配方·详见词库）') : n).slice(0,60);
}
function aiRecipePrompt(userDesc, analysis){
  const lib = writeStyleLib();
  // 旧版只给每个词条一行、且 note 截断到 60 字，模型很容易“看见名字、没看见真正写法”。
  // 现在把可执行字段完整提供给分析/配方层，先理解再组合。
  const spec = lib.map(s=>{
    const tips = Array.isArray(s.tips) ? s.tips : [];
    const avoid = Array.isArray(s.avoid) ? s.avoid : [];
    const check = Array.isArray(s.check) ? s.check : [];
    const demo = String(s.demo||'').trim();
    return `- id=${s.id}｜name=${s.name}｜cat=${s.cat||'custom'}\n  note=${String(s.note||'').trim()}\n  tips=${tips.join('；')}\n  avoid=${avoid.join('；')}\n  check=${check.join('；')}\n  demo=${demo}`;
  }).join('\n');
  const analysisBlock = analysis ? `\n\n【输入理解分析｜上一层已经完成语义拆解，只作为本轮配方生成的工作记忆】\n${JSON.stringify(analysis)}` : '';
  return { system: AI_RECIPE_SYS_PRO + analysisBlock + '\n\n【现有词库完整可执行资料】：\n' + spec, user: aiRecipeUser(userDesc) };
}

/* Prompt Perfect 式两阶段：先理解用户输入，再设计配方。
 * 这一层不生成成品配方，也不创造小说事实；它只把原文压缩成“事实/需求/写法缺口/候选方向”的结构化工作记忆。
 */
const AI_RECIPE_ANALYSIS_SYS = `你是“写作配方AI”的输入理解与需求分析器。你的工作不是写配方，而是先把用户输入真正读懂，形成供下一层配方设计使用的结构化分析。

【最高原则】
1. 只从用户输入和已提供的小说方案中提取事实与表达需求，不得脑补小说事实。
2. 必须区分：explicitFacts（明确事实）、styleRequests（明确风格要求）、inferredNeeds（合理推断的写作需求）、unknowns（尚未提供的信息）。
3. 对用户文字做语义聚类：主题、意图、已有素材、关键词、语气、叙事/表达倾向、想解决的问题。
4. 找出“已经被词库覆盖”的写作能力，以及“可能缺失但需要进一步核对词库”的写作能力。这里只描述能力，不直接制造新词条。
5. 提出多个真正不同的写法方向，但不得为了凑数量硬拆同义方案；如果输入只支持少数方向，就只返回少数方向。
6. 不改变用户方向，不新增人物、剧情、世界观、能力、地点、秘密或事件。

【输出】严格 JSON 对象，不要 markdown：
{
  "inputSummary":"对用户输入的准确理解",
  "explicitFacts":[],
  "styleRequests":[],
  "inferredNeeds":[],
  "keywords":[],
  "coveredCapabilities":[],
  "candidateDirections":[{"name":"方向名","core":"核心写法差异","bestFor":"适用表达场景"}],
  "possibleGaps":[{"capability":"缺失的写作能力","reason":"为什么可能缺","priority":"high|medium|low"}],
  "unknowns":[]
}`;
async function aiRecipeAnalyze(userDesc){
  const base = aiRecipeUser(userDesc);
  const lib = writeStyleLib();
  const compactLib = lib.map(s=>({id:s.id,name:s.name,cat:s.cat||'custom',note:String(s.note||'').trim(),tips:Array.isArray(s.tips)?s.tips:[]}));
  const user = `${base}\n\n【现有词库用于覆盖核对】\n${JSON.stringify(compactLib)}\n\n请先完成输入理解，不要生成最终配方。`;
  const raw = unwrapAIResult(await callDeepSeek(AI_RECIPE_ANALYSIS_SYS,user,{maxTokens:2200,temperature:0.2,topP:0.2,signal:_abortCtl?.signal,taskKey:'recipe'}));
  const j = parseJson(raw);
  if(!j || typeof j!=='object' || Array.isArray(j)) throw new Error('写作配方AI的输入理解阶段返回无效结果');
  return j;
}
function aiRecipeCard(){
  const lib = writeStyleLib();
  const collapsed = getCfg().aiRecipeCollapsed === true;
  return `<div class="card ai-recipe-card card-theme-recipe${collapsed?' collapsed':''}">
    <div class="ai-recipe-head card-head-bar" data-ai-recipe-fold role="button" tabindex="0" title="展开/收起">
      <div class="ch-left">
        <span class="ch-badge ch-badge-recipe">🧪</span>
        <h3 class="ch-title">AI 配方助手</h3>
        <span class="ch-subtag ch-subtag-recipe">风格设计 · 智能搭配</span>
      </div>
      <div class="ch-right">
        <button type="button" class="ai-upload-btn ai-hist-btn" data-ai-recipe-hist title="AI 配方历史：回看已生成过的候选配方">📖<span class="ai-hist-badge">${snapAiHist().length||''}</span></button>
        <span class="sc-fold-ico">${collapsed?'▸':'▾'}</span>
      </div>
    </div>
    <div class="ai-recipe-body">
      <div class="ai-desc-wrap">
        <textarea id="aiReDesc" rows="3" placeholder="" style="width:100%;box-sizing:border-box"></textarea>
      </div>
      <div class="ai-recipe-tool">
        <button type="button" class="btn primary" data-ai-recipe-gen>✨ 生成配方</button>
        <button type="button" class="btn small ghost" data-ai-recipe-clear>清空</button>
      </div>
      <div data-ai-recipe-out>${ aiRecipeResultHtml(lib) }</div>
    </div>
  </div>`;
}
function aiRecipeResultHtml(lib){
  if(aiRp && aiRp.err) return `<p class="muted" style="color:var(--danger);margin:8px 0 0">⚠️ ${esc(aiRp.err)}</p>`;
  if(!aiRp || !Array.isArray(aiRp.list) || !aiRp.list.length){
    return '';
  }
  const libIds = (lib||writeStyleLib()).map(s=>s.id);
  return aiRp.list.map((c,ci)=>`
    <div class="ai-recipe-cand${ ci===aiRp.hi ? ' hi' : '' }">
      <div class="ai-recipe-cand-head">
        <b>${esc(c.name||('候选'+ (ci+1)))}</b>
        ${ recipeScBadge(c) }
        <span class="muted" style="font-size:11px">${esc(c.desc||'')}</span>
      </div>
      <div class="ai-recipe-tags">${ (c.tags||[]).map(id=>{ const s=writeStyleById(id); return `<span class="ai-recipe-tg"${s?'':' title="引用了词库外 id"'} style="${s?'':'opacity:.65'}">${esc(s?s.name:id)}${s?'':'（词库外）'}</span>`; }).join('') }</div>
      <div class="ai-recipe-sec"><span class="ar-lab">为何这样选</span>${esc(wiseWhyText(c.why||''))}</div>
      <div class="ai-recipe-sec"><span class="ar-lab">适用场景</span>${esc(wiseWhyText(c.scenario||''))}</div>
      <div class="ai-recipe-gap">
        ${ gapHtml(c, ci) }
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="btn small primary" data-ai-recipe-pick="${ci}">✔ 选用此配方</button>
        <button type="button" class="btn small ghost" data-ai-recipe-save="${ci}" title="仅存入「我的配方」，不应用到写作风格">＋ 收藏不采用</button>
      </div>
    </div>`).join('');
}
function gapFiveHtml(g){
  const hasStruc = Array.isArray(g.tips)||Array.isArray(g.avoid)||Array.isArray(g.check);
  const p = hasStruc
    ? { intro:g.note||'', tips:Array.isArray(g.tips)?g.tips:[], avoid:Array.isArray(g.avoid)?g.avoid:[], check:Array.isArray(g.check)?g.check:[], demo:g.demo||'' }
    : parseCustomStyleNote(g.note||'');
  const parts = [];
  if(String(p.intro||'').trim()) parts.push('<div><b>指令</b>：'+esc(p.intro)+'</div>');
  if(p.tips&&p.tips.length) parts.push('<div><b>写法</b>：'+esc(p.tips.join('；'))+'</div>');
  if(p.avoid&&p.avoid.length) parts.push('<div><b>避免</b>：'+esc(p.avoid.join('；'))+'</div>');
  if(p.check&&p.check.length) parts.push('<div><b>自查</b>：'+esc(p.check.join('；'))+'</div>');
  if(String(p.demo||'').trim()) parts.push('<div class="ar-gap-demo"><b>示例</b>：'+esc(p.demo)+'</div>');
  return parts.join('');
}
function gapHtml(c, ci){
  if(!Array.isArray(c.gap) || !c.gap.length) return `<span class="ar-ok">✓ 现有词库即可覆盖，无需新词条</span>`;
  const pending = c.gap.some(g => !((c.tags||[]).includes(g.id) || libHas(g.id)));
  return `<div class="ar-gaptitle">⚠️ 存在词条缺口（共 ${c.gap.length} 项，可逐条或一键全部加入，确认后立即纳入当前配方）</div>
  ${ c.gap.map((g,gi)=>`
    <div class="ai-recipe-gapitem">
      <div class="ar-gaphead"><b>${esc(g.name||'')}</b><span class="muted" style="font-size:11px">${ (AI_CAT_LABEL[g.cat]||g.cat||'custom') }</span></div>
      <div class="ar-gapwhy">${esc(g.reasons||'')}</div>
      <div class="ar-gapnote">${gapFiveHtml(g)}</div>
      ${ g.warning ? `<div class="ar-gapwarn">⚠️ ${esc(g.warning)}</div>` : '' }
      <button type="button" class="btn small ghost" data-ai-recipe-addgap="${ci}__${gi}" ${ (c.tags||[]).includes(g.id)|| libHas(g.id) ? 'disabled' : '' }>＋ 加入词库</button>
    </div>`).join('') }
  ${ c.gap.length>1 ? `<div style="margin-top:6px"><button type="button" class="btn small primary" data-ai-recipe-addgapall="${ci}" ${pending?'':'disabled'} title="仅加入尚未入库的新词条；已入库的自动跳过">＋ 全部加入词库</button></div>` : '' }`;
}
function libHas(id){ return !!writeStyleById(id); }
function prepRecipeList(list){
  if(!Array.isArray(list)) return list;
  list.forEach(c=>{
    if(c && typeof c==='object'){
      c._gapOk = !(Array.isArray(c.gap) ? c.gap : []).some(n =>
        !n || !String(n.note||'').trim() || !(Array.isArray(n.tips) && n.tips.length) ||
        !(Array.isArray(n.avoid) && n.avoid.length) || !(Array.isArray(n.check) && n.check.length) ||
        !String(n.demo||'').trim());
    }
  });
  return list;
}
function recipeScBadge(c){
  return (c && c._gapOk === false) ? `<span class="ai-recipe-sc bad" title="建议的新词条缺少 note/tips/avoid/check/demo 中的维度，入典前请补全">⚠ 词条缺维</span>` : '';
}
function dedupeRecipeList(list){
  if(!Array.isArray(list)) return list;
  const seen = new Set(), out=[];
  list.forEach(c=>{
    if(!c || typeof c!=='object') return;
    const tags = Array.isArray(c.tags)?c.tags.map(String).sort():[];
    const gaps = Array.isArray(c.gap)?c.gap.map(g=>String(g&&g.id||g&&g.name||'')).sort():[];
    const key = JSON.stringify([tags,gaps,String(c.core||c.desc||'').replace(/\s+/g,'').slice(0,240)]);
    if(!seen.has(key)){ seen.add(key); out.push(c); }
  });
  return out;
}
async function aiRecipeProduce(system, user){
  const cfg=getCfg();
  const opt = { maxTokens: clampMaxTokens('recipe'), temperature:(cfg.aiRecipeTemp==null?0.55:Math.min(0.75,Math.max(0.25,Number(cfg.aiRecipeTemp)||0.55))), topP:0.45 };
  const FIX = `\n\n【上一轮质量修正】重新检查输入理解：删除仅靠换形容词、换名称、换顺序形成的重复候选；只保留有实际执行差异的方向。gap 必须来自真实且重要的写作方法缺口；现有词库能覆盖就 gap=null。`;
  const FIX_JSON = `\n\n【上一轮格式修正】上一轮输出无法解析。只输出合法 JSON 数组，不要 markdown、解释或额外文字。`;
  let list = null, lastJsonOk = false;
  for(let attempt=1; attempt<=2; attempt++){
    const sys = attempt>1 ? String(system) + (lastJsonOk ? FIX : FIX_JSON) : system;
    const raw = unwrapAIResult(await callDeepSeek(sys, user, Object.assign({}, opt, {taskKey:'recipe'})));
    let cands = parseAiJsonList(raw);
    cands = dedupeRecipeList(cands);
    cands = prepRecipeList(cands);
    lastJsonOk = Array.isArray(cands) && cands.length > 0;
    if(lastJsonOk){ list = cands; break; }
  }
  if(!list || !list.length) throw new Error('AI 未返回有效配方，请重试');
  return list;
}
async function aiRecipeGen(){
  const ta = $('#aiReDesc'); if(!ta) return;
  const desc = (ta.value||'').trim();
  const hasLine = !!((selectedPolishCandidate()||{}).text || '').trim();
  if(!desc && !hasLine){ toast('请先描述你想要的风格'); return; }
  if(!desc && hasLine){ toast('将仅依据所选方案设计配方'); }
  const out = $('[data-ai-recipe-out]'); if(out) out.innerHTML = `<p class="muted" style="margin:8px 0 0">⏳ AI 正在${hasLine?'依据所选方案':'根据你的描述'}设计候选配方与词条缺口……</p>`;
  const gen = $('[data-ai-recipe-gen]'); if(gen){ gen.disabled = true; gen.textContent = '生成中…'; }
  try{
    // 两阶段链路：理解输入 → 依据理解结果设计配方，避免模型只抓关键词后机械套词库。
    const analysis = await aiRecipeAnalyze(desc);
    const {system, user} = aiRecipePrompt(desc, analysis);
    const list = await aiRecipeProduce(system, user);
    aiRp = { list, hi: 0 };
    addAiHist({ id: aiHistEntryId(), ts: Date.now(), src:'desc', desc: desc || '依据所选方案', list: JSON.parse(JSON.stringify(list)), applied:[] });
  }catch(e){
    aiRp = { list:null, err: (e&&e.message)||'生成失败' };
  }
  if(out) out.innerHTML = aiRecipeResultHtml();
  if(gen){ gen.disabled = false; gen.textContent = '✨ 生成配方'; }
}
function parseAiJsonList(raw){
  let t = String(raw||'').trim();
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if(m) t = m[1].trim();
  try{ const a = JSON.parse(t); return Array.isArray(a)? a : null; }catch(e){
    try{ const i = t.indexOf('['), j = t.lastIndexOf(']'); if(i>=0&&j>i){ const a = JSON.parse(t.slice(i,j+1)); return Array.isArray(a)? a:null; } }catch(e2){}
    return null;
  }
}
function storeRecipeCandidate(c){
  if(!c) return null;
  const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
  cfg.styleCustom.customCombos = cfg.styleCustom.customCombos || [];
  const libIds = writeStyleLib().map(s=>s.id);
  let name = (c.name||'').trim(); if(!name) name = 'AI配方'+(cfg.styleCustom.customCombos.length+1);
  const names = cfg.styleCustom.customCombos.map(x=>x.name);
  let k = 2; while(names.includes(name)) name = (c.name||('AI配方'+(cfg.styleCustom.customCombos.length+1)))+'·'+ (k++);
  let tags = (c.tags||[]).filter(id=> libIds.includes(id));
  (c.gap||[]).forEach(g=>{ if(g && g.id && libIds.includes(g.id) && !tags.includes(g.id)) tags.push(g.id); });
  cfg.styleCustom.customCombos.push({ id:'cu'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), name, desc:(c.desc||''), why: wiseWhyText(c.why||''), tags });
  saveCfg(cfg);
  return { combo:cfg.styleCustom.customCombos[cfg.styleCustom.customCombos.length-1], name };
}
function aiRecipeStore(ci){
  if(!aiRp || !Array.isArray(aiRp.list)) return null;
  return storeRecipeCandidate(aiRp.list[ci]);
}
function applyChosenCandidate(c, opts){
  if(!c) return null;
  const stored = storeRecipeCandidate(c); if(!stored) return null;
  const libIds = writeStyleLib().map(s=>s.id);
  const st2 = writeStyleState();
  const d2 = wsDraftInit();                       // 从生效配置取 tags
  d2.tags = (c.tags||[]).filter(id=> libIds.includes(id));   // 替换而非并集
  (c.gap||[]).forEach(g=>{ if(g && g.id && libIds.includes(g.id) && !d2.tags.includes(g.id)) d2.tags.push(g.id); });
  st2.tags = d2.tags.slice();
  persist();
  wsDraft = null;                                 // 草稿与生效合一 -> 卡片显示「✔已生效」
  if(!opts || opts.render !== false) aiRp = null;
  if(!opts || opts.render !== false){ render(); refreshWsUI(); }
  toast('已应用到「写作风格」：'+stored.name);
  return stored;
}
function aiRecipePick(ci){
  if(!aiRp || !Array.isArray(aiRp.list)) return;
  applyChosenCandidate(aiRp.list[ci]);
}
function aiRecipeApply(idx){
  if(!aiRp || !aiRp.list[idx]) return;
  applyChosenCandidate(aiRp.list[idx], {});
}
function aiRecipeSave(ci){
  if(!aiRp || !Array.isArray(aiRp.list)) return;
  const stored = aiRecipeStore(ci); if(!stored) return;
  toast('已加入「我的配方」（未应用）：'+stored.name);
}
function addGapEntryToLib(g){
  if(!g) return null;
  if(writeStyleById(g.id)) return null;
  const group = ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].includes(g.cat) ? g.cat : 'custom';
  const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
  cfg.styleCustom.added = cfg.styleCustom.added || [];
  const id = (g.id && /^[a-z][a-z0-9_]*$/i.test(g.id)) ? g.id : ('c'+Math.random().toString(36).slice(2,8));
  let finalId = id, mx = 1; const existing = writeStyleLib().map(s=>s.id);
  while(existing.includes(finalId)) finalId = id + (mx++);
  cfg.styleCustom.added.push({ id:finalId, group, name:(g.name||'').trim(), note:(g.note||'').trim(),
    tips:Array.isArray(g.tips)?g.tips.map(x=>String(x||'').trim()).filter(Boolean):[],
    avoid:Array.isArray(g.avoid)?g.avoid.map(x=>String(x||'').trim()).filter(Boolean):[],
    check:Array.isArray(g.check)?g.check.map(x=>String(x||'').trim()).filter(Boolean):[],
    demo:(g.demo||'').trim(), seal:(g.seal===undefined?0:g.seal), warning:(g.warning||'') });
  saveCfg(cfg);
  const d = wsDraftInit(); if(!d.tags.includes(finalId)) d.tags.push(finalId);
  return finalId;
}
function aiRecipeAddGap(key){
  if(!aiRp || !Array.isArray(aiRp.list)) return;
  const [ci, gi] = String(key||'').split('__').map(Number);
  const c = aiRp.list[ci]; if(!c) return;
  const g = (c.gap||[])[gi]; if(!g) return;
  const finalId = addGapEntryToLib(g);
  if(!finalId){ toast('该词条已在词库中'); return; }
  if(c.tags && !c.tags.includes(finalId)) c.tags.push(finalId);
  toast('已加入词库并纳入当前配方：'+(g.name||finalId));
  const out = $('[data-ai-recipe-out]'); if(out) out.innerHTML = aiRecipeResultHtml();
}

function aiHistAddGap(ei, ci, gi){
  const a = getAiHist(); const entry = a[ei]; if(!entry||!Array.isArray(entry.list)) return;
  const c = entry.list[ci]; if(!c) return;
  const g = (c.gap||[])[gi]; if(!g) return;
  const finalId = addGapEntryToLib(g);
  if(!finalId){ toast('该词条已在词库中'); return; }
  toast('已加入词库并纳入当前配方：'+(g.name||finalId));
  const out = $('[data-ai-recipe-out]'); if(out) out.innerHTML = aiRecipeResultHtml();
}
function aiHistAddGapAll(ei, ci){
  const a = getAiHist(); const entry = a[ei]; if(!entry||!Array.isArray(entry.list)) return;
  const c = entry.list[ci]; if(!c||!Array.isArray(c.gap)||!c.gap.length) return;
  let added = 0, skipped = 0;
  c.gap.forEach((g)=>{
    if(!g) return;
    if((c.tags||[]).includes(g.id) || writeStyleById(g.id)){ skipped++; return; }
    if(addGapEntryToLib(g)) added++;
  });
  const out = $('[data-ai-recipe-out]'); if(out) out.innerHTML = aiRecipeResultHtml();
  toast(added ? (skipped ? `已加入 ${added} 条新词条（跳过已入库 ${skipped} 条），并已纳入当前配方` : `已加入 ${added} 条新词条，并已纳入当前配方`) : '这些新词条都已在词库中，无需重复加入');
}

function aiRecipeAddGapAll(ci){
  if(!aiRp || !Array.isArray(aiRp.list)) return;
  const c = aiRp.list[ci]; if(!c || !Array.isArray(c.gap) || !c.gap.length) return;
  let added = 0, skipped = 0;
  c.gap.forEach((g, gi)=>{
    if((c.tags||[]).includes(g.id) || (g && writeStyleById(g.id))){ skipped++; return; }
    aiRecipeAddGap(ci + '__' + gi); added++;
  });
  toast(added ? (skipped ? `已加入 ${added} 条新词条（跳过已入库 ${skipped} 条），并已纳入当前配方` : `已加入 ${added} 条新词条，并已纳入当前配方`) : '这些新词条都已在词库中，无需重复加入');
  const out = $('[data-ai-recipe-out]'); if(out) out.innerHTML = aiRecipeResultHtml();
}

function parseCustomStyleNote(note){
  const tips=[], avoid=[], check=[];
  let intro='', demo='';
  const lines = String(note||'').split(/\n/);
  let mode = null;
  lines.forEach(l=>{
    const t = String(l||'').trim();
    if(!t) return;
    let m;
    if((m=/^指令[:：]\s*(.*)$/.exec(t))){ mode='intro'; if(m[1]) intro=m[1]; return; }
    if((m=/^写法[:：]\s*(.*)$/.exec(t))){ mode='tips'; if(m[1]) tips.push(m[1].replace(/^[①②③④⑤]?[.、）)]?\s*/,'')); return; }
    if((m=/^避免[:：]\s*(.*)$/.exec(t))){ mode='avoid'; if(m[1]) avoid.push(m[1].replace(/^[✗×\-\s]+/,'')); return; }
    if((m=/^自查[:：]\s*(.*)$/.exec(t))){ mode='check'; if(m[1]) check.push(m[1].replace(/^[ ✅◇\-\s]+/,'')); return; }
    if((m=/^示例[:：]\s*(.*)$/.exec(t))){ mode='demo'; if(m[1]) demo=m[1]; return; }
    if(mode==='intro'){ if(!intro) intro=t; }
    else if(mode==='tips') tips.push(t.replace(/^[①②③④⑤]?[.、）)]?\s*/,''));
    else if(mode==='avoid') avoid.push(t.replace(/^[✗×\-\s]+/,''));
    else if(mode==='check') check.push(t.replace(/^[ ✅◇\-\s]+/,''));
    else if(mode==='demo'){ if(!demo) demo=t; }
  });
  return { intro, tips, avoid, check, demo };
}
function writeStyleLib(){
  const c = getCfg().styleCustom || {};
  const notes = (c && c.notes) || {};
  const removed = Array.isArray(c && c.removed) ? c.removed : [];
  const added = Array.isArray(c && c.added) ? c.added : [];
  const base = WRITE_STYLES.filter(s=> !removed.includes(s.id)).map(s=>{
    const cat = s.cat || 'element';
    return { ...s, group:'element', cat, note: notes[s.id] || s.note };
  });
  const customs = added.map(a=>{
    const hasStruc = (Array.isArray(a.tips)&&a.tips.length) || (Array.isArray(a.avoid)&&a.avoid.length) || (Array.isArray(a.check)&&a.check.length);
    const parsed = hasStruc ? { tips:a.tips||[], avoid:a.avoid||[], check:a.check||[], demo:a.demo||'' } : parseCustomStyleNote(a.note||'');
    const cat = ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].includes(a.group) ? a.group : 'custom';
    return { id:a.id, group:'element', name:a.name||'未命名', note:a.note||'', custom:true, cat, tips:parsed.tips||[], avoid:parsed.avoid||[], check:parsed.check||[], demo:parsed.demo||a.demo||'', seal:(a.seal===undefined?0:a.seal), warning:a.warning||'' };
  });
  return base.concat(customs);
}
function writeStyleById(id){
  return writeStyleLib().find(s=> s.id === id) || null;
}
let _idNameMap = null;
function _idName(){
  if(_idNameMap) return _idNameMap;
  const m = new Map();
  writeStyleLib().forEach(s=>{ if(s.id) m.set(s.id, s.name); });
  return (_idNameMap = m);
}
function wiseWhyText(txt){
  if(!txt) return txt;
  const N = _idName();
  return String(txt).replace(/\b[A-Za-z_]\w*\b/g, w=> (N.has(w) ? N.get(w) : w));
}
function curWriteStyle(override){
  if(override && Array.isArray(override.tags)) return { tags: override.tags };
  const s = state.chapterStyle || {};
  return { tags: Array.isArray(s.tags)?s.tags:[] };
}
function wsGroupStyleTags(override){
  const st = curWriteStyle(override);
  const lib = writeStyleLib();
  return (Array.isArray(st.tags) ? st.tags : []).map(id=> lib.find(s=>s.id===id)).filter(Boolean);
}
function wsStyleNoteBlock(items, headTitle, intro){
  if(!items.length) return '';
  const lines = ['【' + headTitle + '（用户指定 · 最高优先指令）】', intro];
  items.forEach(s=>{
    lines.push('· '+s.name+'（总纲）：'+(s.note||''));
    if(Array.isArray(s.tips) && s.tips.length) lines.push('  写法：' + s.tips.map((t,i)=>`${['①','②','③','④','⑤'][i]||(i+1)+'.'} ${t}`).join('；'));
    if(Array.isArray(s.avoid) && s.avoid.length) lines.push('  避免：✗ ' + s.avoid.join('；✗ '));
    if(s.demo) lines.push('  示范写法：「'+s.demo+'」（可模仿其语感，不要照抄句子）');
    if(Array.isArray(s.check) && s.check.length) lines.push('  自查：' + s.check.map(c=>'  '+c).join(' '));
  });
  lines.push('红线：以上风格仅约束表达方式，不得破坏人名/地名/专名一致性，不得违反基础剧情逻辑与人物设定。');
  return '\n\n' + lines.join('\n');
}
function writeStyleNamesBlock(){
  const items = wsGroupStyleTags(null);
  if(!items.length) return '';
  const names = items.map(s=>s.name).join('、');
  return `【写作风格（第一优先）】写作风格：${names}。\n本指令为本章规划的最高优先要求：当其与其它要求冲突时以本指令为准；唯一不可逾越红线：不破坏人名/地名/专名一致性、不违反基础剧情逻辑与人物设定。`;
}



function normalRange(r, fallback){
  const min = (typeof r==='object' && +r.min>0) ? +r.min : fallback.min;
  const max = (typeof r==='object' && +r.max>0) ? +r.max : Math.max(min, fallback.max);
  return { min, max: Math.max(min, max) };
}
function selSize(){
  if(state.chapterRange && (state.chapterRange.min>0 || state.chapterRange.max>0)){
    return { kind:'chapter', range: normalRange(state.chapterRange, {min:80,max:100}) };
  }
  if(state.wordRange && (state.wordRange.min>0 || state.wordRange.max>0)){
    return { kind:'word', range: normalRange(state.wordRange, SIZE_DEFAULT) };
  }
  return { kind:'word', range: SIZE_DEFAULT };
}
const fmtRange = r => `${r.min}-${r.max}`;
function chapterCountVal(){
  const v = +state.chapterCount;
  if(Number.isInteger(v) && v>=1 && v<=200) return v;
  return null;
}
const TEAM_OPTIONS = [
  { id:'solo',  label:'主角线',      n:1, kind:'solo', desc:'一位主角，个人视角贯穿全书' },
  { id:'dual',  label:'双主角',      n:2, kind:'dual', desc:'男女主角同为第一主角，双线叙事、双视角（如互为镜像与对照）' },
  { id:'trio',  label:'铁三角 +2',   n:3, kind:'team', desc:'一主角 + 两位主要配角（如鬼吹灯三人组）' },
  { id:'quad',  label:'四方团队 +3', n:4, kind:'team', desc:'一主角 + 三位主要配角' },
  { id:'quint', label:'五人团 +4',   n:5, kind:'team', desc:'一主角 + 四位主要配角' }
];
function currentTeamShape(){
  const v = state.teamShape || 'solo';
  return TEAM_OPTIONS.find(o => o.id === v) || TEAM_OPTIONS[0];
}
function shapeKind(){ return currentTeamShape().kind; }   // 'solo' | 'dual' | 'team'
function isSolo(){ return shapeKind() === 'solo'; }
function isDualStory(){ return shapeKind() === 'dual'; }
function isTeamStory(){ return shapeKind() === 'team'; }
function narrativeShapeBrief(){
  const k = shapeKind();
  if(k === 'solo') return '';
  if(k === 'dual'){
    return `【叙事主体·双主角】本书为「双主角」叙事：男女主角同为第一主角，各有独立且可并行推进的主线与人物弧线，互为镜像/对照/制衡。两条主线都须被整体叙事真正承接并回收，把某方写成另一方的附庸/陪衬即不合格；双视角切换须有明确触发且受控（通常一方为当下行动 POV，另一方线以各自的场景独立推进，交替呈现），禁止无节制的上帝视角跳转；两位主角之间往往存在核心张力的关系（相知/对峙/救赎/羁绊），这是本书主线的重要组成部分。`;
  }
  const ts = currentTeamShape();
  return `【叙事主体·团队】本书为「${ts.label}」：一位主角 + ${ts.n-1} 位主要配角（核心团共 ${ts.n} 人）。团队必须"缺一不可"——每位成员都应有可被剧情反复调用的独特能力/资源/担当（如解谜、武力、决策、沟通、补给等），谁也无法单独完成核心目标；成员间存在化学反应与暗流（互补、默契、分歧、救场、归队），并在故事推进中被逐一兑现。禁止把成员写成背景板，禁止主角单刷、队友全程挂机。`;
}
function teamShapeBrief(){ return narrativeShapeBrief(); }
function chapterCountHint(){
  const v = chapterCountVal();
  return v ? `全书 ${v} 章` : '请填写全书章节数（1-200，必填）';
}
const OPENING_STRATEGIES = [
  {id:'none', label:'不选择开篇策略', desc:'不使用额外的开篇策略，由本章教案、人物现场与故事自然发展决定开篇方式。'},
  {id:'action', label:'事件直入', desc:'从正在发生的关键事件切入，适合短篇幅、强卖点题材。'},
  {id:'crisis', label:'危机开场', desc:'先给危险、冲突或倒计时，再逐步解释原因。'},
  {id:'result', label:'结果先行', desc:'先展示一个异常结果，再回到前因，适合悬疑与反转。'},
  {id:'normal', label:'日常破局', desc:'先建立人物日常，再让异常事件打破平衡。'},
  {id:'world', label:'世界异常', desc:'从一个反常世界现象切入，用事件带出世界规则。'},
  {id:'secret', label:'人物秘密', desc:'从秘密、隐瞒或关系裂缝切入，先立人物钩子。'},
  {id:'future', label:'未来片段', desc:'用预言、未来片段或结局影子制造问题，再回到当下。'}
];
function openingStrategyDef(id){ return OPENING_STRATEGIES.find(x=>x.id===id); }
function currentOpeningStrategyId(){ return openingStrategyDef(state.openingStrategy) ? state.openingStrategy : 'none'; }
function recommendedOpeningStrategy(){ return 'none'; }
function openingBudget(){
  const n = chapterCountVal() || 0;
  if(n <= 3) return 1;
  if(n <= 8) return 2;
  if(n <= 20) return 3;
  if(n <= 50) return 5;
  return 8;
}
function openingStrategyExecutionCard(i=0){
  if(!isLong() || i!==0) return '';
  const selected = openingStrategyDef(currentOpeningStrategyId());
  if(!selected || selected.id==='none') return '';
  const actual = selected;
  const jobs = {
    crisis:'第一段直接把读者放进正在发生的危机或倒计时中；随后只补最少必要背景。',
    action:'先给一个可视化动作/事件，再在动作中自然带出主角、目标与冲突。',
    normal:'先给一个有生活质感的具体场景，再让一个明确异常打破日常平衡。',
    secret:'先露出人物隐瞒、关系裂缝或异常反应，再让读者追问秘密是什么。',
    world:'先展示一个反常且可感知的世界现象，用人物反应把世界规则带出来。',
    result:'先展示一个已经发生的结果或代价，再倒推出“为什么会走到这里”。',
    future:'先给未来片段/预兆/结局影子，制造一个必须追问的悬念，再切回当下。',
    action2:'先给一个可视化动作/事件，再在动作中自然带出主角、目标与冲突。'
  };
  const job = jobs[actual.id] || actual.desc;
  return `【第一章开篇任务卡】
策略：${actual.label}
开篇职责：${job}
首拍硬目标：首段尽早让读者看见“谁在什么处境中、正在发生什么问题”，并形成一个明确的继续阅读问题。
首章前800字控制：以事件/人物现场为主，背景说明只允许为理解当前动作所必需的最小信息；禁止先写大段世界观说明、人物履历或空泛抒情。
首拍验收：开篇方式必须能被读者从正文实际动作/场景中辨认，而不是只在教案里写“按${actual.label}开篇”。\n作用边界：本任务卡只约束第1章；第2章起不得重复执行本卡。`;
}
function principalOpeningTaskExcerpt(){
  if(currentOpeningStrategyId()==='none') return '';
  const pr=(state.school&&state.school.principal)||{};
  if(pr.raw){
    const raw=String(pr.raw);
    const heads=['## 第一章开篇任务卡','# 第一章开篇任务卡','第一章开篇任务卡'];
    for(const h of heads){ const a=raw.indexOf(h); if(a>=0){ const tail=raw.slice(a); const m=tail.search(/\n#(?!#)|\n## /); const sec=(m>0?tail.slice(0,m):tail.slice(0,3000)).trim(); if(sec) return sec; } }
  }
  return openingStrategyExecutionCard(0);
}
function openingStrategyBrief(){
  if(!isLong()) return '';
  const selected = openingStrategyDef(currentOpeningStrategyId());
  if(!selected || selected.id==='none') return '';
  const n = chapterCountVal() || realChapterCount() || 0;
  return `【开篇策略·仅首章生效】全书${n||'未定'}章。用户主动选择：${selected.label}。${selected.desc}\n权限边界：本策略只决定第1章如何开笔；第2章起不得继续套用“开篇策略”，必须以各章自己的教案与已提供动态状态为唯一开笔依据。\n执行：第1章将所选策略融入实际事件、人物现场和本章教案，不得把策略标签本身写进正文。`;
}
function openingStrategyHtml(){
  if(!isLong()) return '';
  const cur=currentOpeningStrategyId();
  return `<div class="tw-panel" style="margin-bottom:10px"><div class="poly-head"><span class="poly-ic">🚪</span><b>开篇策略</b><span class="poly-rule">可选，不选择也可以</span></div><div class="book-beat-options" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-top:8px">${OPENING_STRATEGIES.map(x=>`<label class="book-beat-card ${x.id===cur?'selected':''}" style="border:2px solid ${x.id===cur?'var(--accent,#4a90e2)':'var(--line,#e0e0e0)'};border-radius:8px;padding:10px;cursor:pointer"><input type="radio" name="openingStrategy" value="${x.id}" ${x.id===cur?'checked':''} style="display:none"><b>${esc(x.label)}</b><div class="muted" style="font-size:12px;line-height:1.5;margin-top:4px">${esc(x.desc)}</div></label>`).join('')}</div><div class="muted" style="font-size:12px;line-height:1.6;margin-top:8px">选择具体策略后，策略仅作用于第1章；选择“不选择开篇策略”时，不启用任何额外开篇策略，也不会由AI自动推荐或替用户决定。</div></div>`;
}
function realChapterCount(){
  const n = (state.outline && Array.isArray(state.outline.chapters)) ? state.outline.chapters.length : 0;
  if(n>0) return n;
  return chapterCountVal();
}
function totalWordsBase(){ return (state.totalWords && +state.totalWords>0) ? +state.totalWords : 300000; }
const totalWan = () => (totalWordsBase()/10000).toLocaleString('en-US');
function estCounterpart(sz){
  const mid = (sz.range.min + sz.range.max) / 2;
  if(!mid) return null;
  return Math.round(totalWordsBase()/mid);
}
function sizeHintText(){
  const hasW = state.wordRange && (state.wordRange.min>0 || state.wordRange.max>0);
  const hasC = state.chapterRange && (state.chapterRange.min>0 || state.chapterRange.max>0);
  if(!hasW && !hasC) return '请先 ☑ 勾选「每章字数」或「全书章节」其中一项，再滑动滑条调整区间。';
  const sz = selSize();
  const cnt = estCounterpart(sz);
  if(sz.kind==='word') return `按每章 ${fmtRange(sz.range)} 字，全书约需 ${cnt} 章。`;
  return `全书约 ${fmtRange(sz.range)} 章，每章据此约 ${cnt} 字。`;
}
function sizeSlider(side, label, lo, hi, step, r, on){
  const dflt = side==='word' ? {min:3000,max:5000} : {min:80,max:100};
  const v = (r && +r.min>0 && +r.max>0) ? {min:+r.min, max:+r.max} : dflt;
  v.min = Math.max(lo, Math.min(hi, v.min));
  v.max = Math.max(lo, Math.min(hi, v.max));
  if(v.max < v.min) v.max = v.min;
  const cls = on ? 'size-block on' : 'size-block';
  const fmt = n => side==='word' ? n.toLocaleString() : String(n);
  return `<div class="${cls}" data-side="${side}">
      <button type="button" class="size-pick" data-pick="${side}" aria-pressed="${on}">
        <span class="size-radio">${on?'✓':''}</span>
        <span class="size-lbl">${label}</span>
      </button>
      <span class="size-val"><b data-dr-val="${side}">${fmt(v.min)} ~ ${fmt(v.max)}</b></span>
      <div class="drs ${on?'':'ds-off'}" data-drs="${side}" data-min="${lo}" data-max="${hi}" data-step="${step}"></div>
      <span class="size-scale">${lo.toLocaleString()} ~ ${hi.toLocaleString()}${side==='word'?' 字':' 章'}</span>
    </div>`;
}
function initDRS(){
  $$('.drs').forEach(drs=>{
    const side = drs.dataset.drs;
    const lo = +drs.dataset.min, hi = +drs.dataset.max, step = +drs.dataset.step;
    const stateR = side==='word' ? state.wordRange : state.chapterRange;
    const dflt = side==='word' ? {min:3000,max:5000} : {min:80,max:100};
    let v0 = (stateR && +stateR.min>0) ? +stateR.min : dflt.min;
    let v1 = (stateR && +stateR.max>0) ? +stateR.max : dflt.max;
    v0 = Math.max(lo, Math.min(hi, v0));
    v1 = Math.max(lo, Math.min(hi, v1));
    if(v1 < v0) v1 = v0;
    if(drs.noUiSlider){ drs.noUiSlider.destroy(); drs.noUiSlider = null; } // render 会重建；先销毁旧实例
    if(drs.classList.contains('ds-off')) return;
    noUiSlider.create(drs, {
      start: [v0, v1],
      connect: true,
      step: step,
      margin: step,
      range: { min: lo, max: hi }
    });
    const lbl = drs.parentElement.querySelector('[data-dr-val="'+side+'"]');
    const fmt = n => side==='word' ? n.toLocaleString() : String(n);
    drs.noUiSlider.on('update', (vals)=>{
      if(lbl){ const a=+vals[0], b=+vals[1]; lbl.textContent = fmt(a)+' ~ '+fmt(b); }
    });
    drs.noUiSlider.on('change', (vals)=>{
      const R = { min: Math.round(+vals[0]), max: Math.round(+vals[1]) };
      if(side==='word'){ state.wordRange=R; state.chapterRange=null; }
      else { state.chapterRange=R; state.wordRange=null; }
      const hint = $('#sizeHint'); if(hint) hint.textContent = sizeHintText();
      persist(); render();
    });
  });
}
function pickSize(side){
  if(side==='word'){
    if(!(state.wordRange && +state.wordRange.min>0)) state.wordRange = { min:3000, max:5000 };
    state.chapterRange = null;
  }else{
    if(!(state.chapterRange && +state.chapterRange.min>0)) state.chapterRange = { min:80, max:100 };
    state.wordRange = null;
  }
  const hint = $('#sizeHint'); if(hint) hint.textContent = sizeHintText();
  persist(); render();
}

function chapterMaxTokens(){
  return clampMaxTokens('chapter');
}
function clampMaxTokens(task){
  const limits = {
    chapter: 12000,     // 正文单次输出上限：仅用于一次正常正文生成
    principal: 16384,   // 校长统筹总控
    teacher: 16384,     // 老师分批教案
    dictmaster: 16384,  // 万物词典生成
    dictEnrich: 8192,   // 词典充实与收编
    glossary: 9216,
    json: 4096,         // JSON 类契约输出
    recipe: 8192,
    polish: 16384,
    plannerAux: 8192,
    continue: 8192,     // 续写补充段
    summary: 2048,      // 梗概/摘要
    strip: 5000         // 速读梗概
  };
  return limits[task] || 4096;
}
function dynamicChapterParams(idx){
  const o = state.outline;
  const base = resolveActiveSpec().chapterTemp;
  const total = (o && o.chapters && o.chapters.length) || 1;
  const ratio = (idx + 1) / total;
  let phase = 'act1';
  const stages = chapterPlanStages(o);
  if(stages.length >= 3){
    if(ratio <= 0.33) phase = 'act1';
    else if(ratio <= 0.66) phase = 'act2';
    else phase = 'act3';
  } else if(ratio > 0.75) phase = 'act3';
  else if(ratio > 0.35) phase = 'act2';
  const map = {
    act1: { temperature: 0.70, topP: 0.95 },   // 立人设：低温稳
    act2: { temperature: 0.85, topP: 0.95 },   // 中段铺陈：稍高激发变化
    act3: { temperature: 0.80, topP: 0.90 }    // 高潮+收束：收紧采样
  };
  const p = map[phase] || map.act2;
  const t = base + (p.temperature - 0.75);
  return {
    temperature: Math.max(0.1, Math.min(1.2, t)),
    topP: p.topP,
    phase
  };
}
function chapterPlanStages(o){
  const outline = o || state.outline || {};
  const chs = Array.isArray(outline.chapters) ? outline.chapters : [];
  const plan = bookStagePlan(chs.length);
  if(!plan.length) return [];
  const stages = []; let cur = 0;
  plan.forEach((p)=>{
    const n = p.n;
    const slice = chs.slice(cur, cur + n);
    const first = cur + 1;
    cur += n;
    stages.push({ first, last: cur, name: p.name, titles: slice.map(c => (c && c.title) ? String(c.title) : '') });
  });
  return stages;
}
function chapterActBlock(i){
  const stages = chapterPlanStages(state.outline);
  if(!stages.length) return '';
  const st = stages.find(s => (i+1) >= s.first && (i+1) <= s.last) || null;
  if(!st) return '';
  return `【本章结构定位】本章（第 ${i+1} 章）落在全书「${currentBookBeatCfg().label}」的「${st.name}」阶段（第 ${st.first}—${st.last} 章）。本章节拍事件须落在此阶段内、服务该阶段走向；属于本阶段的节拍事件必须兑现，不属于本阶段的事件不得越过阶段提前兑现。`;
}
function bookStagePlan(chapterCount){
  const full = beatStageNames();
  const C = Math.floor(chapterCount) || 0;
  const M = full.length;
  if(!C || !M) return [];
  if(C >= M){
    const base = Math.floor(C / M), rem = C % M;
    return full.map((name, si) => ({ name, n: base + (si < rem ? 1 : 0) }));
  }
  const groups = [];
  for(let g = 0; g < C; g++){
    const s = Math.floor(g * M / C);
    const e = Math.floor((g + 1) * M / C) - 1;
    groups.push({ name: mergedBeatName(full, s, e), n: 1 });
  }
  return groups;
}
function mergedBeatName(full, s, e){
  const a = full[s] || full[0];
  if(e <= s) return a;
  return `${a}→${full[e] || a}`;
}
const SCHOOL_GROUP_MIN = 1;
const SCHOOL_GROUP_MAX = 10;    // 老师单人任务超过10章才拆分；不再死板固定8章
function schoolStageGroups(){
  const o = state.outline || {};
  let N = Array.isArray(o.chapters) ? o.chapters.length : 0;
  if(!N){ const c = Math.floor(Number(chapterCountVal())||0); if(c>=1&&c<=200) N = c; }
  if(!N) return [];

  // 少量章节不人为拆老师：10章及以下默认一位老师完成全书。
  if(N <= SCHOOL_GROUP_MAX) return [{stage:'全书', first:1, last:N}];

  // 先尊重全书剧情节拍。bookStagePlan 是全书节拍的权威来源；
  // 每个主要节拍优先由一位老师负责（铺垫/推进/高潮/收尾等），
  // 但不是死板固定4位：实际节拍数由当前小说的全书结构决定。
  let plan = null;
  try{ plan = bookStagePlan(N); }catch(e){ plan = null; }
  const beats = [];
  if(Array.isArray(plan) && plan.length){
    let pos = 1;
    for(const st of plan){
      const n = Math.max(0, Math.floor(st && st.n)||0);
      if(!n) continue;
      beats.push({name:String(st.name||'').trim(), first:pos, last:pos+n-1});
      pos += n;
    }
  }

  // 没有可靠节拍时才退回到按10章拆分；正常情况下不走这里。
  if(!beats.length){
    const groups=[]; let cur=1;
    while(cur<=N){ const last=Math.min(N,cur+SCHOOL_GROUP_MAX-1); groups.push({stage:`第${groups.length+1}组`,first:cur,last}); cur=last+1; }
    return groups;
  }

  // 节拍太碎时，把相邻小节拍合并；只有合并后不超过10章才合并。
  // 这样既保留剧情节拍，又避免出现“1章一个老师”的僵硬安排。
  const merged=[];
  for(const beat of beats){
    const count=beat.last-beat.first+1;
    const prev=merged[merged.length-1];
    if(prev && count < 3 && (prev.last-prev.first+1+count) <= SCHOOL_GROUP_MAX){
      prev.last=beat.last;
      prev.stage = prev.stage && beat.name ? `${prev.stage}→${beat.name}` : (prev.stage||beat.name||'剧情段');
    }else{
      merged.push({stage:beat.name||'剧情段',first:beat.first,last:beat.last});
    }
  }

  // 如果某个剧情节拍超过10章，再在这个节拍内部按10章拆分。
  // 注意：这是“任务量保护”，不是固定的全书分组规则。
  const groups=[];
  for(const g of merged){
    let cur=g.first;
    let part=0;
    while(cur<=g.last){
      const last=Math.min(g.last,cur+SCHOOL_GROUP_MAX-1);
      const span = g.last-g.first+1 > SCHOOL_GROUP_MAX;
      let stage=g.stage||'剧情段';
      if(span){
        part++;
        stage += `·${part}`;
      }
      groups.push({stage,first:cur,last});
      cur=last+1;
    }
  }

  // 极端情况下节拍切分仍造成相邻组都很小，再做一次安全合并；绝不超过10章。
  const compact=[];
  for(const g of groups){
    const prev=compact[compact.length-1];
    const gc=g.last-g.first+1;
    if(prev && gc < 3 && (prev.last-prev.first+1+gc)<=SCHOOL_GROUP_MAX){
      prev.last=g.last;
      prev.stage = prev.stage && g.stage ? `${prev.stage}→${g.stage}` : (prev.stage||g.stage||'剧情段');
    }else compact.push({...g});
  }
  return compact;
}
function schoolGroupsLabel(){
  const g = schoolStageGroups();
  if(!g.length) return '';
  return `${g.length} 位老师 · ` + g.map(x => `老师${g.indexOf(x)+1}（${x.first}-${x.last}章${x.stage?('·'+x.stage):''}）`).join(' · ');
}
function chapterOfPlan(ci){
  if(!state.school) return -1;
  const groups = schoolStageGroups();
  const teachers = state.school.teachers || [];
  for(let gi=0; gi<groups.length; gi++){ const g = groups[gi]; if(teachers[gi] && ci+1>=g.first && ci+1<=g.last) return gi; }
  return -1;
}
function teacherChapterPlan(ci){
  const cc=chapterPlanAuthority(ci); if(cc&&cc.raw) return cc.raw;
  const gi = chapterOfPlan(ci); if(gi < 0) return '';
  const t = state.school.teachers && state.school.teachers[gi]; if(!t || !t.raw) return '';

  const lines = String(t.raw).replace(/\r\n?/g, '\n').split('\n');
  const target = ci + 1;
  const starts = [];
  const headRe = /^\s*(?:#{1,6}\s*)?第\s*(\d+)\s*章(?:\s+.*|\s*(?:《[^》]*》|\([^)]*\)|（[^）]*）|[:：、.．\-–—].*))?\s*$/;

  for(let i=0; i<lines.length; i++){
    const m = lines[i].match(headRe);
    if(m) starts.push({ line:i, ch:parseInt(m[1],10) });
  }

  const pos = starts.findIndex(x => x.ch === target);
  if(pos < 0) return '';
  const begin = starts[pos].line;
  const end = pos + 1 < starts.length ? starts[pos + 1].line : lines.length;
  const block = lines.slice(begin, end).join('\n').trim();
  return block;
}

const SCHOOL_RETRY_MAX = 16;
// 老师阶段完成以老师成功生成教案为准；正文需要章节卡时再从老师 raw 建立。
// 旧逻辑把 canon.teacherAt 版本快照当成唯一闸门；只要快照与版本计数出现一次不同步，
// 即使“读取老师教案”已经能正常读出全部章节，也会被一键开学判定为未完成并停在第4步。
function ssTeacherCardCurrent(card, gi){
  if(!card || card.teacherGi!==gi) return false;
  const v=card.versions||{}; const ss=storyState(); const cur=ss.versions||{};
  return Number(v.dictMaster||0)===Number(cur.dictMaster||0) &&
         Number(v.dictEnrich||0)===Number(cur.dictEnrich||0) &&
         Number(v.principal||0)===Number(cur.principal||0) &&
         String(card.raw||'').trim().length>0;
}
function scTeacherGroupComplete(gi){
  const sc=state.school;
  // 老师是否完成，只看 AI 是否已经成功生成并落地本组完整教案。
  // 章节机器卡是下游使用的数据，不再作为老师完成的门槛。
  return !!(sc && Array.isArray(sc.teachers) && sc.teachers[gi] &&
            String(sc.teachers[gi].raw||'').trim() &&
            !(sc.stale && sc.stale['t'+gi]));
}
function scTeacherPipelineComplete(){
  const groups=schoolStageGroups();
  return groups.length>0 && groups.every((g,gi)=>scTeacherGroupComplete(gi));
}
function scHealState(){
  const sc = state.school;
  if(!sc || typeof sc !== 'object') return;
  sc.finished = sc.finished || {};
  sc.stale = sc.stale || {};
  if(sc.principal && sc.principal.raw && String(sc.principal.raw).trim() && !sc.stale.principal){
    sc.finished.principal = true;
  }
  if(Array.isArray(sc.teachers)){
    sc.teachers.forEach((t, i)=>{
      if(scTeacherGroupComplete(i)) sc.finished['t'+i] = true;
      else delete sc.finished['t'+i];
    });
  }
  if(scTeacherPipelineComplete()) sc.finished.teacher = true;
  else delete sc.finished.teacher;
}
function scState(){
  if(!state.school || typeof state.school !== 'object') state.school = {};
  state.school.finished = state.school.finished || {};
  state.school.failed   = state.school.failed   || {};
  state.school.retries  = state.school.retries  || {};
  state.school.stale    = state.school.stale || {};
  state.school.teachers = Array.isArray(state.school.teachers) ? state.school.teachers : [];
  scHealState();
  return state.school;
}
function scRetry(key){ return scState().retries[key] || 0; }
function setScRetry(key, n){ scState().retries[key] = Math.max(0, Math.min(SCHOOL_RETRY_MAX, n||0)); persist(); }
function scDone(key){ const sc = scState(); return !!(sc && sc.finished && sc.finished[key]); }
function invalidateSchoolDownstream(from){
  const sc=scState(); const ss=storyState(); sc.stale=sc.stale||{}; ss.pipelineVersion=(Number(ss.pipelineVersion)||0)+1;
  if(from==='dictMaster') ss.versions.dictMaster=(Number(ss.versions.dictMaster)||0)+1;
  if(from==='dictEnrich') ss.versions.dictEnrich=(Number(ss.versions.dictEnrich)||0)+1;
  if(from==='principal') ss.versions.principal=(Number(ss.versions.principal)||0)+1;
  const order=['dictMaster','dictEnrich','principal'];
  const idx=order.indexOf(from);
  const reset=[];
  if(from==='dictMaster') reset.push('dictEnrich','principal');
  else if(from==='dictEnrich') reset.push('principal');
  if(from==='dictMaster'||from==='dictEnrich'||from==='principal'){
    const groups=schoolStageGroups(); groups.forEach((g,i)=>reset.push('t'+i));
  }
  reset.forEach(k=>{ delete sc.finished[k]; delete sc.failed[k]; delete sc.retries[k]; sc.stale[k]=true; });
  if(from==='principal') sc.stale.principal=true;
  persist();
}
function scFailed(key){ const sc = scState(); return !scDone(key) && !!(sc && sc.failed && sc.failed[key]); }
function scSetFailed(key, val){
  const sc = scState();
  sc.failed = sc.failed || {};
  sc.failed[key] = !!val;
  if(val && sc.finished) delete sc.finished[key];
  persist();
}
function scMark(key, done){
  const sc = scState();
  sc.finished[key] = !!done;
  if(done){
    // 完成时直接清零，不再通过 setScRetry() 触发第二次全项目 persist。
    sc.retries[key] = 0;
    if(sc.failed) delete sc.failed[key];
  }
  persist();
}
function getSchoolStepStatus(key){
  const sc = scState();
  const run = state._schoolRunning;
  const groups = schoolStageGroups();

  let isDone = false;
  if(key === 'dictMaster') isDone = scDone('dictMaster');
  else if(key === 'dictEnrich') isDone = scDone('dictEnrich');
  else if(key === 'principal') isDone = scDone('principal');
  else if(key === 'teacher'){
    isDone = scTeacherPipelineComplete();
  }

  let isRunning = false;
  if(run){
    if(run.activeKey === key) isRunning = true;
    else if(key === 'teacher' && (run.activeKey === 'teacher' || (typeof run.activeKey === 'string' && run.activeKey.startsWith('t')))){
      isRunning = true;
    }
  }

  let isFailed = !isDone && !isRunning && scFailed(key);

  let status = 'default'; // 蓝色
  if(isRunning) status = 'running'; // 绿色
  else if(isDone) status = 'done'; // 金黄色
  else if(isFailed) status = 'failed'; // 红色

  return { isDone, isRunning, isFailed, status };
}
function scBadge(key){
  const n = scRetry(key);
  return n > 0 ? `<b class="sc-retry-badge" title="本步已自动重试 ${n}/${SCHOOL_RETRY_MAX} 次（失败重试，成功清零）">↻${n}</b>` : '';
}
function scRefreshBadge(el, key){
  if(el && el.querySelectorAll){ el.querySelectorAll('.sc-retry-badge').forEach(x => x.remove()); }
  const n = scRetry(key);
  if(el){
    if(n > 0){ el.insertAdjacentHTML('beforeend', `<b class="sc-retry-badge" title="本步已自动重试 ${n}/${SCHOOL_RETRY_MAX} 次">↻${n}</b>`); el.classList.add('sc-failed'); }
    else if(!scFailed(key)) el.classList.remove('sc-failed');
  }
}
function schoolStepBtn(key, icon, label, title){
  const st = getSchoolStepStatus(key);
  let cls = 'sc-step';
  if(st.isRunning) cls += ' running';
  else if(st.isDone) cls += ' done';
  else if(st.isFailed) cls += ' failed sc-failed';
  else cls += ' sc-step-default';
  return `<button type="button" class="${cls}" data-scp-step="${key}" title="${esc(title||'')}">${icon}<span class="sc-lab">${esc(label)}</span><i class="sc-tick">${st.isDone?'✓':(st.isRunning?'⏳':(st.isFailed?'✕':''))}</i>${scBadge(key)}</button>`;
}
function schoolTeacherBtn(g, i){
  const groups = schoolStageGroups();
  const label = groups.length > 1 ? `老师${i+1}` : '老师';
  const key = 't'+i, done = scDone(key);
  const nCh = g.last - g.first + 1;
  const sc = g.stage || `第${i+1}组`;
  const range = `${g.first}-${g.last} 章`;
  return `<div class="sc-teacher-card ${done?'done':'todo'}">
    <div class="sc-tc-h">
      <span class="sc-tc-no">🎓 ${label}</span>
      <span class="sc-tc-stage">${esc(sc)}</span>
      <span class="sc-tc-ch">${esc(range)} (${nCh}章)</span>
      <span class="sc-tc-st ${done?'done':'todo'}">${done?'✓ 已备':'⏳ 未备'}</span>
    </div>
    <div class="sc-tc-b">
      <button type="button" class="sc-step sc-teacher ${done?'done':''}" data-scp-step="teacherSingle" data-scp-teacher="${i}" title="${label}：负责第 ${g.first}-${g.last} 章（${esc(g.stage||'')}），一次备完全组逐章教案">${done?'重新备课':`🎓 ${label}备课`}${scBadge(key)}</button>
      <button type="button" class="sc-plan-btn" data-scp-plan="${i}" title="${done?('查看'+ label +'本组教案（预览 / 原始稿切换）'):'该组教案尚未生成，先生成后才能阅读'}">📖 读教案</button>
    </div>
  </div>`;
}
function scStyleBrief(){
  const parts = [];
  const tags = (state.chapterStyle && Array.isArray(state.chapterStyle.tags)) ? state.chapterStyle.tags : [];
  if(tags.length) parts.push('写作风格词条：' + tags.join('、'));
  const c=currentCanonicalStoryStrategy(); if(c&&c.candidateName) parts.push('当前有效故事战略：' + String(c.candidateName));
  return parts.length ? parts.join('\n') : '（尚未选配方；由校长依简介与词典自行凝练守则）';
}
function scGlossaryBrief(maxChar){
  const g = (state.outline && state.outline.glossary) || {};
  const lines = [];
  const cap=[]; (g.characters||[]).forEach(x=>{ const nm = `${String((x&&x.name)||'').trim()}${x&&String(x.identity||'').trim()?('·'+String(x.identity).trim()):''}`; if(nm) cap.push(nm); });
  if(cap.length) lines.push('人物：' + cap.slice(0,80).join('、'));
  const pl=[]; (g.places||[]).forEach(x=>{ if(x&&String(x.name||'').trim()) pl.push(`${String(x.name).trim()}${String(x.type||'').trim()?('·'+String(x.type).trim()):''}`); });
  if(pl.length) lines.push('地名：' + pl.slice(0,40).join('、'));
  const pn=[]; (g.propernouns||[]).forEach(x=>{ if(x&&String(x.name||'').trim()) pn.push(String(x.name).trim()); });
  if(pn.length) lines.push('专名/设定：' + pn.slice(0,40).join('、'));
  const wr=[]; (g._worldRules||[]).forEach(x=>{ const r=String((x&&x.rule)||'').trim(); if(r) wr.push(r); });
  if(wr.length) lines.push('世界观规则：\n' + wr.slice(0,30).map(r=>'- '+r).join('\n'));
  const rel=[]; (g._relationshipTable||[]).forEach(x=>{ if(x && x.a && x.b) rel.push(`${x.a}(${x.relation||'关系'})${x.b}`); });
  if(rel.length) lines.push('人物关系：' + rel.slice(0,40).join('、'));
  let s = lines.join('\n');
  const m = maxChar || 7000;
  if(s.length > m) s = s.slice(0, m) + '…（已截断）';
  return s || '（暂无词典，正文将在老师教案中按需自洽）';
}
function scGroupBeats(g, maxChar){
  const plans = (state.outline && Array.isArray(state.outline.chapterPlans)) ? state.outline.chapterPlans : [];
  const out = [];
  for(let i=g.first-1;i<g.last;i++){
    const ch = i+1;
    const title = (state.outline && state.outline.chapters && state.outline.chapters[i] && String(state.outline.chapters[i].title||'').trim()) || '';
    const bt = plans[i] && String(plans[i].beatsText||'').trim();
    out.push(`第${ch}章${title?('《'+title+'》'):''}${bt?('\n'+bt):''}`);
  }
  let s = out.join('\n\n');
  const m = maxChar || 6000;
  if(s.length > m) s = s.slice(0, m) + '…（已截断）';
  return s || '（本章节拍为空，老师依全校守则与本组框架自拟）';
}
function scAllGroupsBeats(groups, maxChar){
  const parts = groups.map((g,i)=>`— 组${i+1}·老师${i+1}（第${g.first}-${g.last}章${g.stage?('·'+g.stage):''}） —\n${scGroupBeats(g, 5000)}`);
  let s = parts.join('\n\n');
  const m = maxChar || 12000;
  if(s.length > m) s = s.slice(0, m) + '…（已截断）';
  return s;
}
function isSchoolFolded(){
  return false;
}
function extractSection(txt, from, until){
  const s = String(txt||'');
  const i = s.indexOf(from); if(i < 0) return '';
  const j = until ? s.indexOf(until, i + from.length) : -1;
  const seg = j > i ? s.slice(i, j) : s.slice(i);
  return seg.trim();
}
function parsePrincipalTitles(raw){
  if(!raw) return [];
  const sec = extractSection(raw, '全书章节标题总表', '') || raw;
  const list = [];
  const lines = String(sec).split('\n');
  for(const line of lines){
    const clean = line.replace(/^[#*\-\s]+/, '').trim();
    const m = clean.match(/^(?:第\s*(\d+)\s*章|(\d+)[\.、\s])\s*[:：、\s]*(?:《([^》]+)》|([^\n\r#*]+))/);
    if(m){
      const num = parseInt(m[1] || m[2], 10);
      const title = String(m[3] || m[4] || '').trim().replace(/^《|》$/g, '');
      if(num > 0 && title && !list.find(x => x.num === num)){
        list.push({ num, title });
      }
    }
  }
  list.sort((a,b) => a.num - b.num);
  return list;
}
function isPrincipalTitlesApplied(){
  const titles = (state.school && state.school.principal && state.school.principal.titles) || [];
  if(!titles.length || !state.outline || !Array.isArray(state.outline.chapters)) return false;
  const oCh = state.outline.chapters;
  return titles.every(t => {
    const ch = oCh[t.num - 1];
    return ch && String(ch.title || '').trim() === t.title;
  });
}
function applyPrincipalTitles(){
  const titles = (state.school && state.school.principal && state.school.principal.titles) || [];
  if(!titles.length){ toast('未检测到校长拟定的标题'); return false; }
  if(!state.outline) state.outline = { chapters: [] };
  if(!Array.isArray(state.outline.chapters)) state.outline.chapters = [];

  const diffs = [];
  titles.forEach(t => {
    const idx = t.num - 1;
    const cur = state.outline.chapters[idx];
    const curTitle = cur && String(cur.title || '').trim();
    if(curTitle && curTitle !== t.title){
      diffs.push({ num: t.num, oldTitle: curTitle, newTitle: t.title });
    }
  });

  if(diffs.length > 0){
    showTitleDiffModal(titles, diffs);
    return true;
  }
  return doApplyTitles(titles);
}

function doApplyTitles(titles, opts){
  opts = opts || {};
  if(!state.outline) state.outline = { chapters: [] };
  if(!Array.isArray(state.outline.chapters)) state.outline.chapters = [];
  const maxNum = Math.max(...titles.map(t=>t.num), state.outline.chapters.length);
  while(state.outline.chapters.length < maxNum){
    state.outline.chapters.push({ title: '' });
  }
  if(!Array.isArray(state.chapters)) state.chapters = [];
  while(state.chapters.length < maxNum){
    state.chapters.push({ title: '', content: '' });
  }
  snapshotTitleBatch('选用校长拟定标题');
  titles.forEach(t => {
    const idx = t.num - 1;
    if(idx >= 0 && idx < state.outline.chapters.length){
      state.outline.chapters[idx].title = t.title;
    }
    if(idx >= 0 && idx < state.chapters.length){
      state.chapters[idx].title = t.title;
    }
  });
  persist();
  render();
  if(!opts.silent) toast(`已成功将校长拟定的 ${titles.length} 章标题应用到全书大纲与章节！`);
  return true;
}

function showTitleDiffModal(titles, diffs){
  const ov = document.createElement('div');
  ov.className = 'gs-overlay';
  ov.innerHTML = `<div class="gs-modal sc-diff-modal" style="max-width:540px;">
    <div class="gs-modal-head">
      <b>✨ 选用校长拟定标题</b>
      <span class="sc-plan-meta muted">检测到 ${diffs.length} 处既有标题变更</span>
      <button class="gs-x" data-diff-close>✕</button>
    </div>
    <div class="sc-diff-body" style="padding:14px 16px;max-height:60vh;overflow-y:auto">
      <div style="font-size:12.5px;color:var(--muted);margin-bottom:12px;line-height:1.5">
        校长拟定共 <b>${titles.length}</b> 章标题。其中 <b>${diffs.length}</b> 处与当前已存在标题不同。请确认是否统一替换为校长拟定标题：
      </div>
      <div class="sc-diff-list" style="display:flex;flex-direction:column;gap:6px">
        ${diffs.map(d => `
          <div class="sc-diff-item" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel2);font-size:12px">
            <span style="font-weight:750;color:var(--accent);min-width:48px">第${d.num}章</span>
            <span style="color:var(--muted);text-decoration:line-through;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(d.oldTitle)}</span>
            <span style="color:var(--accent)">➔</span>
            <span style="color:var(--txt);font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(d.newTitle)}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="sc-diff-foot" style="display:flex;justify-content:flex-end;gap:10px;padding:12px 16px;border-top:1px solid var(--line)">
      <button type="button" class="btn ghost" data-diff-cancel>取消</button>
      <button type="button" class="btn primary" data-diff-confirm>确认替换 (${titles.length}章)</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  const close = ()=> ov.remove();
  ov.querySelector('[data-diff-close]').onclick = close;
  ov.querySelector('[data-diff-cancel]').onclick = close;
  ov.addEventListener('click', e=>{ if(e.target===ov) close(); });
  ov.querySelector('[data-diff-confirm]').onclick = ()=>{
    close();
    doApplyTitles(titles);
  };
}
function scGroupTitles(g){
  const out = [];
  const pTitles = (state.school && state.school.principal && Array.isArray(state.school.principal.titles)) ? state.school.principal.titles : [];
  for(let i=g.first-1;i<g.last;i++){
    const pt = pTitles.find(x=>x.num === i+1);
    const ot = (state.outline && state.outline.chapters && state.outline.chapters[i] && String(state.outline.chapters[i].title||'').trim()) || '';
    const title = (pt && pt.title) ? pt.title : ot;
    out.push(`第${i+1}章 ${title?('《'+title+'》'):'（待命）'}`);
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Principal AI · Prompt-Perfect-style Context Intelligence
 *
 * 目标：不是简单把更多文字塞进 prompt，而是先建立“来源账本”，再让模型
 * 对每一份来源进行语义理解、冲突/权限识别和可执行结论提炼，最后由校长
 * 基于完整理解结果统一决策。这样来源不会因为 UI 摘要函数的 slice() 被静默
 * 丢掉，也不会把不同权限层级的材料混在一起。
 * ─────────────────────────────────────────────────────────────────────────── */
function _ppText(v){
  if(v == null) return '';
  if(typeof v === 'string') return v.trim();
  try{ return JSON.stringify(v, null, 2); }catch(e){ return String(v); }
}
function _ppAddSource(list, id, label, content, priority, authority){
  const text = _ppText(content);
  if(!text) return;
  list.push({id, label, content:text, priority:priority||'normal', authority:authority||'context'});
}
function principalSourceBlocks(groups){
  const o = state.outline || {};
  const out = [];
  _ppAddSource(out,'original_idea','用户原始构想',state.idea,'highest','user');
  _ppAddSource(out,'nav_beacon','导航灯塔 / 用户锚点',o.navBeacon,'highest','user');
  _ppAddSource(out,'outline_core','现有全书大纲核心资料',{title:o.title,logline:o.logline,tone:o.tone,chapters:o.chapters},'highest','outline');
  const canonical=currentCanonicalStoryStrategy();
  if(canonical){ _ppAddSource(out,'canonical_story_strategy','当前有效故事战略·唯一权威',canonical,'highest','canonical_story_strategy'); }
  _ppAddSource(out,'chapter_plans','既有《全书节拍》/章节规划',o.chapterPlans,'high','planning');
  _ppAddSource(out,'global_timeline','全书时间线 / 时间锚点',{
    timeline:o.globalTimeline || o.timeline || null,
    factCard:o._factCard ? {timeline:o._factCard.timeline,timeAnchors:o._factCard.timeAnchors,timeAudit:o._factCard.timeAudit} : null
  },'high','planning');
  _ppAddSource(out,'microbeat','当前全书微拍总纲与节奏体系',(()=>{ try{return currentBeatCfg&&currentBeatCfg();}catch(e){return null;} })(),'high','system_config');
  _ppAddSource(out,'writing_style','写作风格与表达配方',{chapterStyle:state.chapterStyle,styleBrief:scStyleBrief()},'high','user_selected');
  _ppAddSource(out,'glossary','全量万物词典（完整对象，不再按字符截断）',o.glossary,'highest','canon');
  _ppAddSource(out,'story_state','正文状态 / 事实账 / 权限链',o._storyState,'high','observed_state');
  _ppAddSource(out,'chapters_written','已写正文（用于连续性与状态理解）',
    (state.chapters||[]).map((c,i)=>({chapter:i+1,title:c&&c.title||'',content:c&&c.content||'',confirmed:!!(c&&c.confirmed)})),
    'high','observed_state');
  _ppAddSource(out,'school_groups','校长即将管理的老师分组',groups,'high','planning');
  return out;
}
function principalSourceLedger(blocks){
  return blocks.map((b,i)=>`【来源${i+1}｜${b.id}｜${b.label}｜权限=${b.authority}｜优先级=${b.priority}】\n${b.content}`).join('\n\n');
}
function principalContextChunks(text, maxChars){
  const cap=maxChars||28000, s=String(text||'');
  if(!s) return [];
  const chunks=[]; let start=0;
  while(start<s.length){
    let end=Math.min(s.length,start+cap);
    if(end<s.length){
      const cut=Math.max(s.lastIndexOf('\n\n',end),s.lastIndexOf('\n',end));
      if(cut>start+cap*0.65) end=cut;
    }
    chunks.push(s.slice(start,end)); start=end;
  }
  return chunks;
}
const PRINCIPAL_CONTEXT_SYS = `你是“校长AI”的上下文理解器，不负责直接规划全书。\n你的任务是像专业 Prompt Engineering 工具一样，把注入的来源内容全部读懂，再形成可供校长决策的“语义理解层”。\n\n硬规则：\n1. 不得凭空增加来源中没有的事实。\n2. 必须区分用户选择、世界事实/词典、既有规划、正文已观测事实、风格要求和系统配置。\n3. 发现冲突时，不要自行裁决；记录“冲突点 + 涉及来源 + 权限关系”。\n4. 不要因为内容很长而只关注最后一段；每个来源都要覆盖。\n5. 提炼与校长职责直接相关的：核心意图、不可违背约束、关键事实、人物/关系、阶段任务、节奏要求、时间约束、因果约束、连续性状态、风格规则、待决策事项。\n6. 输出应高度压缩但信息密度高，保留足以让后续校长做出准确决策的细节。\n7. 明确标记“来源证据”，方便最终校长回溯。\n\n输出格式：\n# 来源理解\n## 核心意图\n## 不可违背约束\n## 已成立事实\n## 结构与节奏\n## 人物与关系\n## 时间与连续性\n## 风格与表达\n## 来源冲突/不确定项\n## 校长需要处理的决策点`;
async function buildPrincipalContextUnderstanding(blocks, signal){
  const ledger=principalSourceLedger(blocks);
  const chunks=principalContextChunks(ledger,28000);
  const results=[];
  for(let i=0;i<chunks.length;i++){
    const user=`【来源总账第 ${i+1}/${chunks.length} 段】\n${chunks[i]}\n\n请完整理解本段涉及的所有来源，并输出结构化“来源理解”。如果一个来源跨越多个段落，请结合本段出现的上下文，不要臆造缺失部分。`;
    const res=await callDeepSeek(PRINCIPAL_CONTEXT_SYS,user,{temperature:0.15,topP:0.2,maxTokens:8192,signal,taskKey:'principal'});
    results.push(`【上下文理解块 ${i+1}/${chunks.length}】\n${unwrapAIResult(res)}`);
  }
  return {ledger,understanding:results.join('\n\n')};
}
function principalFinalContext(baseUser, understanding, blocks){
  const manifest=(blocks||[]).map((b,i)=>`来源${i+1}：${b.id}｜${b.label}｜权限=${b.authority}｜优先级=${b.priority}｜原文字符数=${String(b.content||'').length}`).join('\n');
  return `${baseUser}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n【Prompt-Perfect式上下文理解层｜模型已先阅读全部来源】\n以下不是新的事实来源，而是对上方来源总账逐段阅读后的语义理解结果。\n校长必须回到来源总账核对关键事实；理解层不得凌驾于原始来源权限之上。\n\n${understanding}\n\n【来源清单（原文均已在前置理解阶段逐段读取）】\n${manifest}\n\n【最终决策要求】\n- 先综合全部来源，再开始规划；不要只依据某一个来源。\n- 用户明确选择/要求、词典已成立事实、正文已观测事实不得被下游规划擅自改写。\n- 当来源冲突时，按既有权限链处理并在规划中保持边界，不要偷偷“修正”原始事实。\n- 每一项重要规划结论都应能追溯到一个或多个来源。\n- 只输出原校长系统规定的最终 Markdown 契约。`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Chapter Ending System v1
// 叙事功能 × 表现形式 × 强度 × 钩子需求；不是随机池。
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CHAPTER_ENDING_FUNCTIONS = [
  {key:'completion', label:'正常完成式', desc:'本章任务/事件完成后自然停止，不额外制造钩子。'},
  {key:'afterglow', label:'情绪余韵式', desc:'事件完成后留下情绪、关系或意义的余波。'},
  {key:'relationship_change', label:'关系变化式', desc:'人物关系发生可感知变化，以关系落点结束。'},
  {key:'decision', label:'决定式', desc:'人物完成关键选择，以决定本身作为停止点。'},
  {key:'action_launch', label:'行动启动式', desc:'新的行动已经开始，章末停在行动启动点。'},
  {key:'revelation', label:'信息揭示式', desc:'关键事实/信息在章末成立，改变读者理解。'},
  {key:'tension_hold', label:'冲突停住式', desc:'停在已经成立的对峙/危险/未决事实本身，不追加下一步期待。'},
  {key:'unresolved_conflict', label:'冲突未决式', desc:'冲突暂未解决，停在真实对峙或僵持点。'},
  {key:'reversal', label:'反转式', desc:'最后信息/事实重新解释前文，但不得凭空新增关键事实。'},
  {key:'open', label:'留白式', desc:'有意不解释或不总结，让读者停留在最后一个有效事件。'},
  {key:'consequence', label:'后果式', desc:'重大行动后的直接后果成为本章最后落点。'},
  {key:'comic_button', label:'喜剧包袱/反讽式', desc:'以已建立的笑点、反讽或错位作为落点。'},
  {key:'scene_cut', label:'场景切断式', desc:'在自然场景断点结束，不额外解释。'},
  {key:'explicit_commentary', label:'直言评述式', desc:'以简洁、符合文风的作者/叙事评述正常收束。'}
];
const CHAPTER_ENDING_FORMS = [
  {key:'action',label:'动作'}, {key:'dialogue',label:'对白'}, {key:'information',label:'信息'},
  {key:'environment',label:'环境'}, {key:'psychology',label:'心理'}, {key:'object',label:'物件'},
  {key:'scene_cut',label:'场景切断'}, {key:'silence',label:'沉默'}, {key:'event_result',label:'事件结果'},
  {key:'consequence',label:'直接后果'}
];
const CHAPTER_ENDING_BANNED_TEMPLATES = [
  '不知道明天会发生什么','期待着明天','期待未来','新的惊喜','夕阳西下','新的一天又将开始',
  '一切才刚刚开始','未来等待着他们','明天一切都会不同','不知道接下来会有什么惊喜'
];
function chapterEndingFunctionText(){ return CHAPTER_ENDING_FUNCTIONS.map(x=>`${x.key}=${x.label}：${x.desc}`).join('\n'); }
function chapterEndingFormText(){ return CHAPTER_ENDING_FORMS.map(x=>`${x.key}=${x.label}`).join('、'); }
function parseChapterEndingPlanFromCard(card, i){
  const text=String(card||'');
  const get=(names)=>{ for(const n of names){ const re=new RegExp(`(?:^|\\n)\\s*[-*]?\\s*${escapeRegExp(n)}\\s*[：:]\\s*([^\\n]+)`,'i'); const m=text.match(re); if(m) return m[1].trim(); } return ''; };
  const fn=get(['主要结尾功能','结尾主要功能','本章结尾功能']);
  const form=get(['推荐表现形式','具体收尾方式','结尾表现形式','表现形式','允许的表现形式']);
  const intensity=get(['结尾强度','章末强度']);
  const hook='否';
  const forbidden=get(['结尾禁止','禁止结尾','禁止的结尾形式','禁止追加']);
  const reason=get(['结尾选择理由','结尾策略理由']);
  const lastEffectiveEvent=get(['最后有效事件','最后有效剧情节点','章末最后有效事件']);
  const diversityNote=get(['重复风险','多样性提示','结尾重复风险']);
  const secondary=get(['次级结尾功能','结尾次级功能']);
  return {
    version:CHAPTER_ENDING_CONTRACT_VERSION, chapter:Number(i)+1,
    endingFunction:fn || 'completion', secondaryFunction:secondary || '',
    intensity: Number.isFinite(parseInt(intensity,10)) ? Math.max(0,Math.min(4,parseInt(intensity,10))) : 0,
    hook:false, hookRaw:'统一禁用留钩子感觉',
    form:form || '自然停止', reason:reason || '服从本章最后一个有效事件与题材，不额外制造万能收尾。',
    lastEffectiveEvent:lastEffectiveEvent || '',
    forbidden:CHAPTER_ENDING_CONTRACT.feelingFailures.slice(),
    diversityNote:diversityNote || '避免与近期章节机械重复；不以“明天/夕阳/期待/惊喜”作为默认结尾。',
    source:'principal_chapter_task', sourceHash:String(text).length
  };
}
function buildChapterEndingPlansFromPrincipal(raw, chapterCount){
  const cards=principalChapterTaskCards(raw), out={};
  const n=Number(chapterCount||0) || Object.keys(cards).length;
  for(let i=1;i<=n;i++){
    const card=String(cards[i]||'').trim();
    if(card) out[i]=parseChapterEndingPlanFromCard(card,i-1);
  }
  return out;
}
function chapterEndingPlanFor(i){
  const n=Number(i)+1;
  const stored=state.chapterEndingPlans && state.chapterEndingPlans[n];
  if(stored && typeof stored==='object') return stored;
  // 仅用于兼容旧项目：首次读取时把既有校长章级卡一次性结构化缓存；不是重新启动校长。
  const raw=state.school?.principal?.raw || scState()?.principal?.raw || '';
  const card=principalChapterTask(i);
  if(!card) return null;
  const plan=parseChapterEndingPlanFromCard(card,i);
  state.chapterEndingPlans=state.chapterEndingPlans||{}; state.chapterEndingPlans[n]=plan;
  persist();
  return plan;
}
function chapterEndingDecisionBlock(i){
  const d=chapterEndingPlanFor(i);
  const c=normalizeChapterEndingContract(d);
  return `【唯一章末契约实例｜${c.version}】
- 口令：${c.command}
- 本章停止点：${c.lastEffectiveEvent||'本章最后一个已经发生的有效变化'}
- 表现形式：${c.form}
- 功能：${c.endingFunction}
- hook：false（不存在“为了下一章而留钩子”的授权）
- 正向示范：${c.positiveExamples.join('；')}
- 感觉级失败：${c.forbiddenFeeling.join('；')}
执行：正文只把停止点写自然；不要追加任何未来导向情绪、悬念吊桥或读者期待。审计只验证这一契约。`;
}

function recentChapterEndingHistory(i, count=8){
  const out=[];
  const start=Math.max(0,i-count);
  for(let k=start;k<i;k++){
    const c=(state.chapters||[])[k]; if(!c||!String(c.content||'').trim()) continue;
    const tail=String(c.content).trim().slice(-900);
    let form='';
    if(/[“”"].{1,80}[。！？!?]$/.test(tail)) form='对白/语言';
    else if(/(夕阳|黄昏|夜色|月光|晨光|天色|风|雨|阳光)/.test(tail)) form='环境';
    else if(/(没有说话|沉默|无言|没有回答|不再开口)/.test(tail)) form='沉默';
    else if(/(决定|答应|拒绝|转身|推开|走进|离开|拿起|放下|关上|打开)/.test(tail)) form='动作/决定';
    else form='事件/叙述';
    const fr=chapterEndingFeelingAudit(tail);
    out.push({chapter:k+1,form,templateRisk:fr.fail?'high':'low',feelingRisk:fr,tail:tail.slice(-180)});
  }
  return out;
}
function chapterEndingAuditText(i){
  const h=recentChapterEndingHistory(i,8);
  if(!h.length) return '【结尾多样性审计】暂无前章样本；仍禁止万能结尾模板。';
  return `【结尾多样性审计｜最近${h.length}章】\n${h.map(x=>`第${x.chapter}章：表现=${x.form}｜模板风险=${x.templateRisk}｜末尾片段=${x.tail.replace(/\s+/g,' ').slice(0,140)}`).join('\n')}\n规则：唯一主判据是CHAPTER_ENDING_CONTRACT的“禁止留钩子的感觉”；词汇命中只能作为辅助证据，不得单独决定结尾是否失败。`;
}
function endingTemplateGuardText(){ return chapterEndingContractText(); }

const PRINCIPAL_SYS = `你是一位统筹一部长篇小说的「校长」（全校总舵手）。

你的唯一核心职责，是把用户已经确定的作品方向、世界事实、写作风格和全书资源，组织成一套能够稳定传递给「老师 → 正文AI」执行的全书级规划。

你不是老师。
你不是正文作家。

你负责：
「全书为什么这样走、每个阶段负责什么、每章为什么存在、各组之间如何连续、全校写作纪律是什么」。

老师负责：
「这一章具体写什么、怎么形成事件链、人物怎样行动、每一拍怎样推进」。

正文AI负责：
「把老师已经确定的内容写成真正的小说」。

因此必须始终遵守：

用户决定作品的根本方向与不可违背的选择；
词典决定已经成立的世界事实；
校长决定全书级结构与章节战略；
老师决定逐章施工方案；
正文AI负责文学表达与现场执行。

任何层级都不得越权覆盖上层已经成立的事实。

核心原则：

校长负责“方向与结构”；
老师负责“施工与因果”；
正文负责“文学呈现”。

━━━━━━━━━━━━━━━━━━
【一、最高权限链】
━━━━━━━━━━━━━━━━━━

严格遵守以下优先级：

L0 · 用户确定的作品事实、世界观、作品定位、写作风格与明确要求
L1 · 全量万物词典中已经确认的世界事实
L2 · 校长全书规划 + 本章章级导演/授权任务卡
L3 · 老师在授权边界内形成的本章教案
L4 · 正文AI文学表达

其中：

L0 是最高优先级。

你不得因为自己认为某种方向“更高级”“更专业”“更商业”而修改用户已经明确选择的方向。

词典已经确认的事实，不得被你重新定义。

你的全书规划必须能够被老师执行。

老师在不违反L0、L1和校长全书规划的情况下，负责把章节功能转译成具体事件与行动。

正文AI不得为了文学效果重新设计主线、重新定义核心人物、重新改变章节功能。

━━━━━━━━━━━━━━━━━━
【二、你的职责边界】
━━━━━━━━━━━━━━━━━━

你必须负责：

1. 全书整体方向
2. 剧情阶段划分
3. 各阶段核心任务
4. 各章在全书中的战略功能
5. 各章之间的宏观因果关系
6. 各组之间的承接关系
7. 全书节奏纪律
8. 风格的全书级执行原则
9. 全书级因果纪律
10. 全书级连续性纪律
11. 第一章开篇任务卡
12. 各组组级框架
13. 全书章节标题
14. 每章章级导演/授权任务卡
15. 全书级风险审计

你不得负责：

- 逐章完整教案
- 逐章详细事件列表
- 逐章详细人物调度
- 逐章逐拍施工方案
- 逐章正文
- 逐章对白
- 替老师决定每个节拍的具体执行方式
- 替正文AI进行文学描写

尤其禁止把“组级框架”偷偷写成“老师教案”。

校长的输出必须停留在：

「战略约束 + 章节功能 + 章级授权任务卡 + 组级结构 + 必要接口」

而不是：

「逐章施工图」。

章级任务卡必须规定“必须实现什么、允许调用什么、哪些信息开放、哪些事情禁止发生”，但不得规定老师逐拍如何施工。

━━━━━━━━━━━━━━━━━━
【三、校长与老师的正确分工】
━━━━━━━━━━━━━━━━━━

校长回答：

为什么这一章存在？
这一章在全书什么位置？
这一章必须完成什么宏观任务？
这一章完成后，全书状态应该发生什么战略变化？
这一组章节整体承担什么阶段任务？
这一组如何承接上一组并把故事交给下一组？

老师回答：

这一章具体发生什么？
人物怎样行动？
事件如何发生？
每个节拍怎样推进？
为什么这个事件现在发生？
人物凭什么知道、做到？
上一拍怎样推动下一拍？
章末状态是什么？

正文AI回答：

这些已经确定的内容如何写得生动、自然、具有文学性？

因此：

校长不得因为担心老师执行不好，就提前代写老师教案。

如果某个问题属于逐章执行问题，应当把它写成「老师必须遵守的原则」，而不是直接替老师设计具体剧情。

━━━━━━━━━━━━━━━━━━
【四、全书战略规划】
━━━━━━━━━━━━━━━━━━

你必须先从全书层面判断：

1. 故事真正的主线是什么；
2. 主线最终要发生怎样的变化；
3. 故事可以划分成哪些主要阶段；
4. 每个阶段解决什么问题；
5. 每个阶段制造什么新的问题；
6. 阶段之间为什么能够自然连接；
7. 哪些人物关系是长期推动力；
8. 哪些信息/秘密/目标是长期动力；
9. 哪些阶段必须形成明确高潮；
10. 每个阶段结束后，故事状态发生了什么不可逆变化。

阶段不是简单的“前期/中期/后期”。

每个阶段必须有：

- 阶段目标
- 阶段核心矛盾
- 阶段推进方向
- 阶段主要情绪
- 阶段高潮
- 阶段结算
- 向下一阶段移交的状态

禁止把阶段写成空泛标签。

例如：

错误：
“第一阶段：人物成长。”

正确：
“第一阶段通过X问题迫使人物从A状态进入B状态；阶段高潮使人物失去/获得X，并因此不得不进入下一阶段。”

━━━━━━━━━━━━━━━━━━
【五、章节功能与章级授权：校长定义“为什么存在 + 本章允许沿哪条轨道走”】
━━━━━━━━━━━━━━━━━━

每章必须拥有清晰的全书级功能。

可以使用：

- 引入
- 推进
- 转折
- 高潮
- 收束

也可以根据实际故事使用更准确的功能名称。

但是：

章节功能 ≠ 本章具体事件。

同时，章级授权 ≠ 本章完整教案。

校长可以进一步规定：本章必须从什么状态进入什么状态、必须推进哪些核心变化、可以调用哪些已经成立的人物/地点/线索、哪些信息暂不开放、哪些创造属于越权。

例如：

“第12章：推进”

只说明：

这一章的主要战略任务是让主线从状态A进入状态B。

并不意味着：

校长必须提前规定第12章具体发生五个事件。

老师之后负责把这个战略任务转译为具体节拍。

因此：

校长定义：
“这一章必须让什么发生变化，以及为了实现这个变化，哪些事实/人物/线索可以被授权调用，哪些不能。”

老师定义：
“在授权边界内，通过什么事件让这个变化发生。”

正文定义：
“怎样把这些事件写成小说。”

━━━━━━━━━━━━━━━━━━
【六、章节战略目标】
━━━━━━━━━━━━━━━━━━

每一章必须提供一句明确的“章节目标”。

章节目标必须描述：

本章结束时，全书状态发生了什么重要变化。

例如：

- 主角从不知道某事变成知道某事；
- 某关系从A状态进入B状态；
- 某目标从不可执行变成开始执行；
- 某冲突从潜伏变成公开；
- 某人物第一次被迫做出选择；
- 某阶段矛盾正式进入高潮轨道。

禁止使用：

“推动剧情”
“丰富人物”
“增加冲突”
“制造悬念”

这种无法执行的空泛目标。

━━━━━━━━━━━━━━━━━━
【七、章级导演/授权任务卡】
━━━━━━━━━━━━━━━━━━

每一章都必须先生成一张“章级导演/授权任务卡”，再交给老师施工。

任务卡不是教案，不写完整事件列表、不写逐拍动作、不写对白。
任务卡必须回答：

- 本章战略目标：章末全书状态必须发生什么变化；
- 起始状态：本章开始时人物、地点、时间、已知信息与未决问题；
- 终止状态：本章结束后必须成立的状态；
- 必须推进：本章不可省略的核心变化/剧情结果；
- 必须继承：上一章交接来的真实状态、悬念、人物状态；
- 允许人物：本章可以调用的正式人物；
- 允许地点：本章可以调用的已成立地点；
- 允许道具/资源：本章可以调用的既有资源；
- 允许线索：本章可以使用或推进的已成立线索；
- 信息边界：本章人物知道什么、不知道什么，哪些未来信息不得提前开放；
- 禁止事项：不得新增或改变的核心人物、关系、秘密、地点、道具、线索及因果；
- 因果边界：重大事件必须满足哪些前置条件；
- 老师创造空间：允许老师自行设计的中间事件、节拍、调查路径和文学化施工范围；
- 待确认项：任何需要新增核心人物/关键情报/新世界事实的需求，只能作为待确认项提出，不得直接成立。

【章级授权硬规则】
1. 任务卡中的“允许人物/地点/道具/线索”是本章核心剧情资源白名单；名单外若要承担关键剧情功能，必须先进入待确认项。
2. 普通路人、老人、摊贩、店小二等只能作为一次性环境人物存在；不得凭空获得核心情报，不得改变主线。
3. 任何人物掌握核心人物住址、秘密、关系、身份、主线线索等信息，必须有可追溯的信息来源链。
4. 校长不得为了让任务卡完整而虚构词典不存在的核心人物或关键事实；无法授权的内容写入“待确认项”。
5. 老师不得把待确认项直接升级为既成事实。

━━━━━━━━━━━━━━━━━━
【七A、唯一章末口令】
${chapterEndingContractText()}
校长只生成一次本章停止点/结尾功能数据；不得另设“留钩子”“制造悬念”“读者期待”等第二套章末规则。

【七B、校长章级结尾决策边界】
━━━━━━━━━━━━━━━━━━
校长决定“为什么在这里停、停时读者应处于什么叙事状态”；老师决定“最后一个有效事件怎样完成”；正文决定“怎样写得自然”。
如果本章核心变化已经完成且没有下一步必要动作，优先允许正常停止。禁止为了制造连续感而追加无依据的新期待。

【七、全书微拍与节奏体系】
━━━━━━━━━━━━━━━━━━

【全书微拍总纲与节奏体系】是全书统一节拍来源。

必须尊重当前实际配置。

如果当前是：

微三拍 → 老师每章使用3个逻辑节拍；
微五拍 → 老师每章使用5个逻辑节拍；
微七拍 → 老师每章使用7个逻辑节拍；
双拍 → 老师每章使用2个逻辑节拍；
其他配置 → 严格按照实际配置。

不得擅自规定固定“5-8拍”。

但必须注意：

校长负责“节拍纪律”，
老师负责“节拍内容”。

校长需要明确：

本微拍体系应该在全书中解决什么节奏问题；
不同阶段应该如何利用节拍；
什么情况下节拍必须形成推进；
什么情况下允许转折；
什么情况下必须形成回报；
什么情况下必须收束。

不要在校长层面提前替每章写完整节拍。

━━━━━━━━━━━━━━━━━━
【八、节拍 ≠ 时间】
━━━━━━━━━━━━━━━━━━

必须明确：

节拍回答：

“故事发生了什么变化？”

时间回答：

“这些变化发生在什么时候？”

禁止把：

第1天早晨
第1天晚上
第2天清晨
第2天下午

当成故事节拍。

校长可以制定全书级时间纪律：

- 不得无原因跨时间；
- 不得无原因跨地点；
- 不得发生时间倒退；
- 重大时间跨度必须有剧情原因；
- 时间必须服务故事，而不是制造流水账。

但具体到某一章的：

起点时间；
终点时间；
具体时间锚点；
时间推进方式；

属于老师教案层。

━━━━━━━━━━━━━━━━━━
【九、全书因果闭环原则】
━━━━━━━━━━━━━━━━━━

你负责制定全书级因果纪律，但不得替老师完成每章具体因果施工。

所有重大事件必须具备“发生资格”。

包括：

发现
获得
遇见
得知
抵达
突破
转折
救援
反转
关键人物出现
关键道具出现
新能力出现
新地点成为关键节点

必须能够追溯到已经成立的条件。

全书禁止依赖：

“突然发现”
“突然知道”
“突然获得”
“突然出现”
“恰好拥有”
“无缘无故抵达”
“没有前置条件的反转”。

如果某事件确实需要发生，而前置条件尚未成立：

由老师在教案层负责补足。

校长只需确保：

“该事件不能在没有发生资格的情况下被强行写入章节规划。”

━━━━━━━━━━━━━━━━━━
【十、章间连续性】
━━━━━━━━━━━━━━━━━━

全书必须形成连续状态链。

每一章结束后，应当能够明确：

人物在哪里；
人物处于什么状态；
正在做什么；
知道什么；
不知道什么；
哪些目标完成；
哪些目标未完成；
哪些矛盾被改变；
哪些悬念继续存在。

下一章必须从已经成立的状态自然继续。

禁止：

- 瞬移
- 无解释换地点
- 无解释跨时间
- 人物无来源出现
- 人物状态倒退
- 上一章刚结束的事情在下一章被重新初始化
- 为了新规划而篡改已经成立的正文事实

但是：

“章间连续性”是校长的战略要求；

“下一章第一个节拍具体如何承接”是老师的施工任务。

校长不得把承接细节写成逐章教案。

━━━━━━━━━━━━━━━━━━
【十一、阶段之间的交接】
━━━━━━━━━━━━━━━━━━

每个老师组代表一个连续的阶段/阶段片段。

校长必须明确：

上一组最终把故事交到什么状态；
下一组接到什么状态；
两组之间最大的连续性要求是什么；
下一组必须继承哪些核心悬念；
下一组必须继承哪些人物状态；
哪些东西已经结算，不能重新开启。

但不要提前写下一组第一章完整剧情。

组级交接只需要回答：

“交接时故事处于什么状态，以及下一组必须承接什么。”

老师再负责把这个状态转译为具体章节教案。

━━━━━━━━━━━━━━━━━━
【十二、词典与创造权限】
━━━━━━━━━━━━━━━━━━

【全量万物词典】是全书共享事实资源。

已经确定的：

- 人物身份
- 人物关系
- 地点
- 专名
- 世界规则
- 关键道具
- 固定术语
- 历史事实
- 核心组织

不得被校长擅自改写。

老师可以在这些事实基础上创造中间剧情。

正文AI可以自然增加：

- 一次性路人
- 环境细节
- 普通陈设
- 不影响主线的临时细节

但是：

任何会长期影响剧情的核心人物、核心地点、核心道具、核心组织、核心规则、核心关系，不得由正文AI临时创造。

如果确实需要新增：

必须在规划/教案层明确标记。

校长尤其不能偷偷把“为了让剧情更顺”而创造的新核心事实伪装成已经存在的词典事实。

━━━━━━━━━━━━━━━━━━
【十三、风格裁决】
━━━━━━━━━━━━━━━━━━

校长负责把用户选择的写作风格转化成“全校可执行规则”。

不得只输出：

高级
电影感
细腻
治愈
克制
幽默
有张力

这些形容词。

必须进一步回答：

1. 叙事怎么写；
2. 对白怎么写；
3. 人物怎么写；
4. 节奏怎么写；
5. 场景怎么写；
6. 情绪怎么写；
7. 特殊机制怎么写；
8. 什么绝对不能写；
9. 什么容易导致风格跑偏；
10. 正文完成后如何检查是否符合风格。

必须尊重用户已经选择的风格。

不得为了所谓“文学升级”偷偷改变用户风格。

如果多种风格/配方发生冲突：

必须明确：
- 主风格
- 辅助机制
- 剧情机制
- 情绪机制
- 冲突时的优先级

最终必须让老师和正文AI知道：

“怎样写才算符合这部作品自己的风格”。

━━━━━━━━━━━━━━━━━━
【十四、全校写作纪律】
━━━━━━━━━━━━━━━━━━

校长必须建立一套真正能够执行的纪律。

至少覆盖：

### 1. 世界事实纪律
不能改写已经成立的核心事实。

### 2. 因果纪律
重大事件必须有前置条件。

### 3. 连续性纪律
章节之间必须保持状态连续。

### 4. 节拍纪律
节拍必须按照当前配置执行。

### 5. 时间纪律
时间必须真实流动，不得用时间流水账冒充剧情推进。

### 6. 人物纪律
核心人物行为必须符合已经成立的人物事实与当前状态。

### 7. 风格纪律
正文不能因为追求刺激而偏离作品风格。

### 8. 章节边界纪律
每章必须在自己的功能完成后停止，不得提前写下一章。

### 9. 创造权限纪律
核心新事实不能由正文AI临时创造。

### 10. 信息纪律
人物只能知道自己有理由知道的信息。

━━━━━━━━━━━━━━━━━━
【十五、第一章开篇任务卡】
━━━━━━━━━━━━━━━━━━

如果存在第1章，必须单独输出：

# 第一章开篇任务卡

这是校长唯一允许深入到“首章执行入口”的地方。

但仍然不能写完整第一章教案。

必须包含：

### 策略
本书为什么选择这种开篇方式。

### 首拍动作/场景
读者真正看到的第一件事情是什么。

### 前800字必须建立
必须让读者尽快获得哪些关键认知：

- 谁
- 在哪里
- 正处于什么状态
- 当前发生什么
- 为什么值得继续读

### 禁止事项
第一章开篇最容易犯的错误。

### 继续阅读问题
第一章必须让读者产生什么明确的问题/期待。

注意：

开篇任务卡不是第一章教案。

禁止在这里提前写：

- 第一章完整事件链
- 第一章所有人物出场
- 第一章完整节拍
- 第一章正文
- 大段对白

老师收到开篇任务卡后，必须自行将其转换成可执行的第一章教案。

━━━━━━━━━━━━━━━━━━
【十六、组级框架】
━━━━━━━━━━━━━━━━━━

每个老师组必须输出组级框架。

组级框架必须包含：

- 起止章节
- 所属剧情阶段
- 本组阶段任务
- 每章功能
- 每章一句战略目标
- 整组节奏
- 整组情绪曲线
- 承接上一组
- 启动下一组
- 重点调用词典资源
- 本组核心风险

但是：

组级框架只能到“章节战略功能”级。

禁止输出：

- 逐章推进骨架
- 逐章完整事件链
- 逐章详细人物调度
- 逐章详细场景
- 逐章机器教案
- 逐章正文

例如：

正确：

“第15章：推进主角调查线，使其从怀疑进入主动验证。”

错误：

“第15章第一拍让主角去书房发现X，第二拍遇到Y，第三拍……”

后者属于老师。

━━━━━━━━━━━━━━━━━━
【十七、全书章节标题】
━━━━━━━━━━━━━━━━━━

必须为所有章节提供正式标题。

标题必须：

- 服务于阶段推进；
- 能体现章节核心功能；
- 避免同质化；
- 不提前泄露不应该公开的核心答案；
- 不只是重复章节事件；
- 不使用大量机械化模板。

标题应该具有文学性，同时能够帮助老师和正文识别本章在全书中的位置。

━━━━━━━━━━━━━━━━━━
【十八、章节边界硬规则】
━━━━━━━━━━━━━━━━━━

校长必须要求整个下游链路遵守：

每一章都有自己的任务边界。

章节完成后：

不得继续设计下一章具体剧情；
不得把下一章事件写进本章；
不得把下一阶段高潮提前写进本章；
不得让正文AI根据“悬念”自行扩写下一章事件。

章末必须形成一个真实、稳定、可承接的状态。

注意：

校长只负责制定这一条全书级纪律。

具体的：

人物最终在哪里；
正在做什么；
知道什么；
不知道什么；
完成什么；
未完成什么；
下一章从什么状态开始；

由老师在本章教案中具体确定。

━━━━━━━━━━━━━━━━━━
【十九、全书级风险审计】
━━━━━━━━━━━━━━━━━━

校长必须主动检查：

1. 是否存在章节功能重复；
2. 是否存在阶段之间断裂；
3. 是否存在长期悬念过早解决；
4. 是否存在核心冲突长期没有推进；
5. 是否存在人物长期没有有效行动；
6. 是否存在大量章节只有信息没有事件变化；
7. 是否存在大量事件没有因果资格；
8. 是否存在时间线冲突；
9. 是否存在人物关系倒退；
10. 是否存在词典事实被偷偷修改；
11. 是否存在风格逐渐跑偏；
12. 是否存在高潮提前消耗；
13. 是否存在章节末尾没有真实状态变化；
14. 是否存在老师需要承担但校长没有交代清楚的章节战略任务。

如果发现风险：

提出“规则级修正”。

不要直接代替老师重写逐章教案。

━━━━━━━━━━━━━━━━━━
【二十、输出任务】
━━━━━━━━━━━━━━━━━━

必须完整输出以下四大部分：

① 全校写作守则

必须包含：

## 配方锚点
## 风格融合总纲
## 风格施工规则
## 风格验收标准
## 全书节拍纪律
## 因果闭环总纲
## 章间连续性纪律
## 时间纪律
## 人物与词典纪律
## 章节边界纪律
## 可执行纪律

② 第一章开篇任务卡

如果存在第1章：

## 第一章开篇任务卡

包含：

- 策略
- 首拍动作/场景
- 前800字必须建立
- 禁止事项
- 继续阅读问题

如果不存在第1章，则不要虚构。

③ 各章章级导演/授权任务卡

必须覆盖全部章节。每章使用独立小节：

## 第X章章级导演/授权任务卡
- 战略目标：……
- 起始状态：……
- 终止状态：……
- 必须推进：……
- 必须继承：……
- 允许人物：……
- 允许地点：……
- 允许道具/资源：……
- 允许线索：……
- 信息边界：……
- 禁止事项：……
- 因果边界：……
- 老师创造空间：……
- 待确认项：……

要求：只能做章级授权，不得写成完整教案。

④ 各组组级框架

每组必须完整输出：

## 组X · 老师X

- 起止章节：……
- 所属阶段：……
- 本组阶段任务：……
- 每章功能：……
- 每章战略目标：……
- 整组节奏与情绪曲线：……
- 承接上一组：……
- 启动下一组：……
- 重点调用词典资源：……
- 本组核心风险：……

注意：

“每章功能”和“每章战略目标”必须是战略级描述。

禁止写成逐章教案。

④ 全书章节标题总表

必须覆盖所有章节：

第1章《……》
第2章《……》
……
第N章《……》

━━━━━━━━━━━━━━━━━━
【二十一、最终输出契约】
━━━━━━━━━━━━━━━━━━

只输出纯文本 Markdown。

禁止：

- JSON
- 三反引号代码块
- 开场白
- 结束语
- “好的”
- “以下是”
- 解释自己如何完成任务
- 逐章完整教案
- 逐章机器章节卡
- 正文
- 大段文学范文
- 虚构输入中不存在的事实

必须严格使用以下结构：

# 全校写作守则

## 配方锚点
……

## 风格融合总纲
……

## 风格施工规则
……

## 风格验收标准
……

## 全书节拍纪律
……

## 因果闭环总纲
……

## 章间连续性纪律
……

## 时间纪律
……

## 人物与词典纪律
……

## 章节边界纪律
……

## 可执行纪律
……

# 第一章开篇任务卡

策略：……
首拍动作/场景：……
前800字必须建立：……
禁止事项：……
继续阅读问题：……

# 各章章级导演/授权任务卡

## 第1章章级导演/授权任务卡
- 战略目标：……
- 起始状态：……
- 终止状态：……
- 必须推进：……
- 必须继承：……
- 允许人物：……
- 允许地点：……
- 允许道具/资源：……
- 允许线索：……
- 信息边界：……
- 禁止事项：……
- 因果边界：……
- 老师创造空间：……
- 待确认项：……

……

# 各组组级框架

## 组1 · 老师1
- 起止章节：……
- 所属阶段：……
- 本组阶段任务：……
- 每章功能：……
- 每章战略目标：……
- 整组节奏与情绪曲线：……
- 承接上一组：……
- 启动下一组：……
- 重点调用词典资源：……
- 本组核心风险：……

## 组2 · 老师2
……

# 全书章节标题总表

第1章《……》
第2章《……》
……
第N章《……》

━━━━━━━━━━━━━━━━━━
【二十二、最终自检】
━━━━━━━━━━━━━━━━━━

输出前必须自行检查：

□ 有没有修改用户已经确定的世界事实？
□ 有没有修改用户已经确定的风格？
□ 有没有越权替老师写逐章教案？
□ 有没有越权替正文AI写正文？
□ 每章功能是否清楚？
□ 每章战略目标是否可执行？
□ 各组之间是否存在清晰交接？
□ 节拍体系是否遵守当前实际配置？
□ 有没有把时间流水账当节拍？
□ 因果原则是否明确？
□ 核心事实是否严格尊重词典？
□ 第一章任务卡是否足够具体但没有越权成为教案？
□ 是否为每一章生成章级导演/授权任务卡？
□ 每章授权是否包含人物/地点/线索/信息边界与禁止事项？
□ 是否禁止把未授权核心人物或关键情报直接写成事实？
□ 是否明确要求章节在自己的边界停止？
□ 是否避免提前设计下一章具体剧情？
□ 标题是否完整覆盖所有章节？
□ 输出是否严格符合规定结构？

如果某项不满足，先在内部修正，再输出最终结果。

最终目标只有一个：

让「校长 → 老师 → 正文AI」形成清晰、稳定、不可越权的三级生产链：

校长定方向与结构，
老师定章节施工方案，
正文AI把方案写成小说。

任何一级都不得偷偷替代另一级。`

const PRINCIPAL_FOLDED_SYS = `【已废弃】不得启用校长兼任老师模式。无论章节数多少，校长只负责全校统筹，老师必须独立生成机器教案。`;



function buildPrincipalUser(groups){
  const o = state.outline || {};
  const lines = [];
  lines.push(`【长篇小说】${o.title||'（未定书名）'}`);
  lines.push(`【全校章节数】${(o.chapters||[]).length || chapterCountVal() || '未知'} 章`);
  lines.push(storyStateCanonBlock());
  const _opening = openingStrategyBrief(); if(_opening) lines.push(_opening);
  const _openingTask = openingStrategyExecutionCard(0); if(_openingTask) lines.push(_openingTask);
  const bc = currentBeatCfg ? currentBeatCfg() : null;
  if(bc && bc.label){
    const beatDetail = (bc.types||[]).map((t, idx) => `  ${idx+1}. 【${t.label}】(type=${t.key})：${t.note || ''} ${t.aiDirective ? `[执行指令: ${t.aiDirective}]` : ''}`).join('\n');
    lines.push(`【全书微拍总纲与节奏体系】\n微拍型号：${bc.label} (${bc.emoji || ''})\n节拍说明：${bc.desc || ''}\n逐拍节奏结构定义：\n${beatDetail}`);
  }
  lines.push('【写作风格/配方摘要】\n' + scStyleBrief());
  lines.push('【各组对应范围】\n' + groups.map((g,i)=>`组${i+1}·老师${i+1}（第${g.first}-${g.last}章${g.stage?('·'+g.stage):''}）`).join('\n'));
  lines.push('【原始来源完整性声明】\n校长上下文理解器将在最终决策前逐段阅读“来源总账”中的全部来源内容；不得以摘要函数、字符截断或单一来源代替完整理解。');
  return lines.join('\n\n');
}

async function genPrincipal(btn, opts){
  if(!isLong()){ toast('仅长篇小说模式支持校长统筹'); return false; }
  const groups = schoolStageGroups(); if(!groups.length){ toast('请先填写章节数，才能分组'); return false; }
  if(!scDone('dictEnrich')){ toast('校长必须接收完整词典后再统筹，请先完成“词典充实”'); return false; }
  invalidateSchoolDownstream('principal');
  scState();
  const sys = PRINCIPAL_SYS;
  markAIRunning('principal'); if(btn) busy(btn, true, '校长统筹中…'); if(btn && btn.parentNode) showStopBtn(btn.parentNode);
  try{
    const spec = resolveActiveSpec('principal');
    const temp = (spec && spec.principalTemp != null) ? spec.principalTemp : 0.4;
    for(let attempt=1; attempt<=SCHOOL_RETRY_MAX; attempt++){
      try{
        const sourceBlocks = principalSourceBlocks(groups);
        const ctxPack = await buildPrincipalContextUnderstanding(sourceBlocks, _abortCtl?.signal);
        const principalUser = principalFinalContext(buildPrincipalUser(groups), ctxPack.understanding, sourceBlocks);
        const txt = await callAIGuarded('principal', sys, principalUser, {}, { temperature:temp, maxTokens:16384, signal:_abortCtl?.signal });
        if(!txt || !String(txt||'').trim()){ setScRetry('principal', attempt); scRefreshBadge(btn,'principal'); throw new Error('校长返回空'); }
        const sc = scState();
        const titles = parsePrincipalTitles(txt);
        if(titles && titles.length){
          doApplyTitles(titles, { silent: true });
        }
        storyState().canon.principalAt=Date.now(); storyState().versions.principal=Number(storyState().versions.principal||0)+1; storyState().pipelineVersion=(Number(storyState().pipelineVersion)||0)+1;
        delete sc.stale.principal;
        sc.principal = { ts:Date.now(), folded:false, groups: groups.map((g,gi)=>({ gi, stage:g.stage, first:g.first, last:g.last })), raw:String(txt), titles, chapterTasks: principalChapterTaskCards(String(txt)), chapterEndingPlans: buildChapterEndingPlansFromPrincipal(String(txt), state.chapterCount || state.outline?.chapters?.length || 0) };
        state.chapterEndingPlans = JSON.parse(JSON.stringify(sc.principal.chapterEndingPlans || {})); storyState().docs=storyState().docs||{}; storyState().docs.schoolPlan={version:storyState().versions.principal,source:'principal',ts:Date.now(),groups:sc.principal.groups,titles,chapterTasks:sc.principal.chapterTasks};
        state.outline._principalChapterTasks = sc.principal.chapterTasks || {};
        scMark('principal', true);
        markAIDone('principal');
        render();
        toast(`校长统筹完成：${groups.length} 位老师分组 + 全校守则 + 组级框架 + ${titles.length}章标题已自动定稿应用！`);
        playDoneSound('single');
        return true;
      }catch(e){
        if(e && e.name === 'AbortError'){ setScRetry('principal', attempt); toast('已停止校长统筹'); return false; }
        setScRetry('principal', attempt); scRefreshBadge(btn,'principal');
        if(attempt < SCHOOL_RETRY_MAX) await new Promise(r=>setTimeout(r,1500));
      }
    }
    toast(`校长统筹失败（已自动重试 ${SCHOOL_RETRY_MAX} 次）`);
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='principal');
    hideStopBtn(); if(btn) busy(btn,false); scRefreshBadge(btn,'principal');
  }
}

const TEACHER_SYS = `你是一位长篇小说「老师」（任课教师）。

你的职责是：
根据校长已经确定的全书规划以及自己负责章节的“章级导演/授权任务卡”，为自己负责的一整组章节逐章备课，生成可以直接交给「正文作家」执行的本章写作教案。

老师不是全书共同编剧。你只拥有当前组及必要前后接口所需的信息；你不得因为知道全书意图就自行补写未来剧情或建立新的世界事实。

你不是正文作家。
你不能代写正文。
你也不能重新设计全书方向。

你的工作是：
把校长的宏观任务，转译成每一章清晰、可执行、具有连续因果和明确节拍结构的施工方案。

━━━━━━━━━━━━━━━━━━
【一、权限层级】
━━━━━━━━━━━━━━━━━━

必须遵守：

L0 · 用户确定的世界事实、写作风格
L1 · 校长的全书规划、阶段结构、章节功能、章级导演/授权任务卡与风格裁决
L2 · 老师自己的本章教案
L3 · 正文作家的文学表达

因此：

校长决定：
“这一章为什么存在、它在全书哪里、它要完成什么。”

老师决定：
“这一章具体发生什么、按照什么节拍推进、人物怎样行动、怎样承接、怎样收束。”

正文决定：
“把这些内容怎样写得生动。”

老师不得：

- 改写校长已经确定的章节功能；
- 重新选择全书风格；
- 推翻已经成立的世界事实；
- 替正文作家写成品小说；
- 为了节拍漂亮而制造没有因果依据的事件。

━━━━━━━━━━━━━━━━━━
【一A、老师的知识与创造权限收口】
━━━━━━━━━━━━━━━━━━

1. 你只接收：当前负责章节组的组级框架、当前每章章级导演/授权任务卡、必要的上一组末状态、当前组已生成正文状态，以及为执行当前组明确需要的词典资料。
2. 不默认读取完整 storyBlueprint、全书未来故事节拍、其他组老师完整教案或与当前组无关的未来秘密。
3. 章级任务卡中的“允许人物/地点/道具/线索”是当前章核心剧情资源白名单。
4. 名单外普通路人可临时出现，但只能承担环境或非关键功能；一旦承担关键情报、关键线索或主线转折功能，就不再是普通路人。
5. 新核心人物、关键人物关系、核心秘密、关键地点、关键道具、主线线索不得由老师直接确认为事实。只能写入“待确认项”，等待词典/校长授权。
6. 任何人物获得关键情报，都必须说明“为什么知道、从谁那里知道、该信息何时成立、可靠性如何”。没有来源链就不能把该情报写成事实。
7. 不得利用自己对全书终局或未来剧情的推断，提前创造现在不存在的人物、关系、秘密或线索。
8. 你拥有很大的“中间施工创造权”：可以设计调查路径、普通事件、节拍衔接、动作、场景组织和非关键过场，但这些创造不能突破章级授权边界。
9. 如果授权不足以完成本章目标，不得硬补；优先输出待确认项或选择另一条已有依据的施工路径。

━━━━━━━━━━━━━━━━━━
【一B、章节结尾施工权限】
${chapterEndingContractText()}
老师只能施工本章最后一个已经发生的有效事件，并把它自然写到停止点。不得自行决定“留钩子”、不得添加未来期待、前瞻、读者等待感。老师教案中的章末字段只记录：停止点、功能、表现形式、禁止追加项；“是否留钩子”永久为否。

【二、教学观】
━━━━━━━━━━━━━━━━━━

教案是“写作施工图”，不是正文。

教案必须让正文作家知道：

- 从哪里开始；
- 本章核心目标是什么；
- 依次完成哪些节拍；
- 每个节拍发生什么；
- 人物为什么这么做；
- 前一个事件怎样推动下一个事件；
- 本章情绪如何变化；
- 最终形成什么章末状态；
- 下一章从什么状态接着写。

但是：

不得直接代写小说。

禁止输出成段文学范文。

允许使用极短的示范性描述，但只能用于说明：

- 情绪方向；
- 动作方向；
- 场景方向；
- 对白功能。

不能把正文写出来。

━━━━━━━━━━━━━━━━━━
【三、节拍是本章唯一骨架】
━━━━━━━━━━━━━━━━━━

【当前章节微拍】是本章推进骨架的唯一节奏骨架。

必须严格按照当前实际节拍配置组织。

如果当前配置是：

微三拍：
就输出3个逻辑节拍。

微五拍：
就输出5个逻辑节拍。

微七拍：
就输出7个逻辑节拍。

双拍：
就输出2个逻辑节拍。

其他配置：
严格按照实际配置的节拍数量与顺序。

禁止固定写成“5-8个环节”。

禁止自行增加或减少节拍。

禁止把一个节拍拆成几个时间段。

禁止把时间段当作节拍。

━━━━━━━━━━━━━━━━━━
【四、节拍的真正含义】
━━━━━━━━━━━━━━━━━━

每一个节拍都必须回答：

1. 这一拍的戏剧功能是什么？
2. 这一拍发生了什么具体事件？
3. 人物采取了什么行动？
4. 产生了什么新的信息、阻力、关系变化或结果？
5. 为什么这个结果能够自然进入下一拍？

节拍必须形成：

前一拍产生条件
→ 下一拍利用这个条件
→ 再产生新的变化
→ 最终形成阶段性结果
→ 收束并留下下一章接口。

禁止：

“①发生A；②然后发生B；③然后发生C”

这种没有因果连接的事件清单。

━━━━━━━━━━━━━━━━━━
【五、时间不是骨架】
━━━━━━━━━━━━━━━━━━

这是硬规则：

【节拍是故事骨架；时间只是辅助状态。】

必须给出：

【剧情时间落点】
起点=……
终点=……

如果本章确实跨日：
可以增加：

【时间推进安排】

但时间推进安排只是为了说明：
人物如何从起点走到终点。

它不能取代节拍。

禁止把教案写成：

① 第1日黄昏
② 第1日晚
③ 第2日清晨
④ 第2日下午
⑤ 第3日夜

这种“时间流水账”。

正确结构应该是：

① 开篇铺垫：……
   【时间锚点：第1日傍晚】

② 冲突推进：……
   【时间锚点：第1日晚】

③ 意外转折：……
   【时间锚点：第2日清晨】

也就是说：

先写“发生了什么”，
再用时间作为辅助锚点。

不得反过来先写时间再寻找事件。

如果没有真实跨日：
不要人为制造时间跨度。

如果跨日：
必须有真实的时间流逝原因，例如：

- 赶路
- 等待
- 训练
- 调查
- 休息
- 关系变化
- 环境变化
- 生活节律
- 已经发生的事件自然导致的时间流逝

禁止为了满足“时间完整”而硬塞无意义日程。

━━━━━━━━━━━━━━━━━━
【六、每个节拍必须深度融合当前微拍定义】
━━━━━━━━━━━━━━━━━━

当前微拍配置会提供：

- type
- label
- note
- aiDirective

必须认真执行这些定义。

不能只把 label 当标题。

例如“意外转折”不能只是：

“这里发生一个转折。”

而必须体现：

- 先建立人物原本预期；
- 再发生计划之外的变化；
- 变化能够被前文已经成立的条件解释；
- 变化会真实改变后续行动。

“阶段高潮”必须形成：
本章前面累积的矛盾、目标或信息，在这一拍得到一次明确回报。

“收束+悬念”必须：
完成当前阶段结算，同时留下下一章继续行动的理由。

━━━━━━━━━━━━━━━━━━
【七、时间与节拍的正确组合】
━━━━━━━━━━━━━━━━━━

每拍推荐使用：

【节拍名称】
核心事件：
人物行动：
变化/回报：
承接下一拍：
时间锚点：

但：

时间锚点是辅助字段。

不能把时间写成这一拍的主体。

禁止：

“第2日早晨，人物……”

优先：

“人物终于决定主动追查……【时间：第2日早晨】”

━━━━━━━━━━━━━━━━━━
【八、词典与创造权限】
━━━━━━━━━━━━━━━━━━

【全量万物词典】是已经批准的世界资源池。

优先从词典调用：

- 人物
- 地点
- 道具
- 组织
- 规则
- 固定术语
- 已成立关系

允许在教案层创造：

- 中间事件
- 行动方式
- 场景细节
- 不影响主线的一次性辅助人物
- 临时环境细节

但不得偷偷改变核心事实。

如果创造的新：

- 人物
- 地点
- 专名
- 道具
- 组织
- 世界规则
- 核心关系

会持续影响后续剧情，必须明确标记并纳入教案，使后续阶段能够识别。

禁止正文临时创造一个会改变全书事实的核心实体。

━━━━━━━━━━━━━━━━━━
【九、因果闭环】
━━━━━━━━━━━━━━━━━━

每章重大事件都必须能够回答：

① 为什么现在发生？
② 为什么在这里发生？
③ 为什么由这个人物触发？
④ 人物凭什么知道？
⑤ 人物凭什么做到？
⑥ 前面哪个事件把它推到了这里？

如果回答不了：
不要直接安排结果。

必须：

- 补前置条件；
- 调整行动路径；
- 改成逐步获得；
- 或降低事件确定性。

禁止：

突然发现
突然知道
突然拥有
突然遇见
突然抵达
突然突破
突然获得关键道具
突然出现关键人物

偶然事件可以存在，但必须有合理触发。

━━━━━━━━━━━━━━━━━━
【十、上一章承接】
━━━━━━━━━━━━━━━━━━

你没有上一章完整正文，因此不能假装知道上一章所有文字细节。

但是：

如果输入提供上一章收束状态、上一位老师的交接棒或动态状态：

本章第①拍必须能够承接这些真实状态。

承接要求：

- 不篡改上一章已经成立的物理位置；
- 不篡改人物已经完成或未完成的动作；
- 不篡改已经知道/不知道的信息；
- 不凭空跳时间；
- 不凭空换地点；
- 不提前解决上一章留下的悬念。

“承上启下弹性”只能意味着：
允许第①拍在承接之后自然进入本章任务。

绝不意味着：
可以自由改写上一章结尾。

━━━━━━━━━━━━━━━━━━
【十一、第1章特殊规则】
━━━━━━━━━━━━━━━━━━

如果本组包含第1章：

必须严格执行校长的【第一章开篇任务卡】。

第1章教案第①拍必须真正落实：

- 首拍动作；
- 首场景；
- 前800字要建立的读者认知；
- 禁止事项；
- 继续阅读问题。

禁止只写：

“按照开篇引擎执行。”

必须真正转换成可执行教案。

━━━━━━━━━━━━━━━━━━
【十二、章节功能】
━━━━━━━━━━━━━━━━━━

校长提供的：

引入 / 推进 / 转折 / 高潮 / 收束

属于本章的宏观功能。

当前微拍则是完成这个宏观功能的具体路径。

两者关系：

【章节功能】= 本章为什么存在
【微拍结构】= 本章怎样完成

不得用微拍推翻章节功能。

例如：

本章功能是“推进”，
可以有“意外转折”和“阶段高潮”，
但这些都应该服务于本章总体推进任务。

━━━━━━━━━━━━━━━━━━
【十三、本章情绪】
━━━━━━━━━━━━━━━━━━

必须说明：

- 开场情绪
- 中段变化
- 高潮状态
- 收束状态
- 本章实际情绪状态如何落地，不把读者推向等待下一章

禁止把情绪写成：

“紧张→更紧张→高潮→悬念”

必须说明情绪为什么发生变化。

━━━━━━━━━━━━━━━━━━
【十四、本章出场名单】
━━━━━━━━━━━━━━━━━━

本章核心人物必须明确。

名单只列：

- 有名字；
- 有实际剧情功能；
- 有持续或重要戏份；
- 对本章事件产生实际影响

的人物。

不得把纯环境路人塞入核心名单。

正文可以自然添加：

- 店小二
- 摊贩
- 茶客
- 更夫
- 传令兵
- 前台侍者
- 其他一次性环境人物

但这些人物：

- 不推动主线；
- 不承担关键情报；
- 不改变主要事件；
- 不在后续继续出现；
- 不需要进入词典。

核心人物则必须以教案名单为准。

━━━━━━━━━━━━━━━━━━
【十五、时间合同】
━━━━━━━━━━━━━━━━━━

必须给出：

剧情时间落点：
起点=……
终点=……

两者必须与实际剧情跨度一致。

如果本章只是一个晚上：
不要写成三天。

如果本章确实跨五天：
必须让剧情中真实存在这五天的流逝。

但：

“跨五天”不意味着要写五天流水账。

可以通过：

- 行动
- 赶路
- 等待
- 训练
- 调查
- 关系变化
- 生活节律
- 场景变化
- 一句自然的跳时

体现时间。

时间只服务于故事。

━━━━━━━━━━━━━━━━━━
【十六、章末状态】
━━━━━━━━━━━━━━━━━━

必须明确：

- 人物最终在哪里；
- 正在做什么；
- 已经知道什么；
- 还不知道什么；
- 哪个目标已经完成；
- 哪个目标未完成；
- 留下什么新的行动理由；
- 下一章从什么状态接续。

章末状态必须真实可接。

禁止只写：

“留下悬念。”

必须说明：

“什么状态被定格，以及为什么下一章必须继续。”

━━━━━━━━━━━━━━━━━━
【十七、连续性】
━━━━━━━━━━━━━━━━━━

每章必须说明：

- 承接上一章什么；
- 本章改变了什么；
- 下一章可以从哪里接。

本章内部每个节拍也必须存在：

“上一拍结果 → 下一拍行动”的因果连接。

不得出现：

事件A结束
→ 没有原因
→ 突然进入事件B。

━━━━━━━━━━━━━━━━━━
【章节边界硬契约 · 给正文AI的停止信号】
━━━━━━━━━━━━━━━━━━
每一章必须同时产出【本章推进骨架】与【章末状态】。
【章末状态】是本章的硬停止点：最后一个节拍完成并抵达该状态后，不得再设计任何新的剧情事件。
严禁把以下内容写进任何一章的骨架、最后节拍或章末状态：
- 下一章的具体事件、行动、场景；
- 下一阶段的具体剧情；
- 阶段高潮后续规划；
- 老师之间的后台交接说明。

特别是文末的“# 本阶段向下一阶段移交的3大关键悬念与阶段高潮成果”是【后台交接区】，不是最后一章内容。它必须在所有章节教案完全结束后单独输出，且不得复述为最后一章的剧情。

【机器解析边界】后台交接区从标题行开始即与章节卡分离。不得依赖正文AI自行理解边界；输出时必须保持该标题为独立 Markdown 一级/多级标题。

━━━━━━━━━━━━━━━━━━
【十八、输出契约】
━━━━━━━━━━━━━━━━━━

只输出纯文本 Markdown。

禁止：

- JSON
- 代码围栏
- 开场白
- 结束语
- 解释
- 正文范文

每章必须严格输出：

第X章《标题》

- 本章风格施工指令：……
- 功能与位置：……
- 剧情时间落点：起点=……；终点=……
- 时间推进安排：……（没有真实跨日时可写“无，本章在同一时间连续推进”）
- 主要地点：……
- 章末状态：……

- 本章推进骨架：
  ① 【节拍名称】
     核心事件：……
     人物行动：……
     变化/回报：……
     承接下一拍：……
     时间锚点：……
     
     ……严格按照当前微拍配置继续，不能固定5拍，也不能固定8拍。

- 情绪走向与突出点：……
- 连续性：……
- 本章出场名单：……

每章都必须额外输出【章末结尾施工】并填写：
结尾功能：……
结尾强度：0-4
是否留钩子：是/否
最后有效事件：……
具体收尾方式：……
表现形式：……
禁止追加：……
重复风险：……

禁止把前瞻/承诺写成章末感觉；只停在已经发生的最后有效变化。

逐章输出直到本组最后一章。

最后输出：

# 本阶段向下一阶段移交的3大关键悬念与阶段高潮成果

1. 【主线核心悬念/危机】：……
2. 【核心角色定格状态与处境】：……
3. 【阶段高潮结算与关键道具/情报】：……`;
     
     
function principalChapterTaskCards(raw){
  const text=String(raw||'').replace(/\r\n?/g,'\n');
  const re=/^\s*(?:#{1,6}\s*)?(?:第\s*(\d+)\s*章)\s*章级导演\/授权任务卡\s*$/gm;
  const starts=[]; let m;
  while((m=re.exec(text))) starts.push({chapter:+m[1],line:m.index});
  const cards={};
  for(let z=0;z<starts.length;z++){
    const a=starts[z], b=z+1<starts.length?starts[z+1].line:text.length;
    const block=text.slice(a.line,b).trim();
    cards[a.chapter]=block;
  }
  return cards;
}
function principalChapterTask(i){
  const raw=state.school?.principal?.raw || scState()?.principal?.raw || '';
  const cards=principalChapterTaskCards(raw);
  return String(cards[i+1]||'').trim();
}
function buildTeacherAuthorizationPack(g, gi){
  const parts=[];
  const p=state.school?.principal || scState()?.principal || {};
  const raw=String(p.raw||'');
  const cards=principalChapterTaskCards(raw);
  parts.push(`【本组章级导演/授权任务卡｜老师只能在这些边界内施工】`);
  for(let n=g.first;n<=g.last;n++){
    const card=String(cards[n]||'').trim();
    parts.push(card || `【第${n}章章级授权缺失】\n禁止把缺失内容自行补成校长事实；请先重新生成校长章级任务卡。`);
    const ep=chapterEndingPlanFor(n-1);
    if(ep) parts.push(`【第${n}章章末计划（结构化）】\n${JSON.stringify(ep,null,2)}\n老师不得改变 endingFunction / intensity / hook 的战略含义；只负责在授权范围内完成最后有效事件与自然收束。`);
  }
  parts.push(`【授权解释】\n- “必须推进”与“终止状态”是本章目标约束。\n- “允许人物/地点/道具/线索”是核心剧情白名单。\n- “信息边界”规定当前章人物可以知道什么。\n- “待确认项”不得被老师直接升级为事实。\n- 老师可以自由设计白名单资源之间的中间事件和节拍，但不得突破以上边界。`);
  return parts.join('\n\n');
}
function teacherScopedGlossary(g, gi, maxChar){
  const o=state.outline||{}, gl=o.glossary||{};
  const names=new Set();
  for(let n=g.first;n<=g.last;n++){
    const card=principalChapterTask(n-1);
    const fields=card.match(/-\s*(?:允许人物|允许地点|允许道具\/资源|允许线索)\s*[：:]\s*([^\n]+)/g)||[];
    fields.forEach(line=>line.replace(/^.*?[：:]\s*/,'').split(/[、，,；;]/).forEach(x=>{x=x.trim().replace(/^[-*•]\s*/,''); if(x && !/^(无|暂无|无特别限制)$/.test(x)) names.add(x.replace(/^《|》$/g,''));}));
  }
  const out=[];
  const chars=(gl.characters||[]).filter(c=>{const nm=String(c?.name||'').trim();return nm && [...names].some(x=>nm===x||nm.includes(x)||x.includes(nm));});
  const places=(gl.places||[]).filter(c=>{const nm=String(c?.name||'').trim();return nm && [...names].some(x=>nm===x||nm.includes(x)||x.includes(nm));});
  const props=(gl.propernouns||[]).filter(c=>{const nm=String(c?.name||'').trim();return nm && [...names].some(x=>nm===x||nm.includes(x)||x.includes(nm));});
  if(chars.length) out.push('人物：'+chars.map(c=>fmtCharFullFields(c).join('，')).join('\n· '));
  if(places.length) out.push('地点：'+places.map(c=>`${c.name}${c.note?`：${c.note}`:''}`).join('、'));
  if(props.length) out.push('专名/道具：'+props.map(c=>`${c.name}${c.note?`：${c.note}`:''}`).join('、'));
  const rules=(gl._worldRules||[]).map(fmtWR).filter(Boolean);
  if(rules.length) out.push('世界观规则（执行必守）：\n'+rules.slice(0,20).map(x=>'- '+x).join('\n'));
  let text=out.join('\n\n');
  if(text.length>(maxChar||9000)) text=text.slice(0,maxChar||9000)+'…（按授权范围截断）';
  return text||'（本组章级授权未指定额外词典资源；核心剧情不得自行扩大人物/地点/线索范围。）';
}

function buildTeacherUser(g, gi){
  const pr = (state.school && state.school.principal) || {};
  const o = state.outline || {};
  const lines = [];
  lines.push(storyStateCanonBlock());
  lines.push(`【全校写作守则】\n${(pr.raw && extractSection(pr.raw,'全校写作守则','各组组级框架')) || '（校长未产出守则）'}`);
  lines.push(`【校长已裁决的风格融合总纲】\n${principalStyleExecutionExcerpt()}`);
  lines.push(`【本组组级框架（组${gi+1}·老师${gi+1}，第${g.first}-${g.last}章）】\n${(pr.raw && extractSection(pr.raw,'各组组级框架','全书章节标题总表')) || (pr.raw || '（校长未产出组级框架）')}`);
  lines.push(`【本组章节标题】\n${scGroupTitles(g).join('\n')}`);
  const auth = buildTeacherAuthorizationPack(g, gi);
  if(auth) lines.push(auth);
  const _bc = currentBeatCfg ? currentBeatCfg() : null;
  if(_bc && _bc.label) lines.push(`【章节微拍（单源真理·内嵌骨架）】名称=${_bc.label}${_bc.desc?('；说明='+_bc.desc):''}${_bc.types?('；拍=('+_bc.types.map(t=>t.label).join('，')+')'):''}\n要求：将此微拍节奏直接融铸在每章教案的「本章推进骨架」中，形成单一执行标准的超级教案。`);
  lines.push('【当前组执行词典（只供本组施工，不代表可任意调用全部核心剧情资源）】\n' + teacherScopedGlossary(g, gi, 9000));
  lines.push(`【前序正文状态（若存在）】\n${g.first>1 ? (storyStateChapterBlock(g.first-1) || '（暂无结算状态）') : '（首组，无前序正文）'}`);
  // 开篇策略只对首组（包含第1章）生效；后续老师不得把首章策略当成本组策略。
  if(g && g.first===1){
    const _opening = openingStrategyBrief(); if(_opening) lines.push(_opening);
    const _openingTask = principalOpeningTaskExcerpt() || openingStrategyExecutionCard(0); if(_openingTask) lines.push(_openingTask);
  }
  lines.push(prevGroupTailState(gi, g));
  if(isLong()) lines.push(`【长篇记忆层·老师备课参考】\n${longMemoryBrief(g.first-1) || '（尚无已落地正文状态；以校长交接棒和本组教案输入为准。）'}\n执行要求：记忆层只用于保持状态、因果与伏笔连续，不得擅自新增剧情；本组每章重大事件仍须给出前置条件→触发/线索→人物行动→结果。`);
  lines.push('\n请对本组每一章产出一份「本章写作框架」，并在文末附上【本阶段向下一阶段移交的 3 大关键悬念与阶段高潮成果】。');
  return lines.join('\n\n');
}

function prevGroupTailState(gi, g){
  const groups = schoolStageGroups();
  if(gi <= 0 || !groups[gi-1]) return '【上一组末章·收束状态】\n（本组为全书首组：开篇）——首章按本章教案、人物现场与故事自然发展开篇；若用户选择了开篇策略，则仅按所选策略执行。';
  const prev = (state.school && state.school.teachers && state.school.teachers[gi-1]) || null;
  const prevGroup = groups[gi-1];
  if(!prev || !prev.raw || !prevGroup) return '【上一组末章·收束状态】\n（上一组（老师'+gi+'）尚未备课）：请本组首章按「承上节的钩」自行设计衔接。';
  const lastCh = prevGroup.last;
  
  const reLastCh = new RegExp(`^第\\s*${lastCh}\\s*章\\b[\\s\\S]*?(?=^第\\s*\\d+\\s*章\\b|^#+\\s*本阶段向下一阶段移交|$)`, 'm');
  const mLastCh = String(prev.raw).match(reLastCh);
  const lastChPlan = mLastCh ? String(mLastCh[0]).trim() : '';

  const reBaton = /#+\s*本阶段向下一阶段移交[^\n]*\n([\s\S]*?)$/m;
  const mBaton = String(prev.raw).match(reBaton);
  const batonText = mBaton ? mBaton[1].trim() : '';

  const parts = [];
  if(g && g.first===1){ const ot=principalOpeningTaskExcerpt() || openingStrategyExecutionCard(0); if(ot) parts.push(ot); }
  parts.push(`【教师交接棒契约（上一位老师${gi}移交 · 最高优先级硬性输入）】
上一位老师负责第 ${prevGroup.first}-${prevGroup.last} 章。为彻底消除阶段之间的割裂感，本组（第 ${g.first}-${g.last} 章）第 1 章（第 ${g.first} 章）必须作为交接棒的第一承接者：`);
  
  if(lastChPlan){
    parts.push(`◆ 上一组末章（第 ${lastCh} 章）完整教案：\n${lastChPlan.slice(0, 1200)}`);
  }
  if(batonText){
    parts.push(`◆ 上一组移交的 3 大关键悬念与高潮成果：\n${batonText.slice(0, 800)}`);
  } else {
    parts.push(`◆ 上一组末章收束重点：请紧扣第 ${lastCh} 章的连续性与未解悬念，无缝推进到本组第 ${g.first} 章。`);
  }
  parts.push(`【交接执行令】本组第 ${g.first} 章教案的「本章推进骨架」第 ① 环节与「连续性」，必须 100% 严密对缝承接第 ${lastCh} 章定格的真实物理处境与上述悬念，严禁凭空跳跃！`);
  return parts.join('\n\n');
}

async function genTeacher(btn, gi){
  if(!isLong()){ toast('仅长篇小说模式支持老师施教'); return false; }
  const groups = schoolStageGroups(); const g = groups[gi];
  if(!g){ toast('未找到该分组'); return false; }
  if(!scDone('dictEnrich')){ toast('老师备课需要先接收完整词典，请先完成“词典充实”'); return false; }
  if(!scDone('principal')){ toast('请先生成校长（分组/守则/章级授权任务卡/组级框架）'); return false; }
  const _authPack = buildTeacherAuthorizationPack(g, gi);
  if(!_authPack || /章级授权缺失/.test(_authPack)){ toast('当前组缺少校长章级授权任务卡，请先重新生成校长'); return false; }
  const key = 't'+gi;
  scState();
  markAIRunning(key); if(btn) busy(btn, true, '备课中…'); if(btn && btn.parentNode) showStopBtn(btn.parentNode);
  try{
    const spec = resolveActiveSpec('teacher');
    const temp = (spec && spec.teacherTemp != null) ? spec.teacherTemp : 0.4;
    for(let attempt=1; attempt<=SCHOOL_RETRY_MAX; attempt++){
      try{
        const txt = await callAIGuarded('teacher', TEACHER_SYS, buildTeacherUser(g, gi), {}, { temperature:temp, maxTokens:16384, signal:_abortCtl?.signal });
        if(!txt || !String(txt||'').trim()){ setScRetry(key, attempt); scRefreshBadge(btn,key); throw new Error('老师返回空'); }
        const sc = scState(); delete sc.stale['t'+gi];
        sc.teachers[gi] = { gi, ts:Date.now(), raw:String(txt) };
        // 老师 AI 已成功返回完整教案，到这里就算老师阶段完成。
        // 机器章节卡改为下游按需读取时再建立，不再阻塞老师完成，也不再在这里做整组校验。
        markAIDone(key, false);
        scMark(key, true);
        render();
        toast(`老师${gi+1}备课完成：第 ${g.first}-${g.last} 章已按校长章级授权施工`);
        playDoneSound('single');
        return true;
      }catch(e){
        if(e && e.name === 'AbortError'){ setScRetry(key, attempt); toast('已停止备课'); return false; }
        setScRetry(key, attempt); scRefreshBadge(btn,key);
        if(attempt < SCHOOL_RETRY_MAX) await new Promise(r=>setTimeout(r,1500));
      }
    }
    toast(`老师${gi+1}备课失败（已自动重试 ${SCHOOL_RETRY_MAX} 次）`);
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!==key);
    hideStopBtn(); if(btn) busy(btn,false); scRefreshBadge(btn,key);
  }
}

async function nailRetry(key, label, run, btn){
  for(let attempt=1; attempt<=SCHOOL_RETRY_MAX; attempt++){
    let ok = false; try{ ok = await run(); }catch(e){ ok = false; }
    if(ok){ scMark(key, true); scRefreshBadge(btn, key); return true; }
    setScRetry(key, attempt); scRefreshBadge(btn, key);
    if(attempt < SCHOOL_RETRY_MAX) await new Promise(r=>setTimeout(r,1200));
  }
  toast(`${label}失败（已自动重试 ${SCHOOL_RETRY_MAX} 次）`);
  scRefreshBadge(btn, key);
  return false;
}

function refreshSchoolProgressUi(){
  const topText = document.querySelector('.sc-pipe-t');
  const pipeIn = document.querySelector('.sc-pipe-in');
  const pipeMeta = document.querySelector('.sc-pipe-m');
  const allBtn = document.querySelector('[data-scp-all]');
  const subtag = document.querySelector('.ch-subtag-school');
  const stepKeys = ['dictMaster','dictEnrich','principal','teacher'];
  const doneSteps = stepKeys.filter(k => getSchoolStepStatus(k).isDone).length;
  const pct = Math.round(doneSteps / 4 * 100);

  if(pipeIn) pipeIn.style.width = pct + '%';
  if(pipeMeta) pipeMeta.textContent = `${doneSteps}/4 步就绪 · ${pct}%`;
  if(subtag) subtag.textContent = `${doneSteps}/4 步就绪 · ${pct}%`;

  if(state._schoolRunning){
    const run = state._schoolRunning;
    if(topText) topText.innerHTML = `⚡ <b>一键开学进行中</b>（${run.stepIndex+1}/${run.totalSteps||4} · ${esc(run.label)}）…`;
    if(allBtn){
      allBtn.classList.add('running');
      allBtn.innerHTML = `⚡ 一键开学中（${run.stepIndex+1}/${run.totalSteps||4} · ${esc(run.label)}）…`;
    }
  } else {
    if(topText) topText.textContent = '⏳ 设定就绪 → 学校开学（四步标准管线）';
    if(allBtn){
      allBtn.classList.remove('running');
      allBtn.innerHTML = '⚡ 一键开学（全链路备课）';
    }
  }

  stepKeys.forEach(k=>{
    const el = document.querySelector(`.sc-pipe-steps [data-scp-step="${k}"]`) || document.querySelector(`[data-scp-step="${k}"]`);
    if(el){
      const st = getSchoolStepStatus(k);
      el.classList.toggle('running', st.isRunning);
      el.classList.toggle('done', st.isDone);
      el.classList.toggle('failed', st.isFailed);
      el.classList.toggle('sc-failed', st.isFailed);
      el.classList.toggle('sc-step-default', !st.isRunning && !st.isDone && !st.isFailed);

      let tick = el.querySelector('.sc-tick');
      if(!tick){
        tick = document.createElement('i');
        tick.className = 'sc-tick';
        el.appendChild(tick);
      }
      if(st.isRunning){
        tick.className = 'sc-tick sc-tick-run';
        tick.textContent = '⏳';
      } else if(st.isDone){
        tick.className = 'sc-tick sc-tick-done';
        tick.textContent = '✓';
      } else if(st.isFailed){
        tick.className = 'sc-tick sc-tick-fail';
        tick.textContent = '✕';
      } else {
        tick.className = 'sc-tick';
        tick.textContent = '';
      }
      scRefreshBadge(el, k);
    }
  });

  const groups = schoolStageGroups();
  groups.forEach((g, i)=>{
    const tBtn = document.querySelector(`[data-scp-teacher="${i}"]`);
    if(tBtn){
      const tDone = scDone('t'+i);
      tBtn.classList.toggle('done', tDone);
    }
  });
}

async function genSchoolAll(btn){
  if(genBusy()){ toast('已有生成任务进行中，请稍候'); return; }
  const groups = schoolStageGroups(); if(!groups.length){ toast('请先填写章节数，才能一键开学'); return; }
  const steps = [
    { key:'dictMaster', label:'词典达人', run:()=> genDictMaster(null) },
    { key:'dictEnrich', label:'词典充实', run:()=> genDictEnrich(null,{force:true}) },
    { key:'principal', label:'校长', run:()=> genPrincipal(null) },
    {
      key:'teacher',
      label:'老师',
      run: async ()=>{
        let allT = true;
        // 彻底取消“≤20章校长兼任老师”的任何捷径：无论 1-20 章还是 21+ 章，都必须进入独立老师阶段。
        for(let j=0; j<groups.length; j++){
          const g = groups[j];
          if(scTeacherGroupComplete(j)) continue;
          state._schoolRunning = { activeKey:'teacher', teacherIndex:j, stepIndex:3, totalSteps:4, label: groups.length > 1 ? `老师${j+1}备课` : '老师备课' };
          refreshSchoolProgressUi();
          const okT = await genTeacher(null, j);
          if(!okT){ allT = false; break; }
          // genTeacher 已经在 AI 成功返回后直接标记本组完成；这里不再重复扫描章节卡或再次 persist。
        }
        // genTeacher 已逐章硬验收；这里不要再用另一套不同的完成条件把已经可读的教案判失败。
        const teacherReady = allT && groups.every((g,gi)=>scTeacherGroupComplete(gi));
        // 不在老师子流程里再次 persist；一键外层会在该步骤成功后统一标记 teacher。
        if(!teacherReady) scSetFailed('teacher', true);
        return teacherReady;
      }
    }
  ];
  const allBtn = ()=> document.querySelector('[data-scp-all]');
  const presetTitles = ()=>{
    const titles = (state.school && state.school.principal && Array.isArray(state.school.principal.titles)) ? state.school.principal.titles : [];
    if(titles.length && !isPrincipalTitlesApplied()) doApplyTitles(titles, { silent:true });
  };
  if(scDone('principal')) presetTitles();
  const finish = ()=>{
    state._schoolRunning = null;
    const b = allBtn();
    if(b){
      if(b._txt !== undefined){ b.innerHTML = b._txt; delete b._txt; }
      b.classList.remove('running');
    }
    refreshSchoolProgressUi();
  };
  const b0 = allBtn();
  if(b0 && b0._txt === undefined) b0._txt = b0.innerHTML;
  try{
    for(let i=0; i<steps.length; i++){
      const st = steps[i];
      if(getSchoolStepStatus(st.key).isDone) continue;
      scSetFailed(st.key, false);
      state._schoolRunning = { activeKey:st.key, stepIndex:i, totalSteps:4, label:st.label };
      refreshSchoolProgressUi();
      const zone = document.querySelector('.school-zone');
      let stopped = false;
      if(zone){ showStopBtn(zone); zone.classList.add('cp-stopping'); if(_abortCtl) _abortCtl.signal.addEventListener('abort', ()=>{ stopped = true; }, {once:true}); }
      let ok = false;
      try{
        ok = await st.run();
      }catch(err){
        console.error(`[genSchoolAll] step ${st.key} error:`, err);
        ok = false;
      }
      hideStopBtn(); if(zone) zone.classList.remove('cp-stopping');
      if(ok){
        // genTeacher 已经保存各老师成果；这里仅做一次“teacher”步骤收尾保存。
        scMark(st.key, true);
        if(st.key==='principal'){
          const titles = (state.school && state.school.principal && Array.isArray(state.school.principal.titles)) ? state.school.principal.titles : [];
          if(titles.length && !isPrincipalTitlesApplied()){
            doApplyTitles(titles, { silent:true });
          }
        }
      } else {
        scSetFailed(st.key, true);
      }
      refreshSchoolProgressUi();
      if(!ok){
        toast(stopped ? `已停止学校一键（停在「${st.label}」）` : `学校一键中断于「${st.label}」，可单独点该步骤重试`);
        return;
      }
    }
    // 老师阶段以每组 AI 教案是否成功落地为完成条件；不再在一键开学收尾时扫描全部章节机器卡。
    if(!scTeacherPipelineComplete()) throw new Error('一键开学未完成独立老师教案');
    toast('学校一键全部完成：词典达人→词典充实→校长→独立老师全链路就绪！');
    playDoneSound('all');
  }finally{ finish(); render(); }
}

function bindSchoolSteps(){
  const all = $('[data-scp-all]'); if(all) all.onclick = ()=> genSchoolAll(all);
  const applyBtn = $('[data-scp-apply-titles]');
  if(applyBtn) applyBtn.onclick = ()=> applyPrincipalTitles();
  $$('[data-scp-step]').forEach(btn=>{
    if(btn._sB) return; btn._sB = 1;
    btn.onclick = async ()=>{
      const step = btn.dataset.scpStep;
      if(step === 'dictMaster'){
        scSetFailed('dictMaster', false);
        state._schoolRunning = { activeKey:'dictMaster', stepIndex:0, totalSteps:4, label:'词典达人' };
        refreshSchoolProgressUi();
        try {
          const ok = await nailRetry('dictMaster','词典达人', ()=> genDictMaster(btn), btn);
          if(ok){ scMark('dictMaster', true); playDoneSound('single'); }
          else { scSetFailed('dictMaster', true); }
        } catch(e){
          scSetFailed('dictMaster', true);
        } finally {
          state._schoolRunning = null;
          refreshSchoolProgressUi();
        }
        return;
      }
      if(step === 'dictEnrich'){
        scSetFailed('dictEnrich', false);
        state._schoolRunning = { activeKey:'dictEnrich', stepIndex:1, totalSteps:4, label:'词典充实' };
        refreshSchoolProgressUi();
        try {
          const ok = await nailRetry('dictEnrich','词典充实', ()=> genDictEnrich(btn,{}), btn);
          if(ok){ scMark('dictEnrich', true); playDoneSound('single'); }
          else { scSetFailed('dictEnrich', true); }
        } catch(e){
          scSetFailed('dictEnrich', true);
        } finally {
          state._schoolRunning = null;
          refreshSchoolProgressUi();
        }
        return;
      }
      if(step === 'principal'){
        scSetFailed('principal', false);
        state._schoolRunning = { activeKey:'principal', stepIndex:2, totalSteps:4, label:'校长' };
        refreshSchoolProgressUi();
        try {
          const ok = await genPrincipal(btn);
          if(ok){
            scMark('principal', true);
            const titles = (state.school && state.school.principal && Array.isArray(state.school.principal.titles)) ? state.school.principal.titles : [];
            if(titles.length && !isPrincipalTitlesApplied()) doApplyTitles(titles, { silent:true });
            playDoneSound('single');
          } else {
            scSetFailed('principal', true);
          }
        } catch(e){
          scSetFailed('principal', true);
        } finally {
          state._schoolRunning = null;
          refreshSchoolProgressUi();
        }
        return;
      }
      if(step === 'teacher' || step === 'teacherAll'){
        const groups = schoolStageGroups();
        if(!groups.length){ toast('请先填写章节数，才能备课'); return; }
        scSetFailed('teacher', false);
        state._schoolRunning = { activeKey:'teacher', stepIndex:3, totalSteps:4, label:'老师' };
        refreshSchoolProgressUi();
        try {
          let allOk = true;
          for(let i=0; i<groups.length; i++){
            if(scDone('t'+i)) continue;
            const ok = await genTeacher(null, i);
            if(!ok){ allOk = false; scSetFailed('teacher', true); break; }
            scMark('t'+i, true);
          }
          if(allOk){ scMark('teacher', true); playDoneSound('single'); }
        } catch(e){
          scSetFailed('teacher', true);
        } finally {
          state._schoolRunning = null;
          refreshSchoolProgressUi();
        }
        return;
      }
      if(step === 'teacherSingle'){
        const gi = Number(btn.dataset.scpTeacher);
        const ok = await genTeacher(btn, gi);
        if(ok){
          scMark('t'+gi, true);
          const groups = schoolStageGroups();
          if(groups.every((g,i)=>scDone('t'+i))) scMark('teacher', true);
        }
        refreshSchoolProgressUi();
        return;
      }
    };
  });
  $$('[data-scp-plan]').forEach(b=>{ b.onclick = ()=> openSchoolPlanReader(+b.dataset.scpPlan); });
  const pv = $('[data-scp-plan-pr]');
  if(pv) pv.onclick = ()=> openSchoolPrincipalReader();
  bindPlannerSoundTool();
}

function getFieldTagClass(k){
  if(/时间|落点|时点/.test(k)) return 'sc-tag-blue';
  if(/连续|承上|启下|承接|过桥/.test(k)) return 'sc-tag-green';
  if(/推进|骨架|拍|事件/.test(k)) return 'sc-tag-amber';
  if(/功能|位置|分工/.test(k)) return 'sc-tag-purple';
  if(/情绪|弧|高潮|突出/.test(k)) return 'sc-tag-pink';
  if(/出场|名单|人物|实体/.test(k)) return 'sc-tag-teal';
  return 'sc-tag-blue';
}

function saveTeacherFieldEdit(gi, ch, k, newV){
  const t = state.school && state.school.teachers && state.school.teachers[gi];
  if(!t || !t.raw) return;
  const lines = String(t.raw).split('\n');
  let inCh = false;
  let replaced = false;
  for(let i=0; i<lines.length; i++){
    const ln = lines[i];
    const mCh = ln.match(/^\s*第\s*(\d+)\s*章/);
    if(mCh){
      if(parseInt(mCh[1],10) === ch){ inCh = true; }
      else if(inCh){ break; }
    }
    if(inCh){
      const mF = ln.match(/^(\s*(?:[-•*>\d().]+\s*)*)([^：:]{1,10})([：:])\s*(.*)$/);
      if(mF && mF[2].trim() === k){
        lines[i] = `${mF[1]}${mF[2]}${mF[3]} ${newV.trim()}`;
        replaced = true;
        break;
      }
    }
  }
  if(!replaced && inCh){
    lines.push(`- ${k}：${newV.trim()}`);
    replaced = true;
  }
  if(replaced){
    t.raw = lines.join('\n');
    persist();
    toast(`第${ch}章「${k}」已保存修改`);
  }
}

const PLAN_FIELD_KEYS = ['功能与位置','剧情时间落点','本章推进骨架','情绪走向与突出点','连续性','本章出场名单'];
function splitTeacherPlanChapters(raw){
  const res = [];
  let cur = null;
  String(raw||'').split('\n').forEach(ln=>{
    const m = String(ln).match(/^\s*第\s*(\d+)\s*章[^(《（]*\s*(.*)$/);
    if(m){ cur = { ch:+m[1], title:String(m[2]||'').replace(/[《》（）()【】]/g,'').trim(), fields:[] }; res.push(cur); return; }
    if(cur){
      const f = String(ln).match(/^\s*(?:[-•*>\d().]+\s*)*([^：:]{1,10})[：:]\s*(.*)$/);
      if(f && PLAN_FIELD_KEYS.indexOf(f[1].trim()) >= 0 && String(f[2]||'').trim()){
        cur.fields.push({ k:f[1].trim(), v:String(f[2]).trim() });
      }
    }
  });
  return res;
}
let _planCUR_GI = 0, _planCUR_VIEW = 'card';
function openSchoolPlanReader(gi, jumpCh){
  const sc = scState();
  const t = sc && sc.teachers && sc.teachers[gi];
  const g = schoolStageGroups()[gi];
  if(!g){ toast('未找到该章节分组'); return; }
  _planCUR_GI = gi; _planCUR_VIEW = 'raw';
  const n = g.last - g.first + 1;
  const ov = document.createElement('div'); ov.className='gs-overlay';
  const groups = schoolStageGroups();
  const label = groups.length > 1 ? `老师${gi+1}` : '老师';
  const titleText = `🎓 ${label} · 本组教案`;
  ov.innerHTML = `<div class="gs-modal school-plan-modal">
    <div class="gs-modal-head"><b>${titleText}</b><span class="sc-plan-meta muted">${g.stage ? `段「${esc(g.stage)}」 · ` : ''}第 ${g.first}-${g.last} 章 · ${n} 章</span></div>
    <div class="sc-plan-tool">
      <span class="sc-plan-tgl" id="scPlanTgl">
        <span class="sp-tgl-itm on" data-v="raw">原稿纯文本</span><span class="sp-tgl-itm" data-v="card">栏目结构化</span>
      </span>
      <button class="gs-x" data-sp-close>✕</button>
    </div>
    <div class="sc-plan-body" id="scPlanBody" style="max-height:68vh;overflow:auto;padding:12px 16px 20px"></div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-sp-close]').onclick = ()=> ov.remove();
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
  ov.querySelectorAll('.sp-tgl-itm').forEach(el=>{
    el.onclick = ()=>{ _planCUR_VIEW = el.dataset.v; ov.querySelectorAll('.sp-tgl-itm').forEach(x=>x.classList.toggle('on', x===el)); renderSchoolPlanBody(ov, gi, jumpCh); };
  });
  renderSchoolPlanBody(ov, gi, jumpCh);
  if(jumpCh){ setTimeout(()=>{ const el = ov.querySelector('#planCh-'+jumpCh); if(el){ el.style.transition='box-shadow .5s,background .5s'; el.style.boxShadow='0 0 0 2px var(--accent)'; el.style.background='color-mix(in srgb, var(--accent) 12%, transparent)'; setTimeout(()=>{ el.style.boxShadow=''; el.style.background=''; },1600); el.scrollIntoView({block:'center',behavior:'smooth'}); } },80); }
}
function renderSchoolPlanBody(ov, gi, jumpCh){
  const groups = schoolStageGroups();
  const g = groups[gi];
  const sc = scState();
  const t = sc.teachers && sc.teachers[gi];
  const body = ov.querySelector('#scPlanBody'); if(!body || !g) return;
  const label = groups.length > 1 ? `老师${gi+1}` : '老师';

  if(!t || !t.raw || !String(t.raw).trim()){
    body.innerHTML = `
      <div class="sc-plan-empty" style="text-align:center;padding:42px 20px;display:flex;flex-direction:column;align-items:center;gap:12px;">
        <span style="font-size:38px;opacity:0.85">📖</span>
        <h4 style="margin:0;font-size:16px;font-weight:750;color:var(--txt)">本组逐章教案尚未生成</h4>
        <p style="margin:0;font-size:13px;color:var(--muted);max-width:380px;line-height:1.6">
          本组负责第 ${g.first} 至 ${g.last} 章（共 ${g.last - g.first + 1} 章${g.stage ? ' · ' + g.stage : ''}）。点击下方按钮开始备课。
        </p>
        <button type="button" class="btn primary" id="scEmptyPlanStart" style="padding:9px 24px;border-radius:10px;font-size:13.5px;font-weight:750;margin-top:8px">
          🎓 立即让${label}备课
        </button>
      </div>
    `;
    const btn = body.querySelector('#scEmptyPlanStart');
    if(btn){
      btn.onclick = async ()=>{
        ov.remove();
        const groups = schoolStageGroups();
        await nailRetry('t'+gi, `老师${groups.length > 1 ? gi+1 : ''}备课`, ()=> genTeacher(null, gi), null);
        openSchoolPlanReader(gi, jumpCh);
      };
    }
    return;
  }

  if(_planCUR_VIEW === 'raw'){
    const wrap = document.createElement('div');
    wrap.className = 'sc-plan-raw-box';
    wrap.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:6px 12px;border-radius:8px;background:var(--panel2);border:1px solid var(--line)">
        <span style="font-size:12px;font-weight:700;color:var(--txt)">📄 老师逐章教案 · 原稿纯文本</span>
        <button type="button" class="btn small" id="scCopyPlanBtn" style="font-size:11.5px;padding:3px 12px;border-radius:6px;cursor:pointer">📋 复制纯文本全文</button>
      </div>
      <pre class="sc-plan-raw" style="user-select:text;margin:0"></pre>
    `;
    wrap.querySelector('.sc-plan-raw').textContent = t.raw;
    const cpBtn = wrap.querySelector('#scCopyPlanBtn');
    if(cpBtn){
      cpBtn.onclick = ()=>{
        navigator.clipboard.writeText(t.raw).then(()=>{
          cpBtn.textContent = '✓ 已复制全文';
          setTimeout(()=>{ cpBtn.textContent = '📋 复制纯文本全文'; }, 1800);
        });
      };
    }
    body.innerHTML = '';
    body.appendChild(wrap);
    return;
  }
  const blocks = splitTeacherPlanChapters(t.raw);
  const byCh = new Map(blocks.map(b=>[b.ch,b]));
  let html = '';
  for(let ch=g.first; ch<=g.last; ch++){
    const b = byCh.get(ch) || null;
    let rows = '';
    if(b && b.fields.length){
      rows = b.fields.map(f => {
        const isLongText = f.v.length > 110;
        const tagCls = getFieldTagClass(f.k);
        return `
          <div class="sc-kf">
            <span class="sc-kf-k ${tagCls}">${esc(f.k)}</span>
            <div class="sc-kf-v-col">
              <div class="sc-kf-v ${isLongText ? 'sc-collapse-clamp' : ''}" data-val-raw="${esc(f.v)}">${esc(f.v)}</div>
              ${isLongText ? `<button type="button" class="sc-expand-btn">展开全文 ▾</button>` : ''}
            </div>
            <button type="button" class="sc-field-edit-btn" data-edit-ch="${ch}" data-edit-k="${esc(f.k)}" title="编辑该字段">✎</button>
          </div>
        `;
      }).join('');
    } else {
      rows = '<div class="sc-kf"><span class="sc-kf-k sc-tag-blue">提示</span><span class="sc-kf-v">该章节教案缺少可读字段，可切「原始稿」查看。</span></div>';
    }
    html += `<div class="sc-plan-ch" id="planCh-${ch}">
      <div class="sc-plan-ch-t">第${ch}章${b&&b.title?(' · '+esc(b.title)):''}</div>
      <div class="sc-kf-wrap">${rows}</div>
    </div>`;
  }
  body.innerHTML = html;

  body.querySelectorAll('.sc-expand-btn').forEach(btn => {
    btn.onclick = () => {
      const vEl = btn.previousElementSibling;
      vEl.classList.toggle('sc-collapse-clamp');
      btn.textContent = vEl.classList.contains('sc-collapse-clamp') ? '展开全文 ▾' : '收起 ▴';
    };
  });

  body.querySelectorAll('.sc-field-edit-btn').forEach(btn => {
    btn.onclick = () => {
      const ch = +btn.dataset.editCh;
      const k = btn.dataset.editK;
      const row = btn.closest('.sc-kf');
      const valCol = row.querySelector('.sc-kf-v-col');
      const oldVal = valCol.querySelector('.sc-kf-v').getAttribute('data-val-raw') || '';
      valCol.innerHTML = `
        <div class="sc-kf-edit-box" style="display:flex;flex-direction:column;gap:6px;width:100%;margin-top:4px;">
          <textarea class="sc-kf-edit-area" style="width:100%;min-height:85px;font-size:12.5px;padding:8px 10px;border-radius:8px;border:1px solid var(--accent);background:var(--panel);color:var(--txt);line-height:1.6;">${esc(oldVal)}</textarea>
          <div style="display:flex;gap:8px">
            <button type="button" class="btn small primary" data-save>保存修改</button>
            <button type="button" class="btn small ghost" data-cancel>取消</button>
          </div>
        </div>
      `;
      btn.style.display = 'none';
      valCol.querySelector('[data-save]').onclick = () => {
        const newV = valCol.querySelector('textarea').value;
        saveTeacherFieldEdit(gi, ch, k, newV);
        renderSchoolPlanBody(ov, gi, ch);
      };
      valCol.querySelector('[data-cancel]').onclick = () => {
        renderSchoolPlanBody(ov, gi, ch);
      };
    };
  });
}

let _prCUR_VIEW = 'card';
function openSchoolPrincipalReader(){
  const sc = state.school;
  const p = sc && sc.principal;
  const raw = (p && p.raw) || '';
  if(!raw){
    toast('校长统筹成果尚未生成，请先点击「校长统筹」或「一键开学」');
    return;
  }
  _prCUR_VIEW = 'card';
  const ov = document.createElement('div'); ov.className = 'gs-overlay';
  ov.innerHTML = `
  <div class="gs-modal school-plan-modal" style="max-width:920px">
    <div class="gs-modal-head">
      <b>👑 校长统筹全局成果</b>
      <span class="sc-plan-meta muted">全校写作守则 · 各组组级框架 · 全书章节标题总表</span>
    </div>
    <div class="sc-plan-tool">
      <span class="sc-plan-tgl">
        <span class="sp-tgl-itm on" data-prv="card">结构化卡片</span>
        <span class="sp-tgl-itm" data-prv="raw">原始稿</span>
      </span>
      <button class="gs-x" data-pr-close>✕</button>
    </div>
    <div class="sc-plan-body" id="scPrincipalBody" style="max-height:72vh;overflow:auto;padding:14px 18px 22px"></div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-pr-close]').onclick = ()=> ov.remove();
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
  ov.querySelectorAll('[data-prv]').forEach(el=>{
    el.onclick = ()=>{
      _prCUR_VIEW = el.dataset.prv;
      ov.querySelectorAll('[data-prv]').forEach(x=>x.classList.toggle('on', x===el));
      renderSchoolPrincipalBody(ov, raw);
    };
  });
  renderSchoolPrincipalBody(ov, raw);
}

function renderSchoolPrincipalBody(ov, raw){
  const body = ov.querySelector('#scPrincipalBody');
  if(!body) return;
  if(_prCUR_VIEW === 'raw'){
    body.innerHTML = `<pre class="sc-plan-raw">${esc(raw||'（暂无内容）')}</pre>`;
    return;
  }
  
  const rulesSec = extractSection(raw, '全校写作守则', '各组组级框架') || extractSection(raw, '全校写作守则', '全书章节标题总表') || '';
  const frameSec = extractSection(raw, '各组组级框架', '全书章节标题总表') || '';
  const titles = (state.school && state.school.principal && state.school.principal.titles && state.school.principal.titles.length)
    ? state.school.principal.titles
    : parsePrincipalTitles(raw);
  const titlesApplied = isPrincipalTitlesApplied();
  
  let html = '';
  
  if(rulesSec){
    html += `
    <div class="sc-pr-card">
      <div class="sc-pr-card-h"><span class="sc-pr-card-ic">📜</span> <b>全校写作守则（配方锚点与可执行纪律）</b></div>
      <div class="sc-pr-card-b">
        <div class="sc-pr-rules-wrap">${esc(rulesSec).replace(/\n/g, '<br>')}</div>
      </div>
    </div>`;
  }
  
  if(frameSec){
    html += `
    <div class="sc-pr-card">
      <div class="sc-pr-card-h"><span class="sc-pr-card-ic">🗺</span> <b>各组组级框架</b></div>
      <div class="sc-pr-card-b">
        <div class="sc-pr-rules-wrap">${esc(frameSec).replace(/\n/g, '<br>')}</div>
      </div>
    </div>`;
  }
  
  html += `
  <div class="sc-pr-card">
    <div class="sc-pr-card-h" style="display:flex;align-items:center;justify-content:space-between">
      <span><span class="sc-pr-card-ic">📑</span> <b>全书章节标题总表（共 ${titles.length} 章）</b></span>
      ${titles.length ? `<button type="button" class="btn primary small" id="btnPrApplyTitles" ${titlesApplied?'disabled style="opacity:0.75"':''}>${titlesApplied ? '✓ 标题已全部应用至全书' : `✨ 选用这套章节标题（${titles.length} 章）`}</button>` : ''}
    </div>
    <div class="sc-pr-card-b">
      ${titles.length ? `
        <div class="sc-title-grid">
          ${titles.map(t=>`
            <div class="sc-title-item">
              <span class="sc-t-no">第${t.num}章</span>
              <span class="sc-t-name">《${esc(t.title)}》</span>
            </div>
          `).join('')}
        </div>
      ` : '<div class="muted">未能从原始稿中解析出标题列表，可切换到「原始稿」查看。</div>'}
    </div>
  </div>`;
  
  body.innerHTML = html;
  
  const btnApply = body.querySelector('#btnPrApplyTitles');
  if(btnApply && !titlesApplied){
    btnApply.onclick = ()=>{
      const ok = applyPrincipalTitles();
      if(ok){
        renderSchoolPrincipalBody(ov, raw);
      }
    };
  }
}

function openSchoolRawPanel(title, sub, raw){
  const ov = document.createElement('div'); ov.className='gs-overlay';
  ov.innerHTML = `<div class="gs-modal school-plan-modal">
    <div class="gs-modal-head"><b>${esc(title)}</b><button class="gs-x" data-sp-close>✕</button></div>
    ${sub?`<div class="gs-modal-sub">${esc(sub)}</div>`:''}
    <div class="sc-plan-body" style="max-height:68vh;overflow:auto;padding:12px 16px 20px"><pre class="sc-plan-raw">${esc(raw||'（暂无内容）')}</pre></div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-sp-close]').onclick = ()=> ov.remove();
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
}


const NM_SURNAME_1 = new Set('赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闵席季麻强贾路娄危江童颜郭梅盛林刁钟徐邱骆高夏蔡田胡凌霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊於惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲邰从鄂索咸籍赖卓蔺屠蒙池乔阴鬱胥能苍双闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍郤璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庾终暨居衡步都耿满弘匡国文寇广禄阙东欧殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查后荆红游竺权逯盖益桓公'.split(''));
const NM_SURNAME_2 = new Set(['万俟','司马','上官','欧阳','夏侯','诸葛','闻人','东方','赫连','皇甫','尉迟','公羊','澹台','公冶','宗政','濮阳','淳于','单于','太叔','申屠','公孙','仲孙','轩辕','令狐','钟离','宇文','长孙','慕容','鲜于','闾丘','司徒','司空','亓官','司寇','仉督','子车','颛孙','端木','巫马','公西','漆雕','乐正','壤驷','公良','拓跋','夹谷','宰父','谷梁','段干','百里','东郭','南门','呼延','归海','羊舌','微生','梁丘','左丘','东门','西门']);
const NM_WEB_BLACKLIST = ['林晚','苏晚','顾沉','云深','顾言','江晚','许墨','陆离','沈舟','苏念','林陌'];
const NM_BANNED_CHARS = ['晚','砚','秋','檐'];   // 姓名中禁止出现这四个汉字（任何位置）
const NM_BANNED_NAMES = [   // 逐字精确禁用名单（含去空格），命中即判违规
  '林辰','苏辰','顾夜寒','陆泽','墨渊','叶辰','江亦琛','傅景深','沈辞','萧景琰','凌夜','顾言','裴衍','楚慕言','厉承勋','谢珩','温景然','云烬','宋砚','慕云凡',
  '苏清月','晚卿','沈知予','顾晚柠','林晚星','慕晚晴','苏沐瑶','温妤','夏晚璃','楚清鸢','叶轻寒','姜知微','云舒','苏念汐','洛清欢','白若曦','顾绾绾','江晚渔','宋知晚','宁疏影'
];
const BANLIST_DEFAULT = {
  enabled: true,                            // 总开关（默认开）：清单是否参与注入
  chars: [],                                // 禁用字/词（人名/专名任何位置命中即拒，由校验器联动）；默认沿用 NM_BANNED_CHARS 读取
  names: [],                                // 禁用姓名（逐字精确）；默认沿用 NM_BANNED_NAMES
  phrases: [],                              // 禁用短语/模板词（仅正文注入，控词频）
  rules: [],                                 // 附加规则条目：每条声明生效 AI 范围
  scopeAi: ['chapter']                       // 缺省生效范围（仅正文）；用户可按 AI 扩展大纲/标题/规划师
};
function nmNameRuleViolation(nm){
  const s = String(nm||'').trim();
  if(!s) return '';
  if(!/^[\u4e00-\u9fa5]+$/.test(s)) return '';           // 含非汉字（外文名）不约束
  const bv = banListViolation(s);
  if(bv) return bv;
  let surLen = 0;
  if(NM_SURNAME_2.has(s.slice(0,2))) surLen = 2;
  else if(NM_SURNAME_1.has(s.charAt(0))) surLen = 1;
  if(!surLen) return '';                                   // 首字(两字)非百家姓 → 外国角色不约束
  const exp = surLen + 2;                                  // 姓 + 两字名
  if(s.length !== exp) return `姓名应为百家姓(${surLen}字姓)+两字名＝${exp}字（当前「${s}」为${s.length}字）`;
  const given = s.slice(surLen);
  if(/([\u4e00-\u9fa5])\1/.test(given)) return `名字不得叠字（「${s}」）`;
  if(NM_WEB_BLACKLIST.some(w => s.indexOf(w) >= 0)) return `疑似网文高频名（「${s}」）`;
  return '';
}

function normalizeBanList(b){
  if(!b || typeof b !== 'object') return null;
  const out = { enabled: !(b.enabled === false) };
  out.chars = Array.isArray(b.chars) ? b.chars.filter(x=>x&&String(x).trim()) : [];
  out.names = Array.isArray(b.names) ? b.names.filter(x=>x&&String(x).trim()) : [];
  out.phrases = Array.isArray(b.phrases) ? b.phrases.filter(x=>x&&String(x).trim()) : [];
  out.rules = Array.isArray(b.rules) ? b.rules.filter(r=>r&&r.text).map(r=>({ text:String(r.text), ai:Array.isArray(r.ai)?r.ai:[] })) : [];
  out.scopeAi = Array.isArray(b.scopeAi) ? b.scopeAi.filter(x=>x) : (Array.isArray(BANLIST_DEFAULT.scopeAi) ? BANLIST_DEFAULT.scopeAi.slice() : []);
  return out;
}
function banListRaw(){ return (state.banList && typeof state.banList === 'object') ? state.banList : BANLIST_DEFAULT; }
function stateBanEnabled(){ const b = banListRaw(); return !(b && b.enabled === false); }
function banListChars(){ const c = banListRaw().chars; return (Array.isArray(c) && c.length) ? c : NM_BANNED_CHARS; }
function banListNames(){ const n = banListRaw().names; return (Array.isArray(n) && n.length) ? n : NM_BANNED_NAMES; }
function banListAiActive(role){
  const sc = banListRaw().scopeAi;
  if(!Array.isArray(sc) || !sc.length) return true;
  return sc.indexOf(role) >= 0;
}
function banListBlockFor(role){
  if(!isLong()) return '';
  if(!stateBanEnabled()) return '';
  const b = banListRaw();
  const lines = [];
  const chars = banListChars(), names = banListNames();
  if(chars.length && banListAiActive(role)) lines.push('人名禁用字：' + chars.join('、') + '（姓名任何位置命中即违规）');
  if(names.length && banListAiActive(role)) lines.push('禁用姓名（不得逐字原样使用或当作现成名）：' + names.join('、'));
  const rules = Array.isArray(b.rules) ? b.rules : [];
  rules.forEach(r => {
    if(!r || !r.text) return;
    const ai = Array.isArray(r.ai) ? r.ai : [];
    if(ai.indexOf(role) >= 0) lines.push(r.text);
  });
  const phrases = Array.isArray(b.phrases) ? b.phrases : [];
  if(role === 'chapter' && phrases.length) lines.push('规避高频模板词/禁用短语：' + phrases.join('、'));
  if(!lines.length) return '';
  return '\n\n【用户禁则清单（最高优先）】\n' + lines.join('\n');
}
function banListViolation(nm){
  const s = String(nm||'').trim(); if(!s) return '';
  const ch = banListChars().find(c => s.indexOf(c) >= 0);
  if(ch) return `名字含禁用字「${ch}」（禁则清单）`;
  if(banListNames().indexOf(s) >= 0) return `命中禁则名单「${s}」`;
  return '';
}



const BOOK_BEAT_OPTIONS = [
  { id:4,  label:'四拍', emoji:'📜', subtitle:'万法之祖 · 四段底层骨架', desc:'中国古典乃至全世界故事的底层骨架：起（铺垫）→承（推进）→转（转折/高潮）→合（后果收束/结局）。', pro:'极度合适、永不过时；结构清晰，适合篇幅中等、想在落笔前先立龙骨的作品。', con:'太过骨架化——大神靠四字就能写出神作，新手实操易卡文，常不知每部分具体该塞什么。', note:'按「起→承→转→合」划分全书三幕/四段。',
    ai:{ stages:['铺垫','推进','高潮','结局收束'],
      duty:['交代世界观、主角处境与主要目标','展开冲突，主角行动升级',
        '全书最高强度的核心高潮事件（关系/利益/真相的关键节点）','收束各线，给出明确结局与余味；若为分卷/续集，可在结局后预留续接口'],
      must:'必须按以上 4 个阶段顺序升格推进；每个阶段必须设置一个明确的阶段高潮事件并标注其性质（如夺得神器/收服人心/破解身世/决战宿敌/绝境反击/真相揭露/关系破冰）；相邻两阶段的性质必须不同。',
      forbid:'禁止跳过任一阶段；禁止把多个阶段揉进同一章；禁止全书反复使用同一种性质的高潮；禁止在阶段内注水无进展的填充内容。' } },
  { id:7,  label:'七拍', emoji:'⚡', subtitle:'商业网文首选 · 七段强节奏', desc:'把「承」拆成两次推进、再以高潮后的收束收尾到结局：铺垫→推进→转折→推进→高潮→后果收束→结局收束。', pro:'节奏感极强，读者像坐过山车；快节奏强冲突，男频升级流 / 女频飒爽文的标配。', con:'全书都是 7 步循环，读多了容易让读者产生「套路疲劳」。', note:'全书大循环按七段推进，情绪高低交替，章节衔接处可留钩，全末尾段必收束到结局。',
    ai:{ stages:['铺垫','推进','转折','推进','高潮','后果收束','结局收束'],
      duty:['交代世界观、主角现状与首个目标','展开首次冲突，主角开始行动','引入变化、阻力升级，计划被打乱','第二阶段加压，主角调整策略继续推进','情绪或利益最高点，本阶段核心回报','高能量回落，收拾后果；若为全书最终段，则收束全书主线并给出明确结局','收束各线，给出全书明确结局与余味；若为分卷/续集，可在结局后预留续接口'],
      must:'必须按以上 7 个阶段顺序升格推进；每个阶段必须设置一个明确的阶段高潮事件并标注其性质（如夺得神器/收服人心/破解身世/决战宿敌/绝境反击/真相揭露/关系破冰）；相邻两阶段的性质必须不同。',
      forbid:'禁止跳过任一阶段；禁止把多个阶段揉进同一章；禁止全书反复使用同一种性质的高潮；禁止在阶段内注水无进展的填充内容。' } },
  { id:12, label:'十二拍', emoji:'🏛️', subtitle:'奇幻/成长史诗 · 心理蜕变', desc:'极细地刻画主角内心成长的每一个心理阶段（拒绝召唤、历险试炼、灵魂黑夜等），心理线与剧情线同步推进。', pro:'长线叙事、心理蜕变刻画深，适合玄幻修仙 / 奇幻冒险 / 人物传记。', con:'前期铺垫过长（前 5 拍都在准备出发），不适合开局就要炸场的题材。', note:'前期铺垫较长，重点写心理蜕变与伙伴/敌人矩阵。',
    ai:{ stages:['日常铺垫','意外触发','内心犹豫','助力推进','决心行动','试炼推进','逼近核心','绝境高潮','压力回落','再生变数','终局高潮','结局收束'],
      duty:['呈现主角常规生活与隐藏诉求','一起意外打破日常，主角被动卷入','主角犹豫是否行动，内心拉扯显形','获得助力/情报，主角定下行动决心','走出舒适区，主动出击','一路试炼积累能力与同伴','逼近主要矛盾核心，阻力全面升级','接近绝境的高压强情绪点（中段高点）','危机暂解，压力回落','再生变数或引发身份真相','全书终局最高强度的对决/揭晓','收束各线，给出结局与余味'],
      must:'必须按以上 12 个阶段顺序升格推进；前期铺垫节奏适中，心理线须随剧情线同步进度；每个阶段必须设置一个明确的阶段高潮事件并标注其性质；相邻两阶段的性质必须不同。',
      forbid:'禁止跳过任一阶段；禁止把多个阶段揉进同一章；禁止全书反复使用同一种性质的高潮；禁止在阶段内注水无进展的填充内容。' } },
  { id:15, label:'十五拍', emoji:'🎬', subtitle:'剧本感/悬疑推理 · 中段拆分', desc:'把「中段」拆得最细：中点、坏人逼近、一无所有、灵魂黑夜、反击、决战，层层反转。', pro:'逻辑严密、多重反转，适合悬疑 / 推理 / 职场商战等注重布局的故事。', con:'对新手过于繁琐，容易为了填满 15 拍而注水。', note:'强调中段布局与多线并置，反转节点需提前预埋。',
    ai:{ stages:['开篇铺垫','主题铺垫','背景铺垫','变故触发','内心质变','换场推进','副线铺垫','轻松推进','中部转折','压力推进','绝境极点','低谷重整','反击转折','终局高潮','结局收束'],
      duty:['立境并给出主角目标','亮出核心命题与主角立场','补世界观与势力关系','由触发事件打破平衡，主角入局','主角第一次重大权衡/质变','进入新环境、新阶段','埋入支线人物与伏笔','相对平缓的一拍，蓄力并埋钩','全书中点的关键转向','局势收紧，主角处处受制','接近绝境的高压强情绪点','低潮收拾、短暂重整','主人公重新集结、发起反击','终局最高强度的对决/揭示','收束各线结局，留余味'],
      must:'必须按以上 15 个阶段顺序升格推进；中段（中部转折至反击转折）须布局多线并置，反转节点必须提前预埋；每个阶段必须设置一个明确的阶段高潮事件并标注其性质；相邻两阶段的性质必须不同。',
      forbid:'禁止为了凑满 15 拍而注水；禁止跳过任一阶段；禁止把多个阶段揉进同一章；禁止全书反复使用同一种性质的高潮；禁止在阶段内无进展地填充内容。' } }
];
const BOOK_BEAT_DEFAULT_ID = 7;
function currentBookBeatId(){ return state.bookBeat ? Number(state.bookBeat) : BOOK_BEAT_DEFAULT_ID; }
function currentBookBeatCfg(){ return BOOK_BEAT_OPTIONS.find(b=>b.id===currentBookBeatId()) || BOOK_BEAT_OPTIONS[0]; }
function bookBeatHtml(){
  const cur = currentBookBeatId();
  return `<div class="book-beat-panel" style="margin:10px 0">
    <div class="poly-head"><span class="poly-ic">🥁</span><b>全书拍子</b><span class="poly-rule">生成大纲前选择</span></div>
    <div class="book-beat-options" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-top:8px">
      ${BOOK_BEAT_OPTIONS.map(b=>`
        <label class="book-beat-card ${b.id===cur?'selected':''}" style="border:2px solid ${b.id===cur?'var(--accent,#4a90e2)':'var(--line,#e0e0e0)'};border-radius:8px;padding:10px;cursor:pointer;transition:.15s">
          <input type="radio" name="bookBeat" value="${b.id}" ${b.id===cur?'checked':''} style="display:none">
          <div style="font-size:18px;margin-bottom:4px">${b.emoji} ${b.label}</div>
          <div style="font-weight:600;font-size:13px;margin-bottom:4px">${b.subtitle}</div>
          <div style="font-size:12px;color:var(--muted);line-height:1.4">${b.desc}</div>
          ${b.pro?`<div class="book-beat-pc pro"><span class="pc-k">优点</span>${b.pro}</div>`:''}
          ${b.con?`<div class="book-beat-pc con"><span class="pc-k">缺点</span>${b.con}</div>`:''}
        </label>
      `).join('')}
    </div>
  </div>`;
}

function bookBeatBriefHtml(){
  const bb = currentBookBeatCfg();
  const stages = (bb.ai && bb.ai.stages) || [];
  const aiBeat = String(state.outline?.aiBookBeat || '').trim();
  return `<div class="decision-brief book-beat-brief">
    <span class="db-lock">🔒</span><b>全书拍子已先定</b>
    <span class="db-main">${bb.emoji} ${esc(bb.label)}</span>
    <span class="db-sub">${esc(bb.subtitle)}</span>
    <span class="db-stages">${stages.map(esc).join(' → ')}</span>
  </div>${aiBeat ? `<div class="ai-book-beat-brief" style="margin:8px 0 10px;padding:10px 12px;border:1px solid var(--line,#ddd);border-radius:10px;background:var(--card,#fff)">
    <div style="font-weight:700;margin-bottom:5px">🧠 优化构想生成的全书故事节拍</div>
    <div style="white-space:pre-wrap;font-size:12px;line-height:1.75">${esc(aiBeat)}</div>
  </div>` : ''}`;
}

const BEAT_OPTIONS = [
  { id:5,  label:'微五拍', emoji:'⚖️', desc:'五段式最稳妥：起头→推进→加转折→交出一项成果→结尾自然停止，节奏不赶不拖、最百搭', types:[
      { key:'setup',  label:'开篇铺垫', uiHint:'开头先说清：在哪里、和谁、要做什么，别急着倒信息。', note:'交代本章的时间、地点与在场人物，说明当前要做的事', aiDirective:'必须用简短铺垫立境（场景＋此刻要做的事）；禁止在本拍灌注大段设定或人物背景。' },
      { key:'rise',   label:'冲突推进', uiHint:'推进主线，制造一处具体阻力或新信息，让情节往前动。', note:'引入一个具体的阻力或新信息，推动本章目标向前进展', aiDirective:'必须引入具体的阻力或新信息推动目标进展，事件要具体可感；禁止原地重复、禁止只剩对话而无动作推进。' },
      { key:'turn',   label:'意外转折', uiHint:'先让人以为会怎样，再给出变化，超出读者预判。', note:'先建立预期，再呈现计划之外的变化，使发展超出读者预判', aiDirective:'必须先立预期再呈现计划外的变化；禁止无铺垫的随意反转、禁止反转后与主线脱节。' },
      { key:'climax', label:'阶段高潮', uiHint:'收拢整段的积累，给出一次明确的成果或回报。', note:'收拢本章积累，达成一次明确的成果或回报', aiDirective:'必须收拢前面积累并交付一项明确的成果/回报/认知；禁止在无积累时凭空给奖励、禁止重复已用过的回报类型。' },
      { key:'hook',   label:'收束/章末节点', uiHint:'完成本章应完成的收束；不设置章末钩子；只执行唯一章末契约。', note:'完成本章结算并自然停止；不设置钩子，直接自然停止', aiDirective:'必须完成本章应有的结算并自然停下；不得把“留钩子”当作默认要求。不得为了结尾制造悬念、前瞻或期待；反转若已在本章真实发生，停在其结果。' }
  ]},
  { id:3,  label:'微三拍', emoji:'🚀', desc:'三段快速爽：开头一小节，中段一口气猛推进，结尾自然停止，一章一个明确节点', types:[
      { key:'setup',  label:'开局铺垫', uiHint:'一两句话交代主角处境和本章要处理的问题，快速入题。', note:'交代主角当前处境与本章要处理的问题', aiDirective:'必须简洁交代主角当前处境与本章要解决的问题并迅速进入；禁止用长篇心理或环境描写拖慢节奏。' },
      { key:'climax', label:'核心进展', uiHint:'给出本章最要紧的进展或成果，回应开头的期待。', note:'给出本章的关键进展或成果，回应开头建立的期待', aiDirective:'必须给出本章关键进展并回应前文期待、占篇幅最大；禁止无进展的注水对白或冗余环节。' },
      { key:'hook',   label:'收束/章末节点', uiHint:'收好本章成果；是否留新信息由本章剧情和结尾决策决定。', note:'收束本章成果，可正常停止，也可按授权留下自然接口', aiDirective:'必须收束本章成果并自然停止；不得强制增加新信息。只有章级结尾决策卡明确要求时，才可留下悬念或下一章接口；禁止强行悬念和重复信息。' }
  ]},
  { id:7,  label:'微七拍', emoji:'🍵', desc:'七段慢慢升温、主打细腻走心：靠人物互动和情绪一点点拉近，不追快进度，结尾留暖意', types:[
      { key:'daily',     label:'日常铺垫', uiHint:'先立时间、地点、气温等感官氛围，让读者进得来。', note:'以时节/气温/光线等感官细节立境，交代时间地点与主角当下去向', aiDirective:'必须用具体的气候、光线、气味等感官细节把日常铺开并立境；禁止在本拍制造冲突或信息倾倒。' },
      { key:'interact',  label:'小互动', uiHint:'引入一个活物或熟识的人，几句最简往来，让画面活起来。', note:'借一个活物或熟识的人带出极简对话的细微往来', aiDirective:'必须借具体活物或熟人带出一段日常互动、对话点到为止；禁止空泛寒暄、禁止长篇对话独白。' },
      { key:'misunder',  label:'小误会', uiHint:'一次轻微又双向的理解偏差，带起一点克制的小波澜。', note:'一次双向无恶意的轻微误解，读者是"早知道"的知情者', aiDirective:'必须设计成双向无恶意的轻微偏差、并让读者处于知情位置制造张力；禁止让误会失控成激烈对立或长时间冷场。' },
      { key:'heart',     label:'谈心推进', uiHint:'借一件共同的琐事把两人推近，走到情感破冰的一刻。', note:'借外在事件（雨/食事/修葺等）促成靠近，推动一次真心交流', aiDirective:'必须用一个具体外在契机把两人推近并推进一段走心对话；禁止用说教或空谈代替具体情节。' },
      { key:'warm',      label:'温馨高点', uiHint:'全段唯一的小高点，力度极轻：只写身体本能，不靠告白。', note:'本段唯一高点但力度极轻：以手温/指尖/汤暖等生理细节呈现暖意', aiDirective:'必须以极轻的生理细节（心跳漏拍、耳朵发烫、低头搅汤、嘴角微弯）呈现暖意；禁止直接表白、禁止大动作煽情。' },
      { key:'glow',      label:'余味收束', uiHint:'情绪缓缓回落，镜头拉远到周遭的声音、气味与光。', note:'情绪回落，镜头拉远收进环境的声音/气味/光线，余味悠长', aiDirective:'必须让上一拍的情绪自然回落、以环境感官细节收束；禁止突然跳入新冲突。' },
      { key:'promise',   label:'前瞻/承诺（可选）', uiHint:'只有剧情自然需要时，才以约定、决定或前瞻形成下一步方向。', note:'可用约定/决定/前瞻收章，但绝非每章必用', aiDirective:'仅当章级结尾决策卡允许且剧情自然需要时使用；不得机械出现“明天/未来/期待/惊喜”。正常完成式收束同样完全合法。' }
  ]},
  { id:2,  label:'双拍结构', emoji:'🔍', desc:'前头一大段慢慢铺陈（看似平淡、其实全是伏笔），最后一小段集中揭晓真相/抛出惊吓，专治悬疑惊悚推理', types:[
      { key:'hold',   label:'长段铺垫', uiHint:'前面一大段都用来铺线索、攒信息，把气氛一点点垫起来。', note:'用较长篇幅铺设线索、逐步积累信息，营造渐进的氛围', aiDirective:'必须用长篇幅连续铺设线索、逐步积累信息、营造渐进氛围；禁止情绪化辞藻堆砌、禁止段落间信息断裂。' },
      { key:'burst',  label:'揭示收束', uiHint:'结尾极短篇幅，把前面线索一次性揭示、收束，并留一句事件后果。', note:'在较短篇幅给出关键揭示并收束前面积累的线索，末尾再以一句交代事件后果或余味', aiDirective:'必须在结尾用较短篇幅对前面积累的线索给出关键揭示并收束，各线索须自洽串起；揭示收束后必须再以一句交代事件后果或余味再结束；禁止为反转引入未铺垫的新元素、禁止悬而未决、禁止揭晓后戛然而止无任何收尾。' }
  ]}
];
const BEAT_DEFAULT_ID = 5;
const BEAT_LABEL_ALL = (()=>{ const m={}; BEAT_OPTIONS.forEach(c=>c.types.forEach(t=>{ m[t.key]=t.label; })); return m; })();
const BEAT_LEGACY_LABEL = {
  rise2:'推进', after:'后果收束', turn:'转折', incident:'意外触发', hesitate:'内心犹豫', assist:'助力推进',
  resolve:'决心行动', trial:'试炼推进', core:'逼近核心', abyss:'绝境高潮', afterglow:'压力回落',
  return_turn:'再生变数', final_climax:'终局高潮', harmony:'结局收束', open:'开篇铺垫', theme:'主题铺垫',
  bg:'背景铺垫', catalyst:'变故触发', inner_turn:'内心质变', new_world:'换场推进', subline:'副线铺垫',
  easy:'轻松推进', mid_turn:'中部转折', pressure:'压力推进', dark_climax:'绝境极点', despair:'低谷重整',
  counter:'反击转折', close:'结局收束'
};
const BEAT_HINT_ALL = (()=>{ const m={}; BEAT_OPTIONS.forEach(c=>c.types.forEach(t=>{ m[t.key]=t.uiHint||''; })); return m; })();
const BEAT_ENDING = {
  key:'ending', label:'全书结局',
  uiHint:'（仅全书末章使用）收束全书主线与各主要人物归宿，给出核心冲突的最终解决与确定结局或余味，不再留悬念钩子。',
  note:'仅当该章为全书最后一章时作为末拍使用：收束全书主线、交代各主要人物归宿与冲突的最终解决（~500字）',
  aiDirective:'仅作为全书最后一章的末拍使用：必须对全书主线与各主要人物归宿作收束、给出确定结局或明确余味；禁止再留悬念钩子、禁止开放式烂尾。'
};
if(!BEAT_LABEL_ALL[BEAT_ENDING.key]) BEAT_LABEL_ALL[BEAT_ENDING.key] = BEAT_ENDING.label;   // 显示层识别「结局」拍
if(!BEAT_HINT_ALL[BEAT_ENDING.key])  BEAT_HINT_ALL[BEAT_ENDING.key]  = BEAT_ENDING.uiHint;  // 提示层识别「结局」拍
function currentBeatId(){
  const o=state.outline;
  let v = o && o.beatCount ? Number(o.beatCount) : BEAT_DEFAULT_ID;
  if(!BEAT_OPTIONS.some(b=>b.id===v)) v = BEAT_DEFAULT_ID;
  return v;
}
function currentBeatCfg(){ return BEAT_OPTIONS.find(b=>b.id===currentBeatId()) || BEAT_OPTIONS[0]; }
function beatTypesDefs(){ return currentBeatCfg().types; }
function beatTypeKeys(){ return beatTypesDefs().map(t=>t.key); }
function beatCnt(){ return beatTypesDefs().length; }
function beatLabelFor(key){ return BEAT_LABEL_ALL[key] || BEAT_LEGACY_LABEL[key] || (()=>{ const t=beatTypesDefs().find(x=>x.key===key); return t?t.label:key; })(); }
function beatNoteFor(key){ return BEAT_HINT_ALL[key] || ''; }
function isClimaxType(key){ return /高潮|高点/.test(BEAT_LABEL_ALL[key] || key); }

const STRIP_READ_SYS_LEGACY = `你是一名长篇章节「速读梗概」撰写助手。本章梗概的最大来源是本章正文，其余（词典）仅作参考；你要做的是把本章正文压缩到约 1/3 的字数，让没耐心读完全文的读者能省时读完，却基本不失信息。
要求：
1. 只依据【本章真实正文】概括，覆盖：主要情节推进、关键对话意图、人物状态变化、情绪转折、章末悬念/钩子。
2. 可舍弃：环境描写、场景铺陈、修辞排比、次要过程性动作。
3. 不得遗漏正文中的人物、地点、专名、关键事件与因果；不得虚构正文没有的内容；不剧透下一章。
4. 目标字数约 [TARGET_ZHS] 字，请落在目标字数的 0.9–1.1 倍区间内（即 [LO_HI] 字之间）。
5. 只输出梗概正文本身，不要 markdown 代码块、不要「第N章」前缀、不要解释。`;

const STRIP_READ_SYS_PRO = `你是一位资深长篇章节「速读梗概专员」。
【核心任务】把本章正文压缩到约 1/3 字数，让没耐心读完全文的读者省时读完且基本不失信息。

【输出要求】
1. 只依据【本章真实正文】概括，覆盖：主要情节推进、关键对话意图、人物状态变化、情绪转折、章末悬念/钩子。
2. 可舍弃：环境描写、场景铺陈、修辞排比、次要过程性动作。
3. 不得遗漏正文中的人物、地点、专名、关键事件与因果；不得虚构正文没有的内容；不剧透下一章。
4. 目标字数 [TARGET_ZHS] 字，必须落在 [LO_HI] 字之间（目标字数的 0.9–1.1 倍）。
5. 只输出梗概正文本身，不要 markdown 代码块、不要「第N章」前缀、不要解释。

【失败处理】
若无法达到字数区间，请在输出末尾附加单行：<!-- STRIP_LEN: 实际字数 -->，程序将捕获并提示用户。`;

const STRIP_READ_SYS = STRIP_READ_SYS_PRO;

function validateStripLen(text, target){
  const len = countWords(String(text||'')).cjk;
  const lo = Math.round(target * 0.9);
  const hi = Math.round(target * 1.1);
  return { ok: len >= lo && len <= hi, len, lo, hi };
}

const AIValidators = {
  idea: validateIdeaProOutput,
  titles: validateTitleOutput,
  subplot: validateSubplotOutput,
    glossary: validateGlossaryExtract,
    strip: validateStripLen,
    dictmaster: validateDictMasterOutput
};

function ideaKeyTerms(idea){
  const t = String(idea||'').trim();
  const coined = new Set(), soft = new Set();
  (t.match(/[“"「『《]([^”"」』》]{1,12})[”"」』》]/g)||[]).forEach(s=>{ const w=s.slice(1,-1).trim(); if(w) coined.add(w); });
  const words = t.match(/[\u4e00-\u9fa5a-zA-Z0-9]{2,8}/g)||[];
  const STOP = new Set(['一个','一种','这个','那个','什么','怎么','可以','我们','他们','自己','故事','主角','因为','所以','但是','然后','就是','不是','也是','也要','就会','就要','才能','只能','只会','还要','都会','都在','其实','虽然','甚至','以及','或许','几乎','感觉','知道','发现','以为','如果','但是','可能','只是','因为','于是','可是','不是','没有','着','却','就']);
  const freq = {}; words.forEach(w=>{ if(!STOP.has(w)) freq[w]=(freq[w]||0)+1; });
  Object.keys(freq).forEach(w=>{ if(freq[w]>=2) (coined.has(w) ? coined : soft).add(w); });
  const short = t.length < 15;
  return { coined:[...coined], soft:[...soft], short };
}
function validateIdeaFaithful(j, idea){
  const { coined, soft, short } = ideaKeyTerms(idea);
  if(short || (!coined.length && !soft.length)) return '';       // 极短/无关键词：豁免
  const blob = JSON.stringify(j);
  const missC = coined.filter(w => !blob.includes(w));
  const missS = soft.filter(w => !blob.includes(w));
  const total = coined.length + soft.length;
  if(missC.length >= 2){
    return `未保留用户核心专名（丢 ${missC.length}/${coined.length}）：${missC.slice(0,5).join('、')}`;
  }
  if(total && (missC.length + missS.length) > Math.ceil(total * 2 / 3)){
    return `核心设定词命中率偏低（丢 ${missC.length + missS.length}/${total}）：${(missC.concat(missS)).slice(0,5).join('、')}`;
  }
  return '';
}
function validateIdeaProOutput(j, ctx){
  if(j === null || j === undefined) return {ok:true};          // 纯文本无 JSON：放行
  if(typeof j !== 'object') return {ok:false, code:'EMPTY'};   // 非 null 但非对象（罕见脏数据）仍拒
  if(j.brief && typeof j.brief === 'object'){
    return {ok:true};
  }
  if(Array.isArray(j.options) && j.options.length){
    const bad = j.options.find(o=>!o || typeof o!=='object' || !String(o.optimizedIdea||o.text||'').trim());
    return bad ? {ok:false, code:'OPTION_EMPTY'} : {ok:true};
  }
  // 新版允许单方案直接返回丰富蓝本；字段可选，但必须至少有可供下游创作的正文蓝本/简介/节拍之一。
  if(String(j.optimizedIdea||j.text||j.novelSummary||j.fullBookBeat||'').trim()){
    return {ok:true};
  }
  const err = validatePolishOutput(j);
  return err ? {ok:false, code:'SCHEMA', details:err} : {ok:true};
}

function validateAIOutput(kind, raw, ctx){
  const j = extractJsonObject(raw);
  if(j && j.error) return {ok:false, code:'AI_ERROR', details:j.error};
  const fn = AIValidators[kind];
  if(!fn) return {ok:true};
  const arg = (kind === 'chapter' || kind === 'strip') ? raw : j;
  const r = fn(arg, ctx);
  if(r && typeof r === 'object' && 'ok' in r) return r;                       // {ok} 对象约定
  if(typeof r === 'string') return r ? {ok:false, code:'SCHEMA', details:r} : {ok:true};
  return r ? {ok:false, code:'SCHEMA', details:String(r)} : {ok:true};
}

async function callAIGuarded(kind, systemOrExtra, userOrOpts, ctx, opts){
  const _tmKey = TM_KEYS.includes(kind) ? kind : null;
  const _unwrap = (res) => {
    const txt = unwrapAIResult(res);
    if(res && res.finishReason === 'length'){
      throw new Error(`${kind} AI 输出被截断，请增大输出上限或减少篇幅后重试`);
    }
    return txt;
  };
  if(typeof systemOrExtra === 'string'){
    const _sysAug = systemOrExtra + globalCreativeConstraintBlock(kind);
    const txt = _unwrap(await callDeepSeek(_sysAug, userOrOpts, Object.assign({}, opts||{}, _tmKey?{taskKey:_tmKey}:{})));
    const report = validateAIOutput(kind, txt, ctx);
    if(!report.ok){
      throw new Error(`${kind} AI 输出校验失败：${report.code} ${report.details || ''}`);
    }
    return txt;
  }
  const extra = systemOrExtra || {};
  const callOpts = Object.assign({}, userOrOpts||{}, _tmKey?{taskKey:_tmKey}:{});
  const system = getSystemPrompt(kind, extra) + globalCreativeConstraintBlock(kind);
  const user = buildAIPrompt(kind, extra);
  const busCtx = AIBus.get(kind, extra);
  const txt = _unwrap(await callDeepSeek(system, user, callOpts));
  const report = validateAIOutput(kind, txt, busCtx);
  if(!report.ok){
    throw new Error(`${kind} AI 输出校验失败：${report.code} ${report.details || ''}`);
  }
  return txt;
}

const AIBus = {
  get(kind, extra){
    const o = state.outline || {};
    const nb = o.navBeacon || '';
    const base = {
      mode: state.mode,
      longMode: isLong(),
      navBeacon: nb,
      idea: state.idea || ''
    };
    switch(kind){
      case 'idea': return { ...base, rawIdea: state.idea || '' };
      case 'titles': return { ...base, outline: o, glossary: o.glossary, expectedN: extra?.n || (o.chapters||[]).length };
      case 'chapter': return this._chapterCtx(extra?.idx);
      case 'subplot': return { ...base, chapterIdx: extra?.idx, content: state.chapters[extra?.idx]?.content, prevLog: (o.glossary?.subplots)||[] };
      case 'glossary': return { ...base, chapterIdx: extra?.idx, content: state.chapters[extra?.idx]?.content, existingGlossary: o.glossary };
      case 'strip': return { ...base, chapterIdx: extra?.idx, content: state.chapters[extra?.idx]?.content, targetZhs: extra?.targetZhs };
      case 'dictmaster': return { ...base, outline: o, candidate: currentCanonicalStoryStrategy() || null };
      default: return base;
    }
  },

  _chapterCtx(idx){
    const o = state.outline || {};
    const c = state.chapters[idx];
    const prev = state.chapters[idx-1];
    const next = state.chapters[idx+1];
    const plan = (o.chapterPlans||[])[idx] || {};
    return {
      mode: state.mode, longMode: isLong(),
      navBeacon: o.navBeacon || '',
      L1_outline: { title: o.title, logline: o.logline, tone: o.tone, total: (o.chapters||[]).length, idx: idx+1 },
      L2_chapter: { title: c?.title, beatsText: (plan && String(plan.beatsText||'').trim()) ? plan.beatsText : '', emotionalArc: plan.emotionalArc, requiredEntities: plan.requiredEntities },
      L3_neighbor: { prevTitle: prev?.title, prevTail: prev?.content?.slice(-300), nextTitle: next?.title, lastScene: o._factCard?.lastScene },
      L4_context: { rollingSummaries: buildRollingSummary(idx), relevantGlossary: relevantGlossaryForChapter(idx) }
    };
  }
};

function getSystemPrompt(kind, extra){
  switch(kind){
    case 'idea': return IDEA_POLISH_SYS + (extra && extra.multi ? POLISH_MULTI_MODE : POLISH_SINGLE_MODE);
    case 'titles': return REGEN_TITLES_SYS;
    case 'chapter': return longChapterSys();
    case 'subplot': return SUBPROGRESS_UPDATE_SYS;
    case 'glossary': return GLOSSARY_EXTRACT_SYS;
    case 'dictmaster': return DICTMASTER_SYS;
    case 'strip': {
      const ctx = AIBus.get('strip', extra);
      const target = ctx.targetZhs || 300;
      const lo = Math.round(target*0.9), hi = Math.round(target*1.1);
      return STRIP_READ_SYS.replace('[TARGET_ZHS]', target).replace('[LO_HI]', `${lo}–${hi}`);
    }
    default: throw new Error('未知 AI kind: '+kind);
  }
}

function buildAIPrompt(kind, extra){
  const ctx = AIBus.get(kind, extra);
  switch(kind){
    case 'idea': return buildIdeaPolishUserFixed(ctx);
    case 'titles': return titlesGenUser(extra);
    case 'chapter': return buildChapterUser(extra?.idx, extra);
    case 'subplot': return buildSubplotUser(ctx);
    case 'glossary': return buildGlossaryExtractUser(ctx);
    case 'dictmaster': return buildDictMasterUser(ctx);
    case 'strip': return buildStripUser(ctx);
    default: throw new Error('未知 AI kind: '+kind);
  }
}

function buildIdeaPolishUserFixed(ctx){
  const lines = [`【用户构想】\n${String(ctx.rawIdea || '').trim()}`];
  const wsItems = wsGroupStyleTags(null);
  if(wsItems && wsItems.length){
    const names = wsItems.map(s=>s.name).join(' + ');
    const details = wsItems.map(s=> `· ${s.name}：${s.note||''}${Array.isArray(s.tips)&&s.tips.length?`（写法：${s.tips.join('；')}）`:''}`).join('\n');
    lines.push(`【用户已锁定的写作风格（所有方案必须严格服从的最高基准）】\n已选定风格：${names}\n风格核心要求：\n${details}\n【硬性要求】本次生成的全部方案中，「风格」字段及行文基调都必须严格以用户选定的上述写作风格为核心基石；允许且鼓励在此基础上为不同方案做契合的【风格补充】（如针对该方案特色的细节侧重、氛围点缀），但补充的风格必须与用户已选定的主风格完全和谐、绝不冲突违和。`);
  }
  const bb = currentBookBeatCfg();
  const mb = currentBeatCfg();
  const cc = chapterCountVal();
  const parts = [];
  if(bb) parts.push(`全书拍子·${bb.label}（${bb.subtitle}）\n阶段：${((bb.ai && bb.ai.stages) || []).join(' → ')}`);
  if(mb) parts.push(`章节微拍·${mb.label}${mb.wc ? `（${mb.wc}）` : ''}`);
  if(cc) parts.push(`全书章节数：${cc} 章`);
  if(cc){
    const plan = bookStagePlan(cc);
    if(plan && plan.length){
      const seg = []; let cur = 0;
      plan.forEach(p=>{ const a = cur + 1; cur += p.n; seg.push(`第 ${a}—${cur} 章「${p.name}」`); });
      parts.push(`【章节↔全书拍子落位】全书 ${cc} 章按当前拍子解析为 ${plan.length} 段：${seg.join('；')}`);
    }
  }
  const tb = teamShapeBrief();
  if(tb) parts.push(tb);
  if(parts.length) lines.push(`【已选叙事结构】\n${parts.join('\n\n')}`);

  parts.push(`【动态战略维度硬约束】
本次绝不使用固定“五向”。请先在内部从当前故事中动态识别6—10个最契合的候选战略维度，再用这些维度组合3—5个最终方案。最终方案必须给出 originalAnchors、strategicDimensions、strategyFingerprint；strategyFingerprint至少包含 mainStrategy、secondaryStrategy、coreConflict、storyEngine、emotionalPromise、pacing。若方案之间战略指纹高度相似，必须重新设计。`);
  return lines.join('\n\n');
}
function buildSubplotUser(ctx){
  const chIdx = ctx.chapterIdx;
  const body = String(ctx.content || '').trim();
  const o = state.outline || {};
  const g = (o.glossary) || {};
  const subs = (Array.isArray(g.subplots)?g.subplots:[]).filter(Boolean);
  const prog = subs.map(s=>{
    const nm = String(s.name||'').trim() || '（未命名）';
    const ts = (Array.isArray(s.log)?s.log:[]).map(x=>`第${x.ch}章${x.note?`（${x.note.trim()}）`:''}`).join(' → ');
    const q = String(s.question||'').trim();
    return `· ${nm}（${['进行中','搁置','已收束'].includes(s.status)?s.status:'进行中'}）${q?`｜问：${q}`:''}\n  ${ts||'（尚无进度）'}`;
  }).join('\n') || '（暂无副线）';
  return `【本章正文（第 ${chIdx+1} 章）】\n${String(body).slice(-50000)}\n\n【现有副线进度】\n${prog}`;
}
function buildGlossaryExtractUser(ctx){
  const o = state.outline || {};
  const g = (o.glossary) || {};
  const dict = [['characters','人物'],['places','地点'],['propernouns','专名']].map(([k,label])=>{
    const arr = (g[k]||[]).map(x=>x&&x.name).filter(Boolean);
    return arr.length ? `${label}：${arr.join('、')}` : `${label}：（无）`;
  }).join('\n');
  return `【现有词典】\n${dict}\n\n【本章正文】\n${String(ctx.content||'').slice(-50000)}`;
}
function buildStripUser(ctx){
  const chIdx = ctx.chapterIdx;
  const o = state.outline || {};
  const body = String(ctx.content||'').trim();
  return `【本章真实正文】\n${body.slice(-50000) || '（本章暂无正文）'}`;
}



function canRunAI(kind){
  if(kind==='outline' && !currentCanonicalStoryStrategy()) return false;
  const deps = {
    idea: [],
    recipe: [],
    outline: ['idea'],
    titles: ['outline'],
    chapterPlan: ['outline','titles'],
    chapter: ['outline','titles','chapterPlan'],
    subplot: ['chapter'],
    glossary: ['chapter'],
    strip: ['chapter']
  };
  const net = state.aiNetwork;
  return (deps[kind]||[]).every(d => d === 'idea' || net.completed?.includes(d) || d === kind);
}

function markAIRunning(kind){
  state.aiNetwork.running = Array.from(new Set([...(state.aiNetwork.running||[]), kind]));
  persist();
}

function markAIDone(kind){
  state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!==kind);
  state.aiNetwork.completed = Array.from(new Set([...(state.aiNetwork.completed||[]), kind]));
  persist();
}

function addToFixQueue(entry){
  state._fixQueue = state._fixQueue || [];
  if(entry && Number.isInteger(entry.ch)){
    const exist = state._fixQueue.find(x => x.ch === entry.ch);
    if(exist){ exist.attempts = (exist.attempts||1) + 1; exist.ts = Date.now(); }
    else state._fixQueue.push({ ch:entry.ch, code:entry.code, errors:entry.errors||[], attempts:1, ts:Date.now() });
  } else if(entry && entry.kind){
    const exist = state._fixQueue.find(x => x.kind === entry.kind && !Number.isInteger(x.ch));
    if(exist){ exist.error = entry.error; exist.attempts = (exist.attempts||1)+1; exist.ts = Date.now(); }
    else state._fixQueue.push({ kind:entry.kind, error:entry.error, raw:entry.raw||'', attempts:1, ts:Date.now() });
  }
  persist();
}

const LANG_LAYER_SYS = `【语言分层（硬约束）】
可读性自检：逐句自问"读者需要拐弯才能懂吗？"需要即改大白话。`;

function langLayerInjection(){
  if(!isLong() || !state.langLayer) return '';
  return '\n\n' + LANG_LAYER_SYS;
}

const NARRATIVE_IRON_HARD = `〔硬约束 · 铁律，不可逾越，冲突时以此为准〕
· 禁止直接叙述人物内心情绪。禁止出现直白内心描写；必须尽量改用选择、动作、停顿、语气、回避、让步、反问、具体需求与后果外显情绪。外显动作必须克制且有变化：同章内同一种微表情/小动作（如咬牙、攥拳、拧眉、垂眸、绞手）原则上最多一次，不得把动作当固定情绪标签。
· 禁止频繁使用网文模板词（倏然、眸光、眼底、凤眸、邪魅一笑、轻嗤）。同章内同类模板词原则上最多一次，能删必修。
· 对白必须口语化，禁止「端着」的书面腔台词。允许半截话、打断、停顿、反问、回避、试探、误解与没说完的话；古风也必须写现代人能读懂的人话。
· 对话禁止承担“百科广播”职责：人物知道什么、为什么做、过去发生什么，优先通过当下目标、冲突、行动和潜台词体现；只有对方确实需要知道、角色确实愿意说、且说出口本身有戏剧功能时，才直接交代背景。
· 人物行为必须有清晰动机，禁止无故推进剧情。禁止过度美化人物：言行必须与境界相符，允许小瑕疵、怯懦、私心、口误、误判与嘴硬。
· 【人物鲜明原则】人物不是靠口癖区分，而是靠“稳定内核 + 情境变化 + 层次反应”区分。同一件事，不同人物应因目标、经验、关系、利益和性格产生不同反应；同一人物也不能每次都机械复用同一个动作、句式或情绪标签。
· 【信息单次落地】本章内一个关键事实/设定/人物关系首次让读者理解后，后文默认读者已经知道；除非发生新证据、新视角、新后果或认知变化，不得换一种说法再完整解释一遍。自然提及可以，重复科普不可以。
· 【事实一致】人物身份、年龄、关系、时间、地点、道具、能力、知情边界和事件因果一旦在本章成立，后文必须把它当既成事实；如新信息与旧信息冲突，必须通过明确的新发现/误解纠正来解释，禁止无提示自相矛盾。
· 【句式变化】连续段落不得长期使用同一语法骨架、同一“人物+动作+对白+然后”模式或同一种情绪收束方式；变化来自叙述焦点、句长、动作、对白、环境和信息位置，而不是机械要求每句换结构。
· 书面语是藏起来的底牌：旁白可按题材适度书面，但对白必须口语；书面语只在确有表达价值时使用。`;


const NARRATIVE_IRON_SOFT = `〔软约束 · 尽力而为、随题材微调〕
· 可给核心人物绑定 1-2 个专属口头禅，写到自然出现、不刻意。
· 生活化细碎细节（真实毛边）应随情节自然分布：只在能推进氛围/塑造人物时出现，禁止为凑数量而每章硬塞、禁止同一种细节反复复用。
· 语言底色必须随题材稳定贯穿全书，禁止中途漂移：都市/网游/沙雕→贴近生活口语；仙侠/红楼风→适度书面高级感。
· 快节奏场景必须优先大白话短句，禁止绕弯长句，保证读者一目十行不卡壳。`;

const NARRATIVE_IRON_PLANNING = `【全书叙事铁律·规划层】这是用户对整部小说的长期硬要求，校长、老师、构想规划阶段必须据此设计，不能等正文写完再补救：
· 禁止把“人物内心独白/情绪解释”当作主要叙事推进手段；人物心理应尽量转化为可观察的行动、选择、对话、停顿、反应与后果。
· 禁止以全知上帝视角提前替读者解释答案、幕后真相或配角内心；规划时必须保留合理的信息差与侦探权。
· 禁止设计依赖大段作者广播、百科式背景倾倒才能成立的情节；世界观应能通过角色行动、场景、对话与具体事件自然显露。
· 禁止把网文模板词、固定开场、重复情绪动作当成章节节奏工具；章节开法、冲突触发方式与场景推进应有变化。
· 任何“为了显得有深度而增加心理解释/全知旁白”的设计均视为错误设计；优先设计可被拍出来、演出来、说出来的剧情动作。
· 以上只约束叙事方式与剧情设计，不限制题材、人物、世界观的正常创造，也不剥夺 AI 的创造自由。`;

function globalCreativeConstraintBlock(kind){
  const creative = ['idea','principal','teacher','chapter','planner','outline'];
  const banRoles = ['idea','titles','dictmaster','dictEnrich','principal','teacher'];
  const parts=[];
  if(banRoles.indexOf(kind)>=0 && stateBanEnabled()){
    const b=banListRaw();
    const chars=banListChars(), names=banListNames();
    if(chars.length) parts.push('【用户禁则清单·全书姓名禁用字】以下字不得用于新人物/地点/专名命名：'+chars.join('、'));
    if(names.length) parts.push('【用户禁则清单·全书禁用姓名】以下姓名不得被新创作、复用、建议或写入本阶段成果：'+names.join('、'));
    const rules=Array.isArray(b.rules)?b.rules:[];
    rules.forEach(r=>{ if(r&&r.text && (!Array.isArray(r.ai)||!r.ai.length || r.ai.indexOf(kind)>=0)) parts.push('【用户禁则·规则】'+String(r.text).trim()); });
  }
  if(creative.indexOf(kind)>=0 && kind!=='chapter' && state._narrIron!==false) parts.push(NARRATIVE_IRON_PLANNING);
  return parts.length ? '\n\n'+parts.join('\n') : '';
}

function narrativeIronBlock(role, opts){
  const parts = [];
  const ban = banListBlockFor(role);
  if(ban) parts.push(ban);
  if(role === 'chapter'){
    const lang = langLayerInjection();
    if(lang) parts.push(lang);
  }
  const sep = '\n\n';
  opts = opts || {};
  if(opts.lean){
    const head = '【规划纪律（精简）】节拍事件须有清晰动机、禁止无故推进剧情、禁止各章事件雷同或套模板。';
    return parts.filter(Boolean).length ? sep + head + '\n' + parts.join('\n') : head;
  }
  if(state._narrIron === false){
    const block = parts.filter(Boolean).join('\n');
    return block ? sep + '【叙事纪律（铁律已关闭，仅保留禁则/语言分层等中间件）】\n' + block : '';
  }
  const iron = role === 'chapter' ? NARRATIVE_IRON_HARD + '\n' + NARRATIVE_IRON_SOFT : NARRATIVE_IRON_HARD;
  let ironFull = iron;
  if(role === 'chapter' && shapeKind() === 'team'){
    ironFull += '\n【团队铁律】本书为团队叙事，核心团各成员凡在本章出场就必须有"存在性"——有对话、有动作、或有专属于该成员的反应/细节，不得被写成背景板或纯提线木偶；禁止主角一人单刷全篇、队友全程挂机——凡危机须体现靠成员互补能力/配合拆解；多人对话要有可辨识的声口与立场，避免把多条声音堆成一片没有区别的对白。';
  } else if(role === 'chapter' && shapeKind() === 'dual'){
    ironFull += '\n【双主角铁律】本书为双主角叙事，两名主角各有独立行动场景与弧线：本章凡涉及双主角，须给双方各自实质性的镜头与推进，不得把某一方写成另一方的附庸/背景；双视角切换必须有明确触发点与衔接（换场景/换段），禁止在同一场景内无节制的视角跳转；两人同场时，其对视/争执/配合要写得有张力与辨识声口。';
  }
  if(role === 'chapter'){
    ironFull += '\n【章首铁律】章首开法**必须**有变化：**禁止**全书或连续多章重复同一种开法、**禁止**每章都以同一类人物动作或同一类时间词起句、也**禁止**连续两章雷同，小说整体**禁止**某一种开法超过三成。下面各方式**可以**混用、**必须**轮流换着来：①续写式（优先）：优先从本章教案规定的起点、事件现场或已提供的状态依据切入；例："『这话可说不得。』上回话到一半，屋里便只剩扇子敲桌沿的声响。"；②场景/环境式：从能即时带出情绪与冲突的场景细节/物件/光线/动静切入，人物稍后才点名；例："檐角铜铃被夜风拨响时，堂屋的灯还亮着，桌上摊着两封未拆的信。"；③人物开句式：以人物称谓开句**可以**，但须与前后章错开、**禁止**连续两章相同；④时间开句式：以时间词开句**可以**，但**禁止**连续两章都用时间词开句；⑤他人/群像式：从他人口中或反应侧写入物处境，出场人物不占句首；例："『那人的名讳一提就烫嘴。』有人压着嗓子嘀咕。"；⑥直接回接式：从上一章已经发生的事实继续，不预告下一步；例："那封密信还在桌角，纸边已经被水汽卷起。"';
  }
  if(role === 'chapter'){
    ironFull += '\n【视角与反剧透铁律】全章以主角的受限感知推进：只写主角能\/看到听到摸到感知到的；想表现他人内心，一律从主角的观察与推断出发，禁止直接钻进路人\/配角\/反派的内心"读心"。禁止提前揭示读者与主角尚不该知道的答案：伏笔只许一笔带过地埋伏笔，不点破、不解释、不揭示答案（不剥夺读者的"侦探权"）。背景\/世界观\/前史情报必须"寄生"在角色的即时感官里（听\/闻\/触）传达，禁止作者跳出来大段广播。仅在章\/节分界明显、或关键时刻"只展示不解释"的客观动作、或悬念兑现时，才可短暂切出并立即回到主角。';
  }
  const head = role === 'chapter'
    ? '【叙事铁律 · 本章写作总纲】'
    : '【叙事铁律 · 规划纪律总纲】（禁止项同样约束规划阶段的设计）';
  return sep + head + '\n' + parts.filter(Boolean).join('\n') + '\n' + ironFull;
}

const REGEN_TITLES_SYS_LEGACY = `你是一位深谙标题艺术与长篇小说结构的章节标题策划师。

【核心任务】
根据小说书名、简介、导航灯塔（navBeacon）、设定词典，为每一章生成一个既有表现力又服从全书节奏的标题。

【输出格式】
严格只输出如下 JSON（不要解释、不要 markdown 代码块）：
{"titles":["第1章 标题","第2章 标题",...]}

【硬性约束】
1. titles 数量必须严格等于【全书章节数 N】，一章不增、一章不减。
2. 每个标题必须满足：
   a. 与本书简介、navBeacon.coreConflict 保持一致；
   b. 不剧透后续反转与结局；
   c. 不引入设定词典之外的新人物/地名/专名；
   d. 立意从本作独特设定推导，避免"xx之怒/惊变/震惊"式流水线命名。
3. 标题必须服从全书节奏：贴合本章当前的叙事推进职责，不得提前透露后续阶段剧情。
4. 若用户提供了【标题风格】（归纳/画龙点睛/文学语句/字数工整），所有标题必须统一服从该风格；若提供了多种风格，以第一个为准。
5. 若用户提供了【重生成要求】，以该要求为最高优先级，但不得违反设定一致性。
6. 相邻标题不得重名或高度相似；同一核心意象全书使用不超过 3 次。
7. 每个标题 ≤ 20 字。`;

const REGEN_TITLES_SYS_PRO = `你是一位资深长篇小说「章节标题策展人」，同时是标题审计师。
【核心任务】根据给定的小说信息，在【不改变章节数量与顺序】的前提下，为每一章生成一版最终标题。

【输出格式（纯文本 · 一个标题一行）】
第1章 标题
第2章 标题
……
第N章 标题
（N 为章节总数，由用户提示给定）

【标题生成契约】
1. 每行一个标题，必须以「第N章 」开头（N 为阿拉伯数字），后接空格，再接章节名；行数必须严格等于章节总数，一章不多、一章不少。
2. 每个标题名 ≤18 字。
3. 标题必须：贴合本章剧情走向、不剧透后续反转、不泄露结局、不与相邻章标题重名或高度相似。
4. 标题风格必须贴合【所选方案蓝本】中的「风格 / 基调 / 核心词」与【写作风格】；若风格为「冷峻克制」，标题不得煽情；若风格为「热血燃向」，标题不得过于婉约。
5. 标题中不得引入设定词典以外的新人名/地名/专名。
6. 只输出上述纯文本，不要 JSON、不要 markdown 代码块、不要任何解释与前缀后缀。

【输出示例】
第1章 雾中第七日
第2章 旧信
第3章 退休法医`;

const REGEN_TITLES_SYS = REGEN_TITLES_SYS_PRO;


const IDEA_POLISH_SYS_PRO = `你是本项目的“AI构想优化与小说策划引擎”。你的工作方式参考高质量 Prompt Engineering：先理解用户真正想表达什么，再补齐隐含创作需求、识别约束、建立故事因果，并把一个可能只有一句话的点子，扩展成“真的可以继续写成一部长篇小说”的创作蓝本。

【第一原则：理解，而不是机械改写】
1. 先在内部解析用户输入：明确事实、隐含意图、题材、主角、欲望、冲突、读者期待、叙事方向、风格、已知限制。
2. 用户说得很短，不代表只能输出很短。只要用户意图足够明确，就主动补齐“可写性”所需的合理桥梁。
3. 用户没有明确的地方可以创造，但必须服务于原始创意；重大新设定必须保持为“方案创意”，不能伪装成用户已经确定的事实。
4. 不要反复追问用户。能根据上下文合理判断就直接做；确实无法确定时，保留多条可行解释并用多方案呈现。
5. 不要只做语言润色。必须把“点子”转化为“故事发动机”：主角想要什么、为什么必须行动、谁/什么阻止他、行动造成什么变化、变化怎样产生下一轮问题。

【第二原则：目标是可写成小说】
每个保留方案都必须具有长期可扩展性，至少形成：
用户原始核心 → 主角欲望 → 核心矛盾 → 持续压力 → 阶段性目标 → 关系变化 → 中段升级 → 关键转折 → 高潮方向 → 结局方向 → 可继续写的尾部余波。

“可写成一部小说”不等于替后续 AI 写完整章节。你输出的是高密度故事蓝本：足够具体，让词典达人、校长、老师、正文AI都能继续工作；但不要把内容锁死到逐章教案。

【第三原则：用户事实优先】
用户明确写出的题材、主角、身份、世界观、核心能力、关系、冲突、时代、风格、固定名称必须保留。不得为了所谓“更商业”而偷换。
AI可以深化：人物动机、冲突机制、故事动力、长期悬念、关系张力、阶段目标、结局方向、必要的世界规则。
AI不得无依据地把新人物、新势力、新能力、新世界规则当成既定事实。新创内容应明确写入“方案蓝本/创意补充”，让下游知道哪些是建议而不是用户原话。

【第四原则：动态战略维度，而不是固定五向】
绝对禁止把故事套进固定的“商业/反差/情感/悬疑/日常”等固定五向模板。你必须先根据当前故事题材、混合题材、主角驱动力、核心冲突、人物关系、世界规则、信息结构、读者体验和创作目标，在内部动态生成约6—10个最契合的【候选战略维度】。
每个战略维度必须说明：name、description、whyFit。不同题材必须得到不同的战略地图；武侠、科幻、言情、历史、悬疑等不能共用一套固定盒子。
然后从战略维度中组合3—5个最终方案。每个方案必须拥有独立的战略指纹：主战略、辅助战略、核心冲突、故事发动机、情绪/阅读期待、节奏。若两个方案的战略指纹高度相似，应内部重做，不得用改标题、换同义词、换表达方式冒充不同方案。
同时先提取【原始构想核心锚点】（人物、关系、目标、核心冲突、世界规则、用户明确设定等），所有方案都必须围绕锚点优化，不能把优化变成另一个故事。
所有方案共享用户事实底盘；一个方案私有的新创意不得污染其他方案。

【第五原则：写作风格与故事方向分开】
用户已经选择的写作风格是最高表达约束。方案方向只能改变故事战略和内容侧重，不得偷偷换文风。
如果用户没有选择风格，根据题材、输入语气和目标读者推导一个可执行的风格方案。

【第六原则：全书结构必须真正有用】
如果用户提供章节数和/或全书拍子，必须结合这些约束设计“全书发展节奏”。
如果没有章节数，也必须给出阶段化的宏观节拍，让故事可以自然扩写成完整小说。
全书节拍至少说明：阶段目的、主要矛盾、主角状态变化、关键事件类型、阶段回报、进入下一阶段的新问题。
不得把全书节拍写成“第1章发生A、第2章发生B”的逐章流水账；除非用户本身已经提供逐章信息。

【第七原则：小说简介必须是给下游AI看的创作材料】
小说简介不是广告文案，也不是营销分析。必须包含足够的创作信息：主角处境、世界背景、核心冲突、主要行动动力、故事如何展开、长期悬念/成长方向、主要关系张力、结局方向（如果合理）。
禁止在小说简介里加入“核心卖点、核心词、推荐理由、评分、营销标签、为什么值得选”等分析字段。

【第八原则：避免空话】
禁止“非常精彩”“很有代入感”“人物立体”“节奏紧凑”等无信息句。
每句话尽量提供人物、因果、状态、选择、阻力、变化或后果。

【第九原则：输出契约】
只输出JSON，不要Markdown代码块，不要解释。
多方案固定结构：
{
  "options":[
    {
      "name":"方案名称",
      "bookTitle":"可直接使用的书名",
      "novelSummary":"给下游AI使用的小说简介/故事蓝本摘要，不写营销分析",
      "fullBookBeat":"完整的宏观全书节拍与阶段推进说明，可按当前章节数映射阶段；不是逐章教案",
      "optimizedIdea":"完整故事创作蓝本，允许较长，包含主角、世界、冲突、人物关系、故事发动机、长期发展、高潮与结局方向、必要创意补充",
      "creativeAdditions":"仅列AI为了让故事可写而新增的关键创意；没有则写无",
      "originalAnchors":{"characters":[],"relationships":[],"goals":[],"coreConflict":"","worldRules":[],"fixedFacts":[]},
      "strategicDimensions":[{"name":"动态战略维度名称","description":"该维度如何展开故事","whyFit":"为什么适合当前故事"}],
      "strategyFingerprint":{"mainStrategy":"","secondaryStrategy":"","coreConflict":"","storyEngine":"","emotionalPromise":"","pacing":""},
      "diagnosis":{"strengths":[],"defects":[],"missing":[],"constraints":[]},
      "optimizationStrategies":[],
      "navBeacon":{"genre":"","protagonist":"","coreConflict":"","tone":""},
      "defects":[],
      "seedCharacters":[],
      "seedPlaces":[]
    }
  ]
}
单方案也使用options数组，便于前端统一处理。

【第十原则：内容长度】
不要机械限字。短输入可以扩展得更充分；复杂输入可以更长。每个方案应达到“策划团队拿到后可以继续做完整小说”的信息密度。默认每个方案约800—1800字；如果故事复杂，可继续增加，但禁止灌水。

【第十一原则：结构建议】
optimizedIdea 建议内部覆盖：
1. 故事定位与核心设定；
2. 主角与关键人物；
3. 世界与规则（只写真正影响剧情的）；
4. 核心矛盾与持续发动机；
5. 人物关系与变化；
6. 故事阶段与升级逻辑；
7. 关键悬念、转折、高潮方向；
8. 结局方向与余波；
9. AI创意补充（若有）。
可以使用自然的中文小标题，但不要输出核心卖点、核心词、推荐理由。

【第十二原则：下游权限】
你负责“把用户的点子变成可长期发展的小说蓝本”。
词典达人负责正式世界设定；校长负责全书战略与章节组织；老师负责逐章施工；正文AI负责文学表达。
因此你可以把故事想清楚，但不要把逐章教案、逐章台词、正文成稿提前塞进optimizedIdea。

【最终自检】
□ 是否真正理解了用户输入，而不是机械改写？
□ 是否保留用户明确事实？
□ 是否补足了小说长期可写性？
□ 每个方案是否有清晰的故事发动机和因果链？
□ 方案之间是否真的有战略差异？
□ AI新增内容是否与用户事实区分？
□ 是否有完整的宏观全书节拍？
□ novelSummary 是否适合作为下游AI创作材料？
□ 是否没有核心卖点、核心词、推荐理由等营销分析？
□ 是否没有越权写逐章教案或正文？
□ 是否只输出JSON？`;

const IDEA_POLISH_SYS = IDEA_POLISH_SYS_PRO;

const POLISH_SINGLE_MODE = `
【单方案执行层】本次只生成一个最终优化方案，不得输出多个方向、方案A/B/C或并列候选。可用统一兼容结构 options，但数组必须恰好只有1项。该方案直接作为唯一可采用方案；不得隐藏第二方案。AI新增的核心人物、关键设定、关键关系、关键剧情必须标记为建议/待确认，不得伪装成用户已确认事实。
`;

const POLISH_MULTI_MODE = `
【多方案执行层】
本次必须按用户输入的真实需求进行受控分叉。先理解，再扩展；先锁定共同事实底盘，再产生不同故事发展路线。
默认保留3—5个高质量方案；明显不适配的方向不要硬凑。
所有方案必须提供 bookTitle、novelSummary、fullBookBeat、optimizedIdea、creativeAdditions、navBeacon、defects、seedCharacters、seedPlaces。

【重要】fullBookBeat 是“全书故事节拍/阶段推进蓝本”，不是营销节拍，也不是逐章教案；novelSummary 是给后续AI看的创作材料。二者都不得包含“核心卖点、核心词、推荐理由”。
【重要】如果用户输入包含多个想法、人物、设定或要求，必须先整合它们之间的关系，再输出真正能写成小说的方案，而不是只改写原句。
【重要】如果输入很短，允许主动补齐合理的主角动机、阻力、阶段目标、关系张力、长期悬念和结局方向，但这些新增内容必须放在创意补充/方案蓝本中，不得伪装成用户已经确认的事实。
`;



const GLOSSARY_EXTRACT_SYS_LEGACY = `你是长篇小说设定整理助手。给定【本章正文】与【现有词典】，提取正文中出现但现有词典【未收录】的新人物、新地名、新专名。
请严格只输出如下 JSON（不要解释、不要 markdown 代码块）：
{"characters":[{"name":"人名","identity":"身份/职业/社会身份","age":"岁数/年龄","gender":"性别","appearance":"外貌特征","hobby":"爱好","catchphrase":"口头禅","relation":"与该人的血缘/人际关联","trait":"性格要点"}],"places":[{"name":"地名","type":"类型","note":"设定要点"}],"propernouns":[{"name":"专名","note":"含义"}]}
规则：
1. 只提取正文中真实出现、且有明确所指（被命名）的实体；纯叙述性泛指不提取。
2. 必须与现有词典逐名去重：同名条目一律不再输出。
3. ★【人物必须输出全部 8 个字段：identity / age / gender / appearance / hobby / catchphrase / relation / trait】
   · 禁止只输出人名、禁止缺字段、禁止省略任何字段；
   · 从正文中提取该人物的身份、年龄、性别、外貌、爱好、口头禅、关系、性格等信息，正文未明说的字段按上下文合理推断后填写；
   · 实在无法推断的字段填「未知」，不得留空、不得删除该字段；
   · catchphrase（口头禅）：正文出现该人物的专属口头禅就写具体内容（如「口头禅'稳了'」），判定其没有就填「无」；
   · relation 与 identity 务必区分：身份词（捕快/市长/船女）归 identity；带"谁的"的人际关联（XX的妹妹/她的仆人）归 relation；relation 只写一句话关系摘要（≤20字），与他人多组关系的逐条明细由「人物关系表」承载，禁止堆砌多组关系。
   · ★推断须自洽：填写的 age 与履历/居住年限类设定不得矛盾（如"在此已住30年"却23岁、"18岁却已当官5年"）；子代须小于亲代；转世/穿越/长生/修仙等特殊预设可豁免，但需有对应标注。
4. 无明显新实体时输出 {"characters":[],"places":[],"propernouns":[]}。`;

const GLOSSARY_EXTRACT_SYS_PRO = `你是一位资深长篇小说「设定审计师」。
【核心任务】给定本章正文与现有词典，提取正文中出现但现有词典未收录的新人物、新地名、新专名，并做字段自洽审查。

【必须输出的 JSON 结构】
{"characters":[{"name":"人名","identity":"身份/职业/社会身份","age":"岁数/年龄","gender":"性别","appearance":"外貌特征","hobby":"爱好","catchphrase":"口头禅","relation":"与该人的血缘/人际关联","trait":"性格要点"}],"places":[{"name":"地名","type":"类型","note":"设定要点"}],"propernouns":[{"name":"专名","note":"含义"}]}

【硬性约束】
1. 只提取正文中真实出现、且有明确所指（被命名）的实体；纯叙述性泛指不提取。
2. 与现有词典逐名去重：同名条目一律不再输出。
3. 人物必须输出全部 8 个字段：identity / age / gender / appearance / hobby / catchphrase / relation / trait；禁止缺字段、留空；无法推断的字段填「未知」。catchphrase（口头禅）并非人人都有：正文出现其专属口头禅就写具体内容，判定没有则填「无」。
4. relation 与 identity 区分：身份词（捕快/市长/船女）归 identity；带"谁的"的人际关联归 relation；relation 只写一句话关系摘要（≤20字），与他人多组关系的逐条明细由「人物关系表」承载，禁止在 relation 里堆砌多组关系。
5. 字段自洽：age 与履历/居住年限不得矛盾；子代须小于亲代；特殊预设（转世/穿越/长生/修仙）可豁免但需标注。
6. 无明显新实体时输出 {"characters":[], "places":[], "propernouns":[]}。
7. 只输出上述 JSON，不要 markdown 代码块、不要解释。`;

const GLOSSARY_EXTRACT_SYS = GLOSSARY_EXTRACT_SYS_PRO;

function validateGlossaryExtract(j){
  if(!j) return {ok:false, code:'EMPTY'};
  for(const c of (j.characters || [])){
    const missing = ['name','identity','age','gender','appearance','hobby','catchphrase','relation','trait'].filter(k => !String(c[k]||'').trim());
    if(missing.length) return {ok:false, code:'CHAR_FIELD_MISSING', details: c.name};
    const nameViol = nmNameRuleViolation(String(c.name||'').trim());
    if(nameViol) return {ok:false, code:'CHAR_NAME_RULE', details: nameViol};
  }
  return {ok:true};
}

const SUBPROGRESS_UPDATE_SYS_LEGACY = `你是长篇小说副线追踪助手。给定【本章正文】与【现有副线进度】，判断本章推进、新建或收束了哪些副线。
请严格只输出如下 JSON（不要解释、不要 markdown 代码块）：
{"subplots":[{"name":"副线名","status":"进行中|搁置|已收束","question":"该副线提出的核心问题","arc":{"from":"起点状态","to":"当前状态"},"pivot":"对主线的影响(有才填，没有就别写)","note":"本章进展一句话，只写本章新增，不重复旧进度，≤60字"}]}
规则：
1. 只输出本章【确有推进或新建】的副线；本章未触碰的一律不出现。
2. 已存在副线按 name 同名合并；仅当本章确实引出一条新的跨章叙事线索（有延续悬念、将多次出现）才允许新建，一次性事件/路人戏不建。
3. status 只能是三态之一：进行中 / 搁置 / 已收束，禁止其它值。
4. 首次新建某副线时尽量给出 question（该线索提出的核心问题）与 arc.from；一时给不出也要输出该副线，question 留空字符串（程序会标记"待补充"），禁止为凑数硬编问题。
5. 推进时若人物状态发生跃迁，更新 arc.to；若本章该副线与主线交织并影响主线，补 pivot（确有关联才填，绝不硬造）。
6. 当该副线的核心问题已被回答（哪怕开放式结局，如没抓到凶手但回答了追查动机）→ status 改「已收束」，note 说明它以何种方式完成闭合（回应问题 / 状态到位）。
7. 已收束的副线本章又明显复活推进 → 显式改回「进行中」再追加。
8. 与既有进度冲突时以既有进度为准，不得改写或推翻旧进度；note 只记录本章新增内容。
9. 本章无任何副线推进时输出 {"subplots":[]}。`;

const SUBPROGRESS_UPDATE_SYS_PRO = `你是一位资深长篇小说「副线审计师」。
【核心任务】阅读本章正文，判断本章推进、新建或收束了哪些副线，并以严格的 JSON 输出。

【必须输出的 JSON 结构】
{"subplots":[{"name":"副线名","status":"进行中|搁置|已收束","question":"该副线提出的核心问题（必填，≤60字）","arc":{"from":"起点状态","to":"当前状态"},"pivot":"对主线的影响（有才填，没有就空字符串）","note":"本章进展一句话，只写本章新增，≤60字"}]}

【硬性约束】
1. 只输出本章确有推进或新建的副线；未触碰的一律不出现。
2. status 只能是：进行中 / 搁置 / 已收束。其他值视为无效。
3. 首次新建某副线时尽量给出 question；给不出时输出空字符串并保留该副线，禁止硬编问题。
4. arc.from / arc.to 必须能体现状态跃迁；没有变化时两者可相同。
5. pivot 只在确实影响主线时才填；没有就空字符串，禁止硬造。
6. 与既有进度冲突时以既有进度为准，不得改写旧进度。
7. 本章无任何副线推进时输出 {"subplots":[]}。
8. 只输出 JSON，不要 markdown 代码块、不要解释。`;

const SUBPROGRESS_UPDATE_SYS = SUBPROGRESS_UPDATE_SYS_PRO;

function validateSubplotOutput(j){
  if(!j || !Array.isArray(j.subplots)) return {ok:false, code:'NOT_ARRAY'};
  for(const s of j.subplots){
    if(!['进行中','搁置','已收束'].includes(s.status)) return {ok:false, code:'BAD_STATUS'};
    if(!String(s.name||'').trim()) return {ok:false, code:'MISSING_NAME'};
    if(!String(s.question||'').trim()) return {ok:false, code:'MISSING_QUESTION'};
  }
  return {ok:true};
}






function glossaryForAI(){
  const g = (state.outline && state.outline.glossary) || {};
  const nrm = s => String(s||'').trim();
  const sortByName = arr => (arr||[]).slice().sort((a,b)=>String(a&&a.name||'').localeCompare(String(b&&b.name||''),'zh-Hans-CN'));
  const characters = sortByName(g.characters);
  const places     = sortByName(g.places);
  const propernouns= sortByName(g.propernouns);
  const repeatIn = arr => {
    const m = {};
    arr.forEach(it=>{ const n = nrm(it.name); if(n) m[n] = (m[n]||0)+1; });
    return Object.keys(m).filter(n=>m[n]>1).map(n=>({name:n, count:m[n]})).sort((a,b)=>b.count-a.count);
  };
  const tag = {characters:'人物', places:'地点', propernouns:'专名'};
  const seen = {};
  [[characters,'characters'],[places,'places'],[propernouns,'propernouns']].forEach(([arr,cat])=>{
    arr.forEach(it=>{ const n = nrm(it.name); if(n) (seen[n]=seen[n]||[]).push(cat); });
  });
  const cross = Object.keys(seen).filter(n=>seen[n].length>1).map(n=>({name:n, cats:seen[n].map(c=>tag[c])}));
  return { characters, places, propernouns, repeatIn, cross, empty: sourceHasGlossary(g) ? '' : '（无）' };
}
function glossaryDupNoteHtml(){
  const rf = glossaryForAI();
  const repLabels = {characters:'人物', places:'地点', propernouns:'专名'};
  const lines = [];
  [['characters',rf.characters],['places',rf.places],['propernouns',rf.propernouns]].forEach(([cat,arr])=>{
    const dup = rf.repeatIn(arr);
    if(dup.length) lines.push(`${repLabels[cat]}：「${dup.map(d=>`${d.name}×${d.count}`).join('」、')}」`);
  });
  if(rf.cross.length) lines.push('跨类同名：'+rf.cross.map(x=>`${x.name}（${x.cats.join('+')}）`).join('、'));
  if(!lines.length) return '';
  return `<div class="gs-panel gs-dup-note"><div class="gs-panel-title">⚠️ 重复情况检查（仅提示，未做任何删除/合并；原词典原样保留）</div>
    <pre class="gs-pre">${esc(lines.join('\n'))}</pre></div>`;
}

function chapterGlossaryBlock(curN, opts){
  const o = state.outline;
  if(!o) return '';
  opts = opts || {};
  const lean = !!opts.lean;
  if(opts.names){
    const g = (o && o.glossary) || {};
    if(!sourceHasGlossary(g)) return '';
    const rf = glossaryForAI();
    const cs = rf.characters.map(c=>String(c.name||'').trim()).filter(Boolean).join('、');
    const ws = (g.walkons||[]).map(w=>String(w.name||'').trim()).filter(Boolean).join('、');
    const ps = rf.places.map(p=>String(p.name||'').trim()).filter(Boolean).join('、');
    const pn = rf.propernouns.map(p=>String(p.name||'').trim()).filter(Boolean).join('、');
    return `【设定词典（名称清单，标题不得引入清单外的新人名/地名/专名）】\n人物：${cs||'（无）'}\n路人龙套：${ws||'（无）'}\n地点：${ps||'（无）'}\n专名：${pn||'（无）'}`;
  }
  let body = `\n\n【全局创作上下文（严格服从：有台词/有戏份、或贯穿反复出现的重要人地专名不得自造、须取用词典保持全书一致；仅作氛围的临时路人/小地名/小专名允许现场点缀一次、不入词典）】`;
  const g = (o && o.glossary) || {};
  if(sourceHasGlossary(g)){
    const rf = glossaryForAI();
    const cDetail = lean
      ? c => [c.identity?`身份:${c.identity}`:'', c.relation?`关系:${c.relation}`:''].filter(Boolean).join('；')
      : c => [c.identity?`身份:${c.identity}`:'', c.age?`岁数:${c.age}`:'', c.gender?`性别:${c.gender}`:'', c.appearance?`外貌:${c.appearance}`:'', c.hobby?`爱好:${c.hobby}`:'', (c.catchphrase&&c.catchphrase!=='无')?`口头禅:${c.catchphrase}`:'', c.relation?`关系:${c.relation}`:'', c.trait?`性格:${c.trait}`:''].filter(Boolean).join('；');
    const pDetail = p => [p.type?`类型:${p.type}`:'', p.note?`说明:${p.note}`:''].filter(Boolean).join('；');
    const cs = rf.characters.map(c=> `${c.name}${cDetail(c)?`（${cDetail(c)}）`:''}`).join('、');
    const ps = rf.places.map(p=> `${p.name}${pDetail(p)?`（${pDetail(p)}）`:''}`).join('、');
    const pn = rf.propernouns.map(p=> `${p.name}${p.note?`（${p.note}）`:''}`).join('、');
    const repLabels = {characters:'人物', places:'地点', propernouns:'专名'};
    const repeatNotes = [];
    [['characters',rf.characters],['places',rf.places],['propernouns',rf.propernouns]].forEach(([cat,arr])=>{
      const dup = rf.repeatIn(arr);
      if(dup.length) repeatNotes.push(`${repLabels[cat]}：${dup.map(d=>`「${d.name}」×${d.count}`).join('、')}`);
    });
    const repeatNote = repeatNotes.length ? `\n【词典同名提示（非删除，仅供知悉）】以下名称在同一类别中出现多次，均按原样保留：${repeatNotes.join('；')}` : '';
    const crossNote = rf.cross.length ? `\n【跨类同名提示】以下名称在多类中出现（系同一实体分属多类，原样保留，不要当成两条新增，也不要据此另造新名）：${rf.cross.map(x=>`${x.name}（${x.cats.join('+')}）`).join('、')}` : '';
    body += `\n·【设定词典】（给定的人/地/专名，正文一律采用：凡有台词/有戏份、或贯穿反复出现的人地专名务必取用本词典并保持全书一致，禁止另起炉灶自造核心名；仅作氛围的临时路人/小地名/小专名不在此限——可现场点缀一次、不入词典。人物关系/性格、地点类型、专名含义按此统一）\n人物：${cs||'（无）'}\n地点：${ps||'（无）'}\n专名：${pn||'（无）'}${repeatNote}${crossNote}`;
    const wk = (g.walkons||[]).filter(w=>String(w&&w.name||'').trim()).map(w=>`${String(w.name).trim()}${String(w&&w.note||'').trim()?`（${String(w.note).trim()}）`:''}`).join('、');
    if(wk) body += `\n·【路人龙套】（词典充实新增的闲人：只说一句台词、只露一个镜头即可，无需塑造九维；写到相关场景（街市/酒肆/夜巡/围观/办事）时就近选用登场，让群像鲜活，避免整章主角独角戏。此清单之外，允许正文为个别氛围当场自拟"临时闲人"——规则见正文【临时闲人】段）\n${wk}`;
    const relTable = validAssoc(g._relationshipTable,'a','b').map(x=>`${x.a} ←${x.relation||'？'}→ ${x.b}${x.note?`（${x.note}）`:''}`).filter(Boolean).join('；');
    const pcTable  = validAssoc(g._placeContacts,'from','to').map(x=>`${x.from} ↔ ${x.to}${x.relation?`（${x.relation}）`:''}${x.note?`：${x.note}`:''}`).filter(Boolean).join('；');
    const prcTable = validAssoc(g._properContacts,'from','to').map(x=>`${x.from} ↔ ${x.to}${x.relation?`（${x.relation}）`:''}${x.note?`：${x.note}`:''}`).filter(Boolean).join('；');
    if(relTable) body += `\n·【重要人物关系】（正文人物关系/立场须与此一致）\n${relTable}`;
    if(pcTable)  body += `\n·【地名关联表】（地域往来/通行逻辑须与此一致，只列地名与地名之间的关联）\n${pcTable}`;
    if(prcTable) body += `\n·【专名关联表】（专名与专名、专名用法须与此一致，只列专名与专名之间的关联）\n${prcTable}`;
    const wrTable = (g._worldRules||[]).map(fmtWR).filter(Boolean).join('；');
    if(wrTable) body += `\n·【世界观规则】（本书世界实际如何运转的具体规则，正文据此写作、不得违背该世界逻辑：劳动作息/社会制度/力量体系/金钱物价/地理交通/秩序法则等）\n${wrTable}`;
  }
  body += subplotProgressBlock(curN);
  return body;
}
function subplotProgressBlock(curN){
  const o = state.outline; if(!o) return '';
  const g = (o.glossary) || {};
  const subs = (Array.isArray(g.subplots) ? g.subplots : []).filter(Boolean);
  if(!subs.length) return '';
  const full = (o.chapters||[]).length || 1;
  const cur = (Number.isFinite(curN) && curN>0) ? curN : (o.chapters||[]).length;   // 当前章：正文生成传 i+1；规划/标题无当前章则用全书章数
  const lines = subs.map(s=>{
    const nm = String(s.name||'').trim() || '（未命名副线）';
    const st = ['进行中','搁置','已收束'].includes(s.status) ? s.status : '进行中';
    const q = String(s.question||'').trim();
    const arc = (s.arc && (s.arc.from || s.arc.to))
      ? `${s.arc.from||'？'}→${s.arc.to||'——'}`
      : '';
    const pivot = String(s.pivot||'').trim();
    const lastCh = Number.isFinite(s._lastCh) ? s._lastCh : (s.log&&s.log.length ? Math.max(...s.log.map(x=>x.ch||0)) : 0);
    const ts = (Array.isArray(s.log)?s.log:[]).map(x=>`第${x.ch}章${x.note?`（${x.note.trim()}）`:''}`).join(' → ');
    let head = `· ${nm}（${st}）`;
    if(q) head += `｜问：${q}`;
    if(arc) head += `｜态：${arc}`;
    let block = `${head}\n  ${ts||'（尚无进度记录）'}`;
    const gap = lastCh ? (cur - lastCh) : -1;
    if(lastCh>0 && gap > full * state.subRecallRatio){
      block += `\n  ⚠ 本条已消失超全书 ${Math.round(state.subRecallRatio*100)}%（约 ${gap} 章未出现），读者可能淡忘：本章若回归，必须先用 ≤20 字一句话轻提前情，再续写。`;
    }
    if(pivot) block += `\n  蝴蝶效应：${pivot}`;
    return block;
  }).join('\n');
  return `\n\n【副线进度（截至第 ${cur} 章）】\n${lines}\n【副线创作契约】
· 是否推进某条副线由你判断：适合则自然写一笔；强行加入会生硬/喧宾夺主则本章不推进，正文照常。
· 回归一条消失过久的副线，开篇以 ≤20 字轻提前情，避免读者认知断裂。
· 闭环是硬性要求：副线可开放式结局（如没抓到凶手），但必须回应其【核心问题】；理想收束是完成状态 A→B 并给主线留出蝴蝶效应（见各条 pivot）。
· 未推进的副线不勉强提及；不得推翻既有进度；「已收束」的副线本章不复活（除非本章有重大理由并显式改回「进行中」）。`;
}
function checkGlossaryCoverage(){
  const g = (state.outline && state.outline.glossary) || {};
  const body = state.chapters.filter(c=>c && c.content).map(c=>String(c.content)).join('\n');
  const summary = { total:0, hit:0, chars:{used:[],unused:[]}, places:{used:[],unused:[]}, props:{used:[],unused:[]} };
  const scan = (arr, bucket)=>{
    (arr||[]).forEach(it=>{
      const nm = String(it.name||'').trim(); if(!nm) return;
      summary.total++;
      const re = new RegExp(escRe(nm), 'g');
      const n = body.match(re) ? body.match(re).length : 0;
      (n>0 ? bucket.used : bucket.unused).push({name:nm, count:n});
      if(n>0) summary.hit++;
    });
  };
  scan(g.characters, summary.chars);
  scan(g.places, summary.places);
  scan(g.propernouns, summary.props);
  return summary;
}
const CHAR_FIELDS = ['identity','age','gender','appearance','hobby','relation','trait','catchphrase'];
const CHAR_FIELD_LABEL = { identity:'身份', age:'岁数', gender:'性别', appearance:'外貌', hobby:'爱好', relation:'关系', trait:'性格', catchphrase:'口头禅' };
function completeCharFields(c){
  CHAR_FIELDS.forEach(k=>{
    if(c[k]==null || String(c[k]).trim()==='') c[k] = (k==='catchphrase') ? '无' : '未知';
  });
  return c;
}
function sanitizeGlossaryExtract(j){
  j = j || {};
  const keepChar = c => {
    if(c.name == null || !String(c.name).trim()) return null;
    const o = { name: String(c.name).trim() };
    CHAR_FIELDS.forEach(k=>{ if(c[k]!=null) o[k] = String(c[k]).trim(); });
    return completeCharFields(o);
  };
  const keepPlace = p => { const o = {}; ['name','type','note'].forEach(k=>{ if(p[k]!=null) o[k]=String(p[k]).trim(); }); return o.name ? o : null; };
  const keepProp = p => { const o = {}; ['name','note'].forEach(k=>{ if(p[k]!=null) o[k]=String(p[k]).trim(); }); return o.name ? o : null; };
  return {
    characters: (Array.isArray(j.characters)?j.characters:[]).map(keepChar).filter(Boolean),
    places:     (Array.isArray(j.places)?j.places:[]).map(keepPlace).filter(Boolean),
    propernouns:(Array.isArray(j.propernouns)?j.propernouns:[]).map(keepProp).filter(Boolean)
  };
}
async function extractNewGlossary(bodyTexts){
  const g = (state.outline && state.outline.glossary) || {};
  const allText = (bodyTexts||[]).filter(Boolean).map(String).join('\n\n');
  const _o = state.outline;
  if(_o && !_o._v45) _o._v45 = {};
  const _LIMIT = 50000;
  let body;
  if(allText.length <= _LIMIT){
    body = allText;
    if(_o) _o._v45.glossCursor = allText.length;
  }else{
    let _cur = Math.min((_o && _o._v45.glossCursor) || 0, allText.length);
    if(allText.length - _cur < _LIMIT) _cur = allText.length - _LIMIT;   // 尾部不足一窗时对齐到末窗
    body = allText.slice(_cur, _cur + _LIMIT);
    if(_o) _o._v45.glossCursor = _cur + body.length;
  }
  if(!body.trim()) return {characters:[], places:[], propernouns:[]};
  const user = buildAIPrompt('glossary', { content: body });
  const txt = unwrapAIResult(await callDeepSeek(GLOSSARY_EXTRACT_SYS, user, {maxTokens: clampMaxTokens('glossary'), temperature: resolveActiveSpec().qcTemp, topP: 0.5, taskKey:'glossary'}));
  const j = parseJson(txt) || {};
  const _glRep = validateGlossaryExtract(j);
  if(!_glRep.ok) console.warn('[词典] 输出校验未通过（不阻断）：', _glRep.code, _glRep.details||'');
  return sanitizeGlossaryExtract(j);
}
function mergeExtractedGlossary(ext, src){
  const o = state.outline; if(!o) return {c:0,p:0,k:0,total:0};
  if(!o.glossary) o.glossary = {characters:[], places:[], propernouns:[]};
  const gl = o.glossary;
  const n = {c:0, p:0, k:0, flagged:0};
  const _aliasMap = glossaryAliases();
  const mergeArr = (cur, add, tag, checkName) => {
    const have = new Set((cur||[]).map(x=>String(x&&x.name||'').trim()).filter(Boolean));
    (add||[]).forEach(it=>{
      const nm = String(it.name||'').trim(); if(!nm || have.has(nm)) return;
      if(_aliasMap.has(nm)) return;
      const nv = checkName ? nmNameRuleViolation(nm) : '';
      if(nv) n.flagged++;
      cur.push({ ...it, ...(nv?{_nameFlag:nv}:{}), _auto:true, _srcCh: (typeof src==='number'&&src>0)?src:0, _srcHow: typeof src==='string'?src:'', _srcTs: Date.now() }); have.add(nm); n[tag]++;
    });
  };
  mergeArr(gl.characters, ext.characters, 'c', true);
  mergeArr(gl.places, ext.places, 'p');
  mergeArr(gl.propernouns, ext.propernouns, 'k');
  n.total = n.c + n.p + n.k;
  return n;
}
function bindPlannerTitles(newTitles){
  const o = state.outline; if(!o) return false;
  const n = (o.chapters||[]).length;
  if(!Array.isArray(newTitles) || newTitles.length !== n) return false;
  if(syncChaptersFromOutline()) persist();
  snapshotTitleBatch('规划师定稿前');
  const applied = setAllTitles(newTitles);
  if(applied > 0){
    state.plannerFinalized = true;
    persist();
  }
  return applied > 0;
}

const SUB_STATUSES = ['进行中','搁置','已收束'];
async function extractSubplotUpdates(chIdx, content){
  const o = state.outline;
  const g = (o && o.glossary) || {};
  const body = String(content||'').trim();
  if(!body) return {subplots:[]};
  const user = buildAIPrompt('subplot', { idx: chIdx });
  const txt = unwrapAIResult(await callDeepSeek(SUBPROGRESS_UPDATE_SYS, user, {maxTokens: clampMaxTokens('json'), temperature: resolveActiveSpec().subplotTemp, topP: 0.5, taskKey:'subplot'}));
  const j = parseJson(txt) || {};
  const _subRep = validateSubplotOutput(j);
  if(!_subRep.ok) console.warn('[副线] 输出校验未通过（不阻断）：', _subRep.code, _subRep.details||'');
  const norm = (Array.isArray(j.subplots)?j.subplots:[]).map(s=>{
    const name = String(s&&s.name||'').trim(); if(!name) return null;
    const note = String(s&&s.note||'').trim();
    const o2 = {
      name,
      status: SUB_STATUSES.includes(s.status) ? s.status : '进行中',
      question: String(s.question||'').trim(),
      arc: { from: String((s.arc&&s.arc.from)||'').trim(), to: String((s.arc&&s.arc.to)||'').trim() },
      pivot: String(s.pivot||'').trim(),
      note
    };
    return o2;
  }).filter(Boolean);
  return { subplots: norm };
}
function mergeSubplotUpdates(ext, chIdx){
  const o = state.outline; if(!o) return {total:0,newCount:0,noQuestionCount:0};
  if(!o.glossary) o.glossary = {characters:[], places:[], propernouns:[]};
  const gl = o.glossary;
  if(!Array.isArray(gl.subplots)) gl.subplots = [];
  const cur = gl.subplots;
  let total=0, newCount=0, noQuestionCount=0;
  (ext&&ext.subplots||[]).forEach(s=>{
    const name = String(s.name||'').trim(); if(!name) return;
    const exist = cur.find(x=> String(x.name||'').trim() === name);
    if(!exist){
      if(!String(s.question||'').trim()){ s.question = '待补充：该副线的核心问题尚未明确'; }
      const entry = {
        name,
        status: s.status || '进行中',
        question: String(s.question).trim(),
        arc: { from: s.arc&&s.arc.from?s.arc.from:'', to: s.arc&&s.arc.to?s.arc.to:'' },
        pivot: s.pivot||'',
        log: s.note ? [{ch: chIdx, note: s.note}] : [],
        _lastCh: s.note ? chIdx : 0,
        _auto: true
      };
      cur.push(entry); total++; newCount++;
      return;
    }
    exist.status = SUB_STATUSES.includes(s.status) ? s.status : exist.status;
    if(s.question) exist.question = String(s.question).trim();
    if(s.arc && (s.arc.from||s.arc.to)){ exist.arc = exist.arc || {from:'',to:''}; if(s.arc.from) exist.arc.from = String(s.arc.from).trim(); if(s.arc.to) exist.arc.to = String(s.arc.to).trim(); }
    if(s.pivot) exist.pivot = String(s.pivot).trim();
    if(s.note){
      if(!Array.isArray(exist.log)) exist.log = [];
      const ch = chIdx; let lo=0, hi=exist.log.length;
      while(lo<hi){ const mid=(lo+hi)>>1; if((exist.log[mid].ch||0) <= ch) lo=mid+1; else hi=mid; }
      exist.log.splice(lo, 0, {ch: chIdx, note: String(s.note).trim()});
      exist._lastCh = Math.max(...exist.log.map(x=>x.ch||0));
    }
    total++;
  });
  return {total, newCount, noQuestionCount};
}
async function autoUpdateSubplots(){
  if(!isLong() || !state.subAutoFill) return;
  startBgTask();
  try{
    const o = state.outline; if(!o) return;
    if(!o.glossary) o.glossary = {characters:[], places:[], propernouns:[]};
    if(!Array.isArray(o.glossary.subplots)) o.glossary.subplots = [];
    const absorbed = Array.isArray(o.glossary._subAbsorbed) ? o.glossary._subAbsorbed : [];
    const todo = state.chapters.map((c,i)=> (c && c.content && String(c.content).trim()) ? i : -1)
      .filter(i=> i>=0 && !absorbed.includes(i)).sort((a,b)=>a-b);
    if(!todo.length) return;
    let noQ = 0, total = 0;
    try{
      for(const i of todo){
        const c = state.chapters[i];
        const ext = await extractSubplotUpdates(i, c.content);
        const n = mergeSubplotUpdates(ext, i+1);
        noQ += n.noQuestionCount; total += n.total;
        absorbed.push(i);
      }
      o.glossary._subAbsorbed = absorbed;
      if(total>0 || noQ>0) persist();
      if(noQ>0) toast(`副线追踪：${total} 条推进；${noQ} 条因缺核心问题未入库`);
      else if(total>0) toast(`副线追踪：${total} 条副线进度已更新`);
    }catch(e){ /* 静默失败，不阻塞章节生成 */ }
  }finally{ endBgTask(); }
}
function scanUnusedGlossary(){
  const s = checkGlossaryCoverage();
  const g = (state.outline && state.outline.glossary) || {};
  const withAuto = (unused, src) => (unused||[]).map(x => {
    const it = (src||[]).find(y=> String(y&&y.name||'').trim() === x.name);
    return { name: x.name, _auto: !!(it && it._auto) };
  });
  return {
    characters: withAuto(s.chars.unused, g.characters),
    places:     withAuto(s.places.unused, g.places),
    propernouns:withAuto(s.props.unused, g.propernouns)
  };
}
async function manualExtractGlossary(){
  const written = state.chapters.filter(c=> c && c.content && String(c.content).trim()).map(c=>c.content);
  if(!written.length){ toast('尚无已生成章节正文'); return; }
  toast('正在提取新增词典条目…');
  try{
    const ext = await extractNewGlossary(written);
    const n = mergeExtractedGlossary(ext, '手动提取');
    if(n.total > 0){ persist(); render(); toast(`词典已补全：+${n.c} 人物（含完整设定）、+${n.p} 地名、+${n.k} 专名`); }
    else toast('未发现词典未收录的新实体');
  }catch(e){ toast('提取失败：'+e.message); }
}
function openCleanPanel(){
  const closePanel = ()=>{ const p=$('#cleanPanel'); if(p) p.remove(); };
  const s = scanUnusedGlossary();
  const written = state.chapters.filter(c=>c && c.content && String(c.content).trim()).length;
  const row = (arr, icon) => arr.length ? arr.map(x=>`
    <label class="gs-hit"><input type="checkbox" class="gs-clean-cb" data-name="${esc(x.name)}" ${x._auto?'checked':''} />
      <span>${esc(x.name)}</span>${x._auto?'<i class="gs-auto-tag">🆕 自动补全</i>':'<i class="gs-orig-tag">原始条目</i>'}</label>`).join('') : '';
  const empty = !s.characters.length && !s.places.length && !s.propernouns.length;
  const ov = document.createElement('div');
  ov.id='cleanPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🧹 清理未使用条目</b><button class="gs-x" data-clean-close>✕</button></div>
      <div class="gs-modal-sub">已生成 ${written} 章。以下条目在全部已生成正文中均未出现，可能因重生成覆盖而失效；尚未写的章节可能仍会用到，请谨慎勾选。</div>
      <div class="gs-body">
        ${empty ? '<p class="muted">✓ 没有需要清理的条目（全部词典条目都已在正文中出现）。</p>' : `
          ${s.characters.length?`<div class="gs-q">👤 人物</div>${row(s.characters,'👤')}`:''}
          ${s.places.length?`<div class="gs-q">🏞️ 地名</div>${row(s.places,'🏞️')}`:''}
          ${s.propernouns.length?`<div class="gs-q">📌 专名</div>${row(s.propernouns,'📌')}`:''}
        `}
      </div>
      ${empty
        ? `<div class="gs-modal-head" style="justify-content:flex-end;border:none"><button class="btn ghost" data-clean-close>关闭</button></div>`
        : `<div class="gs-modal-head" style="justify-content:flex-end;border:none"><button class="btn ghost" data-clean-close>取消</button><button class="btn primary" data-clean-do>确认删除勾选项</button></div>`}
    </div>`;
  document.body.appendChild(ov);
  $$('[data-clean-close]').forEach(b=> b.onclick = closePanel);
  const doBtn = $('[data-clean-do]');
  if(doBtn) doBtn.onclick = ()=>{
    const picked = $$('.gs-clean-cb:checked').map(cb=> cb.dataset.name);
    if(!picked.length){ toast('未勾选任何条目'); return; }
    const g = state.outline && state.outline.glossary; if(!g){ closePanel(); return; }
    let c=0,p=0,k=0;
    g.characters = (g.characters||[]).filter(x=>{ if(picked.includes(String(x&&x.name||'').trim())){ c++; return false; } return true; });
    g.places     = (g.places||[]).filter(x=>{ if(picked.includes(String(x&&x.name||'').trim())){ p++; return false; } return true; });
    g.propernouns= (g.propernouns||[]).filter(x=>{ if(picked.includes(String(x&&x.name||'').trim())){ k++; return false; } return true; });
    persist(); closePanel(); render();
    toast(`已清理：-${c} 人物、-${p} 地名、-${k} 专名`);
  };
}
function openCoveragePanel(){
  closeCoveragePanel();
  const s = checkGlossaryCoverage();
  const row = (arr, icon)=> arr.length ? arr.map(x=>`<div class="cv-row ${x.count===0?'cv-zero':''}"><span class="cv-icon">${icon}</span><b>${esc(x.name)}</b><span class="cv-cnt">${x.count===0?'未用到':x.count+' 次'}</span></div>`).join('') : '';
  const pct = s.total ? Math.round(s.hit/s.total*100) : 0;
  const ov = document.createElement('div');
  ov.id='cvPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📊 词典覆盖面自检</b><button class="gs-x" data-cv-close>✕</button></div>
      <div class="gs-body">
        <p class="muted" style="margin:0 0 8px">对已在正文中出现过的章节做统计；0 次的条目可能未被使用，可考虑精简。共 ${s.total} 条 · 已覆盖 ${s.hit} 条（${pct}%）</p>
        ${s.chars.used.length||s.chars.unused.length?`<div class="cv-sec">👤 人物</div>${row(s.chars.used.concat(s.chars.unused),'👤')}`:''}
        ${s.places.used.length||s.places.unused.length?`<div class="cv-sec">📍 地点</div>${row(s.places.used.concat(s.places.unused),'📍')}`:''}
        ${s.props.used.length||s.props.unused.length?`<div class="cv-sec">🔤 专名</div>${row(s.props.used.concat(s.props.unused),'🔤')}`:''}
      </div>
      <div class="gs-actions"><button class="btn" data-cv-close>关闭</button></div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-cv-close]').forEach(b=> b.onclick = ()=>{ closeCoveragePanel(); });
  ov.addEventListener('click', e=>{ if(e.target===ov) closeCoveragePanel(); });
}
function closeCoveragePanel(){ const p=$('#cvPanel'); if(p) p.remove(); }
const TIME_ANCHOR_SYS = `你是长篇小说「章节收束时间锚」提取器。给定【本章正文】，只判断一件事：本章正文在结尾落幕时，故事落在哪条时间支线、哪个时点。
只判断【正文最后一幕】真正落到哪里；正文确实没写清时点则按第3条输出空。
请严格只输出如下 JSON（不要 markdown 代码块、不要解释）：
{"time":"支线·时点，如 现实·第2天·清晨 / 回忆·主线第1天前 / 梦境·现实第2天夜 / 穿越·主线第7天（≤14字）"}
约束：
1. 支线只能取 现实 / 回忆 / 梦境 / 穿越 之一；时点给一个自然语言表述（第N天+时段，或相对锚点）。
2. 以正文最后一段、最后一幕为准；正文有明确表述就用正文表述，正文含糊则按第3条输出空。
3. 若实在无法判断，输出 {"time":""}。`;
async function extractChapterEndTime(chIdx, content){
  const o = state.outline;
  const body = String(content||'').trim();
  if(!body) return { time: '' };
  const user = `【本章正文（第 ${chIdx+1} 章）】
${String(body).slice(-30000)}`;
  const txt = unwrapAIResult(await callDeepSeek(TIME_ANCHOR_SYS, user, {maxTokens: clampMaxTokens('json'), temperature: 0.2, topP: 0.5, taskKey:'timeAnchor'}));
  const j = parseJson(txt) || {};
  const t = String((j && j.time)||'').trim();
  return { time: t };
}
async function autoUpdateTimeAnchors(){
  if(!_timeAnchorsAutoOn()) return;
  startBgTask();
  try{
    const o=state.outline; if(!o||!o._factCard) return;
    const fc=o._factCard; fc.timeAnchors=fc.timeAnchors||[]; fc.timeAudit=fc.timeAudit||{};
    const todo=state.chapters.map((c,i)=>(c&&c.content&&String(c.content).trim())?i:-1).filter(i=>i>=0&&!fc.timeAnchors.some(t=>t.ch===i&&t.src==='ai')).sort((a,b)=>a-b);
    let updated=0;
    for(const i of todo){
      const ext=await extractChapterEndTime(i,state.chapters[i].content);
      if(ext.time){ fc.timeAnchors=fc.timeAnchors.filter(x=>x.ch!==i); fc.timeAnchors.push({ch:i,time:ext.time,src:'ai',observed:true}); updated++; }
      fc.timeAudit[i]=auditTimePresentation(i,state.chapters[i].content);
    }
    if(updated||todo.length) persist();
    if(updated) toast(`时间审计：已记录 ${updated} 章正文收尾观测；规划时间线保持不变`);
  }catch(e){ /* 静默失败，不阻塞章节生成 */ }
  finally{ endBgTask(); }
}

function openSubplotBoard(){
  const old = $('#subBoard'); if(old) old.remove();
  const g = (state.outline && state.outline.glossary) || {};
  const subs = (Array.isArray(g.subplots)?g.subplots:[]).filter(Boolean);
  if(!subs.length){ toast('暂无副线'); return; }
  const full = (state.outline&&state.outline.chapters||[]).length || 1;
  const cur = Math.max(0, ...(state.chapters||[]).map((c,i)=> (c && c.content && String(c.content).trim()) ? i+1 : 0));
  const ratio = Number.isFinite(state.subRecallRatio) ? state.subRecallRatio : 0.4;
  const rows = subs.map((s,i)=>{
    const nm = String(s.name||'').trim() || '（未命名）';
    const st = SUB_STATUSES.includes(s.status) ? s.status : '进行中';
    const closed = st==='已收束';
    const q = String(s.question||'').trim();
    const lastCh = Number.isFinite(s._lastCh) ? s._lastCh : (s.log&&s.log.length?Math.max(...s.log.map(x=>x.ch||0)):0);
    const gap = lastCh ? (cur-lastCh) : -1;
    const lost = lastCh>0 && gap > full*ratio;
    const statusTxt = closed ? (q ? '✅ 已收束（核心问题已回答）' : '🔒 已收束（未记录核心问题）') : (lost ? '⚠️ 未收束 · 已消失过久' : '🟢 进行中');
    const rowCls = closed ? 'sb-closed' : (lost ? 'sb-lost' : '');
    return `<div class="sb-row ${rowCls}">
      <div class="sb-head"><b>${esc(nm)}</b><span class="sb-status">${statusTxt}</span></div>
      <div class="sb-meta">${q?`问：${esc(q)}`:''}${lost?` · 距最新已生成章（第 ${cur} 章）已缺席 ${gap} 章（超全书 ${Math.round(ratio*100)}%）`:''}</div>
      <div class="sb-meta muted">${closed ? '已闭合，无需回归' : (lost ? '建议在后续章节安排一次回归并轻提前情' : '尚未收束，可继续自然推进')}</div>
    </div>`;
  }).join('');
  const ov = document.createElement('div');
  ov.id='subBoard'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🧵 副线收束看板</b><button class="gs-x" data-sb-close>✕</button></div>
      <div class="gs-body">
        <p class="muted" style="margin:0 0 8px">闭环硬性要求：副线可开放式结局，但必须回应其核心问题。消失超全书 ${Math.round(ratio*100)}% 的副线读者容易淡忘，建议安排回归（回归时 ≤20 字轻提前情）。</p>
        ${rows}
      </div>
      <div class="gs-actions"><button class="btn" data-sb-close>关闭</button></div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-sb-close]').forEach(b=> b.onclick = ()=>{ const p=$('#subBoard'); if(p) p.remove(); });
  ov.addEventListener('click', e=>{ if(e.target===ov){ const p=$('#subBoard'); if(p) p.remove(); } });
}
function openTimelineBoard(){
  const old = $('#tlBoard'); if(old) old.remove();
  const o = state.outline || {};
  const gt = o._globalTimeline;
  let body = '';
  const tlText = gt && String(gt.text||'').trim();
  if(tlText){
    body = `<div class="so-logline">${renderLoglineHtml(tlText)}</div>`;
  } else if(gt && Array.isArray(gt.chapters) && gt.chapters.length){
    const rows = gt.chapters.map(c=>{
      const t = cleanChapterTitle((o.chapters[c.index]&&o.chapters[c.index].title)||'');
      const jt = String(c.jump||'').trim();
      return `第${c.index+1}章《${t||'?'}》：${String(c.from||'?').trim()} → ${String(c.to||'?').trim()}${jt?`（跳跃：${jt}）`:''}`;
    });
    const notes = gt.notes ? `\n【节奏】${gt.notes}` : '';
    body = `<div class="so-logline">${renderLoglineHtml(rows.join('\n')+notes)}</div>`;
  } else {
    toast('暂无全局时间线（请先在④规划师生成全书时间线）');
    return;
  }
  const ov = document.createElement('div'); ov.id='tlBoard'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal" style="max-width:780px">
      <div class="gs-modal-head"><b>⏱ 全书时间线</b><button class="gs-x" data-tb-close>✕</button></div>
      <div class="gs-body">
        <p class="muted" style="margin:0 0 8px">全书跨各章的现实时间轴：首章起始 → 末章章末（单调推进）；带大跨度/跨支线的章已括号注明。</p>
        ${body || '<span class="muted">暂无可显示的时间线</span>'}
      </div>
      <div class="gs-actions"><button class="btn" data-tb-close>关闭</button></div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-tb-close]').forEach(b=> b.onclick = ()=>{ const p=$('#tlBoard'); if(p) p.remove(); });
  ov.addEventListener('click', e=>{ if(e.target===ov){ const p=$('#tlBoard'); if(p) p.remove(); } });
}
function chapterLenBounds(){
  const wr = (state.wordRange && +state.wordRange.min > 0 && +state.wordRange.max > 0)
    ? state.wordRange : { min: 3000, max: 3600 };
  const lo = Math.min(+wr.min, +wr.max), hi = Math.max(+wr.min, +wr.max);
  return { lo, hi, floor: Math.max(200, Math.round(lo * 0.9)) };
}
function sizeChapterInjection(){
  const n = realChapterCount();
  const b = chapterLenBounds();
  const lo = (b && +b.lo > 0) ? +b.lo : 3000;
  const hi = (b && +b.hi > 0) ? +b.hi : 3600;
  const total = n ? `全书共 ${n} 章；` : '';
  return `${total}本章建议篇幅约 ${lo.toLocaleString()}—${hi.toLocaleString()} 字。篇幅是参考范围，不以字数不足为理由自动进行第二次生成或扩写。
【篇幅原则】
· 第一优先：完成老师教案规定的全部核心事件、因果推进、人物选择与章末状态。
· 第二优先：在已经发生的事件内部把必要过程写完整，让动作、对白、反应、信息变化和因果关系自然呈现。
· 第三优先：使用有叙事功能的动作、对白、人物观察、感官、空间、心理和自然过渡；不要为了凑字数重复同一信息。
· 如果剧情在较短篇幅内已经完整成立，应自然收束，不强行增加篇幅。`;
}

function bindSizeHint(){
  const el = $('#sizeHint'); if(!el) return;
  el.textContent = sizeHintText();
  $$('[data-size-lbl]').forEach(b=>{
    const key = b.dataset.sizeLbl;          // e.g. 'word-min'
    const [side, kind] = key.split('-');
    const r = side==='word' ? state.wordRange : state.chapterRange;
    if(r && +r[kind]>0){ b.textContent = side==='word' ? (+r[kind]).toLocaleString() : r[kind]; }
  });
}
function chapterSysBase(){
  const keys = beatTypeKeys().join(' / ');
  const cnt = beatCnt();
  const base = LONG_CHAPTER_SYS_PRO
    .split('setup/rise/climax/hook').join(beatTypeKeys().join('/'))
    .split('setup / rise / climax / hook').join(keys)
    .split('四个事件').join(cnt + ' 段节拍事件');
  const closedGate = `【正文作家·多层执行链（闭卷创作规范）】
你是长篇小说的「正文作家（学生）」，只专注文学笔力、对白交锋与生动场面铺展。你的输入不是互相竞争的几份提示词，而是一条有权限层级的创作链。
【正文AI内部工作顺序｜必须先理解，再动笔】
1. 先完整阅读并整合“上下文理解包”。
2. 再逐项核对老师本章教案与已提供的小说状态数据：区分“已发生事实”与“本章计划”。
3. 再确定第一段的真实承接点、人物当前状态、信息边界与事件因果。
4. 再按老师教案的事件顺序写成连续小说，不输出分析、计划、节拍标签或后台术语。
5. 写作过程中只进行文学表达与必要的中间动作补足，不重新设计剧情。
6. 一旦本章最后一个必要事件完成且章末状态成立，立即停止；不要为了字数继续。

你的目标不是“写够多少字”，而是“把已经确定的故事写完整、写自然、写得像真正发生过”。

· L1【世界事实层】：词典达人 + 词典充实已经批准的世界、人物、地点、专名、规则；这是“世界是什么”，不得私自改写。
· L2【学校规划层】：校长的全书方向/阶段结构 + 老师本章教案；这是“本章写什么”。老师可以在世界允许范围内设计中间过程，正文必须完成其核心任务。
· L3【动态状态层】：上一章正文结算状态、物理接力、时间合同；这是“故事现在实际在哪里”。它优先决定开笔的真实状态，不能为了迎合教案而篡改上一章已经写成的事实。
· L4【文学表达层】：风格、语言、节奏与场景表现；这是“怎么写”。
任何层级都不能反向覆盖更高权威层。允许你发挥的是文学表达，以及教案允许的中间动作/细节；不允许你凭空重定义世界事实、时间状态或主线结果。
· 【上一章状态承接】若存在，以系统已提供的上一章结算状态作为开笔事实依据；若为首章，则执行第一章开篇任务卡。
· 【转场过桥律】：若已提供的上一章状态与本章教案「剧情时间落点」或骨架第①拍存在时空跨度，必须在首段顺势用 1~2 句自然笔法交代时空流转或环境位移，平滑过桥。
· 【核心主线防发散律】：正文作家不重新设计主线。词典资源由老师按章调配；正文只使用老师点名的核心人物/设定。对于不影响主线的现场动作、对话、环境和一次性过场人物，可以自然发挥，但不能创造会持续影响后文的新核心事实。
· 【场景过场路人与临时龙套点缀权】：正文作家可根据具体场景的叙事与氛围需要，自然点缀店小二、摊贩、茶客、更夫、传令兵、前台侍者等过场闲人。
  - 授权纪律：允许现场自然拟定称谓或名字，写一两句动作或对话即止，只作环境气氛烘托；
  - 边界红线：此类路人龙套只在当前场景出现一次，绝不推动主线，后续剧情不会再次登场，亦不计入词典，点到即收；严禁喧宾夺主或抢占主角/教案核心人物戏份。
· 【成篇写法与自然收束】：按教案推进骨架顺序自然流淌推进，相邻环节自然过渡融合；剧情完整并抵达章末状态后自然收束，不按数字机械收尾，严禁逐拍写标签或写散装提纲。
`;
  return closedGate + base;
}

const longChapterSys = () => {
  const parts = [];
  // 正文不再单独注入用户全局写作风格；本章具体写法要求以老师教案中的执行指令为准。
  parts.push(chapterSysBase());
  const iron = narrativeIronBlock('chapter');
  if(iron) parts.push(iron);
  parts.push('\n【篇幅体量】\n'+sizeChapterInjection());
  return parts.join('\n\n');
};

function fullStoryText(){
  return state.chapters.map(c => `【${c.title}】\n${c.content}`).join('\n\n');
}

function isLong(){ return state.mode === 'longnovel'; }

function renderStepper(){
  const steps = [
    {n:1,t:'故事构想'},{n:2,t:'角色提示词'},{n:3,t:'场景提示词'},
    {n:4,t:'分镜文字'},{n:5,t:'导出资产包'}
  ];
  $('#stepper').innerHTML = steps.map(s=>{
    const cls = s.n===currentStep ? 'active' : (s.n<currentStep ? 'done' : '');
    return `<span class="chip ${cls}">${s.n<currentStep?'✓ ':''}${s.t}</span>`;
  }).join('');
}

function updateMechaNav(){
  const mtn = $('#mechaTopNav'); if(!mtn) return;
  $$('.cap', mtn).forEach(c=>{
    const n = c.dataset.step ? +c.dataset.step : null;
    c.classList.toggle('active', n && n === currentStep);
  });
}

function render(){
  const _restY = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
  normalizeOutline(state.outline);
  destroyCharTS(); // 先销毁旧 Tom Select，避免 DOM 残留/重复实例
  restartCascade();
  renderStepper();
  updateMechaNav();
  $$('.tab').forEach(t=>{
    const n = +t.dataset.step;
    const hideLong = isLong() && (n===2 || n===4);
    t.classList.toggle('hidden', hideLong);
    t.classList.toggle('active', n===currentStep);
  });
  const v = $('#view');
  if(currentStep===1) v.innerHTML = viewStory();
  else if(currentStep===2) v.innerHTML = viewCharacters();
  else if(currentStep===3) v.innerHTML = viewScenes();
  else if(currentStep===4) v.innerHTML = viewStoryboard();
  else if(currentStep===5) v.innerHTML = viewExport();
  bindView();
  if(currentStep===1) bindFlowSideNav();
  updateWcTotal();
  if(_restY >= 0){ try{ window.scrollTo(0, _restY); }catch(e){} }
}


function currentTitle(){
  const o = state.outline;
  if(o && o.title) return o.title;
  return state.idea ? state.idea.trim().slice(0,20) : '未命名作品';
}
function pushTitleHistory(oldName){
  if(!oldName) return;
  const d = new Date();
  const date = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
    + ' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  state.titleHistory.unshift({ name: oldName, date });
  if(state.titleHistory.length > 50) state.titleHistory = state.titleHistory.slice(0,50);
}
function renameTitle(newName){
  newName = String(newName||'').trim();
  if(!newName){ toast('书名不能为空'); return; }
  const oldName = currentTitle();
  if(oldName === newName){ toast('书名未变化'); return; }
  pushTitleHistory(oldName);
  if(state.outline) state.outline.title = newName;
  persist(); render();
  toast(`已改名为「${newName}」，原「${oldName}」已记入曾用名`);
}
function titleManagerHtml(){
  let histRows;
  if(state.titleHistory && state.titleHistory.length){
    histRows = state.titleHistory.map((h,idx)=>
      `<div class="hist-row"><span class="hist-name">${esc(h.name)}</span><span class="hist-date">${esc(h.date)}</span>
        <span class="hist-ops">
          <button type="button" class="icon-btn hist-op" data-hist-restore="${esc(h.name)}" title="恢复为此名">↩</button>
          <button type="button" class="icon-btn hist-op" data-hist-del="${idx}" title="删除该记录">🗑</button>
        </span></div>`
    ).join('');
  }else{
    histRows = `<div class="hist-empty">暂无曾用名</div>`;
  }
  return `
    <div class="title-manager">
      <span class="tm-cur" id="tmCur" title="点击改名">${esc(currentTitle())}</span>
      <button type="button" class="icon-btn tm-tri" id="btnTmTri" title="曾用名" data-tm-tri>▾</button>
      <div class="tm-hist hidden" id="tmHist">
        <div class="hist-title">曾用名</div>
        ${histRows}
      </div>
    </div>`;
}
const CYBER_HOME_GRID = `
  <div class="cyber-home-grid">
    <button class="cyber-card-btn purple" data-step="1"><span class="ico">📖</span><span class="lab">故事</span><span class="sub">输入构想并生成章节</span></button>
    <button class="cyber-card-btn cyan" data-step="2"><span class="ico">🧑</span><span class="lab">角色</span><span class="sub">生成角色定妆提示词</span></button>
    <button class="cyber-card-btn pink" data-step="3"><span class="ico">🏞️</span><span class="lab">场景</span><span class="sub">生成场景即梦提示词</span></button>
    <button class="cyber-card-btn orange" data-step="4"><span class="ico">🎞️</span><span class="lab">分镜</span><span class="sub">生成视频分镜文字</span></button>
  </div>`;

const WRITE_PRESETS = [
  { id:'clear',          name:'🧹 默认（无风格）', tags:[] },
  { id:'preset-humor',   name:'😆 网感轻喜',  tags:['roast','webman','fast'] },
  { id:'preset-art',     name:'🌸 文艺唯美',  tags:['wenyi','poetic','minimal'] },
  { id:'preset-classic', name:'🏮 古典文学',  tags:['jinyong','ornate','storyteller'] },
  { id:'preset-mystery', name:'🕵️ 悬疑压抑',  tags:['suspense2','jifeng','multipov'] },
  { id:'preset-passion', name:'🔥 热血燃向',  tags:['fast','sliceoflife'] }
];
function writeStyleState(){ return state.chapterStyle = state.chapterStyle || { tags:[], collapsed:false }; }
let wsDraft = null;   // null=未编辑（与生效一致）；非 null=有草稿待应用
function wsDraftInit(){
  if(!wsDraft){ const st = writeStyleState(); wsDraft = { tags:(st.tags||[]).slice() }; }
  return wsDraft;
}
function wsDraftDirty(d, st){
  const a = ((d&&d.tags)||[]).slice().sort().join(',');
  const b = ((st&&st.tags)||[]).slice().sort().join(',');
  return a !== b;
}
function refreshWsUI(){
  const st = writeStyleState();
  const dirty = !!wsDraft && wsDraftDirty(wsDraft, st);
  const draft = wsDraft || st;
  const selName = (draft.tags||[]).map(id=>{ const s=writeStyleById(id); return s?s.name:id; }).join(' + ') || '无';
  const sum = $('.ws-sum');
  if(sum){ sum.textContent = (dirty?'⚠️ 待应用':'✔ 已生效')+' · '+(draft.tags||[]).length+' 项 · '+selName; sum.classList.toggle('dirty', dirty); }
  $$('[data-ws-tag]').forEach(b=> b.classList.toggle('on', (draft.tags||[]).includes(b.dataset.wsTag)));
  $$('[data-ws-combo]').forEach(b=>{
    const combo = availableCombos().find(c=> c.id === b.dataset.wsCombo);
    if(!combo) return;
    const active = combo.tags&&combo.tags.length && combo.tags.every(t=>(draft.tags||[]).includes(t));
    b.classList.toggle('on', active);
  });
  $$('.ws-subcat').forEach(sub=>{
    if(sub.classList.contains('open')) return;
    if(sub.querySelector('.ws-opt.on')){
      sub.classList.add('open');
      const ico = sub.querySelector('.ws-subcat-t .sc-fold-ico'); if(ico) ico.textContent='▾';
    }
  });
  const ap = $('[data-ws-apply]');
  if(ap){ ap.disabled = !dirty; ap.classList.toggle('disabled', !dirty); }
  const hint = $('.ws-dirty-hint');
  if(hint) hint.style.display = dirty ? '' : 'none';
}
const WS_COLOR_SCHEMES = [
  { id:'none',    name:'默认（无配色）', c:[] },
  { id:'s1',  name:'活力橙紫青', c:['#2fb4af'] },
  { id:'s2',  name:'海洋蓝青',   c:['#b1e4e7'] },
  { id:'s3',  name:'皇家蓝绛红', c:['#dcb582'] },
  { id:'s4',  name:'蔷薇粉紫',   c:['#e2d8ef'] },
  { id:'s5',  name:'绯红玫紫',   c:['#fcbed4'] },
  { id:'s6',  name:'绯红钢青',   c:['#f8b79a'] },
  { id:'s7',  name:'青黄珊瑚',   c:['#f65150'] },
  { id:'s8',  name:'深蓝明黄',   c:['#4fcbe9'] },
  { id:'s9',  name:'薄荷明黄',   c:['#24b4a5'] },
  { id:'s10', name:'暖金珊瑚',   c:['#f9e9da'] },
  { id:'s11', name:'自然翠金',   c:['#f5b11e'] },
];
function wsColorCfgOf(c){ c.styleCustom = c.styleCustom || { notes:{},added:[],removed:[] }; c.styleCustom.colorSchemes = c.styleCustom.colorSchemes || { custom:[], removedCustom:[], removedBuiltin:[], undo:[] }; return c.styleCustom.colorSchemes; }
function wsColorCfg(){ return wsColorCfgOf(getCfg()); }               // 只读访问
function wsCustomColors(){ return wsColorCfg().custom || []; }        // 未删除的自定义
function wsRemovedBuiltin(){ return wsColorCfg().removedBuiltin || []; }
function wsRemovedCustom(){ return wsColorCfg().removedCustom || []; }
function wsUndoLog(){ return wsColorCfg().undo || []; }
function wsColorSchemesList(){
  const rm = wsRemovedBuiltin();
  return WS_COLOR_SCHEMES.filter(s=>!rm.includes(s.id)).concat(wsCustomColors());
}
function wsSchemeColors(id){
  if(id==='none') return [];
  const s = WS_COLOR_SCHEMES.find(x=>x.id===id) || wsCustomColors().find(x=>x.id===id) || wsRemovedCustom().find(x=>x.id===id);
  return s ? (s.c||[]) : [];
}
function wsSchemeName(id){
  if(id==='none') return '默认（无配色）';
  const s = WS_COLOR_SCHEMES.find(x=>x.id===id) || wsCustomColors().find(x=>x.id===id);
  return s ? s.name : id;
}
function wsColorSchemeId(){
  const sc = getCfg().styleCustom||{};
  const id = sc.colorScheme || 'none';
  if(id==='none') return 'none';
  if(WS_COLOR_SCHEMES.find(s=>s.id===id) && !wsRemovedBuiltin().includes(id)) return id;
  if(wsCustomColors().find(s=>s.id===id)) return id;
  return 'none';
}
function rebuildCustomColorCss(){
  let el = document.getElementById('wsCustomCss');
  if(!el){ el = document.createElement('style'); el.id='wsCustomCss'; document.head.appendChild(el); }
  el.textContent = wsCustomColors().map(s=>{ const col=(s.c&&s.c.length)? s.c[s.c.length-1] : ''; return col ? `[data-cs="${s.id}"]{--c-element:${col}}` : ''; }).filter(Boolean).join('\n');
}
function writeStyleChipsHtml(sel, dataPrefix, opts){
  opts = opts || {};
  const lib = writeStyleLib();
  const CAT_LABEL = { '语言质感':'① 语言质感', '情绪与张力':'② 情绪与张力', '节奏与网感':'③ 节奏与网感', '叙事技法':'④ 叙事技法', '台词设计':'⑤ 台词设计', custom:'⭐ 我的自定义' };
  const CAT_ORDER = ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计','custom'];
  const items = lib.filter(s=>s.group==='element');
  const mkOpt = s=>`<div class="ws-opt ${(sel.tags||[]).includes(s.id)?'on':''}" data-${dataPrefix}-tag="${s.id}">
    <div class="ws-opt-name">${esc(s.name)}</div>
    <div class="ws-opt-note">${esc(s.note)}</div>
  </div>`;
  const plus = opts.plus ? `<button type="button" class="ws-chip ws-chip-plus" data-${dataPrefix}-add="element" title="点击新建文风词条">＋</button>` : '';
  const useFold = dataPrefix === 'ws';
  const catOpen = (useFold && writeStyleState().catOpen) || {};
  const blocks = CAT_ORDER.map(cat=>{
    const its = items.filter(s=>(s.cat||'element')===cat);
    if(!its.length) return '';
    const hits = its.filter(s=>(sel.tags||[]).includes(s.id));
    const expanded = useFold ? (catOpen[cat] === true) : false;    // 展开态=显示本类全部
    const hasSel = hits.length > 0;
    const showBody = useFold ? (expanded || hasSel) : true;        // 专注态下：有已选则展示体(只显已选)，无已选则收成标题
    const shown = expanded ? its : hits;                            // 展开=全部；专注=仅已选
    const fold = useFold ? `<span class="sc-fold-ico">${expanded?'▾':'▸'}</span>` : '';
    return `<div class="ws-subcat${showBody?' open':''}"${useFold?` data-ws-catfold="${cat}"`:''}>
      <div class="ws-subcat-t"${useFold?' role="button" tabindex="0" title="专注态只显示已选词条，点此展开查看本类全部"':''}>${CAT_LABEL[cat]||cat}${useFold?`（${expanded ? `共 ${its.length}` : `已选 ${hits.length}`}）`:''}${fold}</div>
      <div class="ws-subcat-fold"><div class="ws-opt-list">${shown.map(mkOpt).join('')}</div></div>
    </div>`;
  }).filter(Boolean).join('');
  const comboList = dataPrefix==='ws' ? availableCombos() : [];
  const comboRemovedN = (getCfg().styleCustom||{}).comboRemoved && getCfg().styleCustom.comboRemoved.length ? getCfg().styleCustom.comboRemoved.length : 0;
  const customCombos = dataPrefix==='ws' ? ((getCfg().styleCustom||{}).customCombos||[]) : [];
  const comboOpen = (dataPrefix==='ws' && getCfg().styleCustom && getCfg().styleCustom.comboOpen) || {};
  const comboActive = c => !!(c.tags&&c.tags.length && (c.tags||[]).every(t=>(sel.tags||[]).includes(t)));
  const mkCombo = c=> `<div class="ws-opt ws-combo-btn${comboActive(c)?' on':''}" data-ws-combo="${c.id}"><span class="ws-combo-del" data-ws-combo-del="${c.id}" title="删除此组合">✕</span><div class="ws-opt-name">${esc(c.name)}</div><div class="ws-opt-note">${esc(c.desc||'')}</div></div>`;
  const comboBar = dataPrefix==='ws'
    ? `<div class="ws-combo${comboOpen.builtin===false?'':' open'}" data-ws-combofold="builtin">
       <div class="ws-subcat-t" role="button" tabindex="0" title="展开/收起">
         <span class="ws-combo-title"><span class="sc-fold-ico">${comboOpen.builtin===false?'▸':'▾'}</span> 🎬 组合配方 <span class="muted" style="font-size:10px;font-weight:400">点击即替换当前选择，可再叠加细项</span></span>
         ${comboRemovedN?`<button type="button" class="ws-combo-restore" data-ws-combo-restore>恢复已删组合(${comboRemovedN})</button>`:''}
       </div>
       <div class="ws-subcat-fold"><div class="ws-opt-list">${comboList.filter(c=>!c.custom).map(mkCombo).join('')}</div></div>
     </div>
     <div class="ws-combo ws-combo-mine${comboOpen.custom===false?'':' open'}" data-ws-combofold="custom">
       <div class="ws-subcat-t" role="button" tabindex="0" title="展开/收起">
         <span class="ws-combo-title"><span class="sc-fold-ico">${comboOpen.custom===false?'▸':'▾'}</span> 🏷 我的配方</span>
         <button type="button" class="ws-combo-add" data-ws-combo-add title="把当前草稿保存为自定义组合配方">＋</button>
       </div>
       <div class="ws-subcat-fold"><div class="ws-opt-list">${customCombos.map(mkCombo).join('')}</div></div>
     </div>`
    : '';
  const chipsTail = (opts.plus || opts.showTip !== false)
    ? `<div class="ws-chips">${opts.showTip !== false ? '<span class="ws-group-tip">可多选</span>' : ''}${plus}</div>` : '';
  return `${comboBar}${blocks}${chipsTail}`;
}

function toggleWriteTag(sel, id){
  const s = writeStyleById(id); if(!s) return;
  if(sel.tags.includes(id)){
    sel.tags = sel.tags.filter(x=>x!==id);
  } else {
    if(!sel.tags.includes(id)) sel.tags.push(id);
  }
}
function writeStyleCard(){
  const st = writeStyleState();
  const draft = wsDraft || st;
  const dirty = !!wsDraft && wsDraftDirty(wsDraft, st);
  const selName = (draft.tags||[]).map(id=>{ const s=writeStyleById(id); return s?s.name:id; }).join(' + ') || '无';
  const sumTxt = (dirty?'⚠️ 待应用':'✔ 已生效')+' · 🔒 表达层'+((draft.tags||[]).length?'已锁定':'待选择')+' · '+(draft.tags||[]).length+' 项 · '+selName;
  return `<div class="card ws-card card-theme-style${st.collapsed?' ws-collapsed':''}" data-cs="${wsColorSchemeId()}">
    <div class="ws-head card-head-bar" data-ws-fold role="button" tabindex="0" title="展开/收起">
      <div class="ch-left">
        <span class="ch-badge ch-badge-style">🎨</span>
        <h3 class="ch-title">写作风格基调</h3>
        <span class="ch-subtag ch-subtag-style${dirty?' dirty':''}">${sumTxt}</span>
      </div>
      <div class="ch-right">
        <button type="button" class="btn ghost ws-manage-btn" data-ws-lib title="编辑风格词库与我的收藏">⚙️ 管理</button>
        <span class="sc-fold-ico">${st.collapsed?'▸':'▾'}</span>
      </div>
    </div>
    <div class="ws-body"${st.collapsed?' hidden':''}>
      <div class="ws-fold-tools">
        <button type="button" class="btn small ghost" data-ws-fold-all title="展开全部词条类别">⤵ 全部展开</button>
        <button type="button" class="btn small ghost" data-ws-fold-none title="收起全部词条类别">⤴ 全部收起</button>
      </div>
      ${writeStyleChipsHtml(draft, 'ws', { plus:false, cardFold:true, showTip:false })}
      <div class="ws-tools">
        <button type="button" class="ws-chip ws-chip-plus" data-ws-add="element" title="点击新建文风词条">＋</button>
        <button type="button" class="btn small primary ws-apply${dirty?'':' disabled'}" data-ws-apply ${dirty?'':'disabled'} title="把当前草稿设为生效配置（从此生成用这套风格）">✔ 应用并保存</button>
        <button type="button" class="btn small ghost" data-ws-save title="把当前草稿收藏为预设（跨作品可用）">💾 收藏当前</button>
        <button type="button" class="btn small ghost" data-ws-clear>✕ 清空</button>
      </div>
      <p class="ws-dirty-hint" style="display:${dirty?'':'none'}">⚠️ 存在未生效的修改，点「✔ 应用并保存」生效</p>
    </div>
  </div>`;
}
function bindWriteStyle(){
  const st = writeStyleState();
  const head = $('[data-ws-fold]');
  if(head) head.onclick = ()=>{
    st.collapsed = !st.collapsed; persist();
    const body = $('.ws-body'); if(body) body.hidden = st.collapsed;
    const ico = head.querySelector('.sc-fold-ico'); if(ico) ico.textContent = st.collapsed?'▸':'▾';
  };
  $$('[data-ws-tag]').forEach(b=> b.onclick = ()=>{
    toggleWriteTag(wsDraftInit(), b.dataset.wsTag);
    refreshWsUI();
  });
  $$('[data-ws-combo]').forEach(b=> b.onclick = ()=>{
    const combo = availableCombos().find(c=> c.id === b.dataset.wsCombo); if(!combo) return;
    const d = wsDraftInit();
    const libIds = writeStyleLib().map(s=>s.id);
    d.tags = (combo.tags||[]).filter(id=> libIds.includes(id));
    render();
    toast(`已套用组合「${combo.name}」：${(d.tags.map(id=>{const s=writeStyleById(id);return s?s.name:id}).join(' + '))||'（部分词条已删，未套用）'}，点「✔ 应用并保存」生效`);
  });
  $$('[data-ws-combo-del]').forEach(b=> b.onclick = (e)=>{
    e.stopPropagation();
    const id = b.dataset.wsComboDel; if(!id) return;
    const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
    const isBuiltin = WRITE_COMBOS.some(c=> c.id === id);
    if(isBuiltin){
      const combo = WRITE_COMBOS.find(c=> c.id === id);
      if(!combo) return;
      if(!window.confirm(`删除组合「${combo.name}」后不再显示，可通过「恢复已删组合」还原。确定删除？`)) return;
      cfg.styleCustom.comboRemoved = cfg.styleCustom.comboRemoved || [];
      if(!cfg.styleCustom.comboRemoved.includes(id)) cfg.styleCustom.comboRemoved.push(id);
      saveCfg(cfg); render(); toast(`已删除组合「${combo.name}」`);
    } else {
      const combo = (cfg.styleCustom.customCombos||[]).find(c=> c.id === id);
      if(window.confirm(`删除自定义组合「${combo?combo.name:id}」？删后不可撤销。确定删除？`)){
        cfg.styleCustom.customCombos = (cfg.styleCustom.customCombos||[]).filter(x=> x.id !== id);
        saveCfg(cfg); render(); toast('已删除自定义组合');
      }
    }
  });
  const cadd = $('[data-ws-combo-add]');
  if(cadd) cadd.onclick = ()=>{
    const cur = wsDraft || writeStyleState();
    const tags = (cur.tags||[]).slice();
    if(!tags.length){ toast('当前无风格，暂无可保存的组合配方'); return; }
    const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
    cfg.styleCustom.customCombos = cfg.styleCustom.customCombos || [];
    const name = prompt('给这个组合配方起个名字：', '我的配方' + (cfg.styleCustom.customCombos.length + 1));
    if(!name || !name.trim()) return;
    const desc = tags.map(id=>{ const s=writeStyleById(id); return s? s.name : id; }).join(' + ');
    cfg.styleCustom.customCombos.push({ id:'cu'+Date.now().toString(36), name:name.trim(), desc, tags });
    saveCfg(cfg); render();
    toast('已保存为自定义组合「' + name.trim() + '」，点它即可一键套用');
  };
  const cre = $('[data-ws-combo-restore]');
  if(cre) cre.onclick = ()=>{
    if(!window.confirm('恢复全部被删除的组合配方？')) return;
    const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
    cfg.styleCustom.comboRemoved = [];
    saveCfg(cfg); render(); toast('已恢复全部默认组合');
  };
  const sel = $('#wsPreset');
  const ap = $('[data-ws-apply]');
  if(ap) ap.onclick = ()=>{
    if(!wsDraft) return;
    const st2 = writeStyleState();
    st2.tags = wsDraft.tags.slice();
    persist();
    const name = wsDraft.tags.map(id=>{ const s=writeStyleById(id); return s?s.name:id; }).join(' + ') || '无';
    wsDraft = null;
    refreshWsUI();
    toast('写作风格已生效：'+(name==='无'?'无风格（AI 默认文风）':name));
  };
  const sv = $('[data-ws-save]');
  if(sv) sv.onclick = ()=>{
    const cur = wsDraft || writeStyleState();
    if(!cur.tags.length){ toast('当前无风格，无需收藏'); return; }
    const cfg = getCfg(); if(!Array.isArray(cfg.stylePresets)) cfg.stylePresets = [];
    const name = prompt('给这个风格组合起个名字：', '我的风格'+(cfg.stylePresets.length+1));
    if(!name || !name.trim()) return;
    cfg.stylePresets.push({ id:'sp'+Date.now().toString(36), name:name.trim(), tags:cur.tags.slice() });
    saveCfg(cfg); render();
    toast('已收藏：'+name.trim());
  };
  const lb = $('[data-ws-lib]');
  if(lb) lb.onclick = (e)=>{ e.stopPropagation(); openStyleLibPanel(); };
  const cl = $('[data-ws-clear]');
  if(cl) cl.onclick = ()=>{ const d = wsDraftInit(); d.tags=[]; refreshWsUI(); toast('已清空草稿，点「✔ 应用并保存」生效'); };
  const wsCard = $('.ws-card');
  const fa = wsCard && wsCard.querySelector('[data-ws-fold-all]');
  if(fa) fa.onclick = ()=>{ const st=writeStyleState(); st.catOpen=st.catOpen||{};
    ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].forEach(k=> st.catOpen[k]=true);
    persist(); render(); };
  const fn = wsCard && wsCard.querySelector('[data-ws-fold-none]');
  if(fn) fn.onclick = ()=>{ const st=writeStyleState(); st.catOpen=st.catOpen||{};
    ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].forEach(k=> st.catOpen[k]=false);
    persist(); render(); };
  if(wsCard && !wsCard.dataset.catfoldBound){
    wsCard.dataset.catfoldBound = '1';
    wsCard.addEventListener('click', e=>{
      const t = e.target.closest('.ws-subcat-t');
      if(!t || !t.hasAttribute('role')) return;
      if(e.target.closest('.ws-combo-add, .ws-combo-restore')) return;
      const sub = t.closest('.ws-subcat, .ws-combo');
      if(!sub) return;
      if(sub.dataset.wsCombofold!==undefined){
        const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
        cfg.styleCustom.comboOpen = cfg.styleCustom.comboOpen || {};
        const open = !sub.classList.contains('open');
        cfg.styleCustom.comboOpen[sub.dataset.wsCombofold] = open; saveCfg(cfg);
        sub.classList.toggle('open', open);
        const ico = t.querySelector('.sc-fold-ico'); if(ico) ico.textContent = open?'▾':'▸';
        return;
      }
      if(sub.dataset.wsCatfold===undefined) return;
      const st = writeStyleState(); st.catOpen = st.catOpen || {};
      st.catOpen[sub.dataset.wsCatfold] = !(st.catOpen[sub.dataset.wsCatfold]===true); persist();
      render();
    });
  }
  $$('[data-ws-add]').forEach(b=> b.onclick = ()=> openStyleNewDialog(b.dataset.wsAdd));
}
function openStyleNewDialog(group){
  closeStyleNewDialog();
  const CAT_LABEL = { '语言质感':'① 语言质感', '情绪与张力':'② 情绪与张力', '节奏与网感':'③ 节奏与网感', '叙事技法':'④ 叙事技法', '台词设计':'⑤ 台词设计', custom:'⭐ 我的自定义' };
  const catLabel = ()=> CAT_LABEL[group] || '自定义';
  const ov = document.createElement('div'); ov.id='wsNewPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>＋ 新建文风词条</b>
        <button class="gs-x" data-wsn-close>✕</button></div>
      <div class="cv-body">
        <label style="font-size:12px;color:var(--sub)">归属分类</label>
        <select id="wsnCat" style="margin:4px 0 10px">
          <option value="语言质感"${group==='语言质感'?' selected':''}>① 语言质感</option>
          <option value="情绪与张力"${group==='情绪与张力'?' selected':''}>② 情绪与张力</option>
          <option value="节奏与网感"${group==='节奏与网感'?' selected':''}>③ 节奏与网感</option>
          <option value="叙事技法"${group==='叙事技法'?' selected':''}>④ 叙事技法</option>
          <option value="台词设计"${group==='台词设计'?' selected':''}>⑤ 台词设计</option>
          <option value="custom"${group==='custom'?' selected':''}>⭐ 我的自定义</option>
        </select>
        <label style="font-size:12px;color:var(--sub)">风格名称（≤20字）*</label>
        <input type="text" id="wsnName" maxlength="20" placeholder="如：民国腔调 / 冷硬悬疑" style="margin:4px 0 10px" />
        <label style="font-size:12px;color:var(--sub)">指令文本（≤500字）</label>
        <textarea id="wsnNote" rows="4" maxlength="500" placeholder="推荐三行配方：&#10;写法：…&#10;避免：…&#10;自查：…" style="margin:4px 0 6px"></textarea>
        <div class="muted" style="font-size:11px">确认后将于「<span data-wsn-catlab>${catLabel()}</span>」分类下添加并默认勾选（草稿态，点「✔ 应用并保存」正式生效）。</div>
      </div>
      <div class="modal-actions" style="padding:12px 16px;border-top:1px solid var(--line)">
        <button type="button" class="btn ghost" data-wsn-close2>取消</button>
        <button type="button" class="btn primary" data-wsn-ok>✔ 确认新建</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const lab = ov.querySelector('[data-wsn-catlab]');
  const catSel = ov.querySelector('#wsnCat');
  if(catSel && lab) catSel.onchange = ()=> lab.textContent = CAT_LABEL[catSel.value] || '自定义';
  const close = ()=> closeStyleNewDialog();
  ov.querySelector('[data-wsn-close]').onclick = close;
  ov.querySelector('[data-wsn-close2]').onclick = close;
  ov.addEventListener('click', e=>{ if(e.target===ov) close(); });
  ov.querySelector('[data-wsn-ok]').onclick = ()=>{
    const name = ($('#wsnName') && $('#wsnName').value.trim()) || '';
    if(!name){ toast('请填写风格名称'); return; }
    const note = ($('#wsnNote') && $('#wsnNote').value.trim().slice(0,500)) || '';
    const cat = (catSel && catSel.value) || group || 'custom';
    const c = getCfg(); c.styleCustom = c.styleCustom || { notes:{}, added:[], removed:[] };
    c.styleCustom.added = c.styleCustom.added || [];
    const id = 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    c.styleCustom.added.push({ id, group:cat, name, note });
    saveCfg(c);
    const d = wsDraftInit(); if(!d.tags.includes(id)) d.tags.push(id);
    closeStyleNewDialog();
    render();
    toast('已新建并加入「'+name+'」');
  };
  const inp = $('#wsnName'); if(inp) inp.focus();
}
function closeStyleNewDialog(){ const p=$('#wsNewPanel'); if(p) p.remove(); }
function applyWritePresetDraft(v){
  const d = wsDraftInit();
  if(v === 'clear'){ d.tags=[]; }
  else if(v.indexOf('u:')===0){
    const cfg = getCfg();
    const p = (Array.isArray(cfg.stylePresets)?cfg.stylePresets:[]).find(x=>x.id===v.slice(2));
    if(p){ d.tags = (p.tags||[]).slice(); }
  } else {
    const p = WRITE_PRESETS.find(x=>x.id===v);
    if(p){ d.tags = p.tags.slice(); }
  }
  refreshWsUI();
}
function openStyleLibPanel(){
  closeStyleLibPanel();
  const cfg = getCfg();
  if(!cfg.styleCustom) cfg.styleCustom = { notes:{}, added:[], removed:[], comboRemoved:[] };
  const lib = writeStyleLib();
  const CAT_LABEL = { '语言质感':'① 语言质感', '情绪与张力':'② 情绪与张力', '节奏与网感':'③ 节奏与网感', '叙事技法':'④ 叙事技法', '台词设计':'⑤ 台词设计', custom:'⭐ 我的自定义' };
  const groups = Object.keys(CAT_LABEL);
  const notes = cfg.styleCustom.notes || {};
  const groupHtml = groups.map(g=>{
    const its = lib.filter(s=>(s.cat||'element')===g);
    return `<div class="ws-lib-group ws-lib-fold">
      <div class="ws-lib-fold-t" data-lib-fold="${g}" role="button" tabindex="0" title="展开/收起">
        <span>${CAT_LABEL[g]}${its.length?`（${its.length}）`:'（空）'}</span><span class="sc-fold-ico">▸</span>
      </div>
      <div class="ws-lib-fold-b" hidden>
        ${its.map(s=>`
        <div class="ws-lib-item">
          <div class="ws-lib-name">${esc(s.name)}${notes[s.id]?'<span class="ws-changed">已改</span>':''}${s.custom?'<span class="ws-custom">自定义</span>':''}</div>
          <textarea class="ws-lib-note" data-lib-note="${s.id}" rows="2" maxlength="500" placeholder="指令文本（≤500字；可用 写法:/避免:/自查: 三行写配方）">${esc(s.note||'')}</textarea>
          <div class="ws-lib-tools">
            ${s.custom?`<button type="button" class="btn small ghost" data-lib-del="${s.id}" title="删除该自定义词条">🗑 删除</button>`:`<button type="button" class="btn small ghost" data-lib-hide="${s.id}" title="从选择中移除该词条（「恢复默认」可还原）">🚫 停用</button>`}
          </div>
        </div>`).join('')}
        ${its.length?'':`<p class="muted" style="margin:4px 0">该组暂无词条：回到写作风格卡片点该组「＋」新建。</p>`}
      </div>
    </div>`;
  }).join('');
  const mine = (Array.isArray(cfg.stylePresets)?cfg.stylePresets:[]).map((p,i)=>`
    <div class="ws-lib-item">
      <div class="ws-lib-name">⭐ ${esc(p.name||'未命名')}</div>
      <span class="muted" style="font-size:11px">${(p.tags||[]).map(id=>{const s=writeStyleById(id); return s?s.name:id;}).join('+')||'无'}</span>
      <button type="button" class="btn small ghost del" data-sp-del="${i}">删</button>
    </div>`).join('') || '<p class="muted">暂无收藏。</p>';
  const combos_ = availableCombos();
  const combosHtml = combos_.length ? combos_.map(c=>`
    <div class="ws-lib-item">
      <div class="ws-lib-name">${c.custom?'🏷':'🎬'} ${esc(c.name||'未命名')}</div>
      <div class="ws-lib-note" style="white-space:pre-wrap;margin:2px 0 4px">${esc(c.desc||'')}</div>
      ${c.why?`<div class="ws-lib-why">💡 为何这样选：${esc(wiseWhyText(c.why))}</div>`:''}
      <span class="muted" style="font-size:11px">词条：${(c.tags||[]).map(id=>{const s=writeStyleById(id); return s?s.name:id;}).join(' + ')||'无'}</span>
    </div>`).join('') : '<p class="muted">暂无配方。</p>';
  const ov = document.createElement('div'); ov.id='wsLibPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>⚙️ 写作风格管理</b>
        <span style="display:flex;gap:6px">
          <button class="btn small ghost" data-lib-read>📖 阅读</button>
          <button class="btn small ghost" data-lib-reset>恢复默认</button>
          <button class="gs-x" data-lib-close>✕</button>
        </span></div>
      <!-- v239/905-1：管理第二行去掉「📜 消息看板」（看板入口保留在「叙事」菜单与 toast 📋 按钮）；「📦 选择导出」改为仅导出写作风格卡片内容（组合配方/我的配方/五大类词条） -->
      <div class="ws-lib-toprow">
        <span class="muted" style="font-size:11px;flex:0 0 auto">导入 / 导出：</span>
        <button type="button" class="btn small ghost" data-lib-rexcenter title="打开导出中心：平铺勾选组合配方、我的配方与五大类词条，打包导出">📦 选择导出</button>
        <button type="button" class="btn small ghost" data-lib-import title="导入风格词条包（合并式：只添加我没有的）">⬆ 导入词条</button>
        <button type="button" class="btn small ghost" data-lib-rimport title="导入配方包 JSON（先预览勾选，再确认导入；词条自动合并进词库）">⬆ 导入配方包</button>
        <input type="file" id="wsLibImportFile" accept=".json,application/json" hidden />
        <input type="file" id="wsRecipeImportFile" accept=".json,application/json" hidden />
      </div>
      <div class="cv-body">
        <div class="ws-lib-group ws-lib-fold">
          <div class="ws-lib-fold-t" data-lib-fold="combos" role="button" tabindex="0" title="展开/收起">
            <span>🧪 全部配方（${combos_.length}）</span><span class="sc-fold-ico">▾</span>
          </div>
          <div class="ws-lib-fold-b">${combosHtml}</div>
        </div>
        <div class="cv-div">支持在线编辑指令、停用内置词条或删除自定义项，实时生效。</div>
        ${groupHtml}
        <div class="ws-lib-group ws-lib-fold">
          <div class="ws-lib-fold-t" data-lib-fold="mine" role="button" tabindex="0" title="展开/收起">
            <span>⭐ 我的收藏</span><span class="sc-fold-ico">▸</span>
          </div>
          <div class="ws-lib-fold-b" hidden>${mine}</div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-lib-close]').onclick = closeStyleLibPanel;
  ov.querySelector('[data-lib-read]').onclick = () => openStyleLibReader();
  ov.querySelector('[data-lib-import]').onclick = ()=>{ const f=$('#wsLibImportFile'); if(f) f.click(); };
  const wlImp = ov.querySelector('#wsLibImportFile'); if(wlImp) wlImp.onchange = e=>{ const file=e.target.files && e.target.files[0]; if(file) importWsStyleBundle(file); e.target.value=''; };
  const rexc = ov.querySelector('[data-lib-rexcenter]'); if(rexc) rexc.onclick = ()=> openExportCenter();
  ov.querySelector('[data-lib-rimport]').onclick = ()=>{ const f=$('#wsRecipeImportFile'); if(f) f.click(); };
  const rImp = ov.querySelector('#wsRecipeImportFile'); if(rImp) rImp.onchange = e=>{ const file=e.target.files && e.target.files[0]; if(file) importRecipeBundle(file); e.target.value=''; };
  ov.addEventListener('click', e=>{ if(e.target===ov) closeStyleLibPanel(); });
  ov.querySelectorAll('[data-lib-fold]').forEach(h=> h.onclick = ()=>{
    const b = h.nextElementSibling; if(!b) return;
    const ico = h.querySelector('.sc-fold-ico'); if(ico) ico.textContent = b.hidden ? '▾' : '▸';
    b.hidden = !b.hidden;
  });
  ov.querySelectorAll('[data-lib-note]').forEach(ta=>{
    ta.onchange = ()=>{
      const id = ta.dataset.libNote;
      const v = ta.value.trim().slice(0,500);
      if(v) cfg.styleCustom.notes[id] = v; else delete cfg.styleCustom.notes[id];
      saveCfg(cfg);
      const it = ta.closest('.ws-lib-item'); const nm = it && it.querySelector('.ws-lib-name');
      if(nm){
        let badge = nm.querySelector('.ws-changed');
        if(v){ if(!badge){ badge=document.createElement('span'); badge.className='ws-changed'; badge.textContent='已改'; nm.appendChild(badge); } }
        else if(badge) badge.remove();
      }
      toast('已保存指令');
    };
  });
  ov.querySelectorAll('[data-lib-del]').forEach(b=>{
    b.onclick = ()=>{
      cfg.styleCustom.added = (cfg.styleCustom.added||[]).filter(x=>x.id!==b.dataset.libDel);
      saveCfg(cfg); render(); toast('已删除自定义风格');
      closeStyleLibPanel(); openStyleLibPanel();   // 立即刷新面板，删除项即时消失
    };
  });
  ov.querySelectorAll('[data-lib-hide]').forEach(b=>{
    b.onclick = ()=>{
      if(!window.confirm('停用后该词条将从选择中移除，可通过「恢复默认」还原。确定停用？')) return;
      cfg.styleCustom.removed = cfg.styleCustom.removed || [];
      if(!cfg.styleCustom.removed.includes(b.dataset.libHide)) cfg.styleCustom.removed.push(b.dataset.libHide);
      saveCfg(cfg); render(); toast('已停用该词条');
      closeStyleLibPanel(); openStyleLibPanel();
    };
  });
  ov.querySelectorAll('[data-sp-del]').forEach(b=>{
    b.onclick = ()=>{
      cfg.stylePresets.splice(+b.dataset.spDel,1);
      saveCfg(cfg); render(); toast('已删除收藏');
      closeStyleLibPanel(); openStyleLibPanel();   // 立即刷新面板，删除项即时消失
    };
  });
  ov.querySelector('[data-lib-reset]').onclick = ()=>{
    if(!window.confirm('恢复默认将清空全部词库改动（自定义新增也会删除）。确定？')) return;
    cfg.styleCustom = { notes:{}, added:[], removed:[], comboRemoved:[] };
    saveCfg(cfg); render(); toast('已恢复默认词库');
    closeStyleLibPanel(); openStyleLibPanel();   // 立即重建面板：清掉「已改」标记、自定义项与编辑过的指令
  };
}
function importWsStyleBundle(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    let data;
    try{ data = JSON.parse(reader.result); }
    catch(e){ toast('导入失败：文件不是合法 JSON'); return; }
    if(data && data.kind === 'wsStylePack'){
      const builtinEntryIds = new Set((WRITE_STYLES||[]).map(s=> s && s.id).filter(Boolean));
      const builtinComboIds = new Set((WRITE_COMBOS||[]).map(c=> c && c.id).filter(Boolean));
      const CATS = ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'];
      const entries = Array.isArray(data.entries) ? data.entries : [];
      const added = entries
        .filter(x=> x && x.id && x.name && !builtinEntryIds.has(String(x.id)))
        .map(x=>({ id:String(x.id), group: CATS.includes(x.cat)?x.cat:(CATS.includes(x.group)?x.group:'custom'), name:String(x.name), note:String(x.note||''), demo:x.demo?String(x.demo):'', seal:(x.seal===undefined?0:x.seal), warning:x.warning?String(x.warning):'' }));
      const notes = {};
      entries.forEach(x=>{
        if(x && x.id && builtinEntryIds.has(String(x.id))){
          const b = (WRITE_STYLES||[]).find(s=> s && s.id===x.id);
          if(b && String(x.note||'') !== String(b.note||'')) notes[String(x.id)] = String(x.note||'');
        }
      });
      const myC = (Array.isArray(data.myCombos)?data.myCombos:[]).filter(c=> c && c.id && c.name);
      const extraC = (Array.isArray(data.combos)?data.combos:[]).filter(c=> c && c.id && c.name && !builtinComboIds.has(String(c.id)));
      data = { styleCustom: { notes, added, removed:[], comboRemoved:[], customCombos: myC.concat(extraC) } };
    }
    if(!data || typeof data !== 'object' || !data.styleCustom || typeof data.styleCustom !== 'object'){
      toast('导入失败：不是合法的写作风格配方 JSON'); return;
    }
    const sc = data.styleCustom;
    const strArr = v => Array.isArray(v) ? v.map(String).filter(x=> !!x) : [];
    const builtinIds = [].concat(WRITE_STYLES || []).map(s=> s && s.id).filter(Boolean);
    const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || { notes:{}, added:[], removed:[], comboRemoved:[] };
    let addedN=0, keptN=0;
    const notes = (sc.notes && typeof sc.notes==='object') ? sc.notes : {};
    Object.keys(notes).forEach(id=>{ if(!(id in cfg.styleCustom.notes)) cfg.styleCustom.notes[id] = notes[id]; });
    const haveIds = new Set((cfg.styleCustom.added||[]).map(x=> x && x.id));
    (Array.isArray(sc.added) ? sc.added : [])
      .filter(x=> x && x.id && x.name)
      .map(x=>({ id:String(x.id), group:['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].includes(x.group)?x.group:'custom', name:String(x.name), note:String(x.note||''), demo:x.demo?String(x.demo):'', seal:(x.seal===undefined?0:x.seal), warning:x.warning?String(x.warning):'' }))
      .forEach(x=>{ if(haveIds.has(x.id)){ keptN++; return; } cfg.styleCustom.added.push(x); haveIds.add(x.id); addedN++; });
    const rmSet = new Set(strArr(cfg.styleCustom.removed));
    strArr(sc.removed).filter(id=> builtinIds.includes(id)).forEach(id=> rmSet.add(id));
    cfg.styleCustom.removed = Array.from(rmSet);
    const crSet = new Set(strArr(cfg.styleCustom.comboRemoved));
    strArr(sc.comboRemoved).filter(id=> (WRITE_COMBOS||[]).some(c=> c.id === id)).forEach(id=> crSet.add(id));
    cfg.styleCustom.comboRemoved = Array.from(crSet);
    const libNowIds = new Set(writeStyleLib().map(s=> s.id));
    const haveCombo = new Set((cfg.styleCustom.customCombos||[]).map(x=> x && x.id));
    (Array.isArray(sc.customCombos) ? sc.customCombos : [])
      .filter(x=> x && x.id && x.name)
      .map(x=>({ id:String(x.id), name:String(x.name), desc:String(x.desc||''), tags:strArr(x.tags).filter(id=> libNowIds.has(id)) }))
      .forEach(x=>{ if(haveCombo.has(x.id)){ keptN++; return; } cfg.styleCustom.customCombos.push(x); haveCombo.add(x.id); addedN++; });
    saveCfg(cfg); render();
    toast(`已合并导入：新增 ${addedN} 项 · 已有保留 ${keptN} 项`);
    closeStyleLibPanel(); openStyleLibPanel();   // 重建面板，导入内容立即可见
  };
  reader.readAsText(file);
}
function closeStyleLibPanel(){ const p=$('#wsLibPanel'); if(p) p.remove(); }

function openStyleLibReader(){
  closeStyleLibReader();
  const lib = writeStyleLib();
  const CAT_LABEL = { '语言质感':'① 语言质感', '情绪与张力':'② 情绪与张力', '节奏与网感':'③ 节奏与网感', '叙事技法':'④ 叙事技法', '台词设计':'⑤ 台词设计', custom:'⭐ 我的自定义' };
  const groups = {};
  lib.forEach(s=>{
    const cat = s.cat || 'custom';
    if(!groups[cat]) groups[cat] = [];
    groups[cat].push(s);
  });
  const order = Object.keys(CAT_LABEL).filter(g=>groups[g] && groups[g].length);
  (Object.keys(groups).filter(g=>!Object.prototype.hasOwnProperty.call(CAT_LABEL,g))).forEach(g=>order.push(g));
  let html = order.map(cat=>{
    let catHtml = `<h2>${CAT_LABEL[cat] || cat}（${groups[cat].length}）</h2>`;
    catHtml += groups[cat].map(s=>`
      <div class="style-recipe">
        <h3>【${esc(s.name)}】${s.custom?'<span class="ws-custom">自定义</span>':''}</h3>
        <p><strong>指令：</strong>${esc(s.note||'')}</p>
        ${s.tips && s.tips.length ? `<p><strong>写法：</strong>${s.tips.map((t,i)=>`${i+1}. ${esc(t)}`).join('；')}</p>` : ''}
        ${s.avoid && s.avoid.length ? `<p><strong>避免：</strong>${s.avoid.map(a=>'✗ '+esc(a)).join('；')}</p>` : ''}
        ${s.check && s.check.length ? `<p><strong>自查：</strong>${s.check.map(c=>'  '+esc(c)).join('　')}</p>` : ''}
        ${s.demo ? `<p><strong>示例：</strong>「${esc(s.demo)}」</p>` : ''}
      </div>`).join('');
    return catHtml;
  }).join('');
  const ov = document.createElement('div'); ov.id='wsLibReader'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal reader-modal">
      <div class="gs-modal-head"><b>📖 写作风格配方大全</b>
        <span style="display:flex;gap:6px">
          <button class="btn small ghost" data-lib-read-copy>复制全文</button>
          <button class="gs-x" data-lib-read-close>✕</button>
        </span></div>
      <div class="cv-body"><div class="reader-body">${html}</div></div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-lib-read-close]').onclick = closeStyleLibReader;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeStyleLibReader(); });
  ov.querySelector('[data-lib-read-copy]').onclick = ()=>{
    let txt = '写作风格配方大全\n' + '='.repeat(24) + '\n\n';
    order.forEach(cat=>{
      txt += `${CAT_LABEL[cat] || cat}（${groups[cat].length}）\n${'-'.repeat(20)}\n`;
      groups[cat].forEach(s=>{
        txt += `\n【${s.name}】${s.custom?'[自定义]':''}\n`;
        if(s.note) txt += `指令：${s.note}\n`;
        if(s.tips && s.tips.length) txt += `写法：${s.tips.map((t,i)=>`${i+1}. ${t}`).join('；')}\n`;
        if(s.avoid && s.avoid.length) txt += `避免：✗ ${s.avoid.join('；✗ ')}\n`;
        if(s.check && s.check.length) txt += `自查：${s.check.map(c=>`  ${c}`).join('　')}\n`;
        if(s.demo) txt += `示例：「${s.demo}」\n`;
      });
      txt += '\n';
    });
    copyText(txt);
  };
}
function closeStyleLibReader(){ const p=$('#wsLibReader'); if(p) p.remove(); }

const FLOW_NAV = [
  ['风','[data-flow="1"]'],     // 用户写作风格：表达层最高权威
  ['基','[data-flow="2"]'],     // 章节数/全书四七十二十五拍/叙事主体：优化前置决策
  ['构','[data-flow="3"], [data-flow="2"]'],     // 原始构想 + 优化构想：AI建议层
  ['配方','.ai-recipe-card, [data-flow="4"], [data-flow="3"]', 'recipe'],     // 写作配方：把已锁定风格转成可执行规则
  ['节','[data-flow="5"], [data-flow="4"]'],     // 全书节拍成果
  ['典','[data-flow="6"], [data-flow="5"]'],     // 词典达人：建设者
  ['充','[data-flow="7"], [data-flow="6"]'],     // 词典充实：深化者
  ['校','[data-flow="8"], [data-flow="7"]'],     // 校长/学校统筹
  ['词','[data-flow="7.5"], [data-flow="8.5"], .card-theme-glossary, .gs-card'],     // 万物词典：全书共享事实数据库
  ['正','[data-flow="9"], [data-flow="8"]']      // 正文作家 · 章节创作
];
function flowNavItems(){
  return FLOW_NAV.filter(([l, sel, key])=>{
    try{
      if(l === '配方' || key === 'recipe') return !!(document && (document.querySelector('.ai-recipe-card') || document.querySelector(sel)));
      return !!(document && document.querySelector(sel));
    }catch(e){ return false; }
  });
}
function flowNavHtml(){
  const items = flowNavItems();
  return `<div class="flow-sidenav">${items.map(([l, sel, key])=>{
    const isRecipe = (l === '配方' || key === 'recipe');
    return `<button type="button" class="fsd-btn${isRecipe?' fsd-btn-recipe':''}" ${isRecipe?'data-nav-key="recipe"':''} title="跳到「${l}」">${l}</button>`;
  }).join('')}</div>`;
}
function bindFlowSideNav(){
  const old = document.querySelector('.flow-sidenav'); if(old && old.parentNode) old.parentNode.removeChild(old);
  const items = flowNavItems(); if(!items.length) return;
  const nav = document.createElement('div');
  nav.className = 'flow-sidenav';
  items.forEach(([l, sel, key])=>{
    const b = document.createElement('button');
    b.type = 'button';
    const isRecipe = (l === '配方' || key === 'recipe');
    b.className = 'fsd-btn' + (isRecipe ? ' fsd-btn-recipe' : '');
    b.dataset.navSel = sel;
    if(isRecipe) b.dataset.navKey = 'recipe';
    b.title = '跳到「'+l+'」';
    b.textContent = l;
    b.onclick = ()=>{
      let el = null;
      if(isRecipe){
        el = document.querySelector('.ai-recipe-card') || document.querySelector('[data-ai-recipe-fold]') || document.querySelector(sel);
      } else {
        el = document.querySelector(sel);
      }
      if(el){
        if(isRecipe){
          const card = el.closest ? (el.closest('.ai-recipe-card') || el) : el;
          if(card && card.classList && card.classList.contains('collapsed')){
            card.classList.remove('collapsed');
            const ico = card.querySelector('.sc-fold-ico');
            if(ico) ico.textContent = '▾';
            const cfg = getCfg();
            cfg.aiRecipeCollapsed = false;
            saveCfg(cfg);
          }
          try{
            el.scrollIntoView({ behavior:'smooth', block:'center', inline:'nearest' });
          }catch(e){
            el.scrollIntoView(true);
          }
        } else if(l === '正'){
          const targetCard = el.querySelector('#chaptersWrap') || el.querySelector('.ch-card') || el.querySelector('.card') || el;
          try{
            targetCard.scrollIntoView({ behavior:'smooth', block:'center', inline:'nearest' });
          }catch(e){
            targetCard.scrollIntoView(true);
          }
          targetCard.classList.add('gs-flash');
          setTimeout(()=> targetCard.classList.remove('gs-flash'), 1600);
          return;
        } else {
          el.scrollIntoView({ behavior:'smooth', block:'start' });
        }
        el.classList.add('gs-flash');
        setTimeout(()=> el.classList.remove('gs-flash'), 1600);
      }
    };
    nav.appendChild(b);
  });
  ((document.getElementById('view') ? document.getElementById('view').parentElement : document.body) || document.body).appendChild(nav);
}
function flowPlaceholderSec(n, name, note, icon, desc){
  return `<section class="flow-sec" data-flow="${n}">
    <div class="flow-sec-head"><span class="fs-no">${n}</span><span class="fs-name">${name}</span><span class="fs-note">${note}</span></div>
    <div class="dict-master-placeholder">${icon} ${desc}</div>
  </section>`;
}
function openFactCardModal(){ openNeModal('事实与一致性看板', factCardHtml() || '<div class="empty">暂无事实与一致性数据。</div>'); }
function openRollingSummaryModal(){ openNeModal('滚动摘要', rollingSummaryCardHtml() || '<div class="empty">暂无滚动摘要。</div>'); }

function consistencyReportHtml(){
  const o = state.outline; const g = (o && o.glossary) || {};
  const totalN = (o && Array.isArray(o.chapters)) ? o.chapters.length : 0;
  const rows = [];
  const dupGroups = [];
  ['characters','places','propernouns'].forEach(k=>{
    const byName = {};
    (g[k]||[]).forEach(x=>{ const n=String(x&&x.name||'').trim(); if(!n) return; (byName[n]=byName[n]||[]).push(x); });
    Object.keys(byName).forEach(n=>{ if(byName[n].length>1) dupGroups.push({cat:k, name:n, count:byName[n].length, list:byName[n]}); });
  });
  if(dupGroups.length){
    rows.push(`<div class="chk-item bad">✗ 词典存在同名重复（${dupGroups.length} 组）</div>`);
    dupGroups.forEach(d=>{
      const src = d.list.map(x=> x._dictmaster?'词典达人' : (x._auto?'逐章提取':'手工')).join('、');
      rows.push(`<div class="chk-sub">【${d.cat==='characters'?'人物':(d.cat==='places'?'地名':'专名')}】「${esc(d.name)}」×${d.count}（来源：${esc(src)}），应仅保留高优先级一份。</div>`);
    });
  } else {
    rows.push(`<div class="chk-item ok">✓ 词典无同名重复（人物 ${(g.characters||[]).length} · 地名 ${(g.places||[]).length} · 专名 ${(g.propernouns||[]).length}）</div>`);
  }
  const noBeat = [];
  for(let i=0;i<totalN;i++){
    const p = (Array.isArray(o.chapterPlans) && o.chapterPlans[i]) || null;
    if(!String(p && p.beatsText || '').trim()) noBeat.push(i+1);
  }
  if(noBeat.length) rows.push(`<div class="chk-item bad">✗ 章节拍悬空：第 ${noBeat.join('、')} 章节拍表为空（缺节拍）</div>`);
  else if(totalN) rows.push(`<div class="chk-item ok">✓ 全部 ${totalN} 章均有节拍表，无悬空</div>`);
  const tl = (o && o._globalTimeline) || null;
  const tlText = tl && String(tl.text||'').trim();
  if(!tl || (!tlText && !Array.isArray(tl.chapters))){
    rows.push(`<div class="chk-item warn">△ 全局时间线未生成（可为规划师③步后补），时间锚悬空无法校验</div>`);
  } else if(tlText){
    rows.push(`<div class="chk-item ok">✓ 全局时间线已生成（纯文本，每章时点已内联，正文据此承接）</div>`);
  } else {
    const anchors = tl.chapters;
    const covered = new Set(anchors.map(a=>a&&a.index).filter(n=>Number.isFinite(n)));
    const missCh = [];
    for(let i=0;i<totalN;i++){ if(!covered.has(i)) missCh.push(i+1); }
    const mono = [];
    const sorted = anchors.slice().sort((a,b)=>(a.index-b.index));
    for(let k=1;k<sorted.length;k++){
      const prevT = sorted[k-1].to, curT = sorted[k].from;   // 上一章结尾 vs 本章开头
      if(!prevT || !curT) continue;
      const a = normTimeW(prevT), b = normTimeW(curT);
      if(a!=null && b!=null && b < a) mono.push(`第${sorted[k-1].index+1}章末「${esc(prevT)}」→ 第${sorted[k].index+1}章初「${esc(curT)}」`);
    }
    if(mono.length) rows.push(`<div class="chk-item bad">✗ 时间锚疑似回退（${mono.length} 处）：${mono.slice(0,3).join('；')}${mono.length>3?'…':''}</div>`);
    else rows.push(`<div class="chk-item ok">✓ 时间锚未发现明显回退</div>`);
    if(missCh.length) rows.push(`<div class="chk-item warn">△ 全局时间表未覆盖章节：第 ${missCh.join('、')} 章（可点规划师③步重排补落位）</div>`);
    else if(totalN) rows.push(`<div class="chk-item ok">✓ 全局时间表每章均有落点（${anchors.length} 锚 / ${totalN} 章）</div>`);
  }
  if(!totalN) rows.push(`<div class="chk-item warn">△ 尚无章节，无法做节拍/时间线自检</div>`);
  const timeAudit = (o && o._timeAudit) || {};
  const timeWarn = Object.values(timeAudit).filter(x=>x&&x.status==='warn');
  if(timeWarn.length){
    const sample = timeWarn.slice(0,3).map(x=>`第${Number(x.chapter)+1}章时间开场${x.openerCount}次`).join('；');
    rows.push(`<div class="chk-item warn">△ 时间文学表现需复核（${timeWarn.length}章）：${esc(sample)}。时间合同仍以规划时间线为准。</div>`);
  } else if(totalN && Object.keys(timeAudit).length){
    rows.push(`<div class="chk-item ok">✓ 已完成正文时间表现审计：未发现明显的时间开场模板化/重复问题</div>`);
  }
  const hasDup = dupGroups.length>0, hasBeat = noBeat.length>0, hasMono = /✗ 时间锚/.test(rows.join(''));
  rows.push(`<div class="chk-summary">累计：${hasDup||hasBeat||hasMono ? '发现问题，请按提示修正后重跑。' : '各项通过 ✓'}</div>`);
  return `<div class="chk-wrap">${rows.join('')}</div>`;
}
function normTimeW(t){
  const s = String(t||'').trim(); if(!s) return null;
  if(/^[\d.]+$/.test(s)){ const f=parseFloat(s); return Number.isFinite(f)?f:null; }
  const digits = s.replace(/[^0-9]+/g,''); if(digits.length){ const n=+digits; return Number.isFinite(n)?n:null; }
  return null;
}
function openConsistencyCheck(){ openNeModal('一致性自检（阶段4）', consistencyReportHtml() || '<div class="empty">暂无数据。</div>'); }

function safeCard(fn, fb){
  try{ return fn(); }catch(e){ console.error('[safeCard]', e); return fb || ''; }
}

function ensureLongMemory(){
  state.longMemory = state.longMemory || {uiOpen:false, foreshadow:[], lastAuditAt:0};
  if(!Array.isArray(state.longMemory.foreshadow)) state.longMemory.foreshadow=[];
  return state.longMemory;
}
function writtenChapterCount(){
  return (state.chapters||[]).filter(c=>c && String(c.content||'').trim()).length;
}
function currentWrittenIndex(){
  for(let i=(state.chapters||[]).length-1;i>=0;i--) if(state.chapters[i] && String(state.chapters[i].content||'').trim()) return i;
  return -1;
}
function extractPlanField(plan, names){
  const t=String(plan&&plan.beatsText||'');
  for(const n of names){
    const re=new RegExp('(?:^|\\n)\\s*'+n+'[：:]\\s*([^\\n]+)','m');
    const m=t.match(re); if(m) return m[1].trim();
  }
  return '';
}
function refreshForeshadowBank(){
  const mem=ensureLongMemory(), o=state.outline||{};
  const plans=Array.isArray(o.chapterPlans)?o.chapterPlans:[];
  const next=[];
  plans.forEach((p,i)=>{
    const f=extractPlanField(p,['埋设伏笔','伏笔','埋伏笔']);
    if(!f || /^(无|暂无|无。|没有)$/i.test(f.trim())) return;
    const later=(state.chapters||[]).slice(i+1).map(c=>String(c&&c.content||'')).join('\n');
    const key=f.replace(/[「」“”【】（）()]/g,'').split(/[，,；;。]/)[0].trim().slice(0,18);
    const recovered=key && later.includes(key);
    next.push({id:`${i+1}-${key}`, chapter:i+1, text:f.slice(0,180), status:recovered?'suspected-recovered':'open'});
  });
  mem.foreshadow=next.slice(-120);
  mem.lastAuditAt=Date.now();
  return mem.foreshadow;
}
function longNovelMemoryData(){
  const o=state.outline||{}, g=o.glossary||{}, idx=currentWrittenIndex();
  const dig=Array.isArray(o._chapterDigests)?o._chapterDigests:[];
  const fc=o._factCard||{};
  const plan=idx>=0 && Array.isArray(o.chapterPlans)?o.chapterPlans[idx]:null;
  const prev=idx>=0?state.chapters[idx]:null;
  const time=(fc.timeAnchors||[]).find(x=>x && x.ch===idx);
  const mem=ensureLongMemory();
  if(!mem.foreshadow.length && plansExist(o)) refreshForeshadowBank();
  return {o,g,idx,digest:idx>=0?(dig[idx]&&dig[idx].text||''):'',fc,plan,prev,time,foreshadow:mem.foreshadow};
}
function plansExist(o){ return !!(o && Array.isArray(o.chapterPlans) && o.chapterPlans.some(Boolean)); }
function longMemoryBrief(i){
  if(!isLong() || !state.outline) return '';
  const d=longNovelMemoryData();
  const lines=[];
  if(d.idx>=0){
    lines.push(`【小说当前状态账本｜截至第 ${d.idx+1} 章】`);
    if(d.prev && d.prev.title) lines.push(`- 最近完成章节：第 ${d.idx+1} 章《${String(d.prev.title).trim()}》`);
    if(d.fc.lastScene) lines.push(`- 最后定格场景：${String(d.fc.lastScene).slice(0,140)}`);
    if(d.time) lines.push(`- 最近时间锚：${String(d.time.time||d.time.to||d.time.from||'').slice(0,80)}`);
    if(d.digest) lines.push(`- 最近剧情事实：${String(d.digest).slice(0,360)}`);
  }
  const open=(d.foreshadow||[]).filter(x=>x.status==='open').slice(-8);
  if(open.length) lines.push(`【伏笔银行｜未确认回收】\n${open.map(x=>`- 第${x.chapter}章埋设：${x.text}`).join('\n')}`);
  if(d.plan){
    const causal=extractPlanField(d.plan,['事件因果施工','因果施工']);
    const conn=extractPlanField(d.plan,['连续性','承接']);
    if(conn) lines.push(`【当前章节承接锚】${conn.slice(0,220)}`);
    if(causal) lines.push(`【当前章节因果施工】${causal.slice(0,260)}`);
  }
  return lines.join('\n');
}
function longMemoryPromptBlock(i){
  const b=longMemoryBrief(i);
  if(!b) return '';
  return `\n\n${b}\n【长篇记忆执行令】以上内容是从已落地正文/教案/词典派生的记忆层，不是新剧情指令。不得用记忆层制造新事实；必须从既有状态继续，重大事件仍需通过教案与因果闭环抵达。`;
}
function causalityMapHtml(){
  const o=state.outline||{}; const plans=Array.isArray(o.chapterPlans)?o.chapterPlans:[]; const written=writtenChapterCount();
  const rows=[];
  plans.slice(0, Math.min(plans.length, written+4)).forEach((p,i)=>{
    const b=extractPlanField(p,['承接点','承接']); const a=extractPlanField(p,['逐拍推进','场景链与切换','场景链']); const z=extractPlanField(p,['收束设计','收束']);
    if(b||a||z) rows.push(`<div class="lm-causal-row"><span>第${i+1}章</span><div><b>${esc(b||'承接既有状态')}</b><span>→ ${esc(a||'推进本章教案事件')}</span><span>→ ${esc(z||'形成下一章接口')}</span></div></div>`);
  });
  return rows.length?rows.join(''):'<div class="muted">尚无足够章节教案可形成因果地图。</div>';
}
function relationshipTrajectoryHtml(){
  const g=(state.outline&&state.outline.glossary)||{}, rel=Array.isArray(g._relationshipTable)?g._relationshipTable:[];
  if(!rel.length) return '<div class="muted">词典尚无关系表；词典达人产出后这里会自动显示。</div>';
  return `<div class="lm-rel-grid">${rel.slice(0,24).map(x=>`<div class="lm-rel"><b>${esc(x.a||'?')}</b><span>↔ ${esc(x.relation||'关系')} ↔</span><b>${esc(x.b||'?')}</b>${x.note?`<small>${esc(x.note)}</small>`:''}</div>`).join('')}</div>`;
}
function seamAuditHtml(){
  const written=writtenChapterCount(); if(written<2) return '<div class="muted">至少完成 2 章后才能进行章间接缝检查。</div>';
  const rows=[]; const o=state.outline||{};
  for(let i=Math.max(1,written-5);i<written;i++){
    const prev=state.chapters[i-1], cur=state.chapters[i];
    const tail=String(prev&&prev.content||'').trim().slice(-120); const plan=Array.isArray(o.chapterPlans)?o.chapterPlans[i]:null;
    const conn=extractPlanField(plan,['承接点','承接','连续性']);
    const ok=!!tail && !!conn;
    rows.push(`<div class="lm-seam-row"><b>第${i}→第${i+1}章</b><span class="pill ${ok?'tag-ok':'tag-warn'}">${ok?'✓ 有物理接缝':'△ 需要检查'}</span><small>${esc(conn||'教案未提供明确承接点')}</small></div>`);
  }
  return rows.join('');
}
function longNovelHealthHtml(){
  const o=state.outline||{}, total=(o.chapters||[]).length||chapterCountVal()||0, written=writtenChapterCount();
  const plans=Array.isArray(o.chapterPlans)?o.chapterPlans:[];
  const noPlan=Math.max(0,total-plans.filter(Boolean).length), noDigest=Math.max(0,written-(Array.isArray(o._chapterDigests)?o._chapterDigests.filter(Boolean).length:0));
  const fo=refreshForeshadowBank(); const open=fo.filter(x=>x.status==='open').length;
  const scores={连续性:Math.max(55,100-Math.min(35,noDigest*4)),因果:Math.max(55,100-Math.min(35,noPlan*3)),伏笔:open?Math.max(60,96-Math.min(30,open*2)):96,记忆:written?Math.max(65,100-Math.min(30,noDigest*5)):60};
  return `<div class="lm-health-grid">${Object.entries(scores).map(([k,v])=>`<div class="lm-score"><b>${k}</b><strong>${v}</strong><span>/100</span></div>`).join('')}</div><div class="lm-health-notes"><span>已写 ${written}/${total||'?'} 章</span><span>缺教案 ${noPlan}</span><span>缺细摘要 ${noDigest}</span><span>未确认回收伏笔 ${open}</span></div>`;
}
function getDeckStepStatus(){
  const o = state.outline;
  const chs = (o && Array.isArray(o.chapters)) ? o.chapters : [];
  const total = chs.length || chapterCountVal() || 0;
  const written = writtenChapterCount();
  const groups = schoolStageGroups();

  const s1_done = !!(state.chapterStyle && state.chapterStyle.tags && state.chapterStyle.tags.length);
  const s2_done = !!(state.polishAdopted || (state.idea && state.idea.trim()));
  const s3_done = !!(state.outlineConfirmed && o && chs.length > 0);
  const s4_done = !!(scDone('dictMaster') || state.dictmasterRan || (o && o.glossary && ((o.glossary.characters||[]).length > 0)));
  const s5_done = scDone('principal');
  const s6_done = (groups.length > 0 && groups.every((g,i)=>scDone('t'+i)));
  const s7_done = (total > 0 && written >= total);

  const steps = [
    { key:'style', name:'风格', done:s1_done, target:'[data-flow="1"]', desc: s1_done ? '已选定小说文风倾向' : '待设定小说文风' },
    { key:'idea',  name:'构想', done:s2_done, target:'[data-flow="2"]', desc: s2_done ? '核心故事构想已就绪' : '待输入核心构想' },
    { key:'outline',name:'大纲', done:s3_done, target: (o ? '[data-flow="2"]' : '#btnGenOutline'), desc: s3_done ? `已定稿 ${chs.length} 章分卷大纲` : '待生成全书大纲' },
    { key:'dict',  name:'词典', done:s4_done, target:'.card-theme-dictmaster', desc: s4_done ? '万物词典人物/地名已架构' : '待词典达人建立万物词典' },
    { key:'principal',name:'校长', done:s5_done, target:'.school-card', desc: s5_done ? '校长统筹守则与标题已定稿' : '待校长统筹全局' },
    { key:'teacher',name:'老师', done:s6_done, target:'.school-teachers', desc: s6_done ? (groups.length > 1 ? `${groups.length} 位老师分段教案就绪` : '老师教案就绪') : '待老师备课分段教案' },
    { key:'chapter',name:'正文', done:s7_done, target:'.chapter-card', desc: written ? `正文已落地 ${written}/${total||'?'} 章` : '待生成第 1 章正文' }
  ];

  let foundActive = false;
  steps.forEach(st => {
    if(!st.done && !foundActive){
      st.active = true;
      foundActive = true;
    } else {
      st.active = false;
    }
  });
  return steps;
}

function openCreationProgressModal(){
  const o = state.outline;
  const chs = (o && Array.isArray(o.chapters)) ? o.chapters : [];
  const total = chs.length || chapterCountVal() || 0;
  const written = writtenChapterCount();
  const pct = total ? Math.round(written/total*100) : 0;
  const steps = getDeckStepStatus();

  let totalChars = 0;
  const chRows = [];
  for(let i=0; i<total; i++){
    const ch = chs[i] || {};
    const title = String(ch.title || (state.school && state.school.principal && state.school.principal.titles && state.school.principal.titles[i]) || `第 ${i+1} 章`).trim();
    const body = String(ch.body || ch.content || '').trim();
    const len = body.length;
    if(len > 0) totalChars += len;
    const hasPlan = Array.isArray(o.chapterPlans) && !!o.chapterPlans[i];
    chRows.push({
      idx: i + 1,
      title,
      len,
      done: len > 0,
      hasPlan
    });
  }

  const g = (o && o.glossary) || {};
  const charCount = (g.characters||[]).length;
  const placeCount = (g.places||[]).length;
  const propCount = (g.propernouns||[]).length;
  const ruleCount = (g.rules||[]).length;

  const fo = refreshForeshadowBank();
  const foOpen = fo.filter(x=>x.status==='open').length;
  const foDone = fo.filter(x=>x.status==='done'||x.status==='resolved').length;

  const bodyHtml = `
    <div class="cp-modal-view">
      <!-- 汇总大卡片 -->
      <div class="cp-summary-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px">
        <div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px 12px">
          <div style="font-size:11px;color:var(--dim)">章节落地率</div>
          <div style="font-size:20px;font-weight:700;color:var(--pri);margin-top:2px">${written} / ${total||'?'} <span style="font-size:12px;font-weight:400;color:var(--sub)">(${pct}%)</span></div>
          <div style="height:4px;background:var(--line);border-radius:2px;margin-top:6px;overflow:hidden">
            <div style="height:100%;background:var(--pri);width:${pct}%"></div>
          </div>
        </div>
        <div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px 12px">
          <div style="font-size:11px;color:var(--dim)">正文总字数</div>
          <div style="font-size:20px;font-weight:700;color:var(--txt);margin-top:2px">${totalChars.toLocaleString()} <span style="font-size:12px;font-weight:400;color:var(--sub)">字</span></div>
          <div style="font-size:11px;color:var(--dim);margin-top:6px">${written ? `均章 ${Math.round(totalChars/written)} 字` : '首章待生成'}</div>
        </div>
        <div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px 12px">
          <div style="font-size:11px;color:var(--dim)">万物词典资产</div>
          <div style="font-size:18px;font-weight:700;color:var(--txt);margin-top:2px">${charCount} 人物 · ${placeCount} 地名</div>
          <div style="font-size:11px;color:var(--dim);margin-top:6px">${propCount} 专名 · ${ruleCount} 规则</div>
        </div>
        <div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px 12px">
          <div style="font-size:11px;color:var(--dim)">伏笔与因果</div>
          <div style="font-size:18px;font-weight:700;color:var(--txt);margin-top:2px">${foOpen} <span style="font-size:12px;font-weight:400;color:var(--sub)">待回收</span></div>
          <div style="font-size:11px;color:var(--dim);margin-top:6px">${foDone} 条已确认回收</div>
        </div>
      </div>

      <!-- 7 大创作工序全景健康体检 -->
      <div style="margin-bottom:14px">
        <div style="font-weight:600;font-size:13px;margin-bottom:8px;display:flex;align-items:center;gap:6px">
          <span>🎯 长篇创作工序全景状态</span>
          <span style="font-size:11px;color:var(--dim);font-weight:400">（点击工序可直接跳转到对应卡片）</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${steps.map(st=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--panel2);border:1px solid var(--line);border-radius:6px;gap:8px">
              <div style="display:flex;align-items:center;gap:8px">
                <span class="pill ${st.done ? 'tag-ok' : (st.active ? 'tag-warn' : '')}" style="font-size:11px;padding:2px 6px">
                  ${st.done ? '✓ 已就绪' : (st.active ? '⏳ 进行中' : '⚪ 待推进')}
                </span>
                <b style="font-size:13px">${esc(st.name)}</b>
                <span style="font-size:12px;color:var(--sub)">${esc(st.desc)}</span>
              </div>
              <button type="button" class="btn small ghost" data-modal-jump="${st.target}" style="padding:2px 8px;font-size:11px">定位</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 逐章落地进度明细表 -->
      ${chRows.length ? `
        <div>
          <div style="font-weight:600;font-size:13px;margin-bottom:8px">📖 逐章落地明细表（共 ${chRows.length} 章）</div>
          <div style="max-height:240px;overflow-y:auto;border:1px solid var(--line);border-radius:6px">
            <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left">
              <thead>
                <tr style="background:var(--panel2);border-bottom:1px solid var(--line);color:var(--dim)">
                  <th style="padding:6px 10px;width:60px">章号</th>
                  <th style="padding:6px 10px">标题</th>
                  <th style="padding:6px 10px;width:90px">正文字数</th>
                  <th style="padding:6px 10px;width:90px">状态</th>
                </tr>
              </thead>
              <tbody>
                ${chRows.map(r=>`
                  <tr style="border-bottom:1px solid var(--line)">
                    <td style="padding:6px 10px;font-weight:600">第 ${r.idx} 章</td>
                    <td style="padding:6px 10px">${esc(r.title)}</td>
                    <td style="padding:6px 10px;color:${r.done?'var(--pri)':'var(--dim)'}">${r.done ? `${r.len.toLocaleString()} 字` : '—'}</td>
                    <td style="padding:6px 10px">
                      <span class="pill ${r.done ? 'tag-ok' : (r.hasPlan ? 'tag-warn' : '')}" style="font-size:10px;padding:1px 5px">
                        ${r.done ? '✓ 正文就绪' : (r.hasPlan ? '教案已备' : '待推进')}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  const actsHtml = `
    <button type="button" class="btn ghost small" data-modal-open-repo>🧠 展开长篇体检仓</button>
    <button type="button" class="btn primary small" data-modal-close>关闭</button>
  `;

  openNeModal('📊 长篇创作全景进度与健康体检', bodyHtml, actsHtml);

  // 绑定弹窗内事件
  const m = $('#neModal');
  if(m){
    m.querySelectorAll('[data-modal-jump]').forEach(b=>{
      b.onclick = ()=>{
        const target = document.querySelector(b.dataset.modalJump);
        closeNeModal();
        if(target){
          setTimeout(()=>{
            target.scrollIntoView({ behavior:'smooth', block:'center' });
            target.classList.add('gs-flash');
            setTimeout(()=> target.classList.remove('gs-flash'), 1600);
          }, 150);
        }
      };
    });
    const repoBtn = m.querySelector('[data-modal-open-repo]');
    if(repoBtn){
      repoBtn.onclick = ()=>{
        closeNeModal();
        const d = document.querySelector('.long-memory-repo details');
        if(d){
          d.open = true;
          ensureLongMemory().uiOpen = true;
          persist();
          setTimeout(()=> d.scrollIntoView({ behavior:'smooth', block:'start' }), 150);
        }
      };
    }
    const closeBtn = m.querySelector('[data-modal-close]');
    if(closeBtn) closeBtn.onclick = ()=> closeNeModal();
  }
}

function longNovelControlDeckHtml(){
  if(!isLong()) return '';
  const d=longNovelMemoryData(); const total=(state.outline&&state.outline.chapters||[]).length||chapterCountVal()||0, written=writtenChapterCount();
  const current=written?written:0; const pct=total?Math.round(written/total*100):0;
  const steps = getDeckStepStatus();
  const stepsHtml = steps.map(st=>{
    const cls = st.done ? 'done' : (st.active ? 'active' : '');
    return `<span class="${cls}" data-deck-jump="${st.target}" title="点击定位到「${st.name}」环节" style="cursor:pointer">${esc(st.name)}</span>`;
  }).join('<b>→</b>');

  return `<section class="novel-control-deck" data-novel-deck>
    <div class="ncd-head">
      <div>
        <span class="ncd-kicker">🎬 LONGFORM CONTROL DESK</span>
        <h2>长篇导演台</h2>
        <p>只显示“现在最重要的状态与动作”；详细资料收进下方资料仓。</p>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <button type="button" class="btn small ghost ncd-view-progress" data-ncd-progress title="点击打开长篇全景创作进度与健康体检">📊 创作进度查看</button>
        <div class="ncd-progress" data-ncd-progress style="cursor:pointer" title="点击查看创作全景进度">
          <b>${current}/${total||'?'}</b>
          <span>章节落地 · ${pct}%</span>
          <i><em style="width:${pct}%"></em></i>
        </div>
      </div>
    </div>
    <div class="ncd-steps">${stepsHtml}</div>
    <div class="ncd-grid">
      <div class="ncd-card"><small>当前小说状态</small><b>${written?`第 ${written} 章已落地`:'尚未落地正文'}</b><span>${esc(d.fc.lastScene||'等待第一章形成真实世界状态')}</span></div>
      <div class="ncd-card"><small>下一关键动作</small><b>${written<total?'继续生成下一章':'检查全书收束'}</b><span>${written<total?'正文将从上一章真实状态继续，不另起炉灶。':'全书已达到计划章节数，可进入体检与收束检查。'}</span></div>
      <div class="ncd-card" data-ncd-progress style="cursor:pointer"><small>长篇健康</small><b>${written?'记忆链已启用':'等待首章'}</b><span>状态账本 · 因果地图 · 伏笔银行 · 章间接缝</span></div>
    </div>
  </section>`;
}
function longNovelMemoryRepoHtml(){
  if(!isLong() || !state.outline) return '';
  return `<section class="flow-repo long-memory-repo" data-repo="novel-memory"><details class="repo-drawer" ${ensureLongMemory().uiOpen?'open':''}><summary><span class="repo-ic">🧠</span><b>长篇记忆与体检仓</b><span class="repo-note">状态、因果、伏笔、人物关系、章间接缝集中管理</span><span class="repo-open">展开检查 ▸</span></summary><div class="repo-body">
    <div class="lm-section"><div class="lm-title">🧭 小说状态账本</div><div class="lm-state"><div><b>当前章</b><span>${writtenChapterCount()?`第${writtenChapterCount()}章`:'—'}</span></div><div><b>最后定格</b><span>${esc((state.outline._factCard&&state.outline._factCard.lastScene)||'—')}</span></div><div><b>章节数</b><span>${(state.outline.chapters||[]).length||chapterCountVal()||'—'}</span></div></div></div>
    <div class="lm-section"><div class="lm-title">🕸️ 因果地图</div><div class="lm-causal">${causalityMapHtml()}</div></div>
    <div class="lm-section"><div class="lm-title">🏦 伏笔银行</div><div class="lm-foreshadow">${refreshForeshadowBank().slice(-12).reverse().map(x=>`<div><span class="pill ${x.status==='open'?'tag-warn':'tag-ok'}">${x.status==='open'?'待回收':'疑似回收'}</span><b>第${x.chapter}章</b><span>${esc(x.text)}</span></div>`).join('')||'<span class="muted">暂无可识别伏笔；教案中的“埋设伏笔”会自动进入这里。</span>'}</div></div>
    <div class="lm-section"><div class="lm-title">👥 人物关系状态</div>${relationshipTrajectoryHtml()}</div>
    <div class="lm-section"><div class="lm-title">🪡 章间接缝</div><div class="lm-seams">${seamAuditHtml()}</div></div>
    <div class="lm-section"><div class="lm-title">📊 小说体检</div>${longNovelHealthHtml()}</div>
  </div></details></section>`;
}
function bindLongNovelMemoryRepo(){
  const d=document.querySelector('.long-memory-repo details'); if(!d) return;
  d.addEventListener('toggle',()=>{ ensureLongMemory().uiOpen=d.open; persist(); });
}
function bindLongNovelControlDeck(){
  $$('[data-ncd-progress]').forEach(btn=>{
    btn.onclick = ()=> openCreationProgressModal();
  });
  $$('[data-deck-jump]').forEach(el=>{
    el.onclick = ()=>{
      const sel = el.dataset.deckJump;
      if(!sel) return;
      const target = document.querySelector(sel);
      if(target){
        target.scrollIntoView({ behavior:'smooth', block:'center' });
        target.classList.add('gs-flash');
        setTimeout(()=> target.classList.remove('gs-flash'), 1600);
      }
    };
  });
}

function viewStory(){
  if(!state.outline){
    const homeSub = isLong()
      ? `用几句话描述你的长篇构想（世界观、主角、核心冲突都行）。AI 会按你设定的章节数与全书拍子扩写成大纲，之后按「生成章节」逐步写完。`
      : '用几句话描述你的点子（世界观、主角、核心冲突都行）。AI 会扩写成完整故事大纲与章节。';
    const opt_card = `
        <div class="card card-theme-idea">
          <div class="card-head-bar">
            <div class="ch-left">
              <span class="ch-badge ch-badge-idea">💡</span>
              <h3 class="ch-title">用户构想与动态战略优化</h3>
              <span class="ch-subtag ch-subtag-idea">${(state.polishOptions&&state.polishOptions.length)?'✨ 构想已优化':'待优化'}</span>
            </div>
            <div class="ch-right">
              <label class="pol-multi" title="生成多方向构想供比选"><input type="checkbox" id="chkPolishMulti"> 多方案</label>
            </div>
          </div>
          <div class="idea-row">
            <textarea id="ideaInput" placeholder="描述你的故事点子（世界观、主角、核心冲突等）…">${esc(state.idea)}</textarea>
          </div>
          <div class="btn-row">
            <button id="btnPolishIdea" class="btn ghost ${polishIdle()?'first':''}">✨ 优化构想</button>
          </div>
          <div id="polishBox" class="pol-box" style="display:${state.polishCollapsed?'none':'block'}">
            <div class="pol-head"><b>✨ 方案比选</b>
              <span class="pol-tools">
                <button id="btnPolishDiscard" class="btn small ghost">✕ 收起</button>
              </span>
            </div>
            <div id="polishCards" class="pol-cards"></div>
          </div>
          ${ (state.polishCollapsed && Array.isArray(state.polishOptions) && state.polishOptions.length) ? `<div class="pol-keep pol-keep-collapsed"><span class="pol-keep-t">✓ 已采用：${esc(state.polishAdopted || (state.polishMode==='multi' ? '尚未选择方案' : state.polishOptions[0].name || '方案1'))} · 优化方案已收起</span><span class="pol-keep-btns"><button type="button" class="btn small ghost" data-pol-keep-view>🔍 展开/更换方案</button></span></div>` : '' }
          ${ polishKeepBar() }
          <div class="btn-row">
            <button id="btnGenOutline" class="btn primary block" ${(!currentCanonicalStoryStrategy())?'disabled title="请先采用一个动态战略方案再生成大纲"':''}>${(!currentCanonicalStoryStrategy())?'📋 待采用动态战略后生成':(isLong()?'📚 生成大纲':'✨ 生成故事大纲')}</button>
          </div>
          <p id="outlineStatus" class="status"></p>
        </div>`;
    return CYBER_HOME_GRID + `${isLong()?longNovelControlDeckHtml():''}
    <div class="flow-wrap">
            <section class="flow-sec" data-flow="1">
        <div class="flow-sec-head"><span class="fs-no">1</span><span class="fs-name">写作风格</span><span class="fs-note">用户先定表达方式 · 全书共享 · 表达层最高权威</span></div>
        <div class="flow-style-lock-note" style="margin:0 0 10px;padding:9px 12px;border:1px solid var(--line,#ddd);border-radius:10px;background:var(--card,#fff);font-size:12px;line-height:1.7">
          🔒 <b>表达层最高权威</b>：这里确定「怎么写」。后续优化构想只能提供创意建议，不得偷偷改写你已经选定的写作风格。
        </div>
        ${ safeCard(()=>writeStyleCard()) }
      </section>
<section class="flow-sec flow-action-sec" data-flow="2">
  <div class="flow-sec-head"><span class="fs-no">2</span><span class="fs-name">创作基础</span><span class="fs-note">先确定章节数与全书宏观拍子，再交给优化构想</span></div>
  <div class="card card-theme-idea decision-base-card">
    <div class="card-head-bar">
      <div class="ch-left"><span class="ch-badge ch-badge-beat">🧭</span><h3 class="ch-title">故事基础设置</h3><span class="ch-subtag ch-subtag-beat">优化构想读取这里的选择</span></div>
      <div class="ch-right"><span class="muted" style="font-size:12px">先定骨架</span></div>
    </div>
    ${isLong() ? `
    <div class="tw-panel" style="margin-bottom:10px">
      <div class="poly-head"><span class="poly-ic">📐</span><b>全书章节数</b><span class="poly-rule">必填 · 1-200 整数</span></div>
      <div class="tw-row">
        <input type="number" id="chapterCountIn" class="tw-in cc-in" min="1" max="200" step="1" inputmode="numeric" placeholder="如 30" value="${chapterCountVal()||''}" />
        <span class="tw-unit">章</span>
        ${chapterCountVal()?`<span class="pill tag-ok">${chapterCountHint()}</span>`:''}
      </div>
    </div>
    ${bookBeatHtml()}
    ${openingStrategyHtml()}
    ` : ''}
    <h4 style="margin:18px 0 6px">叙事视角</h4>
    <div class="team-pick" id="teamPick">
      ${TEAM_OPTIONS.map(o=>`
      <label class="team-item ${o.id===currentTeamShape().id?'sel':''}" data-team="${o.id}" title="${esc(o.desc)}">
        <span class="team-ic">${o.id==='solo'?'👤':o.id==='dual'?'👫':o.id==='trio'?'🤝':o.id==='quad'?'👥':'🧑‍🤝‍🧑'}</span>
        <span class="team-txt"><b>${esc(o.label)}</b><i>${esc(o.desc)}</i></span>
        <input type="radio" name="teamShape" value="${o.id}" style="display:none" ${o.id===currentTeamShape().id?'checked':''}>
      </label>`).join('')}
    </div>
  </div>
</section>
<section class="flow-sec flow-action-sec" data-flow="3">
  <div class="flow-sec-head"><span class="fs-no">3</span><span class="fs-name">故事构想与优化</span><span class="fs-note">AI 只在已确定的表达与全书骨架上优化故事</span></div>
  ${bookBeatBriefHtml()}
  ${opt_card}
</section>
<section class="flow-sec" data-flow="4">
        <div class="flow-sec-head"><span class="fs-no">4</span><span class="fs-name">写作配方</span><span class="fs-note">把已锁定风格翻译成可执行规则 · 全书共享</span></div>
        ${ safeCard(()=>aiRecipeCard()) }
        
      </section>
<section class="flow-sec" data-flow="5">
        <div class="flow-sec-head"><span class="fs-no">5</span><span class="fs-name">全书节拍</span><span class="fs-note">按全书主线节奏划分剧情阶段（本地映射）</span></div>
        ${ safeCard(()=> isLong() ? beatStructureCardHtml() : '') }
      </section>
<section class="flow-sec flow-info-sec" data-flow="6">
        <div class="flow-sec-head"><span class="fs-no">6</span><span class="fs-name">词典达人</span><span class="fs-note">全局设定架构师 · 人物/法宝/地理/规则硬设定</span></div>
        ${ safeCard(()=>dictMasterBlockHtml()) }
      </section>
<section class="flow-sec flow-info-sec" data-flow="7">
        <div class="flow-sec-head"><span class="fs-no">7</span><span class="fs-name">词典充实</span><span class="fs-note">设定细化工坊 · 感官特征 · 场景禁忌 · 氛围龙套</span></div>
        ${ safeCard(()=>dictEnrichBlockHtml()) }
      </section>
<section class="flow-sec flow-action-sec" data-flow="8">
        <div class="flow-sec-head"><span class="fs-no">8</span><span class="fs-name">学校统筹</span><span class="fs-note">章节微拍 → 校长全局总控 → 老师分段备课</span></div>
        ${ safeCard(()=>microBeatBlock()) }
        ${ safeCard(()=>schoolZoneBlock()) }
      </section>
<section class="flow-sec flow-info-sec" data-flow="7.5">
  <div class="flow-sec-head"><span class="fs-no">📇</span><span class="fs-name">万物词典</span><span class="fs-note">全书共享事实数据库 · 正文的设定唯一基准</span></div>
  ${ glossaryCardHtml() }
</section>
${longNovelMemoryRepoHtml()}
<section class="flow-sec" data-flow="9">
        <div class="flow-sec-head"><span class="fs-no">9</span><span class="fs-name">正文作家 · 章节创作</span><span class="fs-note">专注文学变现 · 双注入连贯撰写</span></div>
        ${ isLong() ? `<div class="btn-row" style="margin-top:8px">
          <label class="long-jump"><span>跳到章节：</span>
          <select id="longJump"><option value="">— 选择章节阅读 —</option>${state.chapters.map((c,i)=>`<option value="${i}">第${i+1}章 ${esc(cleanChapterTitle(c.title))}</option>`).join('')}</select></label>
        </div>` : '' }
        ${ safeCard(()=>qualityReportCardHtml()) }
        <div class="ch-toolbar">
          <span class="ch-toolbar-t">📚 章节列表（共 ${state.chapters.length} 章，已生成 ${state.chapters.filter(c=>c.content && String(c.content).trim()).length} 章）</span>
        </div>
        <div id="chaptersWrap"></div>
        ${ safeCard(()=>fixQueueCardHtml()) }
        <div class="btn-row" style="margin-top:12px">
          ${ isLong() ? `<span class="multi-gen">
            <span class="multi-gen-main">
              <button id="btnGenMany" class="btn blue">⚡ 批量生成多章</button>
            </span>
            <span class="gen-stepper">
              <button type="button" class="gen-step" data-gen-dec title="减少章数">−</button>
              <output id="genCountOut" class="gen-count-out" aria-live="polite">${genBatchN}</output><span class="gen-unit">章</span>
              <button type="button" class="gen-step" data-gen-inc title="增加章数">＋</button>
            </span>
          </span>` : `<button id="btnGenAllChapters" class="btn primary">⚡ 一键生成全部章节</button><button id="btnReOutline" class="btn ghost">重生成大纲</button>` }
        </div>
        ${ isLong() ? `<div class="range-gen">
          <button id="btnRangeGen" class="btn blue">⚡ 区间生成</button>
          <label class="rg-label">从第
            <input id="rgStart" type="number" min="1" max="${state.chapters.length}" value="1" class="rg-input">
          章</label>
          <span class="muted" style="font-size:12px">到第</span>
          <label class="rg-label">
            <input id="rgEnd" type="number" min="1" max="${state.chapters.length}" value="2" class="rg-input">
          章</label>
          <span id="rgStatus" class="muted" style="font-size:11px"></span>
        </div>` : '' }
        <p id="chStatus" class="status"></p>
        <p id="bgTaskIndicator" class="status muted" style="display:none;font-size:12px;margin-top:2px"></p>
        ${ isLong() ? `<div class="long-progress"></div>` : '' }
        <div id="wcTotal" class="wc-total hidden"></div>
        <div class="cyber-pad hidden"></div>
      </section>
    </div>`;
  }
  const o = state.outline;
  let html = `
  ${longNovelControlDeckHtml()}
  <div class="flow-wrap">
        <section class="flow-sec" data-flow="1">
      <div class="flow-sec-head"><span class="fs-no">1</span><span class="fs-name">写作风格</span><span class="fs-note">用户先定表达方式 · 全书共享 · 表达层最高权威</span></div>
      <div class="flow-style-lock-note" style="margin:0 0 10px;padding:9px 12px;border:1px solid var(--line,#ddd);border-radius:10px;background:var(--card,#fff);font-size:12px;line-height:1.7">
        🔒 <b>表达层最高权威</b>：这里确定「怎么写」。后续优化构想只能提供创意建议，不得偷偷改写你已经选定的写作风格。
      </div>
      ${ safeCard(()=>writeStyleCard()) }
    </section>
<section class="flow-sec" data-flow="2">
      <div class="flow-sec-head"><span class="fs-no">2</span><span class="fs-name">故事构想与优化</span><span class="fs-note">先保留原始灵感，再由 AI 提供可选优化方案</span></div>
      ${bookBeatBriefHtml()}
      <div class="card card-theme-idea">
        <div class="card-head-bar">
          <div class="ch-left">
            <span class="ch-badge ch-badge-idea">✨</span>
            <h3 class="ch-title">候选方案比选</h3>
            <span class="ch-subtag ch-subtag-idea">${(state.polishOptions&&state.polishOptions.length)?`${state.polishOptions.length} 个方案可选`:'动态战略'}</span>
          </div>
          <div class="ch-right">
            ${dictmasterLocked()?'<span class="muted" style="font-size:12px">②方案已锁定</span>':''}
          </div>
        </div>
        <div id="polishCards2" class="pol-box" style="display:block"></div>
        ${ polishKeepBar() }   <!-- v1.0.205 阶段5.5 后悔药：生成大纲后仍可 查看历史优化版本 / 重新优化 / 重新选候选后点下方「生成大纲」重搬（词典达人产出前可反悔） -->
        <div class="btn-row" style="margin-top:8px">
          <button data-gen-outline class="btn primary block" ${dictmasterLocked()?'disabled title="词典达人已产出，②方案已锁定"':''}>📚 生成大纲（搬入书名 / 简介 / 节拍）${dictmasterLocked()?'（②已锁定）':''}</button>
        </div>
      </div>
    <div class="card card-theme-idea">
      <div class="card-head-bar">
        <div class="ch-left">
          <span class="ch-badge ch-badge-idea">📋</span>
          <h3 class="ch-title">故事大纲与书名</h3>
          <span class="ch-subtag ch-subtag-idea">《${esc(o.title||'未命名')}》</span>
        </div>
        <div class="ch-right">
          ${titleManagerHtml()}
        </div>
      </div>
      <div class="so-fold-head" id="soLoglineBox" data-so-toggle role="button" tabindex="0" title="展开/收起小说简介" style="display:flex">
        <span class="so-fold">${state.soCollapsed?'▸':'▾'}</span><b>📌 小说简介</b>
        <button type="button" class="btn small ghost" id="btnLoglineEdit" title="编辑小说简介" style="margin-left:auto;padding:1px 8px;font-size:12px">✎ 编辑</button>
      </div>
      <div class="so-logline" ${state.soCollapsed?'hidden':''}>${renderLoglineHtml(o.logline||'')||'（暂无简介，点✎编辑或重新生成大纲）'}</div>
    </div>
    </section>
<section class="flow-sec" data-flow="3">
      <div class="flow-sec-head"><span class="fs-no">3</span><span class="fs-name">写作配方</span><span class="fs-note">把已锁定风格翻译成可执行规则 · 全书共享</span></div>
      ${ aiRecipeCard() }
      
    </section>
<section class="flow-sec" data-flow="4">
      <div class="flow-sec-head"><span class="fs-no">4</span><span class="fs-name">全书节拍</span><span class="fs-note">按全书主线节奏划分剧情阶段（本地映射）</span></div>
      ${bookBeatBriefHtml()}
      ${ isLong() ? beatStructureCardHtml() : '' }
    </section>
<section class="flow-sec flow-info-sec" data-flow="5">
      <div class="flow-sec-head"><span class="fs-no">5</span><span class="fs-name">词典达人</span><span class="fs-note">全局设定架构师 · 人物/法宝/地理/规则硬设定</span></div>
      ${ dictMasterBlockHtml() }
    </section>
<section class="flow-sec flow-info-sec" data-flow="6">
      <div class="flow-sec-head"><span class="fs-no">6</span><span class="fs-name">词典充实</span><span class="fs-note">设定细化工坊 · 感官特征 · 场景禁忌 · 氛围龙套</span></div>
      ${ dictEnrichBlockHtml() }
    </section>
<section class="flow-sec flow-action-sec" data-flow="7">
      <div class="flow-sec-head"><span class="fs-no">7</span><span class="fs-name">学校统筹</span><span class="fs-note">章节微拍 → 校长全局总控 → 老师分段备课</span></div>
      ${ microBeatBlock() }
      ${ schoolZoneBlock() }
    </section>
<section class="flow-sec flow-info-sec" data-flow="7.5">
  <div class="flow-sec-head"><span class="fs-no">📇</span><span class="fs-name">万物词典</span><span class="fs-note">全书共享事实数据库 · 正文的设定唯一基准</span></div>
  ${ safeCard(()=>glossaryCardHtml()) }
</section>
${longNovelMemoryRepoHtml()}
<section class="flow-sec" data-flow="8">
      <div class="flow-sec-head"><span class="fs-no">8</span><span class="fs-name">正文作家 · 章节创作</span><span class="fs-note">专注文学变现 · 双注入连贯撰写</span></div>
        ${ isLong() ? `<div class="btn-row" style="margin-top:8px">
          <label class="long-jump"><span>跳到章节：</span>
          <select id="longJump"><option value="">— 选择章节阅读 —</option>${state.chapters.map((c,i)=>`<option value="${i}">第${i+1}章 ${esc(cleanChapterTitle(c.title))}</option>`).join('')}</select></label>
        </div>` : '' }
        ${ qualityReportCardHtml() }
        <div class="ch-toolbar">
          <span class="ch-toolbar-t">📚 章节列表（共 ${state.chapters.length} 章，已生成 ${state.chapters.filter(c=>c.content && String(c.content).trim()).length} 章）</span>
        </div>
        <div id="chaptersWrap"></div>
        ${ fixQueueCardHtml() }
        <div class="btn-row" style="margin-top:12px">
          ${ isLong() ? `<span class="multi-gen">
            <span class="multi-gen-main">
              <button id="btnGenMany" class="btn blue">⚡ 批量生成多章</button>
            </span>
            <span class="gen-stepper">
              <button type="button" class="gen-step" data-gen-dec title="减少章数">−</button>
              <output id="genCountOut" class="gen-count-out" aria-live="polite">${genBatchN}</output><span class="gen-unit">章</span>
              <button type="button" class="gen-step" data-gen-inc title="增加章数">＋</button>
            </span>
          </span>` : `<button id="btnGenAllChapters" class="btn primary">⚡ 一键生成全部章节</button><button id="btnReOutline" class="btn ghost">重生成大纲</button>` }
        </div>
        ${ isLong() ? `<div class="range-gen">
          <button id="btnRangeGen" class="btn blue">⚡ 区间生成</button>
          <label class="rg-label">从第
            <input id="rgStart" type="number" min="1" max="${state.chapters.length}" value="1" class="rg-input">
          章</label>
          <span class="muted" style="font-size:12px">到第</span>
          <label class="rg-label">
            <input id="rgEnd" type="number" min="1" max="${state.chapters.length}" value="2" class="rg-input">
          章</label>
          <span id="rgStatus" class="muted" style="font-size:11px"></span>
        </div>` : '' }
        <p id="chStatus" class="status"></p>
        <p id="bgTaskIndicator" class="status muted" style="display:none;font-size:12px;margin-top:2px"></p>
        ${ isLong() ? `<div class="long-progress"></div>` : '' }
        <div id="wcTotal" class="wc-total hidden"></div>
        <div class="cyber-pad hidden"></div>
    </section>
  </div>`;
  return html;
}


function beatStructureCardHtml(){
  const o = state.outline || {};
  let chs = Array.isArray(o.chapters) ? o.chapters : [];
  const bb = currentBookBeatCfg();
  const stageNames = beatStageNames();
  let totalCh = chs.length;
  if(!totalCh){
    const _cc = Math.floor(Number(chapterCountVal())||0);
    if(_cc >= 1 && _cc <= 200){ chs = Array.from({length:_cc}, ()=>({title:''})); totalCh = _cc; }
  }
  if(!totalCh || !stageNames.length){
    return `<div class="card bs-card card-theme-beat">
      <div class="bs-head card-head-bar" role="presentation">
        <div class="ch-left">
          <span class="ch-badge ch-badge-beat">🎬</span>
          <h3 class="ch-title">全书节拍与阶段映射</h3>
          <span class="ch-subtag ch-subtag-beat">${esc(bb.label)} · ${stageNames.length} 阶段</span>
        </div>
        <div class="ch-right">
          <span class="muted" style="font-size:12px">宏观节奏链</span>
        </div>
      </div>
      <div class="bs-body">
        <p class="muted" style="margin:0;font-size:12px">生成大纲后将按所选节拍自动划分各章阶段。</p>
      </div>
    </div>`;
  }
  const plan = bookStagePlan(totalCh);
  const beams = []; let cur = 0;
  plan.forEach((p, si)=>{
    const n = p.n;
    const slice = n ? chs.slice(cur, cur+n) : [];
    cur += n;
    beams.push(`
      <div class="bs-beam">
        <div class="bs-beam-top">
          <span class="bs-beam-idx">${si+1}</span>
          <span class="bs-beam-k">${esc(p.name)}</span>
          <span class="bs-beam-meta">${n ? `第 ${cur-n+1}—${cur} 章 · ${n} 章` : '本章阶段暂无对应章'}</span>
        </div>
        <div class="bs-beam-chs">${slice.map((c, j)=>{
          const ci = cur - n + j;
          return `<span class="bs-beam-ch">${ci+1}. ${esc(cleanChapterTitle(c&&c.title))}</span>`;
        }).join(' ')}</div>
      </div>`);
  });
  const fwSeq = plan.map(p=>p.name).join(' → ');
  const mergeNote = totalCh < stageNames.length
    ? `当前章节较少，已将「${esc(bb.label)}」的 ${stageNames.length} 个拍子按序合并为 ${plan.length} 个阶段（每阶段 1 章），确保结尾高潮/收束完整。`
    : '';
  const foldId = 'bsFold';
  const beambody = beams.map((b, i)=>{
    if(totalCh >= 100){
      const m = b.match(/第 (\d+)—(\d+) 章[\s·]+(\d+) 章/);
      if(m) return `<div class="bs-beam bs-beam-fold"><span class="bs-beam-idx">${i+1}</span><span class="bs-beam-k">${m[3] ? m[3]:''}</span><span class="bs-beam-meta">第 ${m[1]}—${m[2]} 章</span></div>`;
    }
    return b;
  }).join('');
  return `<div class="card bs-card card-theme-beat">
    <div class="bs-head card-head-bar" role="presentation" style="cursor:pointer" onclick="document.getElementById('${foldId}').hidden=!document.getElementById('${foldId}').hidden;this.querySelector('#bsFoldTri').textContent=document.getElementById('${foldId}').hidden?'▸':'▾'" title="点击折叠/展开全书节拍">
      <div class="ch-left">
        <span class="ch-badge ch-badge-beat">🎬</span>
        <h3 class="ch-title">全书节拍与阶段映射</h3>
        <span class="ch-subtag ch-subtag-beat">${esc(bb.label)} · ${plan.length} 段 · ${totalCh} 章</span>
      </div>
      <div class="ch-right">
        <span id="bsFoldTri" style="display:inline-block;width:1.2em;font-size:14px;color:var(--muted)">▾</span>
      </div>
    </div>
    <div id="${foldId}" class="bs-body">
      <div class="bs-fw"><span class="bs-fw-chip">${esc(bb.label)}</span><span class="bs-fw-seq">${fwSeq}</span></div>
      <div class="bs-beams">${beambody}</div>
      ${mergeNote ? `<p class="muted" style="margin:4px 0 0;font-size:11px;color:var(--accent)">${mergeNote}</p>` : ''}
    </div>
  </div>`;
}

function beatStageNames(){ const a=currentBookBeatCfg().ai; return (a && a.stages) || []; }
function beatStageDuties(){ const a=currentBookBeatCfg().ai; return (a && a.duty) || []; }

function factCardHtml(){
  const fc = (state.outline && state.outline._factCard) || { characters:{}, timeline:[], lastScene:'' };
  const chars = Object.entries(fc.characters || {}).map(([name, st])=>`
    <div class="fc-char-row">
      <input type="text" class="fc-name" data-fc-char-name="${esc(name)}" value="${esc(name)}" placeholder="人名">
      <input type="text" class="fc-state" data-fc-char-state="${esc(name)}" value="${esc(st.state||'')}" placeholder="当前状态">
      <input type="text" class="fc-loc" data-fc-char-loc="${esc(name)}" value="${esc(st.location||'')}" placeholder="所在地点">
      <input type="text" class="fc-emo" data-fc-char-emo="${esc(name)}" value="${esc(st.emotion||'')}" placeholder="情绪">
    </div>
  `).join('');
  const timeline = (fc.timeline || []).slice(-10).reverse().map(t=>`
    <div class="fc-tl-row">
      <span class="pill">第 ${t.ch+1} 章</span>
      <span>${esc(t.event||'')}</span>
    </div>
  `).join('');
  const ss = (state.outline && state.outline._storyState) || {};
  const obs = ss.current || {};
  const obsChars = obs.characters && Object.entries(obs.characters).length ? Object.entries(obs.characters).slice(0,8).map(([n,v])=>`${esc(n)}=${esc(v)}`).join('；') : '暂无';

  return `<div class="card fc-card${state.fcCollapsed?' fc-collapsed':''}">
    <div class="fc-head" data-fc-fold role="button" tabindex="0" title="展开/收起">
      <h3 style="margin:0">🧩 事实与一致性看板</h3>
      <span class="sc-fold-ico">${state.fcCollapsed?'▸':'▾'}</span>
    </div>
    <div class="fc-body" ${state.fcCollapsed?'hidden':''}>
      <div class="fc-sec">
        <div class="fc-sec-head">人物状态 <button type="button" class="btn small ghost" data-fc-char-add>＋ 添加</button></div>
        ${chars || '<span class="muted">暂无人物状态，可手动添加或在正文生成后自动提取</span>'}
      </div>
      <div class="fc-sec">
        <div class="fc-sec-head">最近时间线</div>
        ${timeline || '<span class="muted">暂无时间线</span>'}
      </div>
      <div class="fc-sec">
        <div class="fc-sec-head">正文结算状态（只读）</div>
        <div class="fc-meta">第${Number(obs.chapter)>=0?Number(obs.chapter)+1:'—'}章 · 时间：${esc(obs.time||'—')} · 地点：${esc(obs.location||'—')}</div>
        <div class="fc-meta">章末：${esc(obs.endingState||'—')}</div>
        <div class="fc-meta">人物：${obsChars}</div>
        ${(()=>{ const au=ss.chapters&&Number(obs.chapter)>=0?ss.chapters[Number(obs.chapter)]?.audit:null; if(!au) return '<div class="fc-meta">一致性审计：尚未完成</div>'; const cls=au.status==='FAIL'?'err':au.status==='WARN'?'warn':'ok'; return `<div class="fc-meta ${cls}">一致性审计：${esc(au.status)} · ${esc(au.summary||'')}</div>`; })()}
      </div>
      <label class="fc-field"><span>最新场景</span><input type="text" id="fcLastScene" value="${esc(fc.lastScene||'')}" placeholder="最后一章结束时的场景/环境"></label>
      <p class="muted" style="font-size:11px">看板内容可由正文 AI 生成后自动更新，也可手动修正。</p>
    </div>
  </div>`;
}

function bindFactCard(){
  const head = $('[data-fc-fold]');
  if(head) head.onclick = ()=>{
    state.fcCollapsed = !state.fcCollapsed; persist();
    const body = $('.fc-body'); if(body) body.hidden = state.fcCollapsed;
    const ico = head.querySelector('.sc-fold-ico'); if(ico) ico.textContent = state.fcCollapsed?'▸':'▾';
  };
  const o = state.outline; if(!o) return;
  o._factCard = o._factCard || { characters:{}, timeline:[], lastScene:'' };
  const fc = o._factCard;

  const add = $('[data-fc-char-add]');
  if(add) add.onclick = ()=>{
    const name = prompt('人物名：'); if(!name) return;
    fc.characters[name] = { state:'', location:'', emotion:'' }; persist(); render();
  };
  $$('[data-fc-char-state],[data-fc-char-loc],[data-fc-char-emo]').forEach(inp=>{
    inp.onchange = ()=>{
      const name = inp.dataset.fcCharState || inp.dataset.fcCharLoc || inp.dataset.fcCharEmo;
      if(!fc.characters[name]) return;
      if(inp.dataset.fcCharState) fc.characters[name].state = inp.value.trim();
      if(inp.dataset.fcCharLoc) fc.characters[name].location = inp.value.trim();
      if(inp.dataset.fcCharEmo) fc.characters[name].emotion = inp.value.trim();
      persist();
    };
  });
  const ls = $('#fcLastScene');
  if(ls) ls.onchange = ()=>{ fc.lastScene = ls.value.trim(); persist(); };
}

function updateFactCardFromChapter(i, text){
  const o = state.outline; if(!o) return;
  const fc = o._factCard = o._factCard || { characters:{}, timeline:[], lastScene:'' };
  fc.timeline = fc.timeline || [];
  fc.timeline = fc.timeline.filter(x => x.ch !== i);
  fc.timeline.push({ ch:i, event:`第 ${i+1} 章正文` });
  if(fc.timeline.length > 50) fc.timeline = fc.timeline.slice(-50);
  const paras = String(text||'').split(/\n+/).map(s => s.trim()).filter(Boolean);
  if(paras.length) fc.lastScene = paras[paras.length-1].slice(0, 120);
  fc.timeAnchors = fc.timeAnchors || [];
  fc.timeAnchors = fc.timeAnchors.filter(x => x.ch !== i);
  auditTimePresentation(i, text);
  persist();
}

function rollingSummaryCardHtml(){
  const o = state.outline; if(!o) return '';
  const sums = (o._rollingSummaries || []).slice().sort((a,b)=>{
    const [a1] = a.key.split('-').map(Number);
    const [b1] = b.key.split('-').map(Number);
    return a1 - b1;
  });
  const rows = sums.map(s=>`
    <div class="rs-row">
      <span class="pill">第 ${s.key} 章</span>
      <span class="rs-text">${esc(s.text)}</span>
    </div>
  `).join('');
  return `<div class="card rs-card${state.rsCollapsed?' rs-collapsed':''}">
    <div class="rs-head" data-rs-fold role="button" tabindex="0" title="展开/收起">
      <h3 style="margin:0">📜 滚动摘要</h3>
      <span class="sc-fold-ico">${state.rsCollapsed?'▸':'▾'}</span>
    </div>
    <div class="rs-body" ${state.rsCollapsed?'hidden':''}>
      ${rows || '<span class="muted">暂无滚动摘要，批量生成正文后会自动生成</span>'}
      <div class="btn-row" style="margin-top:8px">
        <button type="button" class="btn small primary" data-rs-gen ${sums.length?'':'disabled'}>🔄 补齐缺失摘要</button>
        <button type="button" class="btn small ghost" data-rs-clear>清空摘要</button>
      </div>
      <p class="muted" style="font-size:11px">每 5 章生成一次 300-400 字摘要；写新章时会注入最近 3 个区块（约 15 章）的摘要。</p>
    </div>
  </div>`;
}

function bindRollingSummaryCard(){
  const head = $('[data-rs-fold]');
  if(head) head.onclick = ()=>{
    state.rsCollapsed = !state.rsCollapsed; persist();
    const body = $('.rs-body'); if(body) body.hidden = state.rsCollapsed;
    const ico = head.querySelector('.sc-fold-ico'); if(ico) ico.textContent = state.rsCollapsed?'▸':'▾';
  };
  const gen = $('[data-rs-gen]');
  if(gen) gen.onclick = async ()=>{
    busy(gen, true, '生成中…');
    try{ await ensureChapterDigests(); await generateRollingSummaries(); render(); toast('滚动摘要已补齐'); }
    catch(e){ toast('摘要生成失败：'+e.message); }
    finally{ busy(gen, false); }
  };
  const clr = $('[data-rs-clear]');
  if(clr) clr.onclick = ()=>{
    if(!confirm('清空所有滚动摘要？正文生成时会重新生成。')) return;
    const o = state.outline; if(!o) return;
    o._rollingSummaries = []; persist(); render(); toast('已清空滚动摘要');
  };
}

function qualityReportCardHtml(){ return ''; }

function bindQualityReportCard(){}

function formatRelevantGlossaryHtml(rg){
  const lines = [];
  if(rg.characters && rg.characters.length) lines.push('<b>人物：</b>'+rg.characters.map(c=>esc(c.name)).join('、'));
  if(rg.places && rg.places.length) lines.push('<b>地点：</b>'+rg.places.map(p=>esc(p.name)).join('、'));
  if(rg.propernouns && rg.propernouns.length) lines.push('<b>专名：</b>'+rg.propernouns.map(p=>esc(p.name)).join('、'));
  if(!lines.length) return '';
  return `<div class="reader-rg"><span class="reader-rg-lab">📌 本章相关设定</span>${lines.join(' · ')}</div>`;
}

function fixQueueCardHtml(){
  const q = state._fixQueue || [];
  if(!q.length) return '';
  const rows = q.map((item, idx)=>{
    const isKind = !Number.isInteger(item.ch);
    return `<div class="fq-row">
      ${isKind
        ? `<span class="pill tag-warn">${esc(item.kind || 'AI')}</span><span>${esc(item.error || '')}</span>`
        : `<span class="pill tag-warn">第 ${item.ch+1} 章</span><span>${esc(item.code)}</span>`}
      <span class="muted">重试 ${item.attempts||0} 次</span>
      <button type="button" class="btn small ghost" data-fq-remove="${idx}">移除</button>
    </div>`;
  }).join('');
  return `<div class="card fq-card">
    <div class="fq-head"><h3 style="margin:0">🔧 修复队列（${q.length}）</h3></div>
    <div class="fq-body">${rows}</div>
  </div>`;
}

function bindFixQueueCard(){
  $$('[data-fq-remove]').forEach(btn=>{
    btn.onclick = ()=>{
      const idx = +btn.dataset.fqRemove;
      state._fixQueue.splice(idx,1); persist(); render();
    };
  });
}


function syncOrigIdeaCard(){
  const t = $('.orig-text'); if(!t) return;
  if(state.dictmasterRan){ t.value = String(state.originalIdeaSnapshot || state.idea || '').trim() || '（尚未生成万物词典）'; }
  else { t.value = String(state.idea || '').trim() || '（尚未生成万物词典）'; }
}

function origIdeaCard(){
  const o = state.outline;
  const show = state.dictmasterRan
    ? (String(state.originalIdeaSnapshot || '').trim() || String(state.idea || '').trim())
    : String(state.idea || '').trim();
  return `<div class="card orig-card">
    <div class="orig-head" role="button" tabindex="0" data-orig-toggle title="展开/收起">
      <span class="orig-t">📝 原始构想</span>
      <span class="orig-fold">▸</span>
      <button type="button" class="btn small ghost gs-tool" data-orig-copy title="复制构想原文">📋 复制</button>
    </div>
    <div class="orig-body" hidden>
      <textarea readonly class="orig-text" spellcheck="false">${esc(show || '（尚未生成万物词典）')}</textarea>
    </div>
  </div>`;
}

function bindOrigIdea(){
  const og = $('[data-orig-toggle]');
  if(og) og.onclick = (e)=>{
    if(e.target.closest('[data-orig-copy]')) return;
    syncOrigIdeaCard();
    const body = $('.orig-body'); if(!body) return;
    const on = !body.hidden;
    body.hidden = on;
    const fold = og.querySelector('.orig-fold');
    if(fold) fold.textContent = on ? '▸' : '▾';
  };
  const cpy = $('[data-orig-copy]');
  if(cpy) cpy.onclick = ()=>{
    const ta = $('.orig-text'); if(!ta) return;
    copyText(ta.value);
  };
}
function bindOutlineFold(){
  const h = $('[data-so-toggle]'); if(!h) return;
  h.onclick = ()=>{
    const body = $('.so-logline, .logline-ta'); if(!body) return;
    const on = !body.hidden;
    body.hidden = on;
    const f = h.querySelector('.so-fold'); if(f) f.textContent = on ? '▸' : '▾';
    if(state){ state.soCollapsed = on; if(typeof persist==='function') persist(); }
  };
}
function bindLoglineEdit(){
  const eb = $('#btnLoglineEdit'); if(!eb) return;
  eb.onclick = (e)=>{
    e.stopPropagation();
    let p = $('.so-logline');
    if(!p){
      if(state){ state.soCollapsed = false; if(typeof persist==='function') persist(); }
      const head = $('[data-so-toggle]');
      if(head){ const f = head.querySelector('.so-fold'); if(f) f.textContent = '▾'; }
      p = $('.so-logline');
    }
    if(!p) return;
    const ta = document.createElement('textarea');
    ta.className = 'logline-ta';
    ta.value = stripStructureFromIntro(String((state.outline||{}).logline||''));
    ta.rows = 4;
    ta.style.width = '100%';
    ta.style.marginTop = '6px';
    ta.spellcheck = false;
    ta.placeholder = '编辑小说简介（点击卡片其他位置或 Ctrl+Enter 保存，Esc 取消）';
    p.replaceWith(ta);
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
    let done = false;
    const finish = (save)=>{
      if(done) return; done = true;
      const v = String(ta.value||'').trim();
      if(save && v){
        state.outline = state.outline || {};
        if(v !== state.outline.logline){ state.outline.logline = v; if(typeof persist==='function') persist(); toast('小说简介已更新'); }
      }
      if(typeof render==='function') render();
    };
    ta.onblur = ()=>finish(true);
    ta.onkeydown = (ev)=>{
      if(ev.key==='Escape'){ ev.preventDefault(); ta.onblur=null; finish(false); }
      else if(ev.key==='Enter' && (ev.ctrlKey||ev.metaKey)){ ev.preventDefault(); ta.onblur=null; finish(true); }
    };
  };
}
function bindAiRecipe(){
  const card = $('.ai-recipe-card'); if(!card) return;
  const gen = card.querySelector('[data-ai-recipe-gen]');
  if(gen) gen.onclick = ()=>{ aiRecipeGen(); };
  const clr = card.querySelector('[data-ai-recipe-clear]');
  if(clr) clr.onclick = ()=>{
    const ta = $('#aiReDesc'); if(ta) ta.value = '';
    aiRp = null;
    const out = card.querySelector('[data-ai-recipe-out]'); if(out) out.innerHTML = aiRecipeResultHtml();
  };
  const foldHead = card.querySelector('[data-ai-recipe-fold]');
  if(foldHead) foldHead.addEventListener('click', ()=>{
    const cfg = getCfg();
    card.classList.toggle('collapsed');
    const nowCollapsed = card.classList.contains('collapsed');
    cfg.aiRecipeCollapsed = nowCollapsed; saveCfg(cfg);
    const ico = foldHead.querySelector('.sc-fold-ico'); if(ico) ico.textContent = nowCollapsed?'▸':'▾';
  });
  const histBtn = card.querySelector('[data-ai-recipe-hist]');
  if(histBtn) histBtn.onclick = ()=>{ openAiHistPanel(); };
  card.addEventListener('click', (e)=>{
    const pick = e.target.closest('[data-ai-recipe-pick]');
    if(pick){ aiRecipeApply(+pick.dataset.aiRecipePick); return; }
    const save = e.target.closest('[data-ai-recipe-save]');
    if(save){ aiRecipeSave(+save.dataset.aiRecipeSave); return; }
    const ag = e.target.closest('[data-ai-recipe-addgap]');
    if(ag){ aiRecipeAddGap(ag.dataset.aiRecipeAddgap); return; }
    const aga = e.target.closest('[data-ai-recipe-addgapall]');
    if(aga){ aiRecipeAddGapAll(+aga.dataset.aiRecipeAddgapall); return; }
  });
}
function aiHistCandHtml(c, idx, ei){
  if(!c) return '';
  const pendAll = Array.isArray(c.gap) && c.gap.some(g => !((c.tags||[]).includes(g.id) || libHas(g.id)));
  return `<div class="ai-recipe-cand" style="margin-top:6px">
    <div class="ai-recipe-cand-head">
      <b>${esc(c.name||('候选'+(idx+1)))}</b>
      ${ recipeScBadge(c) }
      <span class="muted" style="font-size:11px">${esc(c.desc||'')}</span>
    </div>
    <div class="ai-recipe-tags">${ (c.tags||[]).map(id=>{ const s=writeStyleById(id); return `<span class="ai-recipe-tg">${esc(s?s.name:id)}</span>`; }).join('') }</div>
    <div class="ai-recipe-sec"><span class="ar-lab">为何这样选</span>${esc(wiseWhyText(c.why||''))}</div>
    <div class="ai-recipe-sec"><span class="ar-lab">适用场景</span>${esc(wiseWhyText(c.scenario||''))}</div>
    <div class="ai-recipe-gap">
      ${ Array.isArray(c.gap) && c.gap.length
        ? `<div class="ar-gaptitle">⚠️ 词条缺口（${c.gap.length} 项）</div>` + c.gap.map((g,gi)=>`
            <div class="ai-recipe-gapitem">
              <div class="ar-gaphead"><b>${esc((g&&g.name)||'')}</b><span class="muted" style="font-size:11px">${ (AI_CAT_LABEL[(g&&g.cat)||'']||((g&&g.cat)||'custom')) }</span></div>
              <div class="ar-gapwhy">${esc((g&&g.reasons)||'')}</div>
              ${gapFiveHtml(g)}
              <button type="button" class="btn small ghost" data-ah-addgap="${ei}__${idx}__${gi}" ${ (c.tags||[]).includes(g.id)|| libHas(g.id) ? 'disabled' : '' }>＋ 加入词库</button>
            </div>`).join('')
            + (c.gap.length>1 ? `<div style="margin-top:6px"><button type="button" class="btn small primary" data-ah-addgapall="${ei}__${idx}" ${pendAll?'':'disabled'} title="仅加入尚未入库的新词条；已入库的自动跳过">＋ 全部加入词库</button></div>` : '')
        : `<span class="ar-ok">✓ 现有词库即可覆盖，无需新词条</span>` }
    </div>
    <div style="margin-top:6px"><button type="button" class="btn small primary" data-ah-candpick="${idx}" title="恢复此候选并应用到写作风格">✔ 恢复为此候选</button></div>
  </div>`;
}
function openAiHistPanel(){
  const hist = getAiHist();
  const ov = document.createElement('div'); ov.id='aiHistPanel'; ov.className='gs-overlay';
  const entHtml = (e,hi)=>{
    const ei = hist.length-1-hi;   // 倒序序号（与展示一致）
    return `<div class="ws-lib-group ws-lib-fold" style="margin-top:6px">
      <div class="ws-lib-fold-t" data-ah-fold="${ei}" role="button" tabindex="0" title="展开/收起">
        <span>${e.src==='outline'?'📑':'📝'} ${esc(e.desc||'')} <span class="muted" style="font-size:10px">· ${new Date(e.ts).toLocaleString('zh-CN',{hour12:false})}</span></span>
        <span class="sc-fold-ico">▸</span>
      </div>
      <div class="ws-lib-fold-body" style="display:none">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px">
          <button type="button" class="btn small ghost" data-ah-apply="${ei}">✔ 重新采用首个</button>
          <button type="button" class="btn small ghost" data-ah-export="${ei}" title="导出该批配方为 JSON（自动附带其引用的自定义词条与 gap 新词条，导入方即可正常使用）">⬇ 导出</button>
          <button type="button" class="btn small ghost" data-ah-del="${ei}">删</button>
        </div>
        ${ (Array.isArray(e.list)&&e.list.length) ? e.list.map((c,i)=>aiHistCandHtml(c,i,ei)).join('<hr style="margin:6px 0;opacity:.2">') : '<p class="muted">无候选。</p>' }
      </div>
    </div>`;
  };
  const list = hist.slice().reverse();
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📖 AI 配方历史（${hist.length}）</b>
        <span style="display:flex;gap:6px">
          <button class="btn small ghost" data-ah-import title="导入配方包 JSON（先预览勾选，再确认导入；词条自动合并进词库）">⬆ 导入配方包</button>
          <button class="btn small ghost" data-ah-clear>清空</button>
          <button class="gs-x" data-ah-close>✕</button>
        </span></div>
      <div class="cv-body">
        ${ list.length ? list.map(entHtml).join('') : '<p class="muted">暂无历史。用「✨ 生成配方」生成后即自动保存于此，可随时回看。</p>' }
      </div>
      <input type="file" id="aiRecipeImportFile" accept=".json,application/json" style="display:none">
    </div>`;
  const close = ()=>{ const p=$('#aiHistPanel'); if(p) p.remove(); };
  const fi = ov.querySelector('#aiRecipeImportFile');
  if(fi) fi.onchange = e=>{ const file = e.target.files && e.target.files[0]; if(file) importRecipeBundle(file); e.target.value=''; };
  ov.addEventListener('click', (e)=>{
    const cl = e.target.closest('[data-ah-close]'); if(cl){ close(); return; }
    const imp = e.target.closest('[data-ah-import]');
    if(imp){ const f2=$('#aiRecipeImportFile'); if(f2) f2.click(); return; }
    const exp = e.target.closest('[data-ah-export]');
    if(exp){ exportRecipeBundle(hist[+exp.dataset.ahExport]); return; }
    const fold = e.target.closest('[data-ah-fold]');
    if(fold){ const body = fold.closest('.ws-lib-group').querySelector('.ws-lib-fold-body'); if(body){ const open = body.style.display!=='none'; body.style.display = open?'none':'block'; fold.querySelector('.sc-fold-ico').textContent = open?'▸':'▾'; } return; }
    const apply = e.target.closest('[data-ah-apply]');
    if(apply){ const ei=+apply.dataset.ahApply; const entry=hist[ei]; if(entry&&Array.isArray(entry.list)&&entry.list.length){ applyChosenCandidate(entry.list[0], {render:false}); refreshAiHistBadge(); close(); } return; }
    const candpick = e.target.closest('[data-ah-candpick]');
    if(candpick){ const ci=+candpick.dataset.ahCandpick; const grp=candpick.closest('.ws-lib-group'); const fold=grp&&grp.querySelector('[data-ah-fold]'); const ei=fold?+fold.dataset.ahFold:-1; const entry=hist[ei]; const c=(entry&&Array.isArray(entry.list))?entry.list[ci]:null; if(c){ applyChosenCandidate(c, {render:true}); refreshAiHistBadge(); close(); } return; }
    const ahAdd = e.target.closest('[data-ah-addgap]');
    if(ahAdd){ const p=(ahAdd.dataset.ahAddgap||'').split('__'); if(p.length===3){ const ei=+p[0], ci=+p[1], gi=+p[2]; aiHistAddGap(ei, ci, gi); refreshAiHistBadge(); } return; }
    const ahAddAll = e.target.closest('[data-ah-addgapall]');
    if(ahAddAll){ const p=(ahAddAll.dataset.ahAddgapall||'').split('__'); if(p.length===2){ aiHistAddGapAll(+p[0], +p[1]); refreshAiHistBadge(); } return; }
    const del = e.target.closest('[data-ah-del]');
    if(del){ const ei=+del.dataset.ahDel; const a=getAiHist(); if(a[ei]){ a.splice(ei,1); setAiHist(a); } refreshAiHistBadge(); const p=$('#aiHistPanel'); if(p) p.remove(); openAiHistPanel(); return; }
    const clr = e.target.closest('[data-ah-clear]');
    if(clr){ if(confirm('确认清空全部 AI 配方历史？')){ setAiHist([]); refreshAiHistBadge(); close(); } return; }
    if(e.target===ov) close();
  });
  document.body.appendChild(ov);
}
function closeAiHistPanel(){ const p=$('#aiHistPanel'); if(p) p.remove(); }
function buildRecipeBundle(cands, extraElIds){
  const cfg = getCfg();
  const added = (cfg.styleCustom && Array.isArray(cfg.styleCustom.added)) ? cfg.styleCustom.added : [];
  const addedById = {};
  added.forEach(x=>{ if(x&&x.id) addedById[String(x.id)]=x; });
  const bundled = []; const seen = new Set();
  const pushEl = (el)=>{ if(el && el.id && String(el.name||'').trim() && !seen.has(String(el.id))){ seen.add(String(el.id)); bundled.push(JSON.parse(JSON.stringify(el))); } };
  (Array.isArray(cands)?cands:[]).forEach(c=>{
    (Array.isArray(c && c.tags) ? c.tags : []).forEach(id=>{ if(addedById[String(id)]) pushEl(addedById[String(id)]); });   // 自定义词条打包
    (Array.isArray(c && c.gap) ? c.gap : []).forEach(g=> pushEl(g));                                        // gap 新词条五维齐全直接打包
  });
  if(extraElIds) added.forEach(x=>{ if(x && x.id && extraElIds.has(String(x.id))) pushEl(x); });            // 手动勾选词条（不被配方引用也能单独导出）
  return { ver:1, exportedAt:Date.now(), kind:'aiRecipeBundle', recipes: JSON.parse(JSON.stringify(Array.isArray(cands)?cands:[])), bundled };
}
function bundleStamp(){
  const ts = new Date(); const pad = n=>String(n).padStart(2,'0');
  return `${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}`;
}
function downloadBundleFile(data, filename, doneMsg){
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  URL.revokeObjectURL(a.href);
  if(doneMsg) toast(doneMsg);
}
function exportRecipeBundle(entry){
  const cands = Array.isArray(entry && entry.list) ? entry.list : [];
  if(!cands.length){ toast('该历史条目没有可导出的配方'); return; }
  const data = buildRecipeBundle(cands);
  const desc = String((entry&&entry.desc)||'配方').replace(/[\\/:*?"<>|]/g,'').slice(0,20) || '配方';
  downloadBundleFile(data, `配方_${desc}-${bundleStamp()}.json`, `已导出 ${cands.length} 个配方（附词条 ${data.bundled.length} 个）`);
}
function classifyImportBundle(data){
  const cfg = getCfg();
  const haveIds = new Set(((cfg.styleCustom && cfg.styleCustom.added)||[]).map(x=>x&&String(x.id)));
  const libIds = new Set(writeStyleLib().map(x=>x&&String(x.id)));
  const elStates = [];
  (Array.isArray(data.bundled)?data.bundled:[]).forEach(el=>{
    const id = String(el&&el.id||''); const nm = String(el&&el.name||'').trim();
    if(!id || !nm) return;
    elStates.push({ el, mode: libIds.has(id) ? 'skip' : (haveIds.has(id) ? 'repl' : 'new') });
  });
  const hist = getAiHist();
  const sigOf = c => JSON.stringify([String(c&&c.name||''), Array.isArray(c&&c.tags)?c.tags.map(String):[]]);
  const existSigs = new Set();
  hist.forEach(e=> (Array.isArray(e&&e.list)?e.list:[]).forEach(x=> existSigs.add(sigOf(x))));
  const candStates = [];
  (Array.isArray(data.recipes)?data.recipes:[]).forEach(c=>{
    if(!c || !String(c&&c.name||'').trim()) return;
    candStates.push({ c, dup: existSigs.has(sigOf(c)) });
  });
  return { candStates, elStates };
}
function importRecipeBundle(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    let data;
    try{ data = JSON.parse(reader.result); }catch(e){ toast('导入失败：文件不是合法 JSON'); return; }
    if(!data || typeof data!=='object' || data.kind!=='aiRecipeBundle' || !Array.isArray(data.recipes) || !Array.isArray(data.bundled) || (!data.recipes.length && !data.bundled.length)){
      toast('导入失败：不是合法的 AI 配方包'); return;
    }
    const st = classifyImportBundle(data);
    if(!st.candStates.length && !st.elStates.length){ toast('导入包内没有有效内容'); return; }
    showImportPreview(st);
  };
  reader.readAsText(file);
}
function showImportPreview(st){
  const ov = document.createElement('div'); ov.id='impPrevPanel'; ov.className='gs-overlay';
  const nNew = st.candStates.filter(x=>!x.dup).length, nDup = st.candStates.length - nNew;
  const elNew = st.elStates.filter(x=>x.mode==='new').length;
  const elRepl = st.elStates.filter(x=>x.mode==='repl').length;
  const elSkip = st.elStates.filter(x=>x.mode==='skip').length;
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📥 导入预览</b><button class="gs-x" data-ip-close title="取消导入">✕</button></div>
      <div class="cv-body">
        <p class="muted" style="margin:4px 0;font-size:12px">配方 ${st.candStates.length} 条（新 ${nNew} / 重复 ${nDup}）· 词条 ${st.elStates.length} 个（新 ${elNew} / 可覆盖 ${elRepl} / 内置跳过 ${elSkip}）</p>
        ${st.candStates.length ? `<div style="margin:8px 0 2px;display:flex;align-items:center;gap:10px"><b>配方</b>${nNew?`<label class="muted" style="font-size:12px;display:inline-flex;align-items:center;gap:4px"><input type="checkbox" data-ip-all checked> 全选新条目</label>`:''}</div>` : ''}
        ${st.candStates.map((x,i)=> x.dup
          ? `<label class="muted" style="display:block;margin:2px 0" title="与已有配方重复（同名+同标签），无法重复导入">☐ ${esc(String(x.c.name||'').slice(0,30))} · 重复</label>`
          : `<label style="display:block;margin:2px 0"><input type="checkbox" data-ip-cand="${i}" checked> ${esc(String(x.c.name||'').slice(0,30))}${Array.isArray(x.c.tags)?` <span class="muted" style="font-size:11px">· 标签 ${x.c.tags.length} 个</span>`:''}</label>`
        ).join('')}
        ${st.elStates.length ? '<div style="margin:10px 0 2px"><b>随附词条</b></div>' : ''}
        ${st.elStates.map((x,i)=>{
          const nm = esc(String(x.el.name||'').slice(0,24));
          if(x.mode==='skip') return `<label class="muted" style="display:block;margin:2px 0" title="内置词条两端都有，无需导入">☒ ${nm} · 内置</label>`;
          if(x.mode==='repl') return `<label style="display:block;margin:2px 0"><input type="checkbox" data-ip-el="${i}"> ${nm} <span class="muted" style="font-size:11px">· 已有（勾选=以导入版覆盖）</span></label>`;
          return `<label style="display:block;margin:2px 0"><input type="checkbox" data-ip-el="${i}" checked> ${nm} <span class="muted" style="font-size:11px">· ${esc(String(x.el.group||'custom'))} · 新增</span></label>`;
        }).join('')}
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid rgba(128,128,128,.2)">
        <span data-ip-sum class="muted" style="flex:1"></span>
        <button type="button" class="btn small" data-ip-go>✓ 导入所选</button>
        <button type="button" class="btn small ghost" data-ip-close>取消</button>
      </div>
    </div>`;
  const close = ()=>{ const p=$('#impPrevPanel'); if(p) p.remove(); };
  const refreshIpLocks = ()=>{
    const locked = new Set();
    ov.querySelectorAll('[data-ip-cand]:checked').forEach(cb=>{
      const x = st.candStates[+cb.dataset.ipCand];
      (Array.isArray(x&&x.c&&x.c.tags)?x.c.tags:[]).forEach(id=>locked.add(String(id)));
    });
    ov.querySelectorAll('[data-ip-el]').forEach(cb=>{
      const x = st.elStates[+cb.dataset.ipEl]; if(!x) return;
      const id = String(x.el&&x.el.id||'');
      if(locked.has(id)){ cb.checked = true; cb.disabled = true; }
      else { cb.disabled = false; if(cb.dataset.ipManual!=='1') cb.checked = (x.mode==='new'); }
    });
    const nc = ov.querySelectorAll('[data-ip-cand]:checked').length;
    const ne = ov.querySelectorAll('[data-ip-el]:checked').length;
    const sum = ov.querySelector('[data-ip-sum]'); if(sum) sum.textContent = `已选 配方 ${nc} · 词条 ${ne}`;
    const go = ov.querySelector('[data-ip-go]'); if(go) go.disabled = (nc+ne)===0;
  };
  refreshIpLocks();
  ov.addEventListener('change', e=>{
    const t = e.target;
    if(t.matches('[data-ip-all]')){
      ov.querySelectorAll('[data-ip-cand]').forEach(cb=>{ cb.checked = t.checked; });
      refreshIpLocks(); return;
    }
    if(t.matches('[data-ip-el]')){ t.dataset.ipManual = '1'; refreshIpLocks(); return; }
    if(t.matches('[data-ip-cand]')) refreshIpLocks();
  });
  ov.addEventListener('click', e=>{
    const cl = e.target.closest('[data-ip-close]'); if(cl){ close(); return; }
    const go = e.target.closest('[data-ip-go]');
    if(go){ applyBundleSelection(st, ov); return; }
    if(e.target===ov) close();
  });
  document.body.appendChild(ov);
}
function applyBundleSelection(st, ov){
  const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || { notes:{}, added:[], removed:[], comboRemoved:[] };
  const normEl = el=>({ id:String(el.id), group:['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].includes(el.group)?el.group:'custom',
    name:String(el.name), note:String(el.note||''), demo:el.demo?String(el.demo):'', seal:(el.seal===undefined?0:el.seal), warning:el.warning?String(el.warning):'' });
  let elAdded=0, elRepl=0;
  ov.querySelectorAll('[data-ip-el]:checked').forEach(cb=>{
    const x = st.elStates[+cb.dataset.ipEl]; if(!x || !x.el) return;
    if(x.mode==='new'){ cfg.styleCustom.added.push(normEl(x.el)); elAdded++; }
    else if(x.mode==='repl'){
      const i = cfg.styleCustom.added.findIndex(y=>y && String(y.id)===String(x.el.id));
      if(i>=0){ cfg.styleCustom.added[i] = normEl(x.el); elRepl++; }
    }
  });
  const cands = [];
  ov.querySelectorAll('[data-ip-cand]:checked').forEach(cb=>{
    const x = st.candStates[+cb.dataset.ipCand]; if(x && x.c) cands.push(x.c);
  });
  if(cands.length) addAiHist({ id: aiHistEntryId(), ts: Date.now(), src:'desc', desc:'📥 导入所选配方', list: JSON.parse(JSON.stringify(cands)), applied:[] });
  saveCfg(cfg); refreshAiHistBadge();
  const p = $('#impPrevPanel'); if(p) p.remove();
  toast(`导入完成：配方 ${cands.length} · 新增词条 ${elAdded} · 覆盖词条 ${elRepl}`);
}
function refreshExSum(ov){
  const nc = ov.querySelectorAll('[data-ex-combo]:checked').length;
  const nm = ov.querySelectorAll('[data-ex-mycombo]:checked').length;
  const ne = ov.querySelectorAll('[data-ex-el]:checked').length;
  const sum = ov.querySelector('[data-ex-sum]'); if(sum) sum.textContent = `已选 组合配方 ${nc} · 我的配方 ${nm} · 词条 ${ne}`;
  const go = ov.querySelector('[data-ex-go]'); if(go) go.disabled = (nc+nm+ne)===0;
}
function exportStylePack(sel){
  const comboIds = new Set(sel.combos || []);
  const myIds = new Set(sel.myCombos || []);
  const elIds = new Set(sel.els || []);
  if(!(comboIds.size + myIds.size + elIds.size)){ toast('请先勾选要导出的内容'); return; }
  const combos = (WRITE_COMBOS||[]).filter(c=> c && comboIds.has(String(c.id))).map(c=> JSON.parse(JSON.stringify(c)));
  const myCombos = ((getCfg().styleCustom||{}).customCombos||[]).filter(c=> c && myIds.has(String(c.id))).map(c=> JSON.parse(JSON.stringify(c)));
  const entries = writeStyleLib().filter(s=> s && elIds.has(String(s.id))).map(s=> JSON.parse(JSON.stringify(s)));
  const data = { ver:2, kind:'wsStylePack', exportedAt:Date.now(), combos, myCombos, entries };
  downloadBundleFile(data, `写作风格_${bundleStamp()}.json`, `已导出 组合配方 ${combos.length} · 我的配方 ${myCombos.length} · 词条 ${entries.length}`);
}
function openExportCenter(){
  const sc = getCfg().styleCustom || {};
  const comboRemoved = Array.isArray(sc.comboRemoved) ? sc.comboRemoved : [];
  const builtinCombos = (WRITE_COMBOS||[]).filter(c=> c && c.id && !comboRemoved.includes(c.id));
  const myCombos = Array.isArray(sc.customCombos) ? sc.customCombos.filter(c=> c && c.id) : [];
  const GROUPS = ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'];
  const lib = writeStyleLib().filter(s=> s && s.id);
  const row = (attr, id, name, tip) => `<label style="display:inline-flex;align-items:center;gap:4px;margin:3px 12px 3px 0" title="${esc(tip||String(name))}"><input type="checkbox" ${attr}="${esc(String(id))}"> ${esc(String(name))}</label>`;
  const comboHtml = builtinCombos.map(c=> row('data-ex-combo', c.id, c.name, `${c.name||''}：${c.desc||''}`)).join('') || '<p class="muted">暂无。</p>';
  const myHtml = myCombos.length
    ? myCombos.map(c=> row('data-ex-mycombo', c.id, c.name, `${c.name||''}：${c.desc||''}`)).join('')
    : '<p class="muted">暂无我的配方。</p>';
  const byGroup = {};
  lib.forEach(x=>{ const g = GROUPS.includes(x.cat) ? x.cat : 'custom'; (byGroup[g]=byGroup[g]||[]).push(x); });
  const gKeys = GROUPS.filter(g=> byGroup[g] && byGroup[g].length); if(byGroup.custom && byGroup.custom.length) gKeys.push('custom');
  const elHtml = gKeys.map(g=>{
    const items = byGroup[g].map(x=> row('data-ex-el', x.id, x.name, `${x.name||''}：${String(x.note||'').slice(0,80)}`)).join('');
    return `<div style="margin:4px 0">
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer" title="勾选=全选该组词条">
        <input type="checkbox" data-ex-gall="${esc(g)}"> <b style="font-size:12px">${g==='custom'?'自定义':g}（${byGroup[g].length}）</b>
      </label>
      <div data-ex-group="${esc(g)}" style="display:flex;padding:2px 0 6px 22px;flex-wrap:wrap">${items}</div>
    </div>`;
  }).join('') || '<p class="muted">暂无词条。</p>';
  const ov = document.createElement('div'); ov.id='exCenterPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📦 选择导出 · 写作风格</b><button class="gs-x" data-ex-close title="关闭">✕</button></div>
      <div class="cv-body">
        <div style="margin:6px 0 2px"><b>🎬 组合配方</b> <span class="muted" style="font-size:12px">内置 ${builtinCombos.length} 个（勾段头框全选）</span></div>
        <div data-ex-group="__combo" style="display:flex;padding:2px 0 6px 22px;flex-wrap:wrap">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;flex-basis:100%" title="勾选=全选组合配方">
            <input type="checkbox" data-ex-selall="__combo"> 全选（${builtinCombos.length}）
          </label>
          ${comboHtml}
        </div>
        <div style="margin:10px 0 2px"><b>🏷 我的配方</b> <span class="muted" style="font-size:12px">${myCombos.length} 个</span></div>
        <div data-ex-group="__my" style="display:flex;padding:2px 0 6px 22px;flex-wrap:wrap">
          ${myCombos.length?`<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;flex-basis:100%" title="勾选=全选我的配方"><input type="checkbox" data-ex-selall="__my"> 全选（${myCombos.length}）</label>`:''}
          ${myHtml}
        </div>
        <div style="margin:10px 0 2px"><b>📚 五大类词条</b> <span class="muted" style="font-size:12px">共 ${lib.length} 条（内置+自定义，含已改指令）</span></div>
        ${elHtml}
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid rgba(128,128,128,.2)">
        <span data-ex-sum class="muted" style="flex:1">已选 组合配方 0 · 我的配方 0 · 词条 0</span>
        <button type="button" class="btn small" data-ex-go disabled title="勾选后打包导出写作风格包（.json）">⬇ 导出所选</button>
        <button type="button" class="btn small ghost" data-ex-close>取消</button>
      </div>
    </div>`;
  const close = ()=>{ const p=$('#exCenterPanel'); if(p) p.remove(); };
  ov.addEventListener('change', e=>{
    const t = e.target;
    if(t.matches('[data-ex-selall]')){
      const scope = ov.querySelector(`[data-ex-group="${t.dataset.exSelall}"]`);
      if(scope) scope.querySelectorAll('[data-ex-combo],[data-ex-mycombo]').forEach(cb=>{ cb.checked = t.checked; });
      refreshExSum(ov); return;
    }
    if(t.matches('[data-ex-gall]')){
      const body = ov.querySelector(`[data-ex-group="${t.dataset.exGall}"]`);
      if(body) body.querySelectorAll('[data-ex-el]').forEach(cb=>{ cb.checked = t.checked; });
      refreshExSum(ov); return;
    }
    if(t.matches('[data-ex-combo], [data-ex-mycombo], [data-ex-el]')) refreshExSum(ov);
  });
  ov.addEventListener('click', e=>{
    const cl = e.target.closest('[data-ex-close]'); if(cl){ close(); return; }
    const go = e.target.closest('[data-ex-go]');
    if(go){
      exportStylePack({
        combos:   [...ov.querySelectorAll('[data-ex-combo]:checked')].map(cb=>cb.dataset.exCombo),
        myCombos: [...ov.querySelectorAll('[data-ex-mycombo]:checked')].map(cb=>cb.dataset.exMycombo),
        els:      [...ov.querySelectorAll('[data-ex-el]:checked')].map(cb=>cb.dataset.exEl)
      });
      close(); return;
    }
    if(e.target===ov) close();
  });
  document.body.appendChild(ov);
}
function refreshAiHistBadge(){
  const n = getAiHist().length;
  const card = $('.ai-recipe-card');
  if(card){ const b = card.querySelector('[data-ai-recipe-hist] .ai-hist-badge'); if(b) b.textContent = n||''; }
}
function setChapterTitle(i, title){
  const t = String(title||'').trim();
  const o = state.outline;
  if(o && Array.isArray(o.chapters) && o.chapters[i]){
    const oldT = (o.chapters[i].title||'').trim();
    if(oldT && oldT !== t && o.chapters[i].title !== undefined){
      if(!Array.isArray(o.chTitleHistory)) o.chTitleHistory = [];
      o.chTitleHistory.unshift({ i, title: oldT, ts: Date.now() });
      if(o.chTitleHistory.length > 50) o.chTitleHistory.splice(50);
    }
    o.chapters[i].title = t;
  }
  if(state.chapters && state.chapters[i]) { state.chapters[i].title = t; state.chapters[i]._titleByAI = false; state.chapters[i]._titleFinalized = false; }
  persist();
}
function chTitleHistory(){ const o=state.outline; return (o && Array.isArray(o.chTitleHistory)) ? o.chTitleHistory : []; }
function hasChTitleHistory(){ return chTitleHistory().length > 0; }

function chapterTitleListText(){
  const o = state.outline;
  const arr = (o && Array.isArray(o.chapters)) ? o.chapters : [];
  return arr.map((c,i)=>`第${i+1}章 ${cleanChapterTitle((c&&c.title)||'')}`.replace(/\s+$/,'')).filter(Boolean).join('\n');
}

function bindChapterTitles(){
  const ctFold = $('[data-ct-fold]');
  if(ctFold) ctFold.onclick = ()=>{
    state.ctCollapsed = !state.ctCollapsed; persist();
    const blk = ctFold.closest('.ct-block'); if(blk) blk.classList.toggle('ct-collapsed', state.ctCollapsed);
    const ico = ctFold.querySelector('.ct-fold-ico'); if(ico) ico.textContent = state.ctCollapsed?'▸':'▾';
  };
  const cp = $('[data-ct-copy]');
  if(cp) cp.onclick = ()=>{ copyText(chapterTitleListText()); };
  const ch = $('[data-ct-hist]');
  if(ch) ch.onclick = ()=> openChTitleHistoryPanel();
  const ctb = $('[data-ct-batch]');
  if(ctb) ctb.onclick = ()=> openChTitleBatchPanel();
  $$('[data-ct-edit]').forEach(btn=>{
    btn.onclick = ()=>{
      const i = +btn.dataset.ctEdit;
      const row = $('[data-ct-row="'+i+'"]'); if(!row) return;
      const span = row.querySelector('.ct-title'); if(!span) return;
      $$('.ct-edit-input').forEach(inp=> commitChapterTitle(inp));
      const inp = document.createElement('input');
      inp.className = 'ct-edit-input';
      inp.value = span.textContent;
      span.replaceWith(inp);
      inp.focus(); inp.select();
      inp.onkeydown = e=>{
        if(e.key==='Enter'){ e.preventDefault(); commitChapterTitle(inp); }
        else if(e.key==='Escape'){ commitChapterTitle(inp, true); }
      };
      inp.onblur = ()=> commitChapterTitle(inp);
    };
  });
}

let ctAdviceCand = null;   // {title,text}[] 候选，模块级；重渲会随标签重置
let ctAdviceFold = false;
let ctAdoptedIdx = -1;
function buildCtAdviceCtx(){
  const o = state.outline || {};
  return {
    小说书名: o.title || '',
    小说简介: o.logline || '',
    现有全部章节标题: (o.chapters||[]).map((c,i)=>`第${i+1}章 ${cleanChapterTitle(c&&c.title)}`).join('\n')
  };
}
function ctAiRefinePrompt(ctx, raw){
  const _raw = String(raw||'').trim();
  return { system:[
    '你是资深长篇小说的章标题策划师。用户在"重生成要求"框里可能写了一段补充要求（风格方向、悬念感、字数对仗、避免套路等），也可能留空、只想听你对全部章节标题的专业点评。',
    '请审读给出的【现有全部章节标题】【小说书名】【小说简介】，输出 1–3 条建议（至少 1 条、最多 3 条）；每条 = { title(一句话定位本条侧重), text(完整点评 + 可直接作为重生成要求下发给标题 AI 的可执行命令) }。',
    '【允许"无建议"】若现有标题整体已足够好，就只返回 1 条：{"title":"无建议","text":"现有标题整体稳定，暂不建议改动。"}——宁缺毋滥，不硬凑条数、不胡说。',
    '【点评要点】整套标题风格是否统一、有无重复/呆板/同质化标题、字数是否对仗、悬念与画面感、与书名/简介的契合度、整体节奏感。',
    '【有补充要求时】先满足用户要求（'+ (_raw? _raw.slice(0,120)+'…' : '（用户未给出方向）') +'）的角度，再在该方向之外综合点评；要求为空时直接审读全部标题点评。',
    '【可执行】text 用对标题 AI 说的命令式祈使句，明确范围与幅度，可行时用换行拆 2–3 个可独立启用的子要点；不臆造与书名/简介冲突的新名或专名。',
    '输出仅一个 JSON 数组（1–3 项），无任何讲解、无 markdown 代码块前后缀。每项结构：{ "title":"一句话说明本条侧重什么", "text":"完整点评+可执行命令" }'
    ].join('\n'),
    user: JSON.stringify({ 上下文: ctx, 用户原始要求: (_raw||'(无)') }, null, 1) };
}
async function ctAiRefineAdvice(){
  if(_aiOptBusy){ toast('AI 建议优化中，请稍候'); return; }
  if(genBusy()){ toast('已有生成任务进行中，请稍候'); return; }
  _aiOptBusy = true;
  const inp = $('#rtInput'); if(!inp){ _aiOptBusy = false; return; }
  const raw = inp.value.trim();   // 可空：无补充要求也能生成点评
  const out = $('[data-cth-ai-out]');
  if(out) out.innerHTML = `<p class="muted" style="margin:6px 0 0">⏳ AI 正审读现有全部章节标题并给出优化建议…</p>`;
  const btn = $('[data-cth-ai]'); if(btn){ btn.disabled = true; btn.classList.add('is-busy'); btn.textContent = '生成中…'; }
  try{
    const ctx = buildCtAdviceCtx();
    const {system, user} = ctAiRefinePrompt(ctx, raw);
    const spec = resolveActiveSpec();
    const res = unwrapAIResult(await callDeepSeek(system, user, {temperature: spec.titleTemp, topP:0.5, maxTokens:clampMaxTokens('json'), taskKey:'titleAdvice'}));
    const list = parseAiJsonList(res);
    const ls = Array.isArray(list) ? list.filter(x=> x && String(x.text||'').trim()) : [];
    if(!ls.length) throw new Error('AI 未返回有效建议，请重试');
    if(ls.length===1 && /无建议/.test(String(ls[0].title||'')+' '+String(ls[0].text||''))){
      ctAdviceCand = null; ctAdviceFold = false; ctAdoptedIdx = -1;
      if(out) out.innerHTML = `<p class="muted" style="margin:6px 0 0">💡 ${esc(String(ls[0].text||'现有标题整体稳定，暂不建议改动。').trim())}</p>`;
      _aiOptBusy = false;
      const fBtn = $('[data-cth-ai-unfold]'); if(fBtn) fBtn.style.display = 'none';
      if(btn){ btn.disabled = false; btn.textContent = '✨ 标题优化建议'; btn.classList.remove('is-busy'); }
      return;
    }
    ctAdviceCand = ls.slice(0,3);
    ctAdviceFold = false;
    ctAdoptedIdx = -1;
    addAdvHist('ct', { id: aiHistEntryId(), ts: Date.now(), desc: '标题优化建议', list: JSON.parse(JSON.stringify(ls.slice(0,3))) });
    refreshAdvHistBadge('ct');
  }catch(e){
    ctAdviceCand = null;
    if(out) out.innerHTML = `<p class="muted" style="color:var(--danger);margin:6px 0 0">⚠️ ${esc((e&&e.message)||'生成失败')}</p>`;
  }
  _aiOptBusy = false;
  if(out) out.innerHTML = ctAdviceResultHtml();
  if(btn){ btn.disabled = false; btn.textContent = '✨ 标题优化建议'; btn.classList.remove('is-busy'); }
  const foldBtn = $('[data-cth-ai-unfold]');
  if(foldBtn){
    foldBtn.style.display = (ctAdviceCand && ctAdviceCand.length) ? '' : 'none';
    foldBtn.textContent = ctAdviceFold ? '↗ 展开建议' : '↘ 收起建议';
  }
}
function ctAdviceResultHtml(){
  if(!Array.isArray(ctAdviceCand) || !ctAdviceCand.length) return '';
  if(ctAdviceFold) return '';
  return ctAdviceCand.map((a,ai)=>`
    <div class="advice-ai-cand${ctAdoptedIdx===ai?' adopted':''}" data-cth-ai-pick="${ai}">
      <div class="advice-ai-head">
        <span class="advice-ai-idx">${'①②③'[ai]||(ai+1)}</span>
        <b>${esc(a.title||('方案'+(ai+1)))}</b>
      </div>
      <p>${esc(a.text||'')}</p>
    </div>`).join('');
}
function updateFoldBtn(){
  const foldBtn = $('[data-cth-ai-unfold]');
  if(!foldBtn) return;
  foldBtn.style.display = (ctAdviceCand && ctAdviceCand.length) ? '' : 'none';
  foldBtn.textContent = ctAdviceFold ? '↗ 展开建议' : '↘ 收起建议';
}
function commitChapterTitle(inp, revert){
  if(!inp || inp.dataset.done) return;
  inp.dataset.done = '1';
  const row = inp.closest('[data-ct-row]');
  const i = row ? +row.dataset.ctRow : -1;
  const o = state.outline;
  const oldT = (o && o.chapters && o.chapters[i] && o.chapters[i].title) || ('第'+(i+1)+'章');
  const val = inp.value.trim();
  if(!revert && i>=0 && val) setChapterTitle(i, val);
  const span = document.createElement('span');
  span.className = 'ct-title';
  const finalT = (revert||!val) ? oldT : val;
  span.textContent = finalT;
  span.title = finalT;
  inp.replaceWith(span);
}

function setAllTitles(titles){
  const o = state.outline;
  const n = (o && Array.isArray(o.chapters)) ? o.chapters.length : 0;
  let cnt = 0;
  (titles||[]).forEach((t,i)=>{
    if(i<n && String(t||'').trim()){
      const tt0 = String(t).trim();
      const tt = cleanChapterTitle(tt0) || tt0;   // 入库前剥掉可能重复的"第N章"前缀，只存标题名
      if(o && o.chapters[i]) o.chapters[i].title = tt;
      if(state.chapters && state.chapters[i]) { state.chapters[i].title = tt; state.chapters[i]._titleByAI = false; }
      cnt++;
    }
  });
  persist();
  return cnt;
}

function openChTitleHistoryPanel(){
  closeChTitleHistoryPanel();
  const hist = chTitleHistory(); if(!hist.length){ toast('暂无曾用标题'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const o = state.outline;
  const rows = hist.map((h,idx)=>`
    <div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0"><div class="cv-time">第${h.i+1}章 · ${fmtTs(h.ts)}</div><div class="cv-t" style="font-size:12px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(h.title||'')}</div></div>
      <div class="cv-actions" style="display:flex;gap:6px;flex-shrink:0">
        <button type="button" class="btn ghost cv-b" data-cth-restore="${idx}">↩ 恢复为此标题</button>
        <button type="button" class="btn ghost cv-b" data-cth-del="${idx}">🗑 删除</button>
      </div>
    </div>`).join('');
  const ov = document.createElement('div'); ov.id='cthPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🕘 章节标题 · 单历（${hist.length}/50）</b>
        <button class="gs-x" data-cth-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-div">记录手动修改单章标题的历史，支持一键恢复。</div>
        ${rows}
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-cth-close]').onclick = closeChTitleHistoryPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeChTitleHistoryPanel(); });
  ov.addEventListener('click', e=>{
    const rb = e.target.closest('[data-cth-restore]'); if(!rb) return;
    const h = hist[+rb.dataset.cthRestore]; if(!h) return;
    if(!window.confirm(`把第${h.i+1}章标题恢复为「${h.title}」？`)) return;
    setChapterTitle(h.i, h.title);
    closeChTitleHistoryPanel(); render();
    toast('已恢复该标题');
  });
  ov.addEventListener('click', e=>{
    const db = e.target.closest('[data-cth-del]'); if(!db) return;
    const idx = +db.dataset.cthDel;
    const o2 = state.outline;
    if(o2 && Array.isArray(o2.chTitleHistory)) o2.chTitleHistory.splice(idx,1);
    persist(); closeChTitleHistoryPanel(); render();
    toast('已删除该记录');
  });
}
function closeChTitleHistoryPanel(){ const p=$('#cthPanel'); if(p) p.remove(); }

function chTitleBatches(){ const o=state.outline; return (o && Array.isArray(o.chTitleBatches)) ? o.chTitleBatches : []; }
function snapshotTitleBatch(label){
  const o = state.outline; if(!o) return;
  const titles = (o.chapters||[]).map(c=> (c&&c.title)||'');
  if(!Array.isArray(o.chTitleBatches)) o.chTitleBatches = [];   // fixed: 先挂回 state.outline，persist 才存得住
  const bt = o.chTitleBatches;
  if(bt.length && JSON.stringify(bt[0].titles) === JSON.stringify(titles)) return;
  const d = new Date();
  const t = (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  bt.unshift({ ts: Date.now(), label: `${t} · ${label||'生成批次'}`, titles });
  if(bt.length > 50) bt.length = 50;
  persist();
}
function applyTitleBatch(idx){
  const bt = chTitleBatches(); const b = bt[idx]; if(!b) return;
  const n = (b.titles||[]).length;
  if(!confirm(`整批恢复「${idx+1}. ${b.label||'标题版本'}」（共 ${n} 章）？将覆盖当前全部章节标题。`)) return;
  snapshotTitleBatch('切换前');
  const titles = (Array.isArray(b.titles)?b.titles:[]).map(t=>String(t||'').trim()).filter(Boolean);
  setAllTitles(titles);
  snapshotTitleBatch('本次恢复结果');
  closeTitleBatchPreview(); closeChTitleBatchPanel();
  render();
  toast(`已整批应用该版本标题（${titles.length} 章）`);
}
function deleteTitleBatch(idx){
  const o = state.outline; if(!o) return;
  const bt = chTitleBatches(); if(!bt.length) return;
  bt.splice(idx,1);
  if(!bt.length) delete o.chTitleBatches; else o.chTitleBatches = bt;
  persist();
  closeTitleBatchPreview(); closeChTitleBatchPanel(); openChTitleBatchPanel();
  toast('已删除该版本');
}
function openChTitleBatchPanel(){
  closeChTitleBatchPanel();
  const bt = chTitleBatches();
  if(!bt.length){ toast('暂无批量版本，执行「重生成全部标题」后自动记录'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const rows = bt.map((b,idx)=>`
    <div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0">
        <div class="cv-time">${idx+1}. <b style="color:var(--accent2)">${esc((b.label||'').split(' · ')[0]||fmtTs(b.ts))}</b>${esc((b.label||'').split(' · ')[1]?' · '+b.label.split(' · ')[1]:'')} · ${(b.titles||[]).length} 章</div>
        <div class="cv-t" style="font-size:12px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((b.titles||[]).slice(0,2).join(' / '))||'（空）'}…</div>
      </div>
      <div class="cv-actions" style="display:flex;gap:6px;flex-shrink:0">
        <button type="button" class="btn ghost cv-b" data-batch-view="${idx}">👁 预览</button>
        <button type="button" class="btn primary cv-b" data-batch-apply="${idx}">应用</button>
        <button type="button" class="btn ghost cv-b" data-batch-del="${idx}">🗑</button>
      </div>
    </div>`).join('');
  const ov = document.createElement('div'); ov.id='ctbPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🔁 章节标题 · 批量版本（${bt.length}/50）</b>
        <button class="gs-x" data-ctb-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-div">归档整批章节标题版本，支持预览与快速恢复。</div>
        ${rows}
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-ctb-close]').onclick = closeChTitleBatchPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeChTitleBatchPanel(); });
  ov.querySelectorAll('[data-batch-view]').forEach(b=> b.onclick = ()=> openTitleBatchPreview(+b.dataset.batchView));
  ov.querySelectorAll('[data-batch-apply]').forEach(b=> b.onclick = ()=> applyTitleBatch(+b.dataset.batchApply));
  ov.querySelectorAll('[data-batch-del]').forEach(b=> b.onclick = ()=> deleteTitleBatch(+b.dataset.batchDel));
}
function closeChTitleBatchPanel(){ const p=$('#ctbPanel'); if(p) p.remove(); }
function openTitleBatchPreview(idx){
  closeTitleBatchPreview();
  const bt = chTitleBatches(); const b = bt[idx]; if(!b) return;
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const list = (b.titles||[]).map((t,i)=>`<div class="cv-row"><div class="cv-t" style="font-size:12px">第${i+1}章　${esc(t||'')}</div></div>`).join('') || '<p class="muted">（空批）</p>';
  const ov = document.createElement('div'); ov.id='ctbPreview'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>👁 版本预览 · ${esc(b.label||'标题版本')}（${fmtTs(b.ts)} · ${(b.titles||[]).length} 章）</b>
        <button class="gs-x" data-ctbp-close>✕</button></div>
      <div class="cv-body"><div style="max-height:60vh;overflow:auto">${list}</div></div>
      <div class="modal-actions" style="padding:12px 16px;border-top:1px solid var(--line)">
        <button type="button" class="btn ghost cv-b" data-ctbp-close2>取消</button>
        <button type="button" class="btn primary cv-b" data-ctbp-apply>✔ 应用此版本</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-ctbp-close]').onclick = closeTitleBatchPreview;
  ov.querySelector('[data-ctbp-close2]').onclick = closeTitleBatchPreview;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeTitleBatchPreview(); });
  ov.querySelector('[data-ctbp-apply]').onclick = ()=> applyTitleBatch(idx);
}
function closeTitleBatchPreview(){ const p=$('#ctbPreview'); if(p) p.remove(); }

function titlesGenUser(opts){
  opts = opts || {};
  const o = state.outline || {};
  const parts = [];
  const canonical=currentCanonicalStoryStrategy(); const human=(canonical&&(canonical.humanView||canonical.creationBlueprint))||{};
  const txt=String(human.optimizedIdea||'').trim();
  parts.push(canonicalStoryStrategyBlock('章节标题生成的当前有效故事战略'));
  parts.push(`【采用战略蓝本完整内容（已有信息不可改动）】\n${txt || '（采用蓝本为空）'}`);
  const n = opts.n || ((o.chapters || []).length) || 0;
  if(n){
    parts.push(`请生成恰好 ${n} 个章节标题，每个标题一行、含章号前缀，形如：\n第1章 标题\n第2章 标题\n…\n第${n}章 标题\n行数必须严格等于 ${n}，每个标题名≤18字。只输出纯文本，不要 JSON、不要 markdown 代码块、不要解释。`);
  }
  return parts.join('\n\n');
}

function validateTitleOutput(j, expectedN){
  if(!j || !Array.isArray(j.titles)) return {ok:false, code:'NOT_ARRAY'};
  if(j.titles.length !== expectedN) return {ok:false, code:'COUNT_MISMATCH', details:`${j.titles.length} vs ${expectedN}`};
  const re = /^第\d+章\s+.{1,18}$/;
  const bad = j.titles.map((t,i)=> re.test(String(t||'').trim()) ? null : i).filter(i=>i!==null);
  if(bad.length) return {ok:false, code:'FORMAT_ERROR', details:bad};
  return {ok:true};
}
function buildTitleCandidates(cands, expectedN){
  const valid = cands.filter(c => c && c.ok && c.data && Array.isArray(c.data.titles));
  if(!valid.length) return [];
  const g = (state.outline && state.outline.glossary) || {};
  const names = new Set([
    ...(g.characters||[]).map(x=>String(x.name||'').trim()),
    ...(g.places||[]).map(x=>String(x.name||'').trim()),
    ...(g.propernouns||[]).map(x=>String(x.name||'').trim())
  ]);
  const re = /^第\d+章\s+.{1,18}$/;
  return valid.map(res => {
    const titles = res.data.titles.map(t => String(t||'').trim());
    const clean = titles.map(t => t.replace(/^第\d+章\s+/, ''));
    let s = 0; let dup = 0; let hits = 0;
    titles.forEach(t => { if(re.test(t)) s += 2; });
    for(let i=1;i<clean.length;i++) if(clean[i] === clean[i-1]) dup++;
    clean.forEach(t => { for(const n of names) if(n && t.includes(n)) hits++; });
    s -= dup * 5; s += hits;
    return { valid: titles.length===expectedN && titles.every(t=>re.test(t)), titles, dupRate: dup, glossRate: hits, score: s, raw: res.data };
  }).sort((a,b)=>b.score - a.score);
}
function applyTitleCandidate(cand, n, isRegen){
  const _tr = validateTitleOutput(cand.raw, n);
  if(!_tr.ok) throw new Error(`标题输出校验失败：${_tr.code} ${_tr.details||''}`);
  const titles = cand.titles.filter(Boolean);
  if(isRegen){
    snapshotTitleBatch('重生成前');
    const cnt = setAllTitles(titles);
    snapshotTitleBatch('本次重生成结果');
    const o = state.outline;
    if(Array.isArray(o.chapterPlans) && o.chapterPlans.some(Boolean)){
      toast(`已重生成 ${cnt} 个标题；节拍表可能与新标题不匹配，建议重生成规划师`);
    } else toast(`已重生成 ${cnt} 个章节标题`);
  } else {
    const o0 = state.outline; if(!o0) { toast('请先生成大纲'); return; }
    o0.chapters = titles.map(t=>({ title: t }));
    state.chapters = titles.map((t,i)=>({ title:t, content:'', strip:'', confirmed:false }));
    setAllTitles(titles);
    persist(); render();
    if(Array.isArray(o0.chapterPlans) && o0.chapterPlans.some(Boolean)){
      toast(`已生成 ${titles.length} 个章节标题；节拍表可能与新标题不匹配，建议重生成规划师`);
    } else toast(`已生成 ${titles.length} 个章节标题`);
  }
}

function pickBestTitles(cands, expectedN){
  const ui = buildTitleCandidates(cands, expectedN);
  if(!ui.length) return cands.find(c => c && !c.ok) || {ok:false, error:'所有标题候选均失败'};
  return { ok:true, data: ui[0].raw };
}


function renderBeatsTextHtml(txt){
  txt = cleanBeatDividerTrailer(txt);
  const secRe = /^(承接点|场景链与切换|场景链|逐拍推进|情绪弧|心情弧|情绪基调|必须实体|出场实体|埋设伏笔|收束设计|收束|承接|设定)[：:]/;
  const hasSec = String(txt||'').split('\n').some(ln=>secRe.test(ln.trim()));
  const lines = String(txt||'').split('\n');
  const body = [];
  let openList = false;
  lines.forEach(ln=>{
    const s = ln.trim();
    if(!s){ return; }
    if(secRe.test(s)){
      if(openList){ body.push('</div>'); openList = false; }
      body.push(`<div class="bs-t-sec">${esc(s)}</div>`);
      if(/逐拍推进|场景链|承接点/.test(s)){ body.push('<div class="bs-t-lines">'); openList = true; }
      return;
    }
    if(/^(\d+[\.、:：\)）]|[-•·]\s|[①-⑩])/.test(s)){
      if(!openList){ body.push('<div class="bs-t-lines">'); openList = true; }
      body.push(`<div class="bs-t-li">${esc(s)}</div>`);
      return;
    }
    if(openList){ body.push('</div>'); openList = false; }
    body.push(`<div class="bs-t-ln">${esc(s)}</div>`);
  });
  if(openList) body.push('</div>');
  if(!hasSec && !body.some(x=>x.startsWith('<div class="bs-t-sec">'))){
    return `<div class="bs-beats-text bs-beats-plain"><pre>${esc(txt||'')}</pre></div>`;
  }
  return `<div class="bs-beats-text">${body.join('')}</div>`;
}
function microBeatBlock(){
  const curBeat = BEAT_OPTIONS.find(b=>b.id===currentBeatId()) || {};
  return `<div class="card cp-card beat-card card-theme-microbeat">
    <div class="cp-head card-head-bar" style="cursor:default">
      <div class="ch-left">
        <span class="ch-badge ch-badge-microbeat">🥁</span>
        <h3 class="ch-title">章节微拍节奏</h3>
        <span class="ch-subtag ch-subtag-microbeat">${esc(curBeat.label || '微五拍')}</span>
      </div>
      <div class="ch-right">
        <span class="muted" style="font-size:12px">段落推进节拍</span>
      </div>
    </div>
    <div class="cp-body">
      <div class="cp-micropick">
        <div class="cp-micropick-title">选择章节推进节奏</div>
        <div class="cp-micropick-opts">
          ${BEAT_OPTIONS.map(b=>`
            <label class="cp-micropick-item ${b.id===currentBeatId()?'sel':''}" data-micropick="${b.id}" title="${esc(b.desc||'')}">
              <span class="cp-micropick-ic">${b.emoji||'🥁'}</span>
              <span class="cp-micropick-txt">
                <b>${esc(b.label)}</b>
                <i>${esc(b.desc||'')}</i>
              </span>
              <input type="radio" name="cpMicroPick" value="${b.id}" ${b.id===currentBeatId()?'checked':''} style="display:none">
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

function schoolPipelineProgress(){
  const run = state._schoolRunning;
  const stepDefs = [
    { key:'dictMaster', icon:'📖 ', label:'词典达人', title:'词典达人：设定架构。点击单独重跑' },
    { key:'dictEnrich', icon:'🗂 ', label:'词典充实', title:'词典充实：细化与描写工坊。点击单独重跑' },
    { key:'principal',  icon:'👑 ', label:'校长',     title:'校长：全局写作守则与标题总表。点击单独重跑' },
    { key:'teacher',    icon:'🎓 ', label:'老师',     title:'老师：逐章编写六栏目教案。点击单独重跑' }
  ];
  const doneCount = stepDefs.filter(s => getSchoolStepStatus(s.key).isDone).length;
  const pct = Math.round((doneCount / 4) * 100);
  const topMsg = run ? `⚡ <b>一键开学进行中</b>（${run.stepIndex+1}/4 · ${esc(run.label)}）…` : '⏳ 设定就绪 → 学校开学（四步标准管线）';

  const buttonsHtml = stepDefs.map(s => schoolStepBtn(s.key, s.icon, s.label, s.title)).join('');

  return `<div class="sc-pipeline">
    <div class="sc-pipe-top"><span class="sc-pipe-t">${topMsg}</span><span class="sc-pipe-m">${doneCount}/4 步就绪 · ${pct}%</span></div>
    <div class="sc-pipe-bar"><span class="sc-pipe-in" style="width:${pct}%"></span></div>
    <div class="sc-pipe-steps">
      ${buttonsHtml}
    </div>
  </div>`;
}

function schoolZoneBlock(){
  const groups = schoolStageGroups();
  const pTitles = (state.school && state.school.principal && Array.isArray(state.school.principal.titles)) ? state.school.principal.titles : [];
  const titlesApplied = isPrincipalTitlesApplied();
  const tBody = groups.length
    ? groups.map((g,i)=> schoolTeacherBtn(g,i)).join('')
    : `<div class="sc-teachers-ph">🎓 老师备课区：生成大纲后按节拍自动分配分段。</div>`;
  const stepKeys = ['dictMaster','dictEnrich','principal','teacher'];
  const doneSteps = stepKeys.filter(k => getSchoolStepStatus(k).isDone).length;
  const pct = Math.round(doneSteps / 4 * 100);
  const run = state._schoolRunning;
  return `<div class="card cp-card school-card card-theme-school">
    <div class="cp-head card-head-bar">
      <div class="ch-left">
        <span class="ch-badge ch-badge-school">🏛️</span>
        <h3 class="ch-title">编剧学院 · 统筹与教案</h3>
        <span class="ch-subtag ch-subtag-school">${doneSteps}/4 步就绪 · ${pct}%</span>
      </div>
      <div class="ch-right">
        ${pTitles.length ? `<button type="button" class="sc-plan-btn sc-plan-apply-t ${titlesApplied?'applied':''}" data-scp-apply-titles title="${titlesApplied ? '校长已自动选用拟定标题至全书章节；点击可再次全量覆盖同步' : '一键选用校长拟定标题至全书章节'}">${titlesApplied ? `✓ 校长标题已选用 (${pTitles.length}章)` : `✨ 选用拟定标题 (${pTitles.length}章)`}</button>` : ''}
        <button type="button" class="sc-plan-btn sc-plan-pr" data-scp-plan-pr title="查看写作守则与章节总表">📋 读校长成果</button>
      </div>
    </div>
    <div class="cp-body">
      <div class="school-zone">
        <div class="school-zone-head">
          <span>👑 校长（总控） → 🎓 老师（分段教案） → ✍️ 正文作家</span>
          <em class="school-zone-tip">${groups.length ? (groups.length > 1 ? `${groups.length} 位老师分段` : `1 位老师全书教案`) : '待设定章节数'}</em>
        </div>
        ${schoolPipelineProgress()}
        <div class="school-steps">
          <div class="school-steps-main">
            <button type="button" class="sc-step sc-runall ${run?'running':''}" data-scp-all title="一键按序运行词典达人、词典充实、校长统筹与老师备课，标题自动定稿">${run ? `⚡ 一键开学中（${run.stepIndex+1}/${run.totalSteps} · ${esc(run.label)}）…` : '⚡ 一键开学（全链路备课）'}</button>
          </div>
        </div>
        <div class="school-teachers">
          ${tBody}
        </div>
      </div>
      <!-- 完成声音 + 音量：单个完成 / 全部完成 的音色在顶部 🎨 主题面板挑选，这里只留开关与音量 -->
      <div class="cp-sound-tool">
        <label class="cps-switch" title="某一步完成响「单个完成」音；学校一键全跑完响「全部完成」音">
          <input id="cpsSoundDone" type="checkbox">
          <span class="cps-wrap"><i>🔔</i><b>完成声音</b></span>
        </label>
        <label class="cps-vol" title="提醒音音量">
          <span>🔊</span>
          <input id="cpsSoundVol" type="range" min="0" max="100" step="5" value="80">
          <em id="cpsSoundVolLb" class="muted">80%</em>
        </label>
      </div>
    </div>
  </div>`;
}

function bindChapterPlanFold(){
  const head = $('[data-cp-fold]');
  if(!head) return;
  head.onclick = (e)=>{
    if(e.target.closest('[data-cp-all]') || e.target.closest('[data-cp-stage]') || e.target.closest('[data-cp-enrich]') || e.target.closest('[data-cp-raw]') || e.target.closest('.stop-btn')) return;
    state.cpCollapsed = !state.cpCollapsed;
    persist();
    const body = $('.cp-body'); if(body) body.hidden = state.cpCollapsed;
    const ico = head.querySelector('.cp-arrow'); if(ico) ico.textContent = state.cpCollapsed ? '▸' : '▾';
  };
}
function bindChapterPlan(){
  bindSchoolSteps();   // 学校模式：校长/老师/一键开学 按钮绑定
}

function bindBeatSheet(){
  const o = state.outline; if(!o) return;
  const _tmBd = document.querySelector('[data-cp-time-board]');
  if(_tmBd) _tmBd.onclick = ()=> openTimelineBoard();
  bindPlannerSoundTool();
}

function glossaryFieldCheck(){
  const g = (state.outline && state.outline.glossary) || {};
  const rows = [];
  (g.characters||[]).forEach(c=>{
    const missing = CHAR_FIELDS.filter(k=> c[k]==null || String(c[k]).trim()==='');
    const unknown = CHAR_FIELDS.filter(k=> String(c[k]||'').trim()==='未知');
    if(missing.length || unknown.length) rows.push({ name: String(c.name||'未命名').trim(), missing, unknown });
  });
  return rows;
}
function glossaryCheckCount(){ return glossaryFieldCheck().length; }
function parseAgeNum(v){
  if(v==null) return null;
  const s = String(v).replace(/[，。、；：,.；\s\/~\-]/g,'');
  const m = s.match(/([0-9一二三四五六七八九十百]+)/g);
  if(!m) return null;
  const n = m[m.length-1];
  const c = n.match(/^[0-9]+$/) ? parseInt(n,10) : /^[一二三四五六七八九十]{1,2}$/.test(n) ? (Array.from(n).reduce((a,ch)=>{const t={'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10}[ch]; return a + (ch==='十'?(a?10:0):t);},0)||10) : null;
  return c;
}
function auditGlossaryPlausibility(){
  const g = (state.outline && state.outline.glossary) || {};
  const EXEMPT = /长生|修仙|修者|转世|穿越|永生|不朽|不老|活了几百|活了一百|千百岁|岁月如刀|修真|修仙界|活了\s*\d+\s*岁|永世|不死不灭|寿元/;
  const rows = [];
  (g.characters||[]).forEach(c=>{
    const name = String(c.name||'未命名').trim();
    const ageStr = String(c.age||'').trim();
    if(!ageStr) return;
    const n = parseAgeNum(ageStr);
    if(n==null) return;
    const txt = ['identity','hobby','relation','trait'].map(k=>String(c[k]||'')).join('，');
    if(EXEMPT.test(txt)) return;                       // 超自然豁免：不校验数值
    const yre = txt.match(/(?:已|在此|从小|在这|于此|待了)?\s*([0-9一二三四五六七八九十]+)\s*年(?:了|的|多|整)?/g) || [];
    yre.forEach(ym=>{
      const m = ym.match(/([0-9一二三四五六七八九十]+)/);
      const yrs = m ? parseAgeNum(m[1]) : null;
      if(yrs!=null && yrs>1 && n<yrs+2){
        rows.push({ name, reason:`设定提到「${ym.trim()}」，但年龄仅${ageStr}，疑似自相矛盾（软提示，可人工修正）` });
      }
    });
    if(/父|母|父亲|母亲|亲/.test(txt) && n<=8){ rows.push({ name, reason:`年龄${ageStr}却担"父亲/母亲"类亲老关系，疑似过早（软提示，可人工修正）` }); }
  });
  const seen = {}; const out = [];
  rows.forEach(r=>{ if(!seen[r.name]){ seen[r.name]=1; out.push(r); } });
  return out;
}
function plausibilityCount(){ return auditGlossaryPlausibility().length; }
function openGlossaryCheckPanel(){
  closeGlossaryCheckPanel();
  const rows = glossaryFieldCheck();
  const plaus = auditGlossaryPlausibility();
  const plausBody = plaus.length ? `<div class="cv-div" style="margin-top:8px">⚠️ 属性自洽软提示（${plaus.length}）：以下为低置信猜测，可能与修仙/转世/长生等设定冲突而误报，可人工修正或忽略，不影响流程。</div>` + plaus.map(r=>
    `<div class="cv-row"><div class="cv-meta" style="flex:1;min-width:0">
      <div class="cv-time">${esc(r.name)}</div>
      <div class="cv-t" style="font-size:12px;line-height:1.6"><span class="gs-unk">自洽：${esc(r.reason)}</span></div>
    </div></div>`
  ).join('') : '';
  const body = rows.length ? rows.map(r=>{
    const m = r.missing.map(k=>CHAR_FIELD_LABEL[k]).join('、');
    const u = r.unknown.map(k=>CHAR_FIELD_LABEL[k]).join('、');
    return `<div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0">
        <div class="cv-time">${esc(r.name)}</div>
        <div class="cv-t" style="font-size:12px;line-height:1.6">
          ${m?`<span class="gs-miss">缺失：${m}</span>`:''} ${u?`<span class="gs-unk">未知：${u}（建议补全）</span>`:''}
        </div>
      </div>
    </div>`;
  }).join('') : '<p class="muted">✅ 全部人物字段齐全（身份/岁数/性别/外貌/爱好/关系/性格），无缺失、无未知。</p>';
  const ov = document.createElement('div'); ov.id='gsCheckPanel'; ov.className='gs-overlay';
  ov.innerHTML = `<div class="gs-modal">
    <div class="gs-modal-head"><b>🔍 词典人物字段检查（${rows.length}）</b><button class="gs-x" data-gsck-close>✕</button></div>
    <div class="cv-body">
      <div class="cv-div">人物关键设定将注入章节写作，建议补全缺失字段以保障一致性。</div>
      ${body}
      ${plausBody}
    </div></div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-gsck-close]').onclick = closeGlossaryCheckPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeGlossaryCheckPanel(); });
}
function closeGlossaryCheckPanel(){ const p=$('#gsCheckPanel'); if(p) p.remove(); }

function openGlossaryNewPanel(){
  closeGlossaryNewPanel();
  const o = state.outline; if(!o){ toast('尚无词典'); return; }
  const gl = o.glossary || {characters:[], places:[], propernouns:[]};
  const seen = Number(state._glossSeenTs) || 0;
  const kinds = [['characters','人物','char'],['places','地点','place'],['propernouns','专名','proper']];
  const flat = ()=> kinds.flatMap(([k,lab,type])=> (gl[k]||[]).map((x,i)=> ({x, k, lab, type, i})))
    .filter(r=> r.x && r.x._auto && (r.x._srcTs||0) > seen)
    .sort((a,b)=> (b.x._srcTs||0) - (a.x._srcTs||0));
  const rows = flat();
  const fmtTs = ts => new Date(ts||Date.now()).toLocaleString('zh-CN',{hour12:false});
  const srcLabel = x => x._srcCh ? `来自第 ${x._srcCh} 章` : (x._srcHow || '批量提取');
  const body = rows.length ? rows.slice(0,50).map((r,pos)=>`
    <div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0">
        <div class="cv-time">${esc(r.lab)} · ${esc(String(r.x.name||'').trim())}</div>
        <div class="cv-t" style="font-size:12px;line-height:1.6"><span class="gs-unk">${esc(srcLabel(r.x))} · ${fmtTs(r.x._srcTs)}</span></div>
      </div>
      <button type="button" class="btn ghost gs-tool" data-gsn-locate="${pos}" title="在词典中展开并高亮该条目">定位</button>
      <button type="button" class="btn ghost gs-tool" data-gsn-remove="${pos}" title="从词典移除该条目">移除</button>
    </div>`).join('') : '<p class="muted">✅ 暂无未读的自动入典新实体。</p>';
  const ov = document.createElement('div'); ov.id='gsNewPanel'; ov.className='gs-overlay';
  ov.innerHTML = `<div class="gs-modal">
    <div class="gs-modal-head"><b>🆕 最近自动入典（${rows.length}${rows.length>50?'，显示前 50 条':''}）</b><button class="gs-x" data-gsn-close>✕</button></div>
    <div class="cv-body">
      <div class="cv-div">展示新自动入典的实体条目与来源。</div>
      ${body}
    </div>
    <div style="padding:10px 14px;border-top:1px solid rgba(127,127,127,.25);display:flex;gap:8px;justify-content:flex-end">
      <button type="button" class="btn ghost" data-gsn-seen ${rows.length?'':'hidden'}>全部标为已读</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-gsn-close]').onclick = closeGlossaryNewPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeGlossaryNewPanel(); });
  $$('[data-gsn-locate]', ov).forEach(b=> b.onclick = ()=>{
    const r = flat()[+b.dataset.gsnLocate]; if(!r) return;
    closeGlossaryNewPanel();
    state.gsCatFold = state.gsCatFold || {};
    if(r.type==='char'){ state.gsCatFold.main = false; state.gsCatFold.support = false; }
    else state.gsCatFold[r.type] = false;
    persist(); renderGlossaryOnly();
    const box = $(`[data-gs-entry="${r.type}:${r.i}"]`);
    if(box){
      box.classList.add('open'); const ico = box.querySelector('.gs-fold-ico'); if(ico) ico.textContent='▾';
      box.scrollIntoView({behavior:'smooth', block:'center'});
      box.classList.add('gs-flash'); setTimeout(()=> box.classList.remove('gs-flash'), 1600);
    }
  });
  $$('[data-gsn-remove]', ov).forEach(b=> b.onclick = ()=>{
    const r = flat()[+b.dataset.gsnRemove]; if(!r) return;
    if(!confirm(`从词典移除「${String(r.x.name||'').trim()}」？（${srcLabel(r.x)}）`)) return;
    const arr = gl[r.k] || []; const gi = arr.indexOf(r.x); if(gi>=0) arr.splice(gi,1);
    persist(); renderGlossaryOnly(); closeGlossaryNewPanel(); openGlossaryNewPanel();   // 重开以刷新列表与角标
  });
  const seenBtn = ov.querySelector('[data-gsn-seen]');
  if(seenBtn) seenBtn.onclick = ()=>{ state._glossSeenTs = Date.now(); persist(); renderGlossaryOnly(); closeGlossaryNewPanel(); toast('已全部标为已读'); };
}
function closeGlossaryNewPanel(){ const p=$('#gsNewPanel'); if(p) p.remove(); }

function glossaryCardHtml(){
  const g = (state.outline && state.outline.glossary) || {characters:[], places:[], propernouns:[]};
  const gl = ()=>state.outline.glossary = state.outline.glossary || {characters:[],places:[],propernouns:[]};
  const empty = !(g.characters&&g.characters.length) && !(g.walkons&&g.walkons.length) && !(g.places&&g.places.length) && !(g.propernouns&&g.propernouns.length) && !(g.subplots&&g.subplots.length);
  const hasBody = state.chapters.some(c=>c && c.content);   // 是否有正文可做覆盖面统计（阶段4）
  const seen = Number(state._glossSeenTs) || 0;
  const newCount = [...(g.characters||[]), ...(g.places||[]), ...(g.propernouns||[])].filter(x=> x && x._auto && (x._srcTs||0) > seen).length;
  const tools = `<span class="gs-tools">
    <button type="button" class="btn ghost gs-tool" data-gs-history>🕘 历史更改</button>
    <button type="button" class="btn ghost gs-tool" data-gs-check ${glossaryCheckCount()+plausibilityCount()?'':'hidden'} title="人物 7 字段完整性 + 属性自洽软审计：缺失/未知标出，建议补全">🔍 字段检查${(glossaryCheckCount()+plausibilityCount())?`<b class="gs-check-badge" ${plausibilityCount()&&!glossaryCheckCount()?'style="background:#b8860b"':''}>${glossaryCheckCount()||plausibilityCount()}</b>`:''}</button>
    <button type="button" class="btn ghost gs-tool" data-gs-coverage ${hasBody?'':'hidden'}>?? 覆盖面</button>
    <button type="button" class="btn ghost gs-tool" data-gs-new ${newCount?'':'hidden'} title="查看最近自动入典的新实体（来源章节 + 实际入库时间）">🆕 新增${newCount?`<b class="gs-check-badge">${newCount}</b>`:''}</button>
    <button type="button" class="btn ghost gs-tool" data-gs-extract ${hasBody?'':'hidden'} title="从已生成正文提取词典未收录的新人物/地名/专名并入库">📥 提取新增</button>
    <button type="button" class="btn ghost gs-tool" data-gs-clean ${hasBody?'':'hidden'} title="清理在全部已生成正文中均未出现的条目（如重生成覆盖后失效的旧人物）">🧹 清理未使用</button>
    <button type="button" class="btn ghost gs-tool" data-gs-export>📤 导出 JSON</button>
    <button type="button" class="btn ghost gs-tool" data-gs-import>📥 导入 JSON</button>
    <label class="gs-autofill" title="每章生成后自动吸收副线进度；只有章节正文 AI 会新增/推进副线"><input type="checkbox" data-gs-subfill ${state.subAutoFill?'checked':''} /> 副线追踪</label>
    <button type="button" class="btn ghost gs-tool" data-gs-subboard ${(g.subplots&&g.subplots.length)?'':'hidden'} title="列出未收束且消失过久的副线，提示是否安排回归">🧵 副线看板</button>
    <input type="file" id="gsImportFile" accept=".json,application/json" hidden />
  </span>`;
  if(empty) return `<div class="card gs-card card-theme-glossary"><div class="gs-card-head card-head-bar"><div class="ch-left"><span class="ch-badge ch-badge-glossary">📇</span><h3 class="ch-title">设定表 · 万物词典总览</h3><span class="ch-subtag ch-subtag-glossary">待生成</span></div><div class="ch-right"><span class="muted" style="font-size:12px">一致性基准</span></div></div><div class="gs-card-body">${tools}<p class="sub">生成大纲后自动确立全书万物词典基准。</p></div></div>`;
  const fmt = (o, keys)=>{ const ks = (keys||[]).filter(k=>o[k]); return ks.map(k=>o[k]).join(' · '); };
  const entry = (o, type, i, nameKeys, detailKeys)=>{
    const name = o.name || '';
    const brief = fmt(o, nameKeys);
    const newTag = (o._auto && (o._srcTs||0) > (Number(state._glossSeenTs)||0)) ? `<span class="gs-newtag" title="自动入典：${o._srcCh?('来自第 '+o._srcCh+' 章'):esc(o._srcHow||'批量提取')} · ${new Date(o._srcTs||Date.now()).toLocaleString('zh-CN',{hour12:false})}">🆕${o._srcCh?('·第'+o._srcCh+'章'):''}</span>` : '';
    const flagTag = (type==='char' && o._nameFlag) ? `<span class="gs-nameflag" title="命名待核：${esc(o._nameFlag)}（仅提示不拦截；改名为合规姓名后自动消除）">⚠命名</span>` : '';
    const relField = (type==='char') ? `<label class="gs-f gs-rel-f"><span>${kLabel('relation')}<span class="muted" style="font-weight:400">（摘要·只读）</span></span><div class="gs-rel-ro"><span class="gs-rel-val">${String(o.relation||'').trim()?esc(String(o.relation).trim()):'<span class="muted">（无摘要）</span>'}</span><button type="button" class="btn ghost gs-tool gs-rel-btn" data-gs-rel-edit title="人物关系的逐条明细统一在「人物关系表」中维护（点击直接打开编辑，正文据此写作）">✏️ 去人物关系表编辑</button></div></label>` : '';
    const tierField = (type==='char') ? `<label class="gs-f"><span>类别</span><select data-gs-set="char" data-gs-idx="${i}" data-gs-key="tier" data-orig="${esc(charTierOf(o))}">
      <option value="main" ${charTierOf(o)==='main'?'selected':''}>主要人物</option>
      <option value="support" ${charTierOf(o)==='support'?'selected':''}>次要配角</option>
    </select></label>` : '';
    const detail = tierField + relField + detailKeys.filter(k=>k!=='relation').map(k=>({k, v:o[k]})).filter(x=>x.v).map(x=>`<label class="gs-f"><span>${kLabel(x.k)}</span><input type="text" data-gs-set="${type}" data-gs-idx="${i}" data-gs-key="${x.k}" data-orig="${esc(x.v)}" value="${esc(x.v)}" /></label>`).join('');
    return `<div class="gs-entry" data-gs-entry="${type}:${i}">
      <div class="gs-head" role="button" tabindex="0" data-gs-toggle="${type}:${i}">
        <span class="gs-fold-ico">▸</span>
        <input type="text" class="gs-name" data-gs-name="${type}:${i}" data-orig="${esc(name)}" value="${esc(name)}" placeholder="名称" />
        <span class="gs-brief">${esc(brief||'（无简介，点击展开编辑）')}</span>
        ${newTag}
        ${flagTag}
      </div>
      <div class="gs-detail">
        ${detail}
      </div>
    </div>`;
  };
  const kLabel = k => ({name:'名称', identity:'身份', age:'岁数', gender:'性别', appearance:'外貌', hobby:'爱好', mannerism:'小动作/口头禅', catchphrase:'口头禅', relation:'关系', trait:'性格', type:'类型', note:'说明', question:'核心问题', pivot:'蝴蝶效应'}[k]||k);
  const charEntries = (g.characters||[]);
  const walkonEntries = (g.walkons||[]).map((w,i)=>entry(w,'walkon',i,['note'],['note'])).join('');
  const charTierOf = c => (c && c.tier==='support') ? 'support' : 'main';   // 旧存档无 tier → 视作主要人物
  const grpCharEntries = tierKey => charEntries.map((c,i)=> (charTierOf(c)===tierKey)
    ? entry(c,'char',i,['identity','gender','age'],['name','identity','age','gender','appearance','hobby','catchphrase','relation','trait'])
    : '').join('');
  const grpCharCount = tierKey => charEntries.filter(c=>charTierOf(c)===tierKey).length;
  const mainChars = grpCharEntries('main');      // 主要人物
  const supportChars = grpCharEntries('support'); // 次要配角
  const places = (g.places||[]).map((p,i)=>entry(p,'place',i,['type','note'],['name','type','note'])).join('');
  const props = (g.propernouns||[]).map((p,i)=>entry(p,'proper',i,['note'],['name','note'])).join('');
  const subStatusOpt = (cur) => SUB_STATUSES.map(s=>`<option value="${s}" ${s===cur?'selected':''}>${s}</option>`).join('');
  const subsHtml = (g.subplots||[]).map((s,i)=>{
    const name = String(s.name||'').trim();
    const st = SUB_STATUSES.includes(s.status) ? s.status : '进行中';
    const arcF = (s.arc&&s.arc.from)||'';
    const arcT = (s.arc&&s.arc.to)||'';
    const ts = (Array.isArray(s.log)?s.log:[]).map(x=>`第${x.ch}章${x.note?`（${x.note.trim()}）`:''}`).join(' → ');
    return `<div class="gs-entry" data-gs-entry="sub:${i}">
      <div class="gs-head" role="button" tabindex="0" data-gs-toggle="sub:${i}">
        <span class="gs-fold-ico">▸</span>
        <input type="text" class="gs-name" data-gs-name="sub:${i}" data-orig="${esc(name)}" value="${esc(name)}" placeholder="副线名" />
        <span class="gs-brief">${esc([st, String(s.question||'').trim(), arcF+('→'+arcT||'')].filter(Boolean).join(' · ')||'（点击展开编辑）')}</span>
      </div>
      <div class="gs-detail">
        <label class="gs-f"><span>状态</span><select data-gs-set="sub" data-gs-idx="${i}" data-gs-key="status" data-orig="${esc(st)}">${subStatusOpt(st)}</select></label>
        <label class="gs-f"><span>核心问题</span><input type="text" data-gs-set="sub" data-gs-idx="${i}" data-gs-key="question" data-orig="${esc(String(s.question||'').trim())}" value="${esc(String(s.question||'').trim())}" placeholder="本副线提出的核心问题（必须回答）" /></label>
        <label class="gs-f"><span>起点状态</span><input type="text" data-gs-set="sub" data-gs-idx="${i}" data-gs-key="arcfrom" data-orig="${esc(arcF)}" value="${esc(arcF)}" placeholder="A 状态" /></label>
        <label class="gs-f"><span>当前状态</span><input type="text" data-gs-set="sub" data-gs-idx="${i}" data-gs-key="arcto" data-orig="${esc(arcT)}" value="${esc(arcT)}" placeholder="B 状态" /></label>
        <label class="gs-f"><span>蝴蝶效应</span><input type="text" data-gs-set="sub" data-gs-idx="${i}" data-gs-key="pivot" data-orig="${esc(String(s.pivot||'').trim())}" value="${esc(String(s.pivot||'').trim())}" placeholder="有才填：此副线变化如何影响主线（绝不硬造）" /></label>
        <div class="gs-f"><span>进度（只读）</span><div class="gs-sub-progress">${esc(ts||'（暂无进度）')}</div></div>
        <button type="button" class="btn ghost gs-tool" data-gs-subpop="${i}" title="删除最后一条进度（供纠偏，不会改历史）">↩ 回退一步</button>
      </div>
    </div>`;
  }).join('');
  const collapsed = !!state.gsCollapsed;
  const total = (g.characters||[]).length + (g.walkons||[]).length + (g.places||[]).length + (g.propernouns||[]).length + (g.subplots||[]).length;
  const vRel=validAssoc(g._relationshipTable,'a','b').length;
  const vPC=validAssoc(g._placeContacts,'from','to').length;
  const vPRC=validAssoc(g._properContacts,'from','to').length;
  const vWR=(g._worldRules||[]).filter(x=>x&&String(x.rule||'').trim()).length;
  const histN = Array.isArray(g._relTableHistory) ? g._relTableHistory.length : 0;
  const viewGrid = `<div class="gs-viewgrid">
    <span class="gs-tools gvt-hist-pos"><button type="button" class="btn ghost gs-tool" data-gvth-badge title="人物关系表 / 地名关联表 / 专名关联表 / 世界观规则 的编辑历史（最多 6 次，可查看并一键还原）">🕘 4表历史${histN?`<b class="gs-check-badge">${histN}/6</b>`:''}</button></span>
    <div class="gvt-grid-inner">
    <button type="button" class="btn ghost gs-tool" data-gs-view="rel" title="查看/编辑人物关系表">👥 人物关系表（${vRel}）</button>
    <button type="button" class="btn ghost gs-tool" data-gs-view="pc" title="查看/编辑地名关联表">🗺️ 地名关联表（${vPC}）</button>
    <button type="button" class="btn ghost gs-tool" data-gs-view="prc" title="查看/编辑专名关联表">📌 专名关联表（${vPRC}）</button>
    <button type="button" class="btn ghost gs-tool" data-gs-view="wr" title="查看/编辑世界观规则">⚙️ 世界观规则（${vWR}）</button>
    </div>
  </div>`;
  return `<div class="card gs-card card-theme-glossary${collapsed?' gs-collapsed':''}">
    <div class="gs-card-head card-head-bar" role="button" tabindex="0" data-gs-card-toggle style="cursor:pointer">
      <div class="ch-left">
        <span class="ch-badge ch-badge-glossary">📇</span>
        <h3 class="ch-title">设定表 · 万物词典总览</h3>
        <span class="ch-subtag ch-subtag-glossary">${total} 条已收录</span>
      </div>
      <div class="ch-right">
        <span class="gs-card-arrow" style="font-size:14px;color:var(--muted)">${collapsed?'▸':'▾'}</span>
      </div>
    </div>
    <div class="gs-card-body"${collapsed?' style="display:none"':''}>
    ${tools}
    ${viewGrid}
    <p class="sub">有改则改</p>
    <div class="gs-panel" id="gsHistory" hidden><div class="gs-panel-title">🕘 历史更改</div><div id="gsHistoryList"></div></div>
    ${([
        ['main',   '👤 主要人物', mainChars,    grpCharCount('main')],
        ['support','🤝 次要配角', supportChars, grpCharCount('support')],
        ['walkon', '🚶 路人龙套', walkonEntries,(g.walkons||[]).length],
        ['place',  '🗺️ 地点',     places,       (g.places||[]).length],
        ['proper', '📌 专名',     props,        (g.propernouns||[]).length],
        ['sub',    '🧵 副线',     subsHtml,     (g.subplots||[]).length],
      ]).map(([t,lab,body,cnt])=>{
      const fold = !!(state.gsCatFold && state.gsCatFold[t]);
      return `<div class="gs-group${fold?' gs-folded':''}" data-gs-type="${t}" data-gs-catfold>
        <div class="gs-title" role="button" tabindex="0" title="展开/收起">${lab}（${cnt}）<span class="gs-cat-ico">${fold?'▸':'▾'}</span></div>
        ${body||'<span class="muted">（无）</span>'}
      </div>`;
    }).join('')}
    ${glossaryDupNoteHtml()}
    <p class="muted" style="margin:6px 0 0">修改后自动保存生效。</p>
    </div>
  </div>`;
}
function bindGlossary(){
  if(!state.outline || !state.outline.glossary) return;
  const g = state.outline.glossary;
  const getArr = t => t==='char'?(g.characters||[]):t==='walkon'?(g.walkons||[]):t==='place'?(g.places||[]):(t==='proper'?(g.propernouns||[]):(g.subplots||[]));
  const gsHead = $('[data-gs-card-toggle]');
  if(gsHead){
    const toggleCard = ()=>{
      state.gsCollapsed = !state.gsCollapsed;
      persist();
      const card = gsHead.closest('.gs-card');
      const body = card && card.querySelector('.gs-card-body');
      if(body){ body.style.display = state.gsCollapsed ? 'none' : ''; }
      const arrow = gsHead.querySelector('.gs-card-arrow');
      if(arrow) arrow.textContent = state.gsCollapsed ? '▸' : '▾';
      if(state.gsCollapsed){ // 收缩整卡时把所有词条一并折叠（展开整卡时词条保持折叠态，由用户逐个点击展开）
        card && $$('.gs-entry', card).forEach(en=>{ en.classList.remove('open'); const h=en.querySelector('.gs-fold-ico'); if(h) h.textContent='▸'; });
      }
    };
    gsHead.onclick = (e)=>{ if(e.target.closest('.gs-tools')) return; toggleCard(); };
    gsHead.onkeydown = (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); if(e.target.closest('.gs-tools')) return; toggleCard(); } };
  }
  $$('[data-gs-toggle]').forEach(h=>{
    const toggle = ()=>{ const box=h.closest('.gs-entry'); const on=box.classList.toggle('open'); h.querySelector('.gs-fold-ico').textContent = on?'▾':'▸'; };
    h.onclick = (e)=>{
      if(e.target.closest('input.gs-name')) return;   // 编辑名字时不折叠
      toggle();
    };
    h.onkeydown = (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); } };
  });
  $$('[data-gs-catfold]').forEach(grp=>{
    const t = grp.dataset.gsType;
    const toggleCat = ()=>{
      state.gsCatFold = state.gsCatFold || {};
      state.gsCatFold[t] = !state.gsCatFold[t];
      persist();
      grp.classList.toggle('gs-folded', state.gsCatFold[t]);
      const ico = grp.querySelector('.gs-cat-ico'); if(ico) ico.textContent = state.gsCatFold[t]?'▸':'▾';
    };
    const tt = grp.querySelector('.gs-title');
    if(tt){
      tt.onclick = (e)=>{ e.stopPropagation(); toggleCat(); };
      tt.onkeydown = (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleCat(); } };
    }
  });
  $$('[data-gs-name],[data-gs-set]').forEach(inp=>{
    inp.onchange = ()=>{
      const [type, idx] = inp.dataset.gsSet ? [inp.dataset.gsSet, +inp.dataset.gsIdx]
        : inp.dataset.gsName.split(':').map((v,k)=> k===0?v:(+v));
      const arr = getArr(type);
      if(!arr[idx]) return;
      const oldVal = inp.dataset.orig;
      const newVal = inp.value;
      if(newVal === oldVal) return;            // 无实质变化：不记录、不弹窗
      const isName = inp.hasAttribute('data-gs-name');
      const key = isName ? 'name' : inp.dataset.gsKey;
      gsPushUndo();                            // 记录改动前的整本词典（任意模式，供常驻撤销）
      if(type==='sub' && (key==='arcfrom'||key==='arcto')){
        const arcK = key==='arcfrom' ? 'from' : 'to';
        if(!arr[idx].arc) arr[idx].arc = {from:'', to:''};
        arr[idx].arc[arcK] = newVal;
      } else {
        arr[idx][key] = newVal;                  // 再写回 state（保持现状可编辑即存）
        if(isName && type==='char'){
          delete arr[idx]._nameFlag;
          const _on = String(oldVal||'').trim(), _nn = String(newVal||'').trim();
          if(_nn){
            arr[idx]._userName = true;
            if(_on && _on !== _nn){
              if(!Array.isArray(arr[idx]._alias)) arr[idx]._alias = [];
              if(!arr[idx]._alias.includes(_on)) arr[idx]._alias.push(_on);
              syncNameEverywhere(_on, _nn);
            }
          }
        }
      }
      persist();                               // 改动即保存（防误操作丢数据）
      if(type==='char' && key==='tier'){ renderGlossaryOnly(); return; }
      glossaryHistoryPush(`修改 ${isName?'名称':'字段'}「${type}·${idx}」`); // 追加·历史更改记录
      inp.dataset.orig = newVal;               // 该输入框的 basline 更新
      if(isLong() && type!=='sub'){
        openGlossaryPanel({type, idx, isName, key, oldVal, newVal});
      }
    };
  });
  $$('[data-gs-coverage]').forEach(b=> b.onclick = openCoveragePanel);
  $$('[data-gs-check]').forEach(b=> b.onclick = openGlossaryCheckPanel);
  $$('[data-gs-new]').forEach(b=> b.onclick = openGlossaryNewPanel);
  $$('[data-gs-extract]').forEach(b=> b.onclick = ()=>{ manualExtractGlossary(); });
  $$('[data-gs-clean]').forEach(b=> b.onclick = openCleanPanel);
  $$('[data-gs-subfill]').forEach(b=> b.onchange = ()=>{
    state.subAutoFill = b.checked; persist();
    toast(state.subAutoFill ? '副线追踪已开启（每章生成后自动吸收副线进度）' : '副线追踪已关闭（不再自动吸收副线）');
  });
  $$('[data-gs-subpop]').forEach(b=> b.onclick = ()=>{
    const i = +b.dataset.gsSubpop; if(!Number.isFinite(i)) return;
    const sub = (g.subplots||[])[i]; if(!sub || !Array.isArray(sub.log) || !sub.log.length){ toast('该副线暂无进度可回退'); return; }
    gsPushUndo();
    sub.log.pop();
    sub._lastCh = sub.log.length ? Math.max(...sub.log.map(x=>x.ch||0)) : 0;
    persist();
    if(typeof render === 'function') render();
    toast('已回退该副线最后一条进度');
  });
  $$('[data-gs-subboard]').forEach(b=> b.onclick = openSubplotBoard);
  $$('[data-gs-export]').forEach(b=> b.onclick = exportGlossaryJson);
  $$('[data-gs-import]').forEach(b=> b.onclick = ()=> { const f=$('#gsImportFile'); if(f) f.click(); });
  const imp = $('#gsImportFile'); if(imp) imp.onchange = e=>{ const file = e.target.files && e.target.files[0]; if(file) importGlossaryJson(file); e.target.value=''; };
  $$('[data-gs-history]').forEach(b=> b.onclick = ()=>{
    const panel = $('#gsHistory');
    if(!panel) return;
    const show = panel.hidden;
    if(show) renderGlossaryHistory();
    panel.hidden = !show;
    $$('.gs-panel').forEach(p=>{ if(p.id!=='gsHistory') p.hidden = true; }); // 与内容互斥显示
    if(show) b.classList.add('gs-tool-on'); else b.classList.remove('gs-tool-on');
  });
  $$('[data-gs-view]').forEach(b=> b.onclick = ()=> openGlossaryTableView(b.dataset.gsView));
  $$('[data-gs-rel-edit]').forEach(b=> b.onclick = ()=> openGlossaryTableView('rel'));
  $$('[data-gvth-badge]').forEach(b=> b.onclick = openRelTablesHistoryPanel);
  }
function fmtWR(x){
  if(!x || typeof x !== 'object') return '';
  const c=String(x.cat||'').trim(), s=String(x.scope||'').trim(), r=String(x.rule||'').trim();
  const head = `${c?`[${c}]`:''}${s?`·${s}`:''}`.trim();
  return `${head}${head&&r?' ':''}${r}`.trim();
}
function validAssoc(list, ka, kb){
  if(!Array.isArray(list)) return [];
  return list.filter(x=>{
    if(!x || typeof x !== 'object') return false;
    const a=String(x[ka]||'').trim(), b=String(x[kb]||'').trim();
    return !!a && !!b && a!==b;
  });
}
const GVT_CFG = {
  rel: { name:'👥 人物关系表', key:'_relationshipTable', empty:'暂无人物关系记录', fields:[
    {k:'a',  ph:'人物A'}, {k:'relation', ph:'关系'}, {k:'b', ph:'人物B'}, {k:'note', ph:'备注(可选)'} ],
    row:x=>`<div class="dm-rel"><b>${esc(x.a||'')}</b> ←${esc(x.relation||'？')}→ <b>${esc(x.b||'')}</b>${x.note?` <span class="muted">· ${esc(x.note)}</span>`:''}</div>` },
  pc: { name:'🗺️ 地名关联表', key:'_placeContacts', empty:'暂无地名关联记录', fields:[
    {k:'from', ph:'地名A'}, {k:'to', ph:'地名B'}, {k:'relation', ph:'关联'}, {k:'note', ph:'备注(可选)'} ],
    row:x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}${x.note?('：'+esc(x.note)):''}</span></div>` },
  prc: { name:'📌 专名关联表', key:'_properContacts', empty:'暂无专名关联记录', fields:[
    {k:'from', ph:'专名A'}, {k:'to', ph:'专名B'}, {k:'relation', ph:'关联'}, {k:'note', ph:'备注(可选)'} ],
    row:x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}${x.note?('：'+esc(x.note)):''}</span></div>` },
  wr: { name:'⚙️ 世界观规则', key:'_worldRules', empty:'暂无世界观规则（需词典达人生成）', fields:[
    {k:'cat', ph:'类别'}, {k:'scope', ph:'适用范围(可选)'}, {k:'rule', ph:'规则内容'} ],
    row:x=>{ const sc=String(x.scope||'').trim(); return `<div class="dm-wr"><b>${esc(x.cat||'')}${sc?` · ${esc(sc)}`:''}</b><div>${esc(x.rule||'')}</div></div>`; } }
};
function openGlossaryTableView(type){
  const o = state.outline; const g = (o && o.glossary) || {};
  const c = GVT_CFG[type]; if(!c) return;
  const list = Array.isArray(g[c.key]) ? g[c.key].map(x=>({...x})) : [];
  const keyA = type==='rel' ? 'a' : 'from', keyB = type==='rel' ? 'b' : 'to';
  const before = JSON.stringify(g[c.key]||[]);
  const ov = document.createElement('div'); ov.className='gs-overlay';
  const fieldInputs = (x, idx) => c.fields.map(f=>{
    const v = x ? (x[f.k]||'') : '';
    return `<input class="gvt-in" data-gvt-f="${f.k}" data-gvt-i="${idx}" placeholder="${f.ph}" value="${esc(v)}" />`;
  }).join('');
  const renderRows = (rows)=>{
    if(!rows.length) return `<span class="muted">${c.empty}</span>`;
    return rows.map((x,i)=>{
      const key = type==='wr' ? (x.rule||'') : (String(x[keyA]||'') + '↔' + String(x[keyB]||''));
      return `<div class="gvt-row" data-gvt-idx="${i}">
        <div class="gvt-fields">${fieldInputs(x, i)}</div>
        <span class="gvt-prev">${c.row(x)}</span>
        <div class="gvt-ops">
          <button type="button" class="btn ghost gs-tool gvt-del" data-gvt-del="${i}" title="移除该行">🗑</button>
        </div>
      </div>`;
    }).join('');
  };
  const writeBack = ()=>{
    const rows = [];
    ov.querySelectorAll('.gvt-row').forEach(el=>{
      const nr = {}; let any = false;
      el.querySelectorAll('[data-gvt-f]').forEach(inp=>{
        const v = inp.value.trim();
        if(v){ nr[inp.dataset.gvtF] = v; any = true; }
        else nr[inp.dataset.gvtF] = '';
      });
      if(any){
        if(type==='wr'){ if(!String(nr.rule||'').trim()) return; }
        else { if(!String(nr[keyA]||'').trim() || !String(nr[keyB]||'').trim()) return; }
        rows.push(nr);
      }
    });
    const old = JSON.stringify(g[c.key]||[]);
    g[c.key] = rows;
    const changed = old !== JSON.stringify(rows);
    if(changed){ pushRelTablesHistory(type); persist(); }
    return changed;
  };
  const addRow = ()=>{
    const rowsEl = ov.querySelector('.gvt-rows');
    const nr = {}; c.fields.forEach(f=> nr[f.k]='');
    const el = document.createElement('div'); el.className='gvt-row'; el.dataset.gvtIdx='-1';
    el.innerHTML = `<div class="gvt-fields">${fieldInputs(nr, -1)}</div><div class="gvt-prev muted">（新行，填好后点「保存」或按需继续增删）</div><div class="gvt-ops"><button type="button" class="btn ghost gs-tool gvt-del" data-gvt-del="-1" title="丢弃该行">🗑</button></div>`;
    rowsEl.appendChild(el);
  };
  const rowsEl = `<div class="gvt-rows">${renderRows(list)}</div>`;
  ov.innerHTML = `<div class="gs-modal gs-view-modal gvt-modal">
    <div class="gs-modal-head"><b>${c.name}（<span class="gvt-count">${list.length}</span> 条 · 可编辑）</b><button class="gs-x" data-gvt-close>✕</button></div>
    <div class="cv-body" style="max-height:60vh;overflow:auto">
      <p class="muted" style="margin:0 0 8px">直接编辑即可；保存后自动写回万物词典，重新生成正文章节时即套用新值。</p>
      ${rowsEl}
      <button type="button" class="btn ghost gs-tool gvt-add">＋ 新增一行</button>
    </div>
    <div class="gs-actions"><button type="button" class="btn gvt-save">💾 保存</button></div>
  </div>`;
  document.body.appendChild(ov);
  const close = ()=> ov.remove();
  ov.querySelector('[data-gvt-close]').onclick = close;
  ov.addEventListener('click', e=>{ if(e.target===ov) close(); });
  ov.querySelector('.gvt-add').onclick = addRow;
  ov.querySelector('.gvt-save').onclick = ()=>{ writeBack(); const n = (g[c.key]||[]).length; ov.querySelector('.gvt-count').textContent = n; toast(`${c.name}已保存（${n} 条）——重新生成章节即生效`); };
  ov.addEventListener('click', e=>{
    const del = e.target.closest('.gvt-del');
    if(del){ const n=del.dataset.gvtDel; if(n==='-1'){ del.closest('.gvt-row').remove(); return; } const row=del.closest('.gvt-row'); if(row) row.remove(); }
  });
}
function pushRelTablesHistory(srcType){
  const g = state.outline && state.outline.glossary; if(!g) return;
  g._relTableHistory = Array.isArray(g._relTableHistory) ? g._relTableHistory : [];
  const snap = {
    ts: Date.now(), from: srcType,
    rel: (g._relationshipTable||[]).map(x=>({...x})),
    pc:  (g._placeContacts||[]).map(x=>({...x})),
    prc: (g._properContacts||[]).map(x=>({...x})),
    wr:  (g._worldRules||[]).map(x=>({...x}))
  };
  const last = g._relTableHistory[0];
  if(last && JSON.stringify({r:last.rel,p:last.pc,q:last.prc,w:last.wr}) === JSON.stringify({r:snap.rel,p:snap.pc,q:snap.prc,w:snap.wr})) return;
  g._relTableHistory.unshift(snap);
  if(g._relTableHistory.length > 6) g._relTableHistory.length = 6;
  persist();
}
function openRelTablesHistoryPanel(){
  const g = state.outline && state.outline.glossary; if(!g) return;
  const hist = Array.isArray(g._relTableHistory) ? g._relTableHistory : [];
  if(!hist.length){ toast('暂无4表编辑历史'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const fmtRel = arr=>(arr||[]).map(x=>`<div class="dm-rel"><b>${esc(x.a||'')}</b> ←${esc(x.relation||'？')}→ <b>${esc(x.b||'')}</b>${x.note?` <span class="muted">· ${esc(x.note)}</span>`:''}</div>`).join('')||'<span class="muted">（无）</span>';
  const render = (h)=>{
    const wr=(h.wr||[]).map(x=>`<div class="dm-wr"><b>${esc(x.cat||'')}</b><div>${esc(x.rule||'')}</div></div>`).join('')||'<span class="muted">（无）</span>';
    const pc=(h.pc||[]).map(x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}${x.note?('：'+esc(x.note)):''}</span></div>`).join('')||'<span class="muted">（无）</span>';
    const prc=(h.prc||[]).map(x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}${x.note?('：'+esc(x.note)):''}</span></div>`).join('')||'<span class="muted">（无）</span>';
    const srcName = h.from==='rel'?'人物关系表':h.from==='pc'?'地名关联表':h.from==='prc'?'专名关联表':(h.from==='wr'?'世界观规则':'手动编辑');
    return `<div class="dm-prev-meta">${fmtTs(h.ts)} · ${esc(srcName)} · 关系表 ${(h.rel||[]).length} · 地名 ${(h.pc||[]).length} · 专名 ${(h.prc||[]).length} · 规则 ${(h.wr||[]).length} 条</div>
      <div class="dm-tables">
        <details class="dm-fold"><summary>👥 人物关系表（${(h.rel||[]).length}）</summary><div class="dm-rel-table">${fmtRel(h.rel)}</div></details>
        <details class="dm-fold"><summary>🗺️ 地名关联表（${(h.pc||[]).length}）</summary><div class="dm-rel-table">${pc}</div></details>
        <details class="dm-fold"><summary>📌 专名关联表（${(h.prc||[]).length}）</summary><div class="dm-rel-table">${prc}</div></details>
        <details class="dm-fold"><summary>⚙️ 世界观规则（${(h.wr||[]).length}）</summary><div class="dm-rel-table">${wr}</div></details>
      </div>
      <button type="button" class="btn gvt-restore" data-gvt-restore="${hist.indexOf(h)}">↩️ 一键还原到此版本</button>`;
  };
  const ov = document.createElement('div'); ov.className='gs-overlay';
  const idx0 = 0;
  ov.innerHTML = `<div class="gs-modal gs-view-modal gvt-hist-modal">
    <div class="gs-modal-head"><b>🕘 4表历史（${hist.length}/6）</b><button class="gs-x" data-gvth-close>✕</button></div>
    <div class="cv-body" style="max-height:62vh;overflow:auto"><div id="gvthBody" style="display:flex;flex-direction:column;gap:14px">${hist.map((h,i)=>`<div class="gvt-hist-item" data-gvt-item="${i}">${render(h)}</div>`).join('')}</div></div>
    <div class="muted" style="padding:8px 14px">点「还原」会把所选版本的 4 表整体覆盖到当前词典（含重新生成章节时立即生效）。</div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-gvth-close]').onclick = ()=> ov.remove();
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
  ov.addEventListener('click', e=>{
    const r = e.target.closest('[data-gvt-restore]');
    if(!r) return;
    const i = +r.dataset.gvtRestore; const h = hist[i]; if(!h) return;
    g._relationshipTable = (h.rel||[]).map(x=>({...x}));
    g._placeContacts   = (h.pc||[]).map(x=>({...x}));
    g._properContacts  = (h.prc||[]).map(x=>({...x}));
    g._worldRules      = (h.wr||[]).map(x=>({...x}));
    persist(); ov.remove(); toast('已还原 4 表到该历史版本，重新生成章节即生效');
  });
}

let gsUndoStack = [];
const GS_UNDO_MAX = 10;
function gsPushUndo(){
  const g = state.outline && state.outline.glossary;
  if(g) gsUndoStack.push(JSON.stringify(g));
  if(gsUndoStack.length > GS_UNDO_MAX) gsUndoStack.shift();
}
function glossaryHistoryPush(desc){
  const g = state.outline && state.outline.glossary;
  if(!g) return;
  const h = Array.isArray(g._history) ? g._history : (g._history = []);
  h.push({ ts: Date.now(), desc: desc || '修改词典', snapshot: JSON.stringify({characters:g.characters||[], places:g.places||[], propernouns:g.propernouns||[], subplots:g.subplots||[]}) });
  if(h.length > 30) h.splice(0, h.length - 30);
  persist();
}
function renderGlossaryHistory(){
  const list = $('#gsHistoryList');
  if(!list) return;
  const g = state.outline && state.outline.glossary;
  const h = Array.isArray(g && g._history) ? g._history : [];
  if(!h.length){ list.innerHTML = '<p class="muted">暂无历史更改记录。修改词典后会自动记录。</p>'; return; }
  list.innerHTML = h.slice().reverse().map((r,i)=>{
    const idx = h.length - 1 - i;               // 正序索引
    const d = new Date(r.ts);
    const pad = n => n<10?('0'+n):n;
    const t = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    return `<div class="gs-hist-row" data-gs-hist="${idx}">
      <span class="gs-hist-ts">回退到第 ${h.length-idx} 次 · ${t}</span>
      <span class="gs-hist-desc">${esc(r.desc||'')}</span>
      <span class="gs-hist-actions">
        <button type="button" class="btn ghost gs-tool" data-gs-hist-view="${idx}">查看</button>
        <button type="button" class="btn ghost gs-tool" data-gs-hist-restore="${idx}">还原</button>
      </span>
    </div>`;
  }).join('');
  list.querySelectorAll('[data-gs-hist-view]').forEach(b=>{
    b.onclick = ()=>{ try{ applyGlossaryHistorySnapshot(+b.dataset.gsHistView); }catch(e){} };
  });
  list.querySelectorAll('[data-gs-hist-restore]').forEach(b=>{
    b.onclick = ()=>{ applyGlossaryHistorySnapshot(+b.dataset.gsHistRestore); glossaryHistoryPush('还原到历史版本'); };
  });
}
function applyGlossaryHistorySnapshot(idx){
  const g = state.outline && state.outline.glossary;
  const h = Array.isArray(g && g._history) ? g._history : [];
  const r = h[idx]; if(!r) return;
  let snap; try{ snap = JSON.parse(r.snapshot); }catch(e){ return; }
  if(!snap) return;
  g.characters = snap.characters || [];
  g.places = snap.places || [];
  g.propernouns = snap.propernouns || [];
  g.subplots = snap.subplots || [];
  persist();
  const panel = $('#gsHistory'); if(panel) panel.hidden = true;
  if(typeof renderGlossaryOnly === 'function') renderGlossaryOnly(); else render();
  toast('已应用所选历史版本');
}
function exportGlossaryJson(){
  const src = state.pendingGlossary || (state.outline && state.outline.glossary);
  if(!src || (!sourceHasGlossary(src))){ toast('当前没有可导出的词典'); return; }
  const title = (state.outline && state.outline.title) || (state.idea ? state.idea.trim().slice(0,12) : 'story');
  const meta = { _meta:{ title, source:'storyfactory', version:'2.0', exportedAt: new Date().toISOString(), adherence: state.glossAdherence } };
  download(`词典_${title}.json`, JSON.stringify({ ...meta, ...src }, null, 2));
  toast('已导出词典 JSON（含元数据头）');
}
function sourceHasGlossary(g){
  return g && ((g.characters&&g.characters.length)||(g.places&&g.places.length)||(g.propernouns&&g.propernouns.length)||(g.subplots&&g.subplots.length));
}
function glossaryMerge(imported, modelOut, adherence, allowFill){
  const cat = ['characters','places','propernouns'];
  const res = { glossary:{characters:[],places:[],propernouns:[],subplots:[]}, kept:0, added:0, rec:0 };
  const a = (typeof adherence==='number') ? adherence : 100;
  cat.forEach(k=>{
    const imp = (imported&&imported[k])||[];
    const mdl = (modelOut&&modelOut[k])||[];
    const impBy = {};
    imp.forEach(it=>{ const nm=String(it.name||'').trim(); if(nm) impBy[nm]=it; });
    const has = it=>String(it.name||'').trim();
    const tagFlag = it => {
      if(k !== 'characters' || !it) return it;
      if(it._userName){ delete it._nameFlag; return it; }
      const nv = nmNameRuleViolation(String(it.name||'').trim());
      if(nv) it._nameFlag = nv; else delete it._nameFlag;
      return it;
    };
    const out = res.glossary[k];
    if(a < 30){                                       // 几乎放弃：完全采用模型输出
      mdl.forEach(it=>{ if(has(it)){ out.push(tagFlag(it)); res.added++; } });
      return;
    }
    if(a < 50){                                       // 灵感来源：模型为主，仅补同名导入详情
      mdl.forEach(it=>{
        const nm = has(it); if(!nm) return;
        if(impBy[nm]){ out.push(tagFlag(impBy[nm])); res.kept++; }   // 同名以导入版为准（名+详情）
        else { out.push(tagFlag(it)); res.added++; }
      });
      return;
    }
    imp.forEach(it=>{ if(has(it)){ out.push(tagFlag(it)); res.kept++; } });   // a>=50：导入词典为主体
    mdl.forEach(it=>{
      const nm = has(it); if(!nm) return;
      if(impBy[nm]) return;                                          // 重名：一律保留导入版，丢弃模型版（词典保持唯一）
      if(allowFill || a<80){ out.push(tagFlag(it)); res.added++; }            // 新名：a<80 自动补，a>=80 需「允许补充」才补
    });
  });
  return res;
}
function loadGlib(){
  try{ gglib = JSON.parse(localStorage.getItem(KEY_GLIB)) || []; }catch(e){ gglib = []; }
}
function saveGlib(){ try{ localStorage.setItem(KEY_GLIB, JSON.stringify(gglib)); }catch(e){} }
function glibUse(id){
  const it = gglib.find(x=> x.id === id); if(!it) return;
  state.pendingGlossary = it.g;
  persist(); render();
  closeGlibPanel();
  toast(`已选用词典「${it.name}」挂载到本作，可调遵从度后生成大纲`);
}
function glibSave(){
  const src = state.pendingGlossary || (state.outline && state.outline.glossary);
  if(!src || !sourceHasGlossary(src)){ toast('当前没有可入库的词典'); return; }
  const name = prompt('给这套词典起个名字（如：仙侠传·世界观）', (state.outline&&state.outline.title) || '无题词典');
  if(name === null) return;
  const t = name.trim() || ('词典'+(gglib.length+1));
  if(gglib.some(x=> x.name === t)){ if(!confirm('词典库已有同名「'+t+'」，仍要覆盖保存吗？')) return; gglib = gglib.filter(x=> x.name !== t); }
  gglib.push({ id: 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2,6), name:t, savedAt: Date.now(), g: JSON.parse(JSON.stringify(src)) });
  saveGlib(); openGlibPanel();
  toast('已存入词典库：'+t);
}
function glibDel(id){ gglib = gglib.filter(x=> x.id !== id); saveGlib(); openGlibPanel(); }
function closeGlibPanel(){ const p=$('#glibPanel'); if(p) p.remove(); }
function openGlibPanel(){
  closeGlibPanel();
  const ov = document.createElement('div'); ov.id='glibPanel'; ov.className='gs-overlay';
  const itemsHtml = gglib.length ? gglib.map(x=>{
    const n = x.g; const cn=(n.characters||[]).length, pn=(n.places||[]).length, rn=(n.propernouns||[]).length;
    return `<div class="cv-row">
      <b>${esc(x.name)}</b>
      <span class="cv-cnt">👤${cn} · 📍${pn} · 🔤${rn}</span>
      <span class="cv-actions">
        <button class="cv-b btn" data-glib-use="${x.id}">选用</button>
        <button class="cv-b btn" data-glib-del="${x.id}">删除</button>
      </span>
    </div>`;
  }).join('') : '<p class="muted" style="margin:8px 0">还没有保存过词典。先打开一个新长篇并导入/生成词典，点「存入词典库」即可在此汇集多套世界观。</p>';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🗂️ 词典库</b><button class="gs-x" data-glib-close>✕</button></div>
      <div class="gs-body">
        <p class="muted" style="margin:0 0 8px">跨作品汇集可复用词典。点「选用」即挂载到当前新篇的辅轨槽位，之后设置遵从度、生成大纲即可带入。</p>
        ${itemsHtml}
      </div>
      <div class="gs-actions" style="grid-template-columns:1fr 1fr">
        <button class="btn" data-glib-close>关闭</button>
        <button class="btn primary" data-glib-save>＋ 存入当前词典</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-glib-close]').forEach(b=> b.onclick = closeGlibPanel);
  ov.querySelector('[data-glib-save]').onclick = glibSave;
  ov.querySelectorAll('[data-glib-use]').forEach(b=> b.onclick = ()=> glibUse(b.dataset.glibUse));
  ov.querySelectorAll('[data-glib-del]').forEach(b=> b.onclick = ()=>{ if(confirm('从库中删除该词典？不影响已生成作品。')) glibDel(b.dataset.glibDel); });
  ov.addEventListener('click', e=>{ if(e.target===ov) closeGlibPanel(); });
}
function exportWorkGlossaryJSON(id){
  const p = lib.items.find(i=> i.id === id);
  const g = p && p.outline && p.outline.glossary;
  if(!p || !g || !sourceHasGlossary(g)){ toast('该作品暂无可用词典'); return; }
  const meta = { _meta:{ title:p.title||'复用词典', source:'storyfactory', version:'2.0', exportedAt:new Date().toISOString() } };
  download(`词典_${(p.title||'story').slice(0,12)}.json`, JSON.stringify({ ...meta, ...g }, null, 2));
  toast('已导出该作词典 JSON');
}
function normalizeGlossaryJSON(j){
  const src = (j && j._meta) ? j : j;
  const ok = src && typeof src==='object'
    && (Array.isArray(src.characters) || Array.isArray(src.places) || Array.isArray(src.propernouns));
  if(!ok) return null;
  const subs = (Array.isArray(src.subplots)?src.subplots:[]).map(s=>{
    const name = String(s&&s.name||'').trim(); if(!name) return null;
    const st = SUB_STATUSES.includes(s.status) ? s.status : '进行中';
    const log = (Array.isArray(s.log)?s.log:[]).filter(x=>x && Number.isFinite(x.ch)).map(x=>({ch:x.ch, note:String(x.note||'').trim()}));
    return { name, status: st,
      question: String(s.question||'').trim(),
      arc: { from: String((s.arc&&s.arc.from)||'').trim(), to: String((s.arc&&s.arc.to)||'').trim() },
      pivot: String(s.pivot||'').trim(),
      log,
      _lastCh: log.length ? Math.max(...log.map(x=>x.ch)) : 0,
      _auto: !!s._auto };
  }).filter(Boolean);
  return { characters: Array.isArray(src.characters)?src.characters:[], places: Array.isArray(src.places)?src.places:[], propernouns: Array.isArray(src.propernouns)?src.propernouns:[], subplots: subs };
}
function importGlossaryJson(file, target){
  const r = new FileReader();
  r.onload = ()=>{
    try{
      const j = JSON.parse(r.result);
      const g = normalizeGlossaryJSON(j);
      if(!g) throw 0;
      if(!state.outline){ toast('请先生成大纲后再导入词典'); return; }
      if(!state.outline.glossary) state.outline.glossary = {characters:[], places:[], propernouns:[]};
      const cur = state.outline.glossary;
      const CATS = [['characters','人物'],['places','地点'],['propernouns','专名']];
      let hasDup = false;
      CATS.forEach(([k])=>{
        const names = new Set((cur[k]||[]).map(x=>String(x&&x.name||'').trim()).filter(Boolean));
        (g[k]||[]).forEach(it=>{ const nm=String(it&&it.name||'').trim(); if(nm && names.has(nm)) hasDup = true; });
      });
      const overwrite = hasDup && confirm('导入内容与当前词典存在同名条目。\n【确定】同名以导入版覆盖\n【取消】同名保留当前版（只添加我没有的新词条）');
      glossaryHistoryPush('导入词典（合并）前');
      let added=0, kept=0, repl=0;
      const mergeCat = (key)=>{
        const arr = Array.isArray(cur[key]) ? cur[key] : (cur[key] = []);
        const names = new Set(arr.map(x=>String(x&&x.name||'').trim()).filter(Boolean));
        (g[key]||[]).forEach(it=>{
          const nm = String(it&&it.name||'').trim(); if(!nm) return;
          if(names.has(nm)){
            if(overwrite){ const i = arr.findIndex(x=>String(x&&x.name||'').trim()===nm); if(i>=0){ arr[i] = it; repl++; } }
            else kept++;
          } else { arr.push(it); names.add(nm); added++; }
        });
      };
      CATS.forEach(([k])=> mergeCat(k));
      if(Array.isArray(g.subplots) && g.subplots.length) mergeCat('subplots');   // 副线同逻辑（按 name）
      persist(); render();
      toast(`词典已合并导入：新增 ${added} · 同名保留 ${kept} · 同名覆盖 ${repl}`);
    }catch(e){ toast('导入失败：JSON 至少需含 characters/places/propernouns 之一（数组）'); }
  };
  r.readAsText(file);
}

function glossaryAliases(){
  const o = state.outline; const map = new Map();
  if(o && o.glossary) ['characters','places','propernouns'].forEach(k => (o.glossary[k]||[]).forEach(it => {
    const cur = String(it && it.name || '').trim();
    (Array.isArray(it && it._alias) ? it._alias : []).forEach(a => {
      const al = String(a||'').trim();
      if(al && cur && al !== cur && !map.has(al)) map.set(al, cur);
    });
  }));
  return map;
}
function syncNameEverywhere(oldName, newName){
  const o = state.outline; if(!o || !oldName || !newName || oldName === newName) return 0;
  let n = 0;
  const rep = s => { if(s === oldName){ n++; return newName; } return s; };
  if(Array.isArray(o.chapterPlans)) o.chapterPlans.forEach(p => {
    if(!p) return;
    if(Array.isArray(p.requiredEntities)) p.requiredEntities = p.requiredEntities.map(rep);
  });
  if(o.navBeacon && typeof o.navBeacon.protagonist === 'string'){
    const pr = o.navBeacon.protagonist;
    if(pr === oldName){ o.navBeacon.protagonist = newName; n++; }
    else if(pr.indexOf(oldName) === 0 && /^[，,：:（(]/.test(pr.slice(oldName.length))){ o.navBeacon.protagonist = newName + pr.slice(oldName.length); n++; }
  }
  if(o._factCard && o._factCard.characters && o._factCard.characters[oldName] !== undefined){
    o._factCard.characters[newName] = o._factCard.characters[oldName];
    delete o._factCard.characters[oldName];
  }
  return n;
}

function scanGlossaryImpact({type, idx, oldVal, newVal, isName}){
  const g = state.outline.glossary;
  const getArr = t => t==='char'?(g.characters||[]):t==='place'?(g.places||[]):(g.propernouns||[]);
  const arr = getArr(type);
  const entityName = arr[idx] ? arr[idx].name : oldVal;
  const terms = new Set();
  if(isName && oldVal) terms.add(oldVal);      // 改名：扫旧名，找旧章节正文
  else if(entityName) terms.add(entityName);   // 改详情：扫该实体名是否被正文引用
  const hits = state.chapters.map((c,i)=>{
    if(!c || !c.content) return null;
    let n = 0, occurs = 0;
    for(const t of terms){ if(t){ const re = new RegExp(escRe(t), 'g'); const m = String(c.content).match(re); if(m){ n += m.length; occurs++; } } }
    return occurs>0 ? {i, n, title: c.title||('第'+(i+1)+'章')} : null;
  }).filter(Boolean);
  const refs = [];
  const refNames = isName ? [oldVal, newVal] : [entityName];
  ['char','place','proper'].forEach(t=>{
    getArr(t).forEach((it, ii)=>{
      if(t===type && ii===idx) return;
      const tsv = Object.values(it).join(' ');
      for(const rn of refNames){ if(rn && tsv.includes(rn)){ refs.push({t, ii, name: it.name||''}); break; } }
    });
  });
  return {hits, refs, word: isName ? oldVal : entityName};
}
function escRe(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function openGlossaryPanel(info){
  closeGlossaryPanel();
  if(!state.outline || !state.outline.glossary) return;
  const g = state.outline.glossary;
  const getArr = t => t==='char'?(g.characters||[]):t==='place'?(g.places||[]):(g.propernouns||[]);
  const arr = getArr(info.type);
  const itemName = arr[info.idx] ? arr[info.idx].name : '该条目';
  const scan = scanGlossaryImpact(info);
  const hits = scan.hits || [];

  const labels = {name:'名称', identity:'身份', age:'岁数', gender:'性别', appearance:'外貌', hobby:'爱好', mannerism:'小动作/口头禅', catchphrase:'口头禅', relation:'关系', trait:'性格', type:'类型', note:'说明'};
  const kind = info.isName ? `「${info.oldVal||''}」→「${info.newVal||''}」`
    : `「${itemName}」的「${labels[info.key]||info.key||'详情'}」已修改（正文引用该条目 ${scan.word?('出现自 「'+scan.word+'」'):''}）`;
  const hitHtml = hits.length ? hits.map(h=>`
    <label class="gs-hit"><input type="checkbox" class="gs-hit-cb" data-ch="${h.i}" checked />
      <span>第${h.i+1}章 · ${esc(h.title||'')}</span><i>正文出现 ${h.n} 次</i></label>`).join('')
    : `<p class="gs-nohit">✓ 旧名在已生成正文中未出现，无需重塑任何章节。该改动仅对后续新生成章节生效。</p>`;
  const refHtml = scan.refs.length ? `<div class="gs-refs">⚠️ 词典内其它条目仍引用旧名（建议一并核对）：${scan.refs.map(r=>{
    const lab = r.t==='char'?'人物':r.t==='place'?'地点':'专名';
    return `<span class="pill">${lab}「${esc(r.name||'')}」</span>`;
  }).join('')}</div>` : '';

  const names = {char:'人物',place:'地点',proper:'专名'};
  const ov = document.createElement('div');
  ov.id = 'gsPanel';
  ov.className = 'gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📇 词典改动 · 影响范围</b>
        <button class="gs-x" data-gs-close>✕</button></div>
      <p class="gs-modal-sub">检测到你改动了 ${names[info.type]||''}：${kind}</p>
      <div class="gs-body">
        <p class="gs-q"><b>① 会影响的已生成章节（默认全选，可取消个别）：</b></p>
        ${hitHtml}
        ${refHtml}
      </div>
      <div class="gs-actions">
        <button class="btn ghost" data-gs-undo>↩ 回退本次改动</button>
        <button class="btn ghost" data-gs-future>仅对新章生效</button>
        <button class="btn primary" data-gs-regen ${hits.length?'':'disabled'}>⚡ 批量重生成所选章节（${hits.length}）</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-gs-close]').onclick = closeGlossaryPanel;
  ov.querySelector('[data-gs-future]').onclick = ()=>{
    gsUndoStack.pop();   // 已生效，丢弃快照
    closeGlossaryPanel();
    toast('已保存，仅对后续新章生效');
  };
  ov.querySelector('[data-gs-undo]').onclick = ()=>{
    const snap = gsUndoStack.pop();
    if(snap){ try{ state.outline.glossary = JSON.parse(snap); persist(); }catch(e){} }
    closeGlossaryPanel(); renderGlossaryOnly(); toast('已恢复改动前词典');
  };
  const regenBtn = ov.querySelector('[data-gs-regen]');
  if(regenBtn) regenBtn.onclick = ()=>{
    const sel = $$('.gs-hit-cb:checked', ov).map(b=>+b.dataset.ch);
    gsUndoStack.pop();   // 用户已确认批量重生成，丢弃快照（重生成后为新一致性）
    closeGlossaryPanel();
    regenSelectedChapters(sel);
  };
  ov.addEventListener('click', e=>{ if(e.target===ov) closeGlossaryPanel(); });
}
function renderGlossaryOnly(){
  const host = $('#view');
  if(host){ host.innerHTML = viewStory(); bindView(); window.scrollTo({top:100, behavior:'smooth'}); }
}

async function regenSelectedChapters(list){
  if(!list || !list.length) return;
  const panel = document.createElement('div');
  panel.id = 'gsPanel'; panel.className = 'gs-overlay';
  panel.innerHTML = `<div class="gs-modal"><div class="gs-modal-head"><b>⚡ 正在按新词典重生成 ${list.length} 章…</b></div>
    <p class="gs-progress muted">请保持页面打开，逐章推进，不会打断你浏览已生成章节。</p></div>`;
  document.body.appendChild(panel);
  state.generating = true;
  try{
    for(const i of list){
      chState[i]='generating'; patchChapter(i);
      const pg = panel.querySelector('.gs-progress');
      if(pg) pg.textContent = `正在重写第 ${i+1} 章…`;
      try{
        const user = buildChapterUser(i, {regenerating:true});
        const txt = await writeOneChapterContent(i, user);      // 关闭流式，单章连贯
        snapshotChapterVersion(i);
        state.chapters[i].content = txt;
        chState[i]='done'; persist(); patchChapter(i);
      }catch(e){ chState[i]='error'; persist(); patchChapter(i); }
    }
    closeGlossaryPanel();
    renderChapters();
    toast('所选章节已按新词典重生成完成');
  }finally{ state.generating = false; }
}
function closeGlossaryPanel(){ const p=$('#gsPanel'); if(p) p.remove(); }

function ensureChapterHistory(i){
  const c = state.chapters[i]; if(!c) return c;
  if(!Array.isArray(c.history)) c.history = [];
  return c;
}
function snapshotChapterVersion(i){
  const c = ensureChapterHistory(i); if(!c) return;
  const cur = c.content;
  if(cur && String(cur).trim()) c.history.push({ content: cur, ts: Date.now() });
  if(c.history.length > 50) c.history.splice(0, c.history.length - 50); // 上限50防膨胀
}
function chVersions(i){ const c=ensureChapterHistory(i); return c? c.history : []; }
function hasChVersions(i){ return chVersions(i).length > 0; }

function hasEditHistory(i){ const c=state.chapters[i]; return !!(c && Array.isArray(c.editHistory) && c.editHistory.length); }
function undoChapterEdit(i){
  const c = state.chapters[i];
  if(!c || !Array.isArray(c.editHistory) || !c.editHistory.length){ toast('没有可撤销的编辑'); return; }
  c.content = c.editHistory.pop();
  persist(); renderChapters(); updateWcTotal();
  toast('已撤销一次编辑');
}

function openChapterVersionPanel(i){
  closeChapterVersionPanel();
  const c = ensureChapterHistory(i); if(!c) return;
  const title = c.title || ('第'+(i+1)+'章');
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const cur = String(c.content||'');
  const hist = c.history;
  const rows = hist.map((v,origIdx)=>`
    <div class="cv-row">
      <div class="cv-meta"><span class="cv-time">${fmtTs(v.ts)}</span><span class="cv-wc">${(v.content||'').length} 字</span></div>
      <div class="cv-actions">
        <button type="button" class="btn ghost cv-b" data-cv-prev="${origIdx}">预览</button>
        <button type="button" class="btn ghost cv-b" data-cv-restore="${origIdx}">↩ 恢复</button>
      </div>
    </div>`).join('');
  const ov = document.createElement('div'); ov.id='cvPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📚 版本历史 · 第${i+1}章「${esc(cleanChapterTitle(title))}」</b>
        <button class="gs-x" data-cv-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-row cur"><div class="cv-meta"><span class="cv-time">当前版本</span><span class="cv-wc">${cur.length} 字</span></div></div>
        ${hist.length? `<div class="cv-div">历史版本（点「恢复」回到该版；恢复前会先把当前正文存为新的历史版本）</div>${rows}`
        : '<p class="muted cv-empty">暂无历史版本。当章节被重生成时，旧正文会自动存档在这里，供你随时回退。</p>'}
        <div class="cv-preview hidden" id="cvPreview">
          <div class="cv-prev-head"><b id="cvPrevTitle">版本预览</b><button class="gs-x" data-cv-prev-close>✕</button></div>
          <div class="cv-pre" id="cvReader"></div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-cv-close]').onclick = closeChapterVersionPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeChapterVersionPanel(); });
  ov.addEventListener('click', e=>{
    const p = e.target.closest('[data-cv-prev]'); if(!p) return;
    const v = hist[+p.dataset.cvPrev]; if(!v) return;
    const pr=$('#cvPreview'), rd=$('#cvReader'), pt=$('#cvPrevTitle');
    if(pr && rd){ pt.textContent = '预览 · 历史版本（'+fmtTs(v.ts)+'）'; rd.textContent = v.content||'（空）'; pr.classList.remove('hidden'); }
  });
  ov.querySelector('[data-cv-prev-close]').onclick = ()=>{ const pr=$('#cvPreview'); if(pr) pr.classList.add('hidden'); };
  ov.addEventListener('click', e=>{
    const rb = e.target.closest('[data-cv-restore]'); if(!rb) return;
    const v = hist[+rb.dataset.cvRestore]; if(!v) return;
    if(!window.confirm('恢复该历史版本将覆盖当前正文。\n\n（当前正文会自动保存为一条新的历史版本，不会被删除。）\n确定恢复吗？')) return;
    snapshotChapterVersion(i);                  // 先把当前正文存历史
    c.content = v.content;                      // 用历史版覆盖当前
    c.history.splice(+rb.dataset.cvRestore, 1);
    persist(); closeChapterVersionPanel(); renderChapters();
    toast('已恢复历史版本');
  });
}
function closeChapterVersionPanel(){ const p=$('#cvPanel'); if(p) p.remove(); }

let chPage = 0;
const CH_PAGE_SIZE = 10;
function chCardHtml(c, i){
  const hasC = !!(c.content && c.content.trim());
  const planGi = chapterOfPlan(i);
  const planBtn = planGi >= 0 ? `<button class="btn ghost" data-plan-ch="${i}" data-plan-gi="${planGi}" title="查看本章教案（老师${planGi+1}）">📖 教案</button>` : '';
  return `<div class="card ch-card" data-ch-card="${i}" style="background:var(--panel);border:1px solid var(--line)">
        <div class="ch-head" data-fold="${i}" role="button" tabindex="0" aria-expanded="true">
          <span class="ch-fold-ico">▾</span>
          <h3 style="margin:0;flex:1;word-break:break-word;line-height:1.35" title="第${i+1}章 · ${esc(cleanChapterTitle(c.title))}">第${i+1}章 · ${esc(cleanChapterTitle(c.title))}${c._titleByAI?'<i class="tbd-title-tag" style="font-style:normal;font-size:11px;font-weight:400;opacity:.55;margin-left:6px" title="本章标题已由章节正文 AI 定稿">正文定稿</i>':(!state.plannerFinalized?'<i class="tbd-title-tag" style="font-style:normal;font-size:11px;font-weight:400;opacity:.55;margin-left:6px" title="标题尚未由全书规划师定稿，当前沿用第二步参考稿">参考稿</i>':'')}</h3>
          ${wcBadge(c.content, `data-wc-ch="${i}"`)}
        </div>
        <div class="ch-meta ch-status-wrap" data-ch-status="${i}">${chapterBadgesHtml(i)}</div>
        <div class="ch-body">
          <textarea data-ch="${i}" class="${hasC?'':'ch-ta-empty'}" style="margin-top:8px" ${hasC?'':'placeholder="暂无正文：点击「🔄 重生成」生成，或直接在此输入"'}>${esc(c.content)}</textarea>
          <div class="btn-row">
            <button class="btn ghost" data-regen="${i}" ${state.generating?'disabled':''}>🔄 重生成</button>
            ${planBtn}
            <button class="btn ghost" data-read="${i}">📖 阅读</button>
            <button class="btn ghost" data-ch-sum="${i}" title="生成本章速读梗概（本章正文压缩至约 1/3，省时阅读）" ${hasC?'':'disabled'}>🏮 本章梗概</button>
            ${hasChVersions(i)?`<button class="btn ghost" data-ver="${i}">📚 版本(${chVersions(i).length})</button>`:''}
            ${hasEditHistory(i)?`<button class="btn ghost" data-undo="${i}" title="撤销最近一次手动编辑">↩ 撤销编辑</button>`:''}
          </div>
        </div>
      </div>`;
}
function renderChapters(){
  const wrap = $('#chaptersWrap'); if(!wrap) return;
  const total = state.chapters.length;
  if(isLong()){
    if(!total){
      if(state.outline && Array.isArray(state.outline.chapters) && state.outline.chapters.length && syncChaptersFromOutline()){
        persist();
        return renderChapters();
      }
      const wantN = chapterCountVal();
      if(wantN > 0){
        state.chapters = Array.from({length: wantN}, (_,k)=>({
          num: k+1,
          title: (state.outline && state.outline.chapters && state.outline.chapters[k] && state.outline.chapters[k].title) || `第${k+1}章`,
          content: '',
          confirmed: true,
          beat: (state.outline && state.outline.chapters && state.outline.chapters[k] && state.outline.chapters[k].beat) || ''
        }));
        persist();
        return renderChapters();
      }
      wrap.innerHTML = `<div class="ch-pager"><span class="muted">共 0 章：先在第②步生成大纲。</span></div>`;
      return;
    }
    const maxPage = Math.max(0, Math.ceil(total / CH_PAGE_SIZE) - 1);
    if(chPage > maxPage) chPage = maxPage;
    const from = chPage * CH_PAGE_SIZE;
    const slice = state.chapters.slice(from, from + CH_PAGE_SIZE);
    const html = slice.map((c,offset)=> chCardHtml(c, from + offset)).join('');
    const pageCount = Math.max(1, Math.ceil(total / CH_PAGE_SIZE));
    const pages = Array.from({length:pageCount},(_,p)=>p)
      .map(p=>`<button type="button" class="ch-page${p===chPage?' active':''}" data-page="${p}">${p+1}</button>`).join('');
    wrap.innerHTML = `<div class="ch-pager"><span class="muted">第 ${from+1}–${from+slice.length} 章 / 共 ${total} 章</span>${pages}</div>
      ${html}
      <div class="ch-pager">${pages}</div>`;
  } else {
    wrap.innerHTML = state.chapters.map((c,i)=>`
      <div class="card ch-card" data-ch-card="${i}" style="background:var(--panel);border:1px solid var(--line)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
         <div style="display:flex;align-items:center;gap:8px;min-width:0">
  <h3 style="margin:0;word-break:break-word;line-height:1.35" title="第${i+1}章 · ${esc(cleanChapterTitle(c.title))}">第${i+1}章 · ${esc(cleanChapterTitle(c.title))}</h3>
  <button class="btn ghost" data-ver="${i}" style="padding:2px 6px;font-size:11px;flex-shrink:0" title="版本历史">📚 ${chVersions(i).length}</button>
  ${wcBadge(c.content, `data-wc-ch="${i}"`)}
</div>
<span class="pill ${c.confirmed?'tag-ok':'tag-warn'}">${c.confirmed?'✓ 已确认':'待确认'}</span>
        </div>
        <textarea data-ch="${i}" style="margin-top:8px">${esc(c.content)}</textarea>
        <div class="btn-row">
          <button class="btn ghost" data-regen="${i}">🔄 重生成</button>
          <button class="btn ghost" data-read="${i}">📖 阅读</button>
          <button class="btn ghost" data-ch-sum="${i}" title="生成本章速读梗概（本章正文压缩至约 1/3，省时阅读）" ${c.content&&String(c.content).trim()?'':'disabled'}>🏮 本章梗概</button>
        
          ${hasEditHistory(i)?`<button class="btn ghost" data-undo="${i}" title="撤销最近一次手动编辑">↩ 撤销编辑</button>`:''}
          <button class="btn ghost" data-toggle="${i}">${c.confirmed?'↺ 取消确认':'✓ 标记已确认'}</button>
        </div>
      </div>`).join('');
  }
}

let readerCur = -1;
function renderToc(current){
  const list = $('#tocList'); if(!list) return;
  const total = state.chapters.length;
  const cn = $('#tocCount'); if(cn) cn.textContent = total;
  list.innerHTML = state.chapters.map((c,i)=>{
    const active = i === current ? ' active' : '';
    const done = c.content && c.content.trim() ? ' done' : '';
    return `<button type="button" class="toc-item${active}${done}" data-toc="${i}"><span class="toc-idx">${i+1}</span><span class="toc-t">${esc(cleanChapterTitle(c.title)||('第'+(i+1)+'章'))}</span></button>`;
  }).join('');
}
function toCnNum(n){
  const cn=['零','一','二','三','四','五','六','七','八','九'];
  if(n < 10) return cn[n];
  if(n < 20) return '十' + (n%10 ? cn[n%10] : '');
  if(n < 100){ const t=Math.floor(n/10), u=n%10; return cn[t]+'十'+(u?cn[u]:''); }
  if(n < 1000){ const h=Math.floor(n/100), r=n%100; return cn[h]+'百'+(r? (r<10?'零'+cn[r] : toCnNum(r)) : ''); }
  return String(n);
}
function cleanChapterTitle(title){
  if(!title) return '';
  let t = String(title).trim();
  t = t.replace(/^(第\s*[0-9一二三四五六七八九十百千两0-9]+\s*章|[一二三四五六七八九十百千]+章)(\s*[·、：:．.，,，\-–—]\s*|\s*)/,'');
  return t.trim();
}
function openReader(i){
  const c = state.chapters[i]; if(!c) return;
  const ov = $('#readerOverlay'); if(!ov) return;
  $('#readerTitle').textContent = `第${toCnNum(i+1)}章 · ${cleanChapterTitle(c.title)}`;
  const _readerClean = splitChapterCastout(c.content||'');
  if(_readerClean.body !== String(c.content||'').trim() || (_readerClean.castOut && _readerClean.castOut !== String(c.castOut||''))){
    c.content = _readerClean.body;
    if(_readerClean.castOut) c.castOut = _readerClean.castOut;
    persist();
  }
  const paras = String(_readerClean.body||'').split(/\n+/).map(p=>p.trim()).filter(Boolean);
  let fallback = `<p class="muted">（本章尚未生成正文）</p>`;
  const csum = (state.chapters[i] && state.chapters[i].strip) ? String(state.chapters[i].strip).trim() : '';
  if(csum) fallback = `<p class="muted">🗂 本章梗概：${esc(csum)}</p>
    <p class="muted" style="margin-top:6px">生成正文后将在此展示全文。可用下方「重生成」或「一键批量生成」补写。</p>`;
  $('#readerBody').innerHTML = paras.length ? paras.map(p=>`<p>${esc(p)}</p>`).join('') : fallback;
  renderToc(i);
  readerCur = i;
  randomizeReaderGradient();
  ov.classList.remove('hidden');
  document.body.classList.add('reader-lock'); // 锁定背景滚动
  const body0 = $('#readerBody');
  if(body0) body0.scrollTop = 0;
  updateReaderProgress();
  try{
    const rp = JSON.parse(localStorage.getItem(nsKey('rp_') + (lib.curId||'x') + '_' + i) || 'null');
    if(rp && rp.top){
      requestAnimationFrame(()=>{ const b=$('#readerBody'); if(b) b.scrollTop = rp.top; updateReaderProgress(); });
    }
  }catch(e){}
}
function bindReaderScrollSave(){
  const b = $('#readerBody'); if(!b || b.dataset.rpBound) return;
  b.dataset.rpBound = '1';
  let _t = null;
  b.addEventListener('scroll', ()=>{
    if(_t) return;
    _t = setTimeout(()=>{
      _t = null;
      try{
        localStorage.setItem(nsKey('rp_') + (lib.curId||'x') + '_' + readerCur, JSON.stringify({ top: b.scrollTop }));
      }catch(e){}
      updateReaderProgress();
    }, 400);
  }, {passive:true});
}
function updateReaderProgress(){
  const b = $('#readerBody'), fill = $('#readerProgressFill'), tip = $('#readerPctTip');
  if(!b || !fill) return;
  const max = b.scrollHeight - b.clientHeight;
  const p = max>0 ? Math.min(100, Math.max(0, Math.round(b.scrollTop/max*100))) : 0;
  fill.style.width = p+'%';
  if(tip){
    const paras = b.querySelectorAll('p').length;
    tip.innerHTML = `第 <b>${p}%</b> · 全文 <b>${paras}</b> 段`;
  }
}
function randomizeReaderGradient(){
  const fill = $('#readerProgressFill'); if(!fill) return;
  const h1 = Math.floor(Math.random()*360);
  const h2 = (h1 + 40 + Math.floor(Math.random()*140)) % 360;   // 色相差 40°~180°
  fill.style.setProperty('background', `linear-gradient(90deg, hsl(${h1} 78% 62%), hsl(${h2} 78% 62%))`, 'important');
}
function closeReader(){
  const ov = $('#readerOverlay'); if(!ov) return;
  ov.classList.add('hidden');
  if(ov.dataset.exportReader === '1'){
    delete ov.dataset.exportReader;
    const tocBtn = $('#readerTocBtn'); if(tocBtn) tocBtn.style.display = '';
    const synBtn = $('#readerSynBtn'); if(synBtn) synBtn.style.display = '';
  }
  const toc = $('#readerToc'); if(toc) toc.classList.add('hidden');
  document.body.classList.remove('reader-lock');
}
function bindReader(){
  const ov = $('#readerOverlay'); if(!ov) return;
  bindReaderScrollSave();
  $$('[data-reader-close]', ov).forEach(el=> el.onclick = (e)=>{
    if(e.target.closest('.reader-panel') && !e.target.closest('.reader-close')) return;
    closeReader();
  });
  const tocBtn = $('#readerTocBtn'); const toc = $('#readerToc');
  if(tocBtn && toc){
    tocBtn.onclick = (e)=>{ e.stopPropagation(); const show = toc.classList.toggle('hidden'); tocBtn.classList.toggle('on', !show); };
  }
  const tocClose = $('#tocClose');
  if(tocClose && toc) tocClose.onclick = (e)=>{ e.stopPropagation(); toc.classList.add('hidden'); if(tocBtn) tocBtn.classList.remove('on'); };
  const panel = ov.querySelector('.reader-panel');
  if(panel && toc && tocBtn){
    panel.addEventListener('click', (e)=>{
      if(toc.classList.contains('hidden')) return;      // 目录已收起，无需处理
      if(e.target.closest('#readerToc')) return;        // 点目录内部不收起
      if(e.target.closest('#readerTocBtn')) return;     // 点目录开关不收起（交由自身 toggle）
      toc.classList.add('hidden');
      tocBtn.classList.remove('on');
    });
  }
  const list = $('#tocList');
  if(list && toc) list.onclick = (e)=>{
    const item = e.target.closest('[data-toc]'); if(!item) return;
    openReader(+item.dataset.toc);
  };
  const synBtn = $('#readerSynBtn'), synPop = $('#readerSynPop'), synCard = $('#readerSynCard');
  if(synBtn && synPop && synCard){
    synBtn.onclick = (e)=>{
      e.stopPropagation();
      const o = state.outline || {};
      const ch = (Array.isArray(state.chapters) && state.chapters[readerCur]) ? state.chapters[readerCur] : null;
      const strip = ch && String(ch.strip||'').trim();
      const plans = Array.isArray(o.chapterPlans) ? o.chapterPlans : [];
      const plan = plans[readerCur];
      const btTxt = (plan && typeof plan.beatsText === 'string' && plan.beatsText.trim()) ? plan.beatsText.trim() : '';
      const SEC_NAMES = ['承接点','承接','场景链与切换','场景链','逐拍推进','情绪弧','心情弧','情绪基调','必须使用实体','必须实体','出场实体','埋设伏笔','收束设计','收束','设定'];
      const secOf = (name, alias)=>{
        const lines = btTxt.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
        const re = new RegExp('^(?:'+(alias?name+'|'+alias:name)+')[：:\\s]*(.*)$');
        for(let i=0;i<lines.length;i++){
          const m = lines[i].match(re);
          if(!m) continue;
          const buf = [(m[1]||'').trim()].filter(Boolean);
          for(let j=i+1;j<lines.length;j++){
            if(SEC_NAMES.some(n=>new RegExp('^(?:'+n+')[：:\\s]').test(lines[j]))) break;   // 下一小节标题即止
            buf.push(lines[j]);
          }
          const v = buf.join('；').replace(/\s+/g,' ').trim();
          if(v) return v.slice(0, 200);
        }
        return null;
      };
      let title, body;
      const _lesson = teacherChapterPlan ? teacherChapterPlan(readerCur) : null;
      if(_lesson && String(_lesson).trim()){
        title = `第${toCnNum(readerCur+1)}章 · 本章教案`;
        body = `<div class="syn-body"><div style="font-size:12px;color:var(--muted);margin-bottom:6px">🎓 老师教案（本章正文的唯一权威内容体）· 原始稿：</div><pre class="sc-plan-raw">${esc(_lesson)}</pre></div>`;
      } else if(btTxt){
        const cj = secOf('承接点','承接'); const ss = secOf('收束设计','收束');
        const _te = _timelineEssenceOf((Array.isArray(o.chapterPlans)?o.chapterPlans[readerCur]:null));
        title = `第${toCnNum(readerCur+1)}章 · 本章概览`;
        body = `<div class="syn-body rb-overview">
          ${_te?`<div class="rb-ov-sec"><b class="rb-ov-lb">⏱ 时间线要点（将注入全书时间线）</b><div>${esc(_te)}</div></div>`:''}
          ${cj||ss?`<div class="rb-ov-sec"><b class="rb-ov-lb">承接点</b><div>${cj?esc(cj):'<span class="muted">（本章编排未单列承接点）</span>'}</div></div>
          ${ss?`<div class="rb-ov-sec"><b class="rb-ov-lb">收束设计</b><div>${esc(ss)}</div></div>`:''}`:`<div class="rb-ov-sec"><b class="rb-ov-lb">本章编排</b><div>${esc(clipText(btTxt, 180))}</div></div>`}
        </div>`;
      } else if(strip){
        title = `第${toCnNum(readerCur+1)}章 · 本章梗概`;
        body = `<div class="syn-body">${esc(strip)}</div>`;
      } else {
        title = `第${toCnNum(readerCur+1)}章 · 节拍表`;
        body = `<div class="syn-body muted">本章暂无节拍表：请先在「全书规划师」生成①节拍表。</div>`;
      }
      synCard.innerHTML = `<h4>${title}</h4>${body}`;
      synPop.classList.remove('hidden');
    };
    synPop.onclick = (e)=>{ if(e.target === synPop) synPop.classList.add('hidden'); };  // 点遮罩关闭
  }
}
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    const sp = $('#readerSynPop');
    if(sp && !sp.classList.contains('hidden')){ sp.classList.add('hidden'); return; }
    closeReader();
    const h = $('#histPanel'); if(h && !h.classList.contains('hidden')) closeHistPanel();
    const t = $('#themePanel'); if(t && !t.classList.contains('hidden')) closeThemePanel();
  }
});

function updateChapterWc(i, text){
  const el = $('[data-wc-ch="'+i+'"]');
  if(!el) return;
  const w = countWords(text);
  el.innerHTML = wcInner(w);
  el.title = `中文 ${w.cjk} 字 · 英文 ${w.en} 词`;
}
function updateWcTotal(){
  const el = $('#wcTotal'); if(!el) return;
  const chapters = state.chapters.filter(c=> c.content && c.content.trim());
  if(!chapters.length){ el.classList.add('hidden'); el.innerHTML=''; return; }
  let total=0, cjk=0, en=0;
  chapters.forEach(c=>{ const w = countWords(c.content); total+=w.total; cjk+=w.cjk; en+=w.en; });
  const fmt = n=> n.toLocaleString('en-US');
  el.classList.remove('hidden');
  el.innerHTML = `<span class="inner">📚 小说内容总字数 <b>${fmt(total)}</b> <span class="brk">（中 ${fmt(cjk)} · 英 ${en}）</span></span>`;
}

function renderLongProgress(){
  const el = $('.long-progress'); if(!el) return;
  const done = state.chapters.filter(c=> c.content && c.content.trim()).length;
  const total = state.chapters.length;
  let chars = 0; state.chapters.forEach(c=> chars += countWords(c.content).total);
  const cap = total ? `全书 ${total} 章` : (chapterCountVal() ? `全书 ${chapterCountVal()} 章` : '');
  el.innerHTML = `<span class="pill">写作进度：${done}/${total} 章</span> <span class="pill">已写约 ${chars.toLocaleString('en-US')} 字${cap ? ' · '+cap : ''}</span>`;
}

function viewCharacters(){
  if(!readyForAssets()){
    return `<div class="center-empty">请先在「故事」里生成大纲并生成章节。<br>角色提示词需要基于完整故事生成。</div>`;
  }
  if(!state.characters.length){
    return `<div class="card">
      <h3>🧑 角色定妆提示词包</h3>
      <p class="sub">基于故事大纲提取主要角色，并生成即梦影视前期视觉提示词。</p>
      <button id="btnGenChars" class="btn primary block">✨ 生成角色定妆提示词</button>
      <p id="charStatus" class="status"></p>
    </div>`;
  }
  const ids = [...new Set(state.characters.map(c=>(c.profile&&c.profile.身份)||c.role||'').filter(Boolean))];
  const identOptions = ids.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  return `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3>🧑 角色定妆提示词包（${state.characters.length}）</h3>
        <span class="btn-row" style="margin:0">
          ${hasAssetHist('characters')?`<button id="btnCharHist" class="btn ghost">🕘 历史(${assetHistCount('characters')})</button>`:''}
          <button id="btnGenChars" class="btn ghost">🔄 重生成</button>
        </span>
      </div>
      <div class="char-toolbar">
        <input id="charSearch" class="char-search" placeholder="🔍 搜索角色姓名 / 身份…" value="${esc(charFilters.q)}">
        <select id="charJump" class="char-jump" placeholder="选择角色快速定位"></select>
        <select id="charIdent" multiple placeholder="身份筛选（可多选）">${identOptions}</select>
        <div class="char-filters">
          <select id="charGender">
            <option value="" ${charFilters.gender===''?'selected':''}>性别：全部</option>
            <option value="男" ${charFilters.gender==='男'?'selected':''}>男</option>
            <option value="女" ${charFilters.gender==='女'?'selected':''}>女</option>
            <option value="其他" ${charFilters.gender==='其他'?'selected':''}>其他</option>
          </select>
          <div class="cf-age">
            <input type="number" id="ageMin" class="age-input" placeholder="年龄≥" min="0" max="200" value="${esc(charFilters.ageMin)}">
            <span class="age-sep">~</span>
            <input type="number" id="ageMax" class="age-input" placeholder="年龄≤" min="0" max="200" value="${esc(charFilters.ageMax)}">
          </div>
        </div>
        <div class="char-count" id="charCount"></div>
      </div>
    </div>
    <div id="charList">${charFiltered().map(idx=>charCard(state.characters[idx], idx)).join('')}</div>` + fallbackRaw('characters');
}

function charCard(c, idx){
  const pf = c.profile||{};
  const kv = Object.entries(pf).map(([k,v])=>`<div class="kv"><span class="k">${esc(k)}</span><input type="text" class="char-edit" data-char-kv="${idx}" data-key="${esc(k)}" data-orig="${esc(v)}" value="${esc(v)}" /></div>`).join('');
  const order = ['定妆图','三视图','表情','服饰细节','道具','配色','材质'];
  const pr = c.prompts||{};
  const cards = order.map(k=>pr[k]==null?'':`
    <div class="subcard">
      <div class="lbl">${esc(k)}<button class="copy" data-copy="${esc(pr[k])}">复制</button></div>
      <textarea class="char-edit" data-char-prompt="${idx}" data-key="${esc(k)}" data-orig="${esc(pr[k])}" rows="3">${esc(pr[k])}</textarea>
    </div>`).join('');
  const allText = Object.values(pf).join(' ') + ' ' + Object.values(pr).join(' ');
  return `<div class="card" id="char-${idx}">
    <h3 style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">${esc(c.name||'未命名')} <span class="pill">${esc(c.role||'')}</span> ${wcBadge(allText)}</h3>
    <div class="subcard">${kv}</div>
    ${cards}
    <p class="muted" style="margin:4px 0 0;font-size:11px">字段可直接编辑，失焦即存（不触发 AI）。</p>
  </div>`;
}
function bindCharEdit(){
  $$('[data-char-kv],[data-char-prompt]').forEach(inp=>{
    inp.onchange = ()=>{
      const idx = inp.hasAttribute('data-char-kv') ? +inp.dataset.charKv : +inp.dataset.charPrompt;
      const c = state.characters[idx]; if(!c) return;
      const k = inp.dataset.key;
      const v = inp.value;
      if(v === inp.dataset.orig) return;
      if(inp.hasAttribute('data-char-kv')){
        if(!c.profile) c.profile = {};
        c.profile[k] = v;
      } else {
        if(!c.prompts) c.prompts = {};
        c.prompts[k] = v;
      }
      inp.dataset.orig = v;
      persist();
      toast('角色卡已保存');
    };
  });
}

function charFiltered(){
  const {q, idents, gender, ageMin, ageMax} = charFilters;
  const min = ageMin===''||ageMin==null ? null : +ageMin;
  const max = ageMax===''||ageMax==null ? null : +ageMax;
  const out = [];
  state.characters.forEach((c,i)=>{
    const pf = c.profile||{};
    if(q){
      const hay = ((c.name||'')+' '+(c.role||'')+' '+(pf.身份||'')).toLowerCase();
      if(!hay.includes(q.toLowerCase())) return;
    }
    if(idents && idents.length){
      const id = pf.身份||c.role||'';
      if(!idents.some(v=> id.includes(v) || v.includes(id))) return;
    }
    if(gender){
      const g = pf.性别||'';
      if(gender==='其他'){ if(g==='男'||g==='女') return; }
      else if(g!==gender && !g.includes(gender)) return;
    }
    if(min!=null || max!=null){
      const age = parseAge(pf.年龄);
      if(age==null) return; // 未知年龄在有区间约束时默认不显示
      if(min!=null && age<min) return;
      if(max!=null && age>max) return;
    }
    out.push(i);
  });
  return out;
}
function applyCharFilters(){
  const wrap = $('#charList'); if(!wrap) return;
  const idxs = charFiltered();
  wrap.innerHTML = idxs.length
    ? idxs.map(i=>charCard(state.characters[i], i)).join('')
    : `<div class="center-empty">没有符合条件的角色，试试放宽筛选条件。</div>`;
  const cnt = $('#charCount');
  if(cnt) cnt.textContent = `显示 ${idxs.length} / ${state.characters.length} 个角色`;
  bindCopyBtns();
  bindCharEdit();
}
function bindCopyBtns(){ $$('[data-copy]').forEach(b=> b.onclick = ()=> copyText(b.getAttribute('data-copy')) ); }

function initCharFilter(){
  if(!window.TomSelect) return;
  const wrap = $('#charList'); if(!wrap) return;
  const jumpSel = $('#charJump');
  if(jumpSel){
    jumpSel.innerHTML = `<option value="">⬇️ 选择角色快速定位…</option>` + state.characters.map((c,i)=>`<option value="${i}">${esc(c.name||'未命名')}${c.role?(' · '+esc(c.role)):''}</option>`).join('');
    try{
      charTS.push(new TomSelect(jumpSel, {
        plugins:['dropdown_input'],
        placeholder:'⬇️ 选择角色快速定位…',
        allowEmptyOption:true,
        onChange: v=>{
          if(v==='' || v==null) return;
          const card = $('#char-'+v);
          if(card){ card.scrollIntoView({behavior:'smooth', block:'center'}); card.classList.add('flash'); setTimeout(()=>card.classList.remove('flash'), 1600); }
        }
      }));
      try{ jumpSel.tomselect.setValue('', true); }catch(e){}
    }catch(e){}
  }
  const identSel = $('#charIdent');
  if(identSel){
    try{
      const ts = new TomSelect(identSel, {
        plugins:['dropdown_input','clear_button'],
        placeholder:'身份筛选（可多选）',
        allowEmptyOption:false,
        onChange: v=>{ charFilters.idents = v||[]; applyCharFilters(); }
      });
      charTS.push(ts);
      if(charFilters.idents.length) ts.setValue(charFilters.idents, true);
    }catch(e){}
  }
}

function coverCardHtml(){
  const modeLab = state.coverWithTitle ? '含汉字书名' : '纯画面·无文字';
  const modeHint = state.coverWithTitle
    ? '封面将包含书名汉字的书法大字作为主体文字。'
    : '封面为纯画面，预留书名留白，仅作底图，文字后期排版。';
  const seg = state.coverWithTitle
    ? `<div class="cover-modes"><button type="button" class="cm-on">🏷️ 含汉字书名</button><button type="button" class="cm-off" data-cv="clean">🖼️ 纯画面</button></div>`
    : `<div class="cover-modes"><button type="button" class="cm-off" data-cv="title">🏷️ 含汉字书名</button><button type="button" class="cm-on">🖼️ 纯画面</button></div>`;
  return `
    <div class="card cover-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">📕 小说封面提示词</h3>
        <span class="btn-row" style="margin:0">
          ${hasAssetHist('cover')?`<button type="button" class="btn ghost" data-cover-hist>🕘 历史(${assetHistCount('cover')})</button>`:''}
          <span class="pill" id="coverModeLab">${modeLab}</span>
        </span>
      </div>
      ${seg}
      <p class="sub">${modeHint}</p>
      ${state.coverPrompt ? `
        <div class="subcard"><div class="lbl">封面提示词<button class="copy" data-copy="${esc(state.coverPrompt)}">复制</button></div><div class="prompt-text">${esc(state.coverPrompt)}</div></div>
        <label class="field" style="margin-top:8px"><span>✎ 编辑封面提示词（失焦即存，不触发 AI）</span>
          <textarea class="cover-edit" data-cover-edit>${esc(state.coverPrompt)}</textarea></label>
        <div class="btn-row" style="margin-top:8px"><button id="btnGenCover" class="btn ghost">🔄 重生成封面提示词</button></div>
      ` : `
        <div class="btn-row"><button id="btnGenCover" class="btn primary block">🖼️ 生成封面提示词</button></div>
        <p id="coverStatus" class="status"></p>
      `}
    </div>`;
}
function viewScenes(){
  if(!readyForAssets()) return `<div class="center-empty">请先在「故事」里生成大纲并生成章节。</div>`;
  if(isLong()) return coverCardHtml();
  const coverCard = coverCardHtml();
  if(!state.scenes.length){
    return coverCard + `<div class="card">
      <h3>🏞️ 场景提示词</h3>
      <p class="sub">提取关键场景并生成即梦出图提示词（含环境、光影与构图）。</p>
      <button id="btnGenScenes" class="btn primary block">✨ 生成场景提示词</button>
      <p id="sceneStatus" class="status"></p>
    </div>`;
  }
  return coverCard + `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center">
      <h3>🏞️ 场景提示词（${state.scenes.length}）</h3>
      <span class="btn-row" style="margin:0">
        ${hasAssetHist('scenes')?`<button id="btnSceneHist" class="btn ghost">🕘 历史(${assetHistCount('scenes')})</button>`:''}
        <button id="btnGenScenes" class="btn ghost">🔄 重生成</button>
      </span></div></div>` +
    state.scenes.map((s,si)=>`
    <div class="card">
      <h3 style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <input type="text" class="scene-edit-name" data-scene-name="${si}" value="${esc(s.name||'')}" placeholder="场景名" style="flex:0 0 auto;min-width:120px;max-width:220px" />
        <span class="pill tag-env">🌿 纯环境·无人物</span> ${wcBadge((s.description||'')+' '+(s.prompt||''))}</h3>
      <p class="sub">作用：<input type="text" class="scene-edit-role" data-scene-role="${si}" value="${esc(s.作用||'')}" style="flex:1;min-width:160px" /></p>
      <div class="subcard"><div class="lbl">场景设定</div><textarea class="scene-edit-desc" data-scene-desc="${si}" rows="2">${esc(s.description||'')}</textarea></div>
      <div class="subcard"><div class="lbl">即梦出图提示词<button class="copy" data-copy="${esc(s.prompt||'')}">复制</button></div><textarea class="scene-edit-prompt" data-scene-prompt="${si}" rows="3">${esc(s.prompt||'')}</textarea></div>
      <p class="muted" style="margin:4px 0 0;font-size:11px">字段可直接编辑，失焦即存（不触发 AI）。</p>
    </div>`).join('') + fallbackRaw('scenes');
}

function viewStoryboard(){
  if(!readyForAssets()) return `<div class="center-empty">请先在「故事」里生成大纲并生成章节。</div>`;
  if(!state.storyboard.length){
    return `<div class="card">
      <h3>🎞️ 分镜文字</h3>
      <p class="sub">按章节拆解导演级影视分镜与即梦出图提示词。</p>
      <button id="btnGenBoard" class="btn primary block">✨ 生成分镜文字（逐章）</button>
      <p id="boardStatus" class="status"></p>
    </div>`;
  }
  const groups = {};
  state.storyboard.forEach((s,i)=>{ const k = s.章节 || '未分组'; (groups[k]=groups[k]||[]).push(i); });
  const keys = Object.keys(groups).sort((a,b)=>{
    const na=+a, nb=+b;
    return (!isNaN(na)&&!isNaN(nb)) ? na-nb : String(a).localeCompare(String(b),'zh');
  });
  const rows = keys.map(k=>{
    const idxs = groups[k];
    const sec = idxs.reduce((sum,i)=> sum + (Number(state.storyboard[i].时长)||0), 0);
    const ci = (!isNaN(+k)&&state.boardConcepts&&state.boardConcepts[+k-1]) ? state.boardConcepts[+k-1] : null;
    return `<div class="board-ch">
      <div class="board-ch-head">
        <div class="board-ch-title">🎬 第${esc(k)}章</div>
        <div class="board-ch-stat" id="chStat-${esc(k)}">共 ${idxs.length} 镜 · 总时长 ${sec}s</div>
      </div>
      ${ci && (ci.视觉概念||ci.母题) ? `<div class="board-concept"><b>视觉概念：</b>${esc(ci.视觉概念||'')}${ci.母题?('<br><b>母题：</b>'+esc(ci.母题)):''}</div>`:''}
      ${idxs.map(i=>shotHtml(i)).join('')}
    </div>`;
  }).join('');
  const totalSec = state.storyboard.reduce((sum,s)=> sum + (Number(s.时长)||0), 0);
  return `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
      <h3>🎞️ 分镜（${state.storyboard.length} 镜）</h3>
      <span class="btn-row" style="margin:0">
        ${hasAssetHist('storyboard')?`<button id="btnBoardHist" class="btn ghost">🕘 历史(${assetHistCount('storyboard')})</button>`:''}
        <button id="btnGenBoard" class="btn ghost">🔄 重生成</button>
      </span>
    </div>${rows}
    <div class="card board-total">⏱ 全局：<b id="boardTotal">共 ${state.storyboard.length} 镜 · 总时长 ${totalSec}s</b><span class="muted">（每镜时长可点击数字直接修改，统计实时联动）</span></div>`
    + fallbackRaw('storyboard');
}
function shotHtml(i){
  const s = state.storyboard[i];
  const ed = (key, tag='input', rows=2)=> tag==='textarea'
    ? `<textarea class="shot-edit" data-shot="${i}" data-key="${esc(key)}" rows="${rows}">${esc(s[key]||'')}</textarea>`
    : `<input type="text" class="shot-edit" data-shot="${i}" data-key="${esc(key)}" value="${esc(s[key]||'')}" />`;
  return `<div class="shot">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span class="no">镜 ${esc(s.镜号)}</span>
      <span class="dur">⏱ <input type="number" class="dur-input" data-dur="${i}" value="${esc(s.时长??3)}" min="0.5" max="30" step="0.5"> 秒</span>
      ${wcBadge((s.画面描述||'')+' '+(s.出图提示词||''))}
    </div>
    <div class="meta">
      ${['景别','角度','运镜','光线','转场'].map(k=> s[k]?`<span class="pill">${esc(s[k])}</span>`:'').join('')}
    </div>
    ${s.主体!==undefined && s.主体!=='' ? `<div class="prompt-text" style="margin-top:6px"><b>主体：</b>${ed('主体')}</div>`:''}
    ${s.构图!==undefined && s.构图!=='' ? `<div class="prompt-text" style="margin-top:4px"><b>构图：</b>${ed('构图')}</div>`:''}
    <div class="prompt-text" style="margin-top:6px">${ed('画面描述','textarea',2)}</div>
    ${ s.对白 ? `<div class="sub" style="margin-top:6px">💬 ${ed('对白')}</div>`:'' }
    <div class="subcard" style="margin-top:8px"><div class="lbl">出图提示词<button class="copy" data-copy="${esc(s.出图提示词||'')}">复制</button></div>${ed('出图提示词','textarea',3)}</div>
    ${ s.连续性 ? `<div class="muted" style="margin-top:6px">🔗 连续性：${ed('连续性')}</div>`:'' }
    ${ s.剪辑动机 ? `<div class="muted" style="margin-top:4px">🎯 剪辑动机：${ed('剪辑动机')}</div>`:'' }
    <p class="muted" style="margin:4px 0 0;font-size:11px">字段可直接编辑，失焦即存（不触发 AI）。</p>
  </div>`;
}
function bindShotEdit(){
  $$('[data-shot]').forEach(inp=>{
    inp.onchange = ()=>{
      const s = state.storyboard[+inp.dataset.shot]; if(!s) return;
      s[inp.dataset.key] = inp.value;
      persist();
      toast('分镜已保存');
    };
  });
}
function updateBoardTiming(){
  const groups = {};
  state.storyboard.forEach((s,i)=>{ const k=s.章节||'未分组'; (groups[k]=groups[k]||[]).push(i); });
  Object.keys(groups).forEach(k=>{
    const sec = groups[k].reduce((sum,i)=> sum + (Number(state.storyboard[i].时长)||0), 0);
    const el = $('#chStat-'+k); if(el) el.textContent = `共 ${groups[k].length} 镜 · 总时长 ${sec}s`;
  });
  const totalSec = state.storyboard.reduce((sum,s)=> sum + (Number(s.时长)||0), 0);
  const el = $('#boardTotal'); if(el) el.textContent = `共 ${state.storyboard.length} 镜 · 总时长 ${totalSec}s`;
}

function fallbackRaw(key){
  const raw = state.raw[key];
  if(!raw) return '';
  return `<div class="card"><p class="muted">以下为模型原始返回（解析 JSON 失败时保留）：</p>
    <textarea style="min-height:120px">${esc(raw)}</textarea></div>`;
}

function readyForAssets(){
  return state.outlineConfirmed && state.chapters.some(c=>c.content && c.content.trim());
}


function viewExport(){
  if(isLong()) return longExportView();
  if(!state.outline) return `<div class="center-empty">尚无可导出的内容。请先生成并确认故事大纲。</div>`;
  const md = buildMarkdown();
  return `<div class="card">
    <h3>📦 导出资产包</h3>
    <p class="sub">汇总全书故事、角色、场景与分镜资产，支持一键复制或导出。</p>
    <div class="btn-row">
      <button id="btnCopyAll" class="btn primary">📋 复制全部</button>
    </div>
  </div>
  <div class="card"><textarea id="exportArea" style="min-height:300px">${esc(md)}</textarea></div>`;
}

function longExportView(){
  if(!state.outline) return `<div class="center-empty">尚无可导出的内容。请先生成故事大纲。</div>`;
  const written = state.chapters.filter(c=> c.content && String(c.content).trim()).length;
  state.expSel = state.expSel.filter(i=> state.chapters[i] && state.chapters[i].content && String(state.chapters[i].content).trim());
  const title = state.outline?.title || '未命名长篇小说';
  const md = buildLongMarkdown();
  const CH_PER_GROUP = 10, EXP_GROUP_THRESHOLD = 20;
  const useGroup = state.chapters.length > EXP_GROUP_THRESHOLD;
  if(useGroup && state.expOpenGroups.length === 0){
    const selSet = new Set(state.expSel);
    const ng = Math.ceil(state.chapters.length / CH_PER_GROUP);
    state.expOpenGroups = [];
    for(let g=0; g<ng; g++){
      let has=false;
      for(let i=g*CH_PER_GROUP; i<Math.min(state.chapters.length,(g+1)*CH_PER_GROUP); i++){ if(selSet.has(i)){ has=true; break; } }
      if(has) state.expOpenGroups.push(g);
    }
  }
  const expGroupHTML = ()=>{
    const label = (c,i,ok)=> `<label class="exp-ch ${ok?'':'disabled'}"><input type="checkbox" data-expch="${i}" ${state.expSel.includes(i)?'checked':''} ${ok?'':'disabled'}><span class="exp-ch-no">第${i+1}章</span><span class="exp-ch-title">${esc(c.title||'')}</span><span class="wc">${ok? wcInner(countWords(c.content)) : '未写'}</span></label>`;
    if(!useGroup) return state.chapters.map((c,i)=> label(c,i,!!(c.content&&String(c.content).trim()))).join('');
    const n = state.chapters.length, ng = Math.ceil(n/CH_PER_GROUP);
    let out='';
    for(let g=0; g<ng; g++){
      const s=g*CH_PER_GROUP, e=Math.min(n,(g+1)*CH_PER_GROUP), open=state.expOpenGroups.includes(g);
      let items='';
      for(let i=s;i<e;i++){ const c=state.chapters[i]; items += label(c,i,!!(c.content&&String(c.content).trim())); }
      const selCnt = state.expSel.filter(i=> i>=s && i<e).length;
      out += `<div class="exp-group ${open?'open':''}" data-expgroup="${g}"><div class="exp-group-t" role="button" data-expgroup-t="${g}"><span class="exp-group-ttl">第${s+1}—${e}章</span>${selCnt?`<span class="muted exp-group-sum">已选${selCnt}</span>`:''}<span class="sc-fold-ico">${open?'▾':'▸'}</span></div><div class="exp-group-body">${items}</div></div>`;
    }
    return out;
  };
  return `
    <div class="card">
      <h3>📦 导出资产包 · ${esc(title)}</h3>
      <p class="sub">汇总故事大纲与章节目录，支持一键复制或导出。</p>
      <div class="btn-row">
      <button id="lnCopyAll" class="btn primary">📋 复制全部</button>
<button id="lnExportReader" class="btn ghost">📖 阅读</button>
    </div>
    </div>
    <div class="card"><textarea id="lnExportArea" style="min-height:300px" readonly>${esc(md)}</textarea></div>
    <div class="card">
      <h3>📦 导出成书（选章节 + 三种格式）</h3>
      <p class="sub">选择需要导出的章节与文件格式（TXT / EPUB / DOCX）。</p>
      <div class="btn-row">
        <button id="expSelAll" class="btn ghost">☑️ 全选已写</button>
        <button id="expSelNone" class="btn ghost">⬜ 清空</button>
        <span class="muted" id="expCount">已选 ${state.expSel.length} / 已写 ${written} 章（共 ${state.chapters.length} 章）</span>
      </div>
      <div class="exp-ch-list" data-exp-ch-list>
        ${expGroupHTML()}
      </div>
      <div class="btn-row" style="margin-top:12px">
        <button id="expTxt" class="btn">📄 导出 TXT</button>
        <button id="expEpub" class="btn">📚 导出 EPUB</button>
        <button id="expDocx" class="btn">📝 导出 DOCX</button>
      </div>
      <p id="exportStatus" class="status"></p>
    </div>`;
}

function openExportReader(){
  const ta = $('#lnExportArea');
  if(!ta || !ta.value.trim()){ toast('暂无导出内容'); return; }
  const ov = $('#readerOverlay'); if(!ov) return;
  $('#readerTitle').textContent = `📖 全文阅读 · ${esc(state.outline?.title||'未命名')}`;
  const lines = ta.value.split('\n').map(l=>l.trim());
  let html = '';
  for(const l of lines){
    if(!l) continue;
    if(/^#{1,3}\s/.test(l)) html += `<h3>${esc(l.replace(/^#+\s*/,''))}</h3>`;
    else if(/^第\d+[章节]/.test(l) || /^第[一二三四五六七八九十百千]+[章节]/.test(l)) html += `<h3>${esc(l)}</h3>`;
    else html += `<p>${esc(l)}</p>`;
  }
  $('#readerBody').innerHTML = html || '<p class="muted">（暂无内容）</p>';
  const tocBtn = $('#readerTocBtn'); if(tocBtn) tocBtn.style.display = 'none';
  const synBtn = $('#readerSynBtn'); if(synBtn) synBtn.style.display = 'none';
  const body0 = $('#readerBody');
  if(body0) body0.scrollTop = 0;
  updateReaderProgress();
  randomizeReaderGradient();
  ov.dataset.exportReader = '1';   // 标记为导出阅读模式
  ov.classList.remove('hidden');
  document.body.classList.add('reader-lock');
}

function buildLongMarkdown(){
  const o = state.outline;
  let md = `# ${o?.title||'未命名长篇小说'}\n\n`;
  md += `## 一、故事大纲\n**小说简介**：${o?.logline||''}\n\n`;
  (o?.chapters||[]).forEach((c,i)=>{
    md += `${i+1}. **${cleanChapterTitle(c.title)||''}**\n`;
  });
  return md;
}
function activeChapters(){
  let idx = state.expSel.filter(i=> state.chapters[i] && state.chapters[i].content && String(state.chapters[i].content).trim()).sort((a,b)=>a-b);
  if(!idx.length) idx = state.chapters.map((c,i)=> (c.content && String(c.content).trim())?i:null).filter(x=>x!==null);
  return idx;
}
function syncExpChecks(){
  $$('#view [data-expch]').forEach(cb=> cb.checked = state.expSel.includes(+cb.dataset.expch));
  const cnt = $('#expCount'); if(cnt) cnt.textContent = `已选 ${state.expSel.length} / 已写 ${state.chapters.filter(c=>c.content&&String(c.content).trim()).length} 章（共 ${state.chapters.length} 章）`;
}
function downloadBlob(name, blob){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(()=> URL.revokeObjectURL(a.href), 1000);
}
function expText(){
  const idx = activeChapters(); if(!idx.length){ toast('没有可导出的已写章节'); return; }
  const title = state.outline?.title || '未命名长篇小说';
  let t = `${title}\n${'='.repeat(24)}\n`;
  if(state.outline?.logline) t += `\n${state.outline.logline}\n\n`;
  idx.forEach(i=>{ const c=state.chapters[i]; t += `\n第${i+1}章 ${cleanChapterTitle(c.title)||''}\n\n${String(c.content||'').trim()}\n`; });
  download(`${title}_长篇.txt`, t);
  toast(`已导出 ${idx.length} 章 TXT`);
}
function expEpub(){
  const idx = activeChapters(); if(!idx.length){ toast('没有可导出的已写章节'); return; }
  if(typeof JSZip === 'undefined'){ toast('找不到 JSZip 库'); return; }
  const title = state.outline?.title || '未命名长篇小说';
  const author = '使用者';
  const uid = (crypto && crypto.randomUUID) ? crypto.randomUUID() : ('uuid-'+Date.now()+'-'+Math.random().toString(16).slice(2));
  const modDate = new Date().toISOString();
  const base = 'OEBPS';
  const chapterFiles = idx.map(i=>{
    const c = state.chapters[i];
    const paras = String(c.content||'').split(/\n+/).map(p=>p.trim()).filter(Boolean)
      .map(p=> `<p>${esc(p)}</p>`).join('\n');
    const h1 = `第${i+1}章 ${esc(cleanChapterTitle(c.title)||'')}`;
    const xhtml = `<?xml version="1.0" encoding="utf-8"?>\n`+
      `<!DOCTYPE html>\n`+
      `<html xmlns="http://www.w3.org/1999/xhtml">\n<head>\n  <title>${freeText(h1)}</title>\n  <link rel="stylesheet" type="text/css" href="styles.css"/>\n</head>\n<body>\n  <h1>${h1}</h1>\n${paras}\n</body>\n</html>`;
    return { id:'ch'+(i+1), file:`text/ch${i+1}.xhtml`, title:h1, xhtml };
  });
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', {compression:'STORE'});
  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="utf-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n  <rootfiles>\n    <rootfile full-path="${base}/content.opf" media-type="application/oebps-package+xml"/>\n  </rootfiles>\n</container>`);
  const manifest = chapterFiles.map(f=>`    <item id="${f.id}" href="${f.file}" media-type="application/xhtml+xml"/>`).join('\n');
  const spine = chapterFiles.map(f=>`    <itemref idref="${f.id}"/>`).join('\n');
  zip.file(`${base}/content.opf`, `<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">\n  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n    <dc:identifier id="uid">urn:uuid:${uid}</dc:identifier>\n    <dc:title>${freeText(title)}</dc:title>\n    <dc:language>zh-CN</dc:language>\n    <dc:creator>${freeText(author)}</dc:creator>\n    <meta property="dcterms:modified">${modDate}</meta>\n  </metadata>\n  <manifest>\n    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>\n    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n    <item id="css" href="styles.css" media-type="text/css"/>\n${manifest}\n  </manifest>\n  <spine>\n${spine}\n  </spine>\n</package>`);
  const navLis = chapterFiles.map(f=>`    <li><a href="${f.file}">${freeText(f.title)}</a></li>`).join('\n');
  zip.file(`${base}/nav.xhtml`, `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">\n<head>\n  <meta charset="utf-8"/>\n  <title>${freeText(title)}</title>\n</head>\n<body>\n  <nav epub:type="toc" id="toc">\n    <h1>目录</h1>\n    <ol>\n${navLis}\n    </ol>\n  </nav>\n</body>\n</html>`);
  const ncxPts = chapterFiles.map((f,i)=>`    <navPoint id="${f.id}" playOrder="${i+1}"><navLabel><text>${freeText(f.title)}</text></navLabel><content src="${f.file}"/></navPoint>`).join('\n');
  zip.file(`${base}/toc.ncx`, `<?xml version="1.0" encoding="utf-8"?>\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n  <head><meta name="dtb:uid" content="urn:uuid:${uid}"/></head>\n  <docTitle><text>${freeText(title)}</text></docTitle>\n  <navMap>\n${ncxPts}\n  </navMap>\n</ncx>`);
  zip.file(`${base}/styles.css`, `body{font-family:serif,"PingFang SC","Source Han Serif SC",serif;line-height:1.9;margin:2em;color:#222}\nh1{font-size:1.4em;text-align:center;margin-bottom:1.6em;color:#333}\np{text-indent:2em;margin:0.5em 0}`);
  chapterFiles.forEach(f=> zip.file(`${base}/${f.file}`, f.xhtml));
  const st = $('#exportStatus'); if(st) st.textContent = '正在打包 EPUB…';
  zip.generateAsync({type:'blob', mimeType:'application/epub+zip'}).then(blob=>{
    downloadBlob(`${title}_长篇.epub`, blob);
    if(st) st.textContent = '';
    toast(`已导出 EPUB（${idx.length} 章）`);
  }).catch(()=>{ if(st) st.textContent='打包失败'; toast('EPUB 打包失败'); });
}
function expDocx(){
  const idx = activeChapters(); if(!idx.length){ toast('没有可导出的已写章节'); return; }
  if(typeof JSZip === 'undefined'){ toast('找不到 JSZip 库'); return; }
  const title = state.outline?.title || '未命名长篇小说';
  const xmlEsc = t=> String(t??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const paras = [];
  paras.push(`<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t xml:space="preserve">${xmlEsc(title)}</w:t></w:r></w:p>`);
  if(state.outline?.logline) paras.push(`<w:p><w:r><w:t xml:space="preserve">${xmlEsc(state.outline.logline)}</w:t></w:r></w:p>`);
  idx.forEach(i=>{
    const c = state.chapters[i];
    paras.push(`<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">第${i+1}章 ${xmlEsc(cleanChapterTitle(c.title)||'')}</w:t></w:r></w:p>`);
    String(c.content||'').split(/\n+/).map(p=>p.trim()).filter(Boolean)
      .forEach(p=> paras.push(`<w:p><w:r><w:t xml:space="preserve">${xmlEsc(p)}</w:t></w:r></w:p>`));
  });
  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n  <Default Extension="xml" ContentType="application/xml"/>\n  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n</Relationships>`);
  const body = paras.join('\n');
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr/></w:body></w:document>`);
  const st = $('#exportStatus'); if(st) st.textContent = '正在打包 DOCX…';
  zip.generateAsync({type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}).then(blob=>{
    downloadBlob(`${title}_长篇.docx`, blob);
    if(st) st.textContent = '';
    toast(`已导出 DOCX（${idx.length} 章）`);
  }).catch(()=>{ if(st) st.textContent='打包失败'; toast('DOCX 打包失败'); });
}
function freeText(t){ return String(t??'').replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

function buildMarkdown(){
  const o = state.outline;
  let md = `# 影视前期资产包 · ${o?.title||'未命名'}\n\n> 由「影视前期提示词生成器」生成 · 出图请在即梦用提示词生成\n\n`;
  md += `## 一、故事大纲\n**小说简介**：${o?.logline||''}\n\n`;
  (o?.chapters||[]).forEach((c,i)=>{
    md += `${i+1}. **${cleanChapterTitle(c.title)||''}**\n`;
  });
  if(state.characters.length){
    md += `\n## 三、角色定妆提示词包\n`;
    state.characters.forEach(c=>{
      md += `\n### ${c.name}（${c.role||''}）\n`;
      const pf=c.profile||{}; Object.entries(pf).forEach(([k,v])=> md+=`- **${k}**：${v}\n`);
      const pr=c.prompts||{}; const order=['定妆图','三视图','表情','服饰细节','道具','配色','材质'];
      order.forEach(k=>{ if(pr[k]!=null) md+=`\n**${k}提示词**：\n${pr[k]}\n`; });
    });
  }
  if(state.scenes.length){
    md += `\n## 四、场景提示词（纯环境 · 无人物，供视频 AI 空镜/环境参考）\n`;
    state.scenes.forEach(s=> md += `\n### ${s.name}（${s.作用||''}）\n- 设定：${s.description||''}\n- 即梦提示词（无人物）：${s.prompt||''}\n`);
  }
  if(state.storyboard.length){
    md += `\n## 五、分镜表（按章节，含时长）\n`;
    const groups = {};
    state.storyboard.forEach(s=>{ const k=s.章节||'未分组'; (groups[k]=groups[k]||[]).push(s); });
    const keys = Object.keys(groups).sort((a,b)=>{ const na=+a,nb=+b; return (!isNaN(na)&&!isNaN(nb))?na-nb:String(a).localeCompare(String(b),'zh'); });
    keys.forEach(k=>{
      const list = groups[k];
      const sec = list.reduce((a,s)=> a+(Number(s.时长)||0),0);
      md += `\n### 第${k}章（${list.length} 镜 · 总时长 ${sec}s）\n`;
      list.forEach(s=>{
        md += `\n**镜${s.镜号}**（${s.时长??3}s）｜ ${s.景别||''} ｜ ${s.角度||''} ｜ ${s.运镜||''} ｜ ${s.光线||''}\n`;
        if(s.主体) md += `- 主体：${s.主体}\n`;
        if(s.构图) md += `- 构图：${s.构图}\n`;
        md += `- 画面：${s.画面描述||''}\n`;
        if(s.对白) md += `- 对白：${s.对白}\n`;
        if(s.转场) md += `- 转场：${s.转场}\n`;
        md += `- 出图提示词：${s.出图提示词||''}\n`;
        if(s.连续性) md += `- 连续性：${s.连续性}\n`;
        if(s.剪辑动机) md += `- 剪辑动机：${s.剪辑动机}\n`;
      });
    });
  }
  return md;
}

function bindView(){
  bindCopyBtns();
  bindCharEdit();
  bindShotEdit();

  $$('.cyber-home-grid [data-step]').forEach(b=> b.onclick = ()=>{ if(!guardSwitchStep()) return; currentStep = +b.dataset.step; render(); window.scrollTo(0,0); });

  const idea = $('#ideaInput'); if(idea){
    idea.oninput = ()=>{ state.idea = idea.value; syncOrigIdeaCard(); };
    const _go0 = $('#btnGenOutline'); if(_go0) _go0.onclick = ()=> genOutline();
    const tsTg = $('#teamPick'); if(tsTg){
      tsTg.querySelectorAll('[data-team]').forEach(lb=>{
        lb.onclick = (e)=>{ e.preventDefault(); if(state.teamShape === lb.dataset.team) return; state.teamShape = lb.dataset.team; persist(); render(); toast(`叙事主体已切换为「${currentTeamShape().label}」`); };
      });
    }
  }
  bindPolishIdea();
  const _goB = $('#btnGenOutline'); if(_goB) _goB.onclick = ()=> genOutline();
  const _p2 = $('#polishCards2'); if(_p2) renderPolishCards(_p2);
  $$('[data-gen-outline]').forEach(b=> b.onclick = ()=> genOutline());
  bindDictMaster();
  bindDictEnrich();
  bindLongNovelMemoryRepo();
  bindLongNovelControlDeck();
  $$('[data-rec-fold]').forEach(h=> h.onclick = ()=>{
    const key = h.dataset.recFold;
    state.recipeSet = state.recipeSet || {};
    if(!state.recipeSet.recFold) state.recipeSet.recFold = {};
    state.recipeSet.recFold[key] = !state.recipeSet.recFold[key];
    const body = h.parentNode && h.parentNode.querySelector('.recipe-fold-b');
    if(body) body.hidden = !state.recipeSet.recFold[key];
    const ico = h.querySelector('.rec-fold-ico'); if(ico) ico.textContent = state.recipeSet.recFold[key]?'▾':'▸';
    h.setAttribute('aria-expanded', String(state.recipeSet.recFold[key]));
    persist();
  });
  function bindChapterCountInput(el){
    if(!el) return;
    el.addEventListener('keydown', e=>{ if(e.key==='Enter') el.blur(); });
    el.addEventListener('change', ()=>{
      const v = Math.floor(Number(el.value));
      if(Number.isInteger(v) && v>=1 && v<=200){
        const _o = state.outline;
        const _hasTitle = _o && Array.isArray(_o.chapters) && _o.chapters.some(c=>c && String(c.title||'').trim());
        if(_hasTitle && _o.chapters.length !== v){
          const oldLen = _o.chapters.length;
          const msg = oldLen > v
            ? `全书章节数将由 ${oldLen} 章减少为 ${v} 章：前 ${v} 章已有标题与正文将完整保留，末尾 ${oldLen - v} 章将被裁减。确定继续？`
            : `全书章节数将由 ${oldLen} 章增加为 ${v} 章：原有 ${oldLen} 章标题与正文将完整保留，后续 ${v - oldLen} 章将新增为空白待命。确定继续？`;
          if(!confirm(msg)){
            el.value = state.chapterCount || oldLen;
            return;
          }
          if(v < oldLen){
            _o.chapters = _o.chapters.slice(0, v);
            if(Array.isArray(state.chapters)) state.chapters = state.chapters.slice(0, v);
            if(Array.isArray(_o.chapterPlans)) _o.chapterPlans = _o.chapterPlans.slice(0, v);
          } else {
            while(_o.chapters.length < v){
              _o.chapters.push({ title: '', summary: '' });
            }
            if(!Array.isArray(state.chapters)) state.chapters = [];
            while(state.chapters.length < v){
              state.chapters.push({ title: '', content: '' });
            }
          }
          state.chapterCount = v;
          toast(`全书章节数已平滑调整为 ${v} 章，既有内容已保留`);
        }
        else if(_o && Array.isArray(_o.chapters) && _o.chapters.length>0 && _o.chapters.length !== v){
          const _hasPlans = Array.isArray(_o.chapterPlans) && _o.chapterPlans.some(Boolean);
          if(_hasPlans && !confirm(`规划师已生成过本章锚点/节拍表。章节数改为 ${v} 将按新数量重建章节占位（旧正文将清空重建）。继续？`)){ render(); return; }
          if(_hasPlans){ _o.chapterPlans = new Array(v).fill(null); }
          _o.chapters = Array.from({length:v}, ()=>({title:'', summary:''}));
          state.chapterCount = v;
        } else {
          state.chapterCount = v;
        }
      }
      else { state.chapterCount = null; toast('章节数需为 1-200 的整数'); }
      persist(); render();
    });
  }
  bindChapterCountInput($('#chapterCountIn'));
   bindChapterCountInput($('#totalWordsIn'));
   $$('input[name="bookBeat"]').forEach(r=>{
     r.onchange = ()=>{ state.bookBeat = +r.value; persist(); render(); };
   });
   $$('input[name="openingStrategy"]').forEach(r=>{
     r.onchange = ()=>{ state.openingStrategy = openingStrategyDef(r.value) ? r.value : 'none'; persist(); render(); };
   });
   bindGlossary();
  bindOrigIdea();
  bindOutlineFold();
  bindLoglineEdit();
  bindAiRecipe();
  bindChapterPlan();
  bindChapterPlanFold();
  bindChapterTitles();// v10.14 章节标题编辑 + 复制绑定
  bindWriteStyle();
  const btnCO = $('#btnConfirmOutline'); if(btnCO) btnCO.onclick = ()=>{ syncChaptersFromOutline(); state.outlineConfirmed=true; persist(); render(); };
  const btnRO = $('#btnReOutline'); if(btnRO) btnRO.onclick = ()=>{ state.outline=null; state.outlineConfirmed=false; state.chapters=[]; persist(); render(); };
  const btnGAShort = $('#btnGenAllChapters'); if(btnGAShort) btnGAShort.onclick = ()=> genManyChapters(state.chapters.length, true);
  bindGenBatchControls();
  bindRangeGen();

  if(isLong()){
    bindBeatSheet();
    bindFactCard();
    bindRollingSummaryCard();
    bindQualityReportCard();
    bindFixQueueCard();
  }

  const tmCur = $('#tmCur'); if(tmCur) tmCur.onclick = ()=>{
    const newName = prompt('修改书名：', currentTitle());
    if(newName == null) return; // 取消
    renameTitle(newName);
  };
  const histPanel_ = $('#tmHist');
  const triBtn = $('#btnTmTri');
  if(triBtn) triBtn.onclick = (e)=>{
    e.stopPropagation();
    const on = triBtn.classList.toggle('on');
    if(histPanel_) histPanel_.classList.toggle('hidden', !on);
  };
  if(histPanel_) histPanel_.onclick = (e)=> e.stopPropagation();
  $$('#tmHist [data-hist-restore]').forEach(b=> b.onclick = (e)=>{
    e.stopPropagation();
    if(!confirm(`将书名恢复为「${b.dataset.histRestore}」？（当前名会记入曾用名）`)) return;
    renameTitle(b.dataset.histRestore);
    histPanel_.classList.add('hidden');
    const tri = $('#btnTmTri'); if(tri) tri.classList.remove('on');
  });
  $$('#tmHist [data-hist-del]').forEach(b=> b.onclick = (e)=>{
    e.stopPropagation();
    if(!confirm('删除该条曾用名记录？')) return;
    state.titleHistory.splice(+b.dataset.histDel, 1);
    persist(); render();
    toast('已删除该记录');
  });
  document.addEventListener('click', (e)=>{
    const pan = $('#tmHist');
    if(pan && !pan.classList.contains('hidden') && !e.target.closest('.title-manager')){
      pan.classList.add('hidden');
      const b = $('#btnTmTri'); if(b) b.classList.remove('on');
    }
  });
  const longJump = $('#longJump'); if(longJump) longJump.onchange = ()=>{ const i=+longJump.value; if(longJump.value!=='') openReader(i); longJump.value=''; }; 
  if(isLong()) renderLongProgress();

  if(currentStep===2){
    const s = $('#charSearch'); if(s){
      s.oninput = ()=>{ charFilters.q = s.value; applyCharFilters(); };
    }
    const g = $('#charGender'); if(g){
      g.onchange = ()=>{ charFilters.gender = g.value; applyCharFilters(); };
    }
    const aMin = $('#ageMin'), aMax = $('#ageMax');
    if(aMin) aMin.oninput = ()=>{ charFilters.ageMin = aMin.value; applyCharFilters(); };
    if(aMax) aMax.oninput = ()=>{ charFilters.ageMax = aMax.value; applyCharFilters(); };
    initCharFilter();
  }
  const btnGC = $('#btnGenChars'); if(btnGC) btnGC.onclick = genCharacters;
  const btnCH = $('#btnCharHist'); if(btnCH) btnCH.onclick = ()=> openAssetHistPanel('characters');
  const btnGS = $('#btnGenScenes'); if(btnGS) btnGS.onclick = genScenes;
  const btnCV = $('#btnGenCover'); if(btnCV) btnCV.onclick = genCover;
  const btnCVH = $('[data-cover-hist]'); if(btnCVH) btnCVH.onclick = ()=> openAssetHistPanel('cover');
  $$('[data-cover-edit]').forEach(ta=>{
    ta.onchange = ()=>{ state.coverPrompt = ta.value; persist(); toast('封面提示词已保存'); };
  });
  $$('[data-cv]').forEach(b=> b.onclick = ()=>{
    const v = b.dataset.cv === 'title';
    if(state.coverWithTitle === v) return;
    state.coverWithTitle = v;
    state.coverPrompt = ''; // 切换模式后旧提示词不再适用，清空待重生成
    persist(); render();
  });
  const btnGB = $('#btnGenBoard'); if(btnGB) btnGB.onclick = genStoryboard;
  const btnBH = $('#btnBoardHist'); if(btnBH) btnBH.onclick = ()=> openAssetHistPanel('storyboard');
  const btnSH = $('#btnSceneHist'); if(btnSH) btnSH.onclick = ()=> openAssetHistPanel('scenes');
  $$('[data-scene-name]').forEach(inp=> inp.onchange = ()=>{ const s=state.scenes[+inp.dataset.sceneName]; if(s){ s.name=inp.value; persist(); } });
  $$('[data-scene-role]').forEach(inp=> inp.onchange = ()=>{ const s=state.scenes[+inp.dataset.sceneRole]; if(s){ s.作用=inp.value; persist(); } });
  $$('[data-scene-desc]').forEach(ta=> ta.onchange = ()=>{ const s=state.scenes[+ta.dataset.sceneDesc]; if(s){ s.description=ta.value; persist(); } });
  $$('[data-scene-prompt]').forEach(ta=> ta.onchange = ()=>{ const s=state.scenes[+ta.dataset.scenePrompt]; if(s){ s.prompt=ta.value; persist(); toast('场景提示词已保存'); } });
  const btnCA = $('#btnCopyAll'); if(btnCA) btnCA.onclick = ()=> copyText(buildMarkdown());
 
  if(isLong()){
    const lnCA = $('#lnCopyAll'); if(lnCA) lnCA.onclick = ()=> copyText(buildLongMarkdown());
const lnER = $('#lnExportReader'); if(lnER) lnER.onclick = openExportReader;
    $$('#view [data-expch]').forEach(cb=> cb.onchange = ()=>{
      const i = +cb.dataset.expch;
      if(cb.checked){ if(!state.expSel.includes(i)) state.expSel.push(i); } else state.expSel = state.expSel.filter(x=>x!==i);
      persist();
      syncExpChecks();
    });
    const selAll = $('#expSelAll'); if(selAll) selAll.onclick = ()=>{ state.expSel = state.chapters.map((c,i)=> (c.content && String(c.content).trim())?i:null).filter(x=>x!==null); persist(); syncExpChecks(); };
    const selNone = $('#expSelNone'); if(selNone) selNone.onclick = ()=>{ state.expSel=[]; persist(); syncExpChecks(); };
    $$('#view [data-expgroup-t]').forEach(t=> t.onclick = ()=>{
      const g = +t.dataset.expgroupT;
      const grp = t.closest('[data-expgroup]');
      const adding = !grp.classList.contains('open');
      grp.classList.toggle('open', adding);
      const ico = t.querySelector('.sc-fold-ico'); if(ico) ico.textContent = adding ? '▾' : '▸';
      if(adding){ if(!state.expOpenGroups.includes(g)) state.expOpenGroups.push(g); }
      else state.expOpenGroups = state.expOpenGroups.filter(x=>x!==g);
      persist();
    });
    const bt = $('#expTxt'); if(bt) bt.onclick = expText;
    const be = $('#expEpub'); if(be) be.onclick = expEpub;
    const bd = $('#expDocx'); if(bd) bd.onclick = expDocx;
  }

  renderChapters();
  const chaptersDelegate = (e)=>{
    const t = e.target.closest('[data-regen],[data-toggle],[data-read],[data-fold],[data-page],[data-ver],[data-undo],[data-ch-sum],[data-ne-resume-ch],[data-ne-partial-adopt],[data-plan-ch]');
    if(!t) return;
    if(t.hasAttribute('data-plan-ch')){ openSchoolPlanReader(+t.dataset.planGi, +t.dataset.planCh + 1); }
    else if(t.hasAttribute('data-ver')){ openChapterVersionPanel(+t.dataset.ver); }
    else if(t.hasAttribute('data-undo')){ undoChapterEdit(+t.dataset.undo); }
    else if(t.hasAttribute('data-regen')){ openChapterRegenPanel(+t.dataset.regen); }
    else if(t.hasAttribute('data-ch-sum')){ openChapterSummaryPanel(+t.dataset.chSum); }
    else if(t.hasAttribute('data-toggle')){ const i=+t.dataset.toggle; state.chapters[i].confirmed=!state.chapters[i].confirmed; persist(); render(); }
    else if(t.hasAttribute('data-read')){ openReader(+t.dataset.read); }
    else if(t.hasAttribute('data-ne-resume-ch')){ const i=+t.dataset.neResumeCh; continueAndFinalizeChapter(i, '继续生成'); }
    else if(t.hasAttribute('data-ne-partial-adopt')){ adoptChapterPartial(+t.dataset.nePartialAdopt); }
    else if(t.hasAttribute('data-fold')){ const i=+t.dataset.fold; const body=t.closest('.ch-card').querySelector('.ch-body'); const ico=t.querySelector('.ch-fold-ico'); const on = body.classList.toggle('folded'); t.setAttribute('aria-expanded', String(!on)); if(ico) ico.textContent = on?'▸':'▾'; }
    else if(t.hasAttribute('data-page')){ chPage = +t.dataset.page; renderChapters(); }
  };
  const cw = $('#chaptersWrap');
  if(cw && !cw.dataset.delegated){
    cw.dataset.delegated = '1';           // 只绑定一次，跨次 render 复用
    cw.addEventListener('click', chaptersDelegate);
    cw.addEventListener('input', (e)=>{
      const ta = e.target.closest('textarea[data-ch]'); if(!ta) return;
      const i = +ta.dataset.ch; state.chapters[i].content = ta.value;
      persist(); updateChapterWc(i, ta.value); updateWcTotal();
    });
    cw.addEventListener('focusin', (e)=>{
      const ta = e.target.closest('textarea[data-ch]'); if(!ta) return;
      const c = state.chapters[+ta.dataset.ch];
      ta._orig = c ? (c.content||'') : '';
    });
    cw.addEventListener('change', (e)=>{
      const ta = e.target.closest('textarea[data-ch]'); if(!ta) return;
      const i = +ta.dataset.ch; const c = state.chapters[i]; if(!c) return;
      const old = (ta._orig !== undefined) ? ta._orig : (c.content||'');
      if(ta.value !== old && String(ta.value||'') !== String(old||'')){
        if(!Array.isArray(c.editHistory)) c.editHistory = [];
        c.editHistory.push(old);
        if(c.editHistory.length > 10) c.editHistory.splice(0, c.editHistory.length - 10);   // 上限10
        persist(); renderChapters(); updateWcTotal();
        toast('已记录编辑快照，可用「↩ 撤销编辑」回退');
      }
    });
  }
  $$('[data-dur]').forEach(inp=> inp.oninput = ()=>{
    const i = +inp.dataset.dur;
    const v = parseFloat(inp.value);
    state.storyboard[i].时长 = isNaN(v)||v<=0 ? 0.5 : Math.min(30, v);
    persist(); updateBoardTiming();
  });
  bindReader();
}

function applyOutlineObject(o, opts){
  opts = opts || {};
  const oldChapters = (state.outline && state.outline.chapters) || [];
  const newN = state.chapterCount || oldChapters.length;
  if(newN && oldChapters.length === newN){
    o.chapters = oldChapters;
  } else {
    o.chapters = [];
  }
  const prevGloss = (state.outline && state.outline.glossary && sourceHasGlossary(state.outline.glossary)) ? state.outline.glossary : null;
  state.outline = o;
  normalizeOutline(state.outline);
  // 历史版本可能遗留 pendingV45；迁移为待确认建议，禁止注入正式词典。
  if(state.pendingV45){
    state.polishPendingSuggestions = JSON.parse(JSON.stringify(state.pendingV45));
    state.polishPendingSuggestions.status = 'pending_confirmation';
    state.polishPendingSuggestions.source = 'optimization_concept_legacy_migrated';
    delete state.pendingV45;
  }
  state.outlineConfirmed = false;
  if(prevGloss) o.glossary = prevGloss;
  else if(!o.glossary) o.glossary = {characters:[], places:[], propernouns:[]};
  if(!o.navBeacon){
    if(String(state.idea||'').trim()){
      const _idea = String(state.idea||'').trim();
      const _grab = (re)=>{ const _m = _idea.match(re); return (_m && _m[1]) ? _m[1].trim() : ''; };
      const _genre = _grab(/(?:题材|类型)[：:]\s*([^\n，。；;,]{1,20})/);
      const _prot  = _grab(/(?:主角|主人公|男主|女主)[：:]\s*([^\n，。；;,]{1,20})/);
      const _conf  = _grab(/(?:核心冲突|冲突|看点)[：:]\s*([^\n。；;]{2,40})/) || _idea.slice(0, 40);
      o.navBeacon = { genre:_genre, protagonist:_prot, coreConflict:_conf, tone:'' };
    }
  }
  if(!o.userIdea) o.userIdea = state.idea;
  if(!Array.isArray(o.chapterPlans)) o.chapterPlans = [];
  if(o.chapters.length){
    const _prev = (Array.isArray(state.chapters) && state.chapters.length === o.chapters.length) ? state.chapters : null;
    state.chapters = o.chapters.map((c,ci)=>{
      const p = _prev && _prev[ci];
      return {
        title: c.title,
        content: p ? String(p.content||'') : '',
        strip: p ? String(p.strip||'') : '',
        confirmed: p ? !!p.confirmed : false,
        _titleByAI: p ? !!p._titleByAI : false
      };
    });
  }
}

function syncChaptersFromOutline(){
  const o = state.outline;
  if(!o || !Array.isArray(o.chapters) || !o.chapters.length) return false;
  const cur = Array.isArray(state.chapters) ? state.chapters : [];
  if(cur.length === o.chapters.length) return false;   // 已对齐，无需同步
  if(cur.some(c=> c && c.content && String(c.content).trim())) return false;   // 有正文的错位项目不动
  state.chapters = o.chapters.map(c=>({
    title: String((c && c.title) || ''),
    content:'', strip:'', confirmed:false, _titleByAI:false
  }));
  return true;
}

function chapterContentStat(){
  const n = (state.chapters||[]).filter(c=> c && c.content && String(c.content).trim()).length;
  const curN = (state.outline && Array.isArray(state.outline.chapters) && state.outline.chapters.length) ? state.outline.chapters.length : (state.chapters||[]).length;
  return { hasContent: n>0, contentN: n, curN };
}
function confirmOutlineContentGuard(){
  const s = chapterContentStat();
  if(!s.hasContent) return true;
  const newN = chapterCountVal();
  if(s.curN && newN && s.curN !== newN){
    return window.confirm(`当前已写正文 ${s.contentN} 章（共 ${s.curN} 章），本次预设章数为 ${newN} 章。章数不同，新大纲生效后正文将无法按章节对应保留。继续生成？`);
  }
  return true;
}


const genOutline = async function(){
  const btn = $('#btnGenOutline') || $('[data-gen-outline]');
  const st = $('#outlineStatus');
  if(st){ st.className='status'; st.textContent=''; }
  if(!canRunAI('outline')){ toast('请先完成上游步骤：优化构想'); if(btn) busy(btn,false); return; }
  const adopted = currentCanonicalStoryStrategy();
  if(!adopted){ toast('请先在②优化构想中明确采用一个方案，建立唯一故事战略后再生成大纲'); if(btn) busy(btn,false); return; }
  if(dictmasterLocked()){ toast('词典达人已产出万物词典，②方案已锁定，不可再换选重搬'); if(btn) busy(btn,false); return; }
  if(!confirmOutlineContentGuard()){ if(btn) busy(btn,false); return; }
  markAIRunning('outline');
  if(btn) busy(btn,true,'搬运大纲中…');
  try{
    const o = buildOutlineFromPolishCanonical();
    applyOutlineObject(o, { silent: true });
    state.outlineConfirmed = true;
    state.polishCollapsed = true;
    markAIDone('outline');   // 成功后标记完成
    persist(); render();
    toast('已生成大纲：书名 / 小说简介 / 全书节拍已搬入，直接进入正文写作（书名仅用户可改）');
  }catch(e){
    if(e.name==='AbortError'){ if(st){ st.className='status'; st.textContent='已停止生成'; } }
    else {
      if(st){ st.className='status err'; st.textContent = e.message; }
      addToFixQueue({kind:'outline', error:e.message});
      toast('大纲生成失败：'+e.message);
    }
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='outline');
    hideStopBtn(); if(btn) busy(btn,false);
  }
};

function selectedPolishCandidate(){
  const canonical=currentCanonicalStoryStrategy();
  if(canonical) return canonical.humanView || canonical.creationBlueprint || null;
  const opts = Array.isArray(state.polishOptions) ? state.polishOptions : [];
  if(!opts.length) return null;
  if(state.polishMode !== 'multi' && opts.length === 1){
    return (state.polishStatus === 'adopted' || state.polishAdopted) ? opts[0] : null;
  }
  if(state.polishSelectedId){ const hit = opts.find(o=>o && o._id===state.polishSelectedId); if(hit) return hit; }
  if(state.polishAdopted){ const hit = opts.find(o=>o && o.name===state.polishAdopted); if(hit) return hit; }
  return null;
}
function dictmasterLocked(){
  if(!state.dictmasterRan) return false;
  const g = (state.outline && state.outline.glossary) || null;
  if(!g) return false;
  return (g.characters && g.characters.length) || (g.places && g.places.length) || (g.propernouns && g.propernouns.length) ? true : false;
}
function extractCandidateBookName(txt){
  const s = String(txt||'');
  const kv = s.match(/(?:^|\n)\s*(?:书名|小说名|标题|名称)\s*[:：]\s*([^\n]{1,30})/);
  if(kv && kv[1]) return kv[1].trim().replace(/[】\]\)]/g,'');
  const bk = s.match(/[《<]([^《》<>]{1,30})[》>]/);
  if(bk && bk[1]) return bk[1].trim().replace(/[】\]\)]/g,'');
  return '';
}
function stripStructureFromIntro(txt){
  const s = String(txt||'');
  if(!s) return s;
  const lines = s.split('\n');
  const out = [];
  let skip = false;
  const fieldHead = /^\s*(?:书名|小说名|标题|题材|主角|核心冲突|世界观|对手|动机|风格|落地方式|目标|核心词|推荐理由|简介|评分|一句话|定位|优势|亮点)\s*[:：]/;
  const dropLine = /^\s*(?:书名|小说名|标题|推荐理由)\s*[:：]/;   // 单行命名字段：直接剔除
  for(const ln of lines){
    if(!skip && /^\s*结构(?:\s*（[^）]*）)?\s*[:：]/.test(ln)){ skip = true; continue; }
    if(skip){
      if(fieldHead.test(ln)){ skip = false; out.push(ln); }
      continue;
    }
    if(dropLine.test(ln)) continue;
    out.push(ln);
  }
  return out.join('\n').replace(/\n{2,}/g, '\n').trim() || s.trim();
}
function renderLoglineHtml(txt){
  const s = stripStructureFromIntro(txt);
  const ls = String(s||'').trim().split('\n');
  if(!ls.length || !(ls[0]||'').trim()) return '';
  const labelSet = new Set(['书名','小说名','标题','题材','主角','核心缺陷','钩点','核心冲突','风格','目标','核心词','世界观','对手','动机','特点','亮点','定位','基调','金手指','展开','结局','综上','核心看点','设定','走向','看点','卖点','矛盾','成长','悬念','反转']);
  const re = /^([^\s：:（(]{1,10})\s*[:：]\s*(.*)$/;
  const presetHue = {题材:165,主角:218,核心冲突:12,风格:278,目标:128,核心词:332,世界观:188,对手:30,动机:306,特点:46,亮点:52,定位:232,基调:200,金手指:284,展开:358,结局:160,核心看点:20,设定:110,走向:60,看点:327,卖点:301,矛盾:345,成长:95,悬念:244,反转:14};
  function labelHue(name){ if(presetHue[name]!=null) return presetHue[name]; let h=0; for(const c of name) h=(h*31+c.codePointAt(0))%360; return h; }
  return ls.map(ln=>{
    const m = ln.match(re);
    if(m && labelSet.has(m[1].trim())){
      const nm = m[1].trim();
      return `<div class="so-line"><span class="so-lb" style="--h:${labelHue(nm)}">${esc(nm)}</span><span class="so-txt">${esc(m[2])}</span></div>`;
    }
    return `<div class="so-line so-plain">${esc(ln)}</div>`;
  }).join('');
}
function polishCandidateDownstreamText(cand){
  const c = cand || {};
  const summary = String(c.novelSummary || c.storySummary || '').trim();
  const beat = c.fullBookBeat || c.bookBeat || c.fullNovelBeat || '';
  const blueprint = String(c.optimizedIdea || c.text || '').trim();
  const clean = (v)=>String(v||'').replace(/(?:^|\n)\s*(?:核心卖点|核心词|推荐理由|卖点|关键词|营销分析)\s*[:：][^\n]*/g,'').trim();
  return { summary: clean(summary), beat: clean(typeof beat==='string' ? beat : JSON.stringify(beat)), blueprint: clean(blueprint) };
}
function buildOutlineFromPolishCanonical(){
  if(!currentCanonicalStoryStrategy()) {
    throw new Error('未建立唯一已采用的优化构想蓝本，不能生成大纲');
  }
  const adopted = currentCanonicalStoryStrategy();
  const human = adopted.humanView || adopted.creationBlueprint || {};
  const txt = String(human.optimizedIdea || '').trim();
  const d = {
    summary:String(human.novelSummary||'').trim(),
    beat:String(human.fullBookBeat||'').trim(),
    blueprint:String(human.optimizedIdea||'').trim()
  };
  const o = state.outline || {};
  const curTitle = (o && o.title) || '';
  const title = String(human.bookTitle || '').trim() || extractCandidateBookName(txt) || curTitle || ''; 
  const prevGloss = (o && o.glossary && sourceHasGlossary(o.glossary)) ? o.glossary : null;
  const build = {
    title,
    // 这里不再把整张优化卡直接当简介，而是只搬运面向下游创作的小说简介。
    logline: d.summary || stripStructureFromIntro(txt) || (o && o.logline) || '',
    // 供词典达人/校长/老师继续创作的完整故事蓝本；营销分析不进入此字段。
    storyBlueprint: d.blueprint,
    // 优化构想生成的全书宏观节拍，作为当前预设节拍的“剧情内容层”。
    aiBookBeat: d.beat,
    polishSourceName: String(adopted.candidateName || '').trim(),
    canonicalStoryStrategy: JSON.parse(JSON.stringify(adopted)),
    userIdea: String(state.idea || '').trim(),
    tone: (o && o.tone) || ''
  };
  if(prevGloss) build.glossary = prevGloss;
  else build.glossary = { characters:[], places:[], propernouns:[], subplots:[] };
  return build;
}

const DICTMASTER_SYS = `你是一位资深全题材长篇小说「词典达人」（全局设定架构师）。

你的职责不是简单提取名词，也不是把用户故事机械扩写成一堆设定。

你的真正职责是：根据用户已经确定的故事蓝本，建立一套能够长期支撑整部小说创作的「万物设定词典」，并把其中真正重要、真正稳定、真正值得长期遵守的内容定稿为全局世界基准。

你是整条小说 AI 创作链中的「世界设定源头」。后续的「词典充实」「校长」「老师」「正文 AI」都必须以你正式定稿的核心世界事实为基础。

因此：你可以大胆创造，但必须谨慎定稿。一旦内容进入正式词典，就会成为后续创作可以依赖的正式世界事实。

【一、最高原则｜用户蓝本优先】
你将获得②优化构想所选方案的完整原文，其中包含书名、题材、主角、核心冲突、世界观、对手、动机、风格、结构、核心词，以及用户明确指定的人物、地点、专名、势力、规则等。

这份内容是本次创作的唯一蓝本。

1. 用户已经明确写出的设定，是最高事实依据。
2. 蓝本中已经出现的人物、地名、专名必须全部保留。
3. 固定名称必须逐字原样保留，不得擅自改名。
4. 不得删除用户明确指定的核心内容。
5. 不得因为你认为另一种设定更精彩而推翻用户设定。
6. 不得偷偷改变主角、核心冲突、题材、世界观方向或人物核心立场。
7. 你的优化只能是深化、补足、结构化、体系化、提高长期可写性，而不是改故事。
8. 如果用户蓝本已经足够具体，则以忠实整理和精确强化为主，不要为了证明自己会创造而过度创造。

【二、词典达人与词典充实的权限边界】
词典达人负责建立和定稿核心世界基准，拥有世界架构与核心 Canon 定稿权。

词典充实只能在达人已经建立的世界里继续扩建，负责补充人物生活层、次要人物、生活环境、关键场景、行业生态、地域特色、辅助专名等；不能反向修改达人已经定稿的核心事实。

因此，你必须建立稳定、准确、可长期复用的世界骨架，而不是把所有可能想到的生活细节全部塞进核心词典。

【三、核心世界事实准入原则】
正式进入词典的内容，至少应满足以下之一：
1. 用户蓝本明确指定的重要内容；
2. 理解主线不可缺少的核心设定；
3. 主角长期行动必须依赖的世界事实；
4. 核心人物长期存在所需要的稳定信息；
5. 未来多个章节可能反复使用的重要地点；
6. 世界观运行不可缺少的规则；
7. 核心专名、装备、体系、能力、组织或机制；
8. 人物之间长期关系的重要事实；
9. 能够支撑长期剧情发展的重要世界结构。

如果一个内容只是一次性小物件、普通家具、普通街道、普通天气、普通食物、普通交通工具、普通手机、普通办公室、普通医院、普通商店、普通衣服，并且没有特殊故事价值，不要加入正式词典。

词典不是百科全书，而是小说长期创作的稳定世界资产库。

【四、禁止通用泛词污染】
严禁把普通泛指事物当成专名、地名或世界观设定。

例如：街道、大门、房间、办公室、医院、学校、汽车、手机、电脑、茶杯、桌子、傍晚、雨天、普通警察局、普通餐厅等，不能仅因为故事中可能出现就进入正式词典。

只有当其具有独立名称、独立身份、独立机制、独立历史、独立势力归属、独立故事功能或明确不可替代性时，才可以进入正式词典。

核心原则：宁缺毋滥。

【五、允许新增设定，但必须有依据】
你可以创造用户原文没有直接写出的新内容，但新增内容必须与用户蓝本、题材、已有世界观、人物动机、核心冲突一致，并且对长期小说创作具有实际价值。

“用户没有写”不等于“你可以随便写”。

可以进行合理推导，但禁止凭空增加会改变故事方向的重大核心设定，例如超自然能力、新核心世界规则、新核心组织体系等，除非用户蓝本本身已经提供依据。

【六、人物设计原则】
characters 是最重要的核心资产之一。人物应重点保证 name、identity、age、gender、appearance、hobby、relation、trait、catchphrase 的可用性。

但绝不能为了填满字段而虚构人物信息，尤其禁止机械制造“喜欢咖啡”“喜欢看书”“喜欢散步”或无实际价值的口头禅。

没有依据或没有长期价值时，可以写“未知”或“无”。identity 与 trait 应尽量明确，因为它们直接影响后续人物塑造。

人物必须具备：真实身份、合理行为逻辑、稳定性格、明确关系和长期价值。

如果角色只需要出现一次，应优先留给后续「词典充实」阶段，而不是在这里制造完整核心人物。

【七、人物关系表必须真实】
relationshipTable 只能记录人物↔人物之间的真实关系，例如血缘、亲属、师徒、上下级、同事、朋友、敌对、利益、情感、合作、利用、恩怨、阵营等。

严禁人物↔地名、人物↔道具、人物↔功能、人物↔性格等错误关系。

每条关系必须满足：a 是真实人物、b 是真实人物、a≠b、relation 有实际意义；不能凑数。没有真实关系时输出空数组。

【八、地名设计原则】
places 只记录真正具有故事专属性的地点：核心城市、关键建筑、主角长期活动地点、核心组织所在地、重要据点、特殊区域、关键险境、重要机构或具有独特历史的地点。

普通街道、房间、办公室、餐厅、医院、商场、学校等，不能仅因为故事经过就进入词典。

判断标准：以后正文写到它时，是否需要保持固定设定？如果不需要，就不应该进入核心词典。

【九、地名关联表必须是真实关系】
placeContacts 只能记录地名↔地名之间真实存在的相邻、隶属、交通连接、通往、上下级区域、城市与辖区、据点与外围区域等关系。

严禁地名↔人物、地名↔道具、地名↔功能等错误关系。两端必须是真实地名且不能相同。没有真实关系时输出空数组。

【十、专名设计原则】
propernouns 用于真正具有专属性的核心名称，例如核心武器、装备、特殊道具、科技、能力、材料、系统、交通工具、特殊组织、制度、核心机制、世界观专属体系、重要术语等。

普通汽车、手机、电脑、手枪、咖啡、衣服等不能自动成为专名。只有拥有独立名称、来源、机制、历史、特殊能力、限制或不可替代故事作用时才进入 propernouns。

【十一、专名关联表必须真实】
properContacts 只能记录专名↔专名之间真实存在的配套、克制、来源、衍生、升级、前置、同系列、等级、技术或制度关系。

禁止专名↔人物、专名↔地名、专名↔功能等错误关系。两端必须是真实专名且不能相同。没有真实关系时输出空数组。

【十二、世界观规则必须真正能执行】
worldRules 不能写成空泛口号。

每条规则应尽可能体现：适用范围 → 触发条件 → 运作机制 → 限制 → 违反后果/代价。

例如“只有获得正式执照的术士才能进入禁区；未经授权进入者会被守门机构追捕并永久取消术士资格”才属于可执行规则，而“强者拥有更高地位”只是空泛描述。

每条 worldRules 必须尽可能明确：谁适用、什么情况下适用、如何运作、有什么限制、违反后如何处理、使用需要付出什么代价。

【十三、题材适配原则】
所有设定必须服务于当前小说题材，不能机械套用其他题材模板。

都市重点考虑职业、社会关系、城市结构和现实制度；科幻重点考虑科技、能源、通讯、交通、AI与社会结构；历史重点考虑时代制度、等级、生产方式、交通、物质条件；玄幻/仙侠重点考虑修炼体系、力量层级、资源、门派、禁忌、代价；奇幻重点考虑种族、魔法、地理和阵营；悬疑/推理重点考虑信息边界、证据、职业逻辑、动机、时间线和地理关系；末世重点考虑生存资源、医疗、交通、组织；言情重点考虑人物关系、职业、生活场景和社会关系。

【十四、实体去重原则】
创造任何新实体前，必须检查用户蓝本中已经存在的实体。

不能重复创建同一人物、地点或专名，也不能用“青年版”“新址”“二号”等方式绕过重复。

一个正式实体对应一个稳定名称。如果已有名称，就继续使用原名称；只有真正不同、具有独立身份的实体才能建立新名称。

【十五、名称字段必须纯净】
name 字段只能写实体名称。

禁止写成“周启明（公司保安）”“北港车站（重要交通枢纽）”“霜火引擎——新型动力系统”等。

身份、功能、关系、背景、描写全部放到其他字段。

【十六、禁止偷偷修改核心事实】
绝对禁止修改人物姓名、身份、核心性格、核心关系、立场；修改地点名称或基本属性；修改专名核心功能；修改用户明确世界规则；删除用户明确指定的核心实体；用新实体覆盖旧实体；为了丰富关系表而改变人物关系；为了复杂化世界观而增加无依据的核心规则。

【十七、创造优先级】
自行补充时依次优先：
1. 解决用户故事中已有的明显世界设定缺口；
2. 支撑主角和核心人物长期行动；
3. 支撑核心剧情未来发展；
4. 建立必要世界运行规则；
5. 建立重要地点、专名、组织和体系；
6. 补充能够增强长期真实感的辅助设定。

不要把大量精力用于无关紧要的日常物件、一次性人物或无法影响正文的细枝末节。

【十八、宁缺毋滥】
如果一个设定没有长期用途、剧情价值、世界展示价值、角色价值或规则价值，就不要创造。

词典质量不是由条目数量决定，而是由核心准确、关系清晰、规则稳定、长期可用决定。

宁可少一个，也不要把错误事实写入正式世界。

【十九、下游兼容原则】
你的输出会成为词典充实、校长、老师、正文 AI 的基础。

词典充实必须能在你的世界基准上继续扩建；校长必须能依据它组织全书；老师必须能依据它安排章节；正文 AI 必须能把它当作稳定创作事实。

因此任何进入正式词典的内容，都必须经得起长期正文使用。

【二十、输出格式｜绝对契约】
严格只输出 JSON，不要输出解释、前言、后记、分析、Markdown、代码围栏或任何 JSON 之外的文字。

必须严格使用以下字段，字段名绝对不能修改：
{"characters":[{"name":"","identity":"","age":"","gender":"","appearance":"","hobby":"","relation":"","trait":"","catchphrase":""}],"relationshipTable":[{"a":"人物名称","b":"人物名称","relation":"关系","note":"一句话说明"}],"places":[{"name":"","type":"","note":""}],"placeContacts":[{"from":"地名","to":"地名","relation":"联系","note":""}],"propernouns":[{"name":"","note":""}],"properContacts":[{"from":"专名","to":"专名","relation":"联系","note":""}],"worldRules":[{"cat":"规则类别","scope":"适用对象/范围","rule":"具体运转规则及违反后果/代价"}],"summary":"一句话总结这套词典最重要的世界架构亮点"}

【二十一、字段契约】
characters：name 必须是纯人物姓名；identity 为身份定位；age/gender/appearance/hobby/relation/catchphrase 没有依据或没有实际价值时可以写“未知/无”；trait 必须尽量明确。relation 简洁说明即可，不要把多组关系堆进人物卡，多组关系放 relationshipTable。

places：name 必须为纯地点名称；type 明确；note 说明关键设定。

propernouns：name 必须为纯专名；note 说明来源、机制、功能、限制或故事价值。

worldRules：必须含 cat、scope、rule；规则必须贴合题材社会性质，可执行、可校验，并尽可能写清运作规则与违反后果/代价。

summary：只用一句话总结词典架构亮点。

【二十二、关联表严格要求】
三种关联表全部宁缺毋滥。

relationshipTable：两端必须是人物；a≠b。
placeContacts：两端必须是地名；from≠to。
properContacts：两端必须是专名；from≠to。

禁止把属性、功能、说明、子项或空字符串当作另一端凑数。

【二十三、输出前最终自检】
在输出 JSON 之前必须内部完成以下检查：

A. 蓝本检查：是否完整尊重用户蓝本；是否保留所有明确指定的重要实体；是否修改名称；是否改变主角、核心冲突、题材、世界观方向或人物核心立场。

B. 人物检查：人物是否值得进入核心词典；identity 与 trait 是否清晰；是否为了填字段虚构爱好或口头禅；是否存在重复人物或同名不同人。

C. 地名检查：是否真正具有故事专属性；是否误收普通地点；名称是否纯净；是否重复。

D. 专名检查：是否真正具有专属性；是否只是普通物品；是否具有独立故事价值；名称是否纯净；是否重复。

E. 人物关系表检查：每条 a、b 是否都是真实人物；是否不同；relation 是否真实；是否凑数。

F. 地名关联表检查：每条 from、to 是否都是真实地名；是否不同；relation 是否真实；是否凑数。

G. 专名关联表检查：每条 from、to 是否都是真实专名；是否不同；relation 是否真实；是否凑数。

H. 世界规则检查：是否真正属于世界规则；是否有适用范围；是否可执行、可校验；是否有必要；是否与蓝本冲突；是否存在明显逻辑漏洞；是否有明确限制或后果/代价。

I. 题材检查：是否符合当前小说题材；是否出现明显时代、科技、社会、生活方式或力量体系错误。

J. 下游检查：词典充实是否能在这些设定上继续扩建；校长是否能据此组织全书；老师是否能据此安排章节；正文 AI 是否能据此稳定写作。

如果某个设定会给后续 AI 制造歧义，优先修正，而不是保留。

【二十四、最终输出原则】
经过全部检查后，只输出最终 JSON。不要输出任何解释、Markdown、代码围栏、自检过程或 JSON 之外的字符。

最终目标不是生成最多的设定，而是建立一套准确、稳定、自洽、可长期使用，并能够成为整部小说世界基准的「万物设定词典」。

记住：词典达人负责创造世界骨架；词典充实负责在骨架上继续长出血肉；前者必须定得准，后者才能扩得稳。`
function buildDictMasterUser(ctx){
  const canonical = currentCanonicalStoryStrategy();
  const human = (canonical && (canonical.humanView || canonical.creationBlueprint)) || {};
  const txt = String(human.optimizedIdea || '').trim();
  const parts = [];
  parts.push(canonicalStoryStrategyBlock('当前有效故事战略（词典达人唯一输入蓝本）'));
  parts.push(('【采用蓝本完整内容（唯一下游故事来源；已有角色/地名/专名不可擅自改动）】\n' + txt) || '（采用蓝本为空）');
  return parts.join('\n\n');
}
function validateDictMasterOutput(j){
  if(!j || typeof j !== 'object') return '返回不是对象';
  if(!Array.isArray(j.characters) || !j.characters.length) return '人物卡 characters 为空（应至少 1 位）';
  for(const c of j.characters){
    if(!c || !String(c.name||'').trim()) return '存在人物缺少 name';
    const must = {identity:c.identity, trait:c.trait};
    for(const [kk,vv] of Object.entries(must)){ if(!String(vv||'').trim()) return `人物「${String(c.name).trim()||'?'}」缺字段 ${kk}`; }
    for(const kk of ['age','gender','appearance','hobby','relation','catchphrase']){ if(!String(c[kk]||'').trim()) c[kk]='未知'; }
    if(String(c.relation||'').trim().length > 40) return `人物「${String(c.name).trim()||'?'}」relation 超过 40 字，疑似把多组关系堆进摘要：只写 ≤20字 的一句话（如「主角的青梅」），多组关系的逐条明细放 relationshipTable`;
  }
  if(!Array.isArray(j.relationshipTable)) return '缺少 relationshipTable 数组';
  const places = Array.isArray(j.places)?j.places:[];
  const props = Array.isArray(j.propernouns)?j.propernouns:[];
  if(!places.length && !props.length) return '缺少 places 或 propernouns';
  for(const p of places){ if(p && (!String(p.name||'').trim()||!String(p.type||'').trim()||!String(p.note||'').trim())) return `地名「${String(p&&p.name||'').trim()||'?'}」信息不全（需 type+note）`; }
  for(const p of props){ if(p && (!String(p.name||'').trim()||!String(p.note||'').trim())) return `专名「${String(p&&p.name||'').trim()||'?'}」缺 note`; }
  const wr = Array.isArray(j.worldRules)?j.worldRules:[];
  if(!wr.length) return '缺少 worldRules（世界观规则，应 ≥1 条）';
  for(const r of wr){ if(r && (!String(r.cat||'').trim()||!String(r.rule||'').trim())) return `世界观规则「${String(r&&r.cat||'').trim()||'?'}」缺失 cat 或 rule`; }
  for(const [key,aa,bb,lab] of [['relationshipTable','a','b','人物关系表'],['placeContacts','from','to','地名关联表'],['properContacts','from','to','专名关联表']]){
    const arr = Array.isArray(j[key]) ? j[key] : [];
    for(const e of arr){
      if(!e || typeof e !== 'object') continue;
      const A=String(e[aa]||'').trim(), B=String(e[bb]||'').trim();
      const hasRest = String(e.relation||'').trim() || String(e.note||'').trim();
      if(hasRest && (!A || !B)) return `${lab}存在端名不全的条目（${lab}每条必须两端都填真实名称，禁止把功能/属性/子项当作另一端凑数）`;
      if(A && B && A===B) return `${lab}「${A}」两端相同（自身对自身无意义）`;
    }
  }
  return '';
}
function collapseGlossaryAfterDictionaryGeneration(){
  state.gsCollapsed = true;
  state.gsCatFold = Object.assign({}, state.gsCatFold || {}, {
    main:true, support:true, walkon:true, place:true, proper:true, sub:true
  });
  persist();
}

async function genDictMaster(btn){
  const o = state.outline;
  const st = $('#dictmasterStatus');
  if(st){ st.className='status'; st.textContent=''; }
  if(!canRunAI('dictmaster')){ toast('请先完成上游：②优化构想并选中一个方案'); return false; }
  invalidateSchoolDownstream('dictMaster');
  if(!currentCanonicalStoryStrategy()){ toast('先在优化构想中采用一个方案，建立唯一故事战略'); return false; }
  state.originalIdeaSnapshot = String(state.idea || '').trim() || state.originalIdeaSnapshot;
  markAIRunning('dictmaster');
  if(btn) busy(btn,true,'生成万物词典中…');
  if(btn && btn.parentNode) showStopBtn(btn.parentNode);
  try{
    const spec = resolveActiveSpec('dictmaster');
    const temp = (spec && spec.dictmasterTemp != null) ? spec.dictmasterTemp : 0.4;
    const txt = await callAIGuarded('dictmaster', {}, {temperature: temp, maxTokens: 16384, signal: _abortCtl?.signal});
    const j = extractJsonObject(txt);
    if(!j){ throw new Error('AI 未返回可用的词典 JSON'); }
    const v = validateDictMasterOutput(j);
    if(v) throw new Error('词典校验失败：'+v);
    o.glossary = o.glossary || { characters:[], places:[], propernouns:[], subplots:[] };
    const snapKeys = { characters:['name','identity','age','gender','appearance','hobby','relation','trait','catchphrase'], places:['name','type','note'], propernouns:['name','note'] };
    const entryJson = (x,k)=>{ const o2={}; (snapKeys[k]||[]).forEach(f=> o2[f]=String((x && x[f])!=null ? x[f] : '').trim()); try{ return JSON.stringify(o2); }catch(e){ return ''; } };
    ['characters','places','propernouns'].forEach(k=>{
      const kept=[];
      (o.glossary[k]||[]).forEach(x=>{
        if(x && x._dictmaster){
          if(x._srcSnapshot && entryJson(x,k) !== x._srcSnapshot){
            delete x._dictmaster; delete x._srcSnapshot;
          } else {
            return;
          }
        }
        kept.push(x);
      });
      o.glossary[k]=kept;
    });
    const push = (list,k,mapper)=>{
      const existing = new Set((o.glossary[k]||[]).map(x=>x && String(x.name||'').trim()).filter(Boolean));
      (list||[]).forEach(it=>{
        const nm=String((it && it.name)||'').trim(); if(!nm) return;
        if(existing.has(nm)) return;   // 同名让位
        o.glossary[k]=o.glossary[k]||[];
        const e = (mapper?mapper(it):{ name:nm, note:String(it.note||'').trim() });
        e._dictmaster=true; e._srcSnapshot=entryJson(e,k);
        o.glossary[k].push(e); existing.add(nm);
      });
    };
    push(j.characters, 'characters', c=>({ name:String(c.name||'').trim(), identity:String(c.identity||'').trim(), age:String(c.age||'').trim(), gender:String(c.gender||'').trim(), appearance:String(c.appearance||'').trim(), hobby:String(c.hobby||'').trim(), relation:String(c.relation||'').trim(), trait:String(c.trait||'').trim(), catchphrase:String(c.catchphrase||'').trim() }));
    push(j.places, 'places', p=>({ name:String(p.name||'').trim(), type:String(p.type||'').trim(), note:String(p.note||'').trim() }));
    push(j.propernouns, 'propernouns', p=>({ name:String(p.name||'').trim(), note:String(p.note||'').trim() }));
    o.glossary._relationshipTable = (j.relationshipTable||[]).map(x=>({ a:String(x.a||'').trim(), b:String(x.b||'').trim(), relation:String(x.relation||'').trim(), note:String(x.note||'').trim() }));
    o.glossary._placeContacts = (j.placeContacts||[]).map(x=>({ from:String(x.from||'').trim(), to:String(x.to||'').trim(), relation:String(x.relation||'').trim(), note:String(x.note||'').trim() }));
    o.glossary._properContacts = (j.properContacts||[]).map(x=>({ from:String(x.from||'').trim(), to:String(x.to||'').trim(), relation:String(x.relation||'').trim(), note:String(x.note||'').trim() }));
    o.glossary._worldRules = (j.worldRules||[]).map(x=>({ cat:String(x.cat||'').trim(), scope:String(x.scope||'').trim(), rule:String(x.rule||'').trim() }));
    const result = { ts: Date.now(), book: (o.title)||'', summary:String(j.summary||'').trim(), nChar:(j.characters||[]).length, nPlace:(j.places||[]).length, nProp:(j.propernouns||[]).length, nRel:(j.relationshipTable||[]).length, nPC:(j.placeContacts||[]).length, nPRC:(j.properContacts||[]).length, nWR:(j.worldRules||[]).length, characters:j.characters||[], rel:j.relationshipTable||[], places:j.places||[], pc:j.placeContacts||[], props:j.propernouns||[], prc:j.properContacts||[], wr:j.worldRules||[] };
    state.dictmasterLatest = result;
    state.dictmasterHistory = Array.isArray(state.dictmasterHistory) ? state.dictmasterHistory : [];
    state.dictmasterHistory.unshift(result);
    if(state.dictmasterHistory.length > 6) state.dictmasterHistory = state.dictmasterHistory.slice(0, 6);   // 第 7 次最旧被挤出
    state.dictmasterRan = true;
    storyState().canon.dictmasterAt=Date.now(); ssEnsureCanonEntities(); ssCaptureMasterSnapshot(); storyState().versions.dictMaster=Number(storyState().versions.dictMaster||0)+1; storyState().pipelineVersion=(Number(storyState().pipelineVersion)||0)+1; storyState().docs=storyState().docs||{}; storyState().docs.worldCanon={version:storyState().versions.dictMaster,source:'dictmaster',ts:Date.now(),counts:{characters:(o.glossary.characters||[]).length,places:(o.glossary.places||[]).length,propernouns:(o.glossary.propernouns||[]).length,worldRules:(o.glossary._worldRules||[]).length}};
    persist(); render();
    collapseGlossaryAfterDictionaryGeneration();
    render();
    markAIDone('dictmaster');
    toast(`万物词典已生成：人物 ${result.nChar} 位 · 地名 ${result.nPlace} · 专名 ${result.nProp} · 关系表 ${result.nRel} 条 · 世界观规则 ${result.nWR} 条（已并入万物词典）`);
    return true;
  }catch(e){
    if(e.name !== 'AbortError') addToFixQueue({kind:'dictmaster', error:e.message});
    toast(e.name==='AbortError' ? '已停止生成万物词典' : '万物词典生成失败：'+e.message);
    if(st){ st.className='status err'; st.textContent = e.message; }
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='dictmaster');
    hideStopBtn(); if(btn) busy(btn,false);
  }
}
function dictMasterBlockHtml(){
  const g = (state.outline && state.outline.glossary) || null;
  const hasOut = !!state.dictmasterLatest && g && ((g.characters&&g.characters.length)||(g.places&&g.places.length)||(g.propernouns&&g.propernouns.length));
  const locked = dictmasterLocked();
  const histN = Array.isArray(state.dictmasterHistory) ? state.dictmasterHistory.length : 0;
  const status = `<p id="dictmasterStatus" class="status" style="margin:8px 0 0"></p>`;
  if(hasOut){
    const r = state.dictmasterLatest || {};
    const relArr = validAssoc(g._relationshipTable,'a','b');
    const pcArr  = validAssoc(g._placeContacts,'from','to');
    const prcArr = validAssoc(g._properContacts,'from','to');
    const wrArr  = ((g&&g._worldRules)||[]).filter(x=>x&&String(x.rule||'').trim());
    const relRows = relArr.slice(0,8).map(x=>`<div class="dm-rel"><b>${esc(x.a||'')}</b> ←${esc(x.relation||'')}→ <b>${esc(x.b||'')}</b>${x.note?` <span class="muted">· ${esc(x.note)}</span>`:''}</div>`).join('');
    const contactRow = x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}${x.note?('：'+esc(x.note)):''}</span></div>`;
    const pcRows = pcArr.map(contactRow).join('');
    const prcRows = prcArr.map(contactRow).join('');
    const wrRows = wrArr.map(x=>`<div class="dm-wr"><b>${esc(x.cat||'')}${String(x.scope||'').trim()?` · ${esc(String(x.scope).trim())}`:''}</b><div>${esc(x.rule||'')}</div></div>`).join('');
  const hue = s=>{ let h=0; for(const ch of String(s||'')) h=(h*31+ch.codePointAt(0))%360; return h; };
  const _labels = { identity:'身份', age:'岁数', gender:'性别', appearance:'外貌', hobby:'爱好', catchphrase:'口头禅', relation:'关系', trait:'性格', type:'类型', note:'说明' };
  const detailLines = (o, keys)=> keys.map(k=> (o && String(o[k]||'').trim())
    ? `<div class="dmt-line"><b>${esc(_labels[k]||k)}</b><span>${esc(String(o[k]).trim())}</span></div>` : '').join('');
  const chip = nm=>`<b class="de-chip" style="--h:${hue(nm)}">${esc(nm)}</b>`;
  const charRow = c=>`<details class="dmt-entry"><summary>${chip(c.name)}<span class="muted dmt-brief">${esc([c.identity,c.gender,c.age].filter(Boolean).join(' · ')||'（无简介）')}</span></summary><div class="dmt-body">${detailLines(c,['identity','age','gender','appearance','hobby','catchphrase','relation','trait'])||'<span class="muted">（无字段）</span>'}</div></details>`;
  const placeRow = p=>`<details class="dmt-entry"><summary>${chip(p.name)}<span class="muted dmt-brief">${esc([p.type,p.note].filter(Boolean).join(' · ')||'')}</span></summary><div class="dmt-body">${detailLines(p,['type','note'])||''}</div></details>`;
  const propRow  = p=>`<details class="dmt-entry"><summary>${chip(p.name)}<span class="muted dmt-brief">${esc(String(p.note||'').trim()||'')}</span></summary><div class="dmt-body">${detailLines(p,['note'])||''}</div></details>`;
  const charMain = (g.characters||[]).filter(c=>c && c.tier!=='support');
  const charSup  = (g.characters||[]).filter(c=>c && c.tier==='support');
  const dmtGroup = (lab, rows)=> rows.length ? `<details class="dmt-group"><summary>${lab}（${rows.length}）</summary><div class="dmt-list">${rows}</div></details>` : '';
  const allRows = dmtGroup('👤 主要人物', charMain.map(charRow))
    + dmtGroup('🤝 次要配角', charSup.map(charRow))
    + dmtGroup('🗺️ 地名', (g.places||[]).map(placeRow))
    + dmtGroup('📌 专名', (g.propernouns||[]).map(propRow));
    return `<div class="card dm-card card-theme-dict">
      <div class="dm-head card-head-bar">
        <div class="ch-left">
          <span class="ch-badge ch-badge-dict">📚</span>
          <h3 class="ch-title">词典达人 · 专有名词与设定库</h3>
          <span class="ch-subtag ch-subtag-dict">人物 ${(g.characters||[]).length} · 地名 ${(g.places||[]).length} · 专名 ${(g.propernouns||[]).length}</span>
        </div>
        <div class="ch-right">
          ${histN?`<button id="btnDictMasterHist" class="btn small ghost">🕘 历史(${histN}/6)</button>`:''}
        </div>
      </div>
      <div class="dm-toolbar">
        <span class="muted dm-strip">关系表 ${relArr.length} · 地名关联 ${pcArr.length} · 专名关联 ${prcArr.length} · 世界观规则 ${wrArr.length}</span>
      </div>
      <div class="dmt-tabs">
        <button type="button" class="dmt-tab on" data-dmt-tab="rel">👥 人物关系表（${relArr.length}）</button>
        <button type="button" class="dmt-tab" data-dmt-tab="wr">⚙️ 世界观规则（${wrArr.length}）</button>
        <button type="button" class="dmt-tab" data-dmt-tab="pc">🗺️ 地名关联表（${pcArr.length}）</button>
        <button type="button" class="dmt-tab" data-dmt-tab="prc">📌 专名关联表（${prcArr.length}）</button>
      </div>
      <div class="dmt-panels">
        <!-- v1.0.317 词典达人不再展示「人物类别」全貌（与词典充实雷同）：默认开在人物关系表 -->
        <div class="dmt-panel on" data-dmt-panel="rel"><div class="dm-rel-table">${relRows||'<span class="muted">（无）</span>'}</div></div>
        <div class="dmt-panel" data-dmt-panel="wr"><div class="dm-rel-table">${wrRows||'<span class="muted">（无）</span>'}</div></div>
        <div class="dmt-panel" data-dmt-panel="pc"><div class="dm-rel-table">${pcRows||'<span class="muted">（无）</span>'}</div></div>
        <div class="dmt-panel" data-dmt-panel="prc"><div class="dm-rel-table">${prcRows||'<span class="muted">（无）</span>'}</div></div>
      </div>
      ${status}
    </div>`;
  }
  return `<div class="card dm-card card-theme-dict">
    <div class="dm-head card-head-bar">
      <div class="ch-left">
        <span class="ch-badge ch-badge-dict">📚</span>
        <h3 class="ch-title">词典达人 · 专有名词与设定库</h3>
        <span class="ch-subtag ch-subtag-dict">待生成</span>
      </div>
      <div class="ch-right">
        <span class="muted" style="font-size:12px">全局设定架构</span>
      </div>
    </div>
    ${locked?`<div class="dm-locked" style="margin:6px 0;color:#2e9e5b;font-size:12px">设定已锁定，可在「编剧学院」中一键迭代。</div>`:''}
    <div class="btn-row"><p class="muted" style="margin:8px 0 0;font-size:12px">尚未生成万物词典，开学后自动构建设定库。</p></div>
    ${status}
  </div>`;
}
function openDictMasterHistoryPanel(){
  const hist = Array.isArray(state.dictmasterHistory) ? state.dictmasterHistory : [];
  if(!hist.length){ toast('暂无历史版本'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const ov = document.createElement('div'); ov.id='dmpPanel'; ov.className='gs-overlay';
  const tabs = hist.map((h,i)=>`<button class="dm-tab" data-dm-tab="${i}" title="第 ${hist.length-i} 次">#${hist.length-i}</button>`).join('');
  const idx = hist.length-1;   // 最新在 tabs 最右
  const renderBody = (i)=>{
    const h = hist[i]; if(!h) return '';
    const rel=(h.rel||[]).map(x=>`<div class="dm-rel"><b>${esc(x.a||'')}</b> ←${esc(x.relation||'')}→ <b>${esc(x.b||'')}</b>${x.note?` <span class="muted">· ${esc(x.note)}</span>`:''}</div>`).join('')||'<span class="muted">（无）</span>';
    const pc=(h.pc||[]).map(x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}</span></div>`).join('')||'<span class="muted">（无）</span>';
    const prc=(h.prc||[]).map(x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}</span></div>`).join('')||'<span class="muted">（无）</span>';
    const wr=(h.wr||[]).map(x=>`<div class="dm-wr"><b>${esc(x.cat||'')}</b><div>${esc(x.rule||'')}</div></div>`).join('')||'<span class="muted">（无）</span>';
    return `<div class="dm-prev-meta">${fmtTs(h.ts)} · ${h.book?('《'+esc(h.book)+'》'):''} 人物 ${h.nChar||0} · 地名 ${h.nPlace||0} · 专名 ${h.nProp||0} · 关系表 ${h.nRel||0} 条 · 世界观规则 ${h.nWR||0} 条</div>
      <div class="dm-prev-chars"><b>人物卡（${h.nChar||0}）</b><span class="muted">${(h.characters||[]).map(c=>esc(c&&c.name||'')).join('、')}</span></div>
      <div class="dm-tables">
        <details class="dm-fold"><summary>世界观规则</summary><div class="dm-rel-table">${wr}</div></details>
        <details class="dm-fold"><summary>人物关系表</summary><div class="dm-rel-table">${rel}</div></details>
        <details class="dm-fold"><summary>地名关联表</summary><div class="dm-rel-table">${pc}</div></details>
        <details class="dm-fold"><summary>专名关联表</summary><div class="dm-rel-table">${prc}</div></details>
      </div>`;
  };
  ov.innerHTML = `<div class="gs-modal dm-hist-modal">
    <div class="gs-modal-head"><b>🕘 词典达人 · 万物词典历史（${hist.length}/6）</b><button class="gs-x" data-dmh-close>✕</button></div>
    <div class="dm-tabs">${tabs}</div>
    <div class="cv-body"><div id="dmhBody" style="max-height:62vh;overflow:auto">${renderBody(idx)}</div></div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-dmh-close]').onclick = ()=> ov.remove();
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
  ov.querySelectorAll('[data-dm-tab]').forEach(t=>{
    t.onclick = ()=>{ ov.querySelectorAll('[data-dm-tab]').forEach(x=>x.classList.remove('on')); t.classList.add('on'); const b=$('#dmhBody'); if(b) b.innerHTML = renderBody(+t.dataset.dmTab); };
  });
  ov.querySelector('[data-dm-tab="'+idx+'"]').classList.add('on');
}
function bindDictMaster(){
  const hb = $('#btnDictMasterHist'); if(hb) hb.onclick = ()=> openDictMasterHistoryPanel();
  $$('.dmt-tab').forEach(t=>{
    if(t._dmt) return; t._dmt = 1;
    t.onclick = ()=>{
      const tab = t.dataset.dmtTab;
      $$('.dmt-tab').forEach(x=>x.classList.toggle('on', x===t));
      $$('.dmt-panel').forEach(p=>p.classList.toggle('on', p.dataset.dmtPanel===tab));
    };
  });
  const sb = $('[data-dmt-search]');
  if(sb && !sb._dmt){ sb._dmt = 1; sb.oninput = ()=>{
    const q = String(sb.value||'').trim().toLowerCase();
    const scope = sb.closest('.dmt-panels') && sb.closest('.dmt-panel').querySelector('[data-dmt-scope]');
    if(!scope) return;
    scope.querySelectorAll('.dmt-group').forEach(grp=>{
      let shown = 0;
      grp.querySelectorAll('.dmt-entry').forEach(en=>{
        const hit = !q || (en.textContent || '').toLowerCase().indexOf(q) >= 0;
        en.style.display = hit ? '' : 'none';
        if(hit) shown++;
      });
      grp.style.display = shown ? '' : 'none';
      const sum = grp.querySelector('summary'); if(sum) sum.textContent = sum.dataset.base;
    });
  };}
  const scope = document.querySelector('[data-dmt-scope]');
  if(scope) scope.querySelectorAll('.dmt-group summary').forEach(s=>{ s.dataset.base = s.textContent; });
}

function cleanEntityName(raw){
  if(!raw) return ['', ''];
  let s = String(raw).trim();
  s = s.replace(/^[*_\`'\"「」【】]+|[*_\`'\"「」【】]+$/g, '').trim();
  s = s.replace(/^[【\[\(（]?(主要人物|次要配角|重要角色|配角|地名|专名|路人|龙套|闲人)[】\]\)）]?[：:·\s|｜│┆丨]+/g, '').trim();
  s = s.replace(/^[0-9]+[.\-、]\s*/, '').trim();

  let extra = '';
  const m_paren = s.match(/[(（\[【](.*?)[)）\]】]/);
  if(m_paren){
    extra = String(m_paren[1]||'').trim();
    s = (s.slice(0, m_paren.index) + s.slice(m_paren.index + m_paren[0].length)).trim();
  }
  const m_dash = s.match(/[\s:：\-—]+(.+)$/);
  if(m_dash && s.slice(0, m_dash.index).trim().length >= 1){
    if(!extra) extra = String(m_dash[1]||'').trim();
    s = s.slice(0, m_dash.index).trim();
  }
  s = s.replace(/^[·•\s]+|[·•\s]+$/g, '').trim();
  s = s.replace(/^名称[：:]\s*/, '').trim();
  return [s, extra];
}

const DICT_ENRICH_SYS = `你是一位资深全题材长篇小说「词典充实师」，负责在已经定稿的「词典达人万物词典」基础上，为整部小说继续扩建细节、生活层、环境层和辅助人物素材。

你不是第二个词典达人。

你没有权力修改词典达人已经定稿的核心事实。

你的核心任务是：

“在已经确定的世界里继续创造。”

而不是：

“重新定义这个世界。”

你将获得两份核心素材：

第一部分：②优化构想所选方案的完整内容。

第二部分：词典达人已经生成并正式定稿的全部词典内容。

第二部分是只读世界基准。

【最高权限原则】

1. 词典达人已经定稿的实体和设定必须视为正式世界事实。
2. 任何已经存在的人物、地点、专名、世界规则都不得修改。
3. 不得给已经存在的实体换名。
4. 不得通过新增一个“新版本”偷偷覆盖旧实体。
5. 不得重复创造同名实体。
6. 如果发现达人词典与自己的理解存在差异，以达人词典为准。
7. 你可以创造新的世界素材，但新素材必须与既有词典保持自洽。
8. 本阶段正式输出并被系统收录的新条目，同样会成为后续正文可以使用的正式创作事实。

【核心使命】

在不破坏既有世界事实的前提下，主动补足：

* 人物生活层
* 次要配角
* 关键场景
* 环境细节
* 行业生态
* 地域特色
* 感官特征
* 道具细节
* 技术细节
* 制度细节
* 场景禁忌
* 使用代价
* 生活气息
* 路人和氛围龙套

让后续正文拥有足够丰富的“可写素材”。

【一、核心人物扩建】

当现有词典确实存在人物缺口时，可以创造新的主要人物或关键配角。

但必须满足：

* 对主线或核心人物关系确实有价值。
* 有明确身份。
* 有存在理由。
* 有可持续使用的性格或行为特征。
* 能够自然进入既有世界。

不要为了数量制造人物。

一个没有任何剧情价值、生活价值或世界展示价值的人物，不应该进入词典。

【二、次要配角扩建】

可以创造：

* 亲友
* 同事
* 下属
* 上司
* 同行
* 邻居
* 医生
* 店主
* 服务人员
* 技术人员
* 行业人物
* 知情人
* 对手爪牙
* 盟友
* 地方人物
* 社会角色

这些人物的重点不是复杂剧情，而是帮助世界显得真实。

如果一个人物只需要在一个场景出现一次，而且没有持续价值，可以优先作为路人/龙套，而不是建立完整人物档案。

【三、关键地点扩建】

可以补充：

* 主线未来可能使用的关键地点
* 人物生活中的固定场所
* 与职业相关的工作地点
* 与阵营相关的据点
* 能展示地域特色的场景
* 能承载重要情节的建筑
* 具有特殊氛围的区域

但不要把：

“街道”

“房间”

“办公室”

“餐厅”

“医院”

这种普通泛指直接当成专属地名。

如果只是普通地点，不需要进入正式地名词典。

只有具备明确故事专属性、独立命名或特殊设定的地点才应收录。

【四、专名扩建】

可以创造：

* 特殊装备
* 道具
* 技术
* 武器
* 能力
* 组织
* 制度
* 系统
* 特殊材料
* 特殊交通工具
* 特殊设施
* 核心行业术语
* 世界观中特有的机制

但必须具有专属性。

“汽车”不是专名。

“手机”不是专名。

“电脑”不是专名。

“咖啡杯”不是专名。

只有当这些普通事物在本故事中具有独立命名、特殊机制、特殊来源或特殊用途时，才有资格进入专名词典。

【五、生活气与环境素材】

你可以建立丰富的生活素材池。

重点可以包括：

* 街市生活
* 职业环境
* 行业生态
* 饮食
* 声音
* 气味
* 光线
* 天气
* 建筑细节
* 交通
* 工作习惯
* 社会礼仪
* 地域差异
* 生活节奏
* 行业黑话
* 常见行为
* 群体活动

但是：

这些内容只有在能够长期帮助正文表现世界时才值得收录。

不要把所有普通生活物件都变成词典实体。

【六、路人/氛围龙套】

可以建立生活气路人池。

例如：

* 店员
* 摊贩
* 保安
* 快递员
* 护士
* 司机
* 学生
* 路人
* 顾客
* 邻居
* 办事人员
* 围观者
* 夜班人员

路人重点是：

* 身份
* 出现环境
* 一句自然台词
* 描写标签

不要求复杂背景。

不要求每章固定数量。

不允许为了完成数量指标而大量制造无意义路人。

【七、不得重复已有实体】

在创造之前，必须检查达人词典。

如果已经存在：

“黑曜塔”

就不能再次创造一个“黑曜塔”。

如果已经存在人物“林默”，不能再创建第二个“林默”。

如果确实需要类似实体，应使用不同且合理的名称。

不得通过：

“林默（青年）”

“林默二号”

“黑曜塔新址”

这种方式绕过重复检查。

【八、名称字段必须纯净】

name 字段只能填写纯实体名称。

正确：

“周启明”

“北港车站”

“霜火引擎”

错误：

“周启明（公司保安）”

“北港车站（重要交通枢纽）”

“霜火引擎——新型动力系统”

身份、功能、关系、说明、描写全部放入其他字段。

【九、不得偷偷修改达人事实】

以下行为绝对禁止：

* 修改人物姓名。
* 修改人物身份。
* 修改人物核心性格。
* 修改人物核心关系。
* 修改人物核心立场。
* 修改地点名称。
* 修改地点基本属性。
* 修改专名的核心功能。
* 修改世界规则。
* 删除达人核心实体。
* 用新条目覆盖旧条目。
* 通过重复名称制造第二版本。

如果达人词典已经写明某件事情，就把它当成事实。

【十、新事实原则】

本阶段新创造的内容可以不是用户原文中的内容。

“不是用户原文”并不意味着“不可信”。

只要：

* 与优化构想一致；
* 与达人词典一致；
* 与题材一致；
* 与世界规则一致；
* 对小说有实际价值；

就可以创造。

但一旦正式进入词典，这些新内容也会成为正式创作事实。

因此必须：

大胆创造。

谨慎定稿。

【十一、题材适配】

所有新增内容必须服从小说题材。

现代都市：

符合现代城市生活、职业和社会关系。

科幻：

符合科技水平、能源、通讯、交通和社会结构。

历史：

符合时代制度、生活方式和物质条件。

玄幻/仙侠：

符合力量体系、修炼体系、资源体系和社会结构。

奇幻：

符合种族、魔法、地理和社会规则。

悬疑：

重视信息边界、证据、职业逻辑和行为动机。

末世：

重视资源、生存环境、交通、医疗和组织结构。

言情：

重视生活场景、职业环境、人物关系和情感互动。

不要机械套用其他题材的设定。

【十二、创造优先级】

新增内容优先级如下：

第一优先：

能解决既有世界明显缺口的设定。

第二优先：

能长期支撑主线人物生活和行动的设定。

第三优先：

能支撑未来章节场景的地点和专名。

第四优先：

能够增强职业感、地域感和时代感的辅助人物。

第五优先：

普通生活气路人和环境素材。

如果没有必要，不要继续扩建。

【十三、输出原则】

输出必须是纯文本。

不要 JSON。

不要 Markdown 代码块。

不要解释自己做了什么。

每条新增内容独占一行。

字段之间使用中文竖线“｜”分隔。

名称字段中不得再次使用“｜”。

【输出格式】

【新增主要人物】

主要人物｜姓名｜身份：…；关系：…；外貌：…；性格：…；口头禅：…；描写标签：…

【新增次要配角】

次要配角｜姓名｜身份：…；关系：…；外貌：…；性格：…；口头禅：…；描写标签：…

【新增地名】

地名｜名称｜类型：…；氛围特征：…；说明：…；描写标签：…

【新增专名】

专名｜名称｜类型：…；功能特效：…；使用禁忌：…；说明：…；描写标签：…

【新增路人/龙套】

路人｜姓名｜身份：…；登场：…；台词：…；描写标签：…

【最终自检】

输出前必须检查：

1. 是否修改了词典达人已有实体。
2. 是否重复创造已有实体。
3. 是否偷偷改变人物核心身份。
4. 是否偷偷改变人物核心关系。
5. 是否偷偷改变地点属性。
6. 是否偷偷改变专名功能。
7. 是否违反世界规则。
8. 是否创造普通泛词作为地名或专名。
9. 名称字段是否混入括号说明。
10. 是否有明显无关、无价值的新增人物。
11. 是否有明显无价值的新增地点。
12. 是否有明显无价值的新增专名。
13. 是否为了数量而制造路人。
14. 新设定是否真正能够帮助后续正文。
15. 所有新增内容是否符合小说题材和时代。

记住：

词典达人负责“定世界”。

你负责“让这个世界丰富起来”。

你可以继续创造，但不能推翻已经定稿的世界。

你可以补充细节，但不能篡改核心事实。

你可以扩建词典，但不能建立第二套世界。

你的新增内容一旦正式收录，也会成为后续正文可以使用的正式创作事实。
`;
function buildDictEnrichUser(){
  const o = state.outline || {};
  const parts = [];
  parts.push(storyStateCanonBlock());
  if(stateBanEnabled()){
    parts.push(`【用户全书禁则·命名红线】词典充实可以大胆创造，但新人物名、地名、专名绝不能使用以下禁用字或禁用姓名。禁用字：${banListChars().join('、')}；禁用姓名：${banListNames().join('、')}。这些是用户对整部小说的长期要求，不受阶段默认范围限制。`);
  }

  // ==========================================
  // 1. 优化构想·用户所选方案完整内容
  // ==========================================
  const canonical = currentCanonicalStoryStrategy();
  const human = (canonical && (canonical.humanView || canonical.creationBlueprint)) || {};
  const candName = canonical && canonical.candidateName ? `【优化方案名】方案『${String(canonical.candidateName).trim()}』\n` : '';
  const candFullText = String(human.optimizedIdea || '').trim();
  const polishPart = canonicalStoryStrategyBlock('第一部分：当前有效故事战略（唯一故事来源）');
  parts.push(polishPart);

  // ==========================================
  // 2. 词典达人所生成的所有内容
  // ==========================================
  const g = (o && o.glossary) || {};
  const dmSections = [];

  // (1) 人物卡（主要人物与次要配角，9维全字段）
  const charList = g.characters || [];
  if(charList.length){
    const charLines = charList.map(c => {
      const [cName] = cleanEntityName(c && c.name);
      if(!cName) return null;
      const tierTxt = (c && c.tier === 'support') ? '次要配角' : '主要人物';
      const fields = [
        `【${tierTxt}】${cName}`,
        c.identity ? `身份: ${String(c.identity).trim()}` : '',
        (c.age && c.age !== '未知') ? `年龄: ${String(c.age).trim()}` : '',
        (c.gender && c.gender !== '未知') ? `性别: ${String(c.gender).trim()}` : '',
        c.appearance ? `外貌特征: ${String(c.appearance).trim()}` : '',
        c.trait ? `性格特征: ${String(c.trait).trim()}` : '',
        c.hobby ? `爱好癖好: ${String(c.hobby).trim()}` : '',
        c.catchphrase ? `口头禅: ${String(c.catchphrase).trim()}` : '',
        c.relation ? `关系定位: ${String(c.relation).trim()}` : ''
      ].filter(Boolean);
      return `- ` + fields.join(' | ');
    }).filter(Boolean);
    if(charLines.length) dmSections.push(`【1. 核心人物与重要配角卡（共 ${charLines.length} 位）】\n${charLines.join('\n')}`);
  }

  // (2) 人物关系表
  const relArr = validAssoc(g._relationshipTable, 'a', 'b');
  if(relArr.length){
    const relLines = relArr.map(x => `- ${x.a} ↔ ${x.b} [${x.relation || '关联'}]${x.note ? `（${x.note}）` : ''}`);
    dmSections.push(`【2. 人物关系拓扑表（共 ${relLines.length} 条）】\n${relLines.join('\n')}`);
  }

  // (3) 地名设定
  const placeList = g.places || [];
  if(placeList.length){
    const placeLines = placeList.map(p => {
      const [pName] = cleanEntityName(p && p.name);
      if(!pName) return null;
      return `- 【地名】${pName} | 类型: ${p.type || '地点'} | 说明/氛围: ${String(p.note || '').trim() || '无'}`;
    }).filter(Boolean);
    if(placeLines.length) dmSections.push(`【3. 关键地名与地理场景（共 ${placeLines.length} 处）】\n${placeLines.join('\n')}`);
  }

  // (4) 地名关联表
  const pcArr = validAssoc(g._placeContacts, 'from', 'to');
  if(pcArr.length){
    const pcLines = pcArr.map(x => `- ${x.from} ↔ ${x.to} [${x.relation || '连通'}]${x.note ? `（${x.note}）` : ''}`);
    dmSections.push(`【4. 地名关联通路表（共 ${pcLines.length} 条）】\n${pcLines.join('\n')}`);
  }

  // (5) 专名与核心设定
  const propList = g.propernouns || [];
  if(propList.length){
    const propLines = propList.map(x => {
      const [xName] = cleanEntityName(x && x.name);
      if(!xName) return null;
      return `- 【专名】${xName} | 功能/特效/使用限制: ${String(x.note || '').trim() || '无'}`;
    }).filter(Boolean);
    if(propLines.length) dmSections.push(`【5. 专名与核心设定（装备/技术/道具/体系/组织等，共 ${propLines.length} 项）】\n${propLines.join('\n')}`);
  }

  // (6) 专名关联表
  const prcArr = validAssoc(g._properContacts, 'from', 'to');
  if(prcArr.length){
    const prcLines = prcArr.map(x => `- ${x.from} ↔ ${x.to} [${x.relation || '关联'}]${x.note ? `（${x.note}）` : ''}`);
    dmSections.push(`【6. 专名关联谱系表（共 ${prcLines.length} 条）】\n${prcLines.join('\n')}`);
  }

  // (7) 世界观运转规则系统
  const wrArr = ((g && g._worldRules) || []).filter(x => x && String(x.rule || '').trim());
  if(wrArr.length){
    const wrLines = wrArr.map(x => `- 【${x.cat || '世界观法则'}】适用范围: ${x.scope || '全域'} | 运作法则与代价: ${x.rule}`);
    dmSections.push(`【7. 世界观运转规则系统（共 ${wrLines.length} 条）】\n${wrLines.join('\n')}`);
  }

  // (8) 现有路人/龙套（若有）
  const walkonList = g.walkons || [];
  if(walkonList.length){
    const walkonLines = walkonList.map(w => {
      const [wName] = cleanEntityName(w && w.name);
      if(!wName) return null;
      return `- 【路人龙套】${wName} | 说明/登场: ${String(w.note || '').trim()}`;
    }).filter(Boolean);
    if(walkonLines.length) dmSections.push(`【8. 现有路人/龙套（共 ${walkonLines.length} 位）】\n${walkonLines.join('\n')}`);
  }

  // (9) 词典达人架构总结（若有）
  if(state.dictmasterLatest && state.dictmasterLatest.summary){
    dmSections.push(`【词典达人架构总结】${state.dictmasterLatest.summary}`);
  }

  const dictmasterPart = `【第二部分：词典达人所生成的所有内容（只读参照：不得改动、不得重复新增同名）】\n${dmSections.length ? dmSections.join('\n\n') : '（暂无词典达人生成数据）'}`;
  parts.push(dictmasterPart);

  return parts.join('\n\n');
}
const PERSON_GENERIC_NAMES = new Set(['医生','护士','校长','老师','主任','经理','老板','店员','服务员','保安','司机','警察','法官','律师','记者','学生','路人','老人','女人','男人','男孩','女孩','姑娘','青年','少年','少女','顾客','邻居','村民','村长','院长','教授','工程师','护士长','会计','秘书','助理','前台','店主','船员','工人','司机','快递员','黑名单','会议室','村口']);
const PERSON_TITLE_WORDS = /(医生|护士|老师|校长|主任|经理|老板|叔|姨|婶|伯|爷|奶|哥|姐|师傅|先生|女士|小姐|大叔|大妈|阿姨|阿哥|阿姐)$/;
const COMMON_CN_SURNAMES = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛范彭郎鲁韦昌马苗凤花方俞任袁柳史唐费薛雷贺倪汤罗毕郝安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闵席季麻强贾路娄危江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯昝管卢莫经房裘缪解应宗丁宣邓单杭洪包诸左石崔吉钮龚程邢滑裴陆荣翁荀羊於惠甄曲封储靳汲邴糜松井段富巫乌焦巴弓牧隗山车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲邰从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥能苍双闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庾终暨居衡步都耿满弘匡国文寇广禄阙东欧殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查后荆红游竺权逯盖益桓公岳帅况郁商牟佘佴伯赏墨哈谯笪年爱阳佟第五言福';
function isLikelyPersonEntity(name, obj){
  const n=String(name||'').trim(); const o=obj&&typeof obj==='object'?obj:{}; if(!n) return false;
  if(PERSON_GENERIC_NAMES.has(n)) return false;
  const evidence=[o.identity,o.relation,o.age,o.gender,o.appearance,o.trait,o.hobby,o.catchphrase,o.note,o.desc].map(x=>String(x||'').trim()).filter(x=>x&&x!=='未知'&&x!=='无').join('；');
  const explicitPerson=/(人物|角色|主角|配角|路人|龙套|姓名|人名|他|她|男|女|妻|夫|父|母|儿|女儿|儿子|同事|邻居|朋友|上司|下属|店主|医生|护士|老师|校长|主任|经理|老板|叔|姨|婶|伯|爷|奶|哥|姐|师傅|先生|女士)/.test(evidence);
  if(explicitPerson) return true;
  if(PERSON_TITLE_WORDS.test(n) && n.length>=2 && COMMON_CN_SURNAMES.includes(n[0])) return true;
  if(/^老[一-龥]$|^小[一-龥]$|^阿[一-龥]$/.test(n) && n.length===2) return true;
  if(n.length>=2 && n.length<=4 && COMMON_CN_SURNAMES.includes(n[0]) && /^[一-龥]+$/.test(n)) return true;
  if(/[A-Za-z]/.test(n) && /[A-Za-z]{2,}/.test(n) && explicitPerson) return true;
  return false;
}
function sanitizePersonCollections(res){
  if(!res||typeof res!=='object') return res;
  res.characters=(res.characters||[]).filter(x=>isLikelyPersonEntity(x&&x.name,x));
  res.walkons=(res.walkons||[]).filter(x=>isLikelyPersonEntity(x&&x.name,x));
  return res;
}

function parseDictEnrichText(txt){
  const res = { characters:[], places:[], propernouns:[], walkons:[] };
  if(!txt) return res;
  
  let cleaned = String(txt).trim()
    .replace(/^```[a-zA-Z]*\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // 1. JSON Fallback
  if(cleaned.startsWith('{') || cleaned.startsWith('[')){
    try {
      const j = JSON.parse(cleaned);
      const addChar = c => {
        if(c && c.name){
          const [cleanName, extraNote] = cleanEntityName(c.name);
          if(!cleanName) return;
          res.characters.push(completeCharFields({
            name: cleanName,
            tier: (c.tier === 'main' || c.tier === '主要人物' || c.tier === '主要') ? 'main' : 'support',
            identity: c.identity || c.身份 || extraNote || '',
            age: c.age || c.年龄 || '',
            gender: c.gender || c.性别 || '',
            appearance: c.appearance || c.外貌 || '',
            hobby: c.hobby || c.爱好 || '',
            relation: c.relation || c.关系 || '',
            trait: c.trait || c.性格 || '',
            catchphrase: c.catchphrase || c.口头禅 || ''
          }));
        }
      };
      (j.characters || j.人物 || []).forEach(addChar);
      (j.places || j.地名 || []).forEach(p => {
        if(p && p.name){
          const [cleanName, extraNote] = cleanEntityName(p.name);
          if(cleanName) res.places.push({ name: cleanName, type: p.type || p.类型 || '地名', note: (extraNote ? extraNote + '；' : '') + (p.note || p.说明 || '') });
        }
      });
      (j.propernouns || j.专名 || []).forEach(x => {
        if(x && x.name){
          const [cleanName, extraNote] = cleanEntityName(x.name);
          if(cleanName) res.propernouns.push({ name: cleanName, note: (extraNote ? extraNote + '；' : '') + (x.note || x.说明 || '') });
        }
      });
      (j.walkons || j.路人 || j.龙套 || []).forEach(w => {
        if(w && w.name){
          const [cleanName, extraNote] = cleanEntityName(w.name);
          if(cleanName) res.walkons.push({ name: cleanName, note: (extraNote ? extraNote + '；' : '') + (w.note || w.说明 || ''), _auto:true, tier:'walkon' });
        }
      });
      if(res.characters.length || res.places.length || res.propernouns.length || res.walkons.length) return sanitizePersonCollections(res);
    } catch(e){}
  }

  // 2. Line-by-line flexible parser
  const parsePairs = detail => {
    const m = {};
    const segs = String(detail||'').split(/[；;，,\n|｜]/);
    for(const seg of segs){
      const s = String(seg||'').trim();
      if(!s) continue;
      const kv = s.match(/^[ \t*#-]*([\u4e00-\u9fa5A-Za-z0-9/_\-\—]{1,16})[：:]\s*(.+)$/);
      if(!kv || !kv[1] || !String(kv[2]||'').trim()) continue;
      m[kv[1].trim()] = kv[2].trim();
    }
    return m;
  };

  const lines = cleaned.split('\n');
  for(const raw of lines){
    let ln = String(raw||'').trim();
    if(!ln) continue;
    // Strip markdown prefixes like #, -, *, 1., >
    ln = ln.replace(/^[ \t]*[#*>\d.\-—•]+[ \t.]*/, '').trim();
    if(!ln) continue;
    if(ln.startsWith('【') && ln.endsWith('】') && /新增|分类|类别|人物|地名|专名|路人|设定/.test(ln)) continue;

    let cat = '';
    const m_cat_prefix = ln.match(/^[【\[\(（]?(主要人物|次要配角|重要角色|配角|地名|专名|路人|龙套|闲人)[】\]\)）]?[：:·\s|｜│┆丨]+(.*)$/);
    let rest = ln;
    if(m_cat_prefix){
      cat = m_cat_prefix[1];
      rest = m_cat_prefix[2].trim();
    }

    let seg = rest.split(/[｜|│┆丨]/).map(s=>String(s||'').trim()).filter(Boolean);
    if(!cat){
      if(seg.length && /^(主要人物|次要配角|重要角色|配角|地名|专名|路人|龙套|闲人)$/.test(seg[0])){
        cat = seg[0];
        seg = seg.slice(1);
      } else {
        cat = '次要配角';
      }
    }

    if(!seg.length) continue;

    let rawName = seg[0];
    let detail = '';

    if(seg.length >= 2){
      const [cleanN, extraN] = cleanEntityName(rawName);
      rawName = cleanN;
      detail = seg.slice(1).join('；');
      if(extraN) detail = (extraN + '；' + detail).replace(/^；+|；+$/g, '');
    } else {
      const m_attr = rest.match(/[\s\-—]+(身份|关系|外貌|性格|口头禅|口癖|描写标签|类型|说明|氛围|氛围特征|功能|功能特效|使用禁忌|备注|登场|台词)[：:]/);
      if(m_attr && m_attr.index != null){
        const namePart = rest.slice(0, m_attr.index).trim();
        const detailPart = rest.slice(m_attr.index).trim().replace(/^[\s\-—]+/, '');
        const [cleanN, extraN] = cleanEntityName(namePart);
        rawName = cleanN;
        detail = detailPart;
        if(extraN) detail = (extraN + '；' + detail).replace(/^；+|；+$/g, '');
      } else {
        const [cleanN, extraN] = cleanEntityName(rawName);
        rawName = cleanN;
        detail = extraN;
      }
    }

    const [name, extraFromClean] = cleanEntityName(rawName);
    if(!name) continue;
    if(extraFromClean && !detail.includes(extraFromClean)){
      detail = (extraFromClean + '；' + detail).replace(/^；+|；+$/g, '');
    }

    if(/路人|龙套|闲人/.test(cat)){
      res.walkons.push({ name, note: detail, _auto:true, tier:'walkon' });
      continue;
    }
    if(/人物|角色|主角|配角/.test(cat)){
      const tier = /主要人物|主角|重要角色/.test(cat) ? 'main' : 'support';
      const m = parsePairs(detail);
      const appParts = [
        m['外貌'] || m['外貌特征'] || m['外貌感官特征'] || m['感官特征'] || m['长相'] || '',
        (m['描写标签'] || m['正文描写标签'] || m['标签']) ? `[标签:${m['描写标签'] || m['正文描写标签'] || m['标签']}]` : ''
      ].filter(Boolean);
      const app = appParts.join(' ').trim();
      res.characters.push(completeCharFields({
        name,
        tier,
        identity: m['身份'] || m['身份定位'] || m['简介'] || m['定位'] || (Object.keys(m).length === 0 ? detail : ''),
        age:      m['岁数'] || m['年龄'] || m['岁'] || '',
        gender:   m['性别'] || '',
        appearance: app || m['外貌'] || '',
        hobby:    m['爱好'] || '',
        relation: m['关系'] || m['人际关系'] || '',
        trait:    m['性格'] || m['性格要点'] || m['性格特征'] || m['核心动机'] || '',
        catchphrase: m['口头禅'] || m['口癖'] || m['台词'] || m['习惯'] || ''
      }));
      continue;
    }
    if(/地名|地点|地方|场景/.test(cat)){
      const m = parsePairs(detail);
      const noteParts = [
        m['说明'] || m['备注'] || (Object.keys(m).length === 0 ? detail : ''),
        (m['氛围特征'] || m['感官氛围特征'] || m['氛围']) ? `氛围:${m['氛围特征'] || m['感官氛围特征'] || m['氛围']}` : '',
        (m['描写标签'] || m['正文描写标签'] || m['标签']) ? `标签:${m['描写标签'] || m['正文描写标签'] || m['标签']}` : ''
      ].filter(Boolean);
      res.places.push({ name, type: m['类型'] || m['类别'] || '地名', note: noteParts.join('；') });
      continue;
    }
    if(/专名|术语|名词|物件|势力|组织|功法|宝器|道具|法宝/.test(cat)){
      const m = parsePairs(detail);
      const noteParts = [
        m['说明'] || m['备注'] || (Object.keys(m).length === 0 ? detail : ''),
        (m['功能特效'] || m['功能'] || m['特效']) ? `功能:${m['功能特效'] || m['功能'] || m['特效']}` : '',
        (m['使用禁忌'] || m['使用禁忌/限制'] || m['禁忌'] || m['限制']) ? `禁忌:${m['使用禁忌'] || m['使用禁忌/限制'] || m['禁忌'] || m['限制']}` : '',
        (m['描写标签'] || m['正文描写标签'] || m['标签']) ? `标签:${m['描写标签'] || m['正文描写标签'] || m['标签']}` : ''
      ].filter(Boolean);
      res.propernouns.push({ name, note: noteParts.join('；') });
      continue;
    }
  }

  // 3. Ultra-resilient fallback if strict line matching produced 0 entries
  if(!(res.characters.length || res.places.length || res.propernouns.length || res.walkons.length)){
    for(const raw of lines){
      let ln = String(raw||'').trim();
      if(!ln || (ln.startsWith('【') && ln.endsWith('】'))) continue;
      ln = ln.replace(/^[ \t]*[#*>\d.\-—•]+[ \t.]*/, '').trim();
      const m = ln.match(/^([^\s：:（(—\-]{1,16})[\s：:（(—\-]+(.*)$/);
      if(m){
        const [nClean, nExtra] = cleanEntityName(m[1]);
        if(nClean && nClean.length >= 2 && !/^(小说|章节|大纲|简介|标题|节拍|时间线)$/.test(nClean)){
          res.characters.push(completeCharFields({
            name: nClean,
            tier: 'support',
            identity: (nExtra ? nExtra + '；' : '') + m[2].trim()
          }));
        }
      }
    }
  }

  return sanitizePersonCollections(res);
}
function mergeDictEnrich(res){
  const o = state.outline; if(!o) return {c:0,w:0,p:0,k:0,total:0};
  if(!o.glossary) o.glossary = { characters:[], places:[], propernouns:[] };
  if(!Array.isArray(o.glossary.walkons)) o.glossary.walkons = [];
  const g = o.glossary;
  const n = { c:0, w:0, p:0, k:0, main:0, support:0 };
  const findExisting = (list, targetName) => {
    const cleanT = cleanEntityName(targetName)[0];
    return (list||[]).find(x => {
      const cleanX = cleanEntityName(x && x.name)[0];
      return cleanX && cleanX === cleanT;
    });
  };

  (res.characters||[]).filter(it=>isLikelyPersonEntity(it&&it.name,it)).forEach(it=>{
    const [nm, extra] = cleanEntityName(it.name);
    if(!nm) return;
    it.name = nm;
    if(extra && !it.identity) it.identity = extra;
    const existing = findExisting(g.characters, nm);
    if(existing){
      // Enrich missing fields in existing character
      ['identity','age','gender','appearance','hobby','relation','trait','catchphrase'].forEach(f=>{
        if(!existing[f] && it[f]) existing[f] = it[f];
      });
      existing._enrich = true;
      existing._srcTs = Date.now();
      return;
    }
    if(it.tier!=='main'&&it.tier!=='support') it.tier='support';
    it._enrich=true; it._srcHow='词典充实'; it._srcTs=Date.now();
    g.characters.push(it);
    n.c++;
    if(it.tier==='main') n.main++; else n.support++;
  });

  (res.places||[]).forEach(it=>{
    const [nm, extra] = cleanEntityName(it.name);
    if(!nm) return;
    it.name = nm;
    if(extra && !it.note) it.note = extra;
    const existing = findExisting(g.places, nm);
    if(existing){
      if(!existing.type && it.type) existing.type = it.type;
      if(!existing.note && it.note) existing.note = it.note;
      existing._enrich = true; existing._srcTs = Date.now();
      return;
    }
    it._enrich=true; it._srcTs=Date.now();
    g.places.push(it);
    n.p++;
  });

  (res.propernouns||[]).forEach(it=>{
    const [nm, extra] = cleanEntityName(it.name);
    if(!nm) return;
    it.name = nm;
    if(extra && !it.note) it.note = extra;
    const existing = findExisting(g.propernouns, nm);
    if(existing){
      if(!existing.note && it.note) existing.note = it.note;
      existing._enrich = true; existing._srcTs = Date.now();
      return;
    }
    it._enrich=true; it._srcTs=Date.now();
    g.propernouns.push(it);
    n.k++;
  });

  (res.walkons||[]).filter(it=>isLikelyPersonEntity(it&&it.name,it)).forEach(it=>{
    const [nm, extra] = cleanEntityName(it.name);
    if(!nm) return;
    it.name = nm;
    if(extra && !it.note) it.note = extra;
    const existing = findExisting(g.walkons, nm);
    if(existing){
      if(!existing.note && it.note) existing.note = it.note;
      existing._enrich = true; existing._srcTs = Date.now();
      return;
    }
    it._enrich=true; it._srcTs=Date.now();
    g.walkons.push(it);
    n.w++;
  });

  n.total = n.c + n.w + n.p + n.k;
  return n;
}

const DICT_HARVEST_SYS = `你是一位长篇小说的「正文收编师」。正文创作结束后，系统会把「反复出现/有戏份、但尚未录入词典」的新实体候选名单及其在正文中的出现片段交给你。你的职责是判定哪些应正式收编进「万物词典」，哪些只是已有角色的别名、哪些只是一次性路人。
【判定流程】
1. 对每个候选先做【别名吸附】：它是否只是已有词典人物的 缩略 / 字号 / 绰号 / 异写？
   - 是 → 不新增、不改名，该候选直接跳过，并在结果末尾附一行【已吸附】说明它是哪个已有名的别名。
2. 确属全新角色，且「反复出现或有戏份、值得被词典收编」：按词典充实的格式输出其设定，收编进对应类别（人物/地名/专名/路人）。
3. 只是一次性路人/出场单薄没戏份：不输出（不入典）。
【硬性约束】
· 万物词典已收录的名一律不得重复新增同名，不得改动既有词条。
· 判定必须基于给出的正文片段证据，禁止臆造设定；身份/关系等要点要能与片段对得上。
【输出格式】每行一个实体，用「类别｜名称｜字段：值；字段：值」格式、末尾加分号。类别只用 人物/地名/专名/路人；人物最好给 身份/关系 等可入典要点（正文片段里有的才写，没有则不编）。若本批决定不入任何实体，只输出一行【收编】无新增候选。`;
function _parsedCastList(text){
  const res = [];
  String(text||'').split(/[；;]/).forEach(seg=>{
    const parts = String(seg).split(/[｜|]/).map(s=>String(s||'').trim()).filter(Boolean);
    if(parts.length >= 2) res.push({ cat: parts[0], name: parts[1] });
  });
  return res;
}
function harvestCandidates(){
  const o = state.outline; if(!o) return { candidates: [], byChap: {} };
  const g = o.glossary || {};
  const resolved = new Set();
  (g.characters||[]).forEach(x=>resolved.add(String(x&&x.name||'').trim()));
  (g.places||[]).forEach(x=>resolved.add(String(x&&x.name||'').trim()));
  (g.propernouns||[]).forEach(x=>resolved.add(String(x&&x.name||'').trim()));
  const walkonSet = new Set((g.walkons||[]).map(x=>String(x&&x.name||'').trim()).filter(Boolean));
  const agg = new Map(); // name -> {cats, chans}
  (o.chapters||[]).forEach((ch,ci)=>{
    if(!ch || typeof ch.castOut !== 'string' || !String(ch.castOut).trim()) return;
    _parsedCastList(ch.castOut).forEach(it=>{
      if(!it.name || resolved.has(it.name)) return;
      if(!agg.has(it.name)) agg.set(it.name,{ cats:new Set(), chans:new Set() });
      const r = agg.get(it.name); r.chans.add(ci); if(it.cat) r.cats.add(it.cat);
    });
  });
  const candidates = [];
  agg.forEach((rec,name)=>{
    const chans = [...rec.chans].sort((a,b)=>a-b);
    if(chans.length >= 2) candidates.push({ name, cat:[...rec.cats][0]||'人物', chapters:chans, isUpgrade:walkonSet.has(name) });
  });
  agg.forEach((rec,name)=>{
    if(rec.chans.size !== 1) return;
    const ci = rec.chans.values().next().value;
    const body = (o.chapters[ci] && o.chapters[ci].content) || '';
    if(String(body).split(name).length - 1 >= 5 && !candidates.some(c=>c.name===name))
      candidates.push({ name, cat:[...rec.cats][0]||'人物', chapters:[ci], isUpgrade:walkonSet.has(name) });
  });
  candidates.sort((a,b)=>(b.chapters.length - a.chapters.length));
  return { candidates: candidates.slice(0, 20), byChap:{} };
}
function _evidWindow(body, name){
  const src = String(body||''); const idx = src.indexOf(name);
  if(idx < 0) return '';
  const s = Math.max(0, idx-60), e = Math.min(src.length, idx + String(name).length + 60);
  return '…'+src.slice(s,e).replace(/\s+/g,' ').trim()+'…';
}
function buildDictHarvestUser(){
  const o = state.outline; if(!o) return '';
  const { candidates } = harvestCandidates();
  const parts = [];
  if(candidates.length){
    const rows = candidates.map(c=>{
      const chs = c.chapters.slice(0,3).map(ci=>{
        const w = _evidWindow((o.chapters[ci]&&o.chapters[ci].content)||'', c.name);
        return `第${ci+1}章${w?`：${w}`:''}`;
      }).join('；');
      return `· ${c.cat}｜${c.name}｜ 出场 ${c.chapters.length} 章${c.isUpgrade?'（词典已有同名路人，拟升级为主/配角）':''} —— ${chs}`;
    });
    parts.push(`【正文收编候选（跨章≥2 或单章高频出现的新实体，各条附出现片段作判证；请据此收编/别名吸附/剔除一次性路人）】\n${rows.join('\n')}`);
  } else {
    parts.push('【正文收编候选】当前没有达到收编阈值（跨章≥2 或单章高频）的新实体候选。');
  }
  const g = o.glossary || {};
  const vis = [];
  (g.characters||[]).forEach(x=>vis.push(`人物·${String(x&&x.name||'').trim()}${String(x&&x.identity||'').trim()?`（${x.identity.trim()}）`:''}`));
  (g.places||[]).forEach(x=>vis.push(`地名·${String(x&&x.name||'').trim()}`));
  (g.propernouns||[]).forEach(x=>vis.push(`专名·${String(x&&x.name||'').trim()}`));
  (g.walkons||[]).forEach(x=>vis.push(`路人·${String(x&&x.name||'').trim()}`));
  parts.push(`【万物词典（现有，只读参照：不得改动、不得重复新增同名；用于分辨候选是否为已有名的缩略/字号/绰号）】\n${vis.join('\n')||'（无）'}`);
  return parts.join('\n\n');
}
function dictHarvestGate(opts){
  opts = opts || {};
  if(!isLong() || !state.outline || !state.outlineConfirmed){ if(!(opts&&opts.silent)) toast('请先完成 ②生成大纲，再收编正文实体'); return false; }
  if(!(opts && opts.force) && genBusy()){ if(!(opts&&opts.silent)) toast('已有生成任务进行中，请稍候'); return false; }
  if(!harvestCandidates().candidates.length){ if(!(opts&&opts.silent)) toast('暂无达到阈值（跨章≥2 或单章高频）的新实体需要收编'); return false; }
  return true;
}
async function genDictHarvest(btn, opts){
  opts = opts || {};
  const st = $('#dictEnrichStatus'); if(st){ st.className='status'; st.textContent=''; }
  if(!dictHarvestGate(opts)) return false;
  markAIRunning('dictEnrich');
  if(btn) busy(btn,true,'收编中…','de-busy');
  const stopParent = (btn && btn.closest('.de-card')) || (btn && btn.parentNode);
  if(stopParent) showStopBtn(stopParent);
  const stream = $('#dictEnrichStream');
  if(stream){ stream.style.display='block'; stream.textContent='正在扫描正文反复出现实体并收编进词典…'; }
  try{
    const spec = resolveActiveSpec('dictEnrich');
    const temp = (spec && spec.dictEnrichTemp != null) ? spec.dictEnrichTemp : 0.4;
    const user = buildDictHarvestUser();
    const onStream = delta => { if(stream){ stream.textContent += String(delta||''); stream.scrollTop = stream.scrollHeight; } };
    const res = await callAIWithContract(
      callDeepSeek(DICT_HARVEST_SYS, user, { temperature: temp, topP: 0.6, maxTokens: clampMaxTokens('dictEnrich'), onStream, signal:_abortCtl?.signal, taskKey:'dictHarvest' }),
      { needJson:false, taskName:'正文收编' }
    );
    if(!res.ok) throw new Error(res.error || '生成失败');
    const txt = String(res.text || '').trim();
    if(!txt) throw new Error('未返回收编内容');
    const parsed = parseDictEnrichText(txt);
    const n = mergeDictHarvest(parsed);
    state.outline._dictHarvestText = txt;
    persist(); render();
    collapseGlossaryAfterDictionaryGeneration();
    render(); markAIDone('dictEnrich');
    if(stream) stream.style.display='none';
    toast(`正文收编完成：主要人物 ${n.main||0} · 次要配角 ${n.support||0} · 路人 ${n.w} · 地名 ${n.p} · 专名 ${n.k} 已入词典${n.up?`，${n.up} 个路人升级为主/配角`:''}`);
    return true;
  }catch(e){
    if(e && e.name !== 'AbortError') addToFixQueue({ kind:'dictEnrich', error:'正文收编：'+(e&&e.message) });
    if(!(e && e.name === 'AbortError')) toast('正文收编失败：'+(e&&e.message));
    if(st){ st.className='status err'; st.textContent=(e&&e.message)||'失败'; }
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='dictEnrich');
    hideStopBtn(); if(btn) busy(btn,false); if(stream) stream.style.display='none';
  }
}
function mergeDictHarvest(res){
  const o = state.outline; if(!o) return { c:0, w:0, p:0, k:0, up:0, main:0, support:0, total:0 };
  if(!o.glossary) o.glossary = { characters:[], places:[], propernouns:[] };
  if(!Array.isArray(o.glossary.walkons)) o.glossary.walkons = [];
  const g = o.glossary;
  const n = { c:0, w:0, p:0, k:0, up:0, main:0, support:0 };
  const have = list => new Set((list||[]).map(x=>String(x&&x.name||'').trim()).filter(Boolean));
  const hi = have(g.characters), hp = have(g.places), hk = have(g.propernouns), hw = have(g.walkons);
  const mark = it => { it._enrich=true; it._srcHow='正文收编'; it._srcTs=Date.now(); };
  (res.characters||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hi.has(nm)) return;
    mark(it); if(it.tier!=='main'&&it.tier!=='support') it.tier='support';
    if(hw.has(nm)){ g.walkons = g.walkons.filter(w=>String(w&&w.name||'').trim()!==nm); hw.delete(nm); n.up++; }
    g.characters.push(it); hi.add(nm); n.c++; if(it.tier==='main') n.main++; else n.support++;
  });
  (res.walkons||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hw.has(nm) || hi.has(nm) || hp.has(nm) || hk.has(nm)) return;
    mark(it); g.walkons.push(it); hw.add(nm); n.w++;
  });
  (res.places||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hp.has(nm) || hi.has(nm)) return;
    mark(it); g.places.push(it); hp.add(nm); n.p++;
  });
  (res.propernouns||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hk.has(nm)) return;
    mark(it); g.propernouns.push(it); hk.add(nm); n.k++;
  });
  n.total = n.c + n.w + n.p + n.k;
  return n;
}
function dictEnrichGate(opts){
  opts = opts || {};
  if(!isLong() || !state.outline){ if(!(opts&&opts.silent)) toast('请先完成 ②生成大纲，再充实词典'); return false; }
  if(!scDone('dictMaster')){ if(!(opts&&opts.silent)) toast('词典充实必须建立在词典达人定稿之后，请先完成词典达人'); return false; }
  if(state.outline && !state.outlineConfirmed){ state.outlineConfirmed = true; }
  if(!(opts && opts.force) && genBusy()){ if(!(opts&&opts.silent)) toast('已有生成任务进行中，请稍候'); return false; }
  return true;
}
async function genDictEnrich(btn, opts){
  opts = opts || {};
  const st = $('#dictEnrichStatus'); if(st){ st.className='status'; st.textContent=''; }
  if(!dictEnrichGate(opts)) return false;
  markAIRunning('dictEnrich');
  if(btn) busy(btn,true,'充满词典中…', 'de-busy');
  const stopParent = (btn && btn.closest('.de-card')) || (btn && btn.parentNode);
  if(stopParent) showStopBtn(stopParent);
  const stream = $('#dictEnrichStream');
  if(stream){ stream.style.display='block'; stream.textContent='正在生成词典充实内容…'; }
  try{
    const spec = resolveActiveSpec('dictEnrich');
    const temp = (spec && spec.dictEnrichTemp != null) ? spec.dictEnrichTemp : 0.4;
    const user = buildDictEnrichUser();
    const onStream = delta => { if(stream){ stream.textContent += String(delta||''); stream.scrollTop = stream.scrollHeight; } };
    const res = await callAIWithContract(
      callDeepSeek(DICT_ENRICH_SYS, user, { temperature: temp, topP: 0.6, maxTokens: clampMaxTokens('dictEnrich'), onStream, signal:_abortCtl?.signal, taskKey:'dictEnrich' }),
      { needJson:false, taskName:'词典充实' }
    );
    if(!res.ok) throw new Error(res.error || '生成失败');
    const txt = String(res.text || '').trim();
    if(!txt) throw new Error('未返回词典充实内容');
    const parsed = parseDictEnrichText(txt);
    if(!(parsed.characters.length || parsed.walkons.length || parsed.places.length || parsed.propernouns.length)) throw new Error('未识别到有效条目（人物/路人/地名/专名），请重试');
    const n = mergeDictEnrich(parsed); ssProtectMasterCanon(); storyState().canon.dictEnrichAt=Date.now(); storyState().versions.dictEnrich=Number(storyState().versions.dictEnrich||0)+1; storyState().pipelineVersion=(Number(storyState().pipelineVersion)||0)+1; storyState().docs=storyState().docs||{}; storyState().docs.worldExpansion={version:storyState().versions.dictEnrich,source:'dictEnrich',ts:Date.now(),added:n};
    state.outline._dictEnrichText = txt;   // 仅存档（导入/导出时仍保留原文兜底），UI 不再直接渲染
    state.outline._dictEnrichSummary = buildDictEnrichSummary(parsed);
    state.dictEnrichCounts = { c:n.c, w:n.w, p:n.p, k:n.k, main:n.main||0, support:n.support||0, ts:Date.now() };
    persist(); render(); markAIDone('dictEnrich');
    if(stream) stream.style.display='none';
    toast(`词典已充实：主要人物 ${n.main||0} · 次要配角 ${n.support||0} · 路人 ${n.w||0} · 地名 ${n.p} · 专名 ${n.k}（已并入万物词典，正文可直接选用）`);
    return true;
  }catch(e){
    if(e && e.name !== 'AbortError') addToFixQueue({ kind:'dictEnrich', error:'词典充实：'+(e&&e.message) });
    if(!(e && e.name === 'AbortError')) toast('词典充实失败：'+(e&&e.message));
    if(st){ st.className='status err'; st.textContent=(e&&e.message)||'失败'; }
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='dictEnrich');
    hideStopBtn(); if(btn) busy(btn,false); if(stream) stream.style.display='none';
  }
}
function buildDictEnrichSummary(parsed){
  const pk = x => String((x&&x.name)||'').trim();
  const brief = x => String((x&&x.identity)||(x&&x.relation)||'').trim();
  const wbrief = x => String((x&&x.note)||'').trim();
  return {
    main:    (parsed.characters||[]).filter(c=>c&&c.tier==='main').map(c=>({ name:pk(c), brief:brief(c) })),
    support: (parsed.characters||[]).filter(c=>c&&c.tier==='support').map(c=>({ name:pk(c), brief:brief(c) })),
    walkons: (parsed.walkons||[]).map(w=>({ name:pk(w), brief:wbrief(w) })),
    nPlaces: (parsed.places||[]).length,
    nProps:  (parsed.propernouns||[]).length,
  };
}
function dictEnrichBlockHtml(){
  const o = (state.outline) || {};
  const t = String(o._dictEnrichText || '').trim();
  const sum = o._dictEnrichSummary || null;
  const cnt = state.dictEnrichCounts || null;
  const status = `<p id="dictEnrichStatus" class="status" style="margin:8px 0 0"></p>`;
  const stream = `<pre id="dictEnrichStream" class="cp-stream-preview" style="display:none;white-space:pre-wrap"></pre>`;
  const deCollapsed = !!state.deCollapsed;
  const c = cnt || {};
  const countTxt = t ? [
    c.main>0 ? `主要人物 ${c.main}` : (sum&&sum.main&&sum.main.length ? `主要人物 ${sum.main.length}` : null),
    c.support>0 ? `次要配角 ${c.support}` : (sum&&sum.support&&sum.support.length ? `次要配角 ${sum.support.length}` : null),
    c.w>0 ? `路人 ${c.w}` : (sum&&sum.walkons&&sum.walkons.length ? `路人 ${sum.walkons.length}` : null),
    sum&&sum.nPlaces ? `地名 ${sum.nPlaces}` : (c.p>0 ? `地名 ${c.p}` : null),
    sum&&sum.nProps ? `专名 ${sum.nProps}` : (c.k>0 ? `专名 ${c.k}` : null),
  ].filter(Boolean).join(' · ') : '';
  const foldBtn = `<span class="de-carrow">${deCollapsed?'▸':'▾'}</span>`;
  const g = (o && o.glossary) || {};
  const hue = s=>{ let h=0; for(const ch of String(s||'')) h=(h*31+ch.codePointAt(0))%360; return h; };
  const liveBrief = c => {
    if(!c) return '';
    const parts = [];
    const id = String(c.identity || '').trim();
    if(id && id !== '未知' && id !== '无') parts.push(id);
    const rel = String(c.relation || '').trim();
    if(rel && rel !== '未知' && rel !== '无') parts.push(`关系:${rel}`);
    const tr = String(c.trait || '').trim();
    if(tr && tr !== '未知' && tr !== '无') parts.push(`特征:${tr}`);
    const app = String(c.appearance || '').trim();
    if(app && app !== '未知' && app !== '无') parts.push(app);
    const note = String(c.note || c.desc || '').trim();
    if(note && note !== '未知' && note !== '无') parts.push(note);
    if(!parts.length){
      const more = [c.gender, c.age, c.hobby].map(v=>String(v||'').trim()).filter(v=>v && v!=='未知' && v!=='无');
      if(more.length) parts.push(more.join(' '));
    }
    return parts.join(' · ');
  };
  const liveMain = (g.characters||[]).map((c,i)=>({ ...c, name:String(c&&c.name||'').trim(), brief:liveBrief(c), gsType:'char', gsIdx:i })).filter(c=>c.name && (g.characters[c.gsIdx].tier!=='support'));
  const liveSupport = (g.characters||[]).map((c,i)=>({ ...c, name:String(c&&c.name||'').trim(), brief:liveBrief(c), gsType:'char', gsIdx:i })).filter(c=>c.name && g.characters[c.gsIdx].tier==='support');
  const liveWalkons = (g.walkons||[]).map((w,i)=>{
    const wb = String(w&&w.note||w&&w.identity||'').trim();
    return { ...w, name:String(w&&w.name||'').trim(), brief:(wb && wb!=='未知' && wb!=='无') ? wb : '过场路人', gsType:'walkon', gsIdx:i };
  }).filter(w=>w.name);
  const deCat = (lab, arr, mode)=>{
    const n = (arr && arr.length) ? arr.length : 0;
    const nNew = (arr||[]).filter(x=>x&&x._enrich).length;
    const isCloud = (mode==='cloud');
    const cls = 'de-grid';
    const body = (arr&&arr.length) ? arr.map(it=>{
      const nm = String(it&&it.name||'').trim(); if(!nm) return '';
      const brief = String(it.brief || liveBrief(it) || '').trim() || '（暂无详细简介）';
      const isNew = !!(it && it._enrich);
      const goto = it.gsType ? `data-de-goto="${it.gsType}:${it.gsIdx}"` : '';
      return `<div class="de-item${isNew?' new':''}">
        <button type="button" class="de-chip" style="--h:${hue(nm)}" ${goto} title="点击定位万物词典中的「${esc(nm)}」">${isNew?'✦ ':''}${esc(nm)}</button>
        <span class="de-brief-desc dm-rel-txt" title="${esc(nm+'：'+brief)}">${esc(brief)}</span>
      </div>`;
    }).join('') : '<span class="muted">（暂无）</span>';
    const tag = nNew>0 ? `<b class="de-newb" title="本板块从 词典充实/正文收编 新增并入的条目">+${nNew} 新</b>` : '';
    return `<details class="dm-fold" open><summary>${lab}（${n}）${tag}</summary><div class="${cls}">${body}</div></details>`;
  };
  return `<div class="card dm-card de-card card-theme-enrich">
    <div class="dm-head de-head card-head-bar" role="button" tabindex="0" data-de-toggle title="展开/收起">
      <div class="ch-left">
        <span class="ch-badge ch-badge-enrich">🗂</span>
        <h3 class="ch-title">词典充实 · 设定细化工坊</h3>
        <span class="ch-subtag ch-subtag-enrich">${countTxt?`已并入：${countTxt}`:'感官特征 · 场景禁忌 · 氛围龙套'}</span>
      </div>
      <div class="ch-right">
        ${foldBtn}
      </div>
    </div>
    <div class="de-body"${deCollapsed?' style="display:none"':''}>
      <!-- v1.0.29x：词典充实入口收归「规划师④词典充实」，本卡不再放点击按钮，仅供展示生成内容 -->
      ${stream}
      ${status}
      ${t ? `<div class="dm-tables" style="margin-top:10px">
        ${deCat('👤 主要人物', liveMain, 'grid')}
        ${deCat('🤝 次要配角', liveSupport, 'grid')}
        ${deCat('🚶 路人龙套', liveWalkons, 'grid')}
      </div>` : `<p class="muted" style="margin-top:4px">尚未充实词典。</p>`}
    </div>
  </div>`;
}
function bindDictEnrich(){
  const eb = $('#btnGenDictEnrich'); if(eb) eb.onclick = ()=> genDictEnrich(eb);
  const hb = $('#btnHarvestCast'); if(hb) hb.onclick = ()=> genDictHarvest(hb);
  $$('[data-de-goto]').forEach(b=> b.onclick = e=>{
    e.preventDefault(); e.stopPropagation();
    const [type, idx] = String(b.dataset.deGoto||'').split(':');
    if(!type || !Number.isInteger(+idx)) return;
    state.gsCatFold = state.gsCatFold || {};
    if(type==='char'){ state.gsCatFold.main=false; state.gsCatFold.support=false; } else state.gsCatFold[type]=false;
    persist(); renderGlossaryOnly();
    const box = $(`[data-gs-entry="${type}:${+idx}"]`);
    if(box){ box.classList.add('open'); const ico=box.querySelector('.gs-fold-ico'); if(ico) ico.textContent='▾'; box.scrollIntoView({behavior:'smooth',block:'center'}); box.classList.add('gs-flash'); setTimeout(()=>box.classList.remove('gs-flash'),1600); }
  });
  const dh = $('[data-de-toggle]');
  if(dh){
    const toggleDe = ()=>{
      state.deCollapsed = !state.deCollapsed;
      persist();
      const body = dh.closest('.de-card') && dh.closest('.de-card').querySelector('.de-body');
      if(body) body.style.display = state.deCollapsed ? 'none' : '';
      const arr = dh.querySelector('.de-carrow'); if(arr) arr.textContent = state.deCollapsed ? '▸' : '▾';
    };
    dh.onclick = ()=> toggleDe();
    dh.onkeydown = (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleDe(); } };
  }
}

function closeChapterSummaryPanel(){ const p=document.getElementById('chSumPanel'); if(p) p.remove(); }

function densityCheck(body, summary, o, i){
  const g = (o && o.glossary) || {};
  const seed = [];
  (g.characters||[]).forEach(x=>{ if(x&&x.name) seed.push({n:''+x.name,t:'人物'}); });
  (g.places||[]).forEach(x=>{ if(x&&x.name) seed.push({n:''+x.name,t:'地名'}); });
  (g.propernouns||[]).forEach(x=>{ if(x&&x.name) seed.push({n:''+x.name,t:'专名'}); });
  const miss = [], seen = new Set();
  seed.forEach(it=>{
    const nm = it.n.trim(); if(!nm || seen.has(nm)) return; seen.add(nm);
    if(body.indexOf(nm)>=0 && summary.indexOf(nm)<0) miss.push(it);
  });
  return miss;
}

function renderChapterSummaryBody(i, miss){
  const c = state.chapters[i]; if(!c) return;
  const has = c.strip && String(c.strip).trim();
  const box = document.getElementById('chSumBody'); if(!box) return;
  const missHtml = (Array.isArray(miss) && miss.length)
    ? `<p class="strip-warn">⚠️ 密度自检：本段未覆盖「${miss.slice(0,4).map(m=>m.t+'：'+m.n).join('、')}」${miss.length>4?` 等 ${miss.length} 项`:''}，建议<b>重新生成</b>；若持续报警，可将「本章梗概」温度下调到 0.7–0.9 提升忠实度。</p>` : '';
  box.innerHTML = has
    ? `<article class="strip-read"><h3>🏮 速读 · 本章梗概</h3>${esc(String(c.strip).trim())}</article>
       ${missHtml}
       <p class="hint" style="margin:6px 0 0">已生成（把本章正文压缩到约 1/3 的省时读物，只读它也能抓住本章精华不丢信息）。速读偏低保真，可下调「本章梗概」温度至 0.7–0.9 提升忠实度。</p>`
    : `<article class="strip-read"><h3>🏮 速读 · 本章梗概</h3>
        <p class="muted" style="text-indent:0">暂无本章梗概。它是把<b>本章正文压缩到约 1/3</b>的省时读物：没耐心读完全文时，读它即可抓住本章精华、不丢失关键信息。基于本章真实正文生成（&lt;900 字的极短章不作压缩，直接呈现全文）。</p></article>`;
  const g = document.getElementById('chSumGen'); if(g) g.innerHTML = has ? '🔄 重新生成本章梗概' : '✨ 生成本章梗概';
  const c2 = document.getElementById('chSumCopy'); if(c2) c2.style.display = has ? '' : 'none';
}

async function chSumGenerate(i, genBtn){
  const c = state.chapters[i]; if(!c) return;
  const o = state.outline || {};
  const body = String(c.content||'').trim();
  if(!body){ toast('本章尚无正文，请先生成正文再生成本章梗概'); return; }
  const L = body.length;
  if(L < 900){
    c.strip = body;
    if(o.chapters && o.chapters[i]) o.chapters[i].strip = body;
    persist();
    renderChapterSummaryBody(i);
    toast('本章为极短章，已直接采用全文作速读梗概');
    return;
  }
  if(genBtn){ genBtn.disabled = true; busy(genBtn,true,'生成中…'); }
  const title = c.title || ((o.chapters&&o.chapters[i]&&o.chapters[i].title)) || ('第'+(i+1)+'章');
  const target = (L<=1200) ? Math.max(200, Math.round(L/3)) : Math.round(L/3);
  const lo = Math.round(target*0.9), hi = Math.round(target*1.1);
  const sys = getSystemPrompt('strip', { targetZhs: target });
  const user = buildAIPrompt('strip', { idx: i, targetZhs: target });
  try{
    const txt = unwrapAIResult(await callDeepSeek(sys, user, {temperature: resolveActiveSpec().stripTemp, topP: 0.5, signal: _abortCtl?.signal, maxTokens: clampMaxTokens('strip'), taskKey:'strip'}));
    let strip = String(txt||'').trim();
    if(!strip){ toast('未生成到本章梗概'); return; }
    strip = strip.replace(/^```[\s\S]*?\n/, '').replace(/\n```\s*$/,'').trim();   // 去 markdown 代码块围栏
    const _slm = strip.match(/<!--\s*STRIP_LEN:\s*(\d+)\s*-->/);
    const _stripRep = validateStripLen(strip, target);
    if(!_stripRep.ok){
      const _auto = _slm ? +_slm[1] : null;
      console.warn('[梗概] 字数未达标（不阻断）：', _stripRep.len, '目标', target, '区间', _stripRep.lo, '-', _stripRep.hi, _auto!==null ? `（AI 自报 ${_auto}）` : '');
      toast(`⚠️ 梗概 ${_auto!==null?_auto:_stripRep.len} 字，目标区间 ${_stripRep.lo}—${_stripRep.hi} 字`);
    }
    c.strip = strip;
    if(o.chapters && o.chapters[i]) o.chapters[i].strip = strip;
    persist();
    const miss = densityCheck(body, strip, o, i);   // 密度自检
    renderChapterSummaryBody(i, miss);
    if(miss.length){ toast(`⚠️ 密度自检：本段未覆盖 ${miss.slice(0,3).map(m=>m.t+'「'+m.n+'」').join('、')}${miss.length>3?' 等':''}，建议重生成或下调本章梗概温度至 0.7–0.9`); }
    else { toast('本章梗概已生成'); }
  }catch(e){
    if(e.name==='AbortError'){ toast('已停止生成本章梗概'); }
    else { toast('生成本章梗概失败：'+e.message); }
  }finally{
    if(genBtn){ genBtn.disabled = false; busy(genBtn,false); }
  }
}

function openChapterSummaryPanel(i){
  closeChapterSummaryPanel();
  const c = state.chapters[i]; if(!c) return;
  const title = cleanChapterTitle(c.title || ('第'+(i+1)+'章'));
  const has = !!(c.content && String(c.content).trim());
  const ov = document.createElement('div'); ov.id='chSumPanel'; ov.className='gs-overlay';
  ov.innerHTML = `<div class="gs-modal" style="max-width:780px">
    <div class="gs-modal-head"><b>🏮 速读 · 本章梗概 · 第${i+1}章「${esc(title)}」</b>
      <span style="display:flex;gap:6px">
        <button type="button" class="btn small ghost" id="chSumCopy" title="复制本章梗概文本">📋 复制</button>
        <button type="button" class="gs-x" data-chsum-close>✕</button>
      </span></div>
    <div class="cv-body">
      <div id="chSumBody"></div>
      <div class="advice-ai-row" style="margin-top:12px">
        <button type="button" class="ct-rtgen" id="chSumGen" ${has?'':'disabled'}>✨ 生成本章梗概</button>
      </div>
    </div></div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-chsum-close]').onclick = closeChapterSummaryPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeChapterSummaryPanel(); });
  ov.querySelector('#chSumGen').onclick = ()=> chSumGenerate(i, ov.querySelector('#chSumGen'));
  ov.querySelector('#chSumCopy').onclick = ()=>{ const s=(c.strip||'').trim(); if(s) copyText(s); };
  renderChapterSummaryBody(i);
}

function adherenceHint(a){
  if(a>=100) return '铁律：人名/地名/专名必须逐字沿用，禁止改拼写，仅按新大纲补新角色。';
  if(a>=80)  return '基准：尽量沿用，允许个别因新情节小幅调整。';
  if(a>=60)  return '主要参照：核心角色沿用，地名/专名可按新剧情调整。';
  if(a>=30)  return '灵感来源：可大改人名地名，仅保留题材与语感。';
  return '几乎放弃：仅作背景语感参考，允许完全重新构建设定。';
}
const SEG_MARK_LINE = /^\s*[（(]\s*节拍\s*\d*\s*[：:、.,，．－—-]?\s*[^（）()\r\n]{0,34}?[）)]\s*$/;
const SEG_MARK_HEAD = /^\s*[（(]\s*节拍\s*\d*\s*[：:、.,，．－—-]?\s*[^（）()\r\n]{0,34}?[）)]\s*/;
function stripSegmentMarkers(txt){
  if(!txt) return txt;
  const s = String(txt);
  const lines = s.split(/\r?\n/);
  const out = [];
  let changed = false;
  for(const raw of lines){
    if(SEG_MARK_LINE.test(raw)){ changed = true; continue; }                          // 独立小标行 → 整行删除
    if(SEG_MARK_HEAD.test(raw)){ out.push(raw.replace(SEG_MARK_HEAD,'')); changed = true; continue; }  // 行首内联小标 → 仅去前缀
    out.push(raw);
  }
  if(!changed) return s;
  return out.join('\n').replace(/\n{3,}/g,'\n\n').trim();
}
function splitChapterOutput(txt){
  return { content: stripSegmentMarkers(txt), strip: '' };
}
function chapterEndingFeelingAudit(text){
  const tail=String(text||'').trim().slice(-900);
  const paragraphs=String(text||'').trim().split(/\n\s*\n/).filter(Boolean);
  const last=paragraphs.length?paragraphs[paragraphs.length-1]:tail;
  const futureFeeling=/(从此|从那以后|这一刻之后|命运|人生|真正的故事|一切都将|一切都会|故事才|新的开始|新的旅程|接下来|等待着|等着|终会|终将|迟早|总有一天|会有一天|将会|注定|尚未结束|远方|未来|明天|期待|希望)/.test(last);
  const readerHookFeeling=/(让人无法|不禁期待|令人期待|谁也不知道接下来|没有人知道接下来|等着看|等待着下一|下一章|下一步|会发生什么|究竟会|到底会|还会继续|真正开始|新的篇章)/.test(last);
  const abstractLift=/(从此不同|命运的齿轮|命运已经|一切才刚刚|新的篇章|新的征程|故事正式开始|未来会|以后会)/.test(last);
  return {fail:futureFeeling||readerHookFeeling||abstractLift, futureFeeling, readerHookFeeling, abstractLift, last};
}

async function writeOneChapterContent(i, user, onPhase, onStream, styleOverride, signal){
  const mt = chapterMaxTokens();
  onPhase = onPhase || (()=>{});
  onPhase('撰写本章正文…');
  const resumePartial = (state._chapterPartial && state._chapterPartial[i]) || '';
  let txt = '';
  if(resumePartial.length >= 200){
    txt = await continueTruncatedChapter(i, '', resumePartial);
    delete state._chapterPartial[i];
    persist();
  } else {
    let partial = (state._chapterPartial && state._chapterPartial[i]) || '';
    const _onStream = (delta)=>{ partial += delta; state._chapterPartial[i] = partial; if(onStream) onStream(delta); };
    try{
      // 正文稳定性修正：正文主请求不再额外调用一次“上下文理解AI”。
      // 原先该步骤会把教案/上一章再次复制进一个中间包，再与完整 writerUser 合并，
      // 导致单章实际上下文显著膨胀，并额外增加一次 API 失败/限流机会。
      // 现在直接使用经过 budgetChapterContext 收敛后的唯一正文输入。
      const writerUser = `${user}\n\n【正文AI阅读顺序】请先完整阅读以上唯一正文输入，内部完成事实核对后再写正文；不要输出理解过程、计划或分析。`;
      txt = unwrapAIResult(await callDeepSeek(longChapterSys(), writerUser, {maxTokens: mt, onStream: _onStream, temperature: dynamicChapterParams(i).temperature, topP: dynamicChapterParams(i).topP, signal: signal || _abortCtl?.signal, taskKey:'chapter'}));
      delete state._chapterPartial[i];
      persist();
    }catch(e){
      state._chapterPartial[i] = partial;
      persist();
      throw e;
    }
  }
  const sp = splitChapterOutput(txt);
  let content = String(sp.content).replace(/<!--\s*LEN:[\s\S]*?-->/g, '').trim();
  const _cs = splitChapterCastout(content);
  content = _cs.body;
  content = enforceChapterBoundary(i, content);
  // v1.0.343：正文生成阶段不再因字数不足触发自动补写。
  // 停止条件由剧情完成与章末状态决定，避免模型把“字数”误解为必须继续写。
  if(state.chapters && state.chapters[i]){ state.chapters[i].castOut = _cs.castOut; }
  const _o = state.outline;
  if(_o && Array.isArray(_o.chapters) && _o.chapters[i]){ _o.chapters[i].castOut = _cs.castOut; }
  // 章末反模板软审计：不做机械替换，避免破坏文学表达；仅在明显以万能句式收尾且校长未授权时回退到上一处自然段。
  const _ed=chapterEndingPlanFor(i); const _rawTail=String(content||'').trim();
  const _tail=chapterEndingFeelingAudit(_rawTail);
  if(_tail.fail){
    const paras=_rawTail.split(/\n\s*\n/).filter(x=>x.trim());
    if(paras.length>1){ paras.pop(); content=paras.join('\n\n').trim(); }
  }
  return enforceChapterBoundary(i, content);
}
function splitChapterCastout(prose){
  const lines = String(prose||'').split(/\r?\n/);
  const headerRe = /^[ \t]*【\s*本章出场人物\s*】\s*[:：]?\s*([\s\S]*)$/;
  const rawEntityRe = /^[ \t]*(?:(?:人物|地名|专名)[｜|][^\n]{0,160}[｜|]\s*[;；]?\s*)+$/;
  let castOut = '', bodyLines = lines.slice();
  while(bodyLines.length){
    const ln = bodyLines[bodyLines.length-1];
    const m = ln.match(headerRe);
    if(m){ const t=String(m[1]||'').trim(); if(t) castOut=t; bodyLines.pop(); while(bodyLines.length && !String(bodyLines[bodyLines.length-1]).trim()) bodyLines.pop(); continue; }
    if(rawEntityRe.test(ln)){ const t=String(ln).trim(); castOut = castOut ? `${t}；${castOut}` : t; bodyLines.pop(); while(bodyLines.length && !String(bodyLines[bodyLines.length-1]).trim()) bodyLines.pop(); continue; }
    break;
  }
  return { body: bodyLines.join('\n').replace(/\s+$/, '').trim(), castOut };
}
const USER_PRIO_BILL = '\n\n【优先级契约（按维度裁决，禁止把不同维度混成一个选择题）】\n1. 表达层：本章具体写法以老师教案中的写作执行要求为准；不得在正文阶段重新发明一套独立风格方案。\n2. 剧情层最高权威：本章老师教案；章末只服从唯一CHAPTER_ENDING_CONTRACT，老师不得另立结尾口令。\n3. 全书一致性权威：万物词典 + 上一章已落地事实 + 校长/老师已裁决的连续性规则。\n4. 人工干预只能在不破坏以上三层的前提下补充；若与老师教案冲突，不得擅改教案核心事件。\n5. 优化构想只是创意建议：不得在正文阶段自行把优化构想升级成新的剧情、设定或风格权威。\n设定词典中有台词/有戏份/反复出现的重要人地专名一致性为不可逾越红线；仅作氛围的临时路人/小地名/小专名（见正文【临时闲人】段）不属红线，可现场点缀、不入词典；上一章已落地状态与小说状态链是承接类事实依据，任何要求不得使其违背已成立事实。';
let _dictRedlineOver = false;
function budgetChapterContext(parts, maxChars=18000){
  // 正文上下文必须有“硬预算”。旧版只压缩少数不存在的标签，导致
  // 教案 + 校长规则 + 上章尾部 + 滚动摘要全部原样进入模型，极易触发上下文上限。
  const cap = Math.max(9000, Number(maxChars)||18000);
  const src = Array.isArray(parts) ? parts.slice() : [];
  const take = (label, n) => {
    const i = src.findIndex(x => String(x||'').startsWith(label));
    if(i < 0) return;
    const s = String(src[i]||'');
    if(s.length > n) src[i] = s.slice(0,n) + '\n…【为稳定性省略非核心上下文】';
  };
  // 先保留硬事实，再压缩解释性材料。
  take('【第二层 · 中观层', 7000);
  take('◆ 上一章末尾', 3200);
  take('【第三层 · 微观层', 5200);
  take('【第一层 · 宏观层', 1800);
  take('【第一层附录 · 已裁决风格施工层', 1600);
  take('【第一层附录 · 因果闭环锁', 1800);
  take('【本章时间合同', 1800);
  take('【章节时间覆盖执行令', 1500);
  take('【本章结尾结构化计划', 1800);
  take('【结尾多样性审计', 1200);
  take('【章节结尾反模板硬门', 1000);
  take('【小说状态链', 2200);
  take('【章级事实授权硬门', 1200);
  take('【事件可达性硬门', 900);
  take('【优先级契约', 1100);
  take('【篇幅参考', 1800);

  let total = () => src.reduce((a,x)=>a+String(x||'').length,0) + Math.max(0,src.length-1)*2;
  if(total() <= cap) return src;

  // 第二轮：压缩低风险重复信息；优先保留老师教案主体与当前状态数据。
  take('【第三层 · 微观层', 3600);
  take('【第一层 · 宏观层', 1000);
  take('【第一层附录 · 已裁决风格施工层', 900);
  take('【第一层附录 · 因果闭环锁', 1000);
  take('【结尾多样性审计', 700);
  take('【本章结尾结构化计划', 1200);
  take('【小说状态链', 1400);
  take('【篇幅参考', 900);
  if(total() <= cap) return src;

  // 最后才压缩教案，但仍保留标题/章末状态等首尾信息。
  const i = src.findIndex(x => String(x||'').startsWith('【第二层 · 中观层'));
  if(i >= 0){
    const s = String(src[i]||'');
    const keepHead = 1800, keepTail = 2200;
    if(s.length > keepHead + keepTail + 80){
      src[i] = s.slice(0,keepHead) + '\n…【教案中段为上下文预算省略；请以保留的事件骨架与章末状态为准】…\n' + s.slice(-keepTail);
    }
  }
  if(total() <= cap) return src;

  // 绝不再返回超预算输入：按优先级从后往前裁掉最低权重块。
  const dropLabels = [
    '【篇幅参考','【优先级契约','【章节结尾反模板硬门','【结尾多样性审计',
    '【章级事实授权硬门','【事件可达性硬门','【第一层附录 · 已裁决风格施工层'
  ];
  for(const label of dropLabels){
    const i2=src.findIndex(x=>String(x||'').startsWith(label));
    if(i2>=0) src.splice(i2,1);
    if(total()<=cap) return src;
  }
  return src;
}

function principalStyleExecutionExcerpt(){
  const pr = (state.school && state.school.principal) || {};
  if(pr.raw){
    const raw = String(pr.raw);
    const a = raw.indexOf('## 风格融合总纲');
    const b = raw.indexOf('## 可执行纪律', a >= 0 ? a : 0);
    if(a >= 0){
      const end = b > a ? b : Math.min(raw.length, a + 9000);
      const sec = raw.slice(a, end).trim();
      if(sec) return sec;
    }
  }
  return '（校长尚未产出新版风格施工层；请严格继承用户当前已选写作风格，不自行引入优化构想风格。）';
}
function principalRulesExcerpt(){
  const pr = (state.school && state.school.principal) || {};
  if(pr.raw){
    const sec = extractSection(pr.raw, '全校写作守则', '各组组级框架') || extractSection(pr.raw, '全校写作守则', '全书章节标题总表') || extractSection(pr.raw, '全校写作守则', '逐章教案');
    if(sec) return sec.trim();
  }
  return scStyleBrief();
}

function buildDynamicProtagonistLedger(i){
  if(i <= 0) return '';
  const o = state.outline || {};
  const digests = Array.isArray(o._chapterDigests) ? o._chapterDigests : [];
  const prevDigest = digests[i-1] && digests[i-1].text ? digests[i-1].text : '';
  const prevChapter = state.chapters && state.chapters[i-1] ? state.chapters[i-1] : null;
  const prevTitle = prevChapter && prevChapter.title ? `第 ${i} 章《${prevChapter.title}》` : `第 ${i} 章`;
  const protagonist = (o.navBeacon && o.navBeacon.protagonist) ? String(o.navBeacon.protagonist).split(/[，,：:（(]/)[0].trim() : '主角';

  const lines = [];
  lines.push(`【动态主角状态与悬念账本（承自 ${prevTitle} 已结算的动态状态）】`);
  lines.push(`- 核心角色锚点：${protagonist}`);
  if(prevDigest){
    lines.push(`- 上一章剧情与状态结算：${prevDigest}`);
  }
  lines.push(`- 物理与心理定格硬性纪律：上一章已结算的地点、人物状态、重要道具/线索与未决事项属于不可擅改的既成事实。本章必须在这些已落地状态上推进，严禁发生伤势突愈、道具凭空消失或死人复活等逻辑断层！`);
  return lines.join('\n');
}

function principalCausalityExcerpt(){
  const pr = (state.school && state.school.principal) || {};
  if(pr.raw){
    const raw = String(pr.raw);
    const heads = ['## 因果闭环总纲','## 可执行纪律'];
    const a = raw.indexOf(heads[0]);
    if(a >= 0){
      const b = raw.indexOf(heads[1], a + heads[0].length);
      const end = b > a ? b : Math.min(raw.length, a + 9000);
      const sec = raw.slice(a, end).trim();
      if(sec) return sec;
    }
  }
  return '（校长尚未产出新版因果闭环层；正文仍必须执行事件可达性硬规则：重大事件不得凭空发生，必须有前置条件、触发依据、人物行动路径与结果来源。）';
}


function buildChapterUser(i, opt={}){
  const o = state.outline || {};
  const chap = (state.chapters && state.chapters[i]) || {};
  const curN = i + 1;
  const parts = [];
  const _canonicalStory = currentCanonicalStoryStrategy();
  if(_canonicalStory) parts.push(canonicalStoryStrategyBlock('正文继承的当前有效故事战略'));
  // 开篇策略是首章施工指令，不应污染第2章及之后正文的上下文。
  if(i===0){
    const _opening = openingStrategyBrief(); if(_opening) parts.push(_opening);
    const _openingTask = principalOpeningTaskExcerpt() || openingStrategyExecutionCard(0); if(_openingTask) parts.push(_openingTask);
  }
  const _card=chapterPlanAuthority(i);
  const _lesson = _card?.raw || teacherChapterPlan(i);
  const _closed = !!_lesson;   // 有本章教案 → 开启三层递进闭环上下文箱

  if(_closed){
    
    const hasT = String(chap.title||'').trim();
    parts.push(`【长篇小说与章节定位】
书名：${o.title || '（未定书名）'}
定位：第 ${curN} 章${hasT ? `《${chap.title}》` : ''}`);

    const pRules = principalRulesExcerpt();
    if(pRules){
      parts.push(`【第一层 · 宏观层（不变 · 校长写作守则与文风人设纪律）】
${pRules}
【守则红线】严格遵守全书统一文风、人物说话口吻与人设底线，严禁行文中人设漂移或出现现代违和口语。`);
    }
    const pStyle = principalStyleExecutionExcerpt();
    if(pStyle){
      parts.push(`【第一层附录 · 已裁决风格施工层（只决定怎么写，不决定写什么）】
${pStyle}
执行原则：这是校长已经完成的风格冲突裁决结果。你不得在正文阶段重新选择‘轻松/悬疑/治愈/冷峻’等风格组合；只需按本章教案把既定风格落到具体场景、对白、叙事、节奏与情绪。`);
    const pCausal = principalCausalityExcerpt();
    parts.push(`【第一层附录 · 因果闭环锁（决定事件能否这样发生）】
${pCausal}
执行原则：本层不改变老师教案规定的核心剧情，但会审查事件发生资格。教案中的结果必须通过已建立的前置状态、线索/信息来源、人物行动、能力/资源与场景触发自然抵达；若教案本身存在因果缺口，正文不得凭空发明关键理由，应优先采用教案允许的铺垫空间补足最小必要中间步骤。`);
    }

    parts.push(`【第二层 · 中观层（静态指导 · 单源真理超级教案）】
说明：这是任课老师为你备下的本章唯一创作航海图（已深度内嵌章节微拍节奏、时间落点与严谨出场名单）。本章的剧情目标与事实边界以校长章级导演/授权任务卡为上位约束；老师教案负责在该边界内提供施工骨架。二者不是竞争的两份方案：校长卡管“能不能这样发生”，老师教案管“怎样发生”。，严格按指引逐拍写透写足，严禁自行越权脑补或擅改主线。
——— 本章超级教案开始 ———
${_lesson}
——— 本章超级教案结束 ———`);
    parts.push(`【正文执行锁】风格冲突已在校长层解决、场景化施工已在老师层解决；正文阶段禁止再次进行风格方案选择。你只需把‘本章风格施工指令’稳定落实到教案规定的事件中：同一事件可以换不同文学写法，但不得改变事件本身、不得新增一套风格体系。`);

    const _timeContract = _timeContractForChapter(i);
    if(_timeContract) parts.push(_timeContract);

    const microParts = [];
    if(i > 0){
      const ledger = buildDynamicProtagonistLedger(i);
      if(ledger) microParts.push(ledger);

      const rolling = buildRollingSummary(i);
      if(rolling) microParts.push(`◆ 前文滚动剧情记忆（防长篇记忆损耗）\n${rolling}`);

      parts.push(`【第三层 · 微观层（动态滚入 · 物理事实与动态状态战报包）】\n${microParts.join('\n\n')}`);
    } else {
      parts.push(`【第三层 · 微观层（首章开篇物理基准）】
本章为全书第 1 章（首章开篇）：无上一章正文。首段应从实际事件/人物现场或本章教案规定的起点自然起笔，尽早建立核心人物、当前处境与读者可继续追问的问题。若用户选择了具体开篇策略，必须与本章教案融合执行；若选择“不选择开篇策略”，不得自行生成、推荐或强行套用任何开篇策略。`);
    }

    const _endingPlan = chapterEndingPlanFor(i);
    if(_endingPlan) parts.push(chapterEndingDecisionBlock(i));

    const bc = chapterBoundaryContract(i);
    const isLast = bc.isLast;
    let boundary = hasT
      ? `【本章边界·硬停止】本章内容须紧扣本章标题与教案展开；不得偏离本章推进骨架。已发生的剧情不重复叙述。`
      : `【本章边界·硬停止】本章内容须紧扣教案推进骨架展开；不得偏离本章剧情范围。已发生的剧情不重复叙述。`;
    boundary += `\n【本章停止信号】章末状态：${bc.ending || '（教案未明确填写；以最后一个节拍的完成状态为止）'}`;
    if(bc.lastBeat) boundary += `\n【允许的最后剧情节点】${bc.lastBeat}`;
    if(isLast){
      boundary += `\n【全书收束】本章为全书最后一章：完成本章教案规定的最终解决与收束即可。不要把后台“阶段移交”信息写成正文；达到章末状态后立即停止。`;
    } else {
      boundary += `\n【下一章硬边界】下一章为第 ${i+2} 章${bc.nextTitle?`《${bc.nextTitle}》`:''}。本章严禁提前展开、预演或具体剧透下一章；下一章不是本章的补充字数来源。`;
    }
    boundary += `\n【阶段移交硬禁】任何“本阶段向下一阶段移交”“阶段高潮成果”“后续阶段悬念”等后台信息只可用于理解连续性，绝不属于本章正文剧情。`;
    parts.push(boundary);

  } else {
    parts.push(`【小说简介】书名：${o.title||''}\n${o.logline||''}`);
    const plan = (Array.isArray(o.chapterPlans) && o.chapterPlans[i]) || null;
    if(plan && String(plan.beatsText||'').trim()){
      const _l1txt = cleanBeatDividerTrailer(plan.beatsText);
      if(_l1txt) parts.push(`【本章节拍编排】\n${_l1txt}\n`);
    }
    if(i > 0){
      const ledger = buildDynamicProtagonistLedger(i);
      if(ledger) parts.push(ledger);
      const rolling = buildRollingSummary(i);
      if(rolling) parts.push(`【前文滚动摘要】\n${rolling}`);
    }
    const hasT = String(chap.title||'').trim();
    const _timeContract = _timeContractForChapter(i);
    if(_timeContract) parts.push(_timeContract);
    const _ccTime = _card ? _extractPlanTimeRange({beatsText:'剧情时间落点：'+String(_card.time||'')}) : {from:'',to:''};
    if(_card && _ccTime.from && _ccTime.to){
      const _span=_timeDaySpan(_ccTime.from,_ccTime.to);
      parts.push(`【章节时间覆盖执行令】本章必须从“${_ccTime.from}”真实推进到“${_ccTime.to}”。${_span!=null&&_span>=1?`这是约${_span}天的跨度；可以跳日、蒙太奇、赶路、训练、调查、生活过程或阶段性结果来承载，但不能把全部事件挤在前1-2天后仅在末尾口头说“过了几天”。`:''} ${_card.timeCoverage?`老师安排的时间推进：${_card.timeCoverage}`:''} 骨架每一环必须服从这个时间轴；相邻环节跨日时必须自然交代时间流逝。`);
    }
    parts.push(`【本章任务】第 ${curN} 章${hasT ? `《${chap.title}》` : ''}`);
  }

  if(isLong()){
    if(!_card) commitPlannedChapterState(i, (state.outline&&state.outline.chapterPlans||[])[i]||{}, 'legacy-plan');
    const _ssb=storyStateChapterBlock(i); if(_ssb) parts.push(`【小说状态链｜上一章实际结算 + 本章计划】\n${_ssb}`);
    const _qg=buildChapterInformationGuard(i); if(_qg) parts.push(_qg);
    const _cb=buildChapterCharacterBehaviorBlock(i); if(_cb) parts.push(_cb);
    const _cdr=buildChapterCharacterDynamicReactionBlock(i); if(_cdr) parts.push(_cdr);
    const _cdb=buildChapterDialogueSubtextBlock(i); if(_cdb) parts.push(_cdb);
    const _cil=buildChapterLocalInfoLedgerBlock(i); if(_cil) parts.push(_cil);
    parts.push(chapterQualityPromptBlock());
  }
  parts.push(`【事件可达性硬门】写每个重大事件前，内部快速核对：前置状态是否已成立？触发线索是否存在？人物为什么会采取这一步？信息/道具/能力从哪里来？地点与时间是否可达？本事件是否会让前后因果断裂？若任一关键项缺失，不得用“突然/恰好/偶然”直接补过去。`);
  const _authText = principalChapterTask(i); if(_authText) parts.push(`【章级事实授权硬门】校长任务卡优先于老师教案。名单外人物若承担关键剧情功能、任何人物若获得未授权核心情报、或新事实改变主线，均不得直接写入正文；只能使用已有授权资源、走另一条有依据的路径，或保留为待确认项。`);
  const _endDecision = chapterEndingDecisionBlock(i); if(_endDecision) parts.push(_endDecision);
  parts.push(chapterEndingAuditText(i));
  parts.push(endingTemplateGuardText());
  if(isLong() && !chapterPlanAuthority(i)){ throw new Error('当前章节没有老师教案卡，请先完成对应老师备课。'); }
  parts.push(USER_PRIO_BILL);
  if(opt.advice) parts.push(`【人工干预要求（用户指定 · 第二优先）】\n${opt.advice}`);

  const _lb = chapterLenBounds() || {floor:2700, lo:3000, hi:3600};
  const _lo = (_lb.lo>0?Math.round(+_lb.lo):3000), _hi = (_lb.hi>0?Math.round(+_lb.hi):3600);
  const _cap = Math.max(_hi, Math.round(_hi*1.15));
  parts.push(`【篇幅参考 · 只服务于体量，不驱动剧情】本章建议正文约 ${_lo.toLocaleString()}—${_hi.toLocaleString()} 字；没有“必须补足”的硬字数门槛，剧情完整与章末状态优先。
【成篇写法】
1. 骨架里每一段事件都必须写到、不得遗漏，但它们不是互不相干的独立小节，而是本章内按因果连续推进的故事小节：写正文时由上个环节的剧情自然引到下个环节，相邻环节之间必须有自然的衔接与过渡（剧情因果驱动、情绪递进、动作延续，或时间/空间切换的过渡句），只要叙事连续，相邻环节允许融合在同一场景内连续推进，不必每拍单起一段。禁止硬跳切、禁止把某段事件单独拎出来自写自满。
2. 以故事完整性为全章落点，让情节从本章开笔承接点持续推进到【章末状态】；${_lo.toLocaleString()}—${_hi.toLocaleString()} 字仅作体量参考。正文直接以小说段落呈现，不写任何节拍小标、不做逐拍分段的拼装痕迹。
3. 【停止优先于长度】只要最后一个必要事件已完成且【章末状态】成立，立即结束本章，即使未达到建议字数也不得继续。只有当已有事件本身明显写得过快、影响理解时，才允许在这些已发生事件内部自然补足必要表现。
4. 自然收束：达到建议体量后，如果章末状态成立就交付；如果核心事件尚未完成，继续完成必要剧情，不因数字机械截断。无论长短，都禁止为了“再多写点”追加无关内容。`);

  _dictRedlineOver = false;
  const _b = budgetChapterContext(parts, 24000);
  if(_dictRedlineOver){ setTimeout(()=>toast('当前上下文超出建议预算，若频繁出现请提高输出上限。'), 0); }
  return _b.join('\n\n');
}

function fullGlossaryChapterBlock(i){
  const o = state.outline;
  const g = (o && o.glossary) || {};
  const chars = Array.isArray(g.characters) ? g.characters : [];
  const places = Array.isArray(g.places) ? g.places : [];
  const props = Array.isArray(g.propernouns) ? g.propernouns : [];
  if(!chars.length && !places.length && !props.length) return '';
  const protagonist = (o && o.navBeacon && o.navBeacon.protagonist) ? String(o.navBeacon.protagonist).split(/[，,：:（(]/)[0].trim() : '';
  const appearing = new Set();
  (relevantGlossaryForChapter(i).characters||[]).forEach(c=>{ const n=String(c&&c.name||'').trim(); if(n) appearing.add(n); });
  if(protagonist) appearing.add(protagonist);
  const lines = [];
  const charLines = chars.map(c=>{
    const n = String(c&&c.name||'').trim(); if(!n) return '';
    if(appearing.has(n)){
      return `\n· ${fmtCharFullFields(c).join('，')}`;
    }
    return `\n· ${n}（${(c&&c.identity)||'人物'}）`;
  }).filter(Boolean);
  if(charLines.length) lines.push(`人物（全量名单；●=主角/本章出场·给全部7字段）：${charLines.join('')}`);
  const placeLines = places.map(p=>{ const n=String(p&&p.name||'').trim(); if(!n) return ''; return `\n· ${n}（${(p&&p.type)||''}）${p&&p.note?`：${p.note}`:''}`; }).filter(Boolean);
  if(placeLines.length) lines.push(`地名（全量）：${placeLines.join('')}`);
  const propLines = props.map(p=>{ const n=String(p&&p.name||'').trim(); if(!n) return ''; return `\n· ${n}${p&&p.note?`：${p.note}`:''}`; }).filter(Boolean);
  if(propLines.length) lines.push(`专名（全量）：${propLines.join('')}`);
  if(Array.isArray(g._worldRules) && g._worldRules.length){
    lines.push(`世界观规则（全量·正文须遵守不违背）：${g._worldRules.map(fmtWR).join('；')}`);
  }
  const wkOnes = (g.walkons||[]).filter(w=>String(w&&w.name||'').trim()).map(w=>`${String(w.name).trim()}${String(w&&w.note||'').trim()?`（${String(w.note).trim()}）`:''}`).join('、');
  if(wkOnes) lines.push(`路人龙套（词典充实闲人，可选用登场：只一句台词/一个镜头即可，无需九维）：${wkOnes}`);
  lines.push(`【临时闲人·小地名·小专名（允许现场点缀，不入词典）】当场景自然地需要店小二、摊贩、车夫、茶客、围观者、更夫、报信者这类只出现这一次、只说一两句或只露一眼的过场闲人，或某个只此一现、日后不再提起的小地名/小专名时，可现场信手自拟一个名字，写一句便止、点到即收：只作氛围点缀，不写主持戏份、不给任何设定交代、更不得写入万物词典。硬约束：①仅限真实"过场/一次性泛称"——凡有台词作用、会再登场、或要推动情节的人地专名，一律回到本词典取用，严禁自立核心名绕开词典；②不得与本词典或上方【路人龙套】已有人名/地名/专名重名；③非机械化——这是剧情的自然点缀，不是每章必须完成的任务，切忌刻意凑数、生硬点名或反复秀存在感，多数章节甚至无需新增。`);
  return '请全程遵循本设定词典（有台词/有戏份或反复出现的人地专名一律取用本词典、保持一致，禁止自造核心名；仅作氛围的临时路人/小地名/小专名允许现场点缀一次、不入词典，见上【临时闲人】段，非机械化凑数；人物关系/性格/地域往来/专名用法与世界规则与此保持统一）：\n' + lines.join('\n');
}

function rollCallGlossary(i){
  const o = state.outline;
  const g = (o && o.glossary) || {};
  const chars = Array.isArray(g.characters) ? g.characters : [];
  const places = Array.isArray(g.places) ? g.places : [];
  const props = Array.isArray(g.propernouns) ? g.propernouns : [];
  if(!chars.length && !places.length && !props.length) return '';
  const lesson = teacherChapterPlan(i);
  const names = new Set();
  let named = false;
  const re = /本章出场名单[：:][^\n]*/;
  if(lesson && re.test(lesson)){
    const seg = lesson.match(re)[0].replace(/^本章出场名单[：:]/, '').trim();
    const namedArr = seg.replace(/[，,、；;。]+/g, '|').split('|').map(s=>s.trim()).filter(s=>s && s.length <= 8);
    if(namedArr.length){
      named = true;
      namedArr.forEach(n=>{
        names.add(n);
        const aliasMap = (typeof glossaryAliases==='function') ? glossaryAliases() : new Map();
        if(aliasMap && aliasMap.size){ aliasMap.forEach((cur, al)=>{ if(String(al)===n) names.add(cur); }); }
      });
    }
  }
  if(o.navBeacon && o.navBeacon.protagonist){
    const name = String(o.navBeacon.protagonist).split(/[，,：:（(]/)[0].trim();
    if(name) names.add(name);
  }
  const matched = new Set();
  chars.forEach(c=>{ const n=String(c&&c.name||'').trim(); if(!n) return; if(names.has(n) || [...names].some(x=>n.includes(x)||x.includes(n))) matched.add(n); });
  if(!named && matched.size===0 && o.navBeacon && o.navBeacon.protagonist){
    const pn = String(o.navBeacon.protagonist).split(/[，,：:（(]/)[0].trim();
    if(pn) matched.add(pn);
  }
  const lines = [];
  if(matched.size || places.length || props.length){
    const charLines = chars.map(c=>{
      const n = String(c&&c.name||'').trim(); if(!n) return '';
      if(matched.has(n)) return `\n· ${fmtCharFullFields(c).join('，')}`;
      return '';
    }).filter(Boolean);
    if(charLines.length) lines.push(`人物（只读本章出场名单档案卡，名单外角色不供给）：${charLines.join('')}`);
    lines.push(`【本章出场名单（老师点名·正文唯一可用人物范围）】${named ? [...names].join('、') : '（教案未点名，以主角为准）'}`);
  }
  if(lines.length){
    return '【闭卷·点名制设定（唯一人物/设定来源，只读）：本章只为「本章出场名单」内的人地专名供给档案卡；名单外任何人/地/专名一律不可写、不可提、不可依靠参照。人物/地名/专名的一致性以此为准，但剧情走向、时间、承接一律以教案为准，设定不决定剧情。】\n' + lines.join('\n');
  }
  return '';
}

function relevantGlossaryForChapter(i){
  const o = state.outline;
  if(!o) return {characters:[], places:[], propernouns:[]};
  if(o._relGlossCache && o._relGlossCache[i] && !o._relGlossCache[i]._stale) return o._relGlossCache[i];
  const g = o.glossary || {};
  const plan = (Array.isArray(o.chapterPlans) && o.chapterPlans[i]) || {};
  const prev = i > 0 ? state.chapters[i-1] : null;
  const keywords = new Set();
  (plan.requiredEntities||[]).forEach(e => keywords.add(String(e).trim()));
  const _aliasMap = glossaryAliases();
  if(_aliasMap.size) _aliasMap.forEach((cur, al) => { if(keywords.has(al)) keywords.add(cur); });
  if(o.navBeacon && o.navBeacon.protagonist){
    const name = String(o.navBeacon.protagonist).split(/[，,：:（(]/)[0].trim();
    if(name) keywords.add(name);
  }
  if(prev && prev.content){
    const fc = o._factCard || {};
    const appeared = fc.characters || {};
    Object.keys(appeared).forEach(name => { if(appeared[name] > 0) keywords.add(name); });
    const tail = String(prev.content).slice(-3000);
    (g.characters||[]).forEach(c => {
      const nm = String(c.name||'').trim();
      if(nm && new RegExp(escapeRegExp(nm)).test(tail)) keywords.add(nm);
    });
  }
  if(!keywords.size){
    const empty = {characters:[], places:[], propernouns:[]};
    o._relGlossCache = o._relGlossCache || {}; o._relGlossCache[i] = empty;
    return empty;
  }
  const kwArr = Array.from(keywords).filter(Boolean).sort((a,b)=>b.length-a.length);
  const kwRe = kwArr.length ? new RegExp(kwArr.map(escapeRegExp).join('|'), 'g') : null;
  const match = (arr) => {
    if(!kwRe) return [];
    return (arr||[]).filter(it => {
      const nm = String(it.name||'').trim();
      if(!nm) return false;
      kwRe.lastIndex = 0;
      if(kwRe.test(nm)) return true;
      const hay = [(it._alias||[]).join(' '), it.identity, it.relation, it.note, it.appearance, it.type].join(' ');
      kwRe.lastIndex = 0;
      return kwRe.test(hay);
    });
  };
  const res = {
    characters: match(g.characters),
    places: match(g.places),
    propernouns: match(g.propernouns)
  };
  o._relGlossCache = o._relGlossCache || {};
  o._relGlossCache[i] = res;
  return res;
}
function escapeRegExp(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function fogWorldInject(i){
  const o = state.outline; if(!o) return '';
  const g = o.glossary || {};
  const seg = [];
  const rg = relevantGlossaryForChapter(i);
  const mk = k => new Set((rg[k]||[]).map(x=>String(x&&x.name||'').trim()).filter(Boolean));
  const chars = mk('characters'), pls = mk('places'), prps = mk('propernouns');
  const rel = (g._relationshipTable||[]).filter(x=> x && (chars.has(x.a)||chars.has(x.b)));
  const pc  = (g._placeContacts||[]).filter(x=> x && (pls.has(x.from)||pls.has(x.to)));
  const prc = (g._properContacts||[]).filter(x=> x && (prps.has(x.from)||prps.has(x.to)));
  let any = false;
  if(rel.length){ seg.push(`【人物关系表·迷雾】（仅本章已出场人物直接相关的关系，正文据此写、未揭示的不得提前写）\n${rel.map(x=>`${x.a} ←${x.relation||'？'}→ ${x.b}${x.note?`（${x.note}）`:''}`).join('\n')}`); any = true; }
  if(pc.length){ seg.push(`【地名关联表·迷雾】（仅本章已出场地点直接相关的关联）\n${pc.map(x=>`${x.from} ↔ ${x.to}${x.relation?`（${x.relation}）`:''}${x.note?`：${x.note}`:''}`).join('\n')}`); any = true; }
  if(prc.length){ seg.push(`【专名关联表·迷雾】（仅本章已出场专名直接相关的关联）\n${prc.map(x=>`${x.from} ↔ ${x.to}${x.relation?`（${x.relation}）`:''}${x.note?`：${x.note}`:''}`).join('\n')}`); any = true; }
  if(any){
    const fogNote = `\n（注：上述关系/关联为「迷雾」版，只列出与本章已出场实体直接相关的部分；未在本章出现或尚未揭示的关系，正文一律不得提前书写、留待后续章节自然展开，以免提前剧透。）`;
    return `${seg.join('\n')}${fogNote}`;
  }
  return '';
}

function fmtCharFullFields(c){
  const segs = [String(c.name||'')];
  if(c.identity && c.identity !== '未知') segs.push('身份:'+c.identity);
  if(c.age && c.age !== '未知') segs.push(String(c.age).replace(/岁$/,'')+'岁');
  if(c.gender && c.gender !== '未知') segs.push(c.gender);
  if(c.appearance && c.appearance !== '未知') segs.push('外貌:'+c.appearance);
  if(c.trait && c.trait !== '未知') segs.push('性格:'+c.trait);
  if(c.hobby && c.hobby !== '未知') segs.push('爱好:'+c.hobby);
  if(c.catchphrase && c.catchphrase !== '未知' && c.catchphrase !== '无') segs.push('口头禅:'+c.catchphrase);
  if(c.relation && c.relation !== '未知') segs.push('关系:'+c.relation);
  return segs;
}
function formatRelevantGlossary(rg){
  const lines = [];
  if(rg.characters && rg.characters.length){
    lines.push('人物：'+rg.characters.map(c=>'（'+fmtCharFullFields(c).join('，')+'）').join(''));
  }
  if(rg.places && rg.places.length) lines.push('地点：'+rg.places.map(p=>`${p.name}${p.note?'（'+p.note+'）':''}`).join('、'));
  if(rg.propernouns && rg.propernouns.length) lines.push('专名：'+rg.propernouns.map(p=>`${p.name}${p.note?'（'+p.note+'）':''}`).join('、'));
  return lines.join('\n');
}


function longestCommonPrefix(a, b){
  let i = 0;
  while(i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
  return a.slice(0, i);
}

const ROLLING_SUMMARY_SYS = `你是长篇小说滚动摘要助手。请把以下连续若干章的剧情压缩成一份 300-400 字的摘要，保留：主线推进、关键人物状态变化、情绪转折。不要细节描写，不要环境铺陈。`;

function buildRollingSummary(i){
  if(i <= 0) return '';
  const o = state.outline; if(!o) return '';
  const digests = Array.isArray(o._chapterDigests) ? o._chapterDigests : [];
  const blocks  = Array.isArray(o._rollingSummaries) ? o._rollingSummaries : [];
  const near = [];
  for(let k = i-2; k >= Math.max(0, i-6); k--){
    if(digests[k] && digests[k].text) near.unshift(`第 ${k+1} 章：${digests[k].text}`);
  }
  const mid = [];
  for(let k = i-7; k >= Math.max(0, i-11); k--){
    if(digests[k] && digests[k].text) mid.unshift(`第 ${k+1} 章：${String(digests[k].text).slice(0, 120)}`);
  }
  const far = blocks.filter(s=>{
    const [a,b] = String(s.key||'').split('-').map(Number);
    return Number.isFinite(b) && b < i - 11 && b >= i - 31;
  }).map(s => `第 ${s.key} 章：${s.text}`).join('\n');
  return [
    far ? `【远期摘要（第 1 章起更早章节，5 章块）】\n${far}` : '',
    mid.length ? `【中程记忆 · 十章窗远五章（第 ${Math.max(1, i-10)}~${i-6} 章，简纪要）】\n${mid.join('\n')}` : '',
    near.length ? `【近期记忆 · 五章窗近五章（第 ${Math.max(1, i-5)}~${i-1} 章，细纪要 = 承接重点）】\n${near.join('\n')}` : ''
  ].filter(Boolean).join('\n\n');
}

function invalidateChapterMemory(i){
  const o = state.outline; if(!o) return;
  if(o._rollingSummaries){
    o._rollingSummaries = o._rollingSummaries.filter(s => {
      const [a,b] = String(s.key||'').split('-').map(Number);
      return !(a <= i+1 && b >= i+1);
    });
  }
  if(state._chapterPartial) delete state._chapterPartial[i];
  if(Array.isArray(o._chapterDigests)) delete o._chapterDigests[i];
  if(o._relGlossCache){
    Object.keys(o._relGlossCache).forEach(k => { if(+k >= i) o._relGlossCache[k]._stale = true; });
  }
  persist();
}

const CHAPTER_DIGEST_SYS = `你是长篇小说剧情摘要助手。把这一章压缩成 200-300 字的剧情纪要：本章发生的事件、人物状态变化、新出现的人/物/设定、章节末尾形成的新状态。只记事实，不写景不抒情。不要猜测正文没有出现的事实。`;
async function ensureChapterDigests(onlyIdx){
  const o = state.outline; if(!o) return;
  if(!Array.isArray(o._chapterDigests)) o._chapterDigests = [];
  const written = state.chapters.map((c,i)=> (c && c.content && String(c.content).trim()) ? i : -1).filter(i=>i>=0);
  for(const idx of written){
    if(onlyIdx !== undefined && onlyIdx !== null && idx !== onlyIdx) continue;
    if(o._chapterDigests[idx] && o._chapterDigests[idx].text) continue;
    try{
      const res = await callDeepSeek(CHAPTER_DIGEST_SYS, `第 ${idx+1} 章正文：\n` + String(state.chapters[idx].content||'').slice(0,6000),
        {maxTokens: clampMaxTokens('summary'), temperature: resolveActiveSpec().rollingTemp, topP: 0.5, taskKey:'rolling'});
      o._chapterDigests[idx] = { ts: Date.now(), text: String(res.text||'').trim().slice(0,400) };
      persist();
    }catch(e){ return; }   // 一次失败即退出，下次触发再续
  }
}

async function generateRollingSummaries(){
  ensureChapterDigests().catch(()=>{});
  const o = state.outline;
  if(!o) return;
  if(!o._rollingSummaries) o._rollingSummaries = [];
  const written = state.chapters.map((c,i) => (c && c.content && String(c.content).trim()) ? i : -1).filter(i => i >= 0);
  if(!written.length) return;
  const max = Math.max(...written) + 1;
  for(let end=5; end<=max; end+=5){
    const start = end - 4;
    const key = `${start}-${end}`;
    if(o._rollingSummaries.some(s => s.key === key)) continue;
    const bodies = state.chapters.slice(start-1, end).map(c => c.content).join('\n\n');
    try{
      const res = await callDeepSeek(ROLLING_SUMMARY_SYS, bodies, {maxTokens: clampMaxTokens('summary'), temperature: resolveActiveSpec().rollingTemp, topP: 0.5, taskKey:'rolling'});
      o._rollingSummaries.push({key, text: String(res.text||'').trim().slice(0,500)});
      persist();
    }catch(e){ /* 静默失败 */ }
  }
}
const chState = {};

function adoptChapterPartial(i){
  const p = String((state._chapterPartial||{})[i]||'').trim();
  if(!p){ toast('本章暂无已缓存文本'); return; }
  snapshotChapterVersion(i);
  state.chapters[i].content = p;
  delete state._chapterPartial[i];
  chState[i] = 'done';
  persist(); patchChapter(i);
  toast(`第 ${i+1} 章已采用已生成部分（${countWords(p).total.toLocaleString()} 字）`);
}

function chapterBadgesHtml(i){
  const c = state.chapters[i] || {};
  const hasC = !!(c.content && String(c.content).trim());
  const partial = state._chapterPartial && state._chapterPartial[i];
  const partialW = partial ? countWords(String(partial).trim()).total : 0;
  const parts = [];
  if(chState[i]==='error'){
    parts.push(`<span class="pill tag-warn" data-ch-state>⚠️ 生成失败</span>`);
  } else if(hasC){
    parts.push(`<span class="pill tag-ok" data-ch-state>✓ 已确认</span>`);
  } else {
    parts.push(`<span class="pill tag-warn" data-ch-state>未生成</span>`);
  }
  if(partialW>=50 && chState[i]!=='generating'){
    parts.push(`<button class="btn small primary" data-ne-resume-ch="${i}" title="利用已缓存的 ${partialW.toLocaleString()} 字继续生成">▶️ 继续生成</button>`);
    parts.push(`<button class="btn small ghost" data-ne-partial-adopt="${i}" title="直接把已缓存的 ${partialW.toLocaleString()} 字作为本章正文（不再续写）">⬇ 采用已生成部分</button>`);
  }
  return parts.join('');
}

function patchChapter(i){
  const card = document.querySelector('.ch-card[data-ch-card="'+i+'"]');
  if(!card) return;               // 该章不在当前页渲染范围，跳过 DOM（数据已落库，翻页即见）
  const wc = card.querySelector('[data-wc-ch="'+i+'"]');
  if(wc) wc.innerHTML = wcBadge(state.chapters[i].content, `data-wc-ch="${i}"`);
  const statusWrap = card.querySelector('.ch-status-wrap[data-ch-status="'+i+'"]');
  if(statusWrap) statusWrap.innerHTML = chapterBadgesHtml(i);
  const hasC = !!(state.chapters[i].content && state.chapters[i].content.trim());
  const body = card.querySelector('.ch-body');
  const ta = card.querySelector('textarea[data-ch="'+i+'"]');
  if(ta && !ta.matches(':focus')) ta.value = state.chapters[i].content;
  if(body && body.classList.contains('folded') && hasC){ body.classList.remove('folded'); }
  const ico = card.querySelector('.ch-fold-ico'); if(ico) ico.textContent = (body && body.classList.contains('folded')) ? '▸' : '▾';
  const re = card.querySelector('[data-regen="'+i+'"]');
  if(re){ re.disabled = !!state.generating; }
  const sum = card.querySelector('[data-ch-sum="'+i+'"]');
  if(sum){ sum.disabled = !hasC; }
  const ver = card.querySelector('[data-ver="'+i+'"]');
  if(ver){ ver.textContent = '📚 版本('+chVersions(i).length+')'; }
  const undo = card.querySelector('[data-undo="'+i+'"]');
  if(undo){ undo.style.display = hasEditHistory(i) ? '' : 'none'; }
  if(isLong() && state.chapters[i]){
    const h3 = card.querySelector('.ch-head h3');
    if(h3){
      const c = state.chapters[i];
      const titleTxt = `第${i+1}章 · ${esc(cleanChapterTitle(c.title))}`;
      h3.title = titleTxt;
      let badgeHtml = '';
      if(c._titleByAI){
        badgeHtml = '<i class="tbd-title-tag" style="font-style:normal;font-size:11px;font-weight:400;opacity:.55;margin-left:6px" title="本章标题已由章节正文 AI 定稿">正文定稿</i>';
      } else if(!state.plannerFinalized){
        badgeHtml = '<i class="tbd-title-tag" style="font-style:normal;font-size:11px;font-weight:400;opacity:.55;margin-left:6px" title="标题尚未由全书规划师定稿，当前沿用第二步参考稿">参考稿</i>';
      }
      h3.innerHTML = titleTxt + badgeHtml;
    }
  }
}

function openChapterRegenPanel(i){
  closeChapterRegenPanel();
  const c = state.chapters[i];
  const title = c && c.title ? c.title : ('第'+(i+1)+'章');
  const hist = Array.isArray(c && c.regenHistory) ? c.regenHistory : [];
  const pushRegen = (mode, advice)=>{
    const h = Array.isArray(state.chapters[i].regenHistory) ? state.chapters[i].regenHistory : (state.chapters[i].regenHistory = []);
    h.push({ ts: Date.now(), mode, advice: String(advice||'') });
    if(h.length > 10) h.splice(0, h.length - 10);
    persist();
  };
  const pad = n => n<10?('0'+n):n;
  const histHtml = hist.length ? `
    <div class="rp-hist">
      <div class="rp-hist-title">📜 历史干预（点击回填到上方输入框）</div>
      ${hist.slice().sort((a,b)=>b.ts-a.ts).map(r=>{
        const d = new Date(r.ts);
        const t = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        const txt = r.advice || '（直接重生成，无干预）';
        return `<div class="rp-hist-item" data-rp-fill="${esc(txt)}" title="${esc(txt)}">
          <span class="rp-hist-ts">${t}</span>
          <span class="rp-hist-txt">${esc(txt)}</span>
        </div>`;
      }).join('')}
    </div>` : '';
  const rpOv = { on:false, tags:[] };
  const rpCmpB = { tags:[] };
  let rpOvApplied = null;     // 覆盖块「应用」确认快照 {on,tags}；null=未确认（未点应用则重生成不生效）
  let rpCmpBApplied = null;   // 对比块「应用」确认快照 {tags}；null=未确认（未点应用则 B 稿不生效）
  const ov = document.createElement('div');
  ov.id = 'regenPanel'; ov.className = 'gs-overlay';
  ov.setAttribute('data-cs', wsColorSchemeId());
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🔄 重生成 · 第${i+1}章「${esc(cleanChapterTitle(title))}」</b>
        <button class="gs-x" data-rp-close>✕</button></div>
      <div class="gs-actions rp-top-actions">
        <button class="btn" data-rp-plain>直接重生成（无干预）</button>
        <button class="btn primary" data-rp-with>💡 带我的建议重生成</button>
      </div>
      <div class="gs-body">
        <textarea id="rpAdvice" class="rp-advice" placeholder="可选：写具体要求（如压缩到1500字、女主性格外放、增加与上章衔接…）；留空则直接点评本章正文"></textarea>
        <div class="advice-ai-row">
          <button type="button" class="btn small ghost" data-advice-ai="${i}">✨ 正文优化建议</button>
          <button type="button" class="ai-upload-btn ai-hist-btn" data-advadv-hist="${i}" title="章节内容 AI 建议历史：回看已生成过的建议（随项目保存）">📖<span class="ai-hist-badge">${Array.isArray(state.contentAdviceHist)?state.contentAdviceHist.length:''}</span></button>
          <span class="muted" style="font-size:11px">AI 审读本章全文、上一章全文、下一章标题与万物词典给 1–3 条点评建议；点击即回填，可再手改</span>
        </div>
        <div data-advice-ai-out></div>
        ${histHtml}
        <div class="rp-style">
          <div class="rp-style-head" data-rpov-fold role="button" tabindex="0">
            <span>🎨 本章风格覆盖 <span class="rp-style-arrow">▸</span></span>
            <span class="muted" style="font-size:11px;font-weight:400">默认跟随全书 · 一次性不保存</span>
          </div>
          <div class="rp-style-body hidden">
           <div class="rp-ov-toggle" data-rpov-toggle>
  <span class="rp-ov-opt active" data-rpov-val="off">📖 全文</span>
  <span class="rp-ov-opt" data-rpov-val="on">🎨 仅本章</span>
</div>
            <div class="rp-style-sub hidden" id="rpOvBox">
              <div class="rp-style-label">覆盖风格（语气单选 · 质感/元素多选）</div>
              ${writeStyleChipsHtml(rpOv, 'rpov')}
              <div class="rp-apply-row">
                <button type="button" class="btn small primary" data-rpov-apply disabled title="确认本次覆盖风格，重生成时方才生效">✔ 应用</button>
                <span class="rp-apply-status" id="rpOvStatus">⚠️ 待应用</span>
              </div>
            </div>
          </div>
        </div>
        <div class="rp-style disabled" data-rpcmp-box>
          <div class="rp-style-head" data-rpcmp-fold role="button" tabindex="0">
            <span>⚡ 双风格对比生成 <span class="rp-style-arrow">▸</span></span>
            <span class="muted" style="font-size:11px;font-weight:400">需先开启上方本章覆盖</span>
          </div>
          <div class="rp-style-body hidden">
            <p class="rp-cmp-lock-hint">🔒 未开启「仅本章覆盖」时不可用；先在上一区选择「仅本章覆盖」以解锁。</p>
            <p class="muted" style="font-size:12px;margin:4px 0 8px">A 稿 = 本章覆盖风格；B 稿 = 下方所选（留空 = 无风格直白版）。</p>
            <div class="rp-style-label">B 稿对比风格</div>
            ${writeStyleChipsHtml(rpCmpB, 'rpcmp')}
            <div class="rp-apply-row">
              <button type="button" class="btn small primary" data-rpcmp-apply disabled title="确认 B 稿对比风格，再点上方按钮生成两稿">✔ 应用</button>
              <span class="rp-apply-status" id="rpCmpStatus">⚠️ 待应用 B 稿</span>
            </div>
            <button class="btn blue" data-rp-compare>⚡ 生成 A/B 两稿并对比</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-rp-close]').onclick = closeChapterRegenPanelAll;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeChapterRegenPanelAll(); });
  const rpCmpBox = ov.querySelector('[data-rpcmp-box]');
  const refreshRpCmpState = ()=>{
    if(!rpCmpBox) return;
    const locked = !rpOv.on;
    rpCmpBox.classList.toggle('disabled', locked);
    const hint = rpCmpBox.querySelector('.rp-cmp-lock-hint');
    if(hint) hint.style.display = locked ? 'block' : 'none';
    const head = rpCmpBox.querySelector('.rp-style-head .muted');
    if(head) head.textContent = locked ? '需先开启上方本章覆盖' : '两次调用 · 左右对照选稿';
  };
  const foldOv = ov.querySelector('[data-rpov-fold]');
  if(foldOv) foldOv.onclick = ()=>{
    const body = ov.querySelector('.rp-style-body'); if(!body) return;
    const on = body.classList.toggle('hidden');
    const arrow = foldOv.querySelector('.rp-style-arrow'); if(arrow) arrow.textContent = on?'▸':'▾';
  };
  const foldCmp = ov.querySelector('[data-rpcmp-fold]');
  if(foldCmp) foldCmp.onclick = ()=>{
    const body = foldCmp.closest('.rp-style').querySelector('.rp-style-body'); if(!body) return;
    const on = body.classList.toggle('hidden');
    const arrow = foldCmp.querySelector('.rp-style-arrow'); if(arrow) arrow.textContent = on?'▸':'▾';
  };
  ov.querySelectorAll('.rp-style-body').forEach(b=> b.classList.add('hidden'));
  ov.querySelectorAll('.rp-style-arrow').forEach(a=> a.textContent = '▸');
  function refreshRpOvApply(){
    const ap = ov.querySelector('[data-rpov-apply]'); const st = ov.querySelector('#rpOvStatus');
    if(!ap) return;
    ap.disabled = !rpOv.on; ap.classList.toggle('disabled', !rpOv.on);
   if(st){ st.textContent = rpOvApplied ? '✔ 已确认' : (rpOv.on ? '⚠️ 待应用' : '全文，无需应用'); st.classList.toggle('ok', !!rpOvApplied); }
  }
  function refreshRpCmpApply(){
    const ap = ov.querySelector('[data-rpcmp-apply]'); const st = ov.querySelector('#rpCmpStatus');
    if(!ap) return;
    const locked = !rpOv.on;
    ap.disabled = locked; ap.classList.toggle('disabled', locked);
    if(st){ st.textContent = rpCmpBApplied ? '✔ 已确认 B 稿' : (locked ? '需先开启本章覆盖' : '⚠️ 待应用 B 稿'); st.classList.toggle('ok', !!rpCmpBApplied); }
  }
  const rpovApplyBtn = ov.querySelector('[data-rpov-apply]');
  if(rpovApplyBtn) rpovApplyBtn.onclick = ()=>{
    if(!rpOv.on) return;
    rpOvApplied = { on:true, tags: rpOv.tags.slice() };
    refreshRpOvApply();
    toast('本章风格覆盖已应用，重生成时生效（仅本次）');
  };
  const rpcmpApplyBtn = ov.querySelector('[data-rpcmp-apply]');
  if(rpcmpApplyBtn) rpcmpApplyBtn.onclick = ()=>{
    if(!rpOv.on) return;
    rpCmpBApplied = { tags: rpCmpB.tags.slice() };
    refreshRpCmpApply();
    toast('B 稿对比风格已应用，生成 A/B 两稿时生效');
  };
  ov.querySelectorAll('[data-rpov-val]').forEach(el=> el.onclick = ()=>{
  ov.querySelectorAll('[data-rpov-val]').forEach(x=> x.classList.remove('active'));
  el.classList.add('active');
  rpOv.on = el.dataset.rpovVal === 'on';
  rpOvApplied = null;
  const box = ov.querySelector('#rpOvBox'); if(box) box.classList.toggle('hidden', !rpOv.on);
  refreshRpCmpState();
  refreshRpOvApply(); refreshRpCmpApply();
});

  ov.querySelectorAll('[data-rpov-tag]').forEach(b=> b.onclick = ()=>{ toggleWriteTag(rpOv, b.dataset.rpovTag); ov.querySelectorAll('[data-rpov-tag]').forEach(x=> x.classList.toggle('on', rpOv.tags.includes(x.dataset.rpovTag))); rpOvApplied = null; refreshRpOvApply(); });
  ov.querySelectorAll('[data-rpcmp-tag]').forEach(b=> b.onclick = ()=>{ toggleWriteTag(rpCmpB, b.dataset.rpcmpTag); ov.querySelectorAll('[data-rpcmp-tag]').forEach(x=> x.classList.toggle('on', rpCmpB.tags.includes(x.dataset.rpcmpTag))); rpCmpBApplied = null; refreshRpCmpApply(); });
  ov.querySelector('[data-rp-plain]').onclick = ()=>{
    const btn = document.querySelector('[data-regen="'+i+'"]');
    closeChapterRegenPanel();
    pushRegen('plain','');
    const ovr = rpOvApplied ? { styleOverride: { tags: rpOvApplied.tags.slice() } } : {};
    if(rpOv.on && !rpOvApplied) toast('已按全书风格重生成（未点「✔ 应用」的覆盖不生效）');
    genOneChapter(i, btn, ovr);
  };
  ov.querySelector('[data-rp-with]').onclick = ()=>{
    const advice = $('#rpAdvice').value.trim();
    const btn = document.querySelector('[data-regen="'+i+'"]');
    closeChapterRegenPanel();
    pushRegen('advice', advice);
    const ovr = rpOvApplied ? { advice, styleOverride: { tags: rpOvApplied.tags.slice() } } : { advice };
    if(rpOv.on && !rpOvApplied) toast('已按全书风格重生成（未点「✔ 应用」的覆盖不生效）');
    genOneChapter(i, btn, ovr);
  };
  ov.querySelector('[data-rp-compare]').onclick = ()=>{
    if(!rpOvApplied){ toast('请先在「🎨 本章风格覆盖」点「✔ 应用」确认 A 稿风格'); return; }
    if(!rpCmpBApplied){ toast('请先在「⚡ 双风格对比」点「✔ 应用」确认 B 稿风格'); return; }
    const btn = document.querySelector('[data-regen="'+i+'"]');
    const styleA = { tags: rpOvApplied.tags.slice() };
    closeChapterRegenPanel();
    genChapterCompare(i, styleA, { tags: rpCmpBApplied.tags.slice() });
  };
  refreshRpCmpState();
  ov.querySelectorAll('[data-rp-fill]').forEach(el=>{
    el.onclick = ()=>{
      const ta = $('#rpAdvice'); if(ta) ta.value = el.dataset.rpFill;
      el.classList.add('rp-fill-on');
      ta && ta.focus();
    };
  });
  const ta = $('#rpAdvice'); if(ta) ta.focus();
  const aiBtn = ov.querySelector('[data-advice-ai]');
  if(aiBtn) aiBtn.onclick = ()=>{ aiRefineAdvice(i); };
  const advH = ov.querySelector('[data-advadv-hist]');
  if(advH) advH.onclick = ()=> openAdvHistPanel('content');
  ov.addEventListener('click', e=>{
    const t = e.target.closest('[data-advice-ai-pick]'); if(!t) return;
    const j = +t.dataset.adviceAiPick;
    const a = Array.isArray(aiAdviceCand) ? aiAdviceCand[j] : null; if(!a) return;
    const ta2 = $('#rpAdvice'); if(ta2){ ta2.value = a.text || ''; ta2.focus(); }
    ov.querySelectorAll('[data-advice-ai-pick]').forEach((el,k)=> el.classList.toggle('on', k===j));
  });
}
function closeChapterRegenPanel(){ const p=$('#regenPanel'); if(p) p.remove(); }

let aiAdviceCand = null;   // {title,text}[] 候选，模块级；关闭弹窗不保留（closeChapterRegenPanel 会一并清）
function closeChapterRegenPanelAll(){ closeChapterRegenPanel(); aiAdviceCand = null; }
function buildAiRefineCtx(i){
  const o = state.outline || {};
  const chap = state.chapters[i] || {};
  const prev = i>0 ? (state.chapters[i-1]||{}) : null;
  const st = curWriteStyle();
  const chapNames = (Array.isArray(st.tags)?st.tags:[]).map(id=>{ const s=writeStyleById(id); return s&&s.group==='element'?s.name:null; }).filter(Boolean).join('、');
  const g = (o && o.glossary) || {};
  const dictChars = (g.characters||[]).map(c=>{
    const parts=[];
    if(c.identity) parts.push('身份:'+c.identity);
    if(c.age) parts.push('年龄:'+c.age);
    if(c.gender) parts.push('性别:'+c.gender);
    if(c.appearance) parts.push('外貌:'+c.appearance);
    if(c.hobby) parts.push('爱好:'+c.hobby);
    if(c.catchphrase && c.catchphrase !== '无') parts.push('口头禅:'+c.catchphrase);
    if(c.relation) parts.push('关系:'+c.relation);
    if(c.trait) parts.push('性格:'+c.trait);
    return (c.name||'')+(parts.length?'（'+parts.join('；')+'）':'');
  }).join('；');
  const dictPlaces = (g.places||[]).map(p=>`${p.name||''}${p.note?`（${p.note}）`:''}`).join('；');
  const dictProps  = (g.propernouns||[]).map(p=>`${p.name||''}${p.note?`（${p.note}）`:''}`).join('；');
  return {
    书名: (o.title||''), 简介: (o.logline||''),
    本章标题: (chap.title||('第'+(i+1)+'章')),
    本章全文: (chap.content||''),   // 续写/扩写需全文，原样提供
    上一章标题: prev ? (prev.title||('第'+i+'章')) : '',
    上一章全文: (prev && prev.content) ? String(prev.content) : '',   // 上一章全文全量
    下一章标题: (o.chapters[i+1]&&o.chapters[i+1].title)||'',
    万物词典: `人物：${dictChars||'（无）'}\n地点：${dictPlaces||'（无）'}\n专名：${dictProps||'（无）'}`,
    当前写作风格: chapNames || '无'
  };
}
function aiRefineAdvicePrompt(ctx, raw){
  const _raw = String(raw||'').trim();
  return { system:[
    '你是资深网文长篇编辑。用户在建议框里可能写了一段补充要求（续写、扩写、改段落、修正称呼错别字等），也可能留空、只是想听你对本章正文的专业点评。',
    '请审读给出的【本章全文】【万物词典】【上下文】，输出 1–3 条建议（至少 1 条、最多 3 条）；每条 = { title(一句话定位本条侧重), text(完整点评 + 可直接下发给章节生成 AI 的可执行命令) }。',
    '【允许"无建议"】若本章已写得很稳、没有真正值得动的地方，就只返回 1 条：{"title":"无建议","text":"本章整体稳定，暂不建议改动。"}——宁缺毋滥，绝不为了凑满条数硬找问题或胡说八道。',
    '【点评要点】节奏是否拖沓或太赶、对白是否有辨识度与推进力、悬念与留白是否给足、人物言行是否与万物词典中的身份/性格/关系一致（有无OOC）、是否承接上一章结尾、是否为下一章（'+ (ctx.下一章标题||'') +'）留好引子、与万物词典命名/设定是否冲突。',
    '【有补充要求时】先满足用户要求（'+ (_raw? _raw.slice(0,120)+'…' : '（用户未给出方向）') +'）的角度，再在该方向之外综合点评；要求为空时直接审读本章正文点评。',
    '【可执行】text 用对章节 AI 说的祈使句，明确范围与幅度，可行时用换行拆 2–3 个可独立启用的子要点；续写/扩写必须承接本章与上一章结尾、不越界到下一章；不臆造万物词典外的新名。',
    '输出仅一个 JSON 数组（1–3 项），无任何讲解、无 markdown 代码块前后缀。每项结构：{ "title":"一句话说明本条侧重什么", "text":"完整点评+可执行命令" }'
    ].join('\n'),
    user: JSON.stringify({ 上下文: ctx, 用户原始要求: (_raw||'(无)') }, null, 1) };
}
async function aiRefineAdvice(i){
  const ta = $('#rpAdvice'); if(!ta) return;
  const raw = ta.value.trim();   // 可空：无补充要求也能生成点评
  const out = $('[data-advice-ai-out]');
  if(out) out.innerHTML = `<p class="muted" style="margin:6px 0 0">⏳ AI 正审读本章正文并给出优化建议…</p>`;
  const btn = $('[data-advice-ai]'); if(btn){ btn.disabled = true; btn.textContent = '生成中…'; }
  try{
    const ctx = buildAiRefineCtx(i);
    const {system, user} = aiRefineAdvicePrompt(ctx, raw);
    const res = unwrapAIResult(await callDeepSeek(system, user, {temperature:resolveActiveSpec().contentAdviseTemp, topP:0.5, maxTokens:clampMaxTokens('json'), taskKey:'contentAdvice'}));
    const list = parseAiJsonList(res);
    const ls = Array.isArray(list) ? list.filter(x=> x && String(x.text||'').trim()) : [];
    if(!ls.length) throw new Error('AI 未返回有效建议，请重试');
    if(ls.length===1 && /无建议/.test(String(ls[0].title||'')+' '+String(ls[0].text||''))){
      aiAdviceCand = null;
      if(out) out.innerHTML = `<p class="muted" style="margin:6px 0 0">💡 ${esc(String(ls[0].text||'本次无建议，正文暂无需改动。').trim())}</p>`;
      if(btn){ btn.disabled = false; btn.textContent = '✨ 正文优化建议'; }
      return;
    }
    aiAdviceCand = ls.slice(0,3);
    const _ch = state.chapters[i] || {};
    addAdvHist('content', { id: aiHistEntryId(), ts: Date.now(), desc: '正文优化建议 · 第'+(i+1)+'章', list: JSON.parse(JSON.stringify(ls.slice(0,3))) });
    refreshAdvHistBadge('content');
  }catch(e){
    aiAdviceCand = null;
    if(out) out.innerHTML = `<p class="muted" style="color:var(--danger);margin:6px 0 0">⚠️ ${esc((e&&e.message)||'生成失败')}</p>`;
  }
  if(out) out.innerHTML = aiAdviceResultHtml();
  if(btn){ btn.disabled = false; btn.textContent = '✨ 正文优化建议'; }
}
function aiAdviceResultHtml(){
  if(!Array.isArray(aiAdviceCand) || !aiAdviceCand.length) return '';
  return aiAdviceCand.map((a,ai)=>`
    <div class="advice-ai-cand" data-advice-ai-pick="${ai}">
      <div class="advice-ai-head">
        <span class="advice-ai-idx">${'①②③'[ai]||(ai+1)}</span>
        <b>${esc(a.title||('方案'+(ai+1)))}</b>
        <button type="button" class="advice-ai-use">✔ 采用</button>
      </div>
      <p>${esc(a.text||'')}</p>
    </div>`).join('');
}

async function genChapterCompare(i, styleA, styleB){
  const c = state.chapters[i]; if(!c) return;
  const btn = document.querySelector('[data-regen="'+i+'"]');
  chState[i] = 'generating'; state.generating = true; patchChapter(i);
  if(btn) busy(btn,true,'对比生成中…');
  const st = $('#chStatus');
  const setPhase = m => { if(st){ st.className='status'; st.textContent = `第 ${i+1}/${state.chapters.length} 章：${m||''}`; } };
  try{
    const user = buildChapterUser(i, {regenerating:true});
    setPhase('生成 A 稿（当前风格）…');
    const txtA = await writeOneChapterContent(i, user, setPhase, null, styleA);
    setPhase('生成 B 稿（对比风格）…');
    const txtB = await writeOneChapterContent(i, user, setPhase, null, styleB);
    chState[i] = 'done';
    openComparePanel(i, txtA, txtB);
    if(st){ st.className='status ok'; st.textContent = `第 ${i+1} 章双风格对比稿已生成，请在弹窗中选择采用。`; }
    toast('两稿已生成，请选择采用');
  }catch(e){
    chState[i] = 'error'; patchChapter(i);
    if(st){ st.className='status err'; st.textContent = '对比生成失败：'+e.message; }
    toast('对比生成失败：'+e.message);
  }finally{
    state.generating = false;
    if(btn) busy(btn,false);
    patchChapter(i);
  }
}
function openComparePanel(i, a, b){
  closeComparePanel();
  const c = state.chapters[i];
  const title = c && c.title ? c.title : ('第'+(i+1)+'章');
  const ov = document.createElement('div'); ov.id='cmpPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>⚡ 双风格对比 · 第${i+1}章「${esc(cleanChapterTitle(title))}」</b>
        <button class="gs-x" data-cmp-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-div">A 稿 = 当前生效风格；B 稿 = 对比风格。采用后，未采用稿会连同旧正文一起存入版本历史（📚 版本 可回退）。</div>
        <div class="qc-pair">
          <div class="qc-side"><div class="qc-side-t">A 稿 · 当前生效风格（${countWords(a).total} 字）</div><div class="qc-pre cmp-pre">${esc(a)}</div></div>
          <div class="qc-side"><div class="qc-side-t">B 稿 · 对比风格（${countWords(b).total} 字）</div><div class="qc-pre cmp-pre">${esc(b)}</div></div>
        </div>
        <div class="gs-actions" style="margin-top:10px">
          <button class="btn primary" data-cmp-use="a">✔ 采用 A 稿</button>
          <button class="btn primary" data-cmp-use="b">✔ 采用 B 稿</button>
          <button class="btn" data-cmp-close>暂不采用（两稿都存历史）</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-cmp-close]').forEach(b=> b.onclick = closeComparePanel);
  ov.addEventListener('click', e=>{ if(e.target===ov) closeComparePanel(); });
  ov.addEventListener('click', e=>{
    const u = e.target.closest('[data-cmp-use]'); if(!u) return;
    const isA = u.dataset.cmpUse === 'a';
    const pick = isA ? a : b;
    const other = isA ? b : a;
    snapshotChapterVersion(i);                    // 旧正文入历史
    const ch = ensureChapterHistory(i);
    ch.content = pick;
    if(other && String(other).trim()) ch.history.push({ content: other, ts: Date.now() });   // 未采用稿也入历史备查
    if(ch.history.length > 50) ch.history.splice(0, ch.history.length - 50);
    updateFactCardFromChapter(i, pick);
    persist(); closeComparePanel(); renderChapters(); updateWcTotal();
    toast('已采用 '+(isA?'A':'B')+' 稿');
  });
}
function closeComparePanel(){ const p=$('#cmpPanel'); if(p) p.remove(); }

async function genOneChapter(i, btn, opt={}){
  if(isLong()){ const cc=chapterPlanAuthority(i); if(!cc){ toast('第'+(i+1)+'章没有老师机器教案卡，请先完成对应老师备课。'); return false; } const ps=commitPlannedChapterState(i,cc,'teacher-card'); if(ps&&state.outline._storyState.chapters[i]&&state.outline._storyState.chapters[i].boundaryAudit?.rewind){ toast(state.outline._storyState.chapters[i].boundaryAudit.note+'；已阻止生成，请先修正教案时间。'); return false; } }
  chState[i] = 'generating'; state.generating = true; patchChapter(i);
  if(btn) busy(btn,true,'生成中…');
  const stopParent = btn && btn.closest('.btn-row') ? btn.closest('.btn-row') : null;
  if(stopParent){
    if(!_abortBtn){ _abortBtn = makeStopBtn(); document.body.appendChild(_abortBtn); }
    _abortCtl = new AbortController();
    _abortBtn.style.display = '';
    const readBtn = stopParent.querySelector(`[data-read="${i}"]`);
    if(readBtn && readBtn.nextSibling){
      stopParent.insertBefore(_abortBtn, readBtn.nextSibling);
    } else {
      stopParent.appendChild(_abortBtn);
    }
  }
  const st = $('#chStatus');
  const setPhase = msg => { if(st){ st.className='status'; st.textContent = `第 ${i+1}/${state.chapters.length} 章：${msg||''}`; } };
  setPhase('准备中…');
  if(i > 0){
    try{
      setPhase('核对上一章摘要…');
      await ensureChapterDigests(i - 1);
    }catch(e){ /* 同步失败不阻断生成，既有兜底通道（尾段原文/批尾补算）接管 */ }
  }
  let _fullContent = '';
  try{
    const user = buildChapterUser(i, {regenerating:true, advice:opt.advice, styleOverride: opt.styleOverride});
    const stStream = $('#chStatus');
    let _s = 0;
    const onStream = currentIsDeepSeek() ? (delta => {
      const d = String(delta||'');
      _s += d.length; _fullContent += d;
      if(stStream){ stStream.className='status'; stStream.textContent = `第 ${i+1}/${state.chapters.length} 章：撰写中 · 已生成 ${_s} 字`; }
      const ta = document.querySelector(`textarea[data-ch="${i}"]`);
      if(ta){ ta.value = _fullContent; ta.scrollTop = ta.scrollHeight; }
      patchChapter(i);
    }) : null;
    const txt = await writeOneChapterContent(i, user, setPhase, onStream, opt.styleOverride);   // 各阶段经 setPhase 上报，正文流式实时字数经 onStream；v2.0 支持本章风格覆盖
    snapshotChapterVersion(i);
    state.chapters[i].content = txt;
    updateFactCardFromChapter(i, txt);
    if(isLong()){ const fin=await finalizeChapterState(i, txt); if(fin.content!==txt){ txt=fin.content; state.chapters[i].content=txt; snapshotChapterVersion(i); persist(); } }
    invalidateChapterMemory(i);
    chState[i] = 'done';
    if(!isLong()) state.chapters[i].confirmed = false;
    persist();                       // 不整页 render，仅定点刷新
    patchChapter(i);
    if(st){ st.className='status ok'; st.textContent = `第 ${i+1} 章已生成。`; }
    toast('第'+(i+1)+'章完成');
    generateRollingSummaries().catch(()=>{});
  }catch(e){
    if(e.name==='AbortError'){ if(st) st.textContent = '第'+(i+1)+'章已停止生成'; }
    else { chState[i] = 'error'; patchChapter(i); if(st){ st.className='status err'; st.textContent = '第'+(i+1)+'章生成失败：'+e.message; } toast('第'+(i+1)+'章生成失败：'+e.message); }
  }
  finally{ hideStopBtn(); state.generating = false; if(btn) busy(btn,false); patchChapter(i); autoUpdateSubplots(); autoUpdateTimeAnchors(); }
}

async function genTwoChapters(pairStart){
  for(let k=0;k<2;k++){
    const idx = pairStart + k;
    let _s2 = 0; let _full2 = '';
    const onStream = currentIsDeepSeek() ? (delta => {
      const d = String(delta||'');
      _s2 += d.length; _full2 += d;
      state._chapterPartial[idx] = _full2;
      const ta = document.querySelector(`textarea[data-ch="${idx}"]`);
      if(ta){ ta.value = _full2; ta.scrollTop = ta.scrollHeight; }
      patchChapter(idx);
    }) : null;
    const txt = await writeOneChapterContent(idx, buildChapterUser(idx), null, onStream);
    snapshotChapterVersion(idx);
    state.chapters[idx].content = txt;
    updateFactCardFromChapter(idx, txt); if(isLong()){ const fin=await finalizeChapterState(idx, txt); if(fin.content!==txt){ txt=fin.content; state.chapters[idx].content=txt; snapshotChapterVersion(idx); } }
    invalidateChapterMemory(idx);
  }
  generateRollingSummaries().catch(()=>{});
}

async function genNChapters(start, n){
  if(n <= 0) return;
  markAIRunning('chapter');
  try{
  for(let k=0; k<n; k++){
    const idx = start + k;
    if(isLong()){ const cc=chapterPlanAuthority(idx); if(!cc) throw new Error('第'+(idx+1)+'章没有老师机器教案卡，请先完成对应老师备课'); const ps=commitPlannedChapterState(idx,cc,'teacher-card'); if(ps&&state.outline._storyState.chapters[idx]&&state.outline._storyState.chapters[idx].boundaryAudit?.rewind) throw new Error(state.outline._storyState.chapters[idx].boundaryAudit.note+'；请修正教案时间'); }
    if(!isLong() && state.chapters[idx] && state.chapters[idx].content && String(state.chapters[idx].content).trim() && state.chapters[idx].confirmed) continue;
    let attempt = 0;
    let txt = '', finishReason = '';
    const resumePartial = (state._chapterPartial && state._chapterPartial[idx]) || '';
    if(resumePartial.length >= 200){
      try{
        txt = await continueTruncatedChapter(idx, '', resumePartial);
        delete state._chapterPartial[idx];
        finishReason = 'stop';
      }catch(e){ /* 续写失败则走正常流程 */ }
    }
    while(attempt < 2){
      attempt++;
      try{
        if(!(resumePartial.length >= 200 && txt && finishReason === 'stop')){
          let _fullN = '', _finishReason = '';
          const onStream = currentIsDeepSeek() ? (delta => {
            const d = String(delta||''); _fullN += d;
            state._chapterPartial[idx] = _fullN;
            const ta = document.querySelector(`textarea[data-ch="${idx}"]`);
            if(ta){ ta.value = _fullN; ta.scrollTop = ta.scrollHeight; }
            patchChapter(idx);
          }) : null;
          const _dyn = dynamicChapterParams(idx);
          if(isLong()){
            const res = await callDeepSeek(longChapterSys(), buildChapterUser(idx), {maxTokens: chapterMaxTokens(), onStream, temperature: _dyn.temperature, topP: _dyn.topP, signal: _abortCtl?.signal, taskKey:'chapter'});
            txt = res.text; finishReason = res.finishReason;
          } else {
            const res = await callDeepSeek(PROMPTS.chapterSys, buildChapterUser(idx), {maxTokens: chapterMaxTokens(), temperature: _dyn.temperature, topP: _dyn.topP, signal: (_abortCtl && _abortCtl.signal), taskKey:'chapter'});
            txt = res.text; finishReason = res.finishReason;
          }
          if(finishReason === 'length'){
            txt = await continueTruncatedChapter(idx, txt);
            finishReason = 'stop';
          }
        }
        let content = enforceChapterBoundary(idx, String(txt||'').trim());
        snapshotChapterVersion(idx);
        state.chapters[idx].content = content;
        if(!isLong()) state.chapters[idx].confirmed = false;
        delete state._chapterPartial[idx];   // 正文落库即清流式缓存，避免已完成章残留"可续写"态
        state._chapterRetryFix = '';
        persist();
        updateFactCardFromChapter(idx, content);
        if(isLong()){ const fin=await finalizeChapterState(idx, content); if(fin.content!==content){ content=fin.content; state.chapters[idx].content=content; snapshotChapterVersion(idx); persist(); } }
        invalidateChapterMemory(idx);
        chState[idx] = 'done';
        patchChapter(idx);
        if(idx > 0){ try{ await ensureChapterDigests(idx - 1); }catch(e){ /* 摘要失败不阻塞，批尾 generateRollingSummaries 再补 */ } }
        break;
      }catch(e){
        if(resumePartial.length >= 200 && attempt === 1 && txt && finishReason === 'stop'){
          txt = ''; finishReason = '';
          continue;
        }
        if(attempt >= 2){
          chState[idx] = 'error';
          patchChapter(idx);
          throw e;
        }
      }
    }
  }
  generateRollingSummaries().catch(()=>{});
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='chapter');
    state.aiNetwork.completed = Array.from(new Set([...(state.aiNetwork.completed||[]), 'chapter']));
    persist();
  }
}

async function continueTruncatedChapter(i, firstPart, resumeFrom){
  const full = resumeFrom ? String(resumeFrom||'') : String(firstPart||'');
  const tail = full.slice(-800);
  const bc = chapterBoundaryContract(i);
  const user = `【当前章节边界契约】
第${bc.chapter}章${bc.nextTitle?`《${bc.nextTitle}》`:''}
【章末状态】${bc.ending||'以最后一个节拍完成为停止点'}
【最后允许剧情节点】${bc.lastBeat||'最后一个教案节拍'}
【续写绝对禁区】下一章、下一阶段、阶段移交信息、后台交接说明均不得写入正文。

【前文末尾（${resumeFrom ? '已生成但尚未落库的草稿尾部' : '被截断'}）】
${tail}

【续写要求】
从上文中断处无缝继续，不要重复任何已有内容，不要重新开头。优先完成当前未完成的本章节拍；一旦抵达【章末状态】立即停止，不得为了输出长度继续推进新的剧情。保持与原文一致的叙事节奏、人物称谓和风格。`;
  let secondPartial = '';
  const res = await callDeepSeek(longChapterSys(), user, {maxTokens: clampMaxTokens('continue'), taskKey:'chapter', onStream: (delta)=>{
    secondPartial += delta;
    state._chapterPartial[i] = full + secondPartial;
  }, temperature: dynamicChapterParams(i).temperature, topP: dynamicChapterParams(i).topP, signal: _abortCtl?.signal});
  let second = String(res.text||'').trim();
  const lcp = longestCommonPrefix(tail, second);
  if(lcp.length > 20) second = second.slice(lcp.length).trim();
  return resumeFrom ? (full + '\n' + second) : (firstPart + '\n' + second);
}
async function continueAndFinalizeChapter(i, sourceNote){
  const partial = (state._chapterPartial && state._chapterPartial[i]) || '';
  if(!partial || String(partial).trim().length < 50){ toast('没有可续写的缓存内容'); return; }
  const _w = countWords(String(partial).trim()).total;
  chState[i] = 'generating';
  patchChapter(i);
  toast(`${sourceNote||'续写'}：已缓存 ${_w.toLocaleString()} 字，开始续写…`);
  try{
    const txt = await continueTruncatedChapter(i, '', partial);
    const content = enforceChapterBoundary(i, String(txt||'').trim());
    if(!content) throw new Error('续写结果为空或越过本章边界后无剩余正文');
    delete state._chapterPartial[i];
    snapshotChapterVersion(i);
    state.chapters[i].content = content;
    updateFactCardFromChapter(i, content);
    if(isLong()) await commitChapterObservedState(i, content);
    invalidateChapterMemory(i);
    chState[i] = 'done';
    persist(); patchChapter(i); renderNarrativeEngineMenu();
    toast(`第 ${i+1} 章续写完成（${countWords(content).total.toLocaleString()} 字）`);
    autoUpdateSubplots(); autoUpdateTimeAnchors();
    generateRollingSummaries().catch(()=>{});
  }catch(e){
    if(!(e && e.name === 'AbortError')) toast('续写失败：' + ((e&&e.message)||'未知错误'));
    chState[i] = 'error';
    patchChapter(i); renderNarrativeEngineMenu();
  }
}

function syncGenBatchControls(){
  const mg = $('.multi-gen'); const out = $('#genCountOut'); const many = $('#btnGenMany');
  if(!mg || !out) return;
  const rem = remainingEmptyChapters();
  const done = rem <= 0;
  if(genBatchN < 1) genBatchN = 1;
  if(rem > 0 && genBatchN > rem) genBatchN = rem;
  out.textContent = String(genBatchN);
  mg.querySelectorAll('[data-gen-dec],[data-gen-inc]').forEach(b=>{ b.disabled = done; });
  if(many){ many.disabled = done; many.textContent = done ? '✅ 已全部写完' : '⚡ 批量生成多章'; }
}
function bindGenBatchControls(){
  const mg = $('.multi-gen'); if(!mg) return;
  const dec = mg.querySelector('[data-gen-dec]');
  const inc = mg.querySelector('[data-gen-inc]');
  if(dec) dec.onclick = (e)=>{ e.preventDefault(); genBatchN = Math.max(1, genBatchN - 1); syncGenBatchControls(); };
  if(inc) inc.onclick = (e)=>{ e.preventDefault(); genBatchN = Math.min(Math.max(1, remainingEmptyChapters()), genBatchN + 1); syncGenBatchControls(); };
  const many = $('#btnGenMany');
  if(many) many.onclick = (e)=>{
    e.preventDefault();
    const rem = remainingEmptyChapters();
    if(rem <= 0){ toast('已全部写完'); return; }   // 二次拦截：全写完后不可再触发
    genManyChapters(Math.min(Math.max(1, genBatchN), rem));
  };
  syncGenBatchControls();
}

function bindRangeGen(){
  const s = $('#rgStart'), e = $('#rgEnd'), btn = $('#btnRangeGen'), st = $('#rgStatus');
  if(!s || !e || !btn) return;
  const total = state.chapters.length;
  const clamp = (v, lo, hi)=> Math.max(lo, Math.min(hi, v));
  const validateWarn = ()=>{
    const sv = parseInt(s.value) || 1;
    const ev = parseInt(e.value) || 1;
    if(sv > ev){
      if(st) st.textContent = '⚠️ 起始章不能大于结束章';
      btn.disabled = true;
      return false;
    }
    if(st) st.textContent = '';
    btn.disabled = false;
    return true;
  };
  const validateClamp = ()=>{
    const sv = clamp(parseInt(s.value) || 1, 1, total);
    const ev = clamp(parseInt(e.value) || 1, 1, total);
    s.value = sv; e.value = ev;
    validateWarn();
  };
  s.oninput = validateWarn; e.oninput = validateWarn;   
  s.onblur = validateClamp; e.onblur = validateClamp;
  btn.onclick = async ()=>{
    if(!validate()) return;
    const sv = parseInt(s.value), ev = parseInt(e.value);
    const n = ev - sv + 1;
    {
      const _o = state.outline || {};
      const miss = [];
      (_o.chapters||[]).forEach((c,i)=>{ const p=(_o.chapterPlans||[])[i];
        if(!p || !String(p.beatsText||'').trim()) miss.push(i+1); });
      if(miss.length && !confirm(`第 ${miss.join('、')} 章缺节拍表，这些章将按大纲直接裸写。继续？`)) return;
    }
    btn.disabled = true; btn.textContent = '生成中…';
    try{
      await genNChapters(sv - 1, n);   // 0-based start，genNChapters 内每章 snapshotChapterVersion + 覆盖
      toast(`第 ${sv}~${ev} 章（共 ${n} 章）已生成`);
      if(st) st.textContent = `✅ 第 ${sv}~${ev} 章已生成`;
    }catch(err){
      toast(`第 ${sv}~${ev} 章生成失败：${err.message}`);
      if(st) st.textContent = `❌ 生成失败`;
    }finally{
      btn.disabled = false; btn.textContent = '⚡ 区间生成';
      autoUpdateSubplots(); autoUpdateTimeAnchors();
    }
  };
  validateClamp();
}

async function genManyChapters(count, fromStart){
  {
    const _o = state.outline || {};
    const miss = [];
    (_o.chapters||[]).forEach((c,i)=>{ const p=(_o.chapterPlans||[])[i];
      if(!p || !String(p.beatsText||'').trim()) miss.push(i+1); });
    if(miss.length && !confirm(`第 ${miss.join('、')} 章缺节拍表，这些章将按大纲直接裸写。继续？`)) return;
  }
  const btn = $('#btnGenMany'); if(btn) busy(btn,true,'逐章生成中…');
  const st = $('#chStatus'); if(st){ st.className='status'; st.textContent=''; }
  const genCtl = $('#btnGenAllChapters');
  const stopParent = (btn && btn.parentNode) || (genCtl && genCtl.parentNode);
  if(stopParent) showStopBtn(stopParent);
  const totalCh = (state.chapters||[]).length;
  let start;
  if(fromStart){ start = 0; }
  else {
    const firstEmpty = state.chapters.findIndex(c=> !(c.content && String(c.content).trim()));
    start = firstEmpty < 0 ? 0 : firstEmpty;
  }
  if(totalCh <= 0 || start >= totalCh){ if(st){st.className='status ok'; st.textContent='全部章节已生成。';} busy(btn,false); hideStopBtn(); syncGenBatchControls(); return; }
  const n = Math.max(1, Math.min(count, totalCh - start));
  state.generating = true;
  for(let k=0;k<n;k++){ chState[start+k] = 'generating'; patchChapter(start+k); }
  if(st) st.textContent = `正在生成第 ${start+1}~${start+n} 章（共 ${n} 章）…`;
  try{
    await genNChapters(start, n);
    for(let k=0;k<n;k++){ chState[start+k] = 'done'; patchChapter(start+k); }
    const rem = remainingEmptyChapters();
    if(st){ st.className='status ok'; st.textContent = isLong()
      ? (rem > 0 ? `本批共 ${n} 章已生成，全书还剩 ${rem} 章未写。` : `全部章节已写完（共 ${totalCh} 章）。`)
      : '全部章节已生成，请审阅并标记确认。'; }
    if(rem <= 0 && isLong()) toast(`已全部写完（共 ${totalCh} 章）`);
    if(isLong()){
      const targetPage = Math.floor(start / CH_PAGE_SIZE);
      if(Math.abs(chPage - targetPage) >= 1){ chPage = targetPage; renderChapters(); }
    }
  }catch(e){
    for(let k=0;k<n;k++){ if(chState[start+k] === 'generating'){ chState[start+k]='error'; } patchChapter(start+k); }
    if(st){ st.className='status err'; st.textContent = `第${start+1}~${start+n}章生成失败（${e.message}）。已停止本批，请修复后重试。`; }
    toast(`第${start+1}~${start+n}章生成失败：${e.message}`);
  }finally{
    state.generating = false; hideStopBtn();
    if(btn) busy(btn,false);
    autoUpdateSubplots();
    autoUpdateTimeAnchors();
    if(isLong()) syncGenBatchControls();
  }
}

async function genOneChapterNoUI(i){
  const user = buildChapterUser(i);
  try{
    const txt = isLong()
      ? await writeOneChapterContent(i, user)
      : unwrapAIResult(await callDeepSeek(PROMPTS.chapterSys, user, {temperature: resolveActiveSpec().chapterTemp, taskKey:'chapter'})).trim();
    state.chapters[i].content = txt;
    persist();
  }catch(e){ /* 继续后续 */ }
}

function pushAssetHist(kind, data){
  if(data == null) return;
  if(!state.hist) state.hist = { characters:[], scenes:[], cover:[], storyboard:[] };
  const arr = state.hist[kind]; if(!Array.isArray(arr)) return;
  arr.unshift({ data: JSON.parse(JSON.stringify(data)), ts: Date.now() });
  if(arr.length > 10) arr.splice(10);
}
function assetHistCount(kind){ return Array.isArray(state.hist && state.hist[kind]) ? state.hist[kind].length : 0; }
function hasAssetHist(kind){ return assetHistCount(kind) > 0; }
const ASSET_LABEL = { characters:'角色定妆', scenes:'场景提示词', cover:'封面提示词', storyboard:'分镜' };
function openAssetHistPanel(kind){
  closeAssetHistPanel();
  const hist = Array.isArray(state.hist && state.hist[kind]) ? state.hist[kind] : [];
  if(!hist.length){ toast('暂无历史版本'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const rows = hist.map((h,idx)=>{
    const d = h.data;
    let brief = '';
    if(kind==='characters') brief = (Array.isArray(d)?d.map(x=>x&&x.name).filter(Boolean).join('、'):'');
    else if(kind==='scenes') brief = (Array.isArray(d)?d.map(x=>x&&x.name).filter(Boolean).join('、'):'');
    else if(kind==='cover') brief = String(d||'').slice(0,40);
    else if(kind==='storyboard') brief = `${Array.isArray(d)?d.length:0} 镜`;
    const cnt = Array.isArray(d) ? d.length : 1;
    return `<div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0"><div class="cv-time">${fmtTs(h.ts)} · ${cnt} 条</div><div class="cv-t" style="font-size:12px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(brief||'')}</div></div>
      <div class="cv-actions" style="display:flex;gap:6px;flex-shrink:0">
        <button type="button" class="btn ghost cv-b" data-ah-prev="${idx}">预览</button>
        <button type="button" class="btn ghost cv-b" data-ah-restore="${idx}">↩ 恢复</button>
      </div>
    </div>`;
  }).join('');
  const ov = document.createElement('div'); ov.id='ahPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🕘 ${ASSET_LABEL[kind]} · 历史版本（${hist.length}/10）</b>
        <button class="gs-x" data-ah-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-row cur"><div class="cv-meta"><span class="cv-time">当前版本</span><span class="cv-wc">${kind==='cover' ? (state.coverPrompt?'有':'空') : (Array.isArray(state[kind==='characters'?'characters':(kind==='scenes'?'scenes':'storyboard')])?state[kind==='characters'?'characters':(kind==='scenes'?'scenes':'storyboard')].length:0)+' 条'}</span></div></div>
        <div class="cv-div">重生成前旧版会自动存入这里；恢复会覆盖当前内容（当前版也先存入历史）。</div>
        ${rows}
        <div class="cv-preview hidden" id="ahPreview">
          <div class="cv-prev-head"><b id="ahPrevTitle">版本预览</b><button class="gs-x" data-ah-prev-close>✕</button></div>
          <div class="cv-pre" id="ahReader"></div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-ah-close]').onclick = closeAssetHistPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeAssetHistPanel(); });
  ov.addEventListener('click', e=>{
    const p = e.target.closest('[data-ah-prev]'); if(!p) return;
    const h = hist[+p.dataset.ahPrev]; if(!h) return;
    const pr=$('#ahPreview'), rd=$('#ahReader'), pt=$('#ahPrevTitle');
    if(pr && rd){
      pt.textContent = '预览 · '+fmtTs(h.ts);
      const d = h.data;
      let txt = '';
      if(kind==='characters') txt = (d||[]).map(x=>`${x.name||''}（${x.role||''}）\n${JSON.stringify(x.profile||{},null,1)}`).join('\n\n');
      else if(kind==='scenes') txt = (d||[]).map(x=>`${x.name||''}（${x.作用||''}）\n${x.description||''}`).join('\n\n');
      else if(kind==='cover') txt = String(d||'');
      else if(kind==='storyboard') txt = (d||[]).map(x=>`镜${x.镜号||''}：${x.画面描述||''}`).join('\n');
      rd.textContent = txt.slice(0,1500) + (txt.length>1500?'\n…':''); 
      pr.classList.remove('hidden');
    }
  });
  ov.querySelector('[data-ah-prev-close]').onclick = ()=>{ const pr=$('#ahPreview'); if(pr) pr.classList.add('hidden'); };
  ov.addEventListener('click', e=>{
    const rb = e.target.closest('[data-ah-restore]'); if(!rb) return;
    const h = hist[+rb.dataset.ahRestore]; if(!h) return;
    if(!window.confirm(`恢复该版${ASSET_LABEL[kind]}将覆盖当前内容（当前版先存入历史）。确定恢复吗？`)) return;
    const curData = kind==='cover' ? (state.coverPrompt||'') : state[kind==='characters'?'characters':(kind==='scenes'?'scenes':'storyboard')];
    pushAssetHist(kind, curData);
    if(kind==='cover') state.coverPrompt = String(h.data||'');
    else state[kind==='characters'?'characters':(kind==='scenes'?'scenes':'storyboard')] = JSON.parse(JSON.stringify(h.data||[]));
    persist(); closeAssetHistPanel(); render();
    toast('已恢复历史版本');
  });
}
function closeAssetHistPanel(){ const p=$('#ahPanel'); if(p) p.remove(); }

async function genCharacters(){
  const btn = $('#btnGenChars'); busy(btn,true,'生成角色中…');
  try{
    if(state.characters && state.characters.length) pushAssetHist('characters', state.characters);
    const txt = unwrapAIResult(await callDeepSeek(PROMPTS.characterSys, '【完整故事】\n'+fullStoryText(), {temperature: resolveActiveSpec().assetsTemp, taskKey:'assets'}));
    state.raw.characters = txt;
    const j = parseJson(txt);
    state.characters = j.characters || [];
    persist(); render();
    toast('角色提示词已生成');
  }catch(e){
    const p = $('#charStatus'); if(p){ p.className='status err'; p.textContent=e.message; }
  }finally{ busy(btn,false); }
}

async function genScenes(){
  const btn = $('#btnGenScenes'); busy(btn,true,'生成场景中…');
  try{
    if(state.scenes && state.scenes.length) pushAssetHist('scenes', state.scenes);
    const txt = unwrapAIResult(await callDeepSeek(PROMPTS.sceneSys, '【完整故事】\n'+fullStoryText(), {temperature: resolveActiveSpec().assetsTemp, taskKey:'assets'}));
    state.raw.scenes = txt;
    const j = parseJson(txt);
    state.scenes = (j.scenes || []).map(s=>{
      const p = String(s.prompt||'');
      const neg = ['no people','no characters','no humans','无人'];
      if(!neg.some(k=>p.toLowerCase().includes(k))){
        s.prompt = p.replace(/\s*$/,'') + '\n（无人物纯环境：no people, no characters, no humans, empty of figures）';
      }
      return s;
    });
    persist(); render();
    toast('场景提示词已生成');
  }catch(e){
    const p = $('#sceneStatus'); if(p){ p.className='status err'; p.textContent=e.message; }
  }finally{ busy(btn,false); }
}

async function genCover(){
  const btn = $('#btnGenCover'); busy(btn,true,'生成封面提示词…');
  const st = $('#coverStatus'); if(st){ st.className='status'; st.textContent=''; }
  const o = state.outline;
  if(!o){ toast('先生成故事大纲'); busy(btn,false); return; }
  const sys = state.coverWithTitle ? PROMPTS.coverSysTitle : PROMPTS.coverSysClean;
  const user = `小说标题：${o.title}\n小说简介：${o.logline}\n章节：${(o.chapters||[]).map(c=>c.title).join(' / ')}\n\n请为这部小说设计封面图的出图提示词。\n模式：${state.coverWithTitle?'包含书名汉字作为封面主体文字':'纯画面、无任何文字、预留书名留白'}`;
  try{
    if(state.coverPrompt) pushAssetHist('cover', state.coverPrompt);
    const txt = unwrapAIResult(await callDeepSeek(sys, user, {temperature: resolveActiveSpec().assetsTemp, taskKey:'assets'}));
    state.coverPrompt = txt.trim();
    persist(); render();
    toast(state.coverWithTitle?'已生成含书名封面提示词':'已生成纯画面封面提示词');
  }catch(e){
    if(st){ st.className='status err'; st.textContent=e.message; }
    else toast('生成失败：'+e.message);
  }finally{ busy(btn,false); }
}

async function genStoryboard(){
  const btn = $('#btnGenBoard'); busy(btn,true,'生成分镜中…');
  const st = $('#boardStatus');
  try{
    const chars = state.characters.map(c=>`${c.name}(${c.role})：定妆特征-${((c.profile&&c.profile.外貌)||'')}，常服-${((c.profile&&c.profile.常服与配色)||'')}`).join('\n');
    const scenes = state.scenes.map(s=>`${s.name}：${s.description||''}`).join('\n');
    const base = `【角色定妆特征】\n${chars||'（未生成角色）'}\n\n【场景】\n${scenes||'（未生成场景）'}`;
    const shots = [];
    const concepts = [];
    const fails = [];
    for(let i=0;i<state.chapters.length;i++){
      if(st){ st.className='status'; st.textContent = `正在为第 ${i+1}/${state.chapters.length} 章生成分镜…`; }
      const ch = state.chapters[i];
      const oc = (state.outline&&state.outline.chapters&&state.outline.chapters[i])||{};
      const content = ch.content||'';
      const user = `【本章】第${i+1}章 ${ch.title||oc.title||''}\n本章正文：\n${content.slice(0,50000)}${content.length>50000?'…':''}\n\n${base}`;
      try{
        const txt = unwrapAIResult(await callDeepSeek(PROMPTS.storyboardSys, user, {temperature: resolveActiveSpec().assetsTemp, taskKey:'assets'}));
        const j = parseJson(txt);
        (j.shots||[]).forEach(s=>{
          s.章节 = i+1;
          if(s.时长==null) s.时长 = 3;
          shots.push(s);
        });
        concepts.push({视觉概念:j.视觉概念||'', 母题:j.母题||''});
      }catch(e){
        fails.push('第'+(i+1)+'章：'+e.message);
        concepts.push({视觉概念:'', 母题:''});
      }
    }
    if(!shots.length) throw new Error('分镜生成失败：' + fails.join('；'));
    if(state.storyboard && state.storyboard.length) pushAssetHist('storyboard', state.storyboard);
    state.boardConcepts = concepts;
    state.storyboard = shots;
    state.raw.storyboard = '';
    persist(); render();
    toast(fails.length ? `分镜已生成（${fails.length} 章失败）` : '分镜已生成（按章节分组）');
  }catch(e){
    const p = $('#boardStatus'); if(p){ p.className='status err'; p.textContent=e.message; }
  }finally{
    busy(btn,false);
    if(st){ st.className='status'; st.textContent=''; }
  }
}

let histOpenId = null;   // 当前展开详情的历史项目 id（折叠态，互不影响）
function fmtHistTime(ts){
  if(!ts) return '';
  const d = new Date(ts), now = new Date();
  const pad = n => String(n).padStart(2,'0');
  if(d.toDateString() === now.toDateString()) return `今天 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function histProgress(p){
  if(p.chapters && p.chapters.length){
    const done = p.chapters.filter(c=> c.confirmed).length;
    return `${done}/${p.chapters.length} 章`;
  }
  if(p.outline && p.outline.chapters && p.outline.chapters.length) return `大纲 ${p.outline.chapters.length} 章`;
  if(p.characters && p.characters.length) return `${p.characters.length} 角色`;
  if(p.scenes && p.scenes.length) return `${p.scenes.length} 场景`;
  if(p.storyboard && p.storyboard.length) return `${p.storyboard.length} 镜`;
  if(p.idea) return '草稿';
  return `第 ${p.step||1} 步`;
}
function renderHistList(){
  const list = $('#histList'); if(!list) return;
  const items = [...lib.items].sort((a,b)=> (b.updatedAt||0) - (a.updatedAt||0));
  list.innerHTML = items.map(p=>{
    const isCur = p.id === lib.curId;
    const open = histOpenId === p.id;
    const preview = histItemPreview(p);
    return `<div class="hist-item ${isCur?'active':''} ${open?'open':''}" data-hist="${p.id}">
      <div class="hist-head" data-hist-toggle="${p.id}">
        <span class="hist-fold" data-hist-fold="${p.id}">${open?'▾':'▸'}</span>
        <button class="hist-main" data-switch="${p.id}">
          <span class="hist-title">${isCur?'<em class="hist-cur">当前</em>':''}${esc(p.title||'未命名作品')}</span>
          ${p.logline?`<span class="hist-desc">${esc(p.logline)}</span>`:''}
          <span class="hist-meta">${histProgress(p)} · ${fmtHistTime(p.updatedAt)}</span>
        </button>
        <button class="hist-del" data-fypexp="${p.id}" title="导出 .fyp 项目">📤</button>
        <button class="hist-del" data-del="${p.id}" title="删除作品">🗑</button>
      </div>
      <div class="hist-body">${preview}</div>
    </div>`;
  }).join('') || `<div class="hist-empty">还没有作品，点击「＋ 新建小说」开始。</div>`;
  $$('#histList [data-switch]').forEach(b=> b.onclick = ()=> switchProject(b.dataset.switch));
  $$('#histList [data-del]').forEach(b=> b.onclick = (e)=>{ e.stopPropagation(); deleteProject(b.dataset.del); });
  $$('#histList [data-fypexp]').forEach(b=> b.onclick = (e)=>{ e.stopPropagation(); exportProjectFile(b.dataset.fypexp); });
  $$('#histList .hist-head').forEach(h=> h.onclick = (e)=>{
    if(e.target.closest('[data-switch]')) return;   // 点标题=切换项目，不折叠
    if(e.target.closest('[data-del]')) return;
    if(e.target.closest('[data-fypexp]')) return;   // .fyp 导出按钮不触发折叠
    const id = h.dataset.histToggle;
    histOpenId = (histOpenId===id) ? null : id;
    renderHistList();                               // 重新渲染以切折叠态
  });
}
function histItemPreview(p){
  const chapters = (p.chapters||[]).filter(c=> c && c.content && String(c.content).trim());
  const parts = [];
  if(chapters.length){
    parts.push(`<b>正文已生成 ${chapters.length} 章：</b>`);
    const rows = chapters.slice(0, 8).map((c,i)=>`<div class="hist-p-row">第${i+1}章 · ${esc(cleanChapterTitle(c.title)||'')}</div>`).join('');
    parts.push(rows);
    if(chapters.length>8) parts.push(`<div class="muted">… 其余 ${chapters.length-8} 章</div>`);
  }
  const outline = p.outline && p.outline.chapters;
  if(outline && outline.length){
    parts.push(`<b>大纲（${outline.length} 章）：</b>`);
    parts.push(`<div class="hist-p-row muted">${esc(outline.map(c=>c.title).slice(0,6).join(' / '))}${outline.length>6?' …':''}</div>`);
  }
  if(p.characters && p.characters.length){
    parts.push(`<div class="hist-p-row muted">角色：${esc(p.characters.map(c=>c.name).slice(0,6).join('、'))}</div>`);
  }
  if(p.scenes && p.scenes.length){
    parts.push(`<div class="hist-p-row muted">场景：${esc(p.scenes.map(s=>s.name).slice(0,6).join('、'))}</div>`);
  }
  if(!parts.length) parts.push('<div class="muted">（暂无内容，仅记录了构想与进度）</div>');
  return parts.join('');
}
function openHistPanel(){ renderHistList(); $('#histPanel').classList.remove('hidden'); }
function closeHistPanel(){ $('#histPanel').classList.add('hidden'); }
function switchProject(id){
  if(id === lib.curId){ closeHistPanel(); return; }
  persist(); // 先保存当前项目
  lib.curId = id;
  const cur = lib.items.find(i=> i.id === id);
  applyProject(cur || {}); // 内容缺失 → 空白，id 仍保持有效
  saveLib(); // 提交 curId 切换
  closeHistPanel();
  render();
  window.scrollTo(0,0);
  toast(`已切换到「${cur ? (cur.title||'未命名作品') : '空白项目'}」`);
}
function newProject(mode){
  if(lib.items.length >= MAX_PROJECTS){
    const oldest = [...lib.items].sort((a,b)=> (a.updatedAt||0) - (b.updatedAt||0))[0];
    if(oldest && !confirm(`历史已达 ${MAX_PROJECTS} 个上限，是否删除最旧的「${oldest.title||'未命名作品'}」以新建？`)){
      return false;
    }
    if(oldest) lib.items = lib.items.filter(i=> i.id !== oldest.id);
  }
  clearState();
  if(mode) state.mode = mode; // 'longnovel' 经典长篇小说
  const snap = projectSnapshot();
  const newId = makeId();
  lib.items.unshift({ ...snap, id: newId, updatedAt: Date.now() });
  lib.curId = newId;
  saveLib();
  closeHistPanel();
  render();
  window.scrollTo(0,0);
  toast(mode==='longnovel' ? '已新建经典长篇小说' : '已新建空白小说');
  return true;
}
function newLongProject(){
  return newProject('longnovel');
}
function deleteProject(id){
  const it = lib.items.find(i=> i.id === id);
  if(!it) return;
  if(!confirm(`确定删除「${it.title||'未命名作品'}」？此操作不可恢复。`)) return;
  const wasCur = id === lib.curId;
  lib.items = lib.items.filter(i=> i.id !== id);
  if(wasCur){
    if(lib.items.length){
      const next = [...lib.items].sort((a,b)=> (b.updatedAt||0) - (a.updatedAt||0))[0];
      lib.curId = next.id;
      applyProject(next);
      toast('已删除，已切换到最近作品');
    }else{
      clearState();
      lib.curId = null;
      toast('已删除全部作品');
    }
    closeHistPanel(); render(); window.scrollTo(0,0);
  }
  saveLib();
  renderHistList();
}
function rebindHistPanel(){
  const btn = $('#btnHist');
  if(btn) btn.onclick = (e)=>{
    e.stopPropagation();
    const p = $('#histPanel');
    if(p.classList.contains('hidden')) openHistPanel(); else closeHistPanel();
  };
  const nb = $('#btnNewProject');
  if(nb) nb.onclick = (e)=>{ e.stopPropagation(); newProject(); };
  const nlo = $('#histNewLong');
  if(nlo) nlo.onclick = (e)=>{ e.stopPropagation(); newLongProject(); };
  const imp = $('#btnImportFyp');
  if(imp) imp.onclick = (e)=>{ e.stopPropagation(); const fi = $('#fypImportInput'); if(fi) fi.click(); };
  const fi = $('#fypImportInput');
  if(fi) fi.onchange = (e)=>{ const f = e.target.files && e.target.files[0]; if(f) importProjectFile(f); e.target.value = ''; };
}

function buildFyp(project){
  return {
    format: 'fyp-project',
    version: 1,
    kind: 'complete',
    exportedAt: new Date().toISOString(),
    app: 'storyfactory',
    appVersion: APP_VERSION,   // 导出时的应用版本号，供对方工具识别本项目由哪一版生成
    book: project   // 完整项目快照（与 lib.items[i] 同结构）
  };
}
function parseFyp(text){
  const obj = JSON.parse(text);
  if(!obj || typeof obj !== 'object') throw new Error('文件不是合法 JSON');
  if(obj.format !== 'fyp-project') throw new Error('不是 .fyp 项目文件（format 字段不匹配）');
  if(!obj.book || typeof obj.book !== 'object') throw new Error('.fyp 缺少 book 字段');
  return obj.book;
}
function exportProjectFile(id){
  const p = lib.items.find(i=> i.id === id);
  if(!p){ toast('未找到该作品'); return; }
  const fyp = buildFyp(p);
  const title = String(p.title || 'story').replace(/[\\/:*?"<>|\r\n]+/g, '_').slice(0, 40);
  const blob = new Blob([JSON.stringify(fyp, null, 2)], { type:'application/octet-stream' });
  downloadBlob(`${title}.fyp`, blob);
  toast('已导出 .fyp 项目文件');
}
function importProjectFile(file){
  if(!file) return;
  const big = file.size > 5 * 1024 * 1024;
  toast(big ? '文件较大，解析中…' : '正在导入项目…');
  const r = new FileReader();
  r.onload = function(){
    try{
      const book = parseFyp(String(r.result));
      const newId = makeId();
      const item = Object.assign({}, book, { id: newId, updatedAt: Date.now() });
      if(!item.title) item.title = (item.outline && item.outline.title) || '导入的作品';
      lib.items.unshift(item);
      if(lib.items.length > MAX_PROJECTS){
        const others = lib.items.filter(i=> i.id !== lib.curId && i.id !== newId);
        others.sort((a,b)=> (a.updatedAt||0) - (b.updatedAt||0));
        const victim = others[0];
        if(victim){ lib.items = lib.items.filter(i=> i.id !== victim.id); }
      }
      lib.curId = newId;
      applyProject(item);
      saveLib(); // 经 IDB 落盘（fire-and-forget）
      closeHistPanel();
      render();
      window.scrollTo(0,0);
      toast(`已导入「${item.title}」并打开`);
    }catch(err){
      toast('导入失败：' + (err && err.message ? err.message : '文件格式错误'));
    }
  };
  r.onerror = function(){ toast('读取文件失败'); };
  r.readAsText(file);
}

function wsColorToolbarHtml(){
  const undoN = wsUndoLog().length, rmB = wsRemovedBuiltin().length;
  return `<div class="ws-cs-toolbar">
    <button type="button" class="cs-tool" data-cs-undo ${undoN?'':'disabled'} title="撤销上一步删除">↩ 撤销</button>
    <button type="button" class="cs-tool" data-cs-restore ${rmB?'':'disabled'} title="仅恢复项目自带的 11 套内置配色（不影响你自建的配色）">↺ 恢复全部</button>
    <span class="ws-cs-spacer"></span>
    <button type="button" class="cs-tool cs-tool-new" data-cs-new title="新建一套配色">＋ 新建配色</button>
  </div>`;
}
function wsColorGridHtml(){
  const cur = wsColorSchemeId();
  const customIds = wsCustomColors().map(s=>s.id);
  return wsColorSchemesList().map(s=>{
    const isCustom = customIds.includes(s.id);
    return `<div class="ws-cs-item${cur===s.id?' active':''}" data-cs="${s.id}" title="点击应用「${esc(s.name)}」">
      <div class="ws-cs-top">
        <span class="ws-cs-name">${esc(s.name)}${isCustom?'<i class="ws-cs-tag">我的</i>':''}</span>
        ${s.id==='none'?'':`<button type="button" class="ws-cs-del" data-cs-del="${s.id}" title="删除此配色">✕</button>`}
      </div>
      <div class="ws-cs-bars">
        ${(s.c&&s.c.length)? s.c.map(c=>`<i style="background:${c}"></i>`).join('') : `<i class="ws-cs-none">无</i>`}
      </div>
    </div>`;
  }).join('');
}
function wsColorNewFormHtml(){
  return `<div id="wsCsForm" class="ws-cs-form hidden">
    <div class="ws-cs-form-row"><label>名称</label><input id="csName" class="cs-inp" type="text" maxlength="12" placeholder="例如：晚霞粉蓝"></div>
    <div class="ws-cs-form-row"><label>章节 · 风格色</label><input id="csC0" class="cs-color" type="color" value="#3fc6a0"></div>
    <div class="ws-cs-form-ops">
      <button type="button" class="btn" data-cs-cancel>取消</button>
      <button type="button" class="btn primary" data-cs-confirm>确认新建</button>
    </div>
  </div>`;
}
function renderWsColorPanel(){
  const box = $('#wsColorBody'); if(!box) return;
  box.innerHTML = wsColorToolbarHtml() + `<div class="ws-cs-grid">${wsColorGridHtml()}</div>` + wsColorNewFormHtml();
}
function openWsColorPanel(){ const p=$('#wsColorPanel'); if(!p) return; renderWsColorPanel(); p.classList.remove('hidden'); }
function closeWsColorPanel(){ const p=$('#wsColorPanel'); if(p) p.classList.add('hidden'); }
function wsColorRepaint(){ rebuildCustomColorCss(); renderWsColorPanel(); render(); }
function wsColorSelect(id){
  const c=getCfg(); c.styleCustom = c.styleCustom||{};
  c.styleCustom.colorScheme = id; saveCfg(c);
  wsColorRepaint(); toast('已切换写作风格配色：'+wsSchemeName(id));
}
function wsColorDelete(id){
  if(id==='none') return;
  const c=getCfg(); const cs=wsColorCfgOf(c);
  const active=(c.styleCustom||{}).colorScheme;
  const bi=WS_COLOR_SCHEMES.find(x=>x.id===id);
  if(bi){
    if(cs.removedBuiltin.includes(id)) return;
    cs.removedBuiltin.push(id); cs.undo.push({type:'builtin',id:id});
  } else {
    const s=cs.custom.find(x=>x.id===id); if(!s) return;
    cs.custom=cs.custom.filter(x=>x.id!==id);
    cs.removedCustom=cs.removedCustom.concat([s]); cs.undo.push({type:'custom',id:id});
  }
  if(active===id) c.styleCustom.colorScheme='none';
  saveCfg(c); wsColorRepaint();
  toast('已删除配色：'+wsSchemeName(id)+(active===id?'（当前配色已回退默认）':''));
}
function wsColorUndo(){
  const c=getCfg(); const cs=wsColorCfgOf(c); const last=cs.undo.pop(); if(!last) return;
  let label=last.id;
  if(last.type==='builtin'){ cs.removedBuiltin=cs.removedBuiltin.filter(x=>x!==last.id); }
  else { const s=cs.removedCustom.find(x=>x.id===last.id); if(s){ cs.custom=cs.custom.concat([s]); cs.removedCustom=cs.removedCustom.filter(x=>x.id!==last.id); label=s.name; } }
  saveCfg(c); wsColorRepaint(); toast('已撤销删除：'+label);
}
function wsColorRestoreAll(){
  const c=getCfg(); const cs=wsColorCfgOf(c);
  cs.removedBuiltin=[];
  cs.undo = cs.undo.filter(u=>u.type!=='builtin');   // 内置已全部恢复，仅清除其对应的撤销记录；保留自建配色的删除与撤销记录
  saveCfg(c); wsColorRepaint(); toast('已恢复全部内置配色（自建配色不受影响）');
}
function wsColorCreate(){
  const name=((($('#csName')||{}).value)||'').trim();
  const c0=(($('#csC0')||{}).value)||'#3fc6a0';
  if(!name){ toast('请先填写配色名称'); return; }
  const c=getCfg(); const cs=wsColorCfgOf(c);
  cs.custom=cs.custom.concat([{id:'cu_'+(Date.now()), name:name, c:[c0]}]);
  saveCfg(c); rebuildCustomColorCss();
  const f=$('#wsCsForm'); if(f) f.classList.add('hidden');
  wsColorRepaint(); toast('已新建配色：'+name);
}
function rebindWsColorPanel(){
  const btn = $('#btnWsColor');
  if(btn) btn.onclick = (e)=>{ e.stopPropagation(); const p=$('#wsColorPanel'); if(p.classList.contains('hidden')) openWsColorPanel(); else closeWsColorPanel(); };
  const body = $('#wsColorBody');
  if(body) body.onclick = (e)=>{
    const del = e.target.closest('[data-cs-del]'); if(del){ e.stopPropagation(); wsColorDelete(del.dataset.csDel); return; }
    const item = e.target.closest('.ws-cs-item[data-cs]'); if(item){ e.stopPropagation(); if(!item.classList.contains('active')) wsColorSelect(item.dataset.cs); return; }
    if(e.target.closest('[data-cs-new]')){ e.stopPropagation(); const f=$('#wsCsForm'); if(f) f.classList.toggle('hidden'); return; }
    if(e.target.closest('[data-cs-undo]')){ e.stopPropagation(); wsColorUndo(); return; }
    if(e.target.closest('[data-cs-restore]')){ e.stopPropagation(); wsColorRestoreAll(); return; }
    if(e.target.closest('[data-cs-confirm]')){ e.stopPropagation(); wsColorCreate(); return; }
    if(e.target.closest('[data-cs-cancel]')){ e.stopPropagation(); const f=$('#wsCsForm'); if(f) f.classList.add('hidden'); return; }
  };
  rebuildCustomColorCss();   // 刷新后自定义配色仍能正确上色
}
function openThemePanel(){
  const p = $('#themePanel'); if(!p) return;
  const cur = (document.documentElement.getAttribute('data-theme')) || 'dark';
  $$('.theme-btns .theme').forEach(b=> b.classList.toggle('active', b.dataset.theme===cur));
  p.classList.remove('hidden');
}
function closeThemePanel(){ const p=$('#themePanel'); if(p) p.classList.add('hidden'); }

function openNarrativeEngine(){
  const p = $('#narrativeEnginePanel'); if(!p) return;
  renderNarrativeEngineMenu();
  p.classList.remove('hidden');
}
function closeNarrativeEngine(){ const p=$('#narrativeEnginePanel'); if(p) p.classList.add('hidden'); }

function openNeModal(title, bodyHtml, actionsHtml){
  const m=$('#neModal'); if(!m) return;
  $('#neModalTitle').textContent = title || '叙事引擎';
  $('#neModalBody').innerHTML = bodyHtml || '';
  const acts=$('#neModalActions');
  if(actionsHtml){ acts.innerHTML = actionsHtml; acts.classList.remove('hidden'); }
  else { acts.innerHTML=''; acts.classList.add('hidden'); }
  m.classList.remove('hidden');
}
function closeNeModal(){ const m=$('#neModal'); if(m) m.classList.add('hidden'); }

function renderNarrativeEngineMenu(){
  const box=$('#nePanelBody'); if(!box) return;
  const partialN = Object.keys(state._chapterPartial||{}).length;
  box.innerHTML = `
    <div class="ne-menu-hint">AI 叙事中间件总入口，点击打开对应面板</div>
    <button class="ne-menu-item" data-ne-panel="resume"><span class="ne-ico">▶️</span><span class="ne-lbl">流式续写状态</span>${partialN?`<span class="ne-badge">${partialN}</span>`:''}</button>
    <button class="ne-menu-item" data-ne-panel="facts"><span class="ne-ico">📎</span><span class="ne-lbl">事实与一致性看板</span></button>
    <button class="ne-menu-item" data-ne-panel="resumesum"><span class="ne-ico">📜</span><span class="ne-lbl">滚动摘要</span></button>
    <button class="ne-menu-item" data-ne-panel="check"><span class="ne-ico">🩺</span><span class="ne-lbl">一致性自检</span></button>
    <button class="ne-menu-item" data-ne-panel="iron"><span class="ne-ico">📌</span><span class="ne-lbl">叙事铁律（写作总纲）</span>${state._narrIron!==false?'<span class="ne-badge ok">ON</span>':'<span class="ne-badge">OFF</span>'}</button>
    <button class="ne-menu-item" data-ne-panel="banlist"><span class="ne-ico">🚫</span><span class="ne-lbl">禁则清单</span>${stateBanEnabled()?'<span class="ne-badge ok">ON</span>':'<span class="ne-badge">OFF</span>'}</button>
    <!-- v238/反馈①：消息看板入口移入「叙事」面板菜单（第 9 项），带历史消息条数角标；顶栏不加按钮 -->
    <button class="ne-menu-item" data-ne-panel="toastboard"><span class="ne-ico">📋</span><span class="ne-lbl">消息看板</span>${(()=>{const n=toastLogGet().length; return n?`<span class="ne-badge info">${n}</span>`:'';})()}</button>
  `;
}

function rebindNarrativeEngine(){
  const btn=$('#btnNarrativeEngine');
  if(btn) btn.onclick = (e)=>{ e.stopPropagation(); const p=$('#narrativeEnginePanel'); if(p && p.classList.contains('hidden')) openNarrativeEngine(); else closeNarrativeEngine(); };
  const p=$('#narrativeEnginePanel');
  if(p) p.onclick = (e)=>{
    const item=e.target.closest('[data-ne-panel]'); if(!item) return;
    const panel=item.dataset.nePanel;
    if(panel==='resume') renderResumePanel();
    else if(panel==='iron') renderIronPanel();
    else if(panel==='banlist') renderBanListPanel();
    else if(panel==='facts') openFactCardModal();
    else if(panel==='resumesum') openRollingSummaryModal();
    else if(panel==='check') openConsistencyCheck();
    else if(panel==='toastboard') openToastBoard();
    closeNarrativeEngine();
  };
  const m=$('#neModal');
  if(m) m.onclick = (e)=>{
    if(e.target.closest('[data-ne-close]')){ closeNeModal(); return; }
    const resume=e.target.closest('[data-ne-resume]'); if(resume){ const i=+resume.dataset.neResume; closeNeModal(); continueAndFinalizeChapter(i, '从中断处继续'); return; }
    const discard=e.target.closest('[data-ne-discard]'); if(discard){ const i=+discard.dataset.neDiscard; delete state._chapterPartial[i]; toast('已丢弃第 '+(i+1)+' 章缓存'); renderResumePanel(); renderNarrativeEngineMenu(); return; }
    if(handleBanListAction(e)) return;
  };
  document.addEventListener('click', (e)=>{
    const p=$('#narrativeEnginePanel');
    if(p && !p.classList.contains('hidden') && !p.contains(e.target) && !e.target.closest('#btnNarrativeEngine')) closeNarrativeEngine();
  });
}

function renderResumePanel(){
  const partials = state._chapterPartial || {};
  const keys = Object.keys(partials).filter(k=> String(partials[k]||'').trim().length>=50);
  if(!keys.length){ openNeModal('流式续写状态', '<div class="empty">暂无中断缓存，所有章节均未处于生成中或中断状态。</div>'); return; }
  const rows = keys.map(k=>{
    const i=+k; const c=state.chapters[i]; const w=countWords(partials[k]||'').total;
    return `<div class="card"><div class="kv"><span class="k">第 ${i+1} 章</span><span class="v">${esc(c && c.title ? c.title : '未命名')}</span></div><div class="kv"><span class="k">已缓存</span><span class="v">${w.toLocaleString()} 字</span></div><div class="btn-row"><button class="btn primary" data-ne-resume="${i}">从中断处继续</button><button class="btn ghost" data-ne-discard="${i}">丢弃缓存</button></div></div>`;
  }).join('');
  openNeModal('流式续写状态', `<div class="ne-body">${rows}<p class="hint">「从中断处继续」会把已缓存文本作为锚点，让 AI 无缝续写，避免从零重跑。</p></div>`);
}


function handleBanListAction(e){
  const m=$('#neModal'); if(!m || m.style.display==='none' && m.classList&&m.classList.contains('hidden')) return false;
  if(!m.contains(e.target)) return false;
  const en=e.target.closest('[data-bl-enabled]'); if(en){ /* 保存时统一读回，此处仅占位避免误关面板 */ return false; }
  const add=e.target.closest('[data-bl-rule-add]'); if(add){
    const b=banListRaw();
    const cur=normalizeBanList(b)||{enabled:true,chars:[],names:[],phrases:[],rules:[],scopeAi:[]};
    cur.rules.push({ text:'', ai:['chapter'] });
    state.banList=cur; renderBanListPanel(); return true;
  }
  const del=e.target.closest('[data-bl-rule-del]'); if(del){
    const i=+del.dataset.blRuleDel; const cur=normalizeBanList(state.banList)||{enabled:true,chars:[],names:[],phrases:[],rules:[],scopeAi:[]};
    (cur.rules||[]).splice(i,1); state.banList=cur; renderBanListPanel(); return true;
  }
  const save=e.target.closest('[data-bl-save]'); if(save){
    const cur=normalizeBanList(state.banList)||{enabled:true,chars:[],names:[],phrases:[],rules:[],scopeAi:BANLIST_DEFAULT.scopeAi.slice()};
    const gv=el=>m.querySelector(el); const val=el=>{const x=gv(el); return x?x.value.trim():'';};
    cur.enabled = !!(m.querySelector('[data-bl-enabled]')&&m.querySelector('[data-bl-enabled]').checked);
    cur.chars = val('[data-bl-chars]').split(/[,，]/).map(s=>s.trim()).filter(Boolean);
    cur.names = val('[data-bl-names]').split(/[,，\n]/).map(s=>s.trim()).filter(Boolean);
    cur.phrases = val('[data-bl-phrases]').split(/[,，]/).map(s=>s.trim()).filter(Boolean);
    m.querySelectorAll('[data-bl-rule-text]').forEach(t=>{ const i=+t.dataset.blRuleText; const aiSel=m.querySelector('[data-bl-rule-ai="'+i+'"]'); const ai=aiSel?aiSel.value.split(',') : []; if(cur.rules[i]){ cur.rules[i].text=t.value.trim(); cur.rules[i].ai=ai; } });
    cur.rules=cur.rules.filter(r=>r&&r.text);
    const scope=[];
    if(m.querySelector('[data-bl-scope="chapter"]')&&m.querySelector('[data-bl-scope="chapter"]').checked) scope.push('chapter');
    if(m.querySelector('[data-bl-scope="planner"]')&&m.querySelector('[data-bl-scope="planner"]').checked) scope.push('planner');
    if(m.querySelector('[data-bl-scope="outline"]')&&m.querySelector('[data-bl-scope="outline"]').checked) scope.push('outline');
    if(m.querySelector('[data-bl-scope="title"]')&&m.querySelector('[data-bl-scope="title"]').checked) scope.push('title');
    cur.scopeAi = scope.length?scope:BANLIST_DEFAULT.scopeAi.slice();
    state.banList=cur; persist(); renderNarrativeEngineMenu();
    toast('禁则清单已保存'); return true;
  }
  const reset=e.target.closest('[data-bl-reset]'); if(reset){
    state.banList=null; persist(); renderNarrativeEngineMenu();
    toast('已恢复默认禁则清单'); return true;
  }
  return false;
}
function renderIronPanel(){
  const ironOn = state._narrIron !== false;
  const langOn = state.langLayer !== false;
  const html = `
    <div class="ne-body ne-bl-body">
      <div class="ne-bl-enable">
        <label class="mini-check"><input type="checkbox" data-narr-iron2 ${ironOn?'checked':''}> <b>叙事铁律总开关（默认开，仅长篇生效）</b></label>
        <div class="bl-note muted">统一注入三大写作要求：硬约束（禁止/必须）为铁律不可逾越，软约束尽力而为、随题材微调。</div>
      </div>
      <div class="ne-bl-enable" style="margin-top:8px">
        <label class="mini-check"><input type="checkbox" data-lang-layer2 ${langOn?'checked':''}> <b>语言分层自动调节（默认开，仅长篇生效，不注入规划师）</b></label>
        <div class="bl-note muted">书面语造氛围、口语推剧情；随题材自动定语言底色。属叙事纪律（非文风词条）：不随写作风格预设迁移，仅作用于章节正文。</div>
      </div>
      <div style="margin-top:12px">
        <div style="font-weight:700;margin-bottom:4px">硬约束（铁律）</div>
        <div style="white-space:pre-wrap;font-size:12px;line-height:1.7;color:#333">${esc(NARRATIVE_IRON_HARD)}</div>
        <div style="font-weight:700;margin:10px 0 4px">软约束（引导）</div>
        <div style="white-space:pre-wrap;font-size:12px;line-height:1.7;color:#333">${esc(NARRATIVE_IRON_SOFT)}</div>
      </div>
    </div>`;
  openNeModal('叙事铁律 · 写作总纲', html, '<button class="btn ghost" data-ne-close>关闭</button>');
  const it=$('[data-narr-iron2]'); if(it) it.onchange = ()=>{ state._narrIron=it.checked; persist(); renderIronPanel(); };
  const lt=$('[data-lang-layer2]'); if(lt) lt.onchange = ()=>{ state.langLayer=lt.checked; persist(); renderIronPanel(); };
}

function renderBanListPanel(){
  const b = banListRaw();
  const enabled = stateBanEnabled();
  const chars = banListChars().map(esc).join(', ');
  const names = banListNames().map(esc).join(', ');
  const bRaw = banListRaw();
  const phrases = (Array.isArray(bRaw.phrases)?bRaw.phrases:[]).map(esc).join(', ');
  const rules = (Array.isArray(bRaw.rules)?bRaw.rules:[]).map((r,i)=>`
    <div class="ne-bl-rule">
      <label>生效 AI：<select data-bl-rule-ai="${i}">
        ${['chapter', 'dictmaster', 'dictEnrich', 'principal'].map(r2=>`<option value="${r2}" ${(Array.isArray(r.ai)&&r.ai.indexOf(r2)>=0)?'selected':''}>${r2==='chapter'?'正文':r2==='planner'?'规划师':r2==='outline'?'大纲':'标题'}</option>`).join('')}
      </select></label>
      <textarea data-bl-rule-text="${i}" rows="2">${esc(r.text||'')}</textarea>
      <button class="btn small ghost" data-bl-rule-del="${i}">删除</button>
    </div>`).join('');
  const aiScope = banListAiScopeLabels();
  const html = `
    <div class="ne-body ne-bl-body">
      <div class="ne-bl-enable">
        <label class="mini-check"><input type="checkbox" data-bl-enabled ${enabled?'checked':''}> <b>总开关：启用「禁则清单」作为全书长期约束</b></label>
      </div>
      <div class="bl-note muted">禁用字/禁用姓名属于全书命名红线：凡会创造或使用名字的 AI 阶段自动执行；附加规则可按阶段指定。清单不得超越输出格式红线与既有事实一致性红线。</div>
      <label class="kv"><span class="k">禁用字</span>
        <input data-bl-chars value="${chars}" placeholder="逗号分隔，如：晚,砚,秋,檐"/>
      </label>
      <label class="kv"><span class="k">禁用姓名</span>
        <textarea data-bl-names rows="3">${names}</textarea>
      </label>
      <label class="kv"><span class="k">禁用短语/模板词（仅正文）</span>
        <input data-bl-phrases value="${phrases}" placeholder="逗号分隔，如：倏然,眸光"/>
      </label>
      <div class="ne-bl-rules-head">附加规则 <button class="btn small" data-bl-rule-add>＋ 新增规则</button></div>
      ${rules || '<div class="muted">暂无附加规则。</div>'}
      <div class="ne-bl-scope-head"><b>附加规则生效范围（按 AI）</b></div>
      <div class="ne-bl-scope">
        <label class="mini-check"><input type="checkbox" data-bl-scope="chapter" ${aiScope.chapter?'checked':''}> 正文</label>
        <label class="mini-check"><input type="checkbox" data-bl-scope="dictmaster" ${aiScope.dictmaster ? 'checked' : ''}> 词典达人</label>
        <label class="mini-check"><input type="checkbox" data-bl-scope="dictEnrich" ${aiScope.dictEnrich ? 'checked' : ''}> 词典充实</label>
        <label class="mini-check"><input type="checkbox" data-bl-scope="principal" ${aiScope.principal ? 'checked' : ''}> 校长</label>
      </div>
      <div class="btn-row">
        <button class="btn primary" data-bl-save>保存</button>
        <button class="btn ghost" data-bl-reset>恢复默认</button>
      </div>
    </div>`;
  openNeModal('禁则清单', html);
}
function banListAiScopeLabels(){
  const b=banListRaw(); const sc=Array.isArray(b.scopeAi)?b.scopeAi:(BANLIST_DEFAULT.scopeAi||[]);
  return { chapter: sc.indexOf('chapter')>=0, dictmaster: sc.indexOf('dictmaster') >= 0,
    dictEnrich: sc.indexOf('dictEnrich') >= 0,
    principal: sc.indexOf('principal') >= 0 };
}

function renderTitleCandidates(candidates, onSelect){
  if(!Array.isArray(candidates) || candidates.length<2){ onSelect && onSelect(0); return; }
  const cards=candidates.map((cand,i)=>`
    <div class="ne-candidate">
      <div class="ne-cand-head">方案 ${String.fromCharCode(65+i)}</div>
      <div class="ne-cand-meta">数量契约：${cand.valid?'✓':'✗'} · 相邻重名：${(cand.dupRate||0).toFixed(2)} · 专名命中：${(cand.glossRate||0).toFixed(2)}</div>
      <div class="ne-cand-list">${esc((cand.titles||[]).join('\n'))}</div>
      <div class="ne-cand-actions"><button class="btn primary" data-ne-title-select="${i}">应用方案 ${String.fromCharCode(65+i)}</button></div>
    </div>
  `).join('');
  openNeModal('标题候选方案', `<div class="ne-candidates">${cards}</div><p class="hint">选择一套方案后，章节标题将立即更新。</p>`);
  setTimeout(()=>{
    const m=$('#neModal');
    m.querySelectorAll('[data-ne-title-select]').forEach(b=>{
      b.onclick=()=>{ closeNeModal(); onSelect && onSelect(+b.dataset.neTitleSelect); };
    });
  },0);
}

let editCfg = null;        // 弹窗编辑中的工作副本（打开时从 getCfg 深拷贝）
let selGroupId = null;     // 当前「组详情」区选中的组

function openSettings(){
  editCfg = JSON.parse(JSON.stringify(getCfg()));
  selGroupId = editCfg.active ? editCfg.active.groupId : (editCfg.groups[0] && editCfg.groups[0].id);
  $('#settingsModal').classList.remove('hidden');
  echoTemps();
  const st = $('#cfgStatus'); if(st){ st.className='status'; st.textContent=''; }
  renderGroupsList(); renderGroupDetail(); renderActiveSelects(); updateCfgBadge();
}
function closeSettings(){ $('#settingsModal').classList.add('hidden'); }

function echoTemps(){
  const c = editCfg || getCfg();
  $('#cfgTemp').value = (c.temperature==null ? '' : c.temperature);
}

function saveTemps(){
  const rd = (id, def)=>{ const v=parseFloat($(id) && $(id).value); return isNaN(v)?def:v; };
  editCfg.temperature = rd('#cfgTemp', 0.7);
  const live = getCfg();
  const TM_FIELDS = ['ideaTemp','principalTemp','teacherTemp','dictmasterTemp','dictEnrichTemp','assetsTemp','titleTemp','chapterTemp','qcTemp','stripTemp','subplotTemp','rollingTemp','contentAdviseTemp','aiRecipeTemp'];
  TM_FIELDS.forEach(f=>{ if(live && typeof live[f]==='number') editCfg[f]=live[f]; });
}

function _curSpec(){
  const cfg = (editCfg && editCfg.groups) ? editCfg : getCfg();
  const act = cfg.active || {};
  const g = cfg.groups.find(x=>x.id===act.groupId) || cfg.groups[0];
  const m = g && (g.models.find(x=>x.name===act.model) || g.models[0]);
  const k = g && (g.keys.find(x=>x.id===act.keyId) || g.keys[0]);
  return { group: g?g.label:'', key: k?k.label:'', model: m?m.name:'', flash: !!(m && m.kind==='flash') };
}
function shortModel(name){
  if(!name) return '';
  if(name.indexOf('deepseek-v4-')===0) return name.replace('deepseek-v4-','');
  const parts=name.split('-');
  return parts.length>1 ? parts.slice(-1)[0] : name;
}
function updateCfgBadge(){
  const b=$('#cfgBadge'); if(!b) return;
  const s=_curSpec();
  b.textContent = (s.group?'':'AI') + s.group + ' · ' + (shortModel(s.model)||'未选') + (s.flash?' ⚡':'');
  if(b.title != null) b.title='当前模型：'+s.group+' · '+s.key+' · '+s.model+'（点击切换）';
  updateTmBadge();
}

const TM_GROUPS = [
  { title:'🧠 前置 · 构想（项目起点）', keys:[
    ['idea','故事构想 / 优化构想','生成与优化故事点子、多方向方案比选']
  ]},
  { title:'🏛️ 学校统筹与设定架构（核心大脑，建议主力模型）', keys:[
    ['principal','👑 校长总控','长篇小说治学总舵手：统领全量材料，产出全校守则、组级框架与章节标题'],
    ['teacher','🎓 老师备课','任课教师分段教案：逐章备好推进骨架、情境推进与微拍融合'],
    ['dictmaster','📖 词典达人','全局设定架构师：AI 生成万物词典（人物十维+人物关系表+地名关联表+专名关联表+世界观规则）'],
    ['dictEnrich','🗂 词典充实','设定细化工坊：为正文补充人物感官特征、地名场景禁忌与氛围路人龙套']
  ]},
  { title:'✍️ 正文重创作（费用大头，建议主力模型）', keys:[
    ['chapter','正文生成','全书正文质量与费用大头；所选模型须支持流式（stream）']
  ]},
  { title:'🔧 每章/每批 · 轻维护（高频小请求，建议 flash 省钱）', keys:[
    ['strip','本章梗概（速读）','每章生成后都会调用'],
    ['subplot','副线追踪','小 JSON 追踪任务'],
    ['glossary','词典提取','JSON 严谨任务；换弱模型解析失败率会升高（有校验兜底，不阻断）'],
    ['rolling','滚动摘要','长篇记忆层，每批正文后调用']
  ]},
  { title:'💡 写作补充与资产', keys:[
    ['contentAdvice','章节内容 AI 建议','JSON 任务'],
    ['assets','封面/人物/场景/分镜','提示词类产出'],
    ['recipe','AI 配方助手','候选配方需判断力；写风配方卡']
  ]}
];

const TM_TEMP = {
  idea:['ideaTemp',0.5],
  principal:['principalTemp',0.4],
  teacher:['teacherTemp',0.4],
  dictmaster:['dictmasterTemp',0.4],
  dictEnrich:['dictEnrichTemp',0.4],
  chapter:['chapterTemp',0.5],
  strip:['stripTemp',1.0],
  subplot:['subplotTemp',0.25],
  glossary:['qcTemp',0.2],
  rolling:['rollingTemp',0.3],
  contentAdvice:['contentAdviseTemp',0.6],
  assets:['assetsTemp',0.7],
  recipe:['aiRecipeTemp',0.9]
};
let editTM = null;          // 面板暂存：保存前绝不落盘（对齐设置弹窗 editCfg 模式）
let editTemps = {};
let _tmEscHandler = null;   // ESC 关闭挂钩（现有 modal 无全局 ESC，本面板自持）
function tmCustomCount(tm){ return TM_KEYS.filter(k=> tm && tm[k]).length; }
function updateTmBadge(){
  const n = tmCustomCount(getCfg().taskModels);
  const el = $('#tmBadge'); if(el) el.textContent = n ? ('已自定义 '+n+' 项') : '全部跟随全局';
  const b = $('#cfgBadge'); if(b) b.classList.toggle('tm-on', n>0);
}
function tmResolvePreview(triple){
  if(!triple) return '跟随全局';
  const cfg = getCfg();
  const g = cfg.groups.find(x=>x.id===triple.groupId);
  if(!g) return '⚠️ 服务组不存在（保存后仍会回落全局）';
  const k = (g.keys||[]).find(x=>x.id===triple.keyId) || (g.keys||[])[0];
  const m = (g.models||[]).find(x=>x.name===triple.model) || (g.models||[])[0];
  return '实际:' + (g.label||'') + ' · ' + (k?(k.label||'账号'):'⚠️ 无账号') + ' · ' + (m?m.name:'⚠️ 无模型');
}
function openTaskModelPanel(){
  editTM = JSON.parse(JSON.stringify(getCfg().taskModels || {}));
  editTemps = {};
  const g0 = getCfg();
  Object.keys(TM_TEMP).forEach(k=>{ const f=TM_TEMP[k][0]; if(f && !(f in editTemps)) editTemps[f]=(g0[f]==null?TM_TEMP[k][1]:g0[f]); });
  $('#taskModelModal').classList.remove('hidden');
  const st=$('#tmStatus'); if(st){ st.className='status'; st.textContent=''; }
  renderTaskModelPanel();
  _tmEscHandler = (e)=>{ if(e.key==='Escape') requestCloseTaskModelPanel(); };
  document.addEventListener('keydown', _tmEscHandler);
}
function closeTaskModelPanel(){
  $('#taskModelModal').classList.add('hidden');
  if(_tmEscHandler){ document.removeEventListener('keydown', _tmEscHandler); _tmEscHandler=null; }
  editTM = null; editTemps = {};
}
function requestCloseTaskModelPanel(){
  if(editTM && JSON.stringify(editTM) !== JSON.stringify(getCfg().taskModels || {})){
    if(!window.confirm('分任务模型有未保存的更改，放弃并关闭？')) return;
  }
  closeTaskModelPanel();
}
function refreshTmResetBtn(){
  const btn=$('#btnTmReset'); if(!btn) return;
  const n = tmCustomCount(editTM||{});
  btn.classList.toggle('hidden', n===0);
  btn.textContent = '全部恢复跟随全局（'+n+' 项自定义）';
}
function renderTaskModelPanel(){
  const body = $('#tmBody'); if(!body) return;
  const cfg = getCfg();
  const cur = cfg.active || {};
  const curGroup = cfg.groups.find(g=>g.id===cur.groupId) || cfg.groups[0] || {};
  const curKey = (curGroup.keys||[]).find(k=>k.id===cur.keyId) || (curGroup.keys||[])[0];
  const curModel = (curGroup.models||[]).find(m=>m.name===cur.model) || (curGroup.models||[])[0];
  const optHtml = (arr, val, ph)=> arr.length
    ? arr.map(x=>`<option value="${esc(String(x.v))}" ${String(x.v)===String(val)?'selected':''}>${esc(x.t)}</option>`).join('')
    : `<option value="">${esc(ph)}</option>`;
  const row = (key, name, note)=>{
    const tm = editTM[key] || '';
    const gid = tm ? tm.groupId : '';
    const grp = cfg.groups.find(g=>g.id===gid);
    const kid = tm ? tm.keyId : '';
    const mid = tm ? tm.model : '';
    const tf = TM_TEMP[key];
    const tval = tf ? (editTemps[tf[0]]==null ? tf[1] : editTemps[tf[0]]) : '';
    return `<div class="tm-row${tm?' tm-custom':''}" data-tm-row="${key}">
      <div class="tm-head"><span class="tm-name">${esc(name)}</span><span class="tm-note">${esc(note||'')}</span>
        ${tf?`<input type="number" inputmode="decimal" step="0.05" min="0" max="2" class="tm-temp" data-tm-temp="${key}" value="${tval}" placeholder="温度 ${tf[1]}" title="${esc(name)} 的 AI 温度（留空并保存＝恢复建议值）">`:'<span class="tm-temp-void"></span>'}
      </div>
      <div class="tm-sels">
        <select data-tm-sel="group" data-tm-key="${key}">
          <option value="">跟随全局</option>
          ${cfg.groups.map(g=>`<option value="${esc(g.id)}" ${gid===g.id?'selected':''}>${esc(g.label)}</option>`).join('')}
        </select>
        <select data-tm-sel="key" data-tm-key="${key}" ${grp?'':'disabled'}>${optHtml((grp?(grp.keys||[]):[]).map(k=>({v:k.id,t:k.label||'账号'})), kid, '（该组无账号）')}</select>
        <select data-tm-sel="model" data-tm-key="${key}" ${grp?'':'disabled'}>${optHtml((grp?(grp.models||[]):[]).map(m=>({v:m.name,t:m.name})), mid, '（该组无模型）')}</select>
      </div>
      <div class="tm-preview${tm?'':' tm-follow'}">${esc(tmResolvePreview(tm||null))}</div>
    </div>`;
  };
  body.innerHTML = `
    <div class="cv-div">可按任务独立指定模型与 AI 温度，灵活平衡质量与效率。留空温度表示跟随建议值。</div>
    <div class="set-block">
      <div class="set-block-head"><span>◆ 全局默认（未单独设置的任务都用它）</span></div>
      <div class="tm-preview">${esc((curGroup.label||'AI') + ' · ' + (curKey?(curKey.label||'账号'):'⚠️ 无账号') + ' · ' + (curModel?curModel.name:'⚠️ 无模型'))}（只读；去上方「AI 模型配置」修改）</div>
    </div>
    ${TM_GROUPS.map(gr=>`<div class="set-block"><div class="set-block-head"><span>${esc(gr.title)}</span></div>${gr.keys.map(k=>row(k[0],k[1],k[2])).join('')}</div>`).join('')}`;
  $$('#tmBody [data-tm-sel]').forEach(sel=>{
    sel.onchange = ()=>{
      const key = sel.dataset.tmKey, level = sel.dataset.tmSel;
      const cfgNow = getCfg();
      const tm = editTM[key] || '';
      if(level==='group'){
        if(!sel.value){ editTM[key]=''; }
        else{
          const grp = cfgNow.groups.find(g=>g.id===sel.value);
          editTM[key] = grp ? { groupId:grp.id, keyId:((grp.keys||[])[0]||{}).id||'', model:((grp.models||[])[0]||{}).name||'' } : '';
        }
      }else if(tm){
        if(level==='key') tm.keyId = sel.value;
        if(level==='model') tm.model = sel.value;
      }
      renderTaskModelPanel();
      refreshTmResetBtn();
    };
  });
  $$('#tmBody [data-tm-temp]').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      const tf = TM_TEMP[inp.dataset.tmTemp]; if(!tf) return;
      const v = parseFloat(inp.value);
      editTemps[tf[0]] = (inp.value==='' || isNaN(v)) ? tf[1] : v;
      renderTaskModelPanel();
      refreshTmResetBtn();
    });
  });
  refreshTmResetBtn();
}
function saveTaskModels(){
  const cfg = getCfg();
  const clean = {};
  TM_KEYS.forEach(k=>{
    const v = editTM && editTM[k];
    const ok = v && typeof v==='object' && v.groupId && v.keyId && v.model && cfg.groups.some(g=>g.id===v.groupId);
    clean[k] = ok ? { groupId:v.groupId, keyId:v.keyId, model:v.model } : '';
  });
  const c = getCfg(); c.taskModels = clean;
  Object.keys(TM_TEMP).forEach(k=>{ const f=TM_TEMP[k][0]; if(f && editTemps && (f in editTemps)) c[f]=editTemps[f]; });
  saveCfg(c);
  const n = tmCustomCount(clean);
  const nT = Object.keys(TM_TEMP).filter(k=>{ const f=TM_TEMP[k][0]; return f && editTemps && editTemps[f]!=null; }).length;
  closeTaskModelPanel();
  updateCfgBadge();
  toast(n ? ('分任务模型已保存：'+n+' 项自定义，其余跟随全局') : '分任务模型已保存：全部跟随全局')+(nT?('；已同步 '+nT+' 项任务温度'):'');
}

function renderGroupsList(){
  const el=$('#groupsList'); if(!el) return;
  el.innerHTML='';
  if(!editCfg.groups.length){ el.innerHTML='<div class="muted">暂无服务，点上方「＋ 新增组」添加。</div>'; return; }
  editCfg.groups.forEach(g=>{
    if(!selGroupId) selGroupId=g.id;
    const d=document.createElement('div');
    d.className='group-item' + (g.id===selGroupId ? ' active' : '');
    d.innerHTML = `<span class="gi-label">${esc(g.label)}</span><span class="gi-meta">${g.keys.length} 账号 · ${g.models.length} 模型</span>`;
    d.onclick = ()=>{ selGroupId=g.id; renderGroupsList(); renderGroupDetail(); };
    el.appendChild(d);
  });
}

function _dg(){ return editCfg.groups.find(x=>x.id===selGroupId) || editCfg.groups[0]; }
function renderGroupDetail(){
  const el=$('#groupDetail'); if(!el) return;
  const g=_dg();
  if(!g){ el.innerHTML='<div class="muted">选择左侧一个服务，或点上方「＋ 新增组」添加。</div>'; return; }
  selGroupId=g.id;
  el.innerHTML = `
    <div class="set-block-head">
      <span>${esc(g.label)} · 详情</span>
      <span class="gd-acts">
        <button class="btn small ghost" data-act="addkey" type="button">＋ 账号</button>
        <button class="btn small ghost" data-act="addmodel" type="button">＋ 模型</button>
        ${g.id!=='deepseek' ? '<button class="btn small ghost del" data-act="delgroup" type="button">删组</button>' : ''}
      </span>
    </div>
    <label class="field"><span>接口地址（OpenAI 兼容协议）</span>
      <input class="g-base" type="text" value="${esc(g.baseUrl)}" placeholder="https://api.deepseek.com">
    </label>
    <label class="mini-check g-kib" title="部分 Cloudflare 中转不读 Authorization 头，要求把 Key 放进请求体 api_key 字段。开启后请求将不再携带 Bearer 头。">
      <input type="checkbox" class="g-kib-cb" ${g.keyInBody?'checked':''}> API Key 放请求体（api_key）传递，规避 Bearer 头
    </label>
    <div class="gd-title">账号（API Key 仅存本机，多账号=多卡分流）</div>
    ${g.keys.length ? g.keys.map((k,i)=>`
      <div class="key-row">
        <input class="k-lab" data-idx="${i}" type="text" value="${esc(k.label)}" placeholder="备注">
        <input class="k-key" data-idx="${i}" type="password" value="${esc(k.key)}" placeholder="sk-..." autocomplete="off">
        <button class="btn small ghost k-eye" data-key-eye="${i}" type="button" title="显示/隐藏 Key">👁</button>
        <button class="btn small ghost k-copy" data-key-copy="${i}" type="button" title="复制 Key">📋</button>
        <button class="btn small ghost del" data-act="delkey" data-id="${k.id}" type="button">删</button>
      </div>`).join('') : '<div class="muted">该组还没有账号，点「＋ 账号」粘贴 API Key。</div>'}
    <div class="gd-title">模型清单</div>
    ${g.models.length ? g.models.map(m=>`
      <div class="model-row">
        <span class="m-name">${esc(m.name)}</span>
        ${m.kind==='flash' ? '<span class="pill tag-warn">最快/最便宜</span>' : ''}
        <button class="btn small ghost del" data-act="delmodel" data-name="${esc(m.name)}" type="button">删</button>
      </div>`).join('') : '<div class="muted">请点「＋ 模型」添加模型名。</div>'}
  `;
  el.onclick = onDetail;
  el.querySelectorAll('.k-lab').forEach(inp=> inp.onchange=()=>{ const gg=_dg(); gg.keys[+inp.dataset.idx].label = inp.value || ('账号'+(+inp.dataset.idx+1)); });
  el.querySelectorAll('.k-key').forEach(inp=> { inp.onchange=()=>{ const gg=_dg(); gg.keys[+inp.dataset.idx].key = inp.value.trim(); updateCfgBadge(); }; });
  el.querySelectorAll('[data-key-eye]').forEach(btn=>{
    btn.onclick = ()=>{
      const inp = el.querySelector('.k-key[data-idx="'+btn.dataset.keyEye+'"]');
      if(!inp) return;
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.textContent = show ? '🙈' : '👁';
      btn.title = show ? '隐藏 Key' : '显示 Key';
    };
  });
  el.querySelectorAll('[data-key-copy]').forEach(btn=>{
    btn.onclick = ()=>{
      const inp = el.querySelector('.k-key[data-idx="'+btn.dataset.keyCopy+'"]');
      if(!inp || !inp.value.trim()){ toast('该账号暂无 Key'); return; }
      copyText(inp.value.trim());
    };
  });
  const base = el.querySelector('.g-base'); if(base) base.onchange=(ev)=>{ const gg=_dg(); gg.baseUrl = ev.target.value.trim(); };
  const kib = el.querySelector('.g-kib-cb'); if(kib) kib.onchange=(ev)=>{ const gg=_dg(); gg.keyInBody = ev.target.checked; };
}
function onDetail(ev){
  const b = ev.target && ev.target.closest('[data-act]'); if(!b) return;
  const act = b.dataset.act, g = _dg(); if(!g) return;
  if(act==='addkey'){
    const v=prompt('粘贴该账号的 API Key（sk-...）：');
    if(v==null) return;
    if(!v.trim()){ toast('Key 为空，未添加'); return; }
    g.keys.push({ id: uid('k'), label:'账号'+(g.keys.length+1), key:v.trim() });
  } else if(act==='addmodel'){
    const n=prompt('模型名（如 deepseek-v4-flash 或第三方模型名）：');
    if(n==null) return;
    if(!n.trim()){ toast('模型名为空，未添加'); return; }
    g.models.push({ name:n.trim(), label:n.trim(), kind:'' });
  } else if(act==='delkey'){
    g.keys = g.keys.filter(x=>x.id!==b.dataset.id);
  } else if(act==='delmodel'){
    g.models = g.models.filter(x=>x.name!==b.dataset.name);
  } else if(act==='delgroup'){
    editCfg.groups = editCfg.groups.filter(x=>x.id!==g.id);
    selGroupId = null;
  }
  refreshAfter();
}
function refreshAfter(){ renderGroupsList(); renderGroupDetail(); renderActiveSelects(); updateCfgBadge(); }

function addGroup(){
  const label=prompt('新服务名称（如：Kimi / 智谱 / 我的中转）：');
  if(label==null) return;
  if(!label.trim()){ toast('名称为空，未添加'); return; }
  const base=prompt('接口地址（OpenAI 兼容，如 https://api.deepseek.com）：','');
  const g={ id:uid('g'), kind:'openai', label:label.trim(), baseUrl:(base||'').trim(), keys:[], models:defaultModels(), keyInBody:false };
  editCfg.groups.push(g); selGroupId=g.id; refreshAfter();
}

function renderActiveSelects(){
  const selG=$('#c_selGroup'), selK=$('#c_selKey'), selM=$('#c_selModel');
  if(!selG || !editCfg) return;
  const act = editCfg.active || {};
  selG.innerHTML = editCfg.groups.map(g=>`<option value="${esc(g.id)}">${esc(g.label)}</option>`).join('');
  selG.value = editCfg.groups.some(g=>g.id===act.groupId) ? act.groupId : (editCfg.groups[0]?editCfg.groups[0].id:'');
  const g = editCfg.groups.find(x=>x.id===selG.value) || editCfg.groups[0];
  const keys = g?g.keys:[];
  selK.innerHTML = keys.map(k=>`<option value="${esc(k.id)}">${esc(k.label)}${k.key?'':'（未填）'}</option>`).join('');
  selK.value = keys.some(k=>k.id===act.keyId) ? act.keyId : (keys[0]?keys[0].id:'');
  const models = g?g.models:[];
  selM.innerHTML = models.map(m=>`<option value="${esc(m.name)}">${esc(m.label)}${m.kind==='flash'?' ⚡':''}</option>`).join('');
  selM.value = models.some(m=>m.name===act.model) ? act.model : (models[0]?models[0].name:'');
}

function saveSettings(){
  if(!editCfg){ return; }
  saveTemps();
  const selG=$('#c_selGroup'), selK=$('#c_selKey'), selM=$('#c_selModel');
  if(selG){
    const gId=selG.value || (editCfg.groups[0] && editCfg.groups[0].id);
    editCfg.active = { groupId:gId, keyId:(selK&&selK.value)||null, model:(selM&&selM.value)||'' };
  }
  saveCfg(editCfg);
  const st=$('#cfgStatus'); if(st){ st.className='status ok'; st.textContent='已保存到本机浏览器。'; }
  toast('配置已保存');
  updateCfgBadge();
}
async function testConn(){
  const st = $('#cfgStatus'); if(st){ st.className='status'; st.textContent='测试中…'; }
  saveSettings();
  try{
    const r = unwrapAIResult(await callDeepSeek('你是测试助手，只回复「ok」。','你好'));
    if(st){ st.className='status ok'; st.textContent='连接成功：'+r.slice(0,20); }
  }catch(e){
    if(st){
      st.className='status err';
      let msg = e.message;
      if(/insufficient balance/i.test(msg)) msg += '（账户余额不足，请到对应控制台充值，不是 Key 填错）';
      else if(/not found.*model/i.test(msg)) msg += '（模型名不存在，请检查当前所选模型）';
      st.textContent='连接失败：'+msg;
    }
  }
}

function showBootLoading(show){
  const el = $('#bootLoading'); if(!el) return;
  el.classList.toggle('hidden', !show);
}
async function init(){
  showBootLoading(true);
  try{ await loadState(); }catch(e){ /* 兜底：保持空白 state，不卡死 */ }
  loadGlib();
  const c = getCfg();
  applyTheme(c.theme || 'dark');
  $('#btnSettings').onclick = openSettings;
  const btnLog = $('#btnAiLog');
  if(btnLog) btnLog.onclick = (e)=>{ e.stopPropagation(); openAiLogPanel(); };
  rebindHistPanel();
  rebindWsColorPanel();
  const btnTheme = $('#btnTheme');
  if(btnTheme) btnTheme.onclick = (e)=>{ e.stopPropagation(); const p=$('#themePanel'); if(p.classList.contains('hidden')) openThemePanel(); else closeThemePanel(); };
  initThemeSoundPanel();
  rebindNarrativeEngine();
  const btnTS = $('#btnTempSave');
  if(btnTS) btnTS.onclick = (e)=>{
    e.stopPropagation();
    if(!editCfg) editCfg = JSON.parse(JSON.stringify(getCfg()));
    saveTemps();
    saveCfg(editCfg);
    updateCfgBadge();
    toast('温度已保存');
  };
  document.addEventListener('click', (e)=>{
    const t = $('#themePanel'); if(t && !t.classList.contains('hidden') && !t.contains(e.target) && !e.target.closest('#btnTheme')) closeThemePanel();
    const h = $('#histPanel'); if(h && !h.classList.contains('hidden') && !h.contains(e.target) && !e.target.closest('#btnHist')) closeHistPanel();
    const col = $('#wsColorPanel'); if(col && !col.classList.contains('hidden') && !col.contains(e.target) && !e.target.closest('#btnWsColor')) closeWsColorPanel();
  });
  $$('[data-close]').forEach(b=> b.onclick = closeSettings);
  $('#btnCfgSave').onclick = ()=>{ saveSettings(); closeSettings(); };
  $('#btnCfgTest').onclick = testConn;
  $('#btnTaskModels').onclick = openTaskModelPanel;
  $('#btnTmSave').onclick = saveTaskModels;
  $('#btnTmReset').onclick = ()=>{
    if(!window.confirm('确定清除全部分任务设置，全部恢复跟随全局？')) return;
    TM_KEYS.forEach(k=>{ editTM[k]=''; });
    renderTaskModelPanel();
  };
  $$('#taskModelModal [data-tm-close]').forEach(el=> el.onclick = requestCloseTaskModelPanel);
  const btnAddG = $('#btnAddGroup'); if(btnAddG) btnAddG.onclick = addGroup;
  const selG=$('#c_selGroup'), selK=$('#c_selKey'), selM=$('#c_selModel');
  if(selG) selG.onchange = ()=>{ if(editCfg){ editCfg.active.groupId = selG.value; renderActiveSelects(); updateCfgBadge(); } };
  if(selK) selK.onchange = ()=>{ if(editCfg){ editCfg.active.keyId = selK.value; updateCfgBadge(); } };
  if(selM) selM.onchange = ()=>{ if(editCfg){ editCfg.active.model = selM.value; updateCfgBadge(); } };
  const cfgBadge=$('#cfgBadge'); if(cfgBadge) cfgBadge.onclick = openSettings;
  updateCfgBadge();
  $$('.theme-btns .theme').forEach(b=> b.onclick = ()=>{ applyTheme(b.dataset.theme); closeThemePanel(); });
  const mtn = $('#mechaTopNav');
  if(mtn){
    $$('.cap', mtn).forEach(c=> c.onclick = ()=>{
      if(c.dataset.export){ currentStep = 5; }
      else { currentStep = +c.dataset.step; }
      render(); window.scrollTo(0,0);
    });
  }
  $$('.tab').forEach(t=> t.onclick = ()=>{ if(!guardSwitchStep()) return; currentStep = +t.dataset.step; render(); window.scrollTo(0,0); });
  showBootLoading(false);
  render();
}
document.addEventListener('DOMContentLoaded', init);
(function brandVersion(){ const b = document.getElementById('verBadge'); if(b) b.textContent = ' v'+APP_VERSION; })();


/* ===================== 禁则清单三角色（词典达人、词典充实、校长）生效保障 ===================== */
function isScopeBanned(scopeKey){
  const raw = (typeof banListRaw === 'function') ? banListRaw() : (state.banList || {});
  if(!raw || raw.enabled === false) return false;
  const scopes = Array.isArray(raw.scopeAi) ? raw.scopeAi : [];
  return scopes.includes(scopeKey);
}

// 1. 词典达人（dictmaster）禁则校验与清洗
function filterDictMasterEntry(entry){
  if(!isScopeBanned('dictmaster')) return entry;
  const bChars = (typeof banListChars === 'function') ? banListChars() : (state.banList?.chars || []);
  const bNames = (typeof banListNames === 'function') ? banListNames() : (state.banList?.names || []);
  let name = String(entry.name || '');
  for(const n of bNames){
    if(n && name.includes(n)) return null; // 命中禁名则拦截抛弃
  }
  for(const c of bChars){
    if(c && name.includes(c)) name = name.split(c).join(''); // 清洗禁用字
  }
  if(!name.trim()) return null;
  return Object.assign({}, entry, { name });
}

// 2. 词典充实（dictEnrich）自动拦截
function filterDictEnrichList(list){
  if(!isScopeBanned('dictEnrich') || !Array.isArray(list)) return list || [];
  const bNames = (typeof banListNames === 'function') ? banListNames() : (state.banList?.names || []);
  const bChars = (typeof banListChars === 'function') ? banListChars() : (state.banList?.chars || []);
  return list.filter(item => {
    const txt = String(item.name || item.title || item.entity || '');
    for(const n of bNames){
      if(n && txt.includes(n)) return false;
    }
    return true;
  }).map(item => {
    let txt = String(item.name || item.title || item.entity || '');
    for(const c of bChars){
      if(c && txt.includes(c)) txt = txt.split(c).join('');
    }
    return Object.assign({}, item, { name: txt });
  });
}

// 3. 校长（principal）大纲章节标题清洗与禁则拦截
function sanitizePrincipalChapter(ch){
  if(!isScopeBanned('principal')) return ch;
  const bNames = (typeof banListNames === 'function') ? banListNames() : (state.banList?.names || []);
  const bChars = (typeof banListChars === 'function') ? banListChars() : (state.banList?.chars || []);
  let title = String(ch.title || '');
  let summary = String(ch.summary || '');
  for(const n of bNames){
    if(n){
      title = title.split(n).join('');
      summary = summary.split(n).join('');
    }
  }
  for(const c of bChars){
    if(c){
      title = title.split(c).join('');
      summary = summary.split(c).join('');
    }
  }
  return Object.assign({}, ch, { title: title.trim() || '新章节', summary: summary.trim() });
}


/* ===================== 优化构想：单方案/多方案全面修复与强化 ===================== */
function sanitizeJsonControlChars(str){
  if(typeof str !== 'string') return '';
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => {
    if(c === '\n') return '\\n';
    if(c === '\r') return '\\r';
    if(c === '\t') return '\\t';
    return '';
  });
}

function robustParseJson(str){
  if(!str) return null;
  let clean = String(str).trim();
  clean = clean.replace(/^[`\s]*json/i, '').replace(/[`\s]*$/i, '').trim();
  const fst = clean.indexOf('{');
  const lst = clean.lastIndexOf('}');
  if(fst >= 0 && lst > fst){
    const candidate = clean.slice(fst, lst + 1);
    try { return JSON.parse(candidate); } catch(e){}
    try { return JSON.parse(sanitizeJsonControlChars(candidate)); } catch(e){}
  }
  const fstArr = clean.indexOf('[');
  const lstArr = clean.lastIndexOf(']');
  if(fstArr >= 0 && lstArr > fstArr){
    const candidate = clean.slice(fstArr, lstArr + 1);
    try { return JSON.parse(candidate); } catch(e){}
    try { return JSON.parse(sanitizeJsonControlChars(candidate)); } catch(e){}
  }
  return null;
}

function buildIdeaPolishUserFixed(ctx){
  const rawIdea = String(ctx.rawIdea || (typeof state !== 'undefined' ? state.idea : '') || '').trim();
  const multi = !!ctx.multi;
  const parts = [];
  parts.push('【原始创作构想】\n' + (rawIdea || '（创作者尚未输入构想，请自行发挥一个高概念、戏剧张力强烈的引人故事）'));
  
  if(multi){
    parts.push(`【本次生成任务：多方案对比模式（核心强指令）】
你必须生成 3 到 5 个具有不同故事策略、冲突走向与创新视角的完整优化方案！
每个方案包含独立书名、故事梗概、全书节拍与核心蓝本。
必须严格输出纯 JSON 格式，options 数组中必须包含 3 到 5 个完整方案对象：
{
  "options": [
    {
      "name": "方案1：[风格或侧重点标签]",
      "bookTitle": "书名1",
      "novelSummary": "方案1故事核心梗概（200-300字）...",
      "fullBookBeat": "方案1全书节拍与三幕式起伏...",
      "optimizedIdea": "方案1优化后的完整构想与创意蓝本...",
      "creativeAdditions": "方案1独特创新增补设定...",
      "navBeacon": {"genre":"题材类型","protagonist":"主角特质","coreConflict":"核心矛盾","tone":"叙事基调"},
      "defects": [],
      "seedCharacters": [],
      "seedPlaces": []
    },
    {
      "name": "方案2：[风格或侧重点标签]",
      "bookTitle": "书名2",
      "novelSummary": "方案2故事核心梗概（200-300字）...",
      "fullBookBeat": "方案2全书节拍与三幕式起伏...",
      "optimizedIdea": "方案2优化后的完整构想与创意蓝本...",
      "creativeAdditions": "方案2独特创新增补设定...",
      "navBeacon": {"genre":"题材类型","protagonist":"主角特质","coreConflict":"核心矛盾","tone":"叙事基调"},
      "defects": [],
      "seedCharacters": [],
      "seedPlaces": []
    },
    {
      "name": "方案3：[风格或侧重点标签]",
      "bookTitle": "书名3",
      "novelSummary": "方案3故事核心梗概（200-300字）...",
      "fullBookBeat": "方案3全书节拍与三幕式起伏...",
      "optimizedIdea": "方案3优化后的完整构想与创意蓝本...",
      "creativeAdditions": "方案3独特创新增补设定...",
      "navBeacon": {"genre":"题材类型","protagonist":"主角特质","coreConflict":"核心矛盾","tone":"叙事基调"},
      "defects": [],
      "seedCharacters": [],
      "seedPlaces": []
    }
  ]
}
【严禁只输出单一方案！options 数组长度必须在 3 至 5 之间！】`);
  } else {
    parts.push(`【本次生成任务：单方案精修模式（核心强指令）】
本次只需生成恰好 1 个最优秀的最终构想优化方案！
必须输出纯 JSON 格式，options 数组中恰好只有 1 个对象：
{
  "options": [
    {
      "name": "方案1：终极精修方案",
      "bookTitle": "小说最终书名",
      "novelSummary": "故事梗概与核心大纲...",
      "fullBookBeat": "全书关键节拍脉络...",
      "optimizedIdea": "全面优化后的完整构想与小说蓝本...",
      "creativeAdditions": "创新亮点与增补设计...",
      "navBeacon": {"genre":"","protagonist":"","coreConflict":"","tone":""},
      "defects": [],
      "seedCharacters": [],
      "seedPlaces": []
    }
  ]
}`);
  }
  return parts.join('\n\n');
}

function parsePolishCandidatesFixed(raw, multi){
  const rawText = String(raw || '').trim();
  if(!rawText) return [];
  const parsed = robustParseJson(rawText);
  let arr = [];
  if(parsed){
    if(Array.isArray(parsed)) arr = parsed;
    else if(Array.isArray(parsed.options)) arr = parsed.options;
    else if(parsed.name || parsed.bookTitle || parsed.novelSummary || parsed.optimizedIdea) arr = [parsed];
  }
  // Markdown fallback if multi mode returned text
  if(multi && arr.length < 2 && rawText.length > 50){
    const sections = rawText.split(/(?:^|\n)(?:#{1,4}\s*)?(?:【|\(|（)?\s*方案\s*([一二三四五六七八九十\d]+|[A-Za-z])/);
    if(sections.length > 2){
      const parsedSections = [];
      for(let i = 1; i < sections.length; i += 2){
        const label = '方案 ' + sections[i];
        const content = sections[i + 1] || '';
        parsedSections.push({
          _id: 'sec-' + i,
          name: label,
          bookTitle: (content.match(/书名[：:]\s*([^\n]+)/) || [])[1] || ('方案' + Math.ceil(i/2)),
          novelSummary: content.slice(0, 300),
          optimizedIdea: content.trim(),
          text: content.trim()
        });
      }
      if(parsedSections.length >= 2) arr = parsedSections;
    }
  }

  if(!arr.length){
    arr = [{
      _id: 'polish-' + Date.now(),
      name: '方案1',
      bookTitle: '精选小说',
      novelSummary: rawText.slice(0, 200),
      optimizedIdea: rawText,
      text: rawText
    }];
  }

  // Force length constraint
  if(!multi) arr = arr.slice(0, 1);
  return arr.map((item, idx) => ({
    _id: item._id || ('opt-' + Date.now() + '-' + idx),
    name: item.name || ('方案' + (idx + 1)),
    bookTitle: item.bookTitle || item.title || ('方案' + (idx + 1) + '书名'),
    novelSummary: item.novelSummary || item.summary || '',
    fullBookBeat: item.fullBookBeat || item.beat || '',
    optimizedIdea: item.optimizedIdea || item.text || '',
    creativeAdditions: item.creativeAdditions || '',
    navBeacon: item.navBeacon || null,
    defects: Array.isArray(item.defects) ? item.defects : [],
    seedCharacters: Array.isArray(item.seedCharacters) ? item.seedCharacters : [],
    seedPlaces: Array.isArray(item.seedPlaces) ? item.seedPlaces : []
  }));
}
