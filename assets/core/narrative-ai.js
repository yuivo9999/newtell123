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

function nmNameRuleViolation(nm){
  const s = String(nm||'').trim();
  if(!s) return '';
  if(!/^[\u4e00-\u9fa5]+$/.test(s)) return '';           // 含非汉字（外文名）不约束
  const bv = banListViolation(s);
  if(bv) return bv;
  let surLen = 0;
  if(NM_SURNAME_2.has(s.slice(0,2))) surLen = 2;
  else if(NM_SURNAME_1.has(s.charAt(0))) surLen = 1;
  if(!surLen) return '';                                   // 首字(两字)非百家姓 → 外国角色不约束
  const exp = surLen + 2;                                  // 姓 + 两字名
  if(s.length !== exp) return `姓名应为百家姓(${surLen}字姓)+两字名＝${exp}字（当前「${s}」为${s.length}字）`;
  const given = s.slice(surLen);
  if(/([\u4e00-\u9fa5])\1/.test(given)) return `名字不得叠字（「${s}」）`;
  if(NM_WEB_BLACKLIST.some(w => s.indexOf(w) >= 0)) return `疑似网文高频名（「${s}」）`;
  return '';
}

function normalizeBanList(b){
  if(!b || typeof b !== 'object') return null;
  const out = { enabled: !(b.enabled === false) };
  out.chars = Array.isArray(b.chars) ? b.chars.filter(x=>x&&String(x).trim()) : [];
  out.names = Array.isArray(b.names) ? b.names.filter(x=>x&&String(x).trim()) : [];
  out.phrases = Array.isArray(b.phrases) ? b.phrases.filter(x=>x&&String(x).trim()) : [];
  out.rules = Array.isArray(b.rules) ? b.rules.filter(r=>r&&r.text).map(r=>({ text:String(r.text), ai:Array.isArray(r.ai)?r.ai:[] })) : [];
  out.scopeAi = Array.isArray(b.scopeAi) ? b.scopeAi.filter(x=>x) : (Array.isArray(BANLIST_DEFAULT.scopeAi) ? BANLIST_DEFAULT.scopeAi.slice() : []);
  return out;
}

function banListRaw(){ return (state.banList && typeof state.banList === 'object') ? state.banList : BANLIST_DEFAULT; }

function stateBanEnabled(){ const b = banListRaw(); return !(b && b.enabled === false); }

function banListChars(){ const c = banListRaw().chars; return (Array.isArray(c) && c.length) ? c : NM_BANNED_CHARS; }

function banListNames(){ const n = banListRaw().names; return (Array.isArray(n) && n.length) ? n : NM_BANNED_NAMES; }

function banListAiActive(role){
  const sc = banListRaw().scopeAi;
  if(!Array.isArray(sc) || !sc.length) return true;
  return sc.indexOf(role) >= 0;
}

function banListBlockFor(role){
  if(!isLong()) return '';
  if(!stateBanEnabled()) return '';
  const b = banListRaw();
  const lines = [];
  const chars = banListChars(), names = banListNames();
  if(chars.length && banListAiActive(role)) lines.push('人名禁用字：' + chars.join('、') + '（姓名任何位置命中即违规）');
  if(names.length && banListAiActive(role)) lines.push('禁用姓名（不得逐字原样使用或当作现成名）：' + names.join('、'));
  const rules = Array.isArray(b.rules) ? b.rules : [];
  rules.forEach(r => {
    if(!r || !r.text) return;
    const ai = Array.isArray(r.ai) ? r.ai : [];
    if(ai.indexOf(role) >= 0) lines.push(r.text);
  });
  const phrases = Array.isArray(b.phrases) ? b.phrases : [];
  if(role === 'chapter' && phrases.length) lines.push('规避高频模板词/禁用短语：' + phrases.join('、'));
  if(!lines.length) return '';
  return '\n\n【用户禁则清单（最高优先）】\n' + lines.join('\n');
}

function banListViolation(nm){
  const s = String(nm||'').trim(); if(!s) return '';
  const ch = banListChars().find(c => s.indexOf(c) >= 0);
  if(ch) return `名字含禁用字「${ch}」（禁则清单）`;
  if(banListNames().indexOf(s) >= 0) return `命中禁则名单「${s}」`;
  return '';
}

