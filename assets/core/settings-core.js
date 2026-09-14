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
const renderGroupsList = (...a) => (W.renderGroupsList ? W.renderGroupsList(...a) : (typeof _m3?.renderGroupsList === 'function' ? _m3.renderGroupsList(...a) : undefined));
const renderGroupDetail = (...a) => (W.renderGroupDetail ? W.renderGroupDetail(...a) : (W.TellMeLegacyDomains?.['settings-domain']?.renderGroupDetail ? W.TellMeLegacyDomains['settings-domain'].renderGroupDetail(...a) : undefined));
const renderActiveSelects = (...a) => (W.renderActiveSelects ? W.renderActiveSelects(...a) : (W.TellMeLegacyDomains?.['settings-domain']?.renderActiveSelects ? W.TellMeLegacyDomains['settings-domain'].renderActiveSelects(...a) : undefined));
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


function _dg(){ return (getEditCfg() && getEditCfg().groups && (getEditCfg().groups.find(x=>x.id===getSelGroupId()) || getEditCfg().groups[0])) || null; }

function renderGroupDetail(){
  const el=$('#groupDetail'); if(!el) return;
  const g=_dg();
  if(!g){ el.innerHTML='<div class="muted">选择左侧一个服务，或点上方「＋ 新增组」添加。</div>'; return; }
  setSelGroupId(g.id);
  const R = globalThis.TellMeRuntime || {};
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
      </div>`).join('') : '<div class="muted">该组还没有账号，点「＋ 账号」直接新增。</div>'}
    <div class="gd-title">模型清单</div>
    ${R.showAddModel ? `
      <div class="add-model-panel" style="margin-bottom:8px;padding:8px 10px;background:var(--panel2);border:1px dashed var(--accent,#58a6ff);border-radius:8px">
        <div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--txt)">添加 AI 模型</div>
        <div style="display:flex;gap:6px;align-items:center">
          <input class="m-add-input" type="text" placeholder="输入模型名，如 deepseek-chat 或 gpt-4o" style="flex:1;padding:5px 8px;font-size:12px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--txt)">
          <button class="btn small primary m-confirm-add" type="button">确定添加</button>
          <button class="btn small ghost m-cancel-add" type="button">取消</button>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;align-items:center">
          <span style="font-size:11px;color:var(--muted)">推荐：</span>
          <button type="button" class="btn small ghost m-tag" data-val="deepseek-chat">deepseek-chat</button>
          <button type="button" class="btn small ghost m-tag" data-val="deepseek-reasoner">deepseek-reasoner</button>
          <button type="button" class="btn small ghost m-tag" data-val="glm-4-flash">glm-4-flash</button>
          <button type="button" class="btn small ghost m-tag" data-val="gpt-4o-mini">gpt-4o-mini</button>
          <button type="button" class="btn small ghost m-tag" data-val="claude-3-5-sonnet">claude-3-5-sonnet</button>
        </div>
      </div>
    ` : ''}
    ${g.models.length ? g.models.map(m=>`
      <div class="model-row">
        <span class="m-name">${esc(m.name)}</span>
        ${m.kind==='flash' ? '<span class="pill tag-warn">最快/最便宜</span>' : ''}
        <button class="btn small ghost del" data-act="delmodel" data-name="${esc(m.name)}" type="button">删</button>
      </div>`).join('') : '<div class="muted">请点「＋ 模型」添加模型名。</div>'}
  `;
  el.onclick = onDetail;

  const addPanel = el.querySelector('.add-model-panel');
  if (addPanel) {
    const inp = addPanel.querySelector('.m-add-input');
    const doAddM = (nameVal) => {
      const n = (nameVal || (inp && inp.value) || '').trim();
      if (!n) { toast('模型名不能为空'); if (inp) inp.focus(); return; }
      g.models.push({ name: n, label: n, kind: n.includes('flash') ? 'flash' : '' });
      R.showAddModel = false;
      refreshAfter();
      toast('已添加模型：' + n);
    };
    addPanel.querySelectorAll('.m-tag').forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); doAddM(btn.dataset.val); };
    });
    const confBtn = addPanel.querySelector('.m-confirm-add');
    if (confBtn) confBtn.onclick = (e) => { e.stopPropagation(); doAddM(); };
    const cancBtn = addPanel.querySelector('.m-cancel-add');
    if (cancBtn) cancBtn.onclick = (e) => { e.stopPropagation(); R.showAddModel = false; renderGroupDetail(); };
    if (inp) {
      inp.onkeydown = (e) => { if (e.key === 'Enter') { e.stopPropagation(); doAddM(); } };
      setTimeout(() => inp?.focus?.(), 30);
    }
  }

  el.querySelectorAll('.k-lab').forEach(inp=> inp.onchange=()=>{ const gg=_dg(); if(gg&&gg.keys[+inp.dataset.idx]) gg.keys[+inp.dataset.idx].label = inp.value || ('账号'+(+inp.dataset.idx+1)); });
  el.querySelectorAll('.k-key').forEach(inp=> { inp.onchange=()=>{ const gg=_dg(); if(gg&&gg.keys[+inp.dataset.idx]){ gg.keys[+inp.dataset.idx].key = inp.value.trim(); updateCfgBadge(); } }; });
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
  const base = el.querySelector('.g-base'); if(base) base.onchange=(ev)=>{ const gg=_dg(); if(gg) gg.baseUrl = ev.target.value.trim(); };
  const kib = el.querySelector('.g-kib-cb'); if(kib) kib.onchange=(ev)=>{ const gg=_dg(); if(gg) gg.keyInBody = ev.target.checked; };
}

