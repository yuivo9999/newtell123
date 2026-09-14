/** v41 consolidated module: workspace-assets.js */
// ---- merged source: asset-generation.js ----
const _m0 = (() => {
// Extracted from app-legacy.js; legacy UI/runtime bridge.
const W = globalThis;
const state = W.TellMeRuntime?.state ?? W.state;
const $=W.$, busy=W.busy, toast=W.toast, unwrapAIResult=W.unwrapAIResult, callDeepSeek=W.callDeepSeek, fullStoryText=W.fullStoryText, resolveActiveSpec=W.resolveActiveSpec, parseJson=W.parseJson, persist=W.persist, render=W.render, pushAssetHist=W.pushAssetHist, PROMPTS=W.PROMPTS;
async function genCharacters(){
  const btn = $('#btnGenChars'); busy(btn,true,'生成角色中…');
  try{
    if(state.characters && state.characters.length) pushAssetHist('characters', state.characters);
    const txt = unwrapAIResult(await callDeepSeek(PROMPTS.characterSys, '【完整故事】\n'+fullStoryText(), {temperature: resolveActiveSpec().assetsTemp, taskKey:'assets'}));
    state.raw.characters = txt;
    const j = parseJson(txt);
    state.characters = j.characters || [];
    persist(); render();
    toast('角色提示词已生成');
  }catch(e){
    const p = $('#charStatus'); if(p){ p.className='status err'; p.textContent=e.message; }
  }finally{ busy(btn,false); }
}

async function genScenes(){
  const btn = $('#btnGenScenes'); busy(btn,true,'生成场景中…');
  try{
    if(state.scenes && state.scenes.length) pushAssetHist('scenes', state.scenes);
    const txt = unwrapAIResult(await callDeepSeek(PROMPTS.sceneSys, '【完整故事】\n'+fullStoryText(), {temperature: resolveActiveSpec().assetsTemp, taskKey:'assets'}));
    state.raw.scenes = txt;
    const j = parseJson(txt);
    state.scenes = (j.scenes || []).map(s=>{
      const p = String(s.prompt||'');
      const neg = ['no people','no characters','no humans','无人'];
      if(!neg.some(k=>p.toLowerCase().includes(k))){
        s.prompt = p.replace(/\s*$/,'') + '\n（无人物纯环境：no people, no characters, no humans, empty of figures）';
      }
      return s;
    });
    persist(); render();
    toast('场景提示词已生成');
  }catch(e){
    const p = $('#sceneStatus'); if(p){ p.className='status err'; p.textContent=e.message; }
  }finally{ busy(btn,false); }
}

async function genCover(){
  const btn = $('#btnGenCover'); busy(btn,true,'生成封面提示词…');
  const st = $('#coverStatus'); if(st){ st.className='status'; st.textContent=''; }
  const o = state.outline;
  if(!o){ toast('先生成故事大纲'); busy(btn,false); return; }
  const sys = state.coverWithTitle ? PROMPTS.coverSysTitle : PROMPTS.coverSysClean;
  const user = `小说标题：${o.title}\n小说简介：${o.logline}\n章节：${(o.chapters||[]).map(c=>c.title).join(' / ')}\n\n请为这部小说设计封面图的出图提示词。\n模式：${state.coverWithTitle?'包含书名汉字作为封面主体文字':'纯画面、无任何文字、预留书名留白'}`;
  try{
    if(state.coverPrompt) pushAssetHist('cover', state.coverPrompt);
    const txt = unwrapAIResult(await callDeepSeek(sys, user, {temperature: resolveActiveSpec().assetsTemp, taskKey:'assets'}));
    state.coverPrompt = txt.trim();
    persist(); render();
    toast(state.coverWithTitle?'已生成含书名封面提示词':'已生成纯画面封面提示词');
  }catch(e){
    if(st){ st.className='status err'; st.textContent=e.message; }
    else toast('生成失败：'+e.message);
  }finally{ busy(btn,false); }
}

async function genStoryboard(){
  const btn = $('#btnGenBoard'); busy(btn,true,'生成分镜中…');
  const st = $('#boardStatus');
  try{
    const chars = state.characters.map(c=>`${c.name}(${c.role})：定妆特征-${((c.profile&&c.profile.外貌)||'')}，常服-${((c.profile&&c.profile.常服与配色)||'')}`).join('\n');
    const scenes = state.scenes.map(s=>`${s.name}：${s.description||''}`).join('\n');
    const base = `【角色定妆特征】\n${chars||'（未生成角色）'}\n\n【场景】\n${scenes||'（未生成场景）'}`;
    const shots = [];
    const concepts = [];
    const fails = [];
    for(let i=0;i<state.chapters.length;i++){
      if(st){ st.className='status'; st.textContent = `正在为第 ${i+1}/${state.chapters.length} 章生成分镜…`; }
      const ch = state.chapters[i];
      const oc = (state.outline&&state.outline.chapters&&state.outline.chapters[i])||{};
      const content = ch.content||'';
      const user = `【本章】第${i+1}章 ${ch.title||oc.title||''}\n本章正文：\n${content.slice(0,50000)}${content.length>50000?'…':''}\n\n${base}`;
      try{
        const txt = unwrapAIResult(await callDeepSeek(PROMPTS.storyboardSys, user, {temperature: resolveActiveSpec().assetsTemp, taskKey:'assets'}));
        const j = parseJson(txt);
        (j.shots||[]).forEach(s=>{
          s.章节 = i+1;
          if(s.时长==null) s.时长 = 3;
          shots.push(s);
        });
        concepts.push({视觉概念:j.视觉概念||'', 母题:j.母题||''});
      }catch(e){
        fails.push('第'+(i+1)+'章：'+e.message);
        concepts.push({视觉概念:'', 母题:''});
      }
    }
    if(!shots.length) throw new Error('分镜生成失败：' + fails.join('；'));
    if(state.storyboard && state.storyboard.length) pushAssetHist('storyboard', state.storyboard);
    state.boardConcepts = concepts;
    state.storyboard = shots;
    state.raw.storyboard = '';
    persist(); render();
    toast(fails.length ? `分镜已生成（${fails.length} 章失败）` : '分镜已生成（按章节分组）');
  }catch(e){
    const p = $('#boardStatus'); if(p){ p.className='status err'; p.textContent=e.message; }
  }finally{
    busy(btn,false);
    if(st){ st.className='status'; st.textContent=''; }
  }
}


return Object.freeze({genCharacters, genScenes, genCover, genStoryboard});
})();

