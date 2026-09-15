import { StyleSheet, View } from "react-native";
import { spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "./Text";

/** Heartbeat-based "is the player reachable right now" indicator. */
export function LiveIndicator({ live, liveLabel = "Live", offlineLabel = "Offline" }: { live: boolean; liveLabel?: string; offlineLabel?: string }) {
  const { colors } = useTheme();
  const color = live ? colors.success : colors.mutedForeground;

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" weight="semibold" style={{ color }}>
        {live ? liveLabel : offlineLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing(1.5) },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
