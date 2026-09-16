import { useEffect, useEffectEvent } from "react";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { useInvalidateNotifications, useMarkNotificationReadMutation } from "@castadi/shared/hooks";
import type { UserRole } from "@castadi/shared/types";
import { registerForPushNotifications } from "@/platform/push";
import { notificationRoute } from "./notificationRoute";

interface PushData {
  notificationId?: string;
  link?: string | null;
}

/**
 * Signed-in push wiring, mounted once inside the role-gated app layout:
 * registers this phone, refreshes the inbox/badge when a push lands while the app is open, and opens the related
 * screen when a push is tapped — including the tap that cold-started the app.
 */
export function usePushNotifications(role: UserRole) {
  const invalidateNotifications = useInvalidateNotifications();
  const { mutate: markRead } = useMarkNotificationReadMutation();

  useEffect(() => {
    void registerForPushNotifications();
  }, []);

  // Effect events always see the latest role/mutations, so the listeners below subscribe exactly once.
  const onReceived = useEffectEvent(() => invalidateNotifications());
  const openFrom = useEffectEvent((response: Notifications.NotificationResponse) => {
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const data = response.notification.request.content.data as PushData;
    if (data.notificationId) markRead(data.notificationId);
    router.push(notificationRoute(data.link, role));
  });

  useEffect(() => {
    // The tap that launched the app arrives before any listener exists, so handle it once and clear it.
    const launchResponse = Notifications.getLastNotificationResponse();
    if (launchResponse) {
      Notifications.clearLastNotificationResponse();
      openFrom(launchResponse);
    }

    const received = Notifications.addNotificationReceivedListener(() => onReceived());
    const tapped = Notifications.addNotificationResponseReceivedListener((response) => {
      Notifications.clearLastNotificationResponse();
      openFrom(response);
    });
    return () => {
      received.remove();
      tapped.remove();
    };
  }, []);
}

/** Render-nothing mount point, so a layout can enable push after its role checks. */
export function PushNotifications({ role }: { role: UserRole }) {
  usePushNotifications(role);
  return null;
}
