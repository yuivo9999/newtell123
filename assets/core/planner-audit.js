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

function glossaryForAI(){
  const g = (state.outline && state.outline.glossary) || {};
  const nrm = s => String(s||'').trim();
  const sortByName = arr => (arr||[]).slice().sort((a,b)=>String(a&&a.name||'').localeCompare(String(b&&b.name||''),'zh-Hans-CN'));
  const characters = sortByName(g.characters);
  const places     = sortByName(g.places);
  const propernouns= sortByName(g.propernouns);
  const repeatIn = arr => {
    const m = {};
    arr.forEach(it=>{ const n = nrm(it.name); if(n) m[n] = (m[n]||0)+1; });
    return Object.keys(m).filter(n=>m[n]>1).map(n=>({name:n, count:m[n]})).sort((a,b)=>b.count-a.count);
  };
  const tag = {characters:'人物', places:'地点', propernouns:'专名'};
  const seen = {};
  [[characters,'characters'],[places,'places'],[propernouns,'propernouns']].forEach(([arr,cat])=>{
    arr.forEach(it=>{ const n = nrm(it.name); if(n) (seen[n]=seen[n]||[]).push(cat); });
  });
  const cross = Object.keys(seen).filter(n=>seen[n].length>1).map(n=>({name:n, cats:seen[n].map(c=>tag[c])}));
  return { characters, places, propernouns, repeatIn, cross, empty: sourceHasGlossary(g) ? '' : '（无）' };
}

function glossaryDupNoteHtml(){
  const rf = glossaryForAI();
  const repLabels = {characters:'人物', places:'地点', propernouns:'专名'};
  const lines = [];
  [['characters',rf.characters],['places',rf.places],['propernouns',rf.propernouns]].forEach(([cat,arr])=>{
    const dup = rf.repeatIn(arr);
    if(dup.length) lines.push(`${repLabels[cat]}：「${dup.map(d=>`${d.name}×${d.count}`).join('」、')}」`);
  });
  if(rf.cross.length) lines.push('跨类同名：'+rf.cross.map(x=>`${x.name}（${x.cats.join('+')}）`).join('、'));
  if(!lines.length) return '';
  return `<div class="gs-panel gs-dup-note"><div class="gs-panel-title">⚠️ 重复情况检查（仅提示，未做任何删除/合并；原词典原样保留）</div>
    <pre class="gs-pre">${esc(lines.join('\n'))}</pre></div>`;
}

