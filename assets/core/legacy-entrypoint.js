/* v31: cohesive legacy region — legacy-entrypoint */

export function install(deps){
  let {
    addGroup,
    applyTheme,
    closeHistPanel,
    closeSettings,
    closeThemePanel,
    closeWsColorPanel,
    getCfg,
    getCurrentStep,
    getEditCfg,
    guardSwitchStep,
    initThemeSoundPanel,
    loadGlib,
    loadState,
    openAiLogPanel,
    openSettings,
    openTaskModelPanel,
    openThemePanel,
    rebindHistPanel,
    rebindNarrativeEngine,
    rebindWsColorPanel,
    render,
    renderActiveSelects,
    requestCloseTaskModelPanel,
    resetTaskModels,
    saveCfg,
    saveSettings,
    saveTaskModels,
    saveTemps,
    setCurrentStep,
    setEditCfg,
    showBootLoading,
    state,
    testConn,
    toast,
    updateCfgBadge
  } = deps;
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];


async function init(){
  showBootLoading(true);
  try{ await loadState(); }catch(e){ /* 兜底：保持空白 state，不卡死 */ }
  loadGlib();
  const c = getCfg();
  applyTheme(c.theme || 'dark');
  $('#btnSettings').onclick = openSettings;
  const btnLog = $('#btnAiLog');
  if(btnLog) btnLog.onclick = (e)=>{ e.stopPropagation(); openAiLogPanel(); };
  rebindHistPanel();
  rebindWsColorPanel();
  const btnTheme = $('#btnTheme');
  if(btnTheme) btnTheme.onclick = (e)=>{
    e.stopPropagation();
    const p=$('#themePanel');
    if(!p) return;
    if(p.classList.contains('hidden')){
      if(typeof openThemePanel === 'function') openThemePanel();
      else if(window.openThemePanel) window.openThemePanel();
      else if(window.TellMeThemePanel?.openThemePanel) window.TellMeThemePanel.openThemePanel();
      else p.classList.remove('hidden');
    } else {
      if(typeof closeThemePanel === 'function') closeThemePanel();
      else if(window.closeThemePanel) window.closeThemePanel();
      else if(window.TellMeThemePanel?.closeThemePanel) window.TellMeThemePanel.closeThemePanel();
      else p.classList.add('hidden');
    }
  };
  initThemeSoundPanel();
  rebindNarrativeEngine();
  const btnTS = $('#btnTempSave');
  if(btnTS) btnTS.onclick = (e)=>{
    e.stopPropagation();
    if(!getEditCfg()) setEditCfg(JSON.parse(JSON.stringify(getCfg())));
    saveTemps();
    saveCfg(getEditCfg());
    updateCfgBadge();
    toast('温度已保存');
  };
  document.addEventListener('click', (e)=>{
    const t = $('#themePanel'); if(t && !t.classList.contains('hidden') && !t.contains(e.target) && !e.target.closest('#btnTheme')) {
      if (typeof closeThemePanel === 'function') closeThemePanel();
      else if (window.closeThemePanel) window.closeThemePanel();
      else t.classList.add('hidden');
    }
    const h = $('#histPanel'); if(h && !h.classList.contains('hidden') && !h.contains(e.target) && !e.target.closest('#btnHist')) {
      if (typeof closeHistPanel === 'function') closeHistPanel();
      else if (window.closeHistPanel) window.closeHistPanel();
      else h.classList.add('hidden');
    }
    const col = $('#wsColorPanel'); if(col && !col.classList.contains('hidden') && !col.contains(e.target) && !e.target.closest('#btnWsColor')) {
      if (typeof closeWsColorPanel === 'function') closeWsColorPanel();
      else if (window.closeWsColorPanel) window.closeWsColorPanel();
      else col.classList.add('hidden');
    }
  });
  $$('[data-close]').forEach(b=> b.onclick = closeSettings);
  $('#btnCfgSave').onclick = ()=>{ saveSettings(); closeSettings(); };
  $('#btnCfgTest').onclick = testConn;
  $('#btnTaskModels').onclick = openTaskModelPanel;
  $('#btnTmSave').onclick = saveTaskModels;
  $('#btnTmReset').onclick = resetTaskModels;
  $$('#taskModelModal [data-tm-close]').forEach(el=> el.onclick = requestCloseTaskModelPanel);
  const btnAddG = $('#btnAddGroup'); if(btnAddG) btnAddG.onclick = addGroup;
  const selG=$('#c_selGroup'), selK=$('#c_selKey'), selM=$('#c_selModel');
  if(selG) selG.onchange = ()=>{ const ecfg = getEditCfg(); if(ecfg){ ecfg.active.groupId = selG.value; renderActiveSelects(); updateCfgBadge(); } };
  if(selK) selK.onchange = ()=>{ const ecfg = getEditCfg(); if(ecfg){ ecfg.active.keyId = selK.value; updateCfgBadge(); } };
  if(selM) selM.onchange = ()=>{ const ecfg = getEditCfg(); if(ecfg){ ecfg.active.model = selM.value; updateCfgBadge(); } };
  const cfgBadge=$('#cfgBadge'); if(cfgBadge) cfgBadge.onclick = openSettings;
  updateCfgBadge();
  $$('.theme-btns .theme').forEach(b=> b.onclick = (e)=>{
    e.stopPropagation();
    const fn = (typeof applyTheme === 'function' ? applyTheme : (window.applyTheme || window.TellMeLegacyFoundation?.applyTheme));
    if (typeof fn === 'function') fn(b.dataset.theme);
    else document.documentElement?.setAttribute('data-theme', b.dataset.theme);
    if (typeof closeThemePanel === 'function') closeThemePanel();
    else if (window.closeThemePanel) window.closeThemePanel();
    else $('#themePanel')?.classList.add('hidden');
  });
  const mtn = $('#mechaTopNav');
  if(mtn){
    $$('.cap', mtn).forEach(c=> c.onclick = ()=>{
      if(c.dataset.export){ setCurrentStep(5); }
      else { setCurrentStep(+c.dataset.step); }
      render(); window.scrollTo(0,0);
    });
  }
  $$('.tab').forEach(t=> t.onclick = ()=>{ if(!guardSwitchStep()) return; setCurrentStep(+t.dataset.step); render(); window.scrollTo(0,0); });
  showBootLoading(false);
  render();
}

  const api = {
    init
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns["legacy-entrypoint"] = Object.freeze(api);
  return ns["legacy-entrypoint"];
}
