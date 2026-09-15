@AGENTS.md

# cs-mobile

CASTADI native app for Advertisers and Screen Partners (admin stays on the web). Expo SDK 57,
expo-router (routes in `src/app`), React Native New Architecture, TypeScript strict.

- Data access goes through `@castadi/shared` (API client, session, react-query hooks, zod schemas,
  tokens) — never call `fetch` directly or re-implement a hook that exists there. It is installed
  from `../cs-shared` via `file:`; after changing cs-shared run `yarn shared:refresh`.
- Do not modify cs-web for mobile work. cs-api routes are reused as-is; add backend routes only when required.
- Route files in `src/app` stay thin; screens/logic live in `src/features`, primitives in `src/ui`,
  native adapters (SecureStore, toasts, NetInfo, OTP) in `src/platform`.
- Tokens only in expo-secure-store. Every new dependency needs a size/need justification.
- Checks: `yarn typecheck`, `npx expo lint`.
