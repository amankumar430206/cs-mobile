import { useState } from "react";
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  useActivateScreenMutation,
  useCategoriesQuery,
  useDeactivateScreenMutation,
  useDeleteScreenMutation,
  useMyScreenQuery,
  usePhotosQuery,
} from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import {
  EDITABLE_SCREEN_STATUSES,
  INSTALLATION_ENVIRONMENTS,
  INTERNET_TYPES,
  PHOTO_TYPES,
  REVENUE_MODELS,
  VIDEO_PHOTO_TYPE,
  type Screen as ScreenDto,
} from "@castadi/shared/types";
import { formatINR } from "@/lib/format";
import { toast } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, DetailRow, Icon, LiveIndicator, Screen, Section, Skeleton, StatusPill, StatusView, Text } from "@/ui";
import { DeviceCard } from "./DeviceCard";
import { canManageMedia, editScreenRoute, SCREEN_STATUS, screenMediaRoute } from "./screenStatus";

const labelOf = (options: readonly { value: string; label: string }[], value: string | null) =>
  value ? (options.find((option) => option.value === value)?.label ?? value) : null;

export function ScreenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const screen = useMyScreenQuery(id ?? "");
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ["screens"] });
    } finally {
      setRefreshing(false);
    }
  };

  if (screen.isError) {
    return (
      <StatusView title="Couldn't load this screen" message="Check your connection and try again.">
        <Button title="Try again" onPress={() => screen.refetch()} />
      </StatusView>
    );
  }

  return (
    <Screen edges={["bottom"]} onRefresh={refresh} refreshing={refreshing} contentStyle={styles.content}>
      <Stack.Screen options={{ title: screen.data?.screenName ?? "Screen" }} />
      {!screen.data ? (
        <>
          <Skeleton height={150} radius={radii.lg} />
          <Skeleton height={220} radius={radii.lg} />
        </>
      ) : (
        <ScreenDetail screen={screen.data} />
      )}
    </Screen>
  );
}

