import { StyleSheet, View } from "react-native";
import { useAdvertiserAnalyticsQuery, useMyCampaignsQuery } from "@castadi/shared/hooks";
import { spacing } from "@castadi/shared/tokens";
import { formatDateRange, type Campaign, type CampaignStatus, type CurrentUser } from "@castadi/shared/types";
import { formatINR, humanize } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { Card, Section, StatGrid, StatTile, StatusPill, Text, type Tone } from "@/ui";
import { AttentionList } from "./AttentionList";
import { buildAttentionItems } from "./attentionItems";

const STATUS_TONE: Record<CampaignStatus, Tone> = {
  DRAFT: "default",
  PENDING_PAYMENT: "warning",
  CONFIRMED: "primary",
  ACTIVE: "success",
  CANCELLED: "danger",
};

export function AdvertiserHome({ user }: { user: CurrentUser }) {
  const analytics = useAdvertiserAnalyticsQuery();
  const campaigns = useMyCampaignsQuery();

  const kpis = analytics.data?.kpis;
  const list = campaigns.data ?? [];
  const awaitingPayment = list.filter((campaign) => campaign.status === "PENDING_PAYMENT").length;
  const recent = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);
  const count = (value: number | undefined) => (value === undefined ? "—" : String(value));

  return (
    <>
      <AttentionList items={buildAttentionItems(user, awaitingPayment)} />

      <Section title="Overview">
        <StatGrid>
          <StatTile label="Active campaigns" value={count(kpis?.activeCampaigns)} tone="success" />
          <StatTile label="Total campaigns" value={count(kpis?.totalCampaigns)} />
          <StatTile label="Total spend" value={kpis ? formatINR(kpis.totalSpend) : "—"} tone="primary" />
          <StatTile label="Screens booked" value={count(kpis?.activeScreens)} />
        </StatGrid>
      </Section>

      <Section title="Recent campaigns">
        {campaigns.isPending ? (
          <Text tone="muted">Loading campaigns…</Text>
        ) : recent.length === 0 ? (
          <Card>
            <Text variant="label">No campaigns yet</Text>
            <Text variant="caption" tone="muted">
              Campaigns you create on the CASTADI web dashboard will show up here.
            </Text>
          </Card>
        ) : (
          <Card style={styles.list}>
            {recent.map((campaign, index) => (
              <CampaignRow key={campaign.id} campaign={campaign} divider={index > 0} />
            ))}
          </Card>
        )}
      </Section>
    </>
  );
}

function CampaignRow({ campaign, divider }: { campaign: Campaign; divider: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      accessible
      style={[styles.row, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
    >
      <View style={styles.rowHeader}>
        <Text variant="label" weight="semibold" numberOfLines={1} style={styles.name}>
          {campaign.name}
        </Text>
        <StatusPill label={humanize(campaign.status)} tone={STATUS_TONE[campaign.status]} />
      </View>
      <Text variant="caption" tone="muted">
        {formatDateRange(campaign.startDate, campaign.endDate)} · {formatINR(campaign.totalBudget)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 0, paddingVertical: spacing(1) },
  row: { paddingVertical: spacing(3), gap: spacing(1) },
  rowHeader: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  name: { flex: 1 },
});
