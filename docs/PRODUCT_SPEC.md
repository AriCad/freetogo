# Free To Go — approved functional specification (v1)

This document reflects decisions from the October 2026 product conversation. Unresolved details are explicitly marked **proposed** rather than approved. Do not silently replace any decided behavior.

## Vision and scope
- A Too Good To Go-style experience to discover surplus goods **for free**.
- Food-only consumer-facing launch. Underlying platform can later switch on non-food verticals.
- Single React Native/Expo mobile app on iOS and Android with collector and merchant views; no separate merchant web dashboard for MVP.
- Default language to be decided; build translations in from the start.
- User and merchant acquisition and use free at launch. No payments charged. Monetization hooks prepared but dormant.

## 1. Collector experience
Bottom navigation (proposed labels): Discover, Favorites, Pickups, Profile.
- Discover: nearby offer list and map, distance, location, search and useful filters, saved locations.
- Listing cards: merchant/store, photo if present, offer category/content hint, distance, pickup start and end time, 0 €, availability and mode, ratings, favorite/alert affordances.
- Detail: verified merchant/location, address, map/directions, terms, pickup window, content descriptors, image labeling, reserve CTA or walk-in instructions and strong mode labeling.
- Favorites: stores can be hearted; bell allows individual store notifications. Favorites and alerts are separate controls.
- Pickups: reservation status, QR code for merchant check, cancellation, pickup history and rating access.
- Profile: account, notification permissions, followed locations/cities, preferred radius, quiet hours, privacy/data settings, role switch if relevant.
- Genuine empty states are critical for low-density pilots: no offers now, follow favorite shops, turn on alerts. No fake availability.
- No chat, forums or mandatory social functions.

## 2. Distribution modes
### A. RESERVATION (the primary/default)
- Merchant creates an offer for a **counted number of bags** with a defined pickup start/end.
- Collector reserves one available bag for 0 €. Server transaction decrements remaining stock without overselling.
- Confirmed reservation entails a real expectation that food is reserved for the collector.
- QR code or equivalent code verifies actual pickup at the shop; only collected orders can be rated.
- Reservations may be cancelled by merchant; immediately notify affected users, record reason. User can report "I did not receive my reserved bag": food ran out, shop closed, other.
- Repeated confirmed merchant-caused failure impacts separate pickup-reliability measure, not ordinary food quality.
- Standard rule initially: at most one active reservation per collector, one bag per offer. Repeated no-shows can cause proportionate restrictions after explanation/appeal.
- Merchant can reuse prior publication as draft, reconfirm the categories and times, adjust quantity, and publish quickly.

### B. WALK_IN (no reservation; first come, first served)
- For surplus impossible or impractical to pack/count (e.g. a lot of bananas).
- Clearly and prominently label: **“Ei varausta – saatavuus epävarma.”** Translate precisely per locale.
- Merchant MUST provide a **new, current photo of actual goods** for every listing (not reused illustrative photography); product description/categories and **both start and end time**.
- No inventory count required, no promise of availability, no QR-based reservations.
- Display publish timestamp and latest credible availability reports with age ("4 min ago"); no guarantee.
- Merchant has one-tap "All gone" action which closes the listing and its visibility. Maximum active window proposed at 60 minutes, with explicit 30-minute renewal only if confirmed food remains; store settings and notifications manage expiries.
- Walk-in reports from collectors: **Plenty left / A little left / All gone**, visually prominent and easy to report in one tap after arriving. Separate OPTIONAL food quality stars. Reporting availability must not require rating quality.
- Reports display to other collectors with timestamp and clear “unverified user report” attribution. First "all gone" report may warn "possibly gone" but must not close or harm merchant automatically. Independent corroborations can trigger temporary review/pause plus merchant prompt. Do not allow repeated fake reports by same user; rate-limit, flag abuse, allow dispute.
- Walk-in giveaway naturally running out should NOT penalize merchant reliability. Repeated verified failure to close materially stale offers may influence trust.
- Merchant may decide to use walk-in regularly; make reservation more attractive through priority placement and clearer availability, rather than coercive fixed quotas.
- Quality rating from walk-in recipients should have an anti-abuse mechanism to establish reasonable evidence of pickup (proposed: shop QR or presence confirmation) before counting toward public aggregate.

