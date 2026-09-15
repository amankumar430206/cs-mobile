import { Stack } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";

export function AccountStack() {
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
      <Stack.Screen name="profile" options={{ title: "Edit profile" }} />
      <Stack.Screen name="password" options={{ title: "Change password" }} />
      <Stack.Screen name="notification-settings" options={{ title: "Notification settings" }} />
      <Stack.Screen name="kyc" options={{ title: "KYC & verification" }} />
      <Stack.Screen name="bank-details" options={{ title: "Bank details" }} />
    </Stack>
  );
}
