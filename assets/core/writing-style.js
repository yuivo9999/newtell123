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

  // v28: shared draft state moved with the cohesive writing-style workspace region.
  let wsDraft = null;
  const schoolStageGroups = (...a) => (window.schoolStageGroups ? window.schoolStageGroups(...a) : (window.TellMeLegacyDomains?.['school-domain']?.schoolStageGroups ? window.TellMeLegacyDomains['school-domain'].schoolStageGroups(...a) : []));

function parseCustomStyleNote(note){
  const tips=[], avoid=[], check=[];
  let intro='', demo='';
  const lines = String(note||'').split(/\n/);
  let mode = null;
  lines.forEach(l=>{
    const t = String(l||'').trim();
    if(!t) return;
    let m;
    if((m=/^指令[:：]\s*(.*)$/.exec(t))){ mode='intro'; if(m[1]) intro=m[1]; return; }
    if((m=/^写法[:：]\s*(.*)$/.exec(t))){ mode='tips'; if(m[1]) tips.push(m[1].replace(/^[①②③④⑤]?[.、）)]?\s*/,'')); return; }
    if((m=/^避免[:：]\s*(.*)$/.exec(t))){ mode='avoid'; if(m[1]) avoid.push(m[1].replace(/^[✗×\-\s]+/,'')); return; }
    if((m=/^自查[:：]\s*(.*)$/.exec(t))){ mode='check'; if(m[1]) check.push(m[1].replace(/^[□✅◇\-\s]+/,'')); return; }
    if((m=/^示例[:：]\s*(.*)$/.exec(t))){ mode='demo'; if(m[1]) demo=m[1]; return; }
    if(mode==='intro'){ if(!intro) intro=t; }
    else if(mode==='tips') tips.push(t.replace(/^[①②③④⑤]?[.、）)]?\s*/,''));
    else if(mode==='avoid') avoid.push(t.replace(/^[✗×\-\s]+/,''));
    else if(mode==='check') check.push(t.replace(/^[□✅◇\-\s]+/,''));
    else if(mode==='demo'){ if(!demo) demo=t; }
  });
  return { intro, tips, avoid, check, demo };
}

function writeStyleLib(){
  const c = getCfg().styleCustom || {};
  const notes = (c && c.notes) || {};
  const removed = Array.isArray(c && c.removed) ? c.removed : [];
  const added = Array.isArray(c && c.added) ? c.added : [];
  const base = WRITE_STYLES.filter(s=> !removed.includes(s.id)).map(s=>{
    const cat = s.cat || 'element';
    return { ...s, group:'element', cat, note: notes[s.id] || s.note };
  });
  const customs = added.map(a=>{
    const hasStruc = (Array.isArray(a.tips)&&a.tips.length) || (Array.isArray(a.avoid)&&a.avoid.length) || (Array.isArray(a.check)&&a.check.length);
    const parsed = hasStruc ? { tips:a.tips||[], avoid:a.avoid||[], check:a.check||[], demo:a.demo||'' } : parseCustomStyleNote(a.note||'');
    const cat = ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].includes(a.group) ? a.group : 'custom';
    return { id:a.id, group:'element', name:a.name||'未命名', note:a.note||'', custom:true, cat, tips:parsed.tips||[], avoid:parsed.avoid||[], check:parsed.check||[], demo:parsed.demo||a.demo||'', seal:(a.seal===undefined?0:a.seal), warning:a.warning||'' };
  });
  return base.concat(customs);
}

function writeStyleById(id){
  return writeStyleLib().find(s=> s.id === id) || null;
}

function _idName(){
  if(_idNameMap) return _idNameMap;
  const m = new Map();
  writeStyleLib().forEach(s=>{ if(s.id) m.set(s.id, s.name); });
  return (_idNameMap = m);
}

function wiseWhyText(txt){
  if(!txt) return txt;
  const N = _idName();
  return String(txt).replace(/\b[A-Za-z_]\w*\b/g, w=> (N.has(w) ? N.get(w) : w));
}

function curWriteStyle(override){
  if(override && Array.isArray(override.tags)) return { tags: override.tags };
  const s = state.chapterStyle || {};
  return { tags: Array.isArray(s.tags)?s.tags:[] };
}

function wsGroupStyleTags(override){
  const st = curWriteStyle(override);
  const lib = writeStyleLib();
  return (Array.isArray(st.tags) ? st.tags : []).map(id=> lib.find(s=>s.id===id)).filter(Boolean);
}

function wsStyleNoteBlock(items, headTitle, intro){
  if(!items.length) return '';
  const lines = ['【' + headTitle + '（用户指定 · 最高优先指令）】', intro];
  items.forEach(s=>{
    lines.push('· '+s.name+'（总纲）：'+(s.note||''));
    if(Array.isArray(s.tips) && s.tips.length) lines.push('  写法：' + s.tips.map((t,i)=>`${['①','②','③','④','⑤'][i]||(i+1)+'.'} ${t}`).join('；'));
    if(Array.isArray(s.avoid) && s.avoid.length) lines.push('  避免：✗ ' + s.avoid.join('；✗ '));
    if(s.demo) lines.push('  示范写法：「'+s.demo+'」（可模仿其语感，不要照抄句子）');
    if(Array.isArray(s.check) && s.check.length) lines.push('  自查：' + s.check.map(c=>'□ '+c).join(' '));
  });
  lines.push('红线：以上风格仅约束表达方式，不得破坏人名/地名/专名一致性，不得违反基础剧情逻辑与人物设定。');
  return '\n\n' + lines.join('\n');
}

function chapterStyleNote(override){
  const items = wsGroupStyleTags(override);
  return wsStyleNoteBlock(items, '写作风格', '本指令是本章的表达层最高优先要求：它只决定‘怎么写’，不改写老师教案规定的‘写什么’。若与剧情推进、章节骨架、篇幅等任务发生冲突，不得删改教案事件；若与优化构想、人工润色建议等表达建议冲突，以用户已选写作风格为准。唯一不可逾越的红线：不得破坏人名/地名/专名一致性、不得违反基础剧情逻辑与人物设定。');
}

function writeStyleNamesBlock(){
  const items = wsGroupStyleTags(null);
  if(!items.length) return '';
  const names = items.map(s=>s.name).join('、');
  return `【写作风格（第一优先）】写作风格：${names}。\n本指令为本章规划的最高优先要求：当其与其它要求冲突时以本指令为准；唯一不可逾越红线：不破坏人名/地名/专名一致性、不违反基础剧情逻辑与人物设定。`;
}

