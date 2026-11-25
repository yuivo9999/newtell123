/* ================================================================
 * world-engine.js · v1.0.605 · 世界运转层（可选；标尺§12）
 *
 * 目的：让世界自己在运转，故事是“在这个世界里自然发生”，而不是主角走到哪、事发生到哪。
 * 独立一步、独立生成，不改动词典达人的解析/校验：读取已有的构想与词典，产出四类「约束与事实」：
 *   [CLOCK]  世界时钟：不依赖主角、按时间发生的外部事件
 *   [COST]   成本底表：距离、速度、消耗、物价、容量等硬约束
 *   [DRIVE]  人物驱动：此刻最想要什么 / 最怕什么 / 绝不肯做什么
 *   [SENSE]  地点感官锚点：每个地点 2–3 个气味/声音/光线/触感
 * 单一来源 = state.worldEngine.raw（可手动编辑）。下游：老师（全部，作为约束）、正文（成本底表 + 本章出场人物的驱动 + 本章地点的感官；
 * 不含世界时钟，以免提前剧透）、Agent（只读工具 get_world_engine）。
 * 本文件是经典脚本，依赖 app.js / principal-tiered.js 的全局函数，必须在它们之后加载。
 * ================================================================ */
function weState(){
  if(!state.worldEngine || typeof state.worldEngine!=='object') state.worldEngine = { raw:'', ts:0 };
  return state.worldEngine;
}
function weParse(raw){
  const out = { clock:[], costs:[], drives:[], senses:[] };
  String(raw||'').split(/\r?\n/).forEach(line=>{
    const m = line.match(/^\s*\[(CLOCK|COST|DRIVE|SENSE)\]\s*(.+?)\s*$/i); if(!m) return;
    const f = m[2].split(/｜|\|/).map(x=>x.trim());
    const t = m[1].toUpperCase();
    if(t==='CLOCK' && f[0] && f[1]) out.clock.push({ when:f[0], event:f[1], pressure:f[2]||'' });
    else if(t==='COST' && f[0] && f[1]) out.costs.push({ item:f[0], rule:f.slice(1).join('；') });
    else if(t==='DRIVE' && f[0] && (f[1]||f[2]||f[3])) out.drives.push({ name:f[0], want:f[1]||'', fear:f[2]||'', limit:f[3]||'' });
    else if(t==='SENSE' && f[0] && f[1]) out.senses.push({ place:f[0], anchors:f.slice(1).join('；') });
  });
  return out;
}
function weDriveLine(x){ const w=String(x.want||'').replace(/^想要/,''), f=String(x.fear||'').replace(/^(最)?怕/,''), l=String(x.limit||'').replace(/^绝不(肯)?/,''); return `${x.name}：想要${w||'—'}；怕${f||'—'}；绝不${l||'—'}`; }
function weCounts(){ const p = weParse(weState().raw); return { clock:p.clock.length, costs:p.costs.length, drives:p.drives.length, senses:p.senses.length, total:p.clock.length+p.costs.length+p.drives.length+p.senses.length }; }

