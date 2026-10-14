# CLAUDE MASTER PROMPT — FREE TO GO
## First assignment: Too Good To Go benchmarking + clickable HTML mockup

**This is the consolidated, current FIRST-TIME prompt for Claude (October 14, 2026).**
You have not received an earlier assignment. Begin at Step 1. Do not assume any work has been done beyond the documents in GitHub.

**Project:** Free To Go (working name)
**Repo:** https://github.com/AriCad/freetogo
**Objective:** Design an exceptionally polished, light, simple, recognizable mobile experience modeled on the intuitive *interaction patterns* of Too Good To Go, with the exact Free To Go functionality specified below. Deliver a **lightweight clickable HTML mockup first**, for owner approval. Do not yet develop the production mobile app or backend.

# 1. Read the repository documentation before doing anything else

Authoritative documents:
- https://github.com/AriCad/freetogo/blob/main/README.md
- https://github.com/AriCad/freetogo/blob/main/docs/PRODUCT_SPEC.md
- https://github.com/AriCad/freetogo/blob/main/docs/ARCHITECTURE.md
- https://github.com/AriCad/freetogo/blob/main/docs/DESIGN_HANDOFF.md
- https://github.com/AriCad/freetogo/blob/main/docs/PAID_MARKETPLACE_READINESS.md
- https://github.com/AriCad/freetogo/blob/main/docs/COMMUNITY_SUPPORT.md

The present master prompt consolidates the approved decisions and adds strict Stage One instructions. The linked documentation supplies detailed rules and edge cases. Read all six sources. If a requirement seems inconsistent, preserve the most recent explicit product decision and flag the conflict before overriding any agreed behavior. Do not replace checkboxes with radios, hide a second giveaway mode, or show future-only features.

# 2. Study actual Too Good To Go mobile UI before designing

We want **very familiar usability, visual hierarchy, card-based browsing, exploration, search/filter/map, reservation and collection experience**, but **our own brand, styling and implementation**. Do not create a pixel-for-pixel copy, reproduce its logos, proprietary illustrations, images, copy or uniquely branded composition. A similar interaction pattern is fine; the overall brand must be distinctly Free To Go.

Use these prioritized visual references, actually open them where possible:

1. Official Google Play Android images:
   https://play.google.com/store/apps/details?id=com.app.tgtg&hl=en
2. AppBrain Android screenshots:
   https://www.appbrain.com/app/com.app.tgtg
   Checked Oct 14, 2026: AppBrain indexed version 26.10.0 (updated Oct 2, 2026), with seven publisher store screenshots. Store screenshots can be marketing previews, not guaranteed literal app flows.
3. Official Apple App Store iOS images:
   https://apps.apple.com/us/app/too-good-to-go-end-food-waste/id1060683933
4. Swipefile iOS:
   https://swipefile.design/ref/mobile-too-good-to-go/
   Publisher previews indexed for listing 26.9.0, reviewed Sep 9, 2026; image order is NOT a tested user flow.
5. Uiland detailed screenshot and flow library:
   https://uiland.design/screens/toogoodtogo/screens/cfae1221-b965-457b-a284-5dc6792046c3/flows/all
   Historical screenshot/flow collection; check available access and don't assume it matches the newest version.
6. ScreensDesign collection:
   https://screensdesign.com/apps/too-good-to-go-end-food-waste/?vs=100280

Do NOT pay to access screenshot tools. If inaccessible, say so, and never guess exact positions/behavior of unseen buttons.

Produce a short, factual reference audit: screenshots you actually saw, their known dates/versions, observed screen hierarchy/nav/card patterns, what is verified vs inferred, and the features we should adopt, simplify, remove or add.

Look especially at:
- Nearby offers/home, store and offer cards, imagery, spacing and ratings.
- Bottom tab navigation and map/list browsing.
- Search, location and filters.
- Merchant profile, favorites and notifications.
- Reservation details, primary CTA, success and pickup confirmation.
- Review screens, profile and empty states.

# 3. Free To Go — hard product decisions

