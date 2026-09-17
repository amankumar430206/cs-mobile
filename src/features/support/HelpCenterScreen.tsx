import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useKbArticlesQuery, useMeQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import { KB_CATEGORIES, type KbCategory } from "@castadi/shared/types";
import { accountRoutes, articleRoute } from "@/features/account/routes";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { Button, Card, FilterChips, ListItem, Pager, Screen, SearchField, Section, Skeleton, Text } from "@/ui";

type CategoryFilter = "all" | KbCategory;

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [{ value: "all", label: "All" }, ...KB_CATEGORIES];

/** Help hub: search the knowledge base first, with a clear way to reach a person when the articles don't help. */
export function HelpCenterScreen() {
  const { data: user } = useMeQuery();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const articles = useKbArticlesQuery(page, {
    search: debouncedSearch || undefined,
    category: category === "all" ? undefined : category,
  });

  if (!user) return null;
  const routes = accountRoutes(user.role);
  const rows = articles.data?.rows ?? [];

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const changeCategory = (value: CategoryFilter) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <Screen edges={["bottom"]} contentStyle={styles.content}>
      <Card>
        <Text variant="heading">Talk to our team</Text>
        <Text variant="caption" tone="muted">
          Can&apos;t find an answer? Raise a ticket and we&apos;ll reply here and by notification.
        </Text>
        <View style={styles.actions}>
          <Button title="New ticket" style={styles.flex} onPress={() => router.push(routes.newTicket)} />
          <Button title="My tickets" variant="outline" style={styles.flex} onPress={() => router.push(routes.support)} />
        </View>
      </Card>

      <Section title="Help articles">
        <SearchField value={search} onChangeText={changeSearch} placeholder="Search help articles" />
        <FilterChips options={CATEGORY_OPTIONS} value={category} onChange={changeCategory} />

        {articles.isPending ? (
          <Skeleton height={180} radius={radii.lg} />
        ) : rows.length === 0 ? (
          <Card>
            <Text variant="label">No articles found</Text>
            <Text variant="caption" tone="muted">
              Try different words or another category — or raise a ticket and ask us directly.
            </Text>
          </Card>
        ) : (
          <Card style={styles.list}>
            {rows.map((article, index) => (
              <ListItem
                key={article.id}
                icon="article"
                title={article.title}
                subtitle={KB_CATEGORIES.find((item) => item.value === article.category)?.label}
                divider={index > 0}
                onPress={() => router.push(articleRoute(user.role, article.id))}
              />
            ))}
          </Card>
        )}

        {articles.data ? <Pager page={page} limit={articles.data.meta.limit} total={articles.data.meta.total} onPageChange={setPage} /> : null}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(5), paddingBottom: spacing(10) },
  actions: { flexDirection: "row", gap: spacing(3), marginTop: spacing(1) },
  flex: { flex: 1 },
  list: { padding: 0, gap: 0, overflow: "hidden" },
});
