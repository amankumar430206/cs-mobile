import { StyleSheet, View } from "react-native";
import { useCampaignPlaybackQuery } from "@castadi/shared/hooks";
import { radii } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Card, Section, Skeleton, Text } from "@/ui";

export function ProofOfPlaySection({ campaignId }: { campaignId: string }) {
  const { colors } = useTheme();
  const summary = useCampaignPlaybackQuery(campaignId);
  const rows = summary.data ?? [];
  const totals = rows.reduce(
    (acc, row) => ({
      completed: acc.completed + row.completedCount,
      failed: acc.failed + row.failedCount,
      interrupted: acc.interrupted + row.interruptedCount,
    }),
    { completed: 0, failed: 0, interrupted: 0 }
  );

  if (summary.isPending) return <Skeleton height={90} radius={radii.lg} />;
  if (rows.length === 0) return null;

  return (
    <Section title="Proof of play">
      <Card style={styles.row}>
        <Stat label="Completed" value={totals.completed} color={colors.success} />
        <Stat label="Interrupted" value={totals.interrupted} color={colors.warning} />
        <Stat label="Failed" value={totals.failed} color={colors.danger} />
      </Card>
    </Section>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="heading" weight="bold" style={{ color }}>
        {value}
      </Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-around" },
  stat: { alignItems: "center", gap: 2 },
});
