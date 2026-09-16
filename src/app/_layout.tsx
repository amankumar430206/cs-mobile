import "@/platform/bootstrap";
import { useCallback, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSession } from "@castadi/shared";
import { BrandSplash } from "@/features/brand/BrandSplash";
import { queryClient } from "@/platform/queryClient";
import { fontAssets } from "@/theme/fonts";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { ToastHost } from "@/ui/ToastHost";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const hydrated = useSession((s) => s.hydrated);
  // A font load failure falls back to the system font rather than blocking the app.
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const ready = hydrated && (fontsLoaded || !!fontError);
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  // Splash stays up until stored tokens and fonts are read, so there's no login-screen or font flash.
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
          <ToastHost />
          {/* The navigator mounts (and starts fetching) underneath the intro, so it never delays the app. */}
          {introDone ? null : <BrandSplash onFinish={finishIntro} />}
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
