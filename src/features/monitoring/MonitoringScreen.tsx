import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { FilterChips, Text } from "@/ui";
import { DeviceHealthList } from "./DeviceHealthList";
import { PlaybackLogList } from "./PlaybackLogList";

type View_ = "devices" | "playback";

const VIEWS: { value: View_; label: string }[] = [
  { value: "devices", label: "Device health" },
  { value: "playback", label: "Playback logs" },
];

export function MonitoringScreen() {
  const { colors } = useTheme();
  const [view, setView] = useState<View_>("devices");

  const header = (
    <View style={styles.header}>
      <View>
        <Text variant="title" accessibilityRole="header">
          Monitoring
        </Text>
        <Text tone="muted">{view === "devices" ? "Online status and health, refreshed every 30 seconds." : "Every ad play across your screens."}</Text>
      </View>
      <FilterChips options={VIEWS} value={view} onChange={setView} />
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: colors.background }]}>
      {view === "devices" ? <DeviceHealthList header={header} /> : <PlaybackLogList header={header} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { gap: spacing(3), marginBottom: spacing(3) },
});
