// Boot and routing: load trophies, wire tabs, filters and detail pane, support the demo seed.
import { defaultFilters } from './filters.js';
import {
  demoProgress, downloadProgressFile, emptyProgress, importProgressJson, loadProgress,
  saveProgress, setCounter, setNote, setSpoiler, toggleEarned,
} from './store.js';
import {
  renderChecklist, renderDetailPane, renderFilterBar, renderHeaderStats,
  renderMissablesView, renderNextUp, renderRoadmapView, renderSaveView,
} from './views.js';

const state = {
  trophies: [],
  progress: emptyProgress(),
  filters: defaultFilters(),
  view: 'checklist',
  selectedId: null,
  demo: false,
};

function readQuery() {
  const q = new URLSearchParams(location.search);
  state.demo = q.get('demo') === '1';
  const view = q.get('view');
  if (['checklist', 'roadmap', 'missables', 'save'].includes(view)) state.view = view;
  const sel = Number(q.get('select'));
  if (sel) state.selectedId = sel;
  if (q.get('kind')) state.filters.kind = q.get('kind');
  if (q.get('grade')) state.filters.grade = q.get('grade');
  if (q.get('status')) state.filters.status = q.get('status');
  if (q.get('missable') === '1') state.filters.missableOnly = true;
  if (q.get('q')) state.filters.query = q.get('q');
  return q;
}

function persist() {
  if (!state.demo) saveProgress(state.progress);
}

function selectedTrophy() {
  return state.trophies.find((t) => t.id === state.selectedId) || state.trophies[0] || null;
}

function render() {
  document.getElementById('header-stats').innerHTML = renderHeaderStats(state.trophies, state.progress);
  for (const btn of document.querySelectorAll('[data-view]')) {
    btn.classList.toggle('active', btn.dataset.view === state.view);
  }
  const main = document.getElementById('view-main');
  const detail = document.getElementById('detail-pane');
  const bar = document.getElementById('filter-bar');
  const nextUp = document.getElementById('next-up');
  if (state.view === 'checklist') {
    bar.hidden = false;
    nextUp.hidden = false;
    main.innerHTML = renderChecklist(state.trophies, state.progress, state.filters, state.selectedId);
    const count = main.querySelectorAll('.row').length;
    bar.innerHTML = renderFilterBar(state.filters, state.progress, count, state.trophies.length);
    nextUp.innerHTML = renderNextUp(state.trophies, state.progress);
    detail.innerHTML = renderDetailPane(selectedTrophy(), state.progress);
  } else if (state.view === 'roadmap') {
    bar.hidden = true;
    nextUp.hidden = true;
    main.innerHTML = renderRoadmapView(state.trophies, state.progress);
    detail.innerHTML = renderDetailPane(selectedTrophy(), state.progress);
  } else if (state.view === 'missables') {
    bar.hidden = true;
    nextUp.hidden = true;
    main.innerHTML = renderMissablesView(state.trophies, state.progress);
    detail.innerHTML = renderDetailPane(selectedTrophy(), state.progress);
  } else {
    bar.hidden = true;
    nextUp.hidden = true;
    main.innerHTML = renderSaveView(state.progress);
    detail.innerHTML = renderDetailPane(selectedTrophy(), state.progress);
  }
  wireDynamicControls();
}

