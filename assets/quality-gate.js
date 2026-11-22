/* ================================================================
 * quality-gate.js · v1.0.608 · 上游「合同检查 + 自动修复重试」（偏差治理，标尺§1/§4）
 *
 * 思路：同一个模型多次生成必然有差异，目标不是“每次一样”，而是“关键的一样”。
 * 对决策型环节（词典达人、老师）在生成后做确定性检查；不合格就带着具体问题自动重试（最多 QG_MAX_RETRY 次），
 * 仍不合格则保留最后一次结果并明确告知。检查本身出错时一律放行（宁可不检查，也不能卡住生成）。
 * 关闭方式：localStorage 里设置 newtell.qg.off = 1。
 * 依赖 app.js 的全局函数，必须在其后加载。
 * ================================================================ */
const QG_MAX_RETRY = 2;
const QG_SOFT = '〔提示〕';   // 以此开头的项只记录、不触发重试（避免为小问题重复花费）
function qgEnabled(){ try{ return localStorage.getItem('newtell.qg.off')!=='1'; }catch(e){ return true; } }
function qgLog(){ if(!Array.isArray(state.qgLog)) state.qgLog=[]; return state.qgLog; }
function qgSanitizeForSave(a){
  return (Array.isArray(a)?a:[]).slice(0,40).filter(x=>x&&typeof x==='object').map(x=>({
    kind:String(x.kind||'').slice(0,20), what:String(x.what||'').slice(0,40), ts:Number(x.ts)||0, attempts:Number(x.attempts)||1,
    repaired:!!x.repaired, remaining:(Array.isArray(x.remaining)?x.remaining:[]).slice(0,6).map(v=>String(v).slice(0,160)),
    fixed:(Array.isArray(x.fixed)?x.fixed:[]).slice(0,6).map(v=>String(v).slice(0,160)) }));
}

/* 通用：callFn(note, attemptIndex) 返回 {text}；check(text) 返回违规描述数组 */
async function qgGenerate(kind, callFn, check, opt){
  const what=(opt&&opt.what)||'';
  if(!qgEnabled()) return { res:await callFn('',0), attempts:1, repaired:false, violations:[], fixed:[] };
  const maxRetry=(opt&&opt.maxRetry!=null)?opt.maxRetry:QG_MAX_RETRY;
  const isHard=(x)=>String(x).indexOf(QG_SOFT)!==0;
  let note='', res=null, first=[], last=[], k=0;
  for(k=0;k<=maxRetry;k++){
    res=await callFn(note,k);
    let v=[]; try{ v=check(String((res&&res.text)||''))||[]; }catch(e){ v=[]; }
    if(k===0) first=v.slice();
    last=v;
    if(!v.some(isHard)) break;
    if(k<maxRetry){
      const hv=v.filter(isHard);
      toast(`自动检查发现 ${hv.length} 项问题（${kind}${what?'·'+what:''}），正在自动修正（第 ${k+1}/${maxRetry} 次）…`);
      note='【上一次输出没有通过检查，必须修正】\n'+hv.map(x=>'- '+x).join('\n')+'\n请重新完整输出（保持格式与其余内容不变），只修正上面列出的问题。';
    }
  }
  const attempts=Math.min(k+1,maxRetry+1), repaired=first.some(isHard) && !last.some(isHard);
  const entry={kind,what,ts:Date.now(),attempts,repaired,remaining:last,fixed:repaired?first:[]};
  if(first.length){ qgLog().unshift(entry); if(qgLog().length>40) qgLog().length=40; try{ persist(); }catch(e){} }
  if(repaired) toast(`自动修正成功：${kind}${what?'·'+what:''}（${attempts} 次生成）`);
  else if(last.some(isHard)) toast(`仍有 ${last.filter(isHard).length} 项未通过自动检查（${kind}${what?'·'+what:''}），已保留最后一次结果：${last.filter(isHard).slice(0,2).join('；').slice(0,80)}`);
  return { res, attempts, repaired, violations:last.filter(isHard), fixed:repaired?first.filter(isHard):[] };
}

