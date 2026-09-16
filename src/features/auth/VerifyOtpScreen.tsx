import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVerifyOtpMutation } from "@castadi/shared/hooks";
import { verifyOtpSchema, type VerifyOtpFormValues } from "@castadi/shared/schemas";
import { otpProvider, type OtpProvider } from "@/platform/otp";
import { toast } from "@/platform/toast";
import { Button, Screen, StatusView, TextField } from "@/ui";
import { AuthHeader } from "./AuthHeader";

const RESEND_COOLDOWN_SECONDS = 30;

export function VerifyOtpScreen() {
  const { userId, mobile } = useLocalSearchParams<{ userId?: string; mobile?: string }>();
  const backToLogin = () => router.replace("/login");

  if (!otpProvider) {
    return (
      <StatusView
        title="Verify on the web"
        message="Mobile number verification isn't available in the app yet. Verify your number from the CASTADI web app, then log in here."
      >
        <Button title="Back to login" onPress={backToLogin} />
      </StatusView>
    );
  }

  if (!userId || !mobile) {
    return (
      <StatusView title="Something's missing" message="We couldn't find the account to verify. Log in again to continue.">
        <Button title="Back to login" onPress={backToLogin} />
      </StatusView>
    );
  }

  return <VerifyOtpForm provider={otpProvider} userId={userId} mobile={mobile} />;
}

function VerifyOtpForm({ provider, userId, mobile }: { provider: OtpProvider; userId: string; mobile: string }) {
  const verifyOtp = useVerifyOtpMutation();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  // A provider token is single-use; the ref blocks a second submit before state re-renders.
  const submittingRef = useRef(false);

  const { control, handleSubmit, formState } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const send = async () => {
    setSending(true);
    try {
      await (sent ? provider.resend() : provider.send(mobile));
      setSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success(`Code sent to the number ending in ${mobile.slice(-4)}.`);
    } catch {
      toast.error("Couldn't send the code. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Success sets the session; the root navigator's guard moves the user into the app.
  const submitCode = handleSubmit(async ({ code }) => {
    try {
      const accessToken = await provider.verify(code);
      await verifyOtp.mutateAsync({ userId, accessToken });
    } catch (err) {
      if (!(err instanceof Error && err.name === "ApiClientError")) toast.error("Invalid or expired code. Please try again.");
    }
  });

  // The guard wraps handleSubmit's output so the ref is only touched from event handlers.
  const onSubmit = () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    void submitCode().finally(() => {
      submittingRef.current = false;
    });
  };

  return (
    <Screen edges={["bottom"]}>
      <AuthHeader title="Verify your mobile number" subtitle={`We'll send a 6-digit code to the number ending in ${mobile.slice(-4)}.`} />

      {sent && (
        <TextField
          control={control}
          name="code"
          label="Verification code"
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          autoFocus
          onSubmitEditing={onSubmit}
        />
      )}

      {sent ? (
        <>
          <Button title="Verify" onPress={onSubmit} loading={formState.isSubmitting} />
          <Button
            title={cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            variant="outline"
            onPress={send}
            loading={sending}
            disabled={cooldown > 0 || formState.isSubmitting}
          />
        </>
      ) : (
        <Button title="Send code" onPress={send} loading={sending} />
      )}
    </Screen>
  );
}
