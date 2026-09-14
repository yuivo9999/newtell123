/* TellMe123 runtime contract audit.
 * This is intentionally additive: it observes the existing app state and never
 * replaces the existing AI generation path. It turns timing mistakes into a
 * machine-readable audit result and a visible chapter badge.
 */
import { validateObservedState, validateObservedTransition } from './state-contract.js';
import { validateCanonGraph } from './canon-contract.js';
import { validateChapterContract } from './story-contract.js';
import { buildChapterTimeline, validateChapterTimeline } from './timeline-contract.js';
import { compareCanonToObserved, detectCanonConflicts } from './conflict-engine.js';
import { validateRuntimePacket } from './novel-runtime.js';

(function(root){
  'use strict';
  const CORE={validateChapterContract};
  const SCHEMA_VERSION=7;
  let lastStateSignature='';
  const notified=new Set();

  function ensureSchema(){
    try{
      if(!root.state || !root.state.outline) return;
      const o=root.state.outline;
      if(Number(o._schemaVersion||0)<SCHEMA_VERSION) o._schemaVersion=SCHEMA_VERSION;
      o._contractAudit=o._contractAudit||{};
      const ss=o._storyState;
      if(ss){
        ss.contractSchema=SCHEMA_VERSION;
        ss.chapters=ss.chapters||{};
      }
    }catch(e){}
  }

  function auditChapter(i, persistIt){
    try{
      const o=root.state&&root.state.outline, ss=o&&o._storyState;
      if(!ss || !ss.chapters || !ss.chapters[i]) return null;
      const row=ss.chapters[i], planned=row.planned||{}, observed=row.observed||{};
      const card=row.card||{};
      const previousPlanned = i>0 && ss.chapters[i-1] ? (ss.chapters[i-1].planned||{}) : null;
      const result=CORE.validateChapterContract({planned,observed,card,previousPlanned});
      const stateResult=observed&&Object.keys(observed).length?validateObservedState(observed):{status:'PASS',issues:[]};
      const prevObserved=i>0&&ss.chapters[i-1]?ss.chapters[i-1].observed:null;
      const transitionResult=prevObserved?validateObservedTransition(prevObserved,observed):{status:'PASS',issues:[]};
      const canonResult=validateCanonGraph(o.glossary||{});
      const timeline=buildChapterTimeline(planned,observed,card);
      const timelineResult=validateChapterTimeline(timeline);
      const conflictResult=compareCanonToObserved(o.glossary||{},observed,i+1);
      const mutationResult=detectCanonConflicts(ss.canon?.masterSnapshot||{},o.glossary||{});
      const runtimeResult=validateRuntimePacket(ss.chapters[i].runtimeProposal||{},ss.runtime||{});
      if(stateResult.status!=='PASS') result.issues.push(...stateResult.issues);
      if(transitionResult.status!=='PASS') result.issues.push(...transitionResult.issues);
      if(canonResult.status==='FAIL') result.issues.push(...canonResult.issues.map(x=>({...x,code:`CANON_${x.code}`})));
      if(timelineResult.status!=='PASS') result.issues.push(...timelineResult.issues);
      if(conflictResult.status!=='PASS') result.issues.push(...conflictResult.conflicts.map(x=>({...x,code:x.code||'CANON_CONFLICT',message:`事实冲突：${x.entity||x.field||''}，预期=${x.expected||''}，实际=${x.actual||''}`})));
      if(mutationResult.status!=='PASS') result.issues.push(...mutationResult.conflicts.map(x=>({...x,code:x.code||'CANON_MUTATION',message:`正式事实被改写：${x.group||''}.${x.field||''}`})));
      if(runtimeResult.status==='FAIL') result.issues.push(...runtimeResult.issues.map(x=>({...x,code:x.code||'RUNTIME_PACKET_INVALID',message:`小说运行时提案未通过：${x.code||''}`})));
      result.canonMutations=mutationResult.conflicts;
      result.runtime=runtimeResult;
      result.timeline=timeline;
      result.conflicts=conflictResult.conflicts;
      const prev=o._contractAudit[i];
      const comparable=JSON.stringify(result);
      if(!prev || JSON.stringify(prev.result)!==comparable){
        o._contractAudit[i]={version:SCHEMA_VERSION,result,checkedAt:Date.now()};
        row.contractAudit=o._contractAudit[i];
        if(persistIt && typeof root.persist==='function') root.persist();
      }
      if(result.status==='FAIL' && !notified.has(i+':'+comparable)){
        notified.add(i+':'+comparable);
        if(typeof root.toast==='function') root.toast(`第${i+1}章时间合同校验失败：${result.issues[0]?.message||'请检查剧情时间落点与推进骨架'}`);
      }
      return result;
    }catch(e){ return null; }
  }

  function auditAll(){
    ensureSchema();
    const ss=root.state&&root.state.outline&&root.state.outline._storyState;
    if(!ss||!ss.chapters) return [];
    const out=[];
    Object.keys(ss.chapters).forEach(k=>{ const r=auditChapter(Number(k),false); if(r) out.push({chapter:Number(k)+1,result:r}); });
    return out;
  }

  function paintBadges(){
    const rootView=document.getElementById('view'); if(!rootView) return;
    const o=root.state&&root.state.outline, audits=o&&o._contractAudit||{};
    rootView.querySelectorAll('[data-ch-card]').forEach(card=>{
      const i=Number(card.getAttribute('data-ch-card')); if(!Number.isInteger(i)) return;
      const result=audits[i]&&audits[i].result; if(!result) return;
      let el=card.querySelector('[data-contract-audit]');
      if(!el){ el=document.createElement('span'); el.setAttribute('data-contract-audit','1'); el.style.cssText='font-size:11px;padding:2px 6px;border-radius:999px;border:1px solid var(--line);white-space:nowrap;'; const host=card.querySelector('.pill'); if(host&&host.parentNode) host.parentNode.insertBefore(el,host); }
      const label=result.status==='FAIL'?'⚠ 时间合同失败':result.status==='WARN'?'△ 时间待核验':'✓ 时间合同';
      el.textContent=label;
      el.title=(result.issues||[]).map(x=>x.message).join('；')||'时间合同通过';
    });
  }

  function tick(){
    ensureSchema();
    const ss=root.state&&root.state.outline&&root.state.outline._storyState;
    const sig=ss ? JSON.stringify(Object.keys(ss.chapters||{}).map(k=>{const r=ss.chapters[k]||{};return [k,r.observed?.time,r.planned?.to,r.planned?.coverage,r.card?.beats];})) : '';
    if(sig!==lastStateSignature){ lastStateSignature=sig; auditAll(); paintBadges(); }
    else paintBadges();
  }

  root.tellmeAuditChapter=auditChapter;
  root.tellmeAuditAllChapters=auditAll;
  root.tellmeStoryContractVersion=SCHEMA_VERSION;
  ensureSchema();
  if(root.document){
    root.addEventListener('DOMContentLoaded',tick,{once:false});
    const view=root.document.getElementById('view');
    if(view && root.MutationObserver) new MutationObserver(function(){ paintBadges(); }).observe(view,{childList:true,subtree:true});
  }
  root.setTimeout(function(){ tick(); root.setInterval(tick,1500); },300);
})(typeof window !== 'undefined' ? window : globalThis);
