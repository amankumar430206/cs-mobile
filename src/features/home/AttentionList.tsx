import { StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "@/ui";
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
          style={[styles.item, { backgroundColor: `${colors.warning}14`, borderColor: `${colors.warning}55` }]}
        >
          <Text variant="label" weight="semibold" style={{ color: colors.warning }}>
            {item.title}
          </Text>
          <Text variant="caption" tone="muted">
            {item.description}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing(2) },
  item: { borderWidth: 1, borderRadius: radii.md, padding: spacing(3), gap: spacing(1) },
});
