import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubmitKycMutation } from "@castadi/shared/hooks";
import { ADVERTISER_BUSINESS_CATEGORIES, advertiserKycSchema, type AdvertiserKycFormValues } from "@castadi/shared/schemas";
import { toast } from "@/platform/toast";
import { Button, Card, CheckboxField, DevFillButton, PickerField, Section, TextField } from "@/ui";
import { withoutBlanks } from "./kycStatus";

export function AdvertiserKycForm() {
  const queryClient = useQueryClient();
  const submitKyc = useSubmitKycMutation();
  const { control, handleSubmit, reset } = useForm<AdvertiserKycFormValues>({
    resolver: zodResolver(advertiserKycSchema),
    defaultValues: {
      businessAddress: "",
      businessCategory: "",
      billingState: "",
      billingPincode: "",
      gstNumber: "",
      panNumber: "",
      cin: "",
      wantsGstInvoice: false,
      brandName: "",
      brandWebsite: "",
      socialMediaLinks: "",
      acceptTerms: false,
      acceptCopyrightDeclaration: false,
      acceptAdvertisingPolicy: false,
    },
  });

  // Same values as cs-web's KYC test fill (the seeded advertiser); __DEV__-guarded so release bundles drop them.
  const fillTestData = () => {
    if (!__DEV__) return;
    reset({
      businessAddress: "221 MG Road, Bengaluru",
      gstNumber: "29ABCDE1234F1Z5",
      panNumber: "ABCDE1234F",
      businessCategory: "RETAIL",
      cin: "",
      billingState: "Karnataka",
      billingPincode: "560001",
      wantsGstInvoice: true,
      brandName: "Bloom",
      brandWebsite: "https://bloomretail.example.com",
      socialMediaLinks: "https://instagram.com/bloomretail",
      acceptTerms: true,
      acceptCopyrightDeclaration: true,
      acceptAdvertisingPolicy: true,
    });
  };

  const onSubmit = handleSubmit(async (data) => {
    const socialMediaLinks = data.socialMediaLinks
      ? data.socialMediaLinks.split(",").map((link) => link.trim()).filter(Boolean)
      : [];
    try {
      await submitKyc.mutateAsync({
        ...withoutBlanks({ ...data, socialMediaLinks: undefined }),
        ...(socialMediaLinks.length ? { socialMediaLinks } : {}),
      });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Submitted for review. We'll notify you once it's decided.");
    } catch {
      // The API client already surfaced the error.
    }
  });

  return (
    <>
      {__DEV__ ? <DevFillButton title="Fill test data" onPress={fillTestData} /> : null}

      <Section title="Business details">
        <Card>
          <TextField control={control} name="businessAddress" label="Business address" multiline autoComplete="street-address" />
          <PickerField control={control} name="businessCategory" label="Business category" options={ADVERTISER_BUSINESS_CATEGORIES} />
          <TextField control={control} name="billingState" label="Billing state" />
          <TextField control={control} name="billingPincode" label="Billing PIN code" keyboardType="number-pad" maxLength={6} autoComplete="postal-code" />
        </Card>
      </Section>

      <Section title="Tax & registration (optional)">
        <Card>
          <TextField control={control} name="gstNumber" label="GST number" autoCapitalize="characters" autoCorrect={false} maxLength={15} />
          <TextField control={control} name="panNumber" label="PAN number" autoCapitalize="characters" autoCorrect={false} maxLength={10} />
          <TextField
            control={control}
            name="cin"
            label="CIN"
            hint="Only for registered companies"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={21}
          />
          <CheckboxField control={control} name="wantsGstInvoice" label="I want a GST invoice for this account" />
        </Card>
      </Section>

      <Section title="Brand (optional)">
        <Card>
          <TextField control={control} name="brandName" label="Brand name" />
          <TextField control={control} name="brandWebsite" label="Brand website" keyboardType="url" autoCapitalize="none" autoCorrect={false} placeholder="https://" />
          <TextField
            control={control}
            name="socialMediaLinks"
            label="Social media links"
            hint="Comma-separated URLs, up to 5"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Card>
      </Section>

      <Section title="Agreements">
        <Card>
          <CheckboxField control={control} name="acceptTerms" label="I accept the Terms & Conditions." />
          <CheckboxField control={control} name="acceptCopyrightDeclaration" label="I declare that I hold the rights to any creative content I upload." />
          <CheckboxField control={control} name="acceptAdvertisingPolicy" label="I accept CASTADI's advertising policy." />
        </Card>
      </Section>

      <Button title="Submit for review" onPress={onSubmit} loading={submitKyc.isPending} />
    </>
  );
}
