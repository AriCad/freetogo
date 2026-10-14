import { CATEGORIES, MINUTE, RULES, atTime } from './config';
import { decideAlert, isGone, myActive, offerById, offerState, storeById } from './rules';
import type {
  AppState, CategoryKey, CityId, Effect, LocationPref, MerchantCancelReason, NotReceivedReason, NotificationPrefs,
  Offer, Photo, ReportLevel, Reservation, Result,
} from './types';

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
const ok = <T>(state: AppState, value?: T, effects: Effect[] = []): Result<T> => ({ state, ok: true, value, effects });
const fail = <T>(state: AppState, error: string): Result<T> => ({ state, ok: false, error, effects: [] });

function log(s: AppState, at: number, key: string, vars?: Record<string, string | number>) {
  s.log = [{ at, key, vars }, ...s.log].slice(0, 40);
}
function nextId(s: AppState, prefix: string): string {
  s.seq += 1;
  return `${prefix}${s.seq}`;
}
/** Short pickup code. Production codes are server-signed and single-use. */
function pickupCode(s: AppState): string {
  s.seq += 1;
  return `FTG-${1000 + ((s.seq * 7919) % 9000)}`;
}

// ---------------- Collector ----------------

export function toggleFavorite(state: AppState, storeId: string): Result<boolean> {
  const s = clone(state);
  const on = !s.favorites.includes(storeId);
  s.favorites = on ? [...s.favorites, storeId] : s.favorites.filter((x) => x !== storeId);
  return ok(s, on);
}

export function toggleBell(state: AppState, storeId: string): Result<boolean> {
  const s = clone(state);
  const on = !s.bells.includes(storeId);
  s.bells = on ? [...s.bells, storeId] : s.bells.filter((x) => x !== storeId);
  return ok(s, on);
}

export function setNotif(state: AppState, patch: Partial<NotificationPrefs>): Result {
  const s = clone(state);
  s.notif = { ...s.notif, ...patch, radiusKm: Math.min(20, Math.max(1, patch.radiusKm ?? s.notif.radiusKm)) };
  return ok(s);
}

export function toggleCityAlert(state: AppState, city: CityId): Result<boolean> {
  const s = clone(state);
  const on = !s.notif.cities.includes(city);
  s.notif.cities = on ? [...s.notif.cities, city] : s.notif.cities.filter((c) => c !== city);
  return ok(s, on);
}

export function setLocation(state: AppState, patch: Partial<LocationPref>): Result {
  const s = clone(state);
  s.location = { ...s.location, ...patch };
  s.location.km = Math.min(20, Math.max(1, s.location.km));
  return ok(s);
}

export type ReserveError = 'not_found' | 'ended' | 'soldout' | 'has_active' | 'walk_in';

/** Atomic in the mock (single thread). Production: server transaction with idempotency key. */
export function reserve(state: AppState, offerId: string, now: number): Result<Reservation> {
  const o0 = offerById(state, offerId);
  if (!o0) return fail(state, 'not_found');
  if (o0.distributionMode !== 'RESERVED') return fail(state, 'walk_in');
  const st = offerState(o0, now);
  if (isGone(st)) return fail(state, 'ended');
  if (st === 'soldout' || st === 'stopped') return fail(state, 'soldout');
  if (myActive(state)) return fail(state, 'has_active');
  const s = clone(state);
  const o = offerById(s, offerId)!;
  o.qtyLeft = (o.qtyLeft ?? 0) - 1;
  const r: Reservation = { id: nextId(s, 'r'), offerId, storeId: o.storeId, userId: s.userId, code: pickupCode(s), status: 'confirmed', createdAt: now };
  s.reservations.push(r);
  log(s, now, 'log.reserved', { code: r.code, left: o.qtyLeft });
  return ok(s, r);
}

