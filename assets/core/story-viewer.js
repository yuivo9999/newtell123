/* v30: cohesive legacy region — 正文主视图 / 节拍与故事事实卡. */

export function install(deps){
  const {
    aiRecipeAddGap,
    aiRecipeAddGapAll,
    aiRecipeApply,
    aiRecipeGen,
    aiRecipePick,
    aiRecipeResultHtml,
    aiRecipeSave,
    aiRp,
    busy,
    cleanChapterTitle,
    copyText,
    currentBookBeatCfg,
    esc,
    getCfg,
    openAiHistPanel,
    persist,
    render,
    saveCfg,
    state,
    toast,
  } = deps;




function beatStructureCardHtml(){
  const o = state.outline || {};
  let chs = Array.isArray(o.chapters) ? o.chapters : [];
  const bb = currentBookBeatCfg();
  const stageNames = beatStageNames();
  let totalCh = chs.length;
  if(!totalCh){
    const _cc = Math.floor(Number(chapterCountVal())||0);
    if(_cc >= 1 && _cc <= 200){ chs = Array.from({length:_cc}, ()=>({title:''})); totalCh = _cc; }
  }
  if(!totalCh || !stageNames.length){
    return `<div class="card bs-card card-theme-beat">
      <div class="bs-head card-head-bar" role="presentation">
        <div class="ch-left">
          <span class="ch-badge ch-badge-beat">🎬</span>
          <h3 class="ch-title">全书节拍与阶段映射</h3>
          <span class="ch-subtag ch-subtag-beat">${esc(bb.label)} · ${stageNames.length} 阶段</span>
        </div>
        <div class="ch-right">
          <span class="muted" style="font-size:12px">宏观节奏链</span>
        </div>
      </div>
      <div class="bs-body">
        <p class="muted" style="margin:0;font-size:12px">生成大纲后将按所选节拍自动划分各章阶段。</p>
      </div>
    </div>`;
  }
  const plan = bookStagePlan(totalCh);
  const beams = []; let cur = 0;
  plan.forEach((p, si)=>{
    const n = p.n;
    const slice = n ? chs.slice(cur, cur+n) : [];
    cur += n;
    beams.push(`
      <div class="bs-beam">
        <div class="bs-beam-top">
          <span class="bs-beam-idx">${si+1}</span>
          <span class="bs-beam-k">${esc(p.name)}</span>
          <span class="bs-beam-meta">${n ? `第 ${cur-n+1}—${cur} 章 · ${n} 章` : '本章阶段暂无对应章'}</span>
        </div>
        <div class="bs-beam-chs">${slice.map((c, j)=>{
          const ci = cur - n + j;
          return `<span class="bs-beam-ch">${ci+1}. ${esc(cleanChapterTitle(c&&c.title))}</span>`;
        }).join(' ')}</div>
      </div>`);
  });
  const fwSeq = plan.map(p=>p.name).join(' → ');
  const mergeNote = totalCh < stageNames.length
    ? `当前章节较少，已将「${esc(bb.label)}」的 ${stageNames.length} 个拍子按序合并为 ${plan.length} 个阶段（每阶段 1 章），确保结尾高潮/收束完整。`
    : '';
  const foldId = 'bsFold';
  const beambody = beams.map((b, i)=>{
    if(totalCh >= 100){
      const m = b.match(/第 (\d+)—(\d+) 章[\s·]+(\d+) 章/);
      if(m) return `<div class="bs-beam bs-beam-fold"><span class="bs-beam-idx">${i+1}</span><span class="bs-beam-k">${m[3] ? m[3]:''}</span><span class="bs-beam-meta">第 ${m[1]}—${m[2]} 章</span></div>`;
    }
    return b;
  }).join('');
  return `<div class="card bs-card card-theme-beat">
    <div class="bs-head card-head-bar" role="presentation" style="cursor:pointer" onclick="document.getElementById('${foldId}').hidden=!document.getElementById('${foldId}').hidden;this.querySelector('#bsFoldTri').textContent=document.getElementById('${foldId}').hidden?'▸':'▾'" title="点击折叠/展开全书节拍">
      <div class="ch-left">
        <span class="ch-badge ch-badge-beat">🎬</span>
        <h3 class="ch-title">全书节拍与阶段映射</h3>
        <span class="ch-subtag ch-subtag-beat">${esc(bb.label)} · ${plan.length} 段 · ${totalCh} 章</span>
      </div>
      <div class="ch-right">
        <span id="bsFoldTri" style="display:inline-block;width:1.2em;font-size:14px;color:var(--muted)">▾</span>
      </div>
    </div>
    <div id="${foldId}" class="bs-body">
      <div class="bs-fw"><span class="bs-fw-chip">${esc(bb.label)}</span><span class="bs-fw-seq">${fwSeq}</span></div>
      <div class="bs-beams">${beambody}</div>
      ${mergeNote ? `<p class="muted" style="margin:4px 0 0;font-size:11px;color:var(--accent)">${mergeNote}</p>` : ''}
    </div>
  </div>`;
}



function beatStageNames(){ const a=currentBookBeatCfg().ai; return (a && a.stages) || []; }


function beatStageDuties(){ const a=currentBookBeatCfg().ai; return (a && a.duty) || []; }



function factCardHtml(){
  const fc = (state.outline && state.outline._factCard) || { characters:{}, timeline:[], lastScene:'' };
  const chars = Object.entries(fc.characters || {}).map(([name, st])=>`
    <div class="fc-char-row">
      <input type="text" class="fc-name" data-fc-char-name="${esc(name)}" value="${esc(name)}" placeholder="人名">
      <input type="text" class="fc-state" data-fc-char-state="${esc(name)}" value="${esc(st.state||'')}" placeholder="当前状态">
      <input type="text" class="fc-loc" data-fc-char-loc="${esc(name)}" value="${esc(st.location||'')}" placeholder="所在地点">
      <input type="text" class="fc-emo" data-fc-char-emo="${esc(name)}" value="${esc(st.emotion||'')}" placeholder="情绪">
    </div>
  `).join('');
  const timeline = (fc.timeline || []).slice(-10).reverse().map(t=>`
    <div class="fc-tl-row">
      <span class="pill">第 ${t.ch+1} 章</span>
      <span>${esc(t.event||'')}</span>
    </div>
  `).join('');
  const ss = (state.outline && state.outline._storyState) || {};
  const obs = ss.current || {};
  const obsChars = obs.characters && Object.entries(obs.characters).length ? Object.entries(obs.characters).slice(0,8).map(([n,v])=>`${esc(n)}=${esc(v)}`).join('；') : '暂无';

  return `<div class="card fc-card${state.fcCollapsed?' fc-collapsed':''}">
    <div class="fc-head" data-fc-fold role="button" tabindex="0" title="展开/收起">
      <h3 style="margin:0">🧩 事实与一致性看板</h3>
      <span class="sc-fold-ico">${state.fcCollapsed?'▸':'▾'}</span>
    </div>
    <div class="fc-body" ${state.fcCollapsed?'hidden':''}>
      <div class="fc-sec">
        <div class="fc-sec-head">人物状态 <button type="button" class="btn small ghost" data-fc-char-add>＋ 添加</button></div>
        ${chars || '<span class="muted">暂无人物状态，可手动添加或在正文生成后自动提取</span>'}
      </div>
      <div class="fc-sec">
        <div class="fc-sec-head">最近时间线</div>
        ${timeline || '<span class="muted">暂无时间线</span>'}
      </div>
      <div class="fc-sec">
        <div class="fc-sec-head">正文结算状态（只读）</div>
        <div class="fc-meta">第${Number(obs.chapter)>=0?Number(obs.chapter)+1:'—'}章 · 时间：${esc(obs.time||'—')} · 地点：${esc(obs.location||'—')}</div>
        <div class="fc-meta">章末：${esc(obs.endingState||'—')}</div>
        <div class="fc-meta">人物：${obsChars}</div>
        ${(()=>{ const au=ss.chapters&&Number(obs.chapter)>=0?ss.chapters[Number(obs.chapter)]?.audit:null; if(!au) return '<div class="fc-meta">一致性审计：尚未完成</div>'; const cls=au.status==='FAIL'?'err':au.status==='WARN'?'warn':'ok'; return `<div class="fc-meta ${cls}">一致性审计：${esc(au.status)} · ${esc(au.summary||'')}</div>`; })()}
      </div>
      <label class="fc-field"><span>最新场景</span><input type="text" id="fcLastScene" value="${esc(fc.lastScene||'')}" placeholder="最后一章结束时的场景/环境"></label>
      <p class="muted" style="font-size:11px">看板内容可由正文 AI 生成后自动更新，也可手动修正。</p>
    </div>
  </div>`;
}



function bindFactCard(){
  const head = $('[data-fc-fold]');
  if(head) head.onclick = ()=>{
    state.fcCollapsed = !state.fcCollapsed; persist();
    const body = $('.fc-body'); if(body) body.hidden = state.fcCollapsed;
    const ico = head.querySelector('.sc-fold-ico'); if(ico) ico.textContent = state.fcCollapsed?'▸':'▾';
  };
  const o = state.outline; if(!o) return;
  o._factCard = o._factCard || { characters:{}, timeline:[], lastScene:'' };
  const fc = o._factCard;

  const add = $('[data-fc-char-add]');
  if(add) add.onclick = ()=>{
    const name = prompt('人物名：'); if(!name) return;
    fc.characters[name] = { state:'', location:'', emotion:'' }; persist(); render();
  };
  $$('[data-fc-char-state],[data-fc-char-loc],[data-fc-char-emo]').forEach(inp=>{
    inp.onchange = ()=>{
      const name = inp.dataset.fcCharState || inp.dataset.fcCharLoc || inp.dataset.fcCharEmo;
      if(!fc.characters[name]) return;
      if(inp.dataset.fcCharState) fc.characters[name].state = inp.value.trim();
      if(inp.dataset.fcCharLoc) fc.characters[name].location = inp.value.trim();
      if(inp.dataset.fcCharEmo) fc.characters[name].emotion = inp.value.trim();
      persist();
    };
  });
  const ls = $('#fcLastScene');
  if(ls) ls.onchange = ()=>{ fc.lastScene = ls.value.trim(); persist(); };
}



function updateFactCardFromChapter(i, text){
  const o = state.outline; if(!o) return;
  const fc = o._factCard = o._factCard || { characters:{}, timeline:[], lastScene:'' };
  fc.timeline = fc.timeline || [];
  fc.timeline = fc.timeline.filter(x => x.ch !== i);
  fc.timeline.push({ ch:i, event:`第 ${i+1} 章正文` });
  if(fc.timeline.length > 50) fc.timeline = fc.timeline.slice(-50);
  const paras = String(text||'').split(/\n+/).map(s => s.trim()).filter(Boolean);
  if(paras.length) fc.lastScene = paras[paras.length-1].slice(0, 120);
  fc.timeAnchors = fc.timeAnchors || [];
  fc.timeAnchors = fc.timeAnchors.filter(x => x.ch !== i);
  auditTimePresentation(i, text);
  persist();
}



function rollingSummaryCardHtml(){
  const o = state.outline; if(!o) return '';
  const sums = (o._rollingSummaries || []).slice().sort((a,b)=>{
    const [a1] = a.key.split('-').map(Number);
    const [b1] = b.key.split('-').map(Number);
    return a1 - b1;
  });
  const rows = sums.map(s=>`
    <div class="rs-row">
      <span class="pill">第 ${s.key} 章</span>
      <span class="rs-text">${esc(s.text)}</span>
    </div>
  `).join('');
  return `<div class="card rs-card${state.rsCollapsed?' rs-collapsed':''}">
    <div class="rs-head" data-rs-fold role="button" tabindex="0" title="展开/收起">
      <h3 style="margin:0">📜 滚动摘要</h3>
      <span class="sc-fold-ico">${state.rsCollapsed?'▸':'▾'}</span>
    </div>
    <div class="rs-body" ${state.rsCollapsed?'hidden':''}>
      ${rows || '<span class="muted">暂无滚动摘要，批量生成正文后会自动生成</span>'}
      <div class="btn-row" style="margin-top:8px">
        <button type="button" class="btn small primary" data-rs-gen ${sums.length?'':'disabled'}>🔄 补齐缺失摘要</button>
        <button type="button" class="btn small ghost" data-rs-clear>清空摘要</button>
      </div>
      <p class="muted" style="font-size:11px">每 5 章生成一次 300-400 字摘要；写新章时会注入最近 3 个区块（约 15 章）的摘要。</p>
    </div>
  </div>`;
}



function bindRollingSummaryCard(){
  const head = $('[data-rs-fold]');
  if(head) head.onclick = ()=>{
    state.rsCollapsed = !state.rsCollapsed; persist();
    const body = $('.rs-body'); if(body) body.hidden = state.rsCollapsed;
    const ico = head.querySelector('.sc-fold-ico'); if(ico) ico.textContent = state.rsCollapsed?'▸':'▾';
  };
  const gen = $('[data-rs-gen]');
  if(gen) gen.onclick = async ()=>{
    busy(gen, true, '生成中…');
    try{ await ensureChapterDigests(); await generateRollingSummaries(); render(); toast('滚动摘要已补齐'); }
    catch(e){ toast('摘要生成失败：'+e.message); }
    finally{ busy(gen, false); }
  };
  const clr = $('[data-rs-clear]');
  if(clr) clr.onclick = ()=>{
    if(!confirm('清空所有滚动摘要？正文生成时会重新生成。')) return;
    const o = state.outline; if(!o) return;
    o._rollingSummaries = []; persist(); render(); toast('已清空滚动摘要');
  };
}



function qualityReportCardHtml(){ return ''; }



function bindQualityReportCard(){}



function formatRelevantGlossaryHtml(rg){
  const lines = [];
  if(rg.characters && rg.characters.length) lines.push('<b>人物：</b>'+rg.characters.map(c=>esc(c.name)).join('、'));
  if(rg.places && rg.places.length) lines.push('<b>地点：</b>'+rg.places.map(p=>esc(p.name)).join('、'));
  if(rg.propernouns && rg.propernouns.length) lines.push('<b>专名：</b>'+rg.propernouns.map(p=>esc(p.name)).join('、'));
  if(!lines.length) return '';
  return `<div class="reader-rg"><span class="reader-rg-lab">📌 本章相关设定</span>${lines.join(' · ')}</div>`;
}



function fixQueueCardHtml(){
  const q = state._fixQueue || [];
  if(!q.length) return '';
  const rows = q.map((item, idx)=>{
    const isKind = !Number.isInteger(item.ch);
    return `<div class="fq-row">
      ${isKind
        ? `<span class="pill tag-warn">${esc(item.kind || 'AI')}</span><span>${esc(item.error || '')}</span>`
        : `<span class="pill tag-warn">第 ${item.ch+1} 章</span><span>${esc(item.code)}</span>`}
      <span class="muted">重试 ${item.attempts||0} 次</span>
      <button type="button" class="btn small ghost" data-fq-remove="${idx}">移除</button>
    </div>`;
  }).join('');
  return `<div class="card fq-card">
    <div class="fq-head"><h3 style="margin:0">🔧 修复队列（${q.length}）</h3></div>
    <div class="fq-body">${rows}</div>
  </div>`;
}



function bindFixQueueCard(){
  $$('[data-fq-remove]').forEach(btn=>{
    btn.onclick = ()=>{
      const idx = +btn.dataset.fqRemove;
      state._fixQueue.splice(idx,1); persist(); render();
    };
  });
}




function syncOrigIdeaCard(){
  const t = $('.orig-text'); if(!t) return;
  if(state.dictmasterRan){ t.value = String(state.originalIdeaSnapshot || state.idea || '').trim() || '（尚未生成万物词典）'; }
  else { t.value = String(state.idea || '').trim() || '（尚未生成万物词典）'; }
}



function origIdeaCard(){
  const o = state.outline;
  const show = state.dictmasterRan
    ? (String(state.originalIdeaSnapshot || '').trim() || String(state.idea || '').trim())
    : String(state.idea || '').trim();
  return `<div class="card orig-card">
    <div class="orig-head" role="button" tabindex="0" data-orig-toggle title="展开/收起">
      <span class="orig-t">📝 原始构想</span>
      <span class="orig-fold">▸</span>
      <button type="button" class="btn small ghost gs-tool" data-orig-copy title="复制构想原文">📋 复制</button>
    </div>
    <div class="orig-body" hidden>
      <textarea readonly class="orig-text" spellcheck="false">${esc(show || '（尚未生成万物词典）')}</textarea>
    </div>
  </div>`;
}



function bindOrigIdea(){
  const og = $('[data-orig-toggle]');
  if(og) og.onclick = (e)=>{
    if(e.target.closest('[data-orig-copy]')) return;
    syncOrigIdeaCard();
    const body = $('.orig-body'); if(!body) return;
    const on = !body.hidden;
    body.hidden = on;
    const fold = og.querySelector('.orig-fold');
    if(fold) fold.textContent = on ? '▸' : '▾';
  };
  const cpy = $('[data-orig-copy]');
  if(cpy) cpy.onclick = ()=>{
    const ta = $('.orig-text'); if(!ta) return;
    copyText(ta.value);
  };
}


function bindOutlineFold(){
  const h = $('[data-so-toggle]'); if(!h) return;
  h.onclick = ()=>{
    const body = $('.so-logline, .logline-ta'); if(!body) return;
    const on = !body.hidden;
    body.hidden = on;
    const f = h.querySelector('.so-fold'); if(f) f.textContent = on ? '▸' : '▾';
    if(state){ state.soCollapsed = on; if(typeof persist==='function') persist(); }
  };
}


function bindLoglineEdit(){
  const eb = $('#btnLoglineEdit'); if(!eb) return;
  eb.onclick = (e)=>{
    e.stopPropagation();
    let p = $('.so-logline');
    if(!p){
      if(state){ state.soCollapsed = false; if(typeof persist==='function') persist(); }
      const head = $('[data-so-toggle]');
      if(head){ const f = head.querySelector('.so-fold'); if(f) f.textContent = '▾'; }
      p = $('.so-logline');
    }
    if(!p) return;
    const ta = document.createElement('textarea');
    ta.className = 'logline-ta';
    ta.value = stripStructureFromIntro(String((state.outline||{}).logline||''));
    ta.rows = 4;
    ta.style.width = '100%';
    ta.style.marginTop = '6px';
    ta.spellcheck = false;
    ta.placeholder = '编辑小说简介（点击卡片其他位置或 Ctrl+Enter 保存，Esc 取消）';
    p.replaceWith(ta);
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
    let done = false;
    const finish = (save)=>{
      if(done) return; done = true;
      const v = String(ta.value||'').trim();
      if(save && v){
        state.outline = state.outline || {};
        if(v !== state.outline.logline){ state.outline.logline = v; if(typeof persist==='function') persist(); toast('小说简介已更新'); }
      }
      if(typeof render==='function') render();
    };
    ta.onblur = ()=>finish(true);
    ta.onkeydown = (ev)=>{
      if(ev.key==='Escape'){ ev.preventDefault(); ta.onblur=null; finish(false); }
      else if(ev.key==='Enter' && (ev.ctrlKey||ev.metaKey)){ ev.preventDefault(); ta.onblur=null; finish(true); }
    };
  };
}



  const api = {
    beatStructureCardHtml,
    beatStageNames,
    beatStageDuties,
    factCardHtml,
    bindFactCard,
    updateFactCardFromChapter,
    rollingSummaryCardHtml,
    bindRollingSummaryCard,
    qualityReportCardHtml,
    bindQualityReportCard,
    formatRelevantGlossaryHtml,
    fixQueueCardHtml,
    bindFixQueueCard,
    syncOrigIdeaCard,
    origIdeaCard,
    bindOrigIdea,
    bindOutlineFold,
    bindLoglineEdit,
    bindAiRecipe,
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['story-viewer'] = Object.freeze(api);
  return ns['story-viewer'];
}