function currentBookBeatId(){ return state.bookBeat ? Number(state.bookBeat) : BOOK_BEAT_DEFAULT_ID; }

function currentBookBeatCfg(){ return BOOK_BEAT_OPTIONS.find(b=>b.id===currentBookBeatId()) || BOOK_BEAT_OPTIONS[0]; }

function bookBeatHtml(){
  const cur = currentBookBeatId();
  return `<div class="book-beat-panel" style="margin:10px 0">
    <div class="poly-head"><span class="poly-ic">🥁</span><b>全书拍子</b><span class="poly-rule">生成大纲前选择</span></div>
    <div class="book-beat-options" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-top:8px">
      ${BOOK_BEAT_OPTIONS.map(b=>`
        <label class="book-beat-card ${b.id===cur?'selected':''}" style="border:2px solid ${b.id===cur?'var(--accent,#4a90e2)':'var(--line,#e0e0e0)'};border-radius:8px;padding:10px;cursor:pointer;transition:.15s">
          <input type="radio" name="bookBeat" value="${b.id}" ${b.id===cur?'checked':''} style="display:none">
          <div style="font-size:18px;margin-bottom:4px">${b.emoji} ${b.label}</div>
          <div style="font-weight:600;font-size:13px;margin-bottom:4px">${b.subtitle}</div>
          <div style="font-size:12px;color:var(--muted);line-height:1.4">${b.desc}</div>
          ${b.pro?`<div class="book-beat-pc pro"><span class="pc-k">优点</span>${b.pro}</div>`:''}
          ${b.con?`<div class="book-beat-pc con"><span class="pc-k">缺点</span>${b.con}</div>`:''}
        </label>
      `).join('')}
    </div>
  </div>`;
}

function bookBeatBriefHtml(){
  const bb = currentBookBeatCfg();
  const stages = (bb.ai && bb.ai.stages) || [];
  return `<div class="decision-brief book-beat-brief">
    <span class="db-lock">🔒</span><b>全书拍子已先定</b>
    <span class="db-main">${bb.emoji} ${esc(bb.label)}</span>
    <span class="db-sub">${esc(bb.subtitle)}</span>
    <span class="db-stages">${stages.map(esc).join(' → ')}</span>
  </div>`;
}

function currentBeatId(){
  const o=state.outline;
  let v = o && o.beatCount ? Number(o.beatCount) : BEAT_DEFAULT_ID;
  if(!BEAT_OPTIONS.some(b=>b.id===v)) v = BEAT_DEFAULT_ID;
  return v;
}

function currentBeatCfg(){ return BEAT_OPTIONS.find(b=>b.id===currentBeatId()) || BEAT_OPTIONS[0]; }

function beatTypesDefs(){ return currentBeatCfg().types; }

function beatTypeKeys(){ return beatTypesDefs().map(t=>t.key); }

function beatCnt(){ return beatTypesDefs().length; }

function beatLabelFor(key){ return BEAT_LABEL_ALL[key] || BEAT_LEGACY_LABEL[key] || (()=>{ const t=beatTypesDefs().find(x=>x.key===key); return t?t.label:key; })(); }

function beatNoteFor(key){ return BEAT_HINT_ALL[key] || ''; }

function isClimaxType(key){ return /高潮|高点/.test(BEAT_LABEL_ALL[key] || key); }

function validateStripLen(text, target){
  const len = countWords(String(text||'')).cjk;
  const lo = Math.round(target * 0.9);
  const hi = Math.round(target * 1.1);
  return { ok: len >= lo && len <= hi, len, lo, hi };
}

