// Extracted from app-legacy.js; legacy UI/runtime bridge.
const W = globalThis;
const state = W.TellMeRuntime?.state ?? W.state;
const $=W.$, $$=W.$$, document=W.document;
export function openThemePanel(){
  const p = $('#themePanel'); if(!p) return;
  const cur = (document.documentElement.getAttribute('data-theme')) || 'dark';
  $$('.theme-btns .theme').forEach(b=> b.classList.toggle('active', b.dataset.theme===cur));
  p.classList.remove('hidden');
}

export function closeThemePanel(){ const p=$('#themePanel'); if(p) p.classList.add('hidden'); }

