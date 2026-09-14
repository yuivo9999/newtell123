/* v30: cohesive legacy region — 章节历史 / 阅读器 / 阅读进度. */

export function install(deps){
  const {
    CH_PAGE_SIZE,
    chPage,
    chapterBadgesHtml,
    countWords,
    esc,
    isLong,
    lib,
    persist,
    readerCur,
    state,
    toast,
    wcBadge,
    wcInner,
  } = deps;



function ensureChapterHistory(i){
  const c = state.chapters[i]; if(!c) return c;
  if(!Array.isArray(c.history)) c.history = [];
  return c;
}


function snapshotChapterVersion(i){
  const c = ensureChapterHistory(i); if(!c) return;
  const cur = c.content;
  if(cur && String(cur).trim()) c.history.push({ content: cur, ts: Date.now() });
  if(c.history.length > 50) c.history.splice(0, c.history.length - 50); // 上限50防膨胀
}


function chVersions(i){ const c=ensureChapterHistory(i); return c? c.history : []; }


function hasChVersions(i){ return chVersions(i).length > 0; }



function hasEditHistory(i){ const c=state.chapters[i]; return !!(c && Array.isArray(c.editHistory) && c.editHistory.length); }


function undoChapterEdit(i){
  const c = state.chapters[i];
  if(!c || !Array.isArray(c.editHistory) || !c.editHistory.length){ toast('没有可撤销的编辑'); return; }
  c.content = c.editHistory.pop();
  persist(); renderChapters(); updateWcTotal();
  toast('已撤销一次编辑');
}



function openChapterVersionPanel(i){
  closeChapterVersionPanel();
  const c = ensureChapterHistory(i); if(!c) return;
  const title = c.title || ('第'+(i+1)+'章');
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const cur = String(c.content||'');
  const hist = c.history;
  const rows = hist.map((v,origIdx)=>`
    <div class="cv-row">
      <div class="cv-meta"><span class="cv-time">${fmtTs(v.ts)}</span><span class="cv-wc">${(v.content||'').length} 字</span></div>
      <div class="cv-actions">
        <button type="button" class="btn ghost cv-b" data-cv-prev="${origIdx}">预览</button>
        <button type="button" class="btn ghost cv-b" data-cv-restore="${origIdx}">↩ 恢复</button>
      </div>
    </div>`).join('');
  const ov = document.createElement('div'); ov.id='cvPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📚 版本历史 · 第${i+1}章「${esc(cleanChapterTitle(title))}」</b>
        <button class="gs-x" data-cv-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-row cur"><div class="cv-meta"><span class="cv-time">当前版本</span><span class="cv-wc">${cur.length} 字</span></div></div>
        ${hist.length? `<div class="cv-div">历史版本（点「恢复」回到该版；恢复前会先把当前正文存为新的历史版本）</div>${rows}`
        : '<p class="muted cv-empty">暂无历史版本。当章节被重生成时，旧正文会自动存档在这里，供你随时回退。</p>'}
        <div class="cv-preview hidden" id="cvPreview">
          <div class="cv-prev-head"><b id="cvPrevTitle">版本预览</b><button class="gs-x" data-cv-prev-close>✕</button></div>
          <div class="cv-pre" id="cvReader"></div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-cv-close]').onclick = closeChapterVersionPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeChapterVersionPanel(); });
  ov.addEventListener('click', e=>{
    const p = e.target.closest('[data-cv-prev]'); if(!p) return;
    const v = hist[+p.dataset.cvPrev]; if(!v) return;
    const pr=$('#cvPreview'), rd=$('#cvReader'), pt=$('#cvPrevTitle');
    if(pr && rd){ pt.textContent = '预览 · 历史版本（'+fmtTs(v.ts)+'）'; rd.textContent = v.content||'（空）'; pr.classList.remove('hidden'); }
  });
  ov.querySelector('[data-cv-prev-close]').onclick = ()=>{ const pr=$('#cvPreview'); if(pr) pr.classList.add('hidden'); };
  ov.addEventListener('click', e=>{
    const rb = e.target.closest('[data-cv-restore]'); if(!rb) return;
    const v = hist[+rb.dataset.cvRestore]; if(!v) return;
    if(!window.confirm('恢复该历史版本将覆盖当前正文。\n\n（当前正文会自动保存为一条新的历史版本，不会被删除。）\n确定恢复吗？')) return;
    snapshotChapterVersion(i);                  // 先把当前正文存历史
    c.content = v.content;                      // 用历史版覆盖当前
    c.history.splice(+rb.dataset.cvRestore, 1);
    persist(); closeChapterVersionPanel(); renderChapters();
    toast('已恢复历史版本');
  });
}


