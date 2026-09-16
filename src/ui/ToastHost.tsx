import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radii, spacing } from "@castadi/shared/tokens";
import { dismissToast, useToasts } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "./Text";

export function ToastHost() {
  const toasts = useToasts();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + spacing(2) }]}>
      {toasts.map((item) => {
        const accent = { success: colors.success, error: colors.danger, info: colors.info, loading: colors.primary }[item.kind];
        return (
          <Pressable
            key={item.id}
            onPress={() => dismissToast(item.id)}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            accessibilityHint="Tap to dismiss"
            style={[styles.toast, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderLeftColor: accent }]}
          >
            {item.kind === "loading" && <ActivityIndicator size="small" color={accent} />}
            <Text variant="label" style={styles.message}>
              {item.message}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: "absolute", left: spacing(4), right: spacing(4), gap: spacing(2) },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: radii.md,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(4),
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  message: { flex: 1 },
});
