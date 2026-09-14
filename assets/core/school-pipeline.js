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
    aiRecipeAddGapAll,
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
    wsDraft,
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
  const schoolStageGroups = (...a) => (window.schoolStageGroups ? window.schoolStageGroups(...a) : (window.TellMeLegacyDomains?.['school-domain']?.schoolStageGroups ? window.TellMeLegacyDomains['school-domain'].schoolStageGroups(...a) : []));

function scState(){
  if(!state.school || typeof state.school !== 'object') state.school = {};
  state.school.finished = state.school.finished || {};
  state.school.failed   = state.school.failed   || {};
  state.school.retries  = state.school.retries  || {};
  state.school.stale    = state.school.stale || {};
  state.school.teachers = Array.isArray(state.school.teachers) ? state.school.teachers : [];
  scHealState();
  return state.school;
}

function scRetry(key){ return scState().retries[key] || 0; }

function setScRetry(key, n){ scState().retries[key] = Math.max(0, Math.min(SCHOOL_RETRY_MAX, n||0)); persist(); }

function scDone(key){ const sc = scState(); return !!(sc && sc.finished && sc.finished[key]); }

function invalidateSchoolDownstream(from){
  const sc=scState(); const ss=storyState(); sc.stale=sc.stale||{}; ss.pipelineVersion=(Number(ss.pipelineVersion)||0)+1;
  if(from==='dictMaster') ss.versions.dictMaster=(Number(ss.versions.dictMaster)||0)+1;
  if(from==='dictEnrich') ss.versions.dictEnrich=(Number(ss.versions.dictEnrich)||0)+1;
  if(from==='principal') ss.versions.principal=(Number(ss.versions.principal)||0)+1;
  const order=['dictMaster','dictEnrich','principal'];
  const idx=order.indexOf(from);
  const reset=[];
  if(from==='dictMaster') reset.push('dictEnrich','principal');
  else if(from==='dictEnrich') reset.push('principal');
  if(from==='dictMaster'||from==='dictEnrich'||from==='principal'){
    const groups=schoolStageGroups(); groups.forEach((g,i)=>reset.push('t'+i));
  }
  reset.forEach(k=>{ delete sc.finished[k]; delete sc.failed[k]; delete sc.retries[k]; sc.stale[k]=true; });
  if(from==='principal') sc.stale.principal=true;
  persist();
}

function scFailed(key){ const sc = scState(); return !scDone(key) && !!(sc && sc.failed && sc.failed[key]); }

function scSetFailed(key, val){
  const sc = scState();
  sc.failed = sc.failed || {};
  sc.failed[key] = !!val;
  if(val && sc.finished) delete sc.finished[key];
  persist();
}

function scMark(key, done){
  const sc = scState();
  sc.finished[key] = !!done;
  if(done){
    setScRetry(key, 0);
    if(sc.failed) delete sc.failed[key];
  }
  persist();
}

function getSchoolStepStatus(key){
  const sc = scState();
  const run = state._schoolRunning;
  const groups = schoolStageGroups();

  let isDone = false;
  if(key === 'dictMaster') isDone = scDone('dictMaster');
  else if(key === 'dictEnrich') isDone = scDone('dictEnrich');
  else if(key === 'principal') isDone = scDone('principal');
  else if(key === 'teacher'){
    if(scDone('teacher')) isDone = true;
    else {
      isDone = groups.length > 0 && groups.every((g,i)=>scDone('t'+i));
    }
  }

  let isRunning = false;
  if(run){
    if(run.activeKey === key) isRunning = true;
    else if(key === 'teacher' && (run.activeKey === 'teacher' || (typeof run.activeKey === 'string' && run.activeKey.startsWith('t')))){
      isRunning = true;
    }
  }

  let isFailed = !isDone && !isRunning && scFailed(key);

  let status = 'default'; // 蓝色
  if(isRunning) status = 'running'; // 绿色
  else if(isDone) status = 'done'; // 金黄色
  else if(isFailed) status = 'failed'; // 红色

  return { isDone, isRunning, isFailed, status };
}

function scBadge(key){
  const n = scRetry(key);
  return n > 0 ? `<b class="sc-retry-badge" title="本步已自动重试 ${n}/${SCHOOL_RETRY_MAX} 次（失败重试，成功清零）">↻${n}</b>` : '';
}

function scRefreshBadge(el, key){
  if(el && el.querySelectorAll){ el.querySelectorAll('.sc-retry-badge').forEach(x => x.remove()); }
  const n = scRetry(key);
  if(el){
    if(n > 0){ el.insertAdjacentHTML('beforeend', `<b class="sc-retry-badge" title="本步已自动重试 ${n}/${SCHOOL_RETRY_MAX} 次">↻${n}</b>`); el.classList.add('sc-failed'); }
    else if(!scFailed(key)) el.classList.remove('sc-failed');
  }
}

function schoolStepBtn(key, icon, label, title){
  const st = getSchoolStepStatus(key);
  let cls = 'sc-step';
  if(st.isRunning) cls += ' running';
  else if(st.isDone) cls += ' done';
  else if(st.isFailed) cls += ' failed sc-failed';
  else cls += ' sc-step-default';
  return `<button type="button" class="${cls}" data-scp-step="${key}" title="${esc(title||'')}">${icon}<span class="sc-lab">${esc(label)}</span><i class="sc-tick">${st.isDone?'✓':(st.isRunning?'⏳':(st.isFailed?'✕':''))}</i>${scBadge(key)}</button>`;
}

function schoolTeacherBtn(g, i){
  const groups = schoolStageGroups();
  const label = groups.length > 1 ? `老师${i+1}` : '老师';
  const key = 't'+i, done = scDone(key);
  const nCh = g.last - g.first + 1;
  const sc = g.stage || `第${i+1}组`;
  const range = `${g.first}-${g.last} 章`;
  return `<div class="sc-teacher-card ${done?'done':'todo'}">
    <div class="sc-tc-h">
      <span class="sc-tc-no">🎓 ${label}</span>
      <span class="sc-tc-stage">${esc(sc)}</span>
      <span class="sc-tc-ch">${esc(range)} (${nCh}章)</span>
      <span class="sc-tc-st ${done?'done':'todo'}">${done?'✓ 已备':'⏳ 未备'}</span>
    </div>
    <div class="sc-tc-b">
      <button type="button" class="sc-step sc-teacher ${done?'done':''}" data-scp-step="teacherSingle" data-scp-teacher="${i}" title="${label}：负责第 ${g.first}-${g.last} 章（${esc(g.stage||'')}），一次备完全组逐章教案">${done?'重新备课':`🎓 ${label}备课`}${scBadge(key)}</button>
      <button type="button" class="sc-plan-btn" data-scp-plan="${i}" title="${done?('查看'+ label +'本组教案（预览 / 原始稿切换）'):'该组教案尚未生成，先生成后才能阅读'}">📖 读教案</button>
    </div>
  </div>`;
}

