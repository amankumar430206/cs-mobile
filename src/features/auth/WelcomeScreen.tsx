import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { brand, radii, spacing } from "@castadi/shared/tokens";
import { AdBillboard } from "@/features/brand/AdBillboard";
import { Icon, Text } from "@/ui";
import wordmarkOnDark from "../../../assets/brand/wordmark-on-dark.png";

const CREAM = brand.foreground;
const CREAM_MUTED = "rgba(255,252,243,0.64)";
const GUTTER = spacing(5);
const FAB_SIZE = 60;

// Artwork is ~7.3:1.
const WORDMARK_WIDTH = 132;
const WORDMARK_HEIGHT = 18;

/** Full-height brand intro in front of login: the live billboard, the pitch, and a floating next arrow. */
export function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Light status bar only while this dark screen is on top.
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  const billboardWidth = Math.min(width - GUTTER * 2, 420);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing(4), paddingBottom: insets.bottom + spacing(6) }]}>
      {focused ? <StatusBar style="light" /> : null}

      {/* Warm stage light behind the billboard. */}
      <View
        style={[styles.glow, { width: width * 1.3, height: width * 1.3, borderRadius: width * 0.65, top: height * 0.12 }]}
        pointerEvents="none"
      />

      <View style={styles.brandRow}>
        <Image source={wordmarkOnDark} style={styles.wordmark} resizeMode="contain" accessibilityRole="header" accessibilityLabel="CASTADI" />
        <View style={styles.tag}>
          <Text variant="caption" weight="medium" style={styles.tagText}>
            Digital out-of-home
          </Text>
        </View>
      </View>

      <View style={styles.stage}>
        <AdBillboard width={billboardWidth} />
      </View>

      <View style={styles.bottom}>
        <View style={styles.copy}>
          <Text weight="bold" style={styles.headline}>
            Put your brand on{"\n"}
            <Text weight="bold" style={[styles.headline, { color: brand.primary }]}>
              every screen.
            </Text>
          </Text>
          <Text style={styles.subhead}>Manage campaigns, screens and earnings — wherever you are.</Text>
        </View>

        <Pressable
          onPress={() => router.push("/login")}
          accessibilityRole="button"
          accessibilityLabel="Continue to log in"
          hitSlop={8}
          style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
        >
          <Icon name="arrowRight" size={26} color={brand.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.secondary, paddingHorizontal: GUTTER, overflow: "hidden" },
  glow: { position: "absolute", alignSelf: "center", backgroundColor: brand.primary, opacity: 0.1 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wordmark: { width: WORDMARK_WIDTH, height: WORDMARK_HEIGHT },
  tag: { borderWidth: 1, borderColor: "rgba(255,252,243,0.2)", paddingHorizontal: spacing(2), paddingVertical: 2 },
  tagText: { color: CREAM_MUTED, letterSpacing: 0.4 },
  stage: { flex: 1, alignItems: "center", justifyContent: "center" },
  bottom: { flexDirection: "row", alignItems: "flex-end", gap: spacing(4) },
  copy: { flex: 1, gap: spacing(2) },
  headline: { color: CREAM, fontSize: 30, lineHeight: 38 },
  subhead: { color: CREAM_MUTED },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radii.md,
    backgroundColor: brand.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: brand.primary,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});
