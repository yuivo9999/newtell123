/** v41 consolidated module: settings-core.js */
// ---- merged source: settings-core.js ----
const _m0 = (() => {
// Extracted from app-legacy.js.
const W=globalThis;
const getR = () => W.TellMeRuntime || (W.TellMeRuntime = {});
const R = new Proxy({}, {
  get(_, p){ return getR()[p]; },
  set(_, p, v){ getR()[p] = v; return true; }
});
const $ = (s, r = document) => (r || document).querySelector(s);
const getCfg = (...a) => (W.getCfg ? W.getCfg(...a) : (W.TellMeLegacyFoundation?.getCfg ? W.TellMeLegacyFoundation.getCfg(...a) : { groups: [], active: {} }));
const renderGroupsList = (...a) => W.renderGroupsList?.(...a);
const renderGroupDetail = (...a) => W.renderGroupDetail?.(...a);
const renderActiveSelects = (...a) => W.renderActiveSelects?.(...a);
const updateTmBadge = (...a) => W.updateTmBadge?.(...a);
function openSettings(){
  R.editCfg = JSON.parse(JSON.stringify(getCfg()));
  R.selGroupId = R.editCfg.active ? R.editCfg.active.groupId : ((R.editCfg.groups && R.editCfg.groups[0]) ? R.editCfg.groups[0].id : null);
  $('#settingsModal').classList.remove('hidden');
  echoTemps();
  const st = $('#cfgStatus'); if(st){ st.className='status'; st.textContent=''; }
  renderGroupsList(); renderGroupDetail(); renderActiveSelects(); updateCfgBadge();
}

function closeSettings(){ $('#settingsModal').classList.add('hidden'); }

function echoTemps(){
  const c = R.editCfg || getCfg();
  $('#cfgTemp').value = (c.temperature==null ? '' : c.temperature);
}

function saveTemps(){
  const rd = (id, def)=>{ const v=parseFloat($(id) && $(id).value); return isNaN(v)?def:v; };
  if(R.editCfg) R.editCfg.temperature = rd('#cfgTemp', 0.7);
  const live = getCfg();
  const TM_FIELDS = ['ideaTemp','principalTemp','teacherTemp','dictmasterTemp','dictEnrichTemp','assetsTemp','titleTemp','chapterTemp','qcTemp','stripTemp','subplotTemp','rollingTemp','contentAdviseTemp','aiRecipeTemp'];
  TM_FIELDS.forEach(f=>{ if(live && typeof live[f]==='number' && R.editCfg) R.editCfg[f]=live[f]; });
}

function _curSpec(){
  const cfg = (R.editCfg && R.editCfg.groups) ? R.editCfg : getCfg();
  const act = (cfg && cfg.active) || {};
  const groups = (cfg && Array.isArray(cfg.groups)) ? cfg.groups : [];
  const g = groups.find(x=>x.id===act.groupId) || groups[0];
  const m = g && ((g.models && g.models.find(x=>x.name===act.model)) || (g.models && g.models[0]));
  const k = g && ((g.keys && g.keys.find(x=>x.id===act.keyId)) || (g.keys && g.keys[0]));
  return { group: g?g.label:'', key: k?k.label:'', model: m?m.name:'', flash: !!(m && m.kind==='flash') };
}

function shortModel(name){
  if(!name) return '';
  if(name.indexOf('deepseek-v4-')===0) return name.replace('deepseek-v4-','');
  const parts=name.split('-');
  return parts.length>1 ? parts.slice(-1)[0] : name;
}

function updateCfgBadge(){
  const b=$('#cfgBadge'); if(!b) return;
  const s=_curSpec();
  b.textContent = (s.group?'':'AI') + s.group + ' · ' + (shortModel(s.model)||'未选') + (s.flash?' ⚡':'');
  if(b.title != null) b.title='当前模型：'+s.group+' · '+s.key+' · '+s.model+'（点击切换）';
  updateTmBadge();
}

return Object.freeze({openSettings, closeSettings, echoTemps, saveTemps, _curSpec, shortModel, updateCfgBadge});
})();

