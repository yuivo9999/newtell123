/** v39 canonical domain: workspace-domain */
// All previously extracted leaf regions in this business category are registered here.
// Leaf files remain compatibility seams for older tests/tools; runtime ownership belongs to this domain.
import { workspace_assetsModules } from "./workspace-assets.js";
const [m0, m1] = workspace_assetsModules;
import * as m2 from "./workspace-colors.js";
import * as m3 from "./theme-panel.js";
import * as m4 from "./writing-style.js";
import * as m5 from "./workspace-assets-export.js";

import { domainCapability } from "./domain-capabilities.js";

export const domainName = "workspace-domain";
export const modules = Object.freeze([m0,
  m1,
  m2,
  m3,
  m4,
  m5]);

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
  window.TellMeAssetHistory = m0;
  window.TellMeAssetGeneration = m1;
  window.TellMeWorkspaceColors = m2;
  window.TellMeThemePanel = m3;
  window.TellMeLegacyDomains = window.TellMeLegacyDomains || {};
  window.TellMeLegacyDomains[domainName] = window.TellMeLegacyDomains[domainName] || api;
  return true;
}
// v40 legacy constants/state ownership.
export const WRITE_STYLES = [
  { id:'wenyi',  group:'element', cat:'语言质感', name:'文艺/范儿',
    note:'意象化、通感、抒情长句、留白，重氛围轻情节（如张嘉佳、琼瑶式）。',
    tips:['多用意象化与通感修辞','抒情长句铺陈心境，节奏舒缓','点到为止，留白让余味生长'],
    avoid:['情节推进过急','直白说破情绪'],
    check:['氛围优先于情节','有 1-2 处可回味的句子'],
    demo:'散场后影厅的灯一瞬亮起，红绒座椅一排排空下去，像退潮的海。他坐在最后一排，等字幕走完，才把攥了一整场的手，慢慢松开。' },
  { id:'ornate', group:'element', cat:'语言质感', name:'华丽辞藻',
    note:'排比、对仗、四字词、浓墨重彩的画面铺陈。',
    tips:['多用排比、对仗、通感','用四字词与色彩意象铺陈','句子密度与节奏感并重'],
    avoid:['华丽但空洞（只有形容词没有实义）','堆砌到影响阅读'],
    check:['至少 2 处排比/对仗','辞藻服务于画面与情绪'],
    demo:'暮色像一匹被揉皱的绸缎，摊在山脊上，流光一寸寸洇开。' },
  { id:'minimal',group:'element', cat:'语言质感', name:'极简/冷峻',
    note:'短句、白描、不抒情，靠动作和留白传达（海明威式）。',
    tips:['短句、白描、删冗余','情绪用动作与环境暗示','把余味留给读者'],
    avoid:['直白喊出情绪','大段心理独白'],
    check:['情绪段落少于直接描写','无直白情绪标签'],
    demo:'他把刀擦干净，放回架子上。窗外雨没停。' },
  { id:'poetic', group:'element', cat:'语言质感', name:'诗化散文化',
    note:'段落像写诗，长短句错落，节奏淡雅。',
    tips:['段落如诗分行，长短句错落','用淡雅意象营造氛围','节奏舒缓、留白多'],
    avoid:['通篇无叙事推进','堆砌意象失去中心'],
    check:['文字有诗性','节奏淡雅不拖沓'],
    demo:'晨雾里，早班的船离了岸。橹声一下，一下，像在江面上，把昨夜的话一句句抹平。岸上有人立了很久，直到雾把船和人一起收走。' },
  { id:'euro',   group:'element', cat:'语言质感', name:'翻译腔/欧美范',
    note:'长定语从句、欧式标点、西式叙述节奏。',
    tips:['长定语从句与倒装','欧式破折号、分号连接','西式冷静的叙述距离感'],
    avoid:['生硬到读不通','堆砌从句失去节奏'],
    check:['有西式笔调','可读性不牺牲'],
    demo:'她把那份写了很久、又反复修改、最终也没能寄出去的告别信，连同那枚旧贝壳，一起锁进那口棕色的、她从童年起就没再打开过的箱子。' },
  { id:'classic',group:'element', cat:'语言质感', name:'古风文言',
    note:'文言字句、古韵气息，骈散兼用，含蓄蕴藉。',
    tips:['以凝练文言与四六骈句铺陈','动词古雅（顾、掷、敛、挑灯）','对话带古白话韵味，不全程掉书袋'],
    avoid:['生僻掉书袋','古腔盖过剧情可读性'],
    check:['读来有古意不晦涩','用词贴合人物身份'],
    demo:'孤鸿声里，城门缓缓阖上。他负手立于城楼，望那盏渐远的灯，终究没说一句留字。' },
  { id:'folktale',group:'element',cat:'语言质感', name:'市井评书腔',
    note:'说书人腔、话本俚俗、烟火锅气，热闹有人味。',
    tips:['以说书人视角交代，带"话说""且听"的烟火话茬','俚语俗谚与市井行话点人点事','节奏热络、听感活泛'],
    avoid:['盲目复古腔调失真','俚俗过度显油滑'],
    check:['读来像听故事','市井气服务于人物环境'],
    demo:'那王二麻子，是方圆十里出了名的抠门主儿——上他家讨口水喝，都得听他把水瓢掂量三回。' },
  { id:'epic',group:'element', cat:'语言质感', name:'史诗庄重',
    note:'沉着宏阔、碑文式质感，字句有时间的重量。',
    tips:['铺陈用宏大意象（山河、长夜、星海）','句式沉稳、节奏凝重','关键处用克制笔法写大事件'],
    avoid:['空洞的大词堆砌','沉重到拖沓'],
    check:['有厚重史诗感','宏阔处仍有具体细节穿透'],
    demo:'星海横贯头顶，是他的国；脚下冻土延展，也是他的国。一将功成，不过是这漫漫长夜里，那些无名者共用的名字。' },
  { id:'airy',group:'element', cat:'语言质感', name:'轻盈灵动',
    note:'明快清新、短句跳跃、俏皮生趣，读来轻快。',
    tips:['短句快行、节奏轻快','比喻清新俏皮、有少年气','对话灵动带小机锋'],
    avoid:['轻飘无实义','俏皮过度发腻'],
    check:['读来轻快不觉累','明快中不失真情'],
    demo:'她把作业本往桌上一拍，像只炸了毛的小猫，眉毛竖得能挂三斤酱油。' },
  { id:'cutting',group:'element', cat:'语言质感', name:'锋利冷冽',
    note:'犀利讽刺、刀刃句式、冷静不留情面。',
    tips:['短句见锋，一句切中要害','冷静语气说狠话，反差更利','讽刺藏在客观陈述里'],
    avoid:['泼妇式叫骂','为毒而毒失分寸'],
    check:['不语带脏字也伤人','锋芒服务于立场交锋'],
    demo:'他的道歉和他的承诺一样廉价——都只够说出口，不够兑现。' },
  { id:'suspense2',group:'element',cat:'情绪与张力', name:'悬疑压抑',
    note:'名词化、阴冷意象、制造不安感的用词。',
    tips:['制造信息差（读者知道得比角色少或多）','句尾留悬念钩子','环境意象偏暗、紧绷'],
    avoid:['提前泄底','为悬疑而故弄玄虚（逻辑不通）'],
    check:['段落间有悬念牵引','悬念符合逻辑、可回收'],
    demo:'他每天下班都路过那家窗贴磨旧、却从不见人进出的花店。今晚他忍不住推门——门没锁，柜台后的墙上挂着一排照片，每一张，都拍的是他。' },
  { id:'sweet',  group:'element', cat:'情绪与张力', name:'甜宠/温柔',
    note:'细腻心理、绵软对话、小动作描写。',
    tips:['多写微小动作与眼神','对话温和、有生活气','细节传递温度'],
    avoid:['刻意煽情','甜腻到失真'],
    check:['有生活细节体现温度','情感自然不煽情'],
    demo:'她随口说想吃那家老店的糖炒栗子。他没答话，第二天下班拎了一袋回来，隔着纸袋还是热的——袋上，他认认真真写了"趁热"两个字。' },
  { id:'heartwarm',group:'element',cat:'情绪与张力', name:'虐心催泪',
    note:'情感落差、写泪点、克制中爆发。',
    tips:['铺垫情感、制造落差','写泪点时克制不喊叫','在高点克制收束'],
    avoid:['全程强行煽情','情绪喊口号化'],
    check:['有清晰情感高点','泪点自然、铺垫足够'],
    demo:'奶奶把存折交给他，说密码是他的生日。他翻到最后一页才看清存款时间——整整三十年前，正是他出生的那年。那笔钱，她替他攒了一辈子。' },
  { id:'flame',  group:'element', cat:'情绪与张力', name:'热血燃动',
    note:'情绪爆发＋动作节奏带出「燃」，靠张力推进不靠血腥。',
    tips:['动作链密集、节奏如鼓点','短促有力的句式让语气一路走高','以意志力、逆袭转折点燃情绪，不依赖血腥'],
    avoid:['血腥暴力与感官刺激堆砌','喊口号式的假燃','靠场面硬撑而无人物情绪'],
    check:['有清晰的情绪沸点','热血但不越界','燃来自人物选择而非血腥'],
    demo:'一剑破空，少年不退反进，眼底燃起整座江湖的灯。' },
  { id:'zhanshi', group:'element', cat:'情绪与张力', name:'写实战争纪实',
    note:'写实战场实感、群像牺牲、冷峻不煽情的纪实悲壮。',
    tips:['战地细节写实、炮火烟尘与噪声具体','群像式牺牲、点到为止不渲染','冷峻克制、用个别镜头折射整体'],
    avoid:['英雄化、个人光环凌驾群像','血腥刺激堆砌','煽情喊口号'],
    check:['有战场实感与氛围','牺牲有分量不廉价','冷静呼吸、不靠煽动'],
    demo:'担架从泥泞里抬过去，谁也没停。枪声一响，他们又都趴回了开阔地。' },
  { id:'terror', group:'element', cat:'情绪与张力', name:'惊悚寒气',
    note:'具象的感官恐惧、细思极恐、寒意入骨。',
    tips:['用触感/听觉营造阴冷（汗毛、脚步声、指甲刮过）','未知比具象更毒，先露一角','恐怖藏在日常细节里'],
    avoid:['血腥猎奇堆砌','一惊一乍而无逻辑'],
    check:['读完后背发凉','恐怖有来源可解释'],
    demo:'他数完最后一级台阶，楼道灯忽然熄灭。黑暗里，有什么正跟着他的步子——他停，那声音也停；他走，那声音贴在他身后，也走。' },
  { id:'warmth', group:'element', cat:'情绪与张力', name:'温情治愈',
    note:'亲情友情的平淡暖意，柴米油盐里的光。',
    tips:['细写照顾、牵挂、笨拙的表达','暖藏在克制与日常里，不喊口号','一个细节点亮一个场景'],
    avoid:['强行煽情','甜腻到失真'],
    check:['读来心里发烫','暖点有生活依据'],
    demo:'她加班到深夜，桌角放着一碗还冒热气的面，碗边压着张纸：趁热吃。她抬头，对面那位总说"你天天不落屋"的保洁阿姨，正假装在擦她早该擦完的那块玻璃。' },
  { id:'standoff', group:'element', cat:'情绪与张力', name:'对峙张力',
    note:'两方角力、一触即发、空气凝住的压迫。',
    tips:['从动作/物件写紧绷（手按枪柄、茶水渐凉）','对话句句试探、句句留尾','用细节的"没发生"代替爆发'],
    avoid:['一上来就摊牌','张力被废话稀释'],
    check:['全程心悬着','对峙有翻盘可能'],
    demo:'他与她隔桌对坐，谁也没碰那盏茶。窗外蝉鸣陡然一停，空气像被抽干——他咽了口唾沫，那一声响，在寂静里放大如雷。' },
  { id:'melancholy', group:'element', cat:'情绪与张力', name:'苍凉悲怆',
    note:'苍茫宿命、万物有时，厚重的悲怆余味。',
    tips:['用时间与物候的流逝写无力（残碑、西风、老树）','悲在点到为止，不泣不成声','以"无归"收束，留下苍凉'],
    avoid:['滥情哀嚎','为悲而悲脱离事件'],
    check:['悲怆有重量感','克制中透出宿命感'],
    demo:'他蹲在旧碑前，指腹一点点抚过那些名字。风过，草伏下去又立起来，像是替他一排排地，给每个名字鞠了一躬。' },
  { id:'thrill', group:'element', cat:'情绪与张力', name:'惊心动魄',
    note:'千钧一发的生死瞬间、大事件高峰的震动。',
    tips:['倒计时式紧迫（再零点几秒就…）','用瞬间抉择压缩张力','高潮后留一帧静默回响'],
    avoid:['全程紧崩到麻木','为震撼而失真'],
    check:['读时屏住呼吸','高潮有回响'],
    demo:'他按下的不是按钮，是整座城的命。警报倒数最后一声时，他闭上了眼——然后睁开的，是响起的钟声。' },
  { id:'fast',   group:'element', cat:'节奏与网感', name:'爽文/快节奏',
    note:'短段落、强动作链、钩子密集、打脸反转。',
    tips:['短段落、信息密度高','动作链推进、钩子密集','打脸反转干脆'],
    avoid:['长句拖慢节奏','仅爽无逻辑'],
    check:['平均句长偏短','节奏有快慢变化'],
    demo:'评委按下淘汰键。他反手把U盘插进主机。全场以为他在作死——三分钟后大屏弹出那段从未公映的预告片，满座哗然：他才是那部片的原作者。' },
  { id:'webman', group:'element', cat:'节奏与网感', name:'网文口语化',
    note:'"咱""咋""整点"这类方言口语、接地气。',
    tips:['用接地气口语','短句、像说话','贴近生活原声'],
    avoid:['文绉绉书面语','生硬翻译腔'],
    check:['读起来像听人说话','口语自然不违和'],
    demo:'老板娘扯着嗓子喊："小师傅，麻辣烫要辣不？"他头也不抬："辣！整大份，莫放香菜，多整两勺油辣子！"' },
  { id:'roast',  group:'element', cat:'节奏与网感', name:'逗趣吐槽',
    note:'吐槽回环、毒舌、冷幽默（偏"解说式吐槽"）。',
    tips:['冷幽默旁观者视角','一本正经说反话的拆台式吐槽','毒舌但留分寸'],
    avoid:['刻薄伤人的恶意嘲讽','吐槽脱离剧情变成作者乱入'],
    check:['吐槽符合人物视角','无恶意攻击'],
    demo:'他说他要开始健身了。我看了眼他怀里那袋薯片，他说这是低卡的。我点点头：对，低卡到只够长在你最不常用的那块肉上。' },
  { id:'sliceoflife',group:'element',cat:'节奏与网感', name:'慢节奏生活流',
    note:'长句舒缓、日常细节、流水账式的治愈感。',
    tips:['长句舒缓','写日常细节与烟火气','节奏慢、治愈感'],
    avoid:['节奏拖沓无信息','平淡到无趣'],
    check:['细节有生活气息','读来治愈不焦躁'],
    demo:'傍晚他去买馒头，老板娘多塞了他一根油条，说是刚出锅的。他回家掰开馒头夹上油条，就着一碗滚烫的豆浆慢慢吃完，天正好黑下来。' },
  { id:'breathe',group:'element',cat:'节奏与网感', name:'张弛起伏',
    note:'快慢交替、张弛有度，情绪张满后给回气口。',
    tips:['激烈桥段后接舒缓过渡，避免全程崩弦','单章内安排1-2次情绪高低谷','节奏服务情绪，快慢都有目的'],
    avoid:['全程高能致疲劳','拖沓无高潮'],
    check:['快慢有对比','张弛有度不闷'],
    demo:'枪声刚落，只剩瓦砾里忽明忽暗的火——他忽然很想抽一会儿烟。' },
  { id:'staccato',group:'element',cat:'节奏与网感', name:'顿挫短句',
    note:'多短句、多句号、顿挫压迫，紧张感靠断句砸出来。',
    tips:['短句密集、句号敲击节奏','关键动作用破折号或单字短句定格','对白惜字加句读制造压迫'],
    avoid:['长句堆叠泄气','顿挫变碎碎念'],
    check:['读来有敲击感','氛围紧绷不碎'],
    demo:'灯灭了。门动了。枪，上了膛。他一动不动。' },
  { id:'shot',group:'element',cat:'节奏与网感', name:'画面分镜',
    note:'镜头语言进文字：切镜、推拉、特写、蒙太奇，画面感强。',
    tips:['靠镜头视角切换组织画面','大场面用推拉/俯瞰再切特写','关键处停格特写留画面'],
    avoid:['镜头跳切无联接','纯描写拖节奏'],
    check:['画面在脑中成像','切镜服从叙事'],
    demo:'镜头从燃着的舰队拉远，落在滩头一双攥紧步枪的手上——那只手在抖。' },
  { id:'meme',group:'element',cat:'节奏与网感', name:'玩梗共鸣',
    note:'适度当代网络梗、表情包化表达，提升年轻网感共鸣。',
    tips:['梗服务于人物与情绪，不做作者乱入','用"懂的都懂"式轻梗，不用陈年老梗','一处1-2个足够，密必俗'],
    avoid:['老梗陈词','梗盖过剧情'],
    check:['无梗也能读懂','梗符合人物身份'],
    demo:'他盯着那条消息看了三遍，缓缓打出一个"6"。' },
  { id:'oneliner',group:'element',cat:'节奏与网感', name:'爆点金句',
    note:'在名场面制造一句被记住、可转发的经典台词。',
    tips:['关键转折前铺垫，台词落在一击上','简洁有锋芒，可独立成句','金句说透情绪，不只耍帅'],
    avoid:['句句都是金句反成废话','为金句硬造'],
    check:['单拎出来仍有味道','贴合人物口吻'],
    demo:'"他们都叫我无名氏，可我记得每个名字。"' },
  { id:'punchline',group:'element',cat:'节奏与网感', name:'三连递进',
    note:'三点递进式爆点：铺垫→升格→砸点，笑点/爽点有结构。',
    tips:['先铺垫再翻一转二再砸底','第二/第三点必须递进更强','结尾落点干脆不拖'],
    avoid:['三连平铺无递增','砸底拖泥带水'],
    check:['一层比一层响','落点干脆'],
    demo:'第一次叫错，他笑了；第二次叫错，他黑了脸；第三次——他教那人把名字写在自己的拳头里。' },
  { id:'nonlinear',group:'element',cat:'叙事技法', name:'非线性插叙',
    note:'时间跳跃、倒叙插叙、视角切换的笔法。',
    tips:['倒叙/插叙布局时间线','适时视角切换','留悬念、逐步揭开'],
    avoid:['时间线混乱难懂','为炫技而跳跃'],
    check:['读者能看懂时间线','插叙服务悬念与情感'],
    demo:'多年后他整理父亲的遗物，翻出一张褪色的火车票：终点是当年他离家那晚没到的地方。他想起来了——那晚父亲追出去，其实一直追到了站台。' },
  { id:'multipov',group:'element',cat:'叙事技法', name:'多视角群像',
    note:'视角切换带来的文体变化。',
    tips:['多角色视角切换','各视角文体略有差异','用视角差制造信息差'],
    avoid:['视角混乱','众角色声音雷同'],
    check:['视角切换清晰','各视角有辨识度'],
    demo:'她在台上笑得落落大方，转身时长裙扫过。站在二楼的他，看见的却是她攥住裙摆的手，指节白了一瞬——那是她说不出口的那记再见。' },
  { id:'jinyong', group:'element', cat:'叙事技法', name:'金庸武侠风',
    note:'白话为骨、清隽文雅，重侠义风骨与「武即德」，打斗点到即止。',
    tips:['文白相间但以白话为主，清朗不拗口','对白见人物心性，谈笑间立场分明','武学重在招如其人、胜负系于胸襟与抉择'],
    avoid:['通篇文言掉书袋','靠境界/数据堆战力而无人格','招式浮夸只剩热闹'],
    check:['打斗不靠数值堆砌','人物立得住、侠义贯穿','武与德互为表里'],
    demo:'他这一剑不伤人，只想破开迷障问一句——当年的恩怨，可曾有半分真假？' },
  { id:'cosmic', group:'element', cat:'叙事技法', name:'克苏鲁/神秘叙事',
    note:'慢热、不可名状的形容、氛围堆叠而非直接说明。',
    tips:['慢热铺垫、氛围堆叠','描述不可名状的怪诞','不直接说明，留神秘'],
    avoid:['直接点破诡异真相','描写喧宾夺主'],
    check:['氛围压抑、层层递进','神秘感不流失'],
    demo:'山谷里的小旅馆只住了他一个客人。后半夜，楼道尽头传来敲门声，两下，停，一下。他壮胆开门——走廊空无一人，而他插在门内侧的那把反锁钥匙，不知何时，已经被拔掉了。' },
  { id:'fan',    group:'element', cat:'叙事技法', name:'魔幻奇幻史诗',
    note:'魔法奇观、异界冒险、史诗宿命，奇幻世界观从容自洽。',
    tips:['魔法与异界设定自洽、有内在法则','经典奇幻的大格局与使命宿命','冒险推进带史诗感、旅程即成长'],
    avoid:['设定堆砌只炫世界','奇幻沦为无敌光环','格局大却空泛'],
    check:['世界法则自洽','冒险有史诗张力','设定服务人物与使命'],
    demo:'山脚的灯一盏盏亮起，他握着旧魔杖站在岔路出口：预言说的是他，可他只想先救下那个女孩。' },
  { id:'space',  group:'element', cat:'叙事技法', name:'宇宙史诗/星际文明',
    note:'放大星空与文明兴衰的宏大尺度，用异族视角与技术奇观铺陈未知。',
    tips:['把尺度拉到星海与文明兴衰的跨度','用技术奇观、异族视角制造宇宙感与疏离','让高于个人恩怨的文明命题作底'],
    avoid:['沦为地球都市科幻','堆设定与数据、只炫科技','把外太空当猎奇背景而无文明内核'],
    check:['有宇宙尺度与想象力','设定服务于主题','文明命题能立住'],
    demo:'当那艘沉寂了一万年的方舟重新亮灯，瞭望塔上最后一个人类忽然明白：我们从未孤独。' },
  { id:'sus3',   group:'element', cat:'叙事技法', name:'科幻惊悚衍生态',
    note:'高科技下的危险美学，惊颤与悬念延续而非设定堆砌。',
    tips:['以技术奇观放大未知威胁','惊悚源自科技的失控与人性','慢热铺垫、悬念层层加码'],
    avoid:['堆设定与术语','靠突然惊吓混悬念','高科技沦为背景板'],
    check:['威胁具体可感','悬念持续推进','科技与人性的张力兼顾'],
    demo:'培育缸里那头东西睁开眼，第一反应不是逃，而是隔着防爆玻璃，安静地打量他。' },
  { id:'jifeng', group:'element', cat:'台词设计', name:'机锋对白',
    note:'短促交锋、话里有话（谍战、职场戏）。',
    tips:['对话短促交锋','话里有话、潜台词丰富','用停顿与留白施压'],
    avoid:['对白直白无张力','所有角色雷同'],
    check:['对话有子面冲突','潜台词清晰可读'],
    demo:'"你早该走了，为什么还留着？""你这话，是想我走，还是怕我听出你舍不得？"他笑了笑，把她面前那杯凉掉的茶，轻轻往她那边推了推。' },
  { id:'cross',  group:'element', cat:'台词设计', name:'插科打诨',
    note:'荤素不忌的相声式对白。',
    tips:['相声式插科打诨','对话热闹、包袱密集','符合人物身份场合'],
    avoid:['低俗失度','为逗而逗脱离剧情'],
    check:['笑点长在人物身上','不失分寸'],
    demo:'"都说了我这人不记仇。""那你上回怎么三个月没理老王？""怪他记性太好——把我早忘了的事，替他记了三个月的仇。"' },
  { id:'storyteller',group:'element',cat:'台词设计', name:'说书人腔',
    note:'旁白式"话说""且听我道来"的叙述介入。',
    tips:['旁白式"话说/且听我道来"','叙述者在场、带节奏','说书式点评与转场'],
    avoid:['旁白过度打断','腔调陈旧呆板'],
    check:['有说书节奏','旁白服务叙事'],
    demo:'话说这码头上，能叫整条船停下来等一个人的主儿，可不多。可这一位啊，偏偏就肯等；这一等，分别的，便成了一段十里八乡都讲不完的交情。' },
  { id:'moli',   group:'element', cat:'叙事技法', name:'无厘头喜剧',
    note:'荒诞夸张、无逻辑转折、错位自嘲，一本正经地胡说八道。',
    tips:['设置夸张与反差、笑点落在荒诞而非逻辑','一本正经说荒唐话、错位自嘲','梗密度高、节奏快、转场跳脱'],
    avoid:['刻意逻辑闭环','低俗恶搞无节制','为搞笑强加剧情'],
    check:['荒诞但有内在喜感','不流于恶俗','笑点服务于人物与剧情'],
    demo:'他认真地思考了三秒，然后很严肃地告诉我：人不能太有钱，因为容易长寿。' },
  { id:'shenghuo', group:'element', cat:'叙事技法', name:'生活情景喜剧',
    note:'家庭日常＋固定人物性格碰撞，误会化解保留温馨底。',
    tips:['生活场景、小冲突环环相扣','用人物固定性格制造笑点与误会','斗嘴后总会化解、留温情收尾'],
    avoid:['冲突升级成狗血','靠强设定硬造笑点','失去生活质感'],
    check:['笑点来自生活与人物关系','误会化解自然','温暖底色不丢'],
    demo:'妈妈问他为什么又考砸，他一本正经：老师把题出得太多，我一时没来得及焦虑。' },
  { id:'fangyan', group:'element', cat:'台词设计', name:'方言/口音区隔',
    note:'用方言俚语、口癖腔调让每个角色开口有辨识度，对话自带地域与身份。',
    tips:['给关键角色赋予标志性口癖与腔调','用少量方言俚语点出身与城，不整段方言','不同地角色用不同语言习惯拉开落差'],
    avoid:['全程方言、读者难读','所有角色腔调雷同','方言作为噱头却无人格'],
    check:['台词不用看名就能分人','方言服务于人物身份','可读性不因口音牺牲'],
    demo:'“听你这口音，是打潞州来的吧？”掌柜的搁下算盘，“俺们这儿不兴这个。”' },
  { id:'qinghua', group:'element', cat:'台词设计', name:'情话/浪漫对白',
    note:'含蓄走心、带诗意的浪漫对白，于细节处表深情。',
    tips:['话里有心意，点到即止不直白','借日常物象与细节表深情','留白，把余味交给读者'],
    avoid:['油腻直白的土味情话','空喊喜欢无行动落点','为美而美、脱离人物语气'],
    check:['含蓄但不晦涩','情出自细节、真实可感','符合人物身份口吻'],
    demo:'他望着她的眼睛，半天只说了句：“今年冬天的雪，我替你先堆好了。”' },
  { id:'yinghan', group:'element', cat:'台词设计', name:'冷峻短促/硬汉对白',
    note:'惜字如金、动作代答，暗示多于直陈的克制型对白。',
    tips:['句子短、信息密，能用一个字不用一句','用动作与沉默代替解释','威胁与真相藏进潜台词'],
    avoid:['废话连篇','情绪过分外露','为装酷而故作高深'],
    check:['每句对白都有信息量','沉默与动作在替人物说话','克制但不冰冷失温'],
    demo:'“去哪？”“走。”“还回来吗？”他没停步，扔下一句：“看运气。”' }
];
export const WRITE_COMBOS = [
  { id:'comic',     name:'😆 轻喜剧',  desc:'对白机锋层层叠加诙谐拆台，笑点长在人物与话术上，不硬抖包袱。', tags:['jifeng','cross','roast'] },
  { id:'mystery',   name:'🕵️ 悬疑',   desc:'阴冷压抑＋非线性悬念逐步编织，靠信息差与伏笔牵引推理。', tags:['suspense2','nonlinear'] },
  { id:'burn',      name:'🔥 燃向',   desc:'快节奏加码＋强动作链与密集钩子，情绪与力度一路走高。', tags:['fast','flame'] },
  { id:'aesthetic', name:'🌸 唯美',   desc:'文艺意象＋诗化段落，抒情长句与留白共筑氛围。', tags:['wenyi','poetic'] },
  { id:'speed',     name:'⚡ 快节奏爽文', desc:'爽文节奏＋网文口语与机锋对白，段落短、信息密、不拖沓。', tags:['fast','webman','jifeng'] },
  { id:'moli-combo', name:'🤪 无厘头',     desc:'荒诞夸张、反差自嘲，梗密节奏快，笑点落在荒诞不落在逻辑。', tags:['moli','fast','cross'] },
  { id:'family',   name:'😂 欢脱日常',   desc:'家庭生活小冲突环环相扣，误会化解留温情，笑点来自关系和烟火气。', tags:['shenghuo','sliceoflife','cross'] },
  { id:'jianghu',  name:'🏮 江湖喜剧',   desc:'武侠外壳的生活喜剧：江湖群像斗嘴＋无厘头＋机锋，笑点在人情世故。', tags:['shenghuo','moli','jifeng'] },
  { id:'yosheng',  name:'🦖 侏罗纪式科幻', desc:'高科技惊悚＋冒险奇观：未知威胁延续悬念，科技失控处见人性。', tags:['suspense2','fast','sus3'] },
  { id:'gufeng',   name:'🏯 武侠古风',   desc:'金庸风骨＋古风文言，侠义作魂、古韵为衣，打斗点到即止。', tags:['jinyong','classic','flame'] },
  { id:'romance',  name:'💞 甜宠言情',   desc:'恋爱甜宠＋浪漫对白＋轻盈灵动，细节传情、小动作含糖。', tags:['sweet','qinghua','airy'] },
  { id:'epicfan',  name:'🏰 史诗奇幻',   desc:'奇幻冒险＋史诗厚重＋宇宙尺度，大格局世界观从容铺陈。', tags:['fan','epic','space'] },
  { id:'horror',   name:'👻 惊悚恐怖',   desc:'感官恐惧＋悬念压抑＋顿挫短句，寒意入骨、压迫步步收紧。', tags:['terror','suspense2','staccato'] },
  { id:'heal',     name:'💧 治愈温情',   desc:'平淡暖心＋慢节奏生活流＋轻快灵动，柴米油盐里的光。', tags:['warmth','sliceoflife','airy'] },
  { id:'scheme',   name:'⚔️ 权谋对峙',   desc:'一触即发＋锋利冷冽＋机锋对白，句句试探、胜负在话里。', tags:['standoff','cutting','jifeng'] },
];
function availableCombos(...args){ return domainCapability('ai-domain', 'availableCombos', ...args); }
export const AI_CAT_LABEL = { '语言质感':'① 语言质感', '情绪与张力':'② 情绪与张力', '节奏与网感':'③ 节奏与网感', '叙事技法':'④ 叙事技法', '台词设计':'⑤ 台词设计', custom:'⭐ 我的自定义' };
export const CYBER_HOME_GRID = `
  <div class="cyber-home-grid">
    <button class="cyber-card-btn purple" data-step="1"><span class="ico">📖</span><span class="lab">故事</span><span class="sub">输入构想并生成章节</span></button>
    <button class="cyber-card-btn cyan" data-step="2"><span class="ico">🧑</span><span class="lab">角色</span><span class="sub">生成角色定妆提示词</span></button>
    <button class="cyber-card-btn pink" data-step="3"><span class="ico">🏞️</span><span class="lab">场景</span><span class="sub">生成场景即梦提示词</span></button>
    <button class="cyber-card-btn orange" data-step="4"><span class="ico">🎞️</span><span class="lab">分镜</span><span class="sub">生成视频分镜文字</span></button>
  </div>`;

