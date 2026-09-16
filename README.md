# cs-mobile

CASTADI's native app for **Advertisers** and **Screen Partners** (administrators use the web dashboard).
Built with Expo SDK 57, React Native 0.86 and expo-router, on top of the existing cs-api — no separate backend.

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20 or newer | |
| Yarn | 1.22 (Classic) | `corepack enable` — don't use npm in these repos |
| cs-api | running locally | see `../cs-api/README.md` (`docker compose up -d && yarn migrate && yarn dev`) |
| cs-shared | checked out next to this repo | `../cs-shared` — shared API client, hooks, schemas |
| A phone with **Expo Go**, or an Android emulator / iOS simulator | Expo Go must support SDK 57 | otherwise use a development build (below) |

Expected folder layout:
```
castadi/
  cs-api/
  cs-shared/
  cs-mobile/   ← this repo
```

## Setup

```bash
# 1. Build the shared package once (cs-mobile installs it from ../cs-shared)
cd ../cs-shared
yarn install
yarn build

# 2. Install app dependencies
cd ../cs-mobile
yarn install

# 3. Point the app at your API
cp .env.example .env.local
```

Edit `.env.local`:

| Where the app runs | `EXPO_PUBLIC_API_URL` |
|---|---|
| Physical phone (same Wi-Fi as your PC) | `http://<your PC's LAN IP>:4000/api/v1` — find the IP with `ipconfig` (Windows) or `ipconfig getifaddr en0` (macOS) |
| Android emulator | `http://10.0.2.2:4000/api/v1` |
| iOS simulator | `http://localhost:4000/api/v1` |

Restart the dev server after changing `.env.local` (`EXPO_PUBLIC_*` values are inlined at bundle time).

## Run on your phone (Expo Go)

1. Install **Expo Go** from the Play Store / App Store.
2. Connect the phone to the **same Wi-Fi** as your PC.
3. Start cs-api, then:
   ```bash
   yarn start --go
   ```
   `--go` is needed because `expo-dev-client` is installed; without it the QR code targets a development build.
4. Scan the QR code — Android: from Expo Go; iOS: with the Camera app.

If the phone can't reach the PC, allow Node.js through Windows Defender Firewall for **private networks**
(ports 8081 for Metro and 4000 for cs-api), or run `yarn start --go --tunnel`.

## Development build (instead of Expo Go)

Use this if your Expo Go doesn't support SDK 57, or once native modules outside Expo Go are added.

```bash
npx eas-cli login
npx eas-cli build --profile development --platform android   # installable APK
yarn start                                                  # then open the dev build and scan
```
Local alternative (needs Android Studio / Xcode): `npx expo run:android` or `npx expo run:ios`.

## Dev test data

Development builds (`__DEV__`) show dashed helper buttons — release builds strip them and their values:
- **Login:** "Demo advertiser" / "Demo partner" fill the KYC-approved accounts from cs-api's seed
  (`adv.approved@demo.castadi.test`, `partner.approved@demo.castadi.test`, password `Passw0rd!`). Run `yarn seed`
  in cs-api first.
- **Register:** "Fill test data" fills the current role's form (same values as cs-web) with a fresh email and mobile
  number each time, so repeat registrations don't collide.

## Brand assets

App icon, Android adaptive icon layers, light/dark splash and the auth-screen wordmarks are generated from the
master artwork in `../resources/logo`:
```bash
pip install Pillow
python scripts/generate-brand-assets.py ..
```
Rebuild the native app (or restart Expo Go) to see icon/splash changes.

## Build variants

`APP_VARIANT` (set per profile in `eas.json`) controls the app name, bundle id and deep-link scheme so all three can
be installed side by side:

| Profile | Name | Bundle id / package | EAS channel |
|---|---|---|---|
| `development` | CASTADI (Dev) | `com.castadi.app.development` | development |
| `uat` | CASTADI (UAT) | `com.castadi.app.uat` | uat |
| `production` | CASTADI | `com.castadi.app` | production |

For EAS builds, set `EXPO_PUBLIC_API_URL` in the EAS environment for each profile.

## Scripts

