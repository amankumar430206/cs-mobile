import { StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, Text } from "@/ui";
import type { AttentionItem } from "./attentionItems";

export function AttentionList({ items }: { items: AttentionItem[] }) {
  const { colors } = useTheme();
  if (items.length === 0) return null;

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View
          key={item.key}
          accessible
          accessibilityRole="alert"
          style={[styles.item, { backgroundColor: `${colors.warning}14`, borderColor: `${colors.warning}4D` }]}
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
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing(2) },
  item: { flexDirection: "row", gap: spacing(3), borderWidth: 1, borderRadius: radii.lg, padding: spacing(3.5) },
  iconWrap: { width: 32, height: 32, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 2 },
});
