/**
 * tellme123 modern application bootstrap.
 *
 * v42: the core is bootstrapped by ten cohesive domain entrypoints; domain-owned
 * constants/state are exposed through one compatibility context before legacy UI. Leaf
 * modules remain internal installation seams; canonical Domain APIs are the only
 * cross-domain runtime contract.
 */
const loadClassic = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = `${src}?v=modern-1`;
  script.async = false;
  script.onload = resolve;
  script.onerror = () => reject(new Error(`加载失败：${src}`));
  document.head.appendChild(script);
});

const boot = async () => {
  const [aiDomain, storyDomain, chapterDomain, dictionaryDomain, schoolDomain,
    projectDomain, workspaceDomain, narrativeDomain, settingsDomain] = await Promise.all([
    import('./core/ai-domain.js'),
    import('./core/story-domain.js'),
    import('./core/chapter-domain.js'),
    import('./core/dictionary-domain.js'),
    import('./core/school-domain.js'),
    import('./core/project-domain.js'),
    import('./core/workspace-domain.js'),
    import('./core/narrative-domain.js'),
    import('./core/settings-domain.js'),
  ]);

  // Direct/pure modules publish their own legacy-compatible windows where
  // appropriate; these explicit bridges cover modules that historically relied
  // on app.js to expose their namespace.
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
  // The foundation requires TellMeRuntime, which is created by the legacy
  // lexical bridge, so it intentionally comes after app-legacy.js.
  const runtimeDomain = await import('./core/runtime-domain.js');
  runtimeDomain.exposeLegacyWindows();

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