const WE_SYS = `你是长篇小说创作系统里的「世界运转设计师」。你的任务：在不改动已有设定的前提下，为这个故事补上“世界自己在运转”所需的约束与事实，让后面的故事像是在这个世界里理所当然地发生。
你只提供「约束和事实」，不写剧情、不写场景、不写台词、不替人物做选择。
请根据题材自行判断哪些类别适用；确实不适用的类别可以整类省略，不要硬凑。
输出四类（每条一行，字段用“｜”分隔；严格使用下面的行首标记；不要输出任何解释、标题或空行以外的内容）：
[CLOCK] 时点｜事件｜对故事的客观压力或机会
  世界时钟：不依赖主角、会按时间自己发生的外部事件（天气、季节、官府或势力的行动、资源消耗、他人的计划等）。时点用故事内的时间（如“第3日”“入冬前”“月底”）。通常 6–12 条，按时间先后排列。
[COST] 项目｜数值或规则
  成本底表：硬约束，如距离、行进速度、粮水或体力消耗、物价、容量、时间代价。要具体、可校验。通常 5–10 条。
[DRIVE] 人物｜此刻最想要什么｜最怕什么｜绝不肯做什么
  人物驱动：只给主要人物和关键配角；三项都要具体，且与人物已有的性格、身份、关系一致。
[SENSE] 地点｜感官锚点1；锚点2；锚点3
  地点感官锚点：每个主要地点 2–3 个气味、声音、光线、触感方面的细节，要贴合题材和时代，避免通用套话。
硬规则：
1. 蓝本和词典里已明确的事实一律不得改动或矛盾；不得新增人物、地点、专名；人名地名必须与词典完全一致。
2. 不得写出任何尚未公开的秘密，也不得暗示其具体内容。
3. 世界时钟里的事件必须是客观发生的外部事件，不得写成主角的行动或选择。
4. 不写台词、不写成品段落。`;
function weBuildUser(){
  const L = [];
  L.push('书名：'+currentTitle());
  const idea = String(state.idea||'').trim(); if(idea) L.push('【用户原始构想】\n'+idea.slice(0,1500));
  try{ const c = currentCanonicalStoryStrategy()||{}; const bp = c.creativeBlueprint||c.creationBlueprint?.structured||{}; if(Object.keys(bp).length) L.push('【创作蓝本（唯一故事事实源）】\n'+JSON.stringify(bp).slice(0,4500)); }catch(e){}
  try{
    const g = ensureGlossaryKnowledgeShape((state.outline&&state.outline.glossary)||{});
    const chs = (g.characters||[]).slice(0,14).map(c=>`${c.name}｜${String(c.identity||'').slice(0,30)}｜${String(c.age||'未知')}｜${String(c.trait||'').slice(0,40)}｜${String(c.relation||'').slice(0,60)}`);
    if(chs.length) L.push('【人物（名字｜身份｜年龄｜性格｜关系）】\n'+chs.join('\n'));
    const pls = (g.places||[]).slice(0,12).map(p=>{ const d = p.desc||p.description||p.summary||p.function||p.role||''; return `${p.name}｜${String(d).slice(0,60)}`; });
    if(pls.length) L.push('【地点（名字｜说明）】\n'+pls.join('\n'));
    const rules = (g._worldRules||[]).slice(0,12).map(r=>`${r.cat||''}｜${r.scope||''}｜${String(r.rule||'').slice(0,100)}`);
    if(rules.length) L.push('【世界观规则（已成立，不得矛盾）】\n'+rules.join('\n'));
  }catch(e){}
  const n = (typeof realChapterCount==='function') ? realChapterCount() : 0;
  L.push(`【规模】全书约 ${n||'若干'} 章；请据此把世界时钟的时间跨度铺满全书。`);
  try{ const ban = banListBlockFor('dictmaster'); if(ban) L.push(ban); }catch(e){}
  L.push('请现在按系统提示的格式输出。');
  return L.join('\n\n');
}
function weInjectionText(){ return `SYSTEM\n${WE_SYS}\n\nUSER\n${weBuildUser()}`; }

async function genWorldEngine(btn){
  if(genBusy()){ toast('已有生成任务进行中，请稍候'); return false; }
  const g = ensureGlossaryKnowledgeShape((state.outline&&state.outline.glossary)||{});
  if(!(g.characters||[]).length){ toast('请先完成词典达人（至少要有人物）'); return false; }
  if(weCounts().total && !confirm('已经有世界运转层内容，重新生成会覆盖它（包括你手动改过的部分）。继续？')) return false;
  const ctl = new AbortController(); _abortCtl = ctl;
  if(btn){ btn.classList.add('is-busy'); btn.disabled = true; }
  try{
    const res = await callDeepSeek(WE_SYS, weBuildUser(), { temperature:resolveTaskTemperature('worldEngine'), topP:0.6, maxTokens:3800, signal:ctl.signal, taskKey:'worldEngine' });
    const raw = String((res&&res.text)||'').replace(/^```[a-z]*\s*/i,'').replace(/\s*```$/,'').trim();
    const p = weParse(raw);
    if(p.clock.length+p.costs.length+p.drives.length+p.senses.length===0){ toast('世界运转层返回内容无法解析：没有找到 [CLOCK]/[COST]/[DRIVE]/[SENSE] 行，请重试'); return false; }
    const W = weState(); W.raw = raw.slice(0,12000); W.ts = Date.now(); persist();
    toast(`世界运转层已生成：时钟${p.clock.length}·成本${p.costs.length}·驱动${p.drives.length}·感官${p.senses.length}`);
    return true;
  }catch(e){
    if(e && e.name==='AbortError'){ toast('已停止'); return false; }
    toast('世界运转层生成失败：'+String(e&&e.message||e).slice(0,120)); return false;
  }finally{
    if(_abortCtl===ctl) _abortCtl = null;
    if(btn){ btn.classList.remove('is-busy'); btn.disabled = false; }
    refreshWorldEngineCard();
  }
}

