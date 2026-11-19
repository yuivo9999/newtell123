/* ================================================================
 * teacher-batch.js · v1.0.593 · 老师分批备课（章节多的老师组）
 *
 * 问题：一个老师组 8–10 章时，AI 一次要输出「七区总教案」，实测会严重缩水（10 章仅 1.5 万字、
 *      每章缺少「中段施工/动态推进/章末设计/创作边界」）；100 章时每组都是这样。
 * 做法（方案 A）：章数 > 每批上限（默认 4 章，state.school.teacherBatchSize 可改）的老师组改为：
 *      ① 总纲：只输出一至六区（GLOBAL / 世界观规则 / HYBRID·CHAPTER 索引与执行规则），一次；
 *      ② 分批：每批 ≤4 章，只输出第七区的正式章节教案；批次注入带上已定稿的总纲与上一批章末承接。
 *      系统把「总纲 + 各批」按原顺序拼合成 t.raw（与旧版整组教案格式完全一致），
 *      因此切割教案、读教案、风格分层校验、下一组交接卡、正文注入都不用改。
 * 章数 ≤ 上限的老师组完全沿用旧流程（整组一次输出，注入文本与旧版一致）。
 * 手动流程：「📦 注入导出」里选总纲/某一批 → 外部 AI → 「📥 导入分段成果」选同一段粘贴保存。
 * 状态存于 sc.teachers[gi].batched = { size, stage1:{raw,ts}, parts:{ 'a-b':{raw,ts} }, manual }。
 * 依赖 app.js 的全局函数，必须在 app.js 之后加载。
 * ================================================================ */
const TB_DEFAULT_SIZE = 4;
const TB_SEVEN = '【七、正式章节教案】';
const TB_CHAPTER_SECTIONS = ['本章章头承接', '本章中段施工', '本章章末设计', '本章创作边界'];

function tbBatchSize(){
  const v = Number(state && state.school && state.school.teacherBatchSize);
  return Number.isInteger(v) && v >= 1 && v <= 12 ? v : TB_DEFAULT_SIZE;
}
function tbIsBatched(g){
  const n = Number(g && g.last) - Number(g && g.first) + 1;
  return Number.isFinite(n) && n > tbBatchSize();
}
/* 均衡切分：10 章、上限 4 → 4/3/3，而不是 4/4/2 */
function tbParts(g){
  const first = Number(g.first), last = Number(g.last), n = last - first + 1, size = tbBatchSize();
  const k = Math.ceil(n / size), base = Math.floor(n / k), extra = n % k, out = [];
  let a = first;
  for(let i = 0; i < k; i++){ const len = base + (i < extra ? 1 : 0); out.push({ from: a, to: a + len - 1, key: `${a}-${a + len - 1}` }); a += len; }
  return out;
}
function tbTeacher(gi, create){
  const sc = scState(); if(!Array.isArray(sc.teachers)) sc.teachers = [];
  let t = sc.teachers[gi];
  if(!t && create){ t = sc.teachers[gi] = {}; }
  return t || null;
}
function tbBatched(gi, create){
  const t = tbTeacher(gi, create); if(!t) return null;
  if(create && (!t.batched || typeof t.batched !== 'object')) t.batched = { size: tbBatchSize(), stage1: null, parts: {}, manual: false };
  return t.batched && typeof t.batched === 'object' ? t.batched : null;
}
function tbStatus(gi, g){
  const b = tbBatched(gi, false) || { stage1: null, parts: {} };
  const rows = [{ key: 'plan', label: '总纲', done: !!(b.stage1 && b.stage1.raw) }];
  tbParts(g).forEach(p => rows.push({ key: p.key, label: `第${p.from}-${p.to}章`, done: !!(b.parts && b.parts[p.key] && b.parts[p.key].raw) }));
  return rows;
}
function tbComplete(gi, g){ return tbStatus(gi, g).every(r => r.done); }

