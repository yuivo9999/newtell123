/* ================================================================
 * principal-tiered.js · v1.0.592 · 校长分层（全书层 + 分组细化；分组细化的词典按本组出场范围裁剪，见 dict-scope.js）
 *
 * 为什么需要它：校长原先一次调用输出全书所有章节块，输出上限 32768 token，
 * 实测只够约 10–15 章；100 章以上必崩。这里把校长拆成两级，全部保持「手动」：
 *   ① 全书层（点一次）：SCHOOL_RULES / BOOK / STYLE / REVEAL / STAGE / TEACHER_GROUP + 粗章表 CHAPTER_OUTLINE
 *   ② 分组细化（每个老师组点一次）：只把本组约 8–10 章从粗展开为完整的 PRINCIPAL_CHAPTER 块
 * 每一步都有「注入导出 / 读… / 保存更改」，保存后立即生效并同步给下游（老师）。
 *
 * 组与组之间的交接：交接卡由程序从上一组结果摘录（可手动编辑），
 * 下一组细化时读取「交接卡 + 上一组最后 2 章完整块 + 全书粗章表」。
 *
 * 模式：自动（章数 > PT_SINGLE_CALL_MAX 才分层）/ 强制分层 / 关闭（沿用旧的一次性校长）。
 * 本文件是经典脚本，依赖 app.js 里的全局函数，必须在 app.js 之后加载。
 * ================================================================ */
const PT_SINGLE_CALL_MAX = 12;
let _ptRun = null;

/* ---------------------------------------------------------------- 模式与状态 */
function principalTieredMode(){
  const m = scState().principalTieredMode;
  return (m === 'on' || m === 'off') ? m : 'auto';
}
function principalTieredEnabled(){
  try{ if(!isLong()) return false; }catch(_e){}
  const m = principalTieredMode();
  if(m === 'on') return true;
  if(m === 'off') return false;
  return (Number(principalTargetChapterCount()) || 0) > PT_SINGLE_CALL_MAX;
}
function ptEnsure(){
  const sc = scState();
  if(!sc.principal || typeof sc.principal !== 'object') sc.principal = {};
  const t = sc.principal.tiered = (sc.principal.tiered && typeof sc.principal.tiered === 'object') ? sc.principal.tiered : {};
  t.rough = t.rough || {}; t.groups = t.groups || {}; t.cards = t.cards || {}; t.dictPick = t.dictPick || {};
  return t;
}
function ptPeek(){
  const p = scState().principal;
  return (p && p.tiered && typeof p.tiered === 'object') ? p.tiered : null;
}
function ptAssignment(){ return buildTeacherAssignment(); }
function ptTotal(){ return Number(principalTargetChapterCount()) || 0; }
function ptGroupEffectiveStatus(gi){
  const T = ptPeek(), st = T && T.groups && T.groups[gi];
  if(!st) return 'rough';
  const g = ptAssignment().groups[gi];
  if(!g || Number(st.first) !== Number(g.startChapter) || Number(st.last) !== Number(g.endChapter)) return 'stale';
  const P = scState().principal || {};
  if(Number(P.targetChapterCount) && Number(P.targetChapterCount) !== ptTotal()) return 'stale';
  return st.status || 'rough';
}
function ptGroupReady(gi){
  const s = ptGroupEffectiveStatus(gi);
  const T = ptPeek(), st = T && T.groups && T.groups[gi];
  return s === 'detailed' || (!!st && st.forceReady === true && s !== 'stale' && s !== 'rough');
}
function ptTeacherGuard(gi){
  if(!principalTieredEnabled()) return '';
  const P = scState().principal || {};
  if(Number(P.targetChapterCount) && Number(P.targetChapterCount) !== ptTotal()) return '章数已变更：全书层已过期，请先重新生成或读取「全书层」，再细化各组。';
  if(ptGroupReady(gi)) return '';
  const s = ptGroupEffectiveStatus(gi);
  const label = {rough:'尚未完成', stale:'已过期', partial:'不完整'}[s] || '未就绪';
  return `第${Number(gi)+1}组校长细化${label}：请先在「分组细化」里完成并保存该组，老师才能拿到完整的章节战略。`;
}

/* ---------------------------------------------------------------- 文本小工具 */
function ptReplaceBlock(text, marker, replacement){
  const idx = text.indexOf(marker);
  if(idx < 0) return text + '\n\n' + replacement;
  let end = text.indexOf('\n\n【', idx + marker.length);
  if(end < 0) end = text.length;
  return text.slice(0, idx) + replacement + text.slice(end);
}
function ptCutBeforeContract(){
  const base = String(PRINCIPAL_SYS);
  const i = base.indexOf('【二十二、最终输出契约】');
  if(i < 0) return base;
  const bar = base.lastIndexOf('━━━━━━━━━━━━━━━━━━', i);
  return base.slice(0, bar >= 0 ? bar : i);
}
function ptChapterTemplate(){
  const base = String(PRINCIPAL_SYS);
  const a = base.indexOf('[PRINCIPAL_CHAPTER]\nchapter=1');
  const tag = '[/PRINCIPAL_CHAPTER]';
  const b = base.indexOf(tag, a);
  return (a >= 0 && b > a) ? base.slice(a, b + tag.length) : '';
}
function ptRevealBlocksText(raw){
  const m = String(raw || '').match(/\[\s*REVEAL_PLAN\s*\][\s\S]*?\[\s*\/\s*REVEAL_PLAN\s*\]/gi);
  return m ? m.join('\n\n') : '';
}
function ptChapterBlocks(raw){
  const out = {};
  const re = /\[\s*PRINCIPAL_CHAPTER\s*\]([\s\S]*?)\[\s*\/\s*PRINCIPAL_CHAPTER\s*\]/gi;
  let m;
  while((m = re.exec(String(raw || '').replace(/\r\n?/g, '\n')))){
    const c = String(m[1]).match(/^\s*chapter\s*[=:：]\s*(\d+)/mi);
    if(c) out[Number(c[1])] = m[0].trim();
  }
  return out;
}
const PT_CHAPTER_REQUIRED = ['chapter','title','function','goal','coreEvent','characterActions','endingFunction','endingIntensity','lastEffectiveEvent','endingForm','nextTransitionType','nextTransitionBasis','narrativeRole','timeStrategy','stageTask','teacherTask','handoff'];

/* ---------------------------------------------------------------- 提示词：全书层 */
const PT_GLOBAL_CONTRACT = `━━━━━━━━━━━━━━━━━━
【二十二、最终输出契约｜分层校长·全书层】
━━━━━━━━━━━━━━━━━━

本次是「分层校长」的【全书层】调用，本契约覆盖前文所有“一次输出全部[PRINCIPAL_CHAPTER]”的要求：
- 本次不输出任何[PRINCIPAL_CHAPTER]块。逐章完整战略由后续「分组细化」按老师组逐组完成。
- 本次只输出以下机器块，且只能输出这些：[SCHOOL_RULES]一个、[BOOK_STRATEGY]一个、[STYLE_STRATEGY]一个、[REVEAL_PLAN]0到8个、[STAGE_STRATEGY]按系统阶段数量、[TEACHER_GROUP_STRATEGY]按系统老师组数量、[CHAPTER_OUTLINE]按全书章节总数（每章一个）。
- 不得输出Markdown、解释性文字、JSON或第二套计划。

[CHAPTER_OUTLINE] 是「粗章表」，每章只写四个字段：
[CHAPTER_OUTLINE]
chapter=章号（整数，从1连续到全书章节总数，不得缺漏、重复或越界）
title=章节标题
function=本章在全书中的功能（一句话）
goal=本章战略目标（一句话，只写方向，不写施工）
[/CHAPTER_OUTLINE]

粗章表的纪律：
1. 粗章表只给“方向”，细节留给分组细化；越远的章节越可以粗。不要为了凑细节而编造远期剧情。
2. 全书不必死守某一章作为结局：可以把终局收束写进最后阶段，但章号总数必须等于系统给定的全书章节总数。
3. 粗章表必须与各STAGE_STRATEGY的章节范围、各TEACHER_GROUP_STRATEGY的章节范围、REVEAL_PLAN的揭示章节一致，不得冲突。
3a. REVEAL_PLAN 的 revealChapter 必须恰好是粗章表里“真相显露/揭示”所在的那一章：先在粗章表里确定哪一章揭示，再回填 revealChapter，两处必须同一章；STAGE/TEACHER_GROUP 的描述里提到揭示时也必须是同一章。
3b. hintChapters 要稀疏：只在少数关键章给暗示，通常不超过揭示前章数的三分之一，不得几乎每章都暗示，也不得与揭示章重合。
3c. 人名、地名、专名必须与词典完全一致，逐字照抄，不得写错字、不得自造近似写法。
4. 篇幅硬限制（100章以上必须遵守，否则会超出单次输出上限被截断）：粗章表每章function不超过20字、goal不超过30字、title不超过15字；TEACHER_GROUP_STRATEGY里chapterAssignments每项task不超过20字；STAGE/GROUP/BOOK各字段尽量一句话，不写长段落；不要复述输入资料。
5. 阶段之间、老师组之间的交接必须在STAGE_STRATEGY与TEACHER_GROUP_STRATEGY里写清楚（nextStageLaunch / previousStageHandoff / nextGroupLaunch / previousGroupHandoff / mustNotPrematurelyResolve），后续分组细化只读这些交接。

`;
const PT_GLOBAL_HARD = `硬要求：BOOK_STRATEGY只能一个；SCHOOL_RULES只能一个；STYLE_STRATEGY只能一个；REVEAL_PLAN可以有0到8个；STAGE_STRATEGY数量等于系统阶段数；TEACHER_GROUP_STRATEGY数量等于老师组数；CHAPTER_OUTLINE数量等于全书章节总数；本次不输出任何PRINCIPAL_CHAPTER。STYLE_STRATEGY只能提供唯一GLOBAL，不得输出HYBRID/CHAPTER池、章节三层分配表或第二套三层来源。`;

