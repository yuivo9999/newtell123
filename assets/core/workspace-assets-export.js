/* v27: cohesive workspace/assets/export region extracted from app-legacy.js. */

export function install(deps){
  let {
    state,
    lib,
    currentStep,
    persist,
    toast,
    esc,
    copyText,
    download,
    countWords,
    wcInner,
    wcBadge,
    uid,
    parseAge,
    isLong,
    cleanChapterTitle,
    randomizeReaderGradient,
    updateReaderProgress,
    assetHistCount,
    hasAssetHist
  } = deps;
  const W = typeof window !== 'undefined' ? window : globalThis;
  const getFn = (name) => (...a) => {
    if (typeof W[name] === 'function') return W[name](...a);
    if (W.TellMeLegacyShared && typeof W.TellMeLegacyShared[name] === 'function') return W.TellMeLegacyShared[name](...a);
    if (W.TellMeLegacyDomains) {
      for (const d of Object.values(W.TellMeLegacyDomains)) {
        if (d && typeof d[name] === 'function') return d[name](...a);
      }
    }
    return undefined;
  };
  const bindPolishIdea = getFn('bindPolishIdea');
  const genOutline = getFn('genOutline');
  const currentTeamShape = (...a) => (W.currentTeamShape ? W.currentTeamShape(...a) : (W.TellMeLegacyDomains?.['story-domain']?.currentTeamShape ? W.TellMeLegacyDomains['story-domain'].currentTeamShape(...a) : { id: 'solo', label: '主角线' }));
  const bindDictMaster = getFn('bindDictMaster');
  const bindDictEnrich = getFn('bindDictEnrich');
  const bindLongNovelMemoryRepo = getFn('bindLongNovelMemoryRepo');
  const bindLongNovelControlDeck = getFn('bindLongNovelControlDeck');
  const renderPolishCards = getFn('renderPolishCards');
  const syncOrigIdeaCard = getFn('syncOrigIdeaCard');
  const render = getFn('render');
  const bindGlossary = getFn('bindGlossary');
  const bindOrigIdea = getFn('bindOrigIdea');
  const bindOutlineFold = getFn('bindOutlineFold');
  const bindLoglineEdit = getFn('bindLoglineEdit');
  const bindAiRecipe = getFn('bindAiRecipe');
  const bindChapterPlan = getFn('bindChapterPlan');
  const bindChapterPlanFold = getFn('bindChapterPlanFold');
  const bindChapterTitles = getFn('bindChapterTitles');
  const bindWriteStyle = getFn('bindWriteStyle');
  const syncChaptersFromOutline = getFn('syncChaptersFromOutline');
  const genManyChapters = getFn('genManyChapters');
  const bindGenBatchControls = getFn('bindGenBatchControls');
  const bindRangeGen = getFn('bindRangeGen');
  const bindBeatSheet = getFn('bindBeatSheet');
  const bindFactCard = getFn('bindFactCard');
  const bindRollingSummaryCard = getFn('bindRollingSummaryCard');
  const bindQualityReportCard = getFn('bindQualityReportCard');
  const bindFixQueueCard = getFn('bindFixQueueCard');
  const bindSceneEdit = getFn('bindSceneEdit');
  const genCharacters = getFn('genCharacters');
  const genScenes = getFn('genScenes');
  const genCover = getFn('genCover');
  const genStoryboard = getFn('genStoryboard');
  const openAssetHistPanel = getFn('openAssetHistPanel');
  const openReader = getFn('openReader');
  const renderLongProgress = getFn('renderLongProgress');
  const renderChapters = getFn('renderChapters');
  const openSchoolPlanReader = getFn('openSchoolPlanReader');
  const openChapterVersionPanel = getFn('openChapterVersionPanel');
  const undoChapterEdit = getFn('undoChapterEdit');
  const openChapterRegenPanel = getFn('openChapterRegenPanel');
  const openChapterSummaryPanel = getFn('openChapterSummaryPanel');
  const continueAndFinalizeChapter = getFn('continueAndFinalizeChapter');
  const adoptChapterPartial = getFn('adoptChapterPartial');
  const updateChapterWc = getFn('updateChapterWc');
  const updateWcTotal = getFn('updateWcTotal');
  const bindReader = getFn('bindReader');
  const guardSwitchStep = (...a) => (W.guardSwitchStep ? W.guardSwitchStep(...a) : true);
  const openingStrategyDef = getFn('openingStrategyDef');
  const charFilters = new Proxy({}, {
    get(_, p) { return (W.charFilters || {})[p]; },
    set(_, p, v) { if (!W.charFilters) W.charFilters = {}; W.charFilters[p] = v; return true; }
  });
  const charTS = new Proxy([], {
    get(_, p) {
      const arr = W.charTS || (W.charTS = []);
      return typeof arr[p] === 'function' ? arr[p].bind(arr) : arr[p];
    },
    set(_, p, v) {
      const arr = W.charTS || (W.charTS = []);
      arr[p] = v;
      return true;
    }
  });

function viewCharacters(){
  if(!readyForAssets()){
    return `<div class="center-empty">请先在「故事」里生成大纲并生成章节。<br>角色提示词需要基于完整故事生成。</div>`;
  }
  if(!state.characters.length){
    return `<div class="card">
      <h3>🧑 角色定妆提示词包</h3>
      <p class="sub">基于故事大纲提取主要角色，并生成即梦影视前期视觉提示词。</p>
      <button id="btnGenChars" class="btn primary block">✨ 生成角色定妆提示词</button>
      <p id="charStatus" class="status"></p>
    </div>`;
  }
  const ids = [...new Set(state.characters.map(c=>(c.profile&&c.profile.身份)||c.role||'').filter(Boolean))];
  const identOptions = ids.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  return `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3>🧑 角色定妆提示词包（${state.characters.length}）</h3>
        <span class="btn-row" style="margin:0">
          ${hasAssetHist('characters')?`<button id="btnCharHist" class="btn ghost">🕘 历史(${assetHistCount('characters')})</button>`:''}
          <button id="btnGenChars" class="btn ghost">🔄 重生成</button>
        </span>
      </div>
      <div class="char-toolbar">
        <input id="charSearch" class="char-search" placeholder="🔍 搜索角色姓名 / 身份…" value="${esc(charFilters.q)}">
        <select id="charJump" class="char-jump" placeholder="选择角色快速定位"></select>
        <select id="charIdent" multiple placeholder="身份筛选（可多选）">${identOptions}</select>
        <div class="char-filters">
          <select id="charGender">
            <option value="" ${charFilters.gender===''?'selected':''}>性别：全部</option>
            <option value="男" ${charFilters.gender==='男'?'selected':''}>男</option>
            <option value="女" ${charFilters.gender==='女'?'selected':''}>女</option>
            <option value="其他" ${charFilters.gender==='其他'?'selected':''}>其他</option>
          </select>
          <div class="cf-age">
            <input type="number" id="ageMin" class="age-input" placeholder="年龄≥" min="0" max="200" value="${esc(charFilters.ageMin)}">
            <span class="age-sep">~</span>
            <input type="number" id="ageMax" class="age-input" placeholder="年龄≤" min="0" max="200" value="${esc(charFilters.ageMax)}">
          </div>
        </div>
        <div class="char-count" id="charCount"></div>
      </div>
    </div>
    <div id="charList">${charFiltered().map(idx=>charCard(state.characters[idx], idx)).join('')}</div>` + fallbackRaw('characters');
}

function charCard(c, idx){
  const pf = c.profile||{};
  const kv = Object.entries(pf).map(([k,v])=>`<div class="kv"><span class="k">${esc(k)}</span><input type="text" class="char-edit" data-char-kv="${idx}" data-key="${esc(k)}" data-orig="${esc(v)}" value="${esc(v)}" /></div>`).join('');
  const order = ['定妆图','三视图','表情','服饰细节','道具','配色','材质'];
  const pr = c.prompts||{};
  const cards = order.map(k=>pr[k]==null?'':`
    <div class="subcard">
      <div class="lbl">${esc(k)}<button class="copy" data-copy="${esc(pr[k])}">复制</button></div>
      <textarea class="char-edit" data-char-prompt="${idx}" data-key="${esc(k)}" data-orig="${esc(pr[k])}" rows="3">${esc(pr[k])}</textarea>
    </div>`).join('');
  const allText = Object.values(pf).join(' ') + ' ' + Object.values(pr).join(' ');
  return `<div class="card" id="char-${idx}">
    <h3 style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">${esc(c.name||'未命名')} <span class="pill">${esc(c.role||'')}</span> ${wcBadge(allText)}</h3>
    <div class="subcard">${kv}</div>
    ${cards}
    <p class="muted" style="margin:4px 0 0;font-size:11px">字段可直接编辑，失焦即存（不触发 AI）。</p>
  </div>`;
}
function bindCharEdit(){
  $$('[data-char-kv],[data-char-prompt]').forEach(inp=>{
    inp.onchange = ()=>{
      const idx = inp.hasAttribute('data-char-kv') ? +inp.dataset.charKv : +inp.dataset.charPrompt;
      const c = state.characters[idx]; if(!c) return;
      const k = inp.dataset.key;
      const v = inp.value;
      if(v === inp.dataset.orig) return;
      if(inp.hasAttribute('data-char-kv')){
        if(!c.profile) c.profile = {};
        c.profile[k] = v;
      } else {
        if(!c.prompts) c.prompts = {};
        c.prompts[k] = v;
      }
      inp.dataset.orig = v;
      persist();
      toast('角色卡已保存');
    };
  });
}

function charFiltered(){
  const {q, idents, gender, ageMin, ageMax} = charFilters;
  const min = ageMin===''||ageMin==null ? null : +ageMin;
  const max = ageMax===''||ageMax==null ? null : +ageMax;
  const out = [];
  state.characters.forEach((c,i)=>{
    const pf = c.profile||{};
    if(q){
      const hay = ((c.name||'')+' '+(c.role||'')+' '+(pf.身份||'')).toLowerCase();
      if(!hay.includes(q.toLowerCase())) return;
    }
    if(idents && idents.length){
      const id = pf.身份||c.role||'';
      if(!idents.some(v=> id.includes(v) || v.includes(id))) return;
    }
    if(gender){
      const g = pf.性别||'';
      if(gender==='其他'){ if(g==='男'||g==='女') return; }
      else if(g!==gender && !g.includes(gender)) return;
    }
    if(min!=null || max!=null){
      const age = parseAge(pf.年龄);
      if(age==null) return; // 未知年龄在有区间约束时默认不显示
      if(min!=null && age<min) return;
      if(max!=null && age>max) return;
    }
    out.push(i);
  });
  return out;
}
function applyCharFilters(){
  const wrap = $('#charList'); if(!wrap) return;
  const idxs = charFiltered();
  wrap.innerHTML = idxs.length
    ? idxs.map(i=>charCard(state.characters[i], i)).join('')
    : `<div class="center-empty">没有符合条件的角色，试试放宽筛选条件。</div>`;
  const cnt = $('#charCount');
  if(cnt) cnt.textContent = `显示 ${idxs.length} / ${state.characters.length} 个角色`;
  bindCopyBtns();
  bindCharEdit();
}
function bindCopyBtns(){ $$('[data-copy]').forEach(b=> b.onclick = ()=> copyText(b.getAttribute('data-copy')) ); }

function initCharFilter(){
  if(!window.TomSelect) return;
  const wrap = $('#charList'); if(!wrap) return;
  const jumpSel = $('#charJump');
  if(jumpSel){
    jumpSel.innerHTML = `<option value="">⬇️ 选择角色快速定位…</option>` + state.characters.map((c,i)=>`<option value="${i}">${esc(c.name||'未命名')}${c.role?(' · '+esc(c.role)):''}</option>`).join('');
    try{
      charTS.push(new TomSelect(jumpSel, {
        plugins:['dropdown_input'],
        placeholder:'⬇️ 选择角色快速定位…',
        allowEmptyOption:true,
        onChange: v=>{
          if(v==='' || v==null) return;
          const card = $('#char-'+v);
          if(card){ card.scrollIntoView({behavior:'smooth', block:'center'}); card.classList.add('flash'); setTimeout(()=>card.classList.remove('flash'), 1600); }
        }
      }));
      try{ jumpSel.tomselect.setValue('', true); }catch(e){}
    }catch(e){}
  }
  const identSel = $('#charIdent');
  if(identSel){
    try{
      const ts = new TomSelect(identSel, {
        plugins:['dropdown_input','clear_button'],
        placeholder:'身份筛选（可多选）',
        allowEmptyOption:false,
        onChange: v=>{ charFilters.idents = v||[]; applyCharFilters(); }
      });
      charTS.push(ts);
      if(charFilters.idents.length) ts.setValue(charFilters.idents, true);
    }catch(e){}
  }
}

function coverCardHtml(){
  const modeLab = state.coverWithTitle ? '含汉字书名' : '纯画面·无文字';
  const modeHint = state.coverWithTitle
    ? '封面将包含书名汉字的书法大字作为主体文字。'
    : '封面为纯画面，预留书名留白，仅作底图，文字后期排版。';
  const seg = state.coverWithTitle
    ? `<div class="cover-modes"><button type="button" class="cm-on">🏷️ 含汉字书名</button><button type="button" class="cm-off" data-cv="clean">🖼️ 纯画面</button></div>`
    : `<div class="cover-modes"><button type="button" class="cm-off" data-cv="title">🏷️ 含汉字书名</button><button type="button" class="cm-on">🖼️ 纯画面</button></div>`;
  return `
    <div class="card cover-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">📕 小说封面提示词</h3>
        <span class="btn-row" style="margin:0">
          ${hasAssetHist('cover')?`<button type="button" class="btn ghost" data-cover-hist>🕘 历史(${assetHistCount('cover')})</button>`:''}
          <span class="pill" id="coverModeLab">${modeLab}</span>
        </span>
      </div>
      ${seg}
      <p class="sub">${modeHint}</p>
      ${state.coverPrompt ? `
        <div class="subcard"><div class="lbl">封面提示词<button class="copy" data-copy="${esc(state.coverPrompt)}">复制</button></div><div class="prompt-text">${esc(state.coverPrompt)}</div></div>
        <label class="field" style="margin-top:8px"><span>✎ 编辑封面提示词（失焦即存，不触发 AI）</span>
          <textarea class="cover-edit" data-cover-edit>${esc(state.coverPrompt)}</textarea></label>
        <div class="btn-row" style="margin-top:8px"><button id="btnGenCover" class="btn ghost">🔄 重生成封面提示词</button></div>
      ` : `
        <div class="btn-row"><button id="btnGenCover" class="btn primary block">🖼️ 生成封面提示词</button></div>
        <p id="coverStatus" class="status"></p>
      `}
    </div>`;
}
function viewScenes(){
  if(!readyForAssets()) return `<div class="center-empty">请先在「故事」里生成大纲并生成章节。</div>`;
  if(isLong()) return coverCardHtml();
  const coverCard = coverCardHtml();
  if(!state.scenes.length){
    return coverCard + `<div class="card">
      <h3>🏞️ 场景提示词</h3>
      <p class="sub">提取关键场景并生成即梦出图提示词（含环境、光影与构图）。</p>
      <button id="btnGenScenes" class="btn primary block">✨ 生成场景提示词</button>
      <p id="sceneStatus" class="status"></p>
    </div>`;
  }
  return coverCard + `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center">
      <h3>🏞️ 场景提示词（${state.scenes.length}）</h3>
      <span class="btn-row" style="margin:0">
        ${hasAssetHist('scenes')?`<button id="btnSceneHist" class="btn ghost">🕘 历史(${assetHistCount('scenes')})</button>`:''}
        <button id="btnGenScenes" class="btn ghost">🔄 重生成</button>
      </span></div></div>` +
    state.scenes.map((s,si)=>`
    <div class="card">
      <h3 style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <input type="text" class="scene-edit-name" data-scene-name="${si}" value="${esc(s.name||'')}" placeholder="场景名" style="flex:0 0 auto;min-width:120px;max-width:220px" />
        <span class="pill tag-env">🌿 纯环境·无人物</span> ${wcBadge((s.description||'')+' '+(s.prompt||''))}</h3>
      <p class="sub">作用：<input type="text" class="scene-edit-role" data-scene-role="${si}" value="${esc(s.作用||'')}" style="flex:1;min-width:160px" /></p>
      <div class="subcard"><div class="lbl">场景设定</div><textarea class="scene-edit-desc" data-scene-desc="${si}" rows="2">${esc(s.description||'')}</textarea></div>
      <div class="subcard"><div class="lbl">即梦出图提示词<button class="copy" data-copy="${esc(s.prompt||'')}">复制</button></div><textarea class="scene-edit-prompt" data-scene-prompt="${si}" rows="3">${esc(s.prompt||'')}</textarea></div>
      <p class="muted" style="margin:4px 0 0;font-size:11px">字段可直接编辑，失焦即存（不触发 AI）。</p>
    </div>`).join('') + fallbackRaw('scenes');
}

function viewStoryboard(){
  if(!readyForAssets()) return `<div class="center-empty">请先在「故事」里生成大纲并生成章节。</div>`;
  if(!state.storyboard.length){
    return `<div class="card">
      <h3>🎞️ 分镜文字</h3>
      <p class="sub">按章节拆解导演级影视分镜与即梦出图提示词。</p>
      <button id="btnGenBoard" class="btn primary block">✨ 生成分镜文字（逐章）</button>
      <p id="boardStatus" class="status"></p>
    </div>`;
  }
  const groups = {};
  state.storyboard.forEach((s,i)=>{ const k = s.章节 || '未分组'; (groups[k]=groups[k]||[]).push(i); });
  const keys = Object.keys(groups).sort((a,b)=>{
    const na=+a, nb=+b;
    return (!isNaN(na)&&!isNaN(nb)) ? na-nb : String(a).localeCompare(String(b),'zh');
  });
  const rows = keys.map(k=>{
    const idxs = groups[k];
    const sec = idxs.reduce((sum,i)=> sum + (Number(state.storyboard[i].时长)||0), 0);
    const ci = (!isNaN(+k)&&state.boardConcepts&&state.boardConcepts[+k-1]) ? state.boardConcepts[+k-1] : null;
    return `<div class="board-ch">
      <div class="board-ch-head">
        <div class="board-ch-title">🎬 第${esc(k)}章</div>
        <div class="board-ch-stat" id="chStat-${esc(k)}">共 ${idxs.length} 镜 · 总时长 ${sec}s</div>
      </div>
      ${ci && (ci.视觉概念||ci.母题) ? `<div class="board-concept"><b>视觉概念：</b>${esc(ci.视觉概念||'')}${ci.母题?('<br><b>母题：</b>'+esc(ci.母题)):''}</div>`:''}
      ${idxs.map(i=>shotHtml(i)).join('')}
    </div>`;
  }).join('');
  const totalSec = state.storyboard.reduce((sum,s)=> sum + (Number(s.时长)||0), 0);
  return `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
      <h3>🎞️ 分镜（${state.storyboard.length} 镜）</h3>
      <span class="btn-row" style="margin:0">
        ${hasAssetHist('storyboard')?`<button id="btnBoardHist" class="btn ghost">🕘 历史(${assetHistCount('storyboard')})</button>`:''}
        <button id="btnGenBoard" class="btn ghost">🔄 重生成</button>
      </span>
    </div>${rows}
    <div class="card board-total">⏱ 全局：<b id="boardTotal">共 ${state.storyboard.length} 镜 · 总时长 ${totalSec}s</b><span class="muted">（每镜时长可点击数字直接修改，统计实时联动）</span></div>`
    + fallbackRaw('storyboard');
}
function shotHtml(i){
  const s = state.storyboard[i];
  const ed = (key, tag='input', rows=2)=> tag==='textarea'
    ? `<textarea class="shot-edit" data-shot="${i}" data-key="${esc(key)}" rows="${rows}">${esc(s[key]||'')}</textarea>`
    : `<input type="text" class="shot-edit" data-shot="${i}" data-key="${esc(key)}" value="${esc(s[key]||'')}" />`;
  return `<div class="shot">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span class="no">镜 ${esc(s.镜号)}</span>
      <span class="dur">⏱ <input type="number" class="dur-input" data-dur="${i}" value="${esc(s.时长??3)}" min="0.5" max="30" step="0.5"> 秒</span>
      ${wcBadge((s.画面描述||'')+' '+(s.出图提示词||''))}
    </div>
    <div class="meta">
      ${['景别','角度','运镜','光线','转场'].map(k=> s[k]?`<span class="pill">${esc(s[k])}</span>`:'').join('')}
    </div>
    ${s.主体!==undefined && s.主体!=='' ? `<div class="prompt-text" style="margin-top:6px"><b>主体：</b>${ed('主体')}</div>`:''}
    ${s.构图!==undefined && s.构图!=='' ? `<div class="prompt-text" style="margin-top:4px"><b>构图：</b>${ed('构图')}</div>`:''}
    <div class="prompt-text" style="margin-top:6px">${ed('画面描述','textarea',2)}</div>
    ${ s.对白 ? `<div class="sub" style="margin-top:6px">💬 ${ed('对白')}</div>`:'' }
    <div class="subcard" style="margin-top:8px"><div class="lbl">出图提示词<button class="copy" data-copy="${esc(s.出图提示词||'')}">复制</button></div>${ed('出图提示词','textarea',3)}</div>
    ${ s.连续性 ? `<div class="muted" style="margin-top:6px">🔗 连续性：${ed('连续性')}</div>`:'' }
    ${ s.剪辑动机 ? `<div class="muted" style="margin-top:4px">🎯 剪辑动机：${ed('剪辑动机')}</div>`:'' }
    <p class="muted" style="margin:4px 0 0;font-size:11px">字段可直接编辑，失焦即存（不触发 AI）。</p>
  </div>`;
}
function bindShotEdit(){
  $$('[data-shot]').forEach(inp=>{
    inp.onchange = ()=>{
      const s = state.storyboard[+inp.dataset.shot]; if(!s) return;
      s[inp.dataset.key] = inp.value;
      persist();
      toast('分镜已保存');
    };
  });
}
function updateBoardTiming(){
  const groups = {};
  state.storyboard.forEach((s,i)=>{ const k=s.章节||'未分组'; (groups[k]=groups[k]||[]).push(i); });
  Object.keys(groups).forEach(k=>{
    const sec = groups[k].reduce((sum,i)=> sum + (Number(state.storyboard[i].时长)||0), 0);
    const el = $('#chStat-'+k); if(el) el.textContent = `共 ${groups[k].length} 镜 · 总时长 ${sec}s`;
  });
  const totalSec = state.storyboard.reduce((sum,s)=> sum + (Number(s.时长)||0), 0);
  const el = $('#boardTotal'); if(el) el.textContent = `共 ${state.storyboard.length} 镜 · 总时长 ${totalSec}s`;
}

function fallbackRaw(key){
  const raw = state.raw[key];
  if(!raw) return '';
  return `<div class="card"><p class="muted">以下为模型原始返回（解析 JSON 失败时保留）：</p>
    <textarea style="min-height:120px">${esc(raw)}</textarea></div>`;
}

function readyForAssets(){
  return state.outlineConfirmed && state.chapters.some(c=>c.content && c.content.trim());
}


function viewExport(){
  if(isLong()) return longExportView();
  if(!state.outline) return `<div class="center-empty">尚无可导出的内容。请先生成并确认故事大纲。</div>`;
  const md = buildMarkdown();
  return `<div class="card">
    <h3>📦 导出资产包</h3>
    <p class="sub">汇总全书故事、角色、场景与分镜资产，支持一键复制或导出。</p>
    <div class="btn-row">
      <button id="btnCopyAll" class="btn primary">📋 复制全部</button>
    </div>
  </div>
  <div class="card"><textarea id="exportArea" style="min-height:300px">${esc(md)}</textarea></div>`;
}

function longExportView(){
  if(!state.outline) return `<div class="center-empty">尚无可导出的内容。请先生成故事大纲。</div>`;
  const written = state.chapters.filter(c=> c.content && String(c.content).trim()).length;
  state.expSel = state.expSel.filter(i=> state.chapters[i] && state.chapters[i].content && String(state.chapters[i].content).trim());
  const title = state.outline?.title || '未命名长篇小说';
  const md = buildLongMarkdown();
  const CH_PER_GROUP = 10, EXP_GROUP_THRESHOLD = 20;
  const useGroup = state.chapters.length > EXP_GROUP_THRESHOLD;
  if(useGroup && state.expOpenGroups.length === 0){
    const selSet = new Set(state.expSel);
    const ng = Math.ceil(state.chapters.length / CH_PER_GROUP);
    state.expOpenGroups = [];
    for(let g=0; g<ng; g++){
      let has=false;
      for(let i=g*CH_PER_GROUP; i<Math.min(state.chapters.length,(g+1)*CH_PER_GROUP); i++){ if(selSet.has(i)){ has=true; break; } }
      if(has) state.expOpenGroups.push(g);
    }
  }
  const expGroupHTML = ()=>{
    const label = (c,i,ok)=> `<label class="exp-ch ${ok?'':'disabled'}"><input type="checkbox" data-expch="${i}" ${state.expSel.includes(i)?'checked':''} ${ok?'':'disabled'}><span class="exp-ch-no">第${i+1}章</span><span class="exp-ch-title">${esc(c.title||'')}</span><span class="wc">${ok? wcInner(countWords(c.content)) : '未写'}</span></label>`;
    if(!useGroup) return state.chapters.map((c,i)=> label(c,i,!!(c.content&&String(c.content).trim()))).join('');
    const n = state.chapters.length, ng = Math.ceil(n/CH_PER_GROUP);
    let out='';
    for(let g=0; g<ng; g++){
      const s=g*CH_PER_GROUP, e=Math.min(n,(g+1)*CH_PER_GROUP), open=state.expOpenGroups.includes(g);
      let items='';
      for(let i=s;i<e;i++){ const c=state.chapters[i]; items += label(c,i,!!(c.content&&String(c.content).trim())); }
      const selCnt = state.expSel.filter(i=> i>=s && i<e).length;
      out += `<div class="exp-group ${open?'open':''}" data-expgroup="${g}"><div class="exp-group-t" role="button" data-expgroup-t="${g}"><span class="exp-group-ttl">第${s+1}—${e}章</span>${selCnt?`<span class="muted exp-group-sum">已选${selCnt}</span>`:''}<span class="sc-fold-ico">${open?'▾':'▸'}</span></div><div class="exp-group-body">${items}</div></div>`;
    }
    return out;
  };
  return `
    <div class="card">
      <h3>📦 导出资产包 · ${esc(title)}</h3>
      <p class="sub">汇总故事大纲与章节目录，支持一键复制或导出。</p>
      <div class="btn-row">
      <button id="lnCopyAll" class="btn primary">📋 复制全部</button>
<button id="lnExportReader" class="btn ghost">📖 阅读</button>
    </div>
    </div>
    <div class="card"><textarea id="lnExportArea" style="min-height:300px" readonly>${esc(md)}</textarea></div>
    <div class="card">
      <h3>📦 导出成书（选章节 + 三种格式）</h3>
      <p class="sub">选择需要导出的章节与文件格式（TXT / EPUB / DOCX）。</p>
      <div class="btn-row">
        <button id="expSelAll" class="btn ghost">☑️ 全选已写</button>
        <button id="expSelNone" class="btn ghost">⬜ 清空</button>
        <span class="muted" id="expCount">已选 ${state.expSel.length} / 已写 ${written} 章（共 ${state.chapters.length} 章）</span>
      </div>
      <div class="exp-ch-list" data-exp-ch-list>
        ${expGroupHTML()}
      </div>
      <div class="btn-row" style="margin-top:12px">
        <button id="expTxt" class="btn">📄 导出 TXT</button>
        <button id="expEpub" class="btn">📚 导出 EPUB</button>
        <button id="expDocx" class="btn">📝 导出 DOCX</button>
      </div>
      <p id="exportStatus" class="status"></p>
    </div>`;
}

function openExportReader(){
  const ta = $('#lnExportArea');
  if(!ta || !ta.value.trim()){ toast('暂无导出内容'); return; }
  const ov = $('#readerOverlay'); if(!ov) return;
  $('#readerTitle').textContent = `📖 全文阅读 · ${esc(state.outline?.title||'未命名')}`;
  const lines = ta.value.split('\n').map(l=>l.trim());
  let html = '';
  for(const l of lines){
    if(!l) continue;
    if(/^#{1,3}\s/.test(l)) html += `<h3>${esc(l.replace(/^#+\s*/,''))}</h3>`;
    else if(/^第\d+[章节]/.test(l) || /^第[一二三四五六七八九十百千]+[章节]/.test(l)) html += `<h3>${esc(l)}</h3>`;
    else html += `<p>${esc(l)}</p>`;
  }
  $('#readerBody').innerHTML = html || '<p class="muted">（暂无内容）</p>';
  const tocBtn = $('#readerTocBtn'); if(tocBtn) tocBtn.style.display = 'none';
  const synBtn = $('#readerSynBtn'); if(synBtn) synBtn.style.display = 'none';
  const body0 = $('#readerBody');
  if(body0) body0.scrollTop = 0;
  updateReaderProgress();
  randomizeReaderGradient();
  ov.dataset.exportReader = '1';   // 标记为导出阅读模式
  ov.classList.remove('hidden');
  document.body.classList.add('reader-lock');
}

function buildLongMarkdown(){
  const o = state.outline;
  let md = `# ${o?.title||'未命名长篇小说'}\n\n`;
  md += `## 一、故事大纲\n**小说简介**：${o?.logline||''}\n\n`;
  (o?.chapters||[]).forEach((c,i)=>{
    md += `${i+1}. **${cleanChapterTitle(c.title)||''}**\n`;
  });
  return md;
}
function activeChapters(){
  let idx = state.expSel.filter(i=> state.chapters[i] && state.chapters[i].content && String(state.chapters[i].content).trim()).sort((a,b)=>a-b);
  if(!idx.length) idx = state.chapters.map((c,i)=> (c.content && String(c.content).trim())?i:null).filter(x=>x!==null);
  return idx;
}
function syncExpChecks(){
  $$('#view [data-expch]').forEach(cb=> cb.checked = state.expSel.includes(+cb.dataset.expch));
  const cnt = $('#expCount'); if(cnt) cnt.textContent = `已选 ${state.expSel.length} / 已写 ${state.chapters.filter(c=>c.content&&String(c.content).trim()).length} 章（共 ${state.chapters.length} 章）`;
}
function downloadBlob(name, blob){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(()=> URL.revokeObjectURL(a.href), 1000);
}
function expText(){
  const idx = activeChapters(); if(!idx.length){ toast('没有可导出的已写章节'); return; }
  const title = state.outline?.title || '未命名长篇小说';
  let t = `${title}\n${'='.repeat(24)}\n`;
  if(state.outline?.logline) t += `\n${state.outline.logline}\n\n`;
  idx.forEach(i=>{ const c=state.chapters[i]; t += `\n第${i+1}章 ${cleanChapterTitle(c.title)||''}\n\n${String(c.content||'').trim()}\n`; });
  download(`${title}_长篇.txt`, t);
  toast(`已导出 ${idx.length} 章 TXT`);
}
function expEpub(){
  const idx = activeChapters(); if(!idx.length){ toast('没有可导出的已写章节'); return; }
  if(typeof JSZip === 'undefined'){ toast('找不到 JSZip 库'); return; }
  const title = state.outline?.title || '未命名长篇小说';
  const author = '使用者';
  const uid = (crypto && crypto.randomUUID) ? crypto.randomUUID() : ('uuid-'+Date.now()+'-'+Math.random().toString(16).slice(2));
  const modDate = new Date().toISOString();
  const base = 'OEBPS';
  const chapterFiles = idx.map(i=>{
    const c = state.chapters[i];
    const paras = String(c.content||'').split(/\n+/).map(p=>p.trim()).filter(Boolean)
      .map(p=> `<p>${esc(p)}</p>`).join('\n');
    const h1 = `第${i+1}章 ${esc(cleanChapterTitle(c.title)||'')}`;
    const xhtml = `<?xml version="1.0" encoding="utf-8"?>\n`+
      `<!DOCTYPE html>\n`+
      `<html xmlns="http://www.w3.org/1999/xhtml">\n<head>\n  <title>${freeText(h1)}</title>\n  <link rel="stylesheet" type="text/css" href="styles.css"/>\n</head>\n<body>\n  <h1>${h1}</h1>\n${paras}\n</body>\n</html>`;
    return { id:'ch'+(i+1), file:`text/ch${i+1}.xhtml`, title:h1, xhtml };
  });
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', {compression:'STORE'});
  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="utf-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n  <rootfiles>\n    <rootfile full-path="${base}/content.opf" media-type="application/oebps-package+xml"/>\n  </rootfiles>\n</container>`);
  const manifest = chapterFiles.map(f=>`    <item id="${f.id}" href="${f.file}" media-type="application/xhtml+xml"/>`).join('\n');
  const spine = chapterFiles.map(f=>`    <itemref idref="${f.id}"/>`).join('\n');
  zip.file(`${base}/content.opf`, `<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">\n  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n    <dc:identifier id="uid">urn:uuid:${uid}</dc:identifier>\n    <dc:title>${freeText(title)}</dc:title>\n    <dc:language>zh-CN</dc:language>\n    <dc:creator>${freeText(author)}</dc:creator>\n    <meta property="dcterms:modified">${modDate}</meta>\n  </metadata>\n  <manifest>\n    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>\n    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n    <item id="css" href="styles.css" media-type="text/css"/>\n${manifest}\n  </manifest>\n  <spine>\n${spine}\n  </spine>\n</package>`);
  const navLis = chapterFiles.map(f=>`    <li><a href="${f.file}">${freeText(f.title)}</a></li>`).join('\n');
  zip.file(`${base}/nav.xhtml`, `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">\n<head>\n  <meta charset="utf-8"/>\n  <title>${freeText(title)}</title>\n</head>\n<body>\n  <nav epub:type="toc" id="toc">\n    <h1>目录</h1>\n    <ol>\n${navLis}\n    </ol>\n  </nav>\n</body>\n</html>`);
  const ncxPts = chapterFiles.map((f,i)=>`    <navPoint id="${f.id}" playOrder="${i+1}"><navLabel><text>${freeText(f.title)}</text></navLabel><content src="${f.file}"/></navPoint>`).join('\n');
  zip.file(`${base}/toc.ncx`, `<?xml version="1.0" encoding="utf-8"?>\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n  <head><meta name="dtb:uid" content="urn:uuid:${uid}"/></head>\n  <docTitle><text>${freeText(title)}</text></docTitle>\n  <navMap>\n${ncxPts}\n  </navMap>\n</ncx>`);
  zip.file(`${base}/styles.css`, `body{font-family:serif,"PingFang SC","Source Han Serif SC",serif;line-height:1.9;margin:2em;color:#222}\nh1{font-size:1.4em;text-align:center;margin-bottom:1.6em;color:#333}\np{text-indent:2em;margin:0.5em 0}`);
  chapterFiles.forEach(f=> zip.file(`${base}/${f.file}`, f.xhtml));
  const st = $('#exportStatus'); if(st) st.textContent = '正在打包 EPUB…';
  zip.generateAsync({type:'blob', mimeType:'application/epub+zip'}).then(blob=>{
    downloadBlob(`${title}_长篇.epub`, blob);
    if(st) st.textContent = '';
    toast(`已导出 EPUB（${idx.length} 章）`);
  }).catch(()=>{ if(st) st.textContent='打包失败'; toast('EPUB 打包失败'); });
}
function expDocx(){
  const idx = activeChapters(); if(!idx.length){ toast('没有可导出的已写章节'); return; }
  if(typeof JSZip === 'undefined'){ toast('找不到 JSZip 库'); return; }
  const title = state.outline?.title || '未命名长篇小说';
  const xmlEsc = t=> String(t??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const paras = [];
  paras.push(`<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t xml:space="preserve">${xmlEsc(title)}</w:t></w:r></w:p>`);
  if(state.outline?.logline) paras.push(`<w:p><w:r><w:t xml:space="preserve">${xmlEsc(state.outline.logline)}</w:t></w:r></w:p>`);
  idx.forEach(i=>{
    const c = state.chapters[i];
    paras.push(`<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">第${i+1}章 ${xmlEsc(cleanChapterTitle(c.title)||'')}</w:t></w:r></w:p>`);
    String(c.content||'').split(/\n+/).map(p=>p.trim()).filter(Boolean)
      .forEach(p=> paras.push(`<w:p><w:r><w:t xml:space="preserve">${xmlEsc(p)}</w:t></w:r></w:p>`));
  });
  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n  <Default Extension="xml" ContentType="application/xml"/>\n  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n</Relationships>`);
  const body = paras.join('\n');
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr/></w:body></w:document>`);
  const st = $('#exportStatus'); if(st) st.textContent = '正在打包 DOCX…';
  zip.generateAsync({type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}).then(blob=>{
    downloadBlob(`${title}_长篇.docx`, blob);
    if(st) st.textContent = '';
    toast(`已导出 DOCX（${idx.length} 章）`);
  }).catch(()=>{ if(st) st.textContent='打包失败'; toast('DOCX 打包失败'); });
}
function freeText(t){ return String(t??'').replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

function buildMarkdown(){
  const o = state.outline;
  let md = `# 影视前期资产包 · ${o?.title||'未命名'}\n\n> 由「影视前期提示词生成器」生成 · 出图请在即梦用提示词生成\n\n`;
  md += `## 一、故事大纲\n**小说简介**：${o?.logline||''}\n\n`;
  (o?.chapters||[]).forEach((c,i)=>{
    md += `${i+1}. **${cleanChapterTitle(c.title)||''}**\n`;
  });
  if(state.characters.length){
    md += `\n## 三、角色定妆提示词包\n`;
    state.characters.forEach(c=>{
      md += `\n### ${c.name}（${c.role||''}）\n`;
      const pf=c.profile||{}; Object.entries(pf).forEach(([k,v])=> md+=`- **${k}**：${v}\n`);
      const pr=c.prompts||{}; const order=['定妆图','三视图','表情','服饰细节','道具','配色','材质'];
      order.forEach(k=>{ if(pr[k]!=null) md+=`\n**${k}提示词**：\n${pr[k]}\n`; });
    });
  }
  if(state.scenes.length){
    md += `\n## 四、场景提示词（纯环境 · 无人物，供视频 AI 空镜/环境参考）\n`;
    state.scenes.forEach(s=> md += `\n### ${s.name}（${s.作用||''}）\n- 设定：${s.description||''}\n- 即梦提示词（无人物）：${s.prompt||''}\n`);
  }
  if(state.storyboard.length){
    md += `\n## 五、分镜表（按章节，含时长）\n`;
    const groups = {};
    state.storyboard.forEach(s=>{ const k=s.章节||'未分组'; (groups[k]=groups[k]||[]).push(s); });
    const keys = Object.keys(groups).sort((a,b)=>{ const na=+a,nb=+b; return (!isNaN(na)&&!isNaN(nb))?na-nb:String(a).localeCompare(String(b),'zh'); });
    keys.forEach(k=>{
      const list = groups[k];
      const sec = list.reduce((a,s)=> a+(Number(s.时长)||0),0);
      md += `\n### 第${k}章（${list.length} 镜 · 总时长 ${sec}s）\n`;
      list.forEach(s=>{
        md += `\n**镜${s.镜号}**（${s.时长??3}s）｜ ${s.景别||''} ｜ ${s.角度||''} ｜ ${s.运镜||''} ｜ ${s.光线||''}\n`;
        if(s.主体) md += `- 主体：${s.主体}\n`;
        if(s.构图) md += `- 构图：${s.构图}\n`;
        md += `- 画面：${s.画面描述||''}\n`;
        if(s.对白) md += `- 对白：${s.对白}\n`;
        if(s.转场) md += `- 转场：${s.转场}\n`;
        md += `- 出图提示词：${s.出图提示词||''}\n`;
        if(s.连续性) md += `- 连续性：${s.连续性}\n`;
        if(s.剪辑动机) md += `- 剪辑动机：${s.剪辑动机}\n`;
      });
    });
  }
  return md;
}

function bindView(){
  bindCopyBtns();
  bindCharEdit();
  bindShotEdit();

  $$('.cyber-home-grid [data-step]').forEach(b=> b.onclick = ()=>{ if(!guardSwitchStep()) return; currentStep = +b.dataset.step; render(); window.scrollTo(0,0); });

  const idea = $('#ideaInput'); if(idea){
    idea.oninput = ()=>{ state.idea = idea.value; syncOrigIdeaCard(); };
    const _go0 = $('#btnGenOutline'); if(_go0) _go0.onclick = ()=> genOutline();
    const tsTg = $('#teamPick'); if(tsTg){
      tsTg.querySelectorAll('[data-team]').forEach(lb=>{
        lb.onclick = (e)=>{ e.preventDefault(); if(state.teamShape === lb.dataset.team) return; state.teamShape = lb.dataset.team; persist(); render(); toast(`叙事主体已切换为「${currentTeamShape().label}」`); };
      });
    }
  }
  bindPolishIdea();
  const _goB = $('#btnGenOutline'); if(_goB) _goB.onclick = ()=> genOutline();
  const _p2 = $('#polishCards2'); if(_p2) renderPolishCards(_p2);
  $$('[data-gen-outline]').forEach(b=> b.onclick = ()=> genOutline());
  bindDictMaster();
  bindDictEnrich();
  bindLongNovelMemoryRepo();
  bindLongNovelControlDeck();
  $$('[data-rec-fold]').forEach(h=> h.onclick = ()=>{
    const key = h.dataset.recFold;
    state.recipeSet = state.recipeSet || {};
    if(!state.recipeSet.recFold) state.recipeSet.recFold = {};
    state.recipeSet.recFold[key] = !state.recipeSet.recFold[key];
    const body = h.parentNode && h.parentNode.querySelector('.recipe-fold-b');
    if(body) body.hidden = !state.recipeSet.recFold[key];
    const ico = h.querySelector('.rec-fold-ico'); if(ico) ico.textContent = state.recipeSet.recFold[key]?'▾':'▸';
    h.setAttribute('aria-expanded', String(state.recipeSet.recFold[key]));
    persist();
  });
  function bindChapterCountInput(el){
    if(!el) return;
    el.addEventListener('keydown', e=>{ if(e.key==='Enter') el.blur(); });
    el.addEventListener('change', ()=>{
      const v = Math.floor(Number(el.value));
      if(Number.isInteger(v) && v>=1 && v<=200){
        const _o = state.outline;
        const _hasTitle = _o && Array.isArray(_o.chapters) && _o.chapters.some(c=>c && String(c.title||'').trim());
        if(_hasTitle && _o.chapters.length !== v){
          const oldLen = _o.chapters.length;
          const msg = oldLen > v
            ? `全书章节数将由 ${oldLen} 章减少为 ${v} 章：前 ${v} 章已有标题与正文将完整保留，末尾 ${oldLen - v} 章将被裁减。确定继续？`
            : `全书章节数将由 ${oldLen} 章增加为 ${v} 章：原有 ${oldLen} 章标题与正文将完整保留，后续 ${v - oldLen} 章将新增为空白待命。确定继续？`;
          if(!confirm(msg)){
            el.value = state.chapterCount || oldLen;
            return;
          }
          if(v < oldLen){
            _o.chapters = _o.chapters.slice(0, v);
            if(Array.isArray(state.chapters)) state.chapters = state.chapters.slice(0, v);
            if(Array.isArray(_o.chapterPlans)) _o.chapterPlans = _o.chapterPlans.slice(0, v);
          } else {
            while(_o.chapters.length < v){
              _o.chapters.push({ title: '', summary: '' });
            }
            if(!Array.isArray(state.chapters)) state.chapters = [];
            while(state.chapters.length < v){
              state.chapters.push({ title: '', content: '' });
            }
          }
          state.chapterCount = v;
          toast(`全书章节数已平滑调整为 ${v} 章，既有内容已保留`);
        }
        else if(_o && Array.isArray(_o.chapters) && _o.chapters.length>0 && _o.chapters.length !== v){
          const _hasPlans = Array.isArray(_o.chapterPlans) && _o.chapterPlans.some(Boolean);
          if(_hasPlans && !confirm(`规划师已生成过本章锚点/节拍表。章节数改为 ${v} 将按新数量重建章节占位（旧正文将清空重建）。继续？`)){ render(); return; }
          if(_hasPlans){ _o.chapterPlans = new Array(v).fill(null); }
          _o.chapters = Array.from({length:v}, ()=>({title:'', summary:''}));
          state.chapterCount = v;
        } else {
          state.chapterCount = v;
        }
      }
      else { state.chapterCount = null; toast('章节数需为 1-200 的整数'); }
      persist(); render();
    });
  }
  bindChapterCountInput($('#chapterCountIn'));
   bindChapterCountInput($('#totalWordsIn'));
   $$('input[name="bookBeat"]').forEach(r=>{
     r.onchange = ()=>{ state.bookBeat = +r.value; persist(); render(); };
   });
   $$('input[name="openingStrategy"]').forEach(r=>{
     r.onchange = ()=>{ state.openingStrategy = openingStrategyDef(r.value) ? r.value : 'auto'; persist(); render(); };
   });
   bindGlossary();
  bindOrigIdea();
  bindOutlineFold();
  bindLoglineEdit();
  bindAiRecipe();
  bindChapterPlan();
  bindChapterPlanFold();
  bindChapterTitles();// v10.14 章节标题编辑 + 复制绑定
  bindWriteStyle();
  const btnCO = $('#btnConfirmOutline'); if(btnCO) btnCO.onclick = ()=>{ syncChaptersFromOutline(); state.outlineConfirmed=true; persist(); render(); };
  const btnRO = $('#btnReOutline'); if(btnRO) btnRO.onclick = ()=>{ state.outline=null; state.outlineConfirmed=false; state.chapters=[]; persist(); render(); };
  const btnGAShort = $('#btnGenAllChapters'); if(btnGAShort) btnGAShort.onclick = ()=> genManyChapters(state.chapters.length, true);
  bindGenBatchControls();
  bindRangeGen();

  if(isLong()){
    bindBeatSheet();
    bindFactCard();
    bindRollingSummaryCard();
    bindQualityReportCard();
    bindFixQueueCard();
  }

  const tmCur = $('#tmCur'); if(tmCur) tmCur.onclick = ()=>{
    const newName = prompt('修改书名：', currentTitle());
    if(newName == null) return; // 取消
    renameTitle(newName);
  };
  const histPanel_ = $('#tmHist');
  const triBtn = $('#btnTmTri');
  if(triBtn) triBtn.onclick = (e)=>{
    e.stopPropagation();
    const on = triBtn.classList.toggle('on');
    if(histPanel_) histPanel_.classList.toggle('hidden', !on);
  };
  if(histPanel_) histPanel_.onclick = (e)=> e.stopPropagation();
  $$('#tmHist [data-hist-restore]').forEach(b=> b.onclick = (e)=>{
    e.stopPropagation();
    if(!confirm(`将书名恢复为「${b.dataset.histRestore}」？（当前名会记入曾用名）`)) return;
    renameTitle(b.dataset.histRestore);
    histPanel_.classList.add('hidden');
    const tri = $('#btnTmTri'); if(tri) tri.classList.remove('on');
  });
  $$('#tmHist [data-hist-del]').forEach(b=> b.onclick = (e)=>{
    e.stopPropagation();
    if(!confirm('删除该条曾用名记录？')) return;
    state.titleHistory.splice(+b.dataset.histDel, 1);
    persist(); render();
    toast('已删除该记录');
  });
  document.addEventListener('click', (e)=>{
    const pan = $('#tmHist');
    if(pan && !pan.classList.contains('hidden') && !e.target.closest('.title-manager')){
      pan.classList.add('hidden');
      const b = $('#btnTmTri'); if(b) b.classList.remove('on');
    }
  });
  const longJump = $('#longJump'); if(longJump) longJump.onchange = ()=>{ const i=+longJump.value; if(longJump.value!=='') openReader(i); longJump.value=''; }; 
  if(isLong()) renderLongProgress();

  if(currentStep===2){
    const s = $('#charSearch'); if(s){
      s.oninput = ()=>{ charFilters.q = s.value; applyCharFilters(); };
    }
    const g = $('#charGender'); if(g){
      g.onchange = ()=>{ charFilters.gender = g.value; applyCharFilters(); };
    }
    const aMin = $('#ageMin'), aMax = $('#ageMax');
    if(aMin) aMin.oninput = ()=>{ charFilters.ageMin = aMin.value; applyCharFilters(); };
    if(aMax) aMax.oninput = ()=>{ charFilters.ageMax = aMax.value; applyCharFilters(); };
    initCharFilter();
  }
  const btnGC = $('#btnGenChars'); if(btnGC) btnGC.onclick = genCharacters;
  const btnCH = $('#btnCharHist'); if(btnCH) btnCH.onclick = ()=> openAssetHistPanel('characters');
  const btnGS = $('#btnGenScenes'); if(btnGS) btnGS.onclick = genScenes;
  const btnCV = $('#btnGenCover'); if(btnCV) btnCV.onclick = genCover;
  const btnCVH = $('[data-cover-hist]'); if(btnCVH) btnCVH.onclick = ()=> openAssetHistPanel('cover');
  $$('[data-cover-edit]').forEach(ta=>{
    ta.onchange = ()=>{ state.coverPrompt = ta.value; persist(); toast('封面提示词已保存'); };
  });
  $$('[data-cv]').forEach(b=> b.onclick = ()=>{
    const v = b.dataset.cv === 'title';
    if(state.coverWithTitle === v) return;
    state.coverWithTitle = v;
    state.coverPrompt = ''; // 切换模式后旧提示词不再适用，清空待重生成
    persist(); render();
  });
  const btnGB = $('#btnGenBoard'); if(btnGB) btnGB.onclick = genStoryboard;
  const btnBH = $('#btnBoardHist'); if(btnBH) btnBH.onclick = ()=> openAssetHistPanel('storyboard');
  const btnSH = $('#btnSceneHist'); if(btnSH) btnSH.onclick = ()=> openAssetHistPanel('scenes');
  $$('[data-scene-name]').forEach(inp=> inp.onchange = ()=>{ const s=state.scenes[+inp.dataset.sceneName]; if(s){ s.name=inp.value; persist(); } });
  $$('[data-scene-role]').forEach(inp=> inp.onchange = ()=>{ const s=state.scenes[+inp.dataset.sceneRole]; if(s){ s.作用=inp.value; persist(); } });
  $$('[data-scene-desc]').forEach(ta=> ta.onchange = ()=>{ const s=state.scenes[+ta.dataset.sceneDesc]; if(s){ s.description=ta.value; persist(); } });
  $$('[data-scene-prompt]').forEach(ta=> ta.onchange = ()=>{ const s=state.scenes[+ta.dataset.scenePrompt]; if(s){ s.prompt=ta.value; persist(); toast('场景提示词已保存'); } });
  const btnCA = $('#btnCopyAll'); if(btnCA) btnCA.onclick = ()=> copyText(buildMarkdown());
 
  if(isLong()){
    const lnCA = $('#lnCopyAll'); if(lnCA) lnCA.onclick = ()=> copyText(buildLongMarkdown());
const lnER = $('#lnExportReader'); if(lnER) lnER.onclick = openExportReader;
    $$('#view [data-expch]').forEach(cb=> cb.onchange = ()=>{
      const i = +cb.dataset.expch;
      if(cb.checked){ if(!state.expSel.includes(i)) state.expSel.push(i); } else state.expSel = state.expSel.filter(x=>x!==i);
      persist();
      syncExpChecks();
    });
    const selAll = $('#expSelAll'); if(selAll) selAll.onclick = ()=>{ state.expSel = state.chapters.map((c,i)=> (c.content && String(c.content).trim())?i:null).filter(x=>x!==null); persist(); syncExpChecks(); };
    const selNone = $('#expSelNone'); if(selNone) selNone.onclick = ()=>{ state.expSel=[]; persist(); syncExpChecks(); };
    $$('#view [data-expgroup-t]').forEach(t=> t.onclick = ()=>{
      const g = +t.dataset.expgroupT;
      const grp = t.closest('[data-expgroup]');
      const adding = !grp.classList.contains('open');
      grp.classList.toggle('open', adding);
      const ico = t.querySelector('.sc-fold-ico'); if(ico) ico.textContent = adding ? '▾' : '▸';
      if(adding){ if(!state.expOpenGroups.includes(g)) state.expOpenGroups.push(g); }
      else state.expOpenGroups = state.expOpenGroups.filter(x=>x!==g);
      persist();
    });
    const bt = $('#expTxt'); if(bt) bt.onclick = expText;
    const be = $('#expEpub'); if(be) be.onclick = expEpub;
    const bd = $('#expDocx'); if(bd) bd.onclick = expDocx;
  }

  renderChapters();
  const chaptersDelegate = (e)=>{
    const t = e.target.closest('[data-regen],[data-toggle],[data-read],[data-fold],[data-page],[data-ver],[data-undo],[data-ch-sum],[data-ne-resume-ch],[data-ne-partial-adopt],[data-plan-ch]');
    if(!t) return;
    if(t.hasAttribute('data-plan-ch')){ openSchoolPlanReader(+t.dataset.planGi, +t.dataset.planCh + 1); }
    else if(t.hasAttribute('data-ver')){ openChapterVersionPanel(+t.dataset.ver); }
    else if(t.hasAttribute('data-undo')){ undoChapterEdit(+t.dataset.undo); }
    else if(t.hasAttribute('data-regen')){ openChapterRegenPanel(+t.dataset.regen); }
    else if(t.hasAttribute('data-ch-sum')){ openChapterSummaryPanel(+t.dataset.chSum); }
    else if(t.hasAttribute('data-toggle')){ const i=+t.dataset.toggle; state.chapters[i].confirmed=!state.chapters[i].confirmed; persist(); render(); }
    else if(t.hasAttribute('data-read')){ openReader(+t.dataset.read); }
    else if(t.hasAttribute('data-ne-resume-ch')){ const i=+t.dataset.neResumeCh; continueAndFinalizeChapter(i, '继续生成'); }
    else if(t.hasAttribute('data-ne-partial-adopt')){ adoptChapterPartial(+t.dataset.nePartialAdopt); }
    else if(t.hasAttribute('data-fold')){ const i=+t.dataset.fold; const body=t.closest('.ch-card').querySelector('.ch-body'); const ico=t.querySelector('.ch-fold-ico'); const on = body.classList.toggle('folded'); t.setAttribute('aria-expanded', String(!on)); if(ico) ico.textContent = on?'▸':'▾'; }
    else if(t.hasAttribute('data-page')){ chPage = +t.dataset.page; renderChapters(); }
  };
  const cw = $('#chaptersWrap');
  if(cw && !cw.dataset.delegated){
    cw.dataset.delegated = '1';           // 只绑定一次，跨次 render 复用
    cw.addEventListener('click', chaptersDelegate);
    cw.addEventListener('input', (e)=>{
      const ta = e.target.closest('textarea[data-ch]'); if(!ta) return;
      const i = +ta.dataset.ch; state.chapters[i].content = ta.value;
      persist(); updateChapterWc(i, ta.value); updateWcTotal();
    });
    cw.addEventListener('focusin', (e)=>{
      const ta = e.target.closest('textarea[data-ch]'); if(!ta) return;
      const c = state.chapters[+ta.dataset.ch];
      ta._orig = c ? (c.content||'') : '';
    });
    cw.addEventListener('change', (e)=>{
      const ta = e.target.closest('textarea[data-ch]'); if(!ta) return;
      const i = +ta.dataset.ch; const c = state.chapters[i]; if(!c) return;
      const old = (ta._orig !== undefined) ? ta._orig : (c.content||'');
      if(ta.value !== old && String(ta.value||'') !== String(old||'')){
        if(!Array.isArray(c.editHistory)) c.editHistory = [];
        c.editHistory.push(old);
        if(c.editHistory.length > 10) c.editHistory.splice(0, c.editHistory.length - 10);   // 上限10
        persist(); renderChapters(); updateWcTotal();
        toast('已记录编辑快照，可用「↩ 撤销编辑」回退');
      }
    });
  }
  $$('[data-dur]').forEach(inp=> inp.oninput = ()=>{
    const i = +inp.dataset.dur;
    const v = parseFloat(inp.value);
    state.storyboard[i].时长 = isNaN(v)||v<=0 ? 0.5 : Math.min(30, v);
    persist(); updateBoardTiming();
  });
  bindReader();
}


  const api = {
    viewCharacters, charCard, bindCharEdit, charFiltered, applyCharFilters, bindCopyBtns,
    initCharFilter, coverCardHtml, viewScenes, viewStoryboard, shotHtml, bindShotEdit,
    updateBoardTiming, fallbackRaw, readyForAssets, viewExport, longExportView, openExportReader,
    buildLongMarkdown, activeChapters, syncExpChecks, downloadBlob, expText, expEpub, expDocx,
    freeText, buildMarkdown, bindView
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['workspace-assets-export'] = Object.freeze(api);
  return ns['workspace-assets-export'];
}

