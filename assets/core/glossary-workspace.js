/* v29: cohesive glossary / terminology workspace extracted from app-legacy.js. */

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
    getWsDraft,
    setWsDraft,
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

  // glossary-pipeline publishes CHAR_FIELDS on window; keep safe local fallbacks for the legacy UI.
  const CHAR_FIELDS = window.CHAR_FIELDS || ['identity','age','gender','appearance','hobby','relation','trait','catchphrase'];
  const CHAR_FIELD_LABEL = window.CHAR_FIELD_LABEL || { identity:'身份', age:'岁数', gender:'性别', appearance:'外貌', hobby:'爱好', relation:'关系', trait:'性格', catchphrase:'口头禅' };

function glossaryFieldCheck(){
  const g = (state.outline && state.outline.glossary) || {};
  const rows = [];
  (g.characters||[]).forEach(c=>{
    const missing = CHAR_FIELDS.filter(k=> c[k]==null || String(c[k]).trim()==='');
    const unknown = CHAR_FIELDS.filter(k=> String(c[k]||'').trim()==='未知');
    if(missing.length || unknown.length) rows.push({ name: String(c.name||'未命名').trim(), missing, unknown });
  });
  return rows;
}

function glossaryCheckCount(){ return glossaryFieldCheck().length; }

function parseAgeNum(v){
  if(v==null) return null;
  const s = String(v).replace(/[，。、；：,.；\s\/~\-]/g,'');
  const m = s.match(/([0-9一二三四五六七八九十百]+)/g);
  if(!m) return null;
  const n = m[m.length-1];
  const c = n.match(/^[0-9]+$/) ? parseInt(n,10) : /^[一二三四五六七八九十]{1,2}$/.test(n) ? (Array.from(n).reduce((a,ch)=>{const t={'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10}[ch]; return a + (ch==='十'?(a?10:0):t);},0)||10) : null;
  return c;
}

function auditGlossaryPlausibility(){
  const g = (state.outline && state.outline.glossary) || {};
  const EXEMPT = /长生|修仙|修者|转世|穿越|永生|不朽|不老|活了几百|活了一百|千百岁|岁月如刀|修真|修仙界|活了\s*\d+\s*岁|永世|不死不灭|寿元/;
  const rows = [];
  (g.characters||[]).forEach(c=>{
    const name = String(c.name||'未命名').trim();
    const ageStr = String(c.age||'').trim();
    if(!ageStr) return;
    const n = parseAgeNum(ageStr);
    if(n==null) return;
    const txt = ['identity','hobby','relation','trait'].map(k=>String(c[k]||'')).join('，');
    if(EXEMPT.test(txt)) return;                       // 超自然豁免：不校验数值
    const yre = txt.match(/(?:已|在此|从小|在这|于此|待了)?\s*([0-9一二三四五六七八九十]+)\s*年(?:了|的|多|整)?/g) || [];
    yre.forEach(ym=>{
      const m = ym.match(/([0-9一二三四五六七八九十]+)/);
      const yrs = m ? parseAgeNum(m[1]) : null;
      if(yrs!=null && yrs>1 && n<yrs+2){
        rows.push({ name, reason:`设定提到「${ym.trim()}」，但年龄仅${ageStr}，疑似自相矛盾（软提示，可人工修正）` });
      }
    });
    if(/父|母|父亲|母亲|亲/.test(txt) && n<=8){ rows.push({ name, reason:`年龄${ageStr}却担"父亲/母亲"类亲老关系，疑似过早（软提示，可人工修正）` }); }
  });
  const seen = {}; const out = [];
  rows.forEach(r=>{ if(!seen[r.name]){ seen[r.name]=1; out.push(r); } });
  return out;
}

function plausibilityCount(){ return auditGlossaryPlausibility().length; }

function openGlossaryCheckPanel(){
  closeGlossaryCheckPanel();
  const rows = glossaryFieldCheck();
  const plaus = auditGlossaryPlausibility();
  const plausBody = plaus.length ? `<div class="cv-div" style="margin-top:8px">⚠️ 属性自洽软提示（${plaus.length}）：以下为低置信猜测，可能与修仙/转世/长生等设定冲突而误报，可人工修正或忽略，不影响流程。</div>` + plaus.map(r=>
    `<div class="cv-row"><div class="cv-meta" style="flex:1;min-width:0">
      <div class="cv-time">${esc(r.name)}</div>
      <div class="cv-t" style="font-size:12px;line-height:1.6"><span class="gs-unk">自洽：${esc(r.reason)}</span></div>
    </div></div>`
  ).join('') : '';
  const body = rows.length ? rows.map(r=>{
    const m = r.missing.map(k=>CHAR_FIELD_LABEL[k]).join('、');
    const u = r.unknown.map(k=>CHAR_FIELD_LABEL[k]).join('、');
    return `<div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0">
        <div class="cv-time">${esc(r.name)}</div>
        <div class="cv-t" style="font-size:12px;line-height:1.6">
          ${m?`<span class="gs-miss">缺失：${m}</span>`:''} ${u?`<span class="gs-unk">未知：${u}（建议补全）</span>`:''}
        </div>
      </div>
    </div>`;
  }).join('') : '<p class="muted">✅ 全部人物字段齐全（身份/岁数/性别/外貌/爱好/关系/性格），无缺失、无未知。</p>';
  const ov = document.createElement('div'); ov.id='gsCheckPanel'; ov.className='gs-overlay';
  ov.innerHTML = `<div class="gs-modal">
    <div class="gs-modal-head"><b>🔍 词典人物字段检查（${rows.length}）</b><button class="gs-x" data-gsck-close>✕</button></div>
    <div class="cv-body">
      <div class="cv-div">人物关键设定将注入章节写作，建议补全缺失字段以保障一致性。</div>
      ${body}
      ${plausBody}
    </div></div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-gsck-close]').onclick = closeGlossaryCheckPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeGlossaryCheckPanel(); });
}

function closeGlossaryCheckPanel(){ const p=$('#gsCheckPanel'); if(p) p.remove(); }

function openGlossaryNewPanel(){
  closeGlossaryNewPanel();
  const o = state.outline; if(!o){ toast('尚无词典'); return; }
  const gl = o.glossary || {characters:[], places:[], propernouns:[]};
  const seen = Number(state._glossSeenTs) || 0;
  const kinds = [['characters','人物','char'],['places','地点','place'],['propernouns','专名','proper']];
  const flat = ()=> kinds.flatMap(([k,lab,type])=> (gl[k]||[]).map((x,i)=> ({x, k, lab, type, i})))
    .filter(r=> r.x && r.x._auto && (r.x._srcTs||0) > seen)
    .sort((a,b)=> (b.x._srcTs||0) - (a.x._srcTs||0));
  const rows = flat();
  const fmtTs = ts => new Date(ts||Date.now()).toLocaleString('zh-CN',{hour12:false});
  const srcLabel = x => x._srcCh ? `来自第 ${x._srcCh} 章` : (x._srcHow || '批量提取');
  const body = rows.length ? rows.slice(0,50).map((r,pos)=>`
    <div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0">
        <div class="cv-time">${esc(r.lab)} · ${esc(String(r.x.name||'').trim())}</div>
        <div class="cv-t" style="font-size:12px;line-height:1.6"><span class="gs-unk">${esc(srcLabel(r.x))} · ${fmtTs(r.x._srcTs)}</span></div>
      </div>
      <button type="button" class="btn ghost gs-tool" data-gsn-locate="${pos}" title="在词典中展开并高亮该条目">定位</button>
      <button type="button" class="btn ghost gs-tool" data-gsn-remove="${pos}" title="从词典移除该条目">移除</button>
    </div>`).join('') : '<p class="muted">✅ 暂无未读的自动入典新实体。</p>';
  const ov = document.createElement('div'); ov.id='gsNewPanel'; ov.className='gs-overlay';
  ov.innerHTML = `<div class="gs-modal">
    <div class="gs-modal-head"><b>🆕 最近自动入典（${rows.length}${rows.length>50?'，显示前 50 条':''}）</b><button class="gs-x" data-gsn-close>✕</button></div>
    <div class="cv-body">
      <div class="cv-div">展示新自动入典的实体条目与来源。</div>
      ${body}
    </div>
    <div style="padding:10px 14px;border-top:1px solid rgba(127,127,127,.25);display:flex;gap:8px;justify-content:flex-end">
      <button type="button" class="btn ghost" data-gsn-seen ${rows.length?'':'hidden'}>全部标为已读</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-gsn-close]').onclick = closeGlossaryNewPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeGlossaryNewPanel(); });
  $$('[data-gsn-locate]', ov).forEach(b=> b.onclick = ()=>{
    const r = flat()[+b.dataset.gsnLocate]; if(!r) return;
    closeGlossaryNewPanel();
    state.gsCatFold = state.gsCatFold || {};
    if(r.type==='char'){ state.gsCatFold.main = false; state.gsCatFold.support = false; }
    else state.gsCatFold[r.type] = false;
    persist(); renderGlossaryOnly();
    const box = $(`[data-gs-entry="${r.type}:${r.i}"]`);
    if(box){
      box.classList.add('open'); const ico = box.querySelector('.gs-fold-ico'); if(ico) ico.textContent='▾';
      box.scrollIntoView({behavior:'smooth', block:'center'});
      box.classList.add('gs-flash'); setTimeout(()=> box.classList.remove('gs-flash'), 1600);
    }
  });
  $$('[data-gsn-remove]', ov).forEach(b=> b.onclick = ()=>{
    const r = flat()[+b.dataset.gsnRemove]; if(!r) return;
    if(!confirm(`从词典移除「${String(r.x.name||'').trim()}」？（${srcLabel(r.x)}）`)) return;
    const arr = gl[r.k] || []; const gi = arr.indexOf(r.x); if(gi>=0) arr.splice(gi,1);
    persist(); renderGlossaryOnly(); closeGlossaryNewPanel(); openGlossaryNewPanel();   // 重开以刷新列表与角标
  });
  const seenBtn = ov.querySelector('[data-gsn-seen]');
  if(seenBtn) seenBtn.onclick = ()=>{ state._glossSeenTs = Date.now(); persist(); renderGlossaryOnly(); closeGlossaryNewPanel(); toast('已全部标为已读'); };
}

function closeGlossaryNewPanel(){ const p=$('#gsNewPanel'); if(p) p.remove(); }

function glossaryCardHtml(){
  const g = (state.outline && state.outline.glossary) || {characters:[], places:[], propernouns:[]};
  const gl = ()=>state.outline.glossary = state.outline.glossary || {characters:[],places:[],propernouns:[]};
  const empty = !(g.characters&&g.characters.length) && !(g.walkons&&g.walkons.length) && !(g.places&&g.places.length) && !(g.propernouns&&g.propernouns.length) && !(g.subplots&&g.subplots.length);
  const hasBody = state.chapters.some(c=>c && c.content);   // 是否有正文可做覆盖面统计（阶段4）
  const seen = Number(state._glossSeenTs) || 0;
  const newCount = [...(g.characters||[]), ...(g.places||[]), ...(g.propernouns||[])].filter(x=> x && x._auto && (x._srcTs||0) > seen).length;
  const tools = `<span class="gs-tools">
    <button type="button" class="btn ghost gs-tool" data-gs-history>🕘 历史更改</button>
    <button type="button" class="btn ghost gs-tool" data-gs-check ${glossaryCheckCount()+plausibilityCount()?'':'hidden'} title="人物 7 字段完整性 + 属性自洽软审计：缺失/未知标出，建议补全">🔍 字段检查${(glossaryCheckCount()+plausibilityCount())?`<b class="gs-check-badge" ${plausibilityCount()&&!glossaryCheckCount()?'style="background:#b8860b"':''}>${glossaryCheckCount()||plausibilityCount()}</b>`:''}</button>
    <button type="button" class="btn ghost gs-tool" data-gs-coverage ${hasBody?'':'hidden'}>📊 覆盖面</button>
    <button type="button" class="btn ghost gs-tool" data-gs-new ${newCount?'':'hidden'} title="查看最近自动入典的新实体（来源章节 + 实际入库时间）">🆕 新增${newCount?`<b class="gs-check-badge">${newCount}</b>`:''}</button>
    <button type="button" class="btn ghost gs-tool" data-gs-extract ${hasBody?'':'hidden'} title="从已生成正文提取词典未收录的新人物/地名/专名并入库">📥 提取新增</button>
    <button type="button" class="btn ghost gs-tool" data-gs-clean ${hasBody?'':'hidden'} title="清理在全部已生成正文中均未出现的条目（如重生成覆盖后失效的旧人物）">🧹 清理未使用</button>
    <button type="button" class="btn ghost gs-tool" data-gs-export>📤 导出 JSON</button>
    <button type="button" class="btn ghost gs-tool" data-gs-import>📥 导入 JSON</button>
    <label class="gs-autofill" title="每章生成后自动吸收副线进度；只有章节正文 AI 会新增/推进副线"><input type="checkbox" data-gs-subfill ${state.subAutoFill?'checked':''} /> 副线追踪</label>
    <button type="button" class="btn ghost gs-tool" data-gs-subboard ${(g.subplots&&g.subplots.length)?'':'hidden'} title="列出未收束且消失过久的副线，提示是否安排回归">🧵 副线看板</button>
    <input type="file" id="gsImportFile" accept=".json,application/json" hidden />
  </span>`;
  if(empty) return `<div class="card gs-card card-theme-glossary"><div class="gs-card-head card-head-bar"><div class="ch-left"><span class="ch-badge ch-badge-glossary">📇</span><h3 class="ch-title">设定表 · 万物词典总览</h3><span class="ch-subtag ch-subtag-glossary">待生成</span></div><div class="ch-right"><span class="muted" style="font-size:12px">一致性基准</span></div></div><div class="gs-card-body">${tools}<p class="sub">生成大纲后自动确立全书万物词典基准。</p></div></div>`;
  const fmt = (o, keys)=>{ const ks = (keys||[]).filter(k=>o[k]); return ks.map(k=>o[k]).join(' · '); };
  const entry = (o, type, i, nameKeys, detailKeys)=>{
    const name = o.name || '';
    const brief = fmt(o, nameKeys);
    const newTag = (o._auto && (o._srcTs||0) > (Number(state._glossSeenTs)||0)) ? `<span class="gs-newtag" title="自动入典：${o._srcCh?('来自第 '+o._srcCh+' 章'):esc(o._srcHow||'批量提取')} · ${new Date(o._srcTs||Date.now()).toLocaleString('zh-CN',{hour12:false})}">🆕${o._srcCh?('·第'+o._srcCh+'章'):''}</span>` : '';
    const flagTag = (type==='char' && o._nameFlag) ? `<span class="gs-nameflag" title="命名待核：${esc(o._nameFlag)}（仅提示不拦截；改名为合规姓名后自动消除）">⚠命名</span>` : '';
    const relField = (type==='char') ? `<label class="gs-f gs-rel-f"><span>${kLabel('relation')}<span class="muted" style="font-weight:400">（摘要·只读）</span></span><div class="gs-rel-ro"><span class="gs-rel-val">${String(o.relation||'').trim()?esc(String(o.relation).trim()):'<span class="muted">（无摘要）</span>'}</span><button type="button" class="btn ghost gs-tool gs-rel-btn" data-gs-rel-edit title="人物关系的逐条明细统一在「人物关系表」中维护（点击直接打开编辑，正文据此写作）">✏️ 去人物关系表编辑</button></div></label>` : '';
    const tierField = (type==='char') ? `<label class="gs-f"><span>类别</span><select data-gs-set="char" data-gs-idx="${i}" data-gs-key="tier" data-orig="${esc(charTierOf(o))}">
      <option value="main" ${charTierOf(o)==='main'?'selected':''}>主要人物</option>
      <option value="support" ${charTierOf(o)==='support'?'selected':''}>次要配角</option>
    </select></label>` : '';
    const detail = tierField + relField + detailKeys.filter(k=>k!=='relation').map(k=>({k, v:o[k]})).filter(x=>x.v).map(x=>`<label class="gs-f"><span>${kLabel(x.k)}</span><input type="text" data-gs-set="${type}" data-gs-idx="${i}" data-gs-key="${x.k}" data-orig="${esc(x.v)}" value="${esc(x.v)}" /></label>`).join('');
    return `<div class="gs-entry" data-gs-entry="${type}:${i}">
      <div class="gs-head" role="button" tabindex="0" data-gs-toggle="${type}:${i}">
        <span class="gs-fold-ico">▸</span>
        <input type="text" class="gs-name" data-gs-name="${type}:${i}" data-orig="${esc(name)}" value="${esc(name)}" placeholder="名称" />
        <span class="gs-brief">${esc(brief||'（无简介，点击展开编辑）')}</span>
        ${newTag}
        ${flagTag}
      </div>
      <div class="gs-detail">
        ${detail}
      </div>
    </div>`;
  };
  const kLabel = k => ({name:'名称', identity:'身份', age:'岁数', gender:'性别', appearance:'外貌', hobby:'爱好', mannerism:'小动作/口头禅', catchphrase:'口头禅', relation:'关系', trait:'性格', type:'类型', note:'说明', question:'核心问题', pivot:'蝴蝶效应'}[k]||k);
  const charEntries = (g.characters||[]);
  const walkonEntries = (g.walkons||[]).map((w,i)=>entry(w,'walkon',i,['note'],['note'])).join('');
  const charTierOf = c => (c && c.tier==='support') ? 'support' : 'main';   // 旧存档无 tier → 视作主要人物
  const grpCharEntries = tierKey => charEntries.map((c,i)=> (charTierOf(c)===tierKey)
    ? entry(c,'char',i,['identity','gender','age'],['name','identity','age','gender','appearance','hobby','catchphrase','relation','trait'])
    : '').join('');
  const grpCharCount = tierKey => charEntries.filter(c=>charTierOf(c)===tierKey).length;
  const mainChars = grpCharEntries('main');      // 主要人物
  const supportChars = grpCharEntries('support'); // 次要配角
  const places = (g.places||[]).map((p,i)=>entry(p,'place',i,['type','note'],['name','type','note'])).join('');
  const props = (g.propernouns||[]).map((p,i)=>entry(p,'proper',i,['note'],['name','note'])).join('');
  const subStatusOpt = (cur) => SUB_STATUSES.map(s=>`<option value="${s}" ${s===cur?'selected':''}>${s}</option>`).join('');
  const subsHtml = (g.subplots||[]).map((s,i)=>{
    const name = String(s.name||'').trim();
    const st = SUB_STATUSES.includes(s.status) ? s.status : '进行中';
    const arcF = (s.arc&&s.arc.from)||'';
    const arcT = (s.arc&&s.arc.to)||'';
    const ts = (Array.isArray(s.log)?s.log:[]).map(x=>`第${x.ch}章${x.note?`（${x.note.trim()}）`:''}`).join(' → ');
    return `<div class="gs-entry" data-gs-entry="sub:${i}">
      <div class="gs-head" role="button" tabindex="0" data-gs-toggle="sub:${i}">
        <span class="gs-fold-ico">▸</span>
        <input type="text" class="gs-name" data-gs-name="sub:${i}" data-orig="${esc(name)}" value="${esc(name)}" placeholder="副线名" />
        <span class="gs-brief">${esc([st, String(s.question||'').trim(), arcF+('→'+arcT||'')].filter(Boolean).join(' · ')||'（点击展开编辑）')}</span>
      </div>
      <div class="gs-detail">
        <label class="gs-f"><span>状态</span><select data-gs-set="sub" data-gs-idx="${i}" data-gs-key="status" data-orig="${esc(st)}">${subStatusOpt(st)}</select></label>
        <label class="gs-f"><span>核心问题</span><input type="text" data-gs-set="sub" data-gs-idx="${i}" data-gs-key="question" data-orig="${esc(String(s.question||'').trim())}" value="${esc(String(s.question||'').trim())}" placeholder="本副线提出的核心问题（必须回答）" /></label>
        <label class="gs-f"><span>起点状态</span><input type="text" data-gs-set="sub" data-gs-idx="${i}" data-gs-key="arcfrom" data-orig="${esc(arcF)}" value="${esc(arcF)}" placeholder="A 状态" /></label>
        <label class="gs-f"><span>当前状态</span><input type="text" data-gs-set="sub" data-gs-idx="${i}" data-gs-key="arcto" data-orig="${esc(arcT)}" value="${esc(arcT)}" placeholder="B 状态" /></label>
        <label class="gs-f"><span>蝴蝶效应</span><input type="text" data-gs-set="sub" data-gs-idx="${i}" data-gs-key="pivot" data-orig="${esc(String(s.pivot||'').trim())}" value="${esc(String(s.pivot||'').trim())}" placeholder="有才填：此副线变化如何影响主线（绝不硬造）" /></label>
        <div class="gs-f"><span>进度（只读）</span><div class="gs-sub-progress">${esc(ts||'（暂无进度）')}</div></div>
        <button type="button" class="btn ghost gs-tool" data-gs-subpop="${i}" title="删除最后一条进度（供纠偏，不会改历史）">↩ 回退一步</button>
      </div>
    </div>`;
  }).join('');
  const collapsed = !!state.gsCollapsed;
  const total = (g.characters||[]).length + (g.walkons||[]).length + (g.places||[]).length + (g.propernouns||[]).length + (g.subplots||[]).length;
  const vRel=validAssoc(g._relationshipTable,'a','b').length;
  const vPC=validAssoc(g._placeContacts,'from','to').length;
  const vPRC=validAssoc(g._properContacts,'from','to').length;
  const vWR=(g._worldRules||[]).filter(x=>x&&String(x.rule||'').trim()).length;
  const histN = Array.isArray(g._relTableHistory) ? g._relTableHistory.length : 0;
  const viewGrid = `<div class="gs-viewgrid">
    <span class="gs-tools gvt-hist-pos"><button type="button" class="btn ghost gs-tool" data-gvth-badge title="人物关系表 / 地名关联表 / 专名关联表 / 世界观规则 的编辑历史（最多 6 次，可查看并一键还原）">🕘 4表历史${histN?`<b class="gs-check-badge">${histN}/6</b>`:''}</button></span>
    <div class="gvt-grid-inner">
    <button type="button" class="btn ghost gs-tool" data-gs-view="rel" title="查看/编辑人物关系表">👥 人物关系表（${vRel}）</button>
    <button type="button" class="btn ghost gs-tool" data-gs-view="pc" title="查看/编辑地名关联表">🗺️ 地名关联表（${vPC}）</button>
    <button type="button" class="btn ghost gs-tool" data-gs-view="prc" title="查看/编辑专名关联表">📌 专名关联表（${vPRC}）</button>
    <button type="button" class="btn ghost gs-tool" data-gs-view="wr" title="查看/编辑世界观规则">⚙️ 世界观规则（${vWR}）</button>
    </div>
  </div>`;
  return `<div class="card gs-card card-theme-glossary${collapsed?' gs-collapsed':''}">
    <div class="gs-card-head card-head-bar" role="button" tabindex="0" data-gs-card-toggle style="cursor:pointer">
      <div class="ch-left">
        <span class="ch-badge ch-badge-glossary">📇</span>
        <h3 class="ch-title">设定表 · 万物词典总览</h3>
        <span class="ch-subtag ch-subtag-glossary">${total} 条已收录</span>
      </div>
      <div class="ch-right">
        <span class="gs-card-arrow" style="font-size:14px;color:var(--muted)">${collapsed?'▸':'▾'}</span>
      </div>
    </div>
    <div class="gs-card-body"${collapsed?' style="display:none"':''}>
    ${tools}
    ${viewGrid}
    <p class="sub">有改则改</p>
    <div class="gs-panel" id="gsHistory" hidden><div class="gs-panel-title">🕘 历史更改</div><div id="gsHistoryList"></div></div>
    ${([
        ['main',   '👤 主要人物', mainChars,    grpCharCount('main')],
        ['support','🤝 次要配角', supportChars, grpCharCount('support')],
        ['walkon', '🚶 路人龙套', walkonEntries,(g.walkons||[]).length],
        ['place',  '🗺️ 地点',     places,       (g.places||[]).length],
        ['proper', '📌 专名',     props,        (g.propernouns||[]).length],
        ['sub',    '🧵 副线',     subsHtml,     (g.subplots||[]).length],
      ]).map(([t,lab,body,cnt])=>{
      const fold = !!(state.gsCatFold && state.gsCatFold[t]);
      return `<div class="gs-group${fold?' gs-folded':''}" data-gs-type="${t}" data-gs-catfold>
        <div class="gs-title" role="button" tabindex="0" title="展开/收起">${lab}（${cnt}）<span class="gs-cat-ico">${fold?'▸':'▾'}</span></div>
        ${body||'<span class="muted">（无）</span>'}
      </div>`;
    }).join('')}
    ${glossaryDupNoteHtml()}
    <p class="muted" style="margin:6px 0 0">修改后自动保存生效。</p>
    </div>
  </div>`;
}

function bindGlossary(){
  if(!state.outline || !state.outline.glossary) return;
  const g = state.outline.glossary;
  const getArr = t => t==='char'?(g.characters||[]):t==='walkon'?(g.walkons||[]):t==='place'?(g.places||[]):(t==='proper'?(g.propernouns||[]):(g.subplots||[]));
  const gsHead = $('[data-gs-card-toggle]');
  if(gsHead){
    const toggleCard = ()=>{
      state.gsCollapsed = !state.gsCollapsed;
      persist();
      const card = gsHead.closest('.gs-card');
      const body = card && card.querySelector('.gs-card-body');
      if(body){ body.style.display = state.gsCollapsed ? 'none' : ''; }
      const arrow = gsHead.querySelector('.gs-card-arrow');
      if(arrow) arrow.textContent = state.gsCollapsed ? '▸' : '▾';
      if(state.gsCollapsed){ // 收缩整卡时把所有词条一并折叠（展开整卡时词条保持折叠态，由用户逐个点击展开）
        card && $$('.gs-entry', card).forEach(en=>{ en.classList.remove('open'); const h=en.querySelector('.gs-fold-ico'); if(h) h.textContent='▸'; });
      }
    };
    gsHead.onclick = (e)=>{ if(e.target.closest('.gs-tools')) return; toggleCard(); };
    gsHead.onkeydown = (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); if(e.target.closest('.gs-tools')) return; toggleCard(); } };
  }
  $$('[data-gs-toggle]').forEach(h=>{
    const toggle = ()=>{ const box=h.closest('.gs-entry'); const on=box.classList.toggle('open'); h.querySelector('.gs-fold-ico').textContent = on?'▾':'▸'; };
    h.onclick = (e)=>{
      if(e.target.closest('input.gs-name')) return;   // 编辑名字时不折叠
      toggle();
    };
    h.onkeydown = (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); } };
  });
  $$('[data-gs-catfold]').forEach(grp=>{
    const t = grp.dataset.gsType;
    const toggleCat = ()=>{
      state.gsCatFold = state.gsCatFold || {};
      state.gsCatFold[t] = !state.gsCatFold[t];
      persist();
      grp.classList.toggle('gs-folded', state.gsCatFold[t]);
      const ico = grp.querySelector('.gs-cat-ico'); if(ico) ico.textContent = state.gsCatFold[t]?'▸':'▾';
    };
    const tt = grp.querySelector('.gs-title');
    if(tt){
      tt.onclick = (e)=>{ e.stopPropagation(); toggleCat(); };
      tt.onkeydown = (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleCat(); } };
    }
  });
  $$('[data-gs-name],[data-gs-set]').forEach(inp=>{
    inp.onchange = ()=>{
      const [type, idx] = inp.dataset.gsSet ? [inp.dataset.gsSet, +inp.dataset.gsIdx]
        : inp.dataset.gsName.split(':').map((v,k)=> k===0?v:(+v));
      const arr = getArr(type);
      if(!arr[idx]) return;
      const oldVal = inp.dataset.orig;
      const newVal = inp.value;
      if(newVal === oldVal) return;            // 无实质变化：不记录、不弹窗
      const isName = inp.hasAttribute('data-gs-name');
      const key = isName ? 'name' : inp.dataset.gsKey;
      gsPushUndo();                            // 记录改动前的整本词典（任意模式，供常驻撤销）
      if(type==='sub' && (key==='arcfrom'||key==='arcto')){
        const arcK = key==='arcfrom' ? 'from' : 'to';
        if(!arr[idx].arc) arr[idx].arc = {from:'', to:''};
        arr[idx].arc[arcK] = newVal;
      } else {
        arr[idx][key] = newVal;                  // 再写回 state（保持现状可编辑即存）
        if(isName && type==='char'){
          delete arr[idx]._nameFlag;
          const _on = String(oldVal||'').trim(), _nn = String(newVal||'').trim();
          if(_nn){
            arr[idx]._userName = true;
            if(_on && _on !== _nn){
              if(!Array.isArray(arr[idx]._alias)) arr[idx]._alias = [];
              if(!arr[idx]._alias.includes(_on)) arr[idx]._alias.push(_on);
              syncNameEverywhere(_on, _nn);
            }
          }
        }
      }
      persist();                               // 改动即保存（防误操作丢数据）
      if(type==='char' && key==='tier'){ renderGlossaryOnly(); return; }
      glossaryHistoryPush(`修改 ${isName?'名称':'字段'}「${type}·${idx}」`); // 追加·历史更改记录
      inp.dataset.orig = newVal;               // 该输入框的 basline 更新
      if(isLong() && type!=='sub'){
        openGlossaryPanel({type, idx, isName, key, oldVal, newVal});
      }
    };
  });
  $$('[data-gs-coverage]').forEach(b=> b.onclick = openCoveragePanel);
  $$('[data-gs-check]').forEach(b=> b.onclick = openGlossaryCheckPanel);
  $$('[data-gs-new]').forEach(b=> b.onclick = openGlossaryNewPanel);
  $$('[data-gs-extract]').forEach(b=> b.onclick = ()=>{ manualExtractGlossary(); });
  $$('[data-gs-clean]').forEach(b=> b.onclick = openCleanPanel);
  $$('[data-gs-subfill]').forEach(b=> b.onchange = ()=>{
    state.subAutoFill = b.checked; persist();
    toast(state.subAutoFill ? '副线追踪已开启（每章生成后自动吸收副线进度）' : '副线追踪已关闭（不再自动吸收副线）');
  });
  $$('[data-gs-subpop]').forEach(b=> b.onclick = ()=>{
    const i = +b.dataset.gsSubpop; if(!Number.isFinite(i)) return;
    const sub = (g.subplots||[])[i]; if(!sub || !Array.isArray(sub.log) || !sub.log.length){ toast('该副线暂无进度可回退'); return; }
    gsPushUndo();
    sub.log.pop();
    sub._lastCh = sub.log.length ? Math.max(...sub.log.map(x=>x.ch||0)) : 0;
    persist();
    if(typeof render === 'function') render();
    toast('已回退该副线最后一条进度');
  });
  $$('[data-gs-subboard]').forEach(b=> b.onclick = openSubplotBoard);
  $$('[data-gs-export]').forEach(b=> b.onclick = exportGlossaryJson);
  $$('[data-gs-import]').forEach(b=> b.onclick = ()=> { const f=$('#gsImportFile'); if(f) f.click(); });
  const imp = $('#gsImportFile'); if(imp) imp.onchange = e=>{ const file = e.target.files && e.target.files[0]; if(file) importGlossaryJson(file); e.target.value=''; };
  $$('[data-gs-history]').forEach(b=> b.onclick = ()=>{
    const panel = $('#gsHistory');
    if(!panel) return;
    const show = panel.hidden;
    if(show) renderGlossaryHistory();
    panel.hidden = !show;
    $$('.gs-panel').forEach(p=>{ if(p.id!=='gsHistory') p.hidden = true; }); // 与内容互斥显示
    if(show) b.classList.add('gs-tool-on'); else b.classList.remove('gs-tool-on');
  });
  $$('[data-gs-view]').forEach(b=> b.onclick = ()=> openGlossaryTableView(b.dataset.gsView));
  $$('[data-gs-rel-edit]').forEach(b=> b.onclick = ()=> openGlossaryTableView('rel'));
  $$('[data-gvth-badge]').forEach(b=> b.onclick = openRelTablesHistoryPanel);
  }

