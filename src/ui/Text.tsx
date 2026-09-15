import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from "react-native";
import { typography } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";

type Variant = "title" | "heading" | "body" | "label" | "caption";
type Tone = "default" | "muted" | "danger" | "success" | "primary";

export interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: keyof typeof typography.weights;
  align?: "left" | "center" | "right";
}

export function Text({ variant = "body", tone = "default", weight, align, style, ...rest }: TextProps) {
  const { colors } = useTheme();
  const color = {
    default: colors.foreground,
    muted: colors.mutedForeground,
    danger: colors.danger,
    success: colors.success,
    primary: colors.primary,
  }[tone];

  return (
    <RNText
      maxFontSizeMultiplier={1.6}
      style={[
        variants[variant],
        { color },
        weight && { fontWeight: typography.weights[weight] },
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}

const variants = StyleSheet.create({
  title: { fontSize: typography.sizes["2xl"], lineHeight: typography.lineHeights["2xl"], fontWeight: typography.weights.bold },
  heading: { fontSize: typography.sizes.lg, lineHeight: typography.lineHeights.lg, fontWeight: typography.weights.semibold },
  body: { fontSize: typography.sizes.base, lineHeight: typography.lineHeights.base },
  label: { fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.sm, fontWeight: typography.weights.medium },
  caption: { fontSize: typography.sizes.xs, lineHeight: typography.lineHeights.xs },
});
