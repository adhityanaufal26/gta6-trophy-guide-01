# Leonida Ledger — GTA VI Trophy Guide & Tracker

![make.fun competition](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/adhityanaufal26/gta6-trophy-guide-01/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/adhityanaufal26/gta6-trophy-guide-01/reward.svg)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the make.fun bounty [Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Checklist** of the official 55 (1 platinum, 2 gold, 6 silver, 46 bronze) with official names, descriptions and grades, saved progress in `localStorage`, progress counters for the 22 trophies PSN tracks by count (42 Shooting Range golds, 250 stunts, 100 WAiNK locations, …), per-trophy notes, and filters by kind, grade, status, missable-only and text search.
- **Guide pane** for every trophy: our own words from the official description — what to do, how to track it, when it can be missed — with sources cited beside each guide (Exophase for the official list, PSNProfiles for PSN counts, and our own advice, honestly marked where a place is not yet checked in the game).
- **Roadmap** to the platinum in four stages (story run → strands & people → activities & crime → collectibles & cleanup) with per-stage progress.
- **Missables** view flagging the 17 trophies that can be locked or missed, with the safe window for each.
- **Spoiler shield** that hides unearned story trophies until earned, plus **export / import / reset** for your progress file.
- Works fully offline from static files under `app/` — no build step, no network requests, no accounts.

## How to run

```bash
node serve.ts
```

Then open the printed local address in a desktop browser. Any static file server pointed at `app/` works the same way. Add `?demo=1` to preview with sample progress (13 of 55 earned); the demo never overwrites a real save.

## Handing in

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json` with the kit's `buildDossier`.

## License

MIT — see `LICENSE`.
