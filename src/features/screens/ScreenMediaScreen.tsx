import { useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  useDeleteScreenPhotoMutation,
  useMyScreenQuery,
  usePhotosQuery,
  useScreenPhotoRequirementsQuery,
  useSubmitScreenMutation,
  useUploadPhotoMutation,
} from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import { PHOTO_TYPES, VIDEO_PHOTO_TYPE, type ScreenPhoto } from "@castadi/shared/types";
import {
  FilePickError,
  PHOTO_LIMITS,
  pickPhoto,
  pickVideo,
  recordVideo,
  takePhoto,
  VIDEO_LIMITS,
  type PickedFile,
} from "@/platform/filePicker";
import { toast } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { ActionSheet, Button, Card, Icon, Screen, Skeleton, StatusPill, Stepper, Text, type SheetAction } from "@/ui";
import { SCREEN_ONBOARDING_STEPS } from "./ScreenForm";
import { canManageMedia } from "./screenStatus";

interface Slot {
  value: string;
  label: string;
  isVideo: boolean;
}

const SLOTS: Slot[] = [
  ...PHOTO_TYPES.map((type) => ({ value: type.value, label: type.label, isVideo: false })),
  { value: VIDEO_PHOTO_TYPE, label: "Installation video", isVideo: true },
];

