/**
 * Glossary AI data pipeline: extraction, validation, sanitization, merge, and coverage.
 *
 * Context7/MDN-guided ESM boundary: the data pipeline is a named-export module;
 * legacy UI/orchestration dependencies stay behind a narrow runtime bridge.
 */
const runtime = () => window.TellMeRuntime || {};
const state = () => runtime().state || window.state || {};
const runtimeFn = (name) => (...args) => {
  const fn = window[name];
  if (typeof fn !== 'function') throw new Error(`[glossary-pipeline] runtime function unavailable: ${name}`);
  return fn(...args);
};

const buildAIPrompt = runtimeFn('buildAIPrompt');
const callDeepSeek = runtimeFn('callDeepSeek');
const clampMaxTokens = runtimeFn('clampMaxTokens');
const resolveActiveSpec = runtimeFn('resolveActiveSpec');
const persist = runtimeFn('persist');
const parseJson = runtimeFn('parseJson');
const unwrapAIResult = runtimeFn('unwrapAIResult');
const glossaryAliases = runtimeFn('glossaryAliases');
const nmNameRuleViolation = runtimeFn('nmNameRuleViolation');
const escRe = runtimeFn('escRe');

export const GLOSSARY_EXTRACT_SYS = `你是一位资深长篇小说「设定审计师」。
【核心任务】给定本章正文与现有词典，提取正文中出现但现有词典未收录的新人物、新地名、新专名，并做字段自洽审查。

【必须输出的 JSON 结构】
{"characters":[{"name":"人名","identity":"身份/职业/社会身份","age":"岁数/年龄","gender":"性别","appearance":"外貌特征","hobby":"爱好","catchphrase":"口头禅","relation":"与该人的血缘/人际关联","trait":"性格要点"}],"places":[{"name":"地名","type":"类型","note":"设定要点"}],"propernouns":[{"name":"专名","note":"含义"}]}

【硬性约束】
1. 只提取正文中真实出现、且有明确所指（被命名）的实体；纯叙述性泛指不提取。
2. 与现有词典逐名去重：同名条目一律不再输出。
3. 人物必须输出全部 8 个字段：identity / age / gender / appearance / hobby / catchphrase / relation / trait；禁止缺字段、留空；无法推断的字段填「未知」。catchphrase（口头禅）并非人人都有：正文出现其专属口头禅就写具体内容，判定没有则填「无」。
4. relation 与 identity 区分：身份词（捕快/市长/船女）归 identity；带"谁的"的人际关联归 relation；relation 只写一句话关系摘要（≤20字），与他人多组关系的逐条明细由「人物关系表」承载，禁止在 relation 里堆砌多组关系。
5. 字段自洽：age 与履历/居住年限不得矛盾；子代须小于亲代；特殊预设（转世/穿越/长生/修仙）可豁免但需标注。
6. 无明显新实体时输出 {"characters":[], "places":[], "propernouns":[]}。
7. 只输出上述 JSON，不要 markdown 代码块、不要解释。`;

export const CHAR_FIELDS = ['identity','age','gender','appearance','hobby','relation','trait','catchphrase'];

export function buildGlossaryExtractUser(ctx){
  const s = state();
  const o = s.outline || {};
  const g = o.glossary || {};
  const dict = [['characters','人物'],['places','地点'],['propernouns','专名']].map(([k,label])=>{
    const arr = (g[k]||[]).map(x=>x&&x.name).filter(Boolean);
    return arr.length ? `${label}：${arr.join('、')}` : `${label}：（无）`;
  }).join('\n');
  return `【现有词典】\n${dict}\n\n【本章正文】\n${String(ctx?.content||'').slice(-50000)}`;
}

export function validateGlossaryExtract(j){
  if(!j) return {ok:false, code:'EMPTY'};
  for(const c of (j.characters || [])){
    const missing = ['name',...CHAR_FIELDS].filter(k => !String(c[k]||'').trim());
    if(missing.length) return {ok:false, code:'CHAR_FIELD_MISSING', details: c.name};
    const nameViol = nmNameRuleViolation(String(c.name||'').trim());
    if(nameViol) return {ok:false, code:'CHAR_NAME_RULE', details: nameViol};
  }
  return {ok:true};
}

export function completeCharFields(c){
  CHAR_FIELDS.forEach(k=>{
    if(c[k]==null || String(c[k]).trim()==='') c[k] = (k==='catchphrase') ? '无' : '未知';
  });
  return c;
}

export function sanitizeGlossaryExtract(j){
  j = j || {};
  const keepChar = c => {
    if(c.name == null || !String(c.name).trim()) return null;
    const o = { name: String(c.name).trim() };
    CHAR_FIELDS.forEach(k=>{ if(c[k]!=null) o[k] = String(c[k]).trim(); });
    return completeCharFields(o);
  };
  const keepPlace = p => { const o = {}; ['name','type','note'].forEach(k=>{ if(p[k]!=null) o[k]=String(p[k]).trim(); }); return o.name ? o : null; };
  const keepProp = p => { const o = {}; ['name','note'].forEach(k=>{ if(p[k]!=null) o[k]=String(p[k]).trim(); }); return o.name ? o : null; };
  return {
    characters: (Array.isArray(j.characters)?j.characters:[]).map(keepChar).filter(Boolean),
    places:     (Array.isArray(j.places)?j.places:[]).map(keepPlace).filter(Boolean),
    propernouns:(Array.isArray(j.propernouns)?j.propernouns:[]).map(keepProp).filter(Boolean)
  };
}

