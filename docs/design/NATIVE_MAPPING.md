# HTML mockup → React Native (Stage Two reference, not authorised yet)

The mockup is deliberately built like a tiny component framework so Stage Two can translate it piece by piece into **React Native + Expo + TypeScript native components** (never a WebView).

## Files

| Mockup file | Role | Stage Two equivalent |
|---|---|---|
| `css/tokens.css` | Colour, type, spacing, radii, sizes | `src/theme/tokens.ts` (typed object) consumed by a `useTheme()` hook |
| `js/i18n.js` | Keyed strings `[fi, en]` | `src/i18n/fi.json`, `en.json` + i18next; same keys |
| `js/data.js` | Flags, mock stores/offers, scenarios | `src/services/mock/*` behind the same interfaces the real backend will implement |
| `js/app.js` | State, selectors, domain rules, actions | Zustand slices + `src/domain/*` pure functions (unit-tested) |
| `js/components.js` | Pure render functions | `src/components/*` |
| `js/views-collector.js`, `views-merchant.js` | Screens and sheets | Expo Router screens under `app/(collector)/…`, `app/(merchant)/…` |
| `js/art.js` | Icons, illustrations, simulated map/QR | `react-native-svg` icons; real photos from storage; map SDK TBD; `react-native-qrcode-svg` |
| `js/demo.js` | Demo panel | Not shipped. Dev-only scenario switcher in a debug build at most |

## Components

| Mockup function | Native component | Props (sketch) |
|---|---|---|
| `C.offerCard` | `OfferCard` | `offer`, `store`, `availability`, `isFavorite`, `lastReport?`, `onPress` |
| `V.offerDetail` | `OfferDetail` screen | composes the rows below |
| `C.modeBadge` | `DistributionModeBadge` | `mode: 'RESERVED' \| 'WALK_IN'` |
| `C.statusBadge` | `AvailabilityBadge` | `state: active \| soldout \| stopped \| possiblyGone \| review \| closed \| expired \| ended` |
| `C.photoTag` | `PhotoProvenanceTag` | `kind: 'current' \| 'example' \| 'none'`, `capturedAt?` |
| `C.heart` / `C.heartCard` | `FavoriteHeart` | `storeId`, `variant: 'icon' \| 'card'` |
| `C.bell` / `C.bellCard` | `ShopBell` | `storeId`, `variant` |
| pickup rows in detail | `PickupWindow` | `start`, `end`, `now` |
| `C.categoryTags` + caveat | `PossibleContents` | `categories[]`, shows the mandatory caveat for reserved bags |
| `C.ratingBlock` | `RatingFactors` + `ReliabilityMeter` | `ratings{quality,quantity,variety,smoothness,n}`, `reliability{ok,fail}` |
| `V.ctaBar` | `ReservableCTA` | `offer`, `state`, `activeReservation?` — disabled states always carry a reason |
| `V.ticket` + `FTG.qrSvg` | `PickupQR` / `PickupTicket` | `reservation`, `offer` |
| `V.reportBlock` | `WalkInReport` | `offerId`, `myReport?`, `reports[]` |
| `C.starInput` | `StarInput` | `value`, `onChange`, `label` |
| `MV.form` | `MerchantPublishForm` | `draft`, `mode`, `onPublish` |
| `V.notifSettings` | `NotificationPreferences` | `prefs`, `permission` |
| `C.sheet` / `C.osDialog` | `BottomSheet` / native `Alert` + permission APIs | — |
| `C.empty` / `C.actionCard` | `EmptyState` / `ActionCard` | — |
| `V.push` | (none) | Real push via Expo Notifications; tap → deep link `freetogo://offer/:id` with server recheck |

## Domain rules already isolated

`offerState`, `walkSignal` (possibly gone / review), `discoverOffers` (location, radius, filters), `matchAlerts` + deduplication + quiet hours, `notifyNewOffer`, reservation race handling. In Stage Two these become pure TypeScript functions mirrored by **server-side** checks; the client never decides stock, eligibility or price.

## Future-ready model (fields exist, UI hidden)

```ts
type Offer = {
  id: string; storeId: string;
  vertical: 'food';                    // more verticals later via config, not new screens
  distributionMode: 'RESERVED' | 'WALK_IN';
  pricingMode: 'FREE';                 // 'PAID' later, per market
  priceMinor: 0; currency: 'EUR';
  accessChannel: 'PUBLIC';             // 'TARGETED' later; server-authorised only
  campaignId: null;                    // community campaigns later
  eligibilityPolicyId: null;
  categories: CategoryKey[];           // multi-select checkboxes
  start: Minutes; end: Minutes; publishedAt: Minutes;
  photo: { kind: 'current' | 'example' | 'none'; capturedAt?: Minutes };
  qtyTotal?: number; qtyLeft?: number; // RESERVED only
  what?: string; expiresAt?: Minutes;  // WALK_IN only
  reports?: WalkInReport[];
};
```

Flags (`data.js` → server config, all default as below): `enabled_verticals=['food']`, `walk_in_mode_enabled=true`, `push_alerts_enabled=true`, `public_channel_enabled=true`, and **false**: `targeted_channel_enabled`, `community_campaigns_enabled`, `assistance_request_enabled`, `priority_early_access_enabled`, `paid_offers_enabled`, `merchant_billing_enabled`, `consumer_access_fee_enabled`, `advertising_enabled`.

Seams for later: a `Reservation` today is a `FREE_CONFIRMED` order; a future `Order` abstraction adds `PENDING_PAYMENT/PAID/REFUNDED` without changing free bookings. `ReservableCTA` routes by pricing config — a checkout route would be added there only when a market enables paid offers. Eligibility/entitlement checks belong in the service layer, not in components.
