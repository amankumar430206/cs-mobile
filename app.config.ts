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
        image: "./assets/splash-icon-dark.png",
        imageWidth: 160,
        // Dark brand stage in both modes, so the native splash hands off seamlessly to the in-app intro.
        backgroundColor: "#111111",
      },
    ],
    "expo-status-bar",
    // Push: tints the Android tray icon in brand orange and routes FCM messages to the channel cs-api sends on.
    ["expo-notifications", { color: "#FF8A00", defaultChannel: "default" }],
    "@react-native-community/datetimepicker",
    [
      "expo-image-picker",
      {
        photosPermission: "CASTADI uses your photos to upload verification documents and screen photos.",
        cameraPermission: "CASTADI uses your camera to photograph documents and your screens.",
        microphonePermission: "CASTADI uses your microphone when you record a screen installation video.",
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission: "CASTADI uses your location to pin where a screen is installed.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    variant,
    // Expo push tokens are issued per EAS project. Set by `eas init` (or EAS_PROJECT_ID) — until then the app skips
    // push registration instead of failing.
    ...(process.env.EAS_PROJECT_ID ? { eas: { projectId: process.env.EAS_PROJECT_ID } } : {}),
  },
});
