# Free To Go — Claude design handoff (design before code)

## Objective
Design an exceptionally simple mobile application inspired by the *usability and workflow* of Too Good To Go, not a pixel-for-pixel replica or use of its protected branding/assets. The collector should find/reserve an offer in under a minute; merchant should repeat and publish a prior offer in under 20 seconds (targets to validate).

## Visual direction — proposed, awaiting user sign-off
- Cheerful, light, professional, modern; does NOT look like charity software.
- Primarily white (#FFFFFF), fresh emerald green (#167C59), light green (#E9F6EE), warm amber (#F6B84A); high-contrast neutral text.
- Large authentic food images, readable compact cards, generous breathing room, large thumb-accessible buttons, modern rounded corners.
- Iconography consistent (outline style). Small bottom tab navigation.
- Avoid clutter, tiny touch targets, overly many messages, gratuitous animations, dark-heavy UI, and dozens of merchant inputs.
- Food-only branding at launch. Nothing hints at other verticals yet.
- Distinguish RESERVED and WALK_IN unmistakably. NEVER represent a walk-in as guaranteed.

## Prepare pixel-precise mobile designs for the following screens
1. Collector Discover: empty state, active listing, map/list toggle, filtering.
2. Offer card and details: store name, location, photo, 0 €, pickup start/end, potential-content checkboxes communicated as tags, rating, reserve CTA.
3. Reservation confirmation, QR pickup, collector cancellation and report "did not receive my bag."
4. Favorites / favorite-store heart vs independent notification bell; merchant page trust and historical ratings.
5. Alert settings: favorites, individual stores, distance from saved location, whole selected city/village, permission explanation, quiet hours; demo push deep-link.
6. Merchant Publish: two modes, reserved count, multiselect categories, optional photo + text, pickup START/END, reuse previous offer.
7. Walk-in Publish: MANDATORY fresh actual photo, categories/description, START/END, one-tap All gone, auto-expiry/extend.
8. Walk-in listing + three huge report choices: MANY / LOW / NONE, optional independent quality star; publish age, latest user signal and “Ei varausta – saatavuus epävarma.”
9. Ratings: four independent food factors and separate pickup reliability, tied to actual fulfilled orders.
10. Profile, role switch, lightweight merchant pickup scanner, safety-report and empty/error states.

## Interaction details to explicitly mock
- Location denied/no GPS and an alternative manual city/area picker.
- Reserve competition / already sold out, cancellation, expired offer.
- Notification follows → opens offer → stock verification → reserve or sold-out.
- Walk-in all gone: one unverified user report vs merchant closes listing; no false stock promises.
- A merchant publishing 5 bags quickly, then a walk-in crate requiring a current camera photo.
- Review quantity/quality/time and anti-fraud, with no forced quality score on a walk-in availability report.
- Language variation/long translations, screen reader contrast/tap sizes.

## Deliverables from Claude before backend
- Interactive screen prototype using dummy data, reusable components and theme tokens.
- Device-size frames for iPhone and common Android widths, light mode first.
- Clickable path for collector and merchant, error and empty states.
- Component design system: buttons, badges, cards, filters, dialogs, camera, QR, stars, notifications.
- Annotated navigation map and point-by-point differences from Too Good To Go.
- No backend, paid services, payment SDK, CI workflows or production deploy until UI approval.

## Non-negotiable product contracts
Read PRODUCT_SPEC.md and ARCHITECTURE.md first. All app prices are 0 € at launch. Both current modes appear. Food only visible. Both collector and merchant use ONE app. Push is an MVP feature. Ratings/reports as agreed. Future commercialization hidden and OFF.

## Immediate next steps
1. User confirms visual styling (suggested fresh white/green) and key screens.
2. Share these documents with Claude as the authoritative source.
3. Inspect its proposed screen navigation + visual artifacts, revise until accepted.
4. Only then authorize functional implementation.


## Future paid offers (design-system readiness only)
Build the common listing, merchant publishing and booking components without baking "free forever" into internal component types. Current public screens must ALL display 0 € and must NOT show a checkout. Keep a future optional paid price display, crossed-out comparison only when justified, optional checkout path, paid order/receipt/refund states, and merchant financial views as unimplemented variants in the navigation specification. Do not spend time designing payment screens until user authorizes paid-market expansion. Preserve existing four food review criteria and merchant trust measures for both future paid and current free pickups.


## Future donation and assistance product extension — NOT part of current mockup
Read [COMMUNITY_SUPPORT.md](COMMUNITY_SUPPORT.md) and the updated [CLAUDE_MASTER_PROMPT.md](CLAUDE_MASTER_PROMPT.md). Future participating shops can distribute **donated meals and Christmas food bags inside Free To Go** using existing offer/reservation/notification/QR capabilities, perhaps with discreet partner-verified assistance eligibility. The optional five-minute early access is OFF and HIDDEN by default, in backend and UI. The help request and donation campaign tools are similarly OFF/hidden in the current launch design. **Do not display, simulate or design active help/priority/donation screens in the Stage One HTML mockup without new approval**. Only leave typed/domain extension points for later, without confusing current collectors.
