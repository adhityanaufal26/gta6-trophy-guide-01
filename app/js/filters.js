// Checklist filtering and the spoiler rule: pure functions over the trophy list.
export const KINDS = ['all', 'story', 'collectible', 'activity'];
export const GRADES = ['all', 'platinum', 'gold', 'silver', 'bronze'];
export const STATUSES = ['all', 'earned', 'unearned'];

export function defaultFilters() {
  return { kind: 'all', grade: 'all', status: 'all', missableOnly: false, query: '' };
}

export function isSpoilerHidden(trophy, progress) {
  return progress.settings.spoiler === true && trophy.kind === 'story' && !progress.earned[trophy.id];
}

export function displayName(trophy, progress) {
  return isSpoilerHidden(trophy, progress) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, progress) {
  return isSpoilerHidden(trophy, progress)
    ? 'Spoiler shield on: earn it to reveal the name and description.'
    : trophy.description;
}

export function matchesQuery(trophy, query, progress) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [displayName(trophy, progress), displayDescription(trophy, progress), trophy.kind, trophy.grade]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export function applyFilters(trophies, progress, filters) {
  return trophies.filter((t) => {
    if (filters.kind !== 'all' && t.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !progress.earned[t.id]) return false;
    if (filters.status === 'unearned' && progress.earned[t.id]) return false;
    if (filters.missableOnly && !t.missable) return false;
    if (!matchesQuery(t, filters.query, progress)) return false;
    return true;
  });
}

export function progressStats(trophies, progress) {
  const byGrade = {};
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) byGrade[grade] = { earned: 0, total: 0 };
  let earned = 0;
  for (const t of trophies) {
    byGrade[t.grade].total += 1;
    if (progress.earned[t.id]) {
      earned += 1;
      byGrade[t.grade].earned += 1;
    }
  }
  const percent = trophies.length ? Math.round((earned / trophies.length) * 100) : 0;
  return { earned, total: trophies.length, percent, byGrade };
}

export function counterText(trophy, progress) {
  if (!trophy.target) return '';
  const done = Math.min(progress.counters[trophy.id] || 0, trophy.target);
  return done + ' / ' + trophy.target;
}
