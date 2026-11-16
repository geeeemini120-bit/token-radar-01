# token-radar-01

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/geeeemini120-bit/token-radar-01/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/geeeemini120-bit/token-radar-01/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Token Radar ranks every pre-token protocol in the DefiLlama snapshot by implied value, so the next token launch is found before it happens instead of after. The board covers the full 40-protocol watchlist plus 160 early pre-token protocols below the watchlist floor, separates the 24 live-token protocols with their market caps, and gives every row a farm plan with concrete steps, costs and times.

## Run it

```sh
node main.ts --input snapshot.json --output out
```

`snapshot.json` is the sealed competition snapshot (`/input/snapshot.json` in the grader). The program writes `out/board.json`, `out/data.js`, `out/dashboard/`, `out/screenshots/` and `out/dossier.json`. Node 22 or newer, standard library only, no network at run time, deterministic: the same snapshot always writes the same bytes.

## How it ranks

One function scores every row from the snapshot figures, no protocol name special-cased:

```
implied = round(tvl x 0.25 x (1 + clamp(change_7d, -60, 120) / 100 x 0.75)
              x (0.6 + min(age_days, 1095) / 1095 x 0.4)
              x (0.65 + category_rate)
              x (1 + min(chains, 8) x 0.04))
```

- **TVL** is the base: a protocol's locked value is the closest public proxy for what its token would be worth.
- **Seven-day growth** is momentum, clamped so a single week cannot dominate.
- **Age with no token** is maturity: a protocol that has run for years without a token has had longer to build the distribution a launch needs.
- **Category rate** is counted from the snapshot at run time: the share of the protocol's own category that already has a token. Lending (79%) and Dexs (74%) launch tokens far more often than Risk Curators (13%), so the model demotes the categories that rarely launch instead of ranking them first on TVL alone.
- **Chain count** is a small multiplier for protocols live on several chains.

Readiness (0–100) is the same factors bounded: size log-scaled, growth, age and category rate. The dashboard's model sandbox lets you change the three weights and watch the board re-rank live; the sandbox never changes `board.json`.

## Dashboard

`dashboard/` is a static page (no framework, no network). It shows the top picks, a sortable and filterable board with a per-protocol detail drawer (model breakdown, why it ranks here, farm plan), a live-token view, and the model panel with the category-rate table and the sandbox. `screenshots/` holds the three views the judge compares — the board, a detail view, and a filtered view — as base64 text (`*.jpg.b64`, decoded to JPEG by `main.ts` at run time, because the repository's push route carries text files only); the `.jpg` files beside them are the same views for a human reader.

## Farm plans

Every row carries seven steps with chain-aware gas (Ethereum about $6–12, Solana about $0.01, L2s about $0.30–1.50, BSC/Polygon/Avalanche about $0.20–0.80), a category-specific action, capital by TVL tier ($50/$100/$150/$250) and a hold of 30–60 days by age.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