function closeChapterVersionPanel(){ const p=$('#cvPanel'); if(p) p.remove(); }


function chCardHtml(c, i){
  const hasC = !!(c.content && c.content.trim());
  const planGi = chapterOfPlan(i);
  const planBtn = planGi >= 0 ? `<button class="btn ghost" data-plan-ch="${i}" data-plan-gi="${planGi}" title="查看本章教案（老师${planGi+1}）">📖 教案</button>` : '';
  return `<div class="card ch-card" data-ch-card="${i}" style="background:var(--panel);border:1px solid var(--line)">
        <div class="ch-head" data-fold="${i}" role="button" tabindex="0" aria-expanded="true">
          <span class="ch-fold-ico">▾</span>
          <h3 style="margin:0;flex:1;word-break:break-word;line-height:1.35" title="第${i+1}章 · ${esc(cleanChapterTitle(c.title))}">第${i+1}章 · ${esc(cleanChapterTitle(c.title))}${c._titleByAI?'<i class="tbd-title-tag" style="font-style:normal;font-size:11px;font-weight:400;opacity:.55;margin-left:6px" title="本章标题已由章节正文 AI 定稿">正文定稿</i>':(!state.plannerFinalized?'<i class="tbd-title-tag" style="font-style:normal;font-size:11px;font-weight:400;opacity:.55;margin-left:6px" title="标题尚未由全书规划师定稿，当前沿用第二步参考稿">参考稿</i>':'')}</h3>
          ${wcBadge(c.content, `data-wc-ch="${i}"`)}
        </div>
        <div class="ch-meta ch-status-wrap" data-ch-status="${i}">${chapterBadgesHtml(i)}</div>
        <div class="ch-body">
          <textarea data-ch="${i}" class="${hasC?'':'ch-ta-empty'}" style="margin-top:8px" ${hasC?'':'placeholder="暂无正文：点击「🔄 重生成」生成，或直接在此输入"'}>${esc(c.content)}</textarea>
          <div class="btn-row">
            <button class="btn ghost" data-regen="${i}" ${state.generating?'disabled':''}>🔄 重生成</button>
            ${planBtn}
            <button class="btn ghost" data-read="${i}">📖 阅读</button>
            <button class="btn ghost" data-ch-sum="${i}" title="生成本章速读梗概（本章正文压缩至约 1/3，省时阅读）" ${hasC?'':'disabled'}>🏮 本章梗概</button>
            ${hasChVersions(i)?`<button class="btn ghost" data-ver="${i}">📚 版本(${chVersions(i).length})</button>`:''}
            ${hasEditHistory(i)?`<button class="btn ghost" data-undo="${i}" title="撤销最近一次手动编辑">↩ 撤销编辑</button>`:''}
          </div>
        </div>
      </div>`;
}