function onDetail(ev){
  const b = ev.target && ev.target.closest('[data-act]'); if(!b) return;
  const act = b.dataset.act, g = _dg(); if(!g) return;
  const R = globalThis.TellMeRuntime || {};
  if(act==='addkey'){
    g.keys.push({ id: uid('k'), label:'账号'+(g.keys.length+1), key:'' });
    refreshAfter();
    setTimeout(() => {
      const inputs = document.querySelectorAll('#groupDetail .k-key');
      if (inputs.length) inputs[inputs.length - 1]?.focus?.();
    }, 50);
    toast('已新增账号，请在输入框内输入或粘贴 API Key');
    return;
  } else if(act==='addmodel'){
    R.showAddModel = !R.showAddModel;
    renderGroupDetail();
    return;
  } else if(act==='delkey'){
    g.keys = g.keys.filter(x=>x.id!==b.dataset.id);
  } else if(act==='delmodel'){
    g.models = g.models.filter(x=>x.name!==b.dataset.name);
  } else if(act==='delgroup'){
    let ok = true;
    try {
      ok = window.confirm ? window.confirm(`确定删除「${g.label}」服务组吗？`) : true;
    } catch(e) { ok = true; }
    if (!ok) return;
    getEditCfg().groups = getEditCfg().groups.filter(x=>x.id!==g.id);
    setSelGroupId(null);
    R.selGroupId = null;
    toast('已删除服务组');
  }
  refreshAfter();
}

function refreshAfter(){ renderGroupsList(); renderGroupDetail(); renderActiveSelects(); updateCfgBadge(); }

