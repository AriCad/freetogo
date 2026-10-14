# Free To Go — selectable colour themes 6–10

One UI, one component set, one theme layer. Only colour tokens change between themes; layout, spacing, radii, type and components are shared.

## Files

| File | Role |
|---|---|
| `prototype/theme/themes.js` | The five themes as token objects, plus `load / save / apply` (persisted under `ftg.theme`). |
| `prototype/theme/check-contrast.mjs` | WCAG AA test for every theme (adapted from texttranslator `packages/ui/scripts/check-contrast.mjs`). |
| `prototype/css/tokens.css` | Theme 6 defaults; older palette names are aliases of theme roles, so every screen follows the active theme. |
| `prototype/v2/themes.html` | The same Discover screen in all five themes side by side. |

## Tokens

`primary` is the exact hex from the comparison board. The other values are derived from it and pass WCAG AA.

| Theme | primary | active / link | selected (text on it) | badgeText | icon / accent |
|---|---|---|---|---|---|
| 6 Violetti | `#7A6FF0` | `#6B5FEE` | `#6B5FEE` (white) | `#5E51ED` | `#7A6FF0` |
| 7 Korallit | `#E57C73` | `#D83A2C` | `#E57C73` (ink) | `#CA3226` | `#E26E64` |
| 8 Salvia | `#6FA37B` | `#517F5C` | `#6FA37B` (ink) | `#4B7555` | `#679E74` |
| 9 Hunaja | `#D8A23C` | `#976D1E` | `#D8A23C` (ink) | `#8D661C` | `#BB8825` |
| 10 Luumu | `#8B6B8F` | `#88688C` | `#8B6B8F` (white) | `#7B5F7F` | `#8B6B8F` |

Roles: `primary` brand hue · `primarySoft` tinted backgrounds and badges · `accent`/`icon` stars, heart, bell and icon highlights (≥3:1) · `active` CTA fill, active tab, bell-on (white text ≥4.5:1) · `link` · `selected`/`onSelected` selected segment and chip · `badge`/`badgeText` · `textPrimary`, `textSecondary`, `background`, `surface`, `border`. Success and danger colours stay fixed so status always reads the same.

**Accessibility adjustments.** On themes 7, 8 and 9 white text on the exact colour is below 4.5:1, so selected segments use dark ink text, and buttons and links use the deeper `active` shade. On theme 6 neither white nor ink reaches 4.5:1 on `#7A6FF0`, so its selected fill uses `active` (`#6B5FEE`).

## Behaviour

- **Setting:** Profile → Teema. A tap applies the theme immediately to the whole app, collector and merchant screens alike.
- **Persistence:** the choice is saved in `localStorage` (AsyncStorage in the native app) and reapplied in `<head>` before the first paint, so it survives a reload with no flash of the default colours.
- **Demo panel:** has the same five buttons for quick comparison.

## Stage Two (React Native) — reuse from AriCad/texttranslator

Reuse `packages/ui/src/theme`: the `Palette` interface (rename fields to the roles above), `Brand` → `ThemeOption`, `ThemeProvider`/`useTheme`, the shared `space`/`radius`/`touch`/`type` scales, the contrast script, and the AsyncStorage settings pattern from `apps/mobile/src/settings/Settings.tsx`. Also reuse i18n (`src/i18n`, `validate-locales.mjs`) and RTL handling. Do not copy OCR, translation, parking or warranty features.

## Tests

```bash
node prototype/theme/check-contrast.mjs                      # WCAG AA, 5 themes × 12 pairs
python3 prototype/tests/e2e_walkthrough.py                   # all scenarios + themes (needs Playwright)
python3 prototype/tests/e2e_walkthrough.py prototype/dist/freetogo-mockup.html
```
