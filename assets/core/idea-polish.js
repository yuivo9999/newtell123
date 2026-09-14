/* v26: cohesive legacy region extracted from app-legacy.js. */

export function install(deps){
  const {
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

async function polishIdea(btn, force){
  const idea = (state.idea || '').trim();
  if(!idea){
    const kept = Array.isArray(state.polishOptions) && state.polishOptions.length;
    toast(kept ? '输入框为空：请先在上方输入构想，或点某张历史方案卡「✔ 采用此方案」，再点「✨ 优化构想」重新生成' : '请先输入故事构想');
    return;
  }
  const kept = Array.isArray(state.polishOptions) && state.polishOptions.length;
  if(kept && !force){
    if(!confirm(`已有 ${kept} 个保留方案，重新优化将覆盖它们。继续？`)) return;
  }
  const multi = polishMulti || idea.length < 15;   // 极短强制多方案
  if(!canRunAI('idea')){ toast('优化构想暂不可运行'); return; }
  markAIRunning('idea');
  if(btn) busy(btn,true, multi ? '生成多方案构想中…' : '优化构想中…');
  try{
    const txt = await callAIGuarded('idea', { multi }, {temperature: resolveActiveSpec().ideaTemp, maxTokens: clampMaxTokens('polish')});
    const out = String(txt||'').trim();
    if(!out){ toast('优化失败，请重试'); return; }

    showPolishResult(out, multi);
    markAIDone('idea');
    toast('优化完成');
  }catch(e){
    addToFixQueue({kind:'idea', error:e.message});
    toast('优化失败：'+e.message);
  }
  finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='idea');
    if(btn) busy(btn,false);
  }
}

function formatIdeaBrief(b){
  return [
    `题材：${b.genre || ''}`,
    `主角：${b.protagonist || ''}`,
    `核心冲突：${b.coreConflict || ''}`,
    `世界观/规则：${b.worldOrRules || '无'}`,
    `对手/压力：${b.antagonistOrPressure || '无'}`,
    `动机：${b.motivation || ''}`,
    `风格：${b.style || ''}`,
    `读者体验：${b.readerExperience || ''}`
  ].join('\n');
}

function formatIdeaDiagnosis(d){
  if(!d || !Array.isArray(d.missing) || !d.missing.length) return '';
  const qs = (d.questions || []).map(q=>`<li>${esc(q)}</li>`).join('');
  return `<div class="pol-diag" style="margin-bottom:10px;padding:10px;background:var(--warn-bg, #fff8e6);border-radius:6px">
    <b>⚠️ 构想诊断：缺失 ${d.missing.length} 项</b>
    <ul style="margin:6px 0 0;padding-left:18px">${qs}</ul>
  </div>`;
}

function validatePolishOutput(j){
  if(!j || typeof j !== 'object') return '返回不是对象';
  if(!String(j.optimizedIdea||'').trim()) return '缺少 optimizedIdea';
  const b = j.navBeacon;
  if(!b || typeof b !== 'object') return '缺少 navBeacon';
  const required = ['genre','protagonist','coreConflict','tone'];
  for(const k of required) if(!String(b[k]||'').trim()) return `navBeacon 缺少 ${k}`;
  if(!Array.isArray(j.defects) || !j.defects.length) return '缺少缺陷清单 defects';
  if(Array.isArray(j.seedCharacters)){
    for(const c of j.seedCharacters){
      const miss = CHAR_FIELDS.filter(k=> c[k]==null || String(c[k]).trim()==='');
      if(miss.length) return `人物 ${c.name||'?'} 缺少字段：${miss.join('/')}`;
    }
  }
  return '';
}

function splitPolishMultiText(out){
  const t = String(out||'').trim();
  if(!t) return [];
  const DECOR = /[━─—–＿_=＝*＊#＃~〜～\s-]/g;   // 常见装饰/分隔字符（含全半角与空白）
  const cards = [];
  let cur = null;
  t.split('\n').forEach(ln=>{
    const s = String(ln||'').trim();
    let isHead = false, name = '';
    if(s && s.length <= 40){
      const core = s.replace(DECOR, '');
      const m = core.match(/^方案([一二三四五六七八九十\d]{1,2})?(?:[：:、.．,，)）]|$)/);
      if(m){ isHead = true; name = core; }
    }
    if(isHead){
      if(cur) cards.push(cur);
      cur = { name, text: '' };
    } else if(cur){
      cur.text += (cur.text ? '\n' : '') + ln;
    }
  });
  if(cur) cards.push(cur);
  const ok = cards.filter(c=> String(c.text||'').trim());
  if(ok.length < 2) return [];
  return ok.map((c,i)=>({
    name: c.name || ('方案'+(i+1)),
    text: String(c.text||'').trim(),
    _v45: { defects:[], navBeacon:null, seedCharacters:[], seedPlaces:[] }
  }));
}

