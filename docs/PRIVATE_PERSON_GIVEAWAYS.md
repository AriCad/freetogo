# PRIORITY FUTURE FEATURE — Private-person giveaways (clothes, toys and general items)

> **IMPORTANT — READ WHEN DEVELOPMENT RESUMES (decision 2026-10-24).** The project owner explicitly wants a **private-individual side** in Free To Go where ordinary people can list **clothes, toys and all kinds of other everyday goods** for others to collect for free. This must not be forgotten in future product/design/architecture work. **This is a documented product direction, not permission to implement it now.**

## Product direction
- Keep the existing business/merchant food giveaway flow intact.
- Add a distinct **Yksityishenkilöt / Tavarat** experience alongside merchant food listings, rather than forcing private individuals to register as merchants.
- Private persons can give away used or surplus everyday goods for **0 €**: clothing, children's toys, books, household goods, small furniture, hobby equipment, and a broad **Other** category. Category taxonomy remains extensible and localized.
- Recipient discovers nearby free items, views condition/photos/approximate pickup area and requests/arranges pickup; straightforward minimalist publishing.
- Keep private-person offers clearly labeled separately from verified shop listings, and allow search/filter/favorites/notifications by category or side as appropriate.
- Reuse the shared multi-vertical listing engine, accounts, localized categories, media, discovery and notifications wherever practical; **do not duplicate the entire app**.

## Decisions still open (do not silently assume)
1. Launch timing: feature is **planned for future development**, not a change to the already approved food-only MVP; decide when to activate it.
2. Collection model: request/reservation vs first-come-first-served, ability to message or use privacy-preserving contact options, acceptance/cancellation rules.
3. Home-address protection: show only approximate area publicly; disclose exact handoff details only after explicit consent and with safety controls.
4. Moderation and forbidden items: prohibited/unsafe/illegal goods, reports, anti-spam, fraud, identity and age policies, child-safety rules, disputes.
5. Photos, item condition, quantity, pickup window and notifications: define lightweight item-appropriate UI instead of assuming food-bag semantics.
6. Decide whether donated private items stay strictly 0 € even if a paid merchant-surplus feature is introduced later.

## Architecture implications
- Model **publisher type** (verified business vs private individual) separately from **vertical** (food / goods), **distribution mode**, **pricing** and **access channel**; do not require merchant location IDs for personal listings.
- An ordinary account can be both a collector and a private giver (and separately a verified merchant if needed).
- Separate trust/moderation/ratings policies for private people from store food-safety and merchant-verification systems.
- Feature flags default OFF in every market until the product flow, safety, privacy and moderation are approved.
- Preserve multilingual/RTL support, low running costs and the simple single-app approach.

## Development handoff checklist
When returning to Free To Go work, **explicitly flag this feature in the roadmap** and check that architecture does not block it. Review this document before finalizing offers schema, role/permissions model, onboarding/navigation or UI mockups. Do not turn it on by accident during food MVP development.
