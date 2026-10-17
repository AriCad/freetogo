import { describe, expect, it } from 'vitest';
import {
  MINUTE, cancelReservation, confirmPickup, decideAlert, demoOtherReport, discoverOffers, DEFAULT_FILTER, extendWalkIn, isLaunchVisible,
  merchantAllGone, merchantCancel, merchantStillFood, offerById, offerState, publish, rate, reportNotReceived, reportWalkIn, reserve,
  seedState, setLocation, setNotif, tick, toggleBell, toggleCityAlert, toggleFavorite, validateDraft, walkSignal, editOffer, hhmm,
  type AppState, type Draft,
} from '../src';

const NOW = new Date(2026, 9, 15, 16, 40).getTime();
const m = (n: number) => NOW + n * MINUTE;
const inTampere = (): AppState => setLocation(seedState(NOW), { mode: 'city', city: 'tampere', km: 5 }).state;
const granted = (s: AppState) => setNotif(s, { permission: 'granted' }).state;
const draft = (p: Partial<Draft> = {}): Draft => ({ mode: 'RESERVED', qty: 5, categories: ['bread', 'produce'], start: hhmm(m(10)), end: hhmm(m(90)), description: '', what: '', photo: null, ...p });

describe('launch visibility', () => {
  it('shows only food, free, public, non-campaign offers', () => {
    const o = seedState(NOW).offers[0]!;
    expect(isLaunchVisible(o)).toBe(true);
    expect(isLaunchVisible({ ...o, accessChannel: 'TARGETED' })).toBe(false);
    expect(isLaunchVisible({ ...o, pricingMode: 'PAID', priceMinor: 399 })).toBe(false);
    expect(isLaunchVisible({ ...o, campaignId: 'xmas' })).toBe(false);
  });
  it('never lists hidden offers in discovery', () => {
    const s = inTampere();
    s.offers[0] = { ...s.offers[0]!, accessChannel: 'TARGETED' };
    expect(discoverOffers(s, DEFAULT_FILTER, NOW).some((o) => o.id === s.offers[0]!.id)).toBe(false);
  });
});

describe('discovery', () => {
  it('needs a location and respects city + radius', () => {
    expect(discoverOffers(seedState(NOW), DEFAULT_FILTER, NOW)).toHaveLength(0);
    const ids = discoverOffers(inTampere(), DEFAULT_FILTER, NOW).map((o) => o.id);
    expect(ids).toContain('o1');
    expect(ids).not.toContain('o6'); // 6.8 km > 5 km
    expect(ids).not.toContain('o7'); // Jyväskylä
  });
  it('filters by mode and food group', () => {
    const s = inTampere();
    expect(discoverOffers(s, { ...DEFAULT_FILTER, mode: 'walkin' }, NOW).every((o) => o.distributionMode === 'WALK_IN')).toBe(true);
    expect(discoverOffers(s, { ...DEFAULT_FILTER, categories: ['dairy'] }, NOW).map((o) => o.id)).toEqual(['o5']);
  });
});

describe('reservation', () => {
  it('reserves stock, gives a code and allows one active reservation', () => {
    const r = reserve(inTampere(), 'o1', NOW);
    expect(r.ok).toBe(true);
    expect(offerById(r.state, 'o1')!.qtyLeft).toBe(2);
    expect(r.value!.code).toMatch(/^FTG-\d{4}$/);
    expect(reserve(r.state, 'o2', NOW).error).toBe('has_active');
  });
  it('never oversells', () => {
    let s = inTampere();
    s.offers.find((o) => o.id === 'o2')!.qtyLeft = 1;
    const first = reserve(s, 'o2', NOW);
    s = cancelReservation(first.state, first.value!.id, NOW).state; // stock returns
    expect(offerById(s, 'o2')!.qtyLeft).toBe(1);
    s.offers.find((o) => o.id === 'o2')!.qtyLeft = 0;
    expect(reserve(s, 'o2', NOW).error).toBe('soldout');
  });
  it('rejects ended offers and walk-ins', () => {
    expect(reserve(inTampere(), 'o1', m(500)).error).toBe('ended');
    expect(reserve(inTampere(), 'o3', NOW).error).toBe('walk_in');
  });
  it('only verified pickups can be rated, once, with four scores', () => {
    const r = reserve(inTampere(), 'o1', NOW);
    const scores = { quality: 5, quantity: 4, variety: 4, smoothness: 5 };
    expect(rate(r.state, r.value!.id, scores).error).toBe('not_collected');
    const s = { ...r.state, merchantStoreId: 'kaneli' };
    const c = confirmPickup(s, 'o1', r.value!.code);
    expect(c.ok).toBe(true);
    const n0 = c.state.stores.find((x) => x.id === 'kaneli')!.ratings.n;
    const rated = rate(c.state, r.value!.id, scores);
    expect(rated.state.stores.find((x) => x.id === 'kaneli')!.ratings.n).toBe(n0 + 1);
    expect(rate(rated.state, r.value!.id, scores).error).toBe('already_rated');
  });
  it('records "I did not get my bag" with a reason', () => {
    const r = reserve(inTampere(), 'o1', NOW);
    const s = reportNotReceived(r.state, r.value!.id, 'closed');
    expect(s.state.reservations.find((x) => x.id === r.value!.id)!.status).toBe('not_received');
  });
  it('expires and reminds via tick', () => {
    const r = reserve(inTampere(), 'o1', NOW);
    const t = tick(r.state, NOW, m(1)); // o1 starts at +20 → reminder at -10, already passed? start-30 = -10 < NOW
    expect(t.effects).toHaveLength(0);
    const later = tick(r.state, NOW, m(200));
    expect(later.state.reservations.find((x) => x.id === r.value!.id)!.status).toBe('expired');
  });
});

