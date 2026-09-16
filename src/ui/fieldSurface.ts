import { useTheme } from "@/theme/ThemeProvider";

/** cs-web's input fill: transparent on light, `bg-input/30` (a faint lift) on dark. */
export function useFieldBackground() {
  const { colors, mode } = useTheme();
  return mode === "dark" ? `${colors.muted}4D` : "transparent";
}
