import { usePartnerAnalyticsQuery, usePartnerStatsQuery } from "@castadi/shared/hooks";
import { radii } from "@castadi/shared/tokens";
import { computePeriodDelta, type BookingStatus, type CurrentUser } from "@castadi/shared/types";
import { formatINR, humanize } from "@/lib/format";
import { Card, DetailRow, Section, Skeleton, StackedBar, StatGrid, StatTile, type Tone } from "@/ui";
import { AttentionList } from "./AttentionList";
import { buildAttentionItems } from "./attentionItems";
import { TrendHero } from "./TrendHero";

const BOOKING_TONE: Record<BookingStatus, Tone> = {
  RESERVED: "warning",
  CONFIRMED: "success",
  EXPIRED: "default",
  CANCELLED: "danger",
};

const healthTone = (score: number): Tone => (score >= 80 ? "success" : score >= 50 ? "warning" : "danger");

export function PartnerHome({ user }: { user: CurrentUser }) {
  const analytics = usePartnerAnalyticsQuery();
  const stats = usePartnerStatsQuery();

  const data = analytics.data;
  const screens = stats.data;
  const loading = analytics.isPending;

  const trend = data?.revenueTrend ?? [];
  const values = trend.map((day) => Number(day.amount) || 0);
  const last30 = values.reduce((sum, amount) => sum + amount, 0);
  const health = data?.kpis.avgHealthScore ?? 0;
  const hasLiveScreens = (data?.kpis.activeScreens ?? 0) > 0;

  return (
    <>
      <AttentionList role={user.role} items={buildAttentionItems(user)} />

      <TrendHero
        title="Earnings"
        value={formatINR(last30)}
        values={values}
        dates={trend.map((day) => day.date)}
        delta={computePeriodDelta(values)}
        footer={
          data
            ? [
                { label: "Today", value: formatINR(data.revenue.daily) },
                { label: "This week", value: formatINR(data.revenue.weekly) },
              ]
            : []
        }
        loading={loading}
      />

      <StatGrid>
        <StatTile
          icon="screen"
          label="Active screens"
          value={String(screens?.activeScreens ?? 0)}
          hint={screens ? `of ${screens.totalScreens} total` : undefined}
          tone="success"
          loading={stats.isPending}
        />
        <StatTile
          icon="clock"
          label="Pending review"
          value={String(screens?.pendingScreens ?? 0)}
          tone={(screens?.pendingScreens ?? 0) > 0 ? "warning" : "default"}
          loading={stats.isPending}
        />
        <StatTile
          icon="calendar"
          label="Running & upcoming"
          value={String(screens?.activeBookings ?? 0)}
          hint="bookings"
          tone="primary"
          loading={stats.isPending}
        />
        <StatTile
          icon="heart"
          label="Avg. health"
          value={hasLiveScreens ? `${Math.round(health)}/100` : "—"}
          hint={hasLiveScreens ? undefined : "No active screens"}
          tone={hasLiveScreens ? healthTone(health) : "default"}
          loading={loading}
        />
      </StatGrid>

      <Section title="Booking pipeline">
        {loading ? (
          <Skeleton height={76} radius={radii.lg} />
        ) : (
          <Card>
            <StackedBar
              emptyLabel="No bookings on your screens yet."
              segments={(data?.bookingFunnel ?? []).map((row) => ({
                key: row.status,
                label: humanize(row.status),
                value: Number(row.count),
                tone: BOOKING_TONE[row.status as BookingStatus] ?? "default",
              }))}
            />
          </Card>
        )}
      </Section>

      <Section title="Earnings breakdown">
        {loading || !data ? (
          <Skeleton height={148} radius={radii.lg} />
        ) : (
          <Card>
            <DetailRow label="Today" value={formatINR(data.revenue.daily)} />
            <DetailRow label="This week" value={formatINR(data.revenue.weekly)} />
            <DetailRow label="Last 30 days" value={formatINR(data.revenue.monthly)} />
            <DetailRow label="Lifetime" value={formatINR(data.revenue.lifetime)} />
          </Card>
        )}
      </Section>
    </>
  );
}