## 3. Describing food
- MULTISELECT **checkboxes** (never single-choice radio) for possible product groups. Proposed groups: bread/pastries, fruit/vegetables, dairy, prepared meals, meat, fish, dry goods/cans, snacks/sweets, other.
- Merchant may add a voluntary photo for reservable bags, plus short voluntary free-text description.
- Collector-facing label: **“Tämän päivän mahdollinen sisältö”** and exact caveat **“Kassien sisältö vaihtelee. Kaikkia mainittuja tuoteryhmiä ei välttämättä ole jokaisessa kassissa.”**
- Categories describe possible items across today's bags, NOT a promise about every bag.
- Distinguish photo captured for this day's actual products vs properly labeled example photo (example photos permitted only for reservable bag listings).
- Do not infer allergen-free/vegetarian status from unchecked categories; fulfill actual mandatory food information requirements according to local regulations.
- Photo mandatory and fresh for walk-in.

## 4. Push notifications (core MVP, not optional later)
Opt-in settings with toggles:
- Newly published offer at any favorite/followed store.
- Per-store bell toggle even when separate from favorites.
- All participating stores within user-selected radius around SAVED location (e.g. 1–20 km).
- All participating stores within a selected town/city/village. User need not currently be there.
- Distinct saved places possible in later iteration; do not require background location tracking.
- At launch everything alerts **food only**; future opt-in by vertical.
- Tapping alert deep-links directly to specific offer. Server availability is rechecked on open and on reservation.
- Deduplicate overlapping matching triggers: <=1 notification per user per offer. Respect OS notification permissions, quiet hours, account switches, expired/closed status; avoid repetitive or misleading blasts.
- Publish event triggers server-side notification queue promptly; push providers cannot guarantee instantaneous delivery.
- Pickup reminders and cancellation alerts are separate transactional notification classes.
- Merchant does not need an extra “notify subscribers” click.
- Testing must include real device notification delivery, denied permissions, app background/closed, deduplication, location preferences and expired offer.

## 5. Ratings, reviews and reliability
- After a verified reserved pickup, collector may rate FOUR 1–5-star criteria: food quality, quantity, variety, pickup smoothness.
- Reviews are collector-to-collector information; merchants cannot edit negative ratings. Display sample sizes and meaningful recency, prevent duplicate ratings.
- Separate merchant reliability (verified successful reserved pickups / merchant-caused failures), not conflated with subjective food quality. A user no-show does not penalize a shop. Pilot must define thresholds and handle disputes.
- Walk-in reports of availability and OPTIONAL food quality are independent; distinguish instantaneous availability from historical rating.
- Dangerous/spoiled food has a separate safety-report flow with rapid merchant/admin handling; never rely only on star ratings.

## 6. Merchant
- Merchant ownership/contact verification and ability to manage one or more physical locations; authorized staff on shared business location.
- Three main areas: Publish, Pickups, Store profile. Role switch for collector/merchant where relevant.
- Minimal publishing flow (goal: <20 seconds for a reused offer): mode, categories/what is being given, bag count only for reserved mode, photo (mandatory fresh for walk-in), optional description, START and END time, confirmation.
- Merchant can edit status, see pickup QR verification, cancel/reschedule safely, declare out-of-stock, review reports, acknowledge expiry reminders.
- Never let merchant manually overwrite independent ratings/reports.
- Merchant photos must meet media upload and privacy requirements.