function sizeSlider(side, label, lo, hi, step, r, on){
  const dflt = side==='word' ? {min:3000,max:5000} : {min:80,max:100};
  const v = (r && +r.min>0 && +r.max>0) ? {min:+r.min, max:+r.max} : dflt;
  v.min = Math.max(lo, Math.min(hi, v.min));
  v.max = Math.max(lo, Math.min(hi, v.max));
  if(v.max < v.min) v.max = v.min;
  const cls = on ? 'size-block on' : 'size-block';
  const fmt = n => side==='word' ? n.toLocaleString() : String(n);
  return `<div class="${cls}" data-side="${side}">
      <button type="button" class="size-pick" data-pick="${side}" aria-pressed="${on}">
        <span class="size-radio">${on?'✓':''}</span>
        <span class="size-lbl">${label}</span>
      </button>
      <span class="size-val"><b data-dr-val="${side}">${fmt(v.min)} ~ ${fmt(v.max)}</b></span>
      <div class="drs ${on?'':'ds-off'}" data-drs="${side}" data-min="${lo}" data-max="${hi}" data-step="${step}"></div>
      <span class="size-scale">${lo.toLocaleString()} ~ ${hi.toLocaleString()}${side==='word'?' 字':' 章'}</span>
    </div>`;
}

function initDRS(){
  $$('.drs').forEach(drs=>{
    const side = drs.dataset.drs;
    const lo = +drs.dataset.min, hi = +drs.dataset.max, step = +drs.dataset.step;
    const stateR = side==='word' ? state.wordRange : state.chapterRange;
    const dflt = side==='word' ? {min:3000,max:5000} : {min:80,max:100};
    let v0 = (stateR && +stateR.min>0) ? +stateR.min : dflt.min;
    let v1 = (stateR && +stateR.max>0) ? +stateR.max : dflt.max;
    v0 = Math.max(lo, Math.min(hi, v0));
    v1 = Math.max(lo, Math.min(hi, v1));
    if(v1 < v0) v1 = v0;
    if(drs.noUiSlider){ drs.noUiSlider.destroy(); drs.noUiSlider = null; } // render 会重建；先销毁旧实例
    if(drs.classList.contains('ds-off')) return;
    noUiSlider.create(drs, {
      start: [v0, v1],
      connect: true,
      step: step,
      margin: step,
      range: { min: lo, max: hi }
    });
    const lbl = drs.parentElement.querySelector('[data-dr-val="'+side+'"]');
    const fmt = n => side==='word' ? n.toLocaleString() : String(n);
    drs.noUiSlider.on('update', (vals)=>{
      if(lbl){ const a=+vals[0], b=+vals[1]; lbl.textContent = fmt(a)+' ~ '+fmt(b); }
    });
    drs.noUiSlider.on('change', (vals)=>{
      const R = { min: Math.round(+vals[0]), max: Math.round(+vals[1]) };
      if(side==='word'){ state.wordRange=R; state.chapterRange=null; }
      else { state.chapterRange=R; state.wordRange=null; }
      const hint = $('#sizeHint'); if(hint) hint.textContent = sizeHintText();
      persist(); render();
    });
  });
}

function pickSize(side){
  if(side==='word'){
    if(!(state.wordRange && +state.wordRange.min>0)) state.wordRange = { min:3000, max:5000 };
    state.chapterRange = null;
  }else{
    if(!(state.chapterRange && +state.chapterRange.min>0)) state.chapterRange = { min:80, max:100 };
    state.wordRange = null;
  }
  const hint = $('#sizeHint'); if(hint) hint.textContent = sizeHintText();
  persist(); render();
}

function scHealState(){
  const sc = state.school;
  if(!sc || typeof sc !== 'object') return;
  sc.finished = sc.finished || {};
  sc.stale = sc.stale || {};
  if(sc.principal && sc.principal.raw && String(sc.principal.raw).trim() && !sc.stale.principal){
    sc.finished.principal = true;
  }
  if(Array.isArray(sc.teachers)){
    sc.teachers.forEach((t, i)=>{
      if(t && t.raw && String(t.raw).trim() && !sc.stale['t'+i]){
        sc.finished['t'+i] = true;
      }
    });
  }
  const groups = schoolStageGroups();
  if(groups.length > 0 && groups.every((g, i) => sc.finished['t'+i])){
    sc.finished.teacher = true;
  }
}


function writeStyleState(){ return state.chapterStyle = state.chapterStyle || { tags:[], collapsed:false }; }

function wsDraftInit(){
  if(!wsDraft){ const st = writeStyleState(); wsDraft = { tags:(st.tags||[]).slice() }; }
  return wsDraft;
}

function wsDraftDirty(d, st){
  const a = ((d&&d.tags)||[]).slice().sort().join(',');
  const b = ((st&&st.tags)||[]).slice().sort().join(',');
  return a !== b;
}

function refreshWsUI(){
  const st = writeStyleState();
  const dirty = !!wsDraft && wsDraftDirty(wsDraft, st);
  const draft = wsDraft || st;
  const selName = (draft.tags||[]).map(id=>{ const s=writeStyleById(id); return s?s.name:id; }).join(' + ') || '无';
  const sum = $('.ws-sum');
  if(sum){ sum.textContent = (dirty?'⚠️ 待应用':'✔ 已生效')+' · '+(draft.tags||[]).length+' 项 · '+selName; sum.classList.toggle('dirty', dirty); }
  $$('[data-ws-tag]').forEach(b=> b.classList.toggle('on', (draft.tags||[]).includes(b.dataset.wsTag)));
  $$('[data-ws-combo]').forEach(b=>{
    const combo = availableCombos().find(c=> c.id === b.dataset.wsCombo);
    if(!combo) return;
    const active = combo.tags&&combo.tags.length && combo.tags.every(t=>(draft.tags||[]).includes(t));
    b.classList.toggle('on', active);
  });
  $$('.ws-subcat').forEach(sub=>{
    if(sub.classList.contains('open')) return;
    if(sub.querySelector('.ws-opt.on')){
      sub.classList.add('open');
      const ico = sub.querySelector('.ws-subcat-t .sc-fold-ico'); if(ico) ico.textContent='▾';
    }
  });
  const ap = $('[data-ws-apply]');
  if(ap){ ap.disabled = !dirty; ap.classList.toggle('disabled', !dirty); }
  const hint = $('.ws-dirty-hint');
  if(hint) hint.style.display = dirty ? '' : 'none';
}

function wsColorCfgOf(c){ c.styleCustom = c.styleCustom || { notes:{},added:[],removed:[] }; c.styleCustom.colorSchemes = c.styleCustom.colorSchemes || { custom:[], removedCustom:[], removedBuiltin:[], undo:[] }; return c.styleCustom.colorSchemes; }

function wsColorCfg(){ return wsColorCfgOf(getCfg()); }

function wsCustomColors(){ return wsColorCfg().custom || []; }

function wsRemovedBuiltin(){ return wsColorCfg().removedBuiltin || []; }

