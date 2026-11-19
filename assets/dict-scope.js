/* ================================================================
 * dict-scope.js · v1.0.592 · 词典按「本组出场范围」裁剪
 *
 * 问题：分组细化每组都带入整本词典（100 章、人物多时输入偏大，且无关实体的秘密/线索会干扰 AI）。
 * 做法：把词典分成三档注入——
 *   ① 完整卡：本组点名（手动追加 / 本组线索文本里出现的名字）、一跳关联实体、主要人物；
 *   ② 精简行：未展开的主要人物（名字｜身份｜关系｜性格）；
 *   ③ 名录：其余实体只给「名称（一句话）」，表示存在、可按名字引用，但本组未点名，不得擅自扩写。
 *   世界观规则（_worldRules）永远完整给出。
 * 上限 DSC_BUDGET 字，超出时按「点名 > 关联 > 主要人物」逐级降级；手动追加的不会被自动降级。
 * 「词典增补」使用同一套分档（轻量版：主要人物完整 + 清单/本组线索点名与关联完整，其余名录）。
 *
 * 本文件是经典脚本，依赖 app.js 与 principal-tiered.js 的全局函数，必须在它们之后加载。
 * 任何一步出错都会回退到「整本词典」旧行为，不会让校长/增补不可用。
 * ================================================================ */
const DSC_BUDGET = 35000;
const DSC_CATS = [
  ['characters','人物'], ['places','地点'], ['propernouns','专名'], ['organizations','组织/势力'],
  ['institutions','职业/机构'], ['items','物品/道具'], ['terms','术语'], ['events','历史事件'],
  ['lifeSettings','生活设定'], ['rules','扩充规则'], ['walkons','路人龙套']
];
const DSC_TIER_TAG = { manual:'手动追加', clue:'本组点名', neighbor:'关联', main:'主要人物', list:'名录' };

/* ---------------------------------------------------------------- 实体与邻接 */
function dscName(x){
  try{ return String(cleanEntityName(x && x.name)[0] || '').trim(); }
  catch(_e){ return String((x && x.name) || '').trim(); }
}
function dscAliases(x){
  const out = [];
  ['alias','aliases','nickname','别名','又名','简称'].forEach(k => {
    const v = x && x[k]; if(!v) return;
    (Array.isArray(v) ? v : String(v).split(/[、，,;；\/|｜\s]+/)).forEach(s => { s = String(s || '').trim(); if(s.length >= 2) out.push(s); });
  });
  return out;
}
function dscBrief(x, n){
  const f = ['identity','coreRole','function','meaning','content','type','category','note'];
  for(const k of f){ const v = String((x && x[k]) || '').trim(); if(v && v !== '无' && v !== '未知') return v.length > (n || 18) ? v.slice(0, n || 18) + '…' : v; }
  return '';
}
function dscEntities(){
  const o = state.outline || {};
  const cg = _principalCleanGlossary(o.glossary);
  const out = [], seen = new Set();
  DSC_CATS.forEach(([cat, label]) => {
    (cg[cat] || []).forEach(x => {
      if(!x || typeof x !== 'object') return;
      const name = dscName(x); if(!name) return;
      const key = cat + ':' + name; if(seen.has(key)) return; seen.add(key);
      let size = 0; try{ size = JSON.stringify(x).length; }catch(_e){}
      out.push({ key, cat, label, name, obj:x, main: cat === 'characters' && x.tier !== 'support', aliases: dscAliases(x), size, brief: dscBrief(x) });
    });
  });
  return { ents: out, cg };
}
function dscAdjacency(cg){
  const adj = new Map();
  const link = (a, b) => {
    a = String(a || '').trim(); b = String(b || '').trim(); if(!a || !b || a === b) return;
    if(!adj.has(a)) adj.set(a, new Set()); if(!adj.has(b)) adj.set(b, new Set());
    adj.get(a).add(b); adj.get(b).add(a);
  };
  (cg.relationshipTable || []).forEach(x => link(x && x.a, x && x.b));
  (cg.placeContacts || []).forEach(x => link(x && x.from, x && x.to));
  (cg.properContacts || []).forEach(x => link(x && x.from, x && x.to));
  return adj;
}