/* ---------------------------------------------------------------- 文本校验 */
function tbNormalizePlan(text){
  let s = String(text || '').trim();
  const at = s.indexOf('【七、');
  if(at >= 0) s = s.slice(0, at).trim();   // 总纲只保留一至六区
  const missing = ['一、', '二、', '三、', '四、', '五、', '六、'].filter(k => !s.includes('【' + k));
  if(missing.length) return { ok: false, error: `总纲缺少区：${missing.map(k => '【' + k + '…】').join('、')}（总纲必须包含一至六区）` };
  return { ok: true, text: s };
}
function tbNormalizeBatch(text, from, to){
  let s = String(text || '').trim();
  s = s.replace(/^[ \t]*【七、正式章节教案】[ \t]*\n?/m, '').trim();
  const missing = [];
  for(let n = from; n <= to; n++){ if(!teacherRawChapterBlock(s, n)) missing.push(n); }
  if(missing.length) return { ok: false, error: `缺少章节教案：${missing.map(n => '第' + n + '章').join('、')}（本批必须完整输出第${from}-${to}章，每章以“第N章”标题行开头）` };
  const warns = [];
  for(let n = from; n <= to; n++){
    const block = teacherRawChapterBlock(s, n);
    const lack = TB_CHAPTER_SECTIONS.filter(k => !block.includes('【' + k + '】'));
    if(lack.length) warns.push(`第${n}章缺少【${lack.join('】【')}】`);
  }
  return { ok: true, text: s, warns };
}

/* ---------------------------------------------------------------- 拼合 */
function tbAssemble(gi, g){
  const t = tbTeacher(gi, false), b = t && t.batched; if(!t || !b || !b.stage1 || !b.stage1.raw) return false;
  const texts = tbParts(g).map(p => (b.parts[p.key] && b.parts[p.key].raw) || '').filter(Boolean);
  const raw = [String(b.stage1.raw).trim(), TB_SEVEN, ...texts].join('\n\n').trim();
  t.raw = raw; t.originalRaw = raw; b.manual = false;
  t.gi = gi; t.teacherCode = t.teacherCode || g.teacherCode || teacherCodeForIndex(gi); t.teacherGroupId = g.teacherGroupId;
  t.ts = t.ts || Date.now(); t.updatedAt = Date.now();
  /* app.js 的 scTeacherGroupComplete 以 parseStatus==='raw-only' 判定「已备」：分段没齐时必须不是 raw-only，否则总纲一存好就被当成整组完成 */
  t.parseStatus = tbComplete(gi, g) ? 'raw-only' : 'batch-partial';
  try{ markTeacherChapterCardsStale(t); }catch(_e){}
  return true;
}
/* 上一批最后一章的「章末设计」，供本批第一章承接 */
function tbBatchHandoff(gi, g, from){
  const t = tbTeacher(gi, false); const prevN = from - 1;
  const rows = ['【上一批实际完成的施工状态｜本批第一章以此承接】'];
  const sec = t && t.raw ? teacherRawSection(teacherRawChapterBlock(t.raw, prevN), '本章章末设计', 1200) : '';
  rows.push(sec
    ? `上一章（第${prevN}章）教案里实际设计的章末（本批第${from}章以此承接；不要用同一种收束方式重复）：\n${sec}`
    : `上一批（到第${prevN}章）的教案尚未导入或未能提取章末设计；本批第${from}章只能依据校长战略里的上一章结尾信息承接。`);
  return rows.join('\n');
}

