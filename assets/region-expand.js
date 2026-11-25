/* ================================================================
 * region-expand.js · v1.0.619 · A-03 区域按需展开（AI）
 *
 * 目标形态：开放世界地图——骨架（词典地点=迷雾）+ 区域按需展开 + 按章推进。
 * 本文件：老师备课【前】自动、按组批量（每组一次 AI 调用）把本组章节所涉的迷雾地点展开成
 *   state.worldEngine.regions[地点] = { status:'open', anchors:[…], note:'…' }；
 * 老师备课时读取已展开区域作为“地点固定事实”（regionTeacherBlock）。
 * 状态：迷雾 fog → 已展开 open → 已到达 visited；当前 current 由章末结算实时判定（weRegionStatus）。
 *
 * 依赖（必须在 world-engine.js 之后加载）：weState/weRegions/weRegionsFromDictionary/weExpandRegion/weParse/weRegionStatus、
 *   app.js 的 callDeepSeek/teacherAssignmentGroups/ensureGlossaryKnowledgeShape/persist/toast/busy/ptOpenText 等。
 * 回填口原则：区域展开卡常亮「生成 / 注入导出 / 读区域展开」三个入口，不置灰、不隐藏。
 * ================================================================ */
const RE_FORMAT_HELP = '在这里粘贴外部AI生成的内容（或点「导入」选择 txt/md 文件）。每个地点一行，字段用“｜”分隔：\n[REGION] 地点｜锚点1；锚点2；锚点3｜备注（固定的地理/功能/与其他地点的相对关系）\n（地点名必须与词典完全一致；粘贴后点「保存更改」，立即生效。）';

const RE_SYS = `你是长篇小说创作系统里的「区域展开设计师」。世界地图上，词典里的地点一开始都是迷雾（只有名字）。现在故事即将写到其中几个地点，你要把它们“按需展开”：给每个地点补上固定的、可被后文反复引用的事实，让故事走到那里时，世界已经在那里。
你只提供「地点的固定事实」，不写剧情、不写场景、不写台词、不替人物做选择。
输出格式（每个地点一行；严格使用行首标记；不要输出任何解释、标题或其它内容）：
[REGION] 地点｜锚点1；锚点2；锚点3｜备注
  锚点：2–4 个稳定、具体、可被反复引用的地理或社会特征（格局、地标、出入口、谁管辖、人流与行业、与相邻地点的相对方位或行程成本）；要贴合题材与时代，避免通用套话。感官细节（气味声音光线）不必写，另有地点感官锚点负责。
  备注：≤60 字，概括这个地点“是什么、归谁、与谁相连”。
硬规则：
1. 只展开“待展开地点”清单里的地点，逐个都要有一行；地点名必须与清单完全一致；不得新增地点、人物、势力、专名。
2. 词典、世界观规则、地名关联、成本底表里已明确的事实一律不得改动或矛盾；用其中已有的距离/方位/归属做依据。
3. 只写“一直如此”的固定事实：不得写将来要发生的事件，不得写任何尚未公开的秘密，也不得暗示其内容。
4. 不写台词、不写成品段落；不要替故事安排人物在此做什么。`;

function reGlossary(){ try{ return ensureGlossaryKnowledgeShape((state.outline && state.outline.glossary) || {}); }catch(e){ return (state.outline && state.outline.glossary) || {}; } }
function reAutoOn(){ return weState().autoRegions !== false; }
function reSetAuto(v){ const w = weState(); if(v) delete w.autoRegions; else w.autoRegions = false; }

