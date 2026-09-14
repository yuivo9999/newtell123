/** v41 consolidated module: narrative-workspace.js */
// ---- merged source: narrative-shell.js ----
const _m0 = (() => {
// Extracted from app-legacy.js; legacy UI/runtime bridge.
const W = globalThis;
const state = W.TellMeRuntime?.state ?? W.state;
const $=W.$, toast=W.toast, stateBanEnabled=W.stateBanEnabled, toastLogGet=W.toastLogGet, openFactCardModal=W.openFactCardModal, openRollingSummaryModal=W.openRollingSummaryModal, openConsistencyCheck=W.openConsistencyCheck, openToastBoard=W.openToastBoard, continueAndFinalizeChapter=W.continueAndFinalizeChapter, handleBanListAction=W.handleBanListAction, renderResumePanel=W.renderResumePanel, renderIronPanel=W.renderIronPanel, renderBanListPanel=W.renderBanListPanel, persist=W.persist, esc=W.esc;
function openNarrativeEngine(){
  const p = $('#narrativeEnginePanel'); if(!p) return;
  renderNarrativeEngineMenu();
  p.classList.remove('hidden');
}

function closeNarrativeEngine(){ const p=$('#narrativeEnginePanel'); if(p) p.classList.add('hidden'); }

function openNeModal(title, bodyHtml, actionsHtml){
  const m=$('#neModal'); if(!m) return;
  $('#neModalTitle').textContent = title || '叙事引擎';
  $('#neModalBody').innerHTML = bodyHtml || '';
  const acts=$('#neModalActions');
  if(actionsHtml){ acts.innerHTML = actionsHtml; acts.classList.remove('hidden'); }
  else { acts.innerHTML=''; acts.classList.add('hidden'); }
  m.classList.remove('hidden');
}

function closeNeModal(){ const m=$('#neModal'); if(m) m.classList.add('hidden'); }

function renderNarrativeEngineMenu(){
  const box=$('#nePanelBody'); if(!box) return;
  const partialN = Object.keys(state._chapterPartial||{}).length;
  box.innerHTML = `
    <div class="ne-menu-hint">AI 叙事中间件总入口，点击打开对应面板</div>
    <button class="ne-menu-item" data-ne-panel="resume"><span class="ne-ico">▶️</span><span class="ne-lbl">流式续写状态</span>${partialN?`<span class="ne-badge">${partialN}</span>`:''}</button>
    <button class="ne-menu-item" data-ne-panel="facts"><span class="ne-ico">📎</span><span class="ne-lbl">事实与一致性看板</span></button>
    <button class="ne-menu-item" data-ne-panel="resumesum"><span class="ne-ico">📜</span><span class="ne-lbl">滚动摘要</span></button>
    <button class="ne-menu-item" data-ne-panel="check"><span class="ne-ico">🩺</span><span class="ne-lbl">一致性自检</span></button>
    <button class="ne-menu-item" data-ne-panel="iron"><span class="ne-ico">📌</span><span class="ne-lbl">叙事铁律（写作总纲）</span>${state._narrIron!==false?'<span class="ne-badge ok">ON</span>':'<span class="ne-badge">OFF</span>'}</button>
    <button class="ne-menu-item" data-ne-panel="banlist"><span class="ne-ico">🚫</span><span class="ne-lbl">禁则清单</span>${stateBanEnabled()?'<span class="ne-badge ok">ON</span>':'<span class="ne-badge">OFF</span>'}</button>
    <!-- v238/反馈①：消息看板入口移入「叙事」面板菜单（第 9 项），带历史消息条数角标；顶栏不加按钮 -->
    <button class="ne-menu-item" data-ne-panel="toastboard"><span class="ne-ico">📋</span><span class="ne-lbl">消息看板</span>${(()=>{const n=toastLogGet().length; return n?`<span class="ne-badge info">${n}</span>`:'';})()}</button>
  `;
}

function rebindNarrativeEngine(){
  const btn=$('#btnNarrativeEngine');
  if(btn) btn.onclick = (e)=>{ e.stopPropagation(); const p=$('#narrativeEnginePanel'); if(p && p.classList.contains('hidden')) openNarrativeEngine(); else closeNarrativeEngine(); };
  const p=$('#narrativeEnginePanel');
  if(p) p.onclick = (e)=>{
    const item=e.target.closest('[data-ne-panel]'); if(!item) return;
    const panel=item.dataset.nePanel;
    if(panel==='resume') renderResumePanel();
    else if(panel==='iron') renderIronPanel();
    else if(panel==='banlist') renderBanListPanel();
    else if(panel==='facts') openFactCardModal();
    else if(panel==='resumesum') openRollingSummaryModal();
    else if(panel==='check') openConsistencyCheck();
    else if(panel==='toastboard') openToastBoard();
    closeNarrativeEngine();
  };
  const m=$('#neModal');
  if(m) m.onclick = (e)=>{
    if(e.target.closest('[data-ne-close]')){ closeNeModal(); return; }
    const resume=e.target.closest('[data-ne-resume]'); if(resume){ const i=+resume.dataset.neResume; closeNeModal(); continueAndFinalizeChapter(i, '从中断处继续'); return; }
    const discard=e.target.closest('[data-ne-discard]'); if(discard){ const i=+discard.dataset.neDiscard; delete state._chapterPartial[i]; toast('已丢弃第 '+(i+1)+' 章缓存'); renderResumePanel(); renderNarrativeEngineMenu(); return; }
    if(handleBanListAction(e)) return;
  };
  document.addEventListener('click', (e)=>{
    const p=$('#narrativeEnginePanel');
    if(p && !p.classList.contains('hidden') && !p.contains(e.target) && !e.target.closest('#btnNarrativeEngine')) closeNarrativeEngine();
  });
}


return Object.freeze({openNarrativeEngine, closeNarrativeEngine, openNeModal, closeNeModal, renderNarrativeEngineMenu, rebindNarrativeEngine});
})();

