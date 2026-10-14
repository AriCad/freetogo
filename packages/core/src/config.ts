import type { CategoryKey, CityId } from './types';

/** Launch flags. Server-authoritative in production; here they gate what the app may render. */
export const FLAGS = Object.freeze({
  enabledVerticals: ['food'] as const,
  walkInModeEnabled: true,
  pushAlertsEnabled: true,
  publicChannelEnabled: true,
  targetedChannelEnabled: false,
  communityCampaignsEnabled: false,
  assistanceRequestEnabled: false,
  priorityEarlyAccessEnabled: false,
  paidOffersEnabled: false,
  merchantBillingEnabled: false,
  consumerAccessFeeEnabled: false,
  advertisingEnabled: false,
});

/** Pilot proposals, not locked business rules. */
export const RULES = Object.freeze({
  walkInMaxMinutes: 60,
  walkInExtendMinutes: 30,
  /** Two independent "all gone" reports within this window put a walk-in under review. */
  reviewWindowMinutes: 30,
  reviewThreshold: 2,
  staleReportMinutes: 45,
  reminderMinutesBefore: 30,
  maxActiveReservations: 1,
  maxBags: 50,
  descriptionMax: 140,
});

export const CATEGORIES: readonly CategoryKey[] = ['bread', 'produce', 'dairy', 'meals', 'meat', 'fish', 'dry', 'snacks', 'other'];
export const CITIES: readonly CityId[] = ['tampere', 'jyvaskyla', 'turku', 'helsinki', 'oulu', 'kuopio'];
export const CITY_NAMES: Record<CityId, string> = {
  tampere: 'Tampere', jyvaskyla: 'Jyväskylä', turku: 'Turku', helsinki: 'Helsinki', oulu: 'Oulu', kuopio: 'Kuopio',
};

export const MINUTE = 60_000;

/** 'HH:MM' for a timestamp in local time. */
export function hhmm(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Timestamp for 'HH:MM' on the same local day as `ref`. */
export function atTime(ref: number, value: string): number {
  const [h, m] = value.split(':').map(Number);
  const d = new Date(ref);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d.getTime();
}

export function minutesOfDay(ts: number): number {
  const d = new Date(ts);
  return d.getHours() * 60 + d.getMinutes();
}

export function roundUp(ts: number, minutes: number): number {
  const step = minutes * MINUTE;
  return Math.ceil(ts / step) * step;
}
