// Rendering: header stats, filter bar, checklist, guide detail, roadmap, missables and save views.
import { applyFilters, counterText, displayDescription, displayName, isSpoilerHidden, progressStats } from './filters.js';
import { currentStage, nextUpReason, nextUpTrophies } from './planner.js';
import { ROADMAP_STAGES, missableTrophies, missableWindow, stageProgress, stageTrophies } from './roadmap.js';

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function gradeBadge(grade) {
  const label = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' }[grade] || grade;
  return '<span class="badge grade-' + grade + '">' + label + '</span>';
}

export function kindTag(kind) {
  const label = { story: 'Story', collectible: 'Collectible', activity: 'Activity' }[kind] || kind;
  return '<span class="tag kind-' + kind + '">' + label + '</span>';
}

export function renderHeaderStats(trophies, progress) {
  const s = progressStats(trophies, progress);
  const chip = (g) => '<span class="stat-chip grade-' + g + '">' + g + ' ' + s.byGrade[g].earned + '/' + s.byGrade[g].total + '</span>';
  return (
    '<div class="big-count"><span id="earned-count">' + s.earned + '</span> <span class="of">of ' + s.total + '</span></div>' +
    '<div class="progress-track" role="progressbar" aria-valuenow="' + s.percent + '"><div class="progress-fill" style="width:' + s.percent + '%"></div></div>' +
    '<div class="progress-label">' + s.percent + '% to platinum</div>' +
    '<div class="stat-chips">' + chip('platinum') + chip('gold') + chip('silver') + chip('bronze') + '</div>'
  );
}

export function renderFilterBar(filters, progress, shown, total) {
  const opt = (v, label, cur) => '<option value="' + v + '"' + (v === cur ? ' selected' : '') + '>' + label + '</option>';
  return (
    '<label>Kind <select id="f-kind">' +
    opt('all', 'All kinds', filters.kind) + opt('story', 'Story', filters.kind) +
    opt('collectible', 'Collectibles', filters.kind) + opt('activity', 'Activities', filters.kind) +
    '</select></label>' +
    '<label>Grade <select id="f-grade">' +
    opt('all', 'All grades', filters.grade) + opt('platinum', 'Platinum', filters.grade) +
    opt('gold', 'Gold', filters.grade) + opt('silver', 'Silver', filters.grade) + opt('bronze', 'Bronze', filters.grade) +
    '</select></label>' +
    '<label>Status <select id="f-status">' +
    opt('all', 'All', filters.status) + opt('earned', 'Earned', filters.status) + opt('unearned', 'Unearned', filters.status) +
    '</select></label>' +
    '<label class="check"><input type="checkbox" id="f-missable"' + (filters.missableOnly ? ' checked' : '') + '> Missable only</label>' +
    '<label class="check"><input type="checkbox" id="f-spoiler"' + (progress.settings.spoiler ? ' checked' : '') + '> Spoiler shield</label>' +
    '<input type="search" id="f-query" placeholder="Search trophies…" value="' + escapeHtml(filters.query) + '">' +
    '<span class="shown-count">Showing ' + shown + ' of ' + total + '</span>'
  );
}

export function renderChecklist(trophies, progress, filters, selectedId) {
  const list = applyFilters(trophies, progress, filters);
  if (!list.length) return '<p class="empty">No trophies match these filters.</p>';
  return list.map((t) => {
    const earned = !!progress.earned[t.id];
    const hidden = isSpoilerHidden(t, progress);
    const counter = t.target
      ? '<span class="counter"><input type="number" min="0" max="' + t.target + '" value="' + (progress.counters[t.id] || 0) + '" data-counter="' + t.id + '" aria-label="Progress for ' + escapeHtml(t.name) + '"> / ' + t.target + '</span>'
      : '';
    return (
      '<article class="row' + (earned ? ' earned' : '') + (t.id === selectedId ? ' selected' : '') + '" data-select="' + t.id + '">' +
      '<input type="checkbox" data-earned="' + t.id + '"' + (earned ? ' checked' : '') + ' aria-label="Mark earned">' +
      '<div class="row-main"><div class="row-name">' + escapeHtml(displayName(t, progress)) + '</div>' +
      '<div class="row-desc">' + escapeHtml(displayDescription(t, progress)) + '</div></div>' +
      '<div class="row-meta">' + gradeBadge(t.grade) + kindTag(t.kind) +
      (t.missable ? '<span class="tag missable">Missable</span>' : '') +
      (hidden ? '<span class="tag hidden-tag">Hidden</span>' : '') + counter +
      '</div></article>'
    );
  }).join('');
}

export function renderDetailPane(trophy, progress) {
  if (!trophy) return '<p class="empty">Select a trophy to read its guide.</p>';
  const earned = !!progress.earned[trophy.id];
  const hidden = isSpoilerHidden(trophy, progress);
  const sources = (trophy.sources || []).map((s) =>
    s.url
      ? '<li><a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.label) + '</a></li>'
      : '<li>' + escapeHtml(s.label) + '</li>'
  ).join('');
  const counter = trophy.target
    ? '<p class="detail-counter">Progress: <strong>' + counterText(trophy, progress) + '</strong> (PSN target ' + trophy.target + ')</p>'
    : '';
  const note = progress.notes[trophy.id] || '';
  return (
    '<div class="detail-head">' + gradeBadge(trophy.grade) + kindTag(trophy.kind) +
    (trophy.missable ? '<span class="tag missable">Missable</span>' : '') +
    '<span class="tag stage">Stage ' + trophy.roadmap_stage + '</span>' +
    '<span class="tag ' + (earned ? 'earned-tag' : '') + '">' + (earned ? 'Earned' : 'Not earned') + '</span></div>' +
    '<h2>' + escapeHtml(displayName(trophy, progress)) + '</h2>' +
    '<p class="detail-desc">' + escapeHtml(displayDescription(trophy, progress)) + '</p>' +
    counter +
    '<h3>Guide</h3><p class="guide-text">' + escapeHtml(hidden ? 'Guide hidden by the spoiler shield until this story trophy is earned.' : trophy.guide) + '</p>' +
    (trophy.missable ? '<p class="missable-note"><strong>Missable:</strong> ' + escapeHtml(missableWindow(trophy)) + '</p>' : '') +
    '<h3>Sources</h3><ul class="sources">' + sources + '</ul>' +
    '<h3>Your note</h3><textarea id="note-box" data-note="' + trophy.id + '" rows="3" placeholder="Locations found, choices made, what is left…">' + escapeHtml(note) + '</textarea>'
  );
}