/* ---------------------------------------------------------------- 渲染（校长分组细化用） */
function dscRender(ents, cg, budgetNote){
  const full = ents.filter(e => e.full), listed = ents.filter(e => !e.full);
  const fullNames = new Set(full.map(e => e.name));
  const gl = (state.outline && state.outline.glossary) || {};
  const J = v => JSON.stringify(v);
  const L = [];
  L.push(`【词典裁剪说明｜本组】本组词典按「出场范围」分档：①【完整卡】=本组点名/关联/主要人物，可直接依据；②【主要人物精简行】=未展开的主要人物，只给身份/关系/性格；③【名录】=词典里已存在但本组未点名的实体，只给名称与一句话，表示它们存在、可按名字引用，但不得擅自扩写其设定；若剧情确实需要某个名录实体的完整设定，请在该章diversityNote里写明（用户会手动追加后重做）。世界观规则全部完整给出。新增实体不得与完整卡或名录重名。${budgetNote || ''}`);
  const cards = [];
  DSC_CATS.forEach(([cat, label]) => {
    const rows = full.filter(e => e.cat === cat).map(e => {
      const o = Object.assign({}, e.obj);
      if(cat === 'characters'){ try{ const s = enrichSupplementText(gl, e.name); if(s) o['补充描写'] = s; }catch(_e){} }
      return J(o);
    });
    if(rows.length) cards.push(`${label}（${rows.length}）：\n${rows.join('\n')}`);
  });
  L.push(`【完整卡】\n${cards.join('\n') || '（本组没有点名实体）'}`);
  const mains = listed.filter(e => e.main);
  if(mains.length) L.push(`【主要人物精简行（${mains.length}）】\n` + mains.map(e => {
    const o = e.obj, cut = (v, n) => { v = String(v || '').trim(); return v.length > n ? v.slice(0, n) + '…' : v; };
    return `- ${e.name}｜${cut(o.identity, 30)}｜${cut(o.relation, 30)}｜${cut(o.trait, 24)}`;
  }).join('\n'));
  const wr = (cg.worldRules || []).filter(x => x && typeof x === 'object');
  if(wr.length) L.push(`【世界观规则（全部，${wr.length}条）】\n` + wr.map(J).join('\n'));
  const relFmt = (rows, ka, kb) => rows.filter(x => x && (fullNames.has(String(x[ka] || '').trim()) || fullNames.has(String(x[kb] || '').trim())))
    .map(x => `- ${x[ka]} ↔ ${x[kb]} [${x.relation || '关联'}]${x.note ? `（${x.note}）` : ''}`);
  const r1 = relFmt(cg.relationshipTable || [], 'a', 'b'); if(r1.length) L.push(`【人物关系（涉及完整卡实体）】\n${r1.join('\n')}`);
  const r2 = relFmt(cg.placeContacts || [], 'from', 'to'); if(r2.length) L.push(`【地名关联（涉及完整卡实体）】\n${r2.join('\n')}`);
  const r3 = relFmt(cg.properContacts || [], 'from', 'to'); if(r3.length) L.push(`【专名关联（涉及完整卡实体）】\n${r3.join('\n')}`);
  const names = [];
  DSC_CATS.forEach(([cat, label]) => {
    const arr = listed.filter(e => e.cat === cat && !e.main);
    if(arr.length) names.push(`${label}：` + arr.map(e => e.brief ? `${e.name}（${e.brief}）` : e.name).join('；'));
  });
  if(names.length) L.push(`【名录（存在但本组未点名，${listed.filter(e=>!e.main).length}项）】\n${names.join('\n')}`);
  return L.join('\n\n');
}