function ptGlobalSystem(){
  let proto = String(STRUCTURED_PRINCIPAL_PROTOCOL);
  const k = proto.indexOf('硬要求：');
  if(k >= 0) proto = proto.slice(0, k) + PT_GLOBAL_HARD;
  return (ptCutBeforeContract() + PT_GLOBAL_CONTRACT + proto + '\n\n' + globalCreativeConstraintBlock('principal')).trim();
}
function ptGlobalUser(assignment, n){
  let u = String(buildPrincipalUser(assignment, n));
  u = ptReplaceBlock(u, '【本次全书章节数量硬约束｜全书唯一一处】',
`【本次全书章节数量硬约束｜全书唯一一处｜分层校长·全书层】
全书章节总数=${n}章。本次只输出粗章表：必须且只能输出${n}个唯一的[CHAPTER_OUTLINE]块，chapter连续、唯一，从1到${n}；不得输出第${n+1}章，也不得多出、缺少或额外输出章节。本次不输出[PRINCIPAL_CHAPTER]。输入资料中若有与此章数冲突的旧大纲/历史信息，以${n}章为准。`);
  u = ptReplaceBlock(u, '【四层战略输出总要求】',
`【战略输出总要求｜分层校长·全书层】
本次一次完成全书层战略：SCHOOL_RULES负责全书纪律；BOOK_STRATEGY负责全书主线/最终转变/长期驱动力/全书节奏；STAGE_STRATEGY负责系统既定阶段的目标、冲突、高潮、解决、新问题与阶段交接；TEACHER_GROUP_STRATEGY负责系统既定老师组的组任务、节奏、情绪曲线、推进边界、上下组交接；CHAPTER_OUTLINE给出全书粗章表。下层只能具体化上层，不能推翻上层。逐章完整战略由后续分组细化完成。`);
  u = ptReplaceBlock(u, '【新增校长输出：叙事主体与时间统筹】',
`【叙事主体与时间统筹】
把已注入的“叙事主体结构”与“时间系统”吸收进BOOK_STRATEGY/STAGE_STRATEGY/TEACHER_GROUP_STRATEGY与粗章表的方向里；逐章narrativeRole与timeStrategy留给分组细化。`);
  u = ptReplaceBlock(u, '【新增校长输出：阶段任务与老师任务】',
`【阶段任务与交接】
阶段任务与交接写进STAGE_STRATEGY与TEACHER_GROUP_STRATEGY；逐章的stageTask/teacherTask/handoff留给分组细化。`);
  u = ptReplaceBlock(u, '【校长输入边界】',
`【校长输入边界】
本次调用只完成全书层。你只处理已注入的最小决策上下文；不要要求正文全文、老师施工细节或历史版本。缺失的信息只能写成待确认，不得臆造。`);
  const blocks = principalCompactSourceBlocks(assignment, n);
  let full = String(principalFinalContext(u, '', blocks, 'compact-direct'));
  full = full.replace(/- 最终必须严格输出四层协议[\s\S]*$/, '- 最终必须按「分层校长·全书层」契约输出：[SCHOOL_RULES]一次、[BOOK_STRATEGY]一次、[STYLE_STRATEGY]一次、[REVEAL_PLAN]0到8个、[STAGE_STRATEGY]按系统阶段数量、[TEACHER_GROUP_STRATEGY]按系统老师组数量、[CHAPTER_OUTLINE]按全书章节总数；不得输出[PRINCIPAL_CHAPTER]，不得输出Markdown章节卡或第二套战略。');
  return full;
}
function ptBuildGlobalInjection(ctx){
  const c = ctx && typeof ctx === 'object' ? ctx : {};
  const assignment = c.teacherAssignment || buildTeacherAssignment();
  const total = Number(c.targetChapterCount || principalTargetChapterCount() || 0);
  if(!total || !assignment || !Array.isArray(assignment.groups) || !assignment.groups.length) return null;
  const system = ptGlobalSystem(), user = ptGlobalUser(assignment, total);
  if(!system || !user) return null;
  return { system, user, teacherAssignment: assignment, targetChapterCount: total, tiered: 'global' };
}

