/** v39 canonical domain: dictionary-domain */
// All previously extracted leaf regions in this business category are registered here.
// Leaf files remain compatibility seams for older tests/tools; runtime ownership belongs to this domain.
import { dict_masterModules } from "./dict-master.js";
const [m0, m2, m3] = dict_masterModules;
import { dict_enrichModules } from "./dict-enrich.js";
const [m4, m5] = dict_enrichModules;
import * as m1 from "./glossary-pipeline.js";
import * as m6 from "./glossary-workspace.js";

import { domainCapability } from "./domain-capabilities.js";

export const domainName = "dictionary-domain";
export const modules = Object.freeze([m0, m1, m2, m3, m4, m5, m6]);

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
  window.TellMeLegacyDomains = window.TellMeLegacyDomains || {};
  window.TellMeLegacyDomains[domainName] = window.TellMeLegacyDomains[domainName] || api;
  return true;
}
// v40 legacy constants/state ownership.
export const DICTMASTER_SYS = `你是一位资深全题材长篇「词典达人」（全局设定架构师）。你将拿到 ②优化构想所选方案的完整原文（含 书名 + 九要素：题材/主角/核心冲突/世界观/对手/动机/风格/结构/核心词）作为唯一蓝本，把它深化并架构为一份可直接支撑全书写作的高质量「万物设定词典」。
本工具支持全品类题材（都市、科幻、悬疑、历史、奇幻、玄幻、无限、末世、言情等），需严格根据蓝本题材适配对应的话语体系与设定风格。

【职责边界 / 硬性约束】
1. 【蓝本基准】：蓝本（②所选方案）里已出现的人物/地名/专名，必须全部收录且**绝对不可改动**：名称逐字原样、设定只能按蓝本深化，不许改角色身份/立场/核心矛盾、不许删主角。
2. 【严格负向排除（防泛化污染）】：
   - **严禁收录无意义的通用日常泛词**（例如：“街道”、“大门”、“桌椅”、“普通汽车”、“普通手机”、“傍晚”、“茶水”等通用泛指，绝不能当成专名或地名写入词典）。
   - 专名（propernouns）只收录具有**专属性、辨识度、不可替代性**的核心设定，如：核心科技装备/特定武器/特殊道具/核心组织规约/关键体系机制等（依小说题材自洽）；
   - 地名（places）只收录故事发生的核心地标、关键建筑、机构场所、特殊险境、城市要地等，禁止录入通用场所泛指。
3. 【设定四大核心类别】：
   ① 核心人物与重要配角（characters）：姓名、身份定位、年龄、性别、外貌特征、爱好癖好、口头禅、关系摘要、性格特征（9维必填满）；
   ② 核心专属装备/道具/科技/物品/体系（propernouns）：名称、品阶/来源/机制、功能特效、使用代价/生效限制（在 note 中注明）；
   ③ 独特地理/场所/势力/建筑（places）：名称、类型、势力归属/地理位置、关键地标/氛围（在 note 中注明）；
   ④ 世界观运转规则系统（worldRules）：规则类别、适用对象/范围、具体运转规则、违反后果/代价。
4. 【关联表精确性】：
   - relationshipTable（人物关系表）：只写 人物↔人物 之间的血缘/身份/恩怨/利益纠葛；
   - placeContacts（地名关联表）：只写 地名↔地名 之间的相邻/隶属/交通通路/势力划分；
   - properContacts（专名关联表）：只写 专名↔专名 之间的克制/配套/渊源/等级序列；
   - 严禁留空端名、严禁将实体的属性/功能/子项当作另一端凑数，宁缺毋滥。

【输出格式】严格只输出如下 JSON（不要解释、不要 markdown 代码块）：
{"characters":[{"name":"","identity":"","age":"","gender":"","appearance":"","hobby":"","relation":"","trait":"","catchphrase":"口头禅"}],"relationshipTable":[{"a":"名字","b":"名字","relation":"关系","note":"一句话"}],"places":[{"name":"","type":"","note":""}],"placeContacts":[{"from":"地名","to":"地名","relation":"联系","note":""}],"propernouns":[{"name":"","note":""}],"properContacts":[{"from":"专名","to":"专名","relation":"联系","note":""}],"worldRules":[{"cat":"规则类别","scope":"适用对象/范围","rule":"具体规则（写清运作法则与违反后果/代价）"}],"summary":"一句话词典架构亮点"}
【要点】
- characters 优先把人物设计完整，但不是为了填表而发明口头禅/爱好：identity、trait 应尽量明确；age/gender/appearance/hobby/relation/catchphrase 若对人物没有实际价值可写“未知/无”。relation 简明扼要≤20字。
- places 必须含 type（类型）+ note（说明）。
- propernouns 必须含 note（功能与限制）。
- worldRules 必须含 cat（类别）+ scope（范围）+ rule（规则与代价），规则必须贴合题材社会性质，杜绝口号，可执行可校验。`;
async function genDictMaster(btn){ return domainCapability('dictionary-domain', 'genDictMaster', ...arguments); }
function dictMasterBlockHtml(){ return domainCapability('dictionary-domain', 'dictMasterBlockHtml', ...arguments); }function openDictMasterHistoryPanel(...args){ return domainCapability('dictionary-domain', 'openDictMasterHistoryPanel', ...args); }function bindDictMaster(...args){ return domainCapability('dictionary-domain', 'bindDictMaster', ...args); }function cleanEntityName(...args){ return domainCapability('dictionary-domain', 'cleanEntityName', ...args); }

