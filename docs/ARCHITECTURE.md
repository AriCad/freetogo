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
