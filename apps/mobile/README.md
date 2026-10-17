# Free To Go — mobile app (Stage Two)

React Native + Expo SDK 57 + TypeScript + Expo Router. One app for iOS and Android with collector and merchant roles, built from the approved design (themes 6–10).

## Install on an Android phone (APK file)

1. On the phone, open **https://github.com/AriCad/freetogo/releases/tag/android-preview** and tap **FreeToGo.apk**
   (or download it on a computer and copy it to the phone).
2. Open the downloaded file. Android asks to allow installing apps from this source (browser / file manager) → allow → **Install**.
3. A newer build installs over the old one; your demo data stays.

The APK is built by GitHub Actions (`.github/workflows/android-apk.yml`) on every push to `app/stage-two`, free for this public repository; no Expo account or secrets are needed. It is a test build signed with the standard debug key, not a Play Store build. iPhones cannot install files like this — use Expo Go below (or TestFlight later, which needs an Apple Developer account).

## Run it with Expo Go (iPhone or Android, free)

1. Install **Expo Go** from the App Store or Google Play.
2. On your computer (Node 22+):
   ```bash
   git clone https://github.com/AriCad/freetogo.git
   cd freetogo && git checkout app/stage-two
   npm install
   cd apps/mobile && npx expo start
   ```
3. Scan the QR code shown in the terminal with the phone camera (iOS) or Expo Go (Android). Phone and computer must be on the same Wi-Fi; otherwise use `npx expo start --tunnel`.

No Expo account, cloud build or paid service is needed. `npx expo start --web` opens it in a browser too (the camera, system notifications and GPS work best on a phone).

## What's real and what's still demo

| Real on the phone | Demo / not connected yet |
|---|---|
| Every screen and flow, Finnish + English, themes 6–10 (saved) | Shops and offers are fictional demo data stored on the device |
| Rules: one active reservation, stock never oversold, walk-in report signals, alert matching + dedup + quiet hours, 60 min / +30 min walk-in window | No backend: other users exist only through **Profiili → Demotila** |
| Camera-only photo for walk-ins (expo-image-picker) | Alerts are **local** notifications on this device (no push server yet) |
| Real scannable QR pickup codes; merchant scanner (expo-camera) + manual entry | Map is a labelled simulation (map provider not chosen) |
| One-off foreground location → nearest city (no background tracking) | Demo shops are in Tampere; other cities show the real empty state |
| Notification permission flow, reminders 30 min before pickup | No login / merchant verification yet |

**Try it on one phone:** Profiili → Demotila lets you make a shop publish (to receive an alert), have others reserve, report "Kaikki loppu" as another collector, simulate the shop scanning your code, and see the event log. Switch to the merchant role (Lähikauppa Pihlaja) from Profiili or the ⇄ button on Löydä.

## Structure (mirrors AriCad/texttranslator)

```
packages/core   pure TS domain: types, rules, actions, demo seed (+ vitest)   ← move to the backend later
packages/ui     theme tokens 6–10, ThemeProvider, Txt/Button/Pill/Check/... (+ contrast test)
apps/mobile     Expo Router screens, settings (AsyncStorage), on-device store, services
```

Future-ready fields (`vertical`, `pricingMode`, `accessChannel`, `campaignId`, `eligibilityPolicyId`) exist in `Offer`; `isLaunchVisible()` only lets food / free / public offers through, and all future flags in `packages/core/src/config.ts` are off.

## Checks

```bash
npm run qa                                   # typecheck all packages, unit tests, locale parity
npx expo export --platform web --output-dir /tmp/ftg-web && python3 e2e/web_smoke.py /tmp/ftg-web   # 12-step end-to-end (Playwright)
```

## Next steps that need your approval (not done)

Backend (e.g. Supabase) with server-side stock transactions and RLS, real push delivery, merchant verification and login, map provider, store builds (EAS) and app-store listings. Each has costs or legal review attached, so none was started.