export const DICT_ENRICH_SYS = `你是一位资深全题材小说「词典充实师」（设定细化与描写工坊专家）。你将拿到两份核心素材：
1. 【第一部分：优化构想·所选方案完整内容】（全书核心故事题材、背景与设定蓝本）；
2. 【第二部分：词典达人所生成的所有内容】（现有人物9维全貌、人物关系表、地名及关联、专名及关联、世界观运转规则等全部设定，作为只读基准）。

【核心使命】
本工具支持全品类题材小说（包括但不限于：都市职场、科幻未来、悬疑惊悚、历史军事、奇幻异世、仙侠修真、末世无限、现代言情等）。
你的任务是：**严格紧扣所选构想的题材类型与世界观基调，在现有词典骨架之上，主动提炼并增补更细腻生动的感官描写特征、场景氛围标签、使用禁忌/代价 以及 各行各业的鲜活环境氛围龙套**——为后续正文写作提供扎实具象的细节抓手，杜绝空洞干瘪与概念化堆砌。

【四大产出分档与标准】
1. 核心人物扩建：当主线、核心阵营或人物关系网络存在真实缺口时，可主动创造主要人物/关键配角，数量不设硬指标，重点说明其存在价值、动机、关系与可持续特征。
2. 次要配角扩建：可主动创造亲友、同事、下属、盟友、知情人、对手爪牙、行业人物等，数量不设硬指标，不为凑数造人。
3. 关键地名/专名扩建：主动补足未来剧情可能需要的关键场景、道具、装备、技术、组织、制度、概念等，优先补足能支撑剧情、人物生活和世界运转的材料。
4. 生活气路人/氛围龙套：可建立丰富的生活素材池，但不设置“每章必须多少人”的数量KPI；只有能增强时代感、职业感、地域感或场景真实度时才值得收录。
5. **创作事实原则**：本阶段产生并正式并入词典的条目，就是已批准的小说创作事实。不是用户原文≠不可信；可以大胆想象，但必须自洽，且不得偷偷改写已定稿实体。

【职责边界 / 硬性约束】
1. 【题材与世界观深度契合】：必须严格遵从【优化构想】确立的时代背景、技术/魔法水平及社会形态，用词与语感必须完全契合该题材（如科幻小说体现科技感，现代题材体现当代生活气息，历史/幻想小说体现时代沉浸感）。
2. 【只读基准】：现有词典已有的人/地/专名不得改动，不得重复新增同名实体。
3. 【专属性约束】：专名与地名严禁收录日常通用泛词（如“汽车/街道/普通手机/普通茶杯”等无特异性的通用泛指），必须具有该故事背景下的专属性或特定命名。
4. 【极其重要·名称格式约束】：名字字段仅填写纯粹的人名/地名/专名（如纯实体名，不得在名称中夹带括号或简介说明文字），所有身份、关系、外貌、说明等必须严格写在后续对应字段中。

【输出格式】严格只输出如下纯文本（不要 JSON、不要解释、不要 markdown 代码块）：
【新增主要人物】
主要人物｜名｜身份：…；关系：…；外貌：…；性格：…；口头禅：…；描写标签：…
【新增次要配角】
次要配角｜名｜身份：…；关系：…；外貌：…；性格：…；口头禅：…；描写标签：…
【新增地名】
地名｜名｜类型：…；氛围特征：…；说明：…；描写标签：…
【新增专名】
专名｜名｜类型：…；功能特效：…；使用禁忌：…；说明：…；描写标签：…
【新增路人/龙套】
路人｜名｜身份：…；登场：…；台词：…；描写标签：…
每条一行，用 '｜'（中文竖线）分隔。`;
function buildDictEnrichUser(){ return domainCapability('dictionary-domain', 'buildDictEnrichUser', ...arguments); }function parseDictEnrichText(...args){ return domainCapability('dictionary-domain', 'parseDictEnrichText', ...args); }function mergeDictEnrich(...args){ return domainCapability('dictionary-domain', 'mergeDictEnrich', ...args); }

