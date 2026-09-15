import type { ComponentProps } from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTheme } from "@/theme/ThemeProvider";

// Native platform tab bars (UITabBarController / Material bottom navigation). Trigger names map to
// sibling routes in each role folder. Android allows at most 5 tabs per bar.
function useTabBarProps(): Partial<ComponentProps<typeof NativeTabs>> {
  const { colors } = useTheme();
  return {
    tintColor: colors.primary,
    iconColor: colors.mutedForeground,
    backgroundColor: colors.card,
    labelStyle: { color: colors.mutedForeground },
  };
}

export function AdvertiserTabs() {
  const tabBar = useTabBarProps();
  return (
    <NativeTabs {...tabBar}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} md="account_circle" />
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export function PartnerTabs() {
  const tabBar = useTabBarProps();
  return (
    <NativeTabs {...tabBar}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="screens">
        <NativeTabs.Trigger.Icon sf={{ default: "tv", selected: "tv.fill" }} md="tv" />
        <NativeTabs.Trigger.Label>Screens</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="monitoring">
        <NativeTabs.Trigger.Icon sf="waveform.path.ecg" md="monitor_heart" />
        <NativeTabs.Trigger.Label>Monitoring</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="earnings">
        <NativeTabs.Trigger.Icon sf={{ default: "indianrupeesign.circle", selected: "indianrupeesign.circle.fill" }} md="account_balance_wallet" />
        <NativeTabs.Trigger.Label>Earnings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} md="account_circle" />
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
