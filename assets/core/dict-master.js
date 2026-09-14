import { normalizeCanonGraph, validateCanonGraph } from './canon-contract.js';
/** v41 consolidated module: dict-master.js */
// ---- merged source: dict-master.js ----
const _m0 = (() => {
/**
 * Dictionary master prompt/validation boundary.
 *
 * Context7/MDN-guided ESM boundary: prompt construction and output validation
 * are pure-ish named exports; UI/AI orchestration remains in app-legacy.js.
 */
const runtime = () => window.TellMeRuntime || window || {};
const state = () => runtime().state || window.state || {};
const dictmasterLocked = (...a) => (window.dictmasterLocked ? window.dictmasterLocked(...a) : (window.TellMeLegacyDomains?.['story-domain']?.dictmasterLocked ? window.TellMeLegacyDomains['story-domain'].dictmasterLocked(...a) : false));

function buildDictMasterUser(ctx){
  const cand = ctx && ctx.candidate;
  const txt = String((cand && cand.text) || '').trim();
  const parts = [];
  parts.push(`【蓝本：②优化构想所选方案】${(cand && cand.name) ? ('方案『' + cand.name + '』') : '（所选方案）'}`);
  parts.push(('【所选方案完整原文（作为唯一蓝本，其中已有角色/地名/专名不可改动）】\n' + txt) || '（所选方案为空）');
  return parts.join('\n\n');
}

function validateDictMasterOutput(j){
  if(!j || typeof j !== 'object') return '返回不是对象';
  if(!Array.isArray(j.characters) || !j.characters.length) return '人物卡 characters 为空（应至少 1 位）';
  for(const c of j.characters){
    if(!c || !String(c.name||'').trim()) return '存在人物缺少 name';
    const must = {identity:c.identity, trait:c.trait};
    for(const [kk,vv] of Object.entries(must)){ if(!String(vv||'').trim()) return `人物「${String(c.name).trim()||'?'}」缺字段 ${kk}`; }
    for(const kk of ['age','gender','appearance','hobby','relation','catchphrase']){ if(!String(c[kk]||'').trim()) c[kk]='未知'; }
    if(String(c.relation||'').trim().length > 40) return `人物「${String(c.name).trim()||'?'}」relation 超过 40 字，疑似把多组关系堆进摘要：只写 ≤20字 的一句话（如「主角的青梅」），多组关系的逐条明细放 relationshipTable`;
  }
  if(!Array.isArray(j.relationshipTable)) return '缺少 relationshipTable 数组';
  const places = Array.isArray(j.places)?j.places:[];
  const props = Array.isArray(j.propernouns)?j.propernouns:[];
  if(!places.length && !props.length) return '缺少 places 或 propernouns';
  for(const p of places){ if(p && (!String(p.name||'').trim()||!String(p.type||'').trim()||!String(p.note||'').trim())) return `地名「${String(p&&p.name||'').trim()||'?'}」信息不全（需 type+note）`; }
  for(const p of props){ if(p && (!String(p.name||'').trim()||!String(p.note||'').trim())) return `专名「${String(p&&p.name||'').trim()||'?'}」缺 note`; }
  const wr = Array.isArray(j.worldRules)?j.worldRules:[];
  if(!wr.length) return '缺少 worldRules（世界观规则，应 ≥1 条）';
  for(const r of wr){ if(r && (!String(r.cat||'').trim()||!String(r.rule||'').trim())) return `世界观规则「${String(r&&r.cat||'').trim()||'?'}」缺失 cat 或 rule`; }
  for(const [key,aa,bb,lab] of [['relationshipTable','a','b','人物关系表'],['placeContacts','from','to','地名关联表'],['properContacts','from','to','专名关联表']]){
    const arr = Array.isArray(j[key]) ? j[key] : [];
    for(const e of arr){
      if(!e || typeof e !== 'object') continue;
      const A=String(e[aa]||'').trim(), B=String(e[bb]||'').trim();
      const hasRest = String(e.relation||'').trim() || String(e.note||'').trim();
      if(hasRest && (!A || !B)) return `${lab}存在端名不全的条目（${lab}每条必须两端都填真实名称，禁止把功能/属性/子项当作另一端凑数）`;
      if(A && B && A===B) return `${lab}「${A}」两端相同（自身对自身无意义）`;
    }
  }
  return '';
}

Object.assign(window, { buildDictMasterUser, validateDictMasterOutput });

return Object.freeze({buildDictMasterUser, validateDictMasterOutput});
})();