/* v1.0.609 外部AI回填口原则：每一步都必须常亮三个入口——「注入导出」「读…（粘贴/导入外部结果并保存）」「生成」。
 * 前置条件不满足时只给出说明，不置灰、不隐藏；这样用户随时可以把注入内容拿去外部AI，再把结果回填，激活下一步。 */
const WE_FORMAT_HELP = '在这里粘贴外部AI生成的内容（或点「导入」选择 txt/md 文件）。每条一行，行首标记 + 字段用“｜”分隔：\n[CLOCK] 时点｜事件｜对故事的客观压力或机会\n[COST] 项目｜数值或规则\n[DRIVE] 人物｜想要｜害怕｜绝不肯做\n[SENSE] 地点｜感官锚点1；锚点2；锚点3\n（粘贴后点「保存更改」，立即生效。）';
function worldEngineCardHtml(){
  const g = ensureGlossaryKnowledgeShape((state.outline&&state.outline.glossary)||{});
  const hasDict = (g.characters||[]).length>0;
  const c = weCounts();
  const status = c.total ? `已有：世界时钟 ${c.clock} · 成本底表 ${c.costs} · 人物驱动 ${c.drives} · 地点感官 ${c.senses}` : (hasDict?'还没有生成（可点「生成」，或把「注入导出」拿到外部AI，再用「读世界运转层」回填）':'词典达人还没完成——仍可先「注入导出」或直接「读世界运转层」回填');
  return `<div class="card we-card" id="weCard"><h3>🌍 世界运转层 <span class="muted" style="font-size:12px;font-weight:400">可选 · 让世界自己运转</span></h3>
    <p class="sub">在词典基础上补四类“约束与事实”：世界时钟（不依赖主角的外部事件）、成本底表（距离/消耗/价格等硬约束）、人物驱动（想要/害怕/底线）、地点感官锚点。老师会据此安排外部事件并核对数值，正文据此写出有质感的细节。不适用的类别可以省略；你可以随时手动改，或用外部AI生成后回填。</p>
    <p class="sub" style="margin-top:-4px"><b>${esc(status)}</b></p>
    <div class="btn-row">
      <button type="button" class="btn primary" id="btnGenWE">${c.total?'重新生成':'生成世界运转层'}</button>
      <button type="button" class="btn ghost" id="btnInjWE">📦 注入导出</button>
      <button type="button" class="btn ghost" id="btnReadWE">📋 读世界运转层</button>
    </div></div>`;
}
/* v1.0.619 A-03：世界运转层卡片 + 区域展开卡片（region-expand.js）同处一个块；refresh 只刷新世界运转层卡片本身。 */
function worldEngineBlockHtml(){ return worldEngineCardHtml() + (typeof regionCardHtml==='function' ? regionCardHtml() : ''); }
function refreshWorldEngineCard(){
  const card = document.getElementById('weCard'); if(!card) return;
  const wrap = document.createElement('div'); wrap.innerHTML = worldEngineCardHtml().trim();
  card.replaceWith(wrap.firstElementChild); bindWorldEngine();
}
function weImportInto(ta){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.txt,.md,text/plain,text/markdown';
  inp.onchange=()=>{ const f=inp.files&&inp.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ ta.value=String(r.result||''); toast('已导入：'+f.name); }; r.readAsText(f,'utf-8'); };
  inp.click();
}
function bindWorldEngine(){
  if(typeof bindRegionCard==='function') bindRegionCard();
  const g = document.getElementById('btnGenWE'); if(g) g.onclick = (e)=>{ e.preventDefault(); e.stopPropagation(); genWorldEngine(g); };
  const inj = document.getElementById('btnInjWE'); if(inj) inj.onclick = (e)=>{ e.preventDefault(); e.stopPropagation();
    const gl=ensureGlossaryKnowledgeShape((state.outline&&state.outline.glossary)||{}); const warn=(gl.characters||[]).length?'':'（注意：词典达人还没有人物，下面的 USER 里会缺少人物/地点资料）\n\n';
    ptOpenText({ title:'📦 世界运转层 · 注入导出', sub:'此刻实际发送给模型的 SYSTEM + USER；拿去外部AI后，结果用「读世界运转层」回填', text:warn+weInjectionText(), readonly:true,
      buttons:[ { label:'复制', onClick:(t)=>{ copyText(t); toast('已复制'); } }, { label:'导出TXT', primary:true, onClick:(t)=>{ downloadPlainText(exportFileName('世界运转层','注入'), t); toast('已导出'); } } ] }); };
  const rd = document.getElementById('btnReadWE'); if(rd) rd.onclick = (e)=>{ e.preventDefault(); e.stopPropagation();
    const raw=weState().raw;
    ptOpenText({ title:'📋 读世界运转层', sub:raw?'上次保存的内容已回填；改完点「保存更改」':'还没有内容：粘贴外部AI的输出，或点「导入」选文件', text:raw||WE_FORMAT_HELP,
      buttons:[
        { label:'导入', onClick:(t,close,ta)=>weImportInto(ta) },
        { label:'导出TXT', onClick:(t)=>{ downloadPlainText(exportFileName('世界运转层','输出'), t); toast('已导出'); } },
        { label:'保存更改', primary:true, onClick:(t,close)=>{
            const txt=String(t||'').trim();
            if(!txt || txt===WE_FORMAT_HELP.trim()){ toast('没有内容可保存'); return; }
            const p=weParse(txt), n=p.clock.length+p.costs.length+p.drives.length+p.senses.length;
            if(!n){ toast('没有识别到有效行：每行要以 [CLOCK]/[COST]/[DRIVE]/[SENSE] 开头，字段用“｜”分隔'); return; }
            const W=weState(); W.raw=txt.slice(0,12000); W.ts=Date.now(); persist();
            toast(`已保存：时钟${p.clock.length}·成本${p.costs.length}·驱动${p.drives.length}·感官${p.senses.length}`); close(); refreshWorldEngineCard(); } }
      ] }); };
}

