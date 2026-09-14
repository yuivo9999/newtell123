/* v51 App Shell */
(function(){
  'use strict';
  const $ = (s, r = document) => (r || document).querySelector(s);
  const $$ = (s, r = document) => [...(r || document).querySelectorAll(s)];
  const state = () => window.TellMeLegacyShared?.state || window.state || {};
  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  const groups = [
    ['overview', '⌂', '创作总览', '作品状态与下一步'],
    ['story', '✦', '故事河流', '构想 · 配方 · 节拍'],
    ['world', '◎', '世界设定', '人物 · 地点 · 专名'],
    ['timeline', '◷', '时间线', '全局时间与章节落点'],
    ['foreshadow', '◇', '伏笔', '埋设 · 强化 · 回收'],
    ['writing', '▤', '正文写作', '章节与阅读器'],
    ['runtime', '⌘', 'Runtime', '事件 · 状态 · 因果']
  ];

  function st(s) {
    const o = s.outline || {};
    const g = o.glossary || {};
    const rt = o._storyState?.runtime || s.runtime || {};
    const ch = Array.isArray(s.chapters) ? s.chapters : [];
    const p = Array.isArray(o.chapterPlans) ? o.chapterPlans : [];
    const w = ch.filter(c => String(c?.content || '').trim()).length;
    return {
      o, g, rt, ch, p, w,
      chars: (g.characters || s.characters || []).length,
      places: (g.places || []).length,
      proper: (g.propernouns || []).length
    };
  }

  function rt(s) {
    return s.outline?._storyState?.runtime || s.runtime || { events: [], knowledge: [], transitions: [], causality: [], foreshadowing: [] };
  }

  function title(s) {
    return String(s.outline?.title || s.idea || '未命名作品').trim().slice(0, 60);
  }

  function legacy(n, sel) {
    showLegacy();
    const b = $(`.tab[data-step="${n}"]`);
    if (b) b.click();
    setTimeout(() => {
      const e = $(sel);
      if (e) {
        try { e.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) { e.scrollIntoView(true); }
        e.classList.add('gs-flash');
        setTimeout(() => e.classList.remove('gs-flash'), 1200);
      }
    }, 60);
  }

  function showLegacy() {
    $('#suCanvas')?.classList.add('hidden');
    $('#view')?.classList.remove('su-legacy-hidden');
    closeNavDrawer();
  }

  function openPanel(id) {
    showLegacy();
    const el = $(id);
    if (el) el.classList.remove('hidden');
  }

  function overview(s) {
    const x = st(s), tl = x.o._globalTimeline;
    return `<div class="su-page">
      <div class="su-hero">
        <div>
          <div class="su-kicker">CREATIVE CONTROL</div>
          <h1>${esc(title(s))}</h1>
          <p>故事、世界、时间、伏笔与正文统一到一个真正可用的工作台。</p>
        </div>
        <button class="su-primary" data-a="writing">继续写作</button>
      </div>
      <div class="su-stat-grid">
        <button data-a="story"><b>${x.p.length}</b><span>章节规划</span></button>
        <button data-a="writing"><b>${x.w}</b><span>已写章节</span></button>
        <button data-a="world"><b>${x.chars}</b><span>人物事实</span></button>
        <button data-a="timeline"><b>${tl?.chapters?.length || 0}</b><span>时间锚</span></button>
      </div>
      <section class="su-panel">
        <div class="su-panel-head">
          <div><b>创作进度</b><small>下一目标：第 ${x.w + 1} 章</small></div>
          <span class="su-status ${x.w ? 'ok' : ''}">${x.w ? '持续创作中' : '尚未开始正文'}</span>
        </div>
        <div class="su-progress">
          <i style="width:${Math.min(100, Math.round(x.w / Math.max(1, x.p.length || 1) * 100))}%"></i>
        </div>
        <div class="su-row"><span>构想</span><span>${s.idea ? '已建立' : '待建立'}</span></div>
        <div class="su-row"><span>世界词典</span><span>${x.chars + x.places + x.proper} 条事实</span></div>
        <div class="su-row"><span>时间合同</span><span>${tl ? '已生成' : '待生成'}</span></div>
      </section>
    </div>`;
  }

  function story(s) {
    const x = st(s);
    const rows = x.p.slice(0, 50).map((p, i) =>
      `<button class="su-list-row" data-a="plan">
        <span class="su-num">${i + 1}</span>
        <div>
          <b>${esc(p?.title || p?.chapterTitle || '第' + (i + 1) + '章')}</b>
          <small>${esc(String(p?.beatsText || p?.summary || '尚未填写本章推进骨架').slice(0, 120))}</small>
        </div>
        <em>${i < x.w ? '已写' : '规划中'}</em>
      </button>`
    ).join('');
    return `<div class="su-page">
      <div class="su-page-title">
        <div>
          <div class="su-kicker">STORY RIVER</div>
          <h2>故事河流</h2>
          <p>按章节查看从规划到正文的真实推进。</p>
        </div>
        <button class="su-primary" data-a="legacy-story">打开编辑器</button>
      </div>
      <section class="su-panel">
        <div class="su-panel-head">
          <div><b>章节推进</b><small>${x.p.length} 章规划 · ${x.w} 章已有正文</small></div>
        </div>
        <div class="su-list">${rows || '<div class="su-empty">还没有章节规划。</div>'}</div>
      </section>
    </div>`;
  }

  function world(s) {
    const x = st(s);
    const cs = [['人物', x.g.characters || s.characters || []], ['地点', x.g.places || []], ['专名', x.g.propernouns || []]];
    return `<div class="su-page">
      <div class="su-page-title">
        <div>
          <div class="su-kicker">WORLD ATLAS</div>
          <h2>世界设定</h2>
          <p>这里直接读取词典事实；编辑仍由原词典工作区写回。</p>
        </div>
        <button class="su-primary" data-a="legacy-dict">打开词典</button>
      </div>
      <div class="su-world-grid">
        ${cs.map(c => `<section class="su-panel">
          <div class="su-panel-head"><div><b>${c[0]}</b><small>${c[1].length} 条</small></div></div>
          <div class="su-chips">${c[1].slice(0, 30).map(v => `<span>${esc(v?.name || v?.label || v)}</span>`).join('') || '<i>暂无已建立事实</i>'}</div>
        </section>`).join('')}
      </div>
    </div>`;
  }

  function timeline(s) {
    const x = st(s), tl = x.o._globalTimeline, a = Array.isArray(tl?.chapters) ? tl.chapters : [];
    return `<div class="su-page">
      <div class="su-page-title">
        <div>
          <div class="su-kicker">TIMELINE CONTRACT</div>
          <h2>时间线</h2>
          <p>以全局时间锚观察章节起止覆盖。</p>
        </div>
        <button class="su-primary" data-a="legacy-timeline">进入时间工具</button>
      </div>
      <section class="su-panel">
        <div class="su-panel-head">
          <div><b>全局时间锚</b><small>${a.length} 个章节落点</small></div>
          <span class="su-status ${tl ? 'ok' : ''}">${tl ? '已生成' : '未生成'}</span>
        </div>
        ${a.slice(0, 60).map((v, i) => `<div class="su-time-row">
          <span>第${Number(v?.index ?? i) + 1}章</span>
          <div><b>${esc(v?.from || '未标注起点')}</b><i>→</i><b>${esc(v?.to || v?.end || '未标注终点')}</b></div>
        </div>`).join('') || '<div class="su-empty">尚无章节时间锚。</div>'}
      </section>
    </div>`;
  }

  function foreshadow(s) {
    const a = (rt(s).foreshadowing || []).slice().reverse().slice(0, 50);
    return `<div class="su-page">
      <div class="su-page-title">
        <div>
          <div class="su-kicker">PLOT DEBT</div>
          <h2>伏笔</h2>
          <p>直接读取 Novel Runtime 的伏笔生命周期。</p>
        </div>
        <button class="su-primary" data-a="legacy-writing">查看正文</button>
      </div>
      <section class="su-panel">
        <div class="su-panel-head"><div><b>伏笔生命周期</b><small>${a.length} 条记录</small></div></div>
        <div class="su-list">${a.map(f => `<div class="su-list-row static">
          <span class="su-num">◇</span>
          <div><b>${esc(f.summary || f.id || '未命名伏笔')}</b><small>第${esc(f.chapterId || f.chapter || '?')}章 · ${esc(f.evidence || '暂无证据')}</small></div>
          <em>${esc(f.status || 'UNKNOWN')}</em>
        </div>`).join('') || '<div class="su-empty">暂无 Runtime 伏笔记录。</div>'}</div>
      </section>
    </div>`;
  }

  function writing() {
    return `<div class="su-page">
      <div class="su-page-title">
        <div>
          <div class="su-kicker">WRITING DESK</div>
          <h2>正文写作</h2>
          <p>原正文编辑器继续负责生成、连续性、阅读与结算。</p>
        </div>
        <button class="su-primary" data-a="legacy-writing">进入正文作家</button>
      </div>
      <section class="su-panel">
        <button class="su-big-action" data-a="legacy-writing">打开正文作家 <span>→</span></button>
      </section>
    </div>`;
  }

  function runtimePage(s) {
    const r = rt(s), ks = [['events', '事件'], ['knowledge', '知识边界'], ['transitions', '状态迁移'], ['causality', '因果链接'], ['foreshadowing', '伏笔']];
    return `<div class="su-page">
      <div class="su-page-title">
        <div>
          <div class="su-kicker">NOVEL RUNTIME</div>
          <h2>Runtime</h2>
          <p>事件、知识、状态迁移、因果与伏笔的真实运行时数据。</p>
        </div>
        <button class="su-primary" data-a="legacy-narrative">打开叙事引擎</button>
      </div>
      <div class="su-stat-grid su-runtime-stats">
        ${ks.map(k => `<div><b>${Array.isArray(r[k[0]]) ? r[k[0]].length : 0}</b><span>${k[1]}</span></div>`).join('')}
      </div>
      <section class="su-panel">
        <div class="su-panel-head"><div><b>最新事件</b><small>按结算顺序展示</small></div></div>
        <div class="su-list">${(r.events || []).slice().reverse().slice(0, 20).map(e => `<div class="su-list-row static">
          <span class="su-num">${esc(e.chapterId || '—')}</span>
          <div><b>${esc(e.summary || e.type || '事件')}</b><small>${esc(e.time || '未标注时间')}</small></div>
          <em>${esc(e.type || 'OTHER')}</em>
        </div>`).join('') || '<div class="su-empty">暂无 Runtime 事件。</div>'}</div>
      </section>
    </div>`;
  }

  function isNavOpen() {
    const app = $('#app');
    if (!app) return false;
    const isMobile = window.innerWidth <= 680;
    if (isMobile) {
      return app.classList.contains('su-nav-open');
    } else {
      return !app.classList.contains('su-nav-closed');
    }
  }

  function closeNavDrawer() {
    const app = $('#app');
    if (!app) return;
    const isMobile = window.innerWidth <= 680;
    if (isMobile) {
      app.classList.remove('su-nav-open');
    } else {
      app.classList.add('su-nav-closed');
    }
  }

  function openNavDrawer() {
    const app = $('#app');
    if (!app) return;
    const isMobile = window.innerWidth <= 680;
    if (isMobile) {
      app.classList.add('su-nav-open');
    } else {
      app.classList.remove('su-nav-closed');
    }
  }

  function toggleNavDrawer() {
    if (isNavOpen()) {
      closeNavDrawer();
    } else {
      openNavDrawer();
    }
  }

  function promptAndToggleMode() {
    const s = state();
    const current = s.mode;
    const isLongNow = (current === 'longnovel' || current !== 'shortfilm');
    const currentName = isLongNow ? '📚 长篇小说模式' : '🎬 普通小说模式';
    const targetName = isLongNow ? '🎬 普通小说模式' : '📚 长篇小说模式';
    const detailDesc = isLongNow 
      ? '切换为【普通小说模式】后，底部导航栏将包含 5 个页面（故事、角色、场景、分镜、导出）。'
      : '切换为【长篇小说模式】后，底部导航栏将精简为 3 个页面（故事、场景、导出）。';

    let modal = $('#suModeModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'suModeModal';
      modal.className = 'su-modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="su-modal-card">
        <div class="su-modal-head">
          <span>⚙ 切换小说创作模式</span>
          <button class="su-modal-close" type="button" aria-label="关闭">✕</button>
        </div>
        <div class="su-modal-body">
          <p>当前处于：<b>${currentName}</b></p>
          <p>确定要切换至：<b style="color:#8f78ff">${targetName}</b> 吗？</p>
          <div class="su-modal-tip">${detailDesc}</div>
        </div>
        <div class="su-modal-foot">
          <button class="su-modal-cancel" type="button">取消</button>
          <button class="su-modal-confirm" type="button">确认切换</button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const close = () => modal.classList.remove('active');
    $('.su-modal-close', modal).onclick = close;
    $('.su-modal-cancel', modal).onclick = close;
    $('.su-modal-confirm', modal).onclick = () => {
      close();
      toggleMode();
    };
  }

  function updateModeBadgeUI() {
    const badge = $('#modeBadge');
    if (!badge) return;
    const s = state();
    const isLongMode = s.mode === 'longnovel' || s.mode !== 'shortfilm';
    badge.textContent = isLongMode ? '📚 长篇小说模式' : '🎬 普通小说模式';
  }

  function toggleMode() {
    const s = state();
    const current = s.mode;
    const nextMode = (current === 'longnovel' || current !== 'shortfilm') ? 'shortfilm' : 'longnovel';
    s.mode = nextMode;
    if (typeof window.TellMeLegacyShared?.persist === 'function') {
      window.TellMeLegacyShared.persist();
    }
    if (typeof window.TellMeLegacyShared?.render === 'function') {
      window.TellMeLegacyShared.render();
    }
    updateModeBadgeUI();
    if (typeof window.toast === 'function') {
      window.toast(nextMode === 'longnovel' ? '已切换至 📚 长篇小说模式（底部保留：故事/场景/导出）' : '已切换至 🎬 普通小说模式（底部包含：故事/角色/场景/分镜/导出）');
    }
  }

  function page(id) {
    // Close drawer on selection
    closeNavDrawer();

    // Direct tab mappings to core workspace sections
    if (id === 'story') return legacy(1, '[data-flow="3"]');
    if (id === 'world') return legacy(2, '#glossarySection');
    if (id === 'timeline') return legacy(3, '#timelineSection');
    if (id === 'foreshadow') return legacy(4, '#foreshadowSection');
    if (id === 'writing') return legacy(5, '#exportSection');

    const s = state(), c = $('#suCanvas');
    if (!c) return;
    // Un-hide canvas and hide legacy view when navigating in App Shell sub-pages (overview, runtime)
    c.classList.remove('hidden');
    $('#view')?.classList.add('su-legacy-hidden');

    const f = { overview, runtime: runtimePage }[id] || overview;
    c.innerHTML = f(s);
    $$('.su-nav-item').forEach(b => b.classList.toggle('active', b.dataset.nav === id));
    $$('[data-a]', c).forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if (['overview', 'runtime'].includes(a)) {
        page(a);
        return;
      }
      if (a === 'story' || a === 'legacy-story') return legacy(1, '[data-flow="3"]');
      if (a === 'world' || a === 'legacy-dict') return legacy(2, '#glossarySection');
      if (a === 'timeline' || a === 'legacy-timeline') return legacy(3, '#timelineSection');
      if (a === 'foreshadow') return legacy(4, '#foreshadowSection');
      if (a === 'writing' || a === 'legacy-writing') return legacy(5, '#exportSection');
      if (a === 'legacy-narrative') {
        openPanel('#narrativeEnginePanel');
        return;
      }
      if (a === 'plan') return legacy(3, '#timelineSection');
    });
  }

  function shell() {
    if ($('#suShell')) return;
    const app = $('#app');
    if (!app) return;

    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = new URL('assets/app-shell.css?v=3', window.location.href).href;
    document.head.appendChild(l);

    const e = document.createElement('aside');
    e.id = 'suShell';
    e.className = 'su-shell';
    e.innerHTML = `<div class="su-shell-head">
      <div class="su-mark">N</div>
      <div><b>NEWTELL123</b><small>STORY WORKSPACE</small></div>
      <button class="su-collapse" aria-label="关闭导航">‹</button>
    </div>
    <nav class="su-nav">
      ${groups.map(g => `<button class="su-nav-item" data-nav="${g[0]}">
        <span>${g[1]}</span>
        <div><b>${g[2]}</b><small>${g[3]}</small></div>
      </button>`).join('')}
    </nav>
    <div class="su-shell-foot">
      <button data-sys="history">↶ <span>历史</span></button>
      <button data-sys="settings">⚙ <span>设置</span></button>
    </div>`;

    app.insertBefore(e, app.firstChild);

    // Bind header nav toggle button
    const navBtn = $('#btnNavToggle');
    if (navBtn) {
      navBtn.onclick = toggleNavDrawer;
    }

    // Bind header brand title click to promptAndToggleMode
    const brandTitle = $('#brandTitle') || $('.brand .title') || $('.brand');
    if (brandTitle) {
      brandTitle.addEventListener('click', (e) => {
        if (e.target && e.target.classList && e.target.classList.contains('ver-badge')) return;
        if (e.target && (e.target.id === 'btnNavToggle' || e.target.classList.contains('nav-toggle-btn'))) return;
        promptAndToggleMode();
      });
    }

    const c = document.createElement('section');
    c.id = 'suCanvas';
    c.className = 'su-canvas';
    const v = $('#view');
    v.parentNode.insertBefore(c, v);

    $$('.su-nav-item', e).forEach(b => b.onclick = () => page(b.dataset.nav));
    $('.su-collapse', e).onclick = toggleNavDrawer;
    $('[data-sys="history"]', e).onclick = () => {
      showLegacy();
      if (typeof window.openHistPanel === 'function') {
        window.openHistPanel();
      } else {
        $('#btnHist')?.click();
      }
    };
    $('[data-sys="settings"]', e).onclick = () => {
      showLegacy();
      $('#btnSettings')?.click();
    };

    // Bind tab clicks to switch view to legacy workspace smoothly
    $$('.tab').forEach(t => {
      t.addEventListener('click', () => {
        showLegacy();
        closeNavDrawer();
      });
    });

    // Click outside side menu to auto collapse
    document.addEventListener('click', (ev) => {
      if (!isNavOpen()) return;
      const target = ev.target;
      if (!target) return;
      const shellEl = $('#suShell');
      if (shellEl && shellEl.contains(target)) return;
      if (target.closest && (target.closest('#btnNavToggle') || target.closest('.nav-toggle-btn') || target.closest('.su-collapse'))) return;
      closeNavDrawer();
    }, true);

    page('overview');
  }

  function init() {
    shell();
    window.addEventListener('tellme:ready', () => page('overview'));
    window.addEventListener('tellme:state-updated', () => {
      const active = $('.su-nav-item.active')?.dataset.nav || 'overview';
      page(active);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.TellMeAppShell = {
    go: page,
    refresh: () => page($('.su-nav-item.active')?.dataset.nav || 'overview')
  };
})();
