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
  bellSettings: { ios: "bell.badge.fill", android: "notifications_active" },
  warning: { ios: "exclamationmark.triangle.fill", android: "warning" },
  trendUp: { ios: "arrow.up.right", android: "trending_up" },
  trendDown: { ios: "arrow.down.right", android: "trending_down" },
  play: { ios: "play.rectangle.fill", android: "smart_display" },
  location: { ios: "mappin.and.ellipse", android: "location_on" },
  chevronRight: { ios: "chevron.right", android: "chevron_right" },
  person: { ios: "person.fill", android: "person" },
  lock: { ios: "lock.fill", android: "lock" },
  shield: { ios: "checkmark.shield.fill", android: "verified_user" },
  bank: { ios: "building.columns.fill", android: "account_balance" },
  document: { ios: "doc.text.fill", android: "description" },
  camera: { ios: "camera.fill", android: "photo_camera" },
  photo: { ios: "photo.fill", android: "image" },
  check: { ios: "checkmark.circle.fill", android: "check_circle" },
  logout: { ios: "rectangle.portrait.and.arrow.right", android: "logout" },
} satisfies Record<string, { ios: SFSymbol; android: AndroidSymbol }>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color: ColorValue }) {
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} type="monochrome" />;
}
