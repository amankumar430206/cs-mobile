import { useState, type ReactElement } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useMyPlaybackLogsQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import type { PlaybackLogEntry } from "@castadi/shared/types";
import { formatDateTime, formatDuration } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { Card, FilterChips, Pager, Skeleton, StatusPill, Text, type Tone } from "@/ui";

const STATUS_TONE: Record<PlaybackLogEntry["status"], Tone> = {
  COMPLETED: "success",
  INTERRUPTED: "warning",
  FAILED: "danger",
};

const STATUS_LABEL: Record<PlaybackLogEntry["status"], string> = {
  COMPLETED: "Completed",
  INTERRUPTED: "Interrupted",
  FAILED: "Failed",
};

export function PlaybackLogList({ header }: { header: ReactElement }) {
  const { colors } = useTheme();
  const [screenId, setScreenId] = useState("all");
  const [page, setPage] = useState(1);

  const logs = useMyPlaybackLogsQuery({ screenId: screenId === "all" ? undefined : screenId, page });
  const rows = logs.data?.rows ?? [];
  const screens = logs.data?.meta.screens ?? [];
  const screenNames = new Map(screens.map((screen) => [screen.id, screen.screenName]));
  const screenOptions = [{ value: "all", label: "All screens" }, ...screens.map((screen) => ({ value: screen.id, label: screen.screenName }))];

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => row.id}
      renderItem={({ item }) => <PlaybackRow entry={item} screenName={screenNames.get(item.screenId)} />}
      ItemSeparatorComponent={Gap}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          {header}
          {screens.length > 1 ? (
            <FilterChips
              options={screenOptions}
              value={screenId}
              onChange={(value) => {
                setScreenId(value);
                setPage(1);
              }}
            />
          ) : null}
        </View>
      }
      ListEmptyComponent={
        logs.isPending ? (
          <View style={styles.skeletons}>
            <Skeleton height={72} radius={radii.lg} />
            <Skeleton height={72} radius={radii.lg} />
            <Skeleton height={72} radius={radii.lg} />
          </View>
        ) : (
          <Card>
            <Text variant="label">No plays yet</Text>
            <Text variant="caption" tone="muted">
              Every ad your screens play is logged here as proof of play.
            </Text>
          </Card>
        )
      }
      ListFooterComponent={
        logs.data ? (
          <View style={styles.footer}>
            <Pager page={logs.data.meta.page} limit={logs.data.meta.limit} total={logs.data.meta.total} onPageChange={setPage} />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={logs.isRefetching} onRefresh={() => void logs.refetch()} tintColor={colors.primary} colors={[colors.primary]} />
      }
      contentContainerStyle={styles.content}
    />
  );
}

function PlaybackRow({ entry, screenName }: { entry: PlaybackLogEntry; screenName?: string }) {
  const { colors } = useTheme();
  const seconds = entry.endedAt ? (new Date(entry.endedAt).getTime() - new Date(entry.startedAt).getTime()) / 1000 : null;

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.rowTop}>
        <Text variant="label" weight="semibold" numberOfLines={1} style={styles.flex}>
          {entry.campaignName ?? "Your own ad"}
        </Text>
        <StatusPill label={STATUS_LABEL[entry.status]} tone={STATUS_TONE[entry.status]} />
      </View>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {[screenName, formatDateTime(entry.startedAt), seconds !== null ? formatDuration(seconds) : null].filter(Boolean).join(" · ")}
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
  row: { borderWidth: 1, borderRadius: radii.lg, padding: spacing(3.5), gap: spacing(1) },
  rowTop: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  flex: { flex: 1 },
});
