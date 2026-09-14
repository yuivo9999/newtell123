/** Modern, dependency-free story contract engine. */
'use strict';

export const STORY_CONTRACT_VERSION = 4;

const CN_DAY = {零:0,一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10,十一:11,十二:12,十三:13,十四:14,十五:15,十六:16,十七:17,十八:18,十九:19,二十:20};
const TIME_WORDS = [
  ['凌晨',3],['清晨',6],['早晨',7],['早上',8],['上午',9],['中午',12],['正午',12],['午后',14],['下午',15],
  ['黄昏',18],['傍晚',18],['晚上',19],['夜晚',20],['夜里',20],['入夜',19],['深夜',23],['半夜',0],
  ['子时',23],['卯时',5],['辰时',7],['巳时',9],['午时',12],['未时',13],['申时',15],['酉时',17],['戌时',19],['亥时',21]
];

function dayNum(v){
  const s=String(v||'').trim();
  if(/^\d+$/.test(s)) return Number(s);
  return CN_DAY[s] != null ? CN_DAY[s] : null;
}

function ordinal(value){
  const s=String(value||'').trim(); if(!s) return null;
  let day=null;
  let m=s.match(/第\s*(\d+)\s*(?:天|日)/); if(m) day=Number(m[1]);
  else { m=s.match(/第\s*([一二三四五六七八九十]+)\s*(?:天|日)/); if(m) day=dayNum(m[1]); }
  if(day==null && /次[日天]|翌[日天]/.test(s)) day=2;
  if(day==null && /当[日天]|本[日天]/.test(s)) day=1;
  let hour=-1;
  for(const pair of TIME_WORDS){ if(s.includes(pair[0])){ hour=pair[1]; break; } }
  if(hour<0){ const h=s.match(/第\s*(\d+)\s*个?小时|(\d+)\s*(?:点|时)/); if(h) hour=Number(h[1]||h[2]); }
  if(day==null && hour<0) return null;
  return ((day==null?1:day)-1)*24 + (hour<0?0:hour);
}

function spanDays(from,to){
  const a=ordinal(from), b=ordinal(to); if(a==null||b==null||b<a) return null;
  return Math.floor(b/24)-Math.floor(a/24)+1;
}

function rangeFromText(raw){
  const t=String(raw||'').trim(); if(!t) return {raw:'',from:'',to:''};
  let m=t.match(/起点\s*[=：:]\s*([^；;\n]+?)(?=\s*(?:[；;]|终点\s*[=：:]))/);
  const e=t.match(/终点\s*[=：:]\s*([^；;\n]+?)(?:\s*[；;].*)?$/);
  if(m||e) return {raw:t,from:(m?m[1]:'').trim(),to:(e?e[1]:'').trim()};
  m=t.match(/(?:从\s*)?(.+?)\s*(?:到|至|—|–|→|->)\s*(.+)$/);
  return m ? {raw:t,from:m[1].trim(),to:m[2].trim()} : {raw:t,from:t,to:t};
}

function requiredDayCount(from,to){ return spanDays(from,to) || 1; }

function dayMarkers(text){
  const s=String(text||'');
  return Array.from(new Set((s.match(/第\s*(?:\d+|[一二三四五六七八九十]+)\s*(?:日|天)/g)||[]).map(x=>x.replace(/\s+/g,''))));
}

function dayMarkerNumbers(text){
  return dayMarkers(text).map(x=>{
    const m=x.match(/第\s*(\d+|[一二三四五六七八九十]+)\s*(?:日|天)/);
    return m ? dayNum(m[1]) : null;
  }).filter(n=>Number.isFinite(n));
}

function comparePlanRanges(prev, cur){
  const a=ordinal(prev&&prev.to), b=ordinal(cur&&cur.from);
  return { comparable:a!=null&&b!=null, rewound:a!=null&&b!=null&&b<a, gapHours:a!=null&&b!=null?b-a:null };
}