/* ---------------------------------------------------------------- 提示词：分组细化 */
function ptRoughRowsText(T, mark){
  const rough = T.rough || {};
  return Object.keys(rough).map(Number).sort((a,b)=>a-b).map(n=>{
    const r = rough[n];
    const m = mark && n >= mark.first && n <= mark.last ? '【本组·待细化】' : '';
    return `第${n}章${m}｜《${r.title||''}》｜功能：${r.function||''}｜目标：${r.goal||''}`;
  }).join('\n');
}
function ptCardText(gi){
  const T = ptPeek(); const c = T && T.cards && T.cards[gi];
  if(!c) return '';
  return String(c.manual != null && String(c.manual).trim() ? c.manual : (c.auto || '')).trim();
}
function ptGroupSystem(){
  const proto = String(STRUCTURED_PRINCIPAL_PROTOCOL);
  const head = proto.slice(0, Math.max(0, proto.indexOf('[BOOK_STRATEGY]')));
  const tpl = ptChapterTemplate();
  const contract = `━━━━━━━━━━━━━━━━━━
【二十二、最终输出契约｜分层校长·分组细化】
━━━━━━━━━━━━━━━━━━

本次是「分层校长」的【分组细化】调用，本契约覆盖前文所有“一次输出全部章节”的要求。
- 全书层战略（BOOK/STYLE/REVEAL/STAGE/TEACHER_GROUP）与粗章表已经定稿，只读，不得推翻、不得重写、不得再次输出。
- 本次只负责「本组」章节：把粗章表里本组每一章从粗展开为完整的[PRINCIPAL_CHAPTER]块，必须且只能输出本组每一章各一块，chapter严格等于本组章号范围，不得多出、缺少、重复或越界。
- 细化必须服从：所属阶段战略、本组战略（groupTask / mustAdvance / mustNotPrematurelyResolve / nextGroupLaunch）、上一组交接卡、上一组最后2章完整块（用于承接）、揭示计划、词典事实。
- 细化可以在方向不变的前提下修正粗章表的标题/功能/目标，但每处修正必须有理由（写进diversityNote）；不得把本组粗章表内容整体改写成另一条故事线。\n- title/function/goal默认原样沿用粗章表；function必须保持粗章表那样的“一句话”写法，不得改写成“引入/推进/转折/高潮/后果收束”之类的类别词；没有必要修正就逐字照抄，不要为了“更细”而改写。
- 本组结束时的状态要能被下一组承接：最后一章的lastEffectiveEvent、nextTransitionType/nextTransitionBasis、handoff必须明确写出本组留给下一组的条件。

输出格式：只输出本组的[PRINCIPAL_CHAPTER]结构块，每块成对闭合，字段名一字不改，不得省略、合并，不得用“同上”“略”代替字段值：

${tpl}

输出要求：先完成本组全部章节结构块，再结束回答；不得输出Markdown、解释、JSON、粗章表或其他战略块。

唯一允许的附加块（可选，写在全部章节块之后）：本组之后需要新建档的新实体清单，供用户做「词典增补」。每行一个，格式「名称｜类型（次要配角/路人/地名/专名/道具/规则…）｜客观用途（只写需要它提供什么场合，不写剧情）」；词典里已有的实体不要列；没有需要就不写：
[DICT_NEEDS]
名称｜类型｜客观用途
[/DICT_NEEDS]
`;
  return (ptCutBeforeContract() + contract + head + '\n\n' + globalCreativeConstraintBlock('principal')).trim();
}
function ptBuildGroupInjection(gi){
  const P = scState().principal || {};
  const T = ptEnsure();
  const assignment = ptAssignment(), total = ptTotal();
  const g = assignment.groups[gi];
  if(!g) return null;
  if(!P.bookStrategy && !Object.keys(T.rough || {}).length) return null;
  const first = Number(g.startChapter), last = Number(g.endChapter);
  const stages = (P.stageStrategies || []).filter(x => Number(x.endChapter) >= first && Number(x.startChapter) <= last);
  const tg = (P.teacherGroupStrategies || []).find(x => String(x.teacherCode || '') === String(g.teacherCode || '')) || (P.teacherGroupStrategies || [])[gi] || null;
  const prevTg = gi > 0 ? ((P.teacherGroupStrategies || [])[gi-1] || null) : null;
  const nextTg = (P.teacherGroupStrategies || [])[gi+1] || null;
  const J = v => JSON.stringify(v, null, 0);
  const lines = [];
  const bd = novelBoundaryFacts(total, last);
  lines.push(`【分组细化任务｜只读系统事实】
全书章节总数=${total}｜本次负责：第${first}-${last}章（共${g.chapterCount}章）｜老师组=${g.teacherCode}（${g.teacherGroupId}）｜角色=${g.role}
上一组=${g.previousTeacherGroupId||'无'}（边界：${g.previousEndChapter==null?'首组':`第${g.previousEndChapter}章`}）｜下一组=${g.nextTeacherGroupId||'无'}（边界：${g.nextStartChapter==null?'末组':`第${g.nextStartChapter}章`}）
必须且只能输出${g.chapterCount}个[PRINCIPAL_CHAPTER]块，chapter从${first}到${last}，连续、唯一。${last===total?`\n第${total}章是全书终章：不得设计下一章、下一阶段或下一位老师；该章nextTransitionType必须明确写全书结束/终局/无下一章，nextTransitionBasis说明本章已完成最终状态，handoff写“无，完成全书终局后停止”。最终阶段=${bd.stageId||'未确定'}。`:`\n第${last}章不是全书终章：它必须把本组留给下一组的条件写进handoff与nextTransitionBasis。`}`);
  if(P.bookStrategy) lines.push(`【全书战略｜BOOK_STRATEGY｜只读】\n${J(P.bookStrategy)}`);
  if(P.schoolRules) lines.push(`【全书纪律｜SCHOOL_RULES｜只读】\n${J(P.schoolRules)}`);
  if(P.styleStrategy){
    const st = P.styleStrategy;
    lines.push(`【全书恒定风格｜GLOBAL｜只读】\nglobalStyle=${st.globalStyle||''}\nglobalStyleEntries=${J(st.globalStyleEntries||[])}\nabsoluteProhibitions=${st.absoluteProhibitions||''}`);
  }
  const rv = ptRevealBlocksText(P.raw);
  if(rv) lines.push(`【揭示计划｜REVEAL_PLAN｜只读】\n${rv}`);
  if(stages.length) lines.push(`【本组所属阶段战略｜STAGE_STRATEGY｜只读】\n${stages.map(x=>J(x)).join('\n')}`);
  if(tg) lines.push(`【本组战略｜TEACHER_GROUP_STRATEGY｜只读】\n${J(tg)}`);
  if(prevTg) lines.push(`【上一组战略摘要】\ngroupTask=${prevTg.groupTask||''}\nnextGroupLaunch=${prevTg.nextGroupLaunch||''}`);
  if(nextTg) lines.push(`【下一组战略摘要（本组需要为它铺路）】\ngroupTask=${nextTg.groupTask||''}\npreviousGroupHandoff=${nextTg.previousGroupHandoff||''}`);
  lines.push(`【全书粗章表｜只读（本组章节标注为待细化）】\n${ptRoughRowsText(T, {first, last})}`);
  if(gi > 0){
    const card = ptCardText(gi-1);
    lines.push(`【上一组交接卡｜程序摘录，必须承接】\n${card || '（上一组尚未细化，没有交接卡；仅依据上一组战略摘要与粗章表承接，并在diversityNote说明承接风险）'}`);
    const prev = T.groups[gi-1];
    if(prev && prev.raw){
      const blocks = ptChapterBlocks(prev.raw);
      const prevLast = Number(prev.last);
      const picks = [prevLast-1, prevLast].filter(n => blocks[n]);
      if(picks.length) lines.push(`【上一组最后${picks.length}章完整块｜只读，用于承接】\n${picks.map(n=>blocks[n]).join('\n\n')}`);
    }
  }
  try{
    const full = principalChapterMiddleShapeSource(total);
    const mine = (full.chapters || []).filter(x => x.chapter >= first && x.chapter <= last);
    if(mine.length) lines.push(`【本组章节中段微拍形状｜只读，结构形状而非剧情】\n${J({rule:full.rule, middleDefinition:full.middleDefinition, chapters:mine})}`);
  }catch(_e){}
  const want = ['canonical_story_strategy','canon_facts','observed_story_state','narrative_shape','time_system','original_constraints'];
  if(gi === 0) want.push('opening_constraint');
  let blocks = principalCompactSourceBlocks(assignment, total).filter(b => want.includes(b.id));
  /* v1.0.592：词典按本组出场范围裁剪（dict-scope.js）；任何一步出错都回退到整本词典。 */
  try{
    if(typeof dscGroupScope === 'function'){
      const sc = dscGroupScope(gi);
      if(sc && sc.text) blocks = blocks.map(b => b.id === 'canon_facts' ? Object.assign({}, b, { label:'全书世界事实·词典权威（本组裁剪版）', content: sc.text }) : b);
    }
  }catch(e){ console.warn('[PT] 词典裁剪失败，回退整本词典', e); }
  lines.push(`【来源总账（本组所需）】\n${principalSourceLedger(blocks)}`);
  lines.push(`【最终要求】
- 先读全书层与交接卡，再细化；用户明确选择、词典已成立事实、正文已观测事实不得改写。
- 只输出本组第${first}-${last}章的[PRINCIPAL_CHAPTER]块，不输出其他任何内容。
- 每块必须包含全部规定字段；endingIntensity为0-4整数。`);
  const ban = banListBlockFor('principal'); if(ban) lines.push(ban);
  return { system: ptGroupSystem(), user: lines.join('\n\n'), group: g, first, last };
}