/* ---- 检查：词典达人 ---- */
const QG_FUTURE_WORDS = /(将来|后来|最终|随后|终将|将被|将成为|暴发|洪水|淹没|被淹|打乱|基建|之后会|届时|日后)/;
function qgCheckDictMaster(txt){
  const v=[]; let parsed=null;
  try{ parsed=parseDictMasterPlainText(txt); }catch(e){ return []; }
  if(!parsed || !Array.isArray(parsed.characters)) return ['输出无法解析：缺少 [CHARACTER] 等区块'];
  if(!parsed.characters.length) v.push('没有输出任何人物');
  try{ const un=dictmasterUnnamedCharacters(parsed); if(un.length) v.push('这些人物还没有正式姓名（不能是 CHAR_xxx 或“女主/家中长辈”这类称呼）：'+un.slice(0,6).join('、')); }catch(e){}
  const cp=(parsed.characters||[]).filter(c=>{ const x=String(c&&c.catchphrase||'').trim(); return x && !/^(无|未知|暂无)$/.test(x); });
  if(cp.length>2) v.push(`口头禅只能给最多 2 位有鲜明说话习惯的人物，当前 ${cp.length} 位（${cp.slice(0,5).map(c=>c.name).join('、')}），其余请写“无”`);
  // 地点/专名/机构备注里不得写将来事件
  const bad=[]; const re=/\[(LOCATION|PROPER_NOUN|INSTITUTION|PLACE_CONTACT)\]([\s\S]*?)\[\/\1\]/g; let m;
  while((m=re.exec(txt))){ const body=m[2]; const nm=(body.match(/name=([^\n]+)/)||[])[1]||(((body.match(/from=([^\n]+)/)||[])[1]||'')+'→'+((body.match(/to=([^\n]+)/)||[])[1]||'')); const note=(body.match(/note=([^\n]+)/)||[])[1]||''; if(QG_FUTURE_WORDS.test(note)) bad.push(String(nm).trim()); }
  if(bad.length) v.push('这些条目的备注写了将来会发生的事件（词典只写开篇状态，不写后续事件）：'+bad.slice(0,6).join('、'));
  return v;
}

/* ---- 检查：老师教案 ---- */
function qgCheckTeacher(txt, opt){
  const v=[]; const t=String(txt||'');
  // 引号台词
  const lines=t.split('\n').filter(l=>!/此句须保留/.test(l)); let n=0;
  lines.forEach(l=>{ const m=l.match(/“[^”\n]{9,}”/g); if(m) n+=m.length; });
  if(n>30) v.push(`教案里有 ${n} 处用引号包起来的长话（超过8字），明显过多。教案不得写人物原话，请改成转述（“某人用反问顶回去，意思是X”），引号内最多8个字。`);
  else if(n>6) v.push(QG_SOFT+`教案里有 ${n} 处引号包起来的长话（超过8字），建议改成转述（不触发自动重试）`);
  // 秘密提前出现（只查章节块，且只查揭示章之前）
  try{
    const plan=principalRevealPlan(); if(plan.length){
      const total=(typeof realChapterCount==='function')?realChapterCount():0;
      const from=(opt&&opt.from)||1, to=(opt&&opt.to)||total||99;
      const leaks=[];
      for(let c=from;c<=to;c++){
        const blk=String(teacherRawChapterBlock(t,c)||''); if(!blk) continue;
        plan.forEach(x=>{ if(Number(x.revealChapter)>c) (x.redactTerms||[]).forEach(term=>{ if(String(term).length>=4 && blk.includes(term)) leaks.push(`第${c}章教案出现了第${x.revealChapter}章才揭示的秘密内容「${term}」`); }); });
      }
      if(leaks.length) v.push(...leaks.slice(0,4), '揭示章之前的教案只能写“存在某个隐藏条件，本章不得点破”，不得写出具体内容');
    }
  }catch(e){}
  return v;
}
