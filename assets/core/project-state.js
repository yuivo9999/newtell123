/** v41 consolidated module: project-state.js */
// ---- merged source: project-state.js ----
const _m0 = (() => {
/* v26: cohesive legacy region extracted from app-legacy.js. */

function install(deps){
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
    lib: rawLib,
    gglib,
    state: rawState,
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

  const state = new Proxy({}, {
    get(_, p) { return (rawState ?? deps.state ?? window.TellMeRuntime?.state ?? window.state ?? (window.TellMeLegacyShared && window.TellMeLegacyShared.state) ?? {})[p]; },
    set(_, p, v) {
      const target = rawState ?? deps.state ?? window.TellMeRuntime?.state ?? window.state ?? (window.TellMeLegacyShared && window.TellMeLegacyShared.state);
      if (target) { target[p] = v; }
      else if (window.state) { window.state[p] = v; }
      return true;
    }
  });
  const lib = new Proxy({}, {
    get(_, p) { return (rawLib ?? deps.lib ?? window.TellMeRuntime?.lib ?? window.lib ?? (window.TellMeLegacyShared && window.TellMeLegacyShared.lib) ?? { curId: null, items: [] })[p]; },
    set(_, p, v) {
      const target = rawLib ?? deps.lib ?? window.TellMeRuntime?.lib ?? window.lib ?? (window.TellMeLegacyShared && window.TellMeLegacyShared.lib);
      if (target) { target[p] = v; }
      else if (window.lib) { window.lib[p] = v; }
      return true;
    }
  });

function projectSnapshot(){
  return {
    mode: state.mode || 'longnovel',
    wordRange: state.wordRange || null,
    chapterRange: state.chapterRange || null,
    totalWords: state.totalWords || null,
    chapterCount: (state.chapterCount && +state.chapterCount>0) ? +state.chapterCount : null,
    bookBeat: (typeof currentBookBeatId === 'function' ? currentBookBeatId() : (state.bookBeat || null)),
    openingStrategy: (typeof currentOpeningStrategyId === 'function' ? currentOpeningStrategyId() : (state.openingStrategy || 'auto')),
    idea: state.idea,
    coverPrompt: state.coverPrompt,
    coverWithTitle: state.coverWithTitle,
    outline: state.outline,
    outlineConfirmed: state.outlineConfirmed,
    glossAdherence: state.glossAdherence,
    glossAllowFill: state.glossAllowFill,
    glossSeenTs: Number(state._glossSeenTs) || 0,
    langLayer: (typeof state.langLayer === 'boolean') ? state.langLayer : true,
    _narrIron: state._narrIron,
    banList: (state.banList && typeof state.banList === 'object') ? normalizeBanList(state.banList) : null,
    gsCollapsed: state.gsCollapsed,
    cpCollapsed: state.cpCollapsed,
    soCollapsed: !!state.soCollapsed,
    deCollapsed: !!state.deCollapsed,
    polishCollapsed: !!state.polishCollapsed,
    gsCatFold: (state.gsCatFold && typeof state.gsCatFold === 'object') ? state.gsCatFold : { main:false, support:false, walkon:false, place:false, proper:false, sub:false },   // 词典小类别折叠态（仅存结构，运行时各键默认见 state）
    useChapterPlans: true,
    plannerFinalized: !!state.plannerFinalized,
    expOpenGroups: state.expOpenGroups,
    polishOptions: state.polishOptions,
    polishAdopted: state.polishAdopted,
    polishHistory: state.polishHistory,
    chapters: state.chapters,
    characters: state.characters,
    ctAdviceHist: Array.isArray(state.ctAdviceHist) ? state.ctAdviceHist : [],
    contentAdviceHist: Array.isArray(state.contentAdviceHist) ? state.contentAdviceHist : [],
    expSel: Array.isArray(state.expSel) ? state.expSel : [],
    hist: state.hist || { characters:[], scenes:[], cover:[], storyboard:[] },
    chapterStyle: state.chapterStyle || { tags: [], collapsed: false },
    fcCollapsed: !!state.fcCollapsed,
    rsCollapsed: !!state.rsCollapsed,
    _fixQueue: Array.isArray(state._fixQueue) ? state._fixQueue : [],
    aiNetwork: state.aiNetwork || { stage:'idle', running:[], completed:[], blockedBy:{} },
    teamShape: (state.teamShape==='dual'||state.teamShape==='trio'||state.teamShape==='quad'||state.teamShape==='quint') ? state.teamShape : 'solo',
    _chapterPartial: state._chapterPartial || {},
    scenes: state.scenes,
    storyboard: state.storyboard,
    boardConcepts: state.boardConcepts,
    raw: state.raw,
    titleHistory: state.titleHistory,
    step: currentStep,
    title: (state.outline && state.outline.title) || (state.idea ? state.idea.trim().slice(0,20) : '未命名作品'),
    logline: (state.outline && state.outline.logline) || '',
    _lastCpRaw: state._lastCpRaw || '',
    dictmasterHistory: Array.isArray(state.dictmasterHistory) ? state.dictmasterHistory : [],
    dictmasterLatest: state.dictmasterLatest || null,
    dictmasterRan: !!state.dictmasterRan,
    originalIdeaSnapshot: state.originalIdeaSnapshot || '',
    school: (state.school && typeof state.school === 'object') ? state.school : null,   // 学校模式：校长/老师 产出 + 各步重试/完成标记（随项目持久化）
    longMemory: state.longMemory || { uiOpen:false, foreshadow:[], lastAuditAt:0 }
  };
}

function applyProject(p){
  state.mode = (p.mode === 'shortfilm') ? 'shortfilm' : 'longnovel';
  state.wordRange = (p.wordRange && p.wordRange.min && p.wordRange.max) ? {min:+p.wordRange.min, max:+p.wordRange.max} : (p.chapterRange ? null : null);
  state.chapterRange = (p.chapterRange && p.chapterRange.min && p.chapterRange.max) ? {min:+p.chapterRange.min, max:+p.chapterRange.max} : null;
  state.totalWords = (p.totalWords && +p.totalWords>0) ? +p.totalWords : null;
  state.chapterCount = (p.chapterCount && +p.chapterCount>0) ? +p.chapterCount : null;
  state.bookBeat = [4,7,12,15].includes(Number(p.bookBeat)) ? Number(p.bookBeat) : (state.bookBeat || (typeof BOOK_BEAT_DEFAULT_ID !== 'undefined' ? BOOK_BEAT_DEFAULT_ID : 7));
  const hasOpeningDef = typeof openingStrategyDef === 'function';
  state.openingStrategy = hasOpeningDef ? (openingStrategyDef(p.openingStrategy) ? p.openingStrategy : 'auto') : (p.openingStrategy || 'auto');
  state.longMemory = (p.longMemory && typeof p.longMemory === 'object') ? p.longMemory : { uiOpen:false, foreshadow:[], lastAuditAt:0 };
  state.idea = p.idea || '';
  state.coverPrompt = p.coverPrompt || '';
  state.coverWithTitle = !!p.coverWithTitle;
  state.outline = p.outline || null;
  if(state.outline && state.outline.chapterPlansHistory) delete state.outline.chapterPlansHistory;
  state.outlineConfirmed = !!p.outlineConfirmed;
  state.glossAdherence = (typeof p.glossAdherence === 'number') ? p.glossAdherence : 60;
  state.glossAllowFill = !!p.glossAllowFill;
  state._glossSeenTs = Number(p.glossSeenTs) || 0;
  state.langLayer = (typeof p.langLayer === 'boolean') ? p.langLayer : true;
  state._narrIron = (typeof p._narrIron === 'boolean') ? p._narrIron : true;
  state.banList = (p.banList && typeof p.banList === 'object') ? normalizeBanList(p.banList) : null;
  state.gsCollapsed = (typeof p.gsCollapsed === 'boolean') ? p.gsCollapsed : false;
  state.cpCollapsed = (typeof p.cpCollapsed === 'boolean') ? p.cpCollapsed : true;
  state.soCollapsed = !!p.soCollapsed;
  state.deCollapsed = !!p.deCollapsed;
  state.polishCollapsed = !!p.polishCollapsed;
  state.gsCatFold = (p.gsCatFold && typeof p.gsCatFold === 'object') ? p.gsCatFold : { main:false, support:false, walkon:false, place:false, proper:false, sub:false };   // 词典小类别折叠态恢复
  const _gcf = state.gsCatFold; if(_gcf && typeof _gcf === 'object'){ ['main','support','walkon'].forEach(k=>{ if(typeof _gcf[k] !== 'boolean') _gcf[k] = false; }); }
  state.useChapterPlans = true;
  state.plannerFinalized = (typeof p.plannerFinalized === 'boolean') ? p.plannerFinalized : false;
  state.expOpenGroups = Array.isArray(p.expOpenGroups) ? p.expOpenGroups : [];
  state.polishOptions = Array.isArray(p.polishOptions) ? p.polishOptions : undefined;
  state.polishAdopted = (typeof p.polishAdopted === 'string') ? p.polishAdopted : undefined;
  state.polishHistory = Array.isArray(p.polishHistory) ? p.polishHistory : undefined;
  state.chapters = p.chapters || [];
  (state.chapters||[]).forEach(c=>{ if(c) delete c.qcRecord; });
  if(state.outline) delete state.outline.titleQC;
  (state.chapters||[]).forEach(c=>{ if(c){ delete c.volume; delete c.volumeTheme; } });
  if(state.outline){ delete state.outline.volumes; delete state.outline._volumes; if(state.outline.structure) delete state.outline.structure; }
  state.characters = p.characters || [];
  state.ctAdviceHist = Array.isArray(p.ctAdviceHist) ? p.ctAdviceHist : [];
  state.contentAdviceHist = Array.isArray(p.contentAdviceHist) ? p.contentAdviceHist : [];
  state.expSel = Array.isArray(p.expSel) ? p.expSel.filter(i=> Number.isInteger(i)) : [];
  state.hist = (p.hist && typeof p.hist === 'object') ? {
    characters: Array.isArray(p.hist.characters)?p.hist.characters:[],
    scenes: Array.isArray(p.hist.scenes)?p.hist.scenes:[],
    cover: Array.isArray(p.hist.cover)?p.hist.cover:[],
    storyboard: Array.isArray(p.hist.storyboard)?p.hist.storyboard:[]
  } : { characters:[], scenes:[], cover:[], storyboard:[] };
  state.chapterStyle = (p.chapterStyle && typeof p.chapterStyle === 'object')
    ? { tags: Array.isArray(p.chapterStyle.tags)?p.chapterStyle.tags:[], collapsed: !!p.chapterStyle.collapsed }
    : { tags: [], collapsed: false };
  if(typeof setWsDraft === 'function') setWsDraft(null); else try { (window.TellMeLegacyDomains?.['workspace-domain']?.setWsDraft || window.setWsDraft)?.(null); } catch(e){}
  state.scenes = p.scenes || [];
  state.storyboard = p.storyboard || [];
  state.boardConcepts = p.boardConcepts || [];
  state._lastCpRaw = p._lastCpRaw || '';
  state.titleHistory = Array.isArray(p.titleHistory) ? p.titleHistory : [];
  state.raw = p.raw || {};
  currentStep = (p.step && p.step >= 1 && p.step <= 5) ? p.step : 1;
  state.fcCollapsed = !!p.fcCollapsed;
  state.rsCollapsed = !!p.rsCollapsed;
  state._fixQueue = Array.isArray(p._fixQueue) ? p._fixQueue : [];
  state.aiNetwork = (p.aiNetwork && typeof p.aiNetwork === 'object') ? p.aiNetwork : { stage:'idle', running:[], completed:[], blockedBy:{} };
  state.dictmasterHistory = Array.isArray(p.dictmasterHistory) ? p.dictmasterHistory : [];
  state.dictmasterLatest = (p.dictmasterLatest && typeof p.dictmasterLatest === 'object') ? p.dictmasterLatest : null;
  state.dictmasterRan = !!p.dictmasterRan;
  state.originalIdeaSnapshot = (typeof p.originalIdeaSnapshot === 'string') ? p.originalIdeaSnapshot : '';
  state.school = (p.school && typeof p.school === 'object') ? p.school : null;   // 学校模式恢复（校长/老师 产出 + 重试/完成标记）
  if(!state.school || typeof state.school !== 'object') state.school = {};
  if(!state.school.finished || typeof state.school.finished !== 'object') state.school.finished = {};
  if(!state.school.retries || typeof state.school.retries !== 'object') state.school.retries = {};
  if(!Array.isArray(state.school.teachers)) state.school.teachers = [];
  state.teamShape = (p.teamShape==='dual'||p.teamShape==='trio'||p.teamShape==='quad'||p.teamShape==='quint') ? p.teamShape : 'solo';
  state._chapterPartial = (p._chapterPartial && typeof p._chapterPartial === 'object') ? p._chapterPartial : {};
  if(typeof normalizeOutline === 'function') normalizeOutline(state.outline);
  else try { (window.TellMeLegacyDomains?.['story-domain']?.normalizeOutline || window.normalizeOutline)?.(state.outline); } catch(e){}
}

function clearState(){
  state.mode = 'longnovel';
  state.wordRange = null; state.chapterRange = null; state.totalWords = null; state.chapterCount = null;
  state.idea = ''; state.outline = null; state.coverPrompt = ''; state.coverWithTitle = false; state.outlineConfirmed = false;
  state.glossAdherence = 60; state.glossAllowFill = false; state.gsCollapsed = false;
  state.langLayer = true;
  state._narrIron = true;
  state.banList = null;
  state.useChapterPlans = true;
  state.chapters = []; state.characters = []; state.scenes = []; state.storyboard = []; state.boardConcepts = []; state.titleHistory = []; state.raw = {};
  state.ctAdviceHist = []; state.contentAdviceHist = [];
  state.expSel = [];
  state.hist = { characters:[], scenes:[], cover:[], storyboard:[] };
  state.chapterStyle = { tags: [], collapsed: false };
  state.fcCollapsed = false; state.rsCollapsed = false;
  state._fixQueue = [];
  state.dictmasterHistory = [];
  state.dictmasterLatest = null;
  state.dictmasterRan = false;
  state.originalIdeaSnapshot = '';
  state.school = null;   // 学校模式：新项目/重置清空（校长/老师产出 + 重试/完成标记）
  state.longMemory = { uiOpen:false, foreshadow:[], lastAuditAt:0 };
  state.teamShape = 'solo';
  state.openingStrategy = 'auto';
  state.polishCollapsed = false;
  state._chapterPartial = {};
  state.aiNetwork = { stage:'idle', running:[], completed:[], blockedBy:{} };
  state._lastCpRaw = '';
  if(typeof setWsDraft === 'function') setWsDraft(null); else try { (window.TellMeLegacyDomains?.['workspace-domain']?.setWsDraft || window.setWsDraft)?.(null); } catch(e){}
  currentStep = 1;
}

function writeOneProjectRecord(p){
  if(!p || !p.id) return 'ls';
  try{
    const s = JSON.stringify(p);
    if(s && s.length > LS_SINGLE_SAFE) throw new Error('over-ls-limit');
    localStorage.setItem(lsKeyFor(p.id), s);
    return 'ls';
  }catch(e){
    try{ idbPut(p).catch(function(){}); }catch(e2){}
    try{ localStorage.removeItem(lsKeyFor(p.id)); }catch(e3){}   // 清掉旧的 localStorage 版，避免读到旧数据
    return 'idb';
  }
}

function removeOneProjectRecord(id, wasSt){
  try{ localStorage.removeItem(lsKeyFor(id)); }catch(e){}
  if(wasSt === 'idb' || wasSt == null){ try{ idbDelete(id).catch(function(){}); }catch(e){} }
}

function idbSaveLib(){
  const ids = new Set(lib.items.map(i=> i.id));
  let oldIdx = null;
  try{ oldIdx = JSON.parse(localStorage.getItem(KEY_INDEX)); }catch(e){}
  const oldSt = (oldIdx && oldIdx.st && typeof oldIdx.st === 'object') ? oldIdx.st : {};
  const oldIds = (oldIdx && Array.isArray(oldIdx.ids)) ? oldIdx.ids : [];
  const st = {};
  for(const p of lib.items){
    const isNew = !oldIds.includes(p.id);
    if(p.id === lib.curId || isNew){
      st[p.id] = writeOneProjectRecord(p);
    }else{
      st[p.id] = oldSt[p.id] || 'ls';
    }
  }
  for(const oldId of oldIds){
    if(!ids.has(oldId)) removeOneProjectRecord(oldId, oldSt[oldId]);
  }
  const idx = { curId: lib.curId, ids: lib.items.map(i=> i.id), st };
  try{ localStorage.setItem(KEY_INDEX, JSON.stringify(idx)); }catch(e){}
}

function saveLib(){
  idbSaveLib();   // 同步写 localStorage（降级项目异步写 IDB）
}

function robustSaveLib(){
  while(lib.items.length > MAX_PROJECTS){
    const others = lib.items.filter(i=> i.id !== lib.curId);
    if(!others.length) break;
    others.sort((a,b)=> (a.updatedAt||0) - (b.updatedAt||0));
    lib.items = lib.items.filter(i=> i.id !== others[0].id);
  }
  idbSaveLib();
}

async function loadState(){
  clearState();
  let idx = null;
  try{ idx = JSON.parse(localStorage.getItem(KEY_INDEX)); }catch(e){}
  const ids = (idx && Array.isArray(idx.ids)) ? idx.ids : [];
  const stMap = (idx && idx.st && typeof idx.st === 'object') ? idx.st : {};
  const curId = (idx && idx.curId) || null;
  const items = [];
  for(const id of ids){
    try{
      let p = null;
      if(stMap[id] === 'idb'){
        if(idbAvailable()) p = await idbGet(id);   // 降级项目从 IDB 单条读
      }else{
        const raw = localStorage.getItem(lsKeyFor(id));
        if(raw){ try{ p = JSON.parse(raw); }catch(e){ p = null; } }
      }
      if(p && typeof p === 'object' && p.id) items.push(p);
    }catch(e){ /* 单条损坏/缺失则跳过，不影响其余项目 */ }
  }
  if(items.length){
    lib = { curId: curId, items: items };
    if(!lib.items.some(i=> i.id === lib.curId)) lib.curId = lib.items[0].id;
    const cur = lib.items.find(i=> i.id === lib.curId);
    if(cur) applyProject(cur);
    return;
  }
  if(await migrateLegacyLibrary()) return;
  migrateOldState();
}

async function migrateLegacyLibrary(){
  let legacy = [];
  try{
    const raw = localStorage.getItem(nsKey('lib'));
    if(raw){
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.items)) ? parsed.items : null;
      const curId = (!Array.isArray(parsed) && parsed && parsed.curId) ? parsed.curId : null;
      if(Array.isArray(arr)) legacy = legacy.concat(arr.filter(x=> x && typeof x === 'object' && x.id));
      if(curId && !legacy.some(x=> x.id === curId)){ /* 找不到 curId 归属，忽略 */ }
    }
  }catch(e){}
  try{
    if(idbAvailable() && typeof idbListLegacy === 'function'){
      const list = await idbListLegacy();
      if(Array.isArray(list)) legacy = legacy.concat(list.filter(x=> x && typeof x === 'object' && x.id));
    }
  }catch(e){}
  if(!legacy.length) return false;
  const byId = {};
  legacy.forEach(x=>{ if(x && x.id) byId[x.id] = x; });
  const merged = Object.keys(byId).map(id=>{
    const p = byId[id];
    const snap = normalizeLegacyProject(p);
    return { ...snap, id: id, updatedAt: p.updatedAt || Date.now() };
  });
  if(!merged.length) return false;
  const prevCur = lib && lib.curId;
  lib = { curId: prevCur || merged[0].id, items: merged };
  idbSaveLib();   // 写新索引 + 逐项目（localStorage 单条，超限自动降级）
  const cur = lib.items.find(i=> i.id === lib.curId) || lib.items[0];
  if(cur){ lib.curId = cur.id; applyProject(cur); }
  try{ localStorage.removeItem(nsKey('lib')); }catch(e){}   // 一次性：本站迁移完成即清空本 ns 副本（共享裸 fyp_lib 保留，供其它站各自迁移）
  return true;
}

function normalizeLegacyProject(p){
  const s = p && typeof p === 'object' ? p : {};
  const out = {};
  out.mode = (s.mode === 'longnovel' || s.mode === 'long') ? 'longnovel' : (s.mode || 'shortfilm');
  out.mode = (out.mode === 'long') ? 'longnovel' : out.mode;
  out.mode = (out.mode === 'short' || out.mode === 'shortfilm') ? 'shortfilm' : out.mode;
  out.idea = s.idea != null ? s.idea : '';
  out.outline = s.outline || null;
  out.outlineConfirmed = !!s.outlineConfirmed;
  out.chapters = Array.isArray(s.chapters) ? s.chapters : [];
  out.characters = Array.isArray(s.characters) ? s.characters : [];
  out.scenes = Array.isArray(s.scenes) ? s.scenes : [];
  out.storyboard = Array.isArray(s.storyboard) ? s.storyboard : [];
  out.qcRecord = undefined;   // 无残留
  if(out.outline) delete out.outline.titleQC;
  out.longMemory = (s.longMemory && typeof s.longMemory === 'object') ? s.longMemory : { uiOpen:false, foreshadow:[], lastAuditAt:0 };
  out.chapterStyle = (s.chapterStyle && typeof s.chapterStyle === 'object')
    ? { tags: Array.isArray(s.chapterStyle.tags)?s.chapterStyle.tags:[], collapsed:!!s.chapterStyle.collapsed }
    : { tags:[], collapsed:false };
  out.glossAdherence = (typeof s.glossAdherence === 'number') ? s.glossAdherence : 60;
  out.langLayer = (s.langLayer === undefined) ? true : !!s.langLayer;
  out._narrIron = (s._narrIron === undefined) ? true : !!s._narrIron;
  out.banList = (s.banList && typeof s.banList === 'object') ? normalizeBanList(s.banList) : null;
  out.ctAdviceHist = Array.isArray(s.ctAdviceHist) ? s.ctAdviceHist : [];
  out.contentAdviceHist = Array.isArray(s.contentAdviceHist) ? s.contentAdviceHist : [];
  out.hist = (s.hist && typeof s.hist === 'object') ? s.hist : { characters:[], scenes:[], cover:[], storyboard:[] };
  out.title = s.title || (s.outline && s.outline.title) || '';
  out.logline = s.logline || (s.outline && s.outline.logline) || '';
  out.step = (s.step && s.step >= 1) ? s.step : (out.outlineConfirmed ? 4 : (out.outline ? 2 : 1));
  return out;
}

function migrateOldState(){
  try{
    const s = JSON.parse(localStorage.getItem(KEY_STATE));
    if(!s || typeof s !== 'object') return;
    Object.assign(state, s);
    state.raw = s.raw || {};
    currentStep = (s.step && s.step >= 1 && s.step <= 5) ? s.step : 1;
    const snap = projectSnapshot();
    lib = { curId: snap.id = makeId(), items: [{ ...snap, updatedAt: Date.now() }] };
    saveLib();
    localStorage.removeItem(KEY_STATE);
  }catch(e){}
}

function persist(){
  if(!lib.items.some(i=> i.id === lib.curId)){
    const snap = projectSnapshot();
    const newId = makeId();
    lib.items.unshift({ ...snap, id: newId, updatedAt: Date.now() });
    lib.curId = newId;
  }
  const idx = lib.items.findIndex(i=> i.id === lib.curId);
  if(idx >= 0){
    const snap = projectSnapshot();
    lib.items[idx] = { ...snap, id: lib.curId, updatedAt: Date.now() };
  }
  robustSaveLib();
}

  const api = {
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
    persist
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['project-state'] = Object.freeze(api);
  return ns['project-state'];
}

return Object.freeze({install});
})();

