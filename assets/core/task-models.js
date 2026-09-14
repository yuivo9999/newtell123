const W = window;
const R = W.TellMeRuntime;
const $ = R.$;
const $$ = R.$$;
const esc = R.esc;
const TM_KEYS = R.TM_KEYS;
const TM_GROUPS = R.TM_GROUPS;
const TM_TEMP = R.TM_TEMP;

let editTM = null;
let editTemps = {};
let _tmEscHandler = null;

function tmCustomCount(tm){ return TM_KEYS.filter(k=> tm && tm[k]).length; }
function updateTmBadge(){
  const n = W.getCfg().taskModels ? tmCustomCount(W.getCfg().taskModels) : 0;
  const el = $('#tmBadge'); if(el) el.textContent = n ? ('已自定义 '+n+' 项') : '全部跟随全局';
  const b = $('#cfgBadge'); if(b) b.classList.toggle('tm-on', n>0);
}
function tmResolvePreview(triple){
  if(!triple) return '跟随全局';
  const cfg = W.getCfg();
  const g = cfg.groups.find(x=>x.id===triple.groupId);
  if(!g) return '⚠️ 服务组不存在（保存后仍会回落全局）';
  const k = (g.keys||[]).find(x=>x.id===triple.keyId) || (g.keys||[])[0];
  const m = (g.models||[]).find(x=>x.name===triple.model) || (g.models||[])[0];
  return '实际:' + (g.label||'') + ' · ' + (k?(k.label||'账号'):'⚠️ 无账号') + ' · ' + (m?m.name:'⚠️ 无模型');
}
function openTaskModelPanel(){
  editTM = JSON.parse(JSON.stringify(W.getCfg().taskModels || {}));
  editTemps = {};
  const g0 = W.getCfg();
  Object.keys(TM_TEMP).forEach(k=>{ const f=TM_TEMP[k][0]; if(f && !(f in editTemps)) editTemps[f]=(g0[f]==null?TM_TEMP[k][1]:g0[f]); });
  $('#taskModelModal').classList.remove('hidden');
  const st=$('#tmStatus'); if(st){ st.className='status'; st.textContent=''; }
  renderTaskModelPanel();
  _tmEscHandler = (e)=>{ if(e.key==='Escape') requestCloseTaskModelPanel(); };
  document.addEventListener('keydown', _tmEscHandler);
}
function closeTaskModelPanel(){
  $('#taskModelModal').classList.add('hidden');
  if(_tmEscHandler){ document.removeEventListener('keydown', _tmEscHandler); _tmEscHandler=null; }
  editTM = null; editTemps = {};
}
function requestCloseTaskModelPanel(){
  if(editTM && JSON.stringify(editTM) !== JSON.stringify(W.getCfg().taskModels || {})){
    if(!W.confirm('分任务模型有未保存的更改，放弃并关闭？')) return;
  }
  closeTaskModelPanel();
}
function refreshTmResetBtn(){
  const btn=$('#btnTmReset'); if(!btn) return;
  const n = tmCustomCount(editTM||{});
  btn.classList.toggle('hidden', n===0);
  btn.textContent = '全部恢复跟随全局（'+n+' 项自定义）';
}
function renderTaskModelPanel(){
  const body = $('#tmBody'); if(!body) return;
  const cfg = W.getCfg();
  const cur = cfg.active || {};
  const curGroup = cfg.groups.find(g=>g.id===cur.groupId) || cfg.groups[0] || {};
  const curKey = (curGroup.keys||[]).find(k=>k.id===cur.keyId) || (curGroup.keys||[])[0];
  const curModel = (curGroup.models||[]).find(m=>m.name===cur.model) || (curGroup.models||[])[0];
  const optHtml = (arr, val, ph)=> arr.length
    ? arr.map(x=>`<option value="${esc(String(x.v))}" ${String(x.v)===String(val)?'selected':''}>${esc(x.t)}</option>`).join('')
    : `<option value="">${esc(ph)}</option>`;
  const row = (key, name, note)=>{
    const tm = editTM[key] || '';
    const gid = tm ? tm.groupId : '';
    const grp = cfg.groups.find(g=>g.id===gid);
    const kid = tm ? tm.keyId : '';
    const mid = tm ? tm.model : '';
    const tf = TM_TEMP[key];
    const tval = tf ? (editTemps[tf[0]]==null ? tf[1] : editTemps[tf[0]]) : '';
    return `<div class="tm-row${tm?' tm-custom':''}" data-tm-row="${key}">
      <div class="tm-head"><span class="tm-name">${esc(name)}</span><span class="tm-note">${esc(note||'')}</span>
        ${tf?`<input type="number" inputmode="decimal" step="0.05" min="0" max="2" class="tm-temp" data-tm-temp="${key}" value="${tval}" placeholder="温度 ${tf[1]}" title="${esc(name)} 的 AI 温度（留空并保存＝恢复建议值）">`:'<span class="tm-temp-void"></span>'}
      </div>
      <div class="tm-sels">
        <select data-tm-sel="group" data-tm-key="${key}">
          <option value="">跟随全局</option>
          ${cfg.groups.map(g=>`<option value="${esc(g.id)}" ${gid===g.id?'selected':''}>${esc(g.label)}</option>`).join('')}
        </select>
        <select data-tm-sel="key" data-tm-key="${key}" ${grp?'':'disabled'}>${optHtml((grp?(grp.keys||[]):[]).map(k=>({v:k.id,t:k.label||'账号'})), kid, '（该组无账号）')}</select>
        <select data-tm-sel="model" data-tm-key="${key}" ${grp?'':'disabled'}>${optHtml((grp?(grp.models||[]):[]).map(m=>({v:m.name,t:m.name})), mid, '（该组无模型）')}</select>
      </div>
      <div class="tm-preview${tm?'':' tm-follow'}">${esc(tmResolvePreview(tm||null))}</div>
    </div>`;
  };
  body.innerHTML = `
    <div class="cv-div">可按任务独立指定模型与 AI 温度，灵活平衡质量与效率。留空温度表示跟随建议值。</div>
    <div class="set-block">
      <div class="set-block-head"><span>◆ 全局默认（未单独设置的任务都用它）</span></div>
      <div class="tm-preview">${esc((curGroup.label||'AI') + ' · ' + (curKey?(curKey.label||'账号'):'⚠️ 无账号') + ' · ' + (curModel?curModel.name:'⚠️ 无模型'))}（只读；去上方「AI 模型配置」修改）</div>
    </div>
    ${TM_GROUPS.map(gr=>`<div class="set-block"><div class="set-block-head"><span>${esc(gr.title)}</span></div>${gr.keys.map(k=>row(k[0],k[1],k[2])).join('')}</div>`).join('')}`;
  $$('#tmBody [data-tm-sel]').forEach(sel=>{
    sel.onchange = ()=>{
      const key = sel.dataset.tmKey, level = sel.dataset.tmSel;
      const cfgNow = W.getCfg();
      const tm = editTM[key] || '';
      if(level==='group'){
        if(!sel.value){ editTM[key]=''; }
        else{
          const grp = cfgNow.groups.find(g=>g.id===sel.value);
          editTM[key] = grp ? { groupId:grp.id, keyId:((grp.keys||[])[0]||{}).id||'', model:((grp.models||[])[0]||{}).name||'' } : '';
        }
      }else if(tm){
        if(level==='key') tm.keyId = sel.value;
        if(level==='model') tm.model = sel.value;
      }
      renderTaskModelPanel();
      refreshTmResetBtn();
    };
  });
  $$('#tmBody [data-tm-temp]').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      const tf = TM_TEMP[inp.dataset.tmTemp]; if(!tf) return;
      const v = parseFloat(inp.value);
      editTemps[tf[0]] = (inp.value==='' || isNaN(v)) ? tf[1] : v;
      renderTaskModelPanel();
      refreshTmResetBtn();
    });
  });
  refreshTmResetBtn();
}
function resetTaskModels(){
  if(!W.confirm('确定清除全部分任务设置，全部恢复跟随全局？')) return;
  if(!editTM) editTM = {};
  TM_KEYS.forEach(k=>{ editTM[k]=''; });
  renderTaskModelPanel();
  refreshTmResetBtn();
}
function saveTaskModels(){
  const cfg = W.getCfg();
  const clean = {};
  TM_KEYS.forEach(k=>{
    const v = editTM && editTM[k];
    const ok = v && typeof v==='object' && v.groupId && v.keyId && v.model && cfg.groups.some(g=>g.id===v.groupId);
    clean[k] = ok ? { groupId:v.groupId, keyId:v.keyId, model:v.model } : '';
  });
  const c = W.getCfg(); c.taskModels = clean;
  Object.keys(TM_TEMP).forEach(k=>{ const f=TM_TEMP[k][0]; if(f && editTemps && (f in editTemps)) c[f]=editTemps[f]; });
  W.saveCfg(c);
  const n = tmCustomCount(clean);
  const nT = Object.keys(TM_TEMP).filter(k=>{ const f=TM_TEMP[k][0]; return f && editTemps && editTemps[f]!=null; }).length;
  closeTaskModelPanel();
  W.updateCfgBadge();
  W.toast(n ? ('分任务模型已保存：'+n+' 项自定义，其余跟随全局') : '分任务模型已保存：全部跟随全局')+(nT?('；已同步 '+nT+' 项任务温度'):'');
}

export { tmCustomCount, updateTmBadge, tmResolvePreview, openTaskModelPanel, closeTaskModelPanel, requestCloseTaskModelPanel, refreshTmResetBtn, renderTaskModelPanel, saveTaskModels, resetTaskModels };