function wsRemovedCustom(){ return wsColorCfg().removedCustom || []; }

function wsUndoLog(){ return wsColorCfg().undo || []; }

function wsColorSchemesList(){
  const rm = wsRemovedBuiltin();
  return WS_COLOR_SCHEMES.filter(s=>!rm.includes(s.id)).concat(wsCustomColors());
}

function wsSchemeColors(id){
  if(id==='none') return [];
  const s = WS_COLOR_SCHEMES.find(x=>x.id===id) || wsCustomColors().find(x=>x.id===id) || wsRemovedCustom().find(x=>x.id===id);
  return s ? (s.c||[]) : [];
}

function wsSchemeName(id){
  if(id==='none') return '默认（无配色）';
  const s = WS_COLOR_SCHEMES.find(x=>x.id===id) || wsCustomColors().find(x=>x.id===id);
  return s ? s.name : id;
}

function wsColorSchemeId(){
  const sc = getCfg().styleCustom||{};
  const id = sc.colorScheme || 'none';
  if(id==='none') return 'none';
  if(WS_COLOR_SCHEMES.find(s=>s.id===id) && !wsRemovedBuiltin().includes(id)) return id;
  if(wsCustomColors().find(s=>s.id===id)) return id;
  return 'none';
}

function rebuildCustomColorCss(){
  let el = document.getElementById('wsCustomCss');
  if(!el){ el = document.createElement('style'); el.id='wsCustomCss'; document.head.appendChild(el); }
  el.textContent = wsCustomColors().map(s=>{ const col=(s.c&&s.c.length)? s.c[s.c.length-1] : ''; return col ? `[data-cs="${s.id}"]{--c-element:${col}}` : ''; }).filter(Boolean).join('\n');
}

function writeStyleChipsHtml(sel, dataPrefix, opts){
  opts = opts || {};
  const lib = writeStyleLib();
  const CAT_LABEL = { '语言质感':'① 语言质感', '情绪与张力':'② 情绪与张力', '节奏与网感':'③ 节奏与网感', '叙事技法':'④ 叙事技法', '台词设计':'⑤ 台词设计', custom:'⭐ 我的自定义' };
  const CAT_ORDER = ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计','custom'];
  const items = lib.filter(s=>s.group==='element');
  const mkOpt = s=>`<div class="ws-opt ${(sel.tags||[]).includes(s.id)?'on':''}" data-${dataPrefix}-tag="${s.id}">
    <div class="ws-opt-name">${esc(s.name)}</div>
    <div class="ws-opt-note">${esc(s.note)}</div>
  </div>`;
  const plus = opts.plus ? `<button type="button" class="ws-chip ws-chip-plus" data-${dataPrefix}-add="element" title="点击新建文风词条">＋</button>` : '';
  const useFold = dataPrefix === 'ws';
  const catOpen = (useFold && writeStyleState().catOpen) || {};
  const blocks = CAT_ORDER.map(cat=>{
    const its = items.filter(s=>(s.cat||'element')===cat);
    if(!its.length) return '';
    const hits = its.filter(s=>(sel.tags||[]).includes(s.id));
    const expanded = useFold ? (catOpen[cat] === true) : false;    // 展开态=显示本类全部
    const hasSel = hits.length > 0;
    const showBody = useFold ? (expanded || hasSel) : true;        // 专注态下：有已选则展示体(只显已选)，无已选则收成标题
    const shown = expanded ? its : hits;                            // 展开=全部；专注=仅已选
    const fold = useFold ? `<span class="sc-fold-ico">${expanded?'▾':'▸'}</span>` : '';
    return `<div class="ws-subcat${showBody?' open':''}"${useFold?` data-ws-catfold="${cat}"`:''}>
      <div class="ws-subcat-t"${useFold?' role="button" tabindex="0" title="专注态只显示已选词条，点此展开查看本类全部"':''}>${CAT_LABEL[cat]||cat}${useFold?`（${expanded ? `共 ${its.length}` : `已选 ${hits.length}`}）`:''}${fold}</div>
      <div class="ws-subcat-fold"><div class="ws-opt-list">${shown.map(mkOpt).join('')}</div></div>
    </div>`;
  }).filter(Boolean).join('');
  const comboList = dataPrefix==='ws' ? availableCombos() : [];
  const comboRemovedN = (getCfg().styleCustom||{}).comboRemoved && getCfg().styleCustom.comboRemoved.length ? getCfg().styleCustom.comboRemoved.length : 0;
  const customCombos = dataPrefix==='ws' ? ((getCfg().styleCustom||{}).customCombos||[]) : [];
  const comboOpen = (dataPrefix==='ws' && getCfg().styleCustom && getCfg().styleCustom.comboOpen) || {};
  const comboActive = c => !!(c.tags&&c.tags.length && (c.tags||[]).every(t=>(sel.tags||[]).includes(t)));
  const mkCombo = c=> `<div class="ws-opt ws-combo-btn${comboActive(c)?' on':''}" data-ws-combo="${c.id}"><span class="ws-combo-del" data-ws-combo-del="${c.id}" title="删除此组合">✕</span><div class="ws-opt-name">${esc(c.name)}</div><div class="ws-opt-note">${esc(c.desc||'')}</div></div>`;
  const comboBar = dataPrefix==='ws'
    ? `<div class="ws-combo${comboOpen.builtin===false?'':' open'}" data-ws-combofold="builtin">
       <div class="ws-subcat-t" role="button" tabindex="0" title="展开/收起">
         <span class="ws-combo-title"><span class="sc-fold-ico">${comboOpen.builtin===false?'▸':'▾'}</span> 🎬 组合配方 <span class="muted" style="font-size:10px;font-weight:400">点击即替换当前选择，可再叠加细项</span></span>
         ${comboRemovedN?`<button type="button" class="ws-combo-restore" data-ws-combo-restore>恢复已删组合(${comboRemovedN})</button>`:''}
       </div>
       <div class="ws-subcat-fold"><div class="ws-opt-list">${comboList.filter(c=>!c.custom).map(mkCombo).join('')}</div></div>
     </div>
     <div class="ws-combo ws-combo-mine${comboOpen.custom===false?'':' open'}" data-ws-combofold="custom">
       <div class="ws-subcat-t" role="button" tabindex="0" title="展开/收起">
         <span class="ws-combo-title"><span class="sc-fold-ico">${comboOpen.custom===false?'▸':'▾'}</span> 🏷 我的配方</span>
         <button type="button" class="ws-combo-add" data-ws-combo-add title="把当前草稿保存为自定义组合配方">＋</button>
       </div>
       <div class="ws-subcat-fold"><div class="ws-opt-list">${customCombos.map(mkCombo).join('')}</div></div>
     </div>`
    : '';
  const chipsTail = (opts.plus || opts.showTip !== false)
    ? `<div class="ws-chips">${opts.showTip !== false ? '<span class="ws-group-tip">可多选</span>' : ''}${plus}</div>` : '';
  return `${comboBar}${blocks}${chipsTail}`;
}

