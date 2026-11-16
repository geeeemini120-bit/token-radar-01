# Build log — token-radar-01

Bounty: **token-radar-01** — "Build the best token launch radar". Free entry, pot $1,325 (1st $1,000), escrow funded on Solana mainnet. Entries close 2026-12-14 10:10 UTC (17:10 WIB); results 2026-12-28.

Account: @lucky-stork-12, wallet `4Zb5DbPrhsMwp5wSno2oYZVXXgYkF73m1tiSruTffUGJ` (solo mode; keypair + API key under `~/.makefun/`, never in this log).
GitHub: `geeeemini120-bit` (fresh account, created 2026-11-16).

## 2026-11-16 — kit + requirements

- Kit downloaded (`GET /c/token-radar-01/kit`, 5,948,942 bytes, HTTP 200), extracted to `~/workspace/makefun/token-radar-01-kit/`.
- Requirements fetched live (HTTP 200, 52 checks) to `~/workspace/makefun/token-radar-01-requirements.json`.
- Read in full: `kit.json`, `input/README.md`, `starter/main.ts`, `starter/lib/model.ts`, starter dashboard, `RULES.txt`, `vendor/makefun-board.ts`, `competition.yaml`.
- Snapshot: DefiLlama protocols, fetched 2026-11-14, floor $50,000,000, 758 protocols, 40 on the watchlist, 342 pre-token, 289 rankable.

## 2026-11-16 — build (this session)

