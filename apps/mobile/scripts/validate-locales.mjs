// Every locale must have the same keys and the same {{placeholders}} (adapted from texttranslator).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/i18n/locales');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
const data = Object.fromEntries(files.map((f) => [f, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))]));
const ref = data['fi.json'];
const ph = (s) => [...String(s).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort().join(',');
const problems = [];
for (const [f, d] of Object.entries(data)) {
  for (const k of Object.keys(ref)) {
    if (!(k in d)) problems.push(`${f}: missing ${k}`);
    else if (ph(d[k]) !== ph(ref[k])) problems.push(`${f}: placeholders differ in ${k}`);
    else if (!String(d[k]).trim()) problems.push(`${f}: empty ${k}`);
  }
  for (const k of Object.keys(d)) if (!(k in ref)) problems.push(`${f}: extra ${k}`);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`Locales OK: ${files.length} files × ${Object.keys(ref).length} keys`);