function fmtWR(x){
  if(!x || typeof x !== 'object') return '';
  const c=String(x.cat||'').trim(), s=String(x.scope||'').trim(), r=String(x.rule||'').trim();
  const head = `${c?`[${c}]`:''}${s?`·${s}`:''}`.trim();
  return `${head}${head&&r?' ':''}${r}`.trim();
}

function validAssoc(list, ka, kb){
  if(!Array.isArray(list)) return [];
  return list.filter(x=>{
    if(!x || typeof x !== 'object') return false;
    const a=String(x[ka]||'').trim(), b=String(x[kb]||'').trim();
    return !!a && !!b && a!==b;
  });
}

function openGlossaryTableView(type){
  const o = state.outline; const g = (o && o.glossary) || {};
  const c = GVT_CFG[type]; if(!c) return;
  const list = Array.isArray(g[c.key]) ? g[c.key].map(x=>({...x})) : [];
  const keyA = type==='rel' ? 'a' : 'from', keyB = type==='rel' ? 'b' : 'to';
  const before = JSON.stringify(g[c.key]||[]);
  const ov = document.createElement('div'); ov.className='gs-overlay';
  const fieldInputs = (x, idx) => c.fields.map(f=>{
    const v = x ? (x[f.k]||'') : '';
    return `<input class="gvt-in" data-gvt-f="${f.k}" data-gvt-i="${idx}" placeholder="${f.ph}" value="${esc(v)}" />`;
  }).join('');
  const renderRows = (rows)=>{
    if(!rows.length) return `<span class="muted">${c.empty}</span>`;
    return rows.map((x,i)=>{
      const key = type==='wr' ? (x.rule||'') : (String(x[keyA]||'') + '↔' + String(x[keyB]||''));
      return `<div class="gvt-row" data-gvt-idx="${i}">
        <div class="gvt-fields">${fieldInputs(x, i)}</div>
        <span class="gvt-prev">${c.row(x)}</span>
        <div class="gvt-ops">
          <button type="button" class="btn ghost gs-tool gvt-del" data-gvt-del="${i}" title="移除该行">🗑</button>
        </div>
      </div>`;
    }).join('');
  };
  const writeBack = ()=>{
    const rows = [];
    ov.querySelectorAll('.gvt-row').forEach(el=>{
      const nr = {}; let any = false;
      el.querySelectorAll('[data-gvt-f]').forEach(inp=>{
        const v = inp.value.trim();
        if(v){ nr[inp.dataset.gvtF] = v; any = true; }
        else nr[inp.dataset.gvtF] = '';
      });
      if(any){
        if(type==='wr'){ if(!String(nr.rule||'').trim()) return; }
        else { if(!String(nr[keyA]||'').trim() || !String(nr[keyB]||'').trim()) return; }
        rows.push(nr);
      }
    });
    const old = JSON.stringify(g[c.key]||[]);
    g[c.key] = rows;
    const changed = old !== JSON.stringify(rows);
    if(changed){ pushRelTablesHistory(type); persist(); }
    return changed;
  };
  const addRow = ()=>{
    const rowsEl = ov.querySelector('.gvt-rows');
    const nr = {}; c.fields.forEach(f=> nr[f.k]='');
    const el = document.createElement('div'); el.className='gvt-row'; el.dataset.gvtIdx='-1';
    el.innerHTML = `<div class="gvt-fields">${fieldInputs(nr, -1)}</div><div class="gvt-prev muted">（新行，填好后点「保存」或按需继续增删）</div><div class="gvt-ops"><button type="button" class="btn ghost gs-tool gvt-del" data-gvt-del="-1" title="丢弃该行">🗑</button></div>`;
    rowsEl.appendChild(el);
  };
  const rowsEl = `<div class="gvt-rows">${renderRows(list)}</div>`;
  ov.innerHTML = `<div class="gs-modal gs-view-modal gvt-modal">
    <div class="gs-modal-head"><b>${c.name}（<span class="gvt-count">${list.length}</span> 条 · 可编辑）</b><button class="gs-x" data-gvt-close>✕</button></div>
    <div class="cv-body" style="max-height:60vh;overflow:auto">
      <p class="muted" style="margin:0 0 8px">直接编辑即可；保存后自动写回万物词典，重新生成正文章节时即套用新值。</p>
      ${rowsEl}
      <button type="button" class="btn ghost gs-tool gvt-add">＋ 新增一行</button>
    </div>
    <div class="gs-actions"><button type="button" class="btn gvt-save">💾 保存</button></div>
  </div>`;
  document.body.appendChild(ov);
  const close = ()=> ov.remove();
  ov.querySelector('[data-gvt-close]').onclick = close;
  ov.addEventListener('click', e=>{ if(e.target===ov) close(); });
  ov.querySelector('.gvt-add').onclick = addRow;
  ov.querySelector('.gvt-save').onclick = ()=>{ writeBack(); const n = (g[c.key]||[]).length; ov.querySelector('.gvt-count').textContent = n; toast(`${c.name}已保存（${n} 条）——重新生成章节即生效`); };
  ov.addEventListener('click', e=>{
    const del = e.target.closest('.gvt-del');
    if(del){ const n=del.dataset.gvtDel; if(n==='-1'){ del.closest('.gvt-row').remove(); return; } const row=del.closest('.gvt-row'); if(row) row.remove(); }
  });
}