export function ScreenMediaScreen() {
  const { id, onboarding } = useLocalSearchParams<{ id: string; onboarding?: string }>();
  const screenId = id ?? "";
  const { colors } = useTheme();
  const screen = useMyScreenQuery(screenId);
  const photos = usePhotosQuery(screenId);
  const { data: requirements } = useScreenPhotoRequirementsQuery();
  const upload = useUploadPhotoMutation(screenId);
  const remove = useDeleteScreenPhotoMutation(screenId);
  const submit = useSubmitScreenMutation();

  const [target, setTarget] = useState<Slot | null>(null);
  const [busySlot, setBusySlot] = useState<string | null>(null);

  const all = photos.data ?? [];
  const stillCount = all.filter((photo) => photo.photoType !== VIDEO_PHOTO_TYPE).length;
  const hasVideo = all.some((photo) => photo.photoType === VIDEO_PHOTO_TYPE);
  const photosMet = stillCount >= requirements.minPhotos;
  const atMaxPhotos = stillCount >= requirements.maxPhotos;
  const editable = screen.data ? canManageMedia(screen.data.verificationStatus) : false;
  // Arriving straight from registration: continue the same stepper at its last step until it's submitted.
  const stepper =
    onboarding === "1" && screen.data?.verificationStatus !== "UNDER_REVIEW" ? (
      <Stepper steps={SCREEN_ONBOARDING_STEPS} current={SCREEN_ONBOARDING_STEPS.length - 1} />
    ) : undefined;

  const uploadPicked = async (slot: Slot, pick: () => Promise<PickedFile | null>) => {
    let file: PickedFile | null;
    try {
      file = await pick();
    } catch (err) {
      toast.error(err instanceof FilePickError ? err.message : "Couldn't open that file. Please try another.");
      return;
    }
    if (!file) return;

    setBusySlot(slot.value);
    try {
      await upload.mutateAsync({ photoType: slot.value, file });
      toast.success(slot.isVideo ? "Video uploaded" : "Photo uploaded");
    } catch {
      // The API client already surfaced the error.
    } finally {
      setBusySlot(null);
    }
  };

  const confirmRemove = (slot: Slot, photo: ScreenPhoto) => {
    Alert.alert(`Remove ${slot.label.toLowerCase()}?`, undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setBusySlot(slot.value);
          try {
            await remove.mutateAsync(photo.id);
            toast.success("Removed");
          } catch {
            // The API client already surfaced the error.
          } finally {
            setBusySlot(null);
          }
        },
      },
    ]);
  };

  const actionsFor = (slot: Slot): SheetAction[] => {
    const existing = all.find((photo) => photo.photoType === slot.value);
    const capture: SheetAction[] = slot.isVideo
      ? [
          { key: "record", label: existing ? "Record a new video" : "Record video", icon: "video", onPress: () => void uploadPicked(slot, () => recordVideo(VIDEO_LIMITS)) },
          { key: "library", label: "Choose an MP4 video", icon: "photo", onPress: () => void uploadPicked(slot, () => pickVideo(VIDEO_LIMITS)) },
        ]
      : [
          { key: "camera", label: existing ? "Retake photo" : "Take photo", icon: "camera", onPress: () => void uploadPicked(slot, () => takePhoto(PHOTO_LIMITS)) },
          { key: "library", label: "Choose from photos", icon: "photo", onPress: () => void uploadPicked(slot, () => pickPhoto(PHOTO_LIMITS)) },
        ];
    if (!existing) return capture;
    return [
      ...capture,
      { key: "view", label: slot.isVideo ? "View video" : "View full photo", icon: "document", onPress: () => void Linking.openURL(existing.downloadUrl) },
      { key: "remove", label: "Remove", icon: "clear", onPress: () => confirmRemove(slot, existing) },
    ];
  };

  const submitForReview = async () => {
    try {
      await submit.mutateAsync(screenId);
      toast.success("Submitted for review. We'll notify you once it's decided.");
      router.back();
    } catch {
      // The API client already surfaced the error.
    }
  };

  if (photos.isPending || !screen.data) {
    return (
      <Screen edges={["bottom"]} contentStyle={styles.content} header={stepper}>
        <Skeleton height={60} radius={radii.lg} />
        <Skeleton height={360} radius={radii.lg} />
      </Screen>
    );
  }

  return (
    <Screen edges={["bottom"]} contentStyle={styles.content} header={stepper}>
      <Text tone="muted">
        Add at least {requirements.minPhotos} photos of the screen from different angles, plus a short video (10–20 seconds) showing it
        installed and running. This is how we confirm it&apos;s real before advertisers can book it.
      </Text>

      <View style={styles.progress}>
        <StatusPill label={`Photos: ${stillCount} of ${requirements.minPhotos}+`} tone={photosMet ? "success" : "default"} />
        <StatusPill label={hasVideo ? "Video added" : "Video needed"} tone={hasVideo ? "success" : "default"} />
      </View>

      {!editable ? (
        <Card>
          <Text variant="caption" tone="muted">
            Photos can only be changed while a screen is pending or rejected.
          </Text>
        </Card>
      ) : null}

      <View style={styles.grid}>
        {SLOTS.map((slot) => {
          const existing = all.find((photo) => photo.photoType === slot.value);
          const blocked = !slot.isVideo && !existing && atMaxPhotos;
          const busy = busySlot === slot.value;
          return (
            <Pressable
              key={slot.value}
              disabled={busy || (!editable && !existing) || blocked}
              onPress={() => (editable ? setTarget(slot) : existing ? void Linking.openURL(existing.downloadUrl) : undefined)}
              accessibilityRole="button"
              accessibilityLabel={`${slot.label}, ${existing ? "added" : blocked ? "photo limit reached" : "not added"}`}
              style={styles.slot}
            >
              <View
                style={[
                  styles.tile,
                  existing
                    ? { borderColor: colors.success, borderStyle: "solid" }
                    : { borderColor: colors.border, borderStyle: "dashed", backgroundColor: colors.card },
                ]}
              >
                {existing && !slot.isVideo ? <Image source={{ uri: existing.downloadUrl }} style={StyleSheet.absoluteFill} /> : null}
                {busy ? (
                  <ActivityIndicator color={colors.primary} />
                ) : existing ? (
                  <>
                    {slot.isVideo ? <Icon name="video" size={28} color={colors.success} /> : null}
                    <View style={[styles.check, { backgroundColor: colors.success }]}>
                      <Icon name="check" size={14} color="#ffffff" />
                    </View>
                  </>
                ) : (
                  <>
                    <Icon name={slot.isVideo ? "video" : "camera"} size={24} color={colors.mutedForeground} />
                    <Text variant="caption" tone="muted">
                      {blocked ? "Limit reached" : "Tap to add"}
                    </Text>
                  </>
                )}
              </View>
              <Text variant="caption" align="center" numberOfLines={2}>
                {slot.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {atMaxPhotos ? (
        <Text variant="caption" tone="muted">
          You&apos;ve reached the {requirements.maxPhotos}-photo limit. Remove or retake one to change it.
        </Text>
      ) : null}

      {editable ? (
        <>
          <Button title="Submit for review" onPress={() => void submitForReview()} loading={submit.isPending} disabled={!photosMet || !hasVideo} />
          {!photosMet || !hasVideo ? (
            <Text variant="caption" tone="muted" align="center">
              Finish the photos and video above to submit.
            </Text>
          ) : null}
        </>
      ) : null}

      <ActionSheet visible={target !== null} title={target?.label} actions={target ? actionsFor(target) : []} onClose={() => setTarget(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(4), paddingBottom: spacing(10) },
  progress: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2) },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing(3) },
  slot: { width: "30%", flexGrow: 1, gap: spacing(1.5) },
  tile: {
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(1),
    overflow: "hidden",
  },
  check: { position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
});