// ---- merged source: project-history.js ----
const _m1 = (() => {
// Extracted from app-legacy.js; legacy UI/runtime bridge.
const W = globalThis;
const state = new Proxy({}, {
  get(_, p) { return (W.TellMeRuntime?.state ?? W.state ?? {})[p]; },
  set(_, p, v) { if (!W.state) W.state = {}; (W.TellMeRuntime?.state ?? W.state)[p] = v; return true; }
});
const lib = new Proxy({}, {
  get(_, p) { return (W.TellMeRuntime?.lib ?? W.lib ?? (W.TellMeLegacyShared && W.TellMeLegacyShared.lib) ?? { curId: null, items: [] })[p]; },
  set(_, p, v) {
    const target = W.TellMeRuntime?.lib ?? W.lib ?? (W.TellMeLegacyShared && W.TellMeLegacyShared.lib);
    if (target) target[p] = v;
    return true;
  }
});

function getFn(name, fallback) {
  return (...args) => {
    if (typeof W[name] === 'function') return W[name](...args);
    if (W.TellMeHistoryPanel && typeof W.TellMeHistoryPanel[name] === 'function') {
      return W.TellMeHistoryPanel[name](...args);
    }
    if (W.TellMeLegacyShared && typeof W.TellMeLegacyShared[name] === 'function') {
      return W.TellMeLegacyShared[name](...args);
    }
    if (W.TellMeLegacyDomains) {
      for (const d of Object.values(W.TellMeLegacyDomains)) {
        if (d && typeof d[name] === 'function') return d[name](...args);
      }
    }
    if (W.TellMeLegacyRegions) {
      for (const r of Object.values(W.TellMeLegacyRegions)) {
        if (r && typeof r[name] === 'function') return r[name](...args);
      }
    }
    if (typeof fallback === 'function') return fallback(...args);
    console.warn(`[project-state] function not found: ${name}`);
  };
}

const $ = (s, r) => (W.$ ? W.$(s, r) : (r || document).querySelector(s));
const $$ = (s, r) => (W.$$ ? W.$$(s, r) : [...((r || document).querySelectorAll(s) || [])]);
const toast = getFn('toast', (msg) => console.log(msg));
const persist = getFn('persist');
const applyProject = getFn('applyProject');
const saveLib = getFn('saveLib');
const clearState = getFn('clearState');
const projectSnapshot = getFn('projectSnapshot');
const makeId = getFn('makeId', () => Math.random().toString(36).slice(2, 9));
const render = getFn('render');
const renderHistList = getFn('renderHistList');
const importProjectFile = (...args) => (typeof _m2 !== 'undefined' && _m2.importProjectFile ? _m2.importProjectFile(...args) : getFn('importProjectFile')(...args));
const closeHistPanel = getFn('closeHistPanel', () => {
  const p = $('#histPanel');
  if (p) p.classList.add('hidden');
});
const openHistPanel = getFn('openHistPanel', () => {
  try { renderHistList(); } catch(e){}
  const p = $('#histPanel');
  if (p) p.classList.remove('hidden');
});
const MAX_PROJECTS = W.TellMeRuntime?.MAX_PROJECTS ?? 500;
function switchProject(id){
  if(id === lib.curId){ closeHistPanel(); return; }
  persist(); // 先保存当前项目
  lib.curId = id;
  const cur = lib.items.find(i=> i.id === id);
  applyProject(cur || {}); // 内容缺失 → 空白，id 仍保持有效
  saveLib(); // 提交 curId 切换
  closeHistPanel();
  render();
  window.scrollTo(0,0);
  toast(`已切换到「${cur ? (cur.title||'未命名作品') : '空白项目'}」`);
}

function newProject(mode){
  if(lib.items.length >= MAX_PROJECTS){
    const oldest = [...lib.items].sort((a,b)=> (a.updatedAt||0) - (b.updatedAt||0))[0];
    if(oldest && !confirm(`历史已达 ${MAX_PROJECTS} 个上限，是否删除最旧的「${oldest.title||'未命名作品'}」以新建？`)){
      return false;
    }
    if(oldest) lib.items = lib.items.filter(i=> i.id !== oldest.id);
  }
  clearState();
  if(mode) state.mode = mode; // 'longnovel' 经典长篇小说
  const snap = projectSnapshot();
  const newId = makeId();
  lib.items.unshift({ ...snap, id: newId, updatedAt: Date.now() });
  lib.curId = newId;
  saveLib();
  closeHistPanel();
  render();
  window.scrollTo(0,0);
  toast(mode==='longnovel' ? '已新建经典长篇小说' : '已新建空白小说');
  return true;
}

function newLongProject(){
  return newProject('longnovel');
}

function deleteProject(id){
  const it = lib.items.find(i=> i.id === id);
  if(!it) return;
  const cfm = typeof confirm === 'function' ? confirm : (W.confirm || (() => true));
  if(!cfm(`确定删除「${it.title||'未命名作品'}」？此操作不可恢复。`)) return;
  const wasCur = id === lib.curId;
  lib.items = lib.items.filter(i=> i.id !== id);
  if(wasCur){
    if(lib.items.length){
      const next = [...lib.items].sort((a,b)=> (b.updatedAt||0) - (a.updatedAt||0))[0];
      lib.curId = next.id;
      applyProject(next);
      toast('已删除，已切换到最近作品');
    }else{
      clearState();
      lib.curId = null;
      toast('已删除全部作品');
    }
    closeHistPanel(); render(); window.scrollTo(0,0);
  }
  saveLib();
  renderHistList();
}

function rebindHistPanel(){
  const btn = $('#btnHist');
  if(btn) btn.onclick = (e)=>{
    e.stopPropagation();
    const p = $('#histPanel');
    if(p.classList.contains('hidden')) openHistPanel(); else closeHistPanel();
  };
  const nb = $('#btnNewProject');
  if(nb) nb.onclick = (e)=>{ e.stopPropagation(); newProject(); };
  const nlo = $('#histNewLong');
  if(nlo) nlo.onclick = (e)=>{ e.stopPropagation(); newLongProject(); };
  const imp = $('#btnImportFyp');
  if(imp) imp.onclick = (e)=>{ e.stopPropagation(); const fi = $('#fypImportInput'); if(fi) fi.click(); };
  const fi = $('#fypImportInput');
  if(fi) fi.onchange = (e)=>{ const f = e.target.files && e.target.files[0]; if(f) importProjectFile(f); e.target.value = ''; };
}


return Object.freeze({switchProject, newProject, newLongProject, deleteProject, rebindHistPanel});
})();

