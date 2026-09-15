import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { useCategoriesQuery, useMeQuery, useRegisterScreenMutation } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import type { ScreenFormOutput } from "@castadi/shared/schemas";
import { toast } from "@/platform/toast";
import { Button, Screen, Skeleton, StatusView, Text } from "@/ui";
import { ScreenForm } from "./ScreenForm";
import { screenMediaRoute } from "./screenStatus";

export function RegisterScreenScreen() {
  const { data: user } = useMeQuery();
  const categories = useCategoriesQuery();
  const register = useRegisterScreenMutation();

  // cs-api refuses registration until KYC is approved; say so up front instead of after a long form.
  if (user?.screenPartner?.kyc_status !== "APPROVED") {
    return (
      <StatusView title="Complete KYC first" message="Your KYC needs to be approved before you can register a screen.">
        <Button title="Go to KYC & verification" onPress={() => router.push("/partner/account/kyc")} />
      </StatusView>
    );
  }

  const onSubmit = async (values: ScreenFormOutput) => {
    try {
      const screen = await register.mutateAsync(values);
      toast.success("Screen registered. Add photos and a video, then submit it for review.");
      router.replace(screenMediaRoute(screen.id));
    } catch {
      // The API client already surfaced the error.
    }
  };

  return (
    <Screen edges={["bottom"]} contentStyle={styles.content}>
      <Text tone="muted">A full listing with photos, an installation video and admin review before it goes live.</Text>
      {categories.data ? (
        <ScreenForm categories={categories.data} submitLabel="Register screen" isSubmitting={register.isPending} onSubmit={onSubmit} />
      ) : (
        <Skeleton height={420} radius={radii.lg} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(4), paddingBottom: spacing(10) },
});