function showPolishResult(out, multi){
  const box = $('#polishBox'), cards = $('#polishCards');
  if(!box || !cards) return;
  box.style.display = 'block';
  const pickV45 = (o)=> ({
    defects: Array.isArray(o&&o.defects) ? o.defects : [],
    navBeacon: (o && o.navBeacon && typeof o.navBeacon==='object') ? o.navBeacon : null,
    seedCharacters: Array.isArray(o&&o.seedCharacters) ? o.seedCharacters : [],
    seedPlaces: Array.isArray(o&&o.seedPlaces) ? o.seedPlaces : []
  });
  if(multi){
    let j = null;
    if(out && typeof out === 'object'){ j = out; }
    else { try{ j = parseJson(String(out)); }catch(e){ j = {}; } }
    const opts = Array.isArray(j && j.options) ? j.options.filter(o=>o && String(o.optimizedIdea||o.text||'').trim()) : [];
    if(opts.length){
      snapshotPolishBatch('重新优化前');   // 覆盖前把旧整批方案归档为可回退版本（≤5）
      state.polishOptions = opts.map(o=> Object.assign({}, o, {
        text: String(o.optimizedIdea||o.text||'').trim(),
        _v45: pickV45(o)
      }));
      state.polishAdopted = null;   // 新方案列表，尚未采用
      state.polishCollapsed = false;
      persist();
      render(); openPolishBox();
      return;
    }
    if(typeof out === 'string'){
      const segs = splitPolishMultiText(out);
      if(segs.length >= 2){
        snapshotPolishBatch('重新优化前');   // 覆盖前把旧整批方案归档为可回退版本（≤5）
        state.polishOptions = segs;
        state.polishAdopted = null;
        persist();
        render(); openPolishBox();
        return;
      }
    }
    snapshotPolishBatch('重新优化前');
    state.polishOptions = [{ name:'方案1', text: String(typeof out==='object' ? ((out&&out.optimizedIdea)||'') : out).trim(), _v45: pickV45(typeof out==='object'?out:{}) }];
    state.polishAdopted = null;
    state.polishCollapsed = false;
    persist();
    render(); openPolishBox();
    return;
  }
  const single = (out && typeof out === 'object') ? out : { optimizedIdea: String(out||'').trim() };
  snapshotPolishBatch('重新优化前');
  state.polishOptions = [{ name:'方案1', text: String(single.optimizedIdea||single.text||'').trim(), _v45: pickV45(single) }];
  state.polishAdopted = null;
  persist();
  render(); openPolishBox();
}

function applyV45ToOutline(o, d){
  if(!o || !d) return { nC:0, nP:0 };
  if(!o.glossary || typeof o.glossary!=='object') o.glossary = {characters:[],places:[],propernouns:[]};
  const g = o.glossary;
  ['characters','places','propernouns'].forEach(k=>{ if(!Array.isArray(g[k])) g[k]=[]; });
  let nC=0, nP=0;
  (d.seedCharacters||[]).forEach(c=>{
    const nm = String(c&&c.name||'').trim(); if(!nm) return;
    if(g.characters.some(x=>String(x&&x.name||'').trim()===nm)) return;
    g.characters.push({ name:nm, identity:c.identity||'', age:String(c.age==null?'':c.age), gender:c.gender||'', appearance:c.appearance||'', hobby:c.hobby||'', catchphrase:c.catchphrase||'', relation:c.relation||'', trait:c.trait||'' });
    nC++;
  });
  (d.seedPlaces||[]).forEach(p=>{
    const nm = String(p&&p.name||'').trim(); if(!nm) return;
    if(g.places.some(x=>String(x&&x.name||'').trim()===nm)) return;
    g.places.push({ name:nm, type:p.type||'', note:p.note||'' });
    nP++;
  });
  if(d.navBeacon && typeof d.navBeacon==='object'){
    o.navBeacon = d.navBeacon;
  }
  return { nC, nP };
}

