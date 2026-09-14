/**
 * Outline pipeline helpers.
 *
 * Context7/MDN-guided ESM boundary: outline state transformation and parsing
 * live here; the legacy UI action remains in app-legacy.js as the orchestrator.
 */

const runtime = () => window.TellMeRuntime || {};
const state = new Proxy({}, {
  get(_target, key) { return runtime().state?.[key]; },
  set(_target, key, value) {
    const target = runtime().state;
    if (target) target[key] = value;
    return true;
  },
});

const runtimeFn = (name) => (...args) => {
  const fn = runtime()[name] || window[name];
  if (typeof fn !== 'function') throw new Error(`[outline-pipeline] runtime function unavailable: ${name}`);
  return fn(...args);
};

const normalizeOutline = runtimeFn('normalizeOutline');
const applyV45ToOutline = runtimeFn('applyV45ToOutline');
const sourceHasGlossary = runtimeFn('sourceHasGlossary');
const chapterCountVal = runtimeFn('chapterCountVal');
const persist = runtimeFn('persist');
const render = runtimeFn('render');
const toast = runtimeFn('toast');
const esc = runtimeFn('esc');

function applyOutlineObject(o, opts){
  opts = opts || {};
  const oldChapters = (state.outline && state.outline.chapters) || [];
  const newN = state.chapterCount || oldChapters.length;
  if(newN && oldChapters.length === newN){
    o.chapters = oldChapters;
  } else {
    o.chapters = [];
  }
  const prevGloss = (state.outline && state.outline.glossary && sourceHasGlossary(state.outline.glossary)) ? state.outline.glossary : null;
  state.outline = o;
  normalizeOutline(state.outline);
  state.outlineConfirmed = false;
  if(prevGloss) o.glossary = prevGloss;
  else if(!o.glossary) o.glossary = {characters:[], places:[], propernouns:[]};
  if(state.pendingV45){
    applyV45ToOutline(o, state.pendingV45);
    state.pendingV45 = null;
  }
  if(!o.navBeacon){
    if(String(state.idea||'').trim()){
      const _idea = String(state.idea||'').trim();
      const _grab = (re)=>{ const _m = _idea.match(re); return (_m && _m[1]) ? _m[1].trim() : ''; };
      const _genre = _grab(/(?:题材|类型)[：:]\s*([^\n，。；;,]{1,20})/);
      const _prot  = _grab(/(?:主角|主人公|男主|女主)[：:]\s*([^\n，。；;,]{1,20})/);
      const _conf  = _grab(/(?:核心冲突|冲突|看点)[：:]\s*([^\n。；;]{2,40})/) || _idea.slice(0, 40);
      o.navBeacon = { genre:_genre, protagonist:_prot, coreConflict:_conf, tone:'' };
    }
  }
  if(!o.userIdea) o.userIdea = state.idea;
  if(!Array.isArray(o.chapterPlans)) o.chapterPlans = [];
  if(o.chapters.length){
    const _prev = (Array.isArray(state.chapters) && state.chapters.length === o.chapters.length) ? state.chapters : null;
    state.chapters = o.chapters.map((c,ci)=>{
      const p = _prev && _prev[ci];
      return {
        title: c.title,
        content: p ? String(p.content||'') : '',
        strip: p ? String(p.strip||'') : '',
        confirmed: p ? !!p.confirmed : false,
        _titleByAI: p ? !!p._titleByAI : false
      };
    });
  }
}

function syncChaptersFromOutline(){
  const o = state.outline;
  if(!o || !Array.isArray(o.chapters) || !o.chapters.length) return false;
  const cur = Array.isArray(state.chapters) ? state.chapters : [];
  if(cur.length === o.chapters.length) return false;   // 已对齐，无需同步
  if(cur.some(c=> c && c.content && String(c.content).trim())) return false;   // 有正文的错位项目不动
  state.chapters = o.chapters.map(c=>({
    title: String((c && c.title) || ''),
    content:'', strip:'', confirmed:false, _titleByAI:false
  }));
  return true;
}

function chapterContentStat(){
  const n = (state.chapters||[]).filter(c=> c && c.content && String(c.content).trim()).length;
  const curN = (state.outline && Array.isArray(state.outline.chapters) && state.outline.chapters.length) ? state.outline.chapters.length : (state.chapters||[]).length;
  return { hasContent: n>0, contentN: n, curN };
}
function confirmOutlineContentGuard(){
  const s = chapterContentStat();
  if(!s.hasContent) return true;
  const newN = chapterCountVal();
  if(s.curN && newN && s.curN !== newN){
    return window.confirm(`当前已写正文 ${s.contentN} 章（共 ${s.curN} 章），本次预设章数为 ${newN} 章。章数不同，新大纲生效后正文将无法按章节对应保留。继续生成？`);
  }
  return true;
}