export const WRITE_PRESETS = [
  { id:'clear',          name:'🧹 默认（无风格）', tags:[] },
  { id:'preset-humor',   name:'😆 网感轻喜',  tags:['roast','webman','fast'] },
  { id:'preset-art',     name:'🌸 文艺唯美',  tags:['wenyi','poetic','minimal'] },
  { id:'preset-classic', name:'🏮 古典文学',  tags:['jinyong','ornate','storyteller'] },
  { id:'preset-mystery', name:'🕵️ 悬疑压抑',  tags:['suspense2','jifeng','multipov'] },
  { id:'preset-passion', name:'🔥 热血燃向',  tags:['fast','sliceoflife'] }
];
export const WS_COLOR_SCHEMES = [
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

               // 只读访问
        // 未删除的自定义
























// v28: cohesive writing-style workspace region lives in core/writing-style.js.
function writeStyleState(...args){ return domainCapability('workspace-domain', 'writeStyleState', ...args); }
export const FLOW_NAV = [
  ['风','[data-flow="1"]'],     // 用户写作风格：表达层最高权威
  ['基','[data-flow="2"]'],     // 章节数/全书四七十二十五拍/叙事主体：优化前置决策
  ['构','[data-flow="3"], [data-flow="2"]'],     // 原始构想 + 优化构想：AI建议层
  ['配方','.ai-recipe-card, [data-flow="4"], [data-flow="3"]', 'recipe'],     // 写作配方：把已锁定风格转成可执行规则
  ['节','[data-flow="5"], [data-flow="4"]'],     // 全书节拍成果
  ['典','[data-flow="6"], [data-flow="5"]'],     // 词典达人：建设者
  ['充','[data-flow="7"], [data-flow="6"]'],     // 词典充实：深化者
  ['校','[data-flow="8"], [data-flow="7"]'],     // 校长/学校统筹
  ['词','[data-flow="7.5"], [data-flow="8.5"], .card-theme-glossary, .gs-card'],     // 万物词典：全书共享事实数据库
  ['正','[data-flow="9"], [data-flow="8"]']      // 正文作家 · 章节创作
];function flowNavItems(...args){ return domainCapability('chapter-domain', 'flowNavItems', ...args); }function flowNavHtml(...args){ return domainCapability('chapter-domain', 'flowNavHtml', ...args); }function bindFlowSideNav(...args){ return domainCapability('chapter-domain', 'bindFlowSideNav', ...args); }function flowPlaceholderSec(...args){ return domainCapability('chapter-domain', 'flowPlaceholderSec', ...args); }function openFactCardModal(...args){ return domainCapability('chapter-domain', 'openFactCardModal', ...args); }function openRollingSummaryModal(...args){ return domainCapability('chapter-domain', 'openRollingSummaryModal', ...args); }function consistencyReportHtml(...args){ return domainCapability('chapter-domain', 'consistencyReportHtml', ...args); }function normTimeW(...args){ return domainCapability('chapter-domain', 'normTimeW', ...args); }function openConsistencyCheck(...args){ return domainCapability('chapter-domain', 'openConsistencyCheck', ...args); }function safeCard(...args){ return domainCapability('chapter-domain', 'safeCard', ...args); }function causalityMapHtml(...args){ return domainCapability('chapter-domain', 'causalityMapHtml', ...args); }function relationshipTrajectoryHtml(...args){ return domainCapability('chapter-domain', 'relationshipTrajectoryHtml', ...args); }function seamAuditHtml(...args){ return domainCapability('chapter-domain', 'seamAuditHtml', ...args); }function longNovelHealthHtml(...args){ return domainCapability('chapter-domain', 'longNovelHealthHtml', ...args); }function getDeckStepStatus(...args){ return domainCapability('chapter-domain', 'getDeckStepStatus', ...args); }function openCreationProgressModal(...args){ return domainCapability('chapter-domain', 'openCreationProgressModal', ...args); }function longNovelControlDeckHtml(...args){ return domainCapability('chapter-domain', 'longNovelControlDeckHtml', ...args); }function longNovelMemoryRepoHtml(...args){ return domainCapability('chapter-domain', 'longNovelMemoryRepoHtml', ...args); }function bindLongNovelMemoryRepo(...args){ return domainCapability('chapter-domain', 'bindLongNovelMemoryRepo', ...args); }function bindLongNovelControlDeck(...args){ return domainCapability('chapter-domain', 'bindLongNovelControlDeck', ...args); }function viewStory(...args){ return domainCapability('chapter-domain', 'viewStory', ...args); }function beatStructureCardHtml(...args){ return domainCapability('chapter-domain', 'beatStructureCardHtml', ...args); }function beatStageNames(...args){ return domainCapability('chapter-domain', 'beatStageNames', ...args); }function beatStageDuties(...args){ return domainCapability('chapter-domain', 'beatStageDuties', ...args); }function factCardHtml(...args){ return domainCapability('chapter-domain', 'factCardHtml', ...args); }function bindFactCard(...args){ return domainCapability('chapter-domain', 'bindFactCard', ...args); }function updateFactCardFromChapter(...args){ return domainCapability('chapter-domain', 'updateFactCardFromChapter', ...args); }function rollingSummaryCardHtml(...args){ return domainCapability('chapter-domain', 'rollingSummaryCardHtml', ...args); }function bindRollingSummaryCard(...args){ return domainCapability('chapter-domain', 'bindRollingSummaryCard', ...args); }function qualityReportCardHtml(...args){ return domainCapability('chapter-domain', 'qualityReportCardHtml', ...args); }function bindQualityReportCard(...args){ return domainCapability('chapter-domain', 'bindQualityReportCard', ...args); }function formatRelevantGlossaryHtml(...args){ return domainCapability('chapter-domain', 'formatRelevantGlossaryHtml', ...args); }function fixQueueCardHtml(...args){ return domainCapability('chapter-domain', 'fixQueueCardHtml', ...args); }function bindFixQueueCard(...args){ return domainCapability('chapter-domain', 'bindFixQueueCard', ...args); }function syncOrigIdeaCard(...args){ return domainCapability('chapter-domain', 'syncOrigIdeaCard', ...args); }function origIdeaCard(...args){ return domainCapability('chapter-domain', 'origIdeaCard', ...args); }function bindOrigIdea(...args){ return domainCapability('chapter-domain', 'bindOrigIdea', ...args); }function bindOutlineFold(...args){ return domainCapability('chapter-domain', 'bindOutlineFold', ...args); }function bindLoglineEdit(...args){ return domainCapability('chapter-domain', 'bindLoglineEdit', ...args); }function bindAiRecipe(...args){ return domainCapability('ai-domain', 'bindAiRecipe', ...args); }function aiHistCandHtml(...args){ return domainCapability('ai-domain', 'aiHistCandHtml', ...args); }function openAiHistPanel(...args){ return domainCapability('ai-domain', 'openAiHistPanel', ...args); }function closeAiHistPanel(...args){ return domainCapability('ai-domain', 'closeAiHistPanel', ...args); }function buildRecipeBundle(...args){ return domainCapability('ai-domain', 'buildRecipeBundle', ...args); }function bundleStamp(...args){ return domainCapability('ai-domain', 'bundleStamp', ...args); }function downloadBundleFile(...args){ return domainCapability('ai-domain', 'downloadBundleFile', ...args); }function exportRecipeBundle(...args){ return domainCapability('ai-domain', 'exportRecipeBundle', ...args); }function classifyImportBundle(...args){ return domainCapability('ai-domain', 'classifyImportBundle', ...args); }function importRecipeBundle(...args){ return domainCapability('ai-domain', 'importRecipeBundle', ...args); }function showImportPreview(...args){ return domainCapability('ai-domain', 'showImportPreview', ...args); }function applyBundleSelection(...args){ return domainCapability('ai-domain', 'applyBundleSelection', ...args); }function refreshExSum(...args){ return domainCapability('ai-domain', 'refreshExSum', ...args); }function exportStylePack(...args){ return domainCapability('ai-domain', 'exportStylePack', ...args); }function openExportCenter(...args){ return domainCapability('ai-domain', 'openExportCenter', ...args); }function refreshAiHistBadge(...args){ return domainCapability('ai-domain', 'refreshAiHistBadge', ...args); }
export const ASSET_LABEL = { characters:'角色定妆', scenes:'场景提示词', cover:'封面提示词', storyboard:'分镜' };


export const legacyContext = Object.freeze({
  WRITE_STYLES, WRITE_COMBOS, AI_CAT_LABEL, CYBER_HOME_GRID, WRITE_PRESETS,
  WS_COLOR_SCHEMES, FLOW_NAV, ASSET_LABEL,
});