**At initial launch:**
- ONE cross-platform phone app for iOS and Android, TWO account roles: collector and merchant. Same user may have both.
- Consumer-facing app appears **food-only**, entirely **0 €** for everyone. No checkout, payments, ads, paywalls, fundraising, subscription prices or paid tiers.
- The default access channel is **AVOIN / PUBLIC**, open to everyone.
- TWO visible food distribution modes, both crucial:
  A. **Reserved surprise bags** — a merchant specifies counted bag quantity, start/end collection time, optional current photo, optional free-text description and MULTISELECT food-group checkboxes. Customer reserves a bag for free and gets a simulated QR pickup code. Stock is reserved, not merely suggested. Merchant verifies pickup. Only verified collected bags can generate four 1–5 star scores: **quality, quantity, variety, pickup smoothness**.
  B. **Walk-in giveaway / no reservation** — intended for uncounted loose goods such as crates of bananas. Merchant must take a **fresh actual photo for every listing**, enter what is available plus mandatory collection START and END times. **No bag count, no reservation button, no availability guarantee**. Prominent exact label **"Ei varausta – saatavuus epävarma."** Show publication age, latest collector reports and timestamps. Collectors report with three large, nearly one-tap controls: **"Paljon jäljellä"**, **"Vähän jäljellä"**, **"Kaikki loppu"**. Optional and SEPARATE quality stars, never forced. Merchant has large one-tap **"Kaikki loppu"** stop action. Plan automatic expiry (proposed 60-minute max) and merchant-confirmed extension (proposed 30 minutes); these durations are pilot proposals, not locked business rules.
- Merchant food groups MUST be **multiple checkboxes**; different bags can contain different categories. Shopper copy: **"Tämän päivän mahdollinen sisältö"** and **"Kassien sisältö vaihtelee. Kaikkia mainittuja tuoteryhmiä ei välttämättä ole jokaisessa kassissa."**
- Reserved bag photo and free text are optional. If using an illustrative example photo, label it clearly; never pass old imagery off as current walk-in inventory.
- **No public chat**, forums or social networks.

**Trust and safety:**
- Food rating and merchant collection reliability are separate metrics.
- If a confirmed reserved bag is missing on arrival, collector reports **"En saanut ruokakassiani"** and picks reason: out of food, store closed, other. Merchant-caused verified failed pickups can affect separate reliability. Natural walk-in depletion cannot.
- A single user's "Kaikki loppu" observation should show **possible depletion**, not autonomously shut down the listing or punish the merchant. Timestamp and distinguish unverified reports, merchant-confirmed closure and stale reports.
- QR pickup confirmation and report integrity, abuse prevention and food safety need real verification in production; Stage One simulates them honestly.

**Notifications are a signature differentiator and REQUIRED in MVP:**
- Favorites heart vs individual shop notification bell are distinct interactions.
- Opt-in alerts from favorite stores, specific stores, all within selected radius from saved place, and entire manually selected village/town/city even if user isn't physically there.
- Default food-only matching, no continuous background GPS tracking. Support location-denied fallback.
- Notification tap deep-links to offer, with simulated recheck before reservation; later deduplicate if multiple subscriptions match.
- Respect quiet hours, OS permission concepts, cancellation and pickup reminders. In HTML demo use simulated notification interactions; NO real push provider yet.
- Sparse early supply matters: make empty states and push opt-ins exceptionally discoverable.

**Merchant UX:**
- Use the SAME app with role switch, not a second app or dashboard.
- Main areas: publish, manage listings/pickups, shop profile.
- Repeat previous listing as draft and confirm up-to-date category/stock/time. Merchant should be able to republish within ~20 seconds as a design target.
- For reserved mode collect integer bag count; for walk-in ask photo, start/end, what is offered, no quantity count.
- Provide simulated publish, adjust/end offer, check in QR, out-of-stock and report review states.

# 4. Future-ready extensions — architecturally supported, NOT visible in Stage One

The HTML mockup and launch UI must **NOT include buttons, badges, navigation entries, lists, promo banners or simulated active screens for these future features**:

**Multi-vertical:** one generic offer engine; food is the ONLY enabled and visible vertical now. Furniture, plants, construction materials, clothing and others are future categories. Generic typed architecture permits vertical-specific fields/forms/ratings without cloning the engine.

