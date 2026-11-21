/* ================================================================
 * dict-supplement.js · v1.0.593 · 词典增补 + 词典充实「剧情泄漏」清理（v1.0.593：「读增补成果」按组保存并回填原文）
 *
 * ① 剧情泄漏清理：词典只写“世界里有什么”，不写主角之后做什么。
 *    提示词已有「开篇状态原则」，但 AI 仍会写出“第一个助人任务的帮扶对象”“被主角塞过半块饼”之类。
 *    这里在入库前按句扫描新增条目：句子里出现基础主要人物名 + 事件/将来措辞（或明显的将来措辞）就剔除该句，
 *    被剔除的内容记入 state.outline._dictEnrichLeakLog，可在日志里复核。基础词典（Foundation）永不改动。
 * ② 词典增补：长篇会不断出现新人物/新地点。每个老师组细化后，校长可列出「本组需要的新实体清单」，
 *    用户手动「注入导出 → 外部AI → 读增补成果」（或点 AI 生成），结果以 enrichment 并入词典，
 *    不会触发词典充实的“下游失效”，也不改已有实体。
 * 依赖 app.js 与 principal-tiered.js 的全局函数。
 * ================================================================ */
const DS_FUTURE_RE = /(第[一二三四五六七八九十\d]+个(?:助人)?(?:任务|委托|目标|对象)|任务对象|帮扶对象|救助对象|(?:将|会|要|终将|必将|日后|后来|之后|随后|未来|稍后)(?:会|要|被|成为|变成|遇到|发生|与|和|向|对|给|帮|救|杀|骗)|成为(?:主角|她|他)的?(?:伙伴|盟友|对手|仆人|手下|恩人)|为(?:主角|她|他)(?:所|带来|提供)|主角的?(?:第[一二三四五六七八九十\d]+|首个))/;
const DS_EVENT_RE = /(?:被[^，。；;、]{0,10}(?:塞|救|帮|骗|杀|打|欺|收留|收买|劝|赶|抢)|(?:塞|救|帮|给|送|借|教|骂|打|救|收留|收买|骗|抢)过|曾经[^，。；;]{0,10}(?:帮|救|给|送)|私下[^，。；;]{0,6}(?:给|塞|送|帮))/;
const DS_SKIP_FIELDS = new Set(['name','id','tier','sourceType','tags','type','category','gender','age','scope','stance']);
function dsCoreNames(){
  try{
    const g = ensureGlossaryKnowledgeShape((state.outline && state.outline.glossary) || {});
    return (g.characters || []).filter(c => c && String(c.name||'').trim() && c.tier !== 'support' && !isGlossaryEnrichment(g,'characters',c)).map(c => String(c.name).trim());
  }catch(_e){ return []; }
}
function dictEnrichStripLeaks(parsed){
  const log = [];
  if(!parsed || typeof parsed !== 'object') return log;
  const names = dsCoreNames();
  const hasName = s => names.some(n => n && s.includes(n));
  Object.keys(parsed).forEach(cat => {
    const arr = parsed[cat]; if(!Array.isArray(arr)) return;
    arr.forEach(it => {
      if(!it || typeof it !== 'object') return;
      Object.keys(it).forEach(f => {
        if(DS_SKIP_FIELDS.has(f)) return;
        const v = it[f]; if(typeof v !== 'string' || !v.trim()) return;
        const parts = v.split(/(?<=[。；;！!？?])/);
        const keep = [], drop = [];
        parts.forEach(s => {
          const bad = DS_FUTURE_RE.test(s) || (hasName(s) && DS_EVENT_RE.test(s));
          (bad ? drop : keep).push(s);
        });
        if(drop.length){
          it[f] = keep.join('').trim();
          log.push({ cat, name:String(it.name || it.a || ''), field:f, removed:drop.join('').trim() });
        }
      });
    });
  });
  if(log.length && state.outline){
    state.outline._dictEnrichLeakLog = (state.outline._dictEnrichLeakLog || []).concat(log.map(x => Object.assign({ ts:Date.now() }, x))).slice(-300);
  }
  return log;
}