function renderChapters(){
  const wrap = $('#chaptersWrap'); if(!wrap) return;
  const total = state.chapters.length;
  if(isLong()){
    if(!total){
      if(state.outline && Array.isArray(state.outline.chapters) && state.outline.chapters.length && syncChaptersFromOutline()){
        persist();
        return renderChapters();
      }
      const wantN = chapterCountVal();
      if(wantN > 0){
        state.chapters = Array.from({length: wantN}, (_,k)=>({
          num: k+1,
          title: (state.outline && state.outline.chapters && state.outline.chapters[k] && state.outline.chapters[k].title) || `第${k+1}章`,
          content: '',
          confirmed: true,
          beat: (state.outline && state.outline.chapters && state.outline.chapters[k] && state.outline.chapters[k].beat) || ''
        }));
        persist();
        return renderChapters();
      }
      wrap.innerHTML = `<div class="ch-pager"><span class="muted">共 0 章：先在第②步生成大纲。</span></div>`;
      return;
    }
    const maxPage = Math.max(0, Math.ceil(total / CH_PAGE_SIZE) - 1);
    if(chPage > maxPage) chPage = maxPage;
    const from = chPage * CH_PAGE_SIZE;
    const slice = state.chapters.slice(from, from + CH_PAGE_SIZE);
    const html = slice.map((c,offset)=> chCardHtml(c, from + offset)).join('');
    const pageCount = Math.max(1, Math.ceil(total / CH_PAGE_SIZE));
    const pages = Array.from({length:pageCount},(_,p)=>p)
      .map(p=>`<button type="button" class="ch-page${p===chPage?' active':''}" data-page="${p}">${p+1}</button>`).join('');
    wrap.innerHTML = `<div class="ch-pager"><span class="muted">第 ${from+1}–${from+slice.length} 章 / 共 ${total} 章</span>${pages}</div>
      ${html}
      <div class="ch-pager">${pages}</div>`;
  } else {
    wrap.innerHTML = state.chapters.map((c,i)=>`
      <div class="card ch-card" data-ch-card="${i}" style="background:var(--panel);border:1px solid var(--line)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
         <div style="display:flex;align-items:center;gap:8px;min-width:0">
  <h3 style="margin:0;word-break:break-word;line-height:1.35" title="第${i+1}章 · ${esc(cleanChapterTitle(c.title))}">第${i+1}章 · ${esc(cleanChapterTitle(c.title))}</h3>
  <button class="btn ghost" data-ver="${i}" style="padding:2px 6px;font-size:11px;flex-shrink:0" title="版本历史">📚 ${chVersions(i).length}</button>
  ${wcBadge(c.content, `data-wc-ch="${i}"`)}
</div>
<span class="pill ${c.confirmed?'tag-ok':'tag-warn'}">${c.confirmed?'✓ 已确认':'待确认'}</span>
        </div>
        <textarea data-ch="${i}" style="margin-top:8px">${esc(c.content)}</textarea>
        <div class="btn-row">
          <button class="btn ghost" data-regen="${i}">🔄 重生成</button>
          <button class="btn ghost" data-read="${i}">📖 阅读</button>
          <button class="btn ghost" data-ch-sum="${i}" title="生成本章速读梗概（本章正文压缩至约 1/3，省时阅读）" ${c.content&&String(c.content).trim()?'':'disabled'}>🏮 本章梗概</button>
        
          ${hasEditHistory(i)?`<button class="btn ghost" data-undo="${i}" title="撤销最近一次手动编辑">↩ 撤销编辑</button>`:''}
          <button class="btn ghost" data-toggle="${i}">${c.confirmed?'↺ 取消确认':'✓ 标记已确认'}</button>
        </div>
      </div>`).join('');
  }
}


function renderToc(current){
  const list = $('#tocList'); if(!list) return;
  const total = state.chapters.length;
  const cn = $('#tocCount'); if(cn) cn.textContent = total;
  list.innerHTML = state.chapters.map((c,i)=>{
    const active = i === current ? ' active' : '';
    const done = c.content && c.content.trim() ? ' done' : '';
    return `<button type="button" class="toc-item${active}${done}" data-toc="${i}"><span class="toc-idx">${i+1}</span><span class="toc-t">${esc(cleanChapterTitle(c.title)||('第'+(i+1)+'章'))}</span></button>`;
  }).join('');
}


function toCnNum(n){
  const cn=['零','一','二','三','四','五','六','七','八','九'];
  if(n < 10) return cn[n];
  if(n < 20) return '十' + (n%10 ? cn[n%10] : '');
  if(n < 100){ const t=Math.floor(n/10), u=n%10; return cn[t]+'十'+(u?cn[u]:''); }
  if(n < 1000){ const h=Math.floor(n/100), r=n%100; return cn[h]+'百'+(r? (r<10?'零'+cn[r] : toCnNum(r)) : ''); }
  return String(n);
}


