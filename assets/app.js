/* THREE-LAYER-INTEGRATION-CLEANUP: STYLE_STRATEGY contains the single principal GLOBAL authority; teacher performs chapter-level HYBRID/CHAPTER application.
 * v1.0.536 STYLE-LAYER-OUTPUT-ORGANIZATION: principal outputs only the single GLOBAL source; teacher owns chapter-level HYBRID/CHAPTER application and receives GLOBAL once as the locked baseline.
 * v1.0.532 STYLE-BASIS-LOCK: principal/teacher dynamic style decisions must be grounded in chapter microbeat + plot situation; preserve raw-teacher-only transmission.
 * v1.0.527 STYLE-LAYER-TRANSMISSION: principal style-layer decision + teacher three-layer execution +正文 three-layer transmission; preserve optimized writing style source and keep layer responsibilities separate.
 * v1.0.531 STYLE-LAYER-OPTIONAL: chapter-scoped glossary/world-material injection; teacher rawText remains sole chapter-plan source; principal→正文 remains severed.
 * v1.0.524 TEACHER-STYLE-LAYER-RESTORE: restored principal generation runtime; principal→正文 remains severed.
 * v1.0.519 CHAPTER-CUT-FIX: chapter heading matcher accepts markdown heading prefixes (# through ######), so the next chapter boundary is recognized before its first section and cannot leak into the previous chapter. */
/* v1.0.519 COMPLETE-TEACHER-CONTEXT: teacher AI receives the complete authoritative upstream context and returns a complete raw teaching plan. */
/* v1.0.519 RAW-TEACHER-ONLY: the teacher AI return is saved verbatim; chapter reads are deterministic raw-text slices only. */
'use strict';

/* v1.0.519 IRON LAW — 本章教案传导链永久锁定：
   1) 唯一章节教案来源 = 老师总教案原始纯文本；
   2) 唯一切割方式 = parseTeacherRawChapters 按“第X章”到下一章章头直接切出完整 rawText；
   3) 正文AI、正文“教案”、阅读“概”只允许读取 chapterCards.chapters[章号].rawText；
   4) 本链禁止结构化转换、结构化教案链、PlotUnit、ScenePlan、旧骨架或任何第二套教案读取链；
   5) 后续版本不得把结构化教案重新接回本链。
*/

const APP_VERSION = '1.0.547';
// Version line: app1.0.481.js — 建立最终老师/结局负责者硬边界；单老师项目与多老师最终组均禁止虚构后续交接。
const APP_FILE_VERSION = 'app1.0.547.js';
// Version line: app1.0.520.js — 校长不得进入正文输入链；正文只接收老师原始教案及允许的运行时事实。
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
const VALIDATION_RETRY_MAX = 2; // 语义校验失败最多定向修复2次；网络层重试仍由 callDeepSeek 自己管理
let lib = { curId: null, items: [] }; // {curId, items:[{id, idea, outline, ..., step, title, logline, updatedAt}]}
let gglib = [];

/* APP VERSION: app1.0.547.js — 校长注入链安全去重：唯一GLOBAL来源、合并重复风格资料、移除重复上下文包装。 */
/* ================================================================
 * 【GLOBAL / HYBRID / CHAPTER｜内部开发者说明】
 * 1. GLOBAL：全书恒定风格。校长单独确定的全书风格原规则；老师只能原义继承，不能修改、弱化、删除或稀释，正文继续按原义执行。
 * 2. HYBRID：动态融合风格。不是每章必有。由老师根据章节环境与GLOBAL自行决定并施工。
 * 3. CHAPTER：本章动态风格。不是每章必有。由老师根据本章剧情与GLOBAL自行决定并施工。
 * 4. 三者关系：GLOBAL负责“全书必须保持什么”；HYBRID/CHAPTER由老师按章施工。合法组合由老师按实际需要决定。
 * ================================================================ */

