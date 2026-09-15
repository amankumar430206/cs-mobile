import { StyleSheet, View } from "react-native";
import { useMeQuery } from "@castadi/shared/hooks";
import { spacing } from "@castadi/shared/tokens";
import { humanize } from "@/lib/format";
import { signOut } from "@/platform/auth";
import { Button, Card, DetailRow, Screen, Text } from "@/ui";

export function HomeScreen() {
  const { data: user } = useMeQuery();
  if (!user) return null;

  const isAdvertiser = user.role === "ADVERTISER";
  const verification = isAdvertiser ? user.advertiser?.verification_status : user.screenPartner?.kyc_status;
  const firstName = user.full_name.split(" ")[0];

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="caption" tone="muted">
          {isAdvertiser ? "Advertiser" : "Screen Partner"}
        </Text>
        <Text variant="title">Hi, {firstName}</Text>
        {isAdvertiser && user.advertiser?.business_name ? <Text tone="muted">{user.advertiser.business_name}</Text> : null}
      </View>

      <Card>
        <Text variant="heading">Account</Text>
        <DetailRow label="Mobile" value={user.mobile_number} />
        <DetailRow label="Email" value={user.email} />
        <DetailRow label="Account status" value={humanize(user.status)} />
        <DetailRow label={isAdvertiser ? "Verification" : "KYC"} value={verification ? humanize(verification) : "Not submitted"} />
      </Card>

      <Button title="Sign out" variant="secondary" onPress={() => void signOut()} style={styles.signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing(1) },
  signOut: { marginTop: "auto" },
});
