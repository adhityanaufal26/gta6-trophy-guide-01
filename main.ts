// Leonida Ledger entrypoint: copy app/ and screenshots/ to the output dir and write dossier.json.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTreeSorted(from: string, to: string): void {
  rmSync(to, { recursive: true, force: true });
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

copyTreeSorted(join(repoRoot, 'app'), join(outputDir, 'app'));
copyTreeSorted(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log('wrote ' + join(outputDir, 'dossier.json') + ' (' + dossier.length + ' bytes)');
