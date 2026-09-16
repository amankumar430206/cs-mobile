import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import { brand, radii, spacing } from "@castadi/shared/tokens";
import { Icon, Text, type IconName } from "@/ui";

// A little digital billboard that cycles through CASTADI "ads" — the product pitch told in the
// product's own medium. Brand colors are fixed (not themed): it always sits on the dark brand band.

interface Slide {
  eyebrow: string;
  headline: string;
  icon: IconName;
  background: string;
  foreground: string;
  accent: string;
}

const INK = brand.secondary;
const CREAM = brand.foreground;
const ORANGE = brand.primary;

export const BILLBOARD_SLIDES: readonly Slide[] = [
  { eyebrow: "Now playing", headline: "Your brand,\non every screen.", icon: "megaphone", background: ORANGE, foreground: INK, accent: INK },
  { eyebrow: "Discover", headline: "Book screens where\nyour customers are.", icon: "location", background: CREAM, foreground: INK, accent: ORANGE },
  { eyebrow: "Proof of play", headline: "See every play,\nas it happens.", icon: "play", background: "#1C1C1C", foreground: CREAM, accent: ORANGE },
  { eyebrow: "Screen partners", headline: "Turn your screens\ninto revenue.", icon: "wallet", background: "#2A1600", foreground: CREAM, accent: ORANGE },
];

interface AdBillboardProps {
  width: number;
  /** Display aspect ratio (width / height). */
  aspectRatio?: number;
  /** How long each slide stays up, in ms. */
  slideDuration?: number;
  /** Draws the post and base under the display. */
  showStand?: boolean;
}

export function AdBillboard({ width, aspectRatio = 16 / 9, slideDuration = 2600, showStand = true }: AdBillboardProps) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [reveal] = useState(() => new Animated.Value(1));
  const [progress] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => active && setReduceMotion(enabled));
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  // Each slide: content eases in, the progress segment fills, then the next slide takes over.
  useEffect(() => {
    reveal.setValue(reduceMotion ? 1 : 0);
    progress.setValue(0);
    const animation = Animated.parallel([
      Animated.timing(reveal, { toValue: 1, duration: reduceMotion ? 0 : 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(progress, { toValue: 1, duration: slideDuration, easing: Easing.linear, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => {
      if (finished) setIndex((current) => (current + 1) % BILLBOARD_SLIDES.length);
    });
    return () => animation.stop();
  }, [index, reduceMotion, slideDuration, reveal, progress]);

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  const slide = BILLBOARD_SLIDES[index];
  const bezel = Math.max(6, Math.round(width * 0.025));
  const displayWidth = width - bezel * 2;
  const displayHeight = displayWidth / aspectRatio;
  const compact = displayHeight < 150;
  const headlineSize = compact ? 17 : displayWidth < 300 ? 19 : 22;

  return (
    <View style={{ width, alignItems: "center" }} accessible accessibilityRole="image" accessibilityLabel={`${slide.eyebrow}: ${slide.headline.replace("\n", " ")}`}>
      <View style={[styles.bezel, { padding: bezel, borderRadius: radii.lg + bezel / 2 }]}>
        <View style={[styles.display, { width: displayWidth, height: displayHeight, backgroundColor: slide.background }]}>
          {/* Soft glare + a big ghost icon give the flat panel some depth. */}
          <View style={[styles.ghostIcon, { right: -displayHeight * 0.12, bottom: -displayHeight * 0.18 }]} pointerEvents="none">
            <Icon name={slide.icon} size={displayHeight * 0.9} color={slide.accent} />
          </View>
          <View style={styles.glare} pointerEvents="none" />

          <View style={styles.topRow}>
            <View style={[styles.liveChip, { backgroundColor: slide.foreground === INK ? "rgba(17,17,17,0.12)" : "rgba(255,252,243,0.12)" }]}>
              <Animated.View
                style={[
                  styles.liveDot,
                  { backgroundColor: slide.background === ORANGE ? INK : ORANGE },
                  { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }) },
                ]}
              />
              <Text variant="caption" weight="bold" style={[styles.liveText, { color: slide.foreground }]}>
                LIVE
              </Text>
            </View>
            <Text variant="caption" weight="semibold" style={{ color: slide.foreground, opacity: 0.7 }}>
              AD {index + 1}/{BILLBOARD_SLIDES.length}
            </Text>
          </View>

          <Animated.View
            style={[
              styles.copy,
              {
                opacity: reveal,
                transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
              },
            ]}
          >
            <Text variant="caption" weight="bold" style={[styles.eyebrow, { color: slide.accent }]}>
              {slide.eyebrow.toUpperCase()}
            </Text>
            <Text weight="bold" style={{ color: slide.foreground, fontSize: headlineSize, lineHeight: headlineSize * 1.2 }} numberOfLines={2}>
              {slide.headline}
            </Text>
          </Animated.View>

          <View style={styles.segments}>
            {BILLBOARD_SLIDES.map((item, i) => (
              <View key={item.eyebrow} style={[styles.segment, { backgroundColor: slide.foreground === INK ? "rgba(17,17,17,0.18)" : "rgba(255,252,243,0.2)" }]}>
                <Animated.View
                  style={[
                    styles.segmentFill,
                    { backgroundColor: slide.foreground },
                    i < index
                      ? null
                      : i === index
                        ? { transform: [{ scaleX: progress }] }
                        : { transform: [{ scaleX: 0 }] },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
      {showStand ? (
        <>
          <View style={[styles.post, { height: Math.round(displayHeight * 0.14) }]} />
          <View style={[styles.base, { width: width * 0.32 }]} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bezel: {
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "rgba(255,252,243,0.12)",
    shadowColor: ORANGE,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  display: { borderRadius: radii.md, overflow: "hidden", padding: spacing(3), justifyContent: "space-between" },
  ghostIcon: { position: "absolute", opacity: 0.14 },
  glare: {
    position: "absolute",
    top: -80,
    left: -40,
    width: 220,
    height: 160,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ rotate: "-18deg" }],
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  liveChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radii.full },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 10, lineHeight: 14, letterSpacing: 1 },
  copy: { gap: 2 },
  eyebrow: { letterSpacing: 1.2, fontSize: 10, lineHeight: 14 },
  segments: { flexDirection: "row", gap: 4 },
  segment: { flex: 1, height: 3, borderRadius: 2, overflow: "hidden" },
  segmentFill: { flex: 1, transformOrigin: "left" },
  post: { width: 10, backgroundColor: "#2A2A2A" },
  base: { height: 6, borderRadius: 3, backgroundColor: "#2A2A2A" },
});
