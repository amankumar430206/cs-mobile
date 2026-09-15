import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsInfiniteQuery,
  useUnreadCountQuery,
} from "@castadi/shared/hooks";
import { spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Text } from "@/ui";
import { NotificationRow } from "./NotificationRow";

export function NotificationsScreen() {
  const { colors } = useTheme();
  const list = useNotificationsInfiniteQuery();
  const unread = useUnreadCountQuery();
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();

  const rows = list.data?.pages.flatMap((page) => page.rows) ?? [];
  const unreadCount = unread.data?.count ?? 0;

  const refresh = () => {
    void list.refetch();
    void unread.refetch();
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: colors.background }]}>
      <FlatList
        data={rows}
        keyExtractor={(notification) => notification.id}
        renderItem={({ item }) => (
          <NotificationRow
            notification={item}
            onPress={() => {
              if (item.status !== "READ") markRead.mutate(item.id);
            }}
          />
        )}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="title" accessibilityRole="header">
              Notifications
            </Text>
            {unreadCount > 0 ? (
              <Button
                title="Mark all read"
                variant="ghost"
                onPress={() => markAllRead.mutate()}
                loading={markAllRead.isPending}
                style={styles.markAll}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          list.isPending ? (
            <ActivityIndicator style={styles.empty} color={colors.primary} />
          ) : (
            <View style={styles.empty}>
              <Text variant="heading" align="center">
                You&apos;re all caught up
              </Text>
              <Text tone="muted" align="center">
                New notifications will show up here.
              </Text>
            </View>
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
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

function Separator() {
  const { colors } = useTheme();
  return <View style={[styles.separator, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: spacing(6) },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(5),
    paddingTop: spacing(5),
    paddingBottom: spacing(2),
  },
  markAll: { minHeight: 36, paddingHorizontal: spacing(2) },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: spacing(5) + 8 + spacing(3) },
  empty: { marginTop: spacing(16), gap: spacing(2), paddingHorizontal: spacing(5) },
  footer: { paddingVertical: spacing(4) },
});
