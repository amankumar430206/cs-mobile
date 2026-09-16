import { useCallback, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Link, router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiClientError } from "@castadi/shared";
import { useLoginMutation } from "@castadi/shared/hooks";
import { loginSchema, type LoginFormValues } from "@castadi/shared/schemas";
import { brand, spacing } from "@castadi/shared/tokens";
import { AdBillboard } from "@/features/brand/AdBillboard";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, DevFillButton, Text, TextField } from "@/ui";
import wordmarkOnDark from "../../../assets/brand/wordmark-on-dark.png";

const CREAM = brand.foreground;
const CREAM_MUTED = "rgba(255,252,243,0.64)";
const GUTTER = spacing(5);

// Artwork is ~7.3:1.
const WORDMARK_WIDTH = 132;
const WORDMARK_HEIGHT = 18;

export function LoginScreen() {
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const login = useLoginMutation();
  const { control, handleSubmit, reset } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  // Light status bar only while this screen (with its dark hero) is on top.
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  // KYC-approved accounts from cs-api's seed (db/seeds/01_e2e_demo_data.js). Inside the
  // __DEV__ guard so release bundles don't carry them.
  const fillDemoLogin = (role: "ADVERTISER" | "SCREEN_PARTNER") => {
    if (!__DEV__) return;
    const identifier = role === "ADVERTISER" ? "adv.approved@demo.castadi.test" : "partner.approved@demo.castadi.test";
    reset({ identifier, password: "Passw0rd!" });
  };

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

  const billboardWidth = Math.min(width - GUTTER * 2, 420);
  const hero = mode === "dark" ? "#0A0A0A" : brand.secondary;

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {focused ? <StatusBar style="light" /> : null}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.fill}>
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing(6) }]}
        >
          <View style={[styles.hero, { backgroundColor: hero, paddingTop: insets.top + spacing(4) }]}>
            {/* Warm light spilling from behind the billboard. */}
            <View style={[styles.glow, { width: width * 1.1, height: width * 1.1, borderRadius: width * 0.55 }]} pointerEvents="none" />

            <View style={styles.brandRow}>
              <Image source={wordmarkOnDark} style={styles.wordmark} resizeMode="contain" accessibilityRole="header" accessibilityLabel="CASTADI" />
              <View style={styles.tag}>
                <Text variant="caption" weight="medium" style={styles.tagText}>
                  Digital out-of-home
                </Text>
              </View>
            </View>

            <View style={styles.billboard}>
              <AdBillboard width={billboardWidth} aspectRatio={2.1} showStand={false} />
            </View>

            <Text weight="bold" style={styles.headline}>
              Put your brand on{"\n"}
              <Text weight="bold" style={[styles.headline, { color: brand.primary }]}>
                every screen.
              </Text>
            </Text>
            <Text style={styles.subhead}>Manage campaigns, screens and earnings — wherever you are.</Text>
          </View>

          {/* Brand stripe where the hero meets the form, echoing the orange accent rules on the web. */}
          <View style={[styles.stripe, { backgroundColor: brand.primary }]} />

          <View style={styles.form}>
            <View style={styles.formHeader}>
              <Text variant="title">Welcome back</Text>
              <Text tone="muted">Log in to your advertiser or screen partner account.</Text>
            </View>

            <TextField
              control={control}
              name="identifier"
              label="Email or mobile number"
              placeholder="you@company.com"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              keyboardType="email-address"
              returnKeyType="next"
            />
            <View style={styles.passwordBlock}>
              <TextField
                control={control}
                name="password"
                label="Password"
                placeholder="Your password"
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
            </View>

            <Button title="Log in" loading={login.isPending} onPress={onSubmit} />

            {__DEV__ ? (
              <View style={styles.devFill}>
                <DevFillButton title="Demo advertiser" onPress={() => fillDemoLogin("ADVERTISER")} />
                <DevFillButton title="Demo partner" onPress={() => fillDemoLogin("SCREEN_PARTNER")} />
              </View>
            ) : null}

            <View style={styles.divider}>
              <View style={[styles.rule, { backgroundColor: colors.border }]} />
              <Text variant="caption" tone="muted">
                New to CASTADI?
              </Text>
              <View style={[styles.rule, { backgroundColor: colors.border }]} />
            </View>

            <Link href="/register" asChild>
              <Button title="Create an account" variant="secondary" />
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: { paddingHorizontal: GUTTER, paddingBottom: spacing(7), gap: spacing(5), overflow: "hidden" },
  glow: { position: "absolute", alignSelf: "center", top: "12%", backgroundColor: brand.primary, opacity: 0.12 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wordmark: { width: WORDMARK_WIDTH, height: WORDMARK_HEIGHT },
  tag: { borderWidth: 1, borderColor: "rgba(255,252,243,0.2)", paddingHorizontal: spacing(2), paddingVertical: 2 },
  tagText: { color: CREAM_MUTED, letterSpacing: 0.4 },
  billboard: { alignItems: "center", marginTop: spacing(1) },
  headline: { color: CREAM, fontSize: 28, lineHeight: 36 },
  subhead: { color: CREAM_MUTED, marginTop: -spacing(3) },
  stripe: { height: 3 },
  form: { padding: GUTTER, paddingTop: spacing(6), gap: spacing(4) },
  formHeader: { gap: spacing(1), marginBottom: spacing(1) },
  passwordBlock: { gap: 0 },
  forgot: { alignSelf: "flex-end", minHeight: 36, paddingHorizontal: 0, marginTop: spacing(1) },
  devFill: { gap: spacing(2) },
  divider: { flexDirection: "row", alignItems: "center", gap: spacing(3), marginTop: spacing(2) },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
});
