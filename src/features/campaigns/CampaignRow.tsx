import { Pressable, StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import type { Campaign } from "@castadi/shared/types";
import { formatDateRange } from "@castadi/shared/types";
import { formatINR } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, StatusPill, Text, toneToColor } from "@/ui";
import { CAMPAIGN_STATUS } from "./campaignStatus";

export function CampaignRow({ campaign, onPress }: { campaign: Campaign; onPress: () => void }) {
  const { colors } = useTheme();
  const status = CAMPAIGN_STATUS[campaign.status];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${campaign.name}, ${status.label}`}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.muted : colors.card, borderColor: colors.cardBorder }]}
    >
      <View style={[styles.accent, { backgroundColor: toneToColor(colors, status.tone) }]} />
      <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
        <Icon name="megaphone" size={20} color={colors.foreground} />
      </View>
      <View style={styles.body}>
        <Text variant="label" weight="semibold" numberOfLines={1}>
          {campaign.name}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {formatDateRange(campaign.startDate, campaign.endDate)} · {formatINR(campaign.totalBudget)}
        </Text>
        <View style={styles.meta}>
          <StatusPill label={status.label} tone={status.tone} />
          {campaign.liveScreenCount ? (
            <Text variant="caption" tone="success">
              {campaign.liveScreenCount} live now
            </Text>
          ) : campaign.screenCount ? (
            <Text variant="caption" tone="muted">
              {campaign.screenCount} {campaign.screenCount === 1 ? "screen" : "screens"}
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
