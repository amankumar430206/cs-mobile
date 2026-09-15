import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { spacing } from "@castadi/shared/tokens";
import { Text } from "./Text";

interface SectionProps {
  title: string;
  action?: { label: string; onPress: () => void };
  children: ReactNode;
}

export function Section({ title, action, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="caption" tone="muted" weight="semibold" accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {action ? (
          <Pressable onPress={action.onPress} hitSlop={12} accessibilityRole="button">
            <Text variant="label" tone="primary">
              {action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing(2) },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { textTransform: "uppercase", letterSpacing: 0.8 },
});