// ---- merged source: project-fyp.js ----
const _m2 = (() => {
// Extracted from app-legacy.js; legacy UI/runtime bridge.
const W = globalThis;
const state = new Proxy({}, {
  get(_, p) { return (W.TellMeRuntime?.state ?? W.state ?? {})[p]; },
  set(_, p, v) { if (!W.state) W.state = {}; (W.TellMeRuntime?.state ?? W.state)[p] = v; return true; }
});
const lib = new Proxy({}, {
  get(_, p) { return (W.TellMeRuntime?.lib ?? W.lib ?? (W.TellMeLegacyShared && W.TellMeLegacyShared.lib) ?? { curId: null, items: [] })[p]; },
  set(_, p, v) {
    const target = W.TellMeRuntime?.lib ?? W.lib ?? (W.TellMeLegacyShared && W.TellMeLegacyShared.lib);
    if (target) target[p] = v;
    return true;
  }
});

function getFn2(name, fallback) {
  return (...args) => {
    if (typeof W[name] === 'function') return W[name](...args);
    if (W.TellMeHistoryPanel && typeof W.TellMeHistoryPanel[name] === 'function') {
      return W.TellMeHistoryPanel[name](...args);
    }
    if (W.TellMeLegacyShared && typeof W.TellMeLegacyShared[name] === 'function') {
      return W.TellMeLegacyShared[name](...args);
    }
    if (W.TellMeLegacyDomains) {
      for (const d of Object.values(W.TellMeLegacyDomains)) {
        if (d && typeof d[name] === 'function') return d[name](...args);
      }
    }
    if (W.TellMeLegacyRegions) {
      for (const r of Object.values(W.TellMeLegacyRegions)) {
        if (r && typeof r[name] === 'function') return r[name](...args);
      }
    }
    if (typeof fallback === 'function') return fallback(...args);
    console.warn(`[project-fyp] function not found: ${name}`);
  };
}

const toast = getFn2('toast', (msg) => console.log(msg));
const downloadBlob = getFn2('downloadBlob');
const makeId = getFn2('makeId', () => Math.random().toString(36).slice(2, 9));
const saveLib = getFn2('saveLib');
const applyProject = getFn2('applyProject');
const closeHistPanel = getFn2('closeHistPanel', () => {
  const p = (W.$ ? W.$('#histPanel') : document.getElementById('histPanel'));
  if (p) p.classList.add('hidden');
});
const render = getFn2('render');
const MAX_PROJECTS = W.TellMeRuntime?.MAX_PROJECTS ?? 500;
const APP_VERSION = W.TellMeRuntime?.APP_VERSION ?? '';
function buildFyp(project){
  return {
    format: 'fyp-project',
    version: 1,
    kind: 'complete',
    exportedAt: new Date().toISOString(),
    app: 'storyfactory',
    appVersion: APP_VERSION,   // 导出时的应用版本号，供对方工具识别本项目由哪一版生成
    book: project   // 完整项目快照（与 lib.items[i] 同结构）
  };
}

function parseFyp(text){
  const obj = JSON.parse(text);
  if(!obj || typeof obj !== 'object') throw new Error('文件不是合法 JSON');
  if(obj.format !== 'fyp-project') throw new Error('不是 .fyp 项目文件（format 字段不匹配）');
  if(!obj.book || typeof obj.book !== 'object') throw new Error('.fyp 缺少 book 字段');
  return obj.book;
}

function exportProjectFile(id){
  const p = lib.items.find(i=> i.id === id);
  if(!p){ toast('未找到该作品'); return; }
  const fyp = buildFyp(p);
  const title = String(p.title || 'story').replace(/[\\/:*?"<>|\r\n]+/g, '_').slice(0, 40);
  const blob = new Blob([JSON.stringify(fyp, null, 2)], { type:'application/octet-stream' });
  downloadBlob(`${title}.fyp`, blob);
  toast('已导出 .fyp 项目文件');
}

function importProjectFile(file){
  if(!file) return;
  const big = file.size > 5 * 1024 * 1024;
  toast(big ? '文件较大，解析中…' : '正在导入项目…');
  const r = new FileReader();
  r.onload = function(){
    try{
      const book = parseFyp(String(r.result));
      const newId = makeId();
      const item = Object.assign({}, book, { id: newId, updatedAt: Date.now() });
      if(!item.title) item.title = (item.outline && item.outline.title) || '导入的作品';
      lib.items.unshift(item);
      if(lib.items.length > MAX_PROJECTS){
        const others = lib.items.filter(i=> i.id !== lib.curId && i.id !== newId);
        others.sort((a,b)=> (a.updatedAt||0) - (b.updatedAt||0));
        const victim = others[0];
        if(victim){ lib.items = lib.items.filter(i=> i.id !== victim.id); }
      }
      lib.curId = newId;
      applyProject(item);
      saveLib(); // 经 IDB 落盘（fire-and-forget）
      closeHistPanel();
      render();
      window.scrollTo(0,0);
      toast(`已导入「${item.title}」并打开`);
    }catch(err){
      toast('导入失败：' + (err && err.message ? err.message : '文件格式错误'));
    }
  };
  r.onerror = function(){ toast('读取文件失败'); };
  r.readAsText(file);
}


return Object.freeze({buildFyp, parseFyp, exportProjectFile, importProjectFile});
})();

export const project_stateModules = Object.freeze([_m1, _m2, _m0]);
