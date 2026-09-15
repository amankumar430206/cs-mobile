import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { radii, spacing, type ResolvedTheme } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, type IconName } from "./Icon";
import { Skeleton } from "./Skeleton";
import { Text } from "./Text";

export type Tone = "default" | "primary" | "success" | "warning" | "danger";

export function toneToColor(colors: ResolvedTheme["colors"], tone: Tone) {
  return {
    default: colors.mutedForeground,
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  }[tone];
}

export function useToneColor(tone: Tone) {
  return toneToColor(useTheme().colors, tone);
}

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  icon?: IconName;
  loading?: boolean;
}

export function StatTile({ label, value, hint, tone = "default", icon, loading = false }: StatTileProps) {
  const { colors } = useTheme();
  const accent = toneToColor(colors, tone);

  return (
    <View
      accessible
      accessibilityLabel={loading ? `${label}: loading` : `${label}: ${value}${hint ? `, ${hint}` : ""}`}
      style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.top}>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: `${accent}1F` }]}>
            <Icon name={icon} size={16} color={accent} />
          </View>
        ) : null}
        <Text variant="caption" tone="muted" numberOfLines={1} style={styles.label}>
          {label}
        </Text>
      </View>
      {loading ? (
        <Skeleton height={26} width="60%" />
      ) : (
        <Text style={[styles.value, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      )}
      {hint && !loading ? (
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
    borderRadius: radii.lg,
    padding: spacing(3.5),
    gap: spacing(2),
  },
  top: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  iconWrap: { width: 28, height: 28, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  label: { flex: 1 },
  value: { fontSize: 22, lineHeight: 28, fontWeight: "700", fontVariant: ["tabular-nums"] },
});