describe('merchant', () => {
  it('validates drafts: multi-select groups, integer bags, fresh walk-in photo, start/end', () => {
    expect(validateDraft(draft(), NOW)).toEqual([]);
    expect(validateDraft(draft({ categories: [] }), NOW)).toContain('need_groups');
    expect(validateDraft(draft({ qty: 2.5 }), NOW)).toContain('bad_qty');
    expect(validateDraft(draft({ end: hhmm(m(-5)) }), NOW)).toContain('end_before_start');
    expect(validateDraft(draft({ start: hhmm(m(-60)), end: hhmm(m(-5)) }), NOW)).toEqual(['end_past']);
    expect(validateDraft(draft({ mode: 'WALK_IN', categories: [], what: '', start: hhmm(m(30)), end: hhmm(m(10)) }), NOW)).toEqual(['need_photo', 'need_what', 'end_before_start']);
    const walk = draft({ mode: 'WALK_IN', categories: [], what: 'Banaaneja' });
    expect(validateDraft(walk, NOW)).toContain('need_photo');
    expect(validateDraft({ ...walk, photo: { kind: 'example', asset: 'aurinko' } }, NOW)).toContain('need_photo');
    expect(validateDraft({ ...walk, photo: { kind: 'current', uri: 'file://x.jpg', takenAt: NOW } }, NOW)).toEqual([]);
  });
  it('publishes bags with several food groups and caps walk-ins at 60 min', () => {
    const p = publish(inTampere(), draft(), NOW);
    expect(p.value!.categories).toEqual(['bread', 'produce']);
    expect(p.value!.priceMinor).toBe(0);
    const w = publish(inTampere(), draft({ mode: 'WALK_IN', what: 'Banaaneja', photo: { kind: 'current', takenAt: NOW }, start: hhmm(NOW), end: hhmm(m(150)) }), NOW);
    expect(w.value!.expiresAt).toBe(Math.floor(NOW / MINUTE) * MINUTE + 60 * MINUTE);
    expect(w.value!.qtyTotal).toBeUndefined();
  });
  it('cannot edit bags below the reserved count', () => {
    const s = inTampere();
    expect(editOffer(s, 'o5', { qtyTotal: 2 }, NOW).error).toBe('below_reserved');
    expect(editOffer(s, 'o5', { qtyTotal: 7 }, NOW).ok).toBe(true);
  });
  it('merchant cancellation notifies the collector and counts against reliability', () => {
    const s = { ...inTampere(), merchantStoreId: 'kaneli' };
    const r = reserve(s, 'o1', NOW);
    const before = r.state.stores.find((x) => x.id === 'kaneli')!.reliability.fail;
    const c = merchantCancel(r.state, 'o1', 'out', NOW);
    expect(c.effects).toEqual([{ type: 'cancelled', reservationId: r.value!.id, storeId: 'kaneli', reason: 'out' }]);
    expect(c.state.stores.find((x) => x.id === 'kaneli')!.reliability.fail).toBe(before + 1);
    expect(offerState(offerById(c.state, 'o1')!, NOW)).toBe('ended');
  });
  it('a merchant can only manage its own offers', () => {
    expect(merchantCancel(inTampere(), 'o1', 'out', NOW).error).toBe('not_found');
    expect(confirmPickup(inTampere(), 'o5', 'FTG-0000').error).toBe('invalid_code');
    expect(confirmPickup(inTampere(), 'o5', 'ftg-3307').ok).toBe(true);
    expect(confirmPickup(confirmPickup(inTampere(), 'o5', 'FTG-3307').state, 'o5', 'FTG-3307').error).toBe('already_collected');
  });
});