export function renderRoadmapView(trophies, progress) {
  return ROADMAP_STAGES.map((stage) => {
    const p = stageProgress(trophies, progress, stage.stage);
    const rows = stageTrophies(trophies, stage.stage).map((t) =>
      '<li class="' + (progress.earned[t.id] ? 'done' : '') + '">' +
      (progress.earned[t.id] ? '✓ ' : '○ ') + escapeHtml(displayName(t, progress)) + ' ' + gradeBadge(t.grade) +
      (t.target ? ' <span class="mini-count">' + counterText(t, progress) + '</span>' : '') +
      (t.missable ? ' <span class="tag missable">Missable</span>' : '') + '</li>'
    ).join('');
    return (
      '<section class="stage-card"><h2>' + escapeHtml(stage.title) + '</h2>' +
      '<p class="stage-blurb">' + escapeHtml(stage.blurb) + '</p>' +
      '<div class="progress-track"><div class="progress-fill" style="width:' + p.percent + '%"></div></div>' +
      '<p class="stage-count">' + p.earned + ' of ' + p.total + ' earned (' + p.percent + '%)</p>' +
      '<ul class="stage-list">' + rows + '</ul></section>'
    );
  }).join('') +
    '<p class="roadmap-foot">Roadmap built from the official descriptions and PSN counts (Exophase / PSNProfiles). Order advice is ours; locks are not yet checked in the game.</p>';
}

export function renderMissablesView(trophies, progress) {
  const list = missableTrophies(trophies);
  const rows = list.map((t) =>
    '<article class="row' + (progress.earned[t.id] ? ' earned' : '') + '" data-select="' + t.id + '">' +
    '<div class="row-main"><div class="row-name">' + escapeHtml(displayName(t, progress)) + '</div>' +
    '<div class="row-desc">' + escapeHtml(missableWindow(t)) + '</div></div>' +
    '<div class="row-meta">' + gradeBadge(t.grade) + kindTag(t.kind) +
    '<span class="tag missable">Missable</span>' +
    '<span class="tag">' + (progress.earned[t.id] ? 'Earned' : 'At risk') + '</span></div></article>'
  ).join('');
  return (
    '<p class="view-intro">' + list.length + ' trophies flagged missable from the official descriptions: character chains and stranger strands that a finale can lock, partner trophies that need free-roam partner access, one-off moments, and the 500-choice count. Flags are precautions where the guide says so — none is yet checked in the game.</p>' + rows
  );
}

export function renderSaveView(progress) {
  const earned = Object.keys(progress.earned).filter((k) => progress.earned[k]).length;
  return (
    '<section class="save-card"><h2>Save &amp; settings</h2>' +
    '<p>Progress saves automatically in this browser (localStorage): earned ticks, counters, notes and the spoiler setting. Currently <strong>' + earned + ' earned</strong>.</p>' +
    '<div class="save-actions">' +
    '<button id="btn-export" type="button">Export progress (JSON)</button>' +
    '<label class="import-label">Import progress <input type="file" id="file-import" accept="application/json"></label>' +
    '<button id="btn-reset" type="button" class="danger">Reset all progress</button></div>' +
    '<label class="check big"><input type="checkbox" id="save-spoiler"' + (progress.settings.spoiler ? ' checked' : '') + '> Spoiler shield — hide unearned story trophies</label>' +
    '<p class="save-note">Export before clearing browser data. Import replaces the progress on this device. The demo seed (?demo=1) never overwrites your real save.</p>' +
    '<p id="save-status" class="save-status" role="status"></p></section>'
  );
}

export function renderNextUp(trophies, progress) {
  const picks = nextUpTrophies(trophies, progress, 5);
  if (!picks.length) return '<p class="next-up-empty">All trophies earned — platinum unlocked.</p>';
  const stageNow = currentStage(trophies, progress);
  const cards = picks.map((t) => {
    const pct = t.target ? Math.round(Math.min(((progress.counters[t.id] || 0) / t.target) * 100, 100)) : 0;
    const bar = t.target
      ? '<span class="next-bar"><span class="next-bar-fill" style="width:' + pct + '%"></span></span>'
      : '';
    return (
      '<button type="button" class="next-card" data-select="' + t.id + '">' +
      '<span class="next-name">' + escapeHtml(displayName(t, progress)) + '</span>' +
      '<span class="next-meta">' + gradeBadge(t.grade) + '<span class="tag stage">Stage ' + t.roadmap_stage + '</span>' +
      (t.missable ? '<span class="tag missable">Missable</span>' : '') + '</span>' +
      '<span class="next-reason">' + escapeHtml(nextUpReason(t, progress, stageNow)) + '</span>' + bar + '</button>'
    );
  }).join('');
  return (
    '<div class="next-up-head"><h2>Next up</h2>' +
    '<span class="next-up-sub">Stage ' + stageNow + ' in progress — earliest stage, nearest counters, missables first</span></div>' +
    '<div class="next-cards">' + cards + '</div>'
  );
}
