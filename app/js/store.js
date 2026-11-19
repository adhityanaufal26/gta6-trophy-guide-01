// Progress store: localStorage persistence, export and import for the Leonida Ledger tracker.
export const STORE_KEY = 'leonida-ledger-v1';

export function emptyProgress() {
  return { earned: {}, counters: {}, notes: {}, settings: { spoiler: false } };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    return normalizeProgress(parsed);
  } catch {
    return emptyProgress();
  }
}

export function normalizeProgress(value) {
  const base = emptyProgress();
  if (!value || typeof value !== 'object') return base;
  if (value.earned && typeof value.earned === 'object') base.earned = { ...value.earned };
  if (value.counters && typeof value.counters === 'object') base.counters = { ...value.counters };
  if (value.notes && typeof value.notes === 'object') base.notes = { ...value.notes };
  if (value.settings && typeof value.settings === 'object') {
    base.settings.spoiler = value.settings.spoiler === true;
  }
  return base;
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or blocked: the session keeps working in memory.
  }
}

export function toggleEarned(progress, id) {
  progress.earned[id] = !progress.earned[id];
  if (!progress.earned[id]) delete progress.earned[id];
  return progress;
}

export function setCounter(progress, id, value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  progress.counters[id] = n;
  return progress;
}

export function setNote(progress, id, text) {
  progress.notes[id] = String(text || '');
  return progress;
}

export function setSpoiler(progress, on) {
  progress.settings.spoiler = on === true;
  return progress;
}

export function exportProgressJson(progress) {
  return JSON.stringify({ app: 'leonida-ledger', version: 1, progress }, null, 2);
}

export function importProgressJson(text) {
  const parsed = JSON.parse(text);
  const inner = parsed && typeof parsed === 'object' && parsed.progress ? parsed.progress : parsed;
  return normalizeProgress(inner);
}

export function downloadProgressFile(progress) {
  const blob = new Blob([exportProgressJson(progress)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-ledger-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function demoProgress() {
  // Screenshot seed: 13 earned, counters part-way. Never persisted over real progress.
  const p = emptyProgress();
  for (const id of [2, 3, 8, 44, 46, 21, 51, 41, 36, 39, 16, 35, 32]) p.earned[id] = true;
  p.counters = { 15: 87, 17: 17, 18: 5, 19: 8, 28: 6, 31: 34, 32: 21, 35: 41, 42: 19, 48: 132, 52: 64000, 53: 38500 };
  p.notes = { 17: 'Gold so far: pistol + SMG sets. Rifle challenges left.', 42: 'Areas left are mostly north + keys.' };
  return p;
}
