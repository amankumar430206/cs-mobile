import { Text as RNText, StyleSheet, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { typography } from "@castadi/shared/tokens";
import { fontFamily } from "@/theme/fonts";
import { useTheme } from "@/theme/ThemeProvider";

type Variant = "title" | "heading" | "body" | "label" | "caption";
type Tone = "default" | "muted" | "danger" | "success" | "primary";
type Weight = keyof typeof typography.weights;

export interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: Weight;
  align?: "left" | "center" | "right";
}

const VARIANT_WEIGHT: Record<Variant, Weight> = { title: "bold", heading: "semibold", body: "normal", label: "medium", caption: "normal" };
const WEIGHT_BY_VALUE = Object.fromEntries(Object.entries(typography.weights).map(([name, value]) => [value, name])) as Record<string, Weight>;

export function Text({ variant = "body", tone = "default", weight, align, style, ...rest }: TextProps) {
  const { colors } = useTheme();
  const color = {
    default: colors.foreground,
    muted: colors.mutedForeground,
    danger: colors.danger,
    success: colors.success,
    primary: colors.primary,
  }[tone];

  // A fontWeight passed through `style` still wins, but it's resolved to a Poppins family file.
  const { fontWeight, ...flat } = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const resolvedWeight = (fontWeight != null ? WEIGHT_BY_VALUE[String(fontWeight)] : undefined) ?? weight ?? VARIANT_WEIGHT[variant];

  return (
    <RNText
      maxFontSizeMultiplier={1.6}
      style={[variants[variant], { color, fontFamily: fontFamily[resolvedWeight] }, align && { textAlign: align }, flat]}
      {...rest}
    />
  );
}

// Poppins sits taller than the system font, so line heights get a little extra room.
const variants = StyleSheet.create({
  title: { fontSize: typography.sizes["2xl"], lineHeight: typography.lineHeights["2xl"] + 2 },
  heading: { fontSize: typography.sizes.lg, lineHeight: typography.lineHeights.lg },
  body: { fontSize: typography.sizes.base, lineHeight: typography.lineHeights.base },
  label: { fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.sm + 1 },
  caption: { fontSize: typography.sizes.xs, lineHeight: typography.lineHeights.xs + 2 },
});