// ---- merged source: settings-group-editor.js ----
const _m1 = (() => {
/* v31: cohesive legacy region — settings-group-editor */

function install(deps){
  let {
    copyText,
    defaultModels,
    esc,
    getEditCfg,
    getSelGroupId,
    renderGroupsList,
    setEditCfg,
    setSelGroupId,
    toast,
    uid,
    updateCfgBadge
  } = deps;
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];


function _dg(){ return getEditCfg().groups.find(x=>x.id===getSelGroupId()) || getEditCfg().groups[0]; }

function renderGroupDetail(){
  const el=$('#groupDetail'); if(!el) return;
  const g=_dg();
  if(!g){ el.innerHTML='<div class="muted">选择左侧一个服务，或点上方「＋ 新增组」添加。</div>'; return; }
  setSelGroupId(g.id);
  el.innerHTML = `
    <div class="set-block-head">
      <span>${esc(g.label)} · 详情</span>
      <span class="gd-acts">
        <button class="btn small ghost" data-act="addkey" type="button">＋ 账号</button>
        <button class="btn small ghost" data-act="addmodel" type="button">＋ 模型</button>
        ${g.id!=='deepseek' ? '<button class="btn small ghost del" data-act="delgroup" type="button">删组</button>' : ''}
      </span>
    </div>
    <label class="field"><span>接口地址（OpenAI 兼容协议）</span>
      <input class="g-base" type="text" value="${esc(g.baseUrl)}" placeholder="https://api.deepseek.com">
    </label>
    <label class="mini-check g-kib" title="部分 Cloudflare 中转不读 Authorization 头，要求把 Key 放进请求体 api_key 字段。开启后请求将不再携带 Bearer 头。">
      <input type="checkbox" class="g-kib-cb" ${g.keyInBody?'checked':''}> API Key 放请求体（api_key）传递，规避 Bearer 头
    </label>
    <div class="gd-title">账号（API Key 仅存本机，多账号=多卡分流）</div>
    ${g.keys.length ? g.keys.map((k,i)=>`
      <div class="key-row">
        <input class="k-lab" data-idx="${i}" type="text" value="${esc(k.label)}" placeholder="备注">
        <input class="k-key" data-idx="${i}" type="password" value="${esc(k.key)}" placeholder="sk-..." autocomplete="off">
        <button class="btn small ghost k-eye" data-key-eye="${i}" type="button" title="显示/隐藏 Key">👁</button>
        <button class="btn small ghost k-copy" data-key-copy="${i}" type="button" title="复制 Key">📋</button>
        <button class="btn small ghost del" data-act="delkey" data-id="${k.id}" type="button">删</button>
      </div>`).join('') : '<div class="muted">该组还没有账号，点「＋ 账号」粘贴 API Key。</div>'}
    <div class="gd-title">模型清单</div>
    ${g.models.length ? g.models.map(m=>`
      <div class="model-row">
        <span class="m-name">${esc(m.name)}</span>
        ${m.kind==='flash' ? '<span class="pill tag-warn">最快/最便宜</span>' : ''}
        <button class="btn small ghost del" data-act="delmodel" data-name="${esc(m.name)}" type="button">删</button>
      </div>`).join('') : '<div class="muted">请点「＋ 模型」添加模型名。</div>'}
  `;
  el.onclick = onDetail;
  el.querySelectorAll('.k-lab').forEach(inp=> inp.onchange=()=>{ const gg=_dg(); gg.keys[+inp.dataset.idx].label = inp.value || ('账号'+(+inp.dataset.idx+1)); });
  el.querySelectorAll('.k-key').forEach(inp=> { inp.onchange=()=>{ const gg=_dg(); gg.keys[+inp.dataset.idx].key = inp.value.trim(); updateCfgBadge(); }; });
  el.querySelectorAll('[data-key-eye]').forEach(btn=>{
    btn.onclick = ()=>{
      const inp = el.querySelector('.k-key[data-idx="'+btn.dataset.keyEye+'"]');
      if(!inp) return;
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.textContent = show ? '🙈' : '👁';
      btn.title = show ? '隐藏 Key' : '显示 Key';
    };
  });
  el.querySelectorAll('[data-key-copy]').forEach(btn=>{
    btn.onclick = ()=>{
      const inp = el.querySelector('.k-key[data-idx="'+btn.dataset.keyCopy+'"]');
      if(!inp || !inp.value.trim()){ toast('该账号暂无 Key'); return; }
      copyText(inp.value.trim());
    };
  });
  const base = el.querySelector('.g-base'); if(base) base.onchange=(ev)=>{ const gg=_dg(); gg.baseUrl = ev.target.value.trim(); };
  const kib = el.querySelector('.g-kib-cb'); if(kib) kib.onchange=(ev)=>{ const gg=_dg(); gg.keyInBody = ev.target.checked; };
}

function onDetail(ev){
  const b = ev.target && ev.target.closest('[data-act]'); if(!b) return;
  const act = b.dataset.act, g = _dg(); if(!g) return;
  if(act==='addkey'){
    const v=prompt('粘贴该账号的 API Key（sk-...）：');
    if(v==null) return;
    if(!v.trim()){ toast('Key 为空，未添加'); return; }
    g.keys.push({ id: uid('k'), label:'账号'+(g.keys.length+1), key:v.trim() });
  } else if(act==='addmodel'){
    const n=prompt('模型名（如 deepseek-v4-flash 或第三方模型名）：');
    if(n==null) return;
    if(!n.trim()){ toast('模型名为空，未添加'); return; }
    g.models.push({ name:n.trim(), label:n.trim(), kind:'' });
  } else if(act==='delkey'){
    g.keys = g.keys.filter(x=>x.id!==b.dataset.id);
  } else if(act==='delmodel'){
    g.models = g.models.filter(x=>x.name!==b.dataset.name);
  } else if(act==='delgroup'){
    getEditCfg().groups = getEditCfg().groups.filter(x=>x.id!==g.id);
    setSelGroupId(null);
  }
  refreshAfter();
}

function refreshAfter(){ renderGroupsList(); renderGroupDetail(); renderActiveSelects(); updateCfgBadge(); }

function addGroup(){
  const label=prompt('新服务名称（如：Kimi / 智谱 / 我的中转）：');
  if(label==null) return;
  if(!label.trim()){ toast('名称为空，未添加'); return; }
  const base=prompt('接口地址（OpenAI 兼容，如 https://api.deepseek.com）：','');
  const g={ id:uid('g'), kind:'openai', label:label.trim(), baseUrl:(base||'').trim(), keys:[], models:defaultModels(), keyInBody:false };
  getEditCfg().groups.push(g); setSelGroupId(g.id); refreshAfter();
}

function renderActiveSelects(){
  const selG=$('#c_selGroup'), selK=$('#c_selKey'), selM=$('#c_selModel');
  if(!selG || !getEditCfg()) return;
  const act = getEditCfg().active || {};
  selG.innerHTML = getEditCfg().groups.map(g=>`<option value="${esc(g.id)}">${esc(g.label)}</option>`).join('');
  selG.value = getEditCfg().groups.some(g=>g.id===act.groupId) ? act.groupId : (getEditCfg().groups[0]?getEditCfg().groups[0].id:'');
  const g = getEditCfg().groups.find(x=>x.id===selG.value) || getEditCfg().groups[0];
  const keys = g?g.keys:[];
  selK.innerHTML = keys.map(k=>`<option value="${esc(k.id)}">${esc(k.label)}${k.key?'':'（未填）'}</option>`).join('');
  selK.value = keys.some(k=>k.id===act.keyId) ? act.keyId : (keys[0]?keys[0].id:'');
  const models = g?g.models:[];
  selM.innerHTML = models.map(m=>`<option value="${esc(m.name)}">${esc(m.label)}${m.kind==='flash'?' ⚡':''}</option>`).join('');
  selM.value = models.some(m=>m.name===act.model) ? act.model : (models[0]?models[0].name:'');
}

  const api = {
    _dg,
    renderGroupDetail,
    onDetail,
    refreshAfter,
    addGroup,
    renderActiveSelects
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns["settings-group-editor"] = Object.freeze(api);
  return ns["settings-group-editor"];
}

return Object.freeze({install});
})();

