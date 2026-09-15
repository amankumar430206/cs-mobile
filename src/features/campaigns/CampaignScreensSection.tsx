import { Alert, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useCampaignBookingsQuery, useCancelBookingMutation, useDisassociateBookingMutation } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import { formatDateRange, type Booking, type BookingStatus } from "@castadi/shared/types";
import { formatINR } from "@/lib/format";
import { toast } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, Section, Skeleton, StatusPill, Text, type Tone } from "@/ui";

const STATUS_TONE: Record<BookingStatus, Tone> = {
  RESERVED: "warning",
  CONFIRMED: "success",
  EXPIRED: "default",
  CANCELLED: "danger",
};

export function CampaignScreensSection({ campaignId, canReserve }: { campaignId: string; canReserve: boolean }) {
  const { colors } = useTheme();
  const bookings = useCampaignBookingsQuery(campaignId);
  const cancelBooking = useCancelBookingMutation(campaignId);
  const disassociate = useDisassociateBookingMutation(campaignId);
  const rows = bookings.data ?? [];

  const confirmRemove = (booking: Booking) => {
    const isReserved = booking.status === "RESERVED";
    Alert.alert(
      isReserved ? "Cancel this reservation?" : "Remove this screen?",
      isReserved ? "The hold on this screen is released." : "The screen is removed from this campaign. Already-paid amounts aren't refunded automatically.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isReserved ? "Cancel reservation" : "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await (isReserved ? cancelBooking : disassociate).mutateAsync(booking.id);
              toast.success(isReserved ? "Reservation cancelled" : "Screen removed");
            } catch {
              // The API client already surfaced the error.
            }
          },
        },
      ]
    );
  };

  return (
    <Section title="Screens" action={canReserve ? { label: "Add screens", onPress: () => router.push("/advertiser/discover/index") } : undefined}>
      {bookings.isPending ? (
        <Skeleton height={140} radius={radii.lg} />
      ) : rows.length === 0 ? (
        <Card>
          <Text variant="caption" tone="muted">
            No screens reserved yet. Browse Discover to add screens to this campaign.
          </Text>
        </Card>
      ) : (
        <Card style={styles.listCard}>
          {rows.map((booking, index) => (
            <View key={booking.id} style={[styles.row, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <View style={styles.rowTop}>
                <Text variant="label" weight="semibold" style={styles.flex} numberOfLines={1}>
                  {formatDateRange(booking.startDate, booking.endDate)}
                </Text>
                <StatusPill label={booking.status.charAt(0) + booking.status.slice(1).toLowerCase()} tone={STATUS_TONE[booking.status]} />
              </View>
              <Text variant="caption" tone="muted">
                {formatINR(booking.totalAmount)}
              </Text>
              {booking.status === "RESERVED" || booking.status === "CONFIRMED" ? (
                <Button
                  title={booking.status === "RESERVED" ? "Cancel reservation" : "Remove screen"}
                  variant="ghost"
                  style={styles.removeButton}
                  onPress={() => confirmRemove(booking)}
                />
              ) : null}
            </View>
          ))}
        </Card>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  listCard: { padding: 0, gap: 0, overflow: "hidden" },
  row: { paddingHorizontal: spacing(4), paddingVertical: spacing(3), gap: spacing(1) },
  rowTop: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  flex: { flex: 1 },
  removeButton: { alignSelf: "flex-start", minHeight: 32, paddingHorizontal: 0, marginTop: 2 },
});