/* ---------------------------------------------------------------- 分档核心 */
function dscBuild(clue, pick, opt){
  opt = opt || {};
  const budget = Number(opt.budget) || DSC_BUDGET;
  const { ents, cg } = dscEntities();
  const add = new Set((pick && pick.add) || []), drop = new Set((pick && pick.drop) || []);
  const text0 = String(clue || '');
  const hit = e => [e.name].concat(e.aliases).some(n => n.length >= 2 && text0.includes(n));
  const adj = dscAdjacency(cg);
  ents.forEach(e => { e.tier = 'list'; e.full = false; e.dropped = false; e.trimmed = false; });
  const p1 = ents.filter(e => !add.has(e.key) && !drop.has(e.key) && hit(e));
  const p1k = new Set(p1.map(e => e.key));
  const nb = new Set(); ents.filter(e => hit(e) && !drop.has(e.key)).forEach(e => (adj.get(e.name) || []).forEach(n => nb.add(n)));
  const p2 = ents.filter(e => !add.has(e.key) && !drop.has(e.key) && !p1k.has(e.key) && nb.has(e.name));
  const p2k = new Set(p2.map(e => e.key));
  const p3 = opt.mainFull === false ? [] : ents.filter(e => e.main && !add.has(e.key) && !drop.has(e.key) && !p1k.has(e.key) && !p2k.has(e.key));
  ents.forEach(e => { if(drop.has(e.key) && !add.has(e.key)) e.dropped = true; });
  const p0 = ents.filter(e => add.has(e.key));
  p0.forEach(e => { e.tier = 'manual'; e.full = true; });
  const cands = [];
  p1.forEach(e => { e.tier = 'clue'; cands.push(e); });
  p2.forEach(e => { e.tier = 'neighbor'; cands.push(e); });
  p3.forEach(e => { e.tier = 'main'; cands.push(e); });
  cands.forEach(e => { e.full = true; });
  const finish = () => { const text = dscRender(ents, cg, ''); return text; };
  let text = finish();
  let guard = 0;
  while(text.length > budget && guard++ < 60){
    const removable = cands.filter(e => e.full);
    if(!removable.length) break;
    let need = text.length - budget, cut = 0;
    while(removable.length && cut < need){ const e = removable.pop(); e.full = false; e.trimmed = true; cut += Math.max(e.size, 40); }
    text = finish();
  }
  const over = text.length > budget;
  const trimmed = ents.filter(e => e.trimmed).length;
  if(trimmed) text = dscRender(ents, cg, `（字数上限${budget}：已有${trimmed}个低优先级实体降为名录/精简行。）`);
  const full = ents.filter(e => e.full);
  return {
    ents, text, budget, over,
    stats: { full: full.length, listed: ents.length - full.length, chars: text.length, trimmed, manualAdd: add.size, manualDrop: drop.size, total: ents.length }
  };
}

/* ---------------------------------------------------------------- 本组线索文本 */
function dscRoughRows(T, first, last){
  const out = [];
  for(let n = first; n <= last; n++){ const r = T && T.rough && T.rough[n]; if(r) out.push(`${r.title || ''} ${r.function || ''} ${r.goal || ''}`); }
  return out.join('\n');
}
function dscGroupClue(gi){
  const P = scState().principal || {}, T = ptPeek() || { rough:{}, groups:{}, cards:{} };
  const g = ptAssignment().groups[gi]; if(!g) return '';
  const first = Number(g.startChapter), last = Number(g.endChapter);
  const parts = [dscRoughRows(T, first, last)];
  const J = v => { try{ return JSON.stringify(v || {}); }catch(_e){ return ''; } };
  parts.push(J((P.stageStrategies || []).filter(x => Number(x.endChapter) >= first && Number(x.startChapter) <= last)));
  const tgs = P.teacherGroupStrategies || [];
  const tg = tgs.find(x => String(x.teacherCode || '') === String(g.teacherCode || '')) || tgs[gi] || null;
  parts.push(J(tg));
  const prevTg = gi > 0 ? tgs[gi - 1] : null, nextTg = tgs[gi + 1] || null;
  if(prevTg) parts.push(`${prevTg.groupTask || ''} ${prevTg.nextGroupLaunch || ''}`);
  if(nextTg) parts.push(`${nextTg.groupTask || ''} ${nextTg.previousGroupHandoff || ''}`);
  try{ parts.push(ptRevealBlocksText(P.raw)); }catch(_e){}
  if(gi > 0){
    try{
      parts.push(ptCardText(gi - 1));
      const prev = T.groups && T.groups[gi - 1];
      if(prev && prev.raw){ const bl = ptChapterBlocks(prev.raw), pl = Number(prev.last); [pl - 1, pl].forEach(n => { if(bl[n]) parts.push(bl[n]); }); }
    }catch(_e){}
  }
  const st = T.groups && T.groups[gi]; if(st && st.needs) parts.push(String(st.needs));
  return parts.filter(Boolean).join('\n');
}
function dscPickOf(gi){
  const T = ptPeek(); const p = T && T.dictPick && T.dictPick[gi];
  return p ? { add: (p.add || []).slice(), drop: (p.drop || []).slice(), auto: (p.auto || []).slice() } : { add: [], drop: [], auto: [] };
}
/* v1.0.595：细化结果保存后，把「只在名录里却被本组章节用到」的实体自动追加到本组词典（你手动取消勾选过的不追加）。
   这样不需要人工核对蓝字提示再逐个打钩；重新导出/重做本组时它们就是完整卡。 */
