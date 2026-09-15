import { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClaimActivationMutation, type ClaimActivationResult } from "@castadi/shared/hooks";
import { spacing } from "@castadi/shared/tokens";
import { formatDateTime } from "@/lib/format";
import { toast } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, DetailRow, Text, TextField } from "@/ui";

// Mirrors cs-api's claimActivationSchema and cs-web's LinkDeviceDialog (exactly 6 digits).
const linkDeviceSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code shown on the device"),
});
type LinkDeviceFormValues = z.infer<typeof linkDeviceSchema>;

interface LinkDeviceSheetProps {
  screenId: string;
  visible: boolean;
  onClose: () => void;
}

export function LinkDeviceSheet({ screenId, visible, onClose }: LinkDeviceSheetProps) {
  const { colors } = useTheme();
  const claim = useClaimActivationMutation(screenId);
  const [result, setResult] = useState<ClaimActivationResult | null>(null);
  const { control, handleSubmit, reset } = useForm<LinkDeviceFormValues>({
    resolver: zodResolver(linkDeviceSchema),
    defaultValues: { code: "" },
  });

  const close = () => {
    reset();
    setResult(null);
    claim.reset();
    onClose();
  };

  const onSubmit = handleSubmit(async ({ code }) => {
    try {
      const linked = await claim.mutateAsync(code);
      setResult(linked);
      toast.success("Device linked. It will pick up content on its next sync.");
    } catch {
      // The API client already surfaced the error.
    }
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <SafeAreaView style={[styles.sheet, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text variant="heading">Link your Ad Player</Text>
          <Button title="Close" variant="ghost" onPress={close} style={styles.close} />
        </View>

        {result ? (
          <View style={styles.body}>
            <Text variant="label" weight="semibold" tone="success">
              {result.screenName} is linked to device {result.device.deviceId}.
            </Text>
            <Card>
              <DetailRow label="Device ID" value={result.device.deviceId} />
              <DetailRow label="Reported model" value={result.device.reportedModel ?? "Not reported"} />
              <DetailRow label="App version" value={result.device.reportedAppVersion ?? "Not reported"} />
              <DetailRow label="Linked at" value={formatDateTime(result.device.claimedAt)} />
            </Card>
            <Button title="Done" onPress={close} />
          </View>
        ) : (
          <View style={styles.body}>
            <Text tone="muted">Enter the 6-digit code shown on the device&apos;s screen to connect it to this listing.</Text>
            <TextField
              control={control}
              name="code"
              label="Activation code"
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              style={styles.codeInput}
            />
            <Button title="Link device" onPress={onSubmit} loading={claim.isPending} />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(2),
  },
  close: { minHeight: 40 },
  body: { padding: spacing(5), gap: spacing(4) },
  codeInput: { fontSize: 28, letterSpacing: 10, textAlign: "center", fontVariant: ["tabular-nums"] },
});
