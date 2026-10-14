# CLAUDE MASTER PROMPT — Free To Go — UI/UX reference analysis and two-stage implementation
**Current status:** Approved functional specification; design is next. **Stage One only until owner approval.** Read repository docs first.

Repository: https://github.com/AriCad/freetogo

## STEP 0 — Read ALL authoritative files
- https://github.com/AriCad/freetogo/blob/main/README.md
- https://github.com/AriCad/freetogo/blob/main/docs/PRODUCT_SPEC.md
- https://github.com/AriCad/freetogo/blob/main/docs/ARCHITECTURE.md
- https://github.com/AriCad/freetogo/blob/main/docs/DESIGN_HANDOFF.md
- https://github.com/AriCad/freetogo/blob/main/docs/PAID_MARKETPLACE_READINESS.md
- https://github.com/AriCad/freetogo/blob/main/docs/COMMUNITY_SUPPORT.md

Treat the documents as the product specification; do not silently change decisions. If a rule conflicts, newer explicit decisions win, particularly the community module default OFF.

## Reference: Too Good To Go (study newest available verified real screenshots)
Our ideal is nearly the same **intuitive information hierarchy, layout logic, card patterns and familiar discovery-to-reservation flow** as Too Good To Go, simplified for food always costing zero at launch. We do NOT want their logos, brand assets, exact illustrations, copyrighted screen graphics or pixel-for-pixel duplication.

Visit/inspect these sources and report which were accessible, screenshot dates/versions where verifiable, and uncertainty:
- Official Google Play Android listing (current published store screenshots): https://play.google.com/store/apps/details?id=com.app.tgtg&hl=en
- AppBrain Android listing/screenshots (previously indexed as 26.10.0 in October 2026; verify before asserting): https://www.appbrain.com/app/com.app.tgtg
- Official Apple App Store screenshots: https://apps.apple.com/us/app/too-good-to-go-end-food-waste/id1060683933
- Swipefile iOS design reference (previously indexed as 26.9.0, Sept 2026): https://swipefile.design/ref/mobile-too-good-to-go/
- Uiland historical screens/flows (139 screens and 16 flows in prior listing; do not assume newest): https://uiland.design/screens/toogoodtogo/screens/cfae1221-b965-457b-a284-5dc6792046c3/flows/all
- ScreensDesign historical app UI collection: https://screensdesign.com/apps/too-good-to-go-end-food-waste/?vs=100280

Study exact visible navigation, explore/list/map, filters, store page, offer cards, favorite and rating UI, offer detail, reserve/confirm, pickup and account. Distinguish witnessed details from assumptions. If a reference requires a paid subscription or can't load, don't purchase or pretend to have seen it.

## Product and scope
Free To Go: ONE extremely minimal mobile app, TWO roles (collector and merchant), iOS + Android, food-only public experience at launch. Two ACTIVE giveaway modes:
1. RESERVED BAG: bag count, start/end window, clearly shown 0 €, reserve for free, QR/collection, four distinct 1–5-star ratings (quality, quantity, variety, pickup smoothness). A confirmed booking means stock is reserved.
2. WALK-IN GIVEAWAY: no reservations and no counting; mandatory FRESH photo of today's actual goods, start AND end times, published age, **"Ei varausta – saatavuus epävarma."**, prominent reports "Paljon jäljellä", "Vähän jäljellä", "Kaikki loppu", optional independent quality rating; store one-click "Kaikki loppu"; expiry/extend. Community reports alone do not establish guaranteed stock or automatically punish a shop.

Merchants choose possible content with MULTISELECT CHECKBOXES (not radio buttons), optional description and (on reserved bags) optional photo. Collector-facing disclaimer: **"Kassien sisältö vaihtelee. Kaikkia mainittuja tuoteryhmiä ei välttämättä ole jokaisessa kassissa."**

Store reliability (verified pickup fulfillment) is separate from food review score. No public chat. Favorited stores have hearts; each store also can have a bell to opt into alerts. Collector push subscriptions: favorite stores, specific stores, radius around saved location, whole selected town/city. Deduplicated notifications deep-link to an offer, with expiration/availability recheck. Push is a REQUIRED future MVP implementation, but mock its interactions now.

Important growth-stage UX: beautiful empty states, discoverability of alerts, clear sold-out status, easy location selection and no fake listings.

### Hard launch exclusions, future-proofed (do not show in Stage One UI)
- Future furniture/other verticals: shared generic data architecture only, **food is sole visible vertical**.
- Future merchant paid subscription, consumer one-time access fee (e.g. €0.99), discounted PAID food bags in selected countries: technical/data-layer extensibility only. All launch goods and usage cost **0 €**; NO checkout, payment processing or subscription UI now.
- Future merchant-to-recipient donation campaigns, including **meals and Christmas food bags donated by stores THROUGH THE FREE TO GO APP** (not an external charity landing page): prepare reuse of our offer, eligibility, notification, reserve/QR pickup engine, but DO NOT surface or implement these at launch.
- Future discreet "Tarvitsen apua" option is OFF and HIDDEN at launch.
- **Five-minute priority/early-access feature MUST be OFF, hidden in every market and off in backend by default**. Absolutely NO priority banner, five-minute timer, settings toggle, preview or special merchant button in the current HTML mockup or launch UI. It may be enabled only after later explicit approval for a controlled, fair pilot.

