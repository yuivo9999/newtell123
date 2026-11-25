/* ================================================================
 * world-panel.js · v1.0.617 · B-10 世界面板（只读模块）
 * 把「故事页重构原型」里的世界状态条 + 世界面板（地图/时间线/规则与成本/人物驱动）做成真实模块。
 * 数据来自 weState/weParse/weChapterReport/weRegions/weRegionStatus、storyState、词典地点与 _placeContacts。
 * 本文件不挂进故事页（A-01 集成）；可在控制台运行 window.__worldPanelDemo() 手动试看。
 * 纯函数（可测试）：wpNodeState / wpLayout / wpTimelineWindow / wpEventKind
 * 必须在 world-engine.js 之后加载（经典脚本，依赖其全局函数）。
 * ================================================================ */
(function(){
const WP_TABS = [['map','🗺 地图'],['time','⏳ 时间线'],['rules','⚖ 规则与成本'],['drive','🧭 人物驱动']];
const wpEsc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- 纯函数 ---------- */
/* weRegionStatus 的返回值 → 面板用状态：cur 当前 / visited 已到达 / open 已展开 / fog 迷雾 */
function wpNodeState(status){
  return status==='current' ? 'cur' : status==='visited' ? 'visited' : status==='open' ? 'open' : 'fog';
}
/* 确定性分层布局：每个连通块按 BFS 深度分列，块之间纵向堆叠，孤立地点排成网格放在最后。 */
function wpLayout(names, edges, opt){
  opt = opt || {}; const colGap = opt.colGap||70, rowGap = opt.rowGap||58, mx = opt.marginX||36, my = opt.marginY||30;
  names = Array.from(new Set((names||[]).map(String))); const idx = {}; names.forEach((n,i)=>idx[n]=i);
  const adj = {}; names.forEach(n=>adj[n]=[]); const seenE = new Set();
  (edges||[]).forEach(e=>{ const a=String(e.from), b=String(e.to); if(a===b || !(a in idx) || !(b in idx)) return;
    const k = idx[a]<idx[b] ? a+'\u0001'+b : b+'\u0001'+a; if(seenE.has(k)) return; seenE.add(k); adj[a].push(b); adj[b].push(a); });
  const done = new Set(), comps = [], singles = [];
  names.slice().sort((a,b)=> adj[b].length-adj[a].length || idx[a]-idx[b]).forEach(root=>{
    if(done.has(root)) return; if(!adj[root].length){ done.add(root); singles.push(root); return; }
    const layers = [[root]]; done.add(root);
    for(let d=0; d<layers.length; d++){ const next=[]; layers[d].forEach(n=>adj[n].slice().sort((a,b)=>idx[a]-idx[b]).forEach(m=>{ if(!done.has(m)){ done.add(m); next.push(m); } })); if(next.length) layers.push(next); }
    comps.push(layers);
  });
  singles.sort((a,b)=>idx[a]-idx[b]);
  const maxDepth = comps.reduce((m,l)=>Math.max(m,l.length-1),0);
  const W = Math.max(340, 2*mx + maxDepth*colGap);
  const pos = {}; let y = my;
  comps.forEach(layers=>{
    const rows = layers.reduce((m,l)=>Math.max(m,l.length),1);
    layers.forEach((l,d)=>l.forEach((n,i)=>{ pos[n] = { x:Math.round(mx + d*colGap), y:Math.round(y + (i+0.5)*rows*rowGap/l.length) }; }));
    y += rows*rowGap;
  });
  if(singles.length){
    const cols = Math.max(1, Math.floor((W-2*mx)/colGap)+1);
    singles.forEach((n,i)=>{ pos[n] = { x:Math.round(mx + (i%cols)*colGap), y:Math.round(y + (0.5+Math.floor(i/cols))*rowGap) }; });
    y += Math.ceil(singles.length/cols)*rowGap;
  }
  return { pos, w:Math.round(W), h:Math.round(Math.max(200, y+my/2)) };
}
/* 时间线窗口：返回要显示的日序号数组（默认 8 天，尽量让 ref 靠前居中）。 */
function wpTimelineWindow(ref, maxDay, size){
  size = size||8; maxDay = Math.max(maxDay||0, 1); const r = (ref==null||isNaN(ref)) ? 1 : ref;
  let start = Math.max(1, r-2); if(start+size-1 > Math.max(maxDay, r)) start = Math.max(1, Math.max(maxDay,r)-size+1);
  const out=[]; for(let d=start; d<start+size; d++) out.push(d); return out;
}
/* 时钟事件状态：used 已体现 / miss 到期未体现 / due 到期但还没有正文 / future 未到期 / undated 日期未定 */
function wpEventKind(day, ref, used){
  if(day==null || ref==null) return 'undated';
  if(day>ref) return 'future';
  return used===true ? 'used' : used===false ? 'miss' : 'due';
}

/* ---------- 数据模型 ---------- */
function wpDefaultChapter(){
  let best = -1; const chs = (storyState().chapters)||{};
  Object.keys(chs).forEach(k=>{ if(chs[k] && chs[k].observed && +k>best) best = +k; });
  return Math.max(0, best);
}
function wpChapterCount(){ let n=0; try{ n = realChapterCount(); }catch(e){} if(!n) n = ((state.outline&&state.outline.chapters)||[]).length; return n||0; }
function wpChapterTitle(i){ const c = ((state.outline&&state.outline.chapters)||[])[i]; return String((c&&c.title)||'').trim(); }
function wpSenseFor(name, senses){ const r=[]; (senses||[]).forEach(s=>{ if(s.place===name || (s.place && (s.place.includes(name)||name.includes(s.place)))) r.push(...String(s.anchors||'').split(/；|;/).map(x=>x.trim()).filter(Boolean)); }); return r; }
function wpModel(chapter){
  const parsed = weParse(weState().raw), counts = weCounts();
  const g = (state.outline && state.outline.glossary) || {};
  const n = wpChapterCount();
  let idx = (chapter==null||isNaN(chapter)) ? wpDefaultChapter() : Math.max(0, Math.floor(+chapter));
  if(n && idx>n-1) idx = n-1;
  const regs = weRegions(), names = [], info = {};
  const add = (name, patch)=>{ name=String(name||'').trim().slice(0,60); if(!name) return; if(!info[name]){ info[name]={name,type:'',note:'',anchors:[],regionNote:''}; names.push(name); } Object.assign(info[name], patch||{}); };
  (g.places||[]).forEach(p=>{ if(p) add(p.name,{type:String(p.type||''),note:String(p.note||p.desc||p.description||'')}); });
  Object.keys(regs).forEach(k=>add(k)); parsed.senses.forEach(s=>add(s.place));
  names.forEach(nm=>{ const r=regs[nm]; info[nm].regionNote = r?String(r.note||''):''; info[nm].anchors = (r&&r.anchors&&r.anchors.length)?r.anchors.slice():wpSenseFor(nm, parsed.senses); info[nm].state = wpNodeState(weRegionStatus(nm, idx)); });
  const seenE = new Set(), edges = [];
  ((g._placeContacts)||[]).forEach(x=>{ const a=String(x&&x.from||'').trim(), b=String(x&&x.to||'').trim(); if(!a||!b||a===b||!info[a]||!info[b]) return;
    const k=[a,b].sort().join('\u0001'); if(seenE.has(k)) return; seenE.add(k); edges.push({from:a,to:b,relation:String(x.relation||''),note:String(x.note||'')}); });
  let report = null; try{ report = weChapterReport(idx); }catch(e){}
  const chs = storyState().chapters||{}, ob = k=>chs[k]&&chs[k].observed, chapterDays = [];
  for(let k=0;k<n;k++){ if(!ob(k)) continue; const end = weParseDay(ob(k).time), start = k>0&&ob(k-1)?weParseDay(ob(k-1).time):(k===0?1:null); if(start!=null||end!=null) chapterDays.push({idx:k,start:start!=null?start:end,end:end!=null?end:start}); }
  const clock = parsed.clock.map(e=>{ const day=weParseDay(e.when); let used=null; if(report&&day!=null){ const h=report.due.find(d=>d.event===e.event&&d.when===e.when); if(h) used=h.used; } return Object.assign({},e,{day, kind:wpEventKind(day, report?report.refDay:null, used)}); });
  const opened = names.filter(nm=>info[nm].state!=='fog').length;
  const missed = clock.filter(e=>e.kind==='miss').length;
  const curLoc = names.filter(nm=>info[nm].state==='cur'); let locText = curLoc.join('、');
  if(!locText && ob(idx) && ob(idx).location) locText = String(ob(idx).location);
  return { idx, chapterCount:n, parsed, counts, places:names.map(nm=>info[nm]), edges, report, clock, chapterDays, opened, missed, locText,
           worldRules:((g._worldRules)||[]).filter(r=>r&&r.rule) };
}

/* ---------- 渲染 ---------- */
function worldBarHtml(opt){
  const m = wpModel(opt&&opt.chapter), c = [];
  const built = m.counts.total>0;
  c.push(built ? '<span class="wp-chip ok">骨架 ✓</span>' : '<span class="wp-chip warn">未建立运转层</span>');
  if(m.places.length) c.push(`<span class="wp-chip">区域 ${m.opened}/${m.places.length} 已展开</span>`);
  if(m.report) c.push(`<span class="wp-chip accent">${m.report.startDay!=null?'第'+m.report.startDay+(m.report.endDay!=null&&m.report.endDay!==m.report.startDay?'–'+m.report.endDay:'')+' 日':'时点未知'}</span>`);
  if(m.clock.length) c.push(m.missed?`<span class="wp-chip warn">到期未体现 ${m.missed}</span>`:'<span class="wp-chip ok">事件均已体现</span>');
  return `<div class="wp-bar"><button type="button" class="wp-bar-card" data-wp-goto><span class="wp-bar-ico">🌍</span><span class="wp-bar-main"><b>${built?'世界 · 正在运转':'世界 · 尚未建立'}</b><span class="wp-chips">${c.join('')}</span></span><span class="wp-chev">›</span></button></div>`;
}
function wpNowHtml(m){
  const r = m.report; const L = [`<h4>第 ${m.idx+1} 章 · 世界此刻</h4>`];
  if(!r){ L.push('<p>世界运转层里还没有世界时钟；有了之后这里会显示故事时点与到期事件。</p>'); if(m.locText) L.push(`<p>当前位置：${wpEsc(m.locText)}</p>`); return `<div class="wp-now">${L.join('')}</div>`; }
  L.push(`<p>故事时点：${r.startDay!=null?'第'+r.startDay+' 日':'未知'}${r.endDay!=null?' → 第'+r.endDay+' 日':''}${m.locText?'　当前位置：'+wpEsc(m.locText):''}</p>`);
  L.push('<p>已到期的外部事件：'+(r.due.length?r.due.map(x=>`${wpEsc(x.when)}「${wpEsc(x.event)}」${x.used==null?'':(x.used?'✅':'⚠️疑似未体现')}`).join('；'):'无')+'</p>');
  L.push('<p>即将到期（2 日内）：'+(r.upcoming.length?r.upcoming.map(x=>`${wpEsc(x.when)}「${wpEsc(x.event)}」`).join('；'):'无')+'</p>');
  if(r.undated.length) L.push('<p>时点无法解析：'+r.undated.map(x=>`${wpEsc(x.when)}「${wpEsc(x.event)}」`).join('；')+'</p>');
  return `<div class="wp-now">${L.join('')}</div>`;
}
function wpMapHtml(m){
  if(!m.places.length) return '<div class="wp-empty">词典里还没有地点。完成词典达人后，这里会出现世界地图（地点默认是迷雾，随故事走到哪里展开到哪里）。</div>';
  const L = wpLayout(m.places.map(p=>p.name), m.edges), by = {}; m.places.forEach(p=>by[p.name]=p);
  const reduce = typeof matchMedia==='function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let h = '';
  m.edges.forEach(e=>{ const a=L.pos[e.from], b=L.pos[e.to]; if(!a||!b) return; const seen = by[e.from].state!=='fog' && by[e.to].state!=='fog';
    h += `<line class="wp-edge${seen?'':' fogged'}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`; });
  m.places.forEach(p=>{ const q=L.pos[p.name]; if(!q) return; const r = p.state==='cur'?15:13, lab = p.name.length>6?p.name.slice(0,6)+'…':p.name;
    h += `<g class="wp-node s-${p.state}" data-wp-place="${wpEsc(p.name)}" tabindex="0" role="button" aria-label="${wpEsc(p.name)}">`+
      (p.state==='cur'?`<circle class="halo" cx="${q.x}" cy="${q.y}" r="22">${reduce?'':'<animate attributeName="r" values="18;26;18" dur="2.4s" repeatCount="indefinite"/>'}</circle>`:'')+
      `<circle class="dot" cx="${q.x}" cy="${q.y}" r="${r}"/><text x="${q.x}" y="${q.y+r+14}">${wpEsc(lab)}</text></g>`; });
  return `<div class="wp-mapwrap"><svg class="wp-map" viewBox="0 0 ${L.w} ${L.h}" style="${L.w>340?'width:'+L.w+'px;max-width:none':'width:100%'}" role="img" aria-label="世界地图">${h}</svg></div>`+
    '<div class="wp-legend"><span style="--c:var(--accent)">当前位置</span><span style="--c:var(--ok)">已到达</span><span style="--c:var(--warn)">已展开</span><span style="--c:transparent;--b:var(--muted)">迷雾（点开可手动展开）</span></div>';
}
function wpTimeHtml(m){
  if(!m.clock.length) return '<div class="wp-empty">世界运转层里还没有世界时钟。在故事页的「世界运转层」卡片生成，或用外部 AI 生成后「读世界运转层」回填。</div>';
  const ref = m.report?m.report.refDay:null, maxDay = Math.max(8, ...m.clock.map(e=>e.day||0), ...m.chapterDays.map(c=>c.end||0));
  const days = wpTimelineWindow(ref, maxDay, 8);
  let h = `<div class="wp-tl-head"><span class="ev">世界时钟事件</span>${days.map(d=>`<span class="${d===ref?'on':''}">${d}日</span>`).join('')}</div>`;
  const label = {used:'✅ 已体现',miss:'⚠️ 到期未体现',due:'到期（尚无正文）',future:'未到期',undated:'日期未定'};
  m.clock.forEach(e=>{ h += `<div class="wp-tl-row"><div class="ev">${wpEsc(e.event)}<br><small>${wpEsc(e.when)}</small> <span class="st ${e.kind}">${label[e.kind]}</span></div>`+
    days.map(d=>`<div class="cell">${d===ref?'<i class="now"></i>':''}${e.day===d?`<i class="mk ${e.kind}" title="${wpEsc(e.event)}"></i>`:''}</div>`).join('')+'</div>'; });
  h += `<div class="wp-tl-row"><div class="ev"><b>章节</b></div>${days.map(d=>{ const c=m.chapterDays.filter(x=>d>=x.start&&d<=x.end).pop(); return `<div class="cell ch">${c?'第'+(c.idx+1)+'章':''}</div>`; }).join('')}</div>`;
  return `<div class="wp-tl"><div class="wp-tl-grid" style="--wp-n:${days.length}">${h}</div></div><div class="wp-legend"><span style="--c:var(--ok)">已体现</span><span style="--c:var(--warn)">到期未体现</span><span style="--c:var(--muted)">未到期</span><span style="--c:var(--accent)">本章时点</span></div><p class="wp-hint">「已体现」是世界时钟与截至本章正文的字面核对（启发式，仅供参考）。</p>`;
}
function wpRulesHtml(m){
  const costs = m.parsed.costs, rules = m.worldRules;
  if(!costs.length && !rules.length) return '<div class="wp-empty">还没有成本底表或世界规则。</div>';
  return '<div class="wp-kv">'+(costs.length?`<div class="wp-card2"><b>成本底表（硬约束）</b>${costs.map(x=>`<small>${wpEsc(x.item)}：${wpEsc(x.rule)}</small>`).join('')}</div>`:'')+
    (rules.length?`<div class="wp-card2"><b>世界规则</b>${rules.map(x=>`<small>${wpEsc(x.rule)}</small>`).join('')}</div>`:'')+'</div>';
}
function wpDriveHtml(m){
  if(!m.parsed.drives.length) return '<div class="wp-empty">还没有人物驱动。</div>';
  return '<div class="wp-kv">'+m.parsed.drives.map(x=>`<div class="wp-card2"><b>${wpEsc(x.name)}</b><div class="wp-drv"><i>想要</i><span>${wpEsc(String(x.want).replace(/^想要/,'')||'—')}</span><i>怕</i><span>${wpEsc(String(x.fear).replace(/^(最)?怕/,'')||'—')}</span><i>绝不</i><span>${wpEsc(String(x.limit).replace(/^绝不(肯)?/,'')||'—')}</span></div></div>`).join('')+'</div>';
}
function wpDynHtml(m, tab){
  const body = {map:wpMapHtml, time:wpTimeHtml, rules:wpRulesHtml, drive:wpDriveHtml};
  return wpNowHtml(m)+`<div class="wp-tabs">${WP_TABS.map(t=>`<button type="button" class="${t[0]===tab?'on':''}" data-wp-tab="${t[0]}">${t[1]}</button>`).join('')}</div><div class="wp-pane">${(body[tab]||wpMapHtml)(m)}</div>`;
}
function worldPanelHtml(opt){
  opt = opt||{}; const m = wpModel(opt.chapter), n = m.chapterCount, tab = opt.tab||'map';
  const t = wpChapterTitle(m.idx);
  return `<section class="wp-root" id="worldPanel" data-wp-chapter="${m.idx}" data-wp-tab-cur="${tab}" data-wp-engine="${opt.withEngineCard?1:0}">`+
    (opt.withEngineCard && typeof worldEngineBlockHtml==='function' ? worldEngineBlockHtml() : '')+
    (n>1?`<div class="wp-slider"><span>查看到：</span><input type="range" min="1" max="${n}" value="${m.idx+1}" data-wp-slider><b data-wp-slabel>第 ${m.idx+1} 章${t?' · '+wpEsc(t):''}</b></div>`:'')+
    `<div data-wp-dyn>${wpDynHtml(m, tab)}</div></section>`;
}

/* ---------- 交互 ---------- */
function wpOpenSheet(html){
  wpCloseSheet();
  const mask = document.createElement('div'); mask.className='wp-sheet-mask'; mask.id='wpSheetMask';
  const sh = document.createElement('div'); sh.className='wp-sheet'; sh.id='wpSheet'; sh.innerHTML = '<div class="wp-grab"></div>'+html;
  mask.onclick = wpCloseSheet; document.body.appendChild(mask); document.body.appendChild(sh); return sh;
}
function wpCloseSheet(){ ['wpSheetMask','wpSheet'].forEach(id=>{ const e=document.getElementById(id); if(e) e.remove(); }); }
function wpPlaceSheetHtml(name, idx){
  const m = wpModel(idx), p = m.places.find(x=>x.name===name); if(!p) return '<p>找不到这个地点。</p>';
  const lab = {cur:'当前位置',visited:'已到达',open:'已展开',fog:'迷雾（未展开）'}[p.state], cls = {cur:'accent',visited:'ok',open:'warn',fog:''}[p.state];
  const links = m.edges.filter(e=>e.from===name||e.to===name);
  const seen = []; for(let k=0;k<m.chapterCount;k++){ const ob=(storyState().chapters||{})[k]; const o=ob&&ob.observed; const loc=String(o&&o.location||''); if(loc&&(loc.includes(name)||name.includes(loc))) seen.push(k+1); }
  let h = `<h3>${wpEsc(name)} <span class="wp-chip ${cls}">${lab}</span></h3>`;
  if(p.type||p.note) h += `<p>${wpEsc([p.type,p.note].filter(Boolean).join('：'))}</p>`;
  if(p.regionNote) h += `<p>${wpEsc(p.regionNote)}</p>`;
  h += '<b>感官锚点</b>'+(p.anchors.length?`<ul>${p.anchors.map(x=>`<li>${wpEsc(x)}</li>`).join('')}</ul>`:'<p class="wp-hint">还没有（老师备课前展开，或在世界运转层里补 [SENSE]）</p>');
  if(links.length) h += '<b>相连的地点</b><ul>'+links.map(e=>`<li>${wpEsc(e.from===name?e.to:e.from)}${e.relation?'（'+wpEsc(e.relation)+'）':''}${e.note?'：'+wpEsc(e.note):''}</li>`).join('')+'</ul>';
  if(seen.length) h += `<p class="wp-hint">出现在第 ${seen.join('、')} 章的章末结算里。</p>`;
  h += '<div class="wp-actions">'+(p.state==='fog'?`<button type="button" class="btn primary" data-wp-expand="${wpEsc(name)}">立即展开（手动，不调 AI）</button>`:'')+'<button type="button" class="btn" data-wp-close>关闭</button></div>';
  return h;
}
function wpRerender(root){
  const m = wpModel(+root.dataset.wpChapter); const tab = root.dataset.wpTabCur||'map';
  const dyn = root.querySelector('[data-wp-dyn]'); if(dyn) dyn.innerHTML = wpDynHtml(m, tab); wpBindDyn(root);
}
function wpRefreshAll(){
  document.querySelectorAll('.wp-root').forEach(wpRerender);
  document.querySelectorAll('.wp-bar').forEach(b=>{ const w=document.createElement('div'); w.innerHTML=worldBarHtml().trim(); b.replaceWith(w.firstElementChild); });
  bindWorldPanel(document);
}
function wpBindDyn(root){
  root.querySelectorAll('[data-wp-tab]').forEach(b=>b.onclick=()=>{ root.dataset.wpTabCur=b.dataset.wpTab; wpRerender(root); });
  root.querySelectorAll('[data-wp-place]').forEach(g=>{
    const open=()=>{ const sh=wpOpenSheet(wpPlaceSheetHtml(g.getAttribute('data-wp-place'), +root.dataset.wpChapter));
      const c=sh.querySelector('[data-wp-close]'); if(c) c.onclick=wpCloseSheet;
      const x=sh.querySelector('[data-wp-expand]'); if(x) x.onclick=()=>{ weExpandRegion(x.dataset.wpExpand,{}); try{persist();}catch(e){} wpCloseSheet(); wpRefreshAll(); }; };
    g.onclick=open; g.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } };
  });
}
function bindWorldPanel(root){
  root = root||document;
  root.querySelectorAll('[data-wp-goto]').forEach(b=>b.onclick=()=>{
    try{ document.dispatchEvent(new CustomEvent('worldpanel:goto')); }catch(e){}
    const p = document.getElementById('worldPanel'); if(p) p.scrollIntoView({behavior:'smooth',block:'start'}); else window.__worldPanelDemo();
  });
  root.querySelectorAll('.wp-root').forEach(r=>{
    const s=r.querySelector('[data-wp-slider]');
    if(s){ const lab=r.querySelector('[data-wp-slabel]');
      s.oninput=()=>{ const i=+s.value-1, t=wpChapterTitle(i); if(lab) lab.textContent='第 '+(i+1)+' 章'+(t?' · '+t:''); };
      s.onchange=()=>{ r.dataset.wpChapter=String(+s.value-1); wpRerender(r); }; }
    wpBindDyn(r);
    if(r.dataset.wpEngine==='1' && typeof bindWorldEngine==='function') bindWorldEngine();
  });
}
window.__worldPanelDemo = function(){
  const sh = wpOpenSheet(worldBarHtml()+worldPanelHtml()); bindWorldPanel(sh); return sh;
};
Object.assign(window,{ worldBarHtml, worldPanelHtml, bindWorldPanel, wpNodeState, wpLayout, wpTimelineWindow, wpEventKind, wpModel, wpRefreshAll, wpOpenSheet, wpCloseSheet });
})();