function addGroup(){
  const R = globalThis.TellMeRuntime || {};
  R.showAddGroup = !R.showAddGroup;
  renderGroupsList();
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

  if (R.showAddGroup) {
    const card = document.createElement('div');
    card.className = 'new-group-card';
    card.style.cssText = 'padding:10px;margin-bottom:8px;background:var(--panel2);border:1px dashed var(--accent,#58a6ff);border-radius:10px';
    card.innerHTML = `
      <div style="font-size:12px;font-weight:700;color:var(--txt);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
        <span>新增服务商 / 组</span>
        <button class="btn small ghost g-cancel-new" type="button">✕</button>
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">
        <button type="button" class="btn small ghost g-preset" data-label="DeepSeek" data-base="https://api.deepseek.com">DeepSeek</button>
        <button type="button" class="btn small ghost g-preset" data-label="Kimi" data-base="https://api.moonshot.cn/v1">Kimi</button>
        <button type="button" class="btn small ghost g-preset" data-label="智谱 GLM" data-base="https://open.bigmodel.cn/api/paas/v4">智谱</button>
        <button type="button" class="btn small ghost g-preset" data-label="硅基流动" data-base="https://api.siliconflow.cn/v1">硅基流动</button>
        <button type="button" class="btn small ghost g-preset" data-label="OpenRouter" data-base="https://openrouter.ai/api/v1">OpenRouter</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <input class="g-new-label" type="text" placeholder="服务名称（如：Kimi / 我的中转）" style="padding:5px 8px;font-size:12px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--txt)">
        <input class="g-new-base" type="text" placeholder="接口地址（如 https://api.deepseek.com）" style="padding:5px 8px;font-size:12px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--txt)">
        <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:2px">
          <button type="button" class="btn small ghost g-cancel-new">取消</button>
          <button type="button" class="btn small primary g-confirm-new">确认添加</button>
        </div>
      </div>
    `;
    const lblInp = card.querySelector('.g-new-label');
    const baseInp = card.querySelector('.g-new-base');
    card.querySelectorAll('.g-preset').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        lblInp.value = btn.dataset.label || '';
        baseInp.value = btn.dataset.base || '';
      };
    });
    card.querySelectorAll('.g-cancel-new').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        R.showAddGroup = false;
        renderGroupsList();
      };
    });
    const doAddGroup = () => {
      const label = (lblInp.value || '').trim();
      if (!label) {
        if (typeof W.toast === 'function') W.toast('服务名称不能为空');
        lblInp.focus();
        return;
      }
      const base = (baseInp.value || '').trim();
      const cfg = R.editCfg || (typeof W.getEditCfg === 'function' ? W.getEditCfg() : null);
      if (!cfg) return;
      if (!Array.isArray(cfg.groups)) cfg.groups = [];
      const defModels = (typeof W.defaultModels === 'function') ? W.defaultModels() : [{ name: 'deepseek-chat', label: 'deepseek-chat' }];
      const makeUid = (typeof W.uid === 'function') ? W.uid : (p => p + '_' + Math.random().toString(36).slice(2, 8));
      const g = { id: makeUid('g'), kind: 'openai', label, baseUrl: base, keys: [], models: defModels, keyInBody: false };
      cfg.groups.push(g);
      R.selGroupId = g.id;
      if (typeof W.setSelGroupId === 'function') W.setSelGroupId(g.id);
      R.showAddGroup = false;
      if (typeof W.refreshAfter === 'function') W.refreshAfter();
      else {
        renderGroupsList();
        W.renderGroupDetail?.();
        W.renderActiveSelects?.();
        W.updateCfgBadge?.();
      }
      if (typeof W.toast === 'function') W.toast('已新建服务组：' + label);
    };
    const confirmBtn = card.querySelector('.g-confirm-new');
    if (confirmBtn) confirmBtn.onclick = (e) => { e.stopPropagation(); doAddGroup(); };
    lblInp.onkeydown = (e) => { if (e.key === 'Enter') { e.stopPropagation(); doAddGroup(); } };
    baseInp.onkeydown = (e) => { if (e.key === 'Enter') { e.stopPropagation(); doAddGroup(); } };
    el.appendChild(card);
    setTimeout(() => lblInp?.focus?.(), 30);
  }

  if(!R.editCfg || !Array.isArray(R.editCfg.groups) || !R.editCfg.groups.length){
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'muted';
    emptyDiv.textContent = '暂无服务，点上方「＋ 新增组」添加。';
    el.appendChild(emptyDiv);
    return;
  }
  R.editCfg.groups.forEach(g=>{
    if(!R.selGroupId) R.selGroupId = g.id;
    const d = document.createElement('div');
    d.className = 'group-item' + (g.id === R.selGroupId ? ' active' : '');
    d.innerHTML = `<span class="gi-label">${esc(g.label)}</span><span class="gi-meta">${g.keys.length} 账号 · ${g.models.length} 模型</span>`;
    d.onclick = ()=>{ R.selGroupId = g.id; if (typeof W.setSelGroupId === 'function') W.setSelGroupId(g.id); renderGroupsList(); W.renderGroupDetail?.(); };
    el.appendChild(d);
  });
}

return Object.freeze({renderGroupsList});
})();

export const settings_coreModules = Object.freeze([_m0, _m1, _m2, _m3]);