/* ---------------------------------------------------------------- 全书层：解析与落地 */
function ptParseOutline(raw, total){
  const rows = parseMachineBlocks(raw, 'CHAPTER_OUTLINE');
  const rough = {}, dup = [], outside = [];
  rows.forEach(r => {
    const n = Number(String(r.chapter || '').replace(/[^0-9]/g, ''));
    if(!Number.isInteger(n) || n < 1 || n > total){ if(Number.isInteger(n) && n > 0) outside.push(n); return; }
    if(rough[n]){ dup.push(n); return; }
    rough[n] = { chapter:n, title:String(r.title||'').trim(), function:String(r.function||'').trim(), goal:String(r.goal||'').trim() };
  });
  return { rough, dup, outside, rawCount: rows.length };
}
function ptRoughPlan(r){
  const p = normalizePrincipalChapterPlan({ chapter:r.chapter, title:r.title, function:r.function, goal:r.goal }, r.chapter);
  p._rough = true;
  return p;
}
function ptRecompose(){
  const P = scState().principal; if(!P) return;
  const T = ptEnsure(), total = Number(P.targetChapterCount) || ptTotal();
  const assignment = ptAssignment();
  const plans = {};
  for(let n = 1; n <= total; n++){
    if(T.rough[n]) plans[n] = ptRoughPlan(T.rough[n]);
  }
  assignment.groups.forEach((g, gi) => {
    const st = T.groups[gi];
    if(!st || !st.plans) return;
    if(Number(st.first) !== Number(g.startChapter) || Number(st.last) !== Number(g.endChapter)) return;
    if(st.status === 'stale') return;
    Object.keys(st.plans).forEach(k => { plans[Number(k)] = st.plans[k]; });
  });
  P.plans = plans;
  let strat;
  try{
    strat = (P.bookStrategy ? { book:P.bookStrategy, schoolRules:P.schoolRules, styleStrategy:P.styleStrategy, stages:P.stageStrategies||[], teacherGroups:P.teacherGroupStrategies||[] } : undefined);
    P.chapterStrategies = buildChapterStrategiesFromPrincipal(plans, total, strat);
  }catch(e){ console.warn('[PT] chapterStrategies 重建失败', e); P.chapterStrategies = P.chapterStrategies || {}; }
  try{
    P.managementBridge = (P.strategyErrors && P.strategyErrors.length) ? null : principalManagementBridge(assignment, total, plans, strat);
  }catch(_e){ P.managementBridge = null; }
  const sp = storyState().docs && storyState().docs.schoolPlan;
  if(sp){ sp.plans = plans; sp.chapterStrategies = P.chapterStrategies; sp.managementBridge = P.managementBridge; sp.ts = Date.now(); }
  P.logicAudit = (()=>{ try{ return auditPrincipalPlanLogic(plans, total); }catch(_e){ return null; } })();
}
function ptApplyGlobalRaw(rawIn, opts){
  opts = opts || {};
  const total = ptTotal();
  if(!total) return { ok:false, error:'请先填写有效的全书章节数（1-200）' };
  const assignment = ptAssignment();
  if(!assignment.valid || !assignment.groups.length) return { ok:false, error:'老师章节分配校验失败，请先检查章节数与老师分配' };
  const raw = sanitizePrincipalText(String(rawIn || ''));
  if(!raw.trim()) return { ok:false, error:'校长成果不能为空' };
  let strategy;
  try{ strategy = parsePrincipalStrategyMachine(raw, total, assignment); }
  catch(e){ strategy = { valid:false, errors:[String(e && e.message || e)], book:null, schoolRules:null, styleStrategy:null, stages:[], teacherGroups:[] }; }
  const warnings = (strategy.errors || []).slice();
  let { rough, dup, outside, rawCount } = ptParseOutline(raw, total);
  if(!Object.keys(rough).length){
    // 兜底：用户贴的是旧的一次性输出（只有 PRINCIPAL_CHAPTER 块）时，从中推导粗章表。
    const old = parseMachineBlocks(raw, 'PRINCIPAL_CHAPTER');
    old.forEach(r => {
      const n = Number(String(r.chapter || '').replace(/[^0-9]/g, ''));
      if(Number.isInteger(n) && n >= 1 && n <= total && !rough[n]) rough[n] = { chapter:n, title:String(r.title||'').trim(), function:String(r.function||'').trim(), goal:String(r.goal||'').trim() };
    });
    if(Object.keys(rough).length) warnings.push('没有[CHAPTER_OUTLINE]粗章表，已从[PRINCIPAL_CHAPTER]块推导粗章表；各组仍需在「分组细化」里细化并保存。');
  }
  if(!Object.keys(rough).length) return { ok:false, error:'没有解析到任何[CHAPTER_OUTLINE]粗章表块（全书层必须包含粗章表）' };
  const missing = []; for(let n = 1; n <= total; n++) if(!rough[n]) missing.push(n);
  if(missing.length) warnings.push(`粗章表缺少章节：${missing.slice(0,30).join('、')}${missing.length>30?'…':''}（共缺${missing.length}章）`);
  if(dup.length) warnings.push(`粗章表章节重复：${[...new Set(dup)].join('、')}`);
  if(outside.length) warnings.push(`粗章表越界章节（已忽略）：${[...new Set(outside)].join('、')}`);
  if(rawCount && rawCount !== total && !missing.length && !dup.length) warnings.push(`粗章表块数${rawCount}与全书章数${total}不符`);

  const sc = scState();
  const prev = (sc.principal && typeof sc.principal === 'object') ? sc.principal : {};
  const prevT = prev.tiered || {};
  const prevGroups = Array.isArray(prev.groups) ? prev.groups : [];
  const prevTotal = Number(prev.targetChapterCount) || 0;
  if(opts.source === 'ai') invalidateSchoolDownstream('principal');

  // 已细化的组：范围与章数都没变、且不是「整本重新生成」→ 保留；否则标记为已过期（原文保留供参考）。
  const T = { rough, groups:{}, cards: prevT.cards || {}, dictPick: prevT.dictPick || {} };
  const staleList = [];
  assignment.groups.forEach((g, gi) => {
    const old = prevT.groups && prevT.groups[gi];
    if(!old) return;
    const same = prevGroups[gi] && Number(prevGroups[gi].startChapter) === Number(g.startChapter) && Number(prevGroups[gi].endChapter) === Number(g.endChapter) && prevTotal === total;
    if(same && opts.source !== 'ai'){ T.groups[gi] = old; }
    else { T.groups[gi] = Object.assign({}, old, { status:'stale', staleReason: opts.source === 'ai' ? '全书层已重新生成' : '章节范围或章数变化' }); staleList.push(gi); }
  });

  const ff = teacherFinalResponsibilityFacts(assignment);
  const teacherGroups = (strategy.teacherGroups || []).map((tg, idx) => ({ ...tg, isFinalTeacher: idx === ff.finalTeacherIndex, finalResponsible: idx === ff.finalTeacherIndex, isSingleTeacher: ff.isSingleTeacher, nextGroupLaunch: idx === ff.finalTeacherIndex ? '无' : tg.nextGroupLaunch }));
  const titles = Object.keys(rough).map(Number).sort((a,b)=>a-b).map(n => ({ num:n, title:sanitizePrincipalChapter({ title: rough[n].title }).title })).filter(x => x.title);

  const P = sc.principal = prev;
  const original = (typeof P.originalRaw === 'string' && P.originalRaw.trim()) ? P.originalRaw : raw;
  Object.assign(P, {
    machine:true, parseStatus: (strategy.valid && !missing.length) ? 'complete' : 'partial', protocolVersion:'v591-tiered', tieredLayer:'global',
    targetChapterCount: total, status:'ADOPTED', qcStatus:'NOT_REQUIRED',
    bookStrategy: strategy.book || null, schoolRules: strategy.schoolRules || null, styleStrategy: strategy.styleStrategy || null,
    stageStrategies: strategy.stages || [], teacherGroupStrategies: teacherGroups,
    finalResponsibility: ff, strategyAudit: principalStrategyAudit(strategy, total, assignment), strategyErrors: strategy.valid ? [] : (strategy.errors || []).slice(0, 40),
    teacherAssignment: JSON.parse(JSON.stringify(assignment)),
    groups: assignment.groups.map((g, gi) => ({ gi, teacherGroupId:g.teacherGroupId, teacherCode:g.teacherCode, teacherIndex:g.teacherIndex, role:g.role, stage:g.stage, startChapter:g.startChapter, endChapter:g.endChapter, chapterCount:g.chapterCount, previousTeacherGroupId:g.previousTeacherGroupId, nextTeacherGroupId:g.nextTeacherGroupId, previousEndChapter:g.previousEndChapter, nextStartChapter:g.nextStartChapter })),
    raw, originalRaw: original, ts: Date.now(), updatedAt: Date.now(), folded:false, titles,
    tiered: T, globalWarnings: warnings.slice(0, 60)
  });
  if(opts.injection) P.lastInjection = { system:String(opts.injection.system||''), user:String(opts.injection.user||'') };
  if(opts.reason) P.updateReason = opts.reason;
  if(opts.source !== 'ai') P.parseStatus = (strategy.valid && !missing.length) ? 'manual_edit' : 'manual_edit_partial';

  storyState().canon.principalAt = Date.now();
  storyState().docs = storyState().docs || {};
  storyState().docs.schoolPlan = { source:'principal-tiered-global', status:'ADOPTED', qcStatus:'NOT_REQUIRED', ts:Date.now(), targetChapterCount:total, groups:P.groups, bookStrategy:P.bookStrategy, schoolRules:P.schoolRules, styleStrategy:P.styleStrategy, stageStrategies:P.stageStrategies, teacherGroupStrategies:P.teacherGroupStrategies, finalResponsibility:ff, managementBridge:null, teacherAssignment:P.teacherAssignment, titles, plans:{}, chapterStrategies:{} };
  sc.stale = sc.stale || {}; delete sc.stale.principal;
  staleList.forEach(gi => { delete sc.finished['t'+gi]; sc.stale['t'+gi] = true; });
  storyState().pipelineVersion = (Number(storyState().pipelineVersion) || 0) + 1;
  ptRecompose();
  scMark('principal', true, false);
  markAIDone('principal', false);
  scSetError('principal', null, false, false);
  persist();
  try{ refreshPrincipalUi(); }catch(_e){}
  ptRefresh();
  return { ok:true, warnings, staleGroups:staleList, roughCount:Object.keys(rough).length, valid:!!strategy.valid };
}
function ptSaveGlobalRaw(raw, reason, target){
  const next = String(raw || '').trim();
  if(!next) throw new Error('校长成果不能为空');
  const r = ptApplyGlobalRaw(next, { source:'manual', reason: reason || 'manual_edit' });
  if(!r.ok) throw new Error(r.error);
  if(r.warnings.length) toast(`全书层已保存，有${r.warnings.length}条诊断（见校长面板）`);
  return scState().principal;
}
async function ptGenGlobal(btn, opts){
  if(_ptRun || (typeof _principalRun !== 'undefined' && _principalRun)){ toast('校长统筹已经在运行中，请勿重复点击'); return false; }
  if(!isLong()){ toast('仅长篇小说模式支持校长统筹'); return false; }
  const total = ptTotal();
  if(!total){ toast('请先填写有效的全书章节数（1-200），才能启动校长统筹'); return false; }
  const assignment = ptAssignment();
  if(!assignment.groups.length || !assignment.valid){ toast('老师章节分配校验失败，请先检查章节数与老师分配'); return false; }
  if(!scDone('dictEnrich')){ toast('校长必须接收完整词典后再统筹，请先完成“词典充实”'); return false; }
  const inj = ptBuildGlobalInjection({ teacherAssignment: assignment, targetChapterCount: total });
  if(!inj){ toast('校长全书层输入组装失败，请检查当前章节与老师分配'); return false; }
  const runId = 'principal-g-' + Date.now().toString(36);
  _ptRun = { runId, startedAt: Date.now() };
  markAIRunning('principal'); if(btn) busy(btn, true, '校长（全书层）统筹中…'); if(btn && btn.parentNode) showStopBtn(btn.parentNode);
  try{
    const spec = resolveActiveSpec('principal');
    const temp = (spec && spec.principalTemp != null) ? spec.principalTemp : 0.4;
    const res = await callDeepSeek(inj.system, inj.user, { temperature:temp, maxTokens:32768, signal:_abortCtl?.signal, retry:1, taskKey:'principal', runId, attempt:1 });
    const txt = res && res.text;
    if(!txt || !String(txt).trim()) throw new Error('校长返回空');
    const r = ptApplyGlobalRaw(txt, { source:'ai', injection:inj });
    if(!r.ok) throw new Error(r.error);
    toast(`校长（全书层）已生成并采用：战略 + ${r.roughCount}章粗章表；请逐组做「分组细化」。${r.warnings.length?`（诊断${r.warnings.length}条）`:''}`);
    return true;
  }catch(e){
    console.error('[ptGenGlobal]', e);
    if(e && e.name === 'AbortError'){ toast('已停止校长统筹'); return false; }
    toast('校长（全书层）失败：' + String(e && e.message || e));
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running || []).filter(k => k !== 'principal');
    hideStopBtn(); if(btn) busy(btn, false); _ptRun = null;
  }
}

