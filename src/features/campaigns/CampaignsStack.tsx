import { Stack } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";

export function CampaignsStack() {
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
      <Stack.Screen name="new" options={{ title: "New campaign" }} />
      <Stack.Screen name="[id]" options={{ title: "Campaign" }} />
    </Stack>
  );
}