function toggleWriteTag(sel, id){
  const s = writeStyleById(id); if(!s) return;
  if(sel.tags.includes(id)){
    sel.tags = sel.tags.filter(x=>x!==id);
  } else {
    if(!sel.tags.includes(id)) sel.tags.push(id);
  }
}

function writeStyleCard(){
  const st = writeStyleState();
  const draft = wsDraft || st;
  const dirty = !!wsDraft && wsDraftDirty(wsDraft, st);
  const selName = (draft.tags||[]).map(id=>{ const s=writeStyleById(id); return s?s.name:id; }).join(' + ') || '无';
  const sumTxt = (dirty?'⚠️ 待应用':'✔ 已生效')+' · 🔒 表达层'+((draft.tags||[]).length?'已锁定':'待选择')+' · '+(draft.tags||[]).length+' 项 · '+selName;
  return `<div class="card ws-card card-theme-style${st.collapsed?' ws-collapsed':''}" data-cs="${wsColorSchemeId()}">
    <div class="ws-head card-head-bar" data-ws-fold role="button" tabindex="0" title="展开/收起">
      <div class="ch-left">
        <span class="ch-badge ch-badge-style">🎨</span>
        <h3 class="ch-title">写作风格基调</h3>
        <span class="ch-subtag ch-subtag-style${dirty?' dirty':''}">${sumTxt}</span>
      </div>
      <div class="ch-right">
        <button type="button" class="btn ghost ws-manage-btn" data-ws-lib title="编辑风格词库与我的收藏">⚙️ 管理</button>
        <span class="sc-fold-ico">${st.collapsed?'▸':'▾'}</span>
      </div>
    </div>
    <div class="ws-body"${st.collapsed?' hidden':''}>
      <div class="ws-fold-tools">
        <button type="button" class="btn small ghost" data-ws-fold-all title="展开全部词条类别">⤵ 全部展开</button>
        <button type="button" class="btn small ghost" data-ws-fold-none title="收起全部词条类别">⤴ 全部收起</button>
      </div>
      ${writeStyleChipsHtml(draft, 'ws', { plus:false, cardFold:true, showTip:false })}
      <div class="ws-tools">
        <button type="button" class="ws-chip ws-chip-plus" data-ws-add="element" title="点击新建文风词条">＋</button>
        <button type="button" class="btn small primary ws-apply${dirty?'':' disabled'}" data-ws-apply ${dirty?'':'disabled'} title="把当前草稿设为生效配置（从此生成用这套风格）">✔ 应用并保存</button>
        <button type="button" class="btn small ghost" data-ws-save title="把当前草稿收藏为预设（跨作品可用）">💾 收藏当前</button>
        <button type="button" class="btn small ghost" data-ws-clear>✕ 清空</button>
      </div>
      <p class="ws-dirty-hint" style="display:${dirty?'':'none'}">⚠️ 存在未生效的修改，点「✔ 应用并保存」生效</p>
    </div>
  </div>`;
}

