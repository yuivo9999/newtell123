/* v25: first 50 legacy function bodies extracted into an explicit ESM foundation module. */
const W = globalThis;
const getR = () => W.TellMeRuntime || (W.TellMeRuntime = {});
const R = new Proxy({}, {
  get(_, p){ return getR()[p]; },
  set(_, p, v){ getR()[p] = v; return true; }
});
const state = new Proxy({}, {
  get(_, p){ return getR().state?.[p]; },
  set(_, p, v){ if (getR().state) getR().state[p] = v; return true; }
});
const $ = (s, r = document) => (r || document).querySelector(s);
const $$ = (s, r = document) => [...(r || document).querySelectorAll(s)];
const KEY_PROJ_PREFIX = 'tellme123:proj:';
const KEY_CFG = 'tellme123:cfg';
const TOAST_LOG_KEY = 'tellme123:toastLog_v1';
const SND_KEY = 'tz_snd_done';
const SND_VOL_KEY = 'tz_snd_vol';
const SND_TSINGLE_KEY = 'tz_snd_t_beats';
const SND_TALL_KEY = 'tz_snd_t_all';
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
const THEMES = ['dark', 'cyber', 'mecha', 'writer', 'cream', 'blackboard', 'guofeng'];
const TM_KEYS = ['idea','principal','teacher','dictmaster','dictEnrich','assets','title','chapter','qc','strip','subplot','rolling','contentAdvise','aiRecipe'];
const CJK_ALL = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
const EN_WORD = /[A-Za-z0-9_]+(?:'[A-Za-z0-9_]+)?/;
const document = W.document; const navigator = W.navigator; const localStorage = W.localStorage;
const updateMechaNav = (...a) => (getR().updateMechaNav || W.updateMechaNav)?.(...a);
const updateWcTotal = (...a) => (getR().updateWcTotal || W.updateWcTotal)?.(...a);
const URL = W.URL; const Blob = W.Blob;
const _snd = new Proxy({}, {
  get(_, p){ return (getR().soundState || {})[p]; },
  set(_, p, v){ if(getR().soundState) getR().soundState[p] = v; return true; }
});
function startBgTask(label){ R.bgTaskCount++; if(label) R.bgTaskLabel = String(label); updateBgTaskIndicator(); }

function endBgTask(){ R.bgTaskCount = Math.max(0, R.bgTaskCount - 1); updateBgTaskIndicator(); }

function updateBgTaskIndicator(){
  const el = $('#bgTaskIndicator');
  if(!el) return;
  if(R.bgTaskCount > 0){
    el.textContent = '⏳ 后台任务 ' + (R.bgTaskCount || 0) + ' 项进行中' + (R.bgTaskLabel ? '：' + R.bgTaskLabel : '') + '…';
    el.style.display = '';
  } else {
    if(!R.bgTaskCount) R.bgTaskLabel = '';
    el.style.display = 'none';
  }
}

function lsKeyFor(id){ return KEY_PROJ_PREFIX + id; }

function _timeAnchorOn(){ const _gt = state.outline && state.outline._globalTimeline; return !!_gt && ( (String(_gt.text||'').trim()) || (Array.isArray(_gt.chapters) && _gt.chapters.length) ); }

function _timeAnchorsAutoOn(){ return isLong() && state.timeAnchorsAuto !== false; }

function _timeBranch(s){ s = String(s||'').trim(); if(!s) return ''; const i = s.search(/[·|｜.．:：－\-]/); return i>0 ? s.slice(0,i).trim() : s; }

function destroyCharTS(){
  const list = (R && R.charTS) || (typeof window !== 'undefined' && window.charTS) || [];
  list.forEach(t=>{ try{ t && t.destroy && t.destroy(); }catch(e){} });
  if(R) { try { R.charTS = []; } catch(e){} }
  if(typeof window !== 'undefined') { window.charTS = []; }
}

function parseAge(s){
  if(s==null || s==='') return null;
  const m = String(s).match(/\d+/);
  return m ? +m[0] : null;
}

function toastLogPush(msg){
  try{
    const a = JSON.parse(localStorage.getItem(TOAST_LOG_KEY)||'[]');
    a.push({ ts: Date.now(), msg: String(msg??'') });
    while(a.length > 200) a.shift();
    localStorage.setItem(TOAST_LOG_KEY, JSON.stringify(a));
  }catch(e){}
}

function toastLogGet(){ try{ return JSON.parse(localStorage.getItem(TOAST_LOG_KEY)||'[]'); }catch(e){ return []; } }

function toastLogClear(){ try{ localStorage.removeItem(TOAST_LOG_KEY); }catch(e){} }

function toast(msg){
  const t = $('#toast');
  toastLogPush(msg);
  t.innerHTML = `<span class="toast-msg">${esc(String(msg??''))}</span><button type="button" class="toast-hist" title="打开消息看板，回看全部提示" data-toast-board>📋</button>`;
  const hb = t.querySelector('[data-toast-board]'); if(hb) hb.onclick = (e)=>{ e.stopPropagation(); openToastBoard(); };
  t.classList.remove('hidden');
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.add('hidden'), 4200);
}

