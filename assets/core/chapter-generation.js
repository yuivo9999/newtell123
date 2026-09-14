/** v41 consolidated module: chapter-generation.js */
// ---- merged source: chapter-generation.js ----
const _m0 = (() => {
/**
 * Chapter generation orchestration pipeline.
 *
 * Keeps batch chapter generation mechanics outside the legacy UI script.
 * DOM updates and persistence are injected explicitly so the module remains
 * reusable without depending on classic-script lexical scope.
 */

async function generateChapterBatch(start, n, deps = {}){
  const {
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
    abortSignal,
    snapshotChapterVersion,
    persist,
    updateFactCardFromChapter,
    finalizeChapterState,
    invalidateChapterMemory,
    chState,
    ensureChapterDigests,
    generateRollingSummaries,
    markAIRunning,
  } = deps;

  if(!state) throw new Error('chapter generation requires state');
  if(n <= 0) return;
  if(typeof markAIRunning === 'function') markAIRunning('chapter');

  try{
    for(let k = 0; k < n; k++){
      const idx = start + k;
      if(typeof isLong === 'function' && isLong()){
        const cc = chapterPlanAuthority(idx);
        if(!cc) throw new Error(`第${idx + 1}章没有当前版本的机器教案卡，请重新完成对应老师备课`);
        const ps = commitPlannedChapterState(idx, cc, 'teacher-card');
        if(ps && state.outline?._storyState?.chapters?.[idx]?.boundaryAudit?.rewind){
          throw new Error(state.outline._storyState.chapters[idx].boundaryAudit.note + '；请修正教案时间');
        }
      }

      if(typeof isLong === 'function' && !isLong() && state.chapters[idx]?.content &&
         String(state.chapters[idx].content).trim() && state.chapters[idx].confirmed){
        continue;
      }

      let attempt = 0;
      let txt = '';
      let finishReason = '';
      const resumePartial = (state._chapterPartial && state._chapterPartial[idx]) || '';

      if(resumePartial.length >= 200){
        try{
          txt = await continueTruncatedChapter(idx, '', resumePartial);
          delete state._chapterPartial[idx];
          finishReason = 'stop';
        }catch(e){
          // Fall back to a fresh generation attempt.
        }
      }

      while(attempt < 2){
        attempt++;
        try{
          if(!(resumePartial.length >= 200 && txt && finishReason === 'stop')){
            let fullN = '';
            const onStream = currentIsDeepSeek() ? (delta => {
              const d = String(delta || '');
              fullN += d;
              state._chapterPartial[idx] = fullN;
              if(typeof patchChapter === 'function') patchChapter(idx);
              if(typeof deps.updateStreamingText === 'function') deps.updateStreamingText(idx, fullN);
            }) : null;
            const dyn = dynamicChapterParams(idx);
            const res = await callDeepSeek(
              isLong() ? longChapterSys() : (deps.promptsChapterSys || '') + chapterStyleNote(),
              buildChapterUser(idx),
              {
                maxTokens: chapterMaxTokens(),
                onStream,
                temperature: dyn.temperature,
                topP: dyn.topP,
                signal: abortSignal,
                taskKey: 'chapter',
              }
            );
            txt = res.text;
            finishReason = res.finishReason;
            if(finishReason === 'length'){
              txt = await continueTruncatedChapter(idx, txt);
              finishReason = 'stop';
            }
          }

          let content = String(txt || '').trim();
          snapshotChapterVersion(idx);
          state.chapters[idx].content = content;
          if(!isLong()) state.chapters[idx].confirmed = false;
          delete state._chapterPartial[idx];
          state._chapterRetryFix = '';
          persist();
          updateFactCardFromChapter(idx, content);
          if(isLong()){
            const fin = await finalizeChapterState(idx, content);
            if(fin.content !== content){
              content = fin.content;
              state.chapters[idx].content = content;
              snapshotChapterVersion(idx);
              persist();
            }
          }
          invalidateChapterMemory(idx);
          chState[idx] = 'done';
          patchChapter(idx);
          if(idx > 0){
            try{ await ensureChapterDigests(idx - 1); }catch(e){ /* batch-tail summary is the fallback */ }
          }
          break;
        }catch(e){
          if(resumePartial.length >= 200 && attempt === 1 && txt && finishReason === 'stop'){
            txt = '';
            finishReason = '';
            continue;
          }
          if(attempt >= 2){
            chState[idx] = 'error';
            patchChapter(idx);
            throw e;
          }
        }
      }
    }
    generateRollingSummaries().catch(() => {});
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running || []).filter(k => k !== 'chapter');
    state.aiNetwork.completed = Array.from(new Set([...(state.aiNetwork.completed || []), 'chapter']));
    persist();
  }
}



return Object.freeze({generateChapterBatch});
})();

