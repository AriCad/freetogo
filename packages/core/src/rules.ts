import { FLAGS, MINUTE, RULES, minutesOfDay } from './config';
import type { AlertReason, AppState, CategoryKey, Offer, Ratings, Reservation, Store, WalkInReport } from './types';

export type OfferState = 'active' | 'soldout' | 'stopped' | 'possiblyGone' | 'review' | 'ended' | 'expired' | 'closed';

/** Only launch-enabled offers are ever shown: food, free, public, no campaign. */
export function isLaunchVisible(o: Offer): boolean {
  return (
    (FLAGS.enabledVerticals as readonly string[]).includes(o.vertical) &&
    o.pricingMode === 'FREE' &&
    o.priceMinor === 0 &&
    o.accessChannel === 'PUBLIC' &&
    o.campaignId === null
  );
}

export interface WalkSignal {
  state: 'active' | 'possiblyGone' | 'review';
  last: WalkInReport | null;
}

/**
 * Collector reports never close a walk-in. One unverified "all gone" → possibly gone.
 * Independent "all gone" reports within the review window → under review (shop is asked).
 * A shop confirmation resets the signal.
 */
export function walkSignal(o: Offer, now: number): WalkSignal {
  const reps = o.reports;
  let lastMerchant = -1;
  reps.forEach((r, i) => {
    if (r.merchant) lastMerchant = i;
  });
  const after = reps.slice(lastMerchant + 1);
  const last = reps[reps.length - 1] ?? null;
  const none = new Set(after.filter((r) => r.level === 'NONE' && !r.merchant && now - r.at <= RULES.reviewWindowMinutes * MINUTE).map((r) => r.by));
  if (none.size >= RULES.reviewThreshold) return { state: 'review', last };
  if (last && last.level === 'NONE' && !last.merchant) return { state: 'possiblyGone', last };
  return { state: 'active', last };
}

export function offerState(o: Offer, now: number): OfferState {
  if (o.status === 'closed') return 'closed';
  if (o.status === 'ended') return 'ended';
  if (o.status === 'expired') return 'expired';
  if (o.distributionMode === 'WALK_IN' && o.expiresAt !== undefined && now >= o.expiresAt) return 'expired';
  if (now >= o.end) return 'ended';
  if (o.distributionMode === 'RESERVED') {
    if ((o.qtyLeft ?? 0) <= 0) return 'soldout';
    if (!o.reservationsOpen) return 'stopped';
    return 'active';
  }
  return walkSignal(o, now).state;
}

export const isGone = (s: OfferState) => s === 'ended' || s === 'expired' || s === 'closed';
export const isSoldOut = (s: OfferState) => s === 'soldout' || s === 'stopped';

export function isStaleReport(r: WalkInReport, now: number): boolean {
  return now - r.at > RULES.staleReportMinutes * MINUTE;
}

export function overall(r: Ratings): number {
  return r.n ? (r.quality + r.quantity + r.variety + r.smoothness) / 4 : 0;
}

export function reliabilityPct(s: Store): number | null {
  const total = s.reliability.ok + s.reliability.fail;
  return total ? Math.round((s.reliability.ok / total) * 100) : null;
}

export const storeById = (state: AppState, id: string) => state.stores.find((s) => s.id === id);
export const offerById = (state: AppState, id: string) => state.offers.find((o) => o.id === id);

export function myReservations(state: AppState): Reservation[] {
  return state.reservations.filter((r) => r.userId === state.userId);
}
export function myActive(state: AppState): Reservation | undefined {
  return state.reservations.find((r) => r.userId === state.userId && r.status === 'confirmed');
}

export interface DiscoverFilter {
  mode: 'all' | 'reserved' | 'walkin';
  categories: CategoryKey[];
  when: 'any' | 'now' | 'later';
  showSoldOut: boolean;
  sort: 'distance' | 'time' | 'rating';
  query: string;
}

export const DEFAULT_FILTER: DiscoverFilter = { mode: 'all', categories: [], when: 'any', showSoldOut: true, sort: 'distance', query: '' };