function bindWriteStyle(){
  const st = writeStyleState();
  const head = $('[data-ws-fold]');
  if(head) head.onclick = ()=>{
    st.collapsed = !st.collapsed; persist();
    const body = $('.ws-body'); if(body) body.hidden = st.collapsed;
    const ico = head.querySelector('.sc-fold-ico'); if(ico) ico.textContent = st.collapsed?'▸':'▾';
  };
  $$('[data-ws-tag]').forEach(b=> b.onclick = ()=>{
    toggleWriteTag(wsDraftInit(), b.dataset.wsTag);
    refreshWsUI();
  });
  $$('[data-ws-combo]').forEach(b=> b.onclick = ()=>{
    const combo = availableCombos().find(c=> c.id === b.dataset.wsCombo); if(!combo) return;
    const d = wsDraftInit();
    const libIds = writeStyleLib().map(s=>s.id);
    d.tags = (combo.tags||[]).filter(id=> libIds.includes(id));
    render();
    toast(`已套用组合「${combo.name}」：${(d.tags.map(id=>{const s=writeStyleById(id);return s?s.name:id}).join(' + '))||'（部分词条已删，未套用）'}，点「✔ 应用并保存」生效`);
  });
  $$('[data-ws-combo-del]').forEach(b=> b.onclick = (e)=>{
    e.stopPropagation();
    const id = b.dataset.wsComboDel; if(!id) return;
    const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
    const isBuiltin = WRITE_COMBOS.some(c=> c.id === id);
    if(isBuiltin){
      const combo = WRITE_COMBOS.find(c=> c.id === id);
      if(!combo) return;
      if(!window.confirm(`删除组合「${combo.name}」后不再显示，可通过「恢复已删组合」还原。确定删除？`)) return;
      cfg.styleCustom.comboRemoved = cfg.styleCustom.comboRemoved || [];
      if(!cfg.styleCustom.comboRemoved.includes(id)) cfg.styleCustom.comboRemoved.push(id);
      saveCfg(cfg); render(); toast(`已删除组合「${combo.name}」`);
    } else {
      const combo = (cfg.styleCustom.customCombos||[]).find(c=> c.id === id);
      if(window.confirm(`删除自定义组合「${combo?combo.name:id}」？删后不可撤销。确定删除？`)){
        cfg.styleCustom.customCombos = (cfg.styleCustom.customCombos||[]).filter(x=> x.id !== id);
        saveCfg(cfg); render(); toast('已删除自定义组合');
      }
    }
  });
  const cadd = $('[data-ws-combo-add]');
  if(cadd) cadd.onclick = ()=>{
    const cur = wsDraft || writeStyleState();
    const tags = (cur.tags||[]).slice();
    if(!tags.length){ toast('当前无风格，暂无可保存的组合配方'); return; }
    const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
    cfg.styleCustom.customCombos = cfg.styleCustom.customCombos || [];
    const name = prompt('给这个组合配方起个名字：', '我的配方' + (cfg.styleCustom.customCombos.length + 1));
    if(!name || !name.trim()) return;
    const desc = tags.map(id=>{ const s=writeStyleById(id); return s? s.name : id; }).join(' + ');
    cfg.styleCustom.customCombos.push({ id:'cu'+Date.now().toString(36), name:name.trim(), desc, tags });
    saveCfg(cfg); render();
    toast('已保存为自定义组合「' + name.trim() + '」，点它即可一键套用');
  };
  const cre = $('[data-ws-combo-restore]');
  if(cre) cre.onclick = ()=>{
    if(!window.confirm('恢复全部被删除的组合配方？')) return;
    const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
    cfg.styleCustom.comboRemoved = [];
    saveCfg(cfg); render(); toast('已恢复全部默认组合');
  };
  const sel = $('#wsPreset');
  const ap = $('[data-ws-apply]');
  if(ap) ap.onclick = ()=>{
    if(!wsDraft) return;
    const st2 = writeStyleState();
    st2.tags = wsDraft.tags.slice();
    persist();
    const name = wsDraft.tags.map(id=>{ const s=writeStyleById(id); return s?s.name:id; }).join(' + ') || '无';
    wsDraft = null;
    refreshWsUI();
    toast('写作风格已生效：'+(name==='无'?'无风格（AI 默认文风）':name));
  };
  const sv = $('[data-ws-save]');
  if(sv) sv.onclick = ()=>{
    const cur = wsDraft || writeStyleState();
    if(!cur.tags.length){ toast('当前无风格，无需收藏'); return; }
    const cfg = getCfg(); if(!Array.isArray(cfg.stylePresets)) cfg.stylePresets = [];
    const name = prompt('给这个风格组合起个名字：', '我的风格'+(cfg.stylePresets.length+1));
    if(!name || !name.trim()) return;
    cfg.stylePresets.push({ id:'sp'+Date.now().toString(36), name:name.trim(), tags:cur.tags.slice() });
    saveCfg(cfg); render();
    toast('已收藏：'+name.trim());
  };
  const lb = $('[data-ws-lib]');
  if(lb) lb.onclick = (e)=>{ e.stopPropagation(); openStyleLibPanel(); };
  const cl = $('[data-ws-clear]');
  if(cl) cl.onclick = ()=>{ const d = wsDraftInit(); d.tags=[]; refreshWsUI(); toast('已清空草稿，点「✔ 应用并保存」生效'); };
  const wsCard = $('.ws-card');
  const fa = wsCard && wsCard.querySelector('[data-ws-fold-all]');
  if(fa) fa.onclick = ()=>{ const st=writeStyleState(); st.catOpen=st.catOpen||{};
    ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].forEach(k=> st.catOpen[k]=true);
    persist(); render(); };
  const fn = wsCard && wsCard.querySelector('[data-ws-fold-none]');
  if(fn) fn.onclick = ()=>{ const st=writeStyleState(); st.catOpen=st.catOpen||{};
    ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].forEach(k=> st.catOpen[k]=false);
    persist(); render(); };
  if(wsCard && !wsCard.dataset.catfoldBound){
    wsCard.dataset.catfoldBound = '1';
    wsCard.addEventListener('click', e=>{
      const t = e.target.closest('.ws-subcat-t');
      if(!t || !t.hasAttribute('role')) return;
      if(e.target.closest('.ws-combo-add, .ws-combo-restore')) return;
      const sub = t.closest('.ws-subcat, .ws-combo');
      if(!sub) return;
      if(sub.dataset.wsCombofold!==undefined){
        const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || {};
        cfg.styleCustom.comboOpen = cfg.styleCustom.comboOpen || {};
        const open = !sub.classList.contains('open');
        cfg.styleCustom.comboOpen[sub.dataset.wsCombofold] = open; saveCfg(cfg);
        sub.classList.toggle('open', open);
        const ico = t.querySelector('.sc-fold-ico'); if(ico) ico.textContent = open?'▾':'▸';
        return;
      }
      if(sub.dataset.wsCatfold===undefined) return;
      const st = writeStyleState(); st.catOpen = st.catOpen || {};
      st.catOpen[sub.dataset.wsCatfold] = !(st.catOpen[sub.dataset.wsCatfold]===true); persist();
      render();
    });
  }
  $$('[data-ws-add]').forEach(b=> b.onclick = ()=> openStyleNewDialog(b.dataset.wsAdd));
}

function openStyleNewDialog(group){
  closeStyleNewDialog();
  const CAT_LABEL = { '语言质感':'① 语言质感', '情绪与张力':'② 情绪与张力', '节奏与网感':'③ 节奏与网感', '叙事技法':'④ 叙事技法', '台词设计':'⑤ 台词设计', custom:'⭐ 我的自定义' };
  const catLabel = ()=> CAT_LABEL[group] || '自定义';
  const ov = document.createElement('div'); ov.id='wsNewPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>＋ 新建文风词条</b>
        <button class="gs-x" data-wsn-close>✕</button></div>
      <div class="cv-body">
        <label style="font-size:12px;color:var(--sub)">归属分类</label>
        <select id="wsnCat" style="margin:4px 0 10px">
          <option value="语言质感"${group==='语言质感'?' selected':''}>① 语言质感</option>
          <option value="情绪与张力"${group==='情绪与张力'?' selected':''}>② 情绪与张力</option>
          <option value="节奏与网感"${group==='节奏与网感'?' selected':''}>③ 节奏与网感</option>
          <option value="叙事技法"${group==='叙事技法'?' selected':''}>④ 叙事技法</option>
          <option value="台词设计"${group==='台词设计'?' selected':''}>⑤ 台词设计</option>
          <option value="custom"${group==='custom'?' selected':''}>⭐ 我的自定义</option>
        </select>
        <label style="font-size:12px;color:var(--sub)">风格名称（≤20字）*</label>
        <input type="text" id="wsnName" maxlength="20" placeholder="如：民国腔调 / 冷硬悬疑" style="margin:4px 0 10px" />
        <label style="font-size:12px;color:var(--sub)">指令文本（≤500字）</label>
        <textarea id="wsnNote" rows="4" maxlength="500" placeholder="推荐三行配方：&#10;写法：…&#10;避免：…&#10;自查：…" style="margin:4px 0 6px"></textarea>
        <div class="muted" style="font-size:11px">确认后将于「<span data-wsn-catlab>${catLabel()}</span>」分类下添加并默认勾选（草稿态，点「✔ 应用并保存」正式生效）。</div>
      </div>
      <div class="modal-actions" style="padding:12px 16px;border-top:1px solid var(--line)">
        <button type="button" class="btn ghost" data-wsn-close2>取消</button>
        <button type="button" class="btn primary" data-wsn-ok>✔ 确认新建</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const lab = ov.querySelector('[data-wsn-catlab]');
  const catSel = ov.querySelector('#wsnCat');
  if(catSel && lab) catSel.onchange = ()=> lab.textContent = CAT_LABEL[catSel.value] || '自定义';
  const close = ()=> closeStyleNewDialog();
  ov.querySelector('[data-wsn-close]').onclick = close;
  ov.querySelector('[data-wsn-close2]').onclick = close;
  ov.addEventListener('click', e=>{ if(e.target===ov) close(); });
  ov.querySelector('[data-wsn-ok]').onclick = ()=>{
    const name = ($('#wsnName') && $('#wsnName').value.trim()) || '';
    if(!name){ toast('请填写风格名称'); return; }
    const note = ($('#wsnNote') && $('#wsnNote').value.trim().slice(0,500)) || '';
    const cat = (catSel && catSel.value) || group || 'custom';
    const c = getCfg(); c.styleCustom = c.styleCustom || { notes:{}, added:[], removed:[] };
    c.styleCustom.added = c.styleCustom.added || [];
    const id = 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    c.styleCustom.added.push({ id, group:cat, name, note });
    saveCfg(c);
    const d = wsDraftInit(); if(!d.tags.includes(id)) d.tags.push(id);
    closeStyleNewDialog();
    render();
    toast('已新建并加入「'+name+'」');
  };
  const inp = $('#wsnName'); if(inp) inp.focus();
}