## BRAND — make recognizable and DISTINCT
We admire Too Good To Go usability, but its dark green/teal brand should NOT be confused with ours.
- Propose THREE recognizable original visual palettes, with HEX tokens and app icon ideas, compatible with a mostly light/white UI, genuine food photography, clean outlines and excellent accessibility.
- Avoid relying on only a barely different green; consider more distinct colors and justified use of accent.
- Recommend ONE with reasoning. Treat earlier proposed green as provisional.
- Design compact, friendly, confident, modern, simple. No charity-looking UI, clutter, unreadable micro-text or glossy marketing excess.
- Consistent shared tokens (colors, typography, spacing, radius, shadows, icon rules) and mobile tap target/safe areas.

## STAGE ONE — light CLICKABLE HTML mockup ONLY
Deliver a locally openable HTML/CSS/minimal vanilla JS demo. No backend, database, production deployment, live APIs, payment or app store build. Reuse screen components/templates and design tokens; realistic clearly labeled fixture data; use locally available or permitted imagery, no copied TGTG artwork.

Build a convincing **mobile-sized clickable visual prototype**, not a wireframe, that can eventually guide a React Native implementation. Core flows/screens:
- Collector onboarding/location permission fallback; Discover offer list; map/list and filter; favorites; store profile; detail for BOTH distribution modes; reservation confirmation and QR example; pickups; four-part food review; merchant reliability and reservation-failure report; notification settings with saved area/city/store/favorites plus sample push deep-link; profile.
- Walk-in current photo, explicit no-reservation warning, availability reports (plenty/little/gone) in LARGE one-tap controls, optional quality rating; show time of report and published time.
- Merchant role switch; publish reservable bags and walk-in giveaways with start/end and photo rules; reuse previous publication; manage active listings, stop/extend walk-in; simulated QR handover.
- Edge cases: none available, already booked/sold out, expired, no GPS, canceled reservation, unverified "all gone" report, merchant declares out of stock.
Buttons and UI must meaningfully respond in the prototype: nav, favoriting, alert toggles, filters, reserve, pickup confirmation, reviews, reports, publish simulated listing. No inert controls disguised as working actions.

### STOP GATE (strict)
After Stage One, STOP. Share (a) proposed 3 palettes and preferred option, (b) screenshot audit results, (c) nav map, (d) how to open the HTML mockup locally, (e) prototype preview and changes vs Too Good To Go. Request owner approval.
Do not begin React Native implementation, Supabase, paid feature screens, backend, native builds or CI before explicit approval.

## STAGE TWO — ONLY upon explicit owner approval
Translate approved HTML layout to **real reusable React Native + Expo + TypeScript code** (NOT a WebView). Build real mobile UI screens/components with theme tokens, typed mock models/service adapters, accessible controls, safe area/keyboard behavior, photos/camera placeholders and navigation. Keep the backend unconnected until approved.
Common entities: Offer, Store, Reservation, Pickup, Notifications, Review, WalkInReport, future OfferPricing and optional CampaignId. Generic component set: OfferCard, StoreCard, OfferDetail, PickupWindow, AvailabilityBadge, FavoriteHeart, StoreAlertBell, BookingCTA, QRPickup, FourFactorRating, AvailabilityReport, MerchantOfferForm. Preserve future paid-bag and merchant donation extension seams; do not actually build those hidden flows now.

## Costs & repo workflow
ZERO new paid subscriptions/overages. No paid screenshot subscriptions, no unnecessary GitHub Actions, CI, cloud builds or deployments. Prefer included Claude/Cursor tools and local tests. Use a dedicated design branch if appropriate; do not merge design work without owner approval. Keep generated docs/prototypes easy to inspect.

## Your first response/action
1. Confirm docs you actually read.
2. Report what current screenshot references you truly inspected and their dates/versions if verifiable.
3. Propose three original visual directions and recommend one.
4. State Stage One mockup plan and start implementing ONLY that clickable HTML mockup.
5. Stop for design approval when it is ready.


## IMPORTANT LATEST OWNER DECISION — PUBLIC VS TARGETED CHANNEL (FUTURE ONLY)
Read [COMMUNITY_SUPPORT.md](COMMUNITY_SUPPORT.md) in full. Design future-ready shared data/component architecture around `access_channel: PUBLIC | TARGETED`:
- **Avoin / PUBLIC**: every collector can see and book/pick up free offers, the default food-waste marketplace.
- **Kohdennettu / TARGETED**: only individually authorized recipients can see and book specific donated offers, with a visible **"Kohdennettu"** badge ON THE OFFER in eligible collectors' views. Typical verifying partners: church diaconal services, food aid NGOs, and wellbeing-county social work, who can issue an expiring code or private profile grant without requiring users to upload financial documents.
- Targeted offers and all derived information MUST be server-restricted, never merely visually filtered in the client. Qualified users eventually see public and their approved targeted offers side by side, in the same app. Targeted campaigns can include merchant-given meals and Christmas food bags, handled via the same existing reservation/QR engine.
- **Do not confuse TARGETED with the optional five-minute PRIORITY feature.** Five-minute priority stays completely disabled/hidden by default. TARGETED ALSO stays disabled/hidden at launch and in Stage One mockup: no tab, listing, badge, menu, setting, code entry, notification, or teaser.
- Please include these in the FUTURE architecture/type notes only. DO NOT create targeted UI, donation screens or actual partner verification in the first lightweight HTML mockup. Preserve all current free public food flows and cost restrictions.
