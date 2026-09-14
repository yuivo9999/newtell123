/**
 * Story structure configuration and derived planning helpers.
 *
 * Keep this module free of direct DOM work. The legacy runtime still owns the
 * mutable `state` object, so these helpers intentionally resolve that global
 * at call time while exposing named ESM exports for the modern core.
 */

const TEAM_OPTIONS = [
  { id:'solo',  label:'主角线',      n:1, kind:'solo', desc:'一位主角，个人视角贯穿全书' },
  { id:'dual',  label:'双主角',      n:2, kind:'dual', desc:'男女主角同为第一主角，双线叙事、双视角（如互为镜像与对照）' },
  { id:'trio',  label:'铁三角 +2',   n:3, kind:'team', desc:'一主角 + 两位主要配角（如鬼吹灯三人组）' },
  { id:'quad',  label:'四方团队 +3', n:4, kind:'team', desc:'一主角 + 三位主要配角' },
  { id:'quint', label:'五人团 +4',   n:5, kind:'team', desc:'一主角 + 四位主要配角' }
];
function currentTeamShape(){
  const v = runtime().state.teamShape || 'solo';
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
  {id:'auto', label:'AI 推荐', desc:'按全书章节数与故事体量自动选择，首章优先进入主线。'},
  {id:'action', label:'事件直入', desc:'从正在发生的关键事件切入，适合短篇幅、强卖点题材。'},
  {id:'crisis', label:'危机开场', desc:'先给危险、冲突或倒计时，再逐步解释原因。'},
  {id:'result', label:'结果先行', desc:'先展示一个异常结果，再回到前因，适合悬疑与反转。'},
  {id:'normal', label:'日常破局', desc:'先建立人物日常，再让异常事件打破平衡。'},
  {id:'world', label:'世界异常', desc:'从一个反常世界现象切入，用事件带出世界规则。'},
  {id:'secret', label:'人物秘密', desc:'从秘密、隐瞒或关系裂缝切入，先立人物钩子。'},
  {id:'future', label:'未来片段', desc:'用预言、未来片段或结局影子制造问题，再回到当下。'}
];
function openingStrategyDef(id){ return OPENING_STRATEGIES.find(x=>x.id===id); }
function currentOpeningStrategyId(){ return openingStrategyDef(runtime().state.openingStrategy) ? runtime().state.openingStrategy : 'auto'; }
function recommendedOpeningStrategy(){
  const n = chapterCountVal() || 0;
  if(n <= 3) return 'crisis';
  if(n <= 8) return 'action';
  if(n <= 20) return 'normal';
  if(n <= 50) return 'secret';
  return 'world';
}
function openingBudget(){
  const n = chapterCountVal() || 0;
  if(n <= 3) return 1;
  if(n <= 8) return 2;
  if(n <= 20) return 3;
  if(n <= 50) return 5;
  return 8;
}
function openingStrategyExecutionCard(i=0){
  if(!runtime().isLong() || i!==0) return '';
  const selected = openingStrategyDef(currentOpeningStrategyId());
  const rec = openingStrategyDef(recommendedOpeningStrategy());
  const actual = currentOpeningStrategyId()==='auto' ? rec : selected;
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
首拍验收：开篇方式必须能被读者从正文实际动作/场景中辨认，而不是只在教案里写“按${actual.label}开篇”。`;
}
function principalOpeningTaskExcerpt(){
  const pr=(runtime().state.school&&runtime().state.school.principal)||{};
  if(pr.raw){
    const raw=String(pr.raw);
    const heads=['## 第一章开篇任务卡','# 第一章开篇任务卡','第一章开篇任务卡'];
    for(const h of heads){ const a=raw.indexOf(h); if(a>=0){ const tail=raw.slice(a); const m=tail.search(/\n#(?!#)|\n## /); const sec=(m>0?tail.slice(0,m):tail.slice(0,3000)).trim(); if(sec) return sec; } }
  }
  return openingStrategyExecutionCard(0);
}
function openingStrategyBrief(){
  if(!runtime().isLong()) return '';
  const selected = openingStrategyDef(currentOpeningStrategyId());
  const rec = openingStrategyDef(recommendedOpeningStrategy());
  const actual = currentOpeningStrategyId()==='auto' ? rec : selected;
  const n = chapterCountVal() || realChapterCount() || 0;
  return `【开篇引擎】全书${n||'未定'}章；开篇预算约${openingBudget()}章。策略=${actual.label}：${actual.desc}\n执行：第1章必须尽早建立核心人物、类型信号、可见问题与继续阅读的下一问；预算只是允许用于启动故事引擎的章节上限，不代表可以慢热拖延。${n>0&&n<5?'当前篇幅少于5章，首章应直接进入主线，最多用极短铺垫，不安排长背景章。':''}`;
}
function openingStrategyHtml(){
  if(!runtime().isLong()) return '';
  const cur=currentOpeningStrategyId(), rec=openingStrategyDef(recommendedOpeningStrategy());
  return `<div class="tw-panel" style="margin-bottom:10px"><div class="poly-head"><span class="poly-ic">🚪</span><b>开篇策略</b><span class="poly-rule">推荐：${runtime().esc(rec.label)} · 预算约${openingBudget()}章</span></div><div class="book-beat-options" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-top:8px">${OPENING_STRATEGIES.map(x=>`<label class="book-beat-card ${x.id===cur?'selected':''}" style="border:2px solid ${x.id===cur?'var(--accent,#4a90e2)':'var(--line,#e0e0e0)'};border-radius:8px;padding:10px;cursor:pointer"><input type="radio" name="openingStrategy" value="${x.id}" ${x.id===cur?'checked':''} style="display:none"><b>${runtime().esc(x.label)}${x.id===rec.id?' · AI推荐':''}</b><div class="muted" style="font-size:12px;line-height:1.5;margin-top:4px">${runtime().esc(x.desc)}</div></label>`).join('')}</div><div class="muted" style="font-size:12px;line-height:1.6;margin-top:8px">开篇预算不是“允许水”的章数，而是允许故事完成启动工作的范围。1–3章尽快入局；4–8章可有短铺垫；9章以上才逐步允许秘密、回忆与世界观承担更多开篇任务。</div></div>`;
}
function realChapterCount(){
  const n = (runtime().state.outline && Array.isArray(runtime().state.outline.chapters)) ? runtime().state.outline.chapters.length : 0;
  if(n>0) return n;
  return chapterCountVal();
}
function totalWordsBase(){ return (runtime().state.totalWords && +runtime().state.totalWords>0) ? +runtime().state.totalWords : 300000; }
const totalWan = () => (totalWordsBase()/10000).toLocaleString('en-US');
function estCounterpart(sz){
  const mid = (sz.range.min + sz.range.max) / 2;
  if(!mid) return null;
  return Math.round(totalWordsBase()/mid);
}
function sizeHintText(){
  const hasW = runtime().state.wordRange && (runtime().state.wordRange.min>0 || runtime().state.wordRange.max>0);
  const hasC = runtime().state.chapterRange && (runtime().state.chapterRange.min>0 || runtime().state.chapterRange.max>0);
  if(!hasW && !hasC) return '请先 ☑ 勾选「每章字数」或「全书章节」其中一项，再滑动滑条调整区间。';
  const sz = selSize();
  const cnt = estCounterpart(sz);
  if(sz.kind==='word') return `按每章 ${fmtRange(sz.range)} 字，全书约需 ${cnt} 章。`;
  return `全书约 ${fmtRange(sz.range)} 章，每章据此约 ${cnt} 字。`;
}
function chapterMaxTokens(){
  return clampMaxTokens('chapter');
}
function clampMaxTokens(task){
  const limits = {
    chapter: 7000,      // 正文最大单次输出（目标 3000—3600 字，留约 2 倍缓冲；上限过高会放任模型把单章拖成 1.6w）
    principal: 16384,   // 校长统筹总控
    teacher: 16384,     // 老师分批教案
    dictmaster: 16384,  // 万物词典生成
    dictEnrich: 8192,   // 词典充实与收编
    glossary: 9216,
    json: 4096,         // JSON 类契约输出
    recipe: 8192,
    polish: 8192,
    plannerAux: 8192,
    continue: 8192,     // 续写补充段
    summary: 2048,      // 梗概/摘要
    strip: 5000         // 速读梗概
  };
  return limits[task] || 4096;
}
function dynamicChapterParams(idx){
  const o = runtime().state.outline;
  const base = runtime().resolveActiveSpec().chapterTemp;
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
  const outline = o || runtime().state.outline || {};
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
  const stages = chapterPlanStages(runtime().state.outline);
  if(!stages.length) return '';
  const st = stages.find(s => (i+1) >= s.first && (i+1) <= s.last) || null;
  if(!st) return '';
  return `【本章结构定位】本章（第 ${i+1} 章）落在全书「${runtime().currentBookBeatCfg().label}」的「${st.name}」阶段（第 ${st.first}—${st.last} 章）。本章节拍事件须落在此阶段内、服务该阶段走向；属于本阶段的节拍事件必须兑现，不属于本阶段的事件不得越过阶段提前兑现。`;
}
function bookStagePlan(chapterCount){
  const full = runtime().beatStageNames();
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

function normalRange(r, fallback){
  const min = (typeof r==='object' && +r.min>0) ? +r.min : fallback.min;
  const max = (typeof r==='object' && +r.max>0) ? +r.max : Math.max(min, fallback.max);
  return { min, max: Math.max(min, max) };
}
function selSize(){
  if(runtime().state.chapterRange && (runtime().state.chapterRange.min>0 || runtime().state.chapterRange.max>0)){
    return { kind:'chapter', range: normalRange(runtime().state.chapterRange, {min:80,max:100}) };
  }
  if(runtime().state.wordRange && (runtime().state.wordRange.min>0 || runtime().state.wordRange.max>0)){
    return { kind:'word', range: normalRange(runtime().state.wordRange, SIZE_DEFAULT) };
  }
  return { kind:'word', range: SIZE_DEFAULT };
}
const fmtRange = r => `${r.min}-${r.max}`;
function chapterCountVal(){
  const v = +runtime().state.chapterCount;
  if(Number.isInteger(v) && v>=1 && v<=200) return v;
  return null;
}

export {
  TEAM_OPTIONS,
  currentTeamShape,
  shapeKind,
  isSolo,
  isDualStory,
  isTeamStory,
  narrativeShapeBrief,
  teamShapeBrief,
  chapterCountHint,
  OPENING_STRATEGIES,
  openingStrategyDef,
  currentOpeningStrategyId,
  recommendedOpeningStrategy,
  openingBudget,
  openingStrategyExecutionCard,
  principalOpeningTaskExcerpt,
  openingStrategyBrief,
  openingStrategyHtml,
  realChapterCount,
  totalWordsBase,
  estCounterpart,
  sizeHintText,
  normalRange,
  selSize,
  chapterCountVal,
  fmtRange,
  chapterMaxTokens,
  clampMaxTokens,
  dynamicChapterParams,
  chapterPlanStages,
  chapterActBlock,
  bookStagePlan,
  mergedBeatName
};

Object.assign(window, {
  TEAM_OPTIONS, currentTeamShape, shapeKind, isSolo, isDualStory, isTeamStory,
  narrativeShapeBrief, teamShapeBrief, chapterCountHint, OPENING_STRATEGIES,
  openingStrategyDef, currentOpeningStrategyId, recommendedOpeningStrategy,
  openingBudget, openingStrategyExecutionCard, principalOpeningTaskExcerpt,
  openingStrategyBrief, openingStrategyHtml, realChapterCount, totalWordsBase,
  estCounterpart, sizeHintText, normalRange, selSize, chapterCountVal,
  chapterMaxTokens, clampMaxTokens, fmtRange, dynamicChapterParams, chapterPlanStages,
  chapterActBlock, bookStagePlan, mergedBeatName
});
