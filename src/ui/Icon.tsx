import { SymbolView, type AndroidSymbol, type SFSymbol } from "expo-symbols";
import type { ColorValue } from "react-native";

// One vocabulary for both platforms: SF Symbols on iOS (native), Material Symbols on Android
// (the font expo-router already ships). Add names here rather than using raw symbols in screens.
const ICONS = {
  megaphone: { ios: "megaphone.fill", android: "campaign" },
  screen: { ios: "tv.fill", android: "tv" },
  chart: { ios: "chart.bar.fill", android: "bar_chart" },
  clock: { ios: "clock.fill", android: "schedule" },
  calendar: { ios: "calendar", android: "calendar_month" },
  heart: { ios: "heart.text.square.fill", android: "monitor_heart" },
  bell: { ios: "bell", android: "notifications" },
  warning: { ios: "exclamationmark.triangle.fill", android: "warning" },
  trendUp: { ios: "arrow.up.right", android: "trending_up" },
  trendDown: { ios: "arrow.down.right", android: "trending_down" },
  play: { ios: "play.rectangle.fill", android: "smart_display" },
  location: { ios: "mappin.and.ellipse", android: "location_on" },
} satisfies Record<string, { ios: SFSymbol; android: AndroidSymbol }>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color: ColorValue }) {
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} type="monochrome" />;
}
