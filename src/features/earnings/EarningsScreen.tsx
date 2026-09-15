import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCancelWithdrawalMutation,
  useDailyCollectionsQuery,
  useDisplaySettingsQuery,
  useMyWithdrawalsQuery,
  usePartnerWalletQuery,
  useSetSettlementCadenceMutation,
  useTodayCollectionQuery,
} from "@castadi/shared/hooks";
import { brand, radii, spacing } from "@castadi/shared/tokens";
import {
  SETTLEMENT_CADENCES,
  type DailyCollection,
  type SettlementCadence,
  type WalletTransactionType,
  type WithdrawalRequest,
  type WithdrawalStatus,
} from "@castadi/shared/types";
import { formatDate, formatDayLabel, formatINRPrecise } from "@/lib/format";
import { toast } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, Icon, Pager, Screen, Section, Skeleton, StatGrid, StatTile, StatusPill, Text, type Tone } from "@/ui";
import { WithdrawalSheet } from "./WithdrawalSheet";

const WITHDRAWAL_TONE: Record<WithdrawalStatus, Tone> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  CANCELLED: "default",
};

const TRANSACTION_TONE: Record<WalletTransactionType, Tone> = {
  SETTLEMENT: "success",
  PAYOUT: "primary",
  ADJUSTMENT: "warning",
};

const DAILY_PREVIEW_COUNT = 7;

export function EarningsScreen() {
  const queryClient = useQueryClient();
  const wallet = usePartnerWalletQuery(1);
  const today = useTodayCollectionQuery();
  const display = useDisplaySettingsQuery();
  const withdrawals = useMyWithdrawalsQuery(1);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const showGross = display.data?.showGrossAmount ?? true;
  const showFee = display.data?.showSettlementFee ?? true;
  const balance = Number(wallet.data?.balance ?? 0);
  const pending = withdrawals.data?.rows.find((request) => request.status === "PENDING");

  const refresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ["revenue"] });
    } finally {
      setRefreshing(false);
    }
  };

  const withheld = today.data ? Number(today.data.tdsAmount) + Number(today.data.gstTcsAmount) : 0;
  const todayFee = today.data ? Number(today.data.settlementFeeAmount) : 0;
  const grossHint = [withheld > 0 ? `less ${formatINRPrecise(withheld)} TDS/TCS` : null, showFee && todayFee > 0 ? `${formatINRPrecise(todayFee)} fee` : null]
    .filter(Boolean)
    .join(" + ");

  return (
    <Screen edges={["top"]} onRefresh={refresh} refreshing={refreshing} contentStyle={styles.content}>
      <Text variant="title" accessibilityRole="header">
        Earnings
      </Text>

      <BalanceCard
        loading={wallet.isPending}
        balance={balance}
        pending={pending}
        onWithdraw={() => setWithdrawing(true)}
      />

      <StatGrid>
        {showGross ? (
          <StatTile
            icon="chart"
            label="Earned today (gross)"
            value={formatINRPrecise(today.data?.grossAmount ?? 0)}
            hint={grossHint || undefined}
            loading={today.isPending}
          />
        ) : null}
        <StatTile
          icon="calendar"
          label="Today's net"
          value={formatINRPrecise(today.data?.netAmount ?? 0)}
          hint={today.data ? (today.data.willSettleToday ? "Credits to wallet tonight" : "Accrues until month end") : undefined}
          tone="success"
          loading={today.isPending}
        />
      </StatGrid>

      {wallet.data ? <CadenceSection current={wallet.data.settlementCadence} /> : null}

      <WithdrawalsSection loading={withdrawals.isPending} rows={withdrawals.data?.rows ?? []} />

      <DailyEarningsSection showGross={showGross} showFee={showFee} />

      <WalletActivitySection />

      <WithdrawalSheet visible={withdrawing} balance={balance} onClose={() => setWithdrawing(false)} />
    </Screen>
  );
}

function BalanceCard({
  loading,
  balance,
  pending,
  onWithdraw,
}: {
  loading: boolean;
  balance: number;
  pending?: WithdrawalRequest;
  onWithdraw: () => void;
}) {
  const { colors, mode } = useTheme();
  if (loading) return <Skeleton height={176} radius={radii.xl} />;

  return (
    <View
      accessible
      accessibilityLabel={`Wallet balance ${formatINRPrecise(balance)}`}
      style={[styles.balance, { backgroundColor: mode === "dark" ? colors.card : colors.secondary, borderColor: mode === "dark" ? colors.border : colors.secondary }]}
    >
      <View style={styles.balanceTop}>
        <Icon name="wallet" size={18} color={colors.primary} />
        <Text variant="label" style={styles.onDarkMuted}>
          Wallet balance
        </Text>
      </View>
      <Text style={styles.balanceValue} numberOfLines={1} adjustsFontSizeToFit>
        {formatINRPrecise(balance)}
      </Text>
      {pending ? (
        <Text variant="caption" style={styles.onDarkMuted}>
          Withdrawal of {formatINRPrecise(pending.amount)} pending admin review.
        </Text>
      ) : (
        <Text variant="caption" style={styles.onDarkMuted}>
          Awaiting payout — request a withdrawal any time you have a balance.
        </Text>
      )}
      <Button title="Request withdrawal" onPress={onWithdraw} disabled={balance <= 0 || !!pending} />
    </View>
  );
}

