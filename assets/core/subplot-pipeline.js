// Subplot progression AI pipeline. AI protocol + normalization/merge stay here; UI orchestration remains in app-legacy.js.

const SUB_STATUSES = ['进行中','搁置','已收束'];

const SUBPROGRESS_UPDATE_SYS_LEGACY = `你是长篇小说副线追踪助手。给定【本章正文】与【现有副线进度】，判断本章推进、新建或收束了哪些副线。
请严格只输出如下 JSON（不要解释、不要 markdown 代码块）：
{"subplots":[{"name":"副线名","status":"进行中|搁置|已收束","question":"该副线提出的核心问题","arc":{"from":"起点状态","to":"当前状态"},"pivot":"对主线的影响(有才填，没有就别写)","note":"本章进展一句话，只写本章新增，不重复旧进度，≤60字"}]}
规则：
1. 只输出本章【确有推进或新建】的副线；本章未触碰的一律不出现。
2. 已存在副线按 name 同名合并；仅当本章确实引出一条新的跨章叙事线索（有延续悬念、将多次出现）才允许新建，一次性事件/路人戏不建。
3. status 只能是三态之一：进行中 / 搁置 / 已收束，禁止其它值。
4. 首次新建某副线时尽量给出 question（该线索提出的核心问题）与 arc.from；一时给不出也要输出该副线，question 留空字符串（程序会标记"待补充"），禁止为凑数硬编问题。
5. 推进时若人物状态发生跃迁，更新 arc.to；若本章该副线与主线交织并影响主线，补 pivot（确有关联才填，绝不硬造）。
6. 当该副线的核心问题已被回答（哪怕开放式结局，如没抓到凶手但回答了追查动机）→ status 改「已收束」，note 说明它以何种方式完成闭合（回应问题 / 状态到位）。
7. 已收束的副线本章又明显复活推进 → 显式改回「进行中」再追加。
8. 与既有进度冲突时以既有进度为准，不得改写或推翻旧进度；note 只记录本章新增内容。
9. 本章无任何副线推进时输出 {"subplots":[]}。`;

const SUBPROGRESS_UPDATE_SYS_PRO = `你是一位资深长篇小说「副线审计师」。
【核心任务】阅读本章正文，判断本章推进、新建或收束了哪些副线，并以严格的 JSON 输出。

【必须输出的 JSON 结构】
{"subplots":[{"name":"副线名","status":"进行中|搁置|已收束","question":"该副线提出的核心问题（必填，≤60字）","arc":{"from":"起点状态","to":"当前状态"},"pivot":"对主线的影响（有才填，没有就空字符串）","note":"本章进展一句话，只写本章新增，≤60字"}]}

【硬性约束】
1. 只输出本章确有推进或新建的副线；未触碰的一律不出现。
2. status 只能是：进行中 / 搁置 / 已收束。其他值视为无效。
3. 首次新建某副线时尽量给出 question；给不出时输出空字符串并保留该副线，禁止硬编问题。
4. arc.from / arc.to 必须能体现状态跃迁；没有变化时两者可相同。
5. pivot 只在确实影响主线时才填；没有就空字符串，禁止硬造。
6. 与既有进度冲突时以既有进度为准，不得改写旧进度。
7. 本章无任何副线推进时输出 {"subplots":[]}。
8. 只输出 JSON，不要 markdown 代码块、不要解释。`;

const SUBPROGRESS_UPDATE_SYS = SUBPROGRESS_UPDATE_SYS_PRO;

function validateSubplotOutput(j){
  if(!j || !Array.isArray(j.subplots)) return {ok:false, code:'NOT_ARRAY'};
  for(const s of j.subplots){
    if(!['进行中','搁置','已收束'].includes(s.status)) return {ok:false, code:'BAD_STATUS'};
    if(!String(s.name||'').trim()) return {ok:false, code:'MISSING_NAME'};
    if(!String(s.question||'').trim()) return {ok:false, code:'MISSING_QUESTION'};
  }
  return {ok:true};
}








