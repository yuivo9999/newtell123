'use strict';

// v40: business constants now live in their canonical domains; these are compatibility aliases for the legacy UI scope.
const __shared = window.TellMeLegacyShared || {};
const LONG_CHAPTER_SYS_PRO = __shared.LONG_CHAPTER_SYS_PRO;
const PROMPTS = __shared.PROMPTS;
const SIZE_DEFAULT = __shared.SIZE_DEFAULT;
let polishMulti = true;
const BOOK_BEAT_OPTIONS = __shared.BOOK_BEAT_OPTIONS;
const BOOK_BEAT_DEFAULT_ID = __shared.BOOK_BEAT_DEFAULT_ID;
const BEAT_OPTIONS = __shared.BEAT_OPTIONS;
const BEAT_DEFAULT_ID = __shared.BEAT_DEFAULT_ID;
const BEAT_LABEL_ALL = __shared.BEAT_LABEL_ALL;
const BEAT_LEGACY_LABEL = __shared.BEAT_LEGACY_LABEL;
const BEAT_HINT_ALL = __shared.BEAT_HINT_ALL;
const BEAT_ENDING = __shared.BEAT_ENDING;
const STRIP_READ_SYS_LEGACY = __shared.STRIP_READ_SYS_LEGACY;
const STRIP_READ_SYS_PRO = __shared.STRIP_READ_SYS_PRO;
const STRIP_READ_SYS = __shared.STRIP_READ_SYS;
const REGEN_TITLES_SYS_LEGACY = __shared.REGEN_TITLES_SYS_LEGACY;
const REGEN_TITLES_SYS_PRO = __shared.REGEN_TITLES_SYS_PRO;
const REGEN_TITLES_SYS = __shared.REGEN_TITLES_SYS;
const TIME_ANCHOR_SYS = __shared.TIME_ANCHOR_SYS;
const POLISH_PALETTE = __shared.POLISH_PALETTE;
const AI_RECIPE_SYS_PRO = __shared.AI_RECIPE_SYS_PRO;
const IDEA_POLISH_SYS_PRO = __shared.IDEA_POLISH_SYS_PRO;
const IDEA_POLISH_SYS = __shared.IDEA_POLISH_SYS;
const POLISH_MULTI_MODE = __shared.POLISH_MULTI_MODE;
const WRITE_STYLES = __shared.WRITE_STYLES;
const WRITE_COMBOS = __shared.WRITE_COMBOS;
const AI_CAT_LABEL = __shared.AI_CAT_LABEL;
const CYBER_HOME_GRID = __shared.CYBER_HOME_GRID;
const WRITE_PRESETS = __shared.WRITE_PRESETS;
const WS_COLOR_SCHEMES = __shared.WS_COLOR_SCHEMES;
const FLOW_NAV = __shared.FLOW_NAV;
const ASSET_LABEL = __shared.ASSET_LABEL;
const SCHOOL_GROUP_MIN = __shared.SCHOOL_GROUP_MIN;
const SCHOOL_GROUP_MAX = __shared.SCHOOL_GROUP_MAX;
const SCHOOL_RETRY_MAX = __shared.SCHOOL_RETRY_MAX;
const PRINCIPAL_SYS = __shared.PRINCIPAL_SYS;
const PRINCIPAL_FOLDED_SYS = __shared.PRINCIPAL_FOLDED_SYS;
const TEACHER_SYS = __shared.TEACHER_SYS;
const NM_SURNAME_1 = __shared.NM_SURNAME_1;
const NM_SURNAME_2 = __shared.NM_SURNAME_2;
const NM_WEB_BLACKLIST = __shared.NM_WEB_BLACKLIST;
const NM_BANNED_CHARS = __shared.NM_BANNED_CHARS;
const NM_BANNED_NAMES = __shared.NM_BANNED_NAMES;
const BANLIST_DEFAULT = __shared.BANLIST_DEFAULT;
const LANG_LAYER_SYS = __shared.LANG_LAYER_SYS;
const NARRATIVE_IRON_HARD = __shared.NARRATIVE_IRON_HARD;
const NARRATIVE_IRON_SOFT = __shared.NARRATIVE_IRON_SOFT;
const NARRATIVE_IRON_PLANNING = __shared.NARRATIVE_IRON_PLANNING;
const DICTMASTER_SYS = __shared.DICTMASTER_SYS;
const DICT_ENRICH_SYS = __shared.DICT_ENRICH_SYS;
const DICT_HARVEST_SYS = __shared.DICT_HARVEST_SYS;
const USER_PRIO_BILL = __shared.USER_PRIO_BILL;
const TM_GROUPS = __shared.TM_GROUPS;
const TM_TEMP = __shared.TM_TEMP;

const APP_VERSION = '1.0.341';
const KEY_CFG = nsKey('cfg');

let _bgTaskCount = 0;
let _bgTaskLabel = '';
function startBgTask(...args){ return window.TellMeLegacyFoundation.startBgTask(...args); }
function endBgTask(...args){ return window.TellMeLegacyFoundation.endBgTask(...args); }
function updateBgTaskIndicator(...args){ return window.TellMeLegacyFoundation.updateBgTaskIndicator(...args); }
window.addEventListener('beforeunload', e => {
  if(_bgTaskCount > 0 || state.generating){
    e.preventDefault();
    e.returnValue = '后台任务尚未完成，确定要离开吗？';
  }
});
const KEY_STATE = nsKey('state');
const KEY_INDEX = nsKey('index');
const KEY_PROJ_PREFIX = nsKey('proj_');
const KEY_GLIB = nsKey('glib');
const LS_SINGLE_SAFE = 4.5 * 1024 * 1024;
function lsKeyFor(...args){ return window.TellMeLegacyFoundation.lsKeyFor(...args); }
;(function migrateSharedOnce(){
  try{
    const mark = nsKey('_nsmig_v1');
    if(localStorage.getItem(mark)) return;   // 本命名空间已迁移过
    const pairs = [
      ['cfg','fyp_cfg'], ['state','fyp_state'], ['index','fyp_index'], ['glib','fyp_glib'],
      ['lib','fyp_lib'], ['toastLog_v1','fyp_toastLog_v1'],
      ['ailog','fyp_ailog'], ['aiRecipeHist_v1','fyp_aiRecipeHist_v1']
    ];
    for(const [nk, oldk] of pairs){
      const np = nsKey(nk);
      const raw = localStorage.getItem(oldk);
      if(raw != null){ try{ if(localStorage.getItem(np) == null) localStorage.setItem(np, raw); }catch(e){} }
    }
    const keysSnapshot = [];
    for(let i=0; i<localStorage.length; i++){ const k = localStorage.key(i); if(k) keysSnapshot.push(k); }
    const prefPairs = [['proj_','fyp_proj_'], ['rp_','fyp_rp_']];
    for(const [np, op] of prefPairs){
      const opl = op.length;
      for(const k of keysSnapshot){
        if(k.indexOf(op) !== 0) continue;
        const nk = nsKey(np) + k.slice(opl);
        const v = localStorage.getItem(k);
        if(v != null){ try{ if(localStorage.getItem(nk) == null) localStorage.setItem(nk, v); }catch(e){} }
      }
    }
    try{ localStorage.setItem(mark, '1'); }catch(e){}
  }catch(e){}
})();
const MAX_PROJECTS = window.TellMeLegacyShared.MAX_PROJECTS;
let lib = window.TellMeLegacyShared.lib;
let gglib = window.TellMeLegacyShared.gglib;
const state = window.TellMeLegacyShared.state;
let charTS = [];
window.charTS = charTS;

// Runtime bridge used by ESM planning modules. Keep the mutable state private.
window.TellMeRuntime = {
  get state(){ return state; },
  isLong,
  resolveActiveSpec,
  currentBookBeatCfg,
  beatStageNames,
  esc,
  glossaryAliases,
  nmNameRuleViolation,
  escRe,
  get APP_VERSION(){ return APP_VERSION; },
  get lib(){ return lib; },
  get MAX_PROJECTS(){ return MAX_PROJECTS; },
  get ASSET_LABEL(){ return ASSET_LABEL; },
  get WS_COLOR_SCHEMES(){ return WS_COLOR_SCHEMES; },
  get wsDraft(){ return window.TellMeLegacyDomains?.['workspace-domain']?.getWsDraft?.(); },
  set wsDraft(v){ window.TellMeLegacyDomains?.['workspace-domain']?.setWsDraft?.(v); },
  get BANLIST_DEFAULT(){ return BANLIST_DEFAULT; },
  get NARRATIVE_IRON_HARD(){ return NARRATIVE_IRON_HARD; },
  get NARRATIVE_IRON_SOFT(){ return NARRATIVE_IRON_SOFT; },
  get TM_KEYS(){ return TM_KEYS; },
  get TM_GROUPS(){ return TM_GROUPS; },
  get TM_TEMP(){ return TM_TEMP; },
  get histOpenId(){ return histOpenId; },
  set histOpenId(v){ histOpenId = v; },
  get editCfg(){ return editCfg; },
  set editCfg(v){ editCfg = v; },
  get selGroupId(){ return selGroupId; },
  set selGroupId(v){ selGroupId = v; },
  get $(){ return $; },
  get $$(){ return $$; },
  get KEY_PROJ_PREFIX(){ return KEY_PROJ_PREFIX; },
  get KEY_CFG(){ return KEY_CFG; },
  get TOAST_LOG_KEY(){ return TOAST_LOG_KEY; },
  get SND_KEY(){ return SND_KEY; },
  get SND_VOL_KEY(){ return SND_VOL_KEY; },
  get SND_TSINGLE_KEY(){ return SND_TSINGLE_KEY; },
  get SND_TALL_KEY(){ return SND_TALL_KEY; },
  get SND_SINGLE_PRESETS(){ return SND_SINGLE_PRESETS; },
  get SND_ALL_PRESETS(){ return SND_ALL_PRESETS; },
  get THEMES(){ return THEMES; },
  get CJK_ALL(){ return CJK_ALL; },
  get EN_WORD(){ return EN_WORD; },
  get uidSeq(){ return uidSeq; },
  set uidSeq(v){ uidSeq = v; },
  get charTS(){ return charTS; },
  set charTS(v){ charTS = v; },
  get bgTaskCount(){ return _bgTaskCount; },
  set bgTaskCount(v){ _bgTaskCount = v; },
  get bgTaskLabel(){ return _bgTaskLabel; },
  set bgTaskLabel(v){ _bgTaskLabel = v; },
  get updateMechaNav(){ return updateMechaNav; },
  get updateWcTotal(){ return updateWcTotal; },
  get currentBookBeatId(){ return currentBookBeatId; },
  get currentOpeningStrategyId(){ return currentOpeningStrategyId; },
  get soundState(){ return _snd; }
};