**Three independent future monetization modes, all OFF:**
1. Merchant SaaS subscription or location fee.
2. Optional ~€0.99 consumer access/purchase (billing rules differ by app store; do not pretend Android paid-download conversion is a simple toggle).
3. Too Good To Go-style PAID, discounted reservable bags in selected countries, reusing the same listing, checkout-ready order/reservation and QR/review flow. This future mode will require actual payment/settlement, refunds, taxes, billing and legal compliance later, NOT now.
All free offers have 0 € and no checkout now. No payment SDK, processor, receipts or pricing screens in Stage One.

**Two orthogonal access channels:**
- **Avoin / PUBLIC:** default, everyone sees the offer; active now.
- **Kohdennettu / TARGETED:** future merchant-donated goods only visible to privately approved eligible users, with **"Kohdennettu"** tag on eligible users' offer cards. Approved partners (church diaconal work, food aid NGOs and wellbeing services county social work) may later issue scoped, expiring codes or account grants; avoid demanding income documents or displaying poverty status.
- The TARGETED channel is **disabled AND hidden globally by default**. Stage One includes no targeted tab, badge, code entry, grants, notifications, listings or donation screen. Server-side eligibility authorization will be critical later, not a client-only filter.
- Qualified recipients in the future can see ordinary public and their targeted offers inside one app.

**Donation campaigns in the same app later:** shops may give away **meals, Christmas food bags or Christmas gifts** through Free To Go itself, using the common merchant offer → notification → reserve → QR collection flow. Don't just link to outside charities. Campaign and "Tarvitsen apua" UX are disabled/hidden at launch. Funding from external donors through the app would be a separate, future legally reviewed payment/fundraising capability.

**Five-minute priority:** optional early access for selected eligible recipients to a limited reserved quota. **This is a DIFFERENT feature from the TARGETED channel**. It is explicitly disabled/hidden by default everywhere (including internal backend behavior). No five-minute priority UI in mockup. Future explicit approval and safeguards required.

For future-ready shape, note abstract fields such as vertical, distributionMode, pricingMode, accessChannel, optional campaignId, eligibilityPolicyId, feature flags, and order/entitlement seams in a short architecture note. DO NOT build payment, target/priority, partner onboarding or campaign screens yet. Do not add more than necessary to the prototype.

# 5. Propose a distinctive original brand

Avoid confusion with Too Good To Go's recognizable teal/dark-green brand. Produce **THREE candidate palettes** (primary, secondary, accent, background, typography HEX values), three quick app-icon concepts, and recommend one. Modern, fresh, cheerful, optimistic, premium-quality, clean and readable, with generous whitespace and compelling food photos; not charity-software styling.

The previous green/white concept is only provisional. Choose a more distinct signature color if stronger. Use accessible contrast and at least 44px tap targets. Build shared design tokens (type scale, spacing, radii, button and card dimensions, icon rules).

Use Finnish UI strings in this prototype for the approved exact wording, but set up translation-ready text labels for later multiple countries. Choose sensible example towns/shops and label any example availability as mock data.

# 6. STAGE ONE — Build a lightweight, clickable, polished HTML mockup now

This is the **ONLY** implementation authorized in this first assignment.

- HTML + CSS + minimal vanilla JavaScript; ideally prototype/index.html with small supporting files if needed.
- Must run locally by opening HTML directly, with **no npm build, login, backend, Supabase, API keys, server, payment or external deployment**. If a browser limitation affects a feature, simulate it clearly.
- Design for narrow mobile screen (~390px) and responsive 360–430px first; test visually for common Android and iPhone widths.
- High visual polish: not a wireframe, not abstract boxes; consistent card/navigation/dialog layouts and believable permitted/placeholder food photography.
- Use a small shared component/DOM-rendering layer + CSS tokens + single in-memory mock dataset; avoid dozens of duplicate standalone HTML pages. The later production mobile UI will be **React Native/Expo/TypeScript**, so document how components and state translate cleanly. HTML itself need not be pasted into native WebView.
- Favor **six highly polished primary views** first: (1) Discover & offer list/map/filter, (2) store/offer details & ratings, (3) reserve → confirmation/pickup, (4) favorites & push settings, (5) merchant publish/manage, (6) walk-in availability/status/report. Include supporting flows as panels, overlays or lightweight subviews instead of 20 overengineered pages.
- Role switch, heart, bell, city/radius filter, map/list switch (map can be a clearly labeled static simulated map), reserve, QR pickup demo, four rating inputs, walk-in report, example quality rating, merchant listing publish/repeat/edit/end/confirm and unavailable/expired states should all be clickable and visibly respond.
- If you cannot provide real photos legally, use clearly labeled licensed/placeholder food images. Never lift competitor screenshots as app art.
- Do NOT make inert buttons pretending to function. Any disabled action must have explanatory visible text.

