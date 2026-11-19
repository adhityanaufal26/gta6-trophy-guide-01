// Platinum roadmap and missable windows, built from the official descriptions and PSN counts.
export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Story run',
    blurb: 'Play the story in chapter order: Gone Fishing, Chapters 1–4, the named missions (Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown, Operation Savage Glory), then the final mission. Make choices as they come — Actions Speak Louder counts 500 of them. Keep a separate save before the final mission. Thirteen trophies sit here: the seven chapter and finale beats, six named missions, and the 500-choice count.',
  },
  {
    stage: 2,
    title: 'Stage 2 — Strands & people',
    blurb: 'Before the finale if you can: finish the five named-character chains (Andy, Kenton, Billy, Randy, Tyrone), the 8 stranger strands, Bret\u2019s unique hunt and Cal\u2019s fishing challenge. Character content is the classic lock-out risk, so this stage sits ahead of the final mission in the safe order. Eight trophies: five character finales, Strangers & Freaks (8 strands), Fair Game and Baited My Tackle.',
  },
  {
    stage: 3,
    title: 'Stage 3 — Activities & crime',
    blurb: 'The open-world grind: 250 stunts, 42 Shooting Range golds, 14 drone-race wins, 20 race wins, 50 challenges, 5 bank vaults, gang operations (9), robberies, escapes, partner trophies and the money totals ($250,000 laundered, $100,000 spent). Free roam, any order. Twenty-five trophies — the biggest stage; every PSN count here (250, 42, 14, 20, 50, 5, 9, $250,000, $100,000) is tracked by the checklist counters.',
  },
  {
    stage: 4,
    title: 'Stage 4 — Collectibles & cleanup',
    blurb: 'One grand tour: explore all 52 areas, meditate at 18 spots, WAiNK It at 100 locations, discover 100 vehicles, complete 3 card sets, buy 8 garages, register 10 vehicles. Then 100% completion — and the platinum lands with the last trophy. Nine trophies, all counted: 52 areas, 18 spots, 100 WAiNK locations, 100 vehicles, 3 card sets, 8 garages, 10 registrations, 100% completion, platinum.',
  },
];

export function stageTrophies(trophies, stage) {
  return trophies.filter((t) => t.roadmap_stage === stage);
}

export function stageProgress(trophies, progress, stage) {
  const list = stageTrophies(trophies, stage);
  const earned = list.filter((t) => progress.earned[t.id]).length;
  return { earned, total: list.length, percent: list.length ? Math.round((earned / list.length) * 100) : 0 };
}

export function missableWindow(trophy) {
  if (trophy.kind === 'story') return 'Finish before the final mission; keep a pre-finale save.';
  if (trophy.id === 20 || trophy.id === 29) return 'Do it when the character offers it; save first.';
  if (trophy.id === 33 || trophy.id === 34) return 'Needs your partner in free roam; do both partner trophies together.';
  if (trophy.id === 37 || trophy.id === 45) return 'Tied to a place the story visits; try it while you have access.';
  if (trophy.id === 48) return 'Choices lock once made — talk to everyone, pick an option every time.';
  return 'One-off or scripted moment suspected; keep a save and retry from it.';
}

export function missableTrophies(trophies) {
  return trophies.filter((t) => t.missable);
}