/* ---------------------------------------------------------------- 分组细化：解析与落地 */
function ptDevText(gi){
  const T = ptPeek(), st = T && T.groups && T.groups[gi];
  const dev = (st && st.deviations) || [];
  if(!dev.length) return '本组细化与粗章表没有偏离。';
  const nm = { title:'标题', function:'功能', goal:'目标' };
  return dev.map(d => `第${d.chapter}章｜${nm[d.field]||d.field}\n  粗章表：${d.rough||'（空）'}\n  细化后：${d.detailed||'（空）'}`).join('\n\n');
}
function ptBuildAutoCard(gi){
  const P = scState().principal || {}, T = ptEnsure();
  const st = T.groups[gi]; if(!st || !st.plans) return '';
  const assignment = ptAssignment(), g = assignment.groups[gi]; if(!g) return '';
  const nums = Object.keys(st.plans).map(Number).sort((a,b)=>a-b);
  if(!nums.length) return '';
  const lastN = nums[nums.length-1], lp = st.plans[lastN] || {};
  const e = lp.ending || {};
  const tg = (P.teacherGroupStrategies || []).find(x => String(x.teacherCode || '') === String(g.teacherCode || '')) || (P.teacherGroupStrategies || [])[gi] || {};
  const stage = (P.stageStrategies || []).find(x => Number(x.startChapter) <= lastN && Number(x.endChapter) >= lastN) || null;
  const lines = [`【交接卡｜第${gi+1}组（第${g.startChapter}-${g.endChapter}章）→ 下一组｜由程序从本组细化结果摘录，可手动编辑】`];
  lines.push(`终章状态：第${lastN}章《${lp.title||''}》｜最后有效事件=${e.lastEffectiveEvent||'未写'}｜章末功能=${e.function||'未写'}｜承接方式=${e.nextTransitionType||'未写'}｜承接依据=${e.nextTransitionBasis||'未写'}`);
  lines.push('本组各章留下的交接条件：');
  nums.forEach(n => { const p = st.plans[n]; if(p && p.handoff) lines.push(`- 第${n}章：${p.handoff}`); });
  if(tg.nextGroupLaunch && tg.nextGroupLaunch !== '无') lines.push(`计划移交给下一组（来自老师组战略）：${tg.nextGroupLaunch}`);
  if(Array.isArray(tg.mustNotPrematurelyResolve) && tg.mustNotPrematurelyResolve.length) lines.push(`仍不得提前解决：${tg.mustNotPrematurelyResolve.join('；')}`);
  if(stage && Number(stage.endChapter) === Number(g.endChapter) && stage.nextStageLaunch && stage.nextStageLaunch !== '无') lines.push(`阶段交接（本组为阶段末）：${stage.nextStageLaunch}`);
  return lines.join('\n');
}
/* function 字段：≤8 字且无标点视为「类别词」，否则视为「一句话」 */
function ptFnIsLabel(s){ s = String(s||'').trim(); return !!s && s.length <= 8 && !/[，。；、,;.\s]/.test(s); }
function ptApplyGroupRaw(gi, rawIn, opts){
  opts = opts || {};
  const P = scState().principal;
  if(!P || !P.tiered || !Object.keys(P.tiered.rough || {}).length) return { ok:false, error:'请先完成「全书层」（生成或读校长成果），再细化分组' };
  const total = ptTotal(), assignment = ptAssignment(), g = assignment.groups[gi];
  if(!g) return { ok:false, error:'未找到该老师组' };
  const first = Number(g.startChapter), last = Number(g.endChapter);
  const raw = sanitizePrincipalText(String(rawIn || ''));
  if(!raw.trim()) return { ok:false, error:'本组细化成果不能为空' };
  const rows = parseMachineBlocks(raw, 'PRINCIPAL_CHAPTER');
  if(!rows.length) return { ok:false, error:'没有解析到任何[PRINCIPAL_CHAPTER]块' };
  const by = {}, dup = [], outside = [];
  rows.forEach(r => {
    const n = Number(String(r.chapter || '').replace(/[^0-9]/g, ''));
    if(!Number.isInteger(n) || n < 1) return;
    if(n < first || n > last){ outside.push(n); return; }
    if(by[n]) dup.push(n); else by[n] = r;
  });
  const missing = [], invalid = [];
  for(let n = first; n <= last; n++){
    const r = by[n]; if(!r){ missing.push(n); continue; }
    const miss = PT_CHAPTER_REQUIRED.filter(k => !String(r[k] ?? '').trim());
    const it = Number(r.endingIntensity);
    if(!Number.isInteger(it) || it < 0 || it > 4){ if(!miss.includes('endingIntensity')) miss.push('endingIntensity(0-4)'); }
    if(n === total){
      const nt = String(r.nextTransitionType || '').trim(), nb = String(r.nextTransitionBasis || '').trim(), hd = String(r.handoff || '').trim();
      if(!/终局|全书结束|无下一章|无$/.test(nt)) miss.push('终章nextTransitionType必须明确为全书结束/终局/无下一章');
      if(/下一阶段|阶段交接|下一章|第\s*\d+\s*章/.test(nt + ' ' + nb + ' ' + hd) && !/无|结束|终局/.test(nt + ' ' + nb)) miss.push('终章不得设计后续剧情');
    }
    if(miss.length) invalid.push({ chapter:n, fields:miss });
  }
  const diag = [];
  if(missing.length) diag.push(`缺少章节：${missing.join('、')}`);
  if(dup.length) diag.push(`章节重复：${[...new Set(dup)].join('、')}`);
  if(outside.length) diag.push(`越界章节（不属于本组，已忽略）：${[...new Set(outside)].join('、')}`);
  invalid.forEach(x => diag.push(`第${x.chapter}章字段不完整：${x.fields.join('、')}`));
  const plans = {};
  Object.keys(by).map(Number).sort((a,b)=>a-b).forEach(n => { plans[n] = normalizePrincipalChapterPlan(by[n], n); });
  const ff = teacherFinalResponsibilityFacts(assignment);
  if(gi === ff.finalTeacherIndex && plans[total]){
    const fp = plans[total]; fp.ending = fp.ending || {};
    fp.ending.nextTransitionType = '全书结束／终局／无下一章';
    fp.ending.nextTransitionBasis = '本章已完成全书最终状态，不存在下一章、下一阶段或下一位老师。';
    fp.handoff = '无，完成全书终局后停止。';
    fp.teacherTask = String(fp.teacherTask || '') + '；本章由最终结局负责者完成全书终局，不承担任何后续交接。';
  }
  const T = ptEnsure();
  const needsM = raw.match(/\[\s*DICT_NEEDS\s*\]([\s\S]*?)\[\s*\/\s*DICT_NEEDS\s*\]/i);
  const needsText = needsM ? needsM[1].split('\n').map(x => x.trim()).filter(x => x && !/^名称｜类型｜/.test(x)).join('\n') : '';
  const deviations = [];
  Object.keys(plans).map(Number).forEach(n => {
    const r = T.rough[n], p = plans[n]; if(!r) return;
    ['title','function','goal'].forEach(f => {
      const a = String(r[f]||'').trim(), b = String(p[f]||'').trim(); if(a === b) return;
      /* v1.0.593：粗章表的 function 是一句话，AI 细化时常改成类别词（引入/推进/后果收束）。写法不同不算偏离，也不回写。 */
      if(f === 'function' && ptFnIsLabel(a) !== ptFnIsLabel(b)) return;
      deviations.push({ chapter:n, field:f, rough:a, detailed:b });
    });
  });
  const status = (!missing.length && !invalid.length) ? 'detailed' : 'partial';
  const old = T.groups[gi] || {};
  T.groups[gi] = { raw, ts:Date.now(), status, first, last, diag, deviations, devApplied:false, dictHints: (typeof dscDictHints === 'function' ? dscDictHints(gi, plans) : []), needs: needsText || String(old.needs || ''), plans, forceReady: !!old.forceReady && status !== 'detailed' ? true : false, source: opts.source || 'manual' };
  try{ if(typeof dscAutoAppend === 'function'){ const nAuto = dscAutoAppend(gi, T.groups[gi].dictHints); T.groups[gi].dictAuto = nAuto; } }catch(_e){}
  // 交接卡：程序摘录；保留用户手动编辑过的版本（卡片里并排显示自动版）。
  const prevCard = T.cards[gi];
  T.cards[gi] = { auto: ptBuildAutoCard(gi), manual: prevCard && prevCard.manual ? prevCard.manual : null, ts:Date.now() };
  // 本组之后的各组：它们读的是旧交接卡，标记为需复核（仅提示，不强制过期）。
  const sc = scState(); sc.stale = sc.stale || {};
  delete sc.finished['t'+gi]; sc.stale['t'+gi] = true;
  const titles = Object.keys(plans).map(Number).sort((a,b)=>a-b).map(n => ({ num:n, title:sanitizePrincipalChapter({ title: plans[n].title }).title })).filter(x => x.title);
  if(titles.length){ try{ doApplyTitles(titles, { silent:true, deferCommit:true }); }catch(_e){} }
  P.updatedAt = Date.now();
  ptRecompose();
  storyState().pipelineVersion = (Number(storyState().pipelineVersion) || 0) + 1;
  persist();
  ptRefresh();
  return { ok:true, status, diag, deviations:deviations.length, count:Object.keys(plans).length };
}
async function ptGenGroup(gi, btn){
  if(_ptRun || (typeof _principalRun !== 'undefined' && _principalRun)){ toast('校长统筹已经在运行中，请勿重复点击'); return false; }
  const inj = ptBuildGroupInjection(gi);
  if(!inj){ toast('请先完成「全书层」，再细化分组'); return false; }
  const runId = 'principal-g' + (gi+1) + '-' + Date.now().toString(36);
  _ptRun = { runId, startedAt: Date.now(), gi };
  markAIRunning('principal'); if(btn) busy(btn, true, '细化中…'); if(btn && btn.parentNode) showStopBtn(btn.parentNode);
  try{
    const spec = resolveActiveSpec('principal');
    const temp = (spec && spec.principalTemp != null) ? spec.principalTemp : 0.4;
    const res = await callDeepSeek(inj.system, inj.user, { temperature:temp, maxTokens:32768, signal:_abortCtl?.signal, retry:1, taskKey:'principal', runId, attempt:1 });
    const txt = res && res.text;
    if(!txt || !String(txt).trim()) throw new Error('校长返回空');
    const r = ptApplyGroupRaw(gi, txt, { source:'ai' });
    if(!r.ok) throw new Error(r.error);
    toast(`第${gi+1}组已细化：${r.count}章${r.status==='detailed'?'':'（有诊断，见该组「读本组」）'}${r.deviations?`；与粗章表偏离${r.deviations}处`:''}`);
    return true;
  }catch(e){
    console.error('[ptGenGroup]', e);
    if(e && e.name === 'AbortError'){ toast('已停止校长细化'); return false; }
    toast('校长细化失败：' + String(e && e.message || e));
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running || []).filter(k => k !== 'principal');
    hideStopBtn(); if(btn) busy(btn, false); _ptRun = null; ptRefresh();
  }
}

