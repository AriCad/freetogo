import { CITY_NAMES, MINUTE, hhmm, type CityId } from '@freetogo/core';
import i18n from './i18n';

export const time = hhmm;
export const slot = (s: number, e: number) => `${hhmm(s)}–${hhmm(e)}`;
export const km = (d: number) => (i18n.language === 'fi' ? d.toFixed(1).replace('.', ',') : d.toFixed(1));
export const num1 = km;
export const cityName = (c: CityId | null | undefined) => (c ? CITY_NAMES[c] : '');

export function ago(at: number, now: number): string {
  const d = Math.max(0, Math.floor((now - at) / MINUTE));
  if (d < 1) return i18n.t('ago_now');
  if (d < 60) return i18n.t('ago_min', { n: d });
  return i18n.t('ago_h', { n: Math.floor(d / 60) });
}
