/**
 * Chapter-plan parsing utilities.
 *
 * This module deliberately stays DOM/state independent: it turns a teacher's
 * markdown-like chapter plan into structured chapter records. The legacy UI
 * keeps ownership of persistence and rendering while consuming the exported
 * parser through the compatibility bridge.
 */

export const PLAN_FIELD_KEYS = Object.freeze([
  '功能与位置',
  '剧情时间落点',
  '本章推进骨架',
  '情绪走向与突出点',
  '连续性',
  '本章出场名单',
]);

export function splitTeacherPlanChapters(raw) {
  const result = [];
  let current = null;

  String(raw ?? '').split('\n').forEach((line) => {
    const chapterMatch = String(line).match(/^\s*第\s*(\d+)\s*章[^《（(]*\s*(.*)$/);
    if (chapterMatch) {
      current = {
        ch: Number(chapterMatch[1]),
        title: String(chapterMatch[2] ?? '').replace(/[《》（）()【】]/g, '').trim(),
        fields: [],
      };
      result.push(current);
      return;
    }

    if (!current) return;

    const fieldMatch = String(line).match(/^\s*(?:[-•*>\d().]+\s*)*([^：:]{1,10})[：:]\s*(.*)$/);
    if (!fieldMatch) return;

    const key = fieldMatch[1].trim();
    const value = String(fieldMatch[2] ?? '').trim();
    if (PLAN_FIELD_KEYS.includes(key) && value) {
      current.fields.push({ k: key, v: value });
    }
  });

  return result;
}

// Compatibility bridge for the still-classic UI layer. New code should import
// these named exports directly; this bridge is temporary during migration.
Object.assign(window, {
  PLAN_FIELD_KEYS,
  splitTeacherPlanChapters,
});
