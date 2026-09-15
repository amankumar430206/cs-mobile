import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Screen } from "./Screen";
import { Text } from "./Text";

export function LoadingView() {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]} accessibilityLabel="Loading">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function StatusView({ title, message, children }: { title: string; message: string; children?: ReactNode }) {
  return (
    <Screen scroll={false} contentStyle={styles.status}>
      <Text variant="title" align="center">
        {title}
      </Text>
      <Text tone="muted" align="center">
        {message}
      </Text>
      <View style={styles.actions}>{children}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  status: { justifyContent: "center" },
  actions: { gap: spacing(3), marginTop: spacing(2) },
});
