import { StyleSheet, View } from "react-native";
import { Link, router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiClientError } from "@castadi/shared";
import { useLoginMutation } from "@castadi/shared/hooks";
import { loginSchema, type LoginFormValues } from "@castadi/shared/schemas";
import { spacing } from "@castadi/shared/tokens";
import { Button, Screen, Text, TextField } from "@/ui";
import { AuthHeader } from "./AuthHeader";

export function LoginScreen() {
  const login = useLoginMutation();
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  // On success the session is set and the root navigator's guard swaps to the app.
  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync({ identifier: values.identifier.trim(), password: values.password });
    } catch (err) {
      // The password already matched; this account only needs to finish mobile verification.
      if (err instanceof ApiClientError && err.code === "ACCOUNT_NOT_VERIFIED") {
        const info = err.details[0] as { userId: string; mobileNumber: string } | undefined;
        if (info) router.push({ pathname: "/verify-otp", params: { userId: info.userId, mobile: info.mobileNumber } });
      }
    }
  });

  return (
    <Screen contentStyle={styles.content}>
      <AuthHeader title="Welcome back" subtitle="Log in to manage your screens and campaigns." />

      <TextField
        control={control}
        name="identifier"
        label="Email or mobile number"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        keyboardType="email-address"
        returnKeyType="next"
      />
      <TextField
        control={control}
        name="password"
        label="Password"
        secure
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />

      <Link href="/forgot-password" asChild>
        <Button title="Forgot password?" variant="ghost" style={styles.forgot} />
      </Link>

      <Button title="Log in" loading={login.isPending} onPress={onSubmit} />

      <View style={styles.footer}>
        <Text tone="muted">New to CASTADI?</Text>
        <Link href="/register" asChild>
          <Button title="Create an account" variant="secondary" />
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: "center" },
  forgot: { alignSelf: "flex-end", minHeight: 40, paddingHorizontal: 0 },
  footer: { gap: spacing(2), marginTop: spacing(4), alignItems: "stretch" },
});