function cleanChapterTitle(title){
  if(!title) return '';
  let t = String(title).trim();
  t = t.replace(/^(第\s*[0-9一二三四五六七八九十百千两0-9]+\s*章|[一二三四五六七八九十百千]+章)(\s*[·、：:．.，,，\-–—]\s*|\s*)/,'');
  return t.trim();
}


function openReader(i){
  const c = state.chapters[i]; if(!c) return;
  const ov = $('#readerOverlay'); if(!ov) return;
  $('#readerTitle').textContent = `第${toCnNum(i+1)}章 · ${cleanChapterTitle(c.title)}`;
  const _readerClean = splitChapterCastout(c.content||'');
  if(_readerClean.body !== String(c.content||'').trim() || (_readerClean.castOut && _readerClean.castOut !== String(c.castOut||''))){
    c.content = _readerClean.body;
    if(_readerClean.castOut) c.castOut = _readerClean.castOut;
    persist();
  }
  const paras = String(_readerClean.body||'').split(/\n+/).map(p=>p.trim()).filter(Boolean);
  let fallback = `<p class="muted">（本章尚未生成正文）</p>`;
  const csum = (state.chapters[i] && state.chapters[i].strip) ? String(state.chapters[i].strip).trim() : '';
  if(csum) fallback = `<p class="muted">🗂 本章梗概：${esc(csum)}</p>
    <p class="muted" style="margin-top:6px">生成正文后将在此展示全文。可用下方「重生成」或「一键批量生成」补写。</p>`;
  $('#readerBody').innerHTML = paras.length ? paras.map(p=>`<p>${esc(p)}</p>`).join('') : fallback;
  renderToc(i);
  readerCur = i;
  randomizeReaderGradient();
  ov.classList.remove('hidden');
  document.body.classList.add('reader-lock'); // 锁定背景滚动
  const body0 = $('#readerBody');
  if(body0) body0.scrollTop = 0;
  updateReaderProgress();
  try{
    const rp = JSON.parse(localStorage.getItem(nsKey('rp_') + (lib.curId||'x') + '_' + i) || 'null');
    if(rp && rp.top){
      requestAnimationFrame(()=>{ const b=$('#readerBody'); if(b) b.scrollTop = rp.top; updateReaderProgress(); });
    }
  }catch(e){}
}


function bindReaderScrollSave(){
  const b = $('#readerBody'); if(!b || b.dataset.rpBound) return;
  b.dataset.rpBound = '1';
  let _t = null;
  b.addEventListener('scroll', ()=>{
    if(_t) return;
    _t = setTimeout(()=>{
      _t = null;
      try{
        localStorage.setItem(nsKey('rp_') + (lib.curId||'x') + '_' + readerCur, JSON.stringify({ top: b.scrollTop }));
      }catch(e){}
      updateReaderProgress();
    }, 400);
  }, {passive:true});
}


function updateReaderProgress(){
  const b = $('#readerBody'), fill = $('#readerProgressFill'), tip = $('#readerPctTip');
  if(!b || !fill) return;
  const max = b.scrollHeight - b.clientHeight;
  const p = max>0 ? Math.min(100, Math.max(0, Math.round(b.scrollTop/max*100))) : 0;
  fill.style.width = p+'%';
  if(tip){
    const paras = b.querySelectorAll('p').length;
    tip.innerHTML = `第 <b>${p}%</b> · 全文 <b>${paras}</b> 段`;
  }
}


function randomizeReaderGradient(){
  const fill = $('#readerProgressFill'); if(!fill) return;
  const h1 = Math.floor(Math.random()*360);
  const h2 = (h1 + 40 + Math.floor(Math.random()*140)) % 360;   // 色相差 40°~180°
  fill.style.setProperty('background', `linear-gradient(90deg, hsl(${h1} 78% 62%), hsl(${h2} 78% 62%))`, 'important');
}


