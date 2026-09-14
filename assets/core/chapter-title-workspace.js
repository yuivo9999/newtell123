/* v30: cohesive legacy region — 章节标题工作区. */

export function install(deps){
  const {
    _aiOptBusy,
    addAdvHist,
    aiHistEntryId,
    busy,
    callDeepSeek,
    cleanChapterTitle,
    copyText,
    ctAdoptedIdx,
    ctAdviceCand,
    ctAdviceFold,
    esc,
    genBusy,
    parseAiJsonList,
    persist,
    refreshAdvHistBadge,
    render,
    resolveActiveSpec,
    setChapterTitle,
    state,
    toast,
  } = deps;


function chTitleHistory(){ const o=state.outline; return (o && Array.isArray(o.chTitleHistory)) ? o.chTitleHistory : []; }


function hasChTitleHistory(){ return chTitleHistory().length > 0; }



function chapterTitleListText(){
  const o = state.outline;
  const arr = (o && Array.isArray(o.chapters)) ? o.chapters : [];
  return arr.map((c,i)=>`第${i+1}章 ${cleanChapterTitle((c&&c.title)||'')}`.replace(/\s+$/,'')).filter(Boolean).join('\n');
}



function bindChapterTitles(){
  const ctFold = $('[data-ct-fold]');
  if(ctFold) ctFold.onclick = ()=>{
    state.ctCollapsed = !state.ctCollapsed; persist();
    const blk = ctFold.closest('.ct-block'); if(blk) blk.classList.toggle('ct-collapsed', state.ctCollapsed);
    const ico = ctFold.querySelector('.ct-fold-ico'); if(ico) ico.textContent = state.ctCollapsed?'▸':'▾';
  };
  const cp = $('[data-ct-copy]');
  if(cp) cp.onclick = ()=>{ copyText(chapterTitleListText()); };
  const ch = $('[data-ct-hist]');
  if(ch) ch.onclick = ()=> openChTitleHistoryPanel();
  const ctb = $('[data-ct-batch]');
  if(ctb) ctb.onclick = ()=> openChTitleBatchPanel();
  $$('[data-ct-edit]').forEach(btn=>{
    btn.onclick = ()=>{
      const i = +btn.dataset.ctEdit;
      const row = $('[data-ct-row="'+i+'"]'); if(!row) return;
      const span = row.querySelector('.ct-title'); if(!span) return;
      $$('.ct-edit-input').forEach(inp=> commitChapterTitle(inp));
      const inp = document.createElement('input');
      inp.className = 'ct-edit-input';
      inp.value = span.textContent;
      span.replaceWith(inp);
      inp.focus(); inp.select();
      inp.onkeydown = e=>{
        if(e.key==='Enter'){ e.preventDefault(); commitChapterTitle(inp); }
        else if(e.key==='Escape'){ commitChapterTitle(inp, true); }
      };
      inp.onblur = ()=> commitChapterTitle(inp);
    };
  });
}


function buildCtAdviceCtx(){
  const o = state.outline || {};
  return {
    小说书名: o.title || '',
    小说简介: o.logline || '',
    现有全部章节标题: (o.chapters||[]).map((c,i)=>`第${i+1}章 ${cleanChapterTitle(c&&c.title)}`).join('\n')
  };
}


function ctAiRefinePrompt(ctx, raw){
  const _raw = String(raw||'').trim();
  return { system:[
    '你是资深长篇小说的章标题策划师。用户在"重生成要求"框里可能写了一段补充要求（风格方向、悬念感、字数对仗、避免套路等），也可能留空、只想听你对全部章节标题的专业点评。',
    '请审读给出的【现有全部章节标题】【小说书名】【小说简介】，输出 1–3 条建议（至少 1 条、最多 3 条）；每条 = { title(一句话定位本条侧重), text(完整点评 + 可直接作为重生成要求下发给标题 AI 的可执行命令) }。',
    '【允许"无建议"】若现有标题整体已足够好，就只返回 1 条：{"title":"无建议","text":"现有标题整体稳定，暂不建议改动。"}——宁缺毋滥，不硬凑条数、不胡说。',
    '【点评要点】整套标题风格是否统一、有无重复/呆板/同质化标题、字数是否对仗、悬念与画面感、与书名/简介的契合度、整体节奏感。',
    '【有补充要求时】先满足用户要求（'+ (_raw? _raw.slice(0,120)+'…' : '（用户未给出方向）') +'）的角度，再在该方向之外综合点评；要求为空时直接审读全部标题点评。',
    '【可执行】text 用对标题 AI 说的命令式祈使句，明确范围与幅度，可行时用换行拆 2–3 个可独立启用的子要点；不臆造与书名/简介冲突的新名或专名。',
    '输出仅一个 JSON 数组（1–3 项），无任何讲解、无 markdown 代码块前后缀。每项结构：{ "title":"一句话说明本条侧重什么", "text":"完整点评+可执行命令" }'
    ].join('\n'),
    user: JSON.stringify({ 上下文: ctx, 用户原始要求: (_raw||'(无)') }, null, 1) };
}


async function ctAiRefineAdvice(){
  if(_aiOptBusy){ toast('AI 建议优化中，请稍候'); return; }
  if(genBusy()){ toast('已有生成任务进行中，请稍候'); return; }
  _aiOptBusy = true;
  const inp = $('#rtInput'); if(!inp){ _aiOptBusy = false; return; }
  const raw = inp.value.trim();   // 可空：无补充要求也能生成点评
  const out = $('[data-cth-ai-out]');
  if(out) out.innerHTML = `<p class="muted" style="margin:6px 0 0">⏳ AI 正审读现有全部章节标题并给出优化建议…</p>`;
  const btn = $('[data-cth-ai]'); if(btn){ btn.disabled = true; btn.classList.add('is-busy'); btn.textContent = '生成中…'; }
  try{
    const ctx = buildCtAdviceCtx();
    const {system, user} = ctAiRefinePrompt(ctx, raw);
    const spec = resolveActiveSpec();
    const res = unwrapAIResult(await callDeepSeek(system, user, {temperature: spec.titleTemp, topP:0.5, maxTokens:clampMaxTokens('json'), taskKey:'titleAdvice'}));
    const list = parseAiJsonList(res);
    const ls = Array.isArray(list) ? list.filter(x=> x && String(x.text||'').trim()) : [];
    if(!ls.length) throw new Error('AI 未返回有效建议，请重试');
    if(ls.length===1 && /无建议/.test(String(ls[0].title||'')+' '+String(ls[0].text||''))){
      ctAdviceCand = null; ctAdviceFold = false; ctAdoptedIdx = -1;
      if(out) out.innerHTML = `<p class="muted" style="margin:6px 0 0">💡 ${esc(String(ls[0].text||'现有标题整体稳定，暂不建议改动。').trim())}</p>`;
      _aiOptBusy = false;
      const fBtn = $('[data-cth-ai-unfold]'); if(fBtn) fBtn.style.display = 'none';
      if(btn){ btn.disabled = false; btn.textContent = '✨ 标题优化建议'; btn.classList.remove('is-busy'); }
      return;
    }
    ctAdviceCand = ls.slice(0,3);
    ctAdviceFold = false;
    ctAdoptedIdx = -1;
    addAdvHist('ct', { id: aiHistEntryId(), ts: Date.now(), desc: '标题优化建议', list: JSON.parse(JSON.stringify(ls.slice(0,3))) });
    refreshAdvHistBadge('ct');
  }catch(e){
    ctAdviceCand = null;
    if(out) out.innerHTML = `<p class="muted" style="color:var(--danger);margin:6px 0 0">⚠️ ${esc((e&&e.message)||'生成失败')}</p>`;
  }
  _aiOptBusy = false;
  if(out) out.innerHTML = ctAdviceResultHtml();
  if(btn){ btn.disabled = false; btn.textContent = '✨ 标题优化建议'; btn.classList.remove('is-busy'); }
  const foldBtn = $('[data-cth-ai-unfold]');
  if(foldBtn){
    foldBtn.style.display = (ctAdviceCand && ctAdviceCand.length) ? '' : 'none';
    foldBtn.textContent = ctAdviceFold ? '↗ 展开建议' : '↘ 收起建议';
  }
}


function ctAdviceResultHtml(){
  if(!Array.isArray(ctAdviceCand) || !ctAdviceCand.length) return '';
  if(ctAdviceFold) return '';
  return ctAdviceCand.map((a,ai)=>`
    <div class="advice-ai-cand${ctAdoptedIdx===ai?' adopted':''}" data-cth-ai-pick="${ai}">
      <div class="advice-ai-head">
        <span class="advice-ai-idx">${'①②③'[ai]||(ai+1)}</span>
        <b>${esc(a.title||('方案'+(ai+1)))}</b>
      </div>
      <p>${esc(a.text||'')}</p>
    </div>`).join('');
}


function updateFoldBtn(){
  const foldBtn = $('[data-cth-ai-unfold]');
  if(!foldBtn) return;
  foldBtn.style.display = (ctAdviceCand && ctAdviceCand.length) ? '' : 'none';
  foldBtn.textContent = ctAdviceFold ? '↗ 展开建议' : '↘ 收起建议';
}


function commitChapterTitle(inp, revert){
  if(!inp || inp.dataset.done) return;
  inp.dataset.done = '1';
  const row = inp.closest('[data-ct-row]');
  const i = row ? +row.dataset.ctRow : -1;
  const o = state.outline;
  const oldT = (o && o.chapters && o.chapters[i] && o.chapters[i].title) || ('第'+(i+1)+'章');
  const val = inp.value.trim();
  if(!revert && i>=0 && val) setChapterTitle(i, val);
  const span = document.createElement('span');
  span.className = 'ct-title';
  const finalT = (revert||!val) ? oldT : val;
  span.textContent = finalT;
  span.title = finalT;
  inp.replaceWith(span);
}



function setAllTitles(titles){
  const o = state.outline;
  const n = (o && Array.isArray(o.chapters)) ? o.chapters.length : 0;
  let cnt = 0;
  (titles||[]).forEach((t,i)=>{
    if(i<n && String(t||'').trim()){
      const tt0 = String(t).trim();
      const tt = cleanChapterTitle(tt0) || tt0;   // 入库前剥掉可能重复的"第N章"前缀，只存标题名
      if(o && o.chapters[i]) o.chapters[i].title = tt;
      if(state.chapters && state.chapters[i]) { state.chapters[i].title = tt; state.chapters[i]._titleByAI = false; }
      cnt++;
    }
  });
  persist();
  return cnt;
}



function openChTitleHistoryPanel(){
  closeChTitleHistoryPanel();
  const hist = chTitleHistory(); if(!hist.length){ toast('暂无曾用标题'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const o = state.outline;
  const rows = hist.map((h,idx)=>`
    <div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0"><div class="cv-time">第${h.i+1}章 · ${fmtTs(h.ts)}</div><div class="cv-t" style="font-size:12px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(h.title||'')}</div></div>
      <div class="cv-actions" style="display:flex;gap:6px;flex-shrink:0">
        <button type="button" class="btn ghost cv-b" data-cth-restore="${idx}">↩ 恢复为此标题</button>
        <button type="button" class="btn ghost cv-b" data-cth-del="${idx}">🗑 删除</button>
      </div>
    </div>`).join('');
  const ov = document.createElement('div'); ov.id='cthPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🕘 章节标题 · 单历（${hist.length}/50）</b>
        <button class="gs-x" data-cth-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-div">记录手动修改单章标题的历史，支持一键恢复。</div>
        ${rows}
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-cth-close]').onclick = closeChTitleHistoryPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeChTitleHistoryPanel(); });
  ov.addEventListener('click', e=>{
    const rb = e.target.closest('[data-cth-restore]'); if(!rb) return;
    const h = hist[+rb.dataset.cthRestore]; if(!h) return;
    if(!window.confirm(`把第${h.i+1}章标题恢复为「${h.title}」？`)) return;
    setChapterTitle(h.i, h.title);
    closeChTitleHistoryPanel(); render();
    toast('已恢复该标题');
  });
  ov.addEventListener('click', e=>{
    const db = e.target.closest('[data-cth-del]'); if(!db) return;
    const idx = +db.dataset.cthDel;
    const o2 = state.outline;
    if(o2 && Array.isArray(o2.chTitleHistory)) o2.chTitleHistory.splice(idx,1);
    persist(); closeChTitleHistoryPanel(); render();
    toast('已删除该记录');
  });
}


function closeChTitleHistoryPanel(){ const p=$('#cthPanel'); if(p) p.remove(); }



function chTitleBatches(){ const o=state.outline; return (o && Array.isArray(o.chTitleBatches)) ? o.chTitleBatches : []; }


function snapshotTitleBatch(label){
  const o = state.outline; if(!o) return;
  const titles = (o.chapters||[]).map(c=> (c&&c.title)||'');
  if(!Array.isArray(o.chTitleBatches)) o.chTitleBatches = [];   // fixed: 先挂回 state.outline，persist 才存得住
  const bt = o.chTitleBatches;
  if(bt.length && JSON.stringify(bt[0].titles) === JSON.stringify(titles)) return;
  const d = new Date();
  const t = (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  bt.unshift({ ts: Date.now(), label: `${t} · ${label||'生成批次'}`, titles });
  if(bt.length > 50) bt.length = 50;
  persist();
}


function applyTitleBatch(idx){
  const bt = chTitleBatches(); const b = bt[idx]; if(!b) return;
  const n = (b.titles||[]).length;
  if(!confirm(`整批恢复「${idx+1}. ${b.label||'标题版本'}」（共 ${n} 章）？将覆盖当前全部章节标题。`)) return;
  snapshotTitleBatch('切换前');
  const titles = (Array.isArray(b.titles)?b.titles:[]).map(t=>String(t||'').trim()).filter(Boolean);
  setAllTitles(titles);
  snapshotTitleBatch('本次恢复结果');
  closeTitleBatchPreview(); closeChTitleBatchPanel();
  render();
  toast(`已整批应用该版本标题（${titles.length} 章）`);
}


function deleteTitleBatch(idx){
  const o = state.outline; if(!o) return;
  const bt = chTitleBatches(); if(!bt.length) return;
  bt.splice(idx,1);
  if(!bt.length) delete o.chTitleBatches; else o.chTitleBatches = bt;
  persist();
  closeTitleBatchPreview(); closeChTitleBatchPanel(); openChTitleBatchPanel();
  toast('已删除该版本');
}


function openChTitleBatchPanel(){
  closeChTitleBatchPanel();
  const bt = chTitleBatches();
  if(!bt.length){ toast('暂无批量版本，执行「重生成全部标题」后自动记录'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const rows = bt.map((b,idx)=>`
    <div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0">
        <div class="cv-time">${idx+1}. <b style="color:var(--accent2)">${esc((b.label||'').split(' · ')[0]||fmtTs(b.ts))}</b>${esc((b.label||'').split(' · ')[1]?' · '+b.label.split(' · ')[1]:'')} · ${(b.titles||[]).length} 章</div>
        <div class="cv-t" style="font-size:12px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((b.titles||[]).slice(0,2).join(' / '))||'（空）'}…</div>
      </div>
      <div class="cv-actions" style="display:flex;gap:6px;flex-shrink:0">
        <button type="button" class="btn ghost cv-b" data-batch-view="${idx}">👁 预览</button>
        <button type="button" class="btn primary cv-b" data-batch-apply="${idx}">应用</button>
        <button type="button" class="btn ghost cv-b" data-batch-del="${idx}">🗑</button>
      </div>
    </div>`).join('');
  const ov = document.createElement('div'); ov.id='ctbPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🔁 章节标题 · 批量版本（${bt.length}/50）</b>
        <button class="gs-x" data-ctb-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-div">归档整批章节标题版本，支持预览与快速恢复。</div>
        ${rows}
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-ctb-close]').onclick = closeChTitleBatchPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeChTitleBatchPanel(); });
  ov.querySelectorAll('[data-batch-view]').forEach(b=> b.onclick = ()=> openTitleBatchPreview(+b.dataset.batchView));
  ov.querySelectorAll('[data-batch-apply]').forEach(b=> b.onclick = ()=> applyTitleBatch(+b.dataset.batchApply));
  ov.querySelectorAll('[data-batch-del]').forEach(b=> b.onclick = ()=> deleteTitleBatch(+b.dataset.batchDel));
}


function closeChTitleBatchPanel(){ const p=$('#ctbPanel'); if(p) p.remove(); }


function openTitleBatchPreview(idx){
  closeTitleBatchPreview();
  const bt = chTitleBatches(); const b = bt[idx]; if(!b) return;
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const list = (b.titles||[]).map((t,i)=>`<div class="cv-row"><div class="cv-t" style="font-size:12px">第${i+1}章　${esc(t||'')}</div></div>`).join('') || '<p class="muted">（空批）</p>';
  const ov = document.createElement('div'); ov.id='ctbPreview'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>👁 版本预览 · ${esc(b.label||'标题版本')}（${fmtTs(b.ts)} · ${(b.titles||[]).length} 章）</b>
        <button class="gs-x" data-ctbp-close>✕</button></div>
      <div class="cv-body"><div style="max-height:60vh;overflow:auto">${list}</div></div>
      <div class="modal-actions" style="padding:12px 16px;border-top:1px solid var(--line)">
        <button type="button" class="btn ghost cv-b" data-ctbp-close2>取消</button>
        <button type="button" class="btn primary cv-b" data-ctbp-apply>✔ 应用此版本</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-ctbp-close]').onclick = closeTitleBatchPreview;
  ov.querySelector('[data-ctbp-close2]').onclick = closeTitleBatchPreview;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeTitleBatchPreview(); });
  ov.querySelector('[data-ctbp-apply]').onclick = ()=> applyTitleBatch(idx);
}


function closeTitleBatchPreview(){ const p=$('#ctbPreview'); if(p) p.remove(); }



function titlesGenUser(opts){
  opts = opts || {};
  const o = state.outline || {};
  const parts = [];
  const cand = selectedPolishCandidate();
  const txt = String((cand && cand.text) || '').trim();
  parts.push(`【蓝本：②优化构想所选方案】${(cand && cand.name) ? ('方案『' + cand.name + '』') : '（所选方案）'}`);
  parts.push(`【所选方案完整原文（作为唯一蓝本，其中已有信息不可改动）】\n${txt || '（所选方案为空）'}`);
  const n = opts.n || ((o.chapters || []).length) || 0;
  if(n){
    parts.push(`请生成恰好 ${n} 个章节标题，每个标题一行、含章号前缀，形如：\n第1章 标题\n第2章 标题\n…\n第${n}章 标题\n行数必须严格等于 ${n}，每个标题名≤18字。只输出纯文本，不要 JSON、不要 markdown 代码块、不要解释。`);
  }
  return parts.join('\n\n');
}



function validateTitleOutput(j, expectedN){
  if(!j || !Array.isArray(j.titles)) return {ok:false, code:'NOT_ARRAY'};
  if(j.titles.length !== expectedN) return {ok:false, code:'COUNT_MISMATCH', details:`${j.titles.length} vs ${expectedN}`};
  const re = /^第\d+章\s+.{1,18}$/;
  const bad = j.titles.map((t,i)=> re.test(String(t||'').trim()) ? null : i).filter(i=>i!==null);
  if(bad.length) return {ok:false, code:'FORMAT_ERROR', details:bad};
  return {ok:true};
}


function buildTitleCandidates(cands, expectedN){
  const valid = cands.filter(c => c && c.ok && c.data && Array.isArray(c.data.titles));
  if(!valid.length) return [];
  const g = (state.outline && state.outline.glossary) || {};
  const names = new Set([
    ...(g.characters||[]).map(x=>String(x.name||'').trim()),
    ...(g.places||[]).map(x=>String(x.name||'').trim()),
    ...(g.propernouns||[]).map(x=>String(x.name||'').trim())
  ]);
  const re = /^第\d+章\s+.{1,18}$/;
  return valid.map(res => {
    const titles = res.data.titles.map(t => String(t||'').trim());
    const clean = titles.map(t => t.replace(/^第\d+章\s+/, ''));
    let s = 0; let dup = 0; let hits = 0;
    titles.forEach(t => { if(re.test(t)) s += 2; });
    for(let i=1;i<clean.length;i++) if(clean[i] === clean[i-1]) dup++;
    clean.forEach(t => { for(const n of names) if(n && t.includes(n)) hits++; });
    s -= dup * 5; s += hits;
    return { valid: titles.length===expectedN && titles.every(t=>re.test(t)), titles, dupRate: dup, glossRate: hits, score: s, raw: res.data };
  }).sort((a,b)=>b.score - a.score);
}


function applyTitleCandidate(cand, n, isRegen){
  const _tr = validateTitleOutput(cand.raw, n);
  if(!_tr.ok) throw new Error(`标题输出校验失败：${_tr.code} ${_tr.details||''}`);
  const titles = cand.titles.filter(Boolean);
  if(isRegen){
    snapshotTitleBatch('重生成前');
    const cnt = setAllTitles(titles);
    snapshotTitleBatch('本次重生成结果');
    const o = state.outline;
    if(Array.isArray(o.chapterPlans) && o.chapterPlans.some(Boolean)){
      toast(`已重生成 ${cnt} 个标题；节拍表可能与新标题不匹配，建议重生成规划师`);
    } else toast(`已重生成 ${cnt} 个章节标题`);
  } else {
    const o0 = state.outline; if(!o0) { toast('请先生成大纲'); return; }
    o0.chapters = titles.map(t=>({ title: t }));
    state.chapters = titles.map((t,i)=>({ title:t, content:'', strip:'', confirmed:false }));
    setAllTitles(titles);
    persist(); render();
    if(Array.isArray(o0.chapterPlans) && o0.chapterPlans.some(Boolean)){
      toast(`已生成 ${titles.length} 个章节标题；节拍表可能与新标题不匹配，建议重生成规划师`);
    } else toast(`已生成 ${titles.length} 个章节标题`);
  }
}



function pickBestTitles(cands, expectedN){
  const ui = buildTitleCandidates(cands, expectedN);
  if(!ui.length) return cands.find(c => c && !c.ok) || {ok:false, error:'所有标题候选均失败'};
  return { ok:true, data: ui[0].raw };
}




function renderBeatsTextHtml(txt){
  txt = cleanBeatDividerTrailer(txt);
  const secRe = /^(承接点|场景链与切换|场景链|逐拍推进|情绪弧|心情弧|情绪基调|必须实体|出场实体|埋设伏笔|收束设计|收束|承接|设定)[：:]/;
  const hasSec = String(txt||'').split('\n').some(ln=>secRe.test(ln.trim()));
  const lines = String(txt||'').split('\n');
  const body = [];
  let openList = false;
  lines.forEach(ln=>{
    const s = ln.trim();
    if(!s){ return; }
    if(secRe.test(s)){
      if(openList){ body.push('</div>'); openList = false; }
      body.push(`<div class="bs-t-sec">${esc(s)}</div>`);
      if(/逐拍推进|场景链|承接点/.test(s)){ body.push('<div class="bs-t-lines">'); openList = true; }
      return;
    }
    if(/^(\d+[\.、:：\)）]|[-•·]\s|[①-⑩])/.test(s)){
      if(!openList){ body.push('<div class="bs-t-lines">'); openList = true; }
      body.push(`<div class="bs-t-li">${esc(s)}</div>`);
      return;
    }
    if(openList){ body.push('</div>'); openList = false; }
    body.push(`<div class="bs-t-ln">${esc(s)}</div>`);
  });
  if(openList) body.push('</div>');
  if(!hasSec && !body.some(x=>x.startsWith('<div class="bs-t-sec">'))){
    return `<div class="bs-beats-text bs-beats-plain"><pre>${esc(txt||'')}</pre></div>`;
  }
  return `<div class="bs-beats-text">${body.join('')}</div>`;
}

  const api = {
    chTitleHistory,
    hasChTitleHistory,
    chapterTitleListText,
    bindChapterTitles,
    buildCtAdviceCtx,
    ctAiRefinePrompt,
    ctAiRefineAdvice,
    ctAdviceResultHtml,
    updateFoldBtn,
    commitChapterTitle,
    setAllTitles,
    openChTitleHistoryPanel,
    closeChTitleHistoryPanel,
    chTitleBatches,
    snapshotTitleBatch,
    applyTitleBatch,
    deleteTitleBatch,
    openChTitleBatchPanel,
    closeChTitleBatchPanel,
    openTitleBatchPreview,
    closeTitleBatchPreview,
    titlesGenUser,
    validateTitleOutput,
    buildTitleCandidates,
    applyTitleCandidate,
    pickBestTitles,
    renderBeatsTextHtml,
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['chapter-title-workspace'] = Object.freeze(api);
  return ns['chapter-title-workspace'];
}