export async function extractNewGlossary(bodyTexts){
  const s = state();
  const allText = (bodyTexts||[]).filter(Boolean).map(String).join('\n\n');
  const o = s.outline;
  if(o && !o._v45) o._v45 = {};
  const LIMIT = 50000;
  let body;
  if(allText.length <= LIMIT){
    body = allText;
    if(o) o._v45.glossCursor = allText.length;
  }else{
    let cur = Math.min((o && o._v45.glossCursor) || 0, allText.length);
    if(allText.length - cur < LIMIT) cur = allText.length - LIMIT;
    body = allText.slice(cur, cur + LIMIT);
    if(o) o._v45.glossCursor = cur + body.length;
  }
  if(!body.trim()) return {characters:[], places:[], propernouns:[]};
  const user = buildAIPrompt('glossary', { content: body });
  const txt = unwrapAIResult(await callDeepSeek(GLOSSARY_EXTRACT_SYS, user, {
    maxTokens: clampMaxTokens('glossary'),
    temperature: resolveActiveSpec().qcTemp,
    topP: 0.5,
    taskKey:'glossary'
  }));
  const j = parseJson(txt) || {};
  const report = validateGlossaryExtract(j);
  if(!report.ok) console.warn('[词典] 输出校验未通过（不阻断）：', report.code, report.details||'');
  return sanitizeGlossaryExtract(j);
}

export function mergeExtractedGlossary(ext, src){
  const s = state();
  const o = s.outline;
  if(!o) return {c:0,p:0,k:0,total:0};
  if(!o.glossary) o.glossary = {characters:[], places:[], propernouns:[]};
  const gl = o.glossary;
  const n = {c:0, p:0, k:0, flagged:0};
  const aliasMap = glossaryAliases();
  const mergeArr = (cur, add, tag, checkName) => {
    const have = new Set((cur||[]).map(x=>String(x&&x.name||'').trim()).filter(Boolean));
    (add||[]).forEach(it=>{
      const nm = String(it.name||'').trim(); if(!nm || have.has(nm)) return;
      if(aliasMap.has(nm)) return;
      const nv = checkName ? nmNameRuleViolation(nm) : '';
      if(nv) n.flagged++;
      cur.push({ ...it, ...(nv?{_nameFlag:nv}:{}), _auto:true, _srcCh: (typeof src==='number'&&src>0)?src:0, _srcHow: typeof src==='string'?src:'', _srcTs: Date.now() });
      have.add(nm); n[tag]++;
    });
  };
  mergeArr(gl.characters, ext.characters, 'c', true);
  mergeArr(gl.places, ext.places, 'p');
  mergeArr(gl.propernouns, ext.propernouns, 'k');
  n.total = n.c + n.p + n.k;
  return n;
}

export function checkGlossaryCoverage(){
  const s = state();
  const g = (s.outline && s.outline.glossary) || {};
  const body = (Array.isArray(s.chapters)?s.chapters:[]).filter(c=>c && c.content).map(c=>String(c.content)).join('\n');
  const summary = { total:0, hit:0, chars:{used:[],unused:[]}, places:{used:[],unused:[]}, props:{used:[],unused:[]} };
  const scan = (arr, bucket)=>{
    (arr||[]).forEach(it=>{
      const nm = String(it.name||'').trim(); if(!nm) return;
      summary.total++;
      const re = new RegExp(escRe(nm), 'g');
      const matches = body.match(re);
      const n = matches ? matches.length : 0;
      (n>0 ? bucket.used : bucket.unused).push({name:nm, count:n});
      if(n>0) summary.hit++;
    });
  };
  scan(g.characters, summary.chars);
  scan(g.places, summary.places);
  scan(g.propernouns, summary.props);
  return summary;
}

export function scanUnusedGlossary(){
  const s = checkGlossaryCoverage();
  const stateNow = state();
  const g = (stateNow.outline && stateNow.outline.glossary) || {};
  const withAuto = (unused, src) => (unused||[]).map(x => {
    const it = (src||[]).find(y=> String(y&&y.name||'').trim() === x.name);
    return { name: x.name, _auto: !!(it && it._auto) };
  });
  return {
    characters: withAuto(s.chars.unused, g.characters),
    places: withAuto(s.places.unused, g.places),
    propernouns:withAuto(s.props.unused, g.propernouns)
  };
}

Object.assign(window, {
  GLOSSARY_EXTRACT_SYS,
  CHAR_FIELDS,
  buildGlossaryExtractUser,
  validateGlossaryExtract,
  completeCharFields,
  sanitizeGlossaryExtract,
  extractNewGlossary,
  mergeExtractedGlossary,
  checkGlossaryCoverage,
  scanUnusedGlossary,
});