export function cancelReservation(state: AppState, id: string, now: number): Result {
  const r0 = state.reservations.find((r) => r.id === id);
  if (!r0 || r0.status !== 'confirmed' || r0.userId !== state.userId) return fail(state, 'not_found');
  const s = clone(state);
  const r = s.reservations.find((x) => x.id === id)!;
  r.status = 'cancelled_user';
  const o = offerById(s, r.offerId);
  if (o && !isGone(offerState(o, now))) o.qtyLeft = (o.qtyLeft ?? 0) + 1;
  return ok(s);
}

export function reportNotReceived(state: AppState, id: string, reason: NotReceivedReason, text?: string): Result {
  const r0 = state.reservations.find((r) => r.id === id);
  if (!r0 || r0.status !== 'confirmed') return fail(state, 'not_found');
  const s = clone(state);
  const r = s.reservations.find((x) => x.id === id)!;
  r.status = 'not_received';
  r.notReceived = { reason, text: text?.slice(0, 280) };
  return ok(s);
}

export interface Scores { quality: number; quantity: number; variety: number; smoothness: number }

/** Only verified (collected) pickups can be rated, once. */
export function rate(state: AppState, reservationId: string, scores: Scores): Result {
  const r0 = state.reservations.find((r) => r.id === reservationId);
  if (!r0 || r0.status !== 'collected') return fail(state, 'not_collected');
  if (r0.rated) return fail(state, 'already_rated');
  const vals = Object.values(scores);
  if (vals.some((v) => !Number.isInteger(v) || v < 1 || v > 5)) return fail(state, 'invalid');
  const s = clone(state);
  s.reservations.find((x) => x.id === reservationId)!.rated = true;
  const R = storeById(s, r0.storeId)!.ratings;
  const n = R.n;
  (Object.keys(scores) as (keyof Scores)[]).forEach((k) => {
    R[k] = (R[k] * n + scores[k]) / (n + 1);
  });
  R.n = n + 1;
  return ok(s);
}

/** One live report per collector per offer; updating replaces it. Reports never change stock. */
export function reportWalkIn(state: AppState, offerId: string, level: ReportLevel, by: string, now: number): Result {
  const o0 = offerById(state, offerId);
  if (!o0 || o0.distributionMode !== 'WALK_IN' || isGone(offerState(o0, now))) return fail(state, 'not_active');
  const s = clone(state);
  const o = offerById(s, offerId)!;
  o.reports = [...o.reports.filter((r) => r.by !== by), { level, at: now, by }];
  if (by === s.userId) s.myReports[offerId] = { level, at: now };
  const sig = offerState(o, now);
  log(s, now, sig === 'review' ? 'log.walkin_review' : sig === 'possiblyGone' ? 'log.walkin_possibly' : 'log.walkin_report', { store: storeById(s, o.storeId)!.name });
  return ok(s);
}

/** Optional, separate from availability; counted publicly only after pickup verification (pending here). */
export function saveWalkInQuality(state: AppState, offerId: string, value: number): Result {
  if (!Number.isInteger(value) || value < 1 || value > 5) return fail(state, 'invalid');
  const s = clone(state);
  s.myQuality[offerId] = { value, saved: true };
  return ok(s);
}

// ---------------- Merchant ----------------

export interface Draft {
  mode: 'RESERVED' | 'WALK_IN';
  qty: number;
  categories: CategoryKey[];
  /** 'HH:MM' today */
  start: string;
  end: string;
  description: string;
  what: string;
  photo: Photo | null;
}

export type DraftError = 'need_groups' | 'need_photo' | 'need_what' | 'need_time' | 'bad_qty';

export function validateDraft(d: Draft, now: number): DraftError[] {
  const e: DraftError[] = [];
  const start = atTime(now, d.start);
  const end = atTime(now, d.end);
  if (d.mode === 'RESERVED' && !d.categories.length) e.push('need_groups');
  if (d.mode === 'RESERVED' && (!Number.isInteger(d.qty) || d.qty < 1 || d.qty > RULES.maxBags)) e.push('bad_qty');
  // Walk-in needs a fresh photo of the actual goods: example photos are not allowed.
  if (d.mode === 'WALK_IN' && !(d.photo && d.photo.kind === 'current')) e.push('need_photo');
  if (d.mode === 'WALK_IN' && !d.what.trim()) e.push('need_what');
  if (!(end > start && end > now)) e.push('need_time');
  if (d.categories.some((c) => !CATEGORIES.includes(c))) e.push('need_groups');
  return e;
}

