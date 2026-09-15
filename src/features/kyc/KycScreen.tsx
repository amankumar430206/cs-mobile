import { useState } from "react";
import { StyleSheet } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useMeQuery, useMyKycQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import type { AdvertiserKycStatus, ScreenPartnerKycStatus } from "@castadi/shared/types";
import { Screen, Skeleton } from "@/ui";
import { AdvertiserKycForm } from "./AdvertiserKycForm";
import { ADVERTISER_DOCUMENT_TYPES, SCREEN_PARTNER_DOCUMENT_TYPES } from "./documentTypes";
import { DocumentsSection } from "./DocumentsSection";
import { canSubmitKyc, type KycStatus } from "./kycStatus";
import { KycStatusCard } from "./KycStatusCard";
import { PartnerKycForm } from "./PartnerKycForm";

export function KycScreen() {
  const { data: user } = useMeQuery();
  const kyc = useMyKycQuery<AdvertiserKycStatus | ScreenPartnerKycStatus>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["kyc"] }),
        queryClient.refetchQueries({ queryKey: ["auth", "me"] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) return null;
  const isAdvertiser = user.role === "ADVERTISER";

  const status: KycStatus | undefined = kyc.data
    ? "verificationStatus" in kyc.data
      ? kyc.data.verificationStatus
      : kyc.data.kycStatus
    : undefined;

  return (
    <Screen edges={["bottom"]} onRefresh={refresh} refreshing={refreshing} contentStyle={styles.content}>
      {!kyc.data || !status ? (
        <Skeleton height={140} radius={radii.lg} />
      ) : (
        <>
          <KycStatusCard status={status} rejectionReason={kyc.data.rejectionReason} submittedAt={kyc.data.submittedAt} />
          {canSubmitKyc(status) ? isAdvertiser ? <AdvertiserKycForm /> : <PartnerKycForm /> : null}
        </>
      )}

      <DocumentsSection documentTypes={isAdvertiser ? ADVERTISER_DOCUMENT_TYPES : SCREEN_PARTNER_DOCUMENT_TYPES} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(5), paddingBottom: spacing(10) },
});
