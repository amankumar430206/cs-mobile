import { StyleSheet, View } from "react-native";
import { useMeQuery } from "@castadi/shared/hooks";
import { spacing } from "@castadi/shared/tokens";
import { env } from "@/config/env";
import { humanize } from "@/lib/format";
import { signOut } from "@/platform/auth";
import { Button, Card, DetailRow, Screen, Section, Text } from "@/ui";

export function AccountScreen() {
  const { data: user } = useMeQuery();
  if (!user) return null;

  const isAdvertiser = user.role === "ADVERTISER";
  const verification = isAdvertiser ? user.advertiser?.verification_status : user.screenPartner?.kyc_status;

  return (
    <Screen edges={["top"]} contentStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="title" accessibilityRole="header">
          Account
        </Text>
        <Text tone="muted">{user.full_name}</Text>
      </View>

      <Section title="Profile">
        <Card>
          <DetailRow label="Role" value={isAdvertiser ? "Advertiser" : "Screen Partner"} />
          {isAdvertiser ? <DetailRow label="Business" value={user.advertiser?.business_name} /> : null}
          <DetailRow label="Mobile" value={user.mobile_number} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Account status" value={humanize(user.status)} />
          <DetailRow label={isAdvertiser ? "Verification" : "KYC"} value={verification ? humanize(verification) : "Not submitted"} />
        </Card>
      </Section>

      <View style={styles.footer}>
        <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
        <Text variant="caption" tone="muted" align="center">
          CASTADI {env.appVersion}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(6) },
  header: { gap: spacing(1) },
  footer: { marginTop: "auto", gap: spacing(3) },
});
