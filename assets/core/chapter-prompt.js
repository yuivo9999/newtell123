/**
 * Chapter prompt context assembly.
 *
 * Context7/MDN-guided ESM boundary: keep chapter-context assembly in named
 * exports and leave the legacy entrypoint as a thin orchestrator. During the
 * migration, legacy-only helpers/state are accessed through a narrow runtime
 * bridge rather than copying the legacy implementation into this module.
 */
const runtime = () => window.TellMeRuntime || {};
const state = new Proxy({}, { get(_target, key) { return runtime().state?.[key]; } });
const fn = (name) => (...args) => {
  const f = runtime()[name] || window[name];
  if (typeof f !== 'function') throw new Error(`[chapter-prompt] runtime function unavailable: ${name}`);
  return f(...args);
};

const openingStrategyBrief = fn('openingStrategyBrief');
const principalOpeningTaskExcerpt = fn('principalOpeningTaskExcerpt');
const openingStrategyExecutionCard = fn('openingStrategyExecutionCard');
const chapterPlanAuthority = fn('chapterPlanAuthority');
const teacherChapterPlan = fn('teacherChapterPlan');
const principalRulesExcerpt = fn('principalRulesExcerpt');
const principalStyleExecutionExcerpt = fn('principalStyleExecutionExcerpt');
const principalCausalityExcerpt = fn('principalCausalityExcerpt');
const _timeContractForChapter = fn('_timeContractForChapter');
const chapterTailExcerpt = fn('chapterTailExcerpt');
const buildDynamicProtagonistLedger = fn('buildDynamicProtagonistLedger');
const buildRollingSummary = fn('buildRollingSummary');
const storyStateChapterBlock = fn('storyStateChapterBlock');
const commitPlannedChapterState = fn('commitPlannedChapterState');
const chapterLenBounds = fn('chapterLenBounds');
const isLong = fn('isLong');
const principalRuntime = () => runtime();
const cleanBeatDividerTrailer = fn('cleanBeatDividerTrailer');
const _extractPlanTimeRange = fn('_extractPlanTimeRange');
const _timeDaySpan = fn('_timeDaySpan');
import { buildNextChapterContext } from './next-chapter-context.js';

export function buildChapterOpeningContext(i) {
  const parts = [];
  const opening = openingStrategyBrief();
  if (opening) parts.push(opening);
  if (i === 0) {
    const openingTask = principalOpeningTaskExcerpt() || openingStrategyExecutionCard(0);
    if (openingTask) parts.push(openingTask);
  }
  return parts;
}

