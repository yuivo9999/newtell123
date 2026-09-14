/**
 * TellMe123 time utilities. Pure timeline math extracted from the legacy UI.
 * Context7/MDN guidance: keep reusable logic in native ES modules and expose only
 * a tiny compatibility bridge for the remaining classic script during migration.
 */
const CN_DAY = { 零:0, 一:1, 二:2, 三:3, 四:4, 五:5, 六:6, 七:7, 八:8, 九:9, 十:10, 十一:11, 十二:12, 十三:13, 十四:14, 十五:15, 十六:16, 十七:17, 十八:18, 十九:19, 二十:20 };

export function cnDayNum(n) {
  const s = String(n ?? '').trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) return +s;
  if (CN_DAY[s] != null) return CN_DAY[s];
  const m = s.match(/^二?十?([一二三四五六七八九])$/);
  if (m) return s.startsWith('二十') ? 20 + CN_DAY[m[1]] : 10 + CN_DAY[m[1]];
  return null;
}

export function timeOrdinal(value) {
  const s = String(value ?? '').trim();
  if (!s) return null;
  let day = null;
  let m = s.match(/第\s*(\d+)\s*(?:天|日)/);
  if (m) day = +m[1];
  else {
    m = s.match(/第\s*([零一二三四五六七八九十百]+)\s*(?:天|日)/);
    if (m) day = cnDayNum(m[1]);
  }
  if (day == null) {
    m = s.match(/(?:第\s*)?([零一二三四五六七八九十百]+)\s*日/);
    if (m) day = cnDayNum(m[1]);
  }
  if (day == null && /次[日天]|翌[日天]/.test(s)) day = 2;
  if (day == null && /当[日天]|本[日天]/.test(s)) day = 1;
  const hours = [['凌晨',3],['清晨',6],['早晨',7],['早上',8],['上午',9],['中午',12],['正午',12],['午后',14],['下午',15],['黄昏',18],['傍晚',18],['晚上',19],['夜晚',20],['夜里',20],['入夜',19],['深夜',23],['半夜',0],['子时',23],['卯时',5],['辰时',7],['巳时',9],['午时',12],['未时',13],['申时',15],['酉时',17],['戌时',19],['亥时',21]];
  let hour = -1;
  for (const [word, h] of hours) { if (s.includes(word)) { hour = h; break; } }
  if (hour < 0) {
    m = s.match(/第\s*(\d+)\s*个?小时|(\d+)\s*(?:点|时)/);
    if (m) hour = +(m[1] || m[2]);
  }
  if (day == null && hour < 0) return null;
  return ((day == null ? 1 : day) - 1) * 24 + (hour < 0 ? 0 : hour);
}

export function timeRewind(a, b) {
  if (!String(a ?? '').trim() || !String(b ?? '').trim()) return false;
  const oa = timeOrdinal(a), ob = timeOrdinal(b);
  return oa != null && ob != null && ob < oa;
}

export function timeSpanHours(from, to) {
  const a = timeOrdinal(from), b = timeOrdinal(to);
  return (a == null || b == null) ? null : Math.max(0, b - a);
}

export function timeDaySpan(from, to) {
  const a = timeOrdinal(from), b = timeOrdinal(to);
  if (a == null || b == null) return null;
  return Math.floor(b / 24) - Math.floor(a / 24) + 1;
}

export function timeCoveragePlan(from, to, explicit) {
  if (String(explicit ?? '').trim()) return String(explicit).trim();
  const a = timeOrdinal(from), b = timeOrdinal(to);
  if (a == null || b == null) return '';
  const d = timeDaySpan(from, to);
  return `本章必须覆盖：${from} → ${to}（共${d}日）`;
}

// Compatibility bridge for app-legacy.js.
Object.assign(window, { _cnDayNum: cnDayNum, _timeOrdinal: timeOrdinal, _timeRewind: timeRewind, _timeSpanHours: timeSpanHours, _timeDaySpan: timeDaySpan, _timeCoveragePlan: timeCoveragePlan });
