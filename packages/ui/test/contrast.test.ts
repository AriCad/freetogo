// WCAG AA for every theme (same pairs as prototype/theme/check-contrast.mjs, adapted from texttranslator).
import { describe, expect, it } from 'vitest';
import { THEMES, THEME_IDS, type Palette } from '../src/theme/themes';

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m) as [number, number];
  return (x + 0.05) / (y + 0.05);
};
const PAIRS: [keyof Palette, keyof Palette, number][] = [
  ['textPrimary', 'background', 4.5], ['textPrimary', 'surface', 4.5], ['textSecondary', 'background', 4.5], ['textSecondary', 'surface', 4.5],
  ['textPrimary', 'primarySoft', 4.5], ['onActive', 'active', 4.5], ['link', 'surface', 4.5], ['link', 'background', 4.5],
  ['onSelected', 'selected', 4.5], ['badgeText', 'badge', 4.5], ['icon', 'surface', 3], ['accent', 'surface', 3],
];

describe('theme contrast', () => {
  for (const id of THEME_IDS) {
    it(`theme ${id} passes WCAG AA`, () => {
      const p = THEMES[id].palette;
      for (const [fg, bg, min] of PAIRS) expect(ratio(p[fg], p[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(min);
    });
  }
  it('keeps the exact approved primaries', () => {
    expect(THEME_IDS.map((id) => THEMES[id].palette.primary)).toEqual(['#7A6FF0', '#E57C73', '#6FA37B', '#D8A23C', '#8B6B8F']);
  });
});
