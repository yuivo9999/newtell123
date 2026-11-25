/* v1.0.621 A-05：Agent 可「提议」重新生成某环节（只两种：某章正文 / 某组老师教案）。
 * 铁律：Agent 只能提出；执行必须作者本人（isTrusted）连点两道门——
 *   第 1 道：操作卡上的「查看影响并生成…」；第 2 道：独立确认弹窗，列出「会覆盖什么 / 预计 AI 调用次数 / 下游影响 / 如何撤销」，
 *   勾选「我知道会消耗额度并覆盖」后「确认覆盖并生成」才可点。模型无法代点，也不会拿到生成结果再自行连锁生成。
 * 撤销：章节正文——旧正文已在历史版本里，按指纹找回；老师教案——执行前整份备份到 state.agent.backups（最近 3 次），撤销前核对「后来没被改过」。
 * 本文件在 app.js 之后加载；app.js 里的钩子都以 typeof arXxx==='function' 保护。 */
(function(){
'use strict';

const BACKUP_MAX = 3;
const BACKUP_JSON_MAX = 600000;
const REGEN_TYPES = { regen_chapter:'重新生成本章正文', regen_teacher:'重新生成本组老师教案' };

function hash(s){ s = String(s == null ? '' : s); let h = 5381; for(let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + ':' + s.length; }
function isRegenType(t){ return !!REGEN_TYPES[t]; }
function wc(s){ return String(s || '').replace(/\s+/g, '').length; }
function groupOfChapter(n){
  const groups = teacherAssignmentGroups();
  const gi = groups.findIndex(x => n >= Number(x.first || 1) && n <= Number(x.last || 0));
  return gi < 0 ? null : { gi, g: groups[gi] };
}
function backups(){ const A = agentState(); if(!A.backups || typeof A.backups !== 'object') A.backups = {}; return A.backups; }
function trimBackups(){
  const B = backups(), ids = Object.keys(B).sort((a, b) => (B[b].ts || 0) - (B[a].ts || 0));
  ids.slice(BACKUP_MAX).forEach(id => { delete B[id]; });
}

/* ---------------------------------------------------------------- 计划：把「会发生什么」算清楚（卡片与弹窗共用，纯读取） */
function arPlan(op){
  const a = (op && op.args) || {}, n = Math.floor(Number(a.chapter) || 0), total = (state.chapters || []).length;
  const bad = msg => ({ ok:false, msg });
  if(!state.outline) return bad('当前没有小说数据');
  if(n < 1 || n > total) return bad(`没有第${n}章（全书 ${total} 章）`);
  const grp = groupOfChapter(n);
  if(op.type === 'regen_chapter'){
    const c = state.chapters[n - 1], has = !!String(c && c.content || '').trim();
    let raw = ''; try{ raw = getCurrentChapterTeacherRawText(n - 1); }catch(e){}
    if(!raw) return bad(`第${n}章还没有可用的本章教案，不能生成正文（请先备课）`);
    return {
      ok:true, kind:'chapter', chapter:n, label:`第${n}章正文`,
      overwrite: has ? `第${n}章现有正文约 ${wc(c.content)} 字将被新版本替换（旧版自动存入历史版本）` : `第${n}章目前没有正文，不覆盖任何内容`,
      overwritesSomething: has,
      calls: '约 2 次 AI 调用（正文 1 次 + 章末状态结算 1 次）；遇到检查不通过时系统可能自动修复/重试，实际可能更多',
      downstream: `只重写这一章；后续章节不会自动更新。若本章结算（时间、地点、持有物等）变了，后面的章节可能需要检查`,
      undo: '可撤销：点「撤销」恢复旧正文（新版本也会留在历史版本里）'
    };
  }
  if(op.type === 'regen_teacher'){
    if(!grp) return bad(`找不到第${n}章所属的老师组`);
    if(typeof scDone === 'function' && !scDone('dictEnrich')) return bad('老师备课需要先完成「词典充实」');
    if(typeof scDone === 'function' && !scDone('principal')) return bad('老师备课需要先生成校长');
    const g = grp.g, gi = grp.gi, cnt = Number(g.last) - Number(g.first) + 1;
    const t = (typeof teacherCurrentResult === 'function') ? teacherCurrentResult(gi) : null;
    let parts = 0; try{ parts = (typeof tbIsBatched === 'function' && tbIsBatched(g)) ? tbParts(g).length : 0; }catch(e){}
    let written = 0; for(let k = Number(g.first); k <= Number(g.last); k++){ const c = state.chapters[k - 1]; if(c && String(c.content || '').trim()) written++; }
    const edited = !!(t && t.chapterCards && t.chapterCards.chapters && Object.values(t.chapterCards.chapters).some(c => c && c.manualEditedAt));
    return {
      ok:true, kind:'teacher', chapter:n, gi, label:`老师${gi + 1}（第${g.first}–${g.last}章）教案`,
      overwrite: t ? `老师${gi + 1} 现有教案约 ${wc(t.raw)} 字（含切好的单章教案）将整体替换${edited ? '；其中包含你或助手手动改过的单章教案，这些修改也会丢失（可撤销找回）' : ''}` : `老师${gi + 1}目前没有教案，不覆盖任何内容`,
      overwritesSomething: !!t,
      calls: parts ? `分批备课：1 次总纲 + ${parts} 次分批，共约 ${parts + 1} 次 AI 调用；质量检查不过可能再重试，实际可能更多` : `约 1 次 AI 调用（教案很长）；质量检查不过会自动重试最多 1 次`,
      downstream: `这组共 ${cnt} 章，其中已写正文 ${written} 章；正文不会被改动，但会被标「本组教案已改」，需要的话你再逐章重写`,
      undo: '可撤销：执行前已整份备份老师教案（保留最近 3 次备份），撤销前会核对教案之后没被再改过'
    };
  }
  return bad('不支持的操作类型');
}

/* ---------------------------------------------------------------- 第 2 道门：独立确认弹窗 */
function arConfirm(plan){
  return new Promise(resolve => {
    const ov = document.createElement('div'); ov.className = 'gs-overlay ar-confirm';
    ov.innerHTML = `<div class="gs-modal" style="max-width:560px;max-height:86vh;display:flex;flex-direction:column">
      <div class="gs-modal-head" style="display:flex;justify-content:space-between;align-items:center"><b>⚠️ 确认：${esc(plan.label)} 重新生成</b><button class="gs-x" data-ar-no>✕</button></div>
      <div style="padding:8px 16px 14px;overflow:auto;font-size:14px;line-height:1.7">
        <div><b>会覆盖：</b>${esc(plan.overwrite)}</div>
        <div><b>会花额度：</b>${esc(plan.calls)}</div>
        <div><b>下游影响：</b>${esc(plan.downstream)}</div>
        <div><b>撤销：</b>${esc(plan.undo)}</div>
        <label style="display:flex;gap:8px;align-items:flex-start;margin:12px 0 6px"><input type="checkbox" data-ar-ack style="margin-top:4px"><span>我知道这会消耗额度${plan.overwritesSomething ? '并覆盖现有内容' : ''}</span></label>
        <div class="op-actions" style="display:flex;gap:8px;margin-top:8px"><button type="button" class="btn primary" data-ar-yes disabled>确认覆盖并生成</button><button type="button" class="btn ghost" data-ar-no2>取消</button></div>
      </div></div>`;
    document.body.appendChild(ov);
    const yes = ov.querySelector('[data-ar-yes]'), ack = ov.querySelector('[data-ar-ack]');
    const done = v => { ov.remove(); resolve(v); };
    ack.onchange = () => { yes.disabled = !ack.checked; };
    yes.onclick = e => { if(!e.isTrusted || !ack.checked) return; done(true); };     // 只认作者真实点击
    ov.querySelector('[data-ar-no]').onclick = () => done(false);
    ov.querySelector('[data-ar-no2]').onclick = () => done(false);
    ov.addEventListener('click', e => { if(e.target === ov) done(false); });
  });
}

/* ---------------------------------------------------------------- 执行 */
let _running = false;
function arIsRunning(){ return _running; }
function runBar(label){
  const bar = document.createElement('div'); bar.className = 'btn-row ar-bar';
  bar.style.cssText = 'position:fixed;left:8px;right:8px;bottom:70px;z-index:9999;display:flex;gap:8px;align-items:center;justify-content:center;padding:8px;background:var(--card,#fff);border:1px solid var(--line,#ccc);border-radius:10px';
  const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost small'; b.setAttribute('data-read', '-1'); b.textContent = label;
  bar.appendChild(b); document.body.appendChild(bar);
  return { bar, btn:b };
}

/* 返回 {ok, msg, undo, note}；调用前必须已通过两道门 */
async function arExecute(op){
  const plan = arPlan(op); if(!plan.ok) return { ok:false, msg:plan.msg };
  if(typeof genBusy === 'function' && genBusy()) return { ok:false, msg:'后台有生成任务在运行，请等它结束后再同意' };
  if(_running) return { ok:false, msg:'已有一个重新生成在进行中' };
  _running = true;
  const { bar, btn } = runBar('准备中…');
  try{
    if(plan.kind === 'chapter'){
      const i = plan.chapter - 1, prev = String(state.chapters[i].content || ''), prevHash = hash(prev);
      try{ chState[i] = 'generating'; }catch(e){}
      await genOneChapter(i, btn);
      const now = String(state.chapters[i].content || ''), failed = (typeof chState !== 'undefined' && chState[i] === 'error');
      if(now === prev) return { ok:false, msg: failed ? '生成没有完成（原因见提示），原正文没有改动' : '生成后内容与原来相同，没有改动' };
      const undo = { type:'regen_chapter', chapter:plan.chapter, prevHash, prevHas:!!prev.trim(), nowHash:hash(now) };
      return { ok:true, undo, note: failed ? '新正文已写入，但章末检查未完全通过（见提示）；可撤销' : '' };
    }
    if(plan.kind === 'teacher'){
      const gi = plan.gi, sc = scState();
      const before = sc.teachers && sc.teachers[gi] ? JSON.parse(JSON.stringify(sc.teachers[gi])) : null;
      const wasDone = scDone('t' + gi), prevHash = hash(before && before.raw || '');
      let size = 0; try{ size = JSON.stringify(before).length; }catch(e){}
      const B = backups();
      if(size <= BACKUP_JSON_MAX){ B[op.id] = { kind:'teacher', gi, t:before, wasDone, ts:Date.now() }; trimBackups(); }
      const ok = await genTeacher(btn, gi);
      const cur = teacherCurrentResult(gi), nowRaw = cur ? String(cur.raw || '') : '';
      if(!ok || !nowRaw || hash(nowRaw) === prevHash){
        delete B[op.id];
        return { ok:false, msg: ok ? '生成后教案与原来相同，没有改动' : '老师备课没有完成（原因见提示）。已有内容的处理以备课提示为准，请检查老师卡' };
      }
      const undo = { type:'regen_teacher', gi, chapter:plan.chapter, hasBackup: !!B[op.id], nowHash:hash(nowRaw) };
      return { ok:true, undo, note: B[op.id] ? '' : '教案太大，未做备份，不能撤销' };
    }
    return { ok:false, msg:'不支持的操作类型' };
  }catch(e){
    return { ok:false, msg:'重新生成出错：' + String(e && e.message || e).slice(0, 100) };
  }finally{
    _running = false; try{ bar.remove(); }catch(e){}
    try{ persist(); }catch(e){}
  }
}

/* 作者点「查看影响并生成…」后的完整流程：第 2 道门 → 执行。返回 {ok,msg,undo,note,cancelled} */
async function arApprove(op){
  const plan = arPlan(op); if(!plan.ok) return { ok:false, msg:plan.msg };
  if(typeof genBusy === 'function' && genBusy()) return { ok:false, msg:'后台有生成任务在运行，请等它结束后再同意' };
  const yes = await arConfirm(plan);
  if(!yes) return { ok:false, cancelled:true, msg:'已取消' };
  return arExecute(op);
}

/* ---------------------------------------------------------------- 撤销 */
function arUndo(u){
  if(typeof genBusy === 'function' && genBusy()) return { ok:false, msg:'后台有生成任务在运行，请稍后再撤销' };
  try{
    if(u.type === 'regen_chapter'){
      const i = u.chapter - 1, c = state.chapters && state.chapters[i]; if(!c) return { ok:false, msg:'这一章已不存在' };
      if(hash(c.content) !== u.nowHash) return { ok:false, msg:'这一章后来又被改过，不能直接撤销（避免覆盖你的改动）' };
      let old = null;
      if(!u.prevHas) old = { content:'' };
      else { const h = Array.isArray(c.history) ? c.history : []; for(let k = h.length - 1; k >= 0; k--){ if(hash(h[k].content) === u.prevHash){ old = h[k]; break; } } }
      if(!old) return { ok:false, msg:'历史版本里找不到旧正文（可能已被清理），请到「历史版本」手动恢复' };
      try{ snapshotChapterVersion(i); }catch(e){}
      c.content = String(old.content || ''); try{ updateChapterEndingRelay(i, c.content); }catch(e){} persist();
      return { ok:true };
    }
    if(u.type === 'regen_teacher'){
      const sc = scState(), cur = sc.teachers && sc.teachers[u.gi];
      if(!cur || hash(cur.raw) !== u.nowHash) return { ok:false, msg:'老师教案后来又被改过，不能直接撤销（避免覆盖你的改动）' };
      const B = backups(); let bk = null; for(const id in B){ const b = B[id]; if(b && b.kind === 'teacher' && b.gi === u.gi && hash(b.t && b.t.raw || '') !== u.nowHash){ if(!bk || (b.ts || 0) > (bk.ts || 0)) bk = b; } }
      if(!bk || !u.hasBackup) return { ok:false, msg:'旧教案的备份已被清理（只保留最近 3 次），不能撤销' };
      if(!bk.t){ sc.teachers[u.gi] = null; } else { sc.teachers[u.gi] = JSON.parse(JSON.stringify(bk.t)); }
      try{ if(bk.wasDone) scMark('t' + u.gi, true, false); }catch(e){}
      persist(); try{ refreshTeacherUi(u.gi); }catch(e){}
      return { ok:true };
    }
  }catch(e){ return { ok:false, msg:'撤销出错：' + String(e && e.message || e).slice(0, 100) }; }
  return { ok:false, msg:'无法撤销' };
}

/* 保存时的清洗：只保留最近 BACKUP_MAX 份且体量合规的备份 */
function arSanitizeBackups(b){
  const out = {}; if(!b || typeof b !== 'object') return out;
  Object.keys(b).forEach(id => {
    const x = b[id]; if(!x || x.kind !== 'teacher') return;
    let s = 0; try{ s = JSON.stringify(x).length; }catch(e){ return; }
    if(s > BACKUP_JSON_MAX) return;
    out[String(id).slice(0, 60)] = { kind:'teacher', gi:Math.max(0, Math.floor(Number(x.gi) || 0)), t:(x.t && typeof x.t === 'object') ? x.t : null, wasDone:!!x.wasDone, ts:Number(x.ts) || 0 };
  });
  const ids = Object.keys(out).sort((a, b) => out[b].ts - out[a].ts);
  ids.slice(BACKUP_MAX).forEach(id => { delete out[id]; });
  return out;
}

Object.assign(window, { arPlan, arConfirm, arExecute, arApprove, arUndo, arIsRunning, arSanitizeBackups, arIsRegenType:isRegenType, AR_REGEN_TYPES:REGEN_TYPES });
})();
