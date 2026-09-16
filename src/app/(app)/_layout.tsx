import { Stack } from "expo-router";
import { useMeQuery } from "@castadi/shared/hooks";
import { PushNotifications } from "@/features/notifications/usePushNotifications";
import { signOut } from "@/platform/auth";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, LoadingView, StatusView } from "@/ui";

export default function AppLayout() {
  const me = useMeQuery();
  const { colors } = useTheme();

  if (me.isPending) return <LoadingView />;

  if (me.isError) {
    return (
      <StatusView
        title="Couldn't load your account"
        message="Check your connection and try again."
      >
        <Button title="Try again" onPress={() => me.refetch()} />
        <Button
          title="Sign out"
          variant="outline"
          onPress={() => void signOut()}
        />
      </StatusView>
    );
  }

  const { role } = me.data;
  if (role !== "ADVERTISER" && role !== "SCREEN_PARTNER") {
    return (
      <StatusView
        title="Use the web dashboard"
        message="The CASTADI app is for advertisers and screen partners. Administrator accounts are managed from the web dashboard."
      >
        <Button title="Sign out" onPress={() => void signOut()} />
      </StatusView>
    );
  }

  return (
    <>
      <PushNotifications role={role} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Protected guard={role === "ADVERTISER"}>
          <Stack.Screen name="advertiser" />
        </Stack.Protected>
        <Stack.Protected guard={role === "SCREEN_PARTNER"}>
          <Stack.Screen name="partner" />
        </Stack.Protected>
        {/* Above the tab bars: Android caps native tabs at 5, so notifications opens from the Home bell instead. */}
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            title: "Notifications",
            headerShadowVisible: false,
            headerBackButtonDisplayMode: "minimal",
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.foreground,
          }}
        />
      </Stack>
    </>
  );
}
