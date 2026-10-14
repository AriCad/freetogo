# Community Support & In-App Merchant Donations
Status: **FUTURE-READY ONLY; OFF/HIDDEN IN LAUNCH UI AND INITIAL CLAUDE HTML MOCKUP.**

## Product decision (October 2026)
Free To Go must eventually let participating stores donate actual meals, Christmas food bags and similar essentials **to recipients through the Free To Go app itself**. Not merely an external link to a charity. The store creates an offer/campaign, qualified people discover it or receive opted-in alerts, reserve in this same app, collect at the store and confirm pickup using our existing reservation/QR functionality. In-kind food donations are free to recipients.

The optional **five-minute priority window** is deliberately **disabled and invisible by default, globally**. It must not appear as a setting, timer, banner, merchant publishing option, or collector privilege at launch. It requires separate explicit authorization, eligibility safeguards and country/partner policy before activation.

## Future campaign workflow
1. Store selects an approved donation campaign type (for example, meal or Christmas food bag), location and pickup window; publishes available count and contents (with appropriate safety/allergen details). No pricing or checkout for shop-given goods.
2. Recipient's eligible audience is set using a privacy-preserving campaign/partner policy; self-declaration alone must not automatically grant preferential access to scarce offers.
3. Free To Go sends targeted, deduplicated opt-in notifications and displays eligible campaigns in the same app.
4. Eligible collector reserves without paying and receives confirmation/QR pickup code.
5. Store scans/verifies pickup and stock decreases atomically; cancellations, no-shows and incident flows reuse standard free booking engine.
6. Campaign outcomes/aggregate impact are available to merchant/authorized admins, without disclosing sensitive personal circumstances.

## Future assistance and optional verified eligibility
- A respectful private 'Tarvitsen apua' request can be introduced in a future approved phase; not public and OFF at launch.
- Do not require showing income, pension benefits, family hardship, minors' names, or household information to stores or other collectors.
- If an authorized local support organization verifies eligibility, store only a minimal scope-limited, expiring entitlement and provenance; organization may issue a secure one-time voucher/code.
- Allow applicable users to receive free platform access even if an optional consumer access fee is introduced in the distant future.
- Explicit consent/legal basis, data minimization, access controls, auditing, appeal and deletion are prerequisites.

## Optional future five-minute early access
- Feature flag `priority_early_access_enabled=false` in ALL markets and environments; UI is hidden AND backend enforces OFF.
- If explicitly enabled in a future pilot, only a merchant-authorized subset/quota of selected reservable offers is eligible, not every bag or no-reservation walk-in.
- Qualified collectors can be notified and reserve allocated priority stock five minutes before public release; remaining allocated stock is automatically released to everyone at the end.
- Public offer inventory and general alerts must not accidentally reveal or exhaust early stock; timed allocation and server-side checks must avoid race conditions.
- Evaluate effects on fairness, no-shows, merchant participation and collector outcomes before broadening.

## Other future donations and payments
- Merchants giving goods free (in-kind) require NO customer payment transaction.
- If third parties later **fund** meals or gifts via our app, treat that as a distinct in-app sponsorship/payment flow with legal review: fundraising permit and payment rules, tax/VAT, refunds, receipts, fraud, donor privacy, money custody and merchant payout. It is **not** part of launch scope.
- Holiday gifts to children must protect family/child privacy; partners can handle suitability and eligibility privately.

## Architecture (extension seams only at launch)
- Shared `campaigns` (type, market, rules, time frame, status), offers reference optional campaign ID.
- Shared offer/reservation, stock, pickup, merchant location, category and push systems handle campaign offers without duplicating the engine.
- Future `eligibility_entitlements` include collector, scope, expiry, verification reference; do not create sensitive personal profiles.
- Future priority policies include approved reserved quota and five-minute window; default OFF at server.
- `community_campaigns_enabled=false`, `assistance_request_enabled=false`, `priority_early_access_enabled=false` and `priority_early_access_minutes=5` (inactive).
- Market-specific admin authorization for activation; safety review and partner readiness gates.

