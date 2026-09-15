import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { useMarkNotificationReadMutation, useNotificationsQuery } from "@castadi/shared/hooks";
import { Card, Section, Text } from "@/ui";
import { NotificationRow } from "./NotificationRow";

export function RecentNotifications() {
  const { data, isPending } = useNotificationsQuery(1);
  const markRead = useMarkNotificationReadMutation();
  const recent = (data?.rows ?? []).slice(0, 3);

  return (
    <Section
      title="Notifications"
      action={recent.length > 0 ? { label: "View all", onPress: () => router.push("/notifications") } : undefined}
    >
      {isPending ? (
        <Text tone="muted">Loading notifications…</Text>
      ) : recent.length === 0 ? (
        <Card>
          <Text variant="label">You&apos;re all caught up</Text>
          <Text variant="caption" tone="muted">
            New notifications will show up here.
          </Text>
        </Card>
      ) : (
        <Card style={styles.card}>
          {recent.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onPress={() => {
                if (notification.status !== "READ") markRead.mutate(notification.id);
              }}
            />
          ))}
        </Card>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, gap: 0, overflow: "hidden" },
});
