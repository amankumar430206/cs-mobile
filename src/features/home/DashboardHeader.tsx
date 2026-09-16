import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { brand, radii, spacing } from "@castadi/shared/tokens";
import type { CurrentUser } from "@castadi/shared/types";
import { formatToday, greeting, initialsOf } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, Text } from "@/ui";
import wordmarkOnDark from "../../../assets/brand/wordmark-on-dark.png";

// Full-bleed brand band that runs under the status bar: near-black surface, cream type, orange accents.
const ON_DARK = brand.foreground;
const ON_DARK_MUTED = "rgba(255,252,243,0.64)";
const ON_DARK_SURFACE = "rgba(255,252,243,0.08)";
const ON_DARK_RULE = "rgba(255,252,243,0.16)";

// Artwork is ~7.3:1.
const WORDMARK_WIDTH = 124;
const WORDMARK_HEIGHT = 17;

interface DashboardHeaderProps {
  user: CurrentUser;
  unreadCount: number;
  onOpenNotifications: () => void;
  /** Horizontal padding of the parent screen, so the band can bleed to the screen edges. */
  bleed: number;
}

export function DashboardHeader({ user, unreadCount, onOpenNotifications, bleed }: DashboardHeaderProps) {
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();

  const isAdvertiser = user.role === "ADVERTISER";
  const band = mode === "dark" ? colors.card : colors.secondary;
  const businessName = isAdvertiser ? user.advertiser?.business_name : undefined;

  return (
    <View
      style={[
        styles.band,
        {
          backgroundColor: band,
          marginHorizontal: -bleed,
          paddingHorizontal: bleed,
          paddingTop: insets.top + spacing(3),
          borderColor: mode === "dark" ? colors.border : band,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Image source={wordmarkOnDark} style={styles.wordmark} resizeMode="contain" accessibilityRole="image" accessibilityLabel="CASTADI" />

        <Pressable
          onPress={onOpenNotifications}
          accessibilityRole="button"
          accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
          hitSlop={8}
          style={({ pressed }) => [
            styles.bell,
            { backgroundColor: pressed ? ON_DARK_RULE : ON_DARK_SURFACE, borderColor: ON_DARK_RULE },
          ]}
        >
          <Icon name="bell" size={20} color={ON_DARK} />
          {unreadCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: band }]}>
              <Text variant="caption" weight="bold" style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.profileRow}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text variant="heading" weight="bold" style={styles.initials}>
            {initialsOf(user.full_name) || "?"}
          </Text>
        </View>

        <View style={styles.text}>
          <Text variant="caption" style={{ color: ON_DARK_MUTED }} numberOfLines={1}>
            {formatToday()}
          </Text>
          <Text variant="title" style={{ color: ON_DARK }} numberOfLines={1} adjustsFontSizeToFit accessibilityRole="header">
            {greeting()}, {user.full_name.split(" ")[0]}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.rolePill, { backgroundColor: `${colors.primary}33` }]}>
              <Text variant="caption" weight="semibold" tone="primary">
                {isAdvertiser ? "Advertiser" : "Screen Partner"}
              </Text>
            </View>
            {businessName ? (
              <Text variant="caption" style={[styles.business, { color: ON_DARK_MUTED }]} numberOfLines={1}>
                {businessName}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    paddingBottom: spacing(6),
    gap: spacing(5),
    borderBottomWidth: 1,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wordmark: { width: WORDMARK_WIDTH, height: WORDMARK_HEIGHT },
  bell: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: brand.secondary, fontSize: 10, lineHeight: 12 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: spacing(4) },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  initials: { color: brand.secondary },
  text: { flex: 1, gap: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing(2), marginTop: spacing(1) },
  rolePill: { borderRadius: radii.sm, paddingHorizontal: spacing(2), paddingVertical: 2 },
  business: { flexShrink: 1 },
});
