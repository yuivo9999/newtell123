/** v39 canonical domain: story-domain */
// All previously extracted leaf regions in this business category are registered here.
// Leaf files remain compatibility seams for older tests/tools; runtime ownership belongs to this domain.
import * as m0 from "./story-contract.js";
import * as m1 from "./teacher-card.js";
import * as m2 from "./story-structure.js";
import * as m3 from "./story-state.js";
import * as m7 from "./novel-runtime.js";
import * as m8 from "./event-ledger.js";
import * as m9 from "./knowledge-contract.js";
import * as m10 from "./state-transition.js";
import * as m11 from "./causality-contract.js";
import * as m12 from "./foreshadowing-contract.js";
import * as m4 from "./subplot-pipeline.js";
import * as m5 from "./outline-pipeline.js";
import * as m6 from "./planner-audit.js";

import { domainCapability } from "./domain-capabilities.js";

export const domainName = "story-domain";
export const modules = Object.freeze([m0,
  m1,
  m2,
  m3,
  m4,
  m5,
  m6,
  m7,
  m8,
  m9,
  m10,
  m11,
  m12]);

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
  window.TellMeStoryContract = m0;
  window.TellMeSubplotPipeline = m4;
  window.TellMeLegacyDomains = window.TellMeLegacyDomains || {};
  window.TellMeLegacyDomains[domainName] = api;
  return true;
}
// v40 legacy constants/state ownership.
export const NM_SURNAME_1 = new Set('赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闵席季麻强贾路娄危江童颜郭梅盛林刁钟徐邱骆高夏蔡田胡凌霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊於惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲邰从鄂索咸籍赖卓蔺屠蒙池乔阴鬱胥能苍双闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍郤璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庾终暨居衡步都耿满弘匡国文寇广禄阙东欧殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查后荆红游竺权逯盖益桓公'.split(''));
export const NM_SURNAME_2 = new Set(['万俟','司马','上官','欧阳','夏侯','诸葛','闻人','东方','赫连','皇甫','尉迟','公羊','澹台','公冶','宗政','濮阳','淳于','单于','太叔','申屠','公孙','仲孙','轩辕','令狐','钟离','宇文','长孙','慕容','鲜于','闾丘','司徒','司空','亓官','司寇','仉督','子车','颛孙','端木','巫马','公西','漆雕','乐正','壤驷','公良','拓跋','夹谷','宰父','谷梁','段干','百里','东郭','南门','呼延','归海','羊舌','微生','梁丘','左丘','东门','西门']);
export const NM_WEB_BLACKLIST = ['林晚','苏晚','顾沉','云深','顾言','江晚','许墨','陆离','沈舟','苏念','林陌'];
export const NM_BANNED_CHARS = ['晚','砚','秋','檐'];   // 姓名中禁止出现这四个汉字（任何位置）
export const NM_BANNED_NAMES = [   // 逐字精确禁用名单（含去空格），命中即判违规
  '林辰','苏辰','顾夜寒','陆泽','墨渊','叶辰','江亦琛','傅景深','沈辞','萧景琰','凌夜','顾言','裴衍','楚慕言','厉承勋','谢珩','温景然','云烬','宋砚','慕云凡',
  '苏清月','晚卿','沈知予','顾晚柠','林晚星','慕晚晴','苏沐瑶','温妤','夏晚璃','楚清鸢','叶轻寒','姜知微','云舒','苏念汐','洛清欢','白若曦','顾绾绾','江晚渔','宋知晚','宁疏影'
];
export const BANLIST_DEFAULT = {
  enabled: true,                            // 总开关（默认开）：清单是否参与注入
  chars: [],                                // 禁用字/词（人名/专名任何位置命中即拒，由校验器联动）；默认沿用 NM_BANNED_CHARS 读取
  names: [],                                // 禁用姓名（逐字精确）；默认沿用 NM_BANNED_NAMES
  phrases: [],                              // 禁用短语/模板词（仅正文注入，控词频）
  rules: [],                                 // 附加规则条目：每条声明生效 AI 范围
  scopeAi: ['chapter']                       // 缺省生效范围（仅正文）；用户可按 AI 扩展大纲/标题/规划师
};
function nmNameRuleViolation(...args){ return domainCapability('narrative-domain', 'nmNameRuleViolation', ...args); }

function normalizeBanList(...args){ return domainCapability('narrative-domain', 'normalizeBanList', ...args); }
function banListRaw(...args){ return domainCapability('narrative-domain', 'banListRaw', ...args); }
function stateBanEnabled(...args){ return domainCapability('narrative-domain', 'stateBanEnabled', ...args); }
function banListChars(...args){ return domainCapability('narrative-domain', 'banListChars', ...args); }
function banListNames(...args){ return domainCapability('narrative-domain', 'banListNames', ...args); }
function banListAiActive(...args){ return domainCapability('narrative-domain', 'banListAiActive', ...args); }
function banListBlockFor(...args){ return domainCapability('narrative-domain', 'banListBlockFor', ...args); }
function banListViolation(...args){ return domainCapability('narrative-domain', 'banListViolation', ...args); }





export const legacyContext = Object.freeze({
  NM_SURNAME_1, NM_SURNAME_2, NM_WEB_BLACKLIST, NM_BANNED_CHARS,
  NM_BANNED_NAMES, BANLIST_DEFAULT,
});
