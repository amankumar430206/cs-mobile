import { Image, StyleSheet, View } from "react-native";
import { spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "@/ui";
import wordmarkOnDark from "../../../assets/brand/wordmark-on-dark.png";
import wordmarkOnLight from "../../../assets/brand/wordmark-on-light.png";

// Source artwork is ~7.3:1.
const WORDMARK_WIDTH = 152;
const WORDMARK_HEIGHT = 21;

export function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { mode } = useTheme();

  return (
    <View style={styles.header}>
      <Image
        source={mode === "dark" ? wordmarkOnDark : wordmarkOnLight}
        style={styles.wordmark}
        resizeMode="contain"
        accessibilityRole="header"
        accessibilityLabel="CASTADI"
      />
      <Text variant="title">{title}</Text>
      {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing(2), marginBottom: spacing(2) },
  wordmark: { width: WORDMARK_WIDTH, height: WORDMARK_HEIGHT, marginBottom: spacing(2) },
});