## Claude UI guidance
During first HTML mockup and the launch React Native UI: **DO NOT show** campaign menus, a donation screen, 'Tarvitsen apua', an eligibility selector, priority labels or a five-minute advance alert. Use clean generic offer/reservation components, extensible types and design tokens so we can build these features later with low refactoring cost. No implementation of donation/payment flows now.


## New approved extension: two visibility/access channels (not enabled at launch)
**Avoin channel (PUBLIC)** — the standard open food-waste marketplace. Everyone can see public offers and use the usual zero-euro reserve/pickup or walk-in flows. This is the only channel visible and functional in the initial app.

**Kohdennettu channel (TARGETED)** — future opt-in module for goods reserved for approved recipients. Once country, partner and merchant operations are explicitly ready and enabled, users with an active scope-matching grant can discover targeted listings **within the same Free To Go app**, clearly tagged **"Kohdennettu"**. Users without the relevant grant must not see the offers, badge or references anywhere, including maps/search, alerts, links and API results. Qualified users still see the ordinary public channel as well.

### Partners and eligibility grant
- Trusted local partners: congregation/church diaconal services, food aid organizations, wellbeing services county social work, and other vetted equivalents.
- Partners already know the individuals they assist, and may grant a minimal, scoped and expiring entitlement via **single-use activation code or verified profile marker**. Free To Go does not require a burdensome income-proof upload.
- Partner onboarding, authorization, code issuance, expiry, revocation and fraud safeguards are prerequisites before activation.
- A user must never be publicly marked "poor"; `Kohdennettu` labels an **offer**, not a person. A merchant can verify pickup eligibility through the system but does not see income, social benefits, case notes, family situation or which partner assessed need unless essential and lawfully disclosed.
- Use explicit purpose limitation, minimal data, retention and local GDPR review before activation. Treat grant info as private, securely permissioned data.

### Targeted goods flow
- A vetted store/approved program creates a targeted in-kind donation (e.g., Christmas food bag, ready meal), selects authorized eligibility scope, count, pickup START/END and location.
- Authorized collector sees a "Kohdennettu" listing, receives push notifications **only if opted in** and eligible, and reserves in-app with the existing 0€ atomic reservation and QR pickup flow.
- Initial targeted mode supports reserved quantities only, not open-access walk-in stock, so authorized recipient eligibility can be enforced and food is reliably held.
- Do not build a parallel donation app, forms or reservation engine. Targeting and campaign assignment are properties of the same generic offer.
- Back-office partner management and grant issuance can be built later; do not show it in the MVP.
- A future paid sponsorship/donation transaction is separate from free goods in-kind and remains OFF.

### Independence from five-minute priority
A TARGETED listing stays visible **only** to approved users while it is active. This is not a timed 5-minute early preview before the general public. The optional quota-based **five-minute priority** mechanism is entirely separate and remains `priority_early_access_enabled=false`, HIDDEN in all markets and mockups. A targeted listing does not automatically convert to public after five minutes.

### Feature gates and default behavior
```text
public_channel_enabled = true
targeted_channel_enabled = false
community_campaigns_enabled = false
assistance_request_enabled = false
priority_early_access_enabled = false
```
Market-specific toggles are server-enforced, with audited activation only after explicit owner approval, partner onboarding, privacy/legal review and end-to-end testing. Initial HTML mockup and first mobile UI display **NO targeted tab, tags, example targeted offers, activation-code screen or notifications**. However, data models and list/detail/reservation components should be compatible with `access_channel` and `eligibility_policy_id`.

### Future test requirements
- Ineligible visitor cannot see targeted information by list, map, category filters, deep link or API.
- Properly eligible collector sees both public and matching targeted offers tagged "Kohdennettu".
- Ineligible visitor cannot redeem a targeted offer even knowing its ID.
- Partner-issued single-use code cannot be enumerated/reused; expiry and revocation work.
- Notifications do not leak targeted item or recipient's eligibility to others.
- With target flag OFF everywhere, merchant cannot publish targeted offers and no targeted view is shown.
