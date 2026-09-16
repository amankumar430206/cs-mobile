import { StyleSheet } from "react-native";
import { Button } from "./Button";

/**
 * Development-only helper that fills a form with test values; renders nothing in release builds.
 * Wrap call sites in `__DEV__ ? … : null` too, so the minifier also drops their labels and handlers.
 */
export function DevFillButton({ onPress, title }: { onPress: () => void; title: string }) {
  if (!__DEV__) return null;
  return <Button title={title} variant="outline" onPress={onPress} style={styles.dashed} />;
}

const styles = StyleSheet.create({
  dashed: { borderStyle: "dashed", minHeight: 40 },
});