function wireDynamicControls() {
  const kind = document.getElementById('f-kind');
  if (kind) {
    kind.addEventListener('change', () => { state.filters.kind = kind.value; render(); });
    document.getElementById('f-grade').addEventListener('change', (e) => { state.filters.grade = e.target.value; render(); });
    document.getElementById('f-status').addEventListener('change', (e) => { state.filters.status = e.target.value; render(); });
    document.getElementById('f-missable').addEventListener('change', (e) => { state.filters.missableOnly = e.target.checked; render(); });
    document.getElementById('f-spoiler').addEventListener('change', (e) => { setSpoiler(state.progress, e.target.checked); persist(); render(); });
    const query = document.getElementById('f-query');
    query.addEventListener('input', () => {
      state.filters.query = query.value;
      const main = document.getElementById('view-main');
      main.innerHTML = renderChecklist(state.trophies, state.progress, state.filters, state.selectedId);
      wireRowControls();
    });
  }
  const saveSpoiler = document.getElementById('save-spoiler');
  if (saveSpoiler) saveSpoiler.addEventListener('change', (e) => { setSpoiler(state.progress, e.target.checked); persist(); render(); });
  const exportBtn = document.getElementById('btn-export');
  if (exportBtn) exportBtn.addEventListener('click', () => downloadProgressFile(state.progress));
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    state.progress = emptyProgress();
    persist();
    render();
    const status = document.getElementById('save-status');
    if (status) status.textContent = 'Progress reset.';
  });
  const importInput = document.getElementById('file-import');
  if (importInput) importInput.addEventListener('change', async () => {
    const file = importInput.files[0];
    if (!file) return;
    try {
      state.progress = importProgressJson(await file.text());
      persist();
      render();
      const status = document.getElementById('save-status');
      if (status) status.textContent = 'Progress imported.';
    } catch {
      const status = document.getElementById('save-status');
      if (status) status.textContent = 'Import failed: that file is not a Leonida Ledger progress export.';
    }
  });
  wireRowControls();
}

function wireRowControls() {
  for (const box of document.querySelectorAll('[data-earned]')) {
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => {
      toggleEarned(state.progress, Number(box.dataset.earned));
      persist();
      render();
    });
  }
  for (const input of document.querySelectorAll('[data-counter]')) {
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('change', () => {
      setCounter(state.progress, Number(input.dataset.counter), input.value);
      persist();
      render();
    });
  }
  for (const row of document.querySelectorAll('[data-select]')) {
    if (row.dataset.wired) continue;
    row.dataset.wired = '1';
    row.addEventListener('click', () => {
      state.selectedId = Number(row.dataset.select);
      render();
    });
  }
  const noteBox = document.getElementById('note-box');
  if (noteBox) {
    noteBox.addEventListener('input', () => {
      setNote(state.progress, Number(noteBox.dataset.note), noteBox.value);
      persist();
    });
  }
}

const VIEW_KEYS = { '1': 'checklist', '2': 'roadmap', '3': 'missables', '4': 'save' };

function visibleRowIds() {
  return [...document.querySelectorAll('#view-main [data-select]')].map((el) => Number(el.dataset.select));
}

function moveSelection(delta) {
  const ids = visibleRowIds();
  if (!ids.length) return;
  const at = ids.indexOf(state.selectedId);
  const next = at === -1 ? 0 : Math.min(ids.length - 1, Math.max(0, at + delta));
  state.selectedId = ids[next];
  render();
  const row = document.querySelector('#view-main .row.selected');
  if (row) row.scrollIntoView({ block: 'nearest' });
}

function handleKeys(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  if (VIEW_KEYS[e.key]) {
    state.view = VIEW_KEYS[e.key];
    render();
    return;
  }
  if (e.key === '/') {
    e.preventDefault();
    if (state.view !== 'checklist') { state.view = 'checklist'; render(); }
    const query = document.getElementById('f-query');
    if (query) { query.focus(); query.select(); }
    return;
  }
  if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1); return; }
  if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1); return; }
  if (e.key === ' ' || e.key === 'Enter') {
    if (e.target.closest && e.target.closest('button')) return;
    if (!state.selectedId) return;
    e.preventDefault();
    toggleEarned(state.progress, state.selectedId);
    persist();
    render();
  }
}

async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  return Array.isArray(data) ? data : data.trophies;
}

async function boot() {
  const q = readQuery();
  state.progress = state.demo ? demoProgress() : loadProgress();
  if (q.get('spoiler') === '1') setSpoiler(state.progress, true);
  state.trophies = await loadTrophies();
  if (!state.selectedId) state.selectedId = state.demo ? 17 : 1;
  for (const btn of document.querySelectorAll('[data-view]')) {
    btn.addEventListener('click', () => { state.view = btn.dataset.view; render(); });
  }
  document.addEventListener('keydown', handleKeys);
  render();
  const listEl = document.getElementById('view-main');
  const selectedRow = listEl.querySelector('.row.selected');
  if (selectedRow) listEl.scrollTop = Math.max(0, selectedRow.offsetTop - listEl.clientHeight / 2);
}

boot().catch((err) => {
  document.getElementById('view-main').innerHTML = '<p class="empty">Could not load trophy data: ' + err.message + '</p>';
});