function pushRelTablesHistory(srcType){
  const g = state.outline && state.outline.glossary; if(!g) return;
  g._relTableHistory = Array.isArray(g._relTableHistory) ? g._relTableHistory : [];
  const snap = {
    ts: Date.now(), from: srcType,
    rel: (g._relationshipTable||[]).map(x=>({...x})),
    pc:  (g._placeContacts||[]).map(x=>({...x})),
    prc: (g._properContacts||[]).map(x=>({...x})),
    wr:  (g._worldRules||[]).map(x=>({...x}))
  };
  const last = g._relTableHistory[0];
  if(last && JSON.stringify({r:last.rel,p:last.pc,q:last.prc,w:last.wr}) === JSON.stringify({r:snap.rel,p:snap.pc,q:snap.prc,w:snap.wr})) return;
  g._relTableHistory.unshift(snap);
  if(g._relTableHistory.length > 6) g._relTableHistory.length = 6;
  persist();
}

function openRelTablesHistoryPanel(){
  const g = state.outline && state.outline.glossary; if(!g) return;
  const hist = Array.isArray(g._relTableHistory) ? g._relTableHistory : [];
  if(!hist.length){ toast('暂无4表编辑历史'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const fmtRel = arr=>(arr||[]).map(x=>`<div class="dm-rel"><b>${esc(x.a||'')}</b> ←${esc(x.relation||'？')}→ <b>${esc(x.b||'')}</b>${x.note?` <span class="muted">· ${esc(x.note)}</span>`:''}</div>`).join('')||'<span class="muted">（无）</span>';
  const render = (h)=>{
    const wr=(h.wr||[]).map(x=>`<div class="dm-wr"><b>${esc(x.cat||'')}</b><div>${esc(x.rule||'')}</div></div>`).join('')||'<span class="muted">（无）</span>';
    const pc=(h.pc||[]).map(x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}${x.note?('：'+esc(x.note)):''}</span></div>`).join('')||'<span class="muted">（无）</span>';
    const prc=(h.prc||[]).map(x=>`<div class="dm-rel">${esc(x.from||'')} ↔ ${esc(x.to||'')} <span class="muted">· ${esc(x.relation||'')}${x.note?('：'+esc(x.note)):''}</span></div>`).join('')||'<span class="muted">（无）</span>';
    const srcName = h.from==='rel'?'人物关系表':h.from==='pc'?'地名关联表':h.from==='prc'?'专名关联表':(h.from==='wr'?'世界观规则':'手动编辑');
    return `<div class="dm-prev-meta">${fmtTs(h.ts)} · ${esc(srcName)} · 关系表 ${(h.rel||[]).length} · 地名 ${(h.pc||[]).length} · 专名 ${(h.prc||[]).length} · 规则 ${(h.wr||[]).length} 条</div>
      <div class="dm-tables">
        <details class="dm-fold"><summary>👥 人物关系表（${(h.rel||[]).length}）</summary><div class="dm-rel-table">${fmtRel(h.rel)}</div></details>
        <details class="dm-fold"><summary>🗺️ 地名关联表（${(h.pc||[]).length}）</summary><div class="dm-rel-table">${pc}</div></details>
        <details class="dm-fold"><summary>📌 专名关联表（${(h.prc||[]).length}）</summary><div class="dm-rel-table">${prc}</div></details>
        <details class="dm-fold"><summary>⚙️ 世界观规则（${(h.wr||[]).length}）</summary><div class="dm-rel-table">${wr}</div></details>
      </div>
      <button type="button" class="btn gvt-restore" data-gvt-restore="${hist.indexOf(h)}">↩️ 一键还原到此版本</button>`;
  };
  const ov = document.createElement('div'); ov.className='gs-overlay';
  const idx0 = 0;
  ov.innerHTML = `<div class="gs-modal gs-view-modal gvt-hist-modal">
    <div class="gs-modal-head"><b>🕘 4表历史（${hist.length}/6）</b><button class="gs-x" data-gvth-close>✕</button></div>
    <div class="cv-body" style="max-height:62vh;overflow:auto"><div id="gvthBody" style="display:flex;flex-direction:column;gap:14px">${hist.map((h,i)=>`<div class="gvt-hist-item" data-gvt-item="${i}">${render(h)}</div>`).join('')}</div></div>
    <div class="muted" style="padding:8px 14px">点「还原」会把所选版本的 4 表整体覆盖到当前词典（含重新生成章节时立即生效）。</div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-gvth-close]').onclick = ()=> ov.remove();
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
  ov.addEventListener('click', e=>{
    const r = e.target.closest('[data-gvt-restore]');
    if(!r) return;
    const i = +r.dataset.gvtRestore; const h = hist[i]; if(!h) return;
    g._relationshipTable = (h.rel||[]).map(x=>({...x}));
    g._placeContacts   = (h.pc||[]).map(x=>({...x}));
    g._properContacts  = (h.prc||[]).map(x=>({...x}));
    g._worldRules      = (h.wr||[]).map(x=>({...x}));
    persist(); ov.remove(); toast('已还原 4 表到该历史版本，重新生成章节即生效');
  });
}

function gsPushUndo(){
  const g = state.outline && state.outline.glossary;
  if(g) gsUndoStack.push(JSON.stringify(g));
  if(gsUndoStack.length > GS_UNDO_MAX) gsUndoStack.shift();
}

function glossaryHistoryPush(desc){
  const g = state.outline && state.outline.glossary;
  if(!g) return;
  const h = Array.isArray(g._history) ? g._history : (g._history = []);
  h.push({ ts: Date.now(), desc: desc || '修改词典', snapshot: JSON.stringify({characters:g.characters||[], places:g.places||[], propernouns:g.propernouns||[], subplots:g.subplots||[]}) });
  if(h.length > 30) h.splice(0, h.length - 30);
  persist();
}

function renderGlossaryHistory(){
  const list = $('#gsHistoryList');
  if(!list) return;
  const g = state.outline && state.outline.glossary;
  const h = Array.isArray(g && g._history) ? g._history : [];
  if(!h.length){ list.innerHTML = '<p class="muted">暂无历史更改记录。修改词典后会自动记录。</p>'; return; }
  list.innerHTML = h.slice().reverse().map((r,i)=>{
    const idx = h.length - 1 - i;               // 正序索引
    const d = new Date(r.ts);
    const pad = n => n<10?('0'+n):n;
    const t = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    return `<div class="gs-hist-row" data-gs-hist="${idx}">
      <span class="gs-hist-ts">回退到第 ${h.length-idx} 次 · ${t}</span>
      <span class="gs-hist-desc">${esc(r.desc||'')}</span>
      <span class="gs-hist-actions">
        <button type="button" class="btn ghost gs-tool" data-gs-hist-view="${idx}">查看</button>
        <button type="button" class="btn ghost gs-tool" data-gs-hist-restore="${idx}">还原</button>
      </span>
    </div>`;
  }).join('');
  list.querySelectorAll('[data-gs-hist-view]').forEach(b=>{
    b.onclick = ()=>{ try{ applyGlossaryHistorySnapshot(+b.dataset.gsHistView); }catch(e){} };
  });
  list.querySelectorAll('[data-gs-hist-restore]').forEach(b=>{
    b.onclick = ()=>{ applyGlossaryHistorySnapshot(+b.dataset.gsHistRestore); glossaryHistoryPush('还原到历史版本'); };
  });
}

function applyGlossaryHistorySnapshot(idx){
  const g = state.outline && state.outline.glossary;
  const h = Array.isArray(g && g._history) ? g._history : [];
  const r = h[idx]; if(!r) return;
  let snap; try{ snap = JSON.parse(r.snapshot); }catch(e){ return; }
  if(!snap) return;
  g.characters = snap.characters || [];
  g.places = snap.places || [];
  g.propernouns = snap.propernouns || [];
  g.subplots = snap.subplots || [];
  persist();
  const panel = $('#gsHistory'); if(panel) panel.hidden = true;
  if(typeof renderGlossaryOnly === 'function') renderGlossaryOnly(); else render();
  toast('已应用所选历史版本');
}

function exportGlossaryJson(){
  const src = state.pendingGlossary || (state.outline && state.outline.glossary);
  if(!src || (!sourceHasGlossary(src))){ toast('当前没有可导出的词典'); return; }
  const title = (state.outline && state.outline.title) || (state.idea ? state.idea.trim().slice(0,12) : 'story');
  const meta = { _meta:{ title, source:'storyfactory', version:'2.0', exportedAt: new Date().toISOString(), adherence: state.glossAdherence } };
  download(`词典_${title}.json`, JSON.stringify({ ...meta, ...src }, null, 2));
  toast('已导出词典 JSON（含元数据头）');
}

function sourceHasGlossary(g){
  return g && ((g.characters&&g.characters.length)||(g.places&&g.places.length)||(g.propernouns&&g.propernouns.length)||(g.subplots&&g.subplots.length));
}

function glossaryMerge(imported, modelOut, adherence, allowFill){
  const cat = ['characters','places','propernouns'];
  const res = { glossary:{characters:[],places:[],propernouns:[],subplots:[]}, kept:0, added:0, rec:0 };
  const a = (typeof adherence==='number') ? adherence : 100;
  cat.forEach(k=>{
    const imp = (imported&&imported[k])||[];
    const mdl = (modelOut&&modelOut[k])||[];
    const impBy = {};
    imp.forEach(it=>{ const nm=String(it.name||'').trim(); if(nm) impBy[nm]=it; });
    const has = it=>String(it.name||'').trim();
    const tagFlag = it => {
      if(k !== 'characters' || !it) return it;
      if(it._userName){ delete it._nameFlag; return it; }
      const nv = nmNameRuleViolation(String(it.name||'').trim());
      if(nv) it._nameFlag = nv; else delete it._nameFlag;
      return it;
    };
    const out = res.glossary[k];
    if(a < 30){                                       // 几乎放弃：完全采用模型输出
      mdl.forEach(it=>{ if(has(it)){ out.push(tagFlag(it)); res.added++; } });
      return;
    }
    if(a < 50){                                       // 灵感来源：模型为主，仅补同名导入详情
      mdl.forEach(it=>{
        const nm = has(it); if(!nm) return;
        if(impBy[nm]){ out.push(tagFlag(impBy[nm])); res.kept++; }   // 同名以导入版为准（名+详情）
        else { out.push(tagFlag(it)); res.added++; }
      });
      return;
    }
    imp.forEach(it=>{ if(has(it)){ out.push(tagFlag(it)); res.kept++; } });   // a>=50：导入词典为主体
    mdl.forEach(it=>{
      const nm = has(it); if(!nm) return;
      if(impBy[nm]) return;                                          // 重名：一律保留导入版，丢弃模型版（词典保持唯一）
      if(allowFill || a<80){ out.push(tagFlag(it)); res.added++; }            // 新名：a<80 自动补，a>=80 需「允许补充」才补
    });
  });
  return res;
}

function loadGlib(){
  try{ gglib = JSON.parse(localStorage.getItem(KEY_GLIB)) || []; }catch(e){ gglib = []; }
}

function saveGlib(){ try{ localStorage.setItem(KEY_GLIB, JSON.stringify(gglib)); }catch(e){} }

function glibUse(id){
  const it = gglib.find(x=> x.id === id); if(!it) return;
  state.pendingGlossary = it.g;
  persist(); render();
  closeGlibPanel();
  toast(`已选用词典「${it.name}」挂载到本作，可调遵从度后生成大纲`);
}

function glibSave(){
  const src = state.pendingGlossary || (state.outline && state.outline.glossary);
  if(!src || !sourceHasGlossary(src)){ toast('当前没有可入库的词典'); return; }
  const name = prompt('给这套词典起个名字（如：仙侠传·世界观）', (state.outline&&state.outline.title) || '无题词典');
  if(name === null) return;
  const t = name.trim() || ('词典'+(gglib.length+1));
  if(gglib.some(x=> x.name === t)){ if(!confirm('词典库已有同名「'+t+'」，仍要覆盖保存吗？')) return; gglib = gglib.filter(x=> x.name !== t); }
  gglib.push({ id: 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2,6), name:t, savedAt: Date.now(), g: JSON.parse(JSON.stringify(src)) });
  saveGlib(); openGlibPanel();
  toast('已存入词典库：'+t);
}

function glibDel(id){ gglib = gglib.filter(x=> x.id !== id); saveGlib(); openGlibPanel(); }

function closeGlibPanel(){ const p=$('#glibPanel'); if(p) p.remove(); }

function openGlibPanel(){
  closeGlibPanel();
  const ov = document.createElement('div'); ov.id='glibPanel'; ov.className='gs-overlay';
  const itemsHtml = gglib.length ? gglib.map(x=>{
    const n = x.g; const cn=(n.characters||[]).length, pn=(n.places||[]).length, rn=(n.propernouns||[]).length;
    return `<div class="cv-row">
      <b>${esc(x.name)}</b>
      <span class="cv-cnt">👤${cn} · 📍${pn} · 🔤${rn}</span>
      <span class="cv-actions">
        <button class="cv-b btn" data-glib-use="${x.id}">选用</button>
        <button class="cv-b btn" data-glib-del="${x.id}">删除</button>
      </span>
    </div>`;
  }).join('') : '<p class="muted" style="margin:8px 0">还没有保存过词典。先打开一个新长篇并导入/生成词典，点「存入词典库」即可在此汇集多套世界观。</p>';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🗂️ 词典库</b><button class="gs-x" data-glib-close>✕</button></div>
      <div class="gs-body">
        <p class="muted" style="margin:0 0 8px">跨作品汇集可复用词典。点「选用」即挂载到当前新篇的辅轨槽位，之后设置遵从度、生成大纲即可带入。</p>
        ${itemsHtml}
      </div>
      <div class="gs-actions" style="grid-template-columns:1fr 1fr">
        <button class="btn" data-glib-close>关闭</button>
        <button class="btn primary" data-glib-save>＋ 存入当前词典</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelectorAll('[data-glib-close]').forEach(b=> b.onclick = closeGlibPanel);
  ov.querySelector('[data-glib-save]').onclick = glibSave;
  ov.querySelectorAll('[data-glib-use]').forEach(b=> b.onclick = ()=> glibUse(b.dataset.glibUse));
  ov.querySelectorAll('[data-glib-del]').forEach(b=> b.onclick = ()=>{ if(confirm('从库中删除该词典？不影响已生成作品。')) glibDel(b.dataset.glibDel); });
  ov.addEventListener('click', e=>{ if(e.target===ov) closeGlibPanel(); });
}

function exportWorkGlossaryJSON(id){
  const p = lib.items.find(i=> i.id === id);
  const g = p && p.outline && p.outline.glossary;
  if(!p || !g || !sourceHasGlossary(g)){ toast('该作品暂无可用词典'); return; }
  const meta = { _meta:{ title:p.title||'复用词典', source:'storyfactory', version:'2.0', exportedAt:new Date().toISOString() } };
  download(`词典_${(p.title||'story').slice(0,12)}.json`, JSON.stringify({ ...meta, ...g }, null, 2));
  toast('已导出该作词典 JSON');
}

function normalizeGlossaryJSON(j){
  const src = (j && j._meta) ? j : j;
  const ok = src && typeof src==='object'
    && (Array.isArray(src.characters) || Array.isArray(src.places) || Array.isArray(src.propernouns));
  if(!ok) return null;
  const subs = (Array.isArray(src.subplots)?src.subplots:[]).map(s=>{
    const name = String(s&&s.name||'').trim(); if(!name) return null;
    const st = SUB_STATUSES.includes(s.status) ? s.status : '进行中';
    const log = (Array.isArray(s.log)?s.log:[]).filter(x=>x && Number.isFinite(x.ch)).map(x=>({ch:x.ch, note:String(x.note||'').trim()}));
    return { name, status: st,
      question: String(s.question||'').trim(),
      arc: { from: String((s.arc&&s.arc.from)||'').trim(), to: String((s.arc&&s.arc.to)||'').trim() },
      pivot: String(s.pivot||'').trim(),
      log,
      _lastCh: log.length ? Math.max(...log.map(x=>x.ch)) : 0,
      _auto: !!s._auto };
  }).filter(Boolean);
  return { characters: Array.isArray(src.characters)?src.characters:[], places: Array.isArray(src.places)?src.places:[], propernouns: Array.isArray(src.propernouns)?src.propernouns:[], subplots: subs };
}

function importGlossaryJson(file, target){
  const r = new FileReader();
  r.onload = ()=>{
    try{
      const j = JSON.parse(r.result);
      const g = normalizeGlossaryJSON(j);
      if(!g) throw 0;
      if(!state.outline){ toast('请先生成大纲后再导入词典'); return; }
      if(!state.outline.glossary) state.outline.glossary = {characters:[], places:[], propernouns:[]};
      const cur = state.outline.glossary;
      const CATS = [['characters','人物'],['places','地点'],['propernouns','专名']];
      let hasDup = false;
      CATS.forEach(([k])=>{
        const names = new Set((cur[k]||[]).map(x=>String(x&&x.name||'').trim()).filter(Boolean));
        (g[k]||[]).forEach(it=>{ const nm=String(it&&it.name||'').trim(); if(nm && names.has(nm)) hasDup = true; });
      });
      const overwrite = hasDup && confirm('导入内容与当前词典存在同名条目。\n【确定】同名以导入版覆盖\n【取消】同名保留当前版（只添加我没有的新词条）');
      glossaryHistoryPush('导入词典（合并）前');
      let added=0, kept=0, repl=0;
      const mergeCat = (key)=>{
        const arr = Array.isArray(cur[key]) ? cur[key] : (cur[key] = []);
        const names = new Set(arr.map(x=>String(x&&x.name||'').trim()).filter(Boolean));
        (g[key]||[]).forEach(it=>{
          const nm = String(it&&it.name||'').trim(); if(!nm) return;
          if(names.has(nm)){
            if(overwrite){ const i = arr.findIndex(x=>String(x&&x.name||'').trim()===nm); if(i>=0){ arr[i] = it; repl++; } }
            else kept++;
          } else { arr.push(it); names.add(nm); added++; }
        });
      };
      CATS.forEach(([k])=> mergeCat(k));
      if(Array.isArray(g.subplots) && g.subplots.length) mergeCat('subplots');   // 副线同逻辑（按 name）
      persist(); render();
      toast(`词典已合并导入：新增 ${added} · 同名保留 ${kept} · 同名覆盖 ${repl}`);
    }catch(e){ toast('导入失败：JSON 至少需含 characters/places/propernouns 之一（数组）'); }
  };
  r.readAsText(file);
}

function glossaryAliases(){
  const o = state.outline; const map = new Map();
  if(o && o.glossary) ['characters','places','propernouns'].forEach(k => (o.glossary[k]||[]).forEach(it => {
    const cur = String(it && it.name || '').trim();
    (Array.isArray(it && it._alias) ? it._alias : []).forEach(a => {
      const al = String(a||'').trim();
      if(al && cur && al !== cur && !map.has(al)) map.set(al, cur);
    });
  }));
  return map;
}

function syncNameEverywhere(oldName, newName){
  const o = state.outline; if(!o || !oldName || !newName || oldName === newName) return 0;
  let n = 0;
  const rep = s => { if(s === oldName){ n++; return newName; } return s; };
  if(Array.isArray(o.chapterPlans)) o.chapterPlans.forEach(p => {
    if(!p) return;
    if(Array.isArray(p.requiredEntities)) p.requiredEntities = p.requiredEntities.map(rep);
  });
  if(o.navBeacon && typeof o.navBeacon.protagonist === 'string'){
    const pr = o.navBeacon.protagonist;
    if(pr === oldName){ o.navBeacon.protagonist = newName; n++; }
    else if(pr.indexOf(oldName) === 0 && /^[，,：:（(]/.test(pr.slice(oldName.length))){ o.navBeacon.protagonist = newName + pr.slice(oldName.length); n++; }
  }
  if(o._factCard && o._factCard.characters && o._factCard.characters[oldName] !== undefined){
    o._factCard.characters[newName] = o._factCard.characters[oldName];
    delete o._factCard.characters[oldName];
  }
  return n;
}

function scanGlossaryImpact({type, idx, oldVal, newVal, isName}){
  const g = state.outline.glossary;
  const getArr = t => t==='char'?(g.characters||[]):t==='place'?(g.places||[]):(g.propernouns||[]);
  const arr = getArr(type);
  const entityName = arr[idx] ? arr[idx].name : oldVal;
  const terms = new Set();
  if(isName && oldVal) terms.add(oldVal);      // 改名：扫旧名，找旧章节正文
  else if(entityName) terms.add(entityName);   // 改详情：扫该实体名是否被正文引用
  const hits = state.chapters.map((c,i)=>{
    if(!c || !c.content) return null;
    let n = 0, occurs = 0;
    for(const t of terms){ if(t){ const re = new RegExp(escRe(t), 'g'); const m = String(c.content).match(re); if(m){ n += m.length; occurs++; } } }
    return occurs>0 ? {i, n, title: c.title||('第'+(i+1)+'章')} : null;
  }).filter(Boolean);
  const refs = [];
  const refNames = isName ? [oldVal, newVal] : [entityName];
  ['char','place','proper'].forEach(t=>{
    getArr(t).forEach((it, ii)=>{
      if(t===type && ii===idx) return;
      const tsv = Object.values(it).join(' ');
      for(const rn of refNames){ if(rn && tsv.includes(rn)){ refs.push({t, ii, name: it.name||''}); break; } }
    });
  });
  return {hits, refs, word: isName ? oldVal : entityName};
}

function escRe(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function openGlossaryPanel(info){
  closeGlossaryPanel();
  if(!state.outline || !state.outline.glossary) return;
  const g = state.outline.glossary;
  const getArr = t => t==='char'?(g.characters||[]):t==='place'?(g.places||[]):(g.propernouns||[]);
  const arr = getArr(info.type);
  const itemName = arr[info.idx] ? arr[info.idx].name : '该条目';
  const scan = scanGlossaryImpact(info);
  const hits = scan.hits || [];

  const labels = {name:'名称', identity:'身份', age:'岁数', gender:'性别', appearance:'外貌', hobby:'爱好', mannerism:'小动作/口头禅', catchphrase:'口头禅', relation:'关系', trait:'性格', type:'类型', note:'说明'};
  const kind = info.isName ? `「${info.oldVal||''}」→「${info.newVal||''}」`
    : `「${itemName}」的「${labels[info.key]||info.key||'详情'}」已修改（正文引用该条目 ${scan.word?('出现自 「'+scan.word+'」'):''}）`;
  const hitHtml = hits.length ? hits.map(h=>`
    <label class="gs-hit"><input type="checkbox" class="gs-hit-cb" data-ch="${h.i}" checked />
      <span>第${h.i+1}章 · ${esc(h.title||'')}</span><i>正文出现 ${h.n} 次</i></label>`).join('')
    : `<p class="gs-nohit">✓ 旧名在已生成正文中未出现，无需重塑任何章节。该改动仅对后续新生成章节生效。</p>`;
  const refHtml = scan.refs.length ? `<div class="gs-refs">⚠️ 词典内其它条目仍引用旧名（建议一并核对）：${scan.refs.map(r=>{
    const lab = r.t==='char'?'人物':r.t==='place'?'地点':'专名';
    return `<span class="pill">${lab}「${esc(r.name||'')}」</span>`;
  }).join('')}</div>` : '';

  const names = {char:'人物',place:'地点',proper:'专名'};
  const ov = document.createElement('div');
  ov.id = 'gsPanel';
  ov.className = 'gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📇 词典改动 · 影响范围</b>
        <button class="gs-x" data-gs-close>✕</button></div>
      <p class="gs-modal-sub">检测到你改动了 ${names[info.type]||''}：${kind}</p>
      <div class="gs-body">
        <p class="gs-q"><b>① 会影响的已生成章节（默认全选，可取消个别）：</b></p>
        ${hitHtml}
        ${refHtml}
      </div>
      <div class="gs-actions">
        <button class="btn ghost" data-gs-undo>↩ 回退本次改动</button>
        <button class="btn ghost" data-gs-future>仅对新章生效</button>
        <button class="btn primary" data-gs-regen ${hits.length?'':'disabled'}>⚡ 批量重生成所选章节（${hits.length}）</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-gs-close]').onclick = closeGlossaryPanel;
  ov.querySelector('[data-gs-future]').onclick = ()=>{
    gsUndoStack.pop();   // 已生效，丢弃快照
    closeGlossaryPanel();
    toast('已保存，仅对后续新章生效');
  };
  ov.querySelector('[data-gs-undo]').onclick = ()=>{
    const snap = gsUndoStack.pop();
    if(snap){ try{ state.outline.glossary = JSON.parse(snap); persist(); }catch(e){} }
    closeGlossaryPanel(); renderGlossaryOnly(); toast('已恢复改动前词典');
  };
  const regenBtn = ov.querySelector('[data-gs-regen]');
  if(regenBtn) regenBtn.onclick = ()=>{
    const sel = $$('.gs-hit-cb:checked', ov).map(b=>+b.dataset.ch);
    gsUndoStack.pop();   // 用户已确认批量重生成，丢弃快照（重生成后为新一致性）
    closeGlossaryPanel();
    regenSelectedChapters(sel);
  };
  ov.addEventListener('click', e=>{ if(e.target===ov) closeGlossaryPanel(); });
}

function renderGlossaryOnly(){
  const host = $('#view');
  if(host){ host.innerHTML = viewStory(); bindView(); window.scrollTo({top:100, behavior:'smooth'}); }
}

  const api = {
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
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['glossary-workspace'] = Object.freeze(api);
  return ns['glossary-workspace'];
}
