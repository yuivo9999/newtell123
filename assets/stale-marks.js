/* v1.0.620 A-04：上游改动 → 下游标「可能已过期」（软提示，不改任何成果、不挡任何操作）。
 * 做法：为每份下游成果（老师教案 / 章节正文）记一份「生成时的上游指纹」，之后比对当前上游指纹，不一致就标「⚠ 可能已过期」。
 *   老师教案 上游 = 本组各章校长计划 + 计划里提到的词典条目 + 世界观规则 + 世界运转层文本
 *   章节正文 上游 = 本章校长计划 + 本章教案卡（取不到则用整组教案）+ 词典条目（按计划/教案里出现的名字）+ 世界观规则
 * 基准的建立：成果自身内容变化（重新生成/导入/手改）时，用当时的上游重新盖章；首次看到的成果（旧项目）按「当前即有效」盖章，不报警。
 * 用户可点「仍有效」把基准更新到当前上游（等于「我看过了，没问题」）。与既有硬过期（sc.stale，需重做）并存：硬过期的不再重复显示软标记。
 * 数据：state.staleBasis = { t:{[组]:{art,parts,at}}, c:{[章]:{art,parts,at}} }，随项目保存。 */
(function(){
'use strict';
const LABEL = { plan:'校长计划', dict:'词典条目', rules:'世界观规则', world:'世界运转层', card:'本章教案', teacher:'本组教案' };

function hash(s){
  s = String(s==null?'':s); let h = 0x811c9dc5 >>> 0;
  for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36)+'.'+s.length.toString(36);
}
function ensure(){
  if(!state.staleBasis || typeof state.staleBasis!=='object') state.staleBasis = {t:{},c:{}};
  if(!state.staleBasis.t || typeof state.staleBasis.t!=='object') state.staleBasis.t = {};
  if(!state.staleBasis.c || typeof state.staleBasis.c!=='object') state.staleBasis.c = {};
  return state.staleBasis;
}
function stSanitize(b){
  const out = {t:{},c:{}}; if(!b || typeof b!=='object') return out;
  ['t','c'].forEach(k=>{
    const src = b[k]; if(!src || typeof src!=='object') return;
    Object.keys(src).forEach(id=>{
      const e = src[id]; if(!e || typeof e!=='object' || typeof e.art!=='string') return;
      const parts = {}; if(e.parts && typeof e.parts==='object') Object.keys(e.parts).forEach(p=>{ if(typeof e.parts[p]==='string') parts[p]=e.parts[p].slice(0,40); });
      const dict = {}; if(e.dict && typeof e.dict==='object') Object.keys(e.dict).slice(0,400).forEach(key=>{ if(typeof e.dict[key]==='string') dict[String(key).slice(0,80)] = e.dict[key].slice(0,40); });
      out[k][String(id).slice(0,10)] = { art:e.art.slice(0,40), parts, dict, at:Number(e.at)||0 };
    });
  });
  return out;
}

// ---------- 上游文本 ----------
const GL_KEYS = ['characters','places','propernouns','organizations','institutions','items','terms','events','lifeSettings'];
function planText(n){ try{ const p = state.school && state.school.principal && state.school.principal.plans; return p && p[n] ? JSON.stringify(p[n]) : ''; }catch(e){ return ''; } }
// 返回 {条目键: 条目内容哈希}：只含文本里出现了名字的词典条目（及其关系/地名联系）。
// 比对时只看「基准和当前都有的条目」是否变了——某条目不再被提到属于计划/教案的变化，不算词典变了。
function dictEntriesFor(text){
  const gl = (state.outline && state.outline.glossary) || {}; const txt = String(text||''); const hit = {}; const names = new Set();
  const j = x=>JSON.stringify(x, (key,v)=> (key==='ts'||key==='updatedAt'||key==='_stale') ? undefined : v);
  GL_KEYS.forEach(k=>{ (Array.isArray(gl[k])?gl[k]:[]).forEach(x=>{ const nm = String(x&&x.name||'').trim(); if(nm && txt.includes(nm)){ names.add(nm); hit['n:'+nm] = '1'; hit[k+':'+nm] = hash(j(x)); } }); });
  (Array.isArray(gl._relationshipTable)?gl._relationshipTable:[]).forEach(x=>{ if(x && (names.has(String(x.a||'').trim()) || names.has(String(x.b||'').trim()))) hit['rel:'+String(x.a||'')+'|'+String(x.b||'')] = hash(j(x)); });
  (Array.isArray(gl._placeContacts)?gl._placeContacts:[]).forEach(x=>{ if(x && (names.has(String(x.from||'').trim()) || names.has(String(x.to||'').trim()))) hit['pc:'+String(x.from||'')+'|'+String(x.to||'')] = hash(j(x)); });
  return hit;
}
function rulesText(){ try{ const gl = (state.outline && state.outline.glossary) || {}; return JSON.stringify(gl._worldRules||[]); }catch(e){ return ''; } }
function groupOf(gi){ try{ return teacherAssignmentGroups()[gi] || null; }catch(e){ return null; } }
function teacherRaw(gi){ try{ const t = state.school && state.school.teachers && state.school.teachers[gi]; return t && String(t.raw||'').trim() ? String(t.raw) : ''; }catch(e){ return ''; } }
function chapterCard(gi, n){ // 只读：不触发自动切割
  try{ const t = state.school.teachers[gi]; const c = t && t.chapterCards && t.chapterCards.chapters && t.chapterCards.chapters[n]; return c && c.status==='ready' && String(c.rawText||'').trim() ? String(c.rawText) : ''; }catch(e){ return ''; }
}
function upstreamTeacher(gi){
  const g = groupOf(gi); if(!g) return null;
  const first = Number(g.first||g.startChapter), last = Number(g.last||g.endChapter);
  let plans = ''; for(let n=first;n<=last;n++) plans += n+':'+planText(n)+'\n';
  const parts = { plan:hash(plans), rules:hash(rulesText()) };
  try{ parts.world = hash(state.worldEngine && state.worldEngine.raw || ''); }catch(e){ parts.world = hash(''); }
  return { parts, dict:dictEntriesFor(plans) };
}
function upstreamChapter(i){
  const gi = (function(){ try{ return chapterOfPlan(i); }catch(e){ return -1; } })();
  const n = i+1; const plan = planText(n);
  const card = gi>=0 ? chapterCard(gi,n) : '';
  const parts = { plan:hash(plan), rules:hash(rulesText()) };
  if(card) parts.card = hash(card); else if(gi>=0) parts.teacher = hash(teacherRaw(gi));
  // 词典条目只按「本章计划 + 本章教案卡」里出现的名字取；没有教案卡时只看计划（不用整组教案，避免误报）
  return { parts, dict:dictEntriesFor(plan+'\n'+card) };
}

// ---------- 同步（盖章）与比对 ----------
function artifactOf(kind, id){
  if(kind==='t') return teacherRaw(id);
  const c = state.chapters && state.chapters[id]; return c && String(c.content||'').trim() ? String(c.content) : '';
}
function upstreamOf(kind, id){ return kind==='t' ? upstreamTeacher(id) : upstreamChapter(id); }
function stSync(){
  const b = ensure(); let changed = false;
  const stampKind = (kind, ids)=>{
    const book = b[kind]; const alive = new Set();
    ids.forEach(id=>{
      const art = artifactOf(kind,id); if(!art) return; alive.add(String(id));
      const h = hash(art); const e = book[id];
      if(!e || e.art!==h){ const up = upstreamOf(kind,id); if(!up) return; book[id] = {art:h, parts:up.parts, dict:up.dict, at:Date.now()}; changed = true; }
    });
    Object.keys(book).forEach(id=>{ if(!alive.has(id)){ delete book[id]; changed = true; } });
  };
  let gcount = 0; try{ gcount = teacherAssignmentGroups().length; }catch(e){}
  stampKind('t', Array.from({length:gcount},(_,i)=>i));
  stampKind('c', Array.from({length:(state.chapters||[]).length},(_,i)=>i));
  return changed;
}
// 词典是否变了：普通条目只比「基准与当前都出现」的；关系/地名联系只要两端名字基准与当前都出现，新增/删除/改动都算。
function dictChanged(bd, cur){
  const isRel = k=>k.indexOf('rel:')===0 || k.indexOf('pc:')===0;
  const ends = k=>k.slice(k.indexOf(':')+1).split('|');
  const both = k=> ends(k).some(x=> bd['n:'+x]!==undefined && cur['n:'+x]!==undefined);
  const keys = new Set(Object.keys(bd).concat(Object.keys(cur)));
  for(const k of keys){
    if(k.indexOf('n:')===0) continue;
    if(isRel(k)){ if(both(k) && bd[k]!==cur[k]) return true; }
    else if(bd[k]!==undefined && cur[k]!==undefined && bd[k]!==cur[k]) return true;
  }
  return false;
}
function stStatus(kind, id){
  const none = {stale:false, reasons:[]};
  try{
    if(kind==='t' && state.school && state.school.stale && state.school.stale['t'+id]) return none;   // 已是硬过期，不重复标
    const e = ensure()[kind][id]; if(!e) return none;
    if(!artifactOf(kind,id)) return none;
    if(hash(artifactOf(kind,id))!==e.art) return none;   // 成果自己刚变过，等下一次同步盖章
    const up = upstreamOf(kind,id); if(!up) return none;
    const reasons = [];
    Object.keys(up.parts).forEach(p=>{ if(e.parts[p]!==undefined && e.parts[p]!==up.parts[p]) reasons.push(p); });
    if(dictChanged(e.dict||{}, up.dict)) reasons.splice(1,0,'dict');
    return {stale:reasons.length>0, reasons};
  }catch(err){ return none; }
}
function stReasonText(reasons){ return reasons.map(r=>LABEL[r]||r).join('、'); }
function stBadgeHtml(kind, id){
  const s = stStatus(kind, id); if(!s.stale) return '';
  const why = stReasonText(s.reasons);
  const what = kind==='t' ? '本组教案' : '本章正文';
  return `<span class="st-chip" data-st-chip="${kind}:${id}" title="${what}生成之后，上游「${why}」有改动，内容可能已不匹配。不影响使用；觉得没问题就点「仍有效」，需要就重新生成。">⚠ 可能已过期（${why}已改）<button type="button" class="st-ok" data-st-ok="${kind}:${id}">仍有效</button></span>`;
}
function stSlotHtml(kind, id){ return `<span class="st-slot" data-st-slot="${kind}:${id}">${stBadgeHtml(kind,id)}</span>`; }
function stDismiss(kind, id){
  const e = ensure()[kind][id]; const up = upstreamOf(kind,id); if(!e || !up) return false;
  e.parts = up.parts; e.dict = up.dict; e.at = Date.now(); return true;
}
function stCounts(){
  let t = 0, c = 0;
  try{ const gn = teacherAssignmentGroups().length; for(let i=0;i<gn;i++) if(stStatus('t',i).stale) t++; }catch(e){}
  try{ (state.chapters||[]).forEach((_,i)=>{ if(stStatus('c',i).stale) c++; }); }catch(e){}
  return {teachers:t, chapters:c};
}
function stStageTag(key){
  const n = stCounts(); const k = key==='plan' ? n.teachers : (key==='write' ? n.chapters : 0);
  if(!k) return '';
  return `<span class="st-chip st-mini" title="${key==='plan'?'有老师教案':'有章节正文'}在生成之后上游被改动过，可能已过期（不影响使用）">⚠ ${k} 项可能过期</span>`;
}
function stRefreshUi(){
  if(typeof document==='undefined') return;
  document.querySelectorAll('[data-st-slot]').forEach(el=>{ const [k,id] = String(el.dataset.stSlot).split(':'); const h = stBadgeHtml(k, Number(id)); if(el.innerHTML!==h) el.innerHTML = h; });
  document.querySelectorAll('[data-st-stage]').forEach(el=>{ const h = stStageTag(el.dataset.stStage); if(el.innerHTML!==h) el.innerHTML = h; });
}

// ---------- 调度：persist 后去抖同步；有变化再存一次 ----------
let _timer = null;
function stSchedule(){
  if(_timer) clearTimeout(_timer);
  _timer = setTimeout(()=>{ _timer = null; let ch = false; try{ ch = stSync(); }catch(e){ console.warn('[stale-marks]',e); } if(ch && typeof persist==='function') persist(); try{ stRefreshUi(); }catch(e){} }, 700);
}

if(typeof document!=='undefined'){
  document.addEventListener('click', e=>{
    const b = e.target.closest && e.target.closest('[data-st-ok]'); if(!b) return;
    e.preventDefault(); e.stopPropagation();
    const [k,id] = String(b.dataset.stOk).split(':');
    if(stDismiss(k, Number(id))){ if(typeof persist==='function') persist(); stRefreshUi(); if(typeof toast==='function') toast('已标记为仍有效'); }
  }, true);
}

Object.assign(window, { stSync, stStatus, stBadgeHtml, stSlotHtml, stDismiss, stCounts, stStageTag, stRefreshUi, stSchedule, stSanitize, stHash:hash });
})();
