import { useCallback, useState } from "react";
import { Linking, StyleSheet, Switch, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import type { NotificationPreferences } from "@castadi/shared/types";
import { getPushPermissionStatus, registerForPushNotifications } from "@/platform/push";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, Screen, Skeleton, Text } from "@/ui";

type Channel = Exclude<keyof NotificationPreferences, "updatedAt">;

const CHANNELS: { key: Channel; title: string; description: string }[] = [
  { key: "pushEnabled", title: "Push notifications", description: "Alerts on this phone, even when the app is closed." },
  { key: "inAppEnabled", title: "In-app notifications", description: "Updates in your notifications inbox." },
  { key: "emailEnabled", title: "Email", description: "Important updates sent to your email address." },
  { key: "smsEnabled", title: "SMS", description: "Time-sensitive alerts by text message." },
  { key: "marketingEnabled", title: "Product news & offers", description: "Occasional announcements from CASTADI." },
];

export function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const preferences = useNotificationPreferencesQuery();
  const update = useUpdateNotificationPreferencesMutation();

  // The account preference can be on while the phone itself blocks notifications; re-checked on focus because
  // the user may come back from the system Settings app.
  const [osBlocked, setOsBlocked] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void getPushPermissionStatus()
        .then(({ status }) => active && setOsBlocked(status === "denied"))
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, [])
  );

  const setChannel = (channel: Channel, next: boolean) => {
    update.mutate({ [channel]: next });
    // Turning push on is the natural moment to (re)register this phone and ask for OS permission if never asked.
    if (channel === "pushEnabled" && next) {
      void registerForPushNotifications().then((result) => setOsBlocked(result.status === "denied"));
    }
  };

  return (
    <Screen edges={["bottom"]}>
      {preferences.isPending || !preferences.data ? (
        <Skeleton height={260} radius={radii.lg} />
      ) : (
        <Card style={styles.card}>
          {CHANNELS.map((channel, index) => {
            const value = preferences.data[channel.key];
            return (
              <View
                key={channel.key}
                style={[styles.row, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
              >
                <View style={styles.text}>
                  <Text variant="label" weight="semibold">
                    {channel.title}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {channel.description}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={(next) => setChannel(channel.key, next)}
                  disabled={update.isPending}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor="#ffffff"
                  accessibilityLabel={channel.title}
                />
              </View>
            );
          })}
        </Card>
      )}

      {osBlocked && preferences.data?.pushEnabled ? (
        <Card>
          <Text variant="label" weight="semibold">
            Notifications are turned off for CASTADI on this phone
          </Text>
          <Text variant="caption" tone="muted">
            Allow notifications in your phone&apos;s settings to receive push alerts.
          </Text>
          <Button title="Open settings" variant="outline" onPress={() => void Linking.openSettings()} />
        </Card>
      ) : null}

      <Text variant="caption" tone="muted">
        Security alerts, such as password changes, are always sent and can&apos;t be turned off.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, gap: 0, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing(3), padding: spacing(4) },
  text: { flex: 1, gap: 2 },
});
