import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "./Text";

export type Tone = "default" | "primary" | "success" | "warning" | "danger";

export function useToneColor(tone: Tone) {
  const { colors } = useTheme();
  return {
    default: colors.mutedForeground,
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  }[tone];
}

export function StatTile({ label, value, hint, tone = "default" }: { label: string; value: string; hint?: string; tone?: Tone }) {
  const { colors } = useTheme();
  const accent = useToneColor(tone);

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}${hint ? `, ${hint}` : ""}`}
      style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border, borderTopColor: accent }]}
    >
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
      <Text variant="heading" weight="bold" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint ? (
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing(3) },
  tile: {
    flexBasis: "46%",
    flexGrow: 1,
    borderWidth: 1,
    borderTopWidth: 3,
    borderRadius: radii.lg,
    padding: spacing(3),
    gap: spacing(1),
  },
});