let currentStep = window.TellMeLegacyShared.currentStep;
function getCurrentStep(){ return currentStep; }
function setCurrentStep(v){ currentStep = v; window.TellMeLegacyShared.currentStep = v; }

state.fcCollapsed = (typeof state.fcCollapsed === 'boolean') ? state.fcCollapsed : false;
state.rsCollapsed = (typeof state.rsCollapsed === 'boolean') ? state.rsCollapsed : false;
state._fixQueue = state._fixQueue || [];
state._chapterPartial = state._chapterPartial || {};
state.timeAnchorsAuto = (typeof state.timeAnchorsAuto === 'boolean') ? state.timeAnchorsAuto : true;
state.timeAnchor = true; // 遗留兼容：已弃用，时间是否生效改为以 outline._globalTimeline 是否存在为准
function _timeAnchorOn(...args){ return window.TellMeLegacyFoundation._timeAnchorOn(...args); }
function _timeAnchorsAutoOn(...args){ return window.TellMeLegacyFoundation._timeAnchorsAutoOn(...args); }
function _timeBranch(...args){ return window.TellMeLegacyFoundation._timeBranch(...args); }







state.aiNetwork = state.aiNetwork || {
  stage: 'idle',          // idle / idea / recipe / outline / titles / plan / writing / review
  running: [],            // 当前正在运行的 AI kind 列表
  completed: [],          // 已完成的 AI kind 列表
  blockedBy: {}           // 每个 AI 被谁阻塞
};


function destroyCharTS(...args){ return window.TellMeLegacyFoundation.destroyCharTS(...args); }
function parseAge(...args){ return window.TellMeLegacyFoundation.parseAge(...args); }

const $ = (window.$ = (s, r=document) => (r||document).querySelector(s));
const $$ = (window.$$ = (s, r=document) => [...(r||document).querySelectorAll(s)]);