/* ---------------------------------------------------------------- 粗章表读写 */
function ptRoughToText(){
  const T = ptPeek(); if(!T || !T.rough) return '';
  return Object.keys(T.rough).map(Number).sort((a,b)=>a-b).map(n => { const r = T.rough[n]; return `[CHAPTER_OUTLINE]\nchapter=${n}\ntitle=${r.title||''}\nfunction=${r.function||''}\ngoal=${r.goal||''}\n[/CHAPTER_OUTLINE]`; }).join('\n\n');
}
function ptSaveRoughText(text){
  const P = scState().principal; if(!P || !P.tiered) return { ok:false, error:'请先完成全书层' };
  const total = ptTotal();
  const parsed = ptParseOutline(String(text || ''), total);
  if(!Object.keys(parsed.rough).length) return { ok:false, error:'没有解析到任何[CHAPTER_OUTLINE]块' };
  const missing = []; for(let n = 1; n <= total; n++) if(!parsed.rough[n]) missing.push(n);
  const T = ptEnsure();
  const next = Object.assign({}, T.rough, parsed.rough);
  T.rough = next;
  ptRecompose();
  storyState().pipelineVersion = (Number(storyState().pipelineVersion) || 0) + 1;
  persist(); ptRefresh();
  return { ok:true, missing, changed:Object.keys(parsed.rough).length };
}
function ptApplyDeviations(gi){
  const T = ptEnsure(), st = T.groups[gi]; if(!st || !st.deviations || !st.deviations.length) return 0;
  st.deviations.forEach(d => { if(T.rough[d.chapter]) T.rough[d.chapter][d.field] = d.detailed; });
  st.devApplied = true;
  ptRecompose(); persist(); ptRefresh();
  return st.deviations.length;
}

