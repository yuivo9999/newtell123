/* v30: cohesive legacy region — 节拍表 / 章节规划工作区. */

export function install(deps){
  let {
    bindPlannerSoundTool,
    bindSchoolSteps,
    buildChapterUser,
    chState,
    closeGlossaryPanel,
    esc,
    getSchoolStepStatus,
    isPrincipalTitlesApplied,
    openTimelineBoard,
    patchChapter,
    persist,
    renderChapters,
    schoolStepBtn,
    schoolTeacherBtn,
    snapshotChapterVersion,
    state,
    toast,
  } = deps;
  const schoolStageGroups = (...a) => (window.schoolStageGroups ? window.schoolStageGroups(...a) : (window.TellMeLegacyDomains?.['school-domain']?.schoolStageGroups ? window.TellMeLegacyDomains['school-domain'].schoolStageGroups(...a) : []));



function schoolPipelineProgress(){
  const run = state._schoolRunning;
  const stepDefs = [
    { key:'dictMaster', icon:'📖 ', label:'词典达人', title:'词典达人：设定架构。点击单独重跑' },
    { key:'dictEnrich', icon:'🗂 ', label:'词典充实', title:'词典充实：细化与描写工坊。点击单独重跑' },
    { key:'principal',  icon:'👑 ', label:'校长',     title:'校长：全局写作守则与标题总表。点击单独重跑' },
    { key:'teacher',    icon:'🎓 ', label:'老师',     title:'老师：逐章编写六栏目教案。点击单独重跑' }
  ];
  const doneCount = stepDefs.filter(s => getSchoolStepStatus(s.key).isDone).length;
  const pct = Math.round((doneCount / 4) * 100);
  const topMsg = run ? `⚡ <b>一键开学进行中</b>（${run.stepIndex+1}/4 · ${esc(run.label)}）…` : '⏳ 设定就绪 → 学校开学（四步标准管线）';

  const buttonsHtml = stepDefs.map(s => schoolStepBtn(s.key, s.icon, s.label, s.title)).join('');

  return `<div class="sc-pipeline">
    <div class="sc-pipe-top"><span class="sc-pipe-t">${topMsg}</span><span class="sc-pipe-m">${doneCount}/4 步就绪 · ${pct}%</span></div>
    <div class="sc-pipe-bar"><span class="sc-pipe-in" style="width:${pct}%"></span></div>
    <div class="sc-pipe-steps">
      ${buttonsHtml}
    </div>
  </div>`;
}



function schoolZoneBlock(){
  const groups = schoolStageGroups();
  const pTitles = (state.school && state.school.principal && Array.isArray(state.school.principal.titles)) ? state.school.principal.titles : [];
  const titlesApplied = isPrincipalTitlesApplied();
  const tBody = groups.length
    ? groups.map((g,i)=> schoolTeacherBtn(g,i)).join('')
    : `<div class="sc-teachers-ph">🎓 老师备课区：生成大纲后按节拍自动分配分段。</div>`;
  const stepKeys = ['dictMaster','dictEnrich','principal','teacher'];
  const doneSteps = stepKeys.filter(k => getSchoolStepStatus(k).isDone).length;
  const pct = Math.round(doneSteps / 4 * 100);
  const run = state._schoolRunning;
  return `<div class="card cp-card school-card card-theme-school">
    <div class="cp-head card-head-bar">
      <div class="ch-left">
        <span class="ch-badge ch-badge-school">🏛️</span>
        <h3 class="ch-title">编剧学院 · 统筹与教案</h3>
        <span class="ch-subtag ch-subtag-school">${doneSteps}/4 步就绪 · ${pct}%</span>
      </div>
      <div class="ch-right">
        ${pTitles.length ? `<button type="button" class="sc-plan-btn sc-plan-apply-t ${titlesApplied?'applied':''}" data-scp-apply-titles title="${titlesApplied ? '校长已自动选用拟定标题至全书章节；点击可再次全量覆盖同步' : '一键选用校长拟定标题至全书章节'}">${titlesApplied ? `✓ 校长标题已选用 (${pTitles.length}章)` : `✨ 选用拟定标题 (${pTitles.length}章)`}</button>` : ''}
        <button type="button" class="sc-plan-btn sc-plan-pr" data-scp-plan-pr title="查看写作守则与章节总表">📋 读校长成果</button>
      </div>
    </div>
    <div class="cp-body">
      <div class="school-zone">
        <div class="school-zone-head">
          <span>👑 校长（总控） → 🎓 老师（分段教案） → ✍️ 正文作家</span>
          <em class="school-zone-tip">${groups.length ? (groups.length > 1 ? `${groups.length} 位老师分段` : `1 位老师全书教案`) : '待设定章节数'}</em>
        </div>
        ${schoolPipelineProgress()}
        <div class="school-steps">
          <div class="school-steps-main">
            <button type="button" class="sc-step sc-runall ${run?'running':''}" data-scp-all title="一键按序运行词典达人、词典充实、校长统筹与老师备课，标题自动定稿">${run ? `⚡ 一键开学中（${run.stepIndex+1}/${run.totalSteps} · ${esc(run.label)}）…` : '⚡ 一键开学（全链路备课）'}</button>
          </div>
        </div>
        <div class="school-teachers">
          ${tBody}
        </div>
      </div>
      <!-- 完成声音 + 音量：单个完成 / 全部完成 的音色在顶部 🎨 主题面板挑选，这里只留开关与音量 -->
      <div class="cp-sound-tool">
        <label class="cps-switch" title="某一步完成响「单个完成」音；学校一键全跑完响「全部完成」音">
          <input id="cpsSoundDone" type="checkbox">
          <span class="cps-wrap"><i>🔔</i><b>完成声音</b></span>
        </label>
        <label class="cps-vol" title="提醒音音量">
          <span>🔊</span>
          <input id="cpsSoundVol" type="range" min="0" max="100" step="5" value="80">
          <em id="cpsSoundVolLb" class="muted">80%</em>
        </label>
      </div>
    </div>
  </div>`;
}



function bindChapterPlanFold(){
  const head = $('[data-cp-fold]');
  if(!head) return;
  head.onclick = (e)=>{
    if(e.target.closest('[data-cp-all]') || e.target.closest('[data-cp-stage]') || e.target.closest('[data-cp-enrich]') || e.target.closest('[data-cp-raw]') || e.target.closest('.stop-btn')) return;
    state.cpCollapsed = !state.cpCollapsed;
    persist();
    const body = $('.cp-body'); if(body) body.hidden = state.cpCollapsed;
    const ico = head.querySelector('.cp-arrow'); if(ico) ico.textContent = state.cpCollapsed ? '▸' : '▾';
  };
}


function bindChapterPlan(){
  bindSchoolSteps();   // 学校模式：校长/老师/一键开学 按钮绑定
}



function bindBeatSheet(){
  const o = state.outline; if(!o) return;
  const _tmBd = document.querySelector('[data-cp-time-board]');
  if(_tmBd) _tmBd.onclick = ()=> openTimelineBoard();
  bindPlannerSoundTool();
}



async function regenSelectedChapters(list){
  if(!list || !list.length) return;
  const panel = document.createElement('div');
  panel.id = 'gsPanel'; panel.className = 'gs-overlay';
  panel.innerHTML = `<div class="gs-modal"><div class="gs-modal-head"><b>⚡ 正在按新词典重生成 ${list.length} 章…</b></div>
    <p class="gs-progress muted">请保持页面打开，逐章推进，不会打断你浏览已生成章节。</p></div>`;
  document.body.appendChild(panel);
  state.generating = true;
  try{
    for(const i of list){
      chState[i]='generating'; patchChapter(i);
      const pg = panel.querySelector('.gs-progress');
      if(pg) pg.textContent = `正在重写第 ${i+1} 章…`;
      try{
        const user = buildChapterUser(i, {regenerating:true});
        const txt = await writeOneChapterContent(i, user);      // 关闭流式，单章连贯
        snapshotChapterVersion(i);
        state.chapters[i].content = txt;
        chState[i]='done'; persist(); patchChapter(i);
      }catch(e){ chState[i]='error'; persist(); patchChapter(i); }
    }
    closeGlossaryPanel();
    renderChapters();
    toast('所选章节已按新词典重生成完成');
  }finally{ state.generating = false; }
}

  const api = {
    schoolPipelineProgress,
    schoolZoneBlock,
    bindChapterPlanFold,
    bindChapterPlan,
    bindBeatSheet,
    regenSelectedChapters,
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['chapter-plan-workspace'] = Object.freeze(api);
  return ns['chapter-plan-workspace'];
}