export const DICT_HARVEST_SYS = `你是一位长篇小说的「正文收编师」。正文创作结束后，系统会把「反复出现/有戏份、但尚未录入词典」的新实体候选名单及其在正文中的出现片段交给你。你的职责是判定哪些应正式收编进「万物词典」，哪些只是已有角色的别名、哪些只是一次性路人。
【判定流程】
1. 对每个候选先做【别名吸附】：它是否只是已有词典人物的 缩略 / 字号 / 绰号 / 异写？
   - 是 → 不新增、不改名，该候选直接跳过，并在结果末尾附一行【已吸附】说明它是哪个已有名的别名。
2. 确属全新角色，且「反复出现或有戏份、值得被词典收编」：按词典充实的格式输出其设定，收编进对应类别（人物/地名/专名/路人）。
3. 只是一次性路人/出场单薄没戏份：不输出（不入典）。
【硬性约束】
· 万物词典已收录的名一律不得重复新增同名，不得改动既有词条。
· 判定必须基于给出的正文片段证据，禁止臆造设定；身份/关系等要点要能与片段对得上。
【输出格式】每行一个实体，用「类别｜名称｜字段：值；字段：值」格式、末尾加分号。类别只用 人物/地名/专名/路人；人物最好给 身份/关系 等可入典要点（正文片段里有的才写，没有则不编）。若本批决定不入任何实体，只输出一行【收编】无新增候选。`;function _parsedCastList(...args){ return domainCapability('dictionary-domain', '_parsedCastList', ...args); }function harvestCandidates(...args){ return domainCapability('dictionary-domain', 'harvestCandidates', ...args); }function _evidWindow(...args){ return domainCapability('dictionary-domain', '_evidWindow', ...args); }function buildDictHarvestUser(...args){ return domainCapability('dictionary-domain', 'buildDictHarvestUser', ...args); }function dictHarvestGate(...args){ return domainCapability('dictionary-domain', 'dictHarvestGate', ...args); }function genDictHarvest(...args){ return domainCapability('dictionary-domain', 'genDictHarvest', ...args); }function mergeDictHarvest(...args){ return domainCapability('dictionary-domain', 'mergeDictHarvest', ...args); }function dictEnrichGate(...args){ return domainCapability('dictionary-domain', 'dictEnrichGate', ...args); }function genDictEnrich(...args){ return domainCapability('dictionary-domain', 'genDictEnrich', ...args); }function buildDictEnrichSummary(...args){ return domainCapability('dictionary-domain', 'buildDictEnrichSummary', ...args); }function dictEnrichBlockHtml(...args){ return domainCapability('dictionary-domain', 'dictEnrichBlockHtml', ...args); }function bindDictEnrich(...args){ return domainCapability('dictionary-domain', 'bindDictEnrich', ...args); }function closeChapterSummaryPanel(...args){ return domainCapability('dictionary-domain', 'closeChapterSummaryPanel', ...args); }function densityCheck(...args){ return domainCapability('chapter-domain', 'densityCheck', ...args); }function renderChapterSummaryBody(...args){ return domainCapability('chapter-domain', 'renderChapterSummaryBody', ...args); }function chSumGenerate(...args){ return domainCapability('chapter-domain', 'chSumGenerate', ...args); }function openChapterSummaryPanel(...args){ return domainCapability('chapter-domain', 'openChapterSummaryPanel', ...args); }function adherenceHint(...args){ return domainCapability('chapter-domain', 'adherenceHint', ...args); }
const { stripSegmentMarkers, splitChapterOutput, splitChapterCastout } = window.TellMeChapterOutput || {};
export const USER_PRIO_BILL = '\n\n【优先级契约（按维度裁决，禁止把不同维度混成一个选择题）】\n1. 表达层最高权威：用户已选写作风格。它决定怎么写（叙事、对白、语言质感、节奏表现、情绪表达、幽默/悬疑/治愈等表现机制），不得被优化构想或正文模型重新改写。\n2. 剧情层最高权威：本章老师教案。它决定写什么（事件、顺序、转折、出场、时间、承接与收束）；写作风格不得删改教案事件。\n3. 全书一致性权威：万物词典 + 上一章已落地事实 + 校长/老师已裁决的连续性规则。\n4. 人工干预只能在不破坏以上三层的前提下补充；若人工干预与用户风格冲突，保留用户风格；若与老师教案冲突，不得擅改教案核心事件。\n5. 优化构想只是创意建议：仅当校长已判断其与用户风格兼容时才执行；不得在正文阶段自行把优化构想升级成新的风格权威。\n设定词典中有台词/有戏份/反复出现的重要人地专名一致性为不可逾越红线；仅作氛围的临时路人/小地名/小专名（见正文【临时闲人】段）不属红线，可现场点缀、不入词典；上一章全文（如有）为承接类事实的最高权威，任何要求不得使其另起炉灶。';


const esc = (...args) => (window.TellMeLegacyFoundation?.esc ? window.TellMeLegacyFoundation.esc(...args) : (args[0] != null ? String(args[0]) : ''));
export const GVT_CFG = {
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
export let gsUndoStack = [];
export const GS_UNDO_MAX = 10;

export const legacyContext = Object.freeze({
  DICTMASTER_SYS, DICT_ENRICH_SYS, DICT_HARVEST_SYS, USER_PRIO_BILL,
  GVT_CFG, gsUndoStack, GS_UNDO_MAX,
});
