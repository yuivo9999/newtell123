/* A-06 章节任务过载预警（软提示，不调 AI，不改任何成果，不挡任何操作）
   触发场景：全书章数少而事件多，校长把过多事件塞进同一章（606 运行的第 3 章）。
   做法：从校长计划的「核心事件」（粗章表阶段用「目标」）里数出本章有几件事，对照本章目标字数判断；
   另有全书层面的「章数偏少、事件偏多」提示。入口：校长面板常驻提示块、生成/细化后的 toast 后缀、章节体检。
   依赖（均在 app.js / principal-tiered.js 中）：scState、chapterLenBounds、ptAssignment、esc、toast。
   所有对外函数都对缺失依赖/脏数据容错，出错一律返回空（绝不影响校长流程）。 */
(function(){
  'use strict';

  /* ---------- 阈值 ---------- */
  // 按本章目标字数（取区间上限 hi）决定「偏重」线：3600 字 → 4 件；每多 900 字多容 1 件。
  function owThresholds(){
    var hi = 3600;
    try{ if(typeof chapterLenBounds === 'function'){ var b = chapterLenBounds(); if(b && b.hi > 0) hi = b.hi; } }catch(_e){}
    var heavy = Math.max(4, Math.ceil(hi / 900));
    return { heavy: heavy, overload: heavy + 2, hi: hi, lo: (function(){ try{ return chapterLenBounds().lo; }catch(_e){ return hi; } })() };
  }
  var OW_BOOK_MAX_CHAPTERS = 15;   // 全书层「章数偏少」：总章数 ≤ 15
  var OW_BOOK_AVG = 3.5;           // 平均每章 ≥ 3.5 件
  var OW_BOOK_SHARE = 0.4;         // 或 ≥ 40% 的章偏重/过载

  /* ---------- 数事件（纯函数） ---------- */
  // 事件边界：句号/分号/换行、箭头、①②…、以及「随后/然后/接着/最终/次日…」这类先后连接词。
  // 不按逗号切（逗号常是同一件事内部的停顿），所以结果偏保守。
  var CONNECT = /(?:，|,|、)?(?:随后|然后|接着|紧接着|紧跟着|继而|而后|之后|此后|接下来|与此同时|同时|并且|转而|最终|最后|终于|当晚|次日|翌日|第二天|数日后|几日后|三日后|当夜)/g;
  function owSplitEvents(text){
    var s = String(text == null ? '' : text).replace(/\r\n?/g, '\n').trim();
    if(!s) return [];
    s = s.replace(/[①②③④⑤⑥⑦⑧⑨⑩]/g, '；')
         .replace(/(?:→|->|=>|⇒|＞|＞＞|—>|——>)/g, '；')
         .replace(CONNECT, '；');
    var parts = s.split(/[；;。！？!?\n]+/).map(function(x){ return x.replace(/^[\s，,、:：\-—·•*\d.]+|[\s，,、]+$/g, ''); });
    return parts.filter(function(x){ return x.replace(/[\s，,、“”"'‘’（）()]/g, '').length >= 4; });
  }
  function owLevel(n, th){
    th = th || owThresholds();
    return n >= th.overload ? 'overload' : (n >= th.heavy ? 'heavy' : 'ok');
  }
  // 单章：plan 为校长计划（normalizePrincipalChapterPlan 的结果，或粗章表 plan）
  function owChapterLoad(plan, th){
    th = th || owThresholds();
    var p = plan || {};
    var core = String(p.coreEvent || '').trim();
    var src = core ? 'coreEvent' : 'goal';
    var parts = owSplitEvents(core || p.goal || '');
    return { chapter: Number(p.chapter) || 0, title: String(p.title || '').trim(), events: parts.length, parts: parts, level: owLevel(parts.length, th), src: src };
  }

  /* ---------- 全书扫描 ---------- */
  function owPlans(){
    try{
      var P = (typeof scState === 'function' && scState().principal) || null;
      return (P && P.plans && typeof P.plans === 'object') ? P.plans : {};
    }catch(_e){ return {}; }
  }
  function owTotal(){
    try{
      var P = scState().principal;
      var t = Number(P && P.targetChapterCount) || (typeof principalTargetChapterCount === 'function' ? Number(principalTargetChapterCount()) : 0);
      if(t > 0) return t;
    }catch(_e){}
    return Object.keys(owPlans()).length;
  }
  function owScan(plansIn, totalIn){
    var th = owThresholds();
    var plans = plansIn || owPlans();
    var total = Number(totalIn) || owTotal();
    var rows = [];
    Object.keys(plans).map(Number).filter(function(n){ return n >= 1 && (!total || n <= total); }).sort(function(a, b){ return a - b; }).forEach(function(n){
      var p = plans[n]; if(!p || typeof p !== 'object') return;
      var r = owChapterLoad(Object.assign({}, p, { chapter: n }), th);
      rows.push(r);
    });
    var flagged = rows.filter(function(r){ return r.level !== 'ok'; });
    var sum = rows.reduce(function(a, r){ return a + r.events; }, 0);
    var avg = rows.length ? sum / rows.length : 0;
    var share = rows.length ? flagged.length / rows.length : 0;
    var squeezed = !!(total && total <= OW_BOOK_MAX_CHAPTERS && rows.length >= 2 && (avg >= OW_BOOK_AVG || share >= OW_BOOK_SHARE));
    return { th: th, total: total, rows: rows, flagged: flagged, avg: Math.round(avg * 10) / 10, squeezed: squeezed };
  }

  /* ---------- 文案 ---------- */
  function owBrief(r){
    return '第' + r.chapter + '章' + (r.title ? '《' + r.title + '》' : '');
  }
  function owChapterLine(r, th){
    var lv = r.level === 'overload' ? '任务过载' : '任务偏重';
    var shown = r.parts.slice(0, 6).map(function(x, i){ return '①②③④⑤⑥'[i] + (x.length > 14 ? x.slice(0, 14) + '…' : x); }).join(' ');
    return owBrief(r) + lv + '：约 ' + r.events + ' 件事（目标 ' + th.lo + '–' + th.hi + ' 字，建议 ≤ ' + (th.heavy - 1) + ' 件）。' + shown;
  }
  function owBookLine(s){
    return '全书仅 ' + s.total + ' 章，平均每章约 ' + s.avg + ' 件事，章数偏少而事件偏多：可增加全书章数，或让校长删减/合并事件。';
  }
  var OW_ADVICE = '处理方式：拆成两章、把其中几件移到相邻章，或点「📋 读校长成果 / 读本组」直接改该章「核心事件」；也可忽略（仅提示，不影响生成）。';

  /* ---------- 对外：文本/HTML ---------- */
  // 纯文本行（给 toast / 体检 / 导出用）
  function owLines(scan){
    var s = scan || owScan(), out = [];
    if(s.squeezed) out.push(owBookLine(s));
    s.flagged.forEach(function(r){ out.push(owChapterLine(r, s.th)); });
    return out;
  }
  // 校长面板常驻块（无问题返回空串）。不含任何按钮，不影响回填口原则。
  function owPanelHtml(){
    try{
      var s = owScan(); if(!s.flagged.length && !s.squeezed) return '';
      var e = (typeof esc === 'function') ? esc : function(x){ return String(x); };
      var html = '<div data-ow-panel style="margin:6px 0;padding:6px 8px;border:1px dashed #d97706;border-radius:8px;font-size:12px">';
      html += '<div style="color:#d97706;font-weight:600">⚠ 章节任务过载预警（' + s.flagged.length + ' 章）</div>';
      if(s.squeezed) html += '<div style="margin:3px 0">' + e(owBookLine(s)) + '</div>';
      s.flagged.slice(0, 8).forEach(function(r){ html += '<div style="margin:3px 0">' + e(owChapterLine(r, s.th)) + '</div>'; });
      if(s.flagged.length > 8) html += '<div class="muted">…另有 ' + (s.flagged.length - 8) + ' 章偏重（共 ' + s.flagged.length + ' 章）</div>';
      html += '<div class="muted" style="margin-top:3px">' + e(OW_ADVICE) + '</div></div>';
      return html;
    }catch(_e){ return ''; }
  }
  // toast 后缀：「；⚠ 任务偏重：第3、5章（见校长面板）」，无问题返回 ''
  function owToastNote(){
    try{
      var s = owScan(); if(!s.flagged.length && !s.squeezed) return '';
      var parts = [];
      if(s.flagged.length) parts.push('任务偏重：第' + s.flagged.slice(0, 6).map(function(r){ return r.chapter; }).join('、') + (s.flagged.length > 6 ? '…' : '') + '章');
      if(s.squeezed) parts.push('章数偏少而事件偏多');
      return '；⚠ ' + parts.join('，') + '（见校长面板）';
    }catch(_e){ return ''; }
  }
  // 章节体检：本章计划是否偏重（返回 {level,label,detail} 或 null）
  function owChapterHealth(chapterNo){
    try{
      var s = owScan();
      var r = s.rows.filter(function(x){ return x.chapter === Number(chapterNo); })[0];
      if(!r || r.level === 'ok') return null;
      return { level: 'note', label: '校长计划里本章任务偏重', detail: owChapterLine(r, s.th) };
    }catch(_e){ return null; }
  }
  function owRefreshPanel(){
    try{ if(typeof ptRefresh === 'function') ptRefresh(); }catch(_e){}
  }

  window.owSplitEvents = owSplitEvents;
  window.owChapterLoad = owChapterLoad;
  window.owThresholds = owThresholds;
  window.owScan = owScan;
  window.owLines = owLines;
  window.owPanelHtml = owPanelHtml;
  window.owToastNote = owToastNote;
  window.owChapterHealth = owChapterHealth;
  window.owRefreshPanel = owRefreshPanel;
})();
