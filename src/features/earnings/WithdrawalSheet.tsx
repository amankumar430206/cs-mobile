import { useMemo } from "react";
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateWithdrawalMutation } from "@castadi/shared/hooks";
import { spacing } from "@castadi/shared/tokens";
import { formatINRPrecise } from "@/lib/format";
import { toast } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Text, TextField } from "@/ui";

// cs-api accepts a positive amount with up to 2 decimals, no more than the wallet balance.
const withdrawalSchema = (balance: number) =>
  z.object({
    amount: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount with up to 2 decimals")
      .refine((value) => Number(value) > 0, "Enter an amount greater than zero")
      .refine((value) => Number(value) <= balance, `You can withdraw up to ${formatINRPrecise(balance)}`),
  });

type WithdrawalFormValues = { amount: string };

export function WithdrawalSheet({ visible, balance, onClose }: { visible: boolean; balance: number; onClose: () => void }) {
  const { colors } = useTheme();
  const createWithdrawal = useCreateWithdrawalMutation();
  const schema = useMemo(() => withdrawalSchema(balance), [balance]);
  const { control, handleSubmit, reset, setValue } = useForm<WithdrawalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "" },
  });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async ({ amount }) => {
    try {
      await createWithdrawal.mutateAsync(Number(amount));
      toast.success("Withdrawal requested. An admin will review it shortly.");
      close();
    } catch {
      // The API client already surfaced the error.
    }
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <SafeAreaView style={[styles.sheet, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.sheet}>
          <View style={styles.header}>
            <Text variant="heading">Request a withdrawal</Text>
            <Button title="Close" variant="ghost" onPress={close} style={styles.close} />
          </View>
          <View style={styles.body}>
            <Text tone="muted">
              An admin reviews the request and pays it out to your bank. You can request up to your balance of {formatINRPrecise(balance)}.
            </Text>
            <TextField control={control} name="amount" label="Amount (₹)" keyboardType="decimal-pad" autoFocus placeholder="0.00" />
            <Button
              title={`Withdraw full balance (${formatINRPrecise(balance)})`}
              variant="ghost"
              style={styles.fullBalance}
              onPress={() => setValue("amount", String(balance), { shouldValidate: true })}
            />
            <Button title="Submit request" onPress={onSubmit} loading={createWithdrawal.isPending} />
          </View>
        </KeyboardAvoidingView>
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
  fullBalance: { alignSelf: "flex-start", minHeight: 36, paddingHorizontal: 0 },
});
