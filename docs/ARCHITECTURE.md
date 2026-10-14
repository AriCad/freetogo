# Free To Go — implementation architecture and future-proofing

## Design principle
**One generic giveaway engine; food is a launch-time configured vertical, not hard-coded product behavior.** Avoid multi-vertical screens until another vertical is actually enabled. Keep scope and costs controlled.

## Technology (proposed, pending implementation review)
- React Native + Expo, shared iOS/Android codebase, React Navigation / Expo Router.
- Supabase Auth, PostgreSQL with row-level security, Storage for merchant images; use a lowest-cost plan consistent with limits.
- Expo Notifications with a server-triggered queue and rate limiting, provider tokens/receipts and retry behavior. Native development builds for device testing, never promise guaranteed instant delivery.
- Maps provider chosen based on licensing, real free-tier feasibility and privacy; do not assume unlimited free map usage.
- Local tests and bundled commits; GitHub Actions off unless unavoidable. Avoid frequent cloud builds/deployments and paid API usage.

## Generic data model (logical proposal)
- `verticals`: key, translations, status (hidden/active), country availability, configs/forms/rating schema; launch FOOD only.
- `categories`: vertical id, category keys, localized labels and multiselect support.
- `users`, `merchant_accounts`, `merchant_members`, `locations`, `merchant_verticals` (multi-location and multi-vertical).
- `offers`: merchant location id, vertical id, mode (RESERVED / WALK_IN), start_at, end_at (time zoned), description, status, category snapshot, photo policy/snapshots, publish timestamp.
- `offer_media`: media file, photo_kind (current/example), capture/upload evidence as appropriate.
- `inventory`: offer id, initial/remaining capacity for RESERVED only (no artificial count for WALK_IN).
- `reservations`: offer id, collector id, status and timestamps, unique pickup token, cancellation attribution/reason.
- `pickup_events`: verified collection, merchant confirmation, audit records.
- `review_categories` per vertical; `reviews`, `review_scores` linked to verified pickups.
- `walk_in_reports`: offer id, user, availability (MANY/LOW/NONE), timestamp, optional quality, trust/abuse metadata.
- `favorites`, `merchant_follows`, `notification_preferences` including store/area/city/vertical targeting, `device_push_tokens`, `notification_jobs`, `notification_delivery_log`.
- `safety_reports`, `merchant_incidents`, `merchant_reliability_snapshots`.
- `plans`, `billing_entitlements`, `billing_policies`: free at launch; future optional merchant subscription or consumer one-time entitlement; flags default OFF. Payment gateways are deliberately absent.

## Rules / security
- Enforce role and merchant membership in RLS and server functions. Never trust client-selected merchant/location IDs or price/entitlement values.
- Offer creation/updates must validate category/vertical status, media policies, legal pickup bounds, remaining capacity and location approval.
- Atomic reservation function/transaction with idempotency key and stock check; cancellation returns stock only when legally/operationally valid.
- Prevent double redemption/replay of pickup code and duplicate ratings.
- WALK_IN reports must not alter inventory; only merchant closes or time expiry closes immediately. Community reports prompt/flag, not a single-user destructive action.
- No paid capabilities in UI while flags are disabled. Architecture must also be compatible with later country-level compliance.
- Server-side scheduling for pickup windows/expiry, safe retries, idempotent notification enqueueing and scoped alert matching.
- Protect precise personal location; compute area matches from user-authorized saved place/location preference instead of passive continuous background tracking.
- Retention, deletion, logging and moderation/privacy design before launch.

## Feature flags / configuration
```text
enabled_verticals = ["food"]
merchant_billing_enabled = false
consumer_access_fee_enabled = false
advertising_enabled = false
walk_in_mode_enabled = true
push_alerts_enabled = true
```
Only authenticated privileged administrators can modify flags. A vertical becomes public only when complete forms, ratings, policy texts and assets exist; do not expose inactive navigation.

