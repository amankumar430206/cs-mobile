import { ActivityIndicator, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, variant = "primary", loading = false, disabled, style, ...rest }: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = !!disabled || loading;
  const palette = {
    primary: { background: colors.primary, foreground: colors.primaryForeground, border: colors.primary },
    secondary: { background: colors.muted, foreground: colors.foreground, border: colors.border },
    ghost: { background: "transparent", foreground: colors.primary, border: "transparent" },
    danger: { background: colors.danger, foreground: "#ffffff", border: colors.danger },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={palette.foreground} />
      ) : (
        <Text variant="label" weight="semibold" style={{ color: palette.foreground }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    alignItems: "center",
    justifyContent: "center",
  },
});