// ---- merged source: narrative-controls.js ----
const _m1 = (() => {
// Extracted from app-legacy.js; legacy UI/runtime bridge.
const W = globalThis;
const state = W.TellMeRuntime?.state ?? W.state;
const $=W.$, esc=W.esc, toast=W.toast, countWords=W.countWords, openNeModal=W.openNeModal, closeNeModal=W.closeNeModal, persist=W.persist, renderNarrativeEngineMenu=W.renderNarrativeEngineMenu, banListRaw=W.banListRaw, normalizeBanList=W.normalizeBanList, stateBanEnabled=W.stateBanEnabled, banListChars=W.banListChars, banListNames=W.banListNames, BANLIST_DEFAULT=W.BANLIST_DEFAULT, NARRATIVE_IRON_HARD=W.NARRATIVE_IRON_HARD, NARRATIVE_IRON_SOFT=W.NARRATIVE_IRON_SOFT;
function renderResumePanel(){
  const partials = state._chapterPartial || {};
  const keys = Object.keys(partials).filter(k=> String(partials[k]||'').trim().length>=50);
  if(!keys.length){ openNeModal('流式续写状态', '<div class="empty">暂无中断缓存，所有章节均未处于生成中或中断状态。</div>'); return; }
  const rows = keys.map(k=>{
    const i=+k; const c=state.chapters[i]; const w=countWords(partials[k]||'').total;
    return `<div class="card"><div class="kv"><span class="k">第 ${i+1} 章</span><span class="v">${esc(c && c.title ? c.title : '未命名')}</span></div><div class="kv"><span class="k">已缓存</span><span class="v">${w.toLocaleString()} 字</span></div><div class="btn-row"><button class="btn primary" data-ne-resume="${i}">从中断处继续</button><button class="btn ghost" data-ne-discard="${i}">丢弃缓存</button></div></div>`;
  }).join('');
  openNeModal('流式续写状态', `<div class="ne-body">${rows}<p class="hint">「从中断处继续」会把已缓存文本作为锚点，让 AI 无缝续写，避免从零重跑。</p></div>`);
}

function handleBanListAction(e){
  const m=$('#neModal'); if(!m || m.style.display==='none' && m.classList&&m.classList.contains('hidden')) return false;
  if(!m.contains(e.target)) return false;
  const en=e.target.closest('[data-bl-enabled]'); if(en){ /* 保存时统一读回，此处仅占位避免误关面板 */ return false; }
  const add=e.target.closest('[data-bl-rule-add]'); if(add){
    const b=banListRaw();
    const cur=normalizeBanList(b)||{enabled:true,chars:[],names:[],phrases:[],rules:[],scopeAi:[]};
    cur.rules.push({ text:'', ai:['chapter'] });
    state.banList=cur; renderBanListPanel(); return true;
  }
  const del=e.target.closest('[data-bl-rule-del]'); if(del){
    const i=+del.dataset.blRuleDel; const cur=normalizeBanList(state.banList)||{enabled:true,chars:[],names:[],phrases:[],rules:[],scopeAi:[]};
    (cur.rules||[]).splice(i,1); state.banList=cur; renderBanListPanel(); return true;
  }
  const save=e.target.closest('[data-bl-save]'); if(save){
    const cur=normalizeBanList(state.banList)||{enabled:true,chars:[],names:[],phrases:[],rules:[],scopeAi:BANLIST_DEFAULT.scopeAi.slice()};
    const gv=el=>m.querySelector(el); const val=el=>{const x=gv(el); return x?x.value.trim():'';};
    cur.enabled = !!(m.querySelector('[data-bl-enabled]')&&m.querySelector('[data-bl-enabled]').checked);
    cur.chars = val('[data-bl-chars]').split(/[,，]/).map(s=>s.trim()).filter(Boolean);
    cur.names = val('[data-bl-names]').split(/[,，\n]/).map(s=>s.trim()).filter(Boolean);
    cur.phrases = val('[data-bl-phrases]').split(/[,，]/).map(s=>s.trim()).filter(Boolean);
    m.querySelectorAll('[data-bl-rule-text]').forEach(t=>{ const i=+t.dataset.blRuleText; const aiSel=m.querySelector('[data-bl-rule-ai="'+i+'"]'); const ai=aiSel?aiSel.value.split(',') : []; if(cur.rules[i]){ cur.rules[i].text=t.value.trim(); cur.rules[i].ai=ai; } });
    cur.rules=cur.rules.filter(r=>r&&r.text);
    const scope=[];
    if(m.querySelector('[data-bl-scope="chapter"]')&&m.querySelector('[data-bl-scope="chapter"]').checked) scope.push('chapter');
    if(m.querySelector('[data-bl-scope="planner"]')&&m.querySelector('[data-bl-scope="planner"]').checked) scope.push('planner');
    if(m.querySelector('[data-bl-scope="outline"]')&&m.querySelector('[data-bl-scope="outline"]').checked) scope.push('outline');
    if(m.querySelector('[data-bl-scope="title"]')&&m.querySelector('[data-bl-scope="title"]').checked) scope.push('title');
    cur.scopeAi = scope.length?scope:BANLIST_DEFAULT.scopeAi.slice();
    state.banList=cur; persist(); renderNarrativeEngineMenu();
    toast('禁则清单已保存'); return true;
  }
  const reset=e.target.closest('[data-bl-reset]'); if(reset){
    state.banList=null; persist(); renderNarrativeEngineMenu();
    toast('已恢复默认禁则清单'); return true;
  }
  return false;
}

function renderIronPanel(){
  const ironOn = state._narrIron !== false;
  const langOn = state.langLayer !== false;
  const html = `
    <div class="ne-body ne-bl-body">
      <div class="ne-bl-enable">
        <label class="mini-check"><input type="checkbox" data-narr-iron2 ${ironOn?'checked':''}> <b>叙事铁律总开关（默认开，仅长篇生效）</b></label>
        <div class="bl-note muted">统一注入三大写作要求：硬约束（禁止/必须）为铁律不可逾越，软约束尽力而为、随题材微调。</div>
      </div>
      <div class="ne-bl-enable" style="margin-top:8px">
        <label class="mini-check"><input type="checkbox" data-lang-layer2 ${langOn?'checked':''}> <b>语言分层自动调节（默认开，仅长篇生效，不注入规划师）</b></label>
        <div class="bl-note muted">书面语造氛围、口语推剧情；随题材自动定语言底色。属叙事纪律（非文风词条）：不随写作风格预设迁移，仅作用于章节正文。</div>
      </div>
      <div style="margin-top:12px">
        <div style="font-weight:700;margin-bottom:4px">硬约束（铁律）</div>
        <div style="white-space:pre-wrap;font-size:12px;line-height:1.7;color:#333">${esc(NARRATIVE_IRON_HARD)}</div>
        <div style="font-weight:700;margin:10px 0 4px">软约束（引导）</div>
        <div style="white-space:pre-wrap;font-size:12px;line-height:1.7;color:#333">${esc(NARRATIVE_IRON_SOFT)}</div>
      </div>
    </div>`;
  openNeModal('叙事铁律 · 写作总纲', html, '<button class="btn ghost" data-ne-close>关闭</button>');
  const it=$('[data-narr-iron2]'); if(it) it.onchange = ()=>{ state._narrIron=it.checked; persist(); renderIronPanel(); };
  const lt=$('[data-lang-layer2]'); if(lt) lt.onchange = ()=>{ state.langLayer=lt.checked; persist(); renderIronPanel(); };
}

function renderBanListPanel(){
  const b = banListRaw();
  const enabled = stateBanEnabled();
  const chars = banListChars().map(esc).join(', ');
  const names = banListNames().map(esc).join(', ');
  const bRaw = banListRaw();
  const phrases = (Array.isArray(bRaw.phrases)?bRaw.phrases:[]).map(esc).join(', ');
  const rules = (Array.isArray(bRaw.rules)?bRaw.rules:[]).map((r,i)=>`
    <div class="ne-bl-rule">
      <label>生效 AI：<select data-bl-rule-ai="${i}">
        ${['chapter','planner','outline','title'].map(r2=>`<option value="${r2}" ${(Array.isArray(r.ai)&&r.ai.indexOf(r2)>=0)?'selected':''}>${r2==='chapter'?'正文':r2==='planner'?'规划师':r2==='outline'?'大纲':'标题'}</option>`).join('')}
      </select></label>
      <textarea data-bl-rule-text="${i}" rows="2">${esc(r.text||'')}</textarea>
      <button class="btn small ghost" data-bl-rule-del="${i}">删除</button>
    </div>`).join('');
  const aiScope = banListAiScopeLabels();
  const html = `
    <div class="ne-body ne-bl-body">
      <div class="ne-bl-enable">
        <label class="mini-check"><input type="checkbox" data-bl-enabled ${enabled?'checked':''}> <b>总开关：启用「禁则清单」作为全书长期约束</b></label>
      </div>
      <div class="bl-note muted">禁用字/禁用姓名属于全书命名红线：凡会创造或使用名字的 AI 阶段自动执行；附加规则可按阶段指定。清单不得超越输出格式红线与既有事实一致性红线。</div>
      <label class="kv"><span class="k">禁用字</span>
        <input data-bl-chars value="${chars}" placeholder="逗号分隔，如：晚,砚,秋,檐"/>
      </label>
      <label class="kv"><span class="k">禁用姓名</span>
        <textarea data-bl-names rows="3">${names}</textarea>
      </label>
      <label class="kv"><span class="k">禁用短语/模板词（仅正文）</span>
        <input data-bl-phrases value="${phrases}" placeholder="逗号分隔，如：倏然,眸光"/>
      </label>
      <div class="ne-bl-rules-head">附加规则 <button class="btn small" data-bl-rule-add>＋ 新增规则</button></div>
      ${rules || '<div class="muted">暂无附加规则。</div>'}
      <div class="ne-bl-scope-head"><b>附加规则生效范围（按 AI）</b></div>
      <div class="ne-bl-scope">
        <label class="mini-check"><input type="checkbox" data-bl-scope="chapter" ${aiScope.chapter?'checked':''}> 正文</label>
        <label class="mini-check"><input type="checkbox" data-bl-scope="planner" ${aiScope.planner?'checked':''}> 规划师</label>
        <label class="mini-check"><input type="checkbox" data-bl-scope="outline" ${aiScope.outline?'checked':''}> 大纲</label>
        <label class="mini-check"><input type="checkbox" data-bl-scope="title" ${aiScope.title?'checked':''}> 标题</label>
      </div>
      <div class="btn-row">
        <button class="btn primary" data-bl-save>保存</button>
        <button class="btn ghost" data-bl-reset>恢复默认</button>
      </div>
    </div>`;
  openNeModal('禁则清单', html);
}

function banListAiScopeLabels(){
  const b=banListRaw(); const sc=Array.isArray(b.scopeAi)?b.scopeAi:(BANLIST_DEFAULT.scopeAi||[]);
  return { chapter: sc.indexOf('chapter')>=0, planner: sc.indexOf('planner')>=0, outline: sc.indexOf('outline')>=0, title: sc.indexOf('title')>=0 };
}

function renderTitleCandidates(candidates, onSelect){
  if(!Array.isArray(candidates) || candidates.length<2){ onSelect && onSelect(0); return; }
  const cards=candidates.map((cand,i)=>`
    <div class="ne-candidate">
      <div class="ne-cand-head">方案 ${String.fromCharCode(65+i)}</div>
      <div class="ne-cand-meta">数量契约：${cand.valid?'✓':'✗'} · 相邻重名：${(cand.dupRate||0).toFixed(2)} · 专名命中：${(cand.glossRate||0).toFixed(2)}</div>
      <div class="ne-cand-list">${esc((cand.titles||[]).join('\n'))}</div>
      <div class="ne-cand-actions"><button class="btn primary" data-ne-title-select="${i}">应用方案 ${String.fromCharCode(65+i)}</button></div>
    </div>
  `).join('');
  openNeModal('标题候选方案', `<div class="ne-candidates">${cards}</div><p class="hint">选择一套方案后，章节标题将立即更新。</p>`);
  setTimeout(()=>{
    const m=$('#neModal');
    m.querySelectorAll('[data-ne-title-select]').forEach(b=>{
      b.onclick=()=>{ closeNeModal(); onSelect && onSelect(+b.dataset.neTitleSelect); };
    });
  },0);
}


return Object.freeze({renderResumePanel, handleBanListAction, renderIronPanel, renderBanListPanel, banListAiScopeLabels, renderTitleCandidates});
})();