// ---- merged source: chapter-single-generation.js ----
const _m1 = (() => {
/**
 * Single chapter generation orchestration.
 *
 * Core lifecycle is kept here; legacy UI remains responsible for buttons,
 * stop-control DOM, and presentation callbacks injected through deps.
 */
async function generateSingleChapter(i, opt = {}, deps = {}){
  const {
    state, chState, isLong, chapterPlanAuthority, commitPlannedChapterState,
    patchChapter, busy, btn, setPhase, ensureChapterDigests,
    buildChapterUser, currentIsDeepSeek, writeOneChapterContent,
    snapshotChapterVersion, updateFactCardFromChapter, finalizeChapterState,
    invalidateChapterMemory, persist, toast, generateRollingSummaries,
    updateStreamingText, hideStopBtn, autoUpdateSubplots, autoUpdateTimeAnchors,
  } = deps;

  if(!state) throw new Error('single chapter generation requires state');
  const status = typeof setPhase === 'function' ? setPhase : (()=>{});

  if(typeof isLong === 'function' && isLong()){
    const cc = chapterPlanAuthority(i);
    if(!cc){
      toast?.('第'+(i+1)+'章没有当前版本的机器教案卡，请重新完成对应老师备课。');
      return false;
    }
    const ps = commitPlannedChapterState(i, cc, 'teacher-card');
    if(ps && state.outline?._storyState?.chapters?.[i]?.boundaryAudit?.rewind){
      toast?.(state.outline._storyState.chapters[i].boundaryAudit.note+'；已阻止生成，请先修正教案时间。');
      return false;
    }
  }

  chState[i] = 'generating';
  state.generating = true;
  patchChapter(i);
  if(btn) busy(btn, true, '生成中…');
  status('准备中…');

  if(i > 0){
    try{
      status('核对上一章摘要…');
      await ensureChapterDigests(i - 1);
    }catch(e){
      // 摘要同步失败不阻断生成，既有尾段/补算兜底继续接管。
    }
  }

  let fullContent = '';
  try{
    const user = buildChapterUser(i, {
      regenerating: true,
      advice: opt.advice,
      styleOverride: opt.styleOverride
    });
    let streamed = 0;
    const onStream = currentIsDeepSeek() ? (delta => {
      const d = String(delta || '');
      streamed += d.length;
      fullContent += d;
      const msg = `第 ${i+1}/${state.chapters.length} 章：撰写中 · 已生成 ${streamed} 字`;
      status(msg);
      if(typeof updateStreamingText === 'function') updateStreamingText(i, fullContent);
      patchChapter(i);
    }) : null;

    let txt = await writeOneChapterContent(
      i, user, status, onStream, opt.styleOverride
    );

    snapshotChapterVersion(i);
    state.chapters[i].content = txt;
    updateFactCardFromChapter(i, txt);

    if(typeof isLong === 'function' && isLong()){
      const fin = await finalizeChapterState(i, txt);
      if(fin.content !== txt){
        txt = fin.content;
        state.chapters[i].content = txt;
        snapshotChapterVersion(i);
        persist();
      }
    }

    invalidateChapterMemory(i);
    chState[i] = 'done';
    if(!isLong()) state.chapters[i].confirmed = false;
    persist();
    patchChapter(i);
    status(`第 ${i+1} 章已生成。`);
    toast?.('第'+(i+1)+'章完成');
    generateRollingSummaries?.().catch?.(()=>{});
    return true;
  }catch(e){
    if(e?.name === 'AbortError'){
      status('第'+(i+1)+'章已停止生成');
    }else{
      chState[i] = 'error';
      patchChapter(i);
      if(typeof setPhase === 'function'){
        const st = document.querySelector('#chStatus');
        if(st){ st.className='status err'; st.textContent='第'+(i+1)+'章生成失败：'+e.message; }
      }
      toast?.('第'+(i+1)+'章生成失败：'+e.message);
    }
    return false;
  }finally{
    hideStopBtn?.();
    state.generating = false;
    if(btn) busy(btn, false);
    patchChapter(i);
    autoUpdateSubplots?.();
    autoUpdateTimeAnchors?.();
  }
}

return Object.freeze({generateSingleChapter});
})();