export function activeFilterCount(f: DiscoverFilter): number {
  return f.categories.length + (f.when !== 'any' ? 1 : 0) + (f.showSoldOut ? 0 : 1) + (f.sort !== 'distance' ? 1 : 0);
}

/** Offers in the chosen area that have not ended (before user filters). */
export function offersInArea(state: AppState, now: number): Offer[] {
  const L = state.location;
  if (L.mode === 'unset' || !L.city) return [];
  return state.offers.filter((o) => {
    const s = storeById(state, o.storeId);
    return !!s && isLaunchVisible(o) && !isGone(offerState(o, now)) && s.city === L.city && s.km <= L.km;
  });
}

export function discoverOffers(state: AppState, f: DiscoverFilter, now: number, label: (o: Offer, s: Store) => string = () => ''): Offer[] {
  const q = f.query.trim().toLowerCase();
  const list = offersInArea(state, now).filter((o) => {
    const st = offerState(o, now);
    if (f.mode === 'reserved' && o.distributionMode !== 'RESERVED') return false;
    if (f.mode === 'walkin' && o.distributionMode !== 'WALK_IN') return false;
    if (f.categories.length && !o.categories.some((c) => f.categories.includes(c))) return false;
    if (f.when === 'now' && o.start > now) return false;
    if (f.when === 'later' && o.start <= now) return false;
    if (!f.showSoldOut && isSoldOut(st)) return false;
    if (q) {
      const s = storeById(state, o.storeId)!;
      const hay = `${s.name} ${o.what ?? ''} ${o.description} ${label(o, s)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const by = {
    distance: (a: Offer, b: Offer) => storeById(state, a.storeId)!.km - storeById(state, b.storeId)!.km,
    time: (a: Offer, b: Offer) => a.start - b.start,
    rating: (a: Offer, b: Offer) => overall(storeById(state, b.storeId)!.ratings) - overall(storeById(state, a.storeId)!.ratings),
  }[f.sort];
  return list.sort(by);
}

export type DiscoverSection = 'now' | 'walkin' | 'later' | 'soldout';

export function sectionOf(o: Offer, now: number): DiscoverSection {
  const st = offerState(o, now);
  if (isSoldOut(st)) return 'soldout';
  if (o.distributionMode === 'WALK_IN') return 'walkin';
  return o.start <= now ? 'now' : 'later';
}

// ---------------- Alerts ----------------

/** Every subscription that matches a newly published offer (food-only at launch). */
export function matchAlerts(state: AppState, o: Offer): AlertReason[] {
  const s = storeById(state, o.storeId);
  if (!s || !isLaunchVisible(o)) return [];
  const N = state.notif;
  const out: AlertReason[] = [];
  if (N.favorites && state.favorites.includes(s.id)) out.push({ kind: 'favorite' });
  if (state.bells.includes(s.id)) out.push({ kind: 'bell' });
  // Radius is measured from the saved place (no background location tracking).
  if (N.radius && s.city === 'tampere' && s.km <= N.radiusKm) out.push({ kind: 'radius' });
  if (N.cities.includes(s.city)) out.push({ kind: 'city', city: s.city });
  return out;
}

export function inQuietHours(state: AppState, now: number): boolean {
  const N = state.notif;
  if (!N.quiet) return false;
  const toMin = (v: string) => {
    const [h, m] = v.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const s = toMin(N.quietStart);
  const e = toMin(N.quietEnd);
  const n = minutesOfDay(now);
  return s > e ? n >= s || n < e : n >= s && n < e;
}

export type AlertDecision = { send: true; reasons: AlertReason[] } | { send: false; reasons: AlertReason[]; why: 'no_match' | 'permission' | 'quiet' | 'disabled' };

/** At most one alert per user per offer, however many subscriptions match. */
export function decideAlert(state: AppState, o: Offer, now: number): AlertDecision {
  const reasons = matchAlerts(state, o);
  if (!FLAGS.pushAlertsEnabled) return { send: false, reasons, why: 'disabled' };
  if (!reasons.length) return { send: false, reasons, why: 'no_match' };
  if (state.notif.permission !== 'granted') return { send: false, reasons, why: 'permission' };
  if (inQuietHours(state, now)) return { send: false, reasons, why: 'quiet' };
  return { send: true, reasons };
}
