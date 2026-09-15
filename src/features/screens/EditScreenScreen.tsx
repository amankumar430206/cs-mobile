import { StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useCategoriesQuery, useMyScreenQuery, useUpdateScreenMutation } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import type { ScreenFormOutput } from "@castadi/shared/schemas";
import { EDITABLE_SCREEN_STATUSES } from "@castadi/shared/types";
import { toast } from "@/platform/toast";
import { Button, Card, Screen, Skeleton, StatusView, Text } from "@/ui";
import { ScreenForm } from "./ScreenForm";

export function EditScreenScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const screen = useMyScreenQuery(id ?? "");
  const categories = useCategoriesQuery();
  const update = useUpdateScreenMutation();

  if (screen.data && !EDITABLE_SCREEN_STATUSES.includes(screen.data.verificationStatus)) {
    return (
      <StatusView title="Can't edit right now" message="This screen is under review. You can edit it again once it's been decided.">
        <Button title="Go back" variant="secondary" onPress={() => router.back()} />
      </StatusView>
    );
  }

  const onSubmit = async (values: ScreenFormOutput) => {
    if (!screen.data) return;
    try {
      await update.mutateAsync({ screenId: screen.data.id, values });
      toast.success("Screen details saved");
      router.back();
    } catch {
      // The API client already surfaced the error.
    }
  };

  return (
    <Screen edges={["bottom"]} contentStyle={styles.content}>
      {screen.data?.verificationStatus === "ACTIVE" ? (
        <Card>
          <Text variant="label" weight="semibold">
            Some changes need re-approval
          </Text>
          <Text variant="caption" tone="muted">
            Changing the address, GPS location, category, size, resolution, OS or device serial number sends this screen back for
            review. Other changes apply straight away.
          </Text>
        </Card>
      ) : null}
      {screen.data && categories.data ? (
        <ScreenForm
          categories={categories.data}
          screen={screen.data}
          submitLabel="Save changes"
          isSubmitting={update.isPending}
          onSubmit={onSubmit}
        />
      ) : (
        <Skeleton height={520} radius={radii.lg} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(4), paddingBottom: spacing(10) },
});
