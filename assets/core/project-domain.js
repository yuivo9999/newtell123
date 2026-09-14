/** v39 canonical domain: project-domain */
// All previously extracted leaf regions in this business category are registered here.
// Leaf files remain compatibility seams for older tests/tools; runtime ownership belongs to this domain.
import { project_stateModules } from "./project-state.js";
const [m0, m1, m2] = project_stateModules;

import { domainCapability } from "./domain-capabilities.js";

export const domainName = "project-domain";
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
  window.TellMeProjectHistory = m0;
  window.TellMeProjectFyp = m1;
  window.TellMeLegacyDomains = window.TellMeLegacyDomains || {};
  window.TellMeLegacyDomains[domainName] = api;
  return true;
}

// v40 canonical project runtime state.
export const MAX_PROJECTS = 500;
export let lib = { curId: null, items: [] };
export let gglib = [];
const state = {
  mode: 'shortfilm',    // 'shortfilm' 短片 / 'longnovel' 经典长篇小说
  wordRange: null,      // (兼容遗留) 不再作为长篇必填；保留字段避免旧快照破坏
  chapterRange: null,   // (兼容遗留) 同上
  totalWords: null,     // (兼容遗留) 同上
  chapterCount: null,   // 全书章节数量（整数 1-200，生成大纲前唯一必填数字；null=未设）
  idea: '',
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
  openingStrategy: 'auto',
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

export let currentStep = 1;

export const legacyContext = Object.freeze({ MAX_PROJECTS, lib, gglib, state, currentStep });
