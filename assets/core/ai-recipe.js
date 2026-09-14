/* v26: cohesive legacy region extracted from app-legacy.js. */

export function install(deps){
  let {
    startBgTask,
    endBgTask,
    updateBgTaskIndicator,
    lsKeyFor,
    _timeAnchorOn,
    _timeAnchorsAutoOn,
    _timeBranch,
    destroyCharTS,
    parseAge,
    toastLogPush,
    toastLogGet,
    toastLogClear,
    toast,
    _sndEnabled,
    _sndVol,
    unlockAudio,
    _sndBeep,
    _sndSingleType,
    _sndAllType,
    setSoundSingleType,
    setSoundAllType,
    _doPlaySound,
    playDoneSound,
    initThemeSoundPanel,
    setSoundEnabled,
    setSoundVol,
    bindPlannerSoundTool,
    openToastBoard,
    copyText,
    esc,
    download,
    countWords,
    wcInner,
    wcBadge,
    remainingEmptyChapters,
    uid,
    glmModels,
    deepseekModels,
    defaultModels,
    cfgZhipuGroup,
    cfgDeepSeekGroup,
    normalizeCfg,
    getCfg,
    saveCfg,
    resolveActiveSpec,
    currentSpecLabel,
    currentIsDeepSeek,
    applyTheme,
    restartCascade,
    makeId,
    projectSnapshot,
    applyProject,
    clearState,
    writeOneProjectRecord,
    removeOneProjectRecord,
    idbSaveLib,
    saveLib,
    robustSaveLib,
    loadState,
    migrateLegacyLibrary,
    normalizeLegacyProject,
    migrateOldState,
    persist,
    aiLogPush,
    aiLogClear,
    openAiLogPanel,
    closeAiLogPanel,
    _f2,
    salvageOutlineFromText,
    busy,
    makeStopBtn,
    showStopBtn,
    hideStopBtn,
    genBusy,
    guardSwitchStep,
    polishIdea,
    formatIdeaBrief,
    formatIdeaDiagnosis,
    validatePolishOutput,
    splitPolishMultiText,
    showPolishResult,
    applyV45ToOutline,
    importPolishToState,
    openPolishBox,
    polishIdle,
    extractPolishTitle,
    renderPolishCards,
    bindPolishIdea,
    polishKeepBar,
    polishHistory,
    snapshotPolishBatch,
    applyPolishBatch,
    deletePolishBatch,
    openPolishBatchPanel,
    closePolishBatchPanel,
    openPolishBatchPreview,
    closePolishBatchPreview,
    parseCustomStyleNote,
    writeStyleLib,
    writeStyleById,
    _idName,
    wiseWhyText,
    curWriteStyle,
    wsGroupStyleTags,
    wsStyleNoteBlock,
    chapterStyleNote,
    writeStyleNamesBlock,
    sizeSlider,
    initDRS,
    pickSize,
    scHealState,
    scState,
    scRetry,
    setScRetry,
    scDone,
    invalidateSchoolDownstream,
    scFailed,
    scSetFailed,
    scMark,
    getSchoolStepStatus,
    scBadge,
    scRefreshBadge,
    schoolStepBtn,
    schoolTeacherBtn,
    scStyleBrief,
    scGlossaryBrief,
    scGroupBeats,
    scAllGroupsBeats,
    isSchoolFolded,
    extractSection,
    parsePrincipalTitles,
    isPrincipalTitlesApplied,
    applyPrincipalTitles,
    doApplyTitles,
    showTitleDiffModal,
    scGroupTitles,
    buildPrincipalUser,
    genPrincipal,
    buildTeacherUser,
    prevGroupTailState,
    genTeacher,
    nailRetry,
    refreshSchoolProgressUi,
    genSchoolAll,
    bindSchoolSteps,
    getFieldTagClass,
    saveTeacherFieldEdit,
    openSchoolPlanReader,
    renderSchoolPlanBody,
    openSchoolPrincipalReader,
    renderSchoolPrincipalBody,
    openSchoolRawPanel,
    nmNameRuleViolation,
    normalizeBanList,
    banListRaw,
    stateBanEnabled,
    banListChars,
    banListNames,
    banListAiActive,
    banListBlockFor,
    banListViolation,
    currentBookBeatId,
    currentBookBeatCfg,
    bookBeatHtml,
    bookBeatBriefHtml,
    currentBeatId,
    currentBeatCfg,
    beatTypesDefs,
    beatTypeKeys,
    beatCnt,
    beatLabelFor,
    beatNoteFor,
    isClimaxType,
    validateStripLen,
    ideaKeyTerms,
    validateIdeaFaithful,
    validateIdeaProOutput,
    validateAIOutput,
    callAIGuarded,
    getSystemPrompt,
    buildAIPrompt,
    buildIdeaPolishUser,
    buildSubplotUser,
    buildStripUser,
    canRunAI,
    markAIRunning,
    markAIDone,
    addToFixQueue,
    langLayerInjection,
    globalCreativeConstraintBlock,
    narrativeIronBlock,
    glossaryForAI,
    glossaryDupNoteHtml,
    chapterGlossaryBlock,
    subplotProgressBlock,
    bindPlannerTitles,
    extractSubplotUpdates,
    mergeSubplotUpdates,
    autoUpdateSubplots,
    manualExtractGlossary,
    openCleanPanel,
    openCoveragePanel,
    closeCoveragePanel,
    extractChapterEndTime,
    autoUpdateTimeAnchors,
    openSubplotBoard,
    openTimelineBoard,
    chapterLenBounds,
    sizeChapterInjection,
    bindSizeHint,
    chapterSysBase,
    fullStoryText,
    isLong,
    renderStepper,
    updateMechaNav,
    render,
    currentTitle,
    pushTitleHistory,
    renameTitle,
    titleManagerHtml,
    writeStyleState,
    wsDraftInit,
    wsDraftDirty,
    refreshWsUI,
    wsColorCfgOf,
    wsColorCfg,
    wsCustomColors,
    wsRemovedBuiltin,
    wsRemovedCustom,
    wsUndoLog,
    wsColorSchemesList,
    wsSchemeColors,
    wsSchemeName,
    wsColorSchemeId,
    rebuildCustomColorCss,
    writeStyleChipsHtml,
    toggleWriteTag,
    writeStyleCard,
    bindWriteStyle,
    openStyleNewDialog,
    closeStyleNewDialog,
    applyWritePresetDraft,
    openStyleLibPanel,
    importWsStyleBundle,
    closeStyleLibPanel,
    openStyleLibReader,
    closeStyleLibReader,
    flowNavItems,
    flowNavHtml,
    bindFlowSideNav,
    flowPlaceholderSec,
    openFactCardModal,
    openRollingSummaryModal,
    consistencyReportHtml,
    normTimeW,
    openConsistencyCheck,
    safeCard,
    causalityMapHtml,
    relationshipTrajectoryHtml,
    seamAuditHtml,
    longNovelHealthHtml,
    getDeckStepStatus,
    openCreationProgressModal,
    longNovelControlDeckHtml,
    longNovelMemoryRepoHtml,
    bindLongNovelMemoryRepo,
    bindLongNovelControlDeck,
    viewStory,
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
    setChapterTitle,
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
    microBeatBlock,
    schoolPipelineProgress,
    schoolZoneBlock,
    bindChapterPlanFold,
    bindChapterPlan,
    bindBeatSheet,
    glossaryFieldCheck,
    glossaryCheckCount,
    parseAgeNum,
    auditGlossaryPlausibility,
    plausibilityCount,
    openGlossaryCheckPanel,
    closeGlossaryCheckPanel,
    openGlossaryNewPanel,
    closeGlossaryNewPanel,
    glossaryCardHtml,
    bindGlossary,
    fmtWR,
    validAssoc,
    openGlossaryTableView,
    pushRelTablesHistory,
    openRelTablesHistoryPanel,
    gsPushUndo,
    glossaryHistoryPush,
    renderGlossaryHistory,
    applyGlossaryHistorySnapshot,
    exportGlossaryJson,
    sourceHasGlossary,
    glossaryMerge,
    loadGlib,
    saveGlib,
    glibUse,
    glibSave,
    glibDel,
    closeGlibPanel,
    openGlibPanel,
    exportWorkGlossaryJSON,
    normalizeGlossaryJSON,
    importGlossaryJson,
    glossaryAliases,
    syncNameEverywhere,
    scanGlossaryImpact,
    escRe,
    openGlossaryPanel,
    renderGlossaryOnly,
    regenSelectedChapters,
    closeGlossaryPanel,
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
    viewCharacters,
    charCard,
    bindCharEdit,
    charFiltered,
    applyCharFilters,
    bindCopyBtns,
    initCharFilter,
    coverCardHtml,
    viewScenes,
    viewStoryboard,
    shotHtml,
    bindShotEdit,
    updateBoardTiming,
    fallbackRaw,
    readyForAssets,
    viewExport,
    longExportView,
    openExportReader,
    buildLongMarkdown,
    activeChapters,
    syncExpChecks,
    downloadBlob,
    expText,
    expEpub,
    expDocx,
    freeText,
    buildMarkdown,
    bindView,
    genDictMaster,
    dictMasterBlockHtml,
    openDictMasterHistoryPanel,
    bindDictMaster,
    cleanEntityName,
    buildDictEnrichUser,
    parseDictEnrichText,
    mergeDictEnrich,
    _parsedCastList,
    harvestCandidates,
    _evidWindow,
    buildDictHarvestUser,
    dictHarvestGate,
    genDictHarvest,
    mergeDictHarvest,
    dictEnrichGate,
    genDictEnrich,
    buildDictEnrichSummary,
    dictEnrichBlockHtml,
    bindDictEnrich,
    closeChapterSummaryPanel,
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
    bindGenBatchControls,
    bindRangeGen,
    genManyChapters,
    genOneChapterNoUI,
    pushAssetHist,
    assetHistCount,
    hasAssetHist,
    openAssetHistPanel,
    closeAssetHistPanel,
    genCharacters,
    genScenes,
    genCover,
    genStoryboard,
    fmtHistTime,
    histProgress,
    renderHistList,
    histItemPreview,
    openHistPanel,
    closeHistPanel,
    switchProject,
    newProject,
    newLongProject,
    deleteProject,
    rebindHistPanel,
    buildFyp,
    parseFyp,
    exportProjectFile,
    importProjectFile,
    wsColorToolbarHtml,
    wsColorGridHtml,
    wsColorNewFormHtml,
    renderWsColorPanel,
    openWsColorPanel,
    closeWsColorPanel,
    wsColorRepaint,
    wsColorSelect,
    wsColorDelete,
    wsColorUndo,
    wsColorRestoreAll,
    wsColorCreate,
    rebindWsColorPanel,
    openThemePanel,
    closeThemePanel,
    openNarrativeEngine,
    closeNarrativeEngine,
    openNeModal,
    closeNeModal,
    renderNarrativeEngineMenu,
    rebindNarrativeEngine,
    renderResumePanel,
    handleBanListAction,
    renderIronPanel,
    renderBanListPanel,
    banListAiScopeLabels,
    renderTitleCandidates,
    openSettings,
    closeSettings,
    echoTemps,
    saveTemps,
    _curSpec,
    shortModel,
    updateCfgBadge,
    tmCustomCount,
    updateTmBadge,
    tmResolvePreview,
    openTaskModelPanel,
    closeTaskModelPanel,
    requestCloseTaskModelPanel,
    refreshTmResetBtn,
    renderTaskModelPanel,
    saveTaskModels,
    resetTaskModels,
    renderGroupsList,
    _dg,
    renderGroupDetail,
    onDetail,
    refreshAfter,
    addGroup,
    renderActiveSelects,
    saveSettings,
    testConn,
    showBootLoading,
    init,
    APP_VERSION,
    KEY_CFG,
    _bgTaskCount,
    _bgTaskLabel,
    KEY_STATE,
    KEY_INDEX,
    KEY_PROJ_PREFIX,
    KEY_GLIB,
    LS_SINGLE_SAFE,
    MAX_PROJECTS,
    lib,
    gglib,
    state,
    currentStep,
    TOAST_LOG_KEY,
    SND_KEY,
    SND_VOL_KEY,
    _snd,
    SND_SINGLE_PRESETS,
    SND_ALL_PRESETS,
    SND_TSINGLE_KEY,
    SND_TALL_KEY,
    _lastSoundTs,
    _lastSoundKind,
    _soundTimer,
    CJK_ALL,
    EN_WORD,
    uidSeq,
    genBatchN,
    TM_KEYS,
    THEMES,
    KEY_AILOG,
    aiLog,
    callDeepSeek,
    _abortCtl,
    _abortBtn,
    _aiOptBusy,
    LONG_CHAPTER_SYS_PRO,
    PROMPTS,
    SIZE_DEFAULT,
    polishMulti,
    POLISH_PALETTE,
    WRITE_STYLES,
    WRITE_COMBOS,
    AI_CAT_LABEL,
    aiRp,
    KEY_AIHIST,
    AIHIST_CAP,
    AIHIST_MAX_BYTES,
    AI_RECIPE_SYS_PRO,
    _idNameMap,
    SCHOOL_GROUP_MIN,
    SCHOOL_GROUP_MAX,
    SCHOOL_RETRY_MAX,
    PRINCIPAL_SYS,
    PRINCIPAL_FOLDED_SYS,
    TEACHER_SYS,
    _planCUR_GI,
    _prCUR_VIEW,
    NM_SURNAME_1,
    NM_SURNAME_2,
    NM_WEB_BLACKLIST,
    NM_BANNED_CHARS,
    NM_BANNED_NAMES,
    BANLIST_DEFAULT,
    BOOK_BEAT_OPTIONS,
    BOOK_BEAT_DEFAULT_ID,
    BEAT_OPTIONS,
    BEAT_DEFAULT_ID,
    BEAT_LABEL_ALL,
    BEAT_LEGACY_LABEL,
    BEAT_HINT_ALL,
    BEAT_ENDING,
    STRIP_READ_SYS_LEGACY,
    STRIP_READ_SYS_PRO,
    STRIP_READ_SYS,
    AIValidators,
    AIBus,
    LANG_LAYER_SYS,
    NARRATIVE_IRON_HARD,
    NARRATIVE_IRON_SOFT,
    NARRATIVE_IRON_PLANNING,
    REGEN_TITLES_SYS_LEGACY,
    REGEN_TITLES_SYS_PRO,
    REGEN_TITLES_SYS,
    IDEA_POLISH_SYS_PRO,
    IDEA_POLISH_SYS,
    POLISH_MULTI_MODE,
    SUBPROGRESS_UPDATE_SYS,
    SUB_STATUSES,
    TIME_ANCHOR_SYS,
    longChapterSys,
    CYBER_HOME_GRID,
    WRITE_PRESETS,
    getWsDraft,
    setWsDraft,
    WS_COLOR_SCHEMES,
    FLOW_NAV,
    ctAdviceCand,
    ctAdviceFold,
    ctAdoptedIdx,
    GVT_CFG,
    gsUndoStack,
    GS_UNDO_MAX,
    chPage,
    CH_PAGE_SIZE,
    readerCur,
    lnER,
    genOutline,
    DICTMASTER_SYS,
    DICT_ENRICH_SYS,
    DICT_HARVEST_SYS,
    USER_PRIO_BILL,
    _dictRedlineOver,
    chState,
    aiAdviceCand,
    ASSET_LABEL,
    histOpenId,
    editCfg,
    selGroupId,
    TM_GROUPS,
    TM_TEMP
  } = deps;

function availableCombos(){
  const c = getCfg().styleCustom || {};
  c.customCombos = Array.isArray(c.customCombos) ? c.customCombos : [];
  const removed = Array.isArray(c.comboRemoved) ? c.comboRemoved : [];
  const libIds = writeStyleLib().map(s=>s.id);
  const builtin = WRITE_COMBOS.filter(x=> !removed.includes(x.id));
  const mine = c.customCombos
    .map(x=>({ ...x, custom:true, tags:(x.tags||[]).filter(id=> libIds.includes(id)) }))
    .filter(x=> x.tags.length > 0);
  return builtin.concat(mine);
}

function getAiHist(){ try{ return JSON.parse(localStorage.getItem(KEY_AIHIST)||'[]'); }catch(e){ return []; } }

function setAiHist(a){
  let list = Array.isArray(a) ? a.slice(-AIHIST_CAP) : [];
  let s;
  try{ s = JSON.stringify(list); }catch(e){ return; }
  while(list.length && s.length > AIHIST_MAX_BYTES){ list.shift(); s = JSON.stringify(list); }
  try{ localStorage.setItem(KEY_AIHIST, s); }catch(e){ /* 超限静默；设独立键，不影响主 cfg */ }
}

function addAiHist(entry){ const a = getAiHist(); a.push(entry); setAiHist(a); return a.length; }

function snapAiHist(){ return getAiHist(); }

function aiHistEntryId(){ return 'ah'+Date.now().toString(36); }

function histState(kind){
  const s = state;
  if(kind === 'ct'){ if(!Array.isArray(s.ctAdviceHist)) s.ctAdviceHist = []; return s.ctAdviceHist; }
  if(kind === 'content'){ if(!Array.isArray(s.contentAdviceHist)) s.contentAdviceHist = []; return s.contentAdviceHist; }
  return [];
}

function addAdvHist(kind, entry){
  const a = histState(kind);
  a.push(entry);
  if(a.length > 30) a.splice(0, a.length - 30);   // 小体积文本，按条数截断即可
  persist();
  return a.length;
}

function openAdvHistPanel(kind){
  const hist = histState(kind).slice();
  const mode = kind === 'content';
  const ov = document.createElement('div'); ov.id='advHistPanel'; ov.className='gs-overlay';
  const entHtml = (e,hi)=>{
    const ei = hist.length-1-hi;   // 倒序序号（与展示一致）
    return `<div class="ws-lib-group ws-lib-fold" style="margin-top:6px">
      <div class="ws-lib-fold-t" data-ah-fold="${ei}" role="button" tabindex="0" title="展开/收起">
        <span>${mode?'📄':'📝'} ${esc(e.desc||'')} <span class="muted" style="font-size:10px">· ${new Date(e.ts).toLocaleString('zh-CN',{hour12:false})}</span></span>
        <span class="sc-fold-ico">▸</span>
      </div>
      <div class="ws-lib-fold-body" style="display:none">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px">
          <button type="button" class="btn small ghost" data-ah-apply="${ei}">↩ 回填首条建议</button>
          <button type="button" class="btn small ghost" data-ah-del="${ei}">删</button>
        </div>
        ${ (Array.isArray(e.list)&&e.list.length) ? e.list.map((c,i)=>aiAdvHistCandHtml(c,i)).join('<hr style="margin:6px 0;opacity:.2">') : '<p class="muted">无建议。</p>' }
      </div>
    </div>`;
  };
  const list = hist.slice().reverse();
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>${mode?'📄':'📝'} ${mode?'章节内容':'章节标题'} AI 建议历史（${hist.length}）</b>
        <span style="display:flex;gap:6px">
          <button class="btn small ghost" data-ah-clear>清空</button>
          <button class="gs-x" data-ah-close>✕</button>
        </span></div>
      <div class="cv-body">
        ${ list.length ? list.map(entHtml).join('') : '<p class="muted">暂无历史。用「✨ AI 优化此建议」生成后即自动保存于此，可随时回看。</p>' }
      </div>
    </div>`;
  const close = ()=>{ const p=$('#advHistPanel'); if(p) p.remove(); };
  ov.addEventListener('click', (e)=>{
    const cl = e.target.closest('[data-ah-close]'); if(cl){ close(); return; }
    const fold = e.target.closest('[data-ah-fold]');
    if(fold){ const body = fold.closest('.ws-lib-group').querySelector('.ws-lib-fold-body'); if(body){ const open = body.style.display!=='none'; body.style.display = open?'none':'block'; fold.querySelector('.sc-fold-ico').textContent = open?'▸':'▾'; } return; }
    const apply = e.target.closest('[data-ah-apply]');
    if(apply){
      const ei=+apply.dataset.ahApply; const entry=hist[ei];
      if(entry && Array.isArray(entry.list) && entry.list.length){
        if(mode){
          aiAdviceCand = entry.list.slice(0,3);
          const out = $('[data-advice-ai-out]'); if(out) out.innerHTML = aiAdviceResultHtml();
          const ta = $('#rpAdvice'); if(ta){ ta.value = (entry.list[0]&&entry.list[0].text)||''; ta.focus(); }
        }else{
          ctAdviceCand = entry.list.slice(0,3); ctAdviceFold = false; ctAdoptedIdx = -1;
          const out = $('[data-cth-ai-out]'); if(out) out.innerHTML = ctAdviceResultHtml();
          updateFoldBtn();
          const inp = $('#rtInput'); if(inp) inp.value = (entry.list[0]&&entry.list[0].text)||'';
        }
        toast('已回填该条建议');
      }
      close(); return;
    }
    const del = e.target.closest('[data-ah-del]');
    if(del){ const ei=+del.dataset.ahDel; const a=histState(kind); if(a[ei]){ a.splice(ei,1); persist(); } refreshAdvHistBadge(kind); const p=$('#advHistPanel'); if(p) p.remove(); openAdvHistPanel(kind); return; }
    const clr = e.target.closest('[data-ah-clear]');
    if(clr){ if(confirm('确认清空全部该建议历史？')){ histState(kind).length = 0; persist(); refreshAdvHistBadge(kind); close(); } return; }
    if(e.target===ov) close();
  });
  document.body.appendChild(ov);
}

function aiAdvHistCandHtml(c,i){
  return `<div class="advice-ai-cand"><div class="advice-ai-head"><span class="advice-ai-idx">${'①②③'[i]||(i+1)}</span><b>${esc(c.title||('方案'+(i+1)))}</b></div><p>${esc(c.text||'')}</p></div>`;
}

function refreshAdvHistBadge(kind){
  if(kind === 'ct'){
    const card = $('.ct-block');
    if(card){ const b = card.querySelector('[data-ctadv-hist] .ai-hist-badge'); if(b) b.textContent = histState('ct').length||''; }
  }else{
    const rp = $('#regenPanel');
    if(rp){ const b = rp.querySelector('[data-advadv-hist] .ai-hist-badge'); if(b) b.textContent = histState('content').length||''; }
  }
}

function aiRecipeUser(extra){
  const cand = selectedPolishCandidate();
  const txt = String((cand && cand.text)||'').trim();
  if(txt){
    const body = stripStructureFromIntro(txt);
    const head = '【所选方案完整原文（唯一蓝本：含书名+九要素，配方须百分之百贴合本小说）】\n' + body;
    return extra ? `${head}\n\n以下为对该小说的写作风格配方设计请求：\n${extra}` : head;
  }
  const o = state.outline || {};
  const head = (String(o.title||'').trim() && String(o.logline||'').trim())
    ? `【小说书名】${o.title}\n【小说简介】${o.logline}\n\n以下为该小说的写作风格配方设计请求：`
    : '（尚未生成大纲：为让 AI 依据本小说书名与简介设计更贴合的风格配方，建议先到「大纲」步生成书名与简介。）';
  return extra ? `${head}\n\n${extra}` : head;
}

function aiRecipeSpecNote(s){
  const n = String(s.note||'').trim();
  if(!n) return '';
  const multi = n.includes('\n') && /写法|避免|自查/.test(n);
  const head = n.split('\n')[0].trim();
  return (multi ? (head ? head + '（多行配方·详见词库）' : '（多行配方·详见词库）') : n).slice(0,60);
}

function aiRecipePrompt(userDesc){
  const lib = writeStyleLib();
  const spec = lib.map(s=> `- ${s.id}：${s.name}（${s.cat||'custom'}）｜${aiRecipeSpecNote(s)}`).join('\n');
  return { system: AI_RECIPE_SYS_PRO + '\n\n【现有词库 id/name/cat】：\n' + spec, user: aiRecipeUser(userDesc) };
}

function aiRecipeCard(){
  const lib = writeStyleLib();
  const collapsed = getCfg().aiRecipeCollapsed === true;
  return `<div class="card ai-recipe-card card-theme-recipe${collapsed?' collapsed':''}">
    <div class="ai-recipe-head card-head-bar" data-ai-recipe-fold role="button" tabindex="0" title="展开/收起">
      <div class="ch-left">
        <span class="ch-badge ch-badge-recipe">🧪</span>
        <h3 class="ch-title">AI 配方助手</h3>
        <span class="ch-subtag ch-subtag-recipe">风格设计 · 智能搭配</span>
      </div>
      <div class="ch-right">
        <button type="button" class="ai-upload-btn ai-hist-btn" data-ai-recipe-hist title="AI 配方历史：回看已生成过的候选配方">📖<span class="ai-hist-badge">${snapAiHist().length||''}</span></button>
        <span class="sc-fold-ico">${collapsed?'▸':'▾'}</span>
      </div>
    </div>
    <div class="ai-recipe-body">
      <div class="ai-desc-wrap">
        <textarea id="aiReDesc" rows="3" placeholder="" style="width:100%;box-sizing:border-box"></textarea>
      </div>
      <div class="ai-recipe-tool">
        <button type="button" class="btn primary" data-ai-recipe-gen>✨ 生成配方</button>
        <button type="button" class="btn small ghost" data-ai-recipe-clear>清空</button>
      </div>
      <div data-ai-recipe-out>${ aiRecipeResultHtml(lib) }</div>
    </div>
  </div>`;
}

function aiRecipeResultHtml(lib){
  if(aiRp && aiRp.err) return `<p class="muted" style="color:var(--danger);margin:8px 0 0">⚠️ ${esc(aiRp.err)}</p>`;
  if(!aiRp || !Array.isArray(aiRp.list) || !aiRp.list.length){
    return '';
  }
  const libIds = (lib||writeStyleLib()).map(s=>s.id);
  return aiRp.list.map((c,ci)=>`
    <div class="ai-recipe-cand${ ci===aiRp.hi ? ' hi' : '' }">
      <div class="ai-recipe-cand-head">
        <b>${esc(c.name||('候选'+ (ci+1)))}</b>
        ${ recipeScBadge(c) }
        <span class="muted" style="font-size:11px">${esc(c.desc||'')}</span>
      </div>
      <div class="ai-recipe-tags">${ (c.tags||[]).map(id=>{ const s=writeStyleById(id); return `<span class="ai-recipe-tg"${s?'':' title="引用了词库外 id"'} style="${s?'':'opacity:.65'}">${esc(s?s.name:id)}${s?'':'（词库外）'}</span>`; }).join('') }</div>
      <div class="ai-recipe-sec"><span class="ar-lab">为何这样选</span>${esc(wiseWhyText(c.why||''))}</div>
      <div class="ai-recipe-sec"><span class="ar-lab">适用场景</span>${esc(wiseWhyText(c.scenario||''))}</div>
      <div class="ai-recipe-gap">
        ${ gapHtml(c, ci) }
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="btn small primary" data-ai-recipe-pick="${ci}">✔ 选用此配方</button>
        <button type="button" class="btn small ghost" data-ai-recipe-save="${ci}" title="仅存入「我的配方」，不应用到写作风格">＋ 收藏不采用</button>
      </div>
    </div>`).join('');
}

function gapFiveHtml(g){
  const hasStruc = Array.isArray(g.tips)||Array.isArray(g.avoid)||Array.isArray(g.check);
  const p = hasStruc
    ? { intro:g.note||'', tips:Array.isArray(g.tips)?g.tips:[], avoid:Array.isArray(g.avoid)?g.avoid:[], check:Array.isArray(g.check)?g.check:[], demo:g.demo||'' }
    : parseCustomStyleNote(g.note||'');
  const parts = [];
  if(String(p.intro||'').trim()) parts.push('<div><b>指令</b>：'+esc(p.intro)+'</div>');
  if(p.tips&&p.tips.length) parts.push('<div><b>写法</b>：'+esc(p.tips.join('；'))+'</div>');
  if(p.avoid&&p.avoid.length) parts.push('<div><b>避免</b>：'+esc(p.avoid.join('；'))+'</div>');
  if(p.check&&p.check.length) parts.push('<div><b>自查</b>：'+esc(p.check.join('；'))+'</div>');
  if(String(p.demo||'').trim()) parts.push('<div class="ar-gap-demo"><b>示例</b>：'+esc(p.demo)+'</div>');
  return parts.join('');
}

function gapHtml(c, ci){
  if(!Array.isArray(c.gap) || !c.gap.length) return `<span class="ar-ok">✓ 现有词库即可覆盖，无需新词条</span>`;
  const pending = c.gap.some(g => !((c.tags||[]).includes(g.id) || libHas(g.id)));
  return `<div class="ar-gaptitle">⚠️ 存在词条缺口（共 ${c.gap.length} 项，可逐条或一键全部加入，确认后立即纳入当前配方）</div>
  ${ c.gap.map((g,gi)=>`
    <div class="ai-recipe-gapitem">
      <div class="ar-gaphead"><b>${esc(g.name||'')}</b><span class="muted" style="font-size:11px">${ (AI_CAT_LABEL[g.cat]||g.cat||'custom') }</span></div>
      <div class="ar-gapwhy">${esc(g.reasons||'')}</div>
      <div class="ar-gapnote">${gapFiveHtml(g)}</div>
      ${ g.warning ? `<div class="ar-gapwarn">⚠️ ${esc(g.warning)}</div>` : '' }
      <button type="button" class="btn small ghost" data-ai-recipe-addgap="${ci}__${gi}" ${ (c.tags||[]).includes(g.id)|| libHas(g.id) ? 'disabled' : '' }>＋ 加入词库</button>
    </div>`).join('') }
  ${ c.gap.length>1 ? `<div style="margin-top:6px"><button type="button" class="btn small primary" data-ai-recipe-addgapall="${ci}" ${pending?'':'disabled'} title="仅加入尚未入库的新词条；已入库的自动跳过">＋ 全部加入词库</button></div>` : '' }`;
}

function libHas(id){ return !!writeStyleById(id); }

function prepRecipeList(list){
  if(!Array.isArray(list)) return list;
  list.forEach(c=>{
    if(c && typeof c==='object'){
      c._gapOk = !(Array.isArray(c.gap) ? c.gap : []).some(n =>
        !n || !String(n.note||'').trim() || !(Array.isArray(n.tips) && n.tips.length) ||
        !(Array.isArray(n.avoid) && n.avoid.length) || !(Array.isArray(n.check) && n.check.length) ||
        !String(n.demo||'').trim());
    }
  });
  return list;
}

function recipeScBadge(c){
  return (c && c._gapOk === false) ? `<span class="ai-recipe-sc bad" title="建议的新词条缺少 note/tips/avoid/check/demo 中的维度，入典前请补全">⚠ 词条缺维</span>` : '';
}

async function aiRecipeProduce(system, user){
  const opt = { maxTokens: clampMaxTokens('recipe'), temperature:(getCfg().aiRecipeTemp==null?0.9:getCfg().aiRecipeTemp), topP:0.5 };
  const FIX = `\n\n【上一轮修正：gap 按需给全、不机械硬造】缺口与否由你自主判断：现有词库能完全覆盖时 gap 应为 null（0 条，不要为凑数而硬造）；确有多条真实缺口时才写 gap，并把它们一次给全（不要只给 1 个、不要合并）；gap 非空时每个新词条必须五维齐全——note（一句话定位）、tips（≥2 条）、avoid（≥1 条）、check（≥1 条）、demo（示例句）。请为非 null 的 gap 给全、给对上述字段。`;
  const FIX_JSON = `\n\n【上一轮修正：JSON 解析失败】上一轮输出无法被解析为合法 JSON 数组。请严格只输出一个 JSON 数组（不要 markdown 代码块、不要解释、不要任何额外文字）。`;
  let list = null, lastJsonOk = false;
  for(let attempt=1; attempt<=2; attempt++){
    const sys = attempt>1 ? String(system) + (lastJsonOk ? FIX : FIX_JSON) : system;
    const raw = unwrapAIResult(await callDeepSeek(sys, user, Object.assign({}, opt, {taskKey:'recipe'})));
    const cands = prepRecipeList(parseAiJsonList(raw));
    lastJsonOk = Array.isArray(cands) && cands.length > 0;
    if(lastJsonOk){ list = cands; break; }
  }
  if(!list || !list.length) throw new Error('AI 未返回有效配方，请重试');
  return list;
}

async function aiRecipeGen(){
  const ta = $('#aiReDesc'); if(!ta) return;
  const desc = (ta.value||'').trim();
  const hasLine = !!((selectedPolishCandidate()||{}).text || '').trim();
  if(!desc && !hasLine){ toast('请先描述你想要的风格'); return; }
  if(!desc && hasLine){ toast('将仅依据所选方案设计配方'); }
  const out = $('[data-ai-recipe-out]'); if(out) out.innerHTML = `<p class="muted" style="margin:8px 0 0">⏳ AI 正在${hasLine?'依据所选方案':'根据你的描述'}设计候选配方与词条缺口……</p>`;
  const gen = $('[data-ai-recipe-gen]'); if(gen){ gen.disabled = true; gen.textContent = '生成中…'; }
  try{
    const {system, user} = aiRecipePrompt(desc);
    const list = await aiRecipeProduce(system, user);   // D2/C①：生成即校验新词条五维齐全，不合格自动重试
    aiRp = { list, hi: 0 };
    addAiHist({ id: aiHistEntryId(), ts: Date.now(), src:'desc', desc: desc || '依据所选方案', list: JSON.parse(JSON.stringify(list)), applied:[] });
  }catch(e){
    aiRp = { list:null, err: (e&&e.message)||'生成失败' };
  }
  if(out) out.innerHTML = aiRecipeResultHtml();
  if(gen){ gen.disabled = false; gen.textContent = '✨ 生成配方'; }
}

function parseAiJsonList(raw){
  let t = String(raw||'').trim();
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if(m) t = m[1].trim();
  try{ const a = JSON.parse(t); return Array.isArray(a)? a : null; }catch(e){
    try{ const i = t.indexOf('['), j = t.lastIndexOf(']'); if(i>=0&&j>i){ const a = JSON.parse(t.slice(i,j+1)); return Array.isArray(a)? a:null; } }catch(e2){}
    return null;
  }
}

function storeRecipeCandidate(c){
  if(!c) return null;
  const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
  cfg.styleCustom.customCombos = cfg.styleCustom.customCombos || [];
  const libIds = writeStyleLib().map(s=>s.id);
  let name = (c.name||'').trim(); if(!name) name = 'AI配方'+(cfg.styleCustom.customCombos.length+1);
  const names = cfg.styleCustom.customCombos.map(x=>x.name);
  let k = 2; while(names.includes(name)) name = (c.name||('AI配方'+(cfg.styleCustom.customCombos.length+1)))+'·'+ (k++);
  let tags = (c.tags||[]).filter(id=> libIds.includes(id));
  (c.gap||[]).forEach(g=>{ if(g && g.id && libIds.includes(g.id) && !tags.includes(g.id)) tags.push(g.id); });
  cfg.styleCustom.customCombos.push({ id:'cu'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), name, desc:(c.desc||''), why: wiseWhyText(c.why||''), tags });
  saveCfg(cfg);
  return { combo:cfg.styleCustom.customCombos[cfg.styleCustom.customCombos.length-1], name };
}

function aiRecipeStore(ci){
  if(!aiRp || !Array.isArray(aiRp.list)) return null;
  return storeRecipeCandidate(aiRp.list[ci]);
}

function applyChosenCandidate(c, opts){
  if(!c) return null;
  const stored = storeRecipeCandidate(c); if(!stored) return null;
  const libIds = writeStyleLib().map(s=>s.id);
  const st2 = writeStyleState();
  const d2 = wsDraftInit();                       // 从生效配置取 tags
  d2.tags = (c.tags||[]).filter(id=> libIds.includes(id));   // 替换而非并集
  (c.gap||[]).forEach(g=>{ if(g && g.id && libIds.includes(g.id) && !d2.tags.includes(g.id)) d2.tags.push(g.id); });
  st2.tags = d2.tags.slice();
  persist();
  setWsDraft(null);                                 // 草稿与生效合一 -> 卡片显示「✔已生效」
  if(!opts || opts.render !== false) aiRp = null;
  if(!opts || opts.render !== false){ render(); refreshWsUI(); }
  toast('已应用到「写作风格」：'+stored.name);
  return stored;
}

function aiRecipePick(ci){
  if(!aiRp || !Array.isArray(aiRp.list)) return;
  applyChosenCandidate(aiRp.list[ci]);
}

function aiRecipeApply(idx){
  if(!aiRp || !aiRp.list[idx]) return;
  applyChosenCandidate(aiRp.list[idx], {});
}

function aiRecipeSave(ci){
  if(!aiRp || !Array.isArray(aiRp.list)) return;
  const stored = aiRecipeStore(ci); if(!stored) return;
  toast('已加入「我的配方」（未应用）：'+stored.name);
}

function addGapEntryToLib(g){
  if(!g) return null;
  if(writeStyleById(g.id)) return null;
  const group = ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].includes(g.cat) ? g.cat : 'custom';
  const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
  cfg.styleCustom.added = cfg.styleCustom.added || [];
  const id = (g.id && /^[a-z][a-z0-9_]*$/i.test(g.id)) ? g.id : ('c'+Math.random().toString(36).slice(2,8));
  let finalId = id, mx = 1; const existing = writeStyleLib().map(s=>s.id);
  while(existing.includes(finalId)) finalId = id + (mx++);
  cfg.styleCustom.added.push({ id:finalId, group, name:(g.name||'').trim(), note:(g.note||'').trim(),
    tips:Array.isArray(g.tips)?g.tips.map(x=>String(x||'').trim()).filter(Boolean):[],
    avoid:Array.isArray(g.avoid)?g.avoid.map(x=>String(x||'').trim()).filter(Boolean):[],
    check:Array.isArray(g.check)?g.check.map(x=>String(x||'').trim()).filter(Boolean):[],
    demo:(g.demo||'').trim(), seal:(g.seal===undefined?0:g.seal), warning:(g.warning||'') });
  saveCfg(cfg);
  const d = wsDraftInit(); if(!d.tags.includes(finalId)) d.tags.push(finalId);
  return finalId;
}

function aiRecipeAddGap(key){
  if(!aiRp || !Array.isArray(aiRp.list)) return;
  const [ci, gi] = String(key||'').split('__').map(Number);
  const c = aiRp.list[ci]; if(!c) return;
  const g = (c.gap||[])[gi]; if(!g) return;
  const finalId = addGapEntryToLib(g);
  if(!finalId){ toast('该词条已在词库中'); return; }
  if(c.tags && !c.tags.includes(finalId)) c.tags.push(finalId);
  toast('已加入词库并纳入当前配方：'+(g.name||finalId));
  const out = $('[data-ai-recipe-out]'); if(out) out.innerHTML = aiRecipeResultHtml();
}

function aiHistAddGap(ei, ci, gi){
  const a = getAiHist(); const entry = a[ei]; if(!entry||!Array.isArray(entry.list)) return;
  const c = entry.list[ci]; if(!c) return;
  const g = (c.gap||[])[gi]; if(!g) return;
  const finalId = addGapEntryToLib(g);
  if(!finalId){ toast('该词条已在词库中'); return; }
  toast('已加入词库并纳入当前配方：'+(g.name||finalId));
  const out = $('[data-ai-recipe-out]'); if(out) out.innerHTML = aiRecipeResultHtml();
}

function aiHistAddGapAll(ei, ci){
  const a = getAiHist(); const entry = a[ei]; if(!entry||!Array.isArray(entry.list)) return;
  const c = entry.list[ci]; if(!c||!Array.isArray(c.gap)||!c.gap.length) return;
  let added = 0, skipped = 0;
  c.gap.forEach((g)=>{
    if(!g) return;
    if((c.tags||[]).includes(g.id) || writeStyleById(g.id)){ skipped++; return; }
    if(addGapEntryToLib(g)) added++;
  });
  const out = $('[data-ai-recipe-out]'); if(out) out.innerHTML = aiRecipeResultHtml();
  toast(added ? (skipped ? `已加入 ${added} 条新词条（跳过已入库 ${skipped} 条），并已纳入当前配方` : `已加入 ${added} 条新词条，并已纳入当前配方`) : '这些新词条都已在词库中，无需重复加入');
}

function aiRecipeAddGapAll(ci){
  if(!aiRp || !Array.isArray(aiRp.list)) return;
  const c = aiRp.list[ci]; if(!c || !Array.isArray(c.gap) || !c.gap.length) return;
  let added = 0, skipped = 0;
  c.gap.forEach((g, gi)=>{
    if((c.tags||[]).includes(g.id) || (g && writeStyleById(g.id))){ skipped++; return; }
    aiRecipeAddGap(ci + '__' + gi); added++;
  });
  toast(added ? (skipped ? `已加入 ${added} 条新词条（跳过已入库 ${skipped} 条），并已纳入当前配方` : `已加入 ${added} 条新词条，并已纳入当前配方`) : '这些新词条都已在词库中，无需重复加入');
  const out = $('[data-ai-recipe-out]'); if(out) out.innerHTML = aiRecipeResultHtml();
}

  const api = {
    availableCombos,
    getAiHist,
    setAiHist,
    addAiHist,
    snapAiHist,
    aiHistEntryId,
    histState,
    addAdvHist,
    openAdvHistPanel,
    aiAdvHistCandHtml,
    refreshAdvHistBadge,
    aiRecipeUser,
    aiRecipeSpecNote,
    aiRecipePrompt,
    aiRecipeCard,
    aiRecipeResultHtml,
    gapFiveHtml,
    gapHtml,
    libHas,
    prepRecipeList,
    recipeScBadge,
    aiRecipeProduce,
    aiRecipeGen,
    parseAiJsonList,
    storeRecipeCandidate,
    aiRecipeStore,
    applyChosenCandidate,
    aiRecipePick,
    aiRecipeApply,
    aiRecipeSave,
    addGapEntryToLib,
    aiRecipeAddGap,
    aiHistAddGap,
    aiHistAddGapAll,
    aiRecipeAddGapAll
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['ai-recipe'] = Object.freeze(api);
  return ns['ai-recipe'];
}
