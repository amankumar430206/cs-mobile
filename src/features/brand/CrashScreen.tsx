import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ErrorBoundaryProps } from "expo-router";
import { brand, spacing } from "@castadi/shared/tokens";
import wordmarkOnDark from "../../../assets/brand/wordmark-on-dark.png";

const CREAM_MUTED = "rgba(255,252,243,0.64)";

/**
 * Route error boundary. Deliberately self-contained — plain RN Text, fixed brand colors, no theme or fonts — because
 * whatever crashed may be the providers those depend on.
 */
export function CrashScreen({ error, retry }: ErrorBoundaryProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <View style={styles.root}>
      <Image source={wordmarkOnDark} style={styles.wordmark} resizeMode="contain" accessibilityLabel="CASTADI" />
      <View style={styles.body}>
        <Text style={styles.title} accessibilityRole="header">
          Something went wrong
        </Text>
        <Text style={styles.message}>This screen hit an unexpected problem. Try again — your data is safe.</Text>

        <Pressable
          onPress={() => void retry()}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>

        {__DEV__ ? (
          <>
            <Pressable onPress={() => setShowDetails((value) => !value)} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.link}>{showDetails ? "Hide details" : "Show details"}</Text>
            </Pressable>
            {showDetails ? (
              <ScrollView style={styles.details}>
                <Text style={styles.detailsText} selectable>
                  {error.stack ?? error.message}
                </Text>
              </ScrollView>
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.secondary, padding: spacing(6), paddingTop: spacing(16) },
  wordmark: { width: 132, height: 18 },
  body: { flex: 1, justifyContent: "center", gap: spacing(3) },
  title: { color: brand.foreground, fontSize: 26, lineHeight: 32, fontWeight: "700" },
  message: { color: CREAM_MUTED, fontSize: 16, lineHeight: 24 },
  button: { marginTop: spacing(3), minHeight: 48, backgroundColor: brand.primary, alignItems: "center", justifyContent: "center" },
  buttonText: { color: brand.secondary, fontSize: 15, fontWeight: "600" },
  link: { color: brand.primary, fontSize: 14, marginTop: spacing(2) },
  details: { maxHeight: 220, borderWidth: 1, borderColor: "rgba(255,252,243,0.16)", padding: spacing(3) },
  detailsText: { color: CREAM_MUTED, fontSize: 12, fontFamily: "monospace" },
});