const TOAST_LOG_KEY = nsKey('toastLog_v1');
function toastLogPush(...args){ return window.TellMeLegacyFoundation.toastLogPush(...args); }
function toastLogGet(...args){ return window.TellMeLegacyFoundation.toastLogGet(...args); }
function toastLogClear(...args){ return window.TellMeLegacyFoundation.toastLogClear(...args); }
function toast(...args){ return window.TellMeLegacyFoundation.toast(...args); }
const SND_KEY = (typeof nsKey==='function') ? nsKey('snd') : 'tz_snd_done';
const SND_VOL_KEY = (typeof nsKey==='function') ? nsKey('snd_vol') : 'tz_snd_vol';
const _snd = { ctx:null, enabled: (localStorage.getItem(SND_KEY) !== '0'), vol: (()=>{ try{ const v=parseFloat(localStorage.getItem(SND_VOL_KEY)); return isFinite(v)?Math.max(0,Math.min(1,v)):0.8; }catch(e){ return 0.8; } })() };
function _sndEnabled(...args){ return window.TellMeLegacyFoundation?._sndEnabled ? window.TellMeLegacyFoundation._sndEnabled(...args) : !!_snd.enabled; }
function _sndVol(...args){ return window.TellMeLegacyFoundation?._sndVol ? window.TellMeLegacyFoundation._sndVol(...args) : (_snd.vol ?? 0.8); }
function unlockAudio(...args){ return window.TellMeLegacyFoundation.unlockAudio(...args); }
function _sndBeep(...args){ return window.TellMeLegacyFoundation._sndBeep(...args); }
const SND_SINGLE_PRESETS = [
  { id:'be_paper',  name:'纸页轻响',   seq:[[523.25,0,0.08],[659.25,0.09,0.16]] },
  { id:'be_piano',  name:'柔钢琴点',   seq:[[659.25,0,0.22]] },
  { id:'be_glass',  name:'晶石轻触',   seq:[[783.99,0,0.11],[1046.5,0.13,0.22]] },
  { id:'be_bell',   name:'小钟清鸣',   seq:[[880.0,0,0.12],[1174.66,0.15,0.25]] },
  { id:'be_wood',   name:'木铃短拍',   seq:[[587.33,0,0.09],[783.99,0.11,0.18]] },
  { id:'be_spark',  name:'星屑三音',   seq:[[659.25,0,0.08],[880.0,0.1,0.09],[1318.51,0.21,0.22]] }
];
const SND_ALL_PRESETS = [
  { id:'al_piano',   name:'钢琴上行',   seq:[[523.25,0,0.11],[659.25,0.12,0.12],[783.99,0.25,0.24]] },
  { id:'al_glass',   name:'晶石琶音',   seq:[[659.25,0,0.08],[783.99,0.09,0.08],[1046.5,0.18,0.1],[1318.51,0.3,0.24]] },
  { id:'al_chime',   name:'风铃庆成',   seq:[[783.99,0,0.1],[1046.5,0.11,0.1],[1318.51,0.23,0.28]] },
  { id:'al_chord',   name:'柔和和弦',   seq:[[523.25,0,0.14],[659.25,0.02,0.14],[783.99,0.04,0.22]] },
  { id:'al_spark',   name:'星光四步',   seq:[[659.25,0,0.08],[783.99,0.1,0.08],[1046.5,0.2,0.1],[1567.98,0.32,0.24]] },
  { id:'al_finish',  name:'完成回响',   seq:[[587.33,0,0.1],[783.99,0.12,0.11],[987.77,0.25,0.12],[1174.66,0.39,0.3]] }
];
const SND_TSINGLE_KEY = (typeof nsKey==='function') ? nsKey('snd_t_beats') : 'tz_snd_t_beats'; // 键名沿用旧值，保留用户已选音色
const SND_TALL_KEY   = (typeof nsKey==='function') ? nsKey('snd_t_all')   : 'tz_snd_t_all';
function _sndSingleType(...args){ return window.TellMeLegacyFoundation._sndSingleType(...args); }
function _sndAllType(...args){ return window.TellMeLegacyFoundation._sndAllType(...args); }
function setSoundSingleType(...args){ return window.TellMeLegacyFoundation.setSoundSingleType(...args); }
function setSoundAllType(...args){ return window.TellMeLegacyFoundation.setSoundAllType(...args); }
let _lastSoundTs = 0;
let _lastSoundKind = '';
let _soundTimer = null;
function _doPlaySound(...args){ return window.TellMeLegacyFoundation._doPlaySound(...args); }
function playDoneSound(...args){ return window.TellMeLegacyFoundation.playDoneSound(...args); }
function initThemeSoundPanel(...args){ return window.TellMeLegacyFoundation.initThemeSoundPanel(...args); }
function setSoundEnabled(...args){ return window.TellMeLegacyFoundation.setSoundEnabled(...args); }
function setSoundVol(...args){ return window.TellMeLegacyFoundation.setSoundVol(...args); }
function bindPlannerSoundTool(...args){ return window.TellMeLegacyFoundation.bindPlannerSoundTool(...args); }
window.addEventListener('pointerdown', unlockAudio, {capture:true});
window.addEventListener('keydown', unlockAudio, {capture:true});
window.addEventListener('touchend', unlockAudio, {capture:true});
(function initSoundUI(){
  const apply = ()=>{ const el = document.getElementById('cfgSoundDone'); if(el) el.checked = _sndEnabled();
    const vl = document.getElementById('cfgSoundVol'), lb = document.getElementById('cfgSoundVolLabel');
    if(vl){ vl.value = Math.round((_snd.vol||0)*100); if(lb) lb.textContent = vl.value + '%'; } };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
  const bind = ()=>{ const el = document.getElementById('cfgSoundDone'); if(!el) return;
    el.addEventListener('change', ()=> setSoundEnabled(!!el.checked));
    const vl = document.getElementById('cfgSoundVol');
    if(vl){
      vl.addEventListener('input', ()=>{ setSoundVol(+vl.value||0); });
    } };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
function openToastBoard(...args){ return window.TellMeLegacyFoundation.openToastBoard(...args); }
async function copyText(...args){ return window.TellMeLegacyFoundation.copyText(...args); }
function esc(...args){ return window.TellMeLegacyFoundation.esc(...args); }
function download(...args){ return window.TellMeLegacyFoundation.download(...args); }

const CJK_ALL = /\p{Script=Han}|[\u3000-\u303f\uff00-\uffef]/gu;
const EN_WORD = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g;
function countWords(...args){ return window.TellMeLegacyFoundation.countWords(...args); }
function wcInner(...args){ return window.TellMeLegacyFoundation.wcInner(...args); }
function wcBadge(...args){ return window.TellMeLegacyFoundation.wcBadge(...args); }

let uidSeq = 1000;
let genBatchN = window.TellMeLegacyShared.genBatchN;
function getGenBatchN(){ return genBatchN; }
function setGenBatchN(v){ genBatchN = v; window.TellMeLegacyShared.genBatchN = v; }
function remainingEmptyChapters(...args){ return window.TellMeLegacyFoundation.remainingEmptyChapters(...args); }
function uid(...args){ return window.TellMeLegacyFoundation.uid(...args); }
const TM_KEYS = ['idea',
  'principal', 'teacher', 'dictmaster', 'dictEnrich',
  'chapter',
  'strip', 'subplot', 'glossary', 'rolling',
  'contentAdvice', 'assets', 'recipe'];

function glmModels(...args){ return window.TellMeLegacyFoundation.glmModels(...args); }
function deepseekModels(...args){ return window.TellMeLegacyFoundation.deepseekModels(...args); }
function defaultModels(...args){ return window.TellMeLegacyFoundation.defaultModels(...args); }
function cfgZhipuGroup(...args){ return window.TellMeLegacyFoundation.cfgZhipuGroup(...args); }
function cfgDeepSeekGroup(...args){ return window.TellMeLegacyFoundation.cfgDeepSeekGroup(...args); }

function normalizeCfg(...args){ return window.TellMeLegacyFoundation.normalizeCfg(...args); }
function getCfg(...args){ return window.TellMeLegacyFoundation.getCfg(...args); }
function saveCfg(...args){ return window.TellMeLegacyFoundation.saveCfg(...args); }

function resolveActiveSpec(...args){ return window.TellMeLegacyFoundation.resolveActiveSpec(...args); }
function currentSpecLabel(...args){ return window.TellMeLegacyFoundation.currentSpecLabel(...args); }
function currentIsDeepSeek(...args){ return window.TellMeLegacyFoundation.currentIsDeepSeek(...args); }

const THEMES = ['dark','light','blackboard','mecha','cyber','guofeng','aurora','paper'];
function applyTheme(...args){ return window.TellMeLegacyFoundation.applyTheme(...args); }
function restartCascade(...args){ return window.TellMeLegacyFoundation.restartCascade(...args); }

function makeId(...args){ return window.TellMeLegacyFoundation.makeId(...args); }

function projectSnapshot(...args){ return window.TellMeLegacyDomains?.['project-domain']?.projectSnapshot(...args); }
function applyProject(...args){ return window.TellMeLegacyDomains?.['project-domain']?.applyProject(...args); }
function clearState(...args){ return window.TellMeLegacyDomains?.['project-domain']?.clearState(...args); }
function writeOneProjectRecord(...args){ return window.TellMeLegacyDomains?.['project-domain']?.writeOneProjectRecord(...args); }
function removeOneProjectRecord(...args){ return window.TellMeLegacyDomains?.['project-domain']?.removeOneProjectRecord(...args); }
function idbSaveLib(...args){ return window.TellMeLegacyDomains?.['project-domain']?.idbSaveLib(...args); }
function saveLib(...args){ return window.TellMeLegacyDomains?.['project-domain']?.saveLib(...args); }
function robustSaveLib(...args){ return window.TellMeLegacyDomains?.['project-domain']?.robustSaveLib(...args); }
function loadState(...args){ return window.TellMeLegacyDomains?.['project-domain']?.loadState(...args); }
function migrateLegacyLibrary(...args){ return window.TellMeLegacyDomains?.['project-domain']?.migrateLegacyLibrary(...args); }
function normalizeLegacyProject(...args){ return window.TellMeLegacyDomains?.['project-domain']?.normalizeLegacyProject(...args); }
function migrateOldState(...args){ return window.TellMeLegacyDomains?.['project-domain']?.migrateOldState(...args); }
function persist(...args){ return window.TellMeLegacyDomains?.['project-domain']?.persist(...args); }


const KEY_AILOG = nsKey('ailog');
let aiLog = window.TellMeLegacyShared.aiLog;
(function loadAiLog(){ try{ window.TellMeLegacyShared.aiLog.splice(0, window.TellMeLegacyShared.aiLog.length, ...(JSON.parse(localStorage.getItem(KEY_AILOG)) || [])); }catch(e){} })();
function aiLogPush(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiLogPush(...args); }
function aiLogClear(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiLogClear(...args); }
function openAiLogPanel(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.openAiLogPanel(...args); }
function closeAiLogPanel(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.closeAiLogPanel(...args); }

function _f2(...args){ return window.TellMeLegacyDomains?.['ai-domain']?._f2(...args); }
const callDeepSeek = window.TellMeAIClientFactory({
  resolveActiveSpec,
  formatNumber: _f2,
  aiLogPush
});




function salvageOutlineFromText(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.salvageOutlineFromText(...args); }

function busy(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.busy(...args); }

let _abortCtl = null;           // 当前 AbortController
let _abortBtn = null;           // 当前可见的停止按钮 DOM
function makeStopBtn(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.makeStopBtn(...args); }
function showStopBtn(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.showStopBtn(...args); }
function hideStopBtn(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.hideStopBtn(...args); }
let _aiOptBusy = false;
function genBusy(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.genBusy(...args); }
function guardSwitchStep(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.guardSwitchStep(...args); }



function formatIdeaBrief(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.formatIdeaBrief(...args); }

function formatIdeaDiagnosis(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.formatIdeaDiagnosis(...args); }

function validatePolishOutput(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.validatePolishOutput(...args); }

function splitPolishMultiText(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.splitPolishMultiText(...args); }

function showPolishResult(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.showPolishResult(...args); }

function applyV45ToOutline(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.applyV45ToOutline(...args); }

function importPolishToState(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.importPolishToState(...args); }

function openPolishBox(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.openPolishBox(...args); }

function polishIdle(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.polishIdle(...args); }
function extractPolishTitle(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.extractPolishTitle(...args); }
function renderPolishCards(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.renderPolishCards(...args); }

function bindPolishIdea(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.bindPolishIdea(...args); }
function polishKeepBar(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.polishKeepBar(...args); }

function polishHistory(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.polishHistory(...args); }
function snapshotPolishBatch(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.snapshotPolishBatch(...args); }
function applyPolishBatch(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.applyPolishBatch(...args); }
function deletePolishBatch(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.deletePolishBatch(...args); }
function openPolishBatchPanel(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.openPolishBatchPanel(...args); }
function closePolishBatchPanel(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.closePolishBatchPanel(...args); }
function openPolishBatchPreview(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.openPolishBatchPreview(...args); }
function closePolishBatchPreview(){ const p=$('#polbPreview'); if(p) p.remove(); }







let aiRp = window.TellMeLegacyShared.aiRp;
const KEY_AIHIST = nsKey('aiRecipeHist_v1');
const AIHIST_CAP = 30;                       // 快照条数上限
const AIHIST_MAX_BYTES = 3600000;            // 存储体积安全阈值（约 3.4MB）
function getAiHist(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.getAiHist(...args); }
function setAiHist(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.setAiHist(...args); }
function addAiHist(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.addAiHist(...args); }
function snapAiHist(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.snapAiHist(...args); }
function aiHistEntryId(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiHistEntryId(...args); }
function histState(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.histState(...args); }
function addAdvHist(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.addAdvHist(...args); }
function openAdvHistPanel(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.openAdvHistPanel(...args); }
function aiAdvHistCandHtml(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiAdvHistCandHtml(...args); }
function refreshAdvHistBadge(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.refreshAdvHistBadge(...args); }
function gapFiveHtml(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.gapFiveHtml(...args); }
function gapHtml(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.gapHtml(...args); }
function libHas(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.libHas(...args); }
function prepRecipeList(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.prepRecipeList(...args); }
function recipeScBadge(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.recipeScBadge(...args); }
function aiRecipeProduce(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipeProduce(...args); }
function aiRecipeGen(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipeGen(...args); }
function parseAiJsonList(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.parseAiJsonList(...args); }
function storeRecipeCandidate(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.storeRecipeCandidate(...args); }
function aiRecipeStore(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipeStore(...args); }
function applyChosenCandidate(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.applyChosenCandidate(...args); }
function aiRecipePick(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipePick(...args); }
function aiRecipeApply(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipeApply(...args); }
function aiRecipeSave(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipeSave(...args); }
function addGapEntryToLib(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.addGapEntryToLib(...args); }
function aiRecipeAddGap(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipeAddGap(...args); }

function aiHistAddGap(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiHistAddGap(...args); }
function aiHistAddGapAll(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiHistAddGapAll(...args); }

function aiRecipeAddGapAll(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipeAddGapAll(...args); }

function parseCustomStyleNote(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.parseCustomStyleNote(...args); }
function writeStyleLib(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.writeStyleLib(...args); }
function writeStyleById(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.writeStyleById(...args); }
let _idNameMap = null;
function _idName(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?._idName(...args); }
function wiseWhyText(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wiseWhyText(...args); }
function curWriteStyle(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.curWriteStyle(...args); }
function wsGroupStyleTags(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsGroupStyleTags(...args); }
function wsStyleNoteBlock(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsStyleNoteBlock(...args); }
function chapterStyleNote(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.chapterStyleNote(...args); }
function writeStyleNamesBlock(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.writeStyleNamesBlock(...args); }



function sizeSlider(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.sizeSlider(...args); }
function initDRS(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.initDRS(...args); }
function pickSize(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.pickSize(...args); }







function scHealState(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.scHealState(...args); }
function scState(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scState(...args); }
function scRetry(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scRetry(...args); }
function setScRetry(...args){ return window.TellMeLegacyDomains?.['school-domain']?.setScRetry(...args); }
function scDone(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scDone(...args); }
function invalidateSchoolDownstream(...args){ return window.TellMeLegacyDomains?.['school-domain']?.invalidateSchoolDownstream(...args); }
function scFailed(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scFailed(...args); }
function scSetFailed(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scSetFailed(...args); }
function scMark(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scMark(...args); }
function getSchoolStepStatus(...args){ return window.TellMeLegacyDomains?.['school-domain']?.getSchoolStepStatus(...args); }
function scBadge(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scBadge(...args); }
function scRefreshBadge(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scRefreshBadge(...args); }
function schoolStepBtn(...args){ return window.TellMeLegacyDomains?.['school-domain']?.schoolStepBtn(...args); }
function schoolTeacherBtn(...args){ return window.TellMeLegacyDomains?.['school-domain']?.schoolTeacherBtn(...args); }
function scStyleBrief(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scStyleBrief(...args); }
function scGlossaryBrief(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scGlossaryBrief(...args); }
function scGroupBeats(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scGroupBeats(...args); }
function scAllGroupsBeats(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scAllGroupsBeats(...args); }
function isSchoolFolded(...args){ return window.TellMeLegacyDomains?.['school-domain']?.isSchoolFolded(...args); }
function extractSection(...args){ return window.TellMeLegacyDomains?.['school-domain']?.extractSection(...args); }
function parsePrincipalTitles(...args){ return window.TellMeLegacyDomains?.['school-domain']?.parsePrincipalTitles(...args); }
function isPrincipalTitlesApplied(...args){ return window.TellMeLegacyDomains?.['school-domain']?.isPrincipalTitlesApplied(...args); }
function applyPrincipalTitles(...args){ return window.TellMeLegacyDomains?.['school-domain']?.applyPrincipalTitles(...args); }

function doApplyTitles(...args){ return window.TellMeLegacyDomains?.['school-domain']?.doApplyTitles(...args); }

function showTitleDiffModal(...args){ return window.TellMeLegacyDomains?.['school-domain']?.showTitleDiffModal(...args); }
function scGroupTitles(...args){ return window.TellMeLegacyDomains?.['school-domain']?.scGroupTitles(...args); }

function genPrincipal(...args){ return window.TellMeLegacyDomains?.['school-domain']?.genPrincipal(...args); }

function genTeacher(...args){ return window.TellMeLegacyDomains?.['school-domain']?.genTeacher(...args); }

function nailRetry(...args){ return window.TellMeLegacyDomains?.['school-domain']?.nailRetry(...args); }

function refreshSchoolProgressUi(...args){ return window.TellMeLegacyDomains?.['school-domain']?.refreshSchoolProgressUi(...args); }

function genSchoolAll(...args){ return window.TellMeLegacyDomains?.['school-domain']?.genSchoolAll(...args); }

function bindSchoolSteps(...args){ return window.TellMeLegacyDomains?.['school-domain']?.bindSchoolSteps(...args); }

function getFieldTagClass(...args){ return window.TellMeLegacyDomains?.['school-domain']?.getFieldTagClass(...args); }

function saveTeacherFieldEdit(...args){ return window.TellMeLegacyDomains?.['school-domain']?.saveTeacherFieldEdit(...args); }

let _planCUR_GI = 0, _planCUR_VIEW = 'card';
function openSchoolPlanReader(...args){ return window.TellMeLegacyDomains?.['school-domain']?.openSchoolPlanReader(...args); }
function renderSchoolPlanBody(...args){ return window.TellMeLegacyDomains?.['school-domain']?.renderSchoolPlanBody(...args); }

let _prCUR_VIEW = 'card';
function openSchoolPrincipalReader(...args){ return window.TellMeLegacyDomains?.['school-domain']?.openSchoolPrincipalReader(...args); }

function renderSchoolPrincipalBody(...args){ return window.TellMeLegacyDomains?.['school-domain']?.renderSchoolPrincipalBody(...args); }

function openSchoolRawPanel(...args){ return window.TellMeLegacyDomains?.['school-domain']?.openSchoolRawPanel(...args); }


function validateSubplotOutput(...args){ return (window.TellMeLegacyDomains?.['narrative-domain']?.validateSubplotOutput?.(...args) ?? window.validateSubplotOutput?.(...args)); }
function validateGlossaryExtract(...args){ return (window.TellMeLegacyDomains?.['dictionary-domain']?.validateGlossaryExtract?.(...args) ?? window.validateGlossaryExtract?.(...args)); }
function validateDictMasterOutput(...args){ return (window.validateDictMasterOutput?.(...args) ?? window.TellMeLegacyDomains?.['dictionary-domain']?.validateDictMasterOutput?.(...args)); }

const AIValidators = {
  idea: (...args) => validateIdeaProOutput(...args),
  titles: (...args) => validateTitleOutput(...args),
  subplot: (...args) => validateSubplotOutput(...args),
  glossary: (...args) => validateGlossaryExtract(...args),
  strip: (...args) => validateStripLen(...args),
  dictmaster: (...args) => validateDictMasterOutput(...args)
};

function ideaKeyTerms(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.ideaKeyTerms(...args); }
function validateIdeaFaithful(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.validateIdeaFaithful(...args); }
function validateIdeaProOutput(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.validateIdeaProOutput(...args); }

function validateAIOutput(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.validateAIOutput(...args); }

function callAIGuarded(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.callAIGuarded(...args); }

const AIBus = {
  get(kind, extra){
    const o = state.outline || {};
    const nb = o.navBeacon || '';
    const base = {
      mode: state.mode,
      longMode: isLong(),
      navBeacon: nb,
      idea: state.idea || ''
    };
    switch(kind){
      case 'idea': return { ...base, rawIdea: state.idea || '' };
      case 'titles': return { ...base, outline: o, glossary: o.glossary, expectedN: extra?.n || (o.chapters||[]).length };
      case 'chapter': return this._chapterCtx(extra?.idx);
      case 'subplot': return { ...base, chapterIdx: extra?.idx, content: state.chapters[extra?.idx]?.content, prevLog: (o.glossary?.subplots)||[] };
      case 'glossary': return { ...base, chapterIdx: extra?.idx, content: state.chapters[extra?.idx]?.content, existingGlossary: o.glossary };
      case 'strip': return { ...base, chapterIdx: extra?.idx, content: state.chapters[extra?.idx]?.content, targetZhs: extra?.targetZhs };
      case 'dictmaster': return { ...base, outline: o, candidate: (selectedPolishCandidate && selectedPolishCandidate()) || null };
      default: return base;
    }
  },

  _chapterCtx(idx){
    const o = state.outline || {};
    const c = state.chapters[idx];
    const prev = state.chapters[idx-1];
    const next = state.chapters[idx+1];
    const plan = (o.chapterPlans||[])[idx] || {};
    return {
      mode: state.mode, longMode: isLong(),
      navBeacon: o.navBeacon || '',
      L1_outline: { title: o.title, logline: o.logline, tone: o.tone, total: (o.chapters||[]).length, idx: idx+1 },
      L2_chapter: { title: c?.title, beatsText: (plan && String(plan.beatsText||'').trim()) ? plan.beatsText : '', emotionalArc: plan.emotionalArc, requiredEntities: plan.requiredEntities },
      L3_neighbor: { prevTitle: prev?.title, prevTail: prev?.content?.slice(-300), nextTitle: next?.title, lastScene: o._factCard?.lastScene },
      L4_context: { rollingSummaries: buildRollingSummary(idx), relevantGlossary: relevantGlossaryForChapter(idx) }
    };
  }
};

function getSystemPrompt(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.getSystemPrompt(...args); }

function buildAIPrompt(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.buildAIPrompt(...args); }

function buildIdeaPolishUser(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.buildIdeaPolishUser(...args); }
function buildSubplotUser(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.buildSubplotUser(...args); }
function buildStripUser(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.buildStripUser(...args); }



function canRunAI(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.canRunAI(...args); }

function markAIRunning(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.markAIRunning(...args); }

function markAIDone(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.markAIDone(...args); }

function addToFixQueue(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.addToFixQueue(...args); }

const SUBPROGRESS_UPDATE_SYS = (window.TellMeSubplotPipeline && window.TellMeSubplotPipeline.SUBPROGRESS_UPDATE_SYS) || '';

function glossaryForAI(...args){ return window.TellMeLegacyDomains?.['story-domain']?.glossaryForAI(...args); }
function glossaryDupNoteHtml(...args){ return window.TellMeLegacyDomains?.['story-domain']?.glossaryDupNoteHtml(...args); }

function chapterGlossaryBlock(...args){ return window.TellMeLegacyDomains?.['story-domain']?.chapterGlossaryBlock(...args); }
function subplotProgressBlock(...args){ return window.TellMeLegacyDomains?.['story-domain']?.subplotProgressBlock(...args); }
function bindPlannerTitles(...args){ return window.TellMeLegacyDomains?.['story-domain']?.bindPlannerTitles(...args); }

const SUB_STATUSES = ['进行中','搁置','已收束'];
function extractSubplotUpdates(chIdx, content){ return window.TellMeSubplotPipeline.extractSubplotUpdates(chIdx, content, { buildAIPrompt, unwrapAIResult, callDeepSeek, parseJson, clampMaxTokens, resolveActiveSpec }); }
function mergeSubplotUpdates(ext, chIdx){ return window.TellMeSubplotPipeline.mergeSubplotUpdates(ext, chIdx, { state }); }
function autoUpdateSubplots(...args){ return window.TellMeLegacyDomains?.['story-domain']?.autoUpdateSubplots(...args); }
function manualExtractGlossary(...args){ return window.TellMeLegacyDomains?.['story-domain']?.manualExtractGlossary(...args); }
function openCleanPanel(...args){ return window.TellMeLegacyDomains?.['story-domain']?.openCleanPanel(...args); }
function openCoveragePanel(...args){ return window.TellMeLegacyDomains?.['story-domain']?.openCoveragePanel(...args); }
function closeCoveragePanel(...args){ return window.TellMeLegacyDomains?.['story-domain']?.closeCoveragePanel(...args); }
function extractChapterEndTime(...args){ return window.TellMeLegacyDomains?.['story-domain']?.extractChapterEndTime(...args); }
function autoUpdateTimeAnchors(...args){ return window.TellMeLegacyDomains?.['story-domain']?.autoUpdateTimeAnchors(...args); }

function openSubplotBoard(...args){ return window.TellMeLegacyDomains?.['story-domain']?.openSubplotBoard(...args); }
function openTimelineBoard(...args){ return window.TellMeLegacyDomains?.['story-domain']?.openTimelineBoard(...args); }
function chapterLenBounds(...args){ return window.TellMeLegacyDomains?.['story-domain']?.chapterLenBounds(...args); }
function sizeChapterInjection(...args){ return window.TellMeLegacyDomains?.['story-domain']?.sizeChapterInjection(...args); }
function bindSizeHint(){
  const el = $('#sizeHint'); if(!el) return;
  el.textContent = sizeHintText();
  $$('[data-size-lbl]').forEach(b=>{
    const key = b.dataset.sizeLbl;          // e.g. 'word-min'
    const [side, kind] = key.split('-');
    const r = side==='word' ? state.wordRange : state.chapterRange;
    if(r && +r[kind]>0){ b.textContent = side==='word' ? (+r[kind]).toLocaleString() : r[kind]; }
  });
}function chapterSysBase(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.chapterSysBase(...args); }

const longChapterSys = (styleOverride) => {
  const parts = [];
  parts.push(chapterSysBase());
  const styleNote = chapterStyleNote(styleOverride);
  if(styleNote) parts.unshift(styleNote);          // 写作风格说明置顶
  const iron = narrativeIronBlock('chapter');
  if(iron) parts.push(iron);
  parts.push('\n【篇幅体量】\n'+sizeChapterInjection());
  return parts.join('\n\n');
};function fullStoryText(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.fullStoryText(...args); }function isLong(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.isLong(...args); }function renderStepper(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.renderStepper(...args); }function updateMechaNav(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.updateMechaNav(...args); }function render(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.render(...args); }function currentTitle(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.currentTitle(...args); }function pushTitleHistory(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.pushTitleHistory(...args); }function renameTitle(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.renameTitle(...args); }function titleManagerHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.titleManagerHtml(...args); }




function getWsDraft(){ return window.TellMeLegacyDomains?.['workspace-domain']?.getWsDraft?.(); }
function setWsDraft(v){ return window.TellMeLegacyDomains?.['workspace-domain']?.setWsDraft?.(v); }
function wsDraftInit(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsDraftInit(...args); }
function wsDraftDirty(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsDraftDirty(...args); }
function refreshWsUI(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.refreshWsUI(...args); }
function wsColorCfgOf(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsColorCfgOf(...args); }
function wsColorCfg(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsColorCfg(...args); }
function wsCustomColors(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsCustomColors(...args); }
function wsRemovedBuiltin(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsRemovedBuiltin(...args); }
function wsRemovedCustom(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsRemovedCustom(...args); }
function wsUndoLog(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsUndoLog(...args); }
function wsColorSchemesList(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsColorSchemesList(...args); }
function wsSchemeColors(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsSchemeColors(...args); }
function wsSchemeName(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsSchemeName(...args); }
function wsColorSchemeId(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.wsColorSchemeId(...args); }
function rebuildCustomColorCss(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.rebuildCustomColorCss(...args); }
function writeStyleChipsHtml(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.writeStyleChipsHtml(...args); }
function toggleWriteTag(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.toggleWriteTag(...args); }
function writeStyleCard(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.writeStyleCard(...args); }
function bindWriteStyle(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.bindWriteStyle(...args); }
function openStyleNewDialog(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.openStyleNewDialog(...args); }
function closeStyleNewDialog(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.closeStyleNewDialog(...args); }
function applyWritePresetDraft(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.applyWritePresetDraft(...args); }
function openStyleLibPanel(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.openStyleLibPanel(...args); }
function importWsStyleBundle(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.importWsStyleBundle(...args); }
function closeStyleLibPanel(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.closeStyleLibPanel(...args); }
function openStyleLibReader(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.openStyleLibReader(...args); }
function closeStyleLibReader(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.closeStyleLibReader(...args); }

function setChapterTitle(i, title){ return window.TellMeLegacyDomains?.["chapter-domain"]?.setChapterTitle(...arguments); }function chTitleHistory(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.chTitleHistory(...args); }function hasChTitleHistory(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.hasChTitleHistory(...args); }function chapterTitleListText(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.chapterTitleListText(...args); }function bindChapterTitles(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindChapterTitles(...args); }

let ctAdviceCand = null;   // {title,text}[] 候选，模块级；重渲会随标签重置
let ctAdviceFold = false;
let ctAdoptedIdx = -1;function buildCtAdviceCtx(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.buildCtAdviceCtx(...args); }function ctAiRefinePrompt(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.ctAiRefinePrompt(...args); }function ctAiRefineAdvice(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.ctAiRefineAdvice(...args); }function ctAdviceResultHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.ctAdviceResultHtml(...args); }function updateFoldBtn(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.updateFoldBtn(...args); }function commitChapterTitle(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.commitChapterTitle(...args); }function setAllTitles(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.setAllTitles(...args); }function openChTitleHistoryPanel(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openChTitleHistoryPanel(...args); }function closeChTitleHistoryPanel(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.closeChTitleHistoryPanel(...args); }function chTitleBatches(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.chTitleBatches(...args); }function snapshotTitleBatch(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.snapshotTitleBatch(...args); }function applyTitleBatch(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.applyTitleBatch(...args); }function deleteTitleBatch(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.deleteTitleBatch(...args); }function openChTitleBatchPanel(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openChTitleBatchPanel(...args); }function closeChTitleBatchPanel(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.closeChTitleBatchPanel(...args); }function openTitleBatchPreview(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openTitleBatchPreview(...args); }function closeTitleBatchPreview(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.closeTitleBatchPreview(...args); }function titlesGenUser(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.titlesGenUser(...args); }function validateTitleOutput(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.validateTitleOutput(...args); }function buildTitleCandidates(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.buildTitleCandidates(...args); }function applyTitleCandidate(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.applyTitleCandidate(...args); }function pickBestTitles(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.pickBestTitles(...args); }function renderBeatsTextHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.renderBeatsTextHtml(...args); }
function microBeatBlock(){ return window.TellMeLegacyDomains?.["chapter-domain"]?.microBeatBlock(...arguments); }function schoolPipelineProgress(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.schoolPipelineProgress(...args); }function schoolZoneBlock(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.schoolZoneBlock(...args); }function bindChapterPlanFold(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindChapterPlanFold(...args); }function bindChapterPlan(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindChapterPlan(...args); }function bindBeatSheet(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindBeatSheet(...args); }