| Command | What it does |
|---|---|
| `yarn start` | Metro dev server (add `--go` for Expo Go, `--clear` to reset the cache) |
| `yarn start:prod` | Metro against the production API in release JS mode (no dev tools or test fill); pass `--go`/`--tunnel` through, override the URL with `PROD_API_URL` |
| `yarn android` / `yarn ios` | Start and open on an emulator / simulator |
| `yarn typecheck` | `tsc --noEmit` |
| `npx expo lint` | ESLint (eslint-config-expo) |
| `yarn doctor` | expo-doctor project health checks |
| `yarn shared:refresh` | Rebuild `../cs-shared` and reinstall it here — run after changing cs-shared |

## Dependencies

Every runtime dependency is here for a specific reason — keep it that way; justify new ones in the PR.

| Package | Why |
|---|---|
| `expo`, `react`, `react-native` | Runtime |
| `expo-router`, `react-native-screens`, `react-native-safe-area-context`, `expo-linking` | File-based native navigation and deep links |
| `@castadi/shared` (`file:../cs-shared`) | API client, session, react-query hooks, zod schemas, design tokens shared with cs-web's contracts |
| `@tanstack/react-query` | Server state/caching (same as cs-web) |
| `react-hook-form`, `@hookform/resolvers`, `zod` | Forms validated with the shared schemas |
| `expo-secure-store` | Tokens in Keychain / Android Keystore |
| `@react-native-community/netinfo` | Pause queries while offline |
| `@react-native-community/datetimepicker` | Native date picker |
| `expo-constants`, `expo-application` | App config and version (sent as `X-App-Version`) |
| `expo-splash-screen`, `expo-status-bar` | Splash until the session loads; status bar theming |
| `expo-notifications` | Push notifications (tokens, foreground banners, tap handling) |
| `expo-device` | Skips push registration on simulators/emulators |
| `@expo-google-fonts/poppins` | cs-web's font (four weights as native assets) |
| `expo-dev-client` | Development builds (not included in release builds) |

Dev only: `typescript`, `eslint` (pinned to 9 — eslint-plugin-react breaks on 10), `eslint-config-expo`,
`expo-atlas` (bundle size analysis: `EXPO_ATLAS=true npx expo export --platform android`).

## Project structure

```
src/
  app/            expo-router routes only — thin files that render feature screens
    (auth)/       login, register, verify-otp, forgot-password
    (app)/        role gate → advertiser/ and partner/ stacks
  features/       screens and feature logic (auth, home, …)
  ui/             design primitives (Text, Button, form fields, Screen, toasts)
  platform/       native adapters: API client setup, SecureStore, toasts, NetInfo, OTP provider
  theme/          light/dark theme from shared tokens
  config/env.ts   EXPO_PUBLIC_* configuration
metro.config.js   strips zod's unused locale bundle (~245 KB)
scripts/dedupe-shared.js   postinstall: removes cs-shared's nested node_modules so React loads once
```

## Push notifications & app config

- **Push** runs through Expo's push service, so cs-api needs no Firebase/APNs keys. The app registers its token after
  sign-in (`POST /notifications/push-tokens`) and removes it on sign-out; tapping a push opens the matching screen.
- **Push needs a development or release build on a real phone.** Expo Go on Android can't receive remote pushes, and
  simulators never can — the app quietly skips registration there.
- **One-time setup:** run `eas init` to link the project (or set `EAS_PROJECT_ID`); without a project id the app skips
  push registration. Android also needs FCM credentials uploaded with `eas credentials`, and iOS an APNs key — EAS
  prompts for both on the first build.
- **App config:** on launch the app reads cs-api's public `GET /settings/app-config`. Maintenance mode or a version
  below `minSupportedVersion` blocks the app; a newer `latestVersion` shows an update prompt. Admins change these with
  `PUT /settings/app-config`. If the check fails, the app runs normally.

## Known limitations

- **OTP verification and password reset** need a native MSG91 configuration that doesn't exist yet; those screens
  send users to the web app. With cs-api's `auth.otpBypass` feature flag on, registration logs straight in.
- Sentry, automated tests and CI are not set up yet.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Red screen: `EXPO_PUBLIC_API_URL is not set` | Create `.env.local` (see Setup) and restart with `yarn start --clear` |
| "Network error" on login from a phone | Phone and PC on the same Wi-Fi, LAN IP (not `localhost`) in `.env.local`, firewall allows port 4000, cs-api running |
| `Invalid hook call` / duplicate React | Run `yarn install` again (the postinstall dedupe step must run) |
| Changes in cs-shared not showing | `yarn shared:refresh`, then `yarn start --clear` |
| Expo Go says the project's SDK isn't supported | Update Expo Go, or use a development build |
