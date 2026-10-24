# Free To Go

> 🚨 **MUISTA KEHITYSTÄ JATKETTAESSA — UUSI SUUNNITELTU OMINAISUUS (24.10.2026):** Free To Go -sovellukseen halutaan myöhemmin **oma yksityishenkilöiden tavaralahjoitusten puoli**. Ihmiset voivat ilmoittaa **vaatteita, leluja ja kaikenlaisia muita tavaroita ilmaiseksi noudettavaksi**. Tämä on tärkeä tuleva tuotesuunta; **ei vielä toteuteta eikä muuteta ruoka-MVP:n julkaisulaajuutta**. Katso **[YKSITYISHENKILÖIDEN TAVARAT — TÄRKEÄ SUUNNITELMA](docs/PRIVATE_PERSON_GIVEAWAYS.md)** ennen arkkitehtuuri-, rooli- ja käyttöliittymäpäätöksiä.

**Status:** approved product specification; implementation has not started.
**Working name:** Free To Go (sometimes referred to as Free2Go). Branding and trademark clearance pending.
**Launch:** one mobile app for iOS and Android, free for everybody, **food only** in the UI. Underlying system supports future verticals.

## Source of truth
- [Product specification](docs/PRODUCT_SPEC.md) — agreed consumer/merchant behavior and edge cases.
- [Architecture and commercialization](docs/ARCHITECTURE.md) — shared multi-vertical model, security, notification and future payment readiness.
- [Design and Claude handoff](docs/DESIGN_HANDOFF.md) — visual direction, screens, workflow and acceptance criteria.

**Do not begin implementing before the mobile design is reviewed and approved.**

## Principles
1. Extremely minimalist, fast, cheerful, trustworthy, phone-first; benchmark Too Good To Go's workflow without copying branded assets or exact creative expression.
2. One app, two roles (collector and merchant); a person may have both.
3. All listings and pickups cost **0 €** at launch; no ads, paid tiers, checkout or payment processing.
4. Two distribution modes: reservable bags and no-reservation first-come-first-served giveaways.
5. Push alerting for followed stores, specific stores, radius around saved location(s), towns/cities — essential from MVP.
6. Food only visible at launch. Configuration-ready for furniture, plants, construction supplies etc. without creating empty UI.
7. Future paid merchant access and potential consumer €0.99 acquisition/access fee supported in entitlements/config, **disabled** at launch.
8. No extra ongoing paid subscriptions/API overages; minimize CI/build/deploy costs; local testing and batched changes.

## Before launch
Validate local food safety, allergen disclosure, operator classification, privacy, app store policy, store verification, and trademark/brand.


## Future paid surplus marketplace (architectural requirement)
The same codebase must support an optional Too Good To Go-style **paid discounted surplus offer** in selected countries. It is **not enabled or advertised at launch**. Build commerce-neutral offer/reservation domain objects from the outset; payments, refunds and merchant payouts are a future project. See [Paid marketplace readiness](docs/PAID_MARKETPLACE_READINESS.md).


## Future community support (OFF at launch)
Shops can later donate meals and Christmas food bags **inside Free To Go** through the same merchant-offer → collector-reservation → QR-pickup workflow, with privacy-preserving eligibility. A possible 5-minute head start is **disabled, invisible and backend-enforced OFF by default**. All assistance and campaign UIs are also OFF for the initial mockup. [Community support spec](docs/COMMUNITY_SUPPORT.md). Updated handoff: [Claude master prompt](docs/CLAUDE_MASTER_PROMPT.md).


## Future public and targeted channels (targeted OFF by default)
The giveaway engine has two future-ready **access channels**, independent of whether an offer is reservable and of whether it costs anything: **Avoin** (`public`, everybody eligible, active at launch) and **Kohdennettu** (`targeted`, only pre-approved collectors, disabled and invisible at launch). Approved social support partners (e.g. church diaconal services, food aid NGOs, wellbeing services county social work) can later issue expiring activation codes or minimal profile eligibility grants without Free To Go collecting detailed proof of income. Only approved collectors would see the **Kohdennettu** tag and eligible items. The optional five-minute early-access feature is distinct and still OFF. See [Community Support](docs/COMMUNITY_SUPPORT.md) and [Claude prompt](docs/CLAUDE_MASTER_PROMPT.md).
