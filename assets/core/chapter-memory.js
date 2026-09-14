/**
 * Chapter memory: rolling summaries, chapter digests, and invalidation.
 *
 * Context7/MDN-guided ESM boundary: this module exposes named functions and
 * keeps the legacy AI/state services behind a narrow runtime bridge. The
 * legacy UI can keep calling the same global names during the migration.
 */
const runtime = () => window.TellMeRuntime || {};
const state = () => runtime().state || window.state || {};
const runtimeFn = (name) => (...args) => {
  const fn = window[name];
  if (typeof fn !== 'function') throw new Error(`[chapter-memory] runtime function unavailable: ${name}`);
  return fn(...args);
};

const callDeepSeek = runtimeFn('callDeepSeek');
const clampMaxTokens = runtimeFn('clampMaxTokens');
const resolveActiveSpec = runtimeFn('resolveActiveSpec');
const persist = runtimeFn('persist');

export const ROLLING_SUMMARY_SYS = `你是长篇小说滚动摘要助手。请把以下连续若干章的剧情压缩成一份 300-400 字的摘要，保留：主线推进、关键人物状态变化、情绪转折。不要细节描写，不要环境铺陈。`;

export const CHAPTER_DIGEST_SYS = `你是长篇小说剧情摘要助手。把这一章压缩成 200-300 字的剧情纪要：本章发生的事件、人物状态变化、新出现的人/物/设定、章节末尾形成的新状态。只记事实，不写景不抒情。不要猜测正文没有出现的事实。`;

export function buildRollingSummary(i){
  if(i <= 0) return '';
  const s = state();
  const o = s.outline;
  if(!o) return '';
  const digests = Array.isArray(o._chapterDigests) ? o._chapterDigests : [];
  const blocks = Array.isArray(o._rollingSummaries) ? o._rollingSummaries : [];
  const near = [];
  for(let k = i-2; k >= Math.max(0, i-6); k--){
    if(digests[k] && digests[k].text) near.unshift(`第 ${k+1} 章：${digests[k].text}`);
  }
  const mid = [];
  for(let k = i-7; k >= Math.max(0, i-11); k--){
    if(digests[k] && digests[k].text) mid.unshift(`第 ${k+1} 章：${String(digests[k].text).slice(0, 120)}`);
  }
  const far = blocks.filter(item => {
    const [a,b] = String(item.key||'').split('-').map(Number);
    return Number.isFinite(b) && b < i - 11 && b >= i - 31;
  }).map(item => `第 ${item.key} 章：${item.text}`).join('\n');
  return [
    far ? `【远期摘要（第 1 章起更早章节，5 章块）】\n${far}` : '',
    mid.length ? `【中程记忆 · 十章窗远五章（第 ${Math.max(1, i-10)}~${i-6} 章，简纪要）】\n${mid.join('\n')}` : '',
    near.length ? `【近期记忆 · 五章窗近五章（第 ${Math.max(1, i-5)}~${i-1} 章，细纪要 = 承接重点）】\n${near.join('\n')}` : ''
  ].filter(Boolean).join('\n\n');
}

export function invalidateChapterMemory(i){
  const s = state();
  const o = s.outline;
  if(!o) return;
  if(o._rollingSummaries){
    o._rollingSummaries = o._rollingSummaries.filter(item => {
      const [a,b] = String(item.key||'').split('-').map(Number);
      return !(a <= i+1 && b >= i+1);
    });
  }
  if(s._chapterPartial) delete s._chapterPartial[i];
  if(Array.isArray(o._chapterDigests)) delete o._chapterDigests[i];
  if(o._relGlossCache){
    Object.keys(o._relGlossCache).forEach(k => {
      if(+k >= i) o._relGlossCache[k]._stale = true;
    });
  }
  persist();
}

export async function ensureChapterDigests(onlyIdx){
  const s = state();
  const o = s.outline;
  if(!o) return;
  if(!Array.isArray(o._chapterDigests)) o._chapterDigests = [];
  const written = (Array.isArray(s.chapters) ? s.chapters : [])
    .map((c,i)=> (c && c.content && String(c.content).trim()) ? i : -1)
    .filter(i=>i>=0);
  for(const idx of written){
    if(onlyIdx !== undefined && onlyIdx !== null && idx !== onlyIdx) continue;
    if(o._chapterDigests[idx] && o._chapterDigests[idx].text) continue;
    try{
      const res = await callDeepSeek(
        CHAPTER_DIGEST_SYS,
        `第 ${idx+1} 章正文：\n` + String(s.chapters[idx].content||'').slice(0,6000),
        {
          maxTokens: clampMaxTokens('summary'),
          temperature: resolveActiveSpec().rollingTemp,
          topP: 0.5,
          taskKey:'rolling'
        }
      );
      o._chapterDigests[idx] = { ts: Date.now(), text: String(res.text||'').trim().slice(0,400) };
      persist();
    }catch(e){
      return;
    }
  }
}

export async function generateRollingSummaries(){
  ensureChapterDigests().catch(()=>{});
  const s = state();
  const o = s.outline;
  if(!o) return;
  if(!o._rollingSummaries) o._rollingSummaries = [];
  const written = (Array.isArray(s.chapters) ? s.chapters : [])
    .map((c,i)=> (c && c.content && String(c.content).trim()) ? i : -1)
    .filter(i => i >= 0);
  if(!written.length) return;
  const max = Math.max(...written) + 1;
  for(let end=5; end<=max; end+=5){
    const start = end - 4;
    const key = `${start}-${end}`;
    if(o._rollingSummaries.some(item => item.key === key)) continue;
    const bodies = s.chapters.slice(start-1, end).map(c => c.content).join('\n\n');
    try{
      const res = await callDeepSeek(
        ROLLING_SUMMARY_SYS,
        bodies,
        {
          maxTokens: clampMaxTokens('summary'),
          temperature: resolveActiveSpec().rollingTemp,
          topP: 0.5,
          taskKey:'rolling'
        }
      );
      o._rollingSummaries.push({key, text: String(res.text||'').trim().slice(0,500)});
      persist();
    }catch(e){
      // 静默失败：下一次触发继续补齐。
    }
  }
}

Object.assign(window, {
  buildRollingSummary,
  invalidateChapterMemory,
  ensureChapterDigests,
  generateRollingSummaries,
});
