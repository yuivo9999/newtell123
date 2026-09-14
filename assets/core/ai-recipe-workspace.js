/* v30: cohesive legacy region — AI 配方 / 历史 / 导入导出工作区. */

export function install(deps){
  let {
    aiRp,
    aiRecipeSave,
    aiRecipeResultHtml,
    aiRecipeGen,
    aiRecipeApply,
    aiRecipeAddGapAll,
    aiRecipeAddGap,
    AI_CAT_LABEL,
    WRITE_COMBOS,
    addAiHist,
    aiHistAddGap,
    aiHistAddGapAll,
    aiHistEntryId,
    applyChosenCandidate,
    download,
    esc,
    gapFiveHtml,
    getAiHist,
    getCfg,
    lib,
    libHas,
    recipeScBadge,
    render,
    saveCfg,
    setAiHist,
    toast,
    wiseWhyText,
    writeStyleById,
    writeStyleLib,
  } = deps;


function aiHistCandHtml(c, idx, ei){
  if(!c) return '';
  const pendAll = Array.isArray(c.gap) && c.gap.some(g => !((c.tags||[]).includes(g.id) || libHas(g.id)));
  return `<div class="ai-recipe-cand" style="margin-top:6px">
    <div class="ai-recipe-cand-head">
      <b>${esc(c.name||('候选'+(idx+1)))}</b>
      ${ recipeScBadge(c) }
      <span class="muted" style="font-size:11px">${esc(c.desc||'')}</span>
    </div>
    <div class="ai-recipe-tags">${ (c.tags||[]).map(id=>{ const s=writeStyleById(id); return `<span class="ai-recipe-tg">${esc(s?s.name:id)}</span>`; }).join('') }</div>
    <div class="ai-recipe-sec"><span class="ar-lab">为何这样选</span>${esc(wiseWhyText(c.why||''))}</div>
    <div class="ai-recipe-sec"><span class="ar-lab">适用场景</span>${esc(wiseWhyText(c.scenario||''))}</div>
    <div class="ai-recipe-gap">
      ${ Array.isArray(c.gap) && c.gap.length
        ? `<div class="ar-gaptitle">⚠️ 词条缺口（${c.gap.length} 项）</div>` + c.gap.map((g,gi)=>`
            <div class="ai-recipe-gapitem">
              <div class="ar-gaphead"><b>${esc((g&&g.name)||'')}</b><span class="muted" style="font-size:11px">${ (AI_CAT_LABEL[(g&&g.cat)||'']||((g&&g.cat)||'custom')) }</span></div>
              <div class="ar-gapwhy">${esc((g&&g.reasons)||'')}</div>
              ${gapFiveHtml(g)}
              <button type="button" class="btn small ghost" data-ah-addgap="${ei}__${idx}__${gi}" ${ (c.tags||[]).includes(g.id)|| libHas(g.id) ? 'disabled' : '' }>＋ 加入词库</button>
            </div>`).join('')
            + (c.gap.length>1 ? `<div style="margin-top:6px"><button type="button" class="btn small primary" data-ah-addgapall="${ei}__${idx}" ${pendAll?'':'disabled'} title="仅加入尚未入库的新词条；已入库的自动跳过">＋ 全部加入词库</button></div>` : '')
        : `<span class="ar-ok">✓ 现有词库即可覆盖，无需新词条</span>` }
    </div>
    <div style="margin-top:6px"><button type="button" class="btn small primary" data-ah-candpick="${idx}" title="恢复此候选并应用到写作风格">✔ 恢复为此候选</button></div>
  </div>`;
}


function openAiHistPanel(){
  const hist = getAiHist();
  const ov = document.createElement('div'); ov.id='aiHistPanel'; ov.className='gs-overlay';
  const entHtml = (e,hi)=>{
    const ei = hist.length-1-hi;   // 倒序序号（与展示一致）
    return `<div class="ws-lib-group ws-lib-fold" style="margin-top:6px">
      <div class="ws-lib-fold-t" data-ah-fold="${ei}" role="button" tabindex="0" title="展开/收起">
        <span>${e.src==='outline'?'📑':'📝'} ${esc(e.desc||'')} <span class="muted" style="font-size:10px">· ${new Date(e.ts).toLocaleString('zh-CN',{hour12:false})}</span></span>
        <span class="sc-fold-ico">▸</span>
      </div>
      <div class="ws-lib-fold-body" style="display:none">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px">
          <button type="button" class="btn small ghost" data-ah-apply="${ei}">✔ 重新采用首个</button>
          <button type="button" class="btn small ghost" data-ah-export="${ei}" title="导出该批配方为 JSON（自动附带其引用的自定义词条与 gap 新词条，导入方即可正常使用）">⬇ 导出</button>
          <button type="button" class="btn small ghost" data-ah-del="${ei}">删</button>
        </div>
        ${ (Array.isArray(e.list)&&e.list.length) ? e.list.map((c,i)=>aiHistCandHtml(c,i,ei)).join('<hr style="margin:6px 0;opacity:.2">') : '<p class="muted">无候选。</p>' }
      </div>
    </div>`;
  };
  const list = hist.slice().reverse();
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📖 AI 配方历史（${hist.length}）</b>
        <span style="display:flex;gap:6px">
          <button class="btn small ghost" data-ah-import title="导入配方包 JSON（先预览勾选，再确认导入；词条自动合并进词库）">⬆ 导入配方包</button>
          <button class="btn small ghost" data-ah-clear>清空</button>
          <button class="gs-x" data-ah-close>✕</button>
        </span></div>
      <div class="cv-body">
        ${ list.length ? list.map(entHtml).join('') : '<p class="muted">暂无历史。用「✨ 生成配方」生成后即自动保存于此，可随时回看。</p>' }
      </div>
      <input type="file" id="aiRecipeImportFile" accept=".json,application/json" style="display:none">
    </div>`;
  const close = ()=>{ const p=$('#aiHistPanel'); if(p) p.remove(); };
  const fi = ov.querySelector('#aiRecipeImportFile');
  if(fi) fi.onchange = e=>{ const file = e.target.files && e.target.files[0]; if(file) importRecipeBundle(file); e.target.value=''; };
  ov.addEventListener('click', (e)=>{
    const cl = e.target.closest('[data-ah-close]'); if(cl){ close(); return; }
    const imp = e.target.closest('[data-ah-import]');
    if(imp){ const f2=$('#aiRecipeImportFile'); if(f2) f2.click(); return; }
    const exp = e.target.closest('[data-ah-export]');
    if(exp){ exportRecipeBundle(hist[+exp.dataset.ahExport]); return; }
    const fold = e.target.closest('[data-ah-fold]');
    if(fold){ const body = fold.closest('.ws-lib-group').querySelector('.ws-lib-fold-body'); if(body){ const open = body.style.display!=='none'; body.style.display = open?'none':'block'; fold.querySelector('.sc-fold-ico').textContent = open?'▸':'▾'; } return; }
    const apply = e.target.closest('[data-ah-apply]');
    if(apply){ const ei=+apply.dataset.ahApply; const entry=hist[ei]; if(entry&&Array.isArray(entry.list)&&entry.list.length){ applyChosenCandidate(entry.list[0], {render:false}); refreshAiHistBadge(); close(); } return; }
    const candpick = e.target.closest('[data-ah-candpick]');
    if(candpick){ const ci=+candpick.dataset.ahCandpick; const grp=candpick.closest('.ws-lib-group'); const fold=grp&&grp.querySelector('[data-ah-fold]'); const ei=fold?+fold.dataset.ahFold:-1; const entry=hist[ei]; const c=(entry&&Array.isArray(entry.list))?entry.list[ci]:null; if(c){ applyChosenCandidate(c, {render:true}); refreshAiHistBadge(); close(); } return; }
    const ahAdd = e.target.closest('[data-ah-addgap]');
    if(ahAdd){ const p=(ahAdd.dataset.ahAddgap||'').split('__'); if(p.length===3){ const ei=+p[0], ci=+p[1], gi=+p[2]; aiHistAddGap(ei, ci, gi); refreshAiHistBadge(); } return; }
    const ahAddAll = e.target.closest('[data-ah-addgapall]');
    if(ahAddAll){ const p=(ahAddAll.dataset.ahAddgapall||'').split('__'); if(p.length===2){ aiHistAddGapAll(+p[0], +p[1]); refreshAiHistBadge(); } return; }
    const del = e.target.closest('[data-ah-del]');
    if(del){ const ei=+del.dataset.ahDel; const a=getAiHist(); if(a[ei]){ a.splice(ei,1); setAiHist(a); } refreshAiHistBadge(); const p=$('#aiHistPanel'); if(p) p.remove(); openAiHistPanel(); return; }
    const clr = e.target.closest('[data-ah-clear]');
    if(clr){ if(confirm('确认清空全部 AI 配方历史？')){ setAiHist([]); refreshAiHistBadge(); close(); } return; }
    if(e.target===ov) close();
  });
  document.body.appendChild(ov);
}


function closeAiHistPanel(){ const p=$('#aiHistPanel'); if(p) p.remove(); }


function buildRecipeBundle(cands, extraElIds){
  const cfg = getCfg();
  const added = (cfg.styleCustom && Array.isArray(cfg.styleCustom.added)) ? cfg.styleCustom.added : [];
  const addedById = {};
  added.forEach(x=>{ if(x&&x.id) addedById[String(x.id)]=x; });
  const bundled = []; const seen = new Set();
  const pushEl = (el)=>{ if(el && el.id && String(el.name||'').trim() && !seen.has(String(el.id))){ seen.add(String(el.id)); bundled.push(JSON.parse(JSON.stringify(el))); } };
  (Array.isArray(cands)?cands:[]).forEach(c=>{
    (Array.isArray(c && c.tags) ? c.tags : []).forEach(id=>{ if(addedById[String(id)]) pushEl(addedById[String(id)]); });   // 自定义词条打包
    (Array.isArray(c && c.gap) ? c.gap : []).forEach(g=> pushEl(g));                                        // gap 新词条五维齐全直接打包
  });
  if(extraElIds) added.forEach(x=>{ if(x && x.id && extraElIds.has(String(x.id))) pushEl(x); });            // 手动勾选词条（不被配方引用也能单独导出）
  return { ver:1, exportedAt:Date.now(), kind:'aiRecipeBundle', recipes: JSON.parse(JSON.stringify(Array.isArray(cands)?cands:[])), bundled };
}


function bundleStamp(){
  const ts = new Date(); const pad = n=>String(n).padStart(2,'0');
  return `${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}`;
}


function downloadBundleFile(data, filename, doneMsg){
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  URL.revokeObjectURL(a.href);
  if(doneMsg) toast(doneMsg);
}


function exportRecipeBundle(entry){
  const cands = Array.isArray(entry && entry.list) ? entry.list : [];
  if(!cands.length){ toast('该历史条目没有可导出的配方'); return; }
  const data = buildRecipeBundle(cands);
  const desc = String((entry&&entry.desc)||'配方').replace(/[\\/:*?"<>|]/g,'').slice(0,20) || '配方';
  downloadBundleFile(data, `配方_${desc}-${bundleStamp()}.json`, `已导出 ${cands.length} 个配方（附词条 ${data.bundled.length} 个）`);
}


function classifyImportBundle(data){
  const cfg = getCfg();
  const haveIds = new Set(((cfg.styleCustom && cfg.styleCustom.added)||[]).map(x=>x&&String(x.id)));
  const libIds = new Set(writeStyleLib().map(x=>x&&String(x.id)));
  const elStates = [];
  (Array.isArray(data.bundled)?data.bundled:[]).forEach(el=>{
    const id = String(el&&el.id||''); const nm = String(el&&el.name||'').trim();
    if(!id || !nm) return;
    elStates.push({ el, mode: libIds.has(id) ? 'skip' : (haveIds.has(id) ? 'repl' : 'new') });
  });
  const hist = getAiHist();
  const sigOf = c => JSON.stringify([String(c&&c.name||''), Array.isArray(c&&c.tags)?c.tags.map(String):[]]);
  const existSigs = new Set();
  hist.forEach(e=> (Array.isArray(e&&e.list)?e.list:[]).forEach(x=> existSigs.add(sigOf(x))));
  const candStates = [];
  (Array.isArray(data.recipes)?data.recipes:[]).forEach(c=>{
    if(!c || !String(c&&c.name||'').trim()) return;
    candStates.push({ c, dup: existSigs.has(sigOf(c)) });
  });
  return { candStates, elStates };
}


function importRecipeBundle(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    let data;
    try{ data = JSON.parse(reader.result); }catch(e){ toast('导入失败：文件不是合法 JSON'); return; }
    if(!data || typeof data!=='object' || data.kind!=='aiRecipeBundle' || !Array.isArray(data.recipes) || !Array.isArray(data.bundled) || (!data.recipes.length && !data.bundled.length)){
      toast('导入失败：不是合法的 AI 配方包'); return;
    }
    const st = classifyImportBundle(data);
    if(!st.candStates.length && !st.elStates.length){ toast('导入包内没有有效内容'); return; }
    showImportPreview(st);
  };
  reader.readAsText(file);
}


function showImportPreview(st){
  const ov = document.createElement('div'); ov.id='impPrevPanel'; ov.className='gs-overlay';
  const nNew = st.candStates.filter(x=>!x.dup).length, nDup = st.candStates.length - nNew;
  const elNew = st.elStates.filter(x=>x.mode==='new').length;
  const elRepl = st.elStates.filter(x=>x.mode==='repl').length;
  const elSkip = st.elStates.filter(x=>x.mode==='skip').length;
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📥 导入预览</b><button class="gs-x" data-ip-close title="取消导入">✕</button></div>
      <div class="cv-body">
        <p class="muted" style="margin:4px 0;font-size:12px">配方 ${st.candStates.length} 条（新 ${nNew} / 重复 ${nDup}）· 词条 ${st.elStates.length} 个（新 ${elNew} / 可覆盖 ${elRepl} / 内置跳过 ${elSkip}）</p>
        ${st.candStates.length ? `<div style="margin:8px 0 2px;display:flex;align-items:center;gap:10px"><b>配方</b>${nNew?`<label class="muted" style="font-size:12px;display:inline-flex;align-items:center;gap:4px"><input type="checkbox" data-ip-all checked> 全选新条目</label>`:''}</div>` : ''}
        ${st.candStates.map((x,i)=> x.dup
          ? `<label class="muted" style="display:block;margin:2px 0" title="与已有配方重复（同名+同标签），无法重复导入">☐ ${esc(String(x.c.name||'').slice(0,30))} · 重复</label>`
          : `<label style="display:block;margin:2px 0"><input type="checkbox" data-ip-cand="${i}" checked> ${esc(String(x.c.name||'').slice(0,30))}${Array.isArray(x.c.tags)?` <span class="muted" style="font-size:11px">· 标签 ${x.c.tags.length} 个</span>`:''}</label>`
        ).join('')}
        ${st.elStates.length ? '<div style="margin:10px 0 2px"><b>随附词条</b></div>' : ''}
        ${st.elStates.map((x,i)=>{
          const nm = esc(String(x.el.name||'').slice(0,24));
          if(x.mode==='skip') return `<label class="muted" style="display:block;margin:2px 0" title="内置词条两端都有，无需导入">☒ ${nm} · 内置</label>`;
          if(x.mode==='repl') return `<label style="display:block;margin:2px 0"><input type="checkbox" data-ip-el="${i}"> ${nm} <span class="muted" style="font-size:11px">· 已有（勾选=以导入版覆盖）</span></label>`;
          return `<label style="display:block;margin:2px 0"><input type="checkbox" data-ip-el="${i}" checked> ${nm} <span class="muted" style="font-size:11px">· ${esc(String(x.el.group||'custom'))} · 新增</span></label>`;
        }).join('')}
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid rgba(128,128,128,.2)">
        <span data-ip-sum class="muted" style="flex:1"></span>
        <button type="button" class="btn small" data-ip-go>✓ 导入所选</button>
        <button type="button" class="btn small ghost" data-ip-close>取消</button>
      </div>
    </div>`;
  const close = ()=>{ const p=$('#impPrevPanel'); if(p) p.remove(); };
  const refreshIpLocks = ()=>{
    const locked = new Set();
    ov.querySelectorAll('[data-ip-cand]:checked').forEach(cb=>{
      const x = st.candStates[+cb.dataset.ipCand];
      (Array.isArray(x&&x.c&&x.c.tags)?x.c.tags:[]).forEach(id=>locked.add(String(id)));
    });
    ov.querySelectorAll('[data-ip-el]').forEach(cb=>{
      const x = st.elStates[+cb.dataset.ipEl]; if(!x) return;
      const id = String(x.el&&x.el.id||'');
      if(locked.has(id)){ cb.checked = true; cb.disabled = true; }
      else { cb.disabled = false; if(cb.dataset.ipManual!=='1') cb.checked = (x.mode==='new'); }
    });
    const nc = ov.querySelectorAll('[data-ip-cand]:checked').length;
    const ne = ov.querySelectorAll('[data-ip-el]:checked').length;
    const sum = ov.querySelector('[data-ip-sum]'); if(sum) sum.textContent = `已选 配方 ${nc} · 词条 ${ne}`;
    const go = ov.querySelector('[data-ip-go]'); if(go) go.disabled = (nc+ne)===0;
  };
  refreshIpLocks();
  ov.addEventListener('change', e=>{
    const t = e.target;
    if(t.matches('[data-ip-all]')){
      ov.querySelectorAll('[data-ip-cand]').forEach(cb=>{ cb.checked = t.checked; });
      refreshIpLocks(); return;
    }
    if(t.matches('[data-ip-el]')){ t.dataset.ipManual = '1'; refreshIpLocks(); return; }
    if(t.matches('[data-ip-cand]')) refreshIpLocks();
  });
  ov.addEventListener('click', e=>{
    const cl = e.target.closest('[data-ip-close]'); if(cl){ close(); return; }
    const go = e.target.closest('[data-ip-go]');
    if(go){ applyBundleSelection(st, ov); return; }
    if(e.target===ov) close();
  });
  document.body.appendChild(ov);
}


function applyBundleSelection(st, ov){
  const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || { notes:{}, added:[], removed:[], comboRemoved:[] };
  const normEl = el=>({ id:String(el.id), group:['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].includes(el.group)?el.group:'custom',
    name:String(el.name), note:String(el.note||''), demo:el.demo?String(el.demo):'', seal:(el.seal===undefined?0:el.seal), warning:el.warning?String(el.warning):'' });
  let elAdded=0, elRepl=0;
  ov.querySelectorAll('[data-ip-el]:checked').forEach(cb=>{
    const x = st.elStates[+cb.dataset.ipEl]; if(!x || !x.el) return;
    if(x.mode==='new'){ cfg.styleCustom.added.push(normEl(x.el)); elAdded++; }
    else if(x.mode==='repl'){
      const i = cfg.styleCustom.added.findIndex(y=>y && String(y.id)===String(x.el.id));
      if(i>=0){ cfg.styleCustom.added[i] = normEl(x.el); elRepl++; }
    }
  });
  const cands = [];
  ov.querySelectorAll('[data-ip-cand]:checked').forEach(cb=>{
    const x = st.candStates[+cb.dataset.ipCand]; if(x && x.c) cands.push(x.c);
  });
  if(cands.length) addAiHist({ id: aiHistEntryId(), ts: Date.now(), src:'desc', desc:'📥 导入所选配方', list: JSON.parse(JSON.stringify(cands)), applied:[] });
  saveCfg(cfg); refreshAiHistBadge();
  const p = $('#impPrevPanel'); if(p) p.remove();
  toast(`导入完成：配方 ${cands.length} · 新增词条 ${elAdded} · 覆盖词条 ${elRepl}`);
}


function refreshExSum(ov){
  const nc = ov.querySelectorAll('[data-ex-combo]:checked').length;
  const nm = ov.querySelectorAll('[data-ex-mycombo]:checked').length;
  const ne = ov.querySelectorAll('[data-ex-el]:checked').length;
  const sum = ov.querySelector('[data-ex-sum]'); if(sum) sum.textContent = `已选 组合配方 ${nc} · 我的配方 ${nm} · 词条 ${ne}`;
  const go = ov.querySelector('[data-ex-go]'); if(go) go.disabled = (nc+nm+ne)===0;
}


function exportStylePack(sel){
  const comboIds = new Set(sel.combos || []);
  const myIds = new Set(sel.myCombos || []);
  const elIds = new Set(sel.els || []);
  if(!(comboIds.size + myIds.size + elIds.size)){ toast('请先勾选要导出的内容'); return; }
  const combos = (WRITE_COMBOS||[]).filter(c=> c && comboIds.has(String(c.id))).map(c=> JSON.parse(JSON.stringify(c)));
  const myCombos = ((getCfg().styleCustom||{}).customCombos||[]).filter(c=> c && myIds.has(String(c.id))).map(c=> JSON.parse(JSON.stringify(c)));
  const entries = writeStyleLib().filter(s=> s && elIds.has(String(s.id))).map(s=> JSON.parse(JSON.stringify(s)));
  const data = { ver:2, kind:'wsStylePack', exportedAt:Date.now(), combos, myCombos, entries };
  downloadBundleFile(data, `写作风格_${bundleStamp()}.json`, `已导出 组合配方 ${combos.length} · 我的配方 ${myCombos.length} · 词条 ${entries.length}`);
}


function openExportCenter(){
  const sc = getCfg().styleCustom || {};
  const comboRemoved = Array.isArray(sc.comboRemoved) ? sc.comboRemoved : [];
  const builtinCombos = (WRITE_COMBOS||[]).filter(c=> c && c.id && !comboRemoved.includes(c.id));
  const myCombos = Array.isArray(sc.customCombos) ? sc.customCombos.filter(c=> c && c.id) : [];
  const GROUPS = ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'];
  const lib = writeStyleLib().filter(s=> s && s.id);
  const row = (attr, id, name, tip) => `<label style="display:inline-flex;align-items:center;gap:4px;margin:3px 12px 3px 0" title="${esc(tip||String(name))}"><input type="checkbox" ${attr}="${esc(String(id))}"> ${esc(String(name))}</label>`;
  const comboHtml = builtinCombos.map(c=> row('data-ex-combo', c.id, c.name, `${c.name||''}：${c.desc||''}`)).join('') || '<p class="muted">暂无。</p>';
  const myHtml = myCombos.length
    ? myCombos.map(c=> row('data-ex-mycombo', c.id, c.name, `${c.name||''}：${c.desc||''}`)).join('')
    : '<p class="muted">暂无我的配方。</p>';
  const byGroup = {};
  lib.forEach(x=>{ const g = GROUPS.includes(x.cat) ? x.cat : 'custom'; (byGroup[g]=byGroup[g]||[]).push(x); });
  const gKeys = GROUPS.filter(g=> byGroup[g] && byGroup[g].length); if(byGroup.custom && byGroup.custom.length) gKeys.push('custom');
  const elHtml = gKeys.map(g=>{
    const items = byGroup[g].map(x=> row('data-ex-el', x.id, x.name, `${x.name||''}：${String(x.note||'').slice(0,80)}`)).join('');
    return `<div style="margin:4px 0">
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer" title="勾选=全选该组词条">
        <input type="checkbox" data-ex-gall="${esc(g)}"> <b style="font-size:12px">${g==='custom'?'自定义':g}（${byGroup[g].length}）</b>
      </label>
      <div data-ex-group="${esc(g)}" style="display:flex;padding:2px 0 6px 22px;flex-wrap:wrap">${items}</div>
    </div>`;
  }).join('') || '<p class="muted">暂无词条。</p>';
  const ov = document.createElement('div'); ov.id='exCenterPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📦 选择导出 · 写作风格</b><button class="gs-x" data-ex-close title="关闭">✕</button></div>
      <div class="cv-body">
        <div style="margin:6px 0 2px"><b>🎬 组合配方</b> <span class="muted" style="font-size:12px">内置 ${builtinCombos.length} 个（勾段头框全选）</span></div>
        <div data-ex-group="__combo" style="display:flex;padding:2px 0 6px 22px;flex-wrap:wrap">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;flex-basis:100%" title="勾选=全选组合配方">
            <input type="checkbox" data-ex-selall="__combo"> 全选（${builtinCombos.length}）
          </label>
          ${comboHtml}
        </div>
        <div style="margin:10px 0 2px"><b>🏷 我的配方</b> <span class="muted" style="font-size:12px">${myCombos.length} 个</span></div>
        <div data-ex-group="__my" style="display:flex;padding:2px 0 6px 22px;flex-wrap:wrap">
          ${myCombos.length?`<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;flex-basis:100%" title="勾选=全选我的配方"><input type="checkbox" data-ex-selall="__my"> 全选（${myCombos.length}）</label>`:''}
          ${myHtml}
        </div>
        <div style="margin:10px 0 2px"><b>📚 五大类词条</b> <span class="muted" style="font-size:12px">共 ${lib.length} 条（内置+自定义，含已改指令）</span></div>
        ${elHtml}
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid rgba(128,128,128,.2)">
        <span data-ex-sum class="muted" style="flex:1">已选 组合配方 0 · 我的配方 0 · 词条 0</span>
        <button type="button" class="btn small" data-ex-go disabled title="勾选后打包导出写作风格包（.json）">⬇ 导出所选</button>
        <button type="button" class="btn small ghost" data-ex-close>取消</button>
      </div>
    </div>`;
  const close = ()=>{ const p=$('#exCenterPanel'); if(p) p.remove(); };
  ov.addEventListener('change', e=>{
    const t = e.target;
    if(t.matches('[data-ex-selall]')){
      const scope = ov.querySelector(`[data-ex-group="${t.dataset.exSelall}"]`);
      if(scope) scope.querySelectorAll('[data-ex-combo],[data-ex-mycombo]').forEach(cb=>{ cb.checked = t.checked; });
      refreshExSum(ov); return;
    }
    if(t.matches('[data-ex-gall]')){
      const body = ov.querySelector(`[data-ex-group="${t.dataset.exGall}"]`);
      if(body) body.querySelectorAll('[data-ex-el]').forEach(cb=>{ cb.checked = t.checked; });
      refreshExSum(ov); return;
    }
    if(t.matches('[data-ex-combo], [data-ex-mycombo], [data-ex-el]')) refreshExSum(ov);
  });
  ov.addEventListener('click', e=>{
    const cl = e.target.closest('[data-ex-close]'); if(cl){ close(); return; }
    const go = e.target.closest('[data-ex-go]');
    if(go){
      exportStylePack({
        combos:   [...ov.querySelectorAll('[data-ex-combo]:checked')].map(cb=>cb.dataset.exCombo),
        myCombos: [...ov.querySelectorAll('[data-ex-mycombo]:checked')].map(cb=>cb.dataset.exMycombo),
        els:      [...ov.querySelectorAll('[data-ex-el]:checked')].map(cb=>cb.dataset.exEl)
      });
      close(); return;
    }
    if(e.target===ov) close();
  });
  document.body.appendChild(ov);
}


function refreshAiHistBadge(){
  const n = getAiHist().length;
  const card = $('.ai-recipe-card');
  if(card){ const b = card.querySelector('[data-ai-recipe-hist] .ai-hist-badge'); if(b) b.textContent = n||''; }
}


function bindAiRecipe(){
  const card = $('.ai-recipe-card'); if(!card) return;
  const gen = card.querySelector('[data-ai-recipe-gen]');
  if(gen) gen.onclick = ()=>{ aiRecipeGen(); };
  const clr = card.querySelector('[data-ai-recipe-clear]');
  if(clr) clr.onclick = ()=>{
    const ta = $('#aiReDesc'); if(ta) ta.value = '';
    aiRp = null;
    const out = card.querySelector('[data-ai-recipe-out]'); if(out) out.innerHTML = aiRecipeResultHtml();
  };
  const foldHead = card.querySelector('[data-ai-recipe-fold]');
  if(foldHead) foldHead.addEventListener('click', ()=>{
    const cfg = getCfg();
    card.classList.toggle('collapsed');
    const nowCollapsed = card.classList.contains('collapsed');
    cfg.aiRecipeCollapsed = nowCollapsed; saveCfg(cfg);
    const ico = foldHead.querySelector('.sc-fold-ico'); if(ico) ico.textContent = nowCollapsed?'▸':'▾';
  });
  const histBtn = card.querySelector('[data-ai-recipe-hist]');
  if(histBtn) histBtn.onclick = ()=>{ openAiHistPanel(); };
  card.addEventListener('click', (e)=>{
    const pick = e.target.closest('[data-ai-recipe-pick]');
    if(pick){ aiRecipeApply(+pick.dataset.aiRecipePick); return; }
    const save = e.target.closest('[data-ai-recipe-save]');
    if(save){ aiRecipeSave(+save.dataset.aiRecipeSave); return; }
    const ag = e.target.closest('[data-ai-recipe-addgap]');
    if(ag){ aiRecipeAddGap(ag.dataset.aiRecipeAddgap); return; }
    const aga = e.target.closest('[data-ai-recipe-addgapall]');
    if(aga){ aiRecipeAddGapAll(+aga.dataset.aiRecipeAddgapall); return; }
  });
}
  const api = {
    bindAiRecipe,
    aiHistCandHtml,
    openAiHistPanel,
    closeAiHistPanel,
    buildRecipeBundle,
    bundleStamp,
    downloadBundleFile,
    exportRecipeBundle,
    classifyImportBundle,
    importRecipeBundle,
    showImportPreview,
    applyBundleSelection,
    refreshExSum,
    exportStylePack,
    openExportCenter,
    refreshAiHistBadge,
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['ai-recipe-workspace'] = Object.freeze(api);
  return ns['ai-recipe-workspace'];
}