function _sndEnabled(){ try{ return localStorage.getItem(SND_KEY) !== '0'; }catch(e){ return true; } }

function _sndVol(){ // 0..1
  try{ const v = parseFloat(localStorage.getItem(SND_VOL_KEY)); return isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.8; }catch(e){ return 0.8; }
}

function unlockAudio(){
  if(!_snd.enabled) return;
  try{
    if(!_snd.ctx){ const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return; _snd.ctx = new AC(); }
    if(_snd.ctx.state === 'suspended') _snd.ctx.resume().catch(()=>{});
  }catch(e){}
}

function _sndBeep(freq, start, dur, gain){ // 单音（正弦包络：快起快落，避免刺耳）
  if(!_snd.ctx) return;
  try{
    const base = (gain||0.22) * (_snd.vol||0);
    if(base < 0.001) return;   // 音量调至 0 时静音
    const o = _snd.ctx.createOscillator(), g = _snd.ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq; o.connect(g); g.connect(_snd.ctx.destination);
    const t = _snd.ctx.currentTime + (start||0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(base, t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t+(dur||0.18));
    o.start(t); o.stop(t+(dur||0.18)+0.05);
  }catch(e){}
}

function _sndSingleType(){ try{ const v = localStorage.getItem(SND_TSINGLE_KEY); return SND_SINGLE_PRESETS.some(x=>x.id===v) ? v : 'be_dingdong'; }catch(e){ return 'be_dingdong'; } }

function _sndAllType(){   try{ const v = localStorage.getItem(SND_TALL_KEY);   return SND_ALL_PRESETS.some(x=>x.id===v) ? v : 'al_up2';   }catch(e){ return 'al_up2';   } }

function setSoundSingleType(id){ try{ if(SND_SINGLE_PRESETS.some(x=>x.id===id)) localStorage.setItem(SND_TSINGLE_KEY, id); }catch(e){} }

function setSoundAllType(id){   try{ if(SND_ALL_PRESETS.some(x=>x.id===id))   localStorage.setItem(SND_TALL_KEY,   id); }catch(e){} }

function _doPlaySound(kind){
  if(!_snd.enabled) return;
  unlockAudio();
  if(!_snd.ctx || _snd.ctx.state !== 'running') return;
  const lib = (kind==='all') ? SND_ALL_PRESETS : SND_SINGLE_PRESETS;
  const id  = (kind==='all') ? _sndAllType()   : _sndSingleType();
  const p = lib.find(x=>x.id===id) || lib[0];
  (p.seq||[]).forEach(s=> _sndBeep(s[0], s[1], s[2]));
}

function playDoneSound(kind){ // kind:'single' 单个完成 | 'all' 全部完成 —— 各用各的音色库，智能去重防冲突
  if(!_snd.enabled) return;
  const now = Date.now();
  if(kind === 'all'){
    if(_soundTimer){ clearTimeout(_soundTimer); _soundTimer = null; }
    _lastSoundTs = now;
    _lastSoundKind = 'all';
    _doPlaySound('all');
    return;
  }
  if(kind === 'single'){
    if(now - _lastSoundTs < 450 && _lastSoundKind === 'all') return;
    if(_soundTimer) clearTimeout(_soundTimer);
    _soundTimer = setTimeout(()=>{
      _soundTimer = null;
      _lastSoundTs = Date.now();
      _lastSoundKind = 'single';
      _doPlaySound('single');
    }, 120);
  }
}

function initThemeSoundPanel(){
  const sb = document.getElementById('cfgSndSingle'), sa = document.getElementById('cfgSndAll');
  const optsB = SND_SINGLE_PRESETS.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  const optsA = SND_ALL_PRESETS.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  if(sb){
    if(!sb._tsf){ sb.innerHTML = optsB; sb._tsf = 1; }
    sb.value = _sndSingleType();
    if(!sb._tsb){ sb._tsb = 1; sb.addEventListener('change', ()=>{ setSoundSingleType(sb.value); }); }
  }
  if(sa){
    if(!sa._tsf){ sa.innerHTML = optsA; sa._tsf = 1; }
    sa.value = _sndAllType();
    if(!sa._tsb){ sa._tsb = 1; sa.addEventListener('change', ()=>{ setSoundAllType(sa.value); }); }
  }
  $$('[data-snd-prev]').forEach(b=>{ if(b._tsb) return; b._tsb = 1;
    b.addEventListener('click', (ev)=>{ ev.stopPropagation(); playDoneSound(b.dataset.sndPrev); }); });
}

function setSoundEnabled(on){
  try{ localStorage.setItem(SND_KEY, on?'1':'0'); }catch(e){}
  _snd.enabled = on;
  const s = document.getElementById('cfgSoundDone'); if(s) s.checked = on;
  const c = document.getElementById('cpsSoundDone'); if(c) c.checked = on;
}

function setSoundVol(pct){
  pct = Math.min(100, Math.max(0, Math.round(pct||0)));
  _snd.vol = pct/100;
  try{ localStorage.setItem(SND_VOL_KEY, String(_snd.vol)); }catch(e){}
  const sv = document.getElementById('cfgSoundVol'); if(sv) sv.value = pct;
  const svl = document.getElementById('cfgSoundVolLabel'); if(svl) svl.textContent = pct + '%';
  const cv = document.getElementById('cpsSoundVol'); if(cv) cv.value = pct;
  const cvl = document.getElementById('cpsSoundVolLb'); if(cvl) cvl.textContent = pct + '%';
}

function bindPlannerSoundTool(){
  const ok = document.getElementById('cpsSoundDone');
  const vol = document.getElementById('cpsSoundVol');
  const lb = document.getElementById('cpsSoundVolLb');
  if(!ok && !vol) return;
  if(ok) ok.checked = _sndEnabled();
  if(vol){ vol.value = Math.round((_snd.vol||0)*100); if(lb) lb.textContent = vol.value + '%'; }
  if(ok && !ok._cpsBound){
    ok._cpsBound = true;
    ok.addEventListener('change', ()=> setSoundEnabled(!!ok.checked));
  }
  if(vol && !vol._cpsBound){
    vol._cpsBound = true;
    vol.addEventListener('input', ()=>{ setSoundVol(+vol.value||0); if(lb) lb.textContent = Math.round((_snd.vol||0)*100) + '%'; });
    vol.addEventListener('change', ()=>{ playDoneSound('single'); });   // 松开音量滑杆即试听一声
  }
}

function openToastBoard(){
  const old = $('#toastBoardPanel'); if(old) old.remove();
  const ov = document.createElement('div'); ov.id='toastBoardPanel'; ov.className='gs-overlay';
  const list = toastLogGet().slice().reverse();
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>📜 消息看板（${list.length}）</b>
        <span style="display:flex;gap:6px">
          <button class="btn small ghost" data-tb-clear>清空</button>
          <button class="gs-x" data-tb-close>✕</button>
        </span></div>
      <div class="cv-body">
        ${list.length ? list.map(x=>`<div class="tb-row"><span class="tb-ts">${new Date(x.ts).toLocaleString('zh-CN',{hour12:false})}</span><span class="tb-msg">${esc(x.msg)}</span></div>`).join('') : '<p class="muted">暂无消息记录。</p>'}
      </div>
    </div>`;
  ov.addEventListener('click', e=>{
    if(e.target.closest('[data-tb-close]') || e.target===ov){ ov.remove(); return; }
    if(e.target.closest('[data-tb-clear]')){ toastLogClear(); ov.remove(); openToastBoard(); return; }
  });
  document.body.appendChild(ov);
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    toast('已复制');
  }catch(e){
    const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); ta.remove(); toast('已复制');
  }
}

function esc(s){ return String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

function download(name, text){
  const blob = new Blob([text], {type:'text/markdown;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}

function countWords(text){
  text = String(text||'');
  const cjk = (text.match(CJK_ALL)||[]).length;
  const rest = text.replace(CJK_ALL, ' ');
  const en = (rest.match(EN_WORD)||[]).length;
  return {cjk, en, total: cjk + en};
}

function wcInner(w){
  const fmt = n => n.toLocaleString('en-US');
  return `📝 <b>${fmt(w.total)}</b><i>字</i>`;
}

function wcBadge(text, attrs){
  const w = countWords(text);
  return `<span class="wc" ${attrs||''} title="中文 ${w.cjk} 字 · 英文 ${w.en} 词">${wcInner(w)}</span>`;
}

function remainingEmptyChapters(){ return (state.chapters||[]).filter(c=> !(c.content && String(c.content).trim())).length; }

function uid(p){ return (p||'id')+(++R.uidSeq)+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }

function glmModels(){ return [
  {name:'glm-4.5-air', label:'GLM-4.5-Air（智谱 · 高性价比，现用）', kind:'pro'},
  {name:'glm-4.5',      label:'GLM-4.5（智谱 · 旗舰满血版）',      kind:'pro'}
]; }

function deepseekModels(){ return [
  {name:'deepseek-v4-pro', label:'deepseek-v4-pro（质量最高，推荐）', kind:'pro'},
  {name:'deepseek-v4-flash', label:'deepseek-v4-flash（最快/最便宜）', kind:'flash'},
  {name:'deepseek-v4-flash-vision-exp', label:'deepseek-v4-flash-vision-exp（带视觉）', kind:'flash'}
]; }

function defaultModels(){ return glmModels().concat(deepseekModels()); }

function cfgZhipuGroup(){ return {id:'zhipu', kind:'openai', label:'智谱 GLM', baseUrl:'https://open.bigmodel.cn/api/paas/v4', keys:[], models:glmModels(), keyInBody:false}; }

function cfgDeepSeekGroup(){ return {id:'deepseek', kind:'openai', label:'DeepSeek 官方', baseUrl:'https://api.deepseek.com', keys:[], models:deepseekModels()}; }

function normalizeCfg(cfg){
  cfg = cfg || {};
  if(!Array.isArray(cfg.groups)){
    const gz = cfgZhipuGroup();
    const gd = cfgDeepSeekGroup();
    if(cfg.apiKey){
      const id = uid('k');
      gd.keys.push({id, label:'默认账号', key:cfg.apiKey});
      cfg.groups = [gz, gd];
      cfg.active = { groupId:'deepseek', keyId:id, model: cfg.model || 'deepseek-v4-pro' };
    } else {
      cfg.groups = [gz, gd];
      cfg.active = { groupId:'zhipu', keyId: (gz.keys[0]||{}).id||null, model: (gz.models[0]||{}).name || 'glm-4.5-air' };
    }
  }
  const _seenG = new Set();
  cfg.groups.forEach(gr=>{
    if(!gr.id || _seenG.has(gr.id)) gr.id = uid('g');
    _seenG.add(gr.id);
  });
  cfg.groups.forEach((gr,i)=>{
    gr.kind = gr.kind || 'openai';
    gr.baseUrl = gr.baseUrl || '';
    gr.keyInBody = !!gr.keyInBody;
    gr.keys = (gr.keys||[]).map((k,j)=>({id: k.id||uid('k'), label: k.label||('账号'+(j+1)), key: k.key||''}));
    gr.models = (gr.models && gr.models.length) ? gr.models : defaultModels();
  });
  const act = cfg.active || {};
  const group = cfg.groups.find(g=>g.id===act.groupId) || cfg.groups[0];
  if(group){
    const key = group.keys.find(k=>k.id===act.keyId) || group.keys[0];
    const model = group.models.find(m=>m.name===act.model)
      || group.models.find(m=>m.name==='glm-4.5-air') || group.models[0];
    cfg.active = { groupId: group.id, keyId: key ? key.id : null, model: model ? model.name : (group.models[0] ? group.models[0].name : '') };
  } else {
    cfg.active = { groupId:null, keyId:null, model:'' };
  }
  const _srcTM = (cfg.taskModels && typeof cfg.taskModels === 'object') ? cfg.taskModels : {};
  const _tm = {};
  TM_KEYS.forEach(k=>{
    const v = _srcTM[k];
    _tm[k] = (v && typeof v==='object' && v.groupId && v.keyId && v.model)
      ? { groupId:String(v.groupId), keyId:String(v.keyId), model:String(v.model) } : '';
  });
  cfg.taskModels = _tm;
  return cfg;
}

function getCfg(){
  try{ return normalizeCfg(JSON.parse(localStorage.getItem(KEY_CFG)) || {}); }catch(e){ return normalizeCfg({}); }
}

function saveCfg(cfg){ localStorage.setItem(KEY_CFG, JSON.stringify(cfg)); }

function resolveActiveSpec(taskKey){
  const cfg = getCfg();
  const act = cfg.active || {};
  let group = cfg.groups.find(g=>g.id===act.groupId) || cfg.groups[0] || {};
  let key = (group.keys||[]).find(k=>k.id===act.keyId) || (group.keys||[])[0] || {};
  let model = (group.models||[]).find(m=>m.name===act.model) || (group.models||[])[0] || {};
  const _tm = taskKey ? (cfg.taskModels||{})[taskKey] : null;
  let _overridden = false;
  if(_tm){
    const tg = cfg.groups.find(g=>g.id===_tm.groupId);
    if(tg){
      const tk = (tg.keys||[]).find(k=>k.id===_tm.keyId) || (tg.keys||[])[0] || {};
      const tmod = (tg.models||[]).find(m=>m.name===_tm.model) || (tg.models||[])[0] || {};
      group = tg; key = tk; model = tmod; _overridden = true;
    }
  }
  return {
    taskKey: taskKey || '',
    taskOverride: _overridden,
    groupId: group.id, groupLabel: group.label,
    keyId: key.id, keyLabel: key.label,
    baseUrl: (group.baseUrl || 'https://api.deepseek.com').replace(/\/+$/, ''),
    apiKey: key.key || '',
    keyInBody: !!group.keyInBody,
    model: model.name || 'deepseek-v4-pro',
    temperature: (cfg.temperature==null ? 0.6 : cfg.temperature),
    ideaTemp:    (cfg.ideaTemp==null ? 0.5 : cfg.ideaTemp),
    principalTemp:(cfg.principalTemp==null ? 0.4 : cfg.principalTemp),
    teacherTemp: (cfg.teacherTemp==null ? 0.4 : cfg.teacherTemp),
    dictmasterTemp: (cfg.dictmasterTemp==null ? 0.4 : cfg.dictmasterTemp),
    dictEnrichTemp: (cfg.dictEnrichTemp==null ? 0.4 : cfg.dictEnrichTemp),
    assetsTemp:  (cfg.assetsTemp==null ? 0.7 : cfg.assetsTemp),
    titleTemp:   (cfg.titleTemp==null ? 0.5 : cfg.titleTemp),
    chapterTemp: (cfg.chapterTemp==null ? 0.5 : cfg.chapterTemp),
    qcTemp:      (cfg.qcTemp==null ? 0.2 : cfg.qcTemp),              // 分任务温度：词库提取（严谨低温）
    stripTemp:   (cfg.stripTemp==null ? 1.0 : cfg.stripTemp),
    subplotTemp: (cfg.subplotTemp==null ? 0.25 : cfg.subplotTemp),    // 分任务温度：支线进度更新（契约类窄采样）
    rollingTemp: (cfg.rollingTemp==null ? 0.3 : cfg.rollingTemp),    // 分任务温度：滚动摘要（忠实压缩）
    contentAdviseTemp: (cfg.contentAdviseTemp==null ? 0.6 : cfg.contentAdviseTemp),  // 分任务温度：内容建议（建议类）
    aiRecipeTemp:(cfg.aiRecipeTemp==null ? 0.9 : cfg.aiRecipeTemp)
  };
}

function currentSpecLabel(){
  const s = resolveActiveSpec();
  const model = s.model.replace('deepseek-v4-','').split('-')[0];
  return (s.groupLabel||'AI') + ' · ' + (s.keyLabel||'默认') + ' · ' + model;
}

function currentIsDeepSeek(){
  const s = resolveActiveSpec();
  return /deepseek/i.test(s.model||'') || /deepseek/i.test(s.groupId||'')
      || /doubao/i.test(s.model||'') || /doubao/i.test(s.groupId||'');
}

function applyTheme(theme){
  if(THEMES.indexOf(theme) < 0) theme = 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  const c = getCfg(); c.theme = theme; saveCfg(c);
  const mtn = $('#mechaTopNav');
  if(mtn) mtn.classList.toggle('hidden', theme !== 'mecha');
  document.body.classList.toggle('has-mecha-bg', theme === 'mecha');
  document.body.classList.toggle('has-cyber-bg', theme === 'cyber');
  document.body.classList.toggle('has-guofeng-bg', theme === 'guofeng');
  $$('.theme-btns .theme').forEach(b=> b.classList.toggle('active', b.dataset.theme === theme));
  updateMechaNav();
  updateWcTotal(); // 主题切换后刷新内嵌总字数
}

function restartCascade(){
  if(document.documentElement.getAttribute('data-theme') !== 'blackboard') return;
  const v = $('#view'); if(!v) return;
  v.style.animation = 'none'; void v.offsetWidth; v.style.animation = '';
}

function makeId(){ return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

export { startBgTask, endBgTask, updateBgTaskIndicator, lsKeyFor, _timeAnchorOn, _timeAnchorsAutoOn, _timeBranch, destroyCharTS, parseAge, toastLogPush, toastLogGet, toastLogClear, toast, _sndEnabled, _sndVol, unlockAudio, _sndBeep, _sndSingleType, _sndAllType, setSoundSingleType, setSoundAllType, _doPlaySound, playDoneSound, initThemeSoundPanel, setSoundEnabled, setSoundVol, bindPlannerSoundTool, openToastBoard, copyText, esc, download, countWords, wcInner, wcBadge, remainingEmptyChapters, uid, glmModels, deepseekModels, defaultModels, cfgZhipuGroup, cfgDeepSeekGroup, normalizeCfg, getCfg, saveCfg, resolveActiveSpec, currentSpecLabel, currentIsDeepSeek, applyTheme, restartCascade, makeId };
