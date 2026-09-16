import { useEffect, useRef, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { spacing } from "@castadi/shared/tokens";
import { useTheme } from "@/theme/ThemeProvider";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** Screens under a native header only need the bottom inset. */
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  /** Enables pull-to-refresh on scrolling screens. */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Pinned above the scrolling content (e.g. a Stepper), so it stays visible while the body scrolls. */
  header?: ReactNode;
  /** Scrolls back to the top whenever this value changes — e.g. moving to the next step of a wizard. */
  scrollResetKey?: string | number;
}

export function Screen({ children, scroll = true, edges = ["top", "bottom"], contentStyle, onRefresh, refreshing = false, header, scrollResetKey }: ScreenProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollResetKey !== undefined) scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [scrollResetKey]);

  return (
    <SafeAreaView edges={edges} style={[styles.fill, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.fill}>
        {header}
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, styles.content, contentStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, padding: spacing(5), gap: spacing(4) },
});