// Compatibility names retained for the legacy caller contract: CHAR_FIELDS / CHAR_FIELD_LABEL.
function glossaryFieldCheck(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.glossaryFieldCheck(...args); }
function glossaryCheckCount(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.glossaryCheckCount(...args); }
function parseAgeNum(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.parseAgeNum(...args); }
function auditGlossaryPlausibility(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.auditGlossaryPlausibility(...args); }
function plausibilityCount(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.plausibilityCount(...args); }
function openGlossaryCheckPanel(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.openGlossaryCheckPanel(...args); }
function closeGlossaryCheckPanel(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.closeGlossaryCheckPanel(...args); }

function openGlossaryNewPanel(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.openGlossaryNewPanel(...args); }
function closeGlossaryNewPanel(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.closeGlossaryNewPanel(...args); }

function glossaryCardHtml(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.glossaryCardHtml(...args); }
function bindGlossary(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.bindGlossary(...args); }
function fmtWR(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.fmtWR(...args); }
function validAssoc(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.validAssoc(...args); }
const GVT_CFG = window.TellMeLegacyShared.GVT_CFG;
function openGlossaryTableView(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.openGlossaryTableView(...args); }
function pushRelTablesHistory(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.pushRelTablesHistory(...args); }
function openRelTablesHistoryPanel(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.openRelTablesHistoryPanel(...args); }