/* ---------------------------------------------------------------- 词典增补 */
const DS_EXTRA_SYS = `

━━━━━━━━━━━━━━━━━━
【本次任务：词典增补（覆盖前文“增量充实整部小说”的范围）】
━━━━━━━━━━━━━━━━━━
这不是一次完整的词典充实，而是长篇推进中的一次「增补」：用户会给出【增补清单】，列出接下来这一组章节需要的新人物/新地点/新专名/新道具/新规则。
1. 只为清单里的条目建档，不得增加清单之外的新条目；清单里已经存在于词典的实体不得重复创建、不得改写。
2. 仍然遵守「开篇状态原则」：只写这个实体“现在是什么”，不写主角之后做什么、不写事件结果、不写它在哪一章怎么用。清单里的“用途”只是需求说明，不得原样写成剧情。
3. 仍然遵守「保密事项原则」与「对基础人物的规则」；新增人物只能是次要配角或路人。
4. 输出格式与词典充实完全一致（次要配角｜路人｜地名｜专名｜组织｜机构｜道具｜规则｜术语｜事件｜生活设定｜人物关系…），只输出结构式纯文本。`;
function dsNeedsText(gi){
  const T = ptPeek(); const st = T && T.groups && T.groups[gi];
  return String((st && st.needs) || '').trim();
}
function dsBuildInjection(gi){
  const needs = dsNeedsText(gi);
  if(!needs) return null;
  const g = ptAssignment().groups[gi];
  let scope = null;
  try{ if(typeof dscSupplementScope === 'function') scope = dscSupplementScope(gi, needs); }catch(e){ console.warn('[DS] 词典裁剪失败，回退整本词典', e); }
  const user = `${buildDictEnrichUser(scope ? { scope } : undefined)}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n【增补清单｜第${gi+1}组（第${g.startChapter}-${g.endChapter}章）】\n${needs}\n\n【增补要求】只为上面清单里的条目建档；已存在于词典的实体跳过；不得写剧情；输出格式同词典充实。`;
  return { system: String(DICT_ENRICH_SYS) + DS_EXTRA_SYS, user };
}
function dsApply(gi, txt){
  const o = state.outline; if(!o) return { ok:false, error:'当前没有作品数据' };
  const text = String(txt || '').trim(); if(!text) return { ok:false, error:'增补成果不能为空' };
  const parsed = parseDictEnrichText(text) || {};
  const count = Object.values(parsed).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0);
  if(!count) return { ok:false, error:'没有解析到任何词典条目（格式需与词典充实一致）' };
  const leaks = dictEnrichStripLeaks(parsed);
  const n = mergeDictEnrich(parsed);
  ssEnsureCanonEntities(); ssProtectMasterCanon(); ssEnsureCanonEntities();
  o._dictEnrichText = (String(o._dictEnrichText || '') + '\n' + text).trim();
  const T = ptEnsure();
  T.supplements = T.supplements || {};
  T.supplements[gi] = { ts:Date.now(), count, leaks:leaks.length, raw:text.slice(0, 200000), names:[].concat(...Object.values(parsed).filter(Array.isArray).map(a => a.map(x => String(x && x.name || '')).filter(Boolean))).slice(0, 60) };
  storyState().canon.dictEnrichAt = Date.now();
  storyState().versions.dictEnrich = Number(storyState().versions.dictEnrich || 0) + 1;
  persist();
  try{ refreshGlossaryCardOnly(); refreshDictEnrichCardOnly(); }catch(_e){}
  ptRefresh();
  return { ok:true, count, leaks:leaks.length, merged:n };
}
async function dsGen(gi, btn, opts){
  const inj = dsBuildInjection(gi);
  if(!inj){ toast('增补清单为空：请先填写本组需要的新实体清单'); return false; }
  if(!(opts && opts.oneClick) && genBusy()){ toast('已有生成任务进行中，请稍候'); return false; }
  markAIRunning('dictEnrich'); if(btn) busy(btn, true, '增补中…');
  try{
    const spec = resolveActiveSpec('dictEnrich');
    const temp = (spec && spec.dictEnrichTemp != null) ? spec.dictEnrichTemp : 0.4;
    const res = await callDeepSeek(inj.system, inj.user, { temperature:temp, topP:0.6, maxTokens:clampMaxTokens('dictEnrich'), signal:_abortCtl?.signal, taskKey:'dictEnrich' });
    const r = dsApply(gi, res && res.text);
    if(!r.ok) throw new Error(r.error);
    toast(`第${gi+1}组词典增补已并入：${r.count}条${r.leaks?`；剔除疑似剧情句${r.leaks}处`:''}`);
    return true;
  }catch(e){
    if(e && e.name === 'AbortError'){ toast('已停止词典增补'); return false; }
    toast('词典增补失败：' + String(e && e.message || e)); return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running || []).filter(k => k !== 'dictEnrich');
    hideStopBtn(); if(btn) busy(btn, false);
  }
}
function dsOpen(gi){
  const g = ptAssignment().groups[gi]; if(!g) return;
  const T = ptEnsure(); const st = T.groups[gi];
  if(!st){ toast('请先细化并保存本组，再做词典增补'); return; }
  const sup = T.supplements && T.supplements[gi];
  const modal = ptOpenText({
    title:`📚 词典增补 · 第${gi+1}组（第${g.startChapter}-${g.endChapter}章）`,
    sub: sup ? `上次增补：${sup.count}条${sup.names && sup.names.length ? '（' + sup.names.slice(0, 8).join('、') + (sup.names.length > 8 ? '…' : '') + '）' : ''}` : '增补清单：每行一个新实体「名称｜类型｜客观用途」；可编辑',
    text: dsNeedsText(gi),
    buttons:[
      { label:'保存清单', onClick:(t)=>{ const T2 = ptEnsure(); if(T2.groups[gi]) T2.groups[gi].needs = String(t||'').trim(); persist(); toast('增补清单已保存'); } },
      { label:'📦 注入导出', onClick:(t)=>{ const T2 = ptEnsure(); if(T2.groups[gi]) T2.groups[gi].needs = String(t||'').trim(); persist(); const inj = dsBuildInjection(gi); if(!inj) return toast('增补清单为空'); const text = `【SYSTEM】\n${inj.system}\n\n【USER】\n${inj.user}`; ptOpenText({ title:`📦 词典增补 · 第${gi+1}组 · 注入导出`, sub:'SYSTEM + USER', text, readonly:true, buttons:[ { label:'复制', onClick:()=>{ copyText(text); toast('已复制'); } }, { label:'导出TXT', primary:true, onClick:()=>{ downloadPlainText(exportFileName('词典增补','注入',{group:gi+1}), text); toast('TXT 已导出'); } } ] }); } },
      { label:'📋 读增补成果', onClick:(t)=>{ const T2 = ptEnsure(); if(T2.groups[gi]) T2.groups[gi].needs = String(t||'').trim(); persist(); ptOpenText({ title:`📋 读增补成果 · 第${gi+1}组`, sub:(T2.supplements && T2.supplements[gi] && T2.supplements[gi].raw) ? '上次保存的增补成果已回填；同名条目不会重复并入，基础词典不会被改写' : '粘贴外部AI的输出（格式同词典充实），保存后并入词典', text:(T2.supplements && T2.supplements[gi] && T2.supplements[gi].raw) || '', buttons:[ { label:'保存更改', primary:true, onClick:(v,close)=>{ const r = dsApply(gi, v); if(!r.ok) return toast(r.error); toast(`词典增补已并入：${r.count}条${r.leaks?`；剔除疑似剧情句${r.leaks}处`:''}`); close(); } } ] }); } },
      { label:'🪄 AI生成并并入', primary:true, onClick:(t,close)=>{ const T2 = ptEnsure(); if(T2.groups[gi]) T2.groups[gi].needs = String(t||'').trim(); persist(); close(); dsGen(gi, null); } }
    ]
  });
  return modal;
}
