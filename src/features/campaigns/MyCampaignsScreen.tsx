import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMyCampaignsListQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import type { CampaignStatus } from "@castadi/shared/types";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, FilterChips, SearchField, Skeleton, Text } from "@/ui";
import { CampaignRow } from "./CampaignRow";
import { openCampaignDetail } from "./campaignStatus";

type Filter = "all" | "live" | CampaignStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live now" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_PAYMENT", label: "Awaiting payment" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "ACTIVE", label: "Active" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function MyCampaignsScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const filters = useMemo(
    () => ({
      status: filter === "all" || filter === "live" ? undefined : filter,
      live: filter === "live" || undefined,
      search: debouncedSearch || undefined,
    }),
    [filter, debouncedSearch]
  );

  const list = useMyCampaignsListQuery(filters);
  const campaigns = list.data?.pages.flatMap((page) => page.rows) ?? [];
  const total = list.data?.pages[0]?.meta.total ?? 0;
  const hasFilters = filter !== "all" || debouncedSearch.length > 0;

  return (
    <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: colors.background }]}>
      <FlatList
        data={campaigns}
        keyExtractor={(campaign) => campaign.id}
        renderItem={({ item }) => <CampaignRow campaign={item} onPress={() => router.push(openCampaignDetail(item.id))} />}
        ItemSeparatorComponent={Gap}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="title" accessibilityRole="header">
              Campaigns
            </Text>
            <SearchField value={search} onChangeText={setSearch} placeholder="Search campaigns" />
            <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
            {list.data && campaigns.length > 0 ? (
              <Text variant="caption" tone="muted">
                {campaigns.length} of {total} {total === 1 ? "campaign" : "campaigns"}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          list.isPending ? (
            <View style={styles.skeletons}>
              <Skeleton height={92} radius={radii.lg} />
              <Skeleton height={92} radius={radii.lg} />
            </View>
          ) : hasFilters ? (
            <Card>
              <Text variant="label">No matching campaigns</Text>
              <Text variant="caption" tone="muted">
                Try a different search or filter.
              </Text>
              <Button
                title="Clear filters"
                variant="secondary"
                onPress={() => {
                  setSearch("");
                  setFilter("all");
                }}
              />
            </Card>
          ) : (
            <Card>
              <Text variant="label">No campaigns yet</Text>
              <Text variant="caption" tone="muted">
                Create a campaign from the CASTADI web dashboard, then reserve screens for it from Discover here.
              </Text>
            </Card>
          )
        }
        ListFooterComponent={list.isFetchingNextPage ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null}
        onEndReached={() => {
          if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={list.isRefetching && !list.isFetchingNextPage} onRefresh={() => void list.refetch()} tintColor={colors.primary} colors={[colors.primary]} />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

function Gap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, padding: spacing(5), paddingBottom: spacing(10) },
  header: { gap: spacing(3), marginBottom: spacing(3) },
  skeletons: { gap: spacing(2) },
  gap: { height: spacing(2) },
  footer: { paddingVertical: spacing(4) },
});
