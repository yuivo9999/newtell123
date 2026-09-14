/** v41 consolidated module: dict-enrich.js */
// ---- merged source: dict-enrich-compose.js ----
const _m0 = (() => {
/* v31: cohesive legacy region — dict-enrich-compose */

function install(deps){
  const {
    banListChars,
    banListNames,
    cleanEntityName,
    state,
    stateBanEnabled,
    validAssoc
  } = deps;
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];


function buildDictEnrichUser(){
  const o = state.outline || {};
  const parts = [];
  parts.push(window.storyStateCanonBlock());
  if(stateBanEnabled()){
    parts.push(`【用户全书禁则·命名红线】词典充实可以大胆创造，但新人物名、地名、专名绝不能使用以下禁用字或禁用姓名。禁用字：${banListChars().join('、')}；禁用姓名：${banListNames().join('、')}。这些是用户对整部小说的长期要求，不受阶段默认范围限制。`);
  }

  // ==========================================
  // 1. 优化构想·用户所选方案完整内容
  // ==========================================
  let cand = null;
  try{ cand = (typeof selectedPolishCandidate === 'function') ? window.selectedPolishCandidate() : null; }catch(e){}
  const candName = (cand && cand.name) ? `【优化方案名】方案『${String(cand.name).trim()}』\n` : '';
  const candFullText = String((cand && (cand.text || cand.raw || cand.brief)) || o.logline || '').trim();
  const polishPart = `【第一部分：优化构想·所选方案完整内容（全书核心设定蓝本）】\n${candName}${candFullText || '（所选优化方案为空）'}`;
  parts.push(polishPart);

  // ==========================================
  // 2. 词典达人所生成的所有内容
  // ==========================================
  const g = (o && o.glossary) || {};
  const dmSections = [];

  // (1) 人物卡（主要人物与次要配角，9维全字段）
  const charList = g.characters || [];
  if(charList.length){
    const charLines = charList.map(c => {
      const [cName] = cleanEntityName(c && c.name);
      if(!cName) return null;
      const tierTxt = (c && c.tier === 'support') ? '次要配角' : '主要人物';
      const fields = [
        `【${tierTxt}】${cName}`,
        c.identity ? `身份: ${String(c.identity).trim()}` : '',
        (c.age && c.age !== '未知') ? `年龄: ${String(c.age).trim()}` : '',
        (c.gender && c.gender !== '未知') ? `性别: ${String(c.gender).trim()}` : '',
        c.appearance ? `外貌特征: ${String(c.appearance).trim()}` : '',
        c.trait ? `性格特征: ${String(c.trait).trim()}` : '',
        c.hobby ? `爱好癖好: ${String(c.hobby).trim()}` : '',
        c.catchphrase ? `口头禅: ${String(c.catchphrase).trim()}` : '',
        c.relation ? `关系定位: ${String(c.relation).trim()}` : ''
      ].filter(Boolean);
      return `- ` + fields.join(' | ');
    }).filter(Boolean);
    if(charLines.length) dmSections.push(`【1. 核心人物与重要配角卡（共 ${charLines.length} 位）】\n${charLines.join('\n')}`);
  }

  // (2) 人物关系表
  const relArr = validAssoc(g._relationshipTable, 'a', 'b');
  if(relArr.length){
    const relLines = relArr.map(x => `- ${x.a} ↔ ${x.b} [${x.relation || '关联'}]${x.note ? `（${x.note}）` : ''}`);
    dmSections.push(`【2. 人物关系拓扑表（共 ${relLines.length} 条）】\n${relLines.join('\n')}`);
  }

  // (3) 地名设定
  const placeList = g.places || [];
  if(placeList.length){
    const placeLines = placeList.map(p => {
      const [pName] = cleanEntityName(p && p.name);
      if(!pName) return null;
      return `- 【地名】${pName} | 类型: ${p.type || '地点'} | 说明/氛围: ${String(p.note || '').trim() || '无'}`;
    }).filter(Boolean);
    if(placeLines.length) dmSections.push(`【3. 关键地名与地理场景（共 ${placeLines.length} 处）】\n${placeLines.join('\n')}`);
  }

  // (4) 地名关联表
  const pcArr = validAssoc(g._placeContacts, 'from', 'to');
  if(pcArr.length){
    const pcLines = pcArr.map(x => `- ${x.from} ↔ ${x.to} [${x.relation || '连通'}]${x.note ? `（${x.note}）` : ''}`);
    dmSections.push(`【4. 地名关联通路表（共 ${pcLines.length} 条）】\n${pcLines.join('\n')}`);
  }

  // (5) 专名与核心设定
  const propList = g.propernouns || [];
  if(propList.length){
    const propLines = propList.map(x => {
      const [xName] = cleanEntityName(x && x.name);
      if(!xName) return null;
      return `- 【专名】${xName} | 功能/特效/使用限制: ${String(x.note || '').trim() || '无'}`;
    }).filter(Boolean);
    if(propLines.length) dmSections.push(`【5. 专名与核心设定（装备/技术/道具/体系/组织等，共 ${propLines.length} 项）】\n${propLines.join('\n')}`);
  }

  // (6) 专名关联表
  const prcArr = validAssoc(g._properContacts, 'from', 'to');
  if(prcArr.length){
    const prcLines = prcArr.map(x => `- ${x.from} ↔ ${x.to} [${x.relation || '关联'}]${x.note ? `（${x.note}）` : ''}`);
    dmSections.push(`【6. 专名关联谱系表（共 ${prcLines.length} 条）】\n${prcLines.join('\n')}`);
  }

  // (7) 世界观运转规则系统
  const wrArr = ((g && g._worldRules) || []).filter(x => x && String(x.rule || '').trim());
  if(wrArr.length){
    const wrLines = wrArr.map(x => `- 【${x.cat || '世界观法则'}】适用范围: ${x.scope || '全域'} | 运作法则与代价: ${x.rule}`);
    dmSections.push(`【7. 世界观运转规则系统（共 ${wrLines.length} 条）】\n${wrLines.join('\n')}`);
  }

  // (8) 现有路人/龙套（若有）
  const walkonList = g.walkons || [];
  if(walkonList.length){
    const walkonLines = walkonList.map(w => {
      const [wName] = cleanEntityName(w && w.name);
      if(!wName) return null;
      return `- 【路人龙套】${wName} | 说明/登场: ${String(w.note || '').trim()}`;
    }).filter(Boolean);
    if(walkonLines.length) dmSections.push(`【8. 现有路人/龙套（共 ${walkonLines.length} 位）】\n${walkonLines.join('\n')}`);
  }

  // (9) 词典达人架构总结（若有）
  if(state.dictmasterLatest && state.dictmasterLatest.summary){
    dmSections.push(`【词典达人架构总结】${state.dictmasterLatest.summary}`);
  }

  const dictmasterPart = `【第二部分：词典达人所生成的所有内容（只读参照：不得改动、不得重复新增同名）】\n${dmSections.length ? dmSections.join('\n\n') : '（暂无词典达人生成数据）'}`;
  parts.push(dictmasterPart);

  return parts.join('\n\n');
}

  const api = {
    buildDictEnrichUser
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns["dict-enrich-compose"] = Object.freeze(api);
  return ns["dict-enrich-compose"];
}

return Object.freeze({install});
})();

