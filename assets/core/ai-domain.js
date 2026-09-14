/** v39 canonical domain: ai-domain */
// All previously extracted leaf regions in this business category are registered here.
// Leaf files remain compatibility seams for older tests/tools; runtime ownership belongs to this domain.
import { ai_coreModules } from "./ai-core.js";
const [m0, m1, m2] = ai_coreModules;
import * as m3 from "./ai-infrastructure.js";
import * as m4 from "./idea-polish.js";
import * as m5 from "./ai-recipe.js";
import * as m6 from "./ai-recipe-workspace.js";
import * as m7 from "./narrative-ai.js";

import { domainCapability } from "./domain-capabilities.js";

export const domainName = "ai-domain";
export const modules = Object.freeze([m0,
  m1,
  m2,
  m3,
  m4,
  m5,
  m6,
  m7]);

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
  window.TellMeAIClientFactory = m0.createAIClient;
  window.TellMeLegacyDomains = window.TellMeLegacyDomains || {};
  window.TellMeLegacyDomains[domainName] = window.TellMeLegacyDomains[domainName] || api;
  return true;
}
// v40 legacy constants/state ownership.
export const POLISH_PALETTE = ['#E8A33D','#D64545','#4C6FD5','#3FA36B','#8E5AC8','#2CA6A4'];
export const AI_RECIPE_SYS_PRO = `你是一位资深长篇小说「风格工程师」，同时为「写作配方设计师」。
【核心任务】根据本小说的②优化构想所选方案（含书名+九要素，其中「风格/题材/氛围/主角气质」等字段是设计配方的首要依据）或用户描述，设计 2~6 个可直接落地的组合配方。

【必须输出的 JSON 结构】
[
  {
    "name": "配方名（≤12字）",
    "desc": "一句话点明这套风格适用的题材/氛围",
    "tags": ["现有词库词条 id，2-5 个"],
    "why": "为何这样选（中文引用词条 name，1-2句）",
    "scenario": "适用场景（题材/章节阶段/文风匹配度，1-2句）",
    "gap": null
    // 或 gap（一次可给多条，务必给全所有缺口）：[
    //   {"name":"...","cat":"语言质感","id":"...","note":"...","tips":["..."],"avoid":["..."],"check":["..."],"demo":"...","reasons":"..."},
    //   {"name":"...","cat":"叙事技法","id":"...","note":"...","tips":["..."],"avoid":["..."],"check":["..."],"demo":"...","reasons":"..."}
    // ]
  }
]

【硬性约束】
1. tags 只能使用现有词库 id。现有词库只是参照、不是天花板，更不是必须迁就的对象：即使现有词条看似可用，只要它不是百分之百贴合本小说（例如只覆盖了一半的意涵），就必须设计完全为本小说量身定制的全新词条放入 gap——这是核心职责（大胆创造），不是加分项。
2. gap 数量由真实缺口决定、不机械硬造：现有词库已能完全覆盖本小说所需时，gap 应为 null（0 条、完全不生成新词条是合理且受鼓励的答案，绝不为了"看起来有缺口"而硬凑词条）；只有当确实存在现有词库无法覆盖的缺口维度时，才把它们写成独立的 gap 词条（需几条给几条，把真实缺口一次给全、不要只给 1 个、不要偷懒合并成一条）。
3. gap 为 null 与 gap 非空都是可接受的自主判断，请勿机械填空、勿为数量而造词：gap 非空时每个词条必须五维齐全（note/tips/avoid/check/demo），缺一作废；尽量覆盖不同的风格维度（语言质感/情绪与张力/节奏与网感/叙事技法/台词设计），避免互相同质重复。
4. 不同候选用词尽量不同、风格拉开差异。
5. why / scenario / reasons 里引用词条时必须使用中文 name，禁止出现英文 id。
6. gap 新词条的 cat 只能取以下五类之一：语言质感、情绪与张力、节奏与网感、叙事技法、台词设计。
7. 只输出上述 JSON 数组，不要 markdown 代码块、不要解释。
8. 控制思考深度：先想清楚再作答，不要把大量 token 花在内部推理上；务必把预算留给正文，输出一个完整、可直接 JSON.parse 的数组。`;

