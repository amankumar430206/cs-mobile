import { StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { toneToColor, type Tone } from "../StatTile";
import { Text } from "../Text";

export interface StackedSegment {
  key: string;
  label: string;
  value: number;
  tone: Tone;
}

export function StackedBar({ segments, emptyLabel }: { segments: StackedSegment[]; emptyLabel: string }) {
  const { colors } = useTheme();
  const visible = segments.filter((segment) => segment.value > 0);
  const total = visible.reduce((sum, segment) => sum + segment.value, 0);

  if (total === 0) {
    return (
      <Text variant="caption" tone="muted">
        {emptyLabel}
      </Text>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={visible.map((segment) => `${segment.label}: ${segment.value}`).join(", ")}
        style={[styles.bar, { backgroundColor: colors.muted }]}
      >
        {visible.map((segment) => (
          <View key={segment.key} style={{ flex: segment.value, backgroundColor: toneToColor(colors, segment.tone) }} />
        ))}
      </View>
      <View style={styles.legend}>
        {visible.map((segment) => (
          <View key={segment.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: toneToColor(colors, segment.tone) }]} />
            <Text variant="caption" tone="muted">
              {segment.label}
            </Text>
            <Text variant="caption" weight="semibold">
              {segment.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing(3) },
  bar: { flexDirection: "row", height: 10, borderRadius: radii.full, overflow: "hidden", gap: 2 },
  legend: { flexDirection: "row", flexWrap: "wrap", columnGap: spacing(4), rowGap: spacing(2) },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing(1.5) },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
