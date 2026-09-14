/** TellMe123 teacher chapter-card parser/validator.
 * Pure parsing/validation: persistence and project state remain in app-legacy.js.
 */
import { stampAuthority, validateAuthority } from './authority-contract.js';
import { rangeFromText, spanDays, dayMarkers, validateChapterContract } from './story-contract.js';
function escapeRegExp(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function parseTeacherChapterCards(raw, g, gi){
  const lines=String(raw||'').replace(/\r\n?/g,'\n').split('\n'); const starts=[];
  const head=/^\s*(?:#{1,6}\s*)?第\s*(\d+)\s*章(?:\s+.*|\s*(?:《[^》]*》|\([^)]*\)|（[^）]*）|[:：、.．\-–—].*))?\s*$/;
  for(let i=0;i<lines.length;i++){const m=lines[i].match(head); if(m) starts.push({line:i,ch:+m[1]});}
  const cards=[];
  for(let z=0;z<starts.length;z++){
    const a=starts[z], b=starts[z+1]?.line??lines.length; if(a.ch<g.first||a.ch>g.last) continue;
    const block=lines.slice(a.line,b).join('\n').trim();
    const field=(labels)=>{const re=new RegExp(`(?:^|\\n)\\s*[-*]?\\s*(?:${labels.map(x=>escapeRegExp(x)).join('|')})\\s*[：:]\\s*([^\\n]+)`,'m'); const m=block.match(re); return m&&m[1]!=null?m[1].trim():'';};
    const section=(label)=>{const re=new RegExp(`(?:^|\\n)\\s*[-*]?\\s*${escapeRegExp(label)}\\s*[：:]\\s*([\\s\\S]*?)(?=\\n\\s*[-*]?\\s*(?:本章风格施工指令|功能与位置|剧情时间落点|主要地点|章末状态|本章推进骨架|情绪走向与突出点|连续性|本章出场名单)\\s*[：:]|$)`,'m'); const m=block.match(re); return m?m[1].trim():'';};
    const title=(lines[a.line].match(/《([^》]+)》/)||[])[1]||`第${a.ch}章`;
    const beats=section('本章推进骨架');
    const cast=field(['本章出场名单']);
    const card={chapter:a.ch,title,style:field(['本章风格施工指令']),function:field(['功能与位置']),time:field(['剧情时间落点']),timeCoverage:field(['时间推进安排','时间覆盖安排']),location:field(['主要地点','场景地点','主要场景']),beats,emotion:field(['情绪走向与突出点']),continuity:section('连续性'),cast,raw:block,requiredEvents:[],forbiddenEvents:[],entryState:'',endingState:field(['章末状态','收束状态'])};
    card.entryState=(card.continuity.match(/承接物理态[】）)）]?\s*[：:]?\s*([^\n]+)/)||[])[1]||'';
    card.endingState=field(['章末状态','收束状态']) || (card.continuity.match(/(?:章末|收束)[^：:]*[：:]\s*([^\n]+)/)||[])[1]||'';
    // 从骨架中提取“不得/禁止/严禁”作为机器禁项，避免把所有细节强行结构化。
    card.forbiddenEvents=(block.match(/[^\n。]{0,80}(?:不得|禁止|严禁)[^\n。]{0,120}/g)||[]).slice(0,12).map(x=>x.trim());
    card.requiredEvents=(beats.match(/(?:①|②|③|④|⑤|⑥|⑦|⑧)[\s\S]*?(?=(?:①|②|③|④|⑤|⑥|⑦|⑧)|$)/g)||[]).map(x=>x.replace(/^\s*[①-⑧]\s*/,'').trim()).filter(Boolean);
    cards.push(card);
  }
  return cards;
}
function normalizeTeacherCardAuthority(card){
  const x=card||{};
  const stamped={...x};
  stampAuthority(stamped,'teacher',{source:'teacher-card'});
  return stamped.authority;
}

export function validateChapterCard(card){
  if(!card) return '章节卡为空';
  const miss=[]; if(!card.title) miss.push('标题'); if(!card.beats) miss.push('推进骨架'); if(!card.continuity) miss.push('连续性'); if(!card.cast) miss.push('出场名单');
  if(card.time && /起点\s*[=：:]\s*[^；;]+[；;]\s*终点\s*[=：:]/.test(String(card.time)) && !String(card.timeCoverage||'').trim()) miss.push('时间推进安排');
  const tr=rangeFromText(card.time);
  const days=spanDays(tr.from,tr.to);
  if(days>=2){
    const marks=dayMarkers(card.beats);
    if(marks.length<2) miss.push(`多日时间骨架不足（${days}日仅${marks.length}个日期节点）`);
  }
  if(miss.length) return '缺少：'+miss.join('、');
  const contract=validateChapterContract({planned:{from:tr.from,to:tr.to,coverage:card.timeCoverage,beats:card.beats},observed:{},card});
  card.authority=normalizeTeacherCardAuthority(card);
  const hard=contract.issues.filter(x=>x.severity==='fail');
  return hard.length ? hard.map(x=>x.message).join('；') : '';
}

Object.assign(window, { parseTeacherChapterCards, validateChapterCard });
