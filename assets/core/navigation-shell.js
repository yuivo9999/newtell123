/* v30: cohesive legacy region — Navigation / 主流程导航与长篇健康总览. */

export function install(deps){
  let {
    FLOW_NAV,
    LONG_CHAPTER_SYS_PRO,
    beatCnt,
    beatTypeKeys,
    bindView,
    closeNeModal,
    currentStep,
    destroyCharTS,
    esc,
    factCardHtml,
    getCfg,
    openNeModal,
    persist,
    restartCascade,
    rollingSummaryCardHtml,
    saveCfg,
    scDone,
    state,
    toast,
    updateWcTotal,
    viewCharacters,
    viewExport,
    viewScenes,
    viewStory,
    viewStoryboard,
  } = deps;
  const $ = (s, r = document) => (r || document).querySelector(s);
  const $$ = (s, r = document) => [...(r || document).querySelectorAll(s)];
  const normalizeOutline = (...a) => (window.normalizeOutline ? window.normalizeOutline(...a) : window.TellMeLegacyDomains?.['story-domain']?.normalizeOutline?.(...a));


function chapterSysBase(){
  const keys = beatTypeKeys().join(' / ');
  const cnt = beatCnt();
  const base = LONG_CHAPTER_SYS_PRO
    .split('setup/rise/climax/hook').join(beatTypeKeys().join('/'))
    .split('setup / rise / climax / hook').join(keys)
    .split('四个事件').join(cnt + ' 段节拍事件');
  const closedGate = `【正文作家·多层执行链（闭卷创作规范）】
你是长篇小说的「正文作家（学生）」，只专注文学笔力、对白交锋与生动场面铺展。你的输入不是互相竞争的几份提示词，而是一条有权限层级的创作链：
· L1【世界事实层】：词典达人 + 词典充实已经批准的世界、人物、地点、专名、规则；这是“世界是什么”，不得私自改写。
· L2【学校规划层】：校长的全书方向/阶段结构 + 老师本章教案；这是“本章写什么”。老师可以在世界允许范围内设计中间过程，正文必须完成其核心任务。
· L3【动态状态层】：上一章正文结算状态、物理接力、时间合同；这是“故事现在实际在哪里”。它优先决定开笔的真实状态，不能为了迎合教案而篡改上一章已经写成的事实。
· L4【文学表达层】：风格、语言、节奏与场景表现；这是“怎么写”。
任何层级都不能反向覆盖更高权威层。允许你发挥的是文学表达，以及教案允许的中间动作/细节；不允许你凭空重定义世界事实、时间状态或主线结果。
· 【上一章末尾·物理接力】若存在，它是开笔的绝对物理起点：第一段必须从其收尾景象/动作/未完对话/人物处境自然续写。若为首章，则执行第一章开篇任务卡。
· 【转场过桥律】：若上一章末尾的物理状态与本章教案「剧情时间落点」或骨架第①拍存在时空跨度（如上章深夜结束、教案要求次日清晨赶路），必须在首段顺势用 1~2 句自然笔法交代时空流转或环境位移，平滑过桥，严禁生硬瞬移，也严禁原地打转死扣上章不往前走。
· 【核心主线防发散律】：正文作家不重新设计主线。词典资源由老师按章调配；正文只使用老师点名的核心人物/设定。对于不影响主线的现场动作、对话、环境和一次性过场人物，可以自然发挥，但不能创造会持续影响后文的新核心事实。
· 【场景过场路人与临时龙套点缀权】：正文作家可根据具体场景的叙事与氛围需要，自然点缀店小二、摊贩、茶客、更夫、传令兵、前台侍者等过场闲人。
  - 授权纪律：允许现场自然拟定称谓或名字，写一两句动作或对话即止，只作环境气氛烘托；
  - 边界红线：此类路人龙套只在当前场景出现一次，绝不推动主线，后续剧情不会再次登场，亦不计入词典，点到即收；严禁喧宾夺主或抢占主角/教案核心人物戏份。
· 【成篇写法与达标收束】：按教案推进骨架顺序自然流淌推进，相邻环节自然过渡融合，字数达到篇幅契约即自然收束，严禁逐拍写标签或写散装提纲。
`;
  return closedGate + base;
}



function fullStoryText(){
  return state.chapters.map(c => `【${c.title}】\n${c.content}`).join('\n\n');
}



function isLong(){ return state.mode === 'longnovel' || state.mode !== 'shortfilm'; }



function renderStepper(){
  const steps = [
    {n:1,t:'故事构想'},{n:2,t:'角色提示词'},{n:3,t:'场景提示词'},
    {n:4,t:'分镜文字'},{n:5,t:'导出资产包'}
  ];
  $('#stepper').innerHTML = steps.map(s=>{
    const cls = s.n===currentStep ? 'active' : (s.n<currentStep ? 'done' : '');
    return `<span class="chip ${cls}">${s.n<currentStep?'✓ ':''}${s.t}</span>`;
  }).join('');
}



function updateMechaNav(){
  const mtn = $('#mechaTopNav'); if(!mtn) return;
  $$('.cap', mtn).forEach(c=>{
    const n = c.dataset.step ? +c.dataset.step : null;
    c.classList.toggle('active', n && n === currentStep);
  });
}



function render(){
  const _restY = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
  normalizeOutline(state.outline);
  destroyCharTS(); // 先销毁旧 Tom Select，避免 DOM 残留/重复实例
  restartCascade();
  renderStepper();
  updateMechaNav();
  if (isLong() && (currentStep === 2 || currentStep === 4)) {
    currentStep = 1;
  }
  $$('.tab').forEach(t=>{
    const n = +t.dataset.step;
    const hideLong = isLong() && (n===2 || n===4);
    t.style.display = hideLong ? 'none' : 'flex';
    t.classList.toggle('hidden', hideLong);
    t.classList.toggle('active', n===currentStep);
  });
  const v = $('#view');
  if(currentStep===1) v.innerHTML = viewStory();
  else if(currentStep===2) v.innerHTML = viewCharacters();
  else if(currentStep===3) v.innerHTML = viewScenes();
  else if(currentStep===4) v.innerHTML = viewStoryboard();
  else if(currentStep===5) v.innerHTML = viewExport();
  bindView();
  if(currentStep===1) bindFlowSideNav();
  updateWcTotal();
  if(_restY >= 0){ try{ window.scrollTo(0, _restY); }catch(e){} }
}




function currentTitle(){
  const o = state.outline;
  if(o && o.title) return o.title;
  return state.idea ? state.idea.trim().slice(0,20) : '未命名作品';
}


function pushTitleHistory(oldName){
  if(!oldName) return;
  const d = new Date();
  const date = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
    + ' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  state.titleHistory.unshift({ name: oldName, date });
  if(state.titleHistory.length > 50) state.titleHistory = state.titleHistory.slice(0,50);
}


function renameTitle(newName){
  newName = String(newName||'').trim();
  if(!newName){ toast('书名不能为空'); return; }
  const oldName = currentTitle();
  if(oldName === newName){ toast('书名未变化'); return; }
  pushTitleHistory(oldName);
  if(state.outline) state.outline.title = newName;
  persist(); render();
  toast(`已改名为「${newName}」，原「${oldName}」已记入曾用名`);
}


function titleManagerHtml(){
  let histRows;
  if(state.titleHistory && state.titleHistory.length){
    histRows = state.titleHistory.map((h,idx)=>
      `<div class="hist-row"><span class="hist-name">${esc(h.name)}</span><span class="hist-date">${esc(h.date)}</span>
        <span class="hist-ops">
          <button type="button" class="icon-btn hist-op" data-hist-restore="${esc(h.name)}" title="恢复为此名">↩</button>
          <button type="button" class="icon-btn hist-op" data-hist-del="${idx}" title="删除该记录">🗑</button>
        </span></div>`
    ).join('');
  }else{
    histRows = `<div class="hist-empty">暂无曾用名</div>`;
  }
  return `
    <div class="title-manager">
      <span class="tm-cur" id="tmCur" title="点击改名">${esc(currentTitle())}</span>
      <button type="button" class="icon-btn tm-tri" id="btnTmTri" title="曾用名" data-tm-tri>▾</button>
      <div class="tm-hist hidden" id="tmHist">
        <div class="hist-title">曾用名</div>
        ${histRows}
      </div>
    </div>`;
}


function flowNavItems(){
  return FLOW_NAV.filter(([l, sel, key])=>{
    try{
      if(l === '配方' || key === 'recipe') return !!(document && (document.querySelector('.ai-recipe-card') || document.querySelector(sel)));
      return !!(document && document.querySelector(sel));
    }catch(e){ return false; }
  });
}


function flowNavHtml(){
  const items = flowNavItems();
  return `<div class="flow-sidenav">${items.map(([l, sel, key])=>{
    const isRecipe = (l === '配方' || key === 'recipe');
    return `<button type="button" class="fsd-btn${isRecipe?' fsd-btn-recipe':''}" ${isRecipe?'data-nav-key="recipe"':''} title="跳到「${l}」">${l}</button>`;
  }).join('')}</div>`;
}


function bindFlowSideNav(){
  const old = document.querySelector('.flow-sidenav'); if(old && old.parentNode) old.parentNode.removeChild(old);
  const items = flowNavItems(); if(!items.length) return;
  const nav = document.createElement('div');
  nav.className = 'flow-sidenav';
  items.forEach(([l, sel, key])=>{
    const b = document.createElement('button');
    b.type = 'button';
    const isRecipe = (l === '配方' || key === 'recipe');
    b.className = 'fsd-btn' + (isRecipe ? ' fsd-btn-recipe' : '');
    b.dataset.navSel = sel;
    if(isRecipe) b.dataset.navKey = 'recipe';
    b.title = '跳到「'+l+'」';
    b.textContent = l;
    b.onclick = ()=>{
      let el = null;
      if(isRecipe){
        el = document.querySelector('.ai-recipe-card') || document.querySelector('[data-ai-recipe-fold]') || document.querySelector(sel);
      } else {
        el = document.querySelector(sel);
      }
      if(el){
        if(isRecipe){
          const card = el.closest ? (el.closest('.ai-recipe-card') || el) : el;
          if(card && card.classList && card.classList.contains('collapsed')){
            card.classList.remove('collapsed');
            const ico = card.querySelector('.sc-fold-ico');
            if(ico) ico.textContent = '▾';
            const cfg = getCfg();
            cfg.aiRecipeCollapsed = false;
            saveCfg(cfg);
          }
          try{
            el.scrollIntoView({ behavior:'smooth', block:'center', inline:'nearest' });
          }catch(e){
            el.scrollIntoView(true);
          }
        } else if(l === '正'){
          const targetCard = el.querySelector('#chaptersWrap') || el.querySelector('.ch-card') || el.querySelector('.card') || el;
          try{
            targetCard.scrollIntoView({ behavior:'smooth', block:'center', inline:'nearest' });
          }catch(e){
            targetCard.scrollIntoView(true);
          }
          targetCard.classList.add('gs-flash');
          setTimeout(()=> targetCard.classList.remove('gs-flash'), 1600);
          return;
        } else {
          el.scrollIntoView({ behavior:'smooth', block:'start' });
        }
        el.classList.add('gs-flash');
        setTimeout(()=> el.classList.remove('gs-flash'), 1600);
      }
    };
    nav.appendChild(b);
  });
  ((document.getElementById('view') ? document.getElementById('view').parentElement : document.body) || document.body).appendChild(nav);
}


function flowPlaceholderSec(n, name, note, icon, desc){
  return `<section class="flow-sec" data-flow="${n}">
    <div class="flow-sec-head"><span class="fs-no">${n}</span><span class="fs-name">${name}</span><span class="fs-note">${note}</span></div>
    <div class="dict-master-placeholder">${icon} ${desc}</div>
  </section>`;
}


function openFactCardModal(){ openNeModal('事实与一致性看板', factCardHtml() || '<div class="empty">暂无事实与一致性数据。</div>'); }


function openRollingSummaryModal(){ openNeModal('滚动摘要', rollingSummaryCardHtml() || '<div class="empty">暂无滚动摘要。</div>'); }



function consistencyReportHtml(){
  const o = state.outline; const g = (o && o.glossary) || {};
  const totalN = (o && Array.isArray(o.chapters)) ? o.chapters.length : 0;
  const rows = [];
  const dupGroups = [];
  ['characters','places','propernouns'].forEach(k=>{
    const byName = {};
    (g[k]||[]).forEach(x=>{ const n=String(x&&x.name||'').trim(); if(!n) return; (byName[n]=byName[n]||[]).push(x); });
    Object.keys(byName).forEach(n=>{ if(byName[n].length>1) dupGroups.push({cat:k, name:n, count:byName[n].length, list:byName[n]}); });
  });
  if(dupGroups.length){
    rows.push(`<div class="chk-item bad">✗ 词典存在同名重复（${dupGroups.length} 组）</div>`);
    dupGroups.forEach(d=>{
      const src = d.list.map(x=> x._dictmaster?'词典达人' : (x._auto?'逐章提取':'手工')).join('、');
      rows.push(`<div class="chk-sub">【${d.cat==='characters'?'人物':(d.cat==='places'?'地名':'专名')}】「${esc(d.name)}」×${d.count}（来源：${esc(src)}），应仅保留高优先级一份。</div>`);
    });
  } else {
    rows.push(`<div class="chk-item ok">✓ 词典无同名重复（人物 ${(g.characters||[]).length} · 地名 ${(g.places||[]).length} · 专名 ${(g.propernouns||[]).length}）</div>`);
  }
  const noBeat = [];
  for(let i=0;i<totalN;i++){
    const p = (Array.isArray(o.chapterPlans) && o.chapterPlans[i]) || null;
    if(!String(p && p.beatsText || '').trim()) noBeat.push(i+1);
  }
  if(noBeat.length) rows.push(`<div class="chk-item bad">✗ 章节拍悬空：第 ${noBeat.join('、')} 章节拍表为空（缺节拍）</div>`);
  else if(totalN) rows.push(`<div class="chk-item ok">✓ 全部 ${totalN} 章均有节拍表，无悬空</div>`);
  const tl = (o && o._globalTimeline) || null;
  const tlText = tl && String(tl.text||'').trim();
  if(!tl || (!tlText && !Array.isArray(tl.chapters))){
    rows.push(`<div class="chk-item warn">△ 全局时间线未生成（可为规划师③步后补），时间锚悬空无法校验</div>`);
  } else if(tlText){
    rows.push(`<div class="chk-item ok">✓ 全局时间线已生成（纯文本，每章时点已内联，正文据此承接）</div>`);
  } else {
    const anchors = tl.chapters;
    const covered = new Set(anchors.map(a=>a&&a.index).filter(n=>Number.isFinite(n)));
    const missCh = [];
    for(let i=0;i<totalN;i++){ if(!covered.has(i)) missCh.push(i+1); }
    const mono = [];
    const sorted = anchors.slice().sort((a,b)=>(a.index-b.index));
    for(let k=1;k<sorted.length;k++){
      const prevT = sorted[k-1].to, curT = sorted[k].from;   // 上一章结尾 vs 本章开头
      if(!prevT || !curT) continue;
      const a = normTimeW(prevT), b = normTimeW(curT);
      if(a!=null && b!=null && b < a) mono.push(`第${sorted[k-1].index+1}章末「${esc(prevT)}」→ 第${sorted[k].index+1}章初「${esc(curT)}」`);
    }
    if(mono.length) rows.push(`<div class="chk-item bad">✗ 时间锚疑似回退（${mono.length} 处）：${mono.slice(0,3).join('；')}${mono.length>3?'…':''}</div>`);
    else rows.push(`<div class="chk-item ok">✓ 时间锚未发现明显回退</div>`);
    if(missCh.length) rows.push(`<div class="chk-item warn">△ 全局时间表未覆盖章节：第 ${missCh.join('、')} 章（可点规划师③步重排补落位）</div>`);
    else if(totalN) rows.push(`<div class="chk-item ok">✓ 全局时间表每章均有落点（${anchors.length} 锚 / ${totalN} 章）</div>`);
  }
  if(!totalN) rows.push(`<div class="chk-item warn">△ 尚无章节，无法做节拍/时间线自检</div>`);
  const timeAudit = (o && o._timeAudit) || {};
  const timeWarn = Object.values(timeAudit).filter(x=>x&&x.status==='warn');
  if(timeWarn.length){
    const sample = timeWarn.slice(0,3).map(x=>`第${Number(x.chapter)+1}章时间开场${x.openerCount}次`).join('；');
    rows.push(`<div class="chk-item warn">△ 时间文学表现需复核（${timeWarn.length}章）：${esc(sample)}。时间合同仍以规划时间线为准。</div>`);
  } else if(totalN && Object.keys(timeAudit).length){
    rows.push(`<div class="chk-item ok">✓ 已完成正文时间表现审计：未发现明显的时间开场模板化/重复问题</div>`);
  }
  const hasDup = dupGroups.length>0, hasBeat = noBeat.length>0, hasMono = /✗ 时间锚/.test(rows.join(''));
  rows.push(`<div class="chk-summary">累计：${hasDup||hasBeat||hasMono ? '发现问题，请按提示修正后重跑。' : '各项通过 ✓'}</div>`);
  return `<div class="chk-wrap">${rows.join('')}</div>`;
}


function normTimeW(t){
  const s = String(t||'').trim(); if(!s) return null;
  if(/^[\d.]+$/.test(s)){ const f=parseFloat(s); return Number.isFinite(f)?f:null; }
  const digits = s.replace(/[^0-9]+/g,''); if(digits.length){ const n=+digits; return Number.isFinite(n)?n:null; }
  return null;
}


function openConsistencyCheck(){ openNeModal('一致性自检（阶段4）', consistencyReportHtml() || '<div class="empty">暂无数据。</div>'); }



function safeCard(fn, fb){
  try{ return fn(); }catch(e){ console.error('[safeCard]', e); return fb || ''; }
}



function causalityMapHtml(){
  const o=state.outline||{}; const plans=Array.isArray(o.chapterPlans)?o.chapterPlans:[]; const written=writtenChapterCount();
  const rows=[];
  plans.slice(0, Math.min(plans.length, written+4)).forEach((p,i)=>{
    const b=extractPlanField(p,['承接点','承接']); const a=extractPlanField(p,['逐拍推进','场景链与切换','场景链']); const z=extractPlanField(p,['收束设计','收束']);
    if(b||a||z) rows.push(`<div class="lm-causal-row"><span>第${i+1}章</span><div><b>${esc(b||'承接既有状态')}</b><span>→ ${esc(a||'推进本章教案事件')}</span><span>→ ${esc(z||'形成下一章接口')}</span></div></div>`);
  });
  return rows.length?rows.join(''):'<div class="muted">尚无足够章节教案可形成因果地图。</div>';
}


function relationshipTrajectoryHtml(){
  const g=(state.outline&&state.outline.glossary)||{}, rel=Array.isArray(g._relationshipTable)?g._relationshipTable:[];
  if(!rel.length) return '<div class="muted">词典尚无关系表；词典达人产出后这里会自动显示。</div>';
  return `<div class="lm-rel-grid">${rel.slice(0,24).map(x=>`<div class="lm-rel"><b>${esc(x.a||'?')}</b><span>↔ ${esc(x.relation||'关系')} ↔</span><b>${esc(x.b||'?')}</b>${x.note?`<small>${esc(x.note)}</small>`:''}</div>`).join('')}</div>`;
}


function seamAuditHtml(){
  const written=writtenChapterCount(); if(written<2) return '<div class="muted">至少完成 2 章后才能进行章间接缝检查。</div>';
  const rows=[]; const o=state.outline||{};
  for(let i=Math.max(1,written-5);i<written;i++){
    const prev=state.chapters[i-1], cur=state.chapters[i];
    const tail=String(prev&&prev.content||'').trim().slice(-120); const plan=Array.isArray(o.chapterPlans)?o.chapterPlans[i]:null;
    const conn=extractPlanField(plan,['承接点','承接','连续性']);
    const ok=!!tail && !!conn;
    rows.push(`<div class="lm-seam-row"><b>第${i}→第${i+1}章</b><span class="pill ${ok?'tag-ok':'tag-warn'}">${ok?'✓ 有物理接缝':'△ 需要检查'}</span><small>${esc(conn||'教案未提供明确承接点')}</small></div>`);
  }
  return rows.join('');
}


function longNovelHealthHtml(){
  const o=state.outline||{}, total=(o.chapters||[]).length||chapterCountVal()||0, written=writtenChapterCount();
  const plans=Array.isArray(o.chapterPlans)?o.chapterPlans:[];
  const noPlan=Math.max(0,total-plans.filter(Boolean).length), noDigest=Math.max(0,written-(Array.isArray(o._chapterDigests)?o._chapterDigests.filter(Boolean).length:0));
  const fo=refreshForeshadowBank(); const open=fo.filter(x=>x.status==='open').length;
  const scores={连续性:Math.max(55,100-Math.min(35,noDigest*4)),因果:Math.max(55,100-Math.min(35,noPlan*3)),伏笔:open?Math.max(60,96-Math.min(30,open*2)):96,记忆:written?Math.max(65,100-Math.min(30,noDigest*5)):60};
  return `<div class="lm-health-grid">${Object.entries(scores).map(([k,v])=>`<div class="lm-score"><b>${k}</b><strong>${v}</strong><span>/100</span></div>`).join('')}</div><div class="lm-health-notes"><span>已写 ${written}/${total||'?'} 章</span><span>缺教案 ${noPlan}</span><span>缺细摘要 ${noDigest}</span><span>未确认回收伏笔 ${open}</span></div>`;
}


function getDeckStepStatus(){
  const o = state.outline;
  const chs = (o && Array.isArray(o.chapters)) ? o.chapters : [];
  const total = chs.length || chapterCountVal() || 0;
  const written = writtenChapterCount();
  const groups = schoolStageGroups();
  const s1_done = !!(state.chapterStyle && state.chapterStyle.tags && state.chapterStyle.tags.length);
  const s2_done = !!(state.polishAdopted || (state.idea && state.idea.trim()));
  const s3_done = !!(state.outlineConfirmed && o && chs.length > 0);
  const s4_done = !!(scDone('dictMaster') || state.dictmasterRan || (o && o.glossary && ((o.glossary.characters||[]).length > 0)));
  const s5_done = scDone('principal');
  const s6_done = (groups.length > 0 && groups.every((g,i)=>scDone('t'+i)));
  const s7_done = (total > 0 && written >= total);

  const steps = [
    { key:'style', name:'风格', done:s1_done, target:'[data-flow="1"]', desc: s1_done ? '已选定小说文风倾向' : '待设定小说文风' },
    { key:'idea',  name:'构想', done:s2_done, target:'[data-flow="2"]', desc: s2_done ? '核心故事构想已就绪' : '待输入核心构想' },
    { key:'outline',name:'大纲', done:s3_done, target: (o ? '[data-flow="2"]' : '#btnGenOutline'), desc: s3_done ? `已定稿 ${chs.length} 章分卷大纲` : '待生成全书大纲' },
    { key:'dict',  name:'词典', done:s4_done, target:'.card-theme-dictmaster', desc: s4_done ? '万物词典人物/地名已架构' : '待词典达人建立万物词典' },
    { key:'principal',name:'校长', done:s5_done, target:'.school-card', desc: s5_done ? '校长统筹守则与标题已定稿' : '待校长统筹全局' },
    { key:'teacher',name:'老师', done:s6_done, target:'.school-teachers', desc: s6_done ? (groups.length > 1 ? `${groups.length} 位老师分段教案就绪` : '老师教案就绪') : '待老师备课分段教案' },
    { key:'chapter',name:'正文', done:s7_done, target:'.chapter-card', desc: written ? `正文已落地 ${written}/${total||'?'} 章` : '待生成第 1 章正文' }
  ];

  let foundActive = false;
  steps.forEach(st => {
    if(!st.done && !foundActive){
      st.active = true;
      foundActive = true;
    } else {
      st.active = false;
    }
  });
  return steps;
}



function openCreationProgressModal(){
  const o = state.outline;
  const chs = (o && Array.isArray(o.chapters)) ? o.chapters : [];
  const total = chs.length || chapterCountVal() || 0;
  const written = writtenChapterCount();
  const pct = total ? Math.round(written/total*100) : 0;
  const steps = getDeckStepStatus();

  let totalChars = 0;
  const chRows = [];
  for(let i=0; i<total; i++){
    const ch = chs[i] || {};
    const title = String(ch.title || (state.school && state.school.principal && state.school.principal.titles && state.school.principal.titles[i]) || `第 ${i+1} 章`).trim();
    const body = String(ch.body || ch.content || '').trim();
    const len = body.length;
    if(len > 0) totalChars += len;
    const hasPlan = Array.isArray(o.chapterPlans) && !!o.chapterPlans[i];
    chRows.push({
      idx: i + 1,
      title,
      len,
      done: len > 0,
      hasPlan
    });
  }

  const g = (o && o.glossary) || {};
  const charCount = (g.characters||[]).length;
  const placeCount = (g.places||[]).length;
  const propCount = (g.propernouns||[]).length;
  const ruleCount = (g.rules||[]).length;

  const fo = refreshForeshadowBank();
  const foOpen = fo.filter(x=>x.status==='open').length;
  const foDone = fo.filter(x=>x.status==='done'||x.status==='resolved').length;

  const bodyHtml = `
    <div class="cp-modal-view">
      <!-- 汇总大卡片 -->
      <div class="cp-summary-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px">
        <div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px 12px">
          <div style="font-size:11px;color:var(--dim)">章节落地率</div>
          <div style="font-size:20px;font-weight:700;color:var(--pri);margin-top:2px">${written} / ${total||'?'} <span style="font-size:12px;font-weight:400;color:var(--sub)">(${pct}%)</span></div>
          <div style="height:4px;background:var(--line);border-radius:2px;margin-top:6px;overflow:hidden">
            <div style="height:100%;background:var(--pri);width:${pct}%"></div>
          </div>
        </div>
        <div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px 12px">
          <div style="font-size:11px;color:var(--dim)">正文总字数</div>
          <div style="font-size:20px;font-weight:700;color:var(--txt);margin-top:2px">${totalChars.toLocaleString()} <span style="font-size:12px;font-weight:400;color:var(--sub)">字</span></div>
          <div style="font-size:11px;color:var(--dim);margin-top:6px">${written ? `均章 ${Math.round(totalChars/written)} 字` : '首章待生成'}</div>
        </div>
        <div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px 12px">
          <div style="font-size:11px;color:var(--dim)">万物词典资产</div>
          <div style="font-size:18px;font-weight:700;color:var(--txt);margin-top:2px">${charCount} 人物 · ${placeCount} 地名</div>
          <div style="font-size:11px;color:var(--dim);margin-top:6px">${propCount} 专名 · ${ruleCount} 规则</div>
        </div>
        <div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px 12px">
          <div style="font-size:11px;color:var(--dim)">伏笔与因果</div>
          <div style="font-size:18px;font-weight:700;color:var(--txt);margin-top:2px">${foOpen} <span style="font-size:12px;font-weight:400;color:var(--sub)">待回收</span></div>
          <div style="font-size:11px;color:var(--dim);margin-top:6px">${foDone} 条已确认回收</div>
        </div>
      </div>

      <!-- 7 大创作工序全景健康体检 -->
      <div style="margin-bottom:14px">
        <div style="font-weight:600;font-size:13px;margin-bottom:8px;display:flex;align-items:center;gap:6px">
          <span>🎯 长篇创作工序全景状态</span>
          <span style="font-size:11px;color:var(--dim);font-weight:400">（点击工序可直接跳转到对应卡片）</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${steps.map(st=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--panel2);border:1px solid var(--line);border-radius:6px;gap:8px">
              <div style="display:flex;align-items:center;gap:8px">
                <span class="pill ${st.done ? 'tag-ok' : (st.active ? 'tag-warn' : '')}" style="font-size:11px;padding:2px 6px">
                  ${st.done ? '✓ 已就绪' : (st.active ? '⏳ 进行中' : '⚪ 待推进')}
                </span>
                <b style="font-size:13px">${esc(st.name)}</b>
                <span style="font-size:12px;color:var(--sub)">${esc(st.desc)}</span>
              </div>
              <button type="button" class="btn small ghost" data-modal-jump="${st.target}" style="padding:2px 8px;font-size:11px">定位</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 逐章落地进度明细表 -->
      ${chRows.length ? `
        <div>
          <div style="font-weight:600;font-size:13px;margin-bottom:8px">📖 逐章落地明细表（共 ${chRows.length} 章）</div>
          <div style="max-height:240px;overflow-y:auto;border:1px solid var(--line);border-radius:6px">
            <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left">
              <thead>
                <tr style="background:var(--panel2);border-bottom:1px solid var(--line);color:var(--dim)">
                  <th style="padding:6px 10px;width:60px">章号</th>
                  <th style="padding:6px 10px">标题</th>
                  <th style="padding:6px 10px;width:90px">正文字数</th>
                  <th style="padding:6px 10px;width:90px">状态</th>
                </tr>
              </thead>
              <tbody>
                ${chRows.map(r=>`
                  <tr style="border-bottom:1px solid var(--line)">
                    <td style="padding:6px 10px;font-weight:600">第 ${r.idx} 章</td>
                    <td style="padding:6px 10px">${esc(r.title)}</td>
                    <td style="padding:6px 10px;color:${r.done?'var(--pri)':'var(--dim)'}">${r.done ? `${r.len.toLocaleString()} 字` : '—'}</td>
                    <td style="padding:6px 10px">
                      <span class="pill ${r.done ? 'tag-ok' : (r.hasPlan ? 'tag-warn' : '')}" style="font-size:10px;padding:1px 5px">
                        ${r.done ? '✓ 正文就绪' : (r.hasPlan ? '教案已备' : '待推进')}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  const actsHtml = `
    <button type="button" class="btn ghost small" data-modal-open-repo>🧠 展开长篇体检仓</button>
    <button type="button" class="btn primary small" data-modal-close>关闭</button>
  `;

  openNeModal('📊 长篇创作全景进度与健康体检', bodyHtml, actsHtml);

  // 绑定弹窗内事件
  const m = $('#neModal');
  if(m){
    m.querySelectorAll('[data-modal-jump]').forEach(b=>{
      b.onclick = ()=>{
        const target = document.querySelector(b.dataset.modalJump);
        closeNeModal();
        if(target){
          setTimeout(()=>{
            target.scrollIntoView({ behavior:'smooth', block:'center' });
            target.classList.add('gs-flash');
            setTimeout(()=> target.classList.remove('gs-flash'), 1600);
          }, 150);
        }
      };
    });
    const repoBtn = m.querySelector('[data-modal-open-repo]');
    if(repoBtn){
      repoBtn.onclick = ()=>{
        closeNeModal();
        const d = document.querySelector('.long-memory-repo details');
        if(d){
          d.open = true;
          ensureLongMemory().uiOpen = true;
          persist();
          setTimeout(()=> d.scrollIntoView({ behavior:'smooth', block:'start' }), 150);
        }
      };
    }
    const closeBtn = m.querySelector('[data-modal-close]');
    if(closeBtn) closeBtn.onclick = ()=> closeNeModal();
  }
}

  const api = {
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
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['navigation-shell'] = Object.freeze(api);
  return ns['navigation-shell'];
}