function ideaKeyTerms(idea){
  const t = String(idea||'').trim();
  const coined = new Set(), soft = new Set();
  (t.match(/[“"「『《]([^”"」』》]{1,12})[”"」』》]/g)||[]).forEach(s=>{ const w=s.slice(1,-1).trim(); if(w) coined.add(w); });
  const words = t.match(/[\u4e00-\u9fa5a-zA-Z0-9]{2,8}/g)||[];
  const STOP = new Set(['一个','一种','这个','那个','什么','怎么','可以','我们','他们','自己','故事','主角','因为','所以','但是','然后','就是','不是','也是','也要','就会','就要','才能','只能','只会','还要','都会','都在','其实','虽然','甚至','以及','或许','几乎','感觉','知道','发现','以为','如果','但是','可能','只是','因为','于是','可是','不是','没有','着','却','就']);
  const freq = {}; words.forEach(w=>{ if(!STOP.has(w)) freq[w]=(freq[w]||0)+1; });
  Object.keys(freq).forEach(w=>{ if(freq[w]>=2) (coined.has(w) ? coined : soft).add(w); });
  const short = t.length < 15;
  return { coined:[...coined], soft:[...soft], short };
}

function validateIdeaFaithful(j, idea){
  const { coined, soft, short } = ideaKeyTerms(idea);
  if(short || (!coined.length && !soft.length)) return '';       // 极短/无关键词：豁免
  const blob = JSON.stringify(j);
  const missC = coined.filter(w => !blob.includes(w));
  const missS = soft.filter(w => !blob.includes(w));
  const total = coined.length + soft.length;
  if(missC.length >= 2){
    return `未保留用户核心专名（丢 ${missC.length}/${coined.length}）：${missC.slice(0,5).join('、')}`;
  }
  if(total && (missC.length + missS.length) > Math.ceil(total * 2 / 3)){
    return `核心设定词命中率偏低（丢 ${missC.length + missS.length}/${total}）：${(missC.concat(missS)).slice(0,5).join('、')}`;
  }
  return '';
}

function validateIdeaProOutput(j, ctx){
  if(j === null || j === undefined) return {ok:true};          // 纯文本无 JSON：放行
  if(typeof j !== 'object') return {ok:false, code:'EMPTY'};   // 非 null 但非对象（罕见脏数据）仍拒
  if(j.brief && typeof j.brief === 'object'){
    return {ok:true};
  }
  if(Array.isArray(j.options) && j.options.length){
    return {ok:true};
  }
  const err = validatePolishOutput(j);
  return err ? {ok:false, code:'SCHEMA', details:err} : {ok:true};
}

function validateAIOutput(kind, raw, ctx){
  const j = extractJsonObject(raw);
  if(j && j.error) return {ok:false, code:'AI_ERROR', details:j.error};
  const fn = AIValidators[kind];
  if(!fn) return {ok:true};
  const arg = (kind === 'chapter' || kind === 'strip') ? raw : j;
  const r = fn(arg, ctx);
  if(r && typeof r === 'object' && 'ok' in r) return r;                       // {ok} 对象约定
  if(typeof r === 'string') return r ? {ok:false, code:'SCHEMA', details:r} : {ok:true};
  return r ? {ok:false, code:'SCHEMA', details:String(r)} : {ok:true};
}

async function callAIGuarded(kind, systemOrExtra, userOrOpts, ctx, opts){
  const _tmKey = TM_KEYS.includes(kind) ? kind : null;
  const _unwrap = (res) => {
    const txt = unwrapAIResult(res);
    if(res && res.finishReason === 'length'){
      throw new Error(`${kind} AI 输出被截断，请增大输出上限或减少篇幅后重试`);
    }
    return txt;
  };
  if(typeof systemOrExtra === 'string'){
    const _sysAug = systemOrExtra + globalCreativeConstraintBlock(kind);
    const txt = _unwrap(await callDeepSeek(_sysAug, userOrOpts, Object.assign({}, opts||{}, _tmKey?{taskKey:_tmKey}:{})));
    const report = validateAIOutput(kind, txt, ctx);
    if(!report.ok){
      throw new Error(`${kind} AI 输出校验失败：${report.code} ${report.details || ''}`);
    }
    return txt;
  }
  const extra = systemOrExtra || {};
  const callOpts = Object.assign({}, userOrOpts||{}, _tmKey?{taskKey:_tmKey}:{});
  const system = getSystemPrompt(kind, extra) + globalCreativeConstraintBlock(kind);
  const user = buildAIPrompt(kind, extra);
  const busCtx = AIBus.get(kind, extra);
  const txt = _unwrap(await callDeepSeek(system, user, callOpts));
  const report = validateAIOutput(kind, txt, busCtx);
  if(!report.ok){
    throw new Error(`${kind} AI 输出校验失败：${report.code} ${report.details || ''}`);
  }
  return txt;
}

function getSystemPrompt(kind, extra){
  switch(kind){
    case 'idea': return IDEA_POLISH_SYS + (extra && extra.multi ? POLISH_MULTI_MODE : '');
    case 'titles': return REGEN_TITLES_SYS;
    case 'chapter': return longChapterSys();
    case 'subplot': return SUBPROGRESS_UPDATE_SYS;
    case 'glossary': return GLOSSARY_EXTRACT_SYS;
    case 'dictmaster': return DICTMASTER_SYS;
    case 'strip': {
      const ctx = AIBus.get('strip', extra);
      const target = ctx.targetZhs || 300;
      const lo = Math.round(target*0.9), hi = Math.round(target*1.1);
      return STRIP_READ_SYS.replace('[TARGET_ZHS]', target).replace('[LO_HI]', `${lo}–${hi}`);
    }
    default: throw new Error('未知 AI kind: '+kind);
  }
}

function buildAIPrompt(kind, extra){
  const ctx = AIBus.get(kind, extra);
  switch(kind){
    case 'idea': return buildIdeaPolishUser(ctx);
    case 'titles': return titlesGenUser(extra);
    case 'chapter': return buildChapterUser(extra?.idx, extra);
    case 'subplot': return buildSubplotUser(ctx);
    case 'glossary': return buildGlossaryExtractUser(ctx);
    case 'dictmaster': return buildDictMasterUser(ctx);
    case 'strip': return buildStripUser(ctx);
    default: throw new Error('未知 AI kind: '+kind);
  }
}

function buildIdeaPolishUser(ctx){
  const lines = [`【用户构想】\n${String(ctx.rawIdea || '').trim()}`];
  const wsItems = wsGroupStyleTags(null);
  if(wsItems && wsItems.length){
    const names = wsItems.map(s=>s.name).join(' + ');
    const details = wsItems.map(s=> `· ${s.name}：${s.note||''}${Array.isArray(s.tips)&&s.tips.length?`（写法：${s.tips.join('；')}）`:''}`).join('\n');
    lines.push(`【用户已锁定的写作风格（所有方案必须严格服从的最高基准）】\n已选定风格：${names}\n风格核心要求：\n${details}\n【硬性要求】本次生成的全部方案中，「风格」字段及行文基调都必须严格以用户选定的上述写作风格为核心基石；允许且鼓励在此基础上为不同方案做契合的【风格补充】（如针对该方案特色的细节侧重、氛围点缀），但补充的风格必须与用户已选定的主风格完全和谐、绝不冲突违和。`);
  }
  const bb = currentBookBeatCfg();
  const mb = currentBeatCfg();
  const cc = chapterCountVal();
  const parts = [];
  if(bb) parts.push(`全书拍子·${bb.label}（${bb.subtitle}）\n阶段：${((bb.ai && bb.ai.stages) || []).join(' → ')}`);
  if(mb) parts.push(`章节微拍·${mb.label}${mb.wc ? `（${mb.wc}）` : ''}`);
  if(cc) parts.push(`全书章节数：${cc} 章`);
  if(cc){
    const plan = bookStagePlan(cc);
    if(plan && plan.length){
      const seg = []; let cur = 0;
      plan.forEach(p=>{ const a = cur + 1; cur += p.n; seg.push(`第 ${a}—${cur} 章「${p.name}」`); });
      parts.push(`【章节↔全书拍子落位】全书 ${cc} 章按当前拍子解析为 ${plan.length} 段：${seg.join('；')}`);
    }
  }
  const tb = teamShapeBrief();
  if(tb) parts.push(tb);
  if(parts.length) lines.push(`【已选叙事结构】\n${parts.join('\n\n')}`);
  return lines.join('\n\n');
}

function buildSubplotUser(ctx){
  const chIdx = ctx.chapterIdx;
  const body = String(ctx.content || '').trim();
  const o = state.outline || {};
  const g = (o.glossary) || {};
  const subs = (Array.isArray(g.subplots)?g.subplots:[]).filter(Boolean);
  const prog = subs.map(s=>{
    const nm = String(s.name||'').trim() || '（未命名）';
    const ts = (Array.isArray(s.log)?s.log:[]).map(x=>`第${x.ch}章${x.note?`（${x.note.trim()}）`:''}`).join(' → ');
    const q = String(s.question||'').trim();
    return `· ${nm}（${['进行中','搁置','已收束'].includes(s.status)?s.status:'进行中'}）${q?`｜问：${q}`:''}\n  ${ts||'（尚无进度）'}`;
  }).join('\n') || '（暂无副线）';
  return `【本章正文（第 ${chIdx+1} 章）】\n${String(body).slice(-50000)}\n\n【现有副线进度】\n${prog}`;
}

function buildStripUser(ctx){
  const chIdx = ctx.chapterIdx;
  const o = state.outline || {};
  const body = String(ctx.content||'').trim();
  return `【本章真实正文】\n${body.slice(-50000) || '（本章暂无正文）'}`;
}

function canRunAI(kind){
  const deps = {
    idea: [],
    recipe: [],
    outline: ['idea'],
    titles: ['outline'],
    chapterPlan: ['outline','titles'],
    chapter: ['outline','titles','chapterPlan'],
    subplot: ['chapter'],
    glossary: ['chapter'],
    strip: ['chapter']
  };
  const net = state.aiNetwork;
  return (deps[kind]||[]).every(d => d === 'idea' || net.completed?.includes(d) || d === kind);
}

function markAIRunning(kind){
  state.aiNetwork.running = Array.from(new Set([...(state.aiNetwork.running||[]), kind]));
  persist();
}

function markAIDone(kind){
  state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!==kind);
  state.aiNetwork.completed = Array.from(new Set([...(state.aiNetwork.completed||[]), kind]));
  persist();
}

function addToFixQueue(entry){
  state._fixQueue = state._fixQueue || [];
  if(entry && Number.isInteger(entry.ch)){
    const exist = state._fixQueue.find(x => x.ch === entry.ch);
    if(exist){ exist.attempts = (exist.attempts||1) + 1; exist.ts = Date.now(); }
    else state._fixQueue.push({ ch:entry.ch, code:entry.code, errors:entry.errors||[], attempts:1, ts:Date.now() });
  } else if(entry && entry.kind){
    const exist = state._fixQueue.find(x => x.kind === entry.kind && !Number.isInteger(x.ch));
    if(exist){ exist.error = entry.error; exist.attempts = (exist.attempts||1)+1; exist.ts = Date.now(); }
    else state._fixQueue.push({ kind:entry.kind, error:entry.error, raw:entry.raw||'', attempts:1, ts:Date.now() });
  }
  persist();
}

function langLayerInjection(){
  if(!isLong() || !state.langLayer) return '';
  return '\n\n' + LANG_LAYER_SYS;
}

function globalCreativeConstraintBlock(kind){
  const creative = ['idea','principal','teacher','chapter','planner','outline'];
  const banRoles = ['idea','titles','dictmaster','dictEnrich','principal','teacher'];
  const parts=[];
  if(banRoles.indexOf(kind)>=0 && stateBanEnabled()){
    const b=banListRaw();
    const chars=banListChars(), names=banListNames();
    if(chars.length) parts.push('【用户禁则清单·全书姓名禁用字】以下字不得用于新人物/地点/专名命名：'+chars.join('、'));
    if(names.length) parts.push('【用户禁则清单·全书禁用姓名】以下姓名不得被新创作、复用、建议或写入本阶段成果：'+names.join('、'));
    const rules=Array.isArray(b.rules)?b.rules:[];
    rules.forEach(r=>{ if(r&&r.text && (!Array.isArray(r.ai)||!r.ai.length || r.ai.indexOf(kind)>=0)) parts.push('【用户禁则·规则】'+String(r.text).trim()); });
  }
  if(creative.indexOf(kind)>=0 && kind!=='chapter' && state._narrIron!==false) parts.push(NARRATIVE_IRON_PLANNING);
  return parts.length ? '\n\n'+parts.join('\n') : '';
}

function narrativeIronBlock(role, opts){
  const parts = [];
  const ban = banListBlockFor(role);
  if(ban) parts.push(ban);
  if(role === 'chapter'){
    const lang = langLayerInjection();
    if(lang) parts.push(lang);
  }
  const sep = '\n\n';
  opts = opts || {};
  if(opts.lean){
    const head = '【规划纪律（精简）】节拍事件须有清晰动机、禁止无故推进剧情、禁止各章事件雷同或套模板。';
    return parts.filter(Boolean).length ? sep + head + '\n' + parts.join('\n') : head;
  }
  if(state._narrIron === false){
    const block = parts.filter(Boolean).join('\n');
    return block ? sep + '【叙事纪律（铁律已关闭，仅保留禁则/语言分层等中间件）】\n' + block : '';
  }
  const iron = role === 'chapter' ? NARRATIVE_IRON_HARD + '\n' + NARRATIVE_IRON_SOFT : NARRATIVE_IRON_HARD;
  let ironFull = iron;
  if(role === 'chapter' && shapeKind() === 'team'){
    ironFull += '\n【团队铁律】本书为团队叙事，核心团各成员凡在本章出场就必须有"存在性"——有对话、有动作、或有专属于该成员的反应/细节，不得被写成背景板或纯提线木偶；禁止主角一人单刷全篇、队友全程挂机——凡危机须体现靠成员互补能力/配合拆解；多人对话要有可辨识的声口与立场，避免把多条声音堆成一片没有区别的对白。';
  } else if(role === 'chapter' && shapeKind() === 'dual'){
    ironFull += '\n【双主角铁律】本书为双主角叙事，两名主角各有独立行动场景与弧线：本章凡涉及双主角，须给双方各自实质性的镜头与推进，不得把某一方写成另一方的附庸/背景；双视角切换必须有明确触发点与衔接（换场景/换段），禁止在同一场景内无节制的视角跳转；两人同场时，其对视/争执/配合要写得有张力与辨识声口。';
  }
  if(role === 'chapter'){
    ironFull += '\n【章首铁律】章首开法**必须**有变化：**禁止**全书或连续多章重复同一种开法、**禁止**每章都以同一类人物动作或同一类时间词起句、也**禁止**连续两章雷同，小说整体**禁止**某一种开法超过三成。下面各方式**可以**混用、**必须**轮流换着来：①续写式（优先）：优先从上一章结局未完成的对话/动作/悬念切入（承接细则以该章承接任务书为准）；例："『这话可说不得。』上回话到一半，屋里便只剩扇子敲桌沿的声响。"；②场景/环境式：从能即时带出情绪与冲突的场景细节/物件/光线/动静切入，人物稍后才点名；例："檐角铜铃被夜风拨响时，堂屋的灯还亮着，桌上摊着两封未拆的信。"；③人物开句式：以人物称谓开句**可以**，但须与前后章错开、**禁止**连续两章相同；④时间开句式：以时间词开句**可以**，但**禁止**连续两章都用时间词开句；⑤他人/群像式：从他人口中或反应侧写入物处境，出场人物不占句首；例："『那人的名讳一提就烫嘴。』有人压着嗓子嘀咕。"；⑥悬念回接式：以章末钩子的延续、一句质问或一个反常细节起首；例："那封密信最终会不会落到衙门手中，成了压在每个人心口的石头。"';
  }
  if(role === 'chapter'){
    ironFull += '\n【视角与反剧透铁律】全章以主角的受限感知推进：只写主角能\/看到听到摸到感知到的；想表现他人内心，一律从主角的观察与推断出发，禁止直接钻进路人\/配角\/反派的内心"读心"。禁止提前揭示读者与主角尚不该知道的答案：伏笔只许一笔带过地埋伏笔，不点破、不解释、不揭示答案（不剥夺读者的"侦探权"）。背景\/世界观\/前史情报必须"寄生"在角色的即时感官里（听\/闻\/触）传达，禁止作者跳出来大段广播。仅在章\/节分界明显、或关键时刻"只展示不解释"的客观动作、或悬念兑现时，才可短暂切出并立即回到主角。';
  }
  const head = role === 'chapter'
    ? '【叙事铁律 · 本章写作总纲】'
    : '【叙事铁律 · 规划纪律总纲】（禁止项同样约束规划阶段的设计）';
  return sep + head + '\n' + parts.filter(Boolean).join('\n') + '\n' + ironFull;
}

  const api = {
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
    narrativeIronBlock
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['narrative-ai'] = Object.freeze(api);
  return ns['narrative-ai'];
}
