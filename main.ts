// Token Radar's entry program (Node 22, standard library only).
//
// Reads the sealed snapshot from /input/snapshot.json (or --input <file|dir>), scores every
// rankable pre-token protocol with the radar-2 model in lib/model.ts, writes the ranked board to
// /output/board.json, and copies this repository's dashboard/ and screenshots/ to /output. It
// writes the dashboard's data beside the page as data.js, and last writes /output/dossier.json,
// the summary the judge reads, with the vendored make.fun library.
//
// The dashboard is a static page, no framework and no network: dashboard/index.html, dashboard/app.css
// and dashboard/app.js read /output/data.js, which this program writes from the same board. The
// program is deterministic: the same snapshot always writes the same bytes, so the grader's two
// runs agree.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../input/snapshot.json

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { boardIssue, buildRadar, dataScript, parseSnapshot } from './lib/model.ts';
import { buildDossier } from './vendor/makefun-board.ts';

const here = fileURLToPath(new URL('.', import.meta.url));

/** The scorer's own caps (reference/gate.json): the text cap shapes the bytes, the rest refuse. */
const TEXT_MAX_BYTES = 65_536;
const SCREENSHOT_CAPS = { max: 4, max_bytes: 524_288 };
const IMAGE_NAME = /^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/;

/** --name <value> out of the arguments, or the fallback. */
function arg(name: string, fallback: string): string {
  const at = process.argv.indexOf(`--${name}`);
  if (at >= 0 && at + 1 < process.argv.length) return process.argv[at + 1]!;
  const withEquals = process.argv.find((a) => a.startsWith(`--${name}=`));
  return withEquals === undefined ? fallback : withEquals.slice(name.length + 3);
}

const inputArg = arg('input', '/input');
const inputFile = inputArg.endsWith('.json') ? inputArg : join(inputArg, 'snapshot.json');
if (!existsSync(inputFile)) {
  process.stderr.write(`token radar: no snapshot at ${inputFile}: pass --input <snapshot.json|directory> or mount the sealed /input\n`);
  process.exit(2);
}
const out = arg('output', process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const snapshot = parseSnapshot(readFileSync(inputFile, 'utf8'));
const { board, radar } = buildRadar(snapshot);
const issue = boardIssue(board, snapshot);
if (issue !== null) {
  process.stderr.write(`token radar: the model wrote a board the gate refuses: ${issue}\n`);
  process.exit(1);
}

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'board.json'), `${JSON.stringify({ rows: board })}\n`);
writeFileSync(join(out, 'data.js'), dataScript(radar));

/** Copy one directory's regular files into `to`, skipping names that start with a dot. */
function copyFiles(from: string, to: string): string[] {
  if (!existsSync(from)) return [];
  mkdirSync(to, { recursive: true });
  const copied: string[] = [];
  for (const name of readdirSync(from)) {
    if (name.startsWith('.')) continue;
    const path = join(from, name);
    if (!statSync(path).isFile()) continue;
    copyFileSync(path, join(to, name));
    copied.push(name);
  }
  return copied;
}

copyFiles(join(here, 'dashboard'), join(out, 'dashboard'));

// The three screenshots the judge reads are stored in this repository as base64 text
// (screenshots/<name>.jpg.b64): the push route carries UTF-8 files only, so the binary JPEGs
// cannot be pushed as files. This program decodes each one into a whole JPEG in /output.
// The .jpg files beside them in screenshots/ are the same views for a human reader; the program
// reads only the .b64 text, so a local run and the grader's run decode the same bytes.
const shotsDir = join(here, 'screenshots');
const encoded = existsSync(shotsDir) ? readdirSync(shotsDir).filter((n) => n.endsWith('.jpg.b64')) : [];
if (encoded.length < 3) {
  process.stderr.write(`token radar: screenshots/ holds ${encoded.length} base64 view${encoded.length === 1 ? '' : 's'}: hand in 3, the board, a detail view and a filtered view\n`);
  process.exit(1);
}
mkdirSync(join(out, 'screenshots'), { recursive: true });
const shots: string[] = [];
for (const name of encoded.sort()) {
  const outName = name.slice(0, -4);
  if (!IMAGE_NAME.test(outName)) {
    process.stderr.write(`token radar: screenshots/${outName}: a name is letters, digits and . _ -, 1 to 128 characters\n`);
    process.exit(1);
  }
  const bytes = Buffer.from(readFileSync(join(shotsDir, name), 'utf8').replace(/\s+/g, ''), 'base64');
  if (bytes.length < 2 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
    process.stderr.write(`token radar: screenshots/${name} does not decode to a whole JPEG\n`);
    process.exit(1);
  }
  if (bytes.length > SCREENSHOT_CAPS.max_bytes) {
    process.stderr.write(`token radar: screenshots/${outName} is ${bytes.length} bytes, past the ${SCREENSHOT_CAPS.max_bytes} cap\n`);
    process.exit(1);
  }
  writeFileSync(join(out, 'screenshots', outName), bytes);
  shots.push(outName);
}

// The dossier is written last: the scorer rebuilds it from this /output and compares bytes.
writeFileSync(join(out, 'dossier.json'), buildDossier(out, { text_max_bytes: TEXT_MAX_BYTES, screenshots: SCREENSHOT_CAPS, dashboard: { max_files: 400, max_bytes: 4_194_304 } }));

process.stdout.write(
  `token radar: ${snapshot.protocols.length} protocols, ${snapshot.watchlist.length} on the watchlist, ${board.length} rows scored (${radar.early_size} early, ${radar.live_size} live set aside)\n` +
    `token radar: wrote ${join(out, 'board.json')}, ${join(out, 'data.js')}, ${join(out, 'dashboard')} (3 files), ${join(out, 'screenshots')} (${shots.length} images) and ${join(out, 'dossier.json')}\n`,
);
