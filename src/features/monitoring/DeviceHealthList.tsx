import { useState, type ReactElement } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useMyDeviceHealthQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import type { MyScreenHealth } from "@castadi/shared/types";
import { openScreenDetail } from "@/features/screens/screenStatus";
import { formatRelativeTime, formatStorage } from "@/lib/format";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useTheme } from "@/theme/ThemeProvider";
import { Card, FilterChips, Icon, LiveIndicator, Pager, SearchField, Skeleton, Text } from "@/ui";

type StatusFilter = "all" | "ONLINE" | "OFFLINE";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ONLINE", label: "Online" },
  { value: "OFFLINE", label: "Offline" },
];

// Same thresholds as cs-web's device monitoring page.
const LOW_BATTERY_THRESHOLD = 20;
const LOW_STORAGE_MB_THRESHOLD = 500;

export function DeviceHealthList({ header }: { header: ReactElement }) {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const health = useMyDeviceHealthQuery({
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
    page,
  });
  const rows = health.data?.rows ?? [];
  const hasFilters = status !== "all" || debouncedSearch.length > 0;

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => row.screenId}
      renderItem={({ item }) => <DeviceHealthRow row={item} />}
      ItemSeparatorComponent={Gap}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          {header}
          <SearchField
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search by screen name or city"
          />
          <FilterChips
            options={STATUS_FILTERS}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
        </View>
      }
      ListEmptyComponent={
        health.isPending ? (
          <View style={styles.skeletons}>
            <Skeleton height={96} radius={radii.lg} />
            <Skeleton height={96} radius={radii.lg} />
          </View>
        ) : (
          <Card>
            <Text variant="label">{hasFilters ? "No matching screens" : "No active screens yet"}</Text>
            <Text variant="caption" tone="muted">
              {hasFilters ? "Try a different search or status filter." : "Device status shows up here once a screen has been approved."}
            </Text>
          </Card>
        )
      }
      ListFooterComponent={
        health.data ? (
          <View style={styles.footer}>
            <Pager page={health.data.meta.page} limit={health.data.meta.limit} total={health.data.meta.total} onPageChange={setPage} />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={health.isRefetching} onRefresh={() => void health.refetch()} tintColor={colors.primary} colors={[colors.primary]} />
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.content}
    />
  );
}

function DeviceHealthRow({ row }: { row: MyScreenHealth }) {
  const { colors } = useTheme();
  const online = row.status === "ONLINE";
  const score = Math.max(0, Math.min(100, Math.round(row.healthScore)));
  const scoreColor = score >= 80 ? colors.success : score >= 50 ? colors.warning : colors.danger;
  const report = row.health;
  const lowBattery = report?.batteryLevel != null && report.batteryLevel <= LOW_BATTERY_THRESHOLD;
  const lowStorage = report?.storageAvailableMb != null && report.storageAvailableMb <= LOW_STORAGE_MB_THRESHOLD;

  return (
    <Pressable
      onPress={() => router.push(openScreenDetail(row.screenId))}
      accessibilityRole="button"
      accessibilityLabel={`${row.screenName}, ${online ? "online" : "offline"}, health ${score} out of 100`}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.muted : colors.card, borderColor: colors.border }]}
    >
      <View style={styles.rowTop}>
        <View style={styles.flex}>
          <Text variant="label" weight="semibold" numberOfLines={1}>
            {row.screenName}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {row.city}, {row.state} · {row.lastHeartbeatAt ? `seen ${formatRelativeTime(row.lastHeartbeatAt)}` : "never connected"}
          </Text>
        </View>
        <LiveIndicator live={online} liveLabel="Online" />
      </View>

      <View style={styles.scoreRow}>
        <View style={[styles.scoreTrack, { backgroundColor: colors.muted }]}>
          <View style={[styles.scoreFill, { width: `${score}%`, backgroundColor: scoreColor }]} />
        </View>
        <Text variant="caption" weight="semibold" style={styles.scoreText}>
          {score}/100
        </Text>
      </View>

      {report ? (
        <View style={styles.telemetry}>
          {report.batteryLevel != null ? (
            <Metric icon="battery" text={`${report.batteryLevel}%`} alert={lowBattery} />
          ) : null}
          {report.storageAvailableMb != null ? (
            <Metric icon="storage" text={formatStorage(report.storageAvailableMb)} alert={lowStorage} />
          ) : null}
          {report.networkType ? (
            <Metric icon={report.networkType === "OFFLINE" ? "wifiOff" : "wifi"} text={report.networkType} alert={false} />
          ) : null}
          {report.appVersion ? (
            <Text variant="caption" tone="muted">
              v{report.appVersion}
            </Text>
          ) : null}
          {report.playbackErrorCount ? (
            <Text variant="caption" weight="semibold" tone="danger">
              {report.playbackErrorCount} playback errors
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

function Metric({ icon, text, alert }: { icon: "battery" | "storage" | "wifi" | "wifiOff"; text: string; alert: boolean }) {
  const { colors } = useTheme();
  const color = alert ? colors.danger : colors.mutedForeground;
  return (
    <View style={styles.metric}>
      <Icon name={icon} size={13} color={color} />
      <Text variant="caption" weight={alert ? "semibold" : undefined} style={{ color }}>
        {text}
      </Text>
    </View>
  );
}

function Gap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing(5), paddingBottom: spacing(10) },
  listHeader: { gap: spacing(3), marginBottom: spacing(3) },
  skeletons: { gap: spacing(2) },
  gap: { height: spacing(2) },
  footer: { marginTop: spacing(4) },
  row: { borderWidth: 1, borderRadius: radii.lg, padding: spacing(3.5), gap: spacing(2.5) },
  rowTop: { flexDirection: "row", alignItems: "center", gap: spacing(3) },
  flex: { flex: 1, gap: 2 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: spacing(3) },
  scoreTrack: { flex: 1, height: 6, borderRadius: radii.full, overflow: "hidden" },
  scoreFill: { height: 6, borderRadius: radii.full },
  scoreText: { fontVariant: ["tabular-nums"], minWidth: 48, textAlign: "right" },
  telemetry: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: spacing(3), rowGap: spacing(1) },
  metric: { flexDirection: "row", alignItems: "center", gap: 3 },
});
