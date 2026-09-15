import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCategoriesQuery, useSearchScreensQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useTheme } from "@/theme/ThemeProvider";
import { Card, FilterChips, SearchField, Skeleton, Text } from "@/ui";
import { DiscoveryScreenCard } from "./DiscoveryScreenCard";

export function DiscoverScreen() {
  const { colors } = useTheme();
  const categories = useCategoriesQuery();
  const [search, setSearch] = useState("");
  const [categoryCode, setCategoryCode] = useState("all");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const categoryOptions = useMemo(
    () => [{ value: "all", label: "All categories" }, ...(categories.data ?? []).map((category) => ({ value: category.code, label: category.label }))],
    [categories.data]
  );

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      categoryCode: categoryCode === "all" ? undefined : categoryCode,
    }),
    [debouncedSearch, categoryCode]
  );

  const list = useSearchScreensQuery(filters, true);
  const screens = list.data?.pages.flatMap((page) => page.rows) ?? [];
  const total = list.data?.pages[0]?.meta.total ?? 0;
  const categoryLabel = (id: string) => categories.data?.find((category) => category.id === id)?.label ?? "Screen";

  return (
    <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: colors.background }]}>
      <FlatList
        data={screens}
        keyExtractor={(screen) => screen.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        renderItem={({ item }) => (
          <DiscoveryScreenCard
            screen={item}
            categoryLabel={categoryLabel(item.categoryId)}
            onPress={() => router.push({ pathname: "/advertiser/discover/[id]", params: { id: item.id } })}
          />
        )}
        ItemSeparatorComponent={Gap}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="title" accessibilityRole="header">
              Discover
            </Text>
            <Text tone="muted">Browse the live, verified screen network.</Text>
            <SearchField value={search} onChangeText={setSearch} placeholder="Search by screen name" />
            <FilterChips options={categoryOptions} value={categoryCode} onChange={setCategoryCode} />
            {list.data && screens.length > 0 ? (
              <Text variant="caption" tone="muted">
                {screens.length} of {total} screens
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          list.isPending ? (
            <View style={styles.skeletonGrid}>
              <Skeleton height={170} radius={radii.lg} style={styles.skeletonHalf} />
              <Skeleton height={170} radius={radii.lg} style={styles.skeletonHalf} />
            </View>
          ) : (
            <Card>
              <Text variant="label">No screens match</Text>
              <Text variant="caption" tone="muted">
                Try a different search or category.
              </Text>
            </Card>
          )
        }
        ListFooterComponent={list.isFetchingNextPage ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null}
        onEndReached={() => {
          if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={list.isRefetching} onRefresh={() => void list.refetch()} tintColor={colors.primary} colors={[colors.primary]} />}
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
  column: { gap: spacing(3) },
  gap: { height: spacing(3) },
  footer: { paddingVertical: spacing(4) },
  skeletonGrid: { flexDirection: "row", gap: spacing(3) },
  skeletonHalf: { flex: 1 },
});
