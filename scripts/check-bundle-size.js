// Fails when the production Android JS bundle (Hermes bytecode) grows past the budget, so size regressions show up in
// CI instead of in the store listing. Run `yarn bundle:check`; inspect what grew with
// `EXPO_ATLAS=true npx expo export --platform android` + `npx expo-atlas`.
//
// Budget history: 3 MB (original plan) was never reachable — expo-router ships ~1 MB of Material Symbols font on its
// own. 3.91 MB after M4, 4.02 MB after M5 (expo-notifications). Raise it deliberately, in its own commit, with a reason.
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Decimal megabytes, matching how `expo export` prints bundle sizes.
const MB = 1000 * 1000;
const BUDGET_BYTES = 4.25 * MB;

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "castadi-bundle-"));
const expoCli = require.resolve("expo/bin/cli");
const result = spawnSync(process.execPath, [expoCli, "export", "--platform", "android", "--output-dir", outDir], {
  stdio: "inherit",
  env: {
    ...process.env,
    APP_VARIANT: "production",
    // The URL only has to exist for the build; it's never called.
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.invalid/api/v1",
  },
});
if (result.status !== 0) process.exit(result.status ?? 1);

const bundleDir = path.join(outDir, "_expo", "static", "js", "android");
const bundle = fs.readdirSync(bundleDir).find((file) => file.endsWith(".hbc"));
if (!bundle) {
  console.error("check-bundle-size: no .hbc bundle found in", bundleDir);
  process.exit(1);
}

const size = fs.statSync(path.join(bundleDir, bundle)).size;
const mb = (bytes) => `${(bytes / MB).toFixed(2)} MB`;
fs.rmSync(outDir, { recursive: true, force: true });

if (size > BUDGET_BYTES) {
  console.error(`\ncheck-bundle-size: Android bundle is ${mb(size)}, over the ${mb(BUDGET_BYTES)} budget.`);
  process.exit(1);
}
console.log(`\ncheck-bundle-size: Android bundle is ${mb(size)} (budget ${mb(BUDGET_BYTES)}, ${mb(BUDGET_BYTES - size)} headroom).`);
