/* v30: cohesive legacy region — 章节摘要 / 重生成 / AI 建议 / 对比工作区. */

export function install(deps){
  let {
    PROMPTS,
    USER_PRIO_BILL,
    _abortBtn,
    _abortCtl,
    _dictRedlineOver,
    addAdvHist,
    aiAdviceCand,
    aiHistEntryId,
    autoUpdateSubplots,
    autoUpdateTimeAnchors,
    buildAIPrompt,
    busy,
    callDeepSeek,
    chState,
    chVersions,
    chapterStyleNote,
    cleanChapterTitle,
    closeChapterSummaryPanel,
    copyText,
    countWords,
    curWriteStyle,
    currentIsDeepSeek,
    ensureChapterHistory,
    esc,
    genBatchN,
    getSystemPrompt,
    hasEditHistory,
    hideStopBtn,
    isLong,
    longChapterSys,
    makeStopBtn,
    markAIRunning,
    openAdvHistPanel,
    parseAiJsonList,
    persist,
    refreshAdvHistBadge,
    remainingEmptyChapters,
    renderChapters,
    renderNarrativeEngineMenu,
    resolveActiveSpec,
    snapshotChapterVersion,
    state,
    toast,
    toggleWriteTag,
    updateFactCardFromChapter,
    updateWcTotal,
    validateStripLen,
    wcBadge,
    writeStyleById,
    writeStyleChipsHtml,
    wsColorSchemeId,
  } = deps;



function densityCheck(body, summary, o, i){
  const g = (o && o.glossary) || {};
  const seed = [];
  (g.characters||[]).forEach(x=>{ if(x&&x.name) seed.push({n:''+x.name,t:'人物'}); });
  (g.places||[]).forEach(x=>{ if(x&&x.name) seed.push({n:''+x.name,t:'地名'}); });
  (g.propernouns||[]).forEach(x=>{ if(x&&x.name) seed.push({n:''+x.name,t:'专名'}); });
  const miss = [], seen = new Set();
  seed.forEach(it=>{
    const nm = it.n.trim(); if(!nm || seen.has(nm)) return; seen.add(nm);
    if(body.indexOf(nm)>=0 && summary.indexOf(nm)<0) miss.push(it);
  });
  return miss;
}



function renderChapterSummaryBody(i, miss){
  const c = state.chapters[i]; if(!c) return;
  const has = c.strip && String(c.strip).trim();
  const box = document.getElementById('chSumBody'); if(!box) return;
  const missHtml = (Array.isArray(miss) && miss.length)
    ? `<p class="strip-warn">⚠️ 密度自检：本段未覆盖「${miss.slice(0,4).map(m=>m.t+'：'+m.n).join('、')}」${miss.length>4?` 等 ${miss.length} 项`:''}，建议<b>重新生成</b>；若持续报警，可将「本章梗概」温度下调到 0.7–0.9 提升忠实度。</p>` : '';
  box.innerHTML = has
    ? `<article class="strip-read"><h3>🏮 速读 · 本章梗概</h3>${esc(String(c.strip).trim())}</article>
       ${missHtml}
       <p class="hint" style="margin:6px 0 0">已生成（把本章正文压缩到约 1/3 的省时读物，只读它也能抓住本章精华不丢信息）。速读偏低保真，可下调「本章梗概」温度至 0.7–0.9 提升忠实度。</p>`
    : `<article class="strip-read"><h3>🏮 速读 · 本章梗概</h3>
        <p class="muted" style="text-indent:0">暂无本章梗概。它是把<b>本章正文压缩到约 1/3</b>的省时读物：没耐心读完全文时，读它即可抓住本章精华、不丢失关键信息。基于本章真实正文生成（&lt;900 字的极短章不作压缩，直接呈现全文）。</p></article>`;
  const g = document.getElementById('chSumGen'); if(g) g.innerHTML = has ? '🔄 重新生成本章梗概' : '✨ 生成本章梗概';
  const c2 = document.getElementById('chSumCopy'); if(c2) c2.style.display = has ? '' : 'none';
}



async function chSumGenerate(i, genBtn){
  const c = state.chapters[i]; if(!c) return;
  const o = state.outline || {};
  const body = String(c.content||'').trim();
  if(!body){ toast('本章尚无正文，请先生成正文再生成本章梗概'); return; }
  const L = body.length;
  if(L < 900){
    c.strip = body;
    if(o.chapters && o.chapters[i]) o.chapters[i].strip = body;
    persist();
    renderChapterSummaryBody(i);
    toast('本章为极短章，已直接采用全文作速读梗概');
    return;
  }
  if(genBtn){ genBtn.disabled = true; busy(genBtn,true,'生成中…'); }
  const title = c.title || ((o.chapters&&o.chapters[i]&&o.chapters[i].title)) || ('第'+(i+1)+'章');
  const target = (L<=1200) ? Math.max(200, Math.round(L/3)) : Math.round(L/3);
  const lo = Math.round(target*0.9), hi = Math.round(target*1.1);
  const sys = getSystemPrompt('strip', { targetZhs: target });
  const user = buildAIPrompt('strip', { idx: i, targetZhs: target });
  try{
    const txt = unwrapAIResult(await callDeepSeek(sys, user, {temperature: resolveActiveSpec().stripTemp, topP: 0.5, signal: _abortCtl?.signal, maxTokens: clampMaxTokens('strip'), taskKey:'strip'}));
    let strip = String(txt||'').trim();
    if(!strip){ toast('未生成到本章梗概'); return; }
    strip = strip.replace(/^```[\s\S]*?\n/, '').replace(/\n```\s*$/,'').trim();   // 去 markdown 代码块围栏
    const _slm = strip.match(/<!--\s*STRIP_LEN:\s*(\d+)\s*-->/);
    const _stripRep = validateStripLen(strip, target);
    if(!_stripRep.ok){
      const _auto = _slm ? +_slm[1] : null;
      console.warn('[梗概] 字数未达标（不阻断）：', _stripRep.len, '目标', target, '区间', _stripRep.lo, '-', _stripRep.hi, _auto!==null ? `（AI 自报 ${_auto}）` : '');
      toast(`⚠️ 梗概 ${_auto!==null?_auto:_stripRep.len} 字，目标区间 ${_stripRep.lo}—${_stripRep.hi} 字`);
    }
    c.strip = strip;
    if(o.chapters && o.chapters[i]) o.chapters[i].strip = strip;
    persist();
    const miss = densityCheck(body, strip, o, i);   // 密度自检
    renderChapterSummaryBody(i, miss);
    if(miss.length){ toast(`⚠️ 密度自检：本段未覆盖 ${miss.slice(0,3).map(m=>m.t+'「'+m.n+'」').join('、')}${miss.length>3?' 等':''}，建议重生成或下调本章梗概温度至 0.7–0.9`); }
    else { toast('本章梗概已生成'); }
  }catch(e){
    if(e.name==='AbortError'){ toast('已停止生成本章梗概'); }
    else { toast('生成本章梗概失败：'+e.message); }
  }finally{
    if(genBtn){ genBtn.disabled = false; busy(genBtn,false); }
  }
}



function openChapterSummaryPanel(i){
  closeChapterSummaryPanel();
  const c = state.chapters[i]; if(!c) return;
  const title = cleanChapterTitle(c.title || ('第'+(i+1)+'章'));
  const has = !!(c.content && String(c.content).trim());
  const ov = document.createElement('div'); ov.id='chSumPanel'; ov.className='gs-overlay';
  ov.innerHTML = `<div class="gs-modal" style="max-width:780px">
    <div class="gs-modal-head"><b>🏮 速读 · 本章梗概 · 第${i+1}章「${esc(title)}」</b>
      <span style="display:flex;gap:6px">
        <button type="button" class="btn small ghost" id="chSumCopy" title="复制本章梗概文本">📋 复制</button>
        <button type="button" class="gs-x" data-chsum-close>✕</button>
      </span></div>
    <div class="cv-body">
      <div id="chSumBody"></div>
      <div class="advice-ai-row" style="margin-top:12px">
        <button type="button" class="ct-rtgen" id="chSumGen" ${has?'':'disabled'}>✨ 生成本章梗概</button>
      </div>
    </div></div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-chsum-close]').onclick = closeChapterSummaryPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeChapterSummaryPanel(); });
  ov.querySelector('#chSumGen').onclick = ()=> chSumGenerate(i, ov.querySelector('#chSumGen'));
  ov.querySelector('#chSumCopy').onclick = ()=>{ const s=(c.strip||'').trim(); if(s) copyText(s); };
  renderChapterSummaryBody(i);
}



function adherenceHint(a){
  if(a>=100) return '铁律：人名/地名/专名必须逐字沿用，禁止改拼写，仅按新大纲补新角色。';
  if(a>=80)  return '基准：尽量沿用，允许个别因新情节小幅调整。';
  if(a>=60)  return '主要参照：核心角色沿用，地名/专名可按新剧情调整。';
  if(a>=30)  return '灵感来源：可大改人名地名，仅保留题材与语感。';
  return '几乎放弃：仅作背景语感参考，允许完全重新构建设定。';
}


function buildChapterUser(i, opt={}){
  const o = state.outline || {};
  const chap = (state.chapters && state.chapters[i]) || {};
  const parts = buildChapterOpeningContext(i);
  const card = chapterPlanAuthority(i);
  const lesson = card?.raw || teacherChapterPlan(i);

  if(lesson){
    const closed = buildClosedChapterContext(i, chap, o);
    parts.push(...closed.parts);
    parts.push(buildChapterBoundaryContext(i, o, closed.hasT));
  } else {
    parts.push(...buildLegacyChapterContext(i, chap, o, card));
  }

  parts.push(...buildChapterStateContext(i));
  parts.push(`【事件可达性硬门】写每个重大事件前，内部快速核对：前置状态是否已成立？触发线索是否存在？人物为什么会采取这一步？信息/道具/能力从哪里来？地点与时间是否可达？本事件是否会让前后因果断裂？若任一关键项缺失，不得用“突然/恰好/偶然”直接补过去。`);
  if(isLong() && !chapterPlanAuthority(i)){ throw new Error('当前章节教案版本已失效：请重新完成对应老师备课后再写正文。'); }
  parts.push(USER_PRIO_BILL);
  if(opt.advice) parts.push(`【人工干预要求（用户指定 · 第二优先）】\n${opt.advice}`);
  parts.push(buildChapterLengthContext());

  _dictRedlineOver = false;
  const _b = budgetChapterContext(parts, 24000);
  _dictRedlineOver = !!_b.overflow;
  if(_dictRedlineOver){ setTimeout(()=>toast('当前上下文超出建议预算，若频繁出现请提高输出上限。'), 0); }
  return _b.parts.join('\n\n');
}



function adoptChapterPartial(i){
  const p = String((state._chapterPartial||{})[i]||'').trim();
  if(!p){ toast('本章暂无已缓存文本'); return; }
  snapshotChapterVersion(i);
  state.chapters[i].content = p;
  delete state._chapterPartial[i];
  chState[i] = 'done';
  persist(); patchChapter(i);
  toast(`第 ${i+1} 章已采用已生成部分（${countWords(p).total.toLocaleString()} 字）`);
}



function chapterBadgesHtml(i){
  const c = state.chapters[i] || {};
  const hasC = !!(c.content && String(c.content).trim());
  const partial = state._chapterPartial && state._chapterPartial[i];
  const partialW = partial ? countWords(String(partial).trim()).total : 0;
  const parts = [];
  if(chState[i]==='error'){
    parts.push(`<span class="pill tag-warn" data-ch-state>⚠️ 生成失败</span>`);
  } else if(hasC){
    parts.push(`<span class="pill tag-ok" data-ch-state>✓ 已确认</span>`);
  } else {
    parts.push(`<span class="pill tag-warn" data-ch-state>未生成</span>`);
  }
  if(partialW>=50 && chState[i]!=='generating'){
    parts.push(`<button class="btn small primary" data-ne-resume-ch="${i}" title="利用已缓存的 ${partialW.toLocaleString()} 字继续生成">▶️ 继续生成</button>`);
    parts.push(`<button class="btn small ghost" data-ne-partial-adopt="${i}" title="直接把已缓存的 ${partialW.toLocaleString()} 字作为本章正文（不再续写）">⬇ 采用已生成部分</button>`);
  }
  return parts.join('');
}



function patchChapter(i){
  const card = document.querySelector('.ch-card[data-ch-card="'+i+'"]');
  if(!card) return;               // 该章不在当前页渲染范围，跳过 DOM（数据已落库，翻页即见）
  const wc = card.querySelector('[data-wc-ch="'+i+'"]');
  if(wc) wc.innerHTML = wcBadge(state.chapters[i].content, `data-wc-ch="${i}"`);
  const statusWrap = card.querySelector('.ch-status-wrap[data-ch-status="'+i+'"]');
  if(statusWrap) statusWrap.innerHTML = chapterBadgesHtml(i);
  const hasC = !!(state.chapters[i].content && state.chapters[i].content.trim());
  const body = card.querySelector('.ch-body');
  const ta = card.querySelector('textarea[data-ch="'+i+'"]');
  if(ta && !ta.matches(':focus')) ta.value = state.chapters[i].content;
  if(body && body.classList.contains('folded') && hasC){ body.classList.remove('folded'); }
  const ico = card.querySelector('.ch-fold-ico'); if(ico) ico.textContent = (body && body.classList.contains('folded')) ? '▸' : '▾';
  const re = card.querySelector('[data-regen="'+i+'"]');
  if(re){ re.disabled = !!state.generating; }
  const sum = card.querySelector('[data-ch-sum="'+i+'"]');
  if(sum){ sum.disabled = !hasC; }
  const ver = card.querySelector('[data-ver="'+i+'"]');
  if(ver){ ver.textContent = '📚 版本('+chVersions(i).length+')'; }
  const undo = card.querySelector('[data-undo="'+i+'"]');
  if(undo){ undo.style.display = hasEditHistory(i) ? '' : 'none'; }
  if(isLong() && state.chapters[i]){
    const h3 = card.querySelector('.ch-head h3');
    if(h3){
      const c = state.chapters[i];
      const titleTxt = `第${i+1}章 · ${esc(cleanChapterTitle(c.title))}`;
      h3.title = titleTxt;
      let badgeHtml = '';
      if(c._titleByAI){
        badgeHtml = '<i class="tbd-title-tag" style="font-style:normal;font-size:11px;font-weight:400;opacity:.55;margin-left:6px" title="本章标题已由章节正文 AI 定稿">正文定稿</i>';
      } else if(!state.plannerFinalized){
        badgeHtml = '<i class="tbd-title-tag" style="font-style:normal;font-size:11px;font-weight:400;opacity:.55;margin-left:6px" title="标题尚未由全书规划师定稿，当前沿用第二步参考稿">参考稿</i>';
      }
      h3.innerHTML = titleTxt + badgeHtml;
    }
  }
}



function openChapterRegenPanel(i){
  closeChapterRegenPanel();
  const c = state.chapters[i];
  const title = c && c.title ? c.title : ('第'+(i+1)+'章');
  const hist = Array.isArray(c && c.regenHistory) ? c.regenHistory : [];
  const pushRegen = (mode, advice)=>{
    const h = Array.isArray(state.chapters[i].regenHistory) ? state.chapters[i].regenHistory : (state.chapters[i].regenHistory = []);
    h.push({ ts: Date.now(), mode, advice: String(advice||'') });
    if(h.length > 10) h.splice(0, h.length - 10);
    persist();
  };
  const pad = n => n<10?('0'+n):n;
  const histHtml = hist.length ? `
    <div class="rp-hist">
      <div class="rp-hist-title">📜 历史干预（点击回填到上方输入框）</div>
      ${hist.slice().sort((a,b)=>b.ts-a.ts).map(r=>{
        const d = new Date(r.ts);
        const t = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        const txt = r.advice || '（直接重生成，无干预）';
        return `<div class="rp-hist-item" data-rp-fill="${esc(txt)}" title="${esc(txt)}">
          <span class="rp-hist-ts">${t}</span>
          <span class="rp-hist-txt">${esc(txt)}</span>
        </div>`;
      }).join('')}
    </div>` : '';
  const rpOv = { on:false, tags:[] };
  const rpCmpB = { tags:[] };
  let rpOvApplied = null;     // 覆盖块「应用」确认快照 {on,tags}；null=未确认（未点应用则重生成不生效）
  let rpCmpBApplied = null;   // 对比块「应用」确认快照 {tags}；null=未确认（未点应用则 B 稿不生效）
  const ov = document.createElement('div');
  ov.id = 'regenPanel'; ov.className = 'gs-overlay';
  ov.setAttribute('data-cs', wsColorSchemeId());
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🔄 重生成 · 第${i+1}章「${esc(cleanChapterTitle(title))}」</b>
        <button class="gs-x" data-rp-close>✕</button></div>
      <div class="gs-actions rp-top-actions">
        <button class="btn" data-rp-plain>直接重生成（无干预）</button>
        <button class="btn primary" data-rp-with>💡 带我的建议重生成</button>
      </div>
      <div class="gs-body">
        <textarea id="rpAdvice" class="rp-advice" placeholder="可选：写具体要求（如压缩到1500字、女主性格外放、增加与上章衔接…）；留空则直接点评本章正文"></textarea>
        <div class="advice-ai-row">
          <button type="button" class="btn small ghost" data-advice-ai="${i}">✨ 正文优化建议</button>
          <button type="button" class="ai-upload-btn ai-hist-btn" data-advadv-hist="${i}" title="章节内容 AI 建议历史：回看已生成过的建议（随项目保存）">📖<span class="ai-hist-badge">${Array.isArray(state.contentAdviceHist)?state.contentAdviceHist.length:''}</span></button>
          <span class="muted" style="font-size:11px">AI 审读本章全文、上一章全文、下一章标题与万物词典给 1–3 条点评建议；点击即回填，可再手改</span>
        </div>
        <div data-advice-ai-out></div>
        ${histHtml}
        <div class="rp-style">
          <div class="rp-style-head" data-rpov-fold role="button" tabindex="0">
            <span>🎨 本章风格覆盖 <span class="rp-style-arrow">▸</span></span>
            <span class="muted" style="font-size:11px;font-weight:400">默认跟随全书 · 一次性不保存</span>
          </div>
          <div class="rp-style-body hidden">
           <div class="rp-ov-toggle" data-rpov-toggle>
  <span class="rp-ov-opt active" data-rpov-val="off">📖 全文</span>
  <span class="rp-ov-opt" data-rpov-val="on">🎨 仅本章</span>
</div>
            <div class="rp-style-sub hidden" id="rpOvBox">
              <div class="rp-style-label">覆盖风格（语气单选 · 质感/元素多选）</div>
              ${writeStyleChipsHtml(rpOv, 'rpov')}
              <div class="rp-apply-row">
                <button type="button" class="btn small primary" data-rpov-apply disabled title="确认本次覆盖风格，重生成时方才生效">✔ 应用</button>
                <span class="rp-apply-status" id="rpOvStatus">⚠️ 待应用</span>
              </div>
            </div>
          </div>
        </div>
        <div class="rp-style disabled" data-rpcmp-box>
          <div class="rp-style-head" data-rpcmp-fold role="button" tabindex="0">
            <span>⚡ 双风格对比生成 <span class="rp-style-arrow">▸</span></span>
            <span class="muted" style="font-size:11px;font-weight:400">需先开启上方本章覆盖</span>
          </div>
          <div class="rp-style-body hidden">
            <p class="rp-cmp-lock-hint">🔒 未开启「仅本章覆盖」时不可用；先在上一区选择「仅本章覆盖」以解锁。</p>
            <p class="muted" style="font-size:12px;margin:4px 0 8px">A 稿 = 本章覆盖风格；B 稿 = 下方所选（留空 = 无风格直白版）。</p>
            <div class="rp-style-label">B 稿对比风格</div>
            ${writeStyleChipsHtml(rpCmpB, 'rpcmp')}
            <div class="rp-apply-row">
              <button type="button" class="btn small primary" data-rpcmp-apply disabled title="确认 B 稿对比风格，再点上方按钮生成两稿">✔ 应用</button>
              <span class="rp-apply-status" id="rpCmpStatus">⚠️ 待应用 B 稿</span>
            </div>
            <button class="btn blue" data-rp-compare>⚡ 生成 A/B 两稿并对比</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-rp-close]').onclick = closeChapterRegenPanelAll;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeChapterRegenPanelAll(); });
  const rpCmpBox = ov.querySelector('[data-rpcmp-box]');
  const refreshRpCmpState = ()=>{
    if(!rpCmpBox) return;
    const locked = !rpOv.on;
    rpCmpBox.classList.toggle('disabled', locked);
    const hint = rpCmpBox.querySelector('.rp-cmp-lock-hint');
    if(hint) hint.style.display = locked ? 'block' : 'none';
    const head = rpCmpBox.querySelector('.rp-style-head .muted');
    if(head) head.textContent = locked ? '需先开启上方本章覆盖' : '两次调用 · 左右对照选稿';
  };
  const foldOv = ov.querySelector('[data-rpov-fold]');
  if(foldOv) foldOv.onclick = ()=>{
    const body = ov.querySelector('.rp-style-body'); if(!body) return;
    const on = body.classList.toggle('hidden');
    const arrow = foldOv.querySelector('.rp-style-arrow'); if(arrow) arrow.textContent = on?'▸':'▾';
  };
  const foldCmp = ov.querySelector('[data-rpcmp-fold]');
  if(foldCmp) foldCmp.onclick = ()=>{
    const body = foldCmp.closest('.rp-style').querySelector('.rp-style-body'); if(!body) return;
    const on = body.classList.toggle('hidden');
    const arrow = foldCmp.querySelector('.rp-style-arrow'); if(arrow) arrow.textContent = on?'▸':'▾';
  };
  ov.querySelectorAll('.rp-style-body').forEach(b=> b.classList.add('hidden'));
  ov.querySelectorAll('.rp-style-arrow').forEach(a=> a.textContent = '▸');
  function refreshRpOvApply(){
    const ap = ov.querySelector('[data-rpov-apply]'); const st = ov.querySelector('#rpOvStatus');
    if(!ap) return;
    ap.disabled = !rpOv.on; ap.classList.toggle('disabled', !rpOv.on);
   if(st){ st.textContent = rpOvApplied ? '✔ 已确认' : (rpOv.on ? '⚠️ 待应用' : '全文，无需应用'); st.classList.toggle('ok', !!rpOvApplied); }
  }
  function refreshRpCmpApply(){
    const ap = ov.querySelector('[data-rpcmp-apply]'); const st = ov.querySelector('#rpCmpStatus');
    if(!ap) return;
    const locked = !rpOv.on;
    ap.disabled = locked; ap.classList.toggle('disabled', locked);
    if(st){ st.textContent = rpCmpBApplied ? '✔ 已确认 B 稿' : (locked ? '需先开启本章覆盖' : '⚠️ 待应用 B 稿'); st.classList.toggle('ok', !!rpCmpBApplied); }
  }
  const rpovApplyBtn = ov.querySelector('[data-rpov-apply]');
  if(rpovApplyBtn) rpovApplyBtn.onclick = ()=>{
    if(!rpOv.on) return;
    rpOvApplied = { on:true, tags: rpOv.tags.slice() };
    refreshRpOvApply();
    toast('本章风格覆盖已应用，重生成时生效（仅本次）');
  };
  const rpcmpApplyBtn = ov.querySelector('[data-rpcmp-apply]');
  if(rpcmpApplyBtn) rpcmpApplyBtn.onclick = ()=>{
    if(!rpOv.on) return;
    rpCmpBApplied = { tags: rpCmpB.tags.slice() };
    refreshRpCmpApply();
    toast('B 稿对比风格已应用，生成 A/B 两稿时生效');
  };
  ov.querySelectorAll('[data-rpov-val]').forEach(el=> el.onclick = ()=>{
  ov.querySelectorAll('[data-rpov-val]').forEach(x=> x.classList.remove('active'));
  el.classList.add('active');
  rpOv.on = el.dataset.rpovVal === 'on';
  rpOvApplied = null;
  const box = ov.querySelector('#rpOvBox'); if(box) box.classList.toggle('hidden', !rpOv.on);
  refreshRpCmpState();
  refreshRpOvApply(); refreshRpCmpApply();
});

  ov.querySelectorAll('[data-rpov-tag]').forEach(b=> b.onclick = ()=>{ toggleWriteTag(rpOv, b.dataset.rpovTag); ov.querySelectorAll('[data-rpov-tag]').forEach(x=> x.classList.toggle('on', rpOv.tags.includes(x.dataset.rpovTag))); rpOvApplied = null; refreshRpOvApply(); });
  ov.querySelectorAll('[data-rpcmp-tag]').forEach(b=> b.onclick = ()=>{ toggleWriteTag(rpCmpB, b.dataset.rpcmpTag); ov.querySelectorAll('[data-rpcmp-tag]').forEach(x=> x.classList.toggle('on', rpCmpB.tags.includes(x.dataset.rpcmpTag))); rpCmpBApplied = null; refreshRpCmpApply(); });
  ov.querySelector('[data-rp-plain]').onclick = ()=>{
    const btn = document.querySelector('[data-regen="'+i+'"]');
    closeChapterRegenPanel();
    pushRegen('plain','');
    const ovr = rpOvApplied ? { styleOverride: { tags: rpOvApplied.tags.slice() } } : {};
    if(rpOv.on && !rpOvApplied) toast('已按全书风格重生成（未点「✔ 应用」的覆盖不生效）');
    genOneChapter(i, btn, ovr);
  };
  ov.querySelector('[data-rp-with]').onclick = ()=>{
    const advice = $('#rpAdvice').value.trim();
    const btn = document.querySelector('[data-regen="'+i+'"]');
    closeChapterRegenPanel();
    pushRegen('advice', advice);
    const ovr = rpOvApplied ? { advice, styleOverride: { tags: rpOvApplied.tags.slice() } } : { advice };
    if(rpOv.on && !rpOvApplied) toast('已按全书风格重生成（未点「✔ 应用」的覆盖不生效）');
    genOneChapter(i, btn, ovr);
  };
  ov.querySelector('[data-rp-compare]').onclick = ()=>{
    if(!rpOvApplied){ toast('请先在「🎨 本章风格覆盖」点「✔ 应用」确认 A 稿风格'); return; }
    if(!rpCmpBApplied){ toast('请先在「⚡ 双风格对比」点「✔ 应用」确认 B 稿风格'); return; }
    const btn = document.querySelector('[data-regen="'+i+'"]');
    const styleA = { tags: rpOvApplied.tags.slice() };
    closeChapterRegenPanel();
    genChapterCompare(i, styleA, { tags: rpCmpBApplied.tags.slice() });
  };
  refreshRpCmpState();
  ov.querySelectorAll('[data-rp-fill]').forEach(el=>{
    el.onclick = ()=>{
      const ta = $('#rpAdvice'); if(ta) ta.value = el.dataset.rpFill;
      el.classList.add('rp-fill-on');
      ta && ta.focus();
    };
  });
  const ta = $('#rpAdvice'); if(ta) ta.focus();
  const aiBtn = ov.querySelector('[data-advice-ai]');
  if(aiBtn) aiBtn.onclick = ()=>{ aiRefineAdvice(i); };
  const advH = ov.querySelector('[data-advadv-hist]');
  if(advH) advH.onclick = ()=> openAdvHistPanel('content');
  ov.addEventListener('click', e=>{
    const t = e.target.closest('[data-advice-ai-pick]'); if(!t) return;
    const j = +t.dataset.adviceAiPick;
    const a = Array.isArray(aiAdviceCand) ? aiAdviceCand[j] : null; if(!a) return;
    const ta2 = $('#rpAdvice'); if(ta2){ ta2.value = a.text || ''; ta2.focus(); }
    ov.querySelectorAll('[data-advice-ai-pick]').forEach((el,k)=> el.classList.toggle('on', k===j));
  });
}


function closeChapterRegenPanel(){ const p=$('#regenPanel'); if(p) p.remove(); }

   // {title,text}[] 候选，模块级；关闭弹窗不保留（closeChapterRegenPanel 会一并清）
function closeChapterRegenPanelAll(){ closeChapterRegenPanel(); aiAdviceCand = null; }


function buildAiRefineCtx(i){
  const o = state.outline || {};
  const chap = state.chapters[i] || {};
  const prev = i>0 ? (state.chapters[i-1]||{}) : null;
  const st = curWriteStyle();
  const chapNames = (Array.isArray(st.tags)?st.tags:[]).map(id=>{ const s=writeStyleById(id); return s&&s.group==='element'?s.name:null; }).filter(Boolean).join('、');
  const g = (o && o.glossary) || {};
  const dictChars = (g.characters||[]).map(c=>{
    const parts=[];
    if(c.identity) parts.push('身份:'+c.identity);
    if(c.age) parts.push('年龄:'+c.age);
    if(c.gender) parts.push('性别:'+c.gender);
    if(c.appearance) parts.push('外貌:'+c.appearance);
    if(c.hobby) parts.push('爱好:'+c.hobby);
    if(c.catchphrase && c.catchphrase !== '无') parts.push('口头禅:'+c.catchphrase);
    if(c.relation) parts.push('关系:'+c.relation);
    if(c.trait) parts.push('性格:'+c.trait);
    return (c.name||'')+(parts.length?'（'+parts.join('；')+'）':'');
  }).join('；');
  const dictPlaces = (g.places||[]).map(p=>`${p.name||''}${p.note?`（${p.note}）`:''}`).join('；');
  const dictProps  = (g.propernouns||[]).map(p=>`${p.name||''}${p.note?`（${p.note}）`:''}`).join('；');
  return {
    书名: (o.title||''), 简介: (o.logline||''),
    本章标题: (chap.title||('第'+(i+1)+'章')),
    本章全文: (chap.content||''),   // 续写/扩写需全文，原样提供
    上一章标题: prev ? (prev.title||('第'+i+'章')) : '',
    上一章全文: (prev && prev.content) ? String(prev.content) : '',   // 上一章全文全量
    下一章标题: (o.chapters[i+1]&&o.chapters[i+1].title)||'',
    万物词典: `人物：${dictChars||'（无）'}\n地点：${dictPlaces||'（无）'}\n专名：${dictProps||'（无）'}`,
    当前写作风格: chapNames || '无'
  };
}


function aiRefineAdvicePrompt(ctx, raw){
  const _raw = String(raw||'').trim();
  return { system:[
    '你是资深网文长篇编辑。用户在建议框里可能写了一段补充要求（续写、扩写、改段落、修正称呼错别字等），也可能留空、只是想听你对本章正文的专业点评。',
    '请审读给出的【本章全文】【万物词典】【上下文】，输出 1–3 条建议（至少 1 条、最多 3 条）；每条 = { title(一句话定位本条侧重), text(完整点评 + 可直接下发给章节生成 AI 的可执行命令) }。',
    '【允许"无建议"】若本章已写得很稳、没有真正值得动的地方，就只返回 1 条：{"title":"无建议","text":"本章整体稳定，暂不建议改动。"}——宁缺毋滥，绝不为了凑满条数硬找问题或胡说八道。',
    '【点评要点】节奏是否拖沓或太赶、对白是否有辨识度与推进力、悬念与留白是否给足、人物言行是否与万物词典中的身份/性格/关系一致（有无OOC）、是否承接上一章结尾、是否为下一章（'+ (ctx.下一章标题||'') +'）留好引子、与万物词典命名/设定是否冲突。',
    '【有补充要求时】先满足用户要求（'+ (_raw? _raw.slice(0,120)+'…' : '（用户未给出方向）') +'）的角度，再在该方向之外综合点评；要求为空时直接审读本章正文点评。',
    '【可执行】text 用对章节 AI 说的祈使句，明确范围与幅度，可行时用换行拆 2–3 个可独立启用的子要点；续写/扩写必须承接本章与上一章结尾、不越界到下一章；不臆造万物词典外的新名。',
    '输出仅一个 JSON 数组（1–3 项），无任何讲解、无 markdown 代码块前后缀。每项结构：{ "title":"一句话说明本条侧重什么", "text":"完整点评+可执行命令" }'
    ].join('\n'),
    user: JSON.stringify({ 上下文: ctx, 用户原始要求: (_raw||'(无)') }, null, 1) };
}


async function aiRefineAdvice(i){
  const ta = $('#rpAdvice'); if(!ta) return;
  const raw = ta.value.trim();   // 可空：无补充要求也能生成点评
  const out = $('[data-advice-ai-out]');
  if(out) out.innerHTML = `<p class="muted" style="margin:6px 0 0">⏳ AI 正审读本章正文并给出优化建议…</p>`;
  const btn = $('[data-advice-ai]'); if(btn){ btn.disabled = true; btn.textContent = '生成中…'; }
  try{
    const ctx = buildAiRefineCtx(i);
    const {system, user} = aiRefineAdvicePrompt(ctx, raw);
    const res = unwrapAIResult(await callDeepSeek(system, user, {temperature:resolveActiveSpec().contentAdviseTemp, topP:0.5, maxTokens:clampMaxTokens('json'), taskKey:'contentAdvice'}));
    const list = parseAiJsonList(res);
    const ls = Array.isArray(list) ? list.filter(x=> x && String(x.text||'').trim()) : [];
    if(!ls.length) throw new Error('AI 未返回有效建议，请重试');
    if(ls.length===1 && /无建议/.test(String(ls[0].title||'')+' '+String(ls[0].text||''))){
      aiAdviceCand = null;
      if(out) out.innerHTML = `<p class="muted" style="margin:6px 0 0">💡 ${esc(String(ls[0].text||'本次无建议，正文暂无需改动。').trim())}</p>`;
      if(btn){ btn.disabled = false; btn.textContent = '✨ 正文优化建议'; }
      return;
    }
    aiAdviceCand = ls.slice(0,3);
    const _ch = state.chapters[i] || {};
    addAdvHist('content', { id: aiHistEntryId(), ts: Date.now(), desc: '正文优化建议 · 第'+(i+1)+'章', list: JSON.parse(JSON.stringify(ls.slice(0,3))) });
    refreshAdvHistBadge('content');
  }catch(e){
    aiAdviceCand = null;
    if(out) out.innerHTML = `<p class="muted" style="color:var(--danger);margin:6px 0 0">⚠️ ${esc((e&&e.message)||'生成失败')}</p>`;
  }
  if(out) out.innerHTML = aiAdviceResultHtml();
  if(btn){ btn.disabled = false; btn.textContent = '✨ 正文优化建议'; }
}


function aiAdviceResultHtml(){
  if(!Array.isArray(aiAdviceCand) || !aiAdviceCand.length) return '';
  return aiAdviceCand.map((a,ai)=>`
    <div class="advice-ai-cand" data-advice-ai-pick="${ai}">
      <div class="advice-ai-head">
        <span class="advice-ai-idx">${'①②③'[ai]||(ai+1)}</span>
        <b>${esc(a.title||('方案'+(ai+1)))}</b>
        <button type="button" class="advice-ai-use">✔ 采用</button>
      </div>
      <p>${esc(a.text||'')}</p>
    </div>`).join('');
}



async function genChapterCompare(i, styleA, styleB){
  const p = window.TellMeChapterCompare;
  if(!p) throw new Error('章节对比模块尚未加载');
  const btn = document.querySelector('[data-regen="'+i+'"]');
  const st = $('#chStatus');
  const setPhase = m => { if(st){ st.className='status'; st.textContent = `第 ${i+1}/${state.chapters.length} 章：${m||''}`; } };
  return p.generateChapterCompare(i, styleA, styleB, {
    state, chState, patchChapter, busy, btn, setPhase,
    buildChapterUser, writeOneChapterContent, openComparePanel, toast
  });
}


function openComparePanel(i, a, b){
  closeComparePanel();
  const c = state.chapters[i];
  const title = c && c.title ? c.title : ('第'+(i+1)+'章');
  const ov = document.createElement('div'); ov.id='cmpPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>⚡ 双风格对比 · 第${i+1}章「${esc(cleanChapterTitle(title))}」</b>
        <button class="gs-x" data-cmp-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-div">A 稿 = 当前生效风格；B 稿 = 对比风格。采用后，未采用稿会连同旧正文一起存入版本历史（📚 版本 可回退）。</div>
        <div class="qc-pair">
          <div class="qc-side"><div class="qc-side-t">A 稿 · 当前生效风格（${countWords(a).total} 字）</div><div class="qc-pre cmp-pre">${esc(a)}</div></div>
          <div class="qc-side"><div class="qc-side-t">B 稿 · 对比风格（${countWords(b).total} 字）</div><div class="qc-pre cmp-pre">${esc(b)}</div></div>
        </div>
        <div class="gs-actions" style="margin-top:10px">
          <button class="btn primary" data-cmp-use="a">✔ 采用 A 稿</button>
          <button class="btn primary" data-cmp-use="b">✔ 采用 B 稿</button>
          <button class="btn" data-cmp-close>暂不采用（两稿都存历史）</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-cmp-close]').forEach(b=> b.onclick = closeComparePanel);
  ov.addEventListener('click', e=>{ if(e.target===ov) closeComparePanel(); });
  ov.addEventListener('click', e=>{
    const u = e.target.closest('[data-cmp-use]'); if(!u) return;
    const isA = u.dataset.cmpUse === 'a';
    const pick = isA ? a : b;
    const other = isA ? b : a;
    snapshotChapterVersion(i);                    // 旧正文入历史
    const ch = ensureChapterHistory(i);
    ch.content = pick;
    if(other && String(other).trim()) ch.history.push({ content: other, ts: Date.now() });   // 未采用稿也入历史备查
    if(ch.history.length > 50) ch.history.splice(0, ch.history.length - 50);
    updateFactCardFromChapter(i, pick);
    persist(); closeComparePanel(); renderChapters(); updateWcTotal();
    toast('已采用 '+(isA?'A':'B')+' 稿');
  });
}


function closeComparePanel(){ const p=$('#cmpPanel'); if(p) p.remove(); }



async function genOneChapter(i, btn, opt={}){
  const p = window.TellMeChapterSingleGeneration;
  if(!p) throw new Error('单章生成模块尚未加载');
  const st = $('#chStatus');
  const setPhase = msg => {
    if(st){ st.className='status'; st.textContent = `第 ${i+1}/${state.chapters.length} 章：${msg||''}`; }
  };
  const stopParent = btn && btn.closest('.btn-row') ? btn.closest('.btn-row') : null;
  if(stopParent){
    if(!_abortBtn){ _abortBtn = makeStopBtn(); document.body.appendChild(_abortBtn); }
    _abortCtl = new AbortController();
    _abortBtn.style.display = '';
    const readBtn = stopParent.querySelector(`[data-read="${i}"]`);
    if(readBtn && readBtn.nextSibling) stopParent.insertBefore(_abortBtn, readBtn.nextSibling);
    else stopParent.appendChild(_abortBtn);
  }
  return p.generateSingleChapter(i, opt, {
    state, chState, isLong, chapterPlanAuthority, commitPlannedChapterState,
    patchChapter, busy, btn, setPhase, ensureChapterDigests, buildChapterUser,
    currentIsDeepSeek, writeOneChapterContent, snapshotChapterVersion,
    updateFactCardFromChapter, finalizeChapterState, invalidateChapterMemory,
    persist, toast, generateRollingSummaries, hideStopBtn, autoUpdateSubplots,
    autoUpdateTimeAnchors,
    updateStreamingText: (idx, text) => {
      const ta = document.querySelector(`textarea[data-ch="${idx}"]`);
      if(ta){ ta.value = text; ta.scrollTop = ta.scrollHeight; }
    },
    abortSignal: _abortCtl?.signal
  });
}



async function genTwoChapters(pairStart){
  for(let k=0;k<2;k++){
    const idx = pairStart + k;
    let _s2 = 0; let _full2 = '';
    const onStream = currentIsDeepSeek() ? (delta => {
      const d = String(delta||'');
      _s2 += d.length; _full2 += d;
      state._chapterPartial[idx] = _full2;
      const ta = document.querySelector(`textarea[data-ch="${idx}"]`);
      if(ta){ ta.value = _full2; ta.scrollTop = ta.scrollHeight; }
      patchChapter(idx);
    }) : null;
    const txt = await writeOneChapterContent(idx, buildChapterUser(idx), null, onStream);
    snapshotChapterVersion(idx);
    state.chapters[idx].content = txt;
    updateFactCardFromChapter(idx, txt); if(isLong()){ const fin=await finalizeChapterState(idx, txt); if(fin.content!==txt){ txt=fin.content; state.chapters[idx].content=txt; snapshotChapterVersion(idx); } }
    invalidateChapterMemory(idx);
    // legacy invalidation caller compatibility: invalidateChapterMemory(i);
  }
  generateRollingSummaries().catch(()=>{});
}



async function genNChapters(start, n){
  const p = window.TellMeChapterGeneration;
  if(!p) throw new Error('章节生成模块尚未加载');
  return p.generateChapterBatch(start, n, {
    state,
    isLong,
    chapterPlanAuthority,
    commitPlannedChapterState,
    continueTruncatedChapter,
    currentIsDeepSeek,
    patchChapter,
    dynamicChapterParams,
    chapterMaxTokens,
    callDeepSeek,
    longChapterSys,
    buildChapterUser,
    chapterStyleNote,
    promptsChapterSys: PROMPTS.chapterSys,
    abortSignal: _abortCtl?.signal,
    snapshotChapterVersion,
    persist,
    updateFactCardFromChapter,
    finalizeChapterState,
    invalidateChapterMemory,
    chState,
    ensureChapterDigests,
    generateRollingSummaries,
    markAIRunning,
    updateStreamingText: (idx, text) => {
      const ta = document.querySelector(`textarea[data-ch="${idx}"]`);
      if(ta){ ta.value = text; ta.scrollTop = ta.scrollHeight; }
    }
  });
}



async function continueTruncatedChapter(i, firstPart, resumeFrom){
  const p = window.TellMeChapterContinuation;
  if(!p) throw new Error('章节续写模块尚未加载');
  return p.continueTruncatedChapter(i, firstPart, resumeFrom, {
    state,
    callDeepSeek,
    longChapterSys,
    clampMaxTokens,
    dynamicChapterParams,
    signal: _abortCtl?.signal
  });
}


async function continueAndFinalizeChapter(i, sourceNote){
  const p = window.TellMeChapterContinuation;
  if(!p) throw new Error('章节续写模块尚未加载');
  return p.continueAndFinalizeChapter(i, sourceNote, {
    state,
    callDeepSeek,
    longChapterSys,
    clampMaxTokens,
    dynamicChapterParams,
    signal: _abortCtl?.signal,
    chState: (idx, value)=>{ chState[idx] = value; },
    toast,
    countWords,
    snapshotChapterVersion,
    updateFactCardFromChapter,
    isLong,
    commitChapterObservedState,
    invalidateChapterMemory,
    persist,
    patchChapter,
    renderNarrativeEngineMenu,
    autoUpdateSubplots,
    autoUpdateTimeAnchors,
    generateRollingSummaries
  });
}



function syncGenBatchControls(){
  const mg = $('.multi-gen'); const out = $('#genCountOut'); const many = $('#btnGenMany');
  if(!mg || !out) return;
  const rem = remainingEmptyChapters();
  const done = rem <= 0;
  if(genBatchN < 1) genBatchN = 1;
  if(rem > 0 && genBatchN > rem) genBatchN = rem;
  out.textContent = String(genBatchN);
  mg.querySelectorAll('[data-gen-dec],[data-gen-inc]').forEach(b=>{ b.disabled = done; });
  if(many){ many.disabled = done; many.textContent = done ? '✅ 已全部写完' : '⚡ 批量生成多章'; }
}

  const api = {
    densityCheck,
    renderChapterSummaryBody,
    chSumGenerate,
    openChapterSummaryPanel,
    adherenceHint,
    buildChapterUser,
    adoptChapterPartial,
    chapterBadgesHtml,
    patchChapter,
    openChapterRegenPanel,
    closeChapterRegenPanel,
    closeChapterRegenPanelAll,
    buildAiRefineCtx,
    aiRefineAdvicePrompt,
    aiRefineAdvice,
    aiAdviceResultHtml,
    genChapterCompare,
    openComparePanel,
    closeComparePanel,
    genOneChapter,
    genTwoChapters,
    genNChapters,
    continueTruncatedChapter,
    continueAndFinalizeChapter,
    syncGenBatchControls,
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['chapter-review-workspace'] = Object.freeze(api);
  return ns['chapter-review-workspace'];
}