export function buildClosedChapterContext(i, chap, o) {
  const curN = i + 1;
  const parts = [];
  const hasT = String(chap.title || '').trim();
  const card = chapterPlanAuthority(i);
  const lesson = card?.raw || teacherChapterPlan(i);

  parts.push(`【长篇小说与章节定位】\n书名：${o.title || '（未定书名）'}\n定位：第 ${curN} 章${hasT ? `《${chap.title}》` : ''}`);

  const pRules = principalRulesExcerpt();
  if (pRules) {
    parts.push(`【第一层 · 宏观层（不变 · 校长写作守则与文风人设纪律）】\n${pRules}\n【守则红线】严格遵守全书统一文风、人物说话口吻与人设底线，严禁行文中人设漂移或出现现代违和口语。`);
  }
  const pStyle = principalStyleExecutionExcerpt();
  if (pStyle) {
    parts.push(`【第一层附录 · 已裁决风格施工层（只决定怎么写，不决定写什么）】\n${pStyle}\n执行原则：这是校长已经完成的风格冲突裁决结果。你不得在正文阶段重新选择‘轻松/悬疑/治愈/冷峻’等风格组合；只需按本章教案把既定风格落到具体场景、对白、叙事、节奏与情绪。`);
  }
  const pCausal = principalCausalityExcerpt();
  parts.push(`【第一层附录 · 因果闭环锁（决定事件能否这样发生）】\n${pCausal}\n执行原则：本层不改变老师教案规定的核心剧情，但会审查事件发生资格。教案中的结果必须通过已建立的前置状态、线索/信息来源、人物行动、能力/资源与场景触发自然抵达；若教案本身存在因果缺口，正文不得凭空发明关键理由，应优先采用教案允许的铺垫空间补足最小必要中间步骤。`);

  parts.push(`【第二层 · 中观层（静态指导 · 单源真理超级教案）】\n说明：这是任课老师为你备下的本章唯一创作航海图（已深度内嵌章节微拍节奏、时间落点与严谨出场名单）。本章剧情推进、骨架环节、情绪弧度、出场人物 100% 以本教案为单一真理（Single Source of Truth），严格按指引逐拍写透写足，严禁自行越权脑补或擅改主线。\n——— 本章超级教案开始 ———\n${lesson}\n——— 本章超级教案结束 ———`);
  parts.push(`【正文执行锁】风格冲突已在校长层解决、场景化施工已在老师层解决；正文阶段禁止再次进行风格方案选择。你只需把‘本章风格施工指令’稳定落实到教案规定的事件中：同一事件可以换不同文学写法，但不得改变事件本身、不得新增一套风格体系。`);

  const timeContract = _timeContractForChapter(i);
  if (timeContract) parts.push(timeContract);

  const microParts = [];
  if (i > 0) {
    const tail = chapterTailExcerpt(i, 480);
    if (tail) microParts.push(`◆ 上一章末尾 · 物理接力（本章开笔物理现实起点）\n这是上一章正文最末真实自然断点文字。本章第一段必须与它"伤口对缝"：\n① 物理起点接力：第一段直接从本段收尾处的景象 / 动作 / 未说完的对话 / 人物处境 / 即时情绪自然续写；\n② 真实物理基准：段中人物当前处所、悬而未决的对话与最后动作定格，以此文字为准，禁止另起炉灶；\n③ 平滑过桥：若本段物理时空与上方教案「剧情时间落点」或骨架第①拍存在跨度，在首段用 1~2 句自然过渡句平滑过桥，随即全面切入教案骨架！\n——— 上一章末尾原文 ———\n${tail}\n——— 上一章末尾结束 ———`);
    const ledger = buildDynamicProtagonistLedger(i);
    if (ledger) microParts.push(ledger);
    const rolling = buildRollingSummary(i);
    if (rolling) microParts.push(`◆ 前文滚动剧情记忆（防长篇记忆损耗）\n${rolling}`);
    parts.push(`【第三层 · 微观层（动态滚入 · 物理事实与动态状态战报包）】\n${microParts.join('\n\n')}`);
  } else {
    parts.push(`【第三层 · 微观层（首章开篇物理基准）】\n本章为全书第 1 章（首章开篇）：无上一章正文。必须优先执行【第一章开篇任务卡】，并让教案骨架第①拍与该卡一致；首段从实际事件/人物现场起笔，迅速建立核心人物、类型信号、可见问题与继续阅读的下一问。禁止用大段背景说明替代开篇策略。`);
  }
  return { parts, card, lesson, hasT };
}

export function buildChapterBoundaryContext(i, o, hasT) {
  const isLast = (i + 1) >= (o.chapters || []).length;
  let boundary = hasT
    ? `【本章边界】本章内容须紧扣本章标题与教案展开、不得偏离；已发生的剧情不重复叙述。到达这些要求的路径、细节与文学笔法由你自由发挥。`
    : `【本章边界】本章内容须紧扣教案推进骨架展开、不得偏离；已发生的剧情不重复叙述。到达这些要求的路径、细节与文学笔法由你自由发挥。`;
  if (isLast) {
    boundary += `\n【全书收束】本章为全书最后一章：请收束全书主线，交代主要人物归宿与冲突的最终解决，给出确定结局，不留开放式烂尾。`;
  } else {
    const nextC = (o.chapters && o.chapters[i + 1]) || null;
    const nt = (nextC && String(nextC.title || '').trim()) || '';
    boundary += `\n【下一章边界】下一章为第 ${i + 2} 章${nt ? `《${nt}》` : ''}。本章严禁提前展开或剧透下一章内容。`;
  }
  return boundary;
}

