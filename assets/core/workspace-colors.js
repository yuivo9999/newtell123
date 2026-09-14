// Extracted from app-legacy.js; legacy UI/runtime bridge.
const W = globalThis;
const state = W.TellMeRuntime?.state ?? W.state;
const $=W.$, esc=W.esc, toast=W.toast, getCfg=W.getCfg, saveCfg=W.saveCfg, wsUndoLog=W.wsUndoLog, wsRemovedBuiltin=W.wsRemovedBuiltin, wsColorSchemeId=W.wsColorSchemeId, wsCustomColors=W.wsCustomColors, wsColorSchemesList=W.wsColorSchemesList, wsColorCfgOf=W.wsColorCfgOf, WS_COLOR_SCHEMES=W.WS_COLOR_SCHEMES, wsSchemeName=W.wsSchemeName, rebuildCustomColorCss=W.rebuildCustomColorCss, render=W.render;
export function wsColorToolbarHtml(){
  const undoN = wsUndoLog().length, rmB = wsRemovedBuiltin().length;
  return `<div class="ws-cs-toolbar">
    <button type="button" class="cs-tool" data-cs-undo ${undoN?'':'disabled'} title="撤销上一步删除">↩ 撤销</button>
    <button type="button" class="cs-tool" data-cs-restore ${rmB?'':'disabled'} title="仅恢复项目自带的 11 套内置配色（不影响你自建的配色）">↺ 恢复全部</button>
    <span class="ws-cs-spacer"></span>
    <button type="button" class="cs-tool cs-tool-new" data-cs-new title="新建一套配色">＋ 新建配色</button>
  </div>`;
}

export function wsColorGridHtml(){
  const cur = wsColorSchemeId();
  const customIds = wsCustomColors().map(s=>s.id);
  return wsColorSchemesList().map(s=>{
    const isCustom = customIds.includes(s.id);
    return `<div class="ws-cs-item${cur===s.id?' active':''}" data-cs="${s.id}" title="点击应用「${esc(s.name)}」">
      <div class="ws-cs-top">
        <span class="ws-cs-name">${esc(s.name)}${isCustom?'<i class="ws-cs-tag">我的</i>':''}</span>
        ${s.id==='none'?'':`<button type="button" class="ws-cs-del" data-cs-del="${s.id}" title="删除此配色">✕</button>`}
      </div>
      <div class="ws-cs-bars">
        ${(s.c&&s.c.length)? s.c.map(c=>`<i style="background:${c}"></i>`).join('') : `<i class="ws-cs-none">无</i>`}
      </div>
    </div>`;
  }).join('');
}

export function wsColorNewFormHtml(){
  return `<div id="wsCsForm" class="ws-cs-form hidden">
    <div class="ws-cs-form-row"><label>名称</label><input id="csName" class="cs-inp" type="text" maxlength="12" placeholder="例如：晚霞粉蓝"></div>
    <div class="ws-cs-form-row"><label>章节 · 风格色</label><input id="csC0" class="cs-color" type="color" value="#3fc6a0"></div>
    <div class="ws-cs-form-ops">
      <button type="button" class="btn" data-cs-cancel>取消</button>
      <button type="button" class="btn primary" data-cs-confirm>确认新建</button>
    </div>
  </div>`;
}

export function renderWsColorPanel(){
  const box = $('#wsColorBody'); if(!box) return;
  box.innerHTML = wsColorToolbarHtml() + `<div class="ws-cs-grid">${wsColorGridHtml()}</div>` + wsColorNewFormHtml();
}

export function openWsColorPanel(){ const p=$('#wsColorPanel'); if(!p) return; renderWsColorPanel(); p.classList.remove('hidden'); }

export function closeWsColorPanel(){ const p=$('#wsColorPanel'); if(p) p.classList.add('hidden'); }

export function wsColorRepaint(){ rebuildCustomColorCss(); renderWsColorPanel(); render(); }

export function wsColorSelect(id){
  const c=getCfg(); c.styleCustom = c.styleCustom||{};
  c.styleCustom.colorScheme = id; saveCfg(c);
  wsColorRepaint(); toast('已切换写作风格配色：'+wsSchemeName(id));
}