// ---- merged source: chapter-batch-runner.js ----
const _m2 = (() => {
/**
 * Batch chapter generation lifecycle.
 *
 * The legacy layer supplies UI callbacks and the already-extracted chapter
 * generation primitive. This module owns the batch orchestration/state rules.
 */
async function generateManyChapters(count, fromStart, deps = {}) {
  const {
    state,
    isLong,
    genNChapters,
    remainingEmptyChapters,
    chState,
    patchChapter,
    totalChapters,
    setStatus,
    setBusy,
    showStop,
    hideStop,
    confirmMissingPlans,
    toast,
    onPageChange,
    onFinished,
    onError,
    onFinally,
    pageSize,
    currentPage,
    markGenerating,
    syncControls,
  } = deps;

  if (!state) throw new Error('chapter batch runner requires state');
  if (typeof genNChapters !== 'function') throw new Error('chapter batch runner requires genNChapters');

  const totalCh = typeof totalChapters === 'function'
    ? totalChapters()
    : (state.chapters || []).length;

  if (typeof confirmMissingPlans === 'function' && !confirmMissingPlans()) return;

  if (typeof setBusy === 'function') setBusy(true);
  if (typeof setStatus === 'function') setStatus('', false);
  if (typeof showStop === 'function') showStop();

  let start;
  if (fromStart) {
    start = 0;
  } else {
    const firstEmpty = (state.chapters || []).findIndex(c => !(c.content && String(c.content).trim()));
    start = firstEmpty < 0 ? 0 : firstEmpty;
  }

  if (totalCh <= 0 || start >= totalCh) {
    if (typeof setStatus === 'function') setStatus('全部章节已生成。', true);
    if (typeof setBusy === 'function') setBusy(false);
    if (typeof hideStop === 'function') hideStop();
    if (typeof syncControls === 'function') syncControls();
    return;
  }

  const n = Math.max(1, Math.min(count, totalCh - start));
  state.generating = true;
  if (typeof markGenerating === 'function') markGenerating(start, n);
  else {
    for (let k = 0; k < n; k++) {
      chState[start + k] = 'generating';
      if (typeof patchChapter === 'function') patchChapter(start + k);
    }
  }

  if (typeof setStatus === 'function') setStatus(`正在生成第 ${start + 1}~${start + n} 章（共 ${n} 章）…`, false);

  try {
    await genNChapters(start, n);
    for (let k = 0; k < n; k++) {
      chState[start + k] = 'done';
      if (typeof patchChapter === 'function') patchChapter(start + k);
    }

    const rem = typeof remainingEmptyChapters === 'function' ? remainingEmptyChapters() : 0;
    const msg = isLong()
      ? (rem > 0 ? `本批共 ${n} 章已生成，全书还剩 ${rem} 章未写。` : `全部章节已写完（共 ${totalCh} 章）。`)
      : '全部章节已生成，请审阅并标记确认。';
    if (typeof setStatus === 'function') setStatus(msg, true);
    if (rem <= 0 && isLong() && typeof toast === 'function') toast(`已全部写完（共 ${totalCh} 章）`);

    if (isLong() && typeof onPageChange === 'function' && pageSize) {
      const targetPage = Math.floor(start / pageSize);
      if (Math.abs(currentPage() - targetPage) >= 1) onPageChange(targetPage);
    }
    if (typeof onFinished === 'function') await onFinished({ start, n, rem, totalCh });
  } catch (e) {
    for (let k = 0; k < n; k++) {
      if (chState[start + k] === 'generating') chState[start + k] = 'error';
      if (typeof patchChapter === 'function') patchChapter(start + k);
    }
    if (typeof setStatus === 'function') setStatus(`第${start + 1}~${start + n}章生成失败（${e.message}）。已停止本批，请修复后重试。`, false);
    if (typeof toast === 'function') toast(`第${start + 1}~${start + n}章生成失败：${e.message}`);
    if (typeof onError === 'function') await onError(e, { start, n, totalCh });
  } finally {
    state.generating = false;
    if (typeof hideStop === 'function') hideStop();
    if (typeof setBusy === 'function') setBusy(false);
    if (typeof onFinally === 'function') await onFinally({ start, n, totalCh });
    if (isLong() && typeof syncControls === 'function') syncControls();
  }
}

return Object.freeze({generateManyChapters});
})();