function importPolishToState(o){
  const d = (o && o._v45) || {};
  const tone = String((d.navBeacon&&d.navBeacon.tone)||'');
  const toneHit = tone || '';
  if(!state.outline){
    if(d && (d.navBeacon || (d.seedCharacters&&d.seedCharacters.length) || (d.seedPlaces&&d.seedPlaces.length))){
      state.pendingV45 = JSON.parse(JSON.stringify(d));
    }
    persist(); render();
    toast(`设定已暂存${nCh?(' · 章节数已设为 '+n):''}${toneHit?' · 优化构想语气已交给校长评估（不覆盖用户风格）':''}：导航灯塔/种子人物/种子地点将在生成大纲后自动应用`);
    return;
  }
  const r = applyV45ToOutline(state.outline, d);
  persist(); render();
  toast(`已导入设定：导航灯塔${d.navBeacon?1:0} · 种子人物 ${r.nC} · 种子地点 ${r.nP}${nCh?(' · 章节数已设为 '+n):''}${toneHit?' · 优化构想语气已交给校长评估（不覆盖用户风格）':''}`);
}

function openPolishBox(){
  const box = $('#polishBox'), cards = $('#polishCards');
  if(!box || !cards) return;
  state.polishCollapsed = false;
  persist();
  box.style.display = 'block';
  renderPolishCards(cards);
}

function polishIdle(){
  const o = state.outline;
  const hasRealOutline = !!o && (String(o.title||'').trim() || String(o.logline||'').trim() || (Array.isArray(o.chapters)&&o.chapters.length));
  return !hasRealOutline;
}

function extractPolishTitle(text){
  const ln = String(text||'').split('\n').map(s=>s.trim()).find(s=>/^书名\s*[：:]\s*\S/.test(s));
  if(!ln) return '';
  return String(ln.replace(/^书名\s*[：:]\s*/, '')).trim();
}

function renderPolishCards(container){
  if(!container) return;
  const opts = Array.isArray(state.polishOptions) ? state.polishOptions : [];
  if(!opts.length){
    container.style.display = 'block';
    container.innerHTML = `<p class="muted" style="margin:8px 0 0">👆 点「✨ 优化构想」从五个方向（商业/反差/情感/悬疑智斗/轻松日常）中按契合度生成 3~5 个候选方案；点某张卡的「✔ 采用此方案」即选中（不覆盖原始构想），再点「生成大纲」搬入书名 / 简介 / 节拍。</p>`;
    return;
  }
  container.style.display = 'block';
  const adopted = state.polishAdopted;
  container.innerHTML = opts.map((o,i)=>{
    const c = POLISH_PALETTE[i % POLISH_PALETTE.length];
    const name = o.name || ('方案'+(i+1));
    const isAdopted = !!adopted && adopted === name;
    const defects = (o._v45 && Array.isArray(o._v45.defects)) ? o._v45.defects.filter(d=>String(d||'').trim()) : [];
    const hasV45 = !!(o._v45 && (o._v45.navBeacon || (o._v45.seedCharacters&&o._v45.seedCharacters.length) || (o._v45.seedPlaces&&o._v45.seedPlaces.length)));
    const pTitle = extractPolishTitle(o.text);
    const pBody = String(o.text||'').replace(/^\s*书名\s*[：:][^\n]*\n?/, '').trim();   // 书名已置顶，正文去掉首行以免重复
    return `<div class="pol-cand${isAdopted?' on':''}" style="--pc:${c}" data-idx="${i}">
      <div class="pol-cand-head">
        <span class="pol-no" style="background:${c}">${i+1}</span>
        <b class="pol-name" style="color:${c}">${esc(name)}</b>
        ${isAdopted?'<span class="pol-adopted-tag">✔ 已采用</span>':''}
        <span class="pol-cand-actions">
          <button type="button" class="btn small ghost" data-pol-copy="${i}" title="复制此方案">📋 复制</button>
        </span>
      </div>
      ${pTitle?`<div class="pol-cand-title" style="background:${c}">📖 ${esc(pTitle)}</div>`:''}
      <div class="pol-cand-body">${esc(pBody ? pBody : String(o.text||''))}</div>
      ${defects.length?`<div class="pol-cand-body" style="opacity:.85"><b>⚠️ 构想缺陷清单：</b><br>${defects.map(d=>'· '+esc(String(d))).join('<br>')}</div>`:''}
      <div class="pol-cand-foot">
        ${hasV45?`<button type="button" class="btn small ghost" data-pol-import="${i}" title="导入结构化设定（导航灯塔/种子人物/种子地点/建议章节数）">📥 导入设定</button>`:''}
        <button type="button" class="btn small pt-accent" data-pol-use="${i}" style="background:${c}">✔ 采用此方案</button>
      </div>
    </div>`;
  }).join('');
  container.querySelectorAll('[data-pol-use]').forEach(b=>{
    b.onclick = (e)=>{ e.preventDefault();
      const o = (state.polishOptions||[])[+b.dataset.polUse]; if(!o) return;
      if(dictmasterLocked()){ toast('词典达人已产出万物词典，②方案已锁定，不可更换'); return; }
      state.polishAdopted = o.name || null;
      persist(); render();
      toast('已选中：'+(o.name||('方案'+(+b.dataset.polUse+1)))+'（不覆盖原始构想；可点「生成大纲」搬入书名/简介/全书节拍）');
    };
  });
  container.querySelectorAll('[data-pol-import]').forEach(b=>{
    b.onclick = (e)=>{ e.preventDefault();
      const o = (state.polishOptions||[])[+b.dataset.polImport]; if(!o) return;
      importPolishToState(o);
    };
  });
  container.querySelectorAll('[data-pol-copy]').forEach(b=>{
    b.onclick = (e)=>{ e.preventDefault();
      const o = (state.polishOptions||[])[+b.dataset.polCopy]; if(!o) return;
      copyText(o.text||'');
    };
  });
}

