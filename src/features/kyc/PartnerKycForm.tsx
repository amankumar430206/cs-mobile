import { useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubmitKycMutation } from "@castadi/shared/hooks";
import { LEGAL_STRUCTURES, screenPartnerKycSchema, type ScreenPartnerKycFormValues } from "@castadi/shared/schemas";
import { toast } from "@/platform/toast";
import { Button, Card, CheckboxField, DevFillButton, PickerField, Section, TextField } from "@/ui";
import { withoutBlanks } from "./kycStatus";

export function PartnerKycForm() {
  const queryClient = useQueryClient();
  const submitKyc = useSubmitKycMutation();
  const { control, handleSubmit, reset } = useForm<ScreenPartnerKycFormValues>({
    resolver: zodResolver(screenPartnerKycSchema),
    defaultValues: {
      aadhaarNumber: "",
      panNumber: "",
      bankAccountNumber: "",
      bankIfsc: "",
      bankAccountName: "",
      upiId: "",
      businessName: "",
      legalStructure: "",
      gstNumber: "",
      udyamNumber: "",
      cin: "",
      acceptTerms: false,
      acceptDigitalAgreement: false,
      acceptRevenueSharingAgreement: false,
    },
  });
  const legalStructure = useWatch({ control, name: "legalStructure" });

  // Same values as cs-web's KYC test fill (the seeded partner); __DEV__-guarded so release bundles drop them.
  const fillTestData = () => {
    if (!__DEV__) return;
    reset({
      aadhaarNumber: "999900000001",
      panNumber: "RAMSH1234F",
      bankAccountNumber: "00011122233",
      bankIfsc: "HDFC0001234",
      bankAccountName: "Ramesh Kumar",
      upiId: "rameshkumar@upi",
      businessName: "",
      legalStructure: "INDIVIDUAL",
      gstNumber: "",
      udyamNumber: "",
      cin: "",
      acceptTerms: true,
      acceptDigitalAgreement: true,
      acceptRevenueSharingAgreement: true,
    });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await submitKyc.mutateAsync(withoutBlanks({ ...data, bankIfsc: data.bankIfsc.toUpperCase(), panNumber: data.panNumber.toUpperCase() }));
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Submitted for review. We'll notify you once it's decided.");
    } catch {
      // The API client already surfaced the error.
    }
  });

  return (
    <>
      {__DEV__ ? <DevFillButton title="Fill test data" onPress={fillTestData} /> : null}

      <Section title="Identity">
        <Card>
          <TextField control={control} name="aadhaarNumber" label="Aadhaar number" keyboardType="number-pad" maxLength={12} autoComplete="off" />
          <TextField control={control} name="panNumber" label="PAN number" autoCapitalize="characters" autoCorrect={false} maxLength={10} />
        </Card>
      </Section>

      <Section title="Bank details">
        <Card>
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
        </Card>
      </Section>

      <Section title="Business (optional)">
        <Card>
          <TextField control={control} name="businessName" label="Business name" />
          <PickerField control={control} name="legalStructure" label="Legal structure" options={LEGAL_STRUCTURES} placeholder="Select if registered" />
          <TextField control={control} name="gstNumber" label="GST number" autoCapitalize="characters" autoCorrect={false} maxLength={15} />
          <TextField
            control={control}
            name="udyamNumber"
            label="UDYAM number"
            placeholder="UDYAM-XX-00-0000000"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TextField
            control={control}
            name="cin"
            label={legalStructure === "COMPANY" ? "CIN" : "CIN (optional)"}
            hint={legalStructure === "COMPANY" ? "Required for companies" : undefined}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={21}
          />
        </Card>
      </Section>

      <Section title="Agreements">
        <Card>
          <CheckboxField control={control} name="acceptTerms" label="I accept the Terms & Conditions." />
          <CheckboxField control={control} name="acceptDigitalAgreement" label="I accept the Digital Agreement." />
          <CheckboxField control={control} name="acceptRevenueSharingAgreement" label="I accept the Revenue Sharing Agreement." />
        </Card>
      </Section>

      <Button title="Submit for review" onPress={onSubmit} loading={submitKyc.isPending} />
    </>
  );
}
