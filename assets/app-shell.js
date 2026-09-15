/**
 * v51 App Shell — first-class navigation over the existing novel engine.
 * This layer owns navigation/presentation only; legacy chapter rendering remains
 * the source of truth for the actual editors and write-back behavior.
 */
(function(){
  'use strict';
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  const state = ()=>window.TellMeLegacyShared?.state || window.TellMeRuntime?.state || {};
  const esc = (v)=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const groups = [
    {id:'overview', icon:'⌂', label:'创作总览', hint:'作品状态与下一步'},
    {id:'story', icon:'✦', label:'故事河流', hint:'构想 → 配方 → 节拍'},
    {id:'world', icon:'◎', label:'世界设定', hint:'人物 · 地点 · 专名 · 规则'},
    {id:'timeline', icon:'◷', label:'时间线', hint:'全局时间与章节落点'},
    {id:'foreshadow', icon:'◇', label:'伏笔', hint:'埋设 · 强化 · 回收'},
    {id:'writing', icon:'▤', label:'正文写作', hint:'章节与阅读器'},
    {id:'runtime', icon:'⌘', label:'Runtime', hint:'事件 · 状态 · 因果 · 知识'}
  ];

  function stats(s){
    const o=s.outline||{}, g=o.glossary||{}, rt=o._storyState?.runtime||s.runtime||{};
    const chapters=Array.isArray(s.chapters)?s.chapters:[];
    const plans=Array.isArray(o.chapterPlans)?o.chapterPlans:[];
    const written=chapters.filter(c=>String(c?.content||'').trim()).length;
    return {o,g,rt,chapters,plans,written,chars:Array.isArray(g.characters)?g.characters.length:(Array.isArray(s.characters)?s.characters.length:0),places:Array.isArray(g.places)?g.places.length:0,proper:Array.isArray(g.propernouns)?g.propernouns.length:0};
  }

  function runtime(s){ return s.outline?._storyState?.runtime || s.runtime || {events:[],knowledge:[],transitions:[],causality:[],foreshadowing:[]}; }
  function projectTitle(s){ return String(s.outline?.title||s.idea||'未命名作品').trim().slice(0,60); }
  function legacyStep(n, selector){
    showLegacy();
    const tab=$(`.tab[data-step="${n}"]`);
    if(tab) tab.click();
    else {
      const shared=window.TellMeLegacyShared;
      if(shared) shared.currentStep=n;
      window.TellMeLegacyDomains?.['chapter-domain']?.render?.();
    }
    setTimeout(()=>{ if(selector){ const el=$(selector); if(el){ try{el.scrollIntoView({behavior:'smooth',block:'start'}); }catch(_){el.scrollIntoView(true);} el.classList.add('gs-flash'); setTimeout(()=>el.classList.remove('gs-flash'),1200); } } },40);
  }
  function openLegacyPanel(id){ const el=$(id); if(el) el.classList.remove('hidden'); }

  function overview(s){
    const x=stats(s), title=projectTitle(s), tl=x.o._globalTimeline;
    const next=x.written+1;
    return `<div class="su-page">
      <div class="su-hero"><div><div class="su-kicker">CREATIVE CONTROL</div><h1>${esc(title)}</h1><p>从故事构想一直到正文，所有入口现在都在同一条创作工作台里。</p></div><button class="su-primary" data-su-action="writing">继续写作</button></div>
      <div class="su-stat-grid">
        <button data-su-action="story"><b>${x.plans.length}</b><span>章节规划</span></button>
        <button data-su-action="writing"><b>${x.written}</b><span>已写章节</span></button>
        <button data-su-action="world"><b>${x.chars}</b><span>人物事实</span></button>
        <button data-su-action="timeline"><b>${tl?.chapters?.length||0}</b><span>时间锚</span></button>
      </div>
      <section class="su-panel"><div class="su-panel-head"><div><b>创作进度</b><small>下一工作目标：第 ${next} 章</small></div><span class="su-status ${x.written?'ok':''}">${x.written?'持续创作中':'尚未开始正文'}</span></div>
        <div class="su-progress"><i style="width:${Math.min(100,Math.round((x.written/Math.max(1,x.plans.length||1))*100))}%"></i></div>
        <div class="su-row"><span>构想</span><span class="su-done">${s.idea?'已建立':'待建立'}</span></div>
        <div class="su-row"><span>世界词典</span><span>${x.chars+x.places+x.proper} 条事实</span></div>
        <div class="su-row"><span>时间合同</span><span>${tl?'已生成':'待生成'}</span></div>
      </section>
      <section class="su-panel su-actions"><div class="su-panel-head"><div><b>快速进入</b><small>直接跳到已有真实工作区</small></div></div>
        <button data-su-action="story"><span>✦</span><div><b>故事河流</b><small>构想、写作配方、全书节拍</small></div><em>›</em></button>
        <button data-su-action="world"><span>◎</span><div><b>世界设定</b><small>人物、地点、专名与关系事实</small></div><em>›</em></button>
        <button data-su-action="timeline"><span>◷</span><div><b>时间线</b><small>${tl?'已有时间锚，可继续检查':'尚未生成全局时间线'}</small></div><em>›</em></button>
      </section>
    </div>`;
  }

  function story(s){
    const x=stats(s), rows=x.plans.slice(0,30).map((p,i)=>`<button class="su-list-row" data-su-action="story-plan" data-index="${i}"><span class="su-num">${i+1}</span><div><b>${esc(p?.title||p?.chapterTitle||('第'+(i+1)+'章'))}</b><small>${esc(String(p?.beatsText||p?.summary||'尚未填写本章推进骨架').slice(0,110))}</small></div><em>${i<x.written?'已写':'规划中'}</em></button>`).join('');
    return `<div class="su-page"><div class="su-page-title"><div><div class="su-kicker">STORY RIVER</div><h2>故事河流</h2><p>按章节观察从规划到正文的推进，不再把“流程入口”藏在页面底部。</p></div><button class="su-primary" data-su-action="legacy-story">打开编辑器</button></div>
      <section class="su-panel"><div class="su-panel-head"><div><b>章节推进</b><small>${x.plans.length} 章规划 · ${x.written} 章已有正文</small></div></div><div class="su-list">${rows||'<div class="su-empty">还没有章节规划。先进入故事构想建立作品。</div>'}</div></section>
    </div>`;
  }

  function world(s){
    const x=stats(s), cards=[['人物','characters',x.g.characters||s.characters||[],'world-person'],['地点','places',x.g.places||[],'world-place'],['专名','propernouns',x.g.propernouns||[],'world-proper']];
    return `<div class="su-page"><div class="su-page-title"><div><div class="su-kicker">WORLD ATLAS</div><h2>世界设定</h2><p>这里展示词典已经建立的事实；编辑仍由原有词典工作区负责写回。</p></div><button class="su-primary" data-su-action="legacy-dict">打开词典工作区</button></div><div class="su-world-grid">${cards.map(c=>`<section class="su-panel"><div class="su-panel-head"><div><b>${c[0]}</b><small>${c[2].length} 条</small></div><span class="su-icon">${c[0]==='人物'?'◎':c[0]==='地点'?'⌖':'#'}</span></div><div class="su-chips">${c[2].slice(0,18).map(v=>`<span>${esc(v?.name||v?.label||v)}</span>`).join('')||'<i>暂无已建立事实</i>'}</div></section>`).join('')}</div></div>`;
  }

  function timeline(s){
    const x=stats(s), tl=x.o._globalTimeline, anchors=Array.isArray(tl?.chapters)?tl.chapters:[];
    const rows=anchors.slice(0,50).map((a,i)=>`<div class="su-time-row"><span>第${Number(a?.index??i)+1}章</span><div><b>${esc(a?.from||'未标注起点')}</b><i>→</i><b>${esc(a?.to||a?.end||'未标注终点')}</b></div></div>`).join('');
    return `<div class="su-page"><div class="su-page-title"><div><div class="su-kicker">TIMELINE CONTRACT</div><h2>时间线</h2><p>以全局时间锚为准，检查章节起止是否覆盖规划范围。</p></div><button class="su-primary" data-su-action="legacy-timeline">进入时间工具</button></div><section class="su-panel"><div class="su-panel-head"><div><b>全局时间锚</b><small>${anchors.length} 个章节落点</small></div><span class="su-status ${tl?'ok':''}">${tl?'已生成':'未生成'}</span></div>${rows||'<div class="su-empty">尚无章节时间锚。进入故事规划后生成全局时间线。</div>'}</section></div>`;
  }

  function foreshadow(s){
    const rt=runtime(s), list=(rt.foreshadowing||[]).slice().reverse().slice(0,40);
    return `<div class="su-page"><div class="su-page-title"><div><div class="su-kicker">PLOT DEBT</div><h2>伏笔</h2><p>直接读取 Novel Runtime 的伏笔生命周期，不再只是一个“概念入口”。</p></div><button class="su-primary" data-su-action="legacy-writing">查看正文</button></div><section class="su-panel"><div class="su-panel-head"><div><b>伏笔生命周期</b><small>${list.length} 条记录</small></div></div><div class="su-list">${list.map(f=>`<div class="su-list-row static"><span class="su-num">◇</span><div><b>${esc(f.summary||f.id||'未命名伏笔')}</b><small>第${esc(f.chapterId||f.chapter||'?')}章 · ${esc(f.evidence||'暂无证据')}</small></div><em>${esc(f.status||'UNKNOWN')}</em></div>`).join('')||'<div class="su-empty">暂无 Runtime 伏笔记录。完成章节结算后会进入这里。</div>'}</div></section></div>`;
  }

  function runtimePage(s){
    const rt=runtime(s), keys=['events','knowledge','transitions','causality','foreshadowing'];
    return `<div class="su-page"><div class="su-page-title"><div><div class="su-kicker">NOVEL RUNTIME</div><h2>Runtime</h2><p>这里是真实运行时数据的可视入口：事件、知识、状态迁移、因果与伏笔。</p></div><button class="su-primary" data-su-action="legacy-narrative">打开叙事引擎</button></div><div class="su-stat-grid su-runtime-stats">${keys.map(k=>`<div><b>${Array.isArray(rt[k])?rt[k].length:0}</b><span>${({events:'事件',knowledge:'知识边界',transitions:'状态迁移',causality:'因果链接',foreshadowing:'伏笔'})[k]}</span></div>`).join('')}</div><section class="su-panel"><div class="su-panel-head"><div><b>最新事件</b><small>按章节结算顺序展示</small></div></div><div class="su-list">${(rt.events||[]).slice().reverse().slice(0,15).map(e=>`<div class="su-list-row static"><span class="su-num">${esc(e.chapterId||'—')}</span><div><b>${esc(e.summary||e.type||'事件')}</b><small>${esc(e.time||'未标注时间')} · ${esc(e.status||'')}</small></div><em>${esc(e.type||'OTHER')}</em></div>`).join('')||'<div class="su-empty">暂无 Runtime 事件。完成正文结算后会自动出现。</div>'}</div></section></div>`;
  }

  function writing(s){
    return `<div class="su-page"><div class="su-page-title"><div><div class="su-kicker">WRITING DESK</div><h2>正文写作</h2><p>章节正文仍使用原有成熟编辑器；这里负责把它作为一级工作区暴露出来。</p></div><button class="su-primary" data-su-action="legacy-writing">进入正文作家</button></div><section class="su-panel"><div class="su-panel-head"><div><b>正文工作区</b><small>章节生成、阅读器、上下章连续性与结算均由原引擎执行。</small></div></div><button class="su-big-action" data-su-action="legacy-writing">打开正文作家 <span>→</span></button></section></div>`;
  }

  function renderPage(id){
    const s=state(), canvas=$('#suCanvas'); if(!canvas)return;
    const html={overview:overview,story:story,world:world,timeline:timeline,foreshadow:foreshadow,writing:writing,runtime:runtimePage}[id](s);
    canvas.innerHTML=html;
    $$('.su-nav-item').forEach(b=>b.classList.toggle('active',b.dataset.suNav===id));
    bindCanvas();
  }
  function showLegacy(){ $('#suCanvas')?.classList.add('hidden'); $('#view')?.classList.remove('su-legacy-hidden'); }
  function showCanvas(){ $('#view')?.classList.add('su-legacy-hidden'); $('#suCanvas')?.classList.remove('hidden'); }
  function go(id){ if(id==='writing'){ renderPage('writing'); showCanvas(); return; } renderPage(id); showCanvas(); }
  function bindCanvas(){
    $$('[data-su-action]').forEach(b=>b.onclick=()=>{
      const a=b.dataset.suAction;
      if(['overview','story','world','timeline','foreshadow','runtime','writing'].includes(a)) return go(a);
      if(a==='legacy-story') return legacyStep(1,'[data-flow="3"]');
      if(a==='legacy-dict') return legacyStep(1,'[data-flow="6"]');
      if(a==='legacy-timeline') return legacyStep(1,'[data-flow="5"]');
      if(a==='legacy-writing') return legacyStep(1,'[data-flow="9"]');
      if(a==='legacy-narrative'){ openLegacyPanel('#narrativeEnginePanel'); return; }
      if(a==='story-plan') return legacyStep(1,'[data-flow="5"]');
    });
  }

  function ensureStyle(){ if(document.getElementById('suShellStyle')) return; const l=document.createElement('link'); l.id='suShellStyle'; l.rel='stylesheet'; l.href=new URL('./app-shell.css?v=1', import.meta.url).href; document.head.appendChild(l); }

  function shell(){
    if($('#suShell')) return;
    ensureStyle();
    const app=$('#app'); if(!app)return;
    const top=$('.topbar');
    const el=document.createElement('aside'); el.id='suShell'; el.className='su-shell';
    el.innerHTML=`<div class="su-shell-head"><div class="su-mark">N</div><div><b>NEWTELL123</b><small>STORY WORKSPACE</small></div><button class="su-collapse" type="button" aria-label="收起导航">‹</button></div><nav class="su-nav">${groups.map(g=>`<button class="su-nav-item" data-su-nav="${g.id}" title="${esc(g.hint)}"><span>${g.icon}</span><div><b>${g.label}</b><small>${g.hint}</small></div></button>`).join('')}</nav><div class="su-shell-foot"><button data-su-system="history">↶ <span>历史作品</span></button><button data-su-system="settings">⚙ <span>设置</span></button></div>`;
    app.insertBefore(el, app.firstChild);
    const opener=document.createElement('button'); opener.id='suMobileOpen'; opener.className='su-mobile-open'; opener.type='button'; opener.textContent='☰'; opener.setAttribute('aria-label','打开创作导航'); app.appendChild(opener);
    opener.onclick=()=>app.classList.add('su-nav-collapsed');
    const canvas=document.createElement('section'); canvas.id='suCanvas'; canvas.className='su-canvas hidden';
    const view=$('#view'); view.parentNode.insertBefore(canvas,view);
    $$('.su-nav-item').forEach(b=>b.onclick=()=>go(b.dataset.suNav));
    $('.su-collapse',el).onclick=()=>app.classList.toggle('su-nav-collapsed');
    $('[data-su-system="history"]',el).onclick=()=>openLegacyPanel('#histPanel');
    $('[data-su-system="settings"]',el).onclick=()=>{ const b=$('#btnSettings'); if(b)b.click(); };
    // The old step indicator is obsolete; the bottom tabbar remains the
    // primary legacy workspace navigation and must stay visible/clickable.
    $('.stepper')?.classList.add('su-legacy-secondary');
    $('.tabbar')?.classList.remove('su-legacy-secondary');

    // When a legacy bottom tab is clicked while the v51 canvas is open,
    // reveal the legacy workspace first. Otherwise the click changes the
    // underlying step but the user keeps seeing the canvas and it looks dead.
    $$('.tab').forEach(t => t.addEventListener('click', () => {
      showLegacy();
    }, true));

    renderPage('overview'); showCanvas();
  }

  function init(){
    shell();
    window.addEventListener('tellme:ready',()=>{ shell(); renderPage('overview'); });
    window.addEventListener('tellme:state-change',()=>{ const id=$('.su-nav-item.active')?.dataset.suNav||'overview'; if($('#suCanvas')&&!$('#suCanvas').classList.contains('hidden')) renderPage(id); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  window.TellMeAppShell={go,renderPage,refresh:()=>renderPage($('.su-nav-item.active')?.dataset.suNav||'overview')};
})();