function bindPolishIdea(){
  const b = $('#btnPolishIdea');
  if(b) b.onclick = ()=> polishIdea(b);
  const chk = $('#chkPolishMulti');
  if(chk){
    const sync = ()=>{
      const short = (state.idea||'').trim().length < 15;
      chk.checked = polishMulti || short;
      chk.disabled = short;
    };
    sync();
    chk.onchange = ()=>{ polishMulti = chk.checked; };
    const idea = $('#ideaInput');
    if(idea) idea.oninput = ()=>{ state.idea = idea.value; sync(); syncOrigIdeaCard(); };
  }
  const disc = $('#btnPolishDiscard');
  if(disc) disc.onclick = ()=>{
    const box = $('#polishBox');
    if(box) box.style.display = 'none';
  };
  const hist = $('[data-pol-keep-hist]');
  if(hist) hist.onclick = (e)=>{ e.stopPropagation(); openPolishBatchPanel(); };
  const view = $('[data-pol-keep-view]');
  if(view) view.onclick = (e)=>{ e.stopPropagation(); openPolishBox(); };
  const again = $('[data-pol-keep-again]');
  if(again) again.onclick = (e)=>{ e.stopPropagation(); polishIdea($('#btnPolishIdea'), true); };
  const clear = $('[data-pol-keep-clear]');
  if(clear) clear.onclick = (e)=>{
    e.stopPropagation();
    if(!confirm('清除全部保留方案？')) return;
    snapshotPolishBatch('清除前');   // 归档当前批，之后仍可在「优化版本」找回
    delete state.polishOptions;
    delete state.polishAdopted;
    persist(); render();
    toast('已清除保留方案');
  };
}

function polishKeepBar(){
  const opts = Array.isArray(state.polishOptions) ? state.polishOptions : [];
  if(!opts.length) return '';
  const cur = state.polishAdopted || opts[0].name || '方案A';
  return `<div class="pol-keep">
    <span class="pol-keep-t">已保留 ${opts.length} 个优化方案（当前采用：${esc(cur)}）</span>
    <span class="pol-keep-btns">
      ${(state.polishHistory&&state.polishHistory.length)?`<button type="button" class="btn small ghost" data-pol-keep-hist>📚 优化版本(${state.polishHistory.length}/50)</button>`:''}
      <button type="button" class="btn small ghost" data-pol-keep-view>🔍 查看全部</button>
      <button type="button" class="btn small ghost" data-pol-keep-again>✨ 重新优化</button>
      <button type="button" class="btn small ghost" data-pol-keep-clear>✕ 清除</button>
    </span>
  </div>`;
}

function polishHistory(){ return Array.isArray(state.polishHistory) ? state.polishHistory : []; }

function snapshotPolishBatch(label){
  const opts = Array.isArray(state.polishOptions) ? state.polishOptions : [];
  if(!opts.length) return;
  const snap = { options: opts.map(o=>({ name:o.name, text:String(o.text||'') })), adopted: state.polishAdopted||null };
  const hist = state.polishHistory = state.polishHistory || [];
  if(hist.length &&
      JSON.stringify(hist[0].options) === JSON.stringify(snap.options) &&
      hist[0].adopted === snap.adopted) return;
  hist.unshift({ ts: Date.now(), label: label||'快照', options: snap.options, adopted: snap.adopted });
  if(hist.length > 50) hist.length = 50;
  persist();
}

