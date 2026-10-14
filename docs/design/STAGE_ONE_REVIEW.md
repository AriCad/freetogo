# Free To Go — Stage One design review

**Status:** awaiting owner approval. Nothing beyond the HTML mockup has been built.
**Branch:** `design/html-mockup` (not merged to `main`).
**Date:** 14 October 2026.

Contents: documents read · reference audit · brand proposal · navigation map and screen inventory · reference vs original choices · scenario coverage and testing · decisions to confirm.

---

## 1. Documents read

All six authoritative sources were accessible in the repository and read in full: `README.md`, `docs/PRODUCT_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_HANDOFF.md`, `docs/PAID_MARKETPLACE_READINESS.md`, `docs/COMMUNITY_SUPPORT.md`, plus `docs/CLAUDE_MASTER_PROMPT.md`.

## 2. Too Good To Go reference audit

### What I could and could not see

| Source (master prompt priority) | Result |
|---|---|
| 1. Google Play listing | **Not accessed.** The link came from a repo file, so the session needed your permission to fetch it; the request timed out unanswered. |
| 2. AppBrain | **Not accessed** (same reason). The master prompt's own note says v26.10.0, updated 2 Oct 2026, seven publisher screenshots. I could not verify this. |
| 3. Apple App Store (US) | **Not accessed** (same reason). The Danish App Store page was reachable via search: **current version 26.10.0, released 6 Oct** (2026 per page footer). Its screenshot slots came back as blank placeholders in text extraction, so I saw no screenshots. |
| 4. Swipefile | **Not accessed** (permission). |
| 5. Uiland | **Not accessed** (permission). |
| 6. ScreensDesign `?vs=100280` | **Not accessed** (permission). The ScreensDesign *showcase* page for the app was readable as text; its seven screenshot images failed to load through the fetch tool. |

**Bottom line: I did not see any Too Good To Go screenshot images in this session.** Everything below comes from text descriptions. No paid tools were used. To let me look at real screenshots, paste the source links (or the images themselves) into the chat and approve the fetch; I'll update this audit.

### Text sources actually read

- Too Good To Go official page *How does the app work* (toogoodtogo.com/en-ie) — current marketing description, undated.
- ScreensDesign showcase (text) — timestamped walkthrough notes, app version not stated.
- IXD@Pratt design critique, iOS — 2 Feb 2023 (historical).
- IXD@Pratt design critique, Android — 12 Sep 2023 (historical).

### Observed patterns (text-verified) vs inferred

| Area | Verified from text | Status |
|---|---|---|
| Home / Discover | Personalised feed with sections: available today/tomorrow, newly added, segment filters (official page). Location bar and search at top (Pratt iOS 2023). | Verified, current + historical |
| Map / list | Map of chosen area; list ↔ map toggle (Pratt Android 2023); numbered store clusters that update with distance filter (ScreensDesign). | Verified |
| Search radius | Radius control 1–30 km on a map-based location screen (Pratt iOS 2023). | Historical |
| Filters / sort | Filters for food type, diet, collection time; sort by distance, price, rating, relevance. Filter icon judged hard to find (Pratt 2023). | Verified |
| Cards | Store, pickup times, rating with review count, meal image; "Surprise Bag" label repeated. | Verified; exact layout **inferred** |
| Store / bag detail | Ratings, pickup times, description of what you might get, ingredients/allergen sections. | Verified |
| Favourites | Heart; favourites section on main screen; alerts when favourites have bags. | Verified |
| Reserve | Reserve → in-app payment pop-up; payment error explains supported cards. | Verified (paid flow — not relevant now) |
| Pickup | Countdown bar before collection opens; "tap to collect" then **swipe to confirm** by the customer. | Historical (2023) |
| Cancellation | Orders within ~2 h of pickup can't be cancelled; critics wanted this shown earlier. | Historical |
| Profile | Money saved, CO2e avoided; orders; settings. | Verified |
| Reviews | Star rating + count on listings; separate rating screen not described. Unfinished reviews can't be resumed (2023). | Partly verified |
| Bottom tabs | 2023 Android: Discover / Browse / Me. Current tab set **not verified**. | Historical only |

### Adopt / simplify / remove / add

- **Adopt:** card-based browsing with big food image, store name, pickup window and rating; list ↔ map toggle; location chip with radius; filter sheet; heart favourites; detail page with a single sticky primary action; pickup code screen.
- **Simplify:** no price, discount or "worth" lines (everything is 0 €); fewer feed sections (now / later today / fully reserved); filter button labelled and badged so it isn't missed.
- **Remove:** payment, wallet, checkout, impact money-saved counters, social sharing pop-ups, promotional posters.
- **Add (Free To Go-specific):** walk-in mode with the unmistakable hatched "Ei varausta – saatavuus epävarma." treatment and one-tap availability reports; a **bell** separate from the heart; area/city/radius alerts with visible deduplication; merchant-confirms pickup (QR scan) instead of customer self-swipe; four-factor ratings with a separate reliability measure; "I didn't get my bag" flow; first-class empty state that sells alerts.