/* 本组章节所涉地点：词典地点名出现在本组各章的校长计划/大纲文本里（字面包含，与 teacherScopedGlossary 同法）。 */
function reGroupPlaceNames(g){
  const gl = reGlossary(); const places = (gl.places || []).map(x => String((x && x.name) || '').trim()).filter(Boolean);
  if(!places.length || !g) return [];
  const plans = (state.school && state.school.principal && state.school.principal.plans) || {};
  const chs = (state.outline && state.outline.chapters) || [];
  let txt = '';
  for(let n = Number(g.first); n <= Number(g.last); n++){
    try{ txt += JSON.stringify(plans[n] || {}) + '\n'; }catch(e){}
    try{ txt += JSON.stringify(chs[n - 1] || {}) + '\n'; }catch(e){}
  }
  const seen = new Set(); const out = [];
  places.forEach(nm => { if(!seen.has(nm) && txt.includes(nm)){ seen.add(nm); out.push(nm); } });
  return out;
}
/* 待展开 = 所涉地点中仍是迷雾（含 regions 里尚无记录）的。 */
function reTodoNames(g){
  try{ weRegionsFromDictionary(); }catch(e){}
  const R = weRegions();
  return reGroupPlaceNames(g).filter(nm => !R[nm] || R[nm].status === 'fog');
}
/* 所有老师组里还需要展开的 [{gi,g,names}] */
function reGroupsNeeding(){
  let groups = []; try{ groups = teacherAssignmentGroups() || []; }catch(e){}
  const out = [];
  groups.forEach((g, gi) => { const names = reTodoNames(g); if(names.length) out.push({ gi, g, names }); });
  return out;
}

function reBuildUser(g, gi, names){
  const gl = reGlossary(); const L = [];
  L.push('书名：' + (typeof currentTitle === 'function' ? currentTitle() : ''));
  L.push(`【本组】老师${Number(gi) + 1}｜第${g.first}-${g.last}章`);
  const byName = {}; (gl.places || []).forEach(p => { if(p && p.name) byName[String(p.name).trim()] = p; });
  L.push('【待展开地点（逐个展开，名字必须一致）】\n' + names.map(nm => {
    const p = byName[nm] || {}; const d = p.desc || p.description || p.summary || p.function || p.role || p.note || '';
    return `- ${nm}｜${String(d).slice(0, 80)}`;
  }).join('\n'));
  const R = weRegions(); const open = Object.keys(R).filter(k => R[k].status !== 'fog' && (R[k].anchors.length || R[k].note) && names.indexOf(k) < 0).slice(0, 20);
  if(open.length) L.push('【已展开的地点（只读；保持一致，不得矛盾）】\n' + open.map(k => `- ${k}：${R[k].anchors.join('；')}${R[k].note ? '｜' + R[k].note : ''}`).join('\n').slice(0, 2000));
  const pc = (gl._placeContacts || []).filter(x => x && (names.indexOf(String(x.from || '').trim()) >= 0 || names.indexOf(String(x.to || '').trim()) >= 0)).slice(0, 30);
  if(pc.length) L.push('【地名关联（已成立）】\n' + pc.map(x => `- ${x.from} ↔ ${x.to}${x.relation ? '（' + x.relation + '）' : ''}${x.note ? '：' + x.note : ''}`).join('\n'));
  try{
    const rules = (gl._worldRules || []).slice(0, 10).map(r => `- ${r.cat || ''}｜${r.scope || ''}｜${String(r.rule || '').slice(0, 100)}`);
    if(rules.length) L.push('【世界观规则（已成立，不得矛盾）】\n' + rules.join('\n'));
  }catch(e){}
  try{
    const p = weParse(weState().raw);
    if(p.costs.length) L.push('【成本底表（硬约束）】\n' + p.costs.slice(0, 10).map(x => `- ${x.item}：${x.rule}`).join('\n'));
    const se = p.senses.filter(x => names.indexOf(x.place) >= 0);
    if(se.length) L.push('【这些地点已有的感官锚点（不重复）】\n' + se.map(x => `- ${x.place}：${x.anchors}`).join('\n'));
  }catch(e){}
  try{
    const plans = (state.school && state.school.principal && state.school.principal.plans) || {}; const rows = [];
    for(let n = Number(g.first); n <= Number(g.last); n++){ const p = plans[n] || {}; const t = `第${n}章｜${String(p.title || '').trim()}｜${String(p.function || '').trim()}`.slice(0, 90); rows.push(t); }
    if(rows.length) L.push('【本组章节概要（只用来判断哪些地点会被写到；不要据此写剧情）】\n' + rows.join('\n'));
  }catch(e){}
  L.push('请现在按系统提示的格式输出，逐个展开上面的待展开地点。');
  return L.join('\n\n');
}
function reInjectionFor(g, gi, names){ return `SYSTEM\n${RE_SYS}\n\nUSER\n${reBuildUser(g, gi, names)}`; }

