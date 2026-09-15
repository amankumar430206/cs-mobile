import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useRevokeDeviceMutation } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import type { Screen } from "@castadi/shared/types";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { toast } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, DetailRow, Icon, LiveIndicator, Text } from "@/ui";
import { LinkDeviceSheet } from "./LinkDeviceSheet";

export function DeviceCard({ screen }: { screen: Screen }) {
  const { colors } = useTheme();
  const revoke = useRevokeDeviceMutation(screen.id);
  const [linking, setLinking] = useState(false);
  // deviceId exists for every ACTIVE screen; a heartbeat is what proves a physical device ever connected.
  const hasConnected = !!screen.lastHeartbeatAt;

  const confirmRevoke = () => {
    Alert.alert(
      "Disassociate this device?",
      "Its credentials stop working immediately. It won't sync or play until it's activated again with a fresh code. The screen listing stays active and bookable.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disassociate",
          style: "destructive",
          onPress: async () => {
            try {
              await revoke.mutateAsync();
              toast.success("Device disassociated. It needs a fresh activation code to reconnect.");
            } catch {
              // The API client already surfaced the error.
            }
          },
        },
      ]
    );
  };

  return (
    <Card>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: screen.isLive ? `${colors.success}1F` : colors.muted }]}>
          <Icon name={screen.isLive ? "wifi" : "wifiOff"} size={20} color={screen.isLive ? colors.success : colors.mutedForeground} />
        </View>
        <View style={styles.headerText}>
          <Text variant="heading">Ad Player device</Text>
          <LiveIndicator live={screen.isLive} liveLabel="Online" />
        </View>
      </View>

      {hasConnected && screen.lastHeartbeatAt ? (
        <>
          <DetailRow label="Device ID" value={screen.deviceId} />
          <DetailRow label="Reported model" value={screen.deviceModel ?? "Not reported yet"} />
          <DetailRow
            label="Last heartbeat"
            value={`${formatRelativeTime(screen.lastHeartbeatAt)} (${formatDateTime(screen.lastHeartbeatAt)})`}
          />
        </>
      ) : (
        <Text variant="caption" tone="muted">
          No device has connected yet. Open the CASTADI Ad Player app on the display and enter the 6-digit code it shows.
        </Text>
      )}

      <View style={styles.actions}>
        <Button title={hasConnected ? "Link a different device" : "Link device with code"} onPress={() => setLinking(true)} />
        {hasConnected ? (
          <Button title="Disassociate device" variant="secondary" onPress={confirmRevoke} loading={revoke.isPending} />
        ) : null}
      </View>

      <LinkDeviceSheet screenId={screen.id} visible={linking} onClose={() => setLinking(false)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing(3) },
  iconWrap: { width: 44, height: 44, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1, gap: 2 },
  actions: { gap: spacing(2), marginTop: spacing(1) },
});