/** Builds the offer a draft would publish (also used for the live preview). */
export function makeDraftOffer(state: AppState, d: Draft, now: number, id = 'preview'): Offer {
  const start = atTime(now, d.start);
  const end = atTime(now, d.end);
  const o: Offer = {
    id, storeId: state.merchantStoreId, vertical: 'food', distributionMode: d.mode,
    pricingMode: 'FREE', priceMinor: 0, currency: 'EUR', accessChannel: 'PUBLIC', campaignId: null, eligibilityPolicyId: null,
    status: 'active', categories: [...d.categories], description: d.description.slice(0, RULES.descriptionMax),
    start, end, publishedAt: now, photo: d.photo ? { ...d.photo } : { kind: 'none' }, reservationsOpen: true, reports: [],
  };
  if (d.mode === 'RESERVED') {
    o.qtyTotal = d.qty;
    o.qtyLeft = d.qty;
  } else {
    o.what = d.what.trim().slice(0, RULES.descriptionMax);
    o.expiresAt = Math.min(end, Math.max(now, start) + RULES.walkInMaxMinutes * MINUTE);
  }
  return o;
}

/** Publishing notifies matching subscribers automatically (one alert per offer). */
export function publish(state: AppState, d: Draft, now: number): Result<Offer> {
  const errors = validateDraft(d, now);
  if (errors.length) return fail(state, errors.join(','));
  const s = clone(state);
  const o = makeDraftOffer(s, d, now, nextId(s, 'o'));
  s.offers.unshift(o);
  return ok(s, o, announce(s, o, now));
}

/** Shared by merchant publish and demo publishes: decide, record and log the alert. */
export function announce(s: AppState, o: Offer, now: number): Effect[] {
  const d = decideAlert(s, o, now);
  const store = storeById(s, o.storeId)!.name;
  if (d.send) {
    s.alertReasons[o.id] = d.reasons;
    log(s, now, 'log.alert_sent', { store, n: d.reasons.length });
    return [{ type: 'alert', offerId: o.id, reasons: d.reasons }];
  }
  log(s, now, `log.alert_${d.why}`, { store, n: d.reasons.length });
  return [];
}

function ownOffer(state: AppState, id: string): Offer | undefined {
  const o = offerById(state, id);
  return o && o.storeId === state.merchantStoreId ? o : undefined;
}

export function editOffer(state: AppState, id: string, patch: { qtyTotal?: number; end?: string }, now: number): Result {
  const o0 = ownOffer(state, id);
  if (!o0 || o0.distributionMode !== 'RESERVED') return fail(state, 'not_found');
  const reserved = (o0.qtyTotal ?? 0) - (o0.qtyLeft ?? 0);
  if (patch.qtyTotal !== undefined && (patch.qtyTotal < Math.max(1, reserved) || patch.qtyTotal > RULES.maxBags)) return fail(state, 'below_reserved');
  const s = clone(state);
  const o = offerById(s, id)!;
  if (patch.qtyTotal !== undefined) {
    o.qtyTotal = patch.qtyTotal;
    o.qtyLeft = patch.qtyTotal - reserved;
  }
  if (patch.end) {
    const end = atTime(now, patch.end);
    if (end <= o.start || end <= now) return fail(state, 'need_time');
    o.end = end;
  }
  return ok(s);
}

export function stopReservations(state: AppState, id: string): Result {
  if (!ownOffer(state, id)) return fail(state, 'not_found');
  const s = clone(state);
  offerById(s, id)!.reservationsOpen = false;
  return ok(s);
}

