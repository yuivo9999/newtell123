/**
 * Chapter-context assembly helpers.
 *
 * Context7/MDN-guided ESM boundary: these helpers are kept independent from
 * DOM rendering and exported as named functions. Legacy state-dependent values
 * are accessed through a narrow window runtime bridge during migration.
 */
const runtimeFn = (name) => (...args) => {
  const fn = window[name];
  if (typeof fn !== 'function') throw new Error(`[chapter-context] runtime function unavailable: ${name}`);
  return fn(...args);
};

const state = new Proxy({}, {
  get(_target, key) { return window.state?.[key]; },
});

const extractSection = runtimeFn('extractSection');
const scStyleBrief = runtimeFn('scStyleBrief');

export function budgetChapterContext(parts, maxChars){
  const total = () => parts.join('\n\n').length;
  if(total() <= maxChars) return { parts, overflow: false };
  const idx = (label) => parts.findIndex(s => s.startsWith(label));
  const l4 = idx('【L4 前文滚动摘要】');
  if(l4 >= 0){
    const head = '【L4 前文滚动摘要】\n';
    const body = parts[l4].slice(head.length).trim();
    parts[l4] = head + body.slice(0, 200) + (body.length > 200 ? '…' : '');
  }
  if(total() <= maxChars) return { parts, overflow: false };
  const ref = idx('【小说简介】');
  if(ref >= 0){
    parts[ref] = parts[ref].slice(0, 260) + (parts[ref].length > 260 ? '…' : '');
  }
  if(total() <= maxChars) return { parts, overflow: false };
  const bridge = idx('【衔接事实】');
  if(bridge >= 0){
    const head = '【衔接事实】';
    const body = parts[bridge].slice(head.length).trim();
    parts[bridge] = head + body.slice(0, 160) + (body.length > 160 ? '…' : '');
  }
  if(total() <= maxChars) return { parts, overflow: false };
  const l1 = idx('【L1 本章节拍');
  if(l1 >= 0){
    const lines = parts[l1].split('\n');
    parts[l1] = lines.map((line, i) => {
      if(i <= 2) return line;
      if(line.startsWith(' ')) return line;
      return line.slice(0, Math.min(line.length, 120)) + (line.length > 120 ? '…' : '');
    }).join('\n');
  }
  return { parts, overflow: total() > maxChars };
}

export function chapterTailExcerpt(i, maxChars=420){
  const prev = i > 0 && state.chapters?.[i-1] ? String(state.chapters[i-1].content || '') : '';
  const t = (prev || '').trim();
  if(!t) return '';
  if(t.length <= maxChars) return t;
  const paras = t.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  const out = []; let acc = 0;
  for(let k=paras.length-1; k>=0 && acc < maxChars; k--){ out.unshift(paras[k]); acc += paras[k].length + 2; }
  let s = out.join('\n\n');
  if(s.length > maxChars){
    const head = out[0];
    const seq = head.match(/[^。！？…]*[。！？…][”"」』]?/g) || [];
    const kept = []; let a2 = 0;
    for(let j=seq.length-1; j>=0 && a2 < maxChars; j--){ kept.unshift(seq[j]); a2 += seq[j].length; }
    if(kept.length){ out[0] = kept.join(''); s = out.join('\n\n'); }
    else s = head.slice(0, maxChars);
  }
  return s;
}

export function principalStyleExecutionExcerpt(){
  const pr = (state.school && state.school.principal) || {};
  if(pr.raw){
    const raw = String(pr.raw);
    const a = raw.indexOf('## 风格融合总纲');
    const b = raw.indexOf('## 可执行纪律', a >= 0 ? a : 0);
    if(a >= 0){
      const end = b > a ? b : Math.min(raw.length, a + 9000);
      const sec = raw.slice(a, end).trim();
      if(sec) return sec;
    }
  }
  return '（校长尚未产出新版风格施工层；请严格继承用户当前已选写作风格，不自行引入优化构想风格。）';
}

export function principalRulesExcerpt(){
  const pr = (state.school && state.school.principal) || {};
  if(pr.raw){
    const sec = extractSection(pr.raw, '全校写作守则', '各组组级框架') || extractSection(pr.raw, '全校写作守则', '全书章节标题总表') || extractSection(pr.raw, '全校写作守则', '逐章教案');
    if(sec) return sec.trim();
  }
  return scStyleBrief();
}

export function buildDynamicProtagonistLedger(i){
  if(i <= 0) return '';
  const o = state.outline || {};
  const digests = Array.isArray(o._chapterDigests) ? o._chapterDigests : [];
  const prevDigest = digests[i-1] && digests[i-1].text ? digests[i-1].text : '';
  const prevChapter = state.chapters && state.chapters[i-1] ? state.chapters[i-1] : null;
  const prevTitle = prevChapter && prevChapter.title ? `第 ${i} 章《${prevChapter.title}》` : `第 ${i} 章`;
  const protagonist = (o.navBeacon && o.navBeacon.protagonist) ? String(o.navBeacon.protagonist).split(/[，,：:（(]/)[0].trim() : '主角';
  const lines = [];
  lines.push(`【动态主角状态与悬念账本（承自 ${prevTitle} 完结时的物理基准）】`);
  lines.push(`- 核心角色锚点：${protagonist}`);
  if(prevDigest) lines.push(`- 上一章剧情与状态结算：${prevDigest}`);
  lines.push(`- 物理与心理定格硬性纪律：上一章正文最末段落定格的具体地点、主角身受之伤势/生理状态、当前正在交涉的核心人物与最后一句话、持有的重要道具/线索，属于不可擅改的既成事实。本章第一段须在此物理基准上推进，严禁发生伤势突愈、道具凭空消失或死人复活等逻辑断层！`);
  return lines.join('\n');
}

export function principalCausalityExcerpt(){
  const pr = (state.school && state.school.principal) || {};
  if(pr.raw){
    const raw = String(pr.raw);
    const head = '## 因果闭环总纲';
    const a = raw.indexOf(head);
    if(a >= 0){
      const b = raw.indexOf('## 可执行纪律', a + head.length);
      const end = b > a ? b : Math.min(raw.length, a + 9000);
      const sec = raw.slice(a, end).trim();
      if(sec) return sec;
    }
  }
  return '（校长尚未产出新版因果闭环层；正文仍必须执行事件可达性硬规则：重大事件不得凭空发生，必须有前置条件、触发依据、人物行动路径与结果来源。）';
}

Object.assign(window, {
  budgetChapterContext,
  chapterTailExcerpt,
  principalStyleExecutionExcerpt,
  principalRulesExcerpt,
  buildDynamicProtagonistLedger,
  principalCausalityExcerpt,
});