function dscAutoAppend(gi, hints){
  const T = ptEnsure(); T.dictPick = T.dictPick || {};
  const cur = dscPickOf(gi);
  const add = new Set(cur.add), auto = new Set(cur.auto); let n = 0;
  (hints || []).forEach(h => { if(!h || h.dropped || !h.key) return; if(!add.has(h.key)){ add.add(h.key); auto.add(h.key); n++; } });
  if(n) T.dictPick[gi] = { add: [...add], drop: cur.drop, auto: [...auto] };
  return n;
}
function dscGroupScope(gi, pickOverride){
  return dscBuild(dscGroupClue(gi), pickOverride || dscPickOf(gi), {});
}
function dscGroupStats(gi){
  try{ const r = dscGroupScope(gi); return Object.assign({ over: r.over }, r.stats); }catch(_e){ return null; }
}
/* 细化之后：哪些「只在名录里」的实体被本组章节用到了（只提示，不拦截） */
function dscDictHints(gi, plans){
  try{
    const r = dscGroupScope(gi);
    const rows = Object.keys(plans || {}).map(k => { let b = ''; try{ b = JSON.stringify(plans[k]); }catch(_e){} return { n: Number((plans[k] && plans[k].chapter) || k), blob: b }; });
    const used = r.ents.filter(e => !e.full && !e.main && e.name.length >= 2 && rows.some(x => x.blob.includes(e.name)));
    return used.slice(0, 30).map(e => ({ name: e.name, label: e.label, key: e.key, dropped: !!e.dropped,
      chapters: rows.filter(x => x.blob.includes(e.name)).map(x => x.n).filter(Number.isFinite).sort((a, b) => a - b) }));
  }catch(_e){ return []; }
}

/* ---------------------------------------------------------------- 词典增补：轻量裁剪 */
function dscSupplementScope(gi, needsText){
  const T = ptPeek() || { rough:{}, groups:{}, cards:{} };
  const g = ptAssignment().groups[gi]; if(!g) return null;
  const P = scState().principal || {}, tgs = P.teacherGroupStrategies || [];
  const tg = tgs.find(x => String(x.teacherCode || '') === String(g.teacherCode || '')) || tgs[gi] || null;
  let tgText = ''; try{ tgText = JSON.stringify(tg || {}); }catch(_e){}
  const clue = [String(needsText || ''), dscRoughRows(T, Number(g.startChapter), Number(g.endChapter)), tgText].join('\n');
  const r = dscBuild(clue, dscPickOf(gi), {});
  const fullKeys = new Set(r.ents.filter(e => e.full).map(e => e.key));
  const fullNames = new Set(r.ents.filter(e => e.full).map(e => e.name));
  const listed = r.ents.filter(e => !e.full);
  const lines = [];
  DSC_CATS.forEach(([cat, label]) => {
    const arr = listed.filter(e => e.cat === cat);
    if(arr.length) lines.push(`${label}：` + arr.map(e => e.brief ? `${e.name}（${e.brief}）` : e.name).join('；'));
  });
  return {
    isFull: (cat, name) => fullKeys.has(cat + ':' + String(name || '').trim()),
    nameFull: name => fullNames.has(String(name || '').trim()),
    listText: lines.join('\n'), listCount: listed.length, fullCount: fullKeys.size
  };
}

