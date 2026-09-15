import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBookingMutation, useMyCampaignsQuery, usePriceEstimateQuery, useScreenQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import { getTodayIST, isCampaignReservable } from "@castadi/shared/types";
import { openCampaignDetail } from "@/features/campaigns/campaignStatus";
import { formatINR } from "@/lib/format";
import { toast } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, DateField, DetailRow, PickerField, Screen, Skeleton, StatusView, Text } from "@/ui";

const reserveSchema = z
  .object({
    campaignId: z.string().min(1, "Choose a campaign"),
    startDate: z.string().min(1, "Pick a start date"),
    endDate: z.string().min(1, "Pick an end date"),
  })
  .refine((values) => values.endDate >= values.startDate, { message: "End date must be on or after the start date.", path: ["endDate"] });

type ReserveForm = z.infer<typeof reserveSchema>;

const day = (value: string) => value.slice(0, 10);
const toLocalDate = (value: string) => {
  const [y, m, d] = day(value).split("-").map(Number);
  return new Date(y, m - 1, d);
};

export function ReserveScreen() {
  const { screenId, campaignId: presetCampaignId } = useLocalSearchParams<{ screenId: string; campaignId?: string }>();
  const { colors } = useTheme();
  const screen = useScreenQuery(screenId ?? "");
  const campaigns = useMyCampaignsQuery();
  const createBooking = useCreateBookingMutation();

  const reservable = useMemo(() => (campaigns.data ?? []).filter((campaign) => isCampaignReservable(campaign.status) && day(campaign.endDate) >= getTodayIST()), [campaigns.data]);
  const options = reservable.map((campaign) => ({ value: campaign.id, label: campaign.name }));

  const { control, handleSubmit, setValue, setError } = useForm<ReserveForm>({
    resolver: zodResolver(reserveSchema),
    defaultValues: { campaignId: presetCampaignId ?? "", startDate: "", endDate: "" },
  });
  const [campaignId, startDate, endDate] = useWatch({ control, name: ["campaignId", "startDate", "endDate"] });
  const campaign = reservable.find((item) => item.id === campaignId);

  // Picking a campaign resets the dates to its flight (from today at the earliest) — reservations must fall inside it.
  useEffect(() => {
    if (!campaign) return;
    const today = getTodayIST();
    setValue("startDate", day(campaign.startDate) > today ? day(campaign.startDate) : today);
    setValue("endDate", day(campaign.endDate));
  }, [campaign, setValue]);

  const datesValid = !!campaign && !!startDate && !!endDate && endDate >= startDate;
  const estimate = usePriceEstimateQuery(datesValid && screenId ? [screenId] : [], startDate, endDate);

  if (screen.isError || campaigns.isError) {
    return (
      <StatusView title="Couldn't load reservation details" message="Check your connection and try again.">
        <Button
          title="Try again"
          onPress={() => {
            void screen.refetch();
            void campaigns.refetch();
          }}
        />
      </StatusView>
    );
  }
  if (!screen.data || !campaigns.data) {
    return (
      <Screen contentStyle={styles.content}>
        <Skeleton height={90} radius={radii.lg} />
        <Skeleton height={220} radius={radii.lg} />
      </Screen>
    );
  }

  if (reservable.length === 0) {
    return (
      <StatusView title="No campaign to reserve for" message="Screens are reserved for a draft, unpaid or active campaign that hasn't ended.">
        <Button title="Create a campaign" onPress={() => router.replace("/advertiser/campaigns/new")} />
      </StatusView>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!campaign) return;
    if (values.startDate < day(campaign.startDate) || values.endDate > day(campaign.endDate)) {
      setError("endDate", { message: `Dates must fall within the campaign (${day(campaign.startDate)} – ${day(campaign.endDate)}).` });
      return;
    }
    try {
      const result = await createBooking.mutateAsync({ campaignId: values.campaignId, screenIds: [screen.data.id], startDate: values.startDate, endDate: values.endDate });
      const heldUntil = result.bookings[0]?.reservedUntil;
      toast.success(heldUntil ? `Reserved — held until ${new Date(heldUntil).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : "Screen reserved");
      router.dismissTo(openCampaignDetail(values.campaignId));
    } catch {
      // The API client already surfaced the error.
    }
  });

  const breakdown = estimate.data;

  return (
    <Screen edges={["bottom"]} contentStyle={styles.content}>
      <Card>
        <Text variant="heading" numberOfLines={2}>
          {screen.data.screenName}
        </Text>
        <Text variant="caption" tone="muted">
          {screen.data.city} · {formatINR(screen.data.pricePerDay)}/day · full-day rotation
        </Text>
      </Card>

      <Card>
        <PickerField control={control} name="campaignId" label="Campaign" options={options} placeholder="Choose a campaign" />
        {campaign ? (
          <>
            <Text variant="caption" tone="muted">
              Campaign runs {day(campaign.startDate)} – {day(campaign.endDate)}
            </Text>
            <DateField control={control} name="startDate" label="From" minimumDate={toLocalDate(campaign.startDate)} maximumDate={toLocalDate(campaign.endDate)} />
            <DateField control={control} name="endDate" label="To" minimumDate={startDate ? toLocalDate(startDate) : toLocalDate(campaign.startDate)} maximumDate={toLocalDate(campaign.endDate)} />
          </>
        ) : null}
      </Card>

      {datesValid ? (
        <Card>
          <Text variant="heading">Price estimate</Text>
          {estimate.isPending ? (
            <Skeleton height={96} radius={radii.md} />
          ) : breakdown ? (
            <>
              <DetailRow label={`Screen (${breakdown.days} ${breakdown.days === 1 ? "day" : "days"})`} value={formatINR(breakdown.subtotal)} />
              <DetailRow label="Platform charge" value={formatINR(breakdown.platformCharge)} />
              <DetailRow label="Tax" value={formatINR(breakdown.taxAmount)} />
              <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text variant="label" weight="semibold">
                  Total
                </Text>
                <Text variant="heading">{formatINR(breakdown.totalAmount)}</Text>
              </View>
            </>
          ) : (
            <Text variant="caption" tone="muted">
              Couldn&apos;t estimate the price for these dates.
            </Text>
          )}
        </Card>
      ) : null}

      <Text variant="caption" tone="muted">
        Reserving holds the screen for a short time. Pay from the campaign page before the hold expires to confirm it.
      </Text>
      <Button title="Reserve screen" onPress={onSubmit} loading={createBooking.isPending} disabled={!datesValid} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(4), paddingBottom: spacing(10) },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing(2), marginTop: spacing(1) },
});
