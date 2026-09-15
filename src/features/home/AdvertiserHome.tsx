import { StyleSheet, View } from "react-native";
import { useAdvertiserAnalyticsQuery, useMyCampaignsQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import {
  computePeriodDelta,
  formatDateRange,
  type AdvertiserAnalytics,
  type Campaign,
  type CampaignStatus,
  type CurrentUser,
} from "@castadi/shared/types";
import { formatINR, humanize } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { Card, Section, Skeleton, StackedBar, StatGrid, StatTile, StatusPill, Text, type Tone } from "@/ui";
import { AttentionList } from "./AttentionList";
import { buildAttentionItems } from "./attentionItems";
import { TrendHero } from "./TrendHero";

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

  const data = analytics.data;
  const list = campaigns.data ?? [];
  const awaitingPayment = list.filter((campaign) => campaign.status === "PENDING_PAYMENT").length;
  const recent = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  const trend = data?.spendTrend ?? [];
  const values = trend.map((day) => Number(day.amount) || 0);
  const last30 = values.reduce((sum, amount) => sum + amount, 0);
  const loading = analytics.isPending;

  return (
    <>
      <AttentionList items={buildAttentionItems(user, awaitingPayment)} />

      <TrendHero
        title="Ad spend"
        value={formatINR(last30)}
        values={values}
        dates={trend.map((day) => day.date)}
        delta={computePeriodDelta(values)}
        footer={data ? [{ label: "Lifetime spend", value: formatINR(data.kpis.totalSpend) }] : []}
        loading={loading}
      />

      <StatGrid>
        <StatTile icon="megaphone" label="Active campaigns" value={String(data?.kpis.activeCampaigns ?? 0)} tone="success" loading={loading} />
        <StatTile icon="screen" label="Screens booked" value={String(data?.kpis.activeScreens ?? 0)} tone="primary" loading={loading} />
        <StatTile icon="chart" label="Total campaigns" value={String(data?.kpis.totalCampaigns ?? 0)} loading={loading} />
        <StatTile
          icon="clock"
          label="Awaiting payment"
          value={String(awaitingPayment)}
          tone={awaitingPayment > 0 ? "warning" : "default"}
          loading={campaigns.isPending}
        />
      </StatGrid>

      <Section title="Campaign status">
        {loading ? (
          <Skeleton height={76} radius={radii.lg} />
        ) : (
          <Card>
            <StackedBar
              emptyLabel="No campaigns yet."
              segments={(data?.campaignsByStatus ?? []).map((row) => ({
                key: row.status,
                label: humanize(row.status),
                value: Number(row.count),
                tone: STATUS_TONE[row.status as CampaignStatus] ?? "default",
              }))}
            />
          </Card>
        )}
      </Section>

      <Section title="Top screens">
        {loading ? <Skeleton height={140} radius={radii.lg} /> : <TopScreens screens={data?.screenPerformance ?? []} />}
      </Section>

      <Section title="Recent campaigns">
        {campaigns.isPending ? (
          <Skeleton height={160} radius={radii.lg} />
        ) : recent.length === 0 ? (
          <Card>
            <Text variant="label">No campaigns yet</Text>
            <Text variant="caption" tone="muted">
              Campaigns you create on the CASTADI web dashboard will show up here.
            </Text>
          </Card>
        ) : (
          <Card style={styles.listCard}>
            {recent.map((campaign, index) => (
              <CampaignRow key={campaign.id} campaign={campaign} divider={index > 0} />
            ))}
          </Card>
        )}
      </Section>
    </>
  );
}

function TopScreens({ screens }: { screens: AdvertiserAnalytics["screenPerformance"] }) {
  const { colors } = useTheme();
  const top = [...screens].sort((a, b) => b.playbackCount - a.playbackCount).slice(0, 3);

  if (top.length === 0) {
    return (
      <Card>
        <Text variant="caption" tone="muted">
          Screens running your ads will be ranked here by plays.
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.listCard}>
      {top.map((screen, index) => (
        <View
          key={screen.screenId}
          accessible
          accessibilityLabel={`${index + 1}. ${screen.screenName}, ${screen.city}, ${screen.playbackCount} plays, ${screen.bookingCount} bookings`}
          style={[styles.row, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
        >
          <View style={[styles.rank, { backgroundColor: index === 0 ? `${colors.primary}24` : colors.muted }]}>
            <Text variant="caption" weight="bold" tone={index === 0 ? "primary" : "muted"}>
              {index + 1}
            </Text>
          </View>
          <View style={styles.rowBody}>
            <Text variant="label" weight="semibold" numberOfLines={1}>
              {screen.screenName}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {screen.city} · {screen.bookingCount} {screen.bookingCount === 1 ? "booking" : "bookings"}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text variant="label" weight="bold" style={styles.tabular}>
              {screen.playbackCount.toLocaleString("en-IN")}
            </Text>
            <Text variant="caption" tone="muted">
              plays
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

function CampaignRow({ campaign, divider }: { campaign: Campaign; divider: boolean }) {
  const { colors } = useTheme();
  return (
    <View accessible style={[styles.campaignRow, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
      <View style={styles.campaignHeader}>
        <Text variant="label" weight="semibold" numberOfLines={1} style={styles.flex}>
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
  listCard: { gap: 0, paddingVertical: spacing(1) },
  row: { flexDirection: "row", alignItems: "center", gap: spacing(3), paddingVertical: spacing(3) },
  rank: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1, gap: 2 },
  metric: { alignItems: "flex-end" },
  tabular: { fontVariant: ["tabular-nums"] },
  campaignRow: { paddingVertical: spacing(3), gap: spacing(1) },
  campaignHeader: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  flex: { flex: 1 },
});