// ---- merged source: dict-enrich-workspace.js ----
const _m1 = (() => {
/* v30: cohesive legacy region — 词典增强 / 演员收集 / AI 补全工作区. */

function install(deps){
  const {
    DICT_ENRICH_SYS,
    DICT_HARVEST_SYS,
    _abortCtl,
    addToFixQueue,
    buildDictEnrichUser,
    busy,
    callDeepSeek,
    cleanEntityName,
    esc,
    genBusy,
    hideStopBtn,
    isLong,
    markAIDone,
    markAIRunning,
    persist,
    render,
    renderGlossaryOnly,
    resolveActiveSpec,
    scDone,
    showStopBtn,
    state,
    toast,
  } = deps;


function parseDictEnrichText(txt){
  const res = { characters:[], places:[], propernouns:[], walkons:[] };
  if(!txt) return res;
  
  let cleaned = String(txt).trim()
    .replace(/^```[a-zA-Z]*\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // 1. JSON Fallback
  if(cleaned.startsWith('{') || cleaned.startsWith('[')){
    try {
      const j = JSON.parse(cleaned);
      const addChar = c => {
        if(c && c.name){
          const [cleanName, extraNote] = cleanEntityName(c.name);
          if(!cleanName) return;
          res.characters.push(completeCharFields({
            name: cleanName,
            tier: (c.tier === 'main' || c.tier === '主要人物' || c.tier === '主要') ? 'main' : 'support',
            identity: c.identity || c.身份 || extraNote || '',
            age: c.age || c.年龄 || '',
            gender: c.gender || c.性别 || '',
            appearance: c.appearance || c.外貌 || '',
            hobby: c.hobby || c.爱好 || '',
            relation: c.relation || c.关系 || '',
            trait: c.trait || c.性格 || '',
            catchphrase: c.catchphrase || c.口头禅 || ''
          }));
        }
      };
      (j.characters || j.人物 || []).forEach(addChar);
      (j.places || j.地名 || []).forEach(p => {
        if(p && p.name){
          const [cleanName, extraNote] = cleanEntityName(p.name);
          if(cleanName) res.places.push({ name: cleanName, type: p.type || p.类型 || '地名', note: (extraNote ? extraNote + '；' : '') + (p.note || p.说明 || '') });
        }
      });
      (j.propernouns || j.专名 || []).forEach(x => {
        if(x && x.name){
          const [cleanName, extraNote] = cleanEntityName(x.name);
          if(cleanName) res.propernouns.push({ name: cleanName, note: (extraNote ? extraNote + '；' : '') + (x.note || x.说明 || '') });
        }
      });
      (j.walkons || j.路人 || j.龙套 || []).forEach(w => {
        if(w && w.name){
          const [cleanName, extraNote] = cleanEntityName(w.name);
          if(cleanName) res.walkons.push({ name: cleanName, note: (extraNote ? extraNote + '；' : '') + (w.note || w.说明 || ''), _auto:true, tier:'walkon' });
        }
      });
      if(res.characters.length || res.places.length || res.propernouns.length || res.walkons.length) return res;
    } catch(e){}
  }

  // 2. Line-by-line flexible parser
  const parsePairs = detail => {
    const m = {};
    const segs = String(detail||'').split(/[；;，,\n|｜]/);
    for(const seg of segs){
      const s = String(seg||'').trim();
      if(!s) continue;
      const kv = s.match(/^[ \t*#-]*([\u4e00-\u9fa5A-Za-z0-9/_\-\—]{1,16})[：:]\s*(.+)$/);
      if(!kv || !kv[1] || !String(kv[2]||'').trim()) continue;
      m[kv[1].trim()] = kv[2].trim();
    }
    return m;
  };

  const lines = cleaned.split('\n');
  for(const raw of lines){
    let ln = String(raw||'').trim();
    if(!ln) continue;
    // Strip markdown prefixes like #, -, *, 1., >
    ln = ln.replace(/^[ \t]*[#*>\d.\-—•]+[ \t.]*/, '').trim();
    if(!ln) continue;
    if(ln.startsWith('【') && ln.endsWith('】') && /新增|分类|类别|人物|地名|专名|路人|设定/.test(ln)) continue;

    let cat = '';
    const m_cat_prefix = ln.match(/^[【\[\(（]?(主要人物|次要配角|重要角色|配角|地名|专名|路人|龙套|闲人)[】\]\)）]?[：:·\s|｜│┆丨]+(.*)$/);
    let rest = ln;
    if(m_cat_prefix){
      cat = m_cat_prefix[1];
      rest = m_cat_prefix[2].trim();
    }

    let seg = rest.split(/[｜|│┆丨]/).map(s=>String(s||'').trim()).filter(Boolean);
    if(!cat){
      if(seg.length && /^(主要人物|次要配角|重要角色|配角|地名|专名|路人|龙套|闲人)$/.test(seg[0])){
        cat = seg[0];
        seg = seg.slice(1);
      } else {
        cat = '次要配角';
      }
    }

    if(!seg.length) continue;

    let rawName = seg[0];
    let detail = '';

    if(seg.length >= 2){
      const [cleanN, extraN] = cleanEntityName(rawName);
      rawName = cleanN;
      detail = seg.slice(1).join('；');
      if(extraN) detail = (extraN + '；' + detail).replace(/^；+|；+$/g, '');
    } else {
      const m_attr = rest.match(/[\s\-—]+(身份|关系|外貌|性格|口头禅|口癖|描写标签|类型|说明|氛围|氛围特征|功能|功能特效|使用禁忌|备注|登场|台词)[：:]/);
      if(m_attr && m_attr.index != null){
        const namePart = rest.slice(0, m_attr.index).trim();
        const detailPart = rest.slice(m_attr.index).trim().replace(/^[\s\-—]+/, '');
        const [cleanN, extraN] = cleanEntityName(namePart);
        rawName = cleanN;
        detail = detailPart;
        if(extraN) detail = (extraN + '；' + detail).replace(/^；+|；+$/g, '');
      } else {
        const [cleanN, extraN] = cleanEntityName(rawName);
        rawName = cleanN;
        detail = extraN;
      }
    }

    const [name, extraFromClean] = cleanEntityName(rawName);
    if(!name) continue;
    if(extraFromClean && !detail.includes(extraFromClean)){
      detail = (extraFromClean + '；' + detail).replace(/^；+|；+$/g, '');
    }

    if(/路人|龙套|闲人/.test(cat)){
      res.walkons.push({ name, note: detail, _auto:true, tier:'walkon' });
      continue;
    }
    if(/人物|角色|主角|配角/.test(cat)){
      const tier = /主要人物|主角|重要角色/.test(cat) ? 'main' : 'support';
      const m = parsePairs(detail);
      const appParts = [
        m['外貌'] || m['外貌特征'] || m['外貌感官特征'] || m['感官特征'] || m['长相'] || '',
        (m['描写标签'] || m['正文描写标签'] || m['标签']) ? `[标签:${m['描写标签'] || m['正文描写标签'] || m['标签']}]` : ''
      ].filter(Boolean);
      const app = appParts.join(' ').trim();
      res.characters.push(completeCharFields({
        name,
        tier,
        identity: m['身份'] || m['身份定位'] || m['简介'] || m['定位'] || (Object.keys(m).length === 0 ? detail : ''),
        age:      m['岁数'] || m['年龄'] || m['岁'] || '',
        gender:   m['性别'] || '',
        appearance: app || m['外貌'] || '',
        hobby:    m['爱好'] || '',
        relation: m['关系'] || m['人际关系'] || '',
        trait:    m['性格'] || m['性格要点'] || m['性格特征'] || m['核心动机'] || '',
        catchphrase: m['口头禅'] || m['口癖'] || m['台词'] || m['习惯'] || ''
      }));
      continue;
    }
    if(/地名|地点|地方|场景/.test(cat)){
      const m = parsePairs(detail);
      const noteParts = [
        m['说明'] || m['备注'] || (Object.keys(m).length === 0 ? detail : ''),
        (m['氛围特征'] || m['感官氛围特征'] || m['氛围']) ? `氛围:${m['氛围特征'] || m['感官氛围特征'] || m['氛围']}` : '',
        (m['描写标签'] || m['正文描写标签'] || m['标签']) ? `标签:${m['描写标签'] || m['正文描写标签'] || m['标签']}` : ''
      ].filter(Boolean);
      res.places.push({ name, type: m['类型'] || m['类别'] || '地名', note: noteParts.join('；') });
      continue;
    }
    if(/专名|术语|名词|物件|势力|组织|功法|宝器|道具|法宝/.test(cat)){
      const m = parsePairs(detail);
      const noteParts = [
        m['说明'] || m['备注'] || (Object.keys(m).length === 0 ? detail : ''),
        (m['功能特效'] || m['功能'] || m['特效']) ? `功能:${m['功能特效'] || m['功能'] || m['特效']}` : '',
        (m['使用禁忌'] || m['使用禁忌/限制'] || m['禁忌'] || m['限制']) ? `禁忌:${m['使用禁忌'] || m['使用禁忌/限制'] || m['禁忌'] || m['限制']}` : '',
        (m['描写标签'] || m['正文描写标签'] || m['标签']) ? `标签:${m['描写标签'] || m['正文描写标签'] || m['标签']}` : ''
      ].filter(Boolean);
      res.propernouns.push({ name, note: noteParts.join('；') });
      continue;
    }
  }

  // 3. Ultra-resilient fallback if strict line matching produced 0 entries
  if(!(res.characters.length || res.places.length || res.propernouns.length || res.walkons.length)){
    for(const raw of lines){
      let ln = String(raw||'').trim();
      if(!ln || (ln.startsWith('【') && ln.endsWith('】'))) continue;
      ln = ln.replace(/^[ \t]*[#*>\d.\-—•]+[ \t.]*/, '').trim();
      const m = ln.match(/^([^\s：:（(—\-]{1,16})[\s：:（(—\-]+(.*)$/);
      if(m){
        const [nClean, nExtra] = cleanEntityName(m[1]);
        if(nClean && nClean.length >= 2 && !/^(小说|章节|大纲|简介|标题|节拍|时间线)$/.test(nClean)){
          res.characters.push(completeCharFields({
            name: nClean,
            tier: 'support',
            identity: (nExtra ? nExtra + '；' : '') + m[2].trim()
          }));
        }
      }
    }
  }

  return res;
}


function mergeDictEnrich(res){
  const o = state.outline; if(!o) return {c:0,w:0,p:0,k:0,total:0};
  if(!o.glossary) o.glossary = { characters:[], places:[], propernouns:[] };
  if(!Array.isArray(o.glossary.walkons)) o.glossary.walkons = [];
  const g = o.glossary;
  const n = { c:0, w:0, p:0, k:0, main:0, support:0 };
  const findExisting = (list, targetName) => {
    const cleanT = cleanEntityName(targetName)[0];
    return (list||[]).find(x => {
      const cleanX = cleanEntityName(x && x.name)[0];
      return cleanX && cleanX === cleanT;
    });
  };

  (res.characters||[]).forEach(it=>{
    const [nm, extra] = cleanEntityName(it.name);
    if(!nm) return;
    it.name = nm;
    if(extra && !it.identity) it.identity = extra;
    const existing = findExisting(g.characters, nm);
    if(existing){
      // Enrich missing fields in existing character
      ['identity','age','gender','appearance','hobby','relation','trait','catchphrase'].forEach(f=>{
        if(!existing[f] && it[f]) existing[f] = it[f];
      });
      existing._enrich = true;
      existing._srcTs = Date.now();
      return;
    }
    if(it.tier!=='main'&&it.tier!=='support') it.tier='support';
    it._enrich=true; it._srcHow='词典充实'; it._srcTs=Date.now();
    g.characters.push(it);
    n.c++;
    if(it.tier==='main') n.main++; else n.support++;
  });

  (res.places||[]).forEach(it=>{
    const [nm, extra] = cleanEntityName(it.name);
    if(!nm) return;
    it.name = nm;
    if(extra && !it.note) it.note = extra;
    const existing = findExisting(g.places, nm);
    if(existing){
      if(!existing.type && it.type) existing.type = it.type;
      if(!existing.note && it.note) existing.note = it.note;
      existing._enrich = true; existing._srcTs = Date.now();
      return;
    }
    it._enrich=true; it._srcTs=Date.now();
    g.places.push(it);
    n.p++;
  });

  (res.propernouns||[]).forEach(it=>{
    const [nm, extra] = cleanEntityName(it.name);
    if(!nm) return;
    it.name = nm;
    if(extra && !it.note) it.note = extra;
    const existing = findExisting(g.propernouns, nm);
    if(existing){
      if(!existing.note && it.note) existing.note = it.note;
      existing._enrich = true; existing._srcTs = Date.now();
      return;
    }
    it._enrich=true; it._srcTs=Date.now();
    g.propernouns.push(it);
    n.k++;
  });

  (res.walkons||[]).forEach(it=>{
    const [nm, extra] = cleanEntityName(it.name);
    if(!nm) return;
    it.name = nm;
    if(extra && !it.note) it.note = extra;
    const existing = findExisting(g.walkons, nm);
    if(existing){
      if(!existing.note && it.note) existing.note = it.note;
      existing._enrich = true; existing._srcTs = Date.now();
      return;
    }
    it._enrich=true; it._srcTs=Date.now();
    g.walkons.push(it);
    n.w++;
  });

  n.total = n.c + n.w + n.p + n.k;
  return n;
}


function _parsedCastList(text){
  const res = [];
  String(text||'').split(/[；;]/).forEach(seg=>{
    const parts = String(seg).split(/[｜|]/).map(s=>String(s||'').trim()).filter(Boolean);
    if(parts.length >= 2) res.push({ cat: parts[0], name: parts[1] });
  });
  return res;
}


function harvestCandidates(){
  const o = state.outline; if(!o) return { candidates: [], byChap: {} };
  const g = o.glossary || {};
  const resolved = new Set();
  (g.characters||[]).forEach(x=>resolved.add(String(x&&x.name||'').trim()));
  (g.places||[]).forEach(x=>resolved.add(String(x&&x.name||'').trim()));
  (g.propernouns||[]).forEach(x=>resolved.add(String(x&&x.name||'').trim()));
  const walkonSet = new Set((g.walkons||[]).map(x=>String(x&&x.name||'').trim()).filter(Boolean));
  const agg = new Map(); // name -> {cats, chans}
  (o.chapters||[]).forEach((ch,ci)=>{
    if(!ch || typeof ch.castOut !== 'string' || !String(ch.castOut).trim()) return;
    _parsedCastList(ch.castOut).forEach(it=>{
      if(!it.name || resolved.has(it.name)) return;
      if(!agg.has(it.name)) agg.set(it.name,{ cats:new Set(), chans:new Set() });
      const r = agg.get(it.name); r.chans.add(ci); if(it.cat) r.cats.add(it.cat);
    });
  });
  const candidates = [];
  agg.forEach((rec,name)=>{
    const chans = [...rec.chans].sort((a,b)=>a-b);
    if(chans.length >= 2) candidates.push({ name, cat:[...rec.cats][0]||'人物', chapters:chans, isUpgrade:walkonSet.has(name) });
  });
  agg.forEach((rec,name)=>{
    if(rec.chans.size !== 1) return;
    const ci = rec.chans.values().next().value;
    const body = (o.chapters[ci] && o.chapters[ci].content) || '';
    if(String(body).split(name).length - 1 >= 5 && !candidates.some(c=>c.name===name))
      candidates.push({ name, cat:[...rec.cats][0]||'人物', chapters:[ci], isUpgrade:walkonSet.has(name) });
  });
  candidates.sort((a,b)=>(b.chapters.length - a.chapters.length));
  return { candidates: candidates.slice(0, 20), byChap:{} };
}


function _evidWindow(body, name){
  const src = String(body||''); const idx = src.indexOf(name);
  if(idx < 0) return '';
  const s = Math.max(0, idx-60), e = Math.min(src.length, idx + String(name).length + 60);
  return '…'+src.slice(s,e).replace(/\s+/g,' ').trim()+'…';
}


function buildDictHarvestUser(){
  const o = state.outline; if(!o) return '';
  const { candidates } = harvestCandidates();
  const parts = [];
  if(candidates.length){
    const rows = candidates.map(c=>{
      const chs = c.chapters.slice(0,3).map(ci=>{
        const w = _evidWindow((o.chapters[ci]&&o.chapters[ci].content)||'', c.name);
        return `第${ci+1}章${w?`：${w}`:''}`;
      }).join('；');
      return `· ${c.cat}｜${c.name}｜ 出场 ${c.chapters.length} 章${c.isUpgrade?'（词典已有同名路人，拟升级为主/配角）':''} —— ${chs}`;
    });
    parts.push(`【正文收编候选（跨章≥2 或单章高频出现的新实体，各条附出现片段作判证；请据此收编/别名吸附/剔除一次性路人）】\n${rows.join('\n')}`);
  } else {
    parts.push('【正文收编候选】当前没有达到收编阈值（跨章≥2 或单章高频）的新实体候选。');
  }
  const g = o.glossary || {};
  const vis = [];
  (g.characters||[]).forEach(x=>vis.push(`人物·${String(x&&x.name||'').trim()}${String(x&&x.identity||'').trim()?`（${x.identity.trim()}）`:''}`));
  (g.places||[]).forEach(x=>vis.push(`地名·${String(x&&x.name||'').trim()}`));
  (g.propernouns||[]).forEach(x=>vis.push(`专名·${String(x&&x.name||'').trim()}`));
  (g.walkons||[]).forEach(x=>vis.push(`路人·${String(x&&x.name||'').trim()}`));
  parts.push(`【万物词典（现有，只读参照：不得改动、不得重复新增同名；用于分辨候选是否为已有名的缩略/字号/绰号）】\n${vis.join('\n')||'（无）'}`);
  return parts.join('\n\n');
}


function dictHarvestGate(opts){
  opts = opts || {};
  if(!isLong() || !state.outline || !state.outlineConfirmed){ if(!(opts&&opts.silent)) toast('请先完成 ②生成大纲，再收编正文实体'); return false; }
  if(!(opts && opts.force) && genBusy()){ if(!(opts&&opts.silent)) toast('已有生成任务进行中，请稍候'); return false; }
  if(!harvestCandidates().candidates.length){ if(!(opts&&opts.silent)) toast('暂无达到阈值（跨章≥2 或单章高频）的新实体需要收编'); return false; }
  return true;
}


async function genDictHarvest(btn, opts){
  opts = opts || {};
  const st = $('#dictEnrichStatus'); if(st){ st.className='status'; st.textContent=''; }
  if(!dictHarvestGate(opts)) return false;
  markAIRunning('dictEnrich');
  if(btn) busy(btn,true,'收编中…','de-busy');
  const stopParent = (btn && btn.closest('.de-card')) || (btn && btn.parentNode);
  if(stopParent) showStopBtn(stopParent);
  const stream = $('#dictEnrichStream');
  if(stream){ stream.style.display='block'; stream.textContent='正在扫描正文反复出现实体并收编进词典…'; }
  try{
    const spec = resolveActiveSpec('dictEnrich');
    const temp = (spec && spec.dictEnrichTemp != null) ? spec.dictEnrichTemp : 0.4;
    const user = buildDictHarvestUser();
    const onStream = delta => { if(stream){ stream.textContent += String(delta||''); stream.scrollTop = stream.scrollHeight; } };
    const res = await callAIWithContract(
      callDeepSeek(DICT_HARVEST_SYS, user, { temperature: temp, topP: 0.6, maxTokens: clampMaxTokens('dictEnrich'), onStream, signal:_abortCtl?.signal, taskKey:'dictHarvest' }),
      { needJson:false, taskName:'正文收编' }
    );
    if(!res.ok) throw new Error(res.error || '生成失败');
    const txt = String(res.text || '').trim();
    if(!txt) throw new Error('未返回收编内容');
    const parsed = parseDictEnrichText(txt);
    const n = mergeDictHarvest(parsed);
    state.outline._dictHarvestText = txt;
    persist(); render(); markAIDone('dictEnrich');
    if(stream) stream.style.display='none';
    toast(`正文收编完成：主要人物 ${n.main||0} · 次要配角 ${n.support||0} · 路人 ${n.w} · 地名 ${n.p} · 专名 ${n.k} 已入词典${n.up?`，${n.up} 个路人升级为主/配角`:''}`);
    return true;
  }catch(e){
    if(e && e.name !== 'AbortError') addToFixQueue({ kind:'dictEnrich', error:'正文收编：'+(e&&e.message) });
    if(!(e && e.name === 'AbortError')) toast('正文收编失败：'+(e&&e.message));
    if(st){ st.className='status err'; st.textContent=(e&&e.message)||'失败'; }
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='dictEnrich');
    hideStopBtn(); if(btn) busy(btn,false); if(stream) stream.style.display='none';
  }
}


function mergeDictHarvest(res){
  const o = state.outline; if(!o) return { c:0, w:0, p:0, k:0, up:0, main:0, support:0, total:0 };
  if(!o.glossary) o.glossary = { characters:[], places:[], propernouns:[] };
  if(!Array.isArray(o.glossary.walkons)) o.glossary.walkons = [];
  const g = o.glossary;
  const n = { c:0, w:0, p:0, k:0, up:0, main:0, support:0 };
  const have = list => new Set((list||[]).map(x=>String(x&&x.name||'').trim()).filter(Boolean));
  const hi = have(g.characters), hp = have(g.places), hk = have(g.propernouns), hw = have(g.walkons);
  const mark = it => { it._enrich=true; it._srcHow='正文收编'; it._srcTs=Date.now(); };
  (res.characters||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hi.has(nm)) return;
    mark(it); if(it.tier!=='main'&&it.tier!=='support') it.tier='support';
    if(hw.has(nm)){ g.walkons = g.walkons.filter(w=>String(w&&w.name||'').trim()!==nm); hw.delete(nm); n.up++; }
    g.characters.push(it); hi.add(nm); n.c++; if(it.tier==='main') n.main++; else n.support++;
  });
  (res.walkons||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hw.has(nm) || hi.has(nm) || hp.has(nm) || hk.has(nm)) return;
    mark(it); g.walkons.push(it); hw.add(nm); n.w++;
  });
  (res.places||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hp.has(nm) || hi.has(nm)) return;
    mark(it); g.places.push(it); hp.add(nm); n.p++;
  });
  (res.propernouns||[]).forEach(it=>{
    const nm = String(it && it.name || '').trim(); if(!nm || hk.has(nm)) return;
    mark(it); g.propernouns.push(it); hk.add(nm); n.k++;
  });
  n.total = n.c + n.w + n.p + n.k;
  return n;
}


function dictEnrichGate(opts){
  opts = opts || {};
  if(!isLong() || !state.outline){ if(!(opts&&opts.silent)) toast('请先完成 ②生成大纲，再充实词典'); return false; }
  if(!scDone('dictMaster')){ if(!(opts&&opts.silent)) toast('词典充实必须建立在词典达人定稿之后，请先完成词典达人'); return false; }
  if(state.outline && !state.outlineConfirmed){ state.outlineConfirmed = true; }
  if(!(opts && opts.force) && genBusy()){ if(!(opts&&opts.silent)) toast('已有生成任务进行中，请稍候'); return false; }
  return true;
}


async function genDictEnrich(btn, opts){
  opts = opts || {};
  const st = $('#dictEnrichStatus'); if(st){ st.className='status'; st.textContent=''; }
  if(!dictEnrichGate(opts)) return false;
  markAIRunning('dictEnrich');
  if(btn) busy(btn,true,'充满词典中…', 'de-busy');
  const stopParent = (btn && btn.closest('.de-card')) || (btn && btn.parentNode);
  if(stopParent) showStopBtn(stopParent);
  const stream = $('#dictEnrichStream');
  if(stream){ stream.style.display='block'; stream.textContent='正在生成词典充实内容…'; }
  try{
    const spec = resolveActiveSpec('dictEnrich');
    const temp = (spec && spec.dictEnrichTemp != null) ? spec.dictEnrichTemp : 0.4;
    const user = buildDictEnrichUser();
    const onStream = delta => { if(stream){ stream.textContent += String(delta||''); stream.scrollTop = stream.scrollHeight; } };
    const res = await callAIWithContract(
      callDeepSeek(DICT_ENRICH_SYS, user, { temperature: temp, topP: 0.6, maxTokens: clampMaxTokens('dictEnrich'), onStream, signal:_abortCtl?.signal, taskKey:'dictEnrich' }),
      { needJson:false, taskName:'词典充实' }
    );
    if(!res.ok) throw new Error(res.error || '生成失败');
    const txt = String(res.text || '').trim();
    if(!txt) throw new Error('未返回词典充实内容');
    const parsed = parseDictEnrichText(txt);
    if(!(parsed.characters.length || parsed.walkons.length || parsed.places.length || parsed.propernouns.length)) throw new Error('未识别到有效条目（人物/路人/地名/专名），请重试');
    const n = mergeDictEnrich(parsed); ssProtectMasterCanon(); storyState().canon.dictEnrichAt=Date.now(); storyState().versions.dictEnrich=Number(storyState().versions.dictEnrich||0)+1; storyState().pipelineVersion=(Number(storyState().pipelineVersion)||0)+1; storyState().docs=storyState().docs||{}; storyState().docs.worldExpansion={version:storyState().versions.dictEnrich,source:'dictEnrich',ts:Date.now(),added:n};
    state.outline._dictEnrichText = txt;   // 仅存档（导入/导出时仍保留原文兜底），UI 不再直接渲染
    state.outline._dictEnrichSummary = buildDictEnrichSummary(parsed);
    state.dictEnrichCounts = { c:n.c, w:n.w, p:n.p, k:n.k, main:n.main||0, support:n.support||0, ts:Date.now() };
    persist(); render(); markAIDone('dictEnrich');
    if(stream) stream.style.display='none';
    toast(`词典已充实：主要人物 ${n.main||0} · 次要配角 ${n.support||0} · 路人 ${n.w||0} · 地名 ${n.p} · 专名 ${n.k}（已并入万物词典，正文可直接选用）`);
    return true;
  }catch(e){
    if(e && e.name !== 'AbortError') addToFixQueue({ kind:'dictEnrich', error:'词典充实：'+(e&&e.message) });
    if(!(e && e.name === 'AbortError')) toast('词典充实失败：'+(e&&e.message));
    if(st){ st.className='status err'; st.textContent=(e&&e.message)||'失败'; }
    return false;
  }finally{
    state.aiNetwork.running = (state.aiNetwork.running||[]).filter(k=>k!=='dictEnrich');
    hideStopBtn(); if(btn) busy(btn,false); if(stream) stream.style.display='none';
  }
}


function buildDictEnrichSummary(parsed){
  const pk = x => String((x&&x.name)||'').trim();
  const brief = x => String((x&&x.identity)||(x&&x.relation)||'').trim();
  const wbrief = x => String((x&&x.note)||'').trim();
  return {
    main:    (parsed.characters||[]).filter(c=>c&&c.tier==='main').map(c=>({ name:pk(c), brief:brief(c) })),
    support: (parsed.characters||[]).filter(c=>c&&c.tier==='support').map(c=>({ name:pk(c), brief:brief(c) })),
    walkons: (parsed.walkons||[]).map(w=>({ name:pk(w), brief:wbrief(w) })),
    nPlaces: (parsed.places||[]).length,
    nProps:  (parsed.propernouns||[]).length,
  };
}


function dictEnrichBlockHtml(){
  const o = (state.outline) || {};
  const t = String(o._dictEnrichText || '').trim();
  const sum = o._dictEnrichSummary || null;
  const cnt = state.dictEnrichCounts || null;
  const status = `<p id="dictEnrichStatus" class="status" style="margin:8px 0 0"></p>`;
  const stream = `<pre id="dictEnrichStream" class="cp-stream-preview" style="display:none;white-space:pre-wrap"></pre>`;
  const deCollapsed = !!state.deCollapsed;
  const c = cnt || {};
  const countTxt = t ? [
    c.main>0 ? `主要人物 ${c.main}` : (sum&&sum.main&&sum.main.length ? `主要人物 ${sum.main.length}` : null),
    c.support>0 ? `次要配角 ${c.support}` : (sum&&sum.support&&sum.support.length ? `次要配角 ${sum.support.length}` : null),
    c.w>0 ? `路人 ${c.w}` : (sum&&sum.walkons&&sum.walkons.length ? `路人 ${sum.walkons.length}` : null),
    sum&&sum.nPlaces ? `地名 ${sum.nPlaces}` : (c.p>0 ? `地名 ${c.p}` : null),
    sum&&sum.nProps ? `专名 ${sum.nProps}` : (c.k>0 ? `专名 ${c.k}` : null),
  ].filter(Boolean).join(' · ') : '';
  const foldBtn = `<span class="de-carrow">${deCollapsed?'▸':'▾'}</span>`;
  const g = (o && o.glossary) || {};
  const hue = s=>{ let h=0; for(const ch of String(s||'')) h=(h*31+ch.codePointAt(0))%360; return h; };
  const liveBrief = c => {
    if(!c) return '';
    const parts = [];
    const id = String(c.identity || '').trim();
    if(id && id !== '未知' && id !== '无') parts.push(id);
    const rel = String(c.relation || '').trim();
    if(rel && rel !== '未知' && rel !== '无') parts.push(`关系:${rel}`);
    const tr = String(c.trait || '').trim();
    if(tr && tr !== '未知' && tr !== '无') parts.push(`特征:${tr}`);
    const app = String(c.appearance || '').trim();
    if(app && app !== '未知' && app !== '无') parts.push(app);
    const note = String(c.note || c.desc || '').trim();
    if(note && note !== '未知' && note !== '无') parts.push(note);
    if(!parts.length){
      const more = [c.gender, c.age, c.hobby].map(v=>String(v||'').trim()).filter(v=>v && v!=='未知' && v!=='无');
      if(more.length) parts.push(more.join(' '));
    }
    return parts.join(' · ');
  };
  const liveMain = (g.characters||[]).map((c,i)=>({ ...c, name:String(c&&c.name||'').trim(), brief:liveBrief(c), gsType:'char', gsIdx:i })).filter(c=>c.name && (g.characters[c.gsIdx].tier!=='support'));
  const liveSupport = (g.characters||[]).map((c,i)=>({ ...c, name:String(c&&c.name||'').trim(), brief:liveBrief(c), gsType:'char', gsIdx:i })).filter(c=>c.name && g.characters[c.gsIdx].tier==='support');
  const liveWalkons = (g.walkons||[]).map((w,i)=>{
    const wb = String(w&&w.note||w&&w.identity||'').trim();
    return { ...w, name:String(w&&w.name||'').trim(), brief:(wb && wb!=='未知' && wb!=='无') ? wb : '过场路人', gsType:'walkon', gsIdx:i };
  }).filter(w=>w.name);
  const deCat = (lab, arr, mode)=>{
    const n = (arr && arr.length) ? arr.length : 0;
    const nNew = (arr||[]).filter(x=>x&&x._enrich).length;
    const isCloud = (mode==='cloud');
    const cls = 'de-grid';
    const body = (arr&&arr.length) ? arr.map(it=>{
      const nm = String(it&&it.name||'').trim(); if(!nm) return '';
      const brief = String(it.brief || liveBrief(it) || '').trim() || '（暂无详细简介）';
      const isNew = !!(it && it._enrich);
      const goto = it.gsType ? `data-de-goto="${it.gsType}:${it.gsIdx}"` : '';
      return `<div class="de-item${isNew?' new':''}">
        <button type="button" class="de-chip" style="--h:${hue(nm)}" ${goto} title="点击定位万物词典中的「${esc(nm)}」">${isNew?'✦ ':''}${esc(nm)}</button>
        <span class="de-brief-desc dm-rel-txt" title="${esc(nm+'：'+brief)}">${esc(brief)}</span>
      </div>`;
    }).join('') : '<span class="muted">（暂无）</span>';
    const tag = nNew>0 ? `<b class="de-newb" title="本板块从 词典充实/正文收编 新增并入的条目">+${nNew} 新</b>` : '';
    return `<details class="dm-fold" open><summary>${lab}（${n}）${tag}</summary><div class="${cls}">${body}</div></details>`;
  };
  return `<div class="card dm-card de-card card-theme-enrich">
    <div class="dm-head de-head card-head-bar" role="button" tabindex="0" data-de-toggle title="展开/收起">
      <div class="ch-left">
        <span class="ch-badge ch-badge-enrich">🗂</span>
        <h3 class="ch-title">词典充实 · 设定细化工坊</h3>
        <span class="ch-subtag ch-subtag-enrich">${countTxt?`已并入：${countTxt}`:'感官特征 · 场景禁忌 · 氛围龙套'}</span>
      </div>
      <div class="ch-right">
        ${foldBtn}
      </div>
    </div>
    <div class="de-body"${deCollapsed?' style="display:none"':''}>
      <!-- v1.0.29x：词典充实入口收归「规划师④词典充实」，本卡不再放点击按钮，仅供展示生成内容 -->
      ${stream}
      ${status}
      ${t ? `<div class="dm-tables" style="margin-top:10px">
        ${deCat('👤 主要人物', liveMain, 'grid')}
        ${deCat('🤝 次要配角', liveSupport, 'grid')}
        ${deCat('🚶 路人龙套', liveWalkons, 'grid')}
      </div>` : `<p class="muted" style="margin-top:4px">尚未充实词典。</p>`}
    </div>
  </div>`;
}


function bindDictEnrich(){
  const eb = $('#btnGenDictEnrich'); if(eb) eb.onclick = ()=> genDictEnrich(eb);
  const hb = $('#btnHarvestCast'); if(hb) hb.onclick = ()=> genDictHarvest(hb);
  $$('[data-de-goto]').forEach(b=> b.onclick = e=>{
    e.preventDefault(); e.stopPropagation();
    const [type, idx] = String(b.dataset.deGoto||'').split(':');
    if(!type || !Number.isInteger(+idx)) return;
    state.gsCatFold = state.gsCatFold || {};
    if(type==='char'){ state.gsCatFold.main=false; state.gsCatFold.support=false; } else state.gsCatFold[type]=false;
    persist(); renderGlossaryOnly();
    const box = $(`[data-gs-entry="${type}:${+idx}"]`);
    if(box){ box.classList.add('open'); const ico=box.querySelector('.gs-fold-ico'); if(ico) ico.textContent='▾'; box.scrollIntoView({behavior:'smooth',block:'center'}); box.classList.add('gs-flash'); setTimeout(()=>box.classList.remove('gs-flash'),1600); }
  });
  const dh = $('[data-de-toggle]');
  if(dh){
    const toggleDe = ()=>{
      state.deCollapsed = !state.deCollapsed;
      persist();
      const body = dh.closest('.de-card') && dh.closest('.de-card').querySelector('.de-body');
      if(body) body.style.display = state.deCollapsed ? 'none' : '';
      const arr = dh.querySelector('.de-carrow'); if(arr) arr.textContent = state.deCollapsed ? '▸' : '▾';
    };
    dh.onclick = ()=> toggleDe();
    dh.onkeydown = (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleDe(); } };
  }
}



function closeChapterSummaryPanel(){ const p=document.getElementById('chSumPanel'); if(p) p.remove(); }

  const api = {
    parseDictEnrichText,
    mergeDictEnrich,
    _parsedCastList,
    harvestCandidates,
    _evidWindow,
    buildDictHarvestUser,
    dictHarvestGate,
    genDictHarvest,
    mergeDictHarvest,
    dictEnrichGate,
    genDictEnrich,
    buildDictEnrichSummary,
    dictEnrichBlockHtml,
    bindDictEnrich,
    closeChapterSummaryPanel,
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns['dict-enrich-workspace'] = Object.freeze(api);
  return ns['dict-enrich-workspace'];
}

return Object.freeze({install});
})();

export const dict_enrichModules = Object.freeze([_m0, _m1]);