/* ---- 下游：老师（全部，作为约束）---- */
function worldEngineTeacherBlock(){
  const p = weParse(weState().raw); if(!(p.clock.length+p.costs.length+p.drives.length+p.senses.length)) return '';
  const L = ['【世界运转层｜客观约束与事实（只读）】'];
  if(p.clock.length) L.push('世界时钟（不依赖主角、按时间自己发生）：\n'+p.clock.map(x=>`- ${x.when}：${x.event}${x.pressure?`（${x.pressure}）`:''}`).join('\n'));
  if(p.costs.length) L.push('成本底表（硬约束）：\n'+p.costs.map(x=>`- ${x.item}：${x.rule}`).join('\n'));
  if(p.drives.length) L.push('人物驱动（想要／害怕／绝不肯做）：\n'+p.drives.map(x=>'- '+weDriveLine(x)).join('\n'));
  if(p.senses.length) L.push('地点感官锚点：\n'+p.senses.map(x=>`- ${x.place}：${x.anchors}`).join('\n'));
  L.push('【使用规则】①世界时钟：每章先判断本章所处的故事时间，把已到期的外部事件放进剧情安排，作为客观的压力或机会，而不是凭情节需要硬造；时间推进必须与时钟一致。②成本底表是硬约束，距离、速度、消耗、价格等数值不得违反。③人物驱动用来推导“谁在这个处境下会怎么选”，写成因果和选择倾向，不得写成台词。④地点感官锚点交给正文取用，教案里不必复述。⑤以上是约束与事实，不是剧本，不得照抄成场景。');
  return L.join('\n').slice(0,5500);
}
/* ---- 下游：正文（成本底表 + 本章出场人物驱动 + 本章地点感官；不含世界时钟，避免提前剧透）---- */
function worldEngineWriterBlock(i){
  const p = weParse(weState().raw); if(!(p.costs.length+p.drives.length+p.senses.length)) return '';
  let plan=''; try{ plan = String(getCurrentChapterTeacherRawText(i)||''); }catch(e){}
  const L = ['【世界运转层｜本章可用的约束与质感（只读）】'];
  if(p.costs.length) L.push('成本底表（数值与距离不得违反）：\n'+p.costs.map(x=>`- ${x.item}：${x.rule}`).join('\n').slice(0,1400));
  const dr = p.drives.filter(x=>plan.includes(x.name)).slice(0,6);
  if(dr.length) L.push('本章出场人物的驱动（选择与反应要与此一致，不要写成台词）：\n'+dr.map(x=>'- '+weDriveLine(x)).join('\n').slice(0,1500));
  const se = p.senses.filter(x=>plan.includes(x.place)).slice(0,4);
  if(se.length) L.push('本章地点的感官锚点（挑用，不必全用，不要写成清单）：\n'+se.map(x=>`- ${x.place}：${x.anchors}`).join('\n').slice(0,1000));
  if(L.length<2) return '';
  return L.join('\n');
}