## Commercialization constraints
- Launch pricing is ZERO for all participants. No hidden fees or payment SDK.
- Future merchant fees could be per merchant, location or vertical; support grandfathered shops.
- Future consumer €0.99 option: choose policy-compliant implementation later; store-level paid download is not reliably reversible on Google Play. Do not falsely suggest that a toggle can change App Store price; app stores have separate price consoles and policies.
- Future billing requires separate legal terms, tax handling, platform in-app purchase review and end-to-end testing; not within current MVP.

## Multi-vertical adaptation later
Food: use-by/best-before, allergens, varied surprise bags, four food rating factors.
Furniture: condition, dimensions, vehicle requirement and different rating criteria.
Construction materials: quantity units, pickup equipment, safety/compliance.
Use schemas/config + validation hooks instead of copying whole screens and services. Domains like regulated items and safety require independent market/legal checks.

## Release workflow
1. Commit docs/spec first.
2. Claude creates screen prototypes using shared design tokens and fake fixtures; no backend hookup yet.
3. Review mobile screenshot flows, accessibility and wording.
4. Implement data model and robust logic.
5. Test on devices, especially native camera and push.
6. Pilot with genuine merchant inventory; use only included tool allowances and minimal cloud builds.


## Paid marketplace extension (MUST support in shared engine; NOT implemented now)
See [PAID_MARKETPLACE_READINESS.md](PAID_MARKETPLACE_READINESS.md). Separate these independent revenues: (1) customer pays for a discounted surplus bag; (2) merchant pays platform subscription; (3) optional consumer access fee. The first is NOT currently active.
- Do not hard-code offer price or value as zero in generic engine/database. `offer_pricing`: offer_id, price_minor (integer, 0 at launch), currency ISO-4217, pricing_mode FREE/PAID, merchant_receivable and fee policy references added later. Validate that only admins can enable paid markets.
- `market_configs`: country/region, enabled verticals, paid_offer_enabled false, settlement/tax/legal locales and feature gates. All countries FREE by default; no surprise worldwide switches.
- `orders` separate from `reservations` or a stable `order` abstraction supporting FREE_CONFIRMED and future PENDING_PAYMENT/PAID/REFUNDED without breaking current records.
- Future logical records, no operational payment integration now: `payment_intents`, `payment_events`, `refunds`, `merchant_payout_accounts`, `settlement_ledger`, `platform_fees`, `tax_snapshots`. Freeze pricing and legal terms per transaction at purchase time.
- For paid orders, put bounded inventory holds and idempotent server-side finalize/release around payment; avoid overselling and both charging without stock and confirming without payment. Reconcile provider webhooks and expired holds.
- Prepare separate price-display/reservation UI components and an optional checkout route. It must be hidden/disabled while paid_offer_enabled=false and must never block FREE offers.
- Actual financial services and payouts require compliance architecture, supported payment processor, merchant onboarding/KYC, reconciliation, VAT/payment/refund rules, privacy/security and App Store/Google Play policies. Physical-goods transactions generally have different app-store rules than paid digital access.


## Future community support extension, off by default
Authoritative requirements: [COMMUNITY_SUPPORT.md](COMMUNITY_SUPPORT.md).
Design non-disruptive future extension seams: campaign_id on generic offers, campaign definitions (meal/Christmas food bag, market, partner, eligible audience, schedule), minimal expiry-based verified assistance entitlements, merchant-funded in-kind 0€ inventory, and existing atomic reservation/QR pickup/review/notification services. Avoid separate charity app or rewriting core offer services. Never expose collectors' finances, children's identities, or support status publicly or unnecessarily to merchants. Future monetary sponsors require a separate, compliant payment/fundraising flow.
Server-authoritative flags, all default FALSE in every market/environment: `community_campaigns_enabled=false`, `assistance_request_enabled=false`, `priority_early_access_enabled=false`. `priority_early_access_minutes=5` is merely an inactive future config; turning on requires explicit approval. Future priority stock allocation must avoid stock races and release unused reserved quota to all after the time window. The initial UI and mockup must hide ALL these features.