function closeStyleNewDialog(){ const p=$('#wsNewPanel'); if(p) p.remove(); }

function applyWritePresetDraft(v){
  const d = wsDraftInit();
  if(v === 'clear'){ d.tags=[]; }
  else if(v.indexOf('u:')===0){
    const cfg = getCfg();
    const p = (Array.isArray(cfg.stylePresets)?cfg.stylePresets:[]).find(x=>x.id===v.slice(2));
    if(p){ d.tags = (p.tags||[]).slice(); }
  } else {
    const p = WRITE_PRESETS.find(x=>x.id===v);
    if(p){ d.tags = p.tags.slice(); }
  }
  refreshWsUI();
}

function openStyleLibPanel(){
  closeStyleLibPanel();
  const cfg = getCfg();
  if(!cfg.styleCustom) cfg.styleCustom = { notes:{}, added:[], removed:[], comboRemoved:[] };
  const lib = writeStyleLib();
  const CAT_LABEL = { '语言质感':'① 语言质感', '情绪与张力':'② 情绪与张力', '节奏与网感':'③ 节奏与网感', '叙事技法':'④ 叙事技法', '台词设计':'⑤ 台词设计', custom:'⭐ 我的自定义' };
  const groups = Object.keys(CAT_LABEL);
  const notes = cfg.styleCustom.notes || {};
  const groupHtml = groups.map(g=>{
    const its = lib.filter(s=>(s.cat||'element')===g);
    return `<div class="ws-lib-group ws-lib-fold">
      <div class="ws-lib-fold-t" data-lib-fold="${g}" role="button" tabindex="0" title="展开/收起">
        <span>${CAT_LABEL[g]}${its.length?`（${its.length}）`:'（空）'}</span><span class="sc-fold-ico">▸</span>
      </div>
      <div class="ws-lib-fold-b" hidden>
        ${its.map(s=>`
        <div class="ws-lib-item">
          <div class="ws-lib-name">${esc(s.name)}${notes[s.id]?'<span class="ws-changed">已改</span>':''}${s.custom?'<span class="ws-custom">自定义</span>':''}</div>
          <textarea class="ws-lib-note" data-lib-note="${s.id}" rows="2" maxlength="500" placeholder="指令文本（≤500字；可用 写法:/避免:/自查: 三行写配方）">${esc(s.note||'')}</textarea>
          <div class="ws-lib-tools">
            ${s.custom?`<button type="button" class="btn small ghost" data-lib-del="${s.id}" title="删除该自定义词条">🗑 删除</button>`:`<button type="button" class="btn small ghost" data-lib-hide="${s.id}" title="从选择中移除该词条（「恢复默认」可还原）">🚫 停用</button>`}
          </div>
        </div>`).join('')}
        ${its.length?'':`<p class="muted" style="margin:4px 0">该组暂无词条：回到写作风格卡片点该组「＋」新建。</p>`}
      </div>
    </div>`;
  }).join('');
  const mine = (Array.isArray(cfg.stylePresets)?cfg.stylePresets:[]).map((p,i)=>`
    <div class="ws-lib-item">
      <div class="ws-lib-name">⭐ ${esc(p.name||'未命名')}</div>
      <span class="muted" style="font-size:11px">${(p.tags||[]).map(id=>{const s=writeStyleById(id); return s?s.name:id;}).join('+')||'无'}</span>
      <button type="button" class="btn small ghost del" data-sp-del="${i}">删</button>
    </div>`).join('') || '<p class="muted">暂无收藏。</p>';
  const combos_ = availableCombos();
  const combosHtml = combos_.length ? combos_.map(c=>`
    <div class="ws-lib-item">
      <div class="ws-lib-name">${c.custom?'🏷':'🎬'} ${esc(c.name||'未命名')}</div>
      <div class="ws-lib-note" style="white-space:pre-wrap;margin:2px 0 4px">${esc(c.desc||'')}</div>
      ${c.why?`<div class="ws-lib-why">💡 为何这样选：${esc(wiseWhyText(c.why))}</div>`:''}
      <span class="muted" style="font-size:11px">词条：${(c.tags||[]).map(id=>{const s=writeStyleById(id); return s?s.name:id;}).join(' + ')||'无'}</span>
    </div>`).join('') : '<p class="muted">暂无配方。</p>';
  const ov = document.createElement('div'); ov.id='wsLibPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>⚙️ 写作风格管理</b>
        <span style="display:flex;gap:6px">
          <button class="btn small ghost" data-lib-read>📖 阅读</button>
          <button class="btn small ghost" data-lib-reset>恢复默认</button>
          <button class="gs-x" data-lib-close>✕</button>
        </span></div>
      <!-- v239/905-1：管理第二行去掉「📜 消息看板」（看板入口保留在「叙事」菜单与 toast 📋 按钮）；「📦 选择导出」改为仅导出写作风格卡片内容（组合配方/我的配方/五大类词条） -->
      <div class="ws-lib-toprow">
        <span class="muted" style="font-size:11px;flex:0 0 auto">导入 / 导出：</span>
        <button type="button" class="btn small ghost" data-lib-rexcenter title="打开导出中心：平铺勾选组合配方、我的配方与五大类词条，打包导出">📦 选择导出</button>
        <button type="button" class="btn small ghost" data-lib-import title="导入风格词条包（合并式：只添加我没有的）">⬆ 导入词条</button>
        <button type="button" class="btn small ghost" data-lib-rimport title="导入配方包 JSON（先预览勾选，再确认导入；词条自动合并进词库）">⬆ 导入配方包</button>
        <input type="file" id="wsLibImportFile" accept=".json,application/json" hidden />
        <input type="file" id="wsRecipeImportFile" accept=".json,application/json" hidden />
      </div>
      <div class="cv-body">
        <div class="ws-lib-group ws-lib-fold">
          <div class="ws-lib-fold-t" data-lib-fold="combos" role="button" tabindex="0" title="展开/收起">
            <span>🧪 全部配方（${combos_.length}）</span><span class="sc-fold-ico">▾</span>
          </div>
          <div class="ws-lib-fold-b">${combosHtml}</div>
        </div>
        <div class="cv-div">支持在线编辑指令、停用内置词条或删除自定义项，实时生效。</div>
        ${groupHtml}
        <div class="ws-lib-group ws-lib-fold">
          <div class="ws-lib-fold-t" data-lib-fold="mine" role="button" tabindex="0" title="展开/收起">
            <span>⭐ 我的收藏</span><span class="sc-fold-ico">▸</span>
          </div>
          <div class="ws-lib-fold-b" hidden>${mine}</div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-lib-close]').onclick = closeStyleLibPanel;
  ov.querySelector('[data-lib-read]').onclick = () => openStyleLibReader();
  ov.querySelector('[data-lib-import]').onclick = ()=>{ const f=$('#wsLibImportFile'); if(f) f.click(); };
  const wlImp = ov.querySelector('#wsLibImportFile'); if(wlImp) wlImp.onchange = e=>{ const file=e.target.files && e.target.files[0]; if(file) importWsStyleBundle(file); e.target.value=''; };
  const rexc = ov.querySelector('[data-lib-rexcenter]'); if(rexc) rexc.onclick = ()=> openExportCenter();
  ov.querySelector('[data-lib-rimport]').onclick = ()=>{ const f=$('#wsRecipeImportFile'); if(f) f.click(); };
  const rImp = ov.querySelector('#wsRecipeImportFile'); if(rImp) rImp.onchange = e=>{ const file=e.target.files && e.target.files[0]; if(file) importRecipeBundle(file); e.target.value=''; };
  ov.addEventListener('click', e=>{ if(e.target===ov) closeStyleLibPanel(); });
  ov.querySelectorAll('[data-lib-fold]').forEach(h=> h.onclick = ()=>{
    const b = h.nextElementSibling; if(!b) return;
    const ico = h.querySelector('.sc-fold-ico'); if(ico) ico.textContent = b.hidden ? '▾' : '▸';
    b.hidden = !b.hidden;
  });
  ov.querySelectorAll('[data-lib-note]').forEach(ta=>{
    ta.onchange = ()=>{
      const id = ta.dataset.libNote;
      const v = ta.value.trim().slice(0,500);
      if(v) cfg.styleCustom.notes[id] = v; else delete cfg.styleCustom.notes[id];
      saveCfg(cfg);
      const it = ta.closest('.ws-lib-item'); const nm = it && it.querySelector('.ws-lib-name');
      if(nm){
        let badge = nm.querySelector('.ws-changed');
        if(v){ if(!badge){ badge=document.createElement('span'); badge.className='ws-changed'; badge.textContent='已改'; nm.appendChild(badge); } }
        else if(badge) badge.remove();
      }
      toast('已保存指令');
    };
  });
  ov.querySelectorAll('[data-lib-del]').forEach(b=>{
    b.onclick = ()=>{
      cfg.styleCustom.added = (cfg.styleCustom.added||[]).filter(x=>x.id!==b.dataset.libDel);
      saveCfg(cfg); render(); toast('已删除自定义风格');
      closeStyleLibPanel(); openStyleLibPanel();   // 立即刷新面板，删除项即时消失
    };
  });
  ov.querySelectorAll('[data-lib-hide]').forEach(b=>{
    b.onclick = ()=>{
      if(!window.confirm('停用后该词条将从选择中移除，可通过「恢复默认」还原。确定停用？')) return;
      cfg.styleCustom.removed = cfg.styleCustom.removed || [];
      if(!cfg.styleCustom.removed.includes(b.dataset.libHide)) cfg.styleCustom.removed.push(b.dataset.libHide);
      saveCfg(cfg); render(); toast('已停用该词条');
      closeStyleLibPanel(); openStyleLibPanel();
    };
  });
  ov.querySelectorAll('[data-sp-del]').forEach(b=>{
    b.onclick = ()=>{
      cfg.stylePresets.splice(+b.dataset.spDel,1);
      saveCfg(cfg); render(); toast('已删除收藏');
      closeStyleLibPanel(); openStyleLibPanel();   // 立即刷新面板，删除项即时消失
    };
  });
  ov.querySelector('[data-lib-reset]').onclick = ()=>{
    if(!window.confirm('恢复默认将清空全部词库改动（自定义新增也会删除）。确定？')) return;
    cfg.styleCustom = { notes:{}, added:[], removed:[], comboRemoved:[] };
    saveCfg(cfg); render(); toast('已恢复默认词库');
    closeStyleLibPanel(); openStyleLibPanel();   // 立即重建面板：清掉「已改」标记、自定义项与编辑过的指令
  };
}