function selectedPolishCandidate(){
  const opts = Array.isArray(state.polishOptions) ? state.polishOptions : [];
  if(!opts.length) return null;
  const ad = state.polishAdopted;
  if(ad){ const hit = opts.find(o=> o && o.name === ad); if(hit) return hit; }
  return opts[0];   // 无显式选中时回退第一候选（视为已选）
}
function dictmasterLocked(){
  if(!state.dictmasterRan) return false;
  const g = (state.outline && state.outline.glossary) || null;
  if(!g) return false;
  return (g.characters && g.characters.length) || (g.places && g.places.length) || (g.propernouns && g.propernouns.length) ? true : false;
}
function extractCandidateBookName(txt){
  const s = String(txt||'');
  const kv = s.match(/(?:^|\n)\s*(?:书名|小说名|标题|名称)\s*[:：]\s*([^\n]{1,30})/);
  if(kv && kv[1]) return kv[1].trim().replace(/[】\]\)]/g,'');
  const bk = s.match(/[《<]([^《》<>]{1,30})[》>]/);
  if(bk && bk[1]) return bk[1].trim().replace(/[】\]\)]/g,'');
  return '';
}
function stripStructureFromIntro(txt){
  const s = String(txt||'');
  if(!s) return s;
  const lines = s.split('\n');
  const out = [];
  let skip = false;
  const fieldHead = /^\s*(?:书名|小说名|标题|题材|主角|核心冲突|世界观|对手|动机|风格|落地方式|目标|核心词|推荐理由|简介|评分|一句话|定位|优势|亮点)\s*[:：]/;
  const dropLine = /^\s*(?:书名|小说名|标题|推荐理由)\s*[:：]/;   // 单行命名字段：直接剔除
  for(const ln of lines){
    if(!skip && /^\s*结构(?:\s*（[^）]*）)?\s*[:：]/.test(ln)){ skip = true; continue; }
    if(skip){
      if(fieldHead.test(ln)){ skip = false; out.push(ln); }
      continue;
    }
    if(dropLine.test(ln)) continue;
    out.push(ln);
  }
  return out.join('\n').replace(/\n{2,}/g, '\n').trim() || s.trim();
}
function renderLoglineHtml(txt){
  const s = stripStructureFromIntro(txt);
  const ls = String(s||'').trim().split('\n');
  if(!ls.length || !(ls[0]||'').trim()) return '';
  const labelSet = new Set(['书名','小说名','标题','题材','主角','核心缺陷','钩点','核心冲突','风格','目标','核心词','世界观','对手','动机','特点','亮点','定位','基调','金手指','展开','结局','综上','核心看点','设定','走向','看点','卖点','矛盾','成长','悬念','反转']);
  const re = /^([^\s：:（(]{1,10})\s*[:：]\s*(.*)$/;
  const presetHue = {题材:165,主角:218,核心冲突:12,风格:278,目标:128,核心词:332,世界观:188,对手:30,动机:306,特点:46,亮点:52,定位:232,基调:200,金手指:284,展开:358,结局:160,核心看点:20,设定:110,走向:60,看点:327,卖点:301,矛盾:345,成长:95,悬念:244,反转:14};
  function labelHue(name){ if(presetHue[name]!=null) return presetHue[name]; let h=0; for(const c of name) h=(h*31+c.codePointAt(0))%360; return h; }
  return ls.map(ln=>{
    const m = ln.match(re);
    if(m && labelSet.has(m[1].trim())){
      const nm = m[1].trim();
      return `<div class="so-line"><span class="so-lb" style="--h:${labelHue(nm)}">${esc(nm)}</span><span class="so-txt">${esc(m[2])}</span></div>`;
    }
    return `<div class="so-line so-plain">${esc(ln)}</div>`;
  }).join('');
}
function buildOutlineFromPolishCandidate(cand){
  const txt = String((cand && cand.text) || '').trim();
  const o = state.outline || {};
  const curTitle = (o && o.title) || '';
  const title = extractCandidateBookName(txt) || curTitle || '';
  const prevGloss = (o && o.glossary && sourceHasGlossary(o.glossary)) ? o.glossary : null;
  const build = {
    title,
    logline: stripStructureFromIntro(txt) || (o && o.logline) || '',
    userIdea: String(state.idea || '').trim(),
    tone: (o && o.tone) || ''
  };
  if(prevGloss) build.glossary = prevGloss;
  else build.glossary = { characters:[], places:[], propernouns:[], subplots:[] };
  return build;
}


Object.assign(window, { applyOutlineObject, syncChaptersFromOutline, chapterContentStat, confirmOutlineContentGuard, selectedPolishCandidate, dictmasterLocked, extractCandidateBookName, stripStructureFromIntro, renderLoglineHtml, buildOutlineFromPolishCandidate });

export { applyOutlineObject, syncChaptersFromOutline, chapterContentStat, confirmOutlineContentGuard, selectedPolishCandidate, dictmasterLocked, extractCandidateBookName, stripStructureFromIntro, renderLoglineHtml, buildOutlineFromPolishCandidate };
