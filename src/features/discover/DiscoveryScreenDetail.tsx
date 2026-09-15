import { useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCategoriesQuery, useCreateBookingMutation, useMyCampaignsQuery, useScreenAvailabilityQuery, useScreenQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import { formatINR } from "@/lib/format";
import { toast } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { ActionSheet, Button, Card, DetailRow, LiveIndicator, Screen, Skeleton, StatusView, Text, type SheetAction } from "@/ui";

export function DiscoveryScreenDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const screen = useScreenQuery(id ?? "");
  const categories = useCategoriesQuery();
  const availability = useScreenAvailabilityQuery(id ?? "");
  const campaigns = useMyCampaignsQuery();
  const createBooking = useCreateBookingMutation();
  const { colors } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (screen.isError) {
    return (
      <StatusView title="Couldn't load this screen" message="Check your connection and try again.">
        <Button title="Try again" onPress={() => screen.refetch()} />
      </StatusView>
    );
  }
  if (!screen.data) {
    return (
      <Screen contentStyle={styles.content}>
        <Skeleton height={200} radius={radii.lg} />
        <Skeleton height={140} radius={radii.lg} />
      </Screen>
    );
  }

  const data = screen.data;
  const category = categories.data?.find((item) => item.id === data.categoryId)?.label ?? "Screen";
  const eligible = (campaigns.data ?? []).filter((campaign) => campaign.status === "DRAFT" || campaign.status === "PENDING_PAYMENT");

  const reserve = async (campaignId: string) => {
    const campaign = eligible.find((item) => item.id === campaignId);
    if (!campaign) return;
    try {
      await createBooking.mutateAsync({ campaignId, screenIds: [data.id], startDate: campaign.startDate, endDate: campaign.endDate });
      toast.success(`Reserved for "${campaign.name}"`);
    } catch {
      // The API client already surfaced the error.
    }
  };

  const campaignActions: SheetAction[] = eligible.map((campaign) => ({
    key: campaign.id,
    label: `${campaign.name} (${campaign.startDate.slice(0, 10)} – ${campaign.endDate.slice(0, 10)})`,
    icon: "megaphone",
    onPress: () => void reserve(campaign.id),
  }));

  return (
    <Screen contentStyle={styles.content}>
      <Stack.Screen options={{ title: data.screenName }} />

      {data.photos.length > 0 ? (
        <FlatList
          horizontal
          data={data.photos}
          keyExtractor={(photo) => photo.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <Image source={{ uri: item.downloadUrl }} style={[styles.photo, { backgroundColor: colors.muted }]} />}
          contentContainerStyle={styles.photoRow}
        />
      ) : null}

      <Card>
        <View style={styles.topRow}>
          <Text variant="title" style={styles.flex} numberOfLines={2}>
            {data.screenName}
          </Text>
          <LiveIndicator live={data.isLive} />
        </View>
        <Text tone="muted">
          {category} · {data.screenSize} · {data.resolution}
        </Text>
        <DetailRow label="Price" value={`${formatINR(data.pricePerDay)}/day`} />
        <DetailRow label="Location" value={`${data.city}, ${data.state}`} />
        <DetailRow label="Operating hours" value={`${data.operatingHoursStart} – ${data.operatingHoursEnd}`} />
        <DetailRow label="Environment" value={data.installationEnvironment === "OUTDOOR" ? "Outdoor" : data.installationEnvironment === "INDOOR" ? "Indoor" : undefined} />
        <DetailRow label="Daily footfall" value={data.dailyFootfall != null ? data.dailyFootfall.toLocaleString("en-IN") : undefined} />
        <DetailRow label="Est. daily impressions" value={data.estimatedDailyImpressions != null ? data.estimatedDailyImpressions.toLocaleString("en-IN") : undefined} />
        <Button
          title={eligible.length === 0 ? "No eligible campaign — create one on the web" : "Add to a campaign"}
          onPress={() => setPickerOpen(true)}
          disabled={eligible.length === 0 || createBooking.isPending}
          loading={createBooking.isPending}
        />
      </Card>

      {availability.data && availability.data.entries.length > 0 ? (
        <Card>
          <Text variant="heading">Upcoming reservations</Text>
          {availability.data.entries.map((entry, index) => (
            <View key={index} style={styles.availabilityRow}>
              <Text variant="caption">
                {entry.startDate.slice(0, 10)} – {entry.endDate.slice(0, 10)}
              </Text>
              <Text variant="caption" tone="muted">
                {entry.status}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      <ActionSheet visible={pickerOpen} title="Choose a campaign" actions={campaignActions} onClose={() => setPickerOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(4), paddingBottom: spacing(10) },
  photoRow: { gap: spacing(2) },
  photo: { width: 260, height: 160, borderRadius: radii.lg },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing(3) },
  flex: { flex: 1 },
  availabilityRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing(1) },
});