/* ---------------------------------------------------------------- 注入 */
function tbInjectionFor(gi, g, partKey){
  if(partKey === 'plan') return buildTeacherInjection(g, gi, { part: 'plan' });
  const p = tbParts(g).find(x => x.key === partKey); if(!p) return null;
  const b = tbBatched(gi, false);
  if(!b || !b.stage1 || !b.stage1.raw) return { error: '请先完成并导入【总纲】的成果：分批注入需要引用已定稿的总纲（一至六区）。' };
  return buildTeacherInjection(g, gi, { part: 'batch', from: p.from, to: p.to, zoneText: b.stage1.raw, handoffText: tbBatchHandoff(gi, g, p.from) });
}
function tbEnsureStyle(){
  if(document.getElementById('tbStyle')) return;
  const st = document.createElement('style'); st.id = 'tbStyle';
  st.textContent = '.tb-modal{width:min(920px,92vw)!important;height:min(760px,86vh)!important;max-width:none!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}.tb-modal textarea{display:block;width:100%;height:100%;min-height:360px;box-sizing:border-box;resize:none;overflow:auto;white-space:pre-wrap;word-break:break-word;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:12px}@media(max-width:600px){.tb-modal{width:96vw!important;height:90vh!important}}.sc-tb-row{margin-top:7px;padding:6px 8px;border-radius:7px;background:var(--panel2);border:1px solid var(--line);font-size:11px;line-height:1.7}.sc-tb-row b{color:var(--accent)}';
  document.head.appendChild(st);
}
function tbPartSelect(rows, current){
  return `<select data-tb-sel style="padding:6px 8px;font-size:13px;max-width:100%">${rows.map(r => `<option value="${esc(r.key)}"${r.key === current ? ' selected' : ''}>${esc(r.label)}${r.done ? ' ✓' : ''}</option>`).join('')}</select>`;
}
function tbOpenInjectionExport(gi){
  tbEnsureStyle();
  const groups = teacherAssignmentGroups(), g = groups[Number(gi)]; if(!g) return;
  const label = groups.length > 1 ? `老师${Number(gi) + 1}` : '老师';
  const rows = tbStatus(gi, g);
  let cur = (rows.find(r => !r.done) || rows[0]).key;
  const ov = document.createElement('div'); ov.className = 'gs-overlay teacher-injection-overlay';
  ov.innerHTML = `<div class="gs-modal tb-modal" role="dialog" aria-modal="true">
    <div class="gs-modal-head" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div><b>🎓 ${esc(label)} · 注入导出（分批）</b><span class="muted" style="margin-left:8px;font-size:11px">第${g.first}-${g.last}章共${g.last - g.first + 1}章，分 总纲 + ${rows.length - 1} 批</span></div>
      <button type="button" class="gs-x" data-tb-close>✕</button></div>
    <div style="padding:8px 16px 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span style="font-size:12px">选择要导出的部分：</span><span data-tb-selwrap></span><span class="muted" data-tb-note style="font-size:11px"></span></div>
    <div style="padding:10px 16px;flex:1;min-height:0;display:flex"><textarea readonly spellcheck="false" data-tb-text></textarea></div>
    <div style="display:flex;gap:10px;justify-content:flex-end;padding:0 16px 16px;flex:0 0 auto"><button type="button" class="btn" data-tb-copy>复制</button><button type="button" class="btn primary" data-tb-txt>导出TXT</button></div></div>`;
  document.body.appendChild(ov);
  const ta = ov.querySelector('[data-tb-text]'), note = ov.querySelector('[data-tb-note]'), wrap = ov.querySelector('[data-tb-selwrap]');
  let curText = '';
  const show = () => {
    wrap.innerHTML = tbPartSelect(tbStatus(gi, g), cur);
    wrap.querySelector('[data-tb-sel]').onchange = e => { cur = e.target.value; show(); };
    let inj = null; try{ inj = tbInjectionFor(gi, g, cur); }catch(e){ inj = { error: '组装失败：' + String(e && e.message || e) }; }
    if(!inj || inj.error){ curText = ''; ta.value = (inj && inj.error) || '该部分当前无法组装注入，请检查老师分组上下文'; note.textContent = ''; return; }
    curText = `【SYSTEM】\n${inj.system}\n\n【USER】\n${inj.user}`; ta.value = curText;
    note.textContent = `${curText.length} 字`; ta.scrollTop = 0;
  };
  const close = () => ov.remove();
  ov.querySelector('[data-tb-close]').onclick = close;
  ov.addEventListener('mousedown', e => { if(e.target === ov) close(); });
  ov.querySelector('[data-tb-copy]').onclick = () => { if(!curText) return toast('当前部分没有可复制的注入'); copyText(curText); toast('已复制'); };
  ov.querySelector('[data-tb-txt]').onclick = () => {
    if(!curText) return toast('当前部分没有可导出的注入');
    const base = teacherInjectionFileName(gi).replace(/\.txt$/, '');
    downloadPlainText(`${base}_${cur === 'plan' ? '总纲' : '第' + cur + '章'}.txt`, curText); toast('TXT 已导出');
  };
  show();
}

