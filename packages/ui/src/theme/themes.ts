/**
 * Selectable colour themes 6–10 (approved comparison board). One UI; only these tokens change.
 * Same model as AriCad/texttranslator packages/ui/src/theme (Palette + provider), with Free To Go roles.
 * `primary` is the exact approved hex; every other value is derived and checked for WCAG AA (test/contrast.test.ts).
 */
export interface Palette {
  primary: string;
  primarySoft: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  background: string;
  surface: string;
  border: string;
  active: string;
  onActive: string;
  link: string;
  selected: string;
  onSelected: string;
  badge: string;
  badgeText: string;
  icon: string;
  /** Fixed status colours (same in every theme). */
  ok: string;
  okSoft: string;
  danger: string;
  dangerSoft: string;
  scrim: string;
}

export type ThemeId = '6' | '7' | '8' | '9' | '10';
export const THEME_IDS: ThemeId[] = ['6', '7', '8', '9', '10'];
export const DEFAULT_THEME: ThemeId = '6';

const fixed = { ok: '#1E7A4C', okSoft: '#E3F4EA', danger: '#B42318', dangerSoft: '#FDECEA', scrim: 'rgba(23,38,46,0.45)' };

export const THEMES: Record<ThemeId, { name: string; palette: Palette }> = {
  '6': { name: 'Violetti', palette: { primary: '#7A6FF0', primarySoft: '#ECEBFD', accent: '#7A6FF0', textPrimary: '#1B1A2E', textSecondary: '#5E5C70', background: '#FCFBFF', surface: '#FFFFFF', border: '#D5D6EC', active: '#6B5FEE', onActive: '#FFFFFF', link: '#6B5FEE', selected: '#6B5FEE', onSelected: '#FFFFFF', badge: '#ECEBFD', badgeText: '#5E51ED', icon: '#7A6FF0', ...fixed } },
  '7': { name: 'Korallit', palette: { primary: '#E57C73', primarySoft: '#FBEDEB', accent: '#E26E64', textPrimary: '#2E1B1A', textSecondary: '#705D5C', background: '#FEFCFB', surface: '#FFFFFF', border: '#E4D8DA', active: '#D83A2C', onActive: '#FFFFFF', link: '#D83A2C', selected: '#E57C73', onSelected: '#2E1B1A', badge: '#FBEDEB', badgeText: '#CA3226', icon: '#E26E64', ...fixed } },
  '8': { name: 'Salvia', palette: { primary: '#6FA37B', primarySoft: '#EBF2ED', accent: '#679E74', textPrimary: '#1A2E1E', textSecondary: '#5C7061', background: '#FBFDFC', surface: '#FFFFFF', border: '#D4DDDB', active: '#517F5C', onActive: '#FFFFFF', link: '#517F5C', selected: '#6FA37B', onSelected: '#1A2E1E', badge: '#EBF2ED', badgeText: '#4B7555', icon: '#679E74', ...fixed } },
  '9': { name: 'Hunaja', palette: { primary: '#D8A23C', primarySoft: '#FAF2E4', accent: '#BB8825', textPrimary: '#2E271A', textSecondary: '#70695C', background: '#FEFDFA', surface: '#FFFFFF', border: '#E2DDD2', active: '#976D1E', onActive: '#FFFFFF', link: '#976D1E', selected: '#D8A23C', onSelected: '#2E271A', badge: '#FAF2E4', badgeText: '#8D661C', icon: '#BB8825', ...fixed } },
  '10': { name: 'Luumu', palette: { primary: '#8B6B8F', primarySoft: '#EFEAEF', accent: '#8B6B8F', textPrimary: '#2B1A2E', textSecondary: '#6E5C70', background: '#FCFBFC', surface: '#FFFFFF', border: '#D8D6DE', active: '#88688C', onActive: '#FFFFFF', link: '#88688C', selected: '#8B6B8F', onSelected: '#FFFFFF', badge: '#EFEAEF', badgeText: '#7B5F7F', icon: '#8B6B8F', ...fixed } },
};
