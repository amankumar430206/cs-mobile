import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiClientError } from "@castadi/shared";
import { useCheckAvailabilityMutation, useLoginMutation, useRegisterMutation, type RegisterInput } from "@castadi/shared/hooks";
import { onboardingSchema, type OnboardingFormValues } from "@castadi/shared/schemas";
import { radii, spacing } from "@castadi/shared/tokens";
import { PARTNER_TYPES } from "@castadi/shared/types";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, CheckboxField, DateField, DevFillButton, PickerField, Screen, Text, TextField } from "@/ui";
import { AuthHeader } from "./AuthHeader";

type Field = keyof OnboardingFormValues;

const STEPS = ["Account type", "Your details", "Security"] as const;

const STEP_FIELDS: Record<number, Field[]> = {
  0: ["role"],
  1: ["fullName", "mobileNumber", "email", "businessName", "contactPerson", "partnerType", "dateOfBirth", "city", "state"],
  2: ["password", "confirmPassword", "referralCode", "acceptTerms"],
};

const stepOf = (field: string) => Number(Object.keys(STEP_FIELDS).find((step) => STEP_FIELDS[Number(step)].includes(field as Field)) ?? 0);

const ROLES = [
  { value: "ADVERTISER", title: "Advertiser", description: "Book screens and run ad campaigns." },
  { value: "SCREEN_PARTNER", title: "Screen Partner", description: "List your screens and earn from ads." },
] as const;