/* ---------------------------------------------------------------- 手动导入分段成果 */
function tbSavePart(gi, g, partKey, text){
  const b = tbBatched(gi, true);
  if(partKey === 'plan'){
    const r = tbNormalizePlan(text); if(!r.ok) return r;
    b.stage1 = { raw: r.text, ts: Date.now() };
    tbAssemble(gi, g);
    return { ok: true, warns: [] };
  }
  const p = tbParts(g).find(x => x.key === partKey); if(!p) return { ok: false, error: '未知的批次' };
  if(!b.stage1 || !b.stage1.raw) return { ok: false, error: '请先导入【总纲】成果，再导入各批章节教案。' };
  const r = tbNormalizeBatch(text, p.from, p.to); if(!r.ok) return r;
  b.parts[p.key] = { raw: r.text, ts: Date.now() };
  tbAssemble(gi, g);
  return { ok: true, warns: r.warns || [] };
}
function tbRefreshCard(gi, g){
  const el = document.querySelector(`[data-tb-status="${gi}"]`);
  if(el){ const tmp = document.createElement('div'); tmp.innerHTML = tbCardExtra(gi, g); const n = tmp.firstElementChild; if(n && el.parentNode) el.parentNode.replaceChild(n, el); }
  try{ refreshTeacherUi(gi); renderTeacherCutUi(gi); }catch(_e){}
}
function tbOpenImport(gi){
  tbEnsureStyle();
  const groups = teacherAssignmentGroups(), g = groups[Number(gi)]; if(!g || !tbIsBatched(g)) return;
  const label = groups.length > 1 ? `老师${Number(gi) + 1}` : '老师';
  let cur = (tbStatus(gi, g).find(r => !r.done) || tbStatus(gi, g)[0]).key;
  const ov = document.createElement('div'); ov.className = 'gs-overlay teacher-injection-overlay';
  ov.innerHTML = `<div class="gs-modal tb-modal" role="dialog" aria-modal="true">
    <div class="gs-modal-head" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div><b>📥 ${esc(label)} · 导入分段成果</b><span class="muted" style="margin-left:8px;font-size:11px">选择部分 → 粘贴外部AI的输出 → 保存本段；已保存的部分会回填</span></div>
      <button type="button" class="gs-x" data-tb-close>✕</button></div>
    <div style="padding:8px 16px 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span style="font-size:12px">导入到：</span><span data-tb-selwrap></span><span class="muted" data-tb-note style="font-size:11px"></span></div>
    <div style="padding:10px 16px;flex:1;min-height:0;display:flex"><textarea spellcheck="false" data-tb-text placeholder="粘贴该部分的 AI 输出（总纲＝一至六区；批次＝该批章节的正式章节教案）"></textarea></div>
    <div style="display:flex;gap:10px;justify-content:flex-end;padding:0 16px 16px;flex:0 0 auto"><button type="button" class="btn primary" data-tb-save>保存本段</button></div></div>`;
  document.body.appendChild(ov);
  const ta = ov.querySelector('[data-tb-text]'), note = ov.querySelector('[data-tb-note]'), wrap = ov.querySelector('[data-tb-selwrap]');
  const load = () => {
    const b = tbBatched(gi, false);
    const saved = cur === 'plan' ? (b && b.stage1 && b.stage1.raw) : (b && b.parts && b.parts[cur] && b.parts[cur].raw);
    ta.value = saved || '';
    note.textContent = saved ? '已保存的内容已回填，可修改后再保存' : '';
  };
  const show = () => {
    wrap.innerHTML = tbPartSelect(tbStatus(gi, g), cur);
    wrap.querySelector('[data-tb-sel]').onchange = e => { cur = e.target.value; show(); };
    load();
  };
  const close = () => ov.remove();
  ov.querySelector('[data-tb-close]').onclick = close;
  ov.addEventListener('mousedown', e => { if(e.target === ov) close(); });
  ov.querySelector('[data-tb-save]').onclick = async () => {
    try{
      const r = tbSavePart(gi, g, cur, ta.value);
      if(!r.ok){ toast('保存失败：' + r.error); return; }
      await persistCritical('保存老师分段教案');
      const complete = tbComplete(gi, g);
      if(complete){ scMark('t' + gi, true, false); try{ if(teacherAssignmentGroups().every((x, i) => scDone('t' + i))) scMark('teacher', true, false); }catch(_e){} persist(); }
      toast(`已保存${cur === 'plan' ? '总纲' : '第' + cur + '章'}${r.warns && r.warns.length ? '；提醒：' + r.warns.slice(0, 3).join('；') + (r.warns.length > 3 ? '…' : '') : ''}${complete ? '；全部分段已齐，已拼合为完整老师教案' : ''}`);
      tbRefreshCard(gi, g); show();
    }catch(e){ toast('保存失败：' + String(e && e.message || e)); }
  };
  show();
}