function scStyleBrief(){
  const parts = [];
  const tags = (state.chapterStyle && Array.isArray(state.chapterStyle.tags)) ? state.chapterStyle.tags : [];
  if(tags.length) parts.push('写作风格词条：' + tags.join('、'));
  try{ const c = selectedPolishCandidate && selectedPolishCandidate(); if(c && c.name) parts.push('②优化构想所选方案：' + String(c.name)); }catch(e){}
  return parts.length ? parts.join('\n') : '（尚未选配方；由校长依简介与词典自行凝练守则）';
}

function scGlossaryBrief(maxChar){
  const g = (state.outline && state.outline.glossary) || {};
  const lines = [];
  const cap=[]; (g.characters||[]).forEach(x=>{ const nm = `${String((x&&x.name)||'').trim()}${x&&String(x.identity||'').trim()?('·'+String(x.identity).trim()):''}`; if(nm) cap.push(nm); });
  if(cap.length) lines.push('人物：' + cap.slice(0,80).join('、'));
  const pl=[]; (g.places||[]).forEach(x=>{ if(x&&String(x.name||'').trim()) pl.push(`${String(x.name).trim()}${String(x.type||'').trim()?('·'+String(x.type).trim()):''}`); });
  if(pl.length) lines.push('地名：' + pl.slice(0,40).join('、'));
  const pn=[]; (g.propernouns||[]).forEach(x=>{ if(x&&String(x.name||'').trim()) pn.push(String(x.name).trim()); });
  if(pn.length) lines.push('专名/设定：' + pn.slice(0,40).join('、'));
  const wr=[]; (g._worldRules||[]).forEach(x=>{ const r=String((x&&x.rule)||'').trim(); if(r) wr.push(r); });
  if(wr.length) lines.push('世界观规则：\n' + wr.slice(0,30).map(r=>'- '+r).join('\n'));
  const rel=[]; (g._relationshipTable||[]).forEach(x=>{ if(x && x.a && x.b) rel.push(`${x.a}(${x.relation||'关系'})${x.b}`); });
  if(rel.length) lines.push('人物关系：' + rel.slice(0,40).join('、'));
  let s = lines.join('\n');
  const m = maxChar || 7000;
  if(s.length > m) s = s.slice(0, m) + '…（已截断）';
  return s || '（暂无词典，正文将在老师教案中按需自洽）';
}

function scGroupBeats(g, maxChar){
  const plans = (state.outline && Array.isArray(state.outline.chapterPlans)) ? state.outline.chapterPlans : [];
  const out = [];
  for(let i=g.first-1;i<g.last;i++){
    const ch = i+1;
    const title = (state.outline && state.outline.chapters && state.outline.chapters[i] && String(state.outline.chapters[i].title||'').trim()) || '';
    const bt = plans[i] && String(plans[i].beatsText||'').trim();
    out.push(`第${ch}章${title?('《'+title+'》'):''}${bt?('\n'+bt):''}`);
  }
  let s = out.join('\n\n');
  const m = maxChar || 6000;
  if(s.length > m) s = s.slice(0, m) + '…（已截断）';
  return s || '（本章节拍为空，老师依全校守则与本组框架自拟）';
}

function scAllGroupsBeats(groups, maxChar){
  const parts = groups.map((g,i)=>`— 组${i+1}·老师${i+1}（第${g.first}-${g.last}章${g.stage?('·'+g.stage):''}） —\n${scGroupBeats(g, 5000)}`);
  let s = parts.join('\n\n');
  const m = maxChar || 12000;
  if(s.length > m) s = s.slice(0, m) + '…（已截断）';
  return s;
}

function isSchoolFolded(){
  return false;
}

function extractSection(txt, from, until){
  const s = String(txt||'');
  const i = s.indexOf(from); if(i < 0) return '';
  const j = until ? s.indexOf(until, i + from.length) : -1;
  const seg = j > i ? s.slice(i, j) : s.slice(i);
  return seg.trim();
}

