import "@/platform/bootstrap";
import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSession } from "@castadi/shared";
import { queryClient } from "@/platform/queryClient";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { ToastHost } from "@/ui/ToastHost";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const hydrated = useSession((s) => s.hydrated);

  useEffect(() => {
    if (hydrated) SplashScreen.hide();
  }, [hydrated]);

  // Splash stays up until stored tokens are read, so there's no login-screen flash for signed-in users.
  if (!hydrated) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
          <ToastHost />
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const signedIn = useSession((s) => !!s.accessToken);
  const { mode, colors } = useTheme();

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