function CadenceSection({ current }: { current: SettlementCadence }) {
  const { colors } = useTheme();
  const setCadence = useSetSettlementCadenceMutation();

  const choose = (cadence: SettlementCadence, label: string, hint: string) => {
    if (cadence === current || setCadence.isPending) return;
    Alert.alert(`Switch to ${label.toLowerCase()} payouts?`, `${hint} This only affects future settlements.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Switch",
        onPress: async () => {
          try {
            await setCadence.mutateAsync(cadence);
            toast.success(cadence === "DAILY" ? "You'll be paid out daily." : "You'll be paid out at month end.");
          } catch {
            // The API client already surfaced the error.
          }
        },
      },
    ]);
  };

  return (
    <Section title="Payout schedule">
      <View style={styles.cadences}>
        {SETTLEMENT_CADENCES.map((option) => {
          const active = option.value === current;
          return (
            <Pressable
              key={option.value}
              onPress={() => choose(option.value, option.label, option.hint)}
              accessibilityRole="radio"
              accessibilityState={{ checked: active, disabled: setCadence.isPending }}
              style={[
                styles.cadence,
                { backgroundColor: colors.card, borderColor: active ? colors.primary : colors.border },
              ]}
            >
              <View style={styles.cadenceTop}>
                <Text variant="label" weight="semibold" tone={active ? "primary" : "default"}>
                  {option.label}
                </Text>
                {active ? <Icon name="check" size={16} color={colors.primary} /> : null}
              </View>
              <Text variant="caption" tone="muted">
                {option.hint}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Section>
  );
}

function WithdrawalsSection({ loading, rows }: { loading: boolean; rows: WithdrawalRequest[] }) {
  const { colors } = useTheme();
  const cancel = useCancelWithdrawalMutation();

  const confirmCancel = (request: WithdrawalRequest) => {
    Alert.alert("Cancel this withdrawal?", `Your request for ${formatINRPrecise(request.amount)} will be withdrawn.`, [
      { text: "Keep request", style: "cancel" },
      {
        text: "Cancel request",
        style: "destructive",
        onPress: async () => {
          try {
            await cancel.mutateAsync(request.id);
            toast.success("Withdrawal request cancelled");
          } catch {
            // The API client already surfaced the error.
          }
        },
      },
    ]);
  };

  return (
    <Section title="Withdrawals">
      {loading ? (
        <Skeleton height={96} radius={radii.lg} />
      ) : rows.length === 0 ? (
        <Card>
          <Text variant="caption" tone="muted">
            Nothing is paid out automatically. Your withdrawal requests and their status will show up here.
          </Text>
        </Card>
      ) : (
        <Card style={styles.listCard}>
          {rows.map((request, index) => (
            <View
              key={request.id}
              style={[styles.listRow, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
            >
              <View style={styles.flex}>
                <Text variant="label" weight="semibold" style={styles.tabular}>
                  {formatINRPrecise(request.amount)}
                </Text>
                <Text variant="caption" tone="muted">
                  Requested {formatDate(request.createdAt)}
                  {request.status === "REJECTED" && request.rejectionReason ? ` — ${request.rejectionReason}` : ""}
                </Text>
              </View>
              <View style={styles.rowEnd}>
                <StatusPill label={request.status.charAt(0) + request.status.slice(1).toLowerCase()} tone={WITHDRAWAL_TONE[request.status]} />
                {request.status === "PENDING" ? (
                  <Pressable onPress={() => confirmCancel(request)} disabled={cancel.isPending} hitSlop={8} accessibilityRole="button">
                    <Text variant="caption" weight="semibold" tone="danger">
                      Cancel
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </Card>
      )}
    </Section>
  );
}

function DailyEarningsSection({ showGross, showFee }: { showGross: boolean; showFee: boolean }) {
  const { colors } = useTheme();
  const collections = useDailyCollectionsQuery();
  const [expanded, setExpanded] = useState(false);

  const rows = [...(collections.data ?? [])].reverse();
  const visible = expanded ? rows : rows.slice(0, DAILY_PREVIEW_COUNT);

  return (
    <Section
      title="Daily earnings"
      action={rows.length > DAILY_PREVIEW_COUNT ? { label: expanded ? "Show less" : "Show all", onPress: () => setExpanded((value) => !value) } : undefined}
    >
      {collections.isPending ? (
        <Skeleton height={220} radius={radii.lg} />
      ) : rows.length === 0 ? (
        <Card>
          <Text variant="caption" tone="muted">
            Once a paid campaign runs on one of your screens, your daily earnings show up here.
          </Text>
        </Card>
      ) : (
        <Card style={styles.listCard}>
          {visible.map((row, index) => (
            <DailyRow key={row.date} row={row} showGross={showGross} showFee={showFee} divider={index > 0} borderColor={colors.border} />
          ))}
        </Card>
      )}
    </Section>
  );
}

function DailyRow({ row, showGross, showFee, divider, borderColor }: { row: DailyCollection; showGross: boolean; showFee: boolean; divider: boolean; borderColor: string }) {
  const withheld = Number(row.tdsAmount) + Number(row.gstTcsAmount);
  const fee = Number(row.settlementFeeAmount);
  const breakdown = [
    showGross ? `Gross ${formatINRPrecise(row.grossAmount)}` : null,
    withheld > 0 ? `−${formatINRPrecise(withheld)} withheld` : null,
    showFee && fee > 0 ? `−${formatINRPrecise(fee)} fee` : null,
  ].filter(Boolean);

  return (
    <View style={[styles.listRow, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: borderColor }]}>
      <View style={styles.flex}>
        <Text variant="label" weight="semibold">
          {formatDayLabel(row.date)}
        </Text>
        {breakdown.length > 0 ? (
          <Text variant="caption" tone="muted" numberOfLines={2}>
            {breakdown.join(" · ")}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowEnd}>
        <Text variant="label" weight="bold" style={styles.tabular}>
          {formatINRPrecise(row.netAmount)}
        </Text>
        <StatusPill label={row.settled ? "Settled" : "Pending"} tone={row.settled ? "success" : "warning"} />
      </View>
    </View>
  );
}

function WalletActivitySection() {
  const { colors } = useTheme();
  const [page, setPage] = useState(1);
  const wallet = usePartnerWalletQuery(page);
  const rows = wallet.data?.transactions.rows ?? [];
  const meta = wallet.data?.transactions.meta;

  return (
    <Section title="Wallet activity">
      {wallet.isPending ? (
        <Skeleton height={180} radius={radii.lg} />
      ) : rows.length === 0 ? (
        <Card>
          <Text variant="caption" tone="muted">
            Settlements credited to you and payouts sent to your bank will be listed here.
          </Text>
        </Card>
      ) : (
        <>
          <Card style={styles.listCard}>
            {rows.map((transaction, index) => {
              const amount = Number(transaction.amount);
              return (
                <View
                  key={transaction.id}
                  style={[styles.listRow, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
                >
                  <View style={styles.flex}>
                    <StatusPill
                      label={transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}
                      tone={TRANSACTION_TONE[transaction.type]}
                    />
                    <Text variant="caption" tone="muted" numberOfLines={2}>
                      {transaction.description ?? formatDate(transaction.createdAt)}
                      {transaction.periodStart && transaction.periodEnd
                        ? ` · ${formatDayLabel(transaction.periodStart)} – ${formatDayLabel(transaction.periodEnd)}`
                        : ""}
                    </Text>
                  </View>
                  <View style={styles.rowEnd}>
                    <Text variant="label" weight="bold" tone={amount < 0 ? "default" : "success"} style={styles.tabular}>
                      {amount < 0 ? `−${formatINRPrecise(Math.abs(amount))}` : `+${formatINRPrecise(amount)}`}
                    </Text>
                    <Text variant="caption" tone="muted" style={styles.tabular}>
                      Bal. {formatINRPrecise(transaction.balanceAfter)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
          {meta ? <Pager page={meta.page} limit={meta.limit} total={meta.total} onPageChange={setPage} /> : null}
        </>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(5), paddingBottom: spacing(10) },
  balance: { borderWidth: 1, borderRadius: radii.xl, padding: spacing(5), gap: spacing(3) },
  balanceTop: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  balanceValue: { color: brand.foreground, fontSize: 34, lineHeight: 40, fontWeight: "700", fontVariant: ["tabular-nums"] },
  onDarkMuted: { color: "rgba(255,252,243,0.64)" },
  cadences: { flexDirection: "row", gap: spacing(3) },
  cadence: { flex: 1, borderWidth: 2, borderRadius: radii.lg, padding: spacing(3.5), gap: spacing(1) },
  cadenceTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  listCard: { padding: 0, gap: 0, overflow: "hidden" },
  listRow: { flexDirection: "row", alignItems: "center", gap: spacing(3), paddingHorizontal: spacing(4), paddingVertical: spacing(3) },
  flex: { flex: 1, gap: spacing(1) },
  rowEnd: { alignItems: "flex-end", gap: spacing(1) },
  tabular: { fontVariant: ["tabular-nums"] },
});