// ---- merged source: asset-history.js ----
const _m1 = (() => {
// Extracted from app-legacy.js; legacy UI/runtime bridge.
const W = globalThis;
const state = W.TellMeRuntime?.state ?? W.state;
const $=W.$, esc=W.esc, toast=W.toast, persist=W.persist, render=W.render; const ASSET_LABEL=W.ASSET_LABEL;
function pushAssetHist(kind, data){
  if(data == null) return;
  if(!state.hist) state.hist = { characters:[], scenes:[], cover:[], storyboard:[] };
  const arr = state.hist[kind]; if(!Array.isArray(arr)) return;
  arr.unshift({ data: JSON.parse(JSON.stringify(data)), ts: Date.now() });
  if(arr.length > 10) arr.splice(10);
}

function assetHistCount(kind){ return Array.isArray(state.hist && state.hist[kind]) ? state.hist[kind].length : 0; }

function hasAssetHist(kind){ return assetHistCount(kind) > 0; }

function openAssetHistPanel(kind){
  closeAssetHistPanel();
  const hist = Array.isArray(state.hist && state.hist[kind]) ? state.hist[kind] : [];
  if(!hist.length){ toast('暂无历史版本'); return; }
  const fmtTs = ts=>{ const d=new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const rows = hist.map((h,idx)=>{
    const d = h.data;
    let brief = '';
    if(kind==='characters') brief = (Array.isArray(d)?d.map(x=>x&&x.name).filter(Boolean).join('、'):'');
    else if(kind==='scenes') brief = (Array.isArray(d)?d.map(x=>x&&x.name).filter(Boolean).join('、'):'');
    else if(kind==='cover') brief = String(d||'').slice(0,40);
    else if(kind==='storyboard') brief = `${Array.isArray(d)?d.length:0} 镜`;
    const cnt = Array.isArray(d) ? d.length : 1;
    return `<div class="cv-row">
      <div class="cv-meta" style="flex:1;min-width:0"><div class="cv-time">${fmtTs(h.ts)} · ${cnt} 条</div><div class="cv-t" style="font-size:12px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(brief||'')}</div></div>
      <div class="cv-actions" style="display:flex;gap:6px;flex-shrink:0">
        <button type="button" class="btn ghost cv-b" data-ah-prev="${idx}">预览</button>
        <button type="button" class="btn ghost cv-b" data-ah-restore="${idx}">↩ 恢复</button>
      </div>
    </div>`;
  }).join('');
  const ov = document.createElement('div'); ov.id='ahPanel'; ov.className='gs-overlay';
  ov.innerHTML = `
    <div class="gs-modal">
      <div class="gs-modal-head"><b>🕘 ${ASSET_LABEL[kind]} · 历史版本（${hist.length}/10）</b>
        <button class="gs-x" data-ah-close>✕</button></div>
      <div class="cv-body">
        <div class="cv-row cur"><div class="cv-meta"><span class="cv-time">当前版本</span><span class="cv-wc">${kind==='cover' ? (state.coverPrompt?'有':'空') : (Array.isArray(state[kind==='characters'?'characters':(kind==='scenes'?'scenes':'storyboard')])?state[kind==='characters'?'characters':(kind==='scenes'?'scenes':'storyboard')].length:0)+' 条'}</span></div></div>
        <div class="cv-div">重生成前旧版会自动存入这里；恢复会覆盖当前内容（当前版也先存入历史）。</div>
        ${rows}
        <div class="cv-preview hidden" id="ahPreview">
          <div class="cv-prev-head"><b id="ahPrevTitle">版本预览</b><button class="gs-x" data-ah-prev-close>✕</button></div>
          <div class="cv-pre" id="ahReader"></div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-ah-close]').onclick = closeAssetHistPanel;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeAssetHistPanel(); });
  ov.addEventListener('click', e=>{
    const p = e.target.closest('[data-ah-prev]'); if(!p) return;
    const h = hist[+p.dataset.ahPrev]; if(!h) return;
    const pr=$('#ahPreview'), rd=$('#ahReader'), pt=$('#ahPrevTitle');
    if(pr && rd){
      pt.textContent = '预览 · '+fmtTs(h.ts);
      const d = h.data;
      let txt = '';
      if(kind==='characters') txt = (d||[]).map(x=>`${x.name||''}（${x.role||''}）\n${JSON.stringify(x.profile||{},null,1)}`).join('\n\n');
      else if(kind==='scenes') txt = (d||[]).map(x=>`${x.name||''}（${x.作用||''}）\n${x.description||''}`).join('\n\n');
      else if(kind==='cover') txt = String(d||'');
      else if(kind==='storyboard') txt = (d||[]).map(x=>`镜${x.镜号||''}：${x.画面描述||''}`).join('\n');
      rd.textContent = txt.slice(0,1500) + (txt.length>1500?'\n…':''); 
      pr.classList.remove('hidden');
    }
  });
  ov.querySelector('[data-ah-prev-close]').onclick = ()=>{ const pr=$('#ahPreview'); if(pr) pr.classList.add('hidden'); };
  ov.addEventListener('click', e=>{
    const rb = e.target.closest('[data-ah-restore]'); if(!rb) return;
    const h = hist[+rb.dataset.ahRestore]; if(!h) return;
    if(!window.confirm(`恢复该版${ASSET_LABEL[kind]}将覆盖当前内容（当前版先存入历史）。确定恢复吗？`)) return;
    const curData = kind==='cover' ? (state.coverPrompt||'') : state[kind==='characters'?'characters':(kind==='scenes'?'scenes':'storyboard')];
    pushAssetHist(kind, curData);
    if(kind==='cover') state.coverPrompt = String(h.data||'');
    else state[kind==='characters'?'characters':(kind==='scenes'?'scenes':'storyboard')] = JSON.parse(JSON.stringify(h.data||[]));
    persist(); closeAssetHistPanel(); render();
    toast('已恢复历史版本');
  });
}

function closeAssetHistPanel(){ const p=$('#ahPanel'); if(p) p.remove(); }


return Object.freeze({pushAssetHist, assetHistCount, hasAssetHist, openAssetHistPanel, closeAssetHistPanel});
})();

export const workspace_assetsModules = Object.freeze([_m1, _m0]);