function closeReader(){
  const ov = $('#readerOverlay'); if(!ov) return;
  ov.classList.add('hidden');
  if(ov.dataset.exportReader === '1'){
    delete ov.dataset.exportReader;
    const tocBtn = $('#readerTocBtn'); if(tocBtn) tocBtn.style.display = '';
    const synBtn = $('#readerSynBtn'); if(synBtn) synBtn.style.display = '';
  }
  const toc = $('#readerToc'); if(toc) toc.classList.add('hidden');
  document.body.classList.remove('reader-lock');
}


function bindReader(){
  const ov = $('#readerOverlay'); if(!ov) return;
  bindReaderScrollSave();
  $$('[data-reader-close]', ov).forEach(el=> el.onclick = (e)=>{
    if(e.target.closest('.reader-panel') && !e.target.closest('.reader-close')) return;
    closeReader();
  });
  const tocBtn = $('#readerTocBtn'); const toc = $('#readerToc');
  if(tocBtn && toc){
    tocBtn.onclick = (e)=>{ e.stopPropagation(); const show = toc.classList.toggle('hidden'); tocBtn.classList.toggle('on', !show); };
  }
  const tocClose = $('#tocClose');
  if(tocClose && toc) tocClose.onclick = (e)=>{ e.stopPropagation(); toc.classList.add('hidden'); if(tocBtn) tocBtn.classList.remove('on'); };
  const panel = ov.querySelector('.reader-panel');
  if(panel && toc && tocBtn){
    panel.addEventListener('click', (e)=>{
      if(toc.classList.contains('hidden')) return;      // 目录已收起，无需处理
      if(e.target.closest('#readerToc')) return;        // 点目录内部不收起
      if(e.target.closest('#readerTocBtn')) return;     // 点目录开关不收起（交由自身 toggle）
      toc.classList.add('hidden');
      tocBtn.classList.remove('on');
    });
  }
  const list = $('#tocList');
  if(list && toc) list.onclick = (e)=>{
    const item = e.target.closest('[data-toc]'); if(!item) return;
    openReader(+item.dataset.toc);
  };
  const synBtn = $('#readerSynBtn'), synPop = $('#readerSynPop'), synCard = $('#readerSynCard');
  if(synBtn && synPop && synCard){
    synBtn.onclick = (e)=>{
      e.stopPropagation();
      const o = state.outline || {};
      const ch = (Array.isArray(state.chapters) && state.chapters[readerCur]) ? state.chapters[readerCur] : null;
      const strip = ch && String(ch.strip||'').trim();
      const plans = Array.isArray(o.chapterPlans) ? o.chapterPlans : [];
      const plan = plans[readerCur];
      const btTxt = (plan && typeof plan.beatsText === 'string' && plan.beatsText.trim()) ? plan.beatsText.trim() : '';
      const SEC_NAMES = ['承接点','承接','场景链与切换','场景链','逐拍推进','情绪弧','心情弧','情绪基调','必须使用实体','必须实体','出场实体','埋设伏笔','收束设计','收束','设定'];
      const secOf = (name, alias)=>{
        const lines = btTxt.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
        const re = new RegExp('^(?:'+(alias?name+'|'+alias:name)+')[：:\\s]*(.*)$');
        for(let i=0;i<lines.length;i++){
          const m = lines[i].match(re);
          if(!m) continue;
          const buf = [(m[1]||'').trim()].filter(Boolean);
          for(let j=i+1;j<lines.length;j++){
            if(SEC_NAMES.some(n=>new RegExp('^(?:'+n+')[：:\\s]').test(lines[j]))) break;   // 下一小节标题即止
            buf.push(lines[j]);
          }
          const v = buf.join('；').replace(/\s+/g,' ').trim();
          if(v) return v.slice(0, 200);
        }
        return null;
      };
      let title, body;
      const _lesson = teacherChapterPlan ? teacherChapterPlan(readerCur) : null;
      if(_lesson && String(_lesson).trim()){
        title = `第${toCnNum(readerCur+1)}章 · 本章教案`;
        body = `<div class="syn-body"><div style="font-size:12px;color:var(--muted);margin-bottom:6px">🎓 老师教案（本章正文的唯一权威内容体）· 原始稿：</div><pre class="sc-plan-raw">${esc(_lesson)}</pre></div>`;
      } else if(btTxt){
        const cj = secOf('承接点','承接'); const ss = secOf('收束设计','收束');
        const _te = _timelineEssenceOf((Array.isArray(o.chapterPlans)?o.chapterPlans[readerCur]:null));
        title = `第${toCnNum(readerCur+1)}章 · 本章概览`;
        body = `<div class="syn-body rb-overview">
          ${_te?`<div class="rb-ov-sec"><b class="rb-ov-lb">⏱ 时间线要点（将注入全书时间线）</b><div>${esc(_te)}</div></div>`:''}
          ${cj||ss?`<div class="rb-ov-sec"><b class="rb-ov-lb">承接点</b><div>${cj?esc(cj):'<span class="muted">（本章编排未单列承接点）</span>'}</div></div>
          ${ss?`<div class="rb-ov-sec"><b class="rb-ov-lb">收束设计</b><div>${esc(ss)}</div></div>`:''}`:`<div class="rb-ov-sec"><b class="rb-ov-lb">本章编排</b><div>${esc(clipText(btTxt, 180))}</div></div>`}
        </div>`;
      } else if(strip){
        title = `第${toCnNum(readerCur+1)}章 · 本章梗概`;
        body = `<div class="syn-body">${esc(strip)}</div>`;
      } else {
        title = `第${toCnNum(readerCur+1)}章 · 节拍表`;
        body = `<div class="syn-body muted">本章暂无节拍表：请先在「全书规划师」生成①节拍表。</div>`;
      }
      synCard.innerHTML = `<h4>${title}</h4>${body}`;
      synPop.classList.remove('hidden');
    };
    synPop.onclick = (e)=>{ if(e.target === synPop) synPop.classList.add('hidden'); };  // 点遮罩关闭
  }
}



