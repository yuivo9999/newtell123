/* v31: cohesive legacy region — boot-ui */

export function install(deps){
  const {
    
  } = deps;
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];


function showBootLoading(show){
  const el = $('#bootLoading'); if(!el) return;
  el.classList.toggle('hidden', !show);
}

  const api = {
    showBootLoading
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns["boot-ui"] = Object.freeze(api);
  return ns["boot-ui"];
}