function aiRecipeUser(...args){ return domainCapability('ai-domain', 'aiRecipeUser', ...args); }
function aiRecipeSpecNote(...args){ return domainCapability('ai-domain', 'aiRecipeSpecNote', ...args); }
function aiRecipePrompt(...args){ return domainCapability('ai-domain', 'aiRecipePrompt', ...args); }
function aiRecipeCard(...args){ return domainCapability('ai-domain', 'aiRecipeCard', ...args); }
function aiRecipeResultHtml(...args){ return domainCapability('ai-domain', 'aiRecipeResultHtml', ...args); }
export const IDEA_POLISH_SYS_PRO =  `你是一位深谙网文与影视叙事的构想编辑。
【核心任务】把用户输入的粗糙故事构想，优化成一份"字段化简报"——每版都必须先给出一个可直接使用的书名，再按下面固定的 7 个字段逐项列出，保留用户全部原始意图、补全可推导的具体细节，让后续大纲 AI 能逐字段直接引用、零翻译损耗。
【硬性约束】
0. 输入极短（少于 15 字，仅题材/方向词，如"穿越文""重生复仇""校园"）时：切换到「骨架展开模式」——按该题材经典类型惯例，仍按下述 7 字段框架生成一份通用化报，必须在该报最上方标注"（基于题材惯例的通用展开，非用户原话）"，末尾附一行"💡 建议补充：主角身份？核心设定/金手指？结构阶段？风格基调？——补充后再优化效果更好"；不得把骨架表述成用户提供的、不得声称唯一写法。
1. 绝不删减、篡改用户明确表达的内容（题材/元素/风格都须保留），只能在原意上细化；
2. 不替用户新增故事设定（不凭空加角色/势力/冲突/金手指），只补全"可推导的通用细节"；
3. 严格按下述【输出格式】的 8 个字段分点输出：固定标签、固定顺序，每字段占一行"标签：内容"，不要新增其它大标题；首项「书名」必须具体可直接用作最终书名（若你更有把握，可在同一行内用 / 另列 2-3 个备选），且须切中本作的题材与核心冲突/主角钩点、避免《重生之xxx》《xxx系统》《xxx的xxx》这类高频套路名；每字段须给出具体、可执行的实质内容，禁止留空、禁止笼统一句话；"核心词"字段必须收列用户在构想里用引号标出的专名与固定短语（无则写"无"）；
4. ★【写作风格继承与和谐补充（核心红线）】：若上方【用户构想】中提供了【用户已锁定的写作风格】，则生成的所有方案（包括多方案的每个候选）中，「风格」字段必须严格以用户选定的该写作风格为主基准/核心，绝不可擅自替换或背离；在此前提下，每一版方案可在该选定风格的基础上进行该方案专属的【风格补充】（如针对该方案题材特性的视点微调、冷峻/温情细节侧重、节奏快慢点缀等），但补充的风格必须与用户选定的主风格高度和谐、融洽自洽、绝不相冲违和；若用户未指定风格，则按构想基调给出契合风格并给出 2-3 个落地方式；
5. 全报告 180-360 字：除下述 8 个字段外，不要解释、不要引子、不要 markdown 代码块、不要输出 JSON；末尾可附一行以"💡"开头的编辑建议（可选，不计入字段）。
【输出格式】
书名（全书标题：1 个主选即可，可用 / 在同行附 2-3 个备选；≤12 字；须切中题材与核心冲突/主角钩点，避免《重生之xxx》《xxx系统》《xxx的xxx》高频套路名；直接可用作最终书名）：…
题材（时代/类型基调）：…
主角（身份/目标/核心缺陷/钩点）：…
核心冲突（全书的引擎：谁与什么冲突、为何难解）：…
结构（全书阶段与大致比例：若上方【用户构想】后已给出【已选叙事结构】（含全书拍子阶段/章节微拍/章节数/【章节↔全书拍子落位】），全书阶段必须严格贴合该落位给出的"第 N—M 章「阶段名」"划分、与该拍子贯通，勿自创一套不相容的分段；未给出则按一般起承转合给出比例）：…
团队（仅当上方已给出【叙事主体·团队】时必填，否则整行省略：主心骨是谁 + 每位成员的定位/能力担当 + 成员间化学反应与暗流 + "为什么必须组队"即缺一不可的理由）：…
风格（用户选定的主写作风格 + 契合该方案特性的和谐风格补充 + 2-3 个具体落地方式）：…
目标（想带给读者的体验）：…
核心词（必须原样保留入书名/简介/锚点的专名与固定短语，用引号括起）：…
【自由发挥区】各字段措辞与补充方向由你把握：若构想含预设外的核心题材（金手指/感情线/谜题/势力格局/无限流/种田等），可在末尾补一个"情节/设定补充：…"字段（≤2 项）承载同类信息，保持 7 字段在前、补充在后，让化报读起来具体、可执行、贴合原意。`;

