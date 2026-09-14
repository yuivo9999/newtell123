/* v30: cohesive legacy region — 长篇控制台 / 记忆仓与创建进度. */

export function install(deps){
  let {
    CYBER_HOME_GRID,
    aiRecipeCard,
    beatStructureCardHtml,
    bookBeatBriefHtml,
    bookBeatHtml,
    causalityMapHtml,
    cleanChapterTitle,
    dictEnrichBlockHtml,
    dictMasterBlockHtml,
    esc,
    fixQueueCardHtml,
    genBatchN,
    getDeckStepStatus,
    glossaryCardHtml,
    isLong,
    longNovelHealthHtml,
    microBeatBlock,
    openCreationProgressModal,
    persist,
    polishIdle,
    polishKeepBar,
    qualityReportCardHtml,
    relationshipTrajectoryHtml,
    safeCard,
    schoolZoneBlock,
    seamAuditHtml,
    state,
    titleManagerHtml,
    writeStyleCard,
  } = deps;
  const TEAM_OPTIONS = window.TellMeLegacyShared?.TEAM_OPTIONS || window.TellMeLegacyDomains?.['story-domain']?.TEAM_OPTIONS || [
    { id:'solo', label:'单人视角', desc:'聚焦单主角内心与行动' },
    { id:'dual', label:'双主角视角', desc:'双线交织或双重视角' },
    { id:'trio', label:'三人小队', desc:'铁三角互动' },
    { id:'quad', label:'四人团队', desc:'群像协作' },
    { id:'ensemble', label:'群像多视角', desc:'宏大叙事与多方交锋' }
  ];
  const currentTeamShape = (...a) => (window.currentTeamShape ? window.currentTeamShape(...a) : (window.TellMeLegacyDomains?.['story-domain']?.currentTeamShape ? window.TellMeLegacyDomains['story-domain'].currentTeamShape(...a) : (TEAM_OPTIONS[0])));



function longNovelControlDeckHtml(){
  if(!isLong()) return '';
  const d=longNovelMemoryData(); const total=(state.outline&&state.outline.chapters||[]).length||chapterCountVal()||0, written=writtenChapterCount();
  const current=written?written:0; const pct=total?Math.round(written/total*100):0;
  const steps = getDeckStepStatus();
  const stepsHtml = steps.map(st=>{
    const cls = st.done ? 'done' : (st.active ? 'active' : '');
    return `<span class="${cls}" data-deck-jump="${st.target}" title="点击定位到「${st.name}」环节" style="cursor:pointer">${esc(st.name)}</span>`;
  }).join('<b>→</b>');

  return `<section class="novel-control-deck" data-novel-deck>
    <div class="ncd-head">
      <div>
        <span class="ncd-kicker">🎬 LONGFORM CONTROL DESK</span>
        <h2>长篇导演台</h2>
        <p>只显示“现在最重要的状态与动作”；详细资料收进下方资料仓。</p>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <button type="button" class="btn small ghost ncd-view-progress" data-ncd-progress title="点击打开长篇全景创作进度与健康体检">📊 创作进度查看</button>
        <div class="ncd-progress" data-ncd-progress style="cursor:pointer" title="点击查看创作全景进度">
          <b>${current}/${total||'?'}</b>
          <span>章节落地 · ${pct}%</span>
          <i><em style="width:${pct}%"></em></i>
        </div>
      </div>
    </div>
    <div class="ncd-steps">${stepsHtml}</div>
    <div class="ncd-grid">
      <div class="ncd-card"><small>当前小说状态</small><b>${written?`第 ${written} 章已落地`:'尚未落地正文'}</b><span>${esc(d.fc.lastScene||'等待第一章形成真实世界状态')}</span></div>
      <div class="ncd-card"><small>下一关键动作</small><b>${written<total?'继续生成下一章':'检查全书收束'}</b><span>${written<total?'正文将从上一章真实状态继续，不另起炉灶。':'全书已达到计划章节数，可进入体检与收束检查。'}</span></div>
      <div class="ncd-card" data-ncd-progress style="cursor:pointer"><small>长篇健康</small><b>${written?'记忆链已启用':'等待首章'}</b><span>状态账本 · 因果地图 · 伏笔银行 · 章间接缝</span></div>
    </div>
  </section>`;
}


function longNovelMemoryRepoHtml(){
  if(!isLong() || !state.outline) return '';
  return `<section class="flow-repo long-memory-repo" data-repo="novel-memory"><details class="repo-drawer" ${ensureLongMemory().uiOpen?'open':''}><summary><span class="repo-ic">🧠</span><b>长篇记忆与体检仓</b><span class="repo-note">状态、因果、伏笔、人物关系、章间接缝集中管理</span><span class="repo-open">展开检查 ▸</span></summary><div class="repo-body">
    <div class="lm-section"><div class="lm-title">🧭 小说状态账本</div><div class="lm-state"><div><b>当前章</b><span>${writtenChapterCount()?`第${writtenChapterCount()}章`:'—'}</span></div><div><b>最后定格</b><span>${esc((state.outline._factCard&&state.outline._factCard.lastScene)||'—')}</span></div><div><b>章节数</b><span>${(state.outline.chapters||[]).length||chapterCountVal()||'—'}</span></div></div></div>
    <div class="lm-section"><div class="lm-title">🕸️ 因果地图</div><div class="lm-causal">${causalityMapHtml()}</div></div>
    <div class="lm-section"><div class="lm-title">🏦 伏笔银行</div><div class="lm-foreshadow">${refreshForeshadowBank().slice(-12).reverse().map(x=>`<div><span class="pill ${x.status==='open'?'tag-warn':'tag-ok'}">${x.status==='open'?'待回收':'疑似回收'}</span><b>第${x.chapter}章</b><span>${esc(x.text)}</span></div>`).join('')||'<span class="muted">暂无可识别伏笔；教案中的“埋设伏笔”会自动进入这里。</span>'}</div></div>
    <div class="lm-section"><div class="lm-title">👥 人物关系状态</div>${relationshipTrajectoryHtml()}</div>
    <div class="lm-section"><div class="lm-title">🪡 章间接缝</div><div class="lm-seams">${seamAuditHtml()}</div></div>
    <div class="lm-section"><div class="lm-title">📊 小说体检</div>${longNovelHealthHtml()}</div>
  </div></details></section>`;
}


function bindLongNovelMemoryRepo(){
  const d=document.querySelector('.long-memory-repo details'); if(!d) return;
  d.addEventListener('toggle',()=>{ ensureLongMemory().uiOpen=d.open; persist(); });
}


function bindLongNovelControlDeck(){
  $$('[data-ncd-progress]').forEach(btn=>{
    btn.onclick = ()=> openCreationProgressModal();
  });
  $$('[data-deck-jump]').forEach(el=>{
    el.onclick = ()=>{
      const sel = el.dataset.deckJump;
      if(!sel) return;
      const target = document.querySelector(sel);
      if(target){
        target.scrollIntoView({ behavior:'smooth', block:'center' });
        target.classList.add('gs-flash');
        setTimeout(()=> target.classList.remove('gs-flash'), 1600);
      }
    };
  });
}



function viewStory(){
  if(!state.outline){
    const homeSub = isLong()
      ? `用几句话描述你的长篇构想（世界观、主角、核心冲突都行）。AI 会按你设定的章节数与全书拍子扩写成大纲，之后按「生成章节」逐步写完。`
      : '用几句话描述你的点子（世界观、主角、核心冲突都行）。AI 会扩写成完整故事大纲与章节。';
    const opt_card = `
        <div class="card card-theme-idea">
          <div class="card-head-bar">
            <div class="ch-left">
              <span class="ch-badge ch-badge-idea">💡</span>
              <h3 class="ch-title">用户构想与五向优化</h3>
              <span class="ch-subtag ch-subtag-idea">${(state.polishOptions&&state.polishOptions.length)?'✨ 构想已优化':'待优化'}</span>
            </div>
            <div class="ch-right">
              <label class="pol-multi" title="生成多方向构想供比选"><input type="checkbox" id="chkPolishMulti" checked> 多方案</label>
            </div>
          </div>
          <div class="idea-row">
            <textarea id="ideaInput" placeholder="描述你的故事点子（世界观、主角、核心冲突等）…">${esc(state.idea)}</textarea>
          </div>
          <div class="btn-row">
            <button id="btnPolishIdea" class="btn ghost ${polishIdle()?'first':''}">✨ 优化构想</button>
          </div>
          <div id="polishBox" class="pol-box" style="display:${state.polishCollapsed?'none':'block'}">
            <div class="pol-head"><b>✨ 方案比选</b>
              <span class="pol-tools">
                <button id="btnPolishDiscard" class="btn small ghost">✕ 收起</button>
              </span>
            </div>
            <div id="polishCards" class="pol-cards"></div>
          </div>
          ${ (state.polishCollapsed && Array.isArray(state.polishOptions) && state.polishOptions.length) ? `<div class="pol-keep pol-keep-collapsed"><span class="pol-keep-t">✓ 已采用：${esc(state.polishAdopted || state.polishOptions[0].name || '方案1')} · 优化方案已收起</span><span class="pol-keep-btns"><button type="button" class="btn small ghost" data-pol-keep-view>🔍 展开/更换方案</button></span></div>` : '' }
          ${ polishKeepBar() }
          <div class="btn-row">
            <button id="btnGenOutline" class="btn primary block" ${(!(Array.isArray(state.polishOptions) && state.polishOptions.length))?'disabled title="请先优化构想再生成大纲"':''}>${(!(Array.isArray(state.polishOptions) && state.polishOptions.length))?'📋 待优化构想后生成':(isLong()?'📚 生成大纲':'✨ 生成故事大纲')}</button>
          </div>
          <p id="outlineStatus" class="status"></p>
        </div>`;
    return CYBER_HOME_GRID + `${isLong()?longNovelControlDeckHtml():''}
    <div class="flow-wrap">
            <section class="flow-sec" data-flow="1">
        <div class="flow-sec-head"><span class="fs-no">1</span><span class="fs-name">写作风格</span><span class="fs-note">用户先定表达方式 · 全书共享 · 表达层最高权威</span></div>
        <div class="flow-style-lock-note" style="margin:0 0 10px;padding:9px 12px;border:1px solid var(--line,#ddd);border-radius:10px;background:var(--card,#fff);font-size:12px;line-height:1.7">
          🔒 <b>表达层最高权威</b>：这里确定「怎么写」。后续优化构想只能提供创意建议，不得偷偷改写你已经选定的写作风格。
        </div>
        ${ safeCard(()=>writeStyleCard()) }
      </section>
<section class="flow-sec flow-action-sec" data-flow="2">
  <div class="flow-sec-head"><span class="fs-no">2</span><span class="fs-name">创作基础</span><span class="fs-note">先确定章节数与全书宏观拍子，再交给优化构想</span></div>
  <div class="card card-theme-idea decision-base-card">
    <div class="card-head-bar">
      <div class="ch-left"><span class="ch-badge ch-badge-beat">🧭</span><h3 class="ch-title">故事基础设置</h3><span class="ch-subtag ch-subtag-beat">优化构想读取这里的选择</span></div>
      <div class="ch-right"><span class="muted" style="font-size:12px">先定骨架</span></div>
    </div>
    ${isLong() ? `
    <div class="tw-panel" style="margin-bottom:10px">
      <div class="poly-head"><span class="poly-ic">📐</span><b>全书章节数</b><span class="poly-rule">必填 · 1-200 整数</span></div>
      <div class="tw-row">
        <input type="number" id="chapterCountIn" class="tw-in cc-in" min="1" max="200" step="1" inputmode="numeric" placeholder="如 30" value="${chapterCountVal()||''}" />
        <span class="tw-unit">章</span>
        ${chapterCountVal()?`<span class="pill tag-ok">${chapterCountHint()}</span>`:''}
      </div>
    </div>
    ${bookBeatHtml()}
    ${openingStrategyHtml()}
    ` : ''}
    <h4 style="margin:18px 0 6px">叙事视角</h4>
    <div class="team-pick" id="teamPick">
      ${TEAM_OPTIONS.map(o=>`
      <label class="team-item ${o.id===currentTeamShape().id?'sel':''}" data-team="${o.id}" title="${esc(o.desc)}">
        <span class="team-ic">${o.id==='solo'?'👤':o.id==='dual'?'👫':o.id==='trio'?'🤝':o.id==='quad'?'👥':'🧑‍🤝‍🧑'}</span>
        <span class="team-txt"><b>${esc(o.label)}</b><i>${esc(o.desc)}</i></span>
        <input type="radio" name="teamShape" value="${o.id}" style="display:none" ${o.id===currentTeamShape().id?'checked':''}>
      </label>`).join('')}
    </div>
  </div>
</section>
<section class="flow-sec flow-action-sec" data-flow="3">
  <div class="flow-sec-head"><span class="fs-no">3</span><span class="fs-name">故事构想与优化</span><span class="fs-note">AI 只在已确定的表达与全书骨架上优化故事</span></div>
  ${bookBeatBriefHtml()}
  ${opt_card}
</section>
<section class="flow-sec" data-flow="4">
        <div class="flow-sec-head"><span class="fs-no">4</span><span class="fs-name">写作配方</span><span class="fs-note">把已锁定风格翻译成可执行规则 · 全书共享</span></div>
        ${ safeCard(()=>aiRecipeCard()) }
        
      </section>
<section class="flow-sec" data-flow="5">
        <div class="flow-sec-head"><span class="fs-no">5</span><span class="fs-name">全书节拍</span><span class="fs-note">按全书主线节奏划分剧情阶段（本地映射）</span></div>
        ${ safeCard(()=> isLong() ? beatStructureCardHtml() : '') }
      </section>
<section class="flow-sec flow-info-sec" data-flow="6">
        <div class="flow-sec-head"><span class="fs-no">6</span><span class="fs-name">词典达人</span><span class="fs-note">全局设定架构师 · 人物/法宝/地理/规则硬设定</span></div>
        ${ safeCard(()=>dictMasterBlockHtml()) }
      </section>
<section class="flow-sec flow-info-sec" data-flow="7">
        <div class="flow-sec-head"><span class="fs-no">7</span><span class="fs-name">词典充实</span><span class="fs-note">设定细化工坊 · 感官特征 · 场景禁忌 · 氛围龙套</span></div>
        ${ safeCard(()=>dictEnrichBlockHtml()) }
      </section>
<section class="flow-sec flow-action-sec" data-flow="8">
        <div class="flow-sec-head"><span class="fs-no">8</span><span class="fs-name">学校统筹</span><span class="fs-note">章节微拍 → 校长全局总控 → 老师分段备课</span></div>
        ${ safeCard(()=>microBeatBlock()) }
        ${ safeCard(()=>schoolZoneBlock()) }
      </section>
<section class="flow-sec flow-info-sec" data-flow="7.5">
  <div class="flow-sec-head"><span class="fs-no">📇</span><span class="fs-name">万物词典</span><span class="fs-note">全书共享事实数据库 · 正文的设定唯一基准</span></div>
  ${ glossaryCardHtml() }
</section>
${longNovelMemoryRepoHtml()}
<section class="flow-sec" data-flow="9">
        <div class="flow-sec-head"><span class="fs-no">9</span><span class="fs-name">正文作家 · 章节创作</span><span class="fs-note">专注文学变现 · 双注入连贯撰写</span></div>
        ${ isLong() ? `<div class="btn-row" style="margin-top:8px">
          <label class="long-jump"><span>跳到章节：</span>
          <select id="longJump"><option value="">— 选择章节阅读 —</option>${state.chapters.map((c,i)=>`<option value="${i}">第${i+1}章 ${esc(cleanChapterTitle(c.title))}</option>`).join('')}</select></label>
        </div>` : '' }
        ${ safeCard(()=>qualityReportCardHtml()) }
        <div class="ch-toolbar">
          <span class="ch-toolbar-t">📚 章节列表（共 ${state.chapters.length} 章，已生成 ${state.chapters.filter(c=>c.content && String(c.content).trim()).length} 章）</span>
        </div>
        <div id="chaptersWrap"></div>
        ${ safeCard(()=>fixQueueCardHtml()) }
        <div class="btn-row" style="margin-top:12px">
          ${ isLong() ? `<span class="multi-gen">
            <span class="multi-gen-main">
              <button id="btnGenMany" class="btn blue">⚡ 批量生成多章</button>
            </span>
            <span class="gen-stepper">
              <button type="button" class="gen-step" data-gen-dec title="减少章数">−</button>
              <output id="genCountOut" class="gen-count-out" aria-live="polite">${genBatchN}</output><span class="gen-unit">章</span>
              <button type="button" class="gen-step" data-gen-inc title="增加章数">＋</button>
            </span>
          </span>` : `<button id="btnGenAllChapters" class="btn primary">⚡ 一键生成全部章节</button><button id="btnReOutline" class="btn ghost">重生成大纲</button>` }
        </div>
        ${ isLong() ? `<div class="range-gen">
          <button id="btnRangeGen" class="btn blue">⚡ 区间生成</button>
          <label class="rg-label">从第
            <input id="rgStart" type="number" min="1" max="${state.chapters.length}" value="1" class="rg-input">
          章</label>
          <span class="muted" style="font-size:12px">到第</span>
          <label class="rg-label">
            <input id="rgEnd" type="number" min="1" max="${state.chapters.length}" value="2" class="rg-input">
          章</label>
          <span id="rgStatus" class="muted" style="font-size:11px"></span>
        </div>` : '' }
        <p id="chStatus" class="status"></p>
        <p id="bgTaskIndicator" class="status muted" style="display:none;font-size:12px;margin-top:2px"></p>
        ${ isLong() ? `<div class="long-progress"></div>` : '' }
        <div id="wcTotal" class="wc-total hidden"></div>
        <div class="cyber-pad hidden"></div>
      </section>
    </div>`;
  }
  const o = state.outline;
  let html = `
  ${longNovelControlDeckHtml()}
  <div class="flow-wrap">
        <section class="flow-sec" data-flow="1">
      <div class="flow-sec-head"><span class="fs-no">1</span><span class="fs-name">写作风格</span><span class="fs-note">用户先定表达方式 · 全书共享 · 表达层最高权威</span></div>
      <div class="flow-style-lock-note" style="margin:0 0 10px;padding:9px 12px;border:1px solid var(--line,#ddd);border-radius:10px;background:var(--card,#fff);font-size:12px;line-height:1.7">
        🔒 <b>表达层最高权威</b>：这里确定「怎么写」。后续优化构想只能提供创意建议，不得偷偷改写你已经选定的写作风格。
      </div>
      ${ safeCard(()=>writeStyleCard()) }
    </section>
<section class="flow-sec" data-flow="2">
      <div class="flow-sec-head"><span class="fs-no">2</span><span class="fs-name">故事构想与优化</span><span class="fs-note">先保留原始灵感，再由 AI 提供可选优化方案</span></div>
      ${bookBeatBriefHtml()}
      <div class="card card-theme-idea">
        <div class="card-head-bar">
          <div class="ch-left">
            <span class="ch-badge ch-badge-idea">✨</span>
            <h3 class="ch-title">候选方案比选</h3>
            <span class="ch-subtag ch-subtag-idea">${(state.polishOptions&&state.polishOptions.length)?`${state.polishOptions.length} 个方案可选`:'多向优化'}</span>
          </div>
          <div class="ch-right">
            ${dictmasterLocked()?'<span class="muted" style="font-size:12px">②方案已锁定</span>':''}
          </div>
        </div>
        <div id="polishCards2" class="pol-box" style="display:block"></div>
        ${ polishKeepBar() }   <!-- v1.0.205 阶段5.5 后悔药：生成大纲后仍可 查看历史优化版本 / 重新优化 / 重新选候选后点下方「生成大纲」重搬（词典达人产出前可反悔） -->
        <div class="btn-row" style="margin-top:8px">
          <button data-gen-outline class="btn primary block" ${dictmasterLocked()?'disabled title="词典达人已产出，②方案已锁定"':''}>📚 生成大纲（搬入书名 / 简介 / 节拍）${dictmasterLocked()?'（②已锁定）':''}</button>
        </div>
      </div>
    <div class="card card-theme-idea">
      <div class="card-head-bar">
        <div class="ch-left">
          <span class="ch-badge ch-badge-idea">📋</span>
          <h3 class="ch-title">故事大纲与书名</h3>
          <span class="ch-subtag ch-subtag-idea">《${esc(o.title||'未命名')}》</span>
        </div>
        <div class="ch-right">
          ${titleManagerHtml()}
        </div>
      </div>
      <div class="so-fold-head" id="soLoglineBox" data-so-toggle role="button" tabindex="0" title="展开/收起小说简介" style="display:flex">
        <span class="so-fold">${state.soCollapsed?'▸':'▾'}</span><b>📌 小说简介</b>
        <button type="button" class="btn small ghost" id="btnLoglineEdit" title="编辑小说简介" style="margin-left:auto;padding:1px 8px;font-size:12px">✎ 编辑</button>
      </div>
      <div class="so-logline" ${state.soCollapsed?'hidden':''}>${renderLoglineHtml(o.logline||'')||'（暂无简介，点✎编辑或重新生成大纲）'}</div>
    </div>
    </section>
<section class="flow-sec" data-flow="3">
      <div class="flow-sec-head"><span class="fs-no">3</span><span class="fs-name">写作配方</span><span class="fs-note">把已锁定风格翻译成可执行规则 · 全书共享</span></div>
      ${ aiRecipeCard() }
      
    </section>
<section class="flow-sec" data-flow="4">
      <div class="flow-sec-head"><span class="fs-no">4</span><span class="fs-name">全书节拍</span><span class="fs-note">按全书主线节奏划分剧情阶段（本地映射）</span></div>
      ${bookBeatBriefHtml()}
      ${ isLong() ? beatStructureCardHtml() : '' }
    </section>
<section class="flow-sec flow-info-sec" data-flow="5">
      <div class="flow-sec-head"><span class="fs-no">5</span><span class="fs-name">词典达人</span><span class="fs-note">全局设定架构师 · 人物/法宝/地理/规则硬设定</span></div>
      ${ dictMasterBlockHtml() }
    </section>
<section class="flow-sec flow-info-sec" data-flow="6">
      <div class="flow-sec-head"><span class="fs-no">6</span><span class="fs-name">词典充实</span><span class="fs-note">设定细化工坊 · 感官特征 · 场景禁忌 · 氛围龙套</span></div>
      ${ dictEnrichBlockHtml() }
    </section>
<section class="flow-sec flow-action-sec" data-flow="7">
      <div class="flow-sec-head"><span class="fs-no">7</span><span class="fs-name">学校统筹</span><span class="fs-note">章节微拍 → 校长全局总控 → 老师分段备课</span></div>
      ${ microBeatBlock() }
      ${ schoolZoneBlock() }
    </section>
<section class="flow-sec flow-info-sec" data-flow="7.5">
  <div class="flow-sec-head"><span class="fs-no">📇</span><span class="fs-name">万物词典</span><span class="fs-note">全书共享事实数据库 · 正文的设定唯一基准</span></div>
  ${ safeCard(()=>glossaryCardHtml()) }
</section>
${longNovelMemoryRepoHtml()}
<section class="flow-sec" data-flow="8">
      <div class="flow-sec-head"><span class="fs-no">8</span><span class="fs-name">正文作家 · 章节创作</span><span class="fs-note">专注文学变现 · 双注入连贯撰写</span></div>
        ${ isLong() ? `<div class="btn-row" style="margin-top:8px">
          <label class="long-jump"><span>跳到章节：</span>
          <select id="longJump"><option value="">— 选择章节阅读 —</option>${state.chapters.map((c,i)=>`<option value="${i}">第${i+1}章 ${esc(cleanChapterTitle(c.title))}</option>`).join('')}</select></label>
        </div>` : '' }
        ${ qualityReportCardHtml() }
        <div class="ch-toolbar">
          <span class="ch-toolbar-t">📚 章节列表（共 ${state.chapters.length} 章，已生成 ${state.chapters.filter(c=>c.content && String(c.content).trim()).length} 章）</span>
        </div>
        <div id="chaptersWrap"></div>
        ${ fixQueueCardHtml() }
        <div class="btn-row" style="margin-top:12px">
          ${ isLong() ? `<span class="multi-gen">
            <span class="multi-gen-main">
              <button id="btnGenMany" class="btn blue">⚡ 批量生成多章</button>
            </span>
            <span class="gen-stepper">
              <button type="button" class="gen-step" data-gen-dec title="减少章数">−</button>
              <output id="genCountOut" class="gen-count-out" aria-live="polite">${genBatchN}</output><span class="gen-unit">章</span>
              <button type="button" class="gen-step" data-gen-inc title="增加章数">＋</button>
            </span>
          </span>` : `<button id="btnGenAllChapters" class="btn primary">⚡ 一键生成全部章节</button><button id="btnReOutline" class="btn ghost">重生成大纲</button>` }
        </div>
        ${ isLong() ? `<div class="range-gen">
          <button id="btnRangeGen" class="btn blue">⚡ 区间生成</button>
          <label class="rg-label">从第
            <input id="rgStart" type="number" min="1" max="${state.chapters.length}" value="1" class="rg-input">
          章</label>
          <span class="muted" style="font-size:12px">到第</span>
          <label class="rg-label">
            <input id="rgEnd" type="number" min="1" max="${state.chapters.length}" value="2" class="rg-input">
          章</label>
          <span id="rgStatus" class="muted" style="font-size:11px"></span>
        </div>` : '' }
        <p id="chStatus" class="status"></p>
        <p id="bgTaskIndicator" class="status muted" style="display:none;font-size:12px;margin-top:2px"></p>
        ${ isLong() ? `<div class="long-progress"></div>` : '' }
        <div id="wcTotal" class="wc-total hidden"></div>
        <div class="cyber-pad hidden"></div>
    </section>
  </div>`;
  return html;
}

  const api = {
    longNovelControlDeckHtml,
    longNovelMemoryRepoHtml,
    bindLongNovelMemoryRepo,
    bindLongNovelControlDeck,
    viewStory,
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['long-novel-control'] = Object.freeze(api);
  return ns['long-novel-control'];
}
