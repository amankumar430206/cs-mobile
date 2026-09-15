import { usePartnerAnalyticsQuery, usePartnerStatsQuery } from "@castadi/shared/hooks";
import type { CurrentUser } from "@castadi/shared/types";
import { formatINR } from "@/lib/format";
import { Section, StatGrid, StatTile } from "@/ui";
import { AttentionList } from "./AttentionList";
import { buildAttentionItems } from "./attentionItems";

export function PartnerHome({ user }: { user: CurrentUser }) {
  const analytics = usePartnerAnalyticsQuery();
  const stats = usePartnerStatsQuery();

  const revenue = analytics.data?.revenue;
  const screens = stats.data;
  const money = (value: number | undefined) => (value === undefined ? "—" : formatINR(value));
  const count = (value: number | undefined) => (value === undefined ? "—" : String(value));
  const health = analytics.data ? `${Math.round(analytics.data.kpis.avgHealthScore)}/100` : "—";

  return (
    <>
      <AttentionList items={buildAttentionItems(user)} />

      <Section title="Earnings">
        <StatGrid>
          <StatTile label="Today" value={money(revenue?.daily)} tone="primary" />
          <StatTile label="This month" value={money(revenue?.monthly)} tone="success" />
          <StatTile label="Avg. monthly" value={money(analytics.data?.averageMonthlyEarnings)} />
          <StatTile label="Lifetime" value={money(revenue?.lifetime)} />
        </StatGrid>
      </Section>

      <Section title="Screens">
        <StatGrid>
          <StatTile
            label="Active screens"
            value={count(screens?.activeScreens)}
            hint={screens ? `of ${screens.totalScreens} total` : undefined}
            tone="success"
          />
          <StatTile label="Pending review" value={count(screens?.pendingScreens)} tone="warning" />
          <StatTile label="Running & upcoming" value={count(screens?.activeBookings)} hint="bookings" tone="primary" />
          <StatTile label="Avg. health score" value={health} />
        </StatGrid>
      </Section>
    </>
  );
}
