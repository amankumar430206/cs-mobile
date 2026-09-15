import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useMeQuery } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import { env } from "@/config/env";
import { kycStatusCopy, type KycStatus } from "@/features/kyc/kycStatus";
import { initialsOf, maskAccountNumber } from "@/lib/format";
import { signOut } from "@/platform/auth";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, ListItem, Screen, Section, StatusPill, Text } from "@/ui";
import { accountRoutes } from "./routes";

export function AccountScreen() {
  const { data: user } = useMeQuery();
  const { colors } = useTheme();
  if (!user) return null;

  const isAdvertiser = user.role === "ADVERTISER";
  const profile = isAdvertiser ? user.advertiser : user.screenPartner;
  const kycStatus = ((isAdvertiser ? user.advertiser?.verification_status : user.screenPartner?.kyc_status) ?? "PENDING") as KycStatus;
  const kyc = kycStatusCopy(kycStatus);
  const routes = accountRoutes(user.role);

  return (
    <Screen edges={["top"]} contentStyle={styles.content}>
      <Text variant="title" accessibilityRole="header">
        Account
      </Text>

      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text variant="heading" weight="bold" style={{ color: colors.secondary }}>
            {initialsOf(user.full_name) || "?"}
          </Text>
        </View>
        <View style={styles.profileText}>
          <Text variant="heading" numberOfLines={1}>
            {user.full_name}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {isAdvertiser ? (user.advertiser?.business_name ?? "Advertiser") : "Screen Partner"}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {[user.mobile_number, user.email].filter(Boolean).join(" · ")}
          </Text>
        </View>
      </Card>

      <Section title="Verification">
        <Card style={styles.menu}>
          <ListItem
            icon="shield"
            title="KYC & verification"
            subtitle={kyc.message}
            trailing={<StatusPill label={kyc.label} tone={kyc.tone} />}
            onPress={() => router.push(routes.kyc)}
          />
          {kycStatus === "APPROVED" ? (
            <ListItem
              icon="bank"
              title="Bank details"
              subtitle={profile?.bank_account_number ? maskAccountNumber(profile.bank_account_number) : "Not added yet"}
              onPress={() => router.push(routes.bankDetails)}
              divider
            />
          ) : null}
        </Card>
      </Section>

      <Section title="Settings">
        <Card style={styles.menu}>
          <ListItem icon="person" title="Edit profile" onPress={() => router.push(routes.profile)} />
          <ListItem icon="lock" title="Change password" onPress={() => router.push(routes.password)} divider />
          <ListItem icon="bellSettings" title="Notification settings" onPress={() => router.push(routes.notificationSettings)} divider />
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
  content: { gap: spacing(5) },
  profileCard: { flexDirection: "row", alignItems: "center", gap: spacing(4) },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  profileText: { flex: 1, gap: 2 },
  menu: { padding: 0, gap: 0, overflow: "hidden", borderRadius: radii.lg },
  footer: { marginTop: "auto", gap: spacing(3) },
});