function ScreenDetail({ screen }: { screen: ScreenDto }) {
  const categories = useCategoriesQuery();
  const activate = useActivateScreenMutation();
  const deactivate = useDeactivateScreenMutation();
  const remove = useDeleteScreenMutation();

  const status = SCREEN_STATUS[screen.verificationStatus];
  const isActive = screen.verificationStatus === "ACTIVE";
  const mediaEditable = canManageMedia(screen.verificationStatus);
  const detailsEditable = EDITABLE_SCREEN_STATUSES.includes(screen.verificationStatus);
  const category = categories.data?.find((item) => item.id === screen.categoryId)?.label;

  const setListed = (next: boolean) => {
    if (next) {
      activate.mutate(screen.id);
      return;
    }
    Alert.alert("Hide from advertisers?", "The screen stays approved, but advertisers can't find or book it until you show it again.", [
      { text: "Cancel", style: "cancel" },
      { text: "Hide", style: "destructive", onPress: () => deactivate.mutate(screen.id) },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      `Delete "${screen.screenName}"?`,
      "This can't be undone. Screens with any booking history can't be deleted — hide the screen instead.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await remove.mutateAsync(screen.id);
              toast.success("Screen deleted");
              router.back();
            } catch {
              // The API client already surfaced the error.
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Card>
        <View style={styles.summaryTop}>
          <StatusPill label={status.label} tone={status.tone} />
          {isActive ? <LiveIndicator live={screen.isLive} /> : null}
        </View>
        <Text variant="title">{screen.screenName}</Text>
        <Text tone="muted">
          {screen.city}, {screen.state} · {formatINR(screen.pricePerDay)}/day
        </Text>
        {screen.verificationStatus === "UNDER_REVIEW" ? (
          <Text variant="caption" tone="muted">
            Under review — we&apos;ll notify you once it&apos;s decided.
          </Text>
        ) : null}
        {screen.verificationStatus === "REJECTED" && screen.rejectionReason ? (
          <Text variant="caption" tone="danger">
            Rejected: {screen.rejectionReason}
          </Text>
        ) : null}
        {mediaEditable ? (
          <Text variant="caption" tone="primary" weight="semibold">
            Next: add photos and an installation video, then submit for review.
          </Text>
        ) : null}
        {mediaEditable || detailsEditable ? (
          <View style={styles.summaryActions}>
            {mediaEditable ? <Button title="Add photos & submit" onPress={() => router.push(screenMediaRoute(screen.id))} /> : null}
            {detailsEditable ? (
              <Button title="Edit details" variant="secondary" onPress={() => router.push(editScreenRoute(screen.id))} />
            ) : null}
          </View>
        ) : null}
      </Card>

      <PhotosSection screenId={screen.id} />

      {isActive ? (
        <Section title="Device">
          <DeviceCard screen={screen} />
        </Section>
      ) : null}

      {isActive ? (
        <Section title="Listing">
          <Card>
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text variant="label" weight="semibold">
                  Visible to advertisers
                </Text>
                <Text variant="caption" tone="muted">
                  {screen.isListed ? "Advertisers can find and book this screen." : "Hidden from search and bookings."}
                </Text>
              </View>
              <ThemedSwitch
                value={screen.isListed}
                onChange={setListed}
                disabled={activate.isPending || deactivate.isPending}
                label="Visible to advertisers"
              />
            </View>
          </Card>
        </Section>
      ) : null}

      <Section title="Details">
        <Card>
          <DetailRow label="Category" value={category} />
          <DetailRow label="Address" value={screen.installationAddress} />
          <DetailRow label="Screen size" value={screen.screenSize} />
          <DetailRow label="Resolution" value={screen.resolution} />
          <DetailRow label="Operating hours" value={`${screen.operatingHoursStart} – ${screen.operatingHoursEnd}`} />
          <DetailRow label="Internet" value={labelOf(INTERNET_TYPES, screen.internetType)} />
          <DetailRow label="Environment" value={labelOf(INSTALLATION_ENVIRONMENTS, screen.installationEnvironment)} />
          <DetailRow label="Daily footfall" value={screen.dailyFootfall != null ? screen.dailyFootfall.toLocaleString("en-IN") : null} />
          <DetailRow
            label="Est. daily impressions"
            value={screen.estimatedDailyImpressions != null ? screen.estimatedDailyImpressions.toLocaleString("en-IN") : null}
          />
          <DetailRow label="Ad capacity" value={String(screen.maxAdCapacity)} />
          <DetailRow label="Revenue model" value={labelOf(REVENUE_MODELS, screen.revenueModel)} />
          <DetailRow label="Device serial" value={screen.deviceSerialNumber} />
        </Card>
        {screen.locationUrl ? (
          <Button title="Open in maps" variant="secondary" onPress={() => void Linking.openURL(screen.locationUrl!)} />
        ) : null}
      </Section>

      <Button title="Delete screen" variant="danger" onPress={confirmDelete} loading={remove.isPending} />
    </>
  );
}

function PhotosSection({ screenId }: { screenId: string }) {
  const { colors } = useTheme();
  const photos = usePhotosQuery(screenId);
  const stills = (photos.data ?? []).filter((photo) => photo.photoType !== VIDEO_PHOTO_TYPE);
  const video = photos.data?.find((photo) => photo.photoType === VIDEO_PHOTO_TYPE);

  return (
    <Section title="Photos & video">
      {photos.isPending ? (
        <Skeleton height={110} radius={radii.lg} />
      ) : stills.length === 0 && !video ? (
        <Card>
          <Text variant="caption" tone="muted">
            No photos uploaded yet.
          </Text>
        </Card>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
            {stills.map((photo) => (
              <Pressable
                key={photo.id}
                onPress={() => void Linking.openURL(photo.downloadUrl)}
                accessibilityRole="imagebutton"
                accessibilityLabel={labelOf(PHOTO_TYPES, photo.photoType) ?? "Screen photo"}
                style={styles.photoItem}
              >
                <Image source={{ uri: photo.downloadUrl }} style={[styles.photo, { backgroundColor: colors.muted }]} />
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {labelOf(PHOTO_TYPES, photo.photoType)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          {video ? (
            <Pressable
              onPress={() => void Linking.openURL(video.downloadUrl)}
              accessibilityRole="button"
              style={[styles.videoRow, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Icon name="video" size={18} color={colors.foreground} />
              <Text variant="label" style={styles.flex}>
                Installation video
              </Text>
              <Icon name="chevronRight" size={14} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </>
      )}
    </Section>
  );
}

function ThemedSwitch({ value, onChange, disabled, label }: { value: boolean; onChange: (next: boolean) => void; disabled: boolean; label: string }) {
  const { colors } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{ true: colors.primary, false: colors.border }}
      thumbColor="#ffffff"
      accessibilityLabel={label}
    />
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(5), paddingBottom: spacing(10) },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: spacing(3) },
  summaryActions: { gap: spacing(2), marginTop: spacing(1) },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing(3) },
  switchText: { flex: 1, gap: 2 },
  photos: { gap: spacing(3) },
  photoItem: { width: 140, gap: spacing(1) },
  photo: { width: 140, height: 100, borderRadius: radii.md },
  videoRow: { flexDirection: "row", alignItems: "center", gap: spacing(3), borderWidth: 1, borderRadius: radii.lg, padding: spacing(3.5) },
  flex: { flex: 1 },
});