/* ---------------------------------------------------------------- 界面：本组词典选择 */
function dscOpenPicker(gi){
  try{ ptEnsureStyle(); }catch(_e){}
  const g = ptAssignment().groups[gi]; if(!g) return;
  const saved = dscPickOf(gi);
  const pick = { add: new Set(saved.add), drop: new Set(saved.drop) };
  const autoSet = new Set(saved.auto || []);
  const clue = dscGroupClue(gi);
  let q = '';
  const ov = document.createElement('div'); ov.className = 'gs-overlay pt-overlay';
  ov.innerHTML = `<div class="gs-modal pt-modal" role="dialog" aria-modal="true">
    <div class="gs-modal-head" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div><b>📖 本组词典 · 第${gi + 1}组</b><span class="muted" style="margin-left:8px;font-size:11px">第${g.startChapter}-${g.endChapter}章 · 勾选=给校长完整卡，不勾=只在名录</span></div>
      <button type="button" class="gs-x" data-dsc-close>✕</button></div>
    <div style="padding:8px 16px 0;flex:0 0 auto"><div data-dsc-sum style="font-size:12px;margin-bottom:6px"></div>
      <input type="text" data-dsc-q placeholder="搜索名称…" style="width:100%;box-sizing:border-box;padding:6px 8px;font-size:13px"></div>
    <div data-dsc-list style="padding:6px 16px;flex:1;min-height:0;overflow:auto"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end;padding:8px 16px 16px;flex:0 0 auto;flex-wrap:wrap" data-dsc-btns></div></div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.querySelector('[data-dsc-close]').onclick = close;
  ov.addEventListener('mousedown', e => { if(e.target === ov) close(); });
  const listEl = ov.querySelector('[data-dsc-list]'), sumEl = ov.querySelector('[data-dsc-sum]');
  const view = () => {
    const top = listEl.scrollTop;
    const r = dscBuild(clue, { add:[...pick.add], drop:[...pick.drop] }, {});
    const s = r.stats;
    sumEl.innerHTML = `完整 <b>${s.full}</b> 条 · 名录/精简 <b>${s.listed}</b> 条 · 约 <b>${s.chars}</b> 字（上限 ${r.budget}）${s.trimmed ? `<span style="color:#d97706"> · ${s.trimmed}个因超限被自动降级</span>` : ''}${r.over ? '<span style="color:#dc2626"> · ⚠ 仍超上限（手动追加的不会被自动降级）</span>' : ''}`;
    let html = '';
    DSC_CATS.forEach(([cat, label]) => {
      const arr = r.ents.filter(e => e.cat === cat && (!q || e.name.includes(q)));
      if(!arr.length) return;
      html += `<div style="font-weight:700;font-size:12px;margin:8px 0 2px">${esc(label)}（${arr.length}）</div>` + arr.map(e => {
        const tag = e.full ? ((e.tier === 'manual' && autoSet.has(e.key)) ? '自动追加' : DSC_TIER_TAG[e.tier]) : (e.dropped ? '已取消' : (e.trimmed ? '超限已降级' : (e.main ? '精简行' : '名录')));
        return `<label style="display:flex;gap:6px;align-items:center;padding:2px 0;font-size:13px"><input type="checkbox" data-k="${esc(e.key)}"${e.full ? ' checked' : ''}><span>${esc(e.name)}</span><span class="muted" style="font-size:11px">${esc(tag)} · ${e.size}字</span></label>`;
      }).join('');
    });
    listEl.innerHTML = html || '<div class="muted" style="font-size:12px;padding:8px 0">没有匹配的词典实体</div>';
    listEl.scrollTop = top;
  };
  listEl.addEventListener('change', e => {
    const cb = e.target.closest && e.target.closest('input[data-k]'); if(!cb) return;
    const k = cb.dataset.k;
    if(cb.checked){ pick.drop.delete(k); pick.add.add(k); } else { pick.add.delete(k); pick.drop.add(k); }
    view();
  });
  ov.querySelector('[data-dsc-q]').addEventListener('input', e => { q = String(e.target.value || '').trim(); view(); });
  const bar = ov.querySelector('[data-dsc-btns]');
  const mk = (label, primary, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (primary ? ' primary' : ''); b.textContent = label; b.onclick = fn; bar.appendChild(b); };
  mk('恢复自动', false, () => { pick.add.clear(); pick.drop.clear(); view(); });
  mk('保存', true, () => {
    const T = ptEnsure(); T.dictPick = T.dictPick || {};
    if(!pick.add.size && !pick.drop.size) delete T.dictPick[gi];
    else T.dictPick[gi] = { add:[...pick.add], drop:[...pick.drop], auto:[...autoSet].filter(k => pick.add.has(k)) };
    persist(); ptRefresh();
    const st = T.groups && T.groups[gi];
    toast(st && st.raw ? '本组词典选择已保存；需要重新「细化本组」才会生效' : '本组词典选择已保存');
    close();
  });
  view();
}
