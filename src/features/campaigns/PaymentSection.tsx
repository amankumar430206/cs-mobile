import { Alert, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useAdvertiserWalletQuery, usePayCampaignFromWalletMutation, usePaymentStatusQuery, useRaisePaymentRequestMutation } from "@castadi/shared/hooks";
import { spacing } from "@castadi/shared/tokens";
import type { Campaign, PaymentStatus } from "@castadi/shared/types";
import { formatDate, formatINR } from "@/lib/format";
import { toast } from "@/platform/toast";
import { Button, Card, DetailRow, Section, StatusPill, Text, type Tone } from "@/ui";

const STATUS_TONE: Record<PaymentStatus, Tone> = {
  INITIATED: "warning",
  SUCCESSFUL: "success",
  FAILED: "danger",
};

export function PaymentSection({ campaign }: { campaign: Campaign }) {
  const queryClient = useQueryClient();
  const payment = usePaymentStatusQuery(campaign.id);
  const wallet = useAdvertiserWalletQuery();
  const raiseRequest = useRaisePaymentRequestMutation();
  const payFromWallet = usePayCampaignFromWalletMutation();

  const payable = campaign.status === "PENDING_PAYMENT" || campaign.status === "ACTIVE";
  const balance = wallet.data?.balance ?? 0;
  const canPayFromWallet = balance >= campaign.totalBudget;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["campaigns", campaign.id] });
    void queryClient.invalidateQueries({ queryKey: ["payments", "campaign", campaign.id] });
  };

  const confirmWalletPay = () => {
    Alert.alert("Pay from wallet?", `${formatINR(campaign.totalBudget)} will be debited from your wallet balance of ${formatINR(balance)}.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Pay",
        onPress: async () => {
          try {
            await payFromWallet.mutateAsync(campaign.id);
            toast.success("Payment successful");
            refresh();
          } catch {
            // The API client already surfaced the error.
          }
        },
      },
    ]);
  };

  const raise = async () => {
    try {
      await raiseRequest.mutateAsync(campaign.id);
      toast.success("Payment request raised. An admin will review it shortly.");
      refresh();
    } catch {
      // The API client already surfaced the error.
    }
  };

  if (!payable && !payment.data) {
    return null;
  }

  return (
    <Section title="Payment">
      <Card>
        <DetailRow label="Total budget" value={formatINR(campaign.totalBudget)} />
        {payment.data ? (
          <>
            <View style={styles.statusRow}>
              <Text variant="label" tone="muted">
                Status
              </Text>
              <StatusPill label={payment.data.status.charAt(0) + payment.data.status.slice(1).toLowerCase()} tone={STATUS_TONE[payment.data.status]} />
            </View>
            {payment.data.gatewayOrderId ? (
              <Text variant="caption" tone="muted">
                Complete this payment from the CASTADI web dashboard to use Razorpay checkout.
              </Text>
            ) : (
              <Text variant="caption" tone="muted">
                Payment request raised — an admin reviews and confirms it, or complete it from the web dashboard using Razorpay.
              </Text>
            )}
            {payment.data.status === "FAILED" && payment.data.failureReason ? (
              <Text variant="caption" tone="danger">
                {payment.data.failureReason}
              </Text>
            ) : null}
            {payment.data.invoiceNumber ? <DetailRow label="Invoice" value={`${payment.data.invoiceNumber} · ${formatDate(payment.data.invoiceIssuedAt!)}`} /> : null}
          </>
        ) : payable ? (
          <>
            <Text variant="caption" tone="muted">
              Pay from your CASTADI wallet, raise a request for an admin to confirm, or use the web dashboard for card/UPI checkout.
            </Text>
            <Button
              title={`Pay from wallet (${formatINR(balance)} available)`}
              onPress={confirmWalletPay}
              disabled={!canPayFromWallet}
              loading={payFromWallet.isPending}
            />
            <Button title="Raise payment request" variant="outline" onPress={() => void raise()} loading={raiseRequest.isPending} />
          </>
        ) : null}
      </Card>
    </Section>
  );
}

const styles = { statusRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, gap: spacing(2) } };
