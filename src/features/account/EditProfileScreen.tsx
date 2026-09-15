import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMeQuery, useUpdateProfileMutation } from "@castadi/shared/hooks";
import { updateProfileSchema, type UpdateProfileFormValues } from "@castadi/shared/schemas";
import { toast } from "@/platform/toast";
import { Button, Card, DetailRow, Screen, Text, TextField } from "@/ui";

export function EditProfileScreen() {
  const { data: user } = useMeQuery();
  const updateProfile = useUpdateProfileMutation();
  const { control, handleSubmit } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: user?.full_name ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({ fullName: values.fullName.trim() });
      toast.success("Profile updated");
      router.back();
    } catch {
      // The API client already surfaced the error.
    }
  });

  return (
    <Screen edges={["bottom"]}>
      <TextField control={control} name="fullName" label="Full name" autoComplete="name" textContentType="name" returnKeyType="done" onSubmitEditing={onSubmit} />

      <Card>
        <DetailRow label="Mobile" value={user?.mobile_number} />
        <DetailRow label="Email" value={user?.email} />
        <Text variant="caption" tone="muted">
          Your mobile number and email are your login identifiers. Change them from the CASTADI web dashboard.
        </Text>
      </Card>

      <Button title="Save changes" onPress={onSubmit} loading={updateProfile.isPending} />
    </Screen>
  );
}
