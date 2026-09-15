import { StyleSheet, View } from "react-native";
import { spacing } from "@castadi/shared/tokens";
import { Text } from "@/ui";

export function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <Text variant="label" tone="primary" weight="bold" accessibilityRole="header">
        CASTADI
      </Text>
      <Text variant="title">{title}</Text>
      {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing(2), marginBottom: spacing(2) },
});