// ---- merged source: chapter-continuation.js ----
const _m3 = (() => {
/**
 * Chapter continuation pipeline.
 *
 * Keeps truncated-output continuation logic independent from the legacy UI
 * orchestration. Dependencies are explicit so the classic runtime remains a
 * compatibility shell rather than an implicit module scope.
 */

function longestCommonPrefix(a, b){
  const left = String(a ?? '');
  const right = String(b ?? '');
  let i = 0;
  while(i < Math.min(left.length, right.length) && left[i] === right[i]) i++;
  return left.slice(0, i);
}

async function continueTruncatedChapter(i, firstPart, resumeFrom, deps = {}){
  const {
    state,
    callDeepSeek,
    longChapterSys,
    clampMaxTokens,
    dynamicChapterParams,
    signal,
  } = deps;
  if(!state) throw new Error('chapter continuation requires state');
  if(typeof callDeepSeek !== 'function') throw new Error('chapter continuation requires callDeepSeek');

  const full = resumeFrom ? String(resumeFrom || '') : String(firstPart || '');
  const tail = full.slice(-800);
  const user = `【前文末尾（${resumeFrom ? '已生成但尚未落库的草稿尾部' : '被截断'}）】\n${tail}\n\n【续写要求】\n从上文中断处无缝继续，不要重复任何已有内容，不要重新开头。保持与原文一致的叙事节奏、人物称谓和风格。`;
  let secondPartial = '';
  const dyn = typeof dynamicChapterParams === 'function' ? dynamicChapterParams(i) : {};
  const res = await callDeepSeek(
    typeof longChapterSys === 'function' ? longChapterSys() : '',
    user,
    {
      maxTokens: typeof clampMaxTokens === 'function' ? clampMaxTokens('continue') : undefined,
      taskKey: 'chapter',
      onStream: (delta) => {
        secondPartial += delta;
        state._chapterPartial = state._chapterPartial || {};
        state._chapterPartial[i] = full + secondPartial;
      },
      temperature: dyn.temperature,
      topP: dyn.topP,
      signal,
    }
  );
  let second = String(res?.text || '').trim();
  const lcp = longestCommonPrefix(tail, second);
  if(lcp.length > 20) second = second.slice(lcp.length).trim();
  return resumeFrom ? (full + '\n' + second) : (firstPart + '\n' + second);
}

async function continueAndFinalizeChapter(i, sourceNote, deps = {}){
  const {
    state,
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
    generateRollingSummaries,
    ...continuationDeps
  } = deps;

  const partial = (state?._chapterPartial && state._chapterPartial[i]) || '';
  if(!partial || String(partial).trim().length < 50){
    if(typeof toast === 'function') toast('没有可续写的缓存内容');
    return;
  }

  const wordCount = typeof countWords === 'function'
    ? countWords(String(partial).trim()).total
    : String(partial).trim().length;
  const setChapterState = continuationDeps.chState;
  if(setChapterState) setChapterState(i, 'generating');
  if(typeof patchChapter === 'function') patchChapter(i);
  if(typeof toast === 'function') toast(`${sourceNote || '续写'}：已缓存 ${wordCount.toLocaleString()} 字，开始续写…`);

  try{
    const txt = await continueTruncatedChapter(i, '', partial, continuationDeps);
    const content = String(txt || '').trim();
    if(!content) throw new Error('续写结果为空');
    delete state._chapterPartial[i];
    if(typeof snapshotChapterVersion === 'function') snapshotChapterVersion(i);
    state.chapters[i].content = content;
    if(typeof updateFactCardFromChapter === 'function') updateFactCardFromChapter(i, content);
    if(typeof isLong === 'function' && isLong() && typeof commitChapterObservedState === 'function'){
      await commitChapterObservedState(i, content);
    }
    if(typeof invalidateChapterMemory === 'function') invalidateChapterMemory(i);
    if(setChapterState) setChapterState(i, 'done');
    if(typeof persist === 'function') persist();
    if(typeof patchChapter === 'function') patchChapter(i);
    if(typeof renderNarrativeEngineMenu === 'function') renderNarrativeEngineMenu();
    if(typeof countWords === 'function' && typeof toast === 'function'){
      toast(`第 ${i + 1} 章续写完成（${countWords(content).total.toLocaleString()} 字）`);
    }
    if(typeof autoUpdateSubplots === 'function') autoUpdateSubplots();
    if(typeof autoUpdateTimeAnchors === 'function') autoUpdateTimeAnchors();
    if(typeof generateRollingSummaries === 'function') generateRollingSummaries().catch(() => {});
  }catch(e){
    if(!(e && e.name === 'AbortError') && typeof toast === 'function'){
      toast('续写失败：' + ((e && e.message) || '未知错误'));
    }
    if(setChapterState) setChapterState(i, 'error');
    if(typeof patchChapter === 'function') patchChapter(i);
    if(typeof renderNarrativeEngineMenu === 'function') renderNarrativeEngineMenu();
  }
}

return Object.freeze({longestCommonPrefix, continueTruncatedChapter, continueAndFinalizeChapter});
})();

