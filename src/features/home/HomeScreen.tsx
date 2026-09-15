import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useMeQuery } from "@castadi/shared/hooks";
import { spacing } from "@castadi/shared/tokens";
import { RecentNotifications } from "@/features/notifications/RecentNotifications";
import { formatToday, greeting } from "@/lib/format";
import { Screen, Text } from "@/ui";
import { AdvertiserHome } from "./AdvertiserHome";
import { PartnerHome } from "./PartnerHome";

export function HomeScreen() {
  const { data: user } = useMeQuery();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

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
  const subtitle = isAdvertiser ? (user.advertiser?.business_name ?? "Advertiser") : "Screen Partner";

  return (
    <Screen edges={["top"]} onRefresh={refresh} refreshing={refreshing} contentStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="caption" tone="muted">
          {formatToday()}
        </Text>
        <Text variant="title" accessibilityRole="header">
          {greeting()}, {user.full_name.split(" ")[0]}
        </Text>
        <Text tone="muted">{subtitle}</Text>
      </View>

      {isAdvertiser ? <AdvertiserHome user={user} /> : <PartnerHome user={user} />}

      <RecentNotifications role={user.role} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(6) },
  header: { gap: spacing(1) },
});