export function buildLegacyChapterContext(i, chap, o, card) {
  const parts = [`【小说简介】书名：${o.title || ''}\n${o.logline || ''}`];
  const plan = (Array.isArray(o.chapterPlans) && o.chapterPlans[i]) || null;
  if (plan && String(plan.beatsText || '').trim()) {
    const text = cleanBeatDividerTrailer(plan.beatsText);
    if (text) parts.push(`【本章节拍编排】\n${text}\n`);
  }
  if (i > 0) {
    const tail = chapterTailExcerpt(i);
    if (tail) parts.push(`【上一章末尾】\n${tail}`);
    const ledger = buildDynamicProtagonistLedger(i);
    if (ledger) parts.push(ledger);
    const rolling = buildRollingSummary(i);
    if (rolling) parts.push(`【前文滚动摘要】\n${rolling}`);
  }
  const hasT = String(chap.title || '').trim();
  const timeContract = _timeContractForChapter(i);
  if (timeContract) parts.push(timeContract);
  const ccTime = card ? _extractPlanTimeRange({ beatsText: '剧情时间落点：' + String(card.time || '') }) : { from: '', to: '' };
  if (card && ccTime.from && ccTime.to) {
    const span = _timeDaySpan(ccTime.from, ccTime.to);
    parts.push(`【章节时间覆盖执行令】本章必须从“${ccTime.from}”真实推进到“${ccTime.to}”。${span != null && span >= 1 ? `这是约${span}天的跨度；可以跳日、蒙太奇、赶路、训练、调查、生活过程或阶段性结果来承载，但不能把全部事件挤在前1-2天后仅在末尾口头说“过了几天”。` : ''} ${card.timeCoverage ? `老师安排的时间推进：${card.timeCoverage}` : ''} 骨架每一环必须服从这个时间轴；相邻环节跨日时必须自然交代时间流逝。`);
  }
  parts.push(`【本章任务】第 ${i + 1} 章${hasT ? `《${chap.title}》` : ''}`);
  return parts;
}

export function buildChapterStateContext(i) {
  const rt = principalRuntime();
  if (!isLong()) return [];
  const card = chapterPlanAuthority(i);
  if (!card) commitPlannedChapterState(i, (state.outline && state.outline.chapterPlans || [])[i] || {}, 'legacy-plan');
  const block = storyStateChapterBlock(i);
  return block ? [`【小说状态链｜上一章实际结算 + 本章计划】\n${block}`] : [];
}

export function buildChapterLengthContext() {
  const lb = chapterLenBounds() || { floor: 2700, lo: 3000, hi: 3600 };
  const lo = lb.lo > 0 ? Math.round(+lb.lo) : 3000;
  const hi = lb.hi > 0 ? Math.round(+lb.hi) : 3600;
  const cap = Math.max(hi, Math.round(hi * 1.15));
  return `【篇幅契约 · 覆盖各段事件、整体连续成篇、达标即收束】全章正文字数必须 ≥ ${lb.floor.toLocaleString()} 字（目标 ${lo.toLocaleString()}—${hi.toLocaleString()} 字，硬顶 ${cap.toLocaleString()} 字，超过即判超长）。\n【成篇写法】\n1. 骨架里每一段事件都必须写到、不得遗漏，但它们不是互不相干的独立小节，而是本章内按因果连续推进的故事小节：写正文时由上个环节的剧情自然引到下个环节，相邻环节之间必须有自然的衔接与过渡（剧情因果驱动、情绪递进、动作延续，或时间/空间切换的过渡句），只要叙事连续，相邻环节允许融合在同一场景内连续推进，不必每拍单起一段。禁止硬跳切、禁止把某段事件单独拎出来自写自满。\n2. 以目标约 ${lo.toLocaleString()} 字为全章落点，让情节从本章开笔承接点持续推进到章末钩子/收束；正文直接以小说段落呈现，不写任何节拍小标、不做逐拍分段的拼装痕迹。\n3. 达标即自然收束：未达 ${lb.floor.toLocaleString()} 字前不得输出"收束/尾声/结尾/本章完"式结语；一旦全章达到 ${hi.toLocaleString()} 字左右（上限 ${cap.toLocaleString()} 字），应立即自然收束本章并交付，不要为了"再多写点"继续追加内容。`;
}

Object.assign(window, {
  buildChapterOpeningContext,
  buildClosedChapterContext,
  buildChapterBoundaryContext,
  buildLegacyChapterContext,
  buildChapterStateContext,
  buildChapterLengthContext,
});