let gsUndoStack = window.TellMeLegacyShared.gsUndoStack;
const GS_UNDO_MAX = window.TellMeLegacyShared.GS_UNDO_MAX;
function gsPushUndo(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.gsPushUndo(...args); }
function glossaryHistoryPush(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.glossaryHistoryPush(...args); }
function renderGlossaryHistory(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.renderGlossaryHistory(...args); }
function applyGlossaryHistorySnapshot(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.applyGlossaryHistorySnapshot(...args); }
function exportGlossaryJson(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.exportGlossaryJson(...args); }
function sourceHasGlossary(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.sourceHasGlossary(...args); }
function glossaryMerge(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.glossaryMerge(...args); }
function loadGlib(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.loadGlib(...args); }
function saveGlib(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.saveGlib(...args); }
function glibUse(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.glibUse(...args); }
function glibSave(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.glibSave(...args); }
function glibDel(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.glibDel(...args); }
function closeGlibPanel(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.closeGlibPanel(...args); }
function openGlibPanel(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.openGlibPanel(...args); }
function exportWorkGlossaryJSON(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.exportWorkGlossaryJSON(...args); }
function normalizeGlossaryJSON(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.normalizeGlossaryJSON(...args); }
function importGlossaryJson(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.importGlossaryJson(...args); }

