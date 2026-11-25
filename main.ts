// Dapur Kilat — the entry program. Copies game/ and screenshots/ from
// this repository into the output directory and writes dossier.json there
// with make.fun's buildDossier. Node 22, standard library only.
// The grader runs it twice; both runs must write the same bytes.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000
};

function handIn(): void {
  // Start from a clean output directory so a stale file can never leak in.
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  // The game and its screenshots, copied whole.
  cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

  // The dossier is derived from exactly those copied files, so the bytes
  // the grader re-derives later match this file byte for byte.
  const dossier = buildDossier(outDir, dossierCaps);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

handIn();
console.log('Dapur Kilat handed in to ' + outDir);
