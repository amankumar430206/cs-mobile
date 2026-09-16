import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { useCampaignCreativesQuery, useCreditRejectedCreativeToWalletMutation, useUploadCreativeMutation } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import type { Creative, CreativeStatus } from "@castadi/shared/types";
import { CREATIVE_LIMITS, FilePickError, pickFile, pickPhoto, pickVideo, takePhoto, type PickedFile } from "@/platform/filePicker";
import { toast } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { ActionSheet, Button, Card, Icon, Section, Skeleton, StatusPill, Text, type SheetAction, type Tone } from "@/ui";

const STATUS_TONE: Record<CreativeStatus, Tone> = {
  PENDING_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

const MAX_CREATIVES = 5;

export function CreativesSection({ campaignId, canUpload }: { campaignId: string; canUpload: boolean }) {
  const { colors } = useTheme();
  const creatives = useCampaignCreativesQuery(campaignId);
  // Was useUploadCampaignBannerMutation — that posts to /campaigns/:id/banners
  // (JPG/PNG/WEBP, 5 MB), so videos and larger files failed and accepted
  // images became banners instead of reviewable creatives.
  const upload = useUploadCreativeMutation(campaignId);
  const creditToWallet = useCreditRejectedCreativeToWalletMutation(campaignId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const rows = creatives.data ?? [];
  const atMax = rows.length >= MAX_CREATIVES;

  const uploadPicked = async (pick: () => Promise<PickedFile | null>) => {
    let file: PickedFile | null;
    try {
      file = await pick();
    } catch (err) {
      toast.error(err instanceof FilePickError ? err.message : "Couldn't open that file. Please try another.");
      return;
    }
    if (!file) return;
    try {
      const { width, height, durationSeconds, ...uploadFile } = file;
      await upload.mutateAsync({ file: uploadFile, width, height, durationSeconds });
      toast.success("Creative uploaded for review");
    } catch {
      // The API client already surfaced the error.
    }
  };

  const pickerActions: SheetAction[] = [
    { key: "camera", label: "Take photo", icon: "camera", onPress: () => void uploadPicked(() => takePhoto(CREATIVE_LIMITS)) },
    { key: "photo", label: "Choose photo", icon: "photo", onPress: () => void uploadPicked(() => pickPhoto(CREATIVE_LIMITS)) },
    { key: "video", label: "Choose video", icon: "video", onPress: () => void uploadPicked(() => pickVideo(CREATIVE_LIMITS)) },
    { key: "file", label: "Choose a file", icon: "document", onPress: () => void uploadPicked(() => pickFile(CREATIVE_LIMITS)) },
  ];

  return (
    <Section title="Creatives">
      {canUpload ? (
        <>
          <Text variant="caption" tone="muted">
            {rows.length} of {MAX_CREATIVES} uploaded.
          </Text>
          <Button title="Upload creative" onPress={() => setPickerOpen(true)} disabled={atMax || upload.isPending} loading={upload.isPending} />
        </>
      ) : null}

      {creatives.isPending ? (
        <Skeleton height={140} radius={radii.lg} />
      ) : rows.length === 0 ? (
        <Card>
          <Text variant="caption" tone="muted">
            No creatives uploaded yet.
          </Text>
        </Card>
      ) : (
        <Card style={styles.listCard}>
          {rows.map((creative, index) => (
            <CreativeRow
              key={creative.id}
              creative={creative}
              divider={index > 0}
              borderColor={colors.border}
              onCredit={() => creditToWallet.mutate(creative.id)}
              crediting={creditToWallet.isPending}
            />
          ))}
        </Card>
      )}

      <ActionSheet visible={pickerOpen} title="Upload creative" actions={pickerActions} onClose={() => setPickerOpen(false)} />
    </Section>
  );
}

function CreativeRow({
  creative,
  divider,
  borderColor,
  onCredit,
  crediting,
}: {
  creative: Creative;
  divider: boolean;
  borderColor: string;
  onCredit: () => void;
  crediting: boolean;
}) {
  return (
    <View style={[styles.row, divider && { borderTopWidth: 1, borderTopColor: borderColor }]}>
      <View style={styles.rowTop}>
        <Text variant="label" weight="semibold" numberOfLines={1} style={styles.flex}>
          {creative.originalFilename}
        </Text>
        <StatusPill label={creative.status.replace("_", " ").toLowerCase()} tone={STATUS_TONE[creative.status]} />
      </View>
      {creative.status === "REJECTED" && creative.rejectionReason ? (
        <Text variant="caption" tone="danger">
          {creative.rejectionReason}
        </Text>
      ) : null}
      <View style={styles.rowActions}>
        <Button title="View" variant="ghost" style={styles.action} onPress={() => void Linking.openURL(creative.downloadUrl)} />
        {creative.status === "REJECTED" && !creative.walletCreditedAt ? (
          <Button title="Credit to wallet" variant="outline" style={styles.action} onPress={onCredit} loading={crediting} />
        ) : creative.walletCreditedAt ? (
          <View style={styles.creditedRow}>
            <Icon name="check" size={14} color="#16a34a" />
            <Text variant="caption" tone="success">
              Credited
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listCard: { padding: 0, gap: 0, overflow: "hidden" },
  row: { paddingHorizontal: spacing(4), paddingVertical: spacing(3), gap: spacing(1.5) },
  rowTop: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  flex: { flex: 1 },
  rowActions: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  action: { minHeight: 36, paddingHorizontal: spacing(3) },
  creditedRow: { flexDirection: "row", alignItems: "center", gap: 4 },
});