function applyPolishBatch(idx){
  const hist = polishHistory(); const b = hist[idx]; if(!b || !Array.isArray(b.options) || !b.options.length) return;
  if(!confirm(`整批应用「${idx+1}. ${b.label||'优化版本'}」（共 ${b.options.length} 个方案）？将覆盖当前保留的方案。`)) return;
  snapshotPolishBatch('切换前');
  state.polishOptions = b.options.map(o=>({ name:o.name, text:String(o.text||'') }));
  state.polishAdopted = (b.adopted && b.options.some(o=>o.name===b.adopted)) ? b.adopted : null;
  persist(); closePolishBatchPanel(); render();
  const box = $('#polishBox'); if(box){ box.style.display='block'; openPolishBox(); }
  toast(`已整批应用该优化版本（${state.polishOptions.length} 个方案）`);
}

function deletePolishBatch(idx){
  const hist = polishHistory(); if(!hist.length) return;
  hist.splice(idx,1);
  if(!hist.length) delete state.polishHistory; else state.polishHistory = hist;
  persist(); closePolishBatchPanel(); openPolishBatchPanel();
  toast('已删除该版本');
}

function openPolishBatchPanel(){
  closePolishBatchPanel();
  const hist = polishHistory(); if(!hist.length){ toast('暂无历史优化版本，运行「✨ 优化构想」后自动记录'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const rows = hist.map((b,idx)=>`
    <div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0">
        <div class="cv-time">${idx+1}. ${esc(b.label||'优化版本')} · ${fmtTs(b.ts)} · ${(b.options||[]).length} 方案</div>
        <div class="cv-t" style="font-size:12px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((b.options||[]).slice(0,3).map(o=>o.name).join(' / '))||'（空）'}</div>
      </div>
      <div class="cv-actions" style="display:flex;gap:6px;flex-shrink:0">
        <button type="button" class="btn ghost cv-b" data-polb-view="${idx}">👁 切换</button>
        <button type="button" class="btn primary cv-b" data-polb-apply="${idx}">应用</button>
        <button type="button" class="btn ghost cv-b" data-polb-del="${idx}">🗑</button>
      </div>
    </div>`).join('');
  const ov = document.createElement('div'); ov.id='polbPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>💾 优化构想 · 批量版本（${hist.length}/50）</b>
        <button class="gs-x" data-polb-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-div">每次优化自动归档快照，支持预览与回退。</div>
        ${rows}
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-polb-close]').onclick = closePolishBatchPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closePolishBatchPanel(); });
  ov.querySelectorAll('[data-polb-view]').forEach(b=> b.onclick = ()=> openPolishBatchPreview(+b.dataset.polbView));
  ov.querySelectorAll('[data-polb-apply]').forEach(b=> b.onclick = ()=> applyPolishBatch(+b.dataset.polbApply));
  ov.querySelectorAll('[data-polb-del]').forEach(b=> b.onclick = ()=> deletePolishBatch(+b.dataset.polbDel));
}

function closePolishBatchPanel(){ const p=$('#polbPanel'); if(p) p.remove(); }

function openPolishBatchPreview(idx){
  closePolishBatchPreview();
  const hist = polishHistory(); const b = hist[idx]; if(!b) return;
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const list = (b.options||[]).map(o=>`<div class="cv-row"><div class="cv-t" style="font-size:12px"><b>${esc(o.name||'')}</b><br>${esc(String(o.text||'').slice(0,120))}${(o.text||'').length>120?'…':''}</div></div>`).join('') || '<p class="muted">（空批）</p>';
  const ov = document.createElement('div'); ov.id='polbPreview'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>👁 优化版本切换 · ${esc(b.label||'优化版本')}（${fmtTs(b.ts)} · ${(b.options||[]).length} 方案）</b>
        <button class="gs-x" data-polbp-close>✕</button></div>
      <div class="cv-body"><div style="max-height:60vh;overflow:auto">${list}</div></div>
      <div class="modal-actions" style="padding:12px 16px;border-top:1px solid var(--line)">
        <button type="button" class="btn ghost cv-b" data-polbp-close2>取消</button>
        <button type="button" class="btn primary cv-b" data-polbp-apply>✔ 应用此版本</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-polbp-close]').onclick = closePolishBatchPreview;
  ov.querySelector('[data-polbp-close2]').onclick = closePolishBatchPreview;
  ov.addEventListener('click', e=>{ if(e.target===ov) closePolishBatchPreview(); });
  ov.querySelector('[data-polbp-apply]').onclick = ()=> applyPolishBatch(idx);
}

  const api = {
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
    openPolishBatchPreview
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['idea-polish'] = Object.freeze(api);
  return ns['idea-polish'];
}
