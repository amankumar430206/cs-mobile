import { StyleSheet, View } from "react-native";
import { radii, spacing } from "@castadi/shared/tokens";
import { formatDate } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { Card, StatusPill, Text } from "@/ui";
import { kycStatusCopy, type KycStatus } from "./kycStatus";

interface KycStatusCardProps {
  status: KycStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
}

export function KycStatusCard({ status, rejectionReason, submittedAt }: KycStatusCardProps) {
  const { colors } = useTheme();
  const copy = kycStatusCopy(status);

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="heading">Verification status</Text>
        <StatusPill label={copy.label} tone={copy.tone} />
      </View>
      <Text tone="muted">{copy.message}</Text>
      {submittedAt ? (
        <Text variant="caption" tone="muted">
          Last submitted {formatDate(submittedAt)}
        </Text>
      ) : null}
      {status === "REJECTED" && rejectionReason ? (
        <View style={[styles.reason, { backgroundColor: `${colors.danger}14`, borderColor: `${colors.danger}4D` }]}>
          <Text variant="label" weight="semibold" tone="danger">
            Reason
          </Text>
          <Text variant="caption">{rejectionReason}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing(2) },
  reason: { borderWidth: 1, borderRadius: radii.md, padding: spacing(3), gap: 2 },
});