// ---- merged source: chapter-compare.js ----
const _m4 = (() => {
/**
 * Chapter A/B style comparison generation pipeline.
 * UI rendering/selection remains in the legacy shell; this module owns
 * the two-generation orchestration and lifecycle reporting.
 */

async function generateChapterCompare(i, styleA, styleB, deps = {}) {
  const {
    state,
    chState,
    patchChapter,
    busy,
    btn,
    setPhase,
    buildChapterUser,
    writeOneChapterContent,
    openComparePanel,
    toast,
  } = deps;

  const c = state?.chapters?.[i];
  if(!c) return;

  chState[i] = 'generating';
  state.generating = true;
  patchChapter(i);
  if(btn) busy(btn, true, '对比生成中…');

  try {
    const user = buildChapterUser(i, { regenerating: true });
    setPhase('生成 A 稿（当前风格）…');
    const txtA = await writeOneChapterContent(i, user, setPhase, null, styleA);
    setPhase('生成 B 稿（对比风格）…');
    const txtB = await writeOneChapterContent(i, user, setPhase, null, styleB);
    chState[i] = 'done';
    openComparePanel(i, txtA, txtB);
    toast('两稿已生成，请选择采用');
    return { a: txtA, b: txtB };
  } catch(e) {
    chState[i] = 'error';
    patchChapter(i);
    toast('对比生成失败：' + e.message);
    throw e;
  } finally {
    state.generating = false;
    if(btn) busy(btn, false);
    patchChapter(i);
  }
}

return Object.freeze({generateChapterCompare});
})();