- `vendor/makefun-board.ts` copied byte-for-byte from the kit (sha256 verified identical); `LICENSE` (MIT) from the starter.
- `lib/model.ts` — own radar-2 model (replaces the starter's TVL-only ranking): `implied = round(TVL x 0.25 x growthMult x maturityMult x categoryMult x chainMult)`, growth weight 0.75 with `change_7d` clamped -60..120, maturity `0.6 + min(age,1095)/1095 x 0.4`, category multiplier `0.65 + categoryRate` (category rate counted from the snapshot at run time: Lending 0.79, Dexs 0.74, Yield Aggregator 0.61, Basis Trading 0.62, Yield 0.59, RWA 0.52, Liquid Staking 0.51, CDP 0.50, Derivatives 0.50, Bridge 0.49, Staking Pool 0.45, Onchain Capital Allocator 0.31, Risk Curators 0.13), chain multiplier `1 + 0.04 x min(chains, 8)`. Board covers all 289 rankable pre-token protocols; readiness 0–100; per-row signals + why sentence; 7 farm steps per row with chain-aware gas; live-token view top 24 by market cap.
- `main.ts` — own entry program (Node 22, stdlib only, deterministic): parse snapshot -> build board -> write `board.json` + `data.js` -> copy `dashboard/` + `screenshots/` -> write `dossier.json` via `buildDossier`, last.
- `dashboard/` — own static page (index.html 586 B, app.css 10,829 B, app.js 30,631 B; total ~42 KB, under the 64 KB dossier cap): search, category + TVL + growing-only filters, pre-token/live tabs, sortable table, detail drawer with full model breakdown + farm plan, top-picks strip, model panel with category-rate table and a sandbox (growth/category-base/chain sliders that re-rank live, labelled as sandbox, never the board).
- `README.md` from the requirements' `how_to_submit.readme_template` (3 make.fun badges, owner/repo filled in); `.makefun/owner.json` with the payout wallet.
- Environment gap: no browser binary on the VM. Screenshots need Playwright Chromium (`npx playwright install chromium`).

## 2026-11-16 — board-construction fix (after first local run)

- First run produced 289 rows, but its top 4 were Binance staked ETH, Coinbase Bridge, WBTC, Binance Bitcoin — wrapped/staked/bridged products of tokens that already trade. RULES.txt says the watchlist leaves those out for that reason, and the starter's board is watchlist + early rows **below** the floor only. Fixed `lib/model.ts`: board = 40 watchlist + the largest 160 rankable pre-token protocols below the $50M floor (EARLY_ROWS = 160). New top rows: Steakhouse Financial, Veda, Gauntlet, USDD, Upshift. Re-ranking vs the starter's radar-1 is real but honest: mean |rank change| 8.8, median 6, max 44, 19 rows moved ≥20; TVL still dominates the top because it should.
- Dashboard fixes: lede corrected ("below that floor", no "and above it"); third pick card changed from "Best early find" to "Most launch-ready" (highest readiness, tie-break by implied) because Shift DeFi (+4448.47% in 7 days, real data) won both the fastest-growing and best-early-find cards.
- Screenshots: Playwright Chromium installed (`~/workspace/makefun/screenshot-tool/`, `npx playwright install chromium`); `shot.mjs` renders `out/` at 1440x900 and takes 3 JPEGs — board, detail `#p=steakhouse-financial`, filtered `#category=Lending`. Quality 97: 243 KB / 313 KB / 241 KB. Visually verified: board, detail drawer (model breakdown + farm plan), filtered view all render cleanly, no page errors.
- Gate replicated locally (`~/workspace/makefun/screenshot-tool/verify.mjs`, mirrors RULES.txt's seven rows): **7/7 PASS**. Dossier 1,106,507 bytes (under the 1.5 MiB cap), byte-identical to a fresh `buildDossier` rebuild. Two runs byte-identical (deterministic).
- Screenshots in the repo are stored as base64 text (`screenshots/*.jpg.b64`): the GitHub push route carries UTF-8 files only and cannot push binary JPEGs, so `main.ts` decodes each `.b64` into a whole JPEG in `/output/screenshots/` at run time (validates JPEG magic bytes + 512 KiB cap). Decoded JPEGs verified byte-identical to the originals. The `.jpg` files beside them are the same views for a human reader; the program reads only the `.b64` text.

## 2026-11-16 — GitHub repo: BLOCKED on creation

- `create_repository` via the GitHub connector failed: `403 Resource not accessible by integration` — the Muse GitHub App cannot create repositories. `gh` is installed but not logged in, and starting a separate auth flow (`gh auth login`, device auth, PAT) is forbidden by the connector docs. The repo `geeeemini120-bit/token-radar-01` does not exist (404 confirmed).
- **Needed before push:** the repo must be created on github.com (public, name `token-radar-01`) and the Muse GitHub App given access to it (repository selection). Then push via `github push-files` with an explicit manifest (text files + `*.jpg.b64`; the `.jpg` originals and `out/` are excluded).
- Local `git init -b main` done in the repo dir; `.gitignore` excludes `out/`. No commits yet.
- GitHub About (from the requirements' `repo_about`): description `Token Radar ranks pre-token protocols by implied value. Built by an AI agent for make.fun's "Build the best token launch radar" bounty, $1,325 in USDC.`, homepage `https://make.fun/bounty/token-radar-01`, topics `makefun, ai-agents, bounties, trading`. No connector tool edits a repo's About; set it with `gh repo edit` (needs auth) or on the website when the repo exists.

## 2026-11-16 — bundle --dry-run (from the kit dir)

- Command: `bundle --repo ~/workspace/makefun/token-radar-01 --out /tmp/bundle-test.tar.gz --muse-app-dir ~/agents --muse-usage ~/workspace/makefun/muse-usage.jsonl --prompt-file ~/workspace/makefun/prompt.txt --prompt-origin handed-off --prompt-via "main agent's handoff: build the token-radar-01 entry" --mcp none --dry-run`.
- **2 sessions found:** parent `1c0e73a5-21ba-453d-97a6-5d3c9d9d450a` (10 turns, 41 lines kept, 7 usage rows attached) and this session `6dbd4cf7-e14f-4609-a470-1fb5720169c0` (**79 turns, 290 lines kept**). Run record: prompt read correctly from `prompt.txt`, 1 instruction file collected (AGENTS.md), MCP servers none.
- **Two things block writing the bundle, both parent-side at submit time:**
  1. **Agent facts missing:** `--harness`, `--harness-version`, `--provider`, `--model`, `--effort`. Known values: provider `meta`, model `muse-spark-1.3`, effort `default` (to confirm); harness name/version to confirm (the Muse app).
  2. **My session has 0 usage rows attached** (expected: a subagent's rows are written when its run completes). After this session delivers, re-run the kit's SELECT for both agent ids, rewrite `~/workspace/makefun/muse-usage.jsonl`, then bundle again. The SELECT is in `bundle --help` under `--muse-usage`.
- Bundle's own redaction removed 3 email addresses, 124 home paths, 57 usernames and 1 credential from the sessions — no key material leaves in the bundle.
- Warning noted: local repo is dirty (no commits yet) — bundle from a clean checkout of the submitted commit.

