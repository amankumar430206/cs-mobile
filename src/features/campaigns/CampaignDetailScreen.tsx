import { Alert, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCampaignQuery, useCancelCampaignMutation } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import { formatDateRange, type Campaign } from "@castadi/shared/types";
import { formatDate, formatINR } from "@/lib/format";
import { toast } from "@/platform/toast";
import { Button, Card, DetailRow, Screen, Skeleton, StatusPill, StatusView, Text } from "@/ui";
import { CAMPAIGN_STATUS } from "./campaignStatus";
import { CampaignScreensSection } from "./CampaignScreensSection";
import { CreativesSection } from "./CreativesSection";
import { PaymentSection } from "./PaymentSection";
import { ProofOfPlaySection } from "./ProofOfPlaySection";

export function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const campaign = useCampaignQuery(id ?? "");

  if (campaign.isError) {
    return (
      <StatusView title="Couldn't load this campaign" message="Check your connection and try again.">
        <Button title="Try again" onPress={() => campaign.refetch()} />
      </StatusView>
    );
  }

  return (
    <Screen edges={["bottom"]} contentStyle={styles.content}>
      <Stack.Screen options={{ title: campaign.data?.name ?? "Campaign" }} />
      {!campaign.data ? (
        <>
          <Skeleton height={140} radius={radii.lg} />
          <Skeleton height={200} radius={radii.lg} />
        </>
      ) : (
        <CampaignDetail campaign={campaign.data} />
      )}
    </Screen>
  );
}

function CampaignDetail({ campaign }: { campaign: Campaign }) {
  const cancel = useCancelCampaignMutation();
  const status = CAMPAIGN_STATUS[campaign.status];
  const canReserve = campaign.status === "DRAFT" || campaign.status === "PENDING_PAYMENT";
  const canUploadCreatives = campaign.status === "DRAFT" || campaign.status === "PENDING_PAYMENT";
  const canCancel = campaign.status !== "CANCELLED";

  const confirmCancel = () => {
    Alert.alert(`Cancel "${campaign.name}"?`, "This can't be undone.", [
      { text: "Keep campaign", style: "cancel" },
      {
        text: "Cancel campaign",
        style: "destructive",
        onPress: async () => {
          try {
            await cancel.mutateAsync(campaign.id);
            toast.success("Campaign cancelled");
          } catch {
            // The API client already surfaced the error.
          }
        },
      },
    ]);
  };

  return (
    <>
      <Card>
        <StatusPill label={status.label} tone={status.tone} />
        <Text variant="title">{campaign.name}</Text>
        <Text tone="muted">{formatDateRange(campaign.startDate, campaign.endDate)}</Text>
        {campaign.description ? <Text variant="caption">{campaign.description}</Text> : null}
        <DetailRow label="Objective" value={campaign.objective} />
        <DetailRow label="Total budget" value={formatINR(campaign.totalBudget)} />
        <DetailRow label="Ad duration" value={campaign.adDuration ? `${campaign.adDuration}s` : undefined} />
        <DetailRow label="Frequency" value={campaign.frequency ? `${campaign.frequency}x/day` : undefined} />
        <DetailRow label="Created" value={formatDate(campaign.createdAt)} />
        {canCancel ? <Button title="Cancel campaign" variant="danger" onPress={confirmCancel} loading={cancel.isPending} /> : null}
      </Card>

      <CampaignScreensSection campaignId={campaign.id} canReserve={canReserve} />
      <PaymentSection campaign={campaign} />
      <CreativesSection campaignId={campaign.id} canUpload={canUploadCreatives} />
      {campaign.status === "ACTIVE" ? <ProofOfPlaySection campaignId={campaign.id} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(5), paddingBottom: spacing(10) },
});
