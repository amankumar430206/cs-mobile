import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMeQuery, useMyTicketsInfiniteQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import type { Ticket } from "@castadi/shared/types";
import { accountRoutes, ticketRoute } from "@/features/account/routes";
import { formatRelativeTime } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, Skeleton, StatusPill, Text } from "@/ui";
import { TICKET_STATUS, ticketCategoryLabel } from "./supportStatus";

export function MyTicketsScreen() {
  const { colors } = useTheme();
  const { data: user } = useMeQuery();
  const list = useMyTicketsInfiniteQuery();
  const tickets = list.data?.pages.flatMap((page) => page.rows) ?? [];

  if (!user) return null;
  const routes = accountRoutes(user.role);

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.fill, { backgroundColor: colors.background }]}>
      <FlatList
        data={tickets}
        keyExtractor={(ticket) => ticket.id}
        renderItem={({ item }) => <TicketRow ticket={item} onPress={() => router.push(ticketRoute(user.role, item.id))} />}
        ItemSeparatorComponent={Gap}
        ListHeaderComponent={<Button title="New ticket" style={styles.newButton} onPress={() => router.push(routes.newTicket)} />}
        ListEmptyComponent={
          list.isPending ? (
            <View style={styles.skeletons}>
              <Skeleton height={84} radius={radii.lg} />
              <Skeleton height={84} radius={radii.lg} />
            </View>
          ) : (
            <Card>
              <Text variant="label">No tickets yet</Text>
              <Text variant="caption" tone="muted">
                Anything you raise with our team shows up here with the full conversation.
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
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

function TicketRow({ ticket, onPress }: { ticket: Ticket; onPress: () => void }) {
  const { colors } = useTheme();
  const status = TICKET_STATUS[ticket.status];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${ticket.subject}, ${status.label}`}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.muted : colors.card, borderColor: colors.cardBorder }]}
    >
      <View style={styles.rowTop}>
        <Text variant="label" weight="semibold" numberOfLines={1} style={styles.flex}>
          {ticket.subject}
        </Text>
        <StatusPill label={status.label} tone={status.tone} />
      </View>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {ticketCategoryLabel(ticket.category)} · Updated {formatRelativeTime(ticket.updatedAt)}
      </Text>
    </Pressable>
  );
}

function Gap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, padding: spacing(5), paddingBottom: spacing(10) },
  newButton: { marginBottom: spacing(4) },
  skeletons: { gap: spacing(2) },
  row: { borderWidth: 1, borderRadius: radii.lg, padding: spacing(4), gap: spacing(1.5) },
  rowTop: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  flex: { flex: 1 },
  gap: { height: spacing(2) },
  footer: { paddingVertical: spacing(4) },
});