function parsePrincipalTitles(raw){
  if(!raw) return [];
  const sec = extractSection(raw, '全书章节标题总表', '') || raw;
  const list = [];
  const lines = String(sec).split('\n');
  for(const line of lines){
    const clean = line.replace(/^[#*\-\s]+/, '').trim();
    const m = clean.match(/^(?:第\s*(\d+)\s*章|(\d+)[\.、\s])\s*[:：、\s]*(?:《([^》]+)》|([^\n\r#*]+))/);
    if(m){
      const num = parseInt(m[1] || m[2], 10);
      const title = String(m[3] || m[4] || '').trim().replace(/^《|》$/g, '');
      if(num > 0 && title && !list.find(x => x.num === num)){
        list.push({ num, title });
      }
    }
  }
  list.sort((a,b) => a.num - b.num);
  return list;
}

function isPrincipalTitlesApplied(){
  const titles = (state.school && state.school.principal && state.school.principal.titles) || [];
  if(!titles.length || !state.outline || !Array.isArray(state.outline.chapters)) return false;
  const oCh = state.outline.chapters;
  return titles.every(t => {
    const ch = oCh[t.num - 1];
    return ch && String(ch.title || '').trim() === t.title;
  });
}

function applyPrincipalTitles(){
  const titles = (state.school && state.school.principal && state.school.principal.titles) || [];
  if(!titles.length){ toast('未检测到校长拟定的标题'); return false; }
  if(!state.outline) state.outline = { chapters: [] };
  if(!Array.isArray(state.outline.chapters)) state.outline.chapters = [];

  const diffs = [];
  titles.forEach(t => {
    const idx = t.num - 1;
    const cur = state.outline.chapters[idx];
    const curTitle = cur && String(cur.title || '').trim();
    if(curTitle && curTitle !== t.title){
      diffs.push({ num: t.num, oldTitle: curTitle, newTitle: t.title });
    }
  });

  if(diffs.length > 0){
    showTitleDiffModal(titles, diffs);
    return true;
  }
  return doApplyTitles(titles);
}

function doApplyTitles(titles, opts){
  opts = opts || {};
  if(!state.outline) state.outline = { chapters: [] };
  if(!Array.isArray(state.outline.chapters)) state.outline.chapters = [];
  const maxNum = Math.max(...titles.map(t=>t.num), state.outline.chapters.length);
  while(state.outline.chapters.length < maxNum){
    state.outline.chapters.push({ title: '' });
  }
  if(!Array.isArray(state.chapters)) state.chapters = [];
  while(state.chapters.length < maxNum){
    state.chapters.push({ title: '', content: '' });
  }
  snapshotTitleBatch('选用校长拟定标题');
  titles.forEach(t => {
    const idx = t.num - 1;
    if(idx >= 0 && idx < state.outline.chapters.length){
      state.outline.chapters[idx].title = t.title;
    }
    if(idx >= 0 && idx < state.chapters.length){
      state.chapters[idx].title = t.title;
    }
  });
  persist();
  render();
  if(!opts.silent) toast(`已成功将校长拟定的 ${titles.length} 章标题应用到全书大纲与章节！`);
  return true;
}

function showTitleDiffModal(titles, diffs){
  const ov = document.createElement('div');
  ov.className = 'gs-overlay';
  ov.innerHTML = `<div class="gs-modal sc-diff-modal" style="max-width:540px;">
    <div class="gs-modal-head">
      <b>✨ 选用校长拟定标题</b>
      <span class="sc-plan-meta muted">检测到 ${diffs.length} 处既有标题变更</span>
      <button class="gs-x" data-diff-close>✕</button>
    </div>
    <div class="sc-diff-body" style="padding:14px 16px;max-height:60vh;overflow-y:auto">
      <div style="font-size:12.5px;color:var(--muted);margin-bottom:12px;line-height:1.5">
        校长拟定共 <b>${titles.length}</b> 章标题。其中 <b>${diffs.length}</b> 处与当前已存在标题不同。请确认是否统一替换为校长拟定标题：
      </div>
      <div class="sc-diff-list" style="display:flex;flex-direction:column;gap:6px">
        ${diffs.map(d => `
          <div class="sc-diff-item" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel2);font-size:12px">
            <span style="font-weight:750;color:var(--accent);min-width:48px">第${d.num}章</span>
            <span style="color:var(--muted);text-decoration:line-through;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(d.oldTitle)}</span>
            <span style="color:var(--accent)">➔</span>
            <span style="color:var(--txt);font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(d.newTitle)}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="sc-diff-foot" style="display:flex;justify-content:flex-end;gap:10px;padding:12px 16px;border-top:1px solid var(--line)">
      <button type="button" class="btn ghost" data-diff-cancel>取消</button>
      <button type="button" class="btn primary" data-diff-confirm>确认替换 (${titles.length}章)</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  const close = ()=> ov.remove();
  ov.querySelector('[data-diff-close]').onclick = close;
  ov.querySelector('[data-diff-cancel]').onclick = close;
  ov.addEventListener('click', e=>{ if(e.target===ov) close(); });
  ov.querySelector('[data-diff-confirm]').onclick = ()=>{
    close();
    doApplyTitles(titles);
  };
}

function scGroupTitles(g){
  const out = [];
  const pTitles = (state.school && state.school.principal && Array.isArray(state.school.principal.titles)) ? state.school.principal.titles : [];
  for(let i=g.first-1;i<g.last;i++){
    const pt = pTitles.find(x=>x.num === i+1);
    const ot = (state.outline && state.outline.chapters && state.outline.chapters[i] && String(state.outline.chapters[i].title||'').trim()) || '';
    const title = (pt && pt.title) ? pt.title : ot;
    out.push(`第${i+1}章 ${title?('《'+title+'》'):'（待命）'}`);
  }
  return out;
}

function buildPrincipalUser(groups){
  const o = state.outline || {};
  const lines = [];
  lines.push(`【长篇小说】${o.title||'（未定书名）'}`);
  if(o.logline) lines.push(`【全书简介】${o.logline}`);
  let cand = null; try{ cand = selectedPolishCandidate && selectedPolishCandidate(); }catch(e){}
  if(cand && cand.name) lines.push(`【优化构想·所选方案】${String(cand.name).trim()}${cand.brief?('\n'+String(cand.brief).trim()):''}`);
  lines.push(`【全校章节数】${(o.chapters||[]).length || chapterCountVal() || '未知'} 章`);
  lines.push(storyStateCanonBlock());
  const _opening = openingStrategyBrief(); if(_opening) lines.push(_opening);
  const _openingTask = openingStrategyExecutionCard(0); if(_openingTask) lines.push(_openingTask);
  const bc = currentBeatCfg ? currentBeatCfg() : null;
  if(bc && bc.label){
    const beatDetail = (bc.types||[]).map((t, idx) => `  ${idx+1}. 【${t.label}】(type=${t.key})：${t.note || ''} ${t.aiDirective ? `[执行指令: ${t.aiDirective}]` : ''}`).join('\n');
    lines.push(`【全书微拍总纲与节奏体系（校长全量统领并下达管理指令）】
微拍型号：${bc.label} (${bc.emoji || ''})
节拍说明：${bc.desc || ''}
逐拍节奏结构定义：
${beatDetail}
校长统帅与管理要求：
1. 校长作为全校最高统领，全量掌握此微拍节奏总纲，并将其升华为「全校写作守则 · 可执行纪律」；
2. 在全校守则中明确要求下属任课老师在备课时，将本微拍节奏分解落实至各章的「本章推进骨架」与「情绪走向与突出点」；
3. 确保全校宏观规划与单章微观节奏形成统一闭环。`);
  }
  lines.push('【写作风格/配方】\n' + scStyleBrief());
  lines.push('【全量万物词典·共享不切片】\n' + scGlossaryBrief(7000));
  lines.push('【既有《全书节拍》· 阶段优先分组】');
  groups.forEach((g,i)=>{ lines.push(`组${i+1}·老师${i+1}（第${g.first}-${g.last}章${g.stage?('·'+g.stage):''}）`); });
  lines.push('\n【各组对应的《全书节拍》节选】\n' + scAllGroupsBeats(groups, 10000));
  lines.push('\n请按输出契约产出【全校写作守则】【各组组级框架】【全书章节标题总表】三段（逐组齐全），只给纯文本 Markdown。');
  return lines.join('\n\n');
}

async function genPrincipal(btn, opts){
  if(!isLong()){ toast('仅长篇小说模式支持校长统筹'); return false; }
  const groups = schoolStageGroups(); if(!groups.length){ toast('请先填写章节数，才能分组'); return false; }
  if(!scDone('dictEnrich')){ toast('校长必须接收完整词典后再统筹，请先完成“词典充实”'); return false; }
  invalidateSchoolDownstream('principal');
  scState();
  const sys = PRINCIPAL_SYS;
  markAIRunning('principal'); if(btn) busy(btn, true, '校长统筹中…'); if(btn && btn.parentNode) showStopBtn(btn.parentNode);
  try{
    const spec = resolveActiveSpec('principal');
    const temp = (spec && spec.principalTemp != null) ? spec.principalTemp : 0.4;
    for(let attempt=1; attempt<=SCHOOL_RETRY_MAX; attempt++){
      try{
        const txt = await callAIGuarded('principal', sys, buildPrincipalUser(groups), {}, { temperature:temp, maxTokens:16384, signal:_abortCtl?.signal });
        if(!txt || !String(txt||'').trim()){ setScRetry('principal', attempt); scRefreshBadge(btn,'principal'); throw new Error('校长返回空'); }
        const sc = scState();
        const titles = parsePrincipalTitles(txt);
        if(titles && titles.length){
          doApplyTitles(titles, { silent: true });
        }
        storyState().canon.principalAt=Date.now(); storyState().versions.principal=Number(storyState().versions.principal||0)+1; storyState().pipelineVersion=(Number(storyState().pipelineVersion)||0)+1;
        delete sc.stale.principal;
        sc.principal = { ts:Date.now(), folded:false, groups: groups.map((g,gi)=>({ gi, stage:g.stage, first:g.first, last:g.last })), raw:String(txt), titles }; storyState().docs=storyState().docs||{}; storyState().docs.schoolPlan={version:storyState().versions.principal,source:'principal',ts:Date.now(),groups:sc.principal.groups,titles};
        scMark('principal', true);
        markAIDone('principal');
        render();
        toast(`校长统筹完成：${groups.length} 位老师分组 + 全校守则 + 组级框架 + ${titles.length}章标题已自动定稿应用！`);
        playDoneSound('single');
        return true;
      }catch(e){
        if(e && e.name === 'AbortError'){ setScRetry('principal', attempt); toast('已停止校长统筹'); return false; }
        setScRetry('principal', attempt); scRefreshBadge(btn,'principal');
        if(attempt < SCHOOL_RETRY_MAX) await new Promise(r=>setTimeout(r,1500));
      }
    }
    toast(`校长统筹失败（已自动重试 ${SCHOOL_RETRY_MAX} 次）`);
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='principal');
    hideStopBtn(); if(btn) busy(btn,false); scRefreshBadge(btn,'principal');
  }
}

function buildTeacherUser(g, gi){
  const pr = (state.school && state.school.principal) || {};
  const o = state.outline || {};
  const lines = [];
  lines.push(storyStateCanonBlock());
  lines.push(`【全校写作守则】\n${(pr.raw && extractSection(pr.raw,'全校写作守则','各组组级框架')) || '（校长未产出守则）'}`);
  lines.push(`【校长已裁决的风格融合总纲】\n${principalStyleExecutionExcerpt()}`);
  lines.push(`【本组组级框架（组${gi+1}·老师${gi+1}，第${g.first}-${g.last}章）】\n${(pr.raw && extractSection(pr.raw,'各组组级框架','全书章节标题总表')) || (pr.raw || '（校长未产出组级框架）')}`);
  lines.push(`【本组章节标题】\n${scGroupTitles(g).join('\n')}`);
  const _bc = currentBeatCfg ? currentBeatCfg() : null;
  if(_bc && _bc.label) lines.push(`【章节微拍（单源真理·内嵌骨架）】名称=${_bc.label}${_bc.desc?('；说明='+_bc.desc):''}${_bc.types?('；拍=('+_bc.types.map(t=>t.label).join('，')+')'):''}\n要求：将此微拍节奏直接融铸在每章教案的「本章推进骨架」中，形成单一执行标准的超级教案。`);
  lines.push('【全量词典（共享不切片）】\n' + scGlossaryBrief(7000));
  lines.push(`【本组《全书节拍》节选】\n${scGroupBeats(g, 8000)}`);
  lines.push(`【前序正文状态（若存在）】\n${g.first>1 ? (storyStateChapterBlock(g.first-1) || '（暂无结算状态）') : '（首组，无前序正文）'}`);
  const _opening = openingStrategyBrief(); if(_opening) lines.push(_opening);
  if(g && g.first===1){ const _openingTask = principalOpeningTaskExcerpt() || openingStrategyExecutionCard(0); if(_openingTask) lines.push(_openingTask); }
  lines.push(prevGroupTailState(gi, g));
  if(isLong()) lines.push(`【长篇记忆层·老师备课参考】\n${longMemoryBrief(g.first-1) || '（尚无已落地正文状态；以校长交接棒和本组教案输入为准。）'}\n执行要求：记忆层只用于保持状态、因果与伏笔连续，不得擅自新增剧情；本组每章重大事件仍须给出前置条件→触发/线索→人物行动→结果。`);
  lines.push('\n请对本组每一章产出一份「本章写作框架」，并在文末附上【本阶段向下一阶段移交的 3 大关键悬念与阶段高潮成果】。');
  return lines.join('\n\n');
}

function prevGroupTailState(gi, g){
  const groups = schoolStageGroups();
  if(gi <= 0 || !groups[gi-1]) return '【上一组末章·收束状态】\n（本组为全书首组：开篇）——首章按【开篇引擎】选定的策略开篇，无需承接前文。';
  const prev = (state.school && state.school.teachers && state.school.teachers[gi-1]) || null;
  const prevGroup = groups[gi-1];
  if(!prev || !prev.raw || !prevGroup) return '【上一组末章·收束状态】\n（上一组（老师'+gi+'）尚未备课）：请本组首章按「承上节的钩」自行设计衔接。';
  const lastCh = prevGroup.last;
  
  const reLastCh = new RegExp(`^第\\s*${lastCh}\\s*章\\b[\\s\\S]*?(?=^第\\s*\\d+\\s*章\\b|^#+\\s*本阶段向下一阶段移交|$)`, 'm');
  const mLastCh = String(prev.raw).match(reLastCh);
  const lastChPlan = mLastCh ? String(mLastCh[0]).trim() : '';

  const reBaton = /#+\s*本阶段向下一阶段移交[^\n]*\n([\s\S]*?)$/m;
  const mBaton = String(prev.raw).match(reBaton);
  const batonText = mBaton ? mBaton[1].trim() : '';

  const parts = [];
  if(g && g.first===1){ const ot=principalOpeningTaskExcerpt() || openingStrategyExecutionCard(0); if(ot) parts.push(ot); }
  parts.push(`【教师交接棒契约（上一位老师${gi}移交 · 最高优先级硬性输入）】
上一位老师负责第 ${prevGroup.first}-${prevGroup.last} 章。为彻底消除阶段之间的割裂感，本组（第 ${g.first}-${g.last} 章）第 1 章（第 ${g.first} 章）必须作为交接棒的第一承接者：`);
  
  if(lastChPlan){
    parts.push(`◆ 上一组末章（第 ${lastCh} 章）完整教案：\n${lastChPlan.slice(0, 1200)}`);
  }
  if(batonText){
    parts.push(`◆ 上一组移交的 3 大关键悬念与高潮成果：\n${batonText.slice(0, 800)}`);
  } else {
    parts.push(`◆ 上一组末章收束重点：请紧扣第 ${lastCh} 章的连续性与未解悬念，无缝推进到本组第 ${g.first} 章。`);
  }
  parts.push(`【交接执行令】本组第 ${g.first} 章教案的「本章推进骨架」第 ① 环节与「连续性」，必须 100% 严密对缝承接第 ${lastCh} 章定格的真实物理处境与上述悬念，严禁凭空跳跃！`);
  return parts.join('\n\n');
}

async function genTeacher(btn, gi){
  if(!isLong()){ toast('仅长篇小说模式支持老师施教'); return false; }
  const groups = schoolStageGroups(); const g = groups[gi];
  if(!g){ toast('未找到该分组'); return false; }
  if(!scDone('dictEnrich')){ toast('老师备课需要先接收完整词典，请先完成“词典充实”'); return false; }
  if(!scDone('principal')){ toast('请先生成校长（分组/守则/组级框架）'); return false; }
  const key = 't'+gi;
  scState();
  markAIRunning(key); if(btn) busy(btn, true, '备课中…'); if(btn && btn.parentNode) showStopBtn(btn.parentNode);
  try{
    const spec = resolveActiveSpec('teacher');
    const temp = (spec && spec.teacherTemp != null) ? spec.teacherTemp : 0.4;
    for(let attempt=1; attempt<=SCHOOL_RETRY_MAX; attempt++){
      try{
        const txt = await callAIGuarded('teacher', TEACHER_SYS, buildTeacherUser(g, gi), {}, { temperature:temp, maxTokens:16384, signal:_abortCtl?.signal });
        if(!txt || !String(txt||'').trim()){ setScRetry(key, attempt); scRefreshBadge(btn,key); throw new Error('老师返回空'); }
        const sc = scState(); delete sc.stale['t'+gi]; sc.teachers[gi] = { gi, ts:Date.now(), raw:String(txt) };
        const cards = commitTeacherChapterCards(String(txt), g, gi);
        persist();
        scMark(key, true); markAIDone(key);
        render();
        toast(`老师${gi+1}备课完成：第 ${g.first}-${g.last} 章共 ${g.last-g.first+1} 份教案已就绪`);
        playDoneSound('single');
        return true;
      }catch(e){
        if(e && e.name === 'AbortError'){ setScRetry(key, attempt); toast('已停止备课'); return false; }
        setScRetry(key, attempt); scRefreshBadge(btn,key);
        if(attempt < SCHOOL_RETRY_MAX) await new Promise(r=>setTimeout(r,1500));
      }
    }
    toast(`老师${gi+1}备课失败（已自动重试 ${SCHOOL_RETRY_MAX} 次）`);
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!==key);
    hideStopBtn(); if(btn) busy(btn,false); scRefreshBadge(btn,key);
  }
}

async function nailRetry(key, label, run, btn){
  for(let attempt=1; attempt<=SCHOOL_RETRY_MAX; attempt++){
    let ok = false; try{ ok = await run(); }catch(e){ ok = false; }
    if(ok){ scMark(key, true); scRefreshBadge(btn, key); return true; }
    setScRetry(key, attempt); scRefreshBadge(btn, key);
    if(attempt < SCHOOL_RETRY_MAX) await new Promise(r=>setTimeout(r,1200));
  }
  toast(`${label}失败（已自动重试 ${SCHOOL_RETRY_MAX} 次）`);
  scRefreshBadge(btn, key);
  return false;
}

function refreshSchoolProgressUi(){
  const topText = document.querySelector('.sc-pipe-t');
  const pipeIn = document.querySelector('.sc-pipe-in');
  const pipeMeta = document.querySelector('.sc-pipe-m');
  const allBtn = document.querySelector('[data-scp-all]');
  const subtag = document.querySelector('.ch-subtag-school');
  const stepKeys = ['dictMaster','dictEnrich','principal','teacher'];
  const doneSteps = stepKeys.filter(k => getSchoolStepStatus(k).isDone).length;
  const pct = Math.round(doneSteps / 4 * 100);

  if(pipeIn) pipeIn.style.width = pct + '%';
  if(pipeMeta) pipeMeta.textContent = `${doneSteps}/4 步就绪 · ${pct}%`;
  if(subtag) subtag.textContent = `${doneSteps}/4 步就绪 · ${pct}%`;

  if(state._schoolRunning){
    const run = state._schoolRunning;
    if(topText) topText.innerHTML = `⚡ <b>一键开学进行中</b>（${run.stepIndex+1}/${run.totalSteps||4} · ${esc(run.label)}）…`;
    if(allBtn){
      allBtn.classList.add('running');
      allBtn.innerHTML = `⚡ 一键开学中（${run.stepIndex+1}/${run.totalSteps||4} · ${esc(run.label)}）…`;
    }
  } else {
    if(topText) topText.textContent = '⏳ 设定就绪 → 学校开学（四步标准管线）';
    if(allBtn){
      allBtn.classList.remove('running');
      allBtn.innerHTML = '⚡ 一键开学（全链路备课）';
    }
  }

  stepKeys.forEach(k=>{
    const el = document.querySelector(`.sc-pipe-steps [data-scp-step="${k}"]`) || document.querySelector(`[data-scp-step="${k}"]`);
    if(el){
      const st = getSchoolStepStatus(k);
      el.classList.toggle('running', st.isRunning);
      el.classList.toggle('done', st.isDone);
      el.classList.toggle('failed', st.isFailed);
      el.classList.toggle('sc-failed', st.isFailed);
      el.classList.toggle('sc-step-default', !st.isRunning && !st.isDone && !st.isFailed);

      let tick = el.querySelector('.sc-tick');
      if(!tick){
        tick = document.createElement('i');
        tick.className = 'sc-tick';
        el.appendChild(tick);
      }
      if(st.isRunning){
        tick.className = 'sc-tick sc-tick-run';
        tick.textContent = '⏳';
      } else if(st.isDone){
        tick.className = 'sc-tick sc-tick-done';
        tick.textContent = '✓';
      } else if(st.isFailed){
        tick.className = 'sc-tick sc-tick-fail';
        tick.textContent = '✕';
      } else {
        tick.className = 'sc-tick';
        tick.textContent = '';
      }
      scRefreshBadge(el, k);
    }
  });

  const groups = schoolStageGroups();
  groups.forEach((g, i)=>{
    const tBtn = document.querySelector(`[data-scp-teacher="${i}"]`);
    if(tBtn){
      const tDone = scDone('t'+i);
      tBtn.classList.toggle('done', tDone);
    }
  });
}

async function genSchoolAll(btn){
  if(genBusy()){ toast('已有生成任务进行中，请稍候'); return; }
  const groups = schoolStageGroups(); if(!groups.length){ toast('请先填写章节数，才能一键开学'); return; }
  const steps = [
    { key:'dictMaster', label:'词典达人', run:()=> genDictMaster(null) },
    { key:'dictEnrich', label:'词典充实', run:()=> genDictEnrich(null,{force:true}) },
    { key:'principal', label:'校长', run:()=> genPrincipal(null) },
    {
      key:'teacher',
      label:'老师',
      run: async ()=>{
        let allT = true;
        for(let j=0; j<groups.length; j++){
          if(scDone('t'+j)) continue;
          state._schoolRunning = { activeKey:'teacher', teacherIndex:j, stepIndex:3, totalSteps:4, label: groups.length > 1 ? `老师${j+1}备课` : '老师备课' };
          refreshSchoolProgressUi();
          const okT = await genTeacher(null, j);
          if(!okT){ allT = false; break; }
          scMark('t'+j, true);
        }
        return allT;
      }
    }
  ];
  const allBtn = ()=> document.querySelector('[data-scp-all]');
  const presetTitles = ()=>{
    const titles = (state.school && state.school.principal && Array.isArray(state.school.principal.titles)) ? state.school.principal.titles : [];
    if(titles.length && !isPrincipalTitlesApplied()) doApplyTitles(titles, { silent:true });
  };
  if(scDone('principal')) presetTitles();
  const finish = ()=>{
    state._schoolRunning = null;
    const b = allBtn();
    if(b){
      if(b._txt !== undefined){ b.innerHTML = b._txt; delete b._txt; }
      b.classList.remove('running');
    }
    refreshSchoolProgressUi();
  };
  const b0 = allBtn();
  if(b0 && b0._txt === undefined) b0._txt = b0.innerHTML;
  try{
    for(let i=0; i<steps.length; i++){
      const st = steps[i];
      if(getSchoolStepStatus(st.key).isDone) continue;
      scSetFailed(st.key, false);
      state._schoolRunning = { activeKey:st.key, stepIndex:i, totalSteps:4, label:st.label };
      refreshSchoolProgressUi();
      const zone = document.querySelector('.school-zone');
      let stopped = false;
      if(zone){ showStopBtn(zone); zone.classList.add('cp-stopping'); if(_abortCtl) _abortCtl.signal.addEventListener('abort', ()=>{ stopped = true; }, {once:true}); }
      let ok = false;
      try{
        ok = await st.run();
      }catch(err){
        console.error(`[genSchoolAll] step ${st.key} error:`, err);
        ok = false;
      }
      hideStopBtn(); if(zone) zone.classList.remove('cp-stopping');
      if(ok){
        scMark(st.key, true);
        if(st.key==='principal'){
          const titles = (state.school && state.school.principal && Array.isArray(state.school.principal.titles)) ? state.school.principal.titles : [];
          if(titles.length && !isPrincipalTitlesApplied()){
            doApplyTitles(titles, { silent:true });
          }
        }
      } else {
        scSetFailed(st.key, true);
      }
      refreshSchoolProgressUi();
      if(!ok){
        toast(stopped ? `已停止学校一键（停在「${st.label}」）` : `学校一键中断于「${st.label}」，可单独点该步骤重试`);
        return;
      }
    }
    toast('学校一键全部完成：词典达人→词典充实→校长→老师全链路就绪，标题已自动定稿！');
    playDoneSound('all');
  }finally{ finish(); render(); }
}

function bindSchoolSteps(){
  const all = $('[data-scp-all]'); if(all) all.onclick = ()=> genSchoolAll(all);
  const applyBtn = $('[data-scp-apply-titles]');
  if(applyBtn) applyBtn.onclick = ()=> applyPrincipalTitles();
  $$('[data-scp-step]').forEach(btn=>{
    if(btn._sB) return; btn._sB = 1;
    btn.onclick = async ()=>{
      const step = btn.dataset.scpStep;
      if(step === 'dictMaster'){
        scSetFailed('dictMaster', false);
        state._schoolRunning = { activeKey:'dictMaster', stepIndex:0, totalSteps:4, label:'词典达人' };
        refreshSchoolProgressUi();
        try {
          const ok = await nailRetry('dictMaster','词典达人', ()=> genDictMaster(btn), btn);
          if(ok){ scMark('dictMaster', true); playDoneSound('single'); }
          else { scSetFailed('dictMaster', true); }
        } catch(e){
          scSetFailed('dictMaster', true);
        } finally {
          state._schoolRunning = null;
          refreshSchoolProgressUi();
        }
        return;
      }
      if(step === 'dictEnrich'){
        scSetFailed('dictEnrich', false);
        state._schoolRunning = { activeKey:'dictEnrich', stepIndex:1, totalSteps:4, label:'词典充实' };
        refreshSchoolProgressUi();
        try {
          const ok = await nailRetry('dictEnrich','词典充实', ()=> genDictEnrich(btn,{}), btn);
          if(ok){ scMark('dictEnrich', true); playDoneSound('single'); }
          else { scSetFailed('dictEnrich', true); }
        } catch(e){
          scSetFailed('dictEnrich', true);
        } finally {
          state._schoolRunning = null;
          refreshSchoolProgressUi();
        }
        return;
      }
      if(step === 'principal'){
        scSetFailed('principal', false);
        state._schoolRunning = { activeKey:'principal', stepIndex:2, totalSteps:4, label:'校长' };
        refreshSchoolProgressUi();
        try {
          const ok = await genPrincipal(btn);
          if(ok){
            scMark('principal', true);
            const titles = (state.school && state.school.principal && Array.isArray(state.school.principal.titles)) ? state.school.principal.titles : [];
            if(titles.length && !isPrincipalTitlesApplied()) doApplyTitles(titles, { silent:true });
            playDoneSound('single');
          } else {
            scSetFailed('principal', true);
          }
        } catch(e){
          scSetFailed('principal', true);
        } finally {
          state._schoolRunning = null;
          refreshSchoolProgressUi();
        }
        return;
      }
      if(step === 'teacher' || step === 'teacherAll'){
        const groups = schoolStageGroups();
        if(!groups.length){ toast('请先填写章节数，才能备课'); return; }
        scSetFailed('teacher', false);
        state._schoolRunning = { activeKey:'teacher', stepIndex:3, totalSteps:4, label:'老师' };
        refreshSchoolProgressUi();
        try {
          let allOk = true;
          for(let i=0; i<groups.length; i++){
            if(scDone('t'+i)) continue;
            const ok = await genTeacher(null, i);
            if(!ok){ allOk = false; scSetFailed('teacher', true); break; }
            scMark('t'+i, true);
          }
          if(allOk){ scMark('teacher', true); playDoneSound('single'); }
        } catch(e){
          scSetFailed('teacher', true);
        } finally {
          state._schoolRunning = null;
          refreshSchoolProgressUi();
        }
        return;
      }
      if(step === 'teacherSingle'){
        const gi = Number(btn.dataset.scpTeacher);
        const ok = await genTeacher(btn, gi);
        if(ok){
          scMark('t'+gi, true);
          const groups = schoolStageGroups();
          if(groups.every((g,i)=>scDone('t'+i))) scMark('teacher', true);
        }
        refreshSchoolProgressUi();
        return;
      }
    };
  });
  $$('[data-scp-plan]').forEach(b=>{ b.onclick = ()=> openSchoolPlanReader(+b.dataset.scpPlan); });
  const pv = $('[data-scp-plan-pr]');
  if(pv) pv.onclick = ()=> openSchoolPrincipalReader();
  bindPlannerSoundTool();
}

function getFieldTagClass(k){
  if(/时间|落点|时点/.test(k)) return 'sc-tag-blue';
  if(/连续|承上|启下|承接|过桥/.test(k)) return 'sc-tag-green';
  if(/推进|骨架|拍|事件/.test(k)) return 'sc-tag-amber';
  if(/功能|位置|分工/.test(k)) return 'sc-tag-purple';
  if(/情绪|弧|高潮|突出/.test(k)) return 'sc-tag-pink';
  if(/出场|名单|人物|实体/.test(k)) return 'sc-tag-teal';
  return 'sc-tag-blue';
}

function saveTeacherFieldEdit(gi, ch, k, newV){
  const t = state.school && state.school.teachers && state.school.teachers[gi];
  if(!t || !t.raw) return;
  const lines = String(t.raw).split('\n');
  let inCh = false;
  let replaced = false;
  for(let i=0; i<lines.length; i++){
    const ln = lines[i];
    const mCh = ln.match(/^\s*第\s*(\d+)\s*章/);
    if(mCh){
      if(parseInt(mCh[1],10) === ch){ inCh = true; }
      else if(inCh){ break; }
    }
    if(inCh){
      const mF = ln.match(/^(\s*(?:[-•*>\d().]+\s*)*)([^：:]{1,10})([：:])\s*(.*)$/);
      if(mF && mF[2].trim() === k){
        lines[i] = `${mF[1]}${mF[2]}${mF[3]} ${newV.trim()}`;
        replaced = true;
        break;
      }
    }
  }
  if(!replaced && inCh){
    lines.push(`- ${k}：${newV.trim()}`);
    replaced = true;
  }
  if(replaced){
    t.raw = lines.join('\n');
    persist();
    toast(`第${ch}章「${k}」已保存修改`);
  }
}

function openSchoolPlanReader(gi, jumpCh){
  const sc = scState();
  const t = sc && sc.teachers && sc.teachers[gi];
  const g = schoolStageGroups()[gi];
  if(!g){ toast('未找到该章节分组'); return; }
  _planCUR_GI = gi; _planCUR_VIEW = 'raw';
  const n = g.last - g.first + 1;
  const ov = document.createElement('div'); ov.className='gs-overlay';
  const groups = schoolStageGroups();
  const label = groups.length > 1 ? `老师${gi+1}` : '老师';
  const titleText = `🎓 ${label} · 本组教案`;
  ov.innerHTML = `<div class="gs-modal school-plan-modal">
    <div class="gs-modal-head"><b>${titleText}</b><span class="sc-plan-meta muted">${g.stage ? `段「${esc(g.stage)}」 · ` : ''}第 ${g.first}-${g.last} 章 · ${n} 章</span></div>
    <div class="sc-plan-tool">
      <span class="sc-plan-tgl" id="scPlanTgl">
        <span class="sp-tgl-itm on" data-v="raw">原稿纯文本</span><span class="sp-tgl-itm" data-v="card">栏目结构化</span>
      </span>
      <button class="gs-x" data-sp-close>✕</button>
    </div>
    <div class="sc-plan-body" id="scPlanBody" style="max-height:68vh;overflow:auto;padding:12px 16px 20px"></div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-sp-close]').onclick = ()=> ov.remove();
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
  ov.querySelectorAll('.sp-tgl-itm').forEach(el=>{
    el.onclick = ()=>{ _planCUR_VIEW = el.dataset.v; ov.querySelectorAll('.sp-tgl-itm').forEach(x=>x.classList.toggle('on', x===el)); renderSchoolPlanBody(ov, gi, jumpCh); };
  });
  renderSchoolPlanBody(ov, gi, jumpCh);
  if(jumpCh){ setTimeout(()=>{ const el = ov.querySelector('#planCh-'+jumpCh); if(el){ el.style.transition='box-shadow .5s,background .5s'; el.style.boxShadow='0 0 0 2px var(--accent)'; el.style.background='color-mix(in srgb, var(--accent) 12%, transparent)'; setTimeout(()=>{ el.style.boxShadow=''; el.style.background=''; },1600); el.scrollIntoView({block:'center',behavior:'smooth'}); } },80); }
}

function renderSchoolPlanBody(ov, gi, jumpCh){
  const groups = schoolStageGroups();
  const g = groups[gi];
  const sc = scState();
  const t = sc.teachers && sc.teachers[gi];
  const body = ov.querySelector('#scPlanBody'); if(!body || !g) return;
  const label = groups.length > 1 ? `老师${gi+1}` : '老师';

  if(!t || !t.raw || !String(t.raw).trim()){
    body.innerHTML = `
      <div class="sc-plan-empty" style="text-align:center;padding:42px 20px;display:flex;flex-direction:column;align-items:center;gap:12px;">
        <span style="font-size:38px;opacity:0.85">📖</span>
        <h4 style="margin:0;font-size:16px;font-weight:750;color:var(--txt)">本组逐章教案尚未生成</h4>
        <p style="margin:0;font-size:13px;color:var(--muted);max-width:380px;line-height:1.6">
          本组负责第 ${g.first} 至 ${g.last} 章（共 ${g.last - g.first + 1} 章${g.stage ? ' · ' + g.stage : ''}）。点击下方按钮开始备课。
        </p>
        <button type="button" class="btn primary" id="scEmptyPlanStart" style="padding:9px 24px;border-radius:10px;font-size:13.5px;font-weight:750;margin-top:8px">
          🎓 立即让${label}备课
        </button>
      </div>
    `;
    const btn = body.querySelector('#scEmptyPlanStart');
    if(btn){
      btn.onclick = async ()=>{
        ov.remove();
        const groups = schoolStageGroups();
        await nailRetry('t'+gi, `老师${groups.length > 1 ? gi+1 : ''}备课`, ()=> genTeacher(null, gi), null);
        openSchoolPlanReader(gi, jumpCh);
      };
    }
    return;
  }

  if(_planCUR_VIEW === 'raw'){
    const wrap = document.createElement('div');
    wrap.className = 'sc-plan-raw-box';
    wrap.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:6px 12px;border-radius:8px;background:var(--panel2);border:1px solid var(--line)">
        <span style="font-size:12px;font-weight:700;color:var(--txt)">📄 老师逐章教案 · 原稿纯文本</span>
        <button type="button" class="btn small" id="scCopyPlanBtn" style="font-size:11.5px;padding:3px 12px;border-radius:6px;cursor:pointer">📋 复制纯文本全文</button>
      </div>
      <pre class="sc-plan-raw" style="user-select:text;margin:0"></pre>
    `;
    wrap.querySelector('.sc-plan-raw').textContent = t.raw;
    const cpBtn = wrap.querySelector('#scCopyPlanBtn');
    if(cpBtn){
      cpBtn.onclick = ()=>{
        navigator.clipboard.writeText(t.raw).then(()=>{
          cpBtn.textContent = '✓ 已复制全文';
          setTimeout(()=>{ cpBtn.textContent = '📋 复制纯文本全文'; }, 1800);
        });
      };
    }
    body.innerHTML = '';
    body.appendChild(wrap);
    return;
  }
  const blocks = splitTeacherPlanChapters(t.raw);
  const byCh = new Map(blocks.map(b=>[b.ch,b]));
  let html = '';
  for(let ch=g.first; ch<=g.last; ch++){
    const b = byCh.get(ch) || null;
    let rows = '';
    if(b && b.fields.length){
      rows = b.fields.map(f => {
        const isLongText = f.v.length > 110;
        const tagCls = getFieldTagClass(f.k);
        return `
          <div class="sc-kf">
            <span class="sc-kf-k ${tagCls}">${esc(f.k)}</span>
            <div class="sc-kf-v-col">
              <div class="sc-kf-v ${isLongText ? 'sc-collapse-clamp' : ''}" data-val-raw="${esc(f.v)}">${esc(f.v)}</div>
              ${isLongText ? `<button type="button" class="sc-expand-btn">展开全文 ▾</button>` : ''}
            </div>
            <button type="button" class="sc-field-edit-btn" data-edit-ch="${ch}" data-edit-k="${esc(f.k)}" title="编辑该字段">✎</button>
          </div>
        `;
      }).join('');
    } else {
      rows = '<div class="sc-kf"><span class="sc-kf-k sc-tag-blue">提示</span><span class="sc-kf-v">该章节教案缺少可读字段，可切「原始稿」查看。</span></div>';
    }
    html += `<div class="sc-plan-ch" id="planCh-${ch}">
      <div class="sc-plan-ch-t">第${ch}章${b&&b.title?(' · '+esc(b.title)):''}</div>
      <div class="sc-kf-wrap">${rows}</div>
    </div>`;
  }
  body.innerHTML = html;

  body.querySelectorAll('.sc-expand-btn').forEach(btn => {
    btn.onclick = () => {
      const vEl = btn.previousElementSibling;
      vEl.classList.toggle('sc-collapse-clamp');
      btn.textContent = vEl.classList.contains('sc-collapse-clamp') ? '展开全文 ▾' : '收起 ▴';
    };
  });

  body.querySelectorAll('.sc-field-edit-btn').forEach(btn => {
    btn.onclick = () => {
      const ch = +btn.dataset.editCh;
      const k = btn.dataset.editK;
      const row = btn.closest('.sc-kf');
      const valCol = row.querySelector('.sc-kf-v-col');
      const oldVal = valCol.querySelector('.sc-kf-v').getAttribute('data-val-raw') || '';
      valCol.innerHTML = `
        <div class="sc-kf-edit-box" style="display:flex;flex-direction:column;gap:6px;width:100%;margin-top:4px;">
          <textarea class="sc-kf-edit-area" style="width:100%;min-height:85px;font-size:12.5px;padding:8px 10px;border-radius:8px;border:1px solid var(--accent);background:var(--panel);color:var(--txt);line-height:1.6;">${esc(oldVal)}</textarea>
          <div style="display:flex;gap:8px">
            <button type="button" class="btn small primary" data-save>保存修改</button>
            <button type="button" class="btn small ghost" data-cancel>取消</button>
          </div>
        </div>
      `;
      btn.style.display = 'none';
      valCol.querySelector('[data-save]').onclick = () => {
        const newV = valCol.querySelector('textarea').value;
        saveTeacherFieldEdit(gi, ch, k, newV);
        renderSchoolPlanBody(ov, gi, ch);
      };
      valCol.querySelector('[data-cancel]').onclick = () => {
        renderSchoolPlanBody(ov, gi, ch);
      };
    };
  });
}

function openSchoolPrincipalReader(){
  const sc = state.school;
  const p = sc && sc.principal;
  const raw = (p && p.raw) || '';
  if(!raw){
    toast('校长统筹成果尚未生成，请先点击「校长统筹」或「一键开学」');
    return;
  }
  _prCUR_VIEW = 'card';
  const ov = document.createElement('div'); ov.className = 'gs-overlay';
  ov.innerHTML = `
  <div class="gs-modal school-plan-modal" style="max-width:920px">
    <div class="gs-modal-head">
      <b>👑 校长统筹全局成果</b>
      <span class="sc-plan-meta muted">全校写作守则 · 各组组级框架 · 全书章节标题总表</span>
    </div>
    <div class="sc-plan-tool">
      <span class="sc-plan-tgl">
        <span class="sp-tgl-itm on" data-prv="card">结构化卡片</span>
        <span class="sp-tgl-itm" data-prv="raw">原始稿</span>
      </span>
      <button class="gs-x" data-pr-close>✕</button>
    </div>
    <div class="sc-plan-body" id="scPrincipalBody" style="max-height:72vh;overflow:auto;padding:14px 18px 22px"></div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-pr-close]').onclick = ()=> ov.remove();
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
  ov.querySelectorAll('[data-prv]').forEach(el=>{
    el.onclick = ()=>{
      _prCUR_VIEW = el.dataset.prv;
      ov.querySelectorAll('[data-prv]').forEach(x=>x.classList.toggle('on', x===el));
      renderSchoolPrincipalBody(ov, raw);
    };
  });
  renderSchoolPrincipalBody(ov, raw);
}

function renderSchoolPrincipalBody(ov, raw){
  const body = ov.querySelector('#scPrincipalBody');
  if(!body) return;
  if(_prCUR_VIEW === 'raw'){
    body.innerHTML = `<pre class="sc-plan-raw">${esc(raw||'（暂无内容）')}</pre>`;
    return;
  }
  
  const rulesSec = extractSection(raw, '全校写作守则', '各组组级框架') || extractSection(raw, '全校写作守则', '全书章节标题总表') || '';
  const frameSec = extractSection(raw, '各组组级框架', '全书章节标题总表') || '';
  const titles = (state.school && state.school.principal && state.school.principal.titles && state.school.principal.titles.length)
    ? state.school.principal.titles
    : parsePrincipalTitles(raw);
  const titlesApplied = isPrincipalTitlesApplied();
  
  let html = '';
  
  if(rulesSec){
    html += `
    <div class="sc-pr-card">
      <div class="sc-pr-card-h"><span class="sc-pr-card-ic">📜</span> <b>全校写作守则（配方锚点与可执行纪律）</b></div>
      <div class="sc-pr-card-b">
        <div class="sc-pr-rules-wrap">${esc(rulesSec).replace(/\n/g, '<br>')}</div>
      </div>
    </div>`;
  }
  
  if(frameSec){
    html += `
    <div class="sc-pr-card">
      <div class="sc-pr-card-h"><span class="sc-pr-card-ic">🗺</span> <b>各组组级框架</b></div>
      <div class="sc-pr-card-b">
        <div class="sc-pr-rules-wrap">${esc(frameSec).replace(/\n/g, '<br>')}</div>
      </div>
    </div>`;
  }

  html += `
  <div class="sc-pr-card">
    <div class="sc-pr-card-h" style="display:flex;align-items:center;justify-content:space-between">
      <span><span class="sc-pr-card-ic">📑</span> <b>全书章节标题总表（共 ${titles.length} 章）</b></span>
      ${titles.length ? `<button type="button" class="btn primary small" id="btnPrApplyTitles" ${titlesApplied?'disabled style="opacity:0.75"':''}>${titlesApplied ? '✓ 标题已全部应用至全书' : `✨ 选用这套章节标题（${titles.length} 章）`}</button>` : ''}
    </div>
    <div class="sc-pr-card-b">
      ${titles.length ? `
        <div class="sc-title-grid">
          ${titles.map(t=>`
            <div class="sc-title-item">
              <span class="sc-t-no">第${t.num}章</span>
              <span class="sc-t-name">《${esc(t.title)}》</span>
            </div>
          `).join('')}
        </div>
      ` : '<div class="muted">未能从原始稿中解析出标题列表，可切换到「原始稿」查看。</div>'}
    </div>
  </div>`;
  
  body.innerHTML = html;
  
  const btnApply = body.querySelector('#btnPrApplyTitles');
  if(btnApply && !titlesApplied){
    btnApply.onclick = ()=>{
      const ok = applyPrincipalTitles();
      if(ok){
        renderSchoolPrincipalBody(ov, raw);
      }
    };
  }
}

function openSchoolRawPanel(title, sub, raw){
  const ov = document.createElement('div'); ov.className='gs-overlay';
  ov.innerHTML = `<div class="gs-modal school-plan-modal">
    <div class="gs-modal-head"><b>${esc(title)}</b><button class="gs-x" data-sp-close>✕</button></div>
    ${sub?`<div class="gs-modal-sub">${esc(sub)}</div>`:''}
    <div class="sc-plan-body" style="max-height:68vh;overflow:auto;padding:12px 16px 20px"><pre class="sc-plan-raw">${esc(raw||'（暂无内容）')}</pre></div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-sp-close]').onclick = ()=> ov.remove();
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
}

  const api = {
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
    openSchoolRawPanel
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['school-pipeline'] = Object.freeze(api);
  return ns['school-pipeline'];
}