export function RegisterScreen() {
  const [step, setStep] = useState(0);
  const registerMutation = useRegisterMutation();
  const login = useLoginMutation();
  const checkAvailability = useCheckAvailabilityMutation();

  const { control, handleSubmit, trigger, setValue, setError, getValues, reset } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: "ADVERTISER",
      fullName: "",
      mobileNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
      businessName: "",
      contactPerson: "",
      partnerType: "",
      dateOfBirth: "",
      city: "",
      state: "",
      acceptTerms: false,
    },
  });
  const role = useWatch({ control, name: "role" });

  // Same values as cs-web's registration test fill. Kept inside the __DEV__ guard so release
  // bundles drop them; email and mobile are unique per fill so repeat registrations don't 409.
  const fillTestData = () => {
    if (!__DEV__) return;
    const stamp = String(Date.now());
    const common = {
      password: "Passw0rd!",
      confirmPassword: "Passw0rd!",
      referralCode: "",
      acceptTerms: true,
      email: `aman.vishwakarma.dev+m${stamp}@gmail.com`,
      mobileNumber: `9${stamp.slice(-9)}`,
    };
    const roleValues =
      role === "ADVERTISER"
        ? { fullName: "Test Advertiser", contactPerson: "Asha Rao", businessName: "Bloom Retail Co" }
        : {
            fullName: "Test Partner",
            dateOfBirth: "1988-06-12",
            city: "Bengaluru",
            state: "Karnataka",
            partnerType: "AUTO_RICKSHAW_DRIVER",
          };
    reset({ ...getValues(), ...common, ...roleValues, role });
  };

  const goNext = async () => {
    if (!(await trigger(STEP_FIELDS[step]))) return;

    if (step === 1) {
      const { mobileNumber, email } = getValues();
      try {
        const { available } = await checkAvailability.mutateAsync({ mobileNumber, email: email || undefined });
        if (!available) {
          // Never says which field collided, same as cs-api's own 409.
          setError("mobileNumber", {
            message: "This email or mobile number is already registered. Log in if it's yours, or use a different one.",
          });
          return;
        }
      } catch {
        // Best-effort; registration itself is the authoritative duplicate check.
      }
    }
    setStep((current) => current + 1);
  };

  // Role-specific rules live in the schema's superRefine, which only runs once the whole
  // object is valid, so they can surface at final submit — jump back to that step.
  const onInvalid = (errors: FieldErrors<OnboardingFormValues>) => {
    const first = Object.keys(errors)[0];
    if (first) setStep(stepOf(first));
  };

  const onSubmit = handleSubmit(async (data) => {
    const payload: RegisterInput =
      data.role === "ADVERTISER"
        ? {
            role: data.role,
            fullName: data.fullName,
            mobileNumber: data.mobileNumber,
            email: data.email || undefined,
            password: data.password,
            businessName: data.businessName,
            contactPerson: data.contactPerson,
            referralCode: data.referralCode || undefined,
          }
        : {
            role: data.role,
            fullName: data.fullName,
            mobileNumber: data.mobileNumber,
            email: data.email || undefined,
            password: data.password,
            partnerType: data.partnerType,
            dateOfBirth: data.dateOfBirth,
            city: data.city,
            state: data.state,
            referralCode: data.referralCode || undefined,
          };

    try {
      const result = await registerMutation.mutateAsync(payload);
      // cs-api activates immediately when its OTP-bypass flag is on; log straight in.
      if (result.status === "ACTIVE") {
        await login.mutateAsync({ identifier: data.mobileNumber, password: data.password });
        return;
      }
      router.replace({ pathname: "/verify-otp", params: { userId: result.userId, mobile: data.mobileNumber } });
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "DUPLICATE_ACCOUNT") setStep(1);
    }
  }, onInvalid);

  const submitting = registerMutation.isPending || login.isPending;

  return (
    <Screen edges={["bottom"]}>
      <AuthHeader title="Create your account" subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`} />
      {__DEV__ ? (
        <DevFillButton title={`Fill test data (${role === "ADVERTISER" ? "advertiser" : "partner"})`} onPress={fillTestData} />
      ) : null}

      {step === 0 && (
        <View style={styles.roles} accessibilityRole="radiogroup">
          {ROLES.map((option) => (
            <RoleCard
              key={option.value}
              title={option.title}
              description={option.description}
              selected={role === option.value}
              onPress={() => setValue("role", option.value, { shouldValidate: true })}
            />
          ))}
        </View>
      )}

      {step === 1 && (
        <>
          <TextField control={control} name="fullName" label="Full name" autoComplete="name" textContentType="name" />
          <TextField
            control={control}
            name="mobileNumber"
            label="Mobile number"
            hint="10-digit Indian mobile number"
            keyboardType="number-pad"
            maxLength={10}
            autoComplete="tel-national"
            textContentType="telephoneNumber"
          />
          <TextField
            control={control}
            name="email"
            label={role === "ADVERTISER" ? "Work email" : "Email (optional)"}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          {role === "ADVERTISER" ? (
            <>
              <TextField control={control} name="businessName" label="Business name" autoComplete="organization" />
              <TextField control={control} name="contactPerson" label="Contact person" />
            </>
          ) : (
            <>
              <PickerField control={control} name="partnerType" label="Partner type" options={PARTNER_TYPES} />
              <DateField control={control} name="dateOfBirth" label="Date of birth" maximumDate={new Date()} />
              <TextField control={control} name="city" label="City" autoComplete="address-line2" />
              <TextField control={control} name="state" label="State" />
            </>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <TextField
            control={control}
            name="password"
            label="Password"
            hint="At least 8 characters with upper and lower case letters, a number and a symbol"
            secure
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <TextField
            control={control}
            name="confirmPassword"
            label="Confirm password"
            secure
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <TextField control={control} name="referralCode" label="Referral code (optional)" autoCapitalize="characters" />
          <CheckboxField control={control} name="acceptTerms" label="I accept the Terms & Conditions" />
        </>
      )}

      <View style={styles.actions}>
        {step > 0 && (
          <Button title="Back" variant="secondary" style={styles.action} onPress={() => setStep((current) => current - 1)} disabled={submitting} />
        )}
        {step < STEPS.length - 1 ? (
          <Button title="Continue" style={styles.action} onPress={goNext} loading={checkAvailability.isPending} />
        ) : (
          <Button title="Create account" style={styles.action} onPress={onSubmit} loading={submitting} />
        )}
      </View>
    </Screen>
  );
}

function RoleCard({ title, description, selected, onPress }: { title: string; description: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={[styles.roleCard, { borderColor: selected ? colors.primary : colors.border, backgroundColor: colors.card }]}
    >
      <Text variant="heading" tone={selected ? "primary" : "default"}>
        {title}
      </Text>
      <Text tone="muted">{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  roles: { gap: spacing(3) },
  roleCard: { borderWidth: 2, borderRadius: radii.lg, padding: spacing(4), gap: spacing(1) },
  actions: { flexDirection: "row", gap: spacing(3), marginTop: spacing(2) },
  action: { flex: 1 },
});
