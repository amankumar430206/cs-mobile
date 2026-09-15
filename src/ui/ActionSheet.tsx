import { useRef } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

export interface SheetAction {
  key: string;
  label: string;
  icon: IconName;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  actions: SheetAction[];
  onClose: () => void;
}

export function ActionSheet({ visible, title, actions, onClose }: ActionSheetProps) {
  const { colors } = useTheme();
  // iOS can't present a system picker while this modal is still animating out, so the chosen
  // action runs from onDismiss there; Android has no onDismiss and can present immediately.
  const pending = useRef<(() => void) | null>(null);

  const runPending = () => {
    const action = pending.current;
    pending.current = null;
    action?.();
  };

  const choose = (action: SheetAction) => {
    pending.current = action.onPress;
    onClose();
    if (Platform.OS !== "ios") runPending();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onDismiss={runPending}>
      <View style={styles.container}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        <SafeAreaView edges={["bottom"]} style={[styles.sheet, { backgroundColor: colors.card }]}>
          {title ? (
            <Text variant="label" tone="muted" align="center" style={styles.title}>
              {title}
            </Text>
          ) : null}
          {actions.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => choose(action)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.action, pressed && { backgroundColor: colors.muted }]}
            >
              <Icon name={action.icon} size={20} color={colors.foreground} />
              <Text>{action.label}</Text>
            </Pressable>
          ))}
          <Button title="Cancel" variant="secondary" onPress={onClose} style={styles.cancel} />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing(3), gap: spacing(1) },
  title: { paddingVertical: spacing(2) },
  action: { flexDirection: "row", alignItems: "center", gap: spacing(3), minHeight: 52, paddingHorizontal: spacing(3), borderRadius: radii.md },
  cancel: { marginTop: spacing(2) },
});
