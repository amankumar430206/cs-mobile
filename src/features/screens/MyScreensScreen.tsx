import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMeQuery, useMyScreensListQuery, usePartnerStatsQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import type { ScreenVerificationStatus } from "@castadi/shared/types";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, FilterChips, SearchField, Skeleton, Text } from "@/ui";
import { ScreenRow } from "./ScreenRow";
import { openScreenDetail } from "./screenStatus";

type Filter = "all" | "live" | ScreenVerificationStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live now" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "REJECTED", label: "Rejected" },
];

export function MyScreensScreen() {
  const { colors } = useTheme();
  const { data: user } = useMeQuery();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const kycApproved = user?.screenPartner?.kyc_status === "APPROVED";

  const filters = useMemo(
    () => ({
      status: filter === "all" || filter === "live" ? undefined : filter,
      live: filter === "live" || undefined,
      search: debouncedSearch || undefined,
    }),
    [filter, debouncedSearch]
  );

  const list = useMyScreensListQuery(filters);
  const stats = usePartnerStatsQuery();
  const screens = list.data?.pages.flatMap((page) => page.rows) ?? [];
  const total = list.data?.pages[0]?.meta.total ?? 0;
  const hasFilters = filter !== "all" || debouncedSearch.length > 0;

  const refresh = () => {
    void list.refetch();
    void stats.refetch();
  };

  const registerNew = () => router.push(kycApproved ? "/partner/screens/new" : "/partner/account/kyc");

  return (
    <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: colors.background }]}>
      <FlatList
        data={screens}
        keyExtractor={(screen) => screen.id}
        renderItem={({ item }) => <ScreenRow screen={item} onPress={() => router.push(openScreenDetail(item.id))} />}
        ItemSeparatorComponent={Gap}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.flex}>
                <Text variant="title" accessibilityRole="header">
                  Screens
                </Text>
                <Text tone="muted">
                  {stats.data
                    ? `${stats.data.activeScreens} active of ${stats.data.totalScreens} · ${stats.data.pendingScreens} pending review`
                    : "Your registered screens"}
                </Text>
              </View>
              <Button title="Register" style={styles.registerButton} onPress={registerNew} />
            </View>
            {!kycApproved ? (
              <Text variant="caption" tone="muted">
                Complete your KYC verification before registering a screen.
              </Text>
            ) : null}
            <SearchField value={search} onChangeText={setSearch} placeholder="Search by name or city" />
            <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
            {list.data && screens.length > 0 ? (
              <Text variant="caption" tone="muted">
                {screens.length} of {total} {total === 1 ? "screen" : "screens"}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          list.isPending ? (
            <View style={styles.skeletons}>
              <Skeleton height={84} radius={radii.lg} />
              <Skeleton height={84} radius={radii.lg} />
              <Skeleton height={84} radius={radii.lg} />
            </View>
          ) : hasFilters ? (
            <Card>
              <Text variant="label">No matching screens</Text>
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
              <Text variant="label">No screens yet</Text>
              <Text variant="caption" tone="muted">
                Register your screen with its location, photos and a short installation video, then submit it for review to start earning.
              </Text>
              <Button title={kycApproved ? "Register your first screen" : "Complete KYC first"} onPress={registerNew} />
            </Card>
          )
        }
        ListFooterComponent={list.isFetchingNextPage ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null}
        onEndReached={() => {
          if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={list.isRefetching && !list.isFetchingNextPage}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
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
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing(3) },
  flex: { flex: 1 },
  registerButton: { minHeight: 40, paddingHorizontal: spacing(4) },
  skeletons: { gap: spacing(2) },
  gap: { height: spacing(2) },
  footer: { paddingVertical: spacing(4) },
});