function chapterGlossaryBlock(curN, opts){
  const o = state.outline;
  if(!o) return '';
  opts = opts || {};
  const lean = !!opts.lean;
  if(opts.names){
    const g = (o && o.glossary) || {};
    if(!sourceHasGlossary(g)) return '';
    const rf = glossaryForAI();
    const cs = rf.characters.map(c=>String(c.name||'').trim()).filter(Boolean).join('、');
    const ws = (g.walkons||[]).map(w=>String(w.name||'').trim()).filter(Boolean).join('、');
    const ps = rf.places.map(p=>String(p.name||'').trim()).filter(Boolean).join('、');
    const pn = rf.propernouns.map(p=>String(p.name||'').trim()).filter(Boolean).join('、');
    return `【设定词典（名称清单，标题不得引入清单外的新人名/地名/专名）】\n人物：${cs||'（无）'}\n路人龙套：${ws||'（无）'}\n地点：${ps||'（无）'}\n专名：${pn||'（无）'}`;
  }
  let body = `\n\n【全局创作上下文（严格服从：有台词/有戏份、或贯穿反复出现的重要人地专名不得自造、须取用词典保持全书一致；仅作氛围的临时路人/小地名/小专名允许现场点缀一次、不入词典）】`;
  const g = (o && o.glossary) || {};
  if(sourceHasGlossary(g)){
    const rf = glossaryForAI();
    const cDetail = lean
      ? c => [c.identity?`身份:${c.identity}`:'', c.relation?`关系:${c.relation}`:''].filter(Boolean).join('；')
      : c => [c.identity?`身份:${c.identity}`:'', c.age?`岁数:${c.age}`:'', c.gender?`性别:${c.gender}`:'', c.appearance?`外貌:${c.appearance}`:'', c.hobby?`爱好:${c.hobby}`:'', (c.catchphrase&&c.catchphrase!=='无')?`口头禅:${c.catchphrase}`:'', c.relation?`关系:${c.relation}`:'', c.trait?`性格:${c.trait}`:''].filter(Boolean).join('；');
    const pDetail = p => [p.type?`类型:${p.type}`:'', p.note?`说明:${p.note}`:''].filter(Boolean).join('；');
    const cs = rf.characters.map(c=> `${c.name}${cDetail(c)?`（${cDetail(c)}）`:''}`).join('、');
    const ps = rf.places.map(p=> `${p.name}${pDetail(p)?`（${pDetail(p)}）`:''}`).join('、');
    const pn = rf.propernouns.map(p=> `${p.name}${p.note?`（${p.note}）`:''}`).join('、');
    const repLabels = {characters:'人物', places:'地点', propernouns:'专名'};
    const repeatNotes = [];
    [['characters',rf.characters],['places',rf.places],['propernouns',rf.propernouns]].forEach(([cat,arr])=>{
      const dup = rf.repeatIn(arr);
      if(dup.length) repeatNotes.push(`${repLabels[cat]}：${dup.map(d=>`「${d.name}」×${d.count}`).join('、')}`);
    });
    const repeatNote = repeatNotes.length ? `\n【词典同名提示（非删除，仅供知悉）】以下名称在同一类别中出现多次，均按原样保留：${repeatNotes.join('；')}` : '';
    const crossNote = rf.cross.length ? `\n【跨类同名提示】以下名称在多类中出现（系同一实体分属多类，原样保留，不要当成两条新增，也不要据此另造新名）：${rf.cross.map(x=>`${x.name}（${x.cats.join('+')}）`).join('、')}` : '';
    body += `\n·【设定词典】（给定的人/地/专名，正文一律采用：凡有台词/有戏份、或贯穿反复出现的人地专名务必取用本词典并保持全书一致，禁止另起炉灶自造核心名；仅作氛围的临时路人/小地名/小专名不在此限——可现场点缀一次、不入词典。人物关系/性格、地点类型、专名含义按此统一）\n人物：${cs||'（无）'}\n地点：${ps||'（无）'}\n专名：${pn||'（无）'}${repeatNote}${crossNote}`;
    const wk = (g.walkons||[]).filter(w=>String(w&&w.name||'').trim()).map(w=>`${String(w.name).trim()}${String(w&&w.note||'').trim()?`（${String(w.note).trim()}）`:''}`).join('、');
    if(wk) body += `\n·【路人龙套】（词典充实新增的闲人：只说一句台词、只露一个镜头即可，无需塑造九维；写到相关场景（街市/酒肆/夜巡/围观/办事）时就近选用登场，让群像鲜活，避免整章主角独角戏。此清单之外，允许正文为个别氛围当场自拟"临时闲人"——规则见正文【临时闲人】段）\n${wk}`;
    const relTable = validAssoc(g._relationshipTable,'a','b').map(x=>`${x.a} ←${x.relation||'？'}→ ${x.b}${x.note?`（${x.note}）`:''}`).filter(Boolean).join('；');
    const pcTable  = validAssoc(g._placeContacts,'from','to').map(x=>`${x.from} ↔ ${x.to}${x.relation?`（${x.relation}）`:''}${x.note?`：${x.note}`:''}`).filter(Boolean).join('；');
    const prcTable = validAssoc(g._properContacts,'from','to').map(x=>`${x.from} ↔ ${x.to}${x.relation?`（${x.relation}）`:''}${x.note?`：${x.note}`:''}`).filter(Boolean).join('；');
    if(relTable) body += `\n·【重要人物关系】（正文人物关系/立场须与此一致）\n${relTable}`;
    if(pcTable)  body += `\n·【地名关联表】（地域往来/通行逻辑须与此一致，只列地名与地名之间的关联）\n${pcTable}`;
    if(prcTable) body += `\n·【专名关联表】（专名与专名、专名用法须与此一致，只列专名与专名之间的关联）\n${prcTable}`;
    const wrTable = (g._worldRules||[]).map(fmtWR).filter(Boolean).join('；');
    if(wrTable) body += `\n·【世界观规则】（本书世界实际如何运转的具体规则，正文据此写作、不得违背该世界逻辑：劳动作息/社会制度/力量体系/金钱物价/地理交通/秩序法则等）\n${wrTable}`;
  }
  body += subplotProgressBlock(curN);
  return body;
}