export function wsColorDelete(id){
  if(id==='none') return;
  const c=getCfg(); const cs=wsColorCfgOf(c);
  const active=(c.styleCustom||{}).colorScheme;
  const bi=WS_COLOR_SCHEMES.find(x=>x.id===id);
  if(bi){
    if(cs.removedBuiltin.includes(id)) return;
    cs.removedBuiltin.push(id); cs.undo.push({type:'builtin',id:id});
  } else {
    const s=cs.custom.find(x=>x.id===id); if(!s) return;
    cs.custom=cs.custom.filter(x=>x.id!==id);
    cs.removedCustom=cs.removedCustom.concat([s]); cs.undo.push({type:'custom',id:id});
  }
  if(active===id) c.styleCustom.colorScheme='none';
  saveCfg(c); wsColorRepaint();
  toast('已删除配色：'+wsSchemeName(id)+(active===id?'（当前配色已回退默认）':''));
}

export function wsColorUndo(){
  const c=getCfg(); const cs=wsColorCfgOf(c); const last=cs.undo.pop(); if(!last) return;
  let label=last.id;
  if(last.type==='builtin'){ cs.removedBuiltin=cs.removedBuiltin.filter(x=>x!==last.id); }
  else { const s=cs.removedCustom.find(x=>x.id===last.id); if(s){ cs.custom=cs.custom.concat([s]); cs.removedCustom=cs.removedCustom.filter(x=>x.id!==last.id); label=s.name; } }
  saveCfg(c); wsColorRepaint(); toast('已撤销删除：'+label);
}

export function wsColorRestoreAll(){
  const c=getCfg(); const cs=wsColorCfgOf(c);
  cs.removedBuiltin=[];
  cs.undo = cs.undo.filter(u=>u.type!=='builtin');   // 内置已全部恢复，仅清除其对应的撤销记录；保留自建配色的删除与撤销记录
  saveCfg(c); wsColorRepaint(); toast('已恢复全部内置配色（自建配色不受影响）');
}

export function wsColorCreate(){
  const name=((($('#csName')||{}).value)||'').trim();
  const c0=(($('#csC0')||{}).value)||'#3fc6a0';
  if(!name){ toast('请先填写配色名称'); return; }
  const c=getCfg(); const cs=wsColorCfgOf(c);
  cs.custom=cs.custom.concat([{id:'cu_'+(Date.now()), name:name, c:[c0]}]);
  saveCfg(c); rebuildCustomColorCss();
  const f=$('#wsCsForm'); if(f) f.classList.add('hidden');
  wsColorRepaint(); toast('已新建配色：'+name);
}

export function rebindWsColorPanel(){
  const btn = $('#btnWsColor');
  if(btn) btn.onclick = (e)=>{ e.stopPropagation(); const p=$('#wsColorPanel'); if(p.classList.contains('hidden')) openWsColorPanel(); else closeWsColorPanel(); };
  const body = $('#wsColorBody');
  if(body) body.onclick = (e)=>{
    const del = e.target.closest('[data-cs-del]'); if(del){ e.stopPropagation(); wsColorDelete(del.dataset.csDel); return; }
    const item = e.target.closest('.ws-cs-item[data-cs]'); if(item){ e.stopPropagation(); if(!item.classList.contains('active')) wsColorSelect(item.dataset.cs); return; }
    if(e.target.closest('[data-cs-new]')){ e.stopPropagation(); const f=$('#wsCsForm'); if(f) f.classList.toggle('hidden'); return; }
    if(e.target.closest('[data-cs-undo]')){ e.stopPropagation(); wsColorUndo(); return; }
    if(e.target.closest('[data-cs-restore]')){ e.stopPropagation(); wsColorRestoreAll(); return; }
    if(e.target.closest('[data-cs-confirm]')){ e.stopPropagation(); wsColorCreate(); return; }
    if(e.target.closest('[data-cs-cancel]')){ e.stopPropagation(); const f=$('#wsCsForm'); if(f) f.classList.add('hidden'); return; }
  };
  rebuildCustomColorCss();   // 刷新后自定义配色仍能正确上色
}

