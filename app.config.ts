import type { ConfigContext, ExpoConfig } from "expo/config";

// APP_VARIANT is set per EAS build profile (eas.json) so dev/UAT/production builds
// install side by side with distinct ids, names and deep-link schemes.
type Variant = "development" | "uat" | "production";

const variant = (process.env.APP_VARIANT ?? "development") as Variant;
const isProduction = variant === "production";
const idSuffix = isProduction ? "" : `.${variant}`;
const nameSuffix = isProduction ? "" : variant === "uat" ? " (UAT)" : " (Dev)";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: `CASTADI${nameSuffix}`,
  slug: "castadi",
  scheme: isProduction ? "castadi" : `castadi-${variant}`,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: false,
    bundleIdentifier: `com.castadi.app${idSuffix}`,
  },
  android: {
    package: `com.castadi.app${idSuffix}`,
    adaptiveIcon: {
      backgroundColor: "#FFFCF3",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    "expo-router",
    ["expo-secure-store", { configureAndroidBackup: true }],
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        imageWidth: 160,
        backgroundColor: "#FFFCF3",
        dark: { image: "./assets/splash-icon-dark.png", backgroundColor: "#111111" },
      },
    ],
    "expo-status-bar",
    "@react-native-community/datetimepicker",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    variant,
  },
});
