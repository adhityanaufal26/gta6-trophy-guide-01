// Next-up planner: ranks unearned trophies so the checklist always answers "what next?".
// Earliest roadmap stage first, counters nearest completion first within a stage,
// missables in the current stage pulled forward. Pure functions over the trophy list.
import { counterText } from './filters.js';

export function currentStage(trophies, progress) {
  for (const stage of [1, 2, 3, 4]) {
    if (trophies.some((t) => t.roadmap_stage === stage && !progress.earned[t.id])) return stage;
  }
  return 4;
}

function counterRatio(trophy, progress) {
  if (!trophy.target) return 0;
  return Math.min((progress.counters[trophy.id] || 0) / trophy.target, 1);
}

function nextUpScore(trophy, progress, stageNow) {
  let score = (trophy.roadmap_stage - 1) * 100;
  score += trophy.target ? (1 - counterRatio(trophy, progress)) * 30 : 30;
  if (trophy.missable && trophy.roadmap_stage === stageNow) score -= 25;
  if (trophy.id === 7) score += 50; // the final mission goes last in the story run
  return score;
}

export function nextUpTrophies(trophies, progress, limit = 5) {
  const stageNow = currentStage(trophies, progress);
  return trophies
    .filter((t) => !progress.earned[t.id] && t.grade !== 'platinum')
    .map((t) => ({ trophy: t, score: nextUpScore(t, progress, stageNow) }))
    .sort((a, b) => a.score - b.score || a.trophy.id - b.trophy.id)
    .slice(0, limit)
    .map((entry) => entry.trophy);
}

export function nextUpReason(trophy, progress, stageNow) {
  if (trophy.missable && trophy.roadmap_stage === stageNow) return 'Missable — do this stage';
  if (trophy.target && (progress.counters[trophy.id] || 0) > 0) return 'Counter ' + counterText(trophy, progress);
  if (trophy.kind === 'story') return 'Next in story order';
  if (trophy.missable) return 'Missable — plan ahead';
  return 'Stage ' + trophy.roadmap_stage;
}
