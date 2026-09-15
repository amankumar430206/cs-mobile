import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useUnreadCountQuery } from "@castadi/shared/hooks";
import { useTheme } from "@/theme/ThemeProvider";

// Native platform tab bar (UITabBarController / Material bottom navigation). Route names map to
// sibling files in each role folder; role-specific tabs are added here as their features land.
export function RoleTabs() {
  const { colors } = useTheme();
  // Polling pauses automatically while the app is backgrounded (see reactQueryNative.ts).
  const { data: unread } = useUnreadCountQuery({ refetchInterval: 60_000 });
  const unreadCount = unread?.count ?? 0;

  return (
    <NativeTabs
      tintColor={colors.primary}
      iconColor={colors.mutedForeground}
      backgroundColor={colors.card}
      badgeBackgroundColor={colors.danger}
      labelStyle={{ color: colors.mutedForeground }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notifications">
        <NativeTabs.Trigger.Icon sf={{ default: "bell", selected: "bell.fill" }} md="notifications" />
        <NativeTabs.Trigger.Label>Notifications</NativeTabs.Trigger.Label>
        {unreadCount > 0 ? <NativeTabs.Trigger.Badge>{unreadCount > 9 ? "9+" : String(unreadCount)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} md="account_circle" />
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