// ---- merged source: chapter-generation-controls.js ----
const _m5 = (() => {
/* v31: cohesive legacy region — chapter-generation-controls */

function install(deps){
  const {
    autoUpdateSubplots,
    autoUpdateTimeAnchors,
    genManyChapters,
    genNChapters,
    getGenBatchN,
    remainingEmptyChapters,
    setGenBatchN,
    snapshotChapterVersion,
    state,
    syncGenBatchControls,
    toast
  } = deps;
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];


function bindGenBatchControls(){
  const mg = $('.multi-gen'); if(!mg) return;
  const dec = mg.querySelector('[data-gen-dec]');
  const inc = mg.querySelector('[data-gen-inc]');
  if(dec) dec.onclick = (e)=>{ e.preventDefault(); setGenBatchN(Math.max(1, getGenBatchN() - 1)); syncGenBatchControls(); };
  if(inc) inc.onclick = (e)=>{ e.preventDefault(); setGenBatchN(Math.min(Math.max(1, remainingEmptyChapters()), getGenBatchN() + 1)); syncGenBatchControls(); };
  const many = $('#btnGenMany');
  if(many) many.onclick = (e)=>{
    e.preventDefault();
    const rem = remainingEmptyChapters();
    if(rem <= 0){ toast('已全部写完'); return; }   // 二次拦截：全写完后不可再触发
    genManyChapters(Math.min(Math.max(1, getGenBatchN()), rem));
  };
  syncGenBatchControls();
}

function bindRangeGen(){
  const s = $('#rgStart'), e = $('#rgEnd'), btn = $('#btnRangeGen'), st = $('#rgStatus');
  if(!s || !e || !btn) return;
  const total = state.chapters.length;
  const clamp = (v, lo, hi)=> Math.max(lo, Math.min(hi, v));
  const validateWarn = ()=>{
    const sv = parseInt(s.value) || 1;
    const ev = parseInt(e.value) || 1;
    if(sv > ev){
      if(st) st.textContent = '⚠️ 起始章不能大于结束章';
      btn.disabled = true;
      return false;
    }
    if(st) st.textContent = '';
    btn.disabled = false;
    return true;
  };
  const validateClamp = ()=>{
    const sv = clamp(parseInt(s.value) || 1, 1, total);
    const ev = clamp(parseInt(e.value) || 1, 1, total);
    s.value = sv; e.value = ev;
    validateWarn();
  };
  s.oninput = validateWarn; e.oninput = validateWarn;   
  s.onblur = validateClamp; e.onblur = validateClamp;
  btn.onclick = async ()=>{
    if(!validate()) return;
    const sv = parseInt(s.value), ev = parseInt(e.value);
    const n = ev - sv + 1;
    {
      const _o = state.outline || {};
      const miss = [];
      (_o.chapters||[]).forEach((c,i)=>{ const p=(_o.chapterPlans||[])[i];
        if(!p || !String(p.beatsText||'').trim()) miss.push(i+1); });
      if(miss.length && !confirm(`第 ${miss.join('、')} 章缺节拍表，这些章将按大纲直接裸写。继续？`)) return;
    }
    btn.disabled = true; btn.textContent = '生成中…';
    try{
      await genNChapters(sv - 1, n);   // 0-based start，genNChapters 内每章 snapshotChapterVersion + 覆盖
      toast(`第 ${sv}~${ev} 章（共 ${n} 章）已生成`);
      if(st) st.textContent = `✅ 第 ${sv}~${ev} 章已生成`;
    }catch(err){
      toast(`第 ${sv}~${ev} 章生成失败：${err.message}`);
      if(st) st.textContent = `❌ 生成失败`;
    }finally{
      btn.disabled = false; btn.textContent = '⚡ 区间生成';
      autoUpdateSubplots(); autoUpdateTimeAnchors();
    }
  };
  validateClamp();
}

  const api = {
    bindGenBatchControls,
    bindRangeGen
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns["chapter-generation-controls"] = Object.freeze(api);
  return ns["chapter-generation-controls"];
}

return Object.freeze({install});
})();

// ---- merged source: chapter-batch-generation.js ----
const _m6 = (() => {
/* v31: cohesive legacy region — chapter-batch-generation */

function install(deps){
  const {
    CH_PAGE_SIZE,
    autoUpdateSubplots,
    autoUpdateTimeAnchors,
    busy,
    chPage,
    chState,
    genNChapters,
    hideStopBtn,
    isLong,
    patchChapter,
    remainingEmptyChapters,
    renderChapters,
    showStopBtn,
    state,
    syncGenBatchControls,
    toast
  } = deps;
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];


async function genManyChapters(count, fromStart){
  const p = window.TellMeChapterBatchRunner;
  if(!p) throw new Error('章节批量运行模块尚未加载');
  const btn = $('#btnGenMany');
  const st = $('#chStatus');
  const genCtl = $('#btnGenAllChapters');
  const stopParent = (btn && btn.parentNode) || (genCtl && genCtl.parentNode);
  const confirmMissingPlans = ()=>{
    const _o = state.outline || {};
    const miss = [];
    (_o.chapters||[]).forEach((c,i)=>{ const plan=(_o.chapterPlans||[])[i];
      if(!plan || !String(plan.beatsText||'').trim()) miss.push(i+1);
    });
    return !miss.length || confirm(`第 ${miss.join('、')} 章缺节拍表，这些章将按大纲直接裸写。继续？`);
  };
  return p.generateManyChapters(count, fromStart, {
    state, isLong, genNChapters, remainingEmptyChapters, chState, patchChapter,
    totalChapters: ()=> (state.chapters||[]).length,
    setStatus: (msg, ok)=>{ if(st){ st.className = ok ? 'status ok' : 'status'; st.textContent = msg || ''; } },
    setBusy: (on)=>{ if(btn) busy(btn,on,on ? '逐章生成中…' : ''); },
    showStop: ()=>{ if(stopParent) showStopBtn(stopParent); },
    hideStop: ()=> hideStopBtn(),
    confirmMissingPlans, toast,
    pageSize: CH_PAGE_SIZE,
    currentPage: ()=> chPage,
    onPageChange: (page)=>{ chPage = page; renderChapters(); },
    syncControls: syncGenBatchControls,
    onFinally: ()=>{ autoUpdateSubplots(); autoUpdateTimeAnchors(); }
  });
}

  const api = {
    genManyChapters
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns["chapter-batch-generation"] = Object.freeze(api);
  return ns["chapter-batch-generation"];
}

return Object.freeze({install});
})();

