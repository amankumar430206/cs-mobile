import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import { radii } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";

interface SkeletonProps {
  height: number;
  width?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ height, width = "100%", radius = radii.md, style }: SkeletonProps) {
  const { colors } = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.55));

  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled || reduceMotion) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      accessibilityLabel="Loading"
      style={[{ height, width, borderRadius: radius, backgroundColor: colors.muted, opacity }, style]}
    />
  );
}