## 3. Brand proposal

Full side-by-side comparison with live previews: **`prototype/brand.html`**.

| | Primary | Ink (text) | Accent | Background | Surface | Notes |
|---|---|---|---|---|---|---|
| **A · Puolukka (recommended)** | `#C21E56` lingonberry | `#241A3A` blueberry ink | `#FFB020` saffron | `#F6F4F8` | `#FFFFFF` | Food-associated, Finnish, cheerful, far from TGTG's teal/green. White on primary 5.8:1, ink on bg 15:1, ink on saffron 8.9:1. |
| B · Mustikka & lime | `#3B34C8` | `#15123A` | `#C8F25A` | `#F5F5FB` | `#FFFFFF` | Very distinctive; blue reads less appetising. 8.4:1. |
| C · Paprika & kaura | `#B83A13` | `#23395B` | `#F2C14E` | `#FFFAF3` | `#FFFFFF` | Warm; close to many delivery brands' orange. Lighter `#D9481C` fails AA for white text (4.3:1). |

**Why not the provisional green:** `#167C59` (DESIGN_HANDOFF) sits close to Too Good To Go's recognisable dark green/teal. All three proposals avoid a green primary. **This replaces a provisional decision and needs your sign-off.**

**Typography:** Bricolage Grotesque (display, 700/800) + Figtree (UI, 400–700). Both SIL OFL, bundled locally (no Google Fonts requests, no cost).

**Signature element:** distribution mode is carried by colour *and* pattern *and* text: reserved = solid lingonberry tag; walk-in = diagonal saffron hatch with the exact label. The hatch is the one bold element; the rest of the UI stays white and quiet.

**App icon concepts:** (1) bag whose handle loops into a "go" arrow — recommended; (2) plate forming a "0"; (3) bag inside a map pin. Shown on `brand.html`.

**Tokens:** `prototype/css/tokens.css` — type scale 12/14/16/18/22/28/34, 4-pt spacing, radii 8/14/20/28/pill, tap targets ≥ 48 px (button 52 px), outline icons 24 px / 2 px stroke with filled variants only for active heart/bell.

## 4. Navigation map and screen inventory

```
ONE APP ─ role switch (header pill, Profile → Roles) ─────────────────────────────

COLLECTOR tabs:  Löydä | Suosikit | Noudot | Profiili
  Löydä (Discover)
   ├─ location chip ─▶ [sheet] Location: use GPS ─▶ [OS dialog] allow/deny ─▶ city list + radius
   ├─ search, filter ─▶ [sheet] Filters: food groups (multi), time, sort, show fully reserved
   ├─ mode chips: Kaikki / Varattavat / Ei varausta
   ├─ List ⇄ Map (simulated map, pins: count = bags left, "?" = walk-in)
   ├─ empty states: choose location · no food now (alerts CTA, widen radius, participating shops with ♥/🔔)
   └─ Offer card ─▶ Offer detail
        ├─ RESERVED: contents + caveat, ratings, reliability ─▶ [sheet] Confirm ─▶ [sheet] Checking
        │     ├─ success ─▶ Reserved ─▶ Noudot (QR)
        │     ├─ race lost / sold out ─▶ [sheet] Someone got there first (+ bell)
        │     └─ ended ─▶ [sheet] No longer available
        ├─ WALK_IN: hatched label, published age, status callouts, 3 report buttons,
        │     report history (unverified / shop-confirmed / stale), optional quality stars
        ├─ shop page ─▶ Store page (♥ card, 🔔 card, today's offers, ratings)
        └─ [sheet] Food safety report
  Suosikit (Favourites) ─ alert-settings card ─▶ Alerts settings ─▶ Manage bells
  Noudot (Pickups) ─ active ticket: QR, cancel ─▶ [sheet], "En saanut ruokakassiani" ─▶ [sheet] reasons
                   ─ history ─▶ Rate (4 factors)
  Profiili ─ roles, alerts, location, language (fi/en), privacy, help

MERCHANT tabs:  Julkaise | Hallinta | Kauppa
  Julkaise (Publish) ─ repeat last (reserved / walk-in) ─▶ Form (pre-filled, check banner, 20 s target)
                     ─ new: Reservable bags ─▶ Form (count, multi-select, time, optional photo/text)
                     ─ new: Walk-in ─▶ Form (camera-only photo, what, time, expiry note) ─▶ [camera]
                     ─▶ Published (seconds taken, auto-notify note)
  Hallinta (Manage) ─ active / ended ─▶ Offer manage
        ├─ RESERVED: progress, reservations, Scan ─▶ [sheet], Edit ─▶ [sheet], Stop new, Cancel ─▶ [sheet]
        └─ WALK_IN: review prompt, big "Kaikki loppu", expiry + Extend ─▶ [sheet], reports
  Kauppa (Store) ─ verified details, read-only public ratings + reliability, view as collector

SYSTEM overlays: simulated push banner (tap = deep link + availability recheck), OS permission dialogs, toasts
```