/* ================= v1.0.608 世界时钟：按章推进（后台逻辑；界面随故事页重构接入）=================
 * 章节时点来自「章末结算」里的 time（自由文本，尽量解析出“第N日”）；时钟事件的 when 同样解析。
 * 无法解析的归入“未定日期”，不强行判断。事件是否“用上”用字面重合做启发式判断（仅供参考）。 */
function weParseDay(str){
  const cn={零:0,〇:0,一:1,二:2,两:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
  const toNum=(x)=>{ if(/^\d+$/.test(x)) return +x; if(x==='十') return 10; const m=x.match(/^([一二三四五六七八九])?十([一二三四五六七八九])?$/); if(m) return (m[1]?cn[m[1]]:1)*10+(m[2]?cn[m[2]]:0); if(x.length===1&&cn[x]!=null) return cn[x]; return null; };
  const m=String(str||'').match(/第?\s*([0-9]+|[一二三四五六七八九十两〇零]+)\s*(?:日|天)/);
  return m ? toNum(m[1]) : null;
}
function weEventUsed(ev, text){
  const core=String(ev||'').replace(/[，。、；：“”"'（）()\s]/g,''), t=String(text||'').replace(/[，。、；：“”"'（）()\s]/g,'');
  if(core.length<4||!t) return false; const seen=new Set();
  for(let k=0;k+3<=core.length;k++){ const g=core.slice(k,k+3); if(t.includes(g)) seen.add(g); }
  return seen.size>=2;
}
function weChapterReport(i){
  const p=weParse(weState().raw); if(!p.clock.length) return null;
  const ss=storyState(), ob=(k)=>ss.chapters&&ss.chapters[k]&&ss.chapters[k].observed;
  const start = i>0 && ob(i-1) ? weParseDay(ob(i-1).time) : (i===0?1:null);
  const end = ob(i) ? weParseDay(ob(i).time) : null;
  const ref = end!=null ? end : start;
  /* 是否“用上”按截至本章的全部正文判断：到期事件只要在已写章节里出现过就算体现；一直没出现才提示。 */
  const text = (state.chapters||[]).slice(0,i+1).map(c=>String((c&&c.content)||'')).join('\n');
  const due=[], upcoming=[], undated=[];
  p.clock.forEach(e=>{
    const d=weParseDay(e.when);
    if(d==null){ undated.push({when:e.when,event:e.event}); return; }
    if(ref==null) { undated.push({when:e.when,event:e.event}); return; }
    if(d<=ref) due.push({when:e.when,event:e.event,day:d,used:text?weEventUsed(e.event,text):null});
    else if(d<=ref+2) upcoming.push({when:e.when,event:e.event,day:d});
  });
  return { chapter:i+1, startDay:start, endDay:end, refDay:ref, due, upcoming, undated };
}
function weChapterReportText(i){
  const r=weChapterReport(i); if(!r) return '世界运转层里还没有世界时钟。';
  const L=[`第${r.chapter}章 世界此刻：故事时点 ${r.startDay!=null?'第'+r.startDay+'日':'未知'}${r.endDay!=null?' → 第'+r.endDay+'日':''}`];
  L.push('已到期的外部事件：'+(r.due.length?r.due.map(x=>`${x.when}「${x.event}」${x.used==null?'':(x.used?'（疑似已体现）':'（疑似未体现）')}`).join('；'):'无'));
  L.push('即将到期（2日内）：'+(r.upcoming.length?r.upcoming.map(x=>`${x.when}「${x.event}」`).join('；'):'无'));
  if(r.undated.length) L.push('时点无法解析的事件：'+r.undated.map(x=>`${x.when}「${x.event}」`).join('；'));
  return L.join('\n');
}

/* ================= v1.0.616 B-11 世界区域数据模型（不含 AI）=================
 * state.worldEngine.regions = { 地点名: { status:'fog|open|visited', anchors:[], note:'', ts } }
 *  fog=迷雾（词典里有名字，尚未展开）；open=已展开（有锚点/备注）；visited=已到达（保存的显式标记）。
 * weRegionStatus 结合章末结算的地点，实时判定：current(当前) / visited(已到达) / open(已展开) / fog(迷雾) / ''(未知地点)。
 * AI 自动展开由 A-03 另做；这里只有纯数据与手动展开。 */
const WE_REGION_STATUSES = ['fog','open','visited'];
function weRegionsSanitize(r){
  const out = {};
  if(!r || typeof r!=='object' || Array.isArray(r)) return out;
  Object.keys(r).slice(0,300).forEach(k=>{
    const name = String(k||'').trim().slice(0,60); const v = r[k];
    if(!name || !v || typeof v!=='object' || Array.isArray(v)) return;
    const anchors = (Array.isArray(v.anchors)?v.anchors:[]).map(x=>String(x||'').trim()).filter(Boolean).slice(0,12).map(x=>x.slice(0,80));
    out[name] = { status: WE_REGION_STATUSES.indexOf(v.status)>=0 ? v.status : 'fog', anchors, note:String(v.note||'').slice(0,600), ts:Number(v.ts)||0 };
  });
  return out;
}
function weRegions(){ const w = weState(); if(!w.regions || typeof w.regions!=='object' || Array.isArray(w.regions)) w.regions = {}; return w.regions; }
/* 从词典「地点」生成初始迷雾；已存在的条目保持不动。返回新增数量。 */
function weRegionsFromDictionary(){
  const g = (state.outline && state.outline.glossary) || {}; const r = weRegions(); let n = 0;
  (g.places||[]).forEach(x=>{
    const name = String((x&&x.name)||'').trim().slice(0,60); if(!name || r[name]) return;
    r[name] = { status:'fog', anchors:[], note:'', ts:Date.now() }; n++;
  });
  return n;
}
/* 手动展开（不调 AI）：fog→open；已是 open/visited 则只更新锚点/备注，不降级。 */
function weExpandRegion(name, opt){
  name = String(name||'').trim().slice(0,60); if(!name) return null;
  opt = opt || {}; const r = weRegions();
  const cur = r[name] || { status:'fog', anchors:[], note:'', ts:0 };
  const anchors = Array.isArray(opt.anchors) ? opt.anchors.map(x=>String(x||'').trim()).filter(Boolean).slice(0,12) : cur.anchors;
  const note = opt.note!=null ? String(opt.note).slice(0,600) : cur.note;
  r[name] = { status: cur.status==='visited' ? 'visited' : 'open', anchors, note, ts:Date.now() };
  return r[name];
}
/* 判定：chapterIdx 为 0 基章号（缺省=不看章节，只看当前结算）。 */
function weRegionStatus(name, chapterIdx){
  name = String(name||'').trim(); if(!name) return '';
  const r = weRegions(); const reg = r[name];
  const ss = (typeof storyState==='function') ? storyState() : null;
  const has = (loc)=>{ loc = String(loc||''); return !!loc && (loc.includes(name) || name.includes(loc)); };
  const chs = (ss && ss.chapters) || {};
  const upto = (chapterIdx==null || isNaN(chapterIdx)) ? Infinity : Number(chapterIdx);
  if(chapterIdx!=null && !isNaN(chapterIdx)){
    const ob = chs[chapterIdx] && chs[chapterIdx].observed; if(ob && has(ob.location)) return 'current';
  }else if(ss && ss.current && ss.current.chapter>=0 && has(ss.current.location)) return 'current';
  const seen = Object.keys(chs).some(k=>{ const i=+k; if(!(i<(upto===Infinity?Infinity:upto))) return false; const ob=chs[k]&&chs[k].observed; return ob && has(ob.location); });
  if(seen) return 'visited';
  if(reg){ return reg.status==='visited' ? 'visited' : (reg.status==='open' ? 'open' : 'fog'); }
  return '';
}