function updateChapterWc(i, text){
  const el = $('[data-wc-ch="'+i+'"]');
  if(!el) return;
  const w = countWords(text);
  el.innerHTML = wcInner(w);
  el.title = `中文 ${w.cjk} 字 · 英文 ${w.en} 词`;
}


function updateWcTotal(){
  const el = $('#wcTotal'); if(!el) return;
  const chapters = state.chapters.filter(c=> c.content && c.content.trim());
  if(!chapters.length){ el.classList.add('hidden'); el.innerHTML=''; return; }
  let total=0, cjk=0, en=0;
  chapters.forEach(c=>{ const w = countWords(c.content); total+=w.total; cjk+=w.cjk; en+=w.en; });
  const fmt = n=> n.toLocaleString('en-US');
  el.classList.remove('hidden');
  el.innerHTML = `<span class="inner">📚 小说内容总字数 <b>${fmt(total)}</b> <span class="brk">（中 ${fmt(cjk)} · 英 ${en}）</span></span>`;
}



function renderLongProgress(){
  const el = $('.long-progress'); if(!el) return;
  const done = state.chapters.filter(c=> c.content && c.content.trim()).length;
  const total = state.chapters.length;
  let chars = 0; state.chapters.forEach(c=> chars += countWords(c.content).total);
  const cap = total ? `全书 ${total} 章` : (chapterCountVal() ? `全书 ${chapterCountVal()} 章` : '');
  el.innerHTML = `<span class="pill">写作进度：${done}/${total} 章</span> <span class="pill">已写约 ${chars.toLocaleString('en-US')} 字${cap ? ' · '+cap : ''}</span>`;
}

  const api = {
    ensureChapterHistory,
    snapshotChapterVersion,
    chVersions,
    hasChVersions,
    hasEditHistory,
    undoChapterEdit,
    openChapterVersionPanel,
    closeChapterVersionPanel,
    chCardHtml,
    renderChapters,
    renderToc,
    toCnNum,
    cleanChapterTitle,
    openReader,
    bindReaderScrollSave,
    updateReaderProgress,
    randomizeReaderGradient,
    closeReader,
    bindReader,
    updateChapterWc,
    updateWcTotal,
    renderLongProgress,
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['chapter-reader-history'] = Object.freeze(api);
  return ns['chapter-reader-history'];
}
