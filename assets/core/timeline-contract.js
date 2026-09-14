/** v46 chapter timeline contract. Pure/browser-independent. */
'use strict';
import { ordinal, dayMarkers, dayMarkerNumbers, spanDays } from './story-contract.js';

function dayOf(v){ const n=ordinal(v); return n==null?null:Math.floor(n/24)+1; }
export function buildChapterTimeline(planned={}, observed={}, card={}){
  const from=String(planned.from||'').trim(), to=String(planned.to||'').trim();
  const startDay=dayOf(from), endDay=dayOf(to), span=spanDays(from,to);
  const beatText=String(card.beats||planned.beats||planned.beatsText||'');
  const required=[]; if(startDay!=null) required.push({day:startDay,kind:'start',label:from});
  if(span!=null && span>1) for(let d=startDay+1;d<=endDay;d++) required.push({day:d,kind:d===endDay?'end':'bridge',label:`第${d}日`});
  const markers=dayMarkerNumbers(beatText);
  const actualDay=dayOf(observed.time||'');
  const gaps=required.filter(r=>!markers.includes(r.day) && !(r.kind==='end' && actualDay===r.day));
  return {from,to,startDay,endDay,span,required,markers,actualEnd:observed.time||'',actualDay,gaps,complete:gaps.length===0 && (endDay==null||actualDay==null||actualDay>=endDay)};
}

export function validateChapterTimeline(timeline){
  const issues=[];
  if(timeline.span>=2 && timeline.gaps.length) issues.push({code:'TIMELINE_GAPS',severity:'fail',days:timeline.gaps.map(x=>x.day),message:`章节时间线仍缺少第${timeline.gaps.map(x=>x.day).join('、')}日的明确承载`});
  if(timeline.endDay!=null && timeline.actualDay!=null && timeline.actualDay<timeline.endDay) issues.push({code:'TIMELINE_END_EARLY',severity:'fail',message:`正文实际结束在第${timeline.actualDay}日，计划终点为第${timeline.endDay}日`});
  return {status:issues.some(i=>i.severity==='fail')?'FAIL':issues.length?'WARN':'PASS',issues,timeline};
}
