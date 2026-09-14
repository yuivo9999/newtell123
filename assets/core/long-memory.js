/** TellMe123 long-memory core.
 * Context7/MDN-guided ESM boundary: memory derivation is isolated from UI rendering.
 * Runtime state remains behind the narrow TellMeRuntime bridge during migration.
 */
const runtime = () => window.TellMeRuntime || {};
const state = new Proxy({}, {
  get(_target, key) { return runtime().state?.[key]; },
  set(_target, key, value) { const s = runtime().state; if (!s) return false; s[key] = value; return true; },
});

export function ensureLongMemory(){
  state.longMemory = state.longMemory || {uiOpen:false, foreshadow:[], lastAuditAt:0};
  if(!Array.isArray(state.longMemory.foreshadow)) state.longMemory.foreshadow=[];
  return state.longMemory;
}

export function writtenChapterCount(){
  return (state.chapters||[]).filter(c=>c && String(c.content||'').trim()).length;
}

export function currentWrittenIndex(){
  for(let i=(state.chapters||[]).length-1;i>=0;i--) if(state.chapters[i] && String(state.chapters[i].content||'').trim()) return i;
  return -1;
}

export function extractPlanField(plan, names){
  const t=String(plan&&plan.beatsText||'');
  for(const n of names){
    const re=new RegExp('(?:^|\\n)\\s*'+n+'[：:]\\s*([^\\n]+)','m');
    const m=t.match(re); if(m) return m[1].trim();
  }
  return '';
}

export function refreshForeshadowBank(){
  const mem=ensureLongMemory(), o=state.outline||{};
  const plans=Array.isArray(o.chapterPlans)?o.chapterPlans:[];
  const next=[];
  plans.forEach((p,i)=>{
    const f=extractPlanField(p,['埋设伏笔','伏笔','埋伏笔']);
    if(!f || /^(无|暂无|无。|没有)$/i.test(f.trim())) return;
    const later=(state.chapters||[]).slice(i+1).map(c=>String(c&&c.content||'')).join('\n');
    const key=f.replace(/[「」“”【】（）()]/g,'').split(/[，,；;。]/)[0].trim().slice(0,18);
    const recovered=key && later.includes(key);
    next.push({id:`${i+1}-${key}`, chapter:i+1, text:f.slice(0,180), status:recovered?'suspected-recovered':'open'});
  });
  mem.foreshadow=next.slice(-120);
  mem.lastAuditAt=Date.now();
  return mem.foreshadow;
}

export function longNovelMemoryData(){
  const o=state.outline||{}, g=o.glossary||{}, idx=currentWrittenIndex();
  const dig=Array.isArray(o._chapterDigests)?o._chapterDigests:[];
  const fc=o._factCard||{};
  const plan=idx>=0 && Array.isArray(o.chapterPlans)?o.chapterPlans[idx]:null;
  const prev=idx>=0?state.chapters[idx]:null;
  const time=(fc.timeAnchors||[]).find(x=>x && x.ch===idx);
  const mem=ensureLongMemory();
  if(!mem.foreshadow.length && plansExist(o)) refreshForeshadowBank();
  return {o,g,idx,digest:idx>=0?(dig[idx]&&dig[idx].text||''):'',fc,plan,prev,time,foreshadow:mem.foreshadow};
}

export function plansExist(o){ return !!(o && Array.isArray(o.chapterPlans) && o.chapterPlans.some(Boolean)); }

export function longMemoryBrief(i){
  const isLongFn = runtime().isLong;
  if(typeof isLongFn==='function' && !isLongFn() || !state.outline) return '';
  const d=longNovelMemoryData();
  const lines=[];
  if(d.idx>=0){
    lines.push(`【小说当前状态账本｜截至第 ${d.idx+1} 章】`);
    if(d.prev && d.prev.title) lines.push(`- 最近完成章节：第 ${d.idx+1} 章《${String(d.prev.title).trim()}》`);
    if(d.fc.lastScene) lines.push(`- 最后定格场景：${String(d.fc.lastScene).slice(0,140)}`);
    if(d.time) lines.push(`- 最近时间锚：${String(d.time.time||d.time.to||d.time.from||'').slice(0,80)}`);
    if(d.digest) lines.push(`- 最近剧情事实：${String(d.digest).slice(0,360)}`);
  }
  const open=(d.foreshadow||[]).filter(x=>x.status==='open').slice(-8);
  if(open.length) lines.push(`【伏笔银行｜未确认回收】\n${open.map(x=>`- 第${x.chapter}章埋设：${x.text}`).join('\n')}`);
  if(d.plan){
    const causal=extractPlanField(d.plan,['事件因果施工','因果施工']);
    const conn=extractPlanField(d.plan,['连续性','承接']);
    if(conn) lines.push(`【当前章节承接锚】${conn.slice(0,220)}`);
    if(causal) lines.push(`【当前章节因果施工】${causal.slice(0,260)}`);
  }
  return lines.join('\n');
}

export function longMemoryPromptBlock(i){
  const b=longMemoryBrief(i);
  if(!b) return '';
  return `\n\n${b}\n【长篇记忆执行令】以上内容是从已落地正文/教案/词典派生的记忆层，不是新剧情指令。不得用记忆层制造新事实；必须从既有状态继续，重大事件仍需通过教案与因果闭环抵达。`;
}

Object.assign(window, { ensureLongMemory, writtenChapterCount, currentWrittenIndex, extractPlanField, refreshForeshadowBank, longNovelMemoryData, plansExist, longMemoryBrief, longMemoryPromptBlock });
