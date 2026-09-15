import { StyleSheet, View } from "react-native";
import { useAdvertiserWalletQuery } from "@castadi/shared/hooks";
import { brand, radii, spacing } from "@castadi/shared/tokens";
import type { AdvertiserWalletTransactionType } from "@castadi/shared/types";
import { formatDateTime, formatINRPrecise } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, Screen, Section, Skeleton, StatusPill, Text, type Tone } from "@/ui";

const TX_TONE: Record<AdvertiserWalletTransactionType, Tone> = {
  TOPUP: "success",
  CAMPAIGN_PAYMENT: "default",
  REFUND: "primary",
  ADJUSTMENT: "warning",
};

export function WalletScreen() {
  const { colors, mode } = useTheme();
  const wallet = useAdvertiserWalletQuery(30);
  const transactions = wallet.data?.transactions ?? [];

  return (
    <Screen edges={["top"]} onRefresh={() => void wallet.refetch()} refreshing={wallet.isRefetching} contentStyle={styles.content}>
      <Text variant="title" accessibilityRole="header">
        Wallet
      </Text>

      {wallet.isPending ? (
        <Skeleton height={140} radius={radii.xl} />
      ) : (
        <View
          accessible
          accessibilityLabel={`Wallet balance ${formatINRPrecise(wallet.data?.balance ?? 0)}`}
          style={[styles.balance, { backgroundColor: mode === "dark" ? colors.card : colors.secondary, borderColor: mode === "dark" ? colors.border : colors.secondary }]}
        >
          <View style={styles.balanceTop}>
            <Icon name="wallet" size={18} color={colors.primary} />
            <Text variant="label" style={styles.onDarkMuted}>
              Balance
            </Text>
          </View>
          <Text style={styles.balanceValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatINRPrecise(wallet.data?.balance ?? 0)}
          </Text>
          <Text variant="caption" style={styles.onDarkMuted}>
            Top up and pay for campaigns from the CASTADI web dashboard using Razorpay checkout.
          </Text>
        </View>
      )}

      <Section title="Transactions">
        {wallet.isPending ? (
          <Skeleton height={220} radius={radii.lg} />
        ) : transactions.length === 0 ? (
          <Text variant="caption" tone="muted">
            Top-ups, campaign payments and refunds will show up here.
          </Text>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {transactions.map((transaction, index) => {
              const amount = Number(transaction.amount);
              return (
                <View
                  key={transaction.id}
                  style={[styles.row, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
                >
                  <View style={styles.flex}>
                    <StatusPill label={transaction.type.replace("_", " ").toLowerCase()} tone={TX_TONE[transaction.type]} />
                    <Text variant="caption" tone="muted" numberOfLines={2}>
                      {transaction.description ?? formatDateTime(transaction.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.rowEnd}>
                    <Text variant="label" weight="bold" tone={amount < 0 ? "default" : "success"} style={styles.tabular}>
                      {amount < 0 ? `−${formatINRPrecise(Math.abs(amount))}` : `+${formatINRPrecise(amount)}`}
                    </Text>
                    {transaction.balanceAfter != null ? (
                      <Text variant="caption" tone="muted" style={styles.tabular}>
                        Bal. {formatINRPrecise(transaction.balanceAfter)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(5), paddingBottom: spacing(10) },
  balance: { borderWidth: 1, borderRadius: radii.xl, padding: spacing(5), gap: spacing(3) },
  balanceTop: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  balanceValue: { color: brand.foreground, fontSize: 34, lineHeight: 40, fontWeight: "700", fontVariant: ["tabular-nums"] },
  onDarkMuted: { color: "rgba(255,252,243,0.64)" },
  card: { borderWidth: 1, borderRadius: radii.lg, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing(3), paddingHorizontal: spacing(4), paddingVertical: spacing(3) },
  flex: { flex: 1, gap: spacing(1) },
  rowEnd: { alignItems: "flex-end", gap: spacing(1) },
  tabular: { fontVariant: ["tabular-nums"] },
});
