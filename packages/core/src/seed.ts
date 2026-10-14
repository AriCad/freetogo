import { MINUTE } from './config';
import { announce } from './actions';
import { offerById, offerState } from './rules';
import type { AppState, CityId, Offer, Ratings, ReportLevel, Result, Store } from './types';

const R = (quality: number, quantity: number, variety: number, smoothness: number, n: number): Ratings => ({ quality, quantity, variety, smoothness, n });

/** Fictional demo shops. Demo offers live in Tampere; other cities show the real empty state. */
export const DEMO_STORES: Store[] = [
  { id: 'pihlaja', name: 'Lähikauppa Pihlaja', kind: 'grocery', city: 'tampere', address: 'Kalevan puistotie 3, Tampere', km: 1.6, x: 0.68, y: 0.38, initials: 'LP', photo: 'pihlaja', ratings: R(4.5, 4.6, 4.7, 4.4, 86), reliability: { ok: 84, fail: 1 } },
  { id: 'kaneli', name: 'Kauppahallin Marjapuoti', kind: 'berry', city: 'tampere', address: 'Hämeenkatu 14, Tampere', km: 0.8, x: 0.42, y: 0.47, initials: 'KM', photo: 'marjapuoti', ratings: R(4.7, 4.4, 4.3, 4.8, 128), reliability: { ok: 126, fail: 2 } },
  { id: 'sointu', name: 'Kasvis-Deli Lehti', kind: 'veggie_deli', city: 'tampere', address: 'Kuninkaankatu 22, Tampere', km: 0.4, x: 0.33, y: 0.62, initials: 'KL', photo: 'lehti', ratings: R(4.6, 4.0, 4.2, 4.9, 54), reliability: { ok: 54, fail: 0 } },
  { id: 'aurinko', name: 'Hedelmätori Aurinko', kind: 'market_stall', city: 'tampere', address: 'Laukontori, Tampere', km: 2.1, x: 0.52, y: 0.79, initials: 'HA', photo: 'aurinko', ratings: R(4.4, 4.8, 3.9, 4.6, 41), reliability: { ok: 0, fail: 0 } },
  { id: 'torikoju', name: 'Torikoju Kotimaista', kind: 'market_stall', city: 'tampere', address: 'Kauppahallin edusta, Tampere', km: 2.4, x: 0.6, y: 0.66, initials: 'TK', photo: 'omenat', ratings: R(4.5, 4.6, 4.0, 4.7, 27), reliability: { ok: 0, fail: 0 } },
  { id: 'torikeittio', name: 'Juuresaitta', kind: 'greengrocer', city: 'tampere', address: 'Tuomiokirkonkatu 9, Tampere', km: 3.4, x: 0.18, y: 0.33, initials: 'JA', photo: 'juures', ratings: R(4.3, 4.5, 4.0, 4.7, 33), reliability: { ok: 32, fail: 1 } },
  { id: 'kumo', name: 'Sienitori Kuusi', kind: 'mushroom', city: 'tampere', address: 'Hervannan valtaväylä 12, Tampere', km: 6.8, x: 0.88, y: 0.88, initials: 'SK', photo: 'sieni', ratings: R(4.8, 4.1, 4.4, 4.6, 19), reliability: { ok: 19, fail: 0 } },
  { id: 'harju', name: 'Sitruskioski Harju', kind: 'fruit_kiosk', city: 'jyvaskyla', address: 'Kauppakatu 5, Jyväskylä', km: 0.9, x: 0.5, y: 0.5, initials: 'SH', photo: 'sitrus', ratings: R(4.6, 4.3, 4.1, 4.7, 22), reliability: { ok: 22, fail: 0 } },
  { id: 'aura', name: 'Aura Vihannes', kind: 'greengrocer', city: 'turku', address: 'Eerikinkatu 18, Turku', km: 1.2, x: 0.5, y: 0.5, initials: 'AV', photo: 'juures', ratings: R(0, 0, 0, 0, 0), reliability: { ok: 0, fail: 0 } },
];