**Six primary views (as requested):** Discover list/map/filter · Offer & store detail with ratings · Reserve → confirmation → QR pickup · Favourites & alert settings · Merchant publish/manage · Walk-in status/report. Everything else is a sheet, dialog or sub-view.

## 5. Reference vs original choices

| Pattern | Too Good To Go (per text sources) | Free To Go |
|---|---|---|
| Price line | Price + crossed-out value | Only "0 €" stamp; no payment anywhere |
| Collection | Customer swipes to collect | Shop scans the collector's QR (merchant verification) |
| Mode | Reserved bags only | Two modes, visually distinct by colour, pattern and copy |
| Favourite | Heart triggers alerts | Heart = save; bell = alerts — separate controls |
| Area alerts | Not described | Radius from saved place, whole cities, quiet hours; one alert per offer |
| Ratings | Overall stars + count | Four factors from verified pickups + separate reliability % |
| Empty feed | Not described | Primary conversion surface: alerts, wider radius, follow participating shops |
| Visual brand | Dark teal/green, illustrated mascots | Lingonberry/blueberry/saffron, hatch pattern, own icon, no mascots |

No Too Good To Go logos, illustrations, copy or screenshots are used. Food pictures are original SVG illustrations, labelled in the demo as stand-ins.

## 6. Scenario coverage and testing

All five master-prompt scenarios are one-click setups in the demo panel with live step checklists; each step ticks itself off when you do it.

1. No food → city → favourite → bell + permission → simulated push → deep link → reserve → scan → four ratings.
2. Merchant publishes 5 bags with several food-group checkboxes → collector reserves → others reserve the rest (fully reserved) → merchant cancels with reason → collector gets cancellation alert and callout.
3. Merchant publishes bananas walk-in (camera-only photo, start/end) → collector sees the exact label → reports + optional quality → one unverified "Kaikki loppu" = *possibly gone*; two independent = *under review* (never auto-closed) → merchant "Kaikki loppu" closes it.
4. Favourite + bell + 5 km radius + Tampere city all match → event log shows "4 matches → 1 alert". Sushi Kumo (6.8 km) → city-only match. Jyväskylä shop → no alert until you add the city. Quiet hours hold alerts.
5. Location denied → manual city · old alert opens an ended offer · "I didn't get my bag" · reservation race lost · possibly-gone walk-in · blocked notifications with fix.

**Automated check (local Playwright, no cloud):** a script walked all five scenarios plus extras — 0 JavaScript errors, 0 failed steps, no horizontal overflow at 360/390/430 px, in Finnish and English, and in a 390×844 phone viewport. Screenshots: `docs/design/screenshots/`.

**Future features hidden:** the UI renders only offers with `vertical=food`, `pricingMode=FREE`, `priceMinor=0`, `accessChannel=PUBLIC` and no `campaignId`. No paid, targeted, campaign, assistance, priority or non-food element exists in any screen — not even as a disabled control.

## 7. Decisions for you to confirm or change

1. **Brand:** palette A replaces the provisional green. Icon concept 1.
2. **Merchant tab names:** spec says *Publish, Pickups, Store profile*; master prompt says *publish, manage listings/pickups, shop profile*. I used **Julkaise / Hallinta / Kauppa**, because listings and pickups live together per offer. Rename to "Noudot" if you prefer.
3. **Walk-in report rules (proposals, easy to change):** one live report per collector (updating replaces it); reports older than 45 min marked stale; 2 independent "Kaikki loppu" within 30 min → "Tarkistettavana" + merchant prompt; merchant "Ruokaa on vielä" resets the signal.
4. **Walk-in quality stars** can be given right away but are labelled as counting only after pickup verification.
5. **Expiry:** 60 min max, +30 min extension that requires ticking "food remains" — pilot proposals as specified.
6. **One active reservation per collector** shown as a disabled button with the reason.
7. **Cancellations by shop** warn the merchant that they affect reliability; the demo does not yet change the reliability figure.
8. **Language:** Finnish primary with exact approved wording; English included to prove translation readiness and long-string layouts.
