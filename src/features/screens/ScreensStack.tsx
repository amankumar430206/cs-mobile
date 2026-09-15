import { Stack } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";

export function ScreensStack() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ title: "Register a screen" }} />
      <Stack.Screen name="[id]/index" options={{ title: "Screen" }} />
      <Stack.Screen name="[id]/edit" options={{ title: "Edit details" }} />
      <Stack.Screen name="[id]/media" options={{ title: "Photos & video" }} />
    </Stack>
  );
}
