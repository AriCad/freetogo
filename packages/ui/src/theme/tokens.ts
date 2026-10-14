/** Shared scales (same for every theme). Mirrors the prototype's tokens.css and texttranslator's tokens.ts. */
export const space = { xxs: 2, xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const gutter = 16;
/** Radii by role: cards 16, controls 14, sheets 28, pills round. */
export const radius = { tag: 8, control: 14, card: 16, sheet: 28, pill: 999 } as const;
export const touch = { min: 48, button: 52 } as const;

export const fonts = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
} as const;

/** Type scale (12/14/16/18/20/28/34). */
export const type = {
  display: { size: 34, line: 40 },
  title: { size: 28, line: 34 },
  heading: { size: 20, line: 26 },
  lead: { size: 18, line: 24 },
  body: { size: 16, line: 23 },
  small: { size: 14, line: 20 },
  tiny: { size: 12, line: 16 },
} as const;
export type TypeRole = keyof typeof type;

export const shadow = {
  card: { shadowColor: '#17262E', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  float: { shadowColor: '#17262E', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
} as const;