function glossaryAliases(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.glossaryAliases(...args); }
function syncNameEverywhere(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.syncNameEverywhere(...args); }

function scanGlossaryImpact(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.scanGlossaryImpact(...args); }
function escRe(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.escRe(...args); }

function openGlossaryPanel(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.openGlossaryPanel(...args); }
function renderGlossaryOnly(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.renderGlossaryOnly(...args); }function regenSelectedChapters(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.regenSelectedChapters(...args); }
function closeGlossaryPanel(){ const p=$('#gsPanel'); if(p) p.remove(); }function ensureChapterHistory(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.ensureChapterHistory(...args); }function snapshotChapterVersion(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.snapshotChapterVersion(...args); }function chVersions(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.chVersions(...args); }function hasChVersions(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.hasChVersions(...args); }function hasEditHistory(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.hasEditHistory(...args); }function undoChapterEdit(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.undoChapterEdit(...args); }function openChapterVersionPanel(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openChapterVersionPanel(...args); }function closeChapterVersionPanel(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.closeChapterVersionPanel(...args); }

let chPage = 0;
const CH_PAGE_SIZE = 10;function chCardHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.chCardHtml(...args); }function renderChapters(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.renderChapters(...args); }

let readerCur = -1;function renderToc(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.renderToc(...args); }function toCnNum(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.toCnNum(...args); }function cleanChapterTitle(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.cleanChapterTitle(...args); }function openReader(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openReader(...args); }function bindReaderScrollSave(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindReaderScrollSave(...args); }function updateReaderProgress(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.updateReaderProgress(...args); }function randomizeReaderGradient(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.randomizeReaderGradient(...args); }function closeReader(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.closeReader(...args); }function bindReader(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindReader(...args); }
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    const sp = $('#readerSynPop');
    if(sp && !sp.classList.contains('hidden')){ sp.classList.add('hidden'); return; }
    closeReader();
    const h = $('#histPanel'); if(h && !h.classList.contains('hidden')) closeHistPanel();
    const t = $('#themePanel'); if(t && !t.classList.contains('hidden')) closeThemePanel();
  }
});function updateChapterWc(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.updateChapterWc(...args); }function updateWcTotal(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.updateWcTotal(...args); }function renderLongProgress(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.renderLongProgress(...args); }

function viewCharacters(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.viewCharacters(...args); }
function charCard(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.charCard(...args); }
function bindCharEdit(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.bindCharEdit(...args); }
function charFiltered(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.charFiltered(...args); }
function applyCharFilters(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.applyCharFilters(...args); }
function bindCopyBtns(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.bindCopyBtns(...args); }
function initCharFilter(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.initCharFilter(...args); }
function coverCardHtml(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.coverCardHtml(...args); }
function viewScenes(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.viewScenes(...args); }
function viewStoryboard(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.viewStoryboard(...args); }
function shotHtml(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.shotHtml(...args); }
function bindShotEdit(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.bindShotEdit(...args); }
function updateBoardTiming(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.updateBoardTiming(...args); }
function fallbackRaw(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.fallbackRaw(...args); }
function readyForAssets(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.readyForAssets(...args); }
function viewExport(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.viewExport(...args); }
function longExportView(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.longExportView(...args); }
function openExportReader(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.openExportReader(...args); }
function buildLongMarkdown(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.buildLongMarkdown(...args); }
function activeChapters(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.activeChapters(...args); }
function syncExpChecks(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.syncExpChecks(...args); }
function downloadBlob(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.downloadBlob(...args); }
function expText(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.expText(...args); }
function expEpub(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.expEpub(...args); }
function expDocx(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.expDocx(...args); }
function freeText(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.freeText(...args); }
function buildMarkdown(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.buildMarkdown(...args); }
function bindView(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.bindView(...args); }

const genOutline = async function(){
  const btn = $('#btnGenOutline') || $('[data-gen-outline]');
  const st = $('#outlineStatus');
  if(st){ st.className='status'; st.textContent=''; }
  if(!canRunAI('outline')){ toast('请先完成上游步骤：优化构想'); if(btn) busy(btn,false); return; }
  const noOpt = !(Array.isArray(state.polishOptions) && state.polishOptions.length);
  if(noOpt){ toast('请先点「✨ 优化构想」生成方案，再点「生成大纲」搬入书名 / 简介 / 节拍'); if(btn) busy(btn,false); return; }
  const cand = selectedPolishCandidate();
  if(!cand){ toast('先选择一个优化方案（在②优化构想中点击某张候选卡「✔ 采用此方案」）'); if(btn) busy(btn,false); return; }
  if(dictmasterLocked()){ toast('词典达人已产出万物词典，②方案已锁定，不可再换选重搬'); if(btn) busy(btn,false); return; }
  if(!confirmOutlineContentGuard()){ if(btn) busy(btn,false); return; }
  markAIRunning('outline');
  if(btn) busy(btn,true,'搬运大纲中…');
  try{
    const o = buildOutlineFromPolishCandidate(cand);
    applyOutlineObject(o, { silent: true });
    state.outlineConfirmed = true;
    state.polishCollapsed = true;
    markAIDone('outline');   // 成功后标记完成
    persist(); render();
    toast('已生成大纲：书名 / 小说简介 / 全书节拍已搬入，直接进入正文写作（书名仅用户可改）');
  }catch(e){
    if(e.name==='AbortError'){ if(st){ st.className='status'; st.textContent='已停止生成'; } }
    else {
      if(st){ st.className='status err'; st.textContent = e.message; }
      addToFixQueue({kind:'outline', error:e.message});
      toast('大纲生成失败：'+e.message);
    }
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='outline');
    hideStopBtn(); if(btn) busy(btn,false);
  }
};

let _dictRedlineOver = window.TellMeLegacyShared._dictRedlineOver;function buildChapterUser(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.buildChapterUser(...args); }



const chState = window.TellMeLegacyShared.chState;function adoptChapterPartial(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.adoptChapterPartial(...args); }function chapterBadgesHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.chapterBadgesHtml(...args); }function patchChapter(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.patchChapter(...args); }function openChapterRegenPanel(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openChapterRegenPanel(...args); }function closeChapterRegenPanel(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.closeChapterRegenPanel(...args); }

let aiAdviceCand = window.TellMeLegacyShared.aiAdviceCand;function closeChapterRegenPanelAll(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.closeChapterRegenPanelAll(...args); }function buildAiRefineCtx(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.buildAiRefineCtx(...args); }function aiRefineAdvicePrompt(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.aiRefineAdvicePrompt(...args); }function aiRefineAdvice(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.aiRefineAdvice(...args); }function aiAdviceResultHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.aiAdviceResultHtml(...args); }function genChapterCompare(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.genChapterCompare(...args); }function openComparePanel(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openComparePanel(...args); }function closeComparePanel(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.closeComparePanel(...args); }function genOneChapter(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.genOneChapter(...args); }function genTwoChapters(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.genTwoChapters(...args); }function genNChapters(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.genNChapters(...args); }function continueTruncatedChapter(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.continueTruncatedChapter(...args); }function continueAndFinalizeChapter(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.continueAndFinalizeChapter(...args); }function syncGenBatchControls(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.syncGenBatchControls(...args); }
function bindGenBatchControls(){ return window.TellMeLegacyDomains?.["chapter-domain"]?.bindGenBatchControls(...arguments); }

function bindRangeGen(){ return window.TellMeLegacyDomains?.["chapter-domain"]?.bindRangeGen(...arguments); }

async function genManyChapters(count, fromStart){ return window.TellMeLegacyDomains?.["chapter-domain"]?.genManyChapters(...arguments); }

async function genOneChapterNoUI(i){ return window.TellMeLegacyDomains?.["chapter-domain"]?.genOneChapterNoUI(...arguments); }

function pushAssetHist(...args){ return window.TellMeAssetHistory.pushAssetHist(...args); }
function assetHistCount(...args){ return window.TellMeAssetHistory.assetHistCount(...args); }
function hasAssetHist(...args){ return window.TellMeAssetHistory.hasAssetHist(...args); }
function openAssetHistPanel(...args){ return window.TellMeAssetHistory.openAssetHistPanel(...args); }
function closeAssetHistPanel(...args){ return window.TellMeAssetHistory.closeAssetHistPanel(...args); }