// ---- merged source: chapter-single-generation-legacy.js ----
const _m7 = (() => {
/* v31: cohesive legacy region — chapter-single-generation-legacy */

function install(deps){
  const {
    PROMPTS,
    buildChapterUser,
    callDeepSeek,
    chapterStyleNote,
    isLong,
    persist,
    resolveActiveSpec,
    state
  } = deps;
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];


async function genOneChapterNoUI(i){
  const user = buildChapterUser(i);
  try{
    const txt = isLong()
      ? await window.TellMeChapterOutput.writeOneChapterContent(i, user)
      : window.TellMeAIJson.unwrapAIResult(await callDeepSeek(PROMPTS.chapterSys + chapterStyleNote(), user, {temperature: resolveActiveSpec().chapterTemp, taskKey:'chapter'})).trim();
    state.chapters[i].content = txt;
    persist();
  }catch(e){ /* 继续后续 */ }
}

  const api = {
    genOneChapterNoUI
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns["chapter-single-generation-legacy"] = Object.freeze(api);
  return ns["chapter-single-generation-legacy"];
}

return Object.freeze({install});
})();

// ---- merged source: chapter-output.js ----
const _m8 = (() => {
/**
 * Chapter output normalization helpers.
 * Pure text processing only: no DOM, AI transport, persistence, or UI state.
 */

const SEG_MARK_LINE = /^\s*[（(]\s*节拍\s*\d*\s*[：:、.,，．－—-]?\s*[^（）()\r\n]{0,34}?[）)]\s*$/;
const SEG_MARK_HEAD = /^\s*[（(]\s*节拍\s*\d*\s*[：:、.,，．－—-]?\s*[^（）()\r\n]{0,34}?[）)]\s*/;

function stripSegmentMarkers(txt){
  if(!txt) return txt;
  const s = String(txt);
  const lines = s.split(/\r?\n/);
  const out = [];
  let changed = false;
  for(const raw of lines){
    if(SEG_MARK_LINE.test(raw)){ changed = true; continue; }
    if(SEG_MARK_HEAD.test(raw)){ out.push(raw.replace(SEG_MARK_HEAD,'')); changed = true; continue; }
    out.push(raw);
  }
  if(!changed) return s;
  return out.join('\n').replace(/\n{3,}/g,'\n\n').trim();
}

function splitChapterOutput(txt){
  return { content: stripSegmentMarkers(txt), strip: '' };
}

function splitChapterCastout(prose){
  const lines = String(prose||'').split(/\r?\n/);
  const headerRe = /^[ \t]*【\s*本章出场人物\s*】\s*[:：]?\s*([\s\S]*)$/;
  const rawEntityRe = /^[ \t]*(?:(?:人物|地名|专名)[｜|][^\n]{0,160}[｜|]\s*[;；]?\s*)+$/;
  let castOut = '', bodyLines = lines.slice();
  while(bodyLines.length){
    const ln = bodyLines[bodyLines.length-1];
    const m = ln.match(headerRe);
    if(m){
      const t=String(m[1]||'').trim();
      if(t) castOut=t;
      bodyLines.pop();
      while(bodyLines.length && !String(bodyLines[bodyLines.length-1]).trim()) bodyLines.pop();
      continue;
    }
    if(rawEntityRe.test(ln)){
      const t=String(ln).trim();
      castOut = castOut ? `${t}；${castOut}` : t;
      bodyLines.pop();
      while(bodyLines.length && !String(bodyLines[bodyLines.length-1]).trim()) bodyLines.pop();
      continue;
    }
    break;
  }
  return { body: bodyLines.join('\n').replace(/\s+$/, '').trim(), castOut };
}

const __default = {
  stripSegmentMarkers,
  splitChapterOutput,
  splitChapterCastout,
};

return Object.freeze({stripSegmentMarkers, splitChapterOutput, splitChapterCastout, default: __default});
})();

export const chapter_generationModules = Object.freeze([_m0, _m1, _m2, _m3, _m4, _m5, _m6, _m7, _m8]);