/* ---------------------------------------------------------------- 卡片附加区 */
function tbCardExtra(gi, g){
  if(!g) return '';
  const n = Number(g.last) - Number(g.first) + 1;
  const sel = `<select data-tb-size="${gi}" title="每批最多几章；章数超过它的老师组会分批备课（总纲 + 若干批）" style="padding:1px 4px;font-size:11px">${[2, 3, 4, 5, 6, 8, 10, 12].map(v => `<option value="${v}"${v === tbBatchSize() ? ' selected' : ''}>${v}</option>`).join('')}</select>`;
  if(!tbIsBatched(g)){
    return `<div class="sc-tb-row" data-tb-status="${gi}"><b>📚 备课方式</b>：本组${n}章 ≤ 每批上限 ${sel} 章，整组一次输出（旧流程）。</div>`;
  }
  const b = tbBatched(gi, false);
  const cells = tbStatus(gi, g).map(r => `<span style="${r.done ? '' : 'opacity:.7'}">${esc(r.label)}${r.done ? '✓' : '✗'}</span>`).join(' ｜ ');
  return `<div class="sc-tb-row" data-tb-status="${gi}"><b>📚 分批备课</b>（每批≤${sel}章，总纲 + ${tbParts(g).length} 批）：${cells}${b && b.manual ? ' <span style="color:#d97706">（已手动整体修改教案）</span>' : ''} <button type="button" class="sc-plan-btn" data-tb-import="${gi}" title="手动流程：把外部AI的总纲/某批输出粘贴保存">📥 导入分段成果</button></div>`;
}

