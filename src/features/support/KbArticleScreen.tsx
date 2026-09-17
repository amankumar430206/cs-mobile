import { StyleSheet } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useKbArticleQuery, useMeQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import { KB_CATEGORIES } from "@castadi/shared/types";
import { accountRoutes } from "@/features/account/routes";
import { formatDate } from "@/lib/format";
import { Button, Card, Screen, Skeleton, StatusPill, StatusView, Text } from "@/ui";

export function KbArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = useKbArticleQuery(id ?? "");
  const { data: user } = useMeQuery();

  if (article.isError) {
    return (
      <StatusView title="Couldn't load this article" message="It may have been removed, or you're offline.">
        <Button title="Try again" onPress={() => void article.refetch()} />
      </StatusView>
    );
  }

  if (!article.data) {
    return (
      <Screen edges={["bottom"]} contentStyle={styles.content}>
        <Skeleton height={32} radius={radii.md} />
        <Skeleton height={260} radius={radii.lg} />
      </Screen>
    );
  }

  const data = article.data;
  const category = KB_CATEGORIES.find((item) => item.value === data.category)?.label ?? data.category;

  return (
    <Screen edges={["bottom"]} contentStyle={styles.content}>
      <Stack.Screen options={{ title: category }} />
      <StatusPill label={category} />
      <Text variant="title" accessibilityRole="header">
        {data.title}
      </Text>
      <Text variant="caption" tone="muted">
        Updated {formatDate(data.updatedAt)}
      </Text>
      {/* Plain text with line breaks, same as cs-web renders it. */}
      <Text selectable style={styles.body}>
        {data.body}
      </Text>

      {user ? (
        <Card>
          <Text variant="label" weight="semibold">
            Still need help?
          </Text>
          <Button title="Raise a ticket" variant="outline" onPress={() => router.push(accountRoutes(user.role).newTicket)} />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(3), paddingBottom: spacing(10) },
  body: { lineHeight: 26, marginVertical: spacing(2) },
});