export { SUBPROGRESS_UPDATE_SYS, SUB_STATUSES, validateSubplotOutput };

export async function extractSubplotUpdates(chIdx, content, deps = {}) {
  const { buildAIPrompt, unwrapAIResult, callDeepSeek, parseJson, clampMaxTokens, resolveActiveSpec } = deps;
  const body = String(content||'').trim();
  if(!body) return {subplots:[]};
  const user = buildAIPrompt('subplot', { idx: chIdx });
  const txt = unwrapAIResult(await callDeepSeek(SUBPROGRESS_UPDATE_SYS, user, {maxTokens: clampMaxTokens('json'), temperature: resolveActiveSpec().subplotTemp, topP: 0.5, taskKey:'subplot'}));
  const j = parseJson(txt) || {};
  const _subRep = validateSubplotOutput(j);
  if(!_subRep.ok) console.warn('[副线] 输出校验未通过（不阻断）：', _subRep.code, _subRep.details||'');
  const norm = (Array.isArray(j.subplots)?j.subplots:[]).map(s=>{
    const name = String(s&&s.name||'').trim(); if(!name) return null;
    return {
      name,
      status: SUB_STATUSES.includes(s.status) ? s.status : '进行中',
      question: String(s.question||'').trim(),
      arc: { from: String((s.arc&&s.arc.from)||'').trim(), to: String((s.arc&&s.arc.to)||'').trim() },
      pivot: String(s.pivot||'').trim(),
      note: String(s.note||'').trim()
    };
  }).filter(Boolean);
  return { subplots: norm };
}

export function mergeSubplotUpdates(ext, chIdx, deps = {}) {
  const { state } = deps;
  const o = state.outline; if(!o) return {total:0,newCount:0,noQuestionCount:0};
  if(!o.glossary) o.glossary = {characters:[], places:[], propernouns:[]};
  const gl = o.glossary;
  if(!Array.isArray(gl.subplots)) gl.subplots = [];
  const cur = gl.subplots;
  let total=0, newCount=0, noQuestionCount=0;
  (ext&&ext.subplots||[]).forEach(s=>{
    const name = String(s.name||'').trim(); if(!name) return;
    const exist = cur.find(x=> String(x.name||'').trim() === name);
    if(!exist){
      if(!String(s.question||'').trim()){ s.question = '待补充：该副线的核心问题尚未明确'; noQuestionCount++; }
      const entry = { name, status: s.status || '进行中', question: String(s.question).trim(), arc: { from: s.arc&&s.arc.from?s.arc.from:'', to: s.arc&&s.arc.to?s.arc.to:'' }, pivot: s.pivot||'', log: s.note ? [{ch: chIdx, note: s.note}] : [], _lastCh: s.note ? chIdx : 0, _auto: true };
      cur.push(entry); total++; newCount++; return;
    }
    exist.status = SUB_STATUSES.includes(s.status) ? s.status : exist.status;
    if(s.question) exist.question = String(s.question).trim();
    if(s.arc && (s.arc.from||s.arc.to)){ exist.arc = exist.arc || {from:'',to:''}; if(s.arc.from) exist.arc.from = String(s.arc.from).trim(); if(s.arc.to) exist.arc.to = String(s.arc.to).trim(); }
    if(s.pivot) exist.pivot = String(s.pivot).trim();
    if(s.note){
      if(!Array.isArray(exist.log)) exist.log = [];
      const ch = chIdx; let lo=0, hi=exist.log.length;
      while(lo<hi){ const mid=(lo+hi)>>1; if((exist.log[mid].ch||0) <= ch) lo=mid+1; else hi=mid; }
      exist.log.splice(lo, 0, {ch: chIdx, note: String(s.note).trim()});
      exist._lastCh = Math.max(...exist.log.map(x=>x.ch||0));
    }
    total++;
  });
  return {total, newCount, noQuestionCount};
}