/* ---------------------------------------------------------------- 界面 */
function ptStatusBadge(s){
  const m = { rough:['粗','#64748b'], detailed:['已细化','#16a34a'], partial:['细化不完整','#d97706'], stale:['已过期','#dc2626'] }[s] || ['粗','#64748b'];
  return `<span style="display:inline-block;padding:1px 8px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${m[1]}">${m[0]}</span>`;
}
function ptPanelInner(){
  const mode = principalTieredMode();
  const enabled = principalTieredEnabled();
  const total = ptTotal();
  const sel = `<select data-pt-mode style="font-size:12px;padding:2px 6px">
    <option value="auto"${mode==='auto'?' selected':''}>自动（章数>${PT_SINGLE_CALL_MAX}才分层）</option>
    <option value="on"${mode==='on'?' selected':''}>强制分层</option>
    <option value="off"${mode==='off'?' selected':''}>关闭（一次性校长）</option></select>`;
  let html = `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0"><b style="font-size:12px">👑 校长分层模式</b>${sel}<span class="muted" style="font-size:11px">${enabled?'当前：分层（全书层 + 分组细化）':'当前：一次性校长'}</span></div>`;
  if(!enabled) return html;
  if(typeof ocPrincipalRowHtml === 'function') html += ocPrincipalRowHtml();   // v1.0.596：一键校长 + 步骤间隔
  const P = scState().principal || {}, T = ptPeek() || { rough:{}, groups:{}, cards:{} };
  const hasGlobal = !!(P.tiered && Object.keys(T.rough || {}).length);
  const groups = ptAssignment().groups;
  const warnings = [];
  if(hasGlobal && Number(P.targetChapterCount) && Number(P.targetChapterCount) !== total) warnings.push(`章数已从${P.targetChapterCount}变为${total}：全书层已过期，请重新生成或读取全书层。`);
  if(hasGlobal && (P.strategyErrors||[]).length) warnings.push(`全书层有${P.strategyErrors.length}条战略诊断（点「读校长成果」可查看原文并修改；诊断：${esc(P.strategyErrors.slice(0,3).join('；'))}${P.strategyErrors.length>3?'…':''}）`);
  if(hasGlobal && (P.globalWarnings||[]).some(w => /粗章表/.test(w))) warnings.push(esc((P.globalWarnings||[]).filter(w=>/粗章表/.test(w)).slice(0,2).join('；')));
  html += `<div class="muted" style="font-size:12px;margin:4px 0">${hasGlobal?`全书层已完成：粗章表${Object.keys(T.rough).length}/${total}章。下面逐组做「分组细化」，细化完成的组才能交给老师。`:'第一步：点上方「👑 生成校长」（或「📦 注入导出」→外部AI→「📋 读校长成果」）完成全书层。'}</div>`;
  warnings.forEach(w => { html += `<div style="font-size:12px;color:#dc2626;margin:2px 0">⚠ ${w}</div>`; });
  if(hasGlobal){
    html += `<div style="margin:6px 0"><button type="button" class="sc-plan-btn" data-pt-act="rough">📋 读粗章表</button></div>`;
    html += groups.map((g, gi) => {
      const s = ptGroupEffectiveStatus(gi), st = T.groups && T.groups[gi];
      const devN = st && st.deviations && !st.devApplied ? st.deviations.length : 0;
      const ready = ptGroupReady(gi);
      const diag = st && st.diag && st.diag.length ? `<div style="font-size:11px;color:#d97706;margin:2px 0 0 4px">${esc(st.diag.slice(0,3).join('；'))}${st.diag.length>3?'…':''}</div>` : '';
      const stale = s === 'stale' && st && st.staleReason ? `<span class="muted" style="font-size:11px">（${esc(st.staleReason)}）</span>` : '';
      const ds = (typeof dscGroupStats === 'function') ? dscGroupStats(gi) : null;
      const dsLine = ds ? `<div class="muted" style="font-size:11px;margin:4px 0 0 4px">📖 本组词典：完整${ds.full}条 · 名录${ds.listed}条 · 约${ds.chars}字${(ds.manualAdd||ds.manualDrop)?`（手动 +${ds.manualAdd}/-${ds.manualDrop}）`:''}${ds.over?' <span style="color:#dc2626">⚠超上限</span>':''}</div>` : '';
      const dh = st && st.dictHints && st.dictHints.length ? `<div style="font-size:11px;color:#2563eb;margin:2px 0 0 4px">📖 本组章节用到了本组词典里只有一句话名录信息的实体：${esc(st.dictHints.slice(0,8).map(x=>`${x.name}${x.chapters&&x.chapters.length?`（第${x.chapters.slice(0,4).join('、')}章${x.chapters.length>4?'…':''}）`:''}${x.dropped?'·你取消过':''}`).join('、'))}${st.dictHints.length>8?`等${st.dictHints.length}个`:''}。${st.dictAuto?`已自动追加${st.dictAuto}个到「📖 本组词典」（无需手动打钩）。`:''}想让它们按完整设定生效：重新「📦 注入导出」→ 外部AI →「读本组」覆盖保存；不重做也可以，已细化结果不受影响。</div>` : '';
      return `<div style="border:1px solid var(--line);border-radius:8px;padding:6px 8px;margin:6px 0">
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <b style="font-size:12px">第${gi+1}组 · ${esc(g.teacherCode||'')}</b><span class="muted" style="font-size:12px">第${g.startChapter}-${g.endChapter}章</span>
          ${ptStatusBadge(s)}${ready && s!=='detailed'?'<span class="muted" style="font-size:11px">（已强制视为可用）</span>':''}${stale}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
          <button type="button" class="sc-plan-btn" data-pt-act="gen" data-pt-gi="${gi}">🪄 细化本组(AI)</button>
          <button type="button" class="sc-plan-btn" data-pt-act="inj" data-pt-gi="${gi}">📦 注入导出</button>
          <button type="button" class="sc-plan-btn" data-pt-act="read" data-pt-gi="${gi}">📋 读本组</button>
          <button type="button" class="sc-plan-btn" data-pt-act="card" data-pt-gi="${gi}">🤝 交接卡</button>
          <button type="button" class="sc-plan-btn" data-pt-act="dictpick" data-pt-gi="${gi}">📖 本组词典</button>
          ${st ? `<button type="button" class="sc-plan-btn" data-pt-act="supp" data-pt-gi="${gi}">📚 词典增补${st.needs?'*':''}</button>` : ''}
          ${devN?`<button type="button" class="sc-plan-btn" data-pt-act="dev" data-pt-gi="${gi}">Δ 偏离记录(${devN})</button>`:''}
          ${st && (s==='partial') ? `<button type="button" class="sc-plan-btn" data-pt-act="force" data-pt-gi="${gi}">${st.forceReady?'取消强制可用':'仍视为可用'}</button>`:''}
        </div>${dsLine}${diag}${dh}</div>`;
    }).join('');
  }
  return html;
}
function ptPanelHtml(){ return `<div data-pt-panel style="margin:6px 0 10px">${ptPanelInner()}</div>`; }
function ptRefresh(){
  document.querySelectorAll('[data-pt-panel]').forEach(el => { el.innerHTML = ptPanelInner(); });
  if(typeof ocPaint === 'function') ocPaint();   // 重绘后恢复一键按钮的运行态文字
}
function ptEnsureStyle(){
  if(document.getElementById('ptModalStyle')) return;
  const st = document.createElement('style'); st.id = 'ptModalStyle';
  st.textContent = '.pt-modal{width:min(920px,92vw)!important;height:min(760px,86vh)!important;max-width:none!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}.pt-modal textarea{display:block;width:100%;height:100%;min-height:380px;box-sizing:border-box;resize:none;overflow:auto;white-space:pre-wrap;word-break:break-word;background:var(--panel2);color:var(--text);border:1px solid var(--line);padding:8px;font-size:12.5px;line-height:1.55}';
  document.head.appendChild(st);
}
function ptOpenText(opt){
  ptEnsureStyle();
  const ov = document.createElement('div'); ov.className = 'gs-overlay pt-overlay';
  ov.innerHTML = `<div class="gs-modal pt-modal" role="dialog" aria-modal="true">
    <div class="gs-modal-head" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div><b>${esc(opt.title||'')}</b><span class="muted" style="margin-left:8px;font-size:11px">${esc(opt.sub||'')}</span></div>
      <button type="button" class="gs-x" data-pt-close>✕</button></div>
    <div style="padding:12px 16px;flex:1;min-height:0;display:flex"><textarea spellcheck="false" ${opt.readonly?'readonly':''}></textarea></div>
    <div style="display:flex;gap:10px;justify-content:flex-end;padding:0 16px 16px;flex:0 0 auto;flex-wrap:wrap" data-pt-btns></div></div>`;
  document.body.appendChild(ov);
  const ta = ov.querySelector('textarea'); ta.value = String(opt.text || '');
  const close = () => ov.remove();
  ov.querySelector('[data-pt-close]').onclick = close;
  ov.addEventListener('mousedown', e => { if(e.target === ov) close(); });
  const bar = ov.querySelector('[data-pt-btns]');
  (opt.buttons || []).forEach(b => {
    const el = document.createElement('button'); el.type = 'button'; el.className = 'btn' + (b.primary ? ' primary' : ''); el.textContent = b.label;
    el.onclick = () => { try{ b.onClick(ta.value, close, ta); }catch(e){ toast('操作失败：' + String(e && e.message || e)); } };
    bar.appendChild(el);
  });
  ta.focus(); ta.setSelectionRange(0, 0); ta.scrollTop = 0;
  return { close, ta };
}
function ptFileSafe(s){ return String(s||'').replace(/[^A-Za-z0-9_\-\u4e00-\u9fa5]/g, '_'); }
function ptAct(act, gi, btn){
  const groups = ptAssignment().groups, g = groups[gi];
  if(act === 'rough'){
    ptOpenText({ title:'📋 粗章表', sub:'每章：chapter / title / function / goal；保存后立即生效（已细化章节以细化结果为准）', text:ptRoughToText(),
      buttons:[
        { label:'导出TXT', onClick:(t)=>{ downloadPlainText('校长_粗章表.txt', t); toast('粗章表 TXT 已导出'); } },
        { label:'保存更改', primary:true, onClick:(t,close)=>{ const r = ptSaveRoughText(t); if(!r.ok) return toast(r.error); toast(`粗章表已保存（更新${r.changed}章）${r.missing.length?`；仍缺${r.missing.length}章`:''}`); close(); } }
      ] });
    return;
  }
  if(!g) return;
  const T = ptEnsure();
  if(act === 'gen'){ ptGenGroup(gi, btn); return; }
  if(act === 'inj'){
    const inj = ptBuildGroupInjection(gi);
    if(!inj){ toast('请先完成「全书层」'); return; }
    const text = `【SYSTEM】\n${inj.system}\n\n【USER】\n${inj.user}`;
    ptOpenText({ title:`👑 校长 · 第${gi+1}组细化 · 注入导出`, sub:`第${inj.first}-${inj.last}章 · SYSTEM + USER`, text, readonly:true,
      buttons:[
        { label:'复制', onClick:()=>{ copyText(text); toast('本组细化注入已复制'); } },
        { label:'导出TXT', primary:true, onClick:()=>{ downloadPlainText(`校长_细化_第${gi+1}组_${ptFileSafe(g.teacherCode)}_注入.txt`, text); toast('TXT 已导出'); } }
      ] });
    return;
  }
  if(act === 'read'){
    const st = T.groups[gi];
    ptOpenText({ title:`📋 读本组校长细化成果 · 第${gi+1}组`, sub:`第${g.startChapter}-${g.endChapter}章 · 粘贴外部AI的输出或直接编辑，保存后立即生效`, text: st && st.raw ? st.raw : '',
      buttons:[
        { label:'导出TXT', onClick:(t)=>{ downloadPlainText(`校长_细化_第${gi+1}组_${ptFileSafe(g.teacherCode)}_输出.txt`, t); toast('TXT 已导出'); } },
        { label:'保存更改', primary:true, onClick:(t,close)=>{ const r = ptApplyGroupRaw(gi, t, { source:'manual' }); if(!r.ok) return toast(r.error); toast(r.status==='detailed' ? `第${gi+1}组已保存：${r.count}章已细化${r.deviations?`；偏离粗章表${r.deviations}处`:''}` : `第${gi+1}组已保存，但有诊断：${r.diag.slice(0,2).join('；')}`); close(); } }
      ] });
    return;
  }
  if(act === 'card'){
    const c = T.cards[gi] || {};
    const cur = (c.manual != null && String(c.manual).trim()) ? c.manual : (c.auto || '');
    if(!cur){ toast('本组尚未细化，还没有交接卡'); return; }
    ptOpenText({ title:`🤝 交接卡 · 第${gi+1}组 → 第${gi+2}组`, sub: c.manual ? '当前使用：手动编辑版' : '当前使用：程序摘录版（可编辑，保存后下一组细化读取这一版）', text: cur,
      buttons:[
        { label:'导出TXT', onClick:(t)=>{ downloadPlainText(`校长_交接卡_第${gi+1}组.txt`, t); toast('TXT 已导出'); } },
        { label:'恢复程序摘录版', onClick:(t,close)=>{ const T2 = ptEnsure(); T2.cards[gi] = { auto: ptBuildAutoCard(gi), manual:null, ts:Date.now() }; persist(); ptRefresh(); toast('已恢复为程序摘录版'); close(); } },
        { label:'保存更改', primary:true, onClick:(t,close)=>{ const T2 = ptEnsure(); const prev = T2.cards[gi] || {}; T2.cards[gi] = { auto: prev.auto || ptBuildAutoCard(gi), manual: String(t||'').trim() || null, ts:Date.now() }; persist(); ptRefresh(); toast('交接卡已保存'); close(); } }
      ] });
    return;
  }
  if(act === 'dev'){
    ptOpenText({ title:`Δ 偏离记录 · 第${gi+1}组`, sub:'细化后与粗章表的标题/功能/目标差异；确认后可回写粗章表', text: ptDevText(gi), readonly:true,
      buttons:[ { label:'确认回写粗章表', primary:true, onClick:(t,close)=>{ const n = ptApplyDeviations(gi); toast(`已回写粗章表（${n}处）`); close(); } } ] });
    return;
  }
  if(act === 'supp'){ if(typeof dsOpen === 'function') dsOpen(gi); return; }
  if(act === 'dictpick'){ if(typeof dscOpenPicker === 'function') dscOpenPicker(gi); return; }
  if(act === 'force'){
    const st = T.groups[gi]; if(!st) return;
    st.forceReady = !st.forceReady; persist(); ptRefresh(); toast(st.forceReady ? '已强制视为可用（诊断仍保留）' : '已取消强制可用');
    return;
  }
}
if(!document._ptDelegate){
  document._ptDelegate = 1;
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-pt-act]');
    if(!b) return;
    e.preventDefault(); e.stopPropagation();
    ptAct(b.dataset.ptAct, Number(b.dataset.ptGi), b);
  }, true);
  document.addEventListener('change', e => {
    const s = e.target.closest && e.target.closest('[data-pt-mode]');
    if(!s) return;
    scState().principalTieredMode = s.value; persist(); ptRefresh();
    toast('校长分层模式已切换：' + ({auto:'自动', on:'强制分层', off:'关闭'}[s.value]));
  }, true);
}
