/**
 * tellme123 modern application bootstrap.
 *
 * v42: the core is bootstrapped by ten cohesive domain entrypoints; domain-owned
 * constants/state are exposed through one compatibility context before legacy UI. Leaf
 * modules remain internal installation seams; canonical Domain APIs are the only
 * cross-domain runtime contract.
 */
globalThis.$ = window.$ = (s, r = document) => (r || document).querySelector(s);
globalThis.$$ = window.$$ = (s, r = document) => [...(r || document).querySelectorAll(s)];

// Sandboxed iframe protection: ensure window.prompt and window.confirm don't throw DOMException
if (typeof window !== 'undefined') {
  const _origPrompt = window.prompt;
  window.prompt = function(msg, def = '') {
    try {
      return _origPrompt ? _origPrompt.call(window, msg, def) : null;
    } catch (e) {
      console.warn('[tellme123] window.prompt suppressed by environment:', e);
      return null;
    }
  };
  const _origConfirm = window.confirm;
  window.confirm = function(msg) {
    try {
      return _origConfirm ? _origConfirm.call(window, msg) : true;
    } catch (e) {
      console.warn('[tellme123] window.confirm suppressed by environment:', e);
      return true;
    }
  };
}

const loadClassic = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  const url = new URL(src, import.meta.url);
  url.searchParams.set('v', 'modern-1');
  script.src = url.href;
  script.async = false;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error(`加载失败：${url.href}`));
  document.head.appendChild(script);
});

const boot = async () => {
  const [aiDomain, storyDomain, chapterDomain, dictionaryDomain, schoolDomain,
    projectDomain, workspaceDomain, narrativeDomain, settingsDomain, runtimeDomain] = await Promise.all([
    import('./core/ai-domain.js'),
    import('./core/story-domain.js'),
    import('./core/chapter-domain.js'),
    import('./core/dictionary-domain.js'),
    import('./core/school-domain.js'),
    import('./core/project-domain.js'),
    import('./core/workspace-domain.js'),
    import('./core/narrative-domain.js'),
    import('./core/settings-domain.js'),
    import('./core/runtime-domain.js'),
  ]);

  // Direct/pure modules publish their own legacy-compatible windows where
  // appropriate; these explicit bridges cover modules that historically relied
  // on app.js to expose their namespace.
  runtimeDomain.exposeLegacyWindows();
  aiDomain.exposeLegacyWindows();
  storyDomain.exposeLegacyWindows();
  chapterDomain.exposeLegacyWindows();
  dictionaryDomain.exposeLegacyWindows();
  schoolDomain.exposeLegacyWindows();
  projectDomain.exposeLegacyWindows();
  workspaceDomain.exposeLegacyWindows();
  narrativeDomain.exposeLegacyWindows();
  settingsDomain.exposeLegacyWindows();

  // v41: legacy top-level business constants/state are now owned by their
  // canonical domains. Build one immutable compatibility context before the
  // classic UI script is evaluated; legacy code keeps lexical aliases only.
  window.TellMeLegacyShared = Object.assign({},
    projectDomain.legacyContext,
    chapterDomain.legacyContext,
    aiDomain.legacyContext,
    workspaceDomain.legacyContext,
    schoolDomain.legacyContext,
    storyDomain.legacyContext,
    narrativeDomain.legacyContext,
    dictionaryDomain.legacyContext,
    settingsDomain.legacyContext,
  );

  // v42: consolidated leaf modules are owned by their canonical domains.
  // Cross-domain calls resolve through TellMeLegacyDomains; the older
  // TellMeLegacyRegions registry is now an internal installation seam only.

  await loadClassic('./app-legacy.js');
  await loadClassic('./app-shell.js');

  // Install the ten cohesive domains only after app-legacy.js has exposed its
  // lexical dependency scope. This preserves the existing closure contract.
  const domains = [
    aiDomain, storyDomain, chapterDomain, dictionaryDomain, schoolDomain,
    projectDomain, workspaceDomain, narrativeDomain, settingsDomain, runtimeDomain,
  ];
  if (typeof window.__TellMeInstallLegacyRegions === 'function') {
    // app-legacy.js owns the exact dependency object; the installer injects it
    // into every domain, preserving the existing lexical compatibility contract.
    window.__TellMeInstallLegacyRegions(domains);
  }

  if (typeof window.init === 'function') {
    await window.init();
  } else if (typeof window.TellMeLegacyDomains?.['runtime-domain']?.init === 'function') {
    await window.TellMeLegacyDomains['runtime-domain'].init();
  }

  // import('./core/runtime-audit.js') — folded into runtime-domain.js

  window.dispatchEvent(new CustomEvent('tellme:ready', {
    detail: { architecture: 'esm-core-domains + legacy-ui', version: 2 },
  }));
};

boot().catch((error) => {
  console.error('[tellme123] bootstrap failed', error);
  const el = document.getElementById('app');
  if (el) {
    const box = document.createElement('div');
    box.style.cssText = 'margin:24px;padding:16px;border:1px solid #c33;border-radius:10px;color:#900;background:#fff7f7;';
    box.textContent = `应用启动失败：${error.message}`;
    el.prepend(box);
  }
});