**Scenarios to demonstrate:**
1. No food initially -> select city, favorite a store, turn on a bell/radius alert -> simulated "new free bags" push -> tap -> reserve -> pickup -> rate.
2. Merchant adds 5 reservable bags with multiple category checkboxes, start/end and optional description -> customer reserves; sold-out and merchant-caused cancellation states.
3. Merchant posts a walk-in batch of bananas with current photo and start/end -> customer sees "Ei varausta – saatavuus epävarma." -> reports "Paljon jäljellä" / "Vähän jäljellä" / "Kaikki loppu" and optionally food quality -> merchant marks All gone -> listing closes.
4. Overlapping notification subscriptions produce just one simulated alert; demonstration of access to different shop/city/radius settings.
5. Normal empty, success and failure states: no GPS, expired offer, reported issue and reservation unavailable.

**No real stock, backend, identity verification or push messages in this HTML prototype.** The demo must mark mocked behaviors appropriately and never present simulated listings as live food availability.

# 7. Deliverables and STRICT STOP/APPROVAL GATE

Before claiming completion:
- Present short verified Too Good To Go screenshot audit with source links and actual verified versions.
- Show three brand color palette proposals and your recommended palette; use the recommended palette PROVISIONALLY in mockup.
- Give navigation map and screen inventory, plus reference-vs-original design choices.
- Create the working HTML/CSS/JS prototype in a dedicated design branch (e.g., design/html-mockup), if you have GitHub write access. Do not merge to main without permission.
- Give direct path and link to mockup files, plus precise local viewing instructions. Include a few representative screenshots if possible without paid services.
- Verify locally that main controls work and that mobile screens do not overflow.
- Produce a concise note mapping reusable HTML UI pieces to eventual native components.

**Then STOP. Ask the owner to review the actual mockup.** Do not implement React Native, backend, Supabase, push servers, payments, CI, deployment or app store builds before explicit approval. Do not merely propose the mockup and wait for permission to begin Stage One; begin building it now.

# 8. STAGE TWO — reference for the future ONLY, NOT authorized now

After owner approves design, convert it into **real reusable React Native + Expo + TypeScript native components**, never an HTML WebView. Use Expo Router, a typed mock service layer and shared tokens. Stable common concepts: StoreCard, OfferCard, OfferDetail, DistributionMode, AvailabilityBadge, RatingFactors, FavoriteHeart, ShopBell, PickupWindow, ReservableCTA, PickupQR, WalkInReport, MerchantPublishForm and NotificationPreferences.

A clean abstraction for vertical, price/free, distribution mode, public/targeted and campaign extension prevents future rewrites. The current launch UI remains food-only, public-only, free-only. Real backend, payment and hidden modules require later separate explicit permission.

# 9. Strict cost constraints

**ZERO additional spending** beyond the user's existing Claude, ChatGPT and Cursor subscriptions. No paid API usage, paid screenshot libraries, third-party subscriptions, GitHub Actions unless indispensable, or cloud builds/deployments without permission. Prefer locally runnable mockup, local tests and batched GitHub changes. Avoid any unnecessary additional infrastructure.

# 10. Start immediately

1. Read the repository documents and confirm which were accessible.
2. Inspect the Too Good To Go screenshot sources, distinguish observed vs inferred facts.
3. Recommend three distinctive palettes and a provisional winner.
4. Create and test the **Stage One clickable HTML prototype**, preserving all approved decisions and keeping future modules disabled/hidden.
5. Save deliverables in GitHub on a design branch if possible, provide viewing instructions, then STOP for owner approval.