/* 解析 [REGION] 行 → [{name,anchors,note}]；allowed 给定时只收清单内地点。 */
function reParse(raw, allowed){
  const out = []; const seen = new Set(); let skipped = 0;
  String(raw || '').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*\[REGION\]\s*(.+?)\s*$/i); if(!m) return;
    const f = m[1].split(/｜|\|/).map(x => x.trim());
    const name = f[0]; if(!name) return;
    if(allowed && allowed.indexOf(name) < 0){ skipped++; return; }
    if(seen.has(name)) return;
    const anchors = String(f[1] || '').split(/[；;、]/).map(x => x.trim()).filter(Boolean).slice(0, 12);
    const note = f.slice(2).join('；').trim();
    if(!anchors.length && !note) return;
    seen.add(name); out.push({ name, anchors, note });
  });
  out.skipped = skipped; return out;
}
function reApply(rows){ let n = 0; rows.forEach(r => { if(weExpandRegion(r.name, { anchors: r.anchors, note: r.note })) n++; }); return n; }

/* 对一个老师组做一次 AI 展开。返回 {ok, n, skipped, aborted?, error?}；失败不抛（由调用方决定是否继续）。 */
async function reExpandForGroup(gi, g, opt){
  opt = opt || {};
  const names = reTodoNames(g); if(!names.length) return { ok: true, n: 0, skipped: 0, none: true };
  try{
    const res = await callDeepSeek(RE_SYS, reBuildUser(g, gi, names), { temperature: resolveTaskTemperature('worldEngine'), topP: 0.6, maxTokens: 3000, signal: opt.signal || (typeof _abortCtl !== 'undefined' && _abortCtl ? _abortCtl.signal : null), taskKey: 'worldEngine' });
    const raw = String((res && res.text) || '').replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '').trim();
    const rows = reParse(raw, names);
    if(!rows.length) return { ok: false, n: 0, skipped: rows.skipped || 0, error: '返回内容里没有找到清单内地点的 [REGION] 行' };
    const n = reApply(rows); await persist();
    return { ok: true, n, skipped: rows.skipped || 0, missing: names.length - n };
  }catch(e){
    if(e && e.name === 'AbortError') return { ok: false, aborted: true, n: 0, skipped: 0, error: '已停止' };
    return { ok: false, n: 0, skipped: 0, error: String((e && e.message) || e).slice(0, 120) };
  }
}

/* 老师备课前钩子（genTeacher 调用）：开启自动 + 本组有迷雾地点才调用一次；失败只提示，不挡老师。返回 true=用户已停止。 */
async function reAutoExpandBeforeTeacher(btn, gi, g){
  if(!reAutoOn()) return false;
  const names = reTodoNames(g); if(!names.length) return false;
  const ctl = new AbortController(); const prev = (typeof _abortCtl !== 'undefined') ? _abortCtl : null; _abortCtl = ctl;
  if(btn){ try{ busy(btn, true, '展开区域…'); if(btn.parentNode) showStopBtn(btn.parentNode); }catch(e){} }
  try{
    toast(`老师${Number(gi) + 1}：备课前先展开 ${names.length} 个地点（${names.slice(0, 4).join('、')}${names.length > 4 ? '…' : ''}）…`);
    const r = await reExpandForGroup(gi, g, { signal: ctl.signal });
    if(r.aborted){ toast('已停止；尚未开始备课'); return true; }
    if(!r.ok) toast('区域展开未成功（' + r.error + '）；老师将按词典原样备课，可稍后在「世界」阶段重试');
    else toast(`已展开 ${r.n} 个地点${r.missing > 0 ? `（还有 ${r.missing} 个未返回，仍是迷雾）` : ''}`);
    return false;
  }finally{
    if(_abortCtl === ctl) _abortCtl = prev;
    if(btn){ try{ busy(btn, false); hideStopBtn(); }catch(e){} }
    refreshRegionCard();
  }
}

