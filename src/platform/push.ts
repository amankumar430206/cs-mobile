import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { registerPushToken, unregisterPushToken } from "@castadi/shared/hooks";
import { env } from "@/config/env";
import { brand } from "@castadi/shared/tokens";

// Remembered so sign-out can unregister exactly this phone's token before the session is cleared.
const PUSH_TOKEN_KEY = "castadi.pushToken";
const ANDROID_CHANNEL = "default"; // cs-api sends every push on this channel id.

export type PushRegistration =
  | { status: "registered"; token: string }
  | { status: "denied" | "unsupported" | "not-configured" | "failed" };

/** Show pushes that arrive while the app is open as a banner too, instead of dropping them silently. */
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
    name: "Notifications",
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: brand.primary,
  });
}

function easProjectId(): string | undefined {
  return (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ?? Constants.easConfig?.projectId;
}

/**
 * Asks for permission (only if the user hasn't answered yet), fetches this install's Expo push token and registers
 * it with cs-api. Safe to call on every launch: tokens can rotate, and the API upserts.
 */
export async function registerForPushNotifications(): Promise<PushRegistration> {
  // Simulators/emulators can't receive remote pushes.
  if (!Device.isDevice) return { status: "unsupported" };

  const projectId = easProjectId();
  // Expo push tokens are issued per EAS project; until `eas init` links one, there's nothing to register.
  if (!projectId) return { status: "not-configured" };

  try {
    await ensureAndroidChannel();

    let { status } = await Notifications.getPermissionsAsync();
    if (status === "undetermined") status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== "granted") return { status: "denied" };

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await registerPushToken({ token, platform: Platform.OS === "ios" ? "ios" : "android", appVersion: env.appVersion });
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
    return { status: "registered", token };
  } catch (error) {
    // Expo Go on Android has no remote push support; a flaky network just means we try again next launch.
    if (__DEV__) console.warn("Push registration skipped:", error);
    return { status: "failed" };
  }
}

/** Stop pushes to this phone for the signed-out account. Never blocks sign-out on failure. */
export async function unregisterPushNotifications() {
  const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY).catch(() => null);
  if (!token) return;
  await unregisterPushToken(token).catch(() => undefined);
  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY).catch(() => undefined);
}

/** The OS-level permission, for the settings screen ("turn on in Settings" when denied). */
export async function getPushPermissionStatus() {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  return { status, canAskAgain };
}
