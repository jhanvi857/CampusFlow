export function toMinutes(t) {
  if (!t || !t.includes(':')) return null;
  const [h, m] = t.split(':');
  const hh = Number(h), mm = Number(m);
  return Number.isNaN(hh) || Number.isNaN(mm) ? null : hh * 60 + mm;
}

export function toTimeLabel(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function parseLegacy(r) {
  if (!r || typeof r !== 'string') return null;
  const n = r.trim();
  const m = n.match(/^([A-Za-z]{3})-(\d{1,2})(AM|PM)$/i);
  if (!m) return null;
  let h = Number(m[2]);
  const s = m[3].toUpperCase();
  if (s === 'PM' && h !== 12) h += 12;
  if (s === 'AM' && h === 12) h = 0;
  return { day: m[1], start: h * 60, end: h * 60 + 60 };
}

export function normalizeDay(d) {
  if (!d) return '';
  const s = String(d).trim().toLowerCase();
  if (s.startsWith('mon')) return 'Mon';
  if (s.startsWith('tue')) return 'Tue';
  if (s.startsWith('wed')) return 'Wed';
  if (s.startsWith('thu')) return 'Thu';
  if (s.startsWith('fri')) return 'Fri';
  if (s.startsWith('sat')) return 'Sat';
  return d.substring(0, 3);
}

export function getSessionWindow(s) {
  const d = normalizeDay(s.day || s.time?.split(' ')[0]);
  const st = toMinutes(s.startTime || s.time?.split(' ')[1]?.split('-')[0]);
  const en = toMinutes(s.endTime || s.time?.split(' ')[1]?.split('-')[1]);
  if (d && st !== null && en !== null) return { day: d, start: st, end: en };
  const legacy = parseLegacy(s.time);
  if (legacy) return { ...legacy, day: normalizeDay(legacy.day) };
  return null;
}

export function sessionsOverlap(a, b) {
  return a.start < b.end && b.start < a.end;
}

export function isSameText(a, b) {
  return !a || !b ? false : String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

export function findConflictsForSession(c, all) {
  const w = getSessionWindow(c);
  if (!w) return [];
  const normalizedWDay = normalizeDay(w.day);
  
  return all.filter(s => {
    if ((s.id || s.sessionId) === (c.id || c.sessionId)) return false;
    const e = getSessionWindow(s);
    if (!e || normalizeDay(e.day) !== normalizedWDay || !sessionsOverlap(w, e)) return false;

    if (isSameText(c.room, s.room)) return true;
    if (isSameText(c.faculty, s.faculty)) return true;

    if (isSameText(c.className, s.className)) {
      if (c.section && s.section && isSameText(c.section, s.section)) return true;
      if (c.batch && s.batch && isSameText(c.batch, s.batch)) return true;
      if (c.section && s.batch && s.batch.toLowerCase().startsWith(c.section.toLowerCase())) return true;
      if (c.batch && s.section && c.batch.toLowerCase().startsWith(s.section.toLowerCase())) return true;
    }

    return false;
  });
}
