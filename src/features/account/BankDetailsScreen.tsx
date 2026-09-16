import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMeQuery, useUpdateAdvertiserBankDetailsMutation, useUpdateBankDetailsMutation } from "@castadi/shared/hooks";
import { bankDetailsSchema, type BankDetailsFormValues } from "@castadi/shared/schemas";
import { toast } from "@/platform/toast";
import { Button, Screen, StatusView, Text, TextField } from "@/ui";

export function BankDetailsScreen() {
  const { data: user } = useMeQuery();
  const queryClient = useQueryClient();
  const partnerUpdate = useUpdateBankDetailsMutation();
  const advertiserUpdate = useUpdateAdvertiserBankDetailsMutation();

  const isAdvertiser = user?.role === "ADVERTISER";
  const profile = isAdvertiser ? user?.advertiser : user?.screenPartner;
  const approved = (isAdvertiser ? user?.advertiser?.verification_status : user?.screenPartner?.kyc_status) === "APPROVED";
  const mutation = isAdvertiser ? advertiserUpdate : partnerUpdate;

  const { control, handleSubmit } = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      bankAccountNumber: profile?.bank_account_number ?? "",
      bankIfsc: profile?.bank_ifsc ?? "",
      bankAccountName: profile?.bank_account_name ?? "",
      upiId: profile?.upi_id ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        bankAccountNumber: values.bankAccountNumber.trim(),
        bankIfsc: values.bankIfsc.trim().toUpperCase(),
        bankAccountName: values.bankAccountName.trim(),
        upiId: values.upiId?.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Bank details saved");
      router.back();
    } catch {
      // The API client already surfaced the error.
    }
  });

  if (!approved) {
    return (
      <StatusView title="Verification required" message="You can add bank details once your KYC is approved.">
        <Button title="Go back" variant="outline" onPress={() => router.back()} />
      </StatusView>
    );
  }

  return (
    <Screen edges={["bottom"]}>
      <Text tone="muted">{isAdvertiser ? "Used for refunds." : "Used to send your payouts."}</Text>
      <TextField control={control} name="bankAccountNumber" label="Account number" keyboardType="number-pad" autoComplete="off" />
      <TextField
        control={control}
        name="bankIfsc"
        label="IFSC code"
        hint="11 characters, printed on your cheque book or passbook"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={11}
      />
      <TextField control={control} name="bankAccountName" label="Account holder name" autoComplete="name" />
      <TextField control={control} name="upiId" label="UPI ID (optional)" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
      <Button title="Save bank details" onPress={onSubmit} loading={mutation.isPending} />
    </Screen>
  );
}
