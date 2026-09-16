import { ActivityIndicator, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "./Text";

// Mirrors cs-web's button buckets (components/ui/button.tsx):
//   primary   — the one main action: orange fill, dark ink
//   secondary — a deliberate alternate action: near-black brand fill, cream ink
//   outline   — everything else (retry, cancel, filters): flat grey fill with a border
//   ghost     — text-only link-style action in the brand color
//   danger    — destructive: red text, transparent until pressed (never a heavy red fill)
type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, variant = "primary", loading = false, disabled, style, ...rest }: ButtonProps) {
  const { colors, mode } = useTheme();
  const isDisabled = !!disabled || loading;
  const palette = {
    primary: { background: colors.primary, pressed: colors.primary, foreground: colors.primaryForeground, border: colors.primary },
    // On the dark theme the near-black fill would vanish into the background, so it gets the border color as an edge.
    secondary: { background: colors.secondary, pressed: colors.secondary, foreground: colors.secondaryForeground, border: mode === "dark" ? colors.border : colors.secondary },
    outline: { background: colors.muted, pressed: colors.border, foreground: colors.foreground, border: colors.border },
    ghost: { background: "transparent", pressed: colors.muted, foreground: colors.primary, border: "transparent" },
    danger: { background: "transparent", pressed: `${colors.danger}1A`, foreground: colors.danger, border: "transparent" },
  }[variant];
  const fades = variant === "primary" || variant === "secondary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? palette.pressed : palette.background,
          borderColor: palette.border,
          // Filled buttons dim like web's hover:bg-primary/80; flat ones swap to a tinted fill instead.
          opacity: isDisabled ? 0.5 : pressed && fades ? 0.8 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={palette.foreground} />
      ) : (
        <Text variant="label" weight="medium" style={{ color: palette.foreground }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    alignItems: "center",
    justifyContent: "center",
  },
});
