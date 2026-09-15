import { Stack } from "expo-router";
import { useMeQuery } from "@castadi/shared/hooks";
import { signOut } from "@/platform/auth";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, LoadingView, StatusView } from "@/ui";

export default function AppLayout() {
  const me = useMeQuery();
  const { colors } = useTheme();

  if (me.isPending) return <LoadingView />;

  if (me.isError) {
    return (
      <StatusView title="Couldn't load your account" message="Check your connection and try again.">
        <Button title="Try again" onPress={() => me.refetch()} />
        <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
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
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={role === "ADVERTISER"}>
        <Stack.Screen name="advertiser" />
      </Stack.Protected>
      <Stack.Protected guard={role === "SCREEN_PARTNER"}>
        <Stack.Screen name="partner" />
      </Stack.Protected>
    </Stack>
  );
}