// ---- merged source: history-panel.js ----
const _m2 = (() => {
// Extracted from app-legacy.js.
const W=globalThis;
const state=W.TellMeRuntime?.state ?? W.state;
const R=W.TellMeRuntime;
const $=W.$, esc=W.esc, switchProject=W.switchProject, deleteProject=W.deleteProject, exportProjectFile=W.exportProjectFile, cleanChapterTitle=W.cleanChapterTitle;
function fmtHistTime(ts){
  if(!ts) return '';
  const d = new Date(ts), now = new Date();
  const pad = n => String(n).padStart(2,'0');
  if(d.toDateString() === now.toDateString()) return `今天 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function histProgress(p){
  if(p.chapters && p.chapters.length){
    const done = p.chapters.filter(c=> c.confirmed).length;
    return `${done}/${p.chapters.length} 章`;
  }
  if(p.outline && p.outline.chapters && p.outline.chapters.length) return `大纲 ${p.outline.chapters.length} 章`;
  if(p.characters && p.characters.length) return `${p.characters.length} 角色`;
  if(p.scenes && p.scenes.length) return `${p.scenes.length} 场景`;
  if(p.storyboard && p.storyboard.length) return `${p.storyboard.length} 镜`;
  if(p.idea) return '草稿';
  return `第 ${p.step||1} 步`;
}

function renderHistList(){
  const list = $('#histList'); if(!list) return;
  const items = [...lib.items].sort((a,b)=> (b.updatedAt||0) - (a.updatedAt||0));
  list.innerHTML = items.map(p=>{
    const isCur = p.id === lib.curId;
    const open = histOpenId === p.id;
    const preview = histItemPreview(p);
    return `<div class="hist-item ${isCur?'active':''} ${open?'open':''}" data-hist="${p.id}">
      <div class="hist-head" data-hist-toggle="${p.id}">
        <span class="hist-fold" data-hist-fold="${p.id}">${open?'▾':'▸'}</span>
        <button class="hist-main" data-switch="${p.id}">
          <span class="hist-title">${isCur?'<em class="hist-cur">当前</em>':''}${esc(p.title||'未命名作品')}</span>
          ${p.logline?`<span class="hist-desc">${esc(p.logline)}</span>`:''}
          <span class="hist-meta">${histProgress(p)} · ${fmtHistTime(p.updatedAt)}</span>
        </button>
        <button class="hist-del" data-fypexp="${p.id}" title="导出 .fyp 项目">📤</button>
        <button class="hist-del" data-del="${p.id}" title="删除作品">🗑</button>
      </div>
      <div class="hist-body">${preview}</div>
    </div>`;
  }).join('') || `<div class="hist-empty">还没有作品，点击「＋ 新建小说」开始。</div>`;
  $$('#histList [data-switch]').forEach(b=> b.onclick = ()=> switchProject(b.dataset.switch));
  $$('#histList [data-del]').forEach(b=> b.onclick = (e)=>{ e.stopPropagation(); deleteProject(b.dataset.del); });
  $$('#histList [data-fypexp]').forEach(b=> b.onclick = (e)=>{ e.stopPropagation(); exportProjectFile(b.dataset.fypexp); });
  $$('#histList .hist-head').forEach(h=> h.onclick = (e)=>{
    if(e.target.closest('[data-switch]')) return;   // 点标题=切换项目，不折叠
    if(e.target.closest('[data-del]')) return;
    if(e.target.closest('[data-fypexp]')) return;   // .fyp 导出按钮不触发折叠
    const id = h.dataset.histToggle;
    histOpenId = (histOpenId===id) ? null : id;
    renderHistList();                               // 重新渲染以切折叠态
  });
}

function histItemPreview(p){
  const chapters = (p.chapters||[]).filter(c=> c && c.content && String(c.content).trim());
  const parts = [];
  if(chapters.length){
    parts.push(`<b>正文已生成 ${chapters.length} 章：</b>`);
    const rows = chapters.slice(0, 8).map((c,i)=>`<div class="hist-p-row">第${i+1}章 · ${esc(cleanChapterTitle(c.title)||'')}</div>`).join('');
    parts.push(rows);
    if(chapters.length>8) parts.push(`<div class="muted">… 其余 ${chapters.length-8} 章</div>`);
  }
  const outline = p.outline && p.outline.chapters;
  if(outline && outline.length){
    parts.push(`<b>大纲（${outline.length} 章）：</b>`);
    parts.push(`<div class="hist-p-row muted">${esc(outline.map(c=>c.title).slice(0,6).join(' / '))}${outline.length>6?' …':''}</div>`);
  }
  if(p.characters && p.characters.length){
    parts.push(`<div class="hist-p-row muted">角色：${esc(p.characters.map(c=>c.name).slice(0,6).join('、'))}</div>`);
  }
  if(p.scenes && p.scenes.length){
    parts.push(`<div class="hist-p-row muted">场景：${esc(p.scenes.map(s=>s.name).slice(0,6).join('、'))}</div>`);
  }
  if(!parts.length) parts.push('<div class="muted">（暂无内容，仅记录了构想与进度）</div>');
  return parts.join('');
}

function openHistPanel(){ renderHistList(); $('#histPanel').classList.remove('hidden'); }

function closeHistPanel(){ $('#histPanel').classList.add('hidden'); }

return Object.freeze({fmtHistTime, histProgress, renderHistList, histItemPreview, openHistPanel, closeHistPanel});
})();

export const narrative_workspaceModules = Object.freeze([_m0, _m1, _m2]);
