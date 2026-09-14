/**
 * Chapter-scoped glossary/context assembly.
 *
 * Context7/MDN-guided ESM boundary: glossary selection and formatting are
 * exported as named functions, while the legacy runtime is accessed through
 * a narrow compatibility bridge during migration.
 */
const runtimeFn = (name) => (...args) => {
  const fn = window[name];
  if (typeof fn !== 'function') throw new Error(`[chapter-glossary] runtime function unavailable: ${name}`);
  return fn(...args);
};

const state = new Proxy({}, {
  get(_target, key) {
    return window.TellMeRuntime?.state?.[key] ?? window.state?.[key];
  },
});

const teacherChapterPlan = runtimeFn('teacherChapterPlan');
const glossaryAliases = runtimeFn('glossaryAliases');

export function fullGlossaryChapterBlock(i){
  const o = state.outline;
  const g = (o && o.glossary) || {};
  const chars = Array.isArray(g.characters) ? g.characters : [];
  const places = Array.isArray(g.places) ? g.places : [];
  const props = Array.isArray(g.propernouns) ? g.propernouns : [];
  if(!chars.length && !places.length && !props.length) return '';
  const protagonist = (o && o.navBeacon && o.navBeacon.protagonist) ? String(o.navBeacon.protagonist).split(/[，,：:（(]/)[0].trim() : '';
  const appearing = new Set();
  (relevantGlossaryForChapter(i).characters||[]).forEach(c=>{ const n=String(c&&c.name||'').trim(); if(n) appearing.add(n); });
  if(protagonist) appearing.add(protagonist);
  const lines = [];
  const charLines = chars.map(c=>{
    const n = String(c&&c.name||'').trim(); if(!n) return '';
    if(appearing.has(n)){
      return `\n· ${fmtCharFullFields(c).join('，')}`;
    }
    return `\n· ${n}（${(c&&c.identity)||'人物'}）`;
  }).filter(Boolean);
  if(charLines.length) lines.push(`人物（全量名单；●=主角/本章出场·给全部7字段）：${charLines.join('')}`);
  const placeLines = places.map(p=>{ const n=String(p&&p.name||'').trim(); if(!n) return ''; return `\n· ${n}（${(p&&p.type)||''}）${p&&p.note?`：${p.note}`:''}`; }).filter(Boolean);
  if(placeLines.length) lines.push(`地名（全量）：${placeLines.join('')}`);
  const propLines = props.map(p=>{ const n=String(p&&p.name||'').trim(); if(!n) return ''; return `\n· ${n}${p&&p.note?`：${p.note}`:''}`; }).filter(Boolean);
  if(propLines.length) lines.push(`专名（全量）：${propLines.join('')}`);
  if(Array.isArray(g._worldRules) && g._worldRules.length){
    lines.push(`世界观规则（全量·正文须遵守不违背）：${g._worldRules.map(fmtWR).join('；')}`);
  }
  const wkOnes = (g.walkons||[]).filter(w=>String(w&&w.name||'').trim()).map(w=>`${String(w.name).trim()}${String(w&&w.note||'').trim()?`（${String(w.note).trim()}）`:''}`).join('、');
  if(wkOnes) lines.push(`路人龙套（词典充实闲人，可选用登场：只一句台词/一个镜头即可，无需九维）：${wkOnes}`);
  lines.push(`【临时闲人·小地名·小专名（允许现场点缀，不入词典）】当场景自然地需要店小二、摊贩、车夫、茶客、围观者、更夫、报信者这类只出现这一次、只说一两句或只露一眼的过场闲人，或某个只此一现、日后不再提起的小地名/小专名时，可现场信手自拟一个名字，写一句便止、点到即收：只作氛围点缀，不写主持戏份、不给任何设定交代、更不得写入万物词典。硬约束：①仅限真实"过场/一次性泛称"——凡有台词作用、会再登场、或要推动情节的人地专名，一律回到本词典取用，严禁自立核心名绕开词典；②不得与本词典或上方【路人龙套】已有人名/地名/专名重名；③非机械化——这是剧情的自然点缀，不是每章必须完成的任务，切忌刻意凑数、生硬点名或反复秀存在感，多数章节甚至无需新增。`);
  return '请全程遵循本设定词典（有台词/有戏份或反复出现的人地专名一律取用本词典、保持一致，禁止自造核心名；仅作氛围的临时路人/小地名/小专名允许现场点缀一次、不入词典，见上【临时闲人】段，非机械化凑数；人物关系/性格/地域往来/专名用法与世界规则与此保持统一）：\n' + lines.join('\n');
}

export function rollCallGlossary(i){
  const o = state.outline;
  const g = (o && o.glossary) || {};
  const chars = Array.isArray(g.characters) ? g.characters : [];
  const places = Array.isArray(g.places) ? g.places : [];
  const props = Array.isArray(g.propernouns) ? g.propernouns : [];
  if(!chars.length && !places.length && !props.length) return '';
  const lesson = teacherChapterPlan(i);
  const names = new Set();
  let named = false;
  const re = /本章出场名单[：:][^\n]*/;
  if(lesson && re.test(lesson)){
    const seg = lesson.match(re)[0].replace(/^本章出场名单[：:]/, '').trim();
    const namedArr = seg.replace(/[，,、；;。]+/g, '|').split('|').map(s=>s.trim()).filter(s=>s && s.length <= 8);
    if(namedArr.length){
      named = true;
      namedArr.forEach(n=>{
        names.add(n);
        const aliasMap = glossaryAliases();
        if(aliasMap && aliasMap.size){ aliasMap.forEach((cur, al)=>{ if(String(al)===n) names.add(cur); }); }
      });
    }
  }
  if(o.navBeacon && o.navBeacon.protagonist){
    const name = String(o.navBeacon.protagonist).split(/[，,：:（(]/)[0].trim();
    if(name) names.add(name);
  }
  const matched = new Set();
  chars.forEach(c=>{ const n=String(c&&c.name||'').trim(); if(!n) return; if(names.has(n) || [...names].some(x=>n.includes(x)||x.includes(n))) matched.add(n); });
  if(!named && matched.size===0 && o.navBeacon && o.navBeacon.protagonist){
    const pn = String(o.navBeacon.protagonist).split(/[，,：:（(]/)[0].trim();
    if(pn) matched.add(pn);
  }
  const lines = [];
  if(matched.size || places.length || props.length){
    const charLines = chars.map(c=>{
      const n = String(c&&c.name||'').trim(); if(!n) return '';
      if(matched.has(n)) return `\n· ${fmtCharFullFields(c).join('，')}`;
      return '';
    }).filter(Boolean);
    if(charLines.length) lines.push(`人物（只读本章出场名单档案卡，名单外角色不供给）：${charLines.join('')}`);
    lines.push(`【本章出场名单（老师点名·正文唯一可用人物范围）】${named ? [...names].join('、') : '（教案未点名，以主角为准）'}`);
  }
  if(lines.length){
    return '【闭卷·点名制设定（唯一人物/设定来源，只读）：本章只为「本章出场名单」内的人地专名供给档案卡；名单外任何人/地/专名一律不可写、不可提、不可依靠参照。人物/地名/专名的一致性以此为准，但剧情走向、时间、承接一律以教案为准，设定不决定剧情。】\n' + lines.join('\n');
  }
  return '';
}

export function relevantGlossaryForChapter(i){
  const o = state.outline;
  if(!o) return {characters:[], places:[], propernouns:[]};
  if(o._relGlossCache && o._relGlossCache[i] && !o._relGlossCache[i]._stale) return o._relGlossCache[i];
  const g = o.glossary || {};
  const plan = (Array.isArray(o.chapterPlans) && o.chapterPlans[i]) || {};
  const prev = i > 0 ? state.chapters[i-1] : null;
  const keywords = new Set();
  (plan.requiredEntities||[]).forEach(e => keywords.add(String(e).trim()));
  const _aliasMap = glossaryAliases();
  if(_aliasMap.size) _aliasMap.forEach((cur, al) => { if(keywords.has(al)) keywords.add(cur); });
  if(o.navBeacon && o.navBeacon.protagonist){
    const name = String(o.navBeacon.protagonist).split(/[，,：:（(]/)[0].trim();
    if(name) keywords.add(name);
  }
  if(prev && prev.content){
    const fc = o._factCard || {};
    const appeared = fc.characters || {};
    Object.keys(appeared).forEach(name => { if(appeared[name] > 0) keywords.add(name); });
    const tail = String(prev.content).slice(-3000);
    (g.characters||[]).forEach(c => {
      const nm = String(c.name||'').trim();
      if(nm && new RegExp(escapeRegExp(nm)).test(tail)) keywords.add(nm);
    });
  }
  if(!keywords.size){
    const empty = {characters:[], places:[], propernouns:[]};
    o._relGlossCache = o._relGlossCache || {}; o._relGlossCache[i] = empty;
    return empty;
  }
  const kwArr = Array.from(keywords).filter(Boolean).sort((a,b)=>b.length-a.length);
  const kwRe = kwArr.length ? new RegExp(kwArr.map(escapeRegExp).join('|'), 'g') : null;
  const match = (arr) => {
    if(!kwRe) return [];
    return (arr||[]).filter(it => {
      const nm = String(it.name||'').trim();
      if(!nm) return false;
      kwRe.lastIndex = 0;
      if(kwRe.test(nm)) return true;
      const hay = [(it._alias||[]).join(' '), it.identity, it.relation, it.note, it.appearance, it.type].join(' ');
      kwRe.lastIndex = 0;
      return kwRe.test(hay);
    });
  };
  const res = {
    characters: match(g.characters),
    places: match(g.places),
    propernouns: match(g.propernouns)
  };
  o._relGlossCache = o._relGlossCache || {};
  o._relGlossCache[i] = res;
  return res;
}

export function escapeRegExp(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function fogWorldInject(i){
  const o = state.outline; if(!o) return '';
  const g = o.glossary || {};
  const seg = [];
  const rg = relevantGlossaryForChapter(i);
  const mk = k => new Set((rg[k]||[]).map(x=>String(x&&x.name||'').trim()).filter(Boolean));
  const chars = mk('characters'), pls = mk('places'), prps = mk('propernouns');
  const rel = (g._relationshipTable||[]).filter(x=> x && (chars.has(x.a)||chars.has(x.b)));
  const pc  = (g._placeContacts||[]).filter(x=> x && (pls.has(x.from)||pls.has(x.to)));
  const prc = (g._properContacts||[]).filter(x=> x && (prps.has(x.from)||prps.has(x.to)));
  let any = false;
  if(rel.length){ seg.push(`【人物关系表·迷雾】（仅本章已出场人物直接相关的关系，正文据此写、未揭示的不得提前写）\n${rel.map(x=>`${x.a} ←${x.relation||'？'}→ ${x.b}${x.note?`（${x.note}）`:''}`).join('\n')}`); any = true; }
  if(pc.length){ seg.push(`【地名关联表·迷雾】（仅本章已出场地点直接相关的关联）\n${pc.map(x=>`${x.from} ↔ ${x.to}${x.relation?`（${x.relation}）`:''}${x.note?`：${x.note}`:''}`).join('\n')}`); any = true; }
  if(prc.length){ seg.push(`【专名关联表·迷雾】（仅本章已出场专名直接相关的关联）\n${prc.map(x=>`${x.from} ↔ ${x.to}${x.relation?`（${x.relation}）`:''}${x.note?`：${x.note}`:''}`).join('\n')}`); any = true; }
  if(any){
    const fogNote = `\n（注：上述关系/关联为「迷雾」版，只列出与本章已出场实体直接相关的部分；未在本章出现或尚未揭示的关系，正文一律不得提前书写、留待后续章节自然展开，以免提前剧透。）`;
    return `${seg.join('\n')}${fogNote}`;
  }
  return '';
}

export function fmtCharFullFields(c){
  const segs = [String(c.name||'')];
  if(c.identity && c.identity !== '未知') segs.push('身份:'+c.identity);
  if(c.age && c.age !== '未知') segs.push(String(c.age).replace(/岁$/,'')+'岁');
  if(c.gender && c.gender !== '未知') segs.push(c.gender);
  if(c.appearance && c.appearance !== '未知') segs.push('外貌:'+c.appearance);
  if(c.trait && c.trait !== '未知') segs.push('性格:'+c.trait);
  if(c.hobby && c.hobby !== '未知') segs.push('爱好:'+c.hobby);
  if(c.catchphrase && c.catchphrase !== '未知' && c.catchphrase !== '无') segs.push('口头禅:'+c.catchphrase);
  if(c.relation && c.relation !== '未知') segs.push('关系:'+c.relation);
  return segs;
}

export function formatRelevantGlossary(rg){
  const lines = [];
  if(rg.characters && rg.characters.length){
    lines.push('人物：'+rg.characters.map(c=>'（'+fmtCharFullFields(c).join('，')+'）').join(''));
  }
  if(rg.places && rg.places.length) lines.push('地点：'+rg.places.map(p=>`${p.name}${p.note?'（'+p.note+'）':''}`).join('、'));
  if(rg.propernouns && rg.propernouns.length) lines.push('专名：'+rg.propernouns.map(p=>`${p.name}${p.note?'（'+p.note+'）':''}`).join('、'));
  return lines.join('\n');
}

// Temporary compatibility bridge for the remaining classic script.
Object.assign(window, {
  fullGlossaryChapterBlock,
  rollCallGlossary,
  relevantGlossaryForChapter,
  escapeRegExp,
  fogWorldInject,
  fmtCharFullFields,
  formatRelevantGlossary,
});