## 7. Safety and privacy
- Store is accountable for safe products, temperature control, use-by rules, traceability and appropriate disclosure, subject to jurisdiction-specific verification. No distribution after an applicable legal use-by deadline. “Best before” can differ.
- The platform's precise legal status as intermediary must be checked per country. Separate marketplace operations from physical distribution.
- GDPR: minimize data; avoid precise background GPS, avoid exposing private home addresses, respect deletion/export/retention requirements.
- Clear photos and text cannot replace mandatory allergen/product safety information.
- Abuse controls: fake merchant, fake listings, automated reservations, fake reports, no-shows, manipulative reviews, fake merchant-initiated collection.
- Accessibility, larger touch targets, readable contrast, native screen reader labels.

## 8. Monetization: designed-in but completely inactive at launch
- Free downloads/access for collectors; no checkout, subscription, advertising, booking fee or paywall.
- Free registration and publishing for merchants.
- Future OPTIONAL merchant monthly subscription or pricing per vertical/location and merchant grandfathering.
- Future OPTIONAL nominal consumer charge, e.g. €0.99 purchase/access. Apple and Google distribution models differ: Google Play cannot convert an already-free app listing to paid download, so design future in-app entitlement as an alternative. Any future paid digital feature requires app store billing/policy analysis before implementation. Do not introduce silent charges.
- Keep early-adopter/grandfather entitlements possible. Payments providers, checkout, receipts, prices and legal text are NOT implemented in MVP.

## 9. MVP acceptance criteria
1. Food is the only visible vertical; even new users see no blank other vertical navigation.
2. Shop can publish reserved bags and fresh-photo walk-in offers with start/end; merchant can end offers and confirm pickup.
3. Customer can see nearby offers, opt in alerts, reserve real inventory, collect, give four ratings, flag merchant-caused failures.
4. Walk-in users see uncertainty disclaimer, publish time and timely availability reports; can post 1-tap availability and optional quality.
5. Confirmed inventory never oversells under concurrent reservations; cancellations and expiries are handled.
6. Overlapping subscriptions generate only one push per offer; opt-out is respected.
7. Neither merchants nor collectors can be charged at launch.
8. Test real push and camera on actual iOS and Android devices before launch.

## Open product decisions to settle in UI workshop
- Exact localization/default launch language, age requirement and identity checks.
- Max active pickups/day, reservation cancellation deadlines, no-show policy thresholds.
- Precise ratings aggregation and number/recency threshold for publishing shop reliability.
- Walk-in evidence / report integrity method, appeals and automated pausing threshold.
- Notification quiet-hour defaults, radius/city selection experience, map provider and legal disclosures.
- Operational policy for suspicious goods, safety alerts and real-life out-of-stock reports.


## 10. Future paid surplus offers — prepared but disabled
- A country may eventually enable a Too Good To Go-style discounted paid surplus product while other countries remain fully free. No change to initial food-only, all-free experience.
- A future paid reserved offer has merchant-specified price, original/reference value where legally substantiated, currency, tax handling, quantity, collection window, payment at checkout, confirmation, redemption, cancellation and refund policies, merchant settlement and fees.
- Walk-in giveaways remain free; do not turn them into a payment checkout implicitly.
- UI must support three concepts in domain logic: free reservable, free walk-in, and later paid reservable. In launch UI only first two are visible and price is always 0.
- Display "0 €" without payment flow for free offers. Paid cards, price filters, payment methods, discount labels, receipts and payment status are introduced only when that market is deliberately enabled and legally ready.
- Consumer €0.99 access and merchant SaaS fees are **independent** of customers paying for a discounted food bag. Do not conflate the three separate kinds of monetization.
- Design a future variant of the user flow: discover -> paid offer detail -> checkout -> external payment confirmation -> reservation confirmed -> collect -> rate. Never confirm paid inventory unless the payment/reservation saga completes; use a short expiry hold where needed.
- Legal approval needed by market for payments, disclosures, consumer cancellation rights, tax, merchant-of-record structure and refunds.
