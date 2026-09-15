import { useState } from "react";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPasswordMutation } from "@castadi/shared/hooks";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
} from "@castadi/shared/schemas";
import { otpProvider, type OtpProvider } from "@/platform/otp";
import { toast } from "@/platform/toast";
import { Button, Screen, StatusView, TextField } from "@/ui";
import { AuthHeader } from "./AuthHeader";

export function ForgotPasswordScreen() {
  if (!otpProvider) {
    return (
      <StatusView
        title="Reset on the web"
        message="Password reset needs mobile verification, which isn't available in the app yet. Reset your password from the CASTADI web app, then log in here."
      >
        <Button title="Back to login" onPress={() => router.back()} />
      </StatusView>
    );
  }
  return <ForgotPasswordFlow provider={otpProvider} />;
}

function ForgotPasswordFlow({ provider }: { provider: OtpProvider }) {
  const [identifier, setIdentifier] = useState<string | null>(null);
  const resetPassword = useResetPasswordMutation();

  const requestForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: "" },
  });
  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  });

  // Sending never touches cs-api, so nothing here reveals whether the account exists.
  const sendCode = requestForm.handleSubmit(async (values) => {
    const value = values.identifier.trim();
    try {
      await provider.send(value);
      setIdentifier(value);
      toast.success("If an account exists, a code is on its way.");
    } catch {
      toast.error("Couldn't send the code. Please try again.");
    }
  });

  const submitReset = resetForm.handleSubmit(async (values) => {
    if (!identifier) return;
    let accessToken: string;
    try {
      accessToken = await provider.verify(values.code);
    } catch {
      toast.error("Invalid or expired code. Please try again.");
      return;
    }
    try {
      await resetPassword.mutateAsync({ identifier, accessToken, newPassword: values.newPassword });
      toast.success("Password updated. Log in with your new password.");
      router.replace("/login");
    } catch {
      // The API client already surfaced the error.
    }
  });

  if (!identifier) {
    return (
      <Screen edges={["bottom"]}>
        <AuthHeader title="Forgot password" subtitle="Enter the email or mobile number on your account." />
        <TextField
          control={requestForm.control}
          name="identifier"
          label="Email or mobile number"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="username"
          onSubmitEditing={sendCode}
        />
        <Button title="Send code" onPress={sendCode} loading={requestForm.formState.isSubmitting} />
      </Screen>
    );
  }

  return (
    <Screen edges={["bottom"]}>
      <AuthHeader title="Set a new password" subtitle="Enter the code you received and choose a new password." />
      <TextField
        control={resetForm.control}
        name="code"
        label="Verification code"
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
      />
      <TextField
        control={resetForm.control}
        name="newPassword"
        label="New password"
        secure
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        control={resetForm.control}
        name="confirmPassword"
        label="Confirm new password"
        secure
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Button title="Update password" onPress={submitReset} loading={resetForm.formState.isSubmitting} />
    </Screen>
  );
}