function subplotProgressBlock(curN){
  const o = state.outline; if(!o) return '';
  const g = (o.glossary) || {};
  const subs = (Array.isArray(g.subplots) ? g.subplots : []).filter(Boolean);
  if(!subs.length) return '';
  const full = (o.chapters||[]).length || 1;
  const cur = (Number.isFinite(curN) && curN>0) ? curN : (o.chapters||[]).length;   // 当前章：正文生成传 i+1；规划/标题无当前章则用全书章数
  const lines = subs.map(s=>{
    const nm = String(s.name||'').trim() || '（未命名副线）';
    const st = ['进行中','搁置','已收束'].includes(s.status) ? s.status : '进行中';
    const q = String(s.question||'').trim();
    const arc = (s.arc && (s.arc.from || s.arc.to))
      ? `${s.arc.from||'？'}→${s.arc.to||'——'}`
      : '';
    const pivot = String(s.pivot||'').trim();
    const lastCh = Number.isFinite(s._lastCh) ? s._lastCh : (s.log&&s.log.length ? Math.max(...s.log.map(x=>x.ch||0)) : 0);
    const ts = (Array.isArray(s.log)?s.log:[]).map(x=>`第${x.ch}章${x.note?`（${x.note.trim()}）`:''}`).join(' → ');
    let head = `· ${nm}（${st}）`;
    if(q) head += `｜问：${q}`;
    if(arc) head += `｜态：${arc}`;
    let block = `${head}\n  ${ts||'（尚无进度记录）'}`;
    const gap = lastCh ? (cur - lastCh) : -1;
    if(lastCh>0 && gap > full * state.subRecallRatio){
      block += `\n  ⚠ 本条已消失超全书 ${Math.round(state.subRecallRatio*100)}%（约 ${gap} 章未出现），读者可能淡忘：本章若回归，必须先用 ≤20 字一句话轻提前情，再续写。`;
    }
    if(pivot) block += `\n  蝴蝶效应：${pivot}`;
    return block;
  }).join('\n');
  return `\n\n【副线进度（截至第 ${cur} 章）】\n${lines}\n【副线创作契约】
· 是否推进某条副线由你判断：适合则自然写一笔；强行加入会生硬/喧宾夺主则本章不推进，正文照常。
· 回归一条消失过久的副线，开篇以 ≤20 字轻提前情，避免读者认知断裂。
· 闭环是硬性要求：副线可开放式结局（如没抓到凶手），但必须回应其【核心问题】；理想收束是完成状态 A→B 并给主线留出蝴蝶效应（见各条 pivot）。
· 未推进的副线不勉强提及；不得推翻既有进度；「已收束」的副线本章不复活（除非本章有重大理由并显式改回「进行中」）。`;
}

function bindPlannerTitles(newTitles){
  const o = state.outline; if(!o) return false;
  const n = (o.chapters||[]).length;
  if(!Array.isArray(newTitles) || newTitles.length !== n) return false;
  if(syncChaptersFromOutline()) persist();
  snapshotTitleBatch('规划师定稿前');
  const applied = setAllTitles(newTitles);
  if(applied > 0){
    state.plannerFinalized = true;
    persist();
  }
  return applied > 0;
}



async function autoUpdateSubplots(){
  if(!isLong() || !state.subAutoFill) return;
  startBgTask();
  try{
    const o = state.outline; if(!o) return;
    if(!o.glossary) o.glossary = {characters:[], places:[], propernouns:[]};
    if(!Array.isArray(o.glossary.subplots)) o.glossary.subplots = [];
    const absorbed = Array.isArray(o.glossary._subAbsorbed) ? o.glossary._subAbsorbed : [];
    const todo = state.chapters.map((c,i)=> (c && c.content && String(c.content).trim()) ? i : -1)
      .filter(i=> i>=0 && !absorbed.includes(i)).sort((a,b)=>a-b);
    if(!todo.length) return;
    let noQ = 0, total = 0;
    try{
      for(const i of todo){
        const c = state.chapters[i];
        const ext = await extractSubplotUpdates(i, c.content);
        const n = mergeSubplotUpdates(ext, i+1);
        noQ += n.noQuestionCount; total += n.total;
        absorbed.push(i);
      }
      o.glossary._subAbsorbed = absorbed;
      if(total>0 || noQ>0) persist();
      if(noQ>0) toast(`副线追踪：${total} 条推进；${noQ} 条因缺核心问题未入库`);
      else if(total>0) toast(`副线追踪：${total} 条副线进度已更新`);
    }catch(e){ /* 静默失败，不阻塞章节生成 */ }
  }finally{ endBgTask(); }
}