/** Rough city centres for mapping a device location to the nearest demo city (no geocoding service). */
export const CITY_COORDS: Record<CityId, [number, number]> = {
  tampere: [61.4978, 23.761], jyvaskyla: [62.2426, 25.7473], turku: [60.4518, 22.2666],
  helsinki: [60.1699, 24.9384], oulu: [65.0121, 25.4651], kuopio: [62.8924, 27.677],
};

export function nearestCity(lat: number, lon: number): { city: CityId; km: number } {
  let best: { city: CityId; km: number } = { city: 'tampere', km: Infinity };
  (Object.keys(CITY_COORDS) as CityId[]).forEach((c) => {
    const [la, lo] = CITY_COORDS[c];
    const dLat = ((la - lat) * Math.PI) / 180;
    const dLon = ((lo - lon) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat * Math.PI) / 180) * Math.cos((la * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const km = 6371 * 2 * Math.asin(Math.sqrt(a));
    if (km < best.km) best = { city: c, km };
  });
  return best;
}

function offer(o: Partial<Offer> & Pick<Offer, 'id' | 'storeId' | 'distributionMode' | 'start' | 'end' | 'publishedAt'>): Offer {
  return {
    vertical: 'food', pricingMode: 'FREE', priceMinor: 0, currency: 'EUR', accessChannel: 'PUBLIC', campaignId: null, eligibilityPolicyId: null,
    status: 'active', categories: ['produce'], description: '', photo: { kind: 'none' }, reservationsOpen: true, reports: [], ...o,
  };
}

export function seedState(now: number): AppState {
  const m = (n: number) => now + n * MINUTE;
  return {
    version: 1,
    userId: 'me',
    merchantStoreId: 'pihlaja',
    stores: JSON.parse(JSON.stringify(DEMO_STORES)) as Store[],
    offers: [
      offer({ id: 'o1', storeId: 'kaneli', distributionMode: 'RESERVED', categories: ['produce'], qtyTotal: 5, qtyLeft: 3, start: m(20), end: m(110), publishedAt: m(-30), photo: { kind: 'current', asset: 'marjapuoti', takenAt: m(-32) }, description: 'Mansikoita ja karhunvatukoita, kypsiä tänään.' }),
      offer({ id: 'o2', storeId: 'sointu', distributionMode: 'RESERVED', categories: ['produce', 'meals'], qtyTotal: 4, qtyLeft: 1, start: m(-10), end: m(50), publishedAt: m(-50), photo: { kind: 'example', asset: 'lehti' }, description: 'Sieniä, avokadoja ja lehtikaalia.' }),
      offer({ id: 'o3', storeId: 'aurinko', distributionMode: 'WALK_IN', categories: ['produce'], what: 'Laatikollinen mandariineja', start: m(-20), end: m(80), publishedAt: m(-20), expiresAt: m(40), photo: { kind: 'current', asset: 'aurinko', takenAt: m(-22) }, reports: [{ level: 'MANY', at: m(-12), by: 'u17' }, { level: 'LOW', at: m(-4), by: 'u23' }] }),
      offer({ id: 'o8', storeId: 'torikoju', distributionMode: 'WALK_IN', categories: ['produce'], what: 'Omenoita laatikoittain', start: m(-10), end: m(50), publishedAt: m(-10), expiresAt: m(50), photo: { kind: 'current', asset: 'omenat', takenAt: m(-11) }, reports: [{ level: 'MANY', at: m(-6), by: 'u31' }] }),
      offer({ id: 'o4', storeId: 'torikeittio', distributionMode: 'RESERVED', categories: ['produce', 'dry'], qtyTotal: 6, qtyLeft: 6, start: m(110), end: m(170), publishedAt: m(-10), photo: { kind: 'example', asset: 'juures' }, description: 'Juureksia, kurpitsaa ja kukkakaalia.' }),
      offer({ id: 'o5', storeId: 'pihlaja', distributionMode: 'RESERVED', categories: ['produce', 'dairy', 'bread', 'dry'], qtyTotal: 5, qtyLeft: 0, start: m(50), end: m(140), publishedAt: m(-60), photo: { kind: 'current', asset: 'pihlaja', takenAt: m(-62) }, description: 'Hedelmiä, vihanneksia ja maitotuotteita.' }),
      offer({ id: 'o6', storeId: 'kumo', distributionMode: 'RESERVED', categories: ['produce'], qtyTotal: 3, qtyLeft: 2, start: m(140), end: m(200), publishedAt: m(-5), photo: { kind: 'current', asset: 'sieni', takenAt: m(-7) } }),
      offer({ id: 'o7', storeId: 'harju', distributionMode: 'RESERVED', categories: ['produce'], qtyTotal: 4, qtyLeft: 4, start: m(20), end: m(80), publishedAt: m(-40), photo: { kind: 'current', asset: 'sitrus', takenAt: m(-42) } }),
    ],
    reservations: [
      { id: 'r1', offerId: 'o5', storeId: 'pihlaja', userId: 'u31', code: 'FTG-2281', status: 'collected', createdAt: m(-56) },
      { id: 'r2', offerId: 'o5', storeId: 'pihlaja', userId: 'u44', code: 'FTG-5190', status: 'collected', createdAt: m(-53) },
      { id: 'r3', offerId: 'o5', storeId: 'pihlaja', userId: 'u52', code: 'FTG-3307', status: 'confirmed', createdAt: m(-48) },
      { id: 'r4', offerId: 'o5', storeId: 'pihlaja', userId: 'u58', code: 'FTG-7742', status: 'confirmed', createdAt: m(-38) },
      { id: 'r5', offerId: 'o5', storeId: 'pihlaja', userId: 'u61', code: 'FTG-6015', status: 'confirmed', createdAt: m(-25) },
    ],
    favorites: [],
    bells: [],
    notif: { permission: 'unknown', favorites: true, radius: false, radiusKm: 5, cities: [], quiet: false, quietStart: '22:00', quietEnd: '07:00', reminders: true },
    location: { mode: 'unset', city: null, km: 5, gps: 'unknown' },
    myReports: {},
    myQuality: {},
    alertReasons: {},
    impact: 0,
    log: [],
    seq: 100,
  };
}

// ---------------- Demo-only simulations (not part of the product) ----------------

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

/** Another shop publishes bags, so a single phone can see alerts arrive. */
export function demoPublish(state: AppState, storeId: string, now: number): Result<Offer> {
  const s = clone(state);
  const st = s.stores.find((x) => x.id === storeId);
  if (!st) return { state, ok: false, error: 'not_found', effects: [] };
  s.seq += 1;
  const o = offer({
    id: `o${s.seq}`, storeId, distributionMode: 'RESERVED', qtyTotal: 4, qtyLeft: 4,
    start: now + 15 * MINUTE, end: now + 90 * MINUTE, publishedAt: now, photo: { kind: 'current', asset: st.photo, takenAt: now },
  });
  s.offers.unshift(o);
  return { state: s, ok: true, value: o, effects: announce(s, o, now) };
}

/** Other collectors reserve every remaining bag of an offer. */
export function demoOthersReserve(state: AppState, offerId: string, now: number): Result {
  const s = clone(state);
  const o = offerById(s, offerId);
  if (!o || o.distributionMode !== 'RESERVED') return { state, ok: false, error: 'not_found', effects: [] };
  while ((o.qtyLeft ?? 0) > 0) {
    o.qtyLeft = (o.qtyLeft ?? 0) - 1;
    s.seq += 1;
    s.reservations.push({ id: `r${s.seq}`, offerId, storeId: o.storeId, userId: `u${s.seq}`, code: `FTG-${1000 + ((s.seq * 7919) % 9000)}`, status: 'confirmed', createdAt: now });
  }
  return { state: s, ok: true, effects: [] };
}

/** Another collector reports walk-in availability. */
export function demoOtherReport(state: AppState, offerId: string, level: ReportLevel, now: number): Result {
  const s = clone(state);
  const o = offerById(s, offerId);
  if (!o || o.distributionMode !== 'WALK_IN' || ['ended', 'expired', 'closed'].includes(offerState(o, now))) return { state, ok: false, error: 'not_active', effects: [] };
  s.seq += 1;
  o.reports.push({ level, at: now, by: `u${s.seq}` });
  return { state: s, ok: true, effects: [] };
}
