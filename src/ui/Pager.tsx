import { StyleSheet, View } from "react-native";
import { spacing } from "@castadi/shared/tokens";
import { Button } from "./Button";
import { Text } from "./Text";

interface PagerProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pager({ page, limit, total, onPageChange }: PagerProps) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  if (pages <= 1) return null;

  return (
    <View style={styles.row}>
      <Button title="Previous" variant="outline" style={styles.button} disabled={page <= 1} onPress={() => onPageChange(page - 1)} />
      <Text variant="caption" tone="muted">
        Page {page} of {pages}
      </Text>
      <Button title="Next" variant="outline" style={styles.button} disabled={page >= pages} onPress={() => onPageChange(page + 1)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing(3) },
  button: { minHeight: 40, paddingHorizontal: spacing(3) },
});
