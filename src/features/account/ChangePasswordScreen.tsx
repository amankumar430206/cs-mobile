import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useChangePasswordMutation } from "@castadi/shared/hooks";
import { changePasswordSchema, type ChangePasswordFormValues } from "@castadi/shared/schemas";
import { toast } from "@/platform/toast";
import { Button, Screen, TextField } from "@/ui";

export function ChangePasswordScreen() {
  const changePassword = useChangePasswordMutation();
  const { control, handleSubmit } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast.success("Password updated");
      router.back();
    } catch {
      // The API client already surfaced the error.
    }
  });

  return (
    <Screen edges={["bottom"]}>
      <TextField
        control={control}
        name="currentPassword"
        label="Current password"
        secure
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
      />
      <TextField
        control={control}
        name="newPassword"
        label="New password"
        hint="At least 8 characters with upper and lower case letters, a number and a symbol"
        secure
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        control={control}
        name="confirmNewPassword"
        label="Confirm new password"
        secure
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      <Button title="Update password" onPress={onSubmit} loading={changePassword.isPending} />
    </Screen>
  );
}
