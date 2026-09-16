import { Pressable, StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import type { ScreenListItem } from "@castadi/shared/types";
import { formatINR } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, LiveIndicator, StatusPill, Text, toneToColor } from "@/ui";
import { SCREEN_STATUS } from "./screenStatus";

export function ScreenRow({ screen, onPress }: { screen: ScreenListItem; onPress: () => void }) {
  const { colors } = useTheme();
  const status = SCREEN_STATUS[screen.verificationStatus];
  const isActive = screen.verificationStatus === "ACTIVE";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${screen.screenName}, ${status.label}${isActive ? (screen.isLive ? ", live" : ", offline") : ""}`}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.muted : colors.card, borderColor: colors.cardBorder }]}
    >
      <View style={[styles.accent, { backgroundColor: toneToColor(colors, status.tone) }]} />
      <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
        <Icon name="screen" size={20} color={colors.foreground} />
      </View>
      <View style={styles.body}>
        <Text variant="label" weight="semibold" numberOfLines={1}>
          {screen.screenName}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {screen.city}, {screen.state} · {formatINR(screen.pricePerDay)}/day
        </Text>
        <View style={styles.meta}>
          <StatusPill label={status.label} tone={status.tone} />
          {isActive ? <LiveIndicator live={screen.isLive} /> : null}
          {isActive && !screen.isListed ? (
            <Text variant="caption" tone="muted">
              Hidden
            </Text>
          ) : null}
        </View>
      </View>
      <Icon name="chevronRight" size={14} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing(3),
    paddingRight: spacing(3),
    paddingLeft: spacing(4),
    overflow: "hidden",
  },
  accent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  iconWrap: { width: 44, height: 44, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 3 },
  meta: { flexDirection: "row", alignItems: "center", gap: spacing(2), marginTop: 2 },
});
