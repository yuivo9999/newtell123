// Extracted from app-legacy.js; legacy UI/runtime bridge.
const W = globalThis;
const state = new Proxy({}, {
  get(_, p) { return (W.TellMeRuntime?.state ?? W.state ?? {})[p]; },
  set(_, p, v) { if (!W.state) W.state = {}; (W.TellMeRuntime?.state ?? W.state)[p] = v; return true; }
});
const $ = (s, r) => (W.$ ? W.$(s, r) : (r || document).querySelector(s));
const $$ = (s, r) => (W.$$ ? W.$$(s, r) : [...((r || document).querySelectorAll(s) || [])]);
const getDoc = () => W.document || document;
export function openThemePanel(){
  const p = $('#themePanel'); if(!p) return;
  const cur = (document.documentElement.getAttribute('data-theme')) || 'dark';
  $$('.theme-btns .theme').forEach(b=> b.classList.toggle('active', b.dataset.theme===cur));
  p.classList.remove('hidden');
}

export function closeThemePanel(){ const p=$('#themePanel'); if(p) p.classList.add('hidden'); }