async function manualExtractGlossary(){
  const written = state.chapters.filter(c=> c && c.content && String(c.content).trim()).map(c=>c.content);
  if(!written.length){ toast('尚无已生成章节正文'); return; }
  toast('正在提取新增词典条目…');
  try{
    const ext = await extractNewGlossary(written);
    const n = mergeExtractedGlossary(ext, '手动提取');
    if(n.total > 0){ persist(); render(); toast(`词典已补全：+${n.c} 人物（含完整设定）、+${n.p} 地名、+${n.k} 专名`); }
    else toast('未发现词典未收录的新实体');
  }catch(e){ toast('提取失败：'+e.message); }
}

function openCleanPanel(){
  const closePanel = ()=>{ const p=$('#cleanPanel'); if(p) p.remove(); };
  const s = scanUnusedGlossary();
  const written = state.chapters.filter(c=>c && c.content && String(c.content).trim()).length;
  const row = (arr, icon) => arr.length ? arr.map(x=>`
    <label class="gs-hit"><input type="checkbox" class="gs-clean-cb" data-name="${esc(x.name)}" ${x._auto?'checked':''} />
      <span>${esc(x.name)}</span>${x._auto?'<i class="gs-auto-tag">🆕 自动补全</i>':'<i class="gs-orig-tag">原始条目</i>'}</label>`).join('') : '';
  const empty = !s.characters.length && !s.places.length && !s.propernouns.length;
  const ov = document.createElement('div');
  ov.id='cleanPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🧹 清理未使用条目</b><button class="gs-x" data-clean-close>✕</button></div>
      <div class="gs-modal-sub">已生成 ${written} 章。以下条目在全部已生成正文中均未出现，可能因重生成覆盖而失效；尚未写的章节可能仍会用到，请谨慎勾选。</div>
      <div class="gs-body">
        ${empty ? '<p class="muted">✓ 没有需要清理的条目（全部词典条目都已在正文中出现）。</p>' : `
          ${s.characters.length?`<div class="gs-q">👤 人物</div>${row(s.characters,'👤')}`:''}
          ${s.places.length?`<div class="gs-q">🏞️ 地名</div>${row(s.places,'🏞️')}`:''}
          ${s.propernouns.length?`<div class="gs-q">📌 专名</div>${row(s.propernouns,'📌')}`:''}
        `}
      </div>
      ${empty
        ? `<div class="gs-modal-head" style="justify-content:flex-end;border:none"><button class="btn ghost" data-clean-close>关闭</button></div>`
        : `<div class="gs-modal-head" style="justify-content:flex-end;border:none"><button class="btn ghost" data-clean-close>取消</button><button class="btn primary" data-clean-do>确认删除勾选项</button></div>`}
    </div>`;
  document.body.appendChild(ov);
  $$('[data-clean-close]').forEach(b=> b.onclick = closePanel);
  const doBtn = $('[data-clean-do]');
  if(doBtn) doBtn.onclick = ()=>{
    const picked = $$('.gs-clean-cb:checked').map(cb=> cb.dataset.name);
    if(!picked.length){ toast('未勾选任何条目'); return; }
    const g = state.outline && state.outline.glossary; if(!g){ closePanel(); return; }
    let c=0,p=0,k=0;
    g.characters = (g.characters||[]).filter(x=>{ if(picked.includes(String(x&&x.name||'').trim())){ c++; return false; } return true; });
    g.places     = (g.places||[]).filter(x=>{ if(picked.includes(String(x&&x.name||'').trim())){ p++; return false; } return true; });
    g.propernouns= (g.propernouns||[]).filter(x=>{ if(picked.includes(String(x&&x.name||'').trim())){ k++; return false; } return true; });
    persist(); closePanel(); render();
    toast(`已清理：-${c} 人物、-${p} 地名、-${k} 专名`);
  };
}

function openCoveragePanel(){
  closeCoveragePanel();
  const s = checkGlossaryCoverage();
  const row = (arr, icon)=> arr.length ? arr.map(x=>`<div class="cv-row ${x.count===0?'cv-zero':''}"><span class="cv-icon">${icon}</span><b>${esc(x.name)}</b><span class="cv-cnt">${x.count===0?'未用到':x.count+' 次'}</span></div>`).join('') : '';
  const pct = s.total ? Math.round(s.hit/s.total*100) : 0;
  const ov = document.createElement('div');
  ov.id='cvPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📊 词典覆盖面自检</b><button class="gs-x" data-cv-close>✕</button></div>
      <div class="gs-body">
        <p class="muted" style="margin:0 0 8px">对已在正文中出现过的章节做统计；0 次的条目可能未被使用，可考虑精简。共 ${s.total} 条 · 已覆盖 ${s.hit} 条（${pct}%）</p>
        ${s.chars.used.length||s.chars.unused.length?`<div class="cv-sec">👤 人物</div>${row(s.chars.used.concat(s.chars.unused),'👤')}`:''}
        ${s.places.used.length||s.places.unused.length?`<div class="cv-sec">📍 地点</div>${row(s.places.used.concat(s.places.unused),'📍')}`:''}
        ${s.props.used.length||s.props.unused.length?`<div class="cv-sec">🔤 专名</div>${row(s.props.used.concat(s.props.unused),'🔤')}`:''}
      </div>
      <div class="gs-actions"><button class="btn" data-cv-close>关闭</button></div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-cv-close]').forEach(b=> b.onclick = ()=>{ closeCoveragePanel(); });
  ov.addEventListener('click', e=>{ if(e.target===ov) closeCoveragePanel(); });
}

function closeCoveragePanel(){ const p=$('#cvPanel'); if(p) p.remove(); }

async function extractChapterEndTime(chIdx, content){
  const o = state.outline;
  const body = String(content||'').trim();
  if(!body) return { time: '' };
  const user = `【本章正文（第 ${chIdx+1} 章）】
${String(body).slice(-30000)}`;
  const txt = unwrapAIResult(await callDeepSeek(TIME_ANCHOR_SYS, user, {maxTokens: clampMaxTokens('json'), temperature: 0.2, topP: 0.5, taskKey:'timeAnchor'}));
  const j = parseJson(txt) || {};
  const t = String((j && j.time)||'').trim();
  return { time: t };
}

async function autoUpdateTimeAnchors(){
  if(!_timeAnchorsAutoOn()) return;
  startBgTask();
  try{
    const o=state.outline; if(!o||!o._factCard) return;
    const fc=o._factCard; fc.timeAnchors=fc.timeAnchors||[]; fc.timeAudit=fc.timeAudit||{};
    const todo=state.chapters.map((c,i)=>(c&&c.content&&String(c.content).trim())?i:-1).filter(i=>i>=0&&!fc.timeAnchors.some(t=>t.ch===i&&t.src==='ai')).sort((a,b)=>a-b);
    let updated=0;
    for(const i of todo){
      const ext=await extractChapterEndTime(i,state.chapters[i].content);
      if(ext.time){ fc.timeAnchors=fc.timeAnchors.filter(x=>x.ch!==i); fc.timeAnchors.push({ch:i,time:ext.time,src:'ai',observed:true}); updated++; }
      fc.timeAudit[i]=auditTimePresentation(i,state.chapters[i].content);
    }
    if(updated||todo.length) persist();
    if(updated) toast(`时间审计：已记录 ${updated} 章正文收尾观测；规划时间线保持不变`);
  }catch(e){ /* 静默失败，不阻塞章节生成 */ }
  finally{ endBgTask(); }
}

function openSubplotBoard(){
  const old = $('#subBoard'); if(old) old.remove();
  const g = (state.outline && state.outline.glossary) || {};
  const subs = (Array.isArray(g.subplots)?g.subplots:[]).filter(Boolean);
  if(!subs.length){ toast('暂无副线'); return; }
  const full = (state.outline&&state.outline.chapters||[]).length || 1;
  const cur = Math.max(0, ...(state.chapters||[]).map((c,i)=> (c && c.content && String(c.content).trim()) ? i+1 : 0));
  const ratio = Number.isFinite(state.subRecallRatio) ? state.subRecallRatio : 0.4;
  const rows = subs.map((s,i)=>{
    const nm = String(s.name||'').trim() || '（未命名）';
    const st = SUB_STATUSES.includes(s.status) ? s.status : '进行中';
    const closed = st==='已收束';
    const q = String(s.question||'').trim();
    const lastCh = Number.isFinite(s._lastCh) ? s._lastCh : (s.log&&s.log.length?Math.max(...s.log.map(x=>x.ch||0)):0);
    const gap = lastCh ? (cur-lastCh) : -1;
    const lost = lastCh>0 && gap > full*ratio;
    const statusTxt = closed ? (q ? '✅ 已收束（核心问题已回答）' : '🔒 已收束（未记录核心问题）') : (lost ? '⚠️ 未收束 · 已消失过久' : '🟢 进行中');
    const rowCls = closed ? 'sb-closed' : (lost ? 'sb-lost' : '');
    return `<div class="sb-row ${rowCls}">
      <div class="sb-head"><b>${esc(nm)}</b><span class="sb-status">${statusTxt}</span></div>
      <div class="sb-meta">${q?`问：${esc(q)}`:''}${lost?` · 距最新已生成章（第 ${cur} 章）已缺席 ${gap} 章（超全书 ${Math.round(ratio*100)}%）`:''}</div>
      <div class="sb-meta muted">${closed ? '已闭合，无需回归' : (lost ? '建议在后续章节安排一次回归并轻提前情' : '尚未收束，可继续自然推进')}</div>
    </div>`;
  }).join('');
  const ov = document.createElement('div');
  ov.id='subBoard'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🧵 副线收束看板</b><button class="gs-x" data-sb-close>✕</button></div>
      <div class="gs-body">
        <p class="muted" style="margin:0 0 8px">闭环硬性要求：副线可开放式结局，但必须回应其核心问题。消失超全书 ${Math.round(ratio*100)}% 的副线读者容易淡忘，建议安排回归（回归时 ≤20 字轻提前情）。</p>
        ${rows}
      </div>
      <div class="gs-actions"><button class="btn" data-sb-close>关闭</button></div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-sb-close]').forEach(b=> b.onclick = ()=>{ const p=$('#subBoard'); if(p) p.remove(); });
  ov.addEventListener('click', e=>{ if(e.target===ov){ const p=$('#subBoard'); if(p) p.remove(); } });
}

function openTimelineBoard(){
  const old = $('#tlBoard'); if(old) old.remove();
  const o = state.outline || {};
  const gt = o._globalTimeline;
  let body = '';
  const tlText = gt && String(gt.text||'').trim();
  if(tlText){
    body = `<div class="so-logline">${renderLoglineHtml(tlText)}</div>`;
  } else if(gt && Array.isArray(gt.chapters) && gt.chapters.length){
    const rows = gt.chapters.map(c=>{
      const t = cleanChapterTitle((o.chapters[c.index]&&o.chapters[c.index].title)||'');
      const jt = String(c.jump||'').trim();
      return `第${c.index+1}章《${t||'?'}》：${String(c.from||'?').trim()} → ${String(c.to||'?').trim()}${jt?`（跳跃：${jt}）`:''}`;
    });
    const notes = gt.notes ? `\n【节奏】${gt.notes}` : '';
    body = `<div class="so-logline">${renderLoglineHtml(rows.join('\n')+notes)}</div>`;
  } else {
    toast('暂无全局时间线（请先在④规划师生成全书时间线）');
    return;
  }
  const ov = document.createElement('div'); ov.id='tlBoard'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal" style="max-width:780px">
      <div class="gs-modal-head"><b>⏱ 全书时间线</b><button class="gs-x" data-tb-close>✕</button></div>
      <div class="gs-body">
        <p class="muted" style="margin:0 0 8px">全书跨各章的现实时间轴：首章起始 → 末章章末（单调推进）；带大跨度/跨支线的章已括号注明。</p>
        ${body || '<span class="muted">暂无可显示的时间线</span>'}
      </div>
      <div class="gs-actions"><button class="btn" data-tb-close>关闭</button></div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-tb-close]').forEach(b=> b.onclick = ()=>{ const p=$('#tlBoard'); if(p) p.remove(); });
  ov.addEventListener('click', e=>{ if(e.target===ov){ const p=$('#tlBoard'); if(p) p.remove(); } });
}

function chapterLenBounds(){
  const wr = (state.wordRange && +state.wordRange.min > 0 && +state.wordRange.max > 0)
    ? state.wordRange : { min: 3000, max: 3600 };
  const lo = Math.min(+wr.min, +wr.max), hi = Math.max(+wr.min, +wr.max);
  return { lo, hi, floor: Math.max(200, Math.round(lo * 0.9)) };
}

function sizeChapterInjection(){
  const n = realChapterCount();
  const b = chapterLenBounds();
  const floor = (b && +b.floor > 0) ? b.floor : 2700;
  const hi = (b && +b.hi > 0) ? +b.hi : 3600;
  const cap = Math.max(hi, Math.round(hi * 1.15));
  const total = n ? `全书共 ${n} 章；` : '';
  return `${total}本章正文目标 ${b.lo.toLocaleString()}—${b.hi.toLocaleString()} 字，硬下限 ${floor.toLocaleString()} 字（一次写完、当场达标，禁止靠事后补字数）。
【字数铁律 · 首写即达标】
· 本章必须一次写足到 ≥ ${floor.toLocaleString()} 字才算完成；这是硬性交付标准，禁止写成梗概式短场景、禁止一笔带过、禁止提前收尾。
· 开写前先按节拍表里每一拍标注的「（约X字）」明确各段分量：**每一拍都要被展开到接近其标注的约X字篇幅**（例如「冲突推进（约800字）」就须写出约800字的正文，而不是150字一带而过），逐拍累加即达本章目标；写正文时把它们自然衔接成一篇连续正文、不拆成独立小节，由上拍剧情引到下拍；某拍在节拍表里素材偏少时，允许在该拍内通过场景铺陈、动作拆解、多轮对话、人物可观察反应与环境氛围的合理扩写来凑足该拍字数；严禁把多个节拍事件挤进一句话带过；每段事件一律用五感细节（视觉/听觉/触觉/嗅觉/味觉）、连贯动作、人物对话、可观察反应与环境氛围写实写足；不得为了扩写而堆叠直白心理解释。
· 剧情完整的前提下优先增厚铺垫、交锋与收官，禁止把多个节拍事件挤进一句话带过，也不得堆砌标点/空行凑数。
· 一边写一边对照：节拍表里每一段事件是否都已写到、是否写足应有的分量；不足必须继续扩写到位，而不是就此了事。
· 同时设硬顶：成文超过 ${hi.toLocaleString()} 字（上限 ${cap.toLocaleString()} 字）即判超长，达到目标区间就应立即收束本章，禁止无限铺陈、禁止为了"更多字数"再追加内容。
· 长度以正文落库为准，末尾不输出任何 LEN/字数标记。
【厚写展开法 · 防照抄应付（v1.0.270）】禁止把节拍 event 的字面内容"一转述就完事"：正文的实际篇幅必须明显大于节拍事件的字面内容。要写厚，就主动给每段事件叠加这些展开维度（按情节需要选，不必每拍全用）——(a) 前置铺垫：事件发生前，主角进入现场、环境气氛、人物状态的变化；(b) 动作拆解：把"一个动作"写成连续的小步骤与肢体/表情细节；(c) 对话往返回合：同一冲突用一来一回的多轮对话推进，而非一句带过；(d) 感官与环境：光线、声音、气味、触感的具象描写；(e) 延宕与收束：冲突落地后的人物反应、情绪余波与场面收尾。只有把事件展开到"看得见、感得到、有过程"，才算完成本拍，才算达标。`;
}

  const api = {
    glossaryForAI,
    glossaryDupNoteHtml,
    chapterGlossaryBlock,
    subplotProgressBlock,
    bindPlannerTitles,
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
    sizeChapterInjection
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['planner-audit'] = Object.freeze(api);
  return ns['planner-audit'];
}