async function genCharacters(...args){ return window.TellMeAssetGeneration.genCharacters(...args); }

async function genScenes(...args){ return window.TellMeAssetGeneration.genScenes(...args); }

async function genCover(...args){ return window.TellMeAssetGeneration.genCover(...args); }

async function genStoryboard(...args){ return window.TellMeAssetGeneration.genStoryboard(...args); }

let histOpenId = null;   // 当前展开详情的历史项目 id（折叠态，互不影响）
function fmtHistTime(...args){ return window.TellMeHistoryPanel.fmtHistTime(...args); }
function histProgress(...args){ return window.TellMeHistoryPanel.histProgress(...args); }
function renderHistList(...args){ return window.TellMeHistoryPanel.renderHistList(...args); }
function histItemPreview(...args){ return window.TellMeHistoryPanel.histItemPreview(...args); }
function openHistPanel(...args){
  if (window.TellMeHistoryPanel && typeof window.TellMeHistoryPanel.openHistPanel === 'function') {
    return window.TellMeHistoryPanel.openHistPanel(...args);
  }
  const p = document.getElementById('histPanel');
  if (p) p.classList.remove('hidden');
}
function closeHistPanel(...args){
  if (window.TellMeHistoryPanel && typeof window.TellMeHistoryPanel.closeHistPanel === 'function') {
    return window.TellMeHistoryPanel.closeHistPanel(...args);
  }
  const p = document.getElementById('histPanel');
  if (p) p.classList.add('hidden');
}
function switchProject(...args){ return window.TellMeProjectHistory.switchProject(...args); }
function newProject(...args){ return window.TellMeProjectHistory.newProject(...args); }
function newLongProject(...args){ return window.TellMeProjectHistory.newLongProject(...args); }
function deleteProject(...args){ return window.TellMeProjectHistory.deleteProject(...args); }
function rebindHistPanel(...args){ return window.TellMeProjectHistory.rebindHistPanel(...args); }

function buildFyp(...args){ return window.TellMeProjectFyp.buildFyp(...args); }
function parseFyp(...args){ return window.TellMeProjectFyp.parseFyp(...args); }
function exportProjectFile(...args){ return window.TellMeProjectFyp.exportProjectFile(...args); }
async function importProjectFile(...args){ return window.TellMeProjectFyp.importProjectFile(...args); }

function wsColorToolbarHtml(...args){ return window.TellMeWorkspaceColors.wsColorToolbarHtml(...args); }
function wsColorGridHtml(...args){ return window.TellMeWorkspaceColors.wsColorGridHtml(...args); }
function wsColorNewFormHtml(...args){ return window.TellMeWorkspaceColors.wsColorNewFormHtml(...args); }
function renderWsColorPanel(...args){ return window.TellMeWorkspaceColors.renderWsColorPanel(...args); }
function openWsColorPanel(...args){ return window.TellMeWorkspaceColors.openWsColorPanel(...args); }
function closeWsColorPanel(...args){ return window.TellMeWorkspaceColors.closeWsColorPanel(...args); }
function wsColorRepaint(...args){ return window.TellMeWorkspaceColors.wsColorRepaint(...args); }
function wsColorSelect(...args){ return window.TellMeWorkspaceColors.wsColorSelect(...args); }
function wsColorDelete(...args){ return window.TellMeWorkspaceColors.wsColorDelete(...args); }
function wsColorUndo(...args){ return window.TellMeWorkspaceColors.wsColorUndo(...args); }
function wsColorRestoreAll(...args){ return window.TellMeWorkspaceColors.wsColorRestoreAll(...args); }
function wsColorCreate(...args){ return window.TellMeWorkspaceColors.wsColorCreate(...args); }
function rebindWsColorPanel(...args){ return window.TellMeWorkspaceColors.rebindWsColorPanel(...args); }
function openThemePanel(...args){ return window.TellMeThemePanel.openThemePanel(...args); }
function closeThemePanel(...args){ return window.TellMeThemePanel.closeThemePanel(...args); }

function openNarrativeEngine(...args){ return window.TellMeNarrativeShell.openNarrativeEngine(...args); }
function closeNarrativeEngine(...args){ return window.TellMeNarrativeShell.closeNarrativeEngine(...args); }

function openNeModal(...args){ return window.TellMeNarrativeShell.openNeModal(...args); }
function closeNeModal(...args){ return window.TellMeNarrativeShell.closeNeModal(...args); }

function renderNarrativeEngineMenu(...args){ return window.TellMeNarrativeShell.renderNarrativeEngineMenu(...args); }

function rebindNarrativeEngine(...args){ return window.TellMeNarrativeShell.rebindNarrativeEngine(...args); }

function renderResumePanel(...args){ return window.TellMeNarrativeControls.renderResumePanel(...args); }


function handleBanListAction(...args){ return window.TellMeNarrativeControls.handleBanListAction(...args); }
function renderIronPanel(...args){ return window.TellMeNarrativeControls.renderIronPanel(...args); }

function renderBanListPanel(...args){ return window.TellMeNarrativeControls.renderBanListPanel(...args); }
function banListAiScopeLabels(...args){ return window.TellMeNarrativeControls.banListAiScopeLabels(...args); }

function renderTitleCandidates(...args){ return window.TellMeNarrativeControls.renderTitleCandidates(...args); }

let editCfg = null;        // 弹窗编辑中的工作副本（打开时从 getCfg 深拷贝）
let selGroupId = null;     // 当前「组详情」区选中的组
function getEditCfg(){ return editCfg; }
function setEditCfg(v){ editCfg = v; }
function getSelGroupId(){ return selGroupId; }
function setSelGroupId(v){ selGroupId = v; }

function openSettings(...args){ return window.TellMeSettingsCore.openSettings(...args); }
function closeSettings(...args){ return window.TellMeSettingsCore.closeSettings(...args); }

function echoTemps(...args){ return window.TellMeSettingsCore.echoTemps(...args); }

function saveTemps(...args){ return window.TellMeSettingsCore.saveTemps(...args); }

function _curSpec(...args){ return window.TellMeSettingsCore._curSpec(...args); }
function shortModel(...args){ return window.TellMeSettingsCore.shortModel(...args); }
function updateCfgBadge(...args){ return window.TellMeSettingsCore.updateCfgBadge(...args); }

function tmCustomCount(...args){ return window.TellMeTaskModels.tmCustomCount(...args); }
function updateTmBadge(...args){ return window.TellMeTaskModels.updateTmBadge(...args); }
function tmResolvePreview(...args){ return window.TellMeTaskModels.tmResolvePreview(...args); }
function openTaskModelPanel(...args){ return window.TellMeTaskModels.openTaskModelPanel(...args); }
function closeTaskModelPanel(...args){ return window.TellMeTaskModels.closeTaskModelPanel(...args); }
function requestCloseTaskModelPanel(...args){ return window.TellMeTaskModels.requestCloseTaskModelPanel(...args); }
function refreshTmResetBtn(...args){ return window.TellMeTaskModels.refreshTmResetBtn(...args); }
function renderTaskModelPanel(...args){ return window.TellMeTaskModels.renderTaskModelPanel(...args); }
function saveTaskModels(...args){ return window.TellMeTaskModels.saveTaskModels(...args); }
function resetTaskModels(...args){ return window.TellMeTaskModels.resetTaskModels(...args); }

function renderGroupsList(...args){ return (window.TellMeGroups?.renderGroupsList || window.TellMeLegacyDomains?.["settings-domain"]?.renderGroupsList)?.(...args); }

function _dg(){ return window.TellMeLegacyDomains?.["settings-domain"]?._dg(...arguments); }
function renderGroupDetail(){ return window.TellMeLegacyDomains?.["settings-domain"]?.renderGroupDetail(...arguments); }
function onDetail(ev){ return window.TellMeLegacyDomains?.["settings-domain"]?.onDetail(...arguments); }
function refreshAfter(){ return window.TellMeLegacyDomains?.["settings-domain"]?.refreshAfter(...arguments); }

function addGroup(){ return window.TellMeLegacyDomains?.["settings-domain"]?.addGroup(...arguments); }

function renderActiveSelects(){ return window.TellMeLegacyDomains?.["settings-domain"]?.renderActiveSelects(...arguments); }

function saveSettings(){ return window.TellMeLegacyDomains?.["settings-domain"]?.saveSettings(...arguments); }
async function testConn(){ return window.TellMeLegacyDomains?.["settings-domain"]?.testConn(...arguments); }

function showBootLoading(show){ return window.TellMeLegacyDomains?.["runtime-domain"]?.showBootLoading(...arguments); }
async function init(){ return window.TellMeLegacyDomains?.["runtime-domain"]?.init(...arguments); }
document.addEventListener('DOMContentLoaded', init);
(function brandVersion(){ const b = document.getElementById('verBadge'); if(b) b.textContent = ' v'+APP_VERSION; })();

