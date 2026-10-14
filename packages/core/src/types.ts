/**
 * Free To Go domain model. One generic offer engine: food is the only enabled vertical,
 * every offer is free and public at launch. The other dimensions exist so paid, targeted
 * and campaign offers can be added later without new engines (see docs/ARCHITECTURE.md).
 */

export type Vertical = 'food';
export type DistributionMode = 'RESERVED' | 'WALK_IN';
export type PricingMode = 'FREE' | 'PAID';
export type AccessChannel = 'PUBLIC' | 'TARGETED';

export type CategoryKey = 'bread' | 'produce' | 'dairy' | 'meals' | 'meat' | 'fish' | 'dry' | 'snacks' | 'other';
export type CityId = 'tampere' | 'jyvaskyla' | 'turku' | 'helsinki' | 'oulu' | 'kuopio';

/** Bundled demo photos (real produce photos, BSD-3). A real backend returns URLs instead. */
export type PhotoAsset = 'pihlaja' | 'marjapuoti' | 'aurinko' | 'omenat' | 'lehti' | 'juures' | 'sieni' | 'sitrus';

export interface Photo {
  /** current = taken for today's listing; example = labelled illustrative photo (reserved bags only). */
  kind: 'current' | 'example' | 'none';
  asset?: PhotoAsset;
  /** Local file from the camera (merchant publish). */
  uri?: string;
  takenAt?: number;
}

export interface Ratings {
  quality: number;
  quantity: number;
  variety: number;
  smoothness: number;
  /** Number of verified pickups the averages are based on. */
  n: number;
}

export interface Store {
  id: string;
  name: string;
  /** i18n key suffix: `kind.<kind>` */
  kind: string;
  city: CityId;
  address: string;
  /** Distance from the demo reference point (saved place / city centre). */
  km: number;
  /** Position on the simulated map, 0..1. */
  x: number;
  y: number;
  initials: string;
  photo: PhotoAsset;
  ratings: Ratings;
  /** Merchant pickup reliability: verified successful reserved pickups vs merchant-caused failures. */
  reliability: { ok: number; fail: number };
}

export type ReportLevel = 'MANY' | 'LOW' | 'NONE';

export interface WalkInReport {
  level: ReportLevel;
  at: number;
  by: string;
  /** Set when the shop itself confirmed the status. */
  merchant?: boolean;
}

export type OfferStatus = 'active' | 'ended' | 'closed' | 'expired';

export interface Offer {
  id: string;
  storeId: string;
  vertical: Vertical;
  distributionMode: DistributionMode;
  pricingMode: PricingMode;
  /** Integer minor units; always 0 at launch. */
  priceMinor: number;
  currency: 'EUR';
  accessChannel: AccessChannel;
  campaignId: string | null;
  eligibilityPolicyId: string | null;
  status: OfferStatus;
  categories: CategoryKey[];
  description: string;
  /** WALK_IN: what is on offer (free text, required). */
  what?: string;
  start: number;
  end: number;
  publishedAt: number;
  photo: Photo;
  /** RESERVED only. */
  qtyTotal?: number;
  qtyLeft?: number;
  reservationsOpen: boolean;
  /** WALK_IN only: automatic close time (60 min window, +30 min extensions — pilot proposals). */
  expiresAt?: number;
  reports: WalkInReport[];
  closedAt?: number;
}

export type ReservationStatus = 'confirmed' | 'collected' | 'cancelled_user' | 'cancelled_merchant' | 'not_received' | 'expired';
export type MerchantCancelReason = 'out' | 'closing' | 'other';
export type NotReceivedReason = 'out' | 'closed' | 'other';

export interface Reservation {
  id: string;
  offerId: string;
  storeId: string;
  userId: string;
  code: string;
  status: ReservationStatus;
  createdAt: number;
  cancelReason?: MerchantCancelReason;
  notReceived?: { reason: NotReceivedReason; text?: string };
  rated?: boolean;
}

export type Permission = 'unknown' | 'granted' | 'denied';

export interface NotificationPrefs {
  permission: Permission;
  favorites: boolean;
  radius: boolean;
  radiusKm: number;
  cities: CityId[];
  quiet: boolean;
  /** 'HH:MM' */
  quietStart: string;
  quietEnd: string;
  reminders: boolean;
}

export interface LocationPref {
  mode: 'unset' | 'gps' | 'city';
  city: CityId | null;
  km: number;
  gps: Permission;
}

export type AlertReasonKind = 'favorite' | 'bell' | 'radius' | 'city';
export interface AlertReason {
  kind: AlertReasonKind;
  city?: CityId;
}

export interface LogEntry {
  at: number;
  key: string;
  vars?: Record<string, string | number>;
}

export interface AppState {
  version: 1;
  userId: string;
  merchantStoreId: string;
  stores: Store[];
  offers: Offer[];
  reservations: Reservation[];
  favorites: string[];
  /** Per-shop alert subscriptions (the bell), independent of favourites. */
  bells: string[];
  notif: NotificationPrefs;
  location: LocationPref;
  myReports: Record<string, { level: ReportLevel; at: number }>;
  myQuality: Record<string, { value: number; saved: boolean }>;
  /** Why an alert was sent for an offer (shown on the offer). */
  alertReasons: Record<string, AlertReason[]>;
  /** Collected meals (profile impact). */
  impact: number;
  log: LogEntry[];
  seq: number;
}

/** Side effects the app turns into notifications / toasts. The core never touches devices. */
export type Effect =
  | { type: 'alert'; offerId: string; reasons: AlertReason[] }
  | { type: 'cancelled'; reservationId: string; storeId: string; reason: MerchantCancelReason }
  | { type: 'reminder'; reservationId: string; offerId: string };

export interface Result<T = undefined> {
  state: AppState;
  ok: boolean;
  error?: string;
  value?: T;
  effects: Effect[];
}