function importWsStyleBundle(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    let data;
    try{ data = JSON.parse(reader.result); }
    catch(e){ toast('导入失败：文件不是合法 JSON'); return; }
    if(data && data.kind === 'wsStylePack'){
      const builtinEntryIds = new Set((WRITE_STYLES||[]).map(s=> s && s.id).filter(Boolean));
      const builtinComboIds = new Set((WRITE_COMBOS||[]).map(c=> c && c.id).filter(Boolean));
      const CATS = ['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'];
      const entries = Array.isArray(data.entries) ? data.entries : [];
      const added = entries
        .filter(x=> x && x.id && x.name && !builtinEntryIds.has(String(x.id)))
        .map(x=>({ id:String(x.id), group: CATS.includes(x.cat)?x.cat:(CATS.includes(x.group)?x.group:'custom'), name:String(x.name), note:String(x.note||''), demo:x.demo?String(x.demo):'', seal:(x.seal===undefined?0:x.seal), warning:x.warning?String(x.warning):'' }));
      const notes = {};
      entries.forEach(x=>{
        if(x && x.id && builtinEntryIds.has(String(x.id))){
          const b = (WRITE_STYLES||[]).find(s=> s && s.id===x.id);
          if(b && String(x.note||'') !== String(b.note||'')) notes[String(x.id)] = String(x.note||'');
        }
      });
      const myC = (Array.isArray(data.myCombos)?data.myCombos:[]).filter(c=> c && c.id && c.name);
      const extraC = (Array.isArray(data.combos)?data.combos:[]).filter(c=> c && c.id && c.name && !builtinComboIds.has(String(c.id)));
      data = { styleCustom: { notes, added, removed:[], comboRemoved:[], customCombos: myC.concat(extraC) } };
    }
    if(!data || typeof data !== 'object' || !data.styleCustom || typeof data.styleCustom !== 'object'){
      toast('导入失败：不是合法的写作风格配方 JSON'); return;
    }
    const sc = data.styleCustom;
    const strArr = v => Array.isArray(v) ? v.map(String).filter(x=> !!x) : [];
    const builtinIds = [].concat(WRITE_STYLES || []).map(s=> s && s.id).filter(Boolean);
    const cfg = getCfg(); cfg.styleCustom = cfg.styleCustom || { notes:{}, added:[], removed:[], comboRemoved:[] };
    let addedN=0, keptN=0;
    const notes = (sc.notes && typeof sc.notes==='object') ? sc.notes : {};
    Object.keys(notes).forEach(id=>{ if(!(id in cfg.styleCustom.notes)) cfg.styleCustom.notes[id] = notes[id]; });
    const haveIds = new Set((cfg.styleCustom.added||[]).map(x=> x && x.id));
    (Array.isArray(sc.added) ? sc.added : [])
      .filter(x=> x && x.id && x.name)
      .map(x=>({ id:String(x.id), group:['语言质感','情绪与张力','节奏与网感','叙事技法','台词设计'].includes(x.group)?x.group:'custom', name:String(x.name), note:String(x.note||''), demo:x.demo?String(x.demo):'', seal:(x.seal===undefined?0:x.seal), warning:x.warning?String(x.warning):'' }))
      .forEach(x=>{ if(haveIds.has(x.id)){ keptN++; return; } cfg.styleCustom.added.push(x); haveIds.add(x.id); addedN++; });
    const rmSet = new Set(strArr(cfg.styleCustom.removed));
    strArr(sc.removed).filter(id=> builtinIds.includes(id)).forEach(id=> rmSet.add(id));
    cfg.styleCustom.removed = Array.from(rmSet);
    const crSet = new Set(strArr(cfg.styleCustom.comboRemoved));
    strArr(sc.comboRemoved).filter(id=> (WRITE_COMBOS||[]).some(c=> c.id === id)).forEach(id=> crSet.add(id));
    cfg.styleCustom.comboRemoved = Array.from(crSet);
    const libNowIds = new Set(writeStyleLib().map(s=> s.id));
    const haveCombo = new Set((cfg.styleCustom.customCombos||[]).map(x=> x && x.id));
    (Array.isArray(sc.customCombos) ? sc.customCombos : [])
      .filter(x=> x && x.id && x.name)
      .map(x=>({ id:String(x.id), name:String(x.name), desc:String(x.desc||''), tags:strArr(x.tags).filter(id=> libNowIds.has(id)) }))
      .forEach(x=>{ if(haveCombo.has(x.id)){ keptN++; return; } cfg.styleCustom.customCombos.push(x); haveCombo.add(x.id); addedN++; });
    saveCfg(cfg); render();
    toast(`已合并导入：新增 ${addedN} 项 · 已有保留 ${keptN} 项`);
    closeStyleLibPanel(); openStyleLibPanel();   // 重建面板，导入内容立即可见
  };
  reader.readAsText(file);
}