/** Merchant-caused cancellation: everyone affected is told immediately; counts against reliability. */
export function merchantCancel(state: AppState, id: string, reason: MerchantCancelReason, now: number): Result<number> {
  if (!ownOffer(state, id)) return fail(state, 'not_found');
  const s = clone(state);
  const o = offerById(s, id)!;
  const open = s.reservations.filter((r) => r.offerId === id && r.status === 'confirmed');
  open.forEach((r) => {
    r.status = 'cancelled_merchant';
    r.cancelReason = reason;
  });
  o.status = 'ended';
  storeById(s, o.storeId)!.reliability.fail += open.length;
  log(s, now, 'log.merchant_cancelled', { n: open.length });
  const effects: Effect[] = open.filter((r) => r.userId === s.userId).map((r) => ({ type: 'cancelled', reservationId: r.id, storeId: o.storeId, reason }));
  return ok(s, open.length, effects);
}

/** Merchant verifies the collector's code at the counter. */
export function confirmPickup(state: AppState, offerId: string, code: string): Result<Reservation> {
  if (!ownOffer(state, offerId)) return fail(state, 'not_found');
  const r0 = state.reservations.find((r) => r.offerId === offerId && r.code.toUpperCase() === code.trim().toUpperCase());
  if (!r0) return fail(state, 'invalid_code');
  if (r0.status === 'collected') return fail(state, 'already_collected');
  if (r0.status !== 'confirmed') return fail(state, 'not_valid');
  const s = clone(state);
  const r = s.reservations.find((x) => x.id === r0.id)!;
  r.status = 'collected';
  storeById(s, r.storeId)!.reliability.ok += 1;
  if (r.userId === s.userId) s.impact += 1;
  return ok(s, r);
}

export function merchantAllGone(state: AppState, id: string, now: number): Result {
  const o0 = ownOffer(state, id);
  if (!o0 || o0.distributionMode !== 'WALK_IN') return fail(state, 'not_found');
  const s = clone(state);
  const o = offerById(s, id)!;
  o.status = 'closed';
  o.closedAt = now;
  o.reports.push({ level: 'NONE', at: now, by: 'merchant', merchant: true });
  log(s, now, 'log.walkin_closed', { store: storeById(s, o.storeId)!.name });
  return ok(s);
}

export function merchantStillFood(state: AppState, id: string, now: number): Result {
  if (!ownOffer(state, id)) return fail(state, 'not_found');
  const s = clone(state);
  offerById(s, id)!.reports.push({ level: 'LOW', at: now, by: 'merchant', merchant: true });
  return ok(s);
}

/** Extension requires the merchant to confirm food remains (UI checkbox). */
export function extendWalkIn(state: AppState, id: string, now: number): Result {
  const o0 = ownOffer(state, id);
  if (!o0 || o0.distributionMode !== 'WALK_IN' || isGone(offerState(o0, now))) return fail(state, 'not_active');
  const s = clone(state);
  const o = offerById(s, id)!;
  o.expiresAt = Math.max(o.expiresAt ?? now, now) + RULES.walkInExtendMinutes * MINUTE;
  o.end = Math.max(o.end, o.expiresAt);
  return ok(s);
}

// ---------------- Time ----------------

/** Moves the clock: expires reservations whose window ended and emits pickup reminders. */
export function tick(state: AppState, prev: number, now: number): Result {
  const s = clone(state);
  const effects: Effect[] = [];
  s.reservations.forEach((r) => {
    if (r.status !== 'confirmed') return;
    const o = offerById(s, r.offerId);
    if (!o) return;
    const remind = o.start - RULES.reminderMinutesBefore * MINUTE;
    if (r.userId === s.userId && s.notif.reminders && prev < remind && now >= remind && now < o.end) effects.push({ type: 'reminder', reservationId: r.id, offerId: o.id });
    if (now >= o.end) r.status = 'expired';
  });
  return ok(s, undefined, effects);
}