// ---- merged source: settings-save-test.js ----
const _m2 = (() => {
/* v31: cohesive legacy region — settings-save-test */

function install(deps){
  let {
    callDeepSeek,
    getEditCfg,
    saveCfg,
    saveTemps,
    setEditCfg,
    toast,
    unwrapAIResult,
    updateCfgBadge
  } = deps;
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];


function saveSettings(){
  if(!getEditCfg()){ return; }
  saveTemps();
  const selG=$('#c_selGroup'), selK=$('#c_selKey'), selM=$('#c_selModel');
  if(selG){
    const gId=selG.value || (getEditCfg().groups[0] && getEditCfg().groups[0].id);
    getEditCfg().active = { groupId:gId, keyId:(selK&&selK.value)||null, model:(selM&&selM.value)||'' };
  }
  saveCfg(getEditCfg());
  const st=$('#cfgStatus'); if(st){ st.className='status ok'; st.textContent='已保存到本机浏览器。'; }
  toast('配置已保存');
  updateCfgBadge();
}

async function testConn(){
  const st = $('#cfgStatus'); if(st){ st.className='status'; st.textContent='测试中…'; }
  saveSettings();
  try{
    const r = window.unwrapAIResult(await callDeepSeek('你是测试助手，只回复「ok」。','你好'));
    if(st){ st.className='status ok'; st.textContent='连接成功：'+r.slice(0,20); }
  }catch(e){
    if(st){
      st.className='status err';
      let msg = e.message;
      if(/insufficient balance/i.test(msg)) msg += '（账户余额不足，请到对应控制台充值，不是 Key 填错）';
      else if(/not found.*model/i.test(msg)) msg += '（模型名不存在，请检查当前所选模型）';
      st.textContent='连接失败：'+msg;
    }
  }
}

  const api = {
    saveSettings,
    testConn
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns["settings-save-test"] = Object.freeze(api);
  return ns["settings-save-test"];
}

return Object.freeze({install});
})();

