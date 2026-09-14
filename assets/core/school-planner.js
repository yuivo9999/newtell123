/**
 * School / teacher chapter planning helpers.
 *
 * This module deliberately reads the mutable legacy runtime only at call time.
 * That keeps the planning algorithms reusable while the migration still has a
 * compatibility bridge for the classic app runtime.
 */

const runtime = () => window.TellMeRuntime || {};
const state = () => runtime().state || {};

export function schoolStageGroups() {
  const rt = runtime();
  const st = state();
  const o = st.outline || {};
  let N = (Array.isArray(o.chapters) ? o.chapters.length : 0);
  if (!N) {
    const c = typeof rt.chapterCountVal === 'function' ? rt.chapterCountVal() : 0;
    if (c >= 1 && c <= 200) N = c;
  }
  if (!N) return [];

  let groups = [];
  let plan = null;
  try { plan = typeof rt.bookStagePlan === 'function' ? rt.bookStagePlan(N) : null; } catch (_) { plan = null; }
  const MAX = 20;
  const MIN = 6;
  if (plan && plan.length) {
    let cur = 1;
    const CN = '一二三四五六七八九十';
    for (const stg of plan) {
      const n = Math.max(0, Math.floor(stg.n) || 0);
      if (!n) continue;
      const k = n <= MAX ? 1 : Math.ceil(n / MAX);
      const base = Math.floor(n / k), rem = n % k;
      for (let i = 0; i < k; i++) {
        const c = base + (i < rem ? 1 : 0);
        if (c <= 0) continue;
        const nm = k > 1 ? `${stg.name || ''}·${CN[i] || (i + 1)}` : (stg.name || '');
        groups.push({ stage: nm, first: cur, last: cur + c - 1 });
        cur += c;
      }
    }
  } else {
    const k0 = Math.max(1, Math.ceil(N / MAX));
    let k = k0;
    while (k < N && Math.ceil(N / k) > MAX) k++;
    const base = Math.floor(N / k), rem = N % k;
    let cur = 1;
    for (let i = 0; i < k; i++) {
      const c = base + (i < rem ? 1 : 0);
      if (c <= 0) continue;
      groups.push({ stage: `第${i + 1}组`, first: cur, last: cur + c - 1 });
      cur += c;
    }
    return groups;
  }

  const len = g => g.last - g.first + 1;
  const join = (a, b) => a === b ? a : `${a}→${b}`;
  let guard = 0;
  while (guard++ < groups.length * 6) {
    let idx = -1;
    for (let i = 0; i < groups.length; i++) {
      if (len(groups[i]) < MIN) { idx = i; break; }
    }
    if (idx < 0) break;
    const L = len(groups[idx]);
    const lOk = idx > 0 && L + len(groups[idx - 1]) <= MAX;
    const rOk = idx < groups.length - 1 && L + len(groups[idx + 1]) <= MAX;
    if (lOk && rOk) {
      const lsz = len(groups[idx - 1]), rsz = len(groups[idx + 1]);
      if (rsz < lsz) {
        groups[idx] = { stage: join(groups[idx].stage, groups[idx + 1].stage), first: groups[idx].first, last: groups[idx + 1].last };
        groups.splice(idx + 1, 1);
      } else {
        groups[idx - 1] = { stage: join(groups[idx - 1].stage, groups[idx].stage), first: groups[idx - 1].first, last: groups[idx].last };
        groups.splice(idx, 1);
      }
    } else if (lOk) {
      groups[idx - 1] = { stage: join(groups[idx - 1].stage, groups[idx].stage), first: groups[idx - 1].first, last: groups[idx].last };
      groups.splice(idx, 1);
    } else if (rOk) {
      groups[idx] = { stage: join(groups[idx].stage, groups[idx + 1].stage), first: groups[idx].first, last: groups[idx + 1].last };
      groups.splice(idx + 1, 1);
    } else break;
  }
  return groups;
}

export function schoolGroupsLabel() {
  const g = schoolStageGroups();
  if (!g.length) return '';
  return `${g.length} 位老师 · ` + g.map((x, i) => `老师${i + 1}（${x.first}-${x.last}章${x.stage ? ('·' + x.stage) : ''}）`).join(' · ');
}

export function chapterOfPlan(ci) {
  const st = state();
  if (!st.school) return -1;
  const groups = schoolStageGroups();
  const teachers = st.school.teachers || [];
  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi];
    if (teachers[gi] && ci + 1 >= g.first && ci + 1 <= g.last) return gi;
  }
  return -1;
}

export function teacherChapterPlan(ci) {
  const rt = runtime();
  const cc = typeof rt.chapterPlanAuthority === 'function' ? rt.chapterPlanAuthority(ci) : null;
  if (cc && cc.raw) return cc.raw;
  const gi = chapterOfPlan(ci);
  if (gi < 0) return '';
  const st = state();
  const t = st.school && st.school.teachers && st.school.teachers[gi];
  if (!t || !t.raw) return '';

  const lines = String(t.raw).replace(/\r\n?/g, '\n').split('\n');
  const target = ci + 1;
  const starts = [];
  const headRe = /^\s*(?:#{1,6}\s*)?第\s*(\d+)\s*章(?:\s+.*|\s*(?:《[^》]*》|\([^)]*\)|（[^）]*）|[:：、.．\-–—].*))?\s*$/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(headRe);
    if (m) starts.push({ line: i, ch: parseInt(m[1], 10) });
  }
  const pos = starts.findIndex(x => x.ch === target);
  if (pos < 0) return '';
  const begin = starts[pos].line;
  const end = pos + 1 < starts.length ? starts[pos + 1].line : lines.length;
  return lines.slice(begin, end).join('\n').trim();
}

Object.assign(window, { schoolStageGroups, schoolGroupsLabel, chapterOfPlan, teacherChapterPlan });
