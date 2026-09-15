import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { resolveTheme, type ResolvedTheme } from "@castadi/shared/tokens";

const ThemeContext = createContext<ResolvedTheme>(resolveTheme("light"));

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const theme = useMemo(() => resolveTheme(scheme === "dark" ? "dark" : "light"), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
