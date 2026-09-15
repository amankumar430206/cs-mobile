import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useQueryClient } from "@tanstack/react-query";
import { useMeQuery, useUnreadCountQuery } from "@castadi/shared/hooks";
import { spacing } from "@castadi/shared/tokens";
import { RecentNotifications } from "@/features/notifications/RecentNotifications";
import { useTheme } from "@/theme/ThemeProvider";
import { Screen } from "@/ui";
import { AdvertiserHome } from "./AdvertiserHome";
import { DashboardHeader } from "./DashboardHeader";
import { PartnerHome } from "./PartnerHome";

const GUTTER = spacing(5);

export function HomeScreen() {
  const { data: user } = useMeQuery();
  // Same query the tab badge polls, so this adds no extra requests.
  const { data: unread } = useUnreadCountQuery();
  const queryClient = useQueryClient();
  const { mode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // The header band is dark in both themes, so the status bar needs light content while Home is focused.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle(mode === "dark" ? "light" : "dark");
    }, [mode])
  );

  const refresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ type: "active" });
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) return null;

  const isAdvertiser = user.role === "ADVERTISER";
  const openNotifications = () => router.navigate(isAdvertiser ? "/advertiser/notifications" : "/partner/notifications");

  return (
    <Screen edges={[]} onRefresh={refresh} refreshing={refreshing} contentStyle={styles.content}>
      <DashboardHeader user={user} unreadCount={unread?.count ?? 0} onOpenNotifications={openNotifications} bleed={GUTTER} />

      {isAdvertiser ? <AdvertiserHome user={user} /> : <PartnerHome user={user} />}

      <RecentNotifications role={user.role} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0, paddingHorizontal: GUTTER, gap: spacing(5), paddingBottom: spacing(8) },
});