/* ---- 下游：老师读取本组所涉的已展开地点（固定事实）---- */
function regionTeacherBlock(g){
  if(!g) return '';
  const R = weRegions(); const names = reGroupPlaceNames(g).filter(nm => R[nm] && R[nm].status !== 'fog' && (R[nm].anchors.length || R[nm].note));
  if(!names.length) return '';
  const L = ['【区域展开｜本组所涉地点的固定事实（只读）】'];
  L.push(names.map(nm => `- ${nm}：${R[nm].anchors.join('；')}${R[nm].note ? '｜' + R[nm].note : ''}`).join('\n').slice(0, 3000));
  L.push('【使用规则】以上是地点“一直如此”的固定事实：教案里写到这些地点时必须与之一致、不得矛盾，也不得借此新增地点或改写归属；它们是背景约束，不是剧本，不要照抄成场景。');
  return L.join('\n');
}

/* ---- 界面：区域展开卡（回填口常亮三入口）---- */
function reCounts(){
  try{ weRegionsFromDictionary(); }catch(e){}
  const R = weRegions(); const c = { fog: 0, open: 0, visited: 0 };
  Object.keys(R).forEach(k => { const s = R[k].status; if(c[s] != null) c[s]++; });
  return c;
}
function regionCardHtml(){
  const c = reCounts(); const need = reGroupsNeeding();
  const status = (c.fog + c.open + c.visited) ? `迷雾 ${c.fog} · 已展开 ${c.open} · 已到达 ${c.visited}${need.length ? ` ｜ ${need.length} 个老师组有待展开地点` : ''}` : '词典里还没有地点（仍可「注入导出」或直接「读区域展开」回填）';
  return `<div class="card we-card re-card" id="reCard"><h3>🗺️ 区域展开 <span class="muted" style="font-size:12px;font-weight:400">老师备课前自动 · 每组一次</span></h3>
    <p class="sub">词典里的地点一开始是迷雾。老师备课前，系统会把本组章节要用到的迷雾地点一次性展开成固定事实（格局、归属、相对位置），老师据此备课，故事走到哪里，那里就已经存在。也可以在这里手动生成，或用外部AI生成后回填。</p>
    <p class="sub" style="margin-top:-4px"><b>${esc(status)}</b></p>
    <label class="sub" style="display:flex;gap:6px;align-items:center;margin:0 0 6px"><input type="checkbox" id="chkReAuto"${reAutoOn() ? ' checked' : ''}> 老师备课前自动展开（每组一次 AI 调用）</label>
    <div class="btn-row">
      <button type="button" class="btn primary" id="btnGenRE">${need.length ? '生成区域展开' : '重新检查并生成'}</button>
      <button type="button" class="btn ghost" id="btnInjRE">📦 注入导出</button>
      <button type="button" class="btn ghost" id="btnReadRE">📋 读区域展开</button>
    </div></div>`;
}
function refreshRegionCard(){
  const card = document.getElementById('reCard'); if(!card) return;
  const wrap = document.createElement('div'); wrap.innerHTML = regionCardHtml().trim();
  card.replaceWith(wrap.firstElementChild); bindRegionCard();
}
function reSerialize(){
  const R = weRegions();
  return Object.keys(R).filter(k => R[k].status !== 'fog' && (R[k].anchors.length || R[k].note)).map(k => `[REGION] ${k}｜${R[k].anchors.join('；')}｜${R[k].note}`).join('\n');
}
function reImportInto(ta){
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.txt,.md,text/plain,text/markdown';
  inp.onchange = () => { const f = inp.files && inp.files[0]; if(!f) return; const r = new FileReader(); r.onload = () => { ta.value = String(r.result || ''); toast('已导入：' + f.name); }; r.readAsText(f, 'utf-8'); };
  inp.click();
}
async function reGenerateAll(btn){
  if(genBusy()){ toast('已有生成任务进行中，请稍候'); return false; }
  const need = reGroupsNeeding();
  if(!need.length){ toast('当前没有待展开的地点（本组章节所涉地点都已展开，或词典/校长计划里还没有可对上的地点）'); return false; }
  if(!confirm(`将对 ${need.length} 个老师组各调用一次 AI 展开地点（共 ${need.reduce((a, x) => a + x.names.length, 0)} 个）。继续？`)) return false;
  const ctl = new AbortController(); _abortCtl = ctl;
  if(btn){ btn.classList.add('is-busy'); btn.disabled = true; }
  let done = 0, total = 0;
  try{
    for(let i = 0; i < need.length; i++){
      if(ctl.signal.aborted) break;
      if(i > 0 && typeof ocGapWait === 'function'){ const ok = await ocGapWait('区域展开'); if(!ok) break; }
      toast(`区域展开：老师${need[i].gi + 1}（${i + 1}/${need.length}）…`);
      const r = await reExpandForGroup(need[i].gi, need[i].g, { signal: ctl.signal });
      if(r.aborted) break;
      if(!r.ok){ toast(`老师${need[i].gi + 1} 的区域展开失败：${r.error}`); continue; }
      done++; total += r.n;
    }
    toast(`区域展开完成：${done}/${need.length} 组成功，共展开 ${total} 个地点`);
    return true;
  }finally{
    if(_abortCtl === ctl) _abortCtl = null;
    if(btn){ btn.classList.remove('is-busy'); btn.disabled = false; }
    refreshRegionCard();
  }
}
function bindRegionCard(){
  const gen = document.getElementById('btnGenRE'); if(gen) gen.onclick = e => { e.preventDefault(); e.stopPropagation(); reGenerateAll(gen); };
  const chk = document.getElementById('chkReAuto'); if(chk) chk.onchange = () => { reSetAuto(chk.checked); persist(); toast(chk.checked ? '已开启：老师备课前自动展开地点' : '已关闭自动展开（仍可手动生成）'); };
  const inj = document.getElementById('btnInjRE'); if(inj) inj.onclick = e => { e.preventDefault(); e.stopPropagation();
    let groups = []; try{ groups = teacherAssignmentGroups() || []; }catch(err){}
    const need = reGroupsNeeding();
    const parts = need.length ? need.map(x => `===== 老师${x.gi + 1}（第${x.g.first}-${x.g.last}章）待展开 ${x.names.length} 个地点 =====\n${reBuildUser(x.g, x.gi, x.names)}`) : [];
    const warn = need.length ? '' : '（当前没有待展开的地点：本组章节所涉地点已展开，或词典/校长计划里还没有可对上的地点。下面只给出 SYSTEM；有待展开地点后再导出会带 USER。）\n\n';
    ptOpenText({ title: '📦 区域展开 · 注入导出', sub: '此刻实际发送给模型的 SYSTEM + 每个老师组的 USER；外部AI的结果用「读区域展开」回填（每组一次）', text: warn + `SYSTEM\n${RE_SYS}\n\n` + (parts.length ? 'USER（每组各发一次）\n\n' + parts.join('\n\n') : ''), readonly: true,
      buttons: [ { label: '复制', onClick: t => { copyText(t); toast('已复制'); } }, { label: '导出TXT', primary: true, onClick: t => { downloadPlainText(exportFileName('区域展开', '注入'), t); toast('已导出'); } } ] }); };
  const rd = document.getElementById('btnReadRE'); if(rd) rd.onclick = e => { e.preventDefault(); e.stopPropagation();
    const cur = reSerialize();
    ptOpenText({ title: '📋 读区域展开', sub: cur ? '已展开的地点已回填；改完点「保存更改」' : '还没有内容：粘贴外部AI的输出，或点「导入」选文件', text: cur || RE_FORMAT_HELP,
      buttons: [
        { label: '导入', onClick: (t, close, ta) => reImportInto(ta) },
        { label: '导出TXT', onClick: t => { downloadPlainText(exportFileName('区域展开', '输出'), t); toast('已导出'); } },
        { label: '保存更改', primary: true, onClick: (t, close) => {
            const txt = String(t || '').trim();
            if(!txt || txt === RE_FORMAT_HELP.trim()){ toast('没有内容可保存'); return; }
            const known = new Set((reGlossary().places || []).map(x => String((x && x.name) || '').trim()).concat(Object.keys(weRegions())));
            const rows = reParse(txt).filter(r => known.has(r.name));
            if(!rows.length){ toast('没有识别到有效行：每行以 [REGION] 开头，字段用“｜”分隔，地点名要与词典一致'); return; }
            const n = reApply(rows); persist(); toast(`已保存：展开 ${n} 个地点`); close(); refreshRegionCard(); } }
      ] }); };
}