function closeStyleLibPanel(){ const p=$('#wsLibPanel'); if(p) p.remove(); }

function openStyleLibReader(){
  closeStyleLibReader();
  const lib = writeStyleLib();
  const CAT_LABEL = { '语言质感':'① 语言质感', '情绪与张力':'② 情绪与张力', '节奏与网感':'③ 节奏与网感', '叙事技法':'④ 叙事技法', '台词设计':'⑤ 台词设计', custom:'⭐ 我的自定义' };
  const groups = {};
  lib.forEach(s=>{
    const cat = s.cat || 'custom';
    if(!groups[cat]) groups[cat] = [];
    groups[cat].push(s);
  });
  const order = Object.keys(CAT_LABEL).filter(g=>groups[g] && groups[g].length);
  (Object.keys(groups).filter(g=>!Object.prototype.hasOwnProperty.call(CAT_LABEL,g))).forEach(g=>order.push(g));
  let html = order.map(cat=>{
    let catHtml = `<h2>${CAT_LABEL[cat] || cat}（${groups[cat].length}）</h2>`;
    catHtml += groups[cat].map(s=>`
      <div class="style-recipe">
        <h3>【${esc(s.name)}】${s.custom?'<span class="ws-custom">自定义</span>':''}</h3>
        <p><strong>指令：</strong>${esc(s.note||'')}</p>
        ${s.tips && s.tips.length ? `<p><strong>写法：</strong>${s.tips.map((t,i)=>`${i+1}. ${esc(t)}`).join('；')}</p>` : ''}
        ${s.avoid && s.avoid.length ? `<p><strong>避免：</strong>${s.avoid.map(a=>'✗ '+esc(a)).join('；')}</p>` : ''}
        ${s.check && s.check.length ? `<p><strong>自查：</strong>${s.check.map(c=>'□ '+esc(c)).join('　')}</p>` : ''}
        ${s.demo ? `<p><strong>示例：</strong>「${esc(s.demo)}」</p>` : ''}
      </div>`).join('');
    return catHtml;
  }).join('');
  const ov = document.createElement('div'); ov.id='wsLibReader'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal reader-modal">
      <div class="gs-modal-head"><b>📖 写作风格配方大全</b>
        <span style="display:flex;gap:6px">
          <button class="btn small ghost" data-lib-read-copy>复制全文</button>
          <button class="gs-x" data-lib-read-close>✕</button>
        </span></div>
      <div class="cv-body"><div class="reader-body">${html}</div></div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-lib-read-close]').onclick = closeStyleLibReader;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeStyleLibReader(); });
  ov.querySelector('[data-lib-read-copy]').onclick = ()=>{
    let txt = '写作风格配方大全\n' + '='.repeat(24) + '\n\n';
    order.forEach(cat=>{
      txt += `${CAT_LABEL[cat] || cat}（${groups[cat].length}）\n${'-'.repeat(20)}\n`;
      groups[cat].forEach(s=>{
        txt += `\n【${s.name}】${s.custom?'[自定义]':''}\n`;
        if(s.note) txt += `指令：${s.note}\n`;
        if(s.tips && s.tips.length) txt += `写法：${s.tips.map((t,i)=>`${i+1}. ${t}`).join('；')}\n`;
        if(s.avoid && s.avoid.length) txt += `避免：✗ ${s.avoid.join('；✗ ')}\n`;
        if(s.check && s.check.length) txt += `自查：${s.check.map(c=>`□ ${c}`).join('　')}\n`;
        if(s.demo) txt += `示例：「${s.demo}」\n`;
      });
      txt += '\n';
    });
    copyText(txt);
  };
}

function closeStyleLibReader(){ const p=$('#wsLibReader'); if(p) p.remove(); }
  const api = {
    parseCustomStyleNote,
    getWsDraft: () => wsDraft,
    setWsDraft: (v) => { wsDraft = v; },
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
    writeStyleState
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['writing-style'] = Object.freeze(api);
  return ns['writing-style'];
}