// ---- merged source: groups.js ----
const _m3 = (() => {
const W = typeof window !== 'undefined' ? window : globalThis;
const getR = () => W.TellMeRuntime || {};
const $ = (s, r = document) => r.querySelector(s);
const esc = (...args) => (getR().esc ? getR().esc(...args) : (args[0] != null ? String(args[0]) : ''));

function renderGroupsList(){
  const R = getR();
  const el = $('#groupsList'); if(!el) return;
  el.innerHTML = '';
  if(!R.editCfg || !Array.isArray(R.editCfg.groups) || !R.editCfg.groups.length){
    el.innerHTML = '<div class="muted">暂无服务，点上方「＋ 新增组」添加。</div>';
    return;
  }
  R.editCfg.groups.forEach(g=>{
    if(!R.selGroupId) R.selGroupId = g.id;
    const d = document.createElement('div');
    d.className = 'group-item' + (g.id === R.selGroupId ? ' active' : '');
    d.innerHTML = `<span class="gi-label">${esc(g.label)}</span><span class="gi-meta">${g.keys.length} 账号 · ${g.models.length} 模型</span>`;
    d.onclick = ()=>{ R.selGroupId = g.id; renderGroupsList(); W.renderGroupDetail?.(); };
    el.appendChild(d);
  });
}

return Object.freeze({renderGroupsList});
})();

export const settings_coreModules = Object.freeze([_m0, _m1, _m2, _m3]);