const state = {
  mode: 'shortfilm',    // 'shortfilm' 短片 / 'longnovel' 经典长篇小说
  wordRange: null,      // (兼容遗留) 不再作为长篇必填；保留字段避免旧快照破坏
  chapterRange: null,   // (兼容遗留) 同上
  totalWords: null,     // (兼容遗留) 同上
  chapterCount: null,   // 全书章节数量（整数 1-200，生成大纲前唯一必填数字；null=未设）
  idea: '',
  polishMode: 'single',
  polishStatus: 'empty',
  // 1.0.453：优化构想严格质检开关，默认开启；用户手动关闭后保持关闭。
  ideaOptimizationStrictQc: true,
  strategyStage1Status: 'empty',
  strategyStage2Status: 'empty',
  polishSelectedId: null,
  polishDiagnosis: null,
  polishFailureTrace: null,
  polishStrategies: [],
  strategicDimensions: [],
  strategicDiversityProfile: null,
  aiValidationHistory: [],
  // 校长→老师→正文的本章中段推进合同；不是随机化，而是受章节功能/状态/因果约束的结构策略。
  originalIdeaAnchors: null,
  // 1.0.358：canonicalStoryStrategy 是唯一权威故事事实，不再维护第二事实源。
  canonicalStoryStrategy: null,
  polishRevision: 0,
  // 优化构想产生的新增实体/设定只能作为待确认建议，绝不直接进入正式词典。
  polishPendingSuggestions: null,
  // 校长一次性统筹出的逐章章末策略；后续老师/正文只读取，不重新启动校长。
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
  characterNaming: { locked:false, lockedAt:0, version:0 },
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

state.characterNaming = (state.characterNaming && typeof state.characterNaming === 'object') ? state.characterNaming : {locked:false,lockedAt:0,version:0};
state.characterNaming.locked = !!state.characterNaming.locked;
state.characterNaming.version = Number(state.characterNaming.version)||0;
state.fcCollapsed = (typeof state.fcCollapsed === 'boolean') ? state.fcCollapsed : false;
state.rsCollapsed = (typeof state.rsCollapsed === 'boolean') ? state.rsCollapsed : false;
state._fixQueue = state._fixQueue || [];
state._chapterPartial = state._chapterPartial || {};
state.timeAnchorsAuto = (typeof state.timeAnchorsAuto === 'boolean') ? state.timeAnchorsAuto : true;
state.timeAnchor = true; // 时间锚点由当前老师教案与正文状态结算驱动
function _timeAnchorOn(){ return isLong(); }
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
function _plannedTimeRange(i){
  const chapterNo=Number(i)+1,groups=teacherAssignmentGroups();
  const g=groups.find(x=>chapterNo>=Number(x.first||1)&&chapterNo<=Number(x.last||Infinity));
  const t=g?teacherResultForAssignmentGroup(g).t:null;
  const rawText=String(t?.chapterCards?.chapters?.[chapterNo]?.rawText||'').trim();
  if(!rawText) return {source:'',from:'',to:'',jump:'',coverage:''};
  const timeText=extractPlanField({beatsText:rawText}, ['剧情时间落点','时间推进安排','时间覆盖安排']);
  const pr=_extractPlanTimeRange({beatsText:timeText});
  const explicit=extractPlanField({beatsText:rawText}, ['时间推进安排','时间覆盖安排']);
  return {source:pr.raw||explicit?'teacherRaw':'',from:pr.from,to:pr.to,jump:'',coverage:_timeCoveragePlan(pr.from,pr.to,explicit)};
}

function _timeContractForChapter(i){
  if(!isLong()||!_timeAnchorOn()) return null;
  const cur=_plannedTimeRange(i), prev=i>0?_plannedTimeRange(i-1):null;
  const ss=storyState(), prevObserved=i>0?ss.chapters?.[i-1]?.observed:null;
  const currentTime=String(ss.current?.time||'').trim();
  const fc=state.outline&&state.outline._factCard;
  const observedAux=fc&&Array.isArray(fc.timeAnchors)?fc.timeAnchors.find(x=>x&&x.ch===i-1&&x.time):null;
  if(!cur.from&&!cur.to&&!prev?.to&&!prevObserved?.time&&!currentTime&&!observedAux?.time) return null;
  const lines=['【本章时间连续性上下文｜生成前机器状态，优先于文学直觉】'];
  lines.push('- 时间权威顺序：上一章正文已经实际发生并结算的时间 ＞ 当前主线已提交时间状态 ＞ 老师当前章节时间计划。老师计划只能在已发生事实基础上规划本章，不得改写过去事实。');
  if(prevObserved?.time) lines.push(`- 上一章正文实际收尾时间｜只读事实：${prevObserved.time}`);
  else if(currentTime) lines.push(`- 当前主线已提交时间状态：${currentTime}`);
  if(prev&&(prev.from||prev.to)) lines.push(`- 上一章老师计划收尾｜仅作规划参考：${prev.to||prev.from}`);
  if(observedAux?.time) lines.push(`- 辅助时间观测（仅供交叉核对，不得升级为主线事实）：${observedAux.time}`);
  if(cur.from) lines.push(`- 本章老师计划起点：${cur.from}`);
  if(cur.to) lines.push(`- 本章老师计划终点：${cur.to}`);
  if(cur.jump) lines.push(`- 时间跳跃说明：${cur.jump}`);
  if(cur.coverage) lines.push(`- 【时间覆盖计划】${cur.coverage}`);
  const span=_timeDaySpan(cur.from,cur.to); if(span!=null && span>=1) lines.push(`- 【跨度计划】本章计划跨度约 ${span} 天；正文应真实推进到计划终点，允许自然跳时/蒙太奇，但不得无理由把多日压缩成同一两天内的连续场景。`);
  lines.push('- 连续性规则：本章主线首先承接上一章已确认的实际时间；若老师计划要求向后推进，必须通过真实的时间/空间流逝、行动过程或明确的叙事过桥完成。当前计划不得覆盖已经发生的事实。');
  lines.push('- 绝对禁止：时间回到上一章已结束的更早时段；上一章已经入睡、休息或结束当日后，本章不得再次用“夜幕降临/黄昏到来/天刚蒙蒙亮”等把同一时段重新开启。');
  lines.push('- 第一场时间锁：第一场应从上一章实际收尾时间自然延续，或在老师计划允许的前提下完成明确、可解释的时间推进；不得先写更早的时间氛围段再进入教案。');
  lines.push('- 时间是内部状态，不是写作任务：知道时间即可，不必主动告诉读者；只有时间本身是剧情信息时才明确写出。');
  lines.push('- 非线性叙事隔离：回忆、梦境、插叙、穿越等过去/支线时间只能作为叙事内容，不得因此把当前主线时间倒退或覆盖正式主线状态。');
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
  if(o.glossary) ensureGlossaryKnowledgeShape(o.glossary);
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
  o._storyState.canon=o._storyState.canon||{dictmasterAt:0,dictEnrichAt:0,principalAt:0,teacherAt:{},masterSnapshot:null}; o._storyState.canon.teacherAt=o._storyState.canon.teacherAt||{};
  o._storyState.canon = o._storyState.canon || {dictmasterAt:0,dictEnrichAt:0,principalAt:0,teacherAt:{}};
  o._storyState.chapters = o._storyState.chapters || {};
  o._storyState.current = o._storyState.current || {chapter:-1,time:'',location:'',characters:{},endingState:'',openThreads:[]};
  // v1.0.494 第一刀：建立独立章节微拍结构容器。
  // 注意：这里只建立新字段，不生成/修改旧 旧结构骨架、beats、midBeatIds 等数据。
  o._chapterMiddleShapes = (o._chapterMiddleShapes && typeof o._chapterMiddleShapes === 'object') ? o._chapterMiddleShapes : {};
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
  const rawTeacherPlan=getCurrentChapterTeacherRawText(i);
  if(rawTeacherPlan) lines.push(`【本章老师教案｜原始AI返回内容｜只读】\n${rawTeacherPlan}`);
  return lines.join('\n');
}
const CHAPTER_STATE_SYS = `你是长篇小说“正文状态结算器”，不是作者、不是编辑。只从已经写完的正文提取实际发生的状态，供下一章承接。
规则：只记录正文明确发生/明确说出/直接可观察的事实；不确定就留空；不得脑补；不得修改教案、时间线、词典或剧情计划；只记录实际写成了什么。
时间字段只记录本章正文结尾时点对应的主线实际时间；回忆、梦境、插叙、穿越、他人讲述中的过去时间、支线时间等属于正文叙事内容时，不得把它们误认成本章主线当前时间。若正文结尾没有足够证据判断主线时间，time 留空，不得用老师计划补写事实。输出严格JSON：{"time":"","location":"","characters":{"人物":"章末状态"},"endingState":"","openThreads":[],"newFacts":[]}`;

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
function ensureGlossaryKnowledgeShape(g){
  g = g || {};
  ['characters','places','propernouns','walkons','organizations','institutions','items','rules','terms','events','lifeSettings'].forEach(k=>{ if(!Array.isArray(g[k])) g[k]=[]; });
  g._relationshipTable = Array.isArray(g._relationshipTable) ? g._relationshipTable : [];
  g._placeContacts = Array.isArray(g._placeContacts) ? g._placeContacts : [];
  g._properContacts = Array.isArray(g._properContacts) ? g._properContacts : [];
  g._worldRules = Array.isArray(g._worldRules) ? g._worldRules : [];
  migrateAndCleanGlossarySources(g);
  return g;
}
function glossarySourceMeta(g){
  g=g||{};
  g._sourceMeta=(g._sourceMeta&&typeof g._sourceMeta==='object')?g._sourceMeta:{};
  ['foundation','enrichment'].forEach(k=>{g._sourceMeta[k]=(g._sourceMeta[k]&&typeof g._sourceMeta[k]==='object')?g._sourceMeta[k]:{};});
  return g._sourceMeta;
}
function glossarySourceKey(category,name){ return `${String(category||'').trim()}:${String(name||'').trim()}`; }
function markGlossarySource(g,category,item,source,extra){
  const name=String(item&&item.name||'').trim(); if(!name) return;
  const meta=glossarySourceMeta(g), key=glossarySourceKey(category,name);
  meta[source==='foundation'?'foundation':'enrichment'][key]=Object.assign({ts:Date.now()},extra||{});
}
function isGlossaryFoundation(g,category,item){
  const name=String(item&&item.name||'').trim(); if(!name) return false;
  const meta=glossarySourceMeta(g), key=glossarySourceKey(category,name);
  if(meta.foundation[key]) return true;
  const snap=storyState().canon?.masterSnapshot;
  const rows=category==='relationshipTable'?snap?.relationshipTable:category==='placeContacts'?snap?.placeContacts:category==='properContacts'?snap?.properContacts:category==='worldRules'?snap?.worldRules:snap?.[category];
  return Array.isArray(rows) && rows.some(x=>String(x&&x.name||'').trim()===name);
}
function markGlossaryFoundation(g,category,item,extra){ markGlossarySource(g,category,item,'foundation',extra); }
function markGlossaryEnrichment(g,category,item,extra){ markGlossarySource(g,category,item,'enrichment',extra); }
function isGlossaryEnrichment(g,category,item){ const name=String(item&&item.name||'').trim(); if(!name) return false; return !!glossarySourceMeta(g).enrichment[glossarySourceKey(category,name)]; }
function cleanGlossarySourceFields(item){
  if(!item||typeof item!=='object') return item;
  ['sourceType','source','createdBy','createdAt','_dictmaster','_enrich','_srcHow','_srcTs','_srcSnapshot'].forEach(k=>{delete item[k];});
  return item;
}
function migrateAndCleanGlossarySources(g){
  if(!g||typeof g!=='object') return g;
  const meta=glossarySourceMeta(g);
  const migrate=(arr,cat)=>{(Array.isArray(arr)?arr:[]).forEach(x=>{
    const name=String(x&&x.name||'').trim(); if(!name) return;
    if(x._dictmaster || String(x.sourceType||'').trim()==='dictionary_foundation') markGlossaryFoundation(g,cat,x,{migrated:true});
    else if(x._enrich || String(x.sourceType||'').trim()==='dictionary_enrichment') markGlossaryEnrichment(g,cat,x,{migrated:true,how:String(x._srcHow||'').trim()});
    cleanGlossarySourceFields(x);
  });};
  ['characters','places','propernouns','walkons','organizations','institutions','items','rules','terms','events','lifeSettings'].forEach(k=>migrate(g[k],k));
  const assoc=[['_relationshipTable','relationshipTable'],['_placeContacts','placeContacts'],['_properContacts','properContacts'],['_worldRules','worldRules']];
  assoc.forEach(([key,cat])=>{(g[key]||[]).forEach(x=>{if(String(x&&x.sourceType||'').trim()==='dictionary_foundation') markGlossaryFoundation(g,cat,x,{migrated:true}); else if(String(x&&x.sourceType||'').trim()==='dictionary_enrichment'||x&&x._enrich) markGlossaryEnrichment(g,cat,x,{migrated:true,how:String(x&&x._srcHow||'').trim()}); cleanGlossarySourceFields(x);});});
  return g;
}
function ssEnsureCanonEntities(){
  const g=ensureGlossaryKnowledgeShape((state.outline&&state.outline.glossary)||{});
  const meta={characters:'ch',places:'pl',propernouns:'pn',walkons:'wo',organizations:'org',institutions:'inst',items:'item',rules:'rule',terms:'term',events:'evt',lifeSettings:'life'};
  Object.entries(meta).forEach(([k,p])=>{
    (g[k]||[]).forEach(x=>{ if(!x||!String(x.name||'').trim()) return; x.id=x.id||ssEntityId(p,x.name); cleanGlossarySourceFields(x); });
  });
  [['relationshipTable','_relationshipTable'],['placeContacts','_placeContacts'],['properContacts','_properContacts'],['worldRules','_worldRules']].forEach(([cat,key])=>{(g[key]||[]).forEach(x=>cleanGlossarySourceFields(x));});
  return g;
}
function ssCaptureMasterSnapshot(){
  const g=ensureGlossaryKnowledgeShape((state.outline&&state.outline.glossary)||{}); const ss=storyState();
  const pick=(k,fields)=> (g[k]||[]).filter(Boolean).map(x=>{const o={}; fields.forEach(f=>o[f]=x[f]==null?'':x[f]); o.id=x.id||ssEntityId(k.slice(0,2),x.name); return o;});
  const genericKeys=['organizations','institutions','items','rules','terms','events','lifeSettings'];
  const genericSnapshot={};
  genericKeys.forEach(k=>{ genericSnapshot[k]=(g[k]||[]).filter(Boolean).map(x=>({...x})); });
  ss.canon=ss.canon||{};
  ss.canon.masterSnapshot={
    characters:pick('characters',['id','name','identity','age','gender','appearance','hobby','relation','trait','catchphrase']),
    places:pick('places',['id','name','type','note']),
    propernouns:pick('propernouns',['id','name','note']),
    generic:genericSnapshot,
    relationshipTable:(g._relationshipTable||[]).map(x=>({...x})), placeContacts:(g._placeContacts||[]).map(x=>({...x})), properContacts:(g._properContacts||[]).map(x=>({...x})), worldRules:(g._worldRules||[]).map(x=>({...x}))
  };
}
function ssProtectMasterCanon(){
  const ss=storyState(), snap=ss.canon&&ss.canon.masterSnapshot, g=ensureGlossaryKnowledgeShape((state.outline&&state.outline.glossary)); if(!snap||!g) return;
  const restore=(k,fields)=>{
    const by=new Map((snap[k]||[]).map(x=>[x.name,x]));
    (g[k]||[]).forEach(x=>{const old=by.get(x&&x.name); if(!old) return; fields.forEach(f=>x[f]=old[f]); x.id=old.id; cleanGlossarySourceFields(x); markGlossaryFoundation(g,k,x,{restored:true});});
  };
  restore('characters',['id','name','identity','age','gender','appearance','hobby','relation','trait','catchphrase']);
  restore('places',['name','type','note']); restore('propernouns',['name','note']);
  const generic=snap.generic||{}; Object.keys(generic).forEach(k=>{
    const by=new Map((generic[k]||[]).map(x=>[String(x&&x.name||''),x]));
    (g[k]||[]).forEach(x=>{const old=by.get(String(x&&x.name||'')); if(!old) return; Object.keys(old).forEach(f=>x[f]=old[f]); cleanGlossarySourceFields(x); markGlossaryFoundation(g,k,x,{restored:true});});
  });
  // 只恢复 Foundation，不得用基底快照覆盖/抹掉 dictionary_enrichment。
  // 关系、地名关联、专名关联、世界规则同样遵守“基底只读 + 扩充保留”的权威规则。
  const mergeProtectedTable=(key, foundationRows, identityFn)=>{
    const current=Array.isArray(g[key])?g[key]:[];
    const foundationIds=new Set((foundationRows||[]).map(identityFn).filter(Boolean));
    const enrich=current.filter(x=>{const id=identityFn(x); return id && !foundationIds.has(id);});
    const seen=new Set(); const out=[];
    (foundationRows||[]).forEach(x=>{ const row={...x}; cleanGlossarySourceFields(row); const id=identityFn(row); if(!seen.has(id)){seen.add(id);out.push(row);} });
    enrich.forEach(x=>{ const row={...x}; cleanGlossarySourceFields(row); const id=identityFn(row); if(!seen.has(id)){seen.add(id);out.push(row);} });
    g[key]=out;
  };
  mergeProtectedTable('_relationshipTable',snap.relationshipTable||[],x=>`rel:${String(x.a||'').trim()}|${String(x.b||'').trim()}|${String(x.relation||'').trim()}`);
  mergeProtectedTable('_placeContacts',snap.placeContacts||[],x=>`place:${String(x.from||'').trim()}|${String(x.to||'').trim()}|${String(x.relation||'').trim()}`);
  mergeProtectedTable('_properContacts',snap.properContacts||[],x=>`proper:${String(x.from||'').trim()}|${String(x.to||'').trim()}|${String(x.relation||'').trim()}`);
  mergeProtectedTable('_worldRules',snap.worldRules||[],x=>`rule:${String(x.cat||'').trim()}|${String(x.scope||'').trim()}|${String(x.rule||'').trim()}`);
  ssEnsureCanonEntities();
}
function teacherChapterNo(v){
  const s=String(v??'').trim();
  if(!s) return NaN;
  const m=s.match(/(?:第\s*)?(\d{1,4})(?:\s*章)?/i);
  return m ? Number(m[1]) : NaN;
}
function chapterTitleKey(v){
  return String(v||'').replace(/[《》「」『』【】]/g,'').replace(/第\s*\d+\s*章/gi,'').replace(/[\s\u3000]+/g,'').trim().toLowerCase();
}
function teacherResultForAssignmentGroup(g){
  const sc=scState(), list=Array.isArray(sc.teachers)?sc.teachers:[];
  if(!g) return {t:null,teacherIndex:-1};
  const code=String(g.teacherCode||'').trim();
  const groupId=String(g.teacherGroupId||'').trim();
  let idx=-1;
  if(groupId) idx=list.findIndex(x=>String(x?.teacherGroupId||'').trim()===groupId);
  if(idx<0 && code) idx=list.findIndex(x=>String(x?.teacherCode||'').trim().toUpperCase()===code.toUpperCase());
  // 兼容极旧成果：只有在没有稳定身份字段时，才允许使用 assignment 的组序号。
  if(idx<0 && Number.isInteger(Number(g.gi))) idx=Number(g.gi);
  const t=idx>=0?list[idx]:null;
  return {t,teacherIndex:idx};
}

const DEFAULT_TEACHER_CHAPTER_TITLE_RULES = Object.freeze([
  '第1章',
  '第1章 xxx',
  '# 第1章',
  '## 第1章',
  '### 第1章 xxx',
  '## 二、第1章教案'
]);
function getTeacherChapterTitleRules(){
  const cfg=getCfg()||{};
  const raw=Array.isArray(cfg.teacherChapterTitleRules)?cfg.teacherChapterTitleRules:DEFAULT_TEACHER_CHAPTER_TITLE_RULES;
  const out=[]; const seen=new Set();
  raw.forEach(x=>{const v=String(x||'').trim(); if(v&&!seen.has(v)){seen.add(v);out.push(v);}});
  return out.length?out.slice(0,80):Array.from(DEFAULT_TEACHER_CHAPTER_TITLE_RULES);
}
function compileTeacherChapterTitleRule(sample){
  let x=String(sample||'').replace(/\r/g,'').trim();
  if(!x) return null;
  // 用户填写的是“看得懂的样例”，1 是章节号占位符，xxx 是任意标题后缀。
  let markdown='';
  const mm=x.match(/^\s*(#{1,6})\s*/); if(mm){ markdown='^\\s*#{1,6}\\s*'; x=x.slice(mm[0].length); }
  else markdown='^\\s*(?:#{1,6}\\s*)?';
  const ord='(?:[一二三四五六七八九十百千万零〇两]+[、.．]\\s*)?';
  const m=x.match(/^(?:[一二三四五六七八九十百千万零〇两]+[、.．]\s*)?第\s*(\d{1,4})\s*章/);
  if(!m) return null;
  let tail=x.slice(m[0].length);
  let tailRx='';
  if(tail){
    if(/^\s*xxx\b/i.test(tail)) tailRx='(?:\\s+.*)?';
    else tailRx=escapeRegExp(tail).replace(/\\\s\+/g,'\\s*');
  }
  const rx=markdown+ord+'第\\s*(\\d{1,4})\\s*章'+tailRx+'\\s*$';
  try{return new RegExp(rx,'i');}catch(e){return null;}
}
function teacherChapterTitleMatchers(){
  return getTeacherChapterTitleRules().map(compileTeacherChapterTitleRule).filter(Boolean);
}
function teacherChapterNoFromTitleLine(line){
  const src=String(line||'');
  for(const re of teacherChapterTitleMatchers()){
    const m=src.match(re); if(m) return Number(m[1]);
  }
  // 最后保留系统基础容错：即使用户误删默认规则，也不会让老格式失效。
  const m=src.match(/^\s*(?:#{1,6}\s*)?(?:[一二三四五六七八九十百千万零〇两]+[、.．]\s*)?第\s*(\d{1,4})\s*章(?:\s+.*)?\s*$/i);
  return m?Number(m[1]):NaN;
}
function openTeacherChapterTitleRules(gi){
  const ov=document.createElement('div'); ov.className='gs-overlay';
  const rules=getTeacherChapterTitleRules();
  ov.innerHTML=`<div class="gs-modal sc-teacher-cut-modal" style="max-width:620px">
    <div class="gs-modal-head" style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div><b>✂️ 标题识别规则</b></div><button class="gs-x" data-tcr-close>✕</button></div>
    <div style="padding:16px 18px 18px">
      <div style="font-size:12px;line-height:1.7;color:var(--muted);margin-bottom:10px">每行一个“看得懂的章节标题样例”，不需要懂正则。系统会把其中的“第1章”视为章节号模板；可保留 Markdown 标题和中文序号，例如：<code>## 二、第1章教案</code>。</div>
      <textarea data-tcr-rules style="width:100%;min-height:190px;box-sizing:border-box;resize:vertical;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--panel2);color:var(--text);font:13px/1.65 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace">${esc(rules.join('\n'))}</textarea>
      <div style="display:flex;justify-content:space-between;gap:8px;margin-top:10px"><button type="button" class="btn ghost" data-tcr-default>恢复默认</button><span class="muted" style="font-size:12px">保存后立即用于后续切割</span></div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px"><button type="button" class="btn small" data-tcr-cancel>取消</button><button type="button" class="btn primary" data-tcr-save>确认</button></div>
    </div></div>`;
  document.body.appendChild(ov);
  const ta=ov.querySelector('[data-tcr-rules]');
  const close=()=>ov.remove();
  ov.querySelector('[data-tcr-close]').onclick=close; ov.querySelector('[data-tcr-cancel]').onclick=close;
  ov.querySelector('[data-tcr-default]').onclick=()=>{ta.value=DEFAULT_TEACHER_CHAPTER_TITLE_RULES.join('\n');};
  ov.querySelector('[data-tcr-save]').onclick=()=>{
    const vals=String(ta.value||'').split(/\n/).map(v=>v.trim()).filter(Boolean);
    const unique=[]; const seen=new Set(); vals.forEach(v=>{if(!seen.has(v)){seen.add(v);unique.push(v);}});
    const bad=[]; unique.forEach((v,i)=>{if(!compileTeacherChapterTitleRule(v)) bad.push(`第${i+1}行：${v}`);});
    if(bad.length){toast('以下规则无效：'+bad.join('；'));return;}
    const cfg=getCfg()||{}; cfg.teacherChapterTitleRules=unique; saveCfg(cfg); close(); toast('章节标题识别规则已保存，后续切割立即生效');
  };
  ov.addEventListener('click',e=>{if(e.target===ov)close();});
}
function parseTeacherRawChapters(raw, first, last){
  const src=String(raw||'').replace(/\r\n?/g,'\n');
  const out={};
  // 1.0.520：章节边界必须以“完整章标题行”的真实起点/终点为准。
  // 不再通过标题文本重组、trim、substring 偏移来计算边界；标题行本身必须进入该章 rawText。
  const lines=src.split('\n');
  const hits=[];
  let offset=0;
  for(let i=0;i<lines.length;i++){
    const line=String(lines[i]||'');
    const ch=teacherChapterNoFromTitleLine(line);
    if(Number.isFinite(ch)){
      const titleMatch=line.match(/第\s*\d{1,4}\s*章(?:\s+(.*))?$/i);
      const title=String(titleMatch?.[1]||'').replace(/^[\s:：\-–—]+/,'').replace(/[《》【】（）()]/g,'').trim();
      hits.push({ch,title,startLine:i,startOffset:offset});
    }
    offset += line.length + 1;
  }
  for(let i=0;i<hits.length;i++){
    const cur=hits[i];
    const next=hits[i+1];
    const endOffset=next ? next.startOffset : src.length;
    // 从完整章标题行的第一个字符开始，直到下一章完整标题行的第一个字符之前。
    // 不做首尾 trim，避免误删本章标题或第一节；只允许规范化后的 CRLF。
    const rawText=src.slice(cur.startOffset,endOffset);
    if(rawText.trim()) out[cur.ch]={chapter:cur.ch,title:cur.title,rawText,startLine:cur.startLine+1,endLine:next?next.startLine:lines.length};
  }
  const lo=Number.isFinite(Number(first))?Number(first):1;
  const hi=Number.isFinite(Number(last))?Number(last):Infinity;
  const filtered={};
  Object.keys(out).forEach(k=>{ const n=Number(k); if(n>=lo&&n<=hi) filtered[n]=out[k]; });
  return filtered;
}
function getCurrentChapterTeacherRawText(i){
  const chapterNo=Number(i)+1;
  const g=teacherAssignmentGroups().find(x=>chapterNo>=Number(x.first||1)&&chapterNo<=Number(x.last||Infinity));
  if(!g) return '';
  const resolved=teacherResultForAssignmentGroup(g),t=resolved.t;
  const raw=String(t?.chapterCards?.chapters?.[chapterNo]?.rawText||'').trim();
  return raw;
}

function teacherChapterCutLabel(gi){
  const st=teacherChapterCutStatus(gi);
  if(st.status==='no-teacher') return '✂️ 尚无总教案';
  if(st.status==='ready') return `✓ 已切割 ${st.ready}/${st.total}`;
  if(st.status==='partial') return `⚠️ 已切割 ${st.ready}/${st.total}`;
  if(st.status==='stale') return '↻ 需要重新切割';
  return `✂️ 尚未切割 0/${st.total}`;
}
function renderTeacherCutUi(gi){
  const card=document.querySelector(`[data-scp-teacher-card="${gi}"]`);
  if(!card) return;
  const st=teacherChapterCutStatus(gi);
  const status=card.querySelector('[data-scp-cut-status]');
  const btn=card.querySelector('[data-scp-cut-teacher]');
  if(status){
    status.className=`sc-tc-cut-status ${st.status}`;
    status.textContent=teacherChapterCutLabel(gi);
  }
  if(btn){
    // 492 修复：只要当前老师已有“读教案”总教案，就必须允许切割。
    // 不再因为某个缓存状态/完成标记异常而把按钮错误锁死。
    const hasTeacherRaw=!!teacherCurrentResult(Number(gi));
    const cutting=!!state._teacherCutting?.[gi];
    btn.disabled=!hasTeacherRaw || cutting;
    btn.classList.toggle('running',cutting);
    btn.classList.toggle('ready',st.status==='ready');
    btn.textContent=cutting ? '⏳ 切割中…' : (st.status==='ready' ? '↻ 重新切割' : '✂️ 切割教案');
    btn.title=hasTeacherRaw ? '仅切割本老师负责章节，不调用AI' : '请先完成本老师总教案';
  }
  const detail=card.querySelector('[data-scp-cut-detail]');
  if(detail){
    detail.textContent=st.status==='ready' ? `本章纯文本教案已就绪：${st.ready}/${st.total}（原始总教案按章头尾直接切出）` : st.status==='partial' ? `单章教案：${st.ready}/${st.total}，可重新切割补齐` : st.status==='stale' ? '总教案已更新，旧单章卡已失效，请重新切割' : st.status==='no-teacher' ? '请先完成本老师总教案' : `尚未切割本章纯文本教案：0/${st.total}，点击“切割教案”后按章头尾直接切割`;
  }
  const list=card.querySelector('[data-scp-cut-list]');
  if(list) list.innerHTML=renderTeacherCutChapterList(gi);
}
function openTeacherCutConfirm(gi){
  const groups=teacherAssignmentGroups(), g=groups[Number(gi)];
  if(!g){toast('未找到该老师的章节分配');return;}
  const t=teacherCurrentResult(Number(gi));
  if(!t){toast(`老师${Number(gi)+1}总教案尚未生成，请先完成备课`);return;}
  const label=groups.length>1?`老师${Number(gi)+1}（${g.teacherCode||teacherCodeForIndex(Number(gi))}）`:'老师';
  const st=teacherChapterCutStatus(Number(gi));
  const ov=document.createElement('div'); ov.className='gs-overlay';
  ov.innerHTML=`<div class="gs-modal sc-teacher-cut-modal" style="max-width:520px">
    <div class="gs-modal-head" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div><b>✂️ 切割${esc(label)}的单章教案</b></div><button class="gs-x" data-tcut-close>✕</button>
    </div>
    <div style="padding:16px 18px 18px">
      <div style="padding:12px;border-radius:10px;background:var(--panel2);border:1px solid var(--line);line-height:1.75;font-size:13px">
        <div>当前总教案：<b>已生成</b></div>
        <div>负责章节：<b>第${g.first}—${g.last}章</b></div>
        <div>共 <b>${Math.max(0,g.last-g.first+1)} 章</b> · 当前有效单章卡：<b>${st.ready}/${st.total}</b></div>
      </div>
      <div style="margin-top:12px;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--panel2);font-size:12px;line-height:1.7"><b>标题识别规则</b>：当前 ${getTeacherChapterTitleRules().length} 条。可按需要维护，系统会按样例识别“第X章”。<button type="button" class="btn ghost small" data-tcut-rules style="margin-left:8px">⚙️ 编辑规则</button></div><div style="margin-top:12px;font-size:12px;line-height:1.7;color:var(--muted)">将直接读取当前老师“读教案”中的完整原始纯文本，按“第X章”章节边界确定性切出本老师负责的每一章。不会再次调用 AI，也不会修改其他老师；切割只按“第X章”到下一章章头的原始文本边界直接切割；不会解析、重构或生成任何结构化教案。</div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
        <button type="button" class="btn small" data-tcut-cancel>取消</button>
        <button type="button" class="btn primary sc-teacher-cut-confirm" data-tcut-start>✂️ 开始切割</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(ov);
  const close=()=>ov.remove();
  ov.querySelector('[data-tcut-close]').onclick=close;
  ov.querySelector('[data-tcut-rules]').onclick=()=>openTeacherChapterTitleRules(Number(gi));
  ov.querySelector('[data-tcut-cancel]').onclick=close;
  ov.addEventListener('click',e=>{if(e.target===ov)close();});
  ov.querySelector('[data-tcut-start]').onclick=async()=>{close(); await cutTeacherChapterCardsManually(Number(gi));};
}
function renderTeacherCutChapterList(gi){
  const st=teacherChapterCutStatus(gi), g=teacherAssignmentGroups()[Number(gi)];
  if(!g) return '';
  const items=[];
  for(let n=g.first;n<=g.last;n++){
    const c=st.cards?.[n];
    const ok=c&&c.status==='ready'&&String(c.rawText||'').trim();
    items.push(`<span class="sc-tc-cut-item ${ok?'ready':'todo'}">${ok?'✓':'○'} 第${n}章${ok?'（原文）':''}</span>`);
  }
  return items.join(' ');
}
async function cutTeacherChapterCardsManually(gi){return (async()=>{
  if(state._teacherCutting?.[gi])return false;const groups=teacherAssignmentGroups(),g=groups[Number(gi)],t=teacherCurrentResult(Number(gi));
  if(!g||!t){toast(`老师${Number(gi)+1}总教案尚未生成，请先完成备课`);return false;}const source=String(t.raw||'').trim();
  if(!source){toast('当前老师没有可读取的总教案原始纯文本');return false;}state._teacherCutting=state._teacherCutting||{};state._teacherCutting[gi]=true;renderTeacherCutUi(gi);
  try{const rawChapters=parseTeacherRawChapters(source,g.first,g.last),built={};
    for(let n=g.first;n<=g.last;n++){const row=rawChapters[n];if(!row||!String(row.rawText||'').trim())throw new Error(`第${n}章未能从老师总教案中按章头尾切出完整纯文本`);const rawText=String(row.rawText);
      built[n]={chapter:n,title:String(row.title||state.chapters?.[n-1]?.title||'').trim(),status:'ready',cutAt:Date.now(),rawText,rawTeacherPlan:rawText};}
    t.chapterCards={cutAt:Date.now(),total:g.last-g.first+1,ready:Object.keys(built).length,chapters:built,errors:[]};
    await persistCritical('本章纯文本教案切割保存');renderTeacherCutUi(gi);toast(`${groups.length>1?`老师${gi+1}`:'老师'}本章纯文本教案切割完成：${Object.keys(built).length}/${g.last-g.first+1}`);return true;
  }catch(e){console.error('[manualTeacherChapterCut/plain-text]',e);toast(`切割失败：${String(e?.message||e)}`);return false;}finally{delete state._teacherCutting[gi];renderTeacherCutUi(gi);}
})()}

// 1.0.479：全书终章不是4章特判，而是由“总章节数 + 当前章节 + 系统阶段划分”共同决定的全局终止事实。
function novelBoundaryFacts(totalChapterCount, currentChapter){
  const total=Math.max(0,Math.floor(Number(totalChapterCount)||0));
  const chapter=Math.max(0,Math.floor(Number(currentChapter)||0));
  const stages=principalCanonicalStageRows(total);
  const stageIndex=stages.findIndex(x=>chapter>=Number(x.startChapter)&&chapter<=Number(x.endChapter));
  const stage=stageIndex>=0?stages[stageIndex]:null;
  const isFinalChapter=total>0 && chapter===total;
  const isFinalStage=!!stage && stageIndex===stages.length-1;
  const hasNextStage=!isFinalStage && stageIndex>=0 && stageIndex<stages.length-1;
  const hasNextChapter=total>0 && chapter>0 && chapter<total;
  return {totalChapterCount:total,currentChapter:chapter,stageIndex:stageIndex>=0?stageIndex+1:0,totalStages:stages.length,stageId:stage?.stageId||'',stageName:stage?.stageName||'',stageStartChapter:stage?.startChapter||0,stageEndChapter:stage?.endChapter||0,isFinalChapter,isFinalStage,hasNextChapter,hasNextStage,hasNextStageOrChapter:hasNextStage||hasNextChapter};
}

// 三道保险 P1：把“本章剧情边界”从提示词变成程序可读取的契约。
function chapterBoundaryContract(i){const o=state.outline||{},n=i+1,total=realChapterCount()||(o.chapters||[]).length||0,next=(o.chapters&&o.chapters[i+1])||null,boundary=novelBoundaryFacts(total,n);return {chapter:n,total,isLast:boundary.isFinalChapter,isFinalStage:boundary.isFinalStage,hasNextStage:boundary.hasNextStage,nextTitle:next?String(next.title||'').trim():''};}


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

const CHAPTER_AUDIT_SYS=`你是长篇小说“状态与叙事质量审计AI”。你没有创作权，只负责检查正文是否忠实执行本章老师原始教案、上一章真实状态、世界词典，并检查同一章内部的逻辑与文学执行质量。
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
qualityLedger只记录本章正文明确成立或明确新增的信息，禁止脑补；每项尽量≤50字，最多各20项。

【中段合法文学发挥免责】
以下内容本身不得作为FAIL依据：局部误解、人物试探、一次性失败尝试、环境互动、短暂阻碍、潜台词、信息延迟、感官描写、节奏放慢或加速、非核心对白、人物即时心理反应、节点之间自然过桥、同一事件的不同人物反应。
只有当这些发挥进一步造成可验证的硬冲突，例如新增持续性主线、改变核心事件、改变推进节点或顺序、提前完成章末、制造未授权世界规则/核心秘密/核心人物，或破坏时间地点人物关系等既有事实时，才可按真实问题处理。
审计不得把“中段更丰富、更细、更慢、更有表现力”本身当作越界，也不得把“与原稿表达不同”本身当作风格失败；风格检查只关注稳定的风格DNA是否发生明显漂移。`;

async function auditChapterState(i,text){
  if(!isLong()) return null; const o=state.outline||{}, ss=storyState(), c=String(getCurrentChapterTeacherRawText(i)||'').trim(), prev=ss.chapters?.[i-1]?.observed||null, obs=ss.chapters?.[i]?.observed||null;
  if(!c||!obs) return null;
  const g=(state.outline&&state.outline.glossary)||{};
  const canon=`人物:${(g.characters||[]).map(x=>x.name).join('、')}\n地点:${(g.places||[]).map(x=>x.name).join('、')}\n专名:${(g.propernouns||[]).map(x=>x.name).join('、')}\n世界规则:${(g._worldRules||[]).map(x=>x.rule).join('；')}`;
  const banAudit = stateBanEnabled() ? `\n【用户全书禁则·必须审计】\n禁用实体：${banListAllEntityNames().join('、')}\n禁用文本：${banListAllTextItems().join('、')}` : '';
  const tr=_plannedTimeRange(i);
  const user=`【本章老师教案｜原始AI返回内容】${c}\n【时间覆盖核验】起点=${tr.from||'未知'}；终点=${tr.to||'未知'}；跨度=${_timeDaySpan(tr.from,tr.to)==null?'未知':_timeDaySpan(tr.from,tr.to)+'天'}；时间推进安排=无\n【上一章正文结算】${JSON.stringify(prev||{})}\n【本章正文结算】${JSON.stringify(obs)}\n【词典只读实体】${canon}${banAudit}\n【上一章质量账本】${JSON.stringify(ss.chapters?.[i-1]?.qualityLedger||{})}\n【本章已有质量账本】${JSON.stringify(ss.chapters?.[i]?.qualityLedger||{})}\n【本章正文】\n${String(text||'').slice(0,50000)}`;
  try{ const raw=unwrapAIResult(await callDeepSeek(CHAPTER_AUDIT_SYS,user,{maxTokens:3200,temperature:resolveTaskTemperature('chapterAudit'),topP:0.1,signal:_abortCtl?.signal,taskKey:'chapterAudit'})); const j=parseJson(raw)||{}; const ql=j.qualityLedger&&typeof j.qualityLedger==='object'?j.qualityLedger:{}; const normList=k=>Array.isArray(ql[k])?ql[k].map(x=>String(x||'').trim()).filter(Boolean).slice(0,20):[]; const qualityLedger={facts:normList('facts'),introducedInfo:normList('introducedInfo'),characterKnowledge:normList('characterKnowledge'),relationshipChanges:normList('relationshipChanges'),objects:normList('objects'),locations:normList('locations'),unresolved:normList('unresolved'),ts:Date.now(),chapter:i}; const report={status:['PASS','WARN','FAIL'].includes(j.status)?j.status:'WARN',issues:Array.isArray(j.issues)?j.issues.slice(0,30):[],summary:String(j.summary||'').trim(),qualityLedger,ts:Date.now(),chapter:i}; ss.chapters[i].qualityLedger=qualityLedger; o._chapterQualityLedger=o._chapterQualityLedger||{}; o._chapterQualityLedger[i]=qualityLedger; const pt=_timeOrdinal(tr.to), ot=_timeOrdinal(obs.time); if(pt!=null && ot!=null && ot<pt){ report.status='FAIL'; report.issues.unshift({type:'time',severity:'fail',evidence:`正文状态结算时间：${obs.time}`,expected:`本章必须抵达计划终点：${tr.to}`,actual:`正文结算仍早于计划终点约${Math.max(0,pt-ot)}小时`,repair:'补足计划终点前真实发生的时间流逝/阶段性事件，并让章末状态落到计划终点。'}); } else if(pt!=null && ot==null && (_timeDaySpan(tr.from,tr.to)||0)>=1){ report.status=report.status==='FAIL'?'FAIL':'WARN'; report.issues.unshift({type:'time',severity:'warn',evidence:'正文状态结算器未能确认章末日期',expected:`抵达计划终点：${tr.to}`,actual:'无法确认',repair:'复核正文是否真正走到计划终点；必要时补足自然时间过桥。'}); } if(report.issues.some(x=>x.severity==='fail')) report.status='FAIL'; ss.chapters[i].audit=report; persist(); return report; }catch(e){ ss.chapters[i].audit={status:'WARN',issues:[{type:'audit',severity:'warn',evidence:'审计AI不可用',expected:'完成审计',actual:e.message,repair:'稍后重试'}],summary:'审计未完成',ts:Date.now(),chapter:i}; persist(); return ss.chapters[i].audit; }
}
const CHAPTER_REPAIR_SYS=`你是长篇小说“局部修复AI”。你没有改写世界和剧情的权力，只能修复审计指出的最小冲突或明显质量缺陷。
规则：只处理FAIL问题；保持老师原始教案规定的事件、人物、时间、地点和文学风格；不得新增主线事件；不得整章重写。若FAIL属于多日时间跨度不足，允许在原有事件之间加入最小必要的时间过桥/阶段性推进，让正文自然抵达章节卡终点，但不得用一句“几天后”敷衍，也不得改变核心事件顺序。
若FAIL属于信息重复：删除或压缩第二次解释，让后文改写为行动、反应或新后果；若FAIL属于设定化对白：保留人物真实目的，把背景说明改成有目的的交锋、试探、回避、打断或行动；若FAIL属于人物扁平：优先改变人物在当前压力下的选择/反应，补出动机、关系影响或潜台词，但不要强行添加口癖；若FAIL属于人物层次不足：优先改变一个关键行为选择，让其体现目标+关系+压力差异，并确保不改变剧情结果；若FAIL属于人物声音同质：调整信息取舍、回应方式和潜台词，不靠替换口头禅解决；若FAIL属于句式重复：只改明显连续的同构句，不做机械同义词替换；若FAIL属于矛盾：以已经成立的事实为准，用最小修改消除冲突，不得凭空发明解释。
输出严格JSON：{"replacement":"要替换的最小原文片段","newText":"与原文长度大致相当的修复后片段","reason":"修复说明"}`;
const BODY_AUDIT_REPAIR_MAX_ATTEMPTS = 1;
const BODY_AUDIT_REPAIRABLE_TYPES = new Set([
  'repetition','dialogue_exposition','character_flat','character_layer','character_voice','sentence_pattern'
]);
const BODY_AUDIT_HARD_TYPES = new Set([
  'time','location','character','relationship','object','rule','knowledge','event','entity','causal','logic','contradiction'
]);
function classifyChapterAuditFailure(report){
  const fails=(report?.issues||[]).filter(x=>x&&x.severity==='fail');
  if(!fails.length) return {failureCode:'PASS',repairable:false,repairHint:'',failures:[]};
  const types=fails.map(x=>String(x.type||'audit').trim()).filter(Boolean);
  const hard=fails.filter(x=>BODY_AUDIT_HARD_TYPES.has(String(x.type||'').trim()));
  const local=fails.filter(x=>BODY_AUDIT_REPAIRABLE_TYPES.has(String(x.type||'').trim()));
  let failureCode='QUALITY_ERROR';
  if(hard.length) failureCode='CORE_CONTRACT_ERROR';
  else if(types.includes('repetition')) failureCode='REPETITION_ERROR';
  else if(types.includes('dialogue_exposition')) failureCode='DIALOGUE_EXPOSITION_ERROR';
  else if(types.some(t=>t.startsWith('character_'))) failureCode='CHARACTER_EXECUTION_ERROR';
  else if(types.includes('sentence_pattern')) failureCode='SENTENCE_PATTERN_ERROR';
  else if(types.length) failureCode='QUALITY_ERROR';
  const repairable=!hard.length && local.length===fails.length;
  const repairHint=repairable
    ? fails.map(x=>String(x.repair||'').trim()).filter(Boolean).slice(0,3).join('；')
    : '涉及章节事实、时间/地点、人物关系、世界规则、因果或核心事件等硬约束，禁止自动修复，必须人工处理或重新生成。';
  return {failureCode,repairable,repairHint,failures:fails.map(x=>({type:String(x.type||''),evidence:String(x.evidence||''),expected:String(x.expected||''),actual:String(x.actual||''),repair:String(x.repair||'')}))};
}
async function repairChapterByAudit(i,text,report){
  const fails=(report?.issues||[]).filter(x=>x&&x.severity==='fail');
  const classification=classifyChapterAuditFailure(report);
  if(!fails.length || !classification.repairable) return {content:String(text||''),attempted:false,classification};
  const banRepair = stateBanEnabled() ? `\n【用户全书禁则】禁用实体：${banListAllEntityNames().join('、')}；禁用文本：${banListAllTextItems().join('、')}` : '';
  const priorLedger = chapterQualityLedger(i);
  const user=`【本章老师教案｜原始AI返回内容】${getCurrentChapterTeacherRawText(i)}\n【正文审核失败分类】${classification.failureCode}\n【可修复性】仅允许局部修复一次\n【定向修复提示】${classification.repairHint}\n【审计FAIL】${JSON.stringify(fails)}${banRepair}\n【本章已确认质量账本】${JSON.stringify(priorLedger||{})}\n【正文】\n${String(text||'').slice(0,50000)}\n只修复最小冲突，优先修改1-3个最小连续片段；保留所有已经合格的正文、事实、人物状态、老师教案与章节边界；不得新增主线事件，不得整章重写。`;
  try{ const raw=unwrapAIResult(await callDeepSeek(CHAPTER_REPAIR_SYS,user,{maxTokens:3500,temperature:resolveTaskTemperature('chapterRepair'),topP:0.2,signal:_abortCtl?.signal,taskKey:'chapterRepair'})); const j=parseJson(raw)||{}; const old=String(j.replacement||'').trim(), neu=String(j.newText||'').trim(); if(!old||!neu) return {content:String(text||''),attempted:true,classification}; const idx=String(text||'').indexOf(old); if(idx<0) return {content:String(text||''),attempted:true,classification}; const content=String(text).slice(0,idx)+neu+String(text).slice(idx+old.length); return {content,attempted:true,classification}; }catch(e){ return {content:String(text||''),attempted:true,classification,error:String(e&&e.message||e)}; }
}
async function finalizeChapterState(i,text){
  text = enforceChapterBoundary(i, text);
  const obs=await commitChapterObservedState(i,text); if(!obs) return {observed:null,audit:null,content:String(text||''),blocked:false};
  let audit=await auditChapterState(i,text), content=String(text||'');
  const firstClass=classifyChapterAuditFailure(audit);
  if(audit&&audit.status==='FAIL'){
    const repair=await repairChapterByAudit(i,content,audit);
    audit.failureCode=firstClass.failureCode; audit.repairable=firstClass.repairable; audit.repairHint=firstClass.repairHint; audit.repairAttempts=repair.attempted?1:0;
    if(repair.attempted && repair.content!==content){
      content=repair.content;
      assertChapterLocalHardGate(i, content);
      const o=state.outline; o.chapters[i].content=content; updateFactCardFromChapter(i,content); await commitChapterObservedState(i,content);
      audit=await auditChapterState(i,content);
      const afterClass=classifyChapterAuditFailure(audit);
      audit.failureCode=afterClass.failureCode; audit.repairable=afterClass.repairable; audit.repairHint=afterClass.repairHint; audit.repairAttempts=1; audit.repaired=true; audit.repairedAt=Date.now();
      storyState().chapters[i].audit=audit; persist();
    }
    if(audit.status==='FAIL'){
      audit.blocked=true; audit.blockReason=audit.failureCode==='CORE_CONTRACT_ERROR' ? '正文触及核心合同错误，自动修复被禁止。' : '一次局部定向修复后仍未通过正文审核。';
      storyState().chapters[i].audit=audit; persist();
      return {observed:storyState().chapters[i]?.observed||obs,audit,content,blocked:true};
    }
  }
  return {observed:storyState().chapters[i]?.observed||obs,audit,content,blocked:false};
}

async function commitChapterObservedState(i,text){
  if(!isLong()||!String(text||'').trim()) return null;
  const o=state.outline||{}, planText=String(getCurrentChapterTeacherRawText(i)||'').trim(), ss=storyState();
  const user=`【第${i+1}章老师当前教案｜原始AI返回内容】\n${planText}\n【本章正文】\n${String(text).slice(-40000)}`;
  try{
    const raw=unwrapAIResult(await callDeepSeek(CHAPTER_STATE_SYS,user,{maxTokens:1800,temperature:resolveTaskTemperature('chapterState'),topP:0.2,signal:_abortCtl?.signal,taskKey:'chapterState'}));
    const j=parseJson(raw)||{};
    const obs={time:String(j.time||'').trim(),location:String(j.location||'').trim(),characters:j.characters&&typeof j.characters==='object'&&!Array.isArray(j.characters)?j.characters:{},endingState:String(j.endingState||'').trim(),openThreads:Array.isArray(j.openThreads)?j.openThreads.map(x=>String(x||'').trim()).filter(Boolean).slice(0,12):[],newFacts:Array.isArray(j.newFacts)?j.newFacts.map(x=>String(x||'').trim()).filter(Boolean).slice(0,12):[],source:'observed',ts:Date.now()};
    ss.chapters[i]=ss.chapters[i]||{}; ss.chapters[i].observed=obs; ss.chapters[i].observedAt=Date.now();
    const committedTime=obs.time || String(ss.current?.time||'').trim();
    ss.current={chapter:i,time:committedTime,location:obs.location,characters:obs.characters,endingState:obs.endingState,openThreads:obs.openThreads};
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
const SND_ERROR_PRESETS = [
  { id:'er_soft',  name:'错误轻鸣', seq:[[330,0,0.12],[220,0.14,0.22]] },
  { id:'er_low',   name:'低沉警示', seq:[[260,0,0.16],[196,0.18,0.25]] },
  { id:'er_double',name:'双短警报', seq:[[392,0,0.10],[294,0.13,0.10]] },
  { id:'er_alert', name:'紧凑警报', seq:[[440,0,0.09],[330,0.11,0.09],[247,0.22,0.16]] },
  { id:'er_buzzer',name:'低频蜂鸣', seq:[[180,0,0.24],[180,0.27,0.24]] }
];
const SND_EVENT_PRESETS = {
  polish_done:'优化构想完成', dictmaster_done:'词典达人完成', dictEnrich_done:'词典充实完成', chapter_regen_done:'正文重生成完成'
};
const SND_TSINGLE_KEY = (typeof nsKey==='function') ? nsKey('snd_t_beats') : 'tz_snd_t_beats';
const SND_TALL_KEY   = (typeof nsKey==='function') ? nsKey('snd_t_all')   : 'tz_snd_t_all';
const SND_EVENT_KEY_PREFIX = (typeof nsKey==='function') ? nsKey('snd_event_') : 'tz_snd_event_';
const SND_ERROR_KEY = (typeof nsKey==='function') ? nsKey('snd_error_type') : 'tz_snd_error_type';
const SND_ERROR_ENABLED_KEY = (typeof nsKey==='function') ? nsKey('snd_error_enabled') : 'tz_snd_error_enabled';
function _soundStoreGet(key, fallback){ try{ const v=localStorage.getItem(key); return v==null||v===''?fallback:v; }catch(e){ return fallback; } }
function _soundStoreSet(key, value){ try{ localStorage.setItem(key, String(value)); }catch(e){} }
function _sndSingleType(){ const v=_soundStoreGet(SND_TSINGLE_KEY,'be_paper'); return SND_SINGLE_PRESETS.some(x=>x.id===v)?v:'be_paper'; }
function _sndAllType(){ const v=_soundStoreGet(SND_TALL_KEY,'al_piano'); return SND_ALL_PRESETS.some(x=>x.id===v)?v:'al_piano'; }
function setSoundSingleType(id){ if(SND_SINGLE_PRESETS.some(x=>x.id===id)) _soundStoreSet(SND_TSINGLE_KEY,id); }
function setSoundAllType(id){ if(SND_ALL_PRESETS.some(x=>x.id===id)) _soundStoreSet(SND_TALL_KEY,id); }
function _sndEventType(eventKey){
  const legacy = _soundStoreGet(SND_TSINGLE_KEY,'be_paper');
  const v = _soundStoreGet(SND_EVENT_KEY_PREFIX+eventKey, legacy);
  return SND_SINGLE_PRESETS.some(x=>x.id===v)?v:'be_paper';
}
function setSoundEventType(eventKey,id){ if(SND_SINGLE_PRESETS.some(x=>x.id===id)) _soundStoreSet(SND_EVENT_KEY_PREFIX+eventKey,id); }
function _sndErrorEnabled(){ return _soundStoreGet(SND_ERROR_ENABLED_KEY,'1') !== '0'; }
function setSoundErrorEnabled(on){ _soundStoreSet(SND_ERROR_ENABLED_KEY,on?'1':'0'); const el=document.getElementById('cfgSndErrorEnabled'); if(el) el.checked=!!on; }
function _sndErrorType(){ const v=_soundStoreGet(SND_ERROR_KEY,'er_soft'); return SND_ERROR_PRESETS.some(x=>x.id===v)?v:'er_soft'; }
function setSoundErrorType(id){ if(SND_ERROR_PRESETS.some(x=>x.id===id)) _soundStoreSet(SND_ERROR_KEY,id); }
let _lastSoundTs = 0, _lastSoundKind = '', _soundTimer = null;
let _lastErrorSoundSig = '', _lastErrorSoundTs = 0;
function _doPlaySound(kind, eventKey){
  if(!_snd.enabled) return;
  unlockAudio(); if(!_snd.ctx || _snd.ctx.state!=='running') return;
  let lib=SND_SINGLE_PRESETS, id=_sndSingleType();
  if(kind==='all'){ lib=SND_ALL_PRESETS; id=_sndAllType(); }
  else if(kind==='event'){ id=_sndEventType(eventKey); }
  else if(kind==='error'){ if(!_sndErrorEnabled()) return; lib=SND_ERROR_PRESETS; id=_sndErrorType(); }
  const p=lib.find(x=>x.id===id)||lib[0]; (p.seq||[]).forEach(s=>_sndBeep(s[0],s[1],s[2]));
}
function playDoneSound(kind){
  if(!_snd.enabled) return;
  const now=Date.now();
  if(kind==='all'){ if(_soundTimer){clearTimeout(_soundTimer);_soundTimer=null;} _lastSoundTs=now;_lastSoundKind='all';_doPlaySound('all');return; }
  if(kind==='single'){
    if(now-_lastSoundTs<450&&_lastSoundKind==='all') return;
    if(_soundTimer) clearTimeout(_soundTimer);
    _soundTimer=setTimeout(()=>{_soundTimer=null;_lastSoundTs=Date.now();_lastSoundKind='single';_doPlaySound('single');},120);
  }
}
function playEventSound(eventKey){
  if(!_snd.enabled || !SND_EVENT_PRESETS[eventKey]) return;
  const now=Date.now(), sig='done:'+eventKey;
  if(now-_lastSoundTs<250 && _lastSoundKind===sig) return;
  if(_soundTimer){clearTimeout(_soundTimer);_soundTimer=null;}
  _lastSoundTs=now; _lastSoundKind=sig; _doPlaySound('event',eventKey);
}
function playErrorSound(errorKey){
  if(!_snd.enabled || !_sndErrorEnabled()) return;
  const now=Date.now(), sig=String(errorKey||'unknown');
  if(sig===_lastErrorSoundSig && now-_lastErrorSoundTs<1800) return;
  _lastErrorSoundSig=sig; _lastErrorSoundTs=now; _doPlaySound('error');
}
function initThemeSoundPanel(){
  const sb=document.getElementById('cfgSndSingle'), sa=document.getElementById('cfgSndAll');
  const optsB=SND_SINGLE_PRESETS.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  const optsA=SND_ALL_PRESETS.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  if(sb){ if(!sb._tsf){sb.innerHTML=optsB;sb._tsf=1;} sb.value=_sndSingleType(); if(!sb._tsb){sb._tsb=1;sb.addEventListener('change',()=>setSoundSingleType(sb.value));} }
  if(sa){ if(!sa._tsf){sa.innerHTML=optsA;sa._tsf=1;} sa.value=_sndAllType(); if(!sa._tsb){sa._tsb=1;sa.addEventListener('change',()=>setSoundAllType(sa.value));} }
  $$('[data-snd-prev]').forEach(b=>{if(b._tsb)return;b._tsb=1;b.addEventListener('click',ev=>{ev.stopPropagation();playDoneSound(b.dataset.sndPrev);});});
  renderThemeSoundUpgrade();
}
function renderThemeSoundUpgrade(){
  const panel=document.getElementById('themePanel'); if(!panel) return;
  let box=document.getElementById('themeSoundUpgrade');
  if(!box){ box=document.createElement('div'); box.id='themeSoundUpgrade'; box.className='theme-sound-upgrade'; panel.appendChild(box); }
  const opts=SND_SINGLE_PRESETS.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  const rows=Object.entries(SND_EVENT_PRESETS).map(([key,label])=>`<div style="display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:center;margin:7px 0"><span>🔔 ${label}</span><select data-snd-event="${key}" style="min-width:130px">${opts}</select><button type="button" class="btn small ghost" data-snd-event-prev="${key}">▶ 试听</button></div>`).join('');
  const eopts=SND_ERROR_PRESETS.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  box.innerHTML=`<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line,#ddd)"><b>🔔 独立完成提醒</b>${rows}</div><div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line,#ddd)"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><b>⚠️ 出错提醒</b><label style="font-size:12px"><input id="cfgSndErrorEnabled" type="checkbox"> 启用</label></div><div style="display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center;margin-top:7px"><select id="cfgSndErrorType">${eopts}</select><button type="button" class="btn small ghost" data-snd-error-prev>▶ 试听</button></div></div>`;
  box.querySelectorAll('[data-snd-event]').forEach(el=>{el.value=_sndEventType(el.dataset.sndEvent);el.onchange=()=>setSoundEventType(el.dataset.sndEvent,el.value);});
  box.querySelectorAll('[data-snd-event-prev]').forEach(b=>b.onclick=e=>{e.stopPropagation();playEventSound(b.dataset.sndEventPrev);});
  const ee=box.querySelector('#cfgSndErrorEnabled'); if(ee){ee.checked=_sndErrorEnabled();ee.onchange=()=>setSoundErrorEnabled(ee.checked);}
  const es=box.querySelector('#cfgSndErrorType'); if(es){es.value=_sndErrorType();es.onchange=()=>setSoundErrorType(es.value);}
  const ep=box.querySelector('[data-snd-error-prev]'); if(ep) ep.onclick=e=>{e.stopPropagation();playErrorSound('preview');};
}
function reportSoundError(kind, err){
  const msg=err&&err.message?String(err.message):String(err||'未知错误');
  playErrorSound(String(kind||'unknown')+':'+msg.slice(0,120));
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
window.addEventListener('error', e=>{ try{ reportSoundError('global', e&&e.error?e.error:(e&&e.message)||'运行时错误'); }catch(_){} });
window.addEventListener('unhandledrejection', e=>{ try{ reportSoundError('promise', e&&e.reason?e.reason:'未处理的Promise错误'); }catch(_){} });
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
  'contentAdvice', 'assets', 'recipe',
  'titleAdvice','chapterAudit','chapterRepair','chapterState','timeAnchor','recipeAnalysis'];

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
  const _taskModelAlias = { ideaOptimization:'idea', ideaPolishStage2:'idea', dictHarvest:'dictEnrich' };
  const _tm = taskKey ? ((cfg.taskModels||{})[taskKey] || (cfg.taskModels||{})[_taskModelAlias[taskKey]||'']) : null;
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
    ideaTemp:    (cfg.ideaTemp==null ? 0.45 : cfg.ideaTemp),
    principalTemp:(cfg.principalTemp==null ? 0.4 : cfg.principalTemp),
    teacherTemp: (cfg.teacherTemp==null ? 0.4 : cfg.teacherTemp),
    dictmasterTemp: (cfg.dictmasterTemp==null ? 0.4 : cfg.dictmasterTemp),
    dictEnrichTemp: (cfg.dictEnrichTemp==null ? 0.45 : cfg.dictEnrichTemp),
    assetsTemp:  (cfg.assetsTemp==null ? 0.7 : cfg.assetsTemp),
    titleTemp:   (cfg.titleTemp==null ? 0.5 : cfg.titleTemp),
    chapterTemp: (cfg.chapterTemp==null ? 0.5 : cfg.chapterTemp),
    qcTemp:      (cfg.qcTemp==null ? 0.2 : cfg.qcTemp),              // 分任务温度：词库提取（严谨低温）
    stripTemp:   (cfg.stripTemp==null ? 0.8 : cfg.stripTemp),
    subplotTemp: (cfg.subplotTemp==null ? 0.25 : cfg.subplotTemp),    // 分任务温度：支线进度更新（契约类窄采样）
    rollingTemp: (cfg.rollingTemp==null ? 0.3 : cfg.rollingTemp),    // 分任务温度：滚动摘要（忠实压缩）
    contentAdviseTemp: (cfg.contentAdviseTemp==null ? 0.6 : cfg.contentAdviseTemp),  // 分任务温度：内容建议（建议类）
    aiRecipeTemp:(cfg.aiRecipeTemp==null ? 0.85 : cfg.aiRecipeTemp),
    chapterAuditTemp:(cfg.chapterAuditTemp==null ? 0.05 : cfg.chapterAuditTemp),
    chapterRepairTemp:(cfg.chapterRepairTemp==null ? 0.20 : cfg.chapterRepairTemp),
    chapterStateTemp:(cfg.chapterStateTemp==null ? 0.10 : cfg.chapterStateTemp),
    timeAnchorTemp:(cfg.timeAnchorTemp==null ? 0.20 : cfg.timeAnchorTemp),
    recipeAnalysisTemp:(cfg.recipeAnalysisTemp==null ? 0.20 : cfg.recipeAnalysisTemp)
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
    ideaOptimizationStrictQc: state.ideaOptimizationStrictQc === true,
    strategyStage1Status: state.strategyStage1Status,
    strategyStage2Status: state.strategyStage2Status,
    polishSelectedId: state.polishSelectedId,
    polishDiagnosis: state.polishDiagnosis,
    polishFailureTrace: state.polishFailureTrace || null,
    polishStrategies: state.polishStrategies,
    strategicDimensions: state.strategicDimensions,
    strategicDiversityProfile: state.strategicDiversityProfile,
    aiValidationHistory: Array.isArray(state.aiValidationHistory) ? state.aiValidationHistory.slice(-20) : [],
    originalIdeaAnchors: state.originalIdeaAnchors,
    // 1.0.358：只持久化 canonicalStoryStrategy；旧 polishCanonical 仅在加载旧存档时读取一次并迁移。
    canonicalStoryStrategy: state.canonicalStoryStrategy,
    polishRevision: state.polishRevision,
    polishHistory: state.polishHistory,
    polishRawFallback: state.polishRawFallback || '',
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
  state.polishFailureTrace = (p.polishFailureTrace && typeof p.polishFailureTrace === 'object') ? p.polishFailureTrace : null;
  state.polishStrategies = Array.isArray(p.polishStrategies) ? p.polishStrategies : [];
  state.strategicDimensions = Array.isArray(p.strategicDimensions) ? p.strategicDimensions : [];
  state.strategicDiversityProfile = (p.strategicDiversityProfile && typeof p.strategicDiversityProfile === 'object') ? p.strategicDiversityProfile : null;
  state.aiValidationHistory = Array.isArray(p.aiValidationHistory) ? p.aiValidationHistory.slice(-20) : [];
  state.originalIdeaAnchors = (p.originalIdeaAnchors && typeof p.originalIdeaAnchors==='object') ? p.originalIdeaAnchors : null;
  // 1.0.357：Creative Blueprint → canonicalStoryStrategy 是唯一权威事实源。
  // 旧版本可能仍带有 polishCanonical；这里只做一次性迁移，运行态不再创建该字段。
  const legacyPolishCanonical = (p.polishCanonical && typeof p.polishCanonical === 'object') ? p.polishCanonical : null;
  state.canonicalStoryStrategy = (p.canonicalStoryStrategy && typeof p.canonicalStoryStrategy === 'object') ? p.canonicalStoryStrategy : null;
  if(!state.canonicalStoryStrategy && legacyPolishCanonical && legacyPolishCanonical.machineTrace?.status==='adopted'){
    state.canonicalStoryStrategy = Object.assign({}, legacyPolishCanonical, { sourceType:'canonical_story_strategy', sourceVersion:'phase5-migrated', sourceOfTruth:'creativeBlueprint' });
  }
  state.polishPendingSuggestions = (p.polishPendingSuggestions && typeof p.polishPendingSuggestions === 'object') ? p.polishPendingSuggestions : null;
  state.polishRevision = Number.isFinite(+p.polishRevision) ? +p.polishRevision : 0;
  state.strategyStage1Status = ['empty','generating','ready','error'].includes(p.strategyStage1Status) ? p.strategyStage1Status : (state.originalIdeaAnchors && state.strategicDimensions?.length ? 'ready' : 'empty');
  state.strategyStage2Status = ['empty','generating','ready','adopted','error'].includes(p.strategyStage2Status) ? p.strategyStage2Status : (state.polishAdopted ? 'adopted' : (state.polishOptions?.length ? 'ready' : 'empty'));
  state.polishStatus = ['empty','generating','ready_single','waiting_selection','adopted'].includes(p.polishStatus) ? p.polishStatus : ((state.polishAdopted && state.polishOptions?.length) ? 'adopted' : (state.polishOptions?.length>1?'waiting_selection':state.polishOptions?.length?'ready_single':'empty'));
  // 新存档/旧存档中未记录该开关时默认开启；用户明确保存为 false 时保持关闭。
  state.ideaOptimizationStrictQc = (p.ideaOptimizationStrictQc == null) ? true : (p.ideaOptimizationStrictQc === true);
  state.polishHistory = Array.isArray(p.polishHistory) ? p.polishHistory : undefined;
  state.polishRawFallback = typeof p.polishRawFallback === 'string' ? p.polishRawFallback : '';
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
  ensureChapterMiddleShapesForOutline();
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
  ensureChapterMiddleShapesForOutline();
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


// 1.0.514：关键前台流程使用可等待的保存确认，不把关键结果留给浏览器后台异步写入。
async function persistCritical(label){
  ensureChapterMiddleShapesForOutline();
  if(!lib.items.some(i=>i.id===lib.curId)){
    const snap0=projectSnapshot();
    const newId=makeId();
    lib.items.unshift({...snap0,id:newId,updatedAt:Date.now()});
    lib.curId=newId;
  }
  const idx=lib.items.findIndex(i=>i.id===lib.curId);
  if(idx<0) throw new Error(`${label||'关键保存'}失败：当前项目不存在`);
  const snap={...projectSnapshot(),id:lib.curId,updatedAt:Date.now()};
  lib.items[idx]=snap;
  while(lib.items.length>MAX_PROJECTS){
    const others=lib.items.filter(i=>i.id!==lib.curId);
    if(!others.length) break;
    others.sort((a,b)=>(a.updatedAt||0)-(b.updatedAt||0));
    lib.items=lib.items.filter(i=>i.id!==others[0].id);
  }
  const raw=JSON.stringify(snap);
  let storage='ls';
  try{
    if(raw.length<=LS_SINGLE_SAFE){
      localStorage.setItem(lsKeyFor(snap.id),raw);
      const oldIdx=(()=>{try{return JSON.parse(localStorage.getItem(KEY_INDEX))||{};}catch(e){return {};}})();
      const st=(oldIdx.st&&typeof oldIdx.st==='object')?oldIdx.st:{};
      st[snap.id]='ls';
      const ids=lib.items.map(i=>i.id);
      try{localStorage.setItem(KEY_INDEX,JSON.stringify({curId:lib.curId,ids,st}));}catch(e){throw new Error('项目索引保存失败');}
    }else{
      if(typeof idbPut!=='function') throw new Error('浏览器存储不可用：无法确认大项目已保存');
      await idbPut(snap);
      storage='idb';
      const oldIdx=(()=>{try{return JSON.parse(localStorage.getItem(KEY_INDEX))||{};}catch(e){return {};}})();
      const st=(oldIdx.st&&typeof oldIdx.st==='object')?oldIdx.st:{};
      st[snap.id]='idb';
      const ids=lib.items.map(i=>i.id);
      try{localStorage.setItem(KEY_INDEX,JSON.stringify({curId:lib.curId,ids,st}));}catch(e){throw new Error('项目索引保存失败');}
      if(typeof idbGet==='function'){
        const verify=await idbGet(snap.id);
        if(!verify || verify.id!==snap.id) throw new Error('数据库回读校验失败');
      }
    }
  }catch(e){ throw new Error(`${label||'关键保存'}失败：${e?.message||e}`); }
  // 前台立即回读验证，避免 UI 在未真正落盘时显示完成。
  let verified=null;
  try{
    if(storage==='ls') verified=JSON.parse(localStorage.getItem(lsKeyFor(snap.id))||'null');
    else if(typeof idbGet==='function') verified=await idbGet(snap.id);
  }catch(e){}
  if(!verified || verified.id!==snap.id) throw new Error(`${label||'关键保存'}失败：前台回读未确认保存结果`);
  return true;
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
        <span class="ailog-meta">${r.temp!=null?('🌡 '+r.temp):''} · ${r.ms!=null?(r.ms+'ms'):''}${r.finishReason?(' · 结束:'+esc(String(r.finishReason))):''} · <b class="${r.ok?'ok':'err'}">${r.ok?'✓':'✗'}</b>${r.tmo?` · 🎯${esc(String(r.tm||''))}（分任务覆盖）`:''}${r.runId?` · 🔗${esc(String(r.runId))}${r.outerAttempt?` · 外层第${r.outerAttempt}次`:''}`:''}</span>
        <button type="button" class="btn small ghost" data-ailog-toggle="${ri}">展开</button>
      </div>
      <div class="ailog-body hidden" data-ailog-body="${ri}">
        ${r.err?`<div class="ailog-sec"><b>错误：</b><span class="err">${esc(r.err)}</span></div>`:''}
        ${r.principalStages?`<div class="ailog-sec"><b>校长本地阶段耗时：</b><div class="ailog-pre">AI返回=${r.principalStages.aiReturnMs||0}ms｜解析=${r.principalStages.parseMs||0}ms｜清洗=${r.principalStages.sanitizeMs||0}ms｜编译=${r.principalStages.compileMs||0}ms｜标题应用=${r.principalStages.titleApplyMs||0}ms｜写入状态=${r.principalStages.stateWriteMs||0}ms｜持久化=${r.principalStages.persistMs||0}ms｜Render=${r.principalStages.renderMs||0}ms｜AI返回后本地=${r.principalStages.totalLocalMs||0}ms｜总流程=${r.principalStages.totalMs||0}ms｜结果=${esc(String(r.principalStages.status||''))}${r.principalStages.endingAuditWarning?'｜⚠️多样性警告':''}</div></div>`:''}
        ${r.teacherStages?`<div class="ailog-sec"><b>老师本地阶段耗时：</b><div class="ailog-pre">AI返回=${r.teacherStages.aiReturnMs||0}ms｜写入状态=${r.teacherStages.stateWriteMs||0}ms｜持久化=${r.teacherStages.persistMs||0}ms｜Render=${r.teacherStages.renderMs||0}ms｜AI返回后本地=${r.teacherStages.totalLocalMs||0}ms｜总流程=${r.teacherStages.totalMs||0}ms｜结果=${esc(String(r.teacherStages.status||''))}</div></div>`:''}
        <div class="ailog-sec"><b>System · 前500字 / 共 ${(r.sysLen||r.sys.length).toLocaleString('en-US')} 字：</b><div class="ailog-pre">${esc(String(r.sys||''))}</div></div>
        <div class="ailog-sec"><b>User · 前500字 / 共 ${(r.userLen||r.user.length).toLocaleString('en-US')} 字：</b><div class="ailog-pre">${esc(String(r.user||''))}</div></div>
        <div class="ailog-sec"><b>响应 · 前500字 / 共 ${(r.respLen||0).toLocaleString('en-US')} 字${r.finishReason==='length'?' · ⚠️ 截断':''}：</b><div class="ailog-pre">${esc(String(r.resp||''))}</div></div>
        <p class="muted" style="font-size:11px">日志只展示前500字正文；长度字段记录实际请求/响应规模。若结束原因=length，表示AI输出触及上限。旧日志没有结束原因时不代表没有返回。</p>
      </div>
    </div>`;
  }).join('') : '<p class="muted">暂无请求记录。每次实际 AI 调用都会记录（最近 50 条，仅存本机）。</p>';
  const ov = document.createElement('div'); ov.id='ailogPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🗒️ AI 请求日志（${aiLog.length}/50）</b>
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

// 统一温度唯一入口：任务专属温度优先；全局温度只作为没有专属配置时的最终兜底。
// 推荐值仅用于设置界面展示，不参与运行时计算。
const TASK_TEMP_MAP = {
  idea:'ideaTemp', ideaOptimization:'ideaTemp', ideaPolishStage2:'ideaTemp',
  principal:'principalTemp',
  teacher:'teacherTemp',
  dictmaster:'dictmasterTemp',
  dictEnrich:'dictEnrichTemp', dictHarvest:'dictEnrichTemp',
  chapter:'chapterTemp', chapterAudit:'chapterAuditTemp', chapterRepair:'chapterRepairTemp', chapterState:'chapterStateTemp',
  strip:'stripTemp', subplot:'subplotTemp', glossary:'qcTemp', rolling:'rollingTemp',
  contentAdvice:'contentAdviseTemp', assets:'assetsTemp', titleAdvice:'titleTemp',
  recipe:'aiRecipeTemp', recipeAnalysis:'recipeAnalysisTemp', timeAnchor:'timeAnchorTemp'
};
function resolveTaskTemperature(taskKey, explicitTemperature=null){
  const s = resolveActiveSpec(taskKey);
  const field = taskKey ? TASK_TEMP_MAP[taskKey] : null;
  if(field && s[field] != null && isFinite(Number(s[field]))) return _f2(s[field]);
  if(explicitTemperature != null && isFinite(Number(explicitTemperature))) return _f2(explicitTemperature);
  return _f2(s.temperature);
}
async function callDeepSeek(system, user, {temperature=null, topP=null, signal=null, maxTokens=null, onStream=null, retry=2, taskKey=null, runId=null, attempt=null}={}){
  const _t0 = Date.now();
  function isReasonModel(name){
    const n = String(name||'').toLowerCase();
    return /deepseek-reasoner/.test(n)
      || /(^|[-_/\.])(r1|reasoner|reasoning|think|qwq|1210)([-_/\.]|$)/.test(n)
      || /^(o[134](-[a-z0-9]+)?|grok-4-latest-reasoning|kimi-k2-thinking)$/.test(n);
  }
  const _rec = {
    ts: _t0,
    task: taskKey || String(system||'').replace(/\s+/g,' ').slice(0,24),
    temp: (temperature==null ? null : temperature),
    sys: String(system||'').slice(0,500),
    user: String(user||'').slice(0,500),
    sysLen: String(system||'').length,
    userLen: String(user||'').length,
    respLen: 0,
    resp: '', ms: null, ok: false, err: '', finishReason:'', usage:null, tm: taskKey || '', tmo: false,
    runId: runId || null, outerAttempt: Number.isFinite(Number(attempt)) ? Number(attempt) : null
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
          temperature: resolveTaskTemperature(taskKey, temperature),
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
        _rec.resp = String(out).slice(0,50000); _rec.respLen = String(out).length; _rec.finishReason = finishReason; _rec.usage = usage; _rec.ms = Date.now()-_t0; _rec.ok = true;
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
      _rec.resp = String(full).slice(0,50000); _rec.respLen = String(full).length; _rec.finishReason = finishReason; _rec.usage = null; _rec.ms = Date.now()-_t0; _rec.ok = true;
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
      case 'ideaStrategy': return { ...base, rawIdea: state.idea || '' };
      case 'ideaPolishStage2': return { ...base, rawIdea: state.idea || '', multi: !!extra?.multi, originalAnchors: extra?.originalAnchors || state.originalIdeaAnchors || null, strategicDimensions: extra?.strategicDimensions || state.strategicDimensions || [], diversityProfile: extra?.diversityProfile || state.strategicDiversityProfile || null };
      case 'ideaOptimization': return { ...base, rawIdea: state.idea || '', multi: !!extra?.multi, originalAnchors: state.originalIdeaAnchors || null, strategicDimensions: state.strategicDimensions || [], diversityProfile: state.strategicDiversityProfile || null };
      case 'idea': return { ...base, rawIdea: state.idea || '' };
      case 'titles': return { ...base, outline: o, glossary: o.glossary, expectedN: extra?.n || (o.chapters||[]).length };
      case 'chapter': return getChapterTeacherRawTextDirect(extra?.idx);
      case 'subplot': return { ...base, chapterIdx: extra?.idx, content: state.chapters[extra?.idx]?.content, prevLog: (o.glossary?.subplots)||[] };
      case 'glossary': return { ...base, chapterIdx: extra?.idx, content: state.chapters[extra?.idx]?.content, existingGlossary: o.glossary };
      case 'strip': return { ...base, chapterIdx: extra?.idx, content: state.chapters[extra?.idx]?.content, targetZhs: extra?.targetZhs };
      case 'dictmaster': return { ...base, outline: o, candidate: currentCanonicalStoryStrategy() || null };
      default: return base;
    }
  },

};

function getSystemPrompt(kind, extra){
  switch(kind){
    case 'ideaStrategy': return IDEA_STRATEGY_SYS;
    case 'ideaPolishStage2': return IDEA_POLISH_STAGE2_SYS + (extra && extra.multi ? POLISH_MULTI_MODE : POLISH_SINGLE_MODE);
    case 'ideaOptimization': return IDEA_OPTIMIZATION_SYS + (extra && extra.multi ? POLISH_MULTI_MODE : POLISH_SINGLE_MODE);
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
    case 'ideaStrategy': return buildIdeaStrategyUser(ctx);
    case 'ideaPolishStage2': return buildIdeaPolishStage2User(ctx);
    case 'ideaOptimization': return buildIdeaOptimizationUser(ctx);
    case 'idea': return buildIdeaPolishUserFixed(ctx);
    case 'titles': return titlesGenUser(extra);
    case 'chapter': return getChapterTeacherRawTextDirect(extra?.idx);
    case 'subplot': return buildSubplotUser(ctx);
    case 'glossary': return buildGlossaryExtractUser(ctx);
    case 'dictmaster': return buildDictMasterUser(ctx);
    case 'strip': return buildStripUser(ctx);
    default: throw new Error('未知 AI kind: '+kind);
  }
}

function buildIdeaStrategyUser(ctx){
  const lines = [`【原始创作构想】\n${String(ctx.rawIdea || '').trim()}`];
  const wsItems = wsGroupStyleTags(null);
  if(wsItems && wsItems.length){
    const names = wsItems.map(s=>s.name).join(' + ');
    const details = wsItems.map(s=>`· ${s.name}：${s.note||''}${Array.isArray(s.tips)&&s.tips.length?`（写法：${s.tips.join('；')}）`:''}`).join('\n');
    lines.push(`【用户已锁定写作风格】\n${names}\n${details}`);
  }
  const bb=currentBookBeatCfg(), mb=currentBeatCfg(), cc=chapterCountVal();
  const parts=[];
  if(bb) parts.push(`全书拍子·${bb.label}（${bb.subtitle}）\n阶段：${((bb.ai&&bb.ai.stages)||[]).join(' → ')}`);
  if(mb) parts.push(`章节微拍·${mb.label}${mb.wc?`（${mb.wc}）`:''}`);
  if(cc) parts.push(`全书章节数：${cc} 章`);
  if(parts.length) lines.push(`【已有叙事结构上下文】\n${parts.join('\n\n')}`);
  lines.push(`【阶段边界】\n本次只分析“原始构想核心锚点 + 动态战略维度”。不要生成最终方案。`);
  return lines.join('\n\n');
}

function buildIdeaOptimizationUser(ctx){
  const wsItems=wsGroupStyleTags(null);
  const style=wsItems&&wsItems.length?wsItems.map(s=>`${s.name}：${s.note||''}${Array.isArray(s.tips)&&s.tips.length?`（写法：${s.tips.join('；')}）`:''}`).join('\n'):'（未额外锁定写作风格）';
  const bb=currentBookBeatCfg(), mb=currentBeatCfg(), cc=chapterCountVal();
  const parts=[];
  if(bb) parts.push(`全书拍子：${bb.label}（${bb.subtitle}），阶段：${((bb.ai&&bb.ai.stages)||[]).join(' → ')}`);
  if(mb) parts.push(`章节微拍：${mb.label}${mb.wc?`（${mb.wc}）`:''}`);
  if(cc) parts.push(`全书章节数：${cc}`);
  if(cc){ const plan=bookStagePlan(cc); if(plan&&plan.length){let cur=0; const seg=[]; plan.forEach(x=>{const a=cur+1;cur+=x.n;seg.push(`第${a}—${cur}章「${x.name}」`);}); parts.push(`章节↔全书拍子落位：${seg.join('；')}`);} }
  const upstreamRules = [];
  if(state._narrIron!==false) upstreamRules.push(NARRATIVE_IRON_PLANNING);
  const ban = banListBlockFor('ideaOptimization');
  if(ban) upstreamRules.push(ban);
  upstreamRules.push('【人物命名边界】优化构想只负责人物角色需求、功能、关系、性格与发展方向。除非用户原始构想已经明确给出正式姓名，否则不得创造新的正式人物姓名；未正式命名的人物必须使用稳定人物ID，如 CHAR_001、CHAR_002。正式姓名由后续词典达人统一确定。');
  upstreamRules.push('【世界与规则边界】可以提出“世界与规则”的战略蓝图，用于说明世界如何服务故事，但不要建立第二套正式世界知识库，不要擅自定稿与词典达人冲突的核心世界事实；最终正式世界事实由词典达人建立并登记。');
  return `【原始用户构想】\n${String(ctx.rawIdea||'').trim()}\n\n【用户锁定写作风格】\n${style}\n\n【已有叙事结构】\n${parts.join('\n')||'（无额外结构）'}\n\n【输出模式】\n${ctx.multi?'多方案：3—5个真正不同的优化构想。':'单方案：只生成1个最终优化构想。'}\n\n【核心任务】\n一次完成“原始构想提炼 → 动态战略分析 → 优化构想生成”。战略分析是内部中间层，不要把它写成独立操作步骤；但必须按纯文本格式输出动态战略维度，供方案形成差异化依据。`;
}
function buildIdeaPolishStage2User(ctx){
  const anchors = ctx.originalAnchors || {};
  const dims = Array.isArray(ctx.strategicDimensions) ? ctx.strategicDimensions : [];
  const dp = ctx.diversityProfile || null;
  // 第二阶段不再重复发送3万字级原始构想；第一阶段已经把原始事实压缩成只读锚点。
  const wsItems = wsGroupStyleTags(null);
  const style = wsItems && wsItems.length ? wsItems.map(s=>`${s.name}：${s.note||''}${Array.isArray(s.tips)&&s.tips.length?`（写法：${s.tips.join('；')}）`:''}`).join('\n') : '（未额外锁定写作风格）';
  const bb=currentBookBeatCfg(), mb=currentBeatCfg(), cc=chapterCountVal();
  const structure = [
    bb ? `全书拍子：${bb.label}（${bb.subtitle}），阶段：${((bb.ai&&bb.ai.stages)||[]).join(' → ')}` : '',
    mb ? `章节微拍：${mb.label}${mb.wc?`（${mb.wc}）`:''}` : '',
    cc ? `全书章节数：${cc}` : ''
  ].filter(Boolean).join('\n');
  return `【第二阶段专用紧凑输入包】\n本阶段只读取第一阶段已经确认的权威事实，不重新读取原始长文本。\n\n【原始构想核心锚点·只读】\n${JSON.stringify(anchors)}\n\n【动态战略维度·只读】\n${JSON.stringify(dims)}\n\n【战略多样性边界·只读】\n${JSON.stringify(dp)}\n\n【用户锁定写作风格】\n${style}\n\n【已选叙事结构】\n${structure||'（无额外结构）'}\n\n【第二阶段任务】\n基于以上第一阶段权威输入，生成最终${ctx.multi?'3—5个':'1个'}优化构想方案。不要重新生成战略地图；不要使用固定五向。每个方案必须体现不同的战略组合和独立战略指纹；新增创意必须直接融入对应结构块，不能伪装成用户已确认事实。`;
}

function buildIdeaPolishUserFixed(ctx){
  const lines = [`【用户构想】\n${String(ctx.rawIdea || '').trim()}`];
  const wsItems = wsGroupStyleTags(null);
  if(wsItems && wsItems.length){
    const names = wsItems.map(s=>s.name).join(' + ');
    const details = wsItems.map(s=> `· ${s.name}：${s.note||''}${Array.isArray(s.tips)&&s.tips.length?`（写法：${s.tips.join('；')}）`:''}`).join('\n');
    lines.push(`【用户已锁定的写作风格（所有方案必须严格服从的最高基准）】\n已选定风格：${names}\n风格核心要求：\n${details}\n【继承＋补充硬性要求】优化构想必须先忠实继承上述已选词条及其完整含义；只有根据当前实际选项与故事确有明确风格缺口时，才允许新增“补充”词条。补充不是机械化步骤；没有明确缺口就必须写“无”。每个新增补充词条必须拥有独立词条名称、定义、详细属性、核心特征、具体表现、具体例子和补充原因。继承与补充最终必须单独写入【WRITING_STYLE_INHERITANCE_SUPPLEMENT】区域，作为下游唯一权威风格资料，不得只写一个标签或代号。`);
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
    ideaStrategy: [],
    ideaPolishStage2: [],
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

function markAIDone(kind, save=true){
  state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!==kind);
  state.aiNetwork.completed = Array.from(new Set([...(state.aiNetwork.completed||[]), kind]));
  if(save) persist();
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
  const creative = ['idea','ideaOptimization','principal','teacher','chapter','planner','outline'];
  const banRoles = ['idea','ideaOptimization','titles','dictmaster','dictEnrich','principal','teacher','chapter'];
  const parts=[];
  if(banRoles.indexOf(kind)>=0){
    const ban=banListBlockFor(kind);
    if(ban) parts.push(ban);
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
用户原始核心 → 主角欲望 → 核心矛盾 → 持续压力 → 阶段性目标 → 关系变化 → 中段升级 → 关键转折 → 高潮推进 → 收束方式 → 可继续写的尾部余波。

“可写成一部小说”不等于替后续 AI 写完整章节。你输出的是高密度故事蓝本：足够具体，让词典达人、校长、老师、正文AI都能继续工作；但不要把内容锁死到逐章教案。

【第三原则：用户事实优先】
用户明确写出的题材、主角、身份、世界观、核心能力、关系、冲突、时代、风格、固定名称必须保留。不得为了所谓“更商业”而偷换。
AI可以深化：人物动机、冲突机制、故事动力、长期悬念、关系张力、阶段目标、高潮与收束方式、必要的世界规则。
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
小说简介不是广告文案，也不是营销分析。必须包含足够的创作信息：主角处境、世界背景、核心冲突、主要行动动力、故事如何展开、长期悬念/成长方向、主要关系张力以及后续收束所需的因果条件。
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
      "optimizedIdea":"完整故事创作蓝本，允许较长，包含主角、世界、冲突、人物关系、故事发动机、长期发展、高潮与阶段推进",
      "originalAnchors":{"characters":[],"relationships":[],"goals":[],"coreConflict":"","worldRules":[],"fixedFacts":[]},
      "strategicDimensions":[{"name":"动态战略维度名称","description":"该维度如何展开故事","whyFit":"为什么适合当前故事"}],
      "diversityProfile":{"fixedCore":[],"variableAxes":[],"avoidRepetition":[],"recommendedMix":""},
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
7. 关键悬念、转折、高潮推进与收束所需的因果条件；
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

const IDEA_STRATEGY_SYS = `你是本项目的“故事战略分析引擎”。本阶段只做战略分析，不生成最终优化方案。

【唯一任务】
根据用户当前故事构想、题材、人物、核心冲突、世界规则、写作风格和已有上下文，提取用户原始构想核心锚点，并动态生成6—10个最契合当前故事的候选战略维度。

【绝对禁止】
1. 禁止使用固定的“商业/反差/情感/悬疑智斗/轻松日常”五向模板。
2. 禁止为了凑数把通用标签硬套进故事。
3. 本阶段不要生成3—5个最终优化方案，不要写完整小说蓝本，不要输出书名、简介或全书节拍。

【动态维度原则】
战略维度必须由当前题材和故事本身决定。例如武侠可能偏向江湖成长、门派权谋、复仇、探案、群像、武学探索；科幻可能偏向技术伦理、生存危机、太空冒险、AI关系、社会变革、宇宙探索；言情可能偏向关系成长、错位关系、婚姻现实、慢热、强冲突、群像。但这些只是示例，不得照抄或固定化。

【输出】
只输出JSON，不要Markdown，不要解释：
{
  "originalAnchors":{"characters":[],"relationships":[],"goals":[],"coreConflict":"","worldRules":[],"fixedFacts":[]},
  "strategicDimensions":[{"name":"","description":"","whyFit":""}],
  "diversityProfile":{"fixedCore":[],"variableAxes":[],"avoidRepetition":[],"recommendedMix":""}
}

【质量要求】
- strategicDimensions必须为6—10个。
- diversityProfile必须明确区分“不能变的核心”和“可以变化的轴”，并指出应避免的重复模式。
- 每个维度必须真正不同，并说明如何展开故事以及为什么适合当前故事。
- 必须额外判断哪些内容属于全书不能轻易改变的核心，哪些属于可在后续方案中变化的战略轴，并输出diversityProfile。
- diversityProfile不是鼓励随机，而是防止长期创作被单一战略、单一冲突模式、单一节奏或单一人物功能绑死；固定核心必须保护，变化轴必须允许组合和轮换。
- originalAnchors只记录用户已经明确给出或可以从其构想直接确认的核心事实；不要把AI新增创意伪装成用户事实。`;

const IDEA_OPTIMIZATION_SYS = `你是本项目的“优化构想引擎”。你必须在一次生成中完成过去两个阶段的全部工作，但对用户只呈现“优化构想”，不要把“战略维度”做成独立步骤。

【内部流程】
1. 先从用户原始构想中提取原始构想核心锚点；
2. 再动态分析6—10个最契合当前故事的战略维度；
3. 再利用这些战略维度和多样性边界生成最终优化构想；
4. 战略维度只是内部分析层，最终必须与方案一起输出为可读的纯文本。

【禁止】
- 禁止JSON、Markdown代码块、表格JSON或任何机器对象格式。
- 禁止把战略分析单独当成一个用户步骤。
- 禁止固定“五向”模板。
- 禁止把AI新增内容伪装成用户事实。
- 禁止优化构想自行创造新的正式人物姓名。优化构想只负责“需要什么人物、人物功能、性格、关系、发展方向”，未在用户原始构想中明确命名的人物必须使用稳定ID：CHAR_001、CHAR_002、CHAR_003……。
- 如果用户原始构想已经明确给出某人物姓名，可以原样继承；除此之外不得自己起名。
- CHAR_xxx 是人物身份引用ID，不是最终姓名；最终正式姓名由后续“词典达人”一次性统一命名并写入Foundation Dictionary。
- 人物关系中也只能引用已经存在的正式姓名或CHAR_xxx，绝不能通过关系字段偷偷创造新人物姓名。

【继承＋补充写作风格资料硬约束】
每个方案必须单独形成一个【WRITING_STYLE_INHERITANCE_SUPPLEMENT】区块。先完整继承用户已选写作风格词条；再依据当前方案实际存在的风格缺口判断是否补充。补充可以新造词条，但只有存在明确缺口才允许出现；没有明确缺口必须为“无”。每个补充词条必须完整提供id、name、definition、attributes、features、manifestations、examples、reason。继承词条也必须提供id、name、definition、attributes、features、manifestations、examples。该区块是优化构想下游传导的唯一权威写作风格资料；不得让校长或老师通过猜测、代号或重新生成来获得词条含义。

【唯一标准输出协议】
AI只需要生成一种事实源：每个方案的“结构式创作蓝图”。不得让旧字段与结构蓝图形成两套独立事实。

必须先输出：
【原始构想锚点】
人物：...
关系：...
目标：...
核心冲突：...
世界规则：...
固定事实：...

【动态战略维度】
1. 维度名｜维度描述｜契合：为什么适合
2. ...
至少6项，最多10项。

【战略多样性】
固定核心：...
可变轴：...
避免重复：...
推荐组合：...

随后输出最终方案。单方案时只输出一个“方案一”，多方案时必须输出3—5个方案。每个方案必须以“【方案一｜名称】”这种形式开始。除方案标题外，禁止再生成“Human View版”“机器版”“旧字段版”“兼容版”或第二套等价故事内容。每个方案只允许存在一份结构式创作蓝图，所有用户可读内容和程序字段都由JS从这份蓝图派生。

【结构式创作蓝图｜唯一且唯一输出的事实源】
每个方案必须完整输出以下区块。标签必须完全保留；字段使用“字段=内容”，列表使用“- 内容”。
[OPTION_META]
name=方案名称
bookTitle=书名
[/OPTION_META]
[STORY_CORE]
genre=...
tone=...
core_promise=...
story_question=...
[/STORY_CORE]
[PROTAGONIST]
personId=CHAR_001（如果用户已明确姓名仍必须保留稳定ID）
name=用户已明确的正式姓名；否则写CHAR_001
identity=...
goal=...
motivation=...
flaw=...
growth=...
[/PROTAGONIST]
[KEY_CHARACTERS]
- CHAR_002或用户已明确的正式姓名｜身份｜作用｜与主角关系（新人物必须用CHAR_xxx，不得自行起正式姓名）
[/KEY_CHARACTERS]
[RELATIONSHIPS]
- 人物A｜人物B｜关系与变化方向
[/RELATIONSHIPS]
[WORLD]
time=...
setting=...
world_summary=...
[/WORLD]
[CONFLICT]
surface=...
deep=...
character=...
final=...
[/CONFLICT]
[STORY_ARC]
phase_1=...
phase_2=...
phase_3=...
phase_4=...
phase_5=...
[/STORY_ARC]
[FULL_BOOK_BEAT]
- 阶段一：...
- 阶段二：...
- 阶段三：...
- 阶段四：...
- 阶段五：...
[/FULL_BOOK_BEAT]
[WRITING_STYLE_INHERITANCE_SUPPLEMENT]
supplementStatus=none或present
source=optimization_concept
INHERITANCE
- id｜name｜definition｜attributes｜features｜manifestations｜examples
SUPPLEMENTS
- id｜name｜definition｜attributes｜features｜manifestations｜examples｜reason
[/WRITING_STYLE_INHERITANCE_SUPPLEMENT]

【一致性原则】
- 结构式创作蓝图内部不得自相矛盾。
- Human View、canonicalStoryStrategy以及后续章节/场景流程都必须由这套蓝图派生。
- AI不得同时生成Human View和Machine View两份内容；只生成这一份结构蓝图。
- AI不得在同一方案中重复写“完整优化构想/小说简介/全书节拍”等第二套平行版本。
- 不得再输出旧字段版或兼容字段版的第二套故事事实。
- 原始构想锚点只能记录用户明确给出的事实；AI新增内容必须直接落在对应结构块中，不得建立第二套平行字段。
- 不得输出JSON，不得输出Markdown代码块。

【质量要求】
- originalAnchors只记录用户明确事实或可直接确认的事实。
- strategicDimensions必须动态、具体、彼此有明显区别。
- 多方案之间必须有真实战略差异，不得只是换名字。
- 固定核心不能被方案差异破坏；可变轴要形成有意义的组合。
- fullBookBeat是全书故事节拍/阶段推进蓝本，不是逐章教案。
- 不单独输出novelSummary、optimizedIdea等旧版平行字段；需要这些内容时由JS从结构蓝图派生。
- 严格服从用户已锁定的写作风格和叙事结构。
- 只输出上述纯文本，不要解释过程，不要输出JSON。`;

const IDEA_POLISH_STAGE2_SYS = IDEA_POLISH_SYS_PRO + `

【真实两阶段流水线·第二阶段硬约束】
你现在处于第二阶段。第一阶段已经独立完成了原始构想核心锚点和动态战略地图。你必须把下面用户消息中提供的【第一阶段战略分析结果】视为本次战略规划的权威输入。
- 禁止重新生成一套新的战略维度。
- 禁止回退到固定五向。
- 必须从提供的6—10个战略维度中组合、取舍、交叉，生成3—5个真正不同的最终方案。
- 每个方案的strategicDimensions必须来自或明确组合第一阶段提供的维度。
- 所有方案共享第一阶段originalAnchors中的用户事实底盘。
- 必须使用第一阶段diversityProfile：固定核心不得被多样化破坏；变量轴应在3—5个方案之间形成有意义的组合差异，避免所有方案只是换名字。
- 第一阶段没有确认的新增内容可以直接融入对应方案结构，但不得伪装成用户已确认事实。
- 本阶段唯一产物是最终options，不再输出独立的战略分析步骤。`;

const IDEA_POLISH_SYS = IDEA_POLISH_SYS_PRO;

const POLISH_SINGLE_MODE = `
【单方案执行层】本次只生成一个最终优化方案，不得输出多个方向、方案A/B/C或并列候选。可用统一兼容结构 options，但数组必须恰好只有1项。该方案直接作为唯一可采用方案；不得隐藏第二方案。AI新增的核心人物、关键设定、关键关系、关键剧情必须标记为建议/待确认，不得伪装成用户已确认事实。
`;

const POLISH_MULTI_MODE = `
【多方案执行层】
本次必须按用户输入的真实需求进行受控分叉。先理解，再扩展；先锁定共同事实底盘，再产生不同故事发展路线。
默认保留3—5个高质量方案；明显不适配的方向不要硬凑。

【重要】所有方案只允许输出同一份结构式创作蓝图；bookTitle、小说简介、全书节拍、导航灯塔等用户视图/程序字段一律由JS从蓝图派生，不得在AI输出中另写一份。
【重要】如果用户输入包含多个想法、人物、设定或要求，必须先整合它们之间的关系，再输出真正能写成小说的方案，而不是只改写原句。
【重要】如果输入很短，允许主动补齐合理的主角动机、阻力、阶段目标、关系张力、长期悬念和收束所需条件，但这些新增内容必须直接融入对应方案结构，不得伪装成用户已经确认的事实。
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
  const txt = unwrapAIResult(await callDeepSeek(TIME_ANCHOR_SYS, user, {maxTokens: clampMaxTokens('json'), temperature:resolveTaskTemperature('timeAnchor'), topP: 0.5, taskKey:'timeAnchor'}));
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
function openTimelineBoard(){ toast('全局时间线已移除；时间承接以当前老师教案与正文状态结算为准。'); }

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
【世界观规则硬约束】世界观规则只来自随后用户上下文中的“词典正式世界观规则”区块；它是全局硬约束，不是本章剧情、老师教案或写作建议。正文必须遵守，不得改写、总结、扩写、另造第二份，也不得把老师教案中的局部剧情应用当成新的规则源。正文上下文中只应以这一份正式规则为准。
你是长篇小说的「正文作家（学生）」，只专注文学笔力、对白交锋与生动场面铺展。你的输入不是互相竞争的几份提示词，而是一条有权限层级的创作链。
【正文AI内部工作顺序｜必须先理解，再动笔】
1. 先完整阅读并整合“上下文理解包”。
2. 再逐项核对老师本章教案与已提供的小说状态数据：区分“已发生事实”与“本章计划”。
3. 再确定第一段的真实承接点、人物当前状态、信息边界与事件因果。
4. 再按老师教案的事件顺序写成连续小说，不输出分析、计划、节拍标签或后台术语。
5. 写作过程中，在不改变老师原始教案、已成立事实和章末状态的前提下，充分利用合法文学空间进行现场创作；允许自然增加人物反应、对白、潜台词、信息延迟、局部误解、失败尝试、环境互动、短障碍、感官细节与节奏变化，不重新设计主线。
6. 【正文动笔前内部自检｜不输出】完整阅读本章教案纯文本，确认章头、章中、章末、人物状态与时间边界；不得寻找、重建或依赖任何结构化教案。
7. 一旦本章最后一个必要事件完成且章末状态成立，立即停止；不要为了字数继续。

你的目标不是“写够多少字”，而是“把已经确定的故事写完整、写自然、写得像真正发生过”。

· L1【世界事实层】：词典达人 + 词典充实已经批准的世界、人物、地点、专名、规则；这是“世界是什么”，不得私自改写。
· L2【本章规划层】：老师本章原始教案；这是“本章写什么”。老师已经承接并转译上游必要信息，正文必须以这份教案作为本章剧情与执行方向的唯一规划来源。
· L3【动态状态层】：上一章正文结算状态、物理接力、时间合同；这是“故事现在实际在哪里”。它优先决定开笔的真实状态，不能为了迎合教案而篡改上一章已经写成的事实。
· L4【文学表达层】：风格、语言、节奏与场景表现；这是“怎么写”。
任何层级都不能反向覆盖更高权威层。允许你发挥的是文学表达，以及教案允许的中间动作/细节；不允许你凭空重定义世界事实、时间状态或主线结果。
· 【上一章状态承接】若存在，以系统已提供的上一章结算状态作为开笔事实依据；若为首章，则执行第一章开篇任务卡。
· 【转场过桥律】：若上一章状态与本章纯文本教案存在时空跨度，必须在首段顺势用 1~2 句自然笔法交代时空流转或环境位移，平滑过桥。
· 【核心主线防发散律】：正文作家不重新设计主线。词典资源由老师按章调配；正文只使用老师点名的核心人物/设定。对于不影响主线的现场动作、对话、环境和一次性过场人物，可以自然发挥，但不能创造会持续影响后文的新核心事实。
· 【场景过场路人与临时龙套点缀权】：正文作家可根据具体场景的叙事与氛围需要，自然点缀店小二、摊贩、茶客、更夫、传令兵、前台侍者等过场闲人。
  - 授权纪律：允许现场自然拟定称谓或名字，写一两句动作或对话即止，只作环境气氛烘托；
  - 边界红线：此类路人龙套只在当前场景出现一次，绝不推动主线，后续剧情不会再次登场，亦不计入词典，点到即收；严禁喧宾夺主或抢占主角/教案核心人物戏份。
· 【成篇写法与自然收束】：按教案推进骨架顺序自然流淌推进，相邻环节自然过渡融合；剧情完整并抵达章末状态后自然收束，不按数字机械收尾，严禁逐拍写标签或写散装提纲。
· 【教案来源】：正文AI只读取上方老师原始教案文本；不得把老师原文转换成结构化教案、施工单元、场景计划或第二套剧情骨架。正文可以在老师原文允许的文学空间内自然扩写多个场面，但不得凭空建立新的教案体系。正文始终输出自然小说文本。标点、空格、Markdown、段落格式均不是剧情审核条件。
`;
  // 正文系统提示只保留稳定的写作规则；本章剧情与三层文学 DNA 均由老师原始教案提供，避免形成第二套动态内容来源。
  return closedGate + '\n\n' + base;
}

const longChapterSys = () => {
  const parts = [];
  // 正文不再把老师教案当作逐句小说原稿；本章写法只以老师原始教案为剧情依据，同时保留正文AI的合法文学发挥。
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
  if(currentStep===1) optButtonStateClass();
  // 主故事页的 #polishCards 是两阶段流水线的可见结果区：
  // 合并后：战略地图仅作为内部分析状态保存；用户界面直接展示3～5个优化构想方案。
  if(currentStep===1){
    const _pc = $('#polishCards');
    if(_pc) renderPolishCards(_pc);
  }
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
  ['词','[data-flow="7.5"], [data-flow="8.5"], .card-theme-glossary, .gs-card'],     // 基础词典：全书共享事实数据库
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
  const noPlan = [];
  for(let i=0;i<totalN;i++) if(!getCurrentChapterTeacherRawText(i)) noPlan.push(i+1);
  if(noPlan.length) rows.push(`<div class="chk-item bad">✗ 当前老师教案缺失：第 ${noPlan.join('、')} 章尚无可用本章教案</div>`);
  else if(totalN) rows.push(`<div class="chk-item ok">✓ 全部 ${totalN} 章均可读取当前老师本章教案</div>`);
  rows.push(`<div class="chk-item ok">✓ 时间承接以当前老师教案的“剧情时间落点”与正文状态结算为依据；不再依赖全局时间线。</div>`);
  return rows.join('');
}
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
  const mem=ensureLongMemory();
  const total=realChapterCount()||((state.outline?.chapters||[]).length)||0;
  const next=[];
  for(let i=0;i<total;i++){
    const p=String(getCurrentChapterTeacherRawText(i)||'').trim(); if(!p) continue;
    const text=JSON.stringify(p);
    const m=text.match(/(?:埋设伏笔|伏笔|埋伏笔)[\s\S]{0,180}?([^，,；;。\n]{2,60})/);
    const f=String(m?.[1]||'').trim();
    if(!f || /^(无|暂无|没有)$/i.test(f)) continue;
    const later=(state.chapters||[]).slice(i+1).map(c=>String(c&&c.content||'')).join('\n');
    const key=f.replace(/[「」“”【】（）()]/g,'').split(/[，,；;。]/)[0].trim().slice(0,18);
    const recovered=key && later.includes(key);
    next.push({id:`${i+1}-${key}`,chapter:i+1,text:f.slice(0,180),status:recovered?'suspected-recovered':'open'});
  }
  mem.foreshadow=next.slice(-120); mem.lastAuditAt=Date.now(); return mem.foreshadow;
}

function longNovelMemoryData(){
  const o=state.outline||{}, g=o.glossary||{}, idx=currentWrittenIndex();
  const dig=Array.isArray(o._chapterDigests)?o._chapterDigests:[];
  const fc=o._factCard||{};
  const plan=idx>=0 ? String(getCurrentChapterTeacherRawText(idx)||'').trim() : "";
  const prev=idx>=0?state.chapters[idx]:null;
  const time=(fc.timeAnchors||[]).find(x=>x && x.ch===idx);
  const mem=ensureLongMemory();
  if(!mem.foreshadow.length && plansExist(o)) refreshForeshadowBank();
  return {o,g,idx,digest:idx>=0?(dig[idx]&&dig[idx].text||''):'',fc,plan,prev,time,foreshadow:mem.foreshadow};
}

function plansExist(o){ const total=(o?.chapters||[]).length||realChapterCount()||0; for(let i=0;i<total;i++) if(getCurrentChapterTeacherRawText(i)) return true; return false; }

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
  const o=state.outline||{}; const total=(o.chapters||[]).length||0; const written=writtenChapterCount();
  const rows=[];
  for(let i=0;i<Math.min(total,written+4);i++){
    const p=String(getCurrentChapterTeacherRawText(i)||'').trim(); const b=p; const a=p; const z=p.slice(-500);
    if(b||a||z) rows.push(`<div class="lm-causal-row"><span>第${i+1}章</span><div><b>${esc(b||'承接既有状态')}</b><span>→ ${esc(a||'推进本章教案事件')}</span><span>→ ${esc(z||'形成下一章接口')}</span></div></div>`);
  }
  return rows.length?rows.join(''):'<div class="muted">尚无足够章节教案可形成因果地图。</div>';
}

function relationshipTrajectoryHtml(){
  const g=(state.outline&&state.outline.glossary)||{}, rel=Array.isArray(g._relationshipTable)?g._relationshipTable:[];
  if(!rel.length) return '<div class="muted">词典尚无关系表；词典达人产出后这里会自动显示。</div>';
  return `<div class="lm-rel-grid">${rel.slice(0,24).map(x=>`<div class="lm-rel"><b>${esc(x.a||'?')}</b><span>↔ ${esc(x.relation||'关系')} ↔</span><b>${esc(x.b||'?')}</b>${x.note?`<small>${esc(x.note)}</small>`:''}</div>`).join('')}</div>`;
}

function seamAuditHtml(){
  const written=writtenChapterCount(); if(written<2) return '<div class="muted">至少完成 2 章后才能进行章间接缝检查。</div>';
  const rows=[];
  for(let i=Math.max(1,written-5);i<written;i++){
    const prev=state.chapters[i-1];
    const tail=String(prev&&prev.content||'').trim().slice(-120); const plan=String(getCurrentChapterTeacherRawText(i)||'').trim();
    const conn=String(plan?.openingLink?.previousTransition||plan?.endingConstruction?.nextTransitionBasis||'').trim();
    const ok=!!tail && !!conn;
    rows.push(`<div class="lm-seam-row"><b>第${i}→第${i+1}章</b><span class="pill ${ok?'tag-ok':'tag-warn'}">${ok?'✓ 有物理接缝':'△ 需要检查'}</span><small>${esc(conn||'教案未提供明确承接点')}</small></div>`);
  }
  return rows.join('');
}

function openConsistencyCheck(){ openNeModal('一致性自检（阶段4）', consistencyReportHtml() || '<div class="empty">暂无数据。</div>'); }

function longNovelHealthHtml(){
  const o=state.outline||{}, total=(o.chapters||[]).length||chapterCountVal()||0, written=writtenChapterCount();
  let planCount=0; for(let i=0;i<total;i++) if(getCurrentChapterTeacherRawText(i)) planCount++;
  const noPlan=Math.max(0,total-planCount), noDigest=Math.max(0,written-(Array.isArray(o._chapterDigests)?o._chapterDigests.filter(Boolean).length:0));
  const fo=refreshForeshadowBank(); const open=fo.filter(x=>x.status==='open').length;
  const scores={连续性:Math.max(55,100-Math.min(35,noDigest*4)),因果:Math.max(55,100-Math.min(35,noPlan*3)),伏笔:open?Math.max(60,96-Math.min(30,open*2)):96,记忆:written?Math.max(65,100-Math.min(30,noDigest*5)):60};
  return `<div class="lm-health-grid">${Object.entries(scores).map(([k,v])=>`<div class="lm-score"><b>${k}</b><strong>${v}</strong><span>/100</span></div>`).join('')}</div><div class="lm-health-notes"><span>已写 ${written}/${total||'?'} 章</span><span>缺教案 ${noPlan}</span><span>缺细摘要 ${noDigest}</span><span>未确认回收伏笔 ${open}</span></div>`;
}
function getDeckStepStatus(){
  const o = state.outline;
  const chs = (o && Array.isArray(o.chapters)) ? o.chapters : [];
  const total = chs.length || chapterCountVal() || 0;
  const written = writtenChapterCount();
  const groups = teacherAssignmentGroups();

  const s1_done = !!(state.chapterStyle && state.chapterStyle.tags && state.chapterStyle.tags.length);
  const s2_done = !!(state.polishAdopted || (state.idea && state.idea.trim()));
  const s3_done = !!(state.outlineConfirmed && o && chs.length > 0);
  const s4_done = !!(scDone('dictMaster') || state.dictmasterRan || (o && o.glossary && ((o.glossary.characters||[]).length > 0)));
  const s5_done = scDone('principal');
  // v1.0.360：老师完成状态统一读取“实际已落地教案”判定，不再依赖可能出现短暂不同步的 finished.tN 快照。
  // 学校管线与这里必须使用同一完成事实源：AI 已返回并成功写入 state.school.teachers 后，UI 立即视为老师完成。
  const s6_done = (groups.length > 0 && groups.every((g,i)=>scTeacherGroupComplete(i)));
  // 正文完成同样只看真实落库的章节正文；生成函数成功后会主动刷新当前 UI，避免“正文已写入但步骤仍停留”的旧状态。
  const s7_done = (total > 0 && written >= total);

  const steps = [
    { key:'style', name:'风格', done:s1_done, target:'[data-flow="1"]', desc: s1_done ? '已选定小说文风倾向' : '待设定小说文风' },
    { key:'idea',  name:'构想', done:s2_done, target:'[data-flow="2"]', desc: s2_done ? '核心故事构想已就绪' : '待输入核心构想' },
    { key:'outline',name:'大纲', done:s3_done, target: (o ? '[data-flow="2"]' : '#btnGenOutline'), desc: s3_done ? `已定稿 ${chs.length} 章分卷大纲` : '待生成全书大纲' },
    { key:'dict',  name:'词典', done:s4_done, target:'.card-theme-dictmaster', desc: s4_done ? '基础词典人物/地名已架构' : '待词典达人建立基础词典' },
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
    const hasPlan = !!getCurrentChapterTeacherRawText(i);
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
          <div style="font-size:11px;color:var(--dim)">基础词典资产</div>
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
          <div class="btn-row" style="display:grid;grid-template-columns:1fr;gap:10px">
            <button id="btnOptimizationConcept" class="btn ghost ${polishIdle()?'first':''}">${(state.strategyStage1Status==='ready'&&state.strategyStage2Status==='ready')?'🔄 重新生成优化构想':'✨ 生成优化构想'}</button>
          </div>
          <div style="margin:7px 0 10px;font-size:12px;line-height:1.7;color:var(--muted);display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="flex:1 1 auto">${(state.strategyStage1Status==='ready'&&state.strategyStage2Status==='ready')?'✅ 已完成：战略分析已融入优化构想生成':'AI会先在内部分析动态战略维度，再直接生成最终优化构想；战略分析不会作为独立操作步骤。'}</span>
            <label title="开启后：严格质检失败会触发定向自动修复重试；关闭后：不做质检驱动重试，仅保留网络层重试。" style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;cursor:pointer;font-size:11px;opacity:.82"><input type="checkbox" id="chkPolishStrictQc" ${state.ideaOptimizationStrictQc===true?'checked':''}> 严格质检</label>
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
    <details class="app-idea-fold" data-fold-key="narrativePerspective">
      <summary><span>👁️</span><b>叙事视角</b><span class="poly-rule">点击展开</span></summary>
      <div class="app-idea-fold-body">
        <div class="team-pick" id="teamPick">
          ${TEAM_OPTIONS.map(o=>`
          <label class="team-item ${o.id===currentTeamShape().id?'sel':''}" data-team="${o.id}" title="${esc(o.desc)}">
            <span class="team-ic">${o.id==='solo'?'👤':o.id==='dual'?'👫':o.id==='trio'?'🤝':o.id==='quad'?'👥':'🧑‍🤝‍🧑'}</span>
            <span class="team-txt"><b>${esc(o.label)}</b><i>${esc(o.desc)}</i></span>
            <input type="radio" name="teamShape" value="${o.id}" style="display:none" ${o.id===currentTeamShape().id?'checked':''}>
          </label>`).join('')}
        </div>
      </div>
    </details>
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
  <div class="flow-sec-head"><span class="fs-no">📇</span><span class="fs-name">基础词典</span><span class="fs-note">全书共享事实数据库 · 正文的设定唯一基准</span></div>
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
            ${dictmasterLocked()?'<span class="muted" style="font-size:12px">优化构想已锁定</span>':''}
          </div>
        </div>
        <div id="polishCards2" class="pol-box" style="display:block"></div>
        ${ polishKeepBar() }   <!-- v1.0.205 阶段5.5 后悔药：生成大纲后仍可 查看历史优化版本 / 重新优化 / 重新选候选后点下方「生成大纲」重搬（词典达人产出前可反悔） -->
        <div class="btn-row" style="margin-top:8px">
          <button data-gen-outline class="btn primary block" ${dictmasterLocked()?'disabled title="词典达人已产出，优化构想已锁定"':''}>📚 生成大纲（搬入书名 / 简介 / 节拍）${dictmasterLocked()?'（优化构想已锁定）':''}</button>
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
  <div class="flow-sec-head"><span class="fs-no">📇</span><span class="fs-name">基础词典</span><span class="fs-note">全书共享事实数据库 · 正文的设定唯一基准</span></div>
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

function refreshRollingSummaryCardOnly(){
  const card = document.querySelector('.rs-card');
  if(!card) return false;
  const active = document.activeElement;
  if(active && card.contains(active)) return false;
  const wrap = document.createElement('div');
  wrap.innerHTML = rollingSummaryCardHtml().trim();
  const next = wrap.firstElementChild;
  if(!next) return false;
  card.replaceWith(next);
  bindRollingSummaryCard();
  return true;
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
    try{ await ensureChapterDigests(); await generateRollingSummaries(); toast('滚动摘要已补齐'); }
    catch(e){ toast('摘要生成失败：'+e.message); }
    finally{ busy(gen, false); refreshRollingSummaryCardOnly(); }
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
  if(state.dictmasterRan){ t.value = String(state.originalIdeaSnapshot || state.idea || '').trim() || '（尚未生成基础词典）'; }
  else { t.value = String(state.idea || '').trim() || '（尚未生成基础词典）'; }
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
      <textarea readonly class="orig-text" spellcheck="false">${esc(show || '（尚未生成基础词典）')}</textarea>
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
function snapshotTitleBatch(label, opts){
  opts = opts || {};
  const o = state.outline; if(!o) return;
  const titles = (o.chapters||[]).map(c=> (c&&c.title)||'');
  if(!Array.isArray(o.chTitleBatches)) o.chTitleBatches = [];   // fixed: 先挂回 state.outline，persist 才存得住
  const bt = o.chTitleBatches;
  if(bt.length && JSON.stringify(bt[0].titles) === JSON.stringify(titles)) return;
  const d = new Date();
  const t = (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  bt.unshift({ ts: Date.now(), label: `${t} · ${label||'生成批次'}`, titles });
  if(bt.length > 50) bt.length = 50;
  if(!opts.deferCommit) persist();
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
    toast(`已重生成 ${cnt} 个章节标题`);
  } else {
    const o0 = state.outline; if(!o0) { toast('请先生成大纲'); return; }
    o0.chapters = titles.map(t=>({ title: t }));
    state.chapters = titles.map((t,i)=>({ title:t, content:'', strip:'', confirmed:false }));
    setAllTitles(titles);
    persist(); render();
    toast(`已生成 ${titles.length} 个章节标题`);
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

function ensureSchoolActionStyles(){
  if(document.getElementById('schoolActionStyles')) return;
  const st=document.createElement('style'); st.id='schoolActionStyles'; st.textContent=`
    .sc-teacher-all{background:linear-gradient(135deg,#20a95a,#62d98a)!important;color:#fff!important;border-color:transparent!important}
    .sc-teacher-all.running{background:linear-gradient(135deg,#e53935,#ff6b57)!important;color:#fff!important;cursor:wait}
    .sc-teacher-all.done{background:linear-gradient(135deg,#20a95a,#62d98a)!important;color:#fff!important}
    .sc-teacher-all:disabled{opacity:.96}
    .sc-teacher-cut-btn{background:linear-gradient(135deg,#7b2cff,#ff2d55,#ffc400)!important;color:#fff!important;border:0!important;font-weight:700!important;box-shadow:0 2px 8px rgba(123,44,255,.22);}
    .sc-teacher-cut-btn.running{background:linear-gradient(135deg,#ff2d55,#ff6b57)!important;cursor:wait!important}
    .sc-teacher-cut-btn.ready{background:linear-gradient(135deg,#20a95a,#62d98a)!important}
    .sc-teacher-cut-btn.stale{background:linear-gradient(135deg,#e53935,#ff8a65)!important}
    .sc-teacher-cut-btn:disabled{opacity:.5!important;cursor:not-allowed!important}
    .sc-tc-cut-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:7px;padding:5px 8px;border-radius:7px;background:var(--panel2);border:1px solid var(--line);font-size:11px}
    .sc-tc-cut-status{font-weight:800}.sc-tc-cut-status.ready{color:#20a95a}.sc-tc-cut-status.partial,.sc-tc-cut-status.stale{color:#e08a00}.sc-tc-cut-status.uncut{color:#8b5cf6}.sc-tc-cut-status.no-teacher{color:var(--muted)}
    .sc-tc-cut-detail{color:var(--muted)}
    .sc-tc-cut-more{margin-left:auto;border:0;background:transparent;color:var(--muted);font-size:11px;cursor:pointer;padding:2px 4px}
    .sc-tc-cut-list{padding:6px 8px 2px;font-size:11px;line-height:1.7}
    .sc-tc-cut-item{display:inline-block;margin:2px 5px 2px 0}.sc-tc-cut-item.ready{color:#20a95a}.sc-tc-cut-item.todo{color:var(--muted)}
    .sc-principal-generate{background:linear-gradient(135deg,#7b2cff,#ff2d55,#ffc400)!important;color:#fff!important;border-color:transparent!important;font-weight:700!important;text-shadow:0 1px 1px rgba(0,0,0,.18)}
    .sc-principal-generate.running{background:linear-gradient(135deg,#ff2d55,#ff6b57,#ffc400)!important;color:#fff!important;cursor:wait!important}
    .sc-principal-generate.done{background:linear-gradient(135deg,#7b2cff,#ff2d55,#ffc400)!important;color:#fff!important}
    .sc-principal-generate:disabled{opacity:.96}
  `; document.head.appendChild(st);
}
function schoolZoneBlock(){
  ensureSchoolActionStyles();
  const groups = teacherAssignmentGroups();
  const pTitles = (state.school && state.school.principal && Array.isArray(state.school.principal.titles)) ? state.school.principal.titles : [];
  const titlesApplied = isPrincipalTitlesApplied();
  const tBody = groups.length
    ? groups.map((g,i)=> schoolTeacherBtn(g,i)).join('')
    : `<div class="sc-teachers-ph">🎓 老师备课区：生成大纲后按节拍自动分配分段。</div>`;
  return `<div class="card cp-card school-card card-theme-school">
    <div class="cp-head card-head-bar">
      <div class="ch-left">
        <span class="ch-badge ch-badge-school">🏛️</span>
        <h3 class="ch-title">编剧学院 · 统筹与教案</h3>
        <span class="ch-subtag ch-subtag-school">${groups.length ? `${groups.length} 位老师` : '待设定章节数'}</span>
      </div>
      <div class="ch-right" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <button type="button" class="btn small dm-ai-action sc-principal-generate" data-scp-principal-generate style="background:linear-gradient(135deg,#7c3aed 0%,#db2777 52%,#f59e0b 100%);color:#fff;border:0;box-shadow:0 2px 8px rgba(124,58,237,.24);font-weight:700" title="立即生成 / 重新生成校长统筹成果">👑 生成校长</button>
        <button type="button" class="sc-plan-btn sc-injection-export-btn" data-scp-principal-injection title="查看校长真实 AI 请求的 SYSTEM + USER">📦 注入导出</button>
        <button type="button" class="sc-plan-btn sc-plan-pr" data-scp-plan-pr title="查看并编辑当前正式校长成果">📋 读校长成果</button>
      </div>
    </div>
    <div class="cp-body">
      <div class="school-zone">
        <div class="school-zone-head">
          <span>👑 校长（总控） → 🎓 老师（分段教案） → ✍️ 正文作家</span>
          <em class="school-zone-tip">${groups.length ? (groups.length > 1 ? `${groups.length} 位老师分段` : `1 位老师全书教案`) : '待设定章节数'}</em>
        </div>
        <div class="school-steps">
          <div class="school-steps-main" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <button type="button" class="sc-step sc-teacher-all" data-scp-teacher-all title="一键启动全部老师；每位老师只读取当前校长成果中授权给自己的部分">🎓 一键老师</button>
          </div>
        </div>
        <div class="school-teachers">
          ${tBody}
        </div>
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
  bindSchoolSteps();   // 学校模式：校长/老师按钮绑定
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
  if(empty) return `<div class="card gs-card card-theme-glossary"><div class="gs-card-head card-head-bar"><div class="ch-left"><span class="ch-badge ch-badge-glossary">📇</span><h3 class="ch-title">设定表 · 基础词典总览</h3><span class="ch-subtag ch-subtag-glossary">待生成</span></div><div class="ch-right"><span class="muted" style="font-size:12px">一致性基准</span></div></div><div class="gs-card-body">${tools}<p class="sub">生成大纲后自动确立全书基础词典基准。</p></div></div>`;
  const fmt = (o, keys)=>{ const ks = (keys||[]).filter(k=>o[k]); return ks.map(k=>o[k]).join(' · '); };
  const entry = (o, type, i, nameKeys, detailKeys)=>{
    const name = o.name || '';
    const brief = fmt(o, nameKeys);
    const newTag = (o._auto && (o._srcTs||0) > (Number(state._glossSeenTs)||0)) ? `<span class="gs-newtag" title="自动入典：${o._srcCh?('来自第 '+o._srcCh+' 章'):esc(o._srcHow||'批量提取')} · ${new Date(o._srcTs||Date.now()).toLocaleString('zh-CN',{hour12:false})}">🆕${o._srcCh?('·第'+o._srcCh+'章'):''}</span>` : '';
    const _nameAd = type==='char' ? characterNameAdvisory(o.name) : []; const flagTag = (type==='char' && (o._nameFlag||_nameAd.length)) ? `<span class="gs-nameflag" title="${esc(o._nameFlag||_nameAd.join('；'))}（仅提示不拦截）">⚠命名</span>` : '';
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
  const worldCounts={organizations:(g.organizations||[]).length,institutions:(g.institutions||[]).length,items:(g.items||[]).length,rules:(g.rules||[]).length,terms:(g.terms||[]).length,events:(g.events||[]).length,lifeSettings:(g.lifeSettings||[]).length,worldRules:(g._worldRules||[]).filter(x=>x&&String(x.rule||'').trim()).length};
  const worldTotal=Object.values(worldCounts).reduce((a,v)=>a+Number(v||0),0);
  const total = (g.characters||[]).length + (g.walkons||[]).length + (g.places||[]).length + (g.propernouns||[]).length + (g.subplots||[]).length + worldTotal;
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
        <h3 class="ch-title">设定表 · 基础词典总览</h3>
        <span class="ch-subtag ch-subtag-glossary">${total} 条已收录${worldTotal?` · 世界素材 ${worldTotal}（正文按章授权调用）`:""}</span>
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
        ['world',  '🌍 世界素材', (()=>{
          const groups=[['🏛️ 组织/势力',g.organizations],['🏢 职业/机构',g.institutions],['🧰 物品/道具',g.items],['⚙️ 扩充规则',g.rules],['🔤 术语',g.terms],['🕰️ 历史事件',g.events],['🍜 生活设定',g.lifeSettings],['📜 世界观规则',g._worldRules]];
          return groups.map(([lab,arr])=>{const a=Array.isArray(arr)?arr:[]; if(!a.length) return ''; const body=a.map(x=>{const nm=String(x&&x.name||'').trim(); const brief=[x.type,x.category,x.function,x.meaning,x.content,x.note,x.impact,x.usage,x.value,x.scope,x.rule,x.limit].map(v=>String(v||'').trim()).filter(Boolean).join(' · '); const src=Object.values(glossarySourceMeta(g).foundation).some(v=>v && String(v).length>=0 && false)?'基底':(Object.keys(glossarySourceMeta(g).foundation).some(k=>k.endsWith(':'+String(x&&x.name||'').trim()))?'基底':'扩充'); return `<div class="gs-entry gs-world-entry"><div class="gs-head"><span class="gs-fold-ico">•</span><span class="gs-name" style="cursor:default">${esc(nm)}</span><span class="gs-brief">[${src}] ${esc(brief||'可供下游AI按章授权调用')}</span></div></div>`;}).join(''); return `<details class="dm-fold" open><summary>${lab}（${a.length}）</summary><div>${body}</div></details>`;}).join('') || '<span class="muted">（暂无世界素材）</span>';
        })(), worldTotal],
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
      if(isName && type==='char'){
        if(state.characterNaming && state.characterNaming.locked){ inp.value=oldVal; toast('人物姓名已锁定，请先在“人物定名台”解除锁定'); return; }
        const rr=renameCharacterById(arr[idx].id,newVal);
        if(!rr.ok){ inp.value=oldVal; toast(rr.msg); return; }
        glossaryHistoryPush(`修改名称「${type}·${idx}」`);
        renderGlossaryOnly();
        toast(rr.msg);
        return;
      }
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
      <p class="muted" style="margin:0 0 8px">直接编辑即可；保存后自动写回基础词典，重新生成正文章节时即套用新值。</p>
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
  // 旧 chapterPlans 已降级为迁移/兼容存储，不再参与运行时写入。
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
        const user = getChapterTeacherRawTextDirect(i);
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

function chapterInjectionFileName(i){
  const c=state.chapters?.[i]||{};
  const title=String(cleanChapterTitle(c.title)||'').trim().replace(/[\\/:*?\"<>|]/g,'_').replace(/\s+/g,'_');
  const n=String(i+1).padStart(3,'0');
  return title ? `第${n}章_${title}_正文注入.txt` : `正文注入_第${n}章.txt`;
}

function downloadPlainText(name,text){
  const blob=new Blob([String(text||'')],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),0);
}

function closeChapterInjectionExport(){
  const ov=$('#chapterInjectionExport');
  if(ov) ov.remove();
}

function openChapterInjectionExport(i){
  if(!document.getElementById('chapterInjectionExportStyle')){ const st=document.createElement('style'); st.id='chapterInjectionExportStyle'; st.textContent=`.chapter-injection-overlay{z-index:10050!important}.chapter-injection-modal{width:min(850px,88vw)!important;height:min(700px,82vh)!important;max-width:none!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}.chapter-injection-head{flex:0 0 auto}.chapter-injection-content{flex:1 1 auto;min-height:0;padding:12px 16px}.chapter-injection-text{display:block;width:100%;height:100%;min-height:260px;box-sizing:border-box;resize:none;overflow:auto;white-space:pre-wrap;word-break:break-word;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:12px;font:12px/1.65 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.chapter-injection-actions{flex:0 0 auto;display:flex;gap:10px;justify-content:flex-end;padding:0 16px 16px}.chapter-injection-copy{background:#2878d8!important;color:#fff!important;border-color:#2878d8!important}.chapter-injection-txt{background:#e88727!important;color:#fff!important;border-color:#e88727!important}.chapter-injection-btn{border-color:#c99b35!important;color:#f1c96b!important}@media(max-width:600px){.chapter-injection-modal{width:92vw!important;height:82vh!important}.chapter-injection-content{padding:10px}.chapter-injection-actions{padding:0 10px 10px}.chapter-injection-actions .btn{flex:1;min-height:42px}}`; document.head.appendChild(st); }
  i=Number(i);
  if(!Number.isInteger(i) || !state.chapters?.[i]){ toast('未找到对应章节'); return; }
  closeChapterInjectionExport();
  let injection;
  try{
    // 纯读取：不发 AI 请求、不保存、不生成正文。
    const partial=String(state._chapterPartial?.[i]||'');
    const resumeTail=partial.length>=200 ? partial.slice(-800) : '';
    injection=buildChapterInjection(i,resumeTail?{resumeTail}:{});
  }catch(e){
    toast('读取正文注入失败：'+String(e?.message||e));
    return;
  }
  const text=String(injection.fullText||'');
  const title=String(cleanChapterTitle(state.chapters[i].title)||`第${i+1}章`);
  const ov=document.createElement('div');
  ov.id='chapterInjectionExport';
  ov.className='gs-overlay chapter-injection-overlay';
  ov.innerHTML=`
    <div class="gs-modal chapter-injection-modal" role="dialog" aria-modal="true" aria-label="正文注入导出">
      <div class="gs-modal-head chapter-injection-head">
        <div><b>📦 第${i+1}章「${esc(title)}」· 注入导出</b><span class="muted" style="margin-left:8px;font-size:11px">正文实际 system + user</span></div>
        <button type="button" class="gs-x" data-cie-close>✕</button>
      </div>
      <div class="chapter-injection-content">
        <textarea class="chapter-injection-text" readonly spellcheck="false" aria-label="正文实际注入内容">${esc(text)}</textarea>
      </div>
      <div class="chapter-injection-actions">
        <button type="button" class="btn chapter-injection-copy" data-cie-copy>复制</button>
        <button type="button" class="btn chapter-injection-txt" data-cie-txt>全文导出TXT</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const ta=ov.querySelector('.chapter-injection-text');
  const close=()=>closeChapterInjectionExport();
  ov.querySelector('[data-cie-close]').onclick=close;
  ov.addEventListener('click',e=>{
    if(e.target===ov) close();
    const copy=e.target.closest('[data-cie-copy]');
    if(copy){ e.preventDefault(); e.stopPropagation(); copyText(text); }
    const exp=e.target.closest('[data-cie-txt]');
    if(exp){ e.preventDefault(); e.stopPropagation(); downloadPlainText(chapterInjectionFileName(i),text); toast('TXT 已导出'); }
  });
  if(ta){ ta.focus(); ta.setSelectionRange(0,0); ta.scrollTop=0; }
}

function chCardHtml(c, i){
  const hasC = !!(c.content && c.content.trim());
  const planGi = chapterOfPlan(i);
  return `<div class="card ch-card" data-ch-card="${i}" style="background:var(--panel);border:1px solid var(--line)">
        <div class="ch-head" data-fold="${i}" role="button" tabindex="0" aria-expanded="true">
          <span class="ch-fold-ico">▾</span>
          <h3 style="margin:0;flex:1;word-break:break-word;line-height:1.35" title="第${i+1}章 · ${esc(cleanChapterTitle(c.title))}">第${i+1}章 · ${esc(cleanChapterTitle(c.title))}${c._titleByAI?'<i class="tbd-title-tag" style="font-style:normal;font-size:11px;font-weight:400;opacity:.55;margin-left:6px" title="本章标题已由章节正文 AI 定稿">正文定稿</i>':(!state.plannerFinalized?'<i class="tbd-title-tag" style="font-style:normal;font-size:11px;font-weight:400;opacity:.55;margin-left:6px" title="标题尚未由规划阶段定稿，当前沿用第二步参考稿">参考稿</i>':'')}</h3>
          ${wcBadge(c.content, `data-wc-ch="${i}"`)}
        </div>
        <div class="ch-meta ch-status-wrap" data-ch-status="${i}">${chapterBadgesHtml(i)}</div>
        <div class="ch-body">
          <textarea data-ch="${i}" class="${hasC?'':'ch-ta-empty'}" style="margin-top:8px" ${hasC?'':'placeholder="暂无正文：点击「🔄 重生成」生成，或直接在此输入"'}>${esc(c.content)}</textarea>
          <div class="btn-row">
            <button class="btn ghost" data-regen="${i}" ${state.generating?'disabled':''}>🔄 重生成</button>
            <button class="btn ghost" data-plan-ch="${i}" title="查看本章教案${planGi>=0?`（老师${planGi+1}）`:''}">📖 教案</button>
            <button class="btn ghost" data-read="${i}">📖 阅读</button>
            <button class="btn ghost" data-ch-sum="${i}" title="生成本章速读梗概（本章正文压缩至约 1/3，省时阅读）">🏮 本章梗概</button>
            <button class="btn ghost" data-ver="${i}">📚 版本(${chVersions(i).length})</button>
            <button class="btn ghost chapter-injection-btn" data-injection-export="${i}" title="查看本章此刻实际发送给正文 AI 的 system + user">📦 注入导出</button>
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
  ${wcBadge(c.content, `data-wc-ch="${i}"`)}
</div>
<span class="pill ${c.confirmed?'tag-ok':'tag-warn'}">${c.confirmed?'✓ 已确认':'待确认'}</span>
        </div>
        <textarea data-ch="${i}" style="margin-top:8px">${esc(c.content)}</textarea>
        <div class="btn-row">
          <button class="btn ghost" data-regen="${i}">🔄 重生成</button>
          <button class="btn ghost" data-plan-ch="${i}" title="查看本章教案">📖 教案</button>
          <button class="btn ghost" data-read="${i}">📖 阅读</button>
          <button class="btn ghost" data-ch-sum="${i}" title="生成本章速读梗概（本章正文压缩至约 1/3，省时阅读）">🏮 本章梗概</button>
          <button class="btn ghost" data-ver="${i}" title="版本历史">📚 版本(${chVersions(i).length})</button>
          <button class="btn ghost chapter-injection-btn" data-injection-export="${i}" title="查看本章此刻实际发送给正文 AI 的 system + user">📦 注入导出</button>
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
      // 正文阅读“概”只服务于当前章节老师教案；旧版章节规划链路已退出正文侧。
      const chapterNo=readerCur+1,groups=teacherAssignmentGroups();
      const g=groups.find(x=>chapterNo>=Number(x.first||1)&&chapterNo<=Number(x.last||Infinity));
      const t=g?teacherResultForAssignmentGroup(g).t:null;
      const text=String(t?.chapterCards?.chapters?.[chapterNo]?.rawText||'').trim();
      if(text){
        const title=String(state.chapters?.[readerCur]?.title||'').trim();
        synCard.innerHTML=`<h4>第${toCnNum(chapterNo)}章 · 本章概览</h4><div class="syn-body"><div style="font-size:12px;color:var(--muted);margin-bottom:6px">🎓 当前正文第${chapterNo}章老师教案概览 · 与「教案」及「重生成」使用同一份本章权威教案</div><pre class="sc-plan-raw">${esc(text)}</pre></div>`;
      }else{
        synCard.innerHTML=`<h4>第${toCnNum(chapterNo)}章 · 本章概览</h4><div class="syn-body muted">当前第${chapterNo}章暂无可用的老师教案，请先完成对应老师备课。</div>`;
      }
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
          } else {
            while(_o.chapters.length < v){
              _o.chapters.push({ title: '', summary: '', middleBeatId: currentBeatId() });
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
          // 464：章节数变化不再重建旧 chapterPlans；当前校长/老师成果若存在则作废并需重新生成。
          if(state.school?.principal?.raw && typeof invalidateSchoolDownstream==='function') invalidateSchoolDownstream('principal');
          _o.chapters = Array.from({length:v}, ()=>({title:'', summary:'', middleBeatId:currentBeatId()}));
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
   $$('input[name="cpMicroPick"]').forEach(r=>{
     r.onchange = ()=>{
       const v = Number(r.value);
       if(!BEAT_OPTIONS.some(b=>b.id===v)) return;
       if(state.outline && Array.isArray(state.outline.chapters)){
         // 当前UI仍是“章节推进节奏”的总选择器，因此它改变的是当前全书章节默认结构；
         // 每章仍然保存自己的 middleBeatId / chapterMiddleShape，后续可再做单章独立选择。
         state.outline.chapters.forEach(ch=>{
           if(ch && typeof ch === 'object') ch.middleBeatId=v;
         });
       }
       state.outline = state.outline || {};
       state.outline.beatCount = v;
       ensureChapterMiddleShapesForOutline();
       persist(); render();
     };
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
    const t = e.target.closest('[data-regen],[data-read],[data-fold],[data-page],[data-ver],[data-ch-sum],[data-ne-resume-ch],[data-ne-partial-adopt],[data-plan-ch],[data-injection-export]');
    if(!t) return;
    if(t.hasAttribute('data-injection-export')){
      e.preventDefault(); e.stopPropagation();
      openChapterInjectionExport(+t.dataset.injectionExport);
    }
    else if(t.hasAttribute('data-plan-ch')){
      const i = +t.dataset.planCh;
      openChapterTeacherPlanReader(i);
    }
    else if(t.hasAttribute('data-ver')){ openChapterVersionPanel(+t.dataset.ver); }
    else if(t.hasAttribute('data-regen')){ openChapterRegenPanel(+t.dataset.regen); }
    else if(t.hasAttribute('data-ch-sum')){ openChapterSummaryPanel(+t.dataset.chSum); }
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
  ensureChapterMiddleShapesForOutline();
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
  // 不再初始化旧 chapterPlans；新运行态只使用当前老师章节教案。
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
  ensureChapterMiddleShapesForOutline();
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
  if(!adopted){ toast('请先在“优化构想”中明确采用一个方案，建立唯一故事战略后再生成大纲'); if(btn) busy(btn,false); return; }
  if(dictmasterLocked()){ toast('词典达人已产出基础词典，优化构想已锁定，不可再换选重搬'); if(btn) busy(btn,false); return; }
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
  const structured = adopted.creativeBlueprint || adopted.creationBlueprint?.structured || {};
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
    // 1.0.353：结构式创作蓝图作为下游唯一机器事实源的快照。
    creativeBlueprint: JSON.parse(JSON.stringify(structured)),
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
你将获得优化构想所选方案的完整原文，其中包含书名、题材、主角、核心冲突、世界观、对手、动机、风格、结构、核心词，以及用户明确指定的人物、地点、专名、势力、规则等。

这份内容是本次创作的唯一蓝本。

1. 用户已经明确写出的设定，是最高事实依据。
2. 蓝本中已经出现的人物、地名、专名必须全部保留。
3. AI 在本阶段不得擅自修改 Blueprint 已确认名称；用户可在正文生成前通过“人物定名台”主动确认新姓名，这属于用户授权操作。
4. 不得删除用户明确指定的核心内容。
5. 不得因为你认为另一种设定更精彩而推翻用户设定。
6. 不得偷偷改变主角、核心冲突、题材、世界观方向或人物核心立场。
7. 你的优化只能是深化、补足、结构化、体系化、提高长期可写性，而不是改故事。
8. 如果用户蓝本已经足够具体，则以忠实整理和精确强化为主，不要为了证明自己会创造而过度创造。

【二、第一阶段优先级｜先建立完整核心人物体系，再做其他词典】
这是本次任务最重要的执行顺序，不能跳过，也不能把它弱化成“可选人物整理”：

阶段 1｜建立核心人物体系（必须先做）
1. 先读取 Creative Blueprint 已经明确的人物。它们是“已确认人物种子”，必须继承；但它们绝不是最终人物总表。
2. 立即分析故事的核心冲突、主角目标、对立关系、阵营结构、世界运行方式和长期剧情需求，判断“为了让这部小说真正成立，核心人物还缺谁”。
3. 对确有长期剧情职责、且仅靠已有人物无法成立的角色，主动创建必要的新核心人物，例如核心对手、关键盟友、导师、关键亲属、关键阵营人物、关键知情者等。
4. 新增核心人物必须获得稳定 CHAR_xxx ID、正式姓名、身份和明确的长期故事职责；正式姓名由你定稿，后续词典充实不得改名。
5. 人物集合确定后，再建立人物之间的核心关系。关系表只能引用已经进入 characters 集合的人物；关系表绝不能成为隐形人物生成器。
6. 完成这一阶段后，形成“完整核心人物集合”。这个集合可能比 Blueprint 人物多，也可能只有 Blueprint 中的一个人物；数量由故事需要决定，不由固定人数决定。
7. 如果故事确实只需要一个核心人物，relationshipTable 可以为空；绝不能为了填表制造自我关系。
8. 对于被判断为核心/主要人物的每一人，本次生成就是其 Foundation 正式人物卡的主要定稿机会。后续“词典充实”明确禁止回写 Foundation 人物，因此这里不能故意只生成姓名、身份和一个性格标签，把九项基础人物信息留给不存在的后续 AI。
9. 当前人物基础九项按程序现有契约理解为：正式姓名 + identity、age、gender、appearance、hobby、relation、trait、catchphrase。主要人物必须在本次输出中全部给出；确实没有客观依据的字段可以明确写“未知/无”，但不能留空，更不能用“待补充”“以后再定”等占位语。
10. 判断人物是否属于主要人物时，不只看 Blueprint 是否写了“主角”。凡是承担核心冲突、核心目标阻力、关键转折、核心关系、长期阵营职责、导师/关键盟友/关键亲属/关键知情者等长期剧情职责的人，都应按主要人物完成九项基础信息。

【人物创造的两种来源必须区分】
A. 有依据的创造：从 Blueprint 已明确事实、世界规则、人物目标、冲突、关系、阵营和题材逻辑中推导出的合理补全。
B. 从无到有的必要创造：Blueprint 没有提供该人物，但通过故事结构反推，缺少该人物会导致核心冲突、目标、关系、转折或世界运行无法成立；此时词典达人应主动创建。
二者都允许进入 Foundation，但不能混淆：Blueprint 已确认人物不得被改名；推导/新造人物必须明确 origin=blueprint_confirmed 或 dictionary_master_created。

【主要人物的反推检查｜在输出前内部完成，不输出检查过程】
- 删除测试：如果删除该人物，核心冲突/主角目标/关键转折是否明显断裂？若完全不受影响，不应轻率把其定为主要人物。
- 关系反推：核心人物为何必须与这些人发生关系？关系变化能否产生剧情作用？没有真实关系就不要凑关系表。
- 冲突反推：每个核心对立角色的目标、利益或立场是否足以形成真实冲突？不要只给“反派”标签。
- 目标反推：主要人物自己想要什么、为什么要、阻碍是什么，是否能支撑长期行动？
- 缺口反推：从结局、核心冲突和主线阶段倒推，现在的人物集合是否缺少必要的执行者、阻碍者、知情者、关系承载者或关键阵营角色。
- 一致性反推：人物年龄、身份、关系、性格、口头禅、外貌等九项之间是否互相支持，而不是各写各的。
- 反向场景测试：想象后续校长/老师要连续安排数章使用该人物，如果人物九项基础不足以支持行动、关系、对话和描写，则本次必须补足。

阶段 2｜建立核心世界骨架
只有完成阶段 1 的人物体系后，才继续建立核心地点、组织/机构、专有名词、世界规则、核心物件、术语、历史和必要生活设定。

阶段 3｜统一定稿
最后检查：所有关系端点都来自正式人物集合；所有新增核心人物都有明确长期职责；蓝本已确认事实未被修改；新增内容没有为了“丰富”而过量制造。

特别重要：不要因为优化构想通常只写了主角，就误以为核心人物只能有主角一个。优化构想负责提供故事方向和已确认人物种子；词典达人负责把这些种子发展成“小说真正需要的核心人物系统”。

【三、工作契约｜先理解职责，再开始创造】
你不是“抄写员”，也不是“只允许继承、不允许新增”的登记员。
你是 Foundation Dictionary 的建立者：先完整继承蓝本已经确定的事实，再判断为了让整部小说能够成立，哪些核心人物、核心地点、组织、专名、规则、物件、术语、历史和必要生活基础设施必须存在，并把这些必要内容建立成第一版稳定世界骨架。

必须遵守：准确 > 完整；已确认 > 推断；必要 > 数量；宁可留空 > 为填字段猜测。

【词典达人绝对不能做】
1. 不能修改蓝本已经明确的事实。
2. 不能为了让词典“看起来丰富”无限添加实体。
3. 不能让不存在的人物出现在关系表中，不能出现人物自我关系来凑数。
4. 不能把关系表中的一个名字/CHAR_ID 当成“隐形人物”；人物必须先有正式人物记录。
5. 不能因为字段缺失而瞎编；无依据就留空/未知。
6. 不能提前设计章节、场景或正文。

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

【十九A、最低通行标准｜硬约束与可选内容必须严格分离】
词典达人只负责建立 Foundation Dictionary 的最小可用核心骨架，不负责一次性完成整本小说百科全书。
注意：这里的“最小”不是“只抄蓝本已有人物”。词典达人必须判断故事是否需要新增核心人物；蓝本只有一个人物时，允许建立更多必要核心人物，也允许在确实不需要时保持单人物结构。不要把“关系表可为空”误解成“不能建立新人物”。
真正不可缺少的硬约束只有：至少1位核心人物；核心人物有正式姓名和基本身份；Blueprint 人物定义区中明确出现的 CHAR_xxx 人物ID必须完成正式姓名映射；Blueprint 明确的人物核心关系不能丢失；WORLD 必须能说明时代/主要舞台/基本世界；Blueprint 明确存在的世界硬规则不得被删除或改成相反规则；必须遵守禁用姓名、实体去重和安全约束。
以下均为可选，不得因为缺失而判失败：地点数量、组织/机构、专有名词、物品、术语、历史、生活设定、地点关联、专名关联、关系详细说明。人物详细字段只有在该人物属于 support/非主要人物时才可以省略；主要人物的九项基础字段必须在本次输出中逐项出现并有值，确实无依据时才写“未知/无”。
没有明确世界规则时，RULE 区块可以完全省略。不要为了凑数量创造条目。
特别注意：RELATIONSHIPS 中出现的 CHAR_xxx 只是引用；只有 PROTAGONIST.personId、KEY_CHARACTERS.personId 等真正的人物定义字段才产生“必须命名”的人物义务。
如果可选字段缺失，仍应输出一个可解析的结构式词典；不要因为可选字段缺失而拒绝整个结果、要求补齐或自行重复生成。
【二十、输出格式｜结构式纯文本绝对契约】
严格只输出结构式纯文本，不要输出 JSON、Markdown 代码围栏、解释、前言、后记或任何结构之外的文字。
使用以下区块标签，标签必须独占一行；每个字段一行，格式为“字段名=值”。值必须保持单行；数组中的多个值使用“；”分隔。没有内容的可写“无”。

[WORLD]
summary=一句话总结这套词典最重要的世界架构亮点
[/WORLD]

[CHARACTER]
id=CHAR_001
name=正式人物姓名
tier=main
origin=blueprint_confirmed 或 dictionary_master_created
coreRole=长期故事职责
identity=身份定位
age=年龄或未知
gender=性别或未知
appearance=外貌或未知
hobby=爱好或无
relation=一句话核心关系摘要
trait=稳定性格核心
catchphrase=口头禅或无
[/CHARACTER]

[RELATION]
a=人物名称
b=人物名称
relation=真实人物关系
note=一句话说明
[/RELATION]

[LOCATION]
name=纯地点名称
type=地点类型
note=关键设定
[/LOCATION]

[PLACE_CONTACT]
from=地名
to=地名
relation=真实地点联系
note=一句话说明
[/PLACE_CONTACT]

[PROPER_NOUN]
name=纯专名
note=来源、机制、功能、限制或故事价值
[/PROPER_NOUN]

[PROPER_CONTACT]
from=专名
to=专名
relation=真实专名联系
note=一句话说明
[/PROPER_CONTACT]

[RULE]
cat=规则类别
scope=适用对象/范围
rule=具体运转规则及违反后果/代价
[/RULE]

[ORGANIZATION]
name=组织名称
type=组织类型
stance=立场或未知
function=功能
relation=与其他实体关系
note=关键说明
[/ORGANIZATION]

[INSTITUTION]
name=机构名称
type=机构类型
function=功能
audience=服务对象
location=所在地点
note=关键说明
[/INSTITUTION]

[ITEM]
name=核心道具名称
type=类型
function=功能
source=来源
limit=限制或代价
note=关键说明
[/ITEM]

[TERM]
name=核心术语
category=分类
meaning=含义
usage=使用方式
note=关键说明
[/TERM]

[HISTORY]
name=历史事件名称
era=时代
participants=参与者
course=经过
impact=影响
relation=与当前世界/主线的关系
[/HISTORY]

[LIFE_SETTING]
name=生活设定名称
category=分类
scope=适用范围
content=具体内容
value=长期创作价值
note=关键说明
[/LIFE_SETTING]

【程序元数据边界】不要输出 sourceType、createdBy、_dictmaster 等程序内部来源字段；这些由 JS 在收录时内部记录。人物的 id/tier/origin/coreRole 属于人物语义与稳定实体锚点，必须保留。

【输出顺序】WORLD 必须最先出现；随后按 CHARACTER → RELATION → LOCATION → PLACE_CONTACT → PROPER_NOUN → PROPER_CONTACT → RULE → ORGANIZATION → INSTITUTION → ITEM → TERM → HISTORY → LIFE_SETTING 的顺序输出。没有真实关系的区块可以完全省略。不要为了凑数量创建虚假关系。
【结构式纯文本要求】不要输出大段散文；不要把字段内容拆成多行；不要输出 JSON 花括号。名称、ID、关系两端必须可由程序直接读取。

【二十一、字段契约】
上述结构式纯文本会由程序转换为内部对象；转换后字段契约仍保持原有 glossary 数据结构。characters：name 必须是纯人物姓名；identity 为身份定位；age/gender/appearance/hobby/relation/catchphrase 没有依据或没有实际价值时可以写“未知/无”；trait 必须尽量明确。relation 简洁说明即可，不要把多组关系堆进人物卡，多组关系放 relationshipTable。

places：name 必须为纯地点名称；type 明确；note 说明关键设定。

propernouns：name 必须为纯专名；note 说明来源、机制、功能、限制或故事价值。

worldRules：必须含 cat、scope、rule；规则必须贴合题材社会性质，可执行、可校验，并尽可能写清运作规则与违反后果/代价。

summary：只用一句话说明时代、主要舞台或基本世界框架，让下游知道故事发生在哪里、属于什么世界。

【二十二、关联表严格要求】
三种关联表全部宁缺毋滥。

relationshipTable：两端必须是人物；a≠b。关系两端允许 AI 使用 CHAR_xxx 或正式姓名，但程序会统一解析为正式人物姓名；如果端点无法映射到已建立人物，必须拒绝该关系，不能让关系表创造人物。
placeContacts：两端必须是地名；from≠to。
properContacts：两端必须是专名；from≠to。

禁止把属性、功能、说明、子项或空字符串当作另一端凑数。

【二十三、输出前最终自检】
在输出结构式纯文本之前必须内部完成以下检查：

A. 蓝本检查：是否完整尊重用户蓝本；是否保留所有明确指定的重要实体；是否修改名称；是否改变主角、核心冲突、题材、世界观方向或人物核心立场。

B. 人物检查：人物是否值得进入核心词典；是否区分 blueprint_confirmed 与 dictionary_master_created；主要人物是否明确 tier=main；主要人物九项基础人物字段是否全部实际完成；identity 与 trait 是否清晰；是否为了填字段虚构爱好或口头禅；是否存在重复人物或同名不同人；主要人物是否经得起删除测试、关系反推、冲突反推和反向场景测试。

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
经过全部检查后，只输出符合第二十、二十一、二十二条契约的结构式纯文本。不要输出 JSON，不要输出解释、Markdown、代码围栏、自检过程或任何结构之外的字符。

最终目标不是生成最多的设定，而是建立一套准确、稳定、自洽、可长期使用，并能够成为整部小说世界基准的「万物设定词典」。尤其要记住：主要人物的 Foundation 人物卡是一次性正式定稿资产，后续词典充实不得补写它，因此不要把关键九项人物基础留成“以后再补”。

记住：词典达人负责创造世界骨架；词典充实负责在骨架上继续长出血肉；前者必须定得准，后者才能扩得稳。`
function buildDictMasterUser(ctx){
  const c=currentCanonicalStoryStrategy() || {};
  const blueprint=c.creativeBlueprint || c.creationBlueprint?.structured || {};
  const anchors=c.originalAnchors || c.anchors || {};
  const dims=Array.isArray(c.strategicDimensions)?c.strategicDimensions:[];
  const parts=[];
  parts.push(`【词典达人唯一故事事实源｜Creative Blueprint】\n方案：${String(c.candidateName||'').trim()}\n${JSON.stringify(blueprint)}`);
  if(Object.keys(anchors||{}).length) parts.push(`【用户原始构想锚点｜仅用于保护用户明确事实】\n${JSON.stringify(anchors)}`);
  if(dims.length) parts.push(`【战略维度｜仅用于取舍，不是第二套故事事实】\n${JSON.stringify(dims)}`);
  parts.push(`【词典达人执行顺序｜人物体系优先】
必须严格按以下顺序执行，不得把“读取 Blueprint 人物”误当成“完成全部人物设计”：
第一步：继承 Blueprint 已确认人物；
第二步：判断核心冲突和长期剧情需要哪些核心人物；
第三步：主动创建缺失但确有必要的新核心人物，并为每人分配稳定 CHAR_xxx、正式姓名、身份、长期故事职责；
第四步：人物集合定稿后再建立核心关系；
第五步：人物体系完成后，再建立地点、组织/机构、专名、世界规则、物件、术语、历史和生活设定。
如果 Blueprint 只有主角一个人物，不得因此默认“人物体系已完成”。必须先判断故事是否需要对手、盟友、导师、亲属、关键阵营人物等；需要就创建，不需要才保持单人物。
新增核心人物不是错误，而是词典达人建立 Foundation Dictionary 的正式职责；但必须“必要优先、数量克制、长期有用”。

【新增核心人物字段约定】
新增人物建议写：id=CHAR_XXX、name=正式姓名、origin=dictionary_master_created、coreRole=长期故事职责、identity=身份、trait=核心特征、relation=与主角/其他核心人物的核心关系。
Blueprint 已确认人物可写 origin=blueprint_confirmed；如果 AI 没有输出 origin/coreRole，JS 可以补默认值，不得因此判失败。

【Foundation Dictionary 最低通行标准】
本次任务的目标不是一次性完成百科全书，而是建立“下游可以安全开写”的最小核心世界骨架。
必须完成：至少1位核心人物；核心人物有正式姓名和基本身份；Creative Blueprint 中真正定义的人物ID（只指 PROTAGONIST.personId / KEY_CHARACTERS.personId 等人物定义字段）必须完成正式姓名映射；Blueprint 已明确的人物核心关系不能丢失；能够确定时代/主要舞台/基本世界；Blueprint 明确写出的世界硬规则不得被主动删除或改成相反规则；必须遵守禁用姓名和安全约束。
可以为空、不得因此失败：地点数量、组织/机构、专有名词、物品、术语、历史、生活设定、关系详细描述、地点关联、专名关联。没有依据就不要硬造；有则收录。
人物详细档案的例外规则：support/非主要人物可以按实际需要简化；但 tier=main 的核心/主要人物必须在本次 Foundation 输出中完成 name + identity、age、gender、appearance、hobby、relation、trait、catchphrase 这九项基础人物字段。确实没有依据时可以写“未知/无”，但不能留空、不能写“待补充/以后再定”。
只有 Blueprint 明确给出世界规则时才需要输出 RULE；没有明确规则时允许 RULE 区块完全省略。
不要因为 RELATIONSHIPS 文本中出现一个未在人物定义区声明的 CHAR_xxx，就创建新人物或把它视为必须命名的人物。
不要为了凑数量生成地点、组织、专名、道具或其他条目。词典充实阶段会继续补全这些内容。
【输入层规则】Creative Blueprint 是唯一故事事实源；不要把 Human View、optimizedIdea、小说简介、全书节拍作为第二套等价事实重复理解。战略维度只用于取舍，不得覆盖 Blueprint。`);
  const ban=banListBlockFor('dictmaster');
  if(ban) parts.push(ban);
  return parts.join('\n\n');
}
function canonicalPersonDefinitions(){
  const c=currentCanonicalStoryStrategy() || {};
  const b=c.creativeBlueprint || c.creationBlueprint?.structured || {};
  const out=[];
  const add=(personId,name,where)=>{
    const id=String(personId||'').trim().toUpperCase();
    const nm=String(name||'').trim();
    if(id && /^CHAR_\d{3,}$/i.test(id)) out.push({id,name:nm,where});
  };
  const p=b.protagonist || {};
  add(p.personId, p.name, 'PROTAGONIST');
  (Array.isArray(b.keyCharacters)?b.keyCharacters:[]).forEach((x,i)=>{
    // 新人物必须带稳定 CHAR_xxx；已有正式姓名的人物可能没有占位 ID，因此只登记真正存在的 ID。
    add(x?.personId, x?.name, `KEY_CHARACTERS[${i+1}]`);
  });
  const seen=new Set();
  return out.filter(x=>{ if(seen.has(x.id)) return false; seen.add(x.id); return true; });
}
function canonicalPersonPlaceholderIds(){
  return canonicalPersonDefinitions().map(x=>x.id);
}
function canonicalCoreRelationships(){
  const c=currentCanonicalStoryStrategy() || {};
  const b=c.creativeBlueprint || c.creationBlueprint?.structured || {};
  const defs=canonicalPersonDefinitions();
  const nameById=new Map(defs.map(x=>[x.id,x.name||x.id]));
  const protagonist=String(b.protagonist?.personId||'').trim().toUpperCase();
  const knownNames=new Set(defs.map(x=>String(x.name||'').trim()).filter(Boolean));
  const resolve=v=>{
    const x=String(v||'').trim();
    const u=x.toUpperCase();
    return nameById.get(u) || (knownNames.has(x) ? x : x);
  };
  const rels=[];
  (Array.isArray(b.relationships)?b.relationships:[]).forEach(r=>{
    const a=resolve(r?.from), b2=resolve(r?.to), rel=String(r?.relation||'').trim();
    if(a && b2 && rel) rels.push({a,b:b2,relation:rel});
  });
  (Array.isArray(b.keyCharacters)?b.keyCharacters:[]).forEach(x=>{
    const n=resolve(x?.personId || x?.name);
    if(protagonist && n && String(x?.relation||'').trim()) rels.push({a:resolve(protagonist),b:n,relation:String(x.relation).trim()});
  });
  const allowed=new Set(defs.flatMap(x=>[String(x.id||'').trim().toUpperCase(),String(x.name||'').trim()]).filter(Boolean));
  const seen=new Set();
  return rels.filter(r=>{
    const a=String(r.a||'').trim(), b=String(r.b||'').trim();
    if(!a || !b || a===b) return false;
    const okA=allowed.has(a)||allowed.has(a.toUpperCase()), okB=allowed.has(b)||allowed.has(b.toUpperCase());
    if(!okA || !okB) return false;
    const k=[a,b,r.relation].map(v=>String(v).trim().toLowerCase()).join('|'); if(seen.has(k)) return false; seen.add(k); return true;
  });
}
function parseDictMasterPlainText(raw){
  let text=String(raw||'').replace(/^```(?:text|plaintext)?\s*/i,'').replace(/\s*```$/,'').trim();
  if(!text) return null;
  const map={WORLD:'world',CHARACTER:'characters',RELATION:'relationshipTable',LOCATION:'places',PLACE_CONTACT:'placeContacts',PROPER_NOUN:'propernouns',PROPER_CONTACT:'properContacts',RULE:'worldRules',ORGANIZATION:'organizations',INSTITUTION:'institutions',ITEM:'items',TERM:'terms',HISTORY:'events',LIFE_SETTING:'lifeSettings'};
  const out={characters:[],relationshipTable:[],places:[],placeContacts:[],propernouns:[],properContacts:[],worldRules:[],organizations:[],institutions:[],items:[],terms:[],events:[],lifeSettings:[],summary:''};
  const re=/^\[([A-Z_]+)\]\s*$([\s\S]*?)^\[\/\1\]\s*$/gmi;
  let m,count=0;
  while((m=re.exec(text))){ const sec=m[1].toUpperCase(),body=m[2]; if(!map[sec]) continue; count++; const obj={}; body.split(/\r?\n/).forEach(line=>{ const ln=line.trim(); if(!ln) return; const k=ln.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*[=:]\s*(.*)$/); if(k) obj[k[1]]=String(k[2]||'').trim(); }); const key=map[sec]; if(sec==='WORLD') out.summary=String(obj.summary||'').trim(); else out[key].push(obj); }
  return count ? out : null;
}

function normalizeDictMasterEntities(j){
  if(!j || !Array.isArray(j.characters)) return j;
  const usedIds=new Set(); let next=1;
  // 先锁定 AI 明确给出的合法 CHAR_ID，再给遗漏 ID 的新增人物分配空闲 ID，避免顺序导致误判重复。
  for(const c of j.characters){
    const id=String(c?.id||'').trim().toUpperCase();
    if(id && /^CHAR_\d{3,}$/.test(id)){
      if(usedIds.has(id)) throw new Error(`词典达人输出人物ID重复：「${id}」`);
      usedIds.add(id);
    }
  }
  const allocId=()=>{ while(usedIds.has(`CHAR_${String(next).padStart(3,'0')}`)) next++; const id=`CHAR_${String(next).padStart(3,'0')}`; usedIds.add(id); next++; return id; };
  const idToName=new Map(), nameToId=new Map();
  for(const c of j.characters){
    if(!c) continue;
    let id=String(c.id||'').trim().toUpperCase();
    if(!id || !/^CHAR_\d{3,}$/.test(id)) id=allocId();
    c.id=id;
    const nm=String(c.name||'').trim();
    if(nm){
      if(nameToId.has(nm) && nameToId.get(nm)!==id) throw new Error(`词典达人输出人物姓名重复：「${nm}」`);
      idToName.set(id,nm); nameToId.set(nm,id);
    }
  }
  if(Array.isArray(j.relationshipTable)){
    j.relationshipTable=j.relationshipTable.map(r=>{
      if(!r) return r;
      const resolve=v=>{ const x=String(v||'').trim(); return idToName.get(x.toUpperCase())||x; };
      return Object.assign({},r,{a:resolve(r.a),b:resolve(r.b)});
    });
  }
  return j;
}

// 421：已移除词典达人的阻塞式质量质检函数；保留解析、规范化与安全写入保护。
function refreshGlossaryCardOnly(){
  const card = document.querySelector('.gs-card');
  if(!card) return false;
  const active = document.activeElement;
  if(active && card.contains(active)) return false; // 不抢占用户正在编辑/操作的词典控件
  const html = glossaryCardHtml();
  if(!html) return false;
  const wrap = document.createElement('div');
  wrap.innerHTML = html.trim();
  const next = wrap.firstElementChild;
  if(!next) return false;
  card.replaceWith(next);
  bindGlossary();
  return true;
}

// 词典达人生成完成后的局部刷新：只替换自己的卡片，不触发全局 render()。
function refreshDictMasterCardOnly(){
  const card = document.querySelector('.dm-card:not(.de-card)');
  if(!card) return false;
  const active = document.activeElement;
  if(active && card.contains(active)) return false;
  const html = dictMasterBlockHtml();
  if(!html) return false;
  const wrap = document.createElement('div');
  wrap.innerHTML = html.trim();
  const next = wrap.firstElementChild;
  if(!next) return false;
  card.replaceWith(next);
  bindDictMaster();
  return true;
}

// 词典充实生成完成后的局部刷新：只替换自己的卡片，不触发全局 render()。
function refreshDictEnrichCardOnly(){
  const card = document.querySelector('.de-card');
  if(!card) return false;
  const active = document.activeElement;
  if(active && card.contains(active)) return false;
  const html = dictEnrichBlockHtml();
  if(!html) return false;
  const wrap = document.createElement('div');
  wrap.innerHTML = html.trim();
  const next = wrap.firstElementChild;
  if(!next) return false;
  card.replaceWith(next);
  bindDictEnrich();
  return true;
}

function collapseGlossaryAfterDictionaryGeneration(save=true){
  state.gsCollapsed = true;
  state.gsCatFold = Object.assign({}, state.gsCatFold || {}, {
    main:true, support:true, walkon:true, place:true, proper:true, sub:true
  });
  if(save) persist();
}

async function genDictMaster(btn){
  const o = state.outline;
  const st = $('#dictmasterStatus');
  if(st){ st.className='status'; st.textContent=''; }
  if(!canRunAI('dictmaster')){ toast('请先完成上游“优化构想”并选中一个方案'); return false; }
  invalidateSchoolDownstream('dictMaster');
  if(!currentCanonicalStoryStrategy()){ toast('先在优化构想中采用一个方案，建立唯一故事战略'); return false; }
  state.originalIdeaSnapshot = String(state.idea || '').trim() || state.originalIdeaSnapshot;
  markAIRunning('dictmaster');
  if(btn) busy(btn,true,'生成基础词典中…');
  if(btn && btn.parentNode) showStopBtn(btn.parentNode);
  let _refreshGlossaryAfterDictMaster = false;
  let _refreshDictMasterCard = false;
  try{
    const spec = resolveActiveSpec('dictmaster');
    const temp = (spec && spec.dictmasterTemp != null) ? spec.dictmasterTemp : 0.4;
    const _dictMasterSystem = getSystemPrompt('dictmaster', {}) + globalCreativeConstraintBlock('dictmaster');
    const _dictMasterUser = buildAIPrompt('dictmaster', {});
    const txt = unwrapAIResult(await callDeepSeek(_dictMasterSystem, _dictMasterUser, {temperature: temp, maxTokens: 32768, signal: _abortCtl?.signal, taskKey:'dictmaster'}));
    let j = parseDictMasterPlainText(txt);
    if(!j){
      const rawTrim=String(txt||'').trim();
      const looksJson=/^[\[{]/.test(rawTrim);
      addGenerationDiagnostic('dictMaster',{type:'STRUCTURE',code:'DICTMASTER_PARSE_PARTIAL',details:looksJson?'AI返回JSON但当前解析器未识别为结构式词典；原文仍保存。':'AI未识别出完整词典结构式；原文仍保存。'});
      state.dictmasterLatest={ts:Date.now(),book:(o.title)||'',raw:rawTrim,parseStatus:'partial'};
      state.dictmasterHistory=Array.isArray(state.dictmasterHistory)?state.dictmasterHistory:[];
      state.dictmasterHistory.unshift(state.dictmasterLatest); if(state.dictmasterHistory.length>6) state.dictmasterHistory=state.dictmasterHistory.slice(0,6);
      state.dictmasterRan=true; markAIDone('dictmaster'); scMark('dictMaster',true); persist(); refreshDictMasterCardOnly();
      toast('基础词典已生成并保存原文；结构化解析未完整，但不再作为生成失败。'); return true;
    }
    try{ normalizeDictMasterEntities(j); }catch(normErr){
      addGenerationDiagnostic('dictMaster',{type:'STRUCTURE',code:'DICTMASTER_NORMALIZE_PARTIAL',details:String(normErr?.message||normErr)});
      state.dictmasterLatest={ts:Date.now(),book:(o.title)||'',raw:String(txt||'').trim(),parseStatus:'partial'}; state.dictmasterRan=true; markAIDone('dictmaster'); scMark('dictMaster',true); persist(); refreshDictMasterCardOnly();
      toast('基础词典已生成并保存原文；结构化规范化未完整，但不再作为生成失败。'); return true;
    }
    // 421：移除词典达人的阻塞式质量质检；结构解析、规范化以及后续名称禁则/安全写入保护仍保留。
    o.glossary = ensureGlossaryKnowledgeShape(o.glossary || { characters:[], places:[], propernouns:[], subplots:[] });
    migrateAndCleanGlossarySources(o.glossary);
    const push = (list,k,mapper)=>{
      const existing = new Set((o.glossary[k]||[]).map(x=>x && String(x.name||'').trim()).filter(Boolean));
      (list||[]).forEach(it=>{
        if((k==='characters'||k==='places'||k==='propernouns') && isScopeBanned('dictmaster','entity') && !filterDictMasterEntry(it,k)) throw new Error(`词典达人命中禁则姓名：${String(it&&it.name||'').trim()}；已拒绝本次词典生成，请按现有重试机制重新生成`);
        const nm=String((it && it.name)||'').trim(); if(!nm) return;
        if(existing.has(nm)) return;   // 同名让位
        o.glossary[k]=o.glossary[k]||[];
        const e = (mapper?mapper(it):{ name:nm, note:String(it.note||'').trim() });
        markGlossaryFoundation(o.glossary,k,e,{how:'词典达人'});
        o.glossary[k].push(e); existing.add(nm);
      });
    };
    push(j.characters, 'characters', c=>({ id:String(c.id||'').trim(), name:String(c.name||'').trim(), tier:(String(c.tier||'').trim().toLowerCase()==='support'?'support':'main'), identity:String(c.identity||'').trim(), age:String(c.age||'').trim(), gender:String(c.gender||'').trim(), appearance:String(c.appearance||'').trim(), hobby:String(c.hobby||'').trim(), relation:String(c.relation||'').trim(), trait:String(c.trait||'').trim(), catchphrase:String(c.catchphrase||'').trim(), origin:String(c.origin||'').trim() || 'dictionary_master', coreRole:String(c.coreRole||'').trim() || '核心人物长期故事职责待补充' }));
    push(j.places, 'places', p=>({ name:String(p.name||'').trim(), type:String(p.type||'').trim(), note:String(p.note||'').trim() }));
    push(j.propernouns, 'propernouns', p=>({ name:String(p.name||'').trim(), note:String(p.note||'').trim() }));
    const masterGeneric = {
      organizations: x=>({name:String(x.name||'').trim(), type:String(x.type||'').trim(), stance:String(x.stance||'').trim(), function:String(x.function||'').trim(), relation:String(x.relation||'').trim(), note:String(x.note||'').trim()}),
      institutions: x=>({name:String(x.name||'').trim(), type:String(x.type||'').trim(), function:String(x.function||'').trim(), audience:String(x.audience||'').trim(), location:String(x.location||'').trim(), note:String(x.note||'').trim()}),
      items: x=>({name:String(x.name||'').trim(), type:String(x.type||'').trim(), function:String(x.function||'').trim(), source:String(x.source||'').trim(), limit:String(x.limit||'').trim(), note:String(x.note||'').trim()}),
      terms: x=>({name:String(x.name||'').trim(), category:String(x.category||'').trim(), meaning:String(x.meaning||'').trim(), usage:String(x.usage||'').trim(), note:String(x.note||'').trim()}),
      events: x=>({name:String(x.name||'').trim(), era:String(x.era||'').trim(), participants:String(x.participants||'').trim(), course:String(x.course||'').trim(), impact:String(x.impact||'').trim(), relation:String(x.relation||'').trim()}),
      lifeSettings: x=>({name:String(x.name||'').trim(), category:String(x.category||'').trim(), scope:String(x.scope||'').trim(), content:String(x.content||'').trim(), value:String(x.value||'').trim(), note:String(x.note||'').trim()})
    };
    Object.entries(masterGeneric).forEach(([k,mapper])=>push(j[k]||[],k,mapper));
    o.glossary._relationshipTable = (j.relationshipTable||[]).map(x=>({ a:String(x.a||'').trim(), b:String(x.b||'').trim(), relation:String(x.relation||'').trim(), note:String(x.note||'').trim(), }));
    o.glossary._placeContacts = (j.placeContacts||[]).map(x=>({ from:String(x.from||'').trim(), to:String(x.to||'').trim(), relation:String(x.relation||'').trim(), note:String(x.note||'').trim(), }));
    o.glossary._properContacts = (j.properContacts||[]).map(x=>({ from:String(x.from||'').trim(), to:String(x.to||'').trim(), relation:String(x.relation||'').trim(), note:String(x.note||'').trim(), }));
    o.glossary._worldRules = (j.worldRules||[]).map(x=>({ cat:String(x.cat||'').trim(), scope:String(x.scope||'').trim(), rule:String(x.rule||'').trim(), }));
    const dmText = x => isScopeBanned('dictmaster','text') ? scrubBannedPhrases(String(x||''), 'dictmaster') : String(x||'');
    const result = { ts: Date.now(), book: (o.title)||'', summary:dmText(j.summary), nChar:(j.characters||[]).length, nPlace:(j.places||[]).length, nProp:(j.propernouns||[]).length, nRel:(j.relationshipTable||[]).length, nPC:(j.placeContacts||[]).length, nPRC:(j.properContacts||[]).length, nWR:(j.worldRules||[]).length, nOrg:(j.organizations||[]).length, nInst:(j.institutions||[]).length, nItem:(j.items||[]).length, nTerm:(j.terms||[]).length, nEvent:(j.events||[]).length, nLife:(j.lifeSettings||[]).length, characters:j.characters||[], rel:j.relationshipTable||[], places:j.places||[], pc:j.placeContacts||[], props:j.propernouns||[], prc:j.properContacts||[], wr:j.worldRules||[], organizations:j.organizations||[], institutions:j.institutions||[], items:j.items||[], terms:j.terms||[], events:j.events||[], lifeSettings:j.lifeSettings||[] };
    result.parseStatus='complete';
    state.dictmasterLatest = result;
    state.dictmasterHistory = Array.isArray(state.dictmasterHistory) ? state.dictmasterHistory : [];
    state.dictmasterHistory.unshift(result);
    if(state.dictmasterHistory.length > 6) state.dictmasterHistory = state.dictmasterHistory.slice(0, 6);   // 第 7 次最旧被挤出
    state.dictmasterRan = true;
    storyState().canon.dictmasterAt=Date.now(); ssEnsureCanonEntities(); ssCaptureMasterSnapshot(); migrateAndCleanGlossarySources(o.glossary); storyState().versions.dictMaster=Number(storyState().versions.dictMaster||0)+1; storyState().pipelineVersion=(Number(storyState().pipelineVersion)||0)+1; storyState().docs=storyState().docs||{}; storyState().docs.worldCanon={version:storyState().versions.dictMaster,source:'dictmaster',ts:Date.now(),counts:{characters:(o.glossary.characters||[]).length,places:(o.glossary.places||[]).length,propernouns:(o.glossary.propernouns||[]).length,worldRules:(o.glossary._worldRules||[]).length,organizations:(o.glossary.organizations||[]).length,institutions:(o.glossary.institutions||[]).length,items:(o.glossary.items||[]).length,terms:(o.glossary.terms||[]).length,events:(o.glossary.events||[]).length,lifeSettings:(o.glossary.lifeSettings||[]).length}};
    // 词典数据已经成功写入后，立即提交“完成”状态。
    // 不再让折叠/渲染等非核心 UI 操作位于完成标记之前，避免“AI 已返回、数据已落地，但界面仍卡在生成中”。
    markAIDone('dictmaster');
    scMark('dictMaster', true);
    collapseGlossaryAfterDictionaryGeneration(false);
    persist();
    refreshDictMasterCardOnly();
    _refreshGlossaryAfterDictMaster = true;
    _refreshDictMasterCard = true;
    toast(`基础词典已生成：人物 ${result.nChar} · 地名 ${result.nPlace} · 专名 ${result.nProp} · 关系 ${result.nRel} · 规则 ${result.nWR} · 组织 ${result.nOrg} · 机构 ${result.nInst} · 道具 ${result.nItem} · 术语 ${result.nTerm} · 历史 ${result.nEvent} · 生活 ${result.nLife}（世界基底已建立）`);
    playEventSound('dictmaster_done');
    return true;
  }catch(e){
    if(e.name !== 'AbortError') addToFixQueue({kind:'dictmaster', error:e.message});
    toast(e.name==='AbortError' ? '已停止生成基础词典' : '基础词典生成失败：'+e.message);
    if(e.name!=='AbortError') reportSoundError('dictmaster', e);
    if(st){ st.className='status err'; st.textContent = e.message; }
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='dictmaster');
    hideStopBtn(); if(btn) busy(btn,false);
    if(_refreshGlossaryAfterDictMaster) refreshGlossaryCardOnly();
    if(_refreshDictMasterCard) refreshDictMasterCardOnly();
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
          <button id="btnCardGenDictMaster" type="button" class="btn small dm-ai-action" style="background:linear-gradient(135deg,#7c3aed 0%,#db2777 52%,#f59e0b 100%);color:#fff;border:0;box-shadow:0 2px 8px rgba(124,58,237,.24);font-weight:700" title="立即生成 / 重新生成词典达人">✨ 生成</button>
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
        <button id="btnCardGenDictMaster" type="button" class="btn small dm-ai-action" style="background:linear-gradient(135deg,#7c3aed 0%,#db2777 52%,#f59e0b 100%);color:#fff;border:0;box-shadow:0 2px 8px rgba(124,58,237,.24);font-weight:700" title="立即生成词典达人">✨ 生成</button>
      </div>
    </div>
    ${locked?`<div class="dm-locked" style="margin:6px 0;color:#2e9e5b;font-size:12px">设定已锁定，可在「编剧学院」中一键迭代。</div>`:''}
    <div class="btn-row"><p class="muted" style="margin:8px 0 0;font-size:12px">尚未生成基础词典，开学后自动构建设定库。</p></div>
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
    <div class="gs-modal-head"><b>🕘 词典达人 · 基础词典历史（${hist.length}/6）</b><button class="gs-x" data-dmh-close>✕</button></div>
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
  const gb = $('#btnCardGenDictMaster'); if(gb) gb.onclick = (e)=>{ e.preventDefault(); e.stopPropagation(); genDictMaster(gb); };
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

const DICT_ENRICH_SYS = `你是一位资深全题材长篇小说「词典充实师」，负责在已经定稿的「词典达人基础词典」基础上，为整部小说继续扩建细节、生活层、环境层和辅助人物素材。

你不是第二个词典达人：你只能在已经确定的世界里继续创造，不能重新定义这个世界。

你将获得两份核心素材：

第一部分：优化构想所选方案的完整内容。

第二部分：词典达人已经生成并正式定稿的全部词典内容。

第二部分是只读世界基准。

【最高权限原则】

本阶段的目标是“增量充实”，不是让每一次生成都完成一份完整词典。输出中只要存在一个或多个合法、可收录的新素材，就应允许系统收录；不要因为可选字段缺失、某一类别没有生成、数量没有达到预期或描述不够丰富而放弃整次结果。

只有以下情况属于真正的拒绝边界：无法识别任何有效条目、明确违反达人词典核心事实、命中系统禁用名称/名称禁则，或数据无法安全写入词典。其余问题优先通过已有解析器和合并逻辑容错处理，而不是要求 AI 反复自检或重新生成。

1. 词典达人已经定稿的实体和设定必须视为正式世界事实。
2. 任何已经存在的人物、地点、专名、世界规则都不得修改。
3. AI 不得给已经存在的实体换名；用户通过人物定名台主动修改姓名不属于词典充实权限，但词典充实必须读取修改后的当前姓名。
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

【人物资源倾向｜约50%，但不是硬比例】
在故事确有足够人物素材的情况下，应把约一半的有效输出资源优先用于人物/角色的补充与深化，尤其是生活层、职业层、关系层、行为细节和可写描写素材；其余资源再用于地点、组织、专名、道具、规则、术语、历史与生活环境。这里的“约50%”只是资源倾向，不是机械配额。素材不足时不得虚构人物、重复已有人物或用空洞字段凑比例。

【一、人物扩建｜只补外围，不重建核心】
词典达人阶段已经先完成“核心人物体系”的建立。这里的 Foundation characters 是只读核心集合，包含 Blueprint 已确认人物，也包含词典达人判断主线必需后主动创建并定稿的新核心人物。
禁止创造新的主角、核心人物、主线关键人物或幕后Boss。你只能在确有生活层、职业层、场景层需要时增加 support/secondary 人物；任何新人物都不得改变或升级 Foundation 核心人物体系。

新增人物默认属于 dictionary_enrichment / support 层，不得把 support 人物升级为核心人物，也不得改写 Foundation 核心人物。

如果输入中已经存在某个 Foundation 人物，即使其某个字段为空，也不能趁“充实”阶段替它补写并覆盖 Foundation；Foundation 是只读事实。需要新增信息时，必须作为新的 enrichment 素材存储，不能回写基础卡。

新增人物应满足：对主线、生活层或世界展示有价值；有基本明确的身份；能够自然进入既有世界。不要求固定数量或一次性完整档案，不要为了数量制造人物。

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

这些内容以“对后续正文有描写价值”为主要标准即可，不要求每条素材都具备复杂背景或长期主线作用。

不要把所有普通生活物件都变成词典实体，但对有明确描写价值的生活素材可以正常收录。

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

【输出格式｜结构式纯文本协议 v2】

只输出纯文本，不输出 JSON，不输出 Markdown 代码块，不解释过程。每条新增内容独占一行，统一使用：类别｜名称｜字段：值；字段：值

【新增主要人物】
主要人物｜姓名｜身份：…；关系：…；外貌：…；性格：…；口头禅：…；描写标签：…

【新增次要配角】
次要配角｜姓名｜身份：…；关系：…；外貌：…；性格：…；口头禅：…；描写标签：…

【新增地名】
地名｜名称｜类型：…；氛围特征：…；说明：…；描写标签：…

【新增组织/势力】
组织｜名称｜类型：…；立场：…；核心职能：…；关系：…；说明：…

【新增职业/机构】
机构｜名称｜类型：…；行业/职能：…；服务对象：…；地点：…；说明：…

【新增物品/道具】
物品｜名称｜类型：…；功能：…；来源：…；使用限制：…；说明：…

【新增世界规则/术语】
规则｜名称｜类别：…；适用范围：…；规则内容：…；代价/限制：…；说明：…
世界观规则｜名称｜类别：…；适用范围：…；规则内容：…；代价/限制：…；说明：…
术语｜名称｜类别：…；含义：…；使用场景：…；说明：…

【新增关系与关联】
人物关系｜人物A｜人物B｜关系：…；说明：…
地名关联｜地名A｜地名B｜关系：…；说明：…
专名关联｜专名A｜专名B｜关系：…；说明：…

【新增历史事件】
事件｜名称｜时间/时代：…；参与方：…；经过：…；影响：…；与主线关系：…

【新增生活设定】
生活设定｜名称｜类别：…；适用地区/群体：…；内容：…；描写价值：…

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

你的新增内容一旦正式收录，也会成为后续正文可以使用的正式创作事实；其来源级别由 JS 在收录时内部标记为 dictionary_enrichment，权威级别低于 Creative Blueprint 与 dictionary_foundation，不得覆盖上游事实。
`;
function buildDictEnrichUser(){
  const o = state.outline || {};
  const parts = [];
  parts.push(storyStateCanonBlock());
  if(stateBanEnabled()){
    const ban = banListBlockFor('dictEnrich');
    if(ban) parts.push(ban);
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

  // (8) 已有扩展世界素材（只读参照）
  const extended = [
    ['组织/势力', g.organizations, x=>`- ${x.name} | 类型:${x.type||''} | 立场:${x.stance||''} | 核心职能:${x.function||''} | 关系:${x.relation||''} | 说明:${x.note||''}`],
    ['职业/机构', g.institutions, x=>`- ${x.name} | 类型:${x.type||''} | 行业/职能:${x.function||''} | 服务对象:${x.audience||''} | 地点:${x.location||''} | 说明:${x.note||''}`],
    ['物品/道具', g.items, x=>`- ${x.name} | 类型:${x.type||''} | 功能:${x.function||''} | 来源:${x.source||''} | 使用限制:${x.limit||''} | 说明:${x.note||''}`],
    ['世界规则', g.rules, x=>`- ${x.name} | 类别:${x.category||''} | 范围:${x.scope||''} | 规则:${x.rule||''} | 代价/限制:${x.limit||''}`],
    ['术语', g.terms, x=>`- ${x.name} | 类别:${x.category||''} | 含义:${x.meaning||''} | 使用场景:${x.usage||''} | 说明:${x.note||''}`],
    ['历史事件', g.events, x=>`- ${x.name} | 时间/时代:${x.era||''} | 参与方:${x.participants||''} | 经过:${x.course||''} | 影响:${x.impact||''} | 主线关系:${x.relation||''}`],
    ['生活设定', g.lifeSettings, x=>`- ${x.name} | 类别:${x.category||''} | 适用范围:${x.scope||''} | 内容:${x.content||''} | 描写价值:${x.value||''}`]
  ];
  extended.forEach(([label,list,fmt])=>{ const arr=Array.isArray(list)?list.filter(x=>x&&String(x.name||'').trim()):[]; if(arr.length) dmSections.push(`【${label}（共 ${arr.length} 项）】\n${arr.map(fmt).join('\n')}`); });

  // (9) 现有路人/龙套（若有）
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

  parts.push('【第三部分：本次词典充实允许做什么】只在 dictionary_foundation 之上增加辅助/外围/生活层素材：次要配角、外围地点、次要组织/机构、辅助专名、次要/生活道具、补充术语、外围历史、生活设定、行业生态、地方习俗、环境细节。禁止重新定义、覆盖、改名或升级任何 Foundation 核心事实；禁止新增主角/核心人物/主线关键人物/幕后Boss；关系只能引用已存在实体，不能借关系偷偷创造核心实体。用户后续通过人物定名台主动改名属于用户授权操作，不属于词典充实权限。所有新增条目的来源标记由 JS 自动写入，不要求 AI 输出 sourceType。');
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
  const res = { characters:[], places:[], propernouns:[], walkons:[], organizations:[], institutions:[], items:[], rules:[], terms:[], events:[], lifeSettings:[], relationshipTable:[], placeContacts:[], properContacts:[], worldRules:[] };
  if(!txt) return res;
  
  let cleaned = String(txt).trim()
    .replace(/^```[a-zA-Z]*\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

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
    const m_cat_prefix = ln.match(/^[【\[\(（]?(主要人物|次要配角|重要角色|配角|人物关系|地名关联|专名关联|世界观规则|地名|专名|路人|龙套|闲人|组织|势力|机构|职业|物品|道具|规则|世界规则|术语|事件|历史事件|生活设定|生活)[】\]\)）]?[：:·\s|｜│┆丨]+(.*)$/);
    let rest = ln;
    if(m_cat_prefix){
      cat = m_cat_prefix[1];
      rest = m_cat_prefix[2].trim();
    }

    let seg = rest.split(/[｜|│┆丨]/).map(s=>String(s||'').trim()).filter(Boolean);
    if(!cat){
      if(seg.length && /^(主要人物|次要配角|重要角色|配角|人物关系|地名关联|专名关联|世界观规则|地名|专名|路人|龙套|闲人|组织|势力|机构|职业|物品|道具|规则|世界规则|术语|事件|历史事件|生活设定|生活)$/.test(seg[0])){
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

    if(/人物关系/.test(cat)){
      const m=parsePairs(detail);
      const bName=String(seg[1]||m['人物B']||m['B']||m['对象']||'').trim();
      const relation=String(m['关系']||m['类型']||'关联').trim();
      const note=String(m['说明']||m['备注']||'').trim();
      if(name && bName) res.relationshipTable.push({a:name,b:bName,relation,note});
      continue;
    }
    if(/地名关联/.test(cat)){
      const to=String(seg[1]||parsePairs(detail)['地名B']||parsePairs(detail)['B']||'').trim();
      const m=parsePairs(detail);
      if(name && to) res.placeContacts.push({from:name,to,relation:String(m['关联']||m['关系']||'连通').trim(),note:String(m['说明']||m['备注']||'').trim()});
      continue;
    }
    if(/专名关联/.test(cat)){
      const m=parsePairs(detail);
      const to=String(seg[1]||m['专名B']||m['B']||'').trim();
      if(name && to) res.properContacts.push({from:name,to,relation:String(m['关联']||m['关系']||'关联').trim(),note:String(m['说明']||m['备注']||'').trim()});
      continue;
    }
    if(/世界观规则/.test(cat) && !/规则/.test(cat.replace('世界观规则',''))){
      const m=parsePairs(detail);
      res.worldRules.push({cat:String(m['类别']||m['类型']||'扩充规则').trim(),scope:String(m['适用范围']||m['范围']||'').trim(),rule:String(m['规则内容']||m['规则']||m['内容']||detail).trim(),limit:String(m['代价/限制']||m['限制']||m['代价']||'').trim(),name});
      continue;
    }
    if(/组织|势力/.test(cat)){
      const m=parsePairs(detail); res.organizations.push({name, type:m['类型']||m['类别']||'', stance:m['立场']||'', function:m['核心职能']||m['职能']||m['功能']||'', relation:m['关系']||'', note:m['说明']||m['备注']||detail}); continue;
    }
    if(/机构|职业/.test(cat)){
      const m=parsePairs(detail); res.institutions.push({name, type:m['类型']||m['类别']||'', function:m['行业/职能']||m['职能']||m['行业']||'', audience:m['服务对象']||'', location:m['地点']||'', note:m['说明']||m['备注']||detail}); continue;
    }
    if(/物品|道具/.test(cat)){
      const m=parsePairs(detail); res.items.push({name, type:m['类型']||m['类别']||'', function:m['功能']||m['用途']||'', source:m['来源']||'', limit:m['使用限制']||m['限制']||'', note:m['说明']||m['备注']||detail}); continue;
    }
    if(/规则|世界规则/.test(cat)){
      const m=parsePairs(detail); res.rules.push({name, category:m['类别']||m['类型']||'', scope:m['适用范围']||m['范围']||'', rule:m['规则内容']||m['规则']||m['内容']||detail, limit:m['代价/限制']||m['限制']||m['代价']||''}); continue;
    }
    if(/术语/.test(cat)){
      const m=parsePairs(detail); res.terms.push({name, category:m['类别']||m['类型']||'', meaning:m['含义']||m['解释']||m['定义']||detail, usage:m['使用场景']||m['场景']||'', note:m['说明']||m['备注']||''}); continue;
    }
    if(/事件|历史事件/.test(cat)){
      const m=parsePairs(detail); res.events.push({name, era:m['时间/时代']||m['时间']||m['时代']||'', participants:m['参与方']||'', course:m['经过']||m['过程']||'', impact:m['影响']||'', relation:m['与主线关系']||m['主线关系']||'', note:m['说明']||''}); continue;
    }
    if(/生活设定|生活/.test(cat)){
      const m=parsePairs(detail); res.lifeSettings.push({name, category:m['类别']||m['类型']||'', scope:m['适用地区/群体']||m['适用范围']||'', content:m['内容']||m['设定']||detail, value:m['描写价值']||m['价值']||'', note:m['说明']||''}); continue;
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
  if(!(res.characters.length || res.places.length || res.propernouns.length || res.walkons.length || res.organizations.length || res.institutions.length || res.items.length || res.rules.length || res.terms.length || res.events.length || res.lifeSettings.length || res.relationshipTable.length || res.placeContacts.length || res.properContacts.length || res.worldRules.length)){
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
  const g = ensureGlossaryKnowledgeShape(o.glossary || { characters:[], places:[], propernouns:[] });
  const n = { c:0, w:0, p:0, k:0, main:0, support:0, organizations:0, institutions:0, items:0, rules:0, terms:0, events:0, lifeSettings:0, relationshipTable:0, placeContacts:0, properContacts:0, worldRules:0 };
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
      // Foundation 是只读事实：词典充实不得回写、补写或覆盖基础人物卡。
      if(isGlossaryFoundation(g,'characters',existing)) return;
      ['identity','age','gender','appearance','hobby','relation','trait','catchphrase'].forEach(f=>{
        if(!existing[f] && it[f]) existing[f] = it[f];
      });
      markGlossaryEnrichment(g,'characters',existing,{how:'词典充实'});
      return;
    }
    it.tier='support';
    markGlossaryEnrichment(g,'characters',it,{how:'词典充实'});
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
      if(isGlossaryFoundation(g,'places',existing)) return;
      if(!existing.type && it.type) existing.type = it.type;
      if(!existing.note && it.note) existing.note = it.note;
      markGlossaryEnrichment(g,'places',existing,{how:'词典充实'});
      return;
    }
    markGlossaryEnrichment(g,'places',it,{how:'词典充实'});
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
      if(isGlossaryFoundation(g,'propernouns',existing)) return;
      if(!existing.note && it.note) existing.note = it.note;
      markGlossaryEnrichment(g,'propernouns',existing,{how:'词典充实'});
      return;
    }
    markGlossaryEnrichment(g,'propernouns',it,{how:'词典充实'});
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
      markGlossaryEnrichment(g,'walkons',existing,{how:'词典充实'});
      return;
    }
    markGlossaryEnrichment(g,'walkons',it,{how:'词典充实'});
    g.walkons.push(it);
    n.w++;
  });

  const ensureArr = key => { if(!Array.isArray(g[key])) g[key]=[]; return g[key]; };
  const mergeGeneric = (key, list) => {
    const arr=ensureArr(key); const names=new Set(arr.map(x=>String(x&&x.name||'').trim()).filter(Boolean));
    (list||[]).forEach(it=>{
      const nm=String(it&&it.name||'').trim(); if(!nm) return;
      const existing=arr.find(x=>String(x&&x.name||'').trim()===nm);
      if(existing){
        // Foundation 资料只读；enrichment 资料允许补齐空字段，但不覆盖已有正式值。
        if(isGlossaryFoundation(g,key,existing)) return;
        Object.keys(it||{}).forEach(f=>{
          if(f==='name' || f==='sourceType' || f.startsWith('_')) return;
          const nv=String(it[f]??'').trim(); const ov=String(existing[f]??'').trim();
          if(!ov && nv) existing[f]=it[f];
        });
        markGlossaryEnrichment(g,key,existing,{how:'词典充实'});
        return;
      }
      markGlossaryEnrichment(g,key,it,{how:'词典充实'}); arr.push(it); names.add(nm); n[key]=(n[key]||0)+1;
    });
  };
  mergeGeneric('organizations',res.organizations); mergeGeneric('institutions',res.institutions); mergeGeneric('items',res.items);
  mergeGeneric('rules',res.rules); mergeGeneric('terms',res.terms); mergeGeneric('events',res.events); mergeGeneric('lifeSettings',res.lifeSettings);

  const mergeAssoc=(key,list,identity)=>{
    const arr=ensureArr(key);
    const index=new Map(arr.map(x=>[identity(x),x]).filter(([k])=>k));
    (list||[]).forEach(it=>{
      const a={...it};
      const id=identity(a); if(!id) return;
      const existing=index.get(id);
      if(existing){
        if(isGlossaryFoundation(g,key,existing)) return;
        ['relation','note','scope','cat','rule','limit'].forEach(f=>{ if(!existing[f] && a[f]) existing[f]=a[f]; });
        markGlossaryEnrichment(g,key,existing,{how:'词典充实'});
        return;
      }
      markGlossaryEnrichment(g,key,a,{how:'词典充实'});
      arr.push(a); index.set(id,a); n[key]=(n[key]||0)+1;
    });
  };
  mergeAssoc('_relationshipTable',res.relationshipTable,x=>{const a=String(x&&x.a||'').trim(),b=String(x&&x.b||'').trim();return a&&b?`rel:${a}|${b}|${String(x.relation||'').trim()}`:'';});
  mergeAssoc('_placeContacts',res.placeContacts,x=>{const a=String(x&&x.from||'').trim(),b=String(x&&x.to||'').trim();return a&&b?`place:${a}|${b}|${String(x.relation||'').trim()}`:'';});
  mergeAssoc('_properContacts',res.properContacts,x=>{const a=String(x&&x.from||'').trim(),b=String(x&&x.to||'').trim();return a&&b?`proper:${a}|${b}|${String(x.relation||'').trim()}`:'';});
  mergeAssoc('_worldRules',res.worldRules,x=>{const rule=String(x&&x.rule||'').trim();return rule?`rule:${String(x.cat||'').trim()}|${String(x.scope||'').trim()}|${rule}`:'';});
  n.total = n.c + n.w + n.p + n.k + n.organizations + n.institutions + n.items + n.rules + n.terms + n.events + n.lifeSettings + n.relationshipTable + n.placeContacts + n.properContacts + n.worldRules;
  return n;
}

const DICT_HARVEST_SYS = `你是一位长篇小说的「正文收编师」。正文创作结束后，系统会把「反复出现/有戏份、但尚未录入词典」的新实体候选名单及其在正文中的出现片段交给你。你的职责是判定哪些应正式收编进「基础词典」，哪些只是已有角色的别名、哪些只是一次性路人。
【判定流程】
1. 对每个候选先做【别名吸附】：它是否只是已有词典人物的 缩略 / 字号 / 绰号 / 异写？
   - 是 → 不新增、不改名，该候选直接跳过，并在结果末尾附一行【已吸附】说明它是哪个已有名的别名。
2. 确属全新角色，且「反复出现或有戏份、值得被词典收编」：按词典充实的格式输出其设定，收编进对应类别（人物/地名/专名/路人）。
3. 只是一次性路人/出场单薄没戏份：不输出（不入典）。
【硬性约束】
· 基础词典已收录的名一律不得重复新增同名，不得改动既有词条。
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
  parts.push(`【基础词典（现有，只读参照：不得改动、不得重复新增同名；用于分辨候选是否为已有名的缩略/字号/绰号）】\n${vis.join('\n')||'（无）'}`);
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
  let _refreshGlossaryAfterHarvest = false;
  try{
    const spec = resolveActiveSpec('dictEnrich');
    const temp = (spec && spec.dictEnrichTemp != null) ? spec.dictEnrichTemp : 0.4;
    const user = buildDictHarvestUser();
    const onStream = delta => { if(stream){ stream.textContent += String(delta||''); stream.scrollTop = stream.scrollHeight; } };
    const res = await callDeepSeek(DICT_HARVEST_SYS, user, { temperature: temp, topP: 0.6, maxTokens: clampMaxTokens('dictEnrich'), onStream, signal:_abortCtl?.signal, taskKey:'dictHarvest' });
    const txt = String(res?.text || '').trim();
    if(res?.finishReason === 'length') addGenerationDiagnostic('dictEnrich',{type:'RUNTIME_OUTPUT',code:'OUTPUT_TRUNCATED_PARTIAL_ACCEPTED',details:'词典充实响应达到输出上限；按增量协议保留并解析已返回内容，不因截断丢弃已有有效条目。',blocking:false});
    if(!txt) throw new Error('未返回收编内容');
    const parsed = parseDictEnrichText(txt);
    const n = mergeDictHarvest(parsed);
    state.outline._dictHarvestText = txt;
    // 收编结果写入成功后立即结束任务状态；折叠/刷新属于非核心 UI 操作，不应阻断完成状态。
    markAIDone('dictEnrich');
    collapseGlossaryAfterDictionaryGeneration(false);
    persist();
    _refreshGlossaryAfterHarvest = true;
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
    if(_refreshGlossaryAfterHarvest) refreshGlossaryCardOnly();
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
  const mark = (it,cat) => { markGlossaryEnrichment(g,cat,it,{how:'正文收编'}); };
  (res.characters||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hi.has(nm)) return;
    mark(it,'characters'); if(it.tier!=='main'&&it.tier!=='support') it.tier='support';
    if(hw.has(nm)){ g.walkons = g.walkons.filter(w=>String(w&&w.name||'').trim()!==nm); hw.delete(nm); n.up++; }
    g.characters.push(it); hi.add(nm); n.c++; if(it.tier==='main') n.main++; else n.support++;
  });
  (res.walkons||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hw.has(nm) || hi.has(nm) || hp.has(nm) || hk.has(nm)) return;
    mark(it,'walkons'); g.walkons.push(it); hw.add(nm); n.w++;
  });
  (res.places||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hp.has(nm) || hi.has(nm)) return;
    mark(it,'places'); g.places.push(it); hp.add(nm); n.p++;
  });
  (res.propernouns||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hk.has(nm)) return;
    mark(it,'propernouns'); g.propernouns.push(it); hk.add(nm); n.k++;
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
  let _refreshGlossaryAfterDictEnrich = false;
  let _refreshDictEnrichCard = false;
  try{
    const spec = resolveActiveSpec('dictEnrich');
    const temp = (spec && spec.dictEnrichTemp != null) ? spec.dictEnrichTemp : 0.4;
    const user = buildDictEnrichUser();
    const onStream = delta => { if(stream){ stream.textContent += String(delta||''); stream.scrollTop = stream.scrollHeight; } };
    const res = await callDeepSeek(DICT_ENRICH_SYS, user, { temperature: temp, topP: 0.6, maxTokens: clampMaxTokens('dictEnrich'), onStream, signal:_abortCtl?.signal, taskKey:'dictEnrich' });
    if(res?.finishReason === 'length') addGenerationDiagnostic('dictEnrich',{type:'RUNTIME_OUTPUT',code:'OUTPUT_TRUNCATED_PARTIAL_ACCEPTED',details:'词典充实响应达到输出上限；按增量协议保留并解析已返回内容，不因截断丢弃已有有效条目。',blocking:false});
    const txt = String(res?.text || '').trim();
    if(!txt) throw new Error('未返回词典充实内容');
    const parsed = parseDictEnrichText(txt) || {};
    const parsedCounts = Object.values(parsed).reduce((n,v)=>n+(Array.isArray(v)?v.length:0),0);
    if(!parsedCounts) addGenerationDiagnostic('dictEnrich',{type:'STRUCTURE',code:'DICTENRICH_PARSE_PARTIAL',details:'词典充实原文已返回，但未解析出结构化条目；仍允许任务完成并保存原文。'});
    if(isScopeBanned('dictEnrich','entity')){
      const allNamed = [parsed.characters,parsed.walkons,parsed.places,parsed.propernouns,parsed.organizations,parsed.institutions,parsed.items,parsed.rules,parsed.terms,parsed.events,parsed.lifeSettings];
      const bad = allNamed.flatMap(arr=>(arr||[]).map(x=>({name:String(x&&x.name||'').trim(),bad:bannedEntityName(x&&x.name)}))).find(x=>x.bad);
      if(bad) throw new Error(`词典充实命中禁则姓名/名称「${bad.name}」：${bad.bad}；已拒绝本次扩充，请按现有重试机制重新生成`);
    }
    // 421：移除词典充实的阻塞式质量质检/有效条目数量闸门；解析结果可为空时仍安全结束，不影响已有词典与后续流程。
    const n = mergeDictEnrich(parsed);
    ssEnsureCanonEntities();
    ssProtectMasterCanon();
    ssEnsureCanonEntities();
    storyState().canon.dictEnrichAt=Date.now(); storyState().versions.dictEnrich=Number(storyState().versions.dictEnrich||0)+1; storyState().pipelineVersion=(Number(storyState().pipelineVersion)||0)+1; storyState().docs=storyState().docs||{}; storyState().docs.worldExpansion={version:storyState().versions.dictEnrich,source:'dictEnrich',ts:Date.now(),added:n};
    state.outline._dictEnrichText = isScopeBanned('dictEnrich','text') ? scrubBannedPhrases(txt, 'dictEnrich') : txt;   // 仅存档（导入/导出时仍保留原文兜底），UI 不再直接渲染
    state.outline._dictEnrichSummary = buildDictEnrichSummary(parsed);
    state.dictEnrichCounts = { c:n.c, w:n.w, p:n.p, k:n.k, main:n.main||0, support:n.support||0, organizations:n.organizations||0, institutions:n.institutions||0, items:n.items||0, rules:n.rules||0, terms:n.terms||0, events:n.events||0, lifeSettings:n.lifeSettings||0, relationshipTable:n.relationshipTable||0, placeContacts:n.placeContacts||0, properContacts:n.properContacts||0, worldRules:n.worldRules||0, ts:Date.now() };
    // 数据已经安全写入词典后，先完成 AI 状态，再做非核心 UI 刷新；避免 render 异常导致“内容已入库但 UI 仍显示未完成”。
    // 1.0.449：词典充实成功后必须向公共学校状态层发出完成信号，供校长/一键老师读取；UI 仍只刷新词典充实自己的卡片。
    scMark('dictEnrich', true, false);
    persist();
    markAIDone('dictEnrich');
    _refreshGlossaryAfterDictEnrich = true;
    _refreshDictEnrichCard = true;
    if(stream) stream.style.display='none';
    toast(`词典已充实：人物 ${n.main||0}/${n.support||0} · 路人 ${n.w||0} · 地名 ${n.p} · 专名 ${n.k} · 世界素材 ${[n.organizations,n.institutions,n.items,n.rules,n.terms,n.events,n.lifeSettings].reduce((a,v)=>a+(Number(v)||0),0)} · 关系/关联 ${[n.relationshipTable,n.placeContacts,n.properContacts].reduce((a,v)=>a+(Number(v)||0),0)} · 世界规则 ${n.worldRules||0}（已并入基础词典，正文可直接选用）`);
    playEventSound('dictEnrich_done');
    return true;
  }catch(e){
    if(e && e.name !== 'AbortError') addToFixQueue({ kind:'dictEnrich', error:'词典充实：'+(e&&e.message) });
    if(!(e && e.name === 'AbortError')) { toast('词典充实失败：'+(e&&e.message)); reportSoundError('dictEnrich', e); }
    if(st){ st.className='status err'; st.textContent=(e&&e.message)||'失败'; }
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='dictEnrich');
    hideStopBtn(); if(btn) busy(btn,false); if(stream) stream.style.display='none';
    if(_refreshGlossaryAfterDictEnrich) refreshGlossaryCardOnly();
    if(_refreshDictEnrichCard) refreshDictEnrichCardOnly();
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
    organizations:(parsed.organizations||[]).length, institutions:(parsed.institutions||[]).length, items:(parsed.items||[]).length, rules:(parsed.rules||[]).length, terms:(parsed.terms||[]).length, events:(parsed.events||[]).length, lifeSettings:(parsed.lifeSettings||[]).length,
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
    c.organizations>0 ? `组织 ${c.organizations}` : null,
    c.institutions>0 ? `机构 ${c.institutions}` : null,
    c.items>0 ? `道具 ${c.items}` : null,
    c.rules>0 ? `规则 ${c.rules}` : null,
    c.terms>0 ? `术语 ${c.terms}` : null,
    c.events>0 ? `事件 ${c.events}` : null,
    c.lifeSettings>0 ? `生活 ${c.lifeSettings}` : null,
  ].filter(Boolean).join(' · ') : '';
  const foldBtn = `<span class="de-carrow">${deCollapsed?'▸':'▾'}</span>`;
  const g = (o && o.glossary) || {};
  const hasWorldKnowledge = ['organizations','institutions','items','rules','terms','events','lifeSettings'].some(k=>Array.isArray(g[k])&&g[k].length);
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
    const nNew = (arr||[]).filter(x=>x&&isGlossaryEnrichment(g,mode||'',x)).length;
    const isCloud = (mode==='cloud');
    const cls = 'de-grid';
    const body = (arr&&arr.length) ? arr.map(it=>{
      const nm = String(it&&it.name||'').trim(); if(!nm) return '';
      const brief = String(it.brief || liveBrief(it) || '').trim() || '（暂无详细简介）';
      const isNew = !!(it && isGlossaryEnrichment(g,mode||'',it));
      const goto = it.gsType ? `data-de-goto="${it.gsType}:${it.gsIdx}"` : '';
      return `<div class="de-item${isNew?' new':''}">
        <button type="button" class="de-chip" style="--h:${hue(nm)}" ${goto} title="点击定位基础词典中的「${esc(nm)}」">${isNew?'✦ ':''}${esc(nm)}</button>
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
        <button id="btnCardGenDictEnrich" type="button" class="btn small dm-ai-action" style="background:linear-gradient(135deg,#7c3aed 0%,#db2777 52%,#f59e0b 100%);color:#fff;border:0;box-shadow:0 2px 8px rgba(124,58,237,.24);font-weight:700" title="立即生成 / 重新生成词典充实">✨ 生成</button>
        ${foldBtn}
      </div>
    </div>
    <div class="de-body"${deCollapsed?' style="display:none"':''}>
      <!-- v1.0.29x：词典充实入口收归「规划师④词典充实」，本卡不再放点击按钮，仅供展示生成内容 -->
      ${stream}
      ${status}
      ${(t || hasWorldKnowledge) ? `<div class="dm-tables" style="margin-top:10px">
        ${(()=>{ const ext=[['🏛️ 组织/势力',g.organizations,'organizations'],['🏢 职业/机构',g.institutions,'institutions'],['🧰 物品/道具',g.items,'items'],['📜 世界规则',g.rules,'rules'],['🔤 术语',g.terms,'terms'],['🕰️ 历史事件',g.events,'events'],['🍜 生活设定',g.lifeSettings,'lifeSettings']]; return ext.map(([lab,arr])=>{ const a=Array.isArray(arr)?arr:[]; if(!a.length) return ''; const body=a.map(x=>{const nm=String(x&&x.name||'').trim(); if(!nm) return ''; const vals=[x.type,x.category,x.function,x.stance,x.meaning,x.rule,x.content,x.note,x.impact].map(v=>String(v||'').trim()).filter(Boolean); const isNew=!!isGlossaryEnrichment(g,'organizations',x)||!!isGlossaryEnrichment(g,'institutions',x)||!!isGlossaryEnrichment(g,'items',x)||!!isGlossaryEnrichment(g,'rules',x)||!!isGlossaryEnrichment(g,'terms',x)||!!isGlossaryEnrichment(g,'events',x)||!!isGlossaryEnrichment(g,'lifeSettings',x); const isFoundation=!isNew && (isGlossaryFoundation(g,'organizations',x)||isGlossaryFoundation(g,'institutions',x)||isGlossaryFoundation(g,'items',x)||isGlossaryFoundation(g,'rules',x)||isGlossaryFoundation(g,'terms',x)||isGlossaryFoundation(g,'events',x)||isGlossaryFoundation(g,'lifeSettings',x)); const src=isFoundation?'基底':'扩充'; return `<div class="de-item${isNew?' new':''}"><span class="de-chip">${isNew?'✦ ':''}${esc(nm)}</span><span class="de-brief-desc dm-rel-txt">[${src}] ${esc(vals.join(' · ')||'（暂无详细简介）')}</span></div>`;}).join(''); return `<details class="dm-fold" open><summary>${lab}（${a.length}）</summary><div class="de-grid">${body}</div></details>`; }).join(''); })()}
        ${deCat('👤 主要人物', liveMain, 'grid')}
        ${deCat('🤝 次要配角', liveSupport, 'grid')}
        ${deCat('🚶 路人龙套', liveWalkons, 'grid')}
      </div>` : `<p class="muted" style="margin-top:4px">已有世界基底；词典充实尚未生成新的扩充内容。</p>`}
    </div>
  </div>`;
}
function bindDictEnrich(){
  const gb = $('#btnCardGenDictEnrich'); if(gb) gb.onclick = (e)=>{ e.preventDefault(); e.stopPropagation(); genDictEnrich(gb); };
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
  const raw=String(text||'').trim();
  const paragraphs=raw.split(/\n\s*\n/).filter(Boolean);
  const last=paragraphs.length?paragraphs[paragraphs.length-1]:raw.slice(-1400);
  // 单个“希望/明天/未来”等词不是失败证据；只有明显的作者式包装、读者引导或抽象升华才触发强审计。
  const futureFeeling=/(从此(?:不同|以后)|这一刻之后|一切都将|一切都会|故事才|新的开始|新的旅程|等待着(?:读者|下一章)|等着看|终会|终将|迟早|总有一天|会有一天|将会|注定|新的篇章|新的征程|未来会更好|以后会更好|总会好起来|终会好起来)/.test(last);
  const readerHookFeeling=/(让人无法(?:不|忽视)|不禁期待|令人期待|谁也不知道接下来|没有人知道接下来|等待着下一章|下一章将|下一步将|会发生什么|究竟会|到底会|还会继续|真正开始|故事正式开始)/.test(last);
  const abstractLift=/(命运的齿轮(?:已经|开始)|命运已经|一切才刚刚|未来会|也许会更好|一切会慢慢好起来)/.test(last);
  const positiveWrap=/(从此[^。！？!?]{0,20}(?:改变|不同)|心里(?:多了|有了|充满)[^。！？!?]{0,18}(?:希望|期待|幸福|满足)|心中(?:多了|有了|充满)[^。！？!?]{0,18}(?:希望|期待|幸福|满足)|对未来(?:充满|有了)|新的篇章|故事正式开始)/.test(last);
  const packaging=/(于是|而这一切|也正因此|这一刻意味着|这意味着|从这一刻起)[^。！？!?]{0,80}(?:未来|希望|期待|意义|命运|新篇章|下一章|接下来)/.test(last);
  const fail=readerHookFeeling||abstractLift||positiveWrap||packaging||(futureFeeling&&/(读者|故事|命运|一切|未来|下一章|新的篇章|从此)/.test(last));
  return {fail,futureFeeling,readerHookFeeling,abstractLift,positiveWrap,packaging,last};
}

function localNarrativeIronAudit(i,text){
  const src=String(text||'').trim();
  const issues=[];
  if(!src) return {status:'FAIL',issues:[{type:'empty',severity:'fail',evidence:'正文为空',expected:'产生有效正文',actual:'空文本',repair:'重新生成正文。'}]};
  // 只对高置信、可确定的模板化重复做本地硬检查；语义质量继续交给现有审计AI。
  const templates=['倏然','眸光','眼底','凤眸','邪魅一笑','轻嗤'];
  templates.forEach(w=>{
    const n=(src.match(new RegExp(w.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&'),'g'))||[]).length;
    if(n>1) issues.push({type:'template_repeat',severity:'fail',evidence:`模板词「${w}」本章出现${n}次`,expected:'同类模板词原则上最多一次',actual:`${n}次`,repair:`减少「${w}」的重复使用，优先改为具体行动、语气或场景信息。`});
  });
  const sentences=src.split(/[。！？!?]+/).map(x=>x.replace(/\s+/g,'').trim()).filter(x=>x.length>=12);
  const seen=new Map();
  sentences.forEach(x=>seen.set(x,(seen.get(x)||0)+1));
  for(const [x,n] of seen){
    if(n>1) issues.push({type:'sentence_duplicate',severity:'fail',evidence:`同句重复${n}次：「${x.slice(0,80)}${x.length>80?'…':''}」`,expected:'避免完全重复的长句',actual:`${n}次`,repair:'删除重复句或改为真正新增的信息。'});
  }
  return {status:issues.length?'FAIL':'PASS',issues};
}
function localChapterHardGate(i,text){
  const issues=[];
  const role='chapter';
  const entityHits=banEntityTextViolations(text,role);
  const textHits=banTextViolations(text,role);
  entityHits.forEach(x=>issues.push({type:'ban_entity',severity:'fail',value:x.value,entityType:x.entityType}));
  textHits.forEach(x=>issues.push({type:'ban_text',severity:'fail',value:x.value}));
  if(state._narrIron!==false){ const iron=localNarrativeIronAudit(i,text); issues.push(...iron.issues); }
  return issues;
}
function assertChapterLocalHardGate(i,text){
  const issues=localChapterHardGate(i,text);
  if(!issues.length) return {ok:true,issues:[]};
  const ban=issues.filter(x=>x.type==='ban_entity'||x.type==='ban_text');
  const iron=issues.filter(x=>x.type!=='ban_entity'&&x.type!=='ban_text');
  const parts=[];
  if(ban.length){
    const entities=ban.filter(x=>x.type==='ban_entity').map(x=>`${x.entityType||'实体'}「${x.value}」`);
    const texts=ban.filter(x=>x.type==='ban_text').map(x=>`文本「${x.value}」`);
    if(entities.length) parts.push('禁用实体命中：'+[...new Set(entities)].slice(0,12).join('、'));
    if(texts.length) parts.push('禁用词/短语/短句命中：'+[...new Set(texts)].slice(0,12).join('、'));
  }
  if(iron.length) parts.push('叙事铁律本地硬检查：'+iron.slice(0,6).map(x=>x.evidence).join('；'));
  const e=new Error(parts.join('；')||'正文未通过本地质量硬门');
  e.code='CHAPTER_LOCAL_HARD_GATE'; e.qualityIssues=issues;
  throw e;
}

function getChapterTeacherRawTextDirect(i){
  const raw=String(getCurrentChapterTeacherRawText(i)||'').trim();
  if(!raw) throw new Error(`第${Number(i)+1}章没有可用的本章纯文本教案，无法启动正文。`);
  return raw;
}

/* v1.0.525：本章词典资料只读注入层。
 * 原则：teacher rawText 是唯一章节教案来源；词典上下文是确定性事实/设定辅助资料，不重写教案、不做第二次AI理解。
 * 发现：只从当前章节 rawText 中命中词典正式名称/_alias；提取：只返回被命中的条目及其直接关联；过滤：不命中不进入正文。
 * 世界观规则属于全局只读规则，始终可见；世界素材仍按本章教案命中后授权进入，避免整本词典无差别注入。
 */
function _dictNameAliases(item, canonical){
  const out=[]; const n=String(canonical||item?.name||'').trim();
  if(n) out.push(n);
  (Array.isArray(item?._alias)?item._alias:[]).forEach(a=>{const x=String(a||'').trim();if(x&&x!==n)out.push(x);});
  return out;
}
function _dictMentioned(item, raw){
  const text=String(raw||'');
  return _dictNameAliases(item).some(n=>n&&text.includes(n));
}
function _dictMatched(arr, raw){
  return (Array.isArray(arr)?arr:[]).filter(x=>x&&String(x.name||'').trim()&&_dictMentioned(x,raw));
}
function _dictFormatEntry(x){
  if(!x || typeof x!=='object') return '';
  // 正文只需要“事实”，不要把数据库字段名（name= / type= / definitions=JSON 等）当成提示词内容。
  const labels={
    name:'名称', type:'类型', category:'类别', identity:'身份', age:'年龄', gender:'性别',
    appearance:'外貌', hobby:'习惯', relation:'关系', trait:'性格', catchphrase:'口头禅',
    function:'作用', meaning:'含义', content:'内容', note:'备注', impact:'影响', usage:'用法',
    value:'价值', scope:'范围', rule:'规则', limit:'限制', stance:'立场', audience:'对象',
    location:'地点', era:'时代', participants:'参与者', course:'经过'
  };
  const keys=Object.keys(labels);
  const parts=[];
  keys.forEach(k=>{
    const v=String(x[k]??'').trim();
    if(!v || /^(?:json|null|undefined|empty|none)$/i.test(v)) return;
    parts.push(`${labels[k]}：${v}`);
  });
  return parts.join('；');
}

function sanitizeChapterWriterContext(raw){
  let out=String(raw||'');
  // 只在“正文最终输入边界”过滤机器噪声，不修改任何底层 state 对象。
  out=out.replace(/\[\s*STYLE_STRATEGY\s*\][\s\S]*?\[\s*\/\s*STYLE_STRATEGY\s*\]/gi,'');
  out=out.replace(/\[\s*PRINCIPAL_CHAPTER\s*\][\s\S]*?\[\s*\/\s*PRINCIPAL_CHAPTER\s*\]/gi,'');
  // 空机器字段：schema= / protocol= / xxxDefinitions=JSON / xxxEntries=JSON 等不得进入正文。
  out=out.replace(/^[ \t]*(?:[A-Za-z_$][\w$]*)(?:Entries|Definitions|Schema|Protocol)\s*=\s*(?:JSON|\{\s*\}|\[\s*\]|null|undefined)?\s*$/gim,'');
  out=out.replace(/^[ \t]*(?:schema|protocol|protocolVersion|parseStatus|sourceBucket|debug|internal|internalId|machine|folded|timestamp|createdAt|updatedAt)\s*=\s*(?:[^\n]*)$/gim,'');
  out=out.replace(/\n{3,}/g,'\n\n').trim();
  return out;
}
function buildChapterDictionaryContext(i){
  const raw=getChapterTeacherRawTextDirect(i);
  const g=ensureGlossaryKnowledgeShape((state.outline&&state.outline.glossary)||{});
  const buckets=[
    ['人物', 'characters', '人物九维', g.characters],
    ['路人龙套', 'walkons', '路人/龙套', g.walkons],
    ['地名', 'places', '地点', g.places],
    ['专名', 'propernouns', '专名', g.propernouns],
    ['组织/势力', 'organizations', '世界素材', g.organizations],
    ['职业/机构', 'institutions', '世界素材', g.institutions],
    ['物品/道具', 'items', '世界素材', g.items],
    ['扩充规则', 'rules', '世界素材', g.rules],
    ['术语', 'terms', '世界素材', g.terms],
    ['历史事件', 'events', '世界素材', g.events],
    ['生活设定', 'lifeSettings', '世界素材', g.lifeSettings]
  ];
  const matched={};
  buckets.forEach(([label,key,kind,arr])=>{matched[key]=_dictMatched(arr,raw);});
  const charNames=new Set((matched.characters||[]).map(x=>String(x.name||'').trim()));
  const placeNames=new Set((matched.places||[]).map(x=>String(x.name||'').trim()));
  const propNames=new Set((matched.propernouns||[]).map(x=>String(x.name||'').trim()));
  const rel=(g._relationshipTable||[]).filter(x=>x&&(charNames.has(String(x.a||'').trim())||charNames.has(String(x.b||'').trim())));
  const pc=(g._placeContacts||[]).filter(x=>x&&(placeNames.has(String(x.from||'').trim())||placeNames.has(String(x.to||'').trim())));
  const prc=(g._properContacts||[]).filter(x=>x&&(propNames.has(String(x.from||'').trim())||propNames.has(String(x.to||'').trim())));
  const worldRules=(g._worldRules||[]).filter(x=>x&&String(x.rule||'').trim());
  const sections=[];
  const chars=matched.characters||[];
  if(chars.length){
    sections.push(`【人物九维｜本章教案命中后从词典提取】\n${chars.map(c=>{
      const vals={identity:c.identity,age:c.age,gender:c.gender,appearance:c.appearance,hobby:c.hobby,relation:c.relation,trait:c.trait,catchphrase:c.catchphrase};
      return `- ${c.name}｜${Object.entries(vals).map(([k,v])=>`${k}=${String(v??'').trim()||'未知'}`).join('｜')}`;
    }).join('\n')}`);
  }
  const simple=[['walkons','路人龙套'],['places','地名'],['propernouns','专名'],['organizations','组织/势力'],['institutions','职业/机构'],['items','物品/道具'],['rules','扩充规则'],['terms','术语'],['events','历史事件'],['lifeSettings','生活设定']];
  simple.forEach(([key,label])=>{const arr=matched[key]||[];if(arr.length)sections.push(`【${label}｜本章教案命中后从词典提取】\n${arr.map(_dictFormatEntry).filter(Boolean).map(x=>'- '+x).join('\n')}`);});
  if(rel.length)sections.push(`【人物关系关联｜仅关联本章已命中人物】\n${rel.map(x=>`- ${x.a} ←${x.relation||'关系'}→ ${x.b}${x.note?`｜${x.note}`:''}`).join('\n')}`);
  if(pc.length)sections.push(`【地名关联｜仅关联本章已命中地点】\n${pc.map(x=>`- ${x.from} ↔ ${x.to}${x.relation?`｜${x.relation}`:''}${x.note?`｜${x.note}`:''}`).join('\n')}`);
  if(prc.length)sections.push(`【专名关联｜仅关联本章已命中专名】\n${prc.map(x=>`- ${x.from} ↔ ${x.to}${x.relation?`｜${x.relation}`:''}${x.note?`｜${x.note}`:''}`).join('\n')}`);
  if(worldRules.length)sections.push(`【世界观规则｜全局只读，不因本章是否命名而丢失】\n${worldRules.map(x=>'- '+_dictFormatEntry(x)).join('\n')}`);
  return sections.length ? `【本章词典/世界资料｜只读辅助上下文】\n以下资料不是第二份教案，不改变老师原始教案；只用于核对人物九维、名称、世界事实、关系和世界运转规则。未列出的词典条目本章不得因词典存在而自行调用。\n\n${sections.join('\n\n')}` : '【本章词典/世界资料｜只读辅助上下文】\n本章教案没有命中可注入的词典条目；不得因为词典存在其它条目而自行扩大。';
}
function sanitizeChapterWriterRawText(raw){
  // 老师原始教案仍是唯一剧情权威；这里只做确定性的机器协议/空字段隔离，绝不重新总结或改写教案。
  return sanitizeChapterWriterContext(raw);
}
function getChapterWriterUser(i){
  // 正文动态内容的唯一主入口：老师本章原始教案。
  // 其它资料只能作为必要的事实/连续性护栏，绝不形成第二份剧情或风格规划。
  const teacher=sanitizeChapterWriterRawText(getChapterTeacherRawTextDirect(i));
  const dict=buildChapterDictionaryContext(i);
  const continuity=(typeof buildChapterContinuityContext==='function')
    ? String(buildChapterContinuityContext(i)||'').trim()
    : '';

  const parts=[
    `【本章老师原始教案｜唯一内容权威】\n${teacher}`,
    sanitizeChapterWriterContext(continuity),
    sanitizeChapterWriterContext(dict)
  ].filter(Boolean);

  // 最后一层只清理空机器字段/历史协议；不删除正常中文事实，不改变老师教案语义。
  return sanitizeChapterWriterContext(parts.join('\n\n'));
}

// 正文最终注入唯一组装入口：正文真实 AI 请求与“注入导出”共用同一份 system/user。
// 默认模式对应正常重生成；resumeTail 仅用于截断续写时追加当前正文末尾上下文。
function buildChapterInjection(i, opts){
  opts = opts || {};
  const system = longChapterSys();
  let user = getChapterWriterUser(i);
  const resumeTail = String(opts.resumeTail||'');
  if(resumeTail){
    user = `${user}\n\n【前文末尾｜仅用于无缝承接】\n${resumeTail}\n\n【续写铁律】只依据上方本章老师教案、其中已经转译完成的三层文学 DNA、合法词典/世界资料与已经写出的正文尾部继续写本章；不得读取、生成或依赖结构化教案链、PlotUnit、ScenePlan、旧骨架或任何结构化教案，也不得读取或重建校长阶段的原始机器风格结构。直接续写自然小说正文，不解释。\n\n【续写要求】从上文中断处无缝继续，不要重复已有内容；完成本章后立即停止，不推进下一章。保持原文叙事节奏、人物称谓和已经确定的文学风格 DNA。`;
  }
  return { system, user, fullText:`【SYSTEM】\n${system}\n\n【USER】\n${user}` };
}

async function writeOneChapterContent(i, user, onPhase, onStream, styleOverride, signal){
  const mt = chapterMaxTokens();
  const rawText=getChapterTeacherRawTextDirect(i);
  // 正文铁律：只读取 chapterCards[n].rawText；该 rawText 必须包含GLOBAL，并按本章实际需要包含HYBRID/CHAPTER。
  if(typeof persist==='function') persist();
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
      // 正文 AI 与“注入导出”共用同一最终注入组装器。
      const injection = buildChapterInjection(i);
      txt = unwrapAIResult(await callDeepSeek(injection.system, injection.user, {maxTokens: mt, onStream: _onStream, temperature: dynamicChapterParams(i).temperature, topP: dynamicChapterParams(i).topP, signal: signal || _abortCtl?.signal, taskKey:'chapter'}));
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
  // app3：章末终止边界审计。发现边界后的模式化总结/未来/正能量收束时，删除最后一个完整段落；不改写正文，只回退到上一个已经完成的自然段。
  const _rawTail=String(content||'').trim();
  const _tail=chapterEndingFeelingAudit(_rawTail);
  if(_tail.fail){
    const paras=_rawTail.split(/\n\s*\n/).filter(x=>x.trim());
    if(paras.length>1){ paras.pop(); content=paras.join('\n\n').trim(); }
  }
  content = enforceChapterBoundary(i, content);
  // 正文进入任何 state/persist 前的本地质量闸门：禁则是硬约束，叙事铁律只做高置信确定性检查。
  assertChapterLocalHardGate(i, content);
  return content;
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
let _dictRedlineOver = false;
function rollCallGlossary(i){
  const o=state.outline||{},g=o.glossary||{},chars=Array.isArray(g.characters)?g.characters:[],places=Array.isArray(g.places)?g.places:[],props=Array.isArray(g.propernouns)?g.propernouns:[];
  if(!chars.length&&!places.length&&!props.length)return '';
  const raw=String(getCurrentChapterTeacherRawText(i)||'').trim(),names=new Set();
  chars.forEach(c=>{const n=String(c&&c.name||'').trim();if(n&&raw.includes(n))names.add(n);});
  const matched=new Set([...names]);
  const lines=[];
  if(matched.size||places.length||props.length){
    const charLines=chars.map(c=>{const n=String(c&&c.name||'').trim();return matched.has(n)?`\n· ${fmtCharFullFields(c).join('，')}`:'';}).filter(Boolean);
    if(charLines.length)lines.push(`人物（老师原始教案直接提及范围）：${charLines.join('')}`);
    const placeNames=places.map(x=>String(x&&x.name||'').trim()).filter(n=>n&&raw.includes(n));
    const propNames=props.map(x=>String(x&&x.name||'').trim()).filter(n=>n&&raw.includes(n));
    if(placeNames.length)lines.push(`本章地点：${placeNames.join('、')}`);
    if(propNames.length)lines.push(`本章专名：${propNames.join('、')}`);
  }
  return lines.length?'【闭卷·点名制设定】\n'+lines.join('\n'):'';
}

function relevantGlossaryForChapter(i){
  const o=state.outline;if(!o)return {characters:[],places:[],propernouns:[]};
  const g=o.glossary||{},raw=String(getCurrentChapterTeacherRawText(i)||'').trim();
  const match=arr=>(g&&Array.isArray(arr)?arr:[]).filter(x=>{const n=String(x?.name||'').trim();return n&&raw.includes(n);});
  return {characters:match(g.characters),places:match(g.places),propernouns:match(g.propernouns)};
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
  if(sum){ sum.disabled = false; }
  const ver = card.querySelector('[data-ver="'+i+'"]');
  if(ver){ ver.textContent = '📚 版本('+chVersions(i).length+')'; }
  const plan = card.querySelector('[data-plan-ch="'+i+'"]');
  if(plan){
    const gi = chapterOfPlan(i);
    plan.title = gi >= 0 ? `查看本章教案（老师${gi+1}）` : '查看本章教案';
  }
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
        badgeHtml = '<i class="tbd-title-tag" style="font-style:normal;font-size:11px;font-weight:400;opacity:.55;margin-left:6px" title="标题尚未由规划阶段定稿，当前沿用第二步参考稿">参考稿</i>';
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
          <span class="muted" style="font-size:11px">AI 审读本章全文、上一章全文、下一章标题与基础词典给 1–3 条点评建议；点击即回填，可再手改</span>
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
    基础词典: `人物：${dictChars||'（无）'}\n地点：${dictPlaces||'（无）'}\n专名：${dictProps||'（无）'}`,
    当前写作风格: chapNames || '无'
  };
}
function aiRefineAdvicePrompt(ctx, raw){
  const _raw = String(raw||'').trim();
  return { system:[
    '你是资深网文长篇编辑。用户在建议框里可能写了一段补充要求（续写、扩写、改段落、修正称呼错别字等），也可能留空、只是想听你对本章正文的专业点评。',
    '请审读给出的【本章全文】【基础词典】【上下文】，输出 1–3 条建议（至少 1 条、最多 3 条）；每条 = { title(一句话定位本条侧重), text(完整点评 + 可直接下发给章节生成 AI 的可执行命令) }。',
    '【允许"无建议"】若本章已写得很稳、没有真正值得动的地方，就只返回 1 条：{"title":"无建议","text":"本章整体稳定，暂不建议改动。"}——宁缺毋滥，绝不为了凑满条数硬找问题或胡说八道。',
    '【点评要点】节奏是否拖沓或太赶、对白是否有辨识度与推进力、悬念与留白是否给足、人物言行是否与基础词典中的身份/性格/关系一致（有无OOC）、是否承接上一章结尾、是否为下一章（'+ (ctx.下一章标题||'') +'）留好引子、与基础词典命名/设定是否冲突。',
    '【有补充要求时】先满足用户要求（'+ (_raw? _raw.slice(0,120)+'…' : '（用户未给出方向）') +'）的角度，再在该方向之外综合点评；要求为空时直接审读本章正文点评。',
    '【可执行】text 用对章节 AI 说的祈使句，明确范围与幅度，可行时用换行拆 2–3 个可独立启用的子要点；续写/扩写必须承接本章与上一章结尾、不越界到下一章；不臆造基础词典外的新名。',
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
    const user = getChapterTeacherRawTextDirect(i);
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
  try{
    if(!state.chapters?.[i]) throw new Error(`未找到第${i+1}章章节数据`);
    const chapterNo=Number(i)+1,groups=teacherAssignmentGroups();
    const g=groups.find(x=>chapterNo>=Number(x.first||1)&&chapterNo<=Number(x.last||Infinity));
    const t=g?teacherResultForAssignmentGroup(g).t:null;
    const rawText=String(t?.chapterCards?.chapters?.[chapterNo]?.rawText||'').trim();
    if(!rawText) throw new Error(`第${chapterNo}章尚未取得按本章头尾切出的纯文本教案，请先在对应老师卡片点击「✂️ 切割教案」`);
  }catch(e){
    const msg=String(e?.message||e||'正文生成前置检查失败');
    chState[i]='error';
    patchChapter(i);
    const st0=$('#chStatus');
    if(st0){ st0.className='status err'; st0.textContent=`第${i+1}章生成失败：${msg}`; }
    toast(`第${i+1}章生成失败：${msg}`);
    return false;
  }
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
    const user = getChapterWriterUser(i);
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
    let txt = await writeOneChapterContent(i, user, setPhase, onStream, opt.styleOverride);   // 各阶段经 setPhase 上报，正文流式实时字数经 onStream；v2.0 支持本章风格覆盖
    snapshotChapterVersion(i);
    state.chapters[i].content = txt;
    updateFactCardFromChapter(i, txt);
    if(isLong()){ const fin=await finalizeChapterState(i, txt); if(fin.content!==txt){ txt=fin.content; assertChapterLocalHardGate(i, txt); state.chapters[i].content=txt; snapshotChapterVersion(i); persist(); } if(fin.blocked) throw new Error(`第${i+1}章未通过正文硬审核：${fin.audit?.blockReason||fin.audit?.summary||'存在未修复的审核问题'}`); }
    invalidateChapterMemory(i);
    chState[i] = 'done';
    if(!isLong()) state.chapters[i].confirmed = false;
    persist();                       // 不整页 render，仅定点刷新
    patchChapter(i);
    if(st){ st.className='status ok'; st.textContent = `第 ${i+1} 章已生成。`; }
    toast('第'+(i+1)+'章完成');
    playEventSound('chapter_regen_done');
    generateRollingSummaries().catch(()=>{});
  }catch(e){
    if(e.name==='AbortError'){ if(st) st.textContent = '第'+(i+1)+'章已停止生成'; }
    else { chState[i] = 'error'; patchChapter(i); if(st){ st.className='status err'; st.textContent = '第'+(i+1)+'章生成失败：'+e.message; } toast('第'+(i+1)+'章生成失败：'+e.message); reportSoundError('chapter_regen', e); }
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
    const txt = await writeOneChapterContent(idx, getChapterTeacherRawTextDirect(idx), null, onStream);
    assertChapterLocalHardGate(idx, txt);
    snapshotChapterVersion(idx);
    state.chapters[idx].content = txt;
    updateFactCardFromChapter(idx, txt); if(isLong()){ const fin=await finalizeChapterState(idx, txt); if(fin.content!==txt){ txt=fin.content; assertChapterLocalHardGate(idx, txt); state.chapters[idx].content=txt; snapshotChapterVersion(idx); } if(fin.blocked) throw new Error(`第${idx+1}章未通过正文硬审核：${fin.audit?.blockReason||fin.audit?.summary||'存在未修复的审核问题'}`); }
    persist();
    invalidateChapterMemory(idx);
  }
  generateRollingSummaries().catch(()=>{});
}

async function genNChapters(start, n){
  if(n <= 0) return;
  markAIRunning('chapter');
  const failedChapters=[];
  try{
  for(let k=0; k<n; k++){
    const idx = start + k;
    const chapterNo=Number(idx)+1,groups=teacherAssignmentGroups();
    const g=groups.find(x=>chapterNo>=Number(x.first||1)&&chapterNo<=Number(x.last||Infinity));
    const t=g?teacherResultForAssignmentGroup(g).t:null;
    const rawText=String(t?.chapterCards?.chapters?.[chapterNo]?.rawText||'').trim();
    if(!rawText){
      chState[idx]='error';
      const msg=`第${chapterNo}章尚未取得按本章头尾切出的纯文本教案，请先在对应老师卡片点击「✂️ 切割教案」`;
      failedChapters.push({chapter:idx+1,error:msg});
      patchChapter(idx);
      continue;
    }
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
            const res = await callDeepSeek(longChapterSys(), getChapterWriterUser(idx), {maxTokens: chapterMaxTokens(), onStream, temperature: _dyn.temperature, topP: _dyn.topP, signal: _abortCtl?.signal, taskKey:'chapter'});
            txt = res.text; finishReason = res.finishReason;
          } else {
            const res = await callDeepSeek(PROMPTS.chapterSys, getChapterWriterUser(idx), {maxTokens: chapterMaxTokens(), temperature: _dyn.temperature, topP: _dyn.topP, signal: (_abortCtl && _abortCtl.signal), taskKey:'chapter'});
            txt = res.text; finishReason = res.finishReason;
          }
          if(finishReason === 'length'){
            txt = await continueTruncatedChapter(idx, txt);
            finishReason = 'stop';
          }
        }
        let content = enforceChapterBoundary(idx, String(txt||'').trim());
        // 批量正文与单章正文使用同一个本地硬门；通过后才允许写入正式章节状态。
        assertChapterLocalHardGate(idx, content);
        snapshotChapterVersion(idx);
        state.chapters[idx].content = content;
        if(!isLong()) state.chapters[idx].confirmed = false;
        delete state._chapterPartial[idx];   // 正文落库即清流式缓存，避免已完成章残留"可续写"态
        state._chapterRetryFix = '';
        updateFactCardFromChapter(idx, content);
        if(isLong()){ const fin=await finalizeChapterState(idx, content); if(fin.content!==content){ content=fin.content; assertChapterLocalHardGate(idx, content); state.chapters[idx].content=content; snapshotChapterVersion(idx); persist(); } if(fin.blocked){ throw new Error(`第${idx+1}章未通过正文硬审核：${fin.audit?.blockReason||fin.audit?.summary||'存在未修复的审核问题'}`); } }
        assertChapterLocalHardGate(idx, content);
        persist();
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
          failedChapters.push({chapter:idx+1,error:String(e?.message||e)});
          patchChapter(idx);
          // 单章正文 AI 失败只标记本章，不中断后续章节；其他正文 AI 继续独立运行。
          break;
        }
      }
    }
  }
  generateRollingSummaries().catch(()=>{});
  if(failedChapters.length){
    const detail=failedChapters.map(x=>`第${x.chapter}章：${x.error}`).join('；');
    toast(`本批有 ${failedChapters.length} 章正文生成失败，但其他章节未被阻塞：${detail}`);
  }
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='chapter');
    state.aiNetwork.completed = Array.from(new Set([...(state.aiNetwork.completed||[]), 'chapter']));
    persist();
  }
}

async function continueTruncatedChapter(i, firstPart, resumeFrom){
  const full=resumeFrom?String(resumeFrom||''):String(firstPart||''),tail=full.slice(-800);
  const chapterNo=Number(i)+1,groups=teacherAssignmentGroups();const g=groups.find(x=>chapterNo>=Number(x.first||1)&&chapterNo<=Number(x.last||Infinity));const t=g?teacherResultForAssignmentGroup(g).t:null;
  const rawText=String(t?.chapterCards?.chapters?.[chapterNo]?.rawText||'').trim();if(!rawText)throw new Error(`第${chapterNo}章缺少按章头尾切出的纯文本教案，无法续写正文。`);
  const injection=buildChapterInjection(i,{resumeTail:tail});
  const user=injection.user;
  let secondPartial = '';
  const res = await callDeepSeek(injection.system, user, {maxTokens: clampMaxTokens('continue'), taskKey:'chapter', onStream: (delta)=>{
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
    if(!validateWarn()) return;
    const sv = parseInt(s.value), ev = parseInt(e.value);
    const n = ev - sv + 1;
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
    for(let k=0;k<n;k++){ const ci=start+k; if(chState[ci] !== 'error' && state.chapters[ci]?.content && String(state.chapters[ci].content).trim()) chState[ci] = 'done'; patchChapter(ci); }
    const rem = remainingEmptyChapters();
    if(st){ st.className='status ok'; st.textContent = isLong()
      ? (rem > 0 ? `本批共 ${n} 章已生成，全书还剩 ${rem} 章未写。` : `全部章节已写完（共 ${totalCh} 章）。`)
      : '全部章节已生成，请审阅并标记确认。'; }
    if(rem <= 0 && isLong()) toast(`已全部写完（共 ${totalCh} 章）`);
    if(isLong()){
      const targetPage = Math.floor(start / CH_PAGE_SIZE);
      if(Math.abs(chPage - targetPage) >= 1){ chPage = targetPage; renderChapters(); }
    }
    // 正文批量任务完成只做局部管线/章节刷新，避免后台 AI 任务重建整个 #view。
    patchChapter(start);
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
  const user = getChapterTeacherRawTextDirect(i);
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
  renderThemeSoundUpgrade();
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
    <!-- v427：消息看板调整为「叙事」下拉菜单第一项；仅调整显示顺序，不改变功能与事件绑定 -->
    <button class="ne-menu-item" data-ne-panel="toastboard"><span class="ne-ico">📋</span><span class="ne-lbl">消息看板</span>${(()=>{const n=toastLogGet().length; return n?`<span class="ne-badge info">${n}</span>`:'';})()}</button>
    <button class="ne-menu-item" data-ne-panel="resume"><span class="ne-ico">▶️</span><span class="ne-lbl">流式续写状态</span>${partialN?`<span class="ne-badge">${partialN}</span>`:''}</button>
    <button class="ne-menu-item" data-ne-panel="facts"><span class="ne-ico">📎</span><span class="ne-lbl">事实与一致性看板</span></button>
    <button class="ne-menu-item" data-ne-panel="resumesum"><span class="ne-ico">📜</span><span class="ne-lbl">滚动摘要</span></button>
    <button class="ne-menu-item" data-ne-panel="check"><span class="ne-ico">🩺</span><span class="ne-lbl">一致性自检</span></button>
    <button class="ne-menu-item" data-ne-panel="chapterRegression"><span class="ne-ico">🧪</span><span class="ne-lbl">新链真实章节回归</span></button>
    <button class="ne-menu-item" data-ne-panel="iron"><span class="ne-ico">📌</span><span class="ne-lbl">叙事铁律（写作总纲）</span>${state._narrIron!==false?'<span class="ne-badge ok">ON</span>':'<span class="ne-badge">OFF</span>'}</button>
    <button class="ne-menu-item" data-ne-panel="naming"><span class="ne-ico">👤</span><span class="ne-lbl">人物定名台</span>${state.characterNaming&&state.characterNaming.locked?'<span class="ne-badge ok">LOCK</span>':''}</button>
    <button class="ne-menu-item" data-ne-panel="banlist"><span class="ne-ico">🚫</span><span class="ne-lbl">禁则清单</span>${stateBanEnabled()?'<span class="ne-badge ok">ON</span>':'<span class="ne-badge">OFF</span>'}</button>
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
    else if(panel==='naming') renderCharacterNamingPanel();
    else if(panel==='facts') openFactCardModal();
    else if(panel==='resumesum') openRollingSummaryModal();
    else if(panel==='check') openConsistencyCheck();
    else if(panel==='chapterRegression') openRealChapterRegressionPanel();
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


function _banScopeCheckboxesHtml(prefix, scopes, active){
  const labels=[['ideaOptimization','优化构想'],['dictmaster','词典达人'],['dictEnrich','词典充实'],['principal','校长'],['teacher','老师'],['chapter','正文']];
  return labels.map(([k,l])=>`<label class="mini-check"><input type="checkbox" data-bl-${prefix}-scope="${k}" ${active.includes(k)?'checked':''}> ${l}</label>`).join('');
}
function _banListArea(label, key, items, placeholder){
  return `<label class="kv"><span class="k">${label}</span><textarea data-bl-list="${key}" rows="3" placeholder="每行一个，也可用逗号分隔">${esc(items.join('\n'))}</textarea></label>`;
}
function _banScopeArrFromModal(m,prefix,fallback){
  const nodes=[...m.querySelectorAll(`[data-bl-${prefix}-scope]`)];
  if(!nodes.length) return fallback.slice();
  return nodes.filter(x=>x.checked).map(x=>x.dataset.blScope);
}
function renderBanListPanel(){
  const b=banListRaw();
  const html=`
  <div class="ne-body ne-bl-body">
    <div class="ne-bl-enable"><label class="mini-check"><input type="checkbox" data-bl-enabled ${stateBanEnabled()?'checked':''}> <b>总开关：启用「禁则清单」</b></label></div>
    <div class="bl-note muted">现在把“实体名称”和“文本片段”彻底分开。关闭其中一套，不会影响另一套。实体名称默认按完整名称精确匹配；旧版“禁用字”不会默认启用，避免一个汉字误伤大量名称。</div>

    <section style="margin-top:12px;padding:12px;border:1px solid rgba(99,102,241,.22);border-radius:14px;background:rgba(99,102,241,.05)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><b>👤 实体名称禁则</b><label class="mini-check"><input type="checkbox" data-bl-entity-enabled ${b.entity.enabled!==false?'checked':''}> 启用</label></div>
      <div class="bl-note muted">针对人名、地名、其他专名。默认精确匹配完整实体名称，不按单个汉字误伤。</div>
      <div class="btn-row"><button class="btn primary" data-bl-character-naming>👤 打开人物定名台</button></div>
      <label class="mini-check"><input type="checkbox" data-bl-person-enabled ${b.entity.person.enabled!==false?'checked':''}> 人名</label>
      <label class="mini-check"><input type="checkbox" data-bl-place-enabled ${b.entity.place.enabled!==false?'checked':''}> 地名</label>
      <label class="mini-check"><input type="checkbox" data-bl-proper-enabled ${b.entity.properNoun.enabled?'checked':''}> 其他专名</label>
      ${_banListArea('禁用人名','personNames',b.entity.person.names,'顾沉、苏晚')}
      ${_banListArea('禁用地名','placeNames',b.entity.place.names,'黑石城、青云镇')}
      ${_banListArea('禁用其他专名','properNames',b.entity.properNoun.names,'组织、机构、独有名词')}
      <details style="margin-top:8px"><summary><b>⚙ 高级：按字禁止</b></summary><div class="bl-note muted">默认关闭。开启后才会把“晚”这类单字当作人名/地名组成规则，而不是全局禁字。</div>
        <label class="mini-check"><input type="checkbox" data-bl-person-char ${b.entity.person.charRulesEnabled?'checked':''}> 人名按字匹配</label>
        <input data-bl-list="personChars" value="${esc(b.entity.person.chars.join(', '))}" placeholder="例如：晚,砚,秋"/>
        <label class="mini-check"><input type="checkbox" data-bl-place-char ${b.entity.place.charRulesEnabled?'checked':''}> 地名按字匹配</label>
        <input data-bl-list="placeChars" value="${esc(b.entity.place.chars.join(', '))}" placeholder="例如：城,镇"/>
      </details>
      <div style="margin-top:10px"><b>实体禁则生效范围</b><div class="ne-bl-scope">${_banScopeCheckboxesHtml('entity',b.entityScopeAi,b.entityScopeAi)}</div></div>
    </section>

    <section style="margin-top:12px;padding:12px;border:1px solid rgba(16,185,129,.22);border-radius:14px;background:rgba(16,185,129,.05)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><b>📝 文本禁则</b><label class="mini-check"><input type="checkbox" data-bl-text-enabled ${b.text.enabled!==false?'checked':''}> 启用</label></div>
      <div class="bl-note muted">与人名/地名完全独立。词汇、短语、短句可以分别开关。</div>
      <label class="mini-check"><input type="checkbox" data-bl-word-enabled ${b.text.words.enabled!==false?'checked':''}> 词汇</label>
      ${_banListArea('禁用词汇','words',b.text.words.items,'例如：眸光、不由得')}
      <label class="mini-check"><input type="checkbox" data-bl-phrase-enabled ${b.text.phrases.enabled!==false?'checked':''}> 短语</label>
      ${_banListArea('禁用短语','phrases',b.text.phrases.items,'例如：天刚蒙蒙亮、破旧的窗棂')}
      <label class="mini-check"><input type="checkbox" data-bl-sentence-enabled ${b.text.sentences.enabled!==false?'checked':''}> 短句</label>
      ${_banListArea('禁用短句','sentences',b.text.sentences.items,'每行一句完整句子')}
      <div style="margin-top:10px"><b>文本禁则生效范围</b><div class="ne-bl-scope">${_banScopeCheckboxesHtml('text',b.textScopeAi,b.textScopeAi)}</div></div>
    </section>

    <section style="margin-top:12px"><div class="ne-bl-rules-head"><b>附加规则</b> <button class="btn small" data-bl-rule-add>＋ 新增规则</button></div><div data-bl-rules-host></div></section>
    <div class="btn-row"><button class="btn primary" data-bl-save>保存禁则</button><button class="btn ghost" data-bl-reset>恢复默认</button></div>
  </div>`;
  openNeModal('禁则清单',html);
  const m=$('#neModal');
  const renderRules=()=>{
    const cur=normalizeBanList(state.banList)||normalizeBanList(BANLIST_DEFAULT);
    const host=m.querySelector('[data-bl-rules-host]'); if(!host)return;
    host.innerHTML=(cur.rules||[]).map((r,i)=>`<div class="ne-bl-rule"><label>生效 AI：<select data-bl-rule-ai="${i}">${['ideaOptimization','dictmaster','dictEnrich','principal','teacher','chapter'].map(k=>`<option value="${k}" ${(r.ai||[]).includes(k)?'selected':''}>${({'ideaOptimization':'优化构想',dictmaster:'词典达人',dictEnrich:'词典充实',principal:'校长',teacher:'老师',chapter:'正文'})[k]}</option>`).join('')}</select></label><textarea data-bl-rule-text="${i}" rows="2">${esc(r.text||'')}</textarea><button class="btn small ghost" data-bl-rule-del="${i}">删除</button></div>`).join('')||'<div class="muted">暂无附加规则。</div>';
  };
  renderRules();
  m.querySelector('[data-bl-rule-add]')?.addEventListener('click',()=>{const cur=normalizeBanList(state.banList)||normalizeBanList(BANLIST_DEFAULT);cur.rules.push({text:'',ai:['chapter']});state.banList=cur;renderRules();});
  m.querySelector('[data-bl-rule-rules]');
}
function handleBanListAction(e){
  const m=$('#neModal'); if(!m || (m.style.display==='none'&&m.classList?.contains('hidden')) || !m.contains(e.target)) return false;
  const naming=e.target.closest('[data-bl-character-naming]'); if(naming){renderCharacterNamingPanel();return true;}
  const del=e.target.closest('[data-bl-rule-del]'); if(del){const cur=normalizeBanList(state.banList)||normalizeBanList(BANLIST_DEFAULT);const i=+del.dataset.blRuleDel;cur.rules.splice(i,1);state.banList=cur;renderBanListPanel();return true;}
  const save=e.target.closest('[data-bl-save]'); if(save){
    const cur=normalizeBanList(state.banList)||normalizeBanList(BANLIST_DEFAULT), val=k=>{const x=m.querySelector(`[data-bl-list="${k}"]`);return x?x.value.trim():'';}, arr=k=>val(k).split(/[,，\n]/).map(x=>x.trim()).filter(Boolean);
    cur.enabled=!!m.querySelector('[data-bl-enabled]')?.checked;
    cur.entity.enabled=!!m.querySelector('[data-bl-entity-enabled]')?.checked;
    cur.entity.person.enabled=!!m.querySelector('[data-bl-person-enabled]')?.checked;
    cur.entity.place.enabled=!!m.querySelector('[data-bl-place-enabled]')?.checked;
    cur.entity.properNoun.enabled=!!m.querySelector('[data-bl-proper-enabled]')?.checked;
    cur.entity.person.names=arr('personNames'); cur.entity.place.names=arr('placeNames'); cur.entity.properNoun.names=arr('properNames');
    cur.entity.person.chars=arr('personChars'); cur.entity.place.chars=arr('placeChars');
    cur.entity.person.charRulesEnabled=!!m.querySelector('[data-bl-person-char]')?.checked; cur.entity.place.charRulesEnabled=!!m.querySelector('[data-bl-place-char]')?.checked;
    cur.text.enabled=!!m.querySelector('[data-bl-text-enabled]')?.checked; cur.text.words.enabled=!!m.querySelector('[data-bl-word-enabled]')?.checked; cur.text.phrases.enabled=!!m.querySelector('[data-bl-phrase-enabled]')?.checked; cur.text.sentences.enabled=!!m.querySelector('[data-bl-sentence-enabled]')?.checked;
    cur.text.words.items=arr('words'); cur.text.phrases.items=arr('phrases'); cur.text.sentences.items=arr('sentences');
    const readScope=p=>{const out=[];m.querySelectorAll(`[data-bl-${p}-scope]`).forEach(x=>{if(x.checked)out.push(x.dataset.blScope)});return out;};
    cur.entityScopeAi=readScope('entity'); cur.textScopeAi=readScope('text');
    m.querySelectorAll('[data-bl-rule-text]').forEach(t=>{const i=+t.dataset.blRuleText;const sel=m.querySelector(`[data-bl-rule-ai="${i}"]`);if(cur.rules[i]){cur.rules[i].text=t.value.trim();cur.rules[i].ai=sel&&sel.value?[sel.value]:[];}});cur.rules=cur.rules.filter(r=>r&&r.text);
    // 兼容旧字段：把新数据同步到旧字段，但运行时只读取新结构。
    cur.names=cur.entity.person.names.slice();cur.chars=cur.entity.person.chars.slice();cur.phrases=[...new Set([...cur.text.words.items,...cur.text.phrases.items,...cur.text.sentences.items])];cur.scopeAi=cur.entityScopeAi.slice();
    // 保存链路：读取 UI → 规范化 → 落盘 → 重新读取最终状态，确保总开关与空范围不会被迁移逻辑覆盖。
    state.banList=normalizeBanList(cur);
    persist();
    state.banList=normalizeBanList(state.banList);
    renderNarrativeEngineMenu();
    toast(stateBanEnabled()?'禁则清单已保存并全局生效':'禁则清单已保存：总开关已关闭');
    return true;
  }
  const reset=e.target.closest('[data-bl-reset]');if(reset){state.banList=null;persist();renderNarrativeEngineMenu();toast('已恢复默认禁则清单');return true;}
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

function ensureCharacterIdsForNaming(){
  const g=ensureGlossaryKnowledgeShape((state.outline&&state.outline.glossary)||{});
  const used=new Set(); let next=1;
  (g.characters||[]).forEach(c=>{const id=String(c&&c.id||'').trim().toUpperCase(); if(/^CHAR_\d{3,}$/.test(id)) used.add(id);});
  const alloc=()=>{while(used.has(`CHAR_${String(next).padStart(3,'0')}`)) next++; const id=`CHAR_${String(next).padStart(3,'0')}`; used.add(id); next++; return id;};
  (g.characters||[]).forEach(c=>{ if(c && !/^CHAR_\d{3,}$/i.test(String(c.id||''))) c.id=alloc(); else if(c) c.id=String(c.id).trim().toUpperCase(); });
  return g;
}
function replaceExactInObject(root, oldName, newName, seen){
  if(root==null || typeof root!=='object') return 0; seen=seen||new Set(); if(seen.has(root)) return 0; seen.add(root); let n=0;
  if(Array.isArray(root)){ root.forEach((v,i)=>{ if(typeof v==='string' && v===oldName){root[i]=newName;n++;} else if(v&&typeof v==='object') n+=replaceExactInObject(v,oldName,newName,seen); }); return n; }
  Object.keys(root).forEach(k=>{ const v=root[k]; if(typeof v==='string' && v===oldName){root[k]=newName;n++;} else if(v&&typeof v==='object') n+=replaceExactInObject(v,oldName,newName,seen); });
  return n;
}
function renameCharacterById(id,newName){
  const g=ensureCharacterIdsForNaming(); const c=(g.characters||[]).find(x=>String(x&&x.id||'').toUpperCase()===String(id||'').toUpperCase());
  const nn=String(newName||'').trim(), old=String(c&&c.name||'').trim();
  if(!c) return {ok:false,msg:'未找到该人物'}; if(!nn) return {ok:false,msg:'姓名不能为空'}; if(old===nn) return {ok:true,msg:'姓名未变化',changed:0};
  if(state.characterNaming && state.characterNaming.locked) return {ok:false,msg:'人物姓名已经锁定，请先解除姓名锁定'};
  const custom=banListViolation(nn); if(custom) return {ok:false,msg:`新姓名命中用户硬禁则：${custom}`};
  const dup=(g.characters||[]).find(x=>x!==c&&String(x&&x.name||'').trim()===nn); if(dup) return {ok:false,msg:`姓名「${nn}」已经被 ${dup.id||'另一人物'} 使用`};
  if(!Array.isArray(c._alias)) c._alias=[]; if(old&&!c._alias.includes(old)) c._alias.push(old); c.name=nn; c._userName=true; delete c._nameFlag;
  let changed=0;
  (g._relationshipTable||[]).forEach(r=>{if(String(r.a||'').trim()===old){r.a=nn;changed++;} if(String(r.b||'').trim()===old){r.b=nn;changed++;}});
  changed += syncNameEverywhere(old,nn);
  // 旧版独立人物卡、校长/老师计划、尚未锁定的章节计划也同步；不碰原始创作蓝本和历史快照。
  if(Array.isArray(state.characters)) state.characters.forEach(x=>{if(x&&String(x.name||'').trim()===old){x.name=nn;changed++;}});
  if(state.school){ changed += replaceExactInObject(state.school,old,nn); }
  if(state.outline && Array.isArray(state.outline.chapterPlans)) changed += replaceExactInObject(state.outline.chapterPlans,old,nn);
  state.characterNaming.version=(Number(state.characterNaming.version)||0)+1;
  persist();
  return {ok:true,msg:`已将「${old}」改为「${nn}」`,changed};
}
function characterNamingRows(){
  const g=ensureCharacterIdsForNaming();
  return (g.characters||[]).map((c,i)=>({id:String(c.id||''),name:String(c.name||'').trim(),identity:String(c.identity||'').trim(),advisory:characterNameAdvisory(c.name),index:i}));
}
function renderCharacterNamingPanel(){
  const rows=characterNamingRows(); const locked=!!(state.characterNaming&&state.characterNaming.locked);
  const html=`<div class="ne-body"><div class="bl-note muted">这里是<b>正文生成前的人物最终定名台</b>。人物真正的身份是 CHAR_ID，改名不会改变人物关系、人物卡或后续关联。系统高频姓名只提醒，不拦截；用户硬禁则仍然生效。</div>
  <div style="display:grid;gap:8px;margin-top:10px">${rows.map(r=>`<div style="padding:10px 12px;border:1px solid var(--border,#ddd);border-radius:12px;background:var(--card,#fff)"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>${esc(r.id)}</b><span class="muted">${esc(r.identity||'核心人物')}</span></div><div style="display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:8px"><input data-cn-id="${esc(r.id)}" value="${esc(r.name)}" ${locked?'disabled':''} placeholder="正式姓名"><button class="btn ghost" data-cn-apply="${esc(r.id)}" ${locked?'disabled':''}>修改</button></div>${r.advisory.length?`<div style="margin-top:5px;color:#a16207;font-size:12px">🟡 ${esc(r.advisory.join('；'))}（仅提醒）</div>`:'<div style="margin-top:5px;color:#15803d;font-size:12px">✓ 当前无系统高频提醒</div>'}</div>`).join('')||'<div class="muted">暂无核心人物。请先运行词典达人。</div>'}</div>
  <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-cn-lock>${locked?'🔓 解除姓名锁定':'🔒 确认并锁定人物姓名'}</button><button class="btn ghost" data-cn-refresh>刷新检查</button></div>
  <div class="muted" style="margin-top:8px;font-size:12px">锁定后：校长、老师、正文统一读取当前 CHAR_ID → 正式姓名映射。若要重新命名，先解除锁定即可。</div></div>`;
  openNeModal('👤 人物定名台',html);
  const m=$('#neModal'); if(!m) return;
  m.querySelectorAll('[data-cn-apply]').forEach(btn=>btn.onclick=()=>{const id=btn.dataset.cnApply; const inp=m.querySelector(`[data-cn-id="${CSS.escape(id)}"]`); const r=renameCharacterById(id,inp&&inp.value); if(r.ok){toast(r.msg);renderCharacterNamingPanel();}else toast(r.msg);});
  const lock=m.querySelector('[data-cn-lock]'); if(lock) lock.onclick=()=>{state.characterNaming.locked=!locked;state.characterNaming.lockedAt=state.characterNaming.locked?Date.now():0;persist();toast(state.characterNaming.locked?'人物姓名已锁定，后续阶段统一使用当前姓名':'已解除人物姓名锁定，可以继续改名');renderCharacterNamingPanel();};
  const refresh=m.querySelector('[data-cn-refresh]'); if(refresh) refresh.onclick=()=>renderCharacterNamingPanel();
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
  $('#cfgTemp').value = (c.temperature==null ? 0.6 : c.temperature);
}

function saveTemps(){
  const rd = (id, def)=>{ const v=parseFloat($(id) && $(id).value); return isNaN(v)?def:v; };
  editCfg.temperature = rd('#cfgTemp', 0.6);
  const live = getCfg();
  const TM_FIELDS = ['ideaTemp','dictmasterTemp','dictEnrichTemp','principalTemp','teacherTemp','chapterTemp','aiRecipeTemp','stripTemp','subplotTemp','qcTemp','rollingTemp','contentAdviseTemp','assetsTemp','titleTemp','chapterAuditTemp','chapterRepairTemp','chapterStateTemp','timeAnchorTemp','recipeAnalysisTemp'];
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
  { title:'⭐ 一级核心 · 主创链（最重要）', keys:[
    ['idea','优化构想','WHAT / WHY：故事战略、核心冲突与创作方向'],
    ['dictmaster','词典达人','建立核心人物、关系、世界规则与基础基础词典'],
    ['dictEnrich','词典充实','在核心词典之上补充次级人物与世界生态'],
    ['principal','校长总控','统领全量材料，产出全书与章节级规划'],
    ['teacher','老师备课','把章节规划转成场景级推进教案'],
    ['chapter','正文生成','正式小说正文生成，创作链温度核心'],
    ['recipe','写作配方','写作风格/方法组合与配方设计']
  ]},
  { title:'🔧 二级任务 · 高频维护与质量控制', keys:[
    ['strip','本章梗概（速读）','每章生成后的快速压缩'],
    ['subplot','副线追踪','小型结构化进度更新'],
    ['glossary','词典提取','从正文抽取结构化词典信息'],
    ['rolling','滚动摘要','长篇记忆层与批次摘要'],
    ['contentAdvice','章节内容 AI 建议','章节层面的补充建议'],
    ['assets','封面/人物/场景/分镜','提示词与创作资产'],
    ['titleAdvice','标题建议','章节/标题类建议']
  ]},
  { title:'🧩 二级任务 · 内部质量/校准 AI', keys:[
    ['chapterAudit','正文审计','正文事实、逻辑与质量账本审计'],
    ['chapterRepair','正文修复','根据审计结果进行局部修复'],
    ['chapterState','正文状态结算','提取章末事实状态'],
    ['timeAnchor','时间锚点','从正文抽取时间状态'],
    ['recipeAnalysis','配方输入理解','写作配方的前置需求分析']
  ]}
];

// 第二列数字就是当前代码的标准/推荐值。用户修改后的值才是运行时唯一任务温度。
const TM_TEMP = {
  idea:['ideaTemp',0.45], dictmaster:['dictmasterTemp',0.40], dictEnrich:['dictEnrichTemp',0.45],
  principal:['principalTemp',0.40], teacher:['teacherTemp',0.40], chapter:['chapterTemp',0.50], recipe:['aiRecipeTemp',0.85],
  strip:['stripTemp',0.80], subplot:['subplotTemp',0.25], glossary:['qcTemp',0.20], rolling:['rollingTemp',0.30],
  contentAdvice:['contentAdviseTemp',0.60], assets:['assetsTemp',0.70], titleAdvice:['titleTemp',0.50],
  chapterAudit:['chapterAuditTemp',0.05], chapterRepair:['chapterRepairTemp',0.20], chapterState:['chapterStateTemp',0.10],
  timeAnchor:['timeAnchorTemp',0.20], recipeAnalysis:['recipeAnalysisTemp',0.20]
};
let editTM = null;          // 面板暂存：保存前绝不落盘（对齐设置弹窗 editCfg 模式）
let editTemps = {};
let _tmEscHandler = null;   // ESC 关闭挂钩（现有 modal 无全局 ESC，本面板自持）
function tmCustomCount(tm){ return TM_KEYS.filter(k=> tm && tm[k]).length; }
function updateTmBadge(){
  const n = tmCustomCount(getCfg().taskModels);
  const el = $('#tmBadge'); if(el) el.textContent = n ? ('模型自定义 '+n+' 项 · 温度独立') : '模型跟随全局 · 温度独立';
  const b = $('#cfgBadge'); if(b) b.classList.toggle('tm-on', n>0);
}
function tmResolvePreview(triple){
  if(!triple) return '跟随全局模型';
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
  btn.textContent = '仅重置任务模型覆盖（'+n+' 项）';
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
        ${tf?`<input type="number" inputmode="decimal" step="0.05" min="0" max="2" class="tm-temp" data-tm-temp="${key}" value="${tval}" placeholder="温度 ${tf[1]}" title="${esc(name)} 的 AI 温度（推荐值仅供参考；保存后以任务温度为准）">`:'<span class="tm-temp-void"></span>'}
      </div>
      <div class="tm-sels">
        <select data-tm-sel="group" data-tm-key="${key}">
          <option value="">跟随全局模型</option>
          ${cfg.groups.map(g=>`<option value="${esc(g.id)}" ${gid===g.id?'selected':''}>${esc(g.label)}</option>`).join('')}
        </select>
        <select data-tm-sel="key" data-tm-key="${key}" ${grp?'':'disabled'}>${optHtml((grp?(grp.keys||[]):[]).map(k=>({v:k.id,t:k.label||'账号'})), kid, '（该组无账号）')}</select>
        <select data-tm-sel="model" data-tm-key="${key}" ${grp?'':'disabled'}>${optHtml((grp?(grp.models||[]):[]).map(m=>({v:m.name,t:m.name})), mid, '（该组无模型）')}</select>
      </div>
      <div class="tm-preview${tm?'':' tm-follow'}">${esc(tmResolvePreview(tm||null))}</div>
    </div>`;
  };
  body.innerHTML = `
    <div class="cv-div">每个任务都有独立温度。输入框中的数值就是该任务实际 API 温度；括号内为修改前代码的推荐值，仅供参考。全局温度不会覆盖已配置的任务温度。</div>
    <div class="set-block">
      <div class="set-block-head"><span>◆ 全局模型默认（仅用于未单独指定模型的任务）</span></div>
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
  toast(n ? ('分任务设置已保存：'+n+' 项模型覆盖；温度按任务独立生效') : '分任务设置已保存：模型跟随全局；温度按任务独立生效')+(nT?('；已同步 '+nT+' 项任务温度'):'');
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


/* ===================== 禁则清单：词典达人 / 词典充实 / 校长 / 正文统一生效保障 ===================== */
function isScopeBanned(scopeKey, type='entity'){ return banListAiActive(scopeKey,type); }
function banEntityTextViolations(text, role){
  if(!banEntityEnabled() || (role && !banListAiActive(role,'entity'))) return [];
  const src=String(text||''), hits=[], b=banListRaw();
  if(b.entity.person.enabled!==false) banListNames('person').forEach(n=>{if(n&&src.includes(n))hits.push({type:'name',value:n,entityType:'person'});});
  if(b.entity.place.enabled!==false) banListNames('place').forEach(n=>{if(n&&src.includes(n))hits.push({type:'name',value:n,entityType:'place'});});
  if(b.entity.properNoun.enabled!==false) banListNames('properNoun').forEach(n=>{if(n&&src.includes(n))hits.push({type:'name',value:n,entityType:'properNoun'});});
  return hits;
}
function banTextViolations(text, role){
  if(!banTextEnabled() || (role && !banListAiActive(role,'text'))) return [];
  const src=String(text||''), hits=[];
  banListAllTextItems().forEach(w=>{ if(w && src.includes(w)) hits.push({type:'text',value:w}); });
  return hits;
}
function scrubBannedPhrases(text, role){
  let out=String(text||'');
  if(!banTextEnabled() || (role && !banListAiActive(role,'text'))) return out;
  const items=banListAllTextItems();
  items.slice().sort((a,b)=>String(b).length-String(a).length).forEach(w=>{ const needle=String(w||'').trim(); if(needle) out=out.split(needle).join(''); });
  return out;
}
function bannedEntityName(name, type='person'){
  const s=String(name||'').trim(); if(!s) return '';
  return type==='person' ? nmNameRuleViolation(s) || banListViolation(s,'person') : banListViolation(s,type);
}
function filterDictMasterEntry(entry, category){
  if(!entry || !isScopeBanned('dictmaster','entity')) return entry;
  const type=category==='places'?'place':category==='propernouns'?'properNoun':'person';
  return bannedEntityName(entry.name,type) ? null : entry;
}
function filterDictEnrichList(list){
  if(!isScopeBanned('dictEnrich','entity') || !Array.isArray(list)) return list || [];
  return list.filter(item=>!bannedEntityName(item && (item.name||item.title||item.entity)));
}
function sanitizePrincipalText(text){
  if(!isScopeBanned('principal','text')) return String(text||'');
  return scrubBannedPhrases(text, 'principal');
}
function sanitizePrincipalChapter(ch){
  if(!isScopeBanned('principal','text')) return ch;
  const out=Object.assign({}, ch||{});
  out.title=scrubBannedPhrases(String(out.title||''), 'principal');
  out.summary=scrubBannedPhrases(String(out.summary||''), 'principal');
  return Object.assign({}, out, { title:String(out.title||'').trim() || '新章节', summary:String(out.summary||'').trim() });
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
