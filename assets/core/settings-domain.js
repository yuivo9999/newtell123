/** v39 canonical domain: settings-domain */
// All previously extracted leaf regions in this business category are registered here.
// Leaf files remain compatibility seams for older tests/tools; runtime ownership belongs to this domain.
import { settings_coreModules } from "./settings-core.js";
const [m0, m2, m3, m4] = settings_coreModules;
import * as m1 from "./task-models.js";

import { domainCapability } from "./domain-capabilities.js";

export const domainName = "settings-domain";
export const modules = Object.freeze([m0, m1, m2, m3, m4]);

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
  window.TellMeSettingsCore = m0;
  window.TellMeTaskModels = m1;
  window.TellMeGroupEditor = m2;
  window.TellMeSettingsSaveTest = m3;
  window.TellMeGroups = m4;
  if (typeof window.renderGroupsList !== "function" && m4 && typeof m4.renderGroupsList === "function") {
    window.renderGroupsList = m4.renderGroupsList;
  }
  window.TellMeLegacyDomains = window.TellMeLegacyDomains || {};
  window.TellMeLegacyDomains[domainName] = window.TellMeLegacyDomains[domainName] || api;
  return true;
}
// v40 legacy constants/state ownership.
export const TM_GROUPS = [
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

export const TM_TEMP = {
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


export const legacyContext = Object.freeze({ TM_GROUPS, TM_TEMP });
