import { StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { formatDayLabel } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { BarChart, DeltaBadge, Skeleton, Text } from "@/ui";

interface TrendHeroProps {
  title: string;
  /** Formatted 30-day total. */
  value: string;
  values: number[];
  dates: string[];
  /** Last 7 days vs the previous 7, in percent; null when there isn't enough history. */
  delta: number | null;
  footer?: { label: string; value: string }[];
  loading: boolean;
}

export function TrendHero({ title, value, values, dates, delta, footer = [], loading }: TrendHeroProps) {
  const { colors } = useTheme();

  if (loading) return <Skeleton height={248} radius={radii.xl} />;

  const hasActivity = values.some((amount) => amount > 0);
  const summary =
    `${title}, last 30 days: ${value}` +
    (delta !== null ? `, ${delta >= 0 ? "up" : "down"} ${Math.abs(delta)} percent over the last 7 days` : "");

  return (
    <View accessible accessibilityLabel={summary} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.top}>
        <Text variant="label" tone="muted">
          {title}
        </Text>
        <Text variant="caption" tone="muted">
          Last 30 days
        </Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        {delta !== null ? <DeltaBadge percent={delta} /> : null}
      </View>

      {hasActivity ? (
        <>
          <BarChart values={values} color={colors.primary} height={84} dimOpacity={0.3} />
          <View style={styles.axis}>
            <Text variant="caption" tone="muted">
              {dates.length ? formatDayLabel(dates[0]) : ""}
            </Text>
            <View style={styles.legend}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text variant="caption" tone="muted">
                Last 7 days
              </Text>
            </View>
            <Text variant="caption" tone="muted">
              {dates.length ? formatDayLabel(dates[dates.length - 1]) : ""}
            </Text>
          </View>
        </>
      ) : (
        <View style={[styles.empty, { borderColor: colors.border }]}>
          <Text variant="caption" tone="muted">
            No activity in the last 30 days
          </Text>
        </View>
      )}

      {footer.length > 0 ? (
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {footer.map((item) => (
            <View key={item.label} style={styles.footerItem}>
              <Text variant="caption" tone="muted">
                {item.label}
              </Text>
              <Text variant="label" weight="semibold" style={styles.tabular}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.xl, borderWidth: 1, padding: spacing(5), gap: spacing(3) },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  valueRow: { flexDirection: "row", alignItems: "center", gap: spacing(3) },
  value: { flexShrink: 1, fontSize: 32, lineHeight: 38, fontWeight: "700", fontVariant: ["tabular-nums"] },
  axis: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  legend: { flexDirection: "row", alignItems: "center", gap: spacing(1.5) },
  legendDot: { width: 8, height: 8 },
  empty: {
    height: 84,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing(3), gap: spacing(4) },
  footerItem: { flex: 1, gap: 2 },
  tabular: { fontVariant: ["tabular-nums"] },
});
