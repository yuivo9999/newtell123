/** v39 canonical domain: narrative-domain */
// All previously extracted leaf regions in this business category are registered here.
// Leaf files remain compatibility seams for older tests/tools; runtime ownership belongs to this domain.
import { narrative_workspaceModules } from "./narrative-workspace.js";
const [m0, m1, m2] = narrative_workspaceModules;

import { domainCapability } from "./domain-capabilities.js";

export const domainName = "narrative-domain";
export const modules = Object.freeze([m0,
  m1,
  m2]);

export function install(deps = {}) {
  const installed = [];
  for (const mod of modules) {
    if (typeof mod.install === "function") {
      const result = mod.install(deps);
      if (result) installed.push(result);
    }
  }
  const api = Object.freeze(Object.assign({}, ...modules, ...installed));
  const registry = window.TellMeLegacyDomains = window.TellMeLegacyDomains || {};
  registry[domainName] = api;
  return api;
}

export const api = Object.freeze(Object.assign({}, ...modules));

export function exposeLegacyWindows() {
  window.TellMeNarrativeShell = m0;
  window.TellMeNarrativeControls = m1;
  window.TellMeHistoryPanel = m2;
  window.TellMeLegacyDomains = window.TellMeLegacyDomains || {};
  window.TellMeLegacyDomains[domainName] = api;
  return true;
}
// v40 legacy constants/state ownership.
export const LANG_LAYER_SYS = `【语言分层（硬约束）】
可读性自检：逐句自问"读者需要拐弯才能懂吗？"需要即改大白话。`;

function langLayerInjection(...args){ return domainCapability('narrative-domain', 'langLayerInjection', ...args); }

export const NARRATIVE_IRON_HARD = `〔硬约束 · 铁律，不可逾越，冲突时以此为准〕
· 禁止直接叙述人物内心情绪。禁止出现直白内心描写；必须改用动作、微表情、下意识小动作来外显情绪，但外显所用意象必须克制且不重复：同章内同一种微表情/小动作（如 咬牙、攥拳、拧眉、垂眸、绞手）最多出现一次，全书不得反复堆同一套动作当情绪标签。
· 禁止频繁使用网文模板词（倏然、眸光、眼底、凤眸、邪魅一笑、轻嗤）。同章内同类模板词必须最多出现一次，能删必修。
· 对白必须口语化，禁止「端着」的书面腔台词。允许半截话、吐槽、短暂停顿；古风也必须写现代人能读懂的「人话」，例：写「我瞧着这事不妥」，禁止写「吾观此事实为不妥」。
· 人物行为必须有清晰动机，禁止无故推进剧情。禁止过度美化人物：言行必须与境界相符，允许小瑕疵、怯懦、私心、口误。
· 书面语是藏起来的底牌：旁白可按题材适度书面，但对白必须口语；书面语必须只在超大高潮、深情告白、终极顿悟时用来「提咖」，禁止在赶路、打斗、系统提示等快节奏场景滥用。`;

export const NARRATIVE_IRON_SOFT = `〔软约束 · 尽力而为、随题材微调〕
· 可给核心人物绑定 1-2 个专属口头禅，写到自然出现、不刻意。
· 生活化细碎细节（真实毛边）应随情节自然分布：只在能推进氛围/塑造人物时出现，禁止为凑数量而每章硬塞、禁止同一种细节反复复用。
· 语言底色必须随题材稳定贯穿全书，禁止中途漂移：都市/网游/沙雕→贴近生活口语；仙侠/红楼风→适度书面高级感。
· 快节奏场景必须优先大白话短句，禁止绕弯长句，保证读者一目十行不卡壳。`;

export const NARRATIVE_IRON_PLANNING = `【全书叙事铁律·规划层】这是用户对整部小说的长期硬要求，校长、老师、构想规划阶段必须据此设计，不能等正文写完再补救：
· 禁止把“人物内心独白/情绪解释”当作主要叙事推进手段；人物心理应尽量转化为可观察的行动、选择、对话、停顿、反应与后果。
· 禁止以全知上帝视角提前替读者解释答案、幕后真相或配角内心；规划时必须保留合理的信息差与侦探权。
· 禁止设计依赖大段作者广播、百科式背景倾倒才能成立的情节；世界观应能通过角色行动、场景、对话与具体事件自然显露。
· 禁止把网文模板词、固定开场、重复情绪动作当成章节节奏工具；章节开法、冲突触发方式与场景推进应有变化。
· 任何“为了显得有深度而增加心理解释/全知旁白”的设计均视为错误设计；优先设计可被拍出来、演出来、说出来的剧情动作。
· 以上只约束叙事方式与剧情设计，不限制题材、人物、世界观的正常创造，也不剥夺 AI 的创造自由。`;

function globalCreativeConstraintBlock(...args){ return domainCapability('narrative-domain', 'globalCreativeConstraintBlock', ...args); }

function narrativeIronBlock(...args){ return domainCapability('narrative-domain', 'narrativeIronBlock', ...args); }



export const legacyContext = Object.freeze({
  LANG_LAYER_SYS, NARRATIVE_IRON_HARD, NARRATIVE_IRON_SOFT, NARRATIVE_IRON_PLANNING,
});
