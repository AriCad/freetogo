# Free To Go — paid surplus marketplace readiness

**Status: future option; implementation OFF at launch.** The free food marketplace design remains the approved MVP.

## Purpose
We may later compete in select countries with paid, discounted surplus bags, using the same mobile clients and core application engine. **Target feature parity in the relevant core marketplace workflows, not an assertion of identical functionality, screens or proprietary code.**

## Independent business/payment modes
1. Free bag reservation: customer pays 0, confirmed reservation, QR collection.
2. Free walk-in: no reservation, no price, current photo, first-come-first-served.
3. Future paid discounted reserved offer: customer pays the shop/platform at checkout, then confirms and collects.
4. Future merchant platform subscription: merchant pays for service access, irrespective of whether their bags are free or paid.
5. Future collector app/access fee: possible €0.99 policy-compliant in-app access charge; independent of bag payment.

## Country activation
Market configuration uses explicit market/country IDs, currencies and flags. Default all OFF: `paid_offers_enabled`, `merchant_subscriptions_enabled`, `consumer_access_fee_enabled`. Every market maintains independent toggle with legal readiness checks. A market can display free and discounted paid offers together if deliberately activated, with unambiguous labels and filters. Not activated anywhere during MVP.

## Data/interface contract
- `Offer` supports `distribution_mode: reservation|walk_in`, `pricing_mode: free|paid`, `price_minor` integer, `currency` ISO 4217, and a display value only when legally substantiated. Payment is invalid for walk-in until separately designed.
- `Order` retains immutable snapshots of offer, price, currency, tax and terms, and separate fulfillment vs payment state. Existing free bookings must not require payment records.
- Multi-currency is per transaction, no implicit conversion.
- Reservation count/availability and pickup windows are reused for free and future paid.
- Merchant profile supports multiple locations, verticals, market eligibility and later verified payment account; none needed for pilot free offers.
- Payment providers integrated behind a service interface later, with server-side signature-verifying webhooks and idempotency.
- Financial event ledger, payment failures, chargebacks, refunds, payouts, commissions, tax lines, customer receipts and reconciliation will require detailed future implementation and testing. Data model extension seams and versioned migrations are prepared now, not fully deployed until needed.

## Future paid bag journey
1. User views paid food bag, price, availability, pickup window, merchant rating and justified approximate value.
2. User taps reserve and proceeds to transparent checkout.
3. Server creates short, expiring inventory hold and pending order.
4. Payment confirmation arrives authoritatively from processor webhook; order confirmed, reservation/pickup credentials activated.
5. Failed/expired payment releases hold. Duplicate requests do not double charge. Charge captured but stock lost triggers reconciliation and automatic/manual refund resolution.
6. At shop: scan code, fulfill order; rating and reliability remain equivalent to free pickups.
7. Refund/cancellation handling and merchant settlement/reconciliation must be complete before public release.

## Design requirements for Claude
- Design shared OfferCard, OfferDetail, Availability, PickupWindow, ReservationStatus and PickupConfirmation components.
- Prices and next steps are driven by pricing configuration and entitlement, not conditional duplication of whole screens.
- MVP prototype shows 0 € for all offers and no checkout screens; preserve an optional future route placeholder for checkout/receipt and appropriate screen states.
- Keep current Free To Go brand independent of Too Good To Go. Do not copy third-party assets or promise exact product parity.

## Regulatory and financial risk gates
- Country-specific food law and mandatory information.
- Country-specific consumer protections, pricing claims, VAT, invoicing, payment service rules, merchant-of-record, processor KYC, refunds.
- Review Apple/Google policies: payment for physical goods vs sale of digital app access are distinct; Google Play prohibits flipping a published free listing directly to paid download.
- Payout/reconciliation complexity means this is **not just a price-field flip**. Shared core reduces future rewrite but payment production launch will be a substantial project.

## Acceptance test for architecture now
- All existing free flows behave without touching payment paths.
- Offers have adaptable pricing types and country associations.
- Per-market flags default to disabled and are server-enforced.
- Future paid booking flow could be introduced without cloning merchant/location/offer/notification/review systems.
- No payment gateway, checkout SDK, finance operations or paid API usage introduced at MVP.


## Community Support is separate from future payments
See [COMMUNITY_SUPPORT.md](COMMUNITY_SUPPORT.md). A shop donating food/meal/Christmas food bag inside Free To Go is an **in-kind 0€ app offer**, not a paid purchase. If people later pay to sponsor meals/bags through this same app, payment processing, refunds, receipts and local fundraising regulation need their own future implementation and explicit launch decision. Merchant subscriptions, consumer €0.99 access, paid discounted food bags, shop-given meals, and donor-funded sponsorships are separate modes. All payment and campaign options remain OFF in the MVP.
