/* story-shell.js —— A-01 新故事页外壳（v1.0.618）
 * 不重写各环节的卡片：viewStory() 照旧生成各节（保持所有按钮 ID 与绑定不变），
 * 渲染后 storyShellApply(root) 把现有 .flow-sec 节点「搬进」四个阶段卡：准备 → 世界 → 规划 → 写作，
 * 顶部加世界状态条与进度条，世界阶段末尾挂世界面板；顶栏的 叙事/日志/主题/选项 收进「更多」。
 * 回填口原则：任何入口都不置灰、不隐藏；折叠只用来收纳。 */
(function(){
'use strict';
const STAGES = [
  { key:'prep',  no:1, name:'准备', sub:'风格 · 创作基础 · 构想 · 配方 · 节拍' },
  { key:'world', no:2, name:'世界', sub:'词典达人 · 词典充实 · 世界运转 · 基础词典' },
  { key:'plan',  no:3, name:'规划', sub:'章节微拍 · 校长 · 老师' },
  { key:'write', no:4, name:'写作', sub:'正文 · 体检 · 状态结算' }
];
const LS_KEY = 'nt_stage_open_v1';
const PRINCIPLE = '<div class="stage-principle">🔌 <b>回填口原则</b>：每一步都常亮——<b>注入导出</b>（拿去外部 AI）、<b>读…</b>（把外部结果粘贴/导入回来，保存即激活下一步）、<b>生成</b>（项目内直接生成）。前置没满足时只给说明，不置灰、不隐藏。</div>';

/* storyState() 等读取函数会在 state.outline 为空时顺手建一个 {}，导致空项目误入「有大纲」分支；外壳只读，所以包一层还原 */
function readOnly(fn, fb){
  const had = state.outline;
  try{ return fn(); }catch(e){ return fb; }
  finally{ if(had==null && state.outline!=null) state.outline = had; }
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function loadOpen(){ try{ const o = JSON.parse(localStorage.getItem(LS_KEY)||'null'); return (o && typeof o==='object') ? o : null; }catch(e){ return null; } }
function saveOpen(o){ try{ localStorage.setItem(LS_KEY, JSON.stringify(o)); }catch(e){} }
let OPEN = loadOpen();               // null = 尚未手动选择过，用默认（当前阶段展开）

/* 一节属于哪个阶段（两种编号都适配：按标题文字，其次按 data-flow） */
function stageOfSection(el){
  const nm = ((el.querySelector('.fs-name')||{}).textContent || (el.querySelector('.ch-title')||{}).textContent || '').trim();
  if(/基础词典|词典达人|词典充实|词典/.test(nm)) return 'world';
  if(/学校|校长|老师|微拍/.test(nm)) return 'plan';
  if(/正文|章节创作/.test(nm)) return 'write';
  if(/风格|创作基础|构想|配方|节拍/.test(nm)) return 'prep';
  const f = el.dataset && el.dataset.flow;
  if(f==='7.5') return 'world';
  return null;
}

/* 各阶段完成度 */
function stageStatus(){ return readOnly(stageStatusRaw, {prep:{label:''},world:{label:''},plan:{label:''},write:{label:''}}); }
function stageStatusRaw(){
  let st = null, wp = null;
  try{ st = getDeckStepStatus(); }catch(e){}
  const by = {}; (st||[]).forEach(x=>by[x.key]=x);
  const d = k => !!(by[k] && by[k].done);
  let enrichDone = false; try{ enrichDone = !!scDone('dictEnrich'); }catch(e){}
  let engineBuilt = false; try{ engineBuilt = wpModel().counts.total>0; }catch(e){}
  let total = 0, written = 0; try{ const o = state.outline; total = ((o&&o.chapters)||[]).length || chapterCountVal() || 0; written = writtenChapterCount(); }catch(e){}
  const prepN = [d('style'), d('idea'), d('outline')].filter(Boolean).length;
  const worldN = [d('dict'), enrichDone, engineBuilt].filter(Boolean).length;
  const planN = [d('principal'), d('teacher')].filter(Boolean).length;
  const out = {
    prep:  { done: prepN===3, label: prepN===3?'已完成':prepN+' / 3' },
    world: { done: d('dict') && enrichDone, label: (d('dict') && enrichDone)?(engineBuilt?'已完成':'可建世界运转'):worldN+' / 3' },
    plan:  { done: planN===2, label: planN===2?'已完成':planN+' / 2' },
    write: { done: total>0 && written>=total, label: (total? written+' / '+total+' 章' : '待开始') }
  };
  let found = false;
  STAGES.forEach(s=>{ const o = out[s.key]; if(!o.done && !found){ o.cur = true; found = true; } });
  if(!found) out.write.cur = true;
  return out;
}

function defaultOpen(status){
  const o = {}; STAGES.forEach(s=>{ o[s.key] = !!status[s.key].cur; }); return o;
}

function stageHeadHtml(s, status, isOpen){
  const o = status[s.key];
  const cls = o.done ? 'done' : (o.cur ? 'cur' : '');
  const chipCls = o.done ? 'ok' : (o.cur ? 'accent' : '');
  const chipTxt = s.key==='write' ? o.label : (o.done ? '已完成' : (o.cur ? '进行中 · '+o.label : '待开始 · '+o.label));
  return `<button type="button" class="stage-head" data-stage-toggle="${s.key}" aria-expanded="${isOpen?'true':'false'}">`+
    `<span class="stage-num">${o.done?'✓':s.no}</span>`+
    `<span class="stage-name"><b>${s.name}</b><small>${esc(s.sub)}</small></span>`+
    `<span class="stage-chip ${chipCls}">${esc(chipTxt)}</span><span class="st-stage-slot" data-st-stage="${s.key}">${typeof stStageTag==='function'?readOnly(()=>stStageTag(s.key),''):''}</span><span class="stage-chev">›</span></button>`;
}

function storyShellApply(root){
  if(!root) return;
  const wrap = root.querySelector('.flow-wrap');
  if(!wrap || wrap.dataset.shell==='1') return;
  wrap.dataset.shell = '1';
  try{ const tb=document.querySelector('.topbar'); if(tb) document.documentElement.style.setProperty('--topbar-h', tb.offsetHeight+'px'); }catch(e){}
  const status = stageStatus();
  if(!OPEN) OPEN = defaultOpen(status);
  const groups = { prep:[], world:[], plan:[], write:[] };
  let last = 'prep';
  Array.from(wrap.children).forEach(el=>{
    let k = null;
    if(el.classList.contains('flow-sec')) k = stageOfSection(el);
    else if(el.classList.contains('flow-repo')) k = 'write';
    if(!k) k = last;               // 不认识的节跟随上一节，保证不丢任何内容
    last = k; groups[k].push(el);
  });
  // 顶部标题卡：书名 + 章数/已写进度（原来只写“长篇小说创作模式”）
  try{
    const h2 = root.querySelector('[data-novel-deck] .novel-mode-title');
    if(h2){
      const info = readOnly(()=>{ const o = state.outline; const total = ((o&&o.chapters)||[]).length || chapterCountVal() || 0; return { title: (o&&o.title) ? String(o.title) : '', total, written: writtenChapterCount() }; }, null);
      if(info && info.title){ h2.textContent = info.title; h2.classList.add('shell-book-title'); }
      if(info && info.total && !h2.nextElementSibling){ const sub = document.createElement('div'); sub.className = 'shell-book-sub'; sub.textContent = '长篇 · 共 '+info.total+' 章 · 已写 '+info.written+' 章'; h2.parentNode.appendChild(sub); }
    }
  }catch(e){}
  const frag = document.createDocumentFragment();
  // 世界状态条 + 进度条
  const barHost = document.createElement('div'); barHost.className = 'shell-top';
  const barHtml = readOnly(()=>worldBarHtml(), '');
  barHost.innerHTML = barHtml + '<div class="stage-progress">'+STAGES.map(s=>`<i class="${status[s.key].done?'done':(status[s.key].cur?'cur':'')}" title="${s.name}"></i>`).join('')+'</div>';
  frag.appendChild(barHost);
  STAGES.forEach(s=>{
    const isOpen = !!OPEN[s.key];
    const sec = document.createElement('section');
    sec.className = 'stage'+(status[s.key].done?' done':(status[s.key].cur?' cur':''))+(isOpen?' open':'');
    sec.dataset.stage = s.key;
    sec.innerHTML = stageHeadHtml(s, status, isOpen)+'<div class="stage-body"></div>';
    const body = sec.querySelector('.stage-body');
    if(s.key==='world' || s.key==='plan'){ const p = document.createElement('div'); p.innerHTML = PRINCIPLE; body.appendChild(p.firstElementChild); }
    groups[s.key].forEach(el=>body.appendChild(el));
    if(s.key==='world'){
      const pw = document.createElement('div'); pw.className = 'stage-world-panel';
      pw.innerHTML = readOnly(()=>'<div class="stage-sub-title">🗺 世界面板 <small>地图 · 时间线 · 规则与成本 · 人物驱动</small></div>'+worldPanelHtml({withEngineCard:false}), '');
      body.appendChild(pw);
    }
    frag.appendChild(sec);
  });
  wrap.innerHTML = '';
  wrap.appendChild(frag);
  wrap.classList.add('stage-shell');
  bindStoryShell(wrap);
  try{ if(typeof stSync==='function'){ stSync(); stRefreshUi(); } }catch(e){}   // v1.0.620 A-04
}

function setStageOpen(key, on){
  if(!OPEN) OPEN = {};
  OPEN[key] = !!on; saveOpen(OPEN);
  document.querySelectorAll('.stage[data-stage="'+key+'"]').forEach(s=>{
    s.classList.toggle('open', !!on);
    const h = s.querySelector('.stage-head'); if(h) h.setAttribute('aria-expanded', on?'true':'false');
  });
}

function bindStoryShell(wrap){
  wrap.querySelectorAll('[data-stage-toggle]').forEach(b=>{
    b.onclick = ()=>{ const s = b.closest('.stage'); setStageOpen(b.dataset.stageToggle, !s.classList.contains('open')); };
  });
  readOnly(()=>bindWorldPanel(wrap.parentNode || wrap));
}

/* 任何 scrollIntoView 的目标在折叠的阶段里时，先展开该阶段（顶部进度弹窗、生成聚焦、世界条跳转都靠它） */
(function patchScroll(){
  if(typeof Element==='undefined' || Element.prototype.__stagePatched) return;
  const orig = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function(){
    try{ const st = this.closest && this.closest('.stage'); if(st && !st.classList.contains('open')) setStageOpen(st.dataset.stage, true); }catch(e){}
    return orig.apply(this, arguments);
  };
  Element.prototype.__stagePatched = true;
})();

/* 顶栏收纳：叙事/日志/主题/选项 收进「⋯ 更多」，原按钮保留在 DOM（绑定不变），只是不显示 */
const MORE_ITEMS = [['btnNarrativeEngine','📜','叙事设置'],['btnAiLog','🧾','AI 请求日志'],['btnTheme','🎨','界面主题'],['btnSettings','⚙️','选项 / 设置']];
function installTopbarMore(){
  const right = document.querySelector('.topbar .tb-right');
  if(!right || document.getElementById('btnTopMore')) return;
  MORE_ITEMS.forEach(m=>{ const b = document.getElementById(m[0]); if(b) b.classList.add('tb-folded'); });
  const more = document.createElement('button');
  more.type = 'button'; more.id = 'btnTopMore'; more.className = 'icon-btn'; more.title = '更多';
  more.innerHTML = '<span style="font-size:20px;line-height:1">⋯</span><span class="tb-lab">更多</span>';
  more.onclick = ()=>{
    const old = document.getElementById('topMoreSheet'); if(old){ old.remove(); const m = document.getElementById('topMoreMask'); if(m) m.remove(); return; }
    const mask = document.createElement('div'); mask.id = 'topMoreMask'; mask.className = 'wp-sheet-mask';
    const sh = document.createElement('div'); sh.id = 'topMoreSheet'; sh.className = 'wp-sheet';
    sh.innerHTML = '<div class="wp-grab"></div><h3>更多</h3><div class="top-more-grid">'+MORE_ITEMS.map(m=>`<button type="button" class="btn" data-more="${m[0]}">${m[1]} ${m[2]}</button>`).join('')+'</div>';
    const close = ()=>{ sh.remove(); mask.remove(); };
    mask.onclick = close;
    sh.querySelectorAll('[data-more]').forEach(b=>b.onclick = ()=>{ close(); const t = document.getElementById(b.dataset.more); if(t) setTimeout(()=>t.click(), 0); });
    document.body.appendChild(mask); document.body.appendChild(sh);
  };
  right.appendChild(more);
}
if(typeof document!=='undefined'){
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', installTopbarMore); else installTopbarMore();
}

Object.assign(window, { storyShellApply, stageOfSection, stageStatus, setStageOpen, installTopbarMore });
})();
