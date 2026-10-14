// WCAG AA check for every theme (adapted from AriCad/texttranslator packages/ui/scripts/check-contrast.mjs).
// Usage: node prototype/theme/check-contrast.mjs
import { createRequire } from 'node:module';
const { THEMES } = createRequire(import.meta.url)('./themes.js');
const lum = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const PAIRS = [
  ['textPrimary', 'background', 4.5], ['textPrimary', 'surface', 4.5], ['textSecondary', 'background', 4.5], ['textSecondary', 'surface', 4.5],
  ['textPrimary', 'primarySoft', 4.5], ['onActive', 'active', 4.5], ['link', 'surface', 4.5], ['link', 'background', 4.5],
  ['onSelected', 'selected', 4.5], ['badgeText', 'badge', 4.5], ['icon', 'surface', 3], ['accent', 'surface', 3],
];
const problems = [];
for (const [id, t] of Object.entries(THEMES)) for (const [fg, bg, min] of PAIRS) { const r = ratio(t[fg], t[bg]); if (r < min) problems.push(`theme ${id}: ${fg} on ${bg} is ${r.toFixed(2)}:1 (needs ${min})`); }
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`Contrast OK: ${Object.keys(THEMES).length} themes × ${PAIRS.length} pairs`);