// ---- merged source: dict-master-generation.js ----
const _m1 = (() => {
/* v31: cohesive legacy region — dict-master-generation */

function install(deps){
  let {
    _abortCtl,
    addToFixQueue,
    busy,
    callAIGuarded,
    canRunAI,
    esc,
    hideStopBtn,
    invalidateSchoolDownstream,
    markAIDone,
    markAIRunning,
    persist,
    render,
    resolveActiveSpec,
    showStopBtn,
    state,
    toast,
    validAssoc
  } = deps;
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];
  const dictmasterLocked = (...a) => (window.dictmasterLocked ? window.dictmasterLocked(...a) : (window.TellMeLegacyDomains?.['story-domain']?.dictmasterLocked ? window.TellMeLegacyDomains['story-domain'].dictmasterLocked(...a) : false));


async function genDictMaster(btn){
  const o = state.outline;
  const st = $('#dictmasterStatus');
  if(st){ st.className='status'; st.textContent=''; }
  if(!canRunAI('dictmaster')){ toast('请先完成上游：②优化构想并选中一个方案'); return false; }
  invalidateSchoolDownstream('dictMaster');
  if(!window.selectedPolishCandidate()){ toast('先选择一个优化方案'); return false; }
  state.originalIdeaSnapshot = String(state.idea || '').trim() || state.originalIdeaSnapshot;
  markAIRunning('dictmaster');
  if(btn) busy(btn,true,'生成万物词典中…');
  if(btn && btn.parentNode) showStopBtn(btn.parentNode);
  try{
    const spec = resolveActiveSpec('dictmaster');
    const temp = (spec && spec.dictmasterTemp != null) ? spec.dictmasterTemp : 0.4;
    const txt = await callAIGuarded('dictmaster', {}, {temperature: temp, maxTokens: 16384, signal: _abortCtl?.signal});
    const j = extractJsonObject(txt);
    if(!j){ throw new Error('AI 未返回可用的词典 JSON'); }
    const v = validateDictMasterOutput(j);
    if(v) throw new Error('词典校验失败：'+v);
    o.glossary = o.glossary || { characters:[], places:[], propernouns:[], subplots:[] };
    const snapKeys = { characters:['name','identity','age','gender','appearance','hobby','relation','trait','catchphrase'], places:['name','type','note'], propernouns:['name','note'] };
    const entryJson = (x,k)=>{ const o2={}; (snapKeys[k]||[]).forEach(f=> o2[f]=String((x && x[f])!=null ? x[f] : '').trim()); try{ return JSON.stringify(o2); }catch(e){ return ''; } };
    ['characters','places','propernouns'].forEach(k=>{
      const kept=[];
      (o.glossary[k]||[]).forEach(x=>{
        if(x && x._dictmaster){
          if(x._srcSnapshot && entryJson(x,k) !== x._srcSnapshot){
            delete x._dictmaster; delete x._srcSnapshot;
          } else {
            return;
          }
        }
        kept.push(x);
      });
      o.glossary[k]=kept;
    });
    const push = (list,k,mapper)=>{
      const existing = new Set((o.glossary[k]||[]).map(x=>x && String(x.name||'').trim()).filter(Boolean));
      (list||[]).forEach(it=>{
        const nm=String((it && it.name)||'').trim(); if(!nm) return;
        if(existing.has(nm)) return;   // 同名让位
        o.glossary[k]=o.glossary[k]||[];
        const e = (mapper?mapper(it):{ name:nm, note:String(it.note||'').trim() });
        e._dictmaster=true; e._srcSnapshot=entryJson(e,k);
        o.glossary[k].push(e); existing.add(nm);
      });
    };
    push(j.characters, 'characters', c=>({ name:String(c.name||'').trim(), identity:String(c.identity||'').trim(), age:String(c.age||'').trim(), gender:String(c.gender||'').trim(), appearance:String(c.appearance||'').trim(), hobby:String(c.hobby||'').trim(), relation:String(c.relation||'').trim(), trait:String(c.trait||'').trim(), catchphrase:String(c.catchphrase||'').trim() }));
    push(j.places, 'places', p=>({ name:String(p.name||'').trim(), type:String(p.type||'').trim(), note:String(p.note||'').trim() }));
    push(j.propernouns, 'propernouns', p=>({ name:String(p.name||'').trim(), note:String(p.note||'').trim() }));
    o.glossary._relationshipTable = (j.relationshipTable||[]).map(x=>({ a:String(x.a||'').trim(), b:String(x.b||'').trim(), relation:String(x.relation||'').trim(), note:String(x.note||'').trim() }));
    o.glossary._placeContacts = (j.placeContacts||[]).map(x=>({ from:String(x.from||'').trim(), to:String(x.to||'').trim(), relation:String(x.relation||'').trim(), note:String(x.note||'').trim() }));
    o.glossary._properContacts = (j.properContacts||[]).map(x=>({ from:String(x.from||'').trim(), to:String(x.to||'').trim(), relation:String(x.relation||'').trim(), note:String(x.note||'').trim() }));
    o.glossary._worldRules = (j.worldRules||[]).map(x=>({ cat:String(x.cat||'').trim(), scope:String(x.scope||'').trim(), rule:String(x.rule||'').trim() }));
    normalizeCanonGraph(o.glossary);
    const canonCheck=validateCanonGraph(o.glossary);
    if(canonCheck.status==='FAIL') throw new Error('词典达人产出的正式事实未通过 Canon Contract：'+canonCheck.issues.map(x=>x.code).slice(0,8).join('、'));
    const result = { ts: Date.now(), book: (o.title)||'', summary:String(j.summary||'').trim(), nChar:(j.characters||[]).length, nPlace:(j.places||[]).length, nProp:(j.propernouns||[]).length, nRel:(j.relationshipTable||[]).length, nPC:(j.placeContacts||[]).length, nPRC:(j.properContacts||[]).length, nWR:(j.worldRules||[]).length, characters:j.characters||[], rel:j.relationshipTable||[], places:j.places||[], pc:j.placeContacts||[], props:j.propernouns||[], prc:j.properContacts||[], wr:j.worldRules||[] };
    state.dictmasterLatest = result;
    state.dictmasterHistory = Array.isArray(state.dictmasterHistory) ? state.dictmasterHistory : [];
    state.dictmasterHistory.unshift(result);
    if(state.dictmasterHistory.length > 6) state.dictmasterHistory = state.dictmasterHistory.slice(0, 6);   // 第 7 次最旧被挤出
    state.dictmasterRan = true;
    storyState().canon.dictmasterAt=Date.now(); ssEnsureCanonEntities(); ssCaptureMasterSnapshot(); storyState().versions.dictMaster=Number(storyState().versions.dictMaster||0)+1; storyState().pipelineVersion=(Number(storyState().pipelineVersion)||0)+1; storyState().docs=storyState().docs||{}; storyState().docs.worldCanon={version:storyState().versions.dictMaster,source:'dictmaster',ts:Date.now(),counts:{characters:(o.glossary.characters||[]).length,places:(o.glossary.places||[]).length,propernouns:(o.glossary.propernouns||[]).length,worldRules:(o.glossary._worldRules||[]).length}};
    persist(); render();
    markAIDone('dictmaster');
    toast(`万物词典已生成：人物 ${result.nChar} 位 · 地名 ${result.nPlace} · 专名 ${result.nProp} · 关系表 ${result.nRel} 条 · 世界观规则 ${result.nWR} 条（已并入万物词典）`);
    return true;
  }catch(e){
    if(e.name !== 'AbortError') addToFixQueue({kind:'dictmaster', error:e.message});
    toast(e.name==='AbortError' ? '已停止生成万物词典' : '万物词典生成失败：'+e.message);
    if(st){ st.className='status err'; st.textContent = e.message; }
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='dictmaster');
    hideStopBtn(); if(btn) busy(btn,false);
  }
}

function dictMasterBlockHtml(){
  const g = (state.outline && state.outline.glossary) || null;
  const hasOut = !!state.dictmasterLatest && g && ((g.characters&&g.characters.length)||(g.places&&g.places.length)||(g.propernouns&&g.propernouns.length));
  const locked = dictmasterLocked();
  const histN = Array.isArray(state.dictmasterHistory) ? state.dictmasterHistory.length : 0;
  const status = `<p id="dictmasterStatus" class="status" style="margin:8px 0 0"></p>`;
  if(hasOut){
    const r = state.dictmasterLatest || {};
    const relArr = validAssoc(g._relationshipTable,'a','b');
    const pcArr  = validAssoc(g._placeContacts,'from','to');
    const prcArr = validAssoc(g._properContacts,'from','to');
    const wrArr  = ((g&&g._worldRules)||[]).filter(x=>x&&String(x.rule||'').trim());
    const relRows = relArr.slice(0,8).map(x=>`<div class="dm-rel"><b>${esc(x.a||'')}</b> ←${esc(x.relation||'')}→ <b>${esc(x.b||'')}</b>${x.note?` <span class="muted">· ${esc(x.note)}</span>`:''}</div>`).join('');
    const contactRow = x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}${x.note?('：'+esc(x.note)):''}</span></div>`;
    const pcRows = pcArr.map(contactRow).join('');
    const prcRows = prcArr.map(contactRow).join('');
    const wrRows = wrArr.map(x=>`<div class="dm-wr"><b>${esc(x.cat||'')}${String(x.scope||'').trim()?` · ${esc(String(x.scope).trim())}`:''}</b><div>${esc(x.rule||'')}</div></div>`).join('');
  const hue = s=>{ let h=0; for(const ch of String(s||'')) h=(h*31+ch.codePointAt(0))%360; return h; };
  const _labels = { identity:'身份', age:'岁数', gender:'性别', appearance:'外貌', hobby:'爱好', catchphrase:'口头禅', relation:'关系', trait:'性格', type:'类型', note:'说明' };
  const detailLines = (o, keys)=> keys.map(k=> (o && String(o[k]||'').trim())
    ? `<div class="dmt-line"><b>${esc(_labels[k]||k)}</b><span>${esc(String(o[k]).trim())}</span></div>` : '').join('');
  const chip = nm=>`<b class="de-chip" style="--h:${hue(nm)}">${esc(nm)}</b>`;
  const charRow = c=>`<details class="dmt-entry"><summary>${chip(c.name)}<span class="muted dmt-brief">${esc([c.identity,c.gender,c.age].filter(Boolean).join(' · ')||'（无简介）')}</span></summary><div class="dmt-body">${detailLines(c,['identity','age','gender','appearance','hobby','catchphrase','relation','trait'])||'<span class="muted">（无字段）</span>'}</div></details>`;
  const placeRow = p=>`<details class="dmt-entry"><summary>${chip(p.name)}<span class="muted dmt-brief">${esc([p.type,p.note].filter(Boolean).join(' · ')||'')}</span></summary><div class="dmt-body">${detailLines(p,['type','note'])||''}</div></details>`;
  const propRow  = p=>`<details class="dmt-entry"><summary>${chip(p.name)}<span class="muted dmt-brief">${esc(String(p.note||'').trim()||'')}</span></summary><div class="dmt-body">${detailLines(p,['note'])||''}</div></details>`;
  const charMain = (g.characters||[]).filter(c=>c && c.tier!=='support');
  const charSup  = (g.characters||[]).filter(c=>c && c.tier==='support');
  const dmtGroup = (lab, rows)=> rows.length ? `<details class="dmt-group"><summary>${lab}（${rows.length}）</summary><div class="dmt-list">${rows}</div></details>` : '';
  const allRows = dmtGroup('👤 主要人物', charMain.map(charRow))
    + dmtGroup('🤝 次要配角', charSup.map(charRow))
    + dmtGroup('🗺️ 地名', (g.places||[]).map(placeRow))
    + dmtGroup('📌 专名', (g.propernouns||[]).map(propRow));
    return `<div class="card dm-card card-theme-dict">
      <div class="dm-head card-head-bar">
        <div class="ch-left">
          <span class="ch-badge ch-badge-dict">📚</span>
          <h3 class="ch-title">词典达人 · 专有名词与设定库</h3>
          <span class="ch-subtag ch-subtag-dict">人物 ${(g.characters||[]).length} · 地名 ${(g.places||[]).length} · 专名 ${(g.propernouns||[]).length}</span>
        </div>
        <div class="ch-right">
          ${histN?`<button id="btnDictMasterHist" class="btn small ghost">🕘 历史(${histN}/6)</button>`:''}
        </div>
      </div>
      <div class="dm-toolbar">
        <span class="muted dm-strip">关系表 ${relArr.length} · 地名关联 ${pcArr.length} · 专名关联 ${prcArr.length} · 世界观规则 ${wrArr.length}</span>
      </div>
      <div class="dmt-tabs">
        <button type="button" class="dmt-tab on" data-dmt-tab="rel">👥 人物关系表（${relArr.length}）</button>
        <button type="button" class="dmt-tab" data-dmt-tab="wr">⚙️ 世界观规则（${wrArr.length}）</button>
        <button type="button" class="dmt-tab" data-dmt-tab="pc">🗺️ 地名关联表（${pcArr.length}）</button>
        <button type="button" class="dmt-tab" data-dmt-tab="prc">📌 专名关联表（${prcArr.length}）</button>
      </div>
      <div class="dmt-panels">
        <!-- v1.0.317 词典达人不再展示「人物类别」全貌（与词典充实雷同）：默认开在人物关系表 -->
        <div class="dmt-panel on" data-dmt-panel="rel"><div class="dm-rel-table">${relRows||'<span class="muted">（无）</span>'}</div></div>
        <div class="dmt-panel" data-dmt-panel="wr"><div class="dm-rel-table">${wrRows||'<span class="muted">（无）</span>'}</div></div>
        <div class="dmt-panel" data-dmt-panel="pc"><div class="dm-rel-table">${pcRows||'<span class="muted">（无）</span>'}</div></div>
        <div class="dmt-panel" data-dmt-panel="prc"><div class="dm-rel-table">${prcRows||'<span class="muted">（无）</span>'}</div></div>
      </div>
      ${status}
    </div>`;
  }
  return `<div class="card dm-card card-theme-dict">
    <div class="dm-head card-head-bar">
      <div class="ch-left">
        <span class="ch-badge ch-badge-dict">📚</span>
        <h3 class="ch-title">词典达人 · 专有名词与设定库</h3>
        <span class="ch-subtag ch-subtag-dict">待生成</span>
      </div>
      <div class="ch-right">
        <span class="muted" style="font-size:12px">全局设定架构</span>
      </div>
    </div>
    ${locked?`<div class="dm-locked" style="margin:6px 0;color:#2e9e5b;font-size:12px">设定已锁定，可在「编剧学院」中一键迭代。</div>`:''}
    <div class="btn-row"><p class="muted" style="margin:8px 0 0;font-size:12px">尚未生成万物词典，开学后自动构建设定库。</p></div>
    ${status}
  </div>`;
}

  const api = {
    genDictMaster,
    dictMasterBlockHtml
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns["dict-master-generation"] = Object.freeze(api);
  return ns["dict-master-generation"];
}

return Object.freeze({install});
})();

// ---- merged source: dict-master-workspace.js ----
const _m2 = (() => {
/* v30: cohesive legacy region — 万物词典主词典工作区. */

function install(deps){
  let {
    esc,
    state,
    toast,
  } = deps;


function openDictMasterHistoryPanel(){
  const hist = Array.isArray(state.dictmasterHistory) ? state.dictmasterHistory : [];
  if(!hist.length){ toast('暂无历史版本'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const ov = document.createElement('div'); ov.id='dmpPanel'; ov.className='gs-overlay';
  const tabs = hist.map((h,i)=>`<button class="dm-tab" data-dm-tab="${i}" title="第 ${hist.length-i} 次">#${hist.length-i}</button>`).join('');
  const idx = hist.length-1;   // 最新在 tabs 最右
  const renderBody = (i)=>{
    const h = hist[i]; if(!h) return '';
    const rel=(h.rel||[]).map(x=>`<div class="dm-rel"><b>${esc(x.a||'')}</b> ←${esc(x.relation||'')}→ <b>${esc(x.b||'')}</b>${x.note?` <span class="muted">· ${esc(x.note)}</span>`:''}</div>`).join('')||'<span class="muted">（无）</span>';
    const pc=(h.pc||[]).map(x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}</span></div>`).join('')||'<span class="muted">（无）</span>';
    const prc=(h.prc||[]).map(x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}</span></div>`).join('')||'<span class="muted">（无）</span>';
    const wr=(h.wr||[]).map(x=>`<div class="dm-wr"><b>${esc(x.cat||'')}</b><div>${esc(x.rule||'')}</div></div>`).join('')||'<span class="muted">（无）</span>';
    return `<div class="dm-prev-meta">${fmtTs(h.ts)} · ${h.book?('《'+esc(h.book)+'》'):''} 人物 ${h.nChar||0} · 地名 ${h.nPlace||0} · 专名 ${h.nProp||0} · 关系表 ${h.nRel||0} 条 · 世界观规则 ${h.nWR||0} 条</div>
      <div class="dm-prev-chars"><b>人物卡（${h.nChar||0}）</b><span class="muted">${(h.characters||[]).map(c=>esc(c&&c.name||'')).join('、')}</span></div>
      <div class="dm-tables">
        <details class="dm-fold"><summary>世界观规则</summary><div class="dm-rel-table">${wr}</div></details>
        <details class="dm-fold"><summary>人物关系表</summary><div class="dm-rel-table">${rel}</div></details>
        <details class="dm-fold"><summary>地名关联表</summary><div class="dm-rel-table">${pc}</div></details>
        <details class="dm-fold"><summary>专名关联表</summary><div class="dm-rel-table">${prc}</div></details>
      </div>`;
  };
  ov.innerHTML = `<div class="gs-modal dm-hist-modal">
    <div class="gs-modal-head"><b>🕘 词典达人 · 万物词典历史（${hist.length}/6）</b><button class="gs-x" data-dmh-close>✕</button></div>
    <div class="dm-tabs">${tabs}</div>
    <div class="cv-body"><div id="dmhBody" style="max-height:62vh;overflow:auto">${renderBody(idx)}</div></div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-dmh-close]').onclick = ()=> ov.remove();
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
  ov.querySelectorAll('[data-dm-tab]').forEach(t=>{
    t.onclick = ()=>{ ov.querySelectorAll('[data-dm-tab]').forEach(x=>x.classList.remove('on')); t.classList.add('on'); const b=$('#dmhBody'); if(b) b.innerHTML = renderBody(+t.dataset.dmTab); };
  });
  ov.querySelector('[data-dm-tab="'+idx+'"]').classList.add('on');
}


function bindDictMaster(){
  const hb = $('#btnDictMasterHist'); if(hb) hb.onclick = ()=> openDictMasterHistoryPanel();
  $$('.dmt-tab').forEach(t=>{
    if(t._dmt) return; t._dmt = 1;
    t.onclick = ()=>{
      const tab = t.dataset.dmtTab;
      $$('.dmt-tab').forEach(x=>x.classList.toggle('on', x===t));
      $$('.dmt-panel').forEach(p=>p.classList.toggle('on', p.dataset.dmtPanel===tab));
    };
  });
  const sb = $('[data-dmt-search]');
  if(sb && !sb._dmt){ sb._dmt = 1; sb.oninput = ()=>{
    const q = String(sb.value||'').trim().toLowerCase();
    const scope = sb.closest('.dmt-panels') && sb.closest('.dmt-panel').querySelector('[data-dmt-scope]');
    if(!scope) return;
    scope.querySelectorAll('.dmt-group').forEach(grp=>{
      let shown = 0;
      grp.querySelectorAll('.dmt-entry').forEach(en=>{
        const hit = !q || (en.textContent || '').toLowerCase().indexOf(q) >= 0;
        en.style.display = hit ? '' : 'none';
        if(hit) shown++;
      });
      grp.style.display = shown ? '' : 'none';
      const sum = grp.querySelector('summary'); if(sum) sum.textContent = sum.dataset.base;
    });
  };}
  const scope = document.querySelector('[data-dmt-scope]');
  if(scope) scope.querySelectorAll('.dmt-group summary').forEach(s=>{ s.dataset.base = s.textContent; });
}



function cleanEntityName(raw){
  if(!raw) return ['', ''];
  let s = String(raw).trim();
  s = s.replace(/^[*_\`'\"「」【】]+|[*_\`'\"「」【】]+$/g, '').trim();
  s = s.replace(/^[【\[\(（]?(主要人物|次要配角|重要角色|配角|地名|专名|路人|龙套|闲人)[】\]\)）]?[：:·\s|｜│┆丨]+/g, '').trim();
  s = s.replace(/^[0-9]+[.\-、]\s*/, '').trim();

  let extra = '';
  const m_paren = s.match(/[(（\[【](.*?)[)）\]】]/);
  if(m_paren){
    extra = String(m_paren[1]||'').trim();
    s = (s.slice(0, m_paren.index) + s.slice(m_paren.index + m_paren[0].length)).trim();
  }
  const m_dash = s.match(/[\s:：\-—]+(.+)$/);
  if(m_dash && s.slice(0, m_dash.index).trim().length >= 1){
    if(!extra) extra = String(m_dash[1]||'').trim();
    s = s.slice(0, m_dash.index).trim();
  }
  s = s.replace(/^[·•\s]+|[·•\s]+$/g, '').trim();
  s = s.replace(/^名称[：:]\s*/, '').trim();
  return [s, extra];
}

  const api = {
    openDictMasterHistoryPanel,
    bindDictMaster,
    cleanEntityName,
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['dict-master-workspace'] = Object.freeze(api);
  return ns['dict-master-workspace'];
}

return Object.freeze({install});
})();

export const dict_masterModules = Object.freeze([_m0, _m2, _m1]);
