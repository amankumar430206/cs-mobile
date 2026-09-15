import { Pressable, StyleSheet, View } from "react-native";
import { spacing } from "@castadi/shared/tokens";
import type { Notification } from "@castadi/shared/types";
import { formatRelativeTime } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "@/ui";

export function NotificationRow({ notification, onPress }: { notification: Notification; onPress: () => void }) {
  const { colors } = useTheme();
  const unread = notification.status !== "READ";
  const urgent = notification.priority === "CRITICAL" || notification.priority === "HIGH";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: unread }}
      accessibilityHint={unread ? "Marks this notification as read" : undefined}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.muted }]}
    >
      <View style={[styles.dot, { backgroundColor: unread ? (urgent ? colors.danger : colors.primary) : "transparent" }]} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            variant="label"
            weight={unread ? "semibold" : "normal"}
            tone={notification.priority === "CRITICAL" ? "danger" : "default"}
            numberOfLines={1}
            style={styles.title}
          >
            {notification.title}
          </Text>
          <Text variant="caption" tone="muted">
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>
        <Text variant="caption" tone="muted" numberOfLines={3}>
          {notification.message}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing(3), paddingVertical: spacing(3), paddingHorizontal: spacing(5) },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  body: { flex: 1, gap: spacing(1) },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  title: { flex: 1 },
});