/* ---------------------------------------------------------------- AI 分批生成 */
async function tbGenTeacher(btn, gi, g){
  const key = 't' + gi;
  markAIRunning(key); if(btn) busy(btn, true, '备课中…'); if(btn && btn.parentNode) showStopBtn(btn.parentNode);
  try{
    const spec = resolveActiveSpec('teacher'), temp = (spec && spec.teacherTemp != null) ? spec.teacherTemp : 0.4;
    const sc = scState();
    if(scDone(key)){ const old = tbTeacher(gi, false); if(old) old.batched = null; }   // 已备 → 重新备课＝从头来；未完成 → 续做
    const b = tbBatched(gi, true);
    const t = tbTeacher(gi, true);
    const ask = async (opt, what) => {
      const inj = buildTeacherInjection(g, gi, opt);
      if(!inj) throw new Error('老师真实 AI 输入组装失败');
      const res = await callDeepSeek(inj.system, inj.user, { temperature: temp, maxTokens: 32768, signal: _abortCtl?.signal, taskKey: 'teacher', runId: 'teacher-' + Date.now().toString(36), attempt: 1 });
      const raw = String(res.text || '').trim(); if(!raw) throw new Error(`${what}：老师返回空`);
      return raw;
    };
    const parts = tbParts(g);
    let _first = true;   // v1.0.596：本次运行中第一次 AI 调用之前不等待，之后每个 AI 步骤之间按「步骤间隔」等待（可被停止）
    const gap = async label => {
      if(_first){ _first = false; return; }
      if(typeof ocGapWait === 'function'){ const ok = await ocGapWait(label); if(!ok){ const e = new Error('已停止'); e.name = 'AbortError'; throw e; } }
    };
    if(!b.stage1 || !b.stage1.raw){
      await gap(`老师${gi + 1}总纲`);
      toast(`老师${gi + 1}：生成总纲（一至六区）…`);
      const raw = await ask({ part: 'plan' }, '总纲');
      const r = tbNormalizePlan(raw); if(!r.ok) throw new Error(r.error);
      b.stage1 = { raw: r.text, ts: Date.now() }; tbAssemble(gi, g);
      await persistCritical('老师总纲保存'); tbRefreshCard(gi, g);
    }
    for(let i = 0; i < parts.length; i++){
      const p = parts[i];
      if(b.parts[p.key] && b.parts[p.key].raw) continue;
      await gap(`老师${gi + 1}第${p.from}-${p.to}章`);
      toast(`老师${gi + 1}：生成第${p.from}-${p.to}章（${i + 1}/${parts.length}）…`);
      const raw = await ask({ part: 'batch', from: p.from, to: p.to, zoneText: b.stage1.raw, handoffText: tbBatchHandoff(gi, g, p.from) }, `第${p.from}-${p.to}章`);
      const r = tbNormalizeBatch(raw, p.from, p.to); if(!r.ok) throw new Error(r.error);
      b.parts[p.key] = { raw: r.text, ts: Date.now() }; tbAssemble(gi, g);
      await persistCritical(`老师第${p.from}-${p.to}章教案保存`); tbRefreshCard(gi, g);
      if(r.warns && r.warns.length) toast('提醒：' + r.warns.slice(0, 2).join('；'));
    }
    /* 全部分段已齐：与整组流程相同的风格分层校验 */
    const styleAudit = validateTeacherStyleCoverageAcrossGroups();
    t.styleAudit = styleAudit;
    const isFinalTeacher = Number(gi) === teacherAssignmentGroups().length - 1;
    const hardStyleError = styleAudit.duplicate.length > 0 || styleAudit.unknown.length > 0 || (isFinalTeacher && styleAudit.missing.length > 0);
    if(hardStyleError){
      scSetFailed(key, true);
      scSetError(key, { category: 'TEACHER_STYLE_ALLOCATION_ERROR', code: 'STYLE_ALLOCATION_INCOMPLETE', details: `写作风格分层未完成：未分配=${styleAudit.missing.length}，重复=${styleAudit.duplicate.length}，未知=${styleAudit.unknown.length}`, expected: 'ALL=GLOBAL+HYBRID+CHAPTER，三层互不重复且无未知ID；最后一位老师必须清零remaining', actual: styleAudit });
      await persistCritical('老师教案原始内容保存（风格分层未通过）'); refreshTeacherUi(gi); tbRefreshCard(gi, g);
      toast(`老师${gi + 1}已保存原始教案，但写作风格分层未通过：未分配${styleAudit.missing.length}项、重复${styleAudit.duplicate.length}项、未知${styleAudit.unknown.length}项`); return false;
    }
    t.styleAuditStatus = styleAudit.missing.length ? 'PARTIAL_HANDOFF' : 'COMPLETE';
    scSetFailed(key, false); scSetError(key, null, false, false);
    scState().noAutoRetry = scState().noAutoRetry || {}; delete scState().noAutoRetry[key];
    await persistCritical('老师教案原始内容保存'); markAIDone(key, false); scMark(key, true, false); refreshTeacherUi(gi); tbRefreshCard(gi, g);
    toast(isFinalTeacher ? `老师${gi + 1}备课完成（分${parts.length}批）；已拼合完整教案，且全书写作风格分层已清零通过` : (styleAudit.missing.length ? `老师${gi + 1}备课完成（分${parts.length}批）；本组分层合法，剩余${styleAudit.missing.length}项交由后续老师接力` : `老师${gi + 1}备课完成（分${parts.length}批）`));
    playDoneSound('single'); return true;
  }catch(e){
    console.error('[tbGenTeacher] 老师分批流程失败：', e);
    try{ await persistCritical('老师分批教案（保留已完成部分）'); }catch(_e){}
    tbRefreshCard(gi, g);
    if(e && e.name === 'AbortError'){ toast('已停止备课；已完成的部分已保留，再点一次可继续'); return false; }
    scSetError(key, { category: 'TEACHER_GENERATION_ERROR', code: 'GENERATION_ERROR', details: String(e && e.message || e), expected: '老师AI返回完整原始纯文本教案', actual: '本次流程未完成' });
    setScRetry(key, 1); scRefreshBadge(btn, key); refreshTeacherUi(gi);
    toast('老师分批备课未完成：' + String(e && e.message || e) + '（已完成的部分已保留，再点一次可继续）'); return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running || []).filter(k => k !== key); hideStopBtn(); if(btn) busy(btn, false); scRefreshBadge(btn, key);
  }
}

/* ---------------------------------------------------------------- 点击委托 */
if(!document._tbDelegate){
  document._tbDelegate = 1;
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-tb-import]');
    if(!b) return;
    e.preventDefault(); e.stopPropagation();
    tbOpenImport(Number(b.dataset.tbImport));
  }, true);
  document.addEventListener('change', e => {
    const sel = e.target.closest && e.target.closest('[data-tb-size]');
    if(!sel) return;
    const v = Number(sel.value);
    if(!state.school || typeof state.school !== 'object') state.school = {};
    state.school.teacherBatchSize = v;
    persist();
    const groups = teacherAssignmentGroups();
    groups.forEach((g, i) => tbRefreshCard(i, g));
    toast(`每批最多 ${v} 章；已有的分段成果按新的分批方式重新对应，对不上的批次需重新导入/备课`);
  }, true);
}