function validateChapterContract(input){
  const x=input||{}, issues=[];
  const planned=x.planned||{}, observed=x.observed||{}, card=x.card||{};
  const from=String(planned.from||'').trim(), to=String(planned.to||'').trim();
  const previous= x.previousPlanned || null;
  const pf=ordinal(from), pt=ordinal(to), ot=ordinal(observed.time||'');
  const days=spanDays(from,to);

  if(from && to && pf!=null && pt!=null && pt<pf){
    issues.push({code:'TIME_PLAN_REVERSED',severity:'fail',message:'计划时间终点早于起点'});
  }
  const chain=comparePlanRanges(previous, planned);
  if(chain.rewound){
    issues.push({code:'TIME_CHAPTER_REWIND',severity:'fail',message:`本章计划起点「${from}」早于上一章计划终点「${previous.to}」，章节时间链发生倒退`});
  }
  if(pt!=null && ot!=null && ot<pt){
    issues.push({code:'TIME_COVERAGE_INSUFFICIENT',severity:'fail',message:`正文观测收尾「${observed.time}」仍早于计划终点「${to}」`});
  } else if(pt!=null && ot==null && days && days>=2){
    issues.push({code:'TIME_END_UNCONFIRMED',severity:'warn',message:`多日跨度（${days}日）但正文状态无法确认章末是否抵达「${to}」`});
  }

  const beats=String(card.beats||planned.beats||planned.beatsText||'');
  const marks=dayMarkers(beats);
  const markerNums=dayMarkerNumbers(beats);
  if(days>=2){
    if(marks.length<2) issues.push({code:'TIME_SKELETON_INSUFFICIENT',severity:'fail',message:`计划跨度 ${days} 日，但「本章推进骨架」只展开了 ${marks.length} 个明确日期节点`});
    const startDay=ordinal(from)!=null ? Math.floor(ordinal(from)/24)+1 : null;
    const endDay=ordinal(to)!=null ? Math.floor(ordinal(to)/24)+1 : null;
    if(endDay!=null && markerNums.length && !markerNums.includes(endDay)){
      issues.push({code:'TIME_SKELETON_MISSES_ENDPOINT',severity:'fail',message:`计划终点位于第${endDay}日，但「本章推进骨架」没有明确推进到第${endDay}日`});
    }
    if(startDay!=null && markerNums.length && !markerNums.includes(startDay)){
      issues.push({code:'TIME_SKELETON_MISSES_START',severity:'warn',message:`计划从第${startDay}日开始，但骨架没有明确标出第${startDay}日的开篇锚点`});
    }
    if(markerNums.length>=2){
      const sorted=[...markerNums].sort((a,b)=>a-b);
      if(sorted.some((n,i)=>i>0 && n<sorted[i-1])) issues.push({code:'TIME_SKELETON_REWINDS',severity:'fail',message:'本章推进骨架中的日期节点出现倒退'});
    }
  }

  if(planned.coverage && days>=2){
    const coverage=String(planned.coverage);
    const covered=dayMarkers(coverage);
    if(covered.length<2) issues.push({code:'TIME_COVERAGE_PLAN_INCOMPLETE',severity:'warn',message:'多日章节已有时间覆盖字段，但覆盖计划没有明确展开至少两个日期节点'});
  }

  const status=issues.some(i=>i.severity==='fail')?'FAIL':issues.length?'WARN':'PASS';
  return {status,issues,planned:{from,to,days},observedTime:String(observed.time||'').trim(),dayMarkers:marks,dayMarkerNumbers:markerNums,chain};
}

function validateStoryFact(fact, expectedRole){
  const f=fact||{}, issues=[];
  if(!String(f.name||'').trim()) issues.push({code:'FACT_NAME_MISSING',severity:'fail'});
  if(expectedRole && f.authority?.role!==expectedRole) issues.push({code:'FACT_AUTHORITY_INVALID',severity:'fail',expected:expectedRole,actual:f.authority?.role||''});
  if(!f.source) issues.push({code:'FACT_SOURCE_MISSING',severity:'fail'});
  return {status:issues.some(x=>x.severity==='fail')?'FAIL':'PASS',issues};
}

export { ordinal, spanDays, rangeFromText, requiredDayCount, dayMarkers, dayMarkerNumbers, comparePlanRanges, validateChapterContract, validateStoryFact };
