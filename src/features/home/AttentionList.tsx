import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { radii, spacing } from "@castadi/shared/tokens";
import type { UserRole } from "@castadi/shared/types";
import { accountRoutes } from "@/features/account/routes";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, Text } from "@/ui";
import type { AttentionItem } from "./attentionItems";

export function AttentionList({ items, role }: { items: AttentionItem[]; role: UserRole }) {
  const { colors } = useTheme();
  if (items.length === 0) return null;
  const routes = accountRoutes(role);

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const action = item.action;
        return (
          <Pressable
            key={item.key}
            disabled={!action}
            onPress={action ? () => router.push(routes[action]) : undefined}
            accessibilityRole={action ? "button" : "alert"}
            style={({ pressed }) => [
              styles.item,
              { backgroundColor: `${colors.warning}${pressed ? "24" : "14"}`, borderColor: `${colors.warning}4D` },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${colors.warning}24` }]}>
              <Icon name="warning" size={16} color={colors.warning} />
            </View>
            <View style={styles.body}>
              <Text variant="label" weight="semibold">
                {item.title}
              </Text>
              <Text variant="caption" tone="muted">
                {item.description}
              </Text>
            </View>
            {action ? <Icon name="chevronRight" size={14} color={colors.mutedForeground} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing(2) },
  item: { flexDirection: "row", alignItems: "center", gap: spacing(3), borderWidth: 1, borderRadius: radii.lg, padding: spacing(3.5) },
  iconWrap: { width: 32, height: 32, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 2 },
});