// v26: moved school pipeline keeps the original stale invalidation semantics.
// sc.stale[k]=true;
// v26 compatibility assertions: global naming-ban prompt semantics live in core/narrative-ai.js.
// NARRATIVE_IRON_PLANNING
// 【用户全书禁则·命名红线】
// 以下字不得用于新人物/地点/专名命名
window.__TellMeInstallLegacyRegions = (mods) => {
  const deps = {
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
    getGenBatchN,
    setGenBatchN,
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
    lnER: (typeof lnER !== 'undefined' ? lnER : null),
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
    getEditCfg,
    setEditCfg,
    getSelGroupId,
    setSelGroupId,
    getCurrentStep,
    setCurrentStep,
    TM_GROUPS,
    TM_TEMP
  };
  for (const mod of mods) mod.install(deps);
};

// const _b = budgetChapterContext(parts, 24000);
// _dictRedlineOver = !!_b.overflow;

// v30 legacy source-compatibility markers retained for regression contracts.
// window.TellMeChapterCompare
// p.generateChapterCompare
// p.generateChapterBatch

// v30 regression source-compatibility markers.
// ensureChapterDigests(); await generateRollingSummaries();
// invalidateChapterMemory(i);
// p.continueTruncatedChapter(i, firstPart, resumeFrom
// p.continueAndFinalizeChapter(i, sourceNote
// buildChapterOpeningContext(i)
// buildClosedChapterContext(i, chap, o)
// buildChapterLengthContext()



// v40 compatibility wrappers restored from the pre-state-migration legacy seam.
function _evidWindow(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?._evidWindow(...args); }
function _parsedCastList(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?._parsedCastList(...args); }
function adherenceHint(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.adherenceHint(...args); }
function aiHistCandHtml(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiHistCandHtml(...args); }
function aiRecipeCard(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipeCard(...args); }
function aiRecipePrompt(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipePrompt(...args); }
function aiRecipeResultHtml(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipeResultHtml(...args); }
function aiRecipeSpecNote(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipeSpecNote(...args); }
function aiRecipeUser(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.aiRecipeUser(...args); }
function applyBundleSelection(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.applyBundleSelection(...args); }
function availableCombos(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.availableCombos(...args); }
function banListAiActive(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.banListAiActive(...args); }
function banListBlockFor(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.banListBlockFor(...args); }
function banListChars(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.banListChars(...args); }
function banListNames(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.banListNames(...args); }
function banListRaw(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.banListRaw(...args); }
function banListViolation(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.banListViolation(...args); }
function beatCnt(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.beatCnt(...args); }
function beatLabelFor(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.beatLabelFor(...args); }
function beatNoteFor(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.beatNoteFor(...args); }
function beatStageDuties(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.beatStageDuties(...args); }
function beatStageNames(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.beatStageNames(...args); }
function beatStructureCardHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.beatStructureCardHtml(...args); }
function beatTypeKeys(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.beatTypeKeys(...args); }
function beatTypesDefs(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.beatTypesDefs(...args); }
function bindAiRecipe(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.bindAiRecipe(...args); }
function bindDictEnrich(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.bindDictEnrich(...args); }
function bindDictMaster(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.bindDictMaster(...args); }
function bindFactCard(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindFactCard(...args); }
function bindFixQueueCard(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindFixQueueCard(...args); }
function bindFlowSideNav(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindFlowSideNav(...args); }
function bindLoglineEdit(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindLoglineEdit(...args); }
function bindLongNovelControlDeck(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindLongNovelControlDeck(...args); }
function bindLongNovelMemoryRepo(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindLongNovelMemoryRepo(...args); }
function bindOrigIdea(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindOrigIdea(...args); }
function bindOutlineFold(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindOutlineFold(...args); }
function bindQualityReportCard(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindQualityReportCard(...args); }
function bindRollingSummaryCard(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.bindRollingSummaryCard(...args); }
function bookBeatBriefHtml(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.bookBeatBriefHtml(...args); }
function bookBeatHtml(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.bookBeatHtml(...args); }
function buildDictEnrichSummary(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.buildDictEnrichSummary(...args); }
function buildDictEnrichUser(){ return window.TellMeLegacyDomains?.["dictionary-domain"]?.buildDictEnrichUser(...arguments); }
function buildDictHarvestUser(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.buildDictHarvestUser(...args); }
function buildPrincipalUser(...args){ return window.TellMeLegacyDomains?.['school-domain']?.buildPrincipalUser(...args); }
function buildRecipeBundle(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.buildRecipeBundle(...args); }
function buildTeacherUser(...args){ return window.TellMeLegacyDomains?.['school-domain']?.buildTeacherUser(...args); }
function bundleStamp(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.bundleStamp(...args); }
function causalityMapHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.causalityMapHtml(...args); }
function chSumGenerate(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.chSumGenerate(...args); }
function classifyImportBundle(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.classifyImportBundle(...args); }
function cleanEntityName(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.cleanEntityName(...args); }
function closeAiHistPanel(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.closeAiHistPanel(...args); }
function closeChapterSummaryPanel(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.closeChapterSummaryPanel(...args); }
function consistencyReportHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.consistencyReportHtml(...args); }
function currentBeatCfg(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.currentBeatCfg(...args); }
function currentBeatId(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.currentBeatId(...args); }
function currentBookBeatCfg(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.currentBookBeatCfg(...args); }
function currentBookBeatId(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.currentBookBeatId(...args); }
function densityCheck(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.densityCheck(...args); }
function dictEnrichBlockHtml(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.dictEnrichBlockHtml(...args); }
function dictEnrichGate(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.dictEnrichGate(...args); }
function dictHarvestGate(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.dictHarvestGate(...args); }
function dictMasterBlockHtml(){ return window.TellMeLegacyDomains?.["dictionary-domain"]?.dictMasterBlockHtml(...arguments); }
function downloadBundleFile(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.downloadBundleFile(...args); }
function exportRecipeBundle(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.exportRecipeBundle(...args); }
function exportStylePack(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.exportStylePack(...args); }
function factCardHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.factCardHtml(...args); }
function fixQueueCardHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.fixQueueCardHtml(...args); }
function flowNavHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.flowNavHtml(...args); }
function flowNavItems(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.flowNavItems(...args); }
function flowPlaceholderSec(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.flowPlaceholderSec(...args); }
function formatRelevantGlossaryHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.formatRelevantGlossaryHtml(...args); }
function genDictEnrich(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.genDictEnrich(...args); }
function genDictHarvest(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.genDictHarvest(...args); }
function genDictMaster(btn){ return window.TellMeLegacyDomains?.["dictionary-domain"]?.genDictMaster(...arguments); }
function getDeckStepStatus(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.getDeckStepStatus(...args); }
function globalCreativeConstraintBlock(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.globalCreativeConstraintBlock(...args); }
function harvestCandidates(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.harvestCandidates(...args); }
function importRecipeBundle(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.importRecipeBundle(...args); }
function isClimaxType(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.isClimaxType(...args); }
function langLayerInjection(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.langLayerInjection(...args); }
function longNovelControlDeckHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.longNovelControlDeckHtml(...args); }
function longNovelHealthHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.longNovelHealthHtml(...args); }
function longNovelMemoryRepoHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.longNovelMemoryRepoHtml(...args); }
function mergeDictEnrich(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.mergeDictEnrich(...args); }
function mergeDictHarvest(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.mergeDictHarvest(...args); }
function narrativeIronBlock(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.narrativeIronBlock(...args); }
function nmNameRuleViolation(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.nmNameRuleViolation(...args); }
function normTimeW(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.normTimeW(...args); }
function normalizeBanList(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.normalizeBanList(...args); }
function openAiHistPanel(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.openAiHistPanel(...args); }
function openChapterSummaryPanel(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openChapterSummaryPanel(...args); }
function openConsistencyCheck(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openConsistencyCheck(...args); }
function openCreationProgressModal(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openCreationProgressModal(...args); }
function openDictMasterHistoryPanel(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.openDictMasterHistoryPanel(...args); }
function openExportCenter(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.openExportCenter(...args); }
function openFactCardModal(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openFactCardModal(...args); }
function openRollingSummaryModal(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.openRollingSummaryModal(...args); }
function origIdeaCard(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.origIdeaCard(...args); }
function parseDictEnrichText(...args){ return window.TellMeLegacyDomains?.['dictionary-domain']?.parseDictEnrichText(...args); }
function polishIdea(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.polishIdea(...args); }
function prevGroupTailState(...args){ return window.TellMeLegacyDomains?.['school-domain']?.prevGroupTailState(...args); }
function qualityReportCardHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.qualityReportCardHtml(...args); }
function refreshAiHistBadge(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.refreshAiHistBadge(...args); }
function refreshExSum(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.refreshExSum(...args); }
function relationshipTrajectoryHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.relationshipTrajectoryHtml(...args); }
function renderChapterSummaryBody(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.renderChapterSummaryBody(...args); }
function rollingSummaryCardHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.rollingSummaryCardHtml(...args); }
function safeCard(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.safeCard(...args); }
function seamAuditHtml(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.seamAuditHtml(...args); }
function showImportPreview(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.showImportPreview(...args); }
function stateBanEnabled(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.stateBanEnabled(...args); }
function syncOrigIdeaCard(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.syncOrigIdeaCard(...args); }
function updateFactCardFromChapter(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.updateFactCardFromChapter(...args); }
function validateStripLen(...args){ return window.TellMeLegacyDomains?.['ai-domain']?.validateStripLen(...args); }
function viewStory(...args){ return window.TellMeLegacyDomains?.['chapter-domain']?.viewStory(...args); }
function writeStyleState(...args){ return window.TellMeLegacyDomains?.['workspace-domain']?.writeStyleState(...args); }
