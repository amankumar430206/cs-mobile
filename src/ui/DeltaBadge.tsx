import { StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "./Icon";
import { Text } from "./Text";

/** Period-over-period change, e.g. last 7 days vs the previous 7. */
export function DeltaBadge({ percent }: { percent: number }) {
  const { colors } = useTheme();
  const up = percent >= 0;
  const color = percent === 0 ? colors.mutedForeground : up ? colors.success : colors.danger;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}2E` }]}>
      <Icon name={up ? "trendUp" : "trendDown"} size={12} color={color} />
      <Text variant="caption" weight="semibold" style={[styles.text, { color }]}>
        {up ? "+" : ""}
        {percent}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: radii.full,
    paddingHorizontal: spacing(2),
    paddingVertical: 2,
  },
  text: { fontVariant: ["tabular-nums"] },
});
