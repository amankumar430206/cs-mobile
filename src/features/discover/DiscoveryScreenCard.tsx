import { Image, Pressable, StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import type { DiscoveryScreen } from "@castadi/shared/types";
import { formatINR } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { LiveIndicator, Text } from "@/ui";

export function DiscoveryScreenCard({ screen, categoryLabel, onPress }: { screen: DiscoveryScreen; categoryLabel: string; onPress: () => void }) {
  const { colors } = useTheme();
  const cover = screen.photos[0];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${screen.screenName}, ${screen.city}, ${formatINR(screen.pricePerDay)} per day`}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={[styles.cover, { backgroundColor: colors.muted }]}>
        {cover ? <Image source={{ uri: cover.downloadUrl }} style={StyleSheet.absoluteFill} /> : null}
        {screen.isLive ? (
          <View style={[styles.liveBadge, { backgroundColor: colors.card }]}>
            <LiveIndicator live liveLabel="Live" />
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text variant="label" weight="semibold" numberOfLines={1}>
          {screen.screenName}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {categoryLabel} · {screen.city}
        </Text>
        <Text variant="label" weight="bold" tone="primary">
          {formatINR(screen.pricePerDay)}/day
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderWidth: 1, borderRadius: radii.lg, overflow: "hidden" },
  cover: { aspectRatio: 16 / 10, justifyContent: "flex-start" },
  liveBadge: { alignSelf: "flex-start", margin: spacing(2), borderRadius: radii.full, paddingHorizontal: spacing(2), paddingVertical: 3 },
  body: { padding: spacing(3), gap: 2 },
});
