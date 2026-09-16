import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { brand, spacing } from "@castadi/shared/tokens";
import { Text } from "@/ui";
import wordmarkOnDark from "../../../assets/brand/wordmark-on-dark.png";
import { AdBillboard } from "./AdBillboard";

// Shown once per cold start, right after the native splash hides: the app "powers on" like a screen.
// It sits over the already-mounted navigator, so there's no wait behind it — tap to skip.

const HOLD_MS = 1900;
const REDUCED_HOLD_MS = 700;
const MUTED = "rgba(255,252,243,0.64)";

// Artwork is ~7.3:1.
const WORDMARK_WIDTH = 168;
const WORDMARK_HEIGHT = 23;

export function BrandSplash({ onFinish }: { onFinish: () => void }) {
  const { width } = useWindowDimensions();
  const [enter] = useState(() => new Animated.Value(0));
  const [fill] = useState(() => new Animated.Value(0));
  const [exit] = useState(() => new Animated.Value(1));
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let sequence: Animated.CompositeAnimation | undefined;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      const hold = reduced ? REDUCED_HOLD_MS : HOLD_MS;
      sequence = Animated.parallel([
        Animated.timing(enter, { toValue: 1, duration: reduced ? 0 : 650, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
        Animated.timing(fill, { toValue: 1, duration: hold, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]);
      sequence.start(({ finished }) => {
        if (finished && !cancelled) setLeaving(true);
      });
    });

    return () => {
      cancelled = true;
      sequence?.stop();
    };
  }, [enter, fill]);

  useEffect(() => {
    if (!leaving) return;
    const fade = Animated.timing(exit, { toValue: 0, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true });
    fade.start(({ finished }) => finished && onFinish());
    return () => fade.stop();
  }, [leaving, exit, onFinish]);

  const billboardWidth = Math.min(width - spacing(16), 320);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: exit }]} accessibilityViewIsModal>
      <StatusBar style="light" />
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setLeaving(true)} accessibilityRole="button" accessibilityLabel="Skip intro" />

      {/* Warm stage light behind the billboard. */}
      <View style={[styles.glow, { width: width * 1.2, height: width * 1.2, borderRadius: width * 0.6, top: -width * 0.25 }]} pointerEvents="none" />

      <View style={styles.center} pointerEvents="none">
        <Animated.View
          style={{
            opacity: enter,
            transform: [
              { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
              { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            ],
          }}
        >
          <AdBillboard width={billboardWidth} slideDuration={1500} />
        </Animated.View>

        <Animated.View style={[styles.brand, { opacity: enter }]}>
          <Image source={wordmarkOnDark} style={styles.wordmark} resizeMode="contain" accessibilityLabel="CASTADI" />
          <Text style={styles.tagline} align="center">
            Screens and campaigns, in your pocket.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.track} pointerEvents="none">
        <Animated.View style={[styles.trackFill, { transform: [{ scaleX: fill }] }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: brand.secondary, zIndex: 1000, elevation: 1000 },
  glow: { position: "absolute", alignSelf: "center", backgroundColor: brand.primary, opacity: 0.1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing(10) },
  brand: { alignItems: "center", gap: spacing(2) },
  wordmark: { width: WORDMARK_WIDTH, height: WORDMARK_HEIGHT },
  tagline: { color: MUTED },
  track: {
    position: "absolute",
    bottom: spacing(16),
    alignSelf: "center",
    width: 120,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "rgba(255,252,243,0.14)",
  },
  trackFill: { flex: 1, backgroundColor: brand.primary, transformOrigin: "left" },
});