describe('walk-in reports', () => {
  const walk = () => {
    const p = publish(inTampere(), draft({ mode: 'WALK_IN', what: 'Banaaneja', photo: { kind: 'current', takenAt: NOW }, start: hhmm(NOW), end: hhmm(m(90)) }), NOW);
    return { s: p.state, id: p.value!.id };
  };
  it('one unverified "all gone" only marks possibly gone; two independent → review; never closes', () => {
    const { s, id } = walk();
    const a = reportWalkIn(s, id, 'NONE', 'me', NOW);
    expect(offerState(offerById(a.state, id)!, NOW)).toBe('possiblyGone');
    const b = demoOtherReport(a.state, id, 'NONE', m(1));
    expect(offerState(offerById(b.state, id)!, m(1))).toBe('review');
    expect(offerById(b.state, id)!.status).toBe('active');
  });
  it('the same collector cannot stack reports', () => {
    const { s, id } = walk();
    let t = reportWalkIn(s, id, 'NONE', 'me', NOW).state;
    t = reportWalkIn(t, id, 'NONE', 'me', m(1)).state;
    expect(offerById(t, id)!.reports.filter((r) => r.by === 'me')).toHaveLength(1);
    expect(walkSignal(offerById(t, id)!, m(1)).state).toBe('possiblyGone');
  });
  it('shop confirmation resets the signal; "all gone" closes; extension adds 30 min', () => {
    const { s, id } = walk();
    const a = reportWalkIn(s, id, 'NONE', 'me', NOW).state;
    expect(offerState(offerById(merchantStillFood(a, id, m(1)).state, id)!, m(1))).toBe('active');
    const e = extendWalkIn(a, id, m(10));
    expect(offerById(e.state, id)!.expiresAt).toBe(offerById(a, id)!.expiresAt! + 30 * MINUTE);
    expect(offerState(offerById(merchantAllGone(a, id, m(2)).state, id)!, m(2))).toBe('closed');
  });
  it('expires automatically', () => {
    const { s, id } = walk();
    expect(offerState(offerById(s, id)!, m(61))).toBe('expired');
  });
});

describe('alerts', () => {
  it('overlapping subscriptions produce exactly one alert with all reasons', () => {
    let s = granted(inTampere());
    s = toggleFavorite(s, 'pihlaja').state;
    s = toggleBell(s, 'pihlaja').state;
    s = setNotif(s, { radius: true, radiusKm: 5 }).state;
    s = toggleCityAlert(s, 'tampere').state;
    const p = publish(s, draft(), NOW);
    expect(p.effects).toHaveLength(1);
    expect(p.effects[0]).toMatchObject({ type: 'alert' });
    expect(p.state.alertReasons[p.value!.id]!.map((r) => r.kind)).toEqual(['favorite', 'bell', 'radius', 'city']);
  });
  it('city subscriptions work without being there; no match → no alert', () => {
    const s = granted(inTampere());
    const o = { ...s.offers.find((x) => x.id === 'o7')! };
    expect(decideAlert(s, o, NOW)).toMatchObject({ send: false, why: 'no_match' });
    expect(decideAlert(toggleCityAlert(s, 'jyvaskyla').state, o, NOW)).toMatchObject({ send: true });
  });
  it('respects permission and quiet hours', () => {
    let s = toggleBell(inTampere(), 'kaneli').state;
    const o = s.offers.find((x) => x.id === 'o1')!;
    expect(decideAlert(s, o, NOW)).toMatchObject({ send: false, why: 'permission' });
    s = setNotif(granted(s), { quiet: true, quietStart: '22:00', quietEnd: '07:00' }).state;
    expect(decideAlert(s, o, NOW).send).toBe(true);
    expect(decideAlert(s, o, new Date(2026, 9, 15, 23, 15).getTime())).toMatchObject({ send: false, why: 'quiet' });
  });
});
