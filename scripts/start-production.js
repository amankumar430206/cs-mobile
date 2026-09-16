// Runs Metro against the production API in release JS mode (no __DEV__, minified), so the app on a
// phone behaves like a production build without an EAS build. Extra args pass through to
// `expo start`, e.g. `yarn start:prod --go` or `yarn start:prod --tunnel`.
//
// Values set here win over .env.local (Expo never overrides variables already in the environment).
// Override the URL for a one-off run with PROD_API_URL=https://... yarn start:prod
const { spawn } = require("child_process");

const env = {
  ...process.env,
  APP_VARIANT: "production",
  EXPO_PUBLIC_API_URL: process.env.PROD_API_URL ?? "https://api.castadi.com/api/v1",
};

console.log(`start-production: API ${env.EXPO_PUBLIC_API_URL} — real accounts and data, demo logins won't work.`);

// Run Expo's CLI with this Node directly — no shell, so it behaves the same on Windows and macOS.
const expoCli = require.resolve("expo/bin/cli");
const child = spawn(process.execPath, [expoCli, "start", "--no-dev", "--minify", "--clear", ...process.argv.slice(2)], {
  env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