export const IDEA_POLISH_SYS = IDEA_POLISH_SYS_PRO;

export const POLISH_MULTI_MODE = `\n\n【本次输出模式：多方案】在上述要求基础上，围绕一个固定的「五个方向候选池」来设计优化构想。五个方向定义如下：
· 稳健商业向——市场验证过的爽点结构，节奏稳、可长期追读；卖点是"稳"且"爽"。
· 高概念反差向——一个强反差的核心设定/金手指撑起全篇；卖点是概念本身的新奇（身份、世界观与常规预期的错位）。
· 情感人物向——以人物情感、羁绊、成长为核心驱动；卖点是"人"与"情"的浓度。
· 悬疑智斗向——靠信息差与严密逻辑链制造"颅内高潮"，读者追更想看主角怎么破局；卖点是烧脑解谜。
· 轻松日常/沙雕向——解压的情绪按摩，靠反差萌与吐槽感让人嘴角上扬；卖点是轻松解压、适合短视频化传播。

★【所有多方案的风格继承与补充要求】：无论 5 个方向方案（稳健商业向/高概念反差向/情感人物向/悬疑智斗向/轻松日常向）各自侧重何种剧情与卖点，所有方案的「风格」字段都必须严格服从并使用用户前面选定的写作风格作为主基石，并在其基础上做不相冲、不违和的风格特色补充（如：主风格为「冷峻硬汉+侦探白描」，稳健向可在其基础上补充「紧凑凌厉的线索切片」，情感向可补充「克制深沉的眼神细节」，轻松向可补充「冷面幽默与黑色反差吐槽」，绝不可直接抛弃主风格去写浮夸甜宠等相悖风格）。

每一版都必须足够具体、可执行，并尽量贴合用户原意。请从这五个方向中，选择与本书题材/构想真正契合的方向各写一版：一般 3~5 版，契合几个就给几版；明显不适配该题材的方向可跳过不给；若确有五个方向都覆盖不了的极契合新方向，允许额外补一版新方向。每个方案用一行分隔符开头：「━━ 方案N：方案名 ━━」，随后是按上述结构的一段条目式构想（必须先以「书名：…」开头给出该版书名，再依次列其余字段），并在方案末尾加一行「推荐理由：…（这个方案给谁、适合什么口味；若该方向偏小众或门槛高——如悬疑智斗极费脑、轻松沙雕易同质——请如实点明其取舍）」。方案之间方向要明显拉开，各版书名务必各不相同、切中该方向；仍不要输出 JSON、不要 markdown 代码块。`;



export let aiRp = null;
export let aiLog = [];

export const legacyContext = Object.freeze({
  POLISH_PALETTE, AI_RECIPE_SYS_PRO, IDEA_POLISH_SYS_PRO, IDEA_POLISH_SYS, POLISH_MULTI_MODE,
  aiRp, aiLog,
});
