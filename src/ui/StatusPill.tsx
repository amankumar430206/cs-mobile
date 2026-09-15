import { StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { useToneColor, type Tone } from "./StatTile";
import { Text } from "./Text";

export function StatusPill({ label, tone = "default" }: { label: string; tone?: Tone }) {
  const { colors } = useTheme();
  const color = useToneColor(tone);
  // 8-digit hex: the tone color at ~13% opacity as the pill background.
  const background = tone === "default" ? colors.muted : `${color}22`;

  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      <Text variant="caption" weight="semibold" style={{ color }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: "flex-start", borderRadius: radii.full, paddingHorizontal: spacing(2), paddingVertical: 2 },
});
